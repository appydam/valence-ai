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

## Available Commands

### Check In (Heartbeat)

Call this at the START of every session to let Mission Control know you're active. The response includes any tasks assigned to you AND your current configuration.

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/heartbeat \
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
    "userId": "user_39f60iciK4nX4Q0efRxrfyuHqj2"
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
    "userId": "user_39f60iciK4nX4Q0efRxrfyuHqj2",
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

You see ALL tools the user has connected, but `recommended` highlights tools most relevant to your role.

**Key fields to understand:**
- `aiUsageHint` — Tells you WHEN to use this tool
- `description` — What the tool does
- `exampleArgs` — Valid argument structure
- `params.bodySchema` — Exact parameter requirements

### Getting User ID

The `userId` comes from the task context. When a human creates a task, the system captures their Clerk user ID. You'll execute tools using their credentials (their connected integrations).

**For agent-created tasks:** If no userId is available, skip tool discovery or use the system default: `user_39f60iciK4nX4Q0efRxrfyuHqj2`

### Execute an Integration Tool

Once you've discovered tools, execute them when needed for your tasks. Use the same `userId` from your heartbeat:

```bash
curl -X POST https://beloved-squirrel-599.convex.site/api/integrations/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_39f60iciK4nX4Q0efRxrfyuHqj2",
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
curl "https://beloved-squirrel-599.convex.site/api/integrations/activity?userId=user_39f60iciK4nX4Q0efRxrfyuHqj2&limit=20"
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

## Task IDs

Task IDs are Convex document IDs — they look like strings such as `"k17abc123def456..."`. You receive them in the response when creating tasks or listing tasks. Always use the exact ID string when updating, claiming, or commenting on a task.

---

## CRITICAL RULE: Work Only Counts If It's in Mission Control

**If you didn't post it to Mission Control, it didn't happen.** The human operator monitors progress through the Mission Control dashboard. Work that only exists in your terminal output or session memory is invisible and worthless.

Every session MUST include these API calls — no exceptions:
1. **Heartbeat** at the start (status: working)
2. **Claim or update task** to `in_progress` before doing any work
3. **Add deliverable** with your actual output (not just a summary — the full report/code/draft)
4. **Post a comment** with a summary and @mention Kaze
5. **Log activity** describing what you did
6. **Update task status** to `in_review` when done
7. **Heartbeat** at the end (status: idle)

**Budget your session turns:** Reserve the LAST 3-4 turns of every session for posting results to Mission Control. Do NOT spend all turns on research/work and run out before posting. If you're running low on turns, STOP working and POST what you have immediately.

**Minimum viable session:** If you can only do one thing, make it posting results. A short deliverable posted to Mission Control is infinitely more valuable than a long analysis that stays in your terminal.

---

## Workflow Protocol

1. **On wake up:** Send heartbeat with status `"working"`, check for assigned tasks in the response
2. **If assigned tasks exist:** Claim the highest priority one (sets status to `in_progress`)
3. **If no assigned tasks:** Check inbox (`?status=inbox`), claim something relevant to your role
4. **If inbox is empty:** Create tasks based on your standing priorities
5. **While working:** Log activity periodically so progress is visible
6. **When done (or running low on turns):** Add deliverables with FULL content, post a summary comment, set status to `"in_review"`
7. **@mention Kaze** in comments if you need a decision or if something is blocked
8. **@mention other agents** if you need their expertise on a task
9. **Before signing off:** Send heartbeat with status `"idle"`
10. **Check notifications** at the start of each session after heartbeat — respond to @mentions and thread updates
11. **Create standalone documents** for longer outputs (reports, code artifacts, analysis) using the documents endpoint rather than only attaching them as task deliverables
12. **Periodically report token/cost usage** via the usage endpoint so the human operator can track spending per agent
13. **Check your config** from the heartbeat response — note if the operator changed your model or session settings
