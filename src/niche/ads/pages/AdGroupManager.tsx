import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FolderOpen,
  Plus,
  Loader2,
  Plug,
  RefreshCw,
  ChevronRight,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

interface AdGroup {
  id: string;
  name: string;
  campaignName: string;
  campaignId: string;
  status: string;
  impressions: number;
  clicks: number;
  costMicros: number;
  conversions: number;
  cpcBidMicros: number;
}

export function AdGroupManager() {
  const { config } = useNiche();
  const { execute, isConnected, connectionsLoaded } = useIntegrationCall();

  const connected = isConnected("google-ads");

  const [adGroups, setAdGroups] = useState<AdGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createCampaign, setCreateCampaign] = useState("");
  const [createBid, setCreateBid] = useState("");
  const [creating, setCreating] = useState(false);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBid, setEditBid] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchAdGroups = useCallback(async () => {
    if (!connected) return;
    setLoading(true);
    try {
      const result = await execute("google-ads", "search_ad_groups", {
        query:
          "SELECT ad_group.id, ad_group.name, ad_group.status, ad_group.cpc_bid_micros, campaign.id, campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM ad_group WHERE ad_group.status != 'REMOVED' AND segments.date DURING LAST_30_DAYS ORDER BY metrics.impressions DESC LIMIT 50",
      });
      if (result.success && Array.isArray(result.result)) {
        setAdGroups(
          result.result.map((r: any) => {
            const ag = r.adGroup ?? r.ad_group ?? {};
            const camp = r.campaign ?? {};
            const m = r.metrics ?? {};
            return {
              id: ag.id ?? "",
              name: ag.name ?? "",
              campaignName: camp.name ?? "",
              campaignId: camp.id ?? "",
              status: ag.status ?? "UNKNOWN",
              impressions: m.impressions ?? 0,
              clicks: m.clicks ?? 0,
              costMicros: m.costMicros ?? m.cost_micros ?? 0,
              conversions: m.conversions ?? 0,
              cpcBidMicros: ag.cpcBidMicros ?? ag.cpc_bid_micros ?? 0,
            };
          })
        );
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [connected, execute]);

  useEffect(() => {
    if (connectionsLoaded && connected) {
      fetchAdGroups();
    }
  }, [connectionsLoaded, connected, fetchAdGroups]);

  const handleCreate = async () => {
    if (!createName.trim() || !createCampaign.trim()) return;
    setCreating(true);
    try {
      await execute("google-ads", "create_ad_group", {
        operations: [
          {
            create: {
              name: createName.trim(),
              campaign: createCampaign.trim(),
              status: "PAUSED",
              cpcBidMicros: createBid ? String(Math.round(parseFloat(createBid) * 1_000_000)) : "1000000",
            },
          },
        ],
      });
      setCreateName("");
      setCreateCampaign("");
      setCreateBid("");
      setShowCreate(false);
      fetchAdGroups();
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateBid = async (ag: AdGroup) => {
    if (!editBid) return;
    setSavingEdit(true);
    try {
      await execute("google-ads", "update_bid", {
        operations: [
          {
            updateMask: "cpc_bid_micros",
            update: {
              resourceName: `customers/CUSTOMER_ID/adGroups/${ag.id}`,
              cpcBidMicros: String(Math.round(parseFloat(editBid) * 1_000_000)),
            },
          },
        ],
      });
      setEditingId(null);
      fetchAdGroups();
    } catch {
      // silent
    } finally {
      setSavingEdit(false);
    }
  };

  // Empty state
  if (connectionsLoaded && !connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ad Groups</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage ad groups across your campaigns</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Plug className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Connect Google Ads to manage ad groups
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Link your Google Ads account to view and manage ad groups, adjust bids, and create new groups.
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
          <h1 className="text-2xl font-bold text-foreground">Ad Groups</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage ad groups across your campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdGroups}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: config.accentColor }}
          >
            <Plus className="w-4 h-4" />
            New Ad Group
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 max-w-xl">
          <h2 className="text-sm font-semibold text-foreground">Create New Ad Group</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Ad Group Name</label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g., Brand Keywords"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Campaign Resource Name</label>
              <input
                type="text"
                value={createCampaign}
                onChange={(e) => setCreateCampaign(e.target.value)}
                placeholder="customers/123/campaigns/456"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Max CPC Bid ($)</label>
              <input
                type="number"
                value={createBid}
                onChange={(e) => setCreateBid(e.target.value)}
                placeholder="e.g., 2.50"
                step="0.01"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!createName.trim() || !createCampaign.trim() || creating}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40"
              style={{ background: config.accentColor }}
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Ad Groups List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading ad groups...</span>
        </div>
      ) : adGroups.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <FolderOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No ad groups found. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {adGroups.map((ag) => {
            const cost = ag.costMicros / 1_000_000;
            const ctr = ag.impressions > 0 ? ((ag.clicks / ag.impressions) * 100).toFixed(2) : "0.00";
            const cpa = ag.conversions > 0 ? (cost / ag.conversions).toFixed(2) : "--";
            const bid = ag.cpcBidMicros / 1_000_000;
            const isExpanded = expandedId === ag.id;
            const isEditing = editingId === ag.id;

            return (
              <div key={ag.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-accent/10 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : ag.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FolderOpen className="w-4 h-4 shrink-0" style={{ color: config.accentColor }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ag.name}</p>
                      <p className="text-[10px] text-muted-foreground">{ag.campaignName}</p>
                    </div>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                        ag.status === "ENABLED"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {ag.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-muted-foreground shrink-0">
                    <div className="text-right">
                      <p className="text-foreground font-medium">{ag.impressions.toLocaleString()}</p>
                      <p>Impressions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-medium">{ag.clicks.toLocaleString()}</p>
                      <p>Clicks</p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-medium">{ctr}%</p>
                      <p>CTR</p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-medium">{ag.conversions}</p>
                      <p>Conv.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-medium">{cpa === "--" ? "--" : `$${cpa}`}</p>
                      <p>CPA</p>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border px-5 py-4 bg-accent/5 space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">
                        Cost: <span className="text-foreground font-medium">${cost.toFixed(2)}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Bid:{" "}
                        {isEditing ? (
                          <span className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              value={editBid}
                              onChange={(e) => setEditBid(e.target.value)}
                              step="0.01"
                              className="w-20 px-1.5 py-0.5 rounded border border-border bg-background text-xs"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateBid(ag);
                              }}
                              disabled={savingEdit}
                              className="p-0.5 rounded hover:bg-accent/30"
                            >
                              {savingEdit ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3 text-green-500" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(null);
                              }}
                              className="p-0.5 rounded hover:bg-accent/30"
                            >
                              <X className="w-3 h-3 text-red-400" />
                            </button>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <span className="text-foreground font-medium">${bid.toFixed(2)}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(ag.id);
                                setEditBid(bid.toFixed(2));
                              }}
                              className="p-0.5 rounded hover:bg-accent/30"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Ad Group ID: {ag.id} | Campaign ID: {ag.campaignId}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
