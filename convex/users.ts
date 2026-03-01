import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { checkPlanLimit } from "./lib/planGating";

// Get or create a user based on Clerk data
export const getOrCreateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      // Update user info if changed
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
      });
      return existing._id;
    }

    // Check if this is the first user — auto-assign admin role
    const allUsers = await ctx.db.query("users").take(1);
    const isFirstUser = allUsers.length === 0;

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      role: isFirstUser ? "admin" : "member",
      createdAt: Date.now(),
    });

    return userId;
  },
});

// Get current user from auth context
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user;
  },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// List all users (for getting INTEGRATION_USER_ID)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// List team members with roles
export const listTeamMembers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({
      _id: u._id,
      clerkId: u.clerkId,
      email: u.email,
      name: u.name,
      avatarUrl: u.avatarUrl,
      role: u.role ?? "member",
      createdAt: u.createdAt,
    }));
  },
});

// Update a user's role (admin only)
export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

// Invite a new user (creates a pending user record)
export const inviteUser = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    invitedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Plan limit check
    const planCheck = await checkPlanLimit(ctx, "users");
    if (!planCheck.allowed) {
      throw new Error(`Plan limit reached: ${planCheck.current}/${planCheck.limit} users (${planCheck.plan} plan). Upgrade to invite more team members.`);
    }

    // Check if user with this email already exists
    const existing = await ctx.db.query("users").collect();
    const emailExists = existing.find((u) => u.email === args.email);
    if (emailExists) {
      throw new Error("A user with this email already exists");
    }

    // Create a pending user record — they'll get linked when they sign up via Clerk
    return await ctx.db.insert("users", {
      clerkId: `pending_${Date.now()}`, // Placeholder until they sign in
      email: args.email,
      role: args.role,
      invitedBy: args.invitedBy,
      createdAt: Date.now(),
    });
  },
});
