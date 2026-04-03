import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Lock,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Zap,
  Sparkles,
  ArrowRight,
  Star,
  Target,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useOutboundProgress, type StageProgress } from "../hooks/useOutboundProgress";

const STAGE_ROUTES: Record<string, string> = {
  connect: "/integrations",
  companies: "/niche/outbound/companies",
  contacts: "/niche/outbound/contacts",
  enriched: "/niche/outbound/enrichment",
  crm: "/niche/outbound/crm",
  sequences: "/niche/outbound/sequences",
  displace: "/niche/outbound/displace",
};

const STAGE_TIPS: Record<string, string[]> = {
  connect: [
    "Apollo is the #1 priority — it powers contact discovery",
    "HubSpot is required for CRM push and email sequences",
    "Clay and LaGrowthMachine are optional but powerful",
  ],
  companies: [
    "Upload a CSV of target companies, or describe your ideal customer",
    "Scout will search Apollo for matching companies automatically",
    "Try: '50 Series B SaaS companies in the US with 50-200 employees'",
  ],
  contacts: [
    "Scout finds VP/Director-level decision-makers at your target companies",
    "Each contact comes with verified email + LinkedIn URL",
    "Focus on roles that feel the pain your product solves",
  ],
  enriched: [
    "Clay adds phone numbers, company data, and social profiles",
    "Enriched contacts convert 2-3x better than raw leads",
    "Apollo can also enrich if Clay isn't connected",
  ],
  crm: [
    "Forge automatically creates contacts in HubSpot",
    "Contacts are tagged and organized into campaign lists",
    "Your sales team can see everything in their existing CRM",
  ],
  sequences: [
    "Ghost writes personalized emails using your contact data",
    "Each email references the prospect's specific pain points",
    "LinkedIn messages are kept under 300 chars for connection requests",
  ],
  displace: [
    "Enter a competitor name — AI finds their unhappy customers",
    "Reviews from G2/Capterra power the pain-matched messaging",
    "This is the highest-converting outbound strategy",
  ],
};

export function OutboundJourney() {
  const { config } = useNiche();
  const progress = useOutboundProgress();
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Header with level */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-400">{progress.levelName}</span>
            <span className="text-xs text-amber-400/60">{progress.totalXp} XP</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Your Outbound Journey</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Follow the quest map to build your autonomous outbound pipeline
          </p>
        </div>

        {/* Overall progress */}
        <div className="p-5 rounded-2xl border border-border/30 bg-card/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Campaign Progress
            </span>
            <span className="text-sm font-bold" style={{ color: config.accentColor }}>
              {progress.completionPct}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-border/20 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progress.completionPct}%`,
                background: `linear-gradient(90deg, ${config.accentColor}, #22c55e)`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground/50">
              {progress.stages.filter((s) => s.completed).length} of {progress.stages.length} stages complete
            </span>
            {progress.campaignsLaunched > 0 && (
              <span className="text-[10px] text-green-500 font-medium">
                {progress.campaignsLaunched} campaign{progress.campaignsLaunched > 1 ? "s" : ""} launched
              </span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/niche/outbound"
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/30 bg-card/50 hover:bg-card transition-colors"
          >
            <Sparkles className="w-5 h-5" style={{ color: config.accentColor }} />
            <div>
              <p className="text-sm font-medium text-foreground">AI Workspace</p>
              <p className="text-[10px] text-muted-foreground">Describe what you need</p>
            </div>
          </Link>
          <Link
            to="/niche/outbound/displace"
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/30 bg-card/50 hover:bg-card transition-colors"
          >
            <Target className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-sm font-medium text-foreground">Displace Competitor</p>
              <p className="text-[10px] text-muted-foreground">Steal their customers</p>
            </div>
          </Link>
        </div>

        {/* Quest map */}
        <div className="space-y-0">
          {progress.stages.map((stage, idx) => {
            const isExpanded = expandedStage === stage.key;
            const tips = STAGE_TIPS[stage.key] ?? [];
            const route = STAGE_ROUTES[stage.key];
            const isLast = idx === progress.stages.length - 1;

            return (
              <div key={stage.key}>
                {/* Stage card */}
                <button
                  onClick={() => setExpandedStage(isExpanded ? null : stage.key)}
                  className={`
                    w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all text-left
                    ${stage.completed ? "border-green-500/30 bg-green-500/5" :
                      stage.active ? "border-blue-500/30 bg-blue-500/5 shadow-md" :
                      stage.unlocked ? "border-border/30 bg-card/50 hover:bg-card" :
                      "border-border/15 bg-background/30 opacity-50"}
                  `}
                >
                  {/* Status icon */}
                  <div className="relative">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center text-xl
                      ${stage.completed ? "bg-green-500/15" :
                        stage.active ? "bg-blue-500/15" :
                        stage.unlocked ? "bg-accent/20" :
                        "bg-border/10"}
                    `}>
                      {stage.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : stage.active ? (
                        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                      ) : !stage.unlocked ? (
                        <Lock className="w-5 h-5 text-muted-foreground/20" />
                      ) : (
                        <span>{stage.emoji}</span>
                      )}
                    </div>
                    {stage.completed && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Star className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold ${stage.unlocked ? "text-foreground" : "text-muted-foreground/30"}`}>
                        {stage.label}
                      </h3>
                      {stage.xp > 0 && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
                          +{stage.xp} XP
                        </span>
                      )}
                      {stage.active && (
                        <span className="text-[10px] font-medium text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded-full animate-pulse">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${stage.unlocked ? "text-muted-foreground" : "text-muted-foreground/20"}`}>
                      {stage.description}
                    </p>
                    {stage.taskCount > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1 flex-1 max-w-[120px] rounded-full bg-border/20 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-green-500 transition-all duration-500"
                            style={{ width: `${stage.taskCount > 0 ? (stage.completedTaskCount / stage.taskCount) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground/50">
                          {stage.completedTaskCount}/{stage.taskCount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight className={`w-4 h-4 text-muted-foreground/30 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>

                {/* Expanded tips */}
                {isExpanded && stage.unlocked && (
                  <div className="ml-8 mt-2 mb-2 space-y-2 animate-in slide-in-from-top-2">
                    {tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border/20">
                        <Zap className="w-3 h-3 mt-0.5 text-amber-400 shrink-0" />
                        <p className="text-xs text-muted-foreground">{tip}</p>
                      </div>
                    ))}
                    {route && (
                      <Link
                        to={route}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent/20"
                        style={{ color: config.accentColor }}
                      >
                        {stage.completed ? "View" : stage.active ? "Continue" : "Start"} this stage
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                )}

                {/* Connector line */}
                {!isLast && (
                  <div className="flex justify-start ml-10 py-1">
                    <div className={`w-0.5 h-6 rounded-full ${
                      stage.completed ? "bg-green-500/40" :
                      stage.active ? "bg-blue-500/30" :
                      "bg-border/20"
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        {progress.completionPct < 100 && (
          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground/40">
              Complete all stages to reach <span className="text-amber-400 font-medium">Revenue Engine</span> status
            </p>
          </div>
        )}

        {progress.completionPct === 100 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-foreground">You're a Revenue Engine!</h2>
            <p className="text-sm text-muted-foreground mt-1">All stages complete. Launch more campaigns to keep the pipeline flowing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
