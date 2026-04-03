import { useCallback } from "react";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useProductContext } from "./useProductContext";

export function useFollowUpAgent() {
  const { triggerAgent, loading } = useAgentTrigger();
  const { getPromptContext } = useProductContext();

  const runFollowUpAnalysis = useCallback(async () => {
    const productCtx = getPromptContext();
    return triggerAgent(
      "Kaze",
      "AI follow-up analysis for stale sequences",
      `AI FOLLOW-UP AGENT — AI Outbound Engine
${productCtx ? `\n--- PRODUCT CONTEXT ---\n${productCtx}` : ""}

Analyze all contacts who completed a full email sequence without replying. For each:

1. DIAGNOSE: Why didn't they reply?
   - Wrong pain point angle? (check if email referenced the right pain for their role)
   - Wrong timing? (check if they were OOO, or company was in a bad quarter)
   - Wrong persona? (is this person actually a decision-maker?)
   - Email too long/short? Too salesy? Not enough value?
   - Email bounced silently? (check delivery status)

2. DECIDE: What to do next?
   - TRY DIFFERENT ANGLE: Create a new single email with a completely different hook. Assign to Ghost.
     Example: If original was pain-based, try value-drop (share a useful resource). If original was formal, try casual.
   - ESCALATE: Find their boss or a different contact at the same company. Assign to Scout.
   - RE-ENGAGE LATER: Add to 90-day drip list with a "checking in" email.
   - DROP: If company doesn't fit ICP or contact is clearly wrong persona, remove from pipeline.

3. EXECUTE: For contacts getting a different angle:
   - Create a task for Ghost to write ONE follow-up email with the new approach
   - The email should NOT reference the previous emails (fresh start)
   - Include the diagnosis in the task so Ghost knows what to change

Deliver a report: how many contacts analyzed, breakdown by decision (retry/escalate/re-engage/drop), and tasks created.`,
      ["niche:outbound", "follow-up-agent"],
      { priority: "medium" }
    );
  }, [triggerAgent, getPromptContext]);

  return { runFollowUpAnalysis, loading };
}
