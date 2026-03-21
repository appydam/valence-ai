import { useNiche } from "../../framework/NicheContext";

interface SeoScorecardProps {
  score: number; // 0-100
}

export function SeoScorecard({ score }: SeoScorecardProps) {
  const { config } = useNiche();

  const getColor = () => {
    if (score >= 70) return "hsl(142, 71%, 45%)";
    if (score >= 40) return "hsl(38, 92%, 50%)";
    return "hsl(0, 84%, 60%)";
  };

  const getLabel = () => {
    if (score >= 70) return "Good";
    if (score >= 40) return "Needs Work";
    return "Poor";
  };

  const color = getColor();

  // SVG circular gauge
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="hsl(0, 0%, 20%)"
            strokeWidth="8"
          />
          {/* Score arc */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {score}
          </span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>
      <span className="text-xs font-medium mt-2" style={{ color }}>
        {getLabel()}
      </span>
      <span className="text-[10px] text-muted-foreground mt-0.5">SEO Score</span>
    </div>
  );
}
