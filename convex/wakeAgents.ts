"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";

/**
 * Internal action to wake agents via agent-wakeup-server
 * Requires "use node" for crypto HMAC signature
 */
export const wakeAgentsInternal = internalAction({
  args: {
    agentsWithTasks: v.array(v.object({
      name: v.string(),
      currentTaskId: v.string(),
    })),
    wakeupUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const WEBHOOK_SECRET = process.env.AGENT_WAKEUP_WEBHOOK_SECRET || "";
    const wakeResults = [];

    for (const agent of args.agentsWithTasks) {
      try {
        const payload = {
          agent: agent.name.toLowerCase(),
          taskId: agent.currentTaskId,
          reason: "wake_button_click"
        };
        const body = JSON.stringify(payload);

        // Calculate HMAC signature if webhook secret is set
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (WEBHOOK_SECRET) {
          const crypto = await import("node:crypto");
          const signature = crypto
            .createHmac("sha256", WEBHOOK_SECRET)
            .update(body)
            .digest("hex");
          headers["X-Webhook-Signature"] = signature;
        }

        const response = await fetch(`${args.wakeupUrl}/wake`, {
          method: "POST",
          headers,
          body,
        });

        const result = await response.json();
        wakeResults.push({
          agent: agent.name,
          success: response.ok,
          message: result.message || result.error,
        });
      } catch (error: any) {
        wakeResults.push({
          agent: agent.name,
          success: false,
          message: `Failed to reach agent-wakeup-server: ${error.message}`,
        });
      }
    }

    return wakeResults;
  },
});
