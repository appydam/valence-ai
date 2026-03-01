/**
 * Seed Mailchimp integration blueprint
 *
 * Note: Mailchimp's API base URL is datacenter-specific (e.g. https://us6.api.mailchimp.com/3.0/).
 * After OAuth, you must call the metadata endpoint to discover the user's datacenter.
 * Mailchimp does NOT use scopes — the token grants full account access.
 *
 * Usage:
 * npx convex run seedMailchimpBlueprint --url https://beloved-squirrel-599.convex.cloud
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "mailchimp"))
      .first();

    if (existing) {
      return { message: "Mailchimp blueprint already exists", blueprintId: existing._id };
    }

    const authConfig = {
      clientId: process.env.MAILCHIMP_CLIENT_ID || "YOUR_MAILCHIMP_CLIENT_ID",
      clientSecret: "OAUTH_SECRET_MAILCHIMP",
      authorizeUrl: "https://login.mailchimp.com/oauth2/authorize",
      tokenUrl: "https://login.mailchimp.com/oauth2/token",
      scopes: [],
      scopeSeparator: "space",
      tokenEndpointAuth: "body",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "mailchimp",
      name: "Mailchimp",
      description: "Email marketing platform — manage audiences, subscribers, campaigns, and automations. Send newsletters and track engagement.",
      category: "marketing",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://us1.api.mailchimp.com/3.0",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      sourceType: "manual",
      sourceUrl: "https://mailchimp.com/developer/marketing/api/",
      iconUrl: "https://cdn.simpleicons.org/mailchimp/FFE01B",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_audiences",
        displayName: "List Audiences",
        description: "List all audiences (mailing lists) in your Mailchimp account",
        method: "GET" as const,
        path: "/lists",
        queryParams: JSON.stringify([
          { name: "count", type: "number", description: "Number of results (max 1000)", default: 10 },
          { name: "offset", type: "number", description: "Pagination offset", default: 0 },
        ]),
        aiUsageHint: "List all mailing lists/audiences. Each audience has subscribers.",
        exampleArgs: JSON.stringify({ count: 10 }),
      },
      {
        name: "list_members",
        displayName: "List Subscribers",
        description: "List subscribers in an audience",
        method: "GET" as const,
        path: "/lists/{list_id}/members",
        pathParams: JSON.stringify([
          { name: "list_id", type: "string", required: true, description: "Audience/list ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "status", type: "string", description: "subscribed, unsubscribed, cleaned, pending, transactional" },
          { name: "count", type: "number", default: 10 },
          { name: "offset", type: "number", default: 0 },
        ]),
        aiUsageHint: "List subscribers in a specific audience. Filter by status.",
        exampleArgs: JSON.stringify({ list_id: "abc123", status: "subscribed", count: 50 }),
      },
      {
        name: "add_member",
        displayName: "Add Subscriber",
        description: "Add a new subscriber to an audience",
        method: "POST" as const,
        path: "/lists/{list_id}/members",
        pathParams: JSON.stringify([
          { name: "list_id", type: "string", required: true, description: "Audience/list ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["email_address", "status"],
          properties: {
            email_address: { type: "string", description: "Subscriber email" },
            status: { type: "string", description: "subscribed, unsubscribed, cleaned, pending" },
            merge_fields: { type: "object", description: "Merge fields like FNAME, LNAME" },
            tags: { type: "array", items: { type: "string" }, description: "Tags to assign" },
          },
        }),
        aiUsageHint: "Add a subscriber. Use status='subscribed' for direct add, 'pending' for double opt-in.",
        exampleArgs: JSON.stringify({
          list_id: "abc123",
          email_address: "user@example.com",
          status: "subscribed",
          merge_fields: { FNAME: "John", LNAME: "Doe" },
        }),
      },
      {
        name: "list_campaigns",
        displayName: "List Campaigns",
        description: "List email campaigns",
        method: "GET" as const,
        path: "/campaigns",
        queryParams: JSON.stringify([
          { name: "status", type: "string", description: "save, paused, schedule, sending, sent" },
          { name: "type", type: "string", description: "regular, plaintext, absplit, rss, variate" },
          { name: "count", type: "number", default: 10 },
          { name: "offset", type: "number", default: 0 },
        ]),
        aiUsageHint: "List email campaigns. Filter by status (sent, save, etc.).",
        exampleArgs: JSON.stringify({ status: "sent", count: 20 }),
      },
      {
        name: "create_campaign",
        displayName: "Create Campaign",
        description: "Create a new email campaign",
        method: "POST" as const,
        path: "/campaigns",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["type", "recipients", "settings"],
          properties: {
            type: { type: "string", description: "regular, plaintext, absplit, rss, variate" },
            recipients: { type: "object", properties: { list_id: { type: "string" } } },
            settings: {
              type: "object",
              properties: {
                subject_line: { type: "string" },
                from_name: { type: "string" },
                reply_to: { type: "string" },
              },
            },
          },
        }),
        aiUsageHint: "Create a campaign draft. Must specify type, recipients.list_id, and settings (subject, from_name, reply_to).",
        exampleArgs: JSON.stringify({
          type: "regular",
          recipients: { list_id: "abc123" },
          settings: { subject_line: "Monthly Newsletter", from_name: "Mission Control", reply_to: "hello@example.com" },
        }),
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
      message: "Mailchimp blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Register app at https://admin.mailchimp.com/account/oauth2/",
        "2. Set redirect URI to: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "3. npx convex env set MAILCHIMP_CLIENT_ID '<client_id>' --url https://beloved-squirrel-599.convex.cloud",
        "4. npx convex env set OAUTH_SECRET_MAILCHIMP '<client_secret>' --url https://beloved-squirrel-599.convex.cloud",
      ],
    };
  },
});
