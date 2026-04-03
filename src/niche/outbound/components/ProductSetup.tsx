import { useState } from "react";
import {
  Globe,
  Loader2,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Pencil,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useProductContext } from "../hooks/useProductContext";

export function ProductSetup() {
  const { config } = useNiche();
  const { context, isSetUp, updateContext } = useProductContext();
  const { triggerAgent, loading } = useAgentTrigger();
  const [url, setUrl] = useState(context.websiteUrl || "");
  const [extraContext, setExtraContext] = useState("");
  const [showExtra, setShowExtra] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    const cleanUrl = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`;

    setAnalyzing(true);
    updateContext({ websiteUrl: cleanUrl });

    // Create a task for Scout to analyze the website
    const result = await triggerAgent(
      "Scout",
      `Analyze product: ${cleanUrl}`,
      `DEEP PRODUCT INTELLIGENCE — AI Outbound Engine Setup

Target website: ${cleanUrl}
${extraContext ? `\nAdditional context from user: ${extraContext}` : ""}

PHASE 1 — RECURSIVE SITE CRAWL
Start at the homepage (${cleanUrl}). Use web_fetch to load it.

Then EXTRACT ALL internal links from the HTML (look for <a href="..."> where href starts with "/" or the same domain). Build a list of every internal page on the site.

Visit up to 15 of the most informative pages. Prioritize links whose URL or anchor text suggests:
- Product/feature info (anything with words like product, feature, solution, platform, how-it-works, use-case, etc.)
- Pricing or plans
- About the company/team
- Customer stories, testimonials, case studies, logos
- Competitive positioning (vs, compare, alternative, switch, migrate, why, better-than)
- Integrations, partners, ecosystem
- Careers/jobs (reveals team size, tech stack, growth)
- Blog/resources (first 2-3 for brand voice)
- Docs/API (developer-focused signals)

DO NOT hardcode paths. Every website has different URL structures. Read the actual links on each page and follow the interesting ones. Think like a researcher exploring a product for the first time.

PHASE 2 — EXTERNAL INTELLIGENCE
After crawling the site, search externally:
- Google: "[product name] vs" — competitor comparisons
- Google: "[product name] reviews" — G2, Capterra, TrustRadius ratings
- Google: "[product name] alternatives" — competitor lists
- Crunchbase: company profile — funding, team size, founded date
- LinkedIn company page if findable via Google

PHASE 3 — SYNTHESIZE
From everything you found, extract this JSON:

{
  "productName": "exact product name",
  "description": "2-3 sentence description of what the product does and who it's for",
  "icp": "detailed ideal customer profile — job titles that buy, company size range, industries, pain points they solve",
  "competitors": ["competitor1", "competitor2", "competitor3", "competitor4", "competitor5"],
  "differentiators": ["specific differentiator 1 with evidence", "specific differentiator 2 with evidence", "specific differentiator 3"],
  "pricing": "pricing model summary (free tier? per seat? usage-based?)",
  "techStack": "any tech stack signals (what they're built with, what they integrate with)",
  "companySize": "estimated team size from careers/LinkedIn",
  "fundingStage": "if found on Crunchbase",
  "keyCustomers": ["notable customer 1", "notable customer 2"],
  "brandVoice": "how they write — formal/casual, technical/simple, enterprise/startup",
  "painPointsSolved": ["pain point 1 from their copy", "pain point 2", "pain point 3"]
}

Be thorough. This data powers the ENTIRE outbound engine — competitor displacement, cold outreach personalization, ICP targeting, email voice. The more intelligence you gather, the better every campaign will perform.

IMPORTANT: Post results via POST /api/tasks/complete. The JSON must be valid.`,
      ["niche:outbound", "product-setup"],
      { priority: "urgent" }
    );

    // For now, set basic info — agent will enrich async
    updateContext({
      websiteUrl: cleanUrl,
      productName: new URL(cleanUrl).hostname.replace("www.", "").split(".")[0],
      extraContext: extraContext,
    });

    setAnalyzing(false);
  };

  // Compact view when already set up
  if (isSetUp && !editing) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/30 bg-card/50">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${config.accentColor}15` }}
        >
          <Globe className="w-4 h-4" style={{ color: config.accentColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">
              {context.productName || context.websiteUrl}
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
          </div>
          {context.description && (
            <p className="text-[10px] text-muted-foreground truncate">{context.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {context.competitors.length > 0 && (
              <span className="text-[10px] text-muted-foreground/50">
                vs {context.competitors.slice(0, 3).join(", ")}
              </span>
            )}
            {context.icp && (
              <>
                <span className="text-[10px] text-muted-foreground/20">·</span>
                <span className="text-[10px] text-muted-foreground/50 truncate">ICP: {context.icp}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg hover:bg-accent/30 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5 text-muted-foreground/50" />
        </button>
      </div>
    );
  }

  // Edit/setup view
  return (
    <div className="rounded-2xl border-2 border-dashed border-border/40 bg-card/30 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: config.accentColor }} />
          <h3 className="text-sm font-semibold text-foreground">
            {isSetUp ? "Update your product" : "Set up your product"}
          </h3>
        </div>
        {isSetUp && (
          <button onClick={() => setEditing(false)} className="p-1 rounded hover:bg-accent/30">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Enter your website — we'll auto-detect your product, competitors, and ideal customer. Every page uses this context automatically.
      </p>

      {/* URL input */}
      <div
        className="rounded-xl border bg-card flex items-center gap-2 px-4 py-3"
        style={{ borderColor: url ? config.accentColor : "hsl(0,0%,18%)" }}
      >
        <Globe className="w-4 h-4 shrink-0 text-muted-foreground/40" />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          placeholder="yourproduct.com"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
        />
      </div>

      {/* Optional extra context */}
      <button
        onClick={() => setShowExtra(!showExtra)}
        className="flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        {showExtra ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        Add more context (optional)
      </button>

      {showExtra && (
        <textarea
          value={extraContext}
          onChange={(e) => setExtraContext(e.target.value)}
          placeholder="e.g., We sell to mid-market SaaS companies. Our main competitor is Outreach. We're cheaper and have better AI..."
          className="w-full h-20 px-3 py-2 rounded-xl border border-border/50 bg-card text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none resize-none"
        />
      )}

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!url.trim() || analyzing || loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-30"
        style={{ background: config.accentColor }}
      >
        {analyzing || loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing your product...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {isSetUp ? "Re-analyze" : "Analyze & Set Up"}
          </>
        )}
      </button>
    </div>
  );
}
