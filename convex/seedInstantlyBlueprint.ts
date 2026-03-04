/**
 * Seed Instantly.ai Blueprint
 *
 * Instantly is a cold email outreach platform for managing campaigns, leads, and analytics.
 * Auth: Bearer Token (API key) — passed as Authorization: Bearer <key>
 * Get your API key at: Settings → Integrations → API Key in Instantly app.
 * API docs: https://developer.instantly.ai/api/v2
 *
 * Usage:
 * npx convex run seedInstantlyBlueprint:seedInstantly --url https://beloved-squirrel-599.convex.cloud
 */

import { mutation } from "./_generated/server";

export const seedInstantly = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "instantly"))
      .first();

    if (existing) {
      return { message: "Instantly blueprint already exists", blueprintId: existing._id };
    }

    const authConfig = {
      headerName: "Authorization",
      headerPrefix: "Bearer ",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "instantly",
      name: "Instantly",
      description:
        "Cold email outreach platform for managing campaigns, leads, and email accounts. Create campaigns, add leads, and track performance analytics.",
      category: "Sales",
      version: 1,
      status: "active",
      authType: "bearer_token",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://api.instantly.ai/api/v2",
      defaultHeaders: JSON.stringify({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developer.instantly.ai/api/v2",
      iconUrl: "https://instantly.ai/favicon.ico",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_campaigns",
        displayName: "List Campaigns",
        description:
          "List all email campaigns in Instantly. Returns campaign names, IDs, statuses, and basic stats.",
        method: "GET" as const,
        path: "/campaigns",
        queryParams: JSON.stringify([
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Number of results to return (default 10, max 100)",
          },
          {
            name: "starting_after",
            type: "string",
            required: false,
            description: "Cursor for pagination — pass the last campaign ID from previous response",
          },
          {
            name: "status",
            type: "number",
            required: false,
            description: "Filter by status: 1=active, 2=paused, 3=completed",
          },
        ]),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "List available campaigns to find campaign IDs for adding leads or pulling analytics. Returns id, name, status for each campaign.",
        exampleArgs: JSON.stringify({ limit: 20 }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "create_campaign",
        displayName: "Create Campaign",
        description:
          "Create a new cold email campaign in Instantly with a name and schedule. Returns the campaign ID for adding leads.",
        method: "POST" as const,
        path: "/campaigns",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Campaign name (required)" },
            schedule_name: {
              type: "string",
              description: "Sending schedule name (default: 'Default Schedule')",
            },
            timezone: {
              type: "string",
              description: "Timezone for sending (e.g., 'America/New_York')",
            },
            daily_limit: {
              type: "number",
              description: "Max emails to send per day per email account",
            },
          },
        }),
        responseMapping: JSON.stringify({ dataField: "id" }),
        aiUsageHint:
          "Create a new email campaign. After creation, use add_leads to add prospects to it. Returns campaign ID. The campaign starts in draft state and must be activated manually or via the API.",
        exampleArgs: JSON.stringify({
          name: "Q1 Outreach - SaaS Founders",
          timezone: "America/New_York",
        }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "add_leads",
        displayName: "Add Leads to Campaign",
        description:
          "Add one or more leads (prospects) to an Instantly campaign. Each lead needs at least an email address. Supports custom variables for personalization.",
        method: "POST" as const,
        path: "/leads",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["campaign_id", "leads"],
          properties: {
            campaign_id: { type: "string", description: "Campaign ID to add leads to" },
            leads: {
              type: "array",
              description: "Array of leads to add (max 1000 per request)",
              items: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", description: "Lead email address (required)" },
                  first_name: { type: "string", description: "First name" },
                  last_name: { type: "string", description: "Last name" },
                  company_name: { type: "string", description: "Company name" },
                  website: { type: "string", description: "Company website" },
                  phone: { type: "string", description: "Phone number" },
                  personalization: {
                    type: "string",
                    description: "Personalized opening line for the email",
                  },
                  custom_variables: {
                    type: "object",
                    description: "Custom merge variables as key-value pairs",
                  },
                },
              },
            },
            skip_if_in_workspace: {
              type: "boolean",
              description: "Skip leads already in any campaign in this workspace",
            },
          },
        }),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Add prospects to an Instantly campaign. Pass campaign_id and an array of leads with at least email. Add personalization field for custom opening lines. Batch up to 1000 leads per call.",
        exampleArgs: JSON.stringify({
          campaign_id: "abc123",
          leads: [
            {
              email: "john.doe@example.com",
              first_name: "John",
              last_name: "Doe",
              company_name: "Acme Corp",
              personalization: "Loved your recent post about scaling B2B sales",
            },
          ],
        }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "list_leads",
        displayName: "List Campaign Leads",
        description:
          "List leads in a specific Instantly campaign with their email status (sent, opened, replied, bounced).",
        method: "GET" as const,
        path: "/leads",
        queryParams: JSON.stringify([
          {
            name: "campaign_id",
            type: "string",
            required: true,
            description: "Campaign ID to list leads for",
          },
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Number of results (default 10, max 100)",
          },
          {
            name: "starting_after",
            type: "string",
            required: false,
            description: "Cursor for pagination",
          },
          {
            name: "email",
            type: "string",
            required: false,
            description: "Filter by specific lead email",
          },
        ]),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Check the status of leads in a campaign — who has been emailed, opened, replied, or bounced. Use campaign_id to filter to a specific campaign.",
        exampleArgs: JSON.stringify({ campaign_id: "abc123", limit: 50 }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "get_campaign_analytics",
        displayName: "Get Campaign Analytics",
        description:
          "Get performance analytics for a campaign including emails sent, open rate, reply rate, bounce rate, and unsubscribes.",
        method: "GET" as const,
        path: "/analytics/campaign/summary",
        queryParams: JSON.stringify([
          {
            name: "id",
            type: "string",
            required: true,
            description: "Campaign ID to get analytics for",
          },
          {
            name: "start_date",
            type: "string",
            required: false,
            description: "Start date for analytics range (YYYY-MM-DD)",
          },
          {
            name: "end_date",
            type: "string",
            required: false,
            description: "End date for analytics range (YYYY-MM-DD)",
          },
        ]),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Pull campaign performance stats — sent count, open rate, reply rate, bounce rate. Use this to report on campaign effectiveness or identify underperforming campaigns.",
        exampleArgs: JSON.stringify({
          id: "abc123",
          start_date: "2025-01-01",
          end_date: "2025-12-31",
        }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "list_email_accounts",
        displayName: "List Email Accounts",
        description:
          "List email sending accounts connected to Instantly. Returns account health status and daily sending limits.",
        method: "GET" as const,
        path: "/email-accounts",
        queryParams: JSON.stringify([
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Number of results (default 10, max 100)",
          },
          {
            name: "status",
            type: "number",
            required: false,
            description: "Filter by status: 1=active, 0=inactive",
          },
        ]),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Check how many email accounts are connected and their health status. Useful for understanding sending capacity before launching a large campaign.",
        exampleArgs: JSON.stringify({ limit: 50 }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const tool of tools) {
      await ctx.db.insert("blueprintTools", {
        blueprintId,
        ...tool,
      });
    }

    console.log(`✅ Instantly blueprint created with ${tools.length} tools`);
    return { blueprintId, created: true };
  },
});
