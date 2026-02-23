import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import {
  BookOpen, ChevronLeft, CheckCircle, XCircle, Brain, Sparkles,
  AlertTriangle, GitCompare, Clock
} from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

export default function SoulReview() {
  const { versionId } = useParams<{ versionId: string }>();
  const navigate = useNavigate();
  const [reviewNote, setReviewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);

  const version = useQuery(
    api.soulDistillation.getVersion,
    versionId ? { id: versionId as Id<"soulFileVersions"> } : "skip"
  );

  const currentSoul = useQuery(
    api.soulFiles.get,
    version?.agentName ? { agentName: version.agentName } : "skip"
  );

  const reviewMutation = useMutation(api.soulDistillation.reviewVersion);

  const handleReview = async (d: "approved" | "rejected") => {
    if (!versionId || submitting) return;
    setSubmitting(true);
    setDecision(d);
    try {
      await reviewMutation({
        id: versionId as Id<"soulFileVersions">,
        decision: d,
        reviewedBy: "human",
        reviewNote: reviewNote.trim() || undefined,
      });
      // Navigate back to memory bank after review
      setTimeout(() => navigate("/memory"), 1500);
    } catch (err: any) {
      alert(`Review failed: ${err.message}`);
      setSubmitting(false);
      setDecision(null);
    }
  };

  if (version === undefined) {
    return (
      <DashboardLayout>
        <div className="p-6 text-muted-foreground text-sm">Loading...</div>
      </DashboardLayout>
    );
  }

  if (version === null) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <p className="text-muted-foreground">Soul version not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  const agentColor = AGENT_CONFIG[version.agentName as AgentName]?.color ?? "#888";
  const isPending = version.status === "pending_review";
  const isAlreadyReviewed = !isPending;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/memory")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Memory Bank
          </button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" style={{ color: agentColor }} />
            <h1 className="text-lg font-bold" style={{ color: agentColor }}>
              {version.agentName}
            </h1>
            <span className="text-sm text-muted-foreground">SOUL Review — v{version.version}</span>
          </div>

          {/* Status badge */}
          <span className={`ml-auto text-xs px-2.5 py-1 rounded-full border font-medium ${
            version.status === "pending_review"
              ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
              : version.status === "approved"
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : "bg-red-500/15 text-red-400 border-red-500/30"
          }`}>
            {version.status === "pending_review" ? "Pending Review" :
              version.status === "approved" ? "Approved" : "Rejected"}
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Distilled {getRelativeTime(version.distilledAt)}
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {version.memoriesDistilled.length} memories analyzed by {version.distilledBy}
          </span>
          {version.reviewedAt && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <CheckCircle className="w-3 h-3" />
              Reviewed {getRelativeTime(version.reviewedAt)} by {version.reviewedBy}
            </span>
          )}
        </div>

        {/* Changelog */}
        {version.changeLog && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <GitCompare className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-foreground">What Changed</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {version.changeLog}
            </p>
          </div>
        )}

        {/* Already reviewed notice */}
        {isAlreadyReviewed && (
          <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm ${
            version.status === "approved"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}>
            {version.status === "approved" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            <span>
              This version was <strong>{version.status}</strong>
              {version.reviewNote && `: "${version.reviewNote}"`}
            </span>
          </div>
        )}

        {/* Two-panel diff */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Current SOUL */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Current SOUL</span>
            </div>
            <pre className="p-4 text-xs text-muted-foreground font-mono leading-relaxed overflow-auto max-h-[600px] whitespace-pre-wrap break-words">
              {currentSoul?.content ?? "No current SOUL file. Sync from server first."}
            </pre>
          </div>

          {/* Proposed SOUL */}
          <div className={`border rounded-xl overflow-hidden ${
            isPending ? "border-primary/40 bg-primary/5" : "bg-card border-border"
          }`}>
            <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Proposed SOUL v{version.version}
              </span>
              {isPending && (
                <span className="ml-auto text-xs text-primary">awaiting your review</span>
              )}
            </div>
            <pre className="p-4 text-xs text-foreground font-mono leading-relaxed overflow-auto max-h-[600px] whitespace-pre-wrap break-words">
              {version.content}
            </pre>
          </div>
        </div>

        {/* Review actions (only for pending) */}
        {isPending && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <p className="text-sm font-medium text-foreground">Review Required</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Approving will update the live SOUL file in Convex and flag it for SSH sync on the next deploy.
              Rejecting will discard the proposed changes.
            </p>

            {/* Review note */}
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Optional review note (e.g. 'Good changes — removed outdated Stripe quirk' or 'Too aggressive, reverted')"
              className="w-full bg-background border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50 transition-colors"
              rows={2}
            />

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleReview("approved")}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {decision === "approved" ? "Approved!" : "Approve & Apply"}
              </button>
              <button
                onClick={() => handleReview("rejected")}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                {decision === "rejected" ? "Rejected" : "Reject"}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
