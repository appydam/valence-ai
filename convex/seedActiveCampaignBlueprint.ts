/**
 * Seed ActiveCampaign integration blueprint
 * Run this once to create the ActiveCampaign blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedActiveCampaignBlueprint -> Run
 *
 * Prerequisites:
 * - No OAuth app needed. ActiveCampaign uses API key auth.
 * - Users find their API key + account URL at: Settings → Developer
 * - Note: baseUrl is per-account (e.g. https://youraccountname.api-us1.com)
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "activecampaign"))
      .first();

    if (existing) {
      return {
        message: "ActiveCampaign blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "activecampaign",
      name: "ActiveCampaign",
      description:
        "Marketing automation and CRM platform. Manage contacts, lists, campaigns, automations, deals, and tags to run email marketing and sales pipelines.",
      category: "marketing",
      version: 1,
      status: "active",
      authType: "api_key",
      authConfig: JSON.stringify({
        apiKeyLocation: "header",
        apiKeyHeader: "Api-Token",
        instructions: "Find your API key at Settings → Developer in your ActiveCampaign account. Also note your Account URL (e.g. https://yourname.api-us1.com).",
      }),
      baseUrl: "https://{account}.api-us1.com/api/3",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.activecampaign.com/reference/overview",
      iconUrl: "https://cdn.simpleicons.org/activecampaign/356AE6",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_contacts",
        displayName: "List Contacts",
        description: "List contacts in ActiveCampaign. Search by email, name, or filter by list.",
        method: "GET" as const,
        path: "/contacts",
        queryParams: JSON.stringify([
          { name: "email", type: "string", description: "Filter by email address" },
          { name: "search", type: "string", description: "Search by name or email" },
          { name: "listid", type: "string", description: "Filter by list ID" },
          { name: "tagid", type: "string", description: "Filter by tag ID" },
          { name: "limit", type: "number", description: "Max results (max 100)", default: 20 },
          { name: "offset", type: "number", description: "Pagination offset", default: 0 },
        ]),
        aiUsageHint: "List ActiveCampaign contacts. Filter by email to find a specific contact. Use listid to see contacts in a specific list.",
        exampleArgs: JSON.stringify({ email: "customer@example.com" }),
      },
      {
        name: "create_contact",
        displayName: "Create Contact",
        description: "Create a new contact in ActiveCampaign.",
        method: "POST" as const,
        path: "/contacts",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["contact"],
          properties: {
            contact: {
              type: "object",
              required: ["email"],
              properties: {
                email: { type: "string", description: "Contact email (required)" },
                firstName: { type: "string" },
                lastName: { type: "string" },
                phone: { type: "string" },
                orgname: { type: "string", description: "Organization name" },
              },
            },
          },
        }),
        aiUsageHint: "Create an ActiveCampaign contact. Email is required. Optionally provide name, phone, and organization.",
        exampleArgs: JSON.stringify({ contact: { email: "new@example.com", firstName: "Jane", lastName: "Doe" } }),
      },
      {
        name: "update_contact",
        displayName: "Update Contact",
        description: "Update an existing ActiveCampaign contact's information.",
        method: "PUT" as const,
        path: "/contacts/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "number", required: true, description: "Contact ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["contact"],
          properties: {
            contact: {
              type: "object",
              properties: {
                email: { type: "string" },
                firstName: { type: "string" },
                lastName: { type: "string" },
                phone: { type: "string" },
              },
            },
          },
        }),
        aiUsageHint: "Update an ActiveCampaign contact. Only provided fields are changed.",
        exampleArgs: JSON.stringify({ id: 123, contact: { firstName: "Jane Updated" } }),
      },
      {
        name: "list_lists",
        displayName: "List Lists",
        description: "List all mailing lists in the ActiveCampaign account.",
        method: "GET" as const,
        path: "/lists",
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 20 },
          { name: "offset", type: "number", default: 0 },
        ]),
        aiUsageHint: "List all ActiveCampaign mailing lists. Use to find list IDs for subscribing contacts.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "add_contact_to_list",
        displayName: "Subscribe Contact to List",
        description: "Subscribe a contact to an ActiveCampaign list.",
        method: "POST" as const,
        path: "/contactLists",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["contactList"],
          properties: {
            contactList: {
              type: "object",
              required: ["list", "contact", "status"],
              properties: {
                list: { type: "number", description: "List ID" },
                contact: { type: "number", description: "Contact ID" },
                status: { type: "number", enum: [1, 2], description: "1=Active (subscribed), 2=Unsubscribed" },
              },
            },
          },
        }),
        aiUsageHint: "Subscribe a contact to an ActiveCampaign list. Use status=1 to subscribe, status=2 to unsubscribe.",
        exampleArgs: JSON.stringify({ contactList: { list: 1, contact: 123, status: 1 } }),
      },
      {
        name: "add_tag_to_contact",
        displayName: "Add Tag to Contact",
        description: "Apply a tag to an ActiveCampaign contact.",
        method: "POST" as const,
        path: "/contactTags",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["contactTag"],
          properties: {
            contactTag: {
              type: "object",
              required: ["contact", "tag"],
              properties: {
                contact: { type: "number", description: "Contact ID" },
                tag: { type: "number", description: "Tag ID" },
              },
            },
          },
        }),
        aiUsageHint: "Apply a tag to an ActiveCampaign contact. Use list_tags first to find the tag ID.",
        exampleArgs: JSON.stringify({ contactTag: { contact: 123, tag: 5 } }),
      },
      {
        name: "list_tags",
        displayName: "List Tags",
        description: "List all tags in the ActiveCampaign account.",
        method: "GET" as const,
        path: "/tags",
        queryParams: JSON.stringify([
          { name: "search", type: "string", description: "Search by tag name" },
          { name: "limit", type: "number", default: 20 },
        ]),
        aiUsageHint: "List ActiveCampaign tags. Use to find tag IDs for applying to contacts.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_automations",
        displayName: "List Automations",
        description: "List all automations in the ActiveCampaign account.",
        method: "GET" as const,
        path: "/automations",
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 20 },
          { name: "offset", type: "number", default: 0 },
        ]),
        aiUsageHint: "List all ActiveCampaign automations (drip sequences). Use to see active workflows.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_campaigns",
        displayName: "List Campaigns",
        description: "List all email campaigns in the ActiveCampaign account.",
        method: "GET" as const,
        path: "/campaigns",
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 20 },
          { name: "offset", type: "number", default: 0 },
          { name: "filters[status]", type: "number", description: "0=Draft, 1=Scheduled, 2=Sending, 3=Sent, 4=Disabled" },
        ]),
        aiUsageHint: "List ActiveCampaign email campaigns. Filter by status to see sent (3) or scheduled (1) campaigns.",
        exampleArgs: JSON.stringify({ "filters[status]": 3 }),
      },
      {
        name: "list_deals",
        displayName: "List Deals",
        description: "List deals in the ActiveCampaign CRM pipeline.",
        method: "GET" as const,
        path: "/deals",
        queryParams: JSON.stringify([
          { name: "filters[status]", type: "number", description: "0=Open, 1=Won, 2=Lost" },
          { name: "filters[stage]", type: "string", description: "Filter by stage ID" },
          { name: "limit", type: "number", default: 20 },
          { name: "offset", type: "number", default: 0 },
        ]),
        aiUsageHint: "List ActiveCampaign CRM deals. Filter by status=0 for open deals, status=1 for won.",
        exampleArgs: JSON.stringify({ "filters[status]": 0, limit: 20 }),
      },
      {
        name: "create_deal",
        displayName: "Create Deal",
        description: "Create a new deal in the ActiveCampaign CRM pipeline.",
        method: "POST" as const,
        path: "/deals",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["deal"],
          properties: {
            deal: {
              type: "object",
              required: ["title", "value", "currency", "pipeline", "stage", "owner"],
              properties: {
                title: { type: "string", description: "Deal name" },
                value: { type: "number", description: "Deal value in cents" },
                currency: { type: "string", description: "Currency code, e.g. 'usd'", default: "usd" },
                pipeline: { type: "number", description: "Pipeline ID" },
                stage: { type: "number", description: "Stage ID" },
                owner: { type: "number", description: "User ID of deal owner" },
                contact: { type: "number", description: "Contact ID to associate" },
              },
            },
          },
        }),
        aiUsageHint: "Create a deal in ActiveCampaign CRM. Provide title, value (in cents), pipeline ID, stage ID, and owner user ID.",
        exampleArgs: JSON.stringify({ deal: { title: "Enterprise Contract", value: 500000, currency: "usd", pipeline: 1, stage: 1, owner: 1 } }),
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
      message: "✅ ActiveCampaign blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Find API key at Settings → Developer in your ActiveCampaign account",
        "2. Note your account URL (e.g. https://yourname.api-us1.com)",
        "3. No OAuth app registration required",
      ],
    };
  },
});
