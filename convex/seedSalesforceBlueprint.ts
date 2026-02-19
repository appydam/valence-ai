/**
 * Seed Salesforce CRM integration blueprint
 * Run this once to create the Salesforce blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedSalesforceBlueprint -> Run
 *
 * Prerequisites:
 * 1. Create a Connected App in Salesforce Setup → App Manager → New Connected App
 *    - Enable OAuth Settings
 *    - Callback URL: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback
 *    - Scopes: api, refresh_token, offline_access
 * 2. Set in Convex env vars:
 *    - SALESFORCE_CLIENT_ID = Consumer Key from Connected App
 *    - OAUTH_SECRET_SALESFORCE = Consumer Secret from Connected App
 *
 * IMPORTANT: Salesforce returns an instance_url after OAuth (e.g. https://mycompany.salesforce.com).
 * All API calls must use that instance URL. Agents should store and reuse it from
 * the OAuth token response. The baseUrl below is for the auth flow only.
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "salesforce"))
      .first();

    if (existing) {
      return {
        message: "Salesforce blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "salesforce",
      name: "Salesforce",
      description:
        "Sync contacts, leads, opportunities, and accounts with Salesforce CRM. Query records with SOQL, create and update any Salesforce object, and automate your sales pipeline.",
      category: "CRM",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId:
          process.env.SALESFORCE_CLIENT_ID || "YOUR_SALESFORCE_CLIENT_ID",
        clientSecret: "OAUTH_SECRET_SALESFORCE",
        authorizeUrl:
          "https://login.salesforce.com/services/oauth2/authorize",
        tokenUrl: "https://login.salesforce.com/services/oauth2/token",
        scopes: ["api", "refresh_token", "offline_access"],
        scopeSeparator: "space",
        extraAuthParams: {
          response_type: "code",
        },
        tokenEndpointAuth: "body",
      }),
      // Base URL is the auth server. Actual API calls use instance_url from the token response.
      // Agents must use the {instanceUrl} path param populated from stored credentials.
      baseUrl: "https://login.salesforce.com",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl:
        "https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_what_is_rest_api.htm",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/salesforce-2.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    // NOTE: Salesforce API paths use {instanceUrl} which is returned as part of the
    // OAuth token response (e.g. https://mycompany.salesforce.com). The execution engine
    // resolves this from the stored encrypted credentials at runtime.
    // API version: v59.0 (Spring '23) — stable LTS version.
    const tools = [
      {
        name: "query_records",
        displayName: "Query Records (SOQL)",
        description:
          "Execute a SOQL query to retrieve Salesforce records. Use this to find contacts, leads, opportunities, accounts, or any custom object. Supports filtering, ordering, and limiting.",
        method: "GET" as const,
        path: "{instanceUrl}/services/data/v59.0/query",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description:
              "Salesforce instance URL from OAuth (e.g. https://mycompany.salesforce.com). Retrieved from stored credentials.",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "q",
            type: "string",
            required: true,
            description:
              "SOQL query string. Example: SELECT Id, Name, Email FROM Contact WHERE Email LIKE '%@example.com' LIMIT 10",
          },
        ]),
        aiUsageHint:
          "Use SOQL to query any Salesforce object. Common examples: 'SELECT Id, Name, Email FROM Contact WHERE LastModifiedDate = TODAY', 'SELECT Id, Name, StageName, Amount FROM Opportunity WHERE StageName = \\'Negotiation\\' ORDER BY Amount DESC LIMIT 20', 'SELECT Id, Name FROM Account WHERE Type = \\'Customer\\''",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.salesforce.com",
          q: "SELECT Id, FirstName, LastName, Email, Phone FROM Contact WHERE LastModifiedDate = LAST_N_DAYS:7 LIMIT 50",
        }),
      },
      {
        name: "create_record",
        displayName: "Create Record",
        description:
          "Create a new Salesforce record of any object type: Contact, Lead, Opportunity, Account, Task, Case, or any custom object.",
        method: "POST" as const,
        path: "{instanceUrl}/services/data/v59.0/sobjects/{objectType}",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Salesforce instance URL from OAuth",
          },
          {
            name: "objectType",
            type: "string",
            required: true,
            description:
              "Salesforce object API name: Contact, Lead, Opportunity, Account, Task, Case, etc.",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          description:
            "Fields for the new record. Field names are Salesforce API names. Common fields by object: Contact (FirstName, LastName, Email, Phone, AccountId), Lead (FirstName, LastName, Email, Company, Status), Opportunity (Name, StageName, CloseDate, Amount, AccountId), Account (Name, Type, Industry, Website), Task (Subject, WhoId, WhatId, ActivityDate, Status, Priority)",
          properties: {
            FirstName: { type: "string" },
            LastName: { type: "string" },
            Email: { type: "string" },
            Phone: { type: "string" },
            Name: { type: "string" },
            Subject: { type: "string" },
          },
        }),
        aiUsageHint:
          "Create any Salesforce record. Always use Salesforce API field names (camelCase with capitals). For Opportunities: StageName must be an existing stage value. CloseDate format: YYYY-MM-DD.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.salesforce.com",
          objectType: "Contact",
          FirstName: "Jane",
          LastName: "Smith",
          Email: "jane.smith@acme.com",
          Phone: "+1 (415) 555-0123",
          Title: "VP of Engineering",
        }),
      },
      {
        name: "get_record",
        displayName: "Get Record by ID",
        description:
          "Retrieve a specific Salesforce record by its ID. Returns all fields by default.",
        method: "GET" as const,
        path: "{instanceUrl}/services/data/v59.0/sobjects/{objectType}/{id}",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Salesforce instance URL from OAuth",
          },
          {
            name: "objectType",
            type: "string",
            required: true,
            description: "Salesforce object type (Contact, Lead, Opportunity, Account, etc.)",
          },
          {
            name: "id",
            type: "string",
            required: true,
            description: "18-character Salesforce record ID",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "fields",
            type: "string",
            description:
              "Comma-separated field names to return (optional, returns all if omitted)",
          },
        ]),
        aiUsageHint:
          "Fetch a Salesforce record by its 18-char ID. Use fields param to limit response size.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.salesforce.com",
          objectType: "Opportunity",
          id: "006Dn000003YkVhIAK",
          fields: "Id,Name,StageName,Amount,CloseDate,AccountId",
        }),
      },
      {
        name: "update_record",
        displayName: "Update Record",
        description:
          "Update fields on an existing Salesforce record. Only include fields you want to change.",
        method: "PATCH" as const,
        path: "{instanceUrl}/services/data/v59.0/sobjects/{objectType}/{id}",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Salesforce instance URL from OAuth",
          },
          {
            name: "objectType",
            type: "string",
            required: true,
            description: "Salesforce object type",
          },
          {
            name: "id",
            type: "string",
            required: true,
            description: "18-character Salesforce record ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          description:
            "Fields to update. Only include fields to change. Example for closing a deal: {StageName: 'Closed Won', CloseDate: '2026-03-31'}",
        }),
        aiUsageHint:
          "Update Salesforce record fields. Use PATCH — only send fields to change. Returns 204 No Content on success.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.salesforce.com",
          objectType: "Opportunity",
          id: "006Dn000003YkVhIAK",
          StageName: "Negotiation/Review",
          Amount: 75000,
          NextStep: "Send revised proposal by Friday",
        }),
      },
      {
        name: "search_records",
        displayName: "Search Records (SOSL)",
        description:
          "Full-text search across multiple Salesforce objects using SOSL (Salesforce Object Search Language). Better than SOQL when you have a search term but don't know which object it belongs to.",
        method: "GET" as const,
        path: "{instanceUrl}/services/data/v59.0/search",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Salesforce instance URL from OAuth",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "q",
            type: "string",
            required: true,
            description:
              "SOSL query. Example: FIND {Acme Corp} IN ALL FIELDS RETURNING Account(Id, Name), Contact(Id, FirstName, LastName, Email)",
          },
        ]),
        aiUsageHint:
          "Use SOSL for full-text search when you have a keyword. Example: FIND {john smith} IN NAME FIELDS RETURNING Contact(Id, FirstName, LastName, Email)",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.salesforce.com",
          q: "FIND {Acme} IN ALL FIELDS RETURNING Account(Id, Name, Type), Contact(Id, FirstName, LastName, Email) LIMIT 10",
        }),
      },
      {
        name: "get_object_fields",
        displayName: "Describe Object Fields",
        description:
          "Get the full schema of a Salesforce object — all field names, types, picklist values, and relationships. Use this to know what fields are available before creating or querying records.",
        method: "GET" as const,
        path: "{instanceUrl}/services/data/v59.0/sobjects/{objectType}/describe",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Salesforce instance URL from OAuth",
          },
          {
            name: "objectType",
            type: "string",
            required: true,
            description: "Salesforce object type to describe",
          },
        ]),
        aiUsageHint:
          "Call this to discover available fields and picklist values for any Salesforce object before creating records.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.salesforce.com",
          objectType: "Opportunity",
        }),
      },
      {
        name: "create_task",
        displayName: "Create Task",
        description:
          "Create a Salesforce Task (follow-up action) linked to a Contact or Lead (WhoId) and/or an Opportunity or Account (WhatId).",
        method: "POST" as const,
        path: "{instanceUrl}/services/data/v59.0/sobjects/Task",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Salesforce instance URL from OAuth",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["Subject"],
          properties: {
            Subject: {
              type: "string",
              description: "Task subject/title",
            },
            WhoId: {
              type: "string",
              description: "Contact or Lead ID to link this task to",
            },
            WhatId: {
              type: "string",
              description: "Opportunity, Account, or Case ID to link this task to",
            },
            ActivityDate: {
              type: "string",
              description: "Due date in YYYY-MM-DD format",
            },
            Status: {
              type: "string",
              description: "Not Started, In Progress, Completed, Waiting on someone else, Deferred",
            },
            Priority: {
              type: "string",
              description: "High, Normal, Low",
            },
            Description: {
              type: "string",
              description: "Task notes/description",
            },
            OwnerId: {
              type: "string",
              description: "User ID to assign the task to",
            },
          },
        }),
        aiUsageHint:
          "Create a follow-up task for a rep. Link to contact via WhoId and opportunity via WhatId. ActivityDate is the due date.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.salesforce.com",
          Subject: "Follow up on pricing proposal",
          WhoId: "003Dn000003YkVhIAK",
          WhatId: "006Dn000003YkVhIAK",
          ActivityDate: "2026-02-28",
          Status: "Not Started",
          Priority: "High",
          Description: "Customer asked for revised pricing. Send updated deck.",
        }),
      },
      {
        name: "list_objects",
        displayName: "List Available Objects",
        description:
          "List all Salesforce objects (standard and custom) available in the org. Use this to discover what data is available.",
        method: "GET" as const,
        path: "{instanceUrl}/services/data/v59.0/sobjects",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Salesforce instance URL from OAuth",
          },
        ]),
        aiUsageHint:
          "List all available Salesforce objects in the org. Useful for discovering custom objects.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.salesforce.com",
        }),
      },
      {
        name: "delete_record",
        displayName: "Delete Record",
        description: "Permanently delete a Salesforce record by ID. Use with caution.",
        method: "DELETE" as const,
        path: "{instanceUrl}/services/data/v59.0/sobjects/{objectType}/{id}",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Salesforce instance URL from OAuth",
          },
          {
            name: "objectType",
            type: "string",
            required: true,
            description: "Salesforce object type",
          },
          {
            name: "id",
            type: "string",
            required: true,
            description: "18-character Salesforce record ID to delete",
          },
        ]),
        aiUsageHint:
          "Delete a Salesforce record. Returns 204 No Content on success. This is permanent — confirm before deleting.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.salesforce.com",
          objectType: "Lead",
          id: "00QDn000003YkVhIAK",
        }),
      },
      {
        name: "get_user_info",
        displayName: "Get Current User Info",
        description:
          "Get information about the currently authenticated Salesforce user (name, email, userId, orgId).",
        method: "GET" as const,
        path: "{instanceUrl}/services/data/v59.0/chatter/users/me",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Salesforce instance URL from OAuth",
          },
        ]),
        aiUsageHint:
          "Get the authenticated user's Salesforce profile. Returns userId and orgId for use in other API calls.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.salesforce.com",
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
      message: "✅ Salesforce blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. In Salesforce Setup → App Manager → New Connected App",
        "2. Enable OAuth Settings, set callback URL: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "3. Add scopes: api, refresh_token, offline_access",
        "4. Set SALESFORCE_CLIENT_ID in Convex env vars (Consumer Key)",
        "5. Set OAUTH_SECRET_SALESFORCE in Convex env vars (Consumer Secret)",
        "6. Note: Customers need Enterprise+ Salesforce edition for API access",
      ],
    };
  },
});
