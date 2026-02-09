import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
    return await ctx.db.insert("messages", {
      from: args.from,
      to: args.to,
      content: args.content,
      timestamp: Date.now(),
    });
  },
});
