/**
 * Add more tools to the existing Google Analytics blueprint.
 * Run after seedGoogleAnalyticsBlueprint.
 *
 * Usage:
 * npx convex run addGoogleAnalyticsTools --url https://beloved-squirrel-599.convex.cloud
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const blueprint = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "google-analytics"))
      .first();

    if (!blueprint) {
      throw new Error("Google Analytics blueprint not found. Run seedGoogleAnalyticsBlueprint first.");
    }

    const now = Date.now();

    const newTools = [
      {
        name: "run_pivot_report",
        displayName: "Run Pivot Report",
        description: "Run a pivot table report — useful for cross-tabulating dimensions like country vs device",
        method: "POST" as const,
        path: "/v1beta/properties/{property_id}:runPivotReport",
        pathParams: JSON.stringify([
          { name: "property_id", type: "string", required: true, description: "GA4 property ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["dateRanges", "pivots", "metrics"],
          properties: {
            dateRanges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  startDate: { type: "string" },
                  endDate: { type: "string" },
                },
              },
            },
            pivots: {
              type: "array",
              description: "Pivot configurations — which dimension to pivot on",
              items: {
                type: "object",
                properties: {
                  fieldNames: { type: "array", items: { type: "string" }, description: "Dimension names to pivot" },
                  limit: { type: "number", description: "Max pivot values to return" },
                },
              },
            },
            dimensions: {
              type: "array",
              items: { type: "object", properties: { name: { type: "string" } } },
            },
            metrics: {
              type: "array",
              items: { type: "object", properties: { name: { type: "string" } } },
            },
          },
        }),
        aiUsageHint: "Run a pivot report. Example: pivot on 'country' to see sessions broken down by country across date ranges.",
        exampleArgs: JSON.stringify({
          property_id: "123456789",
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "country" }],
          metrics: [{ name: "sessions" }],
          pivots: [{ fieldNames: ["country"], limit: 10 }],
        }),
      },
      {
        name: "list_properties",
        displayName: "List GA4 Properties",
        description: "List all GA4 properties accessible to the authenticated user (via Admin API)",
        method: "GET" as const,
        path: "/v1beta/accountSummaries",
        aiUsageHint: "List all GA4 accounts and properties. Use this to discover property IDs before running reports.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "get_property",
        displayName: "Get Property Details",
        description: "Get details about a specific GA4 property including timezone, currency, and industry",
        method: "GET" as const,
        path: "/v1beta/properties/{property_id}",
        pathParams: JSON.stringify([
          { name: "property_id", type: "string", required: true, description: "GA4 property ID (e.g. 123456789)" },
        ]),
        aiUsageHint: "Get GA4 property details. Returns displayName, timezone, currencyCode, industryCategory.",
        exampleArgs: JSON.stringify({ property_id: "123456789" }),
      },
      {
        name: "run_funnel_report",
        displayName: "Run Funnel Report",
        description: "Analyze a conversion funnel — see where users drop off between steps",
        method: "POST" as const,
        path: "/v1alpha/properties/{property_id}:runFunnelReport",
        pathParams: JSON.stringify([
          { name: "property_id", type: "string", required: true, description: "GA4 property ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["dateRanges", "funnel"],
          properties: {
            dateRanges: {
              type: "array",
              items: { type: "object", properties: { startDate: { type: "string" }, endDate: { type: "string" } } },
            },
            funnel: {
              type: "object",
              description: "Funnel definition",
              properties: {
                steps: {
                  type: "array",
                  description: "Funnel steps in order",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Step name" },
                      filterExpression: { type: "object", description: "Filter to match this step" },
                    },
                  },
                },
              },
            },
            funnelBreakdown: {
              type: "object",
              description: "Optional breakdown dimension",
            },
          },
        }),
        aiUsageHint: "Analyze a conversion funnel. Define steps as event filters. Good for checkout flow analysis.",
        exampleArgs: JSON.stringify({
          property_id: "123456789",
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          funnel: {
            steps: [
              { name: "Homepage", filterExpression: { filter: { fieldName: "pagePath", stringFilter: { value: "/" } } } },
              { name: "Product Page", filterExpression: { filter: { fieldName: "pagePath", stringFilter: { matchType: "CONTAINS", value: "/product" } } } },
              { name: "Checkout", filterExpression: { filter: { fieldName: "pagePath", stringFilter: { matchType: "CONTAINS", value: "/checkout" } } } },
            ],
          },
        }),
      },
      {
        name: "get_audience_list",
        displayName: "Get Audience List",
        description: "Export the list of users in a GA4 audience segment",
        method: "POST" as const,
        path: "/v1beta/properties/{property_id}/audienceLists",
        pathParams: JSON.stringify([
          { name: "property_id", type: "string", required: true, description: "GA4 property ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["audience"],
          properties: {
            audience: { type: "string", description: "Audience resource name e.g. properties/123/audiences/456" },
            dimensions: {
              type: "array",
              items: { type: "object", properties: { dimensionName: { type: "string" } } },
              description: "User dimensions to export e.g. deviceId, userId, firstName",
            },
          },
        }),
        aiUsageHint: "Export users in a GA4 audience. First creates the list (async), then query it. Useful for remarketing or CRM sync.",
        exampleArgs: JSON.stringify({
          property_id: "123456789",
          audience: "properties/123456789/audiences/12345",
          dimensions: [{ dimensionName: "userId" }, { dimensionName: "deviceId" }],
        }),
      },
      {
        name: "check_compatibility",
        displayName: "Check Metric/Dimension Compatibility",
        description: "Check which dimensions and metrics can be used together in a report",
        method: "POST" as const,
        path: "/v1beta/properties/{property_id}:checkCompatibility",
        pathParams: JSON.stringify([
          { name: "property_id", type: "string", required: true, description: "GA4 property ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            dimensions: {
              type: "array",
              items: { type: "object", properties: { name: { type: "string" } } },
            },
            metrics: {
              type: "array",
              items: { type: "object", properties: { name: { type: "string" } } },
            },
          },
        }),
        aiUsageHint: "Check if a combination of metrics and dimensions are compatible before running a report. Returns COMPATIBLE or INCOMPATIBLE for each.",
        exampleArgs: JSON.stringify({
          property_id: "123456789",
          dimensions: [{ name: "date" }, { name: "country" }],
          metrics: [{ name: "activeUsers" }, { name: "totalRevenue" }],
        }),
      },
    ];

    const toolIds = [];
    for (const tool of newTools) {
      const existingTool = await ctx.db
        .query("blueprintTools")
        .withIndex("by_blueprint_name", (q) =>
          q.eq("blueprintId", blueprint._id).eq("name", tool.name)
        )
        .first();

      if (!existingTool) {
        const toolId = await ctx.db.insert("blueprintTools", {
          ...tool,
          blueprintId: blueprint._id,
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
        toolIds.push(toolId);
      }
    }

    return {
      message: `Added ${toolIds.length} new tools to Google Analytics blueprint`,
      toolsAdded: toolIds.length,
    };
  },
});
