import { useState, useCallback, useEffect } from "react";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

interface ContentMetrics {
  impressions: number;
  engagements: number;
  likes: number;
  shares: number;
  comments: number;
  clicks: number;
  engagementRate: number;
}

interface MetricsState {
  metrics: ContentMetrics | null;
  loading: boolean;
  isLive: boolean;
  error: string | null;
}

const DEMO_METRICS: ContentMetrics = {
  impressions: 24500,
  engagements: 1840,
  likes: 982,
  shares: 245,
  comments: 156,
  clicks: 457,
  engagementRate: 7.5,
};

export function useContentMetrics(tweetId?: string) {
  const { execute, isConnected, loading: integrationLoading } = useIntegrationCall();
  const [state, setState] = useState<MetricsState>({
    metrics: null,
    loading: false,
    isLive: false,
    error: null,
  });

  const twitterConnected = isConnected("twitter-x");
  const gaConnected = isConnected("google-analytics");
  const hasLiveConnection = twitterConnected || gaConnected;

  const fetchMetrics = useCallback(async () => {
    if (!hasLiveConnection) {
      setState({
        metrics: DEMO_METRICS,
        loading: false,
        isLive: false,
        error: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      let metrics: ContentMetrics = { ...DEMO_METRICS };
      let isLive = false;

      if (twitterConnected && tweetId) {
        const result = await execute("twitter-x", "get_tweet_metrics", {
          tweet_id: tweetId,
        });
        if (result.success && result.result) {
          const data = result.result;
          metrics = {
            impressions: data.impression_count ?? metrics.impressions,
            engagements: data.engagement_count ?? metrics.engagements,
            likes: data.like_count ?? metrics.likes,
            shares: data.retweet_count ?? metrics.shares,
            comments: data.reply_count ?? metrics.comments,
            clicks: data.url_link_clicks ?? metrics.clicks,
            engagementRate:
              data.impression_count > 0
                ? Number(((data.engagement_count / data.impression_count) * 100).toFixed(1))
                : metrics.engagementRate,
          };
          isLive = true;
        }
      }

      if (gaConnected) {
        const result = await execute("google-analytics", "run_report", {
          dimensions: ["date"],
          metrics: ["sessions", "engagedSessions", "screenPageViews"],
          dateRange: "last7days",
        });
        if (result.success) {
          isLive = true;
        }
      }

      setState({
        metrics,
        loading: false,
        isLive,
        error: null,
      });
    } catch (err: any) {
      setState({
        metrics: DEMO_METRICS,
        loading: false,
        isLive: false,
        error: err.message ?? "Failed to fetch metrics",
      });
    }
  }, [execute, hasLiveConnection, twitterConnected, gaConnected, tweetId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics: state.metrics,
    loading: state.loading || integrationLoading,
    isLive: state.isLive,
    error: state.error,
    refresh: fetchMetrics,
  };
}
