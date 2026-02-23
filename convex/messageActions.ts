"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import crypto from "crypto";

export const wakeupForMessage = internalAction({
  args: {
    agentName: v.string(),
    messageId: v.id("messages"),
  },
  handler: async (_ctx, args) => {
    const webhookUrl = process.env.AGENT_WAKEUP_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log(`[Messages] AGENT_WAKEUP_WEBHOOK_URL not set, skipping wakeup for ${args.agentName}`);
      return;
    }

    const slugMap: Record<string, string> = {
      Kaze: "kaze", Scout: "scout", Forge: "forge", Ghost: "ghost",
    };
    const slug = slugMap[args.agentName];
    if (!slug) return;

    const payload = {
      agent: slug,
      agentName: args.agentName,
      taskId: args.messageId,
      reason: "direct_message",
      timestamp: Date.now(),
    };

    const webhookSecret = process.env.AGENT_WAKEUP_WEBHOOK_SECRET;
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (webhookSecret) {
      const signature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(payload))
        .digest("hex");
      headers["X-Webhook-Signature"] = signature;
    }

    try {
      await fetch(`${webhookUrl}/wake`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      console.log(`[Messages] Woke up ${args.agentName} for direct message ${args.messageId}`);
    } catch (err: any) {
      console.error(`[Messages] Failed to wake ${args.agentName}:`, err.message);
    }
  },
});
