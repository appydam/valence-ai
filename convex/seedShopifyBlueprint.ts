/**
 * Seed Shopify integration blueprint
 * Run this once to create the Shopify blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedShopifyBlueprint -> Run
 * (or run migrate to upgrade an existing blueprint)
 *
 * Prerequisites:
 * 1. Create a custom app in Shopify Partners or store Admin -> Settings -> Apps -> Develop apps
 *    - Add redirect URL: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback
 *    - Request scopes: read_products, write_products, read_orders, read_customers, write_orders,
 *      read_inventory, write_inventory, read_locations, read_themes, write_themes,
 *      read_content, write_content, read_script_tags, write_script_tags,
 *      read_price_rules, write_price_rules, read_discounts, write_discounts,
 *      read_fulfillments, write_fulfillments, read_metafields, write_metafields,
 *      read_redirects, write_redirects
 * 2. Set in Convex env vars:
 *    - SHOPIFY_CLIENT_ID = API Key from app credentials
 *    - OAUTH_SECRET_SHOPIFY = API Secret Key from app credentials
 *
 * IMPORTANT: Shopify API URLs are shop-scoped (e.g. https://myshop.myshopify.com).
 * The {instanceUrl} is resolved from the shop's myshopify.com domain at runtime.
 */

import { mutation } from "./_generated/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SHOPIFY_TOOLS: any[] = [
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

      // ─── COLLECTIONS ────────────────────────────────────────────────────────
      {
        name: "list_collections",
        displayName: "List Collections",
        description: "List all custom and smart collections in the store.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/custom_collections.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 50, description: "Results per page (max 250)" },
          { name: "title", type: "string", description: "Filter by exact title" },
          { name: "published_status", type: "string", description: "published, unpublished, any" },
          { name: "fields", type: "string", description: "Comma-separated fields to return" },
        ]),
        aiUsageHint: "List store collections. Use to understand how products are organized before creating new collections or assigning products.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", limit: 50, published_status: "published" }),
      },
      {
        name: "create_collection",
        displayName: "Create Collection",
        description: "Create a new custom collection (product category) in the store. Collections organize products for navigation and SEO.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/custom_collections.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["custom_collection"],
          properties: {
            custom_collection: {
              type: "object",
              required: ["title"],
              properties: {
                title: { type: "string", description: "Collection name" },
                body_html: { type: "string", description: "Collection description (HTML)" },
                published: { type: "boolean", description: "Whether collection is published", default: true },
                sort_order: { type: "string", description: "alpha-asc, alpha-desc, best-selling, created, created-desc, manual, price-asc, price-desc" },
                template_suffix: { type: "string", description: "Theme template suffix (e.g. 'featured')" },
                metafield: {
                  type: "object",
                  properties: {
                    namespace: { type: "string" },
                    key: { type: "string" },
                    value: { type: "string" },
                    type: { type: "string" },
                  },
                },
                image: {
                  type: "object",
                  properties: {
                    src: { type: "string", description: "Image URL" },
                    alt: { type: "string", description: "Alt text" },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Create a product collection/category. Set published=true to show immediately. Use sort_order='best-selling' for main collections.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          custom_collection: {
            title: "Summer Collection",
            body_html: "<p>Our best summer styles for 2024.</p>",
            published: true,
            sort_order: "best-selling",
          },
        }),
      },
      {
        name: "add_product_to_collection",
        displayName: "Add Product to Collection",
        description: "Add a product to a custom collection using a collect record.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/collects.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["collect"],
          properties: {
            collect: {
              type: "object",
              required: ["product_id", "collection_id"],
              properties: {
                product_id: { type: "number", description: "Product ID to add" },
                collection_id: { type: "number", description: "Collection ID to add to" },
                position: { type: "number", description: "Sort position in collection" },
              },
            },
          },
        }),
        aiUsageHint: "Link a product to a collection. Both product_id and collection_id are required. A product can belong to multiple collections.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          collect: { product_id: 1234567890, collection_id: 9876543210 },
        }),
      },
      {
        name: "update_collection",
        displayName: "Update Collection",
        description: "Update a collection's title, description, image, sort order, or published status.",
        method: "PUT" as const,
        path: "{instanceUrl}/admin/api/2024-01/custom_collections/{collection_id}.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "collection_id", type: "number", required: true, description: "Collection ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["custom_collection"],
          properties: {
            custom_collection: {
              type: "object",
              properties: {
                title: { type: "string" },
                body_html: { type: "string" },
                published: { type: "boolean" },
                sort_order: { type: "string" },
                image: { type: "object", properties: { src: { type: "string" }, alt: { type: "string" } } },
              },
            },
          },
        }),
        aiUsageHint: "Update collection fields. Only send fields you want to change.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          collection_id: 9876543210,
          custom_collection: { published: true, sort_order: "best-selling" },
        }),
      },

      // ─── PRODUCT IMAGES ──────────────────────────────────────────────────────
      {
        name: "add_product_image",
        displayName: "Add Product Image",
        description: "Add an image to an existing product by URL. Can attach to specific variants.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/products/{product_id}/images.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "product_id", type: "number", required: true, description: "Product ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["image"],
          properties: {
            image: {
              type: "object",
              required: ["src"],
              properties: {
                src: { type: "string", description: "Public image URL to import" },
                alt: { type: "string", description: "Alt text for SEO and accessibility" },
                position: { type: "number", description: "Image order (1 = main image)" },
                variant_ids: { type: "array", items: { type: "number" }, description: "Associate image with specific variant IDs" },
              },
            },
          },
        }),
        aiUsageHint: "Add an image to a product from a URL. Use position=1 for the main product image. Attach to variant_ids to show the image only for those variants.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          product_id: 1234567890,
          image: { src: "https://example.com/image.jpg", alt: "Premium cotton t-shirt in red", position: 1 },
        }),
      },
      {
        name: "list_product_images",
        displayName: "List Product Images",
        description: "List all images attached to a product.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/products/{product_id}/images.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "product_id", type: "number", required: true, description: "Product ID" },
        ]),
        aiUsageHint: "Get all images for a product to check what's already uploaded before adding more.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", product_id: 1234567890 }),
      },

      // ─── PRODUCT VARIANTS ────────────────────────────────────────────────────
      {
        name: "create_product_variant",
        displayName: "Create Product Variant",
        description: "Add a new variant to an existing product (e.g. a new size or color option).",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/products/{product_id}/variants.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "product_id", type: "number", required: true, description: "Product ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["variant"],
          properties: {
            variant: {
              type: "object",
              properties: {
                option1: { type: "string", description: "First option value (e.g. size)" },
                option2: { type: "string", description: "Second option value (e.g. color)" },
                option3: { type: "string", description: "Third option value" },
                price: { type: "string", description: "Variant price as string" },
                compare_at_price: { type: "string", description: "Original price for sale display" },
                sku: { type: "string", description: "Stock keeping unit" },
                barcode: { type: "string", description: "Barcode / ISBN / UPC" },
                weight: { type: "number", description: "Weight in grams" },
                weight_unit: { type: "string", description: "g, kg, oz, lb" },
                inventory_management: { type: "string", description: "shopify or null" },
                inventory_policy: { type: "string", description: "deny or continue (oversell)" },
                fulfillment_service: { type: "string", description: "manual or fulfillment service handle" },
                requires_shipping: { type: "boolean" },
                taxable: { type: "boolean" },
                image_id: { type: "number", description: "Associate with a product image ID" },
              },
            },
          },
        }),
        aiUsageHint: "Add a new variant to a product. Use inventory_management='shopify' to track stock. compare_at_price shows a strikethrough original price.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          product_id: 1234567890,
          variant: { option1: "XL", price: "34.99", compare_at_price: "49.99", sku: "TSHIRT-XL", inventory_management: "shopify" },
        }),
      },
      {
        name: "update_product_variant",
        displayName: "Update Product Variant",
        description: "Update a specific variant's price, SKU, inventory policy, or options.",
        method: "PUT" as const,
        path: "{instanceUrl}/admin/api/2024-01/variants/{variant_id}.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "variant_id", type: "number", required: true, description: "Variant ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["variant"],
          properties: {
            variant: {
              type: "object",
              properties: {
                price: { type: "string" },
                compare_at_price: { type: "string" },
                sku: { type: "string" },
                option1: { type: "string" },
                option2: { type: "string" },
                barcode: { type: "string" },
                weight: { type: "number" },
                weight_unit: { type: "string" },
                inventory_policy: { type: "string" },
                requires_shipping: { type: "boolean" },
                taxable: { type: "boolean" },
              },
            },
          },
        }),
        aiUsageHint: "Update a specific product variant. Only send fields you want to change.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          variant_id: 98765432,
          variant: { price: "39.99", compare_at_price: "59.99" },
        }),
      },

      // ─── INVENTORY ──────────────────────────────────────────────────────────
      {
        name: "list_locations",
        displayName: "List Locations",
        description: "List all fulfillment locations (warehouses, stores) in the Shopify account.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/locations.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        aiUsageHint: "Get location IDs needed to set inventory levels. Most stores have one primary location.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },
      {
        name: "get_inventory_levels",
        displayName: "Get Inventory Levels",
        description: "Get inventory quantities for one or more inventory items at a location.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/inventory_levels.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        queryParams: JSON.stringify([
          { name: "inventory_item_ids", type: "string", required: true, description: "Comma-separated inventory item IDs" },
          { name: "location_ids", type: "string", description: "Comma-separated location IDs" },
          { name: "limit", type: "number", default: 50 },
        ]),
        aiUsageHint: "Check stock levels. inventory_item_ids come from variant.inventory_item_id. Call list_locations first to get location_ids.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", inventory_item_ids: "808950810,39072856", location_ids: "655441491" }),
      },
      {
        name: "set_inventory_level",
        displayName: "Set Inventory Level",
        description: "Set the inventory quantity for a specific item at a specific location. Use this to restock or initialize inventory.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/inventory_levels/set.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["location_id", "inventory_item_id", "available"],
          properties: {
            location_id: { type: "number", description: "Location ID from list_locations" },
            inventory_item_id: { type: "number", description: "inventory_item_id from the variant" },
            available: { type: "number", description: "Quantity to set (absolute value)" },
          },
        }),
        aiUsageHint: "Set stock quantity absolutely (not adjust). Get location_id from list_locations. Get inventory_item_id from get_product variant data.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", location_id: 655441491, inventory_item_id: 808950810, available: 100 }),
      },
      {
        name: "adjust_inventory_level",
        displayName: "Adjust Inventory Level",
        description: "Adjust inventory by a delta (+ or -) rather than setting an absolute value.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/inventory_levels/adjust.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["location_id", "inventory_item_id", "available_adjustment"],
          properties: {
            location_id: { type: "number" },
            inventory_item_id: { type: "number" },
            available_adjustment: { type: "number", description: "Positive to add stock, negative to remove" },
          },
        }),
        aiUsageHint: "Adjust stock by a delta. Use +N to add stock, -N to remove. Prefer over set_inventory_level when you want relative changes.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", location_id: 655441491, inventory_item_id: 808950810, available_adjustment: 50 }),
      },

      // ─── PAGES ──────────────────────────────────────────────────────────────
      {
        name: "list_pages",
        displayName: "List Pages",
        description: "List all store pages (About, Contact, FAQ, Policy pages, etc.).",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/pages.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 50 },
          { name: "published_status", type: "string", description: "published, unpublished, any" },
          { name: "title", type: "string", description: "Filter by title" },
          { name: "fields", type: "string", description: "Comma-separated fields" },
        ]),
        aiUsageHint: "List all store pages. Use to audit existing pages before creating new ones.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", published_status: "published" }),
      },
      {
        name: "create_page",
        displayName: "Create Page",
        description: "Create a new store page (About Us, FAQ, Shipping Policy, Privacy Policy, etc.).",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/pages.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["page"],
          properties: {
            page: {
              type: "object",
              required: ["title", "body_html"],
              properties: {
                title: { type: "string", description: "Page title" },
                body_html: { type: "string", description: "Page content in HTML" },
                handle: { type: "string", description: "URL slug (auto-generated from title if omitted)" },
                published: { type: "boolean", default: true },
                template_suffix: { type: "string", description: "Theme template suffix" },
                metafields: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      namespace: { type: "string" },
                      key: { type: "string" },
                      value: { type: "string" },
                      type: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Create a store page with HTML content. Essential for About Us, FAQ, Shipping Policy, Return Policy pages. Set published=true to make it live.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          page: {
            title: "About Us",
            body_html: "<h1>Our Story</h1><p>We are a passionate team dedicated to bringing you the finest products...</p>",
            handle: "about-us",
            published: true,
          },
        }),
      },
      {
        name: "update_page",
        displayName: "Update Page",
        description: "Update an existing store page's content, title, or published status.",
        method: "PUT" as const,
        path: "{instanceUrl}/admin/api/2024-01/pages/{page_id}.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "page_id", type: "number", required: true, description: "Page ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["page"],
          properties: {
            page: {
              type: "object",
              properties: {
                title: { type: "string" },
                body_html: { type: "string" },
                published: { type: "boolean" },
                handle: { type: "string" },
              },
            },
          },
        }),
        aiUsageHint: "Update a page's content. Use to revise About Us, Policy pages etc. Only send fields you want to change.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", page_id: 131092082, page: { published: true } }),
      },

      // ─── BLOGS & ARTICLES ────────────────────────────────────────────────────
      {
        name: "list_blogs",
        displayName: "List Blogs",
        description: "List all blogs in the store (a store can have multiple blogs).",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/blogs.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        aiUsageHint: "List blogs to get blog IDs before creating articles. Most stores have one main 'News' blog.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },
      {
        name: "create_blog",
        displayName: "Create Blog",
        description: "Create a new blog section in the store.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/blogs.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["blog"],
          properties: {
            blog: {
              type: "object",
              required: ["title"],
              properties: {
                title: { type: "string" },
                commentable: { type: "string", description: "no, moderate, yes" },
                handle: { type: "string" },
              },
            },
          },
        }),
        aiUsageHint: "Create a new blog (e.g. 'News', 'Style Guide', 'Tutorials'). Get the blog ID to create articles under it.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", blog: { title: "Style Guide", commentable: "moderate" } }),
      },
      {
        name: "create_article",
        displayName: "Create Blog Article",
        description: "Create a new article in a blog. Use for SEO content, product guides, brand storytelling, and announcements.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/blogs/{blog_id}/articles.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "blog_id", type: "number", required: true, description: "Blog ID from list_blogs" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["article"],
          properties: {
            article: {
              type: "object",
              required: ["title", "body_html"],
              properties: {
                title: { type: "string" },
                body_html: { type: "string", description: "Article body in HTML" },
                author: { type: "string" },
                tags: { type: "string", description: "Comma-separated tags" },
                published: { type: "boolean", default: true },
                published_at: { type: "string", description: "ISO 8601 publish date/time" },
                summary_html: { type: "string", description: "Short excerpt shown in blog list" },
                handle: { type: "string", description: "URL slug" },
                image: {
                  type: "object",
                  properties: {
                    src: { type: "string", description: "Hero image URL" },
                    alt: { type: "string" },
                  },
                },
                metafields: { type: "array", items: { type: "object" } },
              },
            },
          },
        }),
        aiUsageHint: "Create a blog article for SEO or content marketing. Get blog_id from list_blogs first. Always set author and tags. Use summary_html for the excerpt.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          blog_id: 241253187,
          article: {
            title: "How to Style Your New Summer Collection",
            author: "Arpit Dhamija",
            body_html: "<h2>Introduction</h2><p>Summer is here and we've got the perfect looks...</p>",
            summary_html: "Discover the top styling tips for our new summer arrivals.",
            tags: "style, summer, tips",
            published: true,
          },
        }),
      },
      {
        name: "list_articles",
        displayName: "List Blog Articles",
        description: "List articles in a blog.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/blogs/{blog_id}/articles.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "blog_id", type: "number", required: true, description: "Blog ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 50 },
          { name: "published_status", type: "string", description: "published, unpublished, any" },
          { name: "fields", type: "string" },
        ]),
        aiUsageHint: "List articles in a blog. Use to audit existing content before creating new articles.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", blog_id: 241253187, published_status: "published" }),
      },

      // ─── NAVIGATION / MENUS ──────────────────────────────────────────────────
      {
        name: "get_shop_navigation",
        displayName: "Get Navigation Menus",
        description: "Retrieve store navigation menus (main-menu, footer) with all links.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/menus.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        aiUsageHint: "Get all navigation menus. Returns handles like 'main-menu' and 'footer' with their link trees.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },

      // ─── THEMES ──────────────────────────────────────────────────────────────
      {
        name: "list_themes",
        displayName: "List Themes",
        description: "List all installed themes in the store. Identifies the current active (main) theme.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/themes.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        aiUsageHint: "List themes to find the active theme ID. role='main' is the live theme. Needed before editing theme assets.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },
      {
        name: "get_theme_asset",
        displayName: "Get Theme Asset",
        description: "Get the content of a specific theme file (template, section, snippet, CSS, JS).",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/themes/{theme_id}/assets.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "theme_id", type: "number", required: true, description: "Theme ID from list_themes" },
        ]),
        queryParams: JSON.stringify([
          { name: "asset[key]", type: "string", required: true, description: "Asset path e.g. templates/index.liquid, sections/header.liquid, assets/theme.css" },
        ]),
        aiUsageHint: "Read a theme file's source code. Use list_theme_assets first to find valid asset keys. Common keys: templates/index.liquid, sections/header.liquid, layout/theme.liquid.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", theme_id: 828155753, "asset[key]": "templates/index.liquid" }),
      },
      {
        name: "list_theme_assets",
        displayName: "List Theme Assets",
        description: "List all files in a theme (templates, sections, snippets, CSS, JS, images).",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/themes/{theme_id}/assets.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "theme_id", type: "number", required: true, description: "Theme ID" },
        ]),
        aiUsageHint: "List all theme assets/files. Returns keys like sections/header.liquid, assets/theme.css. Call this before get_theme_asset or update_theme_asset.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", theme_id: 828155753 }),
      },
      {
        name: "update_theme_asset",
        displayName: "Update Theme Asset",
        description: "Write or update a theme file (Liquid template, CSS, JS, JSON config). Use with care — changes go live immediately on the main theme.",
        method: "PUT" as const,
        path: "{instanceUrl}/admin/api/2024-01/themes/{theme_id}/assets.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "theme_id", type: "number", required: true, description: "Theme ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["asset"],
          properties: {
            asset: {
              type: "object",
              required: ["key"],
              properties: {
                key: { type: "string", description: "Asset path e.g. sections/announcement-bar.liquid" },
                value: { type: "string", description: "Full file content as string (for text files)" },
                src: { type: "string", description: "Source URL to copy from (for binary files)" },
                attachment: { type: "string", description: "Base64-encoded content (for binary files)" },
              },
            },
          },
        }),
        aiUsageHint: "CAUTION: Edits live theme immediately. Always read get_theme_asset first, make targeted changes. Use for Liquid templates, CSS overrides, JSON section configs. Prefer modifying theme settings via theme.liquid or config/settings_data.json.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          theme_id: 828155753,
          asset: {
            key: "assets/custom.css",
            value: "/* Custom styles */\n.hero-banner { background-color: #1a1a2e; }",
          },
        }),
      },
      {
        name: "get_theme_settings",
        displayName: "Get Theme Settings",
        description: "Read the current theme settings data (colors, fonts, layout config) from config/settings_data.json.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/themes/{theme_id}/assets.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "theme_id", type: "number", required: true, description: "Theme ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "asset[key]", type: "string", default: "config/settings_data.json", description: "Always use config/settings_data.json for theme settings" },
        ]),
        aiUsageHint: "Get theme settings (brand colors, fonts, layout options). Returns JSON with current and default values. Modify and PUT back to change theme appearance.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", theme_id: 828155753, "asset[key]": "config/settings_data.json" }),
      },

      // ─── STORE / SHOP INFO ──────────────────────────────────────────────────
      {
        name: "get_shop_info",
        displayName: "Get Shop Info",
        description: "Get store details: name, email, currency, timezone, address, plan, domains, and enabled countries.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/shop.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        aiUsageHint: "Get store configuration and metadata. Always call this first when starting a new store task — it tells you currency, timezone, plan, and primary domain.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },
      {
        name: "list_shipping_zones",
        displayName: "List Shipping Zones",
        description: "List all shipping zones and their rates (price-based, weight-based, carrier rates).",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/shipping_zones.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        aiUsageHint: "Get all shipping zones and rates. Use to audit shipping configuration.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },

      // ─── DISCOUNTS & PRICE RULES ─────────────────────────────────────────────
      {
        name: "create_price_rule",
        displayName: "Create Price Rule",
        description: "Create a discount rule (percentage off, fixed amount, free shipping, buy X get Y). Price rules are the basis for discount codes.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/price_rules.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["price_rule"],
          properties: {
            price_rule: {
              type: "object",
              required: ["title", "target_type", "target_selection", "allocation_method", "value_type", "value", "customer_selection", "starts_at"],
              properties: {
                title: { type: "string", description: "Internal name for the rule" },
                target_type: { type: "string", description: "line_item or shipping_line" },
                target_selection: { type: "string", description: "all or entitled (specific products/collections)" },
                allocation_method: { type: "string", description: "across (spread discount) or each (per item)" },
                value_type: { type: "string", description: "fixed_amount or percentage" },
                value: { type: "string", description: "Negative number: -10.0 for $10 off or -15.0 for 15% off" },
                customer_selection: { type: "string", description: "all or prerequisite" },
                starts_at: { type: "string", description: "ISO 8601 start date" },
                ends_at: { type: "string", description: "ISO 8601 end date (optional)" },
                usage_limit: { type: "number", description: "Max total redemptions (null = unlimited)" },
                once_per_customer: { type: "boolean" },
                prerequisite_subtotal_range: {
                  type: "object",
                  properties: { greater_than_or_equal_to: { type: "string", description: "Min order value to qualify" } },
                },
                entitled_product_ids: { type: "array", items: { type: "number" } },
                entitled_collection_ids: { type: "array", items: { type: "number" } },
              },
            },
          },
        }),
        aiUsageHint: "Create a discount rule. Then create a discount_code with the rule's ID. For 20% off: value_type='percentage', value='-20.0'. For $10 off: value_type='fixed_amount', value='-10.0'. For free shipping: target_type='shipping_line', value='-100.0', value_type='percentage'.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          price_rule: {
            title: "LAUNCH20",
            target_type: "line_item",
            target_selection: "all",
            allocation_method: "across",
            value_type: "percentage",
            value: "-20.0",
            customer_selection: "all",
            starts_at: "2024-01-01T00:00:00Z",
            usage_limit: 500,
            once_per_customer: true,
          },
        }),
      },
      {
        name: "create_discount_code",
        displayName: "Create Discount Code",
        description: "Create a discount code (coupon) attached to a price rule. Customers enter this at checkout.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/price_rules/{price_rule_id}/discount_codes.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "price_rule_id", type: "number", required: true, description: "Price rule ID from create_price_rule" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["discount_code"],
          properties: {
            discount_code: {
              type: "object",
              required: ["code"],
              properties: {
                code: { type: "string", description: "The coupon code customers enter (e.g. SAVE20)" },
              },
            },
          },
        }),
        aiUsageHint: "Create a discount code after creating a price_rule. The code is what customers type at checkout. Create price_rule first to get price_rule_id.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          price_rule_id: 507328175,
          discount_code: { code: "LAUNCH20" },
        }),
      },
      {
        name: "list_price_rules",
        displayName: "List Price Rules",
        description: "List all discount rules in the store.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/price_rules.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 50 },
          { name: "starts_at_min", type: "string", description: "Filter by start date" },
          { name: "ends_at_max", type: "string", description: "Filter by end date" },
        ]),
        aiUsageHint: "List all discount rules. Use to find existing discounts before creating duplicates.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", limit: 50 }),
      },

      // ─── FULFILLMENTS ────────────────────────────────────────────────────────
      {
        name: "create_fulfillment",
        displayName: "Create Fulfillment",
        description: "Fulfill one or more line items in an order. Marks items as shipped and can send tracking info to the customer.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/orders/{order_id}/fulfillments.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "order_id", type: "number", required: true, description: "Order ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["fulfillment"],
          properties: {
            fulfillment: {
              type: "object",
              required: ["location_id"],
              properties: {
                location_id: { type: "number", description: "Location fulfilling the order" },
                tracking_number: { type: "string", description: "Carrier tracking number" },
                tracking_company: { type: "string", description: "Carrier name (UPS, FedEx, USPS, DHL, etc.)" },
                tracking_url: { type: "string", description: "Direct tracking URL" },
                notify_customer: { type: "boolean", default: true, description: "Send shipping notification email" },
                line_items: {
                  type: "array",
                  description: "Specific line items to fulfill (omit to fulfill all)",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "number", description: "Line item ID" },
                      quantity: { type: "number" },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Mark order items as shipped. Always include location_id. Set notify_customer=true to send tracking email. tracking_company + tracking_number enables customer order tracking.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          order_id: 9876543210,
          fulfillment: {
            location_id: 655441491,
            tracking_number: "1Z999AA10123456784",
            tracking_company: "UPS",
            notify_customer: true,
          },
        }),
      },
      {
        name: "cancel_order",
        displayName: "Cancel Order",
        description: "Cancel an order. Optionally restock items, refund the customer, and notify them.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/orders/{order_id}/cancel.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "order_id", type: "number", required: true, description: "Order ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            reason: { type: "string", description: "customer, fraud, inventory, declined, other" },
            email: { type: "boolean", description: "Send cancellation email to customer" },
            refund: { type: "boolean", description: "Issue a refund if payment was made" },
            restock: { type: "boolean", description: "Return items to inventory" },
          },
        }),
        aiUsageHint: "Cancel an order. Always set reason. Set restock=true to return items to stock. Set email=true to notify customer.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", order_id: 9876543210, reason: "customer", email: true, restock: true }),
      },
      {
        name: "create_refund",
        displayName: "Create Refund",
        description: "Issue a refund for an order. Can be full or partial, with or without restocking.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/orders/{order_id}/refunds.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "order_id", type: "number", required: true, description: "Order ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["refund"],
          properties: {
            refund: {
              type: "object",
              properties: {
                notify: { type: "boolean", description: "Send refund notification email" },
                note: { type: "string", description: "Internal note for the refund" },
                shipping: {
                  type: "object",
                  properties: {
                    full_refund: { type: "boolean" },
                    amount: { type: "string" },
                  },
                },
                refund_line_items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      line_item_id: { type: "number" },
                      quantity: { type: "number" },
                      restock_type: { type: "string", description: "no_restock, cancel, return, legacy" },
                      location_id: { type: "number" },
                    },
                  },
                },
                transactions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      parent_id: { type: "number", description: "Original transaction ID" },
                      amount: { type: "string", description: "Amount to refund" },
                      kind: { type: "string", description: "refund" },
                      gateway: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Issue a refund. Use calculate_refund endpoint first if needed. For full refund: include all refund_line_items. transactions must reference parent_id (original payment transaction).",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          order_id: 9876543210,
          refund: {
            notify: true,
            note: "Customer requested refund",
            refund_line_items: [{ line_item_id: 518995019, quantity: 1, restock_type: "return", location_id: 655441491 }],
            transactions: [{ parent_id: 1068278449, amount: "29.99", kind: "refund", gateway: "shopify_payments" }],
          },
        }),
      },

      // ─── METAFIELDS ──────────────────────────────────────────────────────────
      {
        name: "create_metafield",
        displayName: "Create Metafield",
        description: "Add custom metadata to any Shopify resource (product, variant, collection, page, shop). Used for custom attributes, structured data, and app data.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/metafields.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["metafield"],
          properties: {
            metafield: {
              type: "object",
              required: ["namespace", "key", "value", "type", "owner_id", "owner_resource"],
              properties: {
                namespace: { type: "string", description: "Custom namespace to group metafields (e.g. 'custom', 'product_info')" },
                key: { type: "string", description: "Metafield key within namespace" },
                value: { type: "string", description: "Metafield value (always string)" },
                type: { type: "string", description: "single_line_text_field, multi_line_text_field, integer, boolean, json, url, date, date_time, color, weight, volume, dimension, rating, file_reference, product_reference, variant_reference, page_reference" },
                owner_id: { type: "number", description: "ID of the resource to attach to" },
                owner_resource: { type: "string", description: "product, variant, collection, page, shop, customer, order, blog, article" },
              },
            },
          },
        }),
        aiUsageHint: "Add custom data to any resource. Common uses: product.custom.material, product.custom.care_instructions, shop.custom.featured_collection_id. Type 'json' for complex data.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          metafield: {
            namespace: "custom",
            key: "care_instructions",
            value: "Machine wash cold, tumble dry low",
            type: "single_line_text_field",
            owner_id: 1234567890,
            owner_resource: "product",
          },
        }),
      },
      {
        name: "list_metafields",
        displayName: "List Metafields",
        description: "List all metafields attached to a specific resource.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/metafields.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        queryParams: JSON.stringify([
          { name: "owner_resource", type: "string", required: true, description: "product, variant, collection, page, shop, customer, order" },
          { name: "owner_id", type: "number", description: "Resource ID (omit for shop-level metafields)" },
          { name: "namespace", type: "string", description: "Filter by namespace" },
          { name: "key", type: "string", description: "Filter by key" },
        ]),
        aiUsageHint: "List metafields for a resource. Use owner_resource + owner_id to scope results. Useful for reading existing custom attributes before writing.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", owner_resource: "product", owner_id: 1234567890 }),
      },

      // ─── REDIRECTS ───────────────────────────────────────────────────────────
      {
        name: "create_redirect",
        displayName: "Create URL Redirect",
        description: "Create a URL redirect in the store (301 redirect from an old URL to a new one). Essential for SEO when restructuring navigation or renaming products.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/redirects.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["redirect"],
          properties: {
            redirect: {
              type: "object",
              required: ["path", "target"],
              properties: {
                path: { type: "string", description: "Source path (e.g. /old-collection)" },
                target: { type: "string", description: "Destination path or full URL (e.g. /collections/new-collection)" },
              },
            },
          },
        }),
        aiUsageHint: "Create a 301 redirect. Use for migrated pages, renamed products/collections. Path is the old URL, target is where it should redirect.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", redirect: { path: "/old-page", target: "/pages/new-page" } }),
      },
      {
        name: "list_redirects",
        displayName: "List Redirects",
        description: "List all URL redirects configured in the store.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/redirects.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 50 },
          { name: "path", type: "string", description: "Filter by source path" },
          { name: "target", type: "string", description: "Filter by target" },
        ]),
        aiUsageHint: "List all redirects. Use before creating new redirects to avoid duplicates.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", limit: 50 }),
      },

      // ─── SCRIPT TAGS ─────────────────────────────────────────────────────────
      {
        name: "create_script_tag",
        displayName: "Create Script Tag",
        description: "Inject a JavaScript file into all storefront pages. Used for analytics, chat widgets, third-party integrations.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/script_tags.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["script_tag"],
          properties: {
            script_tag: {
              type: "object",
              required: ["event", "src"],
              properties: {
                event: { type: "string", description: "Always 'onload'" },
                src: { type: "string", description: "Public URL of the JavaScript file" },
                display_scope: { type: "string", description: "online_store, order_status, all (default: all)" },
                cache: { type: "boolean", description: "Whether to cache the script (default: false)" },
              },
            },
          },
        }),
        aiUsageHint: "Inject a JS script into the storefront. Use for Google Analytics, Facebook Pixel, Hotjar, chat widgets. event must be 'onload'. src must be a publicly accessible HTTPS URL.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          script_tag: { event: "onload", src: "https://cdn.example.com/analytics.js", display_scope: "all" },
        }),
      },
      {
        name: "list_script_tags",
        displayName: "List Script Tags",
        description: "List all script tags currently injected into the store.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/script_tags.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        aiUsageHint: "List all injected scripts. Check before adding new scripts to avoid duplicates.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },

      // ─── WEBHOOKS ────────────────────────────────────────────────────────────
      {
        name: "create_webhook",
        displayName: "Create Webhook",
        description: "Register a webhook to receive real-time event notifications (orders, products, customers, payments).",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/webhooks.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["webhook"],
          properties: {
            webhook: {
              type: "object",
              required: ["topic", "address", "format"],
              properties: {
                topic: {
                  type: "string",
                  description: "Event topic: orders/created, orders/updated, orders/paid, orders/cancelled, orders/fulfilled, products/create, products/update, products/delete, customers/create, customers/update, inventory_levels/update, app/uninstalled, checkouts/create, checkouts/update, refunds/create, fulfillments/create",
                },
                address: { type: "string", description: "HTTPS endpoint URL to receive webhook POST requests" },
                format: { type: "string", description: "json or xml (use json)" },
                fields: { type: "array", items: { type: "string" }, description: "Limit payload to specific fields (optional)" },
              },
            },
          },
        }),
        aiUsageHint: "Register a webhook for real-time events. address must be an HTTPS URL. Common: orders/created for new orders, products/update to sync catalog, inventory_levels/update for stock changes.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          webhook: {
            topic: "orders/created",
            address: "https://your-app.com/webhooks/shopify/orders",
            format: "json",
          },
        }),
      },
      {
        name: "list_webhooks",
        displayName: "List Webhooks",
        description: "List all webhooks registered for the store.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/webhooks.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        queryParams: JSON.stringify([
          { name: "topic", type: "string", description: "Filter by topic" },
          { name: "limit", type: "number", default: 50 },
        ]),
        aiUsageHint: "List all registered webhooks. Check for existing webhooks before creating new ones to avoid duplicates.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },

      // ─── SMART COLLECTIONS ───────────────────────────────────────────────────
      {
        name: "create_smart_collection",
        displayName: "Create Smart Collection",
        description: "Create an automated collection that auto-populates based on product rules (tag, vendor, type, price, etc.).",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/smart_collections.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["smart_collection"],
          properties: {
            smart_collection: {
              type: "object",
              required: ["title", "rules"],
              properties: {
                title: { type: "string" },
                body_html: { type: "string" },
                published: { type: "boolean", default: true },
                sort_order: { type: "string" },
                disjunctive: { type: "boolean", description: "true = any rule matches (OR), false = all rules match (AND)" },
                rules: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["column", "relation", "condition"],
                    properties: {
                      column: { type: "string", description: "tag, title, type, vendor, variant_price, variant_compare_at_price, variant_weight, variant_inventory, variant_title, is_price_reduced" },
                      relation: { type: "string", description: "equals, not_equals, greater_than, less_than, starts_with, ends_with, contains, not_contains" },
                      condition: { type: "string", description: "Value to match against" },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Create a dynamic collection with automated rules. Example: all products tagged 'sale', or all products from a specific vendor under $50. Use disjunctive=false for AND logic (all rules must match).",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          smart_collection: {
            title: "On Sale",
            body_html: "<p>Items currently on sale.</p>",
            published: true,
            sort_order: "best-selling",
            disjunctive: false,
            rules: [{ column: "is_price_reduced", relation: "equals", condition: "true" }],
          },
        }),
      },

      // ─── CUSTOMERS (ADDITIONAL) ──────────────────────────────────────────────
      {
        name: "create_customer",
        displayName: "Create Customer",
        description: "Create a new customer account in the store.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/customers.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["customer"],
          properties: {
            customer: {
              type: "object",
              required: ["email"],
              properties: {
                email: { type: "string" },
                first_name: { type: "string" },
                last_name: { type: "string" },
                phone: { type: "string" },
                tags: { type: "string", description: "Comma-separated tags" },
                accepts_marketing: { type: "boolean" },
                send_email_welcome: { type: "boolean", default: false },
                addresses: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      first_name: { type: "string" },
                      last_name: { type: "string" },
                      address1: { type: "string" },
                      city: { type: "string" },
                      province: { type: "string" },
                      country: { type: "string" },
                      zip: { type: "string" },
                      phone: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Create a customer account. Set accepts_marketing=true to subscribe to email marketing. Set send_email_welcome=false to avoid sending welcome email for bulk imports.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://myshop.myshopify.com",
          customer: { email: "jane@example.com", first_name: "Jane", last_name: "Doe", accepts_marketing: true, send_email_welcome: false },
        }),
      },
      {
        name: "update_customer",
        displayName: "Update Customer",
        description: "Update customer details, tags, or marketing opt-in status.",
        method: "PUT" as const,
        path: "{instanceUrl}/admin/api/2024-01/customers/{customer_id}.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "customer_id", type: "number", required: true, description: "Customer ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["customer"],
          properties: {
            customer: {
              type: "object",
              properties: {
                first_name: { type: "string" },
                last_name: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                tags: { type: "string" },
                accepts_marketing: { type: "boolean" },
                note: { type: "string", description: "Internal note about the customer" },
              },
            },
          },
        }),
        aiUsageHint: "Update customer data. Only send changed fields. Use tags to segment customers (e.g. 'vip', 'wholesale').",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", customer_id: 207119551, customer: { tags: "vip, returning", accepts_marketing: true } }),
      },

      // ── Analytics ────────────────────────────────────────────────────────────
      {
        name: "get_reports",
        displayName: "Get Reports",
        description: "Retrieve analytics reports from the Shopify store (sales, sessions, conversions).",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/reports.json",
        pathParams: JSON.stringify([{ name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" }]),
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 50, description: "Results per page (max 250)" },
          { name: "since_id", type: "number", description: "Return reports after this ID" },
          { name: "fields", type: "string", description: "Comma-separated fields to return" },
        ]),
        aiUsageHint: "List available analytics reports. Use to find report IDs for querying specific sales/session data.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", limit: 50 }),
      },
      {
        name: "get_report",
        displayName: "Get Report",
        description: "Get a specific analytics report by ID.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/reports/{report_id}.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "report_id", type: "number", required: true, description: "Report ID" },
        ]),
        queryParams: JSON.stringify([{ name: "fields", type: "string", description: "Comma-separated fields to return" }]),
        aiUsageHint: "Fetch a specific analytics report by ID. Use get_reports first to find valid IDs.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", report_id: 517154478 }),
      },

      // ── Files ─────────────────────────────────────────────────────────────────
      {
        name: "list_files",
        displayName: "List Files",
        description: "List files uploaded to the Shopify store (images, videos, generic files).",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/graphql.json",
        pathParams: JSON.stringify([{ name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" }]),
        bodySchema: JSON.stringify({
          query: "{ files(first: 50) { edges { node { id alt createdAt ... on MediaImage { image { url width height } } ... on GenericFile { url } } } } }",
        }),
        aiUsageHint: "List store files via GraphQL. Returns images, videos, and generic files with their URLs.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },
      {
        name: "upload_file_by_url",
        displayName: "Upload File by URL",
        description: "Upload a file to Shopify from an external URL (image, video, or generic file).",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/graphql.json",
        pathParams: JSON.stringify([{ name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" }]),
        bodySchema: JSON.stringify({
          query: "mutation fileCreate($files: [FileCreateInput!]!) { fileCreate(files: $files) { files { id alt } userErrors { field message } } }",
          variables: { files: [{ originalSource: "https://example.com/image.jpg", alt: "Product image", contentType: "IMAGE" }] },
        }),
        aiUsageHint: "Upload a file from an external URL. contentType can be IMAGE, VIDEO, or GENERIC_FILE. Returns the Shopify file ID.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },

      // ── Legal Policies ────────────────────────────────────────────────────────
      {
        name: "get_policies",
        displayName: "Get Shop Policies",
        description: "Retrieve all shop policies (refund, privacy, TOS, shipping, subscription).",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/policies.json",
        pathParams: JSON.stringify([{ name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" }]),
        aiUsageHint: "Fetch all shop legal policies. Returns refund_policy, privacy_policy, terms_of_service, shipping_policy, subscription_policy.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },

      // ── Markets ───────────────────────────────────────────────────────────────
      {
        name: "list_markets",
        displayName: "List Markets",
        description: "List all markets configured for international selling.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/markets.json",
        pathParams: JSON.stringify([{ name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" }]),
        aiUsageHint: "List all Shopify Markets (international selling regions). Each market can have its own pricing, domains, and currency.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },
      {
        name: "create_market",
        displayName: "Create Market",
        description: "Create a new market for international selling with specific countries/regions.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/markets.json",
        pathParams: JSON.stringify([{ name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" }]),
        bodySchema: JSON.stringify({
          market: {
            name: "Europe",
            regions: [{ code: "DE", type: "country" }, { code: "FR", type: "country" }],
            enabled: true,
          },
        }),
        aiUsageHint: "Create a new selling market. Specify countries/regions by ISO code. Set enabled: true to activate immediately.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },
      {
        name: "update_market",
        displayName: "Update Market",
        description: "Update a market's name, enabled status, or regions.",
        method: "PUT" as const,
        path: "{instanceUrl}/admin/api/2024-01/markets/{market_id}.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "market_id", type: "number", required: true, description: "Market ID" },
        ]),
        bodySchema: JSON.stringify({ market: { enabled: true, name: "Europe" } }),
        aiUsageHint: "Enable/disable a market or update its name. Use list_markets to find market IDs.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", market_id: 123 }),
      },

      // ── Order Edits ───────────────────────────────────────────────────────────
      {
        name: "begin_order_edit",
        displayName: "Begin Order Edit",
        description: "Begin an order edit session to modify a confirmed order.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/orders/{order_id}/edits.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "order_id", type: "number", required: true, description: "Order ID to edit" },
        ]),
        bodySchema: JSON.stringify({ order_edit: { notify: true, reason: "Customer requested change", note: "Updating quantity per customer request" } }),
        aiUsageHint: "Start an order edit session. Returns an order_edit object with a calculated_order you can modify. Always commit or abort when done.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", order_id: 450789469 }),
      },
      {
        name: "commit_order_edit",
        displayName: "Commit Order Edit",
        description: "Commit a completed order edit, applying changes to the order.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/orders/{order_id}/edits/{calculated_order_id}/commit.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "order_id", type: "number", required: true, description: "Order ID" },
          { name: "calculated_order_id", type: "number", required: true, description: "Calculated order ID from begin_order_edit" },
        ]),
        bodySchema: JSON.stringify({ order_edit: { notify: true, staff_note: "Changes applied per customer request" } }),
        aiUsageHint: "Finalize and apply order edits. Must call begin_order_edit first to get the calculated_order_id.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", order_id: 450789469, calculated_order_id: 12345 }),
      },

      // ── Payment Terms ─────────────────────────────────────────────────────────
      {
        name: "create_payment_terms",
        displayName: "Create Payment Terms",
        description: "Create payment terms for an order (NET_30, NET_60, RECEIPT, FULFILLMENT, FIXED).",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/payment_terms.json",
        pathParams: JSON.stringify([{ name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" }]),
        bodySchema: JSON.stringify({
          payment_terms: {
            payment_terms_name: "NET_30",
            payment_terms_type: "NET",
            due_in_days: 30,
            order_id: 450789469,
          },
        }),
        aiUsageHint: "Set B2B payment terms on an order. Types: NET (due in X days), RECEIPT (due on receipt), FULFILLMENT, FIXED (specific date).",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },

      // ── Product Listings (Sales Channels) ────────────────────────────────────
      {
        name: "list_product_listings",
        displayName: "List Product Listings",
        description: "List products published to a sales channel (e.g. Facebook, Google).",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/product_listings.json",
        pathParams: JSON.stringify([{ name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" }]),
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 50, description: "Results per page (max 250)" },
          { name: "product_ids", type: "string", description: "Comma-separated product IDs to filter" },
        ]),
        aiUsageHint: "List products published to a sales channel. Used for multi-channel selling (Facebook Shop, Google Shopping).",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", limit: 50 }),
      },
      {
        name: "publish_product_listing",
        displayName: "Publish Product to Channel",
        description: "Publish a product to a sales channel by creating a product listing.",
        method: "PUT" as const,
        path: "{instanceUrl}/admin/api/2024-01/product_listings/{product_id}.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "product_id", type: "number", required: true, description: "Product ID to publish" },
        ]),
        bodySchema: JSON.stringify({ product_listing: { product_id: 921728736 } }),
        aiUsageHint: "Publish a product to a sales channel. The channel is determined by the app's API credentials.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", product_id: 921728736 }),
      },

      // ── Purchase Options / Selling Plans (Subscriptions) ─────────────────────
      {
        name: "list_selling_plan_groups",
        displayName: "List Selling Plan Groups",
        description: "List selling plan groups (subscription plans) attached to the store.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/selling_plan_groups.json",
        pathParams: JSON.stringify([{ name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" }]),
        queryParams: JSON.stringify([{ name: "limit", type: "number", default: 50 }]),
        aiUsageHint: "List subscription/selling plan groups. These define recurring purchase options (weekly, monthly delivery).",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },
      {
        name: "create_selling_plan_group",
        displayName: "Create Selling Plan Group",
        description: "Create a selling plan group (subscription option) with recurring billing plans.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/selling_plan_groups.json",
        pathParams: JSON.stringify([{ name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" }]),
        bodySchema: JSON.stringify({
          selling_plan_group: {
            name: "Subscribe & Save",
            merchant_code: "subscribe-and-save",
            options: [{ name: "Delivery frequency" }],
            selling_plans: [
              {
                name: "Delivered every month",
                billing_policy: { interval: "MONTH", interval_count: 1, recurring_cycle_limit: 12 },
                delivery_policy: { interval: "MONTH", interval_count: 1 },
                pricing_policies: [{ adjustment_type: "PERCENTAGE", adjustment_value: { percentage: 10 } }],
              },
            ],
          },
        }),
        aiUsageHint: "Create a subscription plan group. Selling plans define the billing interval, delivery frequency, and discount percentage for subscriptions.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },

      // ── Returns ───────────────────────────────────────────────────────────────
      {
        name: "list_returns",
        displayName: "List Returns",
        description: "List returns for a specific order.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/orders/{order_id}/returns.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "order_id", type: "number", required: true, description: "Order ID" },
        ]),
        aiUsageHint: "List all returns for a given order. Use to check return status and items.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", order_id: 450789469 }),
      },
      {
        name: "create_return",
        displayName: "Create Return",
        description: "Create a return for an order, specifying which line items to return.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/orders/{order_id}/returns.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "order_id", type: "number", required: true, description: "Order ID" },
        ]),
        bodySchema: JSON.stringify({
          return: {
            return_line_items: [
              { fulfillment_line_item_id: 123, quantity: 1, return_reason: "UNKNOWN", customer_note: "Wrong size" },
            ],
          },
        }),
        aiUsageHint: "Initiate a return for one or more items. return_reason options: SIZE_TOO_SMALL, SIZE_TOO_LARGE, UNWANTED, NOT_AS_DESCRIBED, DAMAGED, WRONG_ITEM, UNKNOWN.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", order_id: 450789469 }),
      },

      // ── Marketing Events ──────────────────────────────────────────────────────
      {
        name: "list_marketing_events",
        displayName: "List Marketing Events",
        description: "List marketing events (ad campaigns, email sends, social posts) tracked in Shopify.",
        method: "GET" as const,
        path: "{instanceUrl}/admin/api/2024-01/marketing_events.json",
        pathParams: JSON.stringify([{ name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" }]),
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 50 },
          { name: "offset", type: "number", description: "Pagination offset" },
        ]),
        aiUsageHint: "List marketing events (ad campaigns, emails). Used to track attribution and marketing spend across channels.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", limit: 50 }),
      },
      {
        name: "create_marketing_event",
        displayName: "Create Marketing Event",
        description: "Create a marketing event to track an ad campaign, email send, or social post in Shopify analytics.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/marketing_events.json",
        pathParams: JSON.stringify([{ name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" }]),
        bodySchema: JSON.stringify({
          marketing_event: {
            event_type: "ad",
            marketing_channel: "social",
            paid: true,
            referring_domain: "facebook.com",
            budget: "10.00",
            currency: "USD",
            budget_type: "daily",
            started_at: "2024-01-01T00:00:00Z",
            UTM_parameters: { utm_campaign: "spring_sale", utm_source: "facebook", utm_medium: "paid" },
          },
        }),
        aiUsageHint: "Track a marketing campaign in Shopify. event_type: ad, post, message, retargeting, transactional, affiliate, loyalty, newsletter, abandoned_cart. Use UTM_parameters for attribution.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },

      // ── Privacy / GDPR ────────────────────────────────────────────────────────
      {
        name: "request_customer_data_erasure",
        displayName: "Request Customer Data Erasure",
        description: "Submit a GDPR customer data erasure request for a specific customer.",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/customers/{customer_id}/gdpr_request.json",
        pathParams: JSON.stringify([
          { name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" },
          { name: "customer_id", type: "number", required: true, description: "Customer ID" },
        ]),
        bodySchema: JSON.stringify({ gdpr_request: { type: "erasure" } }),
        aiUsageHint: "Submit a GDPR erasure request to delete a customer's personal data. Required for GDPR/privacy compliance.",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com", customer_id: 207119551 }),
      },

      // ── Product Feeds ─────────────────────────────────────────────────────────
      {
        name: "list_product_feeds",
        displayName: "List Product Feeds",
        description: "List product feeds configured for sales channels (Google, Facebook, etc.).",
        method: "POST" as const,
        path: "{instanceUrl}/admin/api/2024-01/graphql.json",
        pathParams: JSON.stringify([{ name: "instanceUrl", type: "string", required: true, description: "Shopify store URL" }]),
        bodySchema: JSON.stringify({
          query: "{ productFeeds(first: 20) { edges { node { id status country { code } language { locale } } } } }",
        }),
        aiUsageHint: "List product feeds for sales channels via GraphQL. Each feed syncs products to a channel (Google Shopping, Facebook Catalog).",
        exampleArgs: JSON.stringify({ instanceUrl: "https://myshop.myshopify.com" }),
      },
];

const BLUEPRINT_CONFIG = {
  slug: "shopify",
  name: "Shopify",
  description:
    "E-commerce platform. Build and manage a complete Shopify store autonomously. Create products with variants and images, organize collections, write pages and blog content, configure theme assets, set inventory levels, create discounts and promotions, fulfill orders, manage customers, and register webhooks. Full store setup from scratch.",
  category: "E-commerce",
  version: 3,
  status: "active" as const,
  authType: "oauth2" as const,
  authConfig: JSON.stringify({
    clientId: process.env.SHOPIFY_CLIENT_ID || "YOUR_SHOPIFY_CLIENT_ID",
    clientSecret: "OAUTH_SECRET_SHOPIFY",
    authorizeUrl: "https://{shop}.myshopify.com/admin/oauth/authorize",
    tokenUrl: "https://{shop}.myshopify.com/admin/oauth/access_token",
    authHeaderName: "X-Shopify-Access-Token",
    scopes: [
      "read_analytics", "read_customer_events",
      "read_customers", "write_customers",
      "read_price_rules", "write_price_rules",
      "read_discounts", "write_discounts",
      "read_files", "write_files",
      "read_fulfillments", "write_fulfillments",
      "read_inventory", "write_inventory",
      "read_legal_policies", "write_legal_policies",
      "read_locations", "write_locations",
      "read_marketing_events", "write_marketing_events",
      "read_markets", "write_markets",
      "read_order_edits", "write_order_edits",
      "read_orders", "write_orders",
      "read_payment_terms", "write_payment_terms",
      "read_privacy_settings", "write_privacy_settings",
      "read_product_feeds", "write_product_feeds",
      "read_product_listings", "write_product_listings",
      "read_products", "write_products",
      "read_purchase_options", "write_purchase_options",
      "read_returns", "write_returns",
      "read_script_tags", "write_script_tags",
      "read_shipping", "write_shipping",
      "read_content", "write_content",
      "read_themes", "write_themes",
      "read_metafields", "write_metafields",
      "read_redirects", "write_redirects",
    ],
    scopeSeparator: ",",
    tokenEndpointAuth: "body",
  }),
  baseUrl: "https://{shop}.myshopify.com/admin/api/2024-01",
  defaultHeaders: JSON.stringify({ Accept: "application/json", "Content-Type": "application/json" }),
  apiProtocol: "rest" as const,
  sourceType: "manual" as const,
  sourceUrl: "https://shopify.dev/docs/api/admin-rest",
  iconUrl: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
  createdBy: "system",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function insertTools(ctx: any, blueprintId: any, now: number) {
  const toolIds = [];
  for (const tool of SHOPIFY_TOOLS) {
    const toolId = await ctx.db.insert("blueprintTools", {
      ...tool,
      blueprintId,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    toolIds.push(toolId);
  }
  return toolIds;
}

const NEXT_STEPS = [
  "1. Create a custom app in Shopify Admin -> Settings -> Apps -> Develop apps",
  "2. Or create a public app via Shopify Partners dashboard",
  "3. Set redirect URL: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
  "4. Request ALL scopes listed in the file header comments",
  "5. Set SHOPIFY_CLIENT_ID in Convex env vars (API Key)",
  "6. Set OAUTH_SECRET_SHOPIFY in Convex env vars (API Secret Key)",
  "7. Note: Users will need to provide their shop name during connection",
  "8. 77 tools total -- covers full autonomous store setup including analytics, files, markets, returns, subscriptions",
];

/**
 * Migrate existing Shopify blueprint to v2.
 * Deletes old blueprint + all tools, then re-creates with expanded tool set.
 * Run: npx convex run seedShopifyBlueprint:migrate --url https://beloved-squirrel-599.convex.cloud
 */
export const migrate = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "shopify"))
      .first();

    if (!existing) {
      return { message: "No existing Shopify blueprint found. Run default seed export instead." };
    }

    const oldBlueprintId = existing._id;

    // Delete all existing tools
    const oldTools = await ctx.db
      .query("blueprintTools")
      .withIndex("by_blueprint", (q) => q.eq("blueprintId", oldBlueprintId))
      .collect();

    for (const tool of oldTools) {
      await ctx.db.delete(tool._id);
    }
    await ctx.db.delete(oldBlueprintId);

    const now = Date.now();
    const blueprintId = await ctx.db.insert("blueprints", {
      ...BLUEPRINT_CONFIG,
      createdAt: now,
      updatedAt: now,
    });

    const toolIds = await insertTools(ctx, blueprintId, now);

    return {
      message: "Shopify blueprint migrated to v3!",
      blueprintId,
      deletedTools: oldTools.length,
      toolsCreated: toolIds.length,
      nextSteps: NEXT_STEPS,
    };
  },
});

/**
 * Seed Shopify blueprint (first-time only).
 * If blueprint already exists, use migrate instead.
 */
export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "shopify"))
      .first();

    if (existing) {
      return {
        message: "Shopify blueprint already exists -- run seedShopifyBlueprint:migrate to upgrade to v3",
        blueprintId: existing._id,
        status: existing.status,
        version: existing.version,
      };
    }

    const now = Date.now();
    const blueprintId = await ctx.db.insert("blueprints", {
      ...BLUEPRINT_CONFIG,
      createdAt: now,
      updatedAt: now,
    });

    const toolIds = await insertTools(ctx, blueprintId, now);

    return {
      message: "Shopify blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: NEXT_STEPS,
    };
  },
});
