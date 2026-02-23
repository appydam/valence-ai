import { useCurrentFrame, interpolate, spring } from "remotion";

interface AgentCardProps {
  name: string;
  emoji: string;
  role: string;
  color: string;
  glowColor: string;
  delayFrames?: number;
  status?: "online" | "working" | "idle";
}

export const AgentCard = ({
  name,
  emoji,
  role,
  color,
  glowColor,
  delayFrames = 0,
  status = "working",
}: AgentCardProps) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delayFrames);

  const scale = spring({
    fps: 30,
    frame: localFrame,
    config: { damping: 14, stiffness: 120, mass: 1 },
    from: 0,
    to: 1,
  });

  const opacity = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const floatY = Math.sin((frame + delayFrames * 7) * 0.04) * 6;

  const statusColors: Record<string, string> = {
    online: "#22C55E",
    working: "#F59E0B",
    idle: "#6B7C96",
  };
  const statusLabels: Record<string, string> = {
    online: "Online",
    working: "Working",
    idle: "Idle",
  };

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale}) translateY(${floatY}px)`,
        width: 340,
        backgroundColor: "#0F1622",
        border: `1px solid ${color}30`,
        borderRadius: 16,
        padding: 28,
        boxShadow: `0 0 40px ${glowColor}30, 0 8px 32px rgba(0,0,0,0.4)`,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Emoji icon box */}
      <div style={{
        width: 72,
        height: 72,
        borderRadius: 14,
        backgroundColor: `${color}15`,
        border: `1px solid ${color}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 36,
        boxShadow: `0 0 20px ${glowColor}25`,
      }}>
        {emoji}
      </div>

      {/* Name + status */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#FFFFFF" }}>{name}</div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          backgroundColor: `${statusColors[status]}15`,
          border: `1px solid ${statusColors[status]}40`,
          borderRadius: 100,
          padding: "3px 10px",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            backgroundColor: statusColors[status],
          }} />
          <div style={{ fontSize: 11, fontWeight: 600, color: statusColors[status] }}>
            {statusLabels[status]}
          </div>
        </div>
      </div>

      {/* Role */}
      <div style={{ fontSize: 14, color: "#6B7C96", lineHeight: 1.5 }}>{role}</div>

      {/* Color accent bar */}
      <div style={{
        height: 2,
        borderRadius: 2,
        background: `linear-gradient(90deg, ${color}, transparent)`,
        opacity: 0.6,
      }} />
    </div>
  );
};
