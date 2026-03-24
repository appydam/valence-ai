import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Radio, Zap, CheckCircle2, AlertTriangle } from "lucide-react";
import { MonitorCard } from "@/components/monitors/MonitorCard";
import { MonitorDialog } from "@/components/monitors/MonitorDialog";
import { MonitorEventList } from "@/components/monitors/MonitorEventList";
import { MonitorTemplates, type MonitorTemplate } from "@/components/monitors/MonitorTemplates";
import { Id } from "../../convex/_generated/dataModel";

export default function Monitors() {
  const userId = useCurrentUserId();
  const [activeTab, setActiveTab] = useState("monitors");
  const [showDialog, setShowDialog] = useState(false);
  const [editMonitorId, setEditMonitorId] = useState<Id<"monitors"> | undefined>();
  const [selectedTemplate, setSelectedTemplate] = useState<MonitorTemplate | null>(null);

  const monitors = useQuery(api.monitors.list, userId ? { userId } : "skip");
  const recentEvents = useQuery(
    api.monitors.getRecentEvents,
    userId ? { userId, limit: 50 } : "skip"
  );

  const activeCount = monitors?.filter((m) => m.status === "active").length ?? 0;
  const errorCount = monitors?.filter((m) => m.status === "error").length ?? 0;
  const totalTriggers = monitors?.reduce((sum, m) => sum + m.totalTriggers, 0) ?? 0;

  const handleEdit = (id: Id<"monitors">) => {
    setEditMonitorId(id);
    setSelectedTemplate(null);
    setShowDialog(true);
  };

  const handleNewFromTemplate = (template: MonitorTemplate) => {
    setEditMonitorId(undefined);
    setSelectedTemplate(template);
    setShowDialog(true);
  };

  const handleNew = () => {
    setEditMonitorId(undefined);
    setSelectedTemplate(null);
    setShowDialog(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Radio className="w-6 h-6 text-primary" />
              Continuous Monitors
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              24/7 monitoring of external services with automated actions
            </p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Monitor
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCount}</p>
                  <p className="text-xs text-muted-foreground">Active Monitors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalTriggers}</p>
                  <p className="text-xs text-muted-foreground">Total Triggers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{errorCount}</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="monitors">
              Active Monitors ({monitors?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="events">
              Events
            </TabsTrigger>
            <TabsTrigger value="templates">
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Monitors Tab */}
          <TabsContent value="monitors" className="mt-4">
            {!monitors || monitors.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Radio className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No monitors yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a monitor to start watching your external services 24/7.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleNew}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Monitor
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("templates")}>
                      Browse Templates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {monitors.map((monitor) => (
                  <MonitorCard
                    key={monitor._id}
                    monitor={monitor}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Events</CardTitle>
              </CardHeader>
              <CardContent>
                <MonitorEventList
                  events={(recentEvents ?? []) as any}
                  showMonitorName
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-4">
            <MonitorTemplates onSelect={handleNewFromTemplate} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Dialog */}
      <MonitorDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        userId={userId}
        monitorId={editMonitorId}
        template={selectedTemplate}
      />
    </DashboardLayout>
  );
}
