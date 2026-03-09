/**
 * Seed Xero integration blueprint
 * Run this once to create the Xero blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedXeroBlueprint -> Run
 *
 * Prerequisites:
 * - Create an OAuth2 app at https://developer.xero.com/app/manage
 * - Set OAUTH_SECRET_XERO env var in Convex dashboard
 * - Note: Xero requires Xero-tenant-id header for all requests (obtained post-OAuth via /connections)
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "xero"))
      .first();

    if (existing) {
      return {
        message: "Xero blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "xero",
      name: "Xero",
      description:
        "Cloud accounting software. Manage contacts, invoices, payments, accounts, and generate financial reports like Profit & Loss and Balance Sheet.",
      category: "finance",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "",
        clientSecret: "OAUTH_SECRET_XERO",
        authorizeUrl: "https://login.xero.com/identity/connect/authorize",
        tokenUrl: "https://identity.xero.com/connect/token",
        scopes: [
          "openid",
          "profile",
          "email",
          "accounting.transactions",
          "accounting.contacts",
          "accounting.reports.read",
          "offline_access",
        ],
        scopeSeparator: "space",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://api.xero.com/api.xro/2.0",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developer.xero.com/documentation/api/accounting/overview",
      iconUrl: "https://cdn.simpleicons.org/xero/13B5EA",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_organisations",
        displayName: "List Organisations",
        description: "List all Xero organisations the user has connected. Returns tenant IDs needed for all other API calls.",
        method: "GET" as const,
        path: "/connections",
        aiUsageHint: "List connected Xero organisations. Call this first to get tenantId needed for all other Xero API calls. Use tenantId as Xero-tenant-id header.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_contacts",
        displayName: "List Contacts",
        description: "List customers and suppliers in Xero.",
        method: "GET" as const,
        path: "/Contacts",
        queryParams: JSON.stringify([
          { name: "where", type: "string", description: "Filter expression, e.g. IsSupplier==true or Name==\"Acme\"" },
          { name: "order", type: "string", description: "Sort field, e.g. Name ASC" },
          { name: "page", type: "number", description: "Page number (100 per page)", default: 1 },
          { name: "summaryOnly", type: "boolean", description: "Return summary fields only", default: false },
        ]),
        aiUsageHint: "List Xero contacts (customers and suppliers). Filter with where: IsCustomer==true for customers, IsSupplier==true for suppliers.",
        exampleArgs: JSON.stringify({ where: "IsCustomer==true", page: 1 }),
      },
      {
        name: "get_contact",
        displayName: "Get Contact",
        description: "Get details of a specific Xero contact by ID.",
        method: "GET" as const,
        path: "/Contacts/{ContactID}",
        pathParams: JSON.stringify([
          { name: "ContactID", type: "string", required: true, description: "Xero Contact GUID" },
        ]),
        aiUsageHint: "Fetch a specific Xero contact by their ID.",
        exampleArgs: JSON.stringify({ ContactID: "CONTACT_GUID" }),
      },
      {
        name: "create_contact",
        displayName: "Create Contact",
        description: "Create a new customer or supplier contact in Xero.",
        method: "POST" as const,
        path: "/Contacts",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["Contacts"],
          properties: {
            Contacts: {
              type: "array",
              items: {
                type: "object",
                required: ["Name"],
                properties: {
                  Name: { type: "string", description: "Contact name (must be unique)" },
                  FirstName: { type: "string" },
                  LastName: { type: "string" },
                  EmailAddress: { type: "string" },
                  IsCustomer: { type: "boolean", default: true },
                  IsSupplier: { type: "boolean", default: false },
                  Phones: { type: "array", items: { type: "object", properties: { PhoneType: { type: "string" }, PhoneNumber: { type: "string" } } } },
                  Addresses: { type: "array", items: { type: "object", properties: { AddressType: { type: "string" }, City: { type: "string" }, Country: { type: "string" } } } },
                },
              },
            },
          },
        }),
        aiUsageHint: "Create a Xero contact. Wrap in Contacts array. Name must be unique. Set IsCustomer=true for customers.",
        exampleArgs: JSON.stringify({ Contacts: [{ Name: "Acme Corp", EmailAddress: "billing@acme.com", IsCustomer: true }] }),
      },
      {
        name: "list_invoices",
        displayName: "List Invoices",
        description: "List invoices in Xero. Filter by status, contact, or date.",
        method: "GET" as const,
        path: "/Invoices",
        queryParams: JSON.stringify([
          { name: "where", type: "string", description: "Filter: Status==\"AUTHORISED\" for approved, Status==\"PAID\" for paid" },
          { name: "order", type: "string", description: "Sort, e.g. Date DESC" },
          { name: "page", type: "number", default: 1 },
          { name: "Statuses", type: "string", description: "Comma-separated statuses: DRAFT,SUBMITTED,AUTHORISED,PAID,VOIDED" },
        ]),
        aiUsageHint: "List Xero invoices. Use Statuses=AUTHORISED for outstanding invoices, Statuses=PAID for paid ones.",
        exampleArgs: JSON.stringify({ Statuses: "AUTHORISED", page: 1 }),
      },
      {
        name: "get_invoice",
        displayName: "Get Invoice",
        description: "Get details of a specific Xero invoice.",
        method: "GET" as const,
        path: "/Invoices/{InvoiceID}",
        pathParams: JSON.stringify([
          { name: "InvoiceID", type: "string", required: true, description: "Invoice GUID or invoice number" },
        ]),
        aiUsageHint: "Get a specific Xero invoice by ID or invoice number.",
        exampleArgs: JSON.stringify({ InvoiceID: "INVOICE_GUID" }),
      },
      {
        name: "create_invoice",
        displayName: "Create Invoice",
        description: "Create a new invoice (ACCREC) or bill (ACCPAY) in Xero.",
        method: "POST" as const,
        path: "/Invoices",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["Invoices"],
          properties: {
            Invoices: {
              type: "array",
              items: {
                type: "object",
                required: ["Type", "Contact", "LineItems"],
                properties: {
                  Type: { type: "string", enum: ["ACCREC", "ACCPAY"], description: "ACCREC=invoice (money in), ACCPAY=bill (money out)" },
                  Contact: { type: "object", required: ["ContactID"], properties: { ContactID: { type: "string" } } },
                  LineItems: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        Description: { type: "string" },
                        Quantity: { type: "number", default: 1 },
                        UnitAmount: { type: "number" },
                        AccountCode: { type: "string", description: "Chart of accounts code" },
                        TaxType: { type: "string" },
                      },
                    },
                  },
                  Date: { type: "string", description: "Invoice date YYYY-MM-DD" },
                  DueDate: { type: "string", description: "Due date YYYY-MM-DD" },
                  Status: { type: "string", enum: ["DRAFT", "AUTHORISED"], description: "DRAFT=save as draft, AUTHORISED=approve for sending" },
                  Reference: { type: "string", description: "Your reference number" },
                },
              },
            },
          },
        }),
        aiUsageHint: "Create a Xero invoice. Type=ACCREC for sales invoices, ACCPAY for bills. Status=AUTHORISED to approve. Wrap in Invoices array.",
        exampleArgs: JSON.stringify({
          Invoices: [{
            Type: "ACCREC",
            Contact: { ContactID: "CONTACT_GUID" },
            LineItems: [{ Description: "Consulting services", Quantity: 10, UnitAmount: 150 }],
            Date: "2026-03-08",
            DueDate: "2026-04-08",
            Status: "AUTHORISED",
          }],
        }),
      },
      {
        name: "create_payment",
        displayName: "Record Payment",
        description: "Record a payment against an invoice or bill in Xero.",
        method: "POST" as const,
        path: "/Payments",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["Payments"],
          properties: {
            Payments: {
              type: "array",
              items: {
                type: "object",
                required: ["Invoice", "Account", "Amount"],
                properties: {
                  Invoice: { type: "object", required: ["InvoiceID"], properties: { InvoiceID: { type: "string" } } },
                  Account: { type: "object", required: ["Code"], properties: { Code: { type: "string", description: "Bank account code, e.g. '090'" } } },
                  Amount: { type: "number", description: "Payment amount" },
                  Date: { type: "string", description: "Payment date YYYY-MM-DD" },
                  Reference: { type: "string" },
                },
              },
            },
          },
        }),
        aiUsageHint: "Record payment against a Xero invoice. Provide InvoiceID, Account code (bank account), and amount.",
        exampleArgs: JSON.stringify({ Payments: [{ Invoice: { InvoiceID: "INVOICE_GUID" }, Account: { Code: "090" }, Amount: 1500, Date: "2026-03-08" }] }),
      },
      {
        name: "get_profit_loss",
        displayName: "Get Profit & Loss Report",
        description: "Generate a Profit and Loss report for a date period.",
        method: "GET" as const,
        path: "/Reports/ProfitAndLoss",
        queryParams: JSON.stringify([
          { name: "fromDate", type: "string", description: "Start date YYYY-MM-DD" },
          { name: "toDate", type: "string", description: "End date YYYY-MM-DD" },
          { name: "periods", type: "number", description: "Number of periods to compare" },
          { name: "timeframe", type: "string", enum: ["MONTH", "QUARTER", "YEAR"], description: "Period length" },
        ]),
        aiUsageHint: "Get Xero Profit & Loss report. Specify fromDate and toDate for the reporting period.",
        exampleArgs: JSON.stringify({ fromDate: "2026-01-01", toDate: "2026-03-31" }),
      },
      {
        name: "get_balance_sheet",
        displayName: "Get Balance Sheet Report",
        description: "Generate a Balance Sheet report from Xero.",
        method: "GET" as const,
        path: "/Reports/BalanceSheet",
        queryParams: JSON.stringify([
          { name: "date", type: "string", description: "Report date YYYY-MM-DD (snapshot as at this date)" },
          { name: "periods", type: "number", description: "Number of periods to compare" },
          { name: "timeframe", type: "string", enum: ["MONTH", "QUARTER", "YEAR"] },
        ]),
        aiUsageHint: "Get Xero Balance Sheet as at a specific date. Shows assets, liabilities, and equity.",
        exampleArgs: JSON.stringify({ date: "2026-03-31" }),
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
      message: "✅ Xero blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Create OAuth2 app at https://developer.xero.com/app/manage",
        "2. Set OAUTH_SECRET_XERO in Convex environment variables",
        "3. Important: All Xero API calls need Xero-tenant-id header — call list_organisations first to get it",
        "4. Store tenantId in connection metadata after OAuth",
      ],
    };
  },
});
