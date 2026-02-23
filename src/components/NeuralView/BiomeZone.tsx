// BiomeZone.tsx — Each agent's living habitat in the terrarium.
// 4 biome types: zen (Kaze), jungle (Scout), volcanic (Forge), sea (Ghost)
// V2: Everything 2-3x larger, more opaque, visually impactful

import { motion } from "framer-motion";
import { AgentName, AGENT_CONFIG } from "@/types/mission";

interface AgentData {
  name: AgentName;
  status: string;
  tasksCompleted: number;
}

interface BiomeZoneProps {
  agent: AgentData;
  agentName: AgentName;
  biomeType: "zen" | "jungle" | "volcanic" | "sea";
  color: string;
  isSelected: boolean;
  onClick: () => void;
  zoneIndex: number;
}

const BIOME_CONFIG = {
  zen: { gradient: "linear-gradient(180deg, rgba(91,155,213,0.06) 0%, rgba(140,170,200,0.12) 40%, rgba(194,178,150,0.22) 100%)" },
  jungle: { gradient: "linear-gradient(180deg, rgba(20,60,20,0.2) 0%, rgba(34,197,94,0.15) 40%, rgba(15,60,20,0.25) 100%)" },
  volcanic: { gradient: "linear-gradient(180deg, rgba(60,20,10,0.15) 0%, rgba(245,158,11,0.08) 40%, rgba(80,20,10,0.25) 100%)" },
  sea: { gradient: "linear-gradient(180deg, rgba(30,10,60,0.2) 0%, rgba(80,40,160,0.12) 40%, rgba(40,15,80,0.25) 100%)" },
};

// ─── ZEN GARDEN (Kaze) ───
function ZenBiome({ isWorking }: { isWorking: boolean }) {
  return (
    <>
      {/* Sand base at bottom 40% */}
      <div
        className="absolute left-0 right-0 bottom-0 pointer-events-none"
        style={{
          height: "42%",
          background: "linear-gradient(180deg, rgba(194,178,150,0.08) 0%, rgba(194,178,150,0.18) 40%, rgba(160,145,120,0.25) 100%)",
        }}
      />

      {/* Raked sand lines — thick, visible */}
      <svg className="absolute left-0 right-0 bottom-0 pointer-events-none" style={{ height: "42%" }} viewBox="0 0 200 100" preserveAspectRatio="none">
        {[20, 35, 50, 65, 78, 90].map((y, i) => (
          <path
            key={i}
            d={`M 0 ${y} Q 40 ${y - 8 + i * 2} 100 ${y} Q 160 ${y + 8 - i * 2} 200 ${y}`}
            fill="none"
            stroke="rgba(210,195,170,0.35)"
            strokeWidth="1.2"
            style={{
              strokeDasharray: isWorking ? "8 5" : "none",
              animation: isWorking ? `sand-rake 3s linear ${i * 0.2}s infinite` : "none",
            }}
          />
        ))}
        {/* Raked concentric circles around stone */}
        <circle cx="150" cy="55" r="14" fill="none" stroke="rgba(210,195,170,0.3)" strokeWidth="1" />
        <circle cx="150" cy="55" r="22" fill="none" stroke="rgba(210,195,170,0.2)" strokeWidth="0.8" />
        <circle cx="150" cy="55" r="30" fill="none" stroke="rgba(210,195,170,0.12)" strokeWidth="0.6" />
        {/* Stone in center */}
        <ellipse cx="150" cy="55" rx="6" ry="4" fill="rgba(120,115,105,0.5)" />
      </svg>

      {/* Bonsai tree — prominent, left side */}
      <div className="absolute pointer-events-none" style={{ left: "8%", bottom: "38%", width: 60, height: 90 }}>
        {/* Trunk — thick, curved */}
        <div style={{
          position: "absolute", bottom: 0, left: "45%",
          width: 7, height: 40, background: "rgba(100,65,30,0.7)", borderRadius: "3px 3px 4px 4px",
          transform: "rotate(-3deg)",
        }} />
        {/* Branch */}
        <div style={{
          position: "absolute", bottom: 25, left: "55%",
          width: 4, height: 18, background: "rgba(100,65,30,0.5)", borderRadius: 2,
          transform: "rotate(35deg)", transformOrigin: "bottom left",
        }} />
        {/* Main canopy */}
        <div style={{
          position: "absolute", top: 0, left: "20%",
          width: 45, height: 38,
          background: "radial-gradient(ellipse, rgba(50,110,50,0.7) 0%, rgba(35,85,35,0.4) 55%, transparent 100%)",
          borderRadius: "45% 55% 50% 50%",
        }} />
        {/* Secondary canopy blob */}
        <div style={{
          position: "absolute", top: 15, left: "55%",
          width: 28, height: 22,
          background: "radial-gradient(ellipse, rgba(55,120,55,0.5) 0%, rgba(40,90,40,0.25) 60%, transparent 100%)",
          borderRadius: "50%",
        }} />
      </div>

      {/* Stones — larger */}
      <div className="absolute pointer-events-none" style={{
        right: "15%", bottom: "36%", width: 22, height: 14,
        background: "rgba(110,108,100,0.45)",
        borderRadius: "40% 60% 55% 45% / 50% 45% 55% 50%",
      }} />
      <div className="absolute pointer-events-none" style={{
        right: "22%", bottom: "34%", width: 12, height: 9,
        background: "rgba(90,88,82,0.35)",
        borderRadius: "50% 45% 55% 50% / 45% 55% 50% 45%",
      }} />

      {/* Cherry blossoms — bigger, more visible */}
      {[
        { x: "20%", y: "12%", delay: 0, size: 7 },
        { x: "55%", y: "8%", delay: 1.2, size: 6 },
        { x: "35%", y: "22%", delay: 2.5, size: 8 },
        { x: "72%", y: "16%", delay: 0.8, size: 5 },
        { x: "12%", y: "30%", delay: 3.2, size: 6 },
        { x: "65%", y: "28%", delay: 1.8, size: 7 },
        { x: "45%", y: "5%", delay: 0.4, size: 5 },
        { x: "80%", y: "25%", delay: 2.8, size: 6 },
      ].map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: b.x, top: b.y,
            width: b.size, height: b.size,
            background: `rgba(255,${160 + i * 8},${190 + i * 5},0.7)`,
            boxShadow: `0 0 ${b.size}px rgba(255,180,200,0.4)`,
            animation: `float-gentle ${3 + i * 0.3}s ease-in-out ${b.delay}s infinite`,
          }}
        />
      ))}

      {/* Bamboo water feature — right side */}
      <div className="absolute pointer-events-none" style={{ right: "5%", bottom: "42%", width: 4, height: 35 }}>
        <div style={{ width: 4, height: 35, background: "rgba(80,120,50,0.4)", borderRadius: 2 }} />
      </div>
    </>
  );
}

// ─── JUNGLE (Scout) ───
function JungleBiome({ isWorking }: { isWorking: boolean }) {
  return (
    <>
      {/* Dense canopy — big overlapping leaf blobs */}
      {[
        { x: "-10%", y: "-5%", w: "70%", h: "45%", opacity: 0.35, color: "30,100,30" },
        { x: "30%", y: "0%", w: "80%", h: "40%", opacity: 0.3, color: "25,90,25" },
        { x: "5%", y: "5%", w: "55%", h: "35%", opacity: 0.25, color: "40,110,40" },
        { x: "50%", y: "8%", w: "60%", h: "30%", opacity: 0.2, color: "20,80,25" },
      ].map((leaf, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: leaf.x, top: leaf.y, width: leaf.w, height: leaf.h,
            background: `radial-gradient(ellipse, rgba(${leaf.color},${leaf.opacity}) 0%, rgba(${leaf.color},${leaf.opacity * 0.3}) 50%, transparent 75%)`,
            borderRadius: "50%",
          }}
        />
      ))}

      {/* Ground foliage — dark green at bottom */}
      <div className="absolute left-0 right-0 bottom-0 pointer-events-none" style={{
        height: "30%",
        background: "linear-gradient(180deg, transparent 0%, rgba(15,50,15,0.4) 40%, rgba(10,35,10,0.6) 100%)",
      }} />

      {/* Thick vines */}
      <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 200 300" preserveAspectRatio="none">
        <path d="M 25 0 Q 22 50 28 100 Q 32 150 26 200 Q 22 230 25 260"
          fill="none" stroke="rgba(35,100,35,0.45)" strokeWidth="3"
          style={{ animation: "vine-sway 5s ease-in-out infinite" }} />
        <path d="M 170 0 Q 168 60 174 120 Q 178 170 172 220"
          fill="none" stroke="rgba(30,90,30,0.35)" strokeWidth="2.5"
          style={{ animation: "vine-sway 4s ease-in-out 1.5s infinite" }} />
        <path d="M 90 0 Q 88 40 92 80 Q 95 110 90 140"
          fill="none" stroke="rgba(40,100,40,0.25)" strokeWidth="2"
          style={{ animation: "vine-sway 6s ease-in-out 0.8s infinite" }} />
        {/* Vine leaves */}
        <ellipse cx="24" cy="120" rx="8" ry="5" fill="rgba(40,120,40,0.4)" transform="rotate(-20 24 120)" />
        <ellipse cx="172" cy="160" rx="7" ry="4" fill="rgba(35,110,35,0.35)" transform="rotate(15 172 160)" />
        <ellipse cx="28" cy="200" rx="9" ry="5" fill="rgba(45,125,45,0.3)" transform="rotate(-30 28 200)" />
      </svg>

      {/* Ground ferns — bigger */}
      {[
        { x: "5%", size: 24 },
        { x: "40%", size: 18 },
        { x: "70%", size: 22 },
        { x: "85%", size: 16 },
      ].map((f, i) => (
        <div key={i} className="absolute pointer-events-none" style={{
          left: f.x, bottom: "18%",
          width: 0, height: 0,
          borderLeft: `${f.size / 2}px solid transparent`,
          borderRight: `${f.size / 2}px solid transparent`,
          borderBottom: `${f.size}px solid rgba(25,80,25,0.5)`,
        }} />
      ))}

      {/* Fireflies — BIGGER, more glow */}
      {[
        { x: "18%", y: "28%", delay: 0, dur: 3, size: 5 },
        { x: "65%", y: "22%", delay: 1.5, dur: 4, size: 6 },
        { x: "38%", y: "42%", delay: 0.8, dur: 3.5, size: 5 },
        { x: "82%", y: "35%", delay: 2.2, dur: 4.5, size: 4 },
        { x: "28%", y: "52%", delay: 3, dur: 3, size: 6 },
        { x: "50%", y: "18%", delay: 0.5, dur: 5, size: 4 },
        { x: "75%", y: "48%", delay: 1.8, dur: 3.8, size: 5 },
        ...(isWorking ? [
          { x: "55%", y: "32%", delay: 0.3, dur: 3.8, size: 6 },
          { x: "12%", y: "48%", delay: 1.2, dur: 4.2, size: 5 },
          { x: "90%", y: "40%", delay: 2.5, dur: 3.2, size: 7 },
        ] : []),
      ].map((ff, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ff.x, top: ff.y,
            width: ff.size, height: ff.size,
            background: "#4ade80",
            boxShadow: `0 0 ${ff.size * 2}px #22c55e, 0 0 ${ff.size * 4}px rgba(34,197,94,0.5)`,
            animation: `float-gentle ${ff.dur}s ease-in-out ${ff.delay}s infinite, pulse-glow ${ff.dur * 0.8}s ease-in-out ${ff.delay}s infinite`,
          }}
        />
      ))}

      {/* Dappled sunlight — bigger, brighter */}
      {[
        { x: "20%", y: "15%", size: 50 },
        { x: "55%", y: "30%", size: 35 },
        { x: "75%", y: "12%", size: 40 },
      ].map((spot, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none" style={{
          left: spot.x, top: spot.y,
          width: spot.size, height: spot.size,
          background: "radial-gradient(circle, rgba(255,255,200,0.1) 0%, transparent 70%)",
        }} />
      ))}
    </>
  );
}

// ─── VOLCANIC (Forge) ───
function VolcanicBiome({ isWorking }: { isWorking: boolean }) {
  return (
    <>
      {/* Rocky terrain base */}
      <div className="absolute left-0 right-0 bottom-0 pointer-events-none" style={{
        height: "35%",
        background: "linear-gradient(180deg, transparent 0%, rgba(40,22,12,0.5) 20%, rgba(30,16,8,0.8) 100%)",
        clipPath: "polygon(0% 30%, 6% 15%, 14% 35%, 22% 8%, 32% 28%, 42% 5%, 52% 22%, 60% 10%, 70% 30%, 78% 12%, 86% 25%, 94% 8%, 100% 18%, 100% 100%, 0% 100%)",
      }} />

      {/* Lava streams — thin crack lines, not a blob */}
      <svg className="absolute left-0 right-0 bottom-0 pointer-events-none" style={{ height: "35%" }} viewBox="0 0 200 100" preserveAspectRatio="none">
        {/* Main lava crack */}
        <path
          d="M 20 30 Q 40 35 60 28 Q 80 22 100 30 Q 130 40 160 32 Q 180 28 200 35"
          fill="none"
          stroke="rgba(255,120,20,0.6)"
          strokeWidth="2.5"
          style={{
            filter: "blur(0.5px)",
            animation: isWorking ? "pulse-glow 1.5s ease-in-out infinite" : "pulse-glow 3s ease-in-out infinite",
          }}
        />
        {/* Lava glow halo on the crack */}
        <path
          d="M 20 30 Q 40 35 60 28 Q 80 22 100 30 Q 130 40 160 32 Q 180 28 200 35"
          fill="none"
          stroke="rgba(255,80,0,0.2)"
          strokeWidth="8"
          style={{ filter: "blur(4px)" }}
        />
        {/* Secondary crack */}
        <path
          d="M 70 50 Q 90 45 110 55 Q 130 60 150 50"
          fill="none"
          stroke="rgba(255,140,40,0.4)"
          strokeWidth="1.5"
          style={{ filter: "blur(0.5px)" }}
        />
      </svg>

      {/* Lava ambient glow — from cracks */}
      <div className="absolute left-0 right-0 pointer-events-none" style={{
        bottom: "15%", height: "25%",
        background: "radial-gradient(ellipse 90% 50% at 50% 80%, rgba(255,100,20,0.12) 0%, transparent 70%)",
        animation: isWorking ? "pulse-glow 2s ease-in-out infinite" : "none",
      }} />

      {/* Crystals — MUCH bigger, with glow */}
      {[
        { x: "10%", h: 40, w: 14, color: "rgba(255,180,40,0.7)", glow: "rgba(255,180,40,0.4)", rot: -8 },
        { x: "22%", h: 28, w: 10, color: "rgba(255,200,60,0.6)", glow: "rgba(255,200,60,0.3)", rot: 6 },
        { x: "68%", h: 36, w: 12, color: "rgba(255,160,30,0.65)", glow: "rgba(255,160,30,0.35)", rot: -14 },
        { x: "82%", h: 24, w: 9, color: "rgba(255,80,40,0.55)", glow: "rgba(255,80,40,0.3)", rot: 12 },
        { x: "55%", h: 20, w: 8, color: "rgba(255,140,20,0.5)", glow: "rgba(255,140,20,0.25)", rot: -5 },
      ].map((c, i) => (
        <div key={i} className="absolute pointer-events-none" style={{
          left: c.x, bottom: "30%",
          width: c.w, height: c.h,
          background: `linear-gradient(to top, ${c.color}, rgba(255,255,200,0.3))`,
          clipPath: "polygon(50% 0%, 95% 100%, 5% 100%)",
          transform: `rotate(${c.rot}deg)`,
          filter: `drop-shadow(0 0 ${isWorking && i === 0 ? 10 : 4}px ${c.glow})`,
          transition: "filter 0.5s ease",
        }} />
      ))}

      {/* Steam vents — bigger, more visible */}
      {[
        { x: "32%", delay: 0 },
        { x: "58%", delay: 1.5 },
        { x: "78%", delay: 3 },
      ].map((v, i) => (
        <div key={i} className="absolute pointer-events-none" style={{
          left: v.x, bottom: "32%",
          width: 12, height: 50,
          background: "linear-gradient(to top, rgba(200,200,200,0.2), rgba(200,200,200,0.05), transparent)",
          filter: "blur(4px)",
          animation: `float-gentle 3s ease-in-out ${v.delay}s infinite`,
          opacity: isWorking ? 1 : 0.4,
          transition: "opacity 0.5s ease",
        }} />
      ))}

      {/* Embers — bigger, brighter */}
      {[
        { x: "22%", delay: 0 },
        { x: "42%", delay: 0.6 },
        { x: "62%", delay: 1.2 },
        { x: "52%", delay: 2 },
        { x: "35%", delay: 2.8 },
        { x: "75%", delay: 0.4 },
        ...(isWorking ? [
          { x: "30%", delay: 0.3 }, { x: "68%", delay: 1 },
          { x: "45%", delay: 1.8 }, { x: "85%", delay: 0.8 },
        ] : []),
      ].map((e, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none" style={{
          left: e.x, bottom: "30%",
          width: 3, height: 3,
          background: "#fbbf24",
          boxShadow: "0 0 6px rgba(251,191,36,0.8), 0 0 12px rgba(245,158,11,0.4)",
          animation: `particle-rise 2.5s ease-in ${e.delay}s infinite`,
        }} />
      ))}
    </>
  );
}

// ─── DEEP SEA GROTTO (Ghost) ───
function SeaBiome({ isWorking }: { isWorking: boolean }) {
  return (
    <>
      {/* Underwater depth gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(180deg, rgba(60,30,120,0.1) 0%, rgba(40,15,80,0.18) 50%, rgba(20,8,50,0.28) 100%)",
      }} />

      {/* Bioluminescent spots — BIGGER, more intense */}
      {[
        { x: "12%", y: "18%", size: 8, color: "rgba(167,139,250,0.8)", dur: 4 },
        { x: "72%", y: "28%", size: 6, color: "rgba(100,200,255,0.7)", dur: 5 },
        { x: "38%", y: "12%", size: 10, color: "rgba(167,139,250,0.7)", dur: 3.5 },
        { x: "85%", y: "42%", size: 6, color: "rgba(120,180,255,0.6)", dur: 6 },
        { x: "22%", y: "52%", size: 8, color: "rgba(167,139,250,0.7)", dur: 4.5 },
        { x: "58%", y: "38%", size: 5, color: "rgba(100,220,255,0.7)", dur: 3 },
        { x: "48%", y: "22%", size: 7, color: "rgba(200,140,255,0.6)", dur: 5.5 },
        { x: "82%", y: "15%", size: 5, color: "rgba(100,200,255,0.6)", dur: 4.2 },
        { x: "30%", y: "35%", size: 6, color: "rgba(180,120,255,0.5)", dur: 3.8 },
        { x: "65%", y: "10%", size: 4, color: "rgba(120,200,255,0.5)", dur: 5.2 },
      ].map((spot, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none" style={{
          left: spot.x, top: spot.y,
          width: spot.size, height: spot.size,
          background: spot.color,
          boxShadow: `0 0 ${spot.size * 3}px ${spot.color}, 0 0 ${spot.size * 6}px ${spot.color.replace(/[\d.]+\)$/, "0.3)")}`,
          animation: `bioluminescence ${spot.dur}s ease-in-out ${i * 0.4}s infinite`,
        }} />
      ))}

      {/* Coral formations — thick, visible */}
      <svg className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: "35%" }} viewBox="0 0 200 100" preserveAspectRatio="none">
        {/* Large branching coral */}
        <path d="M 25 100 L 25 65 L 15 45 M 25 65 L 35 40 M 25 75 L 18 60 M 25 70 L 32 55"
          fill="none" stroke="rgba(200,100,220,0.5)" strokeWidth="3" strokeLinecap="round" />
        {/* Fan coral */}
        <path d="M 140 100 L 140 60 L 128 38 M 140 60 L 155 35 M 140 68 L 132 50 M 140 65 L 150 45"
          fill="none" stroke="rgba(220,80,170,0.45)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Small coral cluster */}
        <path d="M 80 100 L 80 72 L 73 55 M 80 72 L 88 52 M 80 80 L 75 68"
          fill="none" stroke="rgba(160,100,220,0.4)" strokeWidth="2" strokeLinecap="round" />
        {/* Coral base lumps */}
        <ellipse cx="25" cy="95" rx="15" ry="6" fill="rgba(140,80,180,0.2)" />
        <ellipse cx="140" cy="95" rx="12" ry="5" fill="rgba(180,60,140,0.15)" />
      </svg>

      {/* Kelp — wavy, visible */}
      <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 200 300" preserveAspectRatio="none">
        <path d="M 75 300 Q 72 250 78 200 Q 82 150 76 100 Q 72 70 78 40"
          fill="none" stroke="rgba(90,55,140,0.35)" strokeWidth="3.5"
          style={{ animation: "vine-sway 6s ease-in-out infinite" }} />
        <path d="M 160 300 Q 157 260 163 220 Q 166 180 160 140"
          fill="none" stroke="rgba(80,50,130,0.25)" strokeWidth="2.5"
          style={{ animation: "vine-sway 5s ease-in-out 2s infinite" }} />
        {/* Kelp leaf blobs */}
        <ellipse cx="78" cy="80" rx="10" ry="5" fill="rgba(100,60,160,0.25)" transform="rotate(-25 78 80)" />
        <ellipse cx="76" cy="150" rx="8" ry="4" fill="rgba(90,55,150,0.2)" transform="rotate(20 76 150)" />
      </svg>

      {/* Bubbles — bigger */}
      {[
        { x: "28%", delay: 0, size: 5 },
        { x: "52%", delay: 2, size: 4 },
        { x: "72%", delay: 1, size: 4.5 },
        { x: "40%", delay: 3, size: 3.5 },
        ...(isWorking ? [{ x: "60%", delay: 0.5, size: 5 }, { x: "35%", delay: 1.5, size: 4 }] : []),
      ].map((b, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none" style={{
          left: b.x, bottom: "28%",
          width: b.size, height: b.size,
          border: `1px solid rgba(167,139,250,0.35)`,
          background: "rgba(167,139,250,0.12)",
          boxShadow: "0 0 4px rgba(167,139,250,0.2)",
          animation: `bubble-rise 5s ease-in ${b.delay}s infinite`,
        }} />
      ))}

      {/* Ink cloud — when working */}
      {isWorking && (
        <div className="absolute pointer-events-none" style={{
          left: "10%", top: "30%", width: "80%", height: "30%",
          background: "radial-gradient(ellipse, rgba(120,60,180,0.15) 0%, rgba(80,30,140,0.06) 50%, transparent 75%)",
          animation: "ink-expand 4s ease-out infinite",
        }} />
      )}

      {/* Underwater caustics — light refracting through water */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(ellipse 15% 8% at 30% 25%, rgba(140,180,255,0.06) 0%, transparent 100%),
          radial-gradient(ellipse 12% 6% at 60% 40%, rgba(140,180,255,0.04) 0%, transparent 100%),
          radial-gradient(ellipse 10% 5% at 80% 20%, rgba(140,180,255,0.05) 0%, transparent 100%)
        `,
        animation: "mist-drift 8s ease-in-out infinite",
      }} />
    </>
  );
}

// ─── MAIN BIOME ZONE COMPONENT ───
export function BiomeZone({ agent, agentName, biomeType, color, isSelected, onClick, zoneIndex }: BiomeZoneProps) {
  const config = AGENT_CONFIG[agentName];
  const isWorking = agent.status === "working" || agent.status === "online";
  const isOffline = agent.status === "offline";
  const biomeInfo = BIOME_CONFIG[biomeType];

  return (
    <motion.div
      className="absolute top-0 bottom-0 cursor-pointer overflow-hidden"
      style={{
        left: `${zoneIndex * 25}%`,
        width: "25%",
        filter: isOffline ? "grayscale(0.6) brightness(0.4)" : isSelected ? "brightness(1.15)" : "brightness(0.85)",
        transition: "filter 0.5s ease",
      }}
      onClick={onClick}
      whileHover={!isOffline ? { filter: "brightness(1.05)" } : undefined}
    >
      {/* Biome atmosphere gradient — stronger */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-500" style={{
        background: biomeInfo.gradient,
        opacity: isSelected ? 1 : 0.8,
      }} />

      {/* Selection glow — stronger */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            boxShadow: `inset 0 0 80px ${color}25, inset 0 0 40px ${color}15`,
          }}
        />
      )}

      {/* Biome decorations */}
      <div className="absolute inset-0" style={{
        animationPlayState: isOffline ? "paused" : "running",
      }}>
        {biomeType === "zen" && <ZenBiome isWorking={isWorking} />}
        {biomeType === "jungle" && <JungleBiome isWorking={isWorking} />}
        {biomeType === "volcanic" && <VolcanicBiome isWorking={isWorking} />}
        {biomeType === "sea" && <SeaBiome isWorking={isWorking} />}
      </div>

      {/* Zone divider */}
      {zoneIndex > 0 && (
        <div className="absolute top-0 bottom-0 left-0 pointer-events-none" style={{
          width: 1,
          background: "linear-gradient(180deg, transparent 5%, rgba(255,255,255,0.06) 50%, transparent 95%)",
        }} />
      )}

      {/* Agent avatar — BIGGER */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ top: "38%" }}>
        <motion.div
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 80,
            height: 80,
            background: `radial-gradient(circle, ${color}30 0%, ${color}12 50%, transparent 100%)`,
            border: `2px solid ${color}50`,
            boxShadow: isWorking
              ? `0 0 25px ${color}40, 0 0 50px ${color}20, inset 0 0 15px ${color}15`
              : `0 0 15px ${color}20, inset 0 0 8px ${color}08`,
            transition: "box-shadow 0.5s ease",
          }}
          animate={isSelected ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <span className="text-3xl select-none" style={{ filter: isOffline ? "grayscale(1)" : "none" }}>
            {config.emoji}
          </span>

          {/* Working pulse rings */}
          {isWorking && !isOffline && (
            <>
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                border: `1.5px solid ${color}50`,
                animation: "energy-expand 2s ease-out infinite",
              }} />
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                border: `1.5px solid ${color}35`,
                animation: "energy-expand 2s ease-out 0.7s infinite",
              }} />
            </>
          )}
        </motion.div>

        {/* Name + status */}
        <div className="flex items-center gap-2 mt-3">
          <div className="rounded-full" style={{
            width: 6, height: 6,
            background: isOffline ? "rgba(100,100,100,0.5)" : color,
            boxShadow: isWorking ? `0 0 8px ${color}` : "none",
            animation: isWorking ? "pulse-glow 2s ease-in-out infinite" : "none",
          }} />
          <span style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: isOffline ? "rgba(100,100,100,0.5)" : color,
            letterSpacing: "0.04em",
            textShadow: isOffline ? "none" : `0 0 12px ${color}50`,
          }}>
            {agentName}
          </span>
        </div>

        {/* Role */}
        <span style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 10,
          fontWeight: 400,
          color: "rgba(200,220,200,0.6)",
          marginTop: 2,
        }}>
          {config.role}
        </span>

        {/* Ops */}
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: "rgba(180,200,180,0.45)",
          marginTop: 4,
          fontVariantNumeric: "tabular-nums",
        }}>
          {agent.tasksCompleted} ops
        </span>
      </div>
    </motion.div>
  );
}
