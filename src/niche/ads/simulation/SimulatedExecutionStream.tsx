import { Link } from "react-router-dom";
import { useSimulatedStream } from "./simulationStream";
import { SIM_STREAM_ITEMS } from "./simulationData";
import {
  Brain,
  Search,
  Zap,
  CheckCircle2,
  Loader2,
  FileText,
  BarChart3,
  PenTool,
  Image as ImageIcon,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Rocket,
  Activity,
  Settings,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const AGENT_CONFIG: Record<string, { color: string; emoji: string; role: string }> = {
  Kaze: { color: "#a855f7", emoji: "🎯", role: "Strategy Lead" },
  Scout: { color: "#3b82f6", emoji: "🔍", role: "Research Analyst" },
  Ghost: { color: "#22c55e", emoji: "✍️", role: "Creative Director" },
  Forge: { color: "#f59e0b", emoji: "⚡", role: "Technical Ops" },
};

const TYPE_ICONS: Record<string, any> = {
  thinking: Brain,
  api_call: Zap,
  decision: BarChart3,
  deliverable: FileText,
  research: Search,
  analysis: BarChart3,
  creative_preview: ImageIcon,
  launch: Rocket,
  monitoring: Activity,
  optimization: Settings,
};

const TYPE_LABELS: Record<string, string> = {
  thinking: "Analyzing",
  api_call: "API Call",
  decision: "Decision",
  deliverable: "Deliverable",
  research: "Research",
  analysis: "Analysis",
  creative_preview: "AI Creative",
  launch: "Campaign Launch",
  monitoring: "Live Monitoring",
  optimization: "AI Optimization",
};

/** Render markdown-like tables and bold text */
function RichContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  const flushTable = () => {
    if (tableRows.length === 0) return;
    elements.push(
      <div key={`table-${elements.length}`} className="my-3 rounded-xl border border-border/20 overflow-hidden bg-background/30">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-muted/40 border-b border-border/20">
              {tableRows[0].map((cell, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold text-foreground/60 text-[10px] uppercase tracking-wider">{cell.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(1).filter(r => !r.every(c => c.match(/^[-|: ]+$/))).map((row, i) => (
              <tr key={i} className="border-t border-border/10 hover:bg-muted/20 transition-colors">
                {row.map((cell, j) => {
                  const trimmed = cell.trim();
                  const isPositive = trimmed.startsWith("+") || trimmed.startsWith("↑") || trimmed.includes("✅");
                  const isNegative = trimmed.startsWith("-") || trimmed.startsWith("↓");
                  return (
                    <td key={j} className={`px-3 py-2 ${isPositive ? "text-green-400 font-medium" : isNegative ? "text-red-400" : "text-foreground/70"}`}>
                      {trimmed}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
  };

  lines.forEach((line, i) => {
    if (line.startsWith("|")) {
      inTable = true;
      tableRows.push(line.split("|").filter(Boolean));
    } else {
      if (inTable) { flushTable(); inTable = false; }
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
        }
        return <span key={j}>{part}</span>;
      });
      if (line.trim()) {
        elements.push(<div key={`line-${i}`} className="leading-relaxed">{rendered}</div>);
      } else {
        elements.push(<div key={`line-${i}`} className="h-2" />);
      }
    }
  });
  if (inTable) flushTable();

  return <>{elements}</>;
}

/** Metric card for monitoring phase */
function MetricCard({ label, value, change, up }: { label: string; value: string; change: string; up: boolean }) {
  return (
    <div className="flex-1 min-w-[100px] px-3 py-2.5 rounded-xl bg-background/40 border border-border/20">
      <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-lg font-bold text-foreground leading-none">{value}</p>
      <p className={`text-[10px] mt-1 flex items-center gap-0.5 ${up ? "text-green-400" : "text-muted-foreground/40"}`}>
        {up && change !== "Collecting..." && <ArrowUpRight className="w-2.5 h-2.5" />}
        {change}
      </p>
    </div>
  );
}

export function SimulatedExecutionStream() {
  const { visibleItems, isComplete } = useSimulatedStream(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [visibleItems.length]);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  // Determine current phase
  const currentPhase = [...visibleItems].reverse().find(i => i.phase)?.phase || "Starting...";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Stream Header */}
      <div className="shrink-0 px-5 py-3.5 border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Rocket className="w-5 h-5 text-purple-400" />
              {!isComplete && (
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse ring-2 ring-card" />
              )}
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-foreground tracking-tight">
                Launch MAISON Summer Campaign
              </h3>
              <p className="text-[11px] text-muted-foreground/60">
                {isComplete ? "Campaign launched and optimized" : currentPhase}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              {Object.entries(AGENT_CONFIG)
                .filter(([name]) => visibleItems.some((i) => i.agentName === name))
                .map(([name, cfg]) => (
                  <div
                    key={name}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 border-card shadow-sm"
                    style={{ background: `${cfg.color}20` }}
                    title={`${name} — ${cfg.role}`}
                  >
                    {cfg.emoji}
                  </div>
                ))}
            </div>
            <div className="text-[10px] text-muted-foreground/40 font-mono tabular-nums bg-muted/30 px-2 py-1 rounded-md">
              {formatElapsed(elapsedSeconds)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 rounded-full bg-muted/20 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.min((visibleItems.length / SIM_STREAM_ITEMS.length) * 100, 100)}%`,
              background: "linear-gradient(90deg, #a855f7, #3b82f6, #22c55e, #f59e0b)",
            }}
          />
        </div>
      </div>

      {/* Stream Items */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {visibleItems.map((item, idx) => {
          const Icon = TYPE_ICONS[item.type] || Brain;
          const agent = AGENT_CONFIG[item.agentName] || { color: "#888", emoji: "🤖", role: "Agent" };

          // Phase separator
          const showPhase = item.phase && (idx === 0 || visibleItems[idx - 1]?.phase !== item.phase);

          // Agent transition
          const showAgent = idx === 0 || visibleItems[idx - 1]?.agentName !== item.agentName;

          return (
            <div key={item.id} className="animate-[slideUp_0.5s_ease-out]">
              {/* Phase header */}
              {showPhase && (() => {
                const phaseConfig: Record<string, { icon: string; color: string; sub: string; step: number }> = {
                  "Strategy & Planning": { icon: "🎯", color: "#a855f7", sub: "Analyzing market, audience, and budget strategy", step: 1 },
                  "Competitor Research": { icon: "🔍", color: "#3b82f6", sub: "Studying Zara, Reformation, and Everlane ad strategies", step: 2 },
                  "AI Creative Generation": { icon: "🎨", color: "#8b5cf6", sub: "Designing ad creatives using MAISON brand guidelines", step: 3 },
                  "Campaign Launch": { icon: "🚀", color: "#22c55e", sub: "Deploying campaigns to Google Ads and Meta Ads", step: 4 },
                  "Performance Monitoring": { icon: "📊", color: "#3b82f6", sub: "Tracking live metrics and collecting performance data", step: 5 },
                  "AI Optimization": { icon: "⚡", color: "#f59e0b", sub: "Auto-adjusting budgets, bids, and keywords for best ROAS", step: 6 },
                };
                const pc = phaseConfig[item.phase!] || { icon: "▶", color: "#888", sub: "", step: 0 };
                return (
                  <div className="my-5 first:mt-0 animate-[scaleIn_0.5s_ease-out]">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent" style={{ backgroundImage: `linear-gradient(to right, transparent, ${pc.color}30)` }} />
                      <div
                        className="flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${pc.color}08, ${pc.color}04)`,
                          borderColor: `${pc.color}25`,
                          boxShadow: `0 4px 24px ${pc.color}08`,
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                          style={{ background: `${pc.color}15`, border: `1px solid ${pc.color}20` }}
                        >
                          {pc.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: `${pc.color}80` }}>
                              Step {pc.step}
                            </span>
                          </div>
                          <p className="text-[13px] font-bold text-foreground leading-tight">{item.phase}</p>
                          <p className="text-[10px] text-muted-foreground/50 mt-0.5">{pc.sub}</p>
                        </div>
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent" style={{ backgroundImage: `linear-gradient(to left, transparent, ${pc.color}30)` }} />
                    </div>
                  </div>
                );
              })()}

              {/* Agent header */}
              {showAgent && (
                <div className="flex items-center gap-2.5 mb-2 mt-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm"
                    style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}
                  >
                    {agent.emoji}
                  </div>
                  <div>
                    <span className="text-[13px] font-bold" style={{ color: agent.color }}>{item.agentName}</span>
                    <span className="text-[10px] text-muted-foreground/30 ml-2">{agent.role}</span>
                  </div>
                  <div className="flex-1 h-px bg-border/10" />
                </div>
              )}

              {/* ──── CREATIVE PREVIEW CARD ──── */}
              {item.type === "creative_preview" ? (
                item.imageUrl?.endsWith(".mp4") ? (
                  /* Video creative — vertical card with inline player */
                  <div className="rounded-xl overflow-hidden border border-purple-500/20 bg-card/50 shadow-lg shadow-purple-500/5 animate-[scaleIn_0.4s_ease-out] max-w-xs">
                    <div className="relative">
                      <video
                        src={item.imageUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-56 object-cover"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className="text-[7px] font-bold uppercase bg-purple-500 text-white px-1.5 py-0.5 rounded-full">
                          AI Video
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="text-[8px] bg-black/50 text-white/80 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                          {item.platform}
                        </span>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-2.5 pt-6">
                        <p className="text-[12px] font-bold text-white leading-tight">{item.headline}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-[9px] text-muted-foreground/50">9:16 Vertical</span>
                      {item.cta && (
                        <span className="text-[10px] font-semibold text-purple-400">{item.cta}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Image creative — horizontal card */
                  <div className="rounded-xl overflow-hidden border border-purple-500/15 bg-card/50 shadow-sm animate-[scaleIn_0.4s_ease-out] max-w-md">
                    <div className="flex">
                      {item.imageUrl && (
                        <div className="relative w-36 shrink-0">
                          <img src={item.imageUrl} alt={item.headline || ""} className="w-full h-full object-cover" />
                          <div className="absolute top-1.5 left-1.5">
                            <span className="text-[7px] font-bold uppercase tracking-wider bg-purple-500 text-white px-1.5 py-0.5 rounded-full">
                              AI
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div>
                          {item.headline && (
                            <h4 className="text-[12px] font-bold text-foreground leading-tight mb-1 line-clamp-2">{item.headline}</h4>
                          )}
                          {item.platform && (
                            <p className="text-[9px] text-muted-foreground/50 mb-1.5">{item.platform}</p>
                          )}
                        </div>
                        {item.cta && (
                          <div className="inline-flex items-center self-start gap-1 px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/15 text-purple-400 text-[10px] font-semibold">
                            {item.cta}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ) :

              /* ──── LAUNCH CARD ──── */
              item.type === "launch" ? (
                <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-card shadow-lg shadow-green-500/5 p-4 animate-[scaleIn_0.5s_ease-out]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Rocket className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">Campaign Launched</span>
                    </div>
                    <div className="ml-auto">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-[11px] text-foreground/80 leading-relaxed">
                    <RichContent content={item.content} />
                  </div>
                </div>
              ) :

              /* ──── MONITORING CARD ──── */
              item.type === "monitoring" ? (
                <div className="animate-[slideUp_0.5s_ease-out]">
                  {/* Time elapsed indicator — show between monitoring cards */}
                  {(() => {
                    const monitoringItems = visibleItems.filter(v => v.type === "monitoring");
                    const monIdx = monitoringItems.indexOf(item);
                    if (monIdx > 0) {
                      const config = [
                        null,
                        { time: "4h", label: "4 hours elapsed", sub: "Early performance signals incoming" },
                        { time: "24h", label: "24 hours elapsed", sub: "Full day of data collected" },
                      ][monIdx];
                      if (!config) return null;
                      return (
                        <div className="my-4 animate-[scaleIn_0.5s_ease-out]">
                          <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                              <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center border border-blue-500/20">
                                <span className="text-lg font-bold text-blue-400">{config.time}</span>
                              </div>
                              <div>
                                <p className="text-[13px] font-bold text-blue-300">{config.label}</p>
                                <p className="text-[10px] text-blue-400/50">{config.sub}</p>
                              </div>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-card to-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Live Monitoring</span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] text-green-400 font-medium">LIVE</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-foreground/60 mb-3">{item.content}</p>
                    {item.metrics && (
                      <div className="flex flex-wrap gap-2">
                        {item.metrics.map((m, i) => (
                          <MetricCard key={i} label={m.label} value={m.value} change={m.change} up={m.up} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) :

              /* ──── OPTIMIZATION CARD ──── */
              item.type === "optimization" ? (
                <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-card to-card shadow-lg shadow-amber-500/5 p-4 animate-[scaleIn_0.5s_ease-out]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">AI Auto-Optimization</span>
                  </div>
                  <div className="text-[11px] text-foreground/80 leading-relaxed">
                    <RichContent content={item.content} />
                  </div>
                </div>
              ) :

              /* ──── DELIVERABLE CARD ──── */
              item.type === "deliverable" ? (
                <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/5 via-card to-card shadow-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PenTool className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">Deliverable</span>
                  </div>
                  <div className="text-[11px] text-foreground/80 leading-relaxed">
                    <RichContent content={item.content} />
                  </div>
                </div>
              ) :

              /* ──── API CALL ──── */
              item.type === "api_call" ? (
                <div className="rounded-xl border border-border/15 bg-muted/10 px-4 py-2.5 flex items-center gap-3">
                  <Zap className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                  <code className="text-[10px] font-mono bg-muted/40 px-2 py-0.5 rounded-md text-muted-foreground/60">
                    {item.integrationName}/{item.toolName}
                  </code>
                  <span className="text-[11px] text-muted-foreground/50 flex-1">{item.content}</span>
                  <div className="shrink-0">
                    {item.status === "calling" ? (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10">
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-yellow-500" />
                        <span className="text-[9px] font-medium text-yellow-500">CALLING</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10">
                        <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />
                        <span className="text-[9px] font-medium text-green-500">{item.durationMs}ms</span>
                      </div>
                    )}
                  </div>
                </div>
              ) :

              /* ──── DEFAULT (thinking, decision, research, analysis) ──── */
              (
                <div className={`rounded-xl border border-border/15 bg-card/30 p-3.5 ${
                  item.type === "research" ? "border-blue-500/15 bg-blue-500/[0.03]" : ""
                }`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: `${agent.color}80` }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: `${agent.color}70` }}>
                      {TYPE_LABELS[item.type] || item.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-foreground/70 leading-relaxed">
                    <RichContent content={item.content} />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {!isComplete && visibleItems.length > 0 && (
          <div className="flex items-center gap-3 px-2 py-4">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-400/40 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-blue-400/40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-green-400/40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[11px] text-muted-foreground/30">
              {currentPhase === "AI Creative Generation" ? "Ghost is designing creatives..." :
               currentPhase === "Campaign Launch" ? "Forge is deploying to ad platforms..." :
               currentPhase === "Performance Monitoring" ? "Collecting live performance data..." :
               currentPhase === "AI Optimization" ? "Applying optimizations..." :
               "Agents collaborating..."}
            </span>
          </div>
        )}

        {/* Completion state */}
        {isComplete && (
          <div className="py-8 space-y-5">
            {/* Final metrics */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Campaigns", value: "4", sub: "Launched" },
                { label: "Creatives", value: "4", sub: "AI Generated" },
                { label: "Day 1 ROAS", value: "4.1x", sub: "vs 3.5x target" },
                { label: "Optimized ROAS", value: "4.6x", sub: "+12% uplift" },
              ].map((m) => (
                <div key={m.label} className="text-center px-2 py-3 rounded-xl bg-muted/20 border border-border/10">
                  <p className="text-xl font-bold text-foreground">{m.value}</p>
                  <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider mt-0.5">{m.label}</p>
                  <p className="text-[10px] text-green-400 mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>

            {/* Success banner */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/20 shadow-xl shadow-green-500/5">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-sm font-bold text-green-400">
                  Campaign Successfully Launched & Optimized
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/40 mt-3">
                4 agents collaborated &middot; 5 API calls &middot; 4 creatives generated &middot; 5 auto-optimizations applied
              </p>
            </div>

            {/* Explore links */}
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {[
                { label: "View Campaigns", path: "/niche/ads/campaigns", icon: "📊" },
                { label: "Creative Studio", path: "/niche/ads/creatives", icon: "🎨" },
                { label: "Performance", path: "/niche/ads/insights", icon: "📈" },
                { label: "Keywords", path: "/niche/ads/keywords", icon: "🔍" },
                { label: "Recommendations", path: "/niche/ads/recommendations", icon: "✨" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/20 bg-card/50 text-[11px] text-foreground/60 hover:text-foreground hover:border-border/40 hover:bg-card transition-all"
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
