import { useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AgentStatusCard } from "@/components/AgentStatusCard";
import { StatCard } from "@/components/StatCard";
import { LiveOpsFeed } from "@/components/LiveOpsFeed";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Loader, CheckCircle, Clock, Users } from "lucide-react";
import { GettingStartedChecklist } from "@/components/GettingStartedChecklist";

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

  const stats = {
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    completedToday: tasks.filter(t => t.status === "done").length,
    pendingReview: tasks.filter(t => t.status === "in_review").length,
    activeAgents: agents.filter(a => a.status === "online" || a.status === "working").length,
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Ops Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time squad operations — watch agents work</p>
        </div>

        {/* Getting Started Checklist */}
        <GettingStartedChecklist />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
          <StatCard label="In Progress" value={stats.inProgress} icon={Loader} />
          <StatCard label="Completed" value={stats.completedToday} icon={CheckCircle} />
          <StatCard label="In Review" value={stats.pendingReview} icon={Clock} />
          <StatCard label="Active Agents" value={stats.activeAgents} icon={Users} />
        </div>

        {/* Live Ops Feed — unified real-time event stream */}
        <div className="flex-1 relative min-h-[400px]">
          <LiveOpsFeed />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
