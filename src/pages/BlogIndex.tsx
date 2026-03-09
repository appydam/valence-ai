import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, Tag, ArrowRight } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { PilotModal } from "@/components/landing/PilotModal";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getBlogManifest, type PostMeta } from "@/lib/content";
import { organizationSchema, webPageSchema } from "@/lib/structuredData";

const CATEGORIES = ["all", "guides", "explainers", "comparisons", "use-cases", "technical", "analysis"];
const CATEGORY_LABELS: Record<string, string> = {
  all: "All Posts",
  guides: "Guides",
  explainers: "Explainers",
  comparisons: "Comparisons",
  "use-cases": "Use Cases",
  technical: "Technical",
  analysis: "Analysis",
};

function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col gap-3 p-5 rounded-xl border border-border/30 hover:border-border/60 transition-all"
      style={{ background: "hsl(240 20% 5% / 0.5)" }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        {post.category && (
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full text-blue-400/80 bg-blue-400/10 border border-blue-400/20">
            {CATEGORY_LABELS[post.category] || post.category}
          </span>
        )}
        {post.readTime && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50 font-mono">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
        )}
      </div>
      <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
        {post.title}
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
        {post.description}
      </p>
      {post.tags && post.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tag className="w-3 h-3 text-muted-foreground/40" />
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] text-muted-foreground/50 font-mono">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1 text-xs text-primary/60 group-hover:text-primary transition-colors mt-1">
        Read article <ArrowRight className="w-3 h-3" />
      </div>
    </Link>
  );
}

export default function BlogIndex() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [pilotOpen, setPilotOpen] = useState(false);

  useEffect(() => {
    getBlogManifest().then(setPosts);
  }, []);

  const filtered = posts.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags?.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Blog — Autonomous AI, AI Agents, and Enterprise AI Workforce | Valence AI"
        description="In-depth guides, comparisons, and analysis on autonomous AI, AI agents, AI employees, and enterprise AI workforce strategies. Written by the Valence AI team."
        canonical="/blog"
        jsonLd={[
          organizationSchema(),
          webPageSchema({
            title: "Valence AI Blog — Autonomous AI & Enterprise AI Workforce",
            description: "Guides, comparisons, and analysis on autonomous AI agents and enterprise AI workforce deployment.",
            url: "/blog",
          }),
        ]}
      />
      <PilotModal open={pilotOpen} onClose={() => setPilotOpen(false)} />
      <LandingNav onPilotClick={() => setPilotOpen(true)} />

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <Breadcrumbs items={[{ name: "Home", href: "/landing" }, { name: "Blog" }]} />

        <div className="mt-6 mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Autonomous AI & Enterprise AI Workforce
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
            In-depth guides on AI agents, AI employees, autonomous AI workforces, and enterprise AI deployment. Written by the Valence AI team.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <input
            type="text"
            placeholder="Search articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/40 bg-card/30 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/80 transition-colors"
          />
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground/60 hover:text-foreground border border-border/30 hover:border-border/60"
              }`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        {/* Post grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No articles found. <button onClick={() => { setQuery(""); setActiveCategory("all"); }} className="text-primary hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div
          className="mt-16 rounded-2xl border border-blue-500/20 p-8 text-center"
          style={{ background: "linear-gradient(135deg, hsla(217, 91%, 60%, 0.05) 0%, hsla(258, 90%, 66%, 0.05) 100%)" }}
        >
          <h3 className="text-lg font-bold text-foreground mb-2">Ready to deploy your AI workforce?</h3>
          <p className="text-sm text-muted-foreground mb-5">Join teams saving 40+ hours per week with autonomous AI agents.</p>
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
