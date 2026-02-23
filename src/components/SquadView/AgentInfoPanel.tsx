import { motion, AnimatePresence } from "framer-motion";
import { AgentName, AgentStatus, AGENT_CONFIG, TaskPriority } from "@/types/mission";
import { StatusBadge } from "@/components/AgentStatusCard";
import { getRelativeTime } from "@/lib/time";
import { ArrowRight, Clock, ChevronRight, Inbox } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: TaskPriority;
  tags: string[];
  assignee?: AgentName;
  updatedAt: number;
  createdAt: number;
  deliverables: { name: string; type: string; content: string }[];
}

interface AgentData {
  name: AgentName;
  status: AgentStatus;
  tasksCompleted: number;
  lastHeartbeat: number;
}

interface AgentInfoPanelProps {
  agent: AgentData;
  activeTasks: Task[];
  queuedTasks: Task[];
  onTaskClick: (id: string) => void;
}

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  urgent: "hsl(0 84% 60%)",
  high: "hsl(25 95% 53%)",
  medium: "hsl(48 96% 53%)",
  low: "hsl(220 9% 46%)",
};

function PriorityDot({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full mr-1"
      style={{ backgroundColor: PRIORITY_COLOR[priority] }}
    />
  );
}

export function AgentInfoPanel({ agent, activeTasks, queuedTasks, onTaskClick }: AgentInfoPanelProps) {
  const config = AGENT_CONFIG[agent.name];
  const color = config.color;
  const activeTask = activeTasks[0] ?? null;
  const isWorking = agent.status === "working" || agent.status === "online";

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 38 }}
      className="border-t border-border/60"
      style={{
        background: `linear-gradient(to bottom, hsl(var(--agent-${color}) / 0.04), transparent)`,
      }}
    >
      {/* Header row */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b border-border/40"
        style={{ borderBottomColor: `hsl(var(--agent-${color}) / 0.2)` }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{config.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-bold tracking-wide"
                style={{
                  color: `hsl(var(--agent-${color}))`,
                  textShadow: `0 0 12px hsl(var(--agent-${color}) / 0.5)`,
                }}
              >
                {agent.name}
              </span>
              <span className="text-xs text-muted-foreground">—</span>
              <span className="text-xs text-muted-foreground">{config.role}</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
              Last active: {getRelativeTime(agent.lastHeartbeat)} · {agent.tasksCompleted} ops complete
            </div>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* Body */}
      <div className="flex gap-0 divide-x divide-border/40">

        {/* Active task column */}
        <div className="flex-1 px-5 py-4">
          <div
            className="text-[9px] font-mono uppercase tracking-widest mb-3"
            style={{ color: `hsl(var(--agent-${color}) / 0.7)` }}
          >
            ⚡ Active Mission
          </div>

          <AnimatePresence mode="wait">
            {activeTask ? (
              <motion.button
                key={activeTask._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => onTaskClick(activeTask._id)}
                className="w-full text-left group"
              >
                <div
                  className="p-3 rounded-lg border transition-all duration-200 group-hover:border-opacity-60"
                  style={{
                    borderColor: `hsl(var(--agent-${color}) / 0.25)`,
                    background: `hsl(var(--agent-${color}) / 0.06)`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-foreground line-clamp-2 flex-1">
                      {activeTask.title}
                    </p>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5
                      group-hover:text-foreground transition-colors" />
                  </div>

                  <div className="flex items-center gap-2 mb-2.5">
                    <PriorityDot priority={activeTask.priority} />
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {activeTask.priority}
                    </span>
                    {activeTask.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded-sm font-mono"
                        style={{
                          background: "hsl(var(--secondary))",
                          color: "hsl(var(--muted-foreground))",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {getRelativeTime(activeTask.updatedAt)}
                    </span>
                  </div>

                  {/* Activity bar */}
                  <div className="h-1 rounded-full overflow-hidden bg-border/40">
                    <motion.div
                      className="h-full rounded-full relative overflow-hidden"
                      style={{ backgroundColor: `hsl(var(--agent-${color}))` }}
                      animate={{ width: isWorking ? "72%" : "40%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                          animation: "shimmer 2s infinite",
                          backgroundSize: "200% 100%",
                        }}
                      />
                    </motion.div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] font-mono text-muted-foreground">
                      {activeTask.deliverables.length > 0
                        ? `${activeTask.deliverables.length} deliverable${activeTask.deliverables.length > 1 ? "s" : ""} ready`
                        : "In progress..."}
                    </span>
                    <span
                      className="text-[9px] font-mono"
                      style={{ color: `hsl(var(--agent-${color}))` }}
                    >
                      {isWorking ? "EXECUTING" : "ASSIGNED"}
                    </span>
                  </div>
                </div>
              </motion.button>
            ) : (
              <motion.div
                key="standby"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 py-3"
              >
                <span
                  className="text-xs font-mono"
                  style={{ color: `hsl(var(--agent-${color}) / 0.5)` }}
                >
                  Standing by
                  <span className="animate-pulse">_</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Queue column */}
        <div className="w-72 px-5 py-4">
          <div
            className="text-[9px] font-mono uppercase tracking-widest mb-3"
            style={{ color: `hsl(var(--agent-${color}) / 0.7)` }}
          >
            <Inbox className="w-2.5 h-2.5 inline mr-1" />
            Queue ({queuedTasks.length})
          </div>

          {queuedTasks.length === 0 ? (
            <p className="text-[10px] text-muted-foreground font-mono">Queue empty</p>
          ) : (
            <div className="space-y-1.5">
              {queuedTasks.slice(0, 4).map((task, i) => (
                <motion.button
                  key={task._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onTaskClick(task._id)}
                  className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded
                    hover:bg-white/5 transition-colors group"
                >
                  <ChevronRight
                    className="w-3 h-3 shrink-0 group-hover:translate-x-0.5 transition-transform"
                    style={{ color: `hsl(var(--agent-${color}) / 0.6)` }}
                  />
                  <PriorityDot priority={task.priority} />
                  <span className="text-xs text-muted-foreground group-hover:text-foreground
                    transition-colors truncate flex-1">
                    {task.title}
                  </span>
                </motion.button>
              ))}
              {queuedTasks.length > 4 && (
                <p className="text-[9px] text-muted-foreground font-mono pl-2 mt-1">
                  +{queuedTasks.length - 4} more
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </motion.div>
  );
}
