import { useState } from "react";
import {
  Signal,
  Send,
  Loader2,
  Sparkles,
  Eye,
  Globe,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useProductContext } from "../hooks/useProductContext";
import { useUserTasks } from "@/hooks/useUserScoped";

type Tab = "social" | "visitors" | "hiring";

export function Signals() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { getPromptContext, isSetUp, context } = useProductContext();
  const [tab, setTab] = useState<Tab>("social");

  const tasks = useUserTasks();
  const signalTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) => t.tags?.includes("niche:outbound") &&
      (t.tags?.includes("signal:social") || t.tags?.includes("signal:visitor") || t.tags?.includes("signal:hiring"))
  ).sort((a: { _creationTime: number }, b: { _creationTime: number }) => b._creationTime - a._creationTime);

  const socialTasks = signalTasks.filter((t: { tags?: string[] }) => t.tags?.includes("signal:social"));
  const visitorTasks = signalTasks.filter((t: { tags?: string[] }) => t.tags?.includes("signal:visitor"));
  const hiringTasks = signalTasks.filter((t: { tags?: string[] }) => t.tags?.includes("signal:hiring"));

  const handleScanSocial = async () => {
    const productCtx = getPromptContext();
    const competitors = isSetUp ? context.competitors : [];

    await triggerAgent(
      "Scout",
      "Scan social signals for buying intent",
      `SOCIAL SIGNAL SCAN — AI Outbound Engine
${productCtx ? `\n--- PRODUCT CONTEXT ---\n${productCtx}` : ""}

Scan these sources for buying signals from target companies:

1. LINKEDIN SIGNALS (use web_fetch on Google: site:linkedin.com "[keyword]"):
   - Posts from people at target companies mentioning: ${competitors.length > 0 ? competitors.join(", ") : "competitors in your category"}, "looking for alternative", "switching from", "evaluating tools", "pain with"
   - Job posts hiring for roles in our category (signals they're investing in this area)
   - Company announcements: funding rounds, new offices, leadership changes

2. TWITTER/X SIGNALS:
   - Complaints about competitors: search "[competitor] frustrating" or "[competitor] alternative"
   - Industry discussions about problems we solve

3. REDDIT/HACKERNEWS:
   - Threads asking for alternatives to competitors
   - Discussions about the pain points we solve

4. G2/CAPTERRA:
   - Recent negative reviews of competitors (last 30 days)

For each signal found, return:
- Source (LinkedIn/Twitter/Reddit/G2)
- Person/company name
- Signal type (complaint, job_post, evaluation, churn_risk)
- Signal strength (high/medium/low)
- Recommended action (reach out immediately / add to watch list / add to campaign)
- Direct link if available

Sort by signal strength. These are the HOTTEST leads — people actively looking for what we sell.`,
      ["niche:outbound", "signal:social"],
      { priority: "urgent" }
    );
  };

  const handleScanVisitors = async () => {
    const productCtx = getPromptContext();

    await triggerAgent(
      "Scout",
      "Check website visitor signals via analytics",
      `WEBSITE VISITOR INTENT — AI Outbound Engine
${productCtx ? `\n--- PRODUCT CONTEXT ---\n${productCtx}` : ""}

Check Google Analytics data (if connected) for visitor intent signals:

1. HIGH-INTENT PAGES: Look for visits to:
   - Pricing page (strongest buying signal)
   - Demo/trial/signup page
   - Integration/API docs page
   - Comparison/vs pages
   - Case studies page

2. CROSS-REFERENCE: If any visitor's company matches contacts in our outbound pipeline:
   - Flag them as HOT LEAD
   - Note which pages they visited and when
   - Recommend immediate follow-up

3. TRAFFIC SOURCES: Look for:
   - Direct traffic from company domains (someone typed our URL)
   - Referrals from competitor comparison sites
   - Search traffic for competitor-related keywords

For each signal:
- Company (if identifiable from IP/referrer)
- Pages visited + time spent
- Intent score (high/medium/low)
- Recommended action

NOTE: If Google Analytics is not connected, explain what data would be available with it connected and suggest connecting it.`,
      ["niche:outbound", "signal:visitor"],
      { priority: "high" }
    );
  };

  const handleScanHiring = async () => {
    const productCtx = getPromptContext();

    await triggerAgent(
      "Scout",
      "Scan hiring signals at target companies",
      `HIRING SIGNAL SCAN — AI Outbound Engine
${productCtx ? `\n--- PRODUCT CONTEXT ---\n${productCtx}` : ""}

Search for hiring signals that indicate companies are investing in our category:

1. JOB BOARDS (use web_fetch on Google: site:greenhouse.io OR site:lever.co OR site:linkedin.com/jobs):
   - Companies hiring for roles related to our product category
   - Senior hires (VP/Director) = bigger budget, new initiative
   - Multiple hires in same area = scaling up, need tools

2. LINKEDIN:
   - "We're hiring" posts from target companies
   - New executive announcements in relevant departments

3. WHAT THIS MEANS:
   - Hiring VP of Sales = buying sales tools soon
   - Hiring data engineers = need data infrastructure
   - Hiring SDRs = need outbound tools (us!)

For each signal:
- Company name + domain
- Role being hired
- Seniority level
- Why it's relevant (what it signals about their needs)
- Recommended contact to reach out to
- Urgency (high = hire NOW means buy NOW)`,
      ["niche:outbound", "signal:hiring"],
      { priority: "high" }
    );
  };

  const tabs = [
    { key: "social" as Tab, label: "Social & Reviews", icon: Signal, count: socialTasks.length },
    { key: "visitors" as Tab, label: "Website Visitors", icon: Eye, count: visitorTasks.length },
    { key: "hiring" as Tab, label: "Hiring Signals", icon: Briefcase, count: hiringTasks.length },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 px-6 pt-6 pb-4 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Signals</h1>
          <p className="text-sm text-muted-foreground">
            Buying signals from social media, your website, and job boards — the hottest leads
          </p>
        </div>

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
                {t.count > 0 && <span className="text-[10px] text-muted-foreground/40 ml-1">{t.count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {tab === "social" && (
          <div className="space-y-4 pt-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                LinkedIn, Twitter, Reddit, G2 — find people complaining about competitors or evaluating tools
              </p>
              <button
                onClick={handleScanSocial}
                disabled={agentLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-30"
                style={{ background: config.accentColor }}
              >
                {agentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Signal className="w-4 h-4" />}
                Scan Social
              </button>
            </div>
            <TaskList tasks={socialTasks} emptyIcon={Signal} emptyText="Scan social media for buying signals" />
          </div>
        )}

        {tab === "visitors" && (
          <div className="space-y-4 pt-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Detect when prospects visit your pricing or demo page after receiving a cold email
              </p>
              <button
                onClick={handleScanVisitors}
                disabled={agentLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-30"
                style={{ background: config.accentColor }}
              >
                {agentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Check Visitors
              </button>
            </div>
            <TaskList tasks={visitorTasks} emptyIcon={Eye} emptyText="Check website analytics for prospect visits" />
          </div>
        )}

        {tab === "hiring" && (
          <div className="space-y-4 pt-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Companies hiring in your category = ready to buy tools. Catch them early.
              </p>
              <button
                onClick={handleScanHiring}
                disabled={agentLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-30"
                style={{ background: config.accentColor }}
              >
                {agentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                Scan Hiring
              </button>
            </div>
            <TaskList tasks={hiringTasks} emptyIcon={Briefcase} emptyText="Scan job boards for hiring signals" />
          </div>
        )}
      </div>
    </div>
  );
}

function TaskList({ tasks, emptyIcon: EmptyIcon, emptyText }: { tasks: any[]; emptyIcon: typeof Signal; emptyText: string }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <EmptyIcon className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {tasks.map((t: { _id: string; title: string; status: string; deliverables?: { name: string; content: string }[] }) => (
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
  );
}
