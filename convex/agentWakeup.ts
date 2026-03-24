"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

/**
 * Agent Wakeup System
 *
 * Always sends the webhook to the wakeup server — the server handles dedup
 * itself (queues tasks if agent is already running, starts new session on exit).
 * This ensures zero task loss even at session boundaries.
 *
 * Activity log dedup: only logs `agent_wakeup` for STARTED results (new session),
 * not for QUEUED results, to keep the activity feed clean.
 *
 * Fallback: 10-minute sweep cron catches tasks if webhook fails entirely.
 */

const MAX_CONCURRENT_AGENTS = 4;

export const triggerWakeup = internalAction({
  args: {
    agentName: v.string(),
    taskId: v.string(),
    reason: v.optional(v.string()),
    isRetry: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Look up agent from DB for slug and role info
    const agent = await ctx.runQuery(internal.agents.internalGetByName, { name: args.agentName });
    const slug = agent?.slug ?? args.agentName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (!agent) {
      console.log(`[AgentWakeup] Agent "${args.agentName}" not found in DB, using derived slug: ${slug}`);
    }

    // Concurrency cap: skip wakeup if server already has enough agents running.
    // Agents with canBeThrottled=false (e.g. reviewers) bypass the cap.
    if (agent?.canBeThrottled !== false) {
      const { count, activeNames } = await ctx.runQuery(
        internal.agents.countActiveAgents
      );
      if (count >= MAX_CONCURRENT_AGENTS) {
        console.log(
          `[AgentWakeup] Concurrency cap (${count}/${MAX_CONCURRENT_AGENTS} active: ${activeNames.join(", ")}). ` +
          `Skipping ${args.agentName} for task ${args.taskId} — sweep retries in 2min.`
        );
        return;
      }
    }

    const webhookUrl = process.env.AGENT_WAKEUP_WEBHOOK_URL;
    const webhookSecret = process.env.AGENT_WAKEUP_WEBHOOK_SECRET;

    if (!webhookUrl) {
      console.log(`[AgentWakeup] AGENT_WAKEUP_WEBHOOK_URL not set, skipping wakeup for ${args.agentName}`);
      return;
    }

    const reason = args.reason || "task_assigned";
    console.log(`[AgentWakeup] Waking up ${args.agentName} for task ${args.taskId} (${reason})`);

    try {
      // Fetch task to include requiredUserId in payload so agents can substitute {TASK_USER_ID}
      let requiredUserId: string | undefined;
      try {
        const task = await ctx.runQuery(api.tasks.getById, { id: args.taskId as any });
        requiredUserId = (task as any)?.requiredUserId;
      } catch (_) { /* non-fatal — proceed without userId */ }

      const payload = {
        agent: slug,
        agentName: args.agentName,
        taskId: args.taskId,
        reason,
        userId: requiredUserId,
        timestamp: Date.now(),
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (webhookSecret) {
        const crypto = await import("crypto");
        const signature = crypto
          .createHmac("sha256", webhookSecret)
          .update(JSON.stringify(payload))
          .digest("hex");
        headers["X-Webhook-Signature"] = signature;
      }

      const response = await fetch(`${webhookUrl}/wake`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${responseText}`);
      }

      console.log(`[AgentWakeup] ${args.agentName}: ${responseText}`);

      // Only log activity for STARTED (new session), not QUEUED (reduces noise)
      const isStarted = responseText.includes("STARTED");
      if (isStarted) {
        try {
          await ctx.runMutation(api.activityFns.log, {
            agentName: args.agentName as any,
            action: "agent_wakeup",
            details: `Woke up for task: ${args.taskId}. ${responseText}`,
            taskId: args.taskId,
          });
        } catch (logErr: any) {
          console.error(`[AgentWakeup] Failed to log activity: ${logErr.message}`);
        }
      }
    } catch (error: any) {
      console.error(`[AgentWakeup] Failed to wake ${args.agentName}:`, error.message);

      try {
        await ctx.runMutation(api.activityFns.log, {
          agentName: args.agentName as any,
          action: "agent_wakeup_failed",
          details: `Failed to wake up: ${error.message}. Task ${args.taskId} — sweep cron will retry.`,
          taskId: args.taskId,
        });
      } catch (logErr: any) {
        console.error(`[AgentWakeup] Failed to log failure activity: ${logErr.message}`);
      }
      // Retry once after 30s if this wasn't already a retry
      if (!args.isRetry) {
        console.log(`[AgentWakeup] Scheduling retry for ${args.agentName} in 30s`);
        await ctx.scheduler.runAfter(30_000, internal.agentWakeup.triggerWakeup, {
          agentName: args.agentName,
          taskId: args.taskId,
          reason: args.reason,
          isRetry: true,
        });
      }
      // Beyond retry, sweep cron (every 2 min) is the final fallback
    }
  },
});
