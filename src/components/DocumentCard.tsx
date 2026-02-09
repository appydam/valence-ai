import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import { FileText, Code, BarChart3, PenTool, File } from "lucide-react";

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
  _id: string;
  title: string;
  content: string;
  type: string;
  author: string;
  tags: string[];
  createdAt: number;
}

export function DocumentCard({ doc, onClick }: { doc: DocumentData; onClick: () => void }) {
  const isAgent = Object.keys(AGENT_CONFIG).includes(doc.author);
  const agentConfig = isAgent ? AGENT_CONFIG[doc.author as AgentName] : null;
  const TypeIcon = typeIcons[doc.type] || File;

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-surface-hover transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg shrink-0 ${typeColors[doc.type] || typeColors.other}`}>
          <TypeIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground leading-snug line-clamp-2">{doc.title}</h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.content.slice(0, 120)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {agentConfig && <span className="text-sm">{agentConfig.emoji}</span>}
            <span className="text-xs text-muted-foreground">{doc.author}</span>
          </div>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${typeColors[doc.type] || typeColors.other}`}>
            {doc.type}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">{getRelativeTime(doc.createdAt)}</span>
      </div>

      {doc.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {doc.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-secondary text-muted-foreground">{tag}</span>
          ))}
        </div>
      )}
    </button>
  );
}
