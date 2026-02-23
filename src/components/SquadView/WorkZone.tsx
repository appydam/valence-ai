import { motion } from "framer-motion";
import { WorkZone as WorkZoneType, worldToScreen } from "./worldConfig";

interface WorkZoneProps {
  zone: WorkZoneType;
  containerWidth: number;
  containerHeight: number;
  isActive: boolean;
  isHighlighted: boolean;
}

export function WorkZone({ zone, containerWidth, containerHeight, isActive, isHighlighted }: WorkZoneProps) {
  const screen = worldToScreen(zone.wx, zone.wy, containerWidth, containerHeight);
  const zoneWidth = zone.width * screen.scale * 0.7;
  const zoneHeight = zone.height * screen.scale * 0.35;
  const fontSize = Math.max(9, 12 * screen.scale);
  const visible = isActive || isHighlighted;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: screen.sx - zoneWidth / 2,
        top: screen.sy - zoneHeight / 2,
        width: zoneWidth,
        height: zoneHeight,
        zIndex: screen.zIndex - 2,
      }}
      animate={{
        opacity: visible ? 1 : 0.85,
      }}
      transition={{ duration: 0.5 }}
    >
      {/* Outer force field border */}
      <motion.div
        className={`absolute inset-0 rounded-md ${isActive ? "animate-neon-flicker" : ""}`}
        animate={{
          boxShadow: isActive
            ? `inset 0 0 30px hsl(var(--agent-${zone.color}) / 0.25), 0 0 24px hsl(var(--agent-${zone.color}) / 0.35), 0 0 60px hsl(var(--agent-${zone.color}) / 0.12)`
            : `inset 0 0 10px hsl(var(--agent-${zone.color}) / 0.05), 0 0 8px hsl(var(--agent-${zone.color}) / 0.08)`,
        }}
        transition={{ duration: 0.5 }}
        style={{
          border: `1px solid hsl(var(--agent-${zone.color}) / ${isActive ? 0.85 : 0.35})`,
        }}
      />

      {/* Inner border line (double-border effect) */}
      <div
        className="absolute rounded-sm"
        style={{
          left: 3,
          top: 3,
          right: 3,
          bottom: 3,
          border: `1px solid hsl(var(--agent-${zone.color}) / ${isActive ? 0.4 : 0.18})`,
        }}
      />

      {/* Circuit floor pattern */}
      <div
        className={`absolute inset-0 rounded-md ${isActive ? "animate-zone-pulse" : ""}`}
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--agent-${zone.color}) / ${isActive ? 0.18 : 0.08}) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--agent-${zone.color}) / ${isActive ? 0.18 : 0.08}) 1px, transparent 1px)
          `,
          backgroundSize: "18px 18px",
          opacity: isActive ? 1 : 0.7,
        }}
      />

      {/* Zone fill */}
      <motion.div
        className="absolute inset-0 rounded-md"
        animate={{
          backgroundColor: isActive
            ? `hsl(var(--agent-${zone.color}) / 0.14)`
            : `hsl(var(--agent-${zone.color}) / 0.05)`,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Holographic zone label with HUD brackets */}
      <div
        className={`absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap ${isActive ? "animate-neon-flicker" : ""}`}
        style={{
          fontSize: `${fontSize}px`,
          color: `hsl(var(--agent-${zone.color}) / ${isActive ? 1 : 0.75})`,
          letterSpacing: "0.12em",
          fontFamily: "var(--font-mono, monospace)",
          textTransform: "uppercase",
          textShadow: isActive
            ? `0 0 10px hsl(var(--agent-${zone.color}) / 0.9), 0 0 30px hsl(var(--agent-${zone.color}) / 0.4)`
            : `0 0 6px hsl(var(--agent-${zone.color}) / 0.4)`,
        }}
      >
        <span style={{ opacity: isActive ? 0.8 : 0.6 }}>[ </span>
        {zone.label}
        <span style={{ opacity: isActive ? 0.8 : 0.6 }}> ]</span>
      </div>

      {/* Zone description (below label, smaller) */}
      {isActive && (
        <motion.div
          className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          style={{
            fontSize: `${Math.max(6, 7 * screen.scale)}px`,
            color: `hsl(var(--agent-${zone.color}))`,
            fontFamily: "var(--font-mono, monospace)",
            letterSpacing: "0.08em",
          }}
        >
          {zone.description}
        </motion.div>
      )}

      {/* Active pulse dot + signal rings */}
      {isActive && (
        <>
          <motion.div
            className="absolute -top-2 right-3 w-2 h-2 rounded-full"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              backgroundColor: `hsl(var(--agent-${zone.color}))`,
              boxShadow: `0 0 6px hsl(var(--agent-${zone.color}) / 0.6), 0 0 12px hsl(var(--agent-${zone.color}) / 0.3)`,
            }}
          />
          {/* Signal ring expanding from dot */}
          <div
            className="absolute -top-1 right-4 w-0.5 h-0.5 rounded-full animate-signal-ring"
            style={{
              border: `1px solid hsl(var(--agent-${zone.color}) / 0.3)`,
            }}
          />
        </>
      )}

      {/* Corner accent marks (HUD style) */}
      {visible && (
        <>
          {/* Top-left */}
          <div
            className="absolute"
            style={{
              top: -1,
              left: -1,
              width: 10 * screen.scale,
              height: 1,
              backgroundColor: `hsl(var(--agent-${zone.color}) / ${isActive ? 0.9 : 0.5})`,
              boxShadow: isActive ? `0 0 4px hsl(var(--agent-${zone.color}) / 0.3)` : "none",
            }}
          />
          <div
            className="absolute"
            style={{
              top: -1,
              left: -1,
              width: 1,
              height: 10 * screen.scale,
              backgroundColor: `hsl(var(--agent-${zone.color}) / ${isActive ? 0.9 : 0.5})`,
              boxShadow: isActive ? `0 0 4px hsl(var(--agent-${zone.color}) / 0.3)` : "none",
            }}
          />
          {/* Top-right */}
          <div
            className="absolute"
            style={{
              top: -1,
              right: -1,
              width: 10 * screen.scale,
              height: 1,
              backgroundColor: `hsl(var(--agent-${zone.color}) / ${isActive ? 0.9 : 0.5})`,
            }}
          />
          <div
            className="absolute"
            style={{
              top: -1,
              right: -1,
              width: 1,
              height: 10 * screen.scale,
              backgroundColor: `hsl(var(--agent-${zone.color}) / ${isActive ? 0.9 : 0.5})`,
            }}
          />
          {/* Bottom-left */}
          <div
            className="absolute"
            style={{
              bottom: -1,
              left: -1,
              width: 10 * screen.scale,
              height: 1,
              backgroundColor: `hsl(var(--agent-${zone.color}) / ${isActive ? 0.9 : 0.5})`,
            }}
          />
          <div
            className="absolute"
            style={{
              bottom: -1,
              left: -1,
              width: 1,
              height: 10 * screen.scale,
              backgroundColor: `hsl(var(--agent-${zone.color}) / ${isActive ? 0.9 : 0.5})`,
            }}
          />
          {/* Bottom-right */}
          <div
            className="absolute"
            style={{
              bottom: -1,
              right: -1,
              width: 10 * screen.scale,
              height: 1,
              backgroundColor: `hsl(var(--agent-${zone.color}) / ${isActive ? 0.9 : 0.5})`,
            }}
          />
          <div
            className="absolute"
            style={{
              bottom: -1,
              right: -1,
              width: 1,
              height: 10 * screen.scale,
              backgroundColor: `hsl(var(--agent-${zone.color}) / ${isActive ? 0.9 : 0.5})`,
            }}
          />
        </>
      )}
    </motion.div>
  );
}
