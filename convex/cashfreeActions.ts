"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const CASHFREE_API_VERSION = "2025-01-01";

function getCashfreeBaseUrl(): string {
  const env = process.env.CASHFREE_ENVIRONMENT ?? "production";
  return env === "sandbox"
    ? "https://sandbox.cashfree.com/pg"
    : "https://api.cashfree.com/pg";
}

function getCashfreeHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-api-version": CASHFREE_API_VERSION,
    "x-client-id": process.env.CASHFREE_CLIENT_ID!,
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
  };
}

/**
 * Create a Cashfree subscription for the Individual plan.
 * Returns the payment link URL to redirect the user to.
 */
export const createSubscription = action({
  args: {
    plan: v.union(v.literal("individual"), v.literal("business"), v.literal("enterprise"), v.literal("enterprise_plus")),
    customerEmail: v.string(),
    customerPhone: v.string(),
    customerName: v.string(),
    returnUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
      throw new Error("Cashfree credentials not configured");
    }

    // Plan pricing map (amounts in INR paise or smallest currency unit)
    const planPricing: Record<string, { amount: number; currency: string; name: string }> = {
      individual: { amount: 4999, currency: "INR", name: "Valence AI Individual" },
      business: { amount: 209900, currency: "INR", name: "Valence AI Business" },
      enterprise: { amount: 419900, currency: "INR", name: "Valence AI Enterprise" },
    };

    const pricing = planPricing[args.plan];
    if (!pricing) throw new Error(`No pricing configured for plan: ${args.plan}`);

    const subscriptionId = `val_${args.plan}_${identity.subject}_${Date.now()}`;

    const body = {
      subscription_id: subscriptionId,
      customer_details: {
        customer_name: args.customerName,
        customer_email: args.customerEmail,
        customer_phone: args.customerPhone,
      },
      plan_details: {
        plan_name: pricing.name,
        plan_type: "PERIODIC",
        plan_currency: pricing.currency,
        plan_recurring_amount: pricing.amount,
        plan_max_cycles: 120, // 10 years max
        plan_interval_type: "MONTH",
        plan_intervals: 1,
      },
      subscription_meta: {
        return_url: args.returnUrl,
        notification_channel: ["EMAIL"],
      },
      subscription_tags: {
        plan: args.plan,
        userId: identity.subject,
      },
    };

    const response = await fetch(`${getCashfreeBaseUrl()}/subscriptions`, {
      method: "POST",
      headers: getCashfreeHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cashfree subscription creation failed: ${error}`);
    }

    const data = await response.json();

    return {
      subscriptionId: data.subscription_id,
      cfSubscriptionId: data.cf_subscription_id,
      paymentLink: data.subscription_payment_link ?? data.data?.payment_link,
      sessionId: data.subscription_session_id,
      status: data.subscription_status,
    };
  },
});

/**
 * Handle Cashfree webhook events for subscription lifecycle.
 */
export const handleWebhook = action({
  args: {
    payload: v.string(),
    signature: v.string(),
    timestamp: v.string(),
  },
  handler: async (ctx, args) => {
    const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("CASHFREE_WEBHOOK_SECRET not configured");

    // Verify webhook signature (HMAC-SHA256)
    const crypto = await import("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(args.timestamp + args.payload)
      .digest("base64");

    if (args.signature !== expectedSignature) {
      throw new Error("Cashfree webhook signature verification failed");
    }

    const event = JSON.parse(args.payload);
    const eventType = event.type ?? event.event;
    const subData = event.data?.subscription ?? event.data;

    if (!subData) {
      return { received: true, ignored: true };
    }

    // Map Cashfree status to our status
    const statusMap: Record<string, string> = {
      INITIALIZED: "trialing",
      ACTIVE: "active",
      ON_HOLD: "past_due",
      PAUSED: "paused",
      COMPLETED: "cancelled",
      CANCELLED: "cancelled",
    };

    const cfStatus = subData.subscription_status ?? subData.status;
    const ourStatus = statusMap[cfStatus] ?? "paused";

    // Extract plan from tags
    const tags = subData.subscription_tags ?? {};
    const plan = tags.plan ?? "individual";
    const userId = tags.userId;

    const now = Date.now();
    const periodStart = now;
    const periodEnd = now + 30 * 24 * 60 * 60 * 1000; // +30 days

    await ctx.runMutation(api.billing.upsertSubscription, {
      gateway: "cashfree" as const,
      gatewayCustomerId: subData.customer_details?.customer_id ?? userId ?? "unknown",
      gatewaySubscriptionId: subData.cf_subscription_id?.toString() ?? subData.subscription_id,
      plan: plan as "individual" | "business" | "enterprise" | "enterprise_plus",
      status: ourStatus as "active" | "past_due" | "cancelled" | "trialing" | "paused",
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: cfStatus === "COMPLETED" || cfStatus === "CANCELLED",
    });

    // If individual plan just became active, trigger auto-provisioning
    if (ourStatus === "active" && plan === "individual") {
      // Schedule provisioning (will be implemented in provisioning.ts)
      // For now, log the event
      console.log(`[Cashfree] Individual plan activated for user ${userId}, triggering provisioning`);
    }

    return { received: true };
  },
});

/**
 * Get subscription status from Cashfree.
 */
export const getSubscriptionStatus = action({
  args: {
    subscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const response = await fetch(
      `${getCashfreeBaseUrl()}/subscriptions/${args.subscriptionId}`,
      {
        method: "GET",
        headers: getCashfreeHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch subscription: ${error}`);
    }

    return await response.json();
  },
});

/**
 * Cancel a Cashfree subscription.
 */
export const cancelSubscription = action({
  args: {
    subscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const response = await fetch(
      `${getCashfreeBaseUrl()}/subscriptions/${args.subscriptionId}/cancel`,
      {
        method: "POST",
        headers: getCashfreeHeaders(),
        body: JSON.stringify({
          cancellation_reason: "User requested cancellation",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to cancel subscription: ${error}`);
    }

    return await response.json();
  },
});
