import { useNiche } from "../../framework/NicheContext";

interface IcpScorecardProps {
  score: number; // 0-100
}

export function IcpScorecard({ score }: IcpScorecardProps) {
  const { config } = useNiche();

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "Excellent";
    if (s >= 60) return "Good";
    if (s >= 40) return "Fair";
    return "Needs Work";
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return "hsl(142,71%,45%)";
    if (s >= 60) return config.accentColor;
    if (s >= 40) return "hsl(38,92%,50%)";
    return "hsl(0,84%,60%)";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(0,0%,20%)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getScoreColor(score)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{score}</span>
          <span className="text-[10px] text-muted-foreground">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p
          className="text-xs font-semibold"
          style={{ color: getScoreColor(score) }}
        >
          {getScoreLabel(score)}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">ICP Fit Score</p>
      </div>
    </div>
  );
}
