import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { PilotModal } from "@/components/landing/PilotModal";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getAllGlossaryTerms, type PostMeta } from "@/lib/content";
import { organizationSchema, webPageSchema } from "@/lib/structuredData";

// Fallback static list in case no MDX glossary files exist yet
const FALLBACK_TERMS = [
  { slug: "ai-agent", title: "AI Agent", description: "An AI agent is a software entity that perceives its environment, makes decisions, and takes actions autonomously to achieve defined goals.", category: "core" },
  { slug: "autonomous-ai", title: "Autonomous AI", description: "Autonomous AI refers to artificial intelligence systems that can plan, execute, and complete multi-step tasks without continuous human guidance.", category: "core" },
  { slug: "ai-workforce", title: "AI Workforce", description: "An AI workforce is a coordinated system of AI agents that perform business tasks autonomously — acting as a digital team of employees.", category: "core" },
  { slug: "multi-agent-orchestration", title: "Multi-Agent Orchestration", description: "Multi-agent orchestration is the coordination of multiple specialized AI agents working together on a shared goal, with task routing, communication, and quality review.", category: "technical" },
  { slug: "ai-employee", title: "AI Employee", description: "An AI employee is an autonomous AI agent that performs real work tasks — research, writing, coding, outreach — as a member of a business team.", category: "core" },
  { slug: "ai-worker", title: "AI Worker", description: "An AI worker is an autonomous AI agent that executes specific business tasks with tools, APIs, and integrations.", category: "core" },
  { slug: "agentic-ai", title: "Agentic AI", description: "Agentic AI describes AI systems that act with agency — setting goals, planning steps, using tools, and completing tasks without step-by-step instruction.", category: "core" },
  { slug: "agent-memory", title: "Agent Memory", description: "Agent memory is the ability of an AI agent to retain and recall information across sessions, enabling context-aware, personalized task execution.", category: "technical" },
  { slug: "quality-gates", title: "Quality Gates", description: "Quality gates are review checkpoints in AI agent workflows where outputs are evaluated against criteria before proceeding — preventing errors from propagating.", category: "technical" },
  { slug: "task-decomposition", title: "Task Decomposition", description: "Task decomposition is the process by which an orchestrator agent breaks a high-level goal into specific sub-tasks that can be assigned to specialist agents.", category: "technical" },
  { slug: "ai-integration", title: "AI Integration", description: "An AI integration is a connection between an AI agent platform and a third-party business tool — enabling agents to read, write, and act on external systems.", category: "technical" },
  { slug: "webhook-triggers", title: "Webhook Triggers", description: "Webhook triggers are real-time event notifications from external services that automatically create tasks for AI agents — enabling reactive, event-driven automation.", category: "technical" },
  { slug: "ai-orchestrator", title: "AI Orchestrator", description: "An AI orchestrator is a master agent that manages and coordinates a team of specialist agents — routing tasks, managing dependencies, and reviewing deliverables.", category: "core" },
  { slug: "human-in-the-loop", title: "Human-in-the-Loop", description: "Human-in-the-loop (HITL) is an AI design pattern where humans review and approve AI decisions at critical steps — combining automation efficiency with human judgment.", category: "design" },
  { slug: "enterprise-ai", title: "Enterprise AI", description: "Enterprise AI refers to AI systems designed for business use at scale — with security, compliance, integrations, audit trails, and reliability requirements.", category: "core" },
];

export default function GlossaryIndex() {
  const [terms, setTerms] = useState<PostMeta[]>([]);
  const [query, setQuery] = useState("");
  const [pilotOpen, setPilotOpen] = useState(false);

  useEffect(() => {
    getAllGlossaryTerms().then((t) => {
      setTerms(t.length > 0 ? t : FALLBACK_TERMS as PostMeta[]);
    });
  }, []);

  const filtered = terms.filter(
    (t) => !query || t.title.toLowerCase().includes(query.toLowerCase()) || t.description?.toLowerCase().includes(query.toLowerCase())
  );

  // Group by first letter
  const grouped = filtered.reduce<Record<string, PostMeta[]>>((acc, term) => {
    const letter = term.title[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="AI Glossary — Autonomous AI, AI Agents, and Workforce Terms | Valence AI"
        description="Definitions for key terms in autonomous AI, AI agents, AI workforce, multi-agent orchestration, and enterprise AI. Clear, practical explanations for business and technical teams."
        canonical="/glossary"
        jsonLd={[
          organizationSchema(),
          webPageSchema({
            title: "Valence AI Glossary — Autonomous AI & Enterprise AI Terms",
            description: "Definitions for autonomous AI, AI agents, AI workforce, and enterprise AI terminology.",
            url: "/glossary",
          }),
        ]}
      />
      <PilotModal open={pilotOpen} onClose={() => setPilotOpen(false)} />
      <LandingNav onPilotClick={() => setPilotOpen(true)} />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <Breadcrumbs items={[{ name: "Home", href: "/landing" }, { name: "Glossary" }]} />

        <div className="mt-6 mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">AI Workforce Glossary</h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Plain-English definitions for autonomous AI, AI agents, AI employees, and enterprise AI terminology.
          </p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <input
            type="text"
            placeholder="Search terms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/40 bg-card/30 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/80 transition-colors"
          />
        </div>

        <div className="space-y-8">
          {letters.map((letter) => (
            <div key={letter}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-primary/60 font-mono w-8">{letter}</span>
                <div className="flex-1 h-px bg-border/20" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {grouped[letter].map((term) => (
                  <Link
                    key={term.slug}
                    to={`/glossary/${term.slug}`}
                    className="group flex items-start gap-3 p-4 rounded-xl border border-border/30 hover:border-border/60 transition-all"
                    style={{ background: "hsl(240 20% 5% / 0.5)" }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                        {term.title}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {term.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
