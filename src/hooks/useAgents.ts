import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Dynamic agent data hook.
 * Replaces the static AGENT_CONFIG constant for all in-app components.
 * Agents are fetched from the database and include role flags, colors, etc.
 */
export function useAgents() {
  const agents = useQuery(api.agents.list) ?? [];

  // Build a config lookup matching the AGENT_CONFIG interface
  const agentConfig: Record<string, { emoji: string; color: string; role: string; description: string; isOrchestrator?: boolean; isReviewer?: boolean }> = {};
  for (const a of agents) {
    agentConfig[a.name] = {
      emoji: a.emoji,
      color: a.color,
      role: a.role,
      description: a.description,
      isOrchestrator: a.isOrchestrator,
      isReviewer: a.isReviewer,
    };
  }

  const agentNames = agents.map((a) => a.name);

  function getAgentColor(name: string): string {
    return agents.find((a) => a.name === name)?.color ?? "#6366F1";
  }

  function getAgentEmoji(name: string): string {
    return agents.find((a) => a.name === name)?.emoji ?? "🤖";
  }

  function isAgent(name: string): boolean {
    return agentNames.includes(name);
  }

  return {
    agents,
    agentConfig,
    agentNames,
    getAgentColor,
    getAgentEmoji,
    isAgent,
    loading: agents.length === 0,
  };
}

/**
 * Preset colors for new agents.
 * Users pick from these when creating an agent.
 */
export const AGENT_COLOR_PRESETS = [
  { value: "#3B82F6", label: "Blue" },
  { value: "#10B981", label: "Green" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EF4444", label: "Red" },
  { value: "#EC4899", label: "Pink" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#F97316", label: "Orange" },
  { value: "#84CC16", label: "Lime" },
  { value: "#6366F1", label: "Indigo" },
  { value: "#14B8A6", label: "Teal" },
  { value: "#A855F7", label: "Violet" },
];

/**
 * Server size recommendations based on agent count.
 */
export function getServerRecommendation(agentCount: number): { ram: string; cpu: string; estimate: string } {
  if (agentCount <= 5) return { ram: "2 GB", cpu: "2 vCPUs", estimate: "~$10/mo (Lightsail)" };
  if (agentCount <= 10) return { ram: "4 GB", cpu: "2 vCPUs", estimate: "~$20/mo" };
  if (agentCount <= 15) return { ram: "8 GB", cpu: "4 vCPUs", estimate: "~$40/mo" };
  if (agentCount <= 20) return { ram: "16 GB", cpu: "4 vCPUs", estimate: "~$80/mo" };
  return { ram: "32 GB", cpu: "8 vCPUs", estimate: "~$160/mo" };
}
