import { X, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useUserTasks } from "@/hooks/useUserScoped";

const STAGE_LABELS: Record<string, string> = {
  companies: "Companies",
  contacts: "Contacts",
  enriched: "Enriched",
  crm: "In CRM",
  sequences: "Sequenced",
};

interface Props {
  stageKey: string | null;
  onClose: () => void;
}

export function StageDetailDrawer({ stageKey, onClose }: Props) {
  const tasks = useUserTasks();

  if (!stageKey) return null;

  const stageTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) =>
      t.tags?.includes("niche:outbound") && t.tags?.includes(`stage:${stageKey}`)
  );

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
        <h2 className="text-sm font-semibold text-foreground">
          {STAGE_LABELS[stageKey] ?? stageKey} — {stageTasks.length} items
        </h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent/30 transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {stageTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No items at this stage yet</p>
          </div>
        )}

        {stageTasks.map((task: {
          _id: string;
          title: string;
          status: string;
          assignee?: string;
          deliverables?: { name: string; content: string }[];
        }) => {
          const StatusIcon = task.status === "done" ? CheckCircle2
            : task.status === "in_progress" ? Loader2
            : Clock;
          const statusColor = task.status === "done" ? "text-green-500"
            : task.status === "in_progress" ? "text-blue-400"
            : "text-yellow-500";

          return (
            <div key={task._id} className="px-4 py-3 rounded-xl border border-border/50 bg-background/50">
              <div className="flex items-start gap-3">
                <StatusIcon className={`w-4 h-4 mt-0.5 shrink-0 ${statusColor} ${task.status === "in_progress" ? "animate-spin" : ""}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{task.assignee ?? "Unassigned"}</p>
                  {task.deliverables && task.deliverables.length > 0 && task.status === "done" && (
                    <div className="mt-2 px-3 py-2 rounded-lg bg-accent/20 text-xs text-foreground/70 line-clamp-4">
                      {task.deliverables[0].content.slice(0, 400)}
                      {task.deliverables[0].content.length > 400 ? "..." : ""}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
