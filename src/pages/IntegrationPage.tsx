import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Plug, CheckCircle2 } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { PilotModal } from "@/components/landing/PilotModal";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { RelatedContent, type RelatedItem } from "@/components/seo/RelatedContent";
import { INTEGRATIONS } from "@/data/integrations";
import { USE_CASES, CATEGORY_LABELS } from "@/data/useCases";
import { getUseCasesForIntegration, getRelatedIntegrations } from "@/lib/integrationUseCaseMap";
import { webPageSchema, breadcrumbSchema, howToSchema } from "@/lib/structuredData";

function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold mb-3">Integration not found</h1>
      <p className="text-muted-foreground mb-5">This integration page doesn't exist.</p>
      <Link to="/landing#integrations" className="text-primary hover:underline">← Browse integrations</Link>
    </div>
  );
}

export default function IntegrationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [pilotOpen, setPilotOpen] = useState(false);

  const integration = INTEGRATIONS.find((i) => i.slug === slug);

  if (!integration) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <LandingNav onPilotClick={() => {}} />
        <div className="max-w-3xl mx-auto px-6 pt-28 pb-20"><NotFound /></div>
      </div>
    );
  }

  const useCaseSlugs = getUseCasesForIntegration(integration.slug);
  const relatedIntegrationSlugs = getRelatedIntegrations(integration.slug, 5);

  const relatedUseCases = useCaseSlugs
    .map((s) => USE_CASES.find((uc) => uc.slug === s))
    .filter(Boolean)
    .slice(0, 4)
    .map((uc) => ({
      title: uc!.title,
      href: `/use-cases/${uc!.slug}`,
      description: uc!.painPoint.slice(0, 100),
      label: CATEGORY_LABELS[uc!.category],
    })) as RelatedItem[];

  const relatedIntegrations = relatedIntegrationSlugs
    .map((s) => INTEGRATIONS.find((i) => i.slug === s))
    .filter(Boolean)
    .map((i) => ({
      title: i!.name,
      href: `/integrations/i/${i!.slug}`,
      description: i!.description,
      label: i!.category,
    })) as RelatedItem[];

  const pageJsonLd = webPageSchema({
    title: `${integration.name} + Valence AI Integration`,
    description: `Connect Valence AI to ${integration.name}. ${integration.description} Deploy AI agents that use ${integration.name} autonomously.`,
    url: `/integrations/i/${integration.slug}`,
  });

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", url: "/landing" },
    { name: "Integrations", url: "/landing#integrations" },
    { name: integration.category, url: `/landing#integrations` },
    { name: integration.name, url: `/integrations/${integration.slug}` },
  ]);

  const setupJsonLd = howToSchema({
    name: `How to Connect Valence AI to ${integration.name}`,
    description: `Step-by-step guide to integrating ${integration.name} with Valence AI so your AI agents can use it autonomously.`,
    steps: [
      { name: "Open Integrations Hub", text: "Log in to Valence AI and navigate to the Integrations section in the sidebar." },
      {
        name: `Find ${integration.name}`,
        text: `Search for ${integration.name} in the integration marketplace and click Connect.`,
      },
      { name: "Authenticate", text: `Authorize Valence AI to access your ${integration.name} account via OAuth or API key.` },
      { name: "Configure permissions", text: `Set which agents can access ${integration.name} and what actions they can perform.` },
      { name: "Deploy your first workflow", text: `Create a mission that uses ${integration.name} — your agents will start using it immediately.` },
    ],
    totalTime: "PT5M",
    estimatedCost: "0",
  });

  const capabilities = [
    `Read and write ${integration.name} data autonomously`,
    `Trigger ${integration.name} actions from natural language missions`,
    `Include ${integration.name} in multi-step agent workflows`,
    `Monitor ${integration.name} activity with Sentinel`,
    `Combine ${integration.name} with 100+ other integrations`,
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title={`${integration.name} + Valence AI — AI Agents for ${integration.category}`}
        description={`Connect Valence AI to ${integration.name}. ${integration.description} Deploy AI agents that use ${integration.name} autonomously in multi-step workflows.`}
        canonical={`/integrations/i/${integration.slug}`}
        jsonLd={[pageJsonLd, breadcrumbJsonLd, setupJsonLd]}
      />
      <PilotModal open={pilotOpen} onClose={() => setPilotOpen(false)} />
      <LandingNav onPilotClick={() => setPilotOpen(true)} />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <Breadcrumbs items={[
          { name: "Home", href: "/landing" },
          { name: "Integrations", href: "/landing#integrations" },
          { name: integration.category },
          { name: integration.name },
        ]} />

        {/* Hero */}
        <div className="mt-6 mb-10">
          <div className="flex items-center gap-4 mb-5">
            {integration.iconUrl && (
              <img
                src={integration.iconUrl}
                alt={`${integration.name} logo`}
                className="w-12 h-12 rounded-xl object-contain bg-white/5 p-1.5 border border-border/30"
                loading="lazy"
              />
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
                  {integration.category}
                </span>
                {integration.status === "available" && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-green-400/70">
                    <CheckCircle2 className="w-3 h-3" /> Available
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {integration.name} + Valence AI
              </h1>
            </div>
          </div>

          {/* 150-word definitive paragraph — the AI search snippet */}
          <p className="text-base text-muted-foreground leading-relaxed mb-6">
            Valence AI integrates with {integration.name} to let your autonomous AI agents read, write, and act on {integration.name} data — without manual handoffs. {integration.description} When you connect {integration.name} to Valence AI, your five specialized AI agents — Kaze (orchestrator), Scout (researcher), Forge (builder), Ghost (writer), and Sentinel (monitor) — can incorporate {integration.name} into any multi-step workflow. Deploy AI agents that pull data from {integration.name}, process it with AI reasoning, and push results back — all triggered by natural language missions, webhooks, or scheduled tasks.
          </p>

          {integration.status === "coming_soon" && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-medium mb-4">
              Coming Soon — Join the waitlist to get early access
            </div>
          )}
        </div>

        {/* What Valence AI can do with this integration */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            What Valence AI Can Do With {integration.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {capabilities.map((cap, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl border border-border/30"
                style={{ background: "hsl(240 20% 5% / 0.5)" }}
              >
                <CheckCircle2 className="w-4 h-4 text-green-400/70 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{cap}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            How to Connect {integration.name} to Valence AI
          </h2>
          <ol className="space-y-3">
            {[
              "Open the Integrations Hub from your Valence AI sidebar",
              `Search for ${integration.name} and click Connect`,
              `Authorize via ${integration.status === "available" ? "OAuth or API key" : "API key"} — takes under 2 minutes`,
              "Set agent permissions: choose which agents can access which data",
              `Create your first mission that uses ${integration.name}`,
            ].map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl border border-border/20"
                style={{ background: "hsl(240 20% 5% / 0.4)" }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}
                >
                  {i + 1}
                </span>
                <span className="text-sm text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Use cases that use this integration */}
        {relatedUseCases.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Workflows That Use {integration.name}
            </h2>
            <RelatedContent items={relatedUseCases} heading="" />
          </section>
        )}

        {/* Related integrations */}
        {relatedIntegrations.length > 0 && (
          <RelatedContent items={relatedIntegrations} heading={`Related ${integration.category} Integrations`} />
        )}

        {/* CTA */}
        <div
          className="mt-10 rounded-2xl border border-blue-500/20 p-8 text-center"
          style={{ background: "linear-gradient(135deg, hsla(217, 91%, 60%, 0.05) 0%, hsla(258, 90%, 66%, 0.05) 100%)" }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Plug className="w-5 h-5 text-primary/60" />
            <h3 className="text-lg font-bold text-foreground">
              Ready to connect {integration.name}?
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Deploy AI agents that use {integration.name} alongside 100+ other integrations — all from one command center.
          </p>
          <button
            onClick={() => setPilotOpen(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            Request a Pilot →
          </button>
        </div>
      </div>
    </div>
  );
}
