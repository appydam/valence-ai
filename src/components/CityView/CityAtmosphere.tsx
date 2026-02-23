// CityAtmosphere.tsx — Daytime blue sky with clouds and sun

import { motion } from "framer-motion";
import type { District } from "./cityConfig";

interface CityAtmosphereProps {
  containerWidth: number;
  containerHeight: number;
  activeDistricts: District[];
  totalConnected: number;
  totalBlueprints: number;
}

const CLOUDS = [
  { x: 5,  y: 4,  scale: 1.8, opacity: 0.92, speed: 80, delay: 0 },
  { x: 28, y: 8,  scale: 1.4, opacity: 0.85, speed: 65, delay: 10 },
  { x: 52, y: 3,  scale: 2.2, opacity: 0.88, speed: 90, delay: 5 },
  { x: 70, y: 10, scale: 1.6, opacity: 0.80, speed: 70, delay: 20 },
  { x: 85, y: 5,  scale: 1.3, opacity: 0.90, speed: 60, delay: 8 },
  { x: 15, y: 14, scale: 1.0, opacity: 0.75, speed: 55, delay: 15 },
];

function Cloud({ x, y, scale, opacity, speed, delay }: typeof CLOUDS[0]) {
  const w = 130 * scale;
  const h = 55 * scale;
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{ x: [0, 40, 0] }}
      transition={{ duration: speed, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <svg width={w} height={h} viewBox="0 0 130 55" style={{ overflow: "visible" }}>
        <ellipse cx="35" cy="40" rx="33" ry="20" fill={`rgba(255,255,255,${opacity * 0.95})`} />
        <ellipse cx="65" cy="33" rx="42" ry="27" fill={`rgba(255,255,255,${opacity})`} />
        <ellipse cx="100" cy="40" rx="32" ry="20" fill={`rgba(255,255,255,${opacity * 0.9})`} />
        {/* Subtle cloud shadow/depth on bottom */}
        <ellipse cx="65" cy="48" rx="38" ry="8" fill={`rgba(180,200,220,${opacity * 0.25})`} />
      </svg>
    </motion.div>
  );
}

export function CityAtmosphere({
  containerWidth,
  containerHeight,
  activeDistricts,
  totalConnected,
  totalBlueprints,
}: CityAtmosphereProps) {
  const uptimePct = totalBlueprints > 0
    ? Math.round((totalConnected / totalBlueprints) * 100)
    : 0;

  return (
    <>
      {/* ── Daytime sky gradient ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg,
            #1a3a5a 0%,
            #2a5a8a 12%,
            #4080b8 28%,
            #6aabda 48%,
            #87ceeb 65%,
            #b0d8ee 78%,
            #d0e8f5 88%,
            #e8d0a8 93%,
            #c4a070 97%,
            #8a6040 100%
          )`,
          zIndex: 0,
        }}
      />

      {/* ── Sun glow ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "38%",
          top: "18%",
          transform: "translate(-50%, -50%)",
          width: "45%",
          height: "40%",
          background: "radial-gradient(ellipse, rgba(255,245,180,0.45) 0%, rgba(255,220,100,0.2) 30%, transparent 65%)",
          zIndex: 1,
        }}
      />

      {/* ── Clouds ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        {CLOUDS.map((cloud, i) => (
          <Cloud key={i} {...cloud} />
        ))}
      </div>

      {/* ── Subtle horizon haze ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 0,
          right: 0,
          bottom: "10%",
          height: "15%",
          background: "linear-gradient(to top, rgba(200,180,150,0.3) 0%, transparent 100%)",
          zIndex: 3,
        }}
      />

      {/* ── Stats panel (top-right) ── */}
      <motion.div
        className="absolute pointer-events-none font-mono"
        style={{ right: 16, top: 12, zIndex: 200 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div
          style={{
            background: "rgba(10,20,40,0.70)",
            border: "1px solid rgba(100,160,220,0.25)",
            borderRadius: 8,
            padding: "8px 16px",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Stat label="INTEGRATIONS" value={totalBlueprints} color="#60a5fa" />
          <div style={{ width: 1, height: 24, background: "rgba(100,160,220,0.15)" }} />
          <Stat label="CONNECTED" value={totalConnected} color="#34d399" />
          <div style={{ width: 1, height: 24, background: "rgba(100,160,220,0.15)" }} />
          <Stat label="UPTIME" value={`${uptimePct}%`} color="#a78bfa" />
        </div>
      </motion.div>
    </>
  );
}

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="text-center">
      <div style={{ fontSize: 15, fontWeight: 700, color, textShadow: `0 0 8px ${color}55`, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 7, color: "rgba(180,200,220,0.55)", letterSpacing: "0.15em", marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}
