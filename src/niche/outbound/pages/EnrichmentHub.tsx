import { useState } from "react";
import { Sparkles, Send, Loader2, Plug, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { useUserTasks } from "@/hooks/useUserScoped";

export function EnrichmentHub() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { isConnected } = useIntegrationCall();
  const [prompt, setPrompt] = useState("");

  const hasClay = isConnected("clay");

  const tasks = useUserTasks();
  const enrichTasks = (tasks ?? [])
    .filter((t: { tags?: string[] }) =>
      t.tags?.includes("niche:outbound") && t.tags?.includes("stage:enriched")
    )
    .sort((a: { _creationTime: number }, b: { _creationTime: number }) => b._creationTime - a._creationTime);

  const handleEnrich = async () => {
    if (!prompt.trim() || agentLoading) return;
    const text = prompt.trim();
    setPrompt("");

    await triggerAgent(
      "Forge",
      `Enrich contacts: ${text.length > 60 ? text.slice(0, 60) + "..." : text}`,
      `User request from AI Outbound Engine — Contact Enrichment:\n\n"${text}"\n\n${hasClay ? "Use Clay to enrich contacts with additional data (phone, verified email, company info). Push contacts to Clay table, trigger enrichment, and report results." : "Clay is not connected. Use Apollo to enrich contacts with available data."}`,
      ["niche:outbound", "stage:enriched"],
      { priority: "high" }
    );
  };

  if (!hasClay && !isConnected("apollo")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <Plug className="w-12 h-12 text-muted-foreground/20 mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Connect an enrichment tool</h2>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
          Link Clay or Apollo to enrich contacts with phone numbers, verified emails, and company data
        </p>
        <Link
          to="/integrations"
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: config.accentColor }}
        >
          Connect Integrations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Enrichment</h1>
        <p className="text-sm text-muted-foreground">
          Enrich contacts with {hasClay ? "Clay" : "Apollo"} — phone, verified email, company data
        </p>
      </div>

      <div
        className="rounded-xl border bg-card flex items-center gap-2 px-4 py-3"
        style={{ borderColor: prompt ? config.accentColor : "hsl(0,0%,18%)" }}
      >
        <Sparkles className="w-4 h-4 shrink-0" style={{ color: config.accentColor }} />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleEnrich()}
          placeholder="e.g., &quot;Enrich all contacts from my last sourcing task&quot;"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
        />
        <button
          onClick={handleEnrich}
          disabled={!prompt.trim() || agentLoading}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-white transition-all disabled:opacity-30"
          style={{ background: config.accentColor }}
        >
          {agentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {enrichTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Enrichment Tasks</h2>
          {enrichTasks.map((task: {
            _id: string;
            title: string;
            status: string;
            assignee?: string;
            deliverables?: { name: string; content: string }[];
          }) => (
            <div key={task._id} className="px-4 py-3 rounded-xl border border-border/50 bg-card">
              <div className="flex items-start gap-3">
                {task.status === "done" ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 shrink-0" />
                ) : task.status === "in_progress" ? (
                  <Loader2 className="w-4 h-4 mt-0.5 text-blue-400 animate-spin shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 mt-0.5 text-yellow-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{task.assignee}</p>
                  {task.status === "done" && task.deliverables && task.deliverables.length > 0 && (
                    <div className="mt-2 px-3 py-2 rounded-lg bg-accent/20 text-xs text-foreground/70 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {task.deliverables[0].content.slice(0, 500)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {enrichTasks.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No enrichment tasks yet. Source contacts first, then enrich them here.</p>
        </div>
      )}
    </div>
  );
}
