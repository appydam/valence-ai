/**
 * Seed Salesloft Blueprint
 *
 * Salesloft is a sales engagement platform for managing cadences, people, and accounts.
 * Auth: OAuth 2.0 — requires SALESLOFT_CLIENT_ID and OAUTH_SECRET_SALESLOFT env vars.
 * OAuth app: https://developers.salesloft.com/docs/platform/api-basics/oauth-authentication/
 * API docs: https://developers.salesloft.com/docs/platform/
 *
 * Usage:
 * npx convex run seedSalesloftBlueprint:seedSalesloft --url https://beloved-squirrel-599.convex.cloud
 */

import { mutation } from "./_generated/server";

export const seedSalesloft = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "salesloft"))
      .first();

    if (existing) {
      return { message: "Salesloft blueprint already exists", blueprintId: existing._id };
    }

    const authConfig = {
      clientId: process.env.SALESLOFT_CLIENT_ID ?? "",
      clientSecret: "OAUTH_SECRET_SALESLOFT",
      authorizeUrl: "https://accounts.salesloft.com/oauth/authorize",
      tokenUrl: "https://accounts.salesloft.com/oauth/token",
      scopes: ["read", "write"],
      scopeSeparator: "space",
      tokenEndpointAuth: "body",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "salesloft",
      name: "Salesloft",
      description:
        "Sales engagement platform for managing cadences, people, and accounts. Add people to cadences, track calls and emails, and manage your sales pipeline.",
      category: "Sales",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://api.salesloft.com/v2",
      defaultHeaders: JSON.stringify({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.salesloft.com/docs/platform/",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/salesloft.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_people",
        displayName: "List People",
        description:
          "List people (contacts) in Salesloft. Filter by email or name. Returns person details including email, name, title, company, and cadence membership.",
        method: "GET" as const,
        path: "/people.json",
        queryParams: JSON.stringify([
          {
            name: "q[email_address]",
            type: "string",
            required: false,
            description: "Filter people by exact email address",
          },
          {
            name: "q[full_name]",
            type: "string",
            required: false,
            description: "Filter people by full name (partial match)",
          },
          {
            name: "q[company_name]",
            type: "string",
            required: false,
            description: "Filter people by company name",
          },
          {
            name: "per_page",
            type: "number",
            required: false,
            description: "Results per page (default 25, max 100)",
          },
          {
            name: "page",
            type: "number",
            required: false,
            description: "Page number for pagination",
          },
        ]),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Search for existing contacts in Salesloft before creating duplicates. Filter by email to check if a person exists. Returns id, email_address, first_name, last_name, title, company_name. Use the id for add_person_to_cadence.",
        exampleArgs: JSON.stringify({ "q[email_address]": "john.doe@example.com" }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "create_person",
        displayName: "Create Person",
        description:
          "Create a new person (contact) in Salesloft with name, email, title, and company. Required before adding someone to a cadence.",
        method: "POST" as const,
        path: "/people.json",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["email_address"],
          properties: {
            email_address: { type: "string", description: "Primary email address (required)" },
            first_name: { type: "string", description: "First name" },
            last_name: { type: "string", description: "Last name" },
            title: { type: "string", description: "Job title" },
            company_name: { type: "string", description: "Company name" },
            phone: { type: "string", description: "Phone number" },
            linkedin_url: { type: "string", description: "LinkedIn profile URL" },
            city: { type: "string", description: "City" },
            state: { type: "string", description: "State/province" },
            country: { type: "string", description: "Country" },
          },
        }),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Create a new contact in Salesloft. Email is required. Returns the created person with its ID needed for add_person_to_cadence. Check list_people first to avoid duplicates.",
        exampleArgs: JSON.stringify({
          email_address: "john.doe@example.com",
          first_name: "John",
          last_name: "Doe",
          title: "VP of Engineering",
          company_name: "Acme Corp",
        }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "update_person",
        displayName: "Update Person",
        description:
          "Update an existing person's details in Salesloft — name, title, email, company, or any other field.",
        method: "PUT" as const,
        path: "/people/{id}.json",
        pathParams: JSON.stringify([
          { name: "id", type: "number", required: true, description: "Person ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            first_name: { type: "string" },
            last_name: { type: "string" },
            email_address: { type: "string" },
            title: { type: "string" },
            company_name: { type: "string" },
            phone: { type: "string" },
            linkedin_url: { type: "string" },
          },
        }),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Update a contact's information in Salesloft. Pass the person ID as a path param and only the fields to change in the body.",
        exampleArgs: JSON.stringify({ id: 12345, title: "CTO" }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "list_cadences",
        displayName: "List Cadences",
        description:
          "List available cadences (email/call sequences) in Salesloft. Returns cadence names and IDs needed to add people.",
        method: "GET" as const,
        path: "/cadences.json",
        queryParams: JSON.stringify([
          {
            name: "q[name]",
            type: "string",
            required: false,
            description: "Filter cadences by name (partial match)",
          },
          {
            name: "per_page",
            type: "number",
            required: false,
            description: "Results per page (default 25)",
          },
        ]),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "List available cadences to find the right one for a prospect. Returns cadence IDs and names. Use the cadence ID with add_person_to_cadence.",
        exampleArgs: JSON.stringify({ per_page: 25 }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "add_person_to_cadence",
        displayName: "Add Person to Cadence",
        description:
          "Enroll a person into a Salesloft cadence. Requires person ID and cadence ID. The person will start receiving cadence steps (emails, calls, tasks).",
        method: "POST" as const,
        path: "/cadence_memberships.json",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["person_id", "cadence_id"],
          properties: {
            person_id: { type: "number", description: "Person ID to enroll" },
            cadence_id: { type: "number", description: "Cadence ID to enroll into" },
            user_id: {
              type: "number",
              description: "User ID to assign (defaults to authenticated user)",
            },
          },
        }),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Enroll a contact into a cadence. First use list_people to get the person ID, list_cadences to get the cadence ID, then call this. The authenticated user is used as the sender if user_id is omitted.",
        exampleArgs: JSON.stringify({ person_id: 12345, cadence_id: 67 }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "list_actions",
        displayName: "List Actions",
        description:
          "List pending actions (scheduled emails, calls, tasks) in Salesloft. Shows what needs to be done and for which people.",
        method: "GET" as const,
        path: "/actions.json",
        queryParams: JSON.stringify([
          {
            name: "q[action_status]",
            type: "string",
            required: false,
            description: "Filter by status: 'pending', 'scheduled', 'completed'",
          },
          {
            name: "q[due_on]",
            type: "string",
            required: false,
            description: "Filter by due date (YYYY-MM-DD)",
          },
          {
            name: "per_page",
            type: "number",
            required: false,
            description: "Results per page (default 25)",
          },
        ]),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Check what sales actions are pending — scheduled emails, calls, or tasks. Filter by status 'pending' to see what needs to be done today.",
        exampleArgs: JSON.stringify({ "q[action_status]": "pending", per_page: 25 }),
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

    console.log(`✅ Salesloft blueprint created with ${tools.length} tools`);
    return { blueprintId, created: true };
  },
});
