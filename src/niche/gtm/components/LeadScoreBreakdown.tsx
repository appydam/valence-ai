import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";

interface ScoreComponent {
  label: string;
  weight: string;
  score: number;
  reasoning: string;
}

interface LeadScoreBreakdownProps {
  leadName: string;
  overallScore: number;
  components?: ScoreComponent[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return "hsl(142, 71%, 45%)";
  if (score >= 50) return "hsl(38, 92%, 50%)";
  return "hsl(0, 84%, 60%)";
}

export function LeadScoreBreakdown({
  leadName,
  overallScore,
  components,
}: LeadScoreBreakdownProps) {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const [rescoring, setRescoring] = useState(false);
  const [scoreComponents, setScoreComponents] = useState<ScoreComponent[] | undefined>(components);

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (overallScore / 100) * circumference;
  const scoreColor = getScoreColor(overallScore);

  const handleRescore = async () => {
    setRescoring(true);
    await triggerAgent(
      "Scout",
      `Re-score lead: ${leadName}`,
      `Re-evaluate the lead score for ${leadName}. Analyze their ICP fit, intent signals, engagement history, and timing factors. Return an updated score breakdown with reasoning for each component.`,
      ["niche:gtm", "lead-scoring"]
    );
    setRescoring(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Lead Score Breakdown</h3>
        <button
          onClick={handleRescore}
          disabled={rescoring || agentLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
        >
          {rescoring ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          Re-score
        </button>
      </div>

      <div className="flex items-start gap-6">
        {/* Circular gauge */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(0,0%,20%)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-foreground">{overallScore}</span>
              <span className="text-[9px] text-muted-foreground">/ 100</span>
            </div>
          </div>
          <p
            className="text-[10px] font-semibold mt-1"
            style={{ color: scoreColor }}
          >
            {overallScore >= 80 ? "Hot Lead" : overallScore >= 50 ? "Warm Lead" : "Cold Lead"}
          </p>
        </div>

        {/* Breakdown bars or empty state */}
        <div className="flex-1 space-y-3">
          {scoreComponents && scoreComponents.length > 0 ? (
            scoreComponents.map((comp) => {
              const barColor = getScoreColor(comp.score);
              return (
                <div key={comp.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{comp.label}</span>
                      <span className="text-[10px] text-muted-foreground">({comp.weight})</span>
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{ color: barColor }}
                    >
                      {comp.score}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-accent/30 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${comp.score}%`,
                        background: barColor,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                    {comp.reasoning}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <p className="text-xs text-muted-foreground mb-2">No score breakdown available</p>
              <p className="text-[10px] text-muted-foreground">
                Click "Re-score" to have Scout AI analyze this lead
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
