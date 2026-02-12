import { useState } from "react";
import { AgentName, AGENT_CONFIG, TaskPriority } from "@/types/mission";
import { X } from "lucide-react";

interface Mission {
  _id: string;
  title: string;
  status: string;
}

interface NewTaskModalProps {
  onClose: () => void;
  onCreate: (data: { title: string; description: string; priority: TaskPriority; assignee?: AgentName; tags: string[]; missionId?: string }) => void;
  missions?: Mission[];
}

const priorityOptions: TaskPriority[] = ["low", "medium", "high", "urgent"];
const agentOptions: (AgentName | "")[] = ["", "Kaze", "Scout", "Forge", "Ghost"];

export function NewTaskModal({ onClose, onCreate, missions }: NewTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignee, setAssignee] = useState<AgentName | "">("");
  const [tagsInput, setTagsInput] = useState("");
  const [selectedMissionId, setSelectedMissionId] = useState<string>("");

  const handleCreate = () => {
    if (!title.trim()) return;
    onCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee: assignee || undefined,
      tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
      missionId: selectedMissionId || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl">
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
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-surface-hover transition-colors">Cancel</button>
          <button onClick={handleCreate} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/80 transition-colors">Create Task</button>
        </div>
      </div>
    </div>
  );
}
