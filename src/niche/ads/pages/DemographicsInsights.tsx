import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plug, RefreshCw, Monitor, Smartphone, Tablet, MapPin, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

interface DeviceRow {
  device: string;
  impressions: number;
  clicks: number;
  costMicros: number;
  conversions: number;
}

interface DemographicRow {
  label: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface LocationRow {
  locationId: string;
  locationType: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface AudienceRow {
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  DESKTOP: Monitor,
  MOBILE: Smartphone,
  TABLET: Tablet,
};

const COLORS = [
  "hsl(262, 83%, 58%)",
  "hsl(217, 89%, 61%)",
  "hsl(160, 84%, 39%)",
  "hsl(38, 92%, 50%)",
  "hsl(340, 82%, 52%)",
  "hsl(190, 90%, 50%)",
];

export function DemographicsInsights() {
  const { config } = useNiche();
  const { execute, isConnected, connectionsLoaded } = useIntegrationCall();

  const connected = isConnected("google-ads");

  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [ageData, setAgeData] = useState<DemographicRow[]>([]);
  const [genderData, setGenderData] = useState<DemographicRow[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [audiences, setAudiences] = useState<AudienceRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!connected) return;
    setLoading(true);

    try {
      // Device performance
      const devResult = await execute("google-ads", "get_device_performance", {
        query:
          "SELECT segments.device, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM campaign WHERE segments.date DURING LAST_30_DAYS",
      });
      if (devResult.success && Array.isArray(devResult.result)) {
        const deviceMap = new Map<string, DeviceRow>();
        for (const r of devResult.result) {
          const device = r.segments?.device ?? "UNKNOWN";
          const existing = deviceMap.get(device);
          const m = r.metrics ?? {};
          if (existing) {
            existing.impressions += m.impressions ?? 0;
            existing.clicks += m.clicks ?? 0;
            existing.costMicros += m.costMicros ?? m.cost_micros ?? 0;
            existing.conversions += m.conversions ?? 0;
          } else {
            deviceMap.set(device, {
              device,
              impressions: m.impressions ?? 0,
              clicks: m.clicks ?? 0,
              costMicros: m.costMicros ?? m.cost_micros ?? 0,
              conversions: m.conversions ?? 0,
            });
          }
        }
        setDevices(Array.from(deviceMap.values()));
      }
    } catch {
      // silent
    }

    try {
      // Age/Gender performance
      const demoResult = await execute("google-ads", "get_age_gender_performance", {
        query:
          "SELECT ad_group_criterion.age_range.type, ad_group_criterion.gender.type, metrics.impressions, metrics.clicks, metrics.conversions FROM gender_view WHERE segments.date DURING LAST_30_DAYS",
      });
      if (demoResult.success && Array.isArray(demoResult.result)) {
        const ageMap = new Map<string, DemographicRow>();
        const genderMap = new Map<string, DemographicRow>();
        for (const r of demoResult.result) {
          const agc = r.adGroupCriterion ?? r.ad_group_criterion ?? {};
          const m = r.metrics ?? {};
          const ageType = agc.ageRange?.type ?? agc.age_range?.type;
          const genderType = agc.gender?.type ?? agc.gender?.type;

          if (ageType && ageType !== "UNSPECIFIED") {
            const existing = ageMap.get(ageType);
            if (existing) {
              existing.impressions += m.impressions ?? 0;
              existing.clicks += m.clicks ?? 0;
              existing.conversions += m.conversions ?? 0;
            } else {
              ageMap.set(ageType, {
                label: ageType.replace("AGE_RANGE_", "").replace(/_/g, "-"),
                impressions: m.impressions ?? 0,
                clicks: m.clicks ?? 0,
                conversions: m.conversions ?? 0,
              });
            }
          }

          if (genderType && genderType !== "UNSPECIFIED") {
            const existing = genderMap.get(genderType);
            if (existing) {
              existing.impressions += m.impressions ?? 0;
              existing.clicks += m.clicks ?? 0;
              existing.conversions += m.conversions ?? 0;
            } else {
              genderMap.set(genderType, {
                label: genderType.charAt(0) + genderType.slice(1).toLowerCase(),
                impressions: m.impressions ?? 0,
                clicks: m.clicks ?? 0,
                conversions: m.conversions ?? 0,
              });
            }
          }
        }
        setAgeData(Array.from(ageMap.values()));
        setGenderData(Array.from(genderMap.values()));
      }
    } catch {
      // silent
    }

    try {
      // Location performance
      const locResult = await execute("google-ads", "get_location_performance", {
        query:
          "SELECT geographic_view.country_criterion_id, geographic_view.location_type, metrics.impressions, metrics.clicks, metrics.conversions FROM geographic_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.clicks DESC LIMIT 20",
      });
      if (locResult.success && Array.isArray(locResult.result)) {
        setLocations(
          locResult.result.map((r: any) => {
            const gv = r.geographicView ?? r.geographic_view ?? {};
            const m = r.metrics ?? {};
            return {
              locationId: gv.countryCriterionId ?? gv.country_criterion_id ?? "",
              locationType: gv.locationType ?? gv.location_type ?? "",
              impressions: m.impressions ?? 0,
              clicks: m.clicks ?? 0,
              conversions: m.conversions ?? 0,
            };
          })
        );
      }
    } catch {
      // silent
    }

    try {
      // Audience performance
      const audResult = await execute("google-ads", "get_audience_performance", {
        query:
          "SELECT campaign_audience_view.resource_name, metrics.impressions, metrics.clicks, metrics.conversions FROM campaign_audience_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.conversions DESC LIMIT 20",
      });
      if (audResult.success && Array.isArray(audResult.result)) {
        setAudiences(
          audResult.result.map((r: any) => {
            const cav = r.campaignAudienceView ?? r.campaign_audience_view ?? {};
            const m = r.metrics ?? {};
            const resourceName = cav.resourceName ?? cav.resource_name ?? "";
            const shortName = resourceName.split("/").pop() ?? resourceName;
            return {
              name: shortName,
              impressions: m.impressions ?? 0,
              clicks: m.clicks ?? 0,
              conversions: m.conversions ?? 0,
            };
          })
        );
      }
    } catch {
      // silent
    }

    setLoading(false);
  }, [connected, execute]);

  useEffect(() => {
    if (connectionsLoaded && connected) {
      fetchAll();
    }
  }, [connectionsLoaded, connected, fetchAll]);

  // Empty state
  if (connectionsLoaded && !connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Demographics & Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">Performance by device, demographics, and location</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Plug className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Connect Google Ads to see demographic insights
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Link your Google Ads account to see device, age, gender, and location breakdowns.
          </p>
          <Link
            to="/integrations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: config.accentColor }}
          >
            <Plug className="w-4 h-4" />
            Connect Google Ads
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Demographics & Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">Performance by device, demographics, and location</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-sm text-muted-foreground">Loading demographic data...</span>
        </div>
      </div>
    );
  }

  // Device chart data for pie
  const devicePieData = devices.map((d) => ({
    name: d.device,
    value: d.clicks,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Demographics & Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">Performance by device, demographics, and location</p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Device Breakdown</h2>
          {devices.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No device data available</p>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={devicePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {devicePieData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(240,10%,10%)",
                        border: "1px solid hsl(0,0%,20%)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {devices.map((d) => {
                  const DevIcon = DEVICE_ICONS[d.device] ?? Monitor;
                  const ctr = d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(2) : "0.00";
                  return (
                    <div key={d.device} className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/20">
                      <div className="flex items-center gap-2">
                        <DevIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">{d.device}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span>{d.impressions.toLocaleString()} imp</span>
                        <span>{d.clicks.toLocaleString()} clicks</span>
                        <span>{ctr}% CTR</span>
                        <span>{d.conversions} conv</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Age Performance */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Age Range Performance</h2>
          {ageData.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No age data available</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(0,0%,50%)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,50%)" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(240,10%,10%)",
                      border: "1px solid hsl(0,0%,20%)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="clicks" name="Clicks" fill={config.accentColor} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversions" name="Conversions" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Gender Performance */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Gender Performance</h2>
          {genderData.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No gender data available</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genderData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(0,0%,50%)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(0,0%,50%)" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(240,10%,10%)",
                      border: "1px solid hsl(0,0%,20%)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="clicks" name="Clicks" fill={config.accentColor} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversions" name="Conversions" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Locations */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: config.accentColor }} />
            Top Locations
          </h2>
          {locations.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No location data available</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {locations.map((loc, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/20">
                  <span className="text-xs font-medium text-foreground">
                    {loc.locationType || "Country"} #{loc.locationId}
                  </span>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{loc.impressions.toLocaleString()} imp</span>
                    <span>{loc.clicks.toLocaleString()} clicks</span>
                    <span>{loc.conversions} conv</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Audience Performance */}
      {audiences.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: config.accentColor }} />
            Audience Segments
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs">Audience</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground text-xs">Impressions</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground text-xs">Clicks</th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground text-xs">Conversions</th>
                </tr>
              </thead>
              <tbody>
                {audiences.map((aud, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-accent/10 transition-colors">
                    <td className="px-4 py-2 text-foreground text-xs font-medium">{aud.name}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground text-xs">{aud.impressions.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground text-xs">{aud.clicks.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground text-xs">{aud.conversions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
