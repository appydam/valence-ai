import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const agentNameValidator = v.union(
  v.literal("Kaze"),
  v.literal("Scout"),
  v.literal("Forge"),
  v.literal("Ghost"),
  v.literal("Sentinel")
);

export const get = query({
  args: { agentName: agentNameValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("soulFiles")
      .withIndex("by_agent", (q) => q.eq("agentName", args.agentName))
      .first();
  },
});

export const save = mutation({
  args: {
    agentName: agentNameValidator,
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("soulFiles")
      .withIndex("by_agent", (q) => q.eq("agentName", args.agentName))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        updatedAt: Date.now(),
        syncedToServer: false,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("soulFiles", {
        agentName: args.agentName,
        content: args.content,
        updatedAt: Date.now(),
        syncedToServer: false,
      });
    }
  },
});

// Bulk save SOUL files pulled from server
export const syncFromServer = mutation({
  args: {
    soulFiles: v.array(
      v.object({
        agentName: agentNameValidator,
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const soul of args.soulFiles) {
      const existing = await ctx.db
        .query("soulFiles")
        .withIndex("by_agent", (q) => q.eq("agentName", soul.agentName))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          content: soul.content,
          updatedAt: Date.now(),
          syncedToServer: true,
          lastSyncedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("soulFiles", {
          agentName: soul.agentName,
          content: soul.content,
          updatedAt: Date.now(),
          syncedToServer: true,
          lastSyncedAt: Date.now(),
        });
      }
    }
  },
});

export const markSynced = mutation({
  args: { agentName: agentNameValidator },
  handler: async (ctx, args) => {
    const soul = await ctx.db
      .query("soulFiles")
      .withIndex("by_agent", (q) => q.eq("agentName", args.agentName))
      .first();

    if (soul) {
      await ctx.db.patch(soul._id, {
        syncedToServer: true,
        lastSyncedAt: Date.now(),
      });
    }
  },
});
