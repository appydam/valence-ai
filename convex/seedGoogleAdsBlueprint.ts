/**
 * Seed Google Ads integration blueprint
 * Run this once to create the Google Ads blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedGoogleAdsBlueprint -> Run
 *
 * Prerequisites:
 * 1. Create OAuth credentials in Google Cloud Console → APIs & Services → Credentials
 *    - Add redirect URI: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback
 *    - Enable Google Ads API in the API Library
 * 2. Apply for a Google Ads API developer token at https://ads.google.com/aw/apicenter
 * 3. Set in Convex env vars:
 *    - GOOGLE_ADS_CLIENT_ID = OAuth Client ID
 *    - OAUTH_SECRET_GOOGLE_ADS = OAuth Client Secret
 *    - GOOGLE_ADS_DEVELOPER_TOKEN = Developer token from API Center
 *
 * IMPORTANT: Google Ads API uses GAQL (Google Ads Query Language) for most queries.
 * Queries are sent as POST requests with a GAQL string. A developer-token header is
 * required on every request in addition to the OAuth Bearer token.
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "google-ads"))
      .first();

    if (existing) {
      return {
        message: "Google Ads blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "google-ads",
      name: "Google Ads",
      description:
        "Manage Google Ads campaigns, ad groups, and keywords. View performance metrics like impressions, clicks, conversions, and spend. Pause or enable campaigns programmatically.",
      category: "Advertising",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId:
          process.env.GOOGLE_ADS_CLIENT_ID || "YOUR_GOOGLE_ADS_CLIENT_ID",
        clientSecret: "OAUTH_SECRET_GOOGLE_ADS",
        authorizeUrl:
          "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scopes: ["https://www.googleapis.com/auth/adwords"],
        scopeSeparator: "space",
        extraAuthParams: {
          access_type: "offline",
          prompt: "consent",
        },
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://googleads.googleapis.com/v16",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl:
        "https://developers.google.com/google-ads/api/docs/start",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/google-ads-1.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_accessible_customers",
        displayName: "List Accessible Customers",
        description:
          "List all Google Ads customer accounts accessible by the authenticated user. Returns customer IDs needed for all other queries.",
        method: "GET" as const,
        path: "/customers:listAccessibleCustomers",
        aiUsageHint:
          "List accessible Google Ads customer (account) IDs. Call this first to get customer_id values for other endpoints. Returns resource names like 'customers/1234567890'.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "search_campaigns",
        displayName: "Search Campaigns",
        description:
          "Search for campaigns using GAQL (Google Ads Query Language). Returns campaign names, status, budget, and type.",
        method: "POST" as const,
        path: "/customers/{customer_id}/googleAds:searchStream",
        pathParams: JSON.stringify([
          {
            name: "customer_id",
            type: "string",
            required: true,
            description:
              "Google Ads customer ID (10-digit number, no dashes)",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["query"],
          properties: {
            query: {
              type: "string",
              description: "GAQL query string for campaigns",
            },
          },
        }),
        aiUsageHint:
          "Search campaigns with GAQL. Example query: SELECT campaign.id, campaign.name, campaign.status, campaign_budget.amount_micros FROM campaign WHERE campaign.status = 'ENABLED' ORDER BY campaign.name",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign_budget.amount_micros FROM campaign WHERE campaign.status != 'REMOVED' ORDER BY campaign.name",
        }),
      },
      {
        name: "search_ad_groups",
        displayName: "Search Ad Groups",
        description:
          "Search for ad groups using GAQL. Returns ad group names, status, and associated campaign.",
        method: "POST" as const,
        path: "/customers/{customer_id}/googleAds:searchStream",
        pathParams: JSON.stringify([
          {
            name: "customer_id",
            type: "string",
            required: true,
            description: "Google Ads customer ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["query"],
          properties: {
            query: {
              type: "string",
              description: "GAQL query for ad groups",
            },
          },
        }),
        aiUsageHint:
          "Search ad groups. Example: SELECT ad_group.id, ad_group.name, ad_group.status, campaign.name FROM ad_group WHERE campaign.id = 123456789",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT ad_group.id, ad_group.name, ad_group.status, ad_group.type, campaign.id, campaign.name FROM ad_group WHERE ad_group.status = 'ENABLED'",
        }),
      },
      {
        name: "get_campaign_metrics",
        displayName: "Get Campaign Metrics",
        description:
          "Get performance metrics for campaigns: impressions, clicks, cost, conversions, CTR, and CPC. Specify date range in the GAQL query.",
        method: "POST" as const,
        path: "/customers/{customer_id}/googleAds:searchStream",
        pathParams: JSON.stringify([
          {
            name: "customer_id",
            type: "string",
            required: true,
            description: "Google Ads customer ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["query"],
          properties: {
            query: {
              type: "string",
              description:
                "GAQL query with metrics. Include segments.date for daily breakdown.",
            },
          },
        }),
        aiUsageHint:
          "Get campaign metrics with GAQL. Costs are in micros (divide by 1,000,000). Example: SELECT campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.ctr FROM campaign WHERE segments.date DURING LAST_30_DAYS",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT campaign.id, campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.ctr, metrics.average_cpc FROM campaign WHERE segments.date DURING LAST_30_DAYS AND campaign.status = 'ENABLED' ORDER BY metrics.cost_micros DESC",
        }),
      },
      {
        name: "get_keyword_performance",
        displayName: "Get Keyword Performance",
        description:
          "Get performance metrics for keywords/search terms. Shows which keywords drive impressions, clicks, and conversions.",
        method: "POST" as const,
        path: "/customers/{customer_id}/googleAds:searchStream",
        pathParams: JSON.stringify([
          {
            name: "customer_id",
            type: "string",
            required: true,
            description: "Google Ads customer ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["query"],
          properties: {
            query: {
              type: "string",
              description: "GAQL query for keyword metrics",
            },
          },
        }),
        aiUsageHint:
          "Get keyword performance. Example: SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM keyword_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.impressions DESC LIMIT 50",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.average_cpc FROM keyword_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.cost_micros DESC LIMIT 50",
        }),
      },
      {
        name: "update_campaign_status",
        displayName: "Update Campaign Status",
        description:
          "Enable or pause a Google Ads campaign by mutating its status.",
        method: "POST" as const,
        path: "/customers/{customer_id}/campaigns:mutate",
        pathParams: JSON.stringify([
          {
            name: "customer_id",
            type: "string",
            required: true,
            description: "Google Ads customer ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["operations"],
          properties: {
            operations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  updateMask: {
                    type: "string",
                    description: "Fields to update. For status: 'status'",
                  },
                  update: {
                    type: "object",
                    properties: {
                      resourceName: {
                        type: "string",
                        description:
                          "Campaign resource name: customers/{customer_id}/campaigns/{campaign_id}",
                      },
                      status: {
                        type: "string",
                        description: "ENABLED or PAUSED",
                        enum: ["ENABLED", "PAUSED"],
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Enable or pause a campaign. Use updateMask='status' and set status to ENABLED or PAUSED. Confirm with user before changing.",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          operations: [
            {
              updateMask: "status",
              update: {
                resourceName: "customers/1234567890/campaigns/9876543210",
                status: "PAUSED",
              },
            },
          ],
        }),
      },
      {
        name: "get_ad_performance",
        displayName: "Get Ad Performance",
        description:
          "Get performance metrics for individual ads. Shows which ad creatives perform best.",
        method: "POST" as const,
        path: "/customers/{customer_id}/googleAds:searchStream",
        pathParams: JSON.stringify([
          {
            name: "customer_id",
            type: "string",
            required: true,
            description: "Google Ads customer ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["query"],
          properties: {
            query: {
              type: "string",
              description: "GAQL query for ad-level metrics",
            },
          },
        }),
        aiUsageHint:
          "Get ad-level metrics. Example: SELECT ad_group_ad.ad.id, ad_group_ad.ad.type, ad_group_ad.ad.responsive_search_ad.headlines, metrics.impressions, metrics.clicks, metrics.conversions FROM ad_group_ad WHERE segments.date DURING LAST_30_DAYS",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT ad_group_ad.ad.id, ad_group_ad.ad.type, ad_group_ad.status, campaign.name, ad_group.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM ad_group_ad WHERE segments.date DURING LAST_30_DAYS AND ad_group_ad.status = 'ENABLED' ORDER BY metrics.impressions DESC LIMIT 50",
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
      message: "✅ Google Ads blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Go to Google Cloud Console → APIs & Services → Credentials",
        "2. Create an OAuth 2.0 Client ID (Web application type)",
        "3. Add redirect URI: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "4. Enable 'Google Ads API' in the API Library",
        "5. Apply for a developer token at https://ads.google.com/aw/apicenter",
        "6. Set GOOGLE_ADS_CLIENT_ID in Convex env vars",
        "7. Set OAUTH_SECRET_GOOGLE_ADS in Convex env vars",
        "8. Set GOOGLE_ADS_DEVELOPER_TOKEN in Convex env vars",
        "9. Note: developer-token header must be included on every request",
      ],
    };
  },
});
