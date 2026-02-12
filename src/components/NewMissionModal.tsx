import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { X } from "lucide-react";

interface NewMissionModalProps {
  onClose: () => void;
  onCreate: (missionId: Id<"missions">) => void;
}

export function NewMissionModal({ onClose, onCreate }: NewMissionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createMission = useMutation(api.missions.create);

  const handleCreate = async () => {
    if (!title.trim()) return;
    const missionId = await createMission({
      title: title.trim(),
      description: description.trim(),
      createdBy: "Human",
    });
    onCreate(missionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-foreground">New Mission</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-hover text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Mission Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Research AI startups Q1 2026"
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this mission about?"
              rows={3}
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-surface-hover transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            Create Mission
          </button>
        </div>
      </div>
    </div>
  );
}
