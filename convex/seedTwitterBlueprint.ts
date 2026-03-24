/**
 * Seed Twitter/X integration blueprint
 * Run this once to create the Twitter/X blueprint in the database.
 *
 * Prerequisites:
 * 1. Go to https://developer.twitter.com/en/portal/dashboard
 * 2. Create a project and app
 * 3. Enable OAuth 2.0 with PKCE (User authentication settings)
 * 4. Set callback URL to: https://<YOUR_DEPLOYMENT>.convex.site/api/integrations/oauth/callback
 * 5. Set Convex env var: OAUTH_SECRET_TWITTER_X=<your_client_secret>
 *
 * Usage (after deploy):
 * npx convex run seedTwitterBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud
 *
 * IMPORTANT PLATFORM LIMITATIONS (Free Tier):
 * - 500 posts per month (roughly 16-17 per day)
 * - ~500 reads per month on most endpoints
 * - Programmatic replies to other users are BANNED (as of 2026)
 * - Likes, follows, bookmarks require paid tier ($100/month Basic)
 * - No DM access on free tier
 * - No trends or advanced search on free tier
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "twitter-x"))
      .first();

    if (existing) {
      return {
        message: "Twitter/X blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const authConfig = {
      clientId: process.env.TWITTER_CLIENT_ID || "YOUR_TWITTER_CLIENT_ID",
      clientSecret: process.env.OAUTH_SECRET_TWITTER_X || "YOUR_TWITTER_CLIENT_SECRET",
      authorizeUrl: "https://twitter.com/i/oauth2/authorize",
      tokenUrl: "https://api.twitter.com/2/oauth2/token",
      scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
      scopeSeparator: "space",
      usePKCE: true,
      // Twitter requires Authorization: Basic base64(clientId:clientSecret) for token exchange
      tokenEndpointAuth: "basic",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "twitter-x",
      name: "Twitter / X",
      description: "Post tweets, search public tweets, and read user timelines. Free tier: 500 posts/month, 500 reads/month. Automated replies are not permitted.",
      category: "social_media",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://api.twitter.com/2",
      defaultHeaders: JSON.stringify({
        "Accept": "application/json",
        "Content-Type": "application/json",
      }),
      sourceType: "manual",
      sourceUrl: "https://developer.twitter.com/en/docs/twitter-api",
      iconUrl: "https://cdn.simpleicons.org/x/ffffff",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "get_me",
        displayName: "Get My Profile",
        description: "Get the authenticated user's Twitter/X profile. Returns id, name, username, description, public_metrics (followers, following, tweet count).",
        method: "GET" as const,
        path: "/users/me",
        queryParams: JSON.stringify([
          {
            name: "user.fields",
            type: "string",
            required: false,
            default: "id,name,username,description,public_metrics,profile_image_url,verified,created_at",
            description: "Comma-separated list of user fields to return",
          },
        ]),
        aiUsageHint: "Get the current authenticated user's Twitter/X profile info. No arguments needed.",
        exampleArgs: JSON.stringify({
          "user.fields": "id,name,username,description,public_metrics,profile_image_url",
        }),
      },
      {
        name: "create_tweet",
        displayName: "Create Tweet",
        description: "Post a new tweet. Text is required (max 280 characters). Can include a reply_to tweet ID, quote tweet ID, or poll. NOTE: Automated replies to other users are prohibited on free tier — only use this for original posts.",
        method: "POST" as const,
        path: "/tweets",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["text"],
          properties: {
            text: {
              type: "string",
              description: "Tweet content. Max 280 characters.",
            },
            quote_tweet_id: {
              type: "string",
              description: "Tweet ID to quote-tweet",
            },
            reply: {
              type: "object",
              description: "Reply settings (do not use for automated replies — prohibited on free tier)",
              properties: {
                in_reply_to_tweet_id: { type: "string" },
              },
            },
          },
        }),
        aiUsageHint: "Post a new original tweet. Max 280 characters. Do NOT use for automated replies to other users — that is prohibited on free tier.",
        exampleArgs: JSON.stringify({
          text: "Just shipped a new feature! 🚀 Check out our latest update at example.com",
        }),
      },
      {
        name: "get_tweet",
        displayName: "Get Tweet",
        description: "Get a single tweet by ID. Returns text, author info, engagement metrics, and media.",
        method: "GET" as const,
        path: "/tweets/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Tweet ID" },
        ]),
        queryParams: JSON.stringify([
          {
            name: "tweet.fields",
            type: "string",
            required: false,
            default: "id,text,created_at,public_metrics,author_id,attachments",
            description: "Comma-separated tweet fields",
          },
          {
            name: "expansions",
            type: "string",
            required: false,
            default: "author_id",
            description: "Expansions to include (e.g., author_id for user details)",
          },
          {
            name: "user.fields",
            type: "string",
            required: false,
            default: "id,name,username,profile_image_url",
            description: "User fields if author_id expansion is used",
          },
        ]),
        aiUsageHint: "Look up a specific tweet by its ID. Returns text, metrics, and author info.",
        exampleArgs: JSON.stringify({
          id: "1234567890123456789",
          "tweet.fields": "id,text,created_at,public_metrics,author_id",
          expansions: "author_id",
          "user.fields": "id,name,username",
        }),
      },
      {
        name: "get_user_by_username",
        displayName: "Get User by Username",
        description: "Look up a Twitter/X user by their @username. Returns profile info and public metrics.",
        method: "GET" as const,
        path: "/users/by/username/{username}",
        pathParams: JSON.stringify([
          { name: "username", type: "string", required: true, description: "Twitter username without the @ symbol" },
        ]),
        queryParams: JSON.stringify([
          {
            name: "user.fields",
            type: "string",
            required: false,
            default: "id,name,username,description,public_metrics,profile_image_url,verified,created_at",
            description: "Comma-separated user fields to return",
          },
        ]),
        aiUsageHint: "Look up a Twitter user by their username (without @). Example: username=elonmusk",
        exampleArgs: JSON.stringify({
          username: "elonmusk",
          "user.fields": "id,name,username,description,public_metrics",
        }),
      },
      {
        name: "get_user_tweets",
        displayName: "Get User's Tweets",
        description: "Get recent tweets from a user by their user ID. Returns a chronological list of tweets.",
        method: "GET" as const,
        path: "/users/{id}/tweets",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "The Twitter user ID (numeric string)" },
        ]),
        queryParams: JSON.stringify([
          {
            name: "tweet.fields",
            type: "string",
            required: false,
            default: "id,text,created_at,public_metrics",
            description: "Comma-separated tweet fields",
          },
          {
            name: "max_results",
            type: "number",
            required: false,
            default: 10,
            description: "Number of tweets to return (5-100)",
          },
          {
            name: "exclude",
            type: "string",
            required: false,
            description: "Types to exclude: retweets, replies",
          },
        ]),
        aiUsageHint: "Get recent tweets from a user. You need their numeric user ID (use get_user_by_username first to find it).",
        exampleArgs: JSON.stringify({
          id: "44196397",
          "tweet.fields": "id,text,created_at,public_metrics",
          max_results: 10,
          exclude: "retweets,replies",
        }),
      },
      {
        name: "search_recent_tweets",
        displayName: "Search Recent Tweets",
        description: "Search tweets from the last 7 days. Supports operators like from:user, to:user, #hashtag, -is:retweet. Returns matching tweets.",
        method: "GET" as const,
        path: "/tweets/search/recent",
        queryParams: JSON.stringify([
          {
            name: "query",
            type: "string",
            required: true,
            description: "Search query. Examples: '#AI -is:retweet', 'from:elonmusk', 'python coding lang:en'",
          },
          {
            name: "tweet.fields",
            type: "string",
            required: false,
            default: "id,text,created_at,public_metrics,author_id",
            description: "Comma-separated tweet fields",
          },
          {
            name: "expansions",
            type: "string",
            required: false,
            default: "author_id",
            description: "Include author details with author_id expansion",
          },
          {
            name: "user.fields",
            type: "string",
            required: false,
            default: "id,name,username",
            description: "User fields for expansions",
          },
          {
            name: "max_results",
            type: "number",
            required: false,
            default: 10,
            description: "Number of results (10-100)",
          },
        ]),
        aiUsageHint: "Search tweets from the past 7 days. Use query operators like '#hashtag', 'from:username', 'keyword -is:retweet lang:en'.",
        exampleArgs: JSON.stringify({
          query: "#AI -is:retweet lang:en",
          "tweet.fields": "id,text,created_at,public_metrics,author_id",
          expansions: "author_id",
          "user.fields": "id,name,username",
          max_results: 20,
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
      message: "✅ Twitter/X blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Go to https://developer.twitter.com/en/portal/dashboard",
        "2. Create a project and app (free tier is sufficient)",
        "3. Enable OAuth 2.0 with PKCE in User Authentication Settings",
        "4. Set callback URL to: https://<YOUR_DEPLOYMENT>.convex.site/api/integrations/oauth/callback",
        "5. Copy Client ID and Client Secret",
        "6. Set TWITTER_CLIENT_ID in Convex env vars",
        "7. Set OAUTH_SECRET_TWITTER_X=<client_secret> in Convex env vars",
      ],
      limitations: [
        "Free tier: 500 posts per month max (~16/day)",
        "Free tier: ~500 reads per month on most endpoints",
        "Automated replies to other users are PROHIBITED",
        "Likes, follows, bookmarks require paid tier ($100/month)",
        "No DM access on free tier",
        "No trends or streaming API on free tier",
      ],
    };
  },
});
