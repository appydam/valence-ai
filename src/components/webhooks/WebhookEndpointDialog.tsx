import { useState } from "react";
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
import { X, Plus } from "lucide-react";

interface WebhookEndpointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  endpointId?: Id<"webhookEndpoints">;
}

export function WebhookEndpointDialog({
  open,
  onOpenChange,
  userId,
  endpointId,
}: WebhookEndpointDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [blueprintId, setBlueprintId] = useState<Id<"blueprints"> | "">("");
  const [signatureMethod, setSignatureMethod] = useState<
    "hmac_sha256" | "hmac_sha1" | "jwt" | "none"
  >("hmac_sha256");
  const [secret, setSecret] = useState("");
  const [signatureHeader, setSignatureHeader] = useState("x-signature");
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [newEventType, setNewEventType] = useState("");

  // Fetch available blueprints
  const blueprints = useQuery(api.blueprints.list, { status: "active" });

  const createEndpoint = useMutation(api.webhookEndpoints.create);
  const updateEndpoint = useMutation(api.webhookEndpoints.update);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Webhook name is required",
        variant: "destructive",
      });
      return;
    }

    if (!blueprintId) {
      toast({
        title: "Error",
        description: "Please select an integration",
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

    try {
      // Generate URL path from name
      const urlPath = `/webhooks/${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

      if (endpointId) {
        await updateEndpoint({
          id: endpointId,
          name,
          description: description || undefined,
          signatureMethod,
          secret: secret || undefined,
          signatureHeader: signatureHeader || undefined,
          eventTypes,
        });

        toast({
          title: "Success",
          description: "Webhook endpoint updated successfully",
        });
      } else {
        await createEndpoint({
          blueprintId: blueprintId as Id<"blueprints">,
          userId,
          name,
          description: description || undefined,
          urlPath,
          signatureMethod,
          secret: secret || undefined,
          signatureHeader: signatureHeader || undefined,
          eventTypes,
        });

        toast({
          title: "Success",
          description: "Webhook endpoint created successfully",
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
    setBlueprintId("");
    setSignatureMethod("hmac_sha256");
    setSecret("");
    setSignatureHeader("x-signature");
    setEventTypes([]);
    setNewEventType("");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {endpointId ? "Edit Webhook Endpoint" : "Create Webhook Endpoint"}
          </DialogTitle>
          <DialogDescription>
            Configure a webhook endpoint to receive events from external services
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Webhook Name *</Label>
            <Input
              id="name"
              placeholder="e.g., GitHub Pull Requests"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What this webhook is used for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Integration */}
          <div className="space-y-2">
            <Label htmlFor="blueprint">Integration *</Label>
            <Select
              value={blueprintId as string}
              onValueChange={(value) => setBlueprintId(value as Id<"blueprints">)}
              disabled={!!endpointId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select integration" />
              </SelectTrigger>
              <SelectContent>
                {blueprints?.map((bp) => (
                  <SelectItem key={bp._id} value={bp._id}>
                    {bp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Event Types */}
          <div className="space-y-2">
            <Label>Event Types *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., pull_request, issue, push"
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
              {eventTypes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Add event types that this webhook should listen for. Use "*" for all events.
                </p>
              )}
            </div>
          </div>

          {/* Signature Method */}
          <div className="space-y-2">
            <Label htmlFor="signatureMethod">Signature Verification</Label>
            <Select
              value={signatureMethod}
              onValueChange={(value: any) => setSignatureMethod(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hmac_sha256">HMAC SHA-256 (Recommended)</SelectItem>
                <SelectItem value="hmac_sha1">HMAC SHA-1</SelectItem>
                <SelectItem value="jwt">JWT</SelectItem>
                <SelectItem value="none">None (Not Recommended)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Secret (if not "none") */}
          {signatureMethod !== "none" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="secret">Webhook Secret</Label>
                <Input
                  id="secret"
                  type="password"
                  placeholder="Your webhook secret from the provider"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This is the secret key provided by the external service (GitHub, Stripe, etc.)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signatureHeader">Signature Header Name</Label>
                <Input
                  id="signatureHeader"
                  placeholder="e.g., x-hub-signature-256"
                  value={signatureHeader}
                  onChange={(e) => setSignatureHeader(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The HTTP header name containing the signature (e.g., x-hub-signature-256 for GitHub)
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {endpointId ? "Update Endpoint" : "Create Endpoint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
