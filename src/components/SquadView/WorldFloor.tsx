import { motion } from "framer-motion";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { AgentMovementState, worldToScreen } from "./worldConfig";

interface WorldFloorProps {
  agentPositions: AgentMovementState[];
  containerWidth: number;
  containerHeight: number;
}

export function WorldFloor({ agentPositions, containerWidth, containerHeight }: WorldFloorProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Layer 1: Primary neon grid — cyan tinted, brighter than before */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "75%",
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.18) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          transform: "perspective(600px) rotateX(58deg)",
          transformOrigin: "top center",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 8%, rgba(0,0,0,1) 35%, rgba(0,0,0,0.8) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 8%, rgba(0,0,0,1) 35%, rgba(0,0,0,0.8) 100%)",
        }}
      />

      {/* Layer 2: Accent grid — half spacing, subtler, different tint */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "75%",
          backgroundImage: `
            linear-gradient(rgba(100, 200, 255, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 200, 255, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: "30px 30px",
          transform: "perspective(600px) rotateX(58deg)",
          transformOrigin: "top center",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 10%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.3) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 10%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* Layer 3: Radial energy pulse — breathing from center */}
      <div
        className="absolute bottom-0 left-0 right-0 animate-floor-pulse"
        style={{
          height: "75%",
          background:
            "radial-gradient(circle at 50% 40%, rgba(0, 255, 255, 0.12) 0%, rgba(0, 150, 255, 0.06) 30%, transparent 60%)",
          transform: "perspective(600px) rotateX(58deg)",
          transformOrigin: "top center",
        }}
      />

      {/* Layer 4: Horizon glow line — bright with box-shadow */}
      <div
        className="absolute left-0 right-0 pointer-events-none animate-ground-pulse"
        style={{
          top: "24%",
          height: "2px",
          background:
            "linear-gradient(to right, transparent, rgba(0, 255, 255, 0.5) 15%, rgba(0, 220, 255, 0.7) 50%, rgba(0, 255, 255, 0.5) 85%, transparent)",
          boxShadow:
            "0 0 20px rgba(0, 255, 255, 0.3), 0 0 60px rgba(0, 255, 255, 0.12), 0 -1px 0 rgba(0, 255, 255, 0.2)",
        }}
      />

      {/* Layer 5: Per-agent holographic platforms */}
      {containerWidth > 0 &&
        agentPositions.map((agent) => {
          const pos = agent.isMoving ? agent.targetPosition : agent.currentPosition;
          const screen = worldToScreen(pos.wx, pos.wy, containerWidth, containerHeight);
          const config = AGENT_CONFIG[agent.name];
          const isActive = agent.movementState !== "offline";
          const s = screen.scale;

          return (
            <div key={`platform-${agent.name}`}>
              {/* Outer rotating dashed ring */}
              <motion.div
                className="absolute rounded-full animate-ring-rotate"
                animate={{
                  left: screen.sx - 30 * s,
                  top: screen.sy - 5 * s,
                  width: 60 * s,
                  height: 12 * s,
                  opacity: isActive ? 0.3 : 0.05,
                }}
                transition={{
                  type: "tween",
                  duration: agent.isMoving ? agent.walkDuration / 1000 : 0.3,
                  ease: "easeInOut",
                }}
                style={{
                  border: `2px dashed hsl(var(--agent-${config.color}) / 0.8)`,
                  zIndex: screen.zIndex - 1,
                }}
              />

              {/* Inner solid base ring */}
              <motion.div
                className="absolute rounded-full"
                animate={{
                  left: screen.sx - 22 * s,
                  top: screen.sy - 4 * s,
                  width: 44 * s,
                  height: 10 * s,
                  opacity: isActive ? 0.85 : 0.25,
                }}
                transition={{
                  type: "tween",
                  duration: agent.isMoving ? agent.walkDuration / 1000 : 0.3,
                  ease: "easeInOut",
                }}
                style={{
                  border: `2px solid hsl(var(--agent-${config.color}) / 0.9)`,
                  background: `radial-gradient(ellipse, hsl(var(--agent-${config.color}) / 0.4) 0%, transparent 70%)`,
                  zIndex: screen.zIndex - 1,
                }}
              />

              {/* Base glow (blurred, large) */}
              <motion.div
                className="absolute rounded-full animate-ground-pulse"
                animate={{
                  left: screen.sx - 45 * s,
                  top: screen.sy - 8,
                  width: 90 * s,
                  height: 18 * s,
                  opacity: isActive ? 0.7 : 0.15,
                }}
                transition={{
                  type: "tween",
                  duration: agent.isMoving ? agent.walkDuration / 1000 : 0.3,
                  ease: "easeInOut",
                }}
                style={{
                  background: `radial-gradient(ellipse, hsl(var(--agent-${config.color}) / 0.8) 0%, transparent 70%)`,
                  filter: "blur(8px)",
                  zIndex: screen.zIndex - 2,
                }}
              />

              {/* Energy expand pulse ring (active agents only) */}
              {isActive && (
                <motion.div
                  className="absolute rounded-full animate-energy-expand"
                  animate={{
                    left: screen.sx - 25 * s,
                    top: screen.sy - 4 * s,
                    width: 50 * s,
                    height: 10 * s,
                  }}
                  transition={{
                    type: "tween",
                    duration: agent.isMoving ? agent.walkDuration / 1000 : 0.3,
                    ease: "easeInOut",
                  }}
                  style={{
                    border: `1px solid hsl(var(--agent-${config.color}) / 0.3)`,
                    zIndex: screen.zIndex - 2,
                  }}
                />
              )}
            </div>
          );
        })}
    </div>
  );
}
