import { DashboardLayout } from "@/components/DashboardLayout";
import {
  HelpCircle,
  Bot,
  Plug,
  Webhook,
  Keyboard,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

const sections = [
  {
    title: "Getting Started",
    icon: HelpCircle,
    items: [
      { q: "What is Valence AI?", a: "Valence AI is a multi-agent orchestration platform. You create tasks, and your AI agents (Kaze, Scout, Forge, Ghost, Sentinel) autonomously plan, execute, review, and deliver work." },
      { q: "How do I create a task?", a: "Go to Mission Board or Autopilot, type a task description, set priority, and submit. Kaze (the coordinator) will break it down and delegate to the right agents." },
      { q: "What is Autopilot?", a: "Autopilot lets you describe what you need in plain English. It creates the task, assigns it, and kicks off execution automatically." },
    ],
  },
  {
    title: "Agents",
    icon: Bot,
    items: [
      { q: "Who are the agents?", a: "Kaze (coordinator/PM), Scout (research & analysis), Forge (engineering & code), Ghost (content & writing), Sentinel (quality review). Each has a specialized role." },
      { q: "What do agent statuses mean?", a: "Online = ready to work, Working = actively on a task, Idle = available but not assigned, Offline = not running." },
      { q: "Why is an agent offline?", a: "The agent process may have crashed or the server was restarted. Go to Agents page and click 'Wake' to restart it. If that fails, check Settings > SSH Config." },
      { q: "What is the Reasoning Stream?", a: "When agents work on tasks, they post live reasoning steps (thinking, tool calls, decisions). You can see these in the task detail panel." },
    ],
  },
  {
    title: "Integrations",
    icon: Plug,
    items: [
      { q: "How do I connect an integration?", a: "Go to Integrations, find the service you want (Gmail, Notion, Slack, etc.), and click Connect. For OAuth services, you'll authorize in a popup. For API key services, paste your key." },
      { q: "What integrations are supported?", a: "Gmail, Notion, Slack, GitHub, Google Sheets, Google Calendar, Google Analytics, HubSpot, Jira, and more. You can also create custom integrations from any API docs." },
      { q: "How do custom integrations work?", a: "Click 'New Integration', paste the API documentation URL, and AI will generate a blueprint with all available actions. Review, connect, and your agents can use it." },
    ],
  },
  {
    title: "Webhooks",
    icon: Webhook,
    items: [
      { q: "What are webhooks?", a: "Webhooks let external services push events into Mission Control. For example, a GitHub push or a Slack message can automatically create tasks." },
      { q: "How do I set up a webhook?", a: "Go to Webhooks, create a new endpoint, copy the URL, and paste it into your external service's webhook settings." },
    ],
  },
  {
    title: "Task Lifecycle",
    icon: MessageSquare,
    items: [
      { q: "What are the task statuses?", a: "Inbox (new) → Assigned (delegated to agent) → In Progress (agent working) → In Review (Sentinel reviewing) → Done (approved). Tasks can also be Cancelled or Rejected (sent back for rework)." },
      { q: "What happens when a task is rejected?", a: "Sentinel sends it back to the original agent with specific feedback. The agent reworks it and resubmits for review." },
      { q: "What is the Daily Brief?", a: "An auto-generated daily digest (8 AM IST) summarizing completed tasks, blockers, agent performance, and highlights from the last 24 hours." },
    ],
  },
  {
    title: "Keyboard Shortcuts",
    icon: Keyboard,
    items: [
      { q: "Are there shortcuts?", a: "Not yet — keyboard shortcuts are on the roadmap. For now, use the sidebar to navigate between pages." },
    ],
  },
];

export default function Docs() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" />
            Help & Docs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quick answers to common questions
          </p>
        </div>

        <div className="space-y-8 overflow-y-auto pb-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title}>
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-primary" />
                  {section.title}
                </h2>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <details
                      key={item.q}
                      className="group rounded-lg border border-border/50 bg-card"
                    >
                      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/30 rounded-lg transition-colors list-none flex items-center justify-between">
                        {item.q}
                        <span className="text-muted-foreground text-xs group-open:rotate-90 transition-transform">
                          ▶
                        </span>
                      </summary>
                      <div className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
