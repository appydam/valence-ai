import { getRelativeTime } from "@/lib/time";
import { AgentName, AGENT_CONFIG } from "@/types/mission";

interface ActivityEntry {
  _id: string;
  agentName: AgentName;
  action: string;
  details: string;
  timestamp: number;
}

interface LiveTickerProps {
  activity: ActivityEntry[];
}

function getActionIcon(action: string): string {
  if (action.includes("complet") || action.includes("done") || action.includes("finish")) return "✓";
  if (action.includes("start") || action.includes("claim") || action.includes("begin")) return "◉";
  if (action.includes("delegat") || action.includes("creat") || action.includes("assign")) return "⚡";
  if (action.includes("error") || action.includes("fail")) return "⚠";
  if (action.includes("review")) return "◈";
  return "·";
}

function TickerItem({ entry }: { entry: ActivityEntry }) {
  const config = AGENT_CONFIG[entry.agentName];
  const icon = getActionIcon(entry.action);
  const time = getRelativeTime(entry.timestamp);

  return (
    <span className="inline-flex items-center gap-2 px-4 whitespace-nowrap">
      <span
        className="font-mono text-xs"
        style={{ color: `hsl(var(--agent-${config.color}))` }}
      >
        {icon}
      </span>
      <span className="text-[10px] text-muted-foreground font-mono">{time}</span>
      <span
        className="text-xs font-semibold"
        style={{ color: `hsl(var(--agent-${config.color}))` }}
      >
        {entry.agentName}
      </span>
      <span className="text-xs text-muted-foreground">{entry.action}</span>
      {entry.details && (
        <span className="text-xs text-foreground/70 max-w-[200px] truncate">
          "{entry.details.slice(0, 60)}{entry.details.length > 60 ? "…" : ""}"
        </span>
      )}
      <span className="text-muted-foreground/30 mx-2">·</span>
    </span>
  );
}

export function LiveTicker({ activity }: LiveTickerProps) {
  if (activity.length === 0) {
    return (
      <div className="h-8 border-t border-border/40 flex items-center px-4">
        <span className="text-[10px] text-muted-foreground font-mono">
          ◉ LIVE FEED — No activity yet
        </span>
      </div>
    );
  }

  // Duplicate for seamless loop
  const doubled = [...activity, ...activity];

  return (
    <div
      className="h-8 border-t border-border/40 flex items-center overflow-hidden relative"
      style={{ background: "rgba(0,0,0,0.3)" }}
    >
      {/* Live indicator */}
      <div className="flex items-center gap-1.5 px-3 shrink-0 border-r border-border/40 h-full">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
          Live
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden relative">
        <div className="animate-ticker flex items-center" style={{ width: "max-content" }}>
          {doubled.map((entry, i) => (
            <TickerItem key={`${entry._id}-${i}`} entry={entry} />
          ))}
        </div>
      </div>

      {/* Fade edges */}
      <div
        className="absolute left-[80px] top-0 bottom-0 w-8 pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.3), transparent)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none"
        style={{ background: "linear-gradient(to left, rgba(3,3,9,0.8), transparent)" }}
      />
    </div>
  );
}
