import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNiche } from "./NicheContext";
import { Plug, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

/**
 * Checks that at least the required integrations are connected.
 * Shows an onboarding wizard if not.
 */
export function NicheGuard({ children }: { children: ReactNode }) {
  const { config } = useNiche();
  const connections = useQuery(api.connections.listAll);

  // Still loading
  if (connections === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const connectedSlugs = new Set(
    (connections ?? [])
      .filter((c: { status: string }) => c.status === "active")
      .map((c: { blueprintSlug: string }) => c.blueprintSlug)
  );

  const missingRequired = config.requiredIntegrations.filter(
    (slug) => !connectedSlugs.has(slug)
  );
  const connectedOptional = config.optionalIntegrations.filter((slug) =>
    connectedSlugs.has(slug)
  );
  const missingOptional = config.optionalIntegrations.filter(
    (slug) => !connectedSlugs.has(slug)
  );

  // All required integrations connected — proceed
  if (missingRequired.length === 0) {
    return <>{children}</>;
  }

  // Show onboarding
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-4"
            style={{ background: `${config.accentColor}15` }}
          >
            {config.emoji}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Set up {config.name}
          </h1>
          <p className="text-muted-foreground">
            Connect the required integrations to get started.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Required
          </p>
          {config.requiredIntegrations.map((slug) => {
            const connected = connectedSlugs.has(slug);
            return (
              <div
                key={slug}
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center gap-3">
                  <Plug className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium capitalize">
                    {slug.replace(/-/g, " ")}
                  </span>
                </div>
                {connected ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Link
                    to="/integrations"
                    className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                    style={{
                      background: config.accentColor,
                      color: "white",
                    }}
                  >
                    Connect
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {config.optionalIntegrations.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Optional (recommended)
            </p>
            {config.optionalIntegrations.map((slug) => {
              const connected = connectedSlugs.has(slug);
              return (
                <div
                  key={slug}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-border/50 bg-card/50"
                >
                  <div className="flex items-center gap-3">
                    <Plug className="w-4 h-4 text-muted-foreground/60" />
                    <span className="text-sm text-muted-foreground capitalize">
                      {slug.replace(/-/g, " ")}
                    </span>
                  </div>
                  {connected ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500/60" />
                  ) : (
                    <Link
                      to="/integrations"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Connect
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {missingRequired.length === 0 && (
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-colors"
            style={{ background: config.accentColor }}
          >
            Continue to {config.name}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
