import { internalMutation } from "./_generated/server";

/**
 * Seed Apollo.io Blueprint
 * Apollo.io - Sales intelligence: find emails, LinkedIn URLs, company data
 * Auth: API key via X-Api-Key header
 * Free tier: 50 req/min, 600/day
 */
export const seedApollo = internalMutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "apollo"))
      .first();

    if (existing) {
      // Add account_info tool if missing
      const existingTool = await ctx.db
        .query("blueprintTools")
        .withIndex("by_blueprint_name", (q) =>
          q.eq("blueprintId", existing._id).eq("name", "account_info")
        )
        .first();

      if (!existingTool) {
        await ctx.db.insert("blueprintTools", {
          blueprintId: existing._id,
          name: "account_info",
          displayName: "Account Info",
          description:
            "Check Apollo.io connection health and login status. No parameters required. Used to verify the API key is valid.",
          method: "GET" as const,
          path: "/auth/health",
          aiUsageHint:
            "Check that Apollo.io API key is valid and connection is healthy. Returns {healthy: true, is_logged_in: true} on success.",
          exampleArgs: JSON.stringify({}),
          status: "active" as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        console.log("Added account_info tool to existing Apollo blueprint.");
      } else {
        // Fix the path if it was wrong
        await ctx.db.patch(existingTool._id, {
          path: "/auth/health",
          description: "Check Apollo.io connection health and login status. No parameters required. Used to verify the API key is valid.",
          aiUsageHint: "Check that Apollo.io API key is valid and connection is healthy. Returns {healthy: true, is_logged_in: true} on success.",
          updatedAt: Date.now(),
        });
        console.log("Updated account_info tool path to /auth/health.");
      }

      console.log("Apollo.io blueprint already exists.");
      return { blueprintId: existing._id, created: false };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "apollo",
      name: "Apollo.io",
      description:
        "Sales intelligence platform. Find verified email addresses, LinkedIn profile URLs, job titles, and company data for any professional. 200M+ contacts database.",
      category: "Sales",
      version: 1,
      status: "active",
      authType: "api_key",
      authConfig: JSON.stringify({
        keyName: "APOLLO_API_KEY",
        headerName: "X-Api-Key",
      }),
      baseUrl: "https://api.apollo.io/api/v1",
      defaultHeaders: JSON.stringify({
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      }),
      iconUrl: "https://www.apollo.io/favicon.ico",
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://docs.apollo.io/reference/introduction",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "people_enrich",
        displayName: "Find Person (Enrich)",
        description:
          "Find email address and LinkedIn URL for a specific person by name + company domain. Returns verified email, LinkedIn URL, job title, and company info. This is the primary tool for individual contact lookup.",
        method: "POST" as const,
        path: "/people/match",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            first_name: { type: "string", description: "First name of the person" },
            last_name: { type: "string", description: "Last name of the person" },
            name: { type: "string", description: "Full name (alternative to first_name + last_name)" },
            domain: { type: "string", description: "Company domain, e.g. stripe.com (NOT full URL)" },
            email: { type: "string", description: "Email address if already known (for enrichment)" },
            linkedin_url: { type: "string", description: "LinkedIn URL if already known" },
            reveal_personal_emails: { type: "boolean", description: "Set true to also return personal emails" },
          },
        }),
        responseMapping: JSON.stringify({ dataField: "person" }),
        aiUsageHint:
          "PRIMARY tool for finding a person's email + LinkedIn. Pass first_name, last_name, domain. Returns: email (verified), linkedin_url (real URL, not guessed), title, organization. Use this before any outreach task. Domain must be just the domain (e.g. panteracapital.com), not a full URL.",
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
        name: "people_search",
        displayName: "Search People",
        description:
          "Search Apollo's 200M+ contact database by name, company, title, location, or industry. Returns emails, LinkedIn URLs, and full contact profiles. Use when you need to find decision-makers at a company.",
        method: "POST" as const,
        path: "/contacts/search",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            q_organization_domains: {
              type: "array",
              items: { type: "string" },
              description: "Array of company domains to search within, e.g. ['stripe.com']",
            },
            q_keywords: { type: "string", description: "Keyword search across name, title, company" },
            person_titles: {
              type: "array",
              items: { type: "string" },
              description: "Filter by job titles, e.g. ['CEO', 'CTO', 'Head of Sales']",
            },
            contact_email_status: {
              type: "array",
              items: { type: "string" },
              description: "Filter by email status: ['verified', 'guessed', 'unavailable']",
            },
            page: { type: "number", description: "Page number (default 1)" },
            per_page: { type: "number", description: "Results per page (default 25, max 100)" },
          },
        }),
        responseMapping: JSON.stringify({ dataField: "contacts" }),
        aiUsageHint:
          "Use this to find decision-makers at a company when you don't know specific names. Pass q_organization_domains: ['company.com'] and person_titles: ['CEO', 'CTO'] to find executives. Returns email, linkedin_url, title for each result. Great for the sales lead research tasks.",
        exampleArgs: JSON.stringify({
          q_organization_domains: ["panteracapital.com"],
          person_titles: ["Partner", "Managing Partner", "General Partner"],
          per_page: 10,
        }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "organization_enrich",
        displayName: "Enrich Company",
        description:
          "Get detailed company information by domain: employee count, industry, funding, technology stack, LinkedIn URL, phone number.",
        method: "GET" as const,
        path: "/organizations/enrich",
        queryParams: JSON.stringify([
          {
            name: "domain",
            type: "string",
            required: true,
            description: "Company domain, e.g. stripe.com",
          },
        ]),
        responseMapping: JSON.stringify({ dataField: "organization" }),
        aiUsageHint:
          "Use this to enrich a company record — get employee count, funding stage, industry, HQ location, and company LinkedIn URL. Pass just the domain (e.g. stripe.com). Useful for qualifying leads before outreach.",
        exampleArgs: JSON.stringify({
          domain: "panteracapital.com",
        }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "people_bulk_enrich",
        displayName: "Bulk Enrich People",
        description:
          "Enrich up to 10 people in a single API call. Pass an array of {first_name, last_name, domain} objects. More efficient than calling people_enrich 10 times.",
        method: "POST" as const,
        path: "/people/bulk_match",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            details: {
              type: "array",
              description: "Array of up to 10 person objects",
              items: {
                type: "object",
                properties: {
                  first_name: { type: "string" },
                  last_name: { type: "string" },
                  domain: { type: "string" },
                  email: { type: "string" },
                },
              },
            },
            reveal_personal_emails: { type: "boolean" },
          },
        }),
        responseMapping: JSON.stringify({ dataField: "matches" }),
        aiUsageHint:
          "Use this when you have a list of 2-10 people to enrich at once. Pass details: [{first_name, last_name, domain}, ...]. More credit-efficient than individual lookups. Returns array with email + linkedin_url per person.",
        exampleArgs: JSON.stringify({
          details: [
            { first_name: "Dennis", last_name: "Chou", domain: "panteracapital.com" },
            { first_name: "Joey", last_name: "Krug", domain: "panteracapital.com" },
          ],
        }),
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "account_info",
        displayName: "Account Info",
        description:
          "Check Apollo.io API usage stats — credits used, credits remaining, and rate limit status. No parameters required.",
        method: "GET" as const,
        path: "/auth/health",
        aiUsageHint:
          "Check remaining Apollo.io API credits before running a large batch of contact lookups. No parameters needed.",
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

    console.log(`✅ Apollo.io blueprint created with ${tools.length} tools`);
    return { blueprintId, created: true };
  },
});
