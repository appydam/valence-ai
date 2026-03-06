import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { NewTaskModal } from "@/components/NewTaskModal";
import { NewMissionModal } from "@/components/NewMissionModal";
import { SquadView } from "@/components/SquadView";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { TaskStatus, AgentName, TaskPriority } from "@/types/mission";
import { Plus, List, FolderPlus, Zap, Swords, LayoutGrid, GitBranch, ChevronRight, ArrowRight, FileText } from "lucide-react";
import { AGENT_CONFIG } from "@/types/mission";
import { Link, useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";

const columns: { key: TaskStatus; label: string }[] = [
  { key: "inbox", label: "Inbox" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "in_review", label: "In Review" },
  { key: "done", label: "Done" },
];

const Board = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const missionFromUrl = searchParams.get("mission");
  const [selectedMissionId, setSelectedMissionId] = useState<Id<"missions"> | null>(null);
  const missions = useQuery(api.missions.list, {}) ?? [];
  const [wakingAgents, setWakingAgents] = useState(false);
  const [view, setView] = useState<"board" | "squad" | "plan">("board");

  // Fix orphaned tasks on first load
  const fixOrphaned = useMutation(api.tasks.fixOrphanedTasks);
  const fixedRef = useRef(false);
  useEffect(() => {
    if (!fixedRef.current) {
      fixedRef.current = true;
      fixOrphaned();
    }
  }, [fixOrphaned]);

  // Sync URL param to state on mount/change
  useEffect(() => {
    if (missionFromUrl) {
      setSelectedMissionId(missionFromUrl as Id<"missions">);
    }
  }, [missionFromUrl]);

  // Default to most recent mission (first in desc-ordered list)
  const missionIdToUse = selectedMissionId || missions[0]?._id || undefined;
  const tasks = useQuery(api.tasks.listByMission, { missionId: missionIdToUse }) ?? [];

  const createTask = useMutation(api.tasks.create);

  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showNewMission, setShowNewMission] = useState(false);

  const selectedTask = tasks.find(t => t._id === selectedTaskId) ?? null;

  const handleCreate = async (data: { title: string; description: string; priority: TaskPriority; assignee?: AgentName; tags: string[]; missionId?: string; dependsOn?: Id<"tasks">[] }) => {
    const result = await createTask({
      title: data.title,
      description: data.description,
      priority: data.priority,
      assignee: data.assignee,
      creator: "Human",
      tags: data.tags,
      ...(data.missionId ? { missionId: data.missionId as Id<"missions"> } : {}),
      ...(user?.id ? { requiredUserId: user.id } : {}),
      ...(data.dependsOn ? { dependsOn: data.dependsOn } : {}),
    });
    const targetMission = data.missionId || result?.missionId;
    if (targetMission) {
      setSelectedMissionId(targetMission as Id<"missions">);
    }
  };

  const handleWakeAgents = async () => {
    setWakingAgents(true);
    try {
      const convexSiteUrl = import.meta.env.VITE_CONVEX_URL.replace('.convex.cloud', '.convex.site');
      const response = await fetch(`${convexSiteUrl}/api/agents/wake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Agents Notified",
          description: data.agents.length > 0
            ? `${data.agents.length} agent(s) with pending tasks`
            : "No agents with pending tasks",
        });
      } else {
        toast({
          title: "Wake Issue",
          description: data.error || data.message || "Could not wake agents",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Wake Failed",
        description: "Could not wake agents. Ensure agent-wakeup-server is running.",
        variant: "destructive",
      });
    } finally {
      setWakingAgents(false);
    }
  };

  // Squad mode: full-bleed layout, terrarium fills all available height
  if (view === "squad") {
    return (
      <DashboardLayout fullBleed>
        <div className="h-full flex flex-col">
          {/* Slim header strip */}
          <div
            className="shrink-0 flex items-center justify-between px-4 py-2 border-b"
            style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(10,26,15,0.95)" }}
          >
            <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }}>
              <button
                onClick={() => setView("board")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Board
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <Swords className="w-3.5 h-3.5" />
                Squad Ops
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Live</span>
            </div>
          </div>

          {/* Terrarium — fills remaining height */}
          <div className="flex-1 min-h-0">
            <SquadView onTaskSelect={setSelectedTaskId} />
          </div>
        </div>

        {/* Task detail panel */}
        {selectedTask && (
          <div className="fixed inset-y-0 right-0 z-50 w-[480px] shadow-2xl animate-slide-in-right">
            <TaskDetailPanel
              task={selectedTask as any}
              onClose={() => setSelectedTaskId(null)}
            />
          </div>
        )}
      </DashboardLayout>
    );
  }

  // Board mode: normal layout with kanban
  return (
    <DashboardLayout>
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="shrink-0">
            <h1 className="text-2xl font-bold text-foreground">Mission Board</h1>
            <p className="text-sm text-muted-foreground mt-1">Track and manage squad tasks</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* View toggle */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-secondary border border-border">
              <button
                onClick={() => setView("board")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "board" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Board
              </button>
              <button
                onClick={() => setView("plan")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "plan" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                Plan
              </button>
              <button
                onClick={() => setView("squad")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors ${view === "squad" ? "bg-background text-foreground shadow-sm" : ""}`}
              >
                <Swords className="w-3.5 h-3.5" />
                Squad Ops
              </button>
            </div>

            <button
              onClick={handleWakeAgents}
              disabled={wakingAgents}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Zap className={`w-3.5 h-3.5 ${wakingAgents ? 'animate-pulse' : ''}`} />
              {wakingAgents ? 'Waking...' : 'Wake Agents'}
            </button>
            <button onClick={() => setShowNewMission(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-surface-hover transition-colors text-foreground">
              <FolderPlus className="w-3.5 h-3.5" /> New Mission
            </button>
            <button onClick={() => setShowNewTask(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/80 transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Task
            </button>
          </div>
        </div>

        {/* Mission Selector */}
        {missions.length > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border flex-wrap">
            <label className="text-xs font-medium text-foreground shrink-0">Mission:</label>
            <select
              value={selectedMissionId || missions[0]?._id || ""}
              onChange={(e) => setSelectedMissionId(e.target.value ? e.target.value as Id<"missions"> : null)}
              className="flex-1 min-w-0 bg-secondary rounded-lg px-3 py-1.5 text-xs text-foreground border-0 outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Tasks</option>
              {missions.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title} ({m.status})
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/missions"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-hover transition-colors text-muted-foreground"
              >
                <List className="w-3.5 h-3.5" />
                All Missions
              </Link>
              {missionIdToUse && (
                <Link
                  to={`/missions/${missionIdToUse}`}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-primary/10 hover:bg-primary/20 transition-colors text-primary border border-primary/20"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Mission Report
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Kanban view */}
        {view === "board" && (
          <div className="flex gap-2 pb-4">
            {columns.map(col => {
              const colTasks = tasks.filter(t => t.status === col.key);
              return (
                <div key={col.key} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{col.label}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">{colTasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colTasks.map(task => (
                      <TaskCard key={task._id} task={task} onClick={() => setSelectedTaskId(task._id)} />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="p-6 rounded-lg border border-dashed border-border text-center">
                        <p className="text-xs text-muted-foreground">No tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Plan view — dependency DAG as phase-grouped list */}
        {view === "plan" && (
          <MissionPlanView tasks={tasks} onTaskClick={setSelectedTaskId} />
        )}
      </div>

      {/* Detail panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* New task modal */}
      {showNewTask && (
        <NewTaskModal onClose={() => setShowNewTask(false)} onCreate={handleCreate} missions={missions} />
      )}

      {/* New mission modal */}
      {showNewMission && (
        <NewMissionModal
          onClose={() => setShowNewMission(false)}
          onCreate={(missionId) => {
            setSelectedMissionId(missionId);
            setShowNewMission(false);
          }}
        />
      )}
    </DashboardLayout>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Mission Plan View — topological sort into dependency depth levels (phases)
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  done: "text-status-online bg-status-online/10",
  in_progress: "text-status-working bg-status-working/10",
  in_review: "text-primary bg-primary/10",
  assigned: "text-muted-foreground bg-secondary",
  inbox: "text-muted-foreground bg-secondary",
  cancelled: "text-destructive bg-destructive/10",
};

function MissionPlanView({ tasks, onTaskClick }: { tasks: any[]; onTaskClick: (id: Id<"tasks">) => void }) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <GitBranch className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
        <p className="text-sm text-muted-foreground">No tasks in this mission yet.</p>
      </div>
    );
  }

  // Topological sort: assign each task a depth level
  const depthMap = new Map<string, number>();
  const taskMap = new Map(tasks.map(t => [t._id as string, t]));

  function getDepth(taskId: string, visited = new Set<string>()): number {
    if (depthMap.has(taskId)) return depthMap.get(taskId)!;
    if (visited.has(taskId)) return 0; // cycle guard
    visited.add(taskId);
    const task = taskMap.get(taskId);
    if (!task || !task.dependsOn || task.dependsOn.length === 0) {
      depthMap.set(taskId, 0);
      return 0;
    }
    const maxParentDepth = Math.max(...task.dependsOn.map((depId: string) => getDepth(depId, new Set(visited))));
    const depth = maxParentDepth + 1;
    depthMap.set(taskId, depth);
    return depth;
  }

  tasks.forEach(t => getDepth(t._id as string));

  const maxDepth = Math.max(...Array.from(depthMap.values()), 0);
  const phases: any[][] = Array.from({ length: maxDepth + 1 }, () => []);
  tasks.forEach(t => {
    const d = depthMap.get(t._id as string) ?? 0;
    phases[d].push(t);
  });

  return (
    <div className="space-y-6 pb-8">
      {phases.map((phaseTasks, phaseIdx) => (
        <div key={phaseIdx}>
          {/* Phase header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {phaseIdx === 0 ? "Phase 1 — No dependencies" : `Phase ${phaseIdx + 1}`}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{phaseTasks.length}</span>
            </div>
            {phaseIdx < phases.length - 1 && (
              <div className="flex-1 border-t border-dashed border-border" />
            )}
          </div>

          {/* Task rows */}
          <div className="space-y-2 pl-2">
            {phaseTasks.map((task: any) => {
              const agentCfg = task.assignee ? AGENT_CONFIG[task.assignee as AgentName] : null;
              const statusCls = STATUS_COLOR[task.status] ?? "text-muted-foreground bg-secondary";
              const blockedTaskIds: string[] = task.blocks ?? [];
              const blockedTitles = blockedTaskIds
                .map((id: string) => taskMap.get(id)?.title)
                .filter(Boolean)
                .slice(0, 3);
              const hasIterations = (task.iterationCount ?? 0) > 0;

              return (
                <button
                  key={task._id}
                  onClick={() => onTaskClick(task._id)}
                  className="w-full text-left group"
                >
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-surface-hover transition-colors"
                    style={agentCfg ? { borderLeftColor: `hsl(var(--agent-${agentCfg.color}))`, borderLeftWidth: "3px" } : {}}>
                    {/* Agent emoji */}
                    <span className="text-base shrink-0 w-6 text-center">
                      {agentCfg ? agentCfg.emoji : "○"}
                    </span>

                    {/* Title */}
                    <span className="flex-1 text-sm font-medium text-foreground truncate">{task.title}</span>

                    {/* Revision badge */}
                    {hasIterations && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 shrink-0">
                        {task.iterationCount}/{task.maxIterations ?? 3}
                      </span>
                    )}

                    {/* Status chip */}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${statusCls}`}>
                      {task.status.replace("_", " ")}
                    </span>

                    {/* Blocks arrow */}
                    {blockedTitles.length > 0 && (
                      <div className="flex items-center gap-1 shrink-0 max-w-[200px]">
                        <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="text-[10px] text-muted-foreground truncate">
                          {blockedTitles.join(", ")}
                          {blockedTaskIds.length > 3 && ` +${blockedTaskIds.length - 3}`}
                        </span>
                      </div>
                    )}

                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Arrow connecting to next phase */}
          {phaseIdx < phases.length - 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <div className="w-px h-4 bg-border" />
                <ArrowRight className="w-3.5 h-3.5 rotate-90" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Board;
