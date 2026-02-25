/**
 * Seed Zoom integration blueprint
 * Run this once to create the Zoom blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedZoomBlueprint -> Run
 *
 * Prerequisites:
 * 1. Create a Server-to-Server OAuth app at https://marketplace.zoom.us/develop/create
 *    (Or a User-managed OAuth app for per-user tokens)
 * 2. Add callback URL: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback
 * 3. Required scopes: meeting:read:admin, meeting:write:admin, user:read:admin,
 *    recording:read:admin, webinar:read:admin, webinar:write:admin
 * 4. Set in Convex env vars:
 *    - ZOOM_CLIENT_ID = your OAuth app client ID
 *    - OAUTH_SECRET_ZOOM = your OAuth app client secret
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "zoom"))
      .first();

    if (existing) {
      return {
        message: "Zoom blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "zoom",
      name: "Zoom",
      description:
        "Schedule and manage Zoom meetings, webinars, and recordings. List upcoming meetings, create instant or scheduled meetings, update or delete them, and retrieve cloud recording links.",
      category: "communication",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: process.env.ZOOM_CLIENT_ID || "n9pC_QHrTF2mkO5qml3Ag",
        clientSecret: "OAUTH_SECRET_ZOOM",
        authorizeUrl: "https://zoom.us/oauth/authorize",
        tokenUrl: "https://zoom.us/oauth/token",
        scopes: [
          "meeting:read:list_meetings",
          "meeting:read:list_upcoming_meetings",
          "meeting:read:meeting",
          "meeting:write:meeting",
          "meeting:update:meeting",
          "meeting:delete:meeting",
          "cloud_recording:read:list_user_recordings",
          "cloud_recording:read:list_recording_files",
          "user:read:user",
        ],
        scopeSeparator: "space",
        extraAuthParams: {},
        tokenEndpointAuth: "body",
        pkce: false,
      }),
      baseUrl: "https://api.zoom.us",
      defaultHeaders: JSON.stringify({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.zoom.us/docs/api/",
      iconUrl: "https://st1.zoom.us/zoom.ico",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    // Tools defined individually to avoid TS deep type errors
    const tools = [
      {
        name: "get_current_user",
        displayName: "Get Current User",
        description: "Get the profile of the authenticated Zoom user",
        method: "GET" as const,
        path: "/v2/users/me",
        aiUsageHint: "Retrieve the current user's Zoom profile and account info",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_meetings",
        displayName: "List Meetings",
        description: "List all meetings for the authenticated user",
        method: "GET" as const,
        path: "/v2/users/me/meetings",
        queryParams: JSON.stringify([
          {
            name: "type",
            type: "string",
            required: false,
            description: "Meeting type: scheduled, live, upcoming (default: live)",
            enum: ["scheduled", "live", "upcoming", "upcoming_meetings", "previous_meetings"],
          },
          { name: "page_size", type: "number", required: false, description: "Number of results per page (max 300)" },
          { name: "next_page_token", type: "string", required: false, description: "Pagination token" },
        ]),
        aiUsageHint: "List all scheduled or upcoming meetings for the current user",
        exampleArgs: JSON.stringify({ type: "upcoming", page_size: 30 }),
      },
      {
        name: "get_meeting",
        displayName: "Get Meeting",
        description: "Get details of a specific Zoom meeting by ID",
        method: "GET" as const,
        path: "/v2/meetings/{meetingId}",
        pathParams: JSON.stringify([
          { name: "meetingId", type: "string", required: true, description: "The meeting ID or UUID" },
        ]),
        aiUsageHint: "Get full details of a meeting including join URL, agenda, and settings",
        exampleArgs: JSON.stringify({ meetingId: "12345678901" }),
      },
      {
        name: "create_meeting",
        displayName: "Create Meeting",
        description: "Schedule a new Zoom meeting for the authenticated user",
        method: "POST" as const,
        path: "/v2/users/me/meetings",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["topic"],
          properties: {
            topic: { type: "string", description: "Meeting topic / title" },
            type: {
              type: "number",
              description: "1=instant, 2=scheduled, 3=recurring no fixed time, 8=recurring fixed time",
              enum: [1, 2, 3, 8],
            },
            start_time: {
              type: "string",
              description: "ISO 8601 datetime in UTC (required for scheduled meetings), e.g. 2026-03-01T15:00:00Z",
            },
            duration: { type: "number", description: "Duration in minutes" },
            timezone: { type: "string", description: "IANA timezone, e.g. America/New_York" },
            agenda: { type: "string", description: "Meeting agenda / description" },
            password: { type: "string", description: "Meeting passcode (max 10 chars)" },
            settings: {
              type: "object",
              properties: {
                host_video: { type: "boolean" },
                participant_video: { type: "boolean" },
                join_before_host: { type: "boolean" },
                mute_upon_entry: { type: "boolean" },
                waiting_room: { type: "boolean" },
                auto_recording: {
                  type: "string",
                  enum: ["local", "cloud", "none"],
                },
              },
            },
          },
        }),
        aiUsageHint: "Schedule a new Zoom meeting with topic, time, duration, and optional settings",
        exampleArgs: JSON.stringify({
          topic: "Weekly Sync",
          type: 2,
          start_time: "2026-03-01T15:00:00Z",
          duration: 60,
          timezone: "America/New_York",
          agenda: "Weekly team sync",
          settings: { waiting_room: true, mute_upon_entry: true },
        }),
      },
      {
        name: "update_meeting",
        displayName: "Update Meeting",
        description: "Update an existing Zoom meeting's details",
        method: "PATCH" as const,
        path: "/v2/meetings/{meetingId}",
        pathParams: JSON.stringify([
          { name: "meetingId", type: "string", required: true, description: "The meeting ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            topic: { type: "string" },
            start_time: { type: "string" },
            duration: { type: "number" },
            agenda: { type: "string" },
            password: { type: "string" },
            settings: { type: "object" },
          },
        }),
        aiUsageHint: "Update meeting details like topic, time, duration, or agenda",
        exampleArgs: JSON.stringify({ meetingId: "12345678901", topic: "Updated: Weekly Sync", duration: 45 }),
      },
      {
        name: "delete_meeting",
        displayName: "Delete Meeting",
        description: "Delete a scheduled Zoom meeting",
        method: "DELETE" as const,
        path: "/v2/meetings/{meetingId}",
        pathParams: JSON.stringify([
          { name: "meetingId", type: "string", required: true, description: "The meeting ID to delete" },
        ]),
        queryParams: JSON.stringify([
          { name: "notify_hosts", type: "boolean", required: false, description: "Notify alternative hosts" },
          { name: "notify_registrants", type: "boolean", required: false, description: "Notify registrants" },
        ]),
        aiUsageHint: "Cancel and delete a scheduled meeting",
        exampleArgs: JSON.stringify({ meetingId: "12345678901" }),
      },
      {
        name: "list_recordings",
        displayName: "List Cloud Recordings",
        description: "List all cloud recordings for the authenticated user",
        method: "GET" as const,
        path: "/v2/users/me/recordings",
        queryParams: JSON.stringify([
          { name: "from", type: "string", required: false, description: "Start date in YYYY-MM-DD format" },
          { name: "to", type: "string", required: false, description: "End date in YYYY-MM-DD format" },
          { name: "page_size", type: "number", required: false, description: "Number of results (max 300)" },
          { name: "next_page_token", type: "string", required: false },
          { name: "trash", type: "boolean", required: false, description: "List recordings in trash" },
        ]),
        aiUsageHint: "List cloud recordings from Zoom, optionally filtered by date range",
        exampleArgs: JSON.stringify({ from: "2026-02-01", to: "2026-02-28", page_size: 50 }),
      },
      {
        name: "get_meeting_recordings",
        displayName: "Get Meeting Recordings",
        description: "Get all recording files for a specific meeting",
        method: "GET" as const,
        path: "/v2/meetings/{meetingId}/recordings",
        pathParams: JSON.stringify([
          { name: "meetingId", type: "string", required: true, description: "Meeting ID or UUID" },
        ]),
        aiUsageHint: "Get recording download URLs and metadata for a specific meeting",
        exampleArgs: JSON.stringify({ meetingId: "12345678901" }),
      },
    ];

    // Insert all tools
    for (const tool of tools) {
      await ctx.db.insert("blueprintTools", {
        ...tool,
        blueprintId,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      message: "Zoom blueprint created successfully",
      blueprintId,
      toolCount: tools.length,
    };
  },
});
