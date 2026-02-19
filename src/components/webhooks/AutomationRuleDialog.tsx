import { useState } from "react";
import { useMutation } from "convex/react";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AutomationRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  endpointId: Id<"webhookEndpoints">;
  ruleId?: Id<"automationRules">;
}

type ActionType = "create_task" | "send_notification" | "trigger_agent" | "execute_tool";
type AgentName = "Kaze" | "Scout" | "Forge" | "Ghost";
type Priority = "low" | "medium" | "high" | "urgent";

export function AutomationRuleDialog({
  open,
  onOpenChange,
  userId,
  endpointId,
  ruleId,
}: AutomationRuleDialogProps) {
  const { toast } = useToast();

  // Basic fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [newEventType, setNewEventType] = useState("");
  const [actionType, setActionType] = useState<ActionType>("create_task");

  // Task template fields
  const [titleTemplate, setTitleTemplate] = useState("");
  const [descriptionTemplate, setDescriptionTemplate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [assignee, setAssignee] = useState<AgentName | "">("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const createRule = useMutation(api.automationRules.create);
  const updateRule = useMutation(api.automationRules.update);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Rule name is required",
        variant: "destructive",
      });
      return;
    }

    if (eventTypes.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one event type",
        variant: "destructive",
      });
      return;
    }

    if (actionType === "create_task") {
      if (!titleTemplate.trim() || !descriptionTemplate.trim()) {
        toast({
          title: "Error",
          description: "Task title and description templates are required",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const taskTemplate =
        actionType === "create_task"
          ? {
              titleTemplate,
              descriptionTemplate,
              priority,
              assignee: assignee || undefined,
              tags,
            }
          : undefined;

      if (ruleId) {
        await updateRule({
          id: ruleId,
          name,
          description: description || undefined,
          eventTypes,
          actionConfig: JSON.stringify({}), // TODO: Add action config
          taskTemplate,
          enabled,
        });

        toast({
          title: "Success",
          description: "Automation rule updated successfully",
        });
      } else {
        await createRule({
          endpointId,
          userId,
          name,
          description: description || undefined,
          eventTypes,
          actionType,
          actionConfig: JSON.stringify({}), // TODO: Add action config
          taskTemplate,
          enabled,
        });

        toast({
          title: "Success",
          description: "Automation rule created successfully",
        });
      }

      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setEnabled(true);
    setEventTypes([]);
    setNewEventType("");
    setActionType("create_task");
    setTitleTemplate("");
    setDescriptionTemplate("");
    setPriority("medium");
    setAssignee("");
    setTags([]);
    setNewTag("");
  };

  const addEventType = () => {
    if (newEventType.trim() && !eventTypes.includes(newEventType.trim())) {
      setEventTypes([...eventTypes, newEventType.trim()]);
      setNewEventType("");
    }
  };

  const removeEventType = (type: string) => {
    setEventTypes(eventTypes.filter((t) => t !== type));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ruleId ? "Edit Automation Rule" : "Create Automation Rule"}
          </DialogTitle>
          <DialogDescription>
            Define what should happen when specific webhook events are received
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Create task for new GitHub issue"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What this rule does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Event Types */}
          <div className="space-y-2">
            <Label>Trigger Event Types *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., issues, pull_request, push"
                value={newEventType}
                onChange={(e) => setNewEventType(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addEventType()}
              />
              <Button type="button" onClick={addEventType} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {eventTypes.map((type) => (
                <Badge key={type} variant="secondary" className="gap-1">
                  {type}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeEventType(type)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Type */}
          <div className="space-y-2">
            <Label htmlFor="actionType">Action Type *</Label>
            <Select
              value={actionType}
              onValueChange={(value: ActionType) => setActionType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create_task">Create Task</SelectItem>
                <SelectItem value="send_notification">Send Notification</SelectItem>
                <SelectItem value="trigger_agent">Trigger Agent</SelectItem>
                <SelectItem value="execute_tool">Execute Integration Tool</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Task Template (if action is create_task) */}
          {actionType === "create_task" && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-semibold flex items-center gap-2">
                Task Template
                <Info className="w-4 h-4 text-muted-foreground" />
              </h4>

              <Alert>
                <AlertDescription className="text-xs">
                  Use <code className="bg-background px-1">&#123;&#123;path.to.field&#125;&#125;</code> syntax to insert data from the webhook payload.
                  Example: <code className="bg-background px-1">&#123;&#123;issue.title&#125;&#125;</code>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="titleTemplate">Task Title Template *</Label>
                <Input
                  id="titleTemplate"
                  placeholder="e.g., New GitHub issue: {{issue.title}}"
                  value={titleTemplate}
                  onChange={(e) => setTitleTemplate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionTemplate">Task Description Template *</Label>
                <Textarea
                  id="descriptionTemplate"
                  placeholder="e.g., GitHub issue #{{issue.number}} was created by {{issue.user.login}}&#10;&#10;{{issue.body}}"
                  value={descriptionTemplate}
                  onChange={(e) => setDescriptionTemplate(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(value: Priority) => setPriority(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignee">Assign To</Label>
                  <Select
                    value={assignee as string}
                    onValueChange={(value) => setAssignee(value as AgentName | "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Inbox (Unassigned)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Inbox (Unassigned)</SelectItem>
                      <SelectItem value="Kaze">Kaze 🌀</SelectItem>
                      <SelectItem value="Scout">Scout 🔭</SelectItem>
                      <SelectItem value="Forge">Forge 🔨</SelectItem>
                      <SelectItem value="Ghost">Ghost 👻</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tags..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button type="button" onClick={addTag} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Rule</Label>
              <p className="text-sm text-muted-foreground">
                Rule will only execute if enabled
              </p>
            </div>
            <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {ruleId ? "Update Rule" : "Create Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
