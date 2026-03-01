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
    // Relevance AI — AI workforce platform for GTM/sales/ops teams
    // YES: multi-agent teams with specialized roles; visual workflow builder
    // YES: enterprise integrations (CRM-focused: Salesforce, HubSpot, etc.)
    // YES: real API access; task chains with dependencies
    // PARTIAL: memory — RAG/embeddings per agent, not episodic session memory
    // PARTIAL: quality review — human-in-loop steps available but not a dedicated QA agent
    // NO: AI doc scraper; NO: voice; NO: native webhooks (uses Zapier/Make triggers)
    // NO: on-prem (cloud-only); NO: agent SOUL/evolving identity; NO: white-label
    // Pricing: enterprise (not public); focused on GTM teams, not general ops
    name: "Relevance AI",
    short: "REL",
    values: ["yes","yes","yes","yes","partial","partial","no","no","no","partial","yes","no","no","partial","no"],
  },
  {
    // Beam AI — enterprise Agentic Process Automation (APA) platform
    // YES: multi-agent orchestration via Petri Nets; parallel multi-threaded workflows
    // YES: 500+ enterprise API integrations
    // YES: real API access; task dependencies; self-learning from outcomes
    // PARTIAL: memory — process-outcome learning, not episodic session memory
    // PARTIAL: quality review — SOP-based hybrid; human-in-loop configurable
    // NO: AI doc scraper; NO: voice; NO: native webhooks (enterprise event bus)
    // NO: on-prem; NO: agent SOUL/evolving identity
    // Pricing: enterprise only ($37B TAM focus); heavy implementation overhead
    name: "Beam AI",
    short: "BEAM",
    values: ["yes","yes","yes","yes","partial","partial","no","no","partial","partial","yes","no","no","partial","no"],
  },
  {
    // CrewAI — open-source multi-agent framework + CrewAI AMP managed platform
    // YES: foundational multi-agent orchestration (1.4B+ automations, PwC/IBM/NVIDIA)
    // YES: open ecosystem — works with any API; AMP adds managed scaling
    // YES: real API access; task decomposition; parallel execution
    // PARTIAL: memory — session context, no persistent agent SOUL/identity
    // PARTIAL: quality review — tracing/observability in AMP, no dedicated QA agent
    // PARTIAL: voice — no native voice; integrable via SDK
    // YES: on-prem (open-source, self-hostable); NO: dedicated agent SOUL
    // PARTIAL: audit (AMP has execution traces); NO: white-label
    name: "CrewAI",
    short: "CREW",
    values: ["yes","yes","yes","yes","partial","partial","no","no","partial","partial","yes","yes","no","partial","no"],
  },
  {
    // n8n — open-source self-hosted workflow automation engine
    // The go-to tool for technical teams before they adopt an agent platform.
    // YES: 400+ integrations; native webhooks; self-hostable; partial audit (execution logs)
    // PARTIAL: multi-agent — basic AI nodes, not true agent orchestration
    // PARTIAL: task decomp — branching logic, not AI-driven decomposition
    // NO: persistent memory; NO: quality review gates; NO: AI doc scraper; NO: voice
    // NO: agent SOUL; NO: white-label
    name: "n8n",
    short: "N8N",
    values: ["partial","yes","yes","partial","no","no","no","no","yes","no","yes","yes","no","partial","no"],
  },
  {
    // Lindy AI — no-code AI agent platform ("AI employees"), SMB-focused
    // YES: agents with autonomy (30+ hours on Claude Sonnet 4.5)
    // YES: 100+ integrations via Zapier + native; web, email, spreadsheets
    // YES: real API access
    // PARTIAL: task decomposition — single long-running agent, not multi-agent graph
    // PARTIAL: memory — conversation-level; no evolving cross-session agent identity
    // NO: quality review gates; NO: AI doc scraper; PARTIAL: voice (implied)
    // NO: on-prem (cloud SaaS); NO: agent SOUL; NO: audit log / API keys; NO: white-label
    // Pricing: free → $49.99/mo — most accessible competitor
    name: "Lindy AI",
    short: "LNDY",
    values: ["partial","yes","yes","partial","partial","no","no","partial","no","no","yes","no","no","no","no"],
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
