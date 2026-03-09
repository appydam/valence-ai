/**
 * Seed Brex integration blueprint
 * Run this once to create the Brex blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedBrexBlueprint -> Run
 *
 * Prerequisites:
 * - Create an OAuth app at https://developer.brex.com/
 * - Set OAUTH_SECRET_BREX env var in Convex dashboard
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "brex"))
      .first();

    if (existing) {
      return {
        message: "Brex blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "brex",
      name: "Brex",
      description:
        "Corporate card and spend management. View accounts, transactions, cards, expenses, and team members. Track company spending and manage corporate card limits.",
      category: "finance",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "",
        clientSecret: "OAUTH_SECRET_BREX",
        authorizeUrl: "https://accounts.brex.com/oauth2/v1/auth",
        tokenUrl: "https://accounts.brex.com/oauth2/v1/token",
        scopes: [
          "openid",
          "offline_access",
          "accounts.readonly",
          "transactions.readonly",
          "cards.readonly",
          "expenses.readonly",
          "users.readonly",
          "departments.readonly",
          "vendors.readonly",
        ],
        scopeSeparator: "space",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://platform.brexapis.com",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developer.brex.com/openapi/",
      iconUrl: "https://cdn.simpleicons.org/brex/FF5B00",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_accounts",
        displayName: "List Accounts",
        description: "List all Brex cash and card accounts.",
        method: "GET" as const,
        path: "/v2/accounts/cash",
        queryParams: JSON.stringify([
          { name: "cursor", type: "string", description: "Pagination cursor" },
          { name: "limit", type: "number", description: "Max results", default: 25 },
        ]),
        aiUsageHint: "List Brex cash accounts. Returns account balances and details. Use to check company cash position.",
        exampleArgs: JSON.stringify({ limit: 10 }),
      },
      {
        name: "list_transactions",
        displayName: "List Transactions",
        description: "List card transactions in the Brex account.",
        method: "GET" as const,
        path: "/v2/transactions/card/primary",
        queryParams: JSON.stringify([
          { name: "cursor", type: "string", description: "Pagination cursor for next page" },
          { name: "limit", type: "number", description: "Max results (max 100)", default: 25 },
        ]),
        aiUsageHint: "List Brex card transactions. Paginate with cursor from previous response. Returns merchant, amount, category, and cardholder info.",
        exampleArgs: JSON.stringify({ limit: 25 }),
      },
      {
        name: "get_transaction",
        displayName: "Get Transaction",
        description: "Get details of a specific Brex transaction.",
        method: "GET" as const,
        path: "/v2/transactions/card/primary/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Transaction ID" },
        ]),
        aiUsageHint: "Get details of a Brex transaction including merchant, amount, category, and receipt.",
        exampleArgs: JSON.stringify({ id: "TRANSACTION_ID" }),
      },
      {
        name: "list_cards",
        displayName: "List Cards",
        description: "List all Brex corporate cards issued to employees.",
        method: "GET" as const,
        path: "/v2/cards",
        queryParams: JSON.stringify([
          { name: "cursor", type: "string" },
          { name: "limit", type: "number", default: 25 },
          { name: "user_id", type: "string", description: "Filter by cardholder user ID" },
        ]),
        aiUsageHint: "List all Brex corporate cards. Filter by user_id to get cards for a specific employee.",
        exampleArgs: JSON.stringify({ limit: 25 }),
      },
      {
        name: "get_card",
        displayName: "Get Card",
        description: "Get details of a specific Brex corporate card.",
        method: "GET" as const,
        path: "/v2/cards/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Card ID" },
        ]),
        aiUsageHint: "Get details of a specific Brex card including cardholder, limit, and status.",
        exampleArgs: JSON.stringify({ id: "CARD_ID" }),
      },
      {
        name: "list_expenses",
        displayName: "List Expenses",
        description: "List expense reports and expense items in Brex.",
        method: "GET" as const,
        path: "/v1/expenses/card",
        queryParams: JSON.stringify([
          { name: "cursor", type: "string" },
          { name: "limit", type: "number", default: 25 },
          { name: "user_id", type: "array", description: "Filter by user IDs" },
          { name: "parent_expense_id", type: "array", description: "Filter by expense report IDs" },
        ]),
        aiUsageHint: "List Brex expenses. Filter by user_id to see expenses for a specific employee.",
        exampleArgs: JSON.stringify({ limit: 25 }),
      },
      {
        name: "list_users",
        displayName: "List Users",
        description: "List all users (employees) in the Brex account.",
        method: "GET" as const,
        path: "/v2/users",
        queryParams: JSON.stringify([
          { name: "cursor", type: "string" },
          { name: "limit", type: "number", default: 25 },
          { name: "department_id", type: "string", description: "Filter by department" },
          { name: "location_id", type: "string", description: "Filter by location" },
        ]),
        aiUsageHint: "List Brex users (employees). Use to find user IDs for filtering transactions and cards.",
        exampleArgs: JSON.stringify({ limit: 25 }),
      },
      {
        name: "list_departments",
        displayName: "List Departments",
        description: "List all departments in the Brex account.",
        method: "GET" as const,
        path: "/v2/departments",
        queryParams: JSON.stringify([
          { name: "cursor", type: "string" },
          { name: "limit", type: "number", default: 25 },
        ]),
        aiUsageHint: "List Brex departments. Use to filter expenses and users by department.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_vendors",
        displayName: "List Vendors",
        description: "List vendors in the Brex account.",
        method: "GET" as const,
        path: "/v1/vendors",
        queryParams: JSON.stringify([
          { name: "cursor", type: "string" },
          { name: "limit", type: "number", default: 25 },
          { name: "name", type: "string", description: "Filter by vendor name" },
        ]),
        aiUsageHint: "List Brex vendors. Filter by name to find a specific vendor.",
        exampleArgs: JSON.stringify({ limit: 25 }),
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
      message: "✅ Brex blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Apply for Brex developer access at https://developer.brex.com/",
        "2. Create OAuth2 application in Brex developer portal",
        "3. Set OAUTH_SECRET_BREX in Convex environment variables",
      ],
    };
  },
});
