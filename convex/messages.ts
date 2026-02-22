import { query, mutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const listByConversation = query({
  args: {
    agentName: v.string(),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_timestamp")
      .order("asc")
      .collect();
    return allMessages.filter(
      (m) =>
        (m.from === "human" && m.to === args.agentName) ||
        (m.from === args.agentName && m.to === "human")
    );
  },
});

export const send = mutation({
  args: {
    from: v.string(),
    to: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("messages", {
      from: args.from,
      to: args.to,
      content: args.content,
      timestamp: Date.now(),
    });

    // When a human sends a message to an agent, wake that agent up
    if (args.from === "human") {
      const agentNames = ["Kaze", "Scout", "Forge", "Ghost"];
      if (agentNames.includes(args.to)) {
        await ctx.scheduler.runAfter(0, internal.messages.wakeupForMessage, {
          agentName: args.to,
          messageId: id,
        });
      }
    }

    return id;
  },
});

export const wakeupForMessage = internalAction({
  args: {
    agentName: v.string(),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
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

    try {
      await fetch(`${webhookUrl}/wake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log(`[Messages] Woke up ${args.agentName} for direct message ${args.messageId}`);
    } catch (err: any) {
      console.error(`[Messages] Failed to wake ${args.agentName}:`, err.message);
    }
  },
});
