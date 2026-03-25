<div align="center">

# Valence AI

**Open-source autonomous AI workforce platform**

Deploy a squad of specialized AI agents that research, build, write, review each other's work, and ship — while you sleep.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Convex](https://img.shields.io/badge/Backend-Convex-orange)](https://convex.dev)
[![Auth by Clerk](https://img.shields.io/badge/Auth-Clerk-purple)](https://clerk.com)

</div>

---

## What is Valence AI?

Valence AI is a self-hosted command center for orchestrating autonomous AI agents. You give one instruction — agents decompose it into tasks, coordinate across integrations, review each other's work, and deliver results.

It's not a chatbot wrapper. It's a full operating system for AI workers: task management, persistent memory, 100+ real API integrations, quality review gates, webhook automation, and real-time observability — all from a single dashboard.

> **Agents run on your server.** Valence AI is the brain. [OpenClaw](https://openclaw.dev) agents on your Linux VPS are the hands. They communicate via webhooks.

---

## System Architecture

<details>
<summary><b>Platform Architecture Diagram</b> (click to expand)</summary>

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              VALENCE AI PLATFORM                                    │
│                                                                                     │
│  ┌──────────────────────────┐       ┌──────────────────────────────────────────┐    │
│  │     FRONTEND (React)     │       │         BACKEND (Convex)                 │    │
│  │                          │  WS   │                                          │    │
│  │  Dashboard / Board / War │◄─────►│  Real-time DB    Serverless Functions    │    │
│  │  Room / Analytics / File │       │  ┌────────┐     ┌──────────────────┐     │    │
│  │  Manager / Niche Apps    │       │  │ tasks  │     │ agentWakeup.ts   │     │    │
│  │                          │       │  │missions│     │ executionEngine.ts│     │    │
│  │  ┌────────────────────┐  │       │  │agents  │     │ webhookReceiver.ts│    │    │
│  │  │ Integration Engine │  │       │  │memory  │     │ monitorPolling.ts│     │    │
│  │  │ OAuth + API Keys   │  │       │  │activity│     │ soulDistillation │     │    │
│  │  │ AES-256-GCM Vault  │  │       │  │connects│     │ missionAutopilot │     │    │
│  │  └────────────────────┘  │       │  └────────┘     └──────────────────┘     │    │
│  └──────────────────────────┘       └──────────┬───────────────────────────────┘    │
│                                                 │                                   │
└─────────────────────────────────────────────────┼───────────────────────────────────┘
                                                  │
                              HMAC-SHA256 signed webhooks
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          YOUR LINUX SERVER (VPS)                                    │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                        AGENT WAKEUP SERVER (:3333)                          │    │
│  │  Receives webhook → validates HMAC → spawns OpenClaw agent process          │    │
│  │  Concurrency control: one session per agent, queue if busy                  │    │
│  └─────────────────────────┬───────────────────────────────────────────────────┘    │
│                             │                                                       │
│  ┌──────────┐ ┌──────────┐ │ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │   KAZE   │ │  SCOUT   │ │ │  FORGE   │ │  GHOST   │ │ SENTINEL │  ... N agents  │
│  │Orchestrat│ │Research &│ │ │Engineer &│ │Content & │ │QA Review │               │
│  │or / COS  │ │Intel     │ │ │Builder   │ │Comms     │ │& Audit   │               │
│  ├──────────┤ ├──────────┤ │ ├──────────┤ ├──────────┤ ├──────────┤               │
│  │ SOUL.md  │ │ SOUL.md  │ │ │ SOUL.md  │ │ SOUL.md  │ │ SOUL.md  │               │
│  │ Memory   │ │ Memory   │ │ │ Memory   │ │ Memory   │ │ Memory   │               │
│  │ Sessions │ │ Sessions │ │ │ Sessions │ │ Sessions │ │ Sessions │               │
│  └──────────┘ └──────────┘   └──────────┘ └──────────┘ └──────────┘               │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                        SSH PROXY SERVER (:3001)                              │    │
│  │  SOUL file sync │ Agent registration │ Server health │ File operations      │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

</details>

<details>
<summary><b>Mission Flow — How agents coordinate</b> (click to expand)</summary>

### How a mission flows through the system

```
Human: "Research our top 10 competitors and draft outreach emails"
  │
  ▼
┌─────────────┐    ┌──────────────────────────────────────────────────────┐
│ KAZE        │───►│ Mission Decomposition                                │
│ Orchestrator│    │ Breaks into 7 parallel tasks with dependency graph:  │
└─────────────┘    │                                                      │
                   │  T1: Research competitors (Scout)                    │
                   │  T2: Enrich contacts (Scout) ─── depends on T1      │
                   │  T3: Draft emails (Ghost) ─── depends on T2         │
                   │  T4: Review emails (Sentinel) ─── depends on T3     │
                   │  T5: Push to HubSpot (Forge) ─── depends on T2, T4  │
                   └──────────────────────────────────────────────────────┘
                          │
                          ▼ Webhook wakeup per agent
                   ┌──────────────┐
                   │ Scout wakes  │──► Apollo API: search_organizations
                   │              │──► Apollo API: search_people
                   │              │──► Posts deliverable: 50 companies + 150 contacts
                   └──────┬───────┘
                          │ Task complete → triggers dependent tasks
                          ▼
                   ┌──────────────┐
                   │ Ghost wakes  │──► Reads Scout's deliverable
                   │              │──► Drafts 4-step email sequence
                   │              │──► Posts deliverable: email templates
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │Sentinel wakes│──► Reviews Ghost's emails
                   │              │──► Checks: spam words, clarity, tone, CTA
                   │              │──► APPROVED ✓ (or REJECTED → Ghost reworks)
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ Forge wakes  │──► HubSpot API: create_contacts (batch)
                   │              │──► HubSpot API: create_sequence
                   │              │──► HubSpot API: enroll_contacts
                   │              │──► Posts deliverable: sequence ID + enrollment count
                   └──────────────┘
                          │
                          ▼
                   Mission Complete: 7/7 tasks, 4 agents, 6 API integrations
```

</details>

---

## Core Systems — Deep Dive

<details>
<summary><b>1. Agent Orchestration Engine</b></summary>


The orchestration layer manages the full lifecycle of AI agents — from waking them up to coordinating multi-step missions with task dependencies.

```
convex/
├── agentWakeup.ts          # Webhook dispatcher: routes tasks to correct agent
│                           # HMAC-SHA256 signature validation
│                           # Concurrency throttling (configurable per agent)
│                           # Agent slug resolution from DB (not hardcoded)
│
├── tasks.ts                # Task state machine: inbox → assigned → in_progress
│                           #   → in_review → completed/rejected
│                           # User-scoped queries (by_requiredUserId index)
│                           # Dependency resolution: auto-wake blocked tasks
│                           # Iteration tracking for rejection/rework cycles
│
├── missions.ts             # Mission lifecycle: active → completed → archived
│                           # Task decomposition via Autopilot (Claude-powered)
│                           # Progress tracking: taskCount / completedTaskCount
│
├── agents.ts               # Dynamic agent registry (no hardcoded agent list)
│                           # Role-based queries: getOrchestrator, getReviewers
│                           # Heartbeat tracking + stale agent auto-reset
│
├── missionAutopilot.ts     # Claude decomposes a goal into a task dependency graph
│                           # Assigns agents by role, sets priorities, creates mission
│
├── agentWakeupSweep.ts     # Safety net cron: catches stuck assigned/in_progress tasks
│                           # Re-wakes agents if webhook delivery failed
│
└── crons.ts                # 10+ scheduled jobs: review sweeps, memory archival,
                            # soul distillation, health checks, webhook retries
```

**Key design decisions:**
- Agents are database-driven, not hardcoded. Create unlimited agents via the UI.
- Task dependencies form a DAG. Completing T1 auto-wakes agents blocked on T1.
- Every task goes through a quality review gate before completion.
- Rejection sends the task back with feedback — agents iterate up to N times.

</details>

<details>
<summary><b>2. Universal Integration Engine</b></summary>

Replaces expensive integration platforms (Paragon, Merge, Tray.io). User pastes an API docs URL → Claude reads the docs → generates tool definitions → agents call real APIs.

```
convex/
├── blueprints.ts           # Integration blueprint CRUD
│                           # Each blueprint: slug, baseUrl, authType, tools[]
│                           # 50+ pre-seeded blueprints (seed*.ts files)
│
├── blueprintTools.ts       # Per-blueprint tool definitions
│                           # Method, path, params, headers, body templates
│                           # AI-generated from API documentation
│
├── connections.ts          # Per-user encrypted credential storage
│                           # AES-256-GCM encryption at rest
│                           # OAuth2 + API key + custom auth support
│                           # Auto-refresh for expiring OAuth tokens
│
├── connectionActions.ts    # OAuth popup flow with HMAC-signed state
│                           # Token exchange, encryption, storage
│                           # Callback URL: /api/integrations/oauth/callback
│
├── executionEngine.ts      # Runtime: resolves params → sets auth headers →
│                           # makes HTTP request → handles 429/5xx retries →
│                           # logs to integrationActivity table
│
├── docScraper.ts           # Paste any API docs URL → Claude reads HTML/OpenAPI
│                           # → generates blueprint + tool definitions
│                           # Supports: OpenAPI/Swagger, REST HTML docs, GraphQL
│
└── tokenRefresh.ts         # Hourly cron: refreshes OAuth tokens expiring within 1hr
                            # Handles provider-specific quirks (Google, HubSpot, etc.)
```

**Security model:**
- Credentials encrypted with AES-256-GCM before storage. Key in env var, never in DB.
- OAuth state signed with HMAC to prevent CSRF.
- Per-user credential scoping — agents use the task creator's credentials.
- Rate limit handling with exponential backoff.

</details>

<details>
<summary><b>3. Agent Intelligence Layer</b></summary>

Agents aren't stateless function calls. They have persistent memory, evolving personalities, and session continuity.

```
convex/
├── agentMemory.ts          # Episodic memory: facts, preferences, API quirks
│                           # Per-agent memory banks with relevance scoring
│                           # TTL expiry + archival for stale memories
│                           # Agents write memories during tasks, read on wakeup
│
├── soulDistillation.ts     # Weekly cron: Claude reads high-value memories →
│                           # proposes SOUL file updates → human reviews diff
│                           # Agents literally evolve over time
│
├── soulFiles.ts            # Version-controlled SOUL file storage
│                           # Diff viewer for proposed changes
│                           # Sync to server via SSH proxy
│
├── sessionHandoffs.ts      # When agent session ends mid-task (timeout, crash):
│                           # Saves context → next session picks up where left off
│                           # Prevents re-doing completed work
│
├── integrationLearning.ts  # Analyzes API call patterns across all agents
│                           # Auto-detects quirks: rate limits, pagination styles
│                           # Writes squad-wide api_quirk memories
│
└── reasoning.ts            # Stores agent reasoning steps for observability
                            # War Room shows real-time agent thought process
                            # 30-day cleanup cron prevents unbounded growth
```

</details>

<details>
<summary><b>4. Event-Driven Automation</b></summary>

External events flow in via webhooks. Internal conditions trigger via monitors. Both wake agents to do real work.

```
convex/
├── webhooks.ts             # Native handlers: Slack, GitHub, Linear
│                           # Event → automation rule match → create task → wake agent
│
├── webhookReceiver.ts      # Generic receiver: POST /webhooks/{slug}/{userId}/{name}
│                           # Accepts any JSON payload from any source
│                           # Dead letter queue for failed events (max 3 retries)
│
├── webhookEndpoints.ts     # User-defined webhook endpoints with URL generation
│                           # Status: active/paused/disabled
│
├── automationRules.ts      # If-this-then-that rules: event pattern → agent action
│                           # Field matching, regex conditions, priority routing
│
├── monitors.ts             # Continuous polling monitors (1–60 min intervals)
│                           # "Watch HubSpot for deals > $50K" → wake Ghost
│
└── monitorPolling.ts       # Cron evaluates due monitors → executes integration call
                            # → checks condition → fires action if matched
```

</details>

<details>
<summary><b>5. Niche Sub-Products</b></summary>

Full vertical applications built on top of the agent platform. Each has its own workspace, sidebar, and domain.

```
src/niche/
├── ads/                    # AI Ad Manager — Google Ads + Meta Ads
│   ├── simulation/         # Full demo simulation with auto-typing prompt,
│   │                       # phased execution stream, creative generation
│   ├── pages/              # 18 pages: campaigns, keywords, budgets, creatives,
│   │                       # A/B tests, attribution, demographics, automation
│   └── components/         # ExecutionStream, LiveDataPanel, InsightCard
│
├── gtm/                    # AI GTM Engine — outbound sales pipeline
│   └── pages/              # Pipeline, leads, ICP builder, sequences, signals
│
├── content/                # AI Content Studio — multi-platform publishing
│   └── pages/              # Compose, blog, calendar, SEO, brand voice, flywheel
│
├── brand-monitor/          # AI Brand Monitor — reputation tracking
│   └── pages/              # Mentions, sentiment, alerts, sources, reports
│
└── framework/              # Shared niche infrastructure
    ├── NicheShell.tsx       # Provider + layout + onboarding wizard
    ├── NicheSidebar.tsx     # Dynamic sidebar with simulation badges
    ├── NicheContext.tsx      # Config, accent colors, integration requirements
    ├── CommandBar.tsx       # Cmd+K command palette per niche
    ├── useAgentTrigger.ts   # Hook: prompt → Kaze task → agent execution
    └── registry.ts          # Niche config registry (sidebar items, integrations)
```

</details>

---

## Features

| Feature | Description |
|---|---|
| **Dynamic agents** | Create unlimited agents via the UI. Each gets a SOUL file, memory bank, and configurable model. |
| **Integration Engine** | 50+ pre-built blueprints. Or paste any API docs URL → Claude generates tool definitions → agents call real APIs. |
| **Agent memory** | Persistent episodic memory per agent. Agents accumulate context, preferences, and API quirks across tasks. |
| **Soul distillation** | Weekly: Claude reads agent memories → proposes SOUL file evolution → human reviews. Agents get better over time. |
| **Quality gates** | Reviewer agents check every deliverable. Rejection sends the task back with feedback. Configurable max iterations. |
| **Mission autopilot** | Describe a goal → Claude decomposes into a task dependency graph → agents execute in parallel. |
| **Webhooks** | Trigger agents from Slack, GitHub, Linear, HubSpot, or any HTTP POST. Dead letter queue + retries. |
| **Monitors** | Poll any API on a schedule. Condition matches → agent wakes with a pre-filled task. |
| **War Room** | Real-time observability: agent reasoning steps, tool calls, handoffs, approval flow — all live. |
| **File manager** | Browse and edit SOUL.md / SKILL.md files via SSH. Rich editor with syntax highlighting. |
| **Niche apps** | Vertical products: AI Ad Manager (with simulation), GTM Engine, Content Studio, Brand Monitor. |
| **User isolation** | Tasks and missions scoped by userId. Each user sees only their own data. |
| **Session continuity** | Agent crashes mid-task? Next session picks up where it left off via session handoffs. |
| **Analytics** | Mission completion rates, agent throughput, task trends, cost per mission. |

---

## Quick Start

### Prerequisites

- **Node.js 18+** and npm
- A **Convex** account (free at [convex.dev](https://convex.dev))
- A **Clerk** account (free at [clerk.com](https://clerk.com))
- A **Linux VPS** to run your agents (AWS Lightsail, DigitalOcean, Hetzner — any works)
- **OpenClaw** installed on your VPS

### 1. Clone and install

```bash
git clone https://github.com/appydam/valence-ai.git
cd valence-ai/agent-orchestrator
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-key-here
VITE_SSH_PROXY_URL=http://your-server-ip:3001
```

### 3. Start Convex backend

```bash
npx convex dev
```

In a new terminal, set Convex environment variables:

```bash
npx convex env set INTEGRATION_ENCRYPTION_KEY $(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
npx convex env set ANTHROPIC_API_KEY sk-ant-your-key-here
npx convex env set AGENT_WAKEUP_WEBHOOK_URL http://your-server-ip:3333
npx convex env set AGENT_WAKEUP_WEBHOOK_SECRET your-hmac-secret
```

### 4. Seed integration blueprints

```bash
# Seed the most common integrations
for f in convex/seed*Blueprint.ts; do
  name=$(basename "$f" .ts)
  echo "Seeding $name..."
  npx convex run "$name" 2>/dev/null || true
done
```

### 5. Start the frontend

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — you'll be redirected to the login page. Sign up with your Clerk account and you'll land on the dashboard.

### 6. Set up your VPS

```bash
# On your VPS
npm install -g @openclaw/cli
openclaw init

# Copy example SOUL files as starting templates
cp -r server-files-example/agents/* ~/.openclaw/workspace/agents/
cp server-files-example/SOUL.md ~/.openclaw/workspace/SOUL.md

# Start the agent wakeup server
nohup node ~/agent-wakeup-server.js > ~/agent-wakeup.log 2>&1 &

# Start the SSH proxy
nohup node ~/ssh-proxy-service/server.js > ~/ssh-proxy.log 2>&1 &
```

In Valence AI → Settings → Server, paste your SSH credentials. The dashboard will test the connection and sync automatically.

---

## Server Sizing

| Agents | RAM | CPU | Est. Cost |
|--------|-----|-----|-----------|
| 1–5    | 2 GB | 2 vCPUs | ~$10–12/mo |
| 6–10   | 4 GB | 2 vCPUs | ~$20–24/mo |
| 11–15  | 8 GB | 4 vCPUs | ~$40–50/mo |
| 16–20  | 16 GB | 4 vCPUs | ~$80–100/mo |
| 20+    | 32 GB | 8 vCPUs | ~$160+/mo |

---

## Agent REST API

Agents call these endpoints from their SOUL file tool definitions:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/heartbeat` | Agent heartbeat (keep-alive, status update) |
| `GET`  | `/api/tasks` | Fetch assigned tasks for the calling agent |
| `POST` | `/api/tasks/claim` | Claim a task (assigned → in_progress) |
| `POST` | `/api/tasks/deliverable` | Post a deliverable to a task |
| `POST` | `/api/tasks/update` | Update task status/progress |
| `POST` | `/api/comments` | Add a comment to a task |
| `POST` | `/api/activity` | Log an activity event |
| `POST` | `/api/integrations/execute` | Execute an integration tool (agents call real APIs) |
| `POST` | `/api/agents/reasoning` | Log a reasoning step (visible in War Room) |
| `POST` | `/api/warroom/message` | Post a message to the War Room |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + Vite + TypeScript | Fast builds, type safety |
| UI | Tailwind CSS + shadcn/ui | Consistent, accessible components |
| Backend | Convex | Real-time DB + serverless functions, zero config |
| Auth | Clerk | 10K MAU free, OAuth, org support |
| AI | Anthropic Claude (Sonnet 4.6) | Best reasoning-to-cost ratio for agent tasks |
| Agent Runtime | OpenClaw | Open-source agent framework with SOUL files |
| Encryption | AES-256-GCM | Integration credentials encrypted at rest |
| Charts | Recharts | Composable chart components |
| Animations | Framer Motion | Physics-based UI animations |
| Code Editor | CodeMirror 6 | SOUL file editing in the browser |
| SSH | ssh2 (Node.js) | Remote file sync + agent registration |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, code style, and PR guidelines.

**Areas where help is especially welcome:**
- Additional integration blueprints (`convex/seed*.ts`)
- Agent SOUL file templates for new roles
- Niche sub-product pages
- Testing and documentation
- Accessibility improvements

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

**Built for teams that want AI agents doing real work, not demos.**

[GitHub](https://github.com/appydam/valence-ai) · [Landing Page](https://usevalence.ai)

</div>
