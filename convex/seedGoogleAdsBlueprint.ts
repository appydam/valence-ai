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
 *    - Add redirect URI: https://<YOUR_DEPLOYMENT>.convex.site/api/integrations/oauth/callback
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
      // --- Read Operations (searchStream) ---
      {
        name: "get_search_terms",
        displayName: "Get Search Terms",
        description:
          "Search term report showing actual queries people typed that triggered your ads. Shows impressions, clicks, cost, and conversions per query.",
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
              description: "GAQL query for search term view",
            },
          },
        }),
        aiUsageHint:
          "Get actual search queries that triggered ads. Example: SELECT search_term_view.search_term, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM search_term_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.impressions DESC LIMIT 100",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT search_term_view.search_term, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM search_term_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.impressions DESC LIMIT 100",
        }),
      },
      {
        name: "get_location_performance",
        displayName: "Get Location Performance",
        description:
          "Performance by geographic location. Shows impressions, clicks, and conversions broken down by country or region.",
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
              description: "GAQL query for geographic view",
            },
          },
        }),
        aiUsageHint:
          "Get performance by location. Example: SELECT geographic_view.country_criterion_id, geographic_view.location_type, metrics.impressions, metrics.clicks, metrics.conversions FROM geographic_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.clicks DESC",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT geographic_view.country_criterion_id, geographic_view.location_type, metrics.impressions, metrics.clicks, metrics.conversions FROM geographic_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.clicks DESC",
        }),
      },
      {
        name: "get_device_performance",
        displayName: "Get Device Performance",
        description:
          "Performance by device type (mobile, desktop, tablet). Shows impressions, clicks, cost, and conversions segmented by device.",
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
              description: "GAQL query with segments.device",
            },
          },
        }),
        aiUsageHint:
          "Get performance by device. Example: SELECT segments.device, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM campaign WHERE segments.date DURING LAST_30_DAYS",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT segments.device, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM campaign WHERE segments.date DURING LAST_30_DAYS",
        }),
      },
      {
        name: "get_age_gender_performance",
        displayName: "Get Age & Gender Performance",
        description:
          "Performance by demographic — age ranges and gender. Shows impressions, clicks, and conversions broken down by audience demographics.",
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
              description: "GAQL query for age/gender demographics",
            },
          },
        }),
        aiUsageHint:
          "Get demographic performance. Example: SELECT ad_group_criterion.age_range.type, ad_group_criterion.gender.type, metrics.impressions, metrics.clicks, metrics.conversions FROM gender_view WHERE segments.date DURING LAST_30_DAYS",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT ad_group_criterion.age_range.type, ad_group_criterion.gender.type, metrics.impressions, metrics.clicks, metrics.conversions FROM gender_view WHERE segments.date DURING LAST_30_DAYS",
        }),
      },
      {
        name: "get_conversion_actions",
        displayName: "Get Conversion Actions",
        description:
          "List all conversion tracking actions configured in the account. Shows conversion ID, name, type, and status.",
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
              description: "GAQL query for conversion actions",
            },
          },
        }),
        aiUsageHint:
          "List conversion actions. Example: SELECT conversion_action.id, conversion_action.name, conversion_action.type, conversion_action.status FROM conversion_action ORDER BY conversion_action.name",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT conversion_action.id, conversion_action.name, conversion_action.type, conversion_action.status FROM conversion_action ORDER BY conversion_action.name",
        }),
      },
      {
        name: "get_change_history",
        displayName: "Get Change History",
        description:
          "Recent changes and edits to the account — an audit trail of who changed what and when.",
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
              description: "GAQL query for change events",
            },
          },
        }),
        aiUsageHint:
          "Get account change history. Example: SELECT change_event.change_date_time, change_event.change_resource_type, change_event.user_email, change_event.client_type FROM change_event WHERE change_event.change_date_time DURING LAST_14_DAYS ORDER BY change_event.change_date_time DESC LIMIT 50",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT change_event.change_date_time, change_event.change_resource_type, change_event.user_email, change_event.client_type FROM change_event WHERE change_event.change_date_time DURING LAST_14_DAYS ORDER BY change_event.change_date_time DESC LIMIT 50",
        }),
      },
      {
        name: "get_bidding_strategies",
        displayName: "Get Bidding Strategies",
        description:
          "Active bidding strategies and their performance. Shows strategy type, cost, and conversions.",
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
              description: "GAQL query for bidding strategies",
            },
          },
        }),
        aiUsageHint:
          "Get bidding strategies. Example: SELECT bidding_strategy.id, bidding_strategy.name, bidding_strategy.type, metrics.cost_micros, metrics.conversions FROM bidding_strategy WHERE segments.date DURING LAST_30_DAYS",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT bidding_strategy.id, bidding_strategy.name, bidding_strategy.type, metrics.cost_micros, metrics.conversions FROM bidding_strategy WHERE segments.date DURING LAST_30_DAYS",
        }),
      },
      {
        name: "get_quality_scores",
        displayName: "Get Quality Scores",
        description:
          "Keyword quality scores (1-10). Shows quality score, creative quality score, and keyword text.",
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
              description: "GAQL query for keyword quality scores",
            },
          },
        }),
        aiUsageHint:
          "Get keyword quality scores. Example: SELECT ad_group_criterion.keyword.text, ad_group_criterion.quality_info.quality_score, ad_group_criterion.quality_info.creative_quality_score FROM keyword_view WHERE ad_group_criterion.status = 'ENABLED' ORDER BY ad_group_criterion.quality_info.quality_score ASC LIMIT 50",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT ad_group_criterion.keyword.text, ad_group_criterion.quality_info.quality_score, ad_group_criterion.quality_info.creative_quality_score FROM keyword_view WHERE ad_group_criterion.status = 'ENABLED' ORDER BY ad_group_criterion.quality_info.quality_score ASC LIMIT 50",
        }),
      },
      {
        name: "get_ad_extensions",
        displayName: "Get Ad Extensions",
        description:
          "List sitelink, callout, call, and other ad extensions (assets) attached to campaigns.",
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
              description: "GAQL query for campaign assets",
            },
          },
        }),
        aiUsageHint:
          "List ad extensions. Example: SELECT asset.name, asset.type, campaign_asset.campaign FROM campaign_asset ORDER BY asset.type",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT asset.name, asset.type, campaign_asset.campaign FROM campaign_asset ORDER BY asset.type",
        }),
      },
      {
        name: "get_audience_performance",
        displayName: "Get Audience Performance",
        description:
          "Performance by audience segment. Shows impressions, clicks, and conversions per audience.",
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
              description: "GAQL query for audience performance",
            },
          },
        }),
        aiUsageHint:
          "Get audience performance. Example: SELECT campaign_audience_view.resource_name, metrics.impressions, metrics.clicks, metrics.conversions FROM campaign_audience_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.conversions DESC",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT campaign_audience_view.resource_name, metrics.impressions, metrics.clicks, metrics.conversions FROM campaign_audience_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.conversions DESC",
        }),
      },
      // --- Write/Mutate Operations ---
      {
        name: "create_campaign",
        displayName: "Create Campaign",
        description:
          "Create a new Google Ads campaign. Specify name, status, advertising channel type, and campaign budget resource name.",
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
                  create: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        description: "Campaign name",
                      },
                      status: {
                        type: "string",
                        enum: ["ENABLED", "PAUSED"],
                        description: "Initial campaign status",
                      },
                      advertisingChannelType: {
                        type: "string",
                        enum: ["SEARCH", "DISPLAY", "SHOPPING", "VIDEO", "PERFORMANCE_MAX"],
                        description: "Campaign type",
                      },
                      campaignBudget: {
                        type: "string",
                        description:
                          "Budget resource name: customers/{customer_id}/campaignBudgets/{budget_id}",
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Create a new campaign. Create a campaign budget first, then reference it. Confirm all settings with user before creating.",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          operations: [
            {
              create: {
                name: "Spring Sale 2026",
                status: "PAUSED",
                advertisingChannelType: "SEARCH",
                campaignBudget: "customers/1234567890/campaignBudgets/111111",
              },
            },
          ],
        }),
      },
      {
        name: "create_ad_group",
        displayName: "Create Ad Group",
        description:
          "Create a new ad group within a campaign. Specify name, parent campaign, status, and CPC bid.",
        method: "POST" as const,
        path: "/customers/{customer_id}/adGroups:mutate",
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
                  create: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        description: "Ad group name",
                      },
                      campaign: {
                        type: "string",
                        description:
                          "Campaign resource name: customers/{customer_id}/campaigns/{campaign_id}",
                      },
                      status: {
                        type: "string",
                        enum: ["ENABLED", "PAUSED"],
                      },
                      cpcBidMicros: {
                        type: "string",
                        description:
                          "Max CPC bid in micros (multiply dollars by 1,000,000)",
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Create an ad group in a campaign. cpcBidMicros is in micros — $2.50 = '2500000'. Confirm with user before creating.",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          operations: [
            {
              create: {
                name: "Brand Keywords",
                campaign: "customers/1234567890/campaigns/9876543210",
                status: "ENABLED",
                cpcBidMicros: "2500000",
              },
            },
          ],
        }),
      },
      {
        name: "create_ad",
        displayName: "Create Ad",
        description:
          "Create a responsive search ad within an ad group. Provide headlines (up to 15) and descriptions (up to 4).",
        method: "POST" as const,
        path: "/customers/{customer_id}/adGroupAds:mutate",
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
                  create: {
                    type: "object",
                    properties: {
                      adGroup: {
                        type: "string",
                        description:
                          "Ad group resource name: customers/{customer_id}/adGroups/{ad_group_id}",
                      },
                      ad: {
                        type: "object",
                        properties: {
                          responsiveSearchAd: {
                            type: "object",
                            properties: {
                              headlines: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    text: { type: "string" },
                                    pinnedField: { type: "string" },
                                  },
                                },
                                description: "Up to 15 headlines (max 30 chars each)",
                              },
                              descriptions: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    text: { type: "string" },
                                    pinnedField: { type: "string" },
                                  },
                                },
                                description: "Up to 4 descriptions (max 90 chars each)",
                              },
                            },
                          },
                          finalUrls: {
                            type: "array",
                            items: { type: "string" },
                            description: "Landing page URLs",
                          },
                        },
                      },
                      status: {
                        type: "string",
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
          "Create a responsive search ad. Headlines max 30 chars, descriptions max 90 chars. Use pinnedField HEADLINE_1, HEADLINE_2, DESCRIPTION_1, DESCRIPTION_2 to pin to positions.",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          operations: [
            {
              create: {
                adGroup: "customers/1234567890/adGroups/1111111",
                ad: {
                  responsiveSearchAd: {
                    headlines: [
                      { text: "Best Product Ever" },
                      { text: "Free Shipping Available" },
                      { text: "Shop Now & Save" },
                    ],
                    descriptions: [
                      { text: "Get the best deals on our premium products. Order today!" },
                      { text: "Free returns within 30 days. 100% satisfaction guaranteed." },
                    ],
                  },
                  finalUrls: ["https://example.com/landing"],
                },
                status: "PAUSED",
              },
            },
          ],
        }),
      },
      {
        name: "add_keywords",
        displayName: "Add Keywords",
        description:
          "Add keywords to an ad group. Specify keyword text and match type (EXACT, PHRASE, BROAD).",
        method: "POST" as const,
        path: "/customers/{customer_id}/adGroupCriteria:mutate",
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
                  create: {
                    type: "object",
                    properties: {
                      adGroup: {
                        type: "string",
                        description:
                          "Ad group resource name: customers/{customer_id}/adGroups/{ad_group_id}",
                      },
                      keyword: {
                        type: "object",
                        properties: {
                          text: {
                            type: "string",
                            description: "The keyword text",
                          },
                          matchType: {
                            type: "string",
                            enum: ["EXACT", "PHRASE", "BROAD"],
                            description: "Keyword match type",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Add keywords to an ad group. EXACT = [keyword], PHRASE = \"keyword\", BROAD = keyword. Confirm keywords with user before adding.",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          operations: [
            {
              create: {
                adGroup: "customers/1234567890/adGroups/1111111",
                keyword: { text: "best running shoes", matchType: "PHRASE" },
              },
            },
            {
              create: {
                adGroup: "customers/1234567890/adGroups/1111111",
                keyword: { text: "buy shoes online", matchType: "BROAD" },
              },
            },
          ],
        }),
      },
      {
        name: "update_budget",
        displayName: "Update Budget",
        description:
          "Update an existing campaign budget amount.",
        method: "POST" as const,
        path: "/customers/{customer_id}/campaignBudgets:mutate",
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
                    description: "Fields to update, e.g. 'amount_micros'",
                  },
                  update: {
                    type: "object",
                    properties: {
                      resourceName: {
                        type: "string",
                        description:
                          "Budget resource name: customers/{customer_id}/campaignBudgets/{budget_id}",
                      },
                      amountMicros: {
                        type: "string",
                        description:
                          "Daily budget in micros (multiply dollars by 1,000,000)",
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Update a campaign budget. amountMicros is in micros — $50/day = '50000000'. Always confirm with user before changing budget.",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          operations: [
            {
              updateMask: "amount_micros",
              update: {
                resourceName: "customers/1234567890/campaignBudgets/222222",
                amountMicros: "50000000",
              },
            },
          ],
        }),
      },
      {
        name: "update_bid",
        displayName: "Update Ad Group Bid",
        description:
          "Update the CPC bid for an ad group.",
        method: "POST" as const,
        path: "/customers/{customer_id}/adGroups:mutate",
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
                    description: "Fields to update, e.g. 'cpc_bid_micros'",
                  },
                  update: {
                    type: "object",
                    properties: {
                      resourceName: {
                        type: "string",
                        description:
                          "Ad group resource name: customers/{customer_id}/adGroups/{ad_group_id}",
                      },
                      cpcBidMicros: {
                        type: "string",
                        description:
                          "Max CPC bid in micros (multiply dollars by 1,000,000)",
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Update ad group bid. cpcBidMicros is in micros — $3.00 = '3000000'. Confirm with user before changing bids.",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          operations: [
            {
              updateMask: "cpc_bid_micros",
              update: {
                resourceName: "customers/1234567890/adGroups/1111111",
                cpcBidMicros: "3000000",
              },
            },
          ],
        }),
      },
      {
        name: "add_negative_keywords",
        displayName: "Add Negative Keywords",
        description:
          "Add negative keywords to a campaign to block irrelevant search terms from triggering ads.",
        method: "POST" as const,
        path: "/customers/{customer_id}/campaignCriteria:mutate",
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
                  create: {
                    type: "object",
                    properties: {
                      campaign: {
                        type: "string",
                        description:
                          "Campaign resource name: customers/{customer_id}/campaigns/{campaign_id}",
                      },
                      negative: {
                        type: "boolean",
                        description: "Must be true for negative keywords",
                      },
                      keyword: {
                        type: "object",
                        properties: {
                          text: {
                            type: "string",
                            description: "The negative keyword text",
                          },
                          matchType: {
                            type: "string",
                            enum: ["EXACT", "PHRASE", "BROAD"],
                            description: "Keyword match type",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Block irrelevant searches. Set negative=true. Example: block 'free' with BROAD match to exclude all 'free'-related queries. Confirm with user before adding.",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          operations: [
            {
              create: {
                campaign: "customers/1234567890/campaigns/9876543210",
                negative: true,
                keyword: { text: "free", matchType: "BROAD" },
              },
            },
            {
              create: {
                campaign: "customers/1234567890/campaigns/9876543210",
                negative: true,
                keyword: { text: "cheap", matchType: "BROAD" },
              },
            },
          ],
        }),
      },
      {
        name: "create_campaign_budget",
        displayName: "Create Campaign Budget",
        description:
          "Create a new budget that can be assigned to campaigns. Specify name, daily amount, and delivery method.",
        method: "POST" as const,
        path: "/customers/{customer_id}/campaignBudgets:mutate",
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
                  create: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        description: "Budget name",
                      },
                      amountMicros: {
                        type: "string",
                        description:
                          "Daily budget in micros (multiply dollars by 1,000,000)",
                      },
                      deliveryMethod: {
                        type: "string",
                        enum: ["STANDARD", "ACCELERATED"],
                        description:
                          "STANDARD spreads spend evenly, ACCELERATED spends as fast as possible",
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Create a budget for campaigns. amountMicros is in micros — $100/day = '100000000'. Use STANDARD delivery for most cases. Save the returned resource name to assign to campaigns.",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          operations: [
            {
              create: {
                name: "Spring Campaign Budget",
                amountMicros: "50000000",
                deliveryMethod: "STANDARD",
              },
            },
          ],
        }),
      },
      // --- Reporting & Insights (26-32) ---
      {
        name: "get_campaign_budget_details",
        displayName: "Get Campaign Budget Details",
        description:
          "Get budget details including amount, delivery method, and period for all campaign budgets.",
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
              description: "GAQL query for campaign budget details",
            },
          },
        }),
        aiUsageHint:
          "Get budget details. Example: SELECT campaign_budget.id, campaign_budget.name, campaign_budget.amount_micros, campaign_budget.delivery_method, campaign_budget.period FROM campaign_budget",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT campaign_budget.id, campaign_budget.name, campaign_budget.amount_micros, campaign_budget.delivery_method, campaign_budget.period FROM campaign_budget",
        }),
      },
      {
        name: "get_ad_schedule",
        displayName: "Get Ad Schedule",
        description:
          "Get ad scheduling details — day-of-week and time targeting for campaigns.",
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
              description: "GAQL query for ad schedule criteria",
            },
          },
        }),
        aiUsageHint:
          "Get ad scheduling. Example: SELECT campaign.id, campaign_criterion.ad_schedule.day_of_week, campaign_criterion.ad_schedule.start_hour, campaign_criterion.ad_schedule.end_hour FROM campaign_criterion WHERE campaign_criterion.type = 'AD_SCHEDULE'",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT campaign.id, campaign_criterion.ad_schedule.day_of_week, campaign_criterion.ad_schedule.start_hour, campaign_criterion.ad_schedule.end_hour FROM campaign_criterion WHERE campaign_criterion.type = 'AD_SCHEDULE'",
        }),
      },
      {
        name: "get_placement_performance",
        displayName: "Get Placement Performance",
        description:
          "Performance by placement/website for Display and Video campaigns. Shows which sites your ads appeared on.",
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
              description: "GAQL query for placement performance",
            },
          },
        }),
        aiUsageHint:
          "Get placement performance for Display/Video campaigns. Example: SELECT detail_placement_view.display_name, detail_placement_view.target_url, metrics.impressions, metrics.clicks, metrics.cost_micros FROM detail_placement_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.impressions DESC LIMIT 50",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT detail_placement_view.display_name, detail_placement_view.target_url, metrics.impressions, metrics.clicks, metrics.cost_micros FROM detail_placement_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.impressions DESC LIMIT 50",
        }),
      },
      {
        name: "get_shopping_performance",
        displayName: "Get Shopping Performance",
        description:
          "Shopping campaign product performance. Shows impressions, clicks, conversions, and cost by product title and type.",
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
              description: "GAQL query for shopping performance view",
            },
          },
        }),
        aiUsageHint:
          "Get shopping product performance. Example: SELECT segments.product_title, segments.product_type_l1, metrics.impressions, metrics.clicks, metrics.conversions, metrics.cost_micros FROM shopping_performance_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.conversions DESC LIMIT 50",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT segments.product_title, segments.product_type_l1, metrics.impressions, metrics.clicks, metrics.conversions, metrics.cost_micros FROM shopping_performance_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.conversions DESC LIMIT 50",
        }),
      },
      {
        name: "get_video_performance",
        displayName: "Get Video Performance",
        description:
          "YouTube/Video ad performance. Shows video views, impressions, clicks, and engagement by video.",
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
              description: "GAQL query for video performance",
            },
          },
        }),
        aiUsageHint:
          "Get YouTube/Video ad performance. Example: SELECT video.id, video.title, video.duration_millis, metrics.impressions, metrics.video_views, metrics.clicks FROM video WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.video_views DESC LIMIT 50",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT video.id, video.title, video.duration_millis, metrics.impressions, metrics.video_views, metrics.clicks FROM video WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.video_views DESC LIMIT 50",
        }),
      },
      {
        name: "get_landing_page_performance",
        displayName: "Get Landing Page Performance",
        description:
          "Performance by landing page URL. Shows impressions, clicks, cost, and conversions per landing page.",
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
              description: "GAQL query for landing page view",
            },
          },
        }),
        aiUsageHint:
          "Get landing page performance. Example: SELECT landing_page_view.unexpanded_final_url, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM landing_page_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.clicks DESC LIMIT 50",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT landing_page_view.unexpanded_final_url, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM landing_page_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.clicks DESC LIMIT 50",
        }),
      },
      {
        name: "get_campaign_labels",
        displayName: "Get Campaign Labels",
        description:
          "Campaign labels/tags for organization. Shows which labels are applied to which campaigns.",
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
              description: "GAQL query for campaign labels",
            },
          },
        }),
        aiUsageHint:
          "Get campaign labels. Example: SELECT campaign.id, campaign.name, label.name, label.id FROM campaign_label ORDER BY campaign.name",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT campaign.id, campaign.name, label.name, label.id FROM campaign_label ORDER BY campaign.name",
        }),
      },
      // --- Management Operations (33-40) ---
      {
        name: "remove_keywords",
        displayName: "Remove Keywords",
        description:
          "Remove keywords from an ad group using a remove operation on ad group criteria.",
        method: "POST" as const,
        path: "/customers/{customer_id}/adGroupCriteria:mutate",
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
                  remove: {
                    type: "string",
                    description:
                      "Resource name to remove: customers/{customer_id}/adGroupCriteria/{ad_group_id}~{criterion_id}",
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Remove keywords from an ad group. Use the criterion resource name. Confirm with user before removing. Example remove value: 'customers/1234567890/adGroupCriteria/111~222'",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          operations: [
            {
              remove: "customers/1234567890/adGroupCriteria/1111111~2222222",
            },
          ],
        }),
      },
      {
        name: "update_ad",
        displayName: "Update Ad",
        description:
          "Update a responsive search ad — change headlines, descriptions, or final URLs.",
        method: "POST" as const,
        path: "/customers/{customer_id}/adGroupAds:mutate",
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
                    description:
                      "Fields to update, e.g. 'ad.responsive_search_ad.headlines,ad.responsive_search_ad.descriptions,ad.final_urls'",
                  },
                  update: {
                    type: "object",
                    properties: {
                      resourceName: {
                        type: "string",
                        description:
                          "Ad resource name: customers/{customer_id}/adGroupAds/{ad_group_id}~{ad_id}",
                      },
                      ad: {
                        type: "object",
                        properties: {
                          responsiveSearchAd: {
                            type: "object",
                            properties: {
                              headlines: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: { text: { type: "string" } },
                                },
                              },
                              descriptions: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: { text: { type: "string" } },
                                },
                              },
                            },
                          },
                          finalUrls: {
                            type: "array",
                            items: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Update an existing ad's headlines, descriptions, or URLs. Headlines max 30 chars, descriptions max 90 chars. Confirm changes with user before updating.",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          operations: [
            {
              updateMask: "ad.responsive_search_ad.headlines,ad.responsive_search_ad.descriptions",
              update: {
                resourceName: "customers/1234567890/adGroupAds/1111111~2222222",
                ad: {
                  responsiveSearchAd: {
                    headlines: [
                      { text: "Updated Headline 1" },
                      { text: "Updated Headline 2" },
                      { text: "Updated Headline 3" },
                    ],
                    descriptions: [
                      { text: "Updated description for the ad. Shop now and save big!" },
                    ],
                  },
                },
              },
            },
          ],
        }),
      },
      {
        name: "create_sitelink_extension",
        displayName: "Create Sitelink Extension",
        description:
          "Add sitelink extensions to campaigns. Sitelinks add extra links below your ad.",
        method: "POST" as const,
        path: "/customers/{customer_id}/assets:mutate",
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
                  create: {
                    type: "object",
                    properties: {
                      sitelinkAsset: {
                        type: "object",
                        properties: {
                          linkText: {
                            type: "string",
                            description: "Sitelink text (max 25 chars)",
                          },
                          description1: {
                            type: "string",
                            description: "First description line (max 35 chars)",
                          },
                          description2: {
                            type: "string",
                            description: "Second description line (max 35 chars)",
                          },
                          finalUrls: {
                            type: "array",
                            items: { type: "string" },
                            description: "Landing page URLs for this sitelink",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Create a sitelink asset. linkText max 25 chars, descriptions max 35 chars each. After creating the asset, link it to a campaign via campaignAssets:mutate.",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          operations: [
            {
              create: {
                sitelinkAsset: {
                  linkText: "Shop Sale Items",
                  description1: "Up to 50% off select items",
                  description2: "Free shipping on orders $50+",
                  finalUrls: ["https://example.com/sale"],
                },
              },
            },
          ],
        }),
      },
      {
        name: "set_ad_schedule",
        displayName: "Set Ad Schedule",
        description:
          "Set day/time targeting for campaigns. Control which days and hours your ads run.",
        method: "POST" as const,
        path: "/customers/{customer_id}/campaignCriteria:mutate",
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
                  create: {
                    type: "object",
                    properties: {
                      campaign: {
                        type: "string",
                        description:
                          "Campaign resource name: customers/{customer_id}/campaigns/{campaign_id}",
                      },
                      adSchedule: {
                        type: "object",
                        properties: {
                          dayOfWeek: {
                            type: "string",
                            enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
                            description: "Day of the week",
                          },
                          startHour: {
                            type: "number",
                            description: "Start hour (0-23)",
                          },
                          startMinute: {
                            type: "string",
                            enum: ["ZERO", "FIFTEEN", "THIRTY", "FORTY_FIVE"],
                            description: "Start minute",
                          },
                          endHour: {
                            type: "number",
                            description: "End hour (0-24)",
                          },
                          endMinute: {
                            type: "string",
                            enum: ["ZERO", "FIFTEEN", "THIRTY", "FORTY_FIVE"],
                            description: "End minute",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Set ad scheduling for a campaign. Hours are 0-23 for start, 0-24 for end. Create one criterion per day/time block. Confirm schedule with user before setting.",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          operations: [
            {
              create: {
                campaign: "customers/1234567890/campaigns/9876543210",
                adSchedule: {
                  dayOfWeek: "MONDAY",
                  startHour: 9,
                  startMinute: "ZERO",
                  endHour: 17,
                  endMinute: "ZERO",
                },
              },
            },
          ],
        }),
      },
      {
        name: "set_location_targeting",
        displayName: "Set Location Targeting",
        description:
          "Set geographic targeting for campaigns. Target specific countries, regions, or cities.",
        method: "POST" as const,
        path: "/customers/{customer_id}/campaignCriteria:mutate",
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
                  create: {
                    type: "object",
                    properties: {
                      campaign: {
                        type: "string",
                        description:
                          "Campaign resource name: customers/{customer_id}/campaigns/{campaign_id}",
                      },
                      location: {
                        type: "object",
                        properties: {
                          geoTargetConstant: {
                            type: "string",
                            description:
                              "Geo target constant resource name, e.g. 'geoTargetConstants/2840' for United States. Look up IDs in Google Ads geo target docs.",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Set location targeting. Use geoTargetConstants resource names — e.g. 2840 = US, 2826 = UK, 2356 = India, 2276 = France. Confirm target locations with user before setting.",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          operations: [
            {
              create: {
                campaign: "customers/1234567890/campaigns/9876543210",
                location: {
                  geoTargetConstant: "geoTargetConstants/2840",
                },
              },
            },
          ],
        }),
      },
      {
        name: "pause_ad",
        displayName: "Pause Ad",
        description:
          "Pause a specific ad by setting its status to PAUSED.",
        method: "POST" as const,
        path: "/customers/{customer_id}/adGroupAds:mutate",
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
                          "Ad resource name: customers/{customer_id}/adGroupAds/{ad_group_id}~{ad_id}",
                      },
                      status: {
                        type: "string",
                        description: "Set to PAUSED",
                        enum: ["PAUSED"],
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Pause a specific ad. Use updateMask='status' and status='PAUSED'. Confirm with user before pausing.",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          operations: [
            {
              updateMask: "status",
              update: {
                resourceName: "customers/1234567890/adGroupAds/1111111~2222222",
                status: "PAUSED",
              },
            },
          ],
        }),
      },
      {
        name: "enable_ad",
        displayName: "Enable Ad",
        description:
          "Enable a paused ad by setting its status to ENABLED.",
        method: "POST" as const,
        path: "/customers/{customer_id}/adGroupAds:mutate",
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
                          "Ad resource name: customers/{customer_id}/adGroupAds/{ad_group_id}~{ad_id}",
                      },
                      status: {
                        type: "string",
                        description: "Set to ENABLED",
                        enum: ["ENABLED"],
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Enable a paused ad. Use updateMask='status' and status='ENABLED'. Confirm with user before enabling.",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          operations: [
            {
              updateMask: "status",
              update: {
                resourceName: "customers/1234567890/adGroupAds/1111111~2222222",
                status: "ENABLED",
              },
            },
          ],
        }),
      },
      {
        name: "get_recommendations",
        displayName: "Get Recommendations",
        description:
          "Google's AI-powered recommendations for the account. Shows recommendation type, impact level, and affected campaigns.",
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
              description: "GAQL query for recommendations",
            },
          },
        }),
        aiUsageHint:
          "Get Google's AI recommendations. Example: SELECT recommendation.type, recommendation.impact, recommendation.campaign FROM recommendation WHERE recommendation.dismissed = false",
        exampleArgs: JSON.stringify({
          customer_id: "1234567890",
          query:
            "SELECT recommendation.type, recommendation.impact, recommendation.campaign FROM recommendation WHERE recommendation.dismissed = false",
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
        "3. Add redirect URI: https://<YOUR_DEPLOYMENT>.convex.site/api/integrations/oauth/callback",
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
