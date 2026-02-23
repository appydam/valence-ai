import { motion } from "framer-motion";
import { AgentName, AgentStatus, AGENT_CONFIG } from "@/types/mission";
import { AgentSVG } from "./AgentSVG";
import { ScreenPosition, MovementState, worldToScreen, WorldPosition } from "./worldConfig";

interface AgentFigureProps {
  name: AgentName;
  status: AgentStatus;
  isSelected: boolean;
  onClick: () => void;
  tasksCompleted: number;
  currentPosition: WorldPosition;
  targetPosition: WorldPosition;
  movementState: MovementState;
  facingDirection: "left" | "right";
  walkDuration: number;
  isMoving: boolean;
  containerWidth: number;
  containerHeight: number;
}

const CHARACTER_BASE_WIDTH = 100;

export function AgentFigure({
  name,
  status,
  isSelected,
  onClick,
  tasksCompleted,
  currentPosition,
  targetPosition,
  movementState,
  facingDirection,
  walkDuration,
  isMoving,
  containerWidth,
  containerHeight,
}: AgentFigureProps) {
  const config = AGENT_CONFIG[name];
  const color = config.color;
  const isWorking = status === "working" || status === "online";
  const isOffline = movementState === "offline";

  const pos = isMoving ? targetPosition : currentPosition;
  const screen = worldToScreen(pos.wx, pos.wy, containerWidth, containerHeight);
  const characterWidth = CHARACTER_BASE_WIDTH * screen.scale;
  const characterHeight = characterWidth * 1.6;
  const s = screen.scale;

  const left = screen.sx - characterWidth / 2;
  const top = screen.sy - characterHeight;

  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      onClick={onClick}
      animate={{ left, top, width: characterWidth, height: characterHeight }}
      transition={{
        type: "tween",
        duration: isMoving ? walkDuration / 1000 : 0.3,
        ease: "easeInOut",
      }}
      style={{ zIndex: screen.zIndex }}
    >
      {/* Status indicator with neon glow */}
      <motion.div
        className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1"
        animate={{ opacity: isSelected ? 1 : 0.6 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className={isWorking ? "animate-pulse-glow" : ""}
          style={{
            width: 6 * s,
            height: 6 * s,
            borderRadius: "50%",
            backgroundColor: `hsl(var(--status-${status}))`,
            boxShadow: isWorking
              ? `0 0 4px hsl(var(--status-${status})), 0 0 10px hsl(var(--status-${status}) / 0.5), 0 0 20px hsl(var(--status-${status}) / 0.2)`
              : `0 0 4px hsl(var(--status-${status}) / 0.3)`,
          }}
        />
        <span
          className="font-mono uppercase tracking-widest"
          style={{
            fontSize: `${Math.max(7, 9 * s)}px`,
            color: `hsl(var(--status-${status}))`,
            textShadow: `0 0 6px hsl(var(--status-${status}) / 0.4)`,
            opacity: 0.9,
          }}
        >
          {status}
        </span>
      </motion.div>

      {/* Character wrapper — facing, opacity, glow */}
      <motion.div
        className="w-full h-full relative"
        animate={{
          scaleX: facingDirection === "left" ? -1 : 1,
          opacity: isOffline ? 0.2 : isSelected ? 1 : 0.75,
          filter: isSelected
            ? `drop-shadow(0 0 8px hsl(var(--agent-${color}) / 0.7)) drop-shadow(0 0 24px hsl(var(--agent-${color}) / 0.35)) drop-shadow(0 0 48px hsl(var(--agent-${color}) / 0.12))`
            : `drop-shadow(0 0 6px hsl(var(--agent-${color}) / 0.25))`,
        }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
      >
        {/* Walk bob + idle float */}
        <motion.div
          className="w-full h-full"
          animate={
            movementState === "walking"
              ? { y: [0, -6, 0], rotate: [0, -1.5, 0, 1.5, 0] }
              : {
                  y: [0, movementState === "working" ? -2 : movementState === "idle" ? -4 : -1, 0],
                  scaleY: [1, 1.006, 1],
                }
          }
          transition={
            movementState === "walking"
              ? { duration: 0.45, repeat: Infinity, ease: "easeInOut" }
              : {
                  duration: name === "Ghost" ? 5 : name === "Scout" ? 3.5 : 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: name === "Scout" ? 0.8 : name === "Forge" ? 1.6 : name === "Ghost" ? 2.4 : 0,
                }
          }
          style={{ transformOrigin: "bottom center" }}
        >
          <AgentSVG name={name} color={color} status={status} />
        </motion.div>

        {/* Scanning beam — selected agent only */}
        {isSelected && !isOffline && (
          <div
            className="absolute left-[15%] right-[15%] h-[1px] animate-scan-sweep pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, hsl(var(--agent-${color}) / 0.2), transparent)`,
              boxShadow: `0 0 8px hsl(var(--agent-${color}) / 0.15)`,
            }}
          />
        )}

        {/* Aura glow for working + selected */}
        {isWorking && isSelected && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="absolute inset-[-12px] rounded-full opacity-25 animate-pulse-glow"
              style={{
                background: `radial-gradient(ellipse, hsl(var(--agent-${color}) / 0.25) 0%, transparent 70%)`,
              }}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Neon name plate */}
      <motion.div
        className="absolute left-1/2 text-center whitespace-nowrap"
        style={{
          bottom: -22 * s,
          transform: `translateX(-50%) scaleX(${facingDirection === "left" ? -1 : 1})`,
        }}
        animate={{ opacity: isSelected ? 1 : 0.5 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="font-bold tracking-wider uppercase"
          style={{
            fontSize: `${Math.max(9, 11 * s)}px`,
            color: isSelected ? `hsl(var(--agent-${color}))` : "hsl(var(--muted-foreground))",
            textShadow: isSelected
              ? `0 0 10px hsl(var(--agent-${color}) / 0.6), 0 0 30px hsl(var(--agent-${color}) / 0.2)`
              : "none",
            letterSpacing: "0.14em",
          }}
        >
          {name}
        </div>
        <div
          className="font-mono"
          style={{
            fontSize: `${Math.max(7, 8 * s)}px`,
            color: `hsl(var(--agent-${color}) / 0.5)`,
            textShadow: isSelected
              ? `0 0 6px hsl(var(--agent-${color}) / 0.3)`
              : "none",
          }}
        >
          {config.role}
        </div>
        {/* Shimmer underline */}
        {isSelected && (
          <div
            className="mx-auto mt-1 overflow-hidden rounded-full"
            style={{ width: 40 * s, height: 1.5 }}
          >
            <div
              className="w-full h-full animate-hud-shimmer"
              style={{
                backgroundImage: `linear-gradient(90deg, transparent, hsl(var(--agent-${color}) / 0.6), transparent)`,
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
