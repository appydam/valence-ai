import { query, internalQuery, mutation, internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const agentNameValidator = v.union(
  v.literal("Kaze"),
  v.literal("Scout"),
  v.literal("Forge"),
  v.literal("Ghost")
);

type AgentName = "Kaze" | "Scout" | "Forge" | "Ghost";

// ── Queries ────────────────────────────────────────────────────

/** List soul file versions for an agent, newest first. */
export const listVersions = query({
  args: {
    agentName: agentNameValidator,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("soulFileVersions")
      .withIndex("by_agent_version", (q) => q.eq("agentName", args.agentName))
      .order("desc")
      .take(args.limit ?? 20);
  },
});

/** Get the most recent approved/auto_applied soul version for an agent. */
export const getActiveVersion = query({
  args: { agentName: agentNameValidator },
  handler: async (ctx, args) => {
    const approved = await ctx.db
      .query("soulFileVersions")
      .withIndex("by_agent_status", (q) =>
        q.eq("agentName", args.agentName).eq("status", "approved")
      )
      .order("desc")
      .first();

    if (approved) return approved;

    return await ctx.db
      .query("soulFileVersions")
      .withIndex("by_agent_status", (q) =>
        q.eq("agentName", args.agentName).eq("status", "auto_applied")
      )
      .order("desc")
      .first();
  },
});

/** Get a specific version by ID. */
export const getVersion = query({
  args: { id: v.id("soulFileVersions") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

/** List pending review versions (for admin UI). */
export const listPendingReview = query({
  args: {},
  handler: async (ctx) => {
    const agents: AgentName[] = ["Kaze", "Scout", "Forge", "Ghost"];
    const pending = [];
    for (const agentName of agents) {
      const versions = await ctx.db
        .query("soulFileVersions")
        .withIndex("by_agent_status", (q) =>
          q.eq("agentName", agentName).eq("status", "pending_review")
        )
        .collect();
      pending.push(...versions);
    }
    return pending.sort((a, b) => b.distilledAt - a.distilledAt);
  },
});

// ── Internal Mutations ─────────────────────────────────────────

/** Create a soul file version record (called from distillAgent action). */
export const saveVersion = internalMutation({
  args: {
    agentName: agentNameValidator,
    content: v.string(),
    version: v.number(),
    changeLog: v.string(),
    memoriesDistilled: v.array(v.id("agentMemory")),
    distilledBy: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("soulFileVersions", {
      agentName: args.agentName,
      content: args.content,
      version: args.version,
      changeLog: args.changeLog,
      memoriesDistilled: args.memoriesDistilled,
      status: "pending_review",
      distilledAt: Date.now(),
      distilledBy: args.distilledBy,
    });
  },
});

/** Update distillation job status. */
export const updateJobStatus = internalMutation({
  args: {
    jobId: v.id("memoryDistillationJobs"),
    status: v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    soulVersionId: v.optional(v.id("soulFileVersions")),
    changeCount: v.optional(v.number()),
    error: v.optional(v.string()),
    memoriesAnalyzed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = { status: args.status };
    if (args.status === "completed" || args.status === "failed") {
      updates.completedAt = Date.now();
    }
    if (args.soulVersionId !== undefined) updates.soulVersionId = args.soulVersionId;
    if (args.changeCount !== undefined) updates.changeCount = args.changeCount;
    if (args.error !== undefined) updates.error = args.error;
    if (args.memoriesAnalyzed !== undefined) updates.memoriesAnalyzed = args.memoriesAnalyzed;
    await ctx.db.patch(args.jobId, updates);
  },
});

// ── Exposed Mutations ──────────────────────────────────────────

/** Human approves or rejects a soul version (called via HTTP). */
export const reviewVersion = mutation({
  args: {
    id: v.id("soulFileVersions"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    reviewedBy: v.string(),
    reviewNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const version = await ctx.db.get(args.id);
    if (!version) throw new Error("Soul version not found");
    if (version.status !== "pending_review") {
      throw new Error(`Version is already ${version.status}`);
    }

    await ctx.db.patch(args.id, {
      status: args.decision,
      reviewedBy: args.reviewedBy,
      reviewedAt: Date.now(),
      reviewNote: args.reviewNote,
    });

    // On approval: update the live soulFiles table → triggers SSH sync on next deploy
    if (args.decision === "approved") {
      const existing = await ctx.db
        .query("soulFiles")
        .withIndex("by_agent", (q) => q.eq("agentName", version.agentName))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          content: version.content,
          updatedAt: Date.now(),
          syncedToServer: false,
        });
      } else {
        await ctx.db.insert("soulFiles", {
          agentName: version.agentName,
          content: version.content,
          updatedAt: Date.now(),
          syncedToServer: false,
        });
      }
    }

    return { ok: true };
  },
});

// ── Actions ────────────────────────────────────────────────────

/** Distill high-value memories into an updated SOUL file for one agent. */
export const distillAgent = internalAction({
  args: {
    agentName: agentNameValidator,
    triggeredBy: v.string(),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; versionId?: string; error?: string }> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "ANTHROPIC_API_KEY not set" };
    }

    // Create job record
    const jobId = await ctx.runMutation(internal.soulDistillation.createJob, {
      agentName: args.agentName,
      triggeredBy: args.triggeredBy,
    });

    try {
      await ctx.runMutation(internal.soulDistillation.updateJobStatus, {
        jobId,
        status: "running",
      });

      // Fetch current SOUL content + top memories in parallel
      const [currentSoul, memories, latestVersion] = await Promise.all([
        ctx.runQuery(api.soulFiles.get, { agentName: args.agentName }),
        ctx.runQuery(api.agentMemory.listForAgent, {
          agentName: args.agentName,
          includeSquadWide: false,
          limit: 50,
        }),
        ctx.runQuery(internal.soulDistillation.getLatestVersionNumber, {
          agentName: args.agentName,
        }),
      ]);

      if (!currentSoul?.content) {
        throw new Error("No SOUL file found for agent. Sync from server first.");
      }

      // Filter to high-value memories worth distilling (importance >= 0.5 OR humanEndorsed)
      const valuableMemories = memories.filter(
        (m: any) => m.importanceScore >= 0.5 || m.humanEndorsed
      );

      if (valuableMemories.length === 0) {
        await ctx.runMutation(internal.soulDistillation.updateJobStatus, {
          jobId,
          status: "completed",
          memoriesAnalyzed: 0,
          changeCount: 0,
        });
        return { ok: true };
      }

      // Format memories for Claude
      const memorySummary = valuableMemories
        .map((m: any) => {
          const endorsedTag = m.humanEndorsed ? " [HUMAN ENDORSED]" : "";
          const squadTag = m.relatedAgents.length === 4 ? " [SQUAD-WIDE]" : "";
          return `## [${m.memoryType.toUpperCase()}]${endorsedTag}${squadTag} ${m.title}\n${m.body}${m.evidence ? `\nEvidence: ${m.evidence}` : ""}`;
        })
        .join("\n\n");

      const prompt = `You are distilling agent memories into an updated SOUL file for ${args.agentName}.

CURRENT SOUL FILE:
\`\`\`
${currentSoul.content}
\`\`\`

NEW MEMORIES TO INTEGRATE (${valuableMemories.length} high-value memories):
${memorySummary}

TASK:
1. Read the current SOUL file carefully
2. Review each memory to understand what ${args.agentName} has learned
3. Update the SOUL file to permanently bake in the most important learnings
4. Preserve the existing personality, tone, and core directives
5. Add or update sections for: API quirks, workflow patterns, user preferences, known failures
6. Keep the file concise — integrate learnings naturally into existing sections rather than appending raw memory dumps
7. Do NOT add a "Memory Distillation" section or date stamps — integrate learnings organically

Return ONLY the updated SOUL file content. No explanation, no markdown code blocks, just the raw file content.`;

      // Call Claude
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 8192,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Claude API error ${response.status}: ${err}`);
      }

      const claudeResult = await response.json();
      const newContent: string = claudeResult.content?.[0]?.text ?? "";

      if (!newContent || newContent.length < 100) {
        throw new Error("Claude returned empty or too-short SOUL content");
      }

      // Detect changes
      const changeCount = newContent === currentSoul.content ? 0 : 1;
      const newVersion = (latestVersion ?? 0) + 1;

      // Generate change log via second Claude call (cheap)
      let changeLog = "Automated distillation of recent agent memories.";
      try {
        const changeLogRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 256,
            messages: [
              {
                role: "user",
                content: `Summarize in 2-3 bullet points what changed between these two SOUL files for ${args.agentName}:\n\nOLD:\n${currentSoul.content.slice(0, 2000)}\n\nNEW:\n${newContent.slice(0, 2000)}\n\nReturn only bullet points, no preamble.`,
              },
            ],
          }),
        });
        if (changeLogRes.ok) {
          const clRes = await changeLogRes.json();
          changeLog = clRes.content?.[0]?.text ?? changeLog;
        }
      } catch {
        // Non-fatal — use default changelog
      }

      // Save the version
      const versionId = await ctx.runMutation(internal.soulDistillation.saveVersion, {
        agentName: args.agentName,
        content: newContent,
        version: newVersion,
        changeLog,
        memoriesDistilled: valuableMemories.map((m: any) => m._id),
        distilledBy: "claude-sonnet-4-6",
      });

      await ctx.runMutation(internal.soulDistillation.updateJobStatus, {
        jobId,
        status: "completed",
        soulVersionId: versionId,
        changeCount,
        memoriesAnalyzed: valuableMemories.length,
      });

      return { ok: true, versionId };
    } catch (err: any) {
      await ctx.runMutation(internal.soulDistillation.updateJobStatus, {
        jobId,
        status: "failed",
        error: err.message,
      });
      return { ok: false, error: err.message };
    }
  },
});

/** Distill all 4 agents — called by weekly cron. */
export const distillAllAgents = internalAction({
  args: {},
  handler: async (ctx) => {
    const agents: AgentName[] = ["Kaze", "Scout", "Forge", "Ghost"];
    const results = [];
    for (const agentName of agents) {
      const result = await ctx.runAction(internal.soulDistillation.distillAgent, {
        agentName,
        triggeredBy: "weekly-cron",
      });
      results.push({ agentName, ...result });
    }
    console.log("[SoulDistillation] Weekly distillation complete:", results);
    return results;
  },
});

/** Create a distillation job record. */
export const createJob = internalMutation({
  args: {
    agentName: agentNameValidator,
    triggeredBy: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("memoryDistillationJobs", {
      agentName: args.agentName,
      status: "pending",
      memoriesAnalyzed: 0,
      sourceMemoryIds: [],
      triggeredBy: args.triggeredBy,
      startedAt: Date.now(),
    });
  },
});

/** Get the highest version number for an agent (internal query). */
export const getLatestVersionNumber = internalQuery({
  args: { agentName: agentNameValidator },
  handler: async (ctx, args) => {
    const latest = await ctx.db
      .query("soulFileVersions")
      .withIndex("by_agent_version", (q) => q.eq("agentName", args.agentName))
      .order("desc")
      .first();
    return latest?.version ?? 0;
  },
});
