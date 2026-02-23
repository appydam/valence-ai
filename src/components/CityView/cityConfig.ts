// cityConfig.ts — Grid math, district definitions, building formulas for Integration City

import type { IntegrationCategory } from "@/data/integrations";

// ── Grid constants (legacy) ──────────────────────────────────────────────────
export const PLOT_SIZE = 110;
export const STREET_WIDTH = 28;
export const DISTRICT_GAP = 50;
export const PLOTS_PER_ROW = 4;

// ── Building dimensions (legacy) ─────────────────────────────────────────────
export const BUILDING_BASE_HEIGHT = 55;
export const BUILDING_MAX_HEIGHT = 230;
export const TOOL_HEIGHT_STEP = 14;
export const BUILDING_WIDTH = 88;
export const BUILDING_DEPTH = 44;

export function getBuildingHeight(toolCount: number): number {
  return Math.min(
    BUILDING_MAX_HEIGHT,
    Math.max(BUILDING_BASE_HEIGHT, BUILDING_BASE_HEIGHT + toolCount * TOOL_HEIGHT_STEP)
  );
}

// ── District definitions ──────────────────────────────────────────────────────
export interface District {
  id: string;
  name: string;
  categories: IntegrationCategory[];
  color: string;
  accentHex: string;
  gridRow: number;
  emoji: string;
}

export const DISTRICTS: District[] = [
  {
    id: "crm",
    name: "CRM District",
    categories: ["CRM", "Sales"],
    color: "rgba(59,130,246,1)",
    accentHex: "#3b82f6",
    gridRow: 0,
    emoji: "🤝",
  },
  {
    id: "comms",
    name: "Comms Tower",
    categories: ["Communication", "Social Media"],
    color: "rgba(34,197,94,1)",
    accentHex: "#22c55e",
    gridRow: 1,
    emoji: "💬",
  },
  {
    id: "dev",
    name: "Dev Quarter",
    categories: ["Project Management", "Analytics", "Business Intelligence"],
    color: "rgba(168,85,247,1)",
    accentHex: "#a855f7",
    gridRow: 2,
    emoji: "⚙️",
  },
  {
    id: "finance",
    name: "Finance Plaza",
    categories: ["Accounting", "Payments", "E-commerce"],
    color: "rgba(234,179,8,1)",
    accentHex: "#eab308",
    gridRow: 3,
    emoji: "💳",
  },
  {
    id: "support",
    name: "Support Hub",
    categories: ["Support", "Marketing", "E-Signature"],
    color: "rgba(244,63,94,1)",
    accentHex: "#f43f5e",
    gridRow: 4,
    emoji: "🎧",
  },
  {
    id: "misc",
    name: "Innovation Zone",
    categories: ["File Storage", "Document & Knowledge", "Office Suite", "HR", "Design", "Advertising"],
    color: "rgba(6,182,212,1)",
    accentHex: "#06b6d4",
    gridRow: 5,
    emoji: "✨",
  },
];

export function getCategoryDistrict(category: string): District {
  return (
    DISTRICTS.find((d) => d.categories.includes(category as IntegrationCategory)) ??
    DISTRICTS[DISTRICTS.length - 1]
  );
}

// ── Legacy position helpers ──────────────────────────────────────────────────
export interface BuildingPosition {
  x: number;
  y: number;
}

export function getBuildingPosition(districtIndex: number, indexInDistrict: number): BuildingPosition {
  const col = indexInDistrict % PLOTS_PER_ROW;
  const row = Math.floor(indexInDistrict / PLOTS_PER_ROW);
  const districtYOffset = districtIndex * (PLOT_SIZE * 2.5 + DISTRICT_GAP);
  return {
    x: col * (PLOT_SIZE + STREET_WIDTH),
    y: districtYOffset + row * (PLOT_SIZE + STREET_WIDTH),
  };
}

export function getCityWidth(maxBuildingsPerRow: number = PLOTS_PER_ROW): number {
  return maxBuildingsPerRow * PLOT_SIZE + (maxBuildingsPerRow - 1) * STREET_WIDTH;
}

export function getCityHeight(totalDistricts: number, maxRowsPerDistrict: number = 2): number {
  return totalDistricts * (maxRowsPerDistrict * PLOT_SIZE + (maxRowsPerDistrict - 1) * STREET_WIDTH + DISTRICT_GAP);
}

// ── Window grid for buildings ─────────────────────────────────────────────────
export interface WindowCell {
  row: number;
  col: number;
  delay: number;
  lit: boolean;
}

export function getWindowGrid(height: number, isConnected: boolean): WindowCell[] {
  const rows = Math.max(2, Math.floor((height - 20) / 18));
  const cols = 3;
  const cells: WindowCell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        row: r,
        col: c,
        delay: (r * cols + c) * 0.3 + Math.random() * 0.5,
        lit: isConnected ? Math.random() > 0.2 : Math.random() > 0.7,
      });
    }
  }
  return cells;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ISOMETRIC CITY LAYOUT ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Isometric tile dimensions (2:1 ratio)
export const ISO_TILE_W = 160;
export const ISO_TILE_H = 80;
export const ISO_SPACING = 1.2; // grid spacing multiplier

// ── Building tiers ───────────────────────────────────────────────────────────
export type BuildingTier = "cottage" | "office" | "tower" | "skyscraper";

export interface TierConfig {
  tier: BuildingTier;
  width: number;
  minHeight: number;
  maxHeight: number;
  windowCols: number;
  depth: number; // side face depth
}

export const TIER_CONFIG: Record<BuildingTier, TierConfig> = {
  cottage:    { tier: "cottage",    width: 90,  minHeight: 120, maxHeight: 180, windowCols: 2, depth: 32 },
  office:     { tier: "office",     width: 110, minHeight: 220, maxHeight: 340, windowCols: 3, depth: 40 },
  tower:      { tier: "tower",      width: 130, minHeight: 360, maxHeight: 520, windowCols: 4, depth: 48 },
  skyscraper: { tier: "skyscraper", width: 160, minHeight: 540, maxHeight: 720, windowCols: 5, depth: 56 },
};

export function getTier(toolCount: number): BuildingTier {
  if (toolCount <= 3) return "cottage";
  if (toolCount <= 7) return "office";
  if (toolCount <= 12) return "tower";
  return "skyscraper";
}

export function getIsoHeight(toolCount: number, tier: BuildingTier): number {
  const cfg = TIER_CONFIG[tier];
  const t = Math.min(1, toolCount / 20); // normalize 0-20 tools to 0-1
  return Math.round(cfg.minHeight + t * (cfg.maxHeight - cfg.minHeight));
}

// ── Isometric coordinate conversion ──────────────────────────────────────────
export function toIsometric(gridX: number, gridY: number): { screenX: number; screenY: number } {
  const halfW = (ISO_TILE_W * ISO_SPACING) / 2;
  const halfH = (ISO_TILE_H * ISO_SPACING) / 2;
  return {
    screenX: (gridX - gridY) * halfW,
    screenY: (gridX + gridY) * halfH,
  };
}

// ── District zone assignments on the isometric grid ──────────────────────────
// Each district gets a rectangular zone on the grid.
// Buildings are placed within these zones.
interface DistrictZone {
  districtId: string;
  startRow: number;
  startCol: number;
  cols: number; // max columns available
}

// Wide horizontal layout — 3 districts across top row, 3 across bottom
// Each district gets a wide zone with buildings spread in 1-2 rows
const DISTRICT_ZONES: DistrictZone[] = [
  { districtId: "crm",     startRow: 0, startCol: 0,  cols: 5 },
  { districtId: "comms",   startRow: 0, startCol: 6,  cols: 4 },
  { districtId: "dev",     startRow: 0, startCol: 11, cols: 5 },
  { districtId: "finance", startRow: 3, startCol: 1,  cols: 4 },
  { districtId: "support", startRow: 3, startCol: 6,  cols: 5 },
  { districtId: "misc",    startRow: 3, startCol: 12, cols: 5 },
];

// ── Isometric layout entry ───────────────────────────────────────────────────
export interface IsometricEntry {
  blueprint: {
    _id: string;
    slug: string;
    name: string;
    description: string;
    category: string;
    authType: string;
    toolCount: number;
    isConnected: boolean;
  };
  district: District;
  screenX: number;
  screenY: number;
  gridX: number;
  gridY: number;
  tier: BuildingTier;
  buildingHeight: number;
  buildingWidth: number;
  depth: number;
}

// ── Decoration positions ─────────────────────────────────────────────────────
export interface DecorationEntry {
  type: "tree-green" | "tree-cherry" | "lamp";
  screenX: number;
  screenY: number;
  gridX: number;
  gridY: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── FRONT-FACING SKYLINE LAYOUT ───────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export const SKY_GROUND_Y_PCT = 0.88; // ground line at 88% of viewport height
export const SKY_BUILDING_GAP = 18;   // px between buildings (at scale=1)
export const SKY_DISTRICT_GAP = 50;   // extra px gap between districts

// 3 clean building shapes
export type BuildingShape =
  | "slab"       // plain rectangle — most common
  | "setback"    // wider base, narrower upper section
  | "crowned";   // decorative crown/cap on top

export interface SkylineEntry {
  blueprint: {
    _id: string;
    slug: string;
    name: string;
    description: string;
    category: string;
    authType: string;
    toolCount: number;
    isConnected: boolean;
  };
  district: District;
  x: number;           // left edge of building (unscaled)
  tier: BuildingTier;
  buildingHeight: number;
  buildingWidth: number;
  depth: number;
  shape: BuildingShape;
  windowCols: number;
}

// Seeded deterministic random — same slug always gets same building
function seededRand(seed: string, index: number): number {
  let h = index + 1;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 0xffffffff;
}

// Height bands — purely cosmetic, not based on toolCount
const HEIGHT_BANDS = [
  { min: 110, max: 180 },   // small
  { min: 200, max: 300 },   // medium-small
  { min: 310, max: 430 },   // medium
  { min: 440, max: 580 },   // tall
  { min: 590, max: 700 },   // very tall
  { min: 710, max: 850 },   // skyscraper
];

// Width bands
const WIDTH_OPTIONS = [85, 100, 115, 130, 148];

// Shape distribution (weighted)
const SHAPES: BuildingShape[] = [
  "slab", "slab", "slab", "slab", "slab",  // 5/10
  "setback", "setback", "setback",           // 3/10
  "crowned", "crowned",                      // 2/10
];

/**
 * Compute front-facing skyline layout for all blueprints.
 * Heights, widths and shapes are deterministically random per slug.
 * Returns buildings array AND the totalWidth (including side depth of last building).
 */
export function getSkylineLayout(
  blueprints: SkylineEntry["blueprint"][]
): { buildings: SkylineEntry[]; totalWidth: number } {
  if (blueprints.length === 0) return { buildings: [], totalWidth: 0 };

  // Group by district preserving DISTRICTS order
  const grouped: Record<string, SkylineEntry["blueprint"][]> = {};
  for (const d of DISTRICTS) grouped[d.id] = [];
  for (const bp of blueprints) {
    const dist = getCategoryDistrict(bp.category);
    grouped[dist.id].push(bp);
  }

  const buildings: SkylineEntry[] = [];
  let cursorX = 0;
  let firstDistrict = true;

  for (const district of DISTRICTS) {
    const bps = grouped[district.id];
    if (bps.length === 0) continue;

    if (!firstDistrict) cursorX += SKY_DISTRICT_GAP;
    firstDistrict = false;

    // Shuffle order within district using seeded random so it's stable
    const sorted = [...bps].sort((a, b) => seededRand(a.slug, 99) - seededRand(b.slug, 99));

    for (const bp of sorted) {
      const r0 = seededRand(bp.slug, 0);
      const r1 = seededRand(bp.slug, 1);
      const r2 = seededRand(bp.slug, 2);
      const r3 = seededRand(bp.slug, 3);

      // Pick height band
      const band = HEIGHT_BANDS[Math.floor(r0 * HEIGHT_BANDS.length)];
      const height = Math.round(band.min + r1 * (band.max - band.min));

      // Pick width
      const width = WIDTH_OPTIONS[Math.floor(r2 * WIDTH_OPTIONS.length)];

      // Pick shape
      const shape = SHAPES[Math.floor(r3 * SHAPES.length)];

      // Depth and window cols scale with width
      const depth = Math.round(width * 0.28);
      const windowCols = width < 100 ? 2 : width < 125 ? 3 : width < 145 ? 4 : 5;

      // Tier purely for antenna logic
      const tier: BuildingTier =
        height < 220 ? "cottage" :
        height < 420 ? "office" :
        height < 620 ? "tower" : "skyscraper";

      buildings.push({
        blueprint: bp,
        district,
        x: cursorX,
        tier,
        buildingHeight: height,
        buildingWidth: width,
        depth,
        shape,
        windowCols,
      });

      cursorX += width + SKY_BUILDING_GAP;
    }
  }

  // totalWidth = last building right edge + its side face
  const lastB = buildings[buildings.length - 1];
  const totalWidth = lastB
    ? lastB.x + lastB.buildingWidth + lastB.depth * 0.55
    : 0;

  return { buildings, totalWidth };
}

/**
 * Compute isometric layout for all blueprints.
 * Groups by district, assigns grid positions within zones,
 * places tallest buildings centrally, returns entries sorted back-to-front.
 */
export function getIsometricLayout(
  blueprints: IsometricEntry["blueprint"][]
): { buildings: IsometricEntry[]; decorations: DecorationEntry[] } {
  if (blueprints.length === 0) return { buildings: [], decorations: [] };

  // Group by district
  const grouped: Record<string, IsometricEntry["blueprint"][]> = {};
  for (const d of DISTRICTS) grouped[d.id] = [];
  for (const bp of blueprints) {
    const dist = getCategoryDistrict(bp.category);
    grouped[dist.id].push(bp);
  }

  const buildings: IsometricEntry[] = [];
  const occupiedCells = new Set<string>();

  for (const zone of DISTRICT_ZONES) {
    const district = DISTRICTS.find((d) => d.id === zone.districtId)!;
    const bps = grouped[zone.districtId];
    if (bps.length === 0) continue;

    // Sort: tallest first (they get placed first / center)
    const sorted = [...bps].sort((a, b) => b.toolCount - a.toolCount);

    // Place buildings in a snake pattern within the zone
    sorted.forEach((bp, i) => {
      const col = i % zone.cols;
      const row = Math.floor(i / zone.cols);
      const gridX = zone.startCol + col;
      const gridY = zone.startRow + row;
      const tier = getTier(bp.toolCount);
      const cfg = TIER_CONFIG[tier];
      const { screenX, screenY } = toIsometric(gridX, gridY);

      occupiedCells.add(`${gridX},${gridY}`);

      buildings.push({
        blueprint: bp,
        district,
        screenX,
        screenY,
        gridX,
        gridY,
        tier,
        buildingHeight: getIsoHeight(bp.toolCount, tier),
        buildingWidth: cfg.width,
        depth: cfg.depth,
      });
    });
  }

  // Generate decorations on empty cells near buildings
  const decorations: DecorationEntry[] = [];
  const seededRandom = (x: number, y: number) => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };

  // Scan a grid area and place trees/lamps on empty cells
  for (let gx = -1; gx <= 18; gx++) {
    for (let gy = -1; gy <= 6; gy++) {
      if (occupiedCells.has(`${gx},${gy}`)) continue;
      const rand = seededRandom(gx, gy);

      // ~35% chance of a decoration on empty cell near buildings
      const hasNeighbor = [
        `${gx - 1},${gy}`, `${gx + 1},${gy}`, `${gx},${gy - 1}`, `${gx},${gy + 1}`,
      ].some((k) => occupiedCells.has(k));

      if (!hasNeighbor) continue;
      if (rand > 0.55) continue; // skip some to avoid overcrowding

      const { screenX, screenY } = toIsometric(gx, gy);
      const type = rand < 0.15 ? "tree-cherry" : rand < 0.40 ? "tree-green" : "lamp";
      decorations.push({ type, screenX, screenY, gridX: gx, gridY: gy });
    }
  }

  // Sort buildings back-to-front (painter's algorithm)
  buildings.sort((a, b) => (a.gridX + a.gridY) - (b.gridX + b.gridY));

  return { buildings, decorations };
}

/**
 * Compute the bounding box of all isometric entries.
 * Used to auto-scale and center the city in the viewport.
 */
export function getIsometricBounds(
  buildings: IsometricEntry[],
  decorations: DecorationEntry[]
): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  for (const b of buildings) {
    const left = b.screenX - b.buildingWidth / 2 - 20;
    const right = b.screenX + b.buildingWidth / 2 + b.depth + 20;
    const top = b.screenY - b.buildingHeight - 30;
    const bottom = b.screenY + 40;
    minX = Math.min(minX, left);
    maxX = Math.max(maxX, right);
    minY = Math.min(minY, top);
    maxY = Math.max(maxY, bottom);
  }

  for (const d of decorations) {
    minX = Math.min(minX, d.screenX - 30);
    maxX = Math.max(maxX, d.screenX + 30);
    minY = Math.min(minY, d.screenY - 40);
    maxY = Math.max(maxY, d.screenY + 10);
  }

  if (!isFinite(minX)) return { minX: 0, maxX: 800, minY: 0, maxY: 600 };
  return { minX, maxX, minY, maxY };
}
