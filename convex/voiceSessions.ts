import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Create a new voice session */
export const create = mutation({
  args: {
    userId: v.string(),
    target: v.string(),
    sessionType: v.union(v.literal("command"), v.literal("briefing")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("voiceSessions", {
      userId: args.userId,
      target: args.target,
      status: "active",
      startedAt: Date.now(),
      turnCount: 0,
      transcriptCount: 0,
      sessionType: args.sessionType,
    });
  },
});

/** End a voice session */
export const end = mutation({
  args: { sessionId: v.id("voiceSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return;
    await ctx.db.patch(args.sessionId, {
      status: "ended",
      endedAt: Date.now(),
      durationMs: Date.now() - session.startedAt,
    });
  },
});

/** Save a transcript entry */
export const addTranscript = mutation({
  args: {
    sessionId: v.id("voiceSessions"),
    speaker: v.string(),
    content: v.string(),
    isFinal: v.boolean(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("voiceTranscripts", {
      sessionId: args.sessionId,
      speaker: args.speaker,
      content: args.content,
      timestamp: Date.now(),
      isFinal: args.isFinal,
    });
    const session = await ctx.db.get(args.sessionId);
    if (session) {
      await ctx.db.patch(args.sessionId, {
        transcriptCount: session.transcriptCount + 1,
        ...(args.speaker === "user" ? { turnCount: session.turnCount + 1 } : {}),
      });
    }
    return id;
  },
});

/** Get transcripts for a session */
export const getTranscripts = query({
  args: { sessionId: v.id("voiceSessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("voiceTranscripts")
      .withIndex("by_session_time", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});

/** List recent voice sessions for a user */
export const listRecent = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("voiceSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 10);
  },
});
