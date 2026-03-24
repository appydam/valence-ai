// @ts-nocheck
/**
 * Seed: Meta Ad Library tools
 * Adds competitor ad research tools to the existing facebook-ads blueprint.
 * The Ad Library API uses the same Graph API base URL and OAuth token.
 *
 * Run: npx convex run seedMetaAdLibrary --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { mutation } from "./_generated/server";

const AD_LIBRARY_TOOLS = [
  {
    name: "search_ad_library",
    displayName: "Search Ad Library",
    description:
      "Search the Meta Ad Library for active ads by any advertiser. Returns ad creative text, images, platforms, start dates, and estimated audience size. Use this to research competitor ads on Facebook and Instagram.",
    method: "GET" as const,
    path: "/ads_archive",
    queryParams: JSON.stringify([
      {
        name: "search_terms",
        type: "string",
        required: true,
        description:
          "Search query — brand name, keyword, or topic (e.g. 'Reformation', 'sustainable fashion', 'summer sale')",
      },
      {
        name: "ad_reached_countries",
        type: "string",
        required: true,
        description:
          "ISO country codes as JSON array string (e.g. '[\"US\"]' or '[\"US\",\"GB\"]')",
      },
      {
        name: "ad_type",
        type: "string",
        default: "ALL",
        description:
          "Type of ads: ALL, POLITICAL_AND_ISSUE_ADS, HOUSING_ADS, EMPLOYMENT_ADS, CREDIT_ADS",
      },
      {
        name: "ad_active_status",
        type: "string",
        default: "ACTIVE",
        description: "Filter: ACTIVE (currently running), INACTIVE, or ALL",
      },
      {
        name: "fields",
        type: "string",
        default:
          "id,ad_creation_time,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_titles,ad_delivery_start_time,ad_snapshot_url,bylines,estimated_audience_size,impressions,page_id,page_name,publisher_platforms,spend",
        description: "Comma-separated fields to return",
      },
      {
        name: "limit",
        type: "number",
        default: 25,
        description: "Max results to return (1-100)",
      },
    ]),
    aiUsageHint:
      "Use this to spy on competitor ads. Search by brand name (e.g. 'Zara') to see all their active Facebook and Instagram ads. You can see their ad copy, when they started running, estimated audience size, and spend ranges. Great for competitive analysis before launching campaigns.",
    exampleArgs: JSON.stringify({
      search_terms: "Reformation",
      ad_reached_countries: '["US"]',
      ad_active_status: "ACTIVE",
      fields:
        "id,ad_creative_bodies,ad_creative_link_titles,page_name,publisher_platforms,ad_delivery_start_time,estimated_audience_size,spend",
      limit: 25,
    }),
  },
  {
    name: "search_ad_library_by_page",
    displayName: "Search Ads by Page/Brand",
    description:
      "Search the Meta Ad Library for all ads by a specific Facebook Page ID. More precise than keyword search — returns every ad the brand is running.",
    method: "GET" as const,
    path: "/ads_archive",
    queryParams: JSON.stringify([
      {
        name: "search_page_ids",
        type: "string",
        required: true,
        description:
          "Facebook Page ID of the advertiser (find via their Facebook page URL or use search_ad_library first to discover page_id)",
      },
      {
        name: "ad_reached_countries",
        type: "string",
        required: true,
        description: "ISO country codes as JSON array string (e.g. '[\"US\"]')",
      },
      {
        name: "ad_active_status",
        type: "string",
        default: "ACTIVE",
        description: "ACTIVE, INACTIVE, or ALL",
      },
      {
        name: "fields",
        type: "string",
        default:
          "id,ad_creation_time,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_titles,ad_delivery_start_time,ad_snapshot_url,bylines,estimated_audience_size,impressions,page_id,page_name,publisher_platforms,spend",
        description: "Comma-separated fields to return",
      },
      {
        name: "limit",
        type: "number",
        default: 50,
        description: "Max results (1-100)",
      },
    ]),
    aiUsageHint:
      "Use when you already know the competitor's Facebook Page ID. Returns ALL their active ads — better than keyword search for comprehensive competitor analysis. Get the page_id from a prior search_ad_library call.",
    exampleArgs: JSON.stringify({
      search_page_ids: "123456789",
      ad_reached_countries: '["US"]',
      ad_active_status: "ACTIVE",
      limit: 50,
    }),
  },
  {
    name: "get_ad_library_report",
    displayName: "Ad Library Spend Report",
    description:
      "Get aggregate spend report from the Meta Ad Library. Shows total ad spend by page/advertiser over a time period. Useful for understanding competitor budget levels.",
    method: "GET" as const,
    path: "/ads_archive_report",
    queryParams: JSON.stringify([
      {
        name: "search_terms",
        type: "string",
        description: "Search query for brand or keyword",
      },
      {
        name: "ad_reached_countries",
        type: "string",
        required: true,
        description: "ISO country codes as JSON array string",
      },
      {
        name: "fields",
        type: "string",
        default: "page_id,page_name,disclaimer,amount_spent,number_of_ads_in_library",
        description: "Fields to return in the report",
      },
      {
        name: "limit",
        type: "number",
        default: 20,
        description: "Max results",
      },
    ]),
    aiUsageHint:
      "Use this to see how much competitors are spending on Meta ads. Returns aggregate spend data and total number of ads in their library. Great for benchmarking your ad budget against competitors.",
    exampleArgs: JSON.stringify({
      search_terms: "Everlane",
      ad_reached_countries: '["US"]',
      fields: "page_id,page_name,amount_spent,number_of_ads_in_library",
      limit: 10,
    }),
  },
];

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Find existing facebook-ads blueprint
    const blueprint = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "facebook-ads"))
      .first();

    if (!blueprint) {
      return {
        success: false,
        error:
          "facebook-ads blueprint not found. Create it first with seedFacebookAdsBlueprint.",
      };
    }

    // Get existing tools to avoid duplicates
    const existingTools = await ctx.db
      .query("blueprintTools")
      .withIndex("by_blueprint", (q) => q.eq("blueprintId", blueprint._id))
      .collect();
    const existingNames = new Set(existingTools.map((t) => t.name));

    const now = Date.now();
    let added = 0;
    const toolIds: string[] = [];

    for (const tool of AD_LIBRARY_TOOLS) {
      if (existingNames.has(tool.name)) {
        continue; // skip duplicates
      }

      const id = await ctx.db.insert("blueprintTools", {
        blueprintId: blueprint._id,
        name: tool.name,
        displayName: tool.displayName,
        description: tool.description,
        method: tool.method,
        path: tool.path,
        queryParams: tool.queryParams,
        aiUsageHint: tool.aiUsageHint,
        exampleArgs: tool.exampleArgs,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });

      toolIds.push(id);
      added++;
    }

    return {
      success: true,
      blueprintId: blueprint._id,
      toolsAdded: added,
      toolIds,
      totalTools: existingTools.length + added,
      message: `Added ${added} Ad Library tools to facebook-ads blueprint. Agents can now research competitor ads via Meta Ad Library.`,
    };
  },
});
