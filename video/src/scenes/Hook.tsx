import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Background } from "../components/Background";

const TOOL_LOGOS = [
  { name: "Slack", emoji: "💬", x: 120, y: 180, vx: -1.2, vy: 0.8 },
  { name: "Jira", emoji: "📋", x: 350, y: 120, vx: 0.9, vy: -0.7 },
  { name: "GitHub", emoji: "🐙", x: 600, y: 250, vx: -0.7, vy: 1.1 },
  { name: "Salesforce", emoji: "☁️", x: 800, y: 100, vx: 1.0, vy: 0.6 },
  { name: "HubSpot", emoji: "🎯", x: 1050, y: 200, vx: -0.8, vy: -0.9 },
  { name: "Linear", emoji: "◆", x: 1300, y: 140, vx: 0.6, vy: 0.8 },
  { name: "Notion", emoji: "📝", x: 1550, y: 230, vx: -0.9, vy: -0.6 },
  { name: "Zoom", emoji: "📹", x: 200, y: 700, vx: 1.1, vy: -0.7 },
  { name: "Gmail", emoji: "📧", x: 450, y: 780, vx: -0.6, vy: 0.9 },
  { name: "Drive", emoji: "📁", x: 700, y: 660, vx: 0.7, vy: -1.0 },
  { name: "Stripe", emoji: "💳", x: 950, y: 750, vx: -1.0, vy: 0.7 },
  { name: "Twilio", emoji: "📱", x: 1200, y: 680, vx: 0.8, vy: 0.8 },
  { name: "Figma", emoji: "🎨", x: 1450, y: 740, vx: -0.7, vy: -0.9 },
  { name: "Vercel", emoji: "▲", x: 1700, y: 650, vx: 0.9, vy: 0.6 },
  { name: "AWS", emoji: "☁️", x: 300, y: 440, vx: -0.8, vy: -0.8 },
  { name: "Asana", emoji: "✅", x: 900, y: 430, vx: 0.6, vy: 0.7 },
  { name: "Intercom", emoji: "💬", x: 1600, y: 400, vx: -0.7, vy: -1.0 },
];

export const Hook = () => {
  const frame = useCurrentFrame();

  // Line 1: "Enterprise workflows are broken." fades in 0–60
  const line1Opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const line1Y = interpolate(frame, [0, 30], [20, 0], { extrapolateRight: "clamp" });

  // Tools scatter-fly in from 60–180
  const toolsProgress = interpolate(frame, [60, 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 2: "Your team juggles 50+ tools. Manually." from 180
  const line2Opacity = interpolate(frame, [190, 220], [0, 1], { extrapolateRight: "clamp" });
  const line2Y = interpolate(frame, [190, 220], [20, 0], { extrapolateRight: "clamp" });

  // Flash to white at the very end (frame 340–370)
  const flashOpacity = interpolate(frame, [330, 360], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Background variant="default" />

      {/* Line 1 */}
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 0 }}>
        <div style={{
          opacity: line1Opacity,
          transform: `translateY(${line1Y}px)`,
          fontSize: 72,
          fontWeight: 800,
          color: "#FFFFFF",
          textAlign: "center",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}>
          Enterprise workflows<br />
          <span style={{ color: "#EF4444" }}>are broken.</span>
        </div>
      </AbsoluteFill>

      {/* Scattered tool logos */}
      {TOOL_LOGOS.map((tool, idx) => {
        const delay = idx * 0.06;
        const localProgress = Math.max(0, Math.min(1, toolsProgress - delay));
        const startX = 960 + (tool.x - 960) * 0.1;
        const startY = 540 + (tool.y - 540) * 0.1;

        const opacity = interpolate(localProgress, [0, 0.3], [0, 0.7], { extrapolateRight: "clamp" });
        const x = interpolate(localProgress, [0, 1], [startX, tool.x]);
        const y = interpolate(localProgress, [0, 1], [startY, tool.y]);

        // Drift in place
        const driftX = x + Math.sin(frame * tool.vx * 0.05 + idx) * 8;
        const driftY = y + Math.cos(frame * tool.vy * 0.05 + idx) * 8;

        return (
          <div key={tool.name} style={{
            position: "absolute",
            left: driftX - 36,
            top: driftY - 36,
            width: 72,
            height: 72,
            backgroundColor: "#0F1622",
            border: "1px solid #232D3F",
            borderRadius: 14,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            opacity,
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}>
            <div style={{ fontSize: 24 }}>{tool.emoji}</div>
            <div style={{ fontSize: 8, color: "#6B7C96", fontWeight: 600 }}>{tool.name}</div>
          </div>
        );
      })}

      {/* Line 2 */}
      {frame >= 170 && (
        <AbsoluteFill style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 120,
        }}>
          <div style={{
            opacity: line2Opacity,
            transform: `translateY(${line2Y}px)`,
            backgroundColor: "rgba(7,12,24,0.85)",
            backdropFilter: "blur(8px)",
            padding: "20px 40px",
            borderRadius: 12,
            border: "1px solid #232D3F",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF" }}>
              Your team juggles <span style={{ color: "#F59E0B" }}>50+ tools.</span> Manually.
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* White flash transition */}
      <AbsoluteFill style={{
        backgroundColor: "#FFFFFF",
        opacity: flashOpacity,
        pointerEvents: "none",
      }} />
    </AbsoluteFill>
  );
};
