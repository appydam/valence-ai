import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";

interface ActivityData {
  _id: string;
  timestamp: number;
  agentName: AgentName;
  action: string;
  details: string;
  taskId?: string;
}

export function ActivityItem({ entry }: { entry: ActivityData }) {
  const config = AGENT_CONFIG[entry.agentName];

  return (
    <div className="flex items-start gap-3 group">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center pt-1">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: `hsl(var(--agent-${config.color}))` }} />
        <div className="w-px flex-1 bg-border mt-1 min-h-[20px]" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base">{config.emoji}</span>
          <span className="text-sm font-medium" style={{ color: `hsl(var(--agent-${config.color}))` }}>
            {entry.agentName}
          </span>
          <span className="text-sm text-muted-foreground">{entry.action}</span>
          <span className="ml-auto text-xs text-muted-foreground shrink-0">
            {getRelativeTime(entry.timestamp)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{entry.details}</p>
      </div>
    </div>
  );
}
