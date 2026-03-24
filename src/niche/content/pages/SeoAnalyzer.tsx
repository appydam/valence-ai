import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Search, Wand2, AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { SeoScorecard } from "../components/SeoScorecard";
import { useUserTasks } from "@/hooks/useUserScoped";

interface SeoCheck {
  id: string;
  category: string;
  metric: string;
  score: number;
  maxScore: number;
  currentValue: string;
  recommendation: string;
}

interface ActionItem {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  fixable: boolean;
}

function parseSeoResults(deliverable: string): { checks: SeoCheck[]; actions: ActionItem[] } {
  try {
    const parsed = JSON.parse(deliverable);
    const checks: SeoCheck[] = [];
    const actions: ActionItem[] = [];

    if (parsed.checks && Array.isArray(parsed.checks)) {
      for (const c of parsed.checks) {
        checks.push({
          id: c.id ?? c.metric?.toLowerCase().replace(/\s+/g, "-") ?? String(checks.length),
          category: c.category ?? "On-Page",
          metric: c.metric ?? "Unknown",
          score: c.score ?? 5,
          maxScore: c.maxScore ?? c.max_score ?? 10,
          currentValue: c.currentValue ?? c.current_value ?? "",
          recommendation: c.recommendation ?? "",
        });
      }
    }

    if (parsed.actions && Array.isArray(parsed.actions)) {
      for (const a of parsed.actions) {
        actions.push({
          id: a.id ?? String(actions.length),
          title: a.title ?? "",
          priority: a.priority ?? "medium",
          fixable: a.fixable ?? true,
        });
      }
    }

    return { checks, actions };
  } catch {
    return { checks: [], actions: [] };
  }
}

export function SeoAnalyzer() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [checks, setChecks] = useState<SeoCheck[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [taskId, setTaskId] = useState<string | undefined>(undefined);

  // Query completed SEO analysis tasks
  const tasks = useUserTasks();
  const seoTasks = (tasks ?? []).filter(
    (t: { tags?: string[]; status: string }) =>
      t.tags?.includes("niche:content") &&
      t.tags?.includes("seo-analysis") &&
      t.status === "done"
  );

  // Auto-populate from task result
  useEffect(() => {
    if (taskId && seoTasks.length > 0) {
      const matchingTask = seoTasks.find((t: { _id: string }) => t._id === taskId);
      if (matchingTask?.deliverable) {
        const { checks: parsedChecks, actions: parsedActions } = parseSeoResults(matchingTask.deliverable);
        if (parsedChecks.length > 0) {
          setChecks(parsedChecks);
          setActions(parsedActions);
          setAnalyzing(false);
        }
      }
    }
  }, [seoTasks, taskId]);

  const overallScore = checks.length > 0
    ? Math.round(
        checks.reduce((sum, c) => sum + c.score, 0) /
        checks.reduce((sum, c) => sum + c.maxScore, 0) * 100
      )
    : 0;

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setAnalyzing(true);
    setChecks([]);
    setActions([]);

    const result = await triggerAgent(
      "Scout",
      `SEO analysis for: ${url}`,
      `Analyze the SEO of this URL: ${url}

Return a JSON object with two arrays:

"checks": array of objects with:
- id, category (On-Page/Structure/Content/Links/Media/Technical), metric, score (0-10), maxScore (10), currentValue, recommendation

"actions": array of objects with:
- id, title (actionable fix description), priority (high/medium/low), fixable (boolean)

Analyze: title tag, meta description, headings structure, content length, keyword usage, internal links, image alt text, page speed, mobile-friendliness.`,
      ["niche:content", "seo-analysis"],
      { priority: "high" }
    );

    if (result.success && result.taskId) {
      setTaskId(result.taskId);
    }
  };

  const handleFixWithAI = async (action: ActionItem) => {
    await triggerAgent(
      "Ghost",
      `Fix SEO issue: ${action.title.slice(0, 50)}`,
      `Fix this SEO issue for the page ${url}:\n\n${action.title}\n\nProvide the exact fix/replacement text.`,
      ["niche:content", "seo-fix"],
      { priority: "high" }
    );
  };

  const getScoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 70) return "text-green-500";
    if (pct >= 40) return "text-yellow-500";
    return "text-red-400";
  };

  const getScoreIcon = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 70) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (pct >= 40) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-400";
      case "medium": return "bg-yellow-500/10 text-yellow-500";
      case "low": return "bg-blue-500/10 text-blue-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const hasResults = checks.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">SEO Analyzer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analyze and optimize any page for search engine performance
        </p>
      </div>

      {/* URL Input */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder="Enter a URL to analyze (e.g., https://yourblog.com/seo-guide)"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || agentLoading || !url.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
            style={{ background: config.accentColor }}
          >
            {analyzing || agentLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Analyze
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analyzing state */}
      {(analyzing || agentLoading) && !hasResults && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Scout is analyzing the SEO of this page...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Results will appear automatically when complete.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!hasResults && !analyzing && !agentLoading && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Enter a URL to analyze its SEO</p>
          <p className="text-xs text-muted-foreground">
            Scout will check title tags, meta descriptions, content structure, internal links, and more.
          </p>
        </div>
      )}

      {hasResults && (
        <>
          {/* Overall Score */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center justify-center">
              <SeoScorecard score={overallScore} />
            </div>

            {/* Summary Stats */}
            <div className="lg:col-span-3 grid grid-cols-4 gap-3">
              {[
                { label: "Passed", count: checks.filter((c) => c.score / c.maxScore >= 0.7).length, color: "text-green-500" },
                { label: "Warnings", count: checks.filter((c) => c.score / c.maxScore >= 0.4 && c.score / c.maxScore < 0.7).length, color: "text-yellow-500" },
                { label: "Failed", count: checks.filter((c) => c.score / c.maxScore < 0.4).length, color: "text-red-400" },
                { label: "Total Checks", count: checks.length, color: "text-foreground" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl border border-border bg-card text-center"
                >
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Checks */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Detailed Breakdown</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {checks.map((check) => (
                <div
                  key={check.id}
                  className="rounded-xl border border-border bg-card p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getScoreIcon(check.score, check.maxScore)}
                      <span className="text-sm font-medium text-foreground">{check.metric}</span>
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(check.score, check.maxScore)}`}>
                      {check.score}/{check.maxScore}
                    </span>
                  </div>
                  {check.currentValue && (
                    <p className="text-xs text-muted-foreground">
                      Current: <span className="text-foreground">{check.currentValue}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{check.recommendation}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/30 text-muted-foreground">
                      {check.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          {actions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Action Items</h2>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="divide-y divide-border/30">
                  {actions.map((action) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between px-5 py-3 hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase ${getPriorityColor(action.priority)}`}>
                          {action.priority}
                        </span>
                        <span className="text-sm text-foreground">{action.title}</span>
                      </div>
                      {action.fixable && (
                        <button
                          onClick={() => handleFixWithAI(action)}
                          disabled={agentLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
                        >
                          <Wand2 className="w-3 h-3" />
                          Fix with AI
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
