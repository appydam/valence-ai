import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { checkPlanLimit } from "./lib/planGating";

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

    if (!existing) {
      // Only check plan limit when creating a NEW connection
      const planCheck = await checkPlanLimit(ctx, "integrations");
      if (!planCheck.allowed) {
        throw new Error(`Plan limit reached: ${planCheck.current}/${planCheck.limit} integrations (${planCheck.plan} plan). Upgrade to connect more integrations.`);
      }
    }

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

/**
 * Save a short-lived OAuth state token server-side.
 * Keeps OAuth redirect URLs short (fixes Twitter/X infinite loading bug).
 */
export const saveOAuthState = mutation({
  args: {
    token: v.string(),
    blueprintSlug: v.string(),
    userId: v.string(),
    codeVerifier: v.optional(v.string()),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("oauthStates", {
      token: args.token,
      blueprintSlug: args.blueprintSlug,
      userId: args.userId,
      codeVerifier: args.codeVerifier,
      expiresAt: args.expiresAt,
    });
  },
});

/**
 * Look up an OAuth state token.
 */
export const getOAuthState = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("oauthStates")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
  },
});

/**
 * Delete a used OAuth state token.
 */
export const deleteOAuthState = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("oauthStates")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (record) {
      await ctx.db.delete(record._id);
    }
  },
});
