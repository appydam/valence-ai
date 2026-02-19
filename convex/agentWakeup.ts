"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Agent Wakeup System
 *
 * Instead of polling via cron every 3 hours, agents wake up immediately
 * when a task is assigned to them.
 *
 * Flow:
 * 1. Task assigned to agent (create/update/claim mutation)
 * 2. Mutation schedules this action (0ms delay)
 * 3. Action calls HTTP webhook on Lightsail server
 * 4. Lightsail starts OpenClaw session for that agent
 * 5. Agent sends heartbeat, discovers task, works on it
 * 6. Agent goes idle after completing work
 */

const AGENT_SLUGS: Record<string, string> = {
  Kaze: "kaze",
  Scout: "scout",
  Forge: "forge",
  Ghost: "ghost",
};

/**
 * Wake up an agent by calling the webhook on the Lightsail server.
 * The webhook starts an OpenClaw session for the specified agent.
 */
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

    // Get webhook URL from env var
    const webhookUrl = process.env.AGENT_WAKEUP_WEBHOOK_URL;
    const webhookSecret = process.env.AGENT_WAKEUP_WEBHOOK_SECRET;

    if (!webhookUrl) {
      console.log(`[AgentWakeup] AGENT_WAKEUP_WEBHOOK_URL not set, skipping wakeup for ${args.agentName}`);
      return;
    }

    console.log(`[AgentWakeup] Waking up ${args.agentName} for task ${args.taskId} (${args.reason || "task_assigned"})`);

    try {
      const payload = {
        agent: slug,
        agentName: args.agentName,
        taskId: args.taskId,
        reason: args.reason || "task_assigned",
        timestamp: Date.now(),
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add HMAC signature if secret is configured
      if (webhookSecret) {
        const crypto = await import("crypto");
        const signature = crypto
          .createHmac("sha256", webhookSecret)
          .update(JSON.stringify(payload))
          .digest("hex");
        headers["X-Webhook-Signature"] = signature;
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${responseText}`);
      }

      console.log(`[AgentWakeup] ${args.agentName}: ${responseText}`);

      // Log the wakeup activity
      await ctx.runMutation(api.activity.create, {
        agentName: args.agentName as any,
        action: "agent_wakeup",
        details: `Woke up for task: ${args.taskId}. ${responseText}`,
        taskId: args.taskId,
      });
    } catch (error: any) {
      console.error(`[AgentWakeup] Failed to wake ${args.agentName}:`, error.message);

      // Log failure but don't throw — the task is still assigned,
      // the cron job will pick it up as a fallback
      await ctx.runMutation(api.activity.create, {
        agentName: args.agentName as any,
        action: "agent_wakeup_failed",
        details: `Failed to wake up: ${error.message}. Task ${args.taskId} is still assigned — cron fallback active.`,
        taskId: args.taskId,
      });
    }
  },
});
