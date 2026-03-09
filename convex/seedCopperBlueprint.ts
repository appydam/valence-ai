/**
 * Seed Copper CRM integration blueprint
 * Run this once to create the Copper blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedCopperBlueprint -> Run
 *
 * Prerequisites:
 * - Create an OAuth app at https://app.copper.com/oauth
 * - Set OAUTH_SECRET_COPPER env var in Convex dashboard
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "copper"))
      .first();

    if (existing) {
      return {
        message: "Copper blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "copper",
      name: "Copper CRM",
      description:
        "Google Workspace-native CRM. Manage people (contacts), companies, opportunities, activities, and pipelines. Tightly integrated with Gmail and Google Calendar.",
      category: "crm",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "",
        clientSecret: "OAUTH_SECRET_COPPER",
        authorizeUrl: "https://app.copper.com/oauth/authorize",
        tokenUrl: "https://app.copper.com/oauth/token",
        scopes: ["basic"],
        scopeSeparator: "space",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://api.copper.com/developer_api/v1",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developer.copper.com/",
      iconUrl: "https://cdn.simpleicons.org/copper/DF7E1E",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_people",
        displayName: "List People (Contacts)",
        description: "Search and list people (contacts) in Copper CRM.",
        method: "POST" as const,
        path: "/people/search",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            page_size: { type: "number", description: "Results per page (max 200)", default: 25 },
            page_number: { type: "number", description: "Page number (1-indexed)", default: 1 },
            sort_by: { type: "string", description: "Sort field: name, email, date_created, date_modified" },
            sort_direction: { type: "string", enum: ["asc", "desc"], default: "desc" },
            emails: { type: "array", items: { type: "string" }, description: "Filter by email addresses" },
            name: { type: "string", description: "Filter by name (partial match)" },
          },
        }),
        aiUsageHint: "Search Copper contacts. Filter by email array or name string. Copper uses POST for search endpoints.",
        exampleArgs: JSON.stringify({ emails: ["customer@example.com"], page_size: 20 }),
      },
      {
        name: "get_person",
        displayName: "Get Person",
        description: "Get details of a specific person (contact) in Copper CRM.",
        method: "GET" as const,
        path: "/people/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "number", required: true, description: "Person ID" },
        ]),
        aiUsageHint: "Fetch a specific Copper contact by their ID.",
        exampleArgs: JSON.stringify({ id: 12345 }),
      },
      {
        name: "create_person",
        displayName: "Create Person",
        description: "Create a new person (contact) in Copper CRM.",
        method: "POST" as const,
        path: "/people",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Full name" },
            emails: { type: "array", items: { type: "object", properties: { email: { type: "string" }, category: { type: "string", enum: ["work", "personal", "other"] } } } },
            phone_numbers: { type: "array", items: { type: "object", properties: { number: { type: "string" }, category: { type: "string" } } } },
            title: { type: "string", description: "Job title" },
            company_id: { type: "number", description: "Associated company ID" },
            tags: { type: "array", items: { type: "string" } },
          },
        }),
        aiUsageHint: "Create a Copper contact. Name is required. Add emails as array of objects with email and category (work/personal).",
        exampleArgs: JSON.stringify({ name: "Jane Doe", emails: [{ email: "jane@example.com", category: "work" }], title: "CEO" }),
      },
      {
        name: "list_companies",
        displayName: "List Companies",
        description: "Search and list companies in Copper CRM.",
        method: "POST" as const,
        path: "/companies/search",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            page_size: { type: "number", default: 25 },
            page_number: { type: "number", default: 1 },
            name: { type: "string", description: "Filter by company name (partial match)" },
            sort_by: { type: "string" },
            sort_direction: { type: "string", enum: ["asc", "desc"] },
          },
        }),
        aiUsageHint: "Search Copper companies by name. Returns company IDs needed for associating contacts and opportunities.",
        exampleArgs: JSON.stringify({ name: "Acme", page_size: 20 }),
      },
      {
        name: "create_company",
        displayName: "Create Company",
        description: "Create a new company in Copper CRM.",
        method: "POST" as const,
        path: "/companies",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Company name" },
            email_domain: { type: "string", description: "Email domain (e.g. example.com)" },
            phone_numbers: { type: "array", items: { type: "object", properties: { number: { type: "string" }, category: { type: "string" } } } },
            websites: { type: "array", items: { type: "object", properties: { url: { type: "string" }, category: { type: "string" } } } },
            tags: { type: "array", items: { type: "string" } },
          },
        }),
        aiUsageHint: "Create a company in Copper CRM. Name is required.",
        exampleArgs: JSON.stringify({ name: "Acme Corp", email_domain: "acme.com", websites: [{ url: "https://acme.com", category: "work" }] }),
      },
      {
        name: "list_opportunities",
        displayName: "List Opportunities",
        description: "Search and list opportunities (deals) in Copper CRM.",
        method: "POST" as const,
        path: "/opportunities/search",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            page_size: { type: "number", default: 25 },
            page_number: { type: "number", default: 1 },
            pipeline_ids: { type: "array", items: { type: "number" }, description: "Filter by pipeline IDs" },
            pipeline_stage_ids: { type: "array", items: { type: "number" }, description: "Filter by stage IDs" },
            statuses: { type: "array", items: { type: "string" }, description: "Filter by status: Open, Won, Lost, Abandoned" },
            sort_by: { type: "string", description: "name, close_date, monetary_value, date_created" },
            sort_direction: { type: "string", enum: ["asc", "desc"] },
          },
        }),
        aiUsageHint: "Search Copper opportunities. Filter by statuses=['Open'] for active deals. Use pipeline_ids to filter by pipeline.",
        exampleArgs: JSON.stringify({ statuses: ["Open"], page_size: 25 }),
      },
      {
        name: "create_opportunity",
        displayName: "Create Opportunity",
        description: "Create a new opportunity (deal) in Copper CRM.",
        method: "POST" as const,
        path: "/opportunities",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["name", "pipeline_id", "pipeline_stage_id"],
          properties: {
            name: { type: "string", description: "Opportunity name" },
            pipeline_id: { type: "number", description: "Pipeline ID" },
            pipeline_stage_id: { type: "number", description: "Stage ID within the pipeline" },
            monetary_value: { type: "number", description: "Deal value" },
            close_date: { type: "number", description: "Unix timestamp of expected close date" },
            primary_contact_id: { type: "number", description: "Primary contact person ID" },
            company_id: { type: "number", description: "Associated company ID" },
            status: { type: "string", enum: ["Open", "Won", "Lost", "Abandoned"], default: "Open" },
          },
        }),
        aiUsageHint: "Create a Copper opportunity (deal). Requires name, pipeline_id, and pipeline_stage_id. Optionally set monetary value and close date.",
        exampleArgs: JSON.stringify({ name: "Enterprise License", pipeline_id: 1, pipeline_stage_id: 2, monetary_value: 50000, status: "Open" }),
      },
      {
        name: "list_activities",
        displayName: "List Activities",
        description: "List activities (calls, emails, meetings, notes) in Copper CRM.",
        method: "POST" as const,
        path: "/activities/search",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            page_size: { type: "number", default: 25 },
            page_number: { type: "number", default: 1 },
            parent: { type: "object", properties: { type: { type: "string", enum: ["person", "company", "opportunity"] }, id: { type: "number" } } },
            sort_by: { type: "string" },
            sort_direction: { type: "string" },
          },
        }),
        aiUsageHint: "List Copper activities for a specific person, company, or opportunity. Use parent.type and parent.id to filter.",
        exampleArgs: JSON.stringify({ parent: { type: "person", id: 12345 }, page_size: 20 }),
      },
      {
        name: "list_pipelines",
        displayName: "List Pipelines",
        description: "List all sales pipelines in Copper CRM.",
        method: "GET" as const,
        path: "/pipelines",
        aiUsageHint: "List Copper pipelines. Returns pipeline IDs and stage IDs needed for creating opportunities.",
        exampleArgs: JSON.stringify({}),
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
      message: "✅ Copper CRM blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Create OAuth app at https://app.copper.com/oauth",
        "2. Set OAUTH_SECRET_COPPER in Convex environment variables",
        "3. Note: Copper uses POST for search endpoints (not GET with query params)",
      ],
    };
  },
});
