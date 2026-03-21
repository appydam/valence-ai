import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Loader2,
  Plug,
  RefreshCw,
  Plus,
  Pencil,
  Check,
  X,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

interface BudgetRow {
  id: string;
  name: string;
  campaignName: string;
  dailyBudgetMicros: number;
  spentMicros: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export function BudgetCenter() {
  const { config } = useNiche();
  const { execute, isConnected, connectionsLoaded } = useIntegrationCall();

  const connected = isConnected("google-ads");

  const [budgets, setBudgets] = useState<BudgetRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [saving, setSaving] = useState(false);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createAmount, setCreateAmount] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchBudgets = useCallback(async () => {
    if (!connected) return;
    setLoading(true);
    try {
      const result = await execute("google-ads", "get_campaign_metrics", {
        query:
          "SELECT campaign.id, campaign.name, campaign_budget.id, campaign_budget.name, campaign_budget.amount_micros, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions FROM campaign WHERE campaign.status != 'REMOVED' AND segments.date DURING LAST_30_DAYS ORDER BY metrics.cost_micros DESC LIMIT 50",
      });
      if (result.success && Array.isArray(result.result)) {
        const budgetMap = new Map<string, BudgetRow>();
        for (const r of result.result) {
          const camp = r.campaign ?? {};
          const budget = r.campaignBudget ?? r.campaign_budget ?? {};
          const m = r.metrics ?? {};
          const budgetId = budget.id ?? camp.id ?? "";
          const existing = budgetMap.get(budgetId);
          if (existing) {
            existing.spentMicros += m.costMicros ?? m.cost_micros ?? 0;
            existing.impressions += m.impressions ?? 0;
            existing.clicks += m.clicks ?? 0;
            existing.conversions += m.conversions ?? 0;
          } else {
            budgetMap.set(budgetId, {
              id: budgetId,
              name: budget.name ?? `Budget ${budgetId}`,
              campaignName: camp.name ?? "",
              dailyBudgetMicros: budget.amountMicros ?? budget.amount_micros ?? 0,
              spentMicros: m.costMicros ?? m.cost_micros ?? 0,
              impressions: m.impressions ?? 0,
              clicks: m.clicks ?? 0,
              conversions: m.conversions ?? 0,
            });
          }
        }
        setBudgets(Array.from(budgetMap.values()));
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [connected, execute]);

  useEffect(() => {
    if (connectionsLoaded && connected) {
      fetchBudgets();
    }
  }, [connectionsLoaded, connected, fetchBudgets]);

  const handleUpdateBudget = async (budget: BudgetRow) => {
    if (!editAmount) return;
    setSaving(true);
    try {
      await execute("google-ads", "update_budget", {
        operations: [
          {
            updateMask: "amount_micros",
            update: {
              resourceName: `customers/CUSTOMER_ID/campaignBudgets/${budget.id}`,
              amountMicros: String(Math.round(parseFloat(editAmount) * 1_000_000)),
            },
          },
        ],
      });
      setEditingId(null);
      fetchBudgets();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBudget = async () => {
    if (!createName.trim() || !createAmount) return;
    setCreating(true);
    try {
      await execute("google-ads", "create_campaign_budget", {
        operations: [
          {
            create: {
              name: createName.trim(),
              amountMicros: String(Math.round(parseFloat(createAmount) * 1_000_000)),
              deliveryMethod: "STANDARD",
            },
          },
        ],
      });
      setCreateName("");
      setCreateAmount("");
      setShowCreate(false);
      fetchBudgets();
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  // Summary stats
  const totalBudget = budgets.reduce((sum, b) => sum + b.dailyBudgetMicros, 0) / 1_000_000;
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentMicros, 0) / 1_000_000;

  // Chart data
  const chartData = budgets.slice(0, 10).map((b) => ({
    name: b.campaignName || b.name,
    budget: b.dailyBudgetMicros / 1_000_000,
    spent: b.spentMicros / 1_000_000,
  }));

  // Empty state
  if (connectionsLoaded && !connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Budget Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track campaign budgets</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Plug className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Connect Google Ads to manage budgets
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Link your Google Ads account to view budget utilization, update budgets, and track pacing.
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
          <h1 className="text-2xl font-bold text-foreground">Budget Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track campaign budgets</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBudgets}
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
            New Budget
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4" style={{ color: config.accentColor }} />
              <span className="text-xs text-muted-foreground">Total Daily Budget</span>
            </div>
            <p className="text-xl font-bold text-foreground">${totalBudget.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" style={{ color: config.accentColor }} />
              <span className="text-xs text-muted-foreground">Total Spent (30d)</span>
            </div>
            <p className="text-xl font-bold text-foreground">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              {totalSpent > totalBudget * 30 ? (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              ) : (
                <DollarSign className="w-4 h-4 text-green-500" />
              )}
              <span className="text-xs text-muted-foreground">Budget Pace</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {totalBudget > 0 ? `${((totalSpent / (totalBudget * 30)) * 100).toFixed(0)}%` : "--"}
            </p>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 max-w-xl">
          <h2 className="text-sm font-semibold text-foreground">Create New Budget</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Budget Name</label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g., Q2 Campaign Budget"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Daily Amount ($)</label>
              <input
                type="number"
                value={createAmount}
                onChange={(e) => setCreateAmount(e.target.value)}
                placeholder="e.g., 100"
                step="0.01"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateBudget}
              disabled={!createName.trim() || !createAmount || creating}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40"
              style={{ background: config.accentColor }}
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Budget
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

      {/* Budget Pacing Chart */}
      {chartData.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Budget vs Spend (Top 10)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(0,0%,50%)" }} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(0,0%,50%)" }} width={80} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(240,10%,10%)",
                    border: "1px solid hsl(0,0%,20%)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Bar dataKey="budget" name="Daily Budget" fill={`${config.accentColor}40`} radius={[0, 4, 4, 0]} />
                <Bar dataKey="spent" name="Spent (30d)" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.spent > entry.budget * 30 ? "hsl(0, 70%, 50%)" : config.accentColor}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Budget Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading budgets...</span>
        </div>
      ) : budgets.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <DollarSign className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No budget data found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Campaign</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Daily Budget</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Spent (30d)</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Utilization</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Conv.</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b) => {
                  const dailyBudget = b.dailyBudgetMicros / 1_000_000;
                  const spent = b.spentMicros / 1_000_000;
                  const utilization = dailyBudget > 0 ? (spent / (dailyBudget * 30)) * 100 : 0;
                  const isOver = utilization > 100;
                  const isEditing = editingId === b.id;

                  return (
                    <tr key={b.id} className="border-b border-border/50 hover:bg-accent/10 transition-colors">
                      <td className="px-4 py-2.5">
                        <p className="text-foreground font-medium">{b.campaignName || b.name}</p>
                        <p className="text-[10px] text-muted-foreground">{b.name}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {isEditing ? (
                          <span className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              step="0.01"
                              className="w-24 px-2 py-1 rounded border border-border bg-background text-xs text-right"
                            />
                            <button
                              onClick={() => handleUpdateBudget(b)}
                              disabled={saving}
                              className="p-0.5 rounded hover:bg-accent/30"
                            >
                              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 text-green-500" />}
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-0.5 rounded hover:bg-accent/30">
                              <X className="w-3 h-3 text-red-400" />
                            </button>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-foreground">
                            ${dailyBudget.toFixed(2)}/day
                            <button
                              onClick={() => {
                                setEditingId(b.id);
                                setEditAmount(dailyBudget.toFixed(2));
                              }}
                              className="p-0.5 rounded hover:bg-accent/30 text-muted-foreground"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">${spent.toFixed(2)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-accent/30 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(utilization, 100)}%`,
                                background: isOver ? "hsl(0, 70%, 50%)" : config.accentColor,
                              }}
                            />
                          </div>
                          <span className={`text-[10px] font-medium ${isOver ? "text-red-400" : "text-muted-foreground"}`}>
                            {utilization.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{b.conversions}</td>
                      <td className="px-4 py-2.5">
                        {isOver ? (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-red-400">
                            <AlertTriangle className="w-3 h-3" />
                            Overspend
                          </span>
                        ) : utilization < 50 ? (
                          <span className="text-[10px] font-medium text-yellow-500">Underspend</span>
                        ) : (
                          <span className="text-[10px] font-medium text-green-500">On Track</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
