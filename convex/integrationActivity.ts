// @ts-nocheck
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Log an integration activity
export const log = mutation({
  args: {
    userId: v.string(),
    agentName: v.optional(v.string()),
    integrationType: v.string(),
    toolName: v.string(),
    status: v.string(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("integrationActivity", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// Get recent activity for a user
export const list = query({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    if (args.userId) {
      return await ctx.db
        .query("integrationActivity")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("integrationActivity")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

/** Recent integration activity across all users (for Live Ops Feed) */
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("integrationActivity")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit ?? 50);
  },
});

// Get activity stats
export const stats = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const activities = args.userId
      ? await ctx.db
          .query("integrationActivity")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .collect()
      : await ctx.db.query("integrationActivity").collect();

    const total = activities.length;
    const successful = activities.filter((a) => a.status === "success").length;
    const failed = activities.filter((a) => a.status === "error").length;

    // Group by integration type
    const byIntegration: Record<string, number> = {};
    for (const activity of activities) {
      byIntegration[activity.integrationType] =
        (byIntegration[activity.integrationType] || 0) + 1;
    }

    return {
      total,
      successful,
      failed,
      byIntegration,
    };
  },
});
