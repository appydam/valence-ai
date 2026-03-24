import { AGENT_CONFIG } from "@/types/mission";

interface AgentConfig {
  agentName: string;
  model: string;
  skills: string[];
  sessionMaxTurns: number;
  sessionTimeout: number;
  isOrchestrator?: boolean;
  description?: string;
}

export function generateOpenClawConfig(agentConfigs: AgentConfig[]) {
  const agents: Record<string, any> = {};

  agentConfigs.forEach((config) => {
    const agentId = config.agentName.toLowerCase();
    const staticCfg = AGENT_CONFIG[config.agentName];
    const isOrchestrator = config.isOrchestrator ?? (config.agentName === "Kaze");
    const description = config.description ?? staticCfg?.description ?? `${config.agentName} agent`;

    agents[agentId] = {
      ...(isOrchestrator && { default: true }),
      name: config.agentName,
      description,
      workspace: isOrchestrator
        ? "~/.openclaw/workspace"
        : `~/.openclaw/workspace/agents/${agentId}`,
      soul: isOrchestrator
        ? "~/.openclaw/workspace/SOUL.md"
        : `~/.openclaw/workspace/agents/${agentId}/SOUL.md`,
      skills: config.skills,
      model: config.model,
      session: {
        maxTurns: config.sessionMaxTurns,
        timeout: config.sessionTimeout,
      },
    };
  });

  return { agents };
}

export function downloadConfig(config: any, filename = "openclaw-config.json") {
  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
