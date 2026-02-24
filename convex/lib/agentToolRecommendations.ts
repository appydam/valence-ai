/**
 * Agent-to-Integration Tool Recommendations
 * Maps agent roles to recommended integration tools based on their function
 */

import { AgentName } from "../schema";

export const AGENT_TOOL_RECOMMENDATIONS: Record<
  AgentName,
  {
    categories: string[];
    blueprintSlugs: string[];
    priority: number; // 1-3, lower = higher priority
  }
> = {
  Scout: {
    categories: ["CRM", "Analytics", "Knowledge Management", "Research"],
    blueprintSlugs: [
      "salesforce",
      "hubspot",
      "pipedrive",
      "zoho-crm",
      "notion",
      "confluence",
      "google-docs",
      "coda",
      "google-analytics",
      "mixpanel",
      "amplitude",
      "bigquery",
      "linkedin",
      "apollo",
    ],
    priority: 1,
  },
  Forge: {
    categories: [
      "Project Management",
      "Development",
      "DevOps",
      "Infrastructure",
    ],
    blueprintSlugs: [
      "github",
      "jira",
      "linear",
      "azure-devops",
      "aws-s3",
      "sentry",
      "datadog",
      "pagerduty",
      "github-actions",
      "vercel",
      "heroku",
    ],
    priority: 1,
  },
  Ghost: {
    categories: ["Communication", "Social Media", "Email", "Content"],
    blueprintSlugs: [
      "slack",
      "linkedin",
      "twitter",
      "facebook",
      "gmail",
      "outlook",
      "mailchimp",
      "emarsys",
      "whatsapp",
      "substack",
      "medium",
    ],
    priority: 1,
  },
  Kaze: {
    categories: ["Communication", "Productivity", "Coordination"],
    blueprintSlugs: [
      "slack",
      "google-calendar",
      "gmail",
      "pagerduty",
      "notion",
    ],
    priority: 1,
  },
  Sentinel: {
    categories: [],
    blueprintSlugs: [],
    priority: 3,
  },
};

/**
 * Filter tools by agent role, returning recommended tools and other available tools
 */
export function filterToolsByAgentRole(
  allTools: any[],
  agentName: AgentName
): { recommended: any[]; other: any[] } {
  const recommendations = AGENT_TOOL_RECOMMENDATIONS[agentName] ?? { blueprintSlugs: [] };

  const recommended = allTools.filter((tool) =>
    recommendations.blueprintSlugs.includes(tool.blueprintSlug)
  );

  const other = allTools.filter(
    (tool) => !recommendations.blueprintSlugs.includes(tool.blueprintSlug)
  );

  return { recommended, other };
}

/**
 * Get recommended blueprint slugs for an agent role
 */
export function getRecommendedBlueprints(agentName: AgentName): string[] {
  return AGENT_TOOL_RECOMMENDATIONS[agentName].blueprintSlugs;
}

/**
 * Get recommended categories for an agent role
 */
export function getRecommendedCategories(agentName: AgentName): string[] {
  return AGENT_TOOL_RECOMMENDATIONS[agentName].categories;
}

/**
 * Check if a blueprint is recommended for an agent role
 */
export function isRecommendedForAgent(
  blueprintSlug: string,
  agentName: AgentName
): boolean {
  return AGENT_TOOL_RECOMMENDATIONS[agentName].blueprintSlugs.includes(
    blueprintSlug
  );
}
