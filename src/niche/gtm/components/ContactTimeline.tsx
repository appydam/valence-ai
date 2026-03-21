import {
  Mail,
  Eye,
  MousePointerClick,
  MessageSquare,
  Calendar,
  Kanban,
  PenLine,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";

type EventType =
  | "email_sent"
  | "email_opened"
  | "link_clicked"
  | "reply_received"
  | "meeting_booked"
  | "stage_change"
  | "note_added";

interface TimelineEvent {
  id: string;
  type: EventType;
  description: string;
  timestamp: string;
  agent?: string;
}

interface ContactTimelineProps {
  contactName: string;
  events?: TimelineEvent[];
}

const EVENT_CONFIG: Record<EventType, { icon: typeof Mail; color: string; label: string }> = {
  email_sent: { icon: Mail, color: "text-blue-400", label: "Email Sent" },
  email_opened: { icon: Eye, color: "text-purple-400", label: "Email Opened" },
  link_clicked: { icon: MousePointerClick, color: "text-cyan-400", label: "Link Clicked" },
  reply_received: { icon: MessageSquare, color: "text-green-400", label: "Reply Received" },
  meeting_booked: { icon: Calendar, color: "text-yellow-400", label: "Meeting Booked" },
  stage_change: { icon: Kanban, color: "text-orange-400", label: "Stage Change" },
  note_added: { icon: PenLine, color: "text-pink-400", label: "Note Added" },
};

export function ContactTimeline({ contactName, events }: ContactTimelineProps) {
  const { config } = useNiche();

  if (!events || events.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Activity Timeline — {contactName}
        </h3>
        <div className="py-6 text-center">
          <PenLine className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            No activity recorded yet for {contactName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Activity Timeline — {contactName}
      </h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-0.5">
          {events.map((event) => {
            const eventCfg = EVENT_CONFIG[event.type];
            const Icon = eventCfg.icon;

            return (
              <div key={event.id} className="relative flex items-start gap-3 py-2 pl-1">
                {/* Icon dot */}
                <div className="relative z-10 flex items-center justify-center w-[30px] h-[30px] rounded-full bg-card border border-border shrink-0">
                  <Icon className={`w-3.5 h-3.5 ${eventCfg.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {eventCfg.label}
                    </span>
                    {event.agent && (
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                        style={{
                          background: `${config.accentColor}15`,
                          color: config.accentColor,
                        }}
                      >
                        {event.agent}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground/60 ml-auto shrink-0">
                      {event.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 mt-0.5 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
