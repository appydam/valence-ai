/**
 * Seed / repair Notion integration blueprint
 *
 * This mutation upserts the Notion blueprint with corrected tool definitions.
 * The primary fix is the create_page (and update_page) bodySchema and aiUsageHint,
 * which now clearly specify that `parent` and `properties` must be nested objects —
 * not flat strings — to match Notion's API requirements.
 *
 * Usage:
 *   npx convex run seedNotionBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud
 *
 * OR via Convex dashboard:
 *   Functions -> seedNotionBlueprint -> Run
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Upsert the blueprint
    let blueprintId: string;
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "notion"))
      .first();

    const authConfig = {
      clientId: "310d872b-594c-8198-9062-0037fdfa77fb",
      clientSecret: "OAUTH_SECRET_NOTION",
      authorizeUrl: "https://api.notion.com/v1/oauth/authorize",
      tokenUrl: "https://api.notion.com/v1/oauth/token",
      scopes: [],
      tokenEndpointAuth: "header", // Notion requires Basic auth (base64 clientId:clientSecret) on token exchange
      extraAuthParams: {
        owner: "user",
      },
    };

    if (existing) {
      blueprintId = existing._id;
      await ctx.db.patch(existing._id, {
        name: "Notion",
        description: "Workspace for notes, databases, wikis, and project management",
        category: "project_management",
        authType: "oauth2",
        authConfig: JSON.stringify(authConfig),
        baseUrl: "https://api.notion.com/v1",
        defaultHeaders: JSON.stringify({
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        }),
        status: "active",
        sourceType: "manual",
        sourceUrl: "https://developers.notion.com/reference",
        updatedAt: now,
      });

      // Delete all existing tools so we can re-insert the corrected set
      const existingTools = await ctx.db
        .query("blueprintTools")
        .withIndex("by_blueprint", (q) => q.eq("blueprintId", existing._id))
        .collect();
      for (const tool of existingTools) {
        await ctx.db.delete(tool._id);
      }
    } else {
      blueprintId = await ctx.db.insert("blueprints", {
        slug: "notion",
        name: "Notion",
        description: "Workspace for notes, databases, wikis, and project management",
        category: "project_management",
        version: 1,
        status: "active",
        authType: "oauth2",
        authConfig: JSON.stringify(authConfig),
        baseUrl: "https://api.notion.com/v1",
        defaultHeaders: JSON.stringify({
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        }),
        sourceType: "manual",
        sourceUrl: "https://developers.notion.com/reference",
        iconUrl: "https://www.notion.so/images/favicon.ico",
        createdAt: now,
        updatedAt: now,
        createdBy: "system",
      });
    }

    // ─── Tool definitions ────────────────────────────────────────────────────────
    //
    // IMPORTANT: Notion requires nested objects for `parent` and `properties`.
    // Agents must pass:
    //   parent: { "database_id": "..." } or { "page_id": "..." }
    //   properties.title: [{ "type": "text", "text": { "content": "..." } }]
    //
    // The requestBuilder passes toolArgs directly into the body, so agents MUST
    // send the nested structure — flat keys like `database_id` or `title` will
    // fail with Notion's 400 validation_error.

    const tools = [
      // ── Search ──────────────────────────────────────────────────────────────
      {
        name: "search",
        displayName: "Search",
        description: "Search Notion for pages, databases, and blocks by title",
        method: "POST" as const,
        path: "/search",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            query: { type: "string", description: "Text to search for" },
            filter: {
              type: "object",
              description: 'Optional filter: {"value": "page"} or {"value": "database"}',
            },
            sort: {
              type: "object",
              description: 'Sort order: {"direction": "ascending"|"descending", "timestamp": "last_edited_time"}',
            },
            page_size: { type: "number", description: "Number of results (max 100)", default: 20 },
          },
        }),
        aiUsageHint: "Search Notion for pages and databases by title. Returns matching pages/databases the integration has access to.",
        exampleArgs: JSON.stringify({
          query: "Meeting Notes",
          filter: { value: "page", property: "object" },
          page_size: 10,
        }),
      },

      // ── List Databases ───────────────────────────────────────────────────────
      {
        name: "list_databases",
        displayName: "List Databases",
        description: "List all Notion databases the integration can access",
        method: "POST" as const,
        path: "/search",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            filter: {
              type: "object",
              const: { value: "database", property: "object" },
            },
            page_size: { type: "number", default: 50 },
          },
        }),
        aiUsageHint: "List all Notion databases the integration has access to. Use this to discover database IDs before querying or creating rows.",
        exampleArgs: JSON.stringify({
          filter: { value: "database", property: "object" },
          page_size: 50,
        }),
      },

      // ── Query Database ───────────────────────────────────────────────────────
      {
        name: "query_database",
        displayName: "Query Database",
        description: "Query rows in a Notion database with optional filters and sorts",
        method: "POST" as const,
        path: "/databases/{database_id}/query",
        pathParams: JSON.stringify([
          { name: "database_id", type: "string", required: true, description: "The database ID to query" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            filter: {
              type: "object",
              description: "Optional filter conditions for the query",
            },
            sorts: {
              type: "array",
              description: 'Sort order: [{"property": "Name", "direction": "ascending"}]',
            },
            page_size: { type: "number", description: "Number of rows (max 100)", default: 50 },
          },
        }),
        aiUsageHint: "Query rows in a Notion database. Use list_databases first to get the database_id.",
        exampleArgs: JSON.stringify({
          database_id: "your-database-id-here",
          page_size: 20,
        }),
      },

      // ── Get Database ─────────────────────────────────────────────────────────
      {
        name: "get_database",
        displayName: "Get Database",
        description: "Get the schema and properties of a Notion database",
        method: "GET" as const,
        path: "/databases/{database_id}",
        pathParams: JSON.stringify([
          { name: "database_id", type: "string", required: true, description: "The database ID" },
        ]),
        aiUsageHint: "Retrieve database schema (property names and types) before creating rows. Essential for knowing what properties to set.",
        exampleArgs: JSON.stringify({ database_id: "your-database-id-here" }),
      },

      // ── Get Page ─────────────────────────────────────────────────────────────
      {
        name: "get_page",
        displayName: "Get Page",
        description: "Retrieve a Notion page by its ID",
        method: "GET" as const,
        path: "/pages/{page_id}",
        pathParams: JSON.stringify([
          { name: "page_id", type: "string", required: true, description: "The page ID" },
        ]),
        aiUsageHint: "Get a Notion page's properties and metadata by its ID.",
        exampleArgs: JSON.stringify({ page_id: "your-page-id-here" }),
      },

      // ── Create Page (THE CRITICAL FIX) ────────────────────────────────────────
      {
        name: "create_page",
        displayName: "Create Page",
        description: "Create a new Notion page or database row",
        method: "POST" as const,
        path: "/pages",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["parent", "properties"],
          properties: {
            parent: {
              type: "object",
              description:
                'REQUIRED nested object. For a database row: {"database_id": "abc123"}. For a sub-page: {"page_id": "abc123"}. Do NOT pass database_id as a flat string.',
            },
            properties: {
              type: "object",
              description:
                'REQUIRED nested object. For a plain page title: {"title": [{"type": "text", "text": {"content": "My Title"}}]}. For database rows, match the database schema property names.',
            },
            children: {
              type: "array",
              description:
                'Optional page body as Notion block objects. Example: [{"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Body text here"}}]}}]',
            },
            icon: {
              type: "object",
              description: 'Optional icon: {"type": "emoji", "emoji": "📝"}',
            },
            cover: {
              type: "object",
              description: 'Optional cover image: {"type": "external", "external": {"url": "https://..."}}',
            },
          },
        }),
        aiUsageHint: `Create a new Notion page or database row.

STEP 1 — FIND A PARENT FIRST: If you don't already have a page_id or database_id, call notion/search with an empty query {} to discover available pages. Use the first result's id as the parent. This is required — you cannot create a page without a parent.

STEP 2 — CREATE THE PAGE with nested objects:

To create a SUB-PAGE inside another page:
{
  "parent": { "page_id": "ID_FROM_SEARCH" },
  "properties": {
    "title": [{ "type": "text", "text": { "content": "Page title" } }]
  },
  "children": [
    {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": "Body text"}}]}}
  ]
}

To create a DATABASE ROW:
{
  "parent": { "database_id": "ID_FROM_SEARCH" },
  "properties": {
    "Name": { "title": [{ "type": "text", "text": { "content": "Row title" } }] }
  }
}

NEVER pass flat keys like database_id="abc" or title="text" — Notion requires nested objects or it returns 400 validation_error.

---

BLOCK TYPES available in children array:
- heading_1: {"object":"block","type":"heading_1","heading_1":{"rich_text":[{"type":"text","text":{"content":"Title"}}]}}
- heading_2: {"object":"block","type":"heading_2","heading_2":{"rich_text":[{"type":"text","text":{"content":"Subtitle"}}]}}
- heading_3: {"object":"block","type":"heading_3","heading_3":{"rich_text":[{"type":"text","text":{"content":"Sub-subtitle"}}]}}
- paragraph: {"object":"block","type":"paragraph","paragraph":{"rich_text":[{"type":"text","text":{"content":"Text here"}}]}}
- bulleted_list_item: {"object":"block","type":"bulleted_list_item","bulleted_list_item":{"rich_text":[{"type":"text","text":{"content":"Bullet point"}}]}}
- numbered_list_item: {"object":"block","type":"numbered_list_item","numbered_list_item":{"rich_text":[{"type":"text","text":{"content":"Numbered item"}}]}}
- divider: {"object":"block","type":"divider","divider":{}}
- callout: {"object":"block","type":"callout","callout":{"rich_text":[{"type":"text","text":{"content":"Note"}}],"icon":{"type":"emoji","emoji":"💡"}}}

CRITICAL LIMITS — these are hard API limits, not suggestions:
- Each rich_text[].text.content field: MAX 2000 characters — Notion silently drops content beyond this
- Max 100 blocks per create_page or append_page_content request

FOR LONG DOCUMENTS (research briefs, copy docs, reports):
1. create_page with the page title + first 2-3 sections (keep children array ≤30 blocks)
2. Save the page "id" from the response
3. Call append_page_content with remaining sections (use page_id from step 2)
4. Repeat append_page_content for each additional batch of ≤50 blocks

A 10-section document = ~40-60 blocks across 1 create + 1-2 append calls. NEVER put an entire research brief into a single paragraph block.`,
        exampleArgs: JSON.stringify({
          parent: { database_id: "your-database-id-here" },
          properties: {
            Name: {
              title: [{ type: "text", text: { content: "My new page title" } }],
            },
          },
          children: [
            {
              object: "block",
              type: "paragraph",
              paragraph: {
                rich_text: [{ type: "text", text: { content: "Page body content goes here." } }],
              },
            },
          ],
        }),
      },

      // ── Update Page ───────────────────────────────────────────────────────────
      {
        name: "update_page",
        displayName: "Update Page",
        description: "Update properties of an existing Notion page or database row",
        method: "PATCH" as const,
        path: "/pages/{page_id}",
        pathParams: JSON.stringify([
          { name: "page_id", type: "string", required: true, description: "The page ID to update" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            properties: {
              type: "object",
              description:
                'Nested properties to update. Example: {"Name": {"title": [{"type": "text", "text": {"content": "Updated title"}}]}}. Must match the page/database schema.',
            },
            archived: {
              type: "boolean",
              description: "Set to true to archive (soft-delete) the page",
            },
            icon: {
              type: "object",
              description: 'Update icon: {"type": "emoji", "emoji": "✅"}',
            },
          },
        }),
        aiUsageHint: `Update an existing Notion page's properties.

CRITICAL — properties must be nested rich text objects:
{
  "page_id": "YOUR_PAGE_ID",
  "properties": {
    "Name": { "title": [{ "type": "text", "text": { "content": "New title" } }] },
    "Status": { "select": { "name": "Done" } }
  }
}

Do NOT pass flat title="text". Notion requires rich text arrays.`,
        exampleArgs: JSON.stringify({
          page_id: "your-page-id-here",
          properties: {
            Name: {
              title: [{ type: "text", text: { content: "Updated title" } }],
            },
          },
        }),
      },

      // ── Archive Page ─────────────────────────────────────────────────────────
      {
        name: "archive_page",
        displayName: "Archive Page",
        description: "Archive (soft-delete) a Notion page",
        method: "PATCH" as const,
        path: "/pages/{page_id}",
        pathParams: JSON.stringify([
          { name: "page_id", type: "string", required: true, description: "The page ID to archive" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            archived: { type: "boolean", const: true },
          },
        }),
        aiUsageHint: "Archive (soft-delete) a Notion page. The page is not permanently deleted and can be restored.",
        exampleArgs: JSON.stringify({ page_id: "your-page-id-here" }),
      },

      // ── Get Page Content (Blocks) ─────────────────────────────────────────────
      {
        name: "get_page_content",
        displayName: "Get Page Content",
        description: "Retrieve the content blocks of a Notion page",
        method: "GET" as const,
        path: "/blocks/{page_id}/children",
        pathParams: JSON.stringify([
          { name: "page_id", type: "string", required: true, description: "The page ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "page_size", type: "number", description: "Number of blocks to return", default: 100 },
        ]),
        aiUsageHint: "Read the content (text blocks) of a Notion page. Returns block objects containing paragraph text, headings, bullet lists, etc.",
        exampleArgs: JSON.stringify({ page_id: "your-page-id-here", page_size: 100 }),
      },

      // ── Append Page Content ───────────────────────────────────────────────────
      {
        name: "append_page_content",
        displayName: "Append Page Content",
        description: "Append new content blocks to an existing Notion page",
        method: "PATCH" as const,
        path: "/blocks/{page_id}/children",
        pathParams: JSON.stringify([
          { name: "page_id", type: "string", required: true, description: "The page ID to append to" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["children"],
          properties: {
            children: {
              type: "array",
              description: "Array of Notion block objects to append. Each block needs object, type, and type-specific data.",
            },
          },
        }),
        aiUsageHint: `Append content blocks to an existing Notion page. Use this to write long documents in batches after creating the page with create_page.

CRITICAL LIMITS:
- Each rich_text[].text.content: MAX 2000 characters — silently truncated beyond this
- Max 100 blocks per request — split very large sections into multiple append calls

MULTI-SECTION EXAMPLE (append a full section with heading + paragraphs + bullets):
{
  "page_id": "YOUR_PAGE_ID_FROM_CREATE_PAGE_RESPONSE",
  "children": [
    {"object":"block","type":"heading_1","heading_1":{"rich_text":[{"type":"text","text":{"content":"Section: Competitive Analysis"}}]}},
    {"object":"block","type":"paragraph","paragraph":{"rich_text":[{"type":"text","text":{"content":"Kaiko charges $50k-120k/year for enterprise access. CCData offers similar enterprise-only pricing. Neither has self-serve or pay-as-you-go tiers."}}]}},
    {"object":"block","type":"heading_2","heading_2":{"rich_text":[{"type":"text","text":{"content":"Pricing Comparison"}}]}},
    {"object":"block","type":"bulleted_list_item","bulleted_list_item":{"rich_text":[{"type":"text","text":{"content":"Kaiko: $50k-120k/year — enterprise contracts only"}}]}},
    {"object":"block","type":"bulleted_list_item","bulleted_list_item":{"rich_text":[{"type":"text","text":{"content":"CCData: enterprise tier, no public pricing"}}]}},
    {"object":"block","type":"bulleted_list_item","bulleted_list_item":{"rich_text":[{"type":"text","text":{"content":"CoinGecko: free tier + $129/mo — limited institutional data"}}]}},
    {"object":"block","type":"divider","divider":{}},
    {"object":"block","type":"heading_1","heading_1":{"rich_text":[{"type":"text","text":{"content":"Section: Recommendations"}}]}},
    {"object":"block","type":"paragraph","paragraph":{"rich_text":[{"type":"text","text":{"content":"QuantXData's pay-as-you-go model is the key differentiator. Emphasize no minimum commitment and instant access in all marketing."}}]}}
  ]
}

PATTERN for a full research document:
1. create_page → first sections (≤30 blocks) → save returned "id"
2. append_page_content → next sections (≤50 blocks) using saved page_id
3. Repeat append for each additional batch`,
        exampleArgs: JSON.stringify({
          page_id: "your-page-id-here",
          children: [
            {
              object: "block",
              type: "paragraph",
              paragraph: {
                rich_text: [{ type: "text", text: { content: "Added content." } }],
              },
            },
          ],
        }),
      },

      // ── Get User ─────────────────────────────────────────────────────────────
      {
        name: "get_current_user",
        displayName: "Get Current User",
        description: "Get the Notion bot user associated with the integration token",
        method: "GET" as const,
        path: "/users/me",
        aiUsageHint: "Verify the integration token is valid and get the bot user info. Use as a connection health check.",
        exampleArgs: JSON.stringify({}),
      },

      // ── List Users ───────────────────────────────────────────────────────────
      {
        name: "list_users",
        displayName: "List Users",
        description: "List all users in the Notion workspace",
        method: "GET" as const,
        path: "/users",
        queryParams: JSON.stringify([
          { name: "page_size", type: "number", description: "Number of users to return", default: 100 },
        ]),
        aiUsageHint: "List workspace members. Requires workspace-level access in the integration settings.",
        exampleArgs: JSON.stringify({ page_size: 100 }),
      },

      // ── Create Comment ────────────────────────────────────────────────────────
      {
        name: "create_comment",
        displayName: "Create Comment",
        description: "Add a comment to a Notion page",
        method: "POST" as const,
        path: "/comments",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["parent", "rich_text"],
          properties: {
            parent: {
              type: "object",
              description: 'Page to comment on: {"page_id": "abc123"}',
            },
            rich_text: {
              type: "array",
              description: 'Comment text as rich text array: [{"type": "text", "text": {"content": "My comment"}}]',
            },
          },
        }),
        aiUsageHint: `Add a comment to a Notion page.
{
  "parent": { "page_id": "YOUR_PAGE_ID" },
  "rich_text": [{ "type": "text", "text": { "content": "This is my comment." } }]
}`,
        exampleArgs: JSON.stringify({
          parent: { page_id: "your-page-id-here" },
          rich_text: [{ type: "text", text: { content: "Comment text here." } }],
        }),
      },
    ];

    // Insert corrected tools
    const toolIds = [];
    for (const tool of tools) {
      const toolId = await ctx.db.insert("blueprintTools", {
        ...tool,
        blueprintId: blueprintId as any,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      toolIds.push(toolId);
    }

    return {
      message: existing
        ? "✅ Notion blueprint updated with corrected tool definitions!"
        : "✅ Notion blueprint created!",
      blueprintId,
      toolsCreated: toolIds.length,
      action: existing ? "updated" : "created",
      criticalFix: "create_page now requires nested parent/properties objects — see aiUsageHint",
      nextStep: "Deploy then run: npx convex run seedNotionBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud",
    };
  },
});
