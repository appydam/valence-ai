/**
 * Seed Shopify integration blueprint
 * Run this once to create the Shopify blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedShopifyBlueprint -> Run
 *
 * Prerequisites:
 * 1. Create a custom app in Shopify Partners or store Admin → Settings → Apps → Develop apps
 *    - Add redirect URL: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback
 *    - Request scopes: read_products, write_products, read_orders, read_customers, write_orders, read_inventory
 * 2. Set in Convex env vars:
 *    - SHOPIFY_CLIENT_ID = API Key from app credentials
 *    - OAUTH_SECRET_SHOPIFY = API Secret Key from app credentials
 *
 * IMPORTANT: Shopify API URLs are shop-scoped (e.g. https://myshop.myshopify.com).
 * The {instanceUrl} is resolved from the shop's myshopify.com domain at runtime.
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "shopify"))
      .first();

    if (existing) {
      return {
        message: "Shopify blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "shopify",
      name: "Shopify",
      description:
        "E-commerce platform. Manage products, orders, customers, and inventory. List and search products, view order details, track fulfillment, and manage your online store.",
      category: "E-commerce",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId:
          process.env.SHOPIFY_CLIENT_ID || "YOUR_SHOPIFY_CLIENT_ID",
        clientSecret: "OAUTH_SECRET_SHOPIFY",
        authorizeUrl:
          "https://{shop}.myshopify.com/admin/oauth/authorize",
        tokenUrl:
          "https://{shop}.myshopify.com/admin/oauth/access_token",
        scopes: [
          "read_products",
          "write_products",
          "read_orders",
          "write_orders",
          "read_customers",
          "read_inventory",
        ],
        scopeSeparator: ",",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://{shop}.myshopify.com/admin/api/2024-01",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://shopify.dev/docs/api/admin-rest",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_products",
        displayName: "List Products",
        description:
          "List products from the Shopify store. Filter by collection, status, vendor, or product type.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/products.json",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description:
              "Shopify store URL (e.g. https://myshop.myshopify.com)",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "limit",
            type: "number",
            default: 50,
            description: "Results per page (max 250)",
          },
          {
            name: "status",
            type: "string",
            description: "active, archived, draft",
          },
          {
            name: "vendor",
            type: "string",
            description: "Filter by product vendor",
          },
          {
            name: "product_type",
            type: "string",
            description: "Filter by product type",
          },
          {
            name: "collection_id",
            type: "number",
            description: "Filter by collection ID",
          },
          {
            name: "since_id",
            type: "number",
            description: "Return products after this ID (for pagination)",
          },
          {
            name: "fields",
            type: "string",
            description:
              "Comma-separated fields to return. Example: id,title,vendor,status",
          },
        ]),
        aiUsageHint:
          "List store products. Use status=active for published products. Use fields param to limit response size. Paginate with since_id.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          status: "active",
          limit: 25,
          fields: "id,title,vendor,status,variants",
        }),
      },
      {
        name: "get_product",
        displayName: "Get Product",
        description:
          "Get full details of a specific product including all variants, images, and metafields.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/products/{product_id}.json",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Shopify store URL",
          },
          {
            name: "product_id",
            type: "number",
            required: true,
            description: "Shopify product ID",
          },
        ]),
        aiUsageHint:
          "Get a product's full details including variants and pricing.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          product_id: 1234567890,
        }),
      },
      {
        name: "create_product",
        displayName: "Create Product",
        description:
          "Create a new product in the Shopify store with title, description, variants, and images.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/products.json",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Shopify store URL",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["product"],
          properties: {
            product: {
              type: "object",
              required: ["title"],
              properties: {
                title: { type: "string", description: "Product title" },
                body_html: {
                  type: "string",
                  description: "Product description (HTML)",
                },
                vendor: { type: "string", description: "Product vendor/brand" },
                product_type: { type: "string", description: "Product category" },
                tags: {
                  type: "string",
                  description: "Comma-separated tags",
                },
                status: {
                  type: "string",
                  description: "active, draft, archived",
                  default: "draft",
                },
                variants: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      price: { type: "string", description: "Variant price" },
                      sku: { type: "string", description: "SKU" },
                      inventory_quantity: {
                        type: "number",
                        description: "Initial stock quantity",
                      },
                      option1: {
                        type: "string",
                        description: "Option value (e.g. size, color)",
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Create a product. Wrap in 'product' object. Status defaults to draft. Add variants for sizes/colors. Tags are comma-separated strings.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          product: {
            title: "Premium Cotton T-Shirt",
            body_html: "<p>Ultra-soft premium cotton t-shirt, available in multiple sizes.</p>",
            vendor: "BrandName",
            product_type: "Apparel",
            tags: "cotton, t-shirt, premium",
            status: "draft",
            variants: [
              { price: "29.99", sku: "TSHIRT-S", option1: "Small" },
              { price: "29.99", sku: "TSHIRT-M", option1: "Medium" },
              { price: "29.99", sku: "TSHIRT-L", option1: "Large" },
            ],
          },
        }),
      },
      {
        name: "update_product",
        displayName: "Update Product",
        description:
          "Update an existing product's title, description, tags, status, or variants.",
        method: "PUT" as const,
        path: "{instanceUrl}/admin/api/2024-01/products/{product_id}.json",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Shopify store URL",
          },
          {
            name: "product_id",
            type: "number",
            required: true,
            description: "Shopify product ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["product"],
          properties: {
            product: {
              type: "object",
              properties: {
                title: { type: "string" },
                body_html: { type: "string" },
                vendor: { type: "string" },
                tags: { type: "string" },
                status: { type: "string", description: "active, draft, archived" },
              },
            },
          },
        }),
        aiUsageHint:
          "Update product fields. Only include changed fields inside the 'product' wrapper. Use status='active' to publish a draft.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          product_id: 1234567890,
          product: {
            status: "active",
            tags: "cotton, t-shirt, premium, bestseller",
          },
        }),
      },
      {
        name: "list_orders",
        displayName: "List Orders",
        description:
          "List orders from the Shopify store. Filter by status, financial status, fulfillment status, or date.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/orders.json",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Shopify store URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "limit",
            type: "number",
            default: 50,
            description: "Results per page (max 250)",
          },
          {
            name: "status",
            type: "string",
            description: "open, closed, cancelled, any",
            default: "any",
          },
          {
            name: "financial_status",
            type: "string",
            description:
              "authorized, pending, paid, partially_paid, refunded, voided, partially_refunded, any",
          },
          {
            name: "fulfillment_status",
            type: "string",
            description: "shipped, partial, unshipped, unfulfilled, any",
          },
          {
            name: "created_at_min",
            type: "string",
            description: "Minimum creation date (ISO 8601)",
          },
          {
            name: "since_id",
            type: "number",
            description: "Return orders after this ID",
          },
          {
            name: "fields",
            type: "string",
            description: "Comma-separated fields to return",
          },
        ]),
        aiUsageHint:
          "List orders. Use status=open for active orders. financial_status=paid for completed payments. fulfillment_status=unfulfilled for orders needing shipping.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          status: "open",
          fulfillment_status: "unfulfilled",
          limit: 25,
        }),
      },
      {
        name: "get_order",
        displayName: "Get Order",
        description:
          "Get full details of a specific order including line items, shipping, payments, and fulfillment info.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/orders/{order_id}.json",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Shopify store URL",
          },
          {
            name: "order_id",
            type: "number",
            required: true,
            description: "Shopify order ID",
          },
        ]),
        aiUsageHint:
          "Get an order's full details including line items, customer info, shipping address, and payment status.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          order_id: 9876543210,
        }),
      },
      {
        name: "list_customers",
        displayName: "List Customers",
        description:
          "List customers from the Shopify store. Returns customer profiles with order count and total spent.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/customers.json",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Shopify store URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "limit",
            type: "number",
            default: 50,
            description: "Results per page (max 250)",
          },
          {
            name: "since_id",
            type: "number",
            description: "Return customers after this ID",
          },
          {
            name: "fields",
            type: "string",
            description: "Comma-separated fields to return",
          },
        ]),
        aiUsageHint:
          "List store customers. Includes orders_count and total_spent for each customer.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          limit: 25,
          fields: "id,first_name,last_name,email,orders_count,total_spent",
        }),
      },
      {
        name: "search_customers",
        displayName: "Search Customers",
        description:
          "Search for customers by name, email, or other attributes using Shopify's search syntax.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/customers/search.json",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Shopify store URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "query",
            type: "string",
            required: true,
            description:
              "Search query. Supports: email:, first_name:, last_name:, or free text. Example: email:john@example.com",
          },
          {
            name: "limit",
            type: "number",
            default: 50,
            description: "Results per page (max 250)",
          },
          {
            name: "fields",
            type: "string",
            description: "Comma-separated fields to return",
          },
        ]),
        aiUsageHint:
          "Search customers by email, name, or free text. Examples: 'email:john@example.com', 'first_name:John last_name:Doe'.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          query: "email:jane@example.com",
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
      message: "✅ Shopify blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Create a custom app in Shopify Admin → Settings → Apps → Develop apps",
        "2. Or create a public app via Shopify Partners dashboard",
        "3. Set redirect URL: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "4. Request scopes: read_products, write_products, read_orders, write_orders, read_customers, read_inventory",
        "5. Set SHOPIFY_CLIENT_ID in Convex env vars (API Key)",
        "6. Set OAUTH_SECRET_SHOPIFY in Convex env vars (API Secret Key)",
        "7. Note: Users will need to provide their shop name during connection",
      ],
    };
  },
});
