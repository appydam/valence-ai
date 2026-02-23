import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import { Brain, Sparkles, CheckCircle, Flag, AlertCircle, ChevronRight, Tag, User } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

const MEMORY_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  api_quirk:        { label: "API Quirk",        color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  user_preference:  { label: "User Pref",         color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  pattern:          { label: "Pattern",            color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  decision:         { label: "Decision",           color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  env_fact:         { label: "Env Fact",           color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
  workflow:         { label: "Workflow",            color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" },
  failure:          { label: "Failure",             color: "bg-red-500/15 text-red-400 border-red-500/30" },
  shortcut:         { label: "Shortcut",            color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
};

const STATUS_FILTERS = ["active", "superseded", "archived", "flagged"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const TYPE_FILTERS = [
  "all", "api_quirk", "user_preference", "pattern",
  "decision", "env_fact", "workflow", "failure", "shortcut",
] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number];

const AGENTS: AgentName[] = ["Kaze", "Scout", "Forge", "Ghost"];

export default function MemoryBank() {
  const navigate = useNavigate();
  const [agentFilter, setAgentFilter] = useState<AgentName | "all">("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  const memories = useQuery(api.agentMemory.listAll, {
    agentName: agentFilter === "all" ? undefined : agentFilter,
    memoryType: typeFilter === "all" ? undefined : (typeFilter as any),
    status: statusFilter,
    limit: 100,
  }) ?? [];

  const stats = useQuery(api.agentMemory.getStats) ?? {
    totalActive: 0,
    pendingEndorsement: 0,
    writtenThisWeek: 0,
    byAgent: { Kaze: 0, Scout: 0, Forge: 0, Ghost: 0 },
  };

  const endorse = useMutation(api.agentMemory.endorse);
  const flag = useMutation(api.agentMemory.flagMemory);

  const handleEndorse = async (id: Id<"agentMemory">) => {
    await endorse({ id, userId: "human" });
  };

  const handleFlag = async (id: Id<"agentMemory">) => {
    await flag({ id, userId: "human" });
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Memory Bank</h1>
              <p className="text-sm text-muted-foreground">Agent learnings that persist across sessions</p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-2xl font-bold text-foreground">{stats.totalActive}</div>
            <div className="text-xs text-muted-foreground mt-1">Active Memories</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.pendingEndorsement}</div>
            <div className="text-xs text-muted-foreground mt-1">Pending Endorsement</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-2xl font-bold text-emerald-400">{stats.writtenThisWeek}</div>
            <div className="text-xs text-muted-foreground mt-1">Written This Week</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-2">By Agent</div>
            <div className="flex flex-col gap-1">
              {AGENTS.map((a) => (
                <div key={a} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: AGENT_CONFIG[a].color }}>{a}</span>
                  <span className="text-xs font-medium text-foreground">{stats.byAgent[a]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAgentFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              agentFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All Agents
          </button>
          {AGENTS.map((a) => (
            <button
              key={a}
              onClick={() => setAgentFilter(a)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                agentFilter === a
                  ? "border-transparent text-white"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
              style={agentFilter === a ? { backgroundColor: AGENT_CONFIG[a].color } : {}}
            >
              {a} ({stats.byAgent[a]})
            </button>
          ))}
          {agentFilter !== "all" && (
            <button
              onClick={() => navigate(`/memory/${agentFilter}`)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              Full Detail <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Type filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  typeFilter === t
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                {t === "all" ? "All Types" : MEMORY_TYPE_LABELS[t]?.label ?? t}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="ml-auto flex items-center gap-1.5">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-xs capitalize transition-colors ${
                  statusFilter === s
                    ? "bg-accent text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Memory feed */}
        {memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Brain className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No memories yet.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Agents will write memories automatically as they work.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {memories.map((mem) => {
              const typeMeta = MEMORY_TYPE_LABELS[mem.memoryType] ?? { label: mem.memoryType, color: "bg-muted text-muted-foreground border-border" };
              const agentColor = AGENT_CONFIG[mem.agentName as AgentName]?.color ?? "#888";
              return (
                <div
                  key={mem._id}
                  className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-border/80 transition-colors"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${typeMeta.color}`}>
                        {typeMeta.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span style={{ color: agentColor }}>{mem.agentName}</span>
                      </span>
                      {mem.humanEndorsed && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle className="w-3 h-3" /> Endorsed
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {getRelativeTime(mem.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="text-sm font-medium text-foreground leading-snug">{mem.title}</p>

                  {/* Body */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{mem.body}</p>

                  {/* Evidence */}
                  {mem.evidence && (
                    <p className="text-xs text-muted-foreground/70 italic border-l-2 border-border pl-2 line-clamp-2">
                      {mem.evidence}
                    </p>
                  )}

                  {/* Bottom row */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {mem.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-accent/50 text-muted-foreground">
                          <Tag className="w-2.5 h-2.5" />{tag}
                        </span>
                      ))}
                    </div>

                    {/* Importance + actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Importance bar */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.round(mem.importanceScore * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {Math.round(mem.importanceScore * 100)}%
                        </span>
                      </div>

                      {/* Confirmations */}
                      {mem.confirmations > 0 && (
                        <span className="text-[10px] text-emerald-400">
                          +{mem.confirmations} confirmed
                        </span>
                      )}

                      {/* Use count */}
                      {mem.useCount > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          used {mem.useCount}×
                        </span>
                      )}

                      {/* Actions */}
                      {mem.status === "active" && (
                        <div className="flex items-center gap-1">
                          {!mem.humanEndorsed && (
                            <button
                              onClick={() => handleEndorse(mem._id)}
                              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                              title="Endorse — mark this memory as verified"
                            >
                              <Sparkles className="w-3 h-3" />
                              Endorse
                            </button>
                          )}
                          {!mem.humanFlagged && (
                            <button
                              onClick={() => handleFlag(mem._id)}
                              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-red-400 hover:bg-red-400/10 transition-colors"
                              title="Flag — mark this memory as wrong"
                            >
                              <Flag className="w-3 h-3" />
                              Flag
                            </button>
                          )}
                        </div>
                      )}

                      {mem.status === "flagged" && (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <AlertCircle className="w-3 h-3" /> Flagged
                        </span>
                      )}

                      {mem.status === "superseded" && (
                        <span className="text-xs text-muted-foreground/60 italic">superseded</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
