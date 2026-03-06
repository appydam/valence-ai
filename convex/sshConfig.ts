import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get SSH config WITHOUT private key (safe for frontend display).
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db.query("sshConfig").first();
    if (!config) return null;
    return {
      _id: config._id,
      host: config.host,
      port: config.port,
      username: config.username,
      updatedAt: config.updatedAt,
    };
  },
});

/**
 * Save SSH config. Private key is stored as provided by the caller.
 * The saveEncrypted action handles encryption before calling this.
 */
export const save = mutation({
  args: {
    host: v.string(),
    port: v.number(),
    username: v.string(),
    privateKey: v.string(),
    encrypted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("sshConfig").first();

    const data = {
      host: args.host,
      port: args.port,
      username: args.username,
      privateKey: args.privateKey,
      encrypted: args.encrypted ?? false,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("sshConfig", data);
    }
  },
});

/**
 * Get full SSH config including private key (may be encrypted).
 * Used by HTTP actions that forward to SSH proxy.
 * The forwardToSshProxy helper in http.ts handles decryption.
 */
export const getForSSH = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sshConfig").first();
  },
});

/**
 * Internal query for use by actions that need the raw DB record.
 */
export const getInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sshConfig").first();
  },
});
