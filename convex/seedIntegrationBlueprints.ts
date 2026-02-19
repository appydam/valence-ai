import { internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Seed Google Sheets Blueprint
 */
export const seedGoogleSheets = internalMutation({
  handler: async (ctx) => {
    // Check if already exists
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "google-sheets"))
      .first();

    if (existing) {
      console.log("Google Sheets blueprint already exists, skipping...");
      return { blueprintId: existing._id, created: false };
    }

    const now = Date.now();

    // Create blueprint
    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "google-sheets",
      name: "Google Sheets",
      description: "Create, read, and update spreadsheets in Google Sheets. Manage cells, rows, and formulas for data storage and analysis.",
      category: "Productivity",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "YOUR_GOOGLE_CLIENT_ID",
        clientSecret: "OAUTH_SECRET_GOOGLE",
        authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scopes: [
          "https://www.googleapis.com/auth/spreadsheets",
          "https://www.googleapis.com/auth/drive.file",
        ],
        scopeSeparator: "space",
        extraAuthParams: {
          access_type: "offline",
          prompt: "consent",
        },
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://sheets.googleapis.com",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.google.com/sheets/api/reference/rest",
      iconUrl: "https://www.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    // Create tools individually to avoid TS excessively deep error
    const tools = [
      {
        name: "create_spreadsheet",
        displayName: "Create Spreadsheet",
        description: "Create a new Google Sheets spreadsheet",
        method: "POST" as const,
        path: "/v4/spreadsheets",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            properties: { type: "object", properties: { title: { type: "string" } } },
          },
        }),
        aiUsageHint: "Create a new spreadsheet with the given title",
        exampleArgs: JSON.stringify({ properties: { title: "Sales Report 2026" } }),
      },
      {
        name: "get_spreadsheet",
        displayName: "Get Spreadsheet Metadata",
        description: "Get metadata about a spreadsheet",
        method: "GET" as const,
        path: "/v4/spreadsheets/{spreadsheetId}",
        pathParams: JSON.stringify([
          { name: "spreadsheetId", type: "string", required: true },
        ]),
        aiUsageHint: "Get spreadsheet metadata by ID",
        exampleArgs: JSON.stringify({ spreadsheetId: "abc123" }),
      },
      {
        name: "get_values",
        displayName: "Get Cell Values",
        description: "Read cell values from a range",
        method: "GET" as const,
        path: "/v4/spreadsheets/{spreadsheetId}/values/{range}",
        pathParams: JSON.stringify([
          { name: "spreadsheetId", type: "string", required: true },
          { name: "range", type: "string", required: true, description: "A1 notation (e.g. Sheet1!A1:B10)" },
        ]),
        aiUsageHint: "Read cell values using A1 notation",
        exampleArgs: JSON.stringify({ spreadsheetId: "abc123", range: "Sheet1!A1:C10" }),
      },
      {
        name: "update_values",
        displayName: "Update Cell Values",
        description: "Write cell values to a range",
        method: "PUT" as const,
        path: "/v4/spreadsheets/{spreadsheetId}/values/{range}",
        pathParams: JSON.stringify([
          { name: "spreadsheetId", type: "string", required: true },
          { name: "range", type: "string", required: true },
        ]),
        queryParams: JSON.stringify([
          { name: "valueInputOption", type: "string", default: "USER_ENTERED" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            values: { type: "array", items: { type: "array" } },
          },
        }),
        aiUsageHint: "Update cells with new values",
        exampleArgs: JSON.stringify({ values: [["Header 1", "Header 2"], ["Value 1", "Value 2"]] }),
      },
      {
        name: "append_values",
        displayName: "Append Rows",
        description: "Append rows to a sheet",
        method: "POST" as const,
        path: "/v4/spreadsheets/{spreadsheetId}/values/{range}:append",
        pathParams: JSON.stringify([
          { name: "spreadsheetId", type: "string", required: true },
          { name: "range", type: "string", required: true },
        ]),
        queryParams: JSON.stringify([
          { name: "valueInputOption", type: "string", default: "USER_ENTERED" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            values: { type: "array" },
          },
        }),
        aiUsageHint: "Append new rows to the end of a sheet",
        exampleArgs: JSON.stringify({ values: [["New Row 1", "Data 1"], ["New Row 2", "Data 2"]] }),
      },
      {
        name: "batch_get_values",
        displayName: "Batch Get Values",
        description: "Read multiple ranges at once",
        method: "GET" as const,
        path: "/v4/spreadsheets/{spreadsheetId}/values:batchGet",
        pathParams: JSON.stringify([
          { name: "spreadsheetId", type: "string", required: true },
        ]),
        queryParams: JSON.stringify([
          { name: "ranges", type: "array", description: "Array of A1 ranges" },
        ]),
        aiUsageHint: "Read multiple ranges in one request",
        exampleArgs: JSON.stringify({ spreadsheetId: "abc123", ranges: ["Sheet1!A1:B10", "Sheet2!C1:D5"] }),
      },
      {
        name: "batch_update_values",
        displayName: "Batch Update Values",
        description: "Update multiple ranges at once",
        method: "POST" as const,
        path: "/v4/spreadsheets/{spreadsheetId}/values:batchUpdate",
        pathParams: JSON.stringify([
          { name: "spreadsheetId", type: "string", required: true },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            valueInputOption: { type: "string", default: "USER_ENTERED" },
            data: { type: "array" },
          },
        }),
        aiUsageHint: "Update multiple ranges in one request",
        exampleArgs: JSON.stringify({ valueInputOption: "USER_ENTERED", data: [] }),
      },
      {
        name: "clear_values",
        displayName: "Clear Cell Values",
        description: "Clear values from a range",
        method: "POST" as const,
        path: "/v4/spreadsheets/{spreadsheetId}/values/{range}:clear",
        pathParams: JSON.stringify([
          { name: "spreadsheetId", type: "string", required: true },
          { name: "range", type: "string", required: true },
        ]),
        aiUsageHint: "Clear all values from a range",
        exampleArgs: JSON.stringify({ spreadsheetId: "abc123", range: "Sheet1!A1:Z100" }),
      },
    ];

    for (const tool of tools) {
      await ctx.db.insert("blueprintTools", {
        ...tool,
        blueprintId,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    }

    console.log(`✅ Google Sheets blueprint created with ${tools.length} tools`);
    return { blueprintId, created: true, toolsCreated: tools.length };
  },
});

/**
 * Seed Google Calendar Blueprint
 */
export const seedGoogleCalendar = internalMutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "google-calendar"))
      .first();

    if (existing) {
      console.log("Google Calendar blueprint already exists, skipping...");
      return { blueprintId: existing._id, created: false };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "google-calendar",
      name: "Google Calendar",
      description: "Manage calendar events, check availability, and schedule meetings with Google Calendar.",
      category: "Productivity",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "YOUR_GOOGLE_CLIENT_ID",
        clientSecret: "OAUTH_SECRET_GOOGLE",
        authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scopes: [
          "https://www.googleapis.com/auth/calendar",
          "https://www.googleapis.com/auth/calendar.events",
        ],
        scopeSeparator: "space",
        extraAuthParams: {
          access_type: "offline",
          prompt: "consent",
        },
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://www.googleapis.com/calendar/v3",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.google.com/calendar/api/v3/reference",
      iconUrl: "https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_calendars",
        displayName: "List Calendars",
        description: "List user's calendars",
        method: "GET" as const,
        path: "/users/me/calendarList",
        aiUsageHint: "Get all calendars for the authenticated user",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_events",
        displayName: "List Events",
        description: "List calendar events with optional time range",
        method: "GET" as const,
        path: "/calendars/{calendarId}/events",
        pathParams: JSON.stringify([
          { name: "calendarId", type: "string", required: true, description: "Use 'primary' for main calendar" },
        ]),
        queryParams: JSON.stringify([
          { name: "timeMin", type: "string", description: "RFC3339 timestamp" },
          { name: "timeMax", type: "string", description: "RFC3339 timestamp" },
          { name: "maxResults", type: "number", default: 250 },
        ]),
        aiUsageHint: "List events for a calendar within a time range",
        exampleArgs: JSON.stringify({ calendarId: "primary", maxResults: 10 }),
      },
      {
        name: "get_event",
        displayName: "Get Event",
        description: "Get a specific calendar event",
        method: "GET" as const,
        path: "/calendars/{calendarId}/events/{eventId}",
        pathParams: JSON.stringify([
          { name: "calendarId", type: "string", required: true },
          { name: "eventId", type: "string", required: true },
        ]),
        aiUsageHint: "Fetch details for a specific event",
        exampleArgs: JSON.stringify({ calendarId: "primary", eventId: "abc123" }),
      },
      {
        name: "create_event",
        displayName: "Create Event",
        description: "Create a new calendar event",
        method: "POST" as const,
        path: "/calendars/{calendarId}/events",
        pathParams: JSON.stringify([
          { name: "calendarId", type: "string", required: true },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            summary: { type: "string" },
            start: { type: "object", properties: { dateTime: { type: "string" } } },
            end: { type: "object", properties: { dateTime: { type: "string" } } },
          },
        }),
        aiUsageHint: "Create a new event with start and end times",
        exampleArgs: JSON.stringify({ summary: "Team Meeting", start: { dateTime: "2026-02-20T10:00:00-07:00" }, end: { dateTime: "2026-02-20T11:00:00-07:00" } }),
      },
      {
        name: "update_event",
        displayName: "Update Event",
        description: "Update an existing event",
        method: "PUT" as const,
        path: "/calendars/{calendarId}/events/{eventId}",
        pathParams: JSON.stringify([
          { name: "calendarId", type: "string", required: true },
          { name: "eventId", type: "string", required: true },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            summary: { type: "string" },
            start: { type: "object" },
            end: { type: "object" },
          },
        }),
        aiUsageHint: "Update event details",
        exampleArgs: JSON.stringify({ summary: "Updated Meeting Title" }),
      },
      {
        name: "delete_event",
        displayName: "Delete Event",
        description: "Delete a calendar event",
        method: "DELETE" as const,
        path: "/calendars/{calendarId}/events/{eventId}",
        pathParams: JSON.stringify([
          { name: "calendarId", type: "string", required: true },
          { name: "eventId", type: "string", required: true },
        ]),
        aiUsageHint: "Delete an event from the calendar",
        exampleArgs: JSON.stringify({ calendarId: "primary", eventId: "abc123" }),
      },
      {
        name: "quick_add_event",
        displayName: "Quick Add Event",
        description: "Create event using natural language",
        method: "POST" as const,
        path: "/calendars/{calendarId}/events/quickAdd",
        pathParams: JSON.stringify([
          { name: "calendarId", type: "string", required: true },
        ]),
        queryParams: JSON.stringify([
          { name: "text", type: "string", required: true, description: "Natural language event description" },
        ]),
        aiUsageHint: "Create event with natural language like 'Meeting with Bob tomorrow at 3pm'",
        exampleArgs: JSON.stringify({ calendarId: "primary", text: "Lunch with team tomorrow at noon" }),
      },
      {
        name: "list_free_busy",
        displayName: "Check Free/Busy",
        description: "Check free/busy status for calendars",
        method: "POST" as const,
        path: "/freeBusy",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            timeMin: { type: "string" },
            timeMax: { type: "string" },
            items: { type: "array", items: { type: "object", properties: { id: { type: "string" } } } },
          },
        }),
        aiUsageHint: "Check availability for calendars in a time range",
        exampleArgs: JSON.stringify({ timeMin: "2026-02-20T00:00:00Z", timeMax: "2026-02-20T23:59:59Z", items: [{ id: "primary" }] }),
      },
    ];

    for (const tool of tools) {
      await ctx.db.insert("blueprintTools", {
        ...tool,
        blueprintId,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    }

    console.log(`✅ Google Calendar blueprint created with ${tools.length} tools`);
    return { blueprintId, created: true, toolsCreated: tools.length };
  },
});

/**
 * Seed Gmail Blueprint
 */
export const seedGmail = internalMutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "gmail"))
      .first();

    if (existing) {
      console.log("Gmail blueprint already exists, skipping...");
      return { blueprintId: existing._id, created: false };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "gmail",
      name: "Gmail",
      description: "Send emails, read messages, manage drafts, and organize with labels using Gmail API.",
      category: "Communication",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "YOUR_GOOGLE_CLIENT_ID",
        clientSecret: "OAUTH_SECRET_GOOGLE",
        authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scopes: [
          "https://www.googleapis.com/auth/gmail.modify",
          "https://www.googleapis.com/auth/gmail.send",
        ],
        scopeSeparator: "space",
        extraAuthParams: {
          access_type: "offline",
          prompt: "consent",
        },
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://gmail.googleapis.com",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.google.com/gmail/api/reference/rest",
      iconUrl: "https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_messages",
        displayName: "List Messages",
        description: "List messages with optional search query",
        method: "GET" as const,
        path: "/gmail/v1/users/me/messages",
        queryParams: JSON.stringify([
          { name: "q", type: "string", description: "Gmail search query" },
          { name: "maxResults", type: "number", default: 100 },
        ]),
        aiUsageHint: "List messages, optionally filtered by search query",
        exampleArgs: JSON.stringify({ q: "is:unread", maxResults: 10 }),
      },
      {
        name: "get_message",
        displayName: "Get Message",
        description: "Get full message content including body and headers",
        method: "GET" as const,
        path: "/gmail/v1/users/me/messages/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true },
        ]),
        queryParams: JSON.stringify([
          { name: "format", type: "string", default: "full", description: "full, metadata, minimal, or raw" },
        ]),
        aiUsageHint: "Get message by ID",
        exampleArgs: JSON.stringify({ id: "abc123", format: "full" }),
      },
      {
        name: "send_message",
        displayName: "Send Email",
        description: "Send an email message (base64url-encoded RFC 2822 format)",
        method: "POST" as const,
        path: "/gmail/v1/users/me/messages/send",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            raw: { type: "string", description: "Base64url-encoded email message" },
          },
        }),
        aiUsageHint: "Send email (encode MIME message as base64url)",
        exampleArgs: JSON.stringify({ raw: "BASE64URL_ENCODED_EMAIL" }),
      },
      {
        name: "create_draft",
        displayName: "Create Draft",
        description: "Create a draft email",
        method: "POST" as const,
        path: "/gmail/v1/users/me/drafts",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            message: { type: "object", properties: { raw: { type: "string" } } },
          },
        }),
        aiUsageHint: "Create a draft email",
        exampleArgs: JSON.stringify({ message: { raw: "BASE64URL_ENCODED_EMAIL" } }),
      },
      {
        name: "list_drafts",
        displayName: "List Drafts",
        description: "List all draft emails",
        method: "GET" as const,
        path: "/gmail/v1/users/me/drafts",
        aiUsageHint: "Get all draft emails",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_labels",
        displayName: "List Labels",
        description: "List all Gmail labels",
        method: "GET" as const,
        path: "/gmail/v1/users/me/labels",
        aiUsageHint: "Get all labels (inbox, sent, custom labels, etc.)",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "modify_message",
        displayName: "Modify Message Labels",
        description: "Add or remove labels from a message",
        method: "POST" as const,
        path: "/gmail/v1/users/me/messages/{id}/modify",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            addLabelIds: { type: "array", items: { type: "string" } },
            removeLabelIds: { type: "array", items: { type: "string" } },
          },
        }),
        aiUsageHint: "Add or remove labels from a message",
        exampleArgs: JSON.stringify({ addLabelIds: ["INBOX"], removeLabelIds: ["UNREAD"] }),
      },
      {
        name: "trash_message",
        displayName: "Trash Message",
        description: "Move a message to trash",
        method: "POST" as const,
        path: "/gmail/v1/users/me/messages/{id}/trash",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true },
        ]),
        aiUsageHint: "Move message to trash",
        exampleArgs: JSON.stringify({ id: "abc123" }),
      },
    ];

    for (const tool of tools) {
      await ctx.db.insert("blueprintTools", {
        ...tool,
        blueprintId,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    }

    console.log(`✅ Gmail blueprint created with ${tools.length} tools`);
    return { blueprintId, created: true, toolsCreated: tools.length };
  },
});

/**
 * Seed HubSpot Blueprint
 */
export const seedHubSpot = internalMutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "hubspot"))
      .first();

    const now = Date.now();

    if (existing) {
      console.log("HubSpot blueprint already exists, updating to OAuth...");

      // Update existing blueprint to OAuth
      await ctx.db.patch(existing._id, {
        authType: "oauth2",
        authConfig: JSON.stringify({
          clientId: "e734a798-51cb-49ae-a80e-6f4427b6112f",
          clientSecret: "OAUTH_SECRET_HUBSPOT",
          authorizeUrl: "https://app.hubspot.com/oauth/authorize",
          tokenUrl: "https://api.hubapi.com/oauth/v1/token",
          scopes: [
            "crm.objects.contacts.read",
            "crm.objects.contacts.write",
            "crm.objects.companies.read",
            "crm.objects.companies.write",
            "crm.objects.deals.read",
            "crm.objects.deals.write",
            "crm.schemas.contacts.read",
            "crm.schemas.companies.read",
          ],
          scopeSeparator: "space",
          tokenEndpointAuth: "body",
        }),
        updatedAt: now,
      });

      return { blueprintId: existing._id, created: false, updated: true };
    }

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "hubspot",
      name: "HubSpot CRM",
      description: "Manage contacts, companies, and deals in HubSpot CRM. Track sales pipeline and customer relationships.",
      category: "CRM",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "e734a798-51cb-49ae-a80e-6f4427b6112f",
        clientSecret: "OAUTH_SECRET_HUBSPOT",
        authorizeUrl: "https://app.hubspot.com/oauth/authorize",
        tokenUrl: "https://api.hubapi.com/oauth/v1/token",
        scopes: [
          "crm.objects.contacts.read",
          "crm.objects.contacts.write",
          "crm.objects.companies.read",
          "crm.objects.companies.write",
          "crm.objects.deals.read",
          "crm.objects.deals.write",
          "crm.schemas.contacts.read",
          "crm.schemas.companies.read",
        ],
        scopeSeparator: "space",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://api.hubapi.com",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.hubspot.com/docs/api/overview",
      iconUrl: "https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      // Contacts
      {
        name: "list_contacts",
        displayName: "List Contacts",
        description: "List all contacts in HubSpot CRM",
        method: "GET" as const,
        path: "/crm/v3/objects/contacts",
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 10 },
        ]),
        aiUsageHint: "Get all contacts",
        exampleArgs: JSON.stringify({ limit: 50 }),
      },
      {
        name: "get_contact",
        displayName: "Get Contact",
        description: "Get a specific contact by ID",
        method: "GET" as const,
        path: "/crm/v3/objects/contacts/{contactId}",
        pathParams: JSON.stringify([
          { name: "contactId", type: "string", required: true },
        ]),
        aiUsageHint: "Get contact details by ID",
        exampleArgs: JSON.stringify({ contactId: "12345" }),
      },
      {
        name: "create_contact",
        displayName: "Create Contact",
        description: "Create a new contact in HubSpot",
        method: "POST" as const,
        path: "/crm/v3/objects/contacts",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            properties: {
              type: "object",
              properties: {
                email: { type: "string" },
                firstname: { type: "string" },
                lastname: { type: "string" },
              },
            },
          },
        }),
        aiUsageHint: "Create a new contact",
        exampleArgs: JSON.stringify({ properties: { email: "john@example.com", firstname: "John", lastname: "Doe" } }),
      },
      {
        name: "update_contact",
        displayName: "Update Contact",
        description: "Update an existing contact",
        method: "PATCH" as const,
        path: "/crm/v3/objects/contacts/{contactId}",
        pathParams: JSON.stringify([
          { name: "contactId", type: "string", required: true },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            properties: { type: "object" },
          },
        }),
        aiUsageHint: "Update contact properties",
        exampleArgs: JSON.stringify({ contactId: "12345", properties: { phone: "+1234567890" } }),
      },
      {
        name: "search_contacts",
        displayName: "Search Contacts",
        description: "Search contacts by property values",
        method: "POST" as const,
        path: "/crm/v3/objects/contacts/search",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            filterGroups: { type: "array" },
            limit: { type: "number", default: 10 },
          },
        }),
        aiUsageHint: "Search contacts by filters",
        exampleArgs: JSON.stringify({ filterGroups: [], limit: 10 }),
      },
      // Companies
      {
        name: "list_companies",
        displayName: "List Companies",
        description: "List all companies in HubSpot CRM",
        method: "GET" as const,
        path: "/crm/v3/objects/companies",
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 10 },
        ]),
        aiUsageHint: "Get all companies",
        exampleArgs: JSON.stringify({ limit: 50 }),
      },
      {
        name: "get_company",
        displayName: "Get Company",
        description: "Get a specific company by ID",
        method: "GET" as const,
        path: "/crm/v3/objects/companies/{companyId}",
        pathParams: JSON.stringify([
          { name: "companyId", type: "string", required: true },
        ]),
        aiUsageHint: "Get company details by ID",
        exampleArgs: JSON.stringify({ companyId: "67890" }),
      },
      {
        name: "create_company",
        displayName: "Create Company",
        description: "Create a new company in HubSpot",
        method: "POST" as const,
        path: "/crm/v3/objects/companies",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            properties: {
              type: "object",
              properties: {
                name: { type: "string" },
                domain: { type: "string" },
              },
            },
          },
        }),
        aiUsageHint: "Create a new company",
        exampleArgs: JSON.stringify({ properties: { name: "Acme Corp", domain: "acme.com" } }),
      },
      {
        name: "update_company",
        displayName: "Update Company",
        description: "Update an existing company",
        method: "PATCH" as const,
        path: "/crm/v3/objects/companies/{companyId}",
        pathParams: JSON.stringify([
          { name: "companyId", type: "string", required: true },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            properties: { type: "object" },
          },
        }),
        aiUsageHint: "Update company properties",
        exampleArgs: JSON.stringify({ companyId: "67890", properties: { industry: "Technology" } }),
      },
      {
        name: "search_companies",
        displayName: "Search Companies",
        description: "Search companies by property values",
        method: "POST" as const,
        path: "/crm/v3/objects/companies/search",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            filterGroups: { type: "array" },
            limit: { type: "number", default: 10 },
          },
        }),
        aiUsageHint: "Search companies by filters",
        exampleArgs: JSON.stringify({ filterGroups: [], limit: 10 }),
      },
      // Deals
      {
        name: "list_deals",
        displayName: "List Deals",
        description: "List all deals in HubSpot CRM",
        method: "GET" as const,
        path: "/crm/v3/objects/deals",
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 10 },
        ]),
        aiUsageHint: "Get all deals",
        exampleArgs: JSON.stringify({ limit: 50 }),
      },
      {
        name: "get_deal",
        displayName: "Get Deal",
        description: "Get a specific deal by ID",
        method: "GET" as const,
        path: "/crm/v3/objects/deals/{dealId}",
        pathParams: JSON.stringify([
          { name: "dealId", type: "string", required: true },
        ]),
        aiUsageHint: "Get deal details by ID",
        exampleArgs: JSON.stringify({ dealId: "111222" }),
      },
      {
        name: "create_deal",
        displayName: "Create Deal",
        description: "Create a new deal in HubSpot",
        method: "POST" as const,
        path: "/crm/v3/objects/deals",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            properties: {
              type: "object",
              properties: {
                dealname: { type: "string" },
                amount: { type: "string" },
              },
            },
          },
        }),
        aiUsageHint: "Create a new deal",
        exampleArgs: JSON.stringify({ properties: { dealname: "New Enterprise Deal", amount: "50000" } }),
      },
      {
        name: "update_deal",
        displayName: "Update Deal",
        description: "Update an existing deal",
        method: "PATCH" as const,
        path: "/crm/v3/objects/deals/{dealId}",
        pathParams: JSON.stringify([
          { name: "dealId", type: "string", required: true },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            properties: { type: "object" },
          },
        }),
        aiUsageHint: "Update deal properties",
        exampleArgs: JSON.stringify({ dealId: "111222", properties: { dealstage: "closedwon" } }),
      },
      {
        name: "search_deals",
        displayName: "Search Deals",
        description: "Search deals by property values",
        method: "POST" as const,
        path: "/crm/v3/objects/deals/search",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            filterGroups: { type: "array" },
            limit: { type: "number", default: 10 },
          },
        }),
        aiUsageHint: "Search deals by filters",
        exampleArgs: JSON.stringify({ filterGroups: [], limit: 10 }),
      },
    ];

    for (const tool of tools) {
      await ctx.db.insert("blueprintTools", {
        ...tool,
        blueprintId,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    }

    console.log(`✅ HubSpot blueprint created with ${tools.length} tools`);
    return { blueprintId, created: true, toolsCreated: tools.length };
  },
});

/**
 * Run all seeds
 */
export const seedAll = internalAction({
  handler: async (ctx) => {
    const results = [];

    const sheets = await ctx.runMutation(internal.seedIntegrationBlueprints.seedGoogleSheets);
    results.push({ service: "Google Sheets", ...sheets });

    const calendar = await ctx.runMutation(internal.seedIntegrationBlueprints.seedGoogleCalendar);
    results.push({ service: "Google Calendar", ...calendar });

    const gmail = await ctx.runMutation(internal.seedIntegrationBlueprints.seedGmail);
    results.push({ service: "Gmail", ...gmail });

    const hubspot = await ctx.runMutation(internal.seedIntegrationBlueprints.seedHubSpot);
    results.push({ service: "HubSpot", ...hubspot });

    return {
      message: "✅ Integration blueprints seed complete",
      results,
      totalCreated: results.filter((r) => r.created).length,
    };
  },
});
