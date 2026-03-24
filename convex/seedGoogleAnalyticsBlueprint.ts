/**
 * Seed Google Analytics (GA4) integration blueprint
 *
 * Uses the Google Analytics Data API v1beta for running reports.
 * Requires a Google Cloud project with Analytics Data API enabled.
 *
 * Usage:
 * npx convex run seedGoogleAnalyticsBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "google-analytics"))
      .first();

    if (existing) {
      return { message: "Google Analytics blueprint already exists", blueprintId: existing._id };
    }

    const authConfig = {
      clientId: process.env.GOOGLE_ANALYTICS_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
      clientSecret: "OAUTH_SECRET_GOOGLE_ANALYTICS",
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
      scopeSeparator: "space",
      tokenEndpointAuth: "body",
      extraAuthParams: {
        access_type: "offline",
        prompt: "consent",
      },
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "google-analytics",
      name: "Google Analytics",
      description: "Web analytics — run GA4 reports, view realtime data, analyze traffic sources, user behavior, and conversions.",
      category: "analytics",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://analyticsdata.googleapis.com",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      sourceType: "manual",
      sourceUrl: "https://developers.google.com/analytics/devguides/reporting/data/v1",
      iconUrl: "https://cdn.simpleicons.org/googleanalytics/E37400",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "run_report",
        displayName: "Run Report",
        description: "Run a custom GA4 report with specified dimensions, metrics, and date range",
        method: "POST" as const,
        path: "/v1beta/properties/{property_id}:runReport",
        pathParams: JSON.stringify([
          { name: "property_id", type: "string", required: true, description: "GA4 property ID (e.g. 123456789)" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["dateRanges", "metrics"],
          properties: {
            dateRanges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  startDate: { type: "string", description: "Start date (YYYY-MM-DD or relative: yesterday, 7daysAgo, 30daysAgo)" },
                  endDate: { type: "string", description: "End date (YYYY-MM-DD or relative: today, yesterday)" },
                },
              },
            },
            dimensions: {
              type: "array",
              items: { type: "object", properties: { name: { type: "string" } } },
              description: "Dimensions like date, country, pagePath, sessionSource, deviceCategory",
            },
            metrics: {
              type: "array",
              items: { type: "object", properties: { name: { type: "string" } } },
              description: "Metrics like activeUsers, sessions, screenPageViews, conversions, totalRevenue",
            },
            limit: { type: "number", description: "Max rows to return (default 10000)" },
          },
        }),
        aiUsageHint: "Run a GA4 report. Common metrics: activeUsers, sessions, screenPageViews, bounceRate, averageSessionDuration. Common dimensions: date, country, city, pagePath, sessionSource, deviceCategory.",
        exampleArgs: JSON.stringify({
          property_id: "123456789",
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "date" }],
          metrics: [{ name: "activeUsers" }, { name: "sessions" }],
        }),
      },
      {
        name: "run_realtime_report",
        displayName: "Realtime Report",
        description: "Run a realtime report showing activity in the last 30 minutes",
        method: "POST" as const,
        path: "/v1beta/properties/{property_id}:runRealtimeReport",
        pathParams: JSON.stringify([
          { name: "property_id", type: "string", required: true, description: "GA4 property ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            dimensions: {
              type: "array",
              items: { type: "object", properties: { name: { type: "string" } } },
              description: "e.g. unifiedScreenName, country, city, platform",
            },
            metrics: {
              type: "array",
              items: { type: "object", properties: { name: { type: "string" } } },
              description: "e.g. activeUsers, screenPageViews, conversions",
            },
          },
        }),
        aiUsageHint: "Get realtime activity (last 30 min). Good for monitoring live traffic.",
        exampleArgs: JSON.stringify({
          property_id: "123456789",
          dimensions: [{ name: "country" }],
          metrics: [{ name: "activeUsers" }],
        }),
      },
      {
        name: "get_metadata",
        displayName: "Get Available Metrics & Dimensions",
        description: "List all available dimensions and metrics for a GA4 property",
        method: "GET" as const,
        path: "/v1beta/properties/{property_id}/metadata",
        pathParams: JSON.stringify([
          { name: "property_id", type: "string", required: true, description: "GA4 property ID" },
        ]),
        aiUsageHint: "Discover what dimensions and metrics are available for a property. Call this first if unsure what metrics to use.",
        exampleArgs: JSON.stringify({ property_id: "123456789" }),
      },
      {
        name: "batch_run_reports",
        displayName: "Batch Run Reports",
        description: "Run multiple reports in a single request for efficiency",
        method: "POST" as const,
        path: "/v1beta/properties/{property_id}:batchRunReports",
        pathParams: JSON.stringify([
          { name: "property_id", type: "string", required: true, description: "GA4 property ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["requests"],
          properties: {
            requests: {
              type: "array",
              description: "Array of report requests (same schema as run_report body)",
            },
          },
        }),
        aiUsageHint: "Run up to 5 reports in one call. Each request follows the same format as run_report.",
        exampleArgs: JSON.stringify({
          property_id: "123456789",
          requests: [
            { dateRanges: [{ startDate: "7daysAgo", endDate: "today" }], metrics: [{ name: "activeUsers" }] },
            { dateRanges: [{ startDate: "7daysAgo", endDate: "today" }], metrics: [{ name: "sessions" }], dimensions: [{ name: "country" }] },
          ],
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
      message: "Google Analytics blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Create OAuth app at https://console.cloud.google.com/apis/credentials",
        "2. Enable 'Google Analytics Data API' in APIs & Services",
        "3. Set authorized redirect URI to: https://<YOUR_DEPLOYMENT>.convex.site/api/integrations/oauth/callback",
        "4. npx convex env set GOOGLE_ANALYTICS_CLIENT_ID '<client_id>' --url https://<YOUR_DEPLOYMENT>.convex.cloud",
        "5. npx convex env set OAUTH_SECRET_GOOGLE_ANALYTICS '<client_secret>' --url https://<YOUR_DEPLOYMENT>.convex.cloud",
      ],
    };
  },
});
