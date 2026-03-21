import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useNiche } from "../../framework/NicheContext";
import type { Deal } from "../hooks/useCrmSync";

interface PipelineFunnelProps {
  deals?: Deal[];
}

const STAGE_COLORS: Record<string, string> = {
  Lead: "hsl(0,0%,50%)",
  Contacted: "hsl(217,89%,61%)",
  Replied: "hsl(38,92%,50%)",
  Meeting: "hsl(160,84%,39%)",
  Closed: "hsl(142,71%,45%)",
};

export function PipelineFunnel({ deals = [] }: PipelineFunnelProps) {
  const { config } = useNiche();

  // Build funnel from real deal data
  const stageOrder = ["lead", "contacted", "replied", "meeting", "closed"];
  const stageLabels: Record<string, string> = {
    lead: "Lead",
    contacted: "Contacted",
    replied: "Replied",
    meeting: "Meeting",
    closed: "Closed",
  };

  const funnelData = stageOrder.map((stageId) => {
    const count = deals.filter((d) => d.stage === stageId).length;
    const label = stageLabels[stageId];
    return {
      stage: label,
      count,
      color: STAGE_COLORS[label] ?? "hsl(0,0%,50%)",
    };
  });

  // Calculate conversion rates
  const totalLeads = funnelData[0]?.count ?? 0;
  const withRates = funnelData.map((item, idx) => {
    const prevCount = idx > 0 ? funnelData[idx - 1].count : totalLeads;
    const rate = prevCount > 0 ? `${((item.count / prevCount) * 100).toFixed(0)}%` : "0%";
    return { ...item, rate: idx === 0 ? "100%" : rate };
  });

  if (deals.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No deals to display in funnel</p>
      </div>
    );
  }

  return (
    <div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={withRates}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
            <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "hsl(0,0%,50%)" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(0,0%,50%)" }} />
            <Tooltip
              contentStyle={{
                background: "hsl(240,10%,10%)",
                border: "1px solid hsl(0,0%,20%)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number, name: string, props: { payload: { rate: string } }) => [
                `${value} (${props.payload.rate} conversion)`,
                "Count",
              ]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {withRates.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-5 mt-3">
        {withRates.map((item) => (
          <span key={item.stage} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            {item.stage} ({item.count})
          </span>
        ))}
      </div>
    </div>
  );
}
