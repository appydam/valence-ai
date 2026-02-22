/**
 * Seed SAP S/4HANA integration blueprint
 * Run this once to create the SAP S/4HANA blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedSapS4HanaBlueprint -> Run
 *
 * Prerequisites:
 * 1. SAP S/4HANA system with API access enabled
 * 2. Technical user account with appropriate authorizations
 * 3. Communication arrangements set up for the OData APIs
 * 4. Connect via the Integrations page using basic auth (SAP username:password)
 *
 * IMPORTANT: All API paths use {instanceUrl} which is the SAP system URL
 * (e.g. https://my-s4hana.s4hana.cloud.sap). OData queries use $format=json
 * for JSON responses. Write operations require a CSRF token (X-CSRF-Token header).
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "sap-s4hana"))
      .first();

    if (existing) {
      return {
        message: "SAP S/4HANA blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "sap-s4hana",
      name: "SAP S/4HANA",
      description:
        "Enterprise resource planning (ERP) system. Access sales orders, purchase orders, business partners, materials, and billing documents via SAP OData APIs.",
      category: "Accounting",
      version: 1,
      status: "active",
      authType: "basic_auth",
      authConfig: JSON.stringify({
        usernameLabel: "SAP Username",
        passwordLabel: "SAP Password",
        note: "Use a technical user with appropriate authorizations. The instance URL is your SAP system base URL.",
      }),
      baseUrl: "https://my-s4hana.s4hana.cloud.sap",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl:
        "https://api.sap.com/products/SAPS4HANACloud/overview",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/sap-1.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_sales_orders",
        displayName: "List Sales Orders",
        description:
          "List sales orders from SAP S/4HANA. Filter by customer, date range, or status. Uses the Sales Order OData API.",
        method: "GET" as const,
        path: "{instanceUrl}/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description:
              "SAP system base URL (e.g. https://my-s4hana.s4hana.cloud.sap)",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "$top",
            type: "number",
            default: 50,
            description: "Number of results to return",
          },
          {
            name: "$filter",
            type: "string",
            description:
              "OData filter expression. Example: SoldToParty eq '10100001' and CreationDate gt datetime'2026-01-01T00:00:00'",
          },
          {
            name: "$select",
            type: "string",
            description:
              "Comma-separated fields to return. Example: SalesOrder,SoldToParty,TotalNetAmount,SalesOrderDate",
          },
          {
            name: "$orderby",
            type: "string",
            description: "Sort order. Example: CreationDate desc",
          },
          {
            name: "$format",
            type: "string",
            default: "json",
            description: "Response format (always use json)",
          },
        ]),
        aiUsageHint:
          "List SAP sales orders. Use $filter for OData filtering (eq, gt, lt, ge, le). Always include $format=json. Common fields: SalesOrder, SoldToParty, TotalNetAmount, SalesOrderDate, OverallSDProcessStatus.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://my-s4hana.s4hana.cloud.sap",
          $top: 20,
          $filter: "CreationDate gt datetime'2026-01-01T00:00:00'",
          $select:
            "SalesOrder,SoldToParty,TotalNetAmount,TransactionCurrency,SalesOrderDate",
          $format: "json",
        }),
      },
      {
        name: "get_sales_order",
        displayName: "Get Sales Order",
        description:
          "Get a specific sales order by number including line items, pricing, and delivery status.",
        method: "GET" as const,
        path: "{instanceUrl}/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder('{salesOrder}')",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "SAP system base URL",
          },
          {
            name: "salesOrder",
            type: "string",
            required: true,
            description:
              "10-digit SAP Sales Order number (e.g. '0000000100')",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "$expand",
            type: "string",
            description:
              "Expand related entities. Example: to_Item for line items",
          },
          {
            name: "$format",
            type: "string",
            default: "json",
            description: "Response format",
          },
        ]),
        aiUsageHint:
          "Fetch a sales order by its 10-digit number. Use $expand=to_Item to include line items.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://my-s4hana.s4hana.cloud.sap",
          salesOrder: "0000000100",
          $expand: "to_Item",
          $format: "json",
        }),
      },
      {
        name: "create_sales_order",
        displayName: "Create Sales Order",
        description:
          "Create a new sales order in SAP S/4HANA. Requires sold-to party, sales org, and at least one line item.",
        method: "POST" as const,
        path: "{instanceUrl}/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "SAP system base URL",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: [
            "SalesOrderType",
            "SalesOrganization",
            "DistributionChannel",
            "OrganizationDivision",
            "SoldToParty",
          ],
          properties: {
            SalesOrderType: {
              type: "string",
              description: "Order type (e.g. 'OR' for Standard Order)",
            },
            SalesOrganization: {
              type: "string",
              description: "Sales organization code",
            },
            DistributionChannel: {
              type: "string",
              description: "Distribution channel code",
            },
            OrganizationDivision: {
              type: "string",
              description: "Division code",
            },
            SoldToParty: {
              type: "string",
              description: "Customer/business partner number",
            },
            PurchaseOrderByCustomer: {
              type: "string",
              description: "Customer PO reference number",
            },
            to_Item: {
              type: "object",
              description:
                "Line items array with results[]. Each item needs Material, RequestedQuantity, RequestedQuantityUnit",
            },
          },
        }),
        aiUsageHint:
          "Create a sales order. Always include SalesOrderType, SalesOrganization, DistributionChannel, OrganizationDivision, and SoldToParty. Add line items via to_Item.results array.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://my-s4hana.s4hana.cloud.sap",
          SalesOrderType: "OR",
          SalesOrganization: "1010",
          DistributionChannel: "10",
          OrganizationDivision: "00",
          SoldToParty: "10100001",
          PurchaseOrderByCustomer: "PO-2026-001",
          to_Item: {
            results: [
              {
                Material: "TG11",
                RequestedQuantity: "10",
                RequestedQuantityUnit: "EA",
              },
            ],
          },
        }),
      },
      {
        name: "list_purchase_orders",
        displayName: "List Purchase Orders",
        description:
          "List purchase orders from SAP S/4HANA. Filter by supplier, date, or status.",
        method: "GET" as const,
        path: "{instanceUrl}/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "SAP system base URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "$top",
            type: "number",
            default: 50,
            description: "Number of results",
          },
          {
            name: "$filter",
            type: "string",
            description:
              "OData filter. Example: Supplier eq '100000' and PurchaseOrderDate gt datetime'2026-01-01T00:00:00'",
          },
          {
            name: "$select",
            type: "string",
            description:
              "Fields to return. Example: PurchaseOrder,Supplier,PurchaseOrderDate,PurchasingOrganization",
          },
          {
            name: "$format",
            type: "string",
            default: "json",
            description: "Response format",
          },
        ]),
        aiUsageHint:
          "List purchase orders. Filter by Supplier number or PurchaseOrderDate. Always include $format=json.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://my-s4hana.s4hana.cloud.sap",
          $top: 20,
          $select:
            "PurchaseOrder,Supplier,PurchaseOrderDate,PurchasingOrganization",
          $format: "json",
        }),
      },
      {
        name: "list_business_partners",
        displayName: "List Business Partners",
        description:
          "List business partners (customers, vendors, contacts) from SAP. Filter by name, category, or role.",
        method: "GET" as const,
        path: "{instanceUrl}/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "SAP system base URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "$top",
            type: "number",
            default: 50,
            description: "Number of results",
          },
          {
            name: "$filter",
            type: "string",
            description:
              "OData filter. Example: BusinessPartnerCategory eq '1' (1=Organization, 2=Person)",
          },
          {
            name: "$select",
            type: "string",
            description:
              "Fields to return. Example: BusinessPartner,BusinessPartnerFullName,BusinessPartnerCategory",
          },
          {
            name: "$format",
            type: "string",
            default: "json",
            description: "Response format",
          },
        ]),
        aiUsageHint:
          "List business partners. Category 1 = Organizations, 2 = Persons. Use substringof() for text search in $filter.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://my-s4hana.s4hana.cloud.sap",
          $top: 20,
          $filter: "BusinessPartnerCategory eq '1'",
          $select:
            "BusinessPartner,BusinessPartnerFullName,BusinessPartnerCategory,Industry",
          $format: "json",
        }),
      },
      {
        name: "get_material",
        displayName: "Get Material/Product",
        description:
          "Get details of a specific material/product by material number. Returns descriptions, UoM, material group, and weights.",
        method: "GET" as const,
        path: "{instanceUrl}/sap/opu/odata/sap/API_PRODUCT_SRV/A_Product('{product}')",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "SAP system base URL",
          },
          {
            name: "product",
            type: "string",
            required: true,
            description: "SAP Material/Product number",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "$format",
            type: "string",
            default: "json",
            description: "Response format",
          },
        ]),
        aiUsageHint:
          "Get a material's details by its SAP number. Returns description, base UoM, material group, etc.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://my-s4hana.s4hana.cloud.sap",
          product: "TG11",
          $format: "json",
        }),
      },
      {
        name: "list_billing_documents",
        displayName: "List Billing Documents",
        description:
          "List billing documents (invoices) from SAP S/4HANA. Filter by customer, date range, or billing type.",
        method: "GET" as const,
        path: "{instanceUrl}/sap/opu/odata/sap/API_BILLING_DOCUMENT_SRV/A_BillingDocument",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "SAP system base URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "$top",
            type: "number",
            default: 50,
            description: "Number of results",
          },
          {
            name: "$filter",
            type: "string",
            description:
              "OData filter. Example: SoldToParty eq '10100001' and BillingDocumentDate gt datetime'2026-01-01T00:00:00'",
          },
          {
            name: "$select",
            type: "string",
            description:
              "Fields to return. Example: BillingDocument,SoldToParty,TotalNetAmount,BillingDocumentDate",
          },
          {
            name: "$format",
            type: "string",
            default: "json",
            description: "Response format",
          },
        ]),
        aiUsageHint:
          "List invoices/billing docs. Filter by SoldToParty or BillingDocumentDate. Always include $format=json.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://my-s4hana.s4hana.cloud.sap",
          $top: 20,
          $filter: "BillingDocumentDate gt datetime'2026-01-01T00:00:00'",
          $select:
            "BillingDocument,SoldToParty,TotalNetAmount,TransactionCurrency,BillingDocumentDate",
          $format: "json",
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
      message: "✅ SAP S/4HANA blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Ensure SAP S/4HANA system has OData APIs enabled",
        "2. Create a technical user (Communication User) with authorizations for:",
        "   - API_SALES_ORDER_SRV, API_PURCHASEORDER_PROCESS_SRV",
        "   - API_BUSINESS_PARTNER, API_PRODUCT_SRV, API_BILLING_DOCUMENT_SRV",
        "3. Set up Communication Arrangements for each API",
        "4. Connect via the Integrations page using basic auth (SAP username:password)",
        "5. Note: Write operations require CSRF token handling",
      ],
    };
  },
});
