import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// ─── Agent config ────────────────────────────────────────────────────────────
const AGENTS = [
  { id: "kaze",     emoji: "🌀", name: "Kaze",     color: "hsl(217, 91%, 60%)",  role: "Orchestrator" },
  { id: "scout",    emoji: "🔭", name: "Scout",    color: "hsl(160, 84%, 39%)",  role: "Intelligence" },
  { id: "forge",    emoji: "🔨", name: "Forge",    color: "hsl(38, 92%, 50%)",   role: "Engineering"  },
  { id: "ghost",    emoji: "👻", name: "Ghost",    color: "hsl(258, 90%, 66%)",  role: "Comms"        },
  { id: "sentinel", emoji: "🔍", name: "Sentinel", color: "hsl(330, 81%, 60%)",  role: "QA Guard"     },
];

type AgentId = "kaze" | "scout" | "forge" | "ghost" | "sentinel";
type AgentStatus = "idle" | "thinking" | "running" | "done" | "rejected";

// ─── Execution steps ─────────────────────────────────────────────────────────
interface ExecStep {
  t: number;          // time offset in ms from start
  agent: AgentId;
  status: AgentStatus;
  log: string;
  logDetail?: string;
  tool?: string;
  toolColor?: string;
  apiCall?: string;
}

const STEPS: ExecStep[] = [
  { t: 0,    agent: "kaze",     status: "thinking", log: "Received mission: Build AlgoHouse revenue intelligence brief" },
  { t: 1000, agent: "kaze",     status: "running",  log: "Decomposing into 4 parallel subtasks…", tool: "Linear", toolColor: "#5E6AD2", apiCall: "POST linear.app/graphql" },
  { t: 1800, agent: "kaze",     status: "running",  log: "Squad briefed on #growth channel", tool: "Slack", toolColor: "#4A154B", apiCall: "POST slack.com/chat.postMessage → 200 (78ms)" },
  { t: 2400, agent: "scout",    status: "thinking", log: "Pulling competitor pricing from 3 sources…" },
  { t: 2400, agent: "forge",    status: "thinking", log: "Standing by for benchmark task…" },
  { t: 2400, agent: "ghost",    status: "thinking", log: "Standing by for outreach task…" },
  { t: 3200, agent: "scout",    status: "running",  log: "Fetching Kaiko exchange rankings", tool: "GitHub", toolColor: "#e2e8f0", apiCall: "GET kaiko.com/exchange-ranking → 200 (445ms)" },
  { t: 4000, agent: "scout",    status: "running",  log: "Writing competitive matrix", tool: "Sheets", toolColor: "#34A853", apiCall: "POST sheets.googleapis.com/values → 200 (156ms)" },
  { t: 4400, agent: "forge",    status: "running",  log: "Creating benchmark repo", tool: "GitHub", toolColor: "#e2e8f0", apiCall: "POST github.com/user/repos → 201 (243ms)" },
  { t: 5200, agent: "forge",    status: "running",  log: "Pushed 847 lines — benchmark.ipynb", tool: "GitHub", toolColor: "#e2e8f0", apiCall: "POST github.com/repos/commits → 201 (312ms)" },
  { t: 5800, agent: "scout",    status: "done",     log: "✓ Kaiko $28.5k avg deal · 200+ clients found", logDetail: "Research complete" },
  { t: 6000, agent: "forge",    status: "done",     log: "✓ Repo live: algohouse/benchmark", logDetail: "Linear issue closed" },
  { t: 6400, agent: "ghost",    status: "running",  log: "Drafting 10 personalized outreach emails", tool: "HubSpot", toolColor: "#FF7A59", apiCall: "POST hubspot.com/contacts → 201 (312ms)" },
  { t: 7200, agent: "ghost",    status: "running",  log: "Writing 4,200-word research report", tool: "Notion", toolColor: "#8B8B8B", apiCall: "POST notion.so/v1/pages → 201 (267ms)" },
  { t: 7800, agent: "ghost",    status: "running",  log: "Drafts staged in Gmail — 10 emails", tool: "Gmail", toolColor: "#EA4335", apiCall: "POST gmail.googleapis.com/v1/draft → 201 (198ms)" },
  { t: 8200, agent: "sentinel", status: "thinking", log: "Initiating QA review of all deliverables…" },
  { t: 9000, agent: "sentinel", status: "running",  log: "Benchmark notebook: PASS 8.4/10" },
  { t: 9500, agent: "sentinel", status: "running",  log: "Research report: PASS 9.1/10" },
  { t: 10000,agent: "sentinel", status: "rejected", log: "⚠ Emails: REJECTED — 3 too generic", logDetail: "Requesting Ghost rework" },
  { t: 10000,agent: "ghost",    status: "rejected", log: "Rework requested: 3 emails flagged" },
  { t: 10800,agent: "ghost",    status: "running",  log: "Reworking emails with Kaiko-specific data", tool: "Gmail", toolColor: "#EA4335", apiCall: "PATCH gmail.googleapis.com/v1/draft → 200 (198ms)" },
  { t: 11600,agent: "ghost",    status: "done",     log: "✓ Emails updated · Sentinel re-review: PASS 8.9/10" },
  { t: 11600,agent: "sentinel", status: "done",     log: "✓ All deliverables approved" },
  { t: 12200,agent: "kaze",     status: "running",  log: "Pipeline activated — booking demo calls", tool: "Calendar", toolColor: "#4285F4", apiCall: "POST calendar.google.com/v3/events → 201 (203ms)" },
  { t: 12800,agent: "kaze",     status: "running",  log: "$240k pipeline qualified in HubSpot", tool: "HubSpot", toolColor: "#FF7A59", apiCall: "PATCH hubspot.com/crm/v3/objects/deals → 200 (189ms)" },
  { t: 13400,agent: "kaze",     status: "done",     log: "✓ MISSION COMPLETE — Revenue engine live", logDetail: "$240k pipeline · 3 demos booked · 50 firms scored" },
];

const TOTAL_DURATION = 13400;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getAgentFinalStatus(agentId: AgentId, elapsedMs: number): AgentStatus {
  const fired = STEPS.filter(s => s.agent === agentId && s.t <= elapsedMs);
  if (fired.length === 0) return "idle";
  return fired[fired.length - 1].status;
}

function getActiveSteps(elapsedMs: number) {
  return STEPS.filter(s => s.t <= elapsedMs);
}

// ─── Agent status card ───────────────────────────────────────────────────────
function AgentStatusCard({ agent, status, currentAction }: {
  agent: typeof AGENTS[0];
  status: AgentStatus;
  currentAction?: string;
}) {
  const isActive = status === "running" || status === "thinking";
  const isDone = status === "done";
  const isRejected = status === "rejected";

  return (
    <div
      className="flex flex-col gap-1.5 px-3 py-2.5 rounded-xl transition-all duration-500 relative overflow-hidden"
      style={{
        background: isActive
          ? `${agent.color.replace("hsl(", "hsla(").replace(")", ", 0.08)")}`
          : isDone
          ? "hsl(142 71% 45% / 0.06)"
          : isRejected
          ? "hsl(0 84% 60% / 0.06)"
          : "hsl(240 25% 6%)",
        border: `1px solid ${
          isActive
            ? agent.color.replace("hsl(", "hsla(").replace(")", ", 0.4)")
            : isDone
            ? "hsl(142 71% 45% / 0.3)"
            : isRejected
            ? "hsl(0 84% 60% / 0.3)"
            : "hsl(var(--border))"
        }`,
      }}
    >
      {/* Pulsing glow when active */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none animate-pulse"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${agent.color.replace("hsl(", "hsla(").replace(")", ", 0.12)")} 0%, transparent 70%)`,
          }}
        />
      )}

      <div className="flex items-center gap-2 relative z-10">
        <span className="text-base leading-none">{agent.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold" style={{ color: isActive ? agent.color : isDone ? "hsl(142 71% 45%)" : isRejected ? "hsl(0 84% 60%)" : "hsl(var(--muted-foreground))" }}>
              {agent.name}
            </span>
            {/* Status dot */}
            <div
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? "animate-pulse" : ""}`}
              style={{
                background: isActive
                  ? agent.color
                  : isDone
                  ? "hsl(142 71% 45%)"
                  : isRejected
                  ? "hsl(0 84% 60%)"
                  : "hsl(var(--muted-foreground) / 0.2)",
              }}
            />
          </div>
          <div className="text-[9px] text-muted-foreground/50">{agent.role}</div>
        </div>
        <div
          className="text-[9px] font-mono px-1.5 py-0.5 rounded flex-shrink-0"
          style={{
            background: isActive
              ? agent.color.replace("hsl(", "hsla(").replace(")", ", 0.15)")
              : isDone
              ? "hsl(142 71% 45% / 0.15)"
              : isRejected
              ? "hsl(0 84% 60% / 0.15)"
              : "hsl(var(--muted-foreground) / 0.08)",
            color: isActive
              ? agent.color
              : isDone
              ? "hsl(142 71% 45%)"
              : isRejected
              ? "hsl(0 84% 60%)"
              : "hsl(var(--muted-foreground) / 0.4)",
          }}
        >
          {status === "thinking" ? "THINKING" : status === "running" ? "RUNNING" : status === "done" ? "DONE" : status === "rejected" ? "REWORK" : "IDLE"}
        </div>
      </div>

      {/* Current action text */}
      {isActive && currentAction && (
        <div className="text-[9px] text-muted-foreground/60 font-mono truncate relative z-10 pl-6">
          {currentAction}
        </div>
      )}
    </div>
  );
}

// ─── Log entry ───────────────────────────────────────────────────────────────
function LogEntry({ step, index }: { step: ExecStep; index: number }) {
  const agent = AGENTS.find(a => a.id === step.agent)!;
  const isSuccess = step.status === "done";
  const isReject = step.status === "rejected";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex gap-2.5 group"
    >
      {/* Agent emoji + vertical line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
          style={{
            background: isSuccess
              ? "hsl(142 71% 45% / 0.15)"
              : isReject
              ? "hsl(0 84% 60% / 0.12)"
              : `${agent.color.replace("hsl(", "hsla(").replace(")", ", 0.12)")}`,
            border: `1px solid ${isSuccess ? "hsl(142 71% 45% / 0.4)" : isReject ? "hsl(0 84% 60% / 0.3)" : agent.color.replace("hsl(", "hsla(").replace(")", ", 0.3)")}`,
          }}
        >
          {agent.emoji}
        </div>
        {index > 0 && (
          <div className="w-px flex-1 mt-0.5" style={{ background: `${agent.color.replace("hsl(", "hsla(").replace(")", ", 0.08)")}}`, minHeight: 4 }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-2">
        <div className="flex items-start gap-2 flex-wrap">
          <span
            className="text-[10px] font-bold flex-shrink-0"
            style={{
              color: isSuccess
                ? "hsl(142 71% 45%)"
                : isReject
                ? "hsl(0 84% 60%)"
                : agent.color,
            }}
          >
            {agent.name}
          </span>
          <span className="text-[11px] text-foreground/80 leading-tight">{step.log}</span>
        </div>

        {/* Tool chip + API call on same line */}
        {(step.tool || step.logDetail) && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {step.tool && step.toolColor && (
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  background: `${step.toolColor}18`,
                  border: `1px solid ${step.toolColor}40`,
                  color: step.toolColor === "#e2e8f0" ? "#e2e8f0" : step.toolColor,
                }}
              >
                {step.tool}
              </span>
            )}
            {step.apiCall && (
              <span className="text-[9px] font-mono text-muted-foreground/35">
                {step.apiCall}
              </span>
            )}
            {step.logDetail && !step.apiCall && (
              <span className="text-[9px] text-muted-foreground/40 font-mono">
                {step.logDetail}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function WorkflowDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-80px" });

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [apiCount, setApiCount] = useState(0);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const startSimulation = () => {
    setElapsed(0);
    setApiCount(0);
    setRunning(true);
    startRef.current = performance.now();

    function tick(now: number) {
      const ms = now - startRef.current;
      setElapsed(ms);
      setApiCount(Math.floor(ms / 520));

      if (ms < TOTAL_DURATION + 1500) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
        // restart after pause
        setTimeout(startSimulation, 3000);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (!isInView) {
      cancelAnimationFrame(rafRef.current);
      setRunning(false);
      return;
    }
    startSimulation();
    return () => cancelAnimationFrame(rafRef.current);
  }, [isInView]);

  // Auto-scroll log to top when new entries come in
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = 0;
    }
  }, [getActiveSteps(elapsed).length]);

  const activeSteps = getActiveSteps(elapsed);
  const isDone = elapsed >= TOTAL_DURATION;
  const progress = Math.min((elapsed / TOTAL_DURATION) * 100, 100);

  return (
    <div ref={ref} className="space-y-3">
      {/* ── Agent status bar ── */}
      <div className="grid grid-cols-5 gap-2">
        {AGENTS.map((agent) => {
          const status = getAgentFinalStatus(agent.id as AgentId, elapsed);
          const lastStep = [...STEPS].reverse().find(s => s.agent === agent.id && s.t <= elapsed);
          return (
            <AgentStatusCard
              key={agent.id}
              agent={agent}
              status={status}
              currentAction={lastStep?.log}
            />
          );
        })}
      </div>

      {/* ── Main terminal ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "hsl(240 33% 3%)",
          border: "1px solid hsl(var(--border))",
        }}
      >
        {/* Terminal chrome */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 border-b"
          style={{ borderColor: "hsl(var(--border))", background: "hsl(240 25% 5%)" }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          <span className="ml-3 text-[10px] font-mono tracking-widest text-muted-foreground/50">
            VALENCE AI — ALGOHOUSE REVENUE ENGINE
          </span>
          <div className="ml-auto flex items-center gap-3">
            {/* Progress bar */}
            <div className="w-24 h-1 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: isDone ? "hsl(142 71% 45%)" : "hsl(217 91% 60%)" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${running ? "bg-green-400 animate-pulse" : isDone ? "bg-green-400" : "bg-muted-foreground/30"}`} />
              <span className="text-[10px] font-mono" style={{ color: running ? "hsl(142 71% 45%)" : "hsl(var(--muted-foreground) / 0.5)" }}>
                {isDone ? "COMPLETE" : running ? "RUNNING" : "READY"}
              </span>
            </div>
          </div>
        </div>

        {/* Two-column body */}
        <div className="flex" style={{ minHeight: 380 }}>
          {/* LEFT: Execution log (newest first, scrollable) */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div
              className="px-4 pt-3 pb-1 flex items-center gap-2 border-b"
              style={{ borderColor: "hsl(var(--border) / 0.4)" }}
            >
              <div className="text-[9px] font-mono tracking-widest text-muted-foreground/40">EXECUTION LOG</div>
              <div className="text-[9px] font-mono text-muted-foreground/30">— {activeSteps.length} events</div>
            </div>

            <div
              ref={logRef}
              className="flex-1 px-4 py-3 overflow-y-auto space-y-1.5"
              style={{ maxHeight: 340 }}
            >
              {/* Newest at top */}
              {[...activeSteps].reverse().map((step, i) => (
                <LogEntry key={`${step.t}-${step.agent}-${i}`} step={step} index={i} />
              ))}

              {activeSteps.length === 0 && (
                <div className="text-[10px] text-muted-foreground/30 font-mono pt-4">
                  Waiting for mission to begin...
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Live metrics panel */}
          <div
            className="w-52 flex-shrink-0 flex flex-col border-l"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            {/* Mission timer */}
            <div className="px-4 pt-3 pb-2 border-b" style={{ borderColor: "hsl(var(--border) / 0.4)" }}>
              <div className="text-[9px] font-mono text-muted-foreground/40 tracking-widest mb-1">ELAPSED</div>
              <div className="text-2xl font-mono font-bold tabular-nums text-foreground/80">
                {String(Math.floor(elapsed / 60000)).padStart(2, "0")}:
                {String(Math.floor((elapsed % 60000) / 1000)).padStart(2, "0")}
              </div>
            </div>

            {/* Live counters */}
            <div className="px-4 py-3 space-y-3 border-b" style={{ borderColor: "hsl(var(--border) / 0.4)" }}>
              {[
                { label: "API calls made", value: Math.min(apiCount, 26), color: "hsl(217, 91%, 60%)" },
                { label: "Tasks created", value: Math.min(Math.floor(elapsed / 1800), 12), color: "hsl(38, 92%, 50%)" },
                { label: "Deliverables", value: Math.min(Math.floor(elapsed / 3500), 4), color: "hsl(160, 84%, 39%)" },
                { label: "QA passes", value: elapsed >= 9000 ? (elapsed >= 11600 ? 5 : 4) : 0, color: "hsl(142, 71%, 45%)" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono text-muted-foreground/50">{m.label}</span>
                    <span className="text-xs font-mono font-bold tabular-nums" style={{ color: m.color }}>{m.value}</span>
                  </div>
                  <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: m.color }}
                      animate={{ width: `${Math.min((m.value / (m.label === "API calls made" ? 26 : m.label === "Tasks created" ? 12 : m.label === "Deliverables" ? 4 : 5)) * 100, 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Active integrations */}
            <div className="px-4 py-3 flex-1">
              <div className="text-[9px] font-mono text-muted-foreground/40 tracking-widest mb-2">INTEGRATIONS CALLED</div>
              <div className="flex flex-wrap gap-1">
                {[
                  { name: "Linear",   color: "#5E6AD2", activeAt: 1000  },
                  { name: "Slack",    color: "#4A154B", activeAt: 1800  },
                  { name: "GitHub",   color: "#e2e8f0", activeAt: 3200  },
                  { name: "Sheets",   color: "#34A853", activeAt: 4000  },
                  { name: "HubSpot",  color: "#FF7A59", activeAt: 6400  },
                  { name: "Notion",   color: "#8B8B8B", activeAt: 7200  },
                  { name: "Gmail",    color: "#EA4335", activeAt: 7800  },
                  { name: "Calendar", color: "#4285F4", activeAt: 12200 },
                ].map((intg) => (
                  <AnimatePresence key={intg.name}>
                    {elapsed >= intg.activeAt && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                        style={{
                          background: `${intg.color}15`,
                          border: `1px solid ${intg.color}40`,
                          color: intg.color === "#e2e8f0" ? "#c8d1e0" : intg.color,
                        }}
                      >
                        {intg.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                ))}
              </div>
            </div>

            {/* Mission outcome */}
            <AnimatePresence>
              {isDone && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-3 mb-3 px-3 py-2.5 rounded-xl"
                  style={{
                    background: "hsl(142 71% 45% / 0.1)",
                    border: "1px solid hsl(142 71% 45% / 0.35)",
                  }}
                >
                  <div className="text-[9px] text-green-400/60 font-mono mb-1">OUTCOME</div>
                  <div className="text-green-400 text-xs font-bold leading-tight">$240k pipeline</div>
                  <div className="text-green-400/70 text-[10px]">3 demos booked</div>
                  <div className="text-green-400/70 text-[10px]">50 firms scored</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
