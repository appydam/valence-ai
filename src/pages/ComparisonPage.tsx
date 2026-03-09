import { useEffect, useState, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { PilotModal } from "@/components/landing/PilotModal";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { TableOfContents } from "@/components/seo/TableOfContents";
import { RelatedContent, type RelatedItem } from "@/components/seo/RelatedContent";
import { loadComparison, type PostMeta } from "@/lib/content";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/structuredData";

// Same prose styles as BlogPost
const proseStyles = `
  .prose h1 { font-size: 1.875rem; font-weight: 700; margin-bottom: 1rem; color: hsl(var(--foreground)); }
  .prose h2 { font-size: 1.375rem; font-weight: 600; margin-top: 2.5rem; margin-bottom: 0.75rem; color: hsl(var(--foreground)); padding-bottom: 0.5rem; border-bottom: 1px solid hsl(var(--border) / 0.3); }
  .prose h3 { font-size: 1.125rem; font-weight: 600; margin-top: 1.75rem; margin-bottom: 0.5rem; color: hsl(var(--foreground) / 0.9); }
  .prose p { margin-bottom: 1.25rem; line-height: 1.75; color: hsl(var(--muted-foreground)); }
  .prose ul, .prose ol { margin-bottom: 1.25rem; padding-left: 1.5rem; color: hsl(var(--muted-foreground)); }
  .prose li { margin-bottom: 0.4rem; line-height: 1.7; }
  .prose ul li { list-style-type: disc; }
  .prose ol li { list-style-type: decimal; }
  .prose strong { color: hsl(var(--foreground) / 0.9); font-weight: 600; }
  .prose a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 3px; }
  .prose a:hover { color: hsl(var(--primary) / 0.8); }
  .prose blockquote { border-left: 3px solid hsl(var(--primary) / 0.5); padding-left: 1.25rem; margin: 1.5rem 0; font-style: italic; color: hsl(var(--muted-foreground) / 0.8); }
  .prose table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.875rem; }
  .prose th { text-align: left; padding: 0.75rem 1rem; background: hsl(var(--card) / 0.5); border-bottom: 2px solid hsl(var(--border) / 0.4); font-weight: 600; color: hsl(var(--foreground)); }
  .prose td { padding: 0.625rem 1rem; border-bottom: 1px solid hsl(var(--border) / 0.2); color: hsl(var(--muted-foreground)); }
  .prose tr:hover td { background: hsl(var(--card) / 0.3); }
  .prose code { font-family: monospace; font-size: 0.85em; background: hsl(var(--card) / 0.6); border: 1px solid hsl(var(--border) / 0.4); padding: 0.15em 0.4em; border-radius: 4px; color: hsl(var(--foreground) / 0.85); }
  .prose pre { background: hsl(240 25% 6%); border: 1px solid hsl(var(--border) / 0.4); border-radius: 12px; padding: 1.25rem; overflow-x: auto; margin-bottom: 1.5rem; }
  .prose pre code { background: none; border: none; padding: 0; }
  .prose hr { border: none; border-top: 1px solid hsl(var(--border) / 0.3); margin: 2.5rem 0; }
  .prose h2 a, .prose h3 a { text-decoration: none; color: inherit; }
`;

const ALL_COMPARISONS: RelatedItem[] = [
  { title: "Valence AI vs Lindy AI", href: "/compare/valence-vs-lindy", label: "Comparison" },
  { title: "Valence AI vs Zapier", href: "/compare/valence-vs-zapier", label: "Comparison" },
  { title: "Valence AI vs Make", href: "/compare/valence-vs-make", label: "Comparison" },
  { title: "Valence AI vs CrewAI", href: "/compare/valence-vs-crewai", label: "Comparison" },
  { title: "Valence AI vs AutoGPT", href: "/compare/valence-vs-autogpt", label: "Comparison" },
  { title: "Valence AI vs Perplexity Computer", href: "/compare/valence-vs-perplexity-computer", label: "Comparison" },
  { title: "Valence AI vs Salesforce Agentforce", href: "/compare/valence-vs-salesforce-agentforce", label: "Comparison" },
  { title: "Valence AI vs Devin", href: "/compare/valence-vs-devin", label: "Comparison" },
];

export default function ComparisonPage() {
  const { slug } = useParams<{ slug: string }>();
  const [pilotOpen, setPilotOpen] = useState(false);
  const [MDXContent, setMDXContent] = useState<React.ComponentType | null>(null);
  const [meta, setMeta] = useState<PostMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    loadComparison(slug).then((mod) => {
      if (!mod) { setNotFound(true); setLoading(false); return; }
      setMDXContent(() => mod.default);
      setMeta(mod.frontmatter);
      setLoading(false);
    });
  }, [slug]);

  const relatedComparisons = ALL_COMPARISONS.filter((c) => !c.href.endsWith(slug || "")).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><LandingNav onPilotClick={() => {}} />
        <div className="max-w-3xl mx-auto px-6 pt-28"><div className="animate-pulse space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-muted/20 rounded" />)}</div></div>
      </div>
    );
  }

  if (notFound || !MDXContent || !meta) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <LandingNav onPilotClick={() => {}} />
        <div className="max-w-3xl mx-auto px-6 pt-28 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-3">Comparison not found</h1>
          <Link to="/blog" className="text-primary hover:underline">← Back to blog</Link>
        </div>
      </div>
    );
  }

  const articleJsonLd = articleSchema({
    title: meta.title,
    description: meta.description,
    url: `/compare/${meta.slug}`,
    datePublished: meta.date,
    dateModified: meta.modified || meta.date,
    author: meta.author,
  });

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", url: "/landing" },
    { name: "Blog", url: "/blog" },
    { name: "Comparisons", url: "/blog?category=comparisons" },
    { name: meta.title, url: `/compare/${meta.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{proseStyles}</style>
      <SEOHead
        title={meta.title}
        description={meta.description}
        canonical={`/compare/${meta.slug}`}
        ogType="article"
        datePublished={meta.date}
        dateModified={meta.modified || meta.date}
        jsonLd={[articleJsonLd, breadcrumbJsonLd]}
      />
      <PilotModal open={pilotOpen} onClose={() => setPilotOpen(false)} />
      <LandingNav onPilotClick={() => setPilotOpen(true)} />

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        <div className="flex gap-12">
          <article className="flex-1 min-w-0">
            <Breadcrumbs items={[
              { name: "Home", href: "/landing" },
              { name: "Blog", href: "/blog" },
              { name: "Comparisons", href: "/blog" },
              { name: meta.title },
            ]} />

            <header className="mt-6 mb-8">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full text-purple-400/80 bg-purple-400/10 border border-purple-400/20 mb-4 inline-block">
                Comparison
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-4">
                {meta.title}
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">{meta.description}</p>
              <div className="mt-4 pt-4 border-t border-border/30">
                <span className="text-xs text-muted-foreground/50">
                  By <span className="text-muted-foreground/80">{meta.author || "Arpit Dhamija"}</span> · Valence AI ·{" "}
                  {new Date(meta.date).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                </span>
              </div>
            </header>

            <div className="prose">
              <Suspense fallback={<div className="animate-pulse space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-muted/20 rounded" />)}</div>}>
                <MDXContent />
              </Suspense>
            </div>

            <RelatedContent items={relatedComparisons} heading="More Comparisons" />

            <div className="mt-10 rounded-2xl border border-purple-500/20 p-7 text-center" style={{ background: "linear-gradient(135deg, hsla(258, 90%, 66%, 0.05) 0%, hsla(217, 91%, 60%, 0.05) 100%)" }}>
              <h3 className="text-base font-bold text-foreground mb-2">Try Valence AI yourself</h3>
              <p className="text-sm text-muted-foreground mb-4">See why teams choose Valence AI over every alternative on this list.</p>
              <button onClick={() => setPilotOpen(true)} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                Start a Pilot →
              </button>
            </div>
          </article>

          <aside className="w-56 flex-shrink-0">
            <TableOfContents contentSelector=".prose" />
          </aside>
        </div>
      </div>
    </div>
  );
}
