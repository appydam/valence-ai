<div align="center">

# Valence AI

**Open-source autonomous AI workforce platform**

Deploy a squad of specialized AI agents. Assign tasks, manage integrations, monitor performance — all from one dashboard.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Convex](https://img.shields.io/badge/Backend-Convex-orange)](https://convex.dev)
[![Auth by Clerk](https://img.shields.io/badge/Auth-Clerk-purple)](https://clerk.com)

![Valence AI Dashboard](docs/screenshot.png)

</div>

---

## What is Valence AI?

Valence AI is a self-hosted AI workforce platform and orchestration dashboard for [OpenClaw](https://openclaw.dev) AI agents. Instead of managing agents through a terminal, you get a real-time web UI where you can:

- **Create and assign tasks** to any agent with one click
- **Watch agents work** through live activity feeds and status cards
- **Connect 100+ integrations** (GitHub, Slack, HubSpot, Notion, Jira, Google Workspace, and more) using the built-in Integration Engine
- **Edit agent SOUL files** — the plain-English instructions that define each agent's personality and capabilities
- **Set up webhooks and monitors** — trigger agents from Slack messages, GitHub events, HubSpot deals, or continuous polling conditions
- **Review deliverables** before they ship, with configurable approval gates
- **Analyze performance** through mission reports, task throughput charts, and agent analytics

> **Agents run on your server.** Valence AI is purely a dashboard — it talks to OpenClaw agents running on your Linux VPS via webhook.

---

## Features

| Feature | Description |
|---|---|
| 🤖 **Dynamic agents** | Create unlimited agents via the UI. No hardcoded agent list. |
| 🔌 **Integration Engine** | Paste any API docs URL → Claude generates tool definitions → agents call real APIs |
| 🧠 **Agent memory** | Persistent memory bank per agent. Agents accumulate context across tasks. |
| 🔍 **Quality gates** | Reviewer agents check every deliverable. Configurable approval flows. |
| 📡 **Webhooks** | Trigger agents from Slack, GitHub, Linear, HubSpot events, or custom webhooks |
| 📊 **Monitors** | Continuously poll APIs/conditions on a schedule, wake agents on match |
| 🗂️ **File manager** | Browse and edit SOUL.md files directly from the dashboard via SSH |
| 📈 **Analytics** | Mission reports, agent activity heatmaps, task completion rates |
| 🎙️ **Voice briefings** | Morning audio briefings from your orchestrator agent (optional) |
| 🔐 **Self-hosted** | All data stays on your infrastructure. No external SaaS dependencies. |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│           Valence AI (this repo)        │
│                                             │
│  React + Vite + Tailwind   ←→   Convex      │
│  (Frontend dashboard)           (Backend DB) │
│                │                            │
└────────────────┼────────────────────────────┘
                 │ HTTP webhooks
                 ▼
┌─────────────────────────────────────────────┐
│         Your Linux Server (VPS)             │
│                                             │
│  OpenClaw agents  ←→  Agent wakeup server   │
│  (kaze, scout,         (port 3333)          │
│   forge, ghost,                             │
│   sentinel, ...)   SSH Proxy (port 3001)    │
└─────────────────────────────────────────────┘
```

**Frontend** — React + Vite + TypeScript + Tailwind + shadcn/ui. Deployed to Vercel, Netlify, or any static host.

**Backend** — [Convex](https://convex.dev) serverless functions + real-time database. Free tier supports most personal/small team workloads.

**Auth** — [Clerk](https://clerk.com) handles authentication. 10,000 MAU free.

**Agents** — [OpenClaw](https://openclaw.dev) AI agent framework, running on your Linux VPS. Agents wake up via webhook when Valence AI assigns a task.

**SSH Proxy** — Small Node.js service (`server-files/ssh-proxy-server.js`) running on your VPS that enables SOUL file sync and agent registration from the dashboard.

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

Edit `.env.local` and fill in:

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

This creates a Convex project on first run, generates the type-safe client, and starts watching for schema changes.

In a new terminal, set required Convex environment variables:

```bash
# Integration encryption key (generate a random 64-char hex string)
npx convex env set INTEGRATION_ENCRYPTION_KEY $(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Anthropic API key (for doc scraper, autopilot, soul distillation)
npx convex env set ANTHROPIC_API_KEY sk-ant-your-key-here

# Agent wakeup server (running on your VPS)
npx convex env set AGENT_WAKEUP_WEBHOOK_URL http://your-server-ip:3333
npx convex env set AGENT_WAKEUP_WEBHOOK_SECRET your-hmac-secret
```

### 4. Start the frontend

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — you'll be redirected to the login page. Sign up with your Clerk account and you'll land on the dashboard.

### 5. Set up your VPS

Install OpenClaw and the SSH proxy on your Linux server:

```bash
# On your VPS
npm install -g @openclaw/cli
openclaw init

# Start the agent wakeup server (Valence AI calls this to wake agents)
nohup node ~/agent-wakeup-server.js > ~/agent-wakeup.log 2>&1 &

# Start the SSH proxy (enables SOUL file sync from the dashboard)
npm install ssh2
nohup node ~/ssh-proxy-service/server.js > ~/ssh-proxy.log 2>&1 &
```

In Valence AI → Settings → Server, paste your SSH credentials. The dashboard will test the connection and sync automatically.

---

## Server Sizing

Each agent runs as an independent Node.js process. More concurrent agents = more RAM needed.

| Agents | RAM | CPU | Est. Cost |
|--------|-----|-----|-----------|
| 1–5    | 2 GB | 2 vCPUs | ~$10–12/mo |
| 6–10   | 4 GB | 2 vCPUs | ~$20–24/mo |
| 11–15  | 8 GB | 4 vCPUs | ~$40–50/mo |
| 16–20  | 16 GB | 4 vCPUs | ~$80–100/mo |
| 20+    | 32 GB | 8 vCPUs | ~$160+/mo |

**Recommended starting point:** AWS Lightsail 4 GB ($20/mo), DigitalOcean Basic ($24/mo), or Hetzner CX22 ($7/mo for 4 GB).

---

## Project Structure

```
agent-orchestrator/
├── convex/                    # Backend (Convex serverless functions)
│   ├── schema.ts              # Database schema
│   ├── agents.ts              # Agent CRUD + role queries
│   ├── tasks.ts               # Task lifecycle (create, assign, complete, review)
│   ├── messages.ts            # Agent messaging / squad broadcast
│   ├── agentWakeup.ts         # Webhook trigger to wake sleeping agents
│   ├── monitors.ts            # Continuous monitor definitions
│   ├── monitorPolling.ts      # Cron-based monitor evaluation
│   ├── http.ts                # HTTP API endpoints (for OpenClaw agents)
│   ├── executionEngine.ts     # Integration tool execution runtime
│   ├── blueprints.ts          # Integration blueprint CRUD
│   ├── connections.ts         # Per-user encrypted OAuth/API key storage
│   └── lib/                   # Shared utilities (crypto, auth, rateLimit)
│
├── src/
│   ├── pages/                 # Route pages
│   │   ├── Board.tsx          # Main task board (Kanban)
│   │   ├── Agents.tsx         # Agent management + create/edit/delete
│   │   ├── Analytics.tsx      # Performance analytics
│   │   ├── MemoryBank.tsx     # Agent memory viewer
│   │   ├── Monitors.tsx       # Continuous monitors
│   │   ├── Webhooks.tsx       # Webhook rules
│   │   ├── Files.tsx          # SOUL file manager
│   │   ├── Settings.tsx       # API keys, SSH config, integrations
│   │   └── ...
│   ├── components/            # Reusable UI components
│   │   ├── AgentConfigPanel.tsx  # Per-agent config (model, SOUL, skills)
│   │   ├── TaskDetailPanel.tsx   # Task detail + comments + deliverables
│   │   ├── LiveOpsFeed.tsx       # Real-time agent activity stream
│   │   └── ...
│   ├── hooks/
│   │   └── useAgents.ts       # Dynamic agent data hook (replaces static config)
│   └── types/
│       └── mission.ts         # Shared TypeScript types
│
├── server-files/
│   ├── ssh-proxy-server.js    # SSH proxy + agent registration service
│   ├── SOUL.md                # Kaze (orchestrator) SOUL file template
│   └── agents/                # Per-agent SOUL file templates
│       ├── scout/SOUL.md
│       ├── forge/SOUL.md
│       ├── ghost/SOUL.md
│       └── sentinel/SOUL.md
│
├── .env.example               # Environment variable template
└── README.md                  # This file
```

---

## Agent API (for OpenClaw SOUL files)

Valence AI exposes a REST API that agents call directly. All endpoints accept an `Authorization: Bearer <api-key>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/heartbeat` | Agent heartbeat (keep alive, update status) |
| `GET`  | `/api/tasks` | Fetch assigned tasks for the agent |
| `POST` | `/api/tasks/claim` | Claim a task (set status → in_progress) |
| `POST` | `/api/tasks/deliverable` | Post a deliverable to a task |
| `POST` | `/api/tasks/update` | Update task status/progress |
| `POST` | `/api/comments` | Add a comment to a task |
| `GET`  | `/api/activity` | Get recent activity |
| `POST` | `/api/activity` | Log an activity event |

Generate an API key in Settings → API Keys. Use the `heartbeat` permission for agent keys.

---

## Integrations

Valence AI includes 50+ pre-built integration blueprints. Connect them in Settings → Integrations.

**Productivity:** Notion, Confluence, Google Drive, Dropbox
**Communication:** Slack, Gmail, Outlook
**Project Management:** Jira, Linear, Asana, Trello, GitHub, GitLab
**CRM / Sales:** HubSpot, Salesforce, Pipedrive, Apollo
**Analytics:** Google Analytics, Mixpanel, Amplitude
**Payments:** Stripe
**Cloud:** AWS, Google Cloud, Vercel
**Social:** Twitter/X, LinkedIn
**Databases:** Airtable, Notion, Google Sheets

To add a custom integration: Settings → Integrations → New → paste the API docs URL. Claude will generate the tool definitions automatically.

---

## SOUL Files

A SOUL file is a plain-English Markdown document that defines an agent's personality, rules, and tool usage. It lives at `~/.openclaw/workspace/SOUL.md` (orchestrator) or `~/.openclaw/workspace/agents/{name}/SOUL.md` (other agents).

Edit SOUL files from the dashboard: Agents → select agent → ⚙️ → SOUL tab.

**SOUL file anatomy:**

```markdown
# Agent Name

Brief description of who this agent is.

## Core Rules
- Never improvise specs — ask for clarification
- Always post a heartbeat every 5 tool calls
- Hard stop at turn 15, post partial results

## Tools Available
List the integrations and skills this agent should use.

## Task Workflow
Step-by-step how the agent should approach tasks.
```

---

## Webhooks & Monitors

### Webhooks
Create automation rules that trigger when events arrive from Slack, GitHub, Linear, or any custom HTTP endpoint. Configure in Webhooks → New Rule.

Example: GitHub PR opened → create a code review task for Sentinel → wake Sentinel.

### Monitors
Continuously poll an integration on a schedule (every 1–60 min). When a condition matches, wake an agent with a pre-filled task.

Example: HubSpot deal moved to "Closed Won" → wake Ghost to draft a success story.

---

## Contributing

Contributions welcome. Please:

1. Fork the repo and create a feature branch
2. Follow existing code patterns (React hooks, Convex mutations)
3. Test your changes locally with `npm run dev` + `npx convex dev`
4. Open a PR with a clear description of what changed and why

**Areas where help is especially welcome:**
- Additional integration blueprints (`convex/seed*.ts`)
- Agent SOUL file templates for new roles
- Mobile-responsive improvements
- Documentation and tutorials

---

## Development

```bash
# Start everything locally
npx convex dev          # Terminal 1: Convex backend (watches for changes)
npm run dev             # Terminal 2: Vite frontend (hot reload)

# Type-check without deploying
npx convex dev --once --typecheck=disable

# Build for production
npm run build

# Run tests
npm test
```

**Important:** Always deploy to the dev deployment with `npx convex dev --once --typecheck=disable`, not `npx convex deploy` (which targets production).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Convex (serverless functions + real-time database) |
| Auth | Clerk |
| AI | Anthropic Claude (Sonnet 4.6 default) |
| Agent Runtime | OpenClaw |
| SSH Proxy | Node.js + ssh2 |
| Charts | Recharts |
| Animations | Framer Motion |
| Code Editor | CodeMirror 6 |

---

## License

MIT — see [LICENSE](LICENSE). Use it commercially, modify it, self-host it. Attribution appreciated but not required.

---

<div align="center">
Built for teams that want AI agents doing real work, not demos.
</div>
