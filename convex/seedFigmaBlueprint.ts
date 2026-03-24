/**
 * Seed Figma integration blueprint
 * Run this once to create the Figma blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedFigmaBlueprint -> Run
 *
 * Prerequisites:
 * 1. Register an app at https://www.figma.com/developers/apps
 *    - Add callback URL: https://<YOUR_DEPLOYMENT>.convex.site/api/integrations/oauth/callback
 *    - Request scopes: files:read, file_comments:write, file_comments:read
 * 2. Set in Convex env vars:
 *    - FIGMA_CLIENT_ID = Client ID from app registration
 *    - OAUTH_SECRET_FIGMA = Client Secret from app registration
 */

import { mutation, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";


export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "figma"))
      .first();

    if (existing) {
      return {
        message: "Figma blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "figma",
      name: "Figma",
      description:
        "Design collaboration platform. Access Figma files, export frames as images, read and post comments, and browse team projects. Enable AI agents to reference and interact with design work.",
      category: "Design",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: process.env.FIGMA_CLIENT_ID || "YOUR_FIGMA_CLIENT_ID",
        clientSecret: "OAUTH_SECRET_FIGMA",
        authorizeUrl: "https://www.figma.com/oauth",
        tokenUrl: "https://api.figma.com/v1/oauth/token",
        scopes: ["current_user:read", "file_content:read", "file_metadata:read", "file_comments:read", "file_comments:write", "projects:read"],
        scopeSeparator: ",",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://api.figma.com/v1",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://www.figma.com/developers/api",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/figma-icon.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "get_me",
        displayName: "Get Current User",
        description:
          "Get the currently authenticated Figma user. No parameters required. Use this to verify the connection is working.",
        method: "GET" as const,
        path: "/me",
        aiUsageHint:
          "Call this to verify the Figma connection is active and get the current user info (name, email, handle).",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "get_file",
        displayName: "Get File",
        description:
          "Get a Figma file's full structure including pages, frames, components, and layers. Use depth parameter to limit response size.",
        method: "GET" as const,
        path: "/files/{file_key}",
        pathParams: JSON.stringify([
          {
            name: "file_key",
            type: "string",
            required: true,
            description:
              "Figma file key (from the URL: figma.com/file/{file_key}/...)",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "depth",
            type: "number",
            description:
              "How deep into the node tree to traverse. 1 = pages only, 2 = pages + top-level frames",
          },
          {
            name: "geometry",
            type: "string",
            description: "Set to 'paths' to include vector path data",
          },
        ]),
        aiUsageHint:
          "Get a Figma file's structure. Use depth=2 for a quick overview of pages and frames without deep component trees. The file_key is in the URL after /file/.",
        exampleArgs: JSON.stringify({
          file_key: "abc123DEFghiJKL",
          depth: 2,
        }),
      },
      {
        name: "get_file_nodes",
        displayName: "Get File Nodes",
        description:
          "Get specific nodes (frames, components, groups) from a Figma file by their node IDs. More efficient than fetching the entire file.",
        method: "GET" as const,
        path: "/files/{file_key}/nodes",
        pathParams: JSON.stringify([
          {
            name: "file_key",
            type: "string",
            required: true,
            description: "Figma file key",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "ids",
            type: "string",
            required: true,
            description:
              "Comma-separated node IDs. Example: '1:2,1:3'. Find IDs from get_file or Figma's Inspect panel.",
          },
          {
            name: "depth",
            type: "number",
            description: "Depth of children to include",
          },
        ]),
        aiUsageHint:
          "Fetch specific frames/components by ID. More efficient than get_file for targeted lookups. Node IDs use format '1:2' (page:node).",
        exampleArgs: JSON.stringify({
          file_key: "abc123DEFghiJKL",
          ids: "1:2,1:3",
        }),
      },
      {
        name: "get_comments",
        displayName: "Get Comments",
        description:
          "Get all comments on a Figma file. Returns comment text, author, position, and thread structure.",
        method: "GET" as const,
        path: "/files/{file_key}/comments",
        pathParams: JSON.stringify([
          {
            name: "file_key",
            type: "string",
            required: true,
            description: "Figma file key",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "as_md",
            type: "boolean",
            description: "Return comment text as markdown",
          },
        ]),
        aiUsageHint:
          "Get all comments on a Figma file. Use as_md=true for markdown-formatted comment text.",
        exampleArgs: JSON.stringify({
          file_key: "abc123DEFghiJKL",
          as_md: true,
        }),
      },
      {
        name: "post_comment",
        displayName: "Post Comment",
        description:
          "Post a new comment on a Figma file. Optionally pin the comment to a specific position on the canvas or reply to an existing comment thread.",
        method: "POST" as const,
        path: "/files/{file_key}/comments",
        pathParams: JSON.stringify([
          {
            name: "file_key",
            type: "string",
            required: true,
            description: "Figma file key",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["message"],
          properties: {
            message: {
              type: "string",
              description: "Comment text",
            },
            client_meta: {
              type: "object",
              description:
                "Position to pin the comment. Contains node_id and/or x,y coordinates.",
              properties: {
                node_id: {
                  type: "string",
                  description: "Node ID to attach the comment to",
                },
                node_offset: {
                  type: "object",
                  properties: {
                    x: { type: "number" },
                    y: { type: "number" },
                  },
                },
              },
            },
            comment_id: {
              type: "string",
              description:
                "Parent comment ID to reply to (for threaded comments)",
            },
          },
        }),
        aiUsageHint:
          "Post a comment on a Figma file. Use client_meta.node_id to pin to a specific frame. Use comment_id to reply to an existing thread.",
        exampleArgs: JSON.stringify({
          file_key: "abc123DEFghiJKL",
          message:
            "The spacing between these buttons looks off — can we increase it to 16px?",
          client_meta: { node_id: "1:42" },
        }),
      },
      {
        name: "get_file_images",
        displayName: "Export Images",
        description:
          "Export specific nodes from a Figma file as PNG, JPG, SVG, or PDF. Returns download URLs for each node.",
        method: "GET" as const,
        path: "/images/{file_key}",
        pathParams: JSON.stringify([
          {
            name: "file_key",
            type: "string",
            required: true,
            description: "Figma file key",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "ids",
            type: "string",
            required: true,
            description: "Comma-separated node IDs to export",
          },
          {
            name: "format",
            type: "string",
            description: "Export format: png, jpg, svg, pdf",
            default: "png",
          },
          {
            name: "scale",
            type: "number",
            description: "Export scale (1 = 1x, 2 = 2x retina). Default 1.",
            default: 1,
          },
        ]),
        aiUsageHint:
          "Export frames/components as images. Returns temporary download URLs. Use scale=2 for retina quality. SVG format for vector assets.",
        exampleArgs: JSON.stringify({
          file_key: "abc123DEFghiJKL",
          ids: "1:2,1:3",
          format: "png",
          scale: 2,
        }),
      },
      {
        name: "list_projects",
        displayName: "List Team Projects",
        description:
          "List all projects in a Figma team. Projects contain files organized by topic or workstream.",
        method: "GET" as const,
        path: "/teams/{team_id}/projects",
        pathParams: JSON.stringify([
          {
            name: "team_id",
            type: "string",
            required: true,
            description:
              "Figma team ID (from team URL or team settings)",
          },
        ]),
        aiUsageHint:
          "List projects in a team. Each project contains multiple Figma files. Team ID is visible in the team URL.",
        exampleArgs: JSON.stringify({ team_id: "1234567890" }),
      },
      {
        name: "list_project_files",
        displayName: "List Project Files",
        description:
          "List all files in a Figma project. Returns file names, last modified dates, and thumbnail URLs.",
        method: "GET" as const,
        path: "/projects/{project_id}/files",
        pathParams: JSON.stringify([
          {
            name: "project_id",
            type: "string",
            required: true,
            description: "Figma project ID",
          },
        ]),
        aiUsageHint:
          "List files in a project. Returns file keys (needed for other API calls), names, and thumbnails.",
        exampleArgs: JSON.stringify({ project_id: "9876543" }),
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
      message: "✅ Figma blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Register an app at https://www.figma.com/developers/apps",
        "2. Set callback URL: https://<YOUR_DEPLOYMENT>.convex.site/api/integrations/oauth/callback",
        "3. Request scopes: files:read, file_comments:write, file_comments:read",
        "4. Set FIGMA_CLIENT_ID in Convex env vars",
        "5. Set OAUTH_SECRET_FIGMA in Convex env vars",
      ],
    };
  },
});

/**
 * Patch the live Figma blueprint's authConfig with the real client ID from env vars.
 * Run this after setting FIGMA_CLIENT_ID in Convex env vars.
 *
 * Usage: npx convex run seedFigmaBlueprint:patchClientId
 */
export const patchClientId = action({
  args: {},
  handler: async (ctx) => {
    const clientId = process.env.FIGMA_CLIENT_ID;
    if (!clientId || clientId === "YOUR_FIGMA_CLIENT_ID") {
      throw new Error("FIGMA_CLIENT_ID env var is not set in Convex");
    }

    await ctx.runMutation(internal.seedFigmaBlueprint.applyClientId, { clientId });
    return { ok: true, clientId };
  },
});

export const applyClientId = mutation({
  args: { clientId: v.string() },
  handler: async (ctx, { clientId }) => {
    const blueprint = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "figma"))
      .first();

    if (!blueprint) throw new Error("Figma blueprint not found — run the seed first");

    const authConfig = JSON.parse(blueprint.authConfig);
    authConfig.clientId = clientId;

    await ctx.db.patch(blueprint._id, {
      authConfig: JSON.stringify(authConfig),
      updatedAt: Date.now(),
    });

    return { ok: true };
  },
});
