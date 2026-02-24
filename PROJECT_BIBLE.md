# Mission Control: Project Bible

> The definitive reference for what we've built, where we're going, and why it matters.

---

## Table of Contents

1. [Vision & Philosophy](#1-vision--philosophy)
2. [What We've Built — Complete Feature Map](#2-what-weve-built--complete-feature-map)
3. [Architecture Overview](#3-architecture-overview)
4. [The Agent Squad](#4-the-agent-squad)
5. [Universal Integration Engine](#5-universal-integration-engine)
6. [Agent Memory & Learning System](#6-agent-memory--learning-system)
7. [Task Dependencies & Quality Loops](#7-task-dependencies--quality-loops)
8. [Webhook & Automation System](#8-webhook--automation-system)
9. [Security & Encryption](#9-security--encryption)
10. [The Most Complex Problems We Solve](#10-the-most-complex-problems-we-solve)
11. [How We're Building Autonomous AI](#11-how-were-building-autonomous-ai)
12. [Tech Stack & Infrastructure](#12-tech-stack--infrastructure)
13. [Database Schema](#13-database-schema)
14. [API Surface](#14-api-surface)
15. [Frontend Pages & Components](#15-frontend-pages--components)
16. [Current Integrations](#16-current-integrations)
17. [What Makes Us Different](#17-what-makes-us-different)
18. [Future Vision & Roadmap](#18-future-vision--roadmap)
19. [Key File Reference](#19-key-file-reference)

---

## 1. Vision & Philosophy

### The Problem

Every enterprise runs on workflows — sales pipelines, customer onboarding, code releases, content creation, vendor management. These workflows are:

- **Fragmented** across 15-50 SaaS tools
- **Manual** at the glue points (copy-pasting between Slack, Jira, Salesforce, GitHub)
- **Expensive** to automate (Workato, Paragon, Zapier = $1k-10k/month)
- **Brittle** when things change (a single API update breaks everything)
- **Stateless** — no memory of what worked before, no learning

### Our Thesis

**Autonomous AI agents, working as a coordinated squad, can replace entire workflow layers in the enterprise.** Not one chatbot answering questions. A team of specialized agents that:

1. **Understand context** — read tasks, understand priorities, know the business
2. **Take action** — call real APIs, write code, create deliverables
3. **Coordinate** — delegate to each other, track dependencies, report progress
4. **Learn** — build episodic memory across sessions, distill lessons into identity
5. **Improve** — quality feedback loops, rejection rework cycles, SOUL file evolution

### The Outcome

Mission Control is the **command center for autonomous AI workforces**. It's where humans set objectives and AI agents execute them — across any tool, any workflow, any enterprise. And unlike any other system, our agents **remember, learn, and get better** over time.

---

## 2. What We've Built — Complete Feature Map

### Core Platform

| Feature | Status | Description |
|---------|--------|-------------|
| **Agent Orchestration** | Live | 5-agent squad (Kaze, Scout, Forge, Ghost, Sentinel) with real-time status, heartbeats, and task assignment |
| **Task Management** | Live | Full lifecycle: Inbox → Assigned → In Progress → In Review → Done, with dependencies, priorities, deliverables |
| **Mission Board** | Live | Kanban board with drag-drop, mission filtering, bulk operations |
| **Missions** | Live | Group tasks into missions with completion tracking |
| **Command Center** | Live | Direct chat with individual agents by name |
| **Documents** | Live | Agent-generated reports, code, analysis with type/author filtering |
| **Analytics Dashboard** | Live | Task trends, agent performance, completion times, integration usage (7/30/90 day) |
| **Webhook System** | Live | Receive webhooks from any source, verify signatures, auto-create tasks |
| **Automation Rules** | Live | Event → Action mapping (create task, send notification, trigger agent, execute tool) |
| **Agent Configuration** | Live | Per-agent model selection, skills, session limits, SOUL file editing |

### Universal Integration Engine

| Feature | Status | Description |
|---------|--------|-------------|
| **Integration Blueprints** | Live | Define any API integration (REST, GraphQL, SOAP, JSON-RPC) as a reusable blueprint |
| **AI Doc Scraper** | Live | Paste API docs URL → Claude reads docs and generates tool definitions automatically |
| **OpenAPI Import** | Live | Deterministic parsing of OpenAPI/Swagger specs into blueprints |
| **OAuth2 Flow** | Live | Full OAuth popup flow with HMAC-signed state, dual-channel completion (postMessage + localStorage), auto token refresh |
| **API Key Auth** | Live | Encrypted storage + auto-injection for API key integrations |
| **Execution Engine** | Live | Retry logic (jittered backoff), rate limit handling, response mapping, timeout management |
| **Encrypted Credentials** | Live | AES-256-GCM encryption for all tokens at rest |
| **Tool Execution** | Live | Agents call real APIs via HTTP with full request building + auth injection |
| **30+ Integration Seeds** | Live | Pre-seeded blueprints: GitHub, Slack, Jira, Salesforce, Zendesk, Airtable, Shopify, ServiceNow, and more |
| **100+ Template Catalog** | Live | Discovery catalog for any integration category |
| **City View Visualization** | Live | 2D spatial layout — blueprints as buildings, agents as walkers navigating the integration landscape |

### Agent Memory & Learning

| Feature | Status | Description |
|---------|--------|-------------|
| **Episodic Memory** | Live | Agents write structured memories (api_quirk, user_preference, pattern, decision, failure, shortcut) during work |
| **Relevance Scoring** | Live | Memories scored by importance + recency + human endorsement + confirmations/contradictions |
| **Memory Surfacing** | Live | Top 10 relevant memories injected into agent context at heartbeat |
| **Human Endorsement** | Live | Users can endorse/flag memories from the Memory Bank UI |
| **Session Handoffs** | Live | End-of-session summaries with open questions, task titles completed, hints for next session |
| **SOUL File Distillation** | Live | Memories automatically distilled into SOUL file changelogs → pending human review → agent identity evolves |
| **Memory Bank UI** | Live | Browse, search, filter, endorse memories per agent |
| **SOUL Review UI** | Live | Diff-based review of proposed SOUL file changes with approve/reject workflow |

### Agent Coordination

| Feature | Status | Description |
|---------|--------|-------------|
| **Task Dependencies** | Live | dependsOn[] graph with automatic chain reactions when tasks complete |
| **Parallel Work Orchestration** | Live | getReadyTasks() returns all tasks whose deps are met — agents work in parallel |
| **Dependency Context Injection** | Live | Deliverables from upstream tasks injected into downstream agent context at heartbeat |
| **Quality Feedback Loops** | Live | Rejection/rework cycles: iterationCount, maxIterations, rejectionReason fed back to agent |
| **Notification System** | Live | @mention notifications for agents, unread count at heartbeat, UI bell |
| **Agent-to-Human Messaging** | Live | Direct message threads between agents and humans |

### Infrastructure

| Feature | Status | Description |
|---------|--------|-------------|
| **OpenClaw Agent Runtime** | Live | Self-hosted on Lightsail, managed via SSH proxy on Railway |
| **Agent Wakeup System** | Live | Webhook-triggered agent startup with task queue, HMAC-signed |
| **Session Budget Tracking** | Live | sessionMaxTurns, recommendedWrapUpAt injected at heartbeat — agents know when to wrap up |
| **Rich Heartbeat Context** | Live | Tasks + tools + memories + handoff + recent activity + notifications in a single API response |
| **SSH Proxy** | Live | Secure command execution on Lightsail from web UI |
| **SOUL File Sync** | Live | Edit agent personalities in UI, sync to server |
| **Clerk Authentication** | Live | User auth with sign-in/sign-up, integrated with Convex |
| **Real-time Subscriptions** | Live | Convex-powered live updates across all UI components |
| **Cron Jobs** | Live | Hourly OAuth token refresh, 2-hour review sweep, metric aggregation, memory distillation triggers |
| **Figma Plugin Bridge** | Live | Agents push design specs to a command queue; Figma plugin polls and executes |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MISSION CONTROL UI                             │
│         React + Vite + TypeScript + Tailwind + shadcn/ui         │
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │  Board   │ │  Agents  │ │Analytics │ │  Integrations      │  │
│  │  Tasks   │ │  Command │ │Documents │ │  City View / List  │  │
│  │ Missions │ │  Squad   │ │ Settings │ │  Blueprint Wizard  │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘  │
│  ┌──────────────────┐ ┌───────────────────────────────────────┐  │
│  │  Memory Bank     │ │  SOUL Review / SOUL Distillation      │  │
│  │  (Agent Memories)│ │  (Version Control for Agent Identity) │  │
│  └──────────────────┘ └───────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ Real-time Subscriptions + HTTP
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CONVEX BACKEND                                 │
│         Serverless Functions + Real-time Database                 │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Task Engine       │  Integration Engine  │  Webhook Engine│  │
│  │  - CRUD            │  - Blueprints        │  - Receivers   │  │
│  │  - Dependencies    │  - OAuth/API Keys    │  - Signature   │  │
│  │  - Delegation      │  - Execution         │    Verification│  │
│  │  - Chain Reactions │  - Token Refresh     │  - Automation  │  │
│  │  - Quality Loops   │  - Response Mapping  │  - Rules       │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Memory Engine     │  Analytics  │  Cron Jobs              │  │
│  │  - Episodic Memory │  - Metrics  │  - Token Refresh        │  │
│  │  - Distillation    │  - Usage    │  - Distillation Trigger │  │
│  │  - SOUL Versioning │  - Period   │  - Metric Aggregation   │  │
│  └────────────────────────────────────────────────────────────┘  │
│  Crypto Layer (AES-256-GCM) │  OpenAPI Parser  │  Doc Scraper    │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP API (Heartbeat, Tasks, Tools, Memory)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  OPENCLAW AGENT RUNTIME                           │
│            Lightsail Server (Self-Hosted)                         │
│                                                                   │
│   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────────┐        │
│   │ Kaze │  │Scout │  │Forge │  │Ghost │  │Sentinel  │        │
│   │ 🌀   │  │ 🔭   │  │ 🔨   │  │ 👻   │  │ 🛡️       │        │
│   │Chief │  │Intel │  │Engi- │  │Cont- │  │Monitor   │        │
│   │of    │  │ligence│  │neer  │  │ent & │  │& Audit   │        │
│   │Staff │  │      │  │      │  │Dist. │  │          │        │
│   └──────┘  └──────┘  └──────┘  └──────┘  └──────────┘        │
│                                                                   │
│   Each agent has: SOUL file + Episodic Memory + Session Budget   │
│   Model: Claude Opus 4.5  │  Skills: mission-control             │
│   Sessions: 20-30 turns   │  Timeout: 300-600s                   │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              EXTERNAL WORLD                                       │
│  GitHub  │  Slack  │  Jira  │  Salesforce  │  Airtable           │
│  Linear  │  Gmail  │  HubSpot  │  Zendesk  │  Shopify            │
│  ServiceNow  │  Stripe  │  Any API via Doc Scraper / OpenAPI     │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Human sets objective** → Creates mission + tasks in UI
2. **Task assigned to agent** → Convex triggers agent wakeup webhook
3. **Agent wakes up** → Sends heartbeat, receives rich context (tasks + tools + memories + handoff + notifications)
4. **Agent works** → Reads task, calls integration tools, creates deliverables, writes memories
5. **Agent completes** → Posts deliverables, marks task done, saves session handoff
6. **Chain reaction** → Dependent tasks unblock, downstream agents receive deliverables as context
7. **Memory persists** → Episodic memories scored and stored; distillation runs on schedule
8. **SOUL evolves** → Distilled lessons proposed as SOUL file changes; human reviews/approves
9. **Human reviews** → Analytics show progress, Memory Bank shows what agents learned

---

## 4. The Agent Squad

### Kaze 🌀 — Chief of Staff
- **Role**: Orchestrator and decision-maker
- **Responsibilities**: Task triage, delegation, approval/rejection, final review
- **Superpower**: Understands the full mission context, breaks down complex objectives into sub-tasks
- **Delegates to**: Scout (research), Forge (engineering), Ghost (content), Sentinel (monitoring)

### Scout 🔭 — Market Intelligence
- **Role**: Research and analysis specialist
- **Responsibilities**: Market research, competitive analysis, data gathering, trend identification
- **Superpower**: Deep research across multiple data sources, synthesizes findings into actionable insights

### Forge 🔨 — Engineer
- **Role**: Technical execution
- **Responsibilities**: Code writing, API integrations, technical implementations, debugging
- **Superpower**: Can interact with GitHub, build tools, and solve technical problems end-to-end

### Ghost 👻 — Content & Distribution
- **Role**: Content creation and distribution
- **Responsibilities**: Writing, messaging, social content, email drafts, documentation
- **Superpower**: Creates polished, publication-ready content across formats

### Sentinel 🛡️ — Monitor & Auditor
- **Role**: System health and compliance monitoring
- **Responsibilities**: Track integration failures, audit agent decisions, flag anomalies
- **Superpower**: Watches everything, never misses a failure, keeps the system healthy

### How They Coordinate

```
Human: "Launch our new product on Product Hunt"
  │
  ▼
Kaze (Chief of Staff):
  ├── Creates subtask: "Research top Product Hunt launches" → Scout
  ├── Creates subtask: "Build landing page updates" → Forge
  ├── Creates subtask: "Write launch copy + tweets" → Ghost
  └── Reviews all deliverables, approves or sends back

Scout completes research → Kaze reviews → Deliverables injected into Ghost's context
Forge finishes code → Kaze reviews → Marks mission complete
Ghost finishes content → Kaze reviews → Schedules distribution
```

What makes this powerful now:
- Scout's deliverables **automatically flow into** Ghost's context (dependency injection)
- Agents **remember** what they learned about this product from previous sessions
- If Ghost's work is rejected, the rejection reason + iteration count guide the next attempt
- Session handoffs tell the next agent instance exactly where to pick up

### Agent Configuration
Each agent is independently configurable:
- **Model**: Claude Opus 4.5 / Sonnet / Haiku (cost optimization)
- **Skills**: 10+ toggleable capabilities (mission-control, web-search, code-execution, etc.)
- **Session Limits**: Max turns (20-30) and timeout (300-600s), with recommended wrap-up point
- **SOUL File**: Markdown personality/instruction file editable from UI, synced to server
- **Memory**: Persistent episodic memories that evolve with experience

---

## 5. Universal Integration Engine

### Why We Built It

Paragon costs **$2,500/month** for managed integrations. We replaced it with a custom engine that:
- Costs **$0/month** (self-hosted on Convex)
- Supports **any API** (not just pre-built connectors)
- Lets **AI generate integrations** from docs (no developer needed)
- Gives agents **direct API access** (no middleware)
- Has **30+ pre-seeded blueprints** ready to connect today

### How It Works

```
Step 1: User pastes API docs URL (or selects from template catalog)
    ↓
Step 2: System detects OpenAPI spec → deterministic parse
        OR: Claude analyzes HTML docs → generates tool definitions
    ↓
Step 3: User reviews, edits, saves as "Integration Blueprint"
    ↓
Step 4: User connects (OAuth popup or API key entry)
    ↓
Step 5: Agents call real APIs via the execution engine
```

### Blueprint Anatomy

```typescript
Blueprint {
  slug: "github"                          // Unique identifier
  name: "GitHub"                          // Display name
  baseUrl: "https://api.github.com"       // API base URL
  authType: "oauth2"                      // oauth2 | api_key | bearer_token | basic_auth | none
  authConfig: {                           // JSON config (provider-specific)
    clientId: "Ov23li...",
    scopes: ["repo", "user"],
    scopeSeparator: " ",
    tokenEndpointAuth: "body",
    extraAuthParams: {}
  }
  apiProtocol: "rest"                     // rest | graphql | soap | jsonrpc
  tools: [                                // Individual API actions
    {
      name: "list_repos",
      method: "GET",
      path: "/user/repos",
      queryParams: [{ name: "sort", type: "string" }],
      aiUsageHint: "List repositories for the authenticated user",
      exampleArgs: { sort: "updated" }
    },
    {
      name: "create_issue",
      method: "POST",
      path: "/repos/{owner}/{repo}/issues",
      pathParams: ["owner", "repo"],
      bodySchema: { title: "string", body: "string" },
      paginationConfig: { type: "cursor", pageParam: "page" }
    }
  ]
}
```

### Execution Engine Capabilities

| Capability | Details |
|-----------|---------|
| **Protocol Support** | REST, GraphQL, SOAP, JSON-RPC |
| **Auth Methods** | OAuth2 (authorization code), API key (header/query), Bearer token, Basic auth |
| **Auto Token Refresh** | Detects tokens expiring within 5 minutes, auto-refreshes before call |
| **Retry Logic** | Jittered exponential backoff on 429/408/502/503/504 |
| **Rate Limit Handling** | Respects Retry-After headers; parses numeric and HTTP-date formats |
| **Request Building** | Path params, query params, headers, JSON/form/XML bodies |
| **Response Mapping** | JSON path extraction for nested responses, field-level transforms |
| **Timeout Management** | Per-tool configurable (default 30s) |
| **Execution Logging** | Every call logged with method, URL, status, duration, retries |
| **Role-Based Filtering** | Tools filtered per agent role; heavy blueprints (Stripe) capped to top 20 |

### Doc Scraper Intelligence

The doc scraper isn't a simple web scraper — it's an AI-powered API analyst:

1. **Fetches URL content** (handles redirects, JavaScript-rendered pages)
2. **Detects OpenAPI specs** → deterministic parsing via `openApiParser.ts` (no AI needed)
3. **For HTML docs** → creates analysis task for an agent (Claude Sonnet reads the content)
4. **Generates**: Blueprint metadata + tool definitions + auth configuration
5. **User reviews**: Edit generated tools before saving
6. **Job tracking**: pending → fetching → analyzing → completed/failed

### OAuth2 Popup Flow — Technical Details

The OAuth flow has a critical complexity: many providers (Atlassian, Jira) route through **multiple intermediate pages** before hitting the callback URL. This causes `window.opener` to become null, breaking the standard `postMessage` approach.

**Our solution — dual-channel completion:**
1. OAuth popup window opens
2. On callback, Convex writes result to `localStorage` key `oauth_result`
3. Parent window polls `localStorage` every 300ms (via `useOAuthPopup.ts`)
4. Parent also listens for `postMessage` (works for simple providers)
5. First channel to complete wins; popup closes
6. Result checked for staleness (5-minute timestamp validation)

This works for **any provider** regardless of redirect complexity.

### Pre-Seeded Blueprints (30+)

Ready to connect from day one:
- **Dev Tools**: GitHub, GitLab, Bitbucket, Vercel, CircleCI
- **Project Management**: Jira, Linear, Asana, Monday, ClickUp, Notion
- **Communication**: Slack, Microsoft Teams, Discord, Twilio, SendGrid
- **CRM**: Salesforce, HubSpot, Pipedrive, Intercom, Zendesk
- **Commerce**: Shopify, Stripe
- **Data**: Airtable, Google Sheets, Snowflake
- **Enterprise**: ServiceNow, SAP
- **AI/ML**: OpenAI, Anthropic, Replicate

---

## 6. Agent Memory & Learning System

This is one of the most powerful features of the platform — agents are not stateless. They build up **episodic memories** across sessions and **distill them into their identity** over time.

### Memory Types

| Type | Description | Example |
|------|-------------|---------|
| `api_quirk` | Unexpected API behavior discovered | "GitHub's search API requires 1s delay between calls" |
| `user_preference` | How this user/team likes things done | "Arpit prefers bullet points over prose in reports" |
| `pattern` | Recurring workflow or decision pattern | "Whenever a PR is merged to main, Kaze creates a release task" |
| `decision` | A significant decision made and why | "Chose Stripe over Braintree because team already has account" |
| `env_fact` | A persistent environmental fact | "Production DB is on RDS instance db-prod-1" |
| `workflow` | A multi-step process that works well | "Deploy flow: build → test → staging → manual approve → prod" |
| `failure` | What went wrong and why | "Jira rate limit hit during bulk import — need to batch to 50/sec" |
| `shortcut` | A faster way to accomplish something | "Use /api/bulk-create instead of looping individual creates" |

### Memory Lifecycle

```
1. Agent works on task
    ↓
2. Agent writes memories (structured via tool call)
    ↓
3. Memory stored with importanceScore, tags, evidence
    ↓
4. Next session: top 10 memories by relevance surfaced at heartbeat
    ↓
5. Cron / manual trigger: distillation job runs
    ↓
6. Claude analyzes top memories → generates SOUL file changelog
    ↓
7. Version created with status = pending_review
    ↓
8. Human reviews in SOUL Review UI → approve / reject
    ↓
9. If approved → SOUL file updated → next agent session has evolved identity
```

### Relevance Scoring Formula

```
relevanceScore = importanceScore * 0.5
               + recency * 0.2
               + (humanEndorsed ? 0.3 : 0)
               + confirmations * 0.05
               - contradictions * 0.1
```

- `importanceScore` — agent self-assessed (0.0–1.0)
- `recency` — normalized decay from last access time
- `humanEndorsed` — user explicitly marked as important (+30%)
- `confirmations/contradictions` — other agents or tasks that support/contradict this memory

### Session Handoffs

At the end of every session, agents write a structured handoff:

```typescript
SessionHandoff {
  sessionSummary: "Completed competitive analysis for Q1 product roadmap"
  tasksCompleted: [taskId1, taskId2]
  taskTitles: ["Market Research: SaaS Pricing", "Competitor Feature Matrix"]
  newMemoriesCreated: [memoryId1, memoryId2]
  openQuestions: ["Is HubSpot still the right CRM benchmark?"]
  nextSessionHint: "Start with Scout's deliverables on pricing — they're ready"
}
```

This handoff is injected into the next agent session at heartbeat, so agents always know exactly where to continue.

### SOUL File Distillation

The SOUL file is each agent's identity — their personality, decision framework, and learned patterns. It evolves:

1. **Distillation job triggers** (end of session, or manually)
2. Claude reads the top memories + current SOUL file
3. Generates a proposed changelog (what to add/update/remove)
4. Creates a `soulFileVersion` record with `status = pending_review`
5. Human sees it in **SOUL Review UI** — shows diff, memory sources, changelog
6. Human **approves** → SOUL file updated; **rejects** → version discarded
7. Agent's next session reflects the approved identity changes

---

## 7. Task Dependencies & Quality Loops

### Dependency Graph

Every task can declare `dependsOn: [taskId, ...]`. This creates a directed dependency graph:

```
Task A (Research)
    ├── Task B depends on A (Write Report)
    └── Task C depends on A (Create Slides)

Task B + Task C can run in parallel once A is done
Task D depends on B and C → only unlocks when both complete
```

Key behaviors:
- `areDependenciesMet(taskId)` — checks if all deps are done or cancelled
- `getReadyTasks()` — returns all tasks whose deps are met (agents claim these)
- `blocks[]` — auto-computed reverse of dependsOn (for UI rendering, not manually set)
- When a task completes → downstream tasks automatically unblock
- **Deliverables inject into context** — upstream task deliverables are surfaced in the heartbeat response for downstream agents (capped at 3 deps per task, 2 tasks max to prevent N+1)

### Quality Feedback Loop

When an agent's work isn't good enough, humans (or Kaze) can reject it with feedback:

```typescript
Task {
  iterationCount: 2,        // How many times this has been rejected+reworked
  maxIterations: 3,         // Maximum allowed (optional — unlimited if not set)
  rejectionReason: "Report lacks quantitative data. Add market size numbers.",
  status: "in_progress",    // Reset to in_progress on rejection
}
```

On the next heartbeat, the agent receives:
- `rejectionReason` injected into task context
- `iterationCount` so the agent knows how many attempts remain
- The original task description so nothing is lost

If `iterationCount >= maxIterations`, the system escalates to human rather than sending back to the agent.

---

## 8. Webhook & Automation System

### Webhook Receivers

Generic endpoint: `/api/webhooks/{blueprintSlug}/{userId}/{endpointName}`

- **Signature Verification**: HMAC-SHA256, HMAC-SHA1, JWT, or none
- **Event Types**: Configurable per endpoint (push, pull_request, issue, message, etc.)
- **Statistics**: Received, Processed, Failed counts per endpoint
- **Pause/Resume**: Temporarily disable endpoints without deletion

### Automation Rules

Event-driven task creation and agent triggering:

```
WHEN: github.push event received
WHERE: repository == "main-app" AND branch == "main"
THEN: Create task "Review latest push to main"
      Assign to: Kaze
      Priority: high
      Include: commit messages as description
```

Supported actions:
- **create_task** — Auto-create tasks from webhook events (template variables: `{{payload.repo}}`, `{{payload.author}}`)
- **send_notification** — Notify agents of external events
- **trigger_agent** — Wake specific agent for immediate action
- **execute_tool** — Call integration tool in response to event

Conditions use **JSONPath expressions** for flexible event filtering.

### Built-in Webhook Handlers
- **Slack**: Mentions, DMs, reactions → task creation
- **GitHub**: Push, PR, issue events → task assignment
- **Linear**: Issue updates → status sync
- **Generic**: Any webhook with JSON body → template-based processing

---

## 9. Security & Encryption

### Credential Storage
- **Algorithm**: AES-256-GCM (NIST-approved authenticated encryption)
- **IV**: 12 bytes (96 bits), randomly generated per encryption
- **Auth Tag**: 16 bytes (128 bits) — prevents tampering
- **Format**: Base64(IV + Ciphertext + AuthTag)
- **Master Key**: 32-byte hex string stored as Convex environment variable (`INTEGRATION_ENCRYPTION_KEY`)
- **Scope**: All OAuth tokens, API keys, refresh tokens encrypted at rest

### OAuth Security
- **State Parameter**: HMAC-SHA256 signed with encrypted JSON payload (blueprintSlug, userId, timestamp)
- **CSRF Protection**: State verified on callback — prevents authorization code interception
- **Timestamp Validation**: OAuth state expires after 10 minutes
- **Client Secrets**: Stored as environment variables (`OAUTH_SECRET_<SLUG>`), never in database
- **Token Refresh**: Hourly cron job refreshes tokens expiring within 5 minutes
- **Popup Channel**: Dual-channel completion (postMessage + localStorage) handles providers with intermediate redirects

### Webhook Security
- **Signature Verification**: HMAC-SHA256, HMAC-SHA1, or JWT per endpoint
- **Secret Management**: Per-endpoint secrets stored securely
- **Event Validation**: Payload integrity verified before processing

### Infrastructure Security
- **SSH Proxy**: Railway-hosted, no direct Lightsail access from frontend
- **Clerk Auth**: All routes behind authentication, user-scoped data access
- **CORS**: Configured for known origins only
- **Agent Wakeup**: HMAC-signed requests from Convex to wakeup server

---

## 10. The Most Complex Problems We Solve

### 1. Multi-Agent Dependency Orchestration

**Problem**: A single business objective requires multiple agents working in sequence and parallel, with dependencies between their outputs.

**Our Solution**:
- Task dependency graph with automatic chain reactions
- When Task A completes, Tasks B and C (which depend on A) automatically unblock
- Deliverables from upstream tasks are injected as context into downstream tasks
- Kaze (Chief of Staff) monitors the entire chain and intervenes if something stalls
- 2-hour cron sweep catches anything that falls through the cracks
- Quality loops ensure outputs meet standards before unblocking dependents

**Example**: "Prepare Q1 board presentation"
```
Scout: Research market data, competitor moves, industry trends
    ↓ (deliverables feed into)
Ghost: Write narrative slides + talking points
    ↓ (deliverables feed into)
Forge: Generate data visualizations + charts
    ↓ (all deliverables feed into)
Kaze: Review everything, compile final deck, flag gaps
```

### 2. Universal API Integration Without Developer Work

**Problem**: Enterprises use 50+ SaaS tools. Connecting each one traditionally requires a developer to read docs, build an integration, and maintain it.

**Our Solution**:
- User pastes an API docs URL
- System detects OpenAPI spec → deterministic parse; or Claude reads HTML docs
- User reviews generated blueprint, edits if needed, saves
- OAuth/API key auth managed automatically
- Agents can now call that API like it was always available
- Cost: $0/month vs Paragon's $2,500/month

### 3. Agents That Learn Across Sessions

**Problem**: Standard AI agents are stateless — every session starts from zero. They repeat mistakes, forget user preferences, and never improve.

**Our Solution**:
- Agents write episodic memories during work (api quirks, patterns, preferences, failures)
- Memories scored by relevance (importance + recency + human endorsement)
- Top 10 memories surfaced at every heartbeat — agents always have their best knowledge
- Session handoffs tell the next instance exactly where to continue
- Periodic distillation evolves the SOUL file — agents literally become better over time
- Human endorsement loop ensures quality memories rise to the top

### 4. Real-Time Agent Coordination Across External APIs

**Problem**: Agents need to call external APIs (GitHub, Slack, Jira) as part of their work, but each API has different auth, rate limits, error handling, and response formats.

**Our Solution**:
- Execution engine abstracts all complexity behind a single `executeTool(blueprintSlug, toolName, args)` call
- Auto-injects correct auth headers (OAuth bearer, API key, basic auth)
- Retries with jittered exponential backoff on transient failures (429, 502, 503)
- Respects Retry-After headers for rate limiting
- Response mapping extracts relevant data from nested API responses
- All calls logged for debugging and analytics

### 5. Event-Driven Workflow Automation

**Problem**: Business events happen in external tools (Slack message, GitHub PR, Linear issue). These should automatically trigger agent workflows without human intervention.

**Our Solution**:
- Webhook endpoints with signature verification (no spoofed events)
- Automation rules map events to actions (create task, trigger agent, execute tool)
- JSONPath condition evaluation for precise event filtering
- Template-based task creation with variable interpolation from event payloads
- Agents wake up automatically when tasks are assigned
- Full event history for audit trail

### 6. Secure Multi-Tenant Credential Management

**Problem**: Each user connects their own accounts (GitHub, Slack, etc.). Storing tokens securely while making them available to agents at runtime is a hard problem.

**Our Solution**:
- AES-256-GCM encryption for all credentials at rest
- Per-user connections scoped to their identity
- OAuth tokens auto-refreshed before expiry
- Connection health monitoring with consecutive failure tracking
- Automatic degradation (connected → expired → error states)
- Master key never leaves server environment

### 7. Quality Assurance at Scale

**Problem**: When agents produce outputs autonomously, how do you ensure quality without reviewing every single piece of work?

**Our Solution**:
- Rejection/rework cycles with feedback injection (iterationCount, rejectionReason)
- Agents receive their rejection reason + previous output on the next wake — they know exactly what to fix
- maxIterations cap prevents infinite loops; escalates to human when limit is hit
- SOUL distillation means agents that produce bad work repeatedly will have that pattern distilled into a lesson
- Human endorsement of memories creates a quality signal loop

---

## 11. How We're Building Autonomous AI

### The Autonomy Spectrum

```
Level 0: Chatbot         → Answers questions, no actions
Level 1: Assistant       → Takes actions when asked, one at a time
Level 2: Worker          → Executes multi-step tasks independently
Level 3: Team Member     → Coordinates with other agents, handles dependencies
Level 4: Autonomous Team → Self-organizing squad that plans, executes, reviews
Level 5: Enterprise AI   → Runs entire business functions without human oversight
```

**We are at Level 3-4**, building toward Level 5.

### What Makes Our Agents Autonomous

**1. Self-Discovery**
- Agents send heartbeats and discover their own tasks
- No human needs to tell them "go check for work"
- Agent wakeup system ensures instant activation when tasks arrive

**2. Self-Direction**
- Kaze (Chief of Staff) can decompose high-level objectives into subtasks
- Agents understand their roles and pick the right approach
- SOUL files define personality, decision frameworks, and judgment criteria

**3. Tool Access**
- Agents call real APIs (not mock/simulated ones)
- Integration engine provides unified access to any connected tool
- Agents choose which tools to use based on task requirements
- Role-based tool filtering: each agent sees the tools relevant to their specialty

**4. Coordination Without Human Intermediaries**
- Task dependencies create implicit coordination
- Deliverables from one agent flow as context to the next
- Comments and activity logs maintain shared context
- No human needs to manually transfer outputs between agents

**5. Persistent Memory**
- Agents remember api quirks, user preferences, patterns, and failures
- Session handoffs mean agents never lose context between sessions
- SOUL files evolve — agents literally get better at their jobs over time

**6. Quality Control Loops**
- In-review status allows human oversight of agent output
- Kaze reviews other agents' work before marking missions complete
- Rejection/rework cycles ensure outputs improve with feedback
- Review sweep cron catches stale tasks
- Metrics track quality over time

### The Agent Execution Loop

```
1. WAKE: Webhook triggers agent startup
2. HEARTBEAT: Agent receives rich context:
   - Assigned tasks with dependency deliverables
   - Available integration tools (role-filtered)
   - Top 10 relevant episodic memories
   - Session handoff from previous session
   - Recent activity feed
   - Unread notifications
   - Session budget (turns remaining)
3. PLAN: Agent reads task + context + memories + handoff
4. CHECK: Verify required integrations are connected
5. EXECUTE: Call APIs, write code, create content
6. DELIVER: Post deliverables + comments to task
7. MEMORIZE: Write episodic memories about discoveries/failures
8. COMPLETE: Mark task done → triggers chain reactions
9. HANDOFF: Write session summary with open questions + next hints
10. IDLE: Wait for next task or shut down after session budget exhausted
```

### Why OpenClaw + Mission Control

**OpenClaw** provides the agent runtime — the ability to run Claude with tools, memory, and sessions on a server. Think of it as the "body" of the agent.

**Mission Control** provides the brain — task understanding, coordination, integration access, quality control, and persistent memory. Think of it as the "nervous system" connecting multiple bodies into a team that learns.

Together, they create agents that:
- Have persistent identity (SOUL files that evolve)
- Have growing knowledge (episodic memory across sessions)
- Have configurable capabilities (skills, model, session limits)
- Have access to the real world (integration engine, 30+ blueprints)
- Work as a team (task dependencies, delegation, dependency injection)
- Are observable (analytics, activity logs, metrics, memory bank)
- Get better over time (memory distillation, SOUL file versioning)

---

## 12. Tech Stack & Infrastructure

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite 5 | Build tool + dev server (port 8080) |
| TypeScript | Type safety |
| Tailwind CSS 3 | Utility-first styling |
| shadcn/ui (50+ components) | Component library |
| React Router 6 | Client-side routing (18+ routes) |
| Framer Motion | Animations |
| Recharts | Analytics charts |
| Clerk React | Authentication |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|-----------|---------|
| Convex | Serverless backend + real-time database |
| Convex HTTP Actions | REST API endpoints (100+) |
| Convex Crons | Scheduled jobs (token refresh, review sweep, metric agg, distillation) |
| AES-256-GCM | Credential encryption |
| HMAC-SHA256 | OAuth state signing, webhook verification, agent wakeup signing |

### Infrastructure
| Component | Platform |
|-----------|----------|
| Frontend + Backend | Convex (serverless, dev: beloved-squirrel-599) |
| SSH Proxy | Railway (Node.js, ssh-proxy-service-production.up.railway.app) |
| Agent Runtime | AWS Lightsail (self-hosted OpenClaw) |
| Authentication | Clerk |
| Source Code | GitHub (appydam/agent-orchestrator) |

### Agent Runtime
| Technology | Purpose |
|-----------|---------|
| OpenClaw | Agent framework |
| Claude Opus 4.5 | LLM model |
| SSH2 (Node.js) | Server management |
| SOUL files | Agent personality/instructions (versioned, human-reviewed) |

### Environment Variables (Convex)
| Variable | Purpose |
|----------|---------|
| `INTEGRATION_ENCRYPTION_KEY` | AES-256-GCM master key for credential encryption |
| `OAUTH_SECRET_GITHUB` | GitHub OAuth client secret |
| `OAUTH_SECRET_<SLUG>` | Per-provider OAuth secrets (resolved at runtime) |
| `ANTHROPIC_API_KEY` | For doc scraper Claude calls |
| `AGENT_WAKEUP_SERVER_URL` | Railway agent wakeup server URL |
| `CONVEX_SITE_URL` | OAuth callback base URL |

---

## 13. Database Schema

### Core Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `agents` | Agent status tracking | name, status, currentTask, tasksCompleted, lastHeartbeat |
| `tasks` | Work items | title, status, priority, assignee, missionId, dependsOn, deliverables, iterationCount, maxIterations, rejectionReason |
| `missions` | Task groups | title, description, status, taskCount, completedTaskCount |
| `comments` | Task discussions | taskId, author, content, mentions |
| `activity` | System event log | action, agentName, details, timestamp |
| `messages` | Agent-to-human messaging | from, to, content |
| `notifications` | Agent @mentions | agentName, type, taskId, fromAuthor, contentPreview, read |
| `documents` | Agent-created artifacts | title, type, content, author, tags |

### Integration Engine Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `blueprints` | Integration definitions | slug, name, baseUrl, authType, authConfig (JSON), apiProtocol, status |
| `blueprintTools` | API actions per blueprint | blueprintId, name, method, path, pathParams, queryParams, bodySchema, responseMapping, paginationConfig, aiUsageHint |
| `connections` | User auth credentials | userId, blueprintId, credentialsEncrypted, status, expiresAt, consecutiveFailures |
| `scraperJobs` | Doc scraping tracking | userId, docsUrl, status, blueprintId, toolCount, error |
| `integrationActivity` | Execution logs | userId, agentName, blueprintId, toolName, httpStatus, durationMs, retryCount |

### Memory & Learning Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `agentMemory` | Episodic memories | agentName, memoryType, title, body, evidence, tags, importanceScore, confirmations, contradictions, humanEndorsed, status, expiresAt |
| `sessionHandoffs` | End-of-session summaries | agentName, sessionSummary, tasksCompleted, newMemoriesCreated, openQuestions, nextSessionHint |
| `soulFileVersions` | SOUL file version control | agentName, content, version, changeLog, memoriesDistilled, status (pending_review/approved/rejected) |
| `memoryDistillationJobs` | Distillation tracking | agentName, status, memoriesAnalyzed, sourceMemoryIds, soulVersionId, triggeredBy |
| `soulFiles` | Active SOUL files | agentName, content, updatedAt, syncedToServer |

### Webhook & Automation Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `webhookEndpoints` | Webhook receivers | userId, urlPath, signatureMethod, eventTypes, status, stats (received/processed/failed) |
| `webhookEvents` | Received events | endpointId, payload, verified, processed, taskId |
| `automationRules` | Event-to-action mapping | eventType, conditions (JSONPath), actionType, actionConfig, taskTemplate |

### Analytics & Config Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `taskMetrics` | Task timing | taskId, timeToAssign, timeToStart, timeToComplete, source (manual/webhook/agent/integration) |
| `agentMetrics` | Agent performance | agentName, period, tasksCompleted, completionRate, avgTimeToComplete, integrationCallCount |
| `systemMetrics` | System health | periodType, totalTasksCreated, totalTasksCompleted, totalIntegrationCalls, totalWebhooksReceived, totalCost |
| `usage` | Cost tracking | agentName, model, inputTokens, outputTokens, cost |
| `agentConfigs` | Agent settings | agentName, model, skills, maxTurns, timeout |
| `sshConfig` | SSH credentials | host, port, username, encryptedPrivateKey |
| `users` | Clerk user profiles | clerkId, email, name |
| `figmaPluginCommands` | Figma plugin queue | createdBy, fileKey, label, spec (JSON), status, resultNodeIds |

---

## 14. API Surface

### Task Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/heartbeat` | Agent heartbeat — returns tasks + tools + memories + handoff + notifications + session budget |
| GET | `/api/tasks` | List tasks with filtering |
| POST | `/api/tasks` | Create task |
| POST | `/api/tasks/update` | Update task properties |
| POST | `/api/tasks/claim` | Agent claims a task (checks dep readiness) |
| POST | `/api/tasks/complete` | Complete task with deliverables + comment |
| POST | `/api/tasks/delegate` | Create multiple subtasks with dependencies |
| POST | `/api/tasks/deliverable` | Add deliverable to task |
| POST | `/api/comments` | Add comment with @ mentions |
| GET | `/api/activity` | Get activity log |
| POST | `/api/activity` | Log activity |

### Integration Engine
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/integration-engine/tools` | List available tools for user |
| POST | `/api/integration-engine/execute` | Execute a tool against real API |
| POST | `/api/integration-engine/oauth/start` | Start OAuth flow |
| GET | `/api/integrations/oauth/callback` | OAuth redirect handler (dual-channel: postMessage + localStorage) |
| POST | `/api/integration-engine/connections` | Manage user connections |
| POST | `/api/integration-engine/scrape` | Start doc scraping job |
| GET | `/api/integration-engine/scrape/status` | Poll scraping job status |

### Memory & Learning
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/memory/write` | Agent writes a new memory |
| POST | `/api/memory/surface` | Get top relevant memories for agent |
| POST | `/api/session/handoff` | Save session handoff |
| POST | `/api/soul/distill` | Trigger SOUL file distillation |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/{blueprintSlug}/{userId}/{name}` | Generic webhook receiver |
| POST | `/api/integrations/webhooks` | Create/update webhook endpoint |
| GET | `/api/integrations/webhooks` | List webhook endpoints |

### Agent Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/agents/wake` | Trigger agent wakeup via Railway server |
| POST | `/api/agents/config` | Update agent configuration |
| POST | `/api/soul/sync` | Sync SOUL file to server |

---

## 15. Frontend Pages & Components

### Pages (18+ routes)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Activity Feed | Dashboard with agent status cards, task stats, recent activity |
| `/board` | Mission Board | 5-column Kanban with mission filtering, task detail panel |
| `/missions` | Missions | Active/Completed/Archived missions with progress tracking |
| `/squad` | Squad View | Agent squad visualization with status, current tasks, roles |
| `/agents` | Agents | Agent config panels, metrics, cost, SOUL file editing |
| `/command` | Command Center | Direct chat with agents, color-coded messages |
| `/documents` | Documents | Grid of agent reports/code/analysis with filters |
| `/tools` | OpenClaw Skills | Available skills catalog with install capability |
| `/integrations` | Integrations | City View (spatial) + List View, 30+ blueprints + 100+ templates |
| `/integrations/blueprint/new` | Blueprint Wizard | 3-step: paste URL → AI scrape / manual form → review → save |
| `/integrations/blueprint/:id` | Blueprint Detail | Tools list, execution history, connection settings |
| `/webhooks` | Webhooks | Endpoint management + event history + automation rules |
| `/analytics` | Analytics | Charts: trends, performance, completion times, source tracking |
| `/memory` | Memory Bank | Browse, search, filter agent memories; endorse/flag |
| `/memory/:id` | Memory Detail | Single memory with evidence, related agents, vote UI |
| `/soul-review` | SOUL Review | Pending SOUL file versions — diff view, approve/reject |
| `/settings` | Settings | SSH server configuration |
| `/login` | Login | Clerk auth with gradient UI |

### Key Components

**Core UI:**
- **AppSidebar** — Collapsible navigation (13+ items)
- **TaskCard / TaskDetailPanel** — Task CRUD with comments, deliverables, dependencies, rejection feedback UI
- **AgentStatusCard / AgentConfigPanel** — Agent monitoring and configuration
- **NotificationBell** — @mention notifications with unread count

**Integration Engine:**
- **CityView** — 2D spatial layout: blueprints as buildings (sized by tool count), agents as walkers navigating between them
- **IntegrationCard** — Blueprint card with logo, description, status badge, connect button
- **BlueprintWizard** — 3-step wizard with doc scraper integration
- **ApiKeyEntry** — Config-driven API key input form
- **OAuthSetupGuide** — Provider-specific OAuth setup instructions

**Memory & Learning:**
- **MemoryCard** — Single memory display with type, importance, endorsement button
- **MemoryBank** — Searchable, filterable memory browser per agent
- **SOULReviewPanel** — Diff-based SOUL file review with approve/reject

**Squad & Agent Views:**
- **SquadMemberCard** — Agent card with role, status, current task, memory snapshot
- **SquadActivityFeed** — Real-time team activity across all agents

**shadcn/ui Primitives (50+):** Button, Card, Dialog, Select, Tabs, Table, Tooltip, Sidebar, Collapsible, Accordion, Badge, Progress, Checkbox, Radio, Switch, Separator, Skeleton, Alert, etc.

### Design System
- **Theme**: Dark mode default (deep blue-gray background)
- **Agent Colors**: Kaze (blue), Scout (green), Forge (orange), Ghost (purple), Sentinel (red)
- **Fonts**: Inter (UI) + JetBrains Mono (code)
- **Patterns**: Card-based layouts, right-side detail panels, modal dialogs, activity feeds
- **Animations**: Slide-in panels, pulse effects on live indicators, smooth transitions, City View walker animations

---

## 16. Current Integrations

### Pre-Seeded Blueprints (30+)
Ready to connect — OAuth or API key, no setup needed:

| Category | Integrations |
|----------|-------------|
| **Dev Tools** | GitHub, GitLab, Bitbucket, CircleCI, Vercel |
| **Project Management** | Jira, Linear, Asana, Monday, ClickUp, Notion |
| **Communication** | Slack, Microsoft Teams, Discord, Twilio, SendGrid |
| **CRM** | Salesforce, HubSpot, Pipedrive, Intercom, Zendesk |
| **Commerce** | Shopify, Stripe |
| **Data** | Airtable, Google Sheets |
| **Enterprise** | ServiceNow, SAP |
| **AI/ML** | OpenAI, Anthropic, Replicate |

### Template Catalog (100+)
Organized by category for discovery:
- **Dev Tools**: GitHub, GitLab, Bitbucket, CircleCI, Vercel, Netlify
- **Project Management**: Jira, Linear, Asana, Monday, Trello, Notion, ClickUp
- **Communication**: Slack, Discord, Microsoft Teams, Twilio, SendGrid
- **CRM**: Salesforce, HubSpot, Pipedrive, Intercom, Zendesk
- **Marketing**: Mailchimp, Google Ads, Facebook Ads, ActiveCampaign
- **Finance**: Stripe, QuickBooks, Xero, Plaid
- **Cloud**: AWS, GCP, Azure, Cloudflare
- **AI/ML**: OpenAI, Anthropic, Replicate
- **And more**: 100+ total templates

### Any API via Doc Scraper
Beyond templates, users can connect **any API** by pasting its documentation URL. The AI doc scraper handles the rest — OpenAPI specs parsed deterministically, HTML docs analyzed by Claude.

---

## 17. What Makes Us Different

### vs. ChatGPT / Claude (Single Agent Chat)
| Them | Us |
|------|-----|
| One agent, one conversation | Five specialized agents working as a team |
| No persistent task tracking | Full task lifecycle with Kanban board |
| No real API access | Universal integration engine (any API, 30+ blueprints) |
| No coordination | Task dependencies, delegation, dependency injection |
| Stateless conversations | Persistent missions, deliverables, history, memory |
| Never improves | Agents learn via episodic memory + SOUL file distillation |

### vs. Zapier / Make / Workato (Workflow Automation)
| Them | Us |
|------|-----|
| Pre-built connectors only | Any API via doc scraper + OpenAPI import |
| If-this-then-that logic | AI agents that understand context and make decisions |
| No intelligence in the workflow | Claude Opus 4.5 reasoning at every step |
| $50-500/month for basic plans | Self-hosted, $0 platform cost |
| Human builds every workflow | AI generates integrations from docs |
| Workflows don't learn | Agents improve from experience |

### vs. Paragon / Merge (Integration Platforms)
| Them | Us |
|------|-----|
| $2,500/month | $0/month (self-hosted) |
| Pre-built connectors only | Any API via AI doc scraper |
| SDK-based, developer-required | No-code: paste URL, review, connect |
| Integration middleware | Direct agent-to-API execution |
| No AI layer | AI agents as first-class users of integrations |

### vs. AutoGPT / CrewAI / LangGraph (Agent Frameworks)
| Them | Us |
|------|-----|
| Framework/library (build it yourself) | Complete product with UI, backend, deployment |
| No built-in integrations | Universal Integration Engine with 30+ live blueprints |
| No task management | Full Kanban, missions, dependencies, deliverables |
| No analytics | Performance tracking, cost monitoring, completion metrics |
| Demo-grade reliability | Production-grade: encrypted creds, retry logic, error handling |
| Stateless agents | Agents with episodic memory, session handoffs, SOUL evolution |
| No quality loops | Rejection/rework cycles, iteration tracking, feedback injection |

---

## 18. Future Vision & Roadmap

### Near-Term (Building Now)

**Self-Improving Agent Loop**
- Agents analyze their own performance metrics
- Identify patterns in failed/slow tasks
- Suggest SOUL file improvements and skill additions
- Human approves, system deploys
- *(Foundation complete: memory + distillation + SOUL versioning are live)*

**Advanced Task Planning**
- Kaze generates entire project plans from a single objective
- Automatic dependency graph generation
- Resource estimation (which agents, how long, which integrations needed)
- Critical path identification

**Integration Marketplace**
- Community-contributed blueprints
- Version control for blueprints
- Blueprint sharing between organizations
- Quality ratings and usage metrics

### Mid-Term (Next Quarter)

**Multi-Modal Agents**
- Agents process images, PDFs, spreadsheets
- Screenshot analysis for UI/UX tasks
- Document extraction and summarization
- Chart/graph generation from data

**Cross-Agent Memory**
- Memories confirmed by multiple agents become team knowledge
- Agents share discoveries about API quirks, user preferences
- Memory graph links related memories across agents
- Team knowledge base that all agents reference

**Human-in-the-Loop Workflows**
- Approval gates at critical decision points
- Escalation rules when agents are uncertain (already have maxIterations → escalate)
- Collaborative editing of agent outputs
- Feedback loops that improve future performance

**Advanced Webhook Orchestration**
- Webhook-to-workflow templates
- Multi-step event processing pipelines
- Cross-integration event correlation
- SLA monitoring and alerting

### Long-Term (6-12 Months)

**Enterprise AI Operating System**
- Agents run entire business functions (customer support, sales ops, content marketing)
- Department-level autonomy with executive oversight
- Cross-functional agent teams (sales + marketing + engineering agents coordinating)
- Budget-aware execution (agents consider cost vs. value)

**Agent Marketplace**
- Custom agent roles beyond the core five
- Industry-specific agents (healthcare compliance, financial analysis, legal review)
- Pre-configured agent teams for common enterprise workflows
- Agent templates with proven SOUL files

**Predictive Workflows**
- Agents anticipate needs before humans ask
- Pattern-based task creation from historical data
- Proactive alerting (e.g., "Competitor launched a feature — should we respond?")
- Autonomous decision-making within defined guardrails

**Multi-Tenant Enterprise**
- Organization-level agent teams
- Role-based access control for humans
- Audit logging for compliance
- SSO/SAML integration
- Data isolation between tenants

**Self-Healing Infrastructure**
- Agents monitor their own infrastructure
- Auto-recover from failures
- Scale up/down based on workload
- Cost optimization (switch models based on task complexity)

### The Ultimate Vision

**Mission Control becomes the operating system for enterprise AI workforces.**

Every company has a "mission control" where:
- Business objectives are defined by humans
- AI agent squads execute autonomously
- Any tool, any API, any workflow is accessible
- Agents remember, learn, and improve continuously
- Performance is measured and optimized continuously
- Humans focus on strategy; agents handle execution

We're not building a chatbot. We're not building a workflow tool. We're building the **command center for the future of work** — where human intent is translated into autonomous execution across every tool in the enterprise stack, and the agents get smarter with every task they complete.

---

## 19. Key File Reference

### Backend (convex/)
| File | Purpose |
|------|---------|
| `schema.ts` | Database schema (30+ tables) |
| `http.ts` | HTTP API endpoints (100+) |
| `tasks.ts` | Task management + dependency logic |
| `taskDeps.ts` | Dependency graph: areDependenciesMet, getReadyTasks |
| `executionEngine.ts` | Integration tool execution (retry, auth, response mapping) |
| `blueprints.ts` | Blueprint CRUD |
| `blueprintTools.ts` | Tool CRUD per blueprint |
| `connections.ts` | Connection management |
| `connectionActions.ts` | OAuth start/callback + API key connections |
| `docScraper.ts` | AI doc scraper (OpenAPI detection + HTML parsing) |
| `agentMemory.ts` | Episodic memory writes, reads, relevance scoring |
| `sessionHandoffs.ts` | Session handoff save + retrieve |
| `soulDistillation.ts` | Memory → SOUL file distillation |
| `soulFileVersions.ts` | SOUL file version control (pending_review, approve/reject) |
| `heartbeat.ts` | Rich heartbeat: tasks + tools + memories + handoff + notifications + budget |
| `webhookReceiver.ts` | Generic webhook receiver |
| `webhookReceiverActions.ts` | Signature verification + automation rule execution |
| `automationRules.ts` | Automation engine (JSONPath conditions, action templates) |
| `analytics.ts` | Dashboard metrics computation |
| `agentWakeup.ts` | Agent startup trigger (HMAC-signed) |
| `crons.ts` | Scheduled jobs (token refresh, metric aggregation, distillation) |
| `figmaPlugin.ts` | Figma plugin command queue |
| `lib/crypto.ts` | AES-256-GCM encryption/decryption |
| `lib/requestBuilder.ts` | HTTP request construction (auth, path params, bodies) |
| `lib/openApiParser.ts` | OpenAPI spec parsing |
| `lib/agentToolRecommendations.ts` | Role-based tool filtering |
| `seed*.ts` (30+ files) | Pre-seeded blueprints for all major integrations |

### Frontend (src/)
| File | Purpose |
|------|---------|
| `App.tsx` | Root router (18+ routes) |
| `pages/Board.tsx` | Kanban task board |
| `pages/Agents.tsx` | Agent monitoring + config |
| `pages/Squad.tsx` | Squad overview |
| `pages/Integrations.tsx` | Integration hub (City View + List View) |
| `pages/BlueprintWizard.tsx` | AI-powered integration builder (3-step wizard) |
| `pages/BlueprintDetail.tsx` | Blueprint editor + testing + execution history |
| `pages/MemoryBank.tsx` | Agent memory browser |
| `pages/AgentMemoryDetail.tsx` | Single memory detail + voting |
| `pages/SoulReview.tsx` | SOUL file version review (approve/reject) |
| `pages/Webhooks.tsx` | Webhook management + automation rules |
| `pages/Analytics.tsx` | Performance dashboard |
| `pages/Command.tsx` | Agent chat |
| `hooks/useIntegrationEngine.ts` | Integration CRUD + OAuth + API key connection |
| `hooks/useDocScraper.ts` | Doc scraping state + polling |
| `hooks/useOAuthPopup.ts` | OAuth popup flow (postMessage + localStorage dual-channel) |
| `components/CityView/` | 2D spatial integration visualization |
| `components/SquadView/` | Squad member cards + activity feed |
| `lib/api.ts` | HTTP client (apiPost, apiGet) |
| `lib/integrationLogos.ts` | Blueprint slug → logo URL mapping |
| `data/integrations.ts` | 100+ integration template catalog |
| `types/mission.ts` | Core TypeScript types + AGENT_CONFIG + color helpers |

### Server Files
| File | Purpose |
|------|---------|
| `server-files/ssh-proxy-server.js` | SSH proxy on Railway |
| `server-files/agent-wakeup-server.js` | Agent startup webhook |
| `server-files/openclaw-config.json` | Agent configuration |
| `server-files/agents/kaze/SOUL.md` | Kaze agent identity |
| `server-files/agents/scout/SOUL.md` | Scout agent identity |
| `server-files/agents/forge/SOUL.md` | Forge agent identity |
| `server-files/agents/ghost/SOUL.md` | Ghost agent identity |
| `server-files/agents/sentinel/SOUL.md` | Sentinel agent identity |

---

*Last updated: 2026-02-24*
*This document is the single source of truth for the Mission Control project.*
