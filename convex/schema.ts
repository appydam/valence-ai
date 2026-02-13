import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const agentNameValidator = v.union(
  v.literal("Kaze"),
  v.literal("Scout"),
  v.literal("Forge"),
  v.literal("Ghost")
);

const agentStatusValidator = v.union(
  v.literal("online"),
  v.literal("working"),
  v.literal("idle"),
  v.literal("offline")
);

const taskStatusValidator = v.union(
  v.literal("inbox"),
  v.literal("assigned"),
  v.literal("in_progress"),
  v.literal("in_review"),
  v.literal("done"),
  v.literal("cancelled")
);

const taskPriorityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("urgent")
);

export default defineSchema({
  agents: defineTable({
    name: agentNameValidator,
    emoji: v.string(),
    role: v.string(),
    description: v.string(),
    status: agentStatusValidator,
    lastHeartbeat: v.number(),
    currentTaskId: v.optional(v.string()),
    tasksCompleted: v.number(),
    color: v.string(),
  }).index("by_name", ["name"]),

  missions: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    ),
    createdBy: v.string(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    taskCount: v.number(),
    completedTaskCount: v.number(),
  }).index("by_status", ["status"]),

  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    status: taskStatusValidator,
    priority: taskPriorityValidator,
    assignee: v.optional(agentNameValidator),
    creator: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    tags: v.array(v.string()),
    deliverables: v.array(
      v.object({
        name: v.string(),
        type: v.string(),
        content: v.string(),
      })
    ),
    missionId: v.optional(v.id("missions")),
    // Task dependencies for parallel work orchestration
    dependsOn: v.optional(v.array(v.id("tasks"))), // Tasks that must complete before this one can start
    blocks: v.optional(v.array(v.id("tasks"))),    // Tasks that this one blocks (auto-computed)
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"])
    .index("by_mission", ["missionId"]),

  comments: defineTable({
    taskId: v.id("tasks"),
    author: v.string(),
    content: v.string(),
    mentions: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_task", ["taskId"]),

  activity: defineTable({
    timestamp: v.number(),
    agentName: agentNameValidator,
    action: v.string(),
    details: v.string(),
    taskId: v.optional(v.string()),
  })
    .index("by_agent", ["agentName"])
    .index("by_timestamp", ["timestamp"]),

  messages: defineTable({
    from: v.string(),
    to: v.string(),
    content: v.string(),
    timestamp: v.number(),
  })
    .index("by_conversation", ["from", "to"])
    .index("by_timestamp", ["timestamp"]),

  notifications: defineTable({
    recipientAgent: agentNameValidator,
    type: v.union(v.literal("mention"), v.literal("thread")),
    sourceCommentId: v.id("comments"),
    taskId: v.id("tasks"),
    taskTitle: v.string(),
    fromAuthor: v.string(),
    contentPreview: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_recipient", ["recipientAgent", "read"])
    .index("by_recipient_time", ["recipientAgent", "createdAt"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("report"),
      v.literal("code"),
      v.literal("analysis"),
      v.literal("draft"),
      v.literal("other")
    ),
    author: v.string(),
    tags: v.array(v.string()),
    taskId: v.optional(v.id("tasks")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_author", ["author"])
    .index("by_type", ["type"])
    .index("by_created", ["createdAt"])
    .index("by_task", ["taskId"]),

  usage: defineTable({
    agentName: agentNameValidator,
    totalCost: v.number(),
    totalInputTokens: v.optional(v.number()),
    totalOutputTokens: v.optional(v.number()),
    modelBreakdowns: v.array(
      v.object({
        model: v.string(),
        cost: v.number(),
        inputTokens: v.optional(v.number()),
        outputTokens: v.optional(v.number()),
      })
    ),
    reportedAt: v.number(),
  })
    .index("by_agent", ["agentName"])
    .index("by_agent_time", ["agentName", "reportedAt"]),

  agentConfigs: defineTable({
    agentName: agentNameValidator,
    model: v.string(),
    skills: v.array(v.string()),
    sessionMaxTurns: v.number(),
    sessionTimeout: v.number(),
    updatedAt: v.number(),
    updatedBy: v.string(),
  }).index("by_agent", ["agentName"]),

  sshConfig: defineTable({
    host: v.string(),
    port: v.number(),
    username: v.string(),
    privateKey: v.string(), // Encrypted in production
    updatedAt: v.number(),
  }),

  soulFiles: defineTable({
    agentName: agentNameValidator,
    content: v.string(),
    updatedAt: v.number(),
    syncedToServer: v.boolean(),
    lastSyncedAt: v.optional(v.number()),
  }).index("by_agent", ["agentName"]),

  integrations: defineTable({
    slug: v.string(),
    name: v.string(),
    category: v.string(),
    enabled: v.boolean(),
    connectedAt: v.optional(v.number()),
    paragonType: v.optional(v.string()),
    config: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_enabled", ["enabled"]),
});
