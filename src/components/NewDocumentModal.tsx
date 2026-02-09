import { useState } from "react";
import { X } from "lucide-react";

type DocumentType = "report" | "code" | "analysis" | "draft" | "other";

const typeOptions: DocumentType[] = ["report", "code", "analysis", "draft", "other"];

interface NewDocumentModalProps {
  onClose: () => void;
  onCreate: (data: { title: string; content: string; type: DocumentType; tags: string[] }) => void;
}

export function NewDocumentModal({ onClose, onCreate }: NewDocumentModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<DocumentType>("report");
  const [tagsInput, setTagsInput] = useState("");

  const handleCreate = () => {
    if (!title.trim()) return;
    onCreate({
      title: title.trim(),
      content: content.trim(),
      type,
      tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-foreground">New Document</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-hover text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Document title..."
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Document content..." rows={8}
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Type</label>
              <select value={type} onChange={e => setType(e.target.value as DocumentType)}
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none">
                {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Tags</label>
              <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="research, ai..."
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-surface-hover transition-colors">Cancel</button>
          <button onClick={handleCreate} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/80 transition-colors">Create</button>
        </div>
      </div>
    </div>
  );
}
