/**
 * Seed Intercom integration blueprint
 * Run this once to create the Intercom blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedIntercomBlueprint -> Run
 *
 * Prerequisites:
 * 1. Create a developer app at https://developers.intercom.com/
 *    - Go to Your Apps → New App
 *    - Add callback URL: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback
 *    - Set required permissions in Authentication tab
 * 2. Submit for review if building a public app (for multi-workspace OAuth)
 * 3. Set in Convex env vars:
 *    - INTERCOM_CLIENT_ID = client_id from your Intercom app
 *    - OAUTH_SECRET_INTERCOM = client_secret from your Intercom app
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "intercom"))
      .first();

    if (existing) {
      return {
        message: "Intercom blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "intercom",
      name: "Intercom",
      description:
        "Manage customer conversations, tickets, and contacts in Intercom. Reply to conversations, triage support tickets, create contacts, and capture internal notes for your team.",
      category: "support",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId:
          process.env.INTERCOM_CLIENT_ID || "YOUR_INTERCOM_CLIENT_ID",
        clientSecret: "OAUTH_SECRET_INTERCOM",
        authorizeUrl: "https://app.intercom.com/oauth",
        tokenUrl: "https://api.intercom.io/auth/eagle/token",
        // Intercom does not use scopes in the OAuth authorize URL.
        // Permissions are configured in the Intercom developer hub app settings.
        scopes: [],
        scopeSeparator: "space",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://api.intercom.io",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
        "Intercom-Version": "2.11",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.intercom.com/docs/references/rest-api/",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/intercom-1.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_conversations",
        displayName: "List Conversations",
        description:
          "List customer conversations from Intercom. Filter by open/closed status, assigned admin, or team. Returns conversation previews with last message and contact info.",
        method: "GET" as const,
        path: "/conversations",
        queryParams: JSON.stringify([
          {
            name: "open",
            type: "boolean",
            description: "Filter by open (true) or closed (false) conversations",
          },
          {
            name: "assigned_to",
            type: "number",
            description: "Filter by admin ID (numeric) the conversation is assigned to",
          },
          {
            name: "page",
            type: "number",
            default: 1,
            description: "Page number",
          },
          {
            name: "per_page",
            type: "number",
            default: 20,
            description: "Results per page (max 150)",
          },
          {
            name: "sort",
            type: "string",
            default: "updated_at",
            description: "Sort by: created_at or updated_at",
          },
          {
            name: "order",
            type: "string",
            default: "desc",
            description: "Sort order: asc or desc",
          },
        ]),
        aiUsageHint:
          "List Intercom conversations. Use open=true for active conversations, open=false for resolved. Filter by assigned_to with admin ID to get a specific agent's queue.",
        exampleArgs: JSON.stringify({
          open: true,
          per_page: 25,
          sort: "updated_at",
          order: "desc",
        }),
      },
      {
        name: "get_conversation",
        displayName: "Get Conversation",
        description:
          "Get the full details of a specific Intercom conversation including all messages, notes, assignee, tags, and contact information.",
        method: "GET" as const,
        path: "/conversations/{id}",
        pathParams: JSON.stringify([
          {
            name: "id",
            type: "string",
            required: true,
            description: "Intercom conversation ID (numeric string)",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "display_as",
            type: "string",
            default: "plaintext",
            description: "Format for message body: plaintext or html",
          },
        ]),
        aiUsageHint:
          "Fetch a full conversation by ID including all messages and notes. Use display_as=plaintext for easier parsing.",
        exampleArgs: JSON.stringify({ id: "123456789", display_as: "plaintext" }),
      },
      {
        name: "reply_conversation",
        displayName: "Reply to Conversation",
        description:
          "Send a reply to a customer conversation as an admin. Supports plain text messages. The reply will appear in the customer's Intercom messenger.",
        method: "POST" as const,
        path: "/conversations/{id}/reply",
        pathParams: JSON.stringify([
          {
            name: "id",
            type: "string",
            required: true,
            description: "Intercom conversation ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["message_type", "type", "body"],
          properties: {
            message_type: {
              type: "string",
              description: "Must be 'comment' for customer-facing replies",
              enum: ["comment"],
            },
            type: {
              type: "string",
              description: "Must be 'admin' to reply as an admin",
              enum: ["admin"],
            },
            admin_id: {
              type: "string",
              description: "Admin ID sending the reply. Required for admin replies.",
            },
            body: {
              type: "string",
              description: "Reply message body. Supports HTML.",
            },
            attachment_urls: {
              type: "array",
              items: { type: "string" },
              description: "Optional list of attachment URLs to include",
            },
          },
        }),
        aiUsageHint:
          "Reply to a customer conversation. Always set message_type='comment' and type='admin'. Include admin_id of the replying admin.",
        exampleArgs: JSON.stringify({
          id: "123456789",
          message_type: "comment",
          type: "admin",
          admin_id: "987654",
          body: "Hi! Thanks for reaching out. I've looked into this and the issue was caused by a caching problem on our end. It should be resolved now — please try again and let me know if you still see the issue.",
        }),
      },
      {
        name: "add_note",
        displayName: "Add Internal Note",
        description:
          "Add an internal note to a conversation that is only visible to your team, not the customer. Useful for leaving context, investigation findings, or handoff notes.",
        method: "POST" as const,
        path: "/conversations/{id}/reply",
        pathParams: JSON.stringify([
          {
            name: "id",
            type: "string",
            required: true,
            description: "Intercom conversation ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["message_type", "type", "body"],
          properties: {
            message_type: {
              type: "string",
              description: "Must be 'note' for internal notes",
              enum: ["note"],
            },
            type: {
              type: "string",
              description: "Must be 'admin'",
              enum: ["admin"],
            },
            admin_id: {
              type: "string",
              description: "Admin ID adding the note",
            },
            body: {
              type: "string",
              description: "Note body. Supports HTML.",
            },
          },
        }),
        aiUsageHint:
          "Add an internal note to a conversation (not visible to customers). Set message_type='note'. Great for documenting investigation findings or tagging teammates.",
        exampleArgs: JSON.stringify({
          id: "123456789",
          message_type: "note",
          type: "admin",
          admin_id: "987654",
          body: "Checked the logs — error originated from payment service timeout at 14:32 UTC. Engineering ticket created: ENG-456. Customer should be unblocked after the next deploy.",
        }),
      },
      {
        name: "assign_conversation",
        displayName: "Assign Conversation",
        description:
          "Assign a conversation to a specific admin or team. Use this to route tickets to the right person.",
        method: "POST" as const,
        path: "/conversations/{id}/parts",
        pathParams: JSON.stringify([
          {
            name: "id",
            type: "string",
            required: true,
            description: "Intercom conversation ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["message_type", "type"],
          properties: {
            message_type: {
              type: "string",
              enum: ["assignment"],
              description: "Must be 'assignment'",
            },
            type: {
              type: "string",
              enum: ["admin"],
              description: "Must be 'admin'",
            },
            admin_id: {
              type: "string",
              description: "Admin ID performing the assignment",
            },
            assignee_id: {
              type: "string",
              description: "Admin ID to assign the conversation to",
            },
          },
        }),
        aiUsageHint:
          "Assign a conversation to an admin. Set message_type='assignment', provide admin_id (who is doing the assigning) and assignee_id (who to assign to).",
        exampleArgs: JSON.stringify({
          id: "123456789",
          message_type: "assignment",
          type: "admin",
          admin_id: "987654",
          assignee_id: "111222",
        }),
      },
      {
        name: "close_conversation",
        displayName: "Close Conversation",
        description: "Close/resolve a customer conversation.",
        method: "POST" as const,
        path: "/conversations/{id}/parts",
        pathParams: JSON.stringify([
          {
            name: "id",
            type: "string",
            required: true,
            description: "Intercom conversation ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["message_type", "type"],
          properties: {
            message_type: {
              type: "string",
              enum: ["close"],
              description: "Must be 'close'",
            },
            type: {
              type: "string",
              enum: ["admin"],
              description: "Must be 'admin'",
            },
            admin_id: {
              type: "string",
              description: "Admin ID closing the conversation",
            },
          },
        }),
        aiUsageHint:
          "Close/resolve a conversation. Set message_type='close'. The customer will see the conversation as resolved.",
        exampleArgs: JSON.stringify({
          id: "123456789",
          message_type: "close",
          type: "admin",
          admin_id: "987654",
        }),
      },
      {
        name: "search_contacts",
        displayName: "Search Contacts",
        description:
          "Search for Intercom contacts (users/leads) by email, name, or custom attributes using filter operators.",
        method: "POST" as const,
        path: "/contacts/search",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["query"],
          properties: {
            query: {
              type: "object",
              description:
                "Filter query. Use operator='AND'/'OR' with field, operator, value. Common fields: email, name, phone, role (user/lead), created_at",
              properties: {
                operator: {
                  type: "string",
                  enum: ["AND", "OR"],
                },
                value: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      field: { type: "string" },
                      operator: {
                        type: "string",
                        description: "=, !=, IN, NIN, <, >, ~, !~, ^, $",
                      },
                      value: { type: "string" },
                    },
                  },
                },
              },
            },
            pagination: {
              type: "object",
              properties: {
                per_page: { type: "number", default: 20 },
                starting_after: {
                  type: "string",
                  description: "Cursor for pagination",
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Search contacts by email, name, or custom fields. Example: query={operator:'AND',value:[{field:'email',operator:'=',value:'user@example.com'}]}",
        exampleArgs: JSON.stringify({
          query: {
            operator: "AND",
            value: [
              {
                field: "email",
                operator: "=",
                value: "jane@acme.com",
              },
            ],
          },
          pagination: { per_page: 10 },
        }),
      },
      {
        name: "create_contact",
        displayName: "Create Contact",
        description:
          "Create a new contact (user or lead) in Intercom. Use role='user' for signed-up customers, 'lead' for prospects.",
        method: "POST" as const,
        path: "/contacts",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["role"],
          properties: {
            role: {
              type: "string",
              enum: ["user", "lead"],
              description: "user = registered customer, lead = prospect/visitor",
            },
            email: { type: "string", description: "Contact email address" },
            name: { type: "string", description: "Full name" },
            phone: { type: "string", description: "Phone number" },
            external_id: {
              type: "string",
              description: "Your internal user ID for this contact",
            },
            custom_attributes: {
              type: "object",
              description: "Custom attribute key-value pairs defined in your Intercom workspace",
            },
            avatar: {
              type: "object",
              properties: { url: { type: "string" } },
              description: "Avatar image URL",
            },
          },
        }),
        aiUsageHint:
          "Create a new Intercom contact. Use role='lead' for new prospects, role='user' for signed-up customers. Set external_id to your internal user ID for deduplication.",
        exampleArgs: JSON.stringify({
          role: "lead",
          email: "prospect@targetcompany.com",
          name: "Bob Johnson",
          phone: "+1 (650) 555-0456",
          external_id: "usr_bob_johnson_001",
          custom_attributes: {
            company_size: "50-200",
            plan_interest: "Enterprise",
          },
        }),
      },
      {
        name: "get_contact",
        displayName: "Get Contact",
        description: "Get full details of an Intercom contact by their Intercom ID.",
        method: "GET" as const,
        path: "/contacts/{id}",
        pathParams: JSON.stringify([
          {
            name: "id",
            type: "string",
            required: true,
            description: "Intercom contact ID",
          },
        ]),
        aiUsageHint:
          "Fetch a contact's full profile by Intercom ID. Returns all attributes, custom data, and tags.",
        exampleArgs: JSON.stringify({ id: "5ba682d23d7cf92bef87bfd4" }),
      },
      {
        name: "update_contact",
        displayName: "Update Contact",
        description:
          "Update an existing Intercom contact's fields — name, email, phone, custom attributes, etc.",
        method: "PUT" as const,
        path: "/contacts/{id}",
        pathParams: JSON.stringify([
          {
            name: "id",
            type: "string",
            required: true,
            description: "Intercom contact ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            custom_attributes: {
              type: "object",
              description: "Custom attribute key-value pairs to update",
            },
          },
        }),
        aiUsageHint:
          "Update contact fields. Only include fields to change. Custom attributes need to exist in your Intercom workspace settings first.",
        exampleArgs: JSON.stringify({
          id: "5ba682d23d7cf92bef87bfd4",
          name: "Bob Johnson",
          custom_attributes: {
            health_score: "at_risk",
            churn_risk_flagged_at: "2026-02-19",
          },
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
      message: "✅ Intercom blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Create a developer app at https://app.intercom.com/a/developer-signup",
        "2. In your app settings → Authentication → Add redirect URL:",
        "   https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "3. Set permissions: Read/Write Conversations, Read/Write Contacts",
        "4. Set INTERCOM_CLIENT_ID in Convex env vars (client_id from app settings)",
        "5. Set OAUTH_SECRET_INTERCOM in Convex env vars (client_secret from app settings)",
        "6. For public (multi-workspace) OAuth, submit app for Intercom review",
        "7. Run this seed mutation from the Convex dashboard",
      ],
    };
  },
});
