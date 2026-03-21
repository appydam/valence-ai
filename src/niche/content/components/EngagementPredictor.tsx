import { useState, useMemo } from "react";
import {
  Gauge,
  Clock,
  Hash,
  Type,
  Target,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";

interface EngagementPredictorProps {
  text: string;
  platform: "twitter" | "linkedin" | "instagram";
  scheduledHour?: number;
}

interface Factor {
  label: string;
  score: number;
  status: "good" | "warning" | "poor";
  reason: string;
  icon: typeof Type;
}

function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-500";
  if (score >= 40) return "text-yellow-500";
  return "text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 70) return "stroke-green-500";
  if (score >= 40) return "stroke-yellow-500";
  return "stroke-red-400";
}

function getStatusIcon(status: "good" | "warning" | "poor") {
  if (status === "good") return CheckCircle2;
  if (status === "warning") return AlertTriangle;
  return XCircle;
}

function getStatusColor(status: "good" | "warning" | "poor") {
  if (status === "good") return "text-green-500";
  if (status === "warning") return "text-yellow-500";
  return "text-red-400";
}

export function EngagementPredictor({
  text,
  platform,
  scheduledHour,
}: EngagementPredictorProps) {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const [optimizing, setOptimizing] = useState(false);

  const factors = useMemo((): Factor[] => {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const hashtagCount = (text.match(/#\w+/g) || []).length;
    const hour = scheduledHour ?? new Date().getHours();

    // Content Length scoring
    let lengthScore: number;
    let lengthStatus: "good" | "warning" | "poor";
    let lengthReason: string;

    if (platform === "twitter") {
      if (wordCount >= 15 && wordCount <= 50) {
        lengthScore = 90;
        lengthStatus = "good";
        lengthReason = "Optimal tweet length";
      } else if (wordCount < 10) {
        lengthScore = 40;
        lengthStatus = "warning";
        lengthReason = "Too short for engagement";
      } else {
        lengthScore = 65;
        lengthStatus = "warning";
        lengthReason = "Consider trimming for Twitter";
      }
    } else if (platform === "linkedin") {
      if (wordCount >= 50 && wordCount <= 300) {
        lengthScore = 85;
        lengthStatus = "good";
        lengthReason = "Great length for LinkedIn";
      } else if (wordCount < 30) {
        lengthScore = 35;
        lengthStatus = "poor";
        lengthReason = "LinkedIn posts perform better with more depth";
      } else {
        lengthScore = 60;
        lengthStatus = "warning";
        lengthReason = "Consider shortening slightly";
      }
    } else {
      if (wordCount >= 20 && wordCount <= 150) {
        lengthScore = 85;
        lengthStatus = "good";
        lengthReason = "Ideal caption length";
      } else if (wordCount < 10) {
        lengthScore = 45;
        lengthStatus = "warning";
        lengthReason = "Add more context to your caption";
      } else {
        lengthScore = 55;
        lengthStatus = "warning";
        lengthReason = "Caption might be too long";
      }
    }

    // Posting Time scoring
    let timeScore: number;
    let timeStatus: "good" | "warning" | "poor";
    let timeReason: string;

    const peakHours = [9, 10, 11, 12, 13, 17, 18, 19];
    const okHours = [8, 14, 15, 16, 20, 21];

    if (peakHours.includes(hour)) {
      timeScore = 90;
      timeStatus = "good";
      timeReason = "Peak engagement time";
    } else if (okHours.includes(hour)) {
      timeScore = 60;
      timeStatus = "warning";
      timeReason = "Decent posting time";
    } else {
      timeScore = 30;
      timeStatus = "poor";
      timeReason = "Low engagement hours";
    }

    // Hashtag scoring
    let hashtagScore: number;
    let hashtagStatus: "good" | "warning" | "poor";
    let hashtagReason: string;

    const idealHashtags = platform === "instagram" ? [5, 15] : [1, 5];

    if (hashtagCount >= idealHashtags[0] && hashtagCount <= idealHashtags[1]) {
      hashtagScore = 85;
      hashtagStatus = "good";
      hashtagReason = "Good hashtag usage";
    } else if (hashtagCount === 0) {
      hashtagScore = 30;
      hashtagStatus = "poor";
      hashtagReason = "Add hashtags for reach";
    } else {
      hashtagScore = 55;
      hashtagStatus = "warning";
      hashtagReason = hashtagCount > idealHashtags[1] ? "Too many hashtags" : "Add more hashtags";
    }

    // Topic relevance (basic heuristic)
    const trendingKeywords = [
      "ai", "startup", "growth", "marketing", "content",
      "strategy", "data", "automation", "brand", "seo",
    ];
    const textLower = text.toLowerCase();
    const matchCount = trendingKeywords.filter((kw) => textLower.includes(kw)).length;
    let topicScore: number;
    let topicStatus: "good" | "warning" | "poor";
    let topicReason: string;

    if (matchCount >= 3) {
      topicScore = 90;
      topicStatus = "good";
      topicReason = "High topic relevance";
    } else if (matchCount >= 1) {
      topicScore = 65;
      topicStatus = "warning";
      topicReason = "Moderate relevance";
    } else {
      topicScore = 35;
      topicStatus = "poor";
      topicReason = "Low trending keyword match";
    }

    return [
      { label: "Content Length", score: lengthScore, status: lengthStatus, reason: lengthReason, icon: Type },
      { label: "Posting Time", score: timeScore, status: timeStatus, reason: timeReason, icon: Clock },
      { label: "Hashtags", score: hashtagScore, status: hashtagStatus, reason: hashtagReason, icon: Hash },
      { label: "Topic Relevance", score: topicScore, status: topicStatus, reason: topicReason, icon: Target },
    ];
  }, [text, platform, scheduledHour]);

  const overallScore = useMemo(() => {
    if (factors.length === 0) return 0;
    return Math.round(factors.reduce((sum, f) => sum + f.score, 0) / factors.length);
  }, [factors]);

  const handleOptimize = async () => {
    setOptimizing(true);
    await triggerAgent(
      "Scout",
      `Optimize ${platform} post for engagement`,
      `Analyze the following ${platform} post and suggest specific improvements to increase engagement:

Post: "${text.slice(0, 500)}"

Current engagement score: ${overallScore}/100
Weak areas: ${factors.filter((f) => f.status !== "good").map((f) => f.label).join(", ")}

Provide: better hashtags, optimal posting time suggestion, content rewrites.`,
      ["niche:content", "optimize"],
      { priority: "high" }
    );
    setOptimizing(false);
  };

  // SVG circular gauge
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Gauge className="w-4 h-4" style={{ color: config.accentColor }} />
        <h3 className="text-sm font-semibold text-foreground">Engagement Predictor</h3>
      </div>

      {/* Circular Gauge */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="hsl(0,0%,20%)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              className={getScoreBg(overallScore)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="space-y-2">
        {factors.map((factor) => {
          const FactorIcon = factor.icon;
          const StatusIconComponent = getStatusIcon(factor.status);
          return (
            <div
              key={factor.label}
              className="flex items-center gap-3 p-2 rounded-lg bg-accent/10"
            >
              <FactorIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">
                    {factor.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {factor.score}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">
                  {factor.reason}
                </p>
              </div>
              <StatusIconComponent
                className={`w-3.5 h-3.5 shrink-0 ${getStatusColor(factor.status)}`}
              />
            </div>
          );
        })}
      </div>

      {/* Optimize Button */}
      <button
        onClick={handleOptimize}
        disabled={optimizing || agentLoading || !text.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-all"
        style={{ background: config.accentColor }}
      >
        {optimizing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Optimizing...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Optimize
          </>
        )}
      </button>
    </div>
  );
}
