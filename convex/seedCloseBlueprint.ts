/**
 * Seed Close CRM integration blueprint
 * Run this once to create the Close CRM blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedCloseBlueprint -> Run
 *
 * Prerequisites:
 * - Create an OAuth app at https://app.close.com/oauth2/apps/
 * - Set OAUTH_SECRET_CLOSE env var in Convex dashboard
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "close"))
      .first();

    if (existing) {
      return {
        message: "Close CRM blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "close",
      name: "Close CRM",
      description:
        "Sales CRM focused on outbound. Manage leads, contacts, opportunities, calls, emails, and pipelines. Built for high-velocity sales teams.",
      category: "crm",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "",
        clientSecret: "OAUTH_SECRET_CLOSE",
        authorizeUrl: "https://app.close.com/oauth2/authorize/",
        tokenUrl: "https://api.close.com/oauth2/token/",
        scopes: ["read", "write"],
        scopeSeparator: "space",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://api.close.com/api/v1",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developer.close.com/",
      iconUrl: "https://cdn.simpleicons.org/close/7AC142",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_leads",
        displayName: "List Leads",
        description: "List and search leads (accounts) in Close CRM. Supports full-text search and filtering.",
        method: "GET" as const,
        path: "/lead",
        queryParams: JSON.stringify([
          { name: "query", type: "string", description: "Close query syntax, e.g. 'status_label:\"Interested\"' or 'lead_name:Acme'" },
          { name: "_limit", type: "number", description: "Results per page (max 200)", default: 25 },
          { name: "_skip", type: "number", description: "Pagination offset", default: 0 },
          { name: "_order_by", type: "string", description: "Sort field, prefix with - for desc: -date_created" },
        ]),
        aiUsageHint: "List Close CRM leads. Use query parameter with Close query syntax: status_label:\"Interested\" for filtering. Search by name: lead_name:\"Acme\".",
        exampleArgs: JSON.stringify({ query: "status_label:\"Potential\"", _limit: 25 }),
      },
      {
        name: "get_lead",
        displayName: "Get Lead",
        description: "Get full details of a specific Close CRM lead.",
        method: "GET" as const,
        path: "/lead/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Lead ID (starts with 'lead_')" },
        ]),
        aiUsageHint: "Fetch a Close CRM lead by ID. Returns all contacts, opportunities, and activity for the lead.",
        exampleArgs: JSON.stringify({ id: "lead_abc123" }),
      },
      {
        name: "create_lead",
        displayName: "Create Lead",
        description: "Create a new lead (account) in Close CRM.",
        method: "POST" as const,
        path: "/lead",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Lead/company name" },
            status_label: { type: "string", description: "Status label (e.g. Potential, Interested, Qualified)" },
            contacts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  emails: { type: "array", items: { type: "object", properties: { email: { type: "string" }, type: { type: "string" } } } },
                  phones: { type: "array", items: { type: "object", properties: { phone: { type: "string" }, type: { type: "string" } } } },
                  title: { type: "string" },
                },
              },
            },
            url: { type: "string", description: "Company website URL" },
            description: { type: "string" },
          },
        }),
        aiUsageHint: "Create a Close CRM lead with optional contacts. Name is the company/account name.",
        exampleArgs: JSON.stringify({
          name: "Acme Corp",
          status_label: "Potential",
          contacts: [{ name: "John Smith", emails: [{ email: "john@acme.com", type: "office" }], title: "CEO" }],
          url: "https://acme.com",
        }),
      },
      {
        name: "update_lead",
        displayName: "Update Lead",
        description: "Update a Close CRM lead's fields or status.",
        method: "PUT" as const,
        path: "/lead/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Lead ID (starts with 'lead_')" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            name: { type: "string" },
            status_label: { type: "string" },
            description: { type: "string" },
            url: { type: "string" },
          },
        }),
        aiUsageHint: "Update a Close CRM lead. Change status_label to move through pipeline stages.",
        exampleArgs: JSON.stringify({ id: "lead_abc123", status_label: "Interested" }),
      },
      {
        name: "list_opportunities",
        displayName: "List Opportunities",
        description: "List opportunities (deals) in Close CRM.",
        method: "GET" as const,
        path: "/opportunity",
        queryParams: JSON.stringify([
          { name: "lead_id", type: "string", description: "Filter by lead ID" },
          { name: "status_type", type: "string", description: "active, won, lost" },
          { name: "_limit", type: "number", default: 25 },
          { name: "_skip", type: "number", default: 0 },
          { name: "_order_by", type: "string", description: "Sort: -date_created, value" },
        ]),
        aiUsageHint: "List Close CRM opportunities. Filter by status_type='active' for open deals, 'won' for closed-won.",
        exampleArgs: JSON.stringify({ status_type: "active", _limit: 25 }),
      },
      {
        name: "create_opportunity",
        displayName: "Create Opportunity",
        description: "Create a new opportunity (deal) in Close CRM.",
        method: "POST" as const,
        path: "/opportunity",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["lead_id", "status_label"],
          properties: {
            lead_id: { type: "string", description: "Lead ID to associate with" },
            status_label: { type: "string", description: "Stage label, e.g. 'In Progress'" },
            value: { type: "number", description: "Opportunity value in cents" },
            value_currency: { type: "string", description: "Currency code", default: "USD" },
            value_period: { type: "string", enum: ["one_time", "monthly", "annual"], default: "one_time" },
            note: { type: "string", description: "Notes about the opportunity" },
            close_date: { type: "string", description: "Expected close date YYYY-MM-DD" },
          },
        }),
        aiUsageHint: "Create a Close CRM opportunity. Provide lead_id and status_label. Value is in cents (e.g. 50000 = $500).",
        exampleArgs: JSON.stringify({ lead_id: "lead_abc123", status_label: "In Progress", value: 500000, value_currency: "USD", close_date: "2026-06-30" }),
      },
      {
        name: "create_note",
        displayName: "Create Note",
        description: "Add a note to a lead in Close CRM.",
        method: "POST" as const,
        path: "/activity/note",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["lead_id", "note"],
          properties: {
            lead_id: { type: "string", description: "Lead ID" },
            note: { type: "string", description: "Note content" },
          },
        }),
        aiUsageHint: "Add a note to a Close CRM lead. Notes appear in the lead activity timeline.",
        exampleArgs: JSON.stringify({ lead_id: "lead_abc123", note: "Great initial call. Decision maker is CTO. Following up next week." }),
      },
      {
        name: "list_users",
        displayName: "List Users",
        description: "List all users (sales reps) in the Close CRM organization.",
        method: "GET" as const,
        path: "/user",
        aiUsageHint: "List Close CRM users. Use to find user IDs for assigning leads and opportunities.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_pipelines",
        displayName: "List Pipelines",
        description: "List all pipelines and their stages in Close CRM.",
        method: "GET" as const,
        path: "/pipeline",
        aiUsageHint: "List Close CRM pipelines and their stage labels. Use stage labels when creating opportunities.",
        exampleArgs: JSON.stringify({}),
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
      message: "✅ Close CRM blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Create OAuth app at https://app.close.com/oauth2/apps/",
        "2. Set OAUTH_SECRET_CLOSE in Convex environment variables",
        "3. Note: Close uses lead_id (not contact_id) as the primary entity identifier",
      ],
    };
  },
});
