import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { Background } from "../components/Background";

interface StatPillProps {
  label: string;
  value: string;
  subtext?: string;
  color: string;
  delayFrames: number;
  strikethrough?: string;
}

const StatPill = ({ label, value, subtext, color, delayFrames, strikethrough }: StatPillProps) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delayFrames);

  const scale = spring({
    fps: 30,
    frame: localFrame,
    config: { damping: 12, stiffness: 150 },
    from: 0,
    to: 1,
  });

  const opacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // Counter animation for numeric values
  const numMatch = value.match(/^(\d+)\+?$/);
  let displayValue = value;
  if (numMatch) {
    const target = parseInt(numMatch[1]);
    const counted = Math.floor(
      interpolate(localFrame, [0, 50], [0, target], { extrapolateRight: "clamp" })
    );
    displayValue = counted + (value.includes("+") ? "+" : "");
  }

  const strikeProgress = interpolate(localFrame, [30, 60], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      opacity,
      transform: `scale(${scale})`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      padding: "32px 48px",
      backgroundColor: "#0F1622",
      border: `1px solid ${color}30`,
      borderRadius: 20,
      boxShadow: `0 0 40px ${color}20, 0 8px 32px rgba(0,0,0,0.4)`,
      minWidth: 280,
    }}>
      <div style={{ fontSize: 13, color: "#6B7C96", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </div>

      <div style={{ textAlign: "center" }}>
        {strikethrough ? (
          <div style={{ position: "relative", display: "inline-block" }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#EF4444", position: "relative" }}>
              {strikethrough}
              {/* Strikethrough line */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: 0,
                width: `${strikeProgress * 100}%`,
                height: 4,
                backgroundColor: "#EF4444",
                transform: "translateY(-50%)",
                boxShadow: "0 0 6px rgba(239,68,68,0.6)",
              }} />
            </div>
            <div style={{
              fontSize: 48,
              fontWeight: 800,
              color,
              opacity: interpolate(localFrame, [50, 70], [0, 1], { extrapolateRight: "clamp" }),
            }}>
              {value}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 52, fontWeight: 800, color }}>
            {displayValue}
          </div>
        )}
      </div>

      {subtext && (
        <div style={{ fontSize: 14, color: "#6B7C96", textAlign: "center", lineHeight: 1.5 }}>
          {subtext}
        </div>
      )}

      <div style={{
        width: "100%",
        height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.5,
      }} />
    </div>
  );
};

export const Proof = () => {
  const frame = useCurrentFrame();

  const headingOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <Background variant="blue" />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        padding: "0 80px",
      }}>
        <div style={{
          opacity: headingOpacity,
          fontSize: 40,
          fontWeight: 800,
          color: "#FFFFFF",
          textAlign: "center",
          letterSpacing: "-0.02em",
        }}>
          Built different. Priced right.
        </div>

        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          <StatPill
            label="Integrations"
            value="100+"
            subtext="Any API, auto-generated from docs"
            color="#3B82F6"
            delayFrames={10}
          />
          <StatPill
            label="Monthly Cost"
            strikethrough="$2,500"
            value="$0"
            subtext="Replaces Paragon entirely"
            color="#10B981"
            delayFrames={40}
          />
          <StatPill
            label="Agent Squad"
            value="4"
            subtext="Infinite scale. Zero headcount."
            color="#F59E0B"
            delayFrames={70}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
