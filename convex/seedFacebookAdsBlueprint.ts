/**
 * Seed Meta Ads integration blueprint
 * Run this once to create the Meta Ads blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedFacebookAdsBlueprint -> Run
 *
 * Prerequisites:
 * 1. Create a Facebook App at https://developers.facebook.com/apps/
 *    - Add "Marketing API" product
 *    - Add redirect URI: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback
 *    - Set app permissions: ads_management, ads_read, business_management
 * 2. Set in Convex env vars:
 *    - FACEBOOK_CLIENT_ID = App ID
 *    - OAUTH_SECRET_FACEBOOK = App Secret
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "facebook-ads"))
      .first();

    if (existing) {
      return {
        message: "Meta Ads blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "facebook-ads",
      name: "Meta Ads",
      description:
        "Manage Meta (Facebook & Instagram) advertising campaigns. View campaign performance, ad spend, impressions, clicks, and conversions. Pause or activate campaigns programmatically.",
      category: "Advertising",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId:
          process.env.FACEBOOK_CLIENT_ID || "YOUR_FACEBOOK_CLIENT_ID",
        clientSecret: "OAUTH_SECRET_FACEBOOK",
        authorizeUrl: "https://www.facebook.com/v19.0/dialog/oauth",
        tokenUrl:
          "https://graph.facebook.com/v19.0/oauth/access_token",
        scopes: ["ads_management", "ads_read", "business_management"],
        scopeSeparator: ",",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://graph.facebook.com/v19.0",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl:
        "https://developers.facebook.com/docs/marketing-apis",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/facebook-4.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_ad_accounts",
        displayName: "List Ad Accounts",
        description:
          "List all ad accounts accessible by the authenticated user. Returns account names, IDs, status, balance, and currency.",
        method: "GET" as const,
        path: "/me/adaccounts",
        queryParams: JSON.stringify([
          {
            name: "fields",
            type: "string",
            default:
              "name,account_id,account_status,balance,currency,spend_cap",
            description: "Comma-separated fields to return",
          },
          {
            name: "limit",
            type: "number",
            default: 25,
            description: "Number of results",
          },
        ]),
        aiUsageHint:
          "List ad accounts. Returns account_id values needed for campaign queries. account_status: 1=Active, 2=Disabled, 3=Unsettled.",
        exampleArgs: JSON.stringify({
          fields:
            "name,account_id,account_status,balance,currency,spend_cap",
          limit: 25,
        }),
      },
      {
        name: "get_campaigns",
        displayName: "Get Campaigns",
        description:
          "List campaigns for an ad account. Filter by status (ACTIVE, PAUSED, ARCHIVED) and get performance metrics.",
        method: "GET" as const,
        path: "/act_{ad_account_id}/campaigns",
        pathParams: JSON.stringify([
          {
            name: "ad_account_id",
            type: "string",
            required: true,
            description:
              "Facebook Ad Account ID (numeric, without 'act_' prefix)",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "fields",
            type: "string",
            default:
              "name,status,objective,daily_budget,lifetime_budget,start_time,stop_time",
            description: "Comma-separated fields",
          },
          {
            name: "filtering",
            type: "string",
            description:
              "JSON array of filters. Example: [{\"field\":\"effective_status\",\"operator\":\"IN\",\"value\":[\"ACTIVE\"]}]",
          },
          {
            name: "limit",
            type: "number",
            default: 25,
            description: "Number of results",
          },
        ]),
        aiUsageHint:
          "List campaigns for an ad account. Use filtering to narrow by status. The ad_account_id is just the numeric part (no 'act_' prefix needed in the param).",
        exampleArgs: JSON.stringify({
          ad_account_id: "1234567890",
          fields:
            "name,status,objective,daily_budget,lifetime_budget,start_time",
          filtering:
            '[{"field":"effective_status","operator":"IN","value":["ACTIVE"]}]',
        }),
      },
      {
        name: "get_campaign_insights",
        displayName: "Get Campaign Insights",
        description:
          "Get performance metrics for a specific campaign: spend, impressions, clicks, CPC, CTR, conversions, and more.",
        method: "GET" as const,
        path: "/{campaign_id}/insights",
        pathParams: JSON.stringify([
          {
            name: "campaign_id",
            type: "string",
            required: true,
            description: "Facebook campaign ID",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "fields",
            type: "string",
            default:
              "spend,impressions,clicks,cpc,ctr,reach,frequency,actions,cost_per_action_type",
            description: "Comma-separated metrics to return",
          },
          {
            name: "date_preset",
            type: "string",
            description:
              "Preset date range: today, yesterday, this_month, last_month, last_7d, last_14d, last_30d, last_90d",
          },
          {
            name: "time_range",
            type: "string",
            description:
              "Custom date range as JSON: {\"since\":\"2026-01-01\",\"until\":\"2026-02-20\"}",
          },
          {
            name: "time_increment",
            type: "string",
            description:
              "Breakdown by time: 1 (daily), 7 (weekly), monthly, all_days",
            default: "all_days",
          },
        ]),
        aiUsageHint:
          "Get campaign performance metrics. Use date_preset for quick ranges or time_range for custom dates. time_increment=1 for daily breakdown.",
        exampleArgs: JSON.stringify({
          campaign_id: "23850000000000",
          fields:
            "spend,impressions,clicks,cpc,ctr,reach,actions",
          date_preset: "last_30d",
        }),
      },
      {
        name: "get_adsets",
        displayName: "Get Ad Sets",
        description:
          "List ad sets for an ad account. Ad sets contain targeting, budget, and schedule settings.",
        method: "GET" as const,
        path: "/act_{ad_account_id}/adsets",
        pathParams: JSON.stringify([
          {
            name: "ad_account_id",
            type: "string",
            required: true,
            description: "Facebook Ad Account ID",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "fields",
            type: "string",
            default:
              "name,status,campaign_id,daily_budget,lifetime_budget,targeting,start_time,end_time",
            description: "Comma-separated fields",
          },
          {
            name: "filtering",
            type: "string",
            description:
              "JSON array of filters. Example: [{\"field\":\"campaign_id\",\"operator\":\"IN\",\"value\":[\"23850000000000\"]}]",
          },
          {
            name: "limit",
            type: "number",
            default: 25,
            description: "Number of results",
          },
        ]),
        aiUsageHint:
          "List ad sets. Filter by campaign_id to see ad sets within a specific campaign. Returns targeting and budget info.",
        exampleArgs: JSON.stringify({
          ad_account_id: "1234567890",
          fields:
            "name,status,campaign_id,daily_budget,targeting",
          filtering:
            '[{"field":"effective_status","operator":"IN","value":["ACTIVE"]}]',
        }),
      },
      {
        name: "get_adset_insights",
        displayName: "Get Ad Set Insights",
        description:
          "Get performance metrics for a specific ad set. Shows how individual targeting/budget configurations perform.",
        method: "GET" as const,
        path: "/{adset_id}/insights",
        pathParams: JSON.stringify([
          {
            name: "adset_id",
            type: "string",
            required: true,
            description: "Facebook ad set ID",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "fields",
            type: "string",
            default:
              "spend,impressions,clicks,cpc,ctr,reach,frequency,actions",
            description: "Comma-separated metrics",
          },
          {
            name: "date_preset",
            type: "string",
            description: "Preset date range: today, yesterday, last_7d, last_30d, etc.",
          },
          {
            name: "time_range",
            type: "string",
            description: "Custom date range as JSON",
          },
        ]),
        aiUsageHint:
          "Get ad set performance. Same fields as campaign insights but scoped to a single ad set.",
        exampleArgs: JSON.stringify({
          adset_id: "23860000000000",
          fields: "spend,impressions,clicks,cpc,ctr,actions",
          date_preset: "last_7d",
        }),
      },
      {
        name: "get_ads",
        displayName: "Get Ads",
        description:
          "List individual ads for an ad account. Returns ad creatives, status, and delivery info.",
        method: "GET" as const,
        path: "/act_{ad_account_id}/ads",
        pathParams: JSON.stringify([
          {
            name: "ad_account_id",
            type: "string",
            required: true,
            description: "Facebook Ad Account ID",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "fields",
            type: "string",
            default: "name,status,adset_id,campaign_id,creative",
            description: "Comma-separated fields",
          },
          {
            name: "filtering",
            type: "string",
            description: "JSON array of filters",
          },
          {
            name: "limit",
            type: "number",
            default: 25,
            description: "Number of results",
          },
        ]),
        aiUsageHint:
          "List ads. Filter by campaign or ad set using filtering param. Returns creative references for each ad.",
        exampleArgs: JSON.stringify({
          ad_account_id: "1234567890",
          fields: "name,status,adset_id,creative",
          filtering:
            '[{"field":"effective_status","operator":"IN","value":["ACTIVE"]}]',
        }),
      },
      {
        name: "update_campaign_status",
        displayName: "Update Campaign Status",
        description:
          "Pause or activate a campaign by updating its status. Set status to ACTIVE or PAUSED.",
        method: "POST" as const,
        path: "/{campaign_id}",
        pathParams: JSON.stringify([
          {
            name: "campaign_id",
            type: "string",
            required: true,
            description: "Facebook campaign ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              description: "ACTIVE to enable, PAUSED to pause",
              enum: ["ACTIVE", "PAUSED"],
            },
          },
        }),
        aiUsageHint:
          "Pause or activate a campaign. Use PAUSED to stop spending, ACTIVE to resume. Confirm with user before changing status.",
        exampleArgs: JSON.stringify({
          campaign_id: "23850000000000",
          status: "PAUSED",
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
      message: "✅ Meta Ads blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Create a Facebook App at https://developers.facebook.com/apps/",
        "2. Add the 'Marketing API' product to your app",
        "3. In Settings → Basic, set redirect URI:",
        "   https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "4. Set FACEBOOK_CLIENT_ID in Convex env vars (App ID)",
        "5. Set OAUTH_SECRET_FACEBOOK in Convex env vars (App Secret)",
        "6. Request permissions: ads_management, ads_read, business_management",
        "7. For production: submit app for Facebook review",
      ],
    };
  },
});
