import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { Background } from "../components/Background";
import { TextReveal } from "../components/TextReveal";

export const Reveal = () => {
  const frame = useCurrentFrame();

  // Fade in from white flash
  const sceneOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });

  // Logo scale spring: starts at frame 10
  const logoScale = spring({
    fps: 30,
    frame: Math.max(0, frame - 10),
    config: { damping: 12, stiffness: 130, mass: 1 },
    from: 0,
    to: 1,
  });

  // "Mission Control" slams down from frame 40
  const titleY = interpolate(frame, [40, 65], [-60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline below title from frame 80
  const subtitleOpacity = interpolate(frame, [80, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glow pulse behind logo
  const glowPulse = 0.5 + Math.sin(frame * 0.12) * 0.2;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <Background variant="reveal" />

      {/* Glow orb behind logo */}
      <AbsoluteFill style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          backgroundColor: "transparent",
          boxShadow: `0 0 120px rgba(59,130,246,${glowPulse * 0.4})`,
        }} />
      </AbsoluteFill>

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}>
        {/* Logo mark (crosshair/reticle icon recreated in CSS) */}
        <div style={{
          transform: `scale(${logoScale})`,
          marginBottom: 32,
          position: "relative",
          width: 96,
          height: 96,
        }}>
          {/* Outer ring */}
          <div style={{
            position: "absolute", inset: 0,
            border: "2px solid #3B82F6",
            borderRadius: "50%",
            boxShadow: "0 0 30px rgba(59,130,246,0.5)",
          }} />
          {/* Inner ring */}
          <div style={{
            position: "absolute", inset: 14,
            border: "1px solid rgba(59,130,246,0.5)",
            borderRadius: "50%",
          }} />
          {/* Crosshair lines */}
          <div style={{
            position: "absolute",
            top: "50%", left: 0, right: 0,
            height: 1,
            backgroundColor: "#3B82F6",
            opacity: 0.7,
            transform: "translateY(-50%)",
          }} />
          <div style={{
            position: "absolute",
            left: "50%", top: 0, bottom: 0,
            width: 1,
            backgroundColor: "#3B82F6",
            opacity: 0.7,
            transform: "translateX(-50%)",
          }} />
          {/* Center dot */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: 8, height: 8,
            backgroundColor: "#3B82F6",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 10px rgba(59,130,246,0.8)",
          }} />
        </div>

        {/* "Mission Control" */}
        <div style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 88,
          fontWeight: 800,
          color: "#FFFFFF",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          textAlign: "center",
          marginBottom: 20,
        }}>
          Mission Control
        </div>

        {/* Tagline typewriter */}
        <div style={{ opacity: subtitleOpacity, height: 36 }}>
          <TextReveal
            text="AI Agent Squad for Enterprise Workflows"
            startFrame={0}
            durationFrames={100}
            style={{
              fontSize: 22,
              color: "#6B7C96",
              fontWeight: 400,
              letterSpacing: "0.01em",
              fontFamily: "JetBrains Mono, monospace",
            }}
          />
        </div>

        {/* Divider line */}
        <div style={{
          marginTop: 32,
          width: interpolate(frame, [120, 200], [0, 300], { extrapolateRight: "clamp" }),
          height: 1,
          background: "linear-gradient(90deg, transparent, #3B82F6, transparent)",
        }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
