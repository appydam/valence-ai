import { internalMutation } from "./_generated/server";

/**
 * Seed Hunter.io Blueprint
 * Hunter.io - Email finder and verifier for professional outreach
 * Auth: API key (passed as query param api_key=...)
 * Free tier: 25 requests/month, no credit card required
 */
export const seedHunter = internalMutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "hunter"))
      .first();

    if (existing) {
      // Update authConfig to use correct queryParam field
      await ctx.db.patch(existing._id, {
        authConfig: JSON.stringify({
          keyName: "HUNTER_API_KEY",
          queryParam: "api_key",
        }),
        updatedAt: Date.now(),
      });
      console.log("Hunter.io blueprint updated with corrected authConfig.");
      return { blueprintId: existing._id, created: false, updated: true };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "hunter",
      name: "Hunter.io",
      description:
        "Find and verify professional email addresses. Given a person's name and company domain, Hunter.io returns verified email addresses with confidence scores.",
      category: "Sales",
      version: 1,
      status: "active",
      authType: "api_key",
      authConfig: JSON.stringify({
        keyName: "HUNTER_API_KEY",
        queryParam: "api_key",
      }),
      baseUrl: "https://api.hunter.io/v2",
      defaultHeaders: JSON.stringify({ Accept: "application/json" }),
      iconUrl: "https://hunter.io/favicon-32x32.png",
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://hunter.io/api-documentation",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "find_email",
        displayName: "Find Email",
        description:
          "Find the email address of a professional given their first name, last name, and company domain. Returns verified email with confidence score.",
        method: "GET" as const,
        path: "/email-finder",
        queryParams: JSON.stringify([
          {
            name: "first_name",
            type: "string",
            required: true,
            description: "First name of the person",
          },
          {
            name: "last_name",
            type: "string",
            required: true,
            description: "Last name of the person",
          },
          {
            name: "domain",
            type: "string",
            required: true,
            description:
              "Company domain (e.g. panteracapital.com, not the full URL)",
          },
        ]),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Use this to find a verified email for a specific person at a company. Pass first_name, last_name, domain. Returns email + confidence score (0-100). Score above 70 is reliable.",
        exampleArgs: JSON.stringify({
          first_name: "Dennis",
          last_name: "Chou",
          domain: "panteracapital.com",
        }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "domain_search",
        displayName: "Domain Search",
        description:
          "Find all email addresses associated with a company domain. Useful for finding the right contact when you don't know the person's name.",
        method: "GET" as const,
        path: "/domain-search",
        queryParams: JSON.stringify([
          {
            name: "domain",
            type: "string",
            required: true,
            description: "Company domain to search (e.g. stripe.com)",
          },
          {
            name: "limit",
            type: "integer",
            required: false,
            description: "Max results to return (default 10, max 100)",
          },
          {
            name: "type",
            type: "string",
            required: false,
            description:
              "Filter by personal (firstname.lastname) or generic (info@, contact@) emails",
          },
        ]),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Use this to find all emails at a company domain when you don't have a specific person in mind. Returns list of emails with names, positions, and confidence scores.",
        exampleArgs: JSON.stringify({
          domain: "panteracapital.com",
          limit: 10,
          type: "personal",
        }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "verify_email",
        displayName: "Verify Email",
        description:
          "Verify whether a specific email address is valid and deliverable. Returns status: valid/invalid/accept_all/unknown.",
        method: "GET" as const,
        path: "/email-verifier",
        queryParams: JSON.stringify([
          {
            name: "email",
            type: "string",
            required: true,
            description: "Email address to verify",
          },
        ]),
        responseMapping: JSON.stringify({ dataField: "data" }),
        aiUsageHint:
          "Use this to verify a specific email address before sending. Returns status (valid/invalid) and score. Only send emails with status=valid or accept_all.",
        exampleArgs: JSON.stringify({ email: "dennis@panteracapital.com" }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "account_info",
        displayName: "Account Info",
        description:
          "Check Hunter.io API usage — how many requests remain in free tier.",
        method: "GET" as const,
        path: "/account",
        aiUsageHint:
          "Check remaining Hunter.io API credits before running a large batch of email lookups.",
        exampleArgs: JSON.stringify({}),
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

    console.log(`✅ Hunter.io blueprint created with ${tools.length} tools`);
    return { blueprintId, created: true };
  },
});
