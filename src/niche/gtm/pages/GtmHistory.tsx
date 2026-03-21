import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  Inbox,
  Brain,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  done: { icon: CheckCircle2, color: "text-green-500", label: "Completed" },
  in_progress: { icon: Loader2, color: "text-blue-400", label: "Working" },
  assigned: { icon: Clock, color: "text-yellow-500", label: "Queued" },
  in_review: { icon: Brain, color: "text-purple-400", label: "In Review" },
  cancelled: { icon: XCircle, color: "text-red-400", label: "Cancelled" },
  inbox: { icon: Inbox, color: "text-muted-foreground", label: "Inbox" },
};

export function GtmHistory() {
  const { config } = useNiche();
  const tasks = useQuery(api.tasks.list, {});
  const gtmTasks = (tasks ?? [])
    .filter((t: { tags?: string[] }) => t.tags?.includes("niche:gtm"))
    .sort((a: { _creationTime: number }, b: { _creationTime: number }) => b._creationTime - a._creationTime);

  const isLoading = tasks === undefined;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">History</h1>
        <p className="text-sm text-muted-foreground">Everything your AI GTM team has done</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && gtmTasks.length === 0 && (
        <div className="text-center py-20">
          <Inbox className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No activity yet. Ask your AI team to do something from the Home page.
          </p>
        </div>
      )}

      {!isLoading && gtmTasks.length > 0 && (
        <div className="space-y-2">
          {gtmTasks.map((task: {
            _id: string;
            title: string;
            status: string;
            assignee?: string;
            _creationTime: number;
            deliverables?: { name: string; type: string; content: string }[];
          }) => {
            const statusCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.inbox;
            const Icon = statusCfg.icon;
            const hasDeliverables = (task.deliverables?.length ?? 0) > 0;
            const timeAgo = getRelativeTime(task._creationTime);

            return (
              <div key={task._id} className="px-4 py-3 rounded-xl border border-border/50 bg-card hover:border-border/80 transition-colors">
                <div className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${statusCfg.color} ${task.status === "in_progress" ? "animate-spin" : ""}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">{task.assignee ?? "Unassigned"}</span>
                      <span className="text-[10px] text-muted-foreground/40">·</span>
                      <span className="text-[10px] text-muted-foreground/60">{timeAgo}</span>
                      <span className="text-[10px] text-muted-foreground/40">·</span>
                      <span className={`text-[10px] font-medium ${statusCfg.color}`}>{statusCfg.label}</span>
                    </div>
                    {hasDeliverables && task.status === "done" && (
                      <div className="mt-2 px-3 py-2 rounded-lg bg-accent/20 text-xs text-foreground/70 line-clamp-3">
                        {task.deliverables![0].content.slice(0, 300)}
                        {task.deliverables![0].content.length > 300 ? "..." : ""}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
