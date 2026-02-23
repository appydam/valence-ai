import { motion } from "framer-motion";
import { ScreenPosition } from "./worldConfig";

interface ProgressRingProps {
  progress: number;
  screenPosition: ScreenPosition;
  agentColor: string;
}

export function ProgressRing({ progress, screenPosition, agentColor }: ProgressRingProps) {
  const s = screenPosition.scale;
  const size = 26 * s;
  const strokeWidth = 2 * s;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));
  const cx = size / 2;
  const cy = size / 2;

  // Compute position of arc endpoint for the glow dot
  const angle = -90 + progress * 360;
  const rad = (angle * Math.PI) / 180;
  const dotX = cx + radius * Math.cos(rad);
  const dotY = cy + radius * Math.sin(rad);

  // Tick marks
  const tickCount = 12;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: screenPosition.sx - size / 2,
        top: screenPosition.sy - 95 * s,
        width: size,
        height: size,
        zIndex: screenPosition.zIndex + 3,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer tick mark ring */}
        {Array.from({ length: tickCount }, (_, i) => {
          const tickAngle = (i / tickCount) * 360 - 90;
          const tickRad = (tickAngle * Math.PI) / 180;
          const outerR = radius + strokeWidth + 1.5 * s;
          const innerR = radius + strokeWidth + 0.5 * s;
          return (
            <line
              key={i}
              x1={cx + innerR * Math.cos(tickRad)}
              y1={cy + innerR * Math.sin(tickRad)}
              x2={cx + outerR * Math.cos(tickRad)}
              y2={cy + outerR * Math.sin(tickRad)}
              stroke={`hsl(var(--agent-${agentColor}) / 0.2)`}
              strokeWidth={0.5}
            />
          );
        })}

        {/* Background ring — dashed */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={`hsl(var(--agent-${agentColor}) / 0.12)`}
          strokeWidth={strokeWidth}
          strokeDasharray={`${2 * s} ${2 * s}`}
        />

        {/* Progress arc */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={`hsl(var(--agent-${agentColor}))`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            filter: `drop-shadow(0 0 4px hsl(var(--agent-${agentColor}) / 0.6))`,
          }}
        />

        {/* Glowing dot at arc endpoint */}
        {progress > 0.02 && (
          <circle
            cx={dotX}
            cy={dotY}
            r={2 * s}
            fill={`hsl(var(--agent-${agentColor}))`}
            style={{
              filter: `drop-shadow(0 0 4px hsl(var(--agent-${agentColor}))) drop-shadow(0 0 8px hsl(var(--agent-${agentColor}) / 0.4))`,
            }}
          >
            <animate attributeName="r" values={`${1.5 * s};${2.5 * s};${1.5 * s}`} dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>

      {/* Percentage text */}
      <div
        className="absolute inset-0 flex items-center justify-center font-mono"
        style={{
          fontSize: `${Math.max(6, 7 * s)}px`,
          color: `hsl(var(--agent-${agentColor}) / 0.9)`,
          textShadow: `0 0 4px hsl(var(--agent-${agentColor}) / 0.3)`,
        }}
      >
        {Math.round(progress * 100)}
      </div>
    </motion.div>
  );
}
