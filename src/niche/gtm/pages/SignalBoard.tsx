import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Signal,
  Search,
  Loader2,
  Users,
  Flame,
  Calendar,
  Filter,
  Building2,
  DollarSign,
  Cpu,
  FileText,
  MousePointerClick,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

type SignalType = "hiring" | "funding" | "tech" | "content" | "engagement";

interface BuyingSignal {
  id: string;
  company: string;
  domain?: string;
  signalType: SignalType;
  description: string;
  timestamp: number;
  strength: number; // 1-5
  source: string;
}

const SIGNAL_CONFIG: Record<
  SignalType,
  { label: string; icon: typeof Briefcase; color: string; bg: string }
> = {
  hiring: {
    label: "Hiring",
    icon: Briefcase,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  funding: {
    label: "Funding",
    icon: DollarSign,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  tech: {
    label: "Tech",
    icon: Cpu,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  content: {
    label: "Content",
    icon: FileText,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  engagement: {
    label: "Engagement",
    icon: MousePointerClick,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
};

function parseSignalsFromDeliverable(deliverable: string): BuyingSignal[] {
  const signals: BuyingSignal[] = [];
  try {
    const parsed = JSON.parse(deliverable);
    const items = Array.isArray(parsed) ? parsed : parsed.signals ?? parsed.data ?? [];
    for (const item of items) {
      signals.push({
        id: item.id ?? String(Math.random()),
        company: item.company ?? item.organization ?? "Unknown",
        domain: item.domain ?? item.website,
        signalType: (item.signalType ?? item.signal_type ?? item.type ?? "engagement") as SignalType,
        description: item.description ?? item.summary ?? item.text ?? "",
        timestamp: item.timestamp ? new Date(item.timestamp).getTime() : Date.now(),
        strength: Math.min(5, Math.max(1, Number(item.strength ?? item.score ?? 3))),
        source: item.source ?? "Scout Research",
      });
    }
  } catch {
    // Not parseable JSON — skip
  }
  return signals;
}

export function SignalBoard() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { execute, isConnected } = useIntegrationCall();
  const [scanning, setScanning] = useState(false);
  const [enrichingDomain, setEnrichingDomain] = useState<string | null>(null);
  const [enrichedData, setEnrichedData] = useState<Record<string, any>>({});
  const [activeFilters, setActiveFilters] = useState<Set<SignalType>>(new Set());

  const apolloConnected = isConnected("apollo");

  // Query signal tasks from Convex
  const tasks = useQuery(api.tasks.list, {});
  const signalTasks = (tasks ?? []).filter(
    (t: { tags?: string[]; status: string }) =>
      t.tags?.includes("niche:gtm") &&
      t.tags?.includes("buying-signals") &&
      t.status === "done"
  );

  // Parse signals from completed task deliverables
  const signals = useMemo(() => {
    const allSignals: BuyingSignal[] = [];
    for (const task of signalTasks) {
      const deliverable = (task as any).deliverable;
      if (deliverable && typeof deliverable === "string") {
        allSignals.push(...parseSignalsFromDeliverable(deliverable));
      }
    }
    // Sort by timestamp descending (newest first)
    return allSignals.sort((a, b) => b.timestamp - a.timestamp);
  }, [signalTasks.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Group signals by company for "hot leads" count
  const companySignalCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of signals) {
      counts[s.company] = (counts[s.company] ?? 0) + 1;
    }
    return counts;
  }, [signals]);

  const hotLeads = useMemo(
    () => Object.values(companySignalCounts).filter((c) => c >= 3).length,
    [companySignalCounts]
  );

  const newToday = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return signals.filter((s) => s.timestamp >= todayStart.getTime()).length;
  }, [signals]);

  // Apply filters
  const filteredSignals = useMemo(() => {
    if (activeFilters.size === 0) return signals;
    return signals.filter((s) => activeFilters.has(s.signalType));
  }, [signals, activeFilters]);

  // Sort by number of signals per company (priority ranking)
  const sortedSignals = useMemo(() => {
    return [...filteredSignals].sort((a, b) => {
      const aCount = companySignalCounts[a.company] ?? 0;
      const bCount = companySignalCounts[b.company] ?? 0;
      if (bCount !== aCount) return bCount - aCount;
      return b.timestamp - a.timestamp;
    });
  }, [filteredSignals, companySignalCounts]);

  const toggleFilter = (type: SignalType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const handleScanSignals = async () => {
    setScanning(true);
    await triggerAgent(
      "Scout",
      "Scan for buying signals",
      `Find buying signals for companies matching our ICP. Look for:\n1. Hiring signals — companies posting engineering/sales roles (indicates scaling)\n2. Funding signals — recent funding rounds (has budget)\n3. Tech signals — adopted competitor or complementary technology\n4. Content signals — published about pain points we solve\n5. Engagement signals — visited our site, opened emails, clicked links\n\nReturn results as JSON array with fields: company, domain, signalType, description, strength (1-5), source, timestamp`,
      ["niche:gtm", "buying-signals"],
      { priority: "high" }
    );
    setScanning(false);
  };

  const handleResearchCompany = async (signal: BuyingSignal) => {
    await triggerAgent(
      "Scout",
      `Research company: ${signal.company}`,
      `Deep research on ${signal.company}${signal.domain ? ` (${signal.domain})` : ""}. Find:\n- Company size, funding, revenue estimates\n- Key decision makers (VP/Director/C-level)\n- Technology stack\n- Recent news and press releases\n- Pain points and challenges\n- Competitive landscape\n\nReturn structured JSON with all findings.`,
      ["niche:gtm", "company-research", `company:${signal.company}`],
      { priority: "high" }
    );
  };

  const handleEnrichCompany = useCallback(
    async (domain: string) => {
      if (!apolloConnected || !domain) return;
      setEnrichingDomain(domain);
      try {
        const result = await execute("apollo", "organization_enrich", { domain });
        if (result.success && result.result) {
          setEnrichedData((prev) => ({ ...prev, [domain]: result.result }));
        }
      } catch {
        // Silently fail
      } finally {
        setEnrichingDomain(null);
      }
    },
    [execute, apolloConnected]
  );

  const isLoading = tasks === undefined;

  // Summary stats
  const summaryStats = [
    { label: "Total Signals", value: String(signals.length), icon: Signal },
    { label: "Hot Leads", value: String(hotLeads), icon: Flame, color: "text-red-400" },
    { label: "New Today", value: String(newToday), icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Signal Board</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time buying signals for leads and companies
          </p>
        </div>
        <button
          onClick={handleScanSignals}
          disabled={scanning || agentLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
          style={{ background: config.accentColor }}
        >
          {scanning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Scan for Signals
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ background: `${config.accentColor}15` }}
                >
                  <Icon
                    className={`w-5 h-5 ${stat.color ?? ""}`}
                    style={stat.color ? undefined : { color: config.accentColor }}
                  />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {(Object.entries(SIGNAL_CONFIG) as [SignalType, (typeof SIGNAL_CONFIG)[SignalType]][]).map(
          ([type, cfg]) => {
            const isActive = activeFilters.has(type);
            const Icon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "text-white"
                    : "bg-accent/30 text-muted-foreground hover:text-foreground"
                }`}
                style={isActive ? { background: config.accentColor } : undefined}
              >
                <Icon className="w-3 h-3" />
                {cfg.label}
              </button>
            );
          }
        )}
        {activeFilters.size > 0 && (
          <button
            onClick={() => setActiveFilters(new Set())}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Signal Feed */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-sm text-muted-foreground">Loading signals...</span>
        </div>
      ) : sortedSignals.length > 0 ? (
        <div className="space-y-3">
          {sortedSignals.map((signal) => {
            const cfg = SIGNAL_CONFIG[signal.signalType] ?? SIGNAL_CONFIG.engagement;
            const Icon = cfg.icon;
            const signalCount = companySignalCounts[signal.company] ?? 0;
            const enrichment = signal.domain ? enrichedData[signal.domain] : null;

            return (
              <div
                key={signal.id}
                className="rounded-xl border border-border bg-card p-4 hover:border-border/80 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Signal type icon */}
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${cfg.bg}`}
                  >
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">
                        {signal.company}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {signalCount >= 3 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-400/10 text-red-400">
                          Hot Lead
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/80">{signal.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {/* Strength dots */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              i < signal.strength ? "" : "opacity-20"
                            }`}
                            style={{
                              background:
                                i < signal.strength ? config.accentColor : "hsl(0,0%,50%)",
                            }}
                          />
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-1">
                          {signal.strength}/5
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {signal.source}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(signal.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Enrichment data if available */}
                    {enrichment && (
                      <div className="mt-3 p-3 rounded-lg bg-accent/20 text-xs text-muted-foreground">
                        <div className="flex flex-wrap gap-3">
                          {enrichment.estimated_num_employees && (
                            <span>Employees: {enrichment.estimated_num_employees}</span>
                          )}
                          {enrichment.annual_revenue_printed && (
                            <span>Revenue: {enrichment.annual_revenue_printed}</span>
                          )}
                          {enrichment.industry && <span>Industry: {enrichment.industry}</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleResearchCompany(signal)}
                      disabled={agentLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                    >
                      <Search className="w-3 h-3" />
                      Research
                    </button>
                    {apolloConnected && signal.domain && !enrichedData[signal.domain] && (
                      <button
                        onClick={() => handleEnrichCompany(signal.domain!)}
                        disabled={enrichingDomain === signal.domain}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                      >
                        {enrichingDomain === signal.domain ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <ExternalLink className="w-3 h-3" />
                        )}
                        Enrich
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-16 text-center">
          <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Buying Signals Yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Define your ICP first, then click "Scan for Signals" to find buying intent across
            hiring, funding, technology adoption, and engagement data.
          </p>
          <button
            onClick={handleScanSignals}
            disabled={scanning || agentLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 mx-auto"
            style={{ background: config.accentColor }}
          >
            {scanning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Scan for Signals
          </button>
        </div>
      )}
    </div>
  );
}
