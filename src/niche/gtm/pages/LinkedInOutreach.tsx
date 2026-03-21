import { useState, useEffect, useCallback } from "react";
import {
  Linkedin,
  Wand2,
  Copy,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Filter,
  MessageSquare,
  Search,
  Plug,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

type MessageTemplate = "connection_request" | "inmail" | "followup_dm" | "referral_ask";
type OutreachStatus = "pending" | "sent" | "replied" | "draft";

interface LinkedInLead {
  id: string;
  name: string;
  company: string;
  role: string;
  linkedInUrl: string;
  score: number;
  status: OutreachStatus;
  generatedMessage?: string;
}

const TEMPLATE_OPTIONS: { value: MessageTemplate; label: string; description: string }[] = [
  { value: "connection_request", label: "Connection Request", description: "Short 300-char connection note" },
  { value: "inmail", label: "InMail", description: "Full InMail with subject line" },
  { value: "followup_dm", label: "Follow-up DM", description: "After connection accepted" },
  { value: "referral_ask", label: "Referral Ask", description: "Ask for intro to decision maker" },
];

const STATUS_CONFIG: Record<OutreachStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-muted-foreground", bg: "bg-muted" },
  draft: { label: "Draft", color: "text-blue-500", bg: "bg-blue-500/10" },
  sent: { label: "Sent", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  replied: { label: "Replied", color: "text-green-500", bg: "bg-green-500/10" },
};

export function LinkedInOutreach() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { execute, isConnected } = useIntegrationCall();
  const [leads, setLeads] = useState<LinkedInLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate>("connection_request");
  const [statusFilter, setStatusFilter] = useState<"all" | OutreachStatus>("all");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apolloLoading, setApolloLoading] = useState(false);

  const isApolloConnected = isConnected("apollo");

  // Pull leads from task deliverables
  const tasks = useQuery(api.tasks.list, {});
  const leadTasks = (tasks ?? []).filter(
    (t: { tags?: string[]; status: string }) =>
      t.tags?.includes("niche:gtm") &&
      (t.tags?.includes("lead-sourcing") || t.tags?.includes("linkedin-outreach")) &&
      t.status === "done"
  );

  // Parse leads from task deliverables
  useEffect(() => {
    if (leadTasks.length > 0) {
      const parsedLeads: LinkedInLead[] = [];
      for (const task of leadTasks) {
        const deliverable = (task as any).deliverable;
        if (deliverable && typeof deliverable === "string") {
          try {
            const parsed = JSON.parse(deliverable);
            if (Array.isArray(parsed)) {
              for (const item of parsed) {
                if (item.linkedin_url || item.linkedIn || item.linkedInUrl) {
                  parsedLeads.push({
                    id: item.id ?? String(Math.random()),
                    name: item.name ?? `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim(),
                    company: item.company ?? item.organization_name ?? "",
                    role: item.role ?? item.title ?? "",
                    linkedInUrl: item.linkedin_url ?? item.linkedIn ?? item.linkedInUrl ?? "",
                    score: item.score ?? 50,
                    status: "pending",
                  });
                }
              }
            }
          } catch {
            // Not parseable JSON
          }
        }
      }
      if (parsedLeads.length > 0) {
        setLeads((prev) => {
          const existingIds = new Set(prev.map((l) => l.id));
          const newLeads = parsedLeads.filter((l) => !existingIds.has(l.id));
          return [...prev, ...newLeads];
        });
      }
    }
  }, [leadTasks.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apollo search for LinkedIn leads
  const handleApolloSearch = useCallback(async () => {
    if (!isApolloConnected) return;
    setApolloLoading(true);
    try {
      const result = await execute("apollo", "people_search", {
        q: "VP Engineering OR Head of Growth OR CTO",
        page: 1,
        per_page: 25,
      });

      if (result.success && result.result?.people) {
        const apolloLeads: LinkedInLead[] = result.result.people
          .filter((p: any) => p.linkedin_url)
          .map((p: any) => ({
            id: p.id ?? String(Math.random()),
            name: p.name ?? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim(),
            company: p.organization?.name ?? p.organization_name ?? "",
            role: p.title ?? "",
            linkedInUrl: p.linkedin_url ?? "",
            score: p.score ?? 50,
            status: "pending" as OutreachStatus,
          }));

        setLeads((prev) => {
          const existingIds = new Set(prev.map((l) => l.id));
          const newLeads = apolloLeads.filter((l) => !existingIds.has(l.id));
          return [...prev, ...newLeads];
        });
      }
    } catch {
      // Silently fail
    } finally {
      setApolloLoading(false);
    }
  }, [execute, isApolloConnected]);

  const filteredLeads = leads.filter(
    (l) => statusFilter === "all" || l.status === statusFilter
  );

  const currentLead = leads.find((l) => l.id === selectedLead);

  const handleGenerate = async (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    setGeneratingId(leadId);

    const templateDesc = TEMPLATE_OPTIONS.find((t) => t.value === selectedTemplate);

    const result = await triggerAgent(
      "Ghost",
      `Write LinkedIn ${templateDesc?.label ?? "message"} for ${lead.name}`,
      `Write a LinkedIn ${templateDesc?.label ?? "message"} (${templateDesc?.description ?? ""}) for:\n\nName: ${lead.name}\nRole: ${lead.role}\nCompany: ${lead.company}\nLinkedIn: ${lead.linkedInUrl}\n\nTemplate type: ${selectedTemplate}\nKeep it personal, reference something specific about their company or role. No generic "I came across your profile" openers. Under 300 characters for connection requests.`,
      ["niche:gtm", "linkedin-outreach"]
    );

    if (result.success) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                status: "draft" as OutreachStatus,
                generatedMessage: `[AI-generated ${templateDesc?.label} -- check task ${result.taskId} for output]`,
              }
            : l
        )
      );
    }

    setGeneratingId(null);
  };

  const handleCopy = async (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead?.generatedMessage) return;

    try {
      await navigator.clipboard.writeText(lead.generatedMessage);
      setCopiedId(leadId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard API may not be available
    }
  };

  const handleMarkSent = (leadId: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, status: "sent" as OutreachStatus } : l
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Linkedin className="w-6 h-6" style={{ color: config.accentColor }} />
            LinkedIn Outreach
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate personalized LinkedIn messages with AI -- copy and send manually to respect LinkedIn ToS
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isApolloConnected && (
            <button
              onClick={handleApolloSearch}
              disabled={apolloLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
            >
              {apolloLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Pull from Apollo
            </button>
          )}
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value as MessageTemplate)}
            className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {TEMPLATE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {leads.length === 0 ? (
        /* Empty State */
        <div className="rounded-xl border border-border bg-card p-16 text-center">
          <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Source leads first to start LinkedIn outreach</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Source leads from the Lead Sourcer page or connect Apollo to pull contacts with LinkedIn profiles.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to={`${config.basePath}/leads`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: config.accentColor }}
            >
              <Search className="w-4 h-4" />
              Go to Lead Sourcer
            </Link>
            {!isApolloConnected && (
              <Link
                to="/integrations"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plug className="w-4 h-4" />
                Connect Apollo
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {(["all", "pending", "draft", "sent", "replied"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "text-white"
                    : "bg-accent/30 text-muted-foreground hover:text-foreground"
                }`}
                style={statusFilter === s ? { background: config.accentColor } : undefined}
              >
                {s === "all" ? "All" : STATUS_CONFIG[s].label}
              </button>
            ))}
            <span className="text-xs text-muted-foreground ml-auto">
              {filteredLeads.length} leads
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Lead List */}
            <div className="lg:col-span-2 space-y-2">
              {filteredLeads.map((lead) => {
                const statusCfg = STATUS_CONFIG[lead.status];
                const isSelected = selectedLead === lead.id;

                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead.id)}
                    className={`rounded-xl border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-border/80 bg-accent/20"
                        : "border-border bg-card hover:border-border/60"
                    }`}
                    style={isSelected ? { outline: `1px solid ${config.accentColor}30` } : undefined}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                            style={{
                              background: lead.score >= 85 ? "hsl(142,71%,45%,0.1)" : lead.score >= 70 ? "hsl(38,92%,50%,0.1)" : "hsl(0,0%,50%,0.1)",
                              color: lead.score >= 85 ? "hsl(142,71%,45%)" : lead.score >= 70 ? "hsl(38,92%,50%)" : "hsl(0,0%,50%)",
                            }}
                          >
                            {lead.score}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{lead.role} at {lead.company}</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusCfg.bg} ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <a
                        href={lead.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] font-medium hover:underline"
                        style={{ color: config.accentColor }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        Profile
                      </a>

                      {!lead.generatedMessage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerate(lead.id);
                          }}
                          disabled={generatingId === lead.id || agentLoading}
                          className="flex items-center gap-1 text-[10px] font-medium ml-auto px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                        >
                          {generatingId === lead.id ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <Wand2 className="w-2.5 h-2.5" />
                          )}
                          Generate
                        </button>
                      )}

                      {lead.generatedMessage && (
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(lead.id);
                            }}
                            className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copiedId === lead.id ? (
                              <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                            {copiedId === lead.id ? "Copied" : "Copy"}
                          </button>
                          {lead.status === "draft" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkSent(lead.id);
                              }}
                              className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded text-white transition-colors"
                              style={{ background: config.accentColor }}
                            >
                              Mark Sent
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Preview */}
            <div className="lg:col-span-3">
              {currentLead ? (
                <div className="rounded-xl border border-border bg-card overflow-hidden sticky top-6">
                  <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" style={{ color: config.accentColor }} />
                      <h2 className="text-sm font-semibold text-foreground">
                        Message Preview — {currentLead.name}
                      </h2>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {TEMPLATE_OPTIONS.find((t) => t.value === selectedTemplate)?.label}
                    </span>
                  </div>

                  {currentLead.generatedMessage ? (
                    <div className="p-5">
                      <div className="rounded-lg border border-border bg-background p-4">
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/30">
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white"
                            style={{ background: config.accentColor }}
                          >
                            {currentLead.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{currentLead.name}</p>
                            <p className="text-[10px] text-muted-foreground">{currentLead.role} at {currentLead.company}</p>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                          {currentLead.generatedMessage}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-3">
                          {currentLead.generatedMessage.length} characters
                          {selectedTemplate === "connection_request" && currentLead.generatedMessage.length > 300 && (
                            <span className="text-red-400 ml-2">
                              (exceeds 300 char limit for connection requests)
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => handleCopy(currentLead.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                          style={{ background: config.accentColor }}
                        >
                          {copiedId === currentLead.id ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          {copiedId === currentLead.id ? "Copied to Clipboard" : "Copy to Clipboard"}
                        </button>
                        <button
                          onClick={() => handleGenerate(currentLead.id)}
                          disabled={generatingId === currentLead.id || agentLoading}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                        >
                          {generatingId === currentLead.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Wand2 className="w-4 h-4" />
                          )}
                          Regenerate
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-10 text-center">
                      <Linkedin className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-3">
                        No message generated yet for {currentLead.name}
                      </p>
                      <button
                        onClick={() => handleGenerate(currentLead.id)}
                        disabled={generatingId === currentLead.id || agentLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors mx-auto"
                        style={{ background: config.accentColor }}
                      >
                        {generatingId === currentLead.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Wand2 className="w-4 h-4" />
                        )}
                        Generate Message with Ghost
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card p-10 text-center">
                  <Linkedin className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select a lead to preview or generate a LinkedIn message
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
