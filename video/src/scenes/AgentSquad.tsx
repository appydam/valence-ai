import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Background } from "../components/Background";
import { AgentCard } from "../components/AgentCard";

const AGENTS = [
  {
    name: "Kaze",
    emoji: "🌀",
    role: "Chief of Staff — Orchestrates, delegates, reviews",
    color: "#3B82F6",
    glowColor: "rgba(59,130,246,0.4)",
    status: "working" as const,
    delayFrames: 0,
  },
  {
    name: "Scout",
    emoji: "🔭",
    role: "Market Intelligence — Research & analysis",
    color: "#10B981",
    glowColor: "rgba(16,185,129,0.4)",
    status: "working" as const,
    delayFrames: 40,
  },
  {
    name: "Forge",
    emoji: "🔨",
    role: "Engineer — Code, APIs & technical execution",
    color: "#F59E0B",
    glowColor: "rgba(245,158,11,0.4)",
    status: "online" as const,
    delayFrames: 80,
  },
  {
    name: "Ghost",
    emoji: "👻",
    role: "Content & Distribution — Write, message, publish",
    color: "#A78BFA",
    glowColor: "rgba(167,139,250,0.4)",
    status: "idle" as const,
    delayFrames: 120,
  },
];

export const AgentSquad = () => {
  const frame = useCurrentFrame();

  const headingOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const headingY = interpolate(frame, [0, 25], [-20, 0], { extrapolateRight: "clamp" });

  const subtitleOpacity = interpolate(frame, [20, 50], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <Background variant="default" />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        padding: "0 80px",
      }}>
        {/* Heading */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            opacity: headingOpacity,
            transform: `translateY(${headingY}px)`,
            fontSize: 48,
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "-0.03em",
            marginBottom: 12,
          }}>
            Your AI Squad
          </div>
          <div style={{
            opacity: subtitleOpacity,
            fontSize: 18,
            color: "#6B7C96",
            fontWeight: 400,
          }}>
            Four specialized agents. One unified mission.
          </div>
        </div>

        {/* Agent cards row */}
        <div style={{
          display: "flex",
          gap: 24,
          justifyContent: "center",
        }}>
          {AGENTS.map((agent) => (
            <AgentCard key={agent.name} {...agent} />
          ))}
        </div>

        {/* Coordination visual: connecting lines (simplified) */}
        <div style={{
          opacity: interpolate(frame, [160, 200], [0, 1], { extrapolateRight: "clamp" }),
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "#0F1622",
          border: "1px solid #232D3F",
          borderRadius: 100,
          padding: "10px 24px",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10B981" }} />
          <div style={{ fontSize: 13, color: "#6B7C96", fontWeight: 500 }}>
            Coordinating in real-time across{" "}
            <span style={{ color: "#FFFFFF", fontWeight: 700 }}>100+ integrations</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
