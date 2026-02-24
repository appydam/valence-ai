import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const agentNameValidator = v.union(
  v.literal("Kaze"),
  v.literal("Scout"),
  v.literal("Forge"),
  v.literal("Ghost"),
  v.literal("Sentinel")
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agentConfigs").collect();
  },
});

export const getByAgent = query({
  args: { agentName: agentNameValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agentConfigs")
      .withIndex("by_agent", (q) => q.eq("agentName", args.agentName))
      .unique();
  },
});

export const create = mutation({
  args: {
    agentName: agentNameValidator,
    model: v.string(),
    skills: v.array(v.string()),
    sessionMaxTurns: v.number(),
    sessionTimeout: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agentConfigs")
      .withIndex("by_agent", (q) => q.eq("agentName", args.agentName))
      .unique();

    if (existing) {
      throw new Error("Agent config already exists");
    }

    await ctx.db.insert("agentConfigs", {
      agentName: args.agentName,
      model: args.model,
      skills: args.skills,
      sessionMaxTurns: args.sessionMaxTurns,
      sessionTimeout: args.sessionTimeout,
      updatedAt: Date.now(),
      updatedBy: "System",
    });
  },
});

// Bulk upsert configs from server's openclaw.json
export const syncFromServer = mutation({
  args: {
    configs: v.array(
      v.object({
        agentName: agentNameValidator,
        model: v.string(),
        skills: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const config of args.configs) {
      const existing = await ctx.db
        .query("agentConfigs")
        .withIndex("by_agent", (q) => q.eq("agentName", config.agentName))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          model: config.model,
          skills: config.skills,
          updatedAt: Date.now(),
          updatedBy: "ServerSync",
        });
      } else {
        await ctx.db.insert("agentConfigs", {
          agentName: config.agentName,
          model: config.model,
          skills: config.skills,
          sessionMaxTurns: 25,
          sessionTimeout: 300,
          updatedAt: Date.now(),
          updatedBy: "ServerSync",
        });
      }
    }
  },
});

export const update = mutation({
  args: {
    agentName: agentNameValidator,
    model: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    sessionMaxTurns: v.optional(v.number()),
    sessionTimeout: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { agentName, ...fields } = args;
    const existing = await ctx.db
      .query("agentConfigs")
      .withIndex("by_agent", (q) => q.eq("agentName", agentName))
      .unique();

    if (!existing) {
      // Auto-create if doesn't exist
      const defaultConfig = {
        agentName,
        model: fields.model || "anthropic/claude-sonnet-4-5",
        skills: fields.skills || ["mission-control"],
        sessionMaxTurns: fields.sessionMaxTurns || 20,
        sessionTimeout: fields.sessionTimeout || 300,
        updatedAt: Date.now(),
        updatedBy: "Human",
      };
      await ctx.db.insert("agentConfigs", defaultConfig);
      return;
    }

    const updates: Record<string, any> = {
      updatedAt: Date.now(),
      updatedBy: "Human",
    };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }

    await ctx.db.patch(existing._id, updates);
  },
});
