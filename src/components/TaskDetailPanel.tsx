import { useState } from "react";
import { AGENT_CONFIG, AgentName, TaskStatus, TaskPriority } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import { MarkdownContent } from "@/components/MarkdownContent";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { X, Check, Inbox, Trash2, MessageSquare, Package, ChevronDown, ChevronRight, AlertTriangle, Link2, XCircle, Plus, Search, Zap } from "lucide-react";
import { ReasoningStream } from "@/components/ReasoningStream";

import { tenant } from "@/tenant";

const CONVEX_SITE_URL = tenant.convexSiteUrl;

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
  dependsOn?: Id<"tasks">[];
  blocks?: Id<"tasks">[];
  iterationCount?: number;
  maxIterations?: number;
  rejectionReason?: string;
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

  // Rejection state
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // Dependency search state
  const [showDepSearch, setShowDepSearch] = useState(false);
  const [depSearchQuery, setDepSearchQuery] = useState("");

  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);
  const addComment = useMutation(api.comments.create);

  // Fetch dependency tasks (tasks this one depends on)
  const dependsOnIds = task.dependsOn ?? [];
  const blocksIds = task.blocks ?? [];
  const depTasks = useQuery(
    api.tasks.getByIds,
    dependsOnIds.length > 0 ? { ids: dependsOnIds } : "skip"
  ) ?? [];
  const blocksTasks = useQuery(
    api.tasks.getByIds,
    blocksIds.length > 0 ? { ids: blocksIds } : "skip"
  ) ?? [];

  // Integration execution logs
  const [showIntegrationLogs, setShowIntegrationLogs] = useState(false);
  const integrationLogs = useQuery(api.integrationActivity.listByTask, { taskId: task._id as string, limit: 50 }) ?? [];

  // All tasks for dependency picker
  const allTasks = useQuery(api.tasks.list, {}) ?? [];
  const searchResults = depSearchQuery.trim()
    ? allTasks.filter(t =>
        t._id !== task._id &&
        !dependsOnIds.includes(t._id as Id<"tasks">) &&
        t.title.toLowerCase().includes(depSearchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

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

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setRejectLoading(true);
    try {
      await fetch(`${CONVEX_SITE_URL}/api/tasks/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task._id,
          reviewerName: "Human",
          reason: rejectReason.trim(),
        }),
      });
      setShowRejectInput(false);
      setRejectReason("");
    } finally {
      setRejectLoading(false);
    }
  };

  const handleAddDependency = async (depTaskId: Id<"tasks">) => {
    const newDeps = [...dependsOnIds, depTaskId];
    await updateTask({ id: task._id, dependsOn: newDeps });
    setDepSearchQuery("");
    setShowDepSearch(false);
  };

  const handleRemoveDependency = async (depTaskId: Id<"tasks">) => {
    const newDeps = dependsOnIds.filter(id => id !== depTaskId);
    await updateTask({ id: task._id, dependsOn: newDeps });
  };

  const hasOutcome = task.deliverables.length > 0;
  const isDone = task.status === "done";
  const isInReview = task.status === "in_review";
  const hasRejection = !!task.rejectionReason && task.status === "in_progress";
  const iterationCount = task.iterationCount ?? 0;
  const maxIterations = task.maxIterations ?? 3;
  const isEscalated = iterationCount > maxIterations;

  const statusColor: Record<string, string> = {
    done: "text-status-online",
    in_progress: "text-status-working",
    in_review: "text-primary",
    assigned: "text-muted-foreground",
    inbox: "text-muted-foreground",
    cancelled: "text-destructive",
  };

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
          {/* Reject button — only shown when in_review */}
          {isInReview && (
            <button
              onClick={() => setShowRejectInput(v => !v)}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            >
              <XCircle className="w-3 h-3" /> Reject
            </button>
          )}
          <button onClick={handleDelete} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-surface-hover text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Escalated banner — max iterations exceeded, human review required */}
        {isEscalated && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
              <span className="text-xs font-semibold text-destructive">
                Escalated — Human Review Required ({iterationCount} revisions)
              </span>
            </div>
            <p className="text-xs text-destructive/80 leading-relaxed">
              This task has exceeded the maximum revision limit ({maxIterations}). The agent could not complete it autonomously. Please review, update the task description, and reassign manually.
            </p>
          </div>
        )}

        {/* Rejection reason banner */}
        {hasRejection && !isEscalated && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-xs font-semibold text-amber-500">
                Revision {iterationCount}/{maxIterations}
              </span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">{task.rejectionReason}</p>
          </div>
        )}

        {/* Reject inline form */}
        {showRejectInput && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
            <p className="text-xs font-medium text-destructive">Rejection reason (sent to agent as feedback)</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Be specific — the agent will see this and rework the task..."
              rows={3}
              className="w-full bg-card rounded px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground border border-border outline-none focus:ring-1 focus:ring-destructive resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || rejectLoading}
                className="px-3 py-1.5 rounded text-xs bg-destructive text-white hover:bg-destructive/80 transition-colors disabled:opacity-50"
              >
                {rejectLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
              <button
                onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
                className="px-3 py-1.5 rounded text-xs bg-secondary text-muted-foreground hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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

        {/* Dependencies section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Link2 className="w-3 h-3" /> Dependencies
            </label>
            <button
              onClick={() => setShowDepSearch(v => !v)}
              className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:bg-surface-hover transition-colors"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          {/* Dependency search picker */}
          {showDepSearch && (
            <div className="mb-2 rounded-lg border border-border bg-card p-2 space-y-1.5">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-secondary rounded">
                <Search className="w-3 h-3 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  value={depSearchQuery}
                  onChange={e => setDepSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
              {searchResults.length > 0 ? (
                <div className="space-y-0.5">
                  {searchResults.map(t => (
                    <button
                      key={t._id}
                      onClick={() => handleAddDependency(t._id as Id<"tasks">)}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {t.assignee && <span className="text-xs">{AGENT_CONFIG[t.assignee as AgentName]?.emoji}</span>}
                        <span className="text-xs text-foreground truncate flex-1">{t.title}</span>
                        <span className={`text-[10px] shrink-0 ${statusColor[t.status] ?? "text-muted-foreground"}`}>{t.status.replace("_", " ")}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : depSearchQuery.trim() ? (
                <p className="text-[10px] text-muted-foreground px-2 py-1">No matching tasks</p>
              ) : (
                <p className="text-[10px] text-muted-foreground px-2 py-1">Type to search tasks...</p>
              )}
            </div>
          )}

          {/* Depends on list */}
          {depTasks.length > 0 ? (
            <div className="space-y-1 mb-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Depends On</p>
              {depTasks.map((dep: any) => (
                <div key={dep._id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-secondary group">
                  {dep.assignee && <span className="text-xs">{AGENT_CONFIG[dep.assignee as AgentName]?.emoji}</span>}
                  <span className="text-xs text-foreground flex-1 truncate">{dep.title}</span>
                  <span className={`text-[10px] shrink-0 ${statusColor[dep.status] ?? "text-muted-foreground"}`}>
                    {dep.status === "done" ? "✓ done" : dep.status.replace("_", " ")}
                  </span>
                  <button
                    onClick={() => handleRemoveDependency(dep._id as Id<"tasks">)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mb-3">No dependencies</p>
          )}

          {/* Blocks list (read-only) */}
          {blocksTasks.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Blocks</p>
              {blocksTasks.map((blocked: any) => (
                <div key={blocked._id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-secondary/50">
                  {blocked.assignee && <span className="text-xs">{AGENT_CONFIG[blocked.assignee as AgentName]?.emoji}</span>}
                  <span className="text-xs text-foreground flex-1 truncate">{blocked.title}</span>
                  <span className={`text-[10px] shrink-0 ${statusColor[blocked.status] ?? "text-muted-foreground"}`}>
                    {blocked.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agent Reasoning Stream */}
        {task.assignee && (
          <ReasoningStream taskId={task._id} compact />
        )}

        {/* Integration Calls (IMPROVE-005) */}
        {integrationLogs.length > 0 && (
          <div>
            <button
              onClick={() => setShowIntegrationLogs(v => !v)}
              className="w-full flex items-center justify-between group"
            >
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 cursor-pointer">
                <Zap className="w-3 h-3" /> Integration Calls
                <span className="px-1.5 py-0.5 rounded-full bg-secondary text-[10px]">
                  {integrationLogs.length}
                </span>
              </label>
              {showIntegrationLogs ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            {showIntegrationLogs && (
              <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                {integrationLogs.map((log: any) => (
                  <div key={log._id} className="flex items-start gap-2 px-2 py-1.5 rounded bg-secondary text-[11px]">
                    <span className={`shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full ${log.status === "success" ? "bg-status-online" : "bg-destructive"}`} />
                    <span className="font-mono text-muted-foreground shrink-0">{log.integrationType}</span>
                    <span className="text-foreground truncate flex-1">{log.toolName}</span>
                    {log.errorMessage && (
                      <span className="text-destructive/80 truncate max-w-[140px]" title={log.errorMessage}>{log.errorMessage}</span>
                    )}
                    <span className="text-muted-foreground shrink-0 ml-auto">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
