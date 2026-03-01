import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Log an auditable event.
 */
export const log = mutation({
  args: {
    userId: v.string(),
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLog", {
      userId: args.userId,
      action: args.action,
      resource: args.resource,
      resourceId: args.resourceId,
      details: args.details,
      timestamp: Date.now(),
    });
  },
});

/**
 * List audit log entries, newest first.
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
    userId: v.optional(v.string()),
    resource: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;

    if (args.userId) {
      return await ctx.db
        .query("auditLog")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("auditLog")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});
