import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ReasoningStream } from "@/components/ReasoningStream";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Inbox,
  Loader,
  MessageSquare,
  Milestone,
  Radio,
  Send,
  Swords,
  Target,
  XCircle,
  Zap,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

// ── Constants ──────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string; icon: typeof CheckCircle }> = {
  inbox: { bg: "bg-zinc-500/10", text: "text-zinc-400", label: "Inbox", icon: Inbox },
  assigned: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Assigned", icon: Clock },
  in_progress: { bg: "bg-amber-500/10", text: "text-amber-400", label: "In Progress", icon: Loader },
  in_review: { bg: "bg-purple-500/10", text: "text-purple-400", label: "In Review", icon: Eye },
  done: { bg: "bg-green-500/10", text: "text-green-400", label: "Done", icon: CheckCircle },
  cancelled: { bg: "bg-red-500/10", text: "text-red-400", label: "Cancelled", icon: XCircle },
};

const MESSAGE_TYPE_CONFIG: Record<string, { icon: typeof Zap; color: string; label: string }> = {
  update: { icon: Radio, color: "text-blue-400", label: "Update" },
  handoff: { icon: ArrowRight, color: "text-cyan-400", label: "Handoff" },
  request: { icon: Send, color: "text-amber-400", label: "Request" },
  blocker: { icon: AlertTriangle, color: "text-red-400", label: "Blocker" },
  resolved: { icon: CheckCircle, color: "text-green-400", label: "Resolved" },
  milestone: { icon: Milestone, color: "text-purple-400", label: "Milestone" },
};

// ── Main Component ─────────────────────────────────────────────

export default function WarRoom() {
  const { missionId } = useParams<{ missionId: string }>();
  const state = useQuery(
    api.warRoom.getState,
    missionId ? { missionId: missionId as Id<"missions"> } : "skip"
  );

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  if (!missionId) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No mission selected</p>
        </div>
      </DashboardLayout>
    );
  }

  if (state === undefined) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader className="w-6 h-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (state === null) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Mission not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const { mission, tasks, agents, messages, latestReasoning, agentLanes, progress } = state;

  // Active agents on this mission
  const missionAgents = agents.filter(
    (a) => agentLanes[a.name] && agentLanes[a.name].length > 0
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-4">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link
              to={`/missions/${missionId}`}
              className="p-1.5 rounded-lg hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Swords className="w-5 h-5 text-primary" />
                War Room
              </h1>
              <p className="text-sm text-muted-foreground">{mission.title}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {progress.completed}/{progress.total} tasks
              </p>
              <p className="text-xs text-muted-foreground">
                {progress.inProgress} active, {progress.inReview} in review
              </p>
            </div>
            <div className="w-32 h-2 rounded-full bg-accent/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <span className="text-sm font-bold text-primary">{progress.percent}%</span>
          </div>
        </div>

        {/* Main grid: Agent Lanes + Message Thread */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
          {/* Agent Lanes — 2 cols */}
          <div className="lg:col-span-2 overflow-y-auto space-y-4 pb-4">
            {missionAgents.length === 0 ? (
              <div className="flex items-center justify-center h-40 rounded-xl border border-border/50 bg-card">
                <p className="text-sm text-muted-foreground">No agents assigned to this mission yet</p>
              </div>
            ) : (
              missionAgents.map((agent) => {
                const config = AGENT_CONFIG[agent.name as AgentName];
                const agentTasks = agentLanes[agent.name] ?? [];
                const isWorking = agent.status === "working" || agent.status === "online";

                return (
                  <AgentLane
                    key={agent.name}
                    agent={agent}
                    config={config}
                    tasks={agentTasks}
                    isWorking={isWorking}
                    latestReasoning={latestReasoning}
                    selectedTaskId={selectedTaskId}
                    onSelectTask={setSelectedTaskId}
                  />
                );
              })
            )}

            {/* Unassigned tasks */}
            {agentLanes["Unassigned"] && agentLanes["Unassigned"].length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Inbox className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Unassigned ({agentLanes["Unassigned"].length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {agentLanes["Unassigned"].map((task) => (
                    <TaskChip key={task._id} task={task} onClick={() => setSelectedTaskId(task._id)} selected={selectedTaskId === task._id} />
                  ))}
                </div>
              </div>
            )}

            {/* Selected task detail + reasoning */}
            {selectedTaskId && (
              <SelectedTaskDetail
                taskId={selectedTaskId as Id<"tasks">}
                tasks={tasks}
                onClose={() => setSelectedTaskId(null)}
              />
            )}
          </div>

          {/* Message Thread — 1 col */}
          <div className="flex flex-col border border-border/50 rounded-xl bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50 shrink-0">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Coordination Feed
                {messages.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {messages.length} message{messages.length !== 1 ? "s" : ""}
                  </span>
                )}
              </h3>
            </div>

            <MessageThread messages={messages} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Agent Lane ──────────────────────────────────────────────────

function AgentLane({
  agent,
  config,
  tasks,
  isWorking,
  latestReasoning,
  selectedTaskId,
  onSelectTask,
}: {
  agent: { name: string; status: string; currentTaskId?: string; lastHeartbeat: number };
  config: (typeof AGENT_CONFIG)[AgentName] | undefined;
  tasks: any[];
  isWorking: boolean;
  latestReasoning: Record<string, any>;
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
}) {
  const activeTasks = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const currentTask = tasks.find((t) => t._id === agent.currentTaskId);
  const currentReasoning = currentTask ? latestReasoning[currentTask._id] : null;

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      {/* Agent header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
        <span className="text-lg">{config?.emoji ?? "?"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{agent.name}</span>
            <span className="text-xs text-muted-foreground">{config?.role}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status badge */}
          <span
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-medium",
              isWorking
                ? "bg-green-500/10 text-green-400"
                : agent.status === "idle"
                ? "bg-amber-500/10 text-amber-400"
                : "bg-zinc-500/10 text-zinc-400"
            )}
          >
            {agent.status}
          </span>
          {/* Task counts */}
          <span className="text-xs text-muted-foreground">
            {activeTasks.length} active, {doneTasks.length} done
          </span>
        </div>
      </div>

      {/* Current task + live reasoning */}
      {currentTask && (
        <div className="px-4 py-3 bg-primary/5 border-b border-border/30">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">Working on</span>
          </div>
          <p className="text-sm font-medium text-foreground truncate">{currentTask.title}</p>
          {currentReasoning && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {currentReasoning.content}
            </p>
          )}
        </div>
      )}

      {/* Task chips */}
      <div className="px-4 py-3">
        {tasks.length === 0 ? (
          <p className="text-xs text-muted-foreground">No tasks assigned</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tasks.map((task) => (
              <TaskChip
                key={task._id}
                task={task}
                onClick={() => onSelectTask(task._id)}
                selected={selectedTaskId === task._id}
                isCurrent={task._id === agent.currentTaskId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Task Chip ───────────────────────────────────────────────────

function TaskChip({
  task,
  onClick,
  selected,
  isCurrent,
}: {
  task: any;
  onClick: () => void;
  selected: boolean;
  isCurrent?: boolean;
}) {
  const statusConfig = STATUS_COLORS[task.status] ?? STATUS_COLORS.inbox;
  const Icon = statusConfig.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all border",
        selected
          ? "border-primary/50 bg-primary/10 text-foreground"
          : "border-border/50 bg-accent/10 hover:bg-accent/30 text-foreground/80",
        isCurrent && "ring-1 ring-primary/30"
      )}
    >
      <Icon className={cn("w-3 h-3 shrink-0", statusConfig.text)} />
      <span className="truncate max-w-[150px]">{task.title}</span>
    </button>
  );
}

// ── Selected Task Detail ────────────────────────────────────────

function SelectedTaskDetail({
  taskId,
  tasks,
  onClose,
}: {
  taskId: Id<"tasks">;
  tasks: any[];
  onClose: () => void;
}) {
  const task = tasks.find((t: any) => t._id === taskId);
  if (!task) return null;

  const statusConfig = STATUS_COLORS[task.status] ?? STATUS_COLORS.inbox;

  return (
    <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{task.title}</span>
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", statusConfig.bg, statusConfig.text)}>
            {statusConfig.label}
          </span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <XCircle className="w-4 h-4" />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{task.description}</p>
      )}

      {/* Dependencies */}
      {task.dependsOn && task.dependsOn.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Depends on:</span>
          {task.dependsOn.map((depId: string) => {
            const dep = tasks.find((t: any) => t._id === depId);
            return (
              <span key={depId} className={cn(
                "text-[10px] px-1.5 py-0.5 rounded",
                dep?.status === "done" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
              )}>
                {dep?.title ?? depId.slice(-6)}
              </span>
            );
          })}
        </div>
      )}

      {/* Reasoning stream for this task */}
      {task.assignee && (
        <ReasoningStream taskId={taskId} compact />
      )}
    </div>
  );
}

// ── Message Thread ──────────────────────────────────────────────

function MessageThread({ messages }: { messages: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            No coordination messages yet.
            <br />
            Agents will post handoffs, blockers, and milestones here as they work.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
      {messages.map((msg) => {
        const typeConfig = MESSAGE_TYPE_CONFIG[msg.messageType] ?? MESSAGE_TYPE_CONFIG.update;
        const Icon = typeConfig.icon;
        const agentConfig = AGENT_CONFIG[msg.agentName as AgentName];

        return (
          <div
            key={msg._id}
            className={cn(
              "rounded-lg border p-2.5 transition-colors",
              msg.messageType === "blocker"
                ? "border-red-500/20 bg-red-500/5"
                : msg.messageType === "milestone"
                ? "border-purple-500/20 bg-purple-500/5"
                : msg.messageType === "handoff"
                ? "border-cyan-500/20 bg-cyan-500/5"
                : "border-border/50 bg-accent/10"
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{agentConfig?.emoji ?? "?"}</span>
              <span className="text-xs font-medium text-foreground">{msg.agentName}</span>
              <Icon className={cn("w-3 h-3", typeConfig.color)} />
              <span className={cn("text-[10px] font-medium", typeConfig.color)}>
                {typeConfig.label}
              </span>
              {msg.targetAgent && (
                <>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {AGENT_CONFIG[msg.targetAgent as AgentName]?.emoji} {msg.targetAgent}
                  </span>
                </>
              )}
              <span className="text-[10px] text-muted-foreground ml-auto">
                {getRelativeTime(msg.timestamp)}
              </span>
            </div>

            {/* Content */}
            <p className="text-xs text-foreground/90 leading-relaxed">{msg.content}</p>
          </div>
        );
      })}
    </div>
  );
}
