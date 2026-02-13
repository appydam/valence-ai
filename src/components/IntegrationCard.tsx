import { useState } from "react";
import { Integration, CATEGORY_CONFIG } from "@/data/integrations";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CheckCircle2, Clock, Zap } from "lucide-react";

interface IntegrationCardProps {
  integration: Integration;
  isEnabled: boolean;
  isConnected: boolean;
}

export function IntegrationCard({ integration, isEnabled, isConnected }: IntegrationCardProps) {
  const toggle = useMutation(api.integrations.toggle);
  const [toggling, setToggling] = useState(false);
  const [imgError, setImgError] = useState(false);

  const categoryConfig = CATEGORY_CONFIG[integration.category];
  const isComingSoon = integration.status === "coming_soon";

  const handleToggle = async () => {
    setToggling(true);
    try {
      await toggle({
        slug: integration.slug,
        name: integration.name,
        category: integration.category,
        enabled: !isEnabled,
      });
    } catch (e) {
      console.error("Failed to toggle integration:", e);
    }
    setToggling(false);
  };

  // Determine display status
  const getStatusBadge = () => {
    if (isConnected) return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-500">
        <CheckCircle2 className="w-3 h-3" /> Connected
      </span>
    );
    if (isEnabled) return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
        <Zap className="w-3 h-3" /> Enabled
      </span>
    );
    if (isComingSoon) return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/10 text-orange-500">
        <Clock className="w-3 h-3" /> Coming Soon
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground">
        Available
      </span>
    );
  };

  return (
    <div className={`rounded-lg border p-4 transition-all ${
      isConnected ? "border-green-500/30 bg-card hover:border-green-500/50" :
      isEnabled ? "border-primary/20 bg-card hover:border-primary/40" :
      isComingSoon ? "border-dashed border-border bg-card/50" :
      "border-border bg-card hover:border-primary/20"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {/* Company Logo */}
          <div className="w-8 h-8 rounded-md bg-white border border-border/50 flex items-center justify-center shrink-0 overflow-hidden p-1">
            {!imgError ? (
              <img
                src={integration.iconUrl}
                alt={integration.name}
                className="w-full h-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-base">{categoryConfig.emoji}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold truncate ${isComingSoon ? "text-foreground/60" : "text-foreground"}`}>
              {integration.name}
            </h3>
            <span className="text-[10px] text-muted-foreground">{integration.category}</span>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <p className={`text-xs mb-3 line-clamp-2 ${isComingSoon ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
        {integration.description}
      </p>

      {/* Enable toggle */}
      {!isComingSoon && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-[10px] text-muted-foreground">
            {isEnabled ? "Enabled for agents" : "Enable for agents"}
          </span>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              isEnabled ? "bg-primary" : "bg-secondary"
            } ${toggling ? "opacity-50" : ""}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              isEnabled ? "left-[18px]" : "left-0.5"
            }`} />
          </button>
        </div>
      )}
    </div>
  );
}
