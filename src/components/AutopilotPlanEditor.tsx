import { useState } from "react";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowRight,
  Plus,
  Trash2,
  Clock,
  ChevronDown,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────

interface PlanTask {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignee: "Kaze" | "Scout" | "Forge" | "Ghost";
  tags: string[];
  dependsOnIndex: number[];
  requiredIntegrations: string[];
  estimatedMinutes: number;
}

export interface DecomposedPlan {
  missionTitle: string;
  missionDescription: string;
  estimatedDuration: string;
  tasks: PlanTask[];
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  low: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const PRIORITY_CYCLE: ("low" | "medium" | "high" | "urgent")[] = ["low", "medium", "high", "urgent"];
const AGENTS: ("Kaze" | "Scout" | "Forge" | "Ghost")[] = ["Kaze", "Scout", "Forge", "Ghost"];

const AGENT_COLOR_VAR: Record<string, string> = {
  Kaze: "--agent-kaze",
  Scout: "--agent-scout",
  Forge: "--agent-forge",
  Ghost: "--agent-ghost",
};

// ── Component ─────────────────────────────────────────────────

export function AutopilotPlanEditor({
  plan,
  onChange,
}: {
  plan: DecomposedPlan;
  onChange: (plan: DecomposedPlan) => void;
}) {
  const [editingTimeIdx, setEditingTimeIdx] = useState<number | null>(null);

  // Topological sort into phases (same logic as MissionPlanView in Board.tsx)
  const depthMap = new Map<number, number>();

  function getDepth(idx: number, visited = new Set<number>()): number {
    if (depthMap.has(idx)) return depthMap.get(idx)!;
    if (visited.has(idx)) return 0;
    visited.add(idx);
    const task = plan.tasks[idx];
    if (!task.dependsOnIndex || task.dependsOnIndex.length === 0) {
      depthMap.set(idx, 0);
      return 0;
    }
    const maxParentDepth = Math.max(
      ...task.dependsOnIndex.map((depIdx) => getDepth(depIdx, new Set(visited)))
    );
    const depth = maxParentDepth + 1;
    depthMap.set(idx, depth);
    return depth;
  }

  plan.tasks.forEach((_, i) => getDepth(i));
  const maxDepth = plan.tasks.length > 0 ? Math.max(...Array.from(depthMap.values()), 0) : 0;
  const phases: { idx: number; task: PlanTask }[][] = Array.from(
    { length: maxDepth + 1 },
    () => []
  );
  plan.tasks.forEach((task, idx) => {
    const d = depthMap.get(idx) ?? 0;
    phases[d].push({ idx, task });
  });

  const updateTask = (idx: number, updates: Partial<PlanTask>) => {
    const newTasks = [...plan.tasks];
    newTasks[idx] = { ...newTasks[idx], ...updates };
    onChange({ ...plan, tasks: newTasks });
  };

  const removeTask = (idx: number) => {
    const newTasks = plan.tasks.filter((_, i) => i !== idx);
    // Fix dependency indices
    for (const task of newTasks) {
      task.dependsOnIndex = task.dependsOnIndex
        .filter((depIdx) => depIdx !== idx)
        .map((depIdx) => (depIdx > idx ? depIdx - 1 : depIdx));
    }
    onChange({ ...plan, tasks: newTasks });
  };

  const addTask = (afterPhase: number) => {
    const phaseTaskIndices = phases[afterPhase]?.map((p) => p.idx) ?? [];
    const newTask: PlanTask = {
      title: "New task",
      description: "",
      priority: "medium",
      assignee: "Kaze",
      tags: [],
      dependsOnIndex: phaseTaskIndices,
      requiredIntegrations: [],
      estimatedMinutes: 30,
    };
    onChange({ ...plan, tasks: [...plan.tasks, newTask] });
  };

  const cyclePriority = (idx: number) => {
    const current = plan.tasks[idx].priority;
    const nextIdx = (PRIORITY_CYCLE.indexOf(current) + 1) % PRIORITY_CYCLE.length;
    updateTask(idx, { priority: PRIORITY_CYCLE[nextIdx] });
  };

  // Summary stats
  const totalMinutes = plan.tasks.reduce((s, t) => s + t.estimatedMinutes, 0);
  const agentWorkload: Record<string, number> = {};
  for (const task of plan.tasks) {
    agentWorkload[task.assignee] = (agentWorkload[task.assignee] || 0) + 1;
  }

  return (
    <div className="space-y-6">
      {/* Mission header (editable) */}
      <div className="space-y-2">
        <input
          value={plan.missionTitle}
          onChange={(e) => onChange({ ...plan, missionTitle: e.target.value })}
          className="w-full bg-transparent text-xl font-bold text-foreground border-none outline-none focus:ring-0 placeholder:text-muted-foreground"
          placeholder="Mission title"
        />
        <textarea
          value={plan.missionDescription}
          onChange={(e) => onChange({ ...plan, missionDescription: e.target.value })}
          className="w-full bg-transparent text-sm text-muted-foreground border-none outline-none focus:ring-0 resize-none placeholder:text-muted-foreground"
          placeholder="Mission description"
          rows={2}
        />
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {plan.estimatedDuration || `~${Math.round(totalMinutes / 60)} hours`}
        </span>
        <span>{plan.tasks.length} tasks</span>
        <span>{phases.length} phases</span>
        <div className="flex items-center gap-2 ml-auto">
          {Object.entries(agentWorkload).map(([agent, count]) => {
            const config = AGENT_CONFIG[agent as AgentName];
            return (
              <span key={agent} className="flex items-center gap-1">
                {config?.emoji} {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* Phase-grouped task cards */}
      {phases.map((phaseTasks, phaseIdx) => (
        <div key={phaseIdx}>
          {/* Phase header */}
          <div className="flex items-center gap-3 mb-3 mt-4">
            <div
              className="flex items-center gap-2 px-2.5 py-1 rounded-full shrink-0"
              style={{
                background: "hsl(var(--secondary))",
                border: "1px solid hsl(var(--border))",
              }}
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}
              >
                {phaseIdx + 1}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {phaseIdx === 0 ? "Starts immediately" : `After phase ${phaseIdx}`}
              </span>
            </div>
            <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
            <span className="text-[10px] text-muted-foreground/40 font-mono shrink-0">
              {phaseTasks.length} task{phaseTasks.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Task cards */}
          <div className="space-y-2 pl-2">
            {phaseTasks.map(({ idx, task }) => (
              <div
                key={idx}
                className="group border border-border rounded-lg p-3 bg-card hover:border-primary/20 transition-all duration-200"
                style={{
                  borderLeftColor: `hsl(var(${AGENT_COLOR_VAR[task.assignee]}))`,
                  borderLeftWidth: "2px",
                  boxShadow: "0 1px 6px hsl(0 0% 0% / 0.15)",
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Agent selector — styled dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm border transition-all hover:border-primary/40 focus:outline-none shrink-0"
                        style={{
                          background: `hsl(var(${AGENT_COLOR_VAR[task.assignee]}) / 0.08)`,
                          borderColor: `hsl(var(${AGENT_COLOR_VAR[task.assignee]}) / 0.25)`,
                        }}
                      >
                        <span className="text-base leading-none">
                          {AGENT_CONFIG[task.assignee as AgentName]?.emoji}
                        </span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: `hsl(var(${AGENT_COLOR_VAR[task.assignee]}))` }}
                        >
                          {task.assignee}
                        </span>
                        <ChevronDown className="w-3 h-3 text-muted-foreground/50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                      {AGENTS.map((agent) => (
                        <DropdownMenuItem
                          key={agent}
                          onClick={() => updateTask(idx, { assignee: agent })}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <span className="text-base">{AGENT_CONFIG[agent as AgentName]?.emoji}</span>
                          <span className="text-sm">{agent}</span>
                          <span className="text-[10px] text-muted-foreground/50 ml-auto">
                            {AGENT_CONFIG[agent as AgentName]?.role.split(" ")[0]}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Task content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <input
                      value={task.title}
                      onChange={(e) => updateTask(idx, { title: e.target.value })}
                      className="w-full bg-transparent text-sm font-medium text-foreground border-none outline-none focus:ring-0"
                      placeholder="Task title"
                    />
                    <textarea
                      value={task.description}
                      onChange={(e) => updateTask(idx, { description: e.target.value })}
                      className="w-full bg-transparent text-xs text-muted-foreground border-none outline-none focus:ring-0 resize-none"
                      placeholder="Task description..."
                      rows={2}
                    />
                  </div>

                  {/* Right controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Priority badge */}
                    <button
                      onClick={() => cyclePriority(idx)}
                      className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full border cursor-pointer",
                        PRIORITY_COLORS[task.priority]
                      )}
                    >
                      {task.priority}
                    </button>

                    {/* Time estimate — click to edit */}
                    {editingTimeIdx === idx ? (
                      <input
                        type="number"
                        autoFocus
                        value={task.estimatedMinutes}
                        onChange={(e) =>
                          updateTask(idx, { estimatedMinutes: parseInt(e.target.value) || 0 })
                        }
                        onBlur={() => setEditingTimeIdx(null)}
                        onKeyDown={(e) => e.key === "Enter" && setEditingTimeIdx(null)}
                        className="w-14 text-[10px] text-center bg-secondary border border-primary/30 rounded px-1 py-0.5 focus:outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => setEditingTimeIdx(idx)}
                        className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors group/time"
                        title="Click to edit"
                      >
                        <Clock className="w-3 h-3 opacity-50 group-hover/time:opacity-100" />
                        ~{task.estimatedMinutes}m
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => removeTask(idx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Dependencies — agent emoji + task title */}
                {task.dependsOnIndex.length > 0 && (
                  <div className="mt-2.5 flex items-center flex-wrap gap-1.5">
                    <span className="text-[10px] text-muted-foreground/40">after:</span>
                    {task.dependsOnIndex.map((depIdx) => {
                      const dep = plan.tasks[depIdx];
                      if (!dep) return null;
                      return (
                        <span
                          key={depIdx}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                          style={{
                            background: "hsl(var(--secondary))",
                            color: "hsl(var(--muted-foreground))",
                            border: "1px solid hsl(var(--border))",
                          }}
                        >
                          {AGENT_CONFIG[dep.assignee as AgentName]?.emoji}
                          {dep.title.length > 28 ? dep.title.slice(0, 28) + "…" : dep.title}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add task button — full-width dashed zone */}
          <button
            onClick={() => addTask(phaseIdx)}
            className="mt-2 ml-2 flex items-center justify-center gap-1.5 w-[calc(100%-0.5rem)] py-2 rounded-lg text-xs text-muted-foreground/50 hover:text-primary hover:border-primary/30 transition-all border border-dashed border-border/50 hover:bg-primary/5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add task to Phase {phaseIdx + 1}
          </button>
        </div>
      ))}

      {/* Add first task if empty */}
      {plan.tasks.length === 0 && (
        <button
          onClick={() => addTask(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg p-4 w-full justify-center transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add first task
        </button>
      )}
    </div>
  );
}
