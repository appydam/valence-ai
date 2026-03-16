import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { IntegrationGrid } from "@/components/landing/IntegrationGrid";

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

/* ─── Rotating role text ─────────────────────────────────────────────────────── */
const ROTATING_ROLES = [
  "SDR",
  "Content Writer",
  "Bookkeeper",
  "Data Analyst",
  "Recruiter",
  "Social Media Manager",
  "DevOps Engineer",
  "Executive Assistant",
];

function RotatingRole() {
  const [index, setIndex] = useState(0);

  // Advance every 2s
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ROTATING_ROLES.length), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-block relative h-[1.15em] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROTATING_ROLES[index]}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-block bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          {ROTATING_ROLES[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ─── Role data ──────────────────────────────────────────────────────────────── */
const ROLES = [
  {
    icon: "📧",
    role: "SDR",
    tagline: "Personalized outreach at scale",
    tasks: ["Research leads & build prospect lists", "Write personalized cold emails", "Follow up automatically across channels"],
    integrations: ["HubSpot", "Salesforce", "Gmail", "LinkedIn"],
    color: "hsl(217 91% 60%)",
  },
  {
    icon: "✍️",
    role: "Content Writer",
    tagline: "Blogs, social, newsletters in your voice",
    tasks: ["Write SEO-optimized blog posts", "Draft social media content calendars", "Create email newsletters & sequences"],
    integrations: ["Notion", "WordPress", "LinkedIn", "Buffer"],
    color: "hsl(258 90% 66%)",
  },
  {
    icon: "📊",
    role: "Bookkeeper",
    tagline: "Invoices, reconciliation, reports",
    tasks: ["Process & categorize invoices", "Reconcile bank transactions", "Generate monthly financial reports"],
    integrations: ["QuickBooks", "Stripe", "Google Sheets", "Xero"],
    color: "hsl(160 84% 39%)",
  },
  {
    icon: "🔬",
    role: "Data Analyst",
    tagline: "Insights from your data, on demand",
    tasks: ["Build dashboards & performance reports", "Analyze customer behavior patterns", "Monitor KPIs & flag anomalies"],
    integrations: ["Google Analytics", "Mixpanel", "BigQuery", "Sheets"],
    color: "hsl(38 92% 50%)",
  },
  {
    icon: "🤝",
    role: "Recruiter",
    tagline: "Source, screen, schedule — autonomously",
    tasks: ["Source candidates from job boards", "Screen resumes against requirements", "Schedule interviews & send follow-ups"],
    integrations: ["LinkedIn", "Lever", "Gmail", "Google Calendar"],
    color: "hsl(330 81% 60%)",
  },
  {
    icon: "📱",
    role: "Social Media Manager",
    tagline: "Consistent presence across all channels",
    tasks: ["Create & schedule daily posts", "Monitor engagement & reply to comments", "Track competitor social activity"],
    integrations: ["Twitter", "LinkedIn", "Instagram", "Buffer"],
    color: "hsl(190 84% 50%)",
  },
  {
    icon: "💻",
    role: "DevOps Engineer",
    tagline: "Builds, deploys, monitors your stack",
    tasks: ["Review PRs & merge clean code", "Set up CI/CD pipelines", "Monitor uptime & debug incidents"],
    integrations: ["GitHub", "Jira", "Slack", "AWS"],
    color: "hsl(38 92% 50%)",
  },
  {
    icon: "📋",
    role: "Executive Assistant",
    tagline: "Calendar, inbox, reports — handled",
    tasks: ["Manage calendar & schedule meetings", "Draft & triage email responses", "Prepare daily briefings & summaries"],
    integrations: ["Gmail", "Google Calendar", "Slack", "Notion"],
    color: "hsl(217 91% 60%)",
  },
];

/* ─── Cost comparison data ───────────────────────────────────────────────────── */
const COST_COMPARISON = [
  { role: "SDR", human: "$5,500", ai: "$499", savings: "91%" },
  { role: "Content Writer", human: "$4,000", ai: "$499", savings: "88%" },
  { role: "Bookkeeper", human: "$3,000", ai: "$399", savings: "87%" },
  { role: "Data Analyst", human: "$6,000", ai: "$599", savings: "90%" },
];

/* ─── Worker-specific FAQs ───────────────────────────────────────────────────── */
const WORKER_FAQS = [
  { q: "Can I hire just one AI worker?", a: "Yes. Start with a single role — an AI SDR, an AI Content Writer, whatever you need most. Scale up when you see results." },
  { q: "How do AI workers connect to my tools?", a: "Each AI worker plugs into your existing stack via 100+ integrations — HubSpot, Salesforce, Gmail, Slack, Notion, Stripe, and more. OAuth or API key, set up in minutes." },
  { q: "Who reviews the AI worker's output?", a: "Our AI QA system (Sentinel) reviews every deliverable before it reaches you. It catches hallucinations, verifies execution, and flags anything that doesn't meet quality standards." },
  { q: "Can I customize what the AI worker does?", a: "Absolutely. Each worker is custom-trained to your business — your tone, your processes, your tools. We tune them weekly based on results." },
  { q: "What if an AI worker makes a mistake?", a: "You can set approval workflows for high-stakes tasks. All work is logged with full audit trails. Human review is always available." },
  { q: "How fast can I get started?", a: "Your first AI worker is live within 48 hours. No hardware needed for individual workers — they run on managed private infrastructure." },
];

/* ─── Main content ───────────────────────────────────────────────────────────── */
export function AIWorkersContent({ onPilotClick }: { onPilotClick: () => void }) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-[120px] pb-16 px-6">
        {/* Background gradient */}
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, hsl(217 91% 60%) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, hsl(258 90% 66%) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          <Reveal>
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase bg-primary/8 text-primary border border-primary/20 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                AI Workers
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-6xl font-bold leading-[1.1] mb-6"
            >
              Hire an AI <RotatingRole />
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Not a chatbot. A specialist that logs in to your tools, does the
              work autonomously, and delivers results — 24/7, at a fraction of
              the cost.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={onPilotClick}
                className="group px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                Hire Your First AI Worker
                <motion.span
                  className="inline-block ml-1"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  &rarr;
                </motion.span>
              </button>
              <a
                href="#roles"
                className="px-8 py-3.5 rounded-xl border border-border/50 text-foreground font-medium hover:bg-card/50 hover:border-border transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("roles")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                See Available Roles
              </a>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ─── ROLE CATALOG ──────────────────────────────────────────────── */}
      <section
        id="roles"
        className="py-16 px-6 scroll-mt-28"
        style={{ background: "hsl(240 33% 3%)" }}
      >
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <motion.div variants={itemVariants} className="text-center mb-12">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-3 block">
                Role Catalog
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Pick the roles{" "}
                <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  your team needs
                </span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm">
                Each AI worker is a specialist. Hire one, hire five — scale up
                or down anytime.
              </p>
            </motion.div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map((r, i) => (
              <Reveal key={r.role}>
                <motion.div
                  variants={itemVariants}
                  className="rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm p-5 h-full flex flex-col"
                  whileHover={{
                    borderColor: r.color.replace(")", " / 0.4)").replace("hsl(", "hsl("),
                    y: -3,
                    boxShadow: `0 8px 30px ${r.color.replace(")", " / 0.08)").replace("hsl(", "hsl(")}`,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{r.icon}</span>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">
                        AI {r.role}
                      </h3>
                      <p className="text-[11px] text-muted-foreground/60">
                        {r.tagline}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-1.5 mb-4 flex-1">
                    {r.tasks.map((t) => (
                      <li
                        key={t}
                        className="text-xs text-muted-foreground flex gap-2"
                      >
                        <span
                          className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5"
                          style={{ background: r.color }}
                        />
                        {t}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-1 mt-auto">
                    {r.integrations.map((int) => (
                      <span
                        key={int}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded-md"
                        style={{
                          background: "hsl(var(--border) / 0.15)",
                          color: "hsl(var(--muted-foreground) / 0.5)",
                        }}
                      >
                        {int}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <motion.p
              variants={itemVariants}
              className="text-center text-xs text-muted-foreground/40 mt-8"
            >
              + SEO Specialist, Customer Success Manager, PR Coordinator, Legal
              Doc Reviewer & custom roles
            </motion.p>
          </Reveal>
        </div>
      </section>

      {/* ─── HOW A WORKER OPERATES ─────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                How an AI worker{" "}
                <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  operates
                </span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                Give it a task in plain English. It handles the rest.
              </p>
            </motion.div>
          </Reveal>

          <div className="grid md:grid-cols-4 gap-4 relative">
            {/* Connecting line */}
            <div className="absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary/30 via-purple-400/30 to-green-400/30 hidden md:block" />

            {[
              {
                step: "01",
                title: "Assign a Task",
                desc: "Natural language. \"Research 50 B2B SaaS leads in fintech and draft personalized outreach.\"",
                color: "hsl(217 91% 60%)",
                icon: "💬",
              },
              {
                step: "02",
                title: "Worker Executes",
                desc: "Calls real APIs — CRM, email, analytics, dev tools. Not simulated. Real work.",
                color: "hsl(38 92% 50%)",
                icon: "⚡",
              },
              {
                step: "03",
                title: "QA Reviews",
                desc: "Sentinel audits every deliverable. Catches hallucinations, verifies data, flags issues.",
                color: "hsl(330 81% 60%)",
                icon: "🛡️",
              },
              {
                step: "04",
                title: "You Get Results",
                desc: "Deliverable lands in your inbox, Slack, Notion — wherever you want it. Done.",
                color: "hsl(160 84% 39%)",
                icon: "✅",
              },
            ].map((s, i) => (
              <Reveal key={s.step}>
                <motion.div
                  variants={itemVariants}
                  className="text-center relative"
                >
                  <motion.div
                    className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-xl relative z-10"
                    style={{
                      background: s.color.replace(")", " / 0.1)").replace("hsl(", "hsl("),
                      border: `1px solid ${s.color.replace(")", " / 0.25)").replace("hsl(", "hsl(")}`,
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {s.icon}
                  </motion.div>
                  <span
                    className="text-[9px] font-mono uppercase tracking-widest block mb-1"
                    style={{ color: s.color }}
                  >
                    Step {s.step}
                  </span>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    {s.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COST COMPARISON ───────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: "hsl(240 33% 3%)" }}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <motion.div variants={itemVariants} className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Fraction of the{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  cost
                </span>
              </h2>
              <p className="text-muted-foreground text-sm">
                Same output. No benefits, no ramp time, no sick days.
              </p>
            </motion.div>
          </Reveal>

          <Reveal>
            <motion.div
              variants={itemVariants}
              className="rounded-xl border border-border/30 bg-card/30 overflow-hidden"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left p-4 text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-center p-4 text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
                      Human Hire
                    </th>
                    <th className="text-center p-4 font-mono text-[10px] uppercase tracking-wider bg-primary/5 text-primary">
                      AI Worker
                    </th>
                    <th className="text-center p-4 text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
                      You Save
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COST_COMPARISON.map((c) => (
                    <tr key={c.role} className="border-b border-border/15">
                      <td className="p-4 font-medium text-foreground text-sm">
                        AI {c.role}
                      </td>
                      <td className="p-4 text-center text-muted-foreground/50 line-through">
                        {c.human}/mo
                      </td>
                      <td className="p-4 text-center bg-primary/5 font-semibold text-foreground">
                        {c.ai}/mo
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                          {c.savings}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </Reveal>

          <Reveal>
            <motion.p
              variants={itemVariants}
              className="text-center text-xs text-muted-foreground/40 mt-4"
            >
              Pricing for illustration. Actual pricing depends on role
              complexity and workload.
            </motion.p>
          </Reveal>
        </div>
      </section>

      {/* ─── INTEGRATIONS ──────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <motion.div variants={itemVariants} className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Your AI workers use{" "}
                <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  your tools
                </span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                100+ integrations — CRM, email, dev tools, analytics,
                accounting. Plug in via OAuth or API key.
              </p>
            </motion.div>
          </Reveal>
          <Reveal>
            <motion.div variants={itemVariants}>
              <IntegrationGrid />
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: "hsl(240 33% 3%)" }}>
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Questions</h2>
            </motion.div>
          </Reveal>

          <div className="space-y-2">
            {WORKER_FAQS.map((item, i) => (
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
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to hire your first{" "}
                <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  AI worker
                </span>
                ?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-sm">
                Free 2-week pilot. Pick a role, see results in 48 hours. No
                commitment.
              </p>
              <motion.button
                onClick={onPilotClick}
                className="px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/20"
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 40px hsl(217 91% 60% / 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Hire Your First AI Worker
              </motion.button>
            </motion.div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
