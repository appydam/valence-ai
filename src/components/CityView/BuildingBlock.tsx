// BuildingBlock.tsx — Polished front-facing 3D buildings with rich details

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { getWindowGrid } from "./cityConfig";
import type { BuildingTier, BuildingShape, District } from "./cityConfig";

export interface BlueprintBuilding {
  _id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  authType: string;
  toolCount: number;
  isConnected: boolean;
  logoUrl?: string;
}

interface BuildingBlockProps {
  blueprint: BlueprintBuilding;
  district: District;
  leftX: number;
  groundY: number;
  isSelected: boolean;
  onClick: () => void;
  animationDelay: number;
  tier: BuildingTier;
  buildingHeight: number;
  buildingWidth: number;
  depth: number;
  shape: BuildingShape;
  windowCols: number;
}

// ── Palettes — lighter, more glass-like modern buildings ─────────────────────
interface Palette {
  glass1: string;     // main body gradient start (lighter)
  glass2: string;     // main body gradient end
  frame: string;      // window frame / mullion color
  side: string;       // right side face
  roof: string;       // top cap
  accent: string;     // district highlight
  winLit: string;     // lit window
  winDim: string;     // unlit window
  ledge: string;      // floor ledge lines
}

const PALETTES: Record<string, Palette> = {
  crm:     { glass1: "#2a5a90", glass2: "#1a3a60", frame: "#1e4a7a", side: "#122e50", roof: "#0e2240", accent: "#5b9ef6", winLit: "#c4dfff", winDim: "#1e3858", ledge: "#3a6aa0" },
  comms:   { glass1: "#287048", glass2: "#164428", frame: "#1e5a38", side: "#0e3420", roof: "#0a2818", accent: "#4ae07a", winLit: "#b0ffc8", winDim: "#1a4028", ledge: "#2e7a50" },
  dev:     { glass1: "#4a3080", glass2: "#2c1850", frame: "#3a2468", side: "#1e1040", roof: "#140a30", accent: "#c070ff", winLit: "#e0c0ff", winDim: "#2e1858", ledge: "#5a3a90" },
  finance: { glass1: "#786018", glass2: "#4a3a0c", frame: "#604810", side: "#382c08", roof: "#2a2006", accent: "#f0c830", winLit: "#fff4a0", winDim: "#443810", ledge: "#907020" },
  support: { glass1: "#7a2838", glass2: "#4c141e", frame: "#62202e", side: "#3a0e14", roof: "#2c080e", accent: "#ff6080", winLit: "#ffc0cc", winDim: "#481420", ledge: "#903040" },
  misc:    { glass1: "#185870", glass2: "#0c3448", frame: "#144058", side: "#082430", roof: "#061a24", accent: "#30d0f0", winLit: "#a0f0ff", winDim: "#103040", ledge: "#207080" },
};

function pal(id: string): Palette { return PALETTES[id] ?? PALETTES.misc; }

// ── Window grid with mullion frame lines ────────────────────────────────────
function WindowSection({ cols, height, reserveBottom, p, connected, floorLines }: {
  cols: number; height: number; reserveBottom: number; p: Palette; connected: boolean; floorLines?: boolean;
}) {
  const rowH = 12;
  const colGap = 3;
  const rowGap = floorLines ? 6 : 4;
  const rows = Math.max(1, Math.floor((height - reserveBottom - 16) / (rowH + rowGap)));
  const wins = useMemo(() => getWindowGrid(height, connected), [height, connected]);

  return (
    <div className="absolute" style={{
      top: 10, left: 8, right: 8, bottom: reserveBottom,
    }}>
      {/* Horizontal floor ledges */}
      {floorLines && Array.from({ length: Math.min(rows, 20) }, (_, r) => (
        <div key={`floor-${r}`} className="absolute pointer-events-none" style={{
          left: -4, right: -4, top: r * (rowH + rowGap) + rowH + 8,
          height: 1, background: `${p.ledge}30`,
        }} />
      ))}
      {/* Window grid */}
      <div style={{
        display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: `${rowGap}px ${colGap}px`, alignContent: "start",
      }}>
        {wins.slice(0, cols * rows).map((w, i) => {
          const lit = w.lit && connected;
          const dimLit = w.lit && !connected;
          return (
            <div key={i} style={{
              height: rowH,
              borderRadius: 1,
              background: lit ? p.winLit : dimLit ? `${p.winLit}30` : p.winDim,
              opacity: lit ? 0.92 : dimLit ? 0.18 : 0.06,
              boxShadow: lit ? `0 0 4px ${p.winLit}88, 0 0 10px ${p.winLit}44` : "none",
              border: `0.5px solid ${p.frame}44`,
            }} />
          );
        })}
      </div>
    </div>
  );
}

// ── Logo panel — bright, high contrast ──────────────────────────────────────
function LogoPanel({ blueprint, size, p }: { blueprint: BlueprintBuilding; size: number; p: Palette }) {
  const on = blueprint.isConnected;
  return (
    <div className="absolute flex items-center justify-center" style={{
      left: 6, right: 6, bottom: 16,
      height: size + 20,
      background: on
        ? `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)`
        : "rgba(0,0,0,0.3)",
      borderRadius: 5,
      border: `1px solid ${on ? `${p.accent}55` : "rgba(255,255,255,0.05)"}`,
      backdropFilter: "blur(2px)",
    }}>
      {blueprint.logoUrl ? (
        <img src={blueprint.logoUrl} alt={blueprint.name} style={{
          width: size, height: size, objectFit: "contain",
          filter: on
            ? `drop-shadow(0 0 8px ${p.accent}) drop-shadow(0 0 16px ${p.accent}88) brightness(1.2) contrast(1.1)`
            : "grayscale(0.8) opacity(0.3) brightness(0.7)",
          transition: "filter 0.4s",
        }} />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: 8,
          background: `${p.accent}20`, border: `2px solid ${p.accent}66`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.5, color: p.accent, fontWeight: 800, fontFamily: "monospace",
          textShadow: `0 0 12px ${p.accent}`,
        }}>
          {blueprint.name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

// ── Name tag ─────────────────────────────────────────────────────────────────
function NameTag({ name, accent }: { name: string; accent: string }) {
  return (
    <div className="absolute left-0 right-0 flex justify-center" style={{ bottom: 3, height: 12 }}>
      <span className="font-mono uppercase truncate" style={{
        fontSize: 7, color: `${accent}ee`, letterSpacing: "0.1em", lineHeight: "12px",
        padding: "0 4px", textShadow: `0 0 6px ${accent}44`,
      }}>
        {name}
      </span>
    </div>
  );
}

// ── Connection beacon ────────────────────────────────────────────────────────
function Beacon({ on, accent }: { on: boolean; accent: string }) {
  return (
    <div className="absolute" style={{
      top: 5, right: 6, width: 7, height: 7, borderRadius: "50%",
      background: on ? "#22c55e" : "#555",
      boxShadow: on ? "0 0 6px #22c55e, 0 0 14px #22c55e66" : "none",
      animation: on ? "pulse-glow 2s ease-in-out infinite" : "none",
    }} />
  );
}

// ── Side face with subtle window lines ───────────────────────────────────────
function Side({ w, h, top, depth, p, connected }: {
  w: number; h: number; top: number; depth: number; p: Palette; connected: boolean;
}) {
  const sideW = depth * 0.55;
  const lines = Math.min(12, Math.floor((h - 16) / 14));
  return (
    <div className="absolute overflow-hidden" style={{
      left: w, top: top + depth * 0.18, width: sideW, height: h - depth * 0.18,
      background: `linear-gradient(180deg, ${p.side}ee 0%, ${p.side} 100%)`,
      borderRight: "1px solid rgba(0,0,0,0.35)",
      borderBottom: "1px solid rgba(0,0,0,0.35)",
      transform: "skewY(-30deg)", transformOrigin: "top left",
    }}>
      {/* Side window rows (simple horizontal lines) */}
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="absolute" style={{
          left: 3, right: 3, top: 8 + i * ((h - 20) / lines),
          height: 5, borderRadius: 1,
          background: connected ? `${p.winLit}28` : `${p.winDim}55`,
        }} />
      ))}
    </div>
  );
}

// ── Roof / top cap ───────────────────────────────────────────────────────────
function Roof({ w, topY, depth, p, selected }: {
  w: number; topY: number; depth: number; p: Palette; selected: boolean;
}) {
  const h = depth * 0.32;
  return (
    <>
      {/* Roof slab */}
      <div className="absolute pointer-events-none" style={{
        left: 0, top: topY, width: w, height: h,
        marginTop: -h,
        background: `linear-gradient(135deg, ${p.roof}ee, ${p.roof})`,
        border: "1px solid rgba(255,255,255,0.05)", borderBottom: "none",
        transform: "skewX(-8deg)", transformOrigin: "bottom left",
        boxShadow: selected ? `0 -2px 10px ${p.accent}55` : "none",
      }} />
      {/* Rooftop details */}
      <div className="absolute pointer-events-none" style={{
        left: 8, top: topY - h + 2, width: 14, height: 6,
        background: "rgba(255,255,255,0.06)", borderRadius: 1,
      }} />
      <div className="absolute pointer-events-none" style={{
        left: 28, top: topY - h + 3, width: 10, height: 4,
        background: "rgba(255,255,255,0.04)", borderRadius: 1,
      }} />
    </>
  );
}

// ── Entrance / ground floor canopy ───────────────────────────────────────────
function Entrance({ w, bottomY, p }: { w: number; bottomY: number; p: Palette }) {
  return (
    <>
      {/* Canopy overhang */}
      <div className="absolute pointer-events-none" style={{
        left: Math.round(w * 0.2), top: bottomY - 3,
        width: Math.round(w * 0.6), height: 3,
        background: p.ledge, borderRadius: "2px 2px 0 0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
      }} />
      {/* Door */}
      <div className="absolute pointer-events-none" style={{
        left: Math.round(w * 0.38), top: bottomY - 1,
        width: Math.round(w * 0.24), height: 1,
        background: `${p.accent}66`,
      }} />
    </>
  );
}

// ── Front face (main building body) ──────────────────────────────────────────
function FrontFace({ w, h, top, p, selected, hovered, children }: {
  w: number; h: number; top: number; p: Palette; selected: boolean; hovered: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute overflow-hidden" style={{
      left: 0, top, width: w, height: h,
      background: `linear-gradient(178deg, ${p.glass1} 0%, ${p.glass2} 100%)`,
      border: `1px solid ${selected ? p.accent : hovered ? `${p.accent}66` : "rgba(255,255,255,0.08)"}`,
      borderBottom: `3px solid ${p.frame}88`,
      boxShadow: selected
        ? `0 0 24px ${p.accent}55, inset 0 1px 0 rgba(255,255,255,0.08)`
        : hovered
        ? `0 0 14px ${p.accent}28, inset 0 1px 0 rgba(255,255,255,0.06)`
        : `inset 0 1px 0 rgba(255,255,255,0.06)`,
      transition: "box-shadow 0.25s, border-color 0.25s",
    }}>
      {/* Vertical mullion lines (glass curtain wall effect) */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `repeating-linear-gradient(90deg, ${p.frame}10 0px, ${p.frame}10 1px, transparent 1px, transparent ${Math.round(w / 5)}px)`,
      }} />
      {/* Diagonal glass reflection */}
      <div className="absolute pointer-events-none" style={{
        top: 0, left: 0, width: "40%", height: "100%",
        background: "linear-gradient(125deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 30%, transparent 50%)",
      }} />
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export function BuildingBlock({
  blueprint, district, leftX, groundY, isSelected, onClick,
  animationDelay, tier, buildingHeight: height, buildingWidth: width, depth, shape, windowCols,
}: BuildingBlockProps) {
  const [hovered, setHovered] = useState(false);
  const p = pal(district.id);
  const roofH = depth * 0.32;
  const sideW = depth * 0.55;
  const topY = groundY - height;
  const logoSize = Math.min(width * 0.72, 82);
  const logoReserve = logoSize + 34;

  const isTall = tier === "tower" || tier === "skyscraper";

  // Shape-specific offsets
  const crownExtra = shape === "crowned" ? 18 : 0;
  const containerTop = topY - roofH - crownExtra;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: leftX, top: containerTop,
        width: width + sideW + 2,
        height: height + roofH + crownExtra + 28,
        transformOrigin: `${width / 2}px bottom`,
        zIndex: Math.floor(leftX),
      }}
      whileHover={{ y: -8, zIndex: 9999 }}
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Ground shadow */}
      <div className="absolute pointer-events-none" style={{
        left: -8, bottom: 16, width: width + sideW + 16, height: 18,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)",
        filter: "blur(6px)",
      }} />

      {/* Antenna (tall connected buildings) */}
      {isTall && blueprint.isConnected && (
        <div className="absolute pointer-events-none" style={{
          left: width / 2 - 1, top: crownExtra,
          width: 2, height: tier === "skyscraper" ? 22 : 14,
          background: "linear-gradient(to top, rgba(180,180,180,0.8), transparent)",
        }}>
          <motion.div className="absolute" style={{
            left: -2, top: -5, width: 6, height: 6, borderRadius: "50%",
            background: "#ff4444", boxShadow: "0 0 8px #ff4444",
          }} animate={{ opacity: [1, 0.15, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
        </div>
      )}

      {/* ── SHAPE: SLAB (simple clean rectangle) ── */}
      {shape === "slab" && (() => {
        const bodyTop = crownExtra + roofH;
        return (
          <>
            <Roof w={width} topY={bodyTop} depth={depth} p={p} selected={isSelected} />
            <FrontFace w={width} h={height} top={bodyTop} p={p} selected={isSelected} hovered={hovered}>
              <WindowSection cols={windowCols} height={height} reserveBottom={logoReserve} p={p} connected={blueprint.isConnected} floorLines />
              <LogoPanel blueprint={blueprint} size={logoSize} p={p} />
              <NameTag name={blueprint.name} accent={p.accent} />
              <Beacon on={blueprint.isConnected} accent={p.accent} />
            </FrontFace>
            <Side w={width} h={height} top={bodyTop} depth={depth} p={p} connected={blueprint.isConnected} />
            <Entrance w={width} bottomY={bodyTop + height} p={p} />
          </>
        );
      })()}

      {/* ── SHAPE: SETBACK (wider base + narrower tower) ── */}
      {shape === "setback" && (() => {
        const baseRatio = 0.55;
        const baseH = Math.round(height * baseRatio);
        const towerH = height - baseH;
        const towerW = Math.round(width * 0.66);
        const inset = Math.round((width - towerW) / 2);
        const bodyTop = crownExtra + roofH;
        const towerDepth = Math.round(depth * 0.75);

        return (
          <>
            {/* Tower (upper) */}
            <Roof w={towerW} topY={bodyTop} depth={towerDepth} p={p} selected={isSelected} />
            <div className="absolute overflow-hidden" style={{
              left: inset, top: bodyTop, width: towerW, height: towerH,
              background: `linear-gradient(178deg, ${p.glass1} 0%, ${p.glass1}dd 100%)`,
              border: `1px solid ${isSelected ? p.accent : "rgba(255,255,255,0.07)"}`,
              borderBottom: "none",
            }}>
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `repeating-linear-gradient(90deg, ${p.frame}10 0px, ${p.frame}10 1px, transparent 1px, transparent ${Math.round(towerW / 4)}px)`,
              }} />
              <div className="absolute pointer-events-none" style={{ top: 0, left: 0, width: "35%", height: "100%", background: "linear-gradient(125deg, rgba(255,255,255,0.07), transparent 40%)" }} />
              <WindowSection cols={Math.max(2, windowCols - 1)} height={towerH} reserveBottom={4} p={p} connected={blueprint.isConnected} />
            </div>
            <Side w={inset + towerW} h={towerH} top={bodyTop} depth={towerDepth} p={p} connected={blueprint.isConnected} />

            {/* Ledge between tower and base */}
            <div className="absolute pointer-events-none" style={{
              left: 0, top: bodyTop + towerH, width, height: depth * 0.22,
              marginTop: -(depth * 0.22),
              background: `linear-gradient(90deg, ${p.ledge}44, ${p.ledge}22)`,
              borderTop: `1px solid ${p.ledge}66`,
            }} />

            {/* Base (lower, wider) */}
            <FrontFace w={width} h={baseH} top={bodyTop + towerH} p={p} selected={isSelected} hovered={hovered}>
              <WindowSection cols={windowCols} height={baseH} reserveBottom={logoReserve} p={p} connected={blueprint.isConnected} floorLines />
              <LogoPanel blueprint={blueprint} size={logoSize} p={p} />
              <NameTag name={blueprint.name} accent={p.accent} />
              <Beacon on={blueprint.isConnected} accent={p.accent} />
            </FrontFace>
            <Side w={width} h={baseH} top={bodyTop + towerH} depth={depth} p={p} connected={blueprint.isConnected} />
            <Entrance w={width} bottomY={bodyTop + height} p={p} />
          </>
        );
      })()}

      {/* ── SHAPE: CROWNED (accent crown on top) ── */}
      {shape === "crowned" && (() => {
        const crownH = 18;
        const bodyTop = crownH + roofH;
        return (
          <>
            {/* Crown — glowing accent band */}
            <div className="absolute" style={{
              left: 2, top: 0, width: width - 4, height: crownH,
              background: `linear-gradient(180deg, ${p.accent}44 0%, ${p.accent}18 100%)`,
              borderRadius: "4px 4px 0 0",
              border: `1px solid ${p.accent}33`, borderBottom: "none",
              boxShadow: `0 0 12px ${p.accent}22, inset 0 0 8px ${p.accent}18`,
            }}>
              {/* Crown windows */}
              <div className="absolute flex gap-1 items-center justify-center" style={{ inset: 4 }}>
                {Array.from({ length: Math.min(windowCols + 1, 6) }, (_, i) => (
                  <div key={i} style={{
                    flex: 1, height: "70%", borderRadius: 1,
                    background: blueprint.isConnected ? `${p.accent}55` : `${p.accent}15`,
                  }} />
                ))}
              </div>
            </div>

            <Roof w={width} topY={bodyTop} depth={depth} p={p} selected={isSelected} />
            <FrontFace w={width} h={height} top={bodyTop} p={p} selected={isSelected} hovered={hovered}>
              {/* Subtle horizontal band texture */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 24px)",
              }} />
              <WindowSection cols={windowCols} height={height} reserveBottom={logoReserve} p={p} connected={blueprint.isConnected} floorLines />
              <LogoPanel blueprint={blueprint} size={logoSize} p={p} />
              <NameTag name={blueprint.name} accent={p.accent} />
              <Beacon on={blueprint.isConnected} accent={p.accent} />
            </FrontFace>
            <Side w={width} h={height} top={bodyTop} depth={depth} p={p} connected={blueprint.isConnected} />
            <Entrance w={width} bottomY={bodyTop + height} p={p} />
          </>
        );
      })()}

      {/* Selection ring */}
      {isSelected && (
        <motion.div className="absolute pointer-events-none" style={{
          left: -3, top: crownExtra + roofH - 3, width: width + 6, height: height + 6,
          border: `2px solid ${p.accent}`, borderRadius: 4,
          boxShadow: `0 0 16px ${p.accent}66, 0 0 32px ${p.accent}30`,
        }} animate={{ opacity: [0.65, 1, 0.65] }} transition={{ duration: 2, repeat: Infinity }} />
      )}
    </motion.div>
  );
}
