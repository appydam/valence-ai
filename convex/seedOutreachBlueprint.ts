/**
 * Seed Outreach.io Blueprint
 *
 * Outreach is a sales engagement platform for managing prospects, sequences, and tasks.
 * Auth: OAuth 2.0 — requires OUTREACH_CLIENT_ID and OAUTH_SECRET_OUTREACH env vars.
 * OAuth app: https://developers.outreach.io/api/oauth/
 * API docs: https://api.outreach.io/api/v2/schema.json
 *
 * Usage:
 * npx convex run seedOutreachBlueprint:seedOutreach --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { mutation } from "./_generated/server";

export const seedOutreach = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "outreach"))
      .first();

    if (existing) {
      return { message: "Outreach blueprint already exists", blueprintId: existing._id };
    }

    const authConfig = {
      clientId: process.env.OUTREACH_CLIENT_ID ?? "",
      clientSecret: "OAUTH_SECRET_OUTREACH",
      authorizeUrl: "https://api.outreach.io/oauth/authorize",
      tokenUrl: "https://api.outreach.io/oauth/token",
      scopes: [
        "prospects.read",
        "prospects.write",
        "sequences.read",
        "sequences.write",
        "tasks.read",
        "tasks.write",
        "mailboxes.read",
      ],
      scopeSeparator: "space",
      tokenEndpointAuth: "body",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "outreach",
      name: "Outreach",
      description:
        "Sales engagement platform for managing prospects, sequences, and tasks. Add prospects, enroll them in sequences, and track outreach activities.",
      category: "Sales",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://api.outreach.io/api/v2",
      defaultHeaders: JSON.stringify({
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.outreach.io/api/",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/outreach-1.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_prospects",
        displayName: "List Prospects",
        description:
          "List prospects in Outreach. Filter by email, name, or account. Returns prospect details including email, name, title, and sequence enrollment status.",
        method: "GET" as const,
        path: "/prospects",
        queryParams: JSON.stringify([
          {
            name: "filter[emails]",
            type: "string",
            required: false,
            description: "Filter prospects by email address",
          },
          {
            name: "filter[name]",
            type: "string",
            required: false,
            description: "Filter prospects by name",
          },
          {
            name: "filter[accountId]",
            type: "number",
            required: false,
            description: "Filter prospects by account ID",
          },
          {
            name: "page[size]",
            type: "number",
            required: false,
            description: "Number of results per page (default 50, max 1000)",
          },
          {
            name: "page[number]",
            type: "number",
            required: false,
            description: "Page number for pagination",
          },
        ]),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Search for existing prospects in Outreach before creating a duplicate. Filter by email to check if a prospect exists. Returns id, firstName, lastName, emails, title, and account info.",
        exampleArgs: JSON.stringify({ "filter[emails]": "john.doe@example.com" }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "create_prospect",
        displayName: "Create Prospect",
        description:
          "Create a new prospect in Outreach with name, email, title, and optional account. Required before enrolling someone in a sequence.",
        method: "POST" as const,
        path: "/prospects",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  description: "Must be 'prospect'",
                  enum: ["prospect"],
                },
                attributes: {
                  type: "object",
                  properties: {
                    firstName: { type: "string", description: "First name of the prospect" },
                    lastName: { type: "string", description: "Last name of the prospect" },
                    emails: {
                      type: "array",
                      items: { type: "string" },
                      description: "Array of email addresses",
                    },
                    title: { type: "string", description: "Job title" },
                    company: { type: "string", description: "Company name" },
                    phones: {
                      type: "array",
                      items: { type: "string" },
                      description: "Array of phone numbers",
                    },
                    linkedInUrl: { type: "string", description: "LinkedIn profile URL" },
                  },
                },
              },
            },
          },
        }),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Create a prospect before adding them to an Outreach sequence. Wrap all fields under data.attributes. The data.type must be 'prospect'. Returns the created prospect with its ID needed for add_prospect_to_sequence.",
        exampleArgs: JSON.stringify({
          data: {
            type: "prospect",
            attributes: {
              firstName: "John",
              lastName: "Doe",
              emails: ["john.doe@example.com"],
              title: "VP of Engineering",
              company: "Acme Corp",
            },
          },
        }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "update_prospect",
        displayName: "Update Prospect",
        description:
          "Update an existing prospect's details in Outreach — name, title, emails, or any other attribute.",
        method: "PATCH" as const,
        path: "/prospects/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "number", required: true, description: "Prospect ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["prospect"] },
                id: { type: "number", description: "Prospect ID" },
                attributes: {
                  type: "object",
                  properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    title: { type: "string" },
                    emails: { type: "array", items: { type: "string" } },
                    phones: { type: "array", items: { type: "string" } },
                    linkedInUrl: { type: "string" },
                  },
                },
              },
            },
          },
        }),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Update prospect fields like title, email, or LinkedIn URL. Pass the prospect ID as a path param and updated fields under data.attributes.",
        exampleArgs: JSON.stringify({
          id: 12345,
          data: {
            type: "prospect",
            id: 12345,
            attributes: { title: "CTO" },
          },
        }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "list_sequences",
        displayName: "List Sequences",
        description:
          "List available sequences (email drip campaigns) in Outreach. Returns sequence names and IDs needed to enroll prospects.",
        method: "GET" as const,
        path: "/sequences",
        queryParams: JSON.stringify([
          {
            name: "filter[name]",
            type: "string",
            required: false,
            description: "Filter sequences by name",
          },
          {
            name: "page[size]",
            type: "number",
            required: false,
            description: "Number of results (default 50)",
          },
        ]),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "List available email sequences to find the right one to enroll a prospect into. Returns sequence IDs and names. Use the sequence ID with add_prospect_to_sequence.",
        exampleArgs: JSON.stringify({ "page[size]": 25 }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "add_prospect_to_sequence",
        displayName: "Add Prospect to Sequence",
        description:
          "Enroll a prospect into an Outreach email sequence. Requires prospect ID, sequence ID, and mailbox ID. The prospect will start receiving sequence emails.",
        method: "POST" as const,
        path: "/sequenceStates",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["sequenceState"] },
                relationships: {
                  type: "object",
                  properties: {
                    prospect: {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            type: { type: "string", enum: ["prospect"] },
                            id: { type: "number", description: "Prospect ID" },
                          },
                        },
                      },
                    },
                    sequence: {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            type: { type: "string", enum: ["sequence"] },
                            id: { type: "number", description: "Sequence ID" },
                          },
                        },
                      },
                    },
                    mailbox: {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            type: { type: "string", enum: ["mailbox"] },
                            id: { type: "number", description: "Mailbox ID to send from" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Enroll a prospect into an email sequence. First use list_prospects to get the prospect ID, list_sequences to get the sequence ID, then use this tool. Mailbox ID can be obtained from the Outreach settings or list_mailboxes if available.",
        exampleArgs: JSON.stringify({
          data: {
            type: "sequenceState",
            relationships: {
              prospect: { data: { type: "prospect", id: 12345 } },
              sequence: { data: { type: "sequence", id: 67 } },
              mailbox: { data: { type: "mailbox", id: 1 } },
            },
          },
        }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "list_tasks",
        displayName: "List Tasks",
        description:
          "List tasks in Outreach — follow-up calls, emails, or LinkedIn messages due or overdue. Filter by state (incomplete, complete) or due date.",
        method: "GET" as const,
        path: "/tasks",
        queryParams: JSON.stringify([
          {
            name: "filter[state]",
            type: "string",
            required: false,
            description: "Filter by task state: 'incomplete' or 'complete'",
          },
          {
            name: "filter[dueAt]",
            type: "string",
            required: false,
            description: "Filter by due date (ISO 8601 format)",
          },
          {
            name: "page[size]",
            type: "number",
            required: false,
            description: "Number of results (default 50)",
          },
        ]),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Check pending or overdue sales tasks — follow-up calls, emails, LinkedIn touches. Filter by state: 'incomplete' for open tasks. Returns task type, due date, and linked prospect.",
        exampleArgs: JSON.stringify({ "filter[state]": "incomplete", "page[size]": 25 }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const tool of tools) {
      await ctx.db.insert("blueprintTools", {
        blueprintId,
        ...tool,
      });
    }

    console.log(`✅ Outreach blueprint created with ${tools.length} tools`);
    return { blueprintId, created: true };
  },
});
