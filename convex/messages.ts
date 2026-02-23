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
        await ctx.scheduler.runAfter(0, internal.messageActions.wakeupForMessage, {
          agentName: args.to,
          messageId: id,
        });
      }
    }

    return id;
  },
});

