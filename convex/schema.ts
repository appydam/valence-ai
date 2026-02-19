import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const agentNameValidator = v.union(
  v.literal("Kaze"),
  v.literal("Scout"),
  v.literal("Forge"),
  v.literal("Ghost")
);

// Export AgentName type for use in other files
export type AgentName = "Kaze" | "Scout" | "Forge" | "Ghost";

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
    // Webhook metadata (JSON string with source info for webhook-created tasks)
    metadata: v.optional(v.string()),
    // Integration requirements for agent-to-integration wiring
    requiredIntegrations: v.optional(v.array(v.string())), // Blueprint slugs required to complete this task
    requiredUserId: v.optional(v.string()), // Clerk user ID whose credentials should be used
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

  // Universal Integration Engine tables
  blueprints: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    category: v.string(),
    version: v.number(),
    status: v.union(v.literal("active"), v.literal("archived")),

    authType: v.union(
      v.literal("oauth2"),
      v.literal("api_key"),
      v.literal("bearer_token"),
      v.literal("basic_auth"),
      v.literal("none")
    ),
    authConfig: v.string(), // JSON-stringified auth config
    // authConfig schema for oauth2:
    //   clientId, clientSecret (env var ref), authorizeUrl, tokenUrl,
    //   scopes, scopeSeparator ("space"|"comma"), extraAuthParams, extraTokenParams,
    //   tokenEndpointAuth ("body"|"header"), pkce (boolean)

    baseUrl: v.string(),
    defaultHeaders: v.optional(v.string()), // JSON-stringified headers

    // API protocol — determines request/response handling
    apiProtocol: v.optional(v.union(
      v.literal("rest"),      // Standard REST (default)
      v.literal("graphql"),   // GraphQL (POST to single endpoint)
      v.literal("soap"),      // SOAP/XML
      v.literal("jsonrpc")    // JSON-RPC
    )),

    sourceType: v.union(
      v.literal("manual"),
      v.literal("ai_scraped"),
      v.literal("openapi_import")
    ),
    sourceUrl: v.optional(v.string()),

    iconUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_status", ["status"]),

  blueprintTools: defineTable({
    blueprintId: v.id("blueprints"),
    name: v.string(),
    displayName: v.string(),
    description: v.string(),

    method: v.union(
      v.literal("GET"),
      v.literal("POST"),
      v.literal("PUT"),
      v.literal("PATCH"),
      v.literal("DELETE")
    ),
    path: v.string(),

    pathParams: v.optional(v.string()), // JSON array
    queryParams: v.optional(v.string()), // JSON array
    headerParams: v.optional(v.string()), // JSON array
    bodySchema: v.optional(v.string()), // JSON Schema

    // Request format overrides (defaults derive from blueprint.apiProtocol)
    requestContentType: v.optional(v.string()), // e.g. "application/json", "application/x-www-form-urlencoded", "application/xml"

    responseSchema: v.optional(v.string()),
    responseMapping: v.optional(v.string()), // JSON path expression or mapping config

    // Pagination config (JSON): { type: "cursor"|"offset"|"page", cursorField, nextField, limitParam, limitDefault }
    paginationConfig: v.optional(v.string()),

    rateLimitPerMinute: v.optional(v.number()),
    timeoutMs: v.optional(v.number()),
    retryCount: v.optional(v.number()),

    aiUsageHint: v.optional(v.string()),
    exampleArgs: v.optional(v.string()),

    status: v.union(v.literal("active"), v.literal("deprecated")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_blueprint", ["blueprintId"])
    .index("by_blueprint_name", ["blueprintId", "name"]),

  connections: defineTable({
    blueprintId: v.id("blueprints"),
    userId: v.string(), // clerkId

    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("error"),
      v.literal("disconnected")
    ),

    credentialsEncrypted: v.string(), // AES-256-GCM encrypted credentials

    expiresAt: v.optional(v.number()),
    lastRefreshedAt: v.optional(v.number()),
    lastUsedAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
    consecutiveFailures: v.number(),

    connectedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_blueprint_user", ["blueprintId", "userId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  scraperJobs: defineTable({
    url: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("fetching"),
      v.literal("analyzing"),
      v.literal("completed"),
      v.literal("failed")
    ),

    blueprintId: v.optional(v.id("blueprints")),
    toolCount: v.optional(v.number()),

    rawContentLength: v.optional(v.number()),
    statusMessage: v.optional(v.string()),
    error: v.optional(v.string()),

    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  integrationActivity: defineTable({
    userId: v.string(),
    agentName: v.optional(v.string()),
    integrationType: v.string(),
    toolName: v.string(),
    status: v.string(),
    errorMessage: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  // Webhook System tables
  webhookEndpoints: defineTable({
    blueprintId: v.id("blueprints"),
    userId: v.string(), // clerkId - who created this webhook

    name: v.string(),
    description: v.optional(v.string()),

    // Webhook URL path (unique per blueprint + user)
    urlPath: v.string(), // e.g., "/webhooks/github/user_123/pr-created"

    // Security
    signatureMethod: v.union(
      v.literal("hmac_sha256"),
      v.literal("hmac_sha1"),
      v.literal("jwt"),
      v.literal("none")
    ),
    secret: v.optional(v.string()), // Webhook secret for signature verification
    signatureHeader: v.optional(v.string()), // Header name containing signature (e.g., "X-Hub-Signature-256")

    // Event filtering
    eventTypes: v.array(v.string()), // Which event types to accept (e.g., ["pull_request.opened", "issues.created"])

    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("disabled")
    ),

    // Stats
    totalReceived: v.number(),
    totalProcessed: v.number(),
    totalFailed: v.number(),
    lastReceivedAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_blueprint_user", ["blueprintId", "userId"])
    .index("by_url_path", ["urlPath"])
    .index("by_status", ["status"]),

  webhookEvents: defineTable({
    endpointId: v.id("webhookEndpoints"),
    userId: v.string(),
    blueprintId: v.id("blueprints"),

    eventType: v.string(), // e.g., "pull_request.opened"
    eventData: v.string(), // JSON-stringified event payload

    headers: v.string(), // JSON-stringified request headers
    signature: v.optional(v.string()),
    verified: v.boolean(),

    status: v.union(
      v.literal("received"),
      v.literal("processing"),
      v.literal("processed"),
      v.literal("failed"),
      v.literal("ignored")
    ),

    // Processing results
    taskId: v.optional(v.id("tasks")), // Task created by automation rule
    ruleId: v.optional(v.id("automationRules")), // Which rule processed this
    errorMessage: v.optional(v.string()),

    processingStartedAt: v.optional(v.number()),
    processedAt: v.optional(v.number()),
    receivedAt: v.number(),
  })
    .index("by_endpoint", ["endpointId"])
    .index("by_status", ["status"])
    .index("by_received", ["receivedAt"])
    .index("by_user_blueprint", ["userId", "blueprintId"]),

  automationRules: defineTable({
    endpointId: v.id("webhookEndpoints"),
    userId: v.string(),

    name: v.string(),
    description: v.optional(v.string()),

    // Trigger conditions
    eventTypes: v.array(v.string()), // Which events trigger this rule
    conditions: v.optional(v.string()), // JSON-stringified condition object (JSONPath expressions)

    // Action to perform
    actionType: v.union(
      v.literal("create_task"),
      v.literal("send_notification"),
      v.literal("trigger_agent"),
      v.literal("execute_tool")
    ),
    actionConfig: v.string(), // JSON-stringified action configuration

    // Task creation template (if actionType === "create_task")
    taskTemplate: v.optional(v.object({
      titleTemplate: v.string(), // Template with {{variables}}
      descriptionTemplate: v.string(),
      priority: taskPriorityValidator,
      assignee: v.optional(agentNameValidator),
      tags: v.array(v.string()),
    })),

    enabled: v.boolean(),

    // Stats
    executionCount: v.number(),
    successCount: v.number(),
    failureCount: v.number(),
    lastExecutedAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_endpoint", ["endpointId"])
    .index("by_user", ["userId"])
    .index("by_enabled", ["enabled"]),

  // Analytics & Performance Metrics tables
  taskMetrics: defineTable({
    taskId: v.id("tasks"),
    agentName: v.optional(agentNameValidator),

    status: taskStatusValidator,
    priority: taskPriorityValidator,

    // Time tracking
    createdAt: v.number(),
    assignedAt: v.optional(v.number()),
    startedAt: v.optional(v.number()), // When status changed to in_progress
    completedAt: v.optional(v.number()),

    // Duration metrics (milliseconds)
    timeToAssign: v.optional(v.number()), // createdAt → assignedAt
    timeToStart: v.optional(v.number()), // assignedAt → startedAt
    timeToComplete: v.optional(v.number()), // startedAt → completedAt
    totalDuration: v.optional(v.number()), // createdAt → completedAt

    // Success metrics
    completed: v.boolean(),
    cancelled: v.boolean(),
    hasDeliverables: v.boolean(),
    deliverableCount: v.number(),
    commentCount: v.number(),

    // Source tracking
    source: v.union(
      v.literal("manual"), // Created by user
      v.literal("webhook"), // Created by webhook automation
      v.literal("agent"), // Created by agent
      v.literal("integration") // Created via integration
    ),

    missionId: v.optional(v.id("missions")),
  })
    .index("by_task", ["taskId"])
    .index("by_agent", ["agentName"])
    .index("by_status", ["status"])
    .index("by_completed_time", ["createdAt"]),

  agentMetrics: defineTable({
    agentName: agentNameValidator,

    // Time window for this metric snapshot
    periodStart: v.number(), // Unix timestamp
    periodEnd: v.number(),
    periodType: v.union(
      v.literal("hourly"),
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),

    // Task metrics
    tasksAssigned: v.number(),
    tasksCompleted: v.number(),
    tasksCancelled: v.number(),
    tasksInProgress: v.number(),

    // Performance metrics
    avgTimeToComplete: v.optional(v.number()), // Average in milliseconds
    avgTimeToStart: v.optional(v.number()),
    completionRate: v.number(), // Percentage (0-100)

    // Activity metrics
    totalActiveTime: v.number(), // Milliseconds spent in "working" status
    heartbeatCount: v.number(),

    // Integration usage
    integrationCallCount: v.number(),
    integrationSuccessCount: v.number(),
    integrationFailureCount: v.number(),

    // Cost metrics (if available from usage table)
    totalCost: v.optional(v.number()),
    totalTokens: v.optional(v.number()),

    computedAt: v.number(),
  })
    .index("by_agent_period", ["agentName", "periodType", "periodStart"])
    .index("by_period", ["periodType", "periodStart"]),

  systemMetrics: defineTable({
    // Global system metrics snapshot
    periodStart: v.number(),
    periodEnd: v.number(),
    periodType: v.union(
      v.literal("hourly"),
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),

    // Overall task metrics
    totalTasksCreated: v.number(),
    totalTasksCompleted: v.number(),
    totalTasksCancelled: v.number(),
    totalTasksActive: v.number(),

    // Agent metrics
    totalAgentsActive: v.number(),
    totalAgentUptime: v.number(), // Milliseconds

    // Integration metrics
    totalIntegrationCalls: v.number(),
    totalIntegrationSuccesses: v.number(),
    totalIntegrationFailures: v.number(),
    uniqueIntegrationsUsed: v.number(),

    // Webhook metrics
    totalWebhooksReceived: v.number(),
    totalWebhooksProcessed: v.number(),
    totalWebhooksFailed: v.number(),

    // Cost metrics
    totalCost: v.optional(v.number()),
    totalTokens: v.optional(v.number()),

    computedAt: v.number(),
  })
    .index("by_period", ["periodType", "periodStart"]),
});
