import { useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AgentStatusCard } from "@/components/AgentStatusCard";
import { ActivityItem } from "@/components/ActivityItem";
import { StatCard } from "@/components/StatCard";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Loader, CheckCircle, Clock, Users } from "lucide-react";

const Index = () => {
  const agents = useQuery(api.agents.list) ?? [];
  const seedAgents = useMutation(api.agents.seed);
  const seeded = useRef(false);

  useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      seedAgents();
    }
  }, [seedAgents]);
  const tasks = useQuery(api.tasks.list, {}) ?? [];
  const activity = useQuery(api.activityFns.list, { limit: 20 }) ?? [];

  const stats = {
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    completedToday: tasks.filter(t => t.status === "done").length,
    pendingReview: tasks.filter(t => t.status === "in_review").length,
    activeAgents: agents.filter(a => a.status === "online" || a.status === "working").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time squad monitoring</p>
        </div>

        {/* Agent Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {agents.map(agent => (
            <AgentStatusCard key={agent._id} agent={agent} />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="In Progress" value={stats.inProgress} icon={Loader} />
          <StatCard label="Completed Today" value={stats.completedToday} icon={CheckCircle} />
          <StatCard label="Pending Review" value={stats.pendingReview} icon={Clock} />
          <StatCard label="Active Agents" value={stats.activeAgents} icon={Users} />
        </div>

        {/* Activity Stream */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-0">
            {activity.map(entry => (
              <ActivityItem key={entry._id} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
