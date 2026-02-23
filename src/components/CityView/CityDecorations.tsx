// CityDecorations.tsx — Trees (green & cherry blossom), street lamps, ambient details

import { motion } from "framer-motion";
import type { DecorationEntry } from "./cityConfig";

interface CityDecorationsProps {
  decorations: DecorationEntry[];
}

function GreenTree({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x - 10,
        top: y - 28,
        width: 20,
        height: 32,
        zIndex: Math.floor(y) - 1,
      }}
    >
      {/* Trunk */}
      <div
        className="absolute"
        style={{
          left: 8,
          bottom: 0,
          width: 4,
          height: 10,
          background: "#5a4030",
          borderRadius: 1,
        }}
      />
      {/* Canopy */}
      <div
        className="absolute"
        style={{
          left: 1,
          top: 0,
          width: 18,
          height: 20,
          borderRadius: "50% 50% 40% 40%",
          background: "radial-gradient(ellipse at 40% 35%, #5a9a50 0%, #3d7a35 60%, #2d5a25 100%)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      />
      {/* Shadow on ground */}
      <div
        className="absolute"
        style={{
          left: -2,
          bottom: -3,
          width: 24,
          height: 6,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.12)",
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}

function CherryTree({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x - 14,
        top: y - 34,
        width: 28,
        height: 38,
        zIndex: Math.floor(y) - 1,
      }}
    >
      {/* Trunk */}
      <div
        className="absolute"
        style={{
          left: 11,
          bottom: 0,
          width: 5,
          height: 14,
          background: "#6a4530",
          borderRadius: "0 0 2px 2px",
        }}
      />
      {/* Branch left */}
      <div
        className="absolute"
        style={{
          left: 5,
          bottom: 10,
          width: 8,
          height: 3,
          background: "#6a4530",
          borderRadius: 2,
          transform: "rotate(-20deg)",
        }}
      />
      {/* Branch right */}
      <div
        className="absolute"
        style={{
          right: 5,
          bottom: 12,
          width: 8,
          height: 3,
          background: "#6a4530",
          borderRadius: 2,
          transform: "rotate(15deg)",
        }}
      />
      {/* Cherry blossom canopy - main */}
      <div
        className="absolute"
        style={{
          left: 2,
          top: 0,
          width: 24,
          height: 22,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 40% 30%, #f5a0c0 0%, #e880a5 40%, #d06090 80%)",
          boxShadow: "0 2px 6px rgba(200,80,120,0.25)",
        }}
      />
      {/* Cherry blossom canopy - accent blob */}
      <div
        className="absolute"
        style={{
          left: -2,
          top: 6,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, #f0b0d0 0%, #e090b5 70%)",
          opacity: 0.8,
        }}
      />
      {/* Falling petals */}
      <motion.div
        className="absolute"
        style={{
          left: 6,
          top: 20,
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: "#f5a0c0",
          opacity: 0.6,
        }}
        animate={{
          y: [0, 14, 20],
          x: [0, 6, 3],
          opacity: [0.6, 0.3, 0],
          rotate: [0, 90, 180],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeOut", delay: 0 }}
      />
      <motion.div
        className="absolute"
        style={{
          right: 6,
          top: 18,
          width: 2,
          height: 2,
          borderRadius: "50%",
          background: "#e890b0",
          opacity: 0.5,
        }}
        animate={{
          y: [0, 12, 22],
          x: [0, -4, -6],
          opacity: [0.5, 0.2, 0],
          rotate: [0, -120, -240],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeOut", delay: 1.5 }}
      />
      {/* Shadow on ground */}
      <div
        className="absolute"
        style={{
          left: -3,
          bottom: -4,
          width: 34,
          height: 8,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.1)",
          filter: "blur(3px)",
        }}
      />
    </div>
  );
}

function StreetLamp({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x - 4,
        top: y - 22,
        width: 8,
        height: 26,
        zIndex: Math.floor(y) - 1,
      }}
    >
      {/* Pole */}
      <div
        className="absolute"
        style={{
          left: 3,
          bottom: 0,
          width: 2,
          height: 18,
          background: "linear-gradient(to top, #4a4040, #6a6060)",
          borderRadius: 1,
        }}
      />
      {/* Lamp head */}
      <div
        className="absolute"
        style={{
          left: 0,
          top: 0,
          width: 8,
          height: 6,
          borderRadius: "50% 50% 30% 30%",
          background: "rgba(255,220,120,0.9)",
          boxShadow: "0 0 8px rgba(255,200,80,0.5), 0 0 16px rgba(255,200,80,0.2)",
        }}
      />
      {/* Light cone on ground */}
      <div
        className="absolute"
        style={{
          left: -6,
          bottom: -4,
          width: 20,
          height: 8,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,220,120,0.12) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

export function CityDecorations({ decorations }: CityDecorationsProps) {
  return (
    <>
      {decorations.map((dec, i) => {
        switch (dec.type) {
          case "tree-green":
            return <GreenTree key={`d-${i}`} x={dec.screenX} y={dec.screenY} />;
          case "tree-cherry":
            return <CherryTree key={`d-${i}`} x={dec.screenX} y={dec.screenY} />;
          case "lamp":
            return <StreetLamp key={`d-${i}`} x={dec.screenX} y={dec.screenY} />;
          default:
            return null;
        }
      })}
    </>
  );
}
