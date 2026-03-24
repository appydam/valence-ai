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
  Zap,
  Target,
  BarChart3,
  Plug,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useCampaignData } from "../hooks/useCampaignData";
import { ExecutionStream } from "../components/ExecutionStream";
import { LiveDataPanel } from "../components/LiveDataPanel";
import { InsightCard } from "../components/InsightCard";
import { useSimulation } from "../simulation/SimulationContext";
import { SimulatedExecutionStream } from "../simulation/SimulatedExecutionStream";
import { useAutoTypePrompt } from "../simulation/useAutoTypePrompt";
import { useUserTasks } from "@/hooks/useUserScoped";

const SUGGESTION_CHIPS = [
  "Create a search campaign for my product",
  "Show me my top performing ads",
  "Why is my CPA increasing?",
  "Optimize my budget allocation",
  "Pause underperforming campaigns",
  "Generate ad copy variants for testing",
  "Research competitor ad strategies",
  "What keywords should I add?",
];

export function AdsWorkspace() {
  const { config } = useNiche();
  const { isSimulating } = useSimulation();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { campaigns, stats, isLive, hasConnections } = useCampaignData();

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  // Auto-detect active ads tasks on mount
  const tasks = useUserTasks();
  const adsTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) => t.tags?.includes("niche:ads")
  );
  const latestActive = adsTasks.find(
    (t: { status: string }) => t.status === "in_progress" || t.status === "assigned"
  );

  useEffect(() => {
    if (latestActive && !activeTaskId) {
      setActiveTaskId(latestActive._id);
    }
  }, [latestActive, activeTaskId]);

  // Prompt submission
  const handleSubmit = async () => {
    if (!prompt.trim() || agentLoading) return;
    const text = prompt.trim();
    setPrompt("");

    const title = text.length > 80 ? text.slice(0, 80) + "..." : text;
    const description = `User request from AI Ad Manager:\n\n"${text}"\n\nContext: ${campaigns.length} campaigns. ${isLive ? "Live data available." : "Platforms not connected."}\n\nBreak into tasks for Scout (research), Ghost (creative), Forge (technical).`;

    const result = await triggerAgent("Kaze", title, description, ["niche:ads", "workspace"], {
      priority: "high",
    });
    if (result.success && result.taskId) {
      setActiveTaskId(result.taskId);
    }
  };

  // ─── SIMULATION: Auto-type prompt flow ───
  const { displayText, fullText, isTyping, isTypingDone, isSubmitted } = useAutoTypePrompt(isSimulating);

  // Transition to stream after prompt is "submitted"
  useEffect(() => {
    if (isSimulating && isSubmitted && activeTaskId !== "sim-task-demo") {
      setActiveTaskId("sim-task-demo");
    }
    if (!isSimulating && activeTaskId === "sim-task-demo") {
      setActiveTaskId(null);
    }
  }, [isSimulating, isSubmitted]);

  const isIdle = !activeTaskId;

  // Show the typing phase (idle view with auto-typing prompt)
  const isSimTypingPhase = isSimulating && !isSubmitted;

  // Compute insights for idle state
  const highRoas = campaigns.filter((c) => c.roas >= 3);
  const lowRoas = campaigns.filter((c) => c.roas > 0 && c.roas < 2);
  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const pausedCampaigns = campaigns.filter((c) => c.status === "paused");

  const insightCards = [];
  if (highRoas.length > 0) {
    insightCards.push({
      icon: TrendingUp,
      color: "#22c55e",
      bg: "rgba(34,197,94,0.1)",
      text: `${highRoas.length} campaign${highRoas.length > 1 ? "s" : ""} above 3x ROAS — scale budget to capitalize`,
      action: "Click to scale",
      prompt: `Scale budget for my ${highRoas.length} campaigns with ROAS above 3x`,
    });
  }
  if (lowRoas.length > 0) {
    insightCards.push({
      icon: AlertTriangle,
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
      text: `${lowRoas.length} campaign${lowRoas.length > 1 ? "s" : ""} below 2x ROAS — analyze and fix`,
      action: "Click to analyze",
      prompt: `Analyze and fix ${lowRoas.length} underperforming campaigns with ROAS below 2x`,
    });
  }
  if (activeCampaigns.length > 0 && stats.totalSpend > 0) {
    insightCards.push({
      icon: BarChart3,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.1)",
      text: `$${stats.totalSpend.toLocaleString()} total spend across ${activeCampaigns.length} active campaigns`,
      action: "Get full report",
      prompt: `Generate a full performance report for my ${activeCampaigns.length} active campaigns`,
    });
  }
  if (pausedCampaigns.length > 0) {
    insightCards.push({
      icon: Target,
      color: "#a855f7",
      bg: "rgba(168,85,247,0.1)",
      text: `${pausedCampaigns.length} paused campaign${pausedCampaigns.length > 1 ? "s" : ""} — check if any should be reactivated`,
      action: "Click to review",
      prompt: `Review my ${pausedCampaigns.length} paused campaigns and suggest which to reactivate`,
    });
  }
  if (!hasConnections && !isSimulating) {
    insightCards.push({
      icon: Zap,
      color: config.accentColor,
      bg: `${config.accentColor}1A`,
      text: "Connect Google Ads or Meta Ads to unlock live campaign data and AI-powered optimization",
      action: "Connect now",
      prompt: "",
    });
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ─── PROMPT BAR ─── */}
      {(isIdle || isSimTypingPhase) ? (
        /* Idle: centered, large prompt */
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-2xl">
            {/* Greeting */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-1.5">
                What would you like to do?
              </h1>
              <p className="text-sm text-muted-foreground/50">
                Your AI ad team is ready. Describe what you need and agents will handle the rest.
              </p>
            </div>

            {/* Prompt Input */}
            <div
              className="rounded-2xl border-2 bg-card shadow-lg transition-all focus-within:shadow-xl"
              style={{ borderColor: (prompt || isSimTypingPhase) ? config.accentColor : "hsl(0,0%,15%)" }}
            >
              <div className="flex items-center gap-3 px-5 py-4">
                <Sparkles className="w-5 h-5 shrink-0" style={{ color: config.accentColor }} />
                {isSimTypingPhase ? (
                  /* Simulated typing display */
                  <div className="flex-1 text-base text-foreground min-h-[24px]">
                    {displayText}
                    {isTyping && !isTypingDone && (
                      <span className="inline-block w-0.5 h-5 bg-foreground ml-0.5 animate-pulse align-text-bottom" />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Tell your AI ad team what you need..."
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/40 focus:outline-none text-base"
                    autoFocus
                  />
                )}
                <button
                  onClick={isSimTypingPhase ? undefined : handleSubmit}
                  disabled={isSimTypingPhase ? !isTypingDone : (!prompt.trim() || agentLoading)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-white transition-all disabled:opacity-30"
                  style={{ background: config.accentColor }}
                >
                  {(agentLoading || (isSimTypingPhase && isTypingDone)) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              {isSimTypingPhase && isTypingDone && (
                <div
                  className="flex items-center gap-2 px-5 py-2 border-t"
                  style={{ borderColor: `${config.accentColor}20` }}
                >
                  <Brain
                    className="w-3.5 h-3.5 animate-pulse"
                    style={{ color: config.accentColor }}
                  />
                  <span className="text-xs" style={{ color: config.accentColor }}>
                    Assigning to agents...
                  </span>
                </div>
              )}
              {!isSimTypingPhase && agentLoading && (
                <div
                  className="flex items-center gap-2 px-5 py-2 border-t"
                  style={{ borderColor: `${config.accentColor}20` }}
                >
                  <Brain
                    className="w-3.5 h-3.5 animate-pulse"
                    style={{ color: config.accentColor }}
                  />
                  <span className="text-xs" style={{ color: config.accentColor }}>
                    Assigning to agents...
                  </span>
                </div>
              )}
            </div>

            {/* Suggestion chips — hide during sim typing */}
            {!prompt && !isSimTypingPhase && (
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

            {/* Insight cards */}
            {insightCards.length > 0 && !isSimTypingPhase && (
              <div className="mt-8 space-y-2">
                {insightCards.slice(0, 4).map((card, idx) =>
                  card.prompt === "" ? (
                    <Link
                      key={idx}
                      to="/integrations"
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-dashed border-border/40 bg-card hover:border-border/50 hover:bg-accent/10 transition-all text-left"
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: card.bg }}
                      >
                        <Plug className="w-4 h-4" style={{ color: card.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground/80 leading-snug">{card.text}</p>
                        <p className="text-[10px] text-muted-foreground/40 mt-0.5">{card.action}</p>
                      </div>
                    </Link>
                  ) : (
                    <InsightCard
                      key={idx}
                      icon={card.icon}
                      color={card.color}
                      bg={card.bg}
                      text={card.text}
                      action={card.action}
                      onClick={() => setPrompt(card.prompt)}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Active: prompt bar at top + split layout */
        <>
          {/* Sticky top prompt bar — show the submitted prompt text during sim */}
          <div className="shrink-0 border-b border-border/30 bg-card/80 backdrop-blur-sm px-4 py-2.5">
            <div className="max-w-4xl mx-auto">
              <div
                className="rounded-xl border bg-card transition-all focus-within:shadow-md flex items-center gap-2 px-3 py-2"
                style={{ borderColor: isSimulating ? `${config.accentColor}40` : (prompt ? config.accentColor : "hsl(0,0%,18%)") }}
              >
                <Sparkles className="w-4 h-4 shrink-0" style={{ color: config.accentColor }} />
                {isSimulating ? (
                  <span className="flex-1 text-sm text-foreground/50 truncate">{fullText}</span>
                ) : (
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Ask a follow-up or start a new task..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                  />
                )}
                <button
                  onClick={isSimulating ? undefined : handleSubmit}
                  disabled={isSimulating || !prompt.trim() || agentLoading}
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-white transition-all disabled:opacity-30"
                  style={{ background: config.accentColor }}
                >
                  {agentLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Split layout: Stream (2/3) + Data Panel (1/3) */}
          <div className="flex-1 flex overflow-hidden">
            {/* Execution Stream */}
            <div className="flex-1 lg:w-2/3 border-r border-border/20 overflow-hidden flex flex-col">
              {isSimulating && activeTaskId === "sim-task-demo" ? (
                <SimulatedExecutionStream />
              ) : (
                <ExecutionStream
                  taskId={activeTaskId}
                  onRetry={(text) => setPrompt(text)}
                />
              )}
            </div>

            {/* Live Data Panel */}
            <div className="hidden lg:flex lg:w-1/3 flex-col overflow-hidden">
              <LiveDataPanel />
            </div>
          </div>
        </>
      )}

      {/* Global CSS for fadeIn animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
