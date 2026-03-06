# Valence AI — Product Context

> Use this file as context when talking to any AI about Valence AI. It covers what we build, who it's for, and why it matters.

---

## What Is Valence AI?

Valence AI is an **autonomous Agentic AI platform that can automate any complex enterprise workflow**, connected to ~100 popular tools like HubSpot, Notion, Google Workspace, Atlassian (Jira/Confluence), Figma, Shopify, Google/Meta Ads, Slack, Salesforce, GitHub, and many more.

It lets businesses define high-level objectives, and a coordinated squad of 5 specialized AI agents executes them — calling real APIs, creating deliverables, learning from experience, and improving over time.

Think of it as **"an AI-powered operating system for business operations"** — not a chatbot, not a workflow tool, but a full execution layer where human intent becomes autonomous action across any tool in the enterprise stack.

**Built by Arpit Dhamija** — solo founder, full-stack engineer.

---

## The Core Problem We Solve

Enterprises run on 15-50+ SaaS tools. The "glue" between them is manual — humans copy-paste between Slack, Jira, Salesforce, GitHub, Google Sheets, etc. Automating this costs $1k-10k/month (Zapier, Workato, Paragon) and still requires developer effort for every new connection.

**Our thesis:** A team of specialized AI agents can replace entire workflow layers. Not one chatbot — a coordinated squad that understands context, calls real APIs, coordinates with each other, and gets smarter over time.

---

## The Agent Squad (5 Agents)

| Agent | Role | What They Do |
|-------|------|-------------|
| **Kaze** 🌀 | Chief of Staff | Orchestrates everything — decomposes objectives into tasks, delegates to other agents, reviews work, approves or rejects deliverables |
| **Scout** 🔭 | Market Intelligence | Research, competitive analysis, data gathering, trend identification. Synthesizes findings into actionable insights |
| **Forge** 🔨 | Engineer | Writes code, builds integrations, creates technical implementations. Interacts with GitHub, builds tools end-to-end |
| **Ghost** 👻 | Content & Distribution | Writes emails, social posts, reports, documentation. Creates polished, publication-ready content |
| **Sentinel** 🛡️ | QA & Monitor | Automatically reviews all agent output, rejects subpar work with feedback, ensures quality at scale |

**How they coordinate:** When a user says "Launch our product on Product Hunt," Kaze creates subtasks for Scout (research top launches), Forge (build landing page), Ghost (write launch copy), then reviews all deliverables. Scout's research automatically flows into Ghost's context via dependency injection.

---

## Key Capabilities

### 1. Natural Language Mission Planning (Autopilot)
Describe a goal in plain English (or speak it) → AI decomposes into 3-8 tasks with agent assignments, dependencies, and priorities → review/edit → one-click launch. Pre-built templates for cold outreach, competitive intel, research reports, and more.

### 2. Universal Integration Engine (Replaces $2,500/mo Paragon)
- **30+ pre-seeded integrations**: GitHub, Slack, Jira, Salesforce, HubSpot, Notion, Google Sheets, Airtable, Shopify, Stripe, Linear, and more
- **Any API in minutes**: Paste an API docs URL → AI reads the docs and generates tool definitions → user reviews → agents can now call that API
- **Zero platform cost**: Self-hosted on Convex (vs. Paragon at $2,500/month)
- **Real API access**: Agents call actual APIs (not mocked) with OAuth, API keys, retry logic, and rate limit handling

### 3. Agents That Learn & Improve
- **Episodic Memory**: Agents remember API quirks, user preferences, patterns, and failures across sessions
- **Session Handoffs**: When a session ends, agents write a summary so the next session picks up exactly where it left off
- **SOUL File Evolution**: Accumulated memories are periodically distilled into the agent's identity file (SOUL), which humans review and approve. Agents literally get better at their jobs over time
- **Human Endorsement**: Users can endorse or flag agent memories, creating a quality signal loop

### 4. Task Management & Dependencies
- Full Kanban board: Inbox → Assigned → In Progress → In Review → Done
- Task dependency graphs with automatic chain reactions (when Task A completes, Tasks B and C unblock)
- Deliverables from upstream tasks automatically injected into downstream agent context
- Quality feedback loops: reject with reason → agent receives feedback and reworks

### 5. Automated Quality Assurance
- Sentinel agent automatically reviews all completed work (sweep every 2 minutes)
- Rejection/rework cycles with feedback injection
- Iteration caps prevent infinite loops — escalates to human when limit is hit
- Agents that produce bad work repeatedly have that pattern distilled into a lesson

### 6. Event-Driven Automation (Webhooks)
- Receive webhooks from GitHub, Slack, Linear, or any source
- Automation rules: "When GitHub push to main → create review task for Kaze"
- Signature verification, dead letter queue with retry logic

### 7. Daily CEO Digest (Morning Brief)
AI-generated daily summary at 8 AM IST: tasks completed, blockers, agent performance, highlights — without opening the dashboard.

### 8. Real-Time Agent Observability
Watch agents think in real-time — every reasoning step, tool call, and decision is logged. War Room shows cross-agent coordination on active missions.

---

## What Makes Us Different

| vs. | Them | Us |
|-----|------|-----|
| **ChatGPT/Claude** | One agent, stateless, no APIs | 5-agent team, persistent memory, 30+ real API integrations |
| **Zapier/Make** | Pre-built connectors, if-this-then-that | AI agents that reason, any API via doc scraper, $0 platform cost |
| **Paragon/Merge** | $2,500/mo, SDK-required, pre-built only | $0/mo, no-code, any API, AI agents as first-class users |
| **AutoGPT/CrewAI** | Framework (build it yourself), demo-grade | Complete product with UI/backend, production-grade, 30+ live integrations |

---

## Complexity We Handle

**Multi-agent dependency orchestration**: A single business objective requires multiple agents working in sequence and parallel, with dependencies between outputs. When Scout finishes research, Ghost automatically gets those deliverables as context for content creation.

**Universal API integration without developers**: User pastes a docs URL → AI generates tool definitions → agents can call that API. No developer needed, works with any REST/GraphQL/SOAP API.

**Agents that learn across sessions**: Standard AI agents are stateless. Ours build episodic memories, distill them into identity, and evolve their personality/judgment over time.

**Secure multi-tenant credentials**: AES-256-GCM encryption for all tokens at rest, auto-refresh, per-user scoping, connection health monitoring.

**Natural language to execution**: "Send 50 personalized cold emails to YC founders" → AI creates task plan → agents execute across Gmail, LinkedIn, HubSpot, Google Sheets.

---

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind + shadcn/ui
- **Backend**: Convex (serverless, real-time database, 43 tables, 100+ API endpoints)
- **Agent Runtime**: OpenClaw on AWS Lightsail (self-hosted)
- **LLM**: Claude Opus 4.5 (Anthropic)
- **Auth**: Clerk
- **Billing**: Stripe (3 tiers: Starter, Pro, Enterprise)
- **Integrations**: 30+ pre-seeded, 100+ in template catalog, any API via doc scraper

---

## Use Cases

1. **Automated Cold Outreach**: Scout researches prospects → Ghost writes personalized emails → Forge sets up tracking → Kaze reviews and approves
2. **Competitive Intelligence**: Scout gathers competitor data → Ghost synthesizes report → Kaze distributes to stakeholders
3. **Content Marketing Pipeline**: Scout researches topics → Ghost writes blog posts/social content → Sentinel reviews quality → Kaze publishes
4. **Developer Workflow Automation**: Forge monitors GitHub → creates Jira tickets → builds code fixes → Scout validates against docs
5. **Customer Onboarding Automation**: Agents handle welcome emails, CRM setup, integration configuration, and follow-up sequences
6. **Cost Optimization Audits**: Scout analyzes spending data → Forge identifies savings → Ghost writes recommendations → Kaze prioritizes actions

---

## Business Model

- **Deployment**: Cloud (we host everything, ~$12-45/mo infra per customer) or On-Prem Hybrid (customer hosts agents on their infrastructure)
- **Pricing Tiers**: Starter (free/limited) → Pro → Enterprise
- **Revenue**: SaaS subscription + usage-based (tasks, API calls, agent sessions)
- **Key Advantage**: $0 platform cost for integrations (vs. $2,500/mo for Paragon)

---

## Current Status (March 2026)

- **Product**: Live, production-ready
- **Tested Integrations**: GitHub, Slack, Jira, Gmail, HubSpot, Notion, Google Sheets, Google Calendar, Google Analytics, Twitter (read-only)
- **Stress Tests**: All 6/6 tasks approved in latest stress test
- **Pages**: 30+ routes (Kanban, Missions, Autopilot, War Room, Analytics, Memory Bank, Integrations, Billing, etc.)
- **Database**: 43 tables, 13 cron jobs running
- **Agents**: 5 active, coordinating autonomously with memory and quality loops

---

## Key Metrics / Proof Points

- Replaced $2,500/month Paragon with custom integration engine at $0
- 30+ pre-seeded integration blueprints, 100+ in template catalog
- Agents successfully coordinate multi-step missions with dependency chains
- Quality loop works: Sentinel rejected Forge's work for missing analytics call → Forge fixed and resubmitted → approved on iteration 2
- Agent memory persists across sessions — agents don't repeat mistakes
- SOUL file evolution means agents genuinely improve their judgment over time

---

## Founder

**Arpit Dhamija** — Solo founder and full-stack engineer. Built the entire platform (frontend, backend, agent system, integration engine, deployment scripts, agent personalities) single-handedly.

---

*This is a condensed context file. For full technical documentation, see PROJECT_BIBLE.md (internal codename: Mission Control).*
