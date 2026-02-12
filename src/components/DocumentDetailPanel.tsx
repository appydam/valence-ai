import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import { MarkdownContent } from "@/components/MarkdownContent";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { X, Trash2, FileText, Code, BarChart3, PenTool, File } from "lucide-react";

const typeIcons: Record<string, typeof FileText> = {
  report: FileText,
  code: Code,
  analysis: BarChart3,
  draft: PenTool,
  other: File,
};

const typeColors: Record<string, string> = {
  report: "text-blue-400 bg-blue-400/15",
  code: "text-green-400 bg-green-400/15",
  analysis: "text-purple-400 bg-purple-400/15",
  draft: "text-yellow-400 bg-yellow-400/15",
  other: "text-gray-400 bg-gray-400/15",
};

interface DocumentData {
  _id: Id<"documents">;
  title: string;
  content: string;
  type: string;
  author: string;
  tags: string[];
  taskId?: Id<"tasks">;
  createdAt: number;
  updatedAt: number;
}

interface DocumentDetailPanelProps {
  document: DocumentData;
  onClose: () => void;
}

export function DocumentDetailPanel({ document: doc, onClose }: DocumentDetailPanelProps) {
  const deleteDoc = useMutation(api.documents.remove);
  const isAgent = Object.keys(AGENT_CONFIG).includes(doc.author);
  const agentConfig = isAgent ? AGENT_CONFIG[doc.author as AgentName] : null;
  const TypeIcon = typeIcons[doc.type] || File;

  const handleDelete = () => {
    deleteDoc({ id: doc._id });
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-card border-l border-border z-50 animate-slide-in-right overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${typeColors[doc.type] || typeColors.other}`}>
            <TypeIcon className="w-3.5 h-3.5" />
          </div>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${typeColors[doc.type] || typeColors.other}`}>
            {doc.type}
          </span>
          <button onClick={handleDelete} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-surface-hover text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Title */}
        <h2 className="text-lg font-semibold text-foreground">{doc.title}</h2>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-muted-foreground font-medium mb-1 block uppercase tracking-wider">Author</label>
            <div className="flex items-center gap-1.5">
              {agentConfig && <span className="text-sm">{agentConfig.emoji}</span>}
              <span className="text-xs" style={agentConfig ? { color: `hsl(var(--agent-${agentConfig.color}))` } : {}}>
                {doc.author}
              </span>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground font-medium mb-1 block uppercase tracking-wider">Created</label>
            <span className="text-xs text-muted-foreground">{getRelativeTime(doc.createdAt)}</span>
          </div>
          {doc.updatedAt !== doc.createdAt && (
            <div>
              <label className="text-[10px] text-muted-foreground font-medium mb-1 block uppercase tracking-wider">Updated</label>
              <span className="text-xs text-muted-foreground">{getRelativeTime(doc.updatedAt)}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {doc.tags.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {doc.tags.map(tag => (
                <span key={tag} className="px-2 py-1 rounded-md text-xs bg-secondary text-muted-foreground">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-2 block">Content</label>
          <div className="p-4 rounded-lg bg-secondary">
            <MarkdownContent content={doc.content} />
          </div>
        </div>
      </div>
    </div>
  );
}
