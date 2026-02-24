import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Target,
  Activity,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AGENT_COLORS = {
  Kaze: "#3b82f6", // blue
  Scout: "#8b5cf6", // purple
  Forge: "#f97316", // orange
  Ghost: "#10b981", // green
  Sentinel: "#ec4899", // pink
};

export default function Analytics() {
  const [timePeriod, setTimePeriod] = useState<"7" | "30" | "90">("30");
  const [selectedAgent, setSelectedAgent] = useState<"all" | "Kaze" | "Scout" | "Forge" | "Ghost" | "Sentinel">("all");

  // Fetch dashboard overview
  const overview = useQuery(api.analytics.getDashboardOverview);

  // Fetch task trends
  const taskTrends = useQuery(api.analytics.getTaskTrends, {
    days: parseInt(timePeriod),
    agentName: selectedAgent === "all" ? undefined : selectedAgent,
  });

  // Fetch agent performance
  const agentPerformance = useQuery(api.analytics.getAgentPerformance, {
    periodType: "daily",
    limit: 30,
  });

  // Fetch completion times
  const completionTimes = useQuery(api.analytics.getCompletionTimes, {
    limit: 100,
  });

  // Fetch integration usage
  const integrationUsage = useQuery(api.analytics.getIntegrationUsage, {
    days: parseInt(timePeriod),
  });

  // Prepare task status data for pie chart
  const taskStatusData = overview?.tasksByStatus
    ? [
        { name: "Inbox", value: overview.tasksByStatus.inbox, color: "#94a3b8" },
        { name: "Assigned", value: overview.tasksByStatus.assigned, color: "#60a5fa" },
        { name: "In Progress", value: overview.tasksByStatus.in_progress, color: "#fbbf24" },
        { name: "In Review", value: overview.tasksByStatus.in_review, color: "#a78bfa" },
        { name: "Done", value: overview.tasksByStatus.done, color: "#34d399" },
      ]
    : [];

  // Prepare agent performance comparison data
  const agentComparisonData = overview?.agents.map((agent) => ({
    name: agent.name,
    completed: agent.tasksCompleted,
    active: agent.tasksActive,
  })) || [];

  // Format time in hours/minutes
  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <DashboardLayout>
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="w-8 h-8" />
              Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Performance metrics and insights across your agent workforce
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedAgent} onValueChange={(v: any) => setSelectedAgent(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="Kaze">Kaze 🌀</SelectItem>
                <SelectItem value="Scout">Scout 🔭</SelectItem>
                <SelectItem value="Forge">Forge 🔨</SelectItem>
                <SelectItem value="Ghost">Ghost 👻</SelectItem>
                <SelectItem value="Sentinel">Sentinel 🔍</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timePeriod} onValueChange={(v: any) => setTimePeriod(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview?.overview.totalTasks || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.overview.totalActive || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {overview?.overview.totalCompleted || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.overview.tasksCompletedLast24h || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg. Completion Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {completionTimes ? formatDuration(completionTimes.avgTotalDuration) : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {completionTimes?.count || 0} tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Webhook Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {overview?.webhooks.receivedLast24h || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.webhooks.totalReceived || 0} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">
            <TrendingUp className="w-4 h-4 mr-2" />
            Task Trends
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Users className="w-4 h-4 mr-2" />
            Agent Performance
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Activity className="w-4 h-4 mr-2" />
            Integration Usage
          </TabsTrigger>
        </TabsList>

        {/* Task Trends */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Task Completion Trends</CardTitle>
                <CardDescription>
                  Daily task completions over the last {timePeriod} days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={taskTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Tasks Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasks by Status</CardTitle>
                <CardDescription>Current distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={taskStatusData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                      >
                        {taskStatusData.filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [value, name]}
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-full space-y-2">
                    {taskStatusData.map((item) => {
                      const total = taskStatusData.reduce((s, d) => s + d.value, 0);
                      const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                      return (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
                            <span className="text-muted-foreground">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold tabular-nums">{item.value}</span>
                            <span className="text-muted-foreground text-xs w-8 text-right">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Agent Performance */}
        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Task Comparison</CardTitle>
              <CardDescription>
                Completed vs. active tasks by agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={agentComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#34d399" name="Completed" />
                  <Bar dataKey="active" fill="#fbbf24" name="Active" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overview?.agents.map((agent) => (
              <Card key={agent.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <CardDescription>
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        agent.status === "online"
                          ? "text-green-600"
                          : agent.status === "working"
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="font-semibold">{agent.tasksCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <span className="font-semibold">{agent.tasksActive}</span>
                    </div>
                    {agent.lastHeartbeat && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Last seen: {new Date(agent.lastHeartbeat).toLocaleString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Integration Usage */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Integration Activity</h3>
              <p className="text-xs text-muted-foreground mt-0.5">API calls by integration over the last {timePeriod} days</p>
            </div>
            {integrationUsage && Object.keys(integrationUsage.byIntegration).length > 0 && (
              <div className="text-xs text-muted-foreground">
                {Object.values(integrationUsage.byIntegration).reduce((s, v) => s + v.total, 0)} total calls
              </div>
            )}
          </div>
          {integrationUsage && Object.keys(integrationUsage.byIntegration).length > 0 ? (
            <div className="rounded-lg border border-border divide-y divide-border">
              {Object.entries(integrationUsage.byIntegration).map(([integration, stats]) => (
                <div key={integration} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-foreground">{integration}</span>
                  <span className="text-sm font-semibold tabular-nums text-muted-foreground">{stats.total} calls</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border flex flex-col items-center justify-center py-16 text-center">
              <Activity className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
              <p className="text-sm font-medium text-muted-foreground">No integration activity</p>
              <p className="text-xs text-muted-foreground mt-1">No API calls recorded in the last {timePeriod} days</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  );
}
