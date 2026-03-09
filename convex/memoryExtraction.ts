import { internalAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

/**
 * Automatic Post-Task Memory Extraction
 *
 * When a task completes or gets rejected, this action:
 * 1. Loads the task data (deliverables, comments, rejection reasons)
 * 2. Loads integration activity for that task
 * 3. Loads existing memories for this agent (dedup + build-on-knowledge)
 * 4. Calls Claude Haiku to extract 0-5 structured memories
 * 5. Deduplicates against existing memories before writing
 * 6. Writes each memory via the existing agentMemory.write mutation
 *
 * This runs async (fire-and-forget via scheduler) so it never blocks task completion.
 */

/** Fetch task + comments + integration activity for extraction. */
export const getTaskContext = internalQuery({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) return null;

    // Get comments for this task (last 10)
    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("taskId"), args.taskId))
      .order("desc")
      .take(10);

    // Get integration activity for this task
    const integrationCalls = await ctx.db
      .query("integrationActivity")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId as unknown as string))
      .collect();

    return { task, comments, integrationCalls };
  },
});

/** Fetch existing active memories for an agent — used to avoid duplicates and provide context. */
export const getExistingMemories = internalQuery({
  args: { agentName: v.string() },
  handler: async (ctx, args) => {
    const memories = await ctx.db
      .query("agentMemory")
      .filter((q) =>
        q.and(
          q.eq(q.field("agentName"), args.agentName),
          q.eq(q.field("status"), "active")
        )
      )
      .order("desc")
      .take(30);

    return memories.map((m) => ({
      id: m._id,
      title: m.title,
      body: m.body.slice(0, 100),
      memoryType: m.memoryType,
      tags: m.tags,
    }));
  },
});

/** Simple similarity check — returns true if two memories are likely duplicates. */
function isSimilar(
  existing: { title: string; body: string; tags: string[] },
  candidate: { title: string; body: string; tags: string[] }
): boolean {
  // Exact title match
  if (existing.title.toLowerCase() === candidate.title.toLowerCase()) return true;

  // Check for high word overlap between titles
  const existingWords = new Set(existing.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  const candidateWords = candidate.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  if (existingWords.size > 0 && candidateWords.length > 0) {
    const overlap = candidateWords.filter((w) => existingWords.has(w)).length;
    const overlapRatio = overlap / Math.max(existingWords.size, candidateWords.length);
    if (overlapRatio >= 0.7) return true;
  }

  // Check for high tag overlap (same integration + same tool = likely same quirk)
  const existingTags = new Set(existing.tags.filter((t) => t !== "auto-extracted" && t !== "auto-learned"));
  const candidateTags = candidate.tags.filter((t) => t !== "auto-extracted" && t !== "auto-learned");
  if (existingTags.size >= 2 && candidateTags.length >= 2) {
    const tagOverlap = candidateTags.filter((t) => existingTags.has(t)).length;
    if (tagOverlap >= 2 && tagOverlap / Math.max(existingTags.size, candidateTags.length) >= 0.8) {
      return true;
    }
  }

  return false;
}

/** Main extraction action — called by scheduler after task completion/rejection. */
export const extractFromTask = internalAction({
  args: {
    taskId: v.id("tasks"),
    agentName: v.string(),
    trigger: v.union(v.literal("task_completed"), v.literal("task_rejected")),
  },
  handler: async (ctx, args) => {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.log("[MemoryExtraction] No AWS credentials, skipping");
      return;
    }

    // Load task context and existing memories in parallel
    const [context, existingMemories] = await Promise.all([
      ctx.runQuery(internal.memoryExtraction.getTaskContext, { taskId: args.taskId }),
      ctx.runQuery(internal.memoryExtraction.getExistingMemories, { agentName: args.agentName }),
    ]);

    if (!context || !context.task) {
      console.log("[MemoryExtraction] Task not found, skipping");
      return;
    }

    const { task, comments, integrationCalls } = context;

    // Skip tasks with nothing to learn from
    if (
      (!task.deliverables || task.deliverables.length === 0) &&
      comments.length === 0 &&
      !task.rejectionReason
    ) {
      console.log("[MemoryExtraction] Task has no deliverables/comments/rejections, skipping");
      return;
    }

    // Build prompt context
    const deliverableSummary = (task.deliverables || [])
      .map((d: { name: string; type: string; content: string }) =>
        `[${d.type}] ${d.name}: ${d.content.slice(0, 500)}`
      )
      .join("\n")
      .slice(0, 2000);

    const commentSummary = comments
      .reverse() // chronological order
      .slice(0, 5)
      .map((c: { author: string; content: string }) => `${c.author}: ${c.content.slice(0, 200)}`)
      .join("\n");

    const integrationSummary = integrationCalls.length > 0
      ? integrationCalls
          .map((ic: { integrationType: string; toolName: string; status: string; errorMessage?: string }) =>
            `${ic.integrationType}/${ic.toolName}: ${ic.status}${ic.errorMessage ? ` — ${ic.errorMessage}` : ""}`
          )
          .slice(0, 10)
          .join("\n")
      : "No integration calls";

    // Format existing memories so Haiku knows what's already known
    const existingMemorySummary = existingMemories.length > 0
      ? existingMemories
          .slice(0, 15)
          .map((m) => `- [${m.memoryType}] ${m.title}`)
          .join("\n")
      : "None yet";

    const prompt = `You are analyzing a ${args.trigger === "task_rejected" ? "rejected" : "completed"} task to extract reusable learnings for an AI agent team.

Task: ${task.title}
Description: ${(task.description || "").slice(0, 500)}
Agent: ${args.agentName}
Status: ${args.trigger === "task_rejected" ? "REJECTED" : "DONE"}${task.rejectionReason ? `\nRejection Reason: ${task.rejectionReason}` : ""}${task.iterationCount ? `\nIteration: ${task.iterationCount}/${task.maxIterations || 3}` : ""}

Deliverables:
${deliverableSummary || "None"}

Comments:
${commentSummary || "None"}

Integration Calls:
${integrationSummary}

EXISTING MEMORIES (already known — do NOT duplicate these):
${existingMemorySummary}

Extract 0-5 structured memories. ONLY extract genuinely NEW, reusable insights not already captured above:
- api_quirk: API-specific behaviors, rate limits, auth issues, format requirements
- user_preference: Formatting preferences, tone, specific requirements revealed by edits/rejections
- pattern: What approaches worked or didn't, effective workflows
- failure: Things that failed and their root causes (especially useful from rejections)
- workflow: Process improvements or shortcuts discovered
- decision: Important decisions made and their rationale
- shortcut: Faster ways to accomplish tasks

Do NOT extract:
- Anything already covered by existing memories listed above
- Task-specific facts with no future value (e.g., "wrote an email to John")
- Obvious things any agent would know
- Information that's just restating the task description

Return ONLY a JSON array. Return [] if nothing NEW is worth remembering.
Each memory object must have exactly these fields:
{
  "memoryType": "api_quirk" | "user_preference" | "pattern" | "failure" | "workflow" | "decision" | "shortcut",
  "title": "Short descriptive title (max 100 chars)",
  "body": "What was learned and why it matters (2-4 sentences)",
  "tags": ["keyword1", "keyword2"],
  "importanceScore": 0.3 to 0.8
}`;

    try {
      const text = (await ctx.runAction(internal.bedrockCall.invoke, {
        prompt,
        model: "us.anthropic.claude-haiku-4-5-20251001-v1:0",
        maxTokens: 1024,
      })) || "[]";

      // Parse JSON — handle possible markdown code blocks
      let memories: Array<{
        memoryType: string;
        title: string;
        body: string;
        tags: string[];
        importanceScore: number;
      }>;

      try {
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        memories = JSON.parse(cleaned);
      } catch {
        console.error("[MemoryExtraction] Failed to parse Claude response:", text.slice(0, 200));
        return;
      }

      if (!Array.isArray(memories) || memories.length === 0) {
        console.log("[MemoryExtraction] No memories extracted (Claude returned empty array)");
        return;
      }

      // Validate, deduplicate, and write each memory
      const validTypes = ["api_quirk", "user_preference", "pattern", "decision", "env_fact", "workflow", "failure", "shortcut"];
      let written = 0;
      let skippedDupes = 0;

      for (const mem of memories.slice(0, 5)) {
        if (!validTypes.includes(mem.memoryType)) continue;
        if (!mem.title || !mem.body) continue;

        // Check against existing memories for duplicates
        const isDuplicate = existingMemories.some((existing) =>
          isSimilar(existing, { title: mem.title, body: mem.body, tags: mem.tags || [] })
        );

        if (isDuplicate) {
          skippedDupes++;
          continue;
        }

        try {
          await ctx.runMutation(api.agentMemory.write, {
            agentName: args.agentName as any,
            memoryType: mem.memoryType as any,
            title: mem.title.slice(0, 200),
            body: mem.body,
            evidence: `Auto-extracted from task: ${task.title} (${args.trigger})`,
            tags: [...(mem.tags || []).slice(0, 5), "auto-extracted"],
            taskId: args.taskId as unknown as string,
            importanceScore: Math.min(0.8, Math.max(0.2, mem.importanceScore || 0.5)),
          });
          written++;
        } catch (writeErr: any) {
          console.error(`[MemoryExtraction] Failed to write memory: ${writeErr.message}`);
        }
      }

      console.log(
        `[MemoryExtraction] Task "${task.title}" (${args.trigger}): extracted ${written}, skipped ${skippedDupes} dupes`
      );
    } catch (err: any) {
      console.error(`[MemoryExtraction] Error: ${err.message}`);
    }
  },
});
