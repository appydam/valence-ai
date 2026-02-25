export type AgentName = "Kaze" | "Scout" | "Forge" | "Ghost" | "Sentinel";
export type AgentStatus = "online" | "working" | "idle" | "offline";
export type TaskStatus = "inbox" | "assigned" | "in_progress" | "in_review" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Agent {
  id: string;
  name: AgentName;
  emoji: string;
  role: string;
  description: string;
  status: AgentStatus;
  lastHeartbeat: number;
  currentTaskId?: string;
  tasksCompleted: number;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: AgentName;
  creator: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  tags: string[];
  deliverables: { name: string; type: string; content: string }[];
}

export interface Comment {
  id: string;
  taskId: string;
  author: string;
  content: string;
  mentions: string[];
  createdAt: number;
}

export interface ActivityEntry {
  id: string;
  timestamp: number;
  agentName: AgentName;
  action: string;
  details: string;
  taskId?: string;
}

export const AGENT_CONFIG: Record<AgentName, { emoji: string; color: string; role: string; description: string }> = {
  Kaze: { emoji: "🌀", color: "kaze", role: "Chief of Staff", description: "Coordinates the squad, delegates tasks, ensures alignment" },
  Scout: { emoji: "🔭", color: "scout", role: "Market Intelligence", description: "Researches trends, finds opportunities, competitive analysis" },
  Forge: { emoji: "🔨", color: "forge", role: "Software Engineer", description: "Writes code, prototypes, builds automations" },
  Ghost: { emoji: "👻", color: "ghost", role: "Content & Distribution", description: "Drafts tweets, LinkedIn posts, blog content" },
  Sentinel: { emoji: "🔍", color: "sentinel", role: "Quality Reviewer", description: "Reviews every deliverable, enforces quality standards, approves or rejects work" },
};

export const AGENT_COLORS: Record<string, string> = {
  kaze: "agent-kaze",
  scout: "agent-scout",
  forge: "agent-forge",
  ghost: "agent-ghost",
  sentinel: "agent-sentinel",
};

export function getAgentColorClass(name: AgentName, type: "text" | "bg" | "border" | "glow" = "text"): string {
  const color = AGENT_CONFIG[name].color;
  if (type === "glow") return `glow-${color}`;
  return `${type}-agent-${color}`;
}

export function getStatusColor(status: AgentStatus): string {
  return `status-${status}`;
}

export function getPriorityColor(priority: TaskPriority): string {
  return `priority-${priority}`;
}
