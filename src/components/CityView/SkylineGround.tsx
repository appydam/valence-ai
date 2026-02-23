// SkylineGround.tsx — Ground plane with per-district color zones and labels

import type { SkylineEntry } from "./cityConfig";
import { SKYLINE_BUILDING_WIDTH, SKYLINE_GROUND_HEIGHT } from "./cityConfig";

interface DistrictZone {
  districtId: string;
  districtName: string;
  emoji: string;
  accentHex: string;
  color: string;
  startX: number;
  endX: number;
  buildingCount: number;
}

interface SkylineGroundProps {
  entries: SkylineEntry[];
  groundY: number;       // y position of the ground line in the city plane
  totalWidth: number;
}

export function SkylineGround({ entries, groundY, totalWidth }: SkylineGroundProps) {
  // Compute district zones from entries
  const zones: DistrictZone[] = [];
  let currentZone: DistrictZone | null = null;

  for (const entry of entries) {
    if (!currentZone || currentZone.districtId !== entry.district.id) {
      currentZone = {
        districtId: entry.district.id,
        districtName: entry.district.name,
        emoji: entry.district.emoji,
        accentHex: entry.district.accentHex,
        color: entry.district.color,
        startX: entry.x,
        endX: entry.x + SKYLINE_BUILDING_WIDTH,
        buildingCount: 1,
      };
      zones.push(currentZone);
    } else {
      currentZone.endX = entry.x + SKYLINE_BUILDING_WIDTH;
      currentZone.buildingCount++;
    }
  }

  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: 0, top: groundY, width: totalWidth + 40, height: SKYLINE_GROUND_HEIGHT }}
    >
      {/* Main ground line */}
      <div
        className="absolute"
        style={{
          left: 0,
          top: 0,
          width: "100%",
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(0,200,255,0.4) 10%, rgba(0,200,255,0.4) 90%, transparent)",
          boxShadow: "0 0 12px rgba(0,200,255,0.3), 0 0 40px rgba(0,200,255,0.1)",
        }}
      />

      {/* Per-district colored zones */}
      {zones.map((zone) => (
        <div key={zone.districtId}>
          {/* Colored ground glow under buildings */}
          <div
            className="absolute"
            style={{
              left: zone.startX - 4,
              top: 0,
              width: zone.endX - zone.startX + 8,
              height: 3,
              background: zone.accentHex,
              opacity: 0.7,
              boxShadow: `0 0 16px ${zone.accentHex}, 0 0 40px ${zone.accentHex}55`,
              borderRadius: 1,
            }}
          />

          {/* District zone background glow */}
          <div
            className="absolute"
            style={{
              left: zone.startX - 4,
              top: 3,
              width: zone.endX - zone.startX + 8,
              height: 20,
              background: `linear-gradient(to bottom, ${zone.accentHex}18, transparent)`,
              borderRadius: "0 0 4px 4px",
            }}
          />

          {/* District label below ground */}
          <div
            className="absolute flex flex-col items-center"
            style={{
              left: zone.startX,
              top: 8,
              width: zone.endX - zone.startX,
            }}
          >
            <span
              className="font-mono uppercase tracking-widest truncate text-center"
              style={{
                fontSize: 8,
                color: zone.accentHex,
                textShadow: `0 0 8px ${zone.accentHex}`,
                opacity: 0.85,
                letterSpacing: "0.12em",
              }}
            >
              {zone.emoji} {zone.districtName}
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: 7,
                color: `${zone.accentHex}88`,
                marginTop: 1,
              }}
            >
              {zone.buildingCount} integration{zone.buildingCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      ))}

      {/* Horizon glow */}
      <div
        className="absolute"
        style={{
          left: 0,
          top: 0,
          width: "100%",
          height: 6,
          background: "linear-gradient(to bottom, rgba(0,180,255,0.06), transparent)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
