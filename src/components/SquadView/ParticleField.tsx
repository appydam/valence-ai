import { useMemo } from "react";

interface ParticleFieldProps {
  color: string;
}

const AGENT_COLORS = ["kaze", "scout", "forge", "ghost"];

export function ParticleField({ color }: ParticleFieldProps) {
  // Layer 1: Ambient dust — spread across full scene, multi-colored
  const dustParticles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: 2 + Math.random() * 96,
        y: 10 + Math.random() * 80,
        size: 1 + Math.random() * 3,
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 5,
        opacity: 0.15 + Math.random() * 0.35,
        color: i < 24 ? color : AGENT_COLORS[i % 4],
        blur: Math.random() > 0.7,
      })),
    [color]
  );

  // Layer 2: Data fragments — small rotating rectangles
  const dataFragments = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: 8 + Math.random() * 84,
        y: 15 + Math.random() * 70,
        delay: Math.random() * 4,
        duration: 5 + Math.random() * 4,
        opacity: 0.15 + Math.random() * 0.2,
        rotation: Math.random() * 360,
        color: i < 8 ? color : AGENT_COLORS[i % 4],
      })),
    [color]
  );

  // Layer 3: Energy sparks — bright fast tiny dots
  const sparks = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        y: 20 + Math.random() * 60,
        delay: Math.random() * 3,
        duration: 1 + Math.random() * 1.5,
        color: i < 4 ? color : "white",
      })),
    [color]
  );

  // Layer 4: Hex particles — large, slow, very faint
  const hexParticles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        y: 15 + Math.random() * 65,
        delay: Math.random() * 5,
        duration: 7 + Math.random() * 5,
        opacity: 0.05 + Math.random() * 0.06,
      })),
    [color]
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Layer 1: Ambient dust */}
      {dustParticles.map((p) => (
        <div
          key={`dust-${p.id}`}
          className="absolute rounded-full animate-wisp-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor:
              p.color === "white"
                ? "rgba(200, 230, 255, 0.6)"
                : `hsl(var(--agent-${p.color}))`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            boxShadow:
              p.color === "white"
                ? "0 0 3px rgba(200, 230, 255, 0.4)"
                : `0 0 ${p.size * 2}px hsl(var(--agent-${p.color}) / 0.4)`,
            filter: p.blur ? "blur(1px)" : "none",
          }}
        />
      ))}

      {/* Layer 2: Data fragments */}
      {dataFragments.map((p) => (
        <div
          key={`data-${p.id}`}
          className="absolute animate-float-gentle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: 3,
            height: 6,
            backgroundColor: `hsl(var(--agent-${p.color}) / 0.35)`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
            boxShadow: `0 0 4px hsl(var(--agent-${p.color}) / 0.2)`,
            borderRadius: 1,
          }}
        />
      ))}

      {/* Layer 3: Energy sparks */}
      {sparks.map((p) => (
        <div
          key={`spark-${p.id}`}
          className="absolute rounded-full animate-particle-rise"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: 1.5,
            height: 1.5,
            backgroundColor:
              p.color === "white"
                ? "rgba(255, 255, 255, 0.9)"
                : `hsl(var(--agent-${p.color}))`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            boxShadow:
              p.color === "white"
                ? "0 0 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(200, 230, 255, 0.4)"
                : `0 0 4px hsl(var(--agent-${p.color})), 0 0 8px hsl(var(--agent-${p.color}) / 0.5)`,
          }}
        />
      ))}

      {/* Layer 4: Hex particles */}
      {hexParticles.map((p) => (
        <div
          key={`hex-${p.id}`}
          className="absolute animate-wisp-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: 8,
            height: 8,
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            backgroundColor: "rgba(0, 255, 255, 0.15)",
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
