// NeuralView.tsx — Terrarium: Living ecosystem where 4 AI agents inhabit unique biomes
// Kaze=Zen Garden, Scout=Jungle, Forge=Volcanic, Ghost=Deep Sea Grotto

import { useRef, useEffect, useState, useCallback } from "react";
import { AgentName } from "@/types/mission";
import { TerrariumBackground } from "./TerrariumBackground";
import { GlassFrame } from "./GlassFrame";
import { BiomeZone } from "./BiomeZone";
import { SubstrateLayer } from "./SubstrateLayer";
import { FloatingSpores, SporeData } from "./FloatingSpores";
import { WeatherSystem } from "./WeatherSystem";
import { TerrariumHUD } from "./TerrariumHUD";

const AGENT_ORDER: AgentName[] = ["Kaze", "Scout", "Forge", "Ghost"];

const BIOME_TYPE: Record<AgentName, "zen" | "jungle" | "volcanic" | "sea"> = {
  Kaze: "zen",
  Scout: "jungle",
  Forge: "volcanic",
  Ghost: "sea",
};

const AGENT_HEX: Record<AgentName, string> = {
  Kaze: "#5b9bd5",
  Scout: "#22c55e",
  Forge: "#f59e0b",
  Ghost: "#a78bfa",
};

interface AgentData {
  name: AgentName;
  status: string;
  tasksCompleted: number;
  lastHeartbeat?: number;
}

interface TaskData {
  _id: string;
  title: string;
  status: string;
  assignee?: AgentName;
}

interface ActivityData {
  _id?: string;
  agentName: AgentName;
  action: string;
  details: string;
  timestamp?: number;
  _creationTime?: number;
}

interface NeuralViewProps {
  agents: AgentData[];
  tasks: TaskData[];
  activity: ActivityData[];
  selectedAgent: AgentName;
  onAgentSelect: (name: AgentName) => void;
  containerWidth: number;
  containerHeight: number;
}

let sporeCounter = 0;

export function NeuralView({
  agents,
  tasks,
  activity,
  selectedAgent,
  onAgentSelect,
  containerWidth,
  containerHeight,
}: NeuralViewProps) {
  const [spores, setSpores] = useState<SporeData[]>([]);

  // Track seen activity IDs to detect new spore triggers
  const seenActivityIds = useRef<Set<string>>(new Set());
  const seenTaskIds = useRef<Set<string>>(new Set());

  // Count working agents for weather system
  const workingCount = agents.filter(
    (a) => a.status === "working" || a.status === "online"
  ).length;
  const isStorm = workingCount >= 3;

  // Count agents online (not offline)
  const agentsOnline = agents.filter((a) => a.status !== "offline").length;

  // Total ops across all agents
  const totalOps = agents.reduce((sum, a) => sum + a.tasksCompleted, 0);

  // Compute biome zone center X positions (center of each 25% column)
  const zoneCenterX = useCallback(
    (agentName: AgentName) => {
      const idx = AGENT_ORDER.indexOf(agentName);
      return (idx * 0.25 + 0.125) * containerWidth;
    },
    [containerWidth]
  );

  // Detect new activity → spawn spores between biomes
  useEffect(() => {
    if (containerWidth === 0) return;
    activity.forEach((entry) => {
      const key = entry._id ?? `${entry.agentName}-${entry._creationTime}`;
      if (seenActivityIds.current.has(key)) return;
      seenActivityIds.current.add(key);

      // Pick a random target agent (not the same)
      const others = AGENT_ORDER.filter((n) => n !== entry.agentName);
      const target = others[Math.floor(Math.random() * others.length)];

      const fromX = zoneCenterX(entry.agentName);
      const toX = zoneCenterX(target);
      const fromY = containerHeight * 0.5;
      const toY = containerHeight * 0.5;

      const newSpore: SporeData = {
        id: `spore-${sporeCounter++}`,
        fromX,
        fromY,
        toX,
        toY,
        color: AGENT_HEX[entry.agentName],
      };
      setSpores((prev) => [...prev.slice(-6), newSpore]);
    });
  }, [activity, containerWidth, containerHeight, zoneCenterX]);

  // Detect new tasks → spawn incoming spores from edges
  useEffect(() => {
    if (containerWidth === 0) return;
    tasks.forEach((task) => {
      if (!task.assignee) return;
      const key = task._id;
      if (seenTaskIds.current.has(key)) return;
      seenTaskIds.current.add(key);

      if (task.status !== "in_progress" && task.status !== "assigned") return;

      const targetX = zoneCenterX(task.assignee);
      const targetY = containerHeight * 0.45;

      // Start from top edge
      const startX = targetX + (Math.random() - 0.5) * containerWidth * 0.3;
      const startY = -10;

      const newSpore: SporeData = {
        id: `task-spore-${sporeCounter++}`,
        fromX: startX,
        fromY: startY,
        toX: targetX,
        toY: targetY,
        color: AGENT_HEX[task.assignee],
      };
      setSpores((prev) => [...prev.slice(-6), newSpore]);
    });
  }, [tasks, containerWidth, containerHeight, zoneCenterX]);

  const removeSpore = useCallback((id: string) => {
    setSpores((prev) => prev.filter((s) => s.id !== id));
  }, []);

  if (containerWidth === 0) return null;

  return (
    <div className="absolute inset-0">
      {/* Layer 0: Deep forest background */}
      <TerrariumBackground isStorm={isStorm} />

      {/* Glass terrarium enclosure */}
      <GlassFrame>
        {/* Layer 1: Biome zones (4 columns) */}
        {AGENT_ORDER.map((name, idx) => {
          const agentData = agents.find((a) => a.name === name) ?? {
            name,
            status: "offline" as const,
            tasksCompleted: 0,
          };
          return (
            <BiomeZone
              key={name}
              agent={agentData}
              agentName={name}
              biomeType={BIOME_TYPE[name]}
              color={AGENT_HEX[name]}
              isSelected={selectedAgent === name}
              onClick={() => onAgentSelect(name)}
              zoneIndex={idx}
            />
          );
        })}

        {/* Layer 2: Substrate (soil + root network) */}
        <SubstrateLayer
          activity={activity}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
        />

        {/* Layer 3: Weather effects */}
        <WeatherSystem
          workingCount={workingCount}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
        />

        {/* Layer 4: Floating spores */}
        <FloatingSpores spores={spores} onComplete={removeSpore} />

        {/* Layer 5: Glass-etched HUD */}
        <TerrariumHUD
          agentsOnline={agentsOnline}
          totalAgents={AGENT_ORDER.length}
          totalOps={totalOps}
          isStorm={isStorm}
        />
      </GlassFrame>
    </div>
  );
}
