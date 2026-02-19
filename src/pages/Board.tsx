import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { NewTaskModal } from "@/components/NewTaskModal";
import { NewMissionModal } from "@/components/NewMissionModal";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { TaskStatus, AgentName, TaskPriority } from "@/types/mission";
import { Plus, List, FolderPlus, Zap } from "lucide-react";
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

  const handleCreate = async (data: { title: string; description: string; priority: TaskPriority; assignee?: AgentName; tags: string[]; missionId?: string }) => {
    const result = await createTask({
      title: data.title,
      description: data.description,
      priority: data.priority,
      assignee: data.assignee,
      creator: "Human",
      tags: data.tags,
      ...(data.missionId ? { missionId: data.missionId as Id<"missions"> } : {}),
      // NEW: Capture current user's ID for agent-to-integration wiring
      ...(user?.id ? { requiredUserId: user.id } : {}),
    });
    // Auto-select the mission board (newly created or existing)
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
    } catch (error) {
      toast({
        title: "Wake Failed",
        description: "Could not wake agents. Ensure agent-wakeup-server is running.",
        variant: "destructive",
      });
    } finally {
      setWakingAgents(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mission Board</h1>
            <p className="text-sm text-muted-foreground mt-1">Track and manage squad tasks</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWakeAgents}
              disabled={wakingAgents}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Zap className={`w-4 h-4 ${wakingAgents ? 'animate-pulse' : ''}`} />
              {wakingAgents ? 'Waking...' : 'Wake Agents'}
            </button>
            <button onClick={() => setShowNewMission(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover transition-colors text-foreground">
              <FolderPlus className="w-4 h-4" /> New Mission
            </button>
            <button onClick={() => setShowNewTask(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors">
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>
        </div>

        {/* Mission Selector */}
        {missions.length > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
            <label className="text-sm font-medium text-foreground">Mission:</label>
            <select
              value={selectedMissionId || missions[0]?._id || ""}
              onChange={(e) => setSelectedMissionId(e.target.value ? e.target.value as Id<"missions"> : null)}
              className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Tasks</option>
              {missions.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title} ({m.status})
                </option>
              ))}
            </select>
            <Link
              to="/missions"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-surface-hover transition-colors text-muted-foreground"
            >
              <List className="w-4 h-4" />
              View All Missions
            </Link>
          </div>
        )}

        {/* Kanban */}
        <div className="flex gap-3 overflow-x-auto pb-4">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <div key={col.key} className="flex-shrink-0 w-72">
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

export default Board;
