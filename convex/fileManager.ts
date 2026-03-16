import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const syncStatusValidator = v.union(
  v.literal("synced"),
  v.literal("modified_locally"),
  v.literal("modified_remotely"),
  v.literal("unknown")
);

/**
 * Get the full cached file tree for rendering.
 */
export const getTree = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("fileTreeCache")
      .collect();
  },
});

/**
 * Get cached content for a specific file path.
 */
export const getFileContent = query({
  args: { path: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fileTreeCache")
      .withIndex("by_path", (q) => q.eq("path", args.path))
      .first();
  },
});

/**
 * Get a single file entry by path.
 */
export const getByPath = query({
  args: { path: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fileTreeCache")
      .withIndex("by_path", (q) => q.eq("path", args.path))
      .first();
  },
});

/**
 * Get children of a directory.
 */
export const getChildren = query({
  args: { parentPath: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fileTreeCache")
      .withIndex("by_parent", (q) => q.eq("parentPath", args.parentPath))
      .collect();
  },
});

/**
 * Bulk upsert the file tree from server response.
 * Clears existing entries and replaces with fresh data.
 */
export const cacheTree = mutation({
  args: {
    entries: v.array(v.object({
      path: v.string(),
      relativePath: v.string(),
      name: v.string(),
      type: v.union(v.literal("file"), v.literal("directory")),
      size: v.optional(v.number()),
      modifiedAt: v.optional(v.number()),
      parentPath: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Clear existing cache
    const existing = await ctx.db.query("fileTreeCache").collect();
    for (const entry of existing) {
      await ctx.db.delete(entry._id);
    }

    // Insert fresh entries
    const now = Date.now();
    for (const entry of args.entries) {
      await ctx.db.insert("fileTreeCache", {
        ...entry,
        syncStatus: "synced",
        lastFetchedAt: now,
      });
    }
  },
});

/**
 * Cache file content after fetching from server.
 */
export const cacheFileContent = mutation({
  args: {
    path: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("fileTreeCache")
      .withIndex("by_path", (q) => q.eq("path", args.path))
      .first();

    if (entry) {
      await ctx.db.patch(entry._id, {
        cachedContent: args.content,
        contentUpdatedAt: Date.now(),
        syncStatus: "synced",
      });
    }
  },
});

/**
 * Mark a file as modified locally (edited but not yet synced).
 */
export const updateSyncStatus = mutation({
  args: {
    path: v.string(),
    syncStatus: syncStatusValidator,
    cachedContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("fileTreeCache")
      .withIndex("by_path", (q) => q.eq("path", args.path))
      .first();

    if (entry) {
      const patch: Record<string, unknown> = {
        syncStatus: args.syncStatus,
      };
      if (args.cachedContent !== undefined) {
        patch.cachedContent = args.cachedContent;
        patch.contentUpdatedAt = Date.now();
      }
      await ctx.db.patch(entry._id, patch);
    }
  },
});

/**
 * Remove a file entry from cache (after deletion on server).
 */
export const removeEntry = mutation({
  args: { path: v.string() },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("fileTreeCache")
      .withIndex("by_path", (q) => q.eq("path", args.path))
      .first();

    if (entry) {
      await ctx.db.delete(entry._id);
    }
  },
});

/**
 * Add a new file/directory entry to cache (after creation on server).
 */
export const addEntry = mutation({
  args: {
    path: v.string(),
    relativePath: v.string(),
    name: v.string(),
    type: v.union(v.literal("file"), v.literal("directory")),
    parentPath: v.string(),
    cachedContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("fileTreeCache", {
      path: args.path,
      relativePath: args.relativePath,
      name: args.name,
      type: args.type,
      parentPath: args.parentPath,
      syncStatus: "synced",
      cachedContent: args.cachedContent,
      contentUpdatedAt: args.cachedContent ? Date.now() : undefined,
      lastFetchedAt: Date.now(),
    });
  },
});
