import { useState, useEffect } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Brain,
  TrendingUp,
  Zap,
  Building2,
  Plug,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { ExecutionStream } from "../../framework/components/ExecutionStream";
import { OutboundDataPanel } from "../components/OutboundDataPanel";
import { InsightCard } from "../../framework/components/InsightCard";
import { ProductSetup } from "../components/ProductSetup";
import { useProductContext } from "../hooks/useProductContext";
import { useUserTasks } from "@/hooks/useUserScoped";

const SUGGESTION_CHIPS_SETUP = [
  "Find 30 companies that match my ICP",
  "Run a competitor displacement campaign",
  "Build a cold email sequence for my targets",
  "Find contacts at companies using my competitor",
  "Launch full outbound pipeline",
  "Draft LinkedIn outreach messages",
];

const SUGGESTION_CHIPS_NO_SETUP = [
  "Displace Salesforce — find their unhappy customers",
  "Find 50 Series B SaaS companies in the US",
  "Draft a 4-step cold email for VP Ops",
  "Launch full outbound pipeline",
];

export function OutboundWorkspace() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { isConnected } = useIntegrationCall();
  const { isSetUp, getPromptContext } = useProductContext();

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  const tasks = useUserTasks();
  const outboundTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) => t.tags?.includes("niche:outbound")
  );
  const latestActive = outboundTasks.find(
    (t: { status: string }) => t.status === "in_progress" || t.status === "assigned"
  );

  useEffect(() => {
    if (latestActive && !activeTaskId) {
      setActiveTaskId(latestActive._id);
    }
  }, [latestActive, activeTaskId]);

  const hasHubspot = isConnected("hubspot");
  const hasApollo = isConnected("apollo");

  const handleSubmit = async () => {
    if (!prompt.trim() || agentLoading) return;
    const text = prompt.trim();
    setPrompt("");

    const title = text.length > 80 ? text.slice(0, 80) + "..." : text;
    const productCtx = getPromptContext();

    const description = `User request from AI Outbound Engine:\n\n"${text}"${productCtx ? `\n\n--- PRODUCT CONTEXT (auto-detected) ---\n${productCtx}` : ""}\n\n--- RULES ---\nCRITICAL COST RULES:\n- Do NOT use Apollo for people search or enrichment (costs credits)\n- Apollo organization_enrich (by domain) is FREE — use it for company data\n- Use FREE web sources: LinkedIn profiles, Crunchbase, Google, company websites, G2\n\nBreak into tasks: Scout (research via web), Forge (enrichment, CRM, automation), Ghost (email/LinkedIn copy).`;

    const result = await triggerAgent("Kaze", title, description, ["niche:outbound", "workspace"], {
      priority: "high",
    });
    if (result.success && result.taskId) {
      setActiveTaskId(result.taskId);
    }
  };

  const isIdle = !activeTaskId;
  const chips = isSetUp ? SUGGESTION_CHIPS_SETUP : SUGGESTION_CHIPS_NO_SETUP;

  // Dynamic insight cards
  const completedTasks = outboundTasks.filter((t: { status: string }) => t.status === "done").length;
  const activeTasks = outboundTasks.filter((t: { status: string }) => t.status === "in_progress" || t.status === "assigned").length;

  const insightCards: Array<{
    icon: typeof TrendingUp;
    color: string;
    bg: string;
    text: string;
    action: string;
    prompt: string;
  }> = [];

  if (completedTasks > 0) {
    insightCards.push({
      icon: TrendingUp,
      color: "#22c55e",
      bg: "rgba(34,197,94,0.1)",
      text: `${completedTasks} task${completedTasks > 1 ? "s" : ""} completed — pipeline is building`,
      action: "View pipeline",
      prompt: "Show me a summary of the outbound pipeline progress",
    });
  }
  if (activeTasks > 0) {
    insightCards.push({
      icon: Zap,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.1)",
      text: `${activeTasks} task${activeTasks > 1 ? "s" : ""} running — agents are working`,
      action: "View status",
      prompt: "What are my agents working on right now?",
    });
  }
  if (!hasHubspot || !hasApollo) {
    insightCards.push({
      icon: Plug,
      color: config.accentColor,
      bg: `${config.accentColor}1A`,
      text: `Connect ${!hasApollo ? "Apollo" : ""}${!hasApollo && !hasHubspot ? " & " : ""}${!hasHubspot ? "HubSpot" : ""} to unlock the full pipeline`,
      action: "Connect now",
      prompt: "",
    });
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {isIdle ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-2xl space-y-6">
            {/* Product setup — compact when done, full when not */}
            <ProductSetup />

            {/* Main prompt */}
            <div className="text-center mb-2">
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {isSetUp ? "What would you like to do?" : "Start your outbound engine"}
              </h1>
              <p className="text-sm text-muted-foreground/50">
                {isSetUp
                  ? "Describe your goal — agents handle research, enrichment, CRM, and outreach automatically."
                  : "Set up your product above, then describe your outbound goal below."}
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
                  placeholder={isSetUp ? "e.g., Find 30 companies like my ICP and draft cold emails..." : "e.g., Find 50 fintech companies and draft a cold email sequence..."}
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
                  <span className="text-xs" style={{ color: config.accentColor }}>Breaking into agent tasks...</span>
                </div>
              )}
            </div>

            {!prompt && (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {chips.map((s) => (
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
              <div className="space-y-2">
                {insightCards.slice(0, 3).map((card, idx) =>
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
              <OutboundDataPanel />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
