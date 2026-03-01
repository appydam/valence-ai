import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    agentName: v.optional(
      v.union(
        v.literal("Kaze"),
        v.literal("Scout"),
        v.literal("Forge"),
        v.literal("Ghost")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q;
    if (args.agentName) {
      q = ctx.db
        .query("activity")
        .withIndex("by_agent", (idx) => idx.eq("agentName", args.agentName!));
    } else {
      q = ctx.db.query("activity").withIndex("by_timestamp");
    }
    const results = await q.order("desc").collect();
    return args.limit ? results.slice(0, args.limit) : results;
  },
});

export const log = mutation({
  args: {
    agentName: v.string(), // Accepts any agent including Sentinel
    action: v.string(),
    details: v.string(),
    taskId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activity", {
      timestamp: Date.now(),
      agentName: args.agentName,
      action: args.action,
      details: args.details,
      taskId: args.taskId,
    });
  },
});
