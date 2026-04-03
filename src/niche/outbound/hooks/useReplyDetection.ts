import { useState, useCallback } from "react";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useProductContext } from "./useProductContext";

export type ReplyCategory = "interested" | "not_now" | "unsubscribe" | "ooo" | "bounce" | "question" | "referral";

export interface DetectedReply {
  id: string;
  contactName: string;
  contactEmail: string;
  company: string;
  category: ReplyCategory;
  summary: string;
  suggestedAction: string;
  timestamp: number;
  handled: boolean;
}

const CATEGORY_CONFIG: Record<ReplyCategory, { label: string; color: string; action: string; emoji: string }> = {
  interested: { label: "Interested", color: "#22c55e", action: "Create HubSpot deal + Slack alert", emoji: "🔥" },
  not_now: { label: "Not Now", color: "#f59e0b", action: "Add to 90-day re-engagement list", emoji: "⏳" },
  unsubscribe: { label: "Unsubscribe", color: "#ef4444", action: "Remove from all sequences", emoji: "🚫" },
  ooo: { label: "Out of Office", color: "#8b5cf6", action: "Reschedule follow-up for return date", emoji: "✈️" },
  bounce: { label: "Bounced", color: "#6b7280", action: "Mark email invalid, find alternative", emoji: "📭" },
  question: { label: "Question", color: "#3b82f6", action: "Draft personalized response", emoji: "❓" },
  referral: { label: "Referral", color: "#10b981", action: "Create new contact from referral", emoji: "🤝" },
};

export function useReplyDetection() {
  const { triggerAgent, loading } = useAgentTrigger();
  const { getPromptContext } = useProductContext();

  const scanForReplies = useCallback(async () => {
    const productCtx = getPromptContext();
    return triggerAgent(
      "Scout",
      "Scan inbox for campaign replies",
      `REPLY DETECTION — AI Outbound Engine

Scan Gmail inbox for replies to outbound campaign emails.
${productCtx ? `\n--- PRODUCT CONTEXT ---\n${productCtx}` : ""}

For each reply found, classify into one of these categories:
- interested: Shows buying intent, asks for demo/call/pricing
- not_now: Polite decline, bad timing, "maybe later"
- unsubscribe: Wants to be removed from emails
- ooo: Out of office auto-reply (extract return date if present)
- bounce: Email bounced / delivery failure
- question: Asks a question about the product (not a buying signal)
- referral: Refers to someone else ("talk to our VP of...")

For INTERESTED replies:
1. Create a HubSpot deal with the contact info
2. Send a Slack notification: "🔥 Hot lead: [Name] at [Company] replied interested"
3. Draft a personalized response

For NOT_NOW replies:
1. Tag contact in HubSpot with "re-engage-90d" and set a reminder for 90 days
2. Remove from active sequences

For UNSUBSCRIBE:
1. Remove from all sequences immediately
2. Add to suppression list in HubSpot

For OOO:
1. Pause sequence, reschedule for return date + 2 days

For BOUNCE:
1. Mark email as invalid in HubSpot
2. Flag for Scout to find alternative email

Deliver a structured report of all replies found and actions taken.`,
      ["niche:outbound", "reply-detection"],
      { priority: "urgent" }
    );
  }, [triggerAgent, getPromptContext]);

  return { scanForReplies, loading, CATEGORY_CONFIG };
}
