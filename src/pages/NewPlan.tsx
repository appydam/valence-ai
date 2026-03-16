import { useState } from "react";
import { motion } from "framer-motion";

/* ─── Password gate ──────────────────────────────────────────────────────────── */
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === "arpit.737") {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl">
            🔒
          </div>
          <h1 className="text-xl font-semibold text-foreground">Private Playbook</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter password to access</p>
        </div>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          className={`w-full px-4 py-3 rounded-xl bg-card border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition ${
            error ? "border-red-500 shake" : "border-border/50"
          }`}
          autoFocus
        />
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
        >
          Access Playbook
        </button>
        {error && (
          <p className="text-center text-sm text-red-400">Wrong password</p>
        )}
      </form>
    </div>
  );
}

/* ─── Section wrapper ────────────────────────────────────────────────────────── */
function Section({
  id,
  title,
  badge,
  children,
}: {
  id: string;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="scroll-mt-24"
    >
      <div className="flex items-center gap-3 mb-6">
        {badge && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
            {badge}
          </span>
        )}
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

/* ─── Card ───────────────────────────────────────────────────────────────────── */
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm p-6 ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Step card ──────────────────────────────────────────────────────────────── */
function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground mb-2">{title}</h4>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Table of contents ──────────────────────────────────────────────────────── */
const TOC_ITEMS = [
  { id: "vision", label: "The Vision" },
  { id: "what-we-offer", label: "What We Offer Clients" },
  { id: "demo-mission", label: "Demo Mission to Build" },
  { id: "who-to-reach", label: "Who to Reach" },
  { id: "how-to-pitch", label: "How to Pitch" },
  { id: "investor-pitch", label: "Investor Pitch" },
  { id: "pricing", label: "Pricing Strategy" },
  { id: "tech-changes", label: "Tech Changes Needed" },
  { id: "deployment", label: "Agent Deployment" },
  { id: "hardware", label: "Hardware & Nodes" },
  { id: "moats", label: "Moat Stack" },
  { id: "weekly-plan", label: "Week-by-Week Plan" },
  { id: "dont-do", label: "What NOT to Do" },
];

/* ─── Main playbook ──────────────────────────────────────────────────────────── */
function Playbook() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div
        className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-xl"
        style={{ background: "hsla(240, 33%, 4%, 0.85)" }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Valence AI
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              / Private Playbook
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">
            For Arpit Only
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-10 pb-32">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Valence AI
            </span>{" "}
            — The Playbook
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            The Infrastructure for the AI Labor Economy. Everything you need to
            know — what to build, who to sell to, how to pitch, what tech to
            change, and what to do this week.
          </p>
        </div>

        {/* TOC */}
        <Card className="mb-16">
          <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground/60 mb-4">
            Table of Contents
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {TOC_ITEMS.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition group"
              >
                <span className="text-[10px] font-mono text-primary/50 group-hover:text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.label}
              </a>
            ))}
          </div>
        </Card>

        <div className="space-y-20">
          {/* ─── 1. THE VISION ────────────────────────────────────────────── */}
          <Section id="vision" badge="01" title="The Vision">
            <Card>
              <p className="text-lg text-foreground font-medium mb-4">
                Valence AI is an <strong>AI staffing company</strong> — not a
                SaaS tool. We deploy AI employees on private physical
                infrastructure inside companies. We sell the work, not the tool.
              </p>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Sequoia's thesis:</strong>{" "}
                  "For every $1 spent on software, $6 are spent on services. If
                  you sell the tool, you're in a race against the model. If you
                  sell the work, every improvement makes you better."
                </p>
                <p>
                  <strong className="text-foreground">The four layers:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 pl-2">
                  <li>
                    <strong>Physical Nodes</strong> — Hardware in every client's
                    office running their AI workforce privately
                  </li>
                  <li>
                    <strong>AI Workforce Catalog</strong> — Hire AI employees
                    (SDR, Content Writer, Bookkeeper, etc.) not software
                  </li>
                  <li>
                    <strong>Agent-to-Agent Economy</strong> — AI workers transact
                    across companies. We take 2-5%. The Visa of AI labor.
                  </li>
                  <li>
                    <strong>Data &amp; Intelligence Layer</strong> — World's
                    largest dataset on AI worker performance. Federated learning
                    across the mesh.
                  </li>
                </ol>
                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-primary font-medium text-sm">
                    Core positioning: "I make your company AI-enabled with fully
                    private infrastructure. AI employees that run inside your own
                    systems. Your data never leaves. I set it up, I manage it,
                    you see the results."
                  </p>
                </div>
              </div>
            </Card>
          </Section>

          {/* ─── 2. WHAT WE OFFER ────────────────────────────────────────── */}
          <Section id="what-we-offer" badge="02" title="What We Offer Clients">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-500/15 text-blue-400 flex items-center justify-center text-xs">
                    1
                  </span>
                  Private AI Infrastructure Setup
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    • Physical Node (NVIDIA Jetson $249 / Mac Mini $599 / GPU
                    server $2-5K)
                  </li>
                  <li>
                    • Custom-branded enclosure with status display &amp; LEDs
                  </li>
                  <li>• Client's data never leaves their premises</li>
                  <li>• All integrations pre-wired (Slack, CRM, email, etc.)</li>
                  <li>• Deployed &amp; configured remotely within 48 hours</li>
                </ul>
              </Card>
              <Card>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-green-500/15 text-green-400 flex items-center justify-center text-xs">
                    2
                  </span>
                  AI Employees (Not Chatbots)
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    • AI SDR — researches leads, writes personalized outreach
                  </li>
                  <li>
                    • AI Content Writer — blogs, social posts, newsletters
                  </li>
                  <li>• AI Bookkeeper — invoices, reports, reconciliation</li>
                  <li>
                    • AI QA Reviewer — audits all work before delivery
                  </li>
                  <li>
                    • AI Chief of Staff — coordinates everything autonomously
                  </li>
                  <li>
                    • Custom roles built to client's exact needs
                  </li>
                </ul>
              </Card>
              <Card>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-purple-500/15 text-purple-400 flex items-center justify-center text-xs">
                    3
                  </span>
                  Ongoing Managed Service
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Weekly AI worker performance tuning</li>
                  <li>
                    • SOULs self-improve via memory distillation (you review &amp;
                    approve)
                  </li>
                  <li>
                    • Weekly performance report: tasks completed, reply rates,
                    content published
                  </li>
                  <li>
                    • Monthly strategy call with client
                  </li>
                  <li>
                    • Integration maintenance, API updates, model upgrades
                  </li>
                </ul>
              </Card>
              <Card>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs">
                    4
                  </span>
                  What Makes Us Different
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    • <strong className="text-foreground">Private</strong> —
                    Data never leaves client's building. Not even to us.
                  </li>
                  <li>
                    • <strong className="text-foreground">Physical</strong> —
                    Real hardware, not a SaaS login. Tangible AI workforce.
                  </li>
                  <li>
                    • <strong className="text-foreground">Self-improving</strong>{" "}
                    — AI workers get smarter every week via SOUL evolution.
                  </li>
                  <li>
                    • <strong className="text-foreground">Custom</strong> — Every
                    SOUL is tuned to the client's business, tone, processes.
                  </li>
                  <li>
                    • <strong className="text-foreground">Audited</strong> —
                    Sentinel QA reviews all work. No hallucinated deliverables.
                  </li>
                </ul>
              </Card>
            </div>
          </Section>

          {/* ─── 3. DEMO MISSION ─────────────────────────────────────────── */}
          <Section id="demo-mission" badge="03" title="Demo Mission to Build">
            <Card>
              <p className="text-sm text-muted-foreground mb-6">
                This is the ONE demo you need to record this week. It shows the
                full AI workforce in action on a real business workflow.
              </p>
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <h4 className="font-semibold text-foreground mb-2">
                    Mission: "Launch a New Product Feature for a SaaS Startup"
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Goal: Show a founder that 3 days of work gets done in 15
                    minutes by 5 AI employees.
                  </p>
                </div>

                <div className="space-y-5">
                  <Step number={1} title="Kaze receives the mission & decomposes it">
                    <p>
                      You type a natural-language goal into Autopilot: "We're
                      launching a new analytics dashboard feature. Research
                      competitors, write announcement content, create a landing
                      page, and set up tracking."
                    </p>
                    <p>
                      Kaze breaks it into 5-6 tasks with dependencies and assigns
                      to agents.
                    </p>
                  </Step>

                  <Step number={2} title="Scout researches the market">
                    <p>
                      Scout researches 5 competitor analytics dashboards, pulls
                      pricing, features, positioning. Delivers a structured
                      research doc to Notion + Google Sheets.
                    </p>
                  </Step>

                  <Step number={3} title="Ghost writes all the content">
                    <p>
                      Ghost receives Scout's research (auto-injected via
                      dependency DAG). Writes: a product announcement blog post,
                      3 social media posts (Twitter, LinkedIn, Product Hunt), and
                      an email newsletter draft. Posts to Notion.
                    </p>
                  </Step>

                  <Step number={4} title="Forge builds the landing page">
                    <p>
                      Forge creates a simple landing page or updates the existing
                      site with the new feature section. Pushes to GitHub. Deploys
                      via Vercel.
                    </p>
                  </Step>

                  <Step number={5} title="Sentinel QA reviews everything">
                    <p>
                      Sentinel checks Scout's research for accuracy, Ghost's
                      content for brand guidelines, Forge's code for bugs.
                      Approves or rejects with specific feedback. Agents fix and
                      resubmit.
                    </p>
                  </Step>

                  <Step number={6} title="You show the War Room">
                    <p>
                      Open the War Room view — show all 5 agents coordinating in
                      real-time, reasoning streams visible, handoffs happening
                      automatically. This is the "wow" moment.
                    </p>
                  </Step>
                </div>

                <div className="mt-6 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
                  <h4 className="font-semibold text-amber-400 mb-2">
                    Recording Tips
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use Loom. Keep it under 12 minutes.</li>
                    <li>• Start with "What would this take manually? 2-3 days."</li>
                    <li>
                      • Show the clock. "It's 10:00 AM. Let's see where we are at
                      10:15."
                    </li>
                    <li>
                      • Show the actual outputs — the Notion doc, the GitHub
                      commit, the email draft.
                    </li>
                    <li>
                      • End with: "5 AI employees. 15 minutes. Zero cloud
                      dependency. All running on private hardware."
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </Section>

          {/* ─── 4. WHO TO REACH ─────────────────────────────────────────── */}
          <Section id="who-to-reach" badge="04" title="Who to Reach">
            <div className="space-y-4">
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
                    Tier A — Close This Week
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      1. Funded Startups (Series A-C)
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Have budget ($5-20K/month discretionary). Founder makes the
                      call on a 30-min meeting. No procurement. Already believe
                      AI can work. India or global.
                    </p>
                    <p className="text-sm text-primary/80 mt-1">
                      Where to find: Twitter (follow VCs, see who they fund),
                      LinkedIn (filter by "Series A" + industry), YC directory,
                      AngelList.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      2. Digital Agencies (Marketing / Content / Dev)
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      They can white-label your AI workers to THEIR clients. One
                      agency deal = 5-20 AI workers deployed. They already sell
                      services — they instantly understand "I'll be your AI
                      backend."
                    </p>
                    <p className="text-sm text-primary/80 mt-1">
                      Where to find: Clutch.co, agency directories, LinkedIn
                      search "marketing agency founder", Twitter DMs to agency
                      owners posting about AI.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      3. Indian Tech Companies Going Global
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Need content, SDR, and market research for US/EU markets.
                      Data sovereignty matters. Same timezone. Short decision
                      cycles. You can deploy the Node in-person.
                    </p>
                    <p className="text-sm text-primary/80 mt-1">
                      Where to find: Indian startup WhatsApp groups, YourStory,
                      Inc42 newsletter companies, your personal network.
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Tier B — Close in 2-4 Weeks
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      4. SMBs in Regulated Industries (Fintech, Healthtech,
                      Legaltech)
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      NEED private infrastructure — can't use ChatGPT/Perplexity
                      because data can't leave their building. Compliance is your
                      killer selling point. $5-10K/month contracts.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      5. E-commerce / D2C Brands
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Need content, customer research, social media, analytics.
                      Already outsource heavily to agencies. You replace the
                      agency at half the cost.
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Tier C — Month 6+
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    6. Mid-Market Enterprises (50-500 employees)
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Replace entire BPO contracts. $10-50K/month. Need case
                    studies and social proof first — that's why Tier A and B come
                    first.
                  </p>
                </div>
              </Card>
            </div>
          </Section>

          {/* ─── 5. HOW TO PITCH ─────────────────────────────────────────── */}
          <Section id="how-to-pitch" badge="05" title="How to Pitch">
            <div className="space-y-4">
              <Card>
                <h3 className="font-semibold text-foreground mb-3">
                  Cold Outreach Message (LinkedIn / Email)
                </h3>
                <div className="p-4 rounded-lg bg-card border border-border/50 text-sm text-foreground leading-relaxed font-mono">
                  <p>Hey [Name],</p>
                  <br />
                  <p>
                    I help companies set up private AI infrastructure — AI
                    employees that run inside your own systems, your data never
                    leaves.
                  </p>
                  <br />
                  <p>
                    No ChatGPT, no Perplexity, no cloud dependency. I set up the
                    hardware, deploy custom-trained AI workers tuned to your
                    business, wire them into your existing tools (Slack, CRM,
                    email, etc.), and manage everything for you.
                  </p>
                  <br />
                  <p>
                    Your company becomes AI-enabled in 48 hours.
                  </p>
                  <br />
                  <p>Want me to show you a 10-min demo?</p>
                  <br />
                  <p>— Arpit Dhamija</p>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-foreground mb-3">
                  On a Discovery Call (What to Say)
                </h3>
                <div className="p-4 rounded-lg bg-card border border-border/50 text-sm text-foreground leading-relaxed">
                  <p className="italic text-muted-foreground mb-3">
                    After you've listened to their pain points:
                  </p>
                  <p>
                    "Here's what I do: I make your company AI-enabled with fully
                    private infrastructure. I deploy AI employees — not chatbots
                    — that actually do work.
                  </p>
                  <br />
                  <p>
                    An AI SDR that researches leads and writes personalized
                    outreach. An AI content writer that publishes 3x per week. An
                    AI bookkeeper that processes your invoices.
                  </p>
                  <br />
                  <p>
                    They run on hardware inside your office — or a dedicated
                    cloud instance — so your data never touches anyone else's
                    servers. I custom-train each AI worker to your business — your
                    tone, your processes, your tools. And they get smarter every
                    week because they learn from their own experience.
                  </p>
                  <br />
                  <p>
                    I set it all up, I manage it, and you just see the results.
                  </p>
                  <br />
                  <p>
                    Let me show you what this looks like in action."
                  </p>
                  <p className="italic text-muted-foreground mt-3">
                    → Then play the demo video.
                  </p>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-foreground mb-3">
                  Agency Partnership Pitch
                </h3>
                <div className="p-4 rounded-lg bg-card border border-border/50 text-sm text-foreground leading-relaxed">
                  <p>
                    "I can be your AI backend. You keep selling services to your
                    clients — I run the AI infrastructure behind the scenes. You
                    white-label my AI workers under your brand. You keep 30%
                    margin on every deployment. One partnership = 5-20 AI
                    workers deployed across your clients."
                  </p>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-foreground mb-3">
                  How to Find Clients (Not Random Cold DMs)
                </h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li>
                    <strong className="text-foreground">1. Post the demo video publicly</strong>{" "}
                    on Twitter &amp; LinkedIn with a thread explaining what
                    happened. Attract inbound.
                  </li>
                  <li>
                    <strong className="text-foreground">2. Warm intros from your network</strong>{" "}
                    — Ask friends, ex-colleagues, mentors: "Do you know a
                    startup founder drowning in operational work?"
                  </li>
                  <li>
                    <strong className="text-foreground">3. Founder communities</strong> —
                    IndieHackers, YC alumni Slack, Indian startup WhatsApp
                    groups, Twitter Spaces about AI. Participate, add value,
                    then mention what you built.
                  </li>
                  <li>
                    <strong className="text-foreground">4. Agency partnerships</strong> — Reach
                    out to 5-10 digital agencies with the pitch above.
                  </li>
                  <li>
                    <strong className="text-foreground">5. Case study snowball</strong> — Every
                    pilot client becomes a case study. "We deployed AI workers
                    for [Client X] and they saved $4K/month." Post it. Repeat.
                  </li>
                </ol>
              </Card>
            </div>
          </Section>

          {/* ─── 6. INVESTOR PITCH ───────────────────────────────────────── */}
          <Section id="investor-pitch" badge="06" title="Investor Pitch">
            <Card>
              <h3 className="font-semibold text-foreground mb-4">
                The One-Paragraph Pitch
              </h3>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-sm text-foreground leading-relaxed">
                <p>
                  "For every $1 spent on software, $6 are spent on services. The
                  global staffing and BPO industries represent nearly $1
                  trillion. Valence AI deploys AI workers — not chatbots, not
                  tools — autonomous AI employees running on physical Nodes
                  inside companies. Each Node is part of a mesh network where AI
                  workers improve through federated learning. Our 500th client's
                  AI bookkeeper is dramatically better than our first, because it
                  learned from 499 others. Today we're an AI staffing company
                  with 70-80% margins. Tomorrow we're the protocol layer for the
                  agent-to-agent economy — the Visa of AI labor."
                </p>
              </div>

              <h3 className="font-semibold text-foreground mt-8 mb-4">
                Key Talking Points
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  {
                    label: "Market",
                    value:
                      "Staffing: $500B. BPO: $400B. AI consulting: $11B → $91B by 2035 (26% CAGR).",
                  },
                  {
                    label: "Unit Economics",
                    value:
                      "Cost per AI worker: $100-300/mo. Revenue: $500-1,500/mo. Margin: 60-80%.",
                  },
                  {
                    label: "Moats",
                    value:
                      "Physical Nodes, SOUL evolution (compounding intelligence), federated mesh, integration depth.",
                  },
                  {
                    label: "Scale Path",
                    value:
                      "50 clients × 3 workers × $800 = $120K/mo. 1,000 clients = $4M/mo ARR.",
                  },
                  {
                    label: "Why Now",
                    value:
                      'Models are good enough for autonomous work. Sequoia: "2026 is the year copilots become autopilots."',
                  },
                  {
                    label: "Why Us",
                    value:
                      "Production-grade system: 43 DB tables, 50+ endpoints, 5 autonomous agents, 50+ integrations. Already built.",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-lg bg-card border border-border/30"
                  >
                    <p className="text-[10px] font-mono uppercase tracking-widest text-primary/60 mb-1">
                      {item.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-foreground mt-8 mb-4">
                Why Perplexity Can't Compete
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  • No physical infrastructure → no mesh → no federated learning
                  → no network effects
                </li>
                <li>
                  • $200/mo generic SaaS → can't customize per client → no SOUL
                  evolution moat
                </li>
                <li>
                  • Cloud-only → can't serve regulated industries that need
                  on-prem
                </li>
                <li>
                  • Selling a tool (the $1) → We're selling the work (the $6)
                </li>
              </ul>
            </Card>
          </Section>

          {/* ─── 7. PRICING ──────────────────────────────────────────────── */}
          <Section id="pricing" badge="07" title="Pricing Strategy">
            <Card>
              <h3 className="font-semibold text-foreground mb-4">
                Service Tiers
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-3 text-muted-foreground font-mono text-xs uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="text-left py-3 text-muted-foreground font-mono text-xs uppercase tracking-wider">
                        Price
                      </th>
                      <th className="text-left py-3 text-muted-foreground font-mono text-xs uppercase tracking-wider">
                        What They Get
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/20">
                      <td className="py-3 font-medium text-foreground">
                        Individual AI Workers
                      </td>
                      <td className="py-3">$500-1,500/mo each</td>
                      <td className="py-3">
                        Pick roles from catalog. Node included or client buys.
                        Remote config + management.
                      </td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-3 font-medium text-foreground">
                        AI Department
                      </td>
                      <td className="py-3">$3,000-10,000/mo</td>
                      <td className="py-3">
                        Replace an entire function (marketing, sales,
                        back-office). 3-8 AI workers + dedicated Node. Custom
                        SOULs. Weekly reports.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-foreground">
                        AI Division
                      </td>
                      <td className="py-3">$10,000-50,000/mo</td>
                      <td className="py-3">
                        Mid-market. Replace BPO contracts. Multiple Nodes. Full
                        custom deployment. On-site setup.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="font-semibold text-foreground mt-8 mb-4">
                Position Against Their Current Spend
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-3 text-muted-foreground font-mono text-xs uppercase tracking-wider">
                        What They Replace
                      </th>
                      <th className="text-left py-3 text-muted-foreground font-mono text-xs uppercase tracking-wider">
                        Their Cost
                      </th>
                      <th className="text-left py-3 text-muted-foreground font-mono text-xs uppercase tracking-wider">
                        Your Price
                      </th>
                      <th className="text-left py-3 text-muted-foreground font-mono text-xs uppercase tracking-wider">
                        Savings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    {[
                      ["1 SDR agency rep", "$3-8K/mo", "$1,500/mo", "50-80%"],
                      ["Content contractor", "$2-5K/mo", "$1,000/mo", "50-80%"],
                      ["VA team", "$2-4K/mo", "$1,500/mo", "40-60%"],
                      ["Bookkeeper", "$1-3K/mo", "$800/mo", "30-70%"],
                      [
                        "Full marketing dept",
                        "$10-20K/mo",
                        "$5-8K/mo",
                        "50-60%",
                      ],
                    ].map(([what, their, your, savings], i) => (
                      <tr key={i} className="border-b border-border/20">
                        <td className="py-2.5">{what}</td>
                        <td className="py-2.5">{their}</td>
                        <td className="py-2.5 text-primary font-medium">
                          {your}
                        </td>
                        <td className="py-2.5 text-green-400">{savings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-muted-foreground/60 italic">
                Always position against what they CURRENTLY SPEND on human labor,
                not against other AI tools.
              </p>
            </Card>
          </Section>

          {/* ─── 8. TECH CHANGES ─────────────────────────────────────────── */}
          <Section id="tech-changes" badge="08" title="Tech Changes Needed">
            <div className="space-y-4">
              <Card>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20">
                    Critical
                  </span>
                  Before First Client
                </h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div>
                    <h4 className="font-medium text-foreground">
                      1. Multi-Tenant Node Support
                    </h4>
                    <p>
                      Currently everything runs on one Lightsail server. Need to
                      support deploying to multiple servers/devices. Each client
                      gets their own OpenClaw instance.
                    </p>
                    <ul className="mt-2 space-y-1 pl-4">
                      <li>
                        • Update <code className="text-xs bg-card px-1.5 py-0.5 rounded border border-border/30">ssh-proxy</code> endpoints to accept a <code className="text-xs bg-card px-1.5 py-0.5 rounded border border-border/30">nodeId</code> / <code className="text-xs bg-card px-1.5 py-0.5 rounded border border-border/30">clientId</code> param
                      </li>
                      <li>
                        • Store per-client SSH credentials in <code className="text-xs bg-card px-1.5 py-0.5 rounded border border-border/30">sshConfig</code> table (already encrypted with AES-256-GCM)
                      </li>
                      <li>
                        • Add a <code className="text-xs bg-card px-1.5 py-0.5 rounded border border-border/30">nodes</code> table: nodeId, clientId, hostname, port, status, lastHealthCheck
                      </li>
                      <li>
                        • Fleet dashboard page to monitor all Nodes
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground">
                      2. Client Isolation
                    </h4>
                    <p>
                      Each client's agents, tasks, missions, memories must be
                      scoped to their tenant. Currently single-tenant.
                    </p>
                    <ul className="mt-2 space-y-1 pl-4">
                      <li>
                        • Add <code className="text-xs bg-card px-1.5 py-0.5 rounded border border-border/30">tenantId</code> to all major tables (agents, tasks, missions, activity, etc.)
                      </li>
                      <li>
                        • Filter all queries by <code className="text-xs bg-card px-1.5 py-0.5 rounded border border-border/30">tenantId</code> from authenticated user
                      </li>
                      <li>
                        • The <code className="text-xs bg-card px-1.5 py-0.5 rounded border border-border/30">customerProvisionings</code> table already exists — extend it
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground">
                      3. Wakeup Server Per Node
                    </h4>
                    <p>
                      Each Node needs its own wakeup server instance, or the
                      central wakeup server needs to route to the correct Node.
                    </p>
                    <ul className="mt-2 space-y-1 pl-4">
                      <li>
                        • Option A: Bundle wakeup server into the Node image
                        (runs locally on each device)
                      </li>
                      <li>
                        • Option B: Central wakeup server with routing table
                        (nodeId → SSH endpoint)
                      </li>
                      <li>
                        • Option A is better for privacy (no central server
                        needed)
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Important
                  </span>
                  Before Scaling to 10+ Clients
                </h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div>
                    <h4 className="font-medium text-foreground">
                      4. Node Auto-Provisioning Script
                    </h4>
                    <p>
                      A single script that SSHes into a fresh device and
                      installs everything: OpenClaw, Mission Control agent
                      runtime, SOUL files, integration configs, wakeup server,
                      monitoring agent.
                    </p>
                    <ul className="mt-2 space-y-1 pl-4">
                      <li>• Bash/Ansible script that takes client config as input</li>
                      <li>• Should work on: Ubuntu (Lightsail), Jetson (Jetpack OS), Mac (macOS)</li>
                      <li>• Idempotent — can re-run safely for updates</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground">
                      5. Node Health Monitoring
                    </h4>
                    <p>
                      Each Node reports health back to your central dashboard.
                    </p>
                    <ul className="mt-2 space-y-1 pl-4">
                      <li>
                        • Lightweight agent on each Node that POSTs to your
                        Convex endpoint every 5 min
                      </li>
                      <li>• Reports: CPU, memory, disk, agent process status, last task completed</li>
                      <li>
                        • The <code className="text-xs bg-card px-1.5 py-0.5 rounded border border-border/30">server-health-check</code> cron already exists — extend to multi-node
                      </li>
                      <li>• Alert you (Slack/email) if a Node goes offline</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground">
                      6. SOUL Template Library
                    </h4>
                    <p>
                      Pre-built SOUL templates for each AI worker role. When a
                      client hires an "AI SDR", you apply the SDR SOUL template
                      and customize it with their company details.
                    </p>
                    <ul className="mt-2 space-y-1 pl-4">
                      <li>• Store templates in Convex with versioning</li>
                      <li>
                        • Template variables: {"{{company_name}}"}, {"{{brand_voice}}"}, {"{{target_market}}"}, etc.
                      </li>
                      <li>• One-click deploy from the dashboard</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Future
                  </span>
                  Month 6+
                </h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div>
                    <h4 className="font-medium text-foreground">
                      7. Federated Learning Pipeline
                    </h4>
                    <p>
                      Anonymized performance patterns shared across Nodes.
                      Requires: differential privacy layer, pattern extraction
                      cron, mesh sync protocol.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      8. Local Inference on Jetson
                    </h4>
                    <p>
                      Run small models (Llama 3.1 8B, Qwen 2.5) locally on
                      Jetson Orin Nano for routine tasks. Cloud inference for
                      complex reasoning. Cuts API costs 60-80%.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      9. Agent-to-Agent Protocol
                    </h4>
                    <p>
                      Cross-company AI worker transactions. Requires: service
                      discovery protocol, payment rails, trust/reputation system.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </Section>

          {/* ─── 9. AGENT DEPLOYMENT ─────────────────────────────────────── */}
          <Section id="deployment" badge="09" title="Agent Deployment Process">
            <Card>
              <h3 className="font-semibold text-foreground mb-4">
                How Agents Get Deployed to a Client Node
              </h3>
              <div className="space-y-5">
                <Step number={1} title="Client purchases hardware">
                  <p>
                    Client buys an NVIDIA Jetson Orin Nano ($249) or Mac Mini
                    ($599) from Amazon. For cloud option: you spin up a dedicated
                    AWS Lightsail instance ($20-40/mo).
                  </p>
                </Step>
                <Step number={2} title="Client connects the device">
                  <p>
                    Plugs it into power &amp; network. Gives you SSH access (IP
                    + credentials or you set up a reverse tunnel).
                  </p>
                </Step>
                <Step number={3} title="You run the provisioning script">
                  <p>
                    Your auto-provisioning script installs: OpenClaw runtime,
                    Node.js, Python, agent session manager, wakeup server, health
                    monitoring agent. Takes ~15 minutes.
                  </p>
                </Step>
                <Step number={4} title="Configure SOUL files">
                  <p>
                    Apply SOUL templates for the roles they hired (e.g., SDR +
                    Content Writer + QA). Customize with their company name,
                    brand voice, target market, product details, processes.
                  </p>
                </Step>
                <Step number={5} title="Wire integrations">
                  <p>
                    Connect their Slack, CRM (HubSpot/Salesforce), email
                    (Gmail), Notion, Google Sheets, etc. via the Integration Hub.
                    OAuth flows handle auth. Credentials encrypted on the Node.
                  </p>
                </Step>
                <Step number={6} title="Set up Convex tenant">
                  <p>
                    Create their tenant in Convex. Point the Node's heartbeat
                    endpoint to their tenant URL. All their data is isolated.
                  </p>
                </Step>
                <Step number={7} title="Run test mission">
                  <p>
                    Run a small mission end-to-end while the client watches.
                    Verify all agents work, all integrations fire, Sentinel QA
                    passes. Fix any issues.
                  </p>
                </Step>
                <Step number={8} title="Go live">
                  <p>
                    Hand over dashboard access. Set up their first real mission.
                    Schedule the weekly check-in. The AI workforce starts working.
                  </p>
                </Step>
              </div>
            </Card>
          </Section>

          {/* ─── 10. HARDWARE ────────────────────────────────────────────── */}
          <Section id="hardware" badge="10" title="Hardware & Nodes">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-3 text-muted-foreground font-mono text-xs uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="text-left py-3 text-muted-foreground font-mono text-xs uppercase tracking-wider">
                        Device
                      </th>
                      <th className="text-left py-3 text-muted-foreground font-mono text-xs uppercase tracking-wider">
                        Cost
                      </th>
                      <th className="text-left py-3 text-muted-foreground font-mono text-xs uppercase tracking-wider">
                        Capability
                      </th>
                      <th className="text-left py-3 text-muted-foreground font-mono text-xs uppercase tracking-wider">
                        Best For
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/20">
                      <td className="py-3 font-medium text-foreground">
                        Cloud
                      </td>
                      <td className="py-3">AWS Lightsail</td>
                      <td className="py-3">$20-40/mo</td>
                      <td className="py-3">Agent orchestration + cloud inference</td>
                      <td className="py-3">
                        Pilots, non-privacy-sensitive clients
                      </td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-3 font-medium text-foreground">
                        Starter
                      </td>
                      <td className="py-3">NVIDIA Jetson Orin Nano</td>
                      <td className="py-3">$249</td>
                      <td className="py-3">
                        67 TOPS AI chip, orchestration + local small model
                      </td>
                      <td className="py-3">
                        Most clients — the "AI appliance"
                      </td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-3 font-medium text-foreground">Pro</td>
                      <td className="py-3">Mac Mini M4</td>
                      <td className="py-3">$599</td>
                      <td className="py-3">
                        Local inference up to 13B models + cloud for complex
                      </td>
                      <td className="py-3">
                        Clients who want max local processing
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-foreground">
                        Enterprise
                      </td>
                      <td className="py-3">GPU server</td>
                      <td className="py-3">$2-5K</td>
                      <td className="py-3">
                        Full local inference, air-gapped possible
                      </td>
                      <td className="py-3">
                        Regulated industries (finance, healthcare, legal)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <h4 className="font-medium text-foreground mb-2">
                  Physical Node Extras (The "Wow" Factor)
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • Custom-branded enclosure with your/client's logo (3D
                    printed, $30-80)
                  </li>
                  <li>
                    • Small OLED/e-ink display: active workers, tasks completed
                    today, status
                  </li>
                  <li>
                    • LED strip: green (working), amber (needs approval), red
                    (blocked)
                  </li>
                  <li>
                    • "What's that on your desk?" "That's our AI team." →
                    Conversation starter, referral driver
                  </li>
                </ul>
              </div>

              <div className="mt-6 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <h4 className="font-medium text-amber-400 mb-2">
                  Logistics (India → Global)
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • <strong>India clients:</strong> Buy device on Amazon.in,
                    you can hand-deliver or ship domestically
                  </li>
                  <li>
                    • <strong>US/global clients:</strong> Client buys on
                    Amazon.com themselves. You SSH in remotely and configure.
                    Zero international shipping.
                  </li>
                  <li>
                    • <strong>Alternative:</strong> Start all pilots on cloud
                    (Lightsail). Offer physical Node as an "upgrade" once
                    relationship proven.
                  </li>
                </ul>
              </div>
            </Card>
          </Section>

          {/* ─── 11. MOATS ───────────────────────────────────────────────── */}
          <Section id="moats" badge="11" title="The Moat Stack">
            <Card>
              <div className="space-y-4">
                {[
                  {
                    n: 1,
                    title: "Physical Network",
                    desc: "Hardware in every client's office. Years and millions to replicate. To switch, they physically unplug.",
                    color: "blue",
                  },
                  {
                    n: 2,
                    title: "SOUL Evolution (THE KILLER)",
                    desc: "After 3 months, agents have hundreds of memories specific to that business. Switching = losing all institutional knowledge. Like firing an employee.",
                    color: "purple",
                  },
                  {
                    n: 3,
                    title: "Federated Mesh Network Effect",
                    desc: "Each new client improves ALL AI workers across the network via federated learning. 500th client's SDR is 10x better than the 1st.",
                    color: "green",
                  },
                  {
                    n: 4,
                    title: "Integration Depth",
                    desc: "Deeply wired into their Slack, CRM, email, analytics, project management. Ripping you out means rewiring everything.",
                    color: "amber",
                  },
                  {
                    n: 5,
                    title: "Operational Data Moat",
                    desc: "Largest dataset on AI worker performance across industries. Publish benchmarks, license SOUL templates, train specialized models.",
                    color: "pink",
                  },
                  {
                    n: 6,
                    title: "Agent-to-Agent Protocol",
                    desc: "Own the rails for inter-company AI transactions. The Visa of AI labor. 2-5% take rate on every transaction.",
                    color: "cyan",
                  },
                  {
                    n: 7,
                    title: "Staffing Metaphor",
                    desc: 'Psychological switching cost. You don\'t "cancel software" — you "fire your AI team." Very different emotional weight.',
                    color: "rose",
                  },
                ].map((moat) => (
                  <div
                    key={moat.n}
                    className="flex gap-4 p-4 rounded-lg bg-card border border-border/30"
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-${moat.color}-500/15 text-${moat.color}-400 border border-${moat.color}-500/20`}
                    >
                      {moat.n}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {moat.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {moat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Section>

          {/* ─── 12. WEEKLY PLAN ─────────────────────────────────────────── */}
          <Section id="weekly-plan" badge="12" title="Week-by-Week Execution Plan">
            <div className="space-y-4">
              {[
                {
                  period: "This Week (Days 1-7)",
                  color: "green",
                  items: [
                    "Run ONE killer demo mission end-to-end (product launch scenario)",
                    "Record a clean 10-12 min demo video with Loom",
                    "Frame everything as \"hiring an AI team\" — not \"using software\"",
                    "Write Twitter/LinkedIn thread: \"I left my job to build an AI staffing company. 5 AI workers doing 3 days of work in 15 minutes.\"",
                    "Post the demo video publicly",
                  ],
                },
                {
                  period: "Week 2-4: First Revenue",
                  color: "blue",
                  items: [
                    "Find 3-5 pilot clients from network/targeted outreach",
                    "Offer: \"Hire 2 AI workers free for 2 weeks. If they deliver, we talk pricing.\"",
                    "Start at $1-3K/month per client",
                    "Use cloud Nodes (Lightsail) for pilots — physical hardware in Phase 2",
                    "Build case studies from pilot results",
                  ],
                },
                {
                  period: "Month 2-3: First Physical Nodes",
                  color: "purple",
                  items: [
                    "Order first NVIDIA Jetson Orin Nano, get Mission Control running on it",
                    "Build the custom enclosure with e-ink display",
                    "Deploy first physical Node to an India-based client",
                    "Build multi-tenant support (tenantId, per-client SSH, fleet dashboard)",
                    "Create SOUL template library for 5-10 AI worker roles",
                  ],
                },
                {
                  period: "Month 3-4: Go Public",
                  color: "amber",
                  items: [
                    "Launch Valence AI website (AI worker job board, not SaaS landing page)",
                    "Clean up repo for open-source release",
                    "Launch on HN, Reddit, Product Hunt with founder story",
                    "Create Discord community",
                    "Build Node auto-provisioning script",
                  ],
                },
                {
                  period: "Month 4-6: Scale",
                  color: "pink",
                  items: [
                    "Expand to 20-50 clients",
                    "Launch Node fleet dashboard",
                    "Begin federated learning implementation",
                    "Expand AI worker catalog to 15-20 roles",
                    "Hire first team member (ops/support)",
                  ],
                },
                {
                  period: "Month 6-12: Network Effects",
                  color: "cyan",
                  items: [
                    "100+ Nodes deployed",
                    "Publish \"State of AI Labor\" benchmarks",
                    "Prototype agent-to-agent protocol",
                    "Begin enterprise/BPO sales ($10K+/month)",
                    "Raise Series A off network effect metrics",
                  ],
                },
              ].map((phase) => (
                <Card key={phase.period}>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-${phase.color}-500/10 text-${phase.color}-400 border border-${phase.color}-500/20`}
                    >
                      {phase.period}
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {phase.items.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-muted-foreground/40 select-none">
                          {i + 1}.
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </Section>

          {/* ─── 13. WHAT NOT TO DO ──────────────────────────────────────── */}
          <Section id="dont-do" badge="13" title="What NOT to Do">
            <Card>
              <div className="space-y-3">
                {[
                  {
                    rule: "Don't add more software features",
                    why: "The product is already production-grade: 43 tables, 50+ endpoints, 13 crons, 5 agents, 50+ integrations. Ship what you have.",
                  },
                  {
                    rule: "Don't cold message random people",
                    why: "Zero conversion, demoralizing. Find people with specific pain points. Show results, don't pitch.",
                  },
                  {
                    rule: "Don't sell software",
                    why: "Sell AI workers. Sell outcomes. Position against their current contractor/agency spend, not against other AI tools.",
                  },
                  {
                    rule: "Don't compete with Perplexity on features",
                    why: "Compete on physical infrastructure, customization, privacy, and the staffing model. Different game entirely.",
                  },
                  {
                    rule: "Don't build mesh/protocol before 50+ clients",
                    why: "The advanced layers (federated learning, agent-to-agent economy) only make sense with network scale. Revenue first.",
                  },
                  {
                    rule: "Don't spend money on ads",
                    why: "Until you have 3+ paying clients from organic outreach and case studies. Paid ads for services are expensive and low-converting.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-red-500/5 border border-red-500/10"
                  >
                    <h4 className="font-semibold text-red-400 text-sm">
                      {item.rule}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.why}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ─── Export ──────────────────────────────────────────────────────────────────── */
export default function NewPlan() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  }

  return <Playbook />;
}
