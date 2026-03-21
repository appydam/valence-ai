import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNiche } from "./NicheContext";
import { Plug, X, CheckCircle2, AlertTriangle } from "lucide-react";

export function IntegrationStatusBanner() {
  const { config } = useNiche();
  const [dismissed, setDismissed] = useState(false);
  const connections = useQuery(api.connections.listAll);

  if (dismissed || connections === undefined) return null;

  const connectedSlugs = new Set(
    (connections ?? [])
      .filter((c: { status: string }) => c.status === "active")
      .map((c: { blueprintSlug: string }) => c.blueprintSlug)
  );

  const allIntegrations = [...config.requiredIntegrations, ...config.optionalIntegrations];
  const connected = allIntegrations.filter((s) => connectedSlugs.has(s));
  const missing = allIntegrations.filter((s) => !connectedSlugs.has(s));

  if (missing.length === 0) return null;

  const hasRequiredMissing = config.requiredIntegrations.some((s) => !connectedSlugs.has(s));

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mb-4 border ${
        hasRequiredMissing
          ? "bg-yellow-500/5 border-yellow-500/20"
          : "bg-accent/30 border-border/50"
      }`}
    >
      {hasRequiredMissing ? (
        <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
      ) : (
        <Plug className="w-4 h-4 text-muted-foreground shrink-0" />
      )}

      <div className="flex-1 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-foreground/80">
          {connected.length}/{allIntegrations.length} integrations connected
        </span>
        <span className="text-xs text-muted-foreground">·</span>
        {missing.slice(0, 3).map((slug) => (
          <span
            key={slug}
            className="text-[10px] px-1.5 py-0.5 rounded bg-accent/50 text-muted-foreground capitalize"
          >
            {slug.replace(/-/g, " ")}
          </span>
        ))}
        {missing.length > 3 && (
          <span className="text-[10px] text-muted-foreground">+{missing.length - 3} more</span>
        )}
      </div>

      <Link
        to="/integrations"
        className="text-xs font-medium px-3 py-1 rounded-md transition-colors shrink-0"
        style={{ background: config.accentColor, color: "white" }}
      >
        Connect
      </Link>

      <button
        onClick={() => setDismissed(true)}
        className="text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
