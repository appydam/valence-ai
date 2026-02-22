/**
 * Seed Looker integration blueprint
 * Run this once to create the Looker blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedLookerBlueprint -> Run
 *
 * Prerequisites:
 * 1. Get API credentials from Looker Admin → Users → Edit → API Keys
 *    - Create an API key pair (Client ID + Client Secret)
 * 2. Connect via the Integrations page using basic auth
 *    (Client ID as username, Client Secret as password)
 *
 * IMPORTANT: Looker uses client_credentials grant type. The API login endpoint
 * returns an access_token from Client ID + Secret. All subsequent requests use
 * Bearer token. Instance URL varies per deployment (e.g. https://mycompany.cloud.looker.com).
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "looker"))
      .first();

    if (existing) {
      return {
        message: "Looker blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "looker",
      name: "Looker",
      description:
        "Business intelligence and data analytics platform. Run saved Looks, execute inline queries, browse dashboards, and access data models. Enable AI agents to pull live analytics data.",
      category: "Business Intelligence",
      version: 1,
      status: "active",
      authType: "basic_auth",
      authConfig: JSON.stringify({
        usernameLabel: "Looker API Client ID",
        passwordLabel: "Looker API Client Secret",
        note: "Looker uses client_credentials auth. Provide the Client ID and Client Secret from Looker Admin → Users → API Keys. The instance URL is your Looker deployment URL.",
      }),
      baseUrl: "https://mycompany.cloud.looker.com/api/4.0",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://cloud.google.com/looker/docs/reference/looker-api",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/looker-1.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "run_look",
        displayName: "Run Saved Look",
        description:
          "Execute a saved Look and return the results as JSON. Looks are pre-built queries created by analysts in the Looker UI.",
        method: "GET" as const,
        path: "{instanceUrl}/api/4.0/looks/{look_id}/run/json",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description:
              "Looker instance URL (e.g. https://mycompany.cloud.looker.com)",
          },
          {
            name: "look_id",
            type: "number",
            required: true,
            description: "Looker Look ID (numeric)",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "limit",
            type: "number",
            default: 500,
            description: "Max rows to return",
          },
          {
            name: "apply_formatting",
            type: "boolean",
            description: "Apply Looker formatting to values",
            default: false,
          },
          {
            name: "apply_vis",
            type: "boolean",
            description: "Apply visualization options",
            default: false,
          },
        ]),
        aiUsageHint:
          "Run a saved Look by its ID and get results as JSON. Use limit to control result size. Look IDs are visible in the Look URL.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.cloud.looker.com",
          look_id: 42,
          limit: 100,
        }),
      },
      {
        name: "run_inline_query",
        displayName: "Run Inline Query",
        description:
          "Execute an ad-hoc query against a Looker model. Specify the model, explore (view), dimensions, measures, filters, sorts, and limit.",
        method: "POST" as const,
        path: "{instanceUrl}/api/4.0/queries/run/json",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Looker instance URL",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["model", "view", "fields"],
          properties: {
            model: {
              type: "string",
              description: "LookML model name",
            },
            view: {
              type: "string",
              description: "Explore/view name within the model",
            },
            fields: {
              type: "array",
              items: { type: "string" },
              description:
                "Array of dimension and measure field names (e.g. 'orders.created_date', 'orders.count')",
            },
            filters: {
              type: "object",
              description:
                "Field-value filter pairs. Example: {'orders.created_date': 'last 30 days'}",
            },
            sorts: {
              type: "array",
              items: { type: "string" },
              description:
                "Sort fields with optional 'desc'. Example: ['orders.count desc']",
            },
            limit: {
              type: "string",
              description: "Row limit (as string). Example: '500'",
              default: "500",
            },
          },
        }),
        aiUsageHint:
          "Run a custom query against a Looker model. You need to know the model name, explore name, and field names. Use list_models to discover available models and fields.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.cloud.looker.com",
          model: "ecommerce",
          view: "orders",
          fields: [
            "orders.created_date",
            "orders.count",
            "orders.total_revenue",
          ],
          filters: {
            "orders.created_date": "last 30 days",
          },
          sorts: ["orders.total_revenue desc"],
          limit: "100",
        }),
      },
      {
        name: "list_dashboards",
        displayName: "List Dashboards",
        description:
          "List all dashboards accessible to the authenticated user. Returns dashboard titles, IDs, and folder locations.",
        method: "GET" as const,
        path: "{instanceUrl}/api/4.0/dashboards",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Looker instance URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "fields",
            type: "string",
            description:
              "Comma-separated fields. Example: id,title,description,folder",
          },
          {
            name: "limit",
            type: "number",
            default: 100,
            description: "Max results",
          },
        ]),
        aiUsageHint:
          "List available dashboards. Use fields param to limit response size.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.cloud.looker.com",
          fields: "id,title,description,folder",
          limit: 50,
        }),
      },
      {
        name: "get_dashboard",
        displayName: "Get Dashboard",
        description:
          "Get detailed dashboard information including all tiles/elements, filters, and layout.",
        method: "GET" as const,
        path: "{instanceUrl}/api/4.0/dashboards/{dashboard_id}",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Looker instance URL",
          },
          {
            name: "dashboard_id",
            type: "string",
            required: true,
            description: "Looker dashboard ID (numeric or slug)",
          },
        ]),
        aiUsageHint:
          "Get a dashboard's structure including all tiles and their underlying queries. Use this to understand what data a dashboard shows.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.cloud.looker.com",
          dashboard_id: "15",
        }),
      },
      {
        name: "list_looks",
        displayName: "List Looks",
        description:
          "List all saved Looks. Looks are saved queries with visualization settings.",
        method: "GET" as const,
        path: "{instanceUrl}/api/4.0/looks",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Looker instance URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "fields",
            type: "string",
            description: "Comma-separated fields. Example: id,title,description,model",
          },
          {
            name: "limit",
            type: "number",
            default: 100,
            description: "Max results",
          },
        ]),
        aiUsageHint:
          "List saved Looks. Get Look IDs to use with run_look endpoint.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.cloud.looker.com",
          fields: "id,title,description,model",
          limit: 50,
        }),
      },
      {
        name: "search_content",
        displayName: "Search Content",
        description:
          "Search for dashboards, Looks, and other content across the Looker instance by title or description.",
        method: "GET" as const,
        path: "{instanceUrl}/api/4.0/search/content",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Looker instance URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "terms",
            type: "string",
            required: true,
            description: "Search terms",
          },
          {
            name: "limit",
            type: "number",
            default: 20,
            description: "Max results",
          },
          {
            name: "types",
            type: "string",
            description: "Comma-separated content types: dashboard, look, query",
          },
        ]),
        aiUsageHint:
          "Search for content by keyword. Use types filter to narrow to dashboards or looks only.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.cloud.looker.com",
          terms: "revenue monthly",
          types: "dashboard,look",
          limit: 10,
        }),
      },
      {
        name: "create_query",
        displayName: "Create Query",
        description:
          "Create a reusable query object in Looker. Returns a query ID that can be run later or embedded in dashboards.",
        method: "POST" as const,
        path: "{instanceUrl}/api/4.0/queries",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Looker instance URL",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["model", "view", "fields"],
          properties: {
            model: { type: "string", description: "LookML model name" },
            view: { type: "string", description: "Explore/view name" },
            fields: {
              type: "array",
              items: { type: "string" },
              description: "Dimension and measure field names",
            },
            filters: {
              type: "object",
              description: "Field-value filter pairs",
            },
            sorts: {
              type: "array",
              items: { type: "string" },
              description: "Sort fields",
            },
            limit: { type: "string", description: "Row limit" },
          },
        }),
        aiUsageHint:
          "Create a saved query for reuse. Similar to run_inline_query but saves the query and returns an ID instead of results.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.cloud.looker.com",
          model: "ecommerce",
          view: "orders",
          fields: ["orders.created_month", "orders.count", "orders.total_revenue"],
          filters: { "orders.created_date": "last 12 months" },
          sorts: ["orders.created_month"],
          limit: "12",
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
      message: "✅ Looker blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Go to Looker Admin → Users → Edit your user → API Keys",
        "2. Generate a new API key pair (Client ID + Client Secret)",
        "3. Connect via the Integrations page using basic auth",
        "4. Enter Client ID as username and Client Secret as password",
        "5. Note: The execution engine will auto-login via /login endpoint to get Bearer token",
      ],
    };
  },
});
