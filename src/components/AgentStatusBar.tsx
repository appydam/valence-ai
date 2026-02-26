import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const STATUS_DOT: Record<string, string> = {
  online: "bg-green-500",
  working: "bg-yellow-500 animate-pulse",
  idle: "bg-gray-400",
  offline: "bg-red-500",
};

export function AgentStatusBar() {
  const agents = useQuery(api.agents.list) ?? [];
  const allTasks = useQuery(api.tasks.list, {}) ?? [];

  if (agents.length === 0) return null;

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-card/50 overflow-x-auto scrollbar-none">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mr-2 shrink-0">
        Squad
      </span>
      {agents.map((agent: any) => {
        const config = AGENT_CONFIG[agent.name as AgentName];
        if (!config) return null;

        // Find the agent's current task title from the task list
        const currentTask = agent.currentTaskId
          ? allTasks.find((t: any) => (t._id as string) === agent.currentTaskId)
          : null;

        return (
          <Link
            to="/agents"
            key={agent.name}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shrink-0 transition-colors hover:bg-accent/50",
              agent.status === "working"
                ? "bg-yellow-500/10 text-yellow-200"
                : agent.status === "online"
                  ? "bg-green-500/5 text-muted-foreground"
                  : "text-muted-foreground/50"
            )}
          >
            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", STATUS_DOT[agent.status] ?? "bg-gray-500")} />
            <span className="font-medium">{config.emoji}</span>
            <span className="font-medium">{agent.name}</span>
            {agent.status === "working" && currentTask && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground truncate max-w-[140px]">
                  {(currentTask as any).title}
                </span>
              </>
            )}
            {agent.status === "idle" && (
              <span className="text-muted-foreground/60">idle</span>
            )}
            {agent.status === "offline" && (
              <span className="text-muted-foreground/40">offline</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
