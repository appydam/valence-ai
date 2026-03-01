import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the brand config for this deployment. Only one record per deployment.
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("brandConfig").first();
  },
});

/**
 * Update brand config. Creates if it doesn't exist.
 */
export const upsert = mutation({
  args: {
    companyName: v.string(),
    logoUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("brandConfig").first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("brandConfig", {
      ...args,
      updatedAt: Date.now(),
    });
  },
});
