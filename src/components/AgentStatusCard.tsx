import { Agent, AGENT_CONFIG, AgentStatus } from "@/types/mission";
import { getRelativeTime } from "@/data/mock";
import { cn } from "@/lib/utils";

const statusLabels: Record<AgentStatus, string> = {
  online: "Online",
  working: "Working",
  idle: "Idle",
  offline: "Offline",
};

export function AgentStatusCard({ agent }: { agent: Agent }) {
  const config = AGENT_CONFIG[agent.name];
  const isActive = agent.status === "online" || agent.status === "working";

  return (
    <div className={cn(
      "relative flex items-center gap-4 p-4 rounded-lg border bg-card transition-all hover:bg-surface-hover",
      `border-agent-${config.color}/20`
    )} style={{ borderColor: `hsl(var(--agent-${config.color}) / 0.2)` }}>
      {/* Emoji */}
      <div className={cn(
        "flex items-center justify-center w-12 h-12 rounded-xl text-2xl",
        isActive && `glow-${config.color}`
      )} style={isActive ? {
        boxShadow: `0 0 20px hsl(var(--agent-${config.color}) / 0.3)`,
        backgroundColor: `hsl(var(--agent-${config.color}) / 0.1)`,
      } : { backgroundColor: `hsl(var(--agent-${config.color}) / 0.1)` }}>
        {agent.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">{agent.name}</span>
          <StatusBadge status={agent.status} />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{config.role}</p>
        <p className="text-[10px] text-muted-foreground mt-1">Last seen: {getRelativeTime(agent.lastHeartbeat)}</p>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: AgentStatus }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium",
    )} style={{
      backgroundColor: `hsl(var(--status-${status}) / 0.15)`,
      color: `hsl(var(--status-${status}))`,
    }}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        (status === "online" || status === "working") && "animate-pulse-glow"
      )} style={{ backgroundColor: `hsl(var(--status-${status}))` }} />
      {statusLabels[status]}
    </span>
  );
}
