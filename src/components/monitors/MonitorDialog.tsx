import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAgents } from "@/hooks/useAgents";
import { Plus, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import type { MonitorTemplate } from "./MonitorTemplates";

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface MonitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  monitorId?: Id<"monitors">;
  template?: MonitorTemplate | null;
}

const OPERATORS = [
  { value: "gt", label: "> (greater than)" },
  { value: "gte", label: ">= (greater or equal)" },
  { value: "lt", label: "< (less than)" },
  { value: "lte", label: "<= (less or equal)" },
  { value: "eq", label: "= (equals)" },
  { value: "neq", label: "!= (not equals)" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "not contains" },
  { value: "exists", label: "exists" },
  { value: "changed", label: "changed (vs last check)" },
];

const INTERVALS = [
  { value: 5, label: "Every 5 minutes" },
  { value: 15, label: "Every 15 minutes" },
  { value: 30, label: "Every 30 minutes" },
  { value: 60, label: "Every hour" },
  { value: 120, label: "Every 2 hours" },
  { value: 360, label: "Every 6 hours" },
  { value: 1440, label: "Every 24 hours" },
];

const ACTION_TYPES = [
  { value: "create_task", label: "Create Task" },
  { value: "send_notification", label: "Send Slack Notification" },
  { value: "trigger_agent", label: "Wake Agent" },
  { value: "log_alert", label: "Log Alert" },
];

export function MonitorDialog({
  open,
  onOpenChange,
  userId,
  monitorId,
  template,
}: MonitorDialogProps) {
  const { toast } = useToast();
  const { agentNames } = useAgents();
  const [step, setStep] = useState(1);

  // Step 1: Basic info + integration
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [blueprintSlug, setBlueprintSlug] = useState("");
  const [toolName, setToolName] = useState("");
  const [toolArgs, setToolArgs] = useState("{}");
  const [intervalMinutes, setIntervalMinutes] = useState(15);

  // Step 2: Conditions
  const [conditions, setConditions] = useState<Condition[]>([
    { field: "", operator: "gt", value: "" },
  ]);

  // Step 3: Action
  const [actionType, setActionType] = useState("log_alert");
  const [actionConfig, setActionConfig] = useState("{}");

  // Action-specific fields
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [slackChannel, setSlackChannel] = useState("#alerts");
  const [slackMessage, setSlackMessage] = useState("");
  const [agentName, setAgentName] = useState("Scout");
  const [alertMessage, setAlertMessage] = useState("");

  const createMonitor = useMutation(api.monitors.create);
  const updateMonitor = useMutation(api.monitors.update);

  // Fetch existing monitor for editing
  const existingMonitor = useQuery(
    api.monitors.get,
    monitorId ? { id: monitorId } : "skip"
  );

  // Fetch connected integrations
  const connections = useQuery(api.connections.listByUser, { userId });
  const blueprints = useQuery(api.blueprints.list, { status: "active" });

  // Get tools for selected blueprint
  const selectedBlueprint = blueprints?.find((b: any) => b.slug === blueprintSlug);
  const tools = useQuery(
    api.blueprintTools.listByBlueprint,
    selectedBlueprint ? { blueprintId: selectedBlueprint._id } : "skip"
  );

  // Connected blueprint slugs
  const connectedSlugs = new Set(
    (connections ?? [])
      .filter((c: any) => c.status === "active")
      .map((c: any) => {
        const bp = blueprints?.find((b: any) => b._id === c.blueprintId);
        return bp?.slug;
      })
      .filter(Boolean)
  );

  // Load existing monitor data
  useEffect(() => {
    if (existingMonitor) {
      setName(existingMonitor.name);
      setDescription(existingMonitor.description || "");
      setBlueprintSlug(existingMonitor.blueprintSlug);
      setToolName(existingMonitor.toolName);
      setToolArgs(existingMonitor.toolArgs || "{}");
      setIntervalMinutes(existingMonitor.intervalMinutes);
      try {
        setConditions(JSON.parse(existingMonitor.conditions));
      } catch {
        setConditions([{ field: "", operator: "gt", value: "" }]);
      }
      setActionType(existingMonitor.actionType);
      loadActionConfig(existingMonitor.actionType, existingMonitor.actionConfig);
    }
  }, [existingMonitor]);

  // Load template
  useEffect(() => {
    if (template && open) {
      setStep(1);
      setName(template.name);
      setDescription(template.description);
      setBlueprintSlug(template.blueprintSlug);
      setToolName(template.toolName);
      setIntervalMinutes(template.intervalMinutes);
      setConditions(
        template.conditions.map((c) => ({
          field: c.field,
          operator: c.operator,
          value: c.value !== undefined ? String(c.value) : "",
        }))
      );
      setActionType(template.actionType);
      loadActionConfig(template.actionType, JSON.stringify(template.actionConfig));
    }
  }, [template, open]);

  function loadActionConfig(type: string, configStr: string) {
    try {
      const config = JSON.parse(configStr);
      if (type === "create_task") {
        setTaskTitle(config.title || "");
        setTaskDescription(config.description || "");
        setTaskPriority(config.priority || "medium");
        setTaskAssignee(config.assignee || "");
      } else if (type === "send_notification") {
        setSlackChannel(config.channel || "#alerts");
        setSlackMessage(config.message || "");
      } else if (type === "trigger_agent") {
        setAgentName(config.agentName || "Scout");
      } else if (type === "log_alert") {
        setAlertMessage(config.message || "");
      }
    } catch {
      // ignore
    }
  }

  function buildActionConfig(): string {
    switch (actionType) {
      case "create_task":
        return JSON.stringify({
          title: taskTitle || `Monitor Alert: ${name}`,
          description: taskDescription || "A monitor condition was triggered.",
          priority: taskPriority,
          assignee: taskAssignee || undefined,
          tags: ["monitor-alert"],
        });
      case "send_notification":
        return JSON.stringify({
          channel: slackChannel,
          message: slackMessage || `Monitor "${name}" triggered: {{condition_summary}}`,
        });
      case "trigger_agent":
        return JSON.stringify({
          agentName,
          taskTitle: `Monitor Alert: ${name}`,
          taskDescription: "Automated alert from continuous monitor.",
          priority: "high",
        });
      case "log_alert":
        return JSON.stringify({
          message: alertMessage || `Monitor "${name}" triggered: {{condition_summary}}`,
        });
      default:
        return "{}";
    }
  }

  const handleSubmit = async () => {
    // Validate
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (!blueprintSlug) {
      toast({ title: "Select an integration", variant: "destructive" });
      return;
    }
    if (!toolName) {
      toast({ title: "Select a tool", variant: "destructive" });
      return;
    }

    const validConditions = conditions.filter((c) => c.field.trim());
    if (validConditions.length === 0) {
      toast({ title: "Add at least one condition", variant: "destructive" });
      return;
    }

    try {
      const conditionsStr = JSON.stringify(validConditions);
      const configStr = buildActionConfig();

      if (monitorId) {
        await updateMonitor({
          id: monitorId,
          name,
          description: description || undefined,
          toolName,
          toolArgs: toolArgs !== "{}" ? toolArgs : undefined,
          intervalMinutes,
          conditions: conditionsStr,
          actionType: actionType as any,
          actionConfig: configStr,
        });
        toast({ title: "Monitor updated" });
      } else {
        await createMonitor({
          userId,
          name,
          description: description || undefined,
          blueprintSlug,
          toolName,
          toolArgs: toolArgs !== "{}" ? toolArgs : undefined,
          intervalMinutes,
          monitorType: "poll",
          conditions: conditionsStr,
          actionType: actionType as any,
          actionConfig: configStr,
        });
        toast({ title: "Monitor created" });
      }

      onOpenChange(false);
      resetForm();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  function resetForm() {
    setStep(1);
    setName("");
    setDescription("");
    setBlueprintSlug("");
    setToolName("");
    setToolArgs("{}");
    setIntervalMinutes(15);
    setConditions([{ field: "", operator: "gt", value: "" }]);
    setActionType("log_alert");
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("medium");
    setTaskAssignee("");
    setSlackChannel("#alerts");
    setSlackMessage("");
    setAgentName("Scout");
    setAlertMessage("");
  }

  const addCondition = () => {
    setConditions([...conditions, { field: "", operator: "gt", value: "" }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof Condition, value: string) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {monitorId ? "Edit Monitor" : "New Monitor"}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 3 — {step === 1 ? "Integration & Schedule" : step === 2 ? "Conditions" : "Action"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Integration & Schedule */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shopify New Orders"
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this monitor watch for?"
              />
            </div>
            <div>
              <Label>Integration</Label>
              <Select value={blueprintSlug} onValueChange={(v) => { setBlueprintSlug(v); setToolName(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select connected integration" />
                </SelectTrigger>
                <SelectContent>
                  {(blueprints ?? [])
                    .filter((b: any) => connectedSlugs.has(b.slug))
                    .map((b: any) => (
                      <SelectItem key={b.slug} value={b.slug}>
                        {b.name}
                      </SelectItem>
                    ))}
                  {connectedSlugs.size === 0 && (
                    <SelectItem value="_none" disabled>
                      No connected integrations
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {blueprintSlug && !connectedSlugs.has(blueprintSlug) && (
                <p className="text-xs text-yellow-500 mt-1">
                  This integration is not connected. Connect it first in Integrations.
                </p>
              )}
            </div>
            <div>
              <Label>API Tool</Label>
              <Select value={toolName} onValueChange={setToolName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tool to call" />
                </SelectTrigger>
                <SelectContent>
                  {(tools ?? [])
                    .filter((t: any) => t.status === "active")
                    .map((t: any) => (
                      <SelectItem key={t.name} value={t.name}>
                        {t.displayName || t.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tool Arguments (JSON, optional)</Label>
              <Textarea
                value={toolArgs}
                onChange={(e) => setToolArgs(e.target.value)}
                placeholder='{"status": "active"}'
                className="font-mono text-xs"
                rows={3}
              />
            </div>
            <div>
              <Label>Check Interval</Label>
              <Select
                value={String(intervalMinutes)}
                onValueChange={(v) => setIntervalMinutes(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVALS.map((i) => (
                    <SelectItem key={i.value} value={String(i.value)}>
                      {i.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2: Conditions */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Define conditions that must ALL be true to trigger the action.
              Use dot notation for nested fields (e.g. <code>data.orders.length</code>).
            </p>
            {conditions.map((cond, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={cond.field}
                  onChange={(e) => updateCondition(i, "field", e.target.value)}
                  placeholder="field.path"
                  className="flex-1 font-mono text-xs"
                />
                <Select
                  value={cond.operator}
                  onValueChange={(v) => updateCondition(i, "operator", v)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {cond.operator !== "exists" && cond.operator !== "changed" && (
                  <Input
                    value={cond.value}
                    onChange={(e) => updateCondition(i, "value", e.target.value)}
                    placeholder="value"
                    className="w-24 text-xs"
                  />
                )}
                {conditions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(i)}
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addCondition}>
              <Plus className="w-3 h-3 mr-1" />
              Add Condition
            </Button>
          </div>
        )}

        {/* Step 3: Action */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Action Type</Label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {actionType === "create_task" && (
              <>
                <div>
                  <Label>Task Title</Label>
                  <Input
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Monitor Alert: {{condition_summary}}"
                  />
                </div>
                <div>
                  <Label>Task Description</Label>
                  <Textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Describe what to do when triggered..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label>Priority</Label>
                    <Select value={taskPriority} onValueChange={setTaskPriority}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label>Assign to Agent</Label>
                    <Select value={taskAssignee} onValueChange={setTaskAssignee}>
                      <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None (inbox)</SelectItem>
                        {agentNames.map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {actionType === "send_notification" && (
              <>
                <div>
                  <Label>Slack Channel</Label>
                  <Input
                    value={slackChannel}
                    onChange={(e) => setSlackChannel(e.target.value)}
                    placeholder="#alerts"
                  />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={slackMessage}
                    onChange={(e) => setSlackMessage(e.target.value)}
                    placeholder="Monitor triggered: {{condition_summary}}"
                    rows={3}
                  />
                </div>
              </>
            )}

            {actionType === "trigger_agent" && (
              <div>
                <Label>Agent to Wake</Label>
                <Select value={agentName} onValueChange={setAgentName}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {agentNames.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {actionType === "log_alert" && (
              <div>
                <Label>Alert Message</Label>
                <Textarea
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  placeholder="Monitor triggered: {{condition_summary}}"
                  rows={3}
                />
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Template variables: <Badge variant="secondary" className="text-xs">{"{{condition_summary}}"}</Badge>{" "}
              <Badge variant="secondary" className="text-xs">{"{{monitor_id}}"}</Badge>{" "}
              <Badge variant="secondary" className="text-xs">{"{{response_preview}}"}</Badge>
            </p>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { onOpenChange(false); resetForm(); }}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                {monitorId ? "Save Changes" : "Create Monitor"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
