/**
 * Seed Microsoft Teams integration blueprint
 * Run this once to create the Microsoft Teams blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedMicrosoftTeamsBlueprint -> Run
 *
 * Prerequisites:
 * - Register an app at https://portal.azure.com/ → Azure Active Directory → App registrations
 * - Set OAUTH_SECRET_MICROSOFT_TEAMS env var in Convex dashboard
 * - API: Microsoft Graph API (graph.microsoft.com)
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "microsoft-teams"))
      .first();

    if (existing) {
      return {
        message: "Microsoft Teams blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "microsoft-teams",
      name: "Microsoft Teams",
      description:
        "Enterprise communication platform. Send messages to channels and chats, list teams and channels, manage members, and retrieve conversation history via Microsoft Graph API.",
      category: "communication",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "",
        clientSecret: "OAUTH_SECRET_MICROSOFT_TEAMS",
        authorizeUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        scopes: [
          "https://graph.microsoft.com/Team.ReadBasic.All",
          "https://graph.microsoft.com/Channel.ReadBasic.All",
          "https://graph.microsoft.com/ChannelMessage.Read.All",
          "https://graph.microsoft.com/ChannelMessage.Send",
          "https://graph.microsoft.com/Chat.ReadWrite",
          "https://graph.microsoft.com/TeamMember.Read.All",
          "https://graph.microsoft.com/User.Read",
          "offline_access",
        ],
        scopeSeparator: "space",
        extraAuthParams: { response_mode: "query" },
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://graph.microsoft.com/v1.0",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://learn.microsoft.com/en-us/graph/api/resources/teams-api-overview",
      iconUrl: "https://cdn.simpleicons.org/microsoftteams/6264A7",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_teams",
        displayName: "List Teams",
        description: "List all Microsoft Teams the authenticated user is a member of.",
        method: "GET" as const,
        path: "/me/joinedTeams",
        queryParams: JSON.stringify([
          { name: "$select", type: "string", description: "Fields to return", default: "id,displayName,description" },
          { name: "$top", type: "number", description: "Max results", default: 50 },
        ]),
        aiUsageHint: "List all Teams the user belongs to. Call this first to get team IDs for other operations.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "get_team",
        displayName: "Get Team",
        description: "Get details of a specific Microsoft Team by ID.",
        method: "GET" as const,
        path: "/teams/{team-id}",
        pathParams: JSON.stringify([
          { name: "team-id", type: "string", required: true, description: "Team ID (GUID)" },
        ]),
        aiUsageHint: "Get details of a Microsoft Team including description and settings.",
        exampleArgs: JSON.stringify({ "team-id": "TEAM_ID_GUID" }),
      },
      {
        name: "list_channels",
        displayName: "List Channels",
        description: "List all channels in a Microsoft Team.",
        method: "GET" as const,
        path: "/teams/{team-id}/channels",
        pathParams: JSON.stringify([
          { name: "team-id", type: "string", required: true, description: "Team ID (GUID)" },
        ]),
        queryParams: JSON.stringify([
          { name: "$select", type: "string", default: "id,displayName,description,membershipType" },
          { name: "$filter", type: "string", description: "OData filter, e.g. membershipType eq 'standard'" },
        ]),
        aiUsageHint: "List channels in a Teams team. Filter by membershipType eq 'standard' for regular channels.",
        exampleArgs: JSON.stringify({ "team-id": "TEAM_ID_GUID" }),
      },
      {
        name: "get_channel",
        displayName: "Get Channel",
        description: "Get details of a specific channel in a Microsoft Team.",
        method: "GET" as const,
        path: "/teams/{team-id}/channels/{channel-id}",
        pathParams: JSON.stringify([
          { name: "team-id", type: "string", required: true, description: "Team ID" },
          { name: "channel-id", type: "string", required: true, description: "Channel ID" },
        ]),
        aiUsageHint: "Get details of a specific Teams channel.",
        exampleArgs: JSON.stringify({ "team-id": "TEAM_ID", "channel-id": "CHANNEL_ID" }),
      },
      {
        name: "send_message",
        displayName: "Send Channel Message",
        description: "Send a message to a Microsoft Teams channel.",
        method: "POST" as const,
        path: "/teams/{team-id}/channels/{channel-id}/messages",
        pathParams: JSON.stringify([
          { name: "team-id", type: "string", required: true, description: "Team ID" },
          { name: "channel-id", type: "string", required: true, description: "Channel ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["body"],
          properties: {
            body: {
              type: "object",
              required: ["content"],
              properties: {
                contentType: { type: "string", enum: ["text", "html"], default: "text", description: "Message format" },
                content: { type: "string", description: "Message content" },
              },
            },
            subject: { type: "string", description: "Optional message subject (shown as thread title)" },
            importance: { type: "string", enum: ["normal", "high", "urgent"], default: "normal" },
          },
        }),
        aiUsageHint: "Send a message to a Teams channel. Use contentType='html' for formatted messages. Use contentType='text' for plain text.",
        exampleArgs: JSON.stringify({
          "team-id": "TEAM_ID",
          "channel-id": "CHANNEL_ID",
          body: { contentType: "text", content: "Hello team! The Q1 report is ready for review." },
        }),
      },
      {
        name: "list_messages",
        displayName: "List Channel Messages",
        description: "List recent messages from a Microsoft Teams channel.",
        method: "GET" as const,
        path: "/teams/{team-id}/channels/{channel-id}/messages",
        pathParams: JSON.stringify([
          { name: "team-id", type: "string", required: true, description: "Team ID" },
          { name: "channel-id", type: "string", required: true, description: "Channel ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "$top", type: "number", description: "Max messages to return", default: 20 },
          { name: "$select", type: "string", default: "id,body,from,createdDateTime,importance" },
        ]),
        aiUsageHint: "Retrieve recent messages from a Teams channel. Returns message content, sender, and timestamp.",
        exampleArgs: JSON.stringify({ "team-id": "TEAM_ID", "channel-id": "CHANNEL_ID", "$top": 20 }),
      },
      {
        name: "create_channel",
        displayName: "Create Channel",
        description: "Create a new channel in a Microsoft Team.",
        method: "POST" as const,
        path: "/teams/{team-id}/channels",
        pathParams: JSON.stringify([
          { name: "team-id", type: "string", required: true, description: "Team ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["displayName"],
          properties: {
            displayName: { type: "string", description: "Channel name" },
            description: { type: "string", description: "Channel description" },
            membershipType: { type: "string", enum: ["standard", "private"], default: "standard" },
          },
        }),
        aiUsageHint: "Create a new Teams channel. Use membershipType='private' for invite-only channels.",
        exampleArgs: JSON.stringify({ "team-id": "TEAM_ID", displayName: "Q2 Planning", description: "Channel for Q2 planning discussions" }),
      },
      {
        name: "list_members",
        displayName: "List Team Members",
        description: "List all members of a Microsoft Team.",
        method: "GET" as const,
        path: "/teams/{team-id}/members",
        pathParams: JSON.stringify([
          { name: "team-id", type: "string", required: true, description: "Team ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "$select", type: "string", default: "id,displayName,email,roles" },
        ]),
        aiUsageHint: "List members of a Teams team. Returns names, emails, and roles (owner/member).",
        exampleArgs: JSON.stringify({ "team-id": "TEAM_ID" }),
      },
      {
        name: "list_chats",
        displayName: "List Chats",
        description: "List personal/group chats the authenticated user is part of.",
        method: "GET" as const,
        path: "/me/chats",
        queryParams: JSON.stringify([
          { name: "$select", type: "string", default: "id,topic,chatType,lastUpdatedDateTime" },
          { name: "$top", type: "number", default: 20 },
          { name: "$expand", type: "string", description: "Expand related entities, e.g. members" },
        ]),
        aiUsageHint: "List Teams personal and group chats the user is in. Use chatType filter: 'oneOnOne', 'group', 'meeting'.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "send_chat_message",
        displayName: "Send Chat Message",
        description: "Send a message to a Teams personal or group chat.",
        method: "POST" as const,
        path: "/chats/{chat-id}/messages",
        pathParams: JSON.stringify([
          { name: "chat-id", type: "string", required: true, description: "Chat ID from list_chats" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["body"],
          properties: {
            body: {
              type: "object",
              required: ["content"],
              properties: {
                contentType: { type: "string", enum: ["text", "html"], default: "text" },
                content: { type: "string", description: "Message content" },
              },
            },
          },
        }),
        aiUsageHint: "Send a message to a Teams personal or group chat. Use list_chats to find the chat ID first.",
        exampleArgs: JSON.stringify({ "chat-id": "CHAT_ID", body: { contentType: "text", content: "Hey, are you available for a quick call?" } }),
      },
    ];

    const toolIds = [];
    for (const tool of tools) {
      const toolId = await ctx.db.insert("blueprintTools", {
        ...tool,
        blueprintId,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      toolIds.push(toolId);
    }

    return {
      message: "✅ Microsoft Teams blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Register app at https://portal.azure.com/ → Azure Active Directory → App registrations",
        "2. Add Microsoft Graph API permissions (delegated): Team.ReadBasic.All, Channel.ReadBasic.All, ChannelMessage.Send, Chat.ReadWrite",
        "3. Set OAUTH_SECRET_MICROSOFT_TEAMS in Convex environment variables",
        "4. Uses 'common' tenant — works for any Microsoft organization",
      ],
    };
  },
});
