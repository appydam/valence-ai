// v2 - includes Sentinel agent
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const AGENT_DEFAULTS: {
  name: "Kaze" | "Scout" | "Forge" | "Ghost" | "Sentinel";
  emoji: string;
  role: string;
  description: string;
  color: string;
}[] = [
  { name: "Kaze", emoji: "🌀", role: "Chief of Staff", description: "Coordinates the squad, delegates tasks, ensures alignment", color: "kaze" },
  { name: "Scout", emoji: "🔭", role: "Market Intelligence", description: "Researches trends, finds opportunities, competitive analysis", color: "scout" },
  { name: "Forge", emoji: "🔨", role: "Engineer", description: "Writes code, prototypes, builds automations", color: "forge" },
  { name: "Ghost", emoji: "👻", role: "Content & Distribution", description: "Drafts tweets, LinkedIn posts, blog content", color: "ghost" },
  { name: "Sentinel", emoji: "🔍", role: "Quality Reviewer", description: "Reviews every deliverable, enforces quality standards, approves or rejects work", color: "sentinel" },
];

export const list = query({
  args: {},
  handler: async (ctx) => {
    const dbAgents = await ctx.db.query("agents").collect();
    // Always return all 4 agents — fill in defaults for missing ones
    return AGENT_DEFAULTS.map((defaults) => {
      const existing = dbAgents.find((a) => a.name === defaults.name);
      if (existing) return existing;
      return {
        _id: `placeholder_${defaults.name}` as any,
        _creationTime: 0,
        ...defaults,
        status: "offline" as const,
        lastHeartbeat: 0,
        tasksCompleted: 0,
      };
    });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("agents").collect();
    const existingNames = new Set(existing.map((a) => a.name));
    for (const defaults of AGENT_DEFAULTS) {
      if (!existingNames.has(defaults.name)) {
        await ctx.db.insert("agents", {
          ...defaults,
          status: "offline",
          lastHeartbeat: 0,
          tasksCompleted: 0,
        });
      }
    }
  },
});

export const getByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
  },
});
