// GlassFrame.tsx — The terrarium glass enclosure with subtle reflections and 3D perspective tilt

interface GlassFrameProps {
  children: React.ReactNode;
}

export function GlassFrame({ children }: GlassFrameProps) {
  return (
    <div
      className="absolute inset-2 overflow-hidden"
      style={{
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
      }}
    >
      {/* Top glass reflection — light catching the glass edge */}
      <div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: 2,
          background: "linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.15) 35%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.15) 65%, transparent 90%)",
        }}
      />

      {/* Bottom glass edge */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: 1,
          background: "linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.06) 50%, transparent 80%)",
        }}
      />

      {/* Left edge reflection */}
      <div
        className="absolute top-0 left-0 bottom-0 z-10 pointer-events-none"
        style={{
          width: 1,
          background: "linear-gradient(180deg, rgba(255,255,255,0.08) 10%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.06) 90%)",
        }}
      />

      {/* Corner highlight — top-left */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          top: 0,
          left: 0,
          width: 60,
          height: 60,
          background: "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Corner highlight — top-right */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          top: 0,
          right: 0,
          width: 50,
          height: 50,
          background: "radial-gradient(circle at 100% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)",
        }}
      />

      {/* Diagonal glass streak */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          top: "8%",
          left: "15%",
          width: 120,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
          transform: "rotate(-25deg)",
        }}
      />

      {/* Inner content */}
      <div className="absolute inset-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
