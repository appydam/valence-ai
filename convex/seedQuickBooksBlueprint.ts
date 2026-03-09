/**
 * Seed QuickBooks Online integration blueprint
 * Run this once to create the QuickBooks blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedQuickBooksBlueprint -> Run
 *
 * Prerequisites:
 * - Create an app at https://developer.intuit.com/
 * - Set OAUTH_SECRET_QUICKBOOKS env var in Convex dashboard
 * - Note: realmId (company ID) is returned during OAuth and needed for all API calls
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "quickbooks"))
      .first();

    if (existing) {
      return {
        message: "QuickBooks blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "quickbooks",
      name: "QuickBooks",
      description:
        "Accounting and financial management. Manage customers, invoices, payments, accounts, and run financial reports like Profit & Loss and Balance Sheet.",
      category: "finance",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "",
        clientSecret: "OAUTH_SECRET_QUICKBOOKS",
        authorizeUrl: "https://appcenter.intuit.com/connect/oauth2",
        tokenUrl: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
        scopes: ["com.intuit.quickbooks.accounting"],
        scopeSeparator: "space",
        tokenEndpointAuth: "header",
      }),
      baseUrl: "https://quickbooks.api.intuit.com/v3/company/{realmId}",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/account",
      iconUrl: "https://cdn.simpleicons.org/quickbooks/2CA01C",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "query",
        displayName: "Query (SQL-like)",
        description: "Run a SQL-like query against QuickBooks data. Supports SELECT with WHERE, ORDER BY, LIMIT.",
        method: "GET" as const,
        path: "/query",
        queryParams: JSON.stringify([
          { name: "query", type: "string", required: true, description: "SQL-like query, e.g. SELECT * FROM Invoice WHERE TotalAmt > 100 ORDER BY TxnDate DESC MAXRESULTS 25" },
          { name: "minorversion", type: "number", description: "API minor version", default: 65 },
        ]),
        aiUsageHint: "Query QuickBooks using SQL-like syntax. Tables: Account, Bill, Customer, Employee, Estimate, Invoice, Item, Payment, Vendor. Example: SELECT * FROM Invoice WHERE Balance > 0 ORDER BY TxnDate DESC MAXRESULTS 25",
        exampleArgs: JSON.stringify({ query: "SELECT * FROM Invoice WHERE Balance > 0 ORDER BY TxnDate DESC MAXRESULTS 25" }),
      },
      {
        name: "get_company_info",
        displayName: "Get Company Info",
        description: "Get basic information about the connected QuickBooks company.",
        method: "GET" as const,
        path: "/companyinfo/{companyId}",
        pathParams: JSON.stringify([
          { name: "companyId", type: "string", required: true, description: "Company ID (same as realmId from OAuth)" },
        ]),
        queryParams: JSON.stringify([
          { name: "minorversion", type: "number", default: 65 },
        ]),
        aiUsageHint: "Get QuickBooks company details including name, address, and fiscal year settings.",
        exampleArgs: JSON.stringify({ companyId: "REALM_ID" }),
      },
      {
        name: "create_invoice",
        displayName: "Create Invoice",
        description: "Create a new invoice in QuickBooks.",
        method: "POST" as const,
        path: "/invoice",
        queryParams: JSON.stringify([
          { name: "minorversion", type: "number", default: 65 },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["Line", "CustomerRef"],
          properties: {
            CustomerRef: { type: "object", required: ["value"], properties: { value: { type: "string", description: "Customer ID" }, name: { type: "string" } } },
            Line: {
              type: "array",
              description: "Invoice line items",
              items: {
                type: "object",
                properties: {
                  DetailType: { type: "string", enum: ["SalesItemLineDetail"] },
                  Amount: { type: "number", description: "Line total" },
                  SalesItemLineDetail: {
                    type: "object",
                    properties: {
                      ItemRef: { type: "object", properties: { value: { type: "string", description: "Item ID" } } },
                      Qty: { type: "number" },
                      UnitPrice: { type: "number" },
                    },
                  },
                  Description: { type: "string" },
                },
              },
            },
            DueDate: { type: "string", description: "Due date YYYY-MM-DD" },
            CustomerMemo: { type: "object", properties: { value: { type: "string" } } },
          },
        }),
        aiUsageHint: "Create a QuickBooks invoice. Provide CustomerRef (customer ID) and Line items with amounts. Use query tool to find customer IDs first.",
        exampleArgs: JSON.stringify({
          CustomerRef: { value: "1", name: "Acme Corp" },
          Line: [{ DetailType: "SalesItemLineDetail", Amount: 500, SalesItemLineDetail: { ItemRef: { value: "1" }, Qty: 5, UnitPrice: 100 } }],
          DueDate: "2026-04-30",
        }),
      },
      {
        name: "create_customer",
        displayName: "Create Customer",
        description: "Create a new customer record in QuickBooks.",
        method: "POST" as const,
        path: "/customer",
        queryParams: JSON.stringify([
          { name: "minorversion", type: "number", default: 65 },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["DisplayName"],
          properties: {
            DisplayName: { type: "string", description: "Customer display name (must be unique)" },
            GivenName: { type: "string", description: "First name" },
            FamilyName: { type: "string", description: "Last name" },
            CompanyName: { type: "string" },
            PrimaryEmailAddr: { type: "object", properties: { Address: { type: "string" } } },
            PrimaryPhone: { type: "object", properties: { FreeFormNumber: { type: "string" } } },
            BillAddr: { type: "object", properties: { Line1: { type: "string" }, City: { type: "string" }, CountrySubDivisionCode: { type: "string" }, PostalCode: { type: "string" } } },
          },
        }),
        aiUsageHint: "Create a QuickBooks customer. DisplayName must be unique. Optionally add email, phone, and billing address.",
        exampleArgs: JSON.stringify({ DisplayName: "Acme Corp", CompanyName: "Acme Corp", PrimaryEmailAddr: { Address: "billing@acme.com" } }),
      },
      {
        name: "create_payment",
        displayName: "Record Payment",
        description: "Record a payment received from a customer in QuickBooks.",
        method: "POST" as const,
        path: "/payment",
        queryParams: JSON.stringify([
          { name: "minorversion", type: "number", default: 65 },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["TotalAmt", "CustomerRef"],
          properties: {
            TotalAmt: { type: "number", description: "Payment amount" },
            CustomerRef: { type: "object", required: ["value"], properties: { value: { type: "string", description: "Customer ID" } } },
            TxnDate: { type: "string", description: "Payment date YYYY-MM-DD" },
            PaymentRefNum: { type: "string", description: "Check number or payment reference" },
            Line: {
              type: "array",
              description: "Invoices this payment applies to",
              items: {
                type: "object",
                properties: {
                  Amount: { type: "number" },
                  LinkedTxn: { type: "array", items: { type: "object", properties: { TxnId: { type: "string", description: "Invoice ID" }, TxnType: { type: "string", enum: ["Invoice"] } } } },
                },
              },
            },
          },
        }),
        aiUsageHint: "Record a customer payment in QuickBooks. Apply to specific invoices using the Line.LinkedTxn array with invoice IDs.",
        exampleArgs: JSON.stringify({ TotalAmt: 500, CustomerRef: { value: "1" }, TxnDate: "2026-03-08", Line: [{ Amount: 500, LinkedTxn: [{ TxnId: "INV_ID", TxnType: "Invoice" }] }] }),
      },
      {
        name: "get_profit_loss",
        displayName: "Get Profit & Loss Report",
        description: "Generate a Profit and Loss (Income Statement) report for a date range.",
        method: "GET" as const,
        path: "/reports/ProfitAndLoss",
        queryParams: JSON.stringify([
          { name: "start_date", type: "string", description: "Start date YYYY-MM-DD", default: "2026-01-01" },
          { name: "end_date", type: "string", description: "End date YYYY-MM-DD", default: "2026-12-31" },
          { name: "accounting_method", type: "string", enum: ["Cash", "Accrual"], default: "Accrual" },
          { name: "minorversion", type: "number", default: 65 },
        ]),
        aiUsageHint: "Get QuickBooks Profit & Loss report. Specify date range and accounting method. Returns revenue, expenses, and net income.",
        exampleArgs: JSON.stringify({ start_date: "2026-01-01", end_date: "2026-03-31", accounting_method: "Accrual" }),
      },
      {
        name: "get_balance_sheet",
        displayName: "Get Balance Sheet Report",
        description: "Generate a Balance Sheet report showing assets, liabilities, and equity.",
        method: "GET" as const,
        path: "/reports/BalanceSheet",
        queryParams: JSON.stringify([
          { name: "start_date", type: "string", description: "Start date YYYY-MM-DD" },
          { name: "end_date", type: "string", description: "End date YYYY-MM-DD" },
          { name: "accounting_method", type: "string", enum: ["Cash", "Accrual"], default: "Accrual" },
          { name: "minorversion", type: "number", default: 65 },
        ]),
        aiUsageHint: "Get QuickBooks Balance Sheet report showing assets, liabilities, and equity at a point in time.",
        exampleArgs: JSON.stringify({ end_date: "2026-03-31" }),
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
      message: "✅ QuickBooks blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Create app at https://developer.intuit.com/ and get client ID/secret",
        "2. Set OAUTH_SECRET_QUICKBOOKS in Convex environment variables",
        "3. Important: realmId (company ID) is returned during OAuth — store it in connection metadata",
        "4. All API calls require realmId in the URL path",
      ],
    };
  },
});
