import { Check } from "lucide-react";

const PLANS = [
  {
    id: "business" as const,
    name: "Business",
    price: "$2,499-3,499/mo",
    highlights: ["Up to 20 users", "Sonnet 4.6", "Cloud-hosted", "5 agents", "30 integrations"],
    deployment: "cloud" as const,
  },
  {
    id: "enterprise" as const,
    name: "Enterprise",
    price: "$4,999-5,999/mo",
    highlights: ["25 users", "Sonnet + Opus", "Dedicated server", "10 agents", "100 integrations"],
    deployment: "cloud" as const,
  },
  {
    id: "enterprise_plus" as const,
    name: "Enterprise+",
    price: "Custom",
    highlights: ["Unlimited users", "Full Opus 4.6", "On-prem / VPC", "Unlimited agents", "Custom SLA"],
    deployment: "onprem" as const,
  },
];

type Plan = "business" | "enterprise" | "enterprise_plus";

export function PlanSelector({
  selected,
  onSelect,
}: {
  selected: Plan;
  onSelect: (plan: Plan, deployment: "cloud" | "onprem") => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {PLANS.map((plan) => {
        const isSelected = selected === plan.id;
        return (
          <button
            key={plan.id}
            onClick={() => onSelect(plan.id, plan.deployment)}
            className={`rounded-xl border-2 p-4 text-left transition-all ${
              isSelected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-primary mb-3">{plan.price}</p>
            <div className="space-y-1">
              {plan.highlights.map((h) => (
                <p key={h} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />
                  {h}
                </p>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
