/**
 * Seed YouTube integration blueprint
 * Run this once to create the YouTube blueprint in the database.
 *
 * Prerequisites:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a project (or use existing)
 * 3. Enable the YouTube Data API v3
 * 4. Create OAuth 2.0 credentials (Web application type)
 * 5. Set callback URL to: https://<YOUR_DEPLOYMENT>.convex.site/api/integrations/oauth/callback
 * 6. Set Convex env var: OAUTH_SECRET_YOUTUBE=<your_client_secret>
 *
 * Usage (after deploy):
 * npx convex run seedYouTubeBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud
 *
 * FREE TIER QUOTA (10,000 units/day, resets at midnight PT):
 * - Read operations (videos.list, channels.list): 1 unit each
 * - Search operations (search.list): 100 units each
 * - Video upload: 1,600 units per upload (~6 uploads/day free)
 * - Comments read: 1 unit; post comment: 50 units
 * - Quota increase available on request from Google
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "youtube"))
      .first();

    if (existing) {
      return {
        message: "YouTube blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const authConfig = {
      clientId: process.env.YOUTUBE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
      clientSecret: process.env.OAUTH_SECRET_YOUTUBE || "YOUR_GOOGLE_CLIENT_SECRET",
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes: [
        "https://www.googleapis.com/auth/youtube",
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/youtube.readonly",
      ],
      scopeSeparator: "space",
      extraAuthParams: {
        access_type: "offline",
        prompt: "consent",
      },
      tokenEndpointAuth: "body",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "youtube",
      name: "YouTube",
      description: "Upload videos, search YouTube, manage your channel, read video stats, and post comments. Free tier: 10,000 units/day (~6 uploads/day).",
      category: "social_media",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://www.googleapis.com/youtube/v3",
      defaultHeaders: JSON.stringify({
        "Accept": "application/json",
        "Content-Type": "application/json",
      }),
      sourceType: "manual",
      sourceUrl: "https://developers.google.com/youtube/v3/docs",
      iconUrl: "https://cdn.simpleicons.org/youtube/FF0000",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "get_my_channel",
        displayName: "Get My Channel",
        description: "Get the authenticated user's YouTube channel info: title, description, thumbnail, subscriber count, video count, view count.",
        method: "GET" as const,
        path: "/channels",
        queryParams: JSON.stringify([
          {
            name: "part",
            type: "string",
            required: true,
            default: "snippet,statistics,brandingSettings",
            description: "Comma-separated list of resource parts to return",
          },
          {
            name: "mine",
            type: "boolean",
            required: true,
            default: true,
            description: "Set to true to get authenticated user's channel",
          },
        ]),
        aiUsageHint: "Get the current user's YouTube channel info (subscribers, views, video count). No special arguments needed.",
        exampleArgs: JSON.stringify({
          part: "snippet,statistics",
          mine: true,
        }),
      },
      {
        name: "list_my_videos",
        displayName: "List My Videos",
        description: "List videos uploaded to the authenticated user's channel with stats (views, likes, comments). Uses search API then fetches video details.",
        method: "GET" as const,
        path: "/search",
        queryParams: JSON.stringify([
          {
            name: "part",
            type: "string",
            required: true,
            default: "id,snippet",
            description: "Resource parts to return",
          },
          {
            name: "forMine",
            type: "boolean",
            required: true,
            default: true,
            description: "Return results from authenticated user's channel",
          },
          {
            name: "type",
            type: "string",
            required: false,
            default: "video",
            description: "Resource type filter",
          },
          {
            name: "maxResults",
            type: "number",
            required: false,
            default: 25,
            description: "Max results (1-50). NOTE: search.list costs 100 quota units.",
          },
          {
            name: "order",
            type: "string",
            required: false,
            default: "date",
            description: "Sort order: date, rating, viewCount, relevance, title",
          },
        ]),
        aiUsageHint: "List videos on the user's channel ordered by date (most recent first). Warning: costs 100 quota units per call.",
        exampleArgs: JSON.stringify({
          part: "id,snippet",
          forMine: true,
          type: "video",
          maxResults: 25,
          order: "date",
        }),
      },
      {
        name: "get_video_details",
        displayName: "Get Video Details",
        description: "Get detailed info for one or more YouTube videos by ID: title, description, thumbnail, duration, view count, like count, comment count, tags, published date.",
        method: "GET" as const,
        path: "/videos",
        queryParams: JSON.stringify([
          {
            name: "part",
            type: "string",
            required: true,
            default: "snippet,statistics,contentDetails,status",
            description: "Comma-separated resource parts",
          },
          {
            name: "id",
            type: "string",
            required: true,
            description: "Comma-separated video IDs (e.g., dQw4w9WgXcQ,9bZkp7q19f0)",
          },
        ]),
        aiUsageHint: "Get details and stats for specific videos by their YouTube video IDs. Can fetch up to 50 videos in one call.",
        exampleArgs: JSON.stringify({
          part: "snippet,statistics,contentDetails",
          id: "dQw4w9WgXcQ",
        }),
      },
      {
        name: "search_youtube",
        displayName: "Search YouTube",
        description: "Search YouTube for videos, channels, or playlists by keyword. Returns matching results with titles, thumbnails, and IDs. Costs 100 quota units per search.",
        method: "GET" as const,
        path: "/search",
        queryParams: JSON.stringify([
          {
            name: "part",
            type: "string",
            required: true,
            default: "id,snippet",
            description: "Resource parts to return",
          },
          {
            name: "q",
            type: "string",
            required: true,
            description: "Search query string",
          },
          {
            name: "type",
            type: "string",
            required: false,
            default: "video",
            description: "Resource type: video, channel, playlist",
          },
          {
            name: "maxResults",
            type: "number",
            required: false,
            default: 25,
            description: "Max results (1-50)",
          },
          {
            name: "order",
            type: "string",
            required: false,
            default: "relevance",
            description: "Sort order: relevance, date, rating, viewCount, title",
          },
          {
            name: "relevanceLanguage",
            type: "string",
            required: false,
            description: "Filter by language (e.g., en, es, fr)",
          },
          {
            name: "videoDuration",
            type: "string",
            required: false,
            description: "Duration filter: any, long (>20min), medium (4-20min), short (<4min)",
          },
        ]),
        aiUsageHint: "Search YouTube for videos, channels, or playlists. Use q for keywords. WARNING: costs 100 quota units per search (out of 10,000 daily).",
        exampleArgs: JSON.stringify({
          part: "id,snippet",
          q: "machine learning tutorial 2024",
          type: "video",
          maxResults: 10,
          order: "relevance",
        }),
      },
      {
        name: "upload_video",
        displayName: "Upload Video",
        description: "Upload a video to YouTube. Requires a publicly accessible video URL or the video will be uploaded from the request body. NOTE: Costs 1,600 quota units (~6 uploads/day on free tier). The video will be processed by YouTube after upload.",
        method: "POST" as const,
        path: "/videos",
        queryParams: JSON.stringify([
          {
            name: "part",
            type: "string",
            required: true,
            default: "snippet,status",
            description: "Parts to set on the video",
          },
          {
            name: "uploadType",
            type: "string",
            required: false,
            default: "multipart",
            description: "Upload type (use multipart for metadata+video in one request)",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["snippet", "status"],
          properties: {
            snippet: {
              type: "object",
              required: ["title"],
              properties: {
                title: {
                  type: "string",
                  description: "Video title. Max 100 characters.",
                },
                description: {
                  type: "string",
                  description: "Video description. Max 5,000 characters.",
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Tags for discoverability (max 500 characters total)",
                },
                categoryId: {
                  type: "string",
                  description: "YouTube category ID (e.g., 22=People & Blogs, 28=Science & Technology, 10=Music, 24=Entertainment)",
                },
                defaultLanguage: {
                  type: "string",
                  description: "Video language code (e.g., en, es)",
                },
              },
            },
            status: {
              type: "object",
              properties: {
                privacyStatus: {
                  type: "string",
                  enum: ["public", "private", "unlisted"],
                  description: "Video visibility: public, private, or unlisted",
                  default: "private",
                },
                selfDeclaredMadeForKids: {
                  type: "boolean",
                  description: "Whether this video is made for kids",
                  default: false,
                },
              },
            },
          },
        }),
        aiUsageHint: "Upload a video to YouTube. Provide title, description, tags, and privacy status. WARNING: costs 1,600 quota units — only ~6 uploads/day on free tier. Set privacyStatus=private for drafts.",
        exampleArgs: JSON.stringify({
          snippet: {
            title: "My Amazing Video",
            description: "A detailed description of what this video covers...",
            tags: ["tutorial", "howto", "technology"],
            categoryId: "28",
          },
          status: {
            privacyStatus: "private",
            selfDeclaredMadeForKids: false,
          },
        }),
      },
      {
        name: "list_comments",
        displayName: "List Video Comments",
        description: "Get top-level comments for a YouTube video. Returns author, text, like count, and publish date for each comment.",
        method: "GET" as const,
        path: "/commentThreads",
        queryParams: JSON.stringify([
          {
            name: "part",
            type: "string",
            required: true,
            default: "snippet",
            description: "Resource parts to return",
          },
          {
            name: "videoId",
            type: "string",
            required: true,
            description: "YouTube video ID to get comments for",
          },
          {
            name: "maxResults",
            type: "number",
            required: false,
            default: 20,
            description: "Max results (1-100)",
          },
          {
            name: "order",
            type: "string",
            required: false,
            default: "relevance",
            description: "Sort order: relevance (top comments first) or time (newest first)",
          },
        ]),
        aiUsageHint: "Get comments for a specific YouTube video. Use videoId from the video URL or get_video_details response.",
        exampleArgs: JSON.stringify({
          part: "snippet",
          videoId: "dQw4w9WgXcQ",
          maxResults: 20,
          order: "relevance",
        }),
      },
      {
        name: "add_comment",
        displayName: "Add Comment to Video",
        description: "Post a top-level comment to a YouTube video. The comment will be posted as the authenticated user. Costs 50 quota units.",
        method: "POST" as const,
        path: "/commentThreads",
        queryParams: JSON.stringify([
          {
            name: "part",
            type: "string",
            required: true,
            default: "snippet",
            description: "Resource parts",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["snippet"],
          properties: {
            snippet: {
              type: "object",
              required: ["videoId", "topLevelComment"],
              properties: {
                videoId: {
                  type: "string",
                  description: "YouTube video ID to comment on",
                },
                topLevelComment: {
                  type: "object",
                  required: ["snippet"],
                  properties: {
                    snippet: {
                      type: "object",
                      required: ["textOriginal"],
                      properties: {
                        textOriginal: {
                          type: "string",
                          description: "Comment text. Max 10,000 characters.",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Post a comment to a YouTube video as the authenticated user. Provide the videoId and comment text.",
        exampleArgs: JSON.stringify({
          snippet: {
            videoId: "dQw4w9WgXcQ",
            topLevelComment: {
              snippet: {
                textOriginal: "Great video! Really helpful explanation.",
              },
            },
          },
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
      message: "✅ YouTube blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Go to https://console.cloud.google.com/",
        "2. Create/select a project and enable YouTube Data API v3",
        "3. Create OAuth 2.0 credentials (Application type: Web application)",
        "4. Add authorized redirect URI: https://<YOUR_DEPLOYMENT>.convex.site/api/integrations/oauth/callback",
        "5. Copy Client ID and Client Secret",
        "6. Set YOUTUBE_CLIENT_ID in Convex env vars",
        "7. Set OAUTH_SECRET_YOUTUBE=<client_secret> in Convex env vars",
        "8. Optionally request quota increase from Google for more uploads/day",
      ],
      quotaInfo: {
        dailyLimit: "10,000 units (resets midnight Pacific time)",
        videoUpload: "1,600 units (~6 uploads/day on free tier)",
        search: "100 units per search",
        videoRead: "1 unit per videos.list call",
        commentRead: "1 unit per commentThreads.list call",
        commentWrite: "50 units per comment posted",
        quotaIncreaseUrl: "https://support.google.com/youtube/contact/yt_api_form",
      },
      limitations: [
        "Free tier: 10,000 units/day (~6 video uploads)",
        "search.list is expensive (100 units) — use sparingly",
        "Video upload requires streaming to Google's servers (multipart upload)",
        "AI-generated content may need disclosure per YouTube Community Guidelines",
        "App must be verified by Google for certain sensitive scopes",
      ],
    };
  },
});
