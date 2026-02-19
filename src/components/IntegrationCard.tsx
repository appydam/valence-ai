import { useState } from "react";
import { Integration, CATEGORY_CONFIG } from "@/data/integrations";
import { CheckCircle2, Clock, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface IntegrationCardProps {
  integration: Integration;
  isEnabled: boolean;
  isConnected: boolean;
}

export function IntegrationCard({ integration, isEnabled, isConnected }: IntegrationCardProps) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const categoryConfig = CATEGORY_CONFIG[integration.category];
  const isComingSoon = integration.status === "coming_soon";

  const handleCreateBlueprint = () => {
    // Navigate to blueprint wizard with pre-filled name and category
    navigate(`/integrations/blueprint/new?name=${encodeURIComponent(integration.name)}&category=${encodeURIComponent(integration.category)}`);
  };

  // Determine display status
  const getStatusBadge = () => {
    if (isComingSoon) return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/10 text-orange-500">
        <Clock className="w-3 h-3" /> Coming Soon
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-500">
        Template
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

      {/* Create Blueprint button (templates are reference only) */}
      {!isComingSoon && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button
            onClick={handleCreateBlueprint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Blueprint
          </button>
        </div>
      )}
    </div>
  );
}
