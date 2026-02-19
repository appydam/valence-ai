/**
 * Webhook Endpoints Management
 * CRUD operations for webhook configurations
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * List all webhook endpoints for a user
 */
export const list = query({
  args: {
    userId: v.string(),
    blueprintId: v.optional(v.id("blueprints")),
  },
  handler: async (ctx, args) => {
    let endpoints;

    if (args.blueprintId) {
      endpoints = await ctx.db
        .query("webhookEndpoints")
        .withIndex("by_blueprint_user", (q) =>
          q.eq("blueprintId", args.blueprintId!).eq("userId", args.userId)
        )
        .collect();
    } else {
      // Get all endpoints for user across all blueprints
      const allEndpoints = await ctx.db.query("webhookEndpoints").collect();
      endpoints = allEndpoints.filter((e) => e.userId === args.userId);
    }

    // Enrich with blueprint info
    const enriched = await Promise.all(
      endpoints.map(async (endpoint) => {
        const blueprint = await ctx.db.get(endpoint.blueprintId);
        return {
          ...endpoint,
          blueprintName: blueprint?.name,
          blueprintSlug: blueprint?.slug,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get a specific webhook endpoint
 */
export const get = query({
  args: { id: v.id("webhookEndpoints") },
  handler: async (ctx, args) => {
    const endpoint = await ctx.db.get(args.id);
    if (!endpoint) return null;

    const blueprint = await ctx.db.get(endpoint.blueprintId);
    return {
      ...endpoint,
      blueprintName: blueprint?.name,
      blueprintSlug: blueprint?.slug,
    };
  },
});

/**
 * Get endpoint by URL path (for webhook receiver)
 */
export const getByPath = query({
  args: { urlPath: v.string() },
  handler: async (ctx, args) => {
    const endpoint = await ctx.db
      .query("webhookEndpoints")
      .withIndex("by_url_path", (q) => q.eq("urlPath", args.urlPath))
      .unique();

    return endpoint;
  },
});

/**
 * Create a new webhook endpoint
 */
export const create = mutation({
  args: {
    blueprintId: v.id("blueprints"),
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    urlPath: v.string(),
    signatureMethod: v.union(
      v.literal("hmac_sha256"),
      v.literal("hmac_sha1"),
      v.literal("jwt"),
      v.literal("none")
    ),
    secret: v.optional(v.string()),
    signatureHeader: v.optional(v.string()),
    eventTypes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if URL path already exists
    const existing = await ctx.db
      .query("webhookEndpoints")
      .withIndex("by_url_path", (q) => q.eq("urlPath", args.urlPath))
      .unique();

    if (existing) {
      throw new Error("Webhook URL path already exists");
    }

    const now = Date.now();

    const endpointId = await ctx.db.insert("webhookEndpoints", {
      blueprintId: args.blueprintId,
      userId: args.userId,
      name: args.name,
      description: args.description,
      urlPath: args.urlPath,
      signatureMethod: args.signatureMethod,
      secret: args.secret,
      signatureHeader: args.signatureHeader,
      eventTypes: args.eventTypes,
      status: "active",
      totalReceived: 0,
      totalProcessed: 0,
      totalFailed: 0,
      createdAt: now,
      updatedAt: now,
    });

    return endpointId;
  },
});

/**
 * Update webhook endpoint
 */
export const update = mutation({
  args: {
    id: v.id("webhookEndpoints"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    signatureMethod: v.optional(
      v.union(
        v.literal("hmac_sha256"),
        v.literal("hmac_sha1"),
        v.literal("jwt"),
        v.literal("none")
      )
    ),
    secret: v.optional(v.string()),
    signatureHeader: v.optional(v.string()),
    eventTypes: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("paused"),
        v.literal("disabled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

/**
 * Delete webhook endpoint
 */
export const remove = mutation({
  args: { id: v.id("webhookEndpoints") },
  handler: async (ctx, args) => {
    // Also delete associated automation rules
    const rules = await ctx.db
      .query("automationRules")
      .withIndex("by_endpoint", (q) => q.eq("endpointId", args.id))
      .collect();

    for (const rule of rules) {
      await ctx.db.delete(rule._id);
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Increment stats when webhook received
 */
export const incrementReceived = mutation({
  args: { endpointId: v.id("webhookEndpoints") },
  handler: async (ctx, args) => {
    const endpoint = await ctx.db.get(args.endpointId);
    if (!endpoint) return;

    await ctx.db.patch(args.endpointId, {
      totalReceived: endpoint.totalReceived + 1,
      lastReceivedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Increment processed/failed stats
 */
export const incrementProcessed = mutation({
  args: {
    endpointId: v.id("webhookEndpoints"),
    success: v.boolean(),
  },
  handler: async (ctx, args) => {
    const endpoint = await ctx.db.get(args.endpointId);
    if (!endpoint) return;

    await ctx.db.patch(args.endpointId, {
      totalProcessed: endpoint.totalProcessed + (args.success ? 1 : 0),
      totalFailed: endpoint.totalFailed + (args.success ? 0 : 1),
      updatedAt: Date.now(),
    });
  },
});
