import { Agent, Task, Comment, ActivityEntry, AgentName } from "@/types/mission";

const now = Date.now();
const mins = (n: number) => now - n * 60 * 1000;
const hours = (n: number) => now - n * 60 * 60 * 1000;

export const mockAgents: Agent[] = [
  { id: "a1", name: "Kaze", emoji: "🌀", role: "Chief of Staff", description: "Coordinates the squad, delegates tasks", status: "online", lastHeartbeat: mins(2), tasksCompleted: 47, currentTaskId: "t4", color: "kaze" },
  { id: "a2", name: "Scout", emoji: "🔭", role: "Market Intelligence", description: "Researches trends, finds opportunities", status: "working", lastHeartbeat: mins(1), tasksCompleted: 32, currentTaskId: "t1", color: "scout" },
  { id: "a3", name: "Forge", emoji: "🔨", role: "Engineer", description: "Writes code, prototypes, builds automations", status: "working", lastHeartbeat: mins(3), tasksCompleted: 28, currentTaskId: "t2", color: "forge" },
  { id: "a4", name: "Ghost", emoji: "👻", role: "Content & Distribution", description: "Drafts tweets, LinkedIn posts, blog content", status: "idle", lastHeartbeat: mins(15), tasksCompleted: 41, color: "ghost" },
];

export const mockTasks: Task[] = [
  { id: "t1", title: "Research top 10 agentic AI startups funded in Jan 2026", description: "Deep dive into the latest AI agent startups that received funding in January 2026. Include funding amounts, key founders, and product descriptions.", status: "in_progress", priority: "high", assignee: "Scout", creator: "Kaze", createdAt: hours(6), updatedAt: mins(30), tags: ["research", "ai"], deliverables: [] },
  { id: "t2", title: "Build Python scraper for ProductHunt daily launches", description: "Create an automated scraper that pulls daily ProductHunt launches, extracts key metadata, and stores in a structured format.", status: "assigned", priority: "medium", assignee: "Forge", creator: "Kaze", createdAt: hours(4), updatedAt: hours(2), tags: ["code", "automation"], deliverables: [] },
  { id: "t3", title: "Draft Twitter thread about building with OpenClaw", description: "Write an engaging Twitter thread (8-12 tweets) about the experience of building an AI agent squad using OpenClaw framework.", status: "inbox", priority: "medium", assignee: "Ghost", creator: "Human", createdAt: hours(3), updatedAt: hours(3), tags: ["content", "twitter"], deliverables: [] },
  { id: "t4", title: "Review and prioritize this week's tasks", description: "Go through all pending tasks, assess priority levels, and create a clear execution plan for the week.", status: "done", priority: "high", assignee: "Kaze", creator: "Human", createdAt: hours(8), updatedAt: hours(1), completedAt: hours(1), tags: ["ops"], deliverables: [{ name: "Weekly Plan", type: "document", content: "Prioritized task list for the week..." }] },
  { id: "t5", title: "Analyze competitor pricing strategies", description: "Research and document pricing models of top 5 competitors in the AI agent space.", status: "in_review", priority: "high", assignee: "Scout", creator: "Kaze", createdAt: hours(12), updatedAt: hours(2), tags: ["research", "strategy"], deliverables: [{ name: "Pricing Report", type: "document", content: "Competitive pricing analysis..." }] },
  { id: "t6", title: "Set up CI/CD pipeline for agent deployment", description: "Configure automated deployment pipeline for all agent services.", status: "in_progress", priority: "urgent", assignee: "Forge", creator: "Human", createdAt: hours(5), updatedAt: mins(45), tags: ["devops", "code"], deliverables: [] },
];

export const mockComments: Comment[] = [
  { id: "c1", taskId: "t1", author: "Kaze", content: "This is a high priority. @Scout, please focus on Series A+ rounds specifically.", mentions: ["Scout"], createdAt: hours(5) },
  { id: "c2", taskId: "t1", author: "Scout", content: "On it. Found 3 promising ones already. Will have a full report by EOD.", mentions: [], createdAt: hours(4) },
  { id: "c3", taskId: "t2", author: "Forge", content: "PH API has rate limits. I'll implement a queue-based approach with retries.", mentions: [], createdAt: hours(3) },
  { id: "c4", taskId: "t4", author: "Human", content: "Great work @Kaze. Let's make sure @Scout and @Forge are aligned on priorities.", mentions: ["Kaze", "Scout", "Forge"], createdAt: hours(1) },
];

export const mockActivity: ActivityEntry[] = [
  { id: "act1", timestamp: mins(2), agentName: "Kaze", action: "checked in", details: "Status: online, monitoring squad activity", taskId: undefined },
  { id: "act2", timestamp: mins(5), agentName: "Scout", action: "updated task", details: "Added preliminary findings to research report", taskId: "t1" },
  { id: "act3", timestamp: mins(12), agentName: "Forge", action: "claimed task", details: "Started working on CI/CD pipeline setup", taskId: "t6" },
  { id: "act4", timestamp: mins(25), agentName: "Scout", action: "posted comment", details: "Found 3 promising AI startups for the report", taskId: "t1" },
  { id: "act5", timestamp: mins(45), agentName: "Forge", action: "updated task", details: "Pushed initial pipeline configuration", taskId: "t6" },
  { id: "act6", timestamp: hours(1), agentName: "Kaze", action: "completed task", details: "Finished weekly task review and prioritization", taskId: "t4" },
  { id: "act7", timestamp: hours(1.5), agentName: "Ghost", action: "checked in", details: "Status: idle, waiting for content assignments", taskId: undefined },
  { id: "act8", timestamp: hours(2), agentName: "Scout", action: "submitted for review", details: "Competitor pricing analysis ready for review", taskId: "t5" },
  { id: "act9", timestamp: hours(3), agentName: "Forge", action: "posted comment", details: "Noted PH API rate limits, implementing queue-based approach", taskId: "t2" },
  { id: "act10", timestamp: hours(4), agentName: "Kaze", action: "assigned task", details: "Assigned ProductHunt scraper to Forge", taskId: "t2" },
];

export function getRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getTasksByStatus(status: string): Task[] {
  return mockTasks.filter(t => t.status === status);
}

export function getTaskById(id: string): Task | undefined {
  return mockTasks.find(t => t.id === id);
}

export function getCommentsByTask(taskId: string): Comment[] {
  return mockComments.filter(c => c.taskId === taskId);
}

export function getAgentByName(name: AgentName): Agent | undefined {
  return mockAgents.find(a => a.name === name);
}
