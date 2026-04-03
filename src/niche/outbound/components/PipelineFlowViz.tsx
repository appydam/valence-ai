import { useState } from "react";
import {
  Building2,
  Users,
  Sparkles,
  Database,
  Mail,
  ArrowRight,
} from "lucide-react";
import { useOutboundPipeline, type PipelineStage } from "../hooks/useOutboundPipeline";

const STAGE_ICONS = {
  companies: Building2,
  contacts: Users,
  enriched: Sparkles,
  crm: Database,
  sequences: Mail,
};

interface Props {
  onStageClick?: (stageKey: string) => void;
}

export function PipelineFlowViz({ onStageClick }: Props) {
  const { stages } = useOutboundPipeline();
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  return (
    <div className="w-full">
      {/* Desktop: horizontal flow */}
      <div className="hidden md:flex items-center justify-center gap-0 px-4">
        {stages.map((stage, idx) => (
          <div key={stage.key} className="flex items-center">
            <StageCard
              stage={stage}
              isHovered={hoveredStage === stage.key}
              onMouseEnter={() => setHoveredStage(stage.key)}
              onMouseLeave={() => setHoveredStage(null)}
              onClick={() => onStageClick?.(stage.key)}
            />
            {idx < stages.length - 1 && (
              <div className="flex items-center px-1">
                <div className="relative w-12 h-[2px]">
                  <div className="absolute inset-0 bg-border/30 rounded-full" />
                  {(stages[idx].count > 0 || stages[idx].isActive) && (
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                      style={{
                        width: stages[idx + 1].count > 0 ? "100%" : stages[idx].isActive ? "50%" : "0%",
                        background: `linear-gradient(90deg, ${stage.color}, ${stages[idx + 1].color})`,
                      }}
                    />
                  )}
                  {stages[idx].isActive && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-flow-particle"
                      style={{ background: stage.color, boxShadow: `0 0 8px ${stage.color}` }}
                    />
                  )}
                </div>
                <ArrowRight className="w-3 h-3 text-border/40" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical flow */}
      <div className="md:hidden space-y-3 px-4">
        {stages.map((stage, idx) => (
          <div key={stage.key}>
            <StageCard
              stage={stage}
              isHovered={hoveredStage === stage.key}
              onMouseEnter={() => setHoveredStage(stage.key)}
              onMouseLeave={() => setHoveredStage(null)}
              onClick={() => onStageClick?.(stage.key)}
            />
            {idx < stages.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="w-[2px] h-6 bg-border/30 relative">
                  {stages[idx].isActive && (
                    <div
                      className="absolute inset-x-0 top-0 rounded-full animate-pulse"
                      style={{ height: "100%", background: stage.color }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes flowParticle {
          0% { left: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: calc(100% - 8px); opacity: 0; }
        }
        .animate-flow-particle {
          animation: flowParticle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function StageCard({
  stage,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  stage: PipelineStage;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}) {
  const Icon = STAGE_ICONS[stage.key as keyof typeof STAGE_ICONS] ?? Building2;
  const hasData = stage.count > 0;
  const isActive = stage.isActive;

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        relative flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border-2 transition-all duration-300 min-w-[120px]
        ${isHovered ? "scale-105 shadow-lg" : ""}
        ${isActive ? "shadow-md" : ""}
      `}
      style={{
        borderColor: hasData || isActive ? stage.color : "hsl(0,0%,18%)",
        background: hasData || isActive ? stage.bgColor : "hsl(0,0%,7%)",
      }}
    >
      {isActive && (
        <div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
          style={{ background: stage.color, boxShadow: `0 0 10px ${stage.color}` }}
        />
      )}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
        style={{ background: hasData || isActive ? `${stage.color}25` : "hsl(0,0%,12%)" }}
      >
        <Icon
          className="w-5 h-5 transition-colors"
          style={{ color: hasData || isActive ? stage.color : "hsl(0,0%,30%)" }}
        />
      </div>
      <div className="text-center">
        <p
          className="text-2xl font-bold leading-none transition-colors"
          style={{ color: hasData ? stage.color : "hsl(0,0%,30%)" }}
        >
          {stage.count}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium uppercase tracking-wider">
          {stage.label}
        </p>
      </div>
    </button>
  );
}
