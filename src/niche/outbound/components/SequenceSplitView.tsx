import { Mail, Linkedin, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useUserTasks } from "@/hooks/useUserScoped";

export function SequenceSplitView() {
  const tasks = useUserTasks();
  const seqTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) =>
      t.tags?.includes("niche:outbound") && t.tags?.includes("stage:sequences")
  );

  const emailTasks = seqTasks.filter((t: { tags?: string[] }) =>
    t.tags?.includes("channel:email") || (t as { title: string }).title.toLowerCase().includes("email")
  );
  const linkedinTasks = seqTasks.filter((t: { tags?: string[] }) =>
    t.tags?.includes("channel:linkedin") || (t as { title: string }).title.toLowerCase().includes("linkedin")
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Email channel */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-semibold text-foreground">Email Sequences</h3>
          <span className="text-[10px] text-muted-foreground bg-accent/20 px-1.5 py-0.5 rounded-full">
            {emailTasks.length}
          </span>
        </div>
        {emailTasks.length === 0 && (
          <p className="text-xs text-muted-foreground py-4 text-center">No email sequences yet</p>
        )}
        {emailTasks.map((task: {
          _id: string;
          title: string;
          status: string;
          deliverables?: { name: string; content: string }[];
        }) => (
          <TaskItem key={task._id} task={task} />
        ))}
      </div>

      {/* LinkedIn channel */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Linkedin className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-foreground">LinkedIn Sequences</h3>
          <span className="text-[10px] text-muted-foreground bg-accent/20 px-1.5 py-0.5 rounded-full">
            {linkedinTasks.length}
          </span>
        </div>
        {linkedinTasks.length === 0 && (
          <p className="text-xs text-muted-foreground py-4 text-center">No LinkedIn sequences yet</p>
        )}
        {linkedinTasks.map((task: {
          _id: string;
          title: string;
          status: string;
          deliverables?: { name: string; content: string }[];
        }) => (
          <TaskItem key={task._id} task={task} />
        ))}
      </div>
    </div>
  );
}

function TaskItem({ task }: { task: { _id: string; title: string; status: string; deliverables?: { name: string; content: string }[] } }) {
  const StatusIcon = task.status === "done" ? CheckCircle2
    : task.status === "in_progress" ? Loader2
    : Clock;
  const statusColor = task.status === "done" ? "text-green-500"
    : task.status === "in_progress" ? "text-blue-400"
    : "text-yellow-500";

  return (
    <div className="px-3 py-2.5 rounded-lg border border-border/40 bg-card">
      <div className="flex items-start gap-2">
        <StatusIcon className={`w-3.5 h-3.5 mt-0.5 ${statusColor} ${task.status === "in_progress" ? "animate-spin" : ""}`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground">{task.title}</p>
          {task.status === "done" && task.deliverables && task.deliverables.length > 0 && (
            <div className="mt-1.5 text-[10px] text-foreground/60 line-clamp-3">
              {task.deliverables[0].content.slice(0, 200)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
