import { query, mutation } from "./_generated/server";
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

/** List all squad messages (from all agents + human, where isSquadMessage is true) */
export const listSquadMessages = query({
  args: {},
  handler: async (ctx) => {
    // Get messages marked as squad messages
    const squadMessages = await ctx.db
      .query("messages")
      .withIndex("by_squad")
      .order("asc")
      .collect();
    // Filter to only those with isSquadMessage=true
    return squadMessages.filter((m) => m.isSquadMessage === true);
  },
});

export const send = mutation({
  args: {
    from: v.string(),
    to: v.string(),
    content: v.string(),
    isSquadMessage: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Squad messages route to Kaze
    const actualTo = args.to === "squad" ? "Kaze" : args.to;
    const id = await ctx.db.insert("messages", {
      from: args.from,
      to: actualTo,
      content: args.content,
      timestamp: Date.now(),
      ...(args.isSquadMessage || args.to === "squad" ? { isSquadMessage: true } : {}),
    });

    // When a human sends a message to an agent, wake that agent up
    if (args.from === "human") {
      const agentNames = ["Kaze", "Scout", "Forge", "Ghost", "Sentinel"];
      const wakeTarget = args.to === "squad" ? "Kaze" : args.to;
      if (agentNames.includes(wakeTarget)) {
        await ctx.scheduler.runAfter(0, internal.messageActions.wakeupForMessage, {
          agentName: wakeTarget,
          messageId: id,
        });
      }
    }

    return id;
  },
});

