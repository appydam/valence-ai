/**
 * Seed Clay integration blueprint
 *
 * Clay uses API key / Bearer token auth.
 * Clay does NOT have a traditional public REST API.
 * Access is via webhook ingest + internal endpoints + Enterprise enrichment API.
 * Webhook URLs are per-table (generated in Clay UI).
 *
 * Usage:
 * npx convex run seedClayBlueprint --url https://beloved-squirrel-599.convex.cloud
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "clay"))
      .first();

    if (existing) {
      return { message: "Clay blueprint already exists", blueprintId: existing._id };
    }

    const authConfig = {
      headerName: "Authorization",
      headerPrefix: "Bearer ",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "clay",
      name: "Clay",
      description: "Data enrichment and outreach — push leads into Clay tables via webhooks, trigger enrichment runs, and access person/company enrichment (Enterprise).",
      category: "sales",
      version: 1,
      status: "active",
      authType: "api_key",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://api.clay.com",
      defaultHeaders: JSON.stringify({
        "Accept": "application/json",
        "Content-Type": "application/json",
      }),
      sourceType: "manual",
      sourceUrl: "https://www.clay.com/university/guide/using-clay-as-an-api",
      iconUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2214%22%20fill%3D%22%232563EB%22%2F%3E%3Ctext%20x%3D%2232%22%20y%3D%2244%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%2CHelvetica%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2224%22%20fill%3D%22%23fff%22%3EClay%3C%2Ftext%3E%3C%2Fsvg%3E",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "push_to_table",
        displayName: "Push Data to Table",
        description: "Push data into a Clay table via its webhook URL. Each table has a unique webhook ID generated in the Clay UI.",
        method: "POST" as const,
        path: "/v3/sources/webhook/{webhook_id}",
        pathParams: JSON.stringify([
          { name: "webhook_id", type: "string", required: true, description: "Webhook ID for the target Clay table (found in Clay UI under table sources)" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            data: { type: "object", description: "Key-value pairs to push into the table. Keys become column names." },
          },
        }),
        aiUsageHint: "Push data into a Clay table via webhook. The webhook_id is the unique identifier from the Clay table's webhook source URL. Data keys become column names in the table.",
        exampleArgs: JSON.stringify({ webhook_id: "pull-in-data-from-a-webhook-abc123", data: { name: "John Doe", email: "john@acme.com", company: "Acme Inc" } }),
      },
      {
        name: "run_table",
        displayName: "Run Table Enrichment",
        description: "Trigger an enrichment run on specific records in a Clay table",
        method: "PATCH" as const,
        path: "/v3/tables/{table_id}/run",
        pathParams: JSON.stringify([
          { name: "table_id", type: "string", required: true, description: "Clay table ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            callerName: { type: "string", description: "Name of the caller triggering the run" },
            fieldIds: { type: "array", description: "Array of field IDs to enrich" },
            forceRun: { type: "boolean", description: "Force re-run even if already enriched", default: false },
            runRecords: { type: "array", description: "Array of record IDs to run enrichment on" },
          },
        }),
        aiUsageHint: "Trigger enrichment on specific records in a table. Requires table_id from the Clay UI URL.",
        exampleArgs: JSON.stringify({ table_id: "tbl_abc123", callerName: "MissionControl", forceRun: true }),
      },
      {
        name: "enrich_person",
        displayName: "Enrich Person (Enterprise)",
        description: "Enrich a person by email or LinkedIn URL. Returns name, company, LinkedIn URL. Enterprise plan only.",
        method: "POST" as const,
        path: "/v3/people/enrich",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            email: { type: "string", description: "Email address to enrich" },
            linkedinUrl: { type: "string", description: "LinkedIn profile URL to enrich" },
          },
        }),
        aiUsageHint: "Enrich a person — returns basic profile data (name, company, LinkedIn). Enterprise plan only. Provide email or LinkedIn URL.",
        exampleArgs: JSON.stringify({ email: "john@acme.com" }),
      },
      {
        name: "enrich_company",
        displayName: "Enrich Company (Enterprise)",
        description: "Enrich a company by domain. Returns funding stage, employee count, industry. Enterprise plan only.",
        method: "POST" as const,
        path: "/v3/companies/enrich",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["domain"],
          properties: {
            domain: { type: "string", description: "Company domain (e.g. acme.com)" },
          },
        }),
        aiUsageHint: "Enrich a company by domain — returns funding stage, total funding, employee count, industry. Enterprise plan only.",
        exampleArgs: JSON.stringify({ domain: "acme.com" }),
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
      message: "Clay blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
    };
  },
});
