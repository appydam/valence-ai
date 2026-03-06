import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  CreditCard, Check, Zap, Crown, Building2, ArrowUpRight,
  AlertCircle, RefreshCw, BarChart3, Users, Plug, Bot, FileText,
  MessageSquare, Shield, Server, Cpu, Sparkles,
} from "lucide-react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

type Plan = "business" | "enterprise" | "enterprise_plus";

const planMeta: Record<Plan, { name: string; icon: any; color: string; price: string; period: string; tagline: string; highlight?: boolean }> = {
  business: {
    name: "Business",
    icon: Building2,
    color: "text-blue-500",
    price: "From $2,499",
    period: "/mo",
    tagline: "3 server tiers — 10 missions/day per user, Claude Sonnet 4.6",
  },
  enterprise: {
    name: "Enterprise",
    icon: Crown,
    color: "text-purple-500",
    price: "$4,999",
    period: "/mo",
    tagline: "Sonnet + Opus hybrid, dedicated server, 25 users",
    highlight: true,
  },
  enterprise_plus: {
    name: "Enterprise+",
    icon: Shield,
    color: "text-amber-500",
    price: "Custom",
    period: "",
    tagline: "On-prem deployment, unlimited scale, custom SLA",
  },
};

const featureLabels: Record<string, string> = {
  board: "Mission Board",
  tasks: "Task Management",
  integrations: "All Integrations (30+)",
  webhooks: "Event-Driven Webhooks",
  memory: "Agent Memory Bank",
  autopilot: "Autopilot Mission Planner",
  analytics: "Analytics Dashboard",
  audit_log: "Audit Log",
  voice: "Voice Commands",
  custom_agents: "Custom Agent Personas",
  sla: "Enterprise SLA & Support",
  dedicated_server: "Dedicated Server",
  onprem: "On-Prem / VPC Deployment",
  sonnet: "Claude Sonnet 4.6",
  opus: "Claude Opus 4.6 (Strategic Missions)",
  war_room: "War Room (Real-time Observability)",
  daily_digest: "Daily CEO Digest",
  unlimited_missions: "Unlimited Missions",
  custom_integrations: "Custom Integration Building",
};

function UsageMeter({ label, current, max, icon: Icon }: { label: string; current: number; max: number; icon: any }) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isHigh = pct > 80;
  const isMax = pct >= 100;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className={`text-sm font-mono ${isMax ? "text-red-500" : isHigh ? "text-orange-500" : "text-muted-foreground"}`}>
          {current.toLocaleString()} / {max >= 999999 ? "Unlimited" : max.toLocaleString()}
        </span>
      </div>
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isMax ? "bg-red-500" : isHigh ? "bg-orange-500" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const BillingPage = () => {
  const currentUser = useQuery(api.users.getCurrentUser);
  const subscription = useQuery(api.billing.getSubscription);
  const planLimits = useQuery(api.billing.getAllPlanLimits) ?? [];
  const currentLimits = useQuery(api.billing.getPlanLimits, {});
  const usage = useQuery(api.billing.getCurrentUsage);
  const createCheckout = useAction(api.billingActions.createCheckoutSession);
  const createPortal = useAction(api.billingActions.createPortalSession);

  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [managingBilling, setManagingBilling] = useState(false);

  const isAdmin = currentUser?.role === "admin";
  const currentPlan = (subscription?.plan ?? "business") as Plan;
  const subStatus = subscription?.status ?? "trialing";

  const handleUpgrade = async (plan: Plan) => {
    if (!isAdmin) return;
    if (plan === "enterprise_plus") {
      window.open("mailto:arpit@valenceai.co?subject=Enterprise%2B%20Inquiry", "_blank");
      return;
    }
    setUpgrading(plan);
    try {
      const result = await createCheckout({
        plan,
        successUrl: `${window.location.origin}/billing?success=true`,
        cancelUrl: `${window.location.origin}/billing`,
      });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
    setUpgrading(null);
  };

  const handleManageBilling = async () => {
    if (!isAdmin) return;
    setManagingBilling(true);
    try {
      const result = await createPortal({
        returnUrl: `${window.location.origin}/billing`,
      });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
    setManagingBilling(false);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-500/10 text-green-500",
      trialing: "bg-blue-500/10 text-blue-500",
      past_due: "bg-red-500/10 text-red-500",
      cancelled: "bg-gray-500/10 text-gray-400",
      paused: "bg-orange-500/10 text-orange-500",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[status] ?? styles.paused}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const meta = planMeta[currentPlan];
  const PlanIcon = meta.icon;

  const planOrder: Plan[] = ["business", "enterprise", "enterprise_plus"];
  const sortedPlans = planOrder
    .map((p) => planLimits.find((l) => l.plan === p))
    .filter(Boolean) as typeof planLimits;

  // Plan-specific specs for the cards
  const planSpecs: Record<Plan, { users: string; missions: string; model: string; infra: string }> = {
    business: { users: "Up to 20+ users", missions: "10 missions/day per user", model: "Claude Sonnet 4.6", infra: "Cloud server (3 tiers: 8-32 GB)" },
    enterprise: { users: "25 users", missions: "10 missions/day per user", model: "Sonnet + Opus 4.6 hybrid", infra: "Dedicated server (16 GB · 4 vCPUs)" },
    enterprise_plus: { users: "Unlimited users", missions: "Unlimited missions", model: "Full Opus 4.6", infra: "On-prem / your VPC" },
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your subscription, usage, and plan
          </p>
        </div>

        {/* Current plan card */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-current/10 ${meta.color}`}>
                <PlanIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">{meta.name} Plan</h2>
                  {statusBadge(subStatus)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {meta.price}{meta.period}
                  {subscription?.currentPeriodEnd && (
                    <> &middot; Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
                  )}
                </p>
              </div>
            </div>
            {isAdmin && subscription && (
              <button
                onClick={handleManageBilling}
                disabled={managingBilling}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover transition-colors disabled:opacity-50"
              >
                {managingBilling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Manage Billing
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {subscription?.cancelAtPeriodEnd && (
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3 mt-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <p className="text-xs text-orange-500">
                  Your subscription will be cancelled at the end of the current period ({new Date(subscription.currentPeriodEnd).toLocaleDateString()}).
                </p>
              </div>
            </div>
          )}

          {subscription?.trialEnd && subscription.status === "trialing" && (
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 mt-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <p className="text-xs text-blue-500">
                  Free trial ends {new Date(subscription.trialEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Usage meters */}
        {currentLimits && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              Current Usage
              {usage && (
                <span className="text-xs text-muted-foreground font-normal">
                  ({new Date(usage.periodStart).toLocaleDateString()} - {new Date(usage.periodEnd).toLocaleDateString()})
                </span>
              )}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <UsageMeter
                label="Tasks Created"
                current={usage?.tasksCreated ?? 0}
                max={currentLimits.maxTasksPerMonth}
                icon={FileText}
              />
              <UsageMeter
                label="API Calls"
                current={usage?.apiCallsMade ?? 0}
                max={currentLimits.maxApiCallsPerMonth}
                icon={Zap}
              />
              <UsageMeter
                label="Integration Executions"
                current={usage?.integrationExecutions ?? 0}
                max={currentLimits.maxIntegrations * 100}
                icon={Plug}
              />
              <UsageMeter
                label="Agent Sessions"
                current={usage?.agentSessions ?? 0}
                max={currentLimits.maxAgents * 200}
                icon={Bot}
              />
            </div>
          </div>
        )}

        {/* Plan comparison */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">Choose Your Plan</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Enterprise-grade AI operations. All plans include 5 specialized agents, 30+ integrations, and full platform access.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {planOrder.map((p) => {
              const pm = planMeta[p];
              const PI = pm.icon;
              const isCurrent = p === currentPlan;
              const planIndex = planOrder.indexOf(p);
              const currentIndex = planOrder.indexOf(currentPlan);
              const isDowngrade = planIndex < currentIndex;
              const specs = planSpecs[p];
              const planData = sortedPlans.find((l) => l.plan === p);

              return (
                <div
                  key={p}
                  className={`relative rounded-xl border p-6 flex flex-col ${
                    pm.highlight
                      ? "border-purple-500/50 bg-purple-500/5 ring-1 ring-purple-500/20"
                      : isCurrent
                        ? "border-primary bg-primary/5"
                        : "bg-card border-border"
                  }`}
                >
                  {/* Popular badge */}
                  {pm.highlight && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-purple-500 text-white uppercase tracking-wider">
                        Most Popular
                      </span>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground uppercase tracking-wider">
                        Current Plan
                      </span>
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="flex items-center gap-2 mb-2 mt-1">
                    <PI className={`w-5 h-5 ${pm.color}`} />
                    <h4 className="text-base font-semibold text-foreground">{pm.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{pm.tagline}</p>

                  {/* Price */}
                  <div className="mb-5">
                    <span className="text-3xl font-bold text-foreground">{pm.price}</span>
                    {pm.period && <span className="text-sm text-muted-foreground">{pm.period}</span>}
                  </div>

                  {/* Specs */}
                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center gap-2.5 text-sm text-foreground">
                      <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                      {specs.users}
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-foreground">
                      <Sparkles className="w-4 h-4 text-muted-foreground shrink-0" />
                      {specs.missions}
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-foreground">
                      <Cpu className="w-4 h-4 text-muted-foreground shrink-0" />
                      {specs.model}
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-foreground">
                      <Server className="w-4 h-4 text-muted-foreground shrink-0" />
                      {specs.infra}
                    </div>
                  </div>

                  {/* Features */}
                  {planData && (
                    <div className="border-t border-border pt-4 mb-5 flex-1">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2.5">Includes</p>
                      <div className="space-y-1.5">
                        {planData.features.map((f) => (
                          <div key={f} className="flex items-center gap-2 text-xs text-foreground">
                            <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                            {featureLabels[f] ?? f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  {isAdmin && !isCurrent && !isDowngrade && (
                    <button
                      onClick={() => handleUpgrade(p)}
                      disabled={upgrading === p}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                        pm.highlight
                          ? "bg-purple-500 text-white hover:bg-purple-600"
                          : p === "enterprise_plus"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20"
                            : "bg-primary text-primary-foreground hover:bg-primary/80"
                      }`}
                    >
                      {upgrading === p ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : p === "enterprise_plus" ? (
                        <MessageSquare className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                      {upgrading === p
                        ? "Redirecting..."
                        : p === "enterprise_plus"
                          ? "Contact Sales"
                          : "Upgrade"}
                    </button>
                  )}
                  {isCurrent && (
                    <div className="w-full text-center py-2.5 text-xs text-muted-foreground">
                      Your current plan
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">What's Included in Every Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-foreground">5 AI Agents</span>
              </div>
              <p className="text-xs text-muted-foreground">Kaze, Scout, Forge, Ghost, and Sentinel — a full autonomous operations team</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Plug className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold text-foreground">30+ Integrations</span>
              </div>
              <p className="text-xs text-muted-foreground">HubSpot, Slack, Jira, GitHub, Gmail, Notion, Google Sheets, and more — or add any API in minutes</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-semibold text-foreground">Enterprise Security</span>
              </div>
              <p className="text-xs text-muted-foreground">AES-256-GCM encryption, OAuth with auto-refresh, audit logs, and per-user credential scoping</p>
            </div>
          </div>
        </div>

        {!isAdmin && (
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <p className="text-xs text-blue-500">
              Only workspace admins can manage billing and upgrade plans.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BillingPage;
