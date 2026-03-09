import { useState } from "react";
import {
  Check, X, Loader2, ChevronDown, ChevronRight,
  Copy, ExternalLink, Play, RotateCcw,
} from "lucide-react";

type StepStatus = "pending" | "running" | "done" | "failed" | "skipped";

export type StepData = {
  id: string;
  title: string;
  type: "auto" | "manual" | "semi";
  status: StepStatus;
  completedAt?: number;
  failedReason?: string;
  output?: string;
};

// ─────────────────────────────────────────────────
// Command block with copy
// ─────────────────────────────────────────────────
export function CommandBlock({ label, command }: { label?: string; command: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-1">
      {label && <p className="text-xs font-medium text-muted-foreground">{label}</p>}
      <div className="flex items-start gap-2 bg-background border rounded-lg px-3 py-2 font-mono text-xs text-foreground overflow-x-auto">
        <pre className="flex-1 whitespace-pre-wrap break-all">{command}</pre>
        <button
          onClick={() => { navigator.clipboard.writeText(command); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Status icon
// ─────────────────────────────────────────────────
function StatusIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case "done":
      return <div className="w-7 h-7 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-green-500" /></div>;
    case "failed":
      return <div className="w-7 h-7 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center"><X className="w-3.5 h-3.5 text-red-500" /></div>;
    case "running":
      return <div className="w-7 h-7 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center"><Loader2 className="w-3.5 h-3.5 text-primary animate-spin" /></div>;
    case "skipped":
      return <div className="w-7 h-7 rounded-full bg-accent border-2 border-border flex items-center justify-center"><span className="text-[10px] text-muted-foreground">—</span></div>;
    default:
      return <div className="w-7 h-7 rounded-full bg-accent/50 border-2 border-border flex items-center justify-center"><span className="text-xs text-muted-foreground" /></div>;
  }
}

// ─────────────────────────────────────────────────
// Main Step Component
// ─────────────────────────────────────────────────
export function ProvisioningStep({
  step,
  stepNumber,
  isLast,
  children,
  onMarkDone,
  onMarkFailed,
  onRetry,
}: {
  step: StepData;
  stepNumber: number;
  isLast: boolean;
  children?: React.ReactNode;
  onMarkDone: () => void;
  onMarkFailed: (reason: string) => void;
  onRetry: () => void;
}) {
  const [expanded, setExpanded] = useState(step.status !== "done" && step.status !== "skipped");
  const [failReason, setFailReason] = useState("");

  const typeColors: Record<string, string> = {
    auto: "bg-green-500/10 text-green-500 border-green-500/30",
    manual: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    semi: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  };
  const typeLabels: Record<string, string> = { auto: "Auto", manual: "Manual", semi: "Semi-auto" };

  return (
    <div className={`relative pl-8 pb-4 ${!isLast ? "border-l-2 border-border/50" : ""}`}>
      <div className="absolute -left-3.5 top-0">
        <StatusIcon status={step.status} />
      </div>

      <div className="space-y-2">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full text-left group"
        >
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )}
          <span className="text-xs text-muted-foreground font-mono">{stepNumber}.</span>
          <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {step.title}
          </h4>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${typeColors[step.type]}`}>
            {typeLabels[step.type]}
          </span>
          {step.status === "done" && step.completedAt && (
            <span className="text-[10px] text-muted-foreground ml-auto">
              {new Date(step.completedAt).toLocaleDateString()}
            </span>
          )}
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="ml-6 space-y-3">
            {/* Step-specific instructions (passed as children) */}
            {children && (
              <div className="text-sm text-muted-foreground space-y-2">
                {children}
              </div>
            )}

            {/* Failed reason display */}
            {step.status === "failed" && step.failedReason && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                <p className="text-xs text-red-500 font-medium">Failed: {step.failedReason}</p>
              </div>
            )}

            {/* Output display */}
            {step.output && (
              <div className="rounded-lg bg-accent/50 border p-3">
                <pre className="text-[11px] font-mono text-muted-foreground whitespace-pre-wrap">{step.output}</pre>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {(step.status === "pending" || step.status === "running") && (
                <>
                  <button
                    onClick={onMarkDone}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Mark as Done
                  </button>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Failure reason..."
                      value={failReason}
                      onChange={(e) => setFailReason(e.target.value)}
                      className="px-2 py-1.5 rounded-lg border bg-background text-xs w-48"
                    />
                    <button
                      onClick={() => { onMarkFailed(failReason || "Manual failure"); setFailReason(""); }}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-red-500/30 text-red-500 text-xs font-medium hover:bg-red-500/10 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Fail
                    </button>
                  </div>
                </>
              )}
              {step.status === "failed" && (
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-accent transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Retry
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// External link helper
// ─────────────────────────────────────────────────
export function LinkRow({ label, url, description }: { label: string; url: string; description?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-3 py-2 rounded-lg border hover:bg-accent/30 transition-colors group"
    >
      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground group-hover:text-primary">{label}</p>
        {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
      </div>
    </a>
  );
}
