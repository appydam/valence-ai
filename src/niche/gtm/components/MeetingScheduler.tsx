import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Link2,
  Copy,
  CheckCircle2,
  Clock,
  X,
  AlertCircle,
  CalendarCheck,
  Loader2,
  Plug,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

type MeetingStatus = "Scheduled" | "Completed" | "No-show" | "Rescheduled";

interface Meeting {
  id: string;
  contactName: string;
  company: string;
  dateTime: string;
  status: MeetingStatus;
  link?: string;
}

interface MeetingSchedulerProps {
  onInsertLink?: (link: string) => void;
}

const STATUS_CONFIG: Record<MeetingStatus, { color: string; bg: string }> = {
  Scheduled: { color: "text-blue-500", bg: "bg-blue-500/10" },
  Completed: { color: "text-green-500", bg: "bg-green-500/10" },
  "No-show": { color: "text-red-400", bg: "bg-red-400/10" },
  Rescheduled: { color: "text-yellow-500", bg: "bg-yellow-500/10" },
};

export function MeetingScheduler({ onInsertLink }: MeetingSchedulerProps) {
  const { config } = useNiche();
  const { execute, isConnected } = useIntegrationCall();
  const [meetingLink, setMeetingLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);

  const isSalesforceConnected = isConnected("salesforce");
  const isHubSpotConnected = isConnected("hubspot");
  const isCrmConnected = isSalesforceConnected || isHubSpotConnected;

  // Fetch meetings from CRM
  const fetchMeetings = useCallback(async () => {
    if (!isCrmConnected) return;
    setLoading(true);

    try {
      if (isSalesforceConnected) {
        const result = await execute("salesforce", "query_records", {
          q: "SELECT Id, Subject, StartDateTime, EndDateTime, Who.Name, Account.Name FROM Event WHERE StartDateTime > TODAY ORDER BY StartDateTime LIMIT 10",
        });

        if (result.success && result.result?.records) {
          const mapped: Meeting[] = result.result.records.map((e: any) => {
            const startDate = e.StartDateTime ? new Date(e.StartDateTime) : null;
            const isUpcoming = startDate && startDate > new Date();

            return {
              id: e.Id,
              contactName: e.Who?.Name ?? "Unknown",
              company: e.Account?.Name ?? "",
              dateTime: startDate
                ? startDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "TBD",
              status: isUpcoming ? "Scheduled" : "Completed",
            };
          });
          setMeetings(mapped);
        }
      } else if (isHubSpotConnected) {
        const result = await execute("hubspot", "list_meetings", {
          limit: 10,
        });

        if (result.success && result.result?.meetings) {
          const mapped: Meeting[] = result.result.meetings.map((m: any) => ({
            id: m.id ?? String(Math.random()),
            contactName: m.title ?? m.subject ?? "Meeting",
            company: "",
            dateTime: m.startTime
              ? new Date(m.startTime).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "TBD",
            status: "Scheduled" as MeetingStatus,
          }));
          setMeetings(mapped);
        }
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [execute, isCrmConnected, isSalesforceConnected, isHubSpotConnected]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleCopyLink = async () => {
    if (!meetingLink) return;
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail
    }
  };

  const handleInsertLink = () => {
    if (onInsertLink && meetingLink) {
      onInsertLink(meetingLink);
    }
  };

  const upcomingMeetings = meetings.filter(
    (m) => m.status === "Scheduled" || m.status === "Rescheduled"
  );

  const pastMeetings = meetings.filter(
    (m) => m.status === "Completed" || m.status === "No-show"
  );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2">
        <Calendar className="w-4 h-4" style={{ color: config.accentColor }} />
        <h3 className="text-sm font-semibold text-foreground">Meeting Scheduler</h3>
      </div>

      {/* Meeting Link Input */}
      <div className="px-5 py-4 border-b border-border/30">
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">
          Calendly / Cal.com Link
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://cal.com/yourname/meeting"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={handleCopyLink}
            disabled={!meetingLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors shrink-0"
          >
            {copied ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          {onInsertLink && (
            <button
              onClick={handleInsertLink}
              disabled={!meetingLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors shrink-0 disabled:opacity-50"
              style={{ background: config.accentColor }}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              Insert Link
            </button>
          )}
        </div>
      </div>

      {/* CRM Meetings */}
      {loading ? (
        <div className="px-5 py-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : isCrmConnected ? (
        <>
          {/* Upcoming Meetings */}
          {upcomingMeetings.length > 0 && (
            <div className="px-5 py-3 border-b border-border/30">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                Upcoming ({upcomingMeetings.length})
              </h4>
              <div className="space-y-2">
                {upcomingMeetings.map((meeting) => {
                  const statusCfg = STATUS_CONFIG[meeting.status];
                  return (
                    <div
                      key={meeting.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent/20"
                    >
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {meeting.contactName}{meeting.company ? ` — ${meeting.company}` : ""}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {meeting.dateTime}
                        </p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                        {meeting.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Meetings */}
          {pastMeetings.length > 0 && (
            <div className="px-5 py-3">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                Recent ({pastMeetings.length})
              </h4>
              <div className="space-y-2">
                {pastMeetings.map((meeting) => {
                  const statusCfg = STATUS_CONFIG[meeting.status];
                  return (
                    <div
                      key={meeting.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent/10"
                    >
                      {meeting.status === "Completed" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      ) : meeting.status === "No-show" ? (
                        <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground/70 truncate">
                          {meeting.contactName}{meeting.company ? ` — ${meeting.company}` : ""}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{meeting.dateTime}</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                        {meeting.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {upcomingMeetings.length === 0 && pastMeetings.length === 0 && (
            <div className="px-5 py-6 text-center">
              <Calendar className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No meetings found in your CRM</p>
            </div>
          )}
        </>
      ) : (
        <div className="px-5 py-6 text-center">
          <Plug className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground mb-2">Connect your CRM to see meetings</p>
          <Link
            to="/integrations"
            className="text-xs font-medium hover:underline"
            style={{ color: config.accentColor }}
          >
            Go to Integrations
          </Link>
        </div>
      )}
    </div>
  );
}
