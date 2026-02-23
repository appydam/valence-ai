import { motion } from "framer-motion";
import { ScreenPosition } from "./worldConfig";

interface SpeechBubbleProps {
  text: string;
  screenPosition: ScreenPosition;
  agentColor: string;
}

export function SpeechBubble({ text, screenPosition, agentColor }: SpeechBubbleProps) {
  const s = screenPosition.scale;
  const maxChars = 55;
  const displayText = text.length > maxChars ? text.slice(0, maxChars) + "..." : text;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: screenPosition.sx - 10 * s,
        top: screenPosition.sy - 130 * s,
        zIndex: screenPosition.zIndex + 10,
      }}
      initial={{ opacity: 0, x: [-3, 2, -1, 0], scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      {/* Angular holographic bubble */}
      <div
        className="relative"
        style={{
          padding: `${6 * s}px ${10 * s}px`,
          background: "rgba(6, 6, 28, 0.9)",
          border: `1px solid hsl(var(--agent-${agentColor}) / 0.4)`,
          maxWidth: 170 * s,
          clipPath: `polygon(
            8px 0%, calc(100% - 8px) 0%,
            100% 8px, 100% calc(100% - 8px),
            calc(100% - 8px) 100%, 8px 100%,
            0% calc(100% - 8px), 0% 8px
          )`,
          boxShadow: `0 0 12px hsl(var(--agent-${agentColor}) / 0.15), inset 0 0 8px hsl(var(--agent-${agentColor}) / 0.05)`,
        }}
      >
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 2px)",
            backgroundSize: "100% 2px",
          }}
        />

        <p
          className="font-mono leading-tight"
          style={{
            fontSize: `${Math.max(7, 8.5 * s)}px`,
            color: `hsl(var(--agent-${agentColor}) / 0.85)`,
            textShadow: `0 0 4px hsl(var(--agent-${agentColor}) / 0.2)`,
          }}
        >
          <span style={{ opacity: 0.5 }}>&gt; </span>
          {displayText}
        </p>
      </div>

      {/* Tail — thin vertical line + dot */}
      <div
        className="absolute"
        style={{
          left: 16 * s,
          bottom: -12 * s,
          width: 1,
          height: 10 * s,
          background: `linear-gradient(to bottom, hsl(var(--agent-${agentColor}) / 0.4), transparent)`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          left: 14.5 * s,
          bottom: -14 * s,
          width: 3 * s,
          height: 3 * s,
          backgroundColor: `hsl(var(--agent-${agentColor}) / 0.5)`,
          boxShadow: `0 0 4px hsl(var(--agent-${agentColor}) / 0.3)`,
        }}
      />
    </motion.div>
  );
}
