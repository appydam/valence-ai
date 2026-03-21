import { Play, Pause, AlertCircle, MoreHorizontal } from "lucide-react";
import { AD_PLATFORMS } from "../data/adsPlatforms";

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: "active" | "paused" | "draft";
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  roas: number;
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const platform = AD_PLATFORMS.find((p) => p.id === campaign.platform);

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-card hover:border-border/80 transition-colors">
      {/* Platform + Status */}
      <div className="flex items-center gap-3 min-w-[220px]">
        <span className="text-lg">{platform?.icon ?? "📊"}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{campaign.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">{platform?.name ?? campaign.platform}</span>
            <span
              className={`flex items-center gap-1 text-[10px] font-medium ${
                campaign.status === "active"
                  ? "text-green-500"
                  : campaign.status === "paused"
                  ? "text-yellow-500"
                  : "text-muted-foreground"
              }`}
            >
              {campaign.status === "active" ? (
                <Play className="w-2.5 h-2.5 fill-current" />
              ) : campaign.status === "paused" ? (
                <Pause className="w-2.5 h-2.5" />
              ) : (
                <AlertCircle className="w-2.5 h-2.5" />
              )}
              {campaign.status}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-6 flex-1">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Spend</p>
          <p className="text-sm font-medium text-foreground">${campaign.spend.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Impressions</p>
          <p className="text-sm font-medium text-foreground">
            {campaign.impressions >= 1000
              ? `${(campaign.impressions / 1000).toFixed(0)}K`
              : campaign.impressions}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Clicks</p>
          <p className="text-sm font-medium text-foreground">
            {campaign.clicks >= 1000
              ? `${(campaign.clicks / 1000).toFixed(1)}K`
              : campaign.clicks}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">CTR</p>
          <p className="text-sm font-medium text-foreground">{campaign.ctr}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Conv.</p>
          <p className="text-sm font-medium text-foreground">{campaign.conversions}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">ROAS</p>
          <p
            className="text-sm font-bold"
            style={{
              color:
                campaign.roas >= 3
                  ? "hsl(142,71%,45%)"
                  : campaign.roas >= 2
                  ? "hsl(38,92%,50%)"
                  : "hsl(0,84%,60%)",
            }}
          >
            {campaign.roas > 0 ? `${campaign.roas}x` : "—"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}
