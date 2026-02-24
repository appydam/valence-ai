/**
 * Seed Typeform integration blueprint
 * Run this once to create the Typeform blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedTypeformBlueprint -> Run
 *
 * Prerequisites:
 * - No OAuth app needed. Typeform supports Personal Access Tokens.
 * - Users generate their token at: https://admin.typeform.com/account#/section/tokens
 * - No env vars required — users paste their token at connection time.
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "typeform"))
      .first();

    if (existing) {
      return {
        message: "Typeform blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "typeform",
      name: "Typeform",
      description:
        "Online form and survey builder. List forms, fetch responses, analyze insights, and set up webhooks for real-time response notifications.",
      category: "productivity",
      version: 1,
      status: "active",
      authType: "bearer_token",
      authConfig: JSON.stringify({
        apiKeyLocation: "header",
        apiKeyHeader: "Authorization",
        apiKeyPrefix: "Bearer",
      }),
      baseUrl: "https://api.typeform.com",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://www.typeform.com/developers/get-started/",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/typeform.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_forms",
        displayName: "List Forms",
        description:
          "List all Typeform forms in the user's account. Returns form IDs, titles, and metadata.",
        method: "GET" as const,
        path: "/forms",
        queryParams: JSON.stringify([
          {
            name: "page",
            type: "number",
            default: 1,
            description: "Page number for pagination",
          },
          {
            name: "page_size",
            type: "number",
            default: 10,
            description: "Number of forms per page (max 200)",
          },
          {
            name: "search",
            type: "string",
            description: "Filter forms by title",
          },
          {
            name: "workspace_id",
            type: "string",
            description: "Filter forms by workspace ID",
          },
        ]),
        aiUsageHint:
          "List all Typeform forms to get form IDs needed for fetching responses or insights. Use search to filter by form title.",
        exampleArgs: JSON.stringify({ page: 1, page_size: 20 }),
      },
      {
        name: "get_form",
        displayName: "Get Form",
        description:
          "Get the full definition of a Typeform form including all questions, logic, and settings.",
        method: "GET" as const,
        path: "/forms/{formId}",
        pathParams: JSON.stringify([
          {
            name: "formId",
            type: "string",
            required: true,
            description: "Typeform form ID (e.g. abc123XY)",
          },
        ]),
        aiUsageHint:
          "Get the structure of a Typeform form — all questions, their IDs, and field types. Useful before analyzing responses.",
        exampleArgs: JSON.stringify({ formId: "abc123XY" }),
      },
      {
        name: "list_responses",
        displayName: "List Form Responses",
        description:
          "Retrieve submitted responses for a Typeform form. Supports filtering by date, completion status, and pagination.",
        method: "GET" as const,
        path: "/forms/{formId}/responses",
        pathParams: JSON.stringify([
          {
            name: "formId",
            type: "string",
            required: true,
            description: "Typeform form ID",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "page_size",
            type: "number",
            default: 25,
            description: "Number of responses per page (max 1000)",
          },
          {
            name: "since",
            type: "string",
            description:
              "ISO 8601 datetime to filter responses submitted after this time (e.g. 2026-01-01T00:00:00Z)",
          },
          {
            name: "until",
            type: "string",
            description: "ISO 8601 datetime to filter responses submitted before this time",
          },
          {
            name: "completed",
            type: "boolean",
            description: "Filter by completion: true for completed, false for partial",
          },
          {
            name: "before",
            type: "string",
            description: "Token for previous page (from response metadata)",
          },
          {
            name: "after",
            type: "string",
            description: "Token for next page (from response metadata)",
          },
          {
            name: "fields",
            type: "string",
            description: "Comma-separated field IDs to include in the response",
          },
        ]),
        aiUsageHint:
          "Fetch form responses. Filter by completed=true for fully submitted responses. Use since/until for date ranges. Each answer includes the question ref/ID and the answer value.",
        exampleArgs: JSON.stringify({
          formId: "abc123XY",
          page_size: 25,
          completed: true,
          since: "2026-02-01T00:00:00Z",
        }),
      },
      {
        name: "get_response_insights",
        displayName: "Get Response Insights",
        description:
          "Get aggregated insights and summary statistics for a Typeform form, including drop-off rates and average completion time.",
        method: "GET" as const,
        path: "/insights/{formId}/summary",
        pathParams: JSON.stringify([
          {
            name: "formId",
            type: "string",
            required: true,
            description: "Typeform form ID",
          },
        ]),
        aiUsageHint:
          "Get summary stats for a Typeform: total responses, completion rate, average time to complete. Good for reporting.",
        exampleArgs: JSON.stringify({ formId: "abc123XY" }),
      },
      {
        name: "create_webhook",
        displayName: "Create Webhook",
        description:
          "Create or update a webhook to receive real-time notifications when a form receives a new response.",
        method: "PUT" as const,
        path: "/forms/{formId}/webhooks/{tag}",
        pathParams: JSON.stringify([
          {
            name: "formId",
            type: "string",
            required: true,
            description: "Typeform form ID",
          },
          {
            name: "tag",
            type: "string",
            required: true,
            description:
              "Unique label for this webhook (e.g. 'mission-control-webhook'). Alphanumeric and hyphens only.",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["url", "enabled"],
          properties: {
            url: {
              type: "string",
              description: "HTTPS URL to POST new responses to",
            },
            enabled: {
              type: "boolean",
              description: "Whether the webhook is active",
              default: true,
            },
            secret: {
              type: "string",
              description:
                "Optional secret for verifying webhook signatures (added as X-Typeform-Signature header)",
            },
            verify_ssl: {
              type: "boolean",
              description: "Whether to verify SSL certificate on the webhook URL",
              default: true,
            },
          },
        }),
        aiUsageHint:
          "Set up a webhook to receive form responses in real-time. Uses PUT so it's idempotent — calling again with the same tag updates the webhook.",
        exampleArgs: JSON.stringify({
          formId: "abc123XY",
          tag: "mission-control-webhook",
          url: "https://beloved-squirrel-599.convex.site/api/webhooks/typeform",
          enabled: true,
        }),
      },
      {
        name: "delete_webhook",
        displayName: "Delete Webhook",
        description: "Delete a webhook from a Typeform form.",
        method: "DELETE" as const,
        path: "/forms/{formId}/webhooks/{tag}",
        pathParams: JSON.stringify([
          {
            name: "formId",
            type: "string",
            required: true,
            description: "Typeform form ID",
          },
          {
            name: "tag",
            type: "string",
            required: true,
            description: "Webhook tag to delete",
          },
        ]),
        aiUsageHint:
          "Delete a webhook from a Typeform form. Confirm with the user before deleting.",
        exampleArgs: JSON.stringify({
          formId: "abc123XY",
          tag: "mission-control-webhook",
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
      message: "✅ Typeform blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. No OAuth app registration required.",
        "2. Generate a Personal Access Token at: https://admin.typeform.com/account#/section/tokens",
        "3. Run this seed mutation from the Convex dashboard",
        "4. Test by clicking Connect on the Typeform card and pasting your token",
      ],
    };
  },
});
