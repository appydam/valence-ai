import { useState, useMemo, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MarkdownContent } from "@/components/MarkdownContent";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  ExternalLink,
  FileText,
  Code2,
  Link2,
  ChevronDown,
  ChevronRight,
  XCircle,
  Zap,
  Globe,
  GitBranch,
  Terminal,
  Search,
  Cpu,
  PenTool,
  Shield,
  AlertTriangle,
  Star,
  BookOpen,
  BarChart2,
  Layers,
  Activity,
  Hash,
  Database,
  Mail,
  Calendar,
  Plug,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  inbox: "#94a3b8",
  assigned: "#60a5fa",
  in_progress: "#fbbf24",
  in_review: "#a78bfa",
  done: "#34d399",
  cancelled: "#ef4444",
};

const AGENT_HEX: Record<string, string> = {
  Kaze: "#3b82f6",
  Scout: "#8b5cf6",
  Forge: "#f97316",
  Ghost: "#10b981",
  Sentinel: "#ec4899",
};

const AGENT_TOOLS: Record<string, { label: string; icon: React.ReactNode; category: string }[]> = {
  Scout: [
    { label: "web_fetch", icon: <Globe className="w-3 h-3" />, category: "Research" },
    { label: "DuckDuckGo", icon: <Search className="w-3 h-3" />, category: "Research" },
    { label: "Wikipedia", icon: <FileText className="w-3 h-3" />, category: "Research" },
    { label: "GitHub Search", icon: <GitBranch className="w-3 h-3" />, category: "Research" },
    { label: "HackerNews", icon: <Hash className="w-3 h-3" />, category: "Research" },
  ],
  Forge: [
    { label: "bash", icon: <Terminal className="w-3 h-3" />, category: "Engineering" },
    { label: "git push", icon: <GitBranch className="w-3 h-3" />, category: "Engineering" },
    { label: "create_file", icon: <Code2 className="w-3 h-3" />, category: "Engineering" },
    { label: "GitHub CLI", icon: <GitBranch className="w-3 h-3" />, category: "Engineering" },
  ],
  Ghost: [
    { label: "content drafting", icon: <PenTool className="w-3 h-3" />, category: "Content" },
    { label: "repurpose", icon: <FileText className="w-3 h-3" />, category: "Content" },
  ],
  Kaze: [
    { label: "task delegation", icon: <Zap className="w-3 h-3" />, category: "Orchestration" },
    { label: "quality review", icon: <Shield className="w-3 h-3" />, category: "Orchestration" },
    { label: "HubSpot", icon: <Database className="w-3 h-3" />, category: "CRM" },
    { label: "Gmail", icon: <Mail className="w-3 h-3" />, category: "Communication" },
    { label: "Google Calendar", icon: <Calendar className="w-3 h-3" />, category: "Communication" },
  ],
  Sentinel: [
    { label: "quality rubric", icon: <Shield className="w-3 h-3" />, category: "QA" },
    { label: "approve/reject", icon: <CheckCircle2 className="w-3 h-3" />, category: "QA" },
  ],
};

const INTEGRATION_STYLE: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  hubspot:         { icon: <Database className="w-4 h-4" />, color: "#ff7a59", bg: "#ff7a5915" },
  gmail:           { icon: <Mail className="w-4 h-4" />,     color: "#ea4335", bg: "#ea433515" },
  google_calendar: { icon: <Calendar className="w-4 h-4" />, color: "#1a73e8", bg: "#1a73e815" },
  github:          { icon: <GitBranch className="w-4 h-4" />,color: "#f97316", bg: "#f9731615" },
  linear:          { icon: <Hash className="w-4 h-4" />,     color: "#5e6ad2", bg: "#5e6ad215" },
  notion:          { icon: <FileText className="w-4 h-4" />, color: "#e2e8f0", bg: "#e2e8f010" },
  slack:           { icon: <Hash className="w-4 h-4" />,     color: "#4a154b", bg: "#4a154b15" },
  default:         { icon: <Plug className="w-4 h-4" />,     color: "#60a5fa", bg: "#60a5fa15" },
};

function getIntegrationStyle(name: string) {
  const key = name.toLowerCase().replace(/[\s-]/g, "_");
  return INTEGRATION_STYLE[key] || INTEGRATION_STYLE.default;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractFirstUrl(str: string): string | null {
  const m = str.match(/https?:\/\/[^\s\n"'<>]+/);
  return m ? m[0].replace(/[.,;)]+$/, "") : null;
}

function isNotionUrl(s: string)  { return /https?:\/\/(www\.)?notion\.so/.test(s); }
function isGithubUrl(s: string)  { return /https?:\/\/(www\.)?github\.com/.test(s) || /https?:\/\/raw\.githubusercontent\.com/.test(s); }
function isLinearUrl(s: string)  { return /https?:\/\/linear\.app/.test(s); }
function isSheetsUrl(s: string)  { return /https?:\/\/docs\.google\.com\/spreadsheets/.test(s); }
function isUrl(s: string)        { return /https?:\/\//.test(s); }

type DeliverableCategory = "github" | "notion" | "linear" | "spreadsheet" | "link" | "document" | "code" | "content" | "crm" | "other";

function categorizeDeliverable(d: any): DeliverableCategory {
  const type = (d.type ?? "").toLowerCase().trim();
  const content = d.content ?? "";
  if (["repository", "github_issue", "github_pr"].includes(type)) return "github";
  if (type === "notion") return "notion";
  if (["linear_issue", "linear_epic", "jira_epic"].includes(type)) return "linear";
  if (["spreadsheet", "csv"].includes(type)) return "spreadsheet";
  if (["intercom_contact", "zendesk_ticket", "crm_contact"].includes(type)) return "crm";
  if (type === "code" || type === "json") return "code";
  if (["content", "email-sequence", "email-template", "outreach"].includes(type)) return "content";
  if (["markdown", "text/markdown", "document", "documentation", "report", "research", "research_report", "tracking"].includes(type)) return "document";
  // URL or unknown: inspect content
  if (type === "url" || isUrl(content)) {
    if (isGithubUrl(content)) return "github";
    if (isNotionUrl(content)) return "notion";
    if (isLinearUrl(content)) return "linear";
    if (isSheetsUrl(content))  return "spreadsheet";
    if (isUrl(content)) return "link";
  }
  return "other";
}

function getDeliverableUrl(d: any): string | null {
  const c = d.content ?? "";
  if (isUrl(c.trim())) return c.trim().split(/\s/)[0].replace(/[.,;)]+$/, "");
  return extractFirstUrl(c);
}

function isMeaningfulActivity(action: string): boolean {
  return !["agent_wakeup", "agent_heartbeat", "agent_offline", "session_recovery"].includes(action);
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return "—";
  const mins = Math.floor(ms / 60000);
  const hrs  = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ${hrs % 24}h`;
  if (hrs > 0)  return `${hrs}h ${mins % 60}m`;
  return `${mins}m`;
}

function formatActionLabel(action: string): string {
  return ({ task_completed: "Completed task", task_rejected: "Rejected task", task_assigned: "Assigned task", dependency_resolved: "Dependency cleared", task_delegated: "Delegated subtasks", task_created: "Created task" } as Record<string, string>)[action] ?? action.replace(/_/g, " ");
}

function wordCount(text: string): number { return text.trim().split(/\s+/).filter(Boolean).length; }
function readTime(text: string): string  { return `${Math.max(1, Math.round(wordCount(text) / 200))} min read`; }

// Extract headings from markdown for TOC
function extractHeadings(md: string) {
  return md.split("\n").flatMap((line) => {
    const m = line.match(/^(#{2,3})\s+(.+)/);
    if (!m) return [];
    const text = m[2].trim();
    return [{ level: m[1].length, text, anchor: text.toLowerCase().replace(/[^a-z0-9]+/g, "-") }];
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ label, value, sub, color = "default" }: {
  label: string; value: string | number; sub?: string;
  color?: "default" | "green" | "amber" | "red" | "blue";
}) {
  const vc = { green: "text-green-400", amber: "text-amber-400", red: "text-red-400", blue: "text-blue-400", default: "text-foreground" }[color];
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${vc}`}>{value}</span>
      {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
    </div>
  );
}

function AgentAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const config = AGENT_CONFIG[name as AgentName];
  const hex = AGENT_HEX[name] || "#888";
  const sz = { sm: "w-7 h-7 text-sm", md: "w-9 h-9 text-lg", lg: "w-11 h-11 text-2xl" }[size];
  return (
    <div className={`${sz} rounded-full flex items-center justify-center shrink-0 border-2`}
      style={{ borderColor: hex + "60", backgroundColor: hex + "15" }}>
      <span>{config?.emoji || "?"}</span>
    </div>
  );
}

// Markdown viewer with clickable TOC that actually scrolls
function MarkdownDocViewer({ content, title }: { content: string; title: string }) {
  const headings = useMemo(() => extractHeadings(content), [content]);
  const [activeIdx, setActiveIdx] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  const handleTocClick = useCallback((idx: number, anchor: string) => {
    setActiveIdx(idx);
    if (!bodyRef.current) return;
    // Find a heading element whose text matches — MarkdownContent renders h2/h3 without IDs,
    // so we walk the DOM to find matching text content.
    const headingEls = bodyRef.current.querySelectorAll("h1,h2,h3,h4");
    const target = Array.from(headingEls).find(
      (el) => el.textContent?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") === anchor
    );
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const words = useMemo(() => wordCount(content), [content]);

  return (
    <div className="flex rounded-xl overflow-hidden border border-border/60 bg-card">
      {/* TOC rail — only if 3+ headings */}
      {headings.length >= 3 && (
        <div className="w-44 shrink-0 bg-secondary/30 border-r border-border/40 flex flex-col overflow-y-auto" style={{ maxHeight: 480 }}>
          <div className="px-3 pt-3 pb-1 text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Contents</div>
          {headings.map((h, i) => (
            <button
              key={h.anchor + i}
              onClick={() => handleTocClick(i, h.anchor)}
              className={`text-left text-[11px] leading-snug px-3 py-1.5 transition-colors truncate ${h.level === 3 ? "pl-6" : ""} ${
                activeIdx === i ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
              title={h.text}
            >
              {h.text}
            </button>
          ))}
        </div>
      )}
      {/* Body */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b border-border/40 flex items-center gap-3 bg-secondary/20 shrink-0">
          <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-xs font-medium text-foreground flex-1 truncate">{title}</span>
          <span className="text-[10px] text-muted-foreground shrink-0">{words.toLocaleString()} words · {readTime(content)}</span>
        </div>
        <div ref={bodyRef} className="overflow-y-auto p-5" style={{ maxHeight: 440 }}>
          <MarkdownContent content={content} />
        </div>
      </div>
    </div>
  );
}

// Terminal-style code viewer (collapsed by default)
function CodeViewer({ content, label }: { content: string; label: string }) {
  const [open, setOpen] = useState(false);
  const lines = useMemo(() => content.split("\n").length, [content]);
  const lang = content.match(/^```(\w+)/)?.[1] ||
    (content.trim().startsWith("{") || content.trim().startsWith("[") ? "json" :
     content.includes("def ") ? "python" :
     content.includes("function ") || content.includes("const ") ? "javascript" : "code");

  return (
    <div className="rounded-xl overflow-hidden border border-border/60 bg-black/60">
      <div
        className="flex items-center gap-2 px-4 py-2.5 bg-black/80 border-b border-white/5 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70 shrink-0" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70 shrink-0" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70 shrink-0" />
        <Code2 className="w-3 h-3 text-white/40 ml-1 shrink-0" />
        <span className="text-xs text-white/60 font-mono flex-1 truncate">{label}</span>
        <span className="text-[10px] text-white/30 font-mono shrink-0">{lang} · {lines} lines</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-white/40 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0" />}
      </div>
      {open ? (
        <div className="p-4 overflow-x-auto overflow-y-auto" style={{ maxHeight: 400 }}>
          <pre className="text-xs text-green-300/80 font-mono whitespace-pre leading-relaxed">{content}</pre>
        </div>
      ) : (
        <div
          className="px-4 py-2 text-[11px] text-white/30 font-mono cursor-pointer hover:text-white/50 transition-colors"
          onClick={() => setOpen(true)}
        >
          Click to expand · {lines} lines
        </div>
      )}
    </div>
  );
}

// Resource card for URLs, repos, CRM records, etc.
function ResourceCard({ d }: { d: any }) {
  const cat = useMemo(() => categorizeDeliverable(d), [d]);
  const url = useMemo(() => getDeliverableUrl(d), [d]);

  const desc = useMemo(() =>
    (d.content ?? "").split("\n").filter((l: string) => l.trim() && !isUrl(l.trim())).slice(0, 3).join(" ").slice(0, 160)
  , [d.content]);

  const styleMap = {
    github:     { border: "border-orange-500/25", bg: "bg-orange-500/[0.04]", icon: <GitBranch className="w-4 h-4 text-orange-400" />, badge: "GitHub",      badgeBg: "bg-orange-500/10", badgeText: "text-orange-400", linkColor: "text-orange-400" },
    notion:     { border: "border-amber-500/25",  bg: "bg-amber-500/[0.04]",  icon: <FileText className="w-4 h-4 text-amber-400" />,   badge: "Notion",       badgeBg: "bg-amber-500/10",  badgeText: "text-amber-400",  linkColor: "text-amber-400",  warning: "Workspace login required" },
    linear:     { border: "border-indigo-500/25", bg: "bg-indigo-500/[0.04]", icon: <Hash className="w-4 h-4 text-indigo-400" />,      badge: "Linear",       badgeBg: "bg-indigo-500/10", badgeText: "text-indigo-400", linkColor: "text-indigo-400" },
    spreadsheet:{ border: "border-green-500/25",  bg: "bg-green-500/[0.04]",  icon: <BarChart2 className="w-4 h-4 text-green-400" />,  badge: "Spreadsheet",  badgeBg: "bg-green-500/10",  badgeText: "text-green-400",  linkColor: "text-green-400" },
    crm:        { border: "border-rose-500/25",   bg: "bg-rose-500/[0.04]",   icon: <Database className="w-4 h-4 text-rose-400" />,    badge: "CRM",          badgeBg: "bg-rose-500/10",   badgeText: "text-rose-400",   linkColor: "text-rose-400" },
    link:       { border: "border-blue-500/25",   bg: "bg-blue-500/[0.04]",   icon: <Link2 className="w-4 h-4 text-blue-400" />,       badge: "Link",         badgeBg: "bg-blue-500/10",   badgeText: "text-blue-400",   linkColor: "text-blue-400" },
  } as Record<string, any>;

  const s = styleMap[cat] ?? styleMap.link;

  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} p-4`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-secondary/50">{s.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{d.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${s.badgeBg} ${s.badgeText} font-medium`}>{s.badge}</span>
          </div>
          {s.warning && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="text-[11px] text-amber-400/80">{s.warning}</span>
            </div>
          )}
          {desc && <p className="text-[11px] text-muted-foreground mb-1.5 leading-relaxed">{desc}</p>}
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-[11px] ${s.linkColor} hover:underline break-all`}>
              <ExternalLink className="w-3 h-3 shrink-0" />
              {url.length > 80 ? url.slice(0, 80) + "…" : url}
            </a>
          ) : (
            <p className="text-[11px] text-muted-foreground italic">{d.content?.slice(0, 120)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Route to the right renderer
function DeliverableRenderer({ d }: { d: any }) {
  const cat = categorizeDeliverable(d);
  if (["github", "notion", "linear", "spreadsheet", "crm", "link", "other"].includes(cat)) return <ResourceCard d={d} />;
  if (cat === "code") {
    const pretty = d.type?.toLowerCase() === "json"
      ? (() => { try { return JSON.stringify(JSON.parse(d.content), null, 2); } catch { return d.content; } })()
      : d.content;
    return <CodeViewer content={pretty} label={d.type?.toLowerCase() === "json" ? `${d.name} (JSON)` : d.name} />;
  }
  if (cat === "content") {
    return (
      <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-foreground">{d.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{d.type}</span>
        </div>
        {/* Use div not pre so line-clamp works */}
        <div className="text-xs text-foreground/70 whitespace-pre-wrap leading-relaxed font-sans line-clamp-8">{d.content}</div>
      </div>
    );
  }
  return <MarkdownDocViewer content={d.content ?? ""} title={d.name} />;
}

// Agent deliverable group — collapsed by default to avoid DOM bloat
function DeliverableGroup({ agentName, deliverables }: { agentName: string; deliverables: any[] }) {
  const [open, setOpen] = useState(false);
  const hex = AGENT_HEX[agentName] || "#888";
  const config = AGENT_CONFIG[agentName as AgentName];

  // Count by category for the header summary
  const catSummary = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of deliverables) {
      const c = categorizeDeliverable(d);
      m[c] = (m[c] || 0) + 1;
    }
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [deliverables]);

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-secondary/20 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0 border-2"
          style={{ borderColor: hex + "60", backgroundColor: hex + "15" }}>
          {config?.emoji || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{agentName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ backgroundColor: hex + "20", color: hex }}>
              {deliverables.length} output{deliverables.length !== 1 ? "s" : ""}
            </span>
            {/* Mini category pills */}
            {catSummary.map(([cat, cnt]) => (
              <span key={cat} className="text-[10px] text-muted-foreground">
                {cnt} {cat}
              </span>
            ))}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{config?.role || "Agent"}</div>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-border/40 px-4 pb-4 space-y-4">
          {deliverables.map((d, i) => (
            <div key={`${d.taskId ?? ""}-${i}`} className="pt-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">From task:</span>
                <span className="text-[11px] text-muted-foreground truncate">{d.taskTitle}</span>
              </div>
              <DeliverableRenderer d={d} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Agent work card
function AgentWorkCard({ agent }: { agent: any }) {
  const [expanded, setExpanded] = useState(false);
  const config = AGENT_CONFIG[agent.name as AgentName];
  const hex = AGENT_HEX[agent.name] || "#888";
  const tools = AGENT_TOOLS[agent.name] || [];
  const pct = agent.taskCount > 0 ? Math.round((agent.completedCount / agent.taskCount) * 100) : 0;
  const toolsByCategory = useMemo(() => {
    const m: Record<string, typeof tools> = {};
    for (const t of tools) { if (!m[t.category]) m[t.category] = []; m[t.category].push(t); }
    return m;
  }, [tools]);

  return (
    <div className="rounded-xl border border-border/70 overflow-hidden bg-card" style={{ borderTopColor: hex, borderTopWidth: "2px" }}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <AgentAvatar name={agent.name} size="lg" />
            <div>
              <div className="font-semibold text-foreground">{agent.name}</div>
              <div className="text-[11px] text-muted-foreground">{config?.role || agent.role}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold" style={{ color: hex }}>{pct}%</div>
            <div className="text-[10px] text-muted-foreground">done</div>
          </div>
        </div>
        <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden mb-3">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: hex }} />
        </div>
        <div className="flex gap-4 text-center mb-3">
          <div className="flex-1">
            <div className="text-base font-bold text-foreground">{agent.taskCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Tasks</div>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1">
            <div className="text-base font-bold text-green-400">{agent.completedCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Done</div>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1">
            <div className="text-base font-bold" style={{ color: hex }}>{agent.deliverableCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Outputs</div>
          </div>
        </div>
        {/* Tools grouped by category */}
        {Object.entries(toolsByCategory).map(([cat, catTools]) => (
          <div key={cat} className="mb-2">
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">{cat}</div>
            <div className="flex flex-wrap gap-1">
              {catTools.map((t) => (
                <div key={t.label} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ backgroundColor: hex + "15", color: hex }}>
                  {t.icon}{t.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border/50">
        <button onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-secondary/40 transition-colors">
          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{agent.tasks.length} tasks</span>
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        {expanded && (
          <div className="px-3 pb-3 space-y-1">
            {agent.tasks.map((task: any) => (
              <div key={task._id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-secondary/30">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[task.status] || "#888" }} />
                <span className="text-xs text-foreground/80 flex-1 truncate">{task.title}</span>
                {(task.deliverables?.length || 0) > 0 && (
                  <span className="text-[10px] text-primary flex items-center gap-0.5 shrink-0">
                    <Package className="w-2.5 h-2.5" />{task.deliverables.length}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type TabId = "outcomes" | "deliverables" | "squad" | "tools" | "timeline";

export default function MissionReport() {
  const { missionId } = useParams<{ missionId: string }>();
  const report = useQuery(api.missions.getReport, missionId ? { missionId: missionId as Id<"missions"> } : "skip");
  const [activeTab, setActiveTab] = useState<TabId>("outcomes");

  // ── ALL hooks must be called unconditionally before any early returns ──
  const deliverables: any[] = (report as any)?.deliverables ?? [];
  const activity: any[]     = (report as any)?.activity ?? [];
  const agentContributions: any[] = (report as any)?.agentContributions ?? [];
  const integrations: any[] = (report as any)?.integrations ?? [];

  const meaningfulActivity = useMemo(() => activity.filter((a: any) => isMeaningfulActivity(a.action)), [activity]);
  const activeAgents = useMemo(() => agentContributions.filter((a: any) => a.name !== "Unassigned" && a.taskCount > 0), [agentContributions]);
  const totalApiCalls = useMemo(() => integrations.reduce((s: number, i: any) => s + (i.total ?? 0), 0), [integrations]);

  const buckets = useMemo(() => {
    const b: Record<DeliverableCategory, any[]> = {
      github: [], notion: [], linear: [], spreadsheet: [], link: [], document: [], code: [], content: [], crm: [], other: [],
    };
    for (const d of deliverables) b[categorizeDeliverable(d)].push(d);
    return b;
  }, [deliverables]);

  const deliverableSub = useMemo(() => {
    const parts = [
      buckets.document.length > 0 && `${buckets.document.length} docs`,
      buckets.github.length   > 0 && `${buckets.github.length} repos`,
      buckets.notion.length   > 0 && `${buckets.notion.length} notion`,
      buckets.linear.length   > 0 && `${buckets.linear.length} linear`,
    ].filter(Boolean);
    return parts.length ? parts.join(" · ") : "view breakdown below";
  }, [buckets]);

  const deliverablesByAgent = useMemo(() => {
    const m: Record<string, any[]> = {};
    for (const d of deliverables) {
      const k = d.agentName || "Unassigned";
      if (!m[k]) m[k] = [];
      m[k].push(d);
    }
    return m;
  }, [deliverables]);

  const agentOrder = useMemo(() =>
    Object.keys(deliverablesByAgent).sort((a, b) => (deliverablesByAgent[b]?.length || 0) - (deliverablesByAgent[a]?.length || 0))
  , [deliverablesByAgent]);

  // ── Early returns after all hooks ──
  if (report === undefined) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <Cpu className="w-6 h-6 text-primary animate-pulse" />
            <p className="text-muted-foreground text-sm">Loading mission report…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (report === null) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Mission not found.</p>
          <Link to="/missions" className="text-primary text-sm hover:underline mt-2 inline-block">← Back to Missions</Link>
        </div>
      </DashboardLayout>
    );
  }

  const { mission, tasks, summary, quality, timing } = report;
  const progressPct = summary.totalTasks > 0 ? Math.round((summary.completedTasks / summary.totalTasks) * 100) : 0;

  const statusColor = mission.status === "completed" ? "#34d399" : mission.status === "active" ? "#60a5fa" : "#94a3b8";

  const tabs: { id: TabId; label: string; count?: number; icon: React.ReactNode }[] = [
    { id: "outcomes",     label: "Outcomes",     icon: <Star className="w-3.5 h-3.5" /> },
    { id: "deliverables", label: "Deliverables", count: summary.totalDeliverables, icon: <Package className="w-3.5 h-3.5" /> },
    { id: "squad",        label: "Squad",        count: summary.totalTasks,         icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: "tools",        label: "Tools Used",   count: totalApiCalls > 0 ? totalApiCalls : undefined, icon: <Plug className="w-3.5 h-3.5" /> },
    { id: "timeline",     label: "Timeline",     count: meaningfulActivity.length,  icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  // Outcome category cards config
  const outcomeSections: { key: DeliverableCategory; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "github",      label: "GitHub Repos / PRs",     icon: <GitBranch className="w-4 h-4" />, color: "#f97316" },
    { key: "notion",      label: "Notion Pages",            icon: <FileText className="w-4 h-4" />,  color: "#94a3b8" },
    { key: "linear",      label: "Linear Issues",           icon: <Hash className="w-4 h-4" />,      color: "#5e6ad2" },
    { key: "spreadsheet", label: "Spreadsheets",            icon: <BarChart2 className="w-4 h-4" />, color: "#34d399" },
    { key: "document",    label: "Documents",               icon: <BookOpen className="w-4 h-4" />,  color: "#60a5fa" },
    { key: "code",        label: "Code Files",              icon: <Code2 className="w-4 h-4" />,     color: "#fbbf24" },
    { key: "content",     label: "Content / Copy",          icon: <PenTool className="w-4 h-4" />,   color: "#10b981" },
    { key: "crm",         label: "CRM Records",             icon: <Database className="w-4 h-4" />,  color: "#ff7a59" },
    { key: "link",        label: "Other Links",             icon: <Link2 className="w-4 h-4" />,     color: "#a78bfa" },
  ].filter((s) => buckets[s.key].length > 0);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-16">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/missions" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Missions
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-foreground/70 truncate max-w-sm">{mission.title}</span>
        </div>

        {/* HERO */}
        <div className="relative rounded-2xl border border-border/60 overflow-hidden mb-6 bg-card">
          <div className="h-1 w-full" style={{ backgroundColor: statusColor }} />
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: statusColor + "20", color: statusColor }}>
                    {mission.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                    {mission.status === "active" && <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                    <span className="capitalize">{mission.status}</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(mission.createdAt)}{mission.completedAt && ` → ${formatDate(mission.completedAt)}`}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-foreground mb-1.5">{mission.title}</h1>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{mission.description}</p>
                {activeAgents.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[11px] text-muted-foreground">Squad:</span>
                    <div className="flex -space-x-2">
                      {activeAgents.map((a: any) => (
                        <div key={a.name} title={a.name} className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-card"
                          style={{ backgroundColor: AGENT_HEX[a.name] + "30" }}>
                          {AGENT_CONFIG[a.name as AgentName]?.emoji}
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{activeAgents.map((a: any) => a.name).join(", ")}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/missions/${mission._id}/warroom`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors">
                  <Zap className="w-3.5 h-3.5" /> War Room
                </Link>
                <Link to={`/board?mission=${mission._id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-secondary transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Open Board
                </Link>
              </div>
            </div>

            {/* KPI row */}
            <div className="mt-5 pt-5 border-t border-border/50 grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-4">
              <div className="col-span-2 md:col-span-1">
                <StatPill label="Progress" value={`${summary.completedTasks}/${summary.totalTasks}`}
                  sub={`${progressPct}% complete`} color={progressPct === 100 ? "green" : "blue"} />
                <div className="mt-2 w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${progressPct}%`, backgroundColor: progressPct === 100 ? "#34d399" : "#60a5fa" }} />
                </div>
              </div>
              <div className="w-px bg-border hidden md:block" />
              <StatPill label="Deliverables" value={summary.totalDeliverables} sub={deliverableSub} color="blue" />
              <div className="w-px bg-border hidden md:block" />
              <StatPill label="Duration" value={formatDuration(timing.missionDuration)} sub={`avg ${formatDuration(timing.avgTaskDuration)}/task`} />
            </div>
          </div>
        </div>

        {/* TAB NAV */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl bg-secondary/40 w-fit overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}>
              {t.icon}{t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === t.id ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ═══ TAB: OUTCOMES ═══ */}
        {activeTab === "outcomes" && (
          <div className="space-y-6">
            {deliverables.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-16 text-center">
                <Package className="w-10 h-10 text-muted-foreground mb-3 opacity-30" />
                <p className="text-sm font-medium text-muted-foreground">No deliverables produced yet</p>
                <p className="text-xs text-muted-foreground mt-1 opacity-60">Outcomes appear once agents complete tasks</p>
              </div>
            ) : (
              <>
                {/* Summary stat cards — only show categories that exist */}
                {outcomeSections.length > 0 && (
                  <div className={`grid gap-3 ${outcomeSections.length <= 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3 xl:grid-cols-5"}`}>
                    {outcomeSections.map((s) => (
                      <div key={s.key} className="rounded-xl border border-border/60 bg-card p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: s.color + "15", color: s.color }}>{s.icon}</div>
                        <div>
                          <div className="text-lg font-bold text-foreground">{buckets[s.key].length}</div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight">{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* GitHub */}
                {buckets.github.length > 0 && (
                  <section>
                    <SectionHeader icon={<GitBranch className="w-4 h-4 text-orange-400" />} title="Code & Repositories" count={buckets.github.length} />
                    <div className="space-y-2">{buckets.github.map((d: any, i: number) => <ResourceCard key={`gh-${i}`} d={d} />)}</div>
                  </section>
                )}

                {/* Notion */}
                {buckets.notion.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-foreground">Notion Pages</h3>
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                        <AlertTriangle className="w-3 h-3" />Workspace login required
                      </span>
                    </div>
                    <div className="space-y-2">{buckets.notion.map((d: any, i: number) => <ResourceCard key={`no-${i}`} d={d} />)}</div>
                  </section>
                )}

                {/* Linear */}
                {buckets.linear.length > 0 && (
                  <section>
                    <SectionHeader icon={<Hash className="w-4 h-4 text-indigo-400" />} title="Linear Issues & Epics" count={buckets.linear.length} />
                    <div className="space-y-2">{buckets.linear.map((d: any, i: number) => <ResourceCard key={`li-${i}`} d={d} />)}</div>
                  </section>
                )}

                {/* Spreadsheets */}
                {buckets.spreadsheet.length > 0 && (
                  <section>
                    <SectionHeader icon={<BarChart2 className="w-4 h-4 text-green-400" />} title="Spreadsheets & Data" count={buckets.spreadsheet.length} />
                    <div className="space-y-2">{buckets.spreadsheet.map((d: any, i: number) => <ResourceCard key={`ss-${i}`} d={d} />)}</div>
                  </section>
                )}

                {/* CRM */}
                {buckets.crm.length > 0 && (
                  <section>
                    <SectionHeader icon={<Database className="w-4 h-4 text-rose-400" />} title="CRM & Support Records" count={buckets.crm.length} />
                    <div className="space-y-2">{buckets.crm.map((d: any, i: number) => <ResourceCard key={`cr-${i}`} d={d} />)}</div>
                  </section>
                )}

                {/* Other links */}
                {buckets.link.length > 0 && (
                  <section>
                    <SectionHeader icon={<Link2 className="w-4 h-4 text-blue-400" />} title="Other Links" count={buckets.link.length} />
                    <div className="space-y-2">{buckets.link.map((d: any, i: number) => <ResourceCard key={`lk-${i}`} d={d} />)}</div>
                  </section>
                )}

                {/* Content / copy — preview 3, rest is a link to Deliverables */}
                {buckets.content.length > 0 && (
                  <section>
                    <SectionHeader icon={<PenTool className="w-4 h-4 text-emerald-400" />} title="Content & Copy" count={buckets.content.length} />
                    <div className="space-y-2">
                      {buckets.content.slice(0, 3).map((d: any, i: number) => (
                        <div key={`ct-${i}`} className="rounded-xl border border-border/50 bg-secondary/20 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-foreground">{d.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{d.type}</span>
                          </div>
                          <div className="text-xs text-foreground/70 whitespace-pre-wrap leading-relaxed font-sans line-clamp-6">{d.content}</div>
                        </div>
                      ))}
                      {buckets.content.length > 3 && (
                        <button onClick={() => setActiveTab("deliverables")}
                          className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-2 border border-dashed border-border/50 rounded-lg transition-colors">
                          +{buckets.content.length - 3} more — view in Deliverables tab
                        </button>
                      )}
                    </div>
                  </section>
                )}

                {/* Documents — first one inline, rest as word-count links */}
                {buckets.document.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-semibold text-foreground">Research & Documents</h3>
                      <span className="text-[11px] text-muted-foreground">
                        {buckets.document.length > 1 && (
                          <><span className="opacity-60">— </span>
                          <button className="text-primary hover:underline" onClick={() => setActiveTab("deliverables")}>
                            Deliverables tab
                          </button>{" "}to read all {buckets.document.length}</>
                        )}
                      </span>
                    </div>
                    <MarkdownDocViewer content={buckets.document[0].content ?? ""} title={buckets.document[0].name} />
                    {buckets.document.length > 1 && (
                      <div className="mt-2 space-y-1">
                        {buckets.document.slice(1).map((d: any, i: number) => (
                          <button key={`doc-${i}`} onClick={() => setActiveTab("deliverables")}
                            className="w-full text-left px-3 py-2 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{d.name}</span>
                            <span className="ml-auto shrink-0 text-[10px]">{wordCount(d.content ?? "").toLocaleString()} words</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* Code files */}
                {buckets.code.length > 0 && (
                  <section>
                    <SectionHeader icon={<Code2 className="w-4 h-4 text-yellow-400" />} title="Code Files" count={buckets.code.length} />
                    <div className="space-y-2">
                      {buckets.code.map((d: any, i: number) => {
                        const pretty = d.type?.toLowerCase() === "json"
                          ? (() => { try { return JSON.stringify(JSON.parse(d.content), null, 2); } catch { return d.content; } })()
                          : d.content;
                        return <CodeViewer key={`co-${i}`} content={pretty} label={d.name} />;
                      })}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══ TAB: DELIVERABLES ═══ */}
        {activeTab === "deliverables" && (
          <div className="space-y-4">
            {deliverables.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-16 text-center">
                <Package className="w-10 h-10 text-muted-foreground mb-3 opacity-30" />
                <p className="text-sm text-muted-foreground">No deliverables produced yet</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {deliverables.length} outputs grouped by agent — click to expand. Markdown docs include a scrollable TOC sidebar.
                </p>
                {agentOrder.map((agentName) => (
                  <DeliverableGroup key={agentName} agentName={agentName} deliverables={deliverablesByAgent[agentName]} />
                ))}
              </>
            )}
          </div>
        )}

        {/* ═══ TAB: SQUAD ═══ */}
        {activeTab === "squad" && (
          <div className="space-y-6">
            {activeAgents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...activeAgents].sort((a: any, b: any) => b.completedCount - a.completedCount).map((agent: any) => (
                  <AgentWorkCard key={agent.name} agent={agent} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-16 text-center">
                <Cpu className="w-10 h-10 text-muted-foreground mb-3 opacity-30" />
                <p className="text-sm text-muted-foreground">No agent work recorded yet</p>
              </div>
            )}

            {/* Quality */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border/50">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-pink-400" /> Quality Snapshot
                </h3>
              </div>
              <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatPill label="First-Pass Rate" value={`${quality.firstPassRate}%`} sub="accepted without revision"
                  color={quality.firstPassRate >= 80 ? "green" : quality.firstPassRate >= 50 ? "amber" : "red"} />
                <StatPill label="Total Revisions" value={quality.totalIterations} sub={`${quality.rejectedTaskCount} tasks revised`}
                  color={quality.totalIterations > 0 ? "amber" : "green"} />
                <StatPill label="Cancelled" value={quality.cancelledCount} sub="tasks not completed"
                  color={quality.cancelledCount > 0 ? "red" : "green"} />
                <StatPill label="Sentinel Reviews" value={tasks.filter((t: any) => t.status === "done" || t.status === "in_review").length}
                  sub="tasks reviewed" />
              </div>
              {quality.rejectedTaskCount > 0 ? (
                <div className="px-5 pb-5">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Tasks That Required Revision</div>
                  <div className="space-y-2">
                    {tasks.filter((t: any) => (t.iterationCount || 0) > 0).map((t: any) => (
                      <div key={t._id} className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/20">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-foreground">{t.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                              {t.iterationCount}/{t.maxIterations || 3} iterations
                            </span>
                            {t.assignee && <span className="text-[10px] text-muted-foreground">{AGENT_CONFIG[t.assignee as AgentName]?.emoji} {t.assignee}</span>}
                          </div>
                          {t.rejectionReason && <p className="text-[11px] text-amber-400/70 mt-1 leading-relaxed">"{t.rejectionReason}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-2 text-green-400 text-xs">
                    <Star className="w-3.5 h-3.5" /> All tasks passed Sentinel review on first submission
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ TAB: TOOLS USED ═══ */}
        {activeTab === "tools" && (
          <div className="space-y-6">
            {/* Live API call data */}
            {integrations.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Plug className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Integration API Calls</h3>
                  <span className="text-[11px] text-muted-foreground">
                    — {totalApiCalls} real API calls across {integrations.length} service{integrations.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {integrations.map((intg: any) => {
                    const style = getIntegrationStyle(intg.name);
                    const successRate = intg.total > 0 ? Math.round((intg.success / intg.total) * 100) : 0;
                    return (
                      <div key={intg.name} className="rounded-xl border border-border/60 bg-card p-4"
                        style={{ borderLeftColor: style.color, borderLeftWidth: "3px" }}>
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: style.bg, color: style.color }}>{style.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-sm font-semibold text-foreground capitalize">{intg.name.replace(/_/g, " ")}</span>
                              <span className="text-xs font-bold tabular-nums"
                                style={{ color: successRate >= 80 ? "#34d399" : successRate >= 50 ? "#fbbf24" : "#ef4444" }}>
                                {successRate}% success
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${successRate}%`, backgroundColor: style.color }} />
                              </div>
                              <span className="text-[10px] text-muted-foreground shrink-0">{intg.success}/{intg.total} calls</span>
                            </div>
                            {intg.tools?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {intg.tools.slice(0, 8).map((tool: string) => (
                                  <span key={tool} className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                                    style={{ backgroundColor: style.bg, color: style.color }}>{tool}</span>
                                ))}
                                {intg.tools.length > 8 && (
                                  <span className="text-[10px] text-muted-foreground px-1.5 py-0.5">+{intg.tools.length - 8} more</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Built-in tools per agent */}
            {activeAgents.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Built-in Agent Tools</h3>
                  <span className="text-[11px] text-muted-foreground">— tools each agent can use</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeAgents.map((agent: any) => {
                    const tools = AGENT_TOOLS[agent.name] || [];
                    if (!tools.length) return null;
                    const hex = AGENT_HEX[agent.name] || "#888";
                    const config = AGENT_CONFIG[agent.name as AgentName];
                    const byCategory: Record<string, typeof tools> = {};
                    for (const t of tools) { if (!byCategory[t.category]) byCategory[t.category] = []; byCategory[t.category].push(t); }
                    return (
                      <div key={agent.name} className="rounded-xl border border-border/60 bg-card p-4"
                        style={{ borderTopColor: hex, borderTopWidth: "2px" }}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm border-2"
                            style={{ borderColor: hex + "60", backgroundColor: hex + "15" }}>{config?.emoji || "?"}</div>
                          <span className="text-sm font-semibold text-foreground">{agent.name}</span>
                          <span className="text-[11px] text-muted-foreground">{config?.role || ""}</span>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(byCategory).map(([cat, catTools]) => (
                            <div key={cat}>
                              <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">{cat}</div>
                              <div className="flex flex-wrap gap-1.5">
                                {catTools.map((tool) => (
                                  <div key={tool.label} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border"
                                    style={{ backgroundColor: hex + "10", color: hex, borderColor: hex + "25" }}>
                                    {tool.icon}{tool.label}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {integrations.length === 0 && activeAgents.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-16 text-center">
                <Plug className="w-10 h-10 text-muted-foreground mb-3 opacity-30" />
                <p className="text-sm text-muted-foreground">No tool activity recorded for this mission</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB: TIMELINE ═══ */}
        {activeTab === "timeline" && (
          <div>
            {meaningfulActivity.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-16 text-center">
                <Activity className="w-10 h-10 text-muted-foreground mb-3 opacity-30" />
                <p className="text-sm text-muted-foreground">No mission events recorded yet</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Mission Events</h3>
                  <span className="text-[11px] text-muted-foreground">{meaningfulActivity.length} events</span>
                </div>
                <div className="divide-y divide-border/40">
                  {meaningfulActivity.map((entry: any, i: number) => {
                    const hex = AGENT_HEX[entry.agentName] || "#888";
                    const isComp = entry.action === "task_completed";
                    const isRej  = entry.action === "task_rejected";
                    return (
                      <div key={entry._id || i}
                        className={`px-5 py-3.5 flex gap-3.5 ${isComp ? "bg-green-500/[0.03]" : isRej ? "bg-red-500/[0.03]" : ""}`}>
                        <AgentAvatar name={entry.agentName} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold" style={{ color: hex }}>{entry.agentName}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isComp ? "bg-green-500/15 text-green-400" : isRej ? "bg-red-500/15 text-red-400" : "bg-secondary text-muted-foreground"}`}>
                              {isComp && <CheckCircle2 className="w-2.5 h-2.5 inline mr-0.5" />}
                              {isRej && <XCircle className="w-2.5 h-2.5 inline mr-0.5" />}
                              {formatActionLabel(entry.action)}
                            </span>
                            <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{getRelativeTime(entry.timestamp)}</span>
                          </div>
                          {entry.details && <p className="text-xs text-foreground/60 mt-1 leading-relaxed line-clamp-3">{entry.details}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

// Small helper component to avoid repeating section header markup
function SectionHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {count !== undefined && <span className="text-[11px] text-muted-foreground">{count} item{count !== 1 ? "s" : ""}</span>}
    </div>
  );
}
