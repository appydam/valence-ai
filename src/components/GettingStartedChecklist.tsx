import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  CheckCircle2, Circle, Plug, FileText, Bot, Users, Webhook,
  ArrowRight, X, Rocket,
} from "lucide-react";
import { useUserTasks } from "@/hooks/useUserScoped";

interface CheckItem {
  id: string;
  label: string;
  description: string;
  link: string;
  icon: any;
  check: () => boolean;
}

export function GettingStartedChecklist() {
  const onboardingState = useQuery(api.onboarding.getCurrent);
  const tasks = useUserTasks();
  const agents = useQuery(api.agents.list) ?? [];
  const teamMembers = useQuery(api.users.listTeamMembers) ?? [];

  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem("mc_checklist_dismissed") === "true";
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  // Don't show if onboarding hasn't been completed (they're still in the wizard)
  if (onboardingState && !onboardingState.completed) return null;

  const hasIntegration = (onboardingState?.integrationsConnected?.length ?? 0) > 0;
  const hasTask = tasks.length > 0;
  const hasCompletedTask = tasks.some((t) => t.status === "done");
  const hasTeamMember = teamMembers.length > 1;
  const hasActiveAgent = agents.some((a) => a.status === "online" || a.status === "working");

  const items: CheckItem[] = [
    {
      id: "integration",
      label: "Connect an integration",
      description: "Link GitHub, Slack, or another tool",
      link: "/integrations",
      icon: Plug,
      check: () => hasIntegration,
    },
    {
      id: "task",
      label: "Create your first task",
      description: "Give your agents something to do",
      link: "/board",
      icon: FileText,
      check: () => hasTask,
    },
    {
      id: "completed",
      label: "Complete a task",
      description: "See agents deliver results",
      link: "/board",
      icon: Bot,
      check: () => hasCompletedTask,
    },
    {
      id: "team",
      label: "Invite a teammate",
      description: "Collaborate with your team",
      link: "/settings",
      icon: Users,
      check: () => hasTeamMember,
    },
  ];

  const completedCount = items.filter((i) => i.check()).length;
  const allComplete = completedCount === items.length;

  // Auto-dismiss when all items are done
  if (allComplete) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem("mc_checklist_dismissed", "true");
    } catch {
      // localStorage not available
    }
  };

  const pct = Math.round((completedCount / items.length) * 100);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Getting Started</h3>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{items.length} complete
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title="Dismiss checklist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const done = item.check();
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.link}
              className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                done
                  ? "bg-green-500/5 border border-green-500/10"
                  : "hover:bg-secondary border border-transparent"
              }`}
            >
              {done ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${done ? "text-green-500 line-through" : "text-foreground"}`}>
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              {!done && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
