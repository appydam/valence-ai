import { useState } from "react";
import {
  ChevronRight, ChevronDown, FolderOpen, Folder,
  FileText, FileCode, FileCog, RefreshCw, Plus,
  Trash2, FolderPlus,
} from "lucide-react";

export interface FileNode {
  path: string;
  relativePath: string;
  name: string;
  type: "file" | "directory";
  syncStatus: "synced" | "modified_locally" | "modified_remotely" | "unknown";
  children?: FileNode[];
}

interface FileTreeProps {
  tree: FileNode[];
  selectedPath: string | null;
  onSelect: (node: FileNode) => void;
  onRefresh: () => void;
  onNewFile?: (parentPath: string) => void;
  onNewFolder?: (parentPath: string) => void;
  onDelete?: (node: FileNode) => void;
  loading?: boolean;
}

const SYNC_DOT: Record<string, string> = {
  synced: "bg-emerald-500",
  modified_locally: "bg-amber-500",
  modified_remotely: "bg-blue-500",
  unknown: "bg-zinc-500",
};

function getFileIcon(name: string) {
  if (name.endsWith(".md")) return <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
  if (name.endsWith(".json")) return <FileCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
  if (name.endsWith(".yaml") || name.endsWith(".yml")) return <FileCog className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
  return <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
}

function TreeNode({
  node,
  depth,
  selectedPath,
  onSelect,
  onNewFile,
  onNewFolder,
  onDelete,
}: {
  node: FileNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (node: FileNode) => void;
  onNewFile?: (parentPath: string) => void;
  onNewFolder?: (parentPath: string) => void;
  onDelete?: (node: FileNode) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [showActions, setShowActions] = useState(false);
  const isSelected = selectedPath === node.path;
  const isDir = node.type === "directory";

  return (
    <div>
      <div
        className={`group flex items-center gap-1 px-2 py-1 cursor-pointer rounded text-sm hover:bg-secondary/80 transition-colors ${
          isSelected ? "bg-primary/10 text-primary" : "text-foreground"
        }`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={() => {
          if (isDir) setExpanded(!expanded);
          else onSelect(node);
        }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {isDir ? (
          expanded ? (
            <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
          )
        ) : (
          <span className="w-3 shrink-0" />
        )}

        {isDir ? (
          expanded ? (
            <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )
        ) : (
          getFileIcon(node.name)
        )}

        <span className="truncate flex-1 text-xs">{node.name}</span>

        {node.syncStatus !== "synced" && (
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${SYNC_DOT[node.syncStatus]}`} />
        )}

        {showActions && (
          <div className="flex items-center gap-0.5 shrink-0">
            {isDir && onNewFile && (
              <button
                onClick={(e) => { e.stopPropagation(); onNewFile(node.path); }}
                className="p-0.5 rounded hover:bg-secondary"
                title="New File"
              >
                <Plus className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
            {isDir && onNewFolder && (
              <button
                onClick={(e) => { e.stopPropagation(); onNewFolder(node.path); }}
                className="p-0.5 rounded hover:bg-secondary"
                title="New Folder"
              >
                <FolderPlus className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
            {!isDir && onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(node); }}
                className="p-0.5 rounded hover:bg-red-500/20"
                title="Delete"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
              </button>
            )}
          </div>
        )}
      </div>

      {isDir && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onNewFile={onNewFile}
              onNewFolder={onNewFolder}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({
  tree,
  selectedPath,
  onSelect,
  onRefresh,
  onNewFile,
  onNewFolder,
  onDelete,
  loading,
}: FileTreeProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Files
        </span>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1 rounded hover:bg-secondary disabled:opacity-50"
          title="Refresh from server"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {tree.length === 0 && !loading && (
          <div className="text-center py-8 px-4">
            <Folder className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-xs text-muted-foreground">
              No files found. Click refresh to load from server.
            </p>
          </div>
        )}

        {tree.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            selectedPath={selectedPath}
            onSelect={onSelect}
            onNewFile={onNewFile}
            onNewFolder={onNewFolder}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
