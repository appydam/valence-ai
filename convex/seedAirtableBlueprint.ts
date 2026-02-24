/**
 * Seed Airtable integration blueprint
 * Run this once to create the Airtable blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedAirtableBlueprint -> Run
 *
 * Prerequisites:
 * - No OAuth app needed. Airtable uses Personal Access Tokens (PATs).
 * - Users generate their PAT at: https://airtable.com/create/tokens
 * - Required scopes when creating PAT: data.records:read, data.records:write, schema.bases:read
 * - No env vars required — users paste their token at connection time.
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "airtable"))
      .first();

    if (existing) {
      return {
        message: "Airtable blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "airtable",
      name: "Airtable",
      description:
        "Flexible database and spreadsheet platform. Read and write records across bases and tables, manage data, and build workflows.",
      category: "productivity",
      version: 1,
      status: "active",
      authType: "bearer_token",
      authConfig: JSON.stringify({
        apiKeyLocation: "header",
        apiKeyHeader: "Authorization",
        apiKeyPrefix: "Bearer",
      }),
      // baseUrl omits /v0 so both /meta and /v0 paths can coexist
      baseUrl: "https://api.airtable.com",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://airtable.com/developers/web/api/introduction",
      iconUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Airtable_Logo.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_bases",
        displayName: "List Bases",
        description:
          "List all Airtable bases (databases) the user has access to. Returns base IDs needed for all other calls.",
        method: "GET" as const,
        path: "/v0/meta/bases",
        queryParams: JSON.stringify([
          {
            name: "offset",
            type: "string",
            description: "Pagination offset token from previous response",
          },
        ]),
        aiUsageHint:
          "Call this first to get the list of Airtable bases and their IDs. The baseId is required for all record and table operations.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_tables",
        displayName: "List Tables in Base",
        description:
          "List all tables within a specific Airtable base, including their field schemas.",
        method: "GET" as const,
        path: "/v0/meta/bases/{baseId}/tables",
        pathParams: JSON.stringify([
          {
            name: "baseId",
            type: "string",
            required: true,
            description: "Airtable base ID (starts with 'app', e.g. appABC123)",
          },
        ]),
        aiUsageHint:
          "List tables in an Airtable base to find table names and their field schemas before reading or writing records.",
        exampleArgs: JSON.stringify({ baseId: "appABC123xyz" }),
      },
      {
        name: "list_records",
        displayName: "List Records",
        description:
          "List records from an Airtable table. Supports filtering with formulas, sorting, and field selection.",
        method: "GET" as const,
        path: "/v0/{baseId}/{tableId}",
        pathParams: JSON.stringify([
          {
            name: "baseId",
            type: "string",
            required: true,
            description: "Airtable base ID (e.g. appABC123)",
          },
          {
            name: "tableId",
            type: "string",
            required: true,
            description: "Table ID or name (e.g. tblXYZ789 or 'Tasks')",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "filterByFormula",
            type: "string",
            description:
              "Airtable formula to filter records. Examples: {Status}='Done', AND({Priority}='High',{Assignee}='Alice')",
          },
          {
            name: "maxRecords",
            type: "number",
            description: "Maximum records to return",
            default: 100,
          },
          {
            name: "sort[0][field]",
            type: "string",
            description: "Field name to sort by",
          },
          {
            name: "sort[0][direction]",
            type: "string",
            description: "Sort direction: asc or desc",
            default: "asc",
          },
          {
            name: "fields[]",
            type: "string",
            description: "Comma-separated field names to include in response",
          },
          {
            name: "view",
            type: "string",
            description: "View name or ID to use for filtering/sorting",
          },
          {
            name: "offset",
            type: "string",
            description: "Pagination offset token from previous response",
          },
        ]),
        aiUsageHint:
          "List records from an Airtable table. Use filterByFormula to filter (e.g. {Status}='Active'). Use fields[] to limit returned fields. Paginate with offset token.",
        exampleArgs: JSON.stringify({
          baseId: "appABC123xyz",
          tableId: "Tasks",
          filterByFormula: "{Status}='In Progress'",
          maxRecords: 50,
          "sort[0][field]": "Due Date",
          "sort[0][direction]": "asc",
        }),
      },
      {
        name: "get_record",
        displayName: "Get Record",
        description:
          "Get a single record from an Airtable table by its record ID.",
        method: "GET" as const,
        path: "/v0/{baseId}/{tableId}/{recordId}",
        pathParams: JSON.stringify([
          {
            name: "baseId",
            type: "string",
            required: true,
            description: "Airtable base ID",
          },
          {
            name: "tableId",
            type: "string",
            required: true,
            description: "Table ID or name",
          },
          {
            name: "recordId",
            type: "string",
            required: true,
            description: "Record ID (starts with 'rec', e.g. recXYZ789)",
          },
        ]),
        aiUsageHint:
          "Fetch a specific Airtable record by its ID. Record IDs start with 'rec'.",
        exampleArgs: JSON.stringify({
          baseId: "appABC123xyz",
          tableId: "Tasks",
          recordId: "recXYZ789abc",
        }),
      },
      {
        name: "create_record",
        displayName: "Create Record",
        description:
          "Create a new record in an Airtable table. Provide field values as key-value pairs.",
        method: "POST" as const,
        path: "/v0/{baseId}/{tableId}",
        pathParams: JSON.stringify([
          {
            name: "baseId",
            type: "string",
            required: true,
            description: "Airtable base ID",
          },
          {
            name: "tableId",
            type: "string",
            required: true,
            description: "Table ID or name",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["fields"],
          properties: {
            fields: {
              type: "object",
              description:
                "Record fields as key-value pairs. Keys are field names. Values depend on field type: text (string), number (number), checkbox (boolean), select (string), multiselect (array of strings), date (ISO string).",
            },
            typecast: {
              type: "boolean",
              description:
                "If true, Airtable will attempt to convert string values to the correct type automatically",
              default: false,
            },
          },
        }),
        aiUsageHint:
          "Create an Airtable record. Field names must match exactly. Use list_tables to get the schema first. Use typecast=true to auto-convert values.",
        exampleArgs: JSON.stringify({
          baseId: "appABC123xyz",
          tableId: "Tasks",
          fields: {
            Name: "Launch product page",
            Status: "Todo",
            Priority: "High",
            "Due Date": "2026-03-01",
            Assignee: "Alice",
          },
        }),
      },
      {
        name: "update_record",
        displayName: "Update Record",
        description:
          "Update fields on an existing Airtable record. Only provided fields are updated (PATCH).",
        method: "PATCH" as const,
        path: "/v0/{baseId}/{tableId}/{recordId}",
        pathParams: JSON.stringify([
          {
            name: "baseId",
            type: "string",
            required: true,
            description: "Airtable base ID",
          },
          {
            name: "tableId",
            type: "string",
            required: true,
            description: "Table ID or name",
          },
          {
            name: "recordId",
            type: "string",
            required: true,
            description: "Record ID to update (starts with 'rec')",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["fields"],
          properties: {
            fields: {
              type: "object",
              description: "Fields to update. Only provided fields are changed.",
            },
            typecast: {
              type: "boolean",
              description: "Auto-convert string values to correct types",
              default: false,
            },
          },
        }),
        aiUsageHint:
          "Update specific fields on an Airtable record. Only fields you include are changed — other fields are preserved.",
        exampleArgs: JSON.stringify({
          baseId: "appABC123xyz",
          tableId: "Tasks",
          recordId: "recXYZ789abc",
          fields: {
            Status: "Done",
            "Completed At": "2026-02-24",
          },
        }),
      },
      {
        name: "delete_record",
        displayName: "Delete Record",
        description: "Permanently delete a record from an Airtable table.",
        method: "DELETE" as const,
        path: "/v0/{baseId}/{tableId}/{recordId}",
        pathParams: JSON.stringify([
          {
            name: "baseId",
            type: "string",
            required: true,
            description: "Airtable base ID",
          },
          {
            name: "tableId",
            type: "string",
            required: true,
            description: "Table ID or name",
          },
          {
            name: "recordId",
            type: "string",
            required: true,
            description: "Record ID to delete (starts with 'rec')",
          },
        ]),
        aiUsageHint:
          "Permanently delete an Airtable record. This cannot be undone. Confirm with the user before deleting.",
        exampleArgs: JSON.stringify({
          baseId: "appABC123xyz",
          tableId: "Tasks",
          recordId: "recXYZ789abc",
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
      message: "✅ Airtable blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. No OAuth app registration required.",
        "2. Generate a Personal Access Token at: https://airtable.com/create/tokens",
        "3. Required scopes: data.records:read, data.records:write, schema.bases:read",
        "4. Run this seed mutation from the Convex dashboard",
        "5. Test by clicking Connect on the Airtable card and pasting your PAT",
      ],
    };
  },
});
