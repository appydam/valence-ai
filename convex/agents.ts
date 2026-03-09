// v2 - includes Sentinel agent
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const AGENT_DEFAULTS: {
  name: "Kaze" | "Scout" | "Forge" | "Ghost" | "Sentinel";
  emoji: string;
  role: string;
  description: string;
  color: string;
}[] = [
  { name: "Kaze", emoji: "🌀", role: "Chief of Staff", description: "Coordinates the squad, delegates tasks, ensures alignment", color: "kaze" },
  { name: "Scout", emoji: "🔭", role: "Market Intelligence", description: "Researches trends, finds opportunities, competitive analysis", color: "scout" },
  { name: "Forge", emoji: "🔨", role: "Engineer", description: "Writes code, prototypes, builds automations", color: "forge" },
  { name: "Ghost", emoji: "👻", role: "Content & Distribution", description: "Drafts tweets, LinkedIn posts, blog content", color: "ghost" },
  { name: "Sentinel", emoji: "🔍", role: "Quality Reviewer", description: "Reviews every deliverable, enforces quality standards, approves or rejects work", color: "sentinel" },
];

export const list = query({
  args: {},
  handler: async (ctx) => {
    const dbAgents = await ctx.db.query("agents").collect();
    // Always return all 4 agents — fill in defaults for missing ones
    return AGENT_DEFAULTS.map((defaults) => {
      const existing = dbAgents.find((a) => a.name === defaults.name);
      if (existing) return existing;
      return {
        _id: `placeholder_${defaults.name}` as any,
        _creationTime: 0,
        ...defaults,
        status: "offline" as const,
        lastHeartbeat: 0,
        tasksCompleted: 0,
      };
    });
  },
});

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
      }
    }
  },
});

/**
 * List agents with true last-active timestamp.
 * lastHeartbeat is only set when agents call /api/heartbeat — if they crash
 * before sending it, the timestamp is stale. This query enriches each agent
 * with the MAX of: lastHeartbeat, last comment createdAt, last activity timestamp.
 * That gives the real "last time this agent did anything."
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

    return AGENT_DEFAULTS.map((defaults) => {
      const existing = dbAgents.find((a) => a.name === defaults.name);
      const base = existing ?? {
        _id: `placeholder_${defaults.name}` as any,
        _creationTime: 0,
        ...defaults,
        status: "offline" as const,
        lastHeartbeat: 0,
        tasksCompleted: 0,
      };

      const lastHeartbeat = base.lastHeartbeat ?? 0;
      const lastComment = lastCommentByAgent[defaults.name] ?? 0;
      const lastActivity = lastActivityByAgent[defaults.name] ?? 0;
      const lastSeen = Math.max(lastHeartbeat, lastComment, lastActivity);

      return { ...base, lastSeen, lastComment, lastActivity };
    });
  },
});

export const getByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
  },
});

/**
 * Stale agent auto-reset.
 * Runs every 5 minutes via cron.
 *
 * An agent is "stale" if its lastHeartbeat is older than 10 minutes AND
 * its status is anything other than "offline". This covers:
 *   - Session crashed without sending idle heartbeat
 *   - Server was restarted and agent never came back
 *   - Network partition causing missed heartbeats
 *
 * For each stale agent:
 *   1. Mark status → "offline"
 *   2. Log an activity entry so operators can see it happened
 *   3. If the agent had in_progress tasks, move them back to "assigned"
 *      so the assigned-task sweep will re-wake the agent automatically
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

      // This agent hasn't heartbeated in >10 min but status is still active — reset it
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
