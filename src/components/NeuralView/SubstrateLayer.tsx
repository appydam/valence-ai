// SubstrateLayer.tsx — The soil/ground strip at the bottom of the terrarium
// with underground root network connecting all 4 agents

import { useState, useEffect, useRef } from "react";
import { AgentName } from "@/types/mission";

const AGENT_HEX: Record<AgentName, string> = {
  Kaze: "#5b9bd5",
  Scout: "#22c55e",
  Forge: "#f59e0b",
  Ghost: "#a78bfa",
};

const AGENT_ORDER: AgentName[] = ["Kaze", "Scout", "Forge", "Ghost"];

interface ActivityData {
  _id?: string;
  agentName: AgentName;
  action: string;
  details: string;
  _creationTime?: number;
}

interface SubstrateLayerProps {
  activity: ActivityData[];
  containerWidth: number;
  containerHeight: number;
}

export function SubstrateLayer({ activity, containerWidth, containerHeight }: SubstrateLayerProps) {
  const [activeRoots, setActiveRoots] = useState<Set<string>>(new Set());
  const seenIds = useRef<Set<string>>(new Set());

  // Flash root segments when new activity appears
  useEffect(() => {
    activity.forEach((entry) => {
      const key = entry._id ?? `${entry.agentName}-${entry._creationTime}`;
      if (seenIds.current.has(key)) return;
      seenIds.current.add(key);

      // Pick a random partner to light up the root between
      const others = AGENT_ORDER.filter((n) => n !== entry.agentName);
      const partner = others[Math.floor(Math.random() * others.length)];
      const rootKey = [entry.agentName, partner].sort().join("-");

      setActiveRoots((prev) => new Set([...prev, rootKey]));
      setTimeout(() => {
        setActiveRoots((prev) => {
          const next = new Set(prev);
          next.delete(rootKey);
          return next;
        });
      }, 800);
    });
  }, [activity]);

  const soilTop = containerHeight * 0.82;
  const soilHeight = containerHeight * 0.18;

  // Root Y positions within the soil strip
  const rootY = soilTop + soilHeight * 0.4;

  // Agent X centers (each at 12.5%, 37.5%, 62.5%, 87.5% — center of 25% columns)
  const agentCenters = AGENT_ORDER.map((_, i) => (i * 0.25 + 0.125) * containerWidth);

  // Generate root paths connecting adjacent agents
  const rootPaths: { path: string; color1: string; color2: string; key: string }[] = [];
  for (let i = 0; i < AGENT_ORDER.length - 1; i++) {
    const x1 = agentCenters[i];
    const x2 = agentCenters[i + 1];
    const midX = (x1 + x2) / 2;
    const wobble = (i % 2 === 0 ? 1 : -1) * soilHeight * 0.15;

    rootPaths.push({
      path: `M ${x1} ${rootY} Q ${midX} ${rootY + wobble} ${x2} ${rootY}`,
      color1: AGENT_HEX[AGENT_ORDER[i]],
      color2: AGENT_HEX[AGENT_ORDER[i + 1]],
      key: [AGENT_ORDER[i], AGENT_ORDER[i + 1]].sort().join("-"),
    });
  }

  // Also connect first to last (the outer root)
  const x1 = agentCenters[0];
  const x4 = agentCenters[3];
  rootPaths.push({
    path: `M ${x1} ${rootY} Q ${containerWidth * 0.5} ${rootY + soilHeight * 0.25} ${x4} ${rootY}`,
    color1: AGENT_HEX.Kaze,
    color2: AGENT_HEX.Ghost,
    key: [AGENT_ORDER[0], AGENT_ORDER[3]].sort().join("-"),
  });

  return (
    <>
      {/* Soil gradient base */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: soilTop,
          height: soilHeight,
          background: "linear-gradient(180deg, rgba(40,30,20,0.5) 0%, rgba(30,20,12,0.7) 40%, rgba(25,18,10,0.8) 100%)",
        }}
      />

      {/* Soil texture — tiny grain dots */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: soilTop,
          height: soilHeight,
          backgroundImage: `
            radial-gradient(circle 0.5px, rgba(80,60,40,0.15) 0%, transparent 100%),
            radial-gradient(circle 0.5px, rgba(80,60,40,0.1) 0%, transparent 100%)
          `,
          backgroundSize: "12px 8px, 18px 12px",
          backgroundPosition: "0 0, 6px 4px",
        }}
      />

      {/* Top edge — soil meets biome */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: soilTop - 2,
          height: 4,
          background: "linear-gradient(180deg, transparent, rgba(40,30,20,0.3), rgba(40,30,20,0.5))",
        }}
      />

      {/* Root network SVG */}
      {containerWidth > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none"
          width={containerWidth}
          height={containerHeight}
        >
          <defs>
            {rootPaths.map((r) => (
              <linearGradient key={`grad-${r.key}`} id={`root-grad-${r.key}`}>
                <stop offset="0%" stopColor={r.color1} />
                <stop offset="100%" stopColor={r.color2} />
              </linearGradient>
            ))}
          </defs>

          {rootPaths.map((r) => (
            <path
              key={r.key}
              d={r.path}
              fill="none"
              stroke={`url(#root-grad-${r.key})`}
              strokeWidth={1.5}
              opacity={activeRoots.has(r.key) ? 0.55 : 0.15}
              style={{ transition: "opacity 0.4s ease" }}
            />
          ))}

          {/* Root nodes at each agent center */}
          {agentCenters.map((cx, i) => (
            <circle
              key={i}
              cx={cx}
              cy={rootY}
              r={3}
              fill={AGENT_HEX[AGENT_ORDER[i]]}
              opacity={0.3}
            />
          ))}
        </svg>
      )}

      {/* Mushrooms / sprouts at biome boundaries */}
      {[1, 2, 3].map((i) => {
        const x = i * 25;
        return (
          <div key={i} className="absolute pointer-events-none" style={{ left: `${x}%`, top: soilTop - 6, transform: "translateX(-50%)" }}>
            {/* Mushroom cap */}
            <div style={{
              width: 8, height: 5,
              background: "rgba(180,140,100,0.25)",
              borderRadius: "50% 50% 20% 20%",
              marginBottom: -1,
            }} />
            {/* Stem */}
            <div style={{
              width: 2, height: 6, margin: "0 auto",
              background: "rgba(160,120,80,0.2)",
              borderRadius: 1,
            }} />
          </div>
        );
      })}
    </>
  );
}
