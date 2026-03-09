import { Link } from "react-router-dom";
import { ArrowRight, BarChart2 } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { PilotModal } from "@/components/landing/PilotModal";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useState } from "react";

interface ComparisonEntry {
  slug: string;
  title: string;
  description: string;
  competitor: string;
  verdict: string;
  tags: string[];
}

const COMPARISONS: ComparisonEntry[] = [
  {
    slug: "valence-vs-lindy",
    title: "Valence AI vs Lindy AI",
    description: "Multi-agent platform vs single-agent automation. Valence AI coordinates specialized AI teams; Lindy builds individual AI assistants. The right choice depends on workflow complexity.",
    competitor: "Lindy AI",
    verdict: "Valence AI for enterprise; Lindy for SMB",
    tags: ["multi-agent", "automation", "SMB vs enterprise"],
  },
  {
    slug: "valence-vs-zapier",
    title: "Valence AI vs Zapier",
    description: "AI agents vs workflow automation. Zapier connects apps with triggers and actions. Valence AI agents reason, research, write, and coordinate — going far beyond predefined steps.",
    competitor: "Zapier",
    verdict: "Zapier for simple triggers; Valence for reasoning tasks",
    tags: ["workflow automation", "no-code", "AI vs rules"],
  },
  {
    slug: "valence-vs-make",
    title: "Valence AI vs Make",
    description: "AI workforce vs visual workflow builder. Make (Integromat) excels at complex data routing. Valence AI handles tasks that require judgment, research, and content generation.",
    competitor: "Make (Integromat)",
    verdict: "Make for data flows; Valence for knowledge work",
    tags: ["visual automation", "data routing", "AI judgment"],
  },
  {
    slug: "valence-vs-crewai",
    title: "Valence AI vs CrewAI",
    description: "Managed platform vs open-source framework. CrewAI is a Python library for building agent workflows. Valence AI is a fully managed system ready for production deployment.",
    competitor: "CrewAI",
    verdict: "CrewAI for developers; Valence for business teams",
    tags: ["open-source", "framework", "managed platform"],
  },
  {
    slug: "valence-vs-autogpt",
    title: "Valence AI vs AutoGPT",
    description: "Production platform vs autonomous research prototype. AutoGPT demonstrated autonomous AI potential. Valence AI delivers that potential with enterprise reliability and human oversight.",
    competitor: "AutoGPT",
    verdict: "AutoGPT for experimentation; Valence for production",
    tags: ["autonomous AI", "research tool", "production ready"],
  },
  {
    slug: "valence-vs-perplexity-computer",
    title: "Valence AI vs Perplexity Computer",
    description: "Perplexity Computer (Feb 2026) is a cloud super agent coordinating 19 AI models — Claude Opus 4.6 as orchestrator — in an isolated Linux sandbox. Valence AI is a business-integrated workforce that writes directly to your CRM, GitHub, and Slack.",
    competitor: "Perplexity Computer",
    verdict: "Perplexity for research deliverables; Valence for business system automation",
    tags: ["multi-model", "super agent", "cloud sandbox"],
  },
  {
    slug: "valence-vs-claude-cowork",
    title: "Valence AI vs Claude Cowork",
    description: "Claude Cowork (Jan 2026) is Anthropic's agentic Claude Desktop feature — it executes multi-step tasks on your local filesystem via a sandboxed VM. Valence AI is server-side, multi-user, and persistent across missions.",
    competitor: "Claude Cowork",
    verdict: "Cowork for individual local tasks; Valence for team-scale server-side missions",
    tags: ["Claude", "desktop agent", "local filesystem"],
  },
  {
    slug: "valence-vs-microsoft-copilot",
    title: "Valence AI vs Microsoft Copilot Cowork",
    description: "Copilot Cowork (announced March 9, 2026) adds agentic execution to M365 Copilot — powered by Claude — running autonomously across Outlook, Teams, and Word. Valence AI is stack-agnostic, spanning Salesforce, GitHub, Jira, and Slack too.",
    competitor: "Microsoft Copilot Cowork",
    verdict: "Copilot Cowork for M365-native orgs; Valence for cross-stack automation",
    tags: ["Microsoft", "M365", "enterprise agent"],
  },
];

function ComparisonCard({ comparison }: { comparison: ComparisonEntry }) {
  return (
    <Link
      to={`/compare/${comparison.slug}`}
      className="group flex flex-col gap-4 p-6 rounded-xl border border-border/30 hover:border-primary/30 transition-all"
      style={{ background: "hsl(240 20% 5% / 0.5)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <BarChart2 className="w-4 h-4 text-primary/70" />
          </div>
          <span className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest">
            vs {comparison.competitor}
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors shrink-0 mt-0.5" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
          {comparison.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {comparison.description}
        </p>
      </div>

      <div className="mt-auto pt-2 border-t border-border/20 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground/60 italic">{comparison.verdict}</span>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {comparison.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-400/70 font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default function CompareIndex() {
  const [pilotOpen, setPilotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Valence AI Comparisons — How We Stack Up Against the Alternatives"
        description="Compare Valence AI to Lindy, Zapier, Make, CrewAI, AutoGPT, and other AI automation tools. Honest breakdowns of architecture, pricing, and use cases."
        canonical="https://usevalence.ai/compare"
      />
      <LandingNav onPilotClick={() => setPilotOpen(true)} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/landing" },
            { label: "Compare", href: "/compare" },
          ]}
        />

        {/* Header */}
        <div className="mt-6 mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-5">
            <BarChart2 className="w-3.5 h-3.5 text-primary/70" />
            <span className="text-xs font-mono text-primary/70 uppercase tracking-widest">Comparisons</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Valence AI vs the Alternatives
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Honest, side-by-side comparisons of Valence AI and competing AI automation tools.
            Every comparison covers architecture, capabilities, pricing, and the right fit for your team.
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {COMPARISONS.map((c) => (
            <ComparisonCard key={c.slug} comparison={c} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center p-8 rounded-2xl border border-primary/20 bg-primary/5">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            See Valence AI in action
          </h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            Reading comparisons is one thing. Watching five specialized agents complete a real mission is another.
          </p>
          <button
            onClick={() => setPilotOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Apply for Pilot Access <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      <PilotModal open={pilotOpen} onClose={() => setPilotOpen(false)} />
    </div>
  );
}
