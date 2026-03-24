// Dynamic agent system — agents are user-defined, seeded with 5 defaults
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const AGENT_DEFAULTS = [
  { name: "Kaze", emoji: "🌀", role: "Chief of Staff", description: "Coordinates the squad, delegates tasks, ensures alignment", color: "kaze", slug: "kaze", isOrchestrator: true, isReviewer: false, canBeThrottled: true, sortOrder: 0 },
  { name: "Scout", emoji: "🔭", role: "Market Intelligence", description: "Researches trends, finds opportunities, competitive analysis", color: "scout", slug: "scout", isOrchestrator: false, isReviewer: false, canBeThrottled: true, sortOrder: 1 },
  { name: "Forge", emoji: "🔨", role: "Engineer", description: "Writes code, prototypes, builds automations", color: "forge", slug: "forge", isOrchestrator: false, isReviewer: false, canBeThrottled: true, sortOrder: 2 },
  { name: "Ghost", emoji: "👻", role: "Content & Distribution", description: "Drafts tweets, LinkedIn posts, blog content", color: "ghost", slug: "ghost", isOrchestrator: false, isReviewer: false, canBeThrottled: true, sortOrder: 3 },
  { name: "Sentinel", emoji: "🔍", role: "Quality Reviewer", description: "Reviews every deliverable, enforces quality standards, approves or rejects work", color: "sentinel", slug: "sentinel", isOrchestrator: false, isReviewer: true, canBeThrottled: false, sortOrder: 4 },
];

// ─── Queries ────────────────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    const dbAgents = await ctx.db.query("agents").collect();
    // Sort by sortOrder (fallback to creation time)
    return dbAgents.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  },
});

export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
  },
});

/**
 * List agents with true last-active timestamp.
 * Enriches each agent with MAX of: lastHeartbeat, last comment, last activity.
 */
export const listWithActivity = query({
  args: {},
  handler: async (ctx) => {
    const dbAgents = await ctx.db.query("agents").collect();

    // Latest comment per agent
    const allComments = await ctx.db.query("comments").order("desc").take(500);
    const lastCommentByAgent: Record<string, number> = {};
    for (const c of allComments) {
      if (!c.author || c.author === "System" || c.author === "Human") continue;
      if (!lastCommentByAgent[c.author] || c.createdAt > lastCommentByAgent[c.author]) {
        lastCommentByAgent[c.author] = c.createdAt;
      }
    }

    // Latest activity per agent
    const allActivity = await ctx.db.query("activity").order("desc").take(500);
    const lastActivityByAgent: Record<string, number> = {};
    for (const a of allActivity) {
      if (!a.agentName) continue;
      if (!lastActivityByAgent[a.agentName] || a.timestamp > lastActivityByAgent[a.agentName]) {
        lastActivityByAgent[a.agentName] = a.timestamp;
      }
    }

    return dbAgents
      .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
      .map((agent) => {
        const lastHeartbeat = agent.lastHeartbeat ?? 0;
        const lastComment = lastCommentByAgent[agent.name] ?? 0;
        const lastActivity = lastActivityByAgent[agent.name] ?? 0;
        const lastSeen = Math.max(lastHeartbeat, lastComment, lastActivity);
        return { ...agent, lastSeen, lastComment, lastActivity };
      });
  },
});

// ─── Internal queries (for backend role-based lookups) ──────────────────────

export const internalGetByName = internalQuery({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
  },
});

export const getOrchestratorAgent = internalQuery({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    return agents.find((a) => a.isOrchestrator === true) ?? null;
  },
});

export const getReviewerAgents = internalQuery({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    return agents.filter((a) => a.isReviewer === true);
  },
});

export const getAllAgentNames = internalQuery({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    return agents.map((a) => a.name);
  },
});

// ─── Mutations ──────────────────────────────────────────────────────────────

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("agents").collect();
    const existingNames = new Set(existing.map((a) => a.name));

    for (const defaults of AGENT_DEFAULTS) {
      if (!existingNames.has(defaults.name)) {
        await ctx.db.insert("agents", {
          ...defaults,
          status: "offline",
          lastHeartbeat: 0,
          tasksCompleted: 0,
        });
      } else {
        // Backfill new fields on existing agents
        const agent = existing.find((a) => a.name === defaults.name);
        if (agent && agent.slug === undefined) {
          await ctx.db.patch(agent._id, {
            slug: defaults.slug,
            isOrchestrator: defaults.isOrchestrator,
            isReviewer: defaults.isReviewer,
            canBeThrottled: defaults.canBeThrottled,
            sortOrder: defaults.sortOrder,
          });
        }
      }
    }
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    emoji: v.string(),
    role: v.string(),
    description: v.string(),
    color: v.string(),
    slug: v.string(),
    isOrchestrator: v.optional(v.boolean()),
    isReviewer: v.optional(v.boolean()),
    canBeThrottled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check for duplicate name
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
    if (existing) throw new Error(`Agent "${args.name}" already exists`);

    // Determine sort order (append to end)
    const allAgents = await ctx.db.query("agents").collect();
    const maxOrder = Math.max(0, ...allAgents.map((a) => a.sortOrder ?? 0));

    return await ctx.db.insert("agents", {
      name: args.name,
      emoji: args.emoji,
      role: args.role,
      description: args.description,
      color: args.color,
      slug: args.slug,
      isOrchestrator: args.isOrchestrator ?? false,
      isReviewer: args.isReviewer ?? false,
      canBeThrottled: args.canBeThrottled ?? true,
      sortOrder: maxOrder + 1,
      status: "offline",
      lastHeartbeat: 0,
      tasksCompleted: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("agents"),
    name: v.optional(v.string()),
    emoji: v.optional(v.string()),
    role: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    slug: v.optional(v.string()),
    isOrchestrator: v.optional(v.boolean()),
    isReviewer: v.optional(v.boolean()),
    canBeThrottled: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const agent = await ctx.db.get(id);
    if (!agent) throw new Error("Agent not found");

    // Filter out undefined values
    const patch: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) patch[key] = value;
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(id, patch);
    }
  },
});

export const remove = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.id);
    if (!agent) throw new Error("Agent not found");
    await ctx.db.delete(args.id);
  },
});

// ─── Stale agent auto-reset (cron) ─────────────────────────────────────────

/**
 * Stale agent auto-reset.
 * Runs every 5 minutes via cron.
 * Resets agents whose heartbeat is >10min old to "offline".
 */
export const resetStaleAgents = internalMutation({
  args: {},
  handler: async (ctx) => {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const now = Date.now();

    const agents = await ctx.db.query("agents").collect();
    let resetCount = 0;

    for (const agent of agents) {
      if (agent.status === "offline") continue;
      if (agent.lastHeartbeat > tenMinutesAgo) continue;

      await ctx.db.patch(agent._id, { status: "offline" });

      await ctx.db.insert("activity", {
        timestamp: now,
        agentName: agent.name,
        action: "auto_offline",
        details: `Heartbeat stale for ${Math.round((now - agent.lastHeartbeat) / 60000)} min — status auto-reset to offline`,
      });

      // If agent had in_progress tasks, reset to assigned so sweep re-wakes them
      const inProgressTasks = await ctx.db
        .query("tasks")
        .withIndex("by_assignee_status", (q) =>
          q.eq("assignee", agent.name).eq("status", "in_progress")
        )
        .collect();

      for (const task of inProgressTasks) {
        await ctx.db.patch(task._id, { status: "assigned", updatedAt: now });
        await ctx.db.insert("comments", {
          taskId: task._id,
          author: "System",
          content: `⚠️ **Agent session lost** — ${agent.name}'s heartbeat went stale. Task reset to \`assigned\` and will be automatically re-picked up.`,
          createdAt: now,
          mentions: [],
        });
      }

      resetCount++;
      console.log(`[StaleAgentReset] ${agent.name} reset to offline (HB was ${Math.round((now - agent.lastHeartbeat) / 60000)}min ago, ${inProgressTasks.length} tasks re-queued)`);
    }

    return { resetCount };
  },
});

/**
 * Count agents genuinely active right now.
 * Active = status "working" AND heartbeat within last 2 minutes.
 * Used by triggerWakeup concurrency cap.
 */
export const countActiveAgents = internalQuery({
  args: {},
  handler: async (ctx) => {
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    const agents = await ctx.db.query("agents").collect();
    const activeAgents = agents.filter(
      (a) => a.status === "working" && a.lastHeartbeat > twoMinutesAgo
    );
    return {
      count: activeAgents.length,
      activeNames: activeAgents.map((a) => a.name),
    };
  },
});
