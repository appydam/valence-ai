import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FileTree, FileNode } from "@/components/FileTree";
import { CodeEditor } from "@/components/CodeEditor";
import {
  FileCode, Save, X, AlertCircle, CheckCircle2,
  Info, Loader2, Plus, FolderPlus, Circle,
} from "lucide-react";
import { apiPost } from "@/lib/api";

// ── File info helpers ──

const FILE_INFO: Record<string, { label: string; description: string }> = {
  "SOUL.md": {
    label: "Agent Personality",
    description: "Defines the agent's core identity, behavior rules, and personality. This is what makes each agent unique.",
  },
  "SKILL.md": {
    label: "Skill Configuration",
    description: "Configures a specific skill's API integration, parameters, and usage rules.",
  },
  "openclaw-config.json": {
    label: "OpenClaw Config",
    description: "Main configuration file for the OpenClaw runtime. Controls which models agents use, session settings, and available skills.",
  },
};

function getFileInfo(name: string) {
  return FILE_INFO[name] || null;
}

// ── Types ──

interface OpenTab {
  path: string;
  name: string;
  content: string;
  originalContent: string;
  dirty: boolean;
}

// ── Build tree from flat file list ──

function buildTree(files: Array<{
  path: string;
  relativePath: string;
  name: string;
  type: "file" | "directory";
  syncStatus: string;
}>): FileNode[] {
  const nodeMap = new Map<string, FileNode>();

  // Create all nodes
  for (const f of files) {
    nodeMap.set(f.path, {
      path: f.path,
      relativePath: f.relativePath,
      name: f.name,
      type: f.type,
      syncStatus: f.syncStatus as FileNode["syncStatus"],
      children: f.type === "directory" ? [] : undefined,
    });
  }

  // Build hierarchy
  const roots: FileNode[] = [];
  for (const f of files) {
    const node = nodeMap.get(f.path)!;
    const parentPath = f.path.substring(0, f.path.lastIndexOf("/"));
    const parent = nodeMap.get(parentPath);
    if (parent && parent.children) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort: directories first, then alphabetical
  const sortNodes = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const n of nodes) {
      if (n.children) sortNodes(n.children);
    }
  };
  sortNodes(roots);

  return roots;
}

// ── Main Component ──

export default function FileManager() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabPath, setActiveTabPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newFileDialog, setNewFileDialog] = useState<{ parentPath: string; type: "file" | "folder" } | null>(null);
  const [newFileName, setNewFileName] = useState("");

  const activeTab = openTabs.find((t) => t.path === activeTabPath) ?? null;

  // ── Load file tree from server ──

  const refreshTree = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiPost("/api/ssh-proxy/file-tree", {});
      if (data.ok && data.files) {
        setTree(buildTree(data.files));
      } else {
        setError(data.error || "Failed to load file tree");
      }
    } catch (err: any) {
      setError(`Failed to connect to server: ${err.message}`);
    }
    setLoading(false);
  }, []);

  // ── Open a file ──

  const openFile = useCallback(async (node: FileNode) => {
    // Check if already open
    const existing = openTabs.find((t) => t.path === node.path);
    if (existing) {
      setActiveTabPath(node.path);
      return;
    }

    setLoading(true);
    try {
      const data = await apiPost("/api/ssh-proxy/file-read", { filePath: node.relativePath });
      if (data.ok) {
        const tab: OpenTab = {
          path: node.path,
          name: node.name,
          content: data.content || "",
          originalContent: data.content || "",
          dirty: false,
        };
        setOpenTabs((prev) => [...prev, tab]);
        setActiveTabPath(node.path);
      } else {
        setError(data.error || "Failed to read file");
      }
    } catch (err: any) {
      setError(`Failed to read file: ${err.message}`);
    }
    setLoading(false);
  }, [openTabs]);

  // ── Update tab content ──

  const updateContent = useCallback((path: string, content: string) => {
    setOpenTabs((prev) =>
      prev.map((t) =>
        t.path === path
          ? { ...t, content, dirty: content !== t.originalContent }
          : t
      )
    );
  }, []);

  // ── Save file ──

  const saveFile = useCallback(async (path: string) => {
    const tab = openTabs.find((t) => t.path === path);
    if (!tab || !tab.dirty) return;

    setSaving(true);
    setError(null);
    try {
      // Extract relative path from the full path
      const relativePath = tab.path.replace(/^\/home\/ubuntu\/\.openclaw\/workspace\//, "");
      const data = await apiPost("/api/ssh-proxy/file-write", {
        filePath: relativePath,
        content: tab.content,
      });
      if (data.ok) {
        setOpenTabs((prev) =>
          prev.map((t) =>
            t.path === path
              ? { ...t, originalContent: t.content, dirty: false }
              : t
          )
        );
        setSuccess(`Saved ${tab.name}`);
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError(data.error || "Failed to save file");
      }
    } catch (err: any) {
      setError(`Failed to save: ${err.message}`);
    }
    setSaving(false);
  }, [openTabs]);

  // ── Close tab ──

  const closeTab = useCallback((path: string) => {
    const tab = openTabs.find((t) => t.path === path);
    if (tab?.dirty) {
      if (!confirm(`${tab.name} has unsaved changes. Close anyway?`)) return;
    }
    setOpenTabs((prev) => prev.filter((t) => t.path !== path));
    if (activeTabPath === path) {
      const remaining = openTabs.filter((t) => t.path !== path);
      setActiveTabPath(remaining.length > 0 ? remaining[remaining.length - 1].path : null);
    }
  }, [openTabs, activeTabPath]);

  // ── New file / folder ──

  const handleNewFile = useCallback((parentPath: string) => {
    setNewFileDialog({ parentPath, type: "file" });
    setNewFileName("");
  }, []);

  const handleNewFolder = useCallback((parentPath: string) => {
    setNewFileDialog({ parentPath, type: "folder" });
    setNewFileName("");
  }, []);

  const createNewItem = useCallback(async () => {
    if (!newFileDialog || !newFileName.trim()) return;
    setError(null);
    try {
      const relativePath = newFileDialog.parentPath.replace(/^\/home\/ubuntu\/\.openclaw\/workspace\/?/, "");
      const fullRelative = relativePath ? `${relativePath}/${newFileName.trim()}` : newFileName.trim();

      if (newFileDialog.type === "folder") {
        await apiPost("/api/ssh-proxy/file-mkdir", { dirPath: fullRelative });
      } else {
        await apiPost("/api/ssh-proxy/file-write", { filePath: fullRelative, content: "" });
      }
      setNewFileDialog(null);
      setNewFileName("");
      refreshTree();
    } catch (err: any) {
      setError(`Failed to create: ${err.message}`);
    }
  }, [newFileDialog, newFileName, refreshTree]);

  // ── Delete file ──

  const handleDelete = useCallback(async (node: FileNode) => {
    if (!confirm(`Delete "${node.name}"? This cannot be undone.`)) return;
    setError(null);
    try {
      const relativePath = node.path.replace(/^\/home\/ubuntu\/\.openclaw\/workspace\//, "");
      await apiPost("/api/ssh-proxy/file-delete", { filePath: relativePath });
      // Close tab if open
      closeTab(node.path);
      refreshTree();
    } catch (err: any) {
      setError(`Failed to delete: ${err.message}`);
    }
  }, [closeTab, refreshTree]);

  const fileInfo = activeTab ? getFileInfo(activeTab.name) : null;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">File Manager</h1>
            <span className="text-xs text-muted-foreground">~/.openclaw/workspace/</span>
          </div>
          <div className="flex items-center gap-2">
            {success && (
              <span className="flex items-center gap-1 text-xs text-emerald-500">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {success}
              </span>
            )}
            {error && (
              <span className="flex items-center gap-1 text-xs text-red-500 max-w-[300px] truncate">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </span>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* File tree sidebar */}
          <div className="w-[260px] border-r border-border bg-card overflow-hidden shrink-0">
            <FileTree
              tree={tree}
              selectedPath={activeTabPath}
              onSelect={openFile}
              onRefresh={refreshTree}
              onNewFile={handleNewFile}
              onNewFolder={handleNewFolder}
              onDelete={handleDelete}
              loading={loading}
            />
          </div>

          {/* Editor area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Tab bar */}
            {openTabs.length > 0 && (
              <div className="flex items-center border-b border-border bg-card overflow-x-auto">
                {openTabs.map((tab) => (
                  <div
                    key={tab.path}
                    className={`flex items-center gap-1.5 px-3 py-2 border-r border-border cursor-pointer text-xs shrink-0 transition-colors ${
                      tab.path === activeTabPath
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                    onClick={() => setActiveTabPath(tab.path)}
                  >
                    {tab.dirty && (
                      <Circle className="w-2 h-2 fill-amber-500 text-amber-500 shrink-0" />
                    )}
                    <span className="truncate max-w-[120px]">{tab.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); closeTab(tab.path); }}
                      className="p-0.5 rounded hover:bg-secondary"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Save button */}
                {activeTab?.dirty && (
                  <button
                    onClick={() => activeTabPath && saveFile(activeTabPath)}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-1.5 ml-auto mr-2 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shrink-0"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Save & Sync
                  </button>
                )}
              </div>
            )}

            {/* Editor or empty state */}
            {activeTab ? (
              <div className="flex-1 overflow-hidden">
                <CodeEditor
                  content={activeTab.content}
                  fileName={activeTab.name}
                  onChange={(c) => updateContent(activeTab.path, c)}
                  onSave={() => saveFile(activeTab.path)}
                  readOnly={false}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FileCode className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {tree.length === 0 ? "Load your workspace" : "Select a file to edit"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {tree.length === 0
                      ? "Click the refresh button in the file tree to load files from your server."
                      : "Click any file in the tree to open it in the editor. Use Cmd+S to save."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* File info panel */}
          {activeTab && fileInfo && (
            <div className="w-[220px] border-l border-border bg-card p-4 shrink-0 overflow-y-auto">
              <div className="flex items-center gap-1.5 mb-3">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  File Info
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                  <p className="text-sm text-foreground font-mono">{activeTab.name}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">What is this?</p>
                  <p className="text-xs font-medium text-foreground">{fileInfo.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{fileInfo.description}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Path</p>
                  <p className="text-[10px] text-muted-foreground font-mono break-all">
                    {activeTab.path}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New file/folder dialog */}
        {newFileDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-xl p-6 w-[400px] shadow-xl">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                {newFileDialog.type === "folder" ? (
                  <><FolderPlus className="w-4 h-4 text-amber-400" /> New Folder</>
                ) : (
                  <><Plus className="w-4 h-4 text-primary" /> New File</>
                )}
              </h3>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder={newFileDialog.type === "folder" ? "folder-name" : "filename.md"}
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-1 focus:ring-primary mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") createNewItem();
                  if (e.key === "Escape") setNewFileDialog(null);
                }}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setNewFileDialog(null)}
                  className="px-3 py-1.5 text-xs rounded bg-secondary text-foreground hover:bg-secondary/80"
                >
                  Cancel
                </button>
                <button
                  onClick={createNewItem}
                  disabled={!newFileName.trim()}
                  className="px-3 py-1.5 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
