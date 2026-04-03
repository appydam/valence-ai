import { useCallback } from "react";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useProductContext } from "./useProductContext";

export interface LeadScore {
  contactName: string;
  company: string;
  score: number; // 0-100
  breakdown: {
    icpFit: number;       // 0-30 — matches ideal customer profile
    engagement: number;    // 0-30 — opened emails, clicked links, visited site
    companySignals: number; // 0-20 — funding, hiring, growth
    timing: number;        // 0-20 — recent activity, urgency signals
  };
  tier: "hot" | "warm" | "cold";
  recommendation: string;
}

export function useLeadScoring() {
  const { triggerAgent, loading } = useAgentTrigger();
  const { getPromptContext } = useProductContext();

  const scoreAllLeads = useCallback(async () => {
    const productCtx = getPromptContext();
    return triggerAgent(
      "Scout",
      "Score all leads in pipeline",
      `LEAD SCORING — AI Outbound Engine
${productCtx ? `\n--- PRODUCT CONTEXT ---\n${productCtx}` : ""}

Score every contact in the outbound pipeline using this framework:

ICP FIT (0-30 points):
- Job title matches target persona: +10
- Company size in target range: +5
- Industry match: +5
- Seniority level (VP/Director/C-suite): +5
- Geography match: +5

ENGAGEMENT (0-30 points):
- Replied to email (any reply): +15
- Replied with interest: +30
- Opened email: +5
- Clicked link in email: +10
- Visited website after email: +15

COMPANY SIGNALS (0-20 points):
- Recent funding round: +10
- Actively hiring in our category: +5
- Using a competitor: +10
- Growing headcount: +5

TIMING (0-20 points):
- Contacted in last 7 days: +5
- Replied in last 48 hours: +15
- OOO and returning soon: +5
- Active on LinkedIn recently: +5

TIERS:
- 70-100: HOT — prioritize immediate follow-up
- 40-69: WARM — continue nurturing
- 0-39: COLD — lower priority or re-evaluate

For each contact, provide the score breakdown and a one-line recommendation.
Deliver as a structured list sorted by score (highest first).`,
      ["niche:outbound", "lead-scoring"],
      { priority: "high" }
    );
  }, [triggerAgent, getPromptContext]);

  return { scoreAllLeads, loading };
}
