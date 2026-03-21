import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Edit3,
  Send,
  MessageSquare,
  User,
  XCircle,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";

export type ApprovalStatus = "draft" | "in_review" | "approved" | "published";

interface ApprovalComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

interface ApprovalHistoryEntry {
  action: string;
  author: string;
  timestamp: string;
  notes?: string;
}

interface ApprovalFlowProps {
  contentId?: string;
  status: ApprovalStatus;
  onStatusChange: (status: ApprovalStatus) => void;
}

const STATUS_CONFIG: Record<
  ApprovalStatus,
  { label: string; color: string; bgClass: string; icon: typeof Clock }
> = {
  draft: {
    label: "Draft",
    color: "text-gray-400",
    bgClass: "bg-gray-500/10 border-gray-500/30",
    icon: Edit3,
  },
  in_review: {
    label: "In Review",
    color: "text-yellow-500",
    bgClass: "bg-yellow-500/10 border-yellow-500/30",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "text-green-500",
    bgClass: "bg-green-500/10 border-green-500/30",
    icon: CheckCircle2,
  },
  published: {
    label: "Published",
    color: "text-blue-500",
    bgClass: "bg-blue-500/10 border-blue-500/30",
    icon: Send,
  },
};

const TEAM_MEMBERS = [
  "Arpit Dhamija",
  "Marketing Lead",
  "Content Editor",
  "Brand Manager",
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as T;
  } catch {
    // corrupted data
  }
  return fallback;
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full
  }
}

export function ApprovalFlow({ contentId, status, onStatusChange }: ApprovalFlowProps) {
  const { config } = useNiche();
  const storagePrefix = `niche_approval_${contentId ?? "default"}`;

  const [reviewer, setReviewer] = useState(TEAM_MEMBERS[0]);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<ApprovalComment[]>(() =>
    loadFromStorage(`${storagePrefix}_comments`, [])
  );
  const [history, setHistory] = useState<ApprovalHistoryEntry[]>(() =>
    loadFromStorage(`${storagePrefix}_history`, [
      {
        action: "Created draft",
        author: "You",
        timestamp: new Date().toISOString(),
      },
    ])
  );

  // Load persisted status on mount
  useEffect(() => {
    const saved = loadFromStorage<ApprovalStatus | null>(`${storagePrefix}_status`, null);
    if (saved && saved !== status) {
      onStatusChange(saved);
    }
  }, [storagePrefix]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist comments when they change
  useEffect(() => {
    saveToStorage(`${storagePrefix}_comments`, comments);
  }, [comments, storagePrefix]);

  // Persist history when it changes
  useEffect(() => {
    saveToStorage(`${storagePrefix}_history`, history);
  }, [history, storagePrefix]);

  // Persist status when it changes
  useEffect(() => {
    saveToStorage(`${storagePrefix}_status`, status);
  }, [status, storagePrefix]);

  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  const addHistoryEntry = (action: string, notes?: string) => {
    setHistory((prev) => [
      ...prev,
      {
        action,
        author: "You",
        timestamp: new Date().toISOString(),
        notes,
      },
    ]);
  };

  const handleSubmitForReview = () => {
    onStatusChange("in_review");
    addHistoryEntry(`Submitted for review to ${reviewer}`);
  };

  const handleApprove = () => {
    onStatusChange("approved");
    addHistoryEntry("Approved");
  };

  const handleRequestChanges = () => {
    onStatusChange("draft");
    addHistoryEntry("Requested changes");
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `comment-${Date.now()}`,
        author: "You",
        text: commentText.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);
    setCommentText("");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Approval Workflow</h3>
        {/* Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${statusConfig.bgClass} ${statusConfig.color}`}
        >
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </div>
      </div>

      {/* Actions based on status */}
      {status === "draft" && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Assign Reviewer
            </label>
            <select
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {TEAM_MEMBERS.map((member) => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSubmitForReview}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
            style={{ background: config.accentColor }}
          >
            <Send className="w-4 h-4" />
            Submit for Review
          </button>
        </div>
      )}

      {status === "in_review" && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleApprove}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={handleRequestChanges}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Request Changes
          </button>
        </div>
      )}

      {status === "approved" && (
        <p className="text-xs text-green-400/80">
          Content has been approved and is ready to publish.
        </p>
      )}

      {status === "published" && (
        <p className="text-xs text-blue-400/80">This content has been published.</p>
      )}

      {/* Comment Thread */}
      <div className="space-y-3 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Comments ({comments.length})
          </span>
        </div>

        {comments.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-start gap-2 p-2 rounded-lg bg-accent/20"
              >
                <User className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {comment.author}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(comment.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 mt-0.5">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <button
            onClick={handleAddComment}
            disabled={!commentText.trim()}
            className="px-3 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-50 transition-all shrink-0 self-end"
            style={{ background: config.accentColor }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Approval History */}
      {history.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/50">
          <span className="text-xs font-medium text-muted-foreground">History</span>
          <div className="space-y-1.5">
            {history.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: config.accentColor }}
                />
                <span className="text-foreground/80">{entry.action}</span>
                <span className="text-muted-foreground/50 ml-auto">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
