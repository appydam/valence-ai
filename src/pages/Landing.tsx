import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
function LandingNav() {
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
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
          >
            Sign In
          </button>
          <motion.button
            onClick={() => navigate("/login")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-all relative overflow-hidden"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            Get Started →
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
          $0
        </div>
        <div className="text-sm text-muted-foreground">/month with Mission Control</div>
        <div className="text-xs text-green-400/60 mt-1">Save $30,000+ per year</div>
      </div>
      <div className="space-y-2">
        {[
          { label: "Pre-built blueprints", value: "94+", color: "hsl(217, 91%, 60%)" },
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
  const flow = [
    { label: "GitHub push", emoji: "🐙", color: "hsl(217, 91%, 60%)" },
    { label: "Sentinel detects", emoji: "🔍", color: "hsl(330, 81%, 60%)" },
    { label: "Kaze assigns task", emoji: "🌀", color: "hsl(217, 91%, 60%)" },
    { label: "Forge reviews PR", emoji: "🔨", color: "hsl(38, 92%, 50%)" },
  ];

  return (
    <div className="space-y-3 w-full max-w-sm">
      {flow.map((item, i) => (
        <div key={item.label} className="relative">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: `${item.color.replace("hsl(", "hsla(").replace(")", ", 0.06)")}`,
              border: `1px solid ${item.color.replace("hsl(", "hsla(").replace(")", ", 0.25)")}`,
            }}
          >
            <span>{item.emoji}</span>
            <span className="text-xs text-foreground/80">{item.label}</span>
            <div
              className="ml-auto w-1.5 h-1.5 rounded-full animate-data-packet-rise"
              style={{ background: item.color, animationDelay: `${i * 0.4}s` }}
            />
          </div>
          {i < flow.length - 1 && (
            <div className="flex justify-center py-0.5">
              <div className="text-muted-foreground/20 text-xs">↓</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Landing Page ───────────────────────────────────────────────────────
const AGENTS: AgentName[] = ["Kaze", "Scout", "Forge", "Ghost", "Sentinel"];

const USE_CASES = [
  {
    title: "AlgoHouse Revenue Engine",
    icon: "💹",
    trigger: "Build AlgoHouse's competitor intelligence brief + 50-firm pipeline",
    accentColor: "hsl(217, 91%, 60%)",
    metric: "6 days · $240k pipeline",
    steps: [
      {
        agent: "Kaze", emoji: "🌀", color: "hsl(217, 91%, 60%)",
        action: "Breaks mission into 12 subtasks",
        tools: [{ label: "Linear", color: "#5E6AD2" }, { label: "Slack", color: "#4A154B" }],
        detail: "Created 12 issues · Posted to #growth",
      },
      {
        agent: "Scout", emoji: "🔭", color: "hsl(160, 84%, 39%)",
        action: "Pulls Kaiko pricing from 3 sources",
        tools: [{ label: "GitHub", color: "#e2e8f0" }, { label: "Sheets", color: "#34A853" }, { label: "Notion", color: "#8B8B8B" }],
        detail: "Kaiko $28.5k avg deal · 200+ clients",
      },
      {
        agent: "Forge", emoji: "🔨", color: "hsl(38, 92%, 50%)",
        action: "Builds benchmark notebook, pushes repo",
        tools: [{ label: "GitHub", color: "#e2e8f0" }, { label: "Linear", color: "#5E6AD2" }],
        detail: "Pushed 847 lines benchmark.ipynb",
      },
      {
        agent: "Ghost", emoji: "👻", color: "hsl(258, 90%, 66%)",
        action: "Writes 10 personalized outreach emails",
        tools: [{ label: "Gmail", color: "#EA4335" }, { label: "HubSpot", color: "#FF7A59" }, { label: "Notion", color: "#8B8B8B" }],
        detail: "10 drafts · 4,200-word report",
      },
      {
        agent: "Sentinel", emoji: "🔍", color: "hsl(330, 81%, 60%)",
        action: "QA reviews all — rejects 3 emails",
        tools: [],
        detail: "Report: PASS 9.1/10 · Emails: REJECTED 3",
      },
      {
        agent: "Ghost", emoji: "👻", color: "hsl(258, 90%, 66%)",
        action: "Reworks rejected emails (iteration 2)",
        tools: [{ label: "Gmail", color: "#EA4335" }],
        detail: "Sentinel re-review: PASS 8.9/10",
      },
      {
        agent: "Kaze", emoji: "🌀", color: "hsl(217, 91%, 60%)",
        action: "Pipeline activated · 3 demos booked",
        tools: [{ label: "HubSpot", color: "#FF7A59" }, { label: "Calendar", color: "#4285F4" }, { label: "Slack", color: "#4A154B" }],
        detail: "$240k pipeline qualified",
      },
    ],
    result: "Revenue engine live. 50 prospects scored. 3 demos booked.",
  },
  {
    title: "MiCA Compliance Sprint",
    icon: "⚖️",
    trigger: "EU deadline in 47 days — get us MiCA Article 76 compliant",
    accentColor: "hsl(160, 84%, 39%)",
    metric: "47 days · $15k contract",
    steps: [
      {
        agent: "Kaze", emoji: "🌀", color: "hsl(217, 91%, 60%)",
        action: "Creates compliance roadmap",
        tools: [{ label: "Notion", color: "#8B8B8B" }, { label: "Linear", color: "#5E6AD2" }],
        detail: "14 milestones · assigned to squad",
      },
      {
        agent: "Scout", emoji: "🔭", color: "hsl(160, 84%, 39%)",
        action: "Maps ESMA requirements to data gaps",
        tools: [{ label: "Notion", color: "#8B8B8B" }, { label: "Sheets", color: "#34A853" }],
        detail: "23 gaps identified across 4 domains",
      },
      {
        agent: "Forge", emoji: "🔨", color: "hsl(38, 92%, 50%)",
        action: "Builds MiCA endpoint mapping spec",
        tools: [{ label: "GitHub", color: "#e2e8f0" }, { label: "Jira", color: "#0052CC" }],
        detail: "Spec PR merged, 6 endpoints mapped",
      },
      {
        agent: "Forge", emoji: "🔨", color: "hsl(38, 92%, 50%)",
        action: "Creates Stripe compliance pricing plans",
        tools: [{ label: "Stripe", color: "#6772E5" }],
        detail: "3 compliance tiers created",
      },
      {
        agent: "Ghost", emoji: "👻", color: "hsl(258, 90%, 66%)",
        action: "Writes CCO outreach + one-pager",
        tools: [{ label: "Gmail", color: "#EA4335" }, { label: "HubSpot", color: "#FF7A59" }],
        detail: "12 CCOs targeted · one-pager approved",
      },
      {
        agent: "Kaze", emoji: "🌀", color: "hsl(217, 91%, 60%)",
        action: "Activates 2 pilot customers",
        tools: [{ label: "Intercom", color: "#286EFA" }, { label: "Calendar", color: "#4285F4" }, { label: "Slack", color: "#4A154B" }],
        detail: "$15k contract signed · pilots onboarded",
      },
    ],
    result: "Compliance tier live. 2 pilots activated. First contract signed.",
  },
  {
    title: "GitHub Push → Code Review",
    icon: "⚡",
    trigger: "Webhook: github.push event on main branch (847 lines)",
    accentColor: "hsl(38, 92%, 50%)",
    metric: "8 min · 3 issues filed",
    steps: [
      {
        agent: "Sentinel", emoji: "🔍", color: "hsl(330, 81%, 60%)",
        action: "Detects push, reads diff (847 lines)",
        tools: [{ label: "GitHub", color: "#e2e8f0" }],
        detail: "4 files changed · 2 new deps detected",
      },
      {
        agent: "Kaze", emoji: "🌀", color: "hsl(217, 91%, 60%)",
        action: "Creates review task, priority=high",
        tools: [{ label: "Linear", color: "#5E6AD2" }, { label: "Jira", color: "#0052CC" }],
        detail: "Review task IFR-291 created",
      },
      {
        agent: "Forge", emoji: "🔨", color: "hsl(38, 92%, 50%)",
        action: "Deep review: security, perf, style",
        tools: [{ label: "GitHub", color: "#e2e8f0" }],
        detail: "3 issues found · 2 critical",
      },
      {
        agent: "Scout", emoji: "🔭", color: "hsl(160, 84%, 39%)",
        action: "Checks OSS vulnerabilities in new deps",
        tools: [{ label: "GitHub", color: "#e2e8f0" }],
        detail: "1 CVE found in lodash@4.17.20",
      },
      {
        agent: "Ghost", emoji: "👻", color: "hsl(258, 90%, 66%)",
        action: "Writes PR comment + changelog draft",
        tools: [{ label: "GitHub", color: "#e2e8f0" }, { label: "Notion", color: "#8B8B8B" }],
        detail: "Detailed review comment posted",
      },
      {
        agent: "Sentinel", emoji: "🔍", color: "hsl(330, 81%, 60%)",
        action: "Final gate: APPROVED with 3 comments",
        tools: [{ label: "GitHub", color: "#e2e8f0" }, { label: "Slack", color: "#4A154B" }],
        detail: "PR approved · team notified",
      },
    ],
    result: "Full review complete in 8 min. 3 issues filed. PR approved.",
  },
];

export default function Landing() {
  const prefersReduced = useReducedMotion();
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 600], [0, prefersReduced ? 0 : -80]);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <LandingNav />

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
          <div className="flex flex-col lg:flex-row items-center gap-12 pt-16 pb-0">

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
                5 AGENTS ONLINE · 94 INTEGRATIONS · 847 API CALLS TODAY
              </motion.div>

              {/* Headline */}
              <motion.h1
                className="text-5xl sm:text-6xl font-bold leading-[1.05] tracking-tight"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } },
                }}
              >
                {["Your", "AI"].map((word, i) => (
                  <motion.span
                    key={i}
                    className="inline-block mr-[0.25em]"
                    variants={{
                      hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
                      visible: {
                        opacity: 1, y: 0, filter: "blur(0px)",
                        transition: { type: "spring", stiffness: 120, damping: 18 },
                      },
                    }}
                    style={
                      word === "AI"
                        ? {
                            background: "linear-gradient(90deg, hsl(217,91%,60%), hsl(258,90%,66%))",
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
                {["Workforce,"].map((word, i) => (
                  <motion.span
                    key={i}
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
                {["Reporting", "for", "Duty."].map((word, i) => (
                  <motion.span
                    key={i}
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
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="text-lg text-muted-foreground leading-relaxed"
              >
                Five specialized AI agents. <span className="text-foreground/80">94 integrated tools.</span> Multi-step workflows that run while you sleep - across GitHub, HubSpot, Slack, Stripe, Notion, Figma, Salesforce, Jira and everything else your business runs on.
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
                  onClick={() => navigate("/login")}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 rounded-xl text-sm font-bold tracking-wide relative overflow-hidden"
                  style={{
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 0 24px hsl(var(--primary) / 0.35)",
                  }}
                >
                  <span className="relative z-10">Get Started Free →</span>
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
                <span>847 API calls in last hour</span>
                <span>·</span>
                <span>$0 platform cost</span>
              </motion.div>
            </div>

            {/* Right: Product screenshot */}
            <motion.div
              className="flex-1 relative w-full max-w-2xl"
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.9, type: "spring", stiffness: 70, damping: 20 }}
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

              {/* Floating stat chips */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute -bottom-4 -left-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono"
                style={{
                  background: "hsl(240 25% 7%)",
                  border: "1px solid hsl(160 84% 39% / 0.4)",
                  color: "hsl(160, 84%, 39%)",
                  boxShadow: "0 4px 20px hsl(240 33% 3% / 0.8)",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Kaze: Mission assigned · 4 agents active
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono"
                style={{
                  background: "hsl(240 25% 7%)",
                  border: "1px solid hsl(38 92% 50% / 0.4)",
                  color: "hsl(38, 92%, 50%)",
                  boxShadow: "0 4px 20px hsl(240 33% 3% / 0.8)",
                }}
              >
                🔨 Forge: PR reviewed · merged
              </motion.div>
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

      {/* ── SECTION 4: LIVE WORKFLOW DEMO ── */}
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

      {/* ── SECTION 5: INTEGRATIONS ── */}
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
              94 integrations ready to connect. 2,400+ API actions in the catalog. Or add any API with AI — paste a URL, we generate the integration.
            </motion.p>
          </RevealSection>

          <IntegrationGrid />
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
            title="$0/month vs $2,500/month. Zero compromise."
            description="We replaced Paragon with a custom integration engine that costs nothing to run. It supports any API — OAuth2, API key, Bearer, Basic auth. And if your API isn't in the catalog, just paste the docs URL."
            bullets={[
              "94+ pre-seeded blueprints ready to connect today",
              "AI doc scraper: paste URL → Claude generates tool definitions",
              "OpenAPI spec import (deterministic, no AI needed)",
              "Jittered backoff, rate limit handling, auto token refresh",
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
        </div>
      </section>

      {/* ── SECTION 7: USE CASES ── */}
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
              />
            ))}
          </div>
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
            className="mt-12 relative"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, type: "spring", stiffness: 70 }}
          >
            {/* Fade out bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
              style={{ background: "linear-gradient(to bottom, transparent, hsl(240 33% 4%))" }}
            />
            {/* Top glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, hsl(217 91% 60% / 0.3), transparent)" }}
            />
            <div
              className="rounded-2xl overflow-hidden mx-auto"
              style={{
                maxWidth: 860,
                border: "1px solid hsl(var(--border) / 0.3)",
                boxShadow: "0 0 60px hsl(217 91% 60% / 0.06)",
                opacity: 0.8,
                transform: "perspective(1000px) rotateX(4deg)",
              }}
            >
              <img
                src="/screenshots/agent_analytics.png"
                alt="Valence AI Agent Analytics"
                className="w-full block"
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
              START FREE · NO CREDIT CARD REQUIRED
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
            Your Autonomous Workforce Awaits.
          </motion.h2>

          <motion.p variants={itemVariants} className="text-muted-foreground text-lg leading-relaxed">
            Deploy five AI agents that work while you sleep. 94 integrations, zero platform cost.
            <br />
            Watch your agents learn, iterate, and get better with every mission.
          </motion.p>

          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px hsl(var(--primary) / 0.4)" }}
              whileTap={{ scale: 0.97 }}
              className="relative px-8 py-4 rounded-xl text-base font-bold overflow-hidden"
              style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
                boxShadow: "0 0 24px hsl(var(--primary) / 0.25)",
              }}
            >
              <span className="relative z-10">Get Started — It's Free →</span>
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

            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl text-base font-medium"
              style={{
                background: "transparent",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--muted-foreground))",
              }}
            >
              Open App ↗
            </motion.button>
          </motion.div>

          {/* Feature pills */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 pt-2">
            {["5 AI Agents", "94 Integrations", "2,400+ API Actions", "Episodic Memory", "Quality Loops", "$0/month"].map((tag) => (
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
          <div className="flex items-center gap-1 text-xs text-muted-foreground/30 font-mono">
            <span className="w-1 h-1 rounded-full bg-green-400/60 animate-pulse-glow" />
            All agents operational
          </div>
        </div>
      </footer>
    </div>
  );
}
