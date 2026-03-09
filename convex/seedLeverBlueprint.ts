/**
 * Seed Lever integration blueprint
 * Run this once to create the Lever blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedLeverBlueprint -> Run
 *
 * Prerequisites:
 * - Register as a Lever partner at https://hire.lever.co/developer/partner
 * - Set OAUTH_SECRET_LEVER env var in Convex dashboard
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "lever"))
      .first();

    if (existing) {
      return {
        message: "Lever blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "lever",
      name: "Lever",
      description:
        "Recruiting and ATS platform. Manage candidates (opportunities), job postings, interviews, and hiring pipeline stages.",
      category: "hr",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "",
        clientSecret: "OAUTH_SECRET_LEVER",
        authorizeUrl: "https://auth.lever.co/authorize",
        tokenUrl: "https://auth.lever.co/oauth/token",
        scopes: [
          "opportunities:read:admin",
          "opportunities:write:admin",
          "postings:read:admin",
          "contacts:read:admin",
          "interviews:read:admin",
          "users:read:admin",
          "stages:read:admin",
          "notes:write:admin",
        ],
        scopeSeparator: "space",
        extraAuthParams: { audience: "https://api.lever.co/v1/" },
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://api.lever.co/v1",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://hire.lever.co/developer/documentation",
      iconUrl: "https://cdn.simpleicons.org/lever/00B4B4",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_opportunities",
        displayName: "List Opportunities (Candidates)",
        description: "List candidate opportunities in Lever. Filter by stage, posting, tag, and more.",
        method: "GET" as const,
        path: "/opportunities",
        queryParams: JSON.stringify([
          { name: "posting_id", type: "string", description: "Filter by job posting ID" },
          { name: "stage_id", type: "string", description: "Filter by pipeline stage ID" },
          { name: "tag", type: "string", description: "Filter by tag" },
          { name: "origin", type: "string", description: "Filter by source: sourced, applied, referred, university, agency, internal" },
          { name: "archived_posting_id", type: "string", description: "Filter archived opportunities by posting" },
          { name: "limit", type: "number", description: "Results per page (max 100)", default: 25 },
          { name: "offset", type: "string", description: "Pagination cursor" },
        ]),
        aiUsageHint: "List Lever candidate opportunities. Filter by posting_id for a specific job. Filter by stage_id to see candidates in a specific pipeline stage.",
        exampleArgs: JSON.stringify({ limit: 25 }),
      },
      {
        name: "get_opportunity",
        displayName: "Get Opportunity",
        description: "Get full details of a specific candidate opportunity in Lever.",
        method: "GET" as const,
        path: "/opportunities/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Opportunity ID" },
        ]),
        aiUsageHint: "Get all details for a Lever candidate opportunity including contact info, stage, and application history.",
        exampleArgs: JSON.stringify({ id: "OPPORTUNITY_ID" }),
      },
      {
        name: "create_opportunity",
        displayName: "Create Opportunity",
        description: "Create a new candidate opportunity in Lever.",
        method: "POST" as const,
        path: "/opportunities",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["performAsUserId"],
          properties: {
            performAsUserId: { type: "string", description: "Lever user ID performing the action" },
            name: { type: "string", description: "Candidate full name" },
            headline: { type: "string", description: "Candidate headline/title" },
            stage: { type: "string", description: "Stage ID to place candidate in" },
            postings: { type: "array", items: { type: "string" }, description: "Posting IDs to apply to" },
            emails: { type: "array", items: { type: "object", properties: { type: { type: "string" }, value: { type: "string" } } } },
            phones: { type: "array", items: { type: "object", properties: { type: { type: "string" }, value: { type: "string" } } } },
            tags: { type: "array", items: { type: "string" } },
            sources: { type: "array", items: { type: "string" } },
            origin: { type: "string", enum: ["sourced", "applied", "referred", "university", "agency", "internal"] },
          },
        }),
        aiUsageHint: "Create a Lever candidate opportunity. Provide performAsUserId (acting user), candidate name, and at minimum one posting or stage.",
        exampleArgs: JSON.stringify({
          performAsUserId: "USER_ID",
          name: "Jane Smith",
          emails: [{ type: "work", value: "jane@example.com" }],
          postings: ["POSTING_ID"],
          origin: "sourced",
        }),
      },
      {
        name: "list_postings",
        displayName: "List Job Postings",
        description: "List job postings (open positions) in Lever.",
        method: "GET" as const,
        path: "/postings",
        queryParams: JSON.stringify([
          { name: "state", type: "string", description: "published, internal, closed, draft, pending, rejected", default: "published" },
          { name: "department", type: "string", description: "Filter by department name" },
          { name: "team", type: "string", description: "Filter by team name" },
          { name: "location", type: "string", description: "Filter by location" },
          { name: "limit", type: "number", default: 25 },
          { name: "offset", type: "string" },
        ]),
        aiUsageHint: "List Lever job postings. Use state='published' for active openings. Filter by department or location.",
        exampleArgs: JSON.stringify({ state: "published", limit: 25 }),
      },
      {
        name: "get_posting",
        displayName: "Get Job Posting",
        description: "Get details of a specific Lever job posting.",
        method: "GET" as const,
        path: "/postings/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Posting ID" },
        ]),
        aiUsageHint: "Get full details of a Lever job posting including description, requirements, and team.",
        exampleArgs: JSON.stringify({ id: "POSTING_ID" }),
      },
      {
        name: "create_note",
        displayName: "Add Note to Opportunity",
        description: "Add a note to a candidate opportunity in Lever.",
        method: "POST" as const,
        path: "/opportunities/{id}/notes",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Opportunity ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["performAsUserId", "value"],
          properties: {
            performAsUserId: { type: "string", description: "Lever user ID writing the note" },
            value: { type: "string", description: "Note content" },
            secret: { type: "boolean", description: "If true, note is private to recruiters", default: false },
            notifyFollowers: { type: "boolean", description: "Send notification to followers", default: false },
          },
        }),
        aiUsageHint: "Add a note to a Lever candidate. Provide the opportunity ID, acting user ID, and note content.",
        exampleArgs: JSON.stringify({ id: "OPPORTUNITY_ID", performAsUserId: "USER_ID", value: "Great phone screen. Moving to technical round." }),
      },
      {
        name: "list_stages",
        displayName: "List Pipeline Stages",
        description: "List all pipeline stages configured in Lever.",
        method: "GET" as const,
        path: "/stages",
        aiUsageHint: "List all Lever pipeline stages. Use stage IDs when filtering opportunities or creating new ones.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_users",
        displayName: "List Users",
        description: "List all users (recruiters and hiring managers) in the Lever account.",
        method: "GET" as const,
        path: "/users",
        queryParams: JSON.stringify([
          { name: "email", type: "string", description: "Filter by email" },
          { name: "limit", type: "number", default: 25 },
          { name: "offset", type: "string" },
        ]),
        aiUsageHint: "List Lever users. Use to find user IDs needed for performAsUserId parameter in create/update operations.",
        exampleArgs: JSON.stringify({ limit: 25 }),
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
      message: "✅ Lever blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Apply for Lever partner access at https://hire.lever.co/developer/partner",
        "2. Create OAuth app through Lever's partner portal",
        "3. Set OAUTH_SECRET_LEVER in Convex environment variables",
      ],
    };
  },
});
