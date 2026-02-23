import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { Background } from "../components/Background";

export const CTA = () => {
  const frame = useCurrentFrame();

  // Logo + brand fades in
  const logoScale = spring({
    fps: 30,
    frame: Math.max(0, frame - 5),
    config: { damping: 14, stiffness: 120 },
    from: 0,
    to: 1,
  });

  const brandOpacity = interpolate(frame, [15, 40], [0, 1], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [35, 60], [0, 1], { extrapolateRight: "clamp" });
  const urlOpacity = interpolate(frame, [55, 80], [0, 1], { extrapolateRight: "clamp" });
  const ctaOpacity = interpolate(frame, [75, 100], [0, 1], { extrapolateRight: "clamp" });
  const ctaScale = spring({
    fps: 30,
    frame: Math.max(0, frame - 75),
    config: { damping: 10, stiffness: 150 },
    from: 0,
    to: 1,
  });

  // Animated button border glow
  const glowIntensity = 0.4 + Math.sin(frame * 0.2) * 0.2;

  // Particle fade in
  const particleOpacity = interpolate(frame, [0, 40], [0, 0.6], { extrapolateRight: "clamp" });

  const dividerWidth = interpolate(frame, [30, 100], [0, 400], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      {/* Rich background */}
      <AbsoluteFill>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(59,130,246,0.18) 0%, rgba(167,139,250,0.08) 40%, #070C18 75%)",
          opacity: particleOpacity,
        }} />
        <Background variant="blue" />
      </AbsoluteFill>

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}>
        {/* Logo mark */}
        <div style={{
          transform: `scale(${logoScale})`,
          marginBottom: 24,
          position: "relative",
          width: 72,
          height: 72,
        }}>
          <div style={{
            position: "absolute", inset: 0,
            border: "2px solid #3B82F6",
            borderRadius: "50%",
            boxShadow: `0 0 ${30 + glowIntensity * 20}px rgba(59,130,246,${glowIntensity})`,
          }} />
          <div style={{
            position: "absolute", inset: 10,
            border: "1px solid rgba(59,130,246,0.4)",
            borderRadius: "50%",
          }} />
          <div style={{
            position: "absolute", top: "50%", left: 0, right: 0,
            height: 1, backgroundColor: "#3B82F6", opacity: 0.7,
            transform: "translateY(-50%)",
          }} />
          <div style={{
            position: "absolute", left: "50%", top: 0, bottom: 0,
            width: 1, backgroundColor: "#3B82F6", opacity: 0.7,
            transform: "translateX(-50%)",
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            width: 6, height: 6, backgroundColor: "#3B82F6",
            borderRadius: "50%", transform: "translate(-50%, -50%)",
            boxShadow: "0 0 8px rgba(59,130,246,0.9)",
          }} />
        </div>

        {/* Brand name */}
        <div style={{
          opacity: brandOpacity,
          fontSize: 64,
          fontWeight: 800,
          color: "#FFFFFF",
          letterSpacing: "-0.04em",
          marginBottom: 16,
          textAlign: "center",
        }}>
          Mission Control
        </div>

        {/* Tagline */}
        <div style={{
          opacity: taglineOpacity,
          fontSize: 20,
          color: "#6B7C96",
          fontWeight: 400,
          marginBottom: 32,
          textAlign: "center",
        }}>
          The command center for your AI workforce
        </div>

        {/* Divider */}
        <div style={{
          width: dividerWidth,
          height: 1,
          background: "linear-gradient(90deg, transparent, #3B82F6, transparent)",
          marginBottom: 32,
        }} />

        {/* URL */}
        <div style={{
          opacity: urlOpacity,
          fontSize: 18,
          color: "#3B82F6",
          fontFamily: "JetBrains Mono, monospace",
          fontWeight: 500,
          letterSpacing: "0.02em",
          marginBottom: 40,
        }}>
          missioncontrol.ai
        </div>

        {/* CTA Button */}
        <div style={{
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
          padding: "16px 48px",
          backgroundColor: "#3B82F6",
          borderRadius: 12,
          boxShadow: `0 0 ${20 + glowIntensity * 20}px rgba(59,130,246,${glowIntensity * 0.8}), 0 4px 24px rgba(59,130,246,0.3)`,
          cursor: "pointer",
        }}>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "0.01em",
          }}>
            Request Early Access →
          </div>
        </div>

        {/* Bottom tagline */}
        <div style={{
          marginTop: 32,
          opacity: interpolate(frame, [110, 140], [0, 1], { extrapolateRight: "clamp" }),
          display: "flex",
          gap: 20,
          alignItems: "center",
        }}>
          {["🌀 Kaze", "🔭 Scout", "🔨 Forge", "👻 Ghost"].map((agent) => (
            <div key={agent} style={{
              fontSize: 13,
              color: "#6B7C96",
              fontWeight: 500,
            }}>
              {agent}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
