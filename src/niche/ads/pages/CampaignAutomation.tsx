import { useState, useCallback } from "react";
import {
  Zap,
  Plus,
  Play,
  Pause,
  TrendingUp,
  DollarSign,
  Target,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";

type RuleType = "auto-pause" | "auto-scale" | "budget-pacing";
type MetricType = "cpa" | "roas" | "ctr" | "spend" | "impressions" | "conversions";
type ComparisonOp = ">" | "<" | "=" | ">=" | "<=";

interface AutomationRule {
  id: string;
  name: string;
  type: RuleType;
  metric: MetricType;
  comparison: ComparisonOp;
  threshold: number;
  action: string;
  enabled: boolean;
  lastTriggered?: string;
  affectedCampaigns: number;
}

const RULE_TYPE_CONFIG: Record<
  RuleType,
  { label: string; description: string; icon: typeof Zap; defaultMetric: MetricType; defaultAction: string }
> = {
  "auto-pause": {
    label: "Auto-Pause",
    description: "Pause campaigns when CPA exceeds threshold",
    icon: Pause,
    defaultMetric: "cpa",
    defaultAction: "Pause campaign",
  },
  "auto-scale": {
    label: "Auto-Scale",
    description: "Increase budget when ROAS exceeds threshold",
    icon: TrendingUp,
    defaultMetric: "roas",
    defaultAction: "Increase budget by 20%",
  },
  "budget-pacing": {
    label: "Budget Pacing",
    description: "Alert when daily spend deviates from target",
    icon: DollarSign,
    defaultMetric: "spend",
    defaultAction: "Send alert",
  },
};

const METRICS: { id: MetricType; label: string }[] = [
  { id: "cpa", label: "CPA ($)" },
  { id: "roas", label: "ROAS (x)" },
  { id: "ctr", label: "CTR (%)" },
  { id: "spend", label: "Daily Spend ($)" },
  { id: "impressions", label: "Impressions" },
  { id: "conversions", label: "Conversions" },
];

const STORAGE_KEY = "niche_ads_automation_rules";

function loadRules(): AutomationRule[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AutomationRule[];
    }
  } catch {
    // Corrupted data — start fresh
  }
  return [];
}

function saveRules(rules: AutomationRule[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  } catch {
    // Storage full or unavailable — ignore
  }
}

export function CampaignAutomation() {
  const { config } = useNiche();
  const [rules, setRulesState] = useState<AutomationRule[]>(() => loadRules());
  const [showCreate, setShowCreate] = useState(false);

  const setRules = useCallback((updater: AutomationRule[] | ((prev: AutomationRule[]) => AutomationRule[])) => {
    setRulesState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveRules(next);
      return next;
    });
  }, []);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<RuleType>("auto-pause");
  const [newMetric, setNewMetric] = useState<MetricType>("cpa");
  const [newComparison, setNewComparison] = useState<ComparisonOp>(">");
  const [newThreshold, setNewThreshold] = useState("");

  const handleCreate = () => {
    if (!newName.trim() || !newThreshold) return;
    const typeConfig = RULE_TYPE_CONFIG[newType];
    const rule: AutomationRule = {
      id: Date.now().toString(),
      name: newName,
      type: newType,
      metric: newMetric,
      comparison: newComparison,
      threshold: parseFloat(newThreshold),
      action: typeConfig.defaultAction,
      enabled: true,
      affectedCampaigns: Math.floor(Math.random() * 3),
    };
    setRules([rule, ...rules]);
    setNewName("");
    setNewThreshold("");
    setShowCreate(false);
  };

  const toggleRule = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaign Automation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set up rules to automatically optimize your campaigns
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: config.accentColor }}
        >
          <Plus className="w-4 h-4" />
          Create Rule
        </button>
      </div>

      {/* Create Rule Form */}
      {showCreate && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">New Automation Rule</h2>

          {/* Rule Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Rule Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Pause campaigns with CPA > $50"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Rule Type */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">
              Rule Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(RULE_TYPE_CONFIG) as [RuleType, typeof RULE_TYPE_CONFIG[RuleType]][]).map(
                ([type, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setNewType(type);
                        setNewMetric(cfg.defaultMetric);
                      }}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        newType === type
                          ? "border-2 shadow-sm"
                          : "border-border hover:border-border/80"
                      }`}
                      style={
                        newType === type
                          ? {
                              borderColor: config.accentColor,
                              background: `${config.accentColor}08`,
                            }
                          : undefined
                      }
                    >
                      <Icon
                        className="w-4 h-4 mb-1.5"
                        style={newType === type ? { color: config.accentColor } : undefined}
                      />
                      <p className="text-xs font-medium text-foreground">{cfg.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{cfg.description}</p>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Condition */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Metric
              </label>
              <select
                value={newMetric}
                onChange={(e) => setNewMetric(e.target.value as MetricType)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {METRICS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Operator
              </label>
              <select
                value={newComparison}
                onChange={(e) => setNewComparison(e.target.value as ComparisonOp)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value=">">&gt; Greater than</option>
                <option value="<">&lt; Less than</option>
                <option value="=">= Equal to</option>
                <option value=">=">&gt;= Greater or equal</option>
                <option value="<=">&lt;= Less or equal</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Threshold
              </label>
              <input
                type="number"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                placeholder="e.g., 50"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || !newThreshold}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ background: config.accentColor }}
            >
              <Zap className="w-4 h-4" />
              Create Rule
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

      {/* Active Rules */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Active Rules ({rules.filter((r) => r.enabled).length}/{rules.length})
        </h2>
        {rules.map((rule) => {
          const typeConfig = RULE_TYPE_CONFIG[rule.type];
          const Icon = typeConfig.icon;
          const metricLabel = METRICS.find((m) => m.id === rule.metric)?.label ?? rule.metric;

          return (
            <div
              key={rule.id}
              className={`rounded-xl border bg-card p-4 transition-all ${
                rule.enabled ? "border-border" : "border-border/50 opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                  style={{ background: `${config.accentColor}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: config.accentColor }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground truncate">{rule.name}</h3>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        rule.enabled
                          ? "bg-green-500/10 text-green-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {rule.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    When {metricLabel} {rule.comparison} {rule.threshold} → {rule.action}
                  </p>
                  <div className="flex items-center gap-4 mt-1.5">
                    {rule.lastTriggered && (
                      <span className="text-[10px] text-muted-foreground/60">
                        Last triggered: {rule.lastTriggered}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                      {rule.affectedCampaigns > 0 ? (
                        <AlertCircle className="w-3 h-3 text-yellow-500" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      )}
                      {rule.affectedCampaigns} campaign{rule.affectedCampaigns !== 1 ? "s" : ""}{" "}
                      affected
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      rule.enabled ? "" : "bg-muted"
                    }`}
                    style={rule.enabled ? { background: config.accentColor } : undefined}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        rule.enabled ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rule evaluation preview */}
      <div className="rounded-xl border border-dashed border-border/50 bg-card/50 p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" style={{ color: config.accentColor }} />
          Rule Evaluation Preview
        </h3>
        <div className="space-y-2">
          {[
            {
              campaign: "Brand Awareness — Q1 2026",
              rule: "Scale Winners",
              result: "ROAS 3.4x > 3.5x threshold — No action",
              triggered: false,
            },
            {
              campaign: "TikTok — Gen Z Outreach",
              rule: "Pause High CPA",
              result: "CPA $22.39 > $50 threshold — No action",
              triggered: false,
            },
            {
              campaign: "Retargeting — Cart Abandoners",
              rule: "Scale Winners",
              result: "ROAS 4.2x > 3.5x threshold — Would increase budget by 20%",
              triggered: true,
            },
          ].map((ev, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                ev.triggered ? "bg-green-500/5" : "bg-accent/10"
              }`}
            >
              <Play
                className={`w-3 h-3 shrink-0 ${
                  ev.triggered ? "text-green-500" : "text-muted-foreground/40"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground">
                  <span className="font-medium">{ev.campaign}</span>
                  <span className="text-muted-foreground"> ({ev.rule})</span>
                </p>
                <p className="text-[10px] text-muted-foreground">{ev.result}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
