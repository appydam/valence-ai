/**
 * Seed Zendesk integration blueprint
 * Run this once to create the Zendesk blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedZendeskBlueprint -> Run
 *
 * Prerequisites:
 * 1. Create an OAuth client in Zendesk Admin → Apps and integrations → APIs → Zendesk API → OAuth Clients
 *    - Redirect URL: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback
 * 2. Set in Convex env vars:
 *    - ZENDESK_CLIENT_ID = Unique Identifier from OAuth client
 *    - OAUTH_SECRET_ZENDESK = Secret from OAuth client
 *
 * IMPORTANT: Zendesk API URLs are subdomain-scoped (e.g. https://yourcompany.zendesk.com).
 * The {instanceUrl} path param is resolved from the connection's subdomain at runtime.
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "zendesk"))
      .first();

    if (existing) {
      return {
        message: "Zendesk blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "zendesk",
      name: "Zendesk",
      description:
        "Customer support ticketing platform. Create, update, and search support tickets. Manage users, add comments, and automate support workflows.",
      category: "Support",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId:
          process.env.ZENDESK_CLIENT_ID || "YOUR_ZENDESK_CLIENT_ID",
        clientSecret: "OAUTH_SECRET_ZENDESK",
        authorizeUrl:
          "https://{subdomain}.zendesk.com/oauth/authorizations/new",
        tokenUrl: "https://{subdomain}.zendesk.com/oauth/tokens",
        scopes: ["read", "write", "tickets:read", "tickets:write"],
        scopeSeparator: "space",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://{subdomain}.zendesk.com/api/v2",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developer.zendesk.com/api-reference/",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/zendesk-1.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_tickets",
        displayName: "List Tickets",
        description:
          "List support tickets from Zendesk. Returns recent tickets sorted by creation date. Use search_tickets for filtered queries.",
        method: "GET" as const,
        path: "{instanceUrl}/api/v2/tickets",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description:
              "Zendesk instance URL (e.g. https://yourcompany.zendesk.com)",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "sort_by",
            type: "string",
            description: "Sort field: created_at, updated_at, priority, status",
            default: "created_at",
          },
          {
            name: "sort_order",
            type: "string",
            description: "asc or desc",
            default: "desc",
          },
          {
            name: "per_page",
            type: "number",
            default: 100,
            description: "Results per page (max 100)",
          },
          {
            name: "page",
            type: "number",
            default: 1,
            description: "Page number",
          },
        ]),
        aiUsageHint:
          "List recent tickets. For filtered results, use search_tickets instead. Default sort is newest first.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.zendesk.com",
          sort_by: "updated_at",
          sort_order: "desc",
          per_page: 25,
        }),
      },
      {
        name: "get_ticket",
        displayName: "Get Ticket",
        description:
          "Get full details of a specific support ticket including description, comments, tags, assignee, and status.",
        method: "GET" as const,
        path: "{instanceUrl}/api/v2/tickets/{id}",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Zendesk instance URL",
          },
          {
            name: "id",
            type: "number",
            required: true,
            description: "Zendesk ticket ID",
          },
        ]),
        aiUsageHint:
          "Get a ticket's full details by ID. Returns subject, description, status, priority, assignee, and tags.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.zendesk.com",
          id: 12345,
        }),
      },
      {
        name: "create_ticket",
        displayName: "Create Ticket",
        description:
          "Create a new support ticket in Zendesk. Set subject, description, priority, type, and tags.",
        method: "POST" as const,
        path: "{instanceUrl}/api/v2/tickets",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Zendesk instance URL",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["ticket"],
          properties: {
            ticket: {
              type: "object",
              required: ["subject"],
              properties: {
                subject: {
                  type: "string",
                  description: "Ticket subject line",
                },
                comment: {
                  type: "object",
                  properties: {
                    body: {
                      type: "string",
                      description: "Ticket description/first comment",
                    },
                    html_body: {
                      type: "string",
                      description: "HTML version of the description",
                    },
                  },
                },
                priority: {
                  type: "string",
                  description: "urgent, high, normal, low",
                },
                type: {
                  type: "string",
                  description: "problem, incident, question, task",
                },
                status: {
                  type: "string",
                  description: "new, open, pending, hold, solved, closed",
                },
                assignee_id: {
                  type: "number",
                  description: "Agent ID to assign ticket to",
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Tags to apply to the ticket",
                },
                requester_id: {
                  type: "number",
                  description: "Requester user ID",
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Create a ticket. Wrap all fields inside a 'ticket' object. Always include subject and comment.body at minimum.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.zendesk.com",
          ticket: {
            subject: "Login page returns 500 error",
            comment: {
              body: "Multiple customers reporting a 500 error when trying to log in since 9am UTC. Affects all browsers.",
            },
            priority: "urgent",
            type: "incident",
            tags: ["login", "500-error", "p1"],
          },
        }),
      },
      {
        name: "update_ticket",
        displayName: "Update Ticket",
        description:
          "Update a support ticket — change status, priority, assignee, tags, or add an internal/public comment.",
        method: "PUT" as const,
        path: "{instanceUrl}/api/v2/tickets/{id}",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Zendesk instance URL",
          },
          {
            name: "id",
            type: "number",
            required: true,
            description: "Zendesk ticket ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["ticket"],
          properties: {
            ticket: {
              type: "object",
              properties: {
                status: { type: "string", description: "new, open, pending, hold, solved, closed" },
                priority: { type: "string", description: "urgent, high, normal, low" },
                assignee_id: { type: "number", description: "Agent ID" },
                tags: { type: "array", items: { type: "string" } },
                comment: {
                  type: "object",
                  properties: {
                    body: { type: "string", description: "Comment text" },
                    public: {
                      type: "boolean",
                      description: "true for public reply, false for internal note",
                      default: true,
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Update ticket fields. Add comment.public=false for internal notes, true for customer-facing replies. Wrap in 'ticket' object.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.zendesk.com",
          id: 12345,
          ticket: {
            status: "pending",
            comment: {
              body: "Escalated to engineering. Investigating the root cause.",
              public: false,
            },
          },
        }),
      },
      {
        name: "add_comment",
        displayName: "Add Comment to Ticket",
        description:
          "Add a public reply or internal note to a ticket. This is a convenience alias for update_ticket with a comment.",
        method: "PUT" as const,
        path: "{instanceUrl}/api/v2/tickets/{id}",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Zendesk instance URL",
          },
          {
            name: "id",
            type: "number",
            required: true,
            description: "Zendesk ticket ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["ticket"],
          properties: {
            ticket: {
              type: "object",
              required: ["comment"],
              properties: {
                comment: {
                  type: "object",
                  required: ["body"],
                  properties: {
                    body: { type: "string", description: "Comment text" },
                    html_body: { type: "string", description: "HTML comment" },
                    public: {
                      type: "boolean",
                      description: "true = customer-visible reply, false = internal note",
                      default: true,
                    },
                    author_id: {
                      type: "number",
                      description: "Author user ID (defaults to authenticated agent)",
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Add a comment to a ticket. Set public=true for customer reply, false for internal note. Wrap in ticket.comment.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.zendesk.com",
          id: 12345,
          ticket: {
            comment: {
              body: "Hi! We've identified the issue and deployed a fix. Please try logging in again.",
              public: true,
            },
          },
        }),
      },
      {
        name: "search_tickets",
        displayName: "Search Tickets",
        description:
          "Search tickets using Zendesk search syntax. Supports full-text search plus filters like status, priority, assignee, tags, and dates.",
        method: "GET" as const,
        path: "{instanceUrl}/api/v2/search",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Zendesk instance URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "query",
            type: "string",
            required: true,
            description:
              "Zendesk search query. Format: 'type:ticket status:open priority:urgent tag:billing'. Free text also works.",
          },
          {
            name: "sort_by",
            type: "string",
            description: "Sort by: created_at, updated_at, priority, status, ticket_type",
            default: "relevance",
          },
          {
            name: "sort_order",
            type: "string",
            description: "asc or desc",
            default: "desc",
          },
          {
            name: "per_page",
            type: "number",
            default: 100,
            description: "Results per page (max 100)",
          },
        ]),
        aiUsageHint:
          "Search tickets with Zendesk query syntax. Examples: 'type:ticket status:open assignee:me', 'type:ticket priority:urgent created>2026-01-01', 'type:ticket tags:billing login error'.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.zendesk.com",
          query: "type:ticket status:open priority:urgent created>2026-02-01",
          per_page: 25,
        }),
      },
      {
        name: "list_users",
        displayName: "List Users",
        description:
          "List Zendesk users (agents, admins, end-users). Filter by role to find agents or customers.",
        method: "GET" as const,
        path: "{instanceUrl}/api/v2/users",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Zendesk instance URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "role",
            type: "string",
            description: "Filter by role: end-user, agent, admin",
          },
          {
            name: "per_page",
            type: "number",
            default: 100,
            description: "Results per page (max 100)",
          },
          {
            name: "page",
            type: "number",
            default: 1,
            description: "Page number",
          },
        ]),
        aiUsageHint:
          "List users. Use role=agent to list agents, role=end-user for customers.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.zendesk.com",
          role: "agent",
        }),
      },
      {
        name: "get_user",
        displayName: "Get User",
        description: "Get detailed user profile by ID.",
        method: "GET" as const,
        path: "{instanceUrl}/api/v2/users/{id}",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Zendesk instance URL",
          },
          {
            name: "id",
            type: "number",
            required: true,
            description: "Zendesk user ID",
          },
        ]),
        aiUsageHint: "Get a user profile by ID. Returns name, email, role, and custom fields.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.zendesk.com",
          id: 9876543,
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
      message: "✅ Zendesk blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Go to Zendesk Admin → Apps and integrations → APIs → Zendesk API → OAuth Clients",
        "2. Add a new OAuth client with redirect URL:",
        "   https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "3. Set ZENDESK_CLIENT_ID in Convex env vars (Unique Identifier)",
        "4. Set OAUTH_SECRET_ZENDESK in Convex env vars (Secret)",
        "5. Note: Users will need to provide their Zendesk subdomain during connection",
      ],
    };
  },
});
