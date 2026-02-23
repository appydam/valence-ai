import { motion } from "framer-motion";
import { ScreenPosition } from "./worldConfig";

interface DataStreamProps {
  fromScreen: ScreenPosition;
  toScreen: ScreenPosition;
  agentColorA: string;
  agentColorB: string;
}

export function DataStream({ fromScreen, toScreen, agentColorA }: DataStreamProps) {
  const x1 = fromScreen.sx;
  const y1 = fromScreen.sy - 30;
  const x2 = toScreen.sx;
  const y2 = toScreen.sy - 30;

  // Compute a slight upward arc
  const midX = (x1 + x2) / 2;
  const midY = Math.min(y1, y2) - 25;
  const curvePath = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        width: "100%",
        height: "100%",
        zIndex: Math.min(fromScreen.zIndex, toScreen.zIndex) - 1,
        overflow: "visible",
      }}
    >
      {/* Outer faint line (top) */}
      <motion.path
        d={curvePath}
        fill="none"
        stroke={`hsl(var(--agent-${agentColorA}) / 0.08)`}
        strokeWidth="0.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ transform: "translateY(-2px)" }}
      />

      {/* Center line — bright with glow */}
      <motion.path
        d={curvePath}
        fill="none"
        stroke={`hsl(var(--agent-${agentColorA}) / 0.25)`}
        strokeWidth="1.5"
        strokeDasharray="8 4"
        initial={{ pathLength: 0 }}
        animate={{
          pathLength: 1,
          strokeDashoffset: [0, -24],
        }}
        transition={{
          pathLength: { duration: 1, ease: "easeOut" },
          strokeDashoffset: { duration: 1.5, repeat: Infinity, ease: "linear" },
        }}
        style={{
          filter: `drop-shadow(0 0 4px hsl(var(--agent-${agentColorA}) / 0.3))`,
        }}
      />

      {/* Outer faint line (bottom) */}
      <motion.path
        d={curvePath}
        fill="none"
        stroke={`hsl(var(--agent-${agentColorA}) / 0.08)`}
        strokeWidth="0.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ transform: "translateY(2px)" }}
      />

      {/* Traveling dot 1 (primary) */}
      <motion.circle
        r="3"
        fill={`hsl(var(--agent-${agentColorA}))`}
        style={{
          filter: `drop-shadow(0 0 6px hsl(var(--agent-${agentColorA}) / 0.7))`,
        }}
        animate={{
          cx: [x1, midX, x2],
          cy: [y1, midY, y2],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
      />

      {/* Traveling dot 2 (delayed, smaller) */}
      <motion.circle
        r="2"
        fill={`hsl(var(--agent-${agentColorA}) / 0.7)`}
        style={{
          filter: `drop-shadow(0 0 3px hsl(var(--agent-${agentColorA}) / 0.5))`,
        }}
        animate={{
          cx: [x1, midX, x2],
          cy: [y1, midY, y2],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: 0.8 }}
      />

      {/* Traveling dot 3 (most delayed, smallest) */}
      <motion.circle
        r="1.5"
        fill={`hsl(var(--agent-${agentColorA}) / 0.5)`}
        animate={{
          cx: [x1, midX, x2],
          cy: [y1, midY, y2],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: 1.6 }}
      />

      {/* Pulse markers along the line */}
      {[0.25, 0.5, 0.75].map((t) => {
        const px = x1 + (x2 - x1) * t;
        const py = y1 + (y2 - y1) * t + (midY - (y1 + y2) / 2) * 4 * t * (1 - t);
        return (
          <circle
            key={t}
            cx={px}
            cy={py}
            r="1"
            fill={`hsl(var(--agent-${agentColorA}) / 0.3)`}
          >
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" begin={`${t}s`} />
          </circle>
        );
      })}
    </svg>
  );
}
