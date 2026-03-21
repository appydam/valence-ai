import { useState } from "react";
import { Wand2, Save, Upload, FileText, Target, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { SeoScorecard } from "../components/SeoScorecard";

const PUBLISH_TARGETS = [
  { id: "notion", label: "Notion", icon: "📓" },
  { id: "wordpress", label: "WordPress", icon: "🌐" },
  { id: "medium", label: "Medium", icon: "✍️" },
];

interface SeoSuggestion {
  label: string;
  status: "good" | "warning" | "error";
  message: string;
}

function getSeoAnalysis(title: string, content: string, keyword: string): { score: number; suggestions: SeoSuggestion[] } {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const titleLength = title.length;
  const keywordInTitle = keyword && title.toLowerCase().includes(keyword.toLowerCase());
  const keywordDensity = keyword && wordCount > 0
    ? (content.toLowerCase().split(keyword.toLowerCase()).length - 1) / wordCount * 100
    : 0;

  const suggestions: SeoSuggestion[] = [
    {
      label: "Title Length",
      status: titleLength >= 40 && titleLength <= 65 ? "good" : titleLength > 0 ? "warning" : "error",
      message: titleLength === 0 ? "Add a title" : titleLength < 40 ? `Title is short (${titleLength} chars). Aim for 40-65.` : titleLength > 65 ? `Title is long (${titleLength} chars). Aim for 40-65.` : `Good title length (${titleLength} chars)`,
    },
    {
      label: "Content Length",
      status: wordCount >= 1500 ? "good" : wordCount >= 500 ? "warning" : "error",
      message: wordCount < 500 ? `Only ${wordCount} words. Aim for 1,500+.` : wordCount < 1500 ? `${wordCount} words. Good, but 1,500+ is better for SEO.` : `${wordCount} words. Great length for SEO.`,
    },
    {
      label: "Keyword in Title",
      status: keywordInTitle ? "good" : keyword ? "error" : "warning",
      message: !keyword ? "Set a target keyword" : keywordInTitle ? "Keyword found in title" : "Add your target keyword to the title",
    },
    {
      label: "Keyword Density",
      status: keywordDensity >= 0.5 && keywordDensity <= 2.5 ? "good" : keywordDensity > 0 ? "warning" : "error",
      message: !keyword ? "Set a target keyword" : keywordDensity === 0 ? "Keyword not found in content" : `${keywordDensity.toFixed(1)}% — ${keywordDensity < 0.5 ? "too low" : keywordDensity > 2.5 ? "too high" : "optimal"}`,
    },
    {
      label: "Readability",
      status: wordCount > 100 ? "good" : "warning",
      message: wordCount > 100 ? "Content is readable" : "Add more content for a readability assessment",
    },
  ];

  let score = 0;
  suggestions.forEach((s) => {
    if (s.status === "good") score += 20;
    else if (s.status === "warning") score += 10;
  });

  return { score, suggestions };
}

export function BlogWriter() {
  const { config } = useNiche();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [keyword, setKeyword] = useState("");
  const [publishTarget, setPublishTarget] = useState("notion");
  const [generating, setGenerating] = useState(false);

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const { score: seoScore, suggestions } = getSeoAnalysis(title, content, keyword);

  const handleAIWrite = () => {
    setGenerating(true);
    setTimeout(() => {
      setTitle("The Complete Guide to SEO in 2026: What Actually Works");
      setContent(`Search engine optimization has evolved dramatically. In 2026, the old playbook of keyword stuffing and backlink farming is not just ineffective — it's actively penalized.

In this comprehensive guide, we'll cover what actually works for SEO today, backed by data from analyzing over 10,000 top-ranking pages.

## 1. Search Intent is Everything

Google's AI now understands intent better than most marketers. Before writing a single word, ask yourself: what does someone searching this keyword actually want?

There are four types of search intent:
- **Informational**: "how to improve SEO" — they want to learn
- **Navigational**: "Google Search Console" — they want a specific page
- **Commercial**: "best SEO tools 2026" — they're researching options
- **Transactional**: "buy Ahrefs subscription" — they're ready to purchase

Match your content format to the intent. A listicle won't rank for a transactional keyword, and a product page won't rank for informational queries.

## 2. E-E-A-T: Experience Matters More Than Ever

Google's Quality Rater Guidelines now emphasize Experience alongside Expertise, Authoritativeness, and Trustworthiness. This means first-hand experience signals are critical.

How to demonstrate experience:
- Share original data and case studies
- Include screenshots and real examples
- Add author bios with relevant credentials
- Reference specific projects you've worked on

## 3. Content Depth Over Content Length

The myth of "longer is better" is dead. What matters is covering a topic comprehensively without fluff. A 1,500-word article that covers every angle will outrank a 5,000-word article padded with filler.

Focus on:
- Answering all related questions (check "People Also Ask")
- Including expert quotes and data
- Adding actionable takeaways in every section
- Using clear headings and scannable formatting

## 4. Technical SEO Fundamentals

No amount of great content will rank if your technical foundation is broken:
- Core Web Vitals: LCP under 2.5s, FID under 100ms, CLS under 0.1
- Mobile-first indexing: your mobile site IS your site
- Structured data: use schema markup for rich results
- Internal linking: connect related content systematically

## 5. AI-Powered Content Optimization

The smartest teams use AI not to write content, but to optimize it:
- Analyze top-ranking competitors for content gaps
- Generate outline suggestions based on SERP analysis
- A/B test meta descriptions for click-through rate
- Monitor keyword rankings and auto-suggest updates

## Key Takeaways

SEO in 2026 rewards authentic, experience-driven content that genuinely helps searchers. Focus on intent, demonstrate expertise, and nail the technical basics — the rankings will follow.`);
      setKeyword("SEO");
      setGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Blog Writer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Write SEO-optimized long-form content with AI assistance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left — Editor */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your blog post title..."
              className="w-full text-xl font-bold text-foreground bg-transparent placeholder:text-muted-foreground/50 focus:outline-none border-b border-border/50 pb-3"
            />

            {/* Content */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your blog post... Markdown is supported."
              rows={24}
              className="w-full px-1 py-2 text-sm text-foreground bg-transparent placeholder:text-muted-foreground/50 focus:outline-none resize-none leading-relaxed"
            />

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <span className="text-xs text-muted-foreground">
                {wordCount} words
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAIWrite}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-60"
                  style={{ background: config.accentColor }}
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Writing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      AI Write
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Publish Controls */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Publish To
                  </label>
                  <div className="flex items-center gap-2">
                    {PUBLISH_TARGETS.map((target) => (
                      <button
                        key={target.id}
                        onClick={() => setPublishTarget(target.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          publishTarget === target.id
                            ? "border-2 shadow-sm"
                            : "border-border text-muted-foreground hover:border-border/80"
                        }`}
                        style={
                          publishTarget === target.id
                            ? { borderColor: config.accentColor, background: `${config.accentColor}08` }
                            : undefined
                        }
                      >
                        <span>{target.icon}</span>
                        {target.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors">
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ background: config.accentColor }}
                >
                  <Upload className="w-4 h-4" />
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right — SEO Sidebar */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4" style={{ color: config.accentColor }} />
            SEO Analysis
          </h2>

          {/* Target Keyword */}
          <div className="rounded-xl border border-border bg-card p-4">
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Target Keyword
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., content marketing"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* SEO Score */}
          <SeoScorecard score={seoScore} />

          {/* Suggestions */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" style={{ color: config.accentColor }} />
              Suggestions
            </h3>
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.label}
                  className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-accent/20"
                >
                  {suggestion.status === "good" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                  ) : suggestion.status === "warning" ? (
                    <AlertCircle className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-medium text-foreground">{suggestion.label}</p>
                    <p className="text-[10px] text-muted-foreground">{suggestion.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
