# Mission Control: Project Bible

> The definitive reference for what we've built, where we're going, and why it matters.

---

## Table of Contents

1. [Vision & Philosophy](#1-vision--philosophy)
2. [What We've Built — Complete Feature Map](#2-what-weve-built--complete-feature-map)
3. [Architecture Overview](#3-architecture-overview)
4. [The Agent Squad](#4-the-agent-squad)
5. [Universal Integration Engine](#5-universal-integration-engine)
6. [Webhook & Automation System](#6-webhook--automation-system)
7. [Security & Encryption](#7-security--encryption)
8. [The Most Complex Problems We Solve](#8-the-most-complex-problems-we-solve)
9. [How We're Building Autonomous AI](#9-how-were-building-autonomous-ai)
10. [Tech Stack & Infrastructure](#10-tech-stack--infrastructure)
11. [Database Schema](#11-database-schema)
12. [API Surface](#12-api-surface)
13. [Frontend Pages & Components](#13-frontend-pages--components)
14. [Current Integrations](#14-current-integrations)
15. [What Makes Us Different](#15-what-makes-us-different)
16. [Future Vision & Roadmap](#16-future-vision--roadmap)
17. [Key File Reference](#17-key-file-reference)

---

## 1. Vision & Philosophy

### The Problem

Every enterprise runs on workflows — sales pipelines, customer onboarding, code releases, content creation, vendor management. These workflows are:

- **Fragmented** across 15-50 SaaS tools
- **Manual** at the glue points (copy-pasting between Slack, Jira, Salesforce, GitHub)
- **Expensive** to automate (Workato, Paragon, Zapier = $1k-10k/month)
- **Brittle** when things change (a single API update breaks everything)

### Our Thesis

**Autonomous AI agents, working as a coordinated squad, can replace entire workflow layers in the enterprise.** Not one chatbot answering questions. A team of specialized agents that:

1. **Understand context** — read tasks, understand priorities, know the business
2. **Take action** — call real APIs, write code, create deliverables
3. **Coordinate** — delegate to each other, track dependencies, report progress
4. **Learn** — adapt to the enterprise's specific patterns over time

### The Outcome

Mission Control is the **command center for autonomous AI workforces**. It's where humans set objectives and AI agents execute them — across any tool, any workflow, any enterprise.

---

## 2. What We've Built — Complete Feature Map

### Core Platform

| Feature | Status | Description |
|---------|--------|-------------|
| **Agent Orchestration** | Live | 4-agent squad (Kaze, Scout, Forge, Ghost) with real-time status, heartbeats, and task assignment |
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
| **OAuth2 Flow** | Live | Full OAuth popup flow with HMAC-signed state, auto token refresh |
| **API Key Auth** | Live | Encrypted storage + auto-injection for API key integrations |
| **Execution Engine** | Live | Retry logic, rate limit handling, response mapping, timeout management |
| **Encrypted Credentials** | Live | AES-256-GCM encryption for all tokens at rest |
| **Tool Execution** | Live | Agents call real APIs via HTTP with full request building + auth injection |
| **100+ Integration Templates** | Live | Pre-defined templates for common SaaS tools |

### Infrastructure

| Feature | Status | Description |
|---------|--------|-------------|
| **OpenClaw Agent Runtime** | Live | Self-hosted on Lightsail, managed via SSH proxy on Railway |
| **Agent Wakeup System** | Live | Webhook-triggered agent startup with task queue |
| **SSH Proxy** | Live | Secure command execution on Lightsail from web UI |
| **SOUL File Sync** | Live | Edit agent personalities in UI, sync to server |
| **Clerk Authentication** | Live | User auth with sign-in/sign-up, integrated with Convex |
| **Real-time Subscriptions** | Live | Convex-powered live updates across all UI components |
| **Cron Jobs** | Live | Hourly OAuth token refresh, 2-hour review sweep |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MISSION CONTROL UI                         │
│         React + Vite + TypeScript + Tailwind + shadcn/ui     │
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐│
│  │  Board   │ │  Agents  │ │Analytics │ │  Integrations    ││
│  │  Tasks   │ │  Command │ │Documents │ │  Webhooks        ││
│  │ Missions │ │  Tools   │ │ Settings │ │  Blueprint Wizard││
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘│
└────────────────────────┬────────────────────────────────────┘
                         │ Real-time Subscriptions + HTTP
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONVEX BACKEND                             │
│         Serverless Functions + Real-time Database             │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Task Engine    │  Integration Engine  │  Webhook Engine ││
│  │  - CRUD         │  - Blueprints        │  - Receivers    ││
│  │  - Dependencies │  - OAuth/API Keys    │  - Signature    ││
│  │  - Delegation   │  - Execution         │    Verification ││
│  │  - Chain React. │  - Token Refresh     │  - Automation   ││
│  └──────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Crypto Layer (AES-256-GCM)  │  Analytics  │  Cron Jobs ││
│  └──────────────────────────────────────────────────────────┘│
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP API (Heartbeat, Tasks, Tools)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  OPENCLAW AGENT RUNTIME                       │
│            Lightsail Server (Self-Hosted)                     │
│                                                               │
│   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                   │
│   │ Kaze │  │Scout │  │Forge │  │Ghost │                    │
│   │ 🌀   │  │ 🔭   │  │ 🔨   │  │ 👻   │                    │
│   │Chief │  │Intel │  │Engi- │  │Cont- │                    │
│   │of    │  │ligence│  │neer  │  │ent & │                    │
│   │Staff │  │      │  │      │  │Dist. │                    │
│   └──────┘  └──────┘  └──────┘  └──────┘                   │
│                                                               │
│   Model: Claude Opus 4.5  │  Skills: mission-control         │
│   Sessions: 20-30 turns   │  Timeout: 300-600s               │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL WORLD                                   │
│  GitHub  │  Slack  │  Jira  │  Salesforce  │  Any API        │
│  Linear  │  Gmail  │  HubSpot  │  Intercom  │  Custom...     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Human sets objective** → Creates mission + tasks in UI
2. **Task assigned to agent** → Convex triggers agent wakeup webhook
3. **Agent wakes up** → Sends heartbeat, discovers tasks
4. **Agent works** → Reads task, calls integration tools, creates deliverables
5. **Agent completes** → Posts deliverables, marks task done
6. **Chain reaction** → Dependent tasks unblock, next agents wake up
7. **Human reviews** → Analytics show progress, documents capture output

---

## 4. The Agent Squad

### Kaze 🌀 — Chief of Staff
- **Role**: Orchestrator and decision-maker
- **Responsibilities**: Task triage, delegation, approval/rejection, final review
- **Superpower**: Understands the full mission context, breaks down complex objectives into sub-tasks
- **Delegates to**: Scout (research), Forge (engineering), Ghost (content)

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

Scout completes research → Kaze reviews → Unblocks Ghost (who needs research for copy)
Forge finishes code → Kaze reviews → Marks mission complete
Ghost finishes content → Kaze reviews → Schedules distribution
```

### Agent Configuration
Each agent is independently configurable:
- **Model**: Claude Opus 4.5 / Sonnet / Haiku (cost optimization)
- **Skills**: 10+ toggleable capabilities (mission-control, web-search, code-execution, etc.)
- **Session Limits**: Max turns (20-30) and timeout (300-600s)
- **SOUL File**: Markdown personality/instruction file editable from UI, synced to server

---

## 5. Universal Integration Engine

### Why We Built It

Paragon costs **$2,500/month** for managed integrations. We replaced it with a custom engine that:
- Costs **$0/month** (self-hosted on Convex)
- Supports **any API** (not just pre-built connectors)
- Lets **AI generate integrations** from docs (no developer needed)
- Gives agents **direct API access** (no middleware)

### How It Works

```
Step 1: User pastes API docs URL
    ↓
Step 2: Claude reads the docs, generates structured tool definitions
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
  authConfig: { clientId, scopes, ... }   // Auth-specific configuration
  apiProtocol: "rest"                     // rest | graphql | soap | jsonrpc
  tools: [                               // Individual API actions
    {
      name: "list_repos",
      method: "GET",
      path: "/user/repos",
      parameters: [{ name: "sort", in: "query", type: "string" }],
      aiDescription: "List repositories for the authenticated user"
    },
    {
      name: "create_issue",
      method: "POST",
      path: "/repos/{owner}/{repo}/issues",
      parameters: [...],
      requestBodySchema: { title: "string", body: "string" }
    }
  ]
}
```

### Execution Engine Capabilities

| Capability | Details |
|-----------|---------|
| **Protocol Support** | REST, GraphQL, SOAP, JSON-RPC |
| **Auth Methods** | OAuth2 (authorization code), API key (header/query), Bearer token, Basic auth |
| **Auto Token Refresh** | Detects tokens expiring within 5 minutes, auto-refreshes |
| **Retry Logic** | Exponential backoff with jitter on 429/408/502/503/504 |
| **Rate Limit Handling** | Respects Retry-After headers |
| **Request Building** | Path params, query params, headers, JSON/form/XML bodies |
| **Response Mapping** | JSON path extraction for nested responses |
| **Timeout Management** | Per-tool configurable (default 30s) |
| **Execution Logging** | Every call logged with method, URL, status, duration, retries |

### Doc Scraper Intelligence

The doc scraper isn't a simple web scraper — it's an AI-powered API analyst:

1. **Fetches URL content** (handles redirects, JavaScript-rendered pages)
2. **Detects OpenAPI specs** → deterministic parsing (no AI needed)
3. **For HTML docs** → sends to Claude Sonnet with structured extraction prompt
4. **Generates**: Blueprint metadata + tool definitions + auth configuration
5. **User reviews**: Edit generated tools before saving
6. **Job tracking**: pending → fetching → analyzing → completed/failed

---

## 6. Webhook & Automation System

### Webhook Receivers
- **Signature Verification**: HMAC-SHA256, HMAC-SHA1, JWT
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
- **create_task** — Auto-create tasks from webhook events
- **send_notification** — Notify agents of external events
- **trigger_agent** — Wake specific agent for immediate action
- **execute_tool** — Call integration tool in response to event

### Built-in Webhook Handlers
- **Slack**: Mentions, DMs, reactions → task creation
- **GitHub**: Push, PR, issue events → task assignment
- **Linear**: Issue updates → status sync
- **Generic**: Any webhook with JSON body → template-based processing

---

## 7. Security & Encryption

### Credential Storage
- **Algorithm**: AES-256-GCM (NIST-approved authenticated encryption)
- **IV**: 12 bytes (96 bits), randomly generated per encryption
- **Auth Tag**: 16 bytes (128 bits) — prevents tampering
- **Format**: Base64(IV + Ciphertext + AuthTag)
- **Master Key**: 32-byte hex string stored as Convex environment variable
- **Scope**: All OAuth tokens, API keys, refresh tokens encrypted at rest

### OAuth Security
- **State Parameter**: HMAC-SHA256 signed with encrypted JSON payload (blueprintSlug, userId, timestamp)
- **CSRF Protection**: State verified on callback — prevents authorization code interception
- **Client Secrets**: Stored as environment variables, never in database
- **Token Refresh**: Hourly cron job refreshes tokens expiring within 5 minutes

### Webhook Security
- **Signature Verification**: HMAC-SHA256, HMAC-SHA1, or JWT per endpoint
- **Secret Management**: Per-endpoint secrets stored securely
- **Event Validation**: Payload integrity verified before processing

### Infrastructure Security
- **SSH Proxy**: Railway-hosted, no direct Lightsail access from frontend
- **Clerk Auth**: All routes behind authentication, user-scoped data access
- **CORS**: Configured for known origins only

---

## 8. The Most Complex Problems We Solve

### 1. Multi-Agent Dependency Orchestration

**Problem**: A single business objective requires multiple agents working in sequence and parallel, with dependencies between their outputs.

**Our Solution**:
- Task dependency graph with automatic chain reactions
- When Task A completes, Tasks B and C (which depend on A) automatically unblock
- Deliverables from upstream tasks are injected as context into downstream tasks
- Kaze (Chief of Staff) monitors the entire chain and intervenes if something stalls
- 2-hour cron sweep catches anything that falls through the cracks

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
- Claude reads the documentation and generates structured tool definitions
- OpenAPI specs detected and parsed deterministically
- User reviews generated blueprint, edits if needed, saves
- OAuth/API key auth managed automatically
- Agents can now call that API like it was always available
- Cost: $0/month vs Paragon's $2,500/month

### 3. Real-Time Agent Coordination Across External APIs

**Problem**: Agents need to call external APIs (GitHub, Slack, Jira) as part of their work, but each API has different auth, rate limits, error handling, and response formats.

**Our Solution**:
- Execution engine abstracts all complexity behind a single `executeTool(blueprintSlug, toolName, args)` call
- Auto-injects correct auth headers (OAuth bearer, API key, basic auth)
- Retries with exponential backoff on transient failures (429, 502, 503)
- Respects Retry-After headers for rate limiting
- Response mapping extracts relevant data from nested API responses
- All calls logged for debugging and analytics

### 4. Event-Driven Workflow Automation

**Problem**: Business events happen in external tools (Slack message, GitHub PR, Linear issue). These should automatically trigger agent workflows without human intervention.

**Our Solution**:
- Webhook endpoints with signature verification (no spoofed events)
- Automation rules map events to actions (create task, trigger agent, execute tool)
- Template-based task creation with variable interpolation from event payloads
- Agents wake up automatically when tasks are assigned
- Full event history for audit trail

### 5. Secure Multi-Tenant Credential Management

**Problem**: Each user connects their own accounts (GitHub, Slack, etc.). Storing tokens securely while making them available to agents at runtime is a hard problem.

**Our Solution**:
- AES-256-GCM encryption for all credentials at rest
- Per-user connections scoped to their identity
- OAuth tokens auto-refreshed before expiry
- Connection health monitoring with consecutive failure tracking
- Automatic degradation (connected → expired → error states)
- Master key never leaves server environment

### 6. AI-Powered API Understanding

**Problem**: Most API documentation is written for humans (HTML pages, code examples, tutorials). Converting this into machine-callable tool definitions is tedious and error-prone.

**Our Solution**:
- Doc scraper fetches and parses API documentation
- OpenAPI spec detection for deterministic, accurate parsing
- For HTML docs, Claude Sonnet analyzes the content and extracts:
  - Base URL and authentication requirements
  - Individual endpoints with methods, paths, parameters
  - Request body schemas and response formats
  - Rate limits and error handling patterns
- Human review step ensures accuracy before deployment

---

## 9. How We're Building Autonomous AI

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

**4. Coordination Without Human Intermediaries**
- Task dependencies create implicit coordination
- Deliverables from one agent flow as context to the next
- Comments and activity logs maintain shared context
- No human needs to manually transfer outputs between agents

**5. Quality Control Loops**
- In-review status allows human oversight of agent output
- Kaze reviews other agents' work before marking missions complete
- Review sweep cron catches stale tasks
- Metrics track quality over time

### The Agent Execution Loop

```
1. WAKE: Webhook triggers agent startup
2. HEARTBEAT: Agent reports status, discovers tasks
3. PLAN: Agent reads task + context + dependencies
4. CHECK: Verify required integrations are connected
5. EXECUTE: Call APIs, write code, create content
6. DELIVER: Post deliverables + comments to task
7. COMPLETE: Mark task done → triggers chain reactions
8. IDLE: Wait for next task or shut down after timeout
```

### Why OpenClaw + Mission Control

**OpenClaw** provides the agent runtime — the ability to run Claude with tools, memory, and sessions on a server. Think of it as the "body" of the agent.

**Mission Control** provides the brain — task understanding, coordination, integration access, quality control. Think of it as the "nervous system" connecting multiple bodies into a team.

Together, they create agents that:
- Have persistent identity (SOUL files)
- Have configurable capabilities (skills, model, session limits)
- Have access to the real world (integration engine)
- Work as a team (task dependencies, delegation)
- Are observable (analytics, activity logs, metrics)

---

## 10. Tech Stack & Infrastructure

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite 5 | Build tool + dev server (port 8080) |
| TypeScript | Type safety |
| Tailwind CSS 3 | Utility-first styling |
| shadcn/ui (51 components) | Component library |
| React Router 6 | Client-side routing (16 routes) |
| Framer Motion | Animations |
| Recharts | Analytics charts |
| Clerk React | Authentication |
| TanStack React Query | Server state management |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|-----------|---------|
| Convex | Serverless backend + real-time database |
| Convex HTTP Actions | REST API endpoints |
| Convex Crons | Scheduled jobs (token refresh, review sweep) |
| AES-256-GCM | Credential encryption |
| HMAC-SHA256 | OAuth state signing, webhook verification |

### Infrastructure
| Component | Platform |
|-----------|----------|
| Frontend + Backend | Convex (serverless) |
| SSH Proxy | Railway (Node.js) |
| Agent Runtime | AWS Lightsail (self-hosted OpenClaw) |
| Authentication | Clerk |
| Source Code | GitHub (appydam/agent-orchestrator) |

### Agent Runtime
| Technology | Purpose |
|-----------|---------|
| OpenClaw | Agent framework |
| Claude Opus 4.5 | LLM model |
| SSH2 (Node.js) | Server management |
| SOUL files | Agent personality/instructions |

---

## 11. Database Schema

### Core Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `agents` | Agent status tracking | name, status, currentTask, tasksCompleted, lastHeartbeat |
| `tasks` | Work items | title, status, priority, assignee, missionId, dependencies, deliverables |
| `missions` | Task groups | title, description, status, taskCount, completedTaskCount |
| `comments` | Task discussions | taskId, author, content, mentions |
| `activity` | System event log | action, agentName, details, timestamp |
| `messages` | Agent-to-agent messaging | from, to, content |
| `notifications` | Agent mentions/threads | agentName, type, taskId, read |
| `documents` | Agent-created artifacts | title, type, content, author, tags |

### Integration Engine Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `blueprints` | Integration definitions | slug, name, baseUrl, authType, authConfig, apiProtocol, status |
| `blueprintTools` | API actions per blueprint | blueprintId, name, method, path, parameters, requestBodySchema |
| `connections` | User auth credentials | userId, blueprintId, encryptedAccessToken, encryptedRefreshToken, status |
| `scraperJobs` | Doc scraping tracking | userId, docsUrl, status, generatedBlueprintId |
| `integrationActivity` | Execution logs | userId, blueprintId, toolId, httpStatus, durationMs, retryCount |

### Webhook & Automation Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `webhookEndpoints` | Webhook receivers | userId, url, secret, signatureType, eventTypes |
| `webhookEvents` | Received events | endpointId, payload, verified, processed |
| `automationRules` | Event-to-action mapping | eventType, conditions, action, taskTemplate |

### Analytics & Config Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `taskMetrics` | Task timing | taskId, createdAt, assignedAt, startedAt, completedAt |
| `agentMetrics` | Agent performance | agentName, period, tasksCompleted, avgCompletionTime |
| `systemMetrics` | System health | timestamp, activeTasks, activeAgents, integrationCalls |
| `usage` | Cost tracking | agentName, model, inputTokens, outputTokens, cost |
| `agentConfigs` | Agent settings | agentName, model, skills, maxTurns, timeout |
| `soulFiles` | SOUL file storage | agentName, content, lastSyncedAt |
| `sshConfig` | SSH credentials | host, port, username, encryptedPrivateKey |
| `users` | Clerk user profiles | clerkId, email, name |

---

## 12. API Surface

### Task Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/heartbeat` | Agent heartbeat (status + task discovery + available tools) |
| GET | `/api/tasks` | List tasks with filtering |
| POST | `/api/tasks` | Create task |
| POST | `/api/tasks/update` | Update task properties |
| POST | `/api/tasks/claim` | Agent claims a task |
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
| GET | `/api/integration-engine/oauth/callback` | OAuth redirect handler |
| POST | `/api/integration-engine/connections` | Manage user connections |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/*` | Generic webhook receiver |
| POST | `/api/integrations/webhooks` | Create/update webhooks |
| GET | `/api/integrations/webhooks` | List webhooks |

---

## 13. Frontend Pages & Components

### Pages (16 routes)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Activity Feed | Dashboard with agent status cards, task stats, recent activity |
| `/board` | Mission Board | 5-column Kanban with mission filtering, task detail panel |
| `/missions` | Missions | Active/Completed/Archived missions with progress tracking |
| `/agents` | Agents | 2-column grid of agent cards with config panels, metrics, cost |
| `/command` | Command Center | Direct chat with agents, color-coded messages |
| `/documents` | Documents | Grid of agent reports/code/analysis with filters |
| `/tools` | OpenClaw Skills | Available skills catalog with install capability |
| `/integrations` | Integrations | Custom blueprints + 100+ template catalog |
| `/integrations/blueprint/new` | Blueprint Wizard | AI doc scraper or manual integration builder |
| `/integrations/blueprint/:id` | Blueprint Detail | Tools, execution history, auth setup |
| `/webhooks` | Webhooks | Endpoint management + event history |
| `/analytics` | Analytics | Charts: trends, performance, completion times |
| `/settings` | Settings | SSH server configuration |
| `/login` | Login | Clerk auth with gradient UI |

### Key Components
- **AppSidebar** — Collapsible navigation (11 items)
- **TaskCard / TaskDetailPanel** — Task CRUD with comments, deliverables, dependencies
- **AgentStatusCard / AgentConfigPanel** — Agent monitoring and configuration
- **IntegrationCard / BlueprintWizard** — Integration management
- **WebhookEndpointDialog** — Webhook CRUD
- **NotificationBell** — Agent mention notifications
- **51 shadcn/ui primitives** — Button, Card, Dialog, Select, Tabs, Table, etc.

### Design System
- **Theme**: Dark mode default (deep blue-gray background)
- **Agent Colors**: Kaze (blue), Scout (green), Forge (orange), Ghost (purple)
- **Fonts**: Inter (UI) + JetBrains Mono (code)
- **Patterns**: Card-based layouts, right-side detail panels, modal dialogs, activity feeds
- **Animations**: Slide-in panels, pulse effects on live indicators, smooth transitions

---

## 14. Current Integrations

### Built-in Blueprint Seeds
| Integration | Auth Type | Capabilities |
|-------------|-----------|--------------|
| GitHub | OAuth2 | Repos, issues, PRs, commits, actions |
| Slack | OAuth2 | Messages, channels, users, files |
| Jira | OAuth2 | Issues, projects, sprints, boards |
| Salesforce | OAuth2 | Contacts, leads, opportunities, accounts |
| Intercom | OAuth2 | Conversations, contacts, companies |

### Template Catalog (100+)
Organized by category:
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
Beyond templates, users can connect **any API** by pasting its documentation URL. The AI doc scraper handles the rest.

---

## 15. What Makes Us Different

### vs. ChatGPT / Claude (Single Agent Chat)
| Them | Us |
|------|-----|
| One agent, one conversation | Four specialized agents working as a team |
| No persistent task tracking | Full task lifecycle with Kanban board |
| No real API access | Universal integration engine (any API) |
| No coordination | Task dependencies, delegation, chain reactions |
| Stateless conversations | Persistent missions, deliverables, history |

### vs. Zapier / Make / Workato (Workflow Automation)
| Them | Us |
|------|-----|
| Pre-built connectors only | Any API via doc scraper + OpenAPI import |
| If-this-then-that logic | AI agents that understand context and make decisions |
| No intelligence in the workflow | Claude Opus 4.5 reasoning at every step |
| $50-500/month for basic plans | Self-hosted, $0 platform cost |
| Human builds every workflow | AI generates integrations from docs |

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
| No built-in integrations | Universal Integration Engine with 100+ templates |
| No task management | Full Kanban, missions, dependencies, deliverables |
| No analytics | Performance tracking, cost monitoring, completion metrics |
| Demo-grade reliability | Production-grade: encrypted creds, retry logic, error handling |

---

## 16. Future Vision & Roadmap

### Near-Term (Building Now)

**Self-Improving Agent Loop**
- Agents analyze their own performance metrics
- Identify patterns in failed/slow tasks
- Suggest SOUL file improvements and skill additions
- Human approves, system deploys

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

**Memory & Learning**
- Long-term memory across sessions
- Enterprise knowledge base that agents reference
- Pattern recognition from completed tasks
- Continuous improvement without retraining

**Human-in-the-Loop Workflows**
- Approval gates at critical decision points
- Escalation rules when agents are uncertain
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
- Custom agent roles beyond the core four
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
- Performance is measured and optimized continuously
- Humans focus on strategy; agents handle execution

We're not building a chatbot. We're not building a workflow tool. We're building the **command center for the future of work** — where human intent is translated into autonomous execution across every tool in the enterprise stack.

---

## 17. Key File Reference

### Backend (convex/)
| File | Purpose | Lines |
|------|---------|-------|
| `schema.ts` | Database schema | ~18K |
| `http.ts` | HTTP API endpoints | ~52K |
| `tasks.ts` | Task management | ~926 |
| `executionEngine.ts` | Integration tool execution | ~600 |
| `blueprints.ts` | Blueprint CRUD | ~200 |
| `blueprintTools.ts` | Tool CRUD | ~250 |
| `connections.ts` | Connection management | ~200 |
| `connectionActions.ts` | OAuth + API key actions | ~400 |
| `docScraper.ts` | AI doc scraper | ~300 |
| `webhookReceiver.ts` | Webhook processing | ~200 |
| `automationRules.ts` | Automation engine | ~200 |
| `analytics.ts` | Analytics computation | ~300 |
| `agentWakeup.ts` | Agent startup trigger | ~150 |
| `lib/crypto.ts` | AES-256-GCM encryption | ~100 |
| `lib/requestBuilder.ts` | HTTP request construction | ~300 |
| `lib/openApiParser.ts` | OpenAPI spec parsing | ~200 |

### Frontend (src/)
| File | Purpose |
|------|---------|
| `App.tsx` | Root router (16 routes) |
| `pages/Board.tsx` | Kanban task board |
| `pages/Agents.tsx` | Agent monitoring |
| `pages/Integrations.tsx` | Integration blueprints |
| `pages/BlueprintWizard.tsx` | AI-powered integration builder |
| `pages/BlueprintDetail.tsx` | Blueprint editor + testing |
| `pages/Webhooks.tsx` | Webhook management |
| `pages/Analytics.tsx` | Performance dashboard |
| `pages/Command.tsx` | Agent chat |
| `hooks/useIntegrationEngine.ts` | Integration CRUD + OAuth |
| `hooks/useDocScraper.ts` | Doc scraping state |
| `hooks/useOAuthPopup.ts` | OAuth popup flow |
| `lib/api.ts` | HTTP client |
| `types/mission.ts` | TypeScript types |

### Server Files
| File | Purpose |
|------|---------|
| `ssh-proxy-server.js` | SSH proxy on Railway |
| `agent-wakeup-server.js` | Agent startup webhook |
| `openclaw-config.json` | Agent configuration |
| `SOUL.md` | Kaze agent personality |

---

*Last updated: 2026-02-20*
*This document is the single source of truth for the Mission Control project.*
