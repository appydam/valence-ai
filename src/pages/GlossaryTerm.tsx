import { useEffect, useState, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { LandingNav } from "@/components/landing/LandingNav";
import { PilotModal } from "@/components/landing/PilotModal";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { RelatedContent } from "@/components/seo/RelatedContent";
import { loadGlossaryTerm, type PostMeta } from "@/lib/content";
import { definedTermSchema, breadcrumbSchema } from "@/lib/structuredData";

const proseStyles = `
  .prose h2 { font-size: 1.25rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.625rem; color: hsl(var(--foreground)); padding-bottom: 0.5rem; border-bottom: 1px solid hsl(var(--border) / 0.3); }
  .prose h3 { font-size: 1.05rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; color: hsl(var(--foreground) / 0.9); }
  .prose p { margin-bottom: 1.25rem; line-height: 1.75; color: hsl(var(--muted-foreground)); }
  .prose ul, .prose ol { margin-bottom: 1.25rem; padding-left: 1.5rem; color: hsl(var(--muted-foreground)); }
  .prose li { margin-bottom: 0.4rem; line-height: 1.7; }
  .prose ul li { list-style-type: disc; }
  .prose ol li { list-style-type: decimal; }
  .prose strong { color: hsl(var(--foreground) / 0.9); font-weight: 600; }
  .prose a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 3px; }
  .prose blockquote { border-left: 3px solid hsl(var(--primary) / 0.5); padding-left: 1.25rem; margin: 1.5rem 0; font-style: italic; color: hsl(var(--muted-foreground) / 0.8); }
  .prose table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.875rem; }
  .prose th { text-align: left; padding: 0.625rem 0.875rem; background: hsl(var(--card) / 0.5); border-bottom: 2px solid hsl(var(--border) / 0.4); font-weight: 600; color: hsl(var(--foreground)); }
  .prose td { padding: 0.5rem 0.875rem; border-bottom: 1px solid hsl(var(--border) / 0.2); color: hsl(var(--muted-foreground)); }
  .prose h2 a, .prose h3 a { text-decoration: none; color: inherit; }
`;

export default function GlossaryTerm() {
  const { term } = useParams<{ term: string }>();
  const [pilotOpen, setPilotOpen] = useState(false);
  const [MDXContent, setMDXContent] = useState<React.ComponentType | null>(null);
  const [meta, setMeta] = useState<PostMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!term) return;
    setLoading(true);
    loadGlossaryTerm(term).then((mod) => {
      if (!mod) { setNotFound(true); setLoading(false); return; }
      setMDXContent(() => mod.default);
      setMeta(mod.frontmatter);
      setLoading(false);
    });
  }, [term]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><LandingNav onPilotClick={() => {}} />
        <div className="max-w-3xl mx-auto px-6 pt-28"><div className="animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-muted/20 rounded" />)}</div></div>
      </div>
    );
  }

  if (notFound || !MDXContent || !meta) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <LandingNav onPilotClick={() => {}} />
        <div className="max-w-3xl mx-auto px-6 pt-28 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-3">Term not found</h1>
          <Link to="/glossary" className="text-primary hover:underline">← Back to glossary</Link>
        </div>
      </div>
    );
  }

  const termJsonLd = definedTermSchema({
    name: meta.title,
    description: meta.description,
    url: `/glossary/${meta.slug}`,
  });

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", url: "/landing" },
    { name: "Glossary", url: "/glossary" },
    { name: meta.title, url: `/glossary/${meta.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{proseStyles}</style>
      <SEOHead
        title={`${meta.title} — Definition | Valence AI Glossary`}
        description={meta.description}
        canonical={`/glossary/${meta.slug}`}
        jsonLd={[termJsonLd, breadcrumbJsonLd]}
      />
      <PilotModal open={pilotOpen} onClose={() => setPilotOpen(false)} />
      <LandingNav onPilotClick={() => setPilotOpen(true)} />

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <Breadcrumbs items={[
          { name: "Home", href: "/landing" },
          { name: "Glossary", href: "/glossary" },
          { name: meta.title },
        ]} />

        <header className="mt-6 mb-8">
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full text-green-400/80 bg-green-400/10 border border-green-400/20 mb-4 inline-block">
            Definition
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-4">
            {meta.title}
          </h1>
          {/* Quick definition box — the snippet AI search will extract */}
          <div
            className="p-4 rounded-xl border border-primary/20"
            style={{ background: "hsla(217, 91%, 60%, 0.05)" }}
          >
            <p className="text-sm text-foreground/80 leading-relaxed font-medium">
              {meta.description}
            </p>
          </div>
        </header>

        <div className="prose">
          <Suspense fallback={<div className="animate-pulse space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-muted/20 rounded" />)}</div>}>
            <MDXContent />
          </Suspense>
        </div>

        <RelatedContent
          items={[
            { title: "Blog: Autonomous AI Workforce Guide", href: "/blog/autonomous-ai-workforce-guide", label: "Guide" },
            { title: "Back to Glossary", href: "/glossary", label: "Index" },
          ]}
          heading="More Resources"
        />
      </div>
    </div>
  );
}
