import { useState } from "react";
import { Task, AGENT_CONFIG, AgentName, TaskStatus, TaskPriority } from "@/types/mission";
import { getRelativeTime, getCommentsByTask } from "@/data/mock";
import { X, Check, Inbox, Trash2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const statusOptions: TaskStatus[] = ["inbox", "assigned", "in_progress", "in_review", "done", "cancelled"];
const priorityOptions: TaskPriority[] = ["low", "medium", "high", "urgent"];
const agentOptions: (AgentName | "Unassigned")[] = ["Kaze", "Scout", "Forge", "Ghost", "Unassigned"];

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
}

export function TaskDetailPanel({ task, onClose, onUpdate, onDelete }: TaskDetailPanelProps) {
  const comments = getCommentsByTask(task.id);
  const [newComment, setNewComment] = useState("");
  const agentConfig = task.assignee ? AGENT_CONFIG[task.assignee] : null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-card border-l border-border z-50 animate-slide-in-right overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <button onClick={() => onUpdate({ status: "done" })} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-status-online/10 text-status-online hover:bg-status-online/20 transition-colors">
            <Check className="w-3 h-3" /> Done
          </button>
          <button onClick={() => onUpdate({ status: "inbox" })} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-secondary text-muted-foreground hover:bg-surface-hover transition-colors">
            <Inbox className="w-3 h-3" /> Inbox
          </button>
          <button onClick={onDelete} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-surface-hover text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Title */}
        <h2 className="text-lg font-semibold text-foreground">{task.title}</h2>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          <MetaField label="Status">
            <select value={task.status} onChange={e => onUpdate({ status: e.target.value as TaskStatus })}
              className="bg-secondary rounded px-2 py-1 text-xs text-foreground border-0 outline-none">
              {statusOptions.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </MetaField>
          <MetaField label="Priority">
            <select value={task.priority} onChange={e => onUpdate({ priority: e.target.value as TaskPriority })}
              className="bg-secondary rounded px-2 py-1 text-xs text-foreground border-0 outline-none">
              {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </MetaField>
          <MetaField label="Assignee">
            <select value={task.assignee || "Unassigned"} onChange={e => onUpdate({ assignee: e.target.value === "Unassigned" ? undefined : e.target.value as AgentName })}
              className="bg-secondary rounded px-2 py-1 text-xs text-foreground border-0 outline-none">
              {agentOptions.map(a => <option key={a} value={a}>{a === "Unassigned" ? a : `${AGENT_CONFIG[a as AgentName].emoji} ${a}`}</option>)}
            </select>
          </MetaField>
          <MetaField label="Created">
            <span className="text-xs text-muted-foreground">{getRelativeTime(task.createdAt)}</span>
          </MetaField>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">Description</label>
          <p className="text-sm text-foreground/80 leading-relaxed">{task.description}</p>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-2 block">Tags</label>
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map(tag => (
              <span key={tag} className="px-2 py-1 rounded-md text-xs bg-secondary text-muted-foreground">{tag}</span>
            ))}
          </div>
        </div>

        {/* Deliverables */}
        {task.deliverables.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-2 block">Deliverables</label>
            {task.deliverables.map((d, i) => (
              <div key={i} className="p-3 rounded-lg bg-secondary mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-foreground">{d.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{d.type}</span>
                </div>
                <p className="text-xs text-muted-foreground">{d.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Comments */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-3 h-3" /> Comments ({comments.length})
          </label>
          <div className="space-y-3">
            {comments.map(c => {
              const isAgent = Object.keys(AGENT_CONFIG).includes(c.author);
              const authorConfig = isAgent ? AGENT_CONFIG[c.author as AgentName] : null;
              return (
                <div key={c.id} className="p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2 mb-1">
                    {authorConfig && <span className="text-sm">{authorConfig.emoji}</span>}
                    <span className="text-xs font-medium" style={authorConfig ? { color: `hsl(var(--agent-${authorConfig.color}))` } : {}}>
                      {c.author}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{getRelativeTime(c.createdAt)}</span>
                  </div>
                  <p className="text-xs text-foreground/80">{c.content}</p>
                </div>
              );
            })}
          </div>

          {/* Add comment */}
          <div className="flex gap-2 mt-3">
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment as Human..."
              className="flex-1 bg-secondary rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-1 focus:ring-primary"
            />
            <button className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/80 transition-colors">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] text-muted-foreground font-medium mb-1 block uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
