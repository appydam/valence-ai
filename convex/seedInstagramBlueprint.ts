/**
 * Seed Instagram integration blueprint
 * Run this once to create the Instagram blueprint in the database.
 *
 * Prerequisites:
 * 1. Create a Meta App at https://developers.facebook.com/
 * 2. Add the Instagram product to your app
 * 3. Set callback URL to: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback
 * 4. Set Convex env var: OAUTH_SECRET_INSTAGRAM=<your_app_secret>
 *
 * Usage (after deploy):
 * npx convex run seedInstagramBlueprint --url https://beloved-squirrel-599.convex.cloud
 *
 * IMPORTANT PLATFORM LIMITATIONS:
 * - Requires Business or Creator account (personal accounts not supported)
 * - Cannot read home/explore feed — only your own posted content
 * - Cannot post Stories or Reels via API (feed posts only)
 * - AI-generated content must be labeled ("Made with AI")
 * - Rate limit: 200 requests/hour
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "instagram"))
      .first();

    if (existing) {
      return {
        message: "Instagram blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const authConfig = {
      clientId: process.env.INSTAGRAM_CLIENT_ID || "YOUR_INSTAGRAM_APP_ID",
      clientSecret: process.env.OAUTH_SECRET_INSTAGRAM || "YOUR_INSTAGRAM_APP_SECRET",
      authorizeUrl: "https://api.instagram.com/oauth/authorize",
      tokenUrl: "https://graph.instagram.com/oauth/access_token",
      longLivedTokenUrl: "https://graph.instagram.com/access_token",
      scopes: ["instagram_basic", "instagram_content_publish", "instagram_graph_user_profile", "instagram_graph_user_media"],
      scopeSeparator: "comma",
      // Instagram requires a two-step publish flow:
      // 1. Create a media container (returns container_id)
      // 2. Publish the container (/me/media/publish)
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "instagram",
      name: "Instagram",
      description: "Post to Instagram feed, read your media library, and get engagement insights. Requires a Business or Creator account.",
      category: "social_media",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://graph.instagram.com/v21.0",
      defaultHeaders: JSON.stringify({
        "Accept": "application/json",
        "Content-Type": "application/json",
      }),
      sourceType: "manual",
      sourceUrl: "https://developers.facebook.com/docs/instagram-api",
      iconUrl: "https://cdn.simpleicons.org/instagram/E4405F",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "get_user_profile",
        displayName: "Get User Profile",
        description: "Retrieve the authenticated user's Instagram profile. Returns id, username, name, biography, followers_count, profile_picture_url.",
        method: "GET" as const,
        path: "/me",
        queryParams: JSON.stringify([
          {
            name: "fields",
            type: "string",
            required: false,
            default: "id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website",
            description: "Comma-separated list of fields to return",
          },
        ]),
        aiUsageHint: "Use to get the current user's Instagram profile info (followers, bio, etc.). No arguments needed.",
        exampleArgs: JSON.stringify({
          fields: "id,username,name,biography,followers_count,media_count,profile_picture_url",
        }),
      },
      {
        name: "get_user_media",
        displayName: "Get User Media",
        description: "List the authenticated user's Instagram posts (images and videos). Returns a paginated list of media objects.",
        method: "GET" as const,
        path: "/me/media",
        queryParams: JSON.stringify([
          {
            name: "fields",
            type: "string",
            required: false,
            default: "id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink",
            description: "Comma-separated list of fields to return per media item",
          },
          {
            name: "limit",
            type: "number",
            required: false,
            default: 12,
            description: "Number of media items to return (max 100)",
          },
        ]),
        aiUsageHint: "Use to list the user's Instagram posts. Returns images and videos sorted by most recent.",
        exampleArgs: JSON.stringify({
          fields: "id,caption,media_type,media_url,timestamp,like_count,comments_count,permalink",
          limit: 12,
        }),
      },
      {
        name: "get_media_item",
        displayName: "Get Media Item",
        description: "Get details about a specific Instagram post by media ID.",
        method: "GET" as const,
        path: "/{media_id}",
        pathParams: JSON.stringify([
          { name: "media_id", type: "string", required: true, description: "The Instagram media object ID" },
        ]),
        queryParams: JSON.stringify([
          {
            name: "fields",
            type: "string",
            required: false,
            default: "id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink",
            description: "Comma-separated list of fields to return",
          },
        ]),
        aiUsageHint: "Get details of a specific Instagram post by its media ID.",
        exampleArgs: JSON.stringify({
          media_id: "17896129349180977",
          fields: "id,caption,media_type,media_url,timestamp,like_count,comments_count",
        }),
      },
      {
        name: "create_media_container",
        displayName: "Create Media Container (Step 1 of Posting)",
        description: "Step 1 of 2 for posting to Instagram. Creates a media container with the image/video URL and caption. Returns a container_id to use in publish_media. For images: provide image_url. For videos: provide video_url and media_type=REELS.",
        method: "POST" as const,
        path: "/me/media",
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            image_url: {
              type: "string",
              description: "Publicly accessible URL of the image to post (for IMAGE type). Must be JPEG or PNG.",
            },
            video_url: {
              type: "string",
              description: "Publicly accessible URL of the video to post (for REELS type). Must be MP4.",
            },
            caption: {
              type: "string",
              description: "Caption for the post. Can include hashtags and @mentions. Max 2,200 characters.",
            },
            media_type: {
              type: "string",
              enum: ["IMAGE", "REELS"],
              description: "Type of media. Use IMAGE for photos, REELS for videos.",
            },
          },
        }),
        aiUsageHint: "Step 1 of posting to Instagram. Provide a publicly accessible image_url or video_url and a caption. After this call, use publish_media with the returned container id.",
        exampleArgs: JSON.stringify({
          image_url: "https://example.com/photo.jpg",
          caption: "Beautiful sunset today! #sunset #nature",
          media_type: "IMAGE",
        }),
      },
      {
        name: "publish_media",
        displayName: "Publish Media (Step 2 of Posting)",
        description: "Step 2 of 2 for posting to Instagram. Publishes a previously created media container. Use the creation_id returned from create_media_container. The post will appear on the user's feed after this call.",
        method: "POST" as const,
        path: "/me/media/publish",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["creation_id"],
          properties: {
            creation_id: {
              type: "string",
              description: "The container ID returned from create_media_container",
            },
          },
        }),
        aiUsageHint: "Step 2 of posting to Instagram. Use the creation_id returned from create_media_container to make the post live.",
        exampleArgs: JSON.stringify({
          creation_id: "17889615814484166",
        }),
      },
      {
        name: "get_media_insights",
        displayName: "Get Media Insights",
        description: "Get engagement metrics for a specific media post: impressions, reach, likes, comments, shares, saves.",
        method: "GET" as const,
        path: "/{media_id}/insights",
        pathParams: JSON.stringify([
          { name: "media_id", type: "string", required: true, description: "The Instagram media object ID" },
        ]),
        queryParams: JSON.stringify([
          {
            name: "metric",
            type: "string",
            required: true,
            default: "impressions,reach,likes,comments,shares,saved",
            description: "Comma-separated list of metrics to retrieve",
          },
        ]),
        aiUsageHint: "Get engagement analytics for a specific post. Returns impressions, reach, likes, comments, shares, saves.",
        exampleArgs: JSON.stringify({
          media_id: "17896129349180977",
          metric: "impressions,reach,likes,comments,shares,saved",
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
      message: "✅ Instagram blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Go to https://developers.facebook.com/ and create a Meta App",
        "2. Add the Instagram product to your app",
        "3. Get your App ID and App Secret",
        "4. Set INSTAGRAM_CLIENT_ID in Convex env vars (optional, can be hardcoded)",
        "5. Set OAUTH_SECRET_INSTAGRAM=<your_app_secret> in Convex env vars",
        "6. Add callback URL: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "7. Your Instagram account must be a Business or Creator account",
        "8. Note: AI-generated content must be labeled per Meta policy",
      ],
      limitations: [
        "Only Business or Creator accounts supported (not personal)",
        "Cannot read home/explore feed — only your own media",
        "Cannot post Stories or Reels via this API",
        "Rate limit: 200 API calls per hour",
        "AI-generated content must include disclosure labels",
      ],
    };
  },
});
