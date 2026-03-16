import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

/* ─── Animation variants ─────────────────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 32, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
};

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Pain point data ────────────────────────────────────────────────────────── */
const PAIN_POINTS = [
  {
    icon: "🧩",
    title: "Tool Sprawl",
    desc: "30+ SaaS subscriptions. Different logins, different UIs, different billing cycles. Nobody knows what the company actually uses.",
    stat: "30+",
    statLabel: "avg SaaS tools",
    color: "hsl(0 72% 51%)",
  },
  {
    icon: "🔗",
    title: "Integration Tax",
    desc: "Paying $2-5K/month for Zapier, Paragon, or custom middleware just to make your tools talk to each other.",
    stat: "$2-5K",
    statLabel: "/mo on glue",
    color: "hsl(38 92% 50%)",
  },
  {
    icon: "🏚️",
    title: "Data Silos",
    desc: "Customer data in HubSpot. Financial data in QuickBooks. Project data in Jira. Nothing connected. No single source of truth.",
    stat: "0",
    statLabel: "single sources",
    color: "hsl(258 90% 66%)",
  },
  {
    icon: "💸",
    title: "Rising Costs",
    desc: "SaaS prices increase every year. Legacy contracts lock you in. The total cost keeps climbing while the value stays flat.",
    stat: "$180K+",
    statLabel: "/yr avg stack cost",
    color: "hsl(330 81% 60%)",
  },
];

/* ─── Transformation phases ──────────────────────────────────────────────────── */
const PHASES = [
  {
    phase: "01",
    title: "Audit",
    desc: "We map your entire stack — every tool, every integration, every cost. Identify redundancies, data gaps, and automation opportunities.",
    duration: "Week 1",
    color: "hsl(217 91% 60%)",
  },
  {
    phase: "02",
    title: "Redesign",
    desc: "Architect the AI-native replacement. One unified system, privately hosted, with AI baked into every workflow from the ground up.",
    duration: "Week 2-3",
    color: "hsl(258 90% 66%)",
  },
  {
    phase: "03",
    title: "Build",
    desc: "Deploy private infrastructure. Migrate data. Build custom tools that replace your entire SaaS stack under one ecosystem.",
    duration: "Week 3-6",
    color: "hsl(38 92% 50%)",
  },
  {
    phase: "04",
    title: "Deploy",
    desc: "AI agents go live. All integrations wired. Your team gets trained on the new system. We run a test week together.",
    duration: "Week 6-7",
    color: "hsl(160 84% 39%)",
  },
  {
    phase: "05",
    title: "Manage",
    desc: "Ongoing monitoring, optimization, and evolution. Weekly reports. Monthly strategy calls. Your AI ecosystem gets smarter every week.",
    duration: "Ongoing",
    color: "hsl(142 71% 45%)",
  },
];

/* ─── Benefits ───────────────────────────────────────────────────────────────── */
const BENEFITS = [
  {
    icon: "🌐",
    title: "One Ecosystem",
    desc: "Everything in one place. One login, one dashboard, one source of truth. No more tab-switching across 30 tools.",
    color: "hsl(217 91% 60%)",
  },
  {
    icon: "🔒",
    title: "Private Hosting",
    desc: "Your data, your infrastructure. Hosted on hardware you own or cloud you control. GDPR, HIPAA, SOC2 ready by design.",
    color: "hsl(160 84% 39%)",
  },
  {
    icon: "🧠",
    title: "AI Baked In",
    desc: "Not bolted on — native. Every workflow, every report, every process has AI embedded from day one. Not an add-on.",
    color: "hsl(258 90% 66%)",
  },
  {
    icon: "💰",
    title: "No More SaaS Bills",
    desc: "Replace $180K/yr in SaaS subscriptions with one platform you own. No per-seat pricing. No surprise price hikes.",
    color: "hsl(142 71% 45%)",
  },
  {
    icon: "📈",
    title: "Agents That Learn",
    desc: "Episodic memory + SOUL evolution. Your AI employees get smarter every week from the work they do for you.",
    color: "hsl(38 92% 50%)",
  },
  {
    icon: "🤝",
    title: "White-Glove Setup",
    desc: "We handle everything. Audit, architecture, migration, deployment, training, ongoing management. You just see results.",
    color: "hsl(330 81% 60%)",
  },
];

/* ─── Before/After comparison items ──────────────────────────────────────────── */
const BEFORE_ITEMS = [
  "30+ SaaS subscriptions",
  "Different login for each tool",
  "Data scattered across silos",
  "$180K+/yr in software costs",
  "Manual integrations that break",
  "No AI capabilities",
  "Vendor lock-in on everything",
];

const AFTER_ITEMS = [
  "One unified ecosystem",
  "Single dashboard for everything",
  "All data connected in one place",
  "One fixed platform cost",
  "Native integrations, zero glue",
  "AI agents in every workflow",
  "You own the infrastructure",
];

/* ─── Transformation-specific FAQs ───────────────────────────────────────────── */
const TRANSFORM_FAQS = [
  { q: "How long does a full transformation take?", a: "Typically 6-8 weeks from audit to deployment. We work in parallel — migrating data while building new tools — to minimize downtime. Your team continues using existing tools until the new system is ready." },
  { q: "Will my team need training?", a: "Minimal. The new system is designed to be simpler than what you're replacing. We provide a training week and documentation. Most teams are fully ramped within 3-5 days." },
  { q: "What happens to my existing data?", a: "We migrate everything. Customer records, financial data, project history, files — all moved to the new ecosystem. We verify data integrity at every step." },
  { q: "Can I keep some existing tools?", a: "Absolutely. We don't force a full rip-and-replace. If a tool works well and your team loves it, we integrate it into the new ecosystem. The goal is fewer tools, not zero legacy." },
  { q: "What if my industry has compliance requirements?", a: "That's actually where we shine. Private hosting means your data never leaves your infrastructure. We build compliance controls into the system architecture — audit logs, access controls, encryption at rest." },
  { q: "What's the ROI?", a: "Most clients break even within 3-4 months from SaaS cost elimination alone. Factor in productivity gains from AI-native workflows and the ROI accelerates. We provide a detailed ROI projection during the audit phase." },
];

/* ─── Main content ───────────────────────────────────────────────────────────── */
export function AITransformationContent({ onPilotClick }: { onPilotClick: () => void }) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-[120px] pb-16 px-6">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <div
          className="absolute top-10 left-1/3 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, hsl(258 90% 66%) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          <Reveal>
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase bg-purple-500/8 text-purple-400 border border-purple-500/20 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                AI Business Transformation
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-6xl font-bold leading-[1.1] mb-6"
            >
              Stop Duct-Taping
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-primary to-emerald-400 bg-clip-text text-transparent">
                SaaS Together.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              We audit your entire tech stack, replace legacy software and
              expensive SaaS, and rebuild everything into one AI-native
              ecosystem — privately hosted, custom-built, fully managed.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={onPilotClick}
                className="group px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-primary text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5"
              >
                Book a Transformation Call
                <motion.span
                  className="inline-block ml-1"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  &rarr;
                </motion.span>
              </button>
              <a
                href="#pain-points"
                className="px-8 py-3.5 rounded-xl border border-border/50 text-foreground font-medium hover:bg-card/50 hover:border-border transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("pain-points")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                See the Problem
              </a>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ─── PAIN POINTS ───────────────────────────────────────────────── */}
      <section
        id="pain-points"
        className="py-16 px-6 scroll-mt-28"
        style={{ background: "hsl(240 33% 3%)" }}
      >
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <motion.div variants={itemVariants} className="text-center mb-12">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-400/60 mb-3 block">
                The Problem
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                The{" "}
                <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  SaaS trap
                </span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm">
                Every company has this problem. Nobody talks about it.
              </p>
            </motion.div>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-4">
            {PAIN_POINTS.map((p, i) => (
              <Reveal key={p.title}>
                <motion.div
                  variants={itemVariants}
                  className="rounded-xl border border-border/30 bg-card/30 p-5 h-full"
                  whileHover={{
                    borderColor: p.color.replace(")", " / 0.3)").replace("hsl(", "hsl("),
                    y: -2,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl flex-shrink-0">{p.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground text-sm">
                          {p.title}
                        </h3>
                        <span
                          className="text-xs font-mono font-bold"
                          style={{ color: p.color }}
                        >
                          {p.stat}
                          <span className="text-[9px] text-muted-foreground/40 ml-1 font-normal">
                            {p.statLabel}
                          </span>
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHAT WE DO — 5 PHASE TIMELINE ─────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <motion.div variants={itemVariants} className="text-center mb-12">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-3 block">
                Our Process
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                From chaos to{" "}
                <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  AI-native
                </span>{" "}
                in 6 weeks
              </h2>
            </motion.div>
          </Reveal>

          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-purple-400/30 to-green-400/40 hidden md:block" />

            <div className="space-y-6">
              {PHASES.map((p, i) => (
                <Reveal key={p.phase}>
                  <motion.div
                    variants={itemVariants}
                    className="flex gap-4 items-start"
                  >
                    <motion.div
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center relative z-10"
                      style={{
                        background: p.color.replace(")", " / 0.1)").replace("hsl(", "hsl("),
                        border: `1px solid ${p.color.replace(")", " / 0.25)").replace("hsl(", "hsl(")}`,
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <span
                        className="text-xs font-mono font-bold"
                        style={{ color: p.color }}
                      >
                        {p.phase}
                      </span>
                    </motion.div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {p.title}
                        </h3>
                        <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                          {p.duration}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── BEFORE / AFTER ────────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: "hsl(240 33% 3%)" }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Before{" "}
                <span className="text-muted-foreground/40">&</span>{" "}
                <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                  After
                </span>
              </h2>
            </motion.div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            <Reveal>
              <motion.div
                variants={itemVariants}
                className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 h-full"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-red-400/60">
                    Before
                  </span>
                  <div className="flex-1 h-px bg-red-500/10" />
                </div>
                <div className="space-y-2.5">
                  {BEFORE_ITEMS.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="text-red-400/60 text-xs">✕</span>
                      <span className="text-sm text-muted-foreground">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </Reveal>

            <Reveal>
              <motion.div
                variants={itemVariants}
                className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 h-full"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400/60">
                    After
                  </span>
                  <div className="flex-1 h-px bg-emerald-500/10" />
                </div>
                <div className="space-y-2.5">
                  {AFTER_ITEMS.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="text-emerald-400 text-xs">✓</span>
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── BENEFITS GRID ─────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                What you{" "}
                <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  get
                </span>
              </h2>
            </motion.div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title}>
                <motion.div
                  variants={itemVariants}
                  className="rounded-xl border border-border/30 bg-card/30 p-5 h-full"
                  whileHover={{
                    borderColor: b.color.replace(")", " / 0.3)").replace("hsl(", "hsl("),
                    y: -3,
                    boxShadow: `0 8px 30px ${b.color.replace(")", " / 0.08)").replace("hsl(", "hsl(")}`,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-xl mb-2 block">{b.icon}</span>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    {b.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {b.desc}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROI STRIP ─────────────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: "hsl(240 33% 3%)" }}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5 p-8 md:p-10"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  The math is simple
                </h2>
                <p className="text-sm text-muted-foreground">
                  Most companies break even in 3-4 months from SaaS elimination alone.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { stat: "30+", label: "SaaS tools replaced", color: "hsl(217 91% 60%)" },
                  { stat: "$180K", label: "/yr saved on software", color: "hsl(142 71% 45%)" },
                  { stat: "10x", label: "productivity boost", color: "hsl(258 90% 66%)" },
                  { stat: "6wk", label: "to full deployment", color: "hsl(38 92% 50%)" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p
                      className="text-2xl md:text-3xl font-bold"
                      style={{ color: s.color }}
                    >
                      {s.stat}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Questions</h2>
            </motion.div>
          </Reveal>

          <div className="space-y-2">
            {TRANSFORM_FAQS.map((item, i) => (
              <Reveal key={i}>
                <motion.div variants={itemVariants}>
                  <div
                    className="rounded-xl border border-border/20 bg-card/20 overflow-hidden cursor-pointer"
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  >
                    <div className="flex items-center justify-between p-4">
                      <h3 className="font-medium text-foreground text-sm pr-4">
                        {item.q}
                      </h3>
                      <motion.span
                        className="text-muted-foreground flex-shrink-0 text-lg"
                        animate={{ rotate: faqOpen === i ? 45 : 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        +
                      </motion.span>
                    </div>
                    <AnimatePresence>
                      {faqOpen === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-muted-foreground leading-relaxed px-4 pb-4">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: "hsl(240 33% 3%)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to go{" "}
                <span className="bg-gradient-to-r from-purple-400 via-primary to-emerald-400 bg-clip-text text-transparent">
                  AI-native
                </span>
                ?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-sm">
                We'll audit your stack, show you the savings, and build a
                transformation plan — free. No commitment.
              </p>
              <motion.button
                onClick={onPilotClick}
                className="px-10 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-primary text-white font-semibold text-lg shadow-lg shadow-purple-500/20"
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 40px hsl(258 90% 66% / 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Book a Transformation Call
              </motion.button>
              <p className="text-xs text-muted-foreground/40 mt-4">
                Free audit. Free ROI projection. No obligation.
              </p>
            </motion.div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
