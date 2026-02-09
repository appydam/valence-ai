import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const agentNameValidator = v.union(
  v.literal("Kaze"),
  v.literal("Scout"),
  v.literal("Forge"),
  v.literal("Ghost")
);

export const report = mutation({
  args: {
    agentName: agentNameValidator,
    totalCost: v.number(),
    totalInputTokens: v.optional(v.number()),
    totalOutputTokens: v.optional(v.number()),
    modelBreakdowns: v.array(
      v.object({
        model: v.string(),
        cost: v.number(),
        inputTokens: v.optional(v.number()),
        outputTokens: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("usage")
      .withIndex("by_agent", (q) => q.eq("agentName", args.agentName))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        totalCost: args.totalCost,
        totalInputTokens: args.totalInputTokens,
        totalOutputTokens: args.totalOutputTokens,
        modelBreakdowns: args.modelBreakdowns,
        reportedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("usage", {
        agentName: args.agentName,
        totalCost: args.totalCost,
        totalInputTokens: args.totalInputTokens,
        totalOutputTokens: args.totalOutputTokens,
        modelBreakdowns: args.modelBreakdowns,
        reportedAt: now,
      });
    }
  },
});

export const getByAgent = query({
  args: { agentName: agentNameValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("usage")
      .withIndex("by_agent", (q) => q.eq("agentName", args.agentName))
      .first();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("usage").collect();
  },
});
