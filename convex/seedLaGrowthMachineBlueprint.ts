/**
 * Seed La Growth Machine integration blueprint
 *
 * LGM uses API key auth — key passed as ?apikey= query parameter.
 * API key found at: Settings > Integrations & API in the LGM app.
 * Requires Pro plan or higher.
 *
 * Usage:
 * npx convex run seedLaGrowthMachineBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "lagrowthmachine"))
      .first();

    if (existing) {
      return { message: "La Growth Machine blueprint already exists", blueprintId: existing._id };
    }

    const authConfig = {
      queryParam: "apikey",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "lagrowthmachine",
      name: "La Growth Machine",
      description: "Multi-channel sales outreach — manage leads, audiences, campaigns, and identities across LinkedIn, email, and Twitter.",
      category: "sales",
      version: 1,
      status: "active",
      authType: "api_key",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://apiv2.lagrowthmachine.com/flow",
      defaultHeaders: JSON.stringify({
        "Accept": "application/json",
        "Content-Type": "application/json",
      }),
      sourceType: "manual",
      sourceUrl: "https://documenter.getpostman.com/view/2071164/TVCmSkH2",
      iconUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2214%22%20fill%3D%22%234F46E5%22%2F%3E%3Ctext%20x%3D%2232%22%20y%3D%2244%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%2CHelvetica%2Csans-serif%22%20font-weight%3D%22900%22%20font-size%3D%2220%22%20fill%3D%22%23fff%22%3ELGM%3C%2Ftext%3E%3C%2Fsvg%3E",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "create_lead",
        displayName: "Create / Update Lead",
        description: "Create or update a lead in an audience. Requires audience name and at least one identifier.",
        method: "POST" as const,
        path: "/leads",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["audience"],
          properties: {
            audience: { type: "string", description: "Audience name to add the lead to" },
            proEmail: { type: "string", description: "Professional email" },
            persoEmail: { type: "string", description: "Personal email" },
            linkedinUrl: { type: "string", description: "LinkedIn profile URL" },
            twitter: { type: "string", description: "Twitter handle" },
            firstname: { type: "string", description: "First name" },
            lastname: { type: "string", description: "Last name" },
            companyName: { type: "string", description: "Company name" },
            companyUrl: { type: "string", description: "Company website URL" },
            phone: { type: "string", description: "Phone number" },
            jobTitle: { type: "string", description: "Job title" },
            location: { type: "string", description: "Location" },
            industry: { type: "string", description: "Industry" },
            gender: { type: "string", description: "Gender: man or woman" },
            leadId: { type: "string", description: "Existing lead ID (for updates)" },
            customAttribute1: { type: "string", description: "Custom attribute 1" },
            customAttribute2: { type: "string", description: "Custom attribute 2" },
            customAttribute3: { type: "string", description: "Custom attribute 3" },
          },
        }),
        aiUsageHint: "Create or update a lead. Must provide audience name + at least one identifier (email, LinkedIn URL, twitter, or firstname+lastname+company). Custom attributes 1-10 are available as strings.",
        exampleArgs: JSON.stringify({ audience: "Q1 Outreach", proEmail: "john@acme.com", firstname: "John", lastname: "Doe", companyName: "Acme Inc", jobTitle: "CTO" }),
      },
      {
        name: "search_lead",
        displayName: "Search Lead",
        description: "Search for a lead by email, LinkedIn URL, lead ID, or name+company",
        method: "GET" as const,
        path: "/leads",
        queryParams: JSON.stringify([
          { name: "email", type: "string", description: "Search by email address" },
          { name: "linkedinUrl", type: "string", description: "Search by LinkedIn URL" },
          { name: "leadId", type: "string", description: "Search by lead ID" },
          { name: "firstname", type: "string", description: "First name (use with lastname + companyName/companyUrl)" },
          { name: "lastname", type: "string", description: "Last name" },
          { name: "companyName", type: "string", description: "Company name" },
          { name: "companyUrl", type: "string", description: "Company website URL" },
        ]),
        aiUsageHint: "Search for a lead. Use email, linkedinUrl, or leadId for exact match. Or use firstname+lastname+companyName for fuzzy match.",
        exampleArgs: JSON.stringify({ email: "john@acme.com" }),
      },
      {
        name: "remove_lead",
        displayName: "Remove Lead",
        description: "Remove a lead from one or all audiences",
        method: "POST" as const,
        path: "/leads/remove",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["audience"],
          properties: {
            audience: { type: "string", description: "Audience name or 'all' to remove from all audiences" },
            proEmail: { type: "string", description: "Professional email" },
            persoEmail: { type: "string", description: "Personal email" },
            linkedinUrl: { type: "string", description: "LinkedIn URL" },
            twitter: { type: "string", description: "Twitter handle" },
            crm_id: { type: "string", description: "CRM ID" },
          },
        }),
        aiUsageHint: "Remove a lead from an audience. Provide audience name (or 'all') + at least one identifier.",
        exampleArgs: JSON.stringify({ audience: "all", proEmail: "john@acme.com" }),
      },
      {
        name: "list_audiences",
        displayName: "List Audiences",
        description: "Get all audiences with their size, type, and source",
        method: "GET" as const,
        path: "/audiences",
        aiUsageHint: "List all audiences. Returns id, name, description, size, type, source for each.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "create_audience",
        displayName: "Create Audience from LinkedIn",
        description: "Create a new audience by importing from a LinkedIn URL",
        method: "POST" as const,
        path: "/audiences",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["linkedinUrl", "audience", "identityId"],
          properties: {
            linkedinUrl: { type: "string", description: "LinkedIn search/list URL to import from" },
            audience: { type: "string", description: "Name for the new audience" },
            identityId: { type: "string", description: "Identity ID to use for import (get from list_identities)" },
            autoImport: { type: "boolean", description: "Auto-import new matching leads", default: false },
            excludeContactedLeads: { type: "boolean", description: "Exclude already contacted leads", default: false },
          },
        }),
        aiUsageHint: "Create an audience from a LinkedIn URL. Requires identityId from list_identities endpoint.",
        exampleArgs: JSON.stringify({ linkedinUrl: "https://www.linkedin.com/search/results/people/?keywords=CTO", audience: "CTOs", identityId: "abc123" }),
      },
      {
        name: "list_campaigns",
        displayName: "List Campaigns",
        description: "List all campaigns with pagination",
        method: "GET" as const,
        path: "/campaigns",
        queryParams: JSON.stringify([
          { name: "skip", type: "number", default: 0, description: "Offset for pagination" },
          { name: "limit", type: "number", default: 25, description: "Results per page (max 25)" },
        ]),
        aiUsageHint: "List campaigns. Max 25 per page, use skip for pagination.",
        exampleArgs: JSON.stringify({ limit: 25 }),
      },
      {
        name: "list_identities",
        displayName: "List Identities",
        description: "List all connected identities (LinkedIn, email, etc.)",
        method: "GET" as const,
        path: "/identities",
        aiUsageHint: "List all connected identities with their IDs. Needed for create_audience and other operations.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_inbox_webhooks",
        displayName: "List Inbox Webhooks",
        description: "List all configured inbox webhooks",
        method: "GET" as const,
        path: "/inboxWebhooks",
        aiUsageHint: "List all inbox webhooks. Returns id, url, name, type, campaigns, createdAt.",
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
      message: "La Growth Machine blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
    };
  },
});
