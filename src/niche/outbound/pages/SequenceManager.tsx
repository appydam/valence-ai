import { useState } from "react";
import { Mail, Send, Loader2, Sparkles } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { SequenceSplitView } from "../components/SequenceSplitView";
import { useSequenceStats } from "../hooks/useSequenceStats";
import { useProductContext } from "../hooks/useProductContext";

export function SequenceManager() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const stats = useSequenceStats();
  const { getPromptContext } = useProductContext();
  const [prompt, setPrompt] = useState("");

  const handleCreate = async () => {
    if (!prompt.trim() || agentLoading) return;
    const text = prompt.trim();
    setPrompt("");

    await triggerAgent(
      "Ghost",
      `Sequence: ${text.length > 60 ? text.slice(0, 60) + "..." : text}`,
      `User request from AI Outbound Engine — Sequence Creation:\n\n"${text}"${getPromptContext() ? `\n\n--- PRODUCT CONTEXT ---\n${getPromptContext()}` : ""}\n\nDraft the requested outreach sequence. For email sequences: write subject lines and body copy for each step (Day 0, Day 3, Day 5, Day 7). For LinkedIn: write connection request note and follow-up messages. Use merge tags like {{firstName}}, {{company}}. Keep each message under 150 words. Professional but direct tone. Sign emails as the product founder, not as a company.`,
      ["niche:outbound", "stage:sequences"],
      { priority: "high" }
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sequences</h1>
        <p className="text-sm text-muted-foreground">
          Dual-channel outreach — email (HubSpot) and LinkedIn (LaGrowthMachine)
        </p>
      </div>

      {/* Create sequence */}
      <div
        className="rounded-xl border bg-card flex items-center gap-2 px-4 py-3"
        style={{ borderColor: prompt ? config.accentColor : "hsl(0,0%,18%)" }}
      >
        <Sparkles className="w-4 h-4 shrink-0" style={{ color: config.accentColor }} />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder='e.g., "Draft a 4-step cold email sequence for SaaS VP Ops"'
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
        />
        <button
          onClick={handleCreate}
          disabled={!prompt.trim() || agentLoading}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-white transition-all disabled:opacity-30"
          style={{ background: config.accentColor }}
        >
          {agentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          "4-step cold email for SaaS founders",
          "LinkedIn connection + follow-up messages",
          "Re-engagement sequence for stale leads",
          "Dual-channel: email + LinkedIn for VP Ops",
        ].map((s) => (
          <button
            key={s}
            onClick={() => setPrompt(s)}
            className="px-2.5 py-1 rounded-full border border-border/40 text-[10px] text-muted-foreground/60 hover:text-foreground hover:border-border transition-all"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Stats summary */}
      {stats.totalSequenceTasks > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Sequences", value: stats.totalSequenceTasks },
            { label: "Email", value: stats.emailTasks },
            { label: "LinkedIn", value: stats.linkedinTasks },
            { label: "Completed", value: stats.completedSequences },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-xl border border-border/50 bg-card text-center">
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Split view */}
      <SequenceSplitView />

      {stats.totalSequenceTasks === 0 && (
        <div className="text-center py-8">
          <Mail className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No sequences yet. Create one above or launch from the Home page.</p>
        </div>
      )}
    </div>
  );
}
