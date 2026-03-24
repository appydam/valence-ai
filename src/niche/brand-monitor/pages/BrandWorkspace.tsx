import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Sparkles,
  Send,
  Loader2,
  Shield,
  Link2,
  Brain,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { ExecutionStream } from "../../ads/components/ExecutionStream";

const SUGGESTION_CHIPS = [
  "Monitor my brand mentions",
  "Check sentiment this week",
  "Find negative reviews",
  "Track competitor mentions",
  "Set up alerts for my brand",
  "Generate weekly brand report",
];

export function BrandWorkspace() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  // Auto-detect active brand-monitor tasks on mount
  const tasks = useQuery(api.tasks.list, {});
  const brandTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) => t.tags?.includes("niche:brand-monitor")
  );
  const latestActive = brandTasks.find(
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
    const description = `User request from AI Brand Monitor:\n\n"${text}"\n\nBreak into tasks for Scout (research/scanning), Ghost (content/responses), Forge (integrations/automation). Use available integrations: YouTube search, HackerNews API, Google Analytics, Notion, Slack, Gmail.`;

    const result = await triggerAgent("Kaze", title, description, ["niche:brand-monitor", "workspace"], {
      priority: "high",
    });
    if (result.success && result.taskId) {
      setActiveTaskId(result.taskId);
    }
  };

  const isIdle = !activeTaskId;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {isIdle ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-2xl">
            {/* Greeting */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-1.5">
                What do you want to monitor?
              </h1>
              <p className="text-sm text-muted-foreground/50">
                Your AI brand monitoring team is ready. Describe what you need and agents will scan every source.
              </p>
            </div>

            {/* Prompt Input */}
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
                  placeholder="Tell your AI brand team what to monitor..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/40 focus:outline-none text-base"
                  autoFocus
                />
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || agentLoading}
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-white transition-all disabled:opacity-30"
                  style={{ background: config.accentColor }}
                >
                  {agentLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              {agentLoading && (
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

            {/* Suggestion chips */}
            {!prompt && (
              <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
                {SUGGESTION_CHIPS.map((s) => (
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

            {/* Connect integrations card */}
            <div className="mt-8">
              <a
                href="/integrations"
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-border/40 bg-card hover:border-border/50 hover:bg-accent/10 transition-all text-left"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${config.accentColor}15` }}
                >
                  <Link2 className="w-4 h-4" style={{ color: config.accentColor }} />
                </div>
                <p className="text-sm text-foreground/80 leading-snug">
                  Connect your integrations to start monitoring mentions across platforms
                </p>
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* Active: prompt bar at top + execution stream */
        <>
          {/* Sticky top prompt bar */}
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
                  {agentLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Execution Stream */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <ExecutionStream
              taskId={activeTaskId}
              onRetry={(text) => setPrompt(text)}
            />
          </div>
        </>
      )}
    </div>
  );
}
