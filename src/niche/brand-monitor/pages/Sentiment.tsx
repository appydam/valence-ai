import { BarChart3 } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";

export function Sentiment() {
  const { config } = useNiche();

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sentiment</h1>
        <p className="text-sm text-muted-foreground">How people feel about your brand</p>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-24">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: `${config.accentColor}15` }}
        >
          <BarChart3 className="w-7 h-7" style={{ color: config.accentColor }} />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">No sentiment data yet</h2>
        <p className="text-sm text-muted-foreground/60 text-center max-w-md">
          Monitor your brand to start tracking sentiment across platforms. Run a scan from the Home page to begin collecting data.
        </p>

        <div className="mt-8 mx-auto max-w-md rounded-xl border border-border/20 bg-card/50 p-4">
          <p className="text-[11px] text-muted-foreground/60 text-center mb-2">Required integrations</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {["Google Analytics"].map(name => (
              <span key={name} className="px-2 py-0.5 rounded-full bg-blue-500/10 text-[10px] text-blue-400 border border-blue-500/20">{name}</span>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/40 text-center mt-2">Also works with: YouTube, Google Search Console, Slack, Notion, Gmail</p>
        </div>
      </div>
    </div>
  );
}
