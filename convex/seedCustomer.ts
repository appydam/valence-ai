import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed a new customer deployment with all required data.
 * Called once during provisioning.
 */
export const seedNewCustomer = mutation({
  args: {
    companyName: v.string(),
    adminEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Seed default agents
    const agents = [
      { name: "Kaze", emoji: "🌀", role: "Chief of Staff", description: "Orchestrates the squad, delegates tasks, and ensures alignment", color: "#3B82F6" },
      { name: "Scout", emoji: "🔭", role: "Research & Intel", description: "Web research, data gathering, and competitive analysis", color: "#10B981" },
      { name: "Forge", emoji: "🔨", role: "Builder", description: "Code generation, development, and technical implementation", color: "#F59E0B" },
      { name: "Ghost", emoji: "👻", role: "Content & Comms", description: "Writing, content creation, email, and communications", color: "#8B5CF6" },
      { name: "Sentinel", emoji: "🛡️", role: "QA & Review", description: "Quality assurance, code review, and testing", color: "#EF4444" },
    ];

    for (const agent of agents) {
      const existing = await ctx.db.query("agents").withIndex("by_name", (q) => q.eq("name", agent.name)).first();
      if (!existing) {
        await ctx.db.insert("agents", {
          ...agent,
          status: "idle",
          lastHeartbeat: Date.now(),
          currentTaskId: undefined,
          tasksCompleted: 0,
        });
      }
    }

    // 2. Seed default agent configs
    const configs = [
      { agentName: "Kaze", model: "anthropic/claude-sonnet-4-5-20250514", skills: ["mission-control"], sessionMaxTurns: 25, sessionTimeout: 600 },
      { agentName: "Scout", model: "anthropic/claude-sonnet-4-5-20250514", skills: ["mission-control"], sessionMaxTurns: 15, sessionTimeout: 300 },
      { agentName: "Forge", model: "anthropic/claude-sonnet-4-5-20250514", skills: ["mission-control"], sessionMaxTurns: 30, sessionTimeout: 600 },
      { agentName: "Ghost", model: "anthropic/claude-sonnet-4-5-20250514", skills: ["mission-control"], sessionMaxTurns: 15, sessionTimeout: 300 },
      { agentName: "Sentinel", model: "anthropic/claude-sonnet-4-5-20250514", skills: ["mission-control"], sessionMaxTurns: 15, sessionTimeout: 300 },
    ];

    for (const config of configs) {
      const existing = await ctx.db.query("agentConfigs").withIndex("by_agent", (q) => q.eq("agentName", config.agentName)).first();
      if (!existing) {
        await ctx.db.insert("agentConfigs", {
          ...config,
          updatedAt: Date.now(),
          updatedBy: "system",
        });
      }
    }

    // 3. Seed plan limits
    const existingPlans = await ctx.db.query("planLimits").first();
    if (!existingPlans) {
      const plans = [
        { plan: "business", maxUsers: 25, maxAgents: 5, maxIntegrations: 30, maxTasksPerMonth: 60000, maxApiCallsPerMonth: 500000, features: ["board", "tasks", "integrations", "webhooks", "memory", "autopilot", "analytics", "audit_log", "sonnet", "war_room", "daily_digest"] },
        { plan: "enterprise", maxUsers: 25, maxAgents: 10, maxIntegrations: 100, maxTasksPerMonth: 75000, maxApiCallsPerMonth: 1000000, features: ["board", "tasks", "integrations", "webhooks", "memory", "autopilot", "analytics", "audit_log", "sonnet", "opus", "war_room", "daily_digest", "dedicated_server", "custom_agents"] },
        { plan: "enterprise_plus", maxUsers: 999, maxAgents: 999, maxIntegrations: 999, maxTasksPerMonth: 999999, maxApiCallsPerMonth: 999999, features: ["board", "tasks", "integrations", "webhooks", "memory", "autopilot", "analytics", "audit_log", "sonnet", "opus", "war_room", "daily_digest", "dedicated_server", "custom_agents", "onprem", "sla", "unlimited_missions", "custom_integrations", "voice"] },
      ];
      for (const plan of plans) {
        await ctx.db.insert("planLimits", plan);
      }
    }

    // 4. Create brand config
    const existingBrand = await ctx.db.query("brandConfig").first();
    if (!existingBrand) {
      await ctx.db.insert("brandConfig", {
        companyName: args.companyName,
        updatedAt: Date.now(),
      });
    }

    // 5. Create initial usage counters
    const existingUsage = await ctx.db.query("usageCounters").first();
    if (!existingUsage) {
      const now = new Date();
      await ctx.db.insert("usageCounters", {
        periodStart: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
        periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime(),
        tasksCreated: 0,
        apiCallsMade: 0,
        integrationExecutions: 0,
        agentSessions: 0,
        updatedAt: Date.now(),
      });
    }

    return { success: true, companyName: args.companyName };
  },
});
