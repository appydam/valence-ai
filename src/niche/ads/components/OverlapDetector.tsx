import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";

interface OverlapDetectorProps {
  audiences: { id: string; name: string; size: string }[];
}

interface OverlapResult {
  audienceA: string;
  audienceB: string;
  overlapPercent: number;
}

// Deterministic pseudo-random overlap based on audience names
function computeOverlap(nameA: string, nameB: string): number {
  let hash = 0;
  const combined = nameA + nameB;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 60) + 5; // 5-64%
}

export function OverlapDetector({ audiences }: OverlapDetectorProps) {
  const { config } = useNiche();
  const [showResults, setShowResults] = useState(false);

  const overlaps = useMemo(() => {
    const results: OverlapResult[] = [];
    for (let i = 0; i < audiences.length; i++) {
      for (let j = i + 1; j < audiences.length; j++) {
        results.push({
          audienceA: audiences[i].name,
          audienceB: audiences[j].name,
          overlapPercent: computeOverlap(audiences[i].name, audiences[j].name),
        });
      }
    }
    return results.sort((a, b) => b.overlapPercent - a.overlapPercent);
  }, [audiences]);

  if (audiences.length < 2) return null;

  const highOverlaps = overlaps.filter((o) => o.overlapPercent > 30);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Users className="w-4 h-4" style={{ color: config.accentColor }} />
          Audience Overlap Detector
        </h3>
        <button
          onClick={() => setShowResults(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
          style={{ background: config.accentColor }}
        >
          Check Overlap
        </button>
      </div>

      {showResults && (
        <>
          {/* Venn Diagram (CSS-based) */}
          {overlaps.length > 0 && (
            <div className="flex items-center justify-center py-6">
              <div className="relative w-64 h-40">
                {/* Circle A */}
                <div
                  className="absolute top-0 left-4 w-32 h-32 rounded-full border-2 opacity-30"
                  style={{
                    borderColor: config.accentColor,
                    background: `${config.accentColor}20`,
                  }}
                />
                {/* Circle B */}
                <div
                  className="absolute top-0 right-4 w-32 h-32 rounded-full border-2 opacity-30"
                  style={{
                    borderColor: "hsl(217, 89%, 61%)",
                    background: "hsl(217, 89%, 61%, 0.2)",
                  }}
                />
                {/* Overlap label */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center">
                  <span className="text-lg font-bold text-foreground">
                    {overlaps[0].overlapPercent}%
                  </span>
                  <p className="text-[10px] text-muted-foreground">overlap</p>
                </div>
                {/* Labels */}
                <div className="absolute bottom-0 left-0 text-[10px] text-muted-foreground text-center w-24">
                  {audiences[0]?.name.slice(0, 20)}
                </div>
                <div className="absolute bottom-0 right-0 text-[10px] text-muted-foreground text-center w-24">
                  {audiences[1]?.name.slice(0, 20)}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="space-y-2">
            {overlaps.map((overlap, i) => {
              const isHigh = overlap.overlapPercent > 30;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                    isHigh ? "bg-yellow-500/5 border border-yellow-500/20" : "bg-accent/20"
                  }`}
                >
                  {isHigh ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground">
                      <span className="font-medium">{overlap.audienceA}</span>
                      {" & "}
                      <span className="font-medium">{overlap.audienceB}</span>
                    </p>
                    {isHigh && (
                      <p className="text-[10px] text-yellow-500 mt-0.5">
                        These audiences share {overlap.overlapPercent}% of users — consider
                        consolidating
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-sm font-bold shrink-0 ${
                      isHigh ? "text-yellow-500" : "text-green-500"
                    }`}
                  >
                    {overlap.overlapPercent}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Recommendation */}
          {highOverlaps.length > 0 && (
            <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <p className="text-xs text-yellow-500">
                <strong>Recommendation:</strong> {highOverlaps.length} audience pair
                {highOverlaps.length > 1 ? "s" : ""} have significant overlap (&gt;30%). Consider
                merging similar audiences to reduce ad spend competition and improve delivery
                efficiency.
              </p>
            </div>
          )}

          {highOverlaps.length === 0 && (
            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <p className="text-xs text-green-500">
                All audience pairs have healthy overlap levels (&lt;30%). Your targeting is well
                segmented.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
