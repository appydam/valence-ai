import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all blueprints with optional filtering
 */
export const list = query({
  args: {
    category: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("blueprints")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    }
    if (args.status) {
      return await ctx.db
        .query("blueprints")
        .withIndex("by_status", (q) =>
          q.eq("status", args.status as "active" | "archived")
        )
        .collect();
    }
    return await ctx.db.query("blueprints").collect();
  },
});

/**
 * Get a single blueprint by slug
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();

    // Prefer active blueprints over archived ones
    return all.find((b) => b.status === "active") || all[0] || null;
  },
});

/**
 * Get a single blueprint by ID
 */
export const get = query({
  args: { id: v.id("blueprints") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Create a new blueprint
 */
export const create = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    category: v.string(),
    authType: v.union(
      v.literal("oauth2"),
      v.literal("api_key"),
      v.literal("bearer_token"),
      v.literal("basic_auth"),
      v.literal("none")
    ),
    authConfig: v.string(), // JSON string
    baseUrl: v.string(),
    defaultHeaders: v.optional(v.string()), // JSON string
    apiProtocol: v.optional(v.union(
      v.literal("rest"),
      v.literal("graphql"),
      v.literal("soap"),
      v.literal("jsonrpc")
    )),
    sourceType: v.union(
      v.literal("manual"),
      v.literal("ai_scraped"),
      v.literal("openapi_import")
    ),
    sourceUrl: v.optional(v.string()),
    iconUrl: v.optional(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check for duplicate slug among active blueprints
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();

    const activeExisting = existing.find((b) => b.status === "active");

    if (activeExisting) {
      throw new Error(`Blueprint with slug "${args.slug}" already exists`);
    }

    return await ctx.db.insert("blueprints", {
      slug: args.slug,
      name: args.name,
      description: args.description,
      category: args.category,
      version: 1,
      status: "active",
      authType: args.authType,
      authConfig: args.authConfig,
      baseUrl: args.baseUrl,
      defaultHeaders: args.defaultHeaders,
      apiProtocol: args.apiProtocol,
      sourceType: args.sourceType,
      sourceUrl: args.sourceUrl,
      iconUrl: args.iconUrl,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
    });
  },
});

/**
 * Update an existing blueprint
 */
export const update = mutation({
  args: {
    id: v.id("blueprints"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    authType: v.optional(v.union(
      v.literal("oauth2"),
      v.literal("api_key"),
      v.literal("bearer_token"),
      v.literal("basic_auth"),
      v.literal("none")
    )),
    authConfig: v.optional(v.string()),
    baseUrl: v.optional(v.string()),
    defaultHeaders: v.optional(v.string()),
    apiProtocol: v.optional(v.union(
      v.literal("rest"),
      v.literal("graphql"),
      v.literal("soap"),
      v.literal("jsonrpc")
    )),
    iconUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const blueprint = await ctx.db.get(id);
    if (!blueprint) {
      throw new Error("Blueprint not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { ok: true };
  },
});

/**
 * Set custom OAuth config (enterprise override)
 * When set, overrides the default Valence OAuth app for this blueprint.
 * Pass null/empty to clear and revert to Valence default.
 */
export const setCustomAuthConfig = mutation({
  args: {
    id: v.id("blueprints"),
    customAuthConfig: v.optional(v.string()), // JSON string or undefined to clear
  },
  handler: async (ctx, args) => {
    const blueprint = await ctx.db.get(args.id);
    if (!blueprint) {
      throw new Error("Blueprint not found");
    }

    await ctx.db.patch(args.id, {
      customAuthConfig: args.customAuthConfig,
      updatedAt: Date.now(),
    });

    return { ok: true };
  },
});

/**
 * Archive a blueprint (soft delete)
 */
export const archive = mutation({
  args: { id: v.id("blueprints") },
  handler: async (ctx, args) => {
    const blueprint = await ctx.db.get(args.id);
    if (!blueprint) {
      throw new Error("Blueprint not found");
    }

    await ctx.db.patch(args.id, {
      status: "archived",
      updatedAt: Date.now(),
    });

    return { ok: true };
  },
});
