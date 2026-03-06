import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { PilotModal } from "@/components/landing/PilotModal";
import { HeroParticleField } from "@/components/landing/HeroParticleField";
import { TypingCommand } from "@/components/landing/TypingCommand";
import { StatsBar } from "@/components/landing/StatsBar";
import { WorkflowDemo } from "@/components/landing/WorkflowDemo";
import { IntegrationGrid } from "@/components/landing/IntegrationGrid";
import { UseCaseScenario } from "@/components/landing/UseCaseScenario";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { AgentSVG } from "@/components/SquadView/AgentSVG";
import { AGENT_CONFIG } from "@/types/mission";
import type { AgentName } from "@/types/mission";
import {
  USE_CASES as ALL_USE_CASES,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_ORDER,
  getUseCasesByCategory,
  type UseCaseCategory,
} from "@/data/useCases";

// ─── Color helpers ───────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  kaze: "hsl(217, 91%, 60%)",
  scout: "hsl(160, 84%, 39%)",
  forge: "hsl(38, 92%, 50%)",
  ghost: "hsl(258, 90%, 66%)",
  sentinel: "hsl(330, 81%, 60%)",
};

const AGENT_CAPABILITIES: Record<AgentName, string[]> = {
  Kaze: ["Orchestrate complex missions", "Delegate to specialist agents", "Approve & reject deliverables"],
  Scout: ["Research markets & competitors", "Monitor industry trends", "Synthesize intelligence briefs"],
  Forge: ["Write & deploy production code", "Review PRs on GitHub", "Build automations & integrations"],
  Ghost: ["Draft tweets & LinkedIn posts", "Write emails & blog content", "Distribute across channels"],
  Sentinel: ["Monitor system health", "Audit agent decisions", "Flag anomalies & failures"],
};

// ─── Scroll reveal variants ──────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 48, filter: "blur(4px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
};

// ─── Hero animated mission visual ────────────────────────────────────────────
// Two-panel layout: Left = command center terminal, Right = notification toast stack
// Tells the story: user gives instruction → agents decompose → execute across integrations → QA → complete

const HERO_AGENTS = [
  { name: "Kaze",     emoji: "🌀", color: "hsl(217,91%,60%)",  role: "Orchestrator", activeAt: 0,  doneAt: 999 },
  { name: "Scout",    emoji: "🔭", color: "hsl(160,84%,39%)",  role: "Analytics",    activeAt: 6,  doneAt: 35 },
  { name: "Forge",    emoji: "🔨", color: "hsl(38,92%,50%)",   role: "Builder",      activeAt: 12, doneAt: 62 },
  { name: "Ghost",    emoji: "👻", color: "hsl(258,90%,66%)",  role: "Writer",       activeAt: 38, doneAt: 88 },
  { name: "Sentinel", emoji: "🔍", color: "hsl(330,81%,60%)",  role: "QA",           activeAt: 60, doneAt: 80 },
];

// Each step in the execution timeline
// Narrative: Weekly marketing report — pull all channel data → aggregate → analyze → write insights → build deck → QA → distribute
const HERO_STEPS: {
  t: number; agent: string; color: string; text: string;
  logo?: string; type: "plan" | "tool" | "done" | "handoff" | "review" | "fix" | "complete";
}[] = [
  // Phase 1: Decompose
  { t: 2,  agent: "Kaze",     color: "hsl(217,91%,60%)", text: "Decomposing mission → 9 parallel subtasks across 5 agents",       type: "plan" },
  { t: 5,  agent: "Kaze",     color: "hsl(217,91%,60%)", text: "Delegating: Scout → channel data, Forge → dashboards, Ghost → report", type: "plan" },
  // Phase 2: Pull channel performance data (Scout + Forge in parallel)
  { t: 8,  agent: "Scout",    color: "hsl(160,84%,39%)", text: "Pulling website sessions, bounce rate & conversions from GA",      type: "tool", logo: "googleanalytics" },
  { t: 12, agent: "Scout",    color: "hsl(160,84%,39%)", text: "Extracting ad spend, ROAS & CPL from Google Ads",                 type: "tool", logo: "googleads" },
  { t: 16, agent: "Scout",    color: "hsl(160,84%,39%)", text: "Pulling Meta Ads — impressions, CTR, CPA across 12 campaigns",    type: "tool", logo: "meta" },
  { t: 19, agent: "Forge",    color: "hsl(38,92%,50%)",  text: "Pulling LinkedIn Ads — engagement, leads & cost-per-MQL",          type: "tool", logo: "linkedin" },
  { t: 23, agent: "Scout",    color: "hsl(160,84%,39%)", text: "Extracting email campaign metrics from HubSpot — opens, clicks, revenue", type: "tool", logo: "hubspot" },
  { t: 27, agent: "Forge",    color: "hsl(38,92%,50%)",  text: "Pulling CRM pipeline changes — new MQLs, SQLs, opps from Salesforce", type: "tool", logo: "salesforce" },
  { t: 31, agent: "Scout",    color: "hsl(160,84%,39%)", text: "All 6 channel data sources collected — 847 data points",          type: "done" },
  // Phase 3: Aggregate + build dashboards
  { t: 34, agent: "Forge",    color: "hsl(38,92%,50%)",  text: "Normalizing spend & attribution data → Google Sheets master",      type: "tool", logo: "googlesheets" },
  { t: 38, agent: "Forge",    color: "hsl(38,92%,50%)",  text: "Building channel comparison dashboard + trend charts in Airtable", type: "tool", logo: "airtable" },
  { t: 41, agent: "Forge",    color: "hsl(38,92%,50%)",  text: "Handoff → Scout: aggregated data for cross-channel analysis",     type: "handoff" },
  // Phase 4: Analyze + write insights
  { t: 44, agent: "Scout",    color: "hsl(160,84%,39%)", text: "Cross-channel attribution analysis — identifying top converters",  type: "tool", logo: "google" },
  { t: 47, agent: "Scout",    color: "hsl(160,84%,39%)", text: "Handoff → Ghost: channel data + insights for weekly report",      type: "handoff" },
  { t: 50, agent: "Ghost",    color: "hsl(258,90%,66%)", text: "Writing weekly marketing report in Notion — performance + insights", type: "tool", logo: "notion" },
  { t: 54, agent: "Ghost",    color: "hsl(258,90%,66%)", text: "Drafting budget reallocation recommendations based on ROAS",      type: "tool", logo: "notion" },
  // Phase 5: Build report deck
  { t: 57, agent: "Forge",    color: "hsl(38,92%,50%)",  text: "Building 18-slide report deck — charts, heatmaps, funnels → Figma", type: "tool", logo: "figma" },
  { t: 60, agent: "Forge",    color: "hsl(38,92%,50%)",  text: "Creating action items from insights → Jira tickets for next sprint", type: "tool", logo: "jira" },
  // Phase 6: QA — flag → fix → approve
  { t: 63, agent: "Ghost",    color: "hsl(258,90%,66%)", text: "Handoff → Sentinel: full report + deck + data for QA",            type: "handoff" },
  { t: 66, agent: "Sentinel", color: "hsl(330,81%,60%)", text: "Auditing channel metrics — cross-checking GA vs ad platform data", type: "review" },
  { t: 69, agent: "Sentinel", color: "hsl(330,81%,60%)", text: "⚠ Attribution mismatch — Meta CPA off by 18%, wrong UTM window", type: "review" },
  { t: 72, agent: "Forge",    color: "hsl(38,92%,50%)",  text: "Fixing UTM attribution window, recalculating Meta CPA from source", type: "fix" },
  { t: 75, agent: "Forge",    color: "hsl(38,92%,50%)",  text: "Re-submitted corrected data → Sentinel for re-review",            type: "handoff" },
  { t: 78, agent: "Sentinel", color: "hsl(330,81%,60%)", text: "✓ All metrics verified — report, deck & attribution approved",    type: "done" },
  // Phase 7: Distribute
  { t: 81, agent: "Ghost",    color: "hsl(258,90%,66%)", text: "Emailing weekly report + deck → team via Gmail",                  type: "tool", logo: "gmail" },
  { t: 84, agent: "Ghost",    color: "hsl(258,90%,66%)", text: "Posting highlights + key wins → Slack #marketing",                type: "tool", logo: "slack" },
  { t: 87, agent: "Ghost",    color: "hsl(258,90%,66%)", text: "Scheduling budget review meeting → Google Calendar",              type: "tool", logo: "googlecalendar" },
  { t: 90, agent: "Forge",    color: "hsl(38,92%,50%)",  text: "Triggering weekly snapshot archive + alerts via Zapier",           type: "tool", logo: "zapier" },
  // Phase 8: Complete
  { t: 93, agent: "Kaze",     color: "hsl(217,91%,60%)", text: "Mission complete — 9/9 tasks, report delivered before 9am Monday", type: "complete" },
];

// Toast notifications — mix of agent intelligence + integration results
const HERO_TOASTS: {
  t: number; logo?: string; emoji?: string; agentColor: string;
  headline: string; detail: string; metric?: string; agent: string;
  kind: "agent" | "integration";
}[] = [
  { t: 2,  kind: "agent",       emoji: "🌀", agentColor: "hsl(217,91%,60%)", headline: "Mission Decomposed",       detail: "Analyzed prompt — 9 subtasks: pull 6 channels, aggregate, analyze, write report, build deck, QA, distribute", metric: "9 tasks",      agent: "Kaze" },
  { t: 10, kind: "integration", logo: "googleanalytics", agentColor: "hsl(160,84%,39%)", headline: "Website Data Pulled",  detail: "43,291 sessions, 2.8% conversion rate, 62% bounce — top pages & referral sources extracted",          metric: "43k sessions", agent: "Scout" },
  { t: 18, kind: "integration", logo: "meta",            agentColor: "hsl(160,84%,39%)", headline: "Meta Ads Synced",      detail: "$12.4k spent across 12 campaigns — 2.1x ROAS, best: lookalike retarget at $18 CPA",                   metric: "$12.4k spend", agent: "Scout" },
  { t: 25, kind: "integration", logo: "hubspot",         agentColor: "hsl(160,84%,39%)", headline: "Email Metrics Pulled", detail: "6 campaigns sent: 34% avg open rate, 4.2% CTR — nurture sequence driving 68% of MQLs",                metric: "34% opens",    agent: "Scout" },
  { t: 32, kind: "agent",       emoji: "🔭", agentColor: "hsl(160,84%,39%)", headline: "All Channels Collected",   detail: "GA, Google Ads, Meta, LinkedIn, HubSpot, Salesforce — 847 data points normalized across 6 platforms", metric: "847 points",   agent: "Scout" },
  { t: 40, kind: "integration", logo: "airtable",        agentColor: "hsl(38,92%,50%)",  headline: "Dashboard Built",      detail: "Channel comparison, spend heatmap, funnel waterfall, WoW trend lines — all auto-generated",          metric: "16 charts",    agent: "Forge" },
  { t: 52, kind: "agent",       emoji: "👻", agentColor: "hsl(258,90%,66%)", headline: "Report Written",           detail: "12-page Notion doc: executive summary, channel breakdowns, budget recommendations & next steps",      metric: "12 pages",     agent: "Ghost" },
  { t: 58, kind: "integration", logo: "figma",           agentColor: "hsl(38,92%,50%)",  headline: "Slide Deck Built",     detail: "18-slide deck with spend heatmaps, attribution funnels, ROAS comparisons & trend overlays",           metric: "18 slides",    agent: "Forge" },
  { t: 67, kind: "agent",       emoji: "🔍", agentColor: "hsl(330,81%,60%)", headline: "QA Flagged Issue",         detail: "Meta CPA attribution off by 18% — wrong UTM window used. Routed back to Forge for correction.",       metric: "1 error",      agent: "Sentinel" },
  { t: 73, kind: "agent",       emoji: "🔨", agentColor: "hsl(38,92%,50%)",  headline: "Attribution Fixed",        detail: "Corrected UTM attribution window, recalculated Meta CPA from source — re-submitted for QA",           metric: "✓ Fixed",      agent: "Forge" },
  { t: 79, kind: "agent",       emoji: "🔍", agentColor: "hsl(142,71%,45%)", headline: "QA Approved ✓",            detail: "All metrics cross-checked against source platforms. Report, deck & dashboard verified.",               metric: "✓ Verified",   agent: "Sentinel" },
  { t: 85, kind: "integration", logo: "slack",           agentColor: "hsl(258,90%,66%)", headline: "Report Distributed",   detail: "Weekly report emailed to team, highlights posted to #marketing, budget review meeting scheduled",     metric: "Delivered",    agent: "Ghost" },
  { t: 94, kind: "agent",       emoji: "🌀", agentColor: "hsl(142,71%,45%)", headline: "Mission Complete",         detail: "Cross-channel marketing report built & delivered before 9am Monday. 0 manual steps.",                  metric: "✓ Done",       agent: "Kaze" },
];

function HeroMissionVisual() {
  const [tick, setTick] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const id = setInterval(() => setTick((t) => (t >= 118 ? 0 : t + 1)), 220);
    return () => clearInterval(id);
  }, [prefersReduced]);

  const rd = prefersReduced;
  const visibleSteps = rd ? HERO_STEPS : HERO_STEPS.filter((s) => tick >= s.t);
  const missionDone = rd || tick >= 93;
  const isFading = !rd && tick >= 110;

  // Progress
  const doneCount = rd ? 9 : Math.min(9, visibleSteps.filter((s) => s.type === "done" || s.type === "complete").length);
  const progress = rd ? 100 : Math.min(100, Math.round((doneCount / 9) * 100));

  // Metrics
  const sessions = rd ? 43 : tick < 10 ? 0 : tick < 20 ? Math.min(43, Math.round((tick - 10) * 4.3)) : 43;
  const adSpend = rd ? 32 : tick < 14 ? 0 : tick < 28 ? Math.min(32, Math.round((tick - 14) * 2.3)) : 32;
  const dataPoints = rd ? 847 : tick < 8 ? 0 : tick < 32 ? Math.min(847, Math.round((tick - 8) * 35.3)) : 847;

  // Toast — show only the latest 1 active toast, each visible for 10 ticks (~1.5s)
  const activeToast = rd ? HERO_TOASTS[HERO_TOASTS.length - 1] : HERO_TOASTS.filter((t) => tick >= t.t && tick < t.t + 10).slice(-1)[0] ?? null;

  // Integration icons that have been activated
  const INTEGRATIONS = [
    { logo: "googleanalytics", t: 8,  name: "Analytics" },
    { logo: "googleads", t: 12, name: "Google Ads" },
    { logo: "meta", t: 16, name: "Meta Ads" },
    { logo: "linkedin", t: 19, name: "LinkedIn" },
    { logo: "hubspot", t: 23, name: "HubSpot" },
    { logo: "salesforce", t: 27, name: "Salesforce" },
    { logo: "googlesheets", t: 34, name: "Sheets" },
    { logo: "airtable", t: 38, name: "Airtable" },
    { logo: "google", t: 44, name: "Google" },
    { logo: "notion", t: 50, name: "Notion" },
    { logo: "figma", t: 57, name: "Figma" },
    { logo: "jira", t: 60, name: "Jira" },
    { logo: "gmail", t: 81, name: "Gmail" },
    { logo: "slack", t: 84, name: "Slack" },
    { logo: "googlecalendar", t: 87, name: "Calendar" },
    { logo: "zapier", t: 90, name: "Zapier" },
  ];
  const activeIntegrations = rd ? INTEGRATIONS.length : INTEGRATIONS.filter((i) => tick >= i.t).length;

  // Color helper
  const ca = (color: string, a: number) => color.replace("hsl(", "hsla(").replace(")", `, ${a})`);

  // Type badge styles
  const typeStyle = (type: string) => {
    const map: Record<string, { bg: string; bd: string; label: string; fg: string }> = {
      plan:     { bg: "hsl(217 91% 60% / 0.06)", bd: "hsl(217 91% 60% / 0.15)", label: "PLAN",    fg: "hsl(217,91%,70%)" },
      tool:     { bg: "hsl(38 92% 50% / 0.06)",  bd: "hsl(38 92% 50% / 0.15)",  label: "EXECUTE", fg: "hsl(38,92%,60%)" },
      done:     { bg: "hsl(142 71% 45% / 0.06)", bd: "hsl(142 71% 45% / 0.15)", label: "DONE",    fg: "hsl(142,71%,55%)" },
      handoff:  { bg: "hsl(188 80% 55% / 0.06)", bd: "hsl(188 80% 55% / 0.15)", label: "HANDOFF", fg: "hsl(188,80%,60%)" },
      review:   { bg: "hsl(330 81% 60% / 0.06)", bd: "hsl(330 81% 60% / 0.15)", label: "REVIEW",  fg: "hsl(330,81%,70%)" },
      fix:      { bg: "hsl(258 90% 66% / 0.06)", bd: "hsl(258 90% 66% / 0.15)", label: "FIX",     fg: "hsl(258,90%,75%)" },
      complete: { bg: "hsl(142 71% 45% / 0.1)",  bd: "hsl(142 71% 45% / 0.35)", label: "✓ DONE",  fg: "hsl(142,71%,55%)" },
    };
    return map[type] || map.plan;
  };

  return (
    <div
      className="w-full select-none"
      style={{ maxWidth: 820, opacity: isFading ? 0 : 1, transition: "opacity 0.8s ease" }}
    >
      {/* ══════ MAIN CARD — fixed dimensions ══════ */}
      <div
        className="rounded-2xl overflow-hidden flex flex-col w-full"
        style={{
          height: 560,
          minHeight: 560,
          maxHeight: 560,
          background: "hsl(240 25% 4%)",
          border: `1px solid ${missionDone ? "hsl(142 71% 45% / 0.3)" : "hsl(217 91% 60% / 0.15)"}`,
          boxShadow: `0 32px 80px hsl(240 33% 2% / 0.9), 0 0 60px ${missionDone ? "hsl(142 71% 45% / 0.06)" : "hsl(217 91% 60% / 0.04)"}`,
          transition: "border-color 0.6s, box-shadow 0.6s",
        }}
      >
        {/* ── Row 1: Header bar ── */}
        <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0" style={{ background: "hsl(240 25% 6%)", borderBottom: "1px solid hsl(var(--border) / 0.12)" }}>
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
          <span className="ml-2 text-[10px] text-muted-foreground/30 font-mono tracking-widest">MISSION CONTROL</span>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--border) / 0.15)" }}>
                <div className="h-full rounded-full" style={{
                  width: `${progress}%`,
                  background: missionDone ? "hsl(142,71%,45%)" : "linear-gradient(90deg, hsl(217,91%,60%), hsl(258,90%,66%))",
                  transition: "width 0.5s ease",
                }} />
              </div>
              <span className="text-[9px] font-mono font-bold tabular-nums" style={{ color: missionDone ? "hsl(142,71%,55%)" : "hsl(217,91%,65%)" }}>
                {doneCount}/9
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[8px] text-red-400/50 font-mono tracking-widest">LIVE</span>
            </div>
          </div>
        </div>

        {/* ── Row 2: Mission prompt ── */}
        <div className="px-4 py-2.5 flex-shrink-0 flex items-start gap-3" style={{
          background: "linear-gradient(135deg, hsl(217 91% 60% / 0.04), hsl(240 25% 5%))",
          borderBottom: "1px solid hsl(var(--border) / 0.1)",
          opacity: rd || tick >= 1 ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}>
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-px">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "hsl(217 91% 60% / 0.12)", border: "1px solid hsl(217 91% 60% / 0.2)" }}>
              <span className="text-[10px]">💬</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] leading-relaxed text-white/75 italic">
              "Pull last week's performance across all channels, build the weekly marketing report, and send it to the team by Monday 9am."
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[7px] font-mono text-muted-foreground/20">YOU → KAZE</span>
              <span className="text-[7px] font-mono px-1.5 py-px rounded-sm" style={{ background: "hsl(217 91% 60% / 0.08)", border: "1px solid hsl(217 91% 60% / 0.15)", color: "hsl(217,91%,65%)" }}>
                5 agents · 16 integrations
              </span>
            </div>
          </div>
        </div>

        {/* ── Row 3: Main body — 3 columns ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── Col 1: Agent squad ── */}
          <div className="w-[115px] flex-shrink-0 p-2 flex flex-col gap-1 overflow-hidden" style={{ borderRight: "1px solid hsl(var(--border) / 0.08)" }}>
            <div className="text-[7px] font-mono tracking-[0.2em] text-muted-foreground/20 px-1 mb-0.5">AGENTS</div>
            {HERO_AGENTS.map((a) => {
              const active = rd || (tick >= a.activeAt && tick < a.doneAt);
              const done = !rd && tick >= a.doneAt && a.doneAt < 999;
              const isOrch = a.name === "Kaze";
              return (
                <div
                  key={a.name}
                  className="rounded-lg px-2 py-[5px] relative"
                  style={{
                    background: active && !done ? ca(a.color, 0.06) : "transparent",
                    border: `1px solid ${active && !done ? ca(a.color, 0.2) : done ? "hsl(142 71% 45% / 0.12)" : "transparent"}`,
                    transition: "all 0.4s",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">{a.emoji}</span>
                    <span className="text-[9px] font-semibold" style={{ color: done ? "hsl(142,71%,55%)" : active ? a.color : "hsl(0 0% 30%)" }}>{a.name}</span>
                    <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{
                      background: done ? "hsl(142,71%,45%)" : active ? a.color : "hsl(0 0% 18%)",
                      boxShadow: active && !done ? `0 0 6px ${a.color}` : "none",
                      animation: active && !done ? "pulse 2s ease-in-out infinite" : "none",
                    }} />
                  </div>
                  <div className="text-[7px] mt-0.5 font-mono" style={{ color: done ? "hsl(142,71%,45%)" : active ? ca(a.color, 0.5) : "hsl(0 0% 20%)" }}>
                    {isOrch ? (missionDone ? "✓ Complete" : "Orchestrating") : done ? "✓ Done" : active ? a.role : "Idle"}
                  </div>
                </div>
              );
            })}

            {/* Metrics */}
            <div className="mt-auto pt-2 px-1 space-y-1.5" style={{ borderTop: "1px solid hsl(var(--border) / 0.06)" }}>
              <div className="text-[7px] font-mono tracking-[0.2em] text-muted-foreground/20">METRICS</div>
              {[
                { label: "Sessions",  val: `${sessions}k`,   color: "hsl(160,84%,39%)", on: sessions > 0 },
                { label: "Ad spend",  val: `$${adSpend}k`,   color: "hsl(38,92%,50%)",  on: adSpend > 0 },
                { label: "Data pts",  val: `${dataPoints}`,  color: "hsl(258,90%,66%)", on: dataPoints > 0 },
              ].map((m) => (
                <div key={m.label} className="flex items-baseline justify-between">
                  <span className="text-[7px] font-mono text-muted-foreground/25">{m.label}</span>
                  <span className="text-[11px] font-bold font-mono tabular-nums" style={{ color: m.on ? m.color : "hsl(0 0% 15%)", transition: "color 0.5s" }}>{m.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Col 2: Execution log ── */}
          <div className="flex-1 flex flex-col min-w-0" style={{ borderRight: "1px solid hsl(var(--border) / 0.08)" }}>
            <div className="flex items-center px-3 py-1.5 flex-shrink-0" style={{ borderBottom: "1px solid hsl(var(--border) / 0.06)" }}>
              <span className="text-[7px] font-mono tracking-[0.2em] text-muted-foreground/20">EXECUTION LOG</span>
              <span className="ml-auto text-[7px] font-mono text-muted-foreground/12 tabular-nums">{visibleSteps.length} / {HERO_STEPS.length}</span>
            </div>
            <div className="flex-1 overflow-hidden relative">
              {visibleSteps.length > 7 && (
                <div className="absolute top-0 left-0 right-0 h-6 pointer-events-none z-10" style={{ background: "linear-gradient(to bottom, hsl(240 25% 4%), transparent)" }} />
              )}
              <div className="px-2 py-1 space-y-0.5 h-full">
                {visibleSteps.slice(-8).map((s, i) => {
                  const isLatest = i === visibleSteps.slice(-8).length - 1 && !rd;
                  const st = typeStyle(s.type);
                  return (
                    <div
                      key={`${s.t}-${s.agent}`}
                      className="flex items-start gap-2 px-2.5 py-[6px] rounded-lg"
                      style={{
                        background: isLatest || s.type === "complete" ? st.bg : "transparent",
                        border: `1px solid ${isLatest || s.type === "complete" ? st.bd : "transparent"}`,
                        opacity: rd ? 1 : isLatest ? 1 : 0.35,
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div className="w-[3px] rounded-full flex-shrink-0 self-stretch mt-0.5 mb-0.5" style={{ background: s.color, opacity: isLatest ? 0.7 : 0.2 }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold" style={{ color: s.color }}>{s.agent}</span>
                          <span className="text-[7px] font-mono px-1.5 py-px rounded-sm font-medium" style={{ background: st.bg, border: `1px solid ${st.bd}`, color: st.fg }}>
                            {st.label}
                          </span>
                          {s.logo && (
                            <img src={`https://cdn.simpleicons.org/${s.logo}`} alt="" width="10" height="10"
                              style={{ filter: "brightness(0) invert(1)", opacity: 0.35, flexShrink: 0, marginLeft: 2 }} />
                          )}
                        </div>
                        <div className="text-[9px] text-muted-foreground/45 leading-relaxed mt-0.5 line-clamp-1">{s.text}</div>
                      </div>
                    </div>
                  );
                })}
                {!missionDone && visibleSteps.length > 0 && (
                  <div className="flex items-center gap-2 px-2.5 py-1.5">
                    <div className="flex gap-0.5">
                      <div className="w-1 h-1 rounded-full bg-blue-400/40 animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-blue-400/25 animate-pulse" style={{ animationDelay: "0.2s" }} />
                      <div className="w-1 h-1 rounded-full bg-blue-400/15 animate-pulse" style={{ animationDelay: "0.4s" }} />
                    </div>
                    <span className="text-[8px] text-muted-foreground/15 font-mono">processing...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Col 3: Live toast + integrations ── */}
          <div className="w-[230px] flex-shrink-0 flex flex-col overflow-hidden hidden sm:flex">

            {/* Active toast */}
            <div className="flex-1 flex flex-col justify-center p-2.5">
              {activeToast ? (() => {
                const age = tick - activeToast.t;
                const entering = !rd && age < 4;
                const exiting = !rd && age > 7;
                return (
                  <div
                    key={`toast-${activeToast.t}`}
                    className="rounded-xl overflow-hidden relative"
                    style={{
                      background: `linear-gradient(145deg, ${ca(activeToast.agentColor, 0.08)}, hsl(240 25% 5% / 0.98))`,
                      border: `1px solid ${ca(activeToast.agentColor, 0.3)}`,
                      boxShadow: `0 8px 32px hsl(240 33% 2% / 0.7), 0 0 ${entering ? 50 : 24}px ${ca(activeToast.agentColor, entering ? 0.2 : 0.08)}`,
                      opacity: rd ? 1 : entering ? Math.min(1, age / 3) : exiting ? Math.max(0, 1 - (age - 7) / 3) : 1,
                      transform: rd ? "none" : entering ? `translateY(${12 - age * 3}px) scale(0.95)` : "translateY(0) scale(1)",
                      transition: "opacity 0.35s ease-out, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease",
                    }}
                  >
                    {/* Top glow line */}
                    <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${activeToast.agentColor}, transparent)`, opacity: entering ? age / 4 : 1, transition: "opacity 0.3s" }} />

                    <div className="p-3.5">
                      {/* Kind label */}
                      <div className="text-[7px] font-mono tracking-[0.15em] mb-2" style={{ color: activeToast.kind === "agent" ? activeToast.agentColor : "hsl(0 0% 40%)" }}>
                        {activeToast.kind === "agent" ? "🤖 AI AGENT" : "⚡ INTEGRATION"}
                      </div>

                      {/* Icon + headline */}
                      <div className="flex items-start gap-2.5 mb-2">
                        <div className="flex items-center justify-center flex-shrink-0" style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: ca(activeToast.agentColor, 0.12),
                          border: `1px solid ${ca(activeToast.agentColor, 0.2)}`,
                          boxShadow: `0 0 16px ${ca(activeToast.agentColor, 0.12)}`,
                        }}>
                          {activeToast.kind === "agent" ? (
                            <span className="text-[16px]">{activeToast.emoji}</span>
                          ) : (
                            <img src={`https://cdn.simpleicons.org/${activeToast.logo}`} alt="" width="18" height="18"
                              style={{ filter: "brightness(0) invert(1)", opacity: 0.9 }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-white/90 leading-tight">{activeToast.headline}</div>
                          <div className="text-[8px] font-mono text-muted-foreground/25 mt-0.5">by {activeToast.agent}</div>
                        </div>
                      </div>

                      {/* Detail */}
                      <div className="text-[9px] text-muted-foreground/45 leading-relaxed mb-2.5">{activeToast.detail}</div>

                      {/* Metric */}
                      {activeToast.metric && (
                        <div className="flex items-center gap-2 rounded-md px-2.5 py-1.5" style={{
                          background: ca(activeToast.agentColor, 0.08),
                          border: `1px solid ${ca(activeToast.agentColor, 0.12)}`,
                        }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: activeToast.agentColor, boxShadow: `0 0 6px ${activeToast.agentColor}` }} />
                          <span className="text-[12px] font-bold font-mono tabular-nums" style={{ color: activeToast.agentColor }}>{activeToast.metric}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })() : (
                <div className="rounded-xl border border-dashed flex items-center justify-center py-6" style={{ borderColor: "hsl(var(--border) / 0.06)" }}>
                  <span className="text-[9px] font-mono text-muted-foreground/12">Awaiting events...</span>
                </div>
              )}
            </div>

            {/* Integration strip at bottom */}
            <div className="p-2.5 pt-0 flex-shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[7px] font-mono tracking-[0.2em] text-muted-foreground/15">INTEGRATIONS</span>
                <span className="text-[8px] font-mono font-bold tabular-nums" style={{ color: activeIntegrations > 0 ? "hsl(38,92%,55%)" : "hsl(0 0% 20%)", transition: "color 0.5s" }}>
                  {activeIntegrations}/{INTEGRATIONS.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {INTEGRATIONS.map((int) => {
                  const on = rd || tick >= int.t;
                  const justActivated = !rd && tick >= int.t && tick < int.t + 4;
                  return (
                    <div key={int.logo} className="w-6 h-6 rounded-md flex items-center justify-center" style={{
                      background: on ? "hsl(var(--foreground) / 0.05)" : "hsl(240 25% 7%)",
                      border: `1px solid ${justActivated ? "hsl(38 92% 50% / 0.4)" : on ? "hsl(var(--foreground) / 0.08)" : "hsl(var(--border) / 0.04)"}`,
                      boxShadow: justActivated ? "0 0 12px hsl(38 92% 50% / 0.15)" : "none",
                      opacity: on ? 1 : 0.2,
                      transition: "all 0.4s ease",
                    }}>
                      <img src={`https://cdn.simpleicons.org/${int.logo}`} alt="" width="11" height="11"
                        style={{ filter: "brightness(0) invert(1)", opacity: on ? 0.6 : 0.1, transition: "opacity 0.4s" }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 4: Footer ── */}
        <div
          className="px-4 py-2 flex items-center gap-2 flex-shrink-0"
          style={{
            borderTop: "1px solid hsl(var(--border) / 0.12)",
            background: missionDone ? "hsl(142 71% 45% / 0.04)" : "hsl(240 25% 5%)",
            transition: "background 0.6s",
          }}
        >
          {missionDone ? (
            <>
              <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 8px hsl(142 71% 45% / 0.5)" }} />
              <span className="text-[10px] font-mono font-bold text-green-400/80 tracking-wide">MISSION COMPLETE</span>
              <div className="flex-1" />
              {[
                { l: "5 agents", c: "hsl(217,91%,60%)" },
                { l: "16 integrations", c: "hsl(38,92%,50%)" },
                { l: "6 channels", c: "hsl(258,90%,66%)" },
                { l: "0 manual steps", c: "hsl(142,71%,45%)" },
              ].map((m) => (
                <span key={m.l} className="text-[7px] font-mono px-1.5 py-0.5 rounded-full" style={{ background: ca(m.c, 0.1), border: `1px solid ${ca(m.c, 0.2)}`, color: m.c }}>
                  {m.l}
                </span>
              ))}
            </>
          ) : (
            <>
              <div className="flex items-center gap-1">
                {HERO_AGENTS.map((a) => {
                  const on = rd || (tick >= a.activeAt && (a.doneAt === 999 || tick < a.doneAt));
                  const dn = !rd && tick >= a.doneAt && a.doneAt < 999;
                  return <div key={a.name} className="w-1.5 h-1.5 rounded-full" style={{ background: dn ? "hsl(142,71%,45%)" : on ? a.color : "hsl(0 0% 18%)", transition: "all 0.3s" }} />;
                })}
              </div>
              <span className="text-[7px] font-mono text-muted-foreground/15 ml-1">{HERO_AGENTS.filter((a) => rd || (tick >= a.activeAt && (a.doneAt === 999 || tick < a.doneAt))).length} active</span>
              <div className="flex-1" />
              <span className="text-[8px] text-muted-foreground/15 font-mono tabular-nums">{activeIntegrations} integrations · {Math.round(tick * 0.15)}s</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section wrapper with scroll reveal ─────────────────────────────────────
function RevealSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Compact use cases grid ─────────────────────────────────────────────────
function UseCaseCompactGrid({ onNavigate, activeTab, setActiveTab }: {
  onNavigate: (slug: string) => void;
  activeTab: UseCaseCategory;
  setActiveTab: (cat: UseCaseCategory) => void;
}) {
  const grouped = getUseCasesByCategory();
  const activeCases = (grouped[activeTab] ?? []).slice(0, 3);
  const activeAccent = activeCases[0]?.accentColor ?? "hsl(217, 91%, 60%)";

  return (
    <div className="mb-12 max-w-xl mx-auto">
      {/* Domain tabs */}
      <div className="flex gap-1.5 flex-wrap justify-center mb-4">
        {CATEGORY_ORDER.map((cat) => {
          const isActive = cat === activeTab;
          const accent = grouped[cat]?.[0]?.accentColor ?? "hsl(217,91%,60%)";
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200"
              style={{
                background: isActive ? accent.replace(")", " / 0.12)").replace("hsl(", "hsl(") : "transparent",
                border: `1px solid ${isActive ? accent.replace(")", " / 0.4)").replace("hsl(", "hsl(") : "hsl(var(--border) / 0.3)"}`,
                color: isActive ? accent : "hsl(var(--muted-foreground) / 0.45)",
              }}
            >
              {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
            </button>
          );
        })}
      </div>

      {/* Use case list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="rounded-xl overflow-hidden"
          style={{ border: `1px solid ${activeAccent.replace(")", " / 0.15)").replace("hsl(", "hsl(")}` }}
        >
          {activeCases.map((uc, i) => (
            <button
              key={uc.slug}
              onClick={() => onNavigate(uc.slug)}
              className="group w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150"
              style={{
                borderBottom: i < activeCases.length - 1 ? `1px solid ${activeAccent.replace(")", " / 0.08)").replace("hsl(", "hsl(")}` : "none",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = activeAccent.replace(")", " / 0.06)").replace("hsl(", "hsl("); }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span className="text-base leading-none shrink-0">{uc.icon}</span>
              <span className="text-[12px] font-medium text-muted-foreground/60 group-hover:text-foreground/80 transition-colors flex-1">
                {uc.title}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground/25 group-hover:text-muted-foreground/45 transition-colors shrink-0 hidden sm:block">
                {uc.hoursSaved.split("·")[0].trim()}
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="shrink-0 opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: activeAccent }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Use cases section (tabs + workflow cards, shared state) ─────────────────
function UseCasesSection({ onNavigate }: { onNavigate: (slug: string) => void }) {
  const [activeTab, setActiveTab] = useState<UseCaseCategory>(CATEGORY_ORDER[0]);
  const grouped = getUseCasesByCategory();
  const displayCases = (grouped[activeTab] ?? []).slice(0, 3);

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <RevealSection className="text-center mb-8 space-y-3">
          <motion.div variants={itemVariants}>
            <span
              className="text-xs font-mono tracking-widest px-2 py-1 rounded"
              style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}
            >
              REAL WORKFLOWS
            </span>
          </motion.div>
          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold">
            Complex work, done autonomously.
          </motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground text-lg max-w-xl mx-auto">
            Multi-agent missions with real tool calls — across your entire stack.
          </motion.p>
        </RevealSection>

        {/* ── Compact use cases grid ── */}
        <UseCaseCompactGrid
          onNavigate={onNavigate}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* ── Workflow cards — filtered by active tab ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {displayCases.map((uc, i) => (
              <UseCaseScenario
                key={i}
                title={uc.title}
                icon={uc.icon}
                trigger={uc.trigger}
                steps={uc.steps}
                result={uc.result}
                metric={uc.metric}
                accentColor={uc.accentColor}
                hoursSaved={uc.hoursSaved}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── Navigation ─────────────────────────────────────────────────────────────
function UseCasesMegaMenu({ onNavigate }: { onNavigate: (slug: string) => void }) {
  const [activeCategory, setActiveCategory] = useState<UseCaseCategory>("sales");
  const grouped = getUseCasesByCategory();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[720px] max-w-[calc(100vw-2rem)] rounded-xl overflow-hidden"
      style={{
        background: "hsl(240 33% 6% / 0.98)",
        border: "1px solid hsl(var(--border) / 0.5)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 20px 60px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex min-h-[340px]">
        {/* Left: Categories */}
        <div
          className="w-[220px] py-3 px-2 flex flex-col gap-0.5 border-r"
          style={{ borderColor: "hsl(var(--border) / 0.3)" }}
        >
          {CATEGORY_ORDER.map((cat) => {
            const isActive = activeCategory === cat;
            const cases = grouped[cat];
            if (cases.length === 0) return null;
            return (
              <button
                key={cat}
                onMouseEnter={() => setActiveCategory(cat)}
                onClick={() => setActiveCategory(cat)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-sm"
                style={{
                  background: isActive ? "hsl(var(--primary) / 0.1)" : "transparent",
                  color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                }}
              >
                <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                <span className="font-medium">{CATEGORY_LABELS[cat]}</span>
                <span className="ml-auto text-xs opacity-50">{cases.length}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Use cases for active category */}
        <div className="flex-1 py-3 px-4">
          <div className="text-[10px] font-mono tracking-widest text-muted-foreground/60 mb-3 px-1">
            {CATEGORY_LABELS[activeCategory].toUpperCase()}
          </div>
          <div className="flex flex-col gap-1">
            {grouped[activeCategory].map((uc) => (
              <button
                key={uc.slug}
                onClick={() => onNavigate(uc.slug)}
                className="group flex flex-col gap-1 p-3 rounded-lg text-left transition-all hover:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{uc.icon}</span>
                  <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {uc.title}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </div>
                <div className="text-xs text-muted-foreground/70 pl-7 line-clamp-1">
                  {uc.trigger}
                </div>
                <div className="flex items-center gap-1.5 pl-7 mt-0.5">
                  {uc.steps
                    .flatMap((s) => s.tools)
                    .filter((t, i, arr) => arr.findIndex((x) => x.label === t.label) === i)
                    .slice(0, 5)
                    .map((tool) => (
                      <span
                        key={tool.label}
                        className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                        style={{
                          background: `${tool.color}18`,
                          color: tool.color,
                          border: `1px solid ${tool.color}30`,
                        }}
                      >
                        {tool.label}
                      </span>
                    ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="px-4 py-2.5 flex items-center justify-between text-xs"
        style={{
          borderTop: "1px solid hsl(var(--border) / 0.3)",
          background: "hsl(var(--primary) / 0.03)",
        }}
      >
        <span className="text-muted-foreground/60">
          {ALL_USE_CASES.length} workflows across {CATEGORY_ORDER.length} domains
        </span>
        <button
          onClick={() => onNavigate("close-pipeline-faster")}
          className="text-primary/80 hover:text-primary transition-colors font-medium"
        >
          See all use cases →
        </button>
      </div>
    </motion.div>
  );
}

function LandingNav({ onPilotClick }: { onPilotClick: () => void }) {
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const scrolled = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navRef = useRef<HTMLElement>(null);
  useRef(() => {
    const unsub = scrollY.on("change", (y) => {
      if (!navRef.current) return;
      if (y > 60 && !scrolled.current) {
        navRef.current.classList.add("nav-scrolled");
        scrolled.current = true;
      } else if (y <= 60 && scrolled.current) {
        navRef.current.classList.remove("nav-scrolled");
        scrolled.current = false;
      }
    });
    return unsub;
  });

  const handleMenuEnter = useCallback(() => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setMenuOpen(true);
  }, []);

  const handleMenuLeave = useCallback(() => {
    menuTimeoutRef.current = setTimeout(() => setMenuOpen(false), 200);
  }, []);

  const handleNavigate = useCallback((slug: string) => {
    setMenuOpen(false);
    navigate(`/use-cases/${slug}`);
  }, [navigate]);

  return (
    <motion.nav
      ref={navRef}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "hsl(240 33% 4% / 0.85)",
        borderBottom: "1px solid hsl(var(--border) / 0.4)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo + branding */}
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="Valence AI" className="w-12 h-12" />
            <span className="font-bold text-sm tracking-tight">Valence AI</span>
            <div
              className="hidden sm:flex items-center gap-1 text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded"
              style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}
            >
              <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse-glow" />
              LIVE
            </div>
          </div>

          {/* Use Cases dropdown — left side */}
          <div
            className="relative hidden sm:block"
            onMouseEnter={handleMenuEnter}
            onMouseLeave={handleMenuLeave}
          >
            <button
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              Use Cases
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <UseCasesMegaMenu onNavigate={handleNavigate} />
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.button
          onClick={onPilotClick}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-all relative overflow-hidden"
          style={{
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
          }}
        >
          Request Access →
        </motion.button>
      </div>
    </motion.nav>
  );
}

// ─── Agent cards (Squad section) ────────────────────────────────────────────
function AgentCard({ name }: { name: AgentName }) {
  const cfg = AGENT_CONFIG[name];
  const color = COLOR_MAP[cfg.color];
  const capabilities = AGENT_CAPABILITIES[name];

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.03, y: -4 }}
      className="rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden cursor-default group"
      style={{
        background: `${color.replace("hsl(", "hsla(").replace(")", ", 0.05)")}`,
        border: `1px solid ${color.replace("hsl(", "hsla(").replace(")", ", 0.2)")}`,
        transition: "border-color 0.2s",
      }}
    >
      {/* Top line glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      {/* Agent SVG */}
      <div className="h-28 flex items-end justify-center">
        {name === "Sentinel" ? (
          <div className="relative flex items-center justify-center" style={{ width: 70, height: 90 }}>
            <svg viewBox="0 0 70 90" className="w-full h-full">
              <defs>
                <radialGradient id={`sent-glow-${name}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="35" cy="78" rx="22" ry="5" fill={color} opacity="0.15" />
              <ellipse cx="35" cy="78" rx="14" ry="3" fill="#000" opacity="0.3" />
              <rect x="20" y="40" width="30" height="35" rx="6" fill={color.replace("hsl(", "hsla(").replace(")", ", 0.1)")} stroke={color.replace("hsl(", "hsla(").replace(")", ", 0.4)")} strokeWidth="1" />
              <path d="M35 10 L52 20 L52 38 Q52 52 35 60 Q18 52 18 38 L18 20 Z"
                fill={color.replace("hsl(", "hsla(").replace(")", ", 0.15)")}
                stroke={color.replace("hsl(", "hsla(").replace(")", ", 0.5)")}
                strokeWidth="1.5" />
              <rect x="22" y="28" width="26" height="1.5" rx="1" fill={color} opacity="0.7" className="animate-scan-sweep" style={{ position: "relative" }} />
              <circle cx="35" cy="35" r="5" fill="none" stroke={color} strokeWidth="1.5" />
              <circle cx="35" cy="35" r="2.5" fill={color} opacity="0.6" />
              <circle cx="35" cy="35" r="1" fill="#fff" opacity="0.8" />
              <rect x="22" y="72" width="10" height="15" rx="3" fill={color.replace("hsl(", "hsla(").replace(")", ", 0.12)")} stroke={color.replace("hsl(", "hsla(").replace(")", ", 0.3)")} strokeWidth="1" />
              <rect x="38" y="72" width="10" height="15" rx="3" fill={color.replace("hsl(", "hsla(").replace(")", ", 0.12)")} stroke={color.replace("hsl(", "hsla(").replace(")", ", 0.3)")} strokeWidth="1" />
            </svg>
            <div
              className="absolute inset-0 rounded-full animate-signal-ring pointer-events-none"
              style={{ border: `1px solid ${color}`, animationDelay: "0.5s" }}
            />
          </div>
        ) : (
          <div style={{ width: 70, height: 90 }}>
            <AgentSVG name={name} color={cfg.color} status="online" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center">
        <div className="text-lg">{cfg.emoji}</div>
        <div className="font-bold text-sm text-foreground mt-1">{name}</div>
        <div className="text-xs mt-0.5" style={{ color }}>{cfg.role}</div>
      </div>

      {/* Divider */}
      <div className="h-px" style={{ background: `${color.replace("hsl(", "hsla(").replace(")", ", 0.15)")}` }} />

      {/* Capabilities */}
      <ul className="space-y-1.5">
        {capabilities.map((cap) => (
          <li key={cap} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span style={{ color, marginTop: 1, fontSize: 9 }}>▸</span>
            {cap}
          </li>
        ))}
      </ul>

      {/* Hover shimmer */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 animate-hud-shimmer"
        style={{
          background: `linear-gradient(90deg, transparent 20%, ${color.replace("hsl(", "hsla(").replace(")", ", 0.06)")} 50%, transparent 80%)`,
          backgroundSize: "200% 100%",
        }}
      />

      {/* Signal ring on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none animate-signal-ring"
        style={{ border: `1px solid ${color}`, animationDelay: "0s" }}
      />
    </motion.div>
  );
}

// ─── Feature deep dive blocks ────────────────────────────────────────────────
function FeatureBlock({
  title,
  label,
  description,
  bullets,
  visual,
  reverse,
}: {
  title: string;
  label: string;
  description: string;
  bullets: string[];
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className={`flex flex-col lg:flex-row gap-8 items-center ${reverse ? "lg:flex-row-reverse" : ""}`}>
      <motion.div
        initial={{ opacity: 0, x: reverse ? 60 : -60, filter: "blur(4px)" }}
        animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
        transition={{ duration: 0.7, type: "spring", stiffness: 80, damping: 18 }}
        className="flex-1 space-y-4"
      >
        <div
          className="text-xs font-mono tracking-widest px-2 py-1 rounded inline-block"
          style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}
        >
          {label}
        </div>
        <h3 className="text-3xl font-bold text-foreground leading-tight">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
        <ul className="space-y-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="text-primary mt-0.5">✓</span>
              {b}
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: reverse ? -60 : 60, scale: 0.92 }}
        animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
        transition={{ duration: 0.7, type: "spring", stiffness: 80, damping: 18 }}
        className="flex-1 flex justify-center"
      >
        {visual}
      </motion.div>
    </div>
  );
}

// ─── Feature visuals ─────────────────────────────────────────────────────────
function TaskScreenshotVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="relative w-full max-w-lg"
      initial={{ opacity: 0, x: 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, type: "spring", stiffness: 80, damping: 18 }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, hsl(38 92% 50% / 0.12) 0%, transparent 70%)",
          filter: "blur(30px)",
          transform: "scale(1.1)",
        }}
      />

      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          border: "1px solid hsl(38 92% 50% / 0.2)",
          boxShadow: "0 0 0 1px hsl(var(--border) / 0.4), 0 24px 60px hsl(240 33% 3% / 0.8), 0 0 40px hsl(38 92% 50% / 0.06)",
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ background: "hsl(240 25% 5%)", borderBottom: "1px solid hsl(var(--border) / 0.4)" }}
        >
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
          <span className="ml-2 text-[10px] text-muted-foreground/40 font-mono">Task Detail — AlgoHouse Revenue Engine</span>
        </div>
        <img
          src="/screenshots/agents_task.png"
          alt="Valence AI Task Detail"
          className="w-full block"
        />
      </div>

      {/* Floating annotation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
        className="absolute -bottom-5 -right-5 px-3 py-2 rounded-xl text-xs font-mono"
        style={{
          background: "hsl(240 25% 7%)",
          border: "1px solid hsl(217 91% 60% / 0.4)",
          color: "hsl(217, 91%, 60%)",
          boxShadow: "0 4px 20px hsl(240 33% 3% / 0.8)",
        }}
      >
        ✓ Deliverables injected into downstream context
      </motion.div>
    </motion.div>
  );
}

function MemoryVisual() {
  const memories = [
    { text: '"GitHub search API needs 1s delay between calls"', type: "api_quirk", color: "hsl(38, 92%, 50%)" },
    { text: '"Arpit prefers bullet points over prose in reports"', type: "preference", color: "hsl(258, 90%, 66%)" },
    { text: '"Use /bulk-create instead of individual creates"', type: "shortcut", color: "hsl(160, 84%, 39%)" },
  ];

  return (
    <div className="relative" style={{ width: 320, height: 200 }}>
      {memories.map((m, i) => (
        <motion.div
          key={i}
          className="absolute rounded-xl p-3 cursor-default"
          style={{
            background: "hsl(240 25% 8%)",
            border: `1px solid ${m.color.replace("hsl(", "hsla(").replace(")", ", 0.3)")}`,
            left: 20 + i * 14,
            top: i * 14,
            width: 280,
            transform: `rotate(${[-5, -2, 0][i]}deg)`,
            zIndex: i,
            boxShadow: `0 4px 24px ${m.color.replace("hsl(", "hsla(").replace(")", ", 0.08)")}`,
          }}
          whileHover={{
            rotate: 0,
            scale: 1.04,
            zIndex: 10,
            y: -8,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="text-[9px] font-mono mb-1.5 tracking-widest" style={{ color: m.color }}>
            {m.type.toUpperCase()}
          </div>
          <div className="text-xs text-muted-foreground">{m.text}</div>
          {i === 2 && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary animate-pulse-glow" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

function SavingsVisual() {
  return (
    <div className="space-y-4 w-full max-w-sm">
      <div className="rounded-xl p-5 text-center space-y-1"
        style={{ background: "hsl(240 25% 8%)", border: "1px solid hsl(var(--border))" }}
      >
        <div className="text-sm text-muted-foreground line-through decoration-red-400/60">$2,500/mo</div>
        <div className="text-xs text-muted-foreground/50 mb-3">Paragon's monthly cost</div>
        <div className="text-5xl font-bold animate-neon-flicker" style={{ color: "hsl(142, 71%, 45%)" }}>
          Included
        </div>
        <div className="text-sm text-muted-foreground">in your Valence AI pilot</div>
        <div className="text-xs text-green-400/60 mt-1">Save $30,000+ per year vs. Paragon</div>
      </div>
      <div className="space-y-2">
        {[
          { label: "Pre-built blueprints", value: "100+", color: "hsl(217, 91%, 60%)" },
          { label: "Any API via AI scraper", value: "∞", color: "hsl(160, 84%, 39%)" },
          { label: "Developer hours saved", value: "100s", color: "hsl(38, 92%, 50%)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-bold font-mono" style={{ color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebhookVisual() {
  const steps = [
    {
      time: "09:14:02",
      source: "GitHub",
      event: "push → main",
      detail: "847 lines · 4 files changed",
      agent: null as string | null,
      color: "hsl(217, 91%, 60%)",
      logo: "https://cdn.simpleicons.org/github",
    },
    {
      time: "09:14:03",
      source: "Sentinel",
      event: "Diff scanned",
      detail: "2 deps flagged · CVE check triggered",
      agent: "🔍",
      color: "hsl(330, 81%, 60%)",
      logo: null as string | null,
    },
    {
      time: "09:14:04",
      source: "Kaze",
      event: "Task IFR-291 created",
      detail: "priority=high · assigned → Forge + Scout",
      agent: "🌀",
      color: "hsl(217, 91%, 60%)",
      logo: null as string | null,
    },
    {
      time: "09:14:07",
      source: "Forge + Scout",
      event: "Review running",
      detail: "Security · perf · OSS CVE scan in parallel",
      agent: "🔨",
      color: "hsl(38, 92%, 50%)",
      logo: null as string | null,
    },
    {
      time: "09:14:19",
      source: "Ghost",
      event: "PR comment posted",
      detail: "3 issues filed · changelog drafted → Notion",
      agent: "👻",
      color: "hsl(258, 90%, 66%)",
      logo: null as string | null,
    },
    {
      time: "09:14:22",
      source: "Sentinel",
      event: "PR approved ✓",
      detail: "Team notified via Slack",
      agent: "🔍",
      color: "hsl(330, 81%, 60%)",
      logo: null as string | null,
    },
  ];

  return (
    <div
      className="w-full max-w-lg rounded-2xl overflow-hidden font-mono"
      style={{
        background: "hsl(240 25% 5%)",
        border: "1px solid hsl(217 91% 60% / 0.2)",
        boxShadow: "0 0 40px hsl(217 91% 60% / 0.07), 0 24px 60px hsl(240 33% 3% / 0.8)",
      }}
    >
      {/* Terminal header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ background: "hsl(240 25% 7%)", borderBottom: "1px solid hsl(var(--border) / 0.4)" }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        <span className="ml-2 text-[10px] text-muted-foreground/40 tracking-widest">LIVE EVENT STREAM</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] text-red-400/70 tracking-widest">RECORDING</span>
        </div>
      </div>

      {/* Trigger pill */}
      <div className="px-4 pt-3 pb-2">
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs"
          style={{
            background: "hsl(217 91% 60% / 0.08)",
            border: "1px solid hsl(217 91% 60% / 0.3)",
          }}
        >
          <img src="https://cdn.simpleicons.org/github" alt="GitHub" width="13" height="13" style={{ filter: "brightness(0) invert(1)", opacity: 0.8 }} />
          <span style={{ color: "hsl(217, 91%, 70%)" }}>webhook received</span>
          <span className="text-muted-foreground/40 mx-1">·</span>
          <span className="text-muted-foreground/60">github.push on main</span>
          <div className="ml-auto text-[10px] text-muted-foreground/30">09:14:02</div>
        </div>
      </div>

      {/* Event rows */}
      <div className="px-4 pb-4 space-y-px">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, type: "spring", stiffness: 200, damping: 22 }}
            className="flex items-start gap-3 px-3 py-2 rounded-lg group"
            style={{
              background: i === steps.length - 1
                ? step.color.replace("hsl(", "hsla(").replace(")", ", 0.08)")
                : "transparent",
              border: i === steps.length - 1
                ? `1px solid ${step.color.replace("hsl(", "hsla(").replace(")", ", 0.25)")}`
                : "1px solid transparent",
            }}
          >
            {/* Time */}
            <span className="text-[10px] text-muted-foreground/25 w-14 flex-shrink-0 pt-0.5">{step.time}</span>

            {/* Dot + connector line */}
            <div className="flex flex-col items-center flex-shrink-0 pt-[5px]">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: step.color, boxShadow: `0 0 6px ${step.color}` }}
              />
              {i < steps.length - 1 && (
                <div
                  className="w-px mt-1"
                  style={{ background: step.color.replace("hsl(", "hsla(").replace(")", ", 0.15)"), height: 18 }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {step.agent && <span className="text-[11px]">{step.agent}</span>}
                {step.logo && (
                  <img src={step.logo} alt={step.source} width="11" height="11"
                    style={{ filter: "brightness(0) invert(1)", opacity: 0.7 }} />
                )}
                <span className="text-xs font-semibold" style={{ color: step.color }}>{step.source}</span>
                <span className="text-[11px] text-muted-foreground/60">→ {step.event}</span>
              </div>
              <div className="text-[10px] text-muted-foreground/35 mt-0.5">{step.detail}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2.5 flex items-center gap-3 text-[10px] text-muted-foreground/30"
        style={{ borderTop: "1px solid hsl(var(--border) / 0.3)" }}
      >
        <span>Duration: <span className="text-muted-foreground/55">20s</span></span>
        <span>·</span>
        <span>4 agents</span>
        <span>·</span>
        <span>GitHub · Linear · Notion · Slack</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-green-400/60" />
          <span className="text-green-400/50">live</span>
        </div>
      </div>
    </div>
  );
}

// ─── Voice Command visual ────────────────────────────────────────────────────
function LiveOpsVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const feedItems: {
    time: string;
    agent: string;
    emoji: string;
    color: string;
    action: string;
    detail: string;
    type: "tool_call" | "deliverable" | "status" | "review";
  }[] = [
    { time: "09:41:12", agent: "Scout", emoji: "🔭", color: "hsl(160,84%,39%)", action: "web_fetch", detail: "G2 reviews → 47 results parsed", type: "tool_call" },
    { time: "09:41:18", agent: "Scout", emoji: "🔭", color: "hsl(160,84%,39%)", action: "Deliverable posted", detail: "Competitor Matrix (3.2k words)", type: "deliverable" },
    { time: "09:41:19", agent: "Sentinel", emoji: "🔍", color: "hsl(330,81%,60%)", action: "Review started", detail: "Checking sources, data accuracy", type: "review" },
    { time: "09:41:24", agent: "Sentinel", emoji: "🔍", color: "hsl(330,81%,60%)", action: "Approved ✓", detail: "All 12 sources verified", type: "review" },
    { time: "09:41:25", agent: "Ghost", emoji: "👻", color: "hsl(258,90%,66%)", action: "notion_create", detail: "Report page → workspace/Q1-Intel", type: "tool_call" },
    { time: "09:41:28", agent: "Forge", emoji: "🔨", color: "hsl(38,92%,50%)", action: "github_pr", detail: "PR #142 → analytics-dashboard", type: "tool_call" },
    { time: "09:41:31", agent: "Kaze", emoji: "🌀", color: "hsl(217,91%,60%)", action: "Mission 67% complete", detail: "4/6 tasks done · 2 in progress", type: "status" },
  ];

  const typeIcon: Record<string, { icon: string; bg: string; border: string }> = {
    tool_call: { icon: "🔧", bg: "hsl(38 92% 50% / 0.08)", border: "hsl(38 92% 50% / 0.2)" },
    deliverable: { icon: "📦", bg: "hsl(160 84% 39% / 0.08)", border: "hsl(160 84% 39% / 0.2)" },
    review: { icon: "🛡️", bg: "hsl(330 81% 60% / 0.08)", border: "hsl(330 81% 60% / 0.2)" },
    status: { icon: "📊", bg: "hsl(217 91% 60% / 0.08)", border: "hsl(217 91% 60% / 0.2)" },
  };

  return (
    <motion.div
      ref={ref}
      className="w-full max-w-lg select-none"
      initial={{ opacity: 0, x: 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, type: "spring", stiffness: 80, damping: 18 }}
    >
      <div
        className="rounded-2xl overflow-hidden font-mono"
        style={{
          background: "hsl(240 25% 5%)",
          border: "1px solid hsl(217 91% 60% / 0.2)",
          boxShadow: "0 0 40px hsl(217 91% 60% / 0.07), 0 24px 60px hsl(240 33% 3% / 0.8)",
        }}
      >
        {/* Terminal header */}
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{ background: "hsl(240 25% 7%)", borderBottom: "1px solid hsl(var(--border) / 0.4)" }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          <span className="ml-2 text-[10px] text-muted-foreground/40 tracking-widest">LIVE OPS FEED</span>
          <div className="ml-auto flex items-center gap-3">
            {/* Mini agent status dots */}
            <div className="flex items-center gap-1.5">
              {["🌀", "🔭", "🔨", "👻", "🔍"].map((e, i) => (
                <div key={i} className="flex items-center gap-0.5">
                  <span className="text-[8px]">{e}</span>
                  <div className={`w-1 h-1 rounded-full ${i < 4 ? "bg-green-400" : "bg-green-400 animate-pulse"}`} />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] text-red-400/70 tracking-widest">REC</span>
            </div>
          </div>
        </div>

        {/* Feed rows */}
        <div className="px-3 py-2.5 space-y-px">
          {feedItems.map((item, i) => {
            const t = typeIcon[item.type];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 22 }}
                className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg"
                style={{
                  background: item.type === "review" ? t.bg : "transparent",
                  border: item.type === "review" ? `1px solid ${t.border}` : "1px solid transparent",
                }}
              >
                <span className="text-[10px] text-muted-foreground/20 w-[52px] flex-shrink-0 pt-0.5 tabular-nums">{item.time}</span>
                <span className="text-[10px] flex-shrink-0 pt-px">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold" style={{ color: item.color }}>{item.agent}</span>
                    <span className="text-[10px]">{t.icon}</span>
                    <span className="text-[10px] text-muted-foreground/50 truncate">{item.action}</span>
                  </div>
                  <div className="text-[9px] text-muted-foreground/30 truncate">{item.detail}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats footer */}
        <div
          className="px-4 py-2 flex items-center gap-4 text-[9px] text-muted-foreground/30"
          style={{ borderTop: "1px solid hsl(var(--border) / 0.25)" }}
        >
          <span>5 agents <span className="text-green-400/50">online</span></span>
          <span>·</span>
          <span>142 actions today</span>
          <span>·</span>
          <span>12 tool calls</span>
          <span>·</span>
          <span>3 reviews</span>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-green-400/60" />
            <span className="text-green-400/50">streaming</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function WarRoomVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const agents: {
    name: string;
    emoji: string;
    color: string;
    status: "working" | "idle";
    task: string;
    reasoning: string;
  }[] = [
    { name: "Scout", emoji: "🔭", color: "hsl(160,84%,39%)", status: "working", task: "Competitor analysis", reasoning: "Fetching G2 reviews for 3 vendors..." },
    { name: "Forge", emoji: "🔨", color: "hsl(38,92%,50%)", status: "working", task: "API integration", reasoning: "Writing webhook handler for Stripe..." },
    { name: "Ghost", emoji: "👻", color: "hsl(258,90%,66%)", status: "idle", task: "Waiting on Scout", reasoning: "" },
  ];

  const messages: {
    agent: string;
    emoji: string;
    color: string;
    type: string;
    typeColor: string;
    text: string;
    time: string;
    target?: string;
    targetEmoji?: string;
  }[] = [
    { agent: "Scout", emoji: "🔭", color: "hsl(160,84%,39%)", type: "Handoff", typeColor: "hsl(188,80%,55%)", text: "Market data compiled. Passing to Ghost for report draft.", time: "2m ago", target: "Ghost", targetEmoji: "👻" },
    { agent: "Sentinel", emoji: "🔍", color: "hsl(330,81%,60%)", type: "Blocker", typeColor: "hsl(0,72%,55%)", text: "Forge's PR missing error handling on /webhooks endpoint.", time: "1m ago", target: "Forge", targetEmoji: "🔨" },
    { agent: "Forge", emoji: "🔨", color: "hsl(38,92%,50%)", type: "Resolved", typeColor: "hsl(142,71%,45%)", text: "Added try-catch + retry logic. Re-submitted for review.", time: "30s ago" },
  ];

  return (
    <motion.div
      ref={ref}
      className="w-full max-w-lg select-none"
      initial={{ opacity: 0, x: -40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, type: "spring", stiffness: 80, damping: 18 }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "hsl(240 25% 5%)",
          border: "1px solid hsl(330 81% 60% / 0.2)",
          boxShadow: "0 0 40px hsl(330 81% 60% / 0.06), 0 24px 60px hsl(240 33% 3% / 0.8)",
        }}
      >
        {/* Header bar */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ background: "hsl(240 25% 7%)", borderBottom: "1px solid hsl(var(--border) / 0.4)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🗡️</span>
            <span className="text-xs font-bold text-foreground/90">War Room</span>
            <span className="text-[10px] text-muted-foreground/40 font-mono">Revenue Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-green-400/70 font-mono">4/6</span>
              <span className="text-[10px] text-muted-foreground/30">tasks</span>
            </div>
            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(330 81% 60% / 0.15)" }}>
              <div className="h-full rounded-full" style={{ width: "67%", background: "hsl(330, 81%, 60%)" }} />
            </div>
            <span className="text-[10px] font-bold" style={{ color: "hsl(330, 81%, 60%)" }}>67%</span>
          </div>
        </div>

        {/* Two-column: Agent lanes + Messages */}
        <div className="flex" style={{ minHeight: 220 }}>
          {/* Agent Lanes */}
          <div className="flex-1 px-3 py-2.5 space-y-1.5" style={{ borderRight: "1px solid hsl(var(--border) / 0.25)" }}>
            <div className="text-[9px] font-mono tracking-widest text-muted-foreground/40 mb-1">AGENT LANES</div>
            {agents.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 200, damping: 22 }}
                className="rounded-lg px-2.5 py-2"
                style={{
                  background: a.status === "working"
                    ? a.color.replace("hsl(", "hsla(").replace(")", ", 0.06)")
                    : "transparent",
                  border: `1px solid ${a.status === "working"
                    ? a.color.replace("hsl(", "hsla(").replace(")", ", 0.2)")
                    : "hsl(var(--border) / 0.15)"}`,
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px]">{a.emoji}</span>
                  <span className="text-[11px] font-bold text-foreground/80">{a.name}</span>
                  <span
                    className="ml-auto text-[8px] font-mono px-1.5 py-0.5 rounded-full"
                    style={{
                      background: a.status === "working"
                        ? "hsl(142 71% 45% / 0.1)"
                        : "hsl(0 0% 50% / 0.1)",
                      color: a.status === "working"
                        ? "hsl(142, 71%, 55%)"
                        : "hsl(0, 0%, 50%)",
                    }}
                  >
                    {a.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-[10px] text-foreground/60 truncate">{a.task}</div>
                {a.reasoning && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: a.color }} />
                    <span className="text-[9px] text-muted-foreground/40 truncate italic">{a.reasoning}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Coordination Feed */}
          <div className="w-[200px] px-2.5 py-2.5 space-y-1.5">
            <div className="text-[9px] font-mono tracking-widest text-muted-foreground/40 mb-1">COORDINATION</div>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.15, type: "spring", stiffness: 200, damping: 22 }}
                className="rounded-lg px-2 py-1.5"
                style={{
                  background: m.type === "Blocker"
                    ? "hsl(0 72% 55% / 0.05)"
                    : m.type === "Handoff"
                      ? "hsl(188 80% 55% / 0.05)"
                      : "hsl(142 71% 45% / 0.05)",
                  border: `1px solid ${m.type === "Blocker"
                    ? "hsl(0 72% 55% / 0.15)"
                    : m.type === "Handoff"
                      ? "hsl(188 80% 55% / 0.15)"
                      : "hsl(142 71% 45% / 0.15)"}`,
                }}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[10px]">{m.emoji}</span>
                  <span className="text-[9px] font-bold text-foreground/70">{m.agent}</span>
                  <span className="text-[8px] font-mono" style={{ color: m.typeColor }}>{m.type}</span>
                  {m.target && (
                    <>
                      <span className="text-[8px] text-muted-foreground/25">→</span>
                      <span className="text-[9px]">{m.targetEmoji}</span>
                    </>
                  )}
                  <span className="ml-auto text-[8px] text-muted-foreground/25">{m.time}</span>
                </div>
                <div className="text-[9px] text-muted-foreground/50 leading-snug line-clamp-2">{m.text}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reasoning stream footer */}
        <div
          className="px-4 py-2 flex items-center gap-2"
          style={{ borderTop: "1px solid hsl(var(--border) / 0.25)", background: "hsl(240 25% 6%)" }}
        >
          <div className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400/70">
              <path d="M12 2a8.5 8.5 0 0 0-8 9c0 3.5 2.5 6 4 7.5L12 22l4-3.5c1.5-1.5 4-4 4-7.5a8.5 8.5 0 0 0-8-9Z" />
            </svg>
            <span className="text-[9px] text-blue-400/60 font-mono">Thinking</span>
          </div>
          <div className="flex-1 h-px" style={{ background: "hsl(var(--border) / 0.15)" }} />
          <div className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400/70">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
            </svg>
            <span className="text-[9px] text-amber-400/60 font-mono">Tool Call</span>
          </div>
          <div className="flex-1 h-px" style={{ background: "hsl(var(--border) / 0.15)" }} />
          <div className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400/70">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-[9px] text-green-400/60 font-mono">Result</span>
          </div>
          <div className="ml-1 flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-green-400/50 animate-pulse" />
            <span className="text-[8px] text-green-400/40 font-mono">LIVE</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function VoiceCommandVisual() {
  return (
    <div
      className="w-full max-w-sm rounded-2xl overflow-hidden relative"
      style={{
        background: "linear-gradient(180deg, hsl(240 25% 6%) 0%, hsl(240 30% 4%) 100%)",
        border: "1px solid hsl(217 91% 60% / 0.2)",
        boxShadow: "0 0 40px hsl(217 91% 60% / 0.07), 0 24px 60px hsl(240 33% 3% / 0.8)",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-white/40 font-mono tracking-widest">LIVE</span>
        </div>
        <span className="text-[10px] text-white/40 font-mono tabular-nums">1:42</span>
      </div>

      {/* Avatar ring */}
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="relative">
          <div
            className="absolute inset-0 -m-3 rounded-full animate-ping opacity-20"
            style={{ border: "1px solid hsl(217 91% 60%)", animationDuration: "2s" }}
          />
          <div
            className="absolute inset-0 -m-6 rounded-full animate-ping opacity-10"
            style={{ border: "1px solid hsl(217 91% 60%)", animationDuration: "3s" }}
          />
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "hsl(217 91% 60% / 0.12)",
              border: "2px solid hsl(217 91% 60% / 0.35)",
            }}
          >
            <span className="text-3xl font-bold" style={{ color: "hsl(217 91% 65%)" }}>K</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-base font-semibold text-white/90">Kaze</div>
          <div className="text-xs text-white/30 mt-0.5">Speaking</div>
        </div>

        {/* Waveform bars */}
        <div className="flex items-end gap-[2px] h-6">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-[2.5px] rounded-full"
              style={{
                background: "hsl(217 91% 60% / 0.5)",
                height: `${6 + Math.sin(i * 0.7) * 10 + (i % 3) * 4}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Transcript area */}
      <div className="px-5 pb-3 space-y-2">
        <div className="rounded-lg px-3 py-2" style={{ background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(0 0% 100% / 0.05)" }}>
          <div className="flex items-center gap-2 text-[10px] mb-1.5">
            <span className="text-white/30">You</span>
          </div>
          <p className="text-xs text-white/45 italic">"What are the agents working on right now?"</p>
        </div>
        <div className="rounded-lg px-3 py-2" style={{ background: "hsl(217 91% 60% / 0.06)", border: "1px solid hsl(217 91% 60% / 0.15)" }}>
          <div className="flex items-center gap-2 text-[10px] mb-1.5">
            <span style={{ color: "hsl(217 91% 65%)" }}>Kaze</span>
          </div>
          <p className="text-xs text-white/55">"Scout is finishing the competitor analysis. Forge has 2 PRs in review. Ghost is drafting the newsletter."</p>
        </div>
      </div>

      {/* Tool call indicator */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px]" style={{ background: "hsl(160 84% 39% / 0.08)", border: "1px solid hsl(160 84% 39% / 0.2)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
          <span className="text-emerald-400/70 font-mono">get_agent_status</span>
          <span className="text-white/20 mx-0.5">&rarr;</span>
          <span className="text-white/35">5 agents · 3 active tasks</span>
        </div>
      </div>

      {/* End call bar */}
      <div
        className="flex items-center justify-center gap-3 px-5 py-3"
        style={{ borderTop: "1px solid hsl(0 0% 100% / 0.05)" }}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "hsl(0 0% 100% / 0.06)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        </div>
        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center" style={{ boxShadow: "0 0 16px hsl(0 80% 50% / 0.25)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="m16 2-4 4-4-4"/><path d="m2 16 4-4 4 4"/><path d="M22 16c0-5.523-4.477-10-10-10"/><path d="M2 8c0 5.523 4.477 10 10 10"/></svg>
        </div>
        <div className="w-8" />
      </div>
    </div>
  );
}

// ─── Mission Autopilot visual ────────────────────────────────────────────────
// Shows: user prompt → Claude Opus decompose node → task graph with 5 agent
// nodes in two parallel lanes → converging deliver node. Animated connectors,
// live status badges, and a running token counter.
function AutopilotVisual() {
  const [tick, setTick] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  // Slowly animate a "tokens processed" counter once in view
  useEffect(() => {
    if (!isInView) return;
    const id = setInterval(() => setTick((t) => t + 1), 120);
    return () => clearInterval(id);
  }, [isInView]);

  const tokenCount = Math.min(tick * 47, 18_420);

  // Task nodes with agent assignment, status, tool used
  const TASKS: {
    id: string;
    label: string;
    agent: string;
    agentEmoji: string;
    agentColor: string;
    tool: string;
    status: "done" | "running" | "queued";
    lane: number; // 0 = left, 1 = right
    row: number;
  }[] = [
    { id: "t1", label: "Competitor research", agent: "Scout", agentEmoji: "🔭", agentColor: "hsl(160,84%,39%)", tool: "web_fetch", status: "done", lane: 0, row: 0 },
    { id: "t2", label: "Financial analysis", agent: "Scout", agentEmoji: "🔭", agentColor: "hsl(160,84%,39%)", tool: "google_sheets", status: "done", lane: 1, row: 0 },
    { id: "t3", label: "Slide deck outline", agent: "Ghost", agentEmoji: "👻", agentColor: "hsl(258,90%,66%)", tool: "notion", status: "running", lane: 0, row: 1 },
    { id: "t4", label: "Data visualisations", agent: "Forge", agentEmoji: "🔨", agentColor: "hsl(38,92%,50%)", tool: "github", status: "running", lane: 1, row: 1 },
    { id: "t5", label: "QA & fact-check", agent: "Sentinel", agentEmoji: "🔍", agentColor: "hsl(330,81%,60%)", tool: "internal", status: "queued", lane: 0, row: 2 },
  ];

  const statusColor = { done: "hsl(160,84%,45%)", running: "hsl(38,92%,55%)", queued: "hsl(0,0%,40%)" } as const;
  const statusLabel = { done: "DONE", running: "RUNNING", queued: "QUEUED" } as const;
  const statusDot   = { done: "bg-green-400", running: "bg-amber-400 animate-pulse", queued: "bg-zinc-600" } as const;

  return (
    <div ref={ref} className="w-full max-w-md select-none">
      {/* ── HEADER: user prompt ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, type: "spring", stiffness: 120, damping: 18 }}
        className="rounded-xl px-4 py-3 mb-1"
        style={{ background: "hsl(240 25% 8%)", border: "1px solid hsl(217 91% 60% / 0.3)" }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-mono tracking-widest text-primary/60">YOU → KAZE</span>
          <div className="flex-1 h-px" style={{ background: "hsl(217 91% 60% / 0.15)" }} />
          <img src="https://cdn.simpleicons.org/claude" alt="Claude" width="11" height="11"
            style={{ filter: "brightness(0) saturate(100%) invert(62%) sepia(98%) saturate(400%) hue-rotate(330deg) brightness(105%)" }} />
          <span className="text-[9px] font-mono text-muted-foreground/40">Claude Opus 4.6</span>
        </div>
        <p className="text-xs text-foreground/80 leading-relaxed">
          "Research our top 10 competitors and prepare a pitch deck for the board meeting."
        </p>
      </motion.div>

      {/* ── CONNECTOR: prompt → decompose ── */}
      <div className="flex justify-center">
        <svg width="2" height="18" className="overflow-visible">
          <motion.line x1="1" y1="0" x2="1" y2="18"
            stroke="hsl(258,90%,66%)" strokeWidth="1.5" strokeDasharray="3 2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 0.5 } : {}}
            transition={{ delay: 0.4, duration: 0.4 }}
          />
        </svg>
      </div>

      {/* ── DECOMPOSE node ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.5, type: "spring", stiffness: 160, damping: 20 }}
        className="rounded-xl px-4 py-2.5 mb-1 flex items-center justify-between"
        style={{
          background: "hsl(258 90% 66% / 0.08)",
          border: "1px solid hsl(258 90% 66% / 0.35)",
          boxShadow: "0 0 20px hsl(258 90% 66% / 0.08)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
            style={{ background: "hsl(258 90% 66% / 0.15)", border: "1px solid hsl(258 90% 66% / 0.4)" }}>
            🧠
          </div>
          <div>
            <div className="text-[9px] font-mono tracking-widest text-purple-400/70">CLAUDE OPUS · DECOMPOSE</div>
            <div className="text-xs text-foreground/70 mt-0.5">5 subtasks · 2 parallel lanes · dependencies mapped</div>
          </div>
        </div>
        {/* Animated token counter */}
        <div className="text-right flex-shrink-0 ml-3">
          <div className="text-[10px] font-mono text-purple-400/50 tabular-nums">
            {tokenCount.toLocaleString()}
          </div>
          <div className="text-[8px] text-muted-foreground/30">tokens</div>
        </div>
      </motion.div>

      {/* ── FORK: two lane connectors ── */}
      <div className="relative h-5 mb-1">
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          {/* left branch */}
          <motion.path d="M 50% 0 Q 25% 0 25% 100%"
            fill="none" stroke="hsl(160,84%,39%)" strokeWidth="1" strokeDasharray="3 2" opacity="0.4"
            initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}}
            transition={{ delay: 0.75, duration: 0.35 }}
          />
          {/* right branch */}
          <motion.path d="M 50% 0 Q 75% 0 75% 100%"
            fill="none" stroke="hsl(38,92%,50%)" strokeWidth="1" strokeDasharray="3 2" opacity="0.4"
            initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : {}}
            transition={{ delay: 0.75, duration: 0.35 }}
          />
        </svg>
      </div>

      {/* ── TASK GRID: two columns, 2.5 rows ── */}
      <div className="grid grid-cols-2 gap-2 mb-1">
        {TASKS.filter((t) => t.row < 2).map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.85 + i * 0.1, type: "spring", stiffness: 180, damping: 22 }}
            className="rounded-lg px-3 py-2.5 relative overflow-hidden"
            style={{
              background: `${task.agentColor.replace("hsl(", "hsla(").replace(")", ", 0.06)")}`,
              border: `1px solid ${task.agentColor.replace("hsl(", "hsla(").replace(")", ", 0.2)")}`,
            }}
          >
            {/* Running pulse overlay */}
            {task.status === "running" && (
              <div className="absolute inset-0 rounded-lg pointer-events-none animate-pulse"
                style={{ background: `${task.agentColor.replace("hsl(", "hsla(").replace(")", ", 0.04)")}` }} />
            )}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{task.agentEmoji}</span>
                <span className="text-[9px] font-mono tracking-wide" style={{ color: task.agentColor }}>
                  {task.agent}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${statusDot[task.status]}`} />
                <span className="text-[8px] font-mono" style={{ color: statusColor[task.status] }}>
                  {statusLabel[task.status]}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-foreground/70 leading-tight mb-1.5">{task.label}</div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full" style={{ background: task.agentColor, opacity: 0.5 }} />
              <span className="text-[9px] text-muted-foreground/40 font-mono">{task.tool}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* QA node — full width, centered */}
      {TASKS.filter((t) => t.row === 2).map((task) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.15, type: "spring", stiffness: 180, damping: 22 }}
          className="rounded-lg px-3 py-2.5 flex items-center gap-3 mb-1"
          style={{
            background: `${task.agentColor.replace("hsl(", "hsla(").replace(")", ", 0.06)")}`,
            border: `1px solid ${task.agentColor.replace("hsl(", "hsla(").replace(")", ", 0.2)")}`,
          }}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: `${task.agentColor.replace("hsl(", "hsla(").replace(")", ", 0.15)")}`, border: `1px solid ${task.agentColor.replace("hsl(", "hsla(").replace(")", ", 0.4)")}`}}>
            {task.agentEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono tracking-wide" style={{ color: task.agentColor }}>{task.agent} · {task.label}</span>
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${statusDot[task.status]}`} />
                <span className="text-[8px] font-mono" style={{ color: statusColor[task.status] }}>{statusLabel[task.status]}</span>
              </div>
            </div>
            <div className="text-[9px] text-muted-foreground/40 mt-0.5">Waits for Scout + Ghost + Forge before starting</div>
          </div>
        </motion.div>
      ))}

      {/* ── MERGE connector ── */}
      <div className="flex justify-center">
        <svg width="2" height="16" className="overflow-visible">
          <motion.line x1="1" y1="0" x2="1" y2="16"
            stroke="hsl(160,84%,39%)" strokeWidth="1.5" strokeDasharray="3 2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 0.5 } : {}}
            transition={{ delay: 1.3, duration: 0.35 }}
          />
        </svg>
      </div>

      {/* ── DELIVER node ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.4, type: "spring", stiffness: 160, damping: 20 }}
        className="rounded-xl px-4 py-2.5 flex items-center gap-3"
        style={{
          background: "hsl(160 84% 39% / 0.08)",
          border: "1px solid hsl(160 84% 39% / 0.35)",
          boxShadow: "0 0 20px hsl(160 84% 39% / 0.08)",
        }}
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
          style={{ background: "hsl(160 84% 39% / 0.15)", border: "1px solid hsl(160 84% 39% / 0.4)" }}>
          ✓
        </div>
        <div className="flex-1">
          <div className="text-[9px] font-mono tracking-widest text-green-400/60 mb-0.5">KAZE · DELIVER</div>
          <div className="text-xs text-foreground/70">Pitch deck live in Notion · Slack notification sent · Calendar invite booked</div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <img src="https://cdn.simpleicons.org/notion" alt="Notion" width="10" height="10"
              style={{ filter: "brightness(0) invert(1)", opacity: 0.5 }} />
            <img src="https://cdn.simpleicons.org/slack" alt="Slack" width="10" height="10"
              style={{ filter: "brightness(0) invert(1)", opacity: 0.5 }} />
            <img src="https://cdn.simpleicons.org/googlecalendar" alt="Calendar" width="10" height="10"
              style={{ filter: "brightness(0) invert(1)", opacity: 0.5 }} />
          </div>
          <span className="text-[8px] font-mono text-muted-foreground/30">3 tools called</span>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Landing Page ───────────────────────────────────────────────────────
const AGENTS: AgentName[] = ["Kaze", "Scout", "Forge", "Ghost", "Sentinel"];

// Landing page shows 3 hero use cases from the shared data
const LANDING_USE_CASE_SLUGS = ["sales-lead-enrichment-outbound", "cs-qbr-health-automation", "support-ticket-intelligence"] as const;
const USE_CASES = ALL_USE_CASES.filter((uc) =>
  (LANDING_USE_CASE_SLUGS as readonly string[]).includes(uc.slug)
);

export default function Landing() {
  const prefersReduced = useReducedMotion();
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 600], [0, prefersReduced ? 0 : -80]);
  const navigate = useNavigate();
  const [pilotOpen, setPilotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PilotModal open={pilotOpen} onClose={() => setPilotOpen(false)} />
      <LandingNav onPilotClick={() => setPilotOpen(true)} />

      {/* ── SECTION 1: HERO ── */}
      <section className="relative overflow-hidden pt-14 pb-0">
        {/* Particle field background */}
        <motion.div className="absolute inset-0" style={{ y: heroParallax }}>
          <HeroParticleField opacity={0.9} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 30%, hsl(240 33% 4% / 0.6) 100%)",
            }}
          />
        </motion.div>

        {/* Bioluminescent orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { color: "hsl(217, 91%, 60%)", x: "10%", y: "30%", size: 500, delay: "0s" },
            { color: "hsl(258, 90%, 66%)", x: "85%", y: "20%", size: 350, delay: "2s" },
            { color: "hsl(160, 84%, 39%)", x: "50%", y: "80%", size: 300, delay: "4s" },
          ].map((orb, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-bioluminescence"
              style={{
                left: orb.x,
                top: orb.y,
                width: orb.size,
                height: orb.size,
                background: `radial-gradient(circle, ${orb.color.replace("hsl(", "hsla(").replace(")", ", 0.1)")} 0%, transparent 70%)`,
                transform: "translate(-50%, -50%)",
                animationDelay: orb.delay,
                animationDuration: `${6 + i * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Hero content — two-column on large screens */}
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 pt-16 pb-8">

            {/* Left: Text content */}
            <div className="flex-1 flex flex-col items-start gap-6 text-left max-w-xl">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono tracking-widest"
                style={{
                  background: "hsl(var(--primary) / 0.08)",
                  border: "1px solid hsl(var(--primary) / 0.25)",
                  color: "hsl(var(--primary) / 0.8)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-glow" />
                5 AGENTS ONLINE · VOICE COMMAND · 100+ INTEGRATIONS
              </motion.div>

              {/* Headline */}
              <motion.h1
                className="text-5xl sm:text-6xl font-bold leading-[1.08] tracking-tight"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } },
                }}
              >
                {/* Line 1: "Deploy Your" */}
                {["Deploy", "Your"].map((word, i) => (
                  <motion.span
                    key={`l1-${i}`}
                    className="inline-block mr-[0.25em]"
                    variants={{
                      hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
                      visible: {
                        opacity: 1, y: 0, filter: "blur(0px)",
                        transition: { type: "spring", stiffness: 120, damping: 18 },
                      },
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
                <br />
                {/* Line 2: "Autonomous AI" — gradient highlight on Autonomous */}
                {["Autonomous", "AI"].map((word, i) => (
                  <motion.span
                    key={`l2-${i}`}
                    className="inline-block mr-[0.25em]"
                    variants={{
                      hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
                      visible: {
                        opacity: 1, y: 0, filter: "blur(0px)",
                        transition: { type: "spring", stiffness: 120, damping: 18 },
                      },
                    }}
                    style={
                      word === "Autonomous"
                        ? {
                            background: "linear-gradient(90deg, hsl(217,91%,65%), hsl(258,90%,70%), hsl(217,91%,60%))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }
                        : word === "AI"
                        ? {
                            background: "linear-gradient(90deg, hsl(258,90%,66%), hsl(330,81%,60%))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }
                        : {}
                    }
                  >
                    {word}
                  </motion.span>
                ))}
                <br />
                {/* Line 3: "Workforce." */}
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
                    visible: {
                      opacity: 1, y: 0, filter: "blur(0px)",
                      transition: { type: "spring", stiffness: 120, damping: 18 },
                    },
                  }}
                >
                  Workforce.
                </motion.span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="text-lg text-muted-foreground leading-relaxed"
              >
                Five specialized AI agents. <span className="text-foreground/80">100+ integrated tools.</span> Multi-step workflows that run while you sleep — across GitHub, HubSpot, Slack, Stripe, Notion, Figma, Salesforce, Jira, Pipedrive, Razorpay and everything else your business runs on.
              </motion.p>

              {/* Typing command */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="px-4 py-3 rounded-xl w-full"
                style={{
                  background: "hsl(240 25% 6%)",
                  border: "1px solid hsl(var(--border))",
                }}
              >
                <TypingCommand />
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="flex items-center gap-4"
              >
                <motion.button
                  onClick={() => setPilotOpen(true)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 rounded-xl text-sm font-bold tracking-wide relative overflow-hidden"
                  style={{
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 0 24px hsl(var(--primary) / 0.35)",
                  }}
                >
                  <span className="relative z-10">Request Early Access →</span>
                  <div
                    className="absolute inset-0 animate-hud-shimmer pointer-events-none"
                    style={{
                      background: "linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.12) 50%, transparent 80%)",
                      backgroundSize: "200% 100%",
                    }}
                  />
                </motion.button>
                <motion.button
                  onClick={() => document.getElementById("workflow-section")?.scrollIntoView({ behavior: "smooth" })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-xl text-sm font-medium"
                  style={{
                    background: "transparent",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  See it in action ↓
                </motion.button>
              </motion.div>

              {/* Social proof line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="flex items-center gap-3 text-xs text-muted-foreground/50"
              >
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span>All 5 agents operational</span>
                </div>
                <span>·</span>
                <span>1,240 API calls in last hour</span>
                <span>·</span>
                <span>Selective pilot program</span>
              </motion.div>
            </div>

            {/* Right: Animated mission visual */}
            <motion.div
              className="flex-1 relative w-full max-w-3xl flex items-center justify-center"
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.9, type: "spring", stiffness: 70, damping: 20 }}
              style={{ padding: "12px 16px" }}
            >
              {/* Glow behind visual */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at 50% 50%, hsl(217 91% 60% / 0.12) 0%, transparent 70%)",
                  filter: "blur(40px)",
                  transform: "scale(1.1)",
                }}
              />
              <div className="relative z-10 w-full">
                <HeroMissionVisual />
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── SECTION 2: MEET YOUR SQUAD ── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-8 space-y-3">
            <motion.div variants={itemVariants}>
              <span
                className="text-xs font-mono tracking-widest px-2 py-1 rounded"
                style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}
              >
                THE SQUAD
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold">
              Meet Your Workforce
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Five specialists with distinct expertise - coordinated by Kaze, powered by Claude Opus{" "}
              <img
                src="https://cdn.simpleicons.org/claude"
                alt="Claude"
                width="18"
                height="18"
                style={{ display: "inline", verticalAlign: "middle", filter: "brightness(0) saturate(100%) invert(62%) sepia(98%) saturate(400%) hue-rotate(330deg) brightness(105%)", marginBottom: "2px" }}
              />
            </motion.p>
          </RevealSection>

          <RevealSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {AGENTS.map((name) => (
              <AgentCard key={name} name={name} />
            ))}
          </RevealSection>
        </div>
      </section>

      {/* ── SECTION 3: STATS BAR ── */}
      <StatsBar />

      {/* ── SECTION 4: INTEGRATIONS ── */}
      <section className="py-16 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-8 space-y-3">
            <motion.div variants={itemVariants}>
              <span
                className="text-xs font-mono tracking-widest px-2 py-1 rounded"
                style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}
              >
                INTEGRATIONS
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold">
              Connect Everything
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              100+ integrations ready to connect. 2,400+ API actions in the catalog. Or add any API with AI — paste a URL, we generate the integration in seconds.
            </motion.p>
          </RevealSection>

          <IntegrationGrid />
        </div>
      </section>

      {/* ── SECTION 5: USE CASES ── */}
      <UseCasesSection onNavigate={(slug) => navigate(`/use-cases/${slug}`)} />

      {/* ── SECTION 6: FEATURE DEEP DIVES ── */}
      <section
        className="py-16 px-6"
        style={{ background: "linear-gradient(180deg, hsl(240 33% 4%) 0%, hsl(240 33% 3%) 100%)" }}
      >
        <div className="max-w-5xl mx-auto space-y-16">
          <FeatureBlock
            label="MULTI-AGENT COORDINATION"
            title="Agents that work as a team, not a chatbot."
            description="Kaze orchestrates the entire squad. Tasks have dependencies — when Scout finishes research, Ghost automatically receives the deliverables as context. No human copy-pasting."
            bullets={[
              "Task dependency graph with automatic chain reactions",
              "Deliverables from upstream agents injected into downstream context",
              "Parallel work orchestration — agents work simultaneously",
              "Quality loops with rejection/rework cycles",
            ]}
            visual={<TaskScreenshotVisual />}
          />

          <FeatureBlock
            label="WAR ROOM"
            title="Watch every agent think, in real time."
            description="The War Room is your live operations floor. See agent lanes side by side — what each one is working on, their reasoning stream as it happens, and coordination messages flowing between them. Blockers surface instantly. Handoffs happen automatically."
            bullets={[
              "Agent lanes: each agent's current task, status, and live reasoning visible at a glance",
              "Coordination feed: handoffs, blockers, milestones — color-coded by type",
              "Reasoning stream: watch agents think step-by-step — tool calls, decisions, results",
              "Real-time progress: mission completion bar updates as tasks close",
              "Sentinel review gates: deliverables flagged and approved before flowing downstream",
            ]}
            visual={<WarRoomVisual />}
            reverse
          />

          <FeatureBlock
            label="EPISODIC MEMORY"
            title="Agents that learn across every session."
            description="Every agent builds up episodic memories — API quirks, your preferences, patterns that work. They surface the 10 most relevant memories at each session. Over time, lessons distill into their SOUL file — their evolving identity."
            bullets={[
              "8 memory types: api_quirk, preference, pattern, failure, shortcut...",
              "Relevance scoring by importance + recency + human endorsement",
              "Session handoffs: agents never lose context between sessions",
              "SOUL file distillation — agents literally get better at their jobs",
            ]}
            visual={<MemoryVisual />}
            reverse
          />

          <FeatureBlock
            label="INTEGRATION ENGINE"
            title="Built in-house. No Paragon. No $2,500/month."
            description="We replaced Paragon with a custom integration engine. 100+ blueprints across CRM, payments, analytics, dev tools, and marketing — all with OAuth2, API key, and Bearer auth out of the box. If your API isn't in the catalog, paste the docs URL and Claude generates it."
            bullets={[
              "100+ pre-seeded blueprints: Salesforce, Stripe, Pipedrive, Razorpay, Vercel, Apollo, Hunter, Google Analytics and more",
              "AI doc scraper: paste URL → Claude generates tool definitions in seconds",
              "OpenAPI spec import (deterministic, no AI needed)",
              "Jittered backoff, rate limit handling, auto OAuth token refresh",
            ]}
            visual={<SavingsVisual />}
          />

          <FeatureBlock
            label="EVENT-DRIVEN AUTOMATION"
            title="Your tools talk to your agents automatically."
            description="Any webhook from GitHub, Slack, Linear, or any other tool can trigger an agent workflow. With automation rules, JSONPath conditions, and template-based task creation — zero manual handoffs."
            bullets={[
              "HMAC-SHA256 signature verification (no spoofed events)",
              "JSONPath conditions for precise event filtering",
              "Agents wake up instantly when tasks arrive",
              "Full event history for audit trail",
            ]}
            visual={<WebhookVisual />}
            reverse
          />

          <FeatureBlock
            label="VOICE COMMAND CENTER"
            title="Talk to your AI squad. Out loud."
            description="Real-time voice conversations with Kaze, powered by Amazon Nova Sonic. Ask about agent status, create tasks, get briefings — all by voice. Your agents respond with live data, not canned answers."
            bullets={[
              "Sub-second latency via dedicated WebSocket + HTTP/2 stream to AWS Bedrock",
              "Tool calling mid-conversation — agents query real data while talking",
              "Daily voice briefings: \"What happened while I was away?\"",
              "Live transcription with speaker labels for accessibility",
            ]}
            visual={<VoiceCommandVisual />}
          />

          <FeatureBlock
            label="MISSION AUTOPILOT"
            title="Describe the goal. AI decomposes and executes."
            description="Type a goal in natural language — 'research our top 50 leads and book demos this week'. Claude Opus 4.6 breaks it into a dependency graph of subtasks, assigns the right agent to each, and fires them off in parallel. You review, refine by voice, or just let it run."
            bullets={[
              "Claude Opus 4.6 mission decomposition: multi-step goals become structured task graphs",
              "Auto-assigns agents by capability — Scout for research, Forge for code, Ghost for content",
              "Parallel + sequential execution: agents work simultaneously where possible",
              "Voice refinement mid-mission: talk through changes without retyping",
              "One-click launch or gated review before any action is taken",
            ]}
            visual={<AutopilotVisual />}
            reverse
          />

          <FeatureBlock
            label="LIVE OPS COMMAND CENTER"
            title="Real-time visibility into every agent, every action."
            description="Mission Control isn't a chat window — it's a live operations dashboard. Watch agents work in real time, inspect every tool call they make, approve or reject deliverables before they flow downstream, and replay any session in full."
            bullets={[
              "Live activity feed: every agent action, tool call, and decision streamed in real time",
              "Deliverable review gates: Sentinel flags outputs for human approval before proceeding",
              "Full session replay: inspect the exact context, memories, and tool calls of any session",
              "Agent analytics: tasks completed, API calls made, quality scores, and error rates per agent",
              "Webhook triggers: any event from GitHub, Slack, Linear, or your own system wakes agents instantly",
            ]}
            visual={<LiveOpsVisual />}
          />
        </div>
      </section>

      {/* ── SECTION 7b: LIVE WORKFLOW DEMO ── */}
      <section
        id="workflow-section"
        className="py-16 px-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(240 33% 3%) 0%, hsl(230 40% 5%) 100%)" }}
      >
        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(hsl(217 91% 60%) 1px, transparent 1px), linear-gradient(90deg, hsl(217 91% 60%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <RevealSection className="text-center mb-8 space-y-3">
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-glow" />
              <span
                className="text-xs font-mono tracking-widest"
                style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}
              >
                LIVE EXECUTION — ALGOHOUSE REVENUE ENGINE
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold">
              Watch Your Team Execute
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              One instruction triggers all 5 agents — in parallel and in sequence — calling real integrations, reviewing each other's work, and delivering a complete revenue pipeline. Watch it live in the command center.
            </motion.p>

            {/* Metric pills */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {[
                { label: "5 agents coordinating", color: "hsl(217, 91%, 60%)" },
                { label: "10 integrations called", color: "hsl(38, 92%, 50%)" },
                { label: "$240k pipeline output", color: "hsl(160, 84%, 39%)" },
                { label: "Sentinel QA loop", color: "hsl(330, 81%, 60%)" },
              ].map((p) => (
                <span
                  key={p.label}
                  className="text-xs px-3 py-1 rounded-full font-mono"
                  style={{
                    background: `${p.color.replace("hsl(", "hsla(").replace(")", ", 0.1)")}`,
                    border: `1px solid ${p.color.replace("hsl(", "hsla(").replace(")", ", 0.3)")}`,
                    color: p.color,
                  }}
                >
                  {p.label}
                </span>
              ))}
            </motion.div>
          </RevealSection>

          <WorkflowDemo />
        </div>
      </section>

      {/* ── SECTION 8: COMPARISON TABLE ── */}
      <section
        className="py-16 px-6"
        style={{ background: "linear-gradient(180deg, hsl(240 33% 3%) 0%, hsl(240 33% 4%) 100%)" }}
      >
        <div className="max-w-4xl mx-auto">
          <RevealSection className="text-center mb-8 space-y-3">
            <motion.div variants={itemVariants}>
              <span
                className="text-xs font-mono tracking-widest px-2 py-1 rounded"
                style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}
              >
                VS THE ALTERNATIVES
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold">
              Why Valence wins.
            </motion.h2>
            <motion.p variants={itemVariants} className="text-muted-foreground text-lg">
              Not a chatbot. Not a workflow tool. A complete autonomous workforce platform.
            </motion.p>
          </RevealSection>

          <ComparisonTable />

          {/* Agent analytics screenshot below comparison table */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, type: "spring", stiffness: 70 }}
          >
            {/* Section mini-heading */}
            <div className="text-center mb-6 space-y-2">
              <span
                className="text-xs font-mono tracking-widest px-2 py-1 rounded"
                style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}
              >
                AGENT ANALYTICS
              </span>
              <p className="text-muted-foreground/60 text-sm mt-2">
                Real-time performance across all agents — tasks completed, API calls made, quality scores.
              </p>
            </div>

            {/* Browser chrome wrapper */}
            <div
              className="mx-auto rounded-2xl overflow-hidden relative"
              style={{
                maxWidth: 900,
                border: "1px solid hsl(217 91% 60% / 0.18)",
                boxShadow: "0 0 0 1px hsl(var(--border) / 0.3), 0 32px 80px hsl(240 33% 3% / 0.8), 0 0 60px hsl(217 91% 60% / 0.07)",
                transform: "perspective(1200px) rotateX(3deg)",
              }}
            >
              {/* Glow behind */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at 50% 0%, hsl(217 91% 60% / 0.1) 0%, transparent 60%)",
                  filter: "blur(20px)",
                }}
              />

              {/* Fake browser chrome */}
              <div
                className="flex items-center gap-2 px-4 py-2.5 relative z-10"
                style={{ background: "hsl(240 25% 5%)", borderBottom: "1px solid hsl(var(--border) / 0.4)" }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <div
                  className="mx-3 flex-1 max-w-52 h-5 rounded flex items-center px-3 text-[10px] text-muted-foreground/40 font-mono"
                  style={{ background: "hsl(240 25% 8%)" }}
                >
                  app.valence.ai/analytics
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground/30">Today</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-green-400/70 font-mono">LIVE</span>
                  </div>
                </div>
              </div>

              <img
                src="/screenshots/agent_analytics.png"
                alt="Valence AI Agent Analytics"
                className="w-full block relative z-10"
                style={{ opacity: 0.92 }}
              />

              {/* Fade out bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-20"
                style={{ background: "linear-gradient(to bottom, transparent, hsl(240 33% 4%))" }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 9: FINAL CTA ── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden py-16 px-6">
        {/* Background */}
        <HeroParticleField opacity={0.25} />

        {/* Bioluminescent orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { color: "hsl(217, 91%, 60%)", x: "20%", y: "40%", size: 500, dur: "8s", delay: "0s" },
            { color: "hsl(258, 90%, 66%)", x: "75%", y: "55%", size: 400, dur: "10s", delay: "3s" },
            { color: "hsl(160, 84%, 39%)", x: "50%", y: "20%", size: 350, dur: "7s", delay: "1.5s" },
            { color: "hsl(38, 92%, 50%)", x: "85%", y: "25%", size: 280, dur: "9s", delay: "2s" },
          ].map((orb, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-bioluminescence"
              style={{
                left: orb.x,
                top: orb.y,
                width: orb.size,
                height: orb.size,
                background: `radial-gradient(circle, ${orb.color.replace("hsl(", "hsla(").replace(")", ", 0.1)")} 0%, transparent 70%)`,
                transform: "translate(-50%, -50%)",
                animationDuration: orb.dur,
                animationDelay: orb.delay,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <RevealSection className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
          <motion.div variants={itemVariants}>
            <span
              className="text-xs font-mono tracking-widest px-3 py-1.5 rounded-full"
              style={{
                background: "hsl(var(--primary) / 0.1)",
                border: "1px solid hsl(var(--primary) / 0.25)",
                color: "hsl(var(--primary) / 0.8)",
              }}
            >
              SELECTIVE PILOT PROGRAM · LIMITED SPOTS
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold leading-tight"
            style={{
              background: "linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--muted-foreground)) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Your Autonomous Workforce,<br />Built for You.
          </motion.h2>

          <motion.p variants={itemVariants} className="text-muted-foreground text-lg leading-relaxed">
            Each pilot is a dedicated deployment — private infrastructure, your integrations, your workflows.
            <br />
            We're onboarding a small cohort of companies. Apply and Arpit will reach out personally.
          </motion.p>

          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
            <motion.button
              onClick={() => setPilotOpen(true)}
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px hsl(var(--primary) / 0.4)" }}
              whileTap={{ scale: 0.97 }}
              className="relative px-8 py-4 rounded-xl text-base font-bold overflow-hidden"
              style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
                boxShadow: "0 0 24px hsl(var(--primary) / 0.25)",
              }}
            >
              <span className="relative z-10">Apply for a Pilot Spot →</span>
              <div
                className="absolute inset-0 rounded-xl animate-signal-ring pointer-events-none"
                style={{ border: "1px solid hsl(var(--primary))" }}
              />
              <div
                className="absolute inset-0 animate-hud-shimmer pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.1) 50%, transparent 80%)",
                  backgroundSize: "200% 100%",
                }}
              />
            </motion.button>

            
          </motion.div>

          {/* Feature pills */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 pt-2">
            {["5 AI Agents", "Voice Command", "Mission Autopilot", "94 Integrations", "Episodic Memory", "White-Glove Setup"].map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full text-muted-foreground/60"
                style={{ border: "1px solid hsl(var(--border) / 0.5)" }}
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </RevealSection>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="py-8 px-6 border-t border-border/40"
        style={{ background: "hsl(240 33% 3%)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground/50">
            <img src="/logo.svg" alt="" className="w-4 h-4 opacity-40" />
            <span>Valence AI</span>
            <span>·</span>
            <span>Command center for autonomous AI workforces</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60 font-mono">
            <Link to="/privacy" className="hover:text-muted-foreground transition-colors">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-muted-foreground transition-colors">
              Terms of Service
            </Link>
            <span>·</span>
            <a href="mailto:arpitdhamija.ai@gmail.com" className="hover:text-muted-foreground transition-colors">
              arpitdhamija.ai@gmail.com
            </a>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-green-400/60 animate-pulse-glow" />
              All agents operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
