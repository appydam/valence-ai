import { mutation } from "./_generated/server";
import { v } from "convex/values";

const AGENT_DEFAULTS: Record<
  string,
  { emoji: string; color: string; role: string; description: string }
> = {
  Kaze: {
    emoji: "🌀",
    color: "kaze",
    role: "Chief of Staff",
    description: "Coordinates the squad, delegates tasks, ensures alignment",
  },
  Scout: {
    emoji: "🔭",
    color: "scout",
    role: "Market Intelligence",
    description: "Researches trends, finds opportunities, competitive analysis",
  },
  Forge: {
    emoji: "🔨",
    color: "forge",
    role: "Engineer",
    description: "Writes code, prototypes, builds automations",
  },
  Ghost: {
    emoji: "👻",
    color: "ghost",
    role: "Content & Distribution",
    description: "Drafts tweets, LinkedIn posts, blog content",
  },
  Sentinel: {
    emoji: "🔍",
    color: "sentinel",
    role: "Quality Reviewer",
    description: "Reviews outputs, ensures quality, flags issues",
  },
};

export const beat = mutation({
  args: {
    agentName: v.union(
      v.literal("Kaze"),
      v.literal("Scout"),
      v.literal("Forge"),
      v.literal("Ghost"),
      v.literal("Sentinel")
    ),
    status: v.union(
      v.literal("online"),
      v.literal("working"),
      v.literal("idle"),
      v.literal("offline")
    ),
    currentTaskId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.agentName))
      .unique();

    if (existing) {
      const patch: Record<string, any> = {
        status: args.status,
        lastHeartbeat: Date.now(),
      };
      if (args.currentTaskId !== undefined) {
        patch.currentTaskId = args.currentTaskId || undefined;
      }
      await ctx.db.patch(existing._id, patch);
      return { action: "updated", agentId: existing._id };
    } else {
      const defaults = AGENT_DEFAULTS[args.agentName];
      const id = await ctx.db.insert("agents", {
        name: args.agentName,
        emoji: defaults.emoji,
        role: defaults.role,
        description: defaults.description,
        status: args.status,
        lastHeartbeat: Date.now(),
        tasksCompleted: 0,
        color: defaults.color,
      });
      return { action: "created", agentId: id };
    }
  },
});
