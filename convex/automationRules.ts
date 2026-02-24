// @ts-nocheck
/**
 * Automation Rules Engine
 * Event-to-action automation for webhooks
 */

import { v } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

const agentNameValidator = v.union(
  v.literal("Kaze"),
  v.literal("Scout"),
  v.literal("Forge"),
  v.literal("Ghost"),
  v.literal("Sentinel")
);

const taskPriorityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("urgent")
);

/**
 * List automation rules for an endpoint
 */
export const listByEndpoint = query({
  args: { endpointId: v.id("webhookEndpoints") },
  handler: async (ctx, args) => {
    const rules = await ctx.db
      .query("automationRules")
      .withIndex("by_endpoint", (q) => q.eq("endpointId", args.endpointId))
      .collect();

    return rules;
  },
});

/**
 * List all rules for a user
 */
export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const rules = await ctx.db
      .query("automationRules")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Enrich with endpoint info
    const enriched = await Promise.all(
      rules.map(async (rule) => {
        const endpoint = await ctx.db.get(rule.endpointId);
        const blueprint = endpoint ? await ctx.db.get(endpoint.blueprintId) : null;
        return {
          ...rule,
          endpointName: endpoint?.name,
          blueprintName: blueprint?.name,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get active rules for an endpoint and event type
 */
export const getActiveRules = query({
  args: {
    endpointId: v.id("webhookEndpoints"),
    eventType: v.string(),
  },
  handler: async (ctx, args) => {
    const allRules = await ctx.db
      .query("automationRules")
      .withIndex("by_endpoint", (q) => q.eq("endpointId", args.endpointId))
      .collect();

    // Filter by enabled and matching event type
    const matchingRules = allRules.filter(
      (rule) =>
        rule.enabled &&
        (rule.eventTypes.includes(args.eventType) ||
          rule.eventTypes.includes("*")) // "*" matches all events
    );

    return matchingRules;
  },
});

/**
 * Create automation rule
 */
export const create = mutation({
  args: {
    endpointId: v.id("webhookEndpoints"),
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    eventTypes: v.array(v.string()),
    conditions: v.optional(v.string()),
    actionType: v.union(
      v.literal("create_task"),
      v.literal("send_notification"),
      v.literal("trigger_agent"),
      v.literal("execute_tool")
    ),
    actionConfig: v.string(),
    taskTemplate: v.optional(
      v.object({
        titleTemplate: v.string(),
        descriptionTemplate: v.string(),
        priority: taskPriorityValidator,
        assignee: v.optional(agentNameValidator),
        tags: v.array(v.string()),
      })
    ),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const ruleId = await ctx.db.insert("automationRules", {
      endpointId: args.endpointId,
      userId: args.userId,
      name: args.name,
      description: args.description,
      eventTypes: args.eventTypes,
      conditions: args.conditions,
      actionType: args.actionType,
      actionConfig: args.actionConfig,
      taskTemplate: args.taskTemplate,
      enabled: args.enabled,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return ruleId;
  },
});

/**
 * Update automation rule
 */
export const update = mutation({
  args: {
    id: v.id("automationRules"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    eventTypes: v.optional(v.array(v.string())),
    conditions: v.optional(v.string()),
    actionConfig: v.optional(v.string()),
    taskTemplate: v.optional(
      v.object({
        titleTemplate: v.string(),
        descriptionTemplate: v.string(),
        priority: taskPriorityValidator,
        assignee: v.optional(agentNameValidator),
        tags: v.array(v.string()),
      })
    ),
    enabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

/**
 * Delete automation rule
 */
export const remove = mutation({
  args: { id: v.id("automationRules") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/**
 * Execute automation rule (process webhook event)
 */
export const execute = action({
  args: {
    ruleId: v.id("automationRules"),
    eventData: v.string(), // JSON-stringified event payload
    eventType: v.string(),
  },
  handler: async (ctx, args) => {
    const rule = await ctx.runQuery(internal.automationRules.getRule, {
      id: args.ruleId,
    });

    if (!rule || !rule.enabled) {
      return { success: false, error: "Rule not found or disabled" };
    }

    try {
      const eventData = JSON.parse(args.eventData);

      // Check conditions (if specified)
      if (rule.conditions) {
        const conditionsMatch = evaluateConditions(
          rule.conditions,
          eventData
        );
        if (!conditionsMatch) {
          return { success: true, skipped: true, reason: "Conditions not met" };
        }
      }

      // Execute action based on actionType
      let result;

      if (rule.actionType === "create_task") {
        result = await executeCreateTask(ctx, rule, eventData);
      } else if (rule.actionType === "send_notification") {
        result = await executeSendNotification(ctx, rule, eventData);
      } else if (rule.actionType === "trigger_agent") {
        result = await executeTriggerAgent(ctx, rule, eventData);
      } else if (rule.actionType === "execute_tool") {
        result = await executeToolAction(ctx, rule, eventData);
      } else {
        throw new Error(`Unknown action type: ${rule.actionType}`);
      }

      // Update rule stats
      await ctx.runMutation(internal.automationRules.incrementStats, {
        ruleId: args.ruleId,
        success: true,
      });

      return { success: true, result };
    } catch (error: any) {
      // Update failure stats
      await ctx.runMutation(internal.automationRules.incrementStats, {
        ruleId: args.ruleId,
        success: false,
      });

      return { success: false, error: error.message };
    }
  },
});

/**
 * Helper: Create task from webhook event
 */
async function executeCreateTask(ctx: any, rule: any, eventData: any) {
  if (!rule.taskTemplate) {
    throw new Error("Task template not configured");
  }

  // Render template with event data
  const title = renderTemplate(rule.taskTemplate.titleTemplate, eventData);
  const description = renderTemplate(
    rule.taskTemplate.descriptionTemplate,
    eventData
  );

  // Create task
  const taskId = await ctx.runMutation(internal.automationRules.createTask, {
    title,
    description,
    priority: rule.taskTemplate.priority,
    assignee: rule.taskTemplate.assignee,
    tags: rule.taskTemplate.tags,
    metadata: JSON.stringify({
      source: "webhook",
      ruleId: rule._id,
      eventType: eventData.action || eventData.type || "unknown",
    }),
  });

  return { taskId };
}

/**
 * Helper: Send notification
 */
async function executeSendNotification(ctx: any, rule: any, eventData: any) {
  // Parse action config
  const config = JSON.parse(rule.actionConfig);

  // TODO: Implement notification sending (Slack, email, etc.)
  console.log("Send notification:", config, eventData);

  return { sent: true };
}

/**
 * Helper: Trigger agent wakeup
 */
async function executeTriggerAgent(ctx: any, rule: any, eventData: any) {
  const config = JSON.parse(rule.actionConfig);
  const agentName = config.agentName;

  // TODO: Call agent wakeup webhook
  console.log("Trigger agent:", agentName, eventData);

  return { triggered: true, agentName };
}

/**
 * Helper: Execute integration tool
 */
async function executeToolAction(ctx: any, rule: any, eventData: any) {
  const config = JSON.parse(rule.actionConfig);

  // TODO: Call integration engine to execute tool
  console.log("Execute tool:", config, eventData);

  return { executed: true };
}

/**
 * Template rendering with {{variable}} syntax
 */
function renderTemplate(template: string, data: any): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const value = getNestedProperty(data, path.trim());
    return value !== undefined ? String(value) : "";
  });
}

/**
 * Get nested property from object using dot notation
 */
function getNestedProperty(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

/**
 * Evaluate JSONPath-style conditions
 */
function evaluateConditions(conditionsJson: string, data: any): boolean {
  try {
    const conditions = JSON.parse(conditionsJson);

    // Simple condition format: { "path.to.field": "expected_value" }
    for (const [path, expectedValue] of Object.entries(conditions)) {
      const actualValue = getNestedProperty(data, path);
      if (actualValue !== expectedValue) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Internal: Get rule by ID
 */
export const getRule = query({
  args: { id: v.id("automationRules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Internal: Create task (called from action)
 */
export const createTask = internalMutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: taskPriorityValidator,
    assignee: v.optional(agentNameValidator),
    tags: v.array(v.string()),
    metadata: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: args.assignee ? "assigned" : "inbox",
      priority: args.priority,
      assignee: args.assignee,
      creator: "webhook-automation",
      createdAt: now,
      updatedAt: now,
      tags: args.tags,
      deliverables: [],
      metadata: args.metadata,
    });

    return taskId;
  },
});

/**
 * Internal: Update rule stats
 */
export const incrementStats = internalMutation({
  args: {
    ruleId: v.id("automationRules"),
    success: v.boolean(),
  },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.ruleId);
    if (!rule) return;

    await ctx.db.patch(args.ruleId, {
      executionCount: rule.executionCount + 1,
      successCount: rule.successCount + (args.success ? 1 : 0),
      failureCount: rule.failureCount + (args.success ? 0 : 1),
      lastExecutedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
