// DistrictLabel.tsx — Floating holographic district signs

import { motion } from "framer-motion";
import type { District } from "./cityConfig";
import { BUILDING_WIDTH, PLOTS_PER_ROW, STREET_WIDTH } from "./cityConfig";

interface DistrictLabelProps {
  district: District;
  x: number;
  y: number;
  buildingCount: number;
}

export function DistrictLabel({ district, x, y, buildingCount }: DistrictLabelProps) {
  const totalWidth = PLOTS_PER_ROW * BUILDING_WIDTH + (PLOTS_PER_ROW - 1) * STREET_WIDTH;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: x - 10,
        top: y - 50,
        width: totalWidth + 20,
        zIndex: 1000,
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Floating label container */}
      <motion.div
        className="flex items-center gap-3"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Left bracket line */}
        <div
          className="flex-1"
          style={{
            height: 1,
            background: `linear-gradient(to right, transparent, ${district.accentHex}44)`,
          }}
        />

        {/* Label pill */}
        <div
          className="flex items-center gap-2 px-3 py-1 font-mono"
          style={{
            background: "rgba(4,6,20,0.9)",
            border: `1px solid ${district.accentHex}55`,
            borderRadius: 2,
            boxShadow: `0 0 16px ${district.accentHex}22, inset 0 0 10px ${district.accentHex}08`,
            backdropFilter: "blur(4px)",
          }}
        >
          <span style={{ fontSize: 12 }}>{district.emoji}</span>
          <span
            className="uppercase tracking-widest"
            style={{
              fontSize: 9,
              color: district.accentHex,
              textShadow: `0 0 8px ${district.accentHex}, 0 0 20px ${district.accentHex}44`,
              letterSpacing: "0.2em",
            }}
          >
            [ {district.name} ]
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: 8,
              color: `${district.accentHex}88`,
              marginLeft: 4,
            }}
          >
            {buildingCount}
          </span>
        </div>

        {/* Right bracket line */}
        <div
          className="flex-1"
          style={{
            height: 1,
            background: `linear-gradient(to left, transparent, ${district.accentHex}44)`,
          }}
        />
      </motion.div>

      {/* Subtle glow beneath label */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: "100%",
          transform: "translateX(-50%)",
          width: 80,
          height: 20,
          background: `radial-gradient(ellipse, ${district.accentHex}22 0%, transparent 70%)`,
          filter: "blur(4px)",
        }}
      />
    </motion.div>
  );
}
