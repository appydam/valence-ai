import { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Target,
  Activity,
  Zap,
  Inbox,
  Timer,
  ListChecks,
  ArrowRight,
  Crown,
  Medal,
  Gauge,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
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

const AGENT_COLORS: Record<string, string> = {
  Kaze: "#3b82f6",
  Scout: "#8b5cf6",
  Forge: "#f97316",
  Ghost: "#10b981",
  Sentinel: "#ec4899",
};

const AGENT_EMOJIS: Record<string, string> = {
  Kaze: "🌀",
  Scout: "🔭",
  Forge: "🔨",
  Ghost: "👻",
  Sentinel: "🔍",
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#6b7280",
};

const STATUS_COLORS: Record<string, string> = {
  inbox: "#94a3b8",
  assigned: "#60a5fa",
  in_progress: "#fbbf24",
  in_review: "#a78bfa",
  done: "#34d399",
  cancelled: "#f87171",
};

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

export default function Analytics() {
  const [timePeriod, setTimePeriod] = useState<"7" | "30" | "90">("30");
  const [selectedAgent, setSelectedAgent] = useState<"all" | "Kaze" | "Scout" | "Forge" | "Ghost" | "Sentinel">("all");

  const overview = useQuery(api.analytics.getDashboardOverview);
  const taskTrends = useQuery(api.analytics.getTaskTrends, {
    days: parseInt(timePeriod),
    agentName: selectedAgent === "all" ? undefined : selectedAgent,
  });
  const completionTimes = useQuery(api.analytics.getCompletionTimes, {
    limit: 100,
  });
  const integrationUsage = useQuery(api.analytics.getIntegrationUsage, {
    days: parseInt(timePeriod),
  });
  const taskBreakdown = useQuery(api.analytics.getTaskBreakdown, {
    days: parseInt(timePeriod),
  });

  // Task status pie chart data
  const taskStatusData = overview?.tasksByStatus
    ? [
        { name: "Inbox", value: overview.tasksByStatus.inbox, color: STATUS_COLORS.inbox },
        { name: "Assigned", value: overview.tasksByStatus.assigned, color: STATUS_COLORS.assigned },
        { name: "In Progress", value: overview.tasksByStatus.in_progress, color: STATUS_COLORS.in_progress },
        { name: "In Review", value: overview.tasksByStatus.in_review, color: STATUS_COLORS.in_review },
        { name: "Done", value: overview.tasksByStatus.done, color: STATUS_COLORS.done },
      ]
    : [];

  // Priority pie chart data
  const priorityChartData = taskBreakdown
    ? [
        { name: "Urgent", value: taskBreakdown.byPriority.urgent, color: PRIORITY_COLORS.urgent },
        { name: "High", value: taskBreakdown.byPriority.high, color: PRIORITY_COLORS.high },
        { name: "Medium", value: taskBreakdown.byPriority.medium, color: PRIORITY_COLORS.medium },
        { name: "Low", value: taskBreakdown.byPriority.low, color: PRIORITY_COLORS.low },
      ]
    : [];

  // Agent leaderboard sorted by completed tasks
  const agentLeaderboard = useMemo(() => {
    if (!taskBreakdown) return [];
    return [...taskBreakdown.agentBreakdown].sort((a, b) => b.completed - a.completed);
  }, [taskBreakdown]);

  // Radar chart data for agent comparison
  const radarData = useMemo(() => {
    if (!taskBreakdown) return [];
    const agents = taskBreakdown.agentBreakdown;
    const maxCompleted = Math.max(...agents.map((a) => a.completed), 1);
    const maxActive = Math.max(...agents.map((a) => a.active), 1);
    const maxTotal = Math.max(...agents.map((a) => a.total), 1);
    const maxAvgTime = Math.max(...agents.map((a) => a.avgCompletionTime), 1);

    return [
      {
        metric: "Completed",
        ...Object.fromEntries(agents.map((a) => [a.name, Math.round((a.completed / maxCompleted) * 100)])),
      },
      {
        metric: "Active Load",
        ...Object.fromEntries(agents.map((a) => [a.name, Math.round((a.active / maxActive) * 100)])),
      },
      {
        metric: "Total Assigned",
        ...Object.fromEntries(agents.map((a) => [a.name, Math.round((a.total / maxTotal) * 100)])),
      },
      {
        metric: "Speed",
        ...Object.fromEntries(
          agents.map((a) => [
            a.name,
            a.avgCompletionTime > 0
              ? Math.round((1 - a.avgCompletionTime / maxAvgTime) * 100)
              : 0,
          ])
        ),
      },
      {
        metric: "Completion %",
        ...Object.fromEntries(
          agents.map((a) => [
            a.name,
            a.total > 0 ? Math.round((a.completed / a.total) * 100) : 0,
          ])
        ),
      },
    ];
  }, [taskBreakdown]);

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms <= 0) return "—";
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Format compact duration
  const formatCompactDuration = (ms: number) => {
    if (ms <= 0) return "—";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Relative time
  const getRelativeTime = (ts: number) => {
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Computed metrics
  const completionRate = overview
    ? overview.overview.totalTasks > 0
      ? Math.round((overview.overview.totalCompleted / overview.overview.totalTasks) * 100)
      : 0
    : 0;

  const agentsOnline = overview?.agents.filter(
    (a) => a.status === "online" || a.status === "working"
  ).length || 0;

  // Throughput: avg tasks completed per day in period
  const throughput = useMemo(() => {
    if (!taskBreakdown?.velocity || taskBreakdown.velocity.length === 0) return 0;
    const total = taskBreakdown.velocity.reduce((s, d) => s + d.completed, 0);
    return (total / taskBreakdown.velocity.length).toFixed(1);
  }, [taskBreakdown]);

  // Pipeline data for funnel
  const pipelineData = overview?.tasksByStatus
    ? [
        { stage: "Inbox", count: overview.tasksByStatus.inbox, color: STATUS_COLORS.inbox },
        { stage: "Assigned", count: overview.tasksByStatus.assigned, color: STATUS_COLORS.assigned },
        { stage: "In Progress", count: overview.tasksByStatus.in_progress, color: STATUS_COLORS.in_progress },
        { stage: "In Review", count: overview.tasksByStatus.in_review, color: STATUS_COLORS.in_review },
        { stage: "Done", count: overview.tasksByStatus.done, color: STATUS_COLORS.done },
      ]
    : [];

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
                <SelectItem value="Kaze">Kaze</SelectItem>
                <SelectItem value="Scout">Scout</SelectItem>
                <SelectItem value="Forge">Forge</SelectItem>
                <SelectItem value="Ghost">Ghost</SelectItem>
                <SelectItem value="Sentinel">Sentinel</SelectItem>
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

      {/* Overview Stats - 6 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.overview.totalTasks || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.overview.totalActive || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overview?.overview.totalCompleted || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.overview.tasksCompletedLast24h || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5" />
              Throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{throughput}<span className="text-sm font-normal text-muted-foreground">/day</span></div>
            <p className="text-xs text-muted-foreground mt-1">
              avg over {timePeriod}d
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Agents Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentsOnline}<span className="text-base font-normal text-muted-foreground">/5</span></div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.agents.filter((a) => a.status === "working").length || 0} working
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Inbox className="w-3.5 h-3.5" />
              Unassigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {taskBreakdown?.unassigned || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              awaiting assignment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Users className="w-4 h-4 mr-2" />
            Agent Performance
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ListChecks className="w-4 h-4 mr-2" />
            Task Details
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Activity className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* ============================================ */}
        {/* OVERVIEW TAB                                 */}
        {/* ============================================ */}
        <TabsContent value="overview" className="space-y-4">
          {/* Task Pipeline */}
          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground shrink-0 mr-1">Pipeline</span>
                {pipelineData.map((stage, i) => (
                  <div key={stage.stage} className="flex items-center gap-1.5 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 rounded-md px-2 py-1.5" style={{ background: `${stage.color}15` }}>
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: stage.color }} />
                        <span className="text-[11px] text-muted-foreground truncate">{stage.stage}</span>
                        <span className="text-xs font-bold tabular-nums ml-auto">{stage.count}</span>
                      </div>
                    </div>
                    {i < pipelineData.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Velocity chart + Status/Priority donuts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Task Velocity</CardTitle>
                <CardDescription>
                  Tasks created vs completed per day (last {Math.min(parseInt(timePeriod), 30)} days)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={taskBreakdown?.velocity || []}>
                    <defs>
                      <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => {
                        const d = new Date(v);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                      }}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Area type="monotone" dataKey="created" stroke="#60a5fa" fill="url(#gradCreated)" strokeWidth={2} name="Created" />
                    <Area type="monotone" dataKey="completed" stroke="#34d399" fill="url(#gradCompleted)" strokeWidth={2} name="Completed" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Dual donut: Status + Priority */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <ResponsiveContainer width={100} height={100}>
                      <PieChart>
                        <Pie data={taskStatusData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={2} dataKey="value" labelLine={false}>
                          {taskStatusData.filter(d => d.value > 0).map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number, name: string) => [value, name]} contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1">
                      {taskStatusData.map((item) => {
                        const total = taskStatusData.reduce((s, d) => s + d.value, 0);
                        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                        return (
                          <div key={item.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: item.color }} />
                              <span className="text-muted-foreground">{item.name}</span>
                            </div>
                            <span className="font-semibold tabular-nums">{item.value} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Priority Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <ResponsiveContainer width={100} height={100}>
                      <PieChart>
                        <Pie data={priorityChartData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={2} dataKey="value" labelLine={false}>
                          {priorityChartData.filter(d => d.value > 0).map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number, name: string) => [value, name]} contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1">
                      {priorityChartData.map((item) => {
                        const total = priorityChartData.reduce((s, d) => s + d.value, 0);
                        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                        return (
                          <div key={item.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                              <span className="text-muted-foreground">{item.name}</span>
                            </div>
                            <span className="font-semibold tabular-nums">{item.value} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Completion trend + Agent activity roster + Timing */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Completion Trend</CardTitle>
                <CardDescription>
                  Daily completions over the last {timePeriod} days
                  {selectedAgent !== "all" && ` — ${selectedAgent}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={taskTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => {
                        const d = new Date(v);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                      }}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} name="Completed" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Agent Activity Roster */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Agent Roster</CardTitle>
                <CardDescription className="text-xs">Live status & workload</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overview?.agents.map((agent) => {
                    const breakdown = taskBreakdown?.agentBreakdown.find((a) => a.name === agent.name);
                    const statusColor =
                      agent.status === "working" ? "text-blue-500" :
                      agent.status === "online" ? "text-green-500" :
                      agent.status === "idle" ? "text-amber-500" :
                      "text-muted-foreground";
                    const dotColor =
                      agent.status === "working" ? "bg-blue-500" :
                      agent.status === "online" ? "bg-green-500" :
                      agent.status === "idle" ? "bg-amber-500" :
                      "bg-muted-foreground";

                    return (
                      <div key={agent.name} className="flex items-center gap-3">
                        <div className="text-lg w-7 text-center">{AGENT_EMOJIS[agent.name] || "🤖"}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold" style={{ color: AGENT_COLORS[agent.name] }}>{agent.name}</span>
                            <span className={`flex items-center gap-1 text-[10px] ${statusColor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${agent.status === "working" ? "animate-pulse" : ""}`} />
                              {agent.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                            <span>{breakdown?.active || 0} active</span>
                            <span>{breakdown?.completed || 0} done</span>
                            {agent.lastHeartbeat && (
                              <span>{getRelativeTime(agent.lastHeartbeat)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timing + Webhooks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Timing Breakdown
                </CardTitle>
                <CardDescription>Average task lifecycle timings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Time to Start", value: completionTimes?.avgTimeToStart || 0, desc: "Created → In Progress" },
                    { label: "Work Duration", value: completionTimes?.avgTimeToComplete || 0, desc: "In Progress → Done" },
                    { label: "Total Lifecycle", value: completionTimes?.avgTotalDuration || 0, desc: "Created → Done" },
                  ].map((item) => {
                    const maxVal = Math.max(completionTimes?.avgTotalDuration || 1, 1);
                    const pct = item.value > 0 ? Math.round((item.value / maxVal) * 100) : 0;
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <span className="text-sm font-medium">{item.label}</span>
                            <span className="text-[10px] text-muted-foreground ml-2">{item.desc}</span>
                          </div>
                          <span className="text-sm font-bold tabular-nums">{formatDuration(item.value)}</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    );
                  })}
                  <p className="text-xs text-muted-foreground pt-1">Based on {completionTimes?.count || 0} completed tasks</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Webhook Activity
                </CardTitle>
                <CardDescription>Incoming webhook events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Last 24 hours</p>
                    <p className="text-3xl font-bold mt-1">{overview?.webhooks.receivedLast24h || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">All time</p>
                    <p className="text-3xl font-bold mt-1">{overview?.webhooks.totalReceived || 0}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Last 7d</p>
                      <p className="text-lg font-bold mt-0.5">{overview?.overview.tasksCompletedLast7d || 0}</p>
                      <p className="text-[10px] text-muted-foreground">completed</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last 30d</p>
                      <p className="text-lg font-bold mt-0.5">{overview?.overview.tasksCompletedLast30d || 0}</p>
                      <p className="text-[10px] text-muted-foreground">completed</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avg. Time</p>
                      <p className="text-lg font-bold mt-0.5">
                        {completionTimes ? formatDuration(completionTimes.avgTotalDuration) : "—"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">to complete</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============================================ */}
        {/* AGENT PERFORMANCE TAB                        */}
        {/* ============================================ */}
        <TabsContent value="agents" className="space-y-4">
          {/* Leaderboard + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Leaderboard */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Agent Leaderboard</CardTitle>
                <CardDescription>Ranked by total tasks completed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agentLeaderboard.map((agent, index) => {
                    const agentOverview = overview?.agents.find((a) => a.name === agent.name);
                    const rate = agent.total > 0 ? Math.round((agent.completed / agent.total) * 100) : 0;
                    const maxCompleted = agentLeaderboard[0]?.completed || 1;
                    const barPct = Math.round((agent.completed / maxCompleted) * 100);

                    return (
                      <div key={agent.name} className="group">
                        <div className="flex items-center gap-3">
                          {/* Rank */}
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                            style={{
                              background: index === 0 ? "linear-gradient(135deg, #fbbf24, #f59e0b)" :
                                         index === 1 ? "linear-gradient(135deg, #d1d5db, #9ca3af)" :
                                         index === 2 ? "linear-gradient(135deg, #d97706, #b45309)" :
                                         "hsl(var(--muted))",
                              color: index < 3 ? "white" : "hsl(var(--muted-foreground))",
                            }}
                          >
                            {index < 3 ? (
                              index === 0 ? <Crown className="w-4 h-4" /> :
                              <Medal className="w-4 h-4" />
                            ) : (
                              `#${index + 1}`
                            )}
                          </div>

                          {/* Agent info + bar */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{AGENT_EMOJIS[agent.name]}</span>
                                <span className="text-sm font-bold" style={{ color: AGENT_COLORS[agent.name] }}>{agent.name}</span>
                                <Badge
                                  variant={agentOverview?.status === "online" || agentOverview?.status === "working" ? "default" : "secondary"}
                                  className="text-[10px] h-4 px-1.5"
                                >
                                  {agentOverview?.status || "offline"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs">
                                <span className="text-muted-foreground">{agent.total} total</span>
                                <span className="text-green-600 font-semibold">{agent.completed} done</span>
                                <span className="font-bold tabular-nums">{rate}%</span>
                              </div>
                            </div>

                            {/* Stacked progress bar */}
                            <div className="h-3 rounded-full overflow-hidden bg-muted flex">
                              {agent.completed > 0 && (
                                <div
                                  className="h-full transition-all duration-500"
                                  style={{ width: `${barPct}%`, background: AGENT_COLORS[agent.name], opacity: 0.9 }}
                                />
                              )}
                              {agent.active > 0 && (
                                <div
                                  className="h-full transition-all duration-500"
                                  style={{ width: `${Math.round((agent.active / maxCompleted) * 100)}%`, background: AGENT_COLORS[agent.name], opacity: 0.4 }}
                                />
                              )}
                            </div>

                            {/* Sub-stats */}
                            <div className="flex items-center gap-4 mt-1 text-[11px] text-muted-foreground">
                              <span>{agent.active} active</span>
                              <span>{agent.inReview} in review</span>
                              <span>Avg {formatDuration(agent.avgCompletionTime)}</span>
                              {agent.completedInPeriod > 0 && (
                                <span className="text-green-600">{agent.completedInPeriod} in last {timePeriod}d</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Agent Comparison</CardTitle>
                <CardDescription>Relative performance across dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                    {Object.keys(AGENT_COLORS).map((name) => (
                      <Radar key={name} name={name} dataKey={name} stroke={AGENT_COLORS[name]} fill={AGENT_COLORS[name]} fillOpacity={0.1} strokeWidth={1.5} />
                    ))}
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Agent Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {taskBreakdown?.agentBreakdown.map((agent) => {
              const agentColor = AGENT_COLORS[agent.name] || "#6b7280";
              const agentOverview = overview?.agents.find((a) => a.name === agent.name);
              const rate = agent.total > 0 ? Math.round((agent.completed / agent.total) * 100) : 0;

              return (
                <Card key={agent.name} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1" style={{ background: agentColor }} />
                  <CardContent className="pt-5 space-y-3">
                    <div className="text-center">
                      <div className="text-2xl mb-1">{AGENT_EMOJIS[agent.name]}</div>
                      <p className="text-sm font-bold" style={{ color: agentColor }}>{agent.name}</p>
                      <Badge
                        variant={agentOverview?.status === "online" || agentOverview?.status === "working" ? "default" : "secondary"}
                        className="text-[10px] mt-1"
                      >
                        {agentOverview?.status || "offline"}
                      </Badge>
                    </div>

                    <div className="text-center">
                      <p className="text-3xl font-bold">{rate}%</p>
                      <p className="text-[10px] text-muted-foreground">completion rate</p>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completed</span>
                        <span className="font-semibold text-green-600">{agent.completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active</span>
                        <span className="font-semibold text-amber-600">{agent.active}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">In Review</span>
                        <span className="font-semibold text-violet-600">{agent.inReview}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg. Time</span>
                        <span className="font-semibold">{formatDuration(agent.avgCompletionTime)}</span>
                      </div>
                    </div>

                    {/* Priority micro-bar */}
                    <div className="pt-2 border-t border-border">
                      <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-muted">
                        {agent.total > 0 && (
                          <>
                            {agent.byPriority.urgent > 0 && <div className="h-full" style={{ width: `${(agent.byPriority.urgent / agent.total) * 100}%`, background: PRIORITY_COLORS.urgent }} />}
                            {agent.byPriority.high > 0 && <div className="h-full" style={{ width: `${(agent.byPriority.high / agent.total) * 100}%`, background: PRIORITY_COLORS.high }} />}
                            {agent.byPriority.medium > 0 && <div className="h-full" style={{ width: `${(agent.byPriority.medium / agent.total) * 100}%`, background: PRIORITY_COLORS.medium }} />}
                            {agent.byPriority.low > 0 && <div className="h-full" style={{ width: `${(agent.byPriority.low / agent.total) * 100}%`, background: PRIORITY_COLORS.low }} />}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ============================================ */}
        {/* TASK DETAILS TAB                             */}
        {/* ============================================ */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recently Completed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Recently Completed
                </CardTitle>
                <CardDescription>Last 10 completed tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {taskBreakdown?.recentCompleted && taskBreakdown.recentCompleted.length > 0 ? (
                  <div className="space-y-0 divide-y divide-border">
                    {taskBreakdown.recentCompleted.map((task) => (
                      <div key={task._id} className="py-2.5 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {task.assignee && (
                                <span className="text-xs font-medium" style={{ color: AGENT_COLORS[task.assignee] || "#6b7280" }}>
                                  {task.assignee}
                                </span>
                              )}
                              <Badge variant="outline" className="text-[10px] h-4 px-1" style={{ borderColor: PRIORITY_COLORS[task.priority], color: PRIORITY_COLORS[task.priority] }}>
                                {task.priority}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">
                              {task.completedAt ? getRelativeTime(task.completedAt) : ""}
                            </p>
                            <p className="text-xs font-medium text-muted-foreground mt-0.5">
                              {formatCompactDuration(task.duration)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground mb-2 opacity-40" />
                    <p className="text-sm text-muted-foreground">No completed tasks yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Currently In Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  In Progress
                </CardTitle>
                <CardDescription>Tasks currently being worked on</CardDescription>
              </CardHeader>
              <CardContent>
                {taskBreakdown?.inProgress && taskBreakdown.inProgress.length > 0 ? (
                  <div className="space-y-0 divide-y divide-border">
                    {taskBreakdown.inProgress.map((task) => (
                      <div key={task._id} className="py-2.5 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {task.assignee && (
                                <span className="text-xs font-medium" style={{ color: AGENT_COLORS[task.assignee] || "#6b7280" }}>
                                  {task.assignee}
                                </span>
                              )}
                              <Badge variant="outline" className="text-[10px] h-4 px-1" style={{ borderColor: PRIORITY_COLORS[task.priority], color: PRIORITY_COLORS[task.priority] }}>
                                {task.priority}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                              <Clock className="w-3 h-3" />
                              {formatCompactDuration(task.elapsed)}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">elapsed</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Activity className="w-8 h-8 text-muted-foreground mb-2 opacity-40" />
                    <p className="text-sm text-muted-foreground">No tasks in progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Agent workload matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Workload Matrix</CardTitle>
              <CardDescription>Task count by agent and priority</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Agent</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                        <span className="flex items-center justify-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLORS.urgent }} />
                          Urgent
                        </span>
                      </th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                        <span className="flex items-center justify-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLORS.high }} />
                          High
                        </span>
                      </th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                        <span className="flex items-center justify-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLORS.medium }} />
                          Medium
                        </span>
                      </th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">
                        <span className="flex items-center justify-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLORS.low }} />
                          Low
                        </span>
                      </th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Total</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Completed</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskBreakdown?.agentBreakdown.map((agent) => {
                      const rate = agent.total > 0 ? Math.round((agent.completed / agent.total) * 100) : 0;
                      return (
                        <tr key={agent.name} className="border-b border-border last:border-0">
                          <td className="py-2.5 pr-4">
                            <span className="font-medium" style={{ color: AGENT_COLORS[agent.name] }}>{agent.name}</span>
                          </td>
                          <td className="text-center py-2.5 px-3 tabular-nums">
                            {agent.byPriority.urgent > 0 ? <span className="font-semibold text-red-500">{agent.byPriority.urgent}</span> : <span className="text-muted-foreground">0</span>}
                          </td>
                          <td className="text-center py-2.5 px-3 tabular-nums">
                            {agent.byPriority.high > 0 ? <span className="font-semibold text-orange-500">{agent.byPriority.high}</span> : <span className="text-muted-foreground">0</span>}
                          </td>
                          <td className="text-center py-2.5 px-3 tabular-nums">
                            {agent.byPriority.medium > 0 ? <span className="font-semibold text-yellow-600">{agent.byPriority.medium}</span> : <span className="text-muted-foreground">0</span>}
                          </td>
                          <td className="text-center py-2.5 px-3 tabular-nums">
                            {agent.byPriority.low > 0 ? <span className="font-semibold">{agent.byPriority.low}</span> : <span className="text-muted-foreground">0</span>}
                          </td>
                          <td className="text-center py-2.5 px-3 font-semibold tabular-nums">{agent.total}</td>
                          <td className="text-center py-2.5 px-3 font-semibold tabular-nums text-green-600">{agent.completed}</td>
                          <td className="text-center py-2.5 px-3">
                            <span className={`font-semibold tabular-nums ${rate >= 75 ? "text-green-600" : rate >= 50 ? "text-amber-600" : rate > 0 ? "text-red-500" : "text-muted-foreground"}`}>
                              {rate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================ */}
        {/* INTEGRATIONS TAB                             */}
        {/* ============================================ */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Integration Activity</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                API calls by integration over the last {timePeriod} days
              </p>
            </div>
            {integrationUsage && Object.keys(integrationUsage.byIntegration).length > 0 && (
              <div className="text-xs text-muted-foreground">
                {Object.values(integrationUsage.byIntegration).reduce((s, v) => s + v.total, 0)} total calls
              </div>
            )}
          </div>
          {integrationUsage && Object.keys(integrationUsage.byIntegration).length > 0 ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={Object.entries(integrationUsage.byIntegration).map(
                        ([name, stats]) => ({ name, calls: stats.total })
                      )}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="calls" fill="#3b82f6" name="API Calls" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="rounded-lg border border-border divide-y divide-border">
                {Object.entries(integrationUsage.byIntegration).map(([integration, stats]) => (
                  <div key={integration} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-medium text-foreground">{integration}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold tabular-nums">{stats.total}</span>
                      <span className="text-xs text-muted-foreground ml-1">calls</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border flex flex-col items-center justify-center py-16 text-center">
              <Activity className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
              <p className="text-sm font-medium text-muted-foreground">No integration activity</p>
              <p className="text-xs text-muted-foreground mt-1">
                No API calls recorded in the last {timePeriod} days
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  );
}
