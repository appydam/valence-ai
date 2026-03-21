import { useState, useEffect, useCallback, Fragment } from "react";
import {
  Search,
  Download,
  PenLine,
  ChevronDown,
  ChevronUp,
  Filter,
  ExternalLink,
  Wand2,
  Loader2,
  Target,
  Users,
  Plug,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { LeadScoreBreakdown } from "../components/LeadScoreBreakdown";
import { ContactTimeline } from "../components/ContactTimeline";
import type { ReplyClassification } from "../hooks/useReplyDetection";

type LeadStatus = "New" | "Contacted" | "Replied" | "Meeting";

interface Lead {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  score: number;
  status: LeadStatus;
  intentSignals: string[];
  linkedIn: string;
  github?: string;
  replyClassification?: ReplyClassification;
  enrichment: {
    companySize: string;
    funding: string;
    techStack: string[];
    recentNews: string;
  };
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  New: "bg-muted text-muted-foreground",
  Contacted: "bg-blue-500/10 text-blue-500",
  Replied: "bg-yellow-500/10 text-yellow-500",
  Meeting: "bg-green-500/10 text-green-500",
};

const REPLY_BADGE_CONFIG: Record<ReplyClassification, { label: string; color: string; bg: string }> = {
  positive: { label: "Positive", color: "text-green-500", bg: "bg-green-500/10" },
  negative: { label: "Negative", color: "text-red-400", bg: "bg-red-400/10" },
  ooo: { label: "OOO", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  bounce: { label: "Bounce", color: "text-red-500", bg: "bg-red-500/10" },
  no_reply: { label: "No Reply", color: "text-muted-foreground", bg: "bg-muted" },
  ambiguous: { label: "Ambiguous", color: "text-purple-400", bg: "bg-purple-400/10" },
};

export function LeadSourcer() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { execute, isConnected } = useIntegrationCall();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statusFilter, setStatusFilter] = useState<"All" | LeadStatus>("All");
  const [sortBy, setSortBy] = useState<"score" | "name" | "company">("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [scoringAll, setScoringAll] = useState(false);
  const [sourcingLeads, setSourcingLeads] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isApolloConnected = isConnected("apollo");
  const isHunterConnected = isConnected("hunter");

  // Query completed lead-sourcing tasks from Convex
  const tasks = useQuery(api.tasks.list, {});
  const leadTasks = (tasks ?? []).filter(
    (t: { tags?: string[]; status: string }) =>
      t.tags?.includes("niche:gtm") &&
      t.tags?.includes("lead-sourcing") &&
      t.status === "done"
  );

  // Parse leads from task deliverables on mount
  useEffect(() => {
    if (leadTasks.length > 0) {
      const parsedLeads: Lead[] = [];
      for (const task of leadTasks) {
        const deliverable = (task as any).deliverable;
        if (deliverable && typeof deliverable === "string") {
          try {
            const parsed = JSON.parse(deliverable);
            if (Array.isArray(parsed)) {
              for (const item of parsed) {
                parsedLeads.push({
                  id: item.id ?? String(Math.random()),
                  name: item.name ?? "Unknown",
                  company: item.company ?? item.organization ?? "",
                  role: item.role ?? item.title ?? "",
                  email: item.email ?? "",
                  score: item.score ?? 50,
                  status: "New",
                  intentSignals: item.intentSignals ?? item.signals ?? [],
                  linkedIn: item.linkedIn ?? item.linkedin_url ?? "",
                  github: item.github ?? item.github_url,
                  enrichment: {
                    companySize: item.companySize ?? item.employees ?? "",
                    funding: item.funding ?? "",
                    techStack: item.techStack ?? [],
                    recentNews: item.recentNews ?? "",
                  },
                });
              }
            }
          } catch {
            // Not parseable JSON, skip
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

  // Apollo search handler
  const handleApolloSearch = useCallback(async () => {
    if (!isApolloConnected || !searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const result = await execute("apollo", "people_search", {
        q: searchQuery,
        page: 1,
        per_page: 25,
      });

      if (result.success && result.result?.people) {
        const apolloLeads: Lead[] = result.result.people.map((p: any) => ({
          id: p.id ?? String(Math.random()),
          name: p.name ?? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim(),
          company: p.organization?.name ?? p.organization_name ?? "",
          role: p.title ?? "",
          email: p.email ?? "",
          score: p.score ?? 50,
          status: "New" as LeadStatus,
          intentSignals: p.intent_signals ?? [],
          linkedIn: p.linkedin_url ?? "",
          github: p.github_url,
          enrichment: {
            companySize: p.organization?.estimated_num_employees
              ? String(p.organization.estimated_num_employees)
              : "",
            funding: p.organization?.funding_total
              ? `$${(p.organization.funding_total / 1_000_000).toFixed(1)}M`
              : "",
            techStack: p.organization?.technology_names ?? [],
            recentNews: "",
          },
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
      setSearchLoading(false);
    }
  }, [execute, isApolloConnected, searchQuery]);

  const filtered = leads.filter((l) => statusFilter === "All" || l.status === statusFilter);

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortBy === "score") return (b.score - a.score) * dir;
    if (sortBy === "name") return a.name.localeCompare(b.name) * dir;
    return a.company.localeCompare(b.company) * dir;
  });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const toggleSelectLead = (id: string) => {
    const next = new Set(selectedLeads);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLeads(next);
  };

  const handleScoreAll = async () => {
    setScoringAll(true);
    await triggerAgent(
      "Scout",
      "Score all leads in pipeline",
      `Re-evaluate lead scores for all ${sorted.length} leads in the pipeline. For each lead, analyze ICP fit, intent signals, engagement history, and timing factors. Return updated scores with reasoning.`,
      ["niche:gtm", "lead-scoring", "batch"],
      { priority: "high" }
    );
    setScoringAll(false);
  };

  const handleSourceLeads = async () => {
    setSourcingLeads(true);
    await triggerAgent(
      "Scout",
      "Source 50 leads matching ICP",
      `Source 50 new leads matching the ICP criteria. Look for Series B+ SaaS companies with VP/Director/CTO-level contacts. Use Apollo/Hunter to find contacts with verified emails. Prioritize companies showing buying signals (hiring, funding, job posts).`,
      ["niche:gtm", "lead-sourcing"],
      { priority: "high", requiredIntegrations: ["apollo", "hunter"] }
    );
    setSourcingLeads(false);
  };

  const handleVerifyEmail = async (leadId: string) => {
    if (!isHunterConnected) return;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead?.email) return;

    const result = await execute("hunter", "verify_email", {
      email: lead.email,
    });

    if (result.success && result.result) {
      // Could mark the lead as verified in state
      // For now just a no-op success indicator
    }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) =>
    sortBy === col ? (
      sortDir === "desc" ? (
        <ChevronDown className="w-3 h-3 inline ml-0.5" />
      ) : (
        <ChevronUp className="w-3 h-3 inline ml-0.5" />
      )
    ) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lead Sourcer</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Source, filter, and manage your pipeline leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleScoreAll}
            disabled={scoringAll || agentLoading || leads.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
          >
            {scoringAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Target className="w-4 h-4" />
            )}
            Score All Leads
          </button>
          <button
            onClick={handleSourceLeads}
            disabled={sourcingLeads || agentLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ background: config.accentColor }}
          >
            {sourcingLeads ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Source 50 Leads
          </button>
        </div>
      </div>

      {/* Apollo Search */}
      {isApolloConnected && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApolloSearch()}
              placeholder="Search Apollo for leads (e.g. VP Engineering at SaaS companies)..."
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={handleApolloSearch}
            disabled={searchLoading || !searchQuery.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
          >
            {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search Apollo
          </button>
        </div>
      )}

      {/* Filters & Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {(["All", "New", "Contacted", "Replied", "Meeting"] as const).map((s) => (
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
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {selectedLeads.size > 0 && (
            <>
              <span className="text-xs text-muted-foreground">{selectedLeads.size} selected</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors">
                <PenLine className="w-3 h-3" />
                Add to Sequence
              </button>
            </>
          )}
          <button
            disabled={leads.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
          >
            <Download className="w-3 h-3" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Lead Table or Empty State */}
      {leads.length > 0 ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={selectedLeads.size === sorted.length && sorted.length > 0}
                    onChange={() => {
                      if (selectedLeads.size === sorted.length) {
                        setSelectedLeads(new Set());
                      } else {
                        setSelectedLeads(new Set(sorted.map((l) => l.id)));
                      }
                    }}
                  />
                </th>
                <th
                  className="text-left text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("name")}
                >
                  Name <SortIcon col="name" />
                </th>
                <th
                  className="text-left text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("company")}
                >
                  Company <SortIcon col="company" />
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Role</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Email</th>
                <th
                  className="text-right text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("score")}
                >
                  Score <SortIcon col="score" />
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Intent Signals</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((lead) => (
                <Fragment key={lead.id}>
                  <tr
                    className="border-b border-border/30 hover:bg-accent/20 transition-colors cursor-pointer"
                    onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => toggleSelectLead(lead.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{lead.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{lead.company}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{lead.role}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono text-xs">{lead.email}</td>
                    <td
                      className="px-4 py-3 text-sm text-right font-medium"
                      style={{
                        color:
                          lead.score >= 85 ? "hsl(142,71%,45%)"
                          : lead.score >= 70 ? "hsl(38,92%,50%)"
                          : "hsl(0,84%,60%)",
                      }}
                    >
                      {lead.score}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {lead.intentSignals.map((signal) => (
                          <span key={signal} className="px-2 py-0.5 rounded text-[10px] bg-accent/50 text-muted-foreground">
                            {signal}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {lead.replyClassification && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${REPLY_BADGE_CONFIG[lead.replyClassification].bg} ${REPLY_BADGE_CONFIG[lead.replyClassification].color}`}>
                            {REPLY_BADGE_CONFIG[lead.replyClassification].label}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
                          {lead.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {expandedLead === lead.id && (
                    <tr className="border-b border-border/30">
                      <td colSpan={8} className="px-4 py-4 bg-accent/10">
                        <div className="space-y-4">
                          {/* Enrichment Info */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Company Size</p>
                              <p className="text-sm text-foreground">{lead.enrichment.companySize || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Funding</p>
                              <p className="text-sm text-foreground">{lead.enrichment.funding || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Tech Stack</p>
                              <div className="flex flex-wrap gap-1">
                                {lead.enrichment.techStack.length > 0 ? lead.enrichment.techStack.map((t) => (
                                  <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-accent/50 text-muted-foreground">
                                    {t}
                                  </span>
                                )) : (
                                  <span className="text-xs text-muted-foreground">N/A</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Recent News</p>
                              <p className="text-xs text-foreground">{lead.enrichment.recentNews || "N/A"}</p>
                            </div>
                            <div className="col-span-2 lg:col-span-4 flex items-center gap-3 pt-2 border-t border-border/30">
                              {lead.linkedIn && (
                                <a
                                  href={lead.linkedIn.startsWith("http") ? lead.linkedIn : `https://${lead.linkedIn}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs font-medium hover:underline"
                                  style={{ color: config.accentColor }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="w-3 h-3" /> LinkedIn
                                </a>
                              )}
                              {lead.github && (
                                <a
                                  href={lead.github.startsWith("http") ? lead.github : `https://${lead.github}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs font-medium hover:underline"
                                  style={{ color: config.accentColor }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="w-3 h-3" /> GitHub
                                </a>
                              )}
                              {isHunterConnected && lead.email && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerifyEmail(lead.id);
                                  }}
                                  className="flex items-center gap-1 text-xs font-medium hover:underline"
                                  style={{ color: config.accentColor }}
                                >
                                  <Wand2 className="w-3 h-3" /> Verify Email
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Lead Score Breakdown */}
                          <LeadScoreBreakdown
                            leadName={lead.name}
                            overallScore={lead.score}
                          />

                          {/* Contact Timeline */}
                          <ContactTimeline contactName={lead.name} />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-16 text-center">
          <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Source your first batch of leads with AI</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Click "Source 50 Leads" to have Scout agent find qualified leads matching your ICP, or connect Apollo to search directly.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleSourceLeads}
              disabled={sourcingLeads || agentLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ background: config.accentColor }}
            >
              {sourcingLeads ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Source 50 Leads
            </button>
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
      )}
    </div>
  );
}
