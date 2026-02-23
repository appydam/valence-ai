import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Webhook,
  Plus,
  Settings,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Pause,
  Play,
  Trash2,
  ExternalLink,
  Copy,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WebhookEndpointDialog } from "@/components/webhooks/WebhookEndpointDialog";
import { Id } from "../../convex/_generated/dataModel";

export default function Webhooks() {
  const userId = useCurrentUserId();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("endpoints");
  const [showEndpointDialog, setShowEndpointDialog] = useState(false);
  const [selectedEndpointId, setSelectedEndpointId] = useState<Id<"webhookEndpoints"> | undefined>();

  // Fetch webhook endpoints
  const endpoints = useQuery(
    api.webhookEndpoints.list,
    userId ? { userId } : "skip"
  );

  // Fetch recent webhook events
  const recentEvents = useQuery(
    api.webhookReceiver.listEvents,
    userId ? { userId, limit: 50 } : "skip"
  );

  const copyWebhookUrl = (urlPath: string) => {
    const fullUrl = `${window.location.origin}${urlPath}`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: "Copied!",
      description: "Webhook URL copied to clipboard",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "paused":
        return "bg-yellow-500";
      case "disabled":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEventStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Processed</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case "processing":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      case "ignored":
        return <Badge variant="outline">Ignored</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Webhook className="w-8 h-8" />
              Webhooks
            </h1>
            <p className="text-muted-foreground mt-1">
              Automate agent tasks with real-time event triggers
            </p>
          </div>
          <Button size="lg" onClick={() => {
            setSelectedEndpointId(undefined);
            setShowEndpointDialog(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            New Webhook
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{endpoints?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Events Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentEvents?.filter(e =>
                e.receivedAt > Date.now() - 24 * 60 * 60 * 1000
              ).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {recentEvents && recentEvents.length > 0
                ? Math.round(
                    (recentEvents.filter((e) => e.status === "processed").length /
                      recentEvents.length) *
                      100
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasks Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentEvents?.filter((e) => e.taskId).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="endpoints">
            <Settings className="w-4 h-4 mr-2" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="events">
            <Activity className="w-4 h-4 mr-2" />
            Event History
          </TabsTrigger>
        </TabsList>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-4">
          {!endpoints || endpoints.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Webhook className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No webhooks yet</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Create your first webhook endpoint to start receiving events from external
                  services and automate agent tasks.
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Webhook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {endpoints.map((endpoint) => (
                <Card key={endpoint._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(endpoint.status)}`} />
                          {endpoint.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {endpoint.blueprintName || "Integration"}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          {endpoint.status === "active" ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Webhook URL */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Webhook URL
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                          {endpoint.urlPath}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => copyWebhookUrl(endpoint.urlPath)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Event Types */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Event Types
                      </label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {endpoint.eventTypes.slice(0, 3).map((type) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                        {endpoint.eventTypes.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{endpoint.eventTypes.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                      <div>
                        <div className="text-xs text-muted-foreground">Received</div>
                        <div className="text-sm font-semibold">{endpoint.totalReceived}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Processed</div>
                        <div className="text-sm font-semibold text-green-600">
                          {endpoint.totalProcessed}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Failed</div>
                        <div className="text-sm font-semibold text-red-600">
                          {endpoint.totalFailed}
                        </div>
                      </div>
                    </div>

                    {/* Security */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {endpoint.signatureMethod !== "none" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          <span>Signature verification enabled ({endpoint.signatureMethod})</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-yellow-600" />
                          <span>No signature verification</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Last 50 webhook events received
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!recentEvents || recentEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No webhook events yet
                </div>
              ) : (
                <div className="space-y-2">
                  {recentEvents.map((event) => (
                    <div
                      key={event._id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {event.blueprintSlug}
                          </Badge>
                          <span className="text-sm font-medium">{event.eventType}</span>
                          {getEventStatusBadge(event.status)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.receivedAt).toLocaleString()}
                          {event.endpointName && ` • ${event.endpointName}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.taskId && (
                          <Badge className="bg-blue-500">
                            Task Created
                          </Badge>
                        )}
                        {event.errorMessage && (
                          <Badge variant="destructive">
                            {event.errorMessage.substring(0, 30)}...
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {userId && (
        <WebhookEndpointDialog
          open={showEndpointDialog}
          onOpenChange={setShowEndpointDialog}
          userId={userId}
          endpointId={selectedEndpointId}
        />
      )}
    </div>
    </DashboardLayout>
  );
}
