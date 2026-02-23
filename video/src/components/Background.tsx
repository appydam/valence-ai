import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

interface BackgroundProps {
  variant?: "default" | "blue" | "reveal";
}

export const Background = ({ variant = "default" }: BackgroundProps) => {
  const frame = useCurrentFrame();

  const particleCount = 30;

  const particles = Array.from({ length: particleCount }, (_, i) => {
    const seed = i * 137.508;
    const x = ((seed * 0.618033) % 1) * 1920;
    const baseY = ((seed * 1.414) % 1) * 1080;
    const speed = 0.3 + ((seed * 0.271) % 0.5);
    const y = ((baseY + frame * speed) % 1080);
    const size = 1 + ((seed * 0.333) % 2);
    const opacity = 0.1 + ((seed * 0.177) % 0.2);
    return { x, y, size, opacity, i };
  });

  const glowOpacity = interpolate(frame, [0, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  if (variant === "blue") {
    return (
      <AbsoluteFill>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(59,130,246,0.15) 0%, #070C18 70%)",
        }} />
        {particles.map(p => (
          <div key={p.i} style={{
            position: "absolute", left: p.x, top: p.y,
            width: p.size, height: p.size, borderRadius: "50%",
            backgroundColor: "#3B82F6", opacity: p.opacity * glowOpacity,
          }} />
        ))}
      </AbsoluteFill>
    );
  }

  if (variant === "reveal") {
    return (
      <AbsoluteFill>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.12) 0%, #070C18 65%)",
        }} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#070C18" }} />
      {particles.map(p => (
        <div key={p.i} style={{
          position: "absolute", left: p.x, top: p.y,
          width: p.size, height: p.size, borderRadius: "50%",
          backgroundColor: "#6B7C96", opacity: p.opacity * 0.5,
        }} />
      ))}
    </AbsoluteFill>
  );
};
