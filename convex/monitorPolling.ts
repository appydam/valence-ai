// @ts-nocheck
"use node";

/**
 * Monitor Polling Engine
 * Runs every 2 minutes via cron, checks due monitors, evaluates conditions, fires actions.
 */

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

/**
 * Resolve a dot-notation path on an object.
 * Supports array indexing: "orders[0].status"
 */
function resolveField(obj: any, path: string): any {
  if (!obj || !path) return undefined;

  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }

  return current;
}

/**
 * Condition evaluation engine.
 * Evaluates an array of conditions against API response data.
 */
interface Condition {
  field: string;
  operator: string;
  value?: any;
}

interface ConditionResult {
  field: string;
  operator: string;
  expected: any;
  actual: any;
  passed: boolean;
}

function evaluateConditions(
  conditionsJson: string,
  data: any,
  previousSnapshot?: string
): { matched: boolean; results: ConditionResult[] } {
  try {
    const conditions: Condition[] = JSON.parse(conditionsJson);
    const results: ConditionResult[] = [];
    let allPassed = true;

    for (const cond of conditions) {
      const actual = resolveField(data, cond.field);
      let passed = false;

      switch (cond.operator) {
        case "gt":
          passed = typeof actual === "number" && actual > Number(cond.value);
          break;
        case "gte":
          passed = typeof actual === "number" && actual >= Number(cond.value);
          break;
        case "lt":
          passed = typeof actual === "number" && actual < Number(cond.value);
          break;
        case "lte":
          passed = typeof actual === "number" && actual <= Number(cond.value);
          break;
        case "eq":
          passed = actual == cond.value;
          break;
        case "neq":
          passed = actual != cond.value;
          break;
        case "contains":
          if (typeof actual === "string") {
            passed = actual.includes(String(cond.value));
          } else if (Array.isArray(actual)) {
            passed = actual.includes(cond.value);
          }
          break;
        case "not_contains":
          if (typeof actual === "string") {
            passed = !actual.includes(String(cond.value));
          } else if (Array.isArray(actual)) {
            passed = !actual.includes(cond.value);
          } else {
            passed = true;
          }
          break;
        case "exists":
          passed = actual !== null && actual !== undefined;
          break;
        case "changed": {
          if (!previousSnapshot) {
            // First run — no previous data to compare, don't trigger
            passed = false;
          } else {
            try {
              const prev = JSON.parse(previousSnapshot);
              const prevValue = resolveField(prev, cond.field);
              passed = JSON.stringify(actual) !== JSON.stringify(prevValue);
            } catch {
              passed = false;
            }
          }
          break;
        }
        default:
          passed = false;
      }

      results.push({
        field: cond.field,
        operator: cond.operator,
        expected: cond.value,
        actual,
        passed,
      });

      if (!passed) allPassed = false;
    }

    return { matched: allPassed && conditions.length > 0, results };
  } catch {
    return { matched: false, results: [] };
  }
}

/**
 * Truncate a JSON string to maxBytes
 */
function truncateJson(data: any, maxBytes: number): string {
  const str = JSON.stringify(data);
  if (str.length <= maxBytes) return str;
  return str.substring(0, maxBytes);
}

/**
 * Main polling loop — called by cron every 2 minutes.
 * Finds due monitors and fans out individual checks.
 */
export const pollDue = internalAction({
  args: {},
  handler: async (ctx) => {
    const dueMonitors = await ctx.runQuery(api.monitors.getDueMonitors, {});

    if (dueMonitors.length === 0) return;

    console.log(`[MonitorPolling] ${dueMonitors.length} monitor(s) due`);

    // Fan out each monitor check to run in parallel
    for (const monitor of dueMonitors) {
      await ctx.scheduler.runAfter(0, internal.monitorPolling.checkSingleMonitor, {
        monitorId: monitor._id,
        monitorName: monitor.name,
        userId: monitor.userId,
        blueprintSlug: monitor.blueprintSlug,
        toolName: monitor.toolName,
        toolArgs: monitor.toolArgs || "{}",
        conditions: monitor.conditions,
        actionType: monitor.actionType,
        actionConfig: monitor.actionConfig,
        previousSnapshot: monitor.lastSnapshot,
      });
    }
  },
});

/**
 * Check a single monitor: call API, evaluate conditions, fire action if matched.
 */
export const checkSingleMonitor = internalAction({
  args: {
    monitorId: v.id("monitors"),
    monitorName: v.optional(v.string()),
    userId: v.string(),
    blueprintSlug: v.string(),
    toolName: v.string(),
    toolArgs: v.string(),
    conditions: v.string(),
    actionType: v.string(),
    actionConfig: v.string(),
    previousSnapshot: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // 1. Call the integration API
      const toolArgs = JSON.parse(args.toolArgs);

      const result = await ctx.runAction(api.executionEngine.executeTool, {
        userId: args.userId,
        agentName: "Monitor",
        blueprintSlug: args.blueprintSlug,
        toolName: args.toolName,
        toolArgs,
      });

      if (!result.success) {
        // API call failed
        console.log(`[MonitorPolling] API error for ${args.monitorId}: ${result.error}`);

        await ctx.runMutation(internal.monitors.storeEvent, {
          monitorId: args.monitorId,
          userId: args.userId,
          eventType: "error",
          errorMessage: result.error || "API call failed",
        });

        await ctx.runMutation(internal.monitors.updateAfterCheck, {
          monitorId: args.monitorId,
          success: false,
          triggered: false,
          error: result.error || "API call failed",
        });
        return;
      }

      // 2. Evaluate conditions
      const { matched, results } = evaluateConditions(
        args.conditions,
        result.result,
        args.previousSnapshot
      );

      const snapshot = truncateJson(result.result, 10000);
      const responsePreview = truncateJson(result.result, 5000);

      if (matched) {
        // 3. Conditions met — fire action
        console.log(`[MonitorPolling] Monitor ${args.monitorId} TRIGGERED`);

        try {
          const actionResult = await ctx.runAction(
            internal.monitorActions.executeMonitorAction,
            {
              monitorId: args.monitorId,
              monitorName: args.monitorName || "",
              userId: args.userId,
              actionType: args.actionType,
              actionConfig: args.actionConfig,
              conditionResults: JSON.stringify(results),
              responseData: responsePreview,
            }
          );

          await ctx.runMutation(internal.monitors.storeEvent, {
            monitorId: args.monitorId,
            userId: args.userId,
            eventType: "triggered",
            responseSnapshot: responsePreview,
            conditionResults: JSON.stringify(results),
            actionResult: JSON.stringify(actionResult),
          });
        } catch (actionError: any) {
          console.error(`[MonitorPolling] Action failed for ${args.monitorId}:`, actionError.message);

          await ctx.runMutation(internal.monitors.storeEvent, {
            monitorId: args.monitorId,
            userId: args.userId,
            eventType: "action_failed",
            responseSnapshot: responsePreview,
            conditionResults: JSON.stringify(results),
            errorMessage: actionError.message,
          });
        }

        await ctx.runMutation(internal.monitors.updateAfterCheck, {
          monitorId: args.monitorId,
          success: true,
          triggered: true,
          snapshot,
        });
      } else {
        // Conditions not met — log check_ok
        await ctx.runMutation(internal.monitors.storeEvent, {
          monitorId: args.monitorId,
          userId: args.userId,
          eventType: "check_ok",
          responseSnapshot: responsePreview,
          conditionResults: JSON.stringify(results),
        });

        await ctx.runMutation(internal.monitors.updateAfterCheck, {
          monitorId: args.monitorId,
          success: true,
          triggered: false,
          snapshot,
        });
      }
    } catch (error: any) {
      console.error(`[MonitorPolling] Unexpected error for ${args.monitorId}:`, error.message);

      await ctx.runMutation(internal.monitors.storeEvent, {
        monitorId: args.monitorId,
        userId: args.userId,
        eventType: "error",
        errorMessage: error.message,
      });

      await ctx.runMutation(internal.monitors.updateAfterCheck, {
        monitorId: args.monitorId,
        success: false,
        triggered: false,
        error: error.message,
      });
    }
  },
});
