import { mutation } from "./_generated/server";

/** Generate a Convex upload URL — browser POSTs file directly to Convex storage */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
