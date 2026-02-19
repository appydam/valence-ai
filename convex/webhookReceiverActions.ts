// @ts-nocheck
"use node";
/**
 * Webhook Event Receiver — Node runtime action
 * Separated from webhookReceiver.ts because signature verification requires Node crypto
 */

import { createHmac, timingSafeEqual } from "crypto";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Receive webhook event (called by HTTP endpoint)
 */
export const receive = action({
  args: {
    urlPath: v.string(),
    eventType: v.string(),
    eventData: v.string(), // JSON-stringified
    headers: v.string(), // JSON-stringified
    rawBody: v.string(), // For signature verification
  },
  handler: async (ctx, args) => {
    try {
      // 1. Get webhook endpoint config
      const endpoint = await ctx.runQuery(api.webhookEndpoints.getByPath, {
        urlPath: args.urlPath,
      });

      if (!endpoint) {
        return {
          success: false,
          error: "Webhook endpoint not found",
          statusCode: 404,
        };
      }

      if (endpoint.status !== "active") {
        return {
          success: false,
          error: "Webhook endpoint is not active",
          statusCode: 403,
        };
      }

      // 2. Verify signature
      const headers = JSON.parse(args.headers);
      const verified = verifySignature(
        endpoint,
        args.rawBody,
        headers
      );

      // 3. Store webhook event
      const eventId = await ctx.runMutation(
        internal.webhookReceiver.storeEvent,
        {
          endpointId: endpoint._id,
          userId: endpoint.userId,
          blueprintId: endpoint.blueprintId,
          eventType: args.eventType,
          eventData: args.eventData,
          headers: args.headers,
          signature: headers[endpoint.signatureHeader || ""] || null,
          verified,
        }
      );

      // 4. Update endpoint stats
      await ctx.runMutation(api.webhookEndpoints.incrementReceived, {
        endpointId: endpoint._id,
      });

      if (!verified) {
        await ctx.runMutation(api.webhookEndpoints.incrementProcessed, {
          endpointId: endpoint._id,
          success: false,
        });

        return {
          success: false,
          error: "Signature verification failed",
          statusCode: 401,
        };
      }

      // 5. Check if event type is allowed
      if (
        !endpoint.eventTypes.includes(args.eventType) &&
        !endpoint.eventTypes.includes("*")
      ) {
        await ctx.runMutation(internal.webhookReceiver.updateEventStatus, {
          eventId,
          status: "ignored",
        });

        return {
          success: true,
          eventId,
          ignored: true,
          reason: "Event type not in allowed list",
        };
      }

      // 6. Get matching automation rules
      const rules = await ctx.runQuery(api.automationRules.getActiveRules, {
        endpointId: endpoint._id,
        eventType: args.eventType,
      });

      if (rules.length === 0) {
        await ctx.runMutation(internal.webhookReceiver.updateEventStatus, {
          eventId,
          status: "processed",
        });

        return {
          success: true,
          eventId,
          processed: false,
          reason: "No matching automation rules",
        };
      }

      // 7. Process each rule
      await ctx.runMutation(internal.webhookReceiver.updateEventStatus, {
        eventId,
        status: "processing",
        processingStartedAt: Date.now(),
      });

      let taskId: Id<"tasks"> | null = null;
      let ruleId: Id<"automationRules"> | null = null;
      let lastError: string | null = null;

      for (const rule of rules) {
        try {
          const result = await ctx.runAction(api.automationRules.execute, {
            ruleId: rule._id,
            eventData: args.eventData,
            eventType: args.eventType,
          });

          if (result.success && result.result?.taskId) {
            taskId = result.result.taskId;
            ruleId = rule._id;
            break; // Stop after first successful rule
          }
        } catch (error: any) {
          lastError = error.message;
          console.error(`Rule execution failed: ${rule.name}`, error);
        }
      }

      // 8. Update event with results
      await ctx.runMutation(internal.webhookReceiver.updateEventResult, {
        eventId,
        status: taskId ? "processed" : "failed",
        taskId,
        ruleId,
        errorMessage: taskId ? undefined : lastError || "No rules succeeded",
        processedAt: Date.now(),
      });

      // 9. Update endpoint stats
      await ctx.runMutation(api.webhookEndpoints.incrementProcessed, {
        endpointId: endpoint._id,
        success: !!taskId,
      });

      return {
        success: true,
        eventId,
        taskId,
        ruleId,
        processed: !!taskId,
      };
    } catch (error: any) {
      console.error("Webhook receive error:", error);
      return {
        success: false,
        error: error.message,
        statusCode: 500,
      };
    }
  },
});

/**
 * Verify webhook signature (inlined from lib/webhookSecurity.ts)
 */
function verifySignature(
  endpoint: any,
  rawBody: string,
  headers: Record<string, string>
): boolean {
  if (endpoint.signatureMethod === "none") {
    return true;
  }

  if (!endpoint.secret) {
    console.error("Signature verification required but no secret configured");
    return false;
  }

  const signatureHeader = endpoint.signatureHeader || "x-signature";
  const signature = headers[signatureHeader.toLowerCase()];

  if (!signature) {
    console.error(`Signature header not found: ${signatureHeader}`);
    return false;
  }

  try {
    const method = endpoint.signatureMethod as string;
    const algorithm = method === "hmac_sha1" ? "sha1" : "sha256";

    const hmac = createHmac(algorithm, endpoint.secret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest("hex");

    // Support "sha256=<hex>" format (GitHub-style)
    const providedHex = signature.startsWith(`${algorithm}=`)
      ? signature.substring(`${algorithm}=`.length)
      : signature;

    if (expectedSignature.length !== providedHex.length) {
      return false;
    }

    return timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(providedHex, "hex")
    );
  } catch (error: any) {
    console.error("Signature verification error:", error.message);
    return false;
  }
}
