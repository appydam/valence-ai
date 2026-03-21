import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import { Loader2, Plug } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

interface SpendDataPoint {
  date: string;
  google: number;
  facebook: number;
}

const PLATFORMS = [
  { key: "google", color: "hsl(217, 89%, 61%)", label: "Google Ads" },
  { key: "facebook", color: "hsl(220, 46%, 48%)", label: "Facebook Ads" },
];

export function SpendChart() {
  const { config } = useNiche();
  const { execute, isConnected, connectionsLoaded } = useIntegrationCall();
  const [data, setData] = useState<SpendDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const googleConnected = isConnected("google-ads");
  const facebookConnected = isConnected("facebook-ads");
  const anyConnected = googleConnected || facebookConnected;

  useEffect(() => {
    if (!connectionsLoaded || !anyConnected) return;

    let cancelled = false;

    async function fetchSpendTimeSeries() {
      setLoading(true);
      const dailyMap = new Map<string, SpendDataPoint>();

      try {
        if (googleConnected) {
          const result = await execute("google-ads", "search_campaigns", {
            query:
              "SELECT segments.date, metrics.cost_micros FROM campaign WHERE segments.date DURING LAST_30_DAYS ORDER BY segments.date ASC",
          });
          if (result.success && Array.isArray(result.result)) {
            for (const row of result.result) {
              const dateStr = row.segments?.date ?? "";
              if (!dateStr) continue;
              const formatted = formatDate(dateStr);
              const entry = dailyMap.get(formatted) ?? { date: formatted, google: 0, facebook: 0 };
              entry.google += (row.metrics?.cost_micros ?? 0) / 1_000_000;
              dailyMap.set(formatted, entry);
            }
          }
        }

        if (facebookConnected) {
          const result = await execute("facebook-ads", "get_campaign_insights", {
            fields: "spend",
            date_preset: "last_30d",
            time_increment: 1,
          });
          const rows = result.success
            ? (result.result?.data ?? (Array.isArray(result.result) ? result.result : []))
            : [];
          for (const row of rows) {
            const dateStr = row.date_start ?? "";
            if (!dateStr) continue;
            const formatted = formatDate(dateStr);
            const entry = dailyMap.get(formatted) ?? { date: formatted, google: 0, facebook: 0 };
            entry.facebook += parseFloat(row.spend ?? "0");
            dailyMap.set(formatted, entry);
          }
        }

        if (!cancelled) {
          const sorted = Array.from(dailyMap.values()).sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          setData(sorted);
        }
      } catch {
        // silently fail — chart will show empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSpendTimeSeries();
    return () => { cancelled = true; };
  }, [connectionsLoaded, googleConnected, facebookConnected, execute]);

  if (!connectionsLoaded) return null;

  if (!anyConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Plug className="w-8 h-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground mb-2">
          Connect Google Ads or Facebook Ads to see spend data
        </p>
        <Link
          to="/integrations"
          className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
          style={{ background: config.accentColor, color: "white" }}
        >
          Connect Integrations
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading spend data...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No spend data available for the selected period
        </p>
      </div>
    );
  }

  const activePlatforms = PLATFORMS.filter((p) => {
    if (p.key === "google") return googleConnected;
    if (p.key === "facebook") return facebookConnected;
    return false;
  });

  return (
    <div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              {activePlatforms.map((p) => (
                <linearGradient key={p.key} id={`grad-${p.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={p.color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={p.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(0,0%,50%)" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(0,0%,50%)" }} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{
                background: "hsl(240,10%,10%)",
                border: "1px solid hsl(0,0%,20%)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number) => `$${Math.round(value)}`}
            />
            {activePlatforms.map((p) => (
              <Area
                key={p.key}
                type="monotone"
                dataKey={p.key}
                stroke={p.color}
                fill={`url(#grad-${p.key})`}
                strokeWidth={2}
                name={p.label}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-5 mt-3">
        {activePlatforms.map((p) => (
          <span key={p.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Formats "2026-03-15" or "Mar 15" style dates into "Mar 15" */
function formatDate(raw: string): string {
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return raw;
  }
}
