import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

export function useOutboundMission() {
  const { triggerAgent, loading } = useAgentTrigger();
  const { isConnected } = useIntegrationCall();

  const launchFullPipeline = async (description: string) => {
    const integrations = [
      isConnected("apollo") && "Apollo",
      isConnected("clay") && "Clay",
      isConnected("hubspot") && "HubSpot",
      isConnected("lagrowthmachine") && "LaGrowthMachine",
    ].filter(Boolean).join(", ");

    const fullDescription = `FULL OUTBOUND PIPELINE MISSION — AI Outbound Engine

User Goal: "${description}"

Connected Integrations: ${integrations || "None"}

Create a multi-task mission with dependencies:

1. [Scout] Company Research — Search FREE web sources (Crunchbase, Google, TechCrunch, ProductHunt, LinkedIn) for companies matching criteria. Use Apollo organization_enrich (by domain) ONLY to enrich found companies — that's free. Do NOT use Apollo people search or credits. Tag: stage:companies
2. [Scout] Contact Discovery — Find decision-maker contacts via FREE sources: LinkedIn public profiles, company /about pages, Google search ("name" site:linkedin.com), Crunchbase. Do NOT use Apollo people_enrich or people_search (costs credits). Detect email patterns from company domain. Tag: stage:contacts
3. [Forge] Contact Enrichment — Push contacts to Clay for enrichment if available, otherwise compile from Scout's research. Use Apollo organization_enrich (free, by domain) for company data only. Tag: stage:enriched
4. [Forge] CRM Push — Create contacts in HubSpot, organize into a campaign list. Tag: stage:crm
5. [Ghost] Email Sequence — Draft a 4-step cold email sequence with merge tags. Tag: stage:sequences, channel:email
6. [Ghost] LinkedIn Messages — Draft LinkedIn connection request + 2 follow-up messages. Tag: stage:sequences, channel:linkedin
7. [Sentinel] Quality Review — Review all sequences for quality, spam compliance, and tone.

Each task should include "niche:outbound" tag. Tasks 2 depends on 1, 3 depends on 2, 4 depends on 3, 5-6 parallel with 3-4, 7 depends on 5+6.

Break this into the above tasks and delegate to the right agents.`;

    return triggerAgent("Kaze", "Full Outbound Pipeline", fullDescription, ["niche:outbound", "mission:full-pipeline"], {
      priority: "urgent",
    });
  };

  return { launchFullPipeline, loading };
}
