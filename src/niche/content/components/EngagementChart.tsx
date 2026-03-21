import { useMemo, useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { Loader2, BarChart3 } from "lucide-react";

interface EngagementPoint {
  date: string;
  likes: number;
  shares: number;
  comments: number;
}

const METRICS = [
  { key: "likes", color: "hsl(330, 70%, 55%)", label: "Likes" },
  { key: "shares", color: "hsl(210, 70%, 55%)", label: "Shares" },
  { key: "comments", color: "hsl(142, 71%, 45%)", label: "Comments" },
];

export function EngagementChart() {
  const { config } = useNiche();
  const { execute, isConnected } = useIntegrationCall();
  const [tweetData, setTweetData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected("twitter-x")) {
      setLoading(true);
      execute("twitter-x", "get_me", {}).then((res) => {
        if (res.success && res.result?.data?.id) {
          execute("twitter-x", "get_user_tweets", {
            id: res.result.data.id,
            max_results: 20,
            "tweet.fields": "public_metrics,created_at",
          }).then((tweetsRes) => {
            if (tweetsRes.success && tweetsRes.result?.data) {
              setTweetData(tweetsRes.result.data);
            }
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    }
  }, [execute, isConnected]);

  const chartData: EngagementPoint[] = useMemo(() => {
    if (tweetData.length === 0) return [];
    const byDate: Record<string, EngagementPoint> = {};
    for (const tweet of tweetData) {
      const date = tweet.created_at
        ? new Date(tweet.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Unknown";
      if (!byDate[date]) {
        byDate[date] = { date, likes: 0, shares: 0, comments: 0 };
      }
      byDate[date].likes += tweet.public_metrics?.like_count ?? 0;
      byDate[date].shares += tweet.public_metrics?.retweet_count ?? 0;
      byDate[date].comments += tweet.public_metrics?.reply_count ?? 0;
    }
    return Object.values(byDate).reverse();
  }, [tweetData]);

  if (loading) {
    return (
      <div className="h-56 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-56 flex flex-col items-center justify-center">
        <BarChart3 className="w-8 h-8 text-muted-foreground/30 mb-2" />
        <p className="text-xs text-muted-foreground">
          Connect your platforms in Integrations to see engagement data here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              {METRICS.map((m) => (
                <linearGradient key={m.key} id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={m.color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={m.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(0,0%,50%)" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(0,0%,50%)" }} />
            <Tooltip
              contentStyle={{
                background: "hsl(240,10%,10%)",
                border: "1px solid hsl(0,0%,20%)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
            {METRICS.map((m) => (
              <Area
                key={m.key}
                type="monotone"
                dataKey={m.key}
                stroke={m.color}
                fill={`url(#grad-${m.key})`}
                strokeWidth={2}
                name={m.label}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
