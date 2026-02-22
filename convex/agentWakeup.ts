"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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

const AGENT_SLUGS: Record<string, string> = {
  Kaze: "kaze",
  Scout: "scout",
  Forge: "forge",
  Ghost: "ghost",
};

export const triggerWakeup = internalAction({
  args: {
    agentName: v.string(),
    taskId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const slug = AGENT_SLUGS[args.agentName];
    if (!slug) {
      console.log(`[AgentWakeup] Unknown agent: ${args.agentName}, skipping`);
      return;
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
      const payload = {
        agent: slug,
        agentName: args.agentName,
        taskId: args.taskId,
        reason,
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
      // No auto-retry — sweep cron (every 10 min) is the fallback
    }
  },
});
