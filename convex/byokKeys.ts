import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const providerValidator = v.union(
  v.literal("anthropic"),
  v.literal("openai"),
  v.literal("google"),
  v.literal("xai")
);

/**
 * Get all BYOK keys for the current user (without decrypted key content).
 */
export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("byokKeys")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

/**
 * Get a specific provider's BYOK key for the current user.
 */
export const getByProvider = query({
  args: { provider: providerValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("byokKeys")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", identity.subject).eq("provider", args.provider)
      )
      .first();
  },
});

/**
 * Save (insert or update) an encrypted BYOK key.
 * Called by the action after encryption.
 */
export const save = mutation({
  args: {
    userId: v.string(),
    provider: providerValidator,
    keyEncrypted: v.string(),
    displayPrefix: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("byokKeys")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider)
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        keyEncrypted: args.keyEncrypted,
        displayPrefix: args.displayPrefix,
        isActive: true,
        validationStatus: "unknown",
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("byokKeys", {
      userId: args.userId,
      provider: args.provider,
      keyEncrypted: args.keyEncrypted,
      displayPrefix: args.displayPrefix,
      isActive: true,
      validationStatus: "unknown",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update validation status after testing the key.
 */
export const updateValidation = mutation({
  args: {
    id: v.id("byokKeys"),
    validationStatus: v.union(v.literal("valid"), v.literal("invalid"), v.literal("unknown")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      validationStatus: args.validationStatus,
      lastValidatedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Remove a BYOK key.
 */
export const remove = mutation({
  args: { id: v.id("byokKeys") },
  handler: async (ctx, args) => {
    const key = await ctx.db.get(args.id);
    if (!key) throw new Error("BYOK key not found");

    // Verify ownership
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || key.userId !== identity.subject) {
      throw new Error("Not authorized to remove this key");
    }

    await ctx.db.delete(args.id);
  },
});
