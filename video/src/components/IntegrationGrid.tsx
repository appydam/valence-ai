import { useCurrentFrame, interpolate, spring } from "remotion";

const INTEGRATIONS = [
  { name: "GitHub", emoji: "🐙", color: "#FFFFFF" },
  { name: "Slack", emoji: "💬", color: "#E01E5A" },
  { name: "Jira", emoji: "📋", color: "#0052CC" },
  { name: "Salesforce", emoji: "☁️", color: "#00A1E0" },
  { name: "Intercom", emoji: "💬", color: "#1F8DED" },
  { name: "Stripe", emoji: "💳", color: "#635BFF" },
  { name: "Linear", emoji: "◆", color: "#5E6AD2" },
  { name: "Notion", emoji: "📝", color: "#FFFFFF" },
  { name: "HubSpot", emoji: "🎯", color: "#FF7A59" },
  { name: "Vercel", emoji: "▲", color: "#FFFFFF" },
  { name: "SendGrid", emoji: "📧", color: "#1A82E2" },
  { name: "Twilio", emoji: "📱", color: "#F22F46" },
];

const IntegrationTile = ({
  name,
  emoji,
  color,
  delayFrames,
  connected,
}: {
  name: string;
  emoji: string;
  color: string;
  delayFrames: number;
  connected?: boolean;
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delayFrames);

  const scale = spring({
    fps: 30,
    frame: localFrame,
    config: { damping: 12, stiffness: 180 },
    from: 0,
    to: 1,
  });

  const opacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  const badgeOpacity = interpolate(
    Math.max(0, frame - delayFrames - 30),
    [0, 20],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  return (
    <div style={{
      backgroundColor: "#0F1622",
      border: `1px solid ${connected ? "#10B98140" : "#232D3F"}`,
      borderRadius: 12,
      padding: "16px 12px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      opacity,
      transform: `scale(${scale})`,
      position: "relative",
      boxShadow: connected ? "0 0 20px rgba(16,185,129,0.1)" : "none",
    }}>
      <div style={{ fontSize: 28 }}>{emoji}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#FFFFFF" }}>{name}</div>
      {connected && (
        <div style={{
          opacity: badgeOpacity,
          display: "flex",
          alignItems: "center",
          gap: 4,
          backgroundColor: "#10B98115",
          border: "1px solid #10B98130",
          borderRadius: 100,
          padding: "2px 7px",
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#10B981" }} />
          <div style={{ fontSize: 9, fontWeight: 700, color: "#10B981" }}>Connected</div>
        </div>
      )}
    </div>
  );
};

export const IntegrationGrid = () => {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gap: 12,
      padding: "16px",
    }}>
      {INTEGRATIONS.map((integration, idx) => (
        <IntegrationTile
          key={integration.name}
          {...integration}
          delayFrames={idx * 8}
          connected={idx < 5}
        />
      ))}
    </div>
  );
};
