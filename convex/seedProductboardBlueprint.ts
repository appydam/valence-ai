/**
 * Seed Productboard integration blueprint
 * Run this once to create the Productboard blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedProductboardBlueprint -> Run
 *
 * Prerequisites:
 * 1. Get an API token from Productboard → Settings → Integrations → Public API
 * 2. Connect via the Integrations page using the bearer token auth flow
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "productboard"))
      .first();

    if (existing) {
      return {
        message: "Productboard blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "productboard",
      name: "Productboard",
      description:
        "Product management platform for capturing customer feedback, prioritizing features, and building roadmaps. Sync product features and feedback with your AI agents.",
      category: "Project Management",
      version: 1,
      status: "active",
      authType: "bearer_token",
      authConfig: JSON.stringify({
        headerName: "Authorization",
        headerPrefix: "Bearer",
      }),
      baseUrl: "https://api.productboard.com",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Version": "1",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developer.productboard.com/",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/productboard.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_features",
        displayName: "List Features",
        description:
          "List product features from Productboard. Filter by status, component, or tags. Returns feature name, description, status, and priority score.",
        method: "GET" as const,
        path: "/features",
        queryParams: JSON.stringify([
          {
            name: "status.name",
            type: "string",
            description:
              "Filter by status name: candidate, in_progress, planned, released, won't_do",
          },
          {
            name: "component.id",
            type: "string",
            description: "Filter by component ID",
          },
          {
            name: "pageCursor",
            type: "string",
            description: "Cursor for pagination (from previous response)",
          },
          {
            name: "pageLimit",
            type: "number",
            default: 100,
            description: "Results per page (max 100)",
          },
        ]),
        aiUsageHint:
          "List product features. Filter by status.name to see features in a specific stage. Use component.id to scope to a product area.",
        exampleArgs: JSON.stringify({
          "status.name": "planned",
          pageLimit: 50,
        }),
      },
      {
        name: "get_feature",
        displayName: "Get Feature",
        description:
          "Get detailed information about a specific product feature including its status, priority score, notes, and linked feedback.",
        method: "GET" as const,
        path: "/features/{id}",
        pathParams: JSON.stringify([
          {
            name: "id",
            type: "string",
            required: true,
            description: "Productboard feature ID",
          },
        ]),
        aiUsageHint:
          "Get full details of a specific feature by ID. Returns status, priority score, description, and linked notes.",
        exampleArgs: JSON.stringify({ id: "feat_abc123" }),
      },
      {
        name: "create_feature",
        displayName: "Create Feature",
        description:
          "Create a new product feature in Productboard. Assign it to a component, set status, and add description.",
        method: "POST" as const,
        path: "/features",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "object",
              required: ["name"],
              properties: {
                name: {
                  type: "string",
                  description: "Feature name/title",
                },
                description: {
                  type: "string",
                  description: "Feature description (supports HTML)",
                },
                status: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "Status: candidate, planned, in_progress",
                    },
                  },
                },
                parent: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      description: "Parent feature ID for hierarchy",
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Create a new feature. Wrap fields in a 'data' object. Set status.name to place it in the right pipeline stage.",
        exampleArgs: JSON.stringify({
          data: {
            name: "Dark mode support",
            description:
              "<p>Users have requested dark mode for better nighttime usability.</p>",
            status: { name: "candidate" },
          },
        }),
      },
      {
        name: "update_feature",
        displayName: "Update Feature",
        description:
          "Update an existing product feature — change its status, description, or assignment.",
        method: "PATCH" as const,
        path: "/features/{id}",
        pathParams: JSON.stringify([
          {
            name: "id",
            type: "string",
            required: true,
            description: "Productboard feature ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                status: {
                  type: "object",
                  properties: { name: { type: "string" } },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Update a feature's fields. Only include the fields to change inside the 'data' wrapper.",
        exampleArgs: JSON.stringify({
          id: "feat_abc123",
          data: {
            status: { name: "in_progress" },
          },
        }),
      },
      {
        name: "list_notes",
        displayName: "List Notes (Feedback)",
        description:
          "List customer feedback notes in Productboard. Notes are insights captured from customer conversations, support tickets, or manual entry.",
        method: "GET" as const,
        path: "/notes",
        queryParams: JSON.stringify([
          {
            name: "pageCursor",
            type: "string",
            description: "Cursor for pagination",
          },
          {
            name: "pageLimit",
            type: "number",
            default: 100,
            description: "Results per page (max 100)",
          },
        ]),
        aiUsageHint:
          "List customer feedback notes. These are insights from support, sales calls, or surveys. Use pagination cursor for large result sets.",
        exampleArgs: JSON.stringify({ pageLimit: 25 }),
      },
      {
        name: "create_note",
        displayName: "Create Note (Feedback)",
        description:
          "Create a customer feedback note in Productboard. Link it to a customer email for attribution. Notes can be linked to features for prioritization.",
        method: "POST" as const,
        path: "/notes",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "object",
              required: ["title", "content"],
              properties: {
                title: {
                  type: "string",
                  description: "Note title/subject",
                },
                content: {
                  type: "string",
                  description: "Note body (supports HTML)",
                },
                customer_email: {
                  type: "string",
                  description: "Customer email for attribution",
                },
                source: {
                  type: "object",
                  properties: {
                    origin: {
                      type: "string",
                      description:
                        "Source system: intercom, zendesk, slack, email, api",
                    },
                  },
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Tags to categorize the note",
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Create a feedback note from a customer interaction. Include customer_email for attribution and tags for categorization. Wrap in 'data' object.",
        exampleArgs: JSON.stringify({
          data: {
            title: "Customer wants bulk export feature",
            content:
              "<p>Customer on Enterprise plan mentioned they need bulk CSV export for compliance reporting.</p>",
            customer_email: "alice@bigcorp.com",
            source: { origin: "slack" },
            tags: ["enterprise", "export", "compliance"],
          },
        }),
      },
      {
        name: "list_components",
        displayName: "List Components",
        description:
          "List product components (product areas/modules) in Productboard. Components organize features into a hierarchy.",
        method: "GET" as const,
        path: "/components",
        queryParams: JSON.stringify([
          {
            name: "pageCursor",
            type: "string",
            description: "Cursor for pagination",
          },
          {
            name: "pageLimit",
            type: "number",
            default: 100,
            description: "Results per page",
          },
        ]),
        aiUsageHint:
          "List product areas/components. Use these IDs to filter features by component.",
        exampleArgs: JSON.stringify({ pageLimit: 50 }),
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
      message: "✅ Productboard blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Go to Productboard → Settings → Integrations → Public API",
        "2. Generate an API access token",
        "3. Connect via the Integrations page using the bearer token auth flow",
        "4. Enter the API token when prompted",
      ],
    };
  },
});
