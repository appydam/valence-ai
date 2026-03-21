import { useState } from "react";
import {
  Brain,
  Wrench,
  Lightbulb,
  ArrowRightLeft,
  Package,
  AlertTriangle,
  CheckCircle,
  Plug,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface StreamItem {
  id: string;
  timestamp: number;
  type:
    | "thinking"
    | "tool_call"
    | "tool_result"
    | "decision"
    | "handoff"
    | "error"
    | "checkpoint"
    | "api_call"
    | "deliverable";
  agentName?: string;
  content: string;
  metadata?: any;
  integrationName?: string;
  toolName?: string;
  status?: "calling" | "success" | "error";
  duration?: number;
  deliverableName?: string;
  deliverableType?: string;
}

interface StreamCardProps {
  item: StreamItem;
  accentColor: string;
  isLatest: boolean;
  onRetry?: (text: string) => void;
}

function getIntegrationBadge(name?: string) {
  switch (name) {
    case "google-ads":
      return { label: "G", bg: "bg-blue-500/15", text: "text-blue-400" };
    case "facebook-ads":
      return { label: "M", bg: "bg-indigo-500/15", text: "text-indigo-400" };
    case "google-analytics":
      return { label: "GA", bg: "bg-orange-500/15", text: "text-orange-400" };
    default:
      return null;
  }
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function DeliverableContent({ content, type }: { content: string; type?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (type === "image") {
    return (
      <img
        src={content}
        alt="Deliverable"
        className="mt-2 rounded-lg max-w-[300px] max-h-[200px] object-cover border border-border/30"
      />
    );
  }

  let parsed: any = null;
  try {
    parsed = JSON.parse(content);
  } catch {
    // not JSON
  }

  if (parsed && typeof parsed === "object") {
    const arrayKey = Object.keys(parsed).find(
      (k) => Array.isArray(parsed[k]) && parsed[k].length > 0
    );
    if (arrayKey) {
      const rows = parsed[arrayKey].slice(0, 5);
      const cols = Object.keys(rows[0] ?? {}).slice(0, 4);
      return (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border/30">
                {cols.map((col) => (
                  <th
                    key={col}
                    className="px-2 py-1 text-left text-muted-foreground/60 font-medium"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, i: number) => (
                <tr key={i} className="border-b border-border/10">
                  {cols.map((col) => (
                    <td key={col} className="px-2 py-1 text-foreground/70">
                      {String(row[col] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {parsed[arrayKey].length > 5 && (
            <p className="text-[10px] text-muted-foreground/40 mt-1 px-2">
              +{parsed[arrayKey].length - 5} more rows
            </p>
          )}
        </div>
      );
    }
  }

  const preview = content.length > 200 && !expanded ? content.slice(0, 200) + "..." : content;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mt-2">
      <pre className="text-[11px] text-foreground/70 whitespace-pre-wrap font-mono bg-background/50 rounded-lg px-3 py-2 border border-border/20">
        {preview}
      </pre>
      <div className="flex items-center gap-2 mt-1.5">
        {content.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] text-muted-foreground/50 hover:text-foreground/70 transition-colors"
          >
            {expanded ? "Show less" : "View Full"}
          </button>
        )}
        <button
          onClick={handleCopy}
          className="text-[10px] text-muted-foreground/50 hover:text-foreground/70 transition-colors flex items-center gap-1"
        >
          {copied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export function StreamCard({ item, accentColor, isLatest, onRetry }: StreamCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = item.content.length > 150;

  const renderCard = () => {
    switch (item.type) {
      case "thinking": {
        return (
          <div className="flex items-start gap-3">
            {/* Timeline dot */}
            <div className="flex flex-col items-center shrink-0 pt-0.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center",
                  isLatest ? "animate-pulse" : ""
                )}
                style={{ background: "rgba(59,130,246,0.12)" }}
              >
                <Brain className="w-3.5 h-3.5 text-blue-400" />
              </div>
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0 rounded-xl px-4 py-3 border-l-2 border-blue-500/50 bg-blue-500/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-blue-400/80">
                  Thinking
                </span>
                {item.agentName && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/40 text-muted-foreground/70">
                    {item.agentName}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground/30 ml-auto">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
              <p
                className={cn(
                  "text-xs text-foreground/80 leading-relaxed",
                  !expanded && isLong ? "line-clamp-3" : ""
                )}
              >
                {item.content}
              </p>
              {isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-foreground/70 mt-1 transition-colors"
                >
                  {expanded ? (
                    <ChevronDown className="w-2.5 h-2.5" />
                  ) : (
                    <ChevronRight className="w-2.5 h-2.5" />
                  )}
                  {expanded ? "Less" : "More"}
                </button>
              )}
            </div>
          </div>
        );
      }

      case "tool_call":
      case "api_call": {
        const badge = getIntegrationBadge(item.integrationName);
        const statusColor =
          item.status === "success"
            ? "border-green-500/50 bg-green-500/5"
            : item.status === "error"
              ? "border-red-500/50 bg-red-500/5"
              : "border-blue-500/50 bg-blue-500/5";
        const borderColor =
          item.status === "success"
            ? "border-green-500/50"
            : item.status === "error"
              ? "border-red-500/50"
              : "border-blue-500/50";

        return (
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0 pt-0.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center",
                  item.status === "calling" && isLatest ? "animate-spin" : ""
                )}
                style={{
                  background:
                    item.status === "success"
                      ? "rgba(34,197,94,0.12)"
                      : item.status === "error"
                        ? "rgba(239,68,68,0.12)"
                        : "rgba(59,130,246,0.12)",
                }}
              >
                {badge ? (
                  <span className={cn("text-[10px] font-bold", badge.text)}>{badge.label}</span>
                ) : item.status === "calling" ? (
                  <Loader2 className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Wrench className="w-3.5 h-3.5 text-yellow-500" />
                )}
              </div>
            </div>
            <div className={cn("flex-1 min-w-0 rounded-xl px-4 py-3 border-l-2", statusColor, borderColor)}>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {item.toolName && (
                  <span className="text-xs font-semibold text-foreground/90">{item.toolName}</span>
                )}
                {item.integrationName && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/40 text-muted-foreground/60">
                    {item.integrationName}
                  </span>
                )}
                {item.status === "calling" && (
                  <span className="flex items-center gap-1 text-[10px] text-blue-400">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> Calling...
                  </span>
                )}
                {item.status === "success" && (
                  <span className="flex items-center gap-1 text-[10px] text-green-500">
                    <CheckCircle className="w-2.5 h-2.5" /> Success
                  </span>
                )}
                {item.status === "error" && (
                  <span className="flex items-center gap-1 text-[10px] text-red-400">
                    <AlertTriangle className="w-2.5 h-2.5" /> Error
                  </span>
                )}
                {item.duration != null && (
                  <span className="text-[10px] text-muted-foreground/40">{item.duration}ms</span>
                )}
                <span className="text-[10px] text-muted-foreground/30 ml-auto">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
              {item.content && (
                <div>
                  <p
                    className={cn(
                      "text-[11px] text-foreground/60 leading-relaxed",
                      !expanded && item.content.length > 200 ? "line-clamp-2" : ""
                    )}
                  >
                    {item.content}
                  </p>
                  {item.content.length > 200 && (
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="text-[10px] text-muted-foreground/50 hover:text-foreground/70 mt-1 transition-colors"
                    >
                      {expanded ? "Collapse" : "Show response"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      }

      case "tool_result": {
        return (
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0 pt-0.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.12)" }}
              >
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              </div>
            </div>
            <div className="flex-1 min-w-0 rounded-xl px-4 py-3 border-l-2 border-green-500/50 bg-green-500/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-green-500/80">
                  Result
                </span>
                {item.agentName && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/40 text-muted-foreground/70">
                    {item.agentName}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground/30 ml-auto">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
              <p
                className={cn(
                  "text-[11px] text-foreground/70 leading-relaxed",
                  !expanded && isLong ? "line-clamp-3" : ""
                )}
              >
                {item.content}
              </p>
              {isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-[10px] text-muted-foreground/50 hover:text-foreground/70 mt-1 transition-colors"
                >
                  {expanded ? "Less" : "More"}
                </button>
              )}
            </div>
          </div>
        );
      }

      case "decision": {
        return (
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0 pt-0.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "rgba(168,85,247,0.12)" }}
              >
                <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0 rounded-xl px-4 py-3 border-l-2 border-purple-500/50 bg-purple-500/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-purple-400/80">
                  Decision
                </span>
                {item.agentName && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/40 text-muted-foreground/70">
                    {item.agentName}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground/30 ml-auto">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
              <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                {item.content}
              </p>
            </div>
          </div>
        );
      }

      case "handoff": {
        return (
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0 pt-0.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center animate-pulse"
                style={{ background: "rgba(34,211,238,0.12)" }}
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0 rounded-xl px-4 py-3 border-l-2 border-cyan-500/50 bg-cyan-500/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-cyan-400/80">
                  Handoff
                </span>
                <span className="text-[10px] text-muted-foreground/30 ml-auto">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">{item.content}</p>
            </div>
          </div>
        );
      }

      case "deliverable": {
        return (
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0 pt-0.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: `${accentColor}1A` }}
              >
                <Package className="w-3.5 h-3.5" style={{ color: accentColor }} />
              </div>
            </div>
            <div
              className="flex-1 min-w-0 rounded-xl px-4 py-3 border-l-2"
              style={{ borderColor: `${accentColor}80`, background: `${accentColor}08` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: `${accentColor}CC` }}
                >
                  Deliverable
                </span>
                {item.deliverableName && (
                  <span className="text-xs font-semibold text-foreground/90">
                    {item.deliverableName}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground/30 ml-auto">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
              <DeliverableContent content={item.content} type={item.deliverableType} />
            </div>
          </div>
        );
      }

      case "error": {
        return (
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0 pt-0.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.12)" }}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0 rounded-xl px-4 py-3 border-l-2 border-red-500/50 bg-red-500/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-red-400/80">
                  Error
                </span>
                {item.agentName && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/40 text-muted-foreground/70">
                    {item.agentName}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground/30 ml-auto">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
              <p className="text-xs text-red-400/90 leading-relaxed">{item.content}</p>
              {onRetry && (
                <button
                  onClick={() => onRetry(`Retry: ${item.content.slice(0, 80)}`)}
                  className="mt-2 text-[10px] text-red-400 hover:text-red-300 underline transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        );
      }

      case "checkpoint": {
        return (
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0 pt-0.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.12)" }}
              >
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              </div>
            </div>
            <div className="flex-1 min-w-0 rounded-xl px-4 py-3 border-l-2 border-green-500/50 bg-green-500/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-green-500/80">
                  Checkpoint
                </span>
                <span className="text-[10px] text-muted-foreground/30 ml-auto">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">{item.content}</p>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "transition-all duration-300",
        isLatest ? "opacity-100" : "opacity-90"
      )}
      style={{ animation: "fadeIn 0.3s ease-out" }}
    >
      {renderCard()}
    </div>
  );
}
