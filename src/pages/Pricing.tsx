import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Check, Users, Sparkles, Cpu, Server, Bot, Plug, Shield,
  Building2, Crown, ArrowRight, Brain, Webhook,
  Eye, MessageSquare, HardDrive, MemoryStick,
} from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { PilotModal } from "@/components/landing/PilotModal";

// ─── Server tier data ────────────────────────────────────────────────────────

const businessServerTiers = [
  {
    id: "standard",
    label: "Standard",
    price: "$2,499",
    server: "16 GB RAM · 4 vCPUs",
    storage: "320 GB SSD",
    transfer: "6 TB Transfer",
    bestFor: "Small teams, up to 10 users",
    serverCost: "$84/mo",
  },
  {
    id: "performance",
    label: "Performance",
    price: "$2,999",
    server: "32 GB RAM · 8 vCPUs",
    storage: "640 GB SSD",
    transfer: "7 TB Transfer",
    bestFor: "Mid-size teams, up to 20 users",
    serverCost: "$164/mo",
  },
  {
    id: "heavy",
    label: "Heavy",
    price: "$3,499",
    server: "64 GB RAM · 16 vCPUs",
    storage: "1280 GB SSD",
    transfer: "8 TB Transfer",
    bestFor: "Large teams, 20+ users",
    serverCost: "$384/mo",
  },
];

const enterpriseServerTiers = [
  {
    id: "performance",
    label: "Performance",
    price: "$4,999",
    server: "32 GB RAM · 8 vCPUs",
    storage: "640 GB SSD",
    transfer: "7 TB Transfer",
    bestFor: "Up to 25 users, heavy workloads",
    serverCost: "$164/mo dedicated",
  },
  {
    id: "heavy",
    label: "Heavy",
    price: "$5,999",
    server: "64 GB RAM · 16 vCPUs",
    storage: "1280 GB SSD",
    transfer: "8 TB Transfer",
    bestFor: "25+ users, max throughput",
    serverCost: "$384/mo dedicated",
  },
];

// ─── Plan data ──────────────────────────────────────────────────────────────

const enterprisePlusPlan = {
  id: "enterprise_plus",
  name: "Enterprise+",
  price: "Custom",
  period: "",
  tagline: "On-prem deployment, unlimited scale, custom SLA",
  icon: Shield,
  color: "hsl(38, 92%, 50%)",
  colorClass: "text-amber-500",
  bgGlow: "hsl(38, 92%, 50%)",
  specs: [
    { icon: Users, label: "Unlimited users" },
    { icon: Sparkles, label: "Unlimited missions" },
    { icon: Cpu, label: "Full Opus 4.6" },
    { icon: Server, label: "On-prem / your VPC" },
  ],
  features: [
    "Everything in Enterprise, plus:",
    "On-prem / VPC deployment",
    "Unlimited agents & missions",
    "Custom integration building",
    "Enterprise SLA & support",
    "Voice commands",
    "Dedicated account manager",
    "Custom training & onboarding",
  ],
};

const includedInAll = [
  {
    icon: Bot,
    color: "text-blue-400",
    title: "5 AI Agents",
    description: "Kaze, Scout, Forge, Ghost, and Sentinel — a full autonomous operations team that coordinates, executes, and improves over time",
  },
  {
    icon: Plug,
    color: "text-green-400",
    title: "~100 Integrations",
    description: "HubSpot, Slack, Jira, GitHub, Gmail, Notion, Google Sheets, Salesforce, and ~100 more — or add any API in minutes with our doc scraper",
  },
  {
    icon: Shield,
    color: "text-purple-400",
    title: "Enterprise Security",
    description: "AES-256-GCM encryption for all tokens, OAuth with auto-refresh, audit logs, and per-user credential scoping",
  },
  {
    icon: Brain,
    color: "text-pink-400",
    title: "Agents That Learn",
    description: "Episodic memory, session handoffs, and SOUL file evolution — agents get better at their jobs with every interaction",
  },
  {
    icon: Eye,
    color: "text-cyan-400",
    title: "Full Observability",
    description: "Watch agents reason in real-time. Every tool call, decision, and coordination step is logged and visible in the War Room",
  },
  {
    icon: Webhook,
    color: "text-orange-400",
    title: "Event-Driven Automation",
    description: "Receive webhooks from GitHub, Slack, Linear, or any source. Set automation rules that trigger agent workflows automatically",
  },
];

const faqs = [
  {
    q: "What's the difference between Sonnet and Opus?",
    a: "Claude Sonnet 4.6 handles 80%+ of business tasks (emails, research, content, Jira tickets) with excellent quality. Opus 4.6 is our most capable model — deeper reasoning for complex strategy, multi-step analysis, and nuanced decision-making. Enterprise plan lets you use Opus for strategic missions while keeping Sonnet for everyday tasks.",
  },
  {
    q: "How do missions and tasks work?",
    a: "A mission is a high-level objective (e.g., \"Research our top 10 competitors\"). Each mission is decomposed into 5-20 tasks that agents execute autonomously. Each user can run up to 10 missions per day, with each mission generating multiple parallel agent tasks.",
  },
  {
    q: "What do the server tiers mean?",
    a: "Each company gets a cloud server running your AI agent squad. The Standard tier (16 GB, 4 vCPUs) is great for small teams. Performance (32 GB, 8 vCPUs) handles heavier concurrent agent workloads. Heavy (64 GB, 16 vCPUs) is for large teams running many missions simultaneously.",
  },
  {
    q: "Can I connect any API, not just the pre-built ones?",
    a: "Yes. Paste any API documentation URL and our AI reads the docs, generates tool definitions, and your agents can call that API within minutes. No developer needed.",
  },
  {
    q: "What does on-prem deployment look like?",
    a: "Enterprise+ runs the full agent runtime in your own VPC or on-premises infrastructure. Your data never leaves your environment. We handle setup, updates, and ongoing support.",
  },
  {
    q: "Is there a free trial?",
    a: "We offer a 2-week pilot at 50% off so you can see real results before committing. Contact us to set up your pilot.",
  },
];

// ─── Animation variants ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Business Plan Card (with tabs) ─────────────────────────────────────────

function BusinessPlanCard({ index, onPilotClick }: { index: number; onPilotClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [activeTier, setActiveTier] = useState(0);
  const tier = businessServerTiers[activeTier];

  return (
    <motion.div
      ref={ref}
      custom={index}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      className="relative rounded-2xl border border-border/50 bg-card/30 p-7 flex flex-col"
      style={{
        backdropFilter: "blur(8px)",
        boxShadow: "0 1px 2px hsl(0 0% 0% / 0.3)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2 mt-1">
        <Building2 className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-foreground">Business</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">For teams ready to automate operations with AI agents</p>

      {/* Server tier tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-white/[0.03] border border-border/30">
        {businessServerTiers.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setActiveTier(i)}
            className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTier === i
                ? "bg-blue-500/15 text-blue-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Price (changes with tab) */}
      <div className="mb-1">
        <span className="text-4xl font-bold text-foreground tracking-tight">{tier.price}</span>
        <span className="text-base text-muted-foreground">/mo</span>
      </div>
      <p className="text-xs text-muted-foreground mb-5">+ $1,500 one-time white-glove onboarding</p>

      {/* Specs */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-3 text-sm text-foreground">
          <Users className="w-4 h-4 text-muted-foreground shrink-0" />
          {tier.bestFor}
        </div>
        <div className="flex items-center gap-3 text-sm text-foreground">
          <Sparkles className="w-4 h-4 text-muted-foreground shrink-0" />
          10 missions/day per user
        </div>
        <div className="flex items-center gap-3 text-sm text-foreground">
          <Cpu className="w-4 h-4 text-muted-foreground shrink-0" />
          Claude Sonnet 4.6
        </div>
      </div>

      {/* Server spec box */}
      <div className="rounded-lg border border-blue-500/15 bg-blue-500/[0.03] p-3 mb-5">
        <p className="text-[10px] font-medium text-blue-400 uppercase tracking-wider mb-2">Your Cloud Server</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-foreground">
            <MemoryStick className="w-3.5 h-3.5 text-muted-foreground" />
            {tier.server}
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground">
            <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
            {tier.storage}
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground">
            <Server className="w-3.5 h-3.5 text-muted-foreground" />
            {tier.transfer}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-border/40 pt-5 mb-6 flex-1">
        <div className="space-y-2.5">
          {[
            "5 AI Agents (Kaze, Scout, Forge, Ghost, Sentinel)",
            "~100 Integrations",
            "Autopilot Mission Planner",
            "Agent Memory Bank",
            "War Room (Real-time Observability)",
            "Daily CEO Digest",
            "Event-Driven Webhooks",
            "Analytics Dashboard",
            "Audit Log",
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
              <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onPilotClick}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
      >
        <MessageSquare className="w-4 h-4" />
        Talk to Us
      </button>
    </motion.div>
  );
}

// ─── Enterprise Plan Card (with tabs) ───────────────────────────────────────

function EnterprisePlanCard({ index, onPilotClick }: { index: number; onPilotClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [activeTier, setActiveTier] = useState(0); // default to Performance
  const tier = enterpriseServerTiers[activeTier];

  return (
    <motion.div
      ref={ref}
      custom={index}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      className="relative rounded-2xl border border-purple-500/40 bg-purple-500/[0.03] p-7 flex flex-col"
      style={{
        backdropFilter: "blur(8px)",
        boxShadow: "0 0 60px hsla(258, 90%, 66%, 0.08), 0 1px 2px hsl(0 0% 0% / 0.4)",
      }}
    >
      {/* Popular badge */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
        <span
          className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{
            background: "linear-gradient(135deg, hsl(258, 90%, 66%), hsl(280, 90%, 60%))",
            color: "white",
            boxShadow: "0 4px 20px hsla(258, 90%, 66%, 0.3)",
          }}
        >
          Most Popular
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2 mt-1">
        <Crown className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-foreground">Enterprise</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Hybrid AI models with your own dedicated server</p>

      {/* Server tier tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-white/[0.03] border border-border/30">
        {enterpriseServerTiers.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setActiveTier(i)}
            className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTier === i
                ? "bg-purple-500/15 text-purple-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Price (changes with tab) */}
      <div className="mb-1">
        <span className="text-4xl font-bold text-foreground tracking-tight">{tier.price}</span>
        <span className="text-base text-muted-foreground">/mo</span>
      </div>
      <p className="text-xs text-muted-foreground mb-5">+ $3,000 one-time white-glove onboarding</p>

      {/* Specs */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-3 text-sm text-foreground">
          <Users className="w-4 h-4 text-muted-foreground shrink-0" />
          {tier.bestFor}
        </div>
        <div className="flex items-center gap-3 text-sm text-foreground">
          <Sparkles className="w-4 h-4 text-muted-foreground shrink-0" />
          10 missions/day per user
        </div>
        <div className="flex items-center gap-3 text-sm text-foreground">
          <Cpu className="w-4 h-4 text-muted-foreground shrink-0" />
          Sonnet + Opus 4.6 hybrid
        </div>
      </div>

      {/* Server spec box — purple-tinted, labeled "Dedicated" */}
      <div className="rounded-lg border border-purple-500/20 bg-purple-500/[0.04] p-3 mb-5">
        <p className="text-[10px] font-medium text-purple-400 uppercase tracking-wider mb-2">Dedicated Server (yours alone)</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-foreground">
            <MemoryStick className="w-3.5 h-3.5 text-muted-foreground" />
            {tier.server}
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground">
            <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
            {tier.storage}
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground">
            <Server className="w-3.5 h-3.5 text-muted-foreground" />
            {tier.transfer}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-border/40 pt-5 mb-6 flex-1">
        <div className="space-y-2.5">
          {[
            "Everything in Business, plus:",
            "Claude Opus 4.6 for strategic missions",
            "Full server isolation (no other tenants)",
            "25 users",
            "Custom Agent Personas",
            "100 integrations",
            "Priority support",
          ].map((f, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 text-sm ${
                f.endsWith(":") ? "text-muted-foreground font-medium mt-1" : "text-foreground/80"
              }`}
            >
              {!f.endsWith(":") && <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />}
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onPilotClick}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 bg-purple-500 text-white hover:bg-purple-600"
      >
        <MessageSquare className="w-4 h-4" />
        Talk to Us
      </button>
    </motion.div>
  );
}

// ─── Static Plan Card (Enterprise+) ─────────────────────────────────────────

function StaticPlanCard({ plan, index, onPilotClick }: {
  plan: typeof enterprisePlusPlan;
  index: number;
  onPilotClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = plan.icon;

  return (
    <motion.div
      ref={ref}
      custom={index}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      className="relative rounded-2xl border border-border/50 bg-card/30 p-7 flex flex-col"
      style={{
        backdropFilter: "blur(8px)",
        boxShadow: "0 1px 2px hsl(0 0% 0% / 0.3)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2 mt-1">
        <Icon className={`w-5 h-5 ${plan.colorClass}`} />
        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">{plan.tagline}</p>

      {/* Price */}
      <div className="mb-1">
        <span className="text-4xl font-bold text-foreground tracking-tight">{plan.price}</span>
        {plan.period && <span className="text-base text-muted-foreground">{plan.period}</span>}
      </div>
      <p className="text-xs text-muted-foreground mb-6">Onboarding included in custom quote</p>

      {/* Specs */}
      <div className="space-y-3 mb-6">
        {plan.specs.map((spec) => {
          const SIcon = spec.icon;
          return (
            <div key={spec.label} className="flex items-center gap-3 text-sm text-foreground">
              <SIcon className="w-4 h-4 text-muted-foreground shrink-0" />
              {spec.label}
            </div>
          );
        })}
      </div>

      {/* Features */}
      <div className="border-t border-border/40 pt-5 mb-6 flex-1">
        <div className="space-y-2.5">
          {plan.features.map((f, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 text-sm ${
                f.endsWith(":") ? "text-muted-foreground font-medium mt-1" : "text-foreground/80"
              }`}
            >
              {!f.endsWith(":") && <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />}
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onPilotClick}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
      >
        <MessageSquare className="w-4 h-4" />
        Talk to Us
      </button>
    </motion.div>
  );
}

function FAQItem({ item, index }: { item: typeof faqs[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      custom={index}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      className="rounded-xl border border-border/40 bg-card/30 p-5"
      style={{ backdropFilter: "blur(6px)" }}
    >
      <h4 className="text-sm font-semibold text-foreground mb-2">{item.q}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Pricing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  const allRef = useRef<HTMLDivElement>(null);
  const allInView = useInView(allRef, { once: true, margin: "-60px" });

  const [pilotOpen, setPilotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PilotModal open={pilotOpen} onClose={() => setPilotOpen(false)} />
      <LandingNav onPilotClick={() => setPilotOpen(true)} />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-6 px-6">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(ellipse, hsla(258, 90%, 66%, 0.08) 0%, transparent 70%)",
            }}
          />
        </div>

        <motion.div
          ref={heroRef}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={stagger}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono tracking-widest mb-6"
              style={{
                background: "hsl(var(--primary) / 0.08)",
                border: "1px solid hsl(var(--primary) / 0.25)",
                color: "hsl(var(--primary) / 0.8)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              ENTERPRISE PRICING
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-4"
          >
            Deploy an AI workforce.{" "}
            <span
              style={{
                background: "linear-gradient(90deg, hsl(217,91%,65%), hsl(258,90%,70%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Stay profitable from day one.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-base text-muted-foreground max-w-lg mx-auto"
          >
            5 specialized AI agents, ~100 integrations, autonomous execution.
            No per-seat surprises. No hidden costs.
          </motion.p>
        </motion.div>
      </section>

      {/* ── Plan Cards ── */}
      <section className="px-6 pb-20 pt-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <BusinessPlanCard index={0} onPilotClick={() => setPilotOpen(true)} />
          <EnterprisePlanCard index={1} onPilotClick={() => setPilotOpen(true)} />
          <StaticPlanCard plan={enterprisePlusPlan} index={2} onPilotClick={() => setPilotOpen(true)} />
        </div>
      </section>

      {/* ── What's Included in Every Plan ── */}
      <section className="px-6 pb-20">
        <motion.div
          ref={allRef}
          initial="hidden"
          animate={allInView ? "visible" : "hidden"}
          variants={stagger}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-2">Included in Every Plan</h2>
            <p className="text-sm text-muted-foreground">
              Every plan gets the full Valence AI platform. No feature gating on the essentials.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {includedInAll.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  custom={i + 1}
                  className="rounded-xl border border-border/40 bg-card/30 p-5"
                  style={{ backdropFilter: "blur(6px)" }}
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <Icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-sm font-semibold text-foreground">{item.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Plan Comparison</h2>
            <p className="text-sm text-muted-foreground">
              No per-seat fees. No integration surcharges. Pick your tier.
            </p>
          </div>

          <div
            className="rounded-2xl border border-border/40 overflow-hidden"
            style={{ backdropFilter: "blur(8px)", background: "hsl(240 20% 6% / 0.6)" }}
          >
            <div className="grid grid-cols-4 text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border/30 px-6 py-3">
              <span>What you get</span>
              <span className="text-center text-blue-400">Business</span>
              <span className="text-center text-purple-400">Enterprise</span>
              <span className="text-center text-amber-400">Enterprise+</span>
            </div>
            {[
              { label: "Users", values: ["Up to 20+", "25", "Unlimited"] },
              { label: "Missions / user / day", values: ["10", "10", "Unlimited"] },
              { label: "AI Model", values: ["Sonnet 4.6", "Sonnet + Opus", "Full Opus"] },
              { label: "Server", values: ["3 tiers (16-64 GB) shared", "2 tiers (32-64 GB) dedicated", "On-prem / VPC"] },
              { label: "Integrations", values: ["~100", "~100", "Unlimited"] },
              { label: "Custom Agents", values: ["—", "Yes", "Yes"] },
              { label: "SLA", values: ["—", "—", "Custom"] },
              { label: "Price", values: ["From $2,499/mo", "From $4,999/mo", "Custom"] },
            ].map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-4 text-sm px-6 py-3 ${
                  i % 2 === 0 ? "bg-white/[0.01]" : ""
                } border-b border-border/10 last:border-b-0`}
              >
                <span className="text-muted-foreground font-medium">{row.label}</span>
                {row.values.map((v, j) => (
                  <span
                    key={j}
                    className={`text-center ${
                      v === "—" ? "text-muted-foreground/30" : "text-foreground"
                    }`}
                  >
                    {v}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((item, i) => (
              <FAQItem key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 pb-20">
        <div
          className="max-w-3xl mx-auto rounded-2xl border border-purple-500/20 p-10 text-center"
          style={{
            background: "linear-gradient(135deg, hsla(258, 90%, 66%, 0.05) 0%, hsla(217, 91%, 60%, 0.05) 100%)",
          }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">Ready to deploy your AI workforce?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Start a 2-week pilot at 50% off. See real results before you commit.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPilotOpen(true)}
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
              }}
            >
              Start Your Pilot →
            </button>
            <a
              href="mailto:arpit@valenceai.co?subject=Valence%20AI%20Demo%20Request"
              className="px-6 py-3 rounded-xl text-sm font-semibold border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all"
            >
              Book a Demo
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
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
            <Link to="/privacy" className="hover:text-muted-foreground transition-colors">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-muted-foreground transition-colors">
              Terms of Service
            </Link>
            <span>·</span>
            <a href="mailto:arpit@valenceai.co" className="hover:text-muted-foreground transition-colors">
              arpit@valenceai.co
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
