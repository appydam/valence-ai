import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const agentNameValidator = v.union(
  v.literal("Kaze"),
  v.literal("Scout"),
  v.literal("Forge"),
  v.literal("Ghost"),
  v.literal("Sentinel")
);

const memoryTypeValidator = v.union(
  v.literal("api_quirk"),
  v.literal("user_preference"),
  v.literal("pattern"),
  v.literal("decision"),
  v.literal("env_fact"),
  v.literal("workflow"),
  v.literal("failure"),
  v.literal("shortcut")
);

// ── Relevance score for heartbeat surfacing ──────────────────
function relevanceScore(m: {
  importanceScore: number;
  createdAt: number;
  humanEndorsed: boolean;
  confirmations: number;
  contradictions: number;
}): number {
  const recencyBoost = Math.max(
    0,
    1 - (Date.now() - m.createdAt) / (90 * 24 * 60 * 60 * 1000)
  );
  return (
    m.importanceScore * 0.5 +
    recencyBoost * 0.2 +
    (m.humanEndorsed ? 0.3 : 0) +
    Math.min(0.2, m.confirmations * 0.05) -
    Math.min(0.3, m.contradictions * 0.1)
  );
}

// ── Task-Context Boost ──────────────────────────────────────

/** Boost memories whose tags/title/body match current task keywords or integrations. */
function taskContextBoost(
  memory: { tags: string[]; title: string; body: string },
  keywords: string[],
  integrations: string[]
): number {
  let boost = 0;
  const text = `${memory.title} ${memory.body} ${memory.tags.join(" ")}`.toLowerCase();

  // Integration match (strongest signal — agent is using the same API)
  for (const integration of integrations) {
    if (memory.tags.includes(integration) || text.includes(integration.toLowerCase())) {
      boost += 0.4;
      break;
    }
  }

  // Keyword match (moderate signal — topic overlap)
  let keywordHits = 0;
  for (const kw of keywords) {
    if (kw.length > 3 && text.includes(kw.toLowerCase())) keywordHits++;
  }
  boost += Math.min(0.3, keywordHits * 0.1);

  return boost;
}

// ── Queries ──────────────────────────────────────────────────

/** Recent memories across all agents (for Live Ops Feed) */
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agentMemory")
      .withIndex("by_created")
      .order("desc")
      .take(args.limit ?? 20);
  },
});

/** List active memories for an agent, sorted by composite relevance. Used by heartbeat. */
export const listForAgent = query({
  args: {
    agentName: agentNameValidator,
    memoryType: v.optional(memoryTypeValidator),
    limit: v.optional(v.number()),
    includeSquadWide: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query("agentMemory")
      .withIndex("by_agent_status", (q) =>
        q.eq("agentName", args.agentName).eq("status", "active")
      )
      .collect();

    if (args.memoryType) {
      results = results.filter((m) => m.memoryType === args.memoryType);
    }

    // Squad-wide memories come from the agentMemory table with relatedAgents containing this agent
    // They may be authored by a different agent but apply to all
    if (args.includeSquadWide) {
      const squadWide = await ctx.db
        .query("agentMemory")
        .withIndex("by_agent_status", (q) =>
          q.eq("agentName", "Kaze").eq("status", "active")
        )
        .filter((q) =>
          q.neq(q.field("agentName"), args.agentName)
        )
        .collect();
      // Only include memories that list this agent in relatedAgents
      const relevant = squadWide.filter((m) =>
        m.relatedAgents.includes(args.agentName) &&
        m.relatedAgents.length === 4
      );
      results = [...results, ...relevant];
    }

    // Deduplicate by _id
    const seen = new Set<string>();
    results = results.filter((m) => {
      if (seen.has(m._id)) return false;
      seen.add(m._id);
      return true;
    });

    // Sort by composite relevance
    results.sort((a, b) => relevanceScore(b) - relevanceScore(a));

    return args.limit ? results.slice(0, args.limit) : results;
  },
});

/** List active memories with task-aware boosting. Used by heartbeat when agent has active tasks. */
export const listForAgentWithTaskContext = query({
  args: {
    agentName: agentNameValidator,
    taskKeywords: v.array(v.string()),
    taskIntegrations: v.array(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Fetch agent's active memories
    let results = await ctx.db
      .query("agentMemory")
      .withIndex("by_agent_status", (q) =>
        q.eq("agentName", args.agentName).eq("status", "active")
      )
      .collect();

    // Include squad-wide memories (same logic as listForAgent)
    const squadWide = await ctx.db
      .query("agentMemory")
      .withIndex("by_agent_status", (q) =>
        q.eq("agentName", "Kaze").eq("status", "active")
      )
      .filter((q) =>
        q.neq(q.field("agentName"), args.agentName)
      )
      .collect();
    const relevant = squadWide.filter((m) =>
      m.relatedAgents.includes(args.agentName) &&
      m.relatedAgents.length === 4
    );
    results = [...results, ...relevant];

    // Deduplicate by _id
    const seen = new Set<string>();
    results = results.filter((m) => {
      if (seen.has(m._id)) return false;
      seen.add(m._id);
      return true;
    });

    // Sort by composite relevance + task-context boost
    results.sort((a, b) => {
      const scoreA = relevanceScore(a) + taskContextBoost(a, args.taskKeywords, args.taskIntegrations);
      const scoreB = relevanceScore(b) + taskContextBoost(b, args.taskKeywords, args.taskIntegrations);
      return scoreB - scoreA;
    });

    return results.slice(0, args.limit ?? 10);
  },
});

/** List all memories for the frontend UI — filtering by agent, type, status. */
export const listAll = query({
  args: {
    agentName: v.optional(agentNameValidator),
    memoryType: v.optional(memoryTypeValidator),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("superseded"),
        v.literal("archived"),
        v.literal("flagged")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query("agentMemory")
      .withIndex("by_created")
      .order("desc")
      .collect();

    if (args.agentName) results = results.filter((m) => m.agentName === args.agentName);
    if (args.memoryType) results = results.filter((m) => m.memoryType === args.memoryType);
    if (args.status) results = results.filter((m) => m.status === args.status);

    return args.limit ? results.slice(0, args.limit) : results;
  },
});

/** Stats for MemoryBank dashboard. */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("agentMemory").collect();
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    return {
      totalActive: all.filter((m) => m.status === "active").length,
      pendingEndorsement: all.filter(
        (m) => m.status === "active" && !m.humanEndorsed && m.importanceScore >= 0.6
      ).length,
      writtenThisWeek: all.filter((m) => m.createdAt >= oneWeekAgo).length,
      byAgent: {
        Kaze: all.filter((m) => m.agentName === "Kaze" && m.status === "active").length,
        Scout: all.filter((m) => m.agentName === "Scout" && m.status === "active").length,
        Forge: all.filter((m) => m.agentName === "Forge" && m.status === "active").length,
        Ghost: all.filter((m) => m.agentName === "Ghost" && m.status === "active").length,
      },
    };
  },
});

export const getById = query({
  args: { id: v.id("agentMemory") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

// ── Mutations ────────────────────────────────────────────────

/** Agents write new memories. Called via POST /api/agents/memory. */
export const write = mutation({
  args: {
    agentName: agentNameValidator,
    memoryType: memoryTypeValidator,
    title: v.string(),
    body: v.string(),
    evidence: v.optional(v.string()),
    tags: v.array(v.string()),
    taskId: v.optional(v.string()),
    importanceScore: v.number(),
    isSquadWide: v.optional(v.boolean()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const relatedAgents: ("Kaze" | "Scout" | "Forge" | "Ghost" | "Sentinel")[] = args.isSquadWide
      ? ["Kaze", "Scout", "Forge", "Ghost", "Sentinel"]
      : [args.agentName];

    const id = await ctx.db.insert("agentMemory", {
      agentName: args.agentName,
      memoryType: args.memoryType,
      title: args.title.slice(0, 200),
      body: args.body,
      evidence: args.evidence,
      tags: args.tags,
      taskId: args.taskId,
      relatedAgents,
      importanceScore: Math.min(1.0, Math.max(0.0, args.importanceScore)),
      confirmations: 0,
      contradictions: 0,
      useCount: 0,
      humanEndorsed: false,
      humanFlagged: false,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...(args.expiresAt ? { expiresAt: args.expiresAt } : {}),
    });
    return id;
  },
});

/** Agent confirms an existing memory is still true. */
export const confirm = mutation({
  args: { id: v.id("agentMemory"), agentName: agentNameValidator },
  handler: async (ctx, args) => {
    const mem = await ctx.db.get(args.id);
    if (!mem) throw new Error("Memory not found");
    await ctx.db.patch(args.id, {
      confirmations: mem.confirmations + 1,
      updatedAt: Date.now(),
    });
  },
});

/** Agent contradicts an existing memory; optionally provides a correction. */
export const contradict = mutation({
  args: {
    id: v.id("agentMemory"),
    agentName: agentNameValidator,
    newBody: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const mem = await ctx.db.get(args.id);
    if (!mem) throw new Error("Memory not found");

    await ctx.db.patch(args.id, {
      contradictions: mem.contradictions + 1,
      updatedAt: Date.now(),
    });

    if (args.newBody) {
      const newId = await ctx.db.insert("agentMemory", {
        agentName: args.agentName,
        memoryType: mem.memoryType,
        title: mem.title.startsWith("[UPDATED]") ? mem.title : `[UPDATED] ${mem.title}`,
        body: args.newBody,
        tags: mem.tags,
        relatedAgents: mem.relatedAgents,
        importanceScore: mem.importanceScore,
        confirmations: 0,
        contradictions: 0,
        useCount: 0,
        humanEndorsed: false,
        humanFlagged: false,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      await ctx.db.patch(args.id, {
        status: "superseded",
        supersededBy: newId,
        updatedAt: Date.now(),
      });
      return { newMemoryId: newId };
    }
    return {};
  },
});

/** Internal — increment use counts for memories surfaced in heartbeat. */
export const incrementUseCount = internalMutation({
  args: { ids: v.array(v.id("agentMemory")) },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const id of args.ids) {
      const mem = await ctx.db.get(id);
      if (mem) {
        await ctx.db.patch(id, {
          useCount: mem.useCount + 1,
          lastSurfacedAt: now,
        });
      }
    }
  },
});

/** Human endorses a memory — bumps importance to 1.0. */
export const endorse = mutation({
  args: { id: v.id("agentMemory"), userId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      humanEndorsed: true,
      humanFlagged: false,
      endorsedBy: args.userId,
      endorsedAt: Date.now(),
      importanceScore: 1.0,
      status: "active",
      updatedAt: Date.now(),
    });
  },
});

/** Human flags a memory as wrong. */
export const flagMemory = mutation({
  args: { id: v.id("agentMemory"), userId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      humanFlagged: true,
      status: "flagged",
      updatedAt: Date.now(),
    });
  },
});

/** Human manually edits a memory. */
export const editMemory = mutation({
  args: {
    id: v.id("agentMemory"),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    importanceScore: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.body !== undefined) updates.body = args.body;
    if (args.importanceScore !== undefined)
      updates.importanceScore = Math.min(1.0, Math.max(0.0, args.importanceScore));
    if (args.tags !== undefined) updates.tags = args.tags;
    await ctx.db.patch(args.id, updates);
  },
});

/** Nightly cron: archive expired and stale low-value memories. */
export const archiveStale = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const active = await ctx.db
      .query("agentMemory")
      .withIndex("by_agent_status")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    let archived = 0;
    for (const mem of active) {
      if (mem.humanEndorsed) continue; // Never archive endorsed memories

      if (mem.expiresAt && mem.expiresAt < now) {
        await ctx.db.patch(mem._id, { status: "archived", updatedAt: now });
        archived++;
        continue;
      }

      if (mem.humanFlagged) {
        await ctx.db.patch(mem._id, { status: "archived", updatedAt: now });
        archived++;
        continue;
      }

      if (
        mem.createdAt < thirtyDaysAgo &&
        mem.useCount === 0 &&
        mem.importanceScore < 0.3
      ) {
        await ctx.db.patch(mem._id, { status: "archived", updatedAt: now });
        archived++;
      }
    }

    return { archived };
  },
});
