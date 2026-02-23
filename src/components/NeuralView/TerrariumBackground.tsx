// TerrariumBackground.tsx — Deep forest gradient, atmospheric mist, ambient terrarium lamp

interface TerrariumBackgroundProps {
  isStorm: boolean;
}

export function TerrariumBackground({ isStorm }: TerrariumBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient — deep forest canopy to dark soil */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #0f2818 0%, #0a1a0f 40%, #0d1510 70%, #121008 100%)",
        }}
      />

      {/* Ambient terrarium lamp — warm light from above */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(255,240,180,0.1) 0%, transparent 70%)",
        }}
      />

      {/* Atmospheric mist layer 1 — slow drift */}
      <div
        className="absolute inset-0 animate-mist-drift"
        style={{
          background: "radial-gradient(ellipse 120% 30% at 30% 45%, rgba(200,230,200,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Atmospheric mist layer 2 — offset timing */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 100% 25% at 70% 55%, rgba(180,220,200,0.035) 0%, transparent 55%)",
          animation: "mist-drift 16s ease-in-out 4s infinite",
        }}
      />

      {/* Atmospheric mist layer 3 — thickens during storm */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: "radial-gradient(ellipse 140% 40% at 50% 50%, rgba(200,240,200,0.05) 0%, transparent 65%)",
          animation: "mist-drift 20s ease-in-out 8s infinite",
          opacity: isStorm ? 1 : 0.4,
        }}
      />

      {/* Glass condensation — scattered droplet illusion */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle 2px at 15% 12%, rgba(255,255,255,0.06) 0%, transparent 100%),
            radial-gradient(circle 1.5px at 45% 8%, rgba(255,255,255,0.05) 0%, transparent 100%),
            radial-gradient(circle 2.5px at 72% 15%, rgba(255,255,255,0.07) 0%, transparent 100%),
            radial-gradient(circle 1.5px at 88% 22%, rgba(255,255,255,0.05) 0%, transparent 100%),
            radial-gradient(circle 2px at 33% 5%, rgba(255,255,255,0.04) 0%, transparent 100%),
            radial-gradient(circle 3px at 60% 18%, rgba(255,255,255,0.06) 0%, transparent 100%),
            radial-gradient(circle 2px at 25% 25%, rgba(255,255,255,0.05) 0%, transparent 100%),
            radial-gradient(circle 1.5px at 80% 10%, rgba(255,255,255,0.04) 0%, transparent 100%)
          `,
        }}
      />

      {/* Vignette — edges darken */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 50%, rgba(6,14,8,0.6) 100%)",
        }}
      />
    </div>
  );
}
