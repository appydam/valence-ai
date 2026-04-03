import { useState } from "react";
import {
  Send,
  Loader2,
  Sparkles,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  Upload,
  Globe,
  Star,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useProductContext } from "../hooks/useProductContext";
import { useLeadScoring } from "../hooks/useLeadScoring";
import { CsvUploader } from "../components/CsvUploader";
import { CompanyTable } from "../components/CompanyTable";
import { useCsvImport } from "../hooks/useCsvImport";
import { useUserTasks } from "@/hooks/useUserScoped";

type Tab = "overview" | "companies" | "contacts" | "leads";

export function Campaigns() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { getPromptContext, isSetUp, context } = useProductContext();
  const { scoreAllLeads, loading: scoringLoading } = useLeadScoring();
  const { headers, rows, fileName, parseFile, clear } = useCsvImport();
  const [tab, setTab] = useState<Tab>("overview");
  const [prompt, setPrompt] = useState("");

  const tasks = useUserTasks();
  const campaignTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) => t.tags?.includes("niche:outbound") &&
      (t.tags?.includes("stage:companies") || t.tags?.includes("stage:contacts") ||
       t.tags?.includes("stage:enriched") || t.tags?.includes("stage:crm"))
  ).sort((a: { _creationTime: number }, b: { _creationTime: number }) => b._creationTime - a._creationTime);

  const companyTasks = campaignTasks.filter((t: { tags?: string[] }) => t.tags?.includes("stage:companies"));
  const contactTasks = campaignTasks.filter((t: { tags?: string[] }) => t.tags?.includes("stage:contacts"));
  const completedTasks = campaignTasks.filter((t: { status: string }) => t.status === "done");

  const handleSubmit = async () => {
    if (!prompt.trim() || agentLoading) return;
    const text = prompt.trim();
    setPrompt("");
    const productCtx = getPromptContext();

    // Auto-detect which stage this request is for
    const isCompanyTask = /compan|list|source|find.*compan|ICP|target/i.test(text);
    const isContactTask = /contact|decision.*maker|VP|director|CTO|email|linkedin/i.test(text);
    const isEnrichTask = /enrich|clay|phone|verify/i.test(text);
    const isCrmTask = /hubspot|CRM|push|import|sync/i.test(text);

    const agent = isCompanyTask || isContactTask ? "Scout" : "Forge";
    const tags = ["niche:outbound"];
    if (isCompanyTask) tags.push("stage:companies");
    if (isContactTask) tags.push("stage:contacts");
    if (isEnrichTask) tags.push("stage:enriched");
    if (isCrmTask) tags.push("stage:crm");
    if (tags.length === 1) tags.push("stage:companies", "stage:contacts"); // default

    await triggerAgent(
      agent,
      text.length > 70 ? text.slice(0, 70) + "..." : text,
      `User request from AI Outbound Engine — Campaign Building:\n\n"${text}"${productCtx ? `\n\n--- PRODUCT CONTEXT ---\n${productCtx}` : ""}\n\n--- RULES ---\n- Do NOT use Apollo credits for people search\n- Apollo organization_enrich (by domain) is FREE\n- Use free web sources: LinkedIn, Crunchbase, Google, company websites\n- For contacts: find name, title, company, LinkedIn URL, email pattern`,
      tags,
      { priority: "high" }
    );
  };

  const tabs = [
    { key: "overview" as Tab, label: "Overview", count: campaignTasks.length },
    { key: "companies" as Tab, label: "Companies", count: companyTasks.length },
    { key: "contacts" as Tab, label: "Contacts", count: contactTasks.length },
    { key: "leads" as Tab, label: "Lead Scores", count: 0 },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 pt-6 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
            <p className="text-sm text-muted-foreground">
              Source companies, find contacts, enrich, and push to CRM — all in one place
            </p>
          </div>
          {contactTasks.length > 0 && (
            <button
              onClick={() => scoreAllLeads()}
              disabled={scoringLoading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-accent/20 transition-colors"
            >
              {scoringLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5 text-amber-400" />}
              Score Leads
            </button>
          )}
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
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={isSetUp ? `e.g., "Find 30 companies matching my ICP"` : `e.g., "Find 50 Series B SaaS companies"`}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || agentLoading}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-white transition-all disabled:opacity-30"
            style={{ background: config.accentColor }}
          >
            {agentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(isSetUp
            ? ["Find companies matching my ICP", "Get VP contacts at these companies", "Enrich and push to HubSpot"]
            : ["50 Series B SaaS companies", "Find VP Ops contacts", "Push enriched contacts to HubSpot"]
          ).map((s) => (
            <button key={s} onClick={() => setPrompt(s)} className="px-2.5 py-1 rounded-full border border-border/40 text-[10px] text-muted-foreground/60 hover:text-foreground hover:border-border transition-all">
              {s}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border/30">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${tab === t.key ? "text-foreground border-current" : "text-muted-foreground/50 border-transparent hover:text-foreground/70"}`}
              style={tab === t.key ? { color: config.accentColor, borderColor: config.accentColor } : {}}
            >
              {t.label}
              {t.count > 0 && <span className="ml-1.5 text-[10px] text-muted-foreground/40">{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {tab === "overview" && (
          <div className="space-y-4 pt-4">
            {/* CSV Upload */}
            <CsvUploader onFileSelect={parseFile} fileName={fileName} onClear={clear} />
            {rows.length > 0 && <CompanyTable headers={headers} rows={rows} />}

            {/* Task feed */}
            {campaignTasks.length === 0 && !fileName && (
              <div className="text-center py-12">
                <Building2 className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Upload a CSV or describe your target above</p>
              </div>
            )}
            {campaignTasks.length > 0 && (
              <div className="space-y-2">
                {campaignTasks.slice(0, 15).map((task: { _id: string; title: string; status: string; assignee?: string; tags?: string[]; deliverables?: { name: string; content: string }[] }) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "companies" && (
          <div className="space-y-2 pt-4">
            {companyTasks.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No company research yet</p>
              </div>
            ) : companyTasks.map((task: { _id: string; title: string; status: string; assignee?: string; deliverables?: { name: string; content: string }[] }) => (
              <TaskCard key={task._id} task={task} showDeliverables />
            ))}
          </div>
        )}

        {tab === "contacts" && (
          <div className="space-y-2 pt-4">
            {contactTasks.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No contacts found yet. Source companies first.</p>
              </div>
            ) : contactTasks.map((task: { _id: string; title: string; status: string; assignee?: string; deliverables?: { name: string; content: string }[] }) => (
              <TaskCard key={task._id} task={task} showDeliverables />
            ))}
          </div>
        )}

        {tab === "leads" && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">AI-scored leads based on ICP fit, engagement, and signals</p>
              <button
                onClick={() => scoreAllLeads()}
                disabled={scoringLoading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all disabled:opacity-30"
                style={{ background: config.accentColor }}
              >
                {scoringLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
                Run Scoring
              </button>
            </div>
            {/* Scoring results will show as task deliverables */}
            {(tasks ?? []).filter((t: { tags?: string[] }) => t.tags?.includes("lead-scoring")).map((task: { _id: string; title: string; status: string; deliverables?: { name: string; content: string }[] }) => (
              <TaskCard key={task._id} task={task} showDeliverables />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, showDeliverables }: { task: { _id: string; title: string; status: string; assignee?: string; deliverables?: { name: string; content: string }[] }; showDeliverables?: boolean }) {
  const isDone = task.status === "done";
  const isWorking = task.status === "in_progress";
  const hasDeliverables = (task.deliverables?.length ?? 0) > 0;

  return (
    <div className="px-4 py-3 rounded-xl border border-border/50 bg-card">
      <div className="flex items-start gap-3">
        {isDone ? (
          <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 shrink-0" />
        ) : isWorking ? (
          <Loader2 className="w-4 h-4 mt-0.5 text-blue-400 animate-spin shrink-0" />
        ) : (
          <Clock className="w-4 h-4 mt-0.5 text-yellow-500 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{task.title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{task.assignee}</p>
          {(showDeliverables || isDone) && hasDeliverables && (
            <div className="mt-2 px-3 py-2 rounded-lg bg-accent/20 text-xs text-foreground/70 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {task.deliverables![0].content.slice(0, 600)}
              {task.deliverables![0].content.length > 600 ? "..." : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
