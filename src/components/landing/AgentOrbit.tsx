import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AGENT_CONFIG } from "@/types/mission";

const AGENTS = ["Kaze", "Scout", "Forge", "Ghost", "Sentinel"] as const;

const COLOR_MAP: Record<string, string> = {
  kaze: "hsl(217, 91%, 60%)",
  scout: "hsl(160, 84%, 39%)",
  forge: "hsl(38, 92%, 50%)",
  ghost: "hsl(258, 90%, 66%)",
  sentinel: "hsl(330, 81%, 60%)",
};

const STATUS_LABELS = ["ACTIVE", "SCANNING", "BUILDING", "WRITING", "WATCHING"];

const TICKER_TASKS = [
  "⚡ Forge: Pushing to github.com/algohouse/benchmark...",
  "⚡ Scout: Analyzing 50 exchanges via AlgoHouse API...",
  "⚡ Ghost: Drafting email #7 of 10 for HubSpot pipeline...",
  "⚡ Sentinel: Reviewing PR #142 — 847 lines changed...",
  "⚡ Kaze: Decomposing mission into 4 parallel subtasks...",
  "⚡ Scout: Writing competitive matrix to Google Sheets...",
  "⚡ Forge: Created repo algohouse/benchmark, pushing...",
  "⚡ Ghost: Posting 4,200-word report to Notion...",
  "⚡ Kaze: Booking 3 demo calls via Google Calendar...",
  "⚡ Sentinel: QA pass 9.1/10 — deliverables approved...",
];

function LiveTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % TICKER_TASKS.length);
        setVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="mt-4 flex justify-center">
      <div
        className="px-3 py-1.5 rounded-lg font-mono text-[10px] transition-opacity duration-300"
        style={{
          opacity: visible ? 1 : 0,
          color: "hsl(var(--muted-foreground) / 0.45)",
          background: "hsl(240 25% 7%)",
          border: "1px solid hsl(var(--border))",
          maxWidth: 380,
        }}
      >
        {TICKER_TASKS[idx]}
      </div>
    </div>
  );
}

export function AgentOrbit() {
  const prefersReduced = useReducedMotion();
  const cx = 220;
  const cy = 200;
  const rx = 155;
  const ry = 100;

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      <div className="relative" style={{ width: 440, height: 400 }}>
        {/* Center hub — Kaze command node */}
        <div
          className="absolute"
          style={{ left: cx - 28, top: cy - 28, width: 56, height: 56 }}
        >
          {/* Energy expand rings */}
          {[0, 0.6, 1.2].map((delay) => (
            <div
              key={delay}
              className="absolute inset-0 rounded-full border animate-energy-expand"
              style={{
                borderColor: "hsl(217, 91%, 60%, 0.4)",
                animationDelay: `${delay}s`,
              }}
            />
          ))}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center text-2xl"
            style={{
              background: "hsl(217, 91%, 60%, 0.12)",
              border: "1px solid hsl(217, 91%, 60%, 0.5)",
              boxShadow: "0 0 20px hsl(217, 91%, 60%, 0.3)",
            }}
          >
            🌀
          </div>
        </div>

        {/* Ellipse path (decorative) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 440 400"
        >
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="hsl(217, 91%, 60%, 0.12)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          {/* Lines from center to each agent (decorative) */}
          {AGENTS.map((name, i) => {
            const angle = (i / AGENTS.length) * 2 * Math.PI - Math.PI / 2;
            const ax = cx + rx * Math.cos(angle);
            const ay = cy + ry * Math.sin(angle);
            const cfg = AGENT_CONFIG[name];
            return (
              <line
                key={name}
                x1={cx}
                y1={cy}
                x2={ax}
                y2={ay}
                stroke={COLOR_MAP[cfg.color]}
                strokeWidth="0.5"
                opacity="0.2"
              />
            );
          })}
        </svg>

        {/* Orbital agent nodes */}
        {AGENTS.map((name, i) => {
          const angle = (i / AGENTS.length) * 2 * Math.PI - Math.PI / 2;
          const ax = cx + rx * Math.cos(angle);
          const ay = cy + ry * Math.sin(angle);
          const cfg = AGENT_CONFIG[name];
          const color = COLOR_MAP[cfg.color];

          return (
            <motion.div
              key={name}
              className="absolute"
              style={{ left: ax - 26, top: ay - 26, width: 52, height: 52 }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: i * 0.12,
                duration: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              whileHover={{ scale: 1.15 }}
            >
              {/* Signal ring pulse */}
              <div
                className="absolute inset-0 rounded-full animate-signal-ring"
                style={{
                  border: `1px solid ${color}`,
                  animationDelay: `${i * 0.4}s`,
                }}
              />
              {/* Agent circle */}
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center text-xl"
                style={{
                  background: `${color.replace("hsl(", "hsla(").replace(")", ", 0.1)")}`,
                  border: `1px solid ${color.replace("hsl(", "hsla(").replace(")", ", 0.45)")}`,
                  boxShadow: `0 0 12px ${color.replace("hsl(", "hsla(").replace(")", ", 0.2)")}`,
                }}
              >
                {cfg.emoji}
              </div>
              {/* Status label */}
              <div
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-mono tracking-widest animate-data-blink"
                style={{
                  color,
                  animationDelay: `${i * 0.3}s`,
                  opacity: 0.7,
                }}
              >
                {STATUS_LABELS[i]}
              </div>
            </motion.div>
          );
        })}

        {/* Slow-rotating outer decorative ring */}
        {!prefersReduced && (
          <div
            className="absolute pointer-events-none animate-ring-rotate"
            style={{
              left: cx - rx - 14,
              top: cy - ry - 14,
              width: (rx + 14) * 2,
              height: (ry + 14) * 2,
              border: "1px solid hsl(217 91% 60% / 0.07)",
              borderRadius: "50%",
              animationDuration: "20s",
            }}
          />
        )}
      </div>
      <LiveTicker />
    </div>
  );
}
