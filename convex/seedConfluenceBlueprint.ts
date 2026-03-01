/**
 * Seed Confluence integration blueprint
 * Run this once to create the Confluence blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedConfluenceBlueprint -> Run
 *
 * Prerequisites:
 * - Uses the SAME Atlassian OAuth app as Jira.
 * - In your Atlassian developer console (https://developer.atlassian.com/console/myapps/),
 *   add the Confluence scopes to your existing app.
 * - JIRA_CLIENT_ID and OAUTH_SECRET_JIRA env vars are reused.
 *
 * API Version: Confluence Cloud REST API v2
 * All endpoints use /wiki/api/v2/... (v1 was removed by Atlassian)
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    // Delete existing blueprint and its tools so we can re-seed with v2 endpoints
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "confluence"))
      .first();

    if (existing) {
      // Delete all tools for this blueprint
      const existingTools = await ctx.db
        .query("blueprintTools")
        .withIndex("by_blueprint", (q) => q.eq("blueprintId", existing._id))
        .collect();
      for (const tool of existingTools) {
        await ctx.db.delete(tool._id);
      }
      await ctx.db.delete(existing._id);
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "confluence",
      name: "Confluence",
      description:
        "Atlassian Confluence workspace for documentation and knowledge management. Read and write pages, search content, and manage spaces.",
      category: "productivity",
      version: 2,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: process.env.JIRA_CLIENT_ID || "YOUR_ATLASSIAN_CLIENT_ID",
        clientSecret: "OAUTH_SECRET_JIRA",
        authorizeUrl: "https://auth.atlassian.com/authorize",
        tokenUrl: "https://auth.atlassian.com/oauth/token",
        scopes: [
          "offline_access",
          "read:space:confluence",
          "read:page:confluence",
          "write:page:confluence",
          "read:confluence-user",
        ],
        scopeSeparator: "space",
        extraAuthParams: {
          audience: "api.atlassian.com",
          prompt: "consent",
        },
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://api.atlassian.com",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl:
        "https://developer.atlassian.com/cloud/confluence/rest/v2/intro/",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/confluence-1.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    // NOTE: All Confluence Cloud API calls require {cloudId} in the path.
    // Agents should call get_accessible_resources first to retrieve the cloudId,
    // then use it in all subsequent calls. This is the same pattern as Jira.
    // API v2: paths use /wiki/api/v2/... (v1 /wiki/rest/api/... was removed)
    const tools = [
      {
        name: "get_accessible_resources",
        displayName: "Get Accessible Resources",
        description:
          "Get the list of Atlassian Cloud sites the user has access to. Returns cloudId, name, and URL for each site. ALWAYS call this first to get the cloudId needed for all other Confluence API calls.",
        method: "GET" as const,
        path: "/oauth/token/accessible-resources",
        aiUsageHint:
          "Call this first to get the cloudId for the user's Confluence workspace. The cloudId is required in the path of every other Confluence API call.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_spaces",
        displayName: "List Spaces",
        description:
          "List all Confluence spaces. Returns spaceId and name for each space. Requires granular scope: read:space:confluence",
        method: "GET" as const,
        path: "/ex/confluence/{cloudId}/wiki/api/v2/spaces",
        pathParams: JSON.stringify([
          {
            name: "cloudId",
            type: "string",
            required: true,
            description: "Atlassian Cloud site ID from get_accessible_resources",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "limit",
            type: "number",
            default: 25,
            description: "Maximum number of spaces to return",
          },
          {
            name: "type",
            type: "string",
            description: "Filter by space type: global or personal",
          },
        ]),
        aiUsageHint:
          "List all Confluence spaces to find space IDs for creating pages. Returns results[].id (the spaceId needed for create_page) and results[].key.",
        exampleArgs: JSON.stringify({ cloudId: "abc123", limit: 25 }),
      },
      {
        name: "list_pages",
        displayName: "List Pages in Space",
        description:
          "List pages in a Confluence space by spaceId. Requires granular scope: read:page:confluence",
        method: "GET" as const,
        path: "/ex/confluence/{cloudId}/wiki/api/v2/pages",
        pathParams: JSON.stringify([
          {
            name: "cloudId",
            type: "string",
            required: true,
            description: "Atlassian Cloud site ID",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "spaceId",
            type: "string",
            required: true,
            description: "Space ID from list_spaces (numeric, e.g. '65538')",
          },
          {
            name: "limit",
            type: "number",
            default: 25,
            description: "Maximum number of pages to return",
          },
          {
            name: "title",
            type: "string",
            description: "Filter by page title (partial match)",
          },
        ]),
        aiUsageHint:
          "List pages in a Confluence space. Use list_spaces first to get the spaceId.",
        exampleArgs: JSON.stringify({
          cloudId: "abc123",
          spaceId: "65538",
          limit: 25,
        }),
      },
      {
        name: "get_page",
        displayName: "Get Page",
        description:
          "Get the full content of a specific Confluence page by ID. Requires granular scope: read:page:confluence",
        method: "GET" as const,
        path: "/ex/confluence/{cloudId}/wiki/api/v2/pages/{pageId}",
        pathParams: JSON.stringify([
          {
            name: "cloudId",
            type: "string",
            required: true,
            description: "Atlassian Cloud site ID",
          },
          {
            name: "pageId",
            type: "string",
            required: true,
            description: "Page ID from list_pages or create_page",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "body-format",
            type: "string",
            default: "storage",
            description: "Content format: storage (XHTML), atlas_doc_format, or view",
          },
        ]),
        aiUsageHint:
          "Fetch a Confluence page by ID. Use body-format=storage to get the full XHTML content.",
        exampleArgs: JSON.stringify({
          cloudId: "abc123",
          pageId: "123456789",
          "body-format": "storage",
        }),
      },
      {
        name: "create_page",
        displayName: "Create Page",
        description:
          "Create a new page in a Confluence space. Requires granular scope: write:page:confluence",
        method: "POST" as const,
        path: "/ex/confluence/{cloudId}/wiki/api/v2/pages",
        pathParams: JSON.stringify([
          {
            name: "cloudId",
            type: "string",
            required: true,
            description: "Atlassian Cloud site ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["spaceId", "title", "body"],
          properties: {
            spaceId: {
              type: "string",
              description: "Space ID from list_spaces (numeric string, e.g. '65538')",
            },
            title: { type: "string", description: "Page title" },
            parentId: {
              type: "string",
              description: "Optional parent page ID",
            },
            status: {
              type: "string",
              default: "current",
              description: "Page status: current (published) or draft",
            },
            body: {
              type: "object",
              required: ["representation", "value"],
              properties: {
                representation: {
                  type: "string",
                  default: "storage",
                  description: "Content format: storage (XHTML)",
                },
                value: {
                  type: "string",
                  description: "Page content in Confluence Storage Format (XHTML). Use <p>text</p>, <h1>heading</h1> etc.",
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Create a Confluence page. Use list_spaces to get spaceId first. Body uses storage format: {representation: 'storage', value: '<h1>Title</h1><p>Content</p>'}",
        exampleArgs: JSON.stringify({
          cloudId: "abc123",
          spaceId: "65538",
          title: "QuantXData GTM Plan",
          status: "current",
          body: {
            representation: "storage",
            value: "<h1>Overview</h1><p>Go-to-market plan.</p>",
          },
        }),
      },
      {
        name: "search_pages",
        displayName: "Search Pages",
        description:
          "Search Confluence pages by title. Requires granular scope: read:page:confluence",
        method: "GET" as const,
        path: "/ex/confluence/{cloudId}/wiki/api/v2/pages",
        pathParams: JSON.stringify([
          {
            name: "cloudId",
            type: "string",
            required: true,
            description: "Atlassian Cloud site ID",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "title",
            type: "string",
            description: "Filter pages by title (partial match)",
          },
          {
            name: "spaceId",
            type: "string",
            description: "Filter by space ID",
          },
          {
            name: "limit",
            type: "number",
            default: 25,
            description: "Maximum number of results",
          },
          {
            name: "body-format",
            type: "string",
            description: "Include page body: storage or view",
          },
        ]),
        aiUsageHint:
          "Search Confluence pages by title. Filter by spaceId to scope to a specific space.",
        exampleArgs: JSON.stringify({
          cloudId: "abc123",
          title: "GTM",
          limit: 10,
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
      message: "✅ Confluence blueprint created successfully (v2 API)!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Go to https://developer.atlassian.com/console/myapps/ and open your existing Jira OAuth app",
        "2. Under 'Permissions', add Confluence scopes: read:confluence-content.all, write:confluence-content, read:confluence-space.summary",
        "3. JIRA_CLIENT_ID and OAUTH_SECRET_JIRA are reused — no new env vars needed",
        "4. Run this seed mutation from the Convex dashboard",
        "5. Test by clicking Connect on the Confluence card in the Integrations page",
      ],
    };
  },
});
