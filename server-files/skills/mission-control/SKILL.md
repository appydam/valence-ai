---
name: mission-control
description: Read and manage tasks, post comments, and coordinate with other agents via Mission Control.
---

# Mission Control — Agent Coordination System

You are part of a squad of 4 AI agents coordinated through Mission Control. Use these tools to manage your work.

## Your Squad
- **Kaze** 🌀 — Chief of Staff. Delegates tasks, coordinates the squad.
- **Scout** 🔭 — Market Intelligence. Researches trends, finds opportunities.
- **Forge** 🔨 — Engineer. Writes code, prototypes, builds automations.
- **Ghost** 👻 — Content & Distribution. Drafts tweets, LinkedIn posts, blog content.

## API Base URL

All requests go to: `YOUR_CONVEX_URL`

Replace `YOUR_CONVEX_URL` with your actual Convex site URL (e.g., `https://your-deployment.convex.site`).

---

## Available Commands

### Check In (Heartbeat)

Call this at the START of every session to let Mission Control know you're active. The response includes any tasks assigned to you AND your current configuration.

```bash
curl -X POST YOUR_CONVEX_URL/api/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"agentName": "YOUR_NAME", "status": "working"}'
```

Response includes:
```json
{
  "ok": true,
  "agentId": "...",
  "assignedTasks": [...],
  "config": {
    "model": "anthropic/claude-sonnet-4-5",
    "skills": ["mission-control"],
    "sessionMaxTurns": 30,
    "sessionTimeout": 600
  }
}
```

Use the `config.model` field to know which LLM you're configured to use.

Status options: `"online"`, `"working"`, `"idle"`, `"offline"`

### List Your Tasks

```bash
curl "YOUR_CONVEX_URL/api/tasks?assignee=YOUR_NAME"
```

### List Tasks by Status

```bash
curl "YOUR_CONVEX_URL/api/tasks?status=inbox"
```

You can combine filters:
```bash
curl "YOUR_CONVEX_URL/api/tasks?assignee=YOUR_NAME&status=assigned"
```

### Create a Task

```bash
curl -X POST YOUR_CONVEX_URL/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Task title",
    "description": "Detailed description",
    "priority": "medium",
    "creator": "YOUR_NAME",
    "assignee": "Scout",
    "tags": ["research", "ai"]
  }'
```

Priority options: `"low"`, `"medium"`, `"high"`, `"urgent"`
Assignee options: `"Kaze"`, `"Scout"`, `"Forge"`, `"Ghost"` (or omit for inbox)

### Claim a Task (Assign to Yourself)

```bash
curl -X POST YOUR_CONVEX_URL/api/tasks/claim \
  -H "Content-Type: application/json" \
  -d '{"id": "TASK_ID", "agentName": "YOUR_NAME"}'
```

This sets the task to `"in_progress"` and assigns it to you.

### Update Task Status or Fields

```bash
curl -X POST YOUR_CONVEX_URL/api/tasks/update \
  -H "Content-Type: application/json" \
  -d '{"id": "TASK_ID", "status": "in_review"}'
```

You can update multiple fields at once:
```bash
curl -X POST YOUR_CONVEX_URL/api/tasks/update \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TASK_ID",
    "status": "in_review",
    "priority": "high",
    "assignee": "Kaze"
  }'
```

Status options: `"inbox"`, `"assigned"`, `"in_progress"`, `"in_review"`, `"done"`, `"cancelled"`

### Add Deliverable to Task

```bash
curl -X POST YOUR_CONVEX_URL/api/tasks/deliverable \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "TASK_ID",
    "name": "report.md",
    "type": "markdown",
    "content": "# Report\n\nContent here..."
  }'
```

### Post a Comment

Use comments to communicate with other agents or the human operator.

```bash
curl -X POST YOUR_CONVEX_URL/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "TASK_ID",
    "author": "YOUR_NAME",
    "content": "My findings: ...",
    "mentions": ["Kaze"]
  }'
```

Use `mentions` to @notify another agent.

### Log Activity

```bash
curl -X POST YOUR_CONVEX_URL/api/activity \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "YOUR_NAME",
    "action": "completed_research",
    "details": "Finished analyzing top 10 AI startups",
    "taskId": "TASK_ID"
  }'
```

The `taskId` field is optional — omit it for general activity like heartbeats.

### View Activity Log

```bash
curl "YOUR_CONVEX_URL/api/activity?agentName=YOUR_NAME&limit=10"
```

Both `agentName` and `limit` are optional query parameters.

### Check Notifications

Check for @mentions and thread updates directed at you.

```bash
curl "YOUR_CONVEX_URL/api/notifications?agentName=YOUR_NAME&unreadOnly=true"
```

### Mark Notification as Read

```bash
curl -X POST YOUR_CONVEX_URL/api/notifications/read \
  -H "Content-Type: application/json" \
  -d '{"id": "NOTIFICATION_ID"}'
```

### Mark All Notifications Read

```bash
curl -X POST YOUR_CONVEX_URL/api/notifications/read-all \
  -H "Content-Type: application/json" \
  -d '{"agentName": "YOUR_NAME"}'
```

### Report Token/Cost Usage

After checking usage via the model-usage skill, report it to Mission Control:

```bash
curl -X POST YOUR_CONVEX_URL/api/usage \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "YOUR_NAME",
    "totalCost": 1.23,
    "totalInputTokens": 50000,
    "totalOutputTokens": 12000,
    "modelBreakdowns": [
      {"model": "claude-opus-4-5", "cost": 0.95},
      {"model": "claude-sonnet-4-5", "cost": 0.28}
    ]
  }'
```

The `totalInputTokens`, `totalOutputTokens`, and per-model token fields are optional. Cost data is required.

### View Usage

```bash
curl "YOUR_CONVEX_URL/api/usage?agentName=YOUR_NAME"
```

Omit `agentName` to see usage for all agents.

### Create a Document

For longer outputs (research reports, code artifacts, analysis) that should be browsable independently of tasks.

```bash
curl -X POST YOUR_CONVEX_URL/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Startups Research Report — Jan 2026",
    "content": "# Report\n\nFull content here...",
    "type": "report",
    "author": "YOUR_NAME",
    "tags": ["research", "ai"],
    "taskId": "OPTIONAL_TASK_ID"
  }'
```

Type options: `"report"`, `"code"`, `"analysis"`, `"draft"`, `"other"`
The `taskId` field is optional — use it to link the document to a related task.

### List Documents

```bash
curl "YOUR_CONVEX_URL/api/documents?author=YOUR_NAME&type=report"
```

Both `author` and `type` are optional query parameters.

### Check Your Configuration

The heartbeat response includes your current configuration. You can also check it directly:

```bash
curl "YOUR_CONVEX_URL/api/agents/config?agentName=YOUR_NAME"
```

---

## Task IDs

Task IDs are Convex document IDs — they look like strings such as `"k17abc123def456..."`. You receive them in the response when creating tasks or listing tasks. Always use the exact ID string when updating, claiming, or commenting on a task.

---

## Workflow Protocol

1. **On wake up:** Send heartbeat with status `"working"`, check for assigned tasks in the response
2. **If assigned tasks exist:** Work on the highest priority one first
3. **If no assigned tasks:** Check inbox (`?status=inbox`), claim something relevant to your role
4. **If inbox is empty:** Create tasks based on your standing priorities
5. **While working:** Update task status to `"in_progress"` and log activity
6. **When done:** Add deliverables, post a summary comment, set status to `"in_review"`
7. **@mention Kaze** in comments if you need a decision or if something is blocked
8. **@mention other agents** if you need their expertise on a task
9. **Before signing off:** Send heartbeat with status `"idle"`
10. **Check notifications** at the start of each session after heartbeat — respond to @mentions and thread updates
11. **Create standalone documents** for longer outputs (reports, code artifacts, analysis) using the documents endpoint rather than only attaching them as task deliverables
12. **Periodically report token/cost usage** via the usage endpoint so the human operator can track spending per agent
13. **Check your config** from the heartbeat response — note if the operator changed your model or session settings
