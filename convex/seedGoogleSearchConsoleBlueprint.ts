import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    // Check for existing blueprint
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "google-search-console"))
      .first();
    if (existing) {
      return { success: false, message: "Google Search Console blueprint already exists", id: existing._id };
    }

    const now = Date.now();

    const authConfig = JSON.stringify({
      clientId: "1000649180692-u40dcqcpitqrir90ns9i1dg510q0idgc.apps.googleusercontent.com",
      clientSecret: "OAUTH_SECRET_GOOGLE",
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
      scopeSeparator: "space",
      extraAuthParams: { access_type: "offline", prompt: "consent" },
      tokenEndpointAuth: "body",
    });

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "google-search-console",
      name: "Google Search Console",
      description: "Search performance analytics — query impressions, clicks, CTR, and position data. Monitor brand visibility and keyword rankings.",
      category: "analytics",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig,
      baseUrl: "https://searchconsole.googleapis.com",
      defaultHeaders: JSON.stringify({ Accept: "application/json", "Content-Type": "application/json" }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.google.com/webmaster-tools/v1/api_reference_index",
      iconUrl: "https://cdn.simpleicons.org/googlesearchconsole/458CF5",
      createdBy: "system",
      createdAt: now,
      updatedAt: now,
    });

    const tools = [
      {
        name: "list_sites",
        displayName: "List Sites",
        description: "List all sites the authenticated user has access to in Search Console",
        method: "GET",
        path: "/webmasters/v3/sites",
        pathParams: [],
        queryParams: [],
        bodySchema: null,
        aiUsageHint: "List all verified Search Console properties. Returns site URLs and permission levels. Call this first to discover available sites.",
        exampleArgs: {},
      },
      {
        name: "get_site",
        displayName: "Get Site Info",
        description: "Get details about a specific site property",
        method: "GET",
        path: "/webmasters/v3/sites/{site_url}",
        pathParams: [{ name: "site_url", type: "string", required: true, description: "URL-encoded site URL (e.g. 'https%3A%2F%2Fexample.com%2F' or 'sc-domain%3Aexample.com')" }],
        queryParams: [],
        bodySchema: null,
        aiUsageHint: "Get info about a specific site. The site_url must be URL-encoded.",
        exampleArgs: { site_url: "https%3A%2F%2Fexample.com%2F" },
      },
      {
        name: "query_search_analytics",
        displayName: "Query Search Analytics",
        description: "Query search analytics — impressions, clicks, CTR, and position. Filter by query keywords, pages, date range, country, and device. Essential for brand monitoring.",
        method: "POST",
        path: "/webmasters/v3/sites/{site_url}/searchAnalytics/query",
        pathParams: [{ name: "site_url", type: "string", required: true, description: "URL-encoded site URL" }],
        queryParams: [],
        bodySchema: JSON.stringify({
          type: "object",
          required: ["startDate", "endDate"],
          properties: {
            startDate: { type: "string", description: "Start date YYYY-MM-DD" },
            endDate: { type: "string", description: "End date YYYY-MM-DD" },
            dimensions: { type: "array", items: { type: "string", enum: ["query", "page", "country", "device", "date", "searchAppearance"] } },
            dimensionFilterGroups: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  groupType: { type: "string", enum: ["and"] },
                  filters: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        dimension: { type: "string", enum: ["query", "page", "country", "device"] },
                        operator: { type: "string", enum: ["contains", "equals", "notContains", "notEquals", "includingRegex", "excludingRegex"] },
                        expression: { type: "string" },
                      },
                      required: ["dimension", "operator", "expression"],
                    },
                  },
                },
              },
            },
            rowLimit: { type: "number", description: "Max rows (1-25000, default 1000)" },
            startRow: { type: "number", description: "Offset for pagination" },
            type: { type: "string", enum: ["web", "image", "video", "news", "discover"] },
            dataState: { type: "string", enum: ["final", "all"] },
          },
        }),
        aiUsageHint: "Query search performance. For brand monitoring: dimensions=['query','date'], filter dimension='query' operator='contains' expression='brand name'. Returns clicks, impressions, ctr, position.",
        exampleArgs: {
          site_url: "sc-domain%3Aexample.com",
          startDate: "2026-02-01",
          endDate: "2026-03-19",
          dimensions: ["query", "date"],
          dimensionFilterGroups: [{ groupType: "and", filters: [{ dimension: "query", operator: "contains", expression: "brand name" }] }],
          rowLimit: 1000,
          dataState: "all",
        },
      },
      {
        name: "list_sitemaps",
        displayName: "List Sitemaps",
        description: "List all sitemaps submitted for a site",
        method: "GET",
        path: "/webmasters/v3/sites/{site_url}/sitemaps",
        pathParams: [{ name: "site_url", type: "string", required: true, description: "URL-encoded site URL" }],
        queryParams: [],
        bodySchema: null,
        aiUsageHint: "List sitemaps for a site. Returns URLs, types, last download time, and errors.",
        exampleArgs: { site_url: "https%3A%2F%2Fexample.com%2F" },
      },
    ];

    for (const tool of tools) {
      await ctx.db.insert("blueprintTools", {
        ...tool,
        bodySchema: tool.bodySchema || undefined,
        pathParams: tool.pathParams.length > 0 ? JSON.stringify(tool.pathParams) : undefined,
        queryParams: tool.queryParams.length > 0 ? JSON.stringify(tool.queryParams) : undefined,
        exampleArgs: tool.exampleArgs ? JSON.stringify(tool.exampleArgs) : undefined,
        blueprintId,
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      success: true,
      message: "Google Search Console blueprint created with 4 tools",
      blueprintId,
      nextSteps: [
        "1. Enable 'Search Console API' at https://console.cloud.google.com/apis/library/searchconsole.googleapis.com",
        "2. The webmasters.readonly scope uses the shared Google OAuth — no new env vars needed",
        "3. Connect via your app's integrations page",
      ],
    };
  },
});
