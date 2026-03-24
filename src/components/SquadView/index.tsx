import { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AgentName, AGENT_CONFIG } from "@/types/mission";
import { useAgentPositions } from "./useAgentPositions";
import { useWorldInteractions } from "./useWorldInteractions";
import { AgentInfoPanel } from "./AgentInfoPanel";
import { MissionProgressBar } from "./MissionProgressBar";
import { LiveTicker } from "./LiveTicker";
import { NeuralView } from "../NeuralView/NeuralView";
import { useUserTasks, useUserMissions } from "@/hooks/useUserScoped";

interface SquadViewProps {
  onTaskSelect: (taskId: string) => void;
}

export function SquadView({ onTaskSelect }: SquadViewProps) {
  const [selectedAgent, setSelectedAgent] = useState<AgentName>("Kaze");
  const sceneRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Convex real-time data
  const agents = useQuery(api.agents.list) ?? [];
  const tasks = useUserTasks();
  const missions = useUserMissions();
  const activity = useQuery(api.activityFns.list, { limit: 20 }) ?? [];

  // Movement state machine (kept to maintain hook call order)
  const agentPositions = useAgentPositions(
    agents as any,
    tasks as any,
    activity as any
  );

  // Interaction events (kept to maintain hook call order)
  useWorldInteractions(
    activity as any,
    tasks as any,
    agentPositions
  );

  // Measure container
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { width: cw, height: ch } = containerSize;

  const selectedConfig = AGENT_CONFIG[selectedAgent];

  const selectedAgentData = useMemo(
    () =>
      agents.find((a) => a.name === selectedAgent) ?? {
        name: selectedAgent,
        status: "offline" as const,
        tasksCompleted: 0,
        lastHeartbeat: 0,
        emoji: selectedConfig.emoji,
        color: selectedConfig.color,
        role: selectedConfig.role,
        description: selectedConfig.description,
      },
    [agents, selectedAgent]
  );

  const activeTasks = useMemo(
    () => tasks.filter((t) => t.assignee === selectedAgent && t.status === "in_progress"),
    [tasks, selectedAgent]
  );

  const queuedTasks = useMemo(
    () => tasks.filter((t) => t.assignee === selectedAgent && t.status === "assigned"),
    [tasks, selectedAgent]
  );

  const activeMission = useMemo(() => missions.find((m) => m.status === "active"), [missions]);

  const missionTasks = useMemo(
    () =>
      activeMission ? tasks.filter((t) => (t as any).missionId === activeMission._id) : [],
    [tasks, activeMission]
  );


  return (
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden relative"
      style={{
        background: "linear-gradient(180deg, #0a1a0f 0%, #0d1510 55%, #121008 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Mission progress bar */}
      <MissionProgressBar tasks={missionTasks as any} missionTitle={activeMission?.title} />

      {/* Neural Mind Palace scene */}
      <div ref={sceneRef} className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
        <NeuralView
          agents={agents as any}
          tasks={tasks as any}
          activity={activity as any}
          selectedAgent={selectedAgent}
          onAgentSelect={setSelectedAgent}
          containerWidth={cw}
          containerHeight={ch}
        />
      </div>

      {/* Info panel */}
      <AnimatePresence mode="wait">
        <AgentInfoPanel
          key={selectedAgent}
          agent={selectedAgentData as any}
          activeTasks={activeTasks as any}
          queuedTasks={queuedTasks as any}
          onTaskClick={onTaskSelect}
        />
      </AnimatePresence>

      {/* Live ticker */}
      <LiveTicker activity={activity as any} />
    </div>
  );
}
