import { motion } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";
import { LandingNav } from "@/components/landing/LandingNav";
import { SetupGuideModal } from "@/components/landing/SetupGuideModal";
import { useState } from "react";
import {
  Github, Server, Cpu, HardDrive, MemoryStick, Check, ArrowRight, ExternalLink,
} from "lucide-react";

const serverTiers = [
  { agents: "1–5 agents",  ram: "2 GB",  cpu: "2 vCPUs", storage: "40 GB SSD",  example: "AWS Lightsail, DigitalOcean Basic", cost: "~$10–12/mo",   highlight: false },
  { agents: "6–10 agents", ram: "4 GB",  cpu: "2 vCPUs", storage: "80 GB SSD",  example: "AWS Lightsail, DigitalOcean $24",  cost: "~$20–24/mo",   highlight: true  },
  { agents: "11–15 agents",ram: "8 GB",  cpu: "4 vCPUs", storage: "160 GB SSD", example: "Hetzner CX32, AWS t3.large",       cost: "~$40–50/mo",   highlight: false },
  { agents: "16–20 agents",ram: "16 GB", cpu: "4 vCPUs", storage: "320 GB SSD", example: "Hetzner CX42, AWS t3.xlarge",      cost: "~$80–100/mo",  highlight: false },
  { agents: "20+ agents",  ram: "32 GB", cpu: "8 vCPUs", storage: "640 GB SSD", example: "Hetzner AX41, AWS c5.2xlarge",     cost: "~$160–200/mo", highlight: false },
];

const features = [
  { icon: "🤖", title: "Unlimited agents",      body: "Create as many agents as your server can handle. No artificial caps." },
  { icon: "🔌", title: "100+ integrations",     body: "GitHub, Slack, Notion, HubSpot, Jira, Google Workspace, and more — all built-in." },
  { icon: "🧠", title: "Persistent memory",     body: "Agents accumulate context, preferences, and learnings across every task." },
  { icon: "🔍", title: "Quality review gates",  body: "Sentinel reviews every deliverable before it ships. Configurable approval flows." },
  { icon: "📡", title: "Webhooks & monitors",   body: "Trigger agents from Slack, GitHub, Linear events. Continuous polling monitors." },
  { icon: "🔐", title: "Self-hosted & private", body: "Your data stays on your server. No SaaS middleman, no usage limits." },
  { icon: "🛠️", title: "SOUL file editing",     body: "Customize each agent's personality, rules, and tool access via SOUL.md files." },
  { icon: "📊", title: "Real-time analytics",   body: "Task throughput, agent activity, mission completion rates — all visible." },
];

export default function OpenSource() {
  const [setupOpen, setSetupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Open Source — Valence AI"
        description="Valence AI is free and open-source. Deploy on your own server — you only pay for your cloud VPS and Anthropic API usage."
        canonical="/open-source"
      />

      <LandingNav onPilotClick={() => setSetupOpen(true)} />

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-24">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest px-3 py-1.5 rounded-full mb-6"
            style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.9)", border: "1px solid hsl(var(--primary) / 0.2)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            FREE &amp; OPEN SOURCE · MIT LICENSE
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-5 tracking-tight">
            Free forever.
            <br />
            <span className="text-muted-foreground/50">You own the stack.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Valence AI is MIT-licensed. Self-host on any Linux server.
            The only costs are your VPS (~$10–20/mo) and Anthropic API usage.
            No subscriptions, no seat limits, no vendor lock-in.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/appydam/valence-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            >
              <Github className="w-4 h-4" />
              View on GitHub
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            <button
              onClick={() => setSetupOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
              style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
            >
              Setup Guide
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Cost breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-center mb-3">What you actually pay</h2>
          <p className="text-sm text-muted-foreground text-center mb-10">
            Valence AI itself is $0. Your real costs are infrastructure and API usage.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="rounded-2xl p-6" style={{ background: "hsl(240 25% 7%)", border: "1px solid hsl(var(--border) / 0.5)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(217 91% 60% / 0.15)" }}>
                  <Server className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-sm">VPS / Cloud Server</div>
                  <div className="text-xs text-muted-foreground">One-time infra setup</div>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">$10–20<span className="text-base font-normal text-muted-foreground">/mo</span></div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AWS Lightsail 4 GB ($20/mo), DigitalOcean Basic ($24/mo), or Hetzner CX22 ($7/mo).
                Any Linux VPS works.
              </p>
            </div>

            <div className="rounded-2xl p-6" style={{ background: "hsl(240 25% 7%)", border: "1px solid hsl(var(--border) / 0.5)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(258 90% 56% / 0.15)" }}>
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">Anthropic API</div>
                  <div className="text-xs text-muted-foreground">Pay per token used</div>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">Usage-based</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Claude Sonnet 4.6: $3/$15 per M tokens (in/out).
                A typical 50-task workday runs $5–15 in API cost.
                Bring your own Anthropic key.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Server sizing guide */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-center mb-3">Server sizing guide</h2>
          <p className="text-sm text-muted-foreground text-center mb-10">
            Each agent runs as an independent process. More agents = more RAM needed.
          </p>

          <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid hsl(var(--border) / 0.4)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid hsl(var(--border) / 0.4)", background: "hsl(240 25% 6%)" }}>
                  <th className="text-left px-5 py-3.5 text-xs font-mono tracking-widest text-muted-foreground/60 uppercase">Agents</th>
                  <th className="text-left px-5 py-3.5 text-xs font-mono tracking-widest text-muted-foreground/60 uppercase">
                    <span className="flex items-center gap-1.5"><MemoryStick className="w-3.5 h-3.5" />RAM</span>
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-mono tracking-widest text-muted-foreground/60 uppercase">
                    <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" />CPU</span>
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-mono tracking-widest text-muted-foreground/60 uppercase">
                    <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" />Storage</span>
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-mono tracking-widest text-muted-foreground/60 uppercase hidden md:table-cell">Example</th>
                  <th className="text-right px-5 py-3.5 text-xs font-mono tracking-widest text-muted-foreground/60 uppercase">Est. Cost</th>
                </tr>
              </thead>
              <tbody>
                {serverTiers.map((tier, i) => (
                  <tr
                    key={tier.agents}
                    style={{
                      borderBottom: i < serverTiers.length - 1 ? "1px solid hsl(var(--border) / 0.3)" : undefined,
                      background: tier.highlight ? "hsl(var(--primary) / 0.04)" : undefined,
                    }}
                  >
                    <td className="px-5 py-4 font-semibold text-foreground">
                      {tier.agents}
                      {tier.highlight && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-mono"
                          style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}>
                          RECOMMENDED
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{tier.ram}</td>
                    <td className="px-5 py-4 text-muted-foreground">{tier.cpu}</td>
                    <td className="px-5 py-4 text-muted-foreground">{tier.storage}</td>
                    <td className="px-5 py-4 text-muted-foreground/60 text-xs hidden md:table-cell">{tier.example}</td>
                    <td className="px-5 py-4 text-right font-mono text-sm text-foreground/80">{tier.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground/50 text-center mt-3">
            Costs are estimates for self-managed VPS. Actual pricing varies by provider and region.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-center mb-3">Everything included</h2>
          <p className="text-sm text-muted-foreground text-center mb-10">No paid tiers. No feature gates. All of this ships in the open-source repo.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl p-4"
                style={{ background: "hsl(240 25% 7%)", border: "1px solid hsl(var(--border) / 0.4)" }}>
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-semibold text-sm mb-1">{f.title}</div>
                <div className="text-xs text-muted-foreground/70 leading-relaxed">{f.body}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-20 max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-center mb-10">FAQ</h2>
          <div className="space-y-5">
            {[
              {
                q: "Do I need technical skills to self-host?",
                a: "Basic Linux comfort helps. You need to provision a VPS, install Node.js, run npm install, and set a few environment variables. The setup guide walks through every step.",
              },
              {
                q: "What AI model do agents use?",
                a: "Claude Sonnet 4.6 by default (best balance of speed and intelligence). You can configure any Claude model in each agent's settings. Bring your own Anthropic API key.",
              },
              {
                q: "Can I add my own integrations?",
                a: "Yes. The Integration Engine lets you paste any API documentation URL and Claude generates the tool definitions automatically. No coding required for most integrations.",
              },
              {
                q: "Is there a hosted / managed version?",
                a: "Not at this time. Valence AI is fully self-hosted. You own and control all your data.",
              },
              {
                q: "How is this licensed?",
                a: "MIT License. You can use it commercially, modify it, and distribute it freely. Attribution appreciated but not required.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl p-5"
                style={{ background: "hsl(240 25% 7%)", border: "1px solid hsl(var(--border) / 0.4)" }}>
                <div className="font-semibold text-sm mb-2 flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  {q}
                </div>
                <p className="text-xs text-muted-foreground/80 leading-relaxed pl-6">{a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center rounded-2xl p-12"
          style={{ background: "hsl(240 25% 7%)", border: "1px solid hsl(var(--primary) / 0.2)" }}
        >
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold mb-3">Ready to deploy?</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Clone the repo, set your environment variables, and have agents running in under 30 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/appydam/valence-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            >
              <Github className="w-4 h-4" />
              Get Started on GitHub
            </a>
            <button
              onClick={() => setSetupOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
              style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
            >
              Read the Setup Guide
            </button>
          </div>
        </motion.div>
      </div>

      <SetupGuideModal open={setupOpen} onClose={() => setSetupOpen(false)} />
    </div>
  );
}
