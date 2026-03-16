import { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { Link } from "react-router-dom";
import { LandingNav } from "@/components/landing/LandingNav";
import { PilotModal } from "@/components/landing/PilotModal";
import { SEOHead } from "@/components/SEOHead";
import { IntegrationGrid } from "@/components/landing/IntegrationGrid";

/* ─── Animated counter ──────────────────────────────────────────────────────── */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1200, bounce: 0 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v).toLocaleString()));
    return unsub;
  }, [spring]);

  return <span ref={ref}>{display}{suffix}</span>;
}

/* ─── Fade-in wrapper with direction options ────────────────────────────────── */
function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const initial =
    direction === "left"
      ? { opacity: 0, x: -30 }
      : direction === "right"
        ? { opacity: 0, x: 30 }
        : direction === "none"
          ? { opacity: 0 }
          : { opacity: 0, y: 24 };
  const animate = inView
    ? { opacity: 1, x: 0, y: 0 }
    : {};
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Floating particles ────────────────────────────────────────────────────── */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────────── */
export default function Vision() {
  const [pilotOpen, setPilotOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, -80]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SEOHead
        title="Valence AI — AI Workers for Every Company"
        description="Deploy AI employees on private infrastructure inside your company. Your data never leaves. Custom-trained to your business. Managed end-to-end."
        canonical="/vision"
      />
      <PilotModal open={pilotOpen} onClose={() => setPilotOpen(false)} />
      <LandingNav onPilotClick={() => setPilotOpen(true)} />

      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative overflow-hidden pt-32 pb-16">
        <Particles />
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, hsl(217 91% 60%) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, hsl(258 90% 66%) 0%, transparent 70%)" }}
        />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
          className="relative max-w-5xl mx-auto px-6 text-center"
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase bg-primary/8 text-primary border border-primary/20 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Now Deploying AI Workforces
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6"
          >
            <span className="text-foreground">Hire AI.</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Not Software.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI employees on private hardware inside your company. Custom-trained.
            Self-improving. Fully managed. You see the results.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => setPilotOpen(true)}
              className="group px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Book a Demo
              <motion.span
                className="inline-block ml-1"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                &rarr;
              </motion.span>
            </button>
            <a
              href="#how-it-works"
              className="px-8 py-3.5 rounded-xl border border-border/50 text-foreground font-medium hover:bg-card/50 hover:border-border transition-all"
            >
              See How It Works
            </a>
          </motion.div>
        </motion.div>

        {/* Stats bar - inline with hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-4xl mx-auto px-6 mt-16"
        >
          <div className="grid grid-cols-4 gap-4 rounded-2xl border border-border/20 bg-card/20 backdrop-blur-sm p-6">
            {[
              { value: 6, prefix: "$", suffix: "", label: "services per $1 software" },
              { value: 1, prefix: "$", suffix: "T", label: "staffing & BPO market" },
              { value: 50, prefix: "", suffix: "+", label: "integrations" },
              { value: 48, prefix: "", suffix: "hr", label: "to AI workforce" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {s.prefix}<AnimatedNumber value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── PROBLEM → SOLUTION (merged, compact) ────────────────────── */}
      <section className="py-16 px-6" style={{ background: "hsl(240 33% 3%)" }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              AI tools everywhere.{" "}
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                AI that works for you?
              </span>{" "}
              That's us.
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              Others give you a chatbox. We deploy autonomous AI employees — on
              your hardware, wired into your tools, custom-trained to your
              business.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: "🔒",
                title: "Private Infrastructure",
                desc: "Runs on hardware in your office. Data never leaves. GDPR/HIPAA ready.",
                color: "hsl(217 91% 60%)",
              },
              {
                icon: "👥",
                title: "AI Employees, Not Chatbots",
                desc: "SDR, writer, bookkeeper — they do the work autonomously, 24/7.",
                color: "hsl(160 84% 39%)",
              },
              {
                icon: "🧠",
                title: "Gets Smarter Every Week",
                desc: "Episodic memory + SOUL evolution. After 3 months, better than a new hire.",
                color: "hsl(258 90% 66%)",
              },
              {
                icon: "🛡️",
                title: "Quality-Audited",
                desc: "AI QA reviews all work before delivery. No hallucinations pass through.",
                color: "hsl(38 92% 50%)",
              },
              {
                icon: "🔌",
                title: "50+ Integrations",
                desc: "Slack, Notion, HubSpot, GitHub, Gmail, Sheets — your AI uses your tools.",
                color: "hsl(330 81% 60%)",
              },
              {
                icon: "🤝",
                title: "Fully Managed",
                desc: "We set up, deploy, wire, and manage. Weekly reports. Monthly strategy calls.",
                color: "hsl(190 84% 39%)",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <motion.div
                  className="rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm p-5 h-full cursor-default"
                  whileHover={{
                    borderColor: item.color + "40",
                    boxShadow: `0 0 30px ${item.color}10`,
                    y: -2,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-xl mb-2 block">{item.icon}</span>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 px-6 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Zero to AI workforce in{" "}
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                48 hours
              </span>
            </h2>
          </Reveal>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-purple-400/40 to-transparent hidden md:block" />

            <div className="space-y-6">
              {[
                { step: "01", title: "Discovery Call", desc: "We identify where AI workers deliver immediate ROI.", time: "30 min" },
                { step: "02", title: "Hardware Setup", desc: "Buy a device ($249-$599), plug it in. We configure remotely.", time: "Same day" },
                { step: "03", title: "Deploy AI Team", desc: "Custom-trained workers wired into all your tools and integrations.", time: "24-48hr" },
                { step: "04", title: "Go Live", desc: "Watch your AI workforce in real-time. We run a test mission together.", time: "Day 2" },
                { step: "05", title: "Ongoing", desc: "Weekly reports. Self-improving AI. We tune, optimize, and expand.", time: "Every week" },
              ].map((item, i) => (
                <Reveal key={item.step} delay={i * 0.08} direction="left">
                  <div className="flex gap-4 items-center">
                    <motion.div
                      className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center relative z-10"
                      whileHover={{ scale: 1.1, borderColor: "hsl(217 91% 60%)" }}
                    >
                      <span className="text-xs font-mono font-bold text-primary">{item.step}</span>
                    </motion.div>
                    <div className="flex-1 flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">{item.time}</span>
                    </div>
                    <p className="hidden md:block text-sm text-muted-foreground max-w-xs">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI WORKERS CATALOG ────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: "hsl(240 33% 3%)" }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
              Meet your{" "}
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                AI team
              </span>
            </h2>
            <p className="text-muted-foreground text-center mb-10 text-sm">
              Specialized autonomous agents. Pick the roles you need.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { role: "Chief of Staff", desc: "Coordinates all workers. Manages priorities.", color: "hsl(217 91% 60%)", icon: "⚡" },
              { role: "Market Researcher", desc: "Researches leads, competitors, markets.", color: "hsl(160 84% 39%)", icon: "🔍" },
              { role: "Content Creator", desc: "Blogs, social, newsletters in your voice.", color: "hsl(258 90% 66%)", icon: "✍️" },
              { role: "SDR", desc: "Personalized outreach at scale.", color: "hsl(38 92% 50%)", icon: "📧" },
              { role: "Software Engineer", desc: "Builds, deploys, maintains code.", color: "hsl(38 92% 50%)", icon: "💻" },
              { role: "QA Reviewer", desc: "Audits all work. Catches hallucinations.", color: "hsl(330 81% 60%)", icon: "🛡️" },
            ].map((w, i) => (
              <Reveal key={w.role} delay={i * 0.05}>
                <motion.div
                  className="rounded-xl border border-border/30 bg-card/30 p-4 h-full"
                  style={{ boxShadow: `0 0 30px ${w.color}06` }}
                  whileHover={{ borderColor: w.color + "40", y: -3, boxShadow: `0 0 40px ${w.color}15` }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{w.icon}</span>
                    <h3 className="font-semibold text-foreground text-xs">AI {w.role}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{w.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="text-center text-xs text-muted-foreground/50 mt-6">
              + Bookkeeper, Data Analyst, Recruiter, SEO Specialist, Social Media Manager & custom roles
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── USE CASES — COMPACT STRIP ───────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
              Real{" "}
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                cost savings
              </span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { role: "SDR", before: "$6K/mo", after: "$1.5K/mo", savings: "75%", desc: "200+ outreach/week, 15-20% reply rate, 24/7" },
              { role: "Content", before: "$4K/mo", after: "$1K/mo", savings: "75%", desc: "3x/week blogs + social + newsletters" },
              { role: "Back Office", before: "$3K/mo", after: "$800/mo", savings: "73%", desc: "Invoices, reconciliation, reports — fully private" },
              { role: "Marketing Dept", before: "$15K/mo", after: "$5K/mo", savings: "67%", desc: "Content, social, email, SEO, analytics" },
            ].map((c, i) => (
              <Reveal key={c.role} delay={i * 0.06}>
                <motion.div
                  className="rounded-xl border border-border/30 bg-card/30 p-4 flex items-center gap-4"
                  whileHover={{ borderColor: "hsl(160 84% 39% / 0.3)", y: -2 }}
                >
                  <div className="flex-shrink-0">
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      -{c.savings}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-foreground text-sm">{c.role}</h3>
                      <span className="text-xs text-muted-foreground/40">
                        <span className="line-through text-red-400/50">{c.before}</span>
                        {" → "}
                        <span className="text-green-400">{c.after}</span>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.desc}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: "hsl(240 33% 3%)" }}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
              Why{" "}
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Valence AI
              </span>
            </h2>
          </Reveal>

          <Reveal>
            <div className="rounded-xl border border-border/30 bg-card/30 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left p-3 text-muted-foreground font-mono text-[10px] uppercase tracking-wider">Feature</th>
                    <th className="text-center p-3 text-muted-foreground font-mono text-[10px] uppercase tracking-wider">Cloud AI</th>
                    <th className="text-center p-3 font-mono text-[10px] uppercase tracking-wider bg-primary/5 text-primary">Valence</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground text-xs">
                  {[
                    ["Data Privacy", "Their cloud", "Never leaves your building"],
                    ["Customization", "Generic", "Custom-trained to you"],
                    ["Memory", "Resets every session", "Learns every week"],
                    ["Infrastructure", "Cloud-only", "Hardware you own"],
                    ["Work Done", "Copilot (assists)", "Autopilot (does it)"],
                    ["Quality", "You verify", "AI QA reviews all"],
                    ["Integrations", "Surface plugins", "Deep stack wiring"],
                    ["Support", "Self-serve docs", "Weekly reports + calls"],
                  ].map(([f, cloud, valence]) => (
                    <tr key={f} className="border-b border-border/15">
                      <td className="p-3 font-medium text-foreground text-xs">{f}</td>
                      <td className="p-3 text-center text-muted-foreground/50">{cloud}</td>
                      <td className="p-3 text-center bg-primary/5 text-foreground">{valence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── THE NODE — HARDWARE (compact strip) ─────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
              The{" "}
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Valence Node
              </span>
            </h2>
            <p className="text-muted-foreground text-center text-sm mb-10 max-w-lg mx-auto">
              A compact AI compute device in your office. Buy from Amazon, plug
              it in — we handle the rest.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                tier: "Starter",
                device: "NVIDIA Jetson Orin Nano",
                price: "$249",
                specs: "67 TOPS · 8GB · LED status",
                color: "hsl(217 91% 60%)",
              },
              {
                tier: "Pro",
                device: "Mac Mini M4",
                price: "$599",
                specs: "Neural Engine · 16GB · E-ink display",
                color: "hsl(258 90% 66%)",
                featured: true,
              },
              {
                tier: "Enterprise",
                device: "GPU Server",
                price: "$2-5K",
                specs: "Full local inference · Air-gapped",
                color: "hsl(38 92% 50%)",
              },
            ].map((n, i) => (
              <Reveal key={n.tier} delay={i * 0.08}>
                <motion.div
                  className={`rounded-xl border p-5 text-center relative ${
                    n.featured ? "border-primary/40 bg-primary/5" : "border-border/30 bg-card/30"
                  }`}
                  whileHover={{ y: -4, boxShadow: `0 8px 30px ${n.color}15` }}
                >
                  {n.featured && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest bg-primary text-primary-foreground">
                      Popular
                    </span>
                  )}
                  <span className="text-[10px] font-mono uppercase tracking-widest block mb-1" style={{ color: n.color }}>
                    {n.tier}
                  </span>
                  <p className="text-2xl font-bold text-foreground">{n.price}</p>
                  <p className="text-xs text-muted-foreground/50 mb-2">one-time</p>
                  <p className="text-xs font-medium text-foreground">{n.device}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{n.specs}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOUL EVOLUTION — compact timeline ───────────────────────── */}
      <section className="py-16 px-6" style={{ background: "hsl(240 33% 3%)" }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
              Gets{" "}
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                smarter every week
              </span>
            </h2>
          </Reveal>

          {/* Horizontal timeline */}
          <div className="relative">
            <div className="absolute top-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden md:block" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { week: "Week 1", title: "Onboarding", color: "hsl(217 91% 60%)", progress: 25 },
                { week: "Week 4", title: "Independent", color: "hsl(160 84% 39%)", progress: 50 },
                { week: "Week 12", title: "Expert", color: "hsl(258 90% 66%)", progress: 80 },
                { week: "Week 24+", title: "Irreplaceable", color: "hsl(38 92% 50%)", progress: 100 },
              ].map((s, i) => (
                <Reveal key={s.week} delay={i * 0.1}>
                  <div className="text-center">
                    <motion.div
                      className="w-3 h-3 rounded-full mx-auto mb-3 border-2"
                      style={{ borderColor: s.color, background: "hsl(240 33% 3%)" }}
                      whileInView={{ background: s.color }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.15 }}
                    />
                    <span className="text-[10px] font-mono uppercase tracking-widest block mb-1" style={{ color: s.color }}>
                      {s.week}
                    </span>
                    <h3 className="font-semibold text-foreground text-sm">{s.title}</h3>
                    <div className="h-1 rounded-full bg-border/30 mt-2 mx-4 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: s.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
                      />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal>
            <div className="mt-10 grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Episodic Memory", sub: "Remembers every task & outcome" },
                { label: "SOUL Distillation", sub: "Permanent intelligence growth" },
                { label: "Mesh Learning", sub: "Learns across all clients" },
              ].map((m) => (
                <div key={m.label} className="rounded-lg border border-border/20 bg-card/20 p-3">
                  <p className="text-sm font-semibold text-foreground">{m.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── INTEGRATION GRID ────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
              Wired into{" "}
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                your entire stack
              </span>
            </h2>
            <p className="text-muted-foreground text-center text-sm mb-10 max-w-xl mx-auto">
              50+ integrations — CRM, sales, marketing, dev tools, accounting. Your AI uses the same tools you do.
            </p>
          </Reveal>
          <Reveal>
            <IntegrationGrid />
          </Reveal>
        </div>
      </section>

      {/* ─── SECURITY (compact strip) ────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: "hsl(240 33% 3%)" }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Enterprise-grade security by default
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: "🔐", label: "AES-256-GCM encryption" },
              { icon: "🏠", label: "On-premises execution" },
              { icon: "📋", label: "Complete audit logs" },
              { icon: "🛡️", label: "RBAC access control" },
              { icon: "🏥", label: "HIPAA & GDPR ready" },
              { icon: "🔑", label: "OAuth 2.0 + PKCE" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 0.04}>
                <div className="flex items-center gap-3 rounded-xl border border-border/20 bg-card/20 p-3">
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOR AGENCIES (compact banner) ────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5 p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-primary/60 mb-2 block">
                    Agency Partners
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                    White-label our AI workforce
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    You sell the service. We run the backend. Your clients see
                    your brand. Keep 30%+ margin on every deployment.
                  </p>
                  <button
                    onClick={() => setPilotOpen(true)}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all hover:-translate-y-0.5"
                  >
                    Become a Partner
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { metric: "30%+", desc: "margin per worker" },
                    { metric: "5-20x", desc: "workers per deal" },
                    { metric: "Zero", desc: "engineering effort" },
                    { metric: "48hr", desc: "per deployment" },
                  ].map((s) => (
                    <div key={s.desc} className="text-center rounded-xl border border-border/20 bg-card/20 p-3">
                      <p className="text-lg font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                        {s.metric}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FAQ (compact accordion) ──────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: "hsl(240 33% 3%)" }}>
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Questions
            </h2>
          </Reveal>

          <div className="space-y-2">
            {[
              { q: "How is this different from ChatGPT or Perplexity?", a: "They're chatboxes — they assist, you still work. We deploy autonomous AI employees that complete tasks end-to-end on private hardware, custom-trained to your business." },
              { q: "Is my data really private?", a: "100%. Runs on physical hardware in your office. Data never leaves your building. We configure via SSH, never access your data." },
              { q: "What hardware do I need?", a: "NVIDIA Jetson ($249) or Mac Mini M4 ($599). Buy from Amazon, plug in, we configure within 48 hours." },
              { q: "What about quality?", a: "AI QA system reviews all work before delivery. Verifies execution, catches hallucinations, flags quality issues. Human review always available." },
              { q: "How fast do I see results?", a: "Live in 48 hours. Most clients see ROI in week one. Results compound as AI workers improve with every task." },
              { q: "Can I cancel anytime?", a: "Month-to-month. Hardware is yours. Free 2-week pilot with no commitment." },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.03}>
                <div
                  className="rounded-xl border border-border/20 bg-card/20 overflow-hidden cursor-pointer"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  <div className="flex items-center justify-between p-4">
                    <h3 className="font-medium text-foreground text-sm pr-4">{item.q}</h3>
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF + CTA (merged) ─────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <Reveal direction="left">
              <motion.div
                className="rounded-xl border border-border/30 bg-card/30 p-5 h-full"
                whileHover={{ borderColor: "hsl(217 91% 60% / 0.3)" }}
              >
                <p className="text-sm text-muted-foreground leading-relaxed italic mb-3">
                  "For every $1 on software, $6 on services. Sell the work, not
                  the tool — every model improvement makes you better."
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">JB</div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Julien Bek</p>
                    <p className="text-[10px] text-muted-foreground">Partner, Sequoia Capital</p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
            <Reveal direction="right">
              <motion.div
                className="rounded-xl border border-border/30 bg-card/30 p-5 h-full"
                whileHover={{ borderColor: "hsl(258 90% 66% / 0.3)" }}
              >
                <p className="text-sm text-muted-foreground leading-relaxed italic mb-3">
                  "The next trillion-dollar company will be a software company
                  masquerading as a services firm — AI workers, 80% margins,
                  infinite scale."
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-400">SQ</div>
                  <div>
                    <p className="text-xs font-medium text-foreground">Sequoia Capital</p>
                    <p className="text-[10px] text-muted-foreground">"Services: The New Software"</p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          </div>

          <Reveal>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to hire your{" "}
                <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  AI workforce
                </span>
                ?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-sm">
                30-minute demo. 5 AI employees do 3 days of work in 15 minutes.
                Free 2-week pilot. No commitment.
              </p>
              <motion.button
                onClick={() => setPilotOpen(true)}
                className="px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/20"
                whileHover={{ scale: 1.03, boxShadow: "0 10px 40px hsl(217 91% 60% / 0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                Book a Demo
              </motion.button>
              <div className="flex flex-wrap gap-4 justify-center mt-8 text-xs text-muted-foreground/50">
                {["Funded Startups", "Digital Agencies", "Tech Companies", "Regulated Industries"].map((t, i) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${["bg-green-400", "bg-blue-400", "bg-purple-400", "bg-amber-400"][i]}`} />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="py-6 px-6 border-t border-border/40" style={{ background: "hsl(240 33% 3%)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/50">
          <p>Valence AI</p>
          <div className="flex gap-6">
            <Link to="/landing" className="hover:text-foreground transition">Home</Link>
            <Link to="/pricing" className="hover:text-foreground transition">Pricing</Link>
            <Link to="/privacy" className="hover:text-foreground transition">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
