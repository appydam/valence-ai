import { Task, AGENT_CONFIG, AgentName } from "@/types/mission";
import { getRelativeTime } from "@/data/mock";
import { MessageSquare } from "lucide-react";
import { mockComments } from "@/data/mock";

export function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const agentConfig = task.assignee ? AGENT_CONFIG[task.assignee] : null;
  const commentCount = mockComments.filter(c => c.taskId === task.id).length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg border bg-card hover:bg-surface-hover transition-all group"
      style={agentConfig ? { borderLeftColor: `hsl(var(--agent-${agentConfig.color}))`, borderLeftWidth: "3px" } : {}}
    >
      <h4 className="text-sm font-medium text-foreground leading-snug line-clamp-2">{task.title}</h4>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {/* Priority */}
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium" style={{
          backgroundColor: `hsl(var(--priority-${task.priority}) / 0.15)`,
          color: `hsl(var(--priority-${task.priority}))`,
        }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(--priority-${task.priority}))` }} />
          {task.priority}
        </span>

        {/* Tags */}
        {task.tags.slice(0, 2).map(tag => (
          <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-secondary text-muted-foreground">{tag}</span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          {task.assignee ? (
            <>
              <span className="text-sm">{AGENT_CONFIG[task.assignee].emoji}</span>
              <span className="text-xs text-muted-foreground">{task.assignee}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Unassigned</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {commentCount > 0 && (
            <span className="flex items-center gap-1 text-[10px]">
              <MessageSquare className="w-3 h-3" /> {commentCount}
            </span>
          )}
          <span className="text-[10px]">{getRelativeTime(task.updatedAt)}</span>
        </div>
      </div>
    </button>
  );
}
