import { AgentName, AGENT_CONFIG } from "@/types/mission";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface WorldPosition {
  wx: number; // 0-1200, world x
  wy: number; // 0-800, world y (higher = closer to camera)
}

export interface ScreenPosition {
  sx: number; // pixel x on screen
  sy: number; // pixel y on screen
  scale: number; // perspective scale (0.6 at back, 1.0 at front)
  zIndex: number; // depth sorting (higher wy = higher zIndex)
}

export interface WorkZone {
  id: string;
  label: string;
  icon: string; // lucide icon name
  wx: number;
  wy: number;
  width: number; // world units
  height: number; // world units
  assignedAgent: AgentName;
  color: string; // agent color key
  description: string;
}

export type MovementState = "idle" | "walking" | "working" | "talking" | "offline";

export interface AgentMovementState {
  name: AgentName;
  currentPosition: WorldPosition;
  targetPosition: WorldPosition;
  targetZoneId: string;
  movementState: MovementState;
  facingDirection: "left" | "right";
  walkDuration: number; // ms for current walk
  isMoving: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const WORLD_WIDTH = 1200;
export const WORLD_HEIGHT = 800;
export const WALK_SPEED = 400; // ms per 100 world units

// ─── Zone Definitions ──────────────────────────────────────────────────────────

export const ZONES: WorkZone[] = [
  {
    id: "command-deck",
    label: "Command Deck",
    icon: "Crown",
    wx: 600,
    wy: 350,
    width: 180,
    height: 120,
    assignedAgent: "Kaze",
    color: "kaze",
    description: "Strategic oversight & delegation",
  },
  {
    id: "research-lab",
    label: "Research Lab",
    icon: "Search",
    wx: 200,
    wy: 280,
    width: 160,
    height: 110,
    assignedAgent: "Scout",
    color: "scout",
    description: "Market intelligence & analysis",
  },
  {
    id: "workshop",
    label: "Workshop",
    icon: "Wrench",
    wx: 950,
    wy: 500,
    width: 180,
    height: 130,
    assignedAgent: "Forge",
    color: "forge",
    description: "Engineering & prototyping",
  },
  {
    id: "comms-hub",
    label: "Comms Hub",
    icon: "Radio",
    wx: 950,
    wy: 200,
    width: 160,
    height: 100,
    assignedAgent: "Ghost",
    color: "ghost",
    description: "Content distribution & outreach",
  },
  {
    id: "war-room",
    label: "War Room",
    icon: "Users",
    wx: 550,
    wy: 550,
    width: 200,
    height: 140,
    assignedAgent: "Kaze",
    color: "kaze",
    description: "Collaboration & review",
  },
  {
    id: "inbox",
    label: "Inbox",
    icon: "Inbox",
    wx: 150,
    wy: 600,
    width: 140,
    height: 100,
    assignedAgent: "Kaze",
    color: "kaze",
    description: "Incoming tasks & assignments",
  },
];

// ─── Agent Home Zones ──────────────────────────────────────────────────────────

export const AGENT_HOME_ZONE: Record<AgentName, string> = {
  Kaze: "command-deck",
  Scout: "research-lab",
  Forge: "workshop",
  Ghost: "comms-hub",
};

// ─── Projection ────────────────────────────────────────────────────────────────

export function worldToScreen(
  wx: number,
  wy: number,
  containerWidth: number,
  containerHeight: number
): ScreenPosition {
  const nx = wx / WORLD_WIDTH;
  const ny = wy / WORLD_HEIGHT;

  // Perspective foreshortening: back = smaller, front = full size
  const perspectiveScale = 0.6 + ny * 0.4;

  // X: center-biased with convergence toward vanishing point
  const vanishX = containerWidth / 2;
  const sx = vanishX + (nx - 0.5) * containerWidth * perspectiveScale * 0.85;

  // Y: map to bottom 70% of container (top 30% = sky/background)
  const floorTop = containerHeight * 0.25;
  const floorBottom = containerHeight * 0.92;
  const sy = floorTop + ny * (floorBottom - floorTop);

  return {
    sx,
    sy,
    scale: perspectiveScale,
    zIndex: Math.round(ny * 100),
  };
}

// ─── Agent Zone Mapping ────────────────────────────────────────────────────────

export function getAgentTargetZone(
  agentName: AgentName,
  status: string,
  currentTaskStatus: string | null,
  isCollaborating: boolean
): string {
  if (status === "offline") return AGENT_HOME_ZONE[agentName];
  if (isCollaborating) return "war-room";
  if (currentTaskStatus === "in_review") return "war-room";
  if (status === "working" || status === "online") return AGENT_HOME_ZONE[agentName];
  return AGENT_HOME_ZONE[agentName];
}

// ─── Walk Duration ─────────────────────────────────────────────────────────────

export function getWalkDuration(from: WorldPosition, to: WorldPosition): number {
  const dist = Math.sqrt((to.wx - from.wx) ** 2 + (to.wy - from.wy) ** 2);
  return Math.max(800, (dist / 100) * WALK_SPEED);
}

// ─── Zone Stand Position (slight offset per agent so they don't stack) ────────

export function getZoneStandPosition(
  zone: WorkZone,
  agentName: AgentName
): WorldPosition {
  const hash = agentName.charCodeAt(0) + agentName.charCodeAt(1);
  const offsetX = ((hash % 7) - 3) * 15;
  const offsetY = ((hash % 5) - 2) * 10;
  return {
    wx: zone.wx + offsetX,
    wy: zone.wy + offsetY,
  };
}

// ─── Get Zone By ID ────────────────────────────────────────────────────────────

export function getZoneById(id: string): WorkZone | undefined {
  return ZONES.find((z) => z.id === id);
}
