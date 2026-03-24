// @ts-nocheck
"use node";

/**
 * Monitor Action Handlers
 * Executes actions when monitor conditions are met:
 * - create_task: Create a task in Valence AI
 * - send_notification: Send Slack message via integration engine
 * - trigger_agent: Wake an agent via agentWakeup
 * - log_alert: Log to activity feed
 */

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

/**
 * Route to the correct action handler based on actionType
 */
export const executeMonitorAction = internalAction({
  args: {
    monitorId: v.id("monitors"),
    monitorName: v.optional(v.string()),
    userId: v.string(),
    actionType: v.string(),
    actionConfig: v.string(),
    conditionResults: v.string(),
    responseData: v.string(),
  },
  handler: async (ctx, args) => {
    const config = JSON.parse(args.actionConfig);

    switch (args.actionType) {
      case "create_task":
        return await executeCreateTask(ctx, args, config);
      case "send_notification":
        return await executeSendNotification(ctx, args, config);
      case "trigger_agent":
        return await executeTriggerAgent(ctx, args, config);
      case "log_alert":
        return await executeLogAlert(ctx, args, config);
      default:
        throw new Error(`Unknown action type: ${args.actionType}`);
    }
  },
});

/**
 * Create a task in Valence AI
 */
async function executeCreateTask(ctx: any, args: any, config: any) {
  // Config shape: { title, description, priority, assignee, tags }
  // Supports {{monitor_name}}, {{condition_summary}} template vars
  const title = renderTemplate(config.title || "Monitor Alert", args);
  const description = renderTemplate(
    config.description || "A monitor condition was triggered.",
    args
  );

  const taskId = await ctx.runMutation(internal.automationRules.createTask, {
    title,
    description,
    priority: config.priority || "medium",
    assignee: config.assignee,
    tags: config.tags || ["monitor-alert"],
    metadata: JSON.stringify({
      source: "monitor",
      monitorId: args.monitorId,
      conditionResults: args.conditionResults,
    }),
  });

  // If an assignee is specified, wake the agent
  if (config.assignee) {
    try {
      await ctx.runAction(internal.agentWakeup.triggerWakeup, {
        agentName: config.assignee,
        taskId: taskId.toString(),
        reason: "monitor_alert",
      });
    } catch (e: any) {
      console.warn(`[MonitorActions] Failed to wake agent ${config.assignee}:`, e.message);
    }
  }

  return { taskId };
}

/**
 * Send a Slack notification via the integration engine
 */
async function executeSendNotification(ctx: any, args: any, config: any) {
  // Config shape: { channel, message, blueprintSlug? }
  const message = renderTemplate(
    config.message || "Monitor alert triggered",
    args
  );

  // Use Slack integration if available
  const blueprintSlug = config.blueprintSlug || "slack";
  const toolName = config.toolName || "send_message";

  try {
    const result = await ctx.runAction(api.executionEngine.executeTool, {
      userId: args.userId,
      agentName: "Monitor",
      blueprintSlug,
      toolName,
      toolArgs: {
        channel: config.channel || "#alerts",
        text: message,
      },
    });

    return { sent: true, result };
  } catch (e: any) {
    console.warn(`[MonitorActions] Notification failed:`, e.message);
    return { sent: false, error: e.message };
  }
}

/**
 * Trigger an agent wakeup
 */
async function executeTriggerAgent(ctx: any, args: any, config: any) {
  // Config shape: { agentName, reason? }
  const agentName = config.agentName;
  if (!agentName) throw new Error("agentName required for trigger_agent action");

  // Create a task for the agent to work on
  const title = renderTemplate(
    config.taskTitle || "Monitor Alert: {{monitor_name}}",
    args
  );
  const description = renderTemplate(
    config.taskDescription || "Automated alert from continuous monitor. Review and take action.",
    args
  );

  const taskId = await ctx.runMutation(internal.automationRules.createTask, {
    title,
    description,
    priority: config.priority || "high",
    assignee: agentName,
    tags: ["monitor-alert"],
    metadata: JSON.stringify({
      source: "monitor",
      monitorId: args.monitorId,
    }),
  });

  await ctx.runAction(internal.agentWakeup.triggerWakeup, {
    agentName,
    taskId: taskId.toString(),
    reason: config.reason || "monitor_alert",
  });

  return { triggered: true, agentName, taskId };
}

/**
 * Log an alert to the activity feed
 */
async function executeLogAlert(ctx: any, args: any, config: any) {
  const message = renderTemplate(
    config.message || "Monitor condition triggered",
    args
  );

  const orchestrator = await ctx.runQuery(internal.agents.getOrchestratorAgent);
  await ctx.runMutation(api.activityFns.log, {
    agentName: orchestrator?.name ?? "Kaze",
    action: "monitor_alert",
    details: message,
  });

  return { logged: true };
}

/**
 * Simple template rendering for action configs.
 * Supports: {{monitor_name}}, {{monitor_id}}, {{condition_summary}}, {{response_preview}}
 */
function renderTemplate(template: string, args: any): string {
  let result = template;

  result = result.replace(/\{\{monitor_id\}\}/g, args.monitorId || "");
  result = result.replace(/\{\{monitor_name\}\}/g, args.monitorName || "Monitor");

  // Parse condition results for summary
  try {
    const conditions = JSON.parse(args.conditionResults || "[]");
    const summary = conditions
      .filter((c: any) => c.passed)
      .map((c: any) => `${c.field} ${c.operator} ${c.expected} (actual: ${c.actual})`)
      .join(", ");
    result = result.replace(/\{\{condition_summary\}\}/g, summary || "conditions met");
  } catch {
    result = result.replace(/\{\{condition_summary\}\}/g, "conditions met");
  }

  // Response preview (first 200 chars)
  try {
    const preview = (args.responseData || "").substring(0, 200);
    result = result.replace(/\{\{response_preview\}\}/g, preview);
  } catch {
    result = result.replace(/\{\{response_preview\}\}/g, "");
  }

  return result;
}
