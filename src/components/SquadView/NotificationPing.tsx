import { motion } from "framer-motion";
import { ScreenPosition } from "./worldConfig";

interface NotificationPingProps {
  fromScreen: ScreenPosition;
  toScreen: ScreenPosition;
  agentColor: string;
}

export function NotificationPing({ fromScreen, toScreen, agentColor }: NotificationPingProps) {
  const x1 = fromScreen.sx;
  const y1 = fromScreen.sy - 40;
  const x2 = toScreen.sx;
  const y2 = toScreen.sy - 40;

  const midX = (x1 + x2) / 2;
  const midY = Math.min(y1, y2) - 70;

  // Generate trail positions (interpolated along arc)
  const trailCount = 5;

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{ width: "100%", height: "100%", zIndex: 150, overflow: "visible" }}
    >
      {/* Arc trail glow — builds as dot travels */}
      <motion.path
        d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
        fill="none"
        stroke={`hsl(var(--agent-${agentColor}) / 0.25)`}
        strokeWidth="2"
        style={{ filter: `drop-shadow(0 0 4px hsl(var(--agent-${agentColor}) / 0.3))` }}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Comet trail — 5 trailing circles */}
      {Array.from({ length: trailCount }, (_, i) => {
        const delay = i * 0.06;
        const size = 4 - i * 0.6;
        const opacity = 1 - i * 0.18;

        return (
          <motion.circle
            key={`trail-${i}`}
            r={Math.max(1, size)}
            fill={`hsl(var(--agent-${agentColor}))`}
            opacity={opacity}
            style={{
              filter: i === 0
                ? `drop-shadow(0 0 8px hsl(var(--agent-${agentColor}))) drop-shadow(0 0 16px hsl(var(--agent-${agentColor}) / 0.4))`
                : `drop-shadow(0 0 ${4 - i}px hsl(var(--agent-${agentColor}) / ${0.5 - i * 0.1}))`,
            }}
            initial={{ cx: x1, cy: y1, scale: 0.3, opacity: 0.3 }}
            animate={{
              cx: [x1, midX, x2],
              cy: [y1, midY, y2],
              scale: i === 0 ? [0.5, 1.4, 0.8] : [0.3, 0.8, 0.4],
              opacity: i === 0 ? [0.5, 1, 0.3] : [0.3, opacity, 0.1],
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              delay,
            }}
          />
        );
      })}

      {/* Impact flash at destination */}
      <motion.circle
        cx={x2}
        cy={y2}
        r="3"
        fill="none"
        stroke={`hsl(var(--agent-${agentColor}))`}
        strokeWidth="2"
        style={{ filter: `drop-shadow(0 0 8px hsl(var(--agent-${agentColor})))` }}
        initial={{ r: 0, opacity: 0 }}
        animate={{
          r: [0, 0, 0, 15],
          opacity: [0, 0, 0.8, 0],
          strokeWidth: [2, 2, 2, 0.5],
        }}
        transition={{
          duration: 1.8,
          ease: "easeOut",
          times: [0, 0.75, 0.8, 1],
        }}
      />

      {/* Impact center flash */}
      <motion.circle
        cx={x2}
        cy={y2}
        r="5"
        fill={`hsl(var(--agent-${agentColor}))`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: [0, 0, 0.6, 0],
          scale: [0, 0, 1, 0.5],
        }}
        transition={{
          duration: 1.8,
          ease: "easeOut",
          times: [0, 0.78, 0.85, 1],
        }}
        style={{ filter: `blur(2px)` }}
      />
    </svg>
  );
}
