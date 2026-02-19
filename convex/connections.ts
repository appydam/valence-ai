import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Upsert connection record (create or update)
 */
export const upsert = mutation({
  args: {
    blueprintId: v.id("blueprints"),
    userId: v.string(),
    credentialsEncrypted: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("connections")
      .withIndex("by_blueprint_user", (q) =>
        q.eq("blueprintId", args.blueprintId).eq("userId", args.userId)
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        credentialsEncrypted: args.credentialsEncrypted,
        status: "active",
        expiresAt: args.expiresAt,
        lastRefreshedAt: now,
        updatedAt: now,
        consecutiveFailures: 0,
        lastError: undefined,
      });
      return existing._id;
    }

    return await ctx.db.insert("connections", {
      blueprintId: args.blueprintId,
      userId: args.userId,
      credentialsEncrypted: args.credentialsEncrypted,
      status: "active",
      expiresAt: args.expiresAt,
      connectedAt: now,
      updatedAt: now,
      consecutiveFailures: 0,
    });
  },
});

/**
 * Disconnect a connection
 */
export const disconnect = mutation({
  args: {
    blueprintId: v.id("blueprints"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const conn = await ctx.db
      .query("connections")
      .withIndex("by_blueprint_user", (q) =>
        q.eq("blueprintId", args.blueprintId).eq("userId", args.userId)
      )
      .first();

    if (conn) {
      await ctx.db.patch(conn._id, {
        status: "disconnected",
        updatedAt: Date.now(),
      });
    }

    return { ok: true };
  },
});

/**
 * Mark connection error
 */
export const markError = mutation({
  args: {
    id: v.id("connections"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const conn = await ctx.db.get(args.id);
    if (!conn) return;

    const failures = conn.consecutiveFailures + 1;

    await ctx.db.patch(args.id, {
      lastError: args.error,
      consecutiveFailures: failures,
      status: failures >= 3 ? "error" : conn.status,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Mark connection success (resets failure count)
 */
export const markSuccess = mutation({
  args: { id: v.id("connections") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      consecutiveFailures: 0,
      lastUsedAt: Date.now(),
      status: "active",
      updatedAt: Date.now(),
    });
  },
});

/**
 * List user's connections
 */
export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("connections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

/**
 * Get connection for execution (includes decryption in action layer)
 */
export const getForExecution = query({
  args: {
    blueprintId: v.id("blueprints"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("connections")
      .withIndex("by_blueprint_user", (q) =>
        q.eq("blueprintId", args.blueprintId).eq("userId", args.userId)
      )
      .first();
  },
});

/**
 * Get connection by ID
 */
export const get = query({
  args: { id: v.id("connections") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * List all connections (for token refresh scheduler)
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("connections").collect();
  },
});
