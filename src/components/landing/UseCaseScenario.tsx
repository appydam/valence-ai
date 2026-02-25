import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ToolChip {
  label: string;
  color: string;
}

interface Step {
  agent: string;
  emoji: string;
  color: string;
  action: string;
  tools?: ToolChip[];
  detail?: string;
}

interface UseCaseScenarioProps {
  title: string;
  icon: string;
  trigger: string;
  steps: Step[];
  result: string;
  metric: string;
  accentColor: string;
}

function ToolChipEl({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold font-mono"
      style={{
        background: `${color}20`,
        border: `1px solid ${color}50`,
        color: color === "#e2e8f0" ? "#e2e8f0" : color,
      }}
    >
      {label}
    </span>
  );
}

export function UseCaseScenario({
  title,
  icon,
  trigger,
  steps,
  result,
  metric,
  accentColor,
}: UseCaseScenarioProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 20 }}
      className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group"
      style={{
        background: "hsl(240 25% 7%)",
        border: `1px solid ${accentColor}30`,
      }}
    >
      {/* Top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="text-2xl w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
        >
          {icon}
        </div>
        <div>
          <div className="font-bold text-foreground text-sm">{title}</div>
          <div className="text-[10px] text-muted-foreground/60">Autonomous multi-agent workflow</div>
        </div>
      </div>

      {/* Trigger */}
      <div
        className="px-3 py-2 rounded-lg text-[11px] font-mono"
        style={{
          background: "hsl(240 33% 4%)",
          border: "1px solid hsl(var(--border))",
          color: "hsl(var(--muted-foreground))",
        }}
      >
        <span className="text-primary/40">❯ </span>
        {trigger}
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{
              delay: 0.25 + i * 0.1,
              duration: 0.35,
              type: "spring",
              stiffness: 200,
              damping: 25,
            }}
            className="flex flex-col gap-1"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{
                  background: `${step.color}15`,
                  border: `1px solid ${step.color}40`,
                }}
              >
                {step.emoji}
              </div>
              <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1">
                <span
                  className="text-[11px] font-bold flex-shrink-0"
                  style={{ color: step.color }}
                >
                  {step.agent}
                </span>
                <span className="text-[11px] text-muted-foreground">{step.action}</span>
              </div>
              <div
                className="w-1 h-1 rounded-full flex-shrink-0 animate-pulse-glow"
                style={{ background: step.color, animationDelay: `${i * 0.2}s` }}
              />
            </div>

            {/* Tool chips + detail — secondary stagger */}
            {(step.tools?.length || step.detail) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.35 + i * 0.1, duration: 0.3 }}
                className="ml-7 flex flex-wrap items-center gap-1"
              >
                {step.tools?.map((t, ti) => (
                  <ToolChipEl key={ti} label={t.label} color={t.color} />
                ))}
                {step.detail && (
                  <span className="text-[10px] text-muted-foreground/40 font-mono">
                    · {step.detail}
                  </span>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Result badge */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{
          delay: 0.3 + steps.length * 0.1 + 0.15,
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs"
        style={{
          background: `${accentColor}10`,
          border: `1px solid ${accentColor}35`,
          color: accentColor,
        }}
      >
        <span className="mt-0.5 flex-shrink-0">✓</span>
        <div>
          <span className="font-semibold">{result}</span>
          {metric && (
            <span
              className="ml-2 font-mono text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: `${accentColor}15` }}
            >
              {metric}
            </span>
          )}
        </div>
      </motion.div>

      {/* Hover shimmer */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 animate-hud-shimmer"
        style={{
          background: `linear-gradient(90deg, transparent 20%, ${accentColor}06 50%, transparent 80%)`,
          backgroundSize: "200% 100%",
        }}
      />
    </motion.div>
  );
}
