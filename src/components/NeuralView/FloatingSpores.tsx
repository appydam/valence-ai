// FloatingSpores.tsx — Organic pollen/seed/spore particles that drift between biomes
// when agents communicate or tasks are transferred. Replaces SynapticPulse.

import { motion, AnimatePresence } from "framer-motion";
import { useCallback } from "react";

export interface SporeData {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
}

interface FloatingSporesProps {
  spores: SporeData[];
  onComplete: (id: string) => void;
}

function Spore({ spore, onComplete }: { spore: SporeData; onComplete: (id: string) => void }) {
  const { id, fromX, fromY, toX, toY, color } = spore;

  // Create a floaty arc — rises then falls
  const midX = (fromX + toX) / 2;
  const arcHeight = Math.min(60, Math.abs(toX - fromX) * 0.3);

  return (
    <>
      {/* Bloom burst at destination (appears at end) */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        initial={{ x: toX - 8, y: toY - 8, scale: 0, opacity: 0 }}
        animate={{ scale: [0, 0, 1, 2.5], opacity: [0, 0, 0.6, 0] }}
        transition={{ duration: 2.5, times: [0, 0.85, 0.9, 1], ease: "easeOut" }}
        style={{
          width: 16,
          height: 16,
          border: `1px solid ${color}60`,
          borderRadius: "50%",
        }}
      />

      {/* Trailing glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        initial={{ x: fromX - 1.5, y: fromY - 1.5, opacity: 0 }}
        animate={{
          x: [fromX - 1.5, midX - 1.5, toX - 1.5],
          y: [fromY - 1.5, Math.min(fromY, toY) - arcHeight - 1.5, toY - 1.5],
          opacity: [0.3, 0.15, 0],
        }}
        transition={{
          duration: 2.5,
          ease: "easeInOut",
          times: [0, 0.5, 1],
        }}
        style={{
          width: 3,
          height: 3,
          background: color,
          filter: `blur(2px)`,
        }}
      />

      {/* Main spore particle */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        initial={{ x: fromX - 3, y: fromY - 3, opacity: 0, scale: 0.5 }}
        animate={{
          x: [fromX - 3, midX - 3, toX - 3],
          y: [fromY - 3, Math.min(fromY, toY) - arcHeight - 3, toY - 3],
          opacity: [0, 1, 0.8, 0],
          scale: [0.5, 1, 1, 0.3],
        }}
        transition={{
          duration: 2.5,
          ease: [0.34, 1.56, 0.64, 1],
          times: [0, 0.3, 0.85, 1],
        }}
        onAnimationComplete={() => onComplete(id)}
        style={{
          width: 6,
          height: 6,
          background: color,
          boxShadow: `0 0 8px ${color}, 0 0 16px ${color}60`,
        }}
      />
    </>
  );
}

export function FloatingSpores({ spores, onComplete }: FloatingSporesProps) {
  const handleComplete = useCallback(
    (id: string) => onComplete(id),
    [onComplete]
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {spores.map((spore) => (
          <Spore key={spore.id} spore={spore} onComplete={handleComplete} />
        ))}
      </AnimatePresence>
    </div>
  );
}
