/**
 * Seed Smartlead.ai Blueprint
 *
 * Smartlead is a cold email platform for agencies and teams managing campaigns, leads, and email accounts.
 * Auth: API key passed as query parameter (?api_key=yourkey)
 * Get your API key at: Settings → API Key in Smartlead app.
 * API docs: https://api.smartlead.ai/reference/
 * Rate limit: 60 requests per 60 seconds per API key.
 *
 * Usage:
 * npx convex run seedSmartleadBlueprint:seedSmartlead --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { mutation } from "./_generated/server";

export const seedSmartlead = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "smartlead"))
      .first();

    if (existing) {
      return { message: "Smartlead blueprint already exists", blueprintId: existing._id };
    }

    const authConfig = {
      queryParam: "api_key",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "smartlead",
      name: "Smartlead",
      description:
        "Cold email outreach platform for agencies. Manage campaigns, leads, email accounts, and analytics. Supports unlimited email warmup and multi-client management.",
      category: "Sales",
      version: 1,
      status: "active",
      authType: "api_key",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://server.smartlead.ai/api/v1",
      defaultHeaders: JSON.stringify({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://api.smartlead.ai/reference/",
      iconUrl: "https://smartlead.ai/favicon.ico",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_campaigns",
        displayName: "List Campaigns",
        description:
          "List all email campaigns in Smartlead. Returns campaign names, IDs, statuses, and schedule info.",
        method: "GET" as const,
        path: "/campaigns",
        queryParams: JSON.stringify([
          {
            name: "offset",
            type: "number",
            required: false,
            description: "Pagination offset (default 0)",
          },
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Number of results to return (default 100)",
          },
        ]),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "List available campaigns to find campaign IDs for adding leads or pulling analytics. Returns id, name, status for each campaign.",
        exampleArgs: JSON.stringify({ limit: 50, offset: 0 }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "create_campaign",
        displayName: "Create Campaign",
        description:
          "Create a new cold email campaign in Smartlead with a name, timezone, and schedule. Returns the campaign ID for adding leads and email accounts.",
        method: "POST" as const,
        path: "/campaigns/create",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Campaign name (required)" },
            client_id: {
              type: "number",
              description: "Client ID to assign campaign to (for agency accounts)",
            },
            time_zone: {
              type: "string",
              description: "Timezone for sending (e.g., 'America/New_York'). Default: UTC",
            },
            days_of_the_week: {
              type: "array",
              items: { type: "number" },
              description: "Days to send: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun",
            },
            start_hour: {
              type: "string",
              description: "Daily start time in HH:MM format (e.g., '08:00')",
            },
            end_hour: {
              type: "string",
              description: "Daily end time in HH:MM format (e.g., '18:00')",
            },
            min_time_btwn_emails: {
              type: "number",
              description: "Minimum minutes between emails sent from same account",
            },
            max_new_leads_per_day: {
              type: "number",
              description: "Max new leads to contact per day",
            },
            track_settings: {
              type: "array",
              items: { type: "string" },
              description: "Tracking settings: ['DONT_TRACK_EMAIL_OPEN', 'DONT_TRACK_LINK_CLICK']",
            },
          },
        }),
        responseMapping: JSON.stringify({ dataField: "id" }),
        aiUsageHint:
          "Create a new email campaign. After creation, use add_leads_to_campaign to add prospects. Returns the campaign ID. Set time_zone and days_of_the_week for proper scheduling.",
        exampleArgs: JSON.stringify({
          name: "Q1 Outreach - SaaS Founders",
          time_zone: "America/New_York",
          days_of_the_week: [1, 2, 3, 4, 5],
          start_hour: "09:00",
          end_hour: "17:00",
        }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "add_leads_to_campaign",
        displayName: "Add Leads to Campaign",
        description:
          "Add leads (prospects) to a Smartlead campaign. Each lead needs at least an email. Supports custom variables for personalization.",
        method: "POST" as const,
        path: "/campaigns/{campaign_id}/leads",
        pathParams: JSON.stringify([
          { name: "campaign_id", type: "number", required: true, description: "Campaign ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["lead_list"],
          properties: {
            lead_list: {
              type: "array",
              description: "Array of leads to add",
              items: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", description: "Lead email address (required)" },
                  first_name: { type: "string", description: "First name" },
                  last_name: { type: "string", description: "Last name" },
                  company_name: { type: "string", description: "Company name" },
                  location: { type: "string", description: "Location (city/country)" },
                  custom_fields: {
                    type: "object",
                    description: "Custom personalization variables as key-value pairs",
                  },
                },
              },
            },
            settings: {
              type: "object",
              description: "Import settings",
              properties: {
                ignore_global_block_list: {
                  type: "boolean",
                  description: "Ignore workspace-level block list",
                },
                ignore_unsubscribe_list: {
                  type: "boolean",
                  description: "Ignore unsubscribe list",
                },
                ignore_duplicate_leads_in_other_campaign: {
                  type: "boolean",
                  description: "Allow leads already in another campaign",
                },
              },
            },
          },
        }),
        responseMapping: JSON.stringify({ dataField: "upload_count" }),
        aiUsageHint:
          "Add prospects to a Smartlead campaign. Pass campaign_id as a path param and lead_list array with at least email for each lead. Add custom_fields for personalization merge tags used in email sequences.",
        exampleArgs: JSON.stringify({
          campaign_id: 12345,
          lead_list: [
            {
              email: "john.doe@example.com",
              first_name: "John",
              last_name: "Doe",
              company_name: "Acme Corp",
              custom_fields: {
                opening_line: "Loved your recent LinkedIn post about scaling outbound",
              },
            },
          ],
        }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "get_campaign_analytics",
        displayName: "Get Campaign Analytics",
        description:
          "Get daily performance analytics for a campaign — emails sent, open rate, reply rate, bounce rate, and unsubscribes. Filter by date range.",
        method: "GET" as const,
        path: "/campaigns/{id}/analytics-by-date",
        pathParams: JSON.stringify([
          { name: "id", type: "number", required: true, description: "Campaign ID" },
        ]),
        queryParams: JSON.stringify([
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
          "Pull campaign performance metrics by date — emails sent, opened, replied, bounced per day. Use to report on campaign performance or compare time periods.",
        exampleArgs: JSON.stringify({
          id: 12345,
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
          "List email sending accounts connected to Smartlead workspace. Returns warmup status, daily sending limits, and health scores.",
        method: "GET" as const,
        path: "/email-accounts",
        queryParams: JSON.stringify([
          {
            name: "offset",
            type: "number",
            required: false,
            description: "Pagination offset (default 0)",
          },
          {
            name: "limit",
            type: "number",
            required: false,
            description: "Number of results to return (default 100)",
          },
        ]),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Check connected email accounts and their warmup status. Useful to verify sending capacity before launching a large campaign.",
        exampleArgs: JSON.stringify({ limit: 50, offset: 0 }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "get_lead_message_history",
        displayName: "Get Lead Message History",
        description:
          "Get the full email thread history for a specific lead in a campaign — all emails sent, received, and replies.",
        method: "GET" as const,
        path: "/campaigns/{campaign_id}/leads/{lead_id}/message-history",
        pathParams: JSON.stringify([
          { name: "campaign_id", type: "number", required: true, description: "Campaign ID" },
          { name: "lead_id", type: "number", required: true, description: "Lead ID" },
        ]),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Check the full email conversation history with a specific lead. Use list_leads to get the lead ID first. Returns all emails sent and any replies received.",
        exampleArgs: JSON.stringify({ campaign_id: 12345, lead_id: 67890 }),
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

    console.log(`✅ Smartlead blueprint created with ${tools.length} tools`);
    return { blueprintId, created: true };
  },
});
