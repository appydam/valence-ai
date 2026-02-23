// CityStreets.tsx — Animated vehicles, street lights, and data packets

import { motion } from "framer-motion";

interface CityStreetsProps {
  cityWidth: number;
  cityHeight: number;
  connectedCount: number;
}

// Vehicles travel along horizontal street lanes
const VEHICLE_LANES = [140, 320, 500, 680, 860, 1040];

const VEHICLES = [
  { lane: 0, color: "#00aaff", glowColor: "rgba(0,170,255,0.8)", delay: 0, duration: 5, dir: 1, size: { w: 14, h: 5 } },
  { lane: 1, color: "#ff6600", glowColor: "rgba(255,100,0,0.8)", delay: 1.2, duration: 7, dir: -1, size: { w: 12, h: 5 } },
  { lane: 2, color: "#00ff88", glowColor: "rgba(0,255,136,0.8)", delay: 0.5, duration: 4.5, dir: 1, size: { w: 10, h: 4 } },
  { lane: 3, color: "#cc44ff", glowColor: "rgba(200,68,255,0.8)", delay: 2, duration: 6, dir: -1, size: { w: 14, h: 5 } },
  { lane: 4, color: "#ffcc00", glowColor: "rgba(255,200,0,0.8)", delay: 0.8, duration: 5.5, dir: 1, size: { w: 12, h: 4 } },
  { lane: 5, color: "#00ccff", glowColor: "rgba(0,200,255,0.8)", delay: 3, duration: 8, dir: -1, size: { w: 16, h: 5 } },
];

// Street light positions (at intersections)
const STREET_LIGHTS_X = [110, 248, 386, 524];

export function CityStreets({ cityWidth, cityHeight, connectedCount }: CityStreetsProps) {
  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{ width: cityWidth + 120, height: cityHeight + 120, overflow: "visible", zIndex: 10 }}
    >
      <defs>
        {VEHICLES.map((v, i) => (
          <filter key={i} id={`vehicle-glow-${i}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        ))}
        <filter id="streetlight-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Street lights at intersections */}
      {STREET_LIGHTS_X.map((lx, li) =>
        VEHICLE_LANES.filter((_, i) => i % 2 === 0).map((ly, ri) => (
          <g key={`light-${li}-${ri}`}>
            {/* Pole */}
            <line
              x1={lx} y1={ly}
              x2={lx} y2={ly - 22}
              stroke="rgba(100,120,180,0.4)"
              strokeWidth="1"
            />
            {/* Light head */}
            <circle
              cx={lx}
              cy={ly - 24}
              r="4"
              fill="rgba(200,230,255,0.9)"
              filter="url(#streetlight-glow)"
            />
            {/* Ground halo */}
            <ellipse
              cx={lx}
              cy={ly}
              rx="18"
              ry="8"
              fill="rgba(180,210,255,0.04)"
            />
          </g>
        ))
      )}

      {/* Animated vehicles */}
      {VEHICLES.map((vehicle, vi) => {
        const laneY = VEHICLE_LANES[vehicle.lane % VEHICLE_LANES.length];
        const startX = vehicle.dir === 1 ? -30 : cityWidth + 150;
        const endX = vehicle.dir === 1 ? cityWidth + 150 : -30;

        return (
          <motion.g
            key={vi}
            animate={{
              x: [startX, endX],
            }}
            transition={{
              duration: vehicle.duration,
              delay: vehicle.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Headlights (front glow) */}
            <ellipse
              cx={vehicle.dir === 1 ? vehicle.size.w / 2 + 4 : -vehicle.size.w / 2 - 4}
              cy={laneY}
              rx={12}
              ry={4}
              fill={vehicle.dir === 1 ? "rgba(255,240,200,0.15)" : "rgba(255,80,80,0.15)"}
            />
            {/* Vehicle body */}
            <rect
              x={-vehicle.size.w / 2}
              y={laneY - vehicle.size.h / 2}
              width={vehicle.size.w}
              height={vehicle.size.h}
              rx={2}
              fill={vehicle.color}
              filter={`url(#vehicle-glow-${vi})`}
              opacity={0.9}
            />
            {/* Tail lights */}
            <rect
              x={vehicle.dir === 1 ? -vehicle.size.w / 2 - 3 : vehicle.size.w / 2}
              y={laneY - 1.5}
              width={3}
              height={3}
              rx={1}
              fill="rgba(255,60,60,0.9)"
            />
          </motion.g>
        );
      })}

      {/* Data packets flowing between buildings when integrations connected */}
      {connectedCount > 0 &&
        Array.from({ length: Math.min(connectedCount * 2, 8) }, (_, i) => {
          const startX = 40 + (i % 4) * 120;
          const endX = startX + 100;
          const y = 80 + Math.floor(i / 4) * 180;
          return (
            <motion.rect
              key={`packet-${i}`}
              width={5}
              height={5}
              rx={1}
              fill="rgba(0,200,255,0.8)"
              style={{
                filter: "drop-shadow(0 0 4px rgba(0,200,255,0.9))",
              }}
              animate={{
                x: [startX, endX],
                y: [y, y - 10, y],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}
    </svg>
  );
}
