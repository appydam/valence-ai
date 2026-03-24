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
  Users,
  DollarSign,
  Plug,
  Signal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useCrmSync } from "../hooks/useCrmSync";
import { ExecutionStream } from "../../framework/components/ExecutionStream";
import { GtmDataPanel } from "../components/GtmDataPanel";
import { InsightCard } from "../../framework/components/InsightCard";
import { useUserTasks } from "@/hooks/useUserScoped";

const SUGGESTION_CHIPS = [
  "Source 50 leads matching our ICP",
  "Score all leads in the pipeline",
  "Write a cold email sequence for SaaS founders",
  "Research competitor GTM strategies",
  "Find buying signals for our top accounts",
  "Draft LinkedIn connection messages",
  "Clean up stale deals in the pipeline",
  "Who should I follow up with today?",
];

export function GtmWorkspace() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { deals, contacts, isLive } = useCrmSync();

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  const tasks = useUserTasks();
  const gtmTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) => t.tags?.includes("niche:gtm")
  );
  const latestActive = gtmTasks.find(
    (t: { status: string }) => t.status === "in_progress" || t.status === "assigned"
  );

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
    const pipelineValue = deals.reduce((s, d) => s + d.dealSize, 0);
    const description = `User request from AI GTM Engine:\n\n"${text}"\n\nContext: ${deals.length} deals ($${pipelineValue.toLocaleString()} pipeline), ${contacts.length} contacts. ${isLive ? "CRM connected — live data available." : "CRM not connected."}\n\nBreak into tasks for Scout (research/sourcing), Ghost (copywriting), Forge (technical/CRM ops).`;

    const result = await triggerAgent("Kaze", title, description, ["niche:gtm", "workspace"], {
      priority: "high",
    });
    if (result.success && result.taskId) {
      setActiveTaskId(result.taskId);
    }
  };

  const isIdle = !activeTaskId;

  // Compute insights
  const pipelineValue = deals.reduce((s, d) => s + d.dealSize, 0);
  const hotDeals = deals.filter((d) => d.stage === "meeting" || d.stage === "replied");
  const staleDeals = deals.filter((d) => d.stage === "lead" || d.stage === "contacted");
  const highScoreContacts = contacts.filter((c) => c.email);

  const insightCards: Array<{
    icon: typeof TrendingUp;
    color: string;
    bg: string;
    text: string;
    action: string;
    prompt: string;
  }> = [];

  if (hotDeals.length > 0) {
    insightCards.push({
      icon: TrendingUp,
      color: "#22c55e",
      bg: "rgba(34,197,94,0.1)",
      text: `${hotDeals.length} deal${hotDeals.length > 1 ? "s" : ""} in late stage — push to close`,
      action: "Click to strategize",
      prompt: `Help me close ${hotDeals.length} deals that are in meeting/replied stage`,
    });
  }
  if (staleDeals.length > 3) {
    insightCards.push({
      icon: AlertTriangle,
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
      text: `${staleDeals.length} deals stuck in early pipeline — re-engage or clean up`,
      action: "Click to clean up",
      prompt: `Review and re-engage ${staleDeals.length} stale deals stuck in lead/contacted stage`,
    });
  }
  if (pipelineValue > 0) {
    insightCards.push({
      icon: DollarSign,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.1)",
      text: `$${pipelineValue.toLocaleString()} in pipeline across ${deals.length} deals`,
      action: "Get pipeline report",
      prompt: `Generate a full pipeline analysis report for my ${deals.length} deals worth $${pipelineValue.toLocaleString()}`,
    });
  }
  if (contacts.length > 0) {
    insightCards.push({
      icon: Users,
      color: "#a855f7",
      bg: "rgba(168,85,247,0.1)",
      text: `${contacts.length} contacts in CRM — find the best ones to reach out to`,
      action: "Click to prioritize",
      prompt: `Score and prioritize my ${contacts.length} contacts for outreach`,
    });
  }
  if (!isLive) {
    insightCards.push({
      icon: Signal,
      color: config.accentColor,
      bg: `${config.accentColor}1A`,
      text: "Connect HubSpot or Salesforce to unlock live pipeline data and AI-powered outreach",
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
                What would you like to do?
              </h1>
              <p className="text-sm text-muted-foreground/50">
                Your AI GTM team is ready. Describe what you need — sourcing, outreach, pipeline ops — agents handle the rest.
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
                  placeholder="Tell your AI GTM team what you need..."
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
              <GtmDataPanel />
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
