import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import { Bell, AtSign, MessageSquare } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const AGENTS: AgentName[] = ["Kaze", "Scout", "Forge", "Ghost"];

export function NotificationBell({ collapsed }: { collapsed: boolean }) {
  // Single combined query instead of 8 separate queries (4 counts + 4 lists)
  const allUnread = useQuery(api.notifications.getAllUnread) ?? null;
  const markAllRead = useMutation(api.notifications.markAllRead);
  const markRead = useMutation(api.notifications.markRead);

  const totalUnread = allUnread?.totalUnread ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={cn(
          "relative flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors w-full",
          collapsed ? "justify-center" : ""
        )}>
          <Bell className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-xs">Notifications</span>}
          {totalUnread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" className="w-80 p-0 bg-card border-border max-h-[70vh] overflow-auto">
        <div className="p-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          <p className="text-[10px] text-muted-foreground">{totalUnread} unread</p>
        </div>
        {allUnread && AGENTS.map(agent => {
          const notifications = allUnread.byAgent[agent] ?? [];
          if (notifications.length === 0) return null;
          const config = AGENT_CONFIG[agent];

          return (
            <div key={agent} className="border-b border-border last:border-b-0">
              <div className="flex items-center justify-between px-3 py-2 bg-secondary/50">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{config.emoji}</span>
                  <span className="text-xs font-medium" style={{ color: `hsl(var(--agent-${config.color}))` }}>{agent}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">{notifications.length}</span>
                </div>
                <button
                  onClick={() => markAllRead({ agentName: agent })}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Mark all read
                </button>
              </div>
              <div className="divide-y divide-border">
                {notifications.slice(0, 5).map((n: any) => (
                  <button
                    key={n._id}
                    onClick={() => markRead({ id: n._id })}
                    className="w-full text-left px-3 py-2.5 hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {n.type === "mention" ? (
                        <AtSign className="w-3 h-3 text-primary" />
                      ) : (
                        <MessageSquare className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className="text-[11px] text-foreground">
                        <span className="font-medium">{n.fromAuthor}</span>
                        {n.type === "mention" ? " mentioned " : " commented on "}
                        <span className="font-medium">{n.taskTitle}</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 ml-[18px]">{n.contentPreview}</p>
                    <span className="text-[9px] text-muted-foreground ml-[18px]">{getRelativeTime(n.createdAt)}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {totalUnread === 0 && (
          <div className="p-6 text-center">
            <p className="text-xs text-muted-foreground">No notifications</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
