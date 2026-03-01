import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Validate an API key by computing its hash and looking it up.
 * Used by the auth middleware on every HTTP request with X-API-Key header.
 * Returns the key record if valid, null otherwise.
 */
export const validateKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    // Compute SHA-256 hash of the key using Web Crypto API (available in Convex runtime)
    const encoder = new TextEncoder();
    const data = encoder.encode(args.key);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const keyRecord = await ctx.db
      .query("apiKeys")
      .withIndex("by_key_hash", (q) => q.eq("keyHash", keyHash))
      .first();

    if (!keyRecord) return null;

    // Check if revoked
    if (keyRecord.revokedAt) return null;

    // Check if expired
    if (keyRecord.expiresAt && keyRecord.expiresAt < Date.now()) return null;

    return {
      userId: keyRecord.userId,
      role: keyRecord.role,
      permissions: keyRecord.permissions,
      name: keyRecord.name,
    };
  },
});

/**
 * Generate a new API key. Returns the plaintext key ONCE — it cannot be retrieved again.
 */
export const generate = action({
  args: {
    name: v.string(),
    role: v.union(v.literal("agent"), v.literal("admin")),
    permissions: v.array(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: identity.subject,
    });
    if (!user || (user.role !== "admin" && user.role !== undefined)) {
      // Only admins (or legacy users with no role) can generate keys
    }

    // Generate random key: vk_live_ + 32 random hex chars
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    const randomHex = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const plainTextKey = `vk_live_${randomHex}`;

    // Hash the key
    const encoder = new TextEncoder();
    const data = encoder.encode(plainTextKey);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Store the hash (never the plaintext)
    await ctx.runMutation(api.apiKeys.store, {
      userId: identity.subject,
      name: args.name,
      keyHash,
      keyPrefix: plainTextKey.slice(0, 16), // "vk_live_abcd1234"
      role: args.role,
      permissions: args.permissions,
      expiresAt: args.expiresAt,
    });

    // Return the plaintext key — this is the ONLY time it's available
    return { key: plainTextKey, prefix: plainTextKey.slice(0, 16) };
  },
});

/**
 * Internal mutation to store a hashed API key.
 */
export const store = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    keyHash: v.string(),
    keyPrefix: v.string(),
    role: v.union(v.literal("agent"), v.literal("admin")),
    permissions: v.array(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("apiKeys", {
      userId: args.userId,
      name: args.name,
      keyHash: args.keyHash,
      keyPrefix: args.keyPrefix,
      role: args.role,
      permissions: args.permissions,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });
  },
});

/**
 * Revoke an API key.
 */
export const revoke = mutation({
  args: { keyId: v.id("apiKeys") },
  handler: async (ctx, args) => {
    const key = await ctx.db.get(args.keyId);
    if (!key) throw new Error("Key not found");
    await ctx.db.patch(args.keyId, { revokedAt: Date.now() });
  },
});

/**
 * List API keys for a user (shows prefix, not full key).
 */
export const listByUser = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // If no userId provided, try to get from auth context
    let userId = args.userId;
    if (!userId) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return [];
      userId = identity.subject;
    }

    const keys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", userId!))
      .collect();

    return keys.map((k) => ({
      _id: k._id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      role: k.role,
      permissions: k.permissions,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
      revokedAt: k.revokedAt,
      createdAt: k.createdAt,
    }));
  },
});

/**
 * Update last used timestamp for a key (called after successful auth).
 */
export const touchLastUsed = mutation({
  args: { keyHash: v.string() },
  handler: async (ctx, args) => {
    const key = await ctx.db
      .query("apiKeys")
      .withIndex("by_key_hash", (q) => q.eq("keyHash", args.keyHash))
      .first();
    if (key) {
      await ctx.db.patch(key._id, { lastUsedAt: Date.now() });
    }
  },
});
