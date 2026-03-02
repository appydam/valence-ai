/**
 * Seed Reddit integration blueprint
 *
 * Reddit OAuth2 — requires Basic auth (client_id:secret) for token endpoint.
 * IMPORTANT: All requests must include a descriptive User-Agent header.
 * Reddit rate limit: 60 requests/minute.
 * Use duration=permanent in authorize URL to get a refresh token.
 *
 * Usage:
 * npx convex run seedRedditBlueprint --url https://beloved-squirrel-599.convex.cloud
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "reddit"))
      .first();

    if (existing) {
      return { message: "Reddit blueprint already exists", blueprintId: existing._id };
    }

    const authConfig = {
      clientId: process.env.REDDIT_CLIENT_ID || "YOUR_REDDIT_CLIENT_ID",
      clientSecret: "OAUTH_SECRET_REDDIT",
      authorizeUrl: "https://www.reddit.com/api/v1/authorize",
      tokenUrl: "https://www.reddit.com/api/v1/access_token",
      scopes: ["identity", "read", "submit", "privatemessages", "history", "vote", "save"],
      scopeSeparator: "space",
      tokenEndpointAuth: "header",
      extraAuthParams: {
        duration: "permanent",
      },
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "reddit",
      name: "Reddit",
      description: "Read and post to Reddit — browse subreddits, search posts, submit content, comment, vote, and send private messages.",
      category: "social_media",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://oauth.reddit.com",
      defaultHeaders: JSON.stringify({
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "web:missioncontrol:v1.0.0 (by /u/missioncontrol_app)",
      }),
      sourceType: "manual",
      sourceUrl: "https://www.reddit.com/dev/api/",
      iconUrl: "https://cdn.simpleicons.org/reddit/FF4500",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "get_me",
        displayName: "Get My Profile",
        description: "Get the authenticated user's Reddit profile — username, karma, account age",
        method: "GET" as const,
        path: "/api/v1/me",
        aiUsageHint: "Get info about the logged-in Reddit user. Returns username, link_karma, comment_karma, created_utc.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "get_subreddit_hot",
        displayName: "Get Hot Posts",
        description: "Get hot posts from a subreddit",
        method: "GET" as const,
        path: "/r/{subreddit}/hot",
        pathParams: JSON.stringify([
          { name: "subreddit", type: "string", required: true, description: "Subreddit name without r/ prefix (e.g. programming)" },
        ]),
        queryParams: JSON.stringify([
          { name: "limit", type: "number", description: "Number of posts (max 100)", default: 25 },
          { name: "after", type: "string", description: "Pagination cursor (fullname of last item)" },
        ]),
        aiUsageHint: "Get hot posts from a subreddit. Returns title, score, url, author, num_comments, selftext.",
        exampleArgs: JSON.stringify({ subreddit: "programming", limit: 10 }),
      },
      {
        name: "get_subreddit_new",
        displayName: "Get New Posts",
        description: "Get newest posts from a subreddit",
        method: "GET" as const,
        path: "/r/{subreddit}/new",
        pathParams: JSON.stringify([
          { name: "subreddit", type: "string", required: true, description: "Subreddit name without r/ prefix" },
        ]),
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 25 },
          { name: "after", type: "string", description: "Pagination cursor" },
        ]),
        aiUsageHint: "Get newest posts from a subreddit. Good for monitoring recent activity.",
        exampleArgs: JSON.stringify({ subreddit: "startups", limit: 10 }),
      },
      {
        name: "get_subreddit_top",
        displayName: "Get Top Posts",
        description: "Get top posts from a subreddit over a time period",
        method: "GET" as const,
        path: "/r/{subreddit}/top",
        pathParams: JSON.stringify([
          { name: "subreddit", type: "string", required: true, description: "Subreddit name without r/ prefix" },
        ]),
        queryParams: JSON.stringify([
          { name: "t", type: "string", description: "Time period: hour, day, week, month, year, all", default: "week" },
          { name: "limit", type: "number", default: 25 },
        ]),
        aiUsageHint: "Get top posts by time period. Use t=week for weekly top posts, t=all for all-time best.",
        exampleArgs: JSON.stringify({ subreddit: "entrepreneur", t: "week", limit: 10 }),
      },
      {
        name: "search_posts",
        displayName: "Search Reddit",
        description: "Search Reddit posts globally or within a specific subreddit",
        method: "GET" as const,
        path: "/search",
        queryParams: JSON.stringify([
          { name: "q", type: "string", required: true, description: "Search query" },
          { name: "sort", type: "string", description: "relevance, hot, top, new, comments", default: "relevance" },
          { name: "t", type: "string", description: "Time: hour, day, week, month, year, all", default: "all" },
          { name: "limit", type: "number", default: 25 },
          { name: "restrict_sr", type: "boolean", description: "Restrict to subreddit (only when subreddit is specified)" },
        ]),
        aiUsageHint: "Search all of Reddit. Returns posts matching the query. Add &restrict_sr=true and use /r/{sub}/search to search within a subreddit.",
        exampleArgs: JSON.stringify({ q: "machine learning startup", sort: "top", t: "month", limit: 10 }),
      },
      {
        name: "get_subreddit_info",
        displayName: "Get Subreddit Info",
        description: "Get info about a subreddit — subscribers, description, rules",
        method: "GET" as const,
        path: "/r/{subreddit}/about",
        pathParams: JSON.stringify([
          { name: "subreddit", type: "string", required: true, description: "Subreddit name without r/ prefix" },
        ]),
        aiUsageHint: "Get subreddit metadata — subscribers count, public description, title, rules. Good for research.",
        exampleArgs: JSON.stringify({ subreddit: "MachineLearning" }),
      },
      {
        name: "get_post_comments",
        displayName: "Get Post & Comments",
        description: "Get a Reddit post along with its comments",
        method: "GET" as const,
        path: "/r/{subreddit}/comments/{article_id}",
        pathParams: JSON.stringify([
          { name: "subreddit", type: "string", required: true, description: "Subreddit name" },
          { name: "article_id", type: "string", required: true, description: "Post ID (the part after /comments/ in the URL)" },
        ]),
        queryParams: JSON.stringify([
          { name: "limit", type: "number", description: "Max comments to return", default: 100 },
          { name: "sort", type: "string", description: "confidence, top, new, controversial, old", default: "top" },
          { name: "depth", type: "number", description: "Max comment nesting depth", default: 3 },
        ]),
        aiUsageHint: "Get a post and its comments. The article_id is the short ID from the URL e.g. for reddit.com/r/sub/comments/abc123/... use abc123.",
        exampleArgs: JSON.stringify({ subreddit: "programming", article_id: "abc123", limit: 50, sort: "top" }),
      },
      {
        name: "submit_post",
        displayName: "Submit Post",
        description: "Submit a new post (link or text) to a subreddit",
        method: "POST" as const,
        path: "/api/submit",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["sr", "kind", "title"],
          properties: {
            sr: { type: "string", description: "Subreddit name (without r/)" },
            kind: { type: "string", description: "Post type: self (text post), link (URL post)" },
            title: { type: "string", description: "Post title (max 300 chars)" },
            text: { type: "string", description: "Body text for self posts (markdown supported)" },
            url: { type: "string", description: "URL for link posts" },
            nsfw: { type: "boolean", default: false },
            spoiler: { type: "boolean", default: false },
            resubmit: { type: "boolean", default: true, description: "Allow resubmitting a URL already posted" },
          },
        }),
        aiUsageHint: "Submit a post to a subreddit. For text posts: kind=self, include text. For link posts: kind=link, include url.",
        exampleArgs: JSON.stringify({
          sr: "programming",
          kind: "self",
          title: "I built a tool that...",
          text: "Here's what I made and how it works...",
        }),
      },
      {
        name: "submit_comment",
        displayName: "Post Comment / Reply",
        description: "Post a comment on a post or reply to an existing comment",
        method: "POST" as const,
        path: "/api/comment",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["thing_id", "text"],
          properties: {
            thing_id: { type: "string", description: "Fullname of parent: t3_postid for top-level comment, t1_commentid for reply" },
            text: { type: "string", description: "Comment text (markdown supported)" },
          },
        }),
        aiUsageHint: "Post a comment. thing_id prefix: t3_ = post, t1_ = comment. E.g. t3_abc123 to comment on a post.",
        exampleArgs: JSON.stringify({ thing_id: "t3_abc123", text: "Great post! Here's my take..." }),
      },
      {
        name: "vote",
        displayName: "Vote",
        description: "Upvote or downvote a post or comment",
        method: "POST" as const,
        path: "/api/vote",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["id", "dir"],
          properties: {
            id: { type: "string", description: "Fullname of post or comment (e.g. t3_abc123)" },
            dir: { type: "number", description: "1 = upvote, -1 = downvote, 0 = remove vote" },
          },
        }),
        aiUsageHint: "Vote on a post or comment. dir=1 upvotes, dir=-1 downvotes, dir=0 removes vote.",
        exampleArgs: JSON.stringify({ id: "t3_abc123", dir: 1 }),
      },
      {
        name: "send_message",
        displayName: "Send Private Message",
        description: "Send a private message to a Reddit user",
        method: "POST" as const,
        path: "/api/compose",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["to", "subject", "text"],
          properties: {
            to: { type: "string", description: "Reddit username to send to (without u/)" },
            subject: { type: "string", description: "Message subject (max 100 chars)" },
            text: { type: "string", description: "Message body (markdown supported)" },
          },
        }),
        aiUsageHint: "Send a private message to a Reddit user.",
        exampleArgs: JSON.stringify({ to: "someuser", subject: "Hello!", text: "I saw your post and wanted to reach out..." }),
      },
      {
        name: "get_inbox",
        displayName: "Get Inbox",
        description: "Get private messages and comment replies in the inbox",
        method: "GET" as const,
        path: "/message/inbox",
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 25 },
          { name: "mark", type: "boolean", description: "Mark messages as read", default: false },
        ]),
        aiUsageHint: "Get inbox messages. Returns private messages and comment replies. Set mark=true to mark as read.",
        exampleArgs: JSON.stringify({ limit: 25 }),
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
      message: "Reddit blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Go to https://www.reddit.com/prefs/apps",
        "2. Click 'Create App' at the bottom",
        "3. Select type: 'web app'",
        "4. Set redirect URI: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "5. npx convex env set REDDIT_CLIENT_ID '<id>' --url https://beloved-squirrel-599.convex.cloud",
        "6. npx convex env set OAUTH_SECRET_REDDIT '<secret>' --url https://beloved-squirrel-599.convex.cloud",
        "7. npx convex run updateRedditBlueprint --url https://beloved-squirrel-599.convex.cloud",
      ],
    };
  },
});
