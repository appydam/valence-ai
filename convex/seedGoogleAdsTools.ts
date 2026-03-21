/**
 * Seed missing Google Ads tools required by AI Ad Manager pages.
 * Run once: npx convex run seedGoogleAdsTools --url https://beloved-squirrel-599.convex.cloud
 */
import { mutation } from "./_generated/server";

const SEARCH_STREAM_PATH = "/customers/{customer_id}/googleAds:searchStream";
const CUSTOMER_PATH_PARAMS = JSON.stringify([
  { name: "customer_id", type: "string", required: true, description: "Google Ads customer ID (10-digit number, no dashes)" },
]);
const GAQL_BODY = JSON.stringify({
  type: "object",
  required: ["query"],
  properties: { query: { type: "string", description: "GAQL query string" } },
});

export default mutation({
  args: {},
  handler: async (ctx) => {
    const blueprint = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "google-ads"))
      .first();

    if (!blueprint) {
      return { error: "Google Ads blueprint not found. Run seedGoogleAdsBlueprint first." };
    }

    // Get existing tool names to avoid duplicates
    const existingTools = await ctx.db
      .query("blueprintTools")
      .withIndex("by_blueprint", (q) => q.eq("blueprintId", blueprint._id))
      .collect();
    const existingNames = new Set(existingTools.map((t) => t.name));

    const now = Date.now();
    const created: string[] = [];
    const skipped: string[] = [];

    const tools = [
      // --- GAQL read tools (POST to searchStream) ---
      {
        name: "get_search_terms",
        displayName: "Get Search Terms",
        description: "Get search term performance — shows actual queries that triggered your ads.",
        method: "POST" as const,
        path: SEARCH_STREAM_PATH,
        pathParams: CUSTOMER_PATH_PARAMS,
        bodySchema: GAQL_BODY,
        aiUsageHint: "Get search term report. Example: SELECT search_term_view.search_term, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM search_term_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.impressions DESC LIMIT 100",
        exampleArgs: JSON.stringify({ customer_id: "1234567890", query: "SELECT search_term_view.search_term, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM search_term_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.impressions DESC LIMIT 100" }),
      },
      {
        name: "get_device_performance",
        displayName: "Get Device Performance",
        description: "Get performance breakdown by device type (MOBILE, DESKTOP, TABLET).",
        method: "POST" as const,
        path: SEARCH_STREAM_PATH,
        pathParams: CUSTOMER_PATH_PARAMS,
        bodySchema: GAQL_BODY,
        aiUsageHint: "Get device-level metrics. Example: SELECT segments.device, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM campaign WHERE segments.date DURING LAST_30_DAYS",
        exampleArgs: JSON.stringify({ customer_id: "1234567890", query: "SELECT segments.device, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM campaign WHERE segments.date DURING LAST_30_DAYS" }),
      },
      {
        name: "get_age_gender_performance",
        displayName: "Get Age & Gender Performance",
        description: "Get performance metrics broken down by age range and gender demographics.",
        method: "POST" as const,
        path: SEARCH_STREAM_PATH,
        pathParams: CUSTOMER_PATH_PARAMS,
        bodySchema: GAQL_BODY,
        aiUsageHint: "Get demographic breakdown. Example: SELECT ad_group_criterion.age_range.type, ad_group_criterion.gender.type, metrics.impressions, metrics.clicks, metrics.conversions FROM gender_view WHERE segments.date DURING LAST_30_DAYS",
        exampleArgs: JSON.stringify({ customer_id: "1234567890", query: "SELECT ad_group_criterion.age_range.type, ad_group_criterion.gender.type, metrics.impressions, metrics.clicks, metrics.conversions FROM gender_view WHERE segments.date DURING LAST_30_DAYS" }),
      },
      {
        name: "get_location_performance",
        displayName: "Get Location Performance",
        description: "Get geographic performance metrics — clicks, impressions, and conversions by location.",
        method: "POST" as const,
        path: SEARCH_STREAM_PATH,
        pathParams: CUSTOMER_PATH_PARAMS,
        bodySchema: GAQL_BODY,
        aiUsageHint: "Get location-level metrics. Example: SELECT geographic_view.country_criterion_id, geographic_view.location_type, metrics.impressions, metrics.clicks, metrics.conversions FROM geographic_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.clicks DESC LIMIT 20",
        exampleArgs: JSON.stringify({ customer_id: "1234567890", query: "SELECT geographic_view.country_criterion_id, geographic_view.location_type, metrics.impressions, metrics.clicks, metrics.conversions FROM geographic_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.clicks DESC LIMIT 20" }),
      },
      {
        name: "get_audience_performance",
        displayName: "Get Audience Performance",
        description: "Get performance metrics for audience segments attached to campaigns.",
        method: "POST" as const,
        path: SEARCH_STREAM_PATH,
        pathParams: CUSTOMER_PATH_PARAMS,
        bodySchema: GAQL_BODY,
        aiUsageHint: "Get audience segment metrics. Example: SELECT campaign_audience_view.resource_name, metrics.impressions, metrics.clicks, metrics.conversions FROM campaign_audience_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.conversions DESC LIMIT 20",
        exampleArgs: JSON.stringify({ customer_id: "1234567890", query: "SELECT campaign_audience_view.resource_name, metrics.impressions, metrics.clicks, metrics.conversions FROM campaign_audience_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.conversions DESC LIMIT 20" }),
      },
      {
        name: "get_conversion_actions",
        displayName: "Get Conversion Actions",
        description: "List all conversion actions configured in the account.",
        method: "POST" as const,
        path: SEARCH_STREAM_PATH,
        pathParams: CUSTOMER_PATH_PARAMS,
        bodySchema: GAQL_BODY,
        aiUsageHint: "List conversion actions. Example: SELECT conversion_action.id, conversion_action.name, conversion_action.type, conversion_action.status FROM conversion_action ORDER BY conversion_action.name",
        exampleArgs: JSON.stringify({ customer_id: "1234567890", query: "SELECT conversion_action.id, conversion_action.name, conversion_action.type, conversion_action.status FROM conversion_action ORDER BY conversion_action.name" }),
      },
      {
        name: "get_change_history",
        displayName: "Get Change History",
        description: "Get recent changes made to the account — who changed what and when.",
        method: "POST" as const,
        path: SEARCH_STREAM_PATH,
        pathParams: CUSTOMER_PATH_PARAMS,
        bodySchema: GAQL_BODY,
        aiUsageHint: "Get change log. Example: SELECT change_event.change_date_time, change_event.change_resource_type, change_event.user_email, change_event.client_type FROM change_event WHERE change_event.change_date_time DURING LAST_14_DAYS ORDER BY change_event.change_date_time DESC LIMIT 50",
        exampleArgs: JSON.stringify({ customer_id: "1234567890", query: "SELECT change_event.change_date_time, change_event.change_resource_type, change_event.user_email, change_event.client_type FROM change_event WHERE change_event.change_date_time DURING LAST_14_DAYS ORDER BY change_event.change_date_time DESC LIMIT 50" }),
      },
      {
        name: "get_recommendations",
        displayName: "Get Recommendations",
        description: "Get Google's optimization recommendations for the account.",
        method: "POST" as const,
        path: SEARCH_STREAM_PATH,
        pathParams: CUSTOMER_PATH_PARAMS,
        bodySchema: GAQL_BODY,
        aiUsageHint: "Get active recommendations. Example: SELECT recommendation.type, recommendation.impact, recommendation.campaign, recommendation.resource_name FROM recommendation WHERE recommendation.dismissed = false",
        exampleArgs: JSON.stringify({ customer_id: "1234567890", query: "SELECT recommendation.type, recommendation.impact, recommendation.campaign, recommendation.resource_name FROM recommendation WHERE recommendation.dismissed = false" }),
      },

      // --- Mutation tools ---
      {
        name: "add_keywords",
        displayName: "Add Keywords",
        description: "Add keywords to an ad group. Specify keyword text, match type, and target ad group.",
        method: "POST" as const,
        path: "/customers/{customer_id}/adGroupCriteria:mutate",
        pathParams: CUSTOMER_PATH_PARAMS,
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
                      adGroup: { type: "string", description: "Ad group resource name" },
                      keyword: {
                        type: "object",
                        properties: {
                          text: { type: "string" },
                          matchType: { type: "string", enum: ["EXACT", "PHRASE", "BROAD"] },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Add keywords to an ad group. Match types: EXACT, PHRASE, BROAD.",
        exampleArgs: JSON.stringify({ customer_id: "1234567890", operations: [{ create: { adGroup: "customers/1234567890/adGroups/111", keyword: { text: "buy shoes", matchType: "PHRASE" } } }] }),
      },
      {
        name: "add_negative_keywords",
        displayName: "Add Negative Keywords",
        description: "Add negative keywords to a campaign to exclude unwanted search terms.",
        method: "POST" as const,
        path: "/customers/{customer_id}/campaignCriteria:mutate",
        pathParams: CUSTOMER_PATH_PARAMS,
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
                      campaign: { type: "string", description: "Campaign resource name" },
                      negative: { type: "boolean" },
                      keyword: {
                        type: "object",
                        properties: {
                          text: { type: "string" },
                          matchType: { type: "string", enum: ["EXACT", "PHRASE", "BROAD"] },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Add negative keywords to block unwanted traffic.",
        exampleArgs: JSON.stringify({ customer_id: "1234567890", operations: [{ create: { campaign: "customers/1234567890/campaigns/222", negative: true, keyword: { text: "free", matchType: "BROAD" } } }] }),
      },
      {
        name: "create_ad",
        displayName: "Create Responsive Search Ad",
        description: "Create a responsive search ad with headlines and descriptions in an ad group.",
        method: "POST" as const,
        path: "/customers/{customer_id}/adGroupAds:mutate",
        pathParams: CUSTOMER_PATH_PARAMS,
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
                      adGroup: { type: "string", description: "Ad group resource name" },
                      ad: {
                        type: "object",
                        properties: {
                          responsiveSearchAd: {
                            type: "object",
                            properties: {
                              headlines: { type: "array", items: { type: "object", properties: { text: { type: "string" }, pinnedField: { type: "string" } } } },
                              descriptions: { type: "array", items: { type: "object", properties: { text: { type: "string" }, pinnedField: { type: "string" } } } },
                            },
                          },
                          finalUrls: { type: "array", items: { type: "string" } },
                        },
                      },
                      status: { type: "string", enum: ["ENABLED", "PAUSED"] },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Create responsive search ads. Min 3 headlines, 2 descriptions. Max 15 headlines (30 chars each), 4 descriptions (90 chars each).",
        exampleArgs: JSON.stringify({ customer_id: "1234567890", operations: [{ create: { adGroup: "customers/1234567890/adGroups/111", ad: { responsiveSearchAd: { headlines: [{ text: "Buy Shoes Online" }], descriptions: [{ text: "Free shipping on all orders." }] }, finalUrls: ["https://example.com"] }, status: "PAUSED" } }] }),
      },
      {
        name: "create_ad_group",
        displayName: "Create Ad Group",
        description: "Create an ad group within a campaign with a name, status, and CPC bid.",
        method: "POST" as const,
        path: "/customers/{customer_id}/adGroups:mutate",
        pathParams: CUSTOMER_PATH_PARAMS,
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
                      name: { type: "string" },
                      campaign: { type: "string", description: "Campaign resource name" },
                      status: { type: "string", enum: ["ENABLED", "PAUSED"] },
                      cpcBidMicros: { type: "string", description: "CPC bid in micros (1 USD = 1000000)" },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Create ad groups. Bid in micros (e.g., 1500000 = $1.50). Always start PAUSED.",
        exampleArgs: JSON.stringify({ customer_id: "1234567890", operations: [{ create: { name: "Brand Keywords", campaign: "customers/1234567890/campaigns/222", status: "PAUSED", cpcBidMicros: "1500000" } }] }),
      },
      {
        name: "create_campaign_budget",
        displayName: "Create Campaign Budget",
        description: "Create a shared campaign budget resource.",
        method: "POST" as const,
        path: "/customers/{customer_id}/campaignBudgets:mutate",
        pathParams: CUSTOMER_PATH_PARAMS,
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
                      name: { type: "string" },
                      amountMicros: { type: "string", description: "Daily budget in micros" },
                      deliveryMethod: { type: "string", enum: ["STANDARD", "ACCELERATED"] },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Create budget. Amount in micros (50000000 = $50/day). STANDARD is recommended.",
        exampleArgs: JSON.stringify({ customer_id: "1234567890", operations: [{ create: { name: "Main Budget", amountMicros: "50000000", deliveryMethod: "STANDARD" } }] }),
      },
      {
        name: "update_bid",
        displayName: "Update Ad Group Bid",
        description: "Update the CPC bid for an ad group.",
        method: "POST" as const,
        path: "/customers/{customer_id}/adGroups:mutate",
        pathParams: CUSTOMER_PATH_PARAMS,
        bodySchema: JSON.stringify({
          type: "object",
          required: ["operations"],
          properties: {
            operations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  updateMask: { type: "string", description: "Fields to update, e.g. 'cpc_bid_micros'" },
                  update: {
                    type: "object",
                    properties: {
                      resourceName: { type: "string", description: "Ad group resource name" },
                      cpcBidMicros: { type: "string", description: "New CPC bid in micros" },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Update ad group bids. Bid in micros (2000000 = $2.00).",
        exampleArgs: JSON.stringify({ customer_id: "1234567890", operations: [{ updateMask: "cpc_bid_micros", update: { resourceName: "customers/1234567890/adGroups/111", cpcBidMicros: "2000000" } }] }),
      },
      {
        name: "update_budget",
        displayName: "Update Campaign Budget",
        description: "Update the daily amount of an existing campaign budget.",
        method: "POST" as const,
        path: "/customers/{customer_id}/campaignBudgets:mutate",
        pathParams: CUSTOMER_PATH_PARAMS,
        bodySchema: JSON.stringify({
          type: "object",
          required: ["operations"],
          properties: {
            operations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  updateMask: { type: "string", description: "Fields to update, e.g. 'amount_micros'" },
                  update: {
                    type: "object",
                    properties: {
                      resourceName: { type: "string", description: "Budget resource name" },
                      amountMicros: { type: "string", description: "New daily budget in micros" },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Update budget amount. In micros (75000000 = $75/day).",
        exampleArgs: JSON.stringify({ customer_id: "1234567890", operations: [{ updateMask: "amount_micros", update: { resourceName: "customers/1234567890/campaignBudgets/333", amountMicros: "75000000" } }] }),
      },
    ];

    for (const tool of tools) {
      if (existingNames.has(tool.name)) {
        skipped.push(tool.name);
        continue;
      }

      await ctx.db.insert("blueprintTools", {
        blueprintId: blueprint._id,
        ...tool,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      created.push(tool.name);
    }

    return {
      message: `Seeded ${created.length} tools, skipped ${skipped.length} existing`,
      created,
      skipped,
    };
  },
});
