/**
 * Seed Google Drive integration blueprint
 * Run this once to create the Google Drive blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedGoogleDriveBlueprint -> Run
 *
 * Prerequisites:
 * - Uses the same Google OAuth app as Gmail, Sheets, Calendar
 * - Enable Google Drive API at https://console.cloud.google.com/
 * - OAUTH_SECRET_GOOGLE should already be set from other Google integrations
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "google-drive"))
      .first();

    if (existing) {
      return {
        message: "Google Drive blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "google-drive",
      name: "Google Drive",
      description:
        "Cloud file storage. List, search, upload, download, organize, and share files and folders. Create folders, copy files, and manage permissions.",
      category: "productivity",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "",
        clientSecret: "OAUTH_SECRET_GOOGLE",
        authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scopes: [
          "https://www.googleapis.com/auth/drive",
          "https://www.googleapis.com/auth/drive.file",
          "https://www.googleapis.com/auth/drive.metadata",
        ],
        scopeSeparator: "space",
        extraAuthParams: { access_type: "offline", prompt: "consent" },
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://www.googleapis.com",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.google.com/drive/api/reference/rest/v3",
      iconUrl: "https://cdn.simpleicons.org/googledrive/4285F4",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_files",
        displayName: "List Files",
        description: "List files and folders in Google Drive. Supports filtering, searching, and pagination.",
        method: "GET" as const,
        path: "/drive/v3/files",
        queryParams: JSON.stringify([
          { name: "q", type: "string", description: "Search query. Examples: name contains 'report', mimeType='application/vnd.google-apps.folder', 'FOLDER_ID' in parents" },
          { name: "fields", type: "string", description: "Fields to include in response", default: "files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink)" },
          { name: "pageSize", type: "number", description: "Max results", default: 20 },
          { name: "pageToken", type: "string", description: "Token for next page" },
          { name: "orderBy", type: "string", description: "Sort: name, createdTime, modifiedTime, folder" },
        ]),
        aiUsageHint: "List Google Drive files. Use q parameter for search: name contains 'budget' finds files with 'budget' in name. Use mimeType='application/vnd.google-apps.folder' for folders only. Use 'FOLDER_ID' in parents to list folder contents.",
        exampleArgs: JSON.stringify({ q: "name contains 'Q1 Report'", pageSize: 10 }),
      },
      {
        name: "get_file",
        displayName: "Get File Metadata",
        description: "Get metadata for a specific Google Drive file by ID.",
        method: "GET" as const,
        path: "/drive/v3/files/{fileId}",
        pathParams: JSON.stringify([
          { name: "fileId", type: "string", required: true, description: "Google Drive file ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "fields", type: "string", description: "Fields to return", default: "id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,owners" },
        ]),
        aiUsageHint: "Get metadata of a Google Drive file. Returns name, type, size, owner, and sharing link.",
        exampleArgs: JSON.stringify({ fileId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" }),
      },
      {
        name: "create_folder",
        displayName: "Create Folder",
        description: "Create a new folder in Google Drive.",
        method: "POST" as const,
        path: "/drive/v3/files",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["name", "mimeType"],
          properties: {
            name: { type: "string", description: "Folder name" },
            mimeType: { type: "string", enum: ["application/vnd.google-apps.folder"], description: "Must be 'application/vnd.google-apps.folder'" },
            parents: { type: "array", items: { type: "string" }, description: "Parent folder IDs. Leave empty for root." },
          },
        }),
        aiUsageHint: "Create a Google Drive folder. Set mimeType to 'application/vnd.google-apps.folder'. Optionally provide parent folder IDs.",
        exampleArgs: JSON.stringify({ name: "Q1 Reports 2026", mimeType: "application/vnd.google-apps.folder" }),
      },
      {
        name: "copy_file",
        displayName: "Copy File",
        description: "Create a copy of a Google Drive file.",
        method: "POST" as const,
        path: "/drive/v3/files/{fileId}/copy",
        pathParams: JSON.stringify([
          { name: "fileId", type: "string", required: true, description: "File ID to copy" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            name: { type: "string", description: "Name for the copied file" },
            parents: { type: "array", items: { type: "string" }, description: "Parent folder IDs for the copy" },
          },
        }),
        aiUsageHint: "Copy a Google Drive file. Provide a new name and optionally a destination folder.",
        exampleArgs: JSON.stringify({ fileId: "FILE_ID", name: "Copy of Report", parents: ["FOLDER_ID"] }),
      },
      {
        name: "move_file",
        displayName: "Move File",
        description: "Move a file to a different folder in Google Drive.",
        method: "PATCH" as const,
        path: "/drive/v3/files/{fileId}",
        pathParams: JSON.stringify([
          { name: "fileId", type: "string", required: true, description: "File ID to move" },
        ]),
        queryParams: JSON.stringify([
          { name: "addParents", type: "string", description: "ID of the destination folder" },
          { name: "removeParents", type: "string", description: "ID of the current parent folder to remove" },
        ]),
        bodySchema: JSON.stringify({ type: "object", properties: {} }),
        aiUsageHint: "Move a Google Drive file to a different folder. Provide addParents (destination folder ID) and removeParents (current folder ID).",
        exampleArgs: JSON.stringify({ fileId: "FILE_ID", addParents: "DEST_FOLDER_ID", removeParents: "SOURCE_FOLDER_ID" }),
      },
      {
        name: "delete_file",
        displayName: "Delete File",
        description: "Permanently delete a file or folder from Google Drive (moves to trash).",
        method: "DELETE" as const,
        path: "/drive/v3/files/{fileId}",
        pathParams: JSON.stringify([
          { name: "fileId", type: "string", required: true, description: "File or folder ID to delete" },
        ]),
        aiUsageHint: "Delete a Google Drive file or folder. This moves it to trash. Confirm with user before deleting.",
        exampleArgs: JSON.stringify({ fileId: "FILE_ID" }),
      },
      {
        name: "share_file",
        displayName: "Share File",
        description: "Share a Google Drive file with a user, group, or make it public.",
        method: "POST" as const,
        path: "/drive/v3/files/{fileId}/permissions",
        pathParams: JSON.stringify([
          { name: "fileId", type: "string", required: true, description: "File or folder ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "sendNotificationEmail", type: "boolean", description: "Send email notification to the shared user", default: true },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["role", "type"],
          properties: {
            role: { type: "string", enum: ["owner", "organizer", "fileOrganizer", "writer", "commenter", "reader"], description: "Permission level" },
            type: { type: "string", enum: ["user", "group", "domain", "anyone"], description: "Who to share with" },
            emailAddress: { type: "string", description: "Email of the user/group to share with (required for type=user/group)" },
          },
        }),
        aiUsageHint: "Share a Google Drive file. For sharing with a specific person: type='user', role='reader' or 'writer', emailAddress='user@example.com'. For public access: type='anyone', role='reader'.",
        exampleArgs: JSON.stringify({ fileId: "FILE_ID", role: "reader", type: "user", emailAddress: "colleague@example.com" }),
      },
      {
        name: "search_files",
        displayName: "Search Files",
        description: "Search Google Drive files with a query string. Shortcut for list_files with a q parameter.",
        method: "GET" as const,
        path: "/drive/v3/files",
        queryParams: JSON.stringify([
          { name: "q", type: "string", required: true, description: "Search query. Examples: fullText contains 'invoice', name = 'Budget.xlsx', modifiedTime > '2026-01-01T00:00:00'" },
          { name: "pageSize", type: "number", default: 20 },
          { name: "fields", type: "string", default: "files(id,name,mimeType,modifiedTime,webViewLink)" },
        ]),
        aiUsageHint: "Full-text search across Google Drive. Use fullText contains 'keyword' to search file contents. Use name = 'exact name' for exact match. Use name contains 'partial' for partial match.",
        exampleArgs: JSON.stringify({ q: "fullText contains 'Q4 revenue' and mimeType != 'application/vnd.google-apps.folder'", pageSize: 10 }),
      },
      {
        name: "list_permissions",
        displayName: "List File Permissions",
        description: "List who has access to a specific Google Drive file.",
        method: "GET" as const,
        path: "/drive/v3/files/{fileId}/permissions",
        pathParams: JSON.stringify([
          { name: "fileId", type: "string", required: true, description: "File or folder ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "fields", type: "string", default: "permissions(id,role,type,emailAddress,displayName)" },
        ]),
        aiUsageHint: "List all users and groups who have access to a Google Drive file and their permission levels.",
        exampleArgs: JSON.stringify({ fileId: "FILE_ID" }),
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
      message: "✅ Google Drive blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Enable Google Drive API in Google Cloud Console",
        "2. Add drive scopes to your existing Google OAuth app",
        "3. OAUTH_SECRET_GOOGLE should already be set from Gmail/Sheets/Calendar",
        "4. Update clientId to match your Google OAuth app client ID",
      ],
    };
  },
});
