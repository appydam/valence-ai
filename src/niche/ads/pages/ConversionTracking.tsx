import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Target,
  Loader2,
  Plug,
  RefreshCw,
  CheckCircle2,
  Clock,
  User,
  FileText,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

interface ConversionAction {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface ChangeEvent {
  dateTime: string;
  resourceType: string;
  userEmail: string;
  clientType: string;
}

export function ConversionTracking() {
  const { config } = useNiche();
  const { execute, isConnected, connectionsLoaded } = useIntegrationCall();

  const connected = isConnected("google-ads");

  const [conversionActions, setConversionActions] = useState<ConversionAction[]>([]);
  const [changeHistory, setChangeHistory] = useState<ChangeEvent[]>([]);
  const [loadingConversions, setLoadingConversions] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<"conversions" | "history">("conversions");

  const fetchConversions = useCallback(async () => {
    if (!connected) return;
    setLoadingConversions(true);
    try {
      const result = await execute("google-ads", "get_conversion_actions", {
        query:
          "SELECT conversion_action.id, conversion_action.name, conversion_action.type, conversion_action.status FROM conversion_action ORDER BY conversion_action.name",
      });
      if (result.success && Array.isArray(result.result)) {
        setConversionActions(
          result.result.map((r: any) => {
            const ca = r.conversionAction ?? r.conversion_action ?? {};
            return {
              id: ca.id ?? "",
              name: ca.name ?? "",
              type: ca.type ?? "UNKNOWN",
              status: ca.status ?? "UNKNOWN",
            };
          })
        );
      }
    } catch {
      // silent
    } finally {
      setLoadingConversions(false);
    }
  }, [connected, execute]);

  const fetchHistory = useCallback(async () => {
    if (!connected) return;
    setLoadingHistory(true);
    try {
      const result = await execute("google-ads", "get_change_history", {
        query:
          "SELECT change_event.change_date_time, change_event.change_resource_type, change_event.user_email, change_event.client_type FROM change_event WHERE change_event.change_date_time DURING LAST_14_DAYS ORDER BY change_event.change_date_time DESC LIMIT 50",
      });
      if (result.success && Array.isArray(result.result)) {
        setChangeHistory(
          result.result.map((r: any) => {
            const ce = r.changeEvent ?? r.change_event ?? {};
            return {
              dateTime: ce.changeDateTime ?? ce.change_date_time ?? "",
              resourceType: ce.changeResourceType ?? ce.change_resource_type ?? "",
              userEmail: ce.userEmail ?? ce.user_email ?? "",
              clientType: ce.clientType ?? ce.client_type ?? "",
            };
          })
        );
      }
    } catch {
      // silent
    } finally {
      setLoadingHistory(false);
    }
  }, [connected, execute]);

  useEffect(() => {
    if (connectionsLoaded && connected) {
      fetchConversions();
      fetchHistory();
    }
  }, [connectionsLoaded, connected, fetchConversions, fetchHistory]);

  const statusColor = (status: string) => {
    switch (status) {
      case "ENABLED":
        return "bg-green-500/10 text-green-500";
      case "HIDDEN":
        return "bg-yellow-500/10 text-yellow-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const typeLabel = (type: string) => {
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDateTime = (raw: string) => {
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return raw;
    }
  };

  // Summary stats
  const enabledCount = conversionActions.filter((c) => c.status === "ENABLED").length;
  const totalCount = conversionActions.length;

  // Empty state
  if (connectionsLoaded && !connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conversion Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage conversion actions and view change history
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Plug className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Connect Google Ads to track conversions
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Link your Google Ads account to see conversion actions, tracking status, and account change history.
          </p>
          <Link
            to="/integrations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: config.accentColor }}
          >
            <Plug className="w-4 h-4" />
            Connect Google Ads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conversion Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage conversion actions and view change history
          </p>
        </div>
        <button
          onClick={() => {
            fetchConversions();
            fetchHistory();
          }}
          disabled={loadingConversions || loadingHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loadingConversions || loadingHistory ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {conversionActions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4" style={{ color: config.accentColor }} />
              <span className="text-xs text-muted-foreground">Total Actions</span>
            </div>
            <p className="text-xl font-bold text-foreground">{totalCount}</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <p className="text-xl font-bold text-foreground">{enabledCount}</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" style={{ color: config.accentColor }} />
              <span className="text-xs text-muted-foreground">Recent Changes</span>
            </div>
            <p className="text-xl font-bold text-foreground">{changeHistory.length}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {(
          [
            { id: "conversions", label: "Conversion Actions", icon: Target },
            { id: "history", label: "Change History", icon: Clock },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-current"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              style={activeTab === tab.id ? { color: config.accentColor } : undefined}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conversion Actions Tab */}
      {activeTab === "conversions" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loadingConversions ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading conversion actions...</span>
            </div>
          ) : conversionActions.length === 0 ? (
            <div className="p-8 text-center">
              <Target className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No conversion actions found in this account.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {conversionActions.map((ca) => (
                    <tr key={ca.id} className="border-b border-border/50 hover:bg-accent/10 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Target className="w-3.5 h-3.5 shrink-0" style={{ color: config.accentColor }} />
                          <span className="text-foreground font-medium">{ca.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/50 text-muted-foreground">
                          {typeLabel(ca.type)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColor(ca.status)}`}>
                          {ca.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{ca.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Change History Tab */}
      {activeTab === "history" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loadingHistory ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading change history...</span>
            </div>
          ) : changeHistory.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No changes recorded in the last 14 days.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {changeHistory.map((ev, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-accent/10 transition-colors">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                    style={{ background: `${config.accentColor}15` }}
                  >
                    <FileText className="w-4 h-4" style={{ color: config.accentColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">
                      {typeLabel(ev.resourceType)} modified
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {ev.userEmail && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <User className="w-3 h-3" />
                          {ev.userEmail}
                        </span>
                      )}
                      {ev.clientType && (
                        <span className="text-[10px] text-muted-foreground">
                          via {typeLabel(ev.clientType)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatDateTime(ev.dateTime)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
