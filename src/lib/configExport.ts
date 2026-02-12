import { AGENT_CONFIG, AgentName } from "@/types/mission";

interface AgentConfig {
  agentName: AgentName;
  model: string;
  skills: string[];
  sessionMaxTurns: number;
  sessionTimeout: number;
}

export function generateOpenClawConfig(agentConfigs: AgentConfig[]) {
  const agents: Record<string, any> = {};

  agentConfigs.forEach((config) => {
    const agentId = config.agentName.toLowerCase();
    const isDefault = config.agentName === "Kaze";

    agents[agentId] = {
      ...(isDefault && { default: true }),
      name: config.agentName,
      description: AGENT_CONFIG[config.agentName].description,
      workspace: isDefault
        ? "~/.openclaw/workspace"
        : `~/.openclaw/workspace/agents/${agentId}`,
      soul: isDefault
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
