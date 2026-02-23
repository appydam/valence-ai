// CityGround.tsx — Isometric ground plane with green grass tiles and district labels

import { DISTRICTS, ISO_TILE_W, ISO_TILE_H, ISO_SPACING, toIsometric } from "./cityConfig";
import type { IsometricEntry } from "./cityConfig";

interface CityGroundProps {
  buildings: IsometricEntry[];
}

interface ZoneBound {
  districtId: string;
  name: string;
  emoji: string;
  accentHex: string;
  centerScreenX: number;
  centerScreenY: number;
}

function computeZones(buildings: IsometricEntry[]): ZoneBound[] {
  const grouped: Record<string, IsometricEntry[]> = {};
  for (const b of buildings) {
    const id = b.district.id;
    if (!grouped[id]) grouped[id] = [];
    grouped[id].push(b);
  }

  return Object.entries(grouped).map(([id, bldgs]) => {
    const district = DISTRICTS.find((d) => d.id === id)!;
    const avgX = bldgs.reduce((s, b) => s + b.screenX, 0) / bldgs.length;
    const avgY = bldgs.reduce((s, b) => s + b.screenY, 0) / bldgs.length;
    return {
      districtId: id,
      name: district.name,
      emoji: district.emoji,
      accentHex: district.accentHex,
      centerScreenX: avgX,
      centerScreenY: avgY,
    };
  });
}

export function CityGround({ buildings }: CityGroundProps) {
  const zones = computeZones(buildings);

  // Build a set of occupied cells
  const occupied = new Set(buildings.map((b) => `${b.gridX},${b.gridY}`));

  // Wider grid to cover the full layout
  const gridTiles: { screenX: number; screenY: number; gx: number; gy: number; hasBuilding: boolean }[] = [];
  for (let gx = -2; gx <= 20; gx++) {
    for (let gy = -2; gy <= 8; gy++) {
      const { screenX, screenY } = toIsometric(gx, gy);
      gridTiles.push({ screenX, screenY, gx, gy, hasBuilding: occupied.has(`${gx},${gy}`) });
    }
  }

  const halfW = (ISO_TILE_W * ISO_SPACING) / 2;
  const halfH = (ISO_TILE_H * ISO_SPACING) / 2;

  // Seeded color variation
  const tileColor = (gx: number, gy: number, hasBuilding: boolean) => {
    const n = Math.sin(gx * 127.1 + gy * 311.7) * 43758.5453;
    const r = n - Math.floor(n);
    // Find if this cell has a nearby building (for district color)
    const nearbyBuilding = buildings.find((b) =>
      Math.abs(b.gridX - gx) <= 1 && Math.abs(b.gridY - gy) <= 1
    );

    if (hasBuilding && nearbyBuilding) {
      // Building cell: slightly tinted with district color
      return `${nearbyBuilding.district.accentHex}15`;
    }
    if (nearbyBuilding) {
      return `${nearbyBuilding.district.accentHex}08`;
    }
    // Grass color with slight variation
    const green = Math.floor(65 + r * 20);
    const alpha = 0.25 + r * 0.1;
    return `rgba(50,${green},35,${alpha})`;
  };

  return (
    <>
      {/* Isometric diamond grid tiles — green grass */}
      <svg
        className="absolute pointer-events-none"
        style={{ left: 0, top: 0, width: "100%", height: "100%", overflow: "visible", zIndex: 0 }}
      >
        {gridTiles.map(({ screenX, screenY, gx, gy, hasBuilding }) => (
          <polygon
            key={`${gx}-${gy}`}
            points={`${screenX},${screenY - halfH} ${screenX + halfW},${screenY} ${screenX},${screenY + halfH} ${screenX - halfW},${screenY}`}
            fill={tileColor(gx, gy, hasBuilding)}
            stroke="rgba(40,70,30,0.15)"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      {/* Cobblestone paths between districts */}
      <svg
        className="absolute pointer-events-none"
        style={{ left: 0, top: 0, width: "100%", height: "100%", overflow: "visible", zIndex: 1 }}
      >
        {zones.length > 1 && zones.slice(0, -1).map((zone, i) => {
          const next = zones[i + 1];
          return (
            <line
              key={`path-${i}`}
              x1={zone.centerScreenX}
              y1={zone.centerScreenY}
              x2={next.centerScreenX}
              y2={next.centerScreenY}
              stroke="rgba(140,110,70,0.18)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="5 8"
            />
          );
        })}
      </svg>

      {/* District zone labels */}
      {zones.map((zone) => (
        <div
          key={zone.districtId}
          className="absolute pointer-events-none flex flex-col items-center"
          style={{
            left: zone.centerScreenX,
            top: zone.centerScreenY + 20,
            transform: "translate(-50%, 0)",
            zIndex: 2,
          }}
        >
          <span
            className="font-mono uppercase tracking-wider text-center whitespace-nowrap"
            style={{
              fontSize: 9,
              color: zone.accentHex,
              textShadow: `0 0 8px ${zone.accentHex}55, 0 1px 3px rgba(0,0,0,0.4)`,
              opacity: 0.9,
              background: "rgba(0,0,0,0.3)",
              padding: "2px 8px",
              borderRadius: 4,
              letterSpacing: "0.12em",
              backdropFilter: "blur(4px)",
            }}
          >
            {zone.emoji} {zone.name}
          </span>
        </div>
      ))}
    </>
  );
}
