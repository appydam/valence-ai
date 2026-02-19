import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all active tools for a blueprint
 */
export const listByBlueprint = query({
  args: { blueprintId: v.id("blueprints") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("blueprintTools")
      .withIndex("by_blueprint", (q) => q.eq("blueprintId", args.blueprintId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

/**
 * Get tool counts for all blueprints (for listing page)
 */
export const countsByBlueprint = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("blueprintTools").collect();
    const counts: Record<string, number> = {};
    for (const tool of all) {
      if (tool.status === "active") {
        const key = tool.blueprintId as string;
        counts[key] = (counts[key] || 0) + 1;
      }
    }
    return counts;
  },
});

/**
 * Get a single tool by blueprint + name
 */
export const getByName = query({
  args: {
    blueprintId: v.id("blueprints"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("blueprintTools")
      .withIndex("by_blueprint_name", (q) =>
        q.eq("blueprintId", args.blueprintId).eq("name", args.name)
      )
      .first();
  },
});

/**
 * Create a single tool definition
 */
export const create = mutation({
  args: {
    blueprintId: v.id("blueprints"),
    name: v.string(),
    displayName: v.string(),
    description: v.string(),
    method: v.union(
      v.literal("GET"),
      v.literal("POST"),
      v.literal("PUT"),
      v.literal("PATCH"),
      v.literal("DELETE")
    ),
    path: v.string(),
    pathParams: v.optional(v.string()),
    queryParams: v.optional(v.string()),
    headerParams: v.optional(v.string()),
    bodySchema: v.optional(v.string()),
    requestContentType: v.optional(v.string()),
    responseSchema: v.optional(v.string()),
    responseMapping: v.optional(v.string()),
    paginationConfig: v.optional(v.string()),
    rateLimitPerMinute: v.optional(v.number()),
    timeoutMs: v.optional(v.number()),
    retryCount: v.optional(v.number()),
    aiUsageHint: v.optional(v.string()),
    exampleArgs: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("blueprintTools", {
      ...args,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Bulk create tool definitions (used by doc scraper)
 */
export const bulkCreate = mutation({
  args: {
    blueprintId: v.id("blueprints"),
    tools: v.array(
      v.object({
        name: v.string(),
        displayName: v.string(),
        description: v.string(),
        method: v.union(
          v.literal("GET"),
          v.literal("POST"),
          v.literal("PUT"),
          v.literal("PATCH"),
          v.literal("DELETE")
        ),
        path: v.string(),
        pathParams: v.optional(v.string()),
        queryParams: v.optional(v.string()),
        headerParams: v.optional(v.string()),
        bodySchema: v.optional(v.string()),
        requestContentType: v.optional(v.string()),
        responseSchema: v.optional(v.string()),
        responseMapping: v.optional(v.string()),
        paginationConfig: v.optional(v.string()),
        rateLimitPerMinute: v.optional(v.number()),
        timeoutMs: v.optional(v.number()),
        retryCount: v.optional(v.number()),
        aiUsageHint: v.optional(v.string()),
        exampleArgs: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ids: string[] = [];

    for (const tool of args.tools) {
      const id = await ctx.db.insert("blueprintTools", {
        ...tool,
        blueprintId: args.blueprintId,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      ids.push(id);
    }

    return { count: ids.length, ids };
  },
});

/**
 * Update a tool definition
 */
export const update = mutation({
  args: {
    id: v.id("blueprintTools"),
    displayName: v.optional(v.string()),
    description: v.optional(v.string()),
    path: v.optional(v.string()),
    pathParams: v.optional(v.string()),
    queryParams: v.optional(v.string()),
    headerParams: v.optional(v.string()),
    bodySchema: v.optional(v.string()),
    requestContentType: v.optional(v.string()),
    responseMapping: v.optional(v.string()),
    paginationConfig: v.optional(v.string()),
    rateLimitPerMinute: v.optional(v.number()),
    timeoutMs: v.optional(v.number()),
    retryCount: v.optional(v.number()),
    aiUsageHint: v.optional(v.string()),
    exampleArgs: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const tool = await ctx.db.get(id);
    if (!tool) {
      throw new Error("Tool not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { ok: true };
  },
});

/**
 * Deprecate a tool (soft delete)
 */
export const deprecate = mutation({
  args: { id: v.id("blueprintTools") },
  handler: async (ctx, args) => {
    const tool = await ctx.db.get(args.id);
    if (!tool) {
      throw new Error("Tool not found");
    }

    await ctx.db.patch(args.id, {
      status: "deprecated",
      updatedAt: Date.now(),
    });

    return { ok: true };
  },
});
