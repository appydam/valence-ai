/**
 * Plan limit enforcement utility.
 * Checks whether a resource creation is within plan limits.
 */

import { QueryCtx } from "../_generated/server";

export type PlanCheckResult = {
  allowed: boolean;
  limit: number;
  current: number;
  plan: string;
  resource: string;
};

/**
 * Check if a resource is within plan limits.
 * Returns whether the action is allowed and current usage vs limits.
 */
export async function checkPlanLimit(
  ctx: QueryCtx,
  resource: "tasks" | "integrations" | "users" | "agents" | "webhooks" | "api_calls",
): Promise<PlanCheckResult> {
  // Get current subscription
  const sub = await ctx.db.query("subscriptions").first();
  const plan = sub?.plan ?? "starter";

  // Get plan limits
  const limits = await ctx.db
    .query("planLimits")
    .withIndex("by_plan", (q) => q.eq("plan", plan))
    .first();

  // If no limits configured, allow everything (development mode)
  if (!limits) {
    return { allowed: true, limit: 999999, current: 0, plan, resource };
  }

  // Get current usage
  const usage = await ctx.db
    .query("usageCounters")
    .withIndex("by_period")
    .order("desc")
    .first();

  let limit: number;
  let current: number;

  switch (resource) {
    case "tasks":
      limit = limits.maxTasksPerMonth;
      current = usage?.tasksCreated ?? 0;
      break;
    case "integrations":
      limit = limits.maxIntegrations;
      // Count active connections
      const connections = await ctx.db.query("connections").collect();
      current = connections.filter((c) => c.status === "active").length;
      break;
    case "users":
      limit = limits.maxUsers;
      const users = await ctx.db.query("users").collect();
      current = users.length;
      break;
    case "agents":
      limit = limits.maxAgents;
      const agents = await ctx.db.query("agents").collect();
      current = agents.length;
      break;
    case "webhooks":
      limit = 999; // No webhook limit in schema yet; default unlimited
      const webhooks = await ctx.db.query("webhookEndpoints").collect();
      current = webhooks.filter((w) => w.status === "active").length;
      break;
    case "api_calls":
      limit = limits.maxApiCallsPerMonth;
      current = usage?.apiCallsMade ?? 0;
      break;
    default:
      return { allowed: true, limit: 999999, current: 0, plan, resource };
  }

  return {
    allowed: current < limit,
    limit,
    current,
    plan,
    resource,
  };
}
