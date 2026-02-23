// CityView.tsx — Front-facing skyline: all buildings visible, auto-scaled

import { useRef, useEffect, useState, useMemo } from "react";
import { CityAtmosphere } from "./CityAtmosphere";
import { CityAgents } from "./CityAgents";
import { BuildingBlock } from "./BuildingBlock";
import {
  DISTRICTS,
  getCategoryDistrict,
  getSkylineLayout,
  SKY_GROUND_Y_PCT,
} from "./cityConfig";
import { BLUEPRINT_LOGOS } from "@/lib/integrationLogos";

export interface CityBlueprint {
  _id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  authType: string;
  toolCount: number;
  isConnected: boolean;
}

interface CityAgent {
  id: string;
  name: string;
  color: string;
  status: string;
}

interface CityViewProps {
  blueprints: CityBlueprint[];
  agents: CityAgent[];
  selectedBlueprintId: string | null;
  onBuildingSelect: (id: string | null) => void;
}

export function CityView({ blueprints, agents, selectedBlueprintId, onBuildingSelect }: CityViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 700 });

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const totalConnected = blueprints.filter((b) => b.isConnected).length;
  const activeDistricts = DISTRICTS.filter((d) =>
    blueprints.some((bp) => getCategoryDistrict(bp.category).id === d.id)
  );

  // Compute skyline layout (includes totalWidth for proper scaling)
  const { buildings, totalWidth } = useMemo(() => getSkylineLayout(blueprints), [blueprints]);

  // Auto-fit scale and position
  const { scale, offsetX, groundY } = useMemo(() => {
    const gY = containerSize.height * SKY_GROUND_Y_PCT;

    if (buildings.length === 0 || totalWidth <= 0) {
      return { scale: 1, offsetX: 0, groundY: gY };
    }

    const tallestH = Math.max(...buildings.map((b) => b.buildingHeight));
    const availH = gY * 0.90;

    const sW = (containerSize.width - 24) / totalWidth;
    const sH = availH / tallestH;
    const s = Math.min(sW, sH);

    // Center horizontally
    const scaledW = totalWidth * s;
    const ox = (containerSize.width - scaledW) / 2;

    return { scale: s, offsetX: ox, groundY: gY };
  }, [buildings, totalWidth, containerSize]);

  // Compute district label positions
  const districtLabels = useMemo(() => {
    const labelMap: Record<string, { minX: number; maxX: number; district: typeof buildings[0]["district"] }> = {};
    for (const b of buildings) {
      const id = b.district.id;
      const scaledLeftX = offsetX + b.x * scale;
      const scaledRightX = scaledLeftX + b.buildingWidth * scale;
      if (!labelMap[id]) {
        labelMap[id] = { minX: scaledLeftX, maxX: scaledRightX, district: b.district };
      } else {
        labelMap[id].minX = Math.min(labelMap[id].minX, scaledLeftX);
        labelMap[id].maxX = Math.max(labelMap[id].maxX, scaledRightX);
      }
    }
    return Object.values(labelMap);
  }, [buildings, offsetX, scale]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{
        height: "calc(100vh - 160px)",
        cursor: "default",
      }}
    >
      {/* Sky background */}
      <CityAtmosphere
        containerWidth={containerSize.width}
        containerHeight={containerSize.height}
        activeDistricts={activeDistricts}
        totalConnected={totalConnected}
        totalBlueprints={blueprints.length}
      />

      {/* Ground / street */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 0,
          right: 0,
          top: groundY,
          bottom: 0,
          background: "linear-gradient(180deg, #5a4832 0%, #3a2e1e 35%, #241a10 100%)",
          borderTop: "3px solid #8a7055",
          zIndex: 5,
        }}
      />

      {/* Sidewalk strip */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 0,
          right: 0,
          top: groundY - 7,
          height: 7,
          background: "#a09070",
          borderTop: "1px solid #c0b088",
          zIndex: 5,
        }}
      />

      {/* Agent walkers along the street */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 0,
          right: 0,
          top: groundY - 28,
          height: 48,
          zIndex: 6,
        }}
      >
        <CityAgents agents={agents} cityWidth={containerSize.width} />
      </div>

      {/* District labels on ground */}
      {districtLabels.map((entry) => {
        const cx = (entry.minX + entry.maxX) / 2;
        return (
          <div
            key={entry.district.id}
            className="absolute pointer-events-none font-mono"
            style={{
              left: cx,
              top: groundY + 12,
              transform: "translateX(-50%)",
              zIndex: 10,
              fontSize: 8,
              color: `${entry.district.accentHex}cc`,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              background: "rgba(0,0,0,0.35)",
              padding: "1px 7px",
              borderRadius: 3,
              backdropFilter: "blur(4px)",
              whiteSpace: "nowrap",
            }}
          >
            {entry.district.emoji} {entry.district.name}
          </div>
        );
      })}

      {/* Buildings */}
      {buildings.map((entry, i) => (
        <BuildingBlock
          key={entry.blueprint._id}
          blueprint={{
            ...entry.blueprint,
            logoUrl: BLUEPRINT_LOGOS[entry.blueprint.slug],
          }}
          district={entry.district}
          leftX={offsetX + entry.x * scale}
          groundY={groundY}
          isSelected={selectedBlueprintId === entry.blueprint._id}
          onClick={() =>
            onBuildingSelect(selectedBlueprintId === entry.blueprint._id ? null : entry.blueprint._id)
          }
          animationDelay={i * 0.035}
          tier={entry.tier}
          buildingHeight={entry.buildingHeight * scale}
          buildingWidth={entry.buildingWidth * scale}
          depth={entry.depth * scale}
          shape={entry.shape}
          windowCols={entry.windowCols}
        />
      ))}

      {/* Bottom hint */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono pointer-events-none"
        style={{
          fontSize: 9,
          color: "rgba(200,180,140,0.6)",
          letterSpacing: "0.12em",
          background: "rgba(0,0,0,0.25)",
          padding: "2px 10px",
          borderRadius: 4,
          zIndex: 999,
        }}
      >
        CLICK BUILDING TO INSPECT
      </div>
    </div>
  );
}
