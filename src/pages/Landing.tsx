import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PilotModal } from "@/components/landing/PilotModal";
import { HeroParticleField } from "@/components/landing/HeroParticleField";
import { TypingCommand } from "@/components/landing/TypingCommand";
import { StatsBar } from "@/components/landing/StatsBar";
import { WorkflowDemo } from "@/components/landing/WorkflowDemo";
import { IntegrationGrid } from "@/components/landing/IntegrationGrid";
import { UseCaseScenario } from "@/components/landing/UseCaseScenario";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { AgentSVG } from "@/components/SquadView/AgentSVG";
import { AGENT_CONFIG } from "@/types/mission";
import type { AgentName } from "@/types/mission";

// ─── Color helpers ───────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  kaze: "hsl(217, 91%, 60%)",
  scout: "hsl(160, 84%, 39%)",
  forge: "hsl(38, 92%, 50%)",
  ghost: "hsl(258, 90%, 66%)",
  sentinel: "hsl(330, 81%, 60%)",
};

const AGENT_CAPABILITIES: Record<AgentName, string[]> = {
  Kaze: ["Orchestrate complex missions", "Delegate to specialist agents", "Approve & reject deliverables"],
  Scout: ["Research markets & competitors", "Monitor industry trends", "Synthesize intelligence briefs"],
  Forge: ["Write & deploy production code", "Review PRs on GitHub", "Build automations & integrations"],
  Ghost: ["Draft tweets & LinkedIn posts", "Write emails & blog content", "Distribute across channels"],
  Sentinel: ["Monitor system health", "Audit agent decisions", "Flag anomalies & failures"],
};

// ─── Scroll reveal variants ──────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 48, filter: "blur(4px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
};

// ─── Section wrapper with scroll reveal ─────────────────────────────────────
function RevealSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Navigation ─────────────────────────────────────────────────────────────
function LandingNav({ onPilotClick }: { onPilotClick: () => void }) {
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const scrolled = useRef(false);

  const navRef = useRef<HTMLElement>(null);
  useRef(() => {
    const unsub = scrollY.on("change", (y) => {
      if (!navRef.current) return;
      if (y > 60 && !scrolled.current) {
        navRef.current.classList.add("nav-scrolled");
        scrolled.current = true;
      } else if (y <= 60 && scrolled.current) {
        navRef.current.classList.remove("nav-scrolled");
        scrolled.current = false;
      }
    });
    return unsub;
  });

  return (
    <motion.nav
      ref={navRef}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "hsl(240 33% 4% / 0.85)",
        borderBottom: "1px solid hsl(var(--border) / 0.4)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Valence AI" className="w-6 h-6" />
          <span className="font-bold text-sm tracking-tight">Valence AI</span>
          <div
            className="hidden sm:flex items-center gap-1 text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}
          >
            <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse-glow" />
            LIVE
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onPilotClick}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-all relative overflow-hidden"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            Request Access →
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

// ─── Agent cards (Squad section) ────────────────────────────────────────────
function AgentCard({ name }: { name: AgentName }) {
  const cfg = AGENT_CONFIG[name];
  const color = COLOR_MAP[cfg.color];
  const capabilities = AGENT_CAPABILITIES[name];

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.03, y: -4 }}
      className="rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden cursor-default group"
      style={{
        background: `${color.replace("hsl(", "hsla(").replace(")", ", 0.05)")}`,
        border: `1px solid ${color.replace("hsl(", "hsla(").replace(")", ", 0.2)")}`,
        transition: "border-color 0.2s",
      }}
    >
      {/* Top line glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      {/* Agent SVG */}
      <div className="h-28 flex items-end justify-center">
        {name === "Sentinel" ? (
          <div className="relative flex items-center justify-center" style={{ width: 70, height: 90 }}>
            <svg viewBox="0 0 70 90" className="w-full h-full">
              <defs>
                <radialGradient id={`sent-glow-${name}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="35" cy="78" rx="22" ry="5" fill={color} opacity="0.15" />
              <ellipse cx="35" cy="78" rx="14" ry="3" fill="#000" opacity="0.3" />
              <rect x="20" y="40" width="30" height="35" rx="6" fill={color.replace("hsl(", "hsla(").replace(")", ", 0.1)")} stroke={color.replace("hsl(", "hsla(").replace(")", ", 0.4)")} strokeWidth="1" />
              <path d="M35 10 L52 20 L52 38 Q52 52 35 60 Q18 52 18 38 L18 20 Z"
                fill={color.replace("hsl(", "hsla(").replace(")", ", 0.15)")}
                stroke={color.replace("hsl(", "hsla(").replace(")", ", 0.5)")}
                strokeWidth="1.5" />
              <rect x="22" y="28" width="26" height="1.5" rx="1" fill={color} opacity="0.7" className="animate-scan-sweep" style={{ position: "relative" }} />
              <circle cx="35" cy="35" r="5" fill="none" stroke={color} strokeWidth="1.5" />
              <circle cx="35" cy="35" r="2.5" fill={color} opacity="0.6" />
              <circle cx="35" cy="35" r="1" fill="#fff" opacity="0.8" />
              <rect x="22" y="72" width="10" height="15" rx="3" fill={color.replace("hsl(", "hsla(").replace(")", ", 0.12)")} stroke={color.replace("hsl(", "hsla(").replace(")", ", 0.3)")} strokeWidth="1" />
              <rect x="38" y="72" width="10" height="15" rx="3" fill={color.replace("hsl(", "hsla(").replace(")", ", 0.12)")} stroke={color.replace("hsl(", "hsla(").replace(")", ", 0.3)")} strokeWidth="1" />
            </svg>
            <div
              className="absolute inset-0 rounded-full animate-signal-ring pointer-events-none"
              style={{ border: `1px solid ${color}`, animationDelay: "0.5s" }}
            />
          </div>
        ) : (
          <div style={{ width: 70, height: 90 }}>
            <AgentSVG name={name} color={cfg.color} status="online" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center">
        <div className="text-lg">{cfg.emoji}</div>
        <div className="font-bold text-sm text-foreground mt-1">{name}</div>
        <div className="text-xs mt-0.5" style={{ color }}>{cfg.role}</div>
      </div>

      {/* Divider */}
      <div className="h-px" style={{ background: `${color.replace("hsl(", "hsla(").replace(")", ", 0.15)")}` }} />

      {/* Capabilities */}
      <ul className="space-y-1.5">
        {capabilities.map((cap) => (
          <li key={cap} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span style={{ color, marginTop: 1, fontSize: 9 }}>▸</span>
            {cap}
          </li>
        ))}
      </ul>

      {/* Hover shimmer */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 animate-hud-shimmer"
        style={{
          background: `linear-gradient(90deg, transparent 20%, ${color.replace("hsl(", "hsla(").replace(")", ", 0.06)")} 50%, transparent 80%)`,
          backgroundSize: "200% 100%",
        }}
      />

      {/* Signal ring on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none animate-signal-ring"
        style={{ border: `1px solid ${color}`, animationDelay: "0s" }}
      />
    </motion.div>
  );
}

// ─── Feature deep dive blocks ────────────────────────────────────────────────
function FeatureBlock({
  title,
  label,
  description,
  bullets,
  visual,
  reverse,
}: {
  title: string;
  label: string;
  description: string;
  bullets: string[];
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className={`flex flex-col lg:flex-row gap-8 items-center ${reverse ? "lg:flex-row-reverse" : ""}`}>
      <motion.div
        initial={{ opacity: 0, x: reverse ? 60 : -60, filter: "blur(4px)" }}
        animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
        transition={{ duration: 0.7, type: "spring", stiffness: 80, damping: 18 }}
        className="flex-1 space-y-4"
      >
        <div
          className="text-xs font-mono tracking-widest px-2 py-1 rounded inline-block"
          style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}
        >
          {label}
        </div>
        <h3 className="text-3xl font-bold text-foreground leading-tight">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
        <ul className="space-y-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="text-primary mt-0.5">✓</span>
              {b}
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: reverse ? -60 : 60, scale: 0.92 }}
        animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, type: "spring", stiffness: 80, damping: 18 }}
        className="flex-1 flex justify-center"
      >
        {visual}
      </motion.div>
    </div>
  );
}

// ─── Feature visuals ─────────────────────────────────────────────────────────
function TaskScreenshotVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="relative w-full max-w-lg"
      initial={{ opacity: 0, x: 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, type: "spring", stiffness: 80, damping: 18 }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, hsl(38 92% 50% / 0.12) 0%, transparent 70%)",
          filter: "blur(30px)",
          transform: "scale(1.1)",
        }}
      />

      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          border: "1px solid hsl(38 92% 50% / 0.2)",
          boxShadow: "0 0 0 1px hsl(var(--border) / 0.4), 0 24px 60px hsl(240 33% 3% / 0.8), 0 0 40px hsl(38 92% 50% / 0.06)",
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ background: "hsl(240 25% 5%)", borderBottom: "1px solid hsl(var(--border) / 0.4)" }}
        >
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
          <span className="ml-2 text-[10px] text-muted-foreground/40 font-mono">Task Detail — AlgoHouse Revenue Engine</span>
        </div>
        <img
          src="/screenshots/agents_task.png"
          alt="Valence AI Task Detail"
          className="w-full block"
        />
      </div>

      {/* Floating annotation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
        className="absolute -bottom-5 -right-5 px-3 py-2 rounded-xl text-xs font-mono"
        style={{
          background: "hsl(240 25% 7%)",
          border: "1px solid hsl(217 91% 60% / 0.4)",
          color: "hsl(217, 91%, 60%)",
          boxShadow: "0 4px 20px hsl(240 33% 3% / 0.8)",
        }}
      >
        ✓ Deliverables injected into downstream context
      </motion.div>
    </motion.div>
  );
}

function MemoryVisual() {
  const memories = [
    { text: '"GitHub search API needs 1s delay between calls"', type: "api_quirk", color: "hsl(38, 92%, 50%)" },
    { text: '"Arpit prefers bullet points over prose in reports"', type: "preference", color: "hsl(258, 90%, 66%)" },
    { text: '"Use /bulk-create instead of individual creates"', type: "shortcut", color: "hsl(160, 84%, 39%)" },
  ];

  return (
    <div className="relative" style={{ width: 320, height: 200 }}>
      {memories.map((m, i) => (
        <motion.div
          key={i}
          className="absolute rounded-xl p-3 cursor-default"
          style={{
            background: "hsl(240 25% 8%)",
            border: `1px solid ${m.color.replace("hsl(", "hsla(").replace(")", ", 0.3)")}`,
            left: 20 + i * 14,
            top: i * 14,
            width: 280,
            transform: `rotate(${[-5, -2, 0][i]}deg)`,
            zIndex: i,
            boxShadow: `0 4px 24px ${m.color.replace("hsl(", "hsla(").replace(")", ", 0.08)")}`,
          }}
          whileHover={{
            rotate: 0,
            scale: 1.04,
            zIndex: 10,
            y: -8,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="text-[9px] font-mono mb-1.5 tracking-widest" style={{ color: m.color }}>
            {m.type.toUpperCase()}
          </div>
          <div className="text-xs text-muted-foreground">{m.text}</div>
          {i === 2 && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary animate-pulse-glow" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

function SavingsVisual() {
  return (
    <div className="space-y-4 w-full max-w-sm">
      <div className="rounded-xl p-5 text-center space-y-1"
        style={{ background: "hsl(240 25% 8%)", border: "1px solid hsl(var(--border))" }}
      >
        <div className="text-sm text-muted-foreground line-through decoration-red-400/60">$2,500/mo</div>
        <div className="text-xs text-muted-foreground/50 mb-3">Paragon's monthly cost</div>
        <div className="text-5xl font-bold animate-neon-flicker" style={{ color: "hsl(142, 71%, 45%)" }}>
          Included
        </div>
        <div className="text-sm text-muted-foreground">in your Valence AI pilot</div>
        <div className="text-xs text-green-400/60 mt-1">Save $30,000+ per year vs. Paragon</div>
      </div>
      <div className="space-y-2">
        {[
          { label: "Pre-built blueprints", value: "100+", color: "hsl(217, 91%, 60%)" },
          { label: "Any API via AI scraper", value: "∞", color: "hsl(160, 84%, 39%)" },
          { label: "Developer hours saved", value: "100s", color: "hsl(38, 92%, 50%)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-bold font-mono" style={{ color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebhookVisual() {
  const steps = [
    {
      time: "09:14:02",
      source: "GitHub",
      event: "push → main",
      detail: "847 lines · 4 files changed",
      agent: null as string | null,
      color: "hsl(217, 91%, 60%)",
      logo: "https://cdn.simpleicons.org/github",
    },
    {
      time: "09:14:03",
      source: "Sentinel",
      event: "Diff scanned",
      detail: "2 deps flagged · CVE check triggered",
      agent: "🔍",
      color: "hsl(330, 81%, 60%)",
      logo: null as string | null,
    },
    {
      time: "09:14:04",
      source: "Kaze",
      event: "Task IFR-291 created",
      detail: "priority=high · assigned → Forge + Scout",
      agent: "🌀",
      color: "hsl(217, 91%, 60%)",
      logo: null as string | null,
    },
    {
      time: "09:14:07",
      source: "Forge + Scout",
      event: "Review running",
      detail: "Security · perf · OSS CVE scan in parallel",
      agent: "🔨",
      color: "hsl(38, 92%, 50%)",
      logo: null as string | null,
    },
    {
      time: "09:14:19",
      source: "Ghost",
      event: "PR comment posted",
      detail: "3 issues filed · changelog drafted → Notion",
      agent: "👻",
      color: "hsl(258, 90%, 66%)",
      logo: null as string | null,
    },
    {
      time: "09:14:22",
      source: "Sentinel",
      event: "PR approved ✓",
      detail: "Team notified via Slack",
      agent: "🔍",
      color: "hsl(330, 81%, 60%)",
      logo: null as string | null,
    },
  ];

  return (
    <div
      className="w-full max-w-lg rounded-2xl overflow-hidden font-mono"
      style={{
        background: "hsl(240 25% 5%)",
        border: "1px solid hsl(217 91% 60% / 0.2)",
        boxShadow: "0 0 40px hsl(217 91% 60% / 0.07), 0 24px 60px hsl(240 33% 3% / 0.8)",
      }}
    >
      {/* Terminal header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ background: "hsl(240 25% 7%)", borderBottom: "1px solid hsl(var(--border) / 0.4)" }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        <span className="ml-2 text-[10px] text-muted-foreground/40 tracking-widest">LIVE EVENT STREAM</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] text-red-400/70 tracking-widest">RECORDING</span>
        </div>
      </div>

      {/* Trigger pill */}
      <div className="px-4 pt-3 pb-2">
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs"
          style={{
            background: "hsl(217 91% 60% / 0.08)",
            border: "1px solid hsl(217 91% 60% / 0.3)",
          }}
        >
          <img src="https://cdn.simpleicons.org/github" alt="GitHub" width="13" height="13" style={{ filter: "brightness(0) invert(1)", opacity: 0.8 }} />
          <span style={{ color: "hsl(217, 91%, 70%)" }}>webhook received</span>
          <span className="text-muted-foreground/40 mx-1">·</span>
          <span className="text-muted-foreground/60">github.push on main</span>
          <div className="ml-auto text-[10px] text-muted-foreground/30">09:14:02</div>
        </div>
      </div>

      {/* Event rows */}
      <div className="px-4 pb-4 space-y-px">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, type: "spring", stiffness: 200, damping: 22 }}
            className="flex items-start gap-3 px-3 py-2 rounded-lg group"
            style={{
              background: i === steps.length - 1
                ? step.color.replace("hsl(", "hsla(").replace(")", ", 0.08)")
                : "transparent",
              border: i === steps.length - 1
                ? `1px solid ${step.color.replace("hsl(", "hsla(").replace(")", ", 0.25)")}`
                : "1px solid transparent",
            }}
          >
            {/* Time */}
            <span className="text-[10px] text-muted-foreground/25 w-14 flex-shrink-0 pt-0.5">{step.time}</span>

            {/* Dot + connector line */}
            <div className="flex flex-col items-center flex-shrink-0 pt-[5px]">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: step.color, boxShadow: `0 0 6px ${step.color}` }}
              />
              {i < steps.length - 1 && (
                <div
                  className="w-px mt-1"
                  style={{ background: step.color.replace("hsl(", "hsla(").replace(")", ", 0.15)"), height: 18 }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {step.agent && <span className="text-[11px]">{step.agent}</span>}
                {step.logo && (
                  <img src={step.logo} alt={step.source} width="11" height="11"
                    style={{ filter: "brightness(0) invert(1)", opacity: 0.7 }} />
                )}
                <span className="text-xs font-semibold" style={{ color: step.color }}>{step.source}</span>
                <span className="text-[11px] text-muted-foreground/60">→ {step.event}</span>
              </div>
              <div className="text-[10px] text-muted-foreground/35 mt-0.5">{step.detail}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2.5 flex items-center gap-3 text-[10px] text-muted-foreground/30"
        style={{ borderTop: "1px solid hsl(var(--border) / 0.3)" }}
      >
        <span>Duration: <span className="text-muted-foreground/55">20s</span></span>
        <span>·</span>
        <span>4 agents</span>
        <span>·</span>
        <span>GitHub · Linear · Notion · Slack</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-green-400/60" />
          <span className="text-green-400/50">live</span>
        </div>
      </div>
    </div>
  );
}

// ─── Voice Command visual ────────────────────────────────────────────────────
function VoiceCommandVisual() {
  return (
    <div
      className="w-full max-w-sm rounded-2xl overflow-hidden relative"
      style={{
        background: "linear-gradient(180deg, hsl(240 25% 6%) 0%, hsl(240 30% 4%) 100%)",
        border: "1px solid hsl(217 91% 60% / 0.2)",
        boxShadow: "0 0 40px hsl(217 91% 60% / 0.07), 0 24px 60px hsl(240 33% 3% / 0.8)",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-white/40 font-mono tracking-widest">LIVE</span>
        </div>
        <span className="text-[10px] text-white/40 font-mono tabular-nums">1:42</span>
      </div>

      {/* Avatar ring */}
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="relative">
          <div
            className="absolute inset-0 -m-3 rounded-full animate-ping opacity-20"
            style={{ border: "1px solid hsl(217 91% 60%)", animationDuration: "2s" }}
          />
          <div
            className="absolute inset-0 -m-6 rounded-full animate-ping opacity-10"
            style={{ border: "1px solid hsl(217 91% 60%)", animationDuration: "3s" }}
          />
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "hsl(217 91% 60% / 0.12)",
              border: "2px solid hsl(217 91% 60% / 0.35)",
            }}
          >
            <span className="text-3xl font-bold" style={{ color: "hsl(217 91% 65%)" }}>K</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-base font-semibold text-white/90">Kaze</div>
          <div className="text-xs text-white/30 mt-0.5">Speaking</div>
        </div>

        {/* Waveform bars */}
        <div className="flex items-end gap-[2px] h-6">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-[2.5px] rounded-full"
              style={{
                background: "hsl(217 91% 60% / 0.5)",
                height: `${6 + Math.sin(i * 0.7) * 10 + (i % 3) * 4}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Transcript area */}
      <div className="px-5 pb-3 space-y-2">
        <div className="rounded-lg px-3 py-2" style={{ background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(0 0% 100% / 0.05)" }}>
          <div className="flex items-center gap-2 text-[10px] mb-1.5">
            <span className="text-white/30">You</span>
          </div>
          <p className="text-xs text-white/45 italic">"What are the agents working on right now?"</p>
        </div>
        <div className="rounded-lg px-3 py-2" style={{ background: "hsl(217 91% 60% / 0.06)", border: "1px solid hsl(217 91% 60% / 0.15)" }}>
          <div className="flex items-center gap-2 text-[10px] mb-1.5">
            <span style={{ color: "hsl(217 91% 65%)" }}>Kaze</span>
          </div>
          <p className="text-xs text-white/55">"Scout is finishing the competitor analysis. Forge has 2 PRs in review. Ghost is drafting the newsletter."</p>
        </div>
      </div>

      {/* Tool call indicator */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px]" style={{ background: "hsl(160 84% 39% / 0.08)", border: "1px solid hsl(160 84% 39% / 0.2)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
          <span className="text-emerald-400/70 font-mono">get_agent_status</span>
          <span className="text-white/20 mx-0.5">&rarr;</span>
          <span className="text-white/35">5 agents · 3 active tasks</span>
        </div>
      </div>

      {/* End call bar */}
      <div
        className="flex items-center justify-center gap-3 px-5 py-3"
        style={{ borderTop: "1px solid hsl(0 0% 100% / 0.05)" }}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "hsl(0 0% 100% / 0.06)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        </div>
        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center" style={{ boxShadow: "0 0 16px hsl(0 80% 50% / 0.25)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="m16 2-4 4-4-4"/><path d="m2 16 4-4 4 4"/><path d="M22 16c0-5.523-4.477-10-10-10"/><path d="M2 8c0 5.523 4.477 10 10 10"/></svg>
        </div>
        <div className="w-8" />
      </div>
    </div>
  );
}

// ─── Billing & Team visual ───────────────────────────────────────────────────
function BillingVisual() {
  const plans = [
    { name: "Starter", price: "$99", color: "hsl(217, 91%, 60%)", features: ["3 agents", "25 integrations", "10k API calls/mo"] },
    { name: "Pro", price: "$299", color: "hsl(258, 90%, 66%)", features: ["5 agents", "100+ integrations", "Unlimited API calls"], highlight: true },
    { name: "Enterprise", price: "Custom", color: "hsl(160, 84%, 39%)", features: ["Unlimited agents", "White-label UI", "Dedicated SLA"] },
  ];

  return (
    <div className="w-full max-w-sm space-y-3">
      {plans.map((plan, i) => (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 200, damping: 22 }}
          className="relative rounded-xl px-4 py-3"
          style={{
            background: plan.highlight
              ? `${plan.color.replace("hsl(", "hsla(").replace(")", ", 0.08)")}`
              : "hsl(240 25% 7%)",
            border: `1px solid ${plan.color.replace("hsl(", "hsla(").replace(")", plan.highlight ? ", 0.4)" : ", 0.15)")}`,
            boxShadow: plan.highlight ? `0 0 20px ${plan.color.replace("hsl(", "hsla(").replace(")", ", 0.08)")}` : "none",
          }}
        >
          {plan.highlight && (
            <div
              className="absolute -top-2.5 right-3 text-[9px] font-mono px-2 py-0.5 rounded-full tracking-widest"
              style={{ background: plan.color, color: "#000" }}
            >
              POPULAR
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground/80">{plan.name}</span>
            <span className="text-sm font-bold font-mono" style={{ color: plan.color }}>{plan.price}<span className="text-[10px] text-muted-foreground/40">{plan.price !== "Custom" ? "/mo" : ""}</span></span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {plan.features.map((f) => (
              <span key={f} className="text-[9px] px-1.5 py-0.5 rounded font-mono text-muted-foreground/60"
                style={{ background: "hsl(240 25% 10%)", border: "1px solid hsl(var(--border) / 0.3)" }}>
                {f}
              </span>
            ))}
          </div>
        </motion.div>
      ))}

      <div className="flex items-center gap-3 pt-1">
        {[
          { label: "API Keys", icon: "🔑", color: "hsl(38, 92%, 50%)" },
          { label: "Audit Log", icon: "📋", color: "hsl(160, 84%, 39%)" },
          { label: "Team Roles", icon: "👥", color: "hsl(217, 91%, 60%)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mission Autopilot visual ────────────────────────────────────────────────
function AutopilotVisual() {
  const phases = [
    { label: "GOAL", color: "hsl(217, 91%, 60%)", text: "Research top 10 competitors and prepare a pitch deck", icon: "🎯" },
    { label: "DECOMPOSE", color: "hsl(258, 90%, 66%)", text: "Claude Opus breaks into 6 subtasks with dependencies", icon: "🧠" },
    { label: "EXECUTE", color: "hsl(38, 92%, 50%)", text: "Scout researches → Ghost writes → Forge builds slides", icon: "⚡" },
    { label: "DELIVER", color: "hsl(160, 84%, 39%)", text: "Pitch deck in Notion, team notified on Slack", icon: "✓" },
  ];

  return (
    <div className="w-full max-w-sm space-y-2">
      {phases.map((phase, i) => (
        <motion.div
          key={phase.label}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12, type: "spring", stiffness: 200, damping: 22 }}
          className="relative rounded-xl px-4 py-3 group cursor-default"
          style={{
            background: `${phase.color.replace("hsl(", "hsla(").replace(")", ", 0.06)")}`,
            border: `1px solid ${phase.color.replace("hsl(", "hsla(").replace(")", ", 0.2)")}`,
          }}
        >
          <div className="flex items-start gap-3">
            {/* Phase indicator */}
            <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                style={{
                  background: `${phase.color.replace("hsl(", "hsla(").replace(")", ", 0.15)")}`,
                  border: `1px solid ${phase.color.replace("hsl(", "hsla(").replace(")", ", 0.4)")}`,
                }}
              >
                {phase.icon}
              </div>
              {i < phases.length - 1 && (
                <div
                  className="w-px h-4 mt-1"
                  style={{ background: `${phase.color.replace("hsl(", "hsla(").replace(")", ", 0.15)")}` }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-mono tracking-widest mb-1" style={{ color: phase.color }}>{phase.label}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{phase.text}</div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Stats bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-mono mt-3"
        style={{ background: "hsl(240 25% 6%)", border: "1px solid hsl(var(--border) / 0.4)" }}
      >
        <span className="text-muted-foreground/40">Powered by</span>
        <div className="flex items-center gap-1.5">
          <img
            src="https://cdn.simpleicons.org/claude"
            alt="Claude"
            width="11"
            height="11"
            style={{ filter: "brightness(0) saturate(100%) invert(62%) sepia(98%) saturate(400%) hue-rotate(330deg) brightness(105%)" }}
          />
          <span className="text-muted-foreground/60">Claude Opus 4.6</span>
        </div>
        <div className="flex items-center gap-1.5">
          <img
            src="https://cdn.simpleicons.org/amazonaws"
            alt="AWS"
            width="11"
            height="11"
            style={{ filter: "brightness(0) invert(1)", opacity: 0.5 }}
          />
          <span className="text-muted-foreground/60">Nova Sonic</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Landing Page ───────────────────────────────────────────────────────
const AGENTS: AgentName[] = ["Kaze", "Scout", "Forge", "Ghost", "Sentinel"];

const USE_CASES = [
  {
    title: "Close pipeline 3× faster",
    icon: "🚀",
    trigger: "Research our top 50 Salesforce leads and book demos this week",
    accentColor: "hsl(217, 91%, 60%)",
    metric: "48 hrs · 12 demos booked · saves 14 hrs/week",
    hoursSaved: "14 hrs/week saved · replaces 1 SDR",
    steps: [
      {
        agent: "Kaze", emoji: "🌀", color: "hsl(217, 91%, 60%)",
        action: "Pulls 50 open leads from Salesforce",
        tools: [{ label: "Salesforce", color: "#00A1E0" }, { label: "Slack", color: "#4A154B" }],
        detail: "50 leads loaded · assigned to Scout + Ghost",
      },
      {
        agent: "Scout", emoji: "🔭", color: "hsl(160, 84%, 39%)",
        action: "Researches each account via Gong + HubSpot history",
        tools: [{ label: "Gong", color: "#9B59B6" }, { label: "HubSpot", color: "#FF7A59" }, { label: "Sheets", color: "#34A853" }],
        detail: "12 high-intent signals · 3 accounts re-opened deals",
      },
      {
        agent: "Ghost", emoji: "👻", color: "hsl(258, 90%, 66%)",
        action: "Writes 50 hyper-personalized outreach emails",
        tools: [{ label: "Gmail", color: "#EA4335" }, { label: "HubSpot", color: "#FF7A59" }],
        detail: "Referenced last Gong call + deal history · 50 drafts",
      },
      {
        agent: "Sentinel", emoji: "🔍", color: "hsl(330, 81%, 60%)",
        action: "Reviews emails — rejects 8 generic ones",
        tools: [],
        detail: "Quality gate: PASS 42 · REJECTED 8",
      },
      {
        agent: "Ghost", emoji: "👻", color: "hsl(258, 90%, 66%)",
        action: "Rewrites rejected 8 · MindTickle playbook applied",
        tools: [{ label: "Gmail", color: "#EA4335" }, { label: "MindTickle", color: "#E44D26" }],
        detail: "Sentinel re-check: all 50 PASS",
      },
      {
        agent: "Kaze", emoji: "🌀", color: "hsl(217, 91%, 60%)",
        action: "Sends emails · books demos · logs in Salesforce",
        tools: [{ label: "Salesforce", color: "#00A1E0" }, { label: "Calendar", color: "#4285F4" }, { label: "Zoom", color: "#2D8CFF" }],
        detail: "12 demos booked · Zoom links sent · CRM updated",
      },
    ],
    result: "50 personalized emails sent. 12 demos booked. Salesforce + Zoom synced.",
  },
  {
    title: "Weekly CEO briefing, on autopilot",
    icon: "📊",
    trigger: "Every Friday 6pm: prepare the Monday morning executive briefing",
    accentColor: "hsl(38, 92%, 50%)",
    metric: "Weekly · saves 4 hrs every Friday",
    hoursSaved: "4 hrs/week saved · 200 hrs/year per company",
    steps: [
      {
        agent: "Scout", emoji: "🔭", color: "hsl(160, 84%, 39%)",
        action: "Pulls revenue + pipeline from Stripe & Salesforce",
        tools: [{ label: "Stripe", color: "#6772E5" }, { label: "Salesforce", color: "#00A1E0" }],
        detail: "$284k MRR · 12 deals closing · 3 churn risks flagged",
      },
      {
        agent: "Scout", emoji: "🔭", color: "hsl(160, 84%, 39%)",
        action: "Pulls support health from Zendesk + Intercom",
        tools: [{ label: "Zendesk", color: "#03363D" }, { label: "Intercom", color: "#286EFA" }],
        detail: "CSAT 4.6/5 · 8 critical tickets · avg 2.1hr response",
      },
      {
        agent: "Scout", emoji: "🔭", color: "hsl(160, 84%, 39%)",
        action: "Pulls ad spend + ROI from Meta Ads + Google Ads",
        tools: [{ label: "Meta Ads", color: "#1877F2" }, { label: "Google Ads", color: "#4285F4" }, { label: "Looker", color: "#4285F4" }],
        detail: "$42k spend · 3.2× ROAS · CPL down 18% WoW",
      },
      {
        agent: "Ghost", emoji: "👻", color: "hsl(258, 90%, 66%)",
        action: "Writes executive brief with highlights + risks",
        tools: [{ label: "Notion", color: "#8B8B8B" }, { label: "Sheets", color: "#34A853" }],
        detail: "1,200-word brief · 3 risks · 2 opportunities flagged",
      },
      {
        agent: "Sentinel", emoji: "🔍", color: "hsl(330, 81%, 60%)",
        action: "Fact-checks every number against raw source data",
        tools: [],
        detail: "All figures verified · 1 discrepancy corrected",
      },
      {
        agent: "Kaze", emoji: "🌀", color: "hsl(217, 91%, 60%)",
        action: "Delivers brief via Slack + Notion + books review",
        tools: [{ label: "Slack", color: "#4A154B" }, { label: "Notion", color: "#8B8B8B" }, { label: "Calendar", color: "#4285F4" }],
        detail: "Brief live by 7pm Friday · review booked Monday 9am",
      },
    ],
    result: "Board-ready brief every Monday. No ops person manually pulling numbers ever again.",
  },
  {
    title: "New hire fully set up before day 1",
    icon: "🎯",
    trigger: "Offer accepted in Greenhouse — onboard Alex Chen, Sales Engineer",
    accentColor: "hsl(160, 84%, 39%)",
    metric: "Day 0 · saves 6 hrs per hire",
    hoursSaved: "6 hrs/hire saved · zero IT tickets",
    steps: [
      {
        agent: "Sentinel", emoji: "🔍", color: "hsl(330, 81%, 60%)",
        action: "Detects offer accepted in Greenhouse",
        tools: [{ label: "Greenhouse", color: "#24A47F" }, { label: "Slack", color: "#4A154B" }],
        detail: "Role: Sales Engineer · Start: March 3 · #hr-ops notified",
      },
      {
        agent: "Forge", emoji: "🔨", color: "hsl(38, 92%, 50%)",
        action: "Provisions GitHub, Notion, Jira, Confluence access",
        tools: [{ label: "GitHub", color: "#e2e8f0" }, { label: "Notion", color: "#8B8B8B" }, { label: "Jira", color: "#0052CC" }, { label: "Confluence", color: "#0052CC" }],
        detail: "4 accounts created · permissions set by role template",
      },
      {
        agent: "Forge", emoji: "🔨", color: "hsl(38, 92%, 50%)",
        action: "Sets up payroll + benefits in Gusto + Workday",
        tools: [{ label: "Gusto", color: "#FB4F14" }, { label: "Workday", color: "#F5820D" }],
        detail: "Payroll enrolled · benefits portal invite sent",
      },
      {
        agent: "Ghost", emoji: "👻", color: "hsl(258, 90%, 66%)",
        action: "Sends personalized welcome email + 30/60/90 plan",
        tools: [{ label: "Gmail", color: "#EA4335" }, { label: "Notion", color: "#8B8B8B" }],
        detail: "Role-specific plan drafted · buddy assigned",
      },
      {
        agent: "Kaze", emoji: "🌀", color: "hsl(217, 91%, 60%)",
        action: "Books week 1 intro meetings with team",
        tools: [{ label: "Calendar", color: "#4285F4" }, { label: "Zoom", color: "#2D8CFF" }],
        detail: "8 intros scheduled · manager 1:1 booked day 1",
      },
      {
        agent: "Sentinel", emoji: "🔍", color: "hsl(330, 81%, 60%)",
        action: "Confirms all systems live · logs in ServiceNow",
        tools: [{ label: "ServiceNow", color: "#62D84E" }, { label: "Slack", color: "#4A154B" }],
        detail: "All 6 systems green · HR confirmed · zero IT tickets",
      },
    ],
    result: "New hire fully onboarded before day 1. Zero IT tickets. HR touched nothing.",
  },
];

export default function Landing() {
  const prefersReduced = useReducedMotion();
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 600], [0, prefersReduced ? 0 : -80]);
  const navigate = useNavigate();
  const [pilotOpen, setPilotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PilotModal open={pilotOpen} onClose={() => setPilotOpen(false)} />
      <LandingNav onPilotClick={() => setPilotOpen(true)} />

      {/* ── SECTION 1: HERO ── */}
      <section className="relative overflow-hidden pt-14 pb-0">
        {/* Particle field background */}
        <motion.div className="absolute inset-0" style={{ y: heroParallax }}>
          <HeroParticleField opacity={0.9} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 30%, hsl(240 33% 4% / 0.6) 100%)",
            }}
          />
        </motion.div>

        {/* Bioluminescent orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { color: "hsl(217, 91%, 60%)", x: "10%", y: "30%", size: 500, delay: "0s" },
            { color: "hsl(258, 90%, 66%)", x: "85%", y: "20%", size: 350, delay: "2s" },
            { color: "hsl(160, 84%, 39%)", x: "50%", y: "80%", size: 300, delay: "4s" },
          ].map((orb, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-bioluminescence"
              style={{
                left: orb.x,
                top: orb.y,
                width: orb.size,
                height: orb.size,
                background: `radial-gradient(circle, ${orb.color.replace("hsl(", "hsla(").replace(")", ", 0.1)")} 0%, transparent 70%)`,
                transform: "translate(-50%, -50%)",
                animationDelay: orb.delay,
                animationDuration: `${6 + i * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Hero content — two-column on large screens */}
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 pt-16 pb-8">

            {/* Left: Text content */}
            <div className="flex-1 flex flex-col items-start gap-6 text-left max-w-xl">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono tracking-widest"
                style={{
                  background: "hsl(var(--primary) / 0.08)",
                  border: "1px solid hsl(var(--primary) / 0.25)",
                  color: "hsl(var(--primary) / 0.8)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-glow" />
                5 AGENTS ONLINE · VOICE COMMAND · 100+ INTEGRATIONS
              </motion.div>

              {/* Headline */}
              <motion.h1
                className="text-5xl sm:text-6xl font-bold leading-[1.08] tracking-tight"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } },
                }}
              >
                {/* Line 1: "Deploy Your" */}
                {["Deploy", "Your"].map((word, i) => (
                  <motion.span
                    key={`l1-${i}`}
                    className="inline-block mr-[0.25em]"
                    variants={{
                      hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
                      visible: {
                        opacity: 1, y: 0, filter: "blur(0px)",
                        transition: { type: "spring", stiffness: 120, damping: 18 },
                      },
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
                <br />
                {/* Line 2: "Autonomous AI" — gradient highlight on Autonomous */}
                {["Autonomous", "AI"].map((word, i) => (
                  <motion.span
                    key={`l2-${i}`}
                    className="inline-block mr-[0.25em]"
                    variants={{
                      hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
                      visible: {
                        opacity: 1, y: 0, filter: "blur(0px)",
                        transition: { type: "spring", stiffness: 120, damping: 18 },
                      },
                    }}
                    style={
                      word === "Autonomous"
                        ? {
                            background: "linear-gradient(90deg, hsl(217,91%,65%), hsl(258,90%,70%), hsl(217,91%,60%))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }
                        : word === "AI"
                        ? {
                            background: "linear-gradient(90deg, hsl(258,90%,66%), hsl(330,81%,60%))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }
                        : {}
                    }
                  >
                    {word}
                  </motion.span>
                ))}
                <br />
                {/* Line 3: "Workforce." */}
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
                    visible: {
                      opacity: 1, y: 0, filter: "blur(0px)",
                      transition: { type: "spring", stiffness: 120, damping: 18 },
                    },
                  }}
                >
                  Workforce.
                </motion.span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="text-lg text-muted-foreground leading-relaxed"
              >
                Five specialized AI agents. <span className="text-foreground/80">100+ integrated tools.</span> Multi-step workflows that run while you sleep — across GitHub, HubSpot, Slack, Stripe, Notion, Figma, Salesforce, Jira, Pipedrive, Razorpay and everything else your business runs on.
              </motion.p>

              {/* Typing command */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="px-4 py-3 rounded-xl w-full"
                style={{
                  background: "hsl(240 25% 6%)",
                  border: "1px solid hsl(var(--border))",
                }}
              >
                <TypingCommand />
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="flex items-center gap-4"
              >
                <motion.button
                  onClick={() => setPilotOpen(true)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 rounded-xl text-sm font-bold tracking-wide relative overflow-hidden"
                  style={{
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 0 24px hsl(var(--primary) / 0.35)",
                  }}
                >
                  <span className="relative z-10">Request Early Access →</span>
                  <div
                    className="absolute inset-0 animate-hud-shimmer pointer-events-none"
                    style={{
                      background: "linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.12) 50%, transparent 80%)",
                      backgroundSize: "200% 100%",
                    }}
                  />
                </motion.button>
                <motion.button
                  onClick={() => document.getElementById("workflow-section")?.scrollIntoView({ behavior: "smooth" })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-xl text-sm font-medium"
                  style={{
                    background: "transparent",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  See it in action ↓
                </motion.button>
              </motion.div>

              {/* Social proof line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="flex items-center gap-3 text-xs text-muted-foreground/50"
              >
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span>All 5 agents operational</span>
                </div>
                <span>·</span>
                <span>1,240 API calls in last hour</span>
                <span>·</span>
                <span>Selective pilot program</span>
              </motion.div>
            </div>

            {/* Right: Product screenshot + floating chips */}
            <motion.div
              className="flex-1 relative w-full max-w-2xl"
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.9, type: "spring", stiffness: 70, damping: 20 }}
              style={{ padding: "48px 56px" }}
            >
              {/* Glow behind screenshot */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at 50% 50%, hsl(217 91% 60% / 0.15) 0%, transparent 70%)",
                  filter: "blur(40px)",
                  transform: "scale(1.1)",
                }}
              />

              {/* Screenshot frame */}
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  border: "1px solid hsl(217 91% 60% / 0.2)",
                  boxShadow: "0 0 0 1px hsl(var(--border) / 0.5), 0 32px 80px hsl(240 33% 3% / 0.8), 0 0 60px hsl(217 91% 60% / 0.08)",
                }}
              >
                {/* Fake browser chrome */}
                <div
                  className="flex items-center gap-2 px-4 py-2.5"
                  style={{ background: "hsl(240 25% 5%)", borderBottom: "1px solid hsl(var(--border) / 0.4)" }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <div
                    className="mx-3 flex-1 max-w-48 h-5 rounded flex items-center px-3 text-[10px] text-muted-foreground/40 font-mono"
                    style={{ background: "hsl(240 25% 8%)" }}
                  >
                    app.valence.ai/mission-board
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-green-400/70 font-mono">LIVE</span>
                  </div>
                </div>

                <img
                  src="/screenshots/mission_board.png"
                  alt="Valence AI Mission Board"
                  className="w-full block"
                  style={{ display: "block" }}
                />
              </div>

              {/* ── Floating chips — outside the screenshot frame ── */}

              {/* Top-left corner */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 120, damping: 18 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="absolute top-2 left-14 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono cursor-default"
                style={{
                  background: "hsl(240 25% 7% / 0.97)",
                  border: "1px solid hsl(160 84% 39% / 0.5)",
                  color: "hsl(160, 84%, 39%)",
                  boxShadow: "0 4px 20px hsl(240 33% 3% / 0.9), 0 0 16px hsl(160 84% 39% / 0.12)",
                  backdropFilter: "blur(10px)",
                  animation: "float-a 4s ease-in-out infinite",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                🌀 Kaze: 5 agents active
              </motion.div>

              {/* Top-right corner */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4, type: "spring", stiffness: 120, damping: 18 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="absolute top-2 right-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono cursor-default"
                style={{
                  background: "hsl(240 25% 7% / 0.97)",
                  border: "1px solid hsl(38 92% 50% / 0.5)",
                  color: "hsl(38, 92%, 50%)",
                  boxShadow: "0 4px 20px hsl(240 33% 3% / 0.9), 0 0 16px hsl(38 92% 50% / 0.12)",
                  backdropFilter: "blur(10px)",
                  animation: "float-b 5s ease-in-out infinite",
                }}
              >
                🔨 Forge: PR reviewed · merged
              </motion.div>

              {/* Bottom-left corner */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.65, type: "spring", stiffness: 120, damping: 18 }}
                whileHover={{ scale: 1.05, y: 2 }}
                className="absolute bottom-2 left-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono cursor-default"
                style={{
                  background: "hsl(240 25% 7% / 0.97)",
                  border: "1px solid hsl(258 90% 66% / 0.5)",
                  color: "hsl(258, 90%, 66%)",
                  boxShadow: "0 4px 20px hsl(240 33% 3% / 0.9), 0 0 16px hsl(258 90% 66% / 0.12)",
                  backdropFilter: "blur(10px)",
                  animation: "float-a 6s ease-in-out infinite 1s",
                }}
              >
                <img src="https://cdn.simpleicons.org/figma" alt="Figma" width="12" height="12" style={{ filter: "brightness(0) invert(1)", opacity: 0.85, flexShrink: 0 }} />
                14 mobile screen designed in Figma
              </motion.div>

              {/* Bottom-right corner — two stacked chips */}
              <div className="absolute bottom-2 right-0 flex flex-col items-end gap-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.9, type: "spring", stiffness: 120, damping: 18 }}
                  whileHover={{ scale: 1.05, y: 2 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono cursor-default"
                  style={{
                    background: "hsl(240 25% 7% / 0.97)",
                    border: "1px solid hsl(38 92% 50% / 0.45)",
                    color: "hsl(38, 92%, 50%)",
                    boxShadow: "0 4px 20px hsl(240 33% 3% / 0.9), 0 0 14px hsl(38 92% 50% / 0.1)",
                    backdropFilter: "blur(10px)",
                    animation: "float-b 4.5s ease-in-out infinite 0.5s",
                  }}
                >
                  <img src="https://cdn.simpleicons.org/hubspot" alt="HubSpot" width="12" height="12" style={{ filter: "brightness(0) invert(1)", opacity: 0.85, flexShrink: 0 }} />
                  $240k pipeline · 12 deals
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.1, type: "spring", stiffness: 120, damping: 18 }}
                  whileHover={{ scale: 1.05, y: 2 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono cursor-default"
                  style={{
                    background: "hsl(240 25% 7% / 0.97)",
                    border: "1px solid hsl(217 91% 60% / 0.45)",
                    color: "hsl(217, 91%, 60%)",
                    boxShadow: "0 4px 20px hsl(240 33% 3% / 0.9), 0 0 14px hsl(217 91% 60% / 0.1)",
                    backdropFilter: "blur(10px)",
                    animation: "float-a 5.5s ease-in-out infinite 2s",
                  }}
                >
                  <img src="https://cdn.simpleicons.org/googlecalendar" alt="Calendar" width="14" height="14" style={{ filter: "brightness(0) invert(1)", opacity: 0.85, flexShrink: 0 }} />
                  5 demo calls booked, invites sent
                </motion.div>
              </div>

              {/* Keyframes */}
              <style>{`
                @keyframes float-a {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-5px); }
                }
                @keyframes float-b {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(4px); }
                }
              `}</style>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── SECTION 2: MEET YOUR SQUAD ── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-8 space-y-3">
            <motion.div variants={itemVariants}>
              <span
                className="text-xs font-mono tracking-widest px-2 py-1 rounded"
                style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}
              >
                THE SQUAD
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold">
              Meet Your Workforce
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Five specialists with distinct expertise - coordinated by Kaze, powered by Claude Opus{" "}
              <img
                src="https://cdn.simpleicons.org/claude"
                alt="Claude"
                width="18"
                height="18"
                style={{ display: "inline", verticalAlign: "middle", filter: "brightness(0) saturate(100%) invert(62%) sepia(98%) saturate(400%) hue-rotate(330deg) brightness(105%)", marginBottom: "2px" }}
              />
            </motion.p>
          </RevealSection>

          <RevealSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {AGENTS.map((name) => (
              <AgentCard key={name} name={name} />
            ))}
          </RevealSection>
        </div>
      </section>

      {/* ── SECTION 3: STATS BAR ── */}
      <StatsBar />

      {/* ── SECTION 4: INTEGRATIONS ── */}
      <section className="py-16 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-8 space-y-3">
            <motion.div variants={itemVariants}>
              <span
                className="text-xs font-mono tracking-widest px-2 py-1 rounded"
                style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}
              >
                INTEGRATIONS
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold">
              Connect Everything
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              100+ integrations ready to connect. 2,400+ API actions in the catalog. Or add any API with AI — paste a URL, we generate the integration in seconds.
            </motion.p>
          </RevealSection>

          <IntegrationGrid />
        </div>
      </section>

      {/* ── SECTION 5: USE CASES ── */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <RevealSection className="text-center mb-8 space-y-3">
            <motion.div variants={itemVariants}>
              <span
                className="text-xs font-mono tracking-widest px-2 py-1 rounded"
                style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}
              >
                REAL WORKFLOWS
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold">
              Complex work, done autonomously.
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg max-w-xl mx-auto">
              Multi-agent missions with real tool calls — across your entire stack.
            </motion.p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {USE_CASES.map((uc, i) => (
              <UseCaseScenario
                key={i}
                title={uc.title}
                icon={uc.icon}
                trigger={uc.trigger}
                steps={uc.steps}
                result={uc.result}
                metric={uc.metric}
                accentColor={uc.accentColor}
                hoursSaved={uc.hoursSaved}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: FEATURE DEEP DIVES ── */}
      <section
        className="py-16 px-6"
        style={{ background: "linear-gradient(180deg, hsl(240 33% 4%) 0%, hsl(240 33% 3%) 100%)" }}
      >
        <div className="max-w-5xl mx-auto space-y-16">
          <FeatureBlock
            label="MULTI-AGENT COORDINATION"
            title="Agents that work as a team, not a chatbot."
            description="Kaze orchestrates the entire squad. Tasks have dependencies — when Scout finishes research, Ghost automatically receives the deliverables as context. No human copy-pasting."
            bullets={[
              "Task dependency graph with automatic chain reactions",
              "Deliverables from upstream agents injected into downstream context",
              "Parallel work orchestration — agents work simultaneously",
              "Quality loops with rejection/rework cycles",
            ]}
            visual={<TaskScreenshotVisual />}
          />

          <FeatureBlock
            label="EPISODIC MEMORY"
            title="Agents that learn across every session."
            description="Every agent builds up episodic memories — API quirks, your preferences, patterns that work. They surface the 10 most relevant memories at each session. Over time, lessons distill into their SOUL file — their evolving identity."
            bullets={[
              "8 memory types: api_quirk, preference, pattern, failure, shortcut...",
              "Relevance scoring by importance + recency + human endorsement",
              "Session handoffs: agents never lose context between sessions",
              "SOUL file distillation — agents literally get better at their jobs",
            ]}
            visual={<MemoryVisual />}
            reverse
          />

          <FeatureBlock
            label="INTEGRATION ENGINE"
            title="Built in-house. No Paragon. No $2,500/month."
            description="We replaced Paragon with a custom integration engine. 100+ blueprints across CRM, payments, analytics, dev tools, and marketing — all with OAuth2, API key, and Bearer auth out of the box. If your API isn't in the catalog, paste the docs URL and Claude generates it."
            bullets={[
              "100+ pre-seeded blueprints: Salesforce, Stripe, Pipedrive, Razorpay, Vercel, Apollo, Hunter, Google Analytics and more",
              "AI doc scraper: paste URL → Claude generates tool definitions in seconds",
              "OpenAPI spec import (deterministic, no AI needed)",
              "Jittered backoff, rate limit handling, auto OAuth token refresh",
            ]}
            visual={<SavingsVisual />}
          />

          <FeatureBlock
            label="EVENT-DRIVEN AUTOMATION"
            title="Your tools talk to your agents automatically."
            description="Any webhook from GitHub, Slack, Linear, or any other tool can trigger an agent workflow. With automation rules, JSONPath conditions, and template-based task creation — zero manual handoffs."
            bullets={[
              "HMAC-SHA256 signature verification (no spoofed events)",
              "JSONPath conditions for precise event filtering",
              "Agents wake up instantly when tasks arrive",
              "Full event history for audit trail",
            ]}
            visual={<WebhookVisual />}
            reverse
          />

          <FeatureBlock
            label="VOICE COMMAND CENTER"
            title="Talk to your AI squad. Out loud."
            description="Real-time voice conversations with Kaze, powered by Amazon Nova Sonic. Ask about agent status, create tasks, get briefings — all by voice. Your agents respond with live data, not canned answers."
            bullets={[
              "Sub-second latency via dedicated WebSocket + HTTP/2 stream to AWS Bedrock",
              "Tool calling mid-conversation — agents query real data while talking",
              "Daily voice briefings: \"What happened while I was away?\"",
              "Live transcription with speaker labels for accessibility",
            ]}
            visual={<VoiceCommandVisual />}
          />

          <FeatureBlock
            label="MISSION AUTOPILOT"
            title="Describe the goal. AI plans and executes."
            description="Type a goal in plain English. Claude Opus decomposes it into subtasks with dependencies, assigns agents, and launches the entire mission — while you grab coffee. Review, refine by voice, or let it run."
            bullets={[
              "Claude Opus 4.6 mission decomposition — understands complex multi-step goals",
              "Auto-assigns agents by capability: research, code, content, QA",
              "Voice refinement: talk through changes instead of typing",
              "One-click launch or manual review before execution",
            ]}
            visual={<AutopilotVisual />}
            reverse
          />

          <FeatureBlock
            label="BILLING & TEAM MANAGEMENT"
            title="Built for teams. Ready for scale."
            description="Valence ships with everything you need to run it as a real product — subscription plans, usage metering, team roles, API keys for agents and CI/CD, and a full audit log. No bolted-on add-ons."
            bullets={[
              "Starter, Pro, and Enterprise plans with Stripe-powered billing",
              "Team roles (Admin / Member / Viewer) with granular permissions",
              "API key management — agent server keys, CI/CD keys, revocation",
              "Audit log: every sensitive action tracked with user + timestamp",
            ]}
            visual={<BillingVisual />}
          />
        </div>
      </section>

      {/* ── SECTION 7b: LIVE WORKFLOW DEMO ── */}
      <section
        id="workflow-section"
        className="py-16 px-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(240 33% 3%) 0%, hsl(230 40% 5%) 100%)" }}
      >
        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(hsl(217 91% 60%) 1px, transparent 1px), linear-gradient(90deg, hsl(217 91% 60%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <RevealSection className="text-center mb-8 space-y-3">
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-glow" />
              <span
                className="text-xs font-mono tracking-widest"
                style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}
              >
                LIVE EXECUTION — ALGOHOUSE REVENUE ENGINE
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold">
              Watch Your Team Execute
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              One instruction triggers all 5 agents — in parallel and in sequence — calling 8 real integrations, reviewing each other's work, and delivering a complete revenue pipeline.
            </motion.p>

            {/* Metric pills */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {[
                { label: "5 agents coordinating", color: "hsl(217, 91%, 60%)" },
                { label: "8 integrations called", color: "hsl(38, 92%, 50%)" },
                { label: "$240k pipeline output", color: "hsl(160, 84%, 39%)" },
                { label: "Sentinel QA loop", color: "hsl(330, 81%, 60%)" },
              ].map((p) => (
                <span
                  key={p.label}
                  className="text-xs px-3 py-1 rounded-full font-mono"
                  style={{
                    background: `${p.color.replace("hsl(", "hsla(").replace(")", ", 0.1)")}`,
                    border: `1px solid ${p.color.replace("hsl(", "hsla(").replace(")", ", 0.3)")}`,
                    color: p.color,
                  }}
                >
                  {p.label}
                </span>
              ))}
            </motion.div>
          </RevealSection>

          <WorkflowDemo />
        </div>
      </section>

      {/* ── SECTION 8: COMPARISON TABLE ── */}
      <section
        className="py-16 px-6"
        style={{ background: "linear-gradient(180deg, hsl(240 33% 3%) 0%, hsl(240 33% 4%) 100%)" }}
      >
        <div className="max-w-4xl mx-auto">
          <RevealSection className="text-center mb-8 space-y-3">
            <motion.div variants={itemVariants}>
              <span
                className="text-xs font-mono tracking-widest px-2 py-1 rounded"
                style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}
              >
                VS THE ALTERNATIVES
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold">
              Why Valence wins.
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg">
              Not a chatbot. Not a workflow tool. A complete autonomous workforce platform.
            </motion.p>
          </RevealSection>

          <ComparisonTable />

          {/* Agent analytics screenshot below comparison table */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, type: "spring", stiffness: 70 }}
          >
            {/* Section mini-heading */}
            <div className="text-center mb-6 space-y-2">
              <span
                className="text-xs font-mono tracking-widest px-2 py-1 rounded"
                style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}
              >
                AGENT ANALYTICS
              </span>
              <p className="text-muted-foreground/60 text-sm mt-2">
                Real-time performance across all agents — tasks completed, API calls made, quality scores.
              </p>
            </div>

            {/* Browser chrome wrapper */}
            <div
              className="mx-auto rounded-2xl overflow-hidden relative"
              style={{
                maxWidth: 900,
                border: "1px solid hsl(217 91% 60% / 0.18)",
                boxShadow: "0 0 0 1px hsl(var(--border) / 0.3), 0 32px 80px hsl(240 33% 3% / 0.8), 0 0 60px hsl(217 91% 60% / 0.07)",
                transform: "perspective(1200px) rotateX(3deg)",
              }}
            >
              {/* Glow behind */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at 50% 0%, hsl(217 91% 60% / 0.1) 0%, transparent 60%)",
                  filter: "blur(20px)",
                }}
              />

              {/* Fake browser chrome */}
              <div
                className="flex items-center gap-2 px-4 py-2.5 relative z-10"
                style={{ background: "hsl(240 25% 5%)", borderBottom: "1px solid hsl(var(--border) / 0.4)" }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <div
                  className="mx-3 flex-1 max-w-52 h-5 rounded flex items-center px-3 text-[10px] text-muted-foreground/40 font-mono"
                  style={{ background: "hsl(240 25% 8%)" }}
                >
                  app.valence.ai/analytics
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground/30">Today</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-green-400/70 font-mono">LIVE</span>
                  </div>
                </div>
              </div>

              <img
                src="/screenshots/agent_analytics.png"
                alt="Valence AI Agent Analytics"
                className="w-full block relative z-10"
                style={{ opacity: 0.92 }}
              />

              {/* Fade out bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-20"
                style={{ background: "linear-gradient(to bottom, transparent, hsl(240 33% 4%))" }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 9: FINAL CTA ── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden py-16 px-6">
        {/* Background */}
        <HeroParticleField opacity={0.25} />

        {/* Bioluminescent orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { color: "hsl(217, 91%, 60%)", x: "20%", y: "40%", size: 500, dur: "8s", delay: "0s" },
            { color: "hsl(258, 90%, 66%)", x: "75%", y: "55%", size: 400, dur: "10s", delay: "3s" },
            { color: "hsl(160, 84%, 39%)", x: "50%", y: "20%", size: 350, dur: "7s", delay: "1.5s" },
            { color: "hsl(38, 92%, 50%)", x: "85%", y: "25%", size: 280, dur: "9s", delay: "2s" },
          ].map((orb, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-bioluminescence"
              style={{
                left: orb.x,
                top: orb.y,
                width: orb.size,
                height: orb.size,
                background: `radial-gradient(circle, ${orb.color.replace("hsl(", "hsla(").replace(")", ", 0.1)")} 0%, transparent 70%)`,
                transform: "translate(-50%, -50%)",
                animationDuration: orb.dur,
                animationDelay: orb.delay,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <RevealSection className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
          <motion.div variants={itemVariants}>
            <span
              className="text-xs font-mono tracking-widest px-3 py-1.5 rounded-full"
              style={{
                background: "hsl(var(--primary) / 0.1)",
                border: "1px solid hsl(var(--primary) / 0.25)",
                color: "hsl(var(--primary) / 0.8)",
              }}
            >
              SELECTIVE PILOT PROGRAM · LIMITED SPOTS
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold leading-tight"
            style={{
              background: "linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--muted-foreground)) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Your Autonomous Workforce,<br />Built for You.
          </motion.h2>

          <motion.p variants={itemVariants} className="text-muted-foreground text-lg leading-relaxed">
            Each pilot is a dedicated deployment — private infrastructure, your integrations, your workflows.
            <br />
            We're onboarding a small cohort of companies. Apply and Arpit will reach out personally.
          </motion.p>

          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
            <motion.button
              onClick={() => setPilotOpen(true)}
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px hsl(var(--primary) / 0.4)" }}
              whileTap={{ scale: 0.97 }}
              className="relative px-8 py-4 rounded-xl text-base font-bold overflow-hidden"
              style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
                boxShadow: "0 0 24px hsl(var(--primary) / 0.25)",
              }}
            >
              <span className="relative z-10">Apply for a Pilot Spot →</span>
              <div
                className="absolute inset-0 rounded-xl animate-signal-ring pointer-events-none"
                style={{ border: "1px solid hsl(var(--primary))" }}
              />
              <div
                className="absolute inset-0 animate-hud-shimmer pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.1) 50%, transparent 80%)",
                  backgroundSize: "200% 100%",
                }}
              />
            </motion.button>

            
          </motion.div>

          {/* Feature pills */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 pt-2">
            {["5 AI Agents", "Voice Command", "Mission Autopilot", "94 Integrations", "Episodic Memory", "White-Glove Setup"].map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full text-muted-foreground/60"
                style={{ border: "1px solid hsl(var(--border) / 0.5)" }}
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </RevealSection>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="py-8 px-6 border-t border-border/40"
        style={{ background: "hsl(240 33% 3%)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground/50">
            <img src="/logo.svg" alt="" className="w-4 h-4 opacity-40" />
            <span>Valence AI</span>
            <span>·</span>
            <span>Command center for autonomous AI workforces</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60 font-mono">
            <span>Questions? Mail to:</span>
            <a href="mailto:arpitdhamija.ai@gmail.com" className="hover:text-muted-foreground/60 transition-colors">
              arpitdhamija.ai@gmail.com
            </a>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-green-400/60 animate-pulse-glow" />
              All agents operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
