import { useMemo, useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import {
  Activity,
  MessageSquare,
  Package,
  Plug,
  Brain,
  LogOut,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Filter,
  ChevronDown,
} from "lucide-react";

// ── Event Types ────────────────────────────────────────────────

type EventType =
  | "activity"
  | "comment"
  | "integration"
  | "handoff"
  | "memory";

interface FeedEvent {
  id: string;
  type: EventType;
  timestamp: number;
  agentName?: string;
  title: string;
  detail?: string;
  meta?: Record<string, string>;
}

const EVENT_CONFIG: Record<EventType, { icon: typeof Activity; colorClass: string; label: string }> = {
  activity: { icon: Activity, colorClass: "text-blue-400", label: "Activity" },
  comment: { icon: MessageSquare, colorClass: "text-green-400", label: "Comment" },
  integration: { icon: Plug, colorClass: "text-purple-400", label: "Integration" },
  handoff: { icon: LogOut, colorClass: "text-gray-400", label: "Handoff" },
  memory: { icon: Brain, colorClass: "text-amber-400", label: "Memory" },
};

// ── Component ─────────────────────────────────────────────────

export function LiveOpsFeed({ missionFilter }: { missionFilter?: string }) {
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [agentFilter, setAgentFilter] = useState<string | "all">("all");
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  // Data sources — all real-time via Convex subscriptions
  const activity = useQuery(api.activityFns.list, { limit: 50 }) ?? [];
  const comments = useQuery(api.comments.recent, { limit: 30 }) ?? [];
  const integrationActivity = useQuery(api.integrationActivity.recent, { limit: 30 }) ?? [];
  const handoffs = useQuery(api.sessionHandoffs.recent, { limit: 10 }) ?? [];
  const memories = useQuery(api.agentMemory.recent, { limit: 15 }) ?? [];

  // Merge all events into a unified timeline
  const events: FeedEvent[] = useMemo(() => {
    const merged: FeedEvent[] = [];

    // Activity events
    for (const a of activity) {
      const actionLabel = a.action
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
      merged.push({
        id: `act-${a._id}`,
        type: "activity",
        timestamp: a.timestamp,
        agentName: a.agentName,
        title: actionLabel,
        detail: a.details,
        meta: a.taskId ? { taskId: a.taskId } : undefined,
      });
    }

    // Comments
    for (const c of comments) {
      merged.push({
        id: `cmt-${c._id}`,
        type: "comment",
        timestamp: c.createdAt,
        agentName: c.author,
        title: `${c.author} commented`,
        detail: c.content.length > 120 ? c.content.slice(0, 120) + "..." : c.content,
        meta: c.mentions?.length ? { mentions: c.mentions.join(", ") } : undefined,
      });
    }

    // Integration executions
    for (const ie of integrationActivity) {
      const statusIcon = ie.status === "success" ? "✓" : "✗";
      merged.push({
        id: `int-${ie._id}`,
        type: "integration",
        timestamp: ie.timestamp,
        agentName: ie.agentName || undefined,
        title: `${ie.integrationType}: ${ie.toolName} ${statusIcon}`,
        detail: ie.errorMessage || undefined,
        meta: { status: ie.status },
      });
    }

    // Session handoffs
    for (const h of handoffs) {
      merged.push({
        id: `hnd-${h._id}`,
        type: "handoff",
        timestamp: h.createdAt,
        agentName: h.agentName,
        title: `${h.agentName} ended session`,
        detail: `${h.tasksCompleted?.length ?? 0} tasks completed. ${h.openQuestions ? "Open: " + h.openQuestions.slice(0, 80) : ""}`,
      });
    }

    // Memories
    for (const m of memories) {
      merged.push({
        id: `mem-${m._id}`,
        type: "memory",
        timestamp: m.createdAt,
        agentName: m.agentName,
        title: `${m.agentName} learned: ${m.title}`,
        detail: m.body.length > 100 ? m.body.slice(0, 100) + "..." : m.body,
        meta: { memoryType: m.memoryType },
      });
    }

    // Sort by timestamp descending
    merged.sort((a, b) => b.timestamp - a.timestamp);

    // Apply filters
    let filtered = merged;
    if (typeFilter !== "all") {
      filtered = filtered.filter((e) => e.type === typeFilter);
    }
    if (agentFilter !== "all") {
      filtered = filtered.filter((e) => e.agentName === agentFilter);
    }

    return filtered.slice(0, 100);
  }, [activity, comments, integrationActivity, handoffs, memories, typeFilter, agentFilter]);

  // Auto-scroll to top when new events arrive
  useEffect(() => {
    if (isAutoScroll && events.length > prevCountRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    prevCountRef.current = events.length;
  }, [events.length, isAutoScroll]);

  // Detect manual scroll to pause auto-scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    setIsAutoScroll(scrollRef.current.scrollTop < 10);
  };

  const agents = Object.keys(AGENT_CONFIG) as AgentName[];

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-1 pb-3 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        {/* Type filters */}
        <button
          onClick={() => setTypeFilter("all")}
          className={cn(
            "text-[11px] px-2 py-0.5 rounded-full transition-colors",
            typeFilter === "all"
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </button>
        {(Object.keys(EVENT_CONFIG) as EventType[]).map((type) => {
          const cfg = EVENT_CONFIG[type];
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(type === typeFilter ? "all" : type)}
              className={cn(
                "text-[11px] px-2 py-0.5 rounded-full transition-colors",
                typeFilter === type
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {cfg.label}
            </button>
          );
        })}
        <div className="w-px h-4 bg-border mx-1" />
        {/* Agent filters */}
        {agents.map((name) => (
          <button
            key={name}
            onClick={() => setAgentFilter(name === agentFilter ? "all" : name)}
            className={cn(
              "text-[11px] px-1.5 py-0.5 rounded-full transition-colors",
              agentFilter === name
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {AGENT_CONFIG[name].emoji}
          </button>
        ))}
      </div>

      {/* Event stream */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-0"
      >
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Activity className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Events will appear here as agents work</p>
          </div>
        )}
        {events.map((event) => {
          const cfg = EVENT_CONFIG[event.type];
          const Icon = cfg.icon;
          const agentConfig = event.agentName
            ? AGENT_CONFIG[event.agentName as AgentName]
            : null;

          return (
            <div
              key={event.id}
              className="flex items-start gap-3 group hover:bg-accent/30 px-2 py-2 rounded-md transition-colors"
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center pt-0.5">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                  event.type === "integration" && event.meta?.status === "error"
                    ? "bg-red-500/10"
                    : "bg-accent/50"
                )}>
                  <Icon className={cn("w-3.5 h-3.5", cfg.colorClass)} />
                </div>
                <div className="w-px flex-1 bg-border mt-1 min-h-[8px] group-last:hidden" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {agentConfig && (
                    <span className="text-sm">{agentConfig.emoji}</span>
                  )}
                  <span className="text-sm font-medium text-foreground truncate">
                    {event.title}
                  </span>
                  {event.meta?.memoryType && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                      {event.meta.memoryType}
                    </span>
                  )}
                  {event.meta?.status === "error" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                      error
                    </span>
                  )}
                  <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                    {getRelativeTime(event.timestamp)}
                  </span>
                </div>
                {event.detail && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {event.detail}
                  </p>
                )}
                {event.meta?.mentions && (
                  <p className="text-[10px] text-primary/70 mt-0.5">
                    @{event.meta.mentions}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Auto-scroll indicator */}
      {!isAutoScroll && (
        <button
          onClick={() => {
            setIsAutoScroll(true);
            scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium shadow-lg hover:bg-primary/90 transition-colors"
        >
          <ChevronDown className="w-3 h-3 rotate-180" />
          Jump to latest
        </button>
      )}
    </div>
  );
}
