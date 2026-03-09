import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Plus, Search, Building2, Loader2,
  CheckCircle2, AlertTriangle, Clock, Pause,
} from "lucide-react";

type CustomerStatus = "preflight" | "provisioning" | "verifying" | "active" | "paused" | "failed";

const STATUS_CONFIG: Record<CustomerStatus, { label: string; color: string; icon: React.ElementType }> = {
  preflight: { label: "Pre-flight", color: "text-blue-500 bg-blue-500/10", icon: Clock },
  provisioning: { label: "Provisioning", color: "text-yellow-500 bg-yellow-500/10", icon: Clock },
  verifying: { label: "Verifying", color: "text-purple-500 bg-purple-500/10", icon: Clock },
  active: { label: "Active", color: "text-green-500 bg-green-500/10", icon: CheckCircle2 },
  paused: { label: "Paused", color: "text-muted-foreground bg-accent", icon: Pause },
  failed: { label: "Failed", color: "text-red-500 bg-red-500/10", icon: AlertTriangle },
};

const PLAN_BADGES: Record<string, string> = {
  business: "bg-blue-500/10 text-blue-500",
  enterprise: "bg-purple-500/10 text-purple-500",
  enterprise_plus: "bg-orange-500/10 text-orange-500",
};

const PLAN_LABELS: Record<string, string> = {
  business: "Business",
  enterprise: "Enterprise",
  enterprise_plus: "Enterprise+",
};

export function CustomerList({
  onNewCustomer,
  onSelectCustomer,
}: {
  onNewCustomer: () => void;
  onSelectCustomer: (slug: string) => void;
}) {
  const customers = useQuery(api.customerProvisioning.list);
  const [filter, setFilter] = useState<"all" | CustomerStatus>("all");
  const [search, setSearch] = useState("");

  if (customers === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filtered = customers
    .filter((c) => filter === "all" || c.status === filter)
    .filter((c) =>
      !search ||
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      c.adminEmail.toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    all: customers.length,
    provisioning: customers.filter((c) => c.status === "provisioning" || c.status === "preflight" || c.status === "verifying").length,
    active: customers.filter((c) => c.status === "active").length,
    paused: customers.filter((c) => c.status === "paused").length,
    failed: customers.filter((c) => c.status === "failed").length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Customers</h2>
          <p className="text-xs text-muted-foreground">{customers.length} total</p>
        </div>
        <button
          onClick={onNewCustomer}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Customer
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, slug, or email..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1">
          {([
            ["all", `All (${counts.all})`],
            ["provisioning", `In Progress (${counts.provisioning})`],
            ["active", `Active (${counts.active})`],
            ["failed", `Failed (${counts.failed})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Building2 className="w-10 h-10 text-muted-foreground/50 mx-auto" />
          <p className="text-sm text-muted-foreground">
            {customers.length === 0
              ? "No customers yet. Click 'New Customer' to start provisioning."
              : "No customers match your filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((customer) => {
            const stepsTotal = customer.steps.length;
            const stepsDone = customer.steps.filter((s) => s.status === "done" || s.status === "skipped").length;
            const progress = stepsTotal > 0 ? Math.round((stepsDone / stepsTotal) * 100) : 0;
            const statusConfig = STATUS_CONFIG[customer.status as CustomerStatus] ?? STATUS_CONFIG.provisioning;
            const StatusIcon = statusConfig.icon;

            return (
              <button
                key={customer._id}
                onClick={() => onSelectCustomer(customer.slug)}
                className="w-full rounded-xl border bg-card p-4 text-left hover:border-primary/50 hover:bg-accent/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  {/* Company info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {customer.companyName}
                      </h3>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${PLAN_BADGES[customer.plan]}`}>
                        {PLAN_LABELS[customer.plan]}
                      </span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-1 ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">{customer.slug}</span>
                      <span>{customer.domain}</span>
                      <span>{customer.adminEmail}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="shrink-0 w-32 text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-xs font-medium text-foreground">{stepsDone}/{stepsTotal}</span>
                      <span className="text-[10px] text-muted-foreground">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-accent overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progress === 100 ? "bg-green-500" : "bg-primary"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
