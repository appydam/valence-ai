import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─────────────────────────────────────────────────
// Step definitions per plan/deployment model
// ─────────────────────────────────────────────────

type StepDef = {
  id: string;
  title: string;
  type: "auto" | "manual" | "semi";
};

const INDIVIDUAL_STEPS: StepDef[] = [
  { id: "payment_confirmed", title: "Step 1 — Payment Confirmed", type: "auto" },
  { id: "create_lightsail_instance", title: "Step 2 — Create 4GB Lightsail Instance", type: "auto" },
  { id: "wait_for_running", title: "Step 3 — Wait for Server Ready", type: "auto" },
  { id: "open_ports", title: "Step 4 — Open Firewall Ports", type: "auto" },
  { id: "install_openclaw", title: "Step 5 — Install OpenClaw + Agents", type: "auto" },
  { id: "configure_byok", title: "Step 6 — Configure API Key", type: "auto" },
  { id: "verify_and_activate", title: "Step 7 — Verify & Go Live", type: "auto" },
];

const CLOUD_STEPS: StepDef[] = [
  { id: "create_convex", title: "Step 1 — Create Convex Project", type: "manual" },
  { id: "deploy_and_seed", title: "Step 2 — Deploy + Env Vars + Seed Database", type: "semi" },
  { id: "provision_server_and_vercel", title: "Step 3 — Provision Server + Register Tenant (parallel)", type: "semi" },
  { id: "configure_agent_server", title: "Step 4 — Configure Agent Server (SOUL + env + start)", type: "semi" },
  { id: "oauth_and_verify", title: "Step 5 — OAuth Callbacks + Verify + Smoke Test", type: "semi" },
  { id: "send_invite", title: "Step 6 — Send Admin Invite & Go Live", type: "manual" },
];

const ONPREM_STEPS: StepDef[] = [
  { id: "create_convex", title: "Step 1 — Create Convex Project", type: "manual" },
  { id: "deploy_and_seed", title: "Step 2 — Deploy + Env Vars + Seed Database", type: "semi" },
  { id: "create_vercel", title: "Step 3 — Register Tenant + Add Subdomain", type: "manual" },
  { id: "onprem_server_setup", title: "Step 4 — Share Install Guide + Wait for Customer Server", type: "manual" },
  { id: "oauth_and_verify", title: "Step 5 — OAuth Callbacks + Verify + Smoke Test", type: "semi" },
  { id: "send_invite", title: "Step 6 — Send Admin Invite & Go Live", type: "manual" },
];

function getStepsForPlan(deploymentModel: "cloud" | "onprem", plan?: string) {
  let defs: StepDef[];
  if (plan === "individual") {
    defs = INDIVIDUAL_STEPS;
  } else {
    defs = deploymentModel === "cloud" ? CLOUD_STEPS : ONPREM_STEPS;
  }
  return defs.map((def) => ({
    ...def,
    status: "pending" as const,
  }));
}

// ─────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("customerProvisionings")
      .withIndex("by_created")
      .order("desc")
      .collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customerProvisionings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("customerProvisionings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ─────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────

export const create = mutation({
  args: {
    slug: v.string(),
    companyName: v.string(),
    domain: v.string(),
    adminEmail: v.string(),
    plan: v.union(v.literal("individual"), v.literal("business"), v.literal("enterprise"), v.literal("enterprise_plus")),
    deploymentModel: v.union(v.literal("cloud"), v.literal("onprem")),
    contactName: v.optional(v.string()),
    contactRole: v.optional(v.string()),
    anthropicKeyPreference: v.optional(v.union(v.literal("we_provide"), v.literal("customer_provides"))),
    serverSize: v.optional(v.string()),
    serverRegion: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check for duplicate slug
    const existing = await ctx.db
      .query("customerProvisionings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) throw new Error(`Customer with slug "${args.slug}" already exists`);

    const identity = await ctx.auth.getUserIdentity();
    const createdBy = identity?.subject ?? "system";

    const steps = getStepsForPlan(args.deploymentModel, args.plan);
    const now = Date.now();

    return await ctx.db.insert("customerProvisionings", {
      ...args,
      steps,
      status: "provisioning",
      createdAt: now,
      updatedAt: now,
      createdBy,
    });
  },
});

export const updateInfo = mutation({
  args: {
    id: v.id("customerProvisionings"),
    companyName: v.optional(v.string()),
    domain: v.optional(v.string()),
    adminEmail: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactRole: v.optional(v.string()),
    notes: v.optional(v.string()),
    serverSize: v.optional(v.string()),
    serverRegion: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});

export const updateStep = mutation({
  args: {
    id: v.id("customerProvisionings"),
    stepId: v.string(),
    status: v.union(v.literal("pending"), v.literal("running"), v.literal("done"), v.literal("failed"), v.literal("skipped")),
    failedReason: v.optional(v.string()),
    output: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Customer provisioning not found");

    const steps = doc.steps.map((step) => {
      if (step.id !== args.stepId) return step;
      return {
        ...step,
        status: args.status,
        completedAt: args.status === "done" ? Date.now() : step.completedAt,
        failedReason: args.status === "failed" ? args.failedReason : step.failedReason,
        output: args.output ?? step.output,
      };
    });

    // Auto-compute overall status
    const allDone = steps.every((s) => s.status === "done" || s.status === "skipped");
    const anyFailed = steps.some((s) => s.status === "failed");

    const patch: Record<string, unknown> = {
      steps,
      updatedAt: Date.now(),
    };

    if (allDone) {
      patch.status = "active";
      patch.completedAt = Date.now();
    } else if (anyFailed) {
      patch.status = "failed";
    }

    await ctx.db.patch(args.id, patch);
  },
});

export const updateInfraIds = mutation({
  args: {
    id: v.id("customerProvisionings"),
    convexProject: v.optional(v.string()),
    convexUrl: v.optional(v.string()),
    convexSiteUrl: v.optional(v.string()),
    vercelProject: v.optional(v.string()),
    lightsailIp: v.optional(v.string()),
    lightsailInstance: v.optional(v.string()),
    sshKeyPath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("customerProvisionings"),
    status: v.union(
      v.literal("preflight"),
      v.literal("provisioning"),
      v.literal("verifying"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("failed"),
    ),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.status === "active") {
      patch.completedAt = Date.now();
    }
    await ctx.db.patch(args.id, patch);
  },
});

export const deleteProvisioning = mutation({
  args: { id: v.id("customerProvisionings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ─────────────────────────────────────────────────
// Pilot interest import helper
// ─────────────────────────────────────────────────

export const listPilotInterests = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("pilotInterest")
      .withIndex("by_submitted")
      .order("desc")
      .take(20);
  },
});
