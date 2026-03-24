/**
 * Seed AfterShip integration blueprint
 *
 * AfterShip OAuth2 — partner app flow.
 * Auth header: as-access-token for API calls.
 * Token expires in 30 days; refresh token available.
 *
 * Usage:
 * npx convex run seedAfterShipBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "aftership"))
      .first();

    if (existing) {
      return { message: "AfterShip blueprint already exists", blueprintId: existing._id };
    }

    const authConfig = {
      clientId: process.env.AFTERSHIP_CLIENT_ID || "YOUR_AFTERSHIP_CLIENT_ID",
      clientSecret: "OAUTH_SECRET_AFTERSHIP",
      authorizeUrl: "https://accounts.aftership.com/oauth/authorize",
      tokenUrl: "https://accounts.aftership.com/oauth/token",
      scopes: ["tracking"],
      scopeSeparator: "space",
      tokenEndpointAuth: "body",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "aftership",
      name: "AfterShip",
      description: "Track shipments across 1,100+ carriers — create trackings, get delivery status, and monitor shipping performance.",
      category: "e_commerce",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://api.aftership.com",
      defaultHeaders: JSON.stringify({
        "Accept": "application/json",
        "Content-Type": "application/json",
      }),
      sourceType: "manual",
      sourceUrl: "https://www.aftership.com/docs/tracking",
      iconUrl: "https://cdn.simpleicons.org/aftership/000000",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "create_tracking",
        displayName: "Create Tracking",
        description: "Create a new shipment tracking by providing a tracking number and carrier slug",
        method: "POST" as const,
        path: "/tracking/2024-10/trackings",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["tracking_number", "slug"],
          properties: {
            tracking_number: { type: "string", description: "The tracking number from the carrier" },
            slug: { type: "string", description: "Carrier slug (e.g. fedex, ups, dhl, usps)" },
            title: { type: "string", description: "Title for the tracking (e.g. order ID)" },
            order_id: { type: "string", description: "Associated order ID" },
            customer_name: { type: "string", description: "Customer name for the shipment" },
          },
        }),
        aiUsageHint: "Create a tracking. You need tracking_number and slug (carrier name like fedex, ups, dhl). Returns tracking object with status.",
        exampleArgs: JSON.stringify({ tracking_number: "1Z999AA10123456784", slug: "ups", title: "Order #1234" }),
      },
      {
        name: "get_tracking",
        displayName: "Get Tracking",
        description: "Get tracking details by carrier slug and tracking number",
        method: "GET" as const,
        path: "/tracking/2024-10/trackings/{slug}/{tracking_number}",
        pathParams: JSON.stringify([
          { name: "slug", type: "string", required: true, description: "Carrier slug (e.g. fedex, ups)" },
          { name: "tracking_number", type: "string", required: true, description: "Tracking number" },
        ]),
        aiUsageHint: "Get current status and checkpoints for a tracking. Returns tag (Delivered, InTransit, etc), checkpoints array, estimated delivery.",
        exampleArgs: JSON.stringify({ slug: "ups", tracking_number: "1Z999AA10123456784" }),
      },
      {
        name: "list_trackings",
        displayName: "List Trackings",
        description: "Get a list of all trackings with optional filters",
        method: "GET" as const,
        path: "/tracking/2024-10/trackings",
        queryParams: JSON.stringify([
          { name: "page", type: "number", default: 1, description: "Page number" },
          { name: "limit", type: "number", default: 100, description: "Number per page (max 200)" },
          { name: "tag", type: "string", description: "Filter by status: Delivered, InTransit, OutForDelivery, InfoReceived, Pending, Exception, AvailableForPickup, Expired" },
          { name: "slug", type: "string", description: "Filter by carrier slug" },
          { name: "created_at_min", type: "string", description: "Filter: created after this date (ISO 8601)" },
        ]),
        aiUsageHint: "List all trackings. Use tag=InTransit to see active shipments, tag=Delivered for completed ones.",
        exampleArgs: JSON.stringify({ limit: 20, tag: "InTransit" }),
      },
      {
        name: "delete_tracking",
        displayName: "Delete Tracking",
        description: "Delete a tracking by carrier slug and tracking number",
        method: "DELETE" as const,
        path: "/tracking/2024-10/trackings/{slug}/{tracking_number}",
        pathParams: JSON.stringify([
          { name: "slug", type: "string", required: true, description: "Carrier slug" },
          { name: "tracking_number", type: "string", required: true, description: "Tracking number" },
        ]),
        aiUsageHint: "Delete a tracking. Requires carrier slug and tracking number.",
        exampleArgs: JSON.stringify({ slug: "fedex", tracking_number: "123456789012" }),
      },
      {
        name: "detect_courier",
        displayName: "Detect Courier",
        description: "Detect which courier a tracking number belongs to",
        method: "POST" as const,
        path: "/tracking/2024-10/couriers/detect",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["tracking_number"],
          properties: {
            tracking_number: { type: "string", description: "Tracking number to identify the carrier for" },
          },
        }),
        aiUsageHint: "Detect the carrier for a tracking number. Returns a list of possible courier matches with slug and name.",
        exampleArgs: JSON.stringify({ tracking_number: "1Z999AA10123456784" }),
      },
      {
        name: "list_couriers",
        displayName: "List Couriers",
        description: "Get a list of all supported couriers",
        method: "GET" as const,
        path: "/tracking/2024-10/couriers",
        aiUsageHint: "List all 1,100+ supported carriers. Returns slug, name, phone, other_name, web_url for each.",
        exampleArgs: JSON.stringify({}),
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
      message: "AfterShip blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
    };
  },
});
