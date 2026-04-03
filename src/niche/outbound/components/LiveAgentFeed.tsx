import { useUserTasks } from "@/hooks/useUserScoped";

const AGENT_COLORS: Record<string, string> = {
  Kaze: "#3b82f6",
  Scout: "#10b981",
  Forge: "#f59e0b",
  Ghost: "#8b5cf6",
  Sentinel: "#ef4444",
};

export function LiveAgentFeed() {
  const tasks = useUserTasks();
  const activeTasks = (tasks ?? []).filter(
    (t: { tags?: string[]; status: string }) =>
      t.tags?.includes("niche:outbound") &&
      (t.status === "in_progress" || t.status === "assigned")
  );

  if (activeTasks.length === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-card/50 border-b border-border/20 overflow-x-auto">
      <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider shrink-0">
        Live
      </span>
      {activeTasks.map((task: { _id: string; assignee?: string; title: string; status: string }) => {
        const color = AGENT_COLORS[task.assignee ?? ""] ?? "#6b7280";
        return (
          <div key={task._id} className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: color }}
              />
              {task.status === "in_progress" && (
                <div
                  className="absolute inset-0 w-2 h-2 rounded-full animate-ping"
                  style={{ background: color, opacity: 0.5 }}
                />
              )}
            </div>
            <span className="text-[11px] text-foreground/70">
              <span className="font-medium" style={{ color }}>{task.assignee}</span>
              {" "}
              <span className="text-muted-foreground/50">
                {task.title.length > 40 ? task.title.slice(0, 40) + "..." : task.title}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
