/**
 * Seed Pipedrive CRM integration blueprint
 *
 * Usage:
 * npx convex run seedPipedriveBlueprint --url https://beloved-squirrel-599.convex.cloud
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "pipedrive"))
      .first();

    if (existing) {
      return { message: "Pipedrive blueprint already exists", blueprintId: existing._id };
    }

    const authConfig = {
      clientId: process.env.PIPEDRIVE_CLIENT_ID || "YOUR_PIPEDRIVE_CLIENT_ID",
      clientSecret: "OAUTH_SECRET_PIPEDRIVE",
      authorizeUrl: "https://oauth.pipedrive.com/oauth/authorize",
      tokenUrl: "https://oauth.pipedrive.com/oauth/token",
      scopes: ["deals:full", "contacts:full", "leads:full", "activities:full"],
      scopeSeparator: "space",
      tokenEndpointAuth: "header",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "pipedrive",
      name: "Pipedrive",
      description: "Sales CRM — manage deals, contacts, leads, activities, and sales pipeline. Track your sales process end-to-end.",
      category: "crm",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://api.pipedrive.com/v1",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      sourceType: "manual",
      sourceUrl: "https://developers.pipedrive.com/docs/api/v1",
      iconUrl: "https://cdn.simpleicons.org/pipedrive/017737",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_deals",
        displayName: "List Deals",
        description: "List all deals in your Pipedrive account with optional filtering",
        method: "GET" as const,
        path: "/deals",
        queryParams: JSON.stringify([
          { name: "status", type: "string", description: "open, won, lost, deleted, all_not_deleted", default: "all_not_deleted" },
          { name: "start", type: "number", description: "Pagination start", default: 0 },
          { name: "limit", type: "number", description: "Items per page (max 500)", default: 100 },
          { name: "sort", type: "string", description: "Field and order, e.g. 'add_time DESC'" },
        ]),
        aiUsageHint: "List deals from the sales pipeline. Filter by status: open, won, lost.",
        exampleArgs: JSON.stringify({ status: "open", limit: 50 }),
      },
      {
        name: "create_deal",
        displayName: "Create Deal",
        description: "Create a new deal in Pipedrive",
        method: "POST" as const,
        path: "/deals",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", description: "Deal title" },
            value: { type: "number", description: "Deal value (monetary amount)" },
            currency: { type: "string", description: "Currency code (e.g. USD, EUR, INR)" },
            person_id: { type: "number", description: "Contact person ID" },
            org_id: { type: "number", description: "Organization ID" },
            stage_id: { type: "number", description: "Pipeline stage ID" },
            expected_close_date: { type: "string", description: "Expected close date (YYYY-MM-DD)" },
          },
        }),
        aiUsageHint: "Create a new deal. Title is required. Optionally set value, currency, and link to a person/org.",
        exampleArgs: JSON.stringify({ title: "Enterprise License Deal", value: 50000, currency: "USD" }),
      },
      {
        name: "list_persons",
        displayName: "List Contacts",
        description: "List all contacts (persons) in Pipedrive",
        method: "GET" as const,
        path: "/persons",
        queryParams: JSON.stringify([
          { name: "start", type: "number", default: 0 },
          { name: "limit", type: "number", default: 100 },
          { name: "sort", type: "string", description: "Field and order, e.g. 'name ASC'" },
        ]),
        aiUsageHint: "List all contacts/persons in the CRM.",
        exampleArgs: JSON.stringify({ limit: 50 }),
      },
      {
        name: "create_person",
        displayName: "Create Contact",
        description: "Create a new contact person in Pipedrive",
        method: "POST" as const,
        path: "/persons",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Full name" },
            email: { type: "array", items: { type: "object" }, description: "Email addresses [{value, primary, label}]" },
            phone: { type: "array", items: { type: "object" }, description: "Phone numbers [{value, primary, label}]" },
            org_id: { type: "number", description: "Organization to link to" },
          },
        }),
        aiUsageHint: "Create a new contact. Name is required. Pass email as [{value:'email@example.com', primary:true}].",
        exampleArgs: JSON.stringify({ name: "John Doe", email: [{ value: "john@example.com", primary: true }] }),
      },
      {
        name: "list_activities",
        displayName: "List Activities",
        description: "List activities (calls, meetings, tasks, emails) in Pipedrive",
        method: "GET" as const,
        path: "/activities",
        queryParams: JSON.stringify([
          { name: "type", type: "string", description: "Activity type: call, meeting, task, email, etc." },
          { name: "start", type: "number", default: 0 },
          { name: "limit", type: "number", default: 100 },
          { name: "done", type: "number", description: "0 = not done, 1 = done" },
        ]),
        aiUsageHint: "List activities like calls, meetings, tasks. Filter by type and done status.",
        exampleArgs: JSON.stringify({ done: 0, limit: 20 }),
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
      message: "Pipedrive blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Create OAuth app at https://developers.pipedrive.com/",
        "2. Set callback URL to: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "3. npx convex env set PIPEDRIVE_CLIENT_ID '<client_id>' --url https://beloved-squirrel-599.convex.cloud",
        "4. npx convex env set OAUTH_SECRET_PIPEDRIVE '<client_secret>' --url https://beloved-squirrel-599.convex.cloud",
      ],
    };
  },
});
