import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const agentNameValidator = v.union(
  v.literal("Kaze"),
  v.literal("Scout"),
  v.literal("Forge"),
  v.literal("Ghost"),
  v.literal("Sentinel")
);

/** Get the most recent N handoffs for an agent. Used by heartbeat + frontend. */
export const listForAgent = query({
  args: {
    agentName: agentNameValidator,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessionHandoffs")
      .withIndex("by_agent_time", (q) => q.eq("agentName", args.agentName))
      .order("desc")
      .take(args.limit ?? 5);
  },
});

/** Recent handoffs across all agents (for Live Ops Feed) */
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessionHandoffs")
      .order("desc")
      .take(args.limit ?? 10);
  },
});

/** Agent writes a handoff note at end of session. Called via POST /api/agents/handoff. */
export const write = mutation({
  args: {
    agentName: agentNameValidator,
    sessionSummary: v.string(),
    tasksCompleted: v.array(v.string()),
    taskTitles: v.array(v.string()),
    newMemoriesCreated: v.array(v.id("agentMemory")),
    openQuestions: v.optional(v.string()),
    nextSessionHint: v.optional(v.string()),
    sessionStart: v.number(),
    sessionEnd: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessionHandoffs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
