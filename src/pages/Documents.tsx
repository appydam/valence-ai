import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DocumentCard } from "@/components/DocumentCard";
import { DocumentDetailPanel } from "@/components/DocumentDetailPanel";
import { NewDocumentModal } from "@/components/NewDocumentModal";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Plus } from "lucide-react";

type DocumentType = "report" | "code" | "analysis" | "draft" | "other";

const typeFilters = ["all", "report", "code", "analysis", "draft", "other"] as const;
const authorFilters = ["all", "Kaze", "Scout", "Forge", "Ghost", "Human"] as const;

const Documents = () => {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [selectedDocId, setSelectedDocId] = useState<Id<"documents"> | null>(null);
  const [showNewDoc, setShowNewDoc] = useState(false);

  const documents = useQuery(api.documents.list, {
    author: authorFilter === "all" ? undefined : authorFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
  }) ?? [];

  const createDocument = useMutation(api.documents.create);

  const selectedDoc = documents.find(d => d._id === selectedDocId) ?? null;

  const handleCreate = async (data: { title: string; content: string; type: DocumentType; tags: string[] }) => {
    await createDocument({
      title: data.title,
      content: data.content,
      type: data.type,
      author: "Human",
      tags: data.tags,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">Agent-generated reports, code, and analysis</p>
          </div>
          <button onClick={() => setShowNewDoc(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors">
            <Plus className="w-4 h-4" /> New Document
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground font-medium">Type:</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="bg-secondary rounded-lg px-3 py-1.5 text-xs text-foreground border-0 outline-none">
              {typeFilters.map(t => <option key={t} value={t}>{t === "all" ? "All Types" : t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground font-medium">Author:</label>
            <select value={authorFilter} onChange={e => setAuthorFilter(e.target.value)}
              className="bg-secondary rounded-lg px-3 py-1.5 text-xs text-foreground border-0 outline-none">
              {authorFilters.map(a => <option key={a} value={a}>{a === "all" ? "All Authors" : a}</option>)}
            </select>
          </div>
          <span className="text-xs text-muted-foreground ml-auto">{documents.length} document{documents.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map(doc => (
            <DocumentCard key={doc._id} doc={doc} onClick={() => setSelectedDocId(doc._id)} />
          ))}
        </div>

        {documents.length === 0 && (
          <div className="p-12 rounded-lg border border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground">No documents yet</p>
            <p className="text-xs text-muted-foreground mt-1">Documents created by agents will appear here</p>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedDoc && (
        <DocumentDetailPanel
          document={selectedDoc}
          onClose={() => setSelectedDocId(null)}
        />
      )}

      {/* New document modal */}
      {showNewDoc && (
        <NewDocumentModal onClose={() => setShowNewDoc(false)} onCreate={handleCreate} />
      )}
    </DashboardLayout>
  );
};

export default Documents;
