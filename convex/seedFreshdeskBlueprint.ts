/**
 * Seed Freshdesk integration blueprint
 * Run this once to create the Freshdesk blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedFreshdeskBlueprint -> Run
 *
 * Prerequisites:
 * - No OAuth app needed. Freshdesk uses API key auth.
 * - Users find their API key at: Profile Settings → Your API Key
 * - Auth: Basic auth with API key as username, "X" as password
 * - Note: baseUrl is per-domain — users must provide their {domain}.freshdesk.com
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "freshdesk"))
      .first();

    if (existing) {
      return {
        message: "Freshdesk blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "freshdesk",
      name: "Freshdesk",
      description:
        "Customer support platform. Manage tickets, contacts, and agents. Create and update support tickets, add replies, and track resolution status.",
      category: "customer_support",
      version: 1,
      status: "active",
      authType: "api_key",
      authConfig: JSON.stringify({
        apiKeyLocation: "header",
        apiKeyHeader: "Authorization",
        apiKeyPrefix: "Basic",
        apiKeyEncoding: "base64_colon_x",
        instructions: "Freshdesk uses Basic Auth: base64(API_KEY:X). Paste your API key — the system will handle encoding.",
      }),
      baseUrl: "https://{domain}.freshdesk.com/api/v2",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.freshdesk.com/api/",
      iconUrl: "https://cdn.simpleicons.org/freshdesk/25C16F",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_tickets",
        displayName: "List Tickets",
        description: "List support tickets in the Freshdesk account. Filter by status, priority, and more.",
        method: "GET" as const,
        path: "/tickets",
        queryParams: JSON.stringify([
          { name: "filter", type: "string", description: "Predefined filter: new_and_my_open, watching, spam, deleted" },
          { name: "status", type: "number", description: "Status: 2=Open, 3=Pending, 4=Resolved, 5=Closed" },
          { name: "priority", type: "number", description: "Priority: 1=Low, 2=Medium, 3=High, 4=Urgent" },
          { name: "page", type: "number", description: "Page number", default: 1 },
          { name: "per_page", type: "number", description: "Results per page (max 100)", default: 30 },
          { name: "order_by", type: "string", description: "Sort field: created_at, updated_at, due_by" },
          { name: "order_type", type: "string", description: "asc or desc", default: "desc" },
        ]),
        aiUsageHint: "List Freshdesk tickets. Use status=2 for open tickets, status=4 for resolved. Filter with predefined filters like 'new_and_my_open'.",
        exampleArgs: JSON.stringify({ status: 2, priority: 3, per_page: 20 }),
      },
      {
        name: "get_ticket",
        displayName: "Get Ticket",
        description: "Get full details of a specific Freshdesk ticket by ID.",
        method: "GET" as const,
        path: "/tickets/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "number", required: true, description: "Ticket ID" },
        ]),
        aiUsageHint: "Fetch a specific Freshdesk ticket by its numeric ID.",
        exampleArgs: JSON.stringify({ id: 1234 }),
      },
      {
        name: "create_ticket",
        displayName: "Create Ticket",
        description: "Create a new support ticket in Freshdesk.",
        method: "POST" as const,
        path: "/tickets",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["subject", "status", "priority", "source"],
          properties: {
            subject: { type: "string", description: "Ticket subject" },
            description: { type: "string", description: "Ticket description (HTML supported)" },
            email: { type: "string", description: "Requester email" },
            name: { type: "string", description: "Requester name" },
            status: { type: "number", description: "2=Open, 3=Pending, 4=Resolved, 5=Closed", default: 2 },
            priority: { type: "number", description: "1=Low, 2=Medium, 3=High, 4=Urgent", default: 2 },
            source: { type: "number", description: "1=Email, 2=Portal, 3=Phone, 7=Chat, 9=Bot", default: 2 },
            tags: { type: "array", items: { type: "string" }, description: "Tags to apply" },
            type: { type: "string", description: "Ticket type (e.g. Question, Incident, Problem)" },
          },
        }),
        aiUsageHint: "Create a Freshdesk support ticket. Required: subject, status (2=Open), priority (1-4), source (2=Portal). Optionally include email and description.",
        exampleArgs: JSON.stringify({
          subject: "Cannot login to account",
          description: "User reports they cannot login since this morning.",
          email: "customer@example.com",
          status: 2, priority: 2, source: 2,
        }),
      },
      {
        name: "update_ticket",
        displayName: "Update Ticket",
        description: "Update the status, priority, assignee, or other fields of a Freshdesk ticket.",
        method: "PUT" as const,
        path: "/tickets/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "number", required: true, description: "Ticket ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            status: { type: "number", description: "2=Open, 3=Pending, 4=Resolved, 5=Closed" },
            priority: { type: "number", description: "1=Low, 2=Medium, 3=High, 4=Urgent" },
            responder_id: { type: "number", description: "Agent ID to assign ticket to" },
            tags: { type: "array", items: { type: "string" } },
            type: { type: "string" },
          },
        }),
        aiUsageHint: "Update a Freshdesk ticket. Use to change status (4=Resolved), assign to an agent, or update priority.",
        exampleArgs: JSON.stringify({ id: 1234, status: 4 }),
      },
      {
        name: "add_reply",
        displayName: "Add Reply to Ticket",
        description: "Add a public reply to a Freshdesk ticket (visible to requester).",
        method: "POST" as const,
        path: "/tickets/{id}/reply",
        pathParams: JSON.stringify([
          { name: "id", type: "number", required: true, description: "Ticket ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["body"],
          properties: {
            body: { type: "string", description: "Reply body (HTML supported)" },
            cc_emails: { type: "array", items: { type: "string" }, description: "CC email addresses" },
          },
        }),
        aiUsageHint: "Add a public reply to a Freshdesk ticket. The reply is visible to the customer.",
        exampleArgs: JSON.stringify({ id: 1234, body: "Thank you for reaching out. We are looking into this issue." }),
      },
      {
        name: "list_contacts",
        displayName: "List Contacts",
        description: "List customer contacts in Freshdesk. Search by email or name.",
        method: "GET" as const,
        path: "/contacts",
        queryParams: JSON.stringify([
          { name: "email", type: "string", description: "Filter by email address" },
          { name: "mobile", type: "string", description: "Filter by mobile number" },
          { name: "phone", type: "string", description: "Filter by phone number" },
          { name: "page", type: "number", default: 1 },
          { name: "per_page", type: "number", default: 30 },
        ]),
        aiUsageHint: "List Freshdesk contacts. Filter by email to find a specific contact.",
        exampleArgs: JSON.stringify({ email: "customer@example.com" }),
      },
      {
        name: "create_contact",
        displayName: "Create Contact",
        description: "Create a new customer contact in Freshdesk.",
        method: "POST" as const,
        path: "/contacts",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Contact full name" },
            email: { type: "string", description: "Primary email address" },
            phone: { type: "string" },
            mobile: { type: "string" },
            company_id: { type: "number", description: "Associated company ID" },
            job_title: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
          },
        }),
        aiUsageHint: "Create a new Freshdesk contact. Name is required; email is highly recommended.",
        exampleArgs: JSON.stringify({ name: "Jane Doe", email: "jane@example.com", job_title: "CEO" }),
      },
      {
        name: "list_agents",
        displayName: "List Agents",
        description: "List all support agents in the Freshdesk account.",
        method: "GET" as const,
        path: "/agents",
        queryParams: JSON.stringify([
          { name: "email", type: "string", description: "Filter by agent email" },
          { name: "page", type: "number", default: 1 },
        ]),
        aiUsageHint: "List Freshdesk agents. Use to find agent IDs for ticket assignment.",
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
      message: "✅ Freshdesk blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Find API key at: Freshdesk → Profile Settings → Your API Key",
        "2. Users must also provide their subdomain (e.g. 'company' in company.freshdesk.com)",
        "3. No OAuth app registration required",
      ],
    };
  },
});
