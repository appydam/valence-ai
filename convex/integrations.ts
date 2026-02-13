import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all integrations (optionally filtered by category or enabledOnly)
export const list = query({
  args: {
    category: v.optional(v.string()),
    enabledOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.category !== undefined) {
      return await ctx.db
        .query("integrations")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else if (args.enabledOnly) {
      return await ctx.db
        .query("integrations")
        .withIndex("by_enabled", (q) => q.eq("enabled", true))
        .collect();
    }

    return await ctx.db.query("integrations").collect();
  },
});

// Get a single integration by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("integrations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Toggle an integration's enabled state (upsert)
export const toggle = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    category: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if integration already exists
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      // Update existing integration
      await ctx.db.patch(existing._id, {
        enabled: args.enabled,
      });
      return existing._id;
    } else {
      // Create new integration record
      const id = await ctx.db.insert("integrations", {
        slug: args.slug,
        name: args.name,
        category: args.category,
        enabled: args.enabled,
      });
      return id;
    }
  },
});

// Bulk seed integrations (for initial setup)
export const seed = mutation({
  args: {
    integrations: v.array(
      v.object({
        slug: v.string(),
        name: v.string(),
        category: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const inserted = [];
    for (const integration of args.integrations) {
      // Only insert if doesn't exist
      const existing = await ctx.db
        .query("integrations")
        .withIndex("by_slug", (q) => q.eq("slug", integration.slug))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("integrations", {
          ...integration,
          enabled: false,
        });
        inserted.push(id);
      }
    }
    return { count: inserted.length, ids: inserted };
  },
});
