import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  CreditCard, Check, Zap, Crown, Building2, ArrowUpRight,
  AlertCircle, RefreshCw, BarChart3, Users, Plug, Bot, FileText,
} from "lucide-react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

type Plan = "starter" | "pro" | "enterprise";

const planMeta: Record<Plan, { name: string; icon: any; color: string; price: string; period: string }> = {
  starter: { name: "Starter", icon: Zap, color: "text-blue-500", price: "$499", period: "/mo" },
  pro: { name: "Growth", icon: Crown, color: "text-purple-500", price: "$999", period: "/mo" },
  enterprise: { name: "Enterprise", icon: Building2, color: "text-amber-500", price: "$2,499", period: "/mo" },
};

const featureLabels: Record<string, string> = {
  board: "Mission Board",
  tasks: "Task Management",
  integrations_basic: "Basic Integrations (10)",
  integrations_full: "All Integrations (50+)",
  webhooks: "Webhooks",
  memory: "Agent Memory Bank",
  autopilot: "Autopilot Mode",
  analytics: "Analytics Dashboard",
  branding: "Custom Branding",
  audit_log: "Audit Log",
  voice: "Voice Commands",
  custom_agents: "Custom Agents",
  sla: "Enterprise SLA",
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
  const currentPlan = (subscription?.plan ?? "starter") as Plan;
  const subStatus = subscription?.status ?? "trialing";

  const handleUpgrade = async (plan: Plan) => {
    if (!isAdmin) return;
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

  // Sort plans for comparison
  const planOrder: Plan[] = ["starter", "pro", "enterprise"];
  const sortedPlans = planOrder
    .map((p) => planLimits.find((l) => l.plan === p))
    .filter(Boolean) as typeof planLimits;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your subscription and usage
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
        {sortedPlans.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sortedPlans.map((plan) => {
                const p = plan.plan as Plan;
                const pm = planMeta[p];
                const PI = pm.icon;
                const isCurrent = p === currentPlan;
                const planIndex = planOrder.indexOf(p);
                const currentIndex = planOrder.indexOf(currentPlan);
                const isDowngrade = planIndex < currentIndex;

                return (
                  <div
                    key={p}
                    className={`rounded-xl border p-5 ${
                      isCurrent ? "border-primary bg-primary/5" : "bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <PI className={`w-5 h-5 ${pm.color}`} />
                      <h4 className="text-sm font-semibold text-foreground">{pm.name}</h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary ml-auto">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-foreground">{pm.price}</span>
                      <span className="text-sm text-muted-foreground">{pm.period}</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {plan.maxUsers >= 999 ? "Unlimited" : plan.maxUsers} users
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Bot className="w-3 h-3" />
                        {plan.maxAgents >= 10 ? "Unlimited" : plan.maxAgents} agents
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Plug className="w-3 h-3" />
                        {plan.maxIntegrations >= 999 ? "Unlimited" : plan.maxIntegrations} integrations
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        {plan.maxTasksPerMonth >= 999999 ? "Unlimited" : plan.maxTasksPerMonth.toLocaleString()} tasks/mo
                      </div>
                    </div>
                    <div className="border-t border-border pt-3 mb-4">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Features</p>
                      <div className="space-y-1">
                        {plan.features.map((f) => (
                          <div key={f} className="flex items-center gap-1.5 text-xs text-foreground">
                            <Check className="w-3 h-3 text-green-500 shrink-0" />
                            {featureLabels[f] ?? f}
                          </div>
                        ))}
                      </div>
                    </div>
                    {isAdmin && !isCurrent && !isDowngrade && (
                      <button
                        onClick={() => handleUpgrade(p)}
                        disabled={upgrading === p}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
                      >
                        {upgrading === p ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {upgrading === p ? "Redirecting..." : "Upgrade"}
                      </button>
                    )}
                    {isCurrent && (
                      <div className="w-full text-center py-2 text-xs text-muted-foreground">
                        Your current plan
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
