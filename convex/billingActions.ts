"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Create a Stripe Checkout session for subscription.
 * Returns the checkout URL to redirect the user to.
 */
export const createCheckoutSession = action({
  args: {
    plan: v.union(v.literal("business"), v.literal("enterprise"), v.literal("enterprise_plus")),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" as any });

    // Map plan to Stripe price ID
    const priceMap: Record<string, string | undefined> = {
      business: process.env.STRIPE_PRICE_BUSINESS,
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
      enterprise_plus: process.env.STRIPE_PRICE_ENTERPRISE_PLUS,
    };

    const priceId = priceMap[args.plan];
    if (!priceId) throw new Error(`No Stripe price configured for plan: ${args.plan}`);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
      client_reference_id: identity.subject,
      metadata: { plan: args.plan, userId: identity.subject },
    });

    return { url: session.url };
  },
});

/**
 * Create a Stripe Customer Portal session for subscription management.
 */
export const createPortalSession = action({
  args: {
    returnUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const sub = await ctx.runQuery(api.billing.getSubscription);
    if (!sub) throw new Error("No active subscription found");

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" as any });

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: args.returnUrl,
    });

    return { url: session.url };
  },
});

/**
 * Handle Stripe webhook events.
 * Called from the HTTP endpoint in http.ts.
 */
export const handleWebhook = action({
  args: {
    payload: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" as any });

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not configured");

    let event;
    try {
      event = stripe.webhooks.constructEvent(args.payload, args.signature, webhookSecret);
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        const plan = sub.metadata?.plan ?? "business";
        await ctx.runMutation(api.billing.upsertSubscription, {
          stripeCustomerId: sub.customer as string,
          stripeSubscriptionId: sub.id,
          plan: plan as "business" | "enterprise" | "enterprise_plus",
          status: sub.status as any,
          currentPeriodStart: sub.current_period_start * 1000,
          currentPeriodEnd: sub.current_period_end * 1000,
          cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
          trialEnd: sub.trial_end ? sub.trial_end * 1000 : undefined,
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        await ctx.runMutation(api.billing.upsertSubscription, {
          stripeCustomerId: sub.customer as string,
          stripeSubscriptionId: sub.id,
          plan: (sub.metadata?.plan ?? "business") as "business" | "enterprise" | "enterprise_plus",
          status: "cancelled",
          currentPeriodStart: sub.current_period_start * 1000,
          currentPeriodEnd: sub.current_period_end * 1000,
          cancelAtPeriodEnd: true,
        });
        break;
      }
      default:
        // Ignore other event types
        break;
    }

    return { received: true };
  },
});
