import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { howToSchema, breadcrumbSchema, faqSchema } from "@/lib/structuredData";
import { PilotModal } from "@/components/landing/PilotModal";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroParticleField } from "@/components/landing/HeroParticleField";
import {
  getUseCaseBySlug,
  USE_CASES,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  type UseCase as UseCaseType,
} from "@/data/useCases";

// ─── Tool chip ──────────────────────────────────────────────────────────────
function ToolChip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold font-mono"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color: color === "#e2e8f0" ? "#e2e8f0" : color,
      }}
    >
      {label}
    </span>
  );
}

// ─── Workflow step ──────────────────────────────────────────────────────────
function WorkflowStep({
  step,
  index,
  isInView,
  totalSteps,
}: {
  step: UseCaseType["steps"][0];
  index: number;
  isInView: boolean;
  totalSteps: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        delay: 0.2 + index * 0.12,
        duration: 0.4,
        type: "spring",
        stiffness: 150,
        damping: 22,
      }}
      className="relative flex gap-4"
    >
      {/* Timeline line */}
      {index < totalSteps - 1 && (
        <div
          className="absolute left-5 top-12 bottom-0 w-px"
          style={{ background: `${step.color}25` }}
        />
      )}

      {/* Step number + agent icon */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{
            background: `${step.color}12`,
            border: `1px solid ${step.color}35`,
          }}
        >
          {step.emoji}
        </div>
        <span
          className="text-[9px] font-mono font-bold"
          style={{ color: `${step.color}90` }}
        >
          {index + 1}/{totalSteps}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-sm font-bold"
            style={{ color: step.color }}
          >
            {step.agent}
          </span>
        </div>
        <p className="text-sm text-foreground/90 mb-2">{step.action}</p>

        {/* Tools */}
        {step.tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {step.tools.map((tool, ti) => (
              <ToolChip key={ti} label={tool.label} color={tool.color} />
            ))}
          </div>
        )}

        {/* Detail */}
        {step.detail && (
          <div
            className="text-[11px] font-mono text-muted-foreground/50 px-3 py-1.5 rounded-md inline-block"
            style={{ background: "hsl(240 33% 4%)" }}
          >
            {step.detail}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Comparison row ─────────────────────────────────────────────────────────
function ComparisonRow({
  label,
  manual,
  zapier,
  valence,
}: {
  label: string;
  manual: string;
  zapier: string;
  valence: string;
}) {
  return (
    <div className="grid grid-cols-4 gap-4 py-3 border-b border-border/20 text-sm">
      <div className="font-medium text-foreground/80">{label}</div>
      <div className="text-muted-foreground/60">{manual}</div>
      <div className="text-muted-foreground/60">{zapier}</div>
      <div className="text-primary font-medium">{valence}</div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function UseCasePage() {
  const { slug } = useParams<{ slug: string }>();
  const prefersReduced = useReducedMotion();
  const [pilotOpen, setPilotOpen] = useState(false);

  const useCase = slug ? getUseCaseBySlug(slug) : undefined;

  // Refs for scroll-reveal sections
  const workflowRef = useRef<HTMLDivElement>(null);
  const workflowInView = useInView(workflowRef, { once: true, margin: "-80px" });
  const roiRef = useRef<HTMLDivElement>(null);
  const roiInView = useInView(roiRef, { once: true, margin: "-80px" });
  const diffRef = useRef<HTMLDivElement>(null);
  const diffInView = useInView(diffRef, { once: true, margin: "-80px" });

  if (!useCase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Use case not found</h1>
          <p className="text-muted-foreground mb-4">The use case you're looking for doesn't exist.</p>
          <Link to="/landing" className="text-primary hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // Get unique integrations from steps
  const allIntegrations = useCase.steps
    .flatMap((s) => s.tools)
    .filter((t, i, arr) => arr.findIndex((x) => x.label === t.label) === i);

  // Get related use cases (same category, different slug)
  const related = USE_CASES.filter(
    (uc) => uc.category === useCase.category && uc.slug !== useCase.slug
  ).slice(0, 2);

  // If no same-category matches, pick from other categories
  const otherRelated =
    related.length < 2
      ? USE_CASES.filter((uc) => uc.slug !== useCase.slug && uc.category !== useCase.category).slice(0, 2 - related.length)
      : [];

  const relatedCases = [...related, ...otherRelated];

  const useCaseFaqs = [
    {
      question: `How does Valence AI automate ${useCase.title}?`,
      answer: `Valence AI orchestrates ${useCase.steps.length} specialized AI agents to handle ${useCase.title.toLowerCase()}. ${useCase.painPoint} Our agents use tools like ${useCase.steps.flatMap((s) => s.tools.slice(0, 2).map((t) => t.label)).slice(0, 4).join(", ")} to execute each step autonomously, saving an average of ${useCase.hoursSaved}.`,
    },
    {
      question: `What integrations are used for ${useCase.title}?`,
      answer: `This workflow uses ${allIntegrations.slice(0, 6).map((t) => t.label).join(", ")}${allIntegrations.length > 6 ? ` and ${allIntegrations.length - 6} more` : ""}. All integrations connect via OAuth or API keys and are managed from the Valence AI integration hub.`,
    },
    {
      question: `What results can I expect from AI-powered ${useCase.categoryLabel} automation?`,
      answer: `Teams using Valence AI for ${useCase.title.toLowerCase()} typically save ${useCase.hoursSaved} per week. ${useCase.roi.slice(0, 2).join(". ")}.`,
    },
    {
      question: "Can I customize this workflow for my business?",
      answer: "Yes. Every workflow in Valence AI is fully customizable. You can adjust which agents are involved, which integrations are used, what quality criteria agents must meet, and how results are delivered. Enterprise clients get white-glove onboarding to configure custom workflows from scratch.",
    },
  ];

  const howToJsonLd = howToSchema({
    name: useCase.title,
    description: useCase.painPoint,
    steps: useCase.steps.map((s) => ({
      name: `${s.agent}: ${s.action}`,
      text: s.detail,
    })),
  });

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", url: "/landing" },
    { name: "Use Cases", url: "/use-cases" },
    { name: useCase.categoryLabel, url: `/use-cases?category=${useCase.category}` },
    { name: useCase.title, url: `/use-cases/${useCase.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SEOHead
        title={`${useCase.title} — AI Automation for ${useCase.categoryLabel} | Valence AI`}
        description={`${useCase.painPoint.slice(0, 130)}. Valence AI agents automate this in ${useCase.hoursSaved}. ${useCase.metric}`}
        canonical={`/use-cases/${useCase.slug}`}
        jsonLd={[howToJsonLd, breadcrumbJsonLd, faqSchema(useCaseFaqs)]}
      />
      <PilotModal open={pilotOpen} onClose={() => setPilotOpen(false)} />

      <LandingNav
        onPilotClick={() => setPilotOpen(true)}
        breadcrumb={{ icon: CATEGORY_ICONS[useCase.category], label: CATEGORY_LABELS[useCase.category] }}
      />

      {/* ── Hero Section ── */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <HeroParticleField opacity={0.5} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center top, ${useCase.accentColor.replace("hsl(", "hsla(").replace(")", ", 0.08)")} 0%, transparent 60%)`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          {/* Category badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-6"
          >
            <span
              className="text-xs font-mono tracking-widest px-2.5 py-1 rounded-full"
              style={{
                background: `${useCase.accentColor.replace("hsl(", "hsla(").replace(")", ", 0.1)")}`,
                border: `1px solid ${useCase.accentColor.replace("hsl(", "hsla(").replace(")", ", 0.3)")}`,
                color: useCase.accentColor,
              }}
            >
              {CATEGORY_ICONS[useCase.category]} {CATEGORY_LABELS[useCase.category].toUpperCase()}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 20 }}
            className="text-4xl sm:text-5xl font-bold leading-tight mb-4"
          >
            <span className="text-foreground">{useCase.icon} </span>
            <span
              style={{
                background: `linear-gradient(135deg, ${useCase.accentColor}, hsl(var(--foreground)))`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {useCase.title}
            </span>
          </motion.h1>

          {/* Buyer line */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-muted-foreground mb-6"
          >
            For <span className="text-foreground font-medium">{useCase.buyer}</span>
          </motion.p>

          {/* Trigger command */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="px-4 py-3 rounded-xl text-sm font-mono mb-8"
            style={{
              background: "hsl(240 33% 4%)",
              border: "1px solid hsl(var(--border) / 0.6)",
            }}
          >
            <span className="text-primary/40">❯ </span>
            <span className="text-muted-foreground">{useCase.trigger}</span>
          </motion.div>

          {/* Metric pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            <div
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: `${useCase.accentColor.replace("hsl(", "hsla(").replace(")", ", 0.1)")}`,
                border: `1px solid ${useCase.accentColor.replace("hsl(", "hsla(").replace(")", ", 0.25)")}`,
                color: useCase.accentColor,
              }}
            >
              {useCase.metric}
            </div>
            <div
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                background: "hsl(var(--primary) / 0.06)",
                border: "1px solid hsl(var(--primary) / 0.2)",
                color: "hsl(var(--primary) / 0.8)",
              }}
            >
              {useCase.hoursSaved}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Pain Point Section ── */}
      <section className="py-12 border-t border-border/20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xs font-mono tracking-widest text-muted-foreground/60 mb-3">THE PROBLEM</h3>
              <p className="text-base text-foreground/80 leading-relaxed">{useCase.painPoint}</p>
            </div>
            <div>
              <h3 className="text-xs font-mono tracking-widest text-muted-foreground/60 mb-3">INTEGRATIONS USED</h3>
              <div className="flex flex-wrap gap-2">
                {allIntegrations.map((tool) => (
                  <ToolChip key={tool.label} label={tool.label} color={tool.color} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow Section ── */}
      <section ref={workflowRef} className="py-16 border-t border-border/20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={workflowInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-2">How it works</h2>
            <p className="text-muted-foreground">
              5 specialized agents coordinate autonomously — from trigger to result.
            </p>
          </motion.div>

          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: "hsl(240 25% 7%)",
              border: `1px solid ${useCase.accentColor}20`,
            }}
          >
            {useCase.steps.map((step, i) => (
              <WorkflowStep
                key={i}
                step={step}
                index={i}
                isInView={workflowInView}
                totalSteps={useCase.steps.length}
              />
            ))}

            {/* Result */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={workflowInView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                delay: 0.2 + useCase.steps.length * 0.12 + 0.2,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className="mt-4 p-4 rounded-xl flex items-start gap-3"
              style={{
                background: `${useCase.accentColor.replace("hsl(", "hsla(").replace(")", ", 0.08)")}`,
                border: `1px solid ${useCase.accentColor.replace("hsl(", "hsla(").replace(")", ", 0.25)")}`,
              }}
            >
              <span className="text-lg flex-shrink-0 mt-0.5">✓</span>
              <div>
                <div className="text-xs font-mono tracking-widest text-muted-foreground/60 mb-1">RESULT</div>
                <p className="text-sm font-semibold" style={{ color: useCase.accentColor }}>
                  {useCase.result}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ROI Section ── */}
      <section ref={roiRef} className="py-16 border-t border-border/20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={roiInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-2">Measurable ROI</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {useCase.roi.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={roiInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 150, damping: 22 }}
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{
                  background: "hsl(240 25% 7%)",
                  border: "1px solid hsl(var(--border) / 0.3)",
                }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{
                    background: `${useCase.accentColor.replace("hsl(", "hsla(").replace(")", ", 0.15)")}`,
                    color: useCase.accentColor,
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-sm text-foreground/80">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why This Is Different ── */}
      <section ref={diffRef} className="py-16 border-t border-border/20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={diffInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-2">Why no one else can do this</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={diffInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15 }}
            className="p-6 rounded-2xl mb-8"
            style={{
              background: "hsl(240 25% 7%)",
              border: `1px solid ${useCase.accentColor}20`,
            }}
          >
            <p className="text-sm text-foreground/80 leading-relaxed">{useCase.uniqueAngle}</p>
          </motion.div>

          {/* Comparison grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={diffInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25 }}
            className="p-6 rounded-2xl"
            style={{
              background: "hsl(240 25% 7%)",
              border: "1px solid hsl(var(--border) / 0.3)",
            }}
          >
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 pb-3 border-b border-border/30 text-xs font-mono tracking-widest text-muted-foreground/50">
              <div>CAPABILITY</div>
              <div>MANUAL</div>
              <div>ZAPIER / MAKE</div>
              <div className="text-primary">VALENCE AI</div>
            </div>
            <ComparisonRow
              label="Multi-agent coordination"
              manual="N/A"
              zapier="Single flow"
              valence="5 specialist agents"
            />
            <ComparisonRow
              label="Quality gates"
              manual="Self-review"
              zapier="None"
              valence="Sentinel reviews all"
            />
            <ComparisonRow
              label="Intelligence"
              manual="Human judgment"
              zapier="Rule-based"
              valence="AI reasoning"
            />
            <ComparisonRow
              label="Learning"
              manual="Tribal knowledge"
              zapier="No memory"
              valence="Improves over time"
            />
            <ComparisonRow
              label="Trigger to result"
              manual="Hours / days"
              zapier="Minutes (simple)"
              valence="Minutes (complex)"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Related Use Cases ── */}
      {relatedCases.length > 0 && (
        <section className="py-16 border-t border-border/20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-6">More use cases</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedCases.map((uc) => (
                <Link
                  key={uc.slug}
                  to={`/use-cases/${uc.slug}`}
                  className="group p-5 rounded-2xl transition-all hover:scale-[1.02]"
                  style={{
                    background: "hsl(240 25% 7%)",
                    border: `1px solid ${uc.accentColor}20`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{uc.icon}</span>
                    <span className="font-bold text-sm group-hover:text-primary transition-colors">
                      {uc.title}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground/60 mb-3">
                    {CATEGORY_ICONS[uc.category]} {CATEGORY_LABELS[uc.category]} · {uc.buyer}
                  </div>
                  <div className="text-xs text-muted-foreground/50 font-mono">
                    {uc.metric}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Section ── */}
      <section className="py-20 border-t border-border/20 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${useCase.accentColor.replace("hsl(", "hsla(").replace(")", ", 0.05)")} 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-3">
            Ready to {useCase.title.toLowerCase()}?
          </h2>
          <p className="text-muted-foreground mb-8">
            Deploy your autonomous AI workforce and start saving {useCase.hoursSaved.split("·")[0].trim()}.
          </p>
          <motion.button
            onClick={() => setPilotOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-base font-semibold px-8 py-3 rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${useCase.accentColor}, hsl(var(--primary)))`,
              color: "white",
            }}
          >
            Request Early Access →
          </motion.button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 border-t border-border/20">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground/40">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Valence AI" className="w-4 h-4 opacity-40" />
            <span>Valence AI</span>
          </div>
          <Link to="/landing" className="hover:text-foreground transition-colors">
            Back to home
          </Link>
        </div>
      </footer>
    </div>
  );
}
