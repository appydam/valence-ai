# Valence AI: Project Bible

> The definitive reference for what we've built, where we're going, and why it matters.
>
> **Valence AI** is an autonomous Agentic AI platform that can automate any complex enterprise workflow, connected to ~100 popular tools like HubSpot, Notion, Google Workspace, Atlassian (Jira/Confluence), Figma, Shopify, Google/Meta Ads, Slack, Salesforce, GitHub, and many more.
>
> Internal codename: Mission Control.

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
9. [Mission Autopilot & Voice Interface](#9-mission-autopilot--voice-interface)
10. [Morning Brief — CEO Daily Digest](#10-morning-brief--ceo-daily-digest)
11. [War Room — Real-Time Agent Coordination](#11-war-room--real-time-agent-coordination)
12. [Agent Reasoning & Observability](#12-agent-reasoning--observability)
13. [Billing & Subscription Management](#13-billing--subscription-management)
14. [Security & Encryption](#14-security--encryption)
15. [The Most Complex Problems We Solve](#15-the-most-complex-problems-we-solve)
16. [How We're Building Autonomous AI](#16-how-were-building-autonomous-ai)
17. [Tech Stack & Infrastructure](#17-tech-stack--infrastructure)
18. [Database Schema (43 Tables)](#18-database-schema-43-tables)
19. [API Surface](#19-api-surface)
20. [Frontend Pages & Components (30+ Routes)](#20-frontend-pages--components-30-routes)
21. [Current Integrations](#21-current-integrations)
22. [What Makes Us Different](#22-what-makes-us-different)
23. [Cron Jobs & Scheduled Tasks (13 Jobs)](#23-cron-jobs--scheduled-tasks-13-jobs)
24. [Future Vision & Roadmap](#24-future-vision--roadmap)
25. [Key File Reference](#25-key-file-reference)
26. [Pilot Deployment Guide](#26-pilot-deployment-guide)
27. [Webhook Retry & Dead Letter Queue](#27-webhook-retry--dead-letter-queue)
28. [Graceful Degradation Without SSH](#28-graceful-degradation-without-ssh)
29. [Operator Documentation](#29-operator-documentation)
30. [Admin Dashboard & Data Export](#30-admin-dashboard--data-export)
31. [Server Health Monitoring](#31-server-health-monitoring)
32. [Lightsail Auto-Snapshots](#32-lightsail-auto-snapshots)
33. [Docker Image for Agents](#33-docker-image-for-agents)
34. [Onboarding & Landing](#34-onboarding--landing)

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

Valence AI is the **command center for autonomous AI workforces**. It's where humans set objectives and AI agents execute them — across any tool, any workflow, any enterprise. And unlike any other system, our agents **remember, learn, and get better** over time.

---

## 2. What We've Built — Complete Feature Map

### Core Platform

| Feature | Status | Description |
|---------|--------|-------------|
| **Agent Orchestration** | Live | 5-agent squad (Kaze, Scout, Forge, Ghost, Sentinel) with real-time status, heartbeats, and task assignment |
| **Task Management** | Live | Full lifecycle: Inbox → Assigned → In Progress → In Review → Done, with dependencies, priorities, deliverables |
| **Mission Board** | Live | Kanban board with drag-drop, Plan View (dependency DAG), Squad Ops view, mission filtering |
| **Missions** | Live | Group tasks into missions with completion tracking, War Room access, Mission Reports |
| **Mission Autopilot** | Live | Describe a goal in natural language → AI decomposes into multi-agent task plan with dependencies |
| **Voice Interface** | Live | Voice input for mission creation, Kaze as voice assistant, session recording & transcripts |
| **Morning Brief** | Live | AI-generated daily CEO digest — tasks completed, blockers, agent performance, highlights |
| **War Room** | Live | Real-time mission coordination hub — agent lanes, handoffs, blockers, milestones |
| **Command Center** | Live | Direct chat with individual agents by name |
| **Analytics Dashboard** | Live | Task trends, agent performance, completion times, integration usage (7/30/90 day) |
| **Agent Health** | Live | Deep monitoring — CPU, memory, disk, uptime, integration status per agent |
| **Webhook System** | Live | Receive webhooks from any source, verify signatures, auto-create tasks |
| **Automation Rules** | Live | Event → Action mapping (create task, send notification, trigger agent, execute tool) |
| **Agent Configuration** | Live | Per-agent model selection, skills, session limits, SOUL file editing |
| **Agent Reasoning Stream** | Live | Real-time observability into agent thinking, tool calls, decisions, errors |
| **Billing & Subscriptions** | Live | Stripe integration, 3 plan tiers, usage metering, customer portal |
| **Onboarding Wizard** | Live | 5-step guided setup for new workspaces |
| **Operations Hub** | Live | Admin provisioning guide, environment variable reference, customer management |
| **Docs / Help Center** | Live | In-app FAQ covering agents, integrations, webhooks, task lifecycle |
| **Landing Page** | Live | Public marketing page with animated demos, comparison table, pilot signup |
| **Use Case Pages** | Live | Deep-dive pages for specific workflow scenarios |

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
| **War Room Coordination** | Live | Cross-agent handoffs, blocker escalation, milestone tracking within missions |

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
| **Cron Jobs (13)** | Live | Token refresh, review sweeps, metric aggregation, memory distillation, morning brief, health checks, reasoning cleanup |
| **Figma Plugin Bridge** | Live | Agents push design specs to a command queue; Figma plugin polls and executes |
| **Server Health Monitoring** | Live | CPU/memory/disk alerts, stale agent detection, activity-logged health warnings |
| **Stripe Billing** | Live | Checkout sessions, customer portal, webhook-driven subscription lifecycle |
| **API Key Auth** | Live | Generate/revoke API keys with role-based permissions (agent/admin) |
| **Audit Logging** | Live | User actions logged with resource, details, timestamps |
| **Brand Configuration** | Live | Custom company name, logo, primary/accent colors |
| **Pilot Interest Capture** | Live | Landing page signup with email notification via Resend |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MISSION CONTROL UI                             │
│         React + Vite + TypeScript + Tailwind + shadcn/ui         │
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │  Board   │ │  Agents  │ │Analytics │ │  Integrations      │  │
│  │  Tasks   │ │  Health  │ │Documents │ │  City View / List  │  │
│  │ Missions │ │  Squad   │ │ Settings │ │  Blueprint Wizard  │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘  │
│  ┌──────────────────┐ ┌───────────────────────────────────────┐  │
│  │  Memory Bank     │ │  SOUL Review / SOUL Distillation      │  │
│  │  (Agent Memories)│ │  (Version Control for Agent Identity) │  │
│  └──────────────────┘ └───────────────────────────────────────┘  │
│  ┌──────────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │  Autopilot       │ │  Morning     │ │  War Room            │ │
│  │  (Voice + AI     │ │  Brief       │ │  (Real-Time Agent    │ │
│  │   Mission Plan)  │ │  (CEO Digest)│ │   Coordination)      │ │
│  └──────────────────┘ └──────────────┘ └──────────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │
│  │ Billing  │ │ Onboard  │ │ Ops Hub  │ │ Webhooks           │ │
│  │ (Stripe) │ │ (Wizard) │ │ (Admin)  │ │ (Automation Rules) │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘ │
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
│  │  Memory Engine     │  Analytics  │  Cron Jobs (13)         │  │
│  │  - Episodic Memory │  - Metrics  │  - Token Refresh        │  │
│  │  - Distillation    │  - Usage    │  - Distillation Trigger │  │
│  │  - SOUL Versioning │  - Period   │  - Health Checks        │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Autopilot Engine  │  Voice System   │  Morning Brief      │  │
│  │  - Mission Decomp  │  - Sessions     │  - Daily Aggregation│  │
│  │  - DAG Validation  │  - Transcripts  │  - Narrative Gen    │  │
│  │  - Plan Refinement │  - Briefing     │  - History (14 days)│  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Billing (Stripe)  │  Reasoning Stream │  Brand Config     │  │
│  │  - Subscriptions   │  - Agent Thinking │  - White-label    │  │
│  │  - Usage Metering  │  - Tool Calls     │  - Custom Colors  │  │
│  │  - Plan Limits     │  - Decisions      │  - Logo Upload    │  │
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

1. **Human sets objective** → Creates mission + tasks in UI (or speaks goal via Autopilot)
2. **Autopilot decomposes** → AI breaks goal into multi-agent task plan with dependencies
3. **Task assigned to agent** → Convex triggers agent wakeup webhook
4. **Agent wakes up** → Sends heartbeat, receives rich context (tasks + tools + memories + handoff + notifications)
5. **Agent works** → Reads task, calls integration tools, creates deliverables, writes memories
6. **Reasoning streamed** → Each thinking step, tool call, and decision logged in real-time
7. **Agent completes** → Posts deliverables, marks task done, saves session handoff
8. **Chain reaction** → Dependent tasks unblock, downstream agents receive deliverables as context
9. **War Room updates** → Cross-agent handoffs, blockers, milestones visible in real-time
10. **Memory persists** → Episodic memories scored and stored; distillation runs on schedule
11. **SOUL evolves** → Distilled lessons proposed as SOUL file changes; human reviews/approves
12. **Morning Brief** → Daily digest aggregates all activity into CEO-readable summary
13. **Human reviews** → Analytics show progress, Memory Bank shows what agents learned

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
- **Role**: Quality assurance and compliance
- **Responsibilities**: Review agent outputs, reject subpar work, flag anomalies, audit decisions
- **Superpower**: Watches everything, never misses a failure, keeps quality high with automated review sweeps

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
- **War Room** shows all handoffs, blockers, and milestones in real-time
- **Reasoning stream** lets you watch each agent's thinking process live

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
- **Data**: Airtable, Google Sheets
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

### Sentinel Automated QA

Sentinel doesn't just wait for manual triggers — the system actively assigns work:
- **Sentinel review sweep** runs every 2 minutes
- Any task stuck in `in_review` for >1 minute auto-triggers Sentinel
- Sentinel reviews, approves or rejects with feedback
- Kaze only overrides if Sentinel rejects 3+ times

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

## 9. Mission Autopilot & Voice Interface

### Mission Autopilot

The Autopilot page lets users describe a mission goal in natural language, and AI decomposes it into a multi-agent execution plan.

**How it works:**
1. User types or speaks a goal (e.g., "Send 50 personalized cold outreach emails to YC founders")
2. AI (Claude Opus 4.6 via AWS Bedrock) analyzes the goal
3. Generates 3-8 tasks with:
   - Task titles and descriptions
   - Agent assignments (Kaze, Scout, Forge, Ghost)
   - Dependencies between tasks (validated DAG — no circular deps)
   - Priority levels
   - Required integrations
4. User reviews and edits the plan
5. One-click launch creates mission + all tasks + triggers agent wakeups

**Pre-built templates (6 scenarios):**
- Cold Outreach (50 personalized emails)
- Competitive Intelligence report
- YC Batch Analysis
- Brand Monitoring setup
- Research Report generation
- Cost Optimization audit

**Backend:** `missionAutopilot.ts` — `decomposeMission` action calls Claude to generate plan, `refinePlan` action applies user feedback. Validates task DAG for circular dependencies.

### Voice Interface

Integrated voice input system powered by Kaze as a voice assistant:

- **Voice Sessions**: Create, track, and transcribe voice interactions
- **Session Types**: `command` (direct commands) and `briefing` (information delivery)
- **Transcripts**: Per-turn recording with speaker attribution (user vs agent)
- **Voice Briefing**: Gathers real-time data (tasks, agent status, activity) for spoken delivery

**Backend:**
- `voiceSessions.ts` — CRUD for voice sessions + transcript storage
- `voiceBriefing.ts` — Aggregates system state for voice delivery

**Schema:**
- `voiceSessions` — userId, target, status, duration, turnCount, sessionType
- `voiceTranscripts` — sessionId, speaker, content, timestamp, isFinal

---

## 10. Morning Brief — CEO Daily Digest

An AI-generated daily summary delivered at 8:00 AM IST (2:30 UTC). Gives the CEO/user a complete picture of the last 24 hours without opening the dashboard.

### What's Included

| Section | Content |
|---------|---------|
| **Narrative Summary** | AI-written prose overview of the day's progress |
| **Key Metrics** | Tasks completed, created, stuck, in progress, in review |
| **Highlights** | Key wins — completed tasks with agent attribution |
| **Blockers** | Stuck tasks with suggested actions to unblock |
| **Agent Performance** | Per-agent breakdown: tasks handled, tasks completed, current status |
| **Upcoming Tasks** | Count of tasks queued for today |

### How It Works

1. Cron job triggers daily at 2:30 UTC
2. `morningBrief.generate` action aggregates 24-hour data:
   - All task status changes
   - Agent heartbeats and activity
   - Integration usage
   - Blockers and escalations
3. Stores structured brief in `morningBriefs` table
4. User views at `/brief` with:
   - Today's brief as the main view
   - 14-day history sidebar with clickable date buttons
   - Per-date drill-down for historical review

**Backend:** `morningBrief.ts` — queries (`getToday`, `getHistory`, `getByDate`), internal action (`generate`), internal mutation (`aggregateAndStore`)

---

## 11. War Room — Real-Time Agent Coordination

A real-time mission control hub that shows how agents are coordinating on a specific mission. Think of it as a "situation room" where you can watch agents work together.

### Features

| Feature | Description |
|---------|-------------|
| **Agent Lanes** | Horizontal swimlanes for each agent — shows their current task and task chips |
| **Unassigned Bin** | Tasks not yet claimed, visible for quick assignment |
| **Progress Bar** | Mission completion percentage based on task statuses |
| **Coordination Feed** | Live stream of agent-to-agent messages with type indicators |
| **Message Types** | Update, Handoff, Request, Blocker, Resolved, Milestone |
| **Task Detail** | Click any task chip to see full details + dependencies + reasoning stream |
| **Reasoning Stream** | Latest agent reasoning steps displayed in real-time |

### Message Types

```typescript
WarRoomMessage {
  missionId: Id<"missions">
  agentName: "kaze" | "scout" | "forge" | "ghost" | "sentinel"
  messageType: "update" | "handoff" | "request" | "blocker" | "resolved" | "milestone"
  content: string
  targetAgent?: agentName     // For handoffs and requests
  taskId?: Id<"tasks">
  timestamp: number
}
```

**Access:** `/missions/:missionId/warroom` — linked from Mission list page

---

## 12. Agent Reasoning & Observability

Real-time visibility into what agents are thinking, doing, and deciding. Every step of an agent's work is logged and viewable.

### Reasoning Step Types

| Step Type | Description | Example |
|-----------|-------------|---------|
| `thinking` | Agent's internal reasoning | "I need to check if the GitHub integration is connected before creating a repo" |
| `tool_call` | API or tool invocation | "Calling github.create_repository with name='my-app'" |
| `tool_result` | Response from tool | "Repository created successfully, URL: github.com/..." |
| `decision` | Explicit decision made | "Choosing to use Scout's market data from Task A instead of re-researching" |
| `handoff` | Passing work to another agent | "Handing off to Ghost for content creation with research summary attached" |
| `error` | Error encountered | "Rate limited by Jira API — will retry in 30s" |
| `checkpoint` | Progress marker | "Completed 3 of 5 outreach emails" |

### Backend

- `reasoning.ts` — mutations (`record`), queries (`getByTask`, `getLatest`, `getByAgent`)
- Automatic cleanup: cron deletes reasoning steps older than 30 days (runs daily at 4:00 UTC)
- Observational only — reasoning never affects task state

### Where It Appears

- **War Room**: Latest reasoning stream in coordination feed
- **Task Detail Panel**: Full reasoning timeline for the active task
- **Agent Health**: Recent reasoning steps per agent

---

## 13. Billing & Subscription Management

### Plan Tiers

| Feature | Starter | Pro (Growth) | Enterprise |
|---------|---------|-------------|------------|
| Users | 1 | 5 | Unlimited |
| Agents | 2 | 5 | 5+ |
| Integrations | 3 | 15 | Unlimited |
| Tasks/month | 100 | 1,000 | Unlimited |
| API calls/month | 500 | 10,000 | Unlimited |
| Features | Basic | Full + Priority Support | Full + Custom + SLA |

### Stripe Integration

- **Checkout Sessions**: `billingActions.createCheckoutSession` generates Stripe checkout URL
- **Customer Portal**: `billingActions.createPortalSession` for self-service subscription management
- **Webhook Handler**: `billingActions.handleWebhook` processes Stripe events (subscription created/updated/deleted)
- **Plan Mapping**: Plan names mapped to Stripe price IDs

### Usage Metering

- `billing.incrementUsage` tracks: tasks created, API calls, integration executions, agent sessions
- Monthly rotation via `usage-counter-rotation` cron (1st of each month at 00:05 UTC)
- Usage displayed on Billing page with progress bars vs. plan limits
- Admin-only upgrade capability

### Backend

- `billing.ts` — queries (`getSubscription`, `getPlanLimits`, `getCurrentUsage`), mutations (`incrementUsage`, `upsertSubscription`)
- `billingActions.ts` — actions (`createCheckoutSession`, `createPortalSession`, `handleWebhook`)
- Tables: `subscriptions`, `planLimits`, `usageCounters`

---

## 14. Security & Encryption

### Credential Storage
- **Algorithm**: AES-256-GCM (NIST-approved authenticated encryption)
- **IV**: 12 bytes (96 bits), randomly generated per encryption
- **Auth Tag**: 16 bytes (128 bits) — prevents tampering
- **Format**: Base64(IV + Ciphertext + AuthTag)
- **Master Key**: 32-byte hex string stored as Convex environment variable (`INTEGRATION_ENCRYPTION_KEY`)
- **Scope**: All OAuth tokens, API keys, refresh tokens, SSH private keys encrypted at rest

### OAuth Security
- **State Parameter**: HMAC-SHA256 signed with encrypted JSON payload (blueprintSlug, userId, timestamp)
- **CSRF Protection**: State verified on callback — prevents authorization code interception
- **Timestamp Validation**: OAuth state expires after 10 minutes
- **Client Secrets**: Stored as environment variables (`OAUTH_SECRET_<SLUG>`), never in database
- **Token Refresh**: Hourly cron job refreshes tokens expiring within 5 minutes
- **Popup Channel**: Dual-channel completion (postMessage + localStorage) handles providers with intermediate redirects

### API Key Security
- **Format**: `vk_live_` + 32 hex characters
- **Storage**: SHA-256 hashed — plaintext returned once at creation, never stored
- **Permissions**: Role-based (agent/admin) with granular permission matrix
- **Expiry**: Optional TTL per key
- **Revocation**: Immediate, tracked with timestamp

### Webhook Security
- **Signature Verification**: HMAC-SHA256, HMAC-SHA1, or JWT per endpoint
- **Secret Management**: Per-endpoint secrets stored securely
- **Event Validation**: Payload integrity verified before processing

### Infrastructure Security
- **SSH Proxy**: Railway-hosted, no direct Lightsail access from frontend
- **Clerk Auth**: All routes behind authentication, user-scoped data access
- **CORS**: Configured for known origins only
- **Agent Wakeup**: HMAC-signed requests from Convex to wakeup server
- **Audit Logging**: User actions logged with resource, details, timestamps

---

## 15. The Most Complex Problems We Solve

### 1. Multi-Agent Dependency Orchestration

**Problem**: A single business objective requires multiple agents working in sequence and parallel, with dependencies between their outputs.

**Our Solution**:
- Task dependency graph with automatic chain reactions
- When Task A completes, Tasks B and C (which depend on A) automatically unblock
- Deliverables from upstream tasks are injected as context into downstream tasks
- Kaze (Chief of Staff) monitors the entire chain and intervenes if something stalls
- Cron sweeps catch anything that falls through the cracks (assigned tasks every 2 min, reviews every 2 min, inbox every 30 min)
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
- Dead letter queue with automatic retry (3x exponential backoff)

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
- Sentinel agent automatically reviews all work (sweep every 2 minutes)
- Rejection/rework cycles with feedback injection (iterationCount, rejectionReason)
- Agents receive their rejection reason + previous output on the next wake — they know exactly what to fix
- maxIterations cap prevents infinite loops; escalates to human when limit is hit
- SOUL distillation means agents that produce bad work repeatedly will have that pattern distilled into a lesson
- Human endorsement of memories creates a quality signal loop

### 8. Natural Language Mission Planning

**Problem**: Breaking down a high-level business objective into agent-executable tasks with proper dependencies is cognitively expensive for humans.

**Our Solution**:
- Autopilot accepts natural language goals (typed or spoken)
- Claude decomposes into 3-8 tasks with agent assignments
- Validates dependency DAG (detects circular dependencies)
- User reviews/edits the plan before launch
- One-click creates mission + tasks + triggers agent wakeups
- Pre-built templates for common scenarios accelerate planning

---

## 16. How We're Building Autonomous AI

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
- Autopilot lets humans speak a goal and agents plan the execution
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
- War Room shows real-time coordination activity
- Comments and activity logs maintain shared context
- No human needs to manually transfer outputs between agents

**5. Persistent Memory**
- Agents remember api quirks, user preferences, patterns, and failures
- Session handoffs mean agents never lose context between sessions
- SOUL files evolve — agents literally get better at their jobs over time

**6. Quality Control Loops**
- Sentinel automatically reviews all in_review tasks (2-minute sweep)
- Rejection/rework cycles ensure outputs improve with feedback
- Review sweep cron catches stale tasks
- Metrics track quality over time

**7. Observable Reasoning**
- Every thinking step, tool call, and decision is logged
- Humans can watch agents' reasoning in real-time
- Error steps immediately visible for debugging
- 30-day retention with automatic cleanup

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
6. REASON: Each step logged as reasoning (thinking, tool_call, decision)
7. DELIVER: Post deliverables + comments to task
8. MEMORIZE: Write episodic memories about discoveries/failures
9. COMPLETE: Mark task done → triggers chain reactions
10. HANDOFF: Write session summary with open questions + next hints
11. IDLE: Wait for next task or shut down after session budget exhausted
```

### Why OpenClaw + Valence AI

**OpenClaw** provides the agent runtime — the ability to run Claude with tools, memory, and sessions on a server. Think of it as the "body" of the agent.

**Valence AI** provides the brain — task understanding, coordination, integration access, quality control, and persistent memory. Think of it as the "nervous system" connecting multiple bodies into a team that learns.

Together, they create agents that:
- Have persistent identity (SOUL files that evolve)
- Have growing knowledge (episodic memory across sessions)
- Have configurable capabilities (skills, model, session limits)
- Have access to the real world (integration engine, 30+ blueprints)
- Work as a team (task dependencies, delegation, dependency injection)
- Are observable (reasoning stream, analytics, activity logs, memory bank)
- Get better over time (memory distillation, SOUL file versioning)

---

## 17. Tech Stack & Infrastructure

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite 5 | Build tool + dev server (port 8080) |
| TypeScript | Type safety |
| Tailwind CSS 3 | Utility-first styling |
| shadcn/ui (50+ components) | Component library |
| React Router 6 | Client-side routing (30+ routes) |
| Framer Motion | Animations |
| Recharts | Analytics charts |
| Clerk React | Authentication |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|-----------|---------|
| Convex | Serverless backend + real-time database |
| Convex HTTP Actions | REST API endpoints (100+) |
| Convex Crons | Scheduled jobs (13 active) |
| AES-256-GCM | Credential encryption |
| HMAC-SHA256 | OAuth state signing, webhook verification, agent wakeup signing |
| Stripe API | Billing & subscription management |
| Resend API | Transactional emails (pilot interest notifications) |
| AWS Bedrock | Mission Autopilot (Claude Opus 4.6 for plan generation) |

### Infrastructure
| Component | Platform |
|-----------|----------|
| Frontend + Backend | Convex (serverless, dev: beloved-squirrel-599) |
| SSH Proxy | Railway (Node.js, ssh-proxy-service-production.up.railway.app) |
| Agent Runtime | AWS Lightsail (self-hosted OpenClaw) |
| Authentication | Clerk |
| Billing | Stripe |
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
| `STRIPE_SECRET_KEY` | Stripe API key for billing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification |
| `RESEND_API_KEY` | Transactional email sending |

---

## 18. Database Schema (43 Tables)

### Core Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `agents` | Agent status tracking | name, status, currentTask, tasksCompleted, lastHeartbeat, serverMetrics (CPU/mem/disk) |
| `tasks` | Work items | title, status, priority, assignee, missionId, dependsOn, deliverables, iterationCount, maxIterations, rejectionReason, requiredIntegrations |
| `missions` | Task groups | title, description, status, taskCount, completedTaskCount, createdBy |
| `comments` | Task discussions | taskId, author, content, mentions |
| `activity` | System event log | action, agentName, details, taskId, timestamp |
| `messages` | Agent-to-human messaging | from, to, content, isSquadMessage |
| `notifications` | Agent @mentions | recipientAgent, type, taskId, fromAuthor, contentPreview, read |
| `users` | Clerk user profiles | clerkId, email, name, avatarUrl, role (admin/member/viewer) |

### Integration Engine Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `blueprints` | Integration definitions | slug, name, baseUrl, authType, authConfig (JSON), apiProtocol, status, sourceType, category |
| `blueprintTools` | API actions per blueprint | blueprintId, name, method, path, pathParams, queryParams, bodySchema, responseMapping, paginationConfig, aiUsageHint |
| `connections` | User auth credentials | userId, blueprintId, credentialsEncrypted, status, expiresAt, consecutiveFailures |
| `oauthStates` | Short-lived CSRF tokens | token, blueprintSlug, userId, codeVerifier, expiresAt |
| `scraperJobs` | Doc scraping tracking | url, status, blueprintId, toolCount, error |
| `integrationActivity` | Execution logs | userId, agentName, taskId, integrationType, toolName, status, errorMessage |

### Memory & Learning Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `agentMemory` | Episodic memories | agentName, memoryType, title, body, evidence, tags, importanceScore, confirmations, contradictions, humanEndorsed, status |
| `sessionHandoffs` | End-of-session summaries | agentName, sessionSummary, tasksCompleted, newMemoriesCreated, openQuestions, nextSessionHint |
| `soulFileVersions` | SOUL file version control | agentName, content, version, changeLog, memoriesDistilled, status (pending_review/approved/rejected) |
| `memoryDistillationJobs` | Distillation tracking | agentName, status, memoriesAnalyzed, sourceMemoryIds, soulVersionId, triggeredBy |
| `soulFiles` | Active SOUL files | agentName, content, updatedAt, syncedToServer |

### Webhook & Automation Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `webhookEndpoints` | Webhook receivers | userId, urlPath, signatureMethod, eventTypes, status, stats (received/processed/failed) |
| `webhookEvents` | Received events | endpointId, payload, verified, status, taskId, retryCount, nextRetryAt, deadLetter |
| `automationRules` | Event-to-action mapping | eventType, conditions (JSONPath), actionType, actionConfig, taskTemplate, executionCount |

### Analytics & Metrics Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `taskMetrics` | Task timing | taskId, timeToAssign, timeToStart, timeToComplete, source (manual/webhook/agent/integration) |
| `agentMetrics` | Agent performance | agentName, period, tasksCompleted, completionRate, avgTimeToComplete, integrationCallCount, totalCost |
| `systemMetrics` | System health | periodType, totalTasksCreated, totalTasksCompleted, totalIntegrationCalls, totalWebhooksReceived |
| `usage` | Cost tracking | agentName, totalCost, totalInputTokens, totalOutputTokens, modelBreakdowns |

### Agent Config & Observability Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `agentConfigs` | Agent settings | agentName, model, skills, sessionMaxTurns, sessionTimeout, displayName |
| `agentReasoningSteps` | Live reasoning stream | taskId, agentName, stepType (thinking/tool_call/decision/error), content, metadata |
| `sshConfig` | SSH credentials | host, port, username, encryptedPrivateKey |
| `auditLog` | User action audit trail | userId, action, resource, resourceId, details |

### Voice & Autopilot Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `voiceSessions` | Voice session tracking | userId, target, status, durationMs, turnCount, sessionType (command/briefing) |
| `voiceTranscripts` | Voice transcript history | sessionId, speaker, content, timestamp, isFinal |
| `autopilotSessions` | Mission autopilot plans | userId, goal, context, plan (JSON), status, missionId |
| `morningBriefs` | CEO daily digest | date, tasksCompleted, tasksCreated, highlights, blockers, agentPerformance, narrative |
| `warRoomMessages` | Cross-agent coordination | missionId, agentName, messageType, content, targetAgent, taskId |

### Billing & Subscription Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `subscriptions` | Stripe subscription state | stripeCustomerId, stripeSubscriptionId, plan, status, currentPeriodStart/End, cancelAtPeriodEnd |
| `planLimits` | Plan feature limits | plan, maxUsers, maxAgents, maxIntegrations, maxTasksPerMonth, maxApiCallsPerMonth, features |
| `usageCounters` | Monthly usage tracking | periodStart, periodEnd, tasksCreated, apiCallsMade, integrationExecutions, agentSessions |

### Brand, Onboarding & Pilot Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `brandConfig` | White-label branding | companyName, logoUrl, primaryColor, accentColor |
| `onboardingState` | User onboarding progress | userId, currentStep, completed, companyName, integrationsConnected, agentsConfigured |
| `pilotInterest` | Pilot program signups | name, email, company, role, useCase, emailSent |
| `figmaPluginCommands` | Figma plugin queue | createdBy, fileKey, label, spec (JSON), status, resultNodeIds |

---

## 19. API Surface

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

## 20. Frontend Pages & Components (30+ Routes)

### Authenticated Pages (22 routes)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Activity Feed | Dashboard with agent status cards, task stats, recent activity, getting started checklist |
| `/board` | Mission Board | 5-column Kanban + Plan View (dependency DAG) + Squad Ops view, with mission filtering |
| `/missions` | Missions | Active/Completed/Archived missions with War Room access and Mission Reports |
| `/missions/:id` | Mission Report | Post-mortem view — deliverables, agent contributions, integration usage, timeline |
| `/missions/:id/warroom` | War Room | Real-time agent coordination — lanes, handoffs, blockers, milestones |
| `/agents` | Agents | Agent config panels, metrics, cost, SOUL file editing, server sync |
| `/health` | Agent Health | Deep monitoring — CPU, memory, disk, uptime, integration status, recent API calls per agent |
| `/squad` | Squad View | Agent squad visualization with roles, status, current tasks |
| `/command` | Command Center | Direct chat with agents, color-coded messages |
| `/autopilot` | Mission Autopilot | Natural language → AI plan decomposition, voice input, 6 pre-built templates |
| `/brief` | Morning Brief | Daily CEO digest — narrative, metrics, highlights, blockers, 14-day history |
| `/integrations` | Integrations | City View (spatial) + List View, 30+ blueprints + 100+ templates |
| `/integrations/blueprint/new` | Blueprint Wizard | 3-step: paste URL → AI scrape / manual form → review → save |
| `/integrations/blueprint/:id` | Blueprint Detail | Tools list, execution history, connection settings |
| `/webhooks` | Webhooks | Endpoint management + event history + automation rules + dead letter queue |
| `/analytics` | Analytics | Charts: trends, performance, completion times, radar, source tracking (7/30/90 day) |
| `/memory` | Memory Bank | Browse, search, filter agent memories; endorse/flag |
| `/memory/:id` | Memory Detail | Single memory with evidence, related agents, vote UI |
| `/soul-review` | SOUL Review | Pending SOUL file versions — diff view, approve/reject |
| `/settings` | Settings | Tabs: Account, SSH Server, API Keys, Brand, Advanced |
| `/billing` | Billing | Current plan, usage meters, plan comparison, Stripe checkout/portal |
| `/ops` | Operations Hub | Admin provisioning guide, env var reference, customer management, Docker setup |
| `/docs` | Docs / Help | FAQ: agents, integrations, webhooks, task lifecycle, keyboard shortcuts |
| `/admin` | Admin Dashboard | System overview, task breakdown, server health, data export (admin-only) |
| `/onboarding` | Onboarding | 5-step wizard: company name → integrations → agents → team → launch |

### Public Pages (5 routes)

| Route | Page | Description |
|-------|------|-------------|
| `/landing` | Landing Page | Marketing page with animated demos, integration grid, comparison table, pilot signup |
| `/use-cases/:slug` | Use Case Detail | Deep-dive into specific workflow scenarios with agent breakdown |
| `/login` | Login | Clerk auth with gradient UI |
| `/privacy` | Privacy Policy | Legal page |
| `/terms` | Terms of Service | Legal page |

### Key Components

**Core UI:**
- **AppSidebar** — Collapsible navigation (15+ items)
- **TaskCard / TaskDetailPanel** — Task CRUD with comments, deliverables, dependencies, rejection feedback, reasoning stream
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
- **SquadView** — Animated terrarium with agents as interactive SVG characters
- **SquadMemberCard** — Agent card with role, status, current task, memory snapshot
- **SquadActivityFeed** — Real-time team activity across all agents

**Voice & Autopilot:**
- **VoiceOverlay** — Voice input interface for Autopilot
- **AutopilotPlanView** — Review/edit AI-generated task plans before launch

**shadcn/ui Primitives (50+):** Button, Card, Dialog, Select, Tabs, Table, Tooltip, Sidebar, Collapsible, Accordion, Badge, Progress, Checkbox, Radio, Switch, Separator, Skeleton, Alert, etc.

### Design System
- **Theme**: Dark mode default (deep blue-gray background)
- **Agent Colors**: Kaze (blue), Scout (green), Forge (orange), Ghost (purple), Sentinel (red)
- **Fonts**: Inter (UI) + JetBrains Mono (code)
- **Patterns**: Card-based layouts, right-side detail panels, modal dialogs, activity feeds
- **Animations**: Slide-in panels, pulse effects on live indicators, smooth transitions, City View walker animations, Framer Motion scroll reveals

---

## 21. Current Integrations

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

## 22. What Makes Us Different

### vs. ChatGPT / Claude (Single Agent Chat)
| Them | Us |
|------|-----|
| One agent, one conversation | Five specialized agents working as a team |
| No persistent task tracking | Full task lifecycle with Kanban board |
| No real API access | Universal integration engine (any API, 30+ blueprints) |
| No coordination | Task dependencies, delegation, dependency injection |
| Stateless conversations | Persistent missions, deliverables, history, memory |
| Never improves | Agents learn via episodic memory + SOUL file distillation |
| No observability | Real-time reasoning stream, analytics, memory bank |

### vs. Zapier / Make / Workato (Workflow Automation)
| Them | Us |
|------|-----|
| Pre-built connectors only | Any API via doc scraper + OpenAPI import |
| If-this-then-that logic | AI agents that understand context and make decisions |
| No intelligence in the workflow | Claude Opus 4.5 reasoning at every step |
| $50-500/month for basic plans | Self-hosted, $0 platform cost |
| Human builds every workflow | AI generates integrations from docs |
| Workflows don't learn | Agents improve from experience |
| No voice interface | Speak a goal → agents execute |

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
| No voice/autopilot | Natural language mission planning with voice input |
| No daily digest | Morning Brief — CEO gets daily AI-generated summary |

---

## 23. Cron Jobs & Scheduled Tasks (13 Jobs)

| Job | Schedule | Handler | Purpose |
|-----|----------|---------|---------|
| `refresh-expiring-tokens` | Every hour at :00 | tokenRefresh.refreshExpiringTokens | Proactive OAuth token refresh for tokens expiring within 5 min |
| `assigned-task-sweep` | Every 2 minutes | agentWakeupSweep.sweep | Re-wake agents for stuck tasks (>5m assigned, >15m in_progress) |
| `sentinel-review-sweep` | Every 2 minutes | tasks.sentinelReviewSweep | Wake Sentinel for tasks stuck in_review >1 minute |
| `stale-agent-reset` | Every 5 minutes | agents.resetStaleAgents | Mark agents offline after 10+ min heartbeat gap |
| `webhook-retry-failed` | Every 5 minutes | webhookReceiver.retryFailed | Retry failed webhooks (3x max, exponential backoff) |
| `server-health-check` | Every 10 minutes | serverHealth.checkAndLogAlerts | Monitor CPU/RAM/disk, log alerts to activity table |
| `inbox-triage-sweep` | Every 30 minutes | tasks.inboxTriageSweep | Prevent inbox overflow — auto-delegate stale inbox tasks |
| `kaze-review-sweep` | Every 2 hours | tasks.reviewSweep | Catch tasks stuck in "in_review" for too long |
| `morning-brief` | Daily at 2:30 UTC (~8 AM IST) | morningBrief.generate | Generate CEO daily digest from 24h data |
| `memory-archive-stale` | Daily at 3:00 UTC | agentMemory.archiveStale | Archive old, unused agent memories |
| `reasoning-cleanup` | Daily at 4:00 UTC | reasoning.cleanupOld | Prune reasoning steps older than 30 days |
| `soul-distillation-weekly` | Sunday at 2:00 UTC | soulDistillation.distillAllAgents | AI-powered SOUL file evolution from accumulated memories |
| `usage-counter-rotation` | Monthly, 1st at 00:05 UTC | billing.rotateUsageCounters | Billing period usage counter reset |

---

## 24. Future Vision & Roadmap

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
- *(Foundation complete: Autopilot mission decomposition is live)*

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

**Valence AI becomes the operating system for enterprise AI workforces.**

Every company has a "mission control" where:
- Business objectives are defined by humans
- AI agent squads execute autonomously
- Any tool, any API, any workflow is accessible
- Agents remember, learn, and improve continuously
- Performance is measured and optimized continuously
- Humans focus on strategy; agents handle execution

We're not building a chatbot. We're not building a workflow tool. We're building the **command center for the future of work** — where human intent is translated into autonomous execution across every tool in the enterprise stack, and the agents get smarter with every task they complete.

Valence AI — connected to ~100 popular tools, powered by autonomous agents that learn.

---

## 25. Key File Reference

### Backend (convex/)
| File | Purpose |
|------|---------|
| `schema.ts` | Database schema (43 tables) |
| `http.ts` | HTTP API endpoints (100+) |
| `tasks.ts` | Task management + dependency logic + review sweeps |
| `taskDeps.ts` | Dependency graph: areDependenciesMet, getReadyTasks |
| `missions.ts` | Mission CRUD + getReport (comprehensive post-mortem data) |
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
| `webhookReceiver.ts` | Generic webhook receiver + retry logic |
| `webhookReceiverActions.ts` | Signature verification + automation rule execution |
| `automationRules.ts` | Automation engine (JSONPath conditions, action templates) |
| `analytics.ts` | Dashboard metrics computation |
| `reasoning.ts` | Agent reasoning step recording + queries + cleanup |
| `missionAutopilot.ts` | AI mission decomposition (Claude via AWS Bedrock) |
| `voiceSessions.ts` | Voice session CRUD + transcripts |
| `voiceBriefing.ts` | Aggregates system state for voice delivery |
| `morningBrief.ts` | Daily CEO digest generation + queries |
| `billing.ts` | Subscription queries, plan limits, usage tracking |
| `billingActions.ts` | Stripe checkout, portal, webhook handling |
| `apiKeys.ts` | API key generation, validation (SHA-256 hashed), revocation |
| `brandConfig.ts` | White-label branding (company name, logo, colors) |
| `onboarding.ts` | Onboarding flow state management |
| `pilotInterest.ts` | Landing page signup capture + email notification |
| `serverHealth.ts` | Server health check + alerting |
| `agentWakeup.ts` | Agent startup trigger (HMAC-signed) |
| `agentWakeupSweep.ts` | Stuck task detection + auto-wakeup |
| `crons.ts` | Scheduled jobs (13 active) |
| `figmaPlugin.ts` | Figma plugin command queue |
| `users.ts` | Clerk user sync + role management |
| `adminDashboard.ts` | Admin system overview + activity + task overview |
| `dataExport.ts` | Full system JSON export (sensitive fields redacted) |
| `lib/crypto.ts` | AES-256-GCM encryption/decryption |
| `lib/requestBuilder.ts` | HTTP request construction (auth, path params, bodies) |
| `lib/openApiParser.ts` | OpenAPI spec parsing |
| `lib/agentToolRecommendations.ts` | Role-based tool filtering |
| `seed*.ts` (30+ files) | Pre-seeded blueprints for all major integrations |

### Frontend (src/)
| File | Purpose |
|------|---------|
| `App.tsx` | Root router (30+ routes) |
| `pages/Board.tsx` | Kanban task board + Plan View + Squad Ops |
| `pages/Missions.tsx` | Mission list + War Room + Reports access |
| `pages/MissionReport.tsx` | Mission post-mortem — deliverables, agent contributions, timeline |
| `pages/WarRoom.tsx` | Real-time mission coordination hub |
| `pages/Agents.tsx` | Agent monitoring + config |
| `pages/AgentHealth.tsx` | Deep agent monitoring — CPU, memory, disk, integrations, API calls |
| `pages/Squad.tsx` | Squad overview |
| `pages/Autopilot.tsx` | Natural language mission decomposition + voice input |
| `pages/MorningBrief.tsx` | Daily CEO digest with 14-day history |
| `pages/Integrations.tsx` | Integration hub (City View + List View) |
| `pages/BlueprintWizard.tsx` | AI-powered integration builder (3-step wizard) |
| `pages/BlueprintDetail.tsx` | Blueprint editor + testing + execution history |
| `pages/MemoryBank.tsx` | Agent memory browser |
| `pages/AgentMemoryDetail.tsx` | Single memory detail + voting |
| `pages/SoulReview.tsx` | SOUL file version review (approve/reject) |
| `pages/Webhooks.tsx` | Webhook management + automation rules |
| `pages/Analytics.tsx` | Performance dashboard |
| `pages/Command.tsx` | Agent chat |
| `pages/Billing.tsx` | Subscription management + usage meters + Stripe |
| `pages/OperationsHub.tsx` | Admin provisioning guide |
| `pages/Onboarding.tsx` | 5-step setup wizard |
| `pages/Docs.tsx` | In-app help center / FAQ |
| `pages/Admin.tsx` | Admin dashboard + data export |
| `pages/Settings.tsx` | Account, SSH, API Keys, Brand, Advanced |
| `pages/Landing.tsx` | Public marketing page |
| `pages/UseCase.tsx` | Use case detail pages |
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
| `server-files/SOUL.md` | Kaze agent identity (workspace root copy) |
| `server-files/agents/kaze/SOUL.md` | Kaze agent identity |
| `server-files/agents/scout/SOUL.md` | Scout agent identity |
| `server-files/agents/forge/SOUL.md` | Forge agent identity |
| `server-files/agents/ghost/SOUL.md` | Ghost agent identity |
| `server-files/agents/sentinel/SOUL.md` | Sentinel agent identity |
| `server-files/AGENTS.md` | Agent operating manual for all squad members |
| `server-files/TOOLS.md` | Local setup notes (email, contacts, messaging rules) |
| `server-files/MEMORY.md` | Long-term memory for Kaze |

---

## 26. Pilot Deployment Guide

### Deployment Models

Valence AI supports two deployment models for pilot customers:

**Model A: Cloud (Fully Managed)**
We host the entire stack — Convex project, Vercel app, Lightsail agent server — per customer. Customer just logs in and uses the dashboard.

| Component | Service | Cost/mo |
|-----------|---------|---------|
| Database + Backend | Convex (separate project per customer) | $0-25 |
| Frontend | Vercel (separate app per customer) | $0-20 |
| Agent Server | AWS Lightsail (Ubuntu 22.04, small_2_0) | $12 |
| Auth | Clerk (shared) | $0 |
| LLM | Anthropic API (per-customer key) | $10-100+ |
| SSH Proxy | Railway (shared across all customers) | $5 total |

**Model B: On-Prem Hybrid (Customer Hosts Agents)**
We host dashboard + backend, customer hosts the agent server on their own infrastructure. Agents run inside customer's network, accessing internal tools/APIs/code. Best for security-sensitive enterprises.

- Customer provides: server (2 vCPU, 2GB RAM, Ubuntu 22.04+), Anthropic API key, SSH access
- We provide: install script, Convex project, Vercel app
- Network requirement: outbound HTTPS to `*.convex.cloud` + `api.anthropic.com`

### Provisioning Scripts

Located in `deployment-scripts/`:

| Script | Purpose |
|--------|---------|
| `provision-customer.sh <slug> <domain> <email>` | Creates Convex project + Vercel app + seeds database |
| `provision-server.sh <slug>` | Launches Lightsail instance with OpenClaw |
| `install-agent-server.sh` | Standalone agent server setup for on-prem customers |
| `verify-customer.sh <slug>` | Post-provision health checks |
| `update-all.sh --functions-only / --soul-sync / --env` | Batch update all customers |
| `teardown-customer.sh <slug>` | Clean removal of customer stack |
| `customers.json` | Registry of all provisioned customers |

### Required Environment Variables Per Customer

**Convex deployment (set via `npx convex env set`):**
- `INTEGRATION_ENCRYPTION_KEY` — unique 32-byte hex per customer (generate: `openssl rand -hex 32`)
- `CLERK_JWT_ISSUER_DOMAIN` — Clerk domain for this customer's auth
- `ALLOWED_ORIGIN` — customer's Vercel URL (e.g., `https://acme.valence.ai`)
- `SSH_PROXY_URL` — Railway service URL for SSH proxy
- `SSH_PROXY_SECRET` — shared secret between Convex and SSH proxy
- `AGENT_WAKEUP_WEBHOOK_URL` — agent wakeup endpoint
- `ANTHROPIC_API_KEY` — for doc scraper Claude calls
- `STRIPE_SECRET_KEY` — Stripe API key for billing
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signature verification

**Railway SSH proxy (shared):**
- `SSH_PROXY_SECRET` — must match Convex env var

### Per-Customer Onboarding Checklist

1. Customer signs up via Clerk → lands on onboarding wizard
2. Complete 5 onboarding steps (company name, integrations, meet squad, invite team, launch)
3. Configure SSH in Settings (cloud: auto-provisioned, on-prem: customer enters their server IP)
4. Create first mission + task → verify agent wakes up and claims it
5. Connect at least one integration (GitHub OAuth recommended for demo)
6. Show analytics page — real-time task metrics and agent performance

### Security Architecture for Pilots

- **SSH proxy requires Bearer token auth** — `SSH_PROXY_SECRET` env var on both Railway and Convex
- **SSH private keys encrypted at rest** — AES-256-GCM using `INTEGRATION_ENCRYPTION_KEY`
- **All frontend SSH calls route through Convex** — private key never reaches the browser
- **API keys enforce permissions** — `hasPermission()` check in HTTP middleware
- **OAuth tokens encrypted** — same AES-256-GCM as SSH keys
- **Rate limiting** — per-user, per-endpoint sliding window (SSH ops: 5/min, general: 300/min)

### Known Limitations for Pilots

- **Agent sessions crash after ~84 tool calls** — mitigated by SOUL.md "hard stop at turn 15" rule
- **Anthropic rate limits can corrupt sessions** — agents affected: Forge (large builds), Scout (research loops)
- **Session recovery** — if agent crashes, delete corrupt session file and re-wake (see crash playbook below)
- **No multi-tenant** — each customer is a separate deployment. Cannot share data between customers.
- **Billing not enforced** — plan limits exist but are not enforced during pilot phase

### Agent Crash Recovery Playbook

1. **Symptom:** "Session recovery" spam on a task
   - **Cause:** Agent session file corrupted (context overflow + rate limit crash)
   - **Fix:** SSH into server → `ls -lt /home/ubuntu/.openclaw/agents/{agent}/sessions/` → delete largest/newest `.jsonl` + its `.lock` → re-wake agent

2. **Symptom:** Agent starts but log stays 0 bytes for >2 min
   - **Cause:** Agent initializing or queued behind another
   - **Fix:** Wait 2 more minutes, check `ps aux | grep openclaw-agent`

3. **Symptom:** Agent completes task but deliverable not showing
   - **Cause:** Task update API call may have timed out
   - **Fix:** Check activity log, manually update task status if needed

---

## 27. Webhook Retry & Dead Letter Queue

Failed webhook events are automatically retried up to 3 times with exponential backoff (30s, 2min, 8min).

**How it works:**
- When a webhook event processing fails, `retryCount` and `nextRetryAt` are set
- A cron job (`webhook-retry-failed`) runs every 5 minutes, picks up events where `nextRetryAt <= now`
- Events are reset to "received" status and re-dispatched to the receive action
- After 3 failed retries, the event is marked `deadLetter: true` and stops retrying

**Viewing dead letters:**
- Webhooks page → "Dead Letters" tab shows all exhausted events
- `webhookReceiver.listDeadLetters` query returns dead letter events

**Schema fields added to `webhookEvents`:**
- `retryCount` — number of retries attempted
- `nextRetryAt` — epoch ms when next retry is due
- `deadLetter` — true when all retries exhausted

---

## 28. Graceful Degradation Without SSH

The dashboard works fully even without SSH configured:

| Feature | Without SSH | With SSH |
|---------|-------------|----------|
| Agent list & status | Works (via heartbeat) | Works |
| Task management | Works | Works |
| Agent config editing | Works (saved to Convex) | Works |
| SOUL file editing | Works (in-browser) | Works + pull/sync to server |
| Server sync | Disabled (button grayed) | Works |
| Skills tab | Shows "SSH not configured" | Works |
| Agent restart | Disabled (button grayed) | Works |

**Implementation:**
- `Agents.tsx` — Sync button disabled + yellow banner when SSH not configured
- `AgentConfigPanel.tsx` — Restart/Pull/Sync buttons disabled with tooltip
- `Settings.tsx` Skills tab — Shows empty state directing user to Server tab
- All error messages updated to reference "Settings → Server" instead of "port 3001"

---

## 29. Operator Documentation

| Document | Path | Purpose |
|----------|------|---------|
| RUNBOOK.md | `deployment-scripts/RUNBOOK.md` | Full provisioning + operations guide for operators |
| ON-PREM-GUIDE.md | `deployment-scripts/ON-PREM-GUIDE.md` | Customer-facing self-hosted agent server setup |
| smoke-test.sh | `deployment-scripts/smoke-test.sh` | Post-provision health check (frontend, Convex, SSH proxy, agent server) |
| verify-customer.sh | `deployment-scripts/verify-customer.sh` | Quick customer health check |

---

## 30. Admin Dashboard & Data Export

**Admin Dashboard** (`src/pages/Admin.tsx`) — internal-only page for operators (admin role required).

**Features:**
- System overview: agents online, active tasks, team members, integrations, dead letters
- Usage stats: API calls, agent sessions per billing period
- Agent status list with heartbeat timestamps
- Task breakdown by status with progress bars
- Recent activity feed (last 50)
- Recent tasks list (last 100)
- Server health panel with CPU/RAM/disk gauges per agent
- "Export All Data" button — downloads full system state as JSON

**Data Export** (`convex/dataExport.ts`) — action that gathers all tables and returns structured JSON. Sensitive fields (OAuth secrets, webhook secrets, Clerk IDs) are automatically redacted.

**Backend:** `convex/adminDashboard.ts` (queries: `getSystemOverview`, `getRecentActivity`, `getTasksOverview`)

**Access:** Admin-only sidebar link (Shield icon, below Settings). Non-admin users see "Admin Access Required" message.

---

## 31. Server Health Monitoring

**Problem:** No visibility into agent server resource usage — servers can silently run out of memory or disk.

**Solution:** Enhanced heartbeat with server metrics + alerting cron.

**How it works:**
1. Agent heartbeat (`POST /api/heartbeat`) now accepts optional `serverMetrics` field:
   - `cpuPercent`, `memoryUsedMb`, `memoryTotalMb`, `diskUsedGb`, `diskTotalGb`, `uptimeSeconds`, `loadAvg1m`
2. Metrics stored on the `agents` table (optional `serverMetrics` object)
3. `server-health-check` cron runs every 10 minutes:
   - CPU > 85% → alert
   - Memory > 90% → alert
   - Disk > 90% → alert
   - No heartbeat for 5+ minutes → alert
   - Alerts logged to `activity` table as `health_alert` actions
4. Admin dashboard shows real-time health gauges (green/yellow/red) per agent
5. Agent Health page (`/health`) shows deep per-agent monitoring with integration status

**Files:**
- `convex/serverHealth.ts` — `getServerHealth` query + `checkAndLogAlerts` cron handler
- `convex/heartbeat.ts` — accepts `serverMetrics` in `beat` mutation
- `convex/schema.ts` — `serverMetrics` optional field on `agents` table

---

## 32. Lightsail Auto-Snapshots

**Script:** `deployment-scripts/lightsail-snapshots.sh`

Creates nightly snapshots of all active customer Lightsail instances and cleans up snapshots older than 7 days.

**Usage:**
```bash
./lightsail-snapshots.sh             # Run manually
./lightsail-snapshots.sh --dry-run   # Preview only
```

**Cron (recommended):**
```
0 3 * * * /path/to/lightsail-snapshots.sh >> /var/log/lightsail-snapshots.log 2>&1
```

**Naming convention:** `valence-{slug}-YYYYMMDD`

**Dependencies:** `aws` CLI, `jq`, `customers.json` in same directory.

---

## 33. Docker Image for Agents

**File:** `deployment-scripts/Dockerfile.agents`

Self-contained Docker image for on-prem agent server deployment. Customers who want containerized agents can build and run this image instead of running the install script.

**Build:**
```bash
docker build -f Dockerfile.agents -t mission-control-agents .
```

**Run:**
```bash
docker run -d \
  -e MISSION_CONTROL_API_KEY=vk_live_xxx \
  -e MISSION_CONTROL_URL=https://your-project.convex.cloud \
  -e ANTHROPIC_API_KEY=sk-ant-xxx \
  --name mc-agents \
  mission-control-agents
```

**Image contents:**
- Node.js 20 slim base
- Non-root `agent` user
- Full OpenClaw directory structure (kaze, scout, forge, ghost, sentinel)
- Default SOUL files
- Health check via `pgrep -f "openclaw"`
- Entrypoint writes env vars to `.env` and starts `npx openclaw gateway start`

---

## 34. Onboarding & Landing

### Onboarding Wizard

5-step guided setup for new workspaces at `/onboarding`:

| Step | Title | What Happens |
|------|-------|-------------|
| 1 | Company Name | User enters their company/workspace name |
| 2 | Integrations | Select from top 6 integrations to connect (GitHub, Slack, Jira, etc.) |
| 3 | Meet the Squad | View all 5 agents with roles and descriptions |
| 4 | Invite Team | Enter email addresses for team member invitations |
| 5 | Launch | Review setup and redirect to dashboard |

**Backend:** `onboarding.ts` — queries (`getForUser`, `getCurrent`), mutations (`initialize`, `updateStep`, `complete`)

### Landing Page

Public marketing homepage at `/landing` with:

- **Hero Section**: Animated mission execution timeline showing agents decomposing, researching, building, QA-ing, and launching across 13+ integrations
- **Capabilities**: Feature cards for agent orchestration, integrations, memory, quality loops
- **Integration Grid**: Visual display of 50+ connected services
- **Use Case Scenarios**: Pre-built workflow examples (cold outreach, competitive intel, etc.)
- **Comparison Table**: Side-by-side vs ChatGPT, Zapier, Paragon, AutoGPT
- **Pilot Signup**: Modal to capture interest (name, email, company, role, use case)
- **Framer Motion**: Scroll-reveal animations, typing effects, animated transitions

### Pilot Interest Capture

When users sign up from the landing page:
1. Form data saved to `pilotInterest` table
2. Notification email sent to Arpit via Resend API
3. `emailSent` flag tracked per signup

---

*Last updated: 2026-03-06*
*This document is the single source of truth for the Valence AI project (internal codename: Mission Control).*
