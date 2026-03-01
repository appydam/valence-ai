/**
 * Seed Razorpay integration blueprint
 *
 * Razorpay supports OAuth2 for partner/platform integrations.
 * Note: Razorpay uses array-style scope notation (scope[]=read_write).
 *
 * Usage:
 * npx convex run seedRazorpayBlueprint --url https://beloved-squirrel-599.convex.cloud
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "razorpay"))
      .first();

    if (existing) {
      return { message: "Razorpay blueprint already exists", blueprintId: existing._id };
    }

    const authConfig = {
      clientId: process.env.RAZORPAY_CLIENT_ID || "YOUR_RAZORPAY_CLIENT_ID",
      clientSecret: "OAUTH_SECRET_RAZORPAY",
      authorizeUrl: "https://auth.razorpay.com/authorize",
      tokenUrl: "https://auth.razorpay.com/token",
      scopes: ["read_write"],
      scopeSeparator: "space",
      tokenEndpointAuth: "body",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "razorpay",
      name: "Razorpay",
      description: "Payment gateway — create orders, process payments, issue refunds, and track settlements. India's leading payment platform.",
      category: "finance",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://api.razorpay.com/v1",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      sourceType: "manual",
      sourceUrl: "https://razorpay.com/docs/api/",
      iconUrl: "https://cdn.simpleicons.org/razorpay/0C2451",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "create_order",
        displayName: "Create Order",
        description: "Create a new payment order",
        method: "POST" as const,
        path: "/orders",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["amount", "currency"],
          properties: {
            amount: { type: "number", description: "Amount in paise (e.g. 50000 = ₹500)" },
            currency: { type: "string", description: "Currency code (INR, USD, etc.)", default: "INR" },
            receipt: { type: "string", description: "Your internal order/receipt ID" },
            notes: { type: "object", description: "Key-value pairs for your reference" },
            partial_payment: { type: "boolean", description: "Allow partial payments", default: false },
          },
        }),
        aiUsageHint: "Create a payment order. Amount is in smallest currency unit (paise for INR). 50000 = ₹500.",
        exampleArgs: JSON.stringify({ amount: 50000, currency: "INR", receipt: "order_001" }),
      },
      {
        name: "fetch_payment",
        displayName: "Fetch Payment",
        description: "Get details of a specific payment",
        method: "GET" as const,
        path: "/payments/{payment_id}",
        pathParams: JSON.stringify([
          { name: "payment_id", type: "string", required: true, description: "Payment ID (e.g. pay_xxxxx)" },
        ]),
        aiUsageHint: "Fetch payment details by ID. Returns status, amount, method, email, contact, etc.",
        exampleArgs: JSON.stringify({ payment_id: "pay_FHR9UMhnYKUVL1" }),
      },
      {
        name: "list_payments",
        displayName: "List Payments",
        description: "List all payments with optional filters",
        method: "GET" as const,
        path: "/payments",
        queryParams: JSON.stringify([
          { name: "from", type: "number", description: "Unix timestamp — start of date range" },
          { name: "to", type: "number", description: "Unix timestamp — end of date range" },
          { name: "count", type: "number", description: "Number of results (max 100)", default: 10 },
          { name: "skip", type: "number", description: "Pagination offset", default: 0 },
        ]),
        aiUsageHint: "List recent payments. Use from/to timestamps for date filtering.",
        exampleArgs: JSON.stringify({ count: 20 }),
      },
      {
        name: "create_refund",
        displayName: "Create Refund",
        description: "Create a refund for a captured payment",
        method: "POST" as const,
        path: "/payments/{payment_id}/refund",
        pathParams: JSON.stringify([
          { name: "payment_id", type: "string", required: true, description: "Payment ID to refund" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            amount: { type: "number", description: "Refund amount in paise (partial refund). Omit for full refund." },
            speed: { type: "string", description: "normal or optimum (instant refund)", default: "normal" },
            notes: { type: "object", description: "Key-value pairs for reference" },
            receipt: { type: "string", description: "Refund receipt ID" },
          },
        }),
        aiUsageHint: "Refund a payment. Omit amount for full refund, or specify amount in paise for partial refund.",
        exampleArgs: JSON.stringify({ payment_id: "pay_FHR9UMhnYKUVL1", amount: 10000 }),
      },
      {
        name: "list_settlements",
        displayName: "List Settlements",
        description: "List all settlements",
        method: "GET" as const,
        path: "/settlements",
        queryParams: JSON.stringify([
          { name: "from", type: "number", description: "Unix timestamp start" },
          { name: "to", type: "number", description: "Unix timestamp end" },
          { name: "count", type: "number", default: 10 },
          { name: "skip", type: "number", default: 0 },
        ]),
        aiUsageHint: "List settlements (money transferred to your bank). Filter by date range.",
        exampleArgs: JSON.stringify({ count: 10 }),
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
      message: "Razorpay blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Register as Razorpay Partner at https://dashboard.razorpay.com/",
        "2. Create OAuth application in Partner settings",
        "3. Set redirect URI to: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "4. npx convex env set RAZORPAY_CLIENT_ID '<client_id>' --url https://beloved-squirrel-599.convex.cloud",
        "5. npx convex env set OAUTH_SECRET_RAZORPAY '<client_secret>' --url https://beloved-squirrel-599.convex.cloud",
      ],
    };
  },
});
