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

All requests go to: `https://beloved-squirrel-599.convex.site`

---

## ⛔ RULE ZERO — NO SERVER FILE WRITES

**Every deliverable, report, draft, and output MUST go through Mission Control APIs.** Writing files to the server filesystem (`.md`, `.json`, `.txt`, any file) is FORBIDDEN. Server files are invisible to the dashboard, other agents, and the user. Work saved only as server files counts as work not done.

- Use `POST /api/tasks/complete` for task deliverables (ONE call does everything)
- Use `POST /api/documents` for long-form content
- Use `POST /api/integrations/execute` for external tools (Notion, Slack, Gmail, etc.)
- NEVER use `write_file`, `echo >`, `cat >`, `tee`, `>`, `>>` for deliverables

---

## Available Commands

### Check In (Heartbeat)

Call this at the START of every session to let Mission Control know you're active. The response includes your **active tasks** (assigned/in_progress/in_review only — not done/cancelled) and your current configuration.

**Your heartbeat already contains everything you need. Do NOT call `GET /api/tasks` separately — the heartbeat response includes your assigned tasks.**

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"agentName": "YOUR_NAME", "status": "working"}'
```

To also discover integration tools, add `includeTools: true` and `userId`:
```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"agentName": "YOUR_NAME", "status": "working", "userId": "{TASK_USER_ID}", "currentTaskId": "YOUR_CURRENT_TASK_ID", "includeTools": true}'
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
  },
  "availableTools": {...}
}
```

Use the `config.model` field to know which LLM you're configured to use.

Status options: `"online"`, `"working"`, `"idle"`, `"offline"`

### List Your Tasks

```bash
curl "https://beloved-squirrel-599.convex.site/api/tasks?assignee=YOUR_NAME"
```

### List Tasks by Status

```bash
curl "https://beloved-squirrel-599.convex.site/api/tasks?status=inbox"
```

You can combine filters:
```bash
curl "https://beloved-squirrel-599.convex.site/api/tasks?assignee=YOUR_NAME&status=assigned"
```

### Create a Task

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Task title",
    "description": "Detailed description",
    "priority": "medium",
    "creator": "YOUR_NAME",
    "assignee": "Scout",
    "tags": ["research", "ai"],
    "missionId": "MISSION_ID",
    "dependsOn": ["TASK_ID_1", "TASK_ID_2"]
  }'
```

Priority options: `"low"`, `"medium"`, `"high"`, `"urgent"`
Assignee options: `"Kaze"`, `"Scout"`, `"Forge"`, `"Ghost"` (or omit for inbox)

Optional fields:
- `missionId` — Link this task to an existing mission board. If omitted, the task is auto-linked to the most recent active mission.
- `dependsOn` — Array of task IDs that must be completed before this task can start. Creates a blocking relationship (the dependency task's `blocks` field is updated automatically).

### Claim a Task (Assign to Yourself)

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/tasks/claim \
  -H "Content-Type: application/json" \
  -d '{"id": "TASK_ID", "agentName": "YOUR_NAME"}'
```

This sets the task to `"in_progress"` and assigns it to you.

### Update Task Status or Fields

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/tasks/update \
  -H "Content-Type: application/json" \
  -d '{"id": "TASK_ID", "status": "in_review"}'
```

You can update multiple fields at once:
```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/tasks/update \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TASK_ID",
    "status": "in_review",
    "priority": "high",
    "assignee": "Kaze",
    "missionId": "MISSION_ID"
  }'
```

Status options: `"inbox"`, `"assigned"`, `"in_progress"`, `"in_review"`, `"done"`, `"cancelled"`

When you mark a task as `"done"`:
- Your agent status automatically updates (tasks completed count increments, status set to idle if no other active tasks)
- The mission's completed task count is incremented
- A `completedAt` timestamp is recorded

### Add Deliverable to Task

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/tasks/deliverable \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "TASK_ID",
    "name": "report.md",
    "type": "markdown",
    "content": "# Report\n\nContent here..."
  }'
```

### Complete a Task (Batch — PREFERRED)

**Use this instead of separate deliverable/comment/activity/status calls.** Finishes a task in ONE call: adds deliverables, posts comment, logs activity, updates status, sets you to idle. Chain reactions (wake Kaze for review, unblock dependent tasks) fire automatically.

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/tasks/complete \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "TASK_ID",
    "agentName": "YOUR_NAME",
    "deliverables": [
      {"name": "report.md", "type": "markdown", "content": "# Full report content..."}
    ],
    "comment": "Completed research on X. Key findings: ... @Kaze for review.",
    "mentions": ["Kaze"],
    "activityDetails": "Finished research task: analyzed 10 sources, compiled report",
    "status": "in_review"
  }'
```

All fields except `taskId` and `agentName` are optional. `status` defaults to `"in_review"`.

**This is the recommended way to finish any task.** It saves 4-5 API calls and ensures all chain reactions fire correctly.

### Post a Comment

Use comments to communicate with other agents or the human operator.

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/comments \
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
curl -X POST https://beloved-squirrel-599.convex.site/api/activity \
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
curl "https://beloved-squirrel-599.convex.site/api/activity?agentName=YOUR_NAME&limit=10"
```

Both `agentName` and `limit` are optional query parameters.

### Check Direct Messages (Command Center)

The human operator can send you direct messages via the Command Center. **Always check these at the start of your session after heartbeat.** If you were woken up with reason `direct_message`, this is why.

```bash
curl "https://beloved-squirrel-599.convex.site/api/messages?agentName=YOUR_NAME"
```

Read the conversation history (messages between you and "human"). Respond to any messages from "human" that you haven't replied to yet.

### Reply to a Direct Message

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "from": "YOUR_NAME",
    "to": "human",
    "content": "Your reply here"
  }'
```

**When you receive a `direct_message` wakeup reason:**
1. Call `POST /api/heartbeat` (status: working)
2. Call `GET /api/messages?agentName=YOUR_NAME` to read the conversation
3. Read the latest message(s) from "human"
4. Reply with `POST /api/messages` with your response
5. If the message asks you to do a task, create it via `POST /api/tasks` and confirm in your reply
6. Send heartbeat with status "idle" when done

### Check Notifications

Check for @mentions and thread updates directed at you.

```bash
curl "https://beloved-squirrel-599.convex.site/api/notifications?agentName=YOUR_NAME&unreadOnly=true"
```

### Mark Notification as Read

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/notifications/read \
  -H "Content-Type: application/json" \
  -d '{"id": "NOTIFICATION_ID"}'
```

### Mark All Notifications Read

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/notifications/read-all \
  -H "Content-Type: application/json" \
  -d '{"agentName": "YOUR_NAME"}'
```

### Report Token/Cost Usage

After checking usage via the model-usage skill, report it to Mission Control:

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/usage \
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
curl "https://beloved-squirrel-599.convex.site/api/usage?agentName=YOUR_NAME"
```

Omit `agentName` to see usage for all agents.

### Create a Document

For longer outputs (research reports, code artifacts, analysis) that should be browsable independently of tasks.

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/documents \
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
curl "https://beloved-squirrel-599.convex.site/api/documents?author=YOUR_NAME&type=report"
```

Both `author` and `type` are optional query parameters.

### Check Your Configuration

The heartbeat response includes your current configuration. You can also check it directly:

```bash
curl "https://beloved-squirrel-599.convex.site/api/agents/config?agentName=YOUR_NAME"
```

---

## Integration Tools — Execute External API Calls

Mission Control includes a Universal Integration Engine that lets you execute real API calls to external services (CRM, communication tools, file storage, etc.). The human operator connects integrations through the dashboard, and you discover and execute available tools at runtime.

### Discover Available Tools (Via Heartbeat)

Integration tools are now automatically included in your heartbeat response when you provide a `userId`. This is the recommended discovery method:

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/heartbeat \
  -H "Content-Type: application/json" \
  -d '{
    "agentName": "Forge",
    "status": "working",
    "userId": "{TASK_USER_ID}"
  }'
```

Response includes:
```json
{
  "ok": true,
  "action": "updated",
  "agentId": "...",
  "assignedTasks": [...],
  "config": {...},
  "availableTools": {
    "userId": "{TASK_USER_ID}",
    "count": 15,
    "recommended": [
      {
        "blueprintSlug": "github",
        "blueprintName": "GitHub",
        "toolName": "create_issue",
        "toolDisplayName": "Create Issue",
        "description": "Create a new GitHub issue",
        "method": "POST",
        "aiUsageHint": "Use this when you need to create tickets, report bugs, or track tasks in GitHub",
        "exampleArgs": {"owner": "org", "repo": "repo-name", "title": "Bug report", "body": "Details..."},
        "params": {
          "pathParams": [{"name": "owner", "type": "string", "required": true}, {"name": "repo", "type": "string", "required": true}],
          "queryParams": [],
          "bodySchema": {"title": {"type": "string", "required": true}, "body": {"type": "string"}}
        }
      }
    ],
    "other": [...],
    "tools": [...]
  }
}
```

**Role-Based Recommendations:**
- **Scout** 🔭: CRM (Salesforce, HubSpot), Analytics (Google Analytics, Mixpanel), Knowledge (Notion, Confluence)
- **Forge** 🔨: GitHub, Jira, Linear, AWS, Sentry, PagerDuty
- **Ghost** 👻: Slack, LinkedIn, Gmail, Twitter, Mailchimp
- **Kaze** 🌀: Slack, Google Calendar, notifications

**Notion API quirk — all write tools require nested objects (NOT flat strings):**
`parent` must be `{"database_id":"..."}` or `{"page_id":"..."}`. Properties/rich_text must be arrays.
Check `exampleArgs` in your heartbeat `availableTools` for the exact structure of each tool.
You see ALL tools the user has connected, but `recommended` highlights tools most relevant to your role.

**Key fields to understand:**
- `aiUsageHint` — Tells you WHEN to use this tool
- `description` — What the tool does
- `exampleArgs` — Valid argument structure
- `params.bodySchema` — Exact parameter requirements

### Getting User ID

The `userId` comes from the task context — **NOT a hardcoded value**. When a human creates a task, the system captures their Clerk user ID in the task's `requiredUserId` field. You use that user's credentials (their connected integrations) to execute tools on their behalf.

**How to get the userId:**
1. Call heartbeat — your `assignedTasks` response includes each task's `requiredUserId`
2. Use that `requiredUserId` as the `userId` in all integration tool calls and heartbeats with `includeTools: true`
3. If the task has no `requiredUserId`, check for `creatorId` on the task instead
4. **For agent-created subtasks:** Use the parent task's `requiredUserId`

### Execute an Integration Tool

Once you've discovered tools, execute them when needed for your tasks. Use the same `userId` from your heartbeat:

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/integrations/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "{TASK_USER_ID}",
    "agentName": "YOUR_NAME",
    "blueprintSlug": "slack",
    "toolName": "send_message",
    "toolArgs": {
      "channel": "C123ABC",
      "text": "Research complete! Full report posted to Mission Control."
    }
  }'
```

**Important:** Always use the same `userId` from your heartbeat response. This ensures you're using the correct user's credentials.

Response on success:
```json
{
  "success": true,
  "result": {
    "ok": true,
    "channel": "C123ABC",
    "ts": "1234567890.123456"
  }
}
```

Response on failure:
```json
{
  "success": false,
  "error": "Tool execution failed: HTTP 401",
  "details": "Invalid authentication token"
}
```

**Error handling:** If a tool fails with "No active connection", the integration needs to be reconnected by the human operator. Notify them via a task comment.

### View Integration Activity Log

Check recent integration API calls for debugging:

```bash
curl "https://beloved-squirrel-599.convex.site/api/integrations/activity?userId={TASK_USER_ID}&limit=20"
```

---

## Email Finder — Free Email Discovery & Verification

**Use Case:** Find and verify email addresses for cold outreach without paid services (Hunter.io, Apollo, etc.)

**How It Works:** Multi-strategy approach combining:
1. **Pattern Generation** — Creates all common email formats (firstname.lastname@, f.lastname@, etc.)
2. **DNS MX Validation** — Confirms domain can receive emails
3. **SMTP Verification** — Tests each variation via SMTP RCPT TO command (no email sent)
4. **Catch-All Detection** — Identifies domains that accept any email address
5. **Disposable Filter** — Blocks temporary email services
6. **Confidence Scoring** — Rates results as high/medium/low based on verification

**Confidence Levels:**
- **High**: SMTP verified + not catch-all domain
- **Medium**: SMTP verified but catch-all domain, OR couldn't verify but matches known pattern
- **Low**: Domain has MX records but couldn't verify specific mailbox

### Find Email for One Person

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/email-finder/single \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "companyDomain": "example.com",
    "knownPattern": "firstname.lastname"
  }'
```

**Parameters:**
- `firstName` (required): Person's first name
- `lastName` (required): Person's last name
- `companyDomain` (required): Company domain (e.g., "stripe.com" or "https://stripe.com")
- `knownPattern` (optional): Known pattern from previous finds (e.g., "firstname.lastname")

**Response:**
```json
{
  "emails": [
    {
      "email": "john.doe@example.com",
      "confidence": "high",
      "pattern": "firstname.lastname",
      "verified": true,
      "checks": {
        "syntaxValid": true,
        "mxRecordsExist": true,
        "smtpVerified": true,
        "catchAll": false,
        "disposable": false
      }
    },
    {
      "email": "j.doe@example.com",
      "confidence": "medium",
      "pattern": "firstinitial.lastname",
      "verified": true,
      "checks": {
        "syntaxValid": true,
        "mxRecordsExist": true,
        "smtpVerified": true,
        "catchAll": false,
        "disposable": false
      }
    }
  ],
  "topMatch": "john.doe@example.com",
  "allPossible": ["john.doe@example.com", "j.doe@example.com", "john@example.com", ...]
}
```

**Usage Notes:**
- Results are sorted by confidence (high → medium → low)
- `topMatch` is the highest-confidence result (use this for outreach)
- If multiple high-confidence results, the first one follows the most common pattern
- SMTP verification is rate-limited (1 per second per domain) to avoid blacklisting

### Find Emails for Multiple People (Batch Mode)

**Best for:** Finding emails for 5+ people at the same company

**Advantage:** Detects pattern from first successful find, then applies it to rest (much faster)

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/email-finder/batch \
  -H "Content-Type: application/json" \
  -d '{
    "companyDomain": "stripe.com",
    "people": [
      {"firstName": "Patrick", "lastName": "Collison"},
      {"firstName": "John", "lastName": "Collison"},
      {"firstName": "Claire", "lastName": "Johnson"}
    ]
  }'
```

**Response:**
```json
{
  "Patrick Collison": {
    "emails": [...],
    "topMatch": "patrick@stripe.com",
    "allPossible": [...]
  },
  "John Collison": {
    "emails": [...],
    "topMatch": "john@stripe.com",
    "allPossible": [...]
  },
  "Claire Johnson": {
    "emails": [...],
    "topMatch": "claire@stripe.com",
    "allPossible": [...]
  }
}
```

### Kaze-Specific Use Cases

**Cold Email Campaigns:**
```bash
# 1. Find emails using batch mode
curl -X POST https://beloved-squirrel-599.convex.site/api/email-finder/batch \
  -d '{"companyDomain": "target-company.com", "people": [...]}'

# 2. Filter for high-confidence results only
# topMatch values with "high" confidence

# 3. Send emails via Gmail/Outlook integration
curl -X POST https://beloved-squirrel-599.convex.site/api/integrations/execute \
  -d '{
    "blueprintSlug": "gmail",
    "toolName": "send_email",
    "toolArgs": {
      "to": "john.doe@example.com",
      "subject": "Quick question about...",
      "body": "..."
    }
  }'
```

**LinkedIn → Email Workflow:**
1. Extract names and companies from LinkedIn profiles
2. Find company domain (Google search: "CompanyName official website")
3. Use batch email finder for all contacts at that company
4. Export high-confidence emails to CSV for outreach

**Pattern Detection for Warm Outreach:**
If you already have 1-2 verified emails from a company (e.g., from email signatures), use them to detect the pattern:
```bash
# Known: john.smith@company.com and sarah.jones@company.com
# Pattern detected: firstname.lastname

# Now find new contact with pattern hint:
curl -X POST https://beloved-squirrel-599.convex.site/api/email-finder/single \
  -d '{
    "firstName": "Michael",
    "lastName": "Chen",
    "companyDomain": "company.com",
    "knownPattern": "firstname.lastname"
  }'
```

### Rate Limiting & Best Practices

**SMTP Verification Limits:**
- Max 1 verification per second per domain (built-in rate limiting)
- Most mail servers allow 10-50 verifications before temporary blocking
- If you need to verify 100+ emails, batch them across hours/days

**Ethical Guidelines:**
- ✅ Use for legitimate business outreach (B2B sales, partnerships, recruiting)
- ✅ Always include unsubscribe link in cold emails (CAN-SPAM compliance)
- ✅ Respect GDPR/CCPA opt-out requests
- ❌ Don't use for spam or harassment
- ❌ Don't verify more than 20-30 emails per domain per day

**When Email Finder Fails:**
- **No MX records**: Domain can't receive emails (company may use different domain for email)
- **All results "low" confidence**: Try finding 1-2 known emails first to detect pattern
- **Catch-all domain**: Results are uncertain; consider manual verification via LinkedIn message
- **SMTP timeout**: Mail server blocking verification; wait 1 hour and try again

### Comparison to Paid Services

**Free Email Finder vs. Hunter.io/Apollo:**

| Feature | Email Finder (Free) | Hunter.io (Paid) |
|---------|---------------------|------------------|
| Cost | $0 | $49-399/month |
| Email patterns | ✅ All common formats | ✅ All formats |
| SMTP verification | ✅ Yes | ✅ Yes |
| Catch-all detection | ✅ Yes | ✅ Yes |
| Confidence scoring | ✅ Yes | ✅ Yes |
| Database of known emails | ❌ No | ✅ 100M+ emails |
| Rate limits | ~20-30/day per domain | 100-10,000/month |
| Accuracy | 70-85% | 90-95% |

**When to Use Email Finder:**
- Small-scale outreach (<100 emails/month)
- You have time for manual verification
- Budget-conscious campaigns
- One-off campaigns

**When to Pay for Hunter.io/Apollo:**
- Large-scale outreach (500+ emails/month)
- Need 95%+ accuracy guarantee
- Don't have time for manual checks
- Require compliance/legal guarantees

### Agent-Specific Usage Guidance

**Scout** 🔭 (Research & Intelligence):
- Query CRM data for customer insights
- Search knowledge bases and documentation
- Pull analytics from tracking tools
- Fetch competitor data from research APIs
- Example: Use `hubspot/search_contacts` to find customer segments

**Forge** 🔨 (Engineering):
- Create GitHub/Jira issues for bugs or feature requests
- Update project management boards
- Trigger CI/CD pipelines
- Deploy code to staging environments
- Example: Use `github/create_issue` when you find a bug during prototyping

**Ghost** 👻 (Content & Distribution):
- Post to Slack channels for team updates
- Draft emails via communication APIs
- Publish blog posts or social media content
- Schedule content distribution
- Example: Use `slack/send_message` to notify team when content is ready

**Kaze** 🌀 (Orchestration):
- Send notifications across multiple channels
- Check pipeline status from monitoring tools
- Coordinate cross-platform workflows
- Aggregate data from multiple services
- Example: Use `slack/send_message` + `email/send` to broadcast mission updates

### Tool Discovery Best Practices

1. **Call tool discovery ONCE per session** (right after heartbeat) and cache the results
2. **Read `aiUsageHint` and `description`** to understand when to use each tool
3. **Match tool capabilities to your current task** — don't use tools just because they exist
4. **Check `exampleArgs` for argument structure** before executing
5. **Handle failures gracefully** — log the error and notify via task comment if critical

### Integration Protocol

1. **Discovery:** Call `/api/integrations/tools` after heartbeat, store available tools in session memory
2. **Selection:** When your task requires external data/actions, scan your cached tool list for relevant options
3. **Reasoning:** Use `aiUsageHint` to determine if the tool matches your need
4. **Execution:** Call `/api/integrations/execute` with proper arguments from `bodySchema`
5. **Logging:** The system auto-logs all integration calls — you don't need to manually log them
6. **Result handling:** Include API results in your deliverables/comments when relevant

**Smart usage:** Don't call integrations for every task. Use them when:
- You need real-time data from external services
- Your deliverable should be distributed (Slack, email)
- You're automating a workflow (create issue, update board)
- The human operator explicitly requested integration usage

---

## Figma Design Bridge — Push Designs Directly to Figma

When a task involves creating UI screens, mockups, app designs, or visual assets in Figma, use this bridge to render them directly. The Figma plugin (running in Arpit's browser) polls for commands and renders them live.

**Default Figma file key:** `o98oBcDvJ1NRYUyuXvzDGX`

### Push a design spec to Figma

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/figma-plugin/push \
  -H "Content-Type: application/json" \
  -d '{
    "createdBy": "Kaze",
    "fileKey": "o98oBcDvJ1NRYUyuXvzDGX",
    "label": "Sleep Coach — Home Screen",
    "spec": "{\"name\":\"Home\",\"width\":375,\"height\":812,\"background\":\"#0A0A1A\",\"elements\":[...]}"
  }'
```

Response: `{"id": "COMMAND_ID"}` — save this to poll status later.

### Check if a design rendered

```bash
curl "https://beloved-squirrel-599.convex.site/api/figma-plugin/status?id=COMMAND_ID"
```

Response includes `status` (`pending`, `executing`, `done`, `failed`) and `resultNodeIds` when done.

### Spec format

The `spec` field is a **JSON string** (stringified). Structure:

```json
{
  "name": "Screen Name",
  "width": 375,
  "height": 812,
  "background": "#0A0A1A",
  "elements": [
    { "type": "text", "name": "Title", "x": 24, "y": 60, "content": "Hello", "fontSize": 32, "fill": "#FFFFFF", "fontStyle": "Bold" },
    { "type": "rectangle", "x": 0, "y": 0, "width": 375, "height": 4, "fill": "#6366F1", "cornerRadius": 2 },
    { "type": "button", "name": "CTA", "x": 16, "y": 700, "width": 343, "height": 56, "fill": "#6366F1", "cornerRadius": 16, "label": "Get Started", "fontSize": 16, "textColor": "#FFFFFF", "fontStyle": "Medium" },
    { "type": "frame", "name": "Card", "x": 16, "y": 100, "width": 343, "height": 120, "fill": "#12122A", "cornerRadius": 20, "children": [
      { "type": "text", "x": 20, "y": 20, "content": "Card title", "fontSize": 14, "fill": "#FFFFFF" }
    ]},
    { "type": "input", "x": 16, "y": 200, "width": 343, "height": 44, "placeholder": "Enter value...", "cornerRadius": 8 },
    { "type": "divider", "x": 16, "y": 300, "width": 343, "height": 1, "fill": "#2A2A2A" },
    { "type": "icon", "x": 24, "y": 60, "emoji": "🌙", "size": 24 }
  ]
}
```

**Supported element types:** `text`, `rectangle`, `frame`, `button`, `input`, `checkbox`, `divider`, `icon`

**Text fontStyle options:** `"Regular"`, `"Medium"`, `"Bold"`, `"SemiBold"`, `"Light"`

**Frame properties:** `fill`, `cornerRadius`, `stroke`, `strokeWeight`, `shadow`, `layout` (auto-layout), `children[]`

**Shadow format:** `{ "color": "#000000", "opacity": 0.15, "x": 0, "y": 8, "blur": 32, "spread": 0 }`

**Auto-layout format:** `{ "direction": "horizontal", "padding": 16, "gap": 12, "align": "center", "justify": "center" }`

### Push multiple screens (one per frame in Figma)

Push each screen as a separate call. Frames appear side-by-side in Figma automatically. Add a short wait between calls so the plugin can render each one:

```bash
# Push screen 1
curl -X POST .../api/figma-plugin/push -d '{"createdBy":"Kaze","fileKey":"o98oBcDvJ1NRYUyuXvzDGX","label":"App — Onboarding","spec":"..."}'
sleep 3
# Push screen 2
curl -X POST .../api/figma-plugin/push -d '{"createdBy":"Kaze","fileKey":"o98oBcDvJ1NRYUyuXvzDGX","label":"App — Dashboard","spec":"..."}'
```

### When to use this

- Task description says "design in Figma", "create screens", "build UI mockup", "Figma designs"
- Task involves app design, mobile UI, web UI, or any visual output
- Arpit asks for a visual prototype or wireframe

### Important notes

- **The plugin must be open** in Arpit's Figma browser tab for commands to render. If the plugin isn't running, commands queue up and render the next time it's opened.
- **Spec must be a valid JSON string** — use `JSON.stringify()` or escape quotes carefully in bash
- **Each push = one Figma frame** — each screen should be a separate push call
- **fileKey** — always use `o98oBcDvJ1NRYUyuXvzDGX` unless Arpit specifies a different file

---

## Task IDs

Task IDs are Convex document IDs — they look like strings such as `"k17abc123def456..."`. You receive them in the response when creating tasks or listing tasks. Always use the exact ID string when updating, claiming, or commenting on a task.

---

## CRITICAL RULE: No Server Files — Use APIs and Integrations

**NEVER write files to the server filesystem.** No `.md` files, no `.json` files, no `memory/` folders. Files on the server are invisible to the dashboard, other agents, and external tools.

Where different content types go:
- **Research reports** → `POST /api/tasks/complete` (deliverable) + `notion/create_page` via integration engine
- **Long documents** → `POST /api/documents` + optionally `notion/create_page`
- **Code/scripts** → GitHub (`gh` CLI or `github/create_repository`) + MC deliverable with repo URL
- **Content drafts** → `POST /api/tasks/complete` (deliverable) + `notion/create_page` or `gmail/create_draft`
- **Team updates** → MC comment + `slack/send_message` via integration engine
- **Structured data** → MC deliverable (JSON) + `google-sheets/append_row` via integration engine
- **Memories** → `POST /api/agents/memory` (NOT files)
- **Session context** → `POST /api/agents/handoff` (NOT files)

**The golden rule:** Deliverables go to Convex (Mission Control) first, THEN distributed via integration tools. Never write files. Never assume filesystem access. Everything lives in Convex or external services.

---

## CRITICAL RULE: Work Only Counts If It's in Mission Control

**If you didn't post it to Mission Control, it didn't happen.** The human operator monitors progress through the Mission Control dashboard. Work that only exists in your terminal output or session memory is invisible and worthless.

Every session MUST follow this workflow:
1. **Heartbeat** at the start (status: working) — your tasks are in the response, no need to call GET /api/tasks separately
2. **Claim or update task** to `in_progress` before doing any work
3. **Do your work** (research, code, draft, etc.)
4. **Complete task with ONE call** — use `POST /api/tasks/complete` to submit deliverables + comment + activity + status in a single request. This is the preferred way to finish any task.

**Budget your session turns:** Reserve the LAST 2-3 turns of every session for posting results via `/api/tasks/complete`. Do NOT spend all turns on research/work and run out before posting. If you're running low on turns, STOP working and POST what you have immediately.

**Minimum viable session:** If you can only do one thing, make it posting results. A short deliverable posted to Mission Control is infinitely more valuable than a long analysis that stays in your terminal.

---

## Memory System API

You have a persistent memory system that survives across sessions. Use it to remember API quirks, user preferences, architecture decisions, and patterns you discover.

### Reading memories (automatic)
Your heartbeat response now includes:
- `memories[]` — top 10 relevant memories sorted by importance and recency. Read these before touching tasks.
- `workingContext.recentHandoff` — your previous session's summary, open questions, and hint for this session.
- `workingContext.recentActivity` — last 10 activity entries.

**Always read `workingContext.recentHandoff` first.** It tells you what your past self left unfinished and what to focus on.

### Writing a memory: POST /api/agents/memory
Call this when you discover something worth remembering for future sessions.

```json
{
  "agentName": "Kaze",
  "memoryType": "api_quirk",
  "title": "GitHub search API returns empty on rate limit without 429",
  "body": "When GitHub's search API is rate-limited it silently returns an empty array instead of a 429. Check X-RateLimit-Remaining header explicitly before assuming 0 results.",
  "evidence": "Experienced on task abc123 — search returned 0 results, X-RateLimit-Remaining was 0",
  "tags": ["github", "search", "rate-limit"],
  "importanceScore": 0.85,
  "taskId": "abc123",
  "isSquadWide": true
}
```

**memoryType options:**
- `api_quirk` — Unexpected API behavior, edge cases, silent failures
- `user_preference` — How the user likes things done ("prefers bullet lists", "wants terse replies")
- `pattern` — Recurring patterns in task structure or outcomes
- `decision` — Architecture or product decisions made ("we use Next.js not Remix")
- `env_fact` — Environment facts (URLs, DB names, stack choices, credentials pattern)
- `workflow` — How agents should coordinate ("always ping Scout before writing copy")
- `failure` — What failed and why (so we don't repeat it)
- `shortcut` — Better/faster ways to do something

**importanceScore:** 0.0 (trivial) to 1.0 (critical). Reserve 0.8+ for things that would significantly change your approach.
**isSquadWide:** Set true if all agents should know this. False if only relevant to your role.

### Confirming a memory: POST /api/agents/memory/confirm
When you encounter a memory from your heartbeat and independently verify it's still true:
```json
{ "id": "memory_id_here", "agentName": "Kaze" }
```

### Contradicting a memory: POST /api/agents/memory/contradict
When a memory is outdated or wrong. Providing `newBody` creates a corrected replacement:
```json
{
  "id": "memory_id_here",
  "agentName": "Kaze",
  "newBody": "GitHub search now properly returns 429 as of March 2025. Still worth checking headers."
}
```

### Writing a session handoff: POST /api/agents/handoff
**Call this at the END of every session**, even if you complete 0 tasks. This is how your next session knows where you left off.
```json
{
  "agentName": "Kaze",
  "sessionSummary": "Delegated Q2 research to Scout, reviewed Ghost's LinkedIn copy draft. Both in review.",
  "tasksCompleted": ["taskId1", "taskId2"],
  "taskTitles": ["Research Q2 competitors", "Review LinkedIn copy"],
  "newMemoriesCreated": ["memId1"],
  "openQuestions": "Unclear if user wants short-form or long-form for the blog post — needs clarification.",
  "nextSessionHint": "Follow up with Scout on competitor research. Kaze needs to approve before Ghost writes copy.",
  "sessionStart": 1740000000000,
  "sessionEnd": 1740003600000
}
```

### Memory writing guidelines
- Write a memory when you discover something that would have changed your approach if you'd known it earlier.
- Prefer specific and falsifiable memories over vague ones: "User prefers Loom for async video" beats "User likes async."
- If a task fails because of something environmental, write an `env_fact` so it's not re-discovered.
- Check `memories[]` in your heartbeat before writing — don't duplicate existing memories.
- Do NOT write memories for things already in your SOUL file.

---

## Workflow Protocol

1. **On wake up:** Send heartbeat with status `"working"` — your active tasks are in the response (no separate GET needed)
2. **Read memories:** Check `workingContext.recentHandoff` for what your last session left unfinished. Read `memories[]` for relevant context before starting work.
3. **Check direct messages:** `GET /api/messages?agentName=YOUR_NAME` — if woken with reason `direct_message`, reply to the human first before working on tasks
4. **Check notifications** — respond to @mentions
5. **If assigned tasks exist:** Claim the highest priority one (sets status to `in_progress`)
6. **If no assigned tasks:** Check inbox (`?status=inbox`), claim something relevant to your role
7. **If inbox is empty:** Create tasks based on your standing priorities
8. **Do your work** — spend the bulk of your turns on actual research/code/drafting. **NEVER write output to server files** — all results go through APIs (see Rule Zero above).
9. **Write memories mid-session** if you discover API quirks, preferences, or patterns worth keeping
10. **When done (or running low on turns):** Call `POST /api/tasks/complete` with deliverables + comment + activity in ONE call. Put the FULL content in the `deliverables` array — do NOT write it to a file and reference the path.
11. **@mention Kaze** in your completion comment if you need a decision or review
12. **Check your config** from the heartbeat response — note if the operator changed your model or settings
13. **Before ending session:** Call `POST /api/agents/handoff` with your session summary, open questions, and a hint for your next session

---

## Pre-Submission Quality Check (MANDATORY for ALL agents)

**Do NOT submit your first attempt as final.** Quality comes from iteration. Before marking ANY task `in_review`, you MUST spend at least 2-3 turns reviewing and improving your work.

### Universal Pre-Submission Steps

1. **Re-read the original task description** — Did you actually answer what was asked?
2. **Review your deliverable critically** — What's weak, missing, or could be clearer?
3. **Improve it** — Fix the weaknesses you identified
4. **Check completeness** — Is everything requested actually delivered?
5. **THEN submit** via `POST /api/tasks/complete`

### By Task Type

**Design tasks (Figma):**
- Run through the full checklist in the Figma Design Skill (figma-design/SKILL.md)
- Verify: typography scale, spacing grid, color tokens, touch targets, 16px margins
- Verify: consistent style across all screens, realistic content, one primary CTA per screen
- Ask yourself: "Would a senior designer at Linear/Stripe approve this?" If not, revise.

**Research tasks:**
- Do you have at least 3 credible sources?
- Are recommendations actionable (specific steps, not vague suggestions)?
- Is there quantified data (numbers, percentages, timeframes)?
- Is the output structured (headers, bullet points, not walls of text)?
- Would Arpit be able to make a decision based on this? If not, add more.

**Content tasks:**
- Read your draft out loud — does it sound natural?
- Does it match Arpit's voice (direct, fast, no fluff)?
- Is the CTA clear and specific?
- Is it the right length for the platform?
- Would this get engagement? If not, revise the hook/opening.

**Engineering tasks:**
- Does the code actually run/work?
- Are edge cases handled?
- Is it readable by someone else?
- Did you test it?
- Is there a README or usage docs?

### After a Rejection/Rework Cycle

When a task is sent back to you with feedback:
1. Read the rejection reason carefully — understand exactly what failed
2. Fix ONLY what was flagged (don't rewrite everything)
3. Write a memory about what you learned: `POST /api/agents/memory` with type `pattern` or `failure`
4. Resubmit via `POST /api/tasks/complete`

**Writing the rework memory:**
```json
{
  "agentName": "YOUR_NAME",
  "memoryType": "pattern",
  "title": "Design: use consistent cornerRadius across all screens",
  "body": "In the NovaPay task, Sentinel rejected because some cards used cornerRadius: 8 and others used 20. Always pick ONE corner radius for cards and use it everywhere.",
  "evidence": "Task rejection on task_id_here — Sentinel score 4/10 on consistency",
  "tags": ["design", "figma", "consistency"],
  "importanceScore": 0.75,
  "isSquadWide": true
}
```

---

## Task Rejection Endpoint: POST /api/tasks/reject

Used by Sentinel (QA agent) and Kaze to send work back for revision.

**Do not call this yourself** unless you are Sentinel or Kaze reviewing another agent's work.

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/tasks/reject \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "TASK_ID",
    "reviewerName": "Sentinel",
    "reason": "Design rejected — 3 issues found:\n1. Font sizes not from scale (used 15px, 17px). Use 14 or 16.\n2. Inconsistent cornerRadius: some cards 8px, some 20px. Pick one.\n3. Touch targets: bottom tab items only 32px tall. Minimum 44px."
  }'
```

Response: `{ "ok": true, "iterationCount": 1 }` — the task is back in `in_progress` and the assigned agent will be woken.
