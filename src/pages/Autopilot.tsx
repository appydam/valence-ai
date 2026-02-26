import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AutopilotPlanEditor, DecomposedPlan } from "@/components/AutopilotPlanEditor";
import { AUTOPILOT_TEMPLATES, AutopilotTemplate } from "@/data/autopilotTemplates";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { getRelativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import { VoiceOverlay } from "@/components/VoiceOverlay";
import {
  Rocket,
  Loader2,
  ArrowLeft,
  Sparkles,
  Clock,
  CheckCircle,
  Mic,
  MicOff,
  ArrowRight,
  Zap,
  Target,
  Brain,
  Send,
  ChevronRight,
} from "lucide-react";

type AutopilotState = "input" | "loading" | "review" | "launched";

const AUTOPILOT_VOICE_PROMPT = `You are Kaze, helping the operator describe a mission goal via voice.

CRITICAL RULES:
- Respond in 1 SHORT sentence MAX. Do not ramble.
- Wait for the user to FULLY finish speaking. Do not interrupt mid-sentence.
- If the user pauses briefly, stay silent — they may still be thinking.
- Ask at most one clarifying question, then listen again.
- When they're done, say "Got it" and briefly confirm what you heard in one sentence.
- You do NOT execute the mission. Just help them articulate it.`;

const EXAMPLE_GOALS = [
  {
    text: "Find 50 AI startup founders on Twitter, research their companies, write personalized cold DMs, and send them via Gmail",
    icon: "🎯",
    label: "Cold outreach",
  },
  {
    text: "Reverse-engineer how Perplexity, Cursor, and Devin price their products — build a pricing page that undercuts all three",
    icon: "⚔️",
    label: "Competitive intel",
  },
  {
    text: "Scrape every Y Combinator W26 startup, find the ones competing with us, and write a Twitter thread dunking on their weaknesses",
    icon: "🔥",
    label: "YC analysis",
  },
  {
    text: "Monitor Hacker News, Reddit, and Twitter for mentions of our brand for 7 days — auto-reply to critics, amplify fans",
    icon: "📡",
    label: "Brand monitoring",
  },
  {
    text: "Research the top 100 AI agent papers from 2025, distill into a 10-page report, and turn key findings into a LinkedIn thought leadership series",
    icon: "🧠",
    label: "Research report",
  },
  {
    text: "Find every open-source alternative to our paid SaaS tools, calculate annual savings, migrate the top 5 easiest swaps, and write a build-in-public Twitter thread about it",
    icon: "💸",
    label: "Cost optimization",
  },
  {
    text: "Build a real-time competitor tracker that monitors GitHub stars, Twitter followers, website traffic, and job postings — deploy as a live dashboard",
    icon: "📊",
    label: "Competitor tracker",
  },
  {
    text: "Create a full Product Hunt launch kit — landing page, launch copy, social campaign for 500 supporters, minute-by-minute day-of playbook",
    icon: "🚀",
    label: "Launch prep",
  },
];

// ── Animated loading dots ────────────────────────────────────────────────────
function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-[3px] ml-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-primary animate-pulse"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </span>
  );
}

// ── Loading state agent visualization ────────────────────────────────────────
function DecomposeAnimation({ goal }: { goal: string }) {
  const [step, setStep] = useState(0);
  const steps = [
    { text: "Analyzing goal complexity", icon: Brain },
    { text: "Identifying required agents", icon: Target },
    { text: "Building dependency graph", icon: Zap },
    { text: "Generating task assignments", icon: Sparkles },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Pulsing orb */}
      <div className="relative mb-8">
        <div className="absolute inset-0 -m-6 rounded-full animate-ping opacity-10" style={{ background: "hsl(var(--primary))", animationDuration: "2s" }} />
        <div className="absolute inset-0 -m-3 rounded-full animate-ping opacity-15" style={{ background: "hsl(var(--primary))", animationDuration: "1.5s" }} />
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Brain className="w-7 h-7 text-primary animate-pulse" />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-2">Decomposing mission</h2>
      <p className="text-sm text-muted-foreground max-w-md mb-8 line-clamp-2">"{goal}"</p>

      {/* Progress steps */}
      <div className="space-y-3 w-full max-w-xs">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500",
                isActive && "bg-primary/5 border border-primary/20",
                isDone && "opacity-50",
                !isActive && !isDone && "opacity-20"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500",
                isDone && "bg-green-500/10",
                isActive && "bg-primary/10",
              )}>
                {isDone ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                )}
              </div>
              <span className={cn(
                "text-sm transition-all duration-500",
                isActive ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {s.text}
                {isActive && <LoadingDots />}
              </span>
            </div>
          );
        })}
      </div>

      {/* Claude credit */}
      <div className="mt-10 flex items-center gap-2 text-[10px] text-muted-foreground/40 font-mono">
        <img
          src="https://cdn.simpleicons.org/claude"
          alt="Claude"
          width="10"
          height="10"
          style={{ filter: "brightness(0) saturate(100%) invert(62%) sepia(98%) saturate(400%) hue-rotate(330deg) brightness(105%)" }}
        />
        <span>Powered by Claude Opus 4.6 via AWS Bedrock</span>
      </div>
    </div>
  );
}

// ── Launched state celebration ───────────────────────────────────────────────
function LaunchedState({ onReset, navigate }: { onReset: () => void; navigate: (path: string) => void }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Success icon */}
      <div className={cn(
        "relative mb-6 transition-all duration-700",
        showContent ? "opacity-100 scale-100" : "opacity-0 scale-50"
      )}>
        <div className="absolute inset-0 -m-4 rounded-full opacity-20 animate-ping" style={{ background: "hsl(142 71% 45%)", animationDuration: "2s" }} />
        <div className="w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <Rocket className="w-9 h-9 text-green-500" />
        </div>
      </div>

      <h2 className={cn(
        "text-2xl font-bold text-foreground mb-2 transition-all duration-700 delay-150",
        showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        Mission Launched
      </h2>
      <p className={cn(
        "text-muted-foreground mb-10 max-w-sm transition-all duration-700 delay-300",
        showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        Your agents are spinning up. Tasks have been assigned and work is starting.
      </p>

      <div className={cn(
        "flex items-center gap-3 transition-all duration-700 delay-500",
        showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          Watch Live
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate("/board")}
          className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground rounded-xl text-sm font-medium hover:bg-accent transition-all"
        >
          Mission Board
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          New mission
        </button>
      </div>
    </div>
  );
}

export default function Autopilot() {
  const navigate = useNavigate();
  const userId = useCurrentUserId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [state, setState] = useState<AutopilotState>("input");
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState<DecomposedPlan | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refineInput, setRefineInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const decompose = useAction(api.missionAutopilot.decomposeMission);
  const launch = useMutation(api.missionAutopilotQueries.launchMission);
  const refine = useAction(api.missionAutopilot.refinePlan);
  const sessions = useQuery(api.missionAutopilotQueries.listSessions, { userId }) ?? [];

  // Voice session
  const voice = useVoiceSession();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [goal]);

  const handleDecompose = async () => {
    if (!goal.trim()) return;
    setError(null);
    setState("loading");
    try {
      const result = await decompose({ goal: goal.trim(), userId });
      setPlan(result.plan as DecomposedPlan);
      setSessionId(result.sessionId as string);
      setState("review");
    } catch (e: any) {
      setError(e.message || "Failed to decompose mission");
      setState("input");
    }
  };

  const handleTemplate = (template: AutopilotTemplate) => {
    setGoal(template.name);
    setPlan(template.plan);
    setSessionId(null);
    setState("review");
  };

  const handleLaunch = async () => {
    if (!plan) return;
    setError(null);
    try {
      let sid = sessionId;
      if (!sid) {
        const result = await decompose({ goal, userId });
        sid = result.sessionId as string;
        setSessionId(sid);
      }
      const result = await launch({
        sessionId: sid as any,
        plan: JSON.stringify(plan),
      });
      setState("launched");
    } catch (e: any) {
      setError(e.message || "Failed to launch mission");
    }
  };

  const handleRefine = async () => {
    if (!refineInput.trim() || !sessionId) return;
    setIsRefining(true);
    setError(null);
    try {
      const result = await refine({
        sessionId: sessionId as any,
        feedback: refineInput.trim(),
      });
      setPlan(result.plan as DecomposedPlan);
      setRefineInput("");
    } catch (e: any) {
      setError(e.message || "Failed to refine plan");
    } finally {
      setIsRefining(false);
    }
  };

  const startAutopilotVoice = () => {
    voice.startVoice({
      systemPrompt: AUTOPILOT_VOICE_PROMPT,
      speakerLabel: "Kaze",
      voiceId: "tiffany",
    });
  };

  const handleEndVoice = () => {
    const userMessages = voice.transcriptHistory
      .filter((t) => t.speaker === "user")
      .map((t) => t.text)
      .join(". ");
    if (userMessages.trim()) {
      setGoal((prev) => (prev ? prev + " " + userMessages : userMessages));
    }
    voice.stopVoice();
  };

  const handleReset = () => {
    setState("input");
    setGoal("");
    setPlan(null);
    setSessionId(null);
    setError(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-4 relative">
        {/* ── State: Input ── */}
        {state === "input" && (
          <div className="space-y-10">
            {/* Hero section */}
            <div className="text-center pt-8 pb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest mb-5" style={{ background: "hsl(var(--primary) / 0.08)", color: "hsl(var(--primary) / 0.7)", border: "1px solid hsl(var(--primary) / 0.15)" }}>
                <Zap className="w-3 h-3" />
                POWERED BY CLAUDE OPUS 4.6
              </div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight mb-3">
                What should your squad build?
              </h1>
              <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
                Describe any goal. AI decomposes it into tasks, assigns agents, maps dependencies, and launches — while you grab coffee.
              </p>
            </div>

            {/* Main input area */}
            <div
              className="relative rounded-2xl transition-all duration-300 group"
              style={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                boxShadow: goal.trim() ? "0 0 0 1px hsl(var(--primary) / 0.15), 0 8px 32px hsl(var(--primary) / 0.06)" : "0 4px 24px hsl(0 0% 0% / 0.1)",
              }}
            >
              <textarea
                ref={textareaRef}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleDecompose();
                  }
                }}
                placeholder="Describe your mission in plain English..."
                rows={1}
                className="w-full bg-transparent rounded-2xl px-5 pt-5 pb-16 text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none text-[15px] leading-relaxed"
                style={{ minHeight: 80 }}
              />

              {/* Bottom toolbar */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid hsl(var(--border) / 0.5)" }}>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40 font-mono">
                  <Sparkles className="w-3 h-3" />
                  <span>Claude decomposes → Agents execute</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Voice input */}
                  {voice.isAvailable && (
                    <button
                      onClick={() => {
                        if (voice.isVoiceMode) {
                          handleEndVoice();
                        } else {
                          startAutopilotVoice();
                        }
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        voice.isVoiceMode
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      {voice.isVoiceMode ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      {voice.isVoiceMode ? "Done" : "Voice"}
                    </button>
                  )}
                  {/* Decompose */}
                  <button
                    onClick={handleDecompose}
                    disabled={!goal.trim()}
                    className={cn(
                      "flex items-center gap-2 pl-4 pr-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                      goal.trim()
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        : "bg-secondary/50 text-muted-foreground/40 cursor-not-allowed"
                    )}
                  >
                    Decompose
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Example goals — horizontal scroll pills */}
            <div>
              <p className="text-xs text-muted-foreground/60 font-medium mb-3 tracking-wide uppercase">Try an example</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_GOALS.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => setGoal(ex.text)}
                    className="group flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  >
                    <span className="text-sm">{ex.icon}</span>
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">{ex.label}</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Templates — card grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Quick-Start Templates</h2>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Pre-built missions ready to launch</p>
                </div>
                <span className="text-[10px] text-muted-foreground/40 font-mono">{AUTOPILOT_TEMPLATES.length} templates</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AUTOPILOT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplate(template)}
                    className="text-left rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                    style={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  >
                    {/* Top accent line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                      style={{ background: `linear-gradient(90deg, transparent, ${template.accentColor}, transparent)` }}
                    />

                    <div className="flex items-start gap-3 mb-2.5">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: `${template.accentColor.replace("hsl(", "hsla(").replace(")", ", 0.08)")}`,
                          border: `1px solid ${template.accentColor.replace("hsl(", "hsla(").replace(")", ", 0.15)")}`,
                        }}
                      >
                        {template.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors block">
                          {template.name}
                        </span>
                        <p className="text-[11px] text-muted-foreground/60 line-clamp-2 mt-0.5 leading-relaxed">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground/40 font-mono">
                      <span className="flex items-center gap-1">
                        <Target className="w-2.5 h-2.5" />
                        {template.plan.tasks.length} tasks
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {template.plan.estimatedDuration}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent sessions */}
            {sessions.length > 0 && (
              <div>
                <h2 className="text-xs text-muted-foreground/60 font-medium mb-3 tracking-wide uppercase">Recent missions</h2>
                <div className="space-y-1.5">
                  {sessions.slice(0, 5).map((session: any) => (
                    <div
                      key={session._id}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:bg-accent/30"
                      style={{ border: "1px solid hsl(var(--border) / 0.5)" }}
                    >
                      {session.status === "launched" ? (
                        <div className="w-5 h-5 rounded-md bg-green-500/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-sm text-foreground truncate flex-1">
                        {session.goal}
                      </span>
                      <span className="text-[10px] text-muted-foreground/40 shrink-0 font-mono">
                        {getRelativeTime(session.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── State: Loading ── */}
        {state === "loading" && <DecomposeAnimation goal={goal} />}

        {/* ── State: Review ── */}
        {state === "review" && plan && (
          <div className="space-y-6">
            {/* Back + header */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setState("input");
                  setPlan(null);
                  setSessionId(null);
                  setError(null);
                }}
                className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-foreground">Review Plan</h1>
                <p className="text-xs text-muted-foreground/60">
                  {plan.tasks.length} tasks · {plan.estimatedDuration} estimated · edit anything before launch
                </p>
              </div>
              {/* Voice refine button */}
              {voice.isAvailable && sessionId && (
                <button
                  onClick={() => {
                    if (voice.isVoiceMode) {
                      const userMessages = voice.transcriptHistory
                        .filter((t) => t.speaker === "user")
                        .map((t) => t.text)
                        .join(". ");
                      if (userMessages.trim()) {
                        setRefineInput(userMessages);
                      }
                      voice.stopVoice();
                    } else {
                      voice.startVoice({
                        systemPrompt: `You are Kaze, helping refine a mission plan with ${plan.tasks.length} tasks. RULES: Respond in 1 sentence MAX. Wait for the user to fully finish speaking. Do not interrupt. Just confirm you understood their change.`,
                        speakerLabel: "Kaze",
                      });
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                    voice.isVoiceMode
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {voice.isVoiceMode ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  {voice.isVoiceMode ? "Apply" : "Voice refine"}
                </button>
              )}
            </div>

            {/* Editable plan */}
            <div className="border border-border rounded-2xl p-6 bg-card">
              <AutopilotPlanEditor plan={plan} onChange={setPlan} />
            </div>

            {/* Refine input */}
            {sessionId && (
              <div
                className="flex items-center gap-2 rounded-xl p-1 transition-all"
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
              >
                <input
                  value={refineInput}
                  onChange={(e) => setRefineInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRefine();
                  }}
                  placeholder="Refine: 'add a social media task' or 'make Scout do the research first'"
                  className="flex-1 bg-transparent px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                  disabled={isRefining}
                />
                <button
                  onClick={handleRefine}
                  disabled={!refineInput.trim() || isRefining}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all",
                    refineInput.trim() && !isRefining
                      ? "bg-secondary text-foreground hover:bg-accent"
                      : "text-muted-foreground/30 cursor-not-allowed"
                  )}
                >
                  {isRefining ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  Refine
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Launch button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40 font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span>All agents ready</span>
              </div>
              <button
                onClick={handleLaunch}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Rocket className="w-4 h-4" />
                Launch Mission
              </button>
            </div>
          </div>
        )}

        {/* ── State: Launched ── */}
        {state === "launched" && (
          <LaunchedState onReset={handleReset} navigate={navigate} />
        )}

        {/* Voice Mode Overlay */}
        {voice.isVoiceMode && (
          <VoiceOverlay
            voiceState={voice.voiceState}
            isSpeaking={voice.isSpeaking}
            isListening={voice.isListening}
            userTranscript={voice.userTranscript}
            agentTranscript={voice.agentTranscript}
            transcriptHistory={voice.transcriptHistory}
            elapsedSeconds={voice.elapsedSeconds}
            speakerLabel="Kaze"
            onEnd={voice.stopVoice}
            fullscreen
            actionButton={{
              label: state === "review" ? "Apply Feedback" : "Use as Goal",
              onClick: () => {
                const userMessages = voice.transcriptHistory
                  .filter((t) => t.speaker === "user")
                  .map((t) => t.text)
                  .join(". ");
                if (state === "review") {
                  if (userMessages.trim()) setRefineInput(userMessages);
                } else {
                  if (userMessages.trim()) setGoal((prev) => (prev ? prev + " " + userMessages : userMessages));
                }
                voice.stopVoice();
              },
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
