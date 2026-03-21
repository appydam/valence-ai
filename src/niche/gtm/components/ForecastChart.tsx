import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, DollarSign, Plug } from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { useCrmSync } from "../hooks/useCrmSync";

// Stage-to-probability mapping for weighted pipeline
const STAGE_PROBABILITIES: Record<string, number> = {
  lead: 5,
  contacted: 10,
  replied: 25,
  meeting: 50,
  closed: 100,
};

export function ForecastChart() {
  const { config } = useNiche();
  const { deals, isLive } = useCrmSync();

  // Build pipeline stages from real deals
  const stageOrder = ["lead", "contacted", "replied", "meeting", "closed"];
  const stageLabels: Record<string, string> = {
    lead: "Lead",
    contacted: "Contacted",
    replied: "Replied",
    meeting: "Meeting",
    closed: "Closed",
  };

  const pipelineStages = stageOrder.map((stageId) => {
    const stageDeals = deals.filter((d) => d.stage === stageId);
    const value = stageDeals.reduce((sum, d) => sum + d.dealSize, 0);
    return {
      stage: stageLabels[stageId],
      probability: STAGE_PROBABILITIES[stageId] ?? 5,
      count: stageDeals.length,
      value,
    };
  });

  const totalWeightedPipeline = pipelineStages.reduce(
    (sum, stage) => sum + stage.value * (stage.probability / 100),
    0
  );

  const totalPipeline = pipelineStages.reduce((sum, stage) => sum + stage.value, 0);

  // Build simple forecast from current closed value
  const closedValue = pipelineStages.find((s) => s.stage === "Closed")?.value ?? 0;
  const forecastData = isLive && totalPipeline > 0
    ? [
        { day: "Today", projected: closedValue, actual: closedValue, upperBound: closedValue, lowerBound: closedValue },
        { day: "W2", projected: closedValue + totalWeightedPipeline * 0.15, actual: null, upperBound: closedValue + totalWeightedPipeline * 0.25, lowerBound: closedValue + totalWeightedPipeline * 0.05 },
        { day: "W4", projected: closedValue + totalWeightedPipeline * 0.35, actual: null, upperBound: closedValue + totalWeightedPipeline * 0.5, lowerBound: closedValue + totalWeightedPipeline * 0.15 },
        { day: "W8", projected: closedValue + totalWeightedPipeline * 0.6, actual: null, upperBound: closedValue + totalWeightedPipeline * 0.85, lowerBound: closedValue + totalWeightedPipeline * 0.3 },
        { day: "W12", projected: closedValue + totalWeightedPipeline * 0.85, actual: null, upperBound: closedValue + totalWeightedPipeline * 1.1, lowerBound: closedValue + totalWeightedPipeline * 0.5 },
      ]
    : [];

  if (!isLive || deals.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <Plug className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-2">No pipeline data for forecast</p>
        <Link
          to="/integrations"
          className="text-xs font-medium hover:underline"
          style={{ color: config.accentColor }}
        >
          Connect your CRM to see deal forecasts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weighted Pipeline Value */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: config.accentColor }} />
            <h2 className="text-sm font-semibold text-foreground">Deal Forecast — Next 90 Days</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Total Pipeline</p>
              <p className="text-sm font-bold text-foreground">
                ${(totalPipeline / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Weighted Value</p>
              <p className="text-lg font-bold" style={{ color: config.accentColor }}>
                ${(totalWeightedPipeline / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        {forecastData.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={config.accentColor} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={config.accentColor} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={config.accentColor} stopOpacity={0.08} />
                    <stop offset="100%" stopColor={config.accentColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(0,0%,50%)" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(0,0%,50%)" }}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(240,10%,10%)",
                    border: "1px solid hsl(0,0%,20%)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => [
                    `$${(value / 1000).toFixed(0)}K`,
                    name === "upperBound" ? "Upper Bound" : name === "lowerBound" ? "Lower Bound" : name === "projected" ? "Projected" : "Actual",
                  ]}
                />
                {/* Confidence range */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill="url(#confidenceGrad)"
                  name="upperBound"
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="none"
                  fill="hsl(240,10%,4%)"
                  name="lowerBound"
                />
                {/* Projected line */}
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke={config.accentColor}
                  fill="url(#forecastGrad)"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  name="projected"
                />
                {/* Actual line */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(142, 71%, 45%)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "hsl(142, 71%, 45%)" }}
                  connectNulls={false}
                  name="actual"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex items-center justify-center gap-5 mt-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-6 h-0.5 rounded" style={{ background: "hsl(142, 71%, 45%)" }} />
            Actual Closed
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-6 h-0.5 rounded border-dashed border-t-2" style={{ borderColor: config.accentColor }} />
            Projected
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-4 h-3 rounded opacity-20" style={{ background: config.accentColor }} />
            Confidence Range
          </span>
        </div>
      </div>

      {/* Pipeline Stages with Probabilities */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2">
          <DollarSign className="w-4 h-4" style={{ color: config.accentColor }} />
          <h3 className="text-sm font-semibold text-foreground">Weighted Pipeline Breakdown</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5">Stage</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2.5">Deals</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2.5">Value</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2.5">Probability</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2.5">Weighted</th>
            </tr>
          </thead>
          <tbody>
            {pipelineStages.map((stage) => {
              const weighted = stage.value * (stage.probability / 100);
              return (
                <tr
                  key={stage.stage}
                  className="border-b border-border/30 hover:bg-accent/20 transition-colors"
                >
                  <td className="px-5 py-2.5 text-sm font-medium text-foreground">{stage.stage}</td>
                  <td className="px-5 py-2.5 text-sm text-right text-muted-foreground">{stage.count}</td>
                  <td className="px-5 py-2.5 text-sm text-right text-foreground">
                    ${(stage.value / 1000).toFixed(0)}K
                  </td>
                  <td className="px-5 py-2.5 text-sm text-right">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: `${config.accentColor}15`,
                        color: config.accentColor,
                      }}
                    >
                      {stage.probability}%
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-sm text-right font-medium" style={{ color: config.accentColor }}>
                    ${(weighted / 1000).toFixed(0)}K
                  </td>
                </tr>
              );
            })}
            <tr className="bg-accent/10">
              <td className="px-5 py-2.5 text-sm font-bold text-foreground">Total</td>
              <td className="px-5 py-2.5 text-sm text-right font-medium text-foreground">
                {pipelineStages.reduce((sum, s) => sum + s.count, 0)}
              </td>
              <td className="px-5 py-2.5 text-sm text-right font-bold text-foreground">
                ${(totalPipeline / 1000).toFixed(0)}K
              </td>
              <td className="px-5 py-2.5" />
              <td className="px-5 py-2.5 text-sm text-right font-bold" style={{ color: config.accentColor }}>
                ${(totalWeightedPipeline / 1000).toFixed(0)}K
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
