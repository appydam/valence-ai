import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { AgentName, AGENT_CONFIG, TaskPriority } from "@/types/mission";
import { X, Search, Link2 } from "lucide-react";
import { FileAttachButton } from "@/components/FileAttachButton";

interface Mission {
  _id: string;
  title: string;
  status: string;
}

interface NewTaskModalProps {
  onClose: () => void;
  onCreate: (data: {
    title: string;
    description: string;
    priority: TaskPriority;
    assignee?: AgentName;
    tags: string[];
    missionId?: string;
    dependsOn?: Id<"tasks">[];
  }) => void;
  missions?: Mission[];
}

const priorityOptions: TaskPriority[] = ["low", "medium", "high", "urgent"];
const agentOptions: (AgentName | "")[] = ["", "Kaze", "Scout", "Forge", "Ghost"];

const statusColor: Record<string, string> = {
  done: "text-emerald-400",
  in_progress: "text-amber-400",
  in_review: "text-blue-400",
  assigned: "text-purple-400",
};

export function NewTaskModal({ onClose, onCreate, missions }: NewTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignee, setAssignee] = useState<AgentName | "">("");
  const [tagsInput, setTagsInput] = useState("");
  const [selectedMissionId, setSelectedMissionId] = useState<string>("");

  // Attachment state
  const [attachmentSummary, setAttachmentSummary] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  // Dependency state
  const [selectedDeps, setSelectedDeps] = useState<Id<"tasks">[]>([]);
  const [showDepSearch, setShowDepSearch] = useState(false);
  const [depSearchQuery, setDepSearchQuery] = useState("");

  // Fetch all tasks for dependency picker
  const allTasks = useQuery(api.tasks.list, {}) ?? [];
  const searchResults = depSearchQuery.trim()
    ? allTasks.filter(t =>
        !selectedDeps.includes(t._id as Id<"tasks">) &&
        t.title.toLowerCase().includes(depSearchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  // Selected dep task details
  const selectedDepTasks = allTasks.filter(t => selectedDeps.includes(t._id as Id<"tasks">));

  const handleCreate = () => {
    if (!title.trim()) return;
    const fullDescription = attachmentSummary
      ? `${description.trim()}\n\n---\nAttached context (${attachmentName ?? "file"}, summarized by Claude):\n${attachmentSummary}`
      : description.trim();
    onCreate({
      title: title.trim(),
      description: fullDescription,
      priority,
      assignee: assignee || undefined,
      tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
      missionId: selectedMissionId || undefined,
      dependsOn: selectedDeps.length > 0 ? selectedDeps : undefined,
    });
    onClose();
  };

  const handleAddDep = (taskId: Id<"tasks">) => {
    setSelectedDeps(prev => [...prev, taskId]);
    setDepSearchQuery("");
    setShowDepSearch(false);
  };

  const handleRemoveDep = (taskId: Id<"tasks">) => {
    setSelectedDeps(prev => prev.filter(id => id !== taskId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-foreground">New Task</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-hover text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title..."
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the task..." rows={3}
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Context File <span className="text-muted-foreground/50 font-normal">(optional)</span></label>
            <FileAttachButton
              variant="block"
              attachedFileName={attachmentName}
              onSummaryReady={(summary, fileName) => {
                setAttachmentSummary(summary);
                setAttachmentName(fileName);
              }}
              onClear={() => {
                setAttachmentSummary(null);
                setAttachmentName(null);
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none">
                {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Assignee</label>
              <select value={assignee} onChange={e => setAssignee(e.target.value as AgentName | "")}
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none">
                <option value="">Unassigned</option>
                {agentOptions.filter(Boolean).map(a => (
                  <option key={a} value={a}>{AGENT_CONFIG[a as AgentName].emoji} {a}</option>
                ))}
              </select>
            </div>
          </div>
          {missions && missions.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Mission</label>
              <select
                value={selectedMissionId}
                onChange={e => setSelectedMissionId(e.target.value)}
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none"
              >
                <option value="">Auto-create new mission</option>
                {missions.filter(m => m.status === "active").map(m => (
                  <option key={m._id} value={m._id}>{m.title}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Tags (comma-separated)</label>
            <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="research, ai, code..."
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-1 focus:ring-primary" />
          </div>

          {/* Dependencies */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Link2 className="w-3 h-3" /> Depends On
              </label>
              <button
                type="button"
                onClick={() => setShowDepSearch(v => !v)}
                className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:bg-surface-hover transition-colors"
              >
                + Add
              </button>
            </div>

            {showDepSearch && (
              <div className="mb-2 rounded-lg border border-border bg-secondary/50 p-2 space-y-1.5">
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
                  <div className="space-y-0.5 max-h-36 overflow-y-auto">
                    {searchResults.map(t => (
                      <button
                        key={t._id}
                        type="button"
                        onClick={() => handleAddDep(t._id as Id<"tasks">)}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {t.assignee && <span className="text-xs">{AGENT_CONFIG[t.assignee as AgentName]?.emoji}</span>}
                          <span className="text-xs text-foreground truncate flex-1">{t.title}</span>
                          <span className={`text-[10px] shrink-0 ${statusColor[t.status] ?? "text-muted-foreground"}`}>
                            {t.status.replace("_", " ")}
                          </span>
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

            {selectedDepTasks.length > 0 && (
              <div className="space-y-1">
                {selectedDepTasks.map((dep: any) => (
                  <div key={dep._id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-secondary group">
                    {dep.assignee && <span className="text-xs">{AGENT_CONFIG[dep.assignee as AgentName]?.emoji}</span>}
                    <span className="text-xs text-foreground flex-1 truncate">{dep.title}</span>
                    <span className={`text-[10px] shrink-0 ${statusColor[dep.status] ?? "text-muted-foreground"}`}>
                      {dep.status === "done" ? "✓ done" : dep.status.replace("_", " ")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDep(dep._id as Id<"tasks">)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-surface-hover transition-colors">Cancel</button>
          <button onClick={handleCreate} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/80 transition-colors">Create Task</button>
        </div>
      </div>
    </div>
  );
}
