import { useState } from "react";
import {
  Mail,
  Send,
  Loader2,
  Sparkles,
  Linkedin,
  CheckCircle2,
  Clock,
  Scan,
  RotateCcw,
  Globe,
  Zap,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useProductContext } from "../hooks/useProductContext";
import { useReplyDetection } from "../hooks/useReplyDetection";
import { useFollowUpAgent } from "../hooks/useFollowUpAgent";
import { useUserTasks } from "@/hooks/useUserScoped";

type Tab = "compose" | "replies" | "followup";

export function Sequences() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { getPromptContext, isSetUp, context } = useProductContext();
  const { scanForReplies, loading: scanLoading } = useReplyDetection();
  const { runFollowUpAnalysis, loading: followUpLoading } = useFollowUpAgent();
  const [tab, setTab] = useState<Tab>("compose");
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("auto");

  const tasks = useUserTasks();
  const seqTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) => t.tags?.includes("niche:outbound") && t.tags?.includes("stage:sequences")
  ).sort((a: { _creationTime: number }, b: { _creationTime: number }) => b._creationTime - a._creationTime);

  const replyTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) => t.tags?.includes("reply-detection")
  ).sort((a: { _creationTime: number }, b: { _creationTime: number }) => b._creationTime - a._creationTime);

  const followUpTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) => t.tags?.includes("follow-up-agent")
  ).sort((a: { _creationTime: number }, b: { _creationTime: number }) => b._creationTime - a._creationTime);

  const handleCompose = async () => {
    if (!prompt.trim() || agentLoading) return;
    const text = prompt.trim();
    setPrompt("");
    const productCtx = getPromptContext();

    const langInstruction = language !== "auto"
      ? `\n\nIMPORTANT: Write ALL emails and messages in ${language}. Use culturally appropriate greetings, formality level, and business norms for ${language}-speaking markets.`
      : isSetUp ? "\n\nAuto-detect the prospect's likely language from their name/company/location. If non-English market, write in their language with cultural nuance." : "";

    const timezoneInstruction = "\n\nTIMEZONE-AWARE: For each email step, include a note on optimal send time based on the target persona's likely timezone. Format: 'Send at: 9:15 AM [timezone]'. Detect timezone from company HQ location or contact's LinkedIn location.";

    await triggerAgent(
      "Ghost",
      `Sequence: ${text.length > 60 ? text.slice(0, 60) + "..." : text}`,
      `User request from AI Outbound Engine — Sequence Creation:\n\n"${text}"${productCtx ? `\n\n--- PRODUCT CONTEXT ---\n${productCtx}` : ""}${langInstruction}${timezoneInstruction}\n\nDraft the requested outreach sequence.\n\nFor email sequences: write subject lines and body copy for each step (Day 0, Day 3, Day 5, Day 7).\nFor LinkedIn: write connection request note (300 char max) and follow-up messages.\nUse merge tags: {{firstName}}, {{company}}, {{painPoint}}.\nKeep each message under 150 words. Professional but direct tone.\nSign as the founder, not a company.`,
      ["niche:outbound", "stage:sequences"],
      { priority: "high" }
    );
  };

  const tabs = [
    { key: "compose" as Tab, label: "Compose", icon: Mail },
    { key: "replies" as Tab, label: "Replies", icon: Scan },
    { key: "followup" as Tab, label: "AI Follow-up", icon: RotateCcw },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 px-6 pt-6 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sequences</h1>
            <p className="text-sm text-muted-foreground">
              Write, detect replies, and auto-follow-up — the full outreach loop
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border/30">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 ${tab === t.key ? "text-foreground border-current" : "text-muted-foreground/50 border-transparent hover:text-foreground/70"}`}
                style={tab === t.key ? { color: config.accentColor, borderColor: config.accentColor } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* COMPOSE TAB */}
        {tab === "compose" && (
          <div className="space-y-4 pt-4 max-w-3xl">
            {/* Language selector */}
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-muted-foreground/40" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-border/50 bg-card text-xs text-foreground focus:outline-none"
              >
                <option value="auto">Auto-detect language</option>
                <option value="English">English</option>
                <option value="German">German (Deutsch)</option>
                <option value="French">French (Français)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="Portuguese">Portuguese (Português)</option>
                <option value="Japanese">Japanese (日本語)</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Dutch">Dutch (Nederlands)</option>
                <option value="Italian">Italian (Italiano)</option>
                <option value="Korean">Korean (한국어)</option>
                <option value="Mandarin Chinese">Mandarin (中文)</option>
                <option value="Arabic">Arabic (العربية)</option>
              </select>
              <span className="text-[10px] text-muted-foreground/40">
                {language === "auto" ? "AI detects prospect's language automatically" : `All sequences will be written in ${language}`}
              </span>
            </div>

            {/* Prompt */}
            <div
              className="rounded-xl border bg-card flex items-center gap-2 px-4 py-3"
              style={{ borderColor: prompt ? config.accentColor : "hsl(0,0%,18%)" }}
            >
              <Sparkles className="w-4 h-4 shrink-0" style={{ color: config.accentColor }} />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCompose()}
                placeholder='e.g., "4-step cold email for SaaS VP Ops"'
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
              <button
                onClick={handleCompose}
                disabled={!prompt.trim() || agentLoading}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-white transition-all disabled:opacity-30"
                style={{ background: config.accentColor }}
              >
                {agentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                "4-step cold email for VP Ops",
                "LinkedIn connection + follow-ups",
                "Re-engagement for stale leads",
                "Competitor displacement emails",
              ].map((s) => (
                <button key={s} onClick={() => setPrompt(s)} className="px-2.5 py-1 rounded-full border border-border/40 text-[10px] text-muted-foreground/60 hover:text-foreground hover:border-border transition-all">
                  {s}
                </button>
              ))}
            </div>

            {/* Dual channel view */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-400" />
                  <h3 className="text-xs font-semibold text-foreground">Email Sequences</h3>
                </div>
                {seqTasks.filter((t: { title: string }) => !t.title.toLowerCase().includes("linkedin")).length === 0 ? (
                  <p className="text-xs text-muted-foreground/50 py-4 text-center">No email sequences yet</p>
                ) : seqTasks.filter((t: { title: string }) => !t.title.toLowerCase().includes("linkedin")).map((t: { _id: string; title: string; status: string; deliverables?: { name: string; content: string }[] }) => (
                  <MiniTaskCard key={t._id} task={t} />
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-semibold text-foreground">LinkedIn Sequences</h3>
                </div>
                {seqTasks.filter((t: { title: string }) => t.title.toLowerCase().includes("linkedin")).length === 0 ? (
                  <p className="text-xs text-muted-foreground/50 py-4 text-center">No LinkedIn sequences yet</p>
                ) : seqTasks.filter((t: { title: string }) => t.title.toLowerCase().includes("linkedin")).map((t: { _id: string; title: string; status: string; deliverables?: { name: string; content: string }[] }) => (
                  <MiniTaskCard key={t._id} task={t} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REPLIES TAB */}
        {tab === "replies" && (
          <div className="space-y-4 pt-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Scan Gmail for replies → auto-classify → route to HubSpot/Slack/re-engagement
              </p>
              <button
                onClick={() => scanForReplies()}
                disabled={scanLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-30"
                style={{ background: config.accentColor }}
              >
                {scanLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                Scan Inbox
              </button>
            </div>

            {/* Reply classification legend */}
            <div className="flex flex-wrap gap-2">
              {[
                { emoji: "🔥", label: "Interested", color: "#22c55e" },
                { emoji: "⏳", label: "Not Now", color: "#f59e0b" },
                { emoji: "❓", label: "Question", color: "#3b82f6" },
                { emoji: "🤝", label: "Referral", color: "#10b981" },
                { emoji: "✈️", label: "OOO", color: "#8b5cf6" },
                { emoji: "🚫", label: "Unsubscribe", color: "#ef4444" },
              ].map((c) => (
                <span key={c.label} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-border/30" style={{ color: c.color }}>
                  {c.emoji} {c.label}
                </span>
              ))}
            </div>

            {/* Reply scan results */}
            {replyTasks.length === 0 && (
              <div className="text-center py-12">
                <Scan className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Hit "Scan Inbox" to detect and classify replies</p>
                <p className="text-[10px] text-muted-foreground/40 mt-1">
                  Interested → HubSpot deal + Slack alert · Not Now → 90-day re-engagement · OOO → auto-reschedule
                </p>
              </div>
            )}
            {replyTasks.map((t: { _id: string; title: string; status: string; deliverables?: { name: string; content: string }[] }) => (
              <div key={t._id} className="px-4 py-3 rounded-xl border border-border/50 bg-card">
                <div className="flex items-start gap-3">
                  {t.status === "done" ? <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 shrink-0" /> : <Loader2 className="w-4 h-4 mt-0.5 text-blue-400 animate-spin shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                    {t.status === "done" && t.deliverables && t.deliverables.length > 0 && (
                      <div className="mt-2 px-3 py-2 rounded-lg bg-accent/20 text-xs text-foreground/70 whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {t.deliverables[0].content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI FOLLOW-UP TAB */}
        {tab === "followup" && (
          <div className="space-y-4 pt-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  AI analyzes non-responders → diagnoses why → tries different angles or escalates
                </p>
              </div>
              <button
                onClick={() => runFollowUpAnalysis()}
                disabled={followUpLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-30"
                style={{ background: config.accentColor }}
              >
                {followUpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Run Follow-up AI
              </button>
            </div>

            <div className="p-4 rounded-xl border border-border/30 bg-card/50">
              <h3 className="text-xs font-semibold text-foreground mb-2">How it works</h3>
              <div className="space-y-1.5 text-[11px] text-muted-foreground">
                <p>1. Finds all contacts who completed a sequence without replying</p>
                <p>2. Diagnoses why: wrong angle? wrong timing? wrong persona?</p>
                <p>3. Decides: retry with different hook, escalate to their boss, re-engage in 90 days, or drop</p>
                <p>4. Auto-creates new tasks for Ghost to write fresh angles</p>
              </div>
            </div>

            {followUpTasks.length === 0 && (
              <div className="text-center py-8">
                <RotateCcw className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Run the AI follow-up agent after your sequences have had time to play out</p>
              </div>
            )}
            {followUpTasks.map((t: { _id: string; title: string; status: string; deliverables?: { name: string; content: string }[] }) => (
              <div key={t._id} className="px-4 py-3 rounded-xl border border-border/50 bg-card">
                <div className="flex items-start gap-3">
                  {t.status === "done" ? <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 shrink-0" /> : <Loader2 className="w-4 h-4 mt-0.5 text-blue-400 animate-spin shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                    {t.status === "done" && t.deliverables && t.deliverables.length > 0 && (
                      <div className="mt-2 px-3 py-2 rounded-lg bg-accent/20 text-xs text-foreground/70 whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {t.deliverables[0].content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniTaskCard({ task }: { task: { _id: string; title: string; status: string; deliverables?: { name: string; content: string }[] } }) {
  return (
    <div className="px-3 py-2.5 rounded-lg border border-border/40 bg-card">
      <div className="flex items-start gap-2">
        {task.status === "done" ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-green-500" /> : task.status === "in_progress" ? <Loader2 className="w-3.5 h-3.5 mt-0.5 text-blue-400 animate-spin" /> : <Clock className="w-3.5 h-3.5 mt-0.5 text-yellow-500" />}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground">{task.title}</p>
          {task.status === "done" && task.deliverables && task.deliverables.length > 0 && (
            <div className="mt-1.5 text-[10px] text-foreground/60 line-clamp-3">{task.deliverables[0].content.slice(0, 200)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
