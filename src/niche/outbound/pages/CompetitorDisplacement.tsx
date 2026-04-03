import { useState } from "react";
import {
  Swords,
  Send,
  Loader2,
  Sparkles,
  Star,
  Building2,
  Users,
  Mail,
  CheckCircle2,
  ArrowRight,
  Zap,
  Brain,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useUserTasks } from "@/hooks/useUserScoped";
import { useProductContext } from "../hooks/useProductContext";

const DEFAULT_COMPETITORS = [
  { name: "Salesforce", category: "CRM" },
  { name: "HubSpot", category: "CRM" },
  { name: "Outreach", category: "Sales Engagement" },
  { name: "Mailchimp", category: "Email Marketing" },
  { name: "Zendesk", category: "Support" },
  { name: "Monday.com", category: "Project Management" },
];

const PIPELINE_STEPS = [
  { icon: Star, label: "Scrape competitor reviews", sublabel: "G2, Capterra, Reddit, Twitter" },
  { icon: Brain, label: "Extract pain points", sublabel: "AI clusters negative sentiment" },
  { icon: Building2, label: "Find their customers", sublabel: "Apollo technographics + signals" },
  { icon: Users, label: "Get decision-makers", sublabel: "VP/Director contacts with emails" },
  { icon: Sparkles, label: "Pain-matched emails", sublabel: "Each email references their specific pain" },
  { icon: Mail, label: "Gmail drafts ready", sublabel: "One click to send" },
];

export function CompetitorDisplacement() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { context, isSetUp } = useProductContext();

  const [competitor, setCompetitor] = useState("");
  const [targetCount, setTargetCount] = useState("30");
  const [launched, setLaunched] = useState(false);

  // Auto-fill from product context
  const yourProduct = isSetUp ? context.productName : "";
  const differentiator = isSetUp && context.differentiators.length > 0 ? context.differentiators[0] : "";

  // Use detected competitors if available, otherwise defaults
  const EXAMPLE_COMPETITORS = isSetUp && context.competitors.length > 0
    ? context.competitors.map((c) => ({ name: c, category: "Detected" }))
    : DEFAULT_COMPETITORS;

  const tasks = useUserTasks();
  const displacementTasks = (tasks ?? [])
    .filter((t: { tags?: string[] }) => t.tags?.includes("niche:outbound") && t.tags?.includes("competitor-displacement"))
    .sort((a: { _creationTime: number }, b: { _creationTime: number }) => b._creationTime - a._creationTime);

  const activeTasks = displacementTasks.filter((t: { status: string }) => t.status === "in_progress" || t.status === "assigned");
  const completedTasks = displacementTasks.filter((t: { status: string }) => t.status === "done");

  const handleLaunch = async () => {
    if (!competitor.trim() || agentLoading) return;

    const description = `COMPETITOR DISPLACEMENT CAMPAIGN — AI Outbound Engine

TARGET COMPETITOR: ${competitor.trim()}
YOUR PRODUCT: ${yourProduct.trim() || "[not specified]"}
KEY DIFFERENTIATOR: ${differentiator.trim() || "[not specified]"}
TARGET LEAD COUNT: ${targetCount}

Execute this autonomous pipeline:

TASK 1 → Scout: "Competitor Review Intelligence: ${competitor}"
Research ${competitor} on G2, Capterra, TrustRadius, Reddit, and Twitter/X. Find:
- Top 10 recurring complaints and pain points from real user reviews
- Common reasons people switch away from ${competitor}
- Feature gaps and limitations users mention most
- Pricing complaints
Deliver a structured "Pain Point Report" with: pain_point, frequency, severity (high/med/low), example_quote, and which persona is most affected.
Tags: niche:outbound, competitor-displacement, stage:companies

TASK 2 → Scout: "Find ${targetCount} companies using ${competitor}"
IMPORTANT: Do NOT use Apollo credits for search. Use FREE sources:
- G2 comparison pages and competitor profile pages (web_fetch g2.com)
- Google search: "${competitor} alternatives" OR "switching from ${competitor}"
- Reddit/HackerNews discussions about ${competitor}
- Crunchbase for company details
- BuiltWith or similar for technographic data
Prioritize companies showing churn signals: negative reviews, job posts in the category, growth stage (Series A-C).
You CAN use Apollo organization_enrich (by domain) to enrich company details — that's free.
Return: company name, domain, employee count, industry, funding stage, and any churn signals found.
Tags: niche:outbound, competitor-displacement, stage:companies
dependsOn: [Task 1]

TASK 3 → Scout: "Find decision-maker contacts at ${competitor} customers"
For each company from Task 2, find 1-2 decision-maker contacts (VP/Director/Head of relevant department).
IMPORTANT: Do NOT use Apollo people_enrich or people_search (costs credits). Use FREE sources:
- LinkedIn public profiles (Google: "name" site:linkedin.com)
- Company /about or /team pages
- Crunchbase people profiles
Detect email pattern from company domain (e.g. firstname@company.com).
Tags: niche:outbound, competitor-displacement, stage:contacts
dependsOn: [Task 2]

TASK 4 → Forge: "Enrich contacts and push to HubSpot"
Take contacts from Task 3, enrich via Clay if available, otherwise compile Scout's research. Use Apollo organization_enrich (free, by domain) for company data only. Push to HubSpot as a contact list named "Displacement: ${competitor} - [date]". Tag contacts with "competitor:${competitor.toLowerCase().replace(/\s+/g, '-')}".
Tags: niche:outbound, competitor-displacement, stage:enriched, stage:crm
dependsOn: [Task 3]

TASK 5 → Ghost: "Write pain-matched displacement emails"
Using the Pain Point Report from Task 1 and the contact list from Task 3, write a 4-step email sequence:

CRITICAL: Each email must reference the SPECIFIC pain point most relevant to that contact's role.

Step 1 (Day 0) — Pain Acknowledgment:
"I talk to a lot of [role]s who use ${competitor}. The #1 thing I hear is [pain point from report]. Is that something your team deals with too?"

Step 2 (Day 3) — Social Proof:
"[Similar company] switched from ${competitor} ${yourProduct ? 'to ' + yourProduct : ''} and [specific improvement]. Thought it might resonate given [their situation]."

Step 3 (Day 5) — Value Drop:
Share a specific insight, case study, or data point that addresses their likely pain point. No ask — just value.

Step 4 (Day 7) — Direct Ask:
"Worth a 15-min call to see if [differentiator or value prop] could help? Here's my calendar: [link]"

Include {{firstName}}, {{company}}, {{painPoint}} merge tags. Write 3 variations of Step 1 for the top 3 pain points.${yourProduct ? '\n\nPosition ' + yourProduct + ' as the solution.' : ''}${differentiator ? '\n\nKey differentiator to weave in: ' + differentiator : ''}
Tags: niche:outbound, competitor-displacement, stage:sequences, channel:email
dependsOn: [Task 1, Task 3]

TASK 6 → Ghost: "Write LinkedIn connection messages"
Write a LinkedIn connection request + 2 follow-up messages using the same pain-matching approach.

Connection request (300 char max): Reference the competitor category, not a hard pitch.
Follow-up 1 (Day 2): Share the value drop / insight.
Follow-up 2 (Day 5): Soft ask for a call.

Tags: niche:outbound, competitor-displacement, stage:sequences, channel:linkedin
dependsOn: [Task 1]

TASK 7 → Sentinel: "Review displacement campaign quality"
Review all sequences for: spam compliance, personalization quality, pain point accuracy, tone (helpful not aggressive — we're offering a solution, not attacking the competitor). Reject if emails mention the competitor by name in a negative way — reference the pain, not the brand.
Tags: niche:outbound, competitor-displacement
dependsOn: [Task 5, Task 6]

Create all tasks with "niche:outbound" and "competitor-displacement" tags. Wire dependencies as specified.`;

    const result = await triggerAgent(
      "Kaze",
      `Competitor Displacement: ${competitor.trim()}`,
      description,
      ["niche:outbound", "competitor-displacement", "mission:displacement"],
      { priority: "urgent" }
    );

    if (result.success) {
      setLaunched(true);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${config.accentColor}20` }}
            >
              <Swords className="w-5 h-5" style={{ color: config.accentColor }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Competitor Displacement</h1>
              <p className="text-sm text-muted-foreground">
                Target your competitor's unhappy customers with pain-matched outreach
              </p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="p-5 rounded-2xl border border-border/30 bg-card/50">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            How it works — 6 autonomous steps
          </h3>
          <div className="space-y-3">
            {PIPELINE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isComplete = completedTasks.length > idx;
              const isActive = !isComplete && activeTasks.length > 0 && completedTasks.length === idx;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-6">
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : isActive ? (
                      <div className="relative">
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: config.accentColor }} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-border/30 flex items-center justify-center">
                        <span className="text-[9px] text-muted-foreground/40">{idx + 1}</span>
                      </div>
                    )}
                  </div>
                  <Icon className={`w-4 h-4 shrink-0 ${isComplete ? "text-green-500" : isActive ? "text-blue-400" : "text-muted-foreground/30"}`} />
                  <div className="flex-1">
                    <p className={`text-sm ${isComplete || isActive ? "text-foreground" : "text-muted-foreground/50"}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground/40">{step.sublabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!launched ? (
          <>
            {/* Input form */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Competitor to displace *
                </label>
                <input
                  type="text"
                  value={competitor}
                  onChange={(e) => setCompetitor(e.target.value)}
                  placeholder="e.g., Salesforce, HubSpot, Zendesk..."
                  className="w-full mt-1.5 px-4 py-3 rounded-xl border border-border/50 bg-card text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-blue-500/50"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {EXAMPLE_COMPETITORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setCompetitor(c.name)}
                      className="px-2.5 py-1 rounded-full border border-border/40 text-[10px] text-muted-foreground/60 hover:text-foreground hover:border-border transition-all"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-filled from product setup */}
              {isSetUp && (yourProduct || differentiator) && (
                <div className="px-4 py-3 rounded-xl border border-green-500/20 bg-green-500/5 text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">Auto-detected: </span>
                  {yourProduct && <span>Product: {yourProduct}</span>}
                  {yourProduct && differentiator && <span> · </span>}
                  {differentiator && <span>Edge: {differentiator}</span>}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Target leads
                </label>
                <select
                  value={targetCount}
                  onChange={(e) => setTargetCount(e.target.value)}
                  className="w-full mt-1.5 px-4 py-3 rounded-xl border border-border/50 bg-card text-foreground focus:outline-none focus:border-blue-500/50"
                >
                  <option value="10">10 leads (quick test)</option>
                  <option value="30">30 leads (recommended)</option>
                  <option value="50">50 leads</option>
                  <option value="100">100 leads (max)</option>
                </select>
              </div>
            </div>

            {/* Launch button */}
            <button
              onClick={handleLaunch}
              disabled={!competitor.trim() || agentLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-white font-semibold text-lg transition-all disabled:opacity-30 hover:shadow-lg hover:scale-[1.01]"
              style={{ background: config.accentColor }}
            >
              {agentLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Launching displacement campaign...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Launch Displacement Campaign
                </>
              )}
            </button>

            {/* Value prop */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "20 min", label: "vs 4 hours manually" },
                { value: "47x", label: "more opportunities" },
                { value: "3x", label: "higher conversion" },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-xl border border-border/30 bg-card/50 text-center">
                  <p className="text-lg font-bold" style={{ color: config.accentColor }}>{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Launched state */}
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">
                Displacement campaign launched against {competitor}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Kaze is orchestrating Scout, Forge, Ghost, and Sentinel. Watch the pipeline above fill up.
              </p>
              <button
                onClick={() => { setLaunched(false); setCompetitor(""); setYourProduct(""); setDifferentiator(""); }}
                className="text-sm font-medium hover:underline"
                style={{ color: config.accentColor }}
              >
                Launch another campaign
              </button>
            </div>

            {/* Active task feed */}
            {displacementTasks.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Campaign Progress
                </h3>
                {displacementTasks.slice(0, 10).map((task: {
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
                        <div className="w-4 h-4 mt-0.5 rounded-full border-2 border-yellow-500/50 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{task.assignee}</p>
                        {task.status === "done" && task.deliverables && task.deliverables.length > 0 && (
                          <div className="mt-2 px-3 py-2 rounded-lg bg-accent/20 text-xs text-foreground/70 whitespace-pre-wrap max-h-32 overflow-y-auto">
                            {task.deliverables[0].content.slice(0, 500)}
                            {task.deliverables[0].content.length > 500 ? "..." : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
