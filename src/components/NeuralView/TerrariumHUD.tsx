// TerrariumHUD.tsx — Minimal glass-etched data overlay for the terrarium
// Ultra-subtle text at 0.2-0.3 opacity — the ecosystem is the hero

interface TerrariumHUDProps {
  agentsOnline: number;
  totalAgents: number;
  totalOps: number;
  isStorm: boolean;
}

export function TerrariumHUD({ agentsOnline, totalAgents, totalOps, isStorm }: TerrariumHUDProps) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
      {/* Top-left — Terrarium label */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 14,
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 9,
          fontWeight: 500,
          color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        TERRARIUM
      </div>

      {/* Top-right — Agents alive */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 8.5,
          color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.1em",
        }}
      >
        {agentsOnline}/{totalAgents} ALIVE
      </div>

      {/* Bottom-center — Total ops */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 8.5,
          color: "rgba(255,255,255,0.18)",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.08em",
        }}
      >
        {totalOps} OPS
      </div>

      {/* Storm badge — when 3+ agents working */}
      {isStorm && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 8,
            fontWeight: 600,
            color: "rgba(200,230,200,0.35)",
            letterSpacing: "0.15em",
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
        >
          ECOSYSTEM SURGE
        </div>
      )}
    </div>
  );
}
