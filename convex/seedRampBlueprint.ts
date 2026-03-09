/**
 * Seed Ramp integration blueprint
 * Run this once to create the Ramp blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedRampBlueprint -> Run
 *
 * Prerequisites:
 * - Create an app at https://demo.ramp.com/developer/apps (sandbox) or contact Ramp for production
 * - Set OAUTH_SECRET_RAMP env var in Convex dashboard
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "ramp"))
      .first();

    if (existing) {
      return {
        message: "Ramp blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "ramp",
      name: "Ramp",
      description:
        "Corporate card and spend management platform. View transactions, cards, users, departments, and manage spending limits and receipts.",
      category: "finance",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "",
        clientSecret: "OAUTH_SECRET_RAMP",
        authorizeUrl: "https://app.ramp.com/v1/authorize",
        tokenUrl: "https://api.ramp.com/oauth/token",
        scopes: [
          "transactions:read",
          "cards:read",
          "users:read",
          "departments:read",
          "receipts:read",
          "limits:read",
          "vendors:read",
        ],
        scopeSeparator: "space",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://api.ramp.com/developer/v1",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://docs.ramp.com/developer-api",
      iconUrl: "https://cdn.simpleicons.org/ramp/FF4800",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_transactions",
        displayName: "List Transactions",
        description: "List card transactions in Ramp. Filter by date, department, user, or merchant.",
        method: "GET" as const,
        path: "/transactions",
        queryParams: JSON.stringify([
          { name: "start", type: "string", description: "Start date filter (ISO 8601)" },
          { name: "end", type: "string", description: "End date filter (ISO 8601)" },
          { name: "department_id", type: "string", description: "Filter by department ID" },
          { name: "user_id", type: "string", description: "Filter by cardholder user ID" },
          { name: "min_amount", type: "number", description: "Minimum amount in cents" },
          { name: "max_amount", type: "number", description: "Maximum amount in cents" },
          { name: "page_size", type: "number", description: "Results per page", default: 25 },
          { name: "start_cursor", type: "string", description: "Pagination cursor" },
        ]),
        aiUsageHint: "List Ramp transactions. Filter by date range (start/end), user_id for specific employee, or department_id. Amounts are in cents.",
        exampleArgs: JSON.stringify({ start: "2026-01-01T00:00:00Z", end: "2026-03-31T23:59:59Z", page_size: 25 }),
      },
      {
        name: "get_transaction",
        displayName: "Get Transaction",
        description: "Get details of a specific Ramp transaction.",
        method: "GET" as const,
        path: "/transactions/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Transaction ID" },
        ]),
        aiUsageHint: "Get details of a specific Ramp transaction including merchant, amount, category, and receipt status.",
        exampleArgs: JSON.stringify({ id: "TRANSACTION_ID" }),
      },
      {
        name: "list_cards",
        displayName: "List Cards",
        description: "List all corporate cards in the Ramp account.",
        method: "GET" as const,
        path: "/cards",
        queryParams: JSON.stringify([
          { name: "user_id", type: "string", description: "Filter by cardholder" },
          { name: "page_size", type: "number", default: 25 },
          { name: "start_cursor", type: "string" },
        ]),
        aiUsageHint: "List Ramp corporate cards. Filter by user_id to get cards for a specific employee.",
        exampleArgs: JSON.stringify({ page_size: 25 }),
      },
      {
        name: "get_card",
        displayName: "Get Card",
        description: "Get details of a specific Ramp corporate card.",
        method: "GET" as const,
        path: "/cards/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Card ID" },
        ]),
        aiUsageHint: "Get details of a Ramp card including cardholder, spending limit, and status.",
        exampleArgs: JSON.stringify({ id: "CARD_ID" }),
      },
      {
        name: "list_users",
        displayName: "List Users",
        description: "List all users (employees) in the Ramp account.",
        method: "GET" as const,
        path: "/users",
        queryParams: JSON.stringify([
          { name: "department_id", type: "string", description: "Filter by department" },
          { name: "page_size", type: "number", default: 25 },
          { name: "start_cursor", type: "string" },
        ]),
        aiUsageHint: "List Ramp users (employees). Use to find user IDs for filtering transactions and cards.",
        exampleArgs: JSON.stringify({ page_size: 25 }),
      },
      {
        name: "get_user",
        displayName: "Get User",
        description: "Get details of a specific Ramp user.",
        method: "GET" as const,
        path: "/users/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "User ID" },
        ]),
        aiUsageHint: "Get details of a Ramp user including name, email, department, and card info.",
        exampleArgs: JSON.stringify({ id: "USER_ID" }),
      },
      {
        name: "list_departments",
        displayName: "List Departments",
        description: "List all departments in the Ramp account.",
        method: "GET" as const,
        path: "/departments",
        queryParams: JSON.stringify([
          { name: "page_size", type: "number", default: 25 },
          { name: "start_cursor", type: "string" },
        ]),
        aiUsageHint: "List Ramp departments. Use department IDs to filter transactions and users by team.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "get_department",
        displayName: "Get Department",
        description: "Get details of a specific department in Ramp.",
        method: "GET" as const,
        path: "/departments/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Department ID" },
        ]),
        aiUsageHint: "Get details of a Ramp department including name and owner.",
        exampleArgs: JSON.stringify({ id: "DEPARTMENT_ID" }),
      },
      {
        name: "list_receipts",
        displayName: "List Receipts",
        description: "List receipts uploaded to Ramp transactions.",
        method: "GET" as const,
        path: "/receipts",
        queryParams: JSON.stringify([
          { name: "transaction_id", type: "string", description: "Filter by transaction ID" },
          { name: "page_size", type: "number", default: 25 },
          { name: "start_cursor", type: "string" },
        ]),
        aiUsageHint: "List Ramp receipts. Filter by transaction_id to get receipts for a specific transaction.",
        exampleArgs: JSON.stringify({ transaction_id: "TRANSACTION_ID" }),
      },
      {
        name: "list_limits",
        displayName: "List Spending Limits",
        description: "List all spending limits configured in the Ramp account.",
        method: "GET" as const,
        path: "/limits",
        queryParams: JSON.stringify([
          { name: "user_id", type: "string", description: "Filter by user" },
          { name: "card_id", type: "string", description: "Filter by card" },
          { name: "page_size", type: "number", default: 25 },
          { name: "start_cursor", type: "string" },
        ]),
        aiUsageHint: "List Ramp spending limits. Filter by user or card to see their specific limits.",
        exampleArgs: JSON.stringify({ page_size: 25 }),
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
      message: "✅ Ramp blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Create developer app at https://demo.ramp.com/developer/apps for sandbox testing",
        "2. Contact Ramp for production API access",
        "3. Set OAUTH_SECRET_RAMP in Convex environment variables",
      ],
    };
  },
});
