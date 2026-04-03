import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { ArrowRight } from "lucide-react";

const CHAIN = [
  { slug: "apollo", label: "Apollo", color: "#6C5CE7" },
  { slug: "clay", label: "Clay", color: "#FF6B35" },
  { slug: "hubspot", label: "HubSpot", color: "#FF7A59" },
  { slug: "lagrowthmachine", label: "LGM", color: "#00C48C" },
];

export function IntegrationChain() {
  const { isConnected } = useIntegrationCall();

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {CHAIN.map((item, idx) => {
        const connected = isConnected(item.slug);
        return (
          <div key={item.slug} className="flex items-center gap-1">
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium transition-all"
              style={{
                borderColor: connected ? `${item.color}40` : "hsl(0,0%,18%)",
                background: connected ? `${item.color}10` : "transparent",
                color: connected ? item.color : "hsl(0,0%,35%)",
                opacity: connected ? 1 : 0.5,
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: connected ? "#22c55e" : "#6b7280" }}
              />
              {item.label}
            </div>
            {idx < CHAIN.length - 1 && (
              <ArrowRight className="w-3 h-3 text-border/40" />
            )}
          </div>
        );
      })}
    </div>
  );
}
