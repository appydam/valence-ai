import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pause,
  Play,
  Trash2,
  Pencil,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { getRelativeTime } from "@/lib/time";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

interface MonitorCardProps {
  monitor: {
    _id: Id<"monitors">;
    name: string;
    description?: string;
    blueprintSlug: string;
    toolName: string;
    intervalMinutes: number;
    status: "active" | "paused" | "error";
    lastCheckedAt?: number;
    nextCheckAt: number;
    totalChecks: number;
    totalTriggers: number;
    consecutiveFailures: number;
    lastError?: string;
    conditions: string;
    actionType: string;
    blueprintName?: string;
    blueprintCategory?: string;
  };
  onEdit: (id: Id<"monitors">) => void;
}

const OPERATOR_LABELS: Record<string, string> = {
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  eq: "=",
  neq: "!=",
  contains: "contains",
  not_contains: "not contains",
  exists: "exists",
  changed: "changed",
};

export function MonitorCard({ monitor, onEdit }: MonitorCardProps) {
  const { toast } = useToast();
  const pauseMonitor = useMutation(api.monitors.pause);
  const resumeMonitor = useMutation(api.monitors.resume);
  const removeMonitor = useMutation(api.monitors.remove);
  const forceCheck = useMutation(api.monitors.forceCheck);

  const statusConfig = {
    active: { color: "bg-green-500", label: "Active", icon: CheckCircle2 },
    paused: { color: "bg-yellow-500", label: "Paused", icon: Pause },
    error: { color: "bg-red-500", label: "Error", icon: XCircle },
  };

  const config = statusConfig[monitor.status];
  const StatusIcon = config.icon;

  // Parse conditions for display
  let conditionSummary = "";
  try {
    const conditions = JSON.parse(monitor.conditions);
    conditionSummary = conditions
      .map((c: any) => `${c.field} ${OPERATOR_LABELS[c.operator] || c.operator} ${c.value ?? ""}`)
      .join(" AND ");
  } catch {
    conditionSummary = "Custom conditions";
  }

  const actionLabels: Record<string, string> = {
    create_task: "Create Task",
    send_notification: "Send Notification",
    trigger_agent: "Wake Agent",
    log_alert: "Log Alert",
  };

  const handlePauseResume = async () => {
    try {
      if (monitor.status === "active") {
        await pauseMonitor({ id: monitor._id });
        toast({ title: "Monitor paused" });
      } else {
        await resumeMonitor({ id: monitor._id });
        toast({ title: "Monitor resumed" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleRunNow = async () => {
    try {
      await forceCheck({ id: monitor._id });
      toast({ title: "Queued", description: "Monitor will run within ~2 minutes (next cron cycle)" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this monitor and all its events?")) return;
    try {
      await removeMonitor({ id: monitor._id });
      toast({ title: "Monitor deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Card className="border-border hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.color}`} />
            <h3 className="font-semibold text-sm">{monitor.name}</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            <StatusIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>
        {monitor.description && (
          <p className="text-xs text-muted-foreground mt-1">{monitor.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Integration + Tool */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            {monitor.blueprintName || monitor.blueprintSlug}
          </Badge>
          <span className="text-muted-foreground/60">/</span>
          <span>{monitor.toolName}</span>
        </div>

        {/* Condition */}
        <div className="text-xs">
          <span className="text-muted-foreground">When: </span>
          <span className="text-foreground font-mono">{conditionSummary}</span>
        </div>

        {/* Action */}
        <div className="text-xs">
          <span className="text-muted-foreground">Then: </span>
          <span className="text-foreground">{actionLabels[monitor.actionType] || monitor.actionType}</span>
        </div>

        {/* Timing */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Every {monitor.intervalMinutes}m</span>
          </div>
          {monitor.lastCheckedAt && (
            <span>Last: {getRelativeTime(monitor.lastCheckedAt)}</span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">
            {monitor.totalChecks} checks
          </span>
          <span className="text-orange-400 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {monitor.totalTriggers} triggered
          </span>
        </div>

        {/* Error display */}
        {monitor.lastError && (
          <div className="flex items-start gap-1 text-xs text-red-400 bg-red-500/10 rounded p-2">
            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{monitor.lastError}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={handlePauseResume}
          >
            {monitor.status === "active" ? (
              <><Pause className="w-3 h-3 mr-1" />Pause</>
            ) : (
              <><Play className="w-3 h-3 mr-1" />Resume</>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={handleRunNow}
            title="Force an immediate check on the next cron cycle (~2 min)"
          >
            <RefreshCw className="w-3 h-3 mr-1" />Run Now
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onEdit(monitor._id)}
          >
            <Pencil className="w-3 h-3 mr-1" />Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-red-400 hover:text-red-300"
            onClick={handleDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
