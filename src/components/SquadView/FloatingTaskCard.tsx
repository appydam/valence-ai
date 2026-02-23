import { motion } from "framer-motion";
import { ScreenPosition } from "./worldConfig";

interface FloatingTaskCardProps {
  taskTitle: string;
  taskStatus: string;
  priority: string;
  screenPosition: ScreenPosition;
  agentColor: string;
  onClick: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "var(--priority-urgent)",
  high: "var(--priority-high)",
  medium: "var(--priority-medium)",
  low: "var(--priority-low)",
};

export function FloatingTaskCard({
  taskTitle,
  taskStatus,
  priority,
  screenPosition,
  agentColor,
  onClick,
}: FloatingTaskCardProps) {
  const s = screenPosition.scale;
  const cardWidth = 150 * s;

  return (
    <motion.div
      className="absolute cursor-pointer pointer-events-auto"
      onClick={onClick}
      style={{
        left: screenPosition.sx + 45 * s,
        top: screenPosition.sy - 85 * s,
        width: cardWidth,
        zIndex: screenPosition.zIndex + 5,
      }}
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.05 }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          background: "rgba(6, 6, 28, 0.88)",
          border: `1px solid hsl(var(--agent-${agentColor}) / 0.35)`,
          borderRadius: 4 * s,
          backdropFilter: "blur(10px)",
          padding: `${7 * s}px ${10 * s}px`,
          boxShadow: `0 0 12px hsl(var(--agent-${agentColor}) / 0.1), inset 0 0 15px hsl(var(--agent-${agentColor}) / 0.04)`,
        }}
      >
        {/* HUD corner brackets */}
        <div className="absolute" style={{ top: 2, left: 2, width: 8 * s, height: 1, backgroundColor: `hsl(var(--agent-${agentColor}) / 0.5)` }} />
        <div className="absolute" style={{ top: 2, left: 2, width: 1, height: 8 * s, backgroundColor: `hsl(var(--agent-${agentColor}) / 0.5)` }} />
        <div className="absolute" style={{ top: 2, right: 2, width: 8 * s, height: 1, backgroundColor: `hsl(var(--agent-${agentColor}) / 0.5)` }} />
        <div className="absolute" style={{ top: 2, right: 2, width: 1, height: 8 * s, backgroundColor: `hsl(var(--agent-${agentColor}) / 0.5)` }} />
        <div className="absolute" style={{ bottom: 2, left: 2, width: 8 * s, height: 1, backgroundColor: `hsl(var(--agent-${agentColor}) / 0.5)` }} />
        <div className="absolute" style={{ bottom: 2, left: 2, width: 1, height: 8 * s, backgroundColor: `hsl(var(--agent-${agentColor}) / 0.5)` }} />
        <div className="absolute" style={{ bottom: 2, right: 2, width: 8 * s, height: 1, backgroundColor: `hsl(var(--agent-${agentColor}) / 0.5)` }} />
        <div className="absolute" style={{ bottom: 2, right: 2, width: 1, height: 8 * s, backgroundColor: `hsl(var(--agent-${agentColor}) / 0.5)` }} />

        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 2px)",
            backgroundSize: "100% 2px",
            borderRadius: 4 * s,
          }}
        />

        {/* Priority dot + status */}
        <div className="flex items-center gap-1 mb-1">
          <div
            style={{
              width: 5 * s,
              height: 5 * s,
              borderRadius: "50%",
              backgroundColor: `hsl(${PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium})`,
              boxShadow: `0 0 4px hsl(${PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium} / 0.5)`,
            }}
          />
          <span
            className="font-mono uppercase tracking-wider"
            style={{
              fontSize: `${Math.max(6, 7 * s)}px`,
              color: `hsl(var(--agent-${agentColor}) / 0.8)`,
              textShadow: `0 0 4px hsl(var(--agent-${agentColor}) / 0.3)`,
            }}
          >
            {taskStatus.replace("_", " ")}
          </span>
        </div>

        {/* Task title */}
        <div
          className="font-medium leading-tight"
          style={{
            fontSize: `${Math.max(8, 9 * s)}px`,
            color: "hsl(var(--foreground) / 0.9)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {taskTitle}
        </div>

        {/* Shimmer bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: 2 * s,
            background: `linear-gradient(90deg, transparent, hsl(var(--agent-${agentColor}) / 0.5), transparent)`,
            borderRadius: `0 0 ${4 * s}px ${4 * s}px`,
          }}
          animate={{ x: [-cardWidth, cardWidth] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Glowing connector with pulsing dot */}
      <svg
        className="absolute pointer-events-none"
        style={{ left: -35 * s, top: "50%", width: 40 * s, height: 4, overflow: "visible" }}
      >
        <line
          x1="0" y1="0" x2={35 * s} y2="0"
          stroke={`hsl(var(--agent-${agentColor}) / 0.35)`}
          strokeWidth="1"
          style={{ filter: `drop-shadow(0 0 3px hsl(var(--agent-${agentColor}) / 0.3))` }}
        />
        <circle cx="0" cy="0" r={2 * s} fill={`hsl(var(--agent-${agentColor}) / 0.6)`}>
          <animate attributeName="r" values={`${1.5 * s};${3 * s};${1.5 * s}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </motion.div>
  );
}
