import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import {
  Brain, ChevronLeft, Sparkles, Flag, ChevronDown, ChevronRight,
  Clock, MessageSquare, BookOpen, Tag, Zap, CheckCircle, XCircle
} from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

const MEMORY_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  api_quirk:       { label: "API Quirk",       color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  user_preference: { label: "User Pref",        color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  pattern:         { label: "Pattern",           color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  decision:        { label: "Decision",          color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  env_fact:        { label: "Env Fact",          color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
  workflow:        { label: "Workflow",           color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" },
  failure:         { label: "Failure",            color: "bg-red-500/15 text-red-400 border-red-500/30" },
  shortcut:        { label: "Shortcut",           color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
};

const MEMORY_TYPES = Object.keys(MEMORY_TYPE_LABELS);

type TabKey = "memories" | "history" | "soul";

const VALID_AGENTS: AgentName[] = ["Kaze", "Scout", "Forge", "Ghost"];

export default function AgentMemoryDetail() {
  const { agentName } = useParams<{ agentName: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("memories");
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(MEMORY_TYPES));
  const [expandedHandoffs, setExpandedHandoffs] = useState<Set<string>>(new Set());

  const agent = (agentName as AgentName) ?? "Kaze";
  const agentColor = AGENT_CONFIG[agent]?.color ?? "#888";

  const memories = useQuery(api.agentMemory.listAll, {
    agentName: VALID_AGENTS.includes(agent) ? agent : undefined,
    status: "active",
    limit: 200,
  }) ?? [];

  const handoffs = useQuery(api.sessionHandoffs.listForAgent, {
    agentName: VALID_AGENTS.includes(agent) ? agent : "Kaze",
    limit: 20,
  }) ?? [];

  const soulVersions = useQuery(
    api.soulDistillation.listVersions,
    VALID_AGENTS.includes(agent) ? { agentName: agent, limit: 10 } : "skip"
  ) ?? [];

  const endorse = useMutation(api.agentMemory.endorse);
  const flag = useMutation(api.agentMemory.flagMemory);

  const handleEndorse = (id: Id<"agentMemory">) => endorse({ id, userId: "human" });
  const handleFlag = (id: Id<"agentMemory">) => flag({ id, userId: "human" });

  const toggleType = (type: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const toggleHandoff = (id: string) => {
    setExpandedHandoffs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Group memories by type
  const byType: Record<string, typeof memories> = {};
  for (const type of MEMORY_TYPES) {
    const group = memories.filter((m) => m.memoryType === type);
    if (group.length > 0) byType[type] = group;
  }

  if (!VALID_AGENTS.includes(agent)) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <p className="text-muted-foreground">Invalid agent name.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/memory")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Memory Bank
          </button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" style={{ color: agentColor }} />
            <h1 className="text-lg font-bold" style={{ color: agentColor }}>{agent}</h1>
            <span className="text-sm text-muted-foreground">Memory Detail</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {(["memories", "history", "soul"] as TabKey[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "memories" ? "Active Memories" : t === "history" ? "Session History" : "SOUL Versions"}
            </button>
          ))}
        </div>

        {/* Tab: Active Memories */}
        {tab === "memories" && (
          <div className="space-y-3">
            {Object.keys(byType).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Brain className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">No active memories for {agent} yet.</p>
              </div>
            ) : (
              Object.entries(byType).map(([type, mems]) => {
                const meta = MEMORY_TYPE_LABELS[type];
                const isOpen = expandedTypes.has(type);
                return (
                  <div key={type} className="bg-card border border-border rounded-xl overflow-hidden">
                    {/* Accordion header */}
                    <button
                      onClick={() => toggleType(type)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{mems.length} memories</span>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>

                    {/* Accordion body */}
                    {isOpen && (
                      <div className="border-t border-border divide-y divide-border">
                        {mems.map((mem) => (
                          <div key={mem._id} className="px-4 py-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-foreground leading-snug">{mem.title}</p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                                {getRelativeTime(mem.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{mem.body}</p>
                            {mem.evidence && (
                              <p className="text-xs text-muted-foreground/60 italic border-l-2 border-border pl-2">
                                {mem.evidence}
                              </p>
                            )}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {mem.tags.slice(0, 4).map((tag) => (
                                  <span key={tag} className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-accent/50 text-muted-foreground">
                                    <Tag className="w-2.5 h-2.5" />{tag}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="flex items-center gap-1">
                                  <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-primary"
                                      style={{ width: `${Math.round(mem.importanceScore * 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-muted-foreground">
                                    {Math.round(mem.importanceScore * 100)}%
                                  </span>
                                </div>
                                {!mem.humanEndorsed && (
                                  <button
                                    onClick={() => handleEndorse(mem._id)}
                                    className="flex items-center gap-1 text-xs text-emerald-400 hover:bg-emerald-400/10 px-2 py-0.5 rounded transition-colors"
                                  >
                                    <Sparkles className="w-3 h-3" /> Endorse
                                  </button>
                                )}
                                {!mem.humanFlagged && (
                                  <button
                                    onClick={() => handleFlag(mem._id)}
                                    className="flex items-center gap-1 text-xs text-red-400 hover:bg-red-400/10 px-2 py-0.5 rounded transition-colors"
                                  >
                                    <Flag className="w-3 h-3" /> Flag
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab: Session History */}
        {tab === "history" && (
          <div className="space-y-3">
            {handoffs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Clock className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">No session handoffs yet.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Agents write handoffs at the end of each session.
                </p>
              </div>
            ) : (
              <div className="relative pl-6">
                {/* Timeline line */}
                <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />
                {handoffs.map((h) => {
                  const isExpanded = expandedHandoffs.has(h._id);
                  const duration = h.sessionEnd - h.sessionStart;
                  const durationMin = Math.round(duration / 60000);
                  return (
                    <div key={h._id} className="relative mb-4">
                      {/* Timeline dot */}
                      <div
                        className="absolute -left-3.5 top-3.5 w-2.5 h-2.5 rounded-full border-2 border-background"
                        style={{ backgroundColor: agentColor }}
                      />

                      <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleHandoff(h._id)}
                          className="w-full flex items-start justify-between gap-3 p-4 hover:bg-accent/20 transition-colors text-left"
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-2">{h.sessionSummary}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                              <span>{getRelativeTime(h.createdAt)}</span>
                              {durationMin > 0 && <span>{durationMin} min session</span>}
                              {h.tasksCompleted.length > 0 && (
                                <span>{h.tasksCompleted.length} task{h.tasksCompleted.length !== 1 ? "s" : ""} done</span>
                              )}
                              {h.newMemoriesCreated.length > 0 && (
                                <span>{h.newMemoriesCreated.length} memor{h.newMemoriesCreated.length !== 1 ? "ies" : "y"} written</span>
                              )}
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="border-t border-border px-4 py-3 space-y-3">
                            {h.taskTitles.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1.5">Completed Tasks</p>
                                <ul className="space-y-1">
                                  {h.taskTitles.map((title, i) => (
                                    <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                                      <span className="text-emerald-400 mt-0.5">✓</span> {title}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {h.openQuestions && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" /> Open Questions
                                </p>
                                <p className="text-xs text-foreground bg-yellow-500/10 border border-yellow-500/20 rounded p-2 leading-relaxed">
                                  {h.openQuestions}
                                </p>
                              </div>
                            )}
                            {h.nextSessionHint && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" /> Next Session Hint
                                </p>
                                <p className="text-xs text-foreground bg-primary/5 border border-primary/20 rounded p-2 leading-relaxed">
                                  {h.nextSessionHint}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: SOUL Versions */}
        {tab === "soul" && (
          <div className="space-y-3">
            {soulVersions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">No SOUL versions yet.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Distillation runs every Sunday at 2am UTC, or trigger it manually via the soul API.
                </p>
              </div>
            ) : (
              soulVersions.map((v) => (
                <div
                  key={v._id}
                  className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">v{v.version}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        v.status === "pending_review"
                          ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                          : v.status === "approved"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : v.status === "auto_applied"
                          ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                          : "bg-red-500/15 text-red-400 border-red-500/30"
                      }`}>
                        {v.status === "pending_review" ? "Pending Review" :
                          v.status === "approved" ? "Approved" :
                          v.status === "auto_applied" ? "Auto Applied" : "Rejected"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 whitespace-pre-line">
                      {v.changeLog}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" /> {v.memoriesDistilled.length} memories
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {getRelativeTime(v.distilledAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/soul/review/${v._id}`)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      v.status === "pending_review"
                        ? "bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 border border-yellow-500/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    {v.status === "pending_review" ? (
                      <><CheckCircle className="w-3 h-3" /> Review</>
                    ) : (
                      <><BookOpen className="w-3 h-3" /> View</>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
