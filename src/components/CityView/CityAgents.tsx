// CityAgents.tsx — Tiny agent characters walking the city streets

import { motion } from "framer-motion";

interface CityAgent {
  id: string;
  name: string;
  color: string;
  status: string;
}

interface CityAgentsProps {
  agents: CityAgent[];
  cityWidth: number;
}

// Fixed agent colors map
const AGENT_COLORS: Record<string, string> = {
  kaze: "#3b82f6",
  scout: "#22c55e",
  forge: "#f97316",
  ghost: "#a855f7",
};

// Patrol paths for each agent in the city (waypoints as % of cityWidth)
const PATROL_ROUTES = [
  [
    { x: 0.1, y: 160 },
    { x: 0.5, y: 160 },
    { x: 0.5, y: 320 },
    { x: 0.1, y: 320 },
  ],
  [
    { x: 0.9, y: 200 },
    { x: 0.4, y: 200 },
    { x: 0.4, y: 380 },
    { x: 0.9, y: 380 },
  ],
  [
    { x: 0.2, y: 480 },
    { x: 0.7, y: 480 },
    { x: 0.7, y: 640 },
    { x: 0.2, y: 640 },
  ],
  [
    { x: 0.6, y: 560 },
    { x: 0.15, y: 560 },
    { x: 0.15, y: 720 },
    { x: 0.6, y: 720 },
  ],
];

function TinyAgent({ agent, route, cityWidth, agentIndex }: {
  agent: CityAgent;
  route: { x: number; y: number }[];
  cityWidth: number;
  agentIndex: number;
}) {
  const color = AGENT_COLORS[agent.name.toLowerCase()] ?? "#60a5fa";
  const isActive = agent.status === "working" || agent.status === "online";

  // Build x/y keyframe arrays from route
  const xs = route.map((pt) => pt.x * cityWidth);
  const ys = route.map((pt) => pt.y);
  // Close the loop
  xs.push(xs[0]);
  ys.push(ys[0]);

  const stepDuration = 4;
  const totalDuration = stepDuration * route.length;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ zIndex: 500 }}
      animate={{ x: xs, y: ys }}
      transition={{
        duration: totalDuration,
        repeat: Infinity,
        ease: "linear",
        delay: agentIndex * 2.5,
        times: xs.map((_, i) => i / (xs.length - 1)),
      }}
    >
      {/* Agent figure at 0.25x scale */}
      <motion.div
        animate={isActive ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ marginLeft: -6, marginTop: -18 }}
      >
        {/* Body */}
        <svg width="12" height="20" viewBox="0 0 12 20">
          {/* Head */}
          <circle cx="6" cy="3" r="3" fill={color} opacity={0.9} />
          {/* Body */}
          <rect x="3" y="6" width="6" height="8" rx="1" fill={color} opacity={0.8} />
          {/* Left leg */}
          <rect x="3" y="14" width="2.5" height="5" rx="1" fill={color} opacity={0.7} />
          {/* Right leg */}
          <rect x="6.5" y="14" width="2.5" height="5" rx="1" fill={color} opacity={0.7} />
          {/* Glow */}
          <circle cx="6" cy="3" r="3" fill={color} opacity={0.4}>
            <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* Name label */}
        <div
          className="font-mono text-center"
          style={{
            fontSize: 6,
            color,
            textShadow: `0 0 4px ${color}`,
            marginTop: 1,
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}
        >
          {agent.name.toUpperCase()}
        </div>

        {/* Status dot */}
        {isActive && (
          <div
            className="absolute"
            style={{
              top: -2,
              right: -2,
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 6px #22c55e",
              animation: "pulse-glow 1s ease-in-out infinite",
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

export function CityAgents({ agents, cityWidth }: CityAgentsProps) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 100 }}>
      {agents.map((agent, i) => (
        <TinyAgent
          key={agent.id}
          agent={agent}
          route={PATROL_ROUTES[i % PATROL_ROUTES.length]}
          cityWidth={cityWidth}
          agentIndex={i}
        />
      ))}
    </div>
  );
}
