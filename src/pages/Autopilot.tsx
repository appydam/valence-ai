import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AutopilotPlanEditor, DecomposedPlan } from "@/components/AutopilotPlanEditor";
import { AUTOPILOT_TEMPLATES, AutopilotTemplate } from "@/data/autopilotTemplates";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { getRelativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import { VoiceOverlay } from "@/components/VoiceOverlay";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    text: "Find 50 AI startup founders on Twitter and LinkedIn who are hiring for growth roles (signal: active hiring in last 30 days), deep-research each one to find their biggest distribution bottleneck, write hyper-personalized cold emails referencing their latest tweet or blog post, create Gmail drafts for all 50, and send a follow-up sequence on Day 3 and Day 7 for non-responders. Deliver a lead tracking spreadsheet with open rates.",
    icon: "🎯",
    label: "Cold outreach",
  },
  {
    text: "Reverse-engineer how Perplexity, Cursor, Devin, and Replit price their products — find every pricing page version from the last 12 months on Wayback Machine, scrape Reddit and G2 for actual prices people paid, map their feature tiers, infer their LTV/CAC assumptions, and build a pricing page for us that psychologically undercuts all four while maximizing perceived value. Deploy it to Vercel.",
    icon: "⚔️",
    label: "Competitive intel",
  },
  {
    text: "Scrape every Y Combinator W26 startup from the YC directory, cross-reference their product descriptions against ours to find the 10 most direct competitors, deep-research each one's funding, team, and product gaps, write a data-backed Twitter thread exposing the 3 biggest market gaps they're all missing, and schedule it for Tuesday 9am PST when our audience is most active.",
    icon: "🔥",
    label: "YC analysis",
  },
  {
    text: "Set up a 14-day brand monitoring system: watch Hacker News, Reddit (r/MachineLearning, r/LocalLLaMA, r/programming), Twitter, and Product Hunt for every mention of our brand name and 5 competitor names. For each mention: classify sentiment, draft a response if negative, draft an amplification reply if positive. Deliver a daily digest and an end-of-sprint sentiment trend report.",
    icon: "📡",
    label: "Brand monitoring",
  },
  {
    text: "Research the top 150 AI agent and LLM papers published in 2025 on ArXiv and HackerNews, distill the 20 most actionable findings for a B2B SaaS product team, write a 12-page research report with executive summary and key implications per finding, then turn the top 5 insights into a 5-part LinkedIn thought leadership series with data visualizations described for Forge to build.",
    icon: "🧠",
    label: "Research report",
  },
  {
    text: "Audit every paid SaaS tool we use (pull from credit card statements if needed), find the best open-source or free alternative for each, calculate exact annual savings per swap, execute the top 5 migrations with full data backup and rollback plan, write a build-in-public Twitter thread documenting the journey with before/after cost screenshots, and post it with relevant tags to maximize reach.",
    icon: "💸",
    label: "Cost optimization",
  },
  {
    text: "Build a real-time competitive intelligence dashboard that monitors 5 competitors across: GitHub star velocity (daily), Twitter follower growth (weekly), estimated web traffic changes (SimilarWeb-style heuristics), new job postings (signal for roadmap), and G2 rating changes. Alert us when any competitor crosses a meaningful threshold. Deploy as a live Vercel app with daily email digest.",
    icon: "📊",
    label: "Competitor tracker",
  },
  {
    text: "Create a complete Product Hunt launch system: analyze the top 50 launches in our category to extract the winning formula, build a conversion-optimized landing page with live upvote counter, write 3 variants of all copy assets (tagline, description, first comment), draft personalized DMs to 100 PH community influencers, create the full social campaign for Twitter and LinkedIn, and produce a minute-by-minute launch day operations playbook.",
    icon: "🚀",
    label: "Launch prep",
  },
];

const TEMPLATE_CATEGORIES = ["Growth", "Research", "Content", "Engineering", "Operations"] as const;

// Integration display config — matches platform slugs from seedIntegrationBlueprints
const INTEGRATION_META: Record<string, { icon: string; label: string; color: string }> = {
  gmail:               { icon: "✉️",  label: "Gmail",              color: "hsl(4 90% 58%)" },
  github:              { icon: "🐙",  label: "GitHub",             color: "hsl(220 13% 69%)" },
  "google-sheets":     { icon: "📊",  label: "Google Sheets",      color: "hsl(142 68% 40%)" },
  "google-calendar":   { icon: "📅",  label: "Google Calendar",    color: "hsl(217 89% 61%)" },
  "google-ads":        { icon: "📣",  label: "Google Ads",         color: "hsl(38 92% 50%)" },
  "google-analytics":  { icon: "📈",  label: "Google Analytics",   color: "hsl(38 92% 50%)" },
  hubspot:             { icon: "🔶",  label: "HubSpot",            color: "hsl(20 90% 56%)" },
  airtable:            { icon: "🗄️", label: "Airtable",           color: "hsl(258 60% 60%)" },
  apollo:              { icon: "🚀",  label: "Apollo.io",          color: "hsl(213 80% 56%)" },
  bitbucket:           { icon: "🔵",  label: "Bitbucket",          color: "hsl(213 75% 45%)" },
  confluence:          { icon: "📘",  label: "Confluence",         color: "hsl(213 75% 45%)" },
  "facebook-ads":      { icon: "📘",  label: "Meta Ads",           color: "hsl(221 44% 41%)" },
  figma:               { icon: "🎨",  label: "Figma",              color: "hsl(258 78% 55%)" },
  "github-actions":    { icon: "⚙️",  label: "GitHub Actions",     color: "hsl(220 13% 69%)" },
  greenhouse:          { icon: "🌿",  label: "Greenhouse",         color: "hsl(142 68% 40%)" },
  gusto:               { icon: "💚",  label: "Gusto",              color: "hsl(142 68% 40%)" },
  hunter:              { icon: "🔎",  label: "Hunter.io",          color: "hsl(38 92% 50%)" },
  instagram:           { icon: "📸",  label: "Instagram",          color: "hsl(315 70% 50%)" },
  intercom:            { icon: "💬",  label: "Intercom",           color: "hsl(213 80% 56%)" },
  jira:                { icon: "🔷",  label: "Jira",               color: "hsl(213 75% 45%)" },
  looker:              { icon: "👁️", label: "Looker",             color: "hsl(258 60% 60%)" },
  mailchimp:           { icon: "🐵",  label: "Mailchimp",          color: "hsl(38 92% 50%)" },
  mindtickle:          { icon: "🎯",  label: "MindTickle",         color: "hsl(4 90% 58%)" },
  notion:              { icon: "📝",  label: "Notion",             color: "hsl(0 0% 60%)" },
  pipedrive:           { icon: "🔧",  label: "Pipedrive",          color: "hsl(142 68% 40%)" },
  productboard:        { icon: "📋",  label: "Productboard",       color: "hsl(258 78% 55%)" },
  razorpay:            { icon: "💳",  label: "Razorpay",           color: "hsl(213 80% 56%)" },
  salesforce:          { icon: "☁️",  label: "Salesforce",         color: "hsl(210 80% 55%)" },
  "sap-s4hana":        { icon: "🏭",  label: "SAP S/4HANA",        color: "hsl(4 90% 58%)" },
  "sap-successfactors":{ icon: "👥",  label: "SAP SuccessFactors", color: "hsl(4 90% 58%)" },
  servicenow:          { icon: "🛎️", label: "ServiceNow",         color: "hsl(142 68% 40%)" },
  shopify:             { icon: "🛍️", label: "Shopify",            color: "hsl(142 68% 40%)" },
  tiktok:              { icon: "🎵",  label: "TikTok",             color: "hsl(0 0% 90%)" },
  "twitter-x":         { icon: "𝕏",  label: "Twitter / X",        color: "hsl(0 0% 70%)" },
  typeform:            { icon: "📋",  label: "Typeform",           color: "hsl(258 78% 55%)" },
  vercel:              { icon: "▲",   label: "Vercel",             color: "hsl(0 0% 70%)" },
  workday:             { icon: "🏢",  label: "Workday",            color: "hsl(4 90% 58%)" },
  youtube:             { icon: "▶️",  label: "YouTube",            color: "hsl(4 90% 58%)" },
  zendesk:             { icon: "🎧",  label: "Zendesk",            color: "hsl(38 92% 50%)" },
  "zoho-workspace":    { icon: "🔴",  label: "Zoho Workspace",     color: "hsl(4 90% 58%)" },
  zoom:                { icon: "🎥",  label: "Zoom",               color: "hsl(213 80% 56%)" },
};

// ── Mission quality scorer (heuristic, no API) ────────────────────────────────
function scoreMissionGoal(text: string): { score: number; label: string; color: string; hint: string } {
  if (!text.trim()) return { score: 0, label: "", color: "", hint: "" };

  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  let score = 0;
  const missing: string[] = [];

  // 1. Word count ≥ 15
  if (words.length >= 15) score += 20;
  else missing.push("more detail");

  // 2. Action verb
  const actionVerbs = ["find", "build", "write", "research", "create", "analyze", "monitor", "deploy", "scrape", "generate", "audit", "track", "send", "hire", "launch"];
  if (actionVerbs.some((v) => lower.includes(v))) score += 20;
  else missing.push("an action verb");

  // 3. Quantity or scope
  if (/\d+/.test(lower) || /\b(all|every|top|each|full|complete)\b/.test(lower)) score += 20;
  else missing.push("a quantity or scope");

  // 4. Output hint
  const outputs = ["report", "email", "page", "dashboard", "thread", "file", "list", "draft", "campaign", "pitch", "post", "article", "summary"];
  if (outputs.some((o) => lower.includes(o))) score += 20;
  else missing.push("an output type");

  // 5. Platform or tool
  const platforms = ["twitter", "github", "linkedin", "gmail", "slack", "google", "notion", "stripe", "reddit", "hacker news", "producthunt", "instagram", "x.com"];
  if (platforms.some((p) => lower.includes(p))) score += 20;
  else missing.push("a platform or tool");

  const label = score <= 20 ? "Vague" : score <= 40 ? "Okay" : score <= 60 ? "Good" : score <= 80 ? "Strong" : "Excellent";
  const color = score <= 20 ? "text-muted-foreground/40" : score <= 40 ? "text-yellow-500/70" : score <= 60 ? "text-orange-400/80" : "text-green-400/80";
  const hint = missing.length > 0 ? `Try adding: ${missing.slice(0, 2).join(", ")}` : "Mission goal looks great!";

  return { score, label, color, hint };
}

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
      {/* Orbital rings */}
      <div className="relative mb-8 w-16 h-16 flex items-center justify-center">
        <div
          className="absolute rounded-full border border-dashed animate-[ring-rotate_6s_linear_infinite]"
          style={{
            width: "3.5rem",
            height: "3.5rem",
            borderColor: "hsl(var(--primary) / 0.25)",
          }}
        />
        <div
          className="absolute rounded-full border animate-[ring-rotate_4s_linear_infinite_reverse]"
          style={{
            width: "2.75rem",
            height: "2.75rem",
            borderColor: "hsl(var(--primary) / 0.12)",
          }}
        />
        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center relative z-10">
          <Brain className="w-5 h-5 text-primary" />
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
  const [inputFocused, setInputFocused] = useState(false);
  const [templateFilter, setTemplateFilter] = useState<string | null>(null);

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

  const goalScore = scoreMissionGoal(goal);
  const visibleTemplates = templateFilter
    ? AUTOPILOT_TEMPLATES.filter((t) => t.category === templateFilter)
    : AUTOPILOT_TEMPLATES;

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
      await launch({
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
            <div className="relative text-center pt-8 pb-2">
              {/* Ambient radial gradient */}
              <div
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 40% at 50% 0%, hsl(var(--primary) / 0.06) 0%, transparent 70%)",
                }}
              />
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest mb-5"
                style={{
                  background: "hsl(var(--primary) / 0.12)",
                  color: "hsl(var(--primary) / 0.9)",
                  border: "1px solid hsl(var(--primary) / 0.25)",
                  boxShadow: "0 0 12px hsl(var(--primary) / 0.08) inset",
                }}
              >
                <Zap className="w-3 h-3" />
                POWERED BY CLAUDE OPUS 4.6
              </div>
              <h1
                className="text-4xl font-bold text-foreground tracking-tight mb-3"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                What should your squad build?
              </h1>
              <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
                Describe any goal. AI decomposes it into tasks, assigns agents, maps dependencies, and launches — while you grab coffee.
              </p>
            </div>

            {/* Main input area */}
            <div
              className="relative rounded-2xl transition-all duration-200"
              style={{
                background: "hsl(var(--card))",
                border: inputFocused
                  ? "1px solid hsl(var(--primary) / 0.4)"
                  : `1px solid hsl(var(--border))`,
                boxShadow: inputFocused || goal.trim()
                  ? "0 0 0 1px hsl(var(--primary) / 0.12), 0 8px 32px hsl(var(--primary) / 0.06)"
                  : "0 4px 24px hsl(0 0% 0% / 0.1)",
              }}
            >
              <textarea
                ref={textareaRef}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
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
                {/* Left: mission quality score bar */}
                <div className="flex items-center gap-2">
                  {goalScore.label && (
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[20, 40, 60, 80, 100].map((threshold) => (
                          <div
                            key={threshold}
                            className="w-4 h-1.5 rounded-full transition-all duration-300"
                            style={{
                              background: goalScore.score >= threshold
                                ? goalScore.score >= 80
                                  ? "hsl(142 71% 45%)"
                                  : goalScore.score >= 60
                                    ? "hsl(38 92% 50%)"
                                    : "hsl(48 96% 53%)"
                                : "hsl(var(--border))",
                            }}
                          />
                        ))}
                      </div>
                      <span className={cn("text-[10px] font-medium transition-colors", goalScore.color)}>
                        {goalScore.label}
                      </span>
                    </div>
                  )}
                  <span className="text-[10px] text-muted-foreground/30 flex items-center gap-1 font-mono">
                    <Sparkles className="w-3 h-3" />
                    Claude decomposes · Agents execute
                  </span>
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

            {/* Contextual hint line */}
            {goal.trim() && goalScore.score < 80 && (
              <p className="text-[11px] text-muted-foreground/50 -mt-7 pl-1 transition-all">
                {goalScore.hint}
              </p>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Example goals — horizontal scroll pills with tooltips */}
            <div>
              <p className="text-xs text-muted-foreground/60 font-medium mb-3 tracking-wide uppercase">Try an example</p>
              <TooltipProvider delayDuration={400}>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_GOALS.map((ex) => (
                    <Tooltip key={ex.label}>
                      <TooltipTrigger asChild>
                        <button
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
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs text-xs leading-relaxed">
                        {ex.text}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </div>

            {/* Templates — card grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Quick-Start Templates</h2>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Pre-built missions ready to launch</p>
                </div>
                <span className="text-[10px] text-muted-foreground/40 font-mono">{visibleTemplates.length} templates</span>
              </div>

              {/* Category filter pills */}
              <div className="flex items-center gap-1.5 flex-wrap mb-4">
                <button
                  onClick={() => setTemplateFilter(null)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border",
                    !templateFilter
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "text-muted-foreground/60 hover:text-foreground hover:bg-accent border-transparent"
                  )}
                >
                  All
                </button>
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTemplateFilter(templateFilter === cat ? null : cat)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border",
                      templateFilter === cat
                        ? "bg-primary/15 text-primary border-primary/30"
                        : "text-muted-foreground/60 hover:text-foreground hover:bg-accent border-transparent"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {visibleTemplates.map((template) => {
                  const templateAgents = [...new Set(template.plan.tasks.map((t) => t.assignee))];
                  return (
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

                      {/* Meta row */}
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

                      {/* Agent emoji row */}
                      <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-border/30">
                        <div className="flex items-center gap-0.5">
                          {templateAgents.map((agent) => {
                            const agentColorVar = `--agent-${AGENT_CONFIG[agent as AgentName]?.color}`;
                            return (
                              <span
                                key={agent}
                                title={agent}
                                className="w-5 h-5 rounded-full text-[11px] flex items-center justify-center"
                                style={{
                                  background: `hsl(var(${agentColorVar}) / 0.12)`,
                                  border: `1px solid hsl(var(${agentColorVar}) / 0.25)`,
                                }}
                              >
                                {AGENT_CONFIG[agent as AgentName]?.emoji}
                              </span>
                            );
                          })}
                        </div>
                        <span className="text-[10px] text-muted-foreground/30 ml-auto">
                          {templateAgents.length} agent{templateAgents.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </button>
                  );
                })}
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

            {/* Integrations / tools banner */}
            {(() => {
              const allIntegrations = [
                ...new Set(plan.tasks.flatMap((t) => t.requiredIntegrations)),
              ].filter(Boolean);
              if (allIntegrations.length === 0) return null;
              return (
                <div
                  className="rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap"
                  style={{
                    background: "hsl(var(--primary) / 0.05)",
                    border: "1px solid hsl(var(--primary) / 0.15)",
                  }}
                >
                  <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest shrink-0">
                    Tools would be used
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {allIntegrations.map((slug) => {
                      const meta = INTEGRATION_META[slug] ?? { icon: "🔌", label: slug, color: "hsl(var(--muted-foreground))" };
                      return (
                        <span
                          key={slug}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                          style={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            color: meta.color,
                          }}
                        >
                          <span>{meta.icon}</span>
                          <span style={{ color: "hsl(var(--foreground))" }}>{meta.label}</span>
                        </span>
                      );
                    })}
                  </div>
                  <span className="ml-auto text-[10px] text-muted-foreground/40 font-mono shrink-0">
                    {allIntegrations.length} integration{allIntegrations.length !== 1 ? "s" : ""} required
                  </span>
                </div>
              );
            })()}

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
