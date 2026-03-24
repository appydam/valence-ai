/**
 * Seed TikTok integration blueprint
 * Run this once to create the TikTok blueprint in the database.
 *
 * Prerequisites:
 * 1. Go to https://developers.tiktok.com/ and create an app
 * 2. Add products: Login Kit + Content Posting API
 * 3. Set redirect URI to: https://<YOUR_DEPLOYMENT>.convex.site/api/integrations/oauth/callback
 * 4. Set Convex env var: OAUTH_SECRET_TIKTOK=<your_client_secret>
 *
 * Usage (after deploy):
 * npx convex run seedTikTokBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud
 *
 * IMPORTANT PLATFORM LIMITATIONS:
 * - Posted content stays PRIVATE/DRAFT until TikTok manually audits your app
 * - You must submit your app for TikTok's security audit to enable public posting
 * - Rate limits: 100-1,000 API requests/day depending on approval tier
 * - Video upload is a multi-step chunked upload process
 * - No access to For You Page (FYP) or other users' feeds
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "tiktok"))
      .first();

    if (existing) {
      return {
        message: "TikTok blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const authConfig = {
      clientId: process.env.TIKTOK_CLIENT_KEY || "YOUR_TIKTOK_CLIENT_KEY",
      clientSecret: process.env.OAUTH_SECRET_TIKTOK || "YOUR_TIKTOK_CLIENT_SECRET",
      authorizeUrl: "https://www.tiktok.com/v2/auth/authorize/",
      tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
      scopes: ["user.info.basic", "video.list", "video.upload", "video.publish"],
      scopeSeparator: "comma",
      // TikTok uses "client_key" not "client_id" in some endpoints — handled by engine
      tokenEndpointAuth: "body",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "tiktok",
      name: "TikTok",
      description: "Upload TikTok videos, read your video library, and get video analytics. Note: Public posting requires TikTok app audit approval.",
      category: "social_media",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://open.tiktokapis.com/v2",
      defaultHeaders: JSON.stringify({
        "Accept": "application/json",
        "Content-Type": "application/json; charset=UTF-8",
      }),
      sourceType: "manual",
      sourceUrl: "https://developers.tiktok.com/doc/overview",
      iconUrl: "https://cdn.simpleicons.org/tiktok/ffffff",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "get_user_info",
        displayName: "Get User Info",
        description: "Get the authenticated TikTok user's profile: display name, avatar, follower count, following count, likes count, and video count.",
        method: "GET" as const,
        path: "/user/info/",
        queryParams: JSON.stringify([
          {
            name: "fields",
            type: "string",
            required: true,
            default: "open_id,union_id,avatar_url,display_name,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count",
            description: "Comma-separated list of fields to return",
          },
        ]),
        aiUsageHint: "Get the current TikTok user's profile info (followers, display name, video count, etc.). No arguments needed beyond fields.",
        exampleArgs: JSON.stringify({
          fields: "open_id,avatar_url,display_name,bio_description,follower_count,following_count,likes_count,video_count",
        }),
      },
      {
        name: "list_user_videos",
        displayName: "List User Videos",
        description: "Get a paginated list of the authenticated user's TikTok videos with metadata (title, duration, view count, like count, etc.).",
        method: "POST" as const,
        path: "/video/list/",
        queryParams: JSON.stringify([
          {
            name: "fields",
            type: "string",
            required: true,
            default: "id,title,video_description,duration,cover_image_url,share_url,view_count,like_count,comment_count,share_count,create_time",
            description: "Comma-separated list of video fields to return",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            max_count: {
              type: "number",
              description: "Maximum videos to return per page (1-20)",
              default: 20,
            },
            cursor: {
              type: "number",
              description: "Pagination cursor from previous response (use has_more + cursor for next page)",
            },
          },
        }),
        aiUsageHint: "List the user's TikTok videos with stats. Use cursor for pagination. Returns has_more=true if more pages exist.",
        exampleArgs: JSON.stringify({
          fields: "id,title,video_description,duration,view_count,like_count,comment_count,share_count,create_time",
          max_count: 20,
        }),
      },
      {
        name: "get_video_details",
        displayName: "Get Video Details",
        description: "Query detailed information about specific TikTok videos by their IDs. Returns view count, like count, comment count, share count, and more.",
        method: "POST" as const,
        path: "/video/query/",
        queryParams: JSON.stringify([
          {
            name: "fields",
            type: "string",
            required: true,
            default: "id,title,video_description,duration,cover_image_url,share_url,view_count,like_count,comment_count,share_count,create_time,privacy_level",
            description: "Comma-separated list of video fields to return",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["filters"],
          properties: {
            filters: {
              type: "object",
              required: ["video_ids"],
              properties: {
                video_ids: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of video IDs to query (max 20)",
                },
              },
            },
          },
        }),
        aiUsageHint: "Get detailed stats for specific videos by their IDs. Use list_user_videos first to get video IDs.",
        exampleArgs: JSON.stringify({
          fields: "id,title,video_description,duration,view_count,like_count,comment_count,share_count,create_time",
          filters: {
            video_ids: ["7234567890123456789"],
          },
        }),
      },
      {
        name: "init_video_upload",
        displayName: "Initialize Video Upload (Step 1 of Posting)",
        description: "Step 1 of posting a TikTok video. Initializes the upload and returns a publish_id and upload_url. Then upload the video file directly to the upload_url. After upload, call publish_video with the publish_id.",
        method: "POST" as const,
        path: "/post/video/init/",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["post_info", "source_info"],
          properties: {
            post_info: {
              type: "object",
              required: ["title", "privacy_level"],
              properties: {
                title: {
                  type: "string",
                  description: "Video title/caption. Max 150 characters including hashtags.",
                },
                privacy_level: {
                  type: "string",
                  enum: ["SELF_ONLY", "MUTUAL_FOLLOW_FRIENDS", "FOLLOWER_OF_CREATOR", "PUBLIC_TO_EVERYONE"],
                  description: "Privacy setting. Until your app passes TikTok audit, only SELF_ONLY works.",
                },
                disable_duet: { type: "boolean", default: false },
                disable_stitch: { type: "boolean", default: false },
                disable_comment: { type: "boolean", default: false },
              },
            },
            source_info: {
              type: "object",
              required: ["source", "video_size", "chunk_size", "total_chunk_count"],
              properties: {
                source: {
                  type: "string",
                  enum: ["FILE_UPLOAD", "PULL_FROM_URL"],
                  description: "Use FILE_UPLOAD for chunked upload, PULL_FROM_URL for a public URL",
                },
                video_url: {
                  type: "string",
                  description: "Public video URL if source is PULL_FROM_URL (MP4, max 4GB, max 60min)",
                },
                video_size: {
                  type: "number",
                  description: "Total video file size in bytes (required for FILE_UPLOAD)",
                },
                chunk_size: {
                  type: "number",
                  description: "Size of each chunk in bytes (5MB-64MB, required for FILE_UPLOAD)",
                },
                total_chunk_count: {
                  type: "number",
                  description: "Total number of chunks (required for FILE_UPLOAD)",
                },
              },
            },
          },
        }),
        aiUsageHint: "Step 1 of posting a TikTok video. For direct URL posting use source=PULL_FROM_URL with video_url. For file uploads, use FILE_UPLOAD with chunk details. Note: SELF_ONLY privacy until app audit is approved.",
        exampleArgs: JSON.stringify({
          post_info: {
            title: "Check out this amazing content! #viral #trending",
            privacy_level: "SELF_ONLY",
            disable_duet: false,
            disable_stitch: false,
            disable_comment: false,
          },
          source_info: {
            source: "PULL_FROM_URL",
            video_url: "https://example.com/video.mp4",
            video_size: 10485760,
            chunk_size: 10485760,
            total_chunk_count: 1,
          },
        }),
      },
      {
        name: "check_video_status",
        displayName: "Check Video Upload Status",
        description: "Check the processing status of an uploaded video. Returns status: PROCESSING_DOWNLOAD, PROCESSING_UPLOAD, SEND_TO_USER_INBOX, FAILED, or PUBLISHED.",
        method: "POST" as const,
        path: "/post/publish/status/fetch/",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["publish_id"],
          properties: {
            publish_id: {
              type: "string",
              description: "The publish_id returned from init_video_upload",
            },
          },
        }),
        aiUsageHint: "Check if a video upload has finished processing. Use the publish_id from init_video_upload. Poll this until status is PUBLISHED or FAILED.",
        exampleArgs: JSON.stringify({
          publish_id: "v_pub_url~tiktok-obj-160075032819548160",
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
      message: "✅ TikTok blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Go to https://developers.tiktok.com/ and create a developer app",
        "2. Add products: Login Kit and Content Posting API",
        "3. Set redirect URI: https://<YOUR_DEPLOYMENT>.convex.site/api/integrations/oauth/callback",
        "4. Copy Client Key and Client Secret from your app settings",
        "5. Set TIKTOK_CLIENT_KEY in Convex env vars",
        "6. Set OAUTH_SECRET_TIKTOK=<client_secret> in Convex env vars",
        "7. Submit your app for TikTok security audit to enable public posting",
      ],
      limitations: [
        "CRITICAL: Posted videos stay PRIVATE until TikTok audits your app",
        "Must submit app for TikTok security audit for public visibility",
        "No access to For You Page (FYP) or other users' content",
        "Rate limits: 100-1,000 API calls/day depending on approval tier",
        "Video must be MP4 format, max 4GB, max 60 minutes",
      ],
    };
  },
});
