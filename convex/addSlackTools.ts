/**
 * Add missing Slack tools for full messaging capability:
 * - read_channel_messages  (channels:history)
 * - read_dm_messages       (im:history)
 * - open_dm                (im:open — start a new DM conversation)
 * - invite_to_channel      (channels:manage)
 * - get_channel_info       (channels:read)
 * - add_reaction           (reactions:write)
 *
 * Run: npx convex run addSlackTools
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const blueprint = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "slack"))
      .first();

    if (!blueprint) return { error: "Slack blueprint not found" };

    const now = Date.now();

    const newTools = [
      {
        name: "read_channel_messages",
        displayName: "Read Channel Messages",
        description: "Read recent messages from a Slack channel. Requires channels:history scope.",
        method: "GET" as const,
        path: "/conversations.history",
        queryParams: JSON.stringify([
          { name: "channel", type: "string", required: true, description: "Channel ID (e.g. C0AEYLXQHBR)" },
          { name: "limit", type: "number", description: "Number of messages to return (default 20, max 100)", default: 20 },
          { name: "oldest", type: "string", description: "Only return messages after this Unix timestamp" },
          { name: "latest", type: "string", description: "Only return messages before this Unix timestamp" },
        ]),
        aiUsageHint: "Read messages from a channel. Pass channel ID from list_channels. Use limit to control how many messages to fetch.",
        exampleArgs: JSON.stringify({ channel: "C0AEYLXQHBR", limit: 20 }),
      },
      {
        name: "read_dm_messages",
        displayName: "Read DM Messages",
        description: "Read recent messages from a direct message conversation. Requires im:history scope.",
        method: "GET" as const,
        path: "/conversations.history",
        queryParams: JSON.stringify([
          { name: "channel", type: "string", required: true, description: "DM channel ID (starts with D, get from open_dm)" },
          { name: "limit", type: "number", description: "Number of messages to return (default 20)", default: 20 },
        ]),
        aiUsageHint: "Read DM messages. First call open_dm to get the DM channel ID, then pass it here.",
        exampleArgs: JSON.stringify({ channel: "D0AFAPPSZC5", limit: 20 }),
      },
      {
        name: "open_dm",
        displayName: "Open DM Conversation",
        description: "Open or get an existing DM conversation with a user. Returns the DM channel ID needed for send_dm and read_dm_messages.",
        method: "POST" as const,
        path: "/conversations.open",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["users"],
          properties: {
            users: { type: "string", description: "Comma-separated user IDs to open DM with (e.g. U0AFC2VQYTY)" },
          },
        }),
        aiUsageHint: "Start a new DM or get existing DM channel ID. Pass user ID from get_users. Returns channel.id to use with send_dm.",
        exampleArgs: JSON.stringify({ users: "U0AFC2VQYTY" }),
      },
      {
        name: "invite_to_channel",
        displayName: "Invite User to Channel",
        description: "Invite one or more users to a channel. Requires channels:manage scope.",
        method: "POST" as const,
        path: "/conversations.invite",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["channel", "users"],
          properties: {
            channel: { type: "string", description: "Channel ID to invite users to" },
            users: { type: "string", description: "Comma-separated user IDs to invite" },
          },
        }),
        aiUsageHint: "Invite users to a channel. Use channel ID from list_channels and user ID from get_users.",
        exampleArgs: JSON.stringify({ channel: "C0AGFS0ENSD", users: "U0AFC2VQYTY" }),
      },
      {
        name: "get_channel_info",
        displayName: "Get Channel Info",
        description: "Get detailed information about a specific channel including member count, topic, purpose.",
        method: "GET" as const,
        path: "/conversations.info",
        queryParams: JSON.stringify([
          { name: "channel", type: "string", required: true, description: "Channel ID" },
        ]),
        aiUsageHint: "Get channel details. Useful to check if a channel exists or get its topic/purpose before posting.",
        exampleArgs: JSON.stringify({ channel: "C0AGFS0ENSD" }),
      },
      {
        name: "add_reaction",
        displayName: "Add Reaction",
        description: "Add an emoji reaction to a message. Requires reactions:write scope.",
        method: "POST" as const,
        path: "/reactions.add",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["channel", "timestamp", "name"],
          properties: {
            channel: { type: "string", description: "Channel ID containing the message" },
            timestamp: { type: "string", description: "Message timestamp (ts field from message)" },
            name: { type: "string", description: "Emoji name without colons (e.g. thumbsup, rocket, white_check_mark)" },
          },
        }),
        aiUsageHint: "React to a message with an emoji. Get the ts from read_channel_messages or send_message response.",
        exampleArgs: JSON.stringify({ channel: "C0AGFS0ENSD", timestamp: "1771554056.586349", name: "rocket" }),
      },
    ];

    const created = [];
    const skipped = [];

    for (const tool of newTools) {
      const existing = await ctx.db
        .query("blueprintTools")
        .withIndex("by_blueprint", (q) => q.eq("blueprintId", blueprint._id))
        .filter((q) => q.eq(q.field("name"), tool.name))
        .first();

      if (existing) {
        skipped.push(tool.name);
        continue;
      }

      await ctx.db.insert("blueprintTools", {
        ...tool,
        blueprintId: blueprint._id,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      created.push(tool.name);
    }

    // Update scopes to include channels:history, im:history, reactions:write
    const authConfig = JSON.parse(blueprint.authConfig);
    const currentScopes: string[] = authConfig.scopes || [];
    const newScopes = ["channels:history", "im:history", "reactions:write", "groups:history", "groups:read", "groups:write"];
    const missingScopes = newScopes.filter(s => !currentScopes.includes(s));

    if (missingScopes.length > 0) {
      authConfig.scopes = [...currentScopes, ...missingScopes];
      await ctx.db.patch(blueprint._id, {
        authConfig: JSON.stringify(authConfig),
        updatedAt: now,
      });
    }

    return {
      message: "✅ Slack tools updated",
      toolsCreated: created,
      toolsSkipped: skipped,
      scopesAdded: missingScopes,
      totalScopes: authConfig.scopes,
    };
  },
});
