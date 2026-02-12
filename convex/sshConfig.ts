import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db.query("sshConfig").first();
    if (!config) return null;
    // Don't return the private key in queries for security
    return {
      _id: config._id,
      host: config.host,
      port: config.port,
      username: config.username,
      updatedAt: config.updatedAt,
    };
  },
});

export const save = mutation({
  args: {
    host: v.string(),
    port: v.number(),
    username: v.string(),
    privateKey: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("sshConfig").first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        host: args.host,
        port: args.port,
        username: args.username,
        privateKey: args.privateKey, // TODO: Encrypt this
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("sshConfig", {
        host: args.host,
        port: args.port,
        username: args.username,
        privateKey: args.privateKey, // TODO: Encrypt this
        updatedAt: Date.now(),
      });
    }
  },
});

export const getForSSH = query({
  args: {},
  handler: async (ctx) => {
    // This is used internally by HTTP actions to get full config including private key
    return await ctx.db.query("sshConfig").first();
  },
});
