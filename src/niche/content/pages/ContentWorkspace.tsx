import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Sparkles,
  Send,
  Loader2,
  Brain,
  TrendingUp,
  AlertTriangle,
  Calendar,
  PenTool,
  Plug,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useContentMetrics } from "../hooks/useContentMetrics";
import { ExecutionStream } from "../../framework/components/ExecutionStream";
import { ContentDataPanel } from "../components/ContentDataPanel";
import { InsightCard } from "../../framework/components/InsightCard";
import { useUserTasks } from "@/hooks/useUserScoped";

const SUGGESTION_CHIPS = [
  "Write a Twitter thread about our product launch",
  "Create a week of social media posts",
  "Repurpose our latest blog into social content",
  "Research trending topics in our niche",
  "Generate ad copy variants for A/B testing",
  "Draft a newsletter for this week",
  "Analyze our content performance",
  "Build a brand voice guide from our content",
];

export function ContentWorkspace() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { metrics, isLive } = useContentMetrics();

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  const tasks = useUserTasks();
  const contentTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) => t.tags?.includes("niche:content")
  );
  const latestActive = contentTasks.find(
    (t: { status: string }) => t.status === "in_progress" || t.status === "assigned"
  );

  // Scheduled & completed counts
  const scheduledCount = contentTasks.filter(
    (t: { status: string }) => t.status === "assigned" || t.status === "in_progress"
  ).length;
  const completedThisWeek = contentTasks.filter((t: { status: string; _creationTime: number }) => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return t.status === "done" && t._creationTime > weekAgo;
  }).length;

  useEffect(() => {
    if (latestActive && !activeTaskId) {
      setActiveTaskId(latestActive._id);
    }
  }, [latestActive, activeTaskId]);

  const handleSubmit = async () => {
    if (!prompt.trim() || agentLoading) return;
    const text = prompt.trim();
    setPrompt("");

    const title = text.length > 80 ? text.slice(0, 80) + "..." : text;
    const description = `User request from AI Content Studio:\n\n"${text}"\n\nContext: ${scheduledCount} scheduled, ${completedThisWeek} completed this week. ${isLive ? "Live metrics available." : "Platforms not connected."}\n\nBreak into tasks for Scout (research/trends), Ghost (writing/creative), Forge (scheduling/publishing).`;

    const result = await triggerAgent("Kaze", title, description, ["niche:content", "workspace"], {
      priority: "high",
    });
    if (result.success && result.taskId) {
      setActiveTaskId(result.taskId);
    }
  };

  const isIdle = !activeTaskId;

  // Compute insight cards
  const insightCards: Array<{
    icon: typeof TrendingUp;
    color: string;
    bg: string;
    text: string;
    action: string;
    prompt: string;
  }> = [];

  if (metrics && metrics.engagementRate >= 5) {
    insightCards.push({
      icon: TrendingUp,
      color: "#22c55e",
      bg: "rgba(34,197,94,0.1)",
      text: `${metrics.engagementRate}% engagement rate — your audience is active. Double down with more content.`,
      action: "Generate content batch",
      prompt: "Create a batch of 5 social posts capitalizing on our high engagement rate",
    });
  }
  if (metrics && metrics.engagementRate > 0 && metrics.engagementRate < 3) {
    insightCards.push({
      icon: AlertTriangle,
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
      text: `${metrics.engagementRate}% engagement rate is below average — let's find what resonates`,
      action: "Analyze & improve",
      prompt: "Analyze our content performance and suggest what types of posts would improve engagement",
    });
  }
  if (completedThisWeek > 0) {
    insightCards.push({
      icon: BarChart3,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.1)",
      text: `${completedThisWeek} piece${completedThisWeek > 1 ? "s" : ""} published this week — get a performance report`,
      action: "Get content report",
      prompt: `Generate a performance report for the ${completedThisWeek} pieces published this week`,
    });
  }
  if (scheduledCount > 0) {
    insightCards.push({
      icon: Calendar,
      color: "#a855f7",
      bg: "rgba(168,85,247,0.1)",
      text: `${scheduledCount} item${scheduledCount > 1 ? "s" : ""} in the content pipeline`,
      action: "Review pipeline",
      prompt: `Review my ${scheduledCount} scheduled content items and suggest improvements`,
    });
  }
  if (!isLive) {
    insightCards.push({
      icon: PenTool,
      color: config.accentColor,
      bg: `${config.accentColor}1A`,
      text: "Connect Twitter/X, LinkedIn or Instagram to publish directly and track live engagement",
      action: "Connect now",
      prompt: "",
    });
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {isIdle ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-1.5">
                What would you like to create?
              </h1>
              <p className="text-sm text-muted-foreground/50">
                Your AI content team is ready. Describe what you need — writing, repurposing, research — agents handle the rest.
              </p>
            </div>

            <div
              className="rounded-2xl border-2 bg-card shadow-lg transition-all focus-within:shadow-xl"
              style={{ borderColor: prompt ? config.accentColor : "hsl(0,0%,15%)" }}
            >
              <div className="flex items-center gap-3 px-5 py-4">
                <Sparkles className="w-5 h-5 shrink-0" style={{ color: config.accentColor }} />
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Tell your AI content team what to create..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/40 focus:outline-none text-base"
                  autoFocus
                />
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || agentLoading}
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-white transition-all disabled:opacity-30"
                  style={{ background: config.accentColor }}
                >
                  {agentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              {agentLoading && (
                <div className="flex items-center gap-2 px-5 py-2 border-t" style={{ borderColor: `${config.accentColor}20` }}>
                  <Brain className="w-3.5 h-3.5 animate-pulse" style={{ color: config.accentColor }} />
                  <span className="text-xs" style={{ color: config.accentColor }}>Assigning to agents...</span>
                </div>
              )}
            </div>

            {!prompt && (
              <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
                {SUGGESTION_CHIPS.slice(0, 6).map((s) => (
                  <button
                    key={s}
                    onClick={() => setPrompt(s)}
                    className="px-3 py-1.5 rounded-full border border-border/40 text-[11px] text-muted-foreground/60 hover:text-foreground hover:border-border hover:bg-accent/20 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {insightCards.length > 0 && (
              <div className="mt-8 space-y-2">
                {insightCards.slice(0, 4).map((card, idx) =>
                  card.prompt === "" ? (
                    <Link
                      key={idx}
                      to="/integrations"
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-dashed border-border/40 bg-card hover:border-border/50 hover:bg-accent/10 transition-all text-left"
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: card.bg }}>
                        <Plug className="w-4 h-4" style={{ color: card.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground/80 leading-snug">{card.text}</p>
                        <p className="text-[10px] text-muted-foreground/40 mt-0.5">{card.action}</p>
                      </div>
                    </Link>
                  ) : (
                    <InsightCard key={idx} icon={card.icon} color={card.color} bg={card.bg} text={card.text} action={card.action} onClick={() => setPrompt(card.prompt)} />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="shrink-0 border-b border-border/30 bg-card/80 backdrop-blur-sm px-4 py-2.5">
            <div className="max-w-4xl mx-auto">
              <div
                className="rounded-xl border bg-card transition-all focus-within:shadow-md flex items-center gap-2 px-3 py-2"
                style={{ borderColor: prompt ? config.accentColor : "hsl(0,0%,18%)" }}
              >
                <Sparkles className="w-4 h-4 shrink-0" style={{ color: config.accentColor }} />
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Ask a follow-up or start a new task..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || agentLoading}
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-white transition-all disabled:opacity-30"
                  style={{ background: config.accentColor }}
                >
                  {agentLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 lg:w-2/3 border-r border-border/20 overflow-hidden flex flex-col">
              <ExecutionStream taskId={activeTaskId} onRetry={(text) => setPrompt(text)} />
            </div>
            <div className="hidden lg:flex lg:w-1/3 flex-col overflow-hidden">
              <ContentDataPanel />
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
