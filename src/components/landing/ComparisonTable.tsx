import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// Feature rows — chosen to show genuine differences, not stack the deck.
// Sources for Perplexity Computer scores:
//   venturebeat.com/2026/02 — 19 models, 400+ integrations, parallel tasks
//   fortune.com/2026/02 — "even your mom can delegate tasks", ease of use
//   perplexity.ai/hub/blog/introducing-perplexity-computer — official announcement
//   karozieminski.substack.com — hands-on review: Labs, PerplexiGrid, GitHub push
//   pcworld.com — "agentic AI like OpenClaw but safer", cloud sandbox
//   n8n.io/make.com — event triggers require 3rd party (no native webhooks)
const FEATURES = [
  "Multi-agent coordination",
  "App integrations catalog",
  "Real API access",
  "Task decomposition graph",
  "Persistent cross-session memory",
  "Human quality review gates",
  "Add any API via AI scraper",
  "Voice command (desktop + mobile)",
  "Native event / webhook triggers",
  "Dedicated specialist agents",
  "Live ops dashboard",
  // ── New differentiating rows ──
  "On-prem / self-hosted",
  "Agent SOUL & evolving identity",
  "Audit log & API key management",
  "White-label / brand config",
];

type CellValue = "yes" | "no" | "partial";

const PRODUCTS: {
  name: string;
  short: string;
  highlight?: boolean;
  subtitle?: string;
  values: CellValue[];
}[] = [
  {
    name: "Valence AI",
    short: "us",
    highlight: true,
    // Notes: specialist agents = Kaze/Scout/Forge/Ghost/Sentinel with SOULs + memory
    // Human review gates = Sentinel reject/rework loop
    // Native webhooks = HMAC-verified event triggers, no 3rd party needed
    // AI scraper = paste URL → Claude generates blueprint
    // Live ops = activity feed, session replay, agent analytics
    // On-prem = runs on your AWS Lightsail / any VPS; agent server self-hosted
    // SOUL = SOUL.md per agent, evolves via memory distillation over time
    // Audit log = every action logged; API keys with scoped permissions
    // White-label = brandConfig: custom logo, colors, domain
    values: ["yes","yes","yes","yes","yes","yes","yes","yes","yes","yes","yes","yes","yes","yes","yes"],
  },
  {
    // Perplexity Computer — launched Feb 25, 2026 — genuinely strong product
    // YES: 19-model multi-agent orchestration (Claude Opus 4.6 + Gemini + Grok +
    //      GPT-5.2 + Veo + others); routes each subtask to best-fit model
    // YES: 400+ app integrations (more than us) — Gmail, Slack, Notion, Salesforce,
    //      Shopify, Snowflake, Databricks, Crunchbase, GitHub, Linear etc.
    // YES: Real API calls to connected services
    // YES: Task decomposition — breaks goals into parallel async subtasks visible in UI;
    //      tasks can run hours/days/months in cloud sandbox
    // YES: Cross-session persistent memory (explicit + implicit, weeks of context)
    // YES: Voice on desktop (⌘⇧V / Ctrl+Shift+V) AND mobile iOS/Android
    //      with local-first audio processing
    // YES: Autopilot-style — describe goal, system decomposes and executes
    // PARTIAL: Quality review — multi-model redundancy reduces errors but no explicit
    //          human reject/rework gate; relies on cloud safeguards
    // PARTIAL: Live ops — Labs + PerplexiGrid dashboard (25+ widgets), but no
    //          dedicated agent activity feed, session replay, or per-agent analytics
    // NO: Add any API via AI — fixed 400+ catalog; no doc-scraper to add custom APIs
    // NO: Native webhooks — event-driven triggers require 3rd party (n8n, Make, Pipedream)
    // NO: Dedicated specialist agents — general orchestrator assigns to models, not
    //     named agents with persistent identities, SOULs, and evolving memories
    // NO: On-prem — cloud-only, always; no self-hosted option announced
    // NO: Agent SOUL — no named agent identities, no evolving persona files
    // NO: Audit log & API keys — no documented audit trail or programmatic API keys
    // NO: White-label — consumer product; zero brand customization
    name: "Perplexity Computer",
    short: "PPLX",
    subtitle: "launched Feb '26",
    values: ["yes","yes","yes","yes","yes","partial","no","yes","no","no","partial","no","no","no","no"],
  },
  {
    name: "ChatGPT",
    short: "GPT",
    // Operator-configured actions; limited true multi-agent; memory on Pro;
    // voice on mobile+desktop; no native webhooks; no specialist agents;
    // cloud-only; no audit log API; no white-label
    values: ["partial","partial","partial","no","partial","no","no","yes","no","no","partial","no","no","no","no"],
  },
  {
    name: "Zapier",
    short: "ZAP",
    // Strong on integrations + webhooks; no AI agents; no memory; no voice;
    // cloud SaaS only; no agent SOULs; partial audit via Zapier Tables; no white-label
    values: ["no","yes","yes","partial","no","no","no","no","yes","no","yes","no","no","partial","no"],
  },
  {
    name: "n8n",
    short: "N8N",
    // Open-source workflow engine; webhooks yes; basic AI nodes; no agents/voice;
    // self-hostable (YES on-prem); no SOULs; partial audit log; no white-label natively
    values: ["no","yes","yes","yes","no","no","no","no","yes","no","yes","yes","no","partial","no"],
  },
  {
    name: "Paragon",
    short: "PAR",
    // Integration platform for SaaS; no AI agents; no voice; no memory;
    // cloud-only; no SOULs; no audit log; white-label is their core offering
    values: ["no","yes","yes","partial","no","no","no","no","no","no","partial","no","no","no","yes"],
  },
];

function Cell({ value }: { value: CellValue }) {
  if (value === "yes") {
    return (
      <div className="flex justify-center">
        <div className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center">
          <span className="text-green-400 text-xs">✓</span>
        </div>
      </div>
    );
  }
  if (value === "partial") {
    return (
      <div className="flex justify-center">
        <span className="text-yellow-500/60 text-sm leading-none">~</span>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <span className="text-red-400/30 text-sm leading-none">✕</span>
    </div>
  );
}

export function ComparisonTable() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="w-full overflow-x-auto">
      <table className="w-full min-w-[600px] text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left py-3 pr-4 text-muted-foreground/60 font-normal text-xs w-44">
              Feature
            </th>
            {PRODUCTS.map((p, i) => (
              <motion.th
                key={p.name}
                initial={{ opacity: 0, y: -16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="py-3 px-2 text-center"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <div
                    className="inline-block px-2 py-1 rounded-lg text-xs font-semibold"
                    style={
                      p.highlight
                        ? {
                            background: "hsl(var(--primary) / 0.12)",
                            border: "1px solid hsl(var(--primary) / 0.4)",
                            color: "hsl(var(--primary))",
                          }
                        : {
                            color: "hsl(var(--muted-foreground))",
                          }
                    }
                  >
                    {p.name}
                  </div>
                  {p.subtitle && (
                    <span className="text-[9px] text-muted-foreground/40 font-normal tracking-wide whitespace-nowrap">
                      {p.subtitle}
                    </span>
                  )}
                </div>
              </motion.th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FEATURES.map((feature, fi) => (
            <motion.tr
              key={feature}
              initial={{ opacity: 0, x: -16 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{
                delay: 0.3 + fi * 0.05,
                duration: 0.4,
                type: "spring",
                stiffness: 150,
                damping: 20,
              }}
              className="border-t border-border/30 group"
            >
              <td className="py-3 pr-4 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {feature}
              </td>
              {PRODUCTS.map((p, pi) => (
                <td
                  key={p.name}
                  className="py-3 px-2"
                  style={
                    p.highlight
                      ? {
                          background: "hsl(var(--primary) / 0.03)",
                        }
                      : {}
                  }
                >
                  <Cell value={p.values[fi]} />
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground/50">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-green-400 text-[8px]">✓</span>
          </div>
          Full support
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-500/50">~</span>
          Partial
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-red-400/30 text-xs">✕</span>
          Not available
        </div>
      </div>
    </div>
  );
}
