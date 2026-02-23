import { useState } from "react";
import { AGENT_CONFIG, AgentName, TaskStatus, TaskPriority } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import { MarkdownContent } from "@/components/MarkdownContent";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { X, Check, Inbox, Trash2, MessageSquare, Package, ChevronDown, ChevronRight } from "lucide-react";

const statusOptions: TaskStatus[] = ["inbox", "assigned", "in_progress", "in_review", "done", "cancelled"];
const priorityOptions: TaskPriority[] = ["low", "medium", "high", "urgent"];
const agentOptions: (AgentName | "Unassigned")[] = ["Kaze", "Scout", "Forge", "Ghost", "Unassigned"];

interface TaskData {
  _id: Id<"tasks">;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: AgentName;
  creator: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  tags: string[];
  deliverables: { name: string; type: string; content: string }[];
}

interface TaskDetailPanelProps {
  task: TaskData;
  onClose: () => void;
}

export function TaskDetailPanel({ task, onClose }: TaskDetailPanelProps) {
  const comments = useQuery(api.comments.listByTask, { taskId: task._id }) ?? [];
  const [newComment, setNewComment] = useState("");
  const [expandedDeliverable, setExpandedDeliverable] = useState<number | null>(task.deliverables.length > 0 ? 0 : null);
  const agentConfig = task.assignee ? AGENT_CONFIG[task.assignee] : null;

  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);
  const addComment = useMutation(api.comments.create);

  const handleUpdate = (updates: Partial<{ status: TaskStatus; priority: TaskPriority; assignee: AgentName | undefined }>) => {
    updateTask({ id: task._id, ...updates });
  };

  const handleDelete = () => {
    deleteTask({ id: task._id });
    onClose();
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    await addComment({
      taskId: task._id,
      author: "Human",
      content: newComment.trim(),
      mentions: [],
    });
    setNewComment("");
  };

  const hasOutcome = task.deliverables.length > 0;
  const isDone = task.status === "done";

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-card border-l border-border z-50 animate-slide-in-right overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <button onClick={() => handleUpdate({ status: "done" })} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-status-online/10 text-status-online hover:bg-status-online/20 transition-colors">
            <Check className="w-3 h-3" /> Done
          </button>
          <button onClick={() => handleUpdate({ status: "inbox" })} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-secondary text-muted-foreground hover:bg-surface-hover transition-colors">
            <Inbox className="w-3 h-3" /> Inbox
          </button>
          <button onClick={handleDelete} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-surface-hover text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Title + status badge */}
        <div>
          <div className="flex items-start gap-2">
            {agentConfig && (
              <span className="text-2xl shrink-0 mt-0.5">{agentConfig.emoji}</span>
            )}
            <h2 className="text-lg font-semibold text-foreground">{task.title}</h2>
          </div>
          {isDone && task.completedAt && (
            <p className="text-xs text-status-online mt-1.5 flex items-center gap-1">
              <Check className="w-3 h-3" /> Completed {getRelativeTime(task.completedAt)}
            </p>
          )}
        </div>

        {/* ============ OUTCOME SECTION — shown first for done tasks ============ */}
        {hasOutcome && (
          <div className="rounded-xl border-2 border-primary/20 bg-primary/[0.03] overflow-hidden">
            <div className="px-4 py-3 border-b border-primary/10 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Outcome</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                {task.deliverables.length} item{task.deliverables.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="divide-y divide-border/50">
              {/* Deliverables */}
              {task.deliverables.map((d, i) => (
                <div key={i}>
                  <button
                    onClick={() => setExpandedDeliverable(expandedDeliverable === i ? null : i)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-primary/[0.03] transition-colors"
                  >
                    {expandedDeliverable === i ? (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    )}
                    <Package className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">{d.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground shrink-0">{d.type}</span>
                  </button>
                  {expandedDeliverable === i && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="rounded-lg bg-card border border-border p-4">
                        <MarkdownContent content={d.content} />
                      </div>
                    </div>
                  )}
                </div>
              ))}

            </div>
          </div>
        )}

        {/* No outcome placeholder for done tasks */}
        {!hasOutcome && isDone && (
          <div className="rounded-xl border border-dashed border-border p-4 text-center">
            <Package className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No deliverables attached</p>
          </div>
        )}

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          <MetaField label="Status">
            <select value={task.status} onChange={e => handleUpdate({ status: e.target.value as TaskStatus })}
              className="bg-secondary rounded px-2 py-1 text-xs text-foreground border-0 outline-none">
              {statusOptions.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </MetaField>
          <MetaField label="Priority">
            <select value={task.priority} onChange={e => handleUpdate({ priority: e.target.value as TaskPriority })}
              className="bg-secondary rounded px-2 py-1 text-xs text-foreground border-0 outline-none">
              {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </MetaField>
          <MetaField label="Assignee">
            <select value={task.assignee || "Unassigned"} onChange={e => handleUpdate({ assignee: e.target.value === "Unassigned" ? undefined : e.target.value as AgentName })}
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
        {task.tags.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map(tag => (
                <span key={tag} className="px-2 py-1 rounded-md text-xs bg-secondary text-muted-foreground">{tag}</span>
              ))}
            </div>
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
                <div key={c._id} className="p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2 mb-1">
                    {authorConfig && <span className="text-sm">{authorConfig.emoji}</span>}
                    <span className="text-xs font-medium" style={authorConfig ? { color: `hsl(var(--agent-${authorConfig.color}))` } : {}}>
                      {c.author}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{getRelativeTime(c.createdAt)}</span>
                  </div>
                  <MarkdownContent content={c.content} />
                </div>
              );
            })}
          </div>

          {/* Add comment */}
          <div className="flex gap-2 mt-3">
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendComment()}
              placeholder="Add a comment as Human..."
              className="flex-1 bg-secondary rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-1 focus:ring-primary"
            />
            <button onClick={handleSendComment} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/80 transition-colors">
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
