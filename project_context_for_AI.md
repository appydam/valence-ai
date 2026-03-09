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

## Use Cases (32 workflows across 10 departments)

The platform is not limited to these — any workflow involving research, writing, data movement, QA, or coordination across tools can be built. These are proven, demo-ready scenarios.

### Sales
- **Win back dead deals** — Weekly scan of all closed-lost deals (6–18 months). Agents cross-reference 6 revival signals (champion job changes, funding events, pricing page revisits, email re-engagement, competitor complaints, hiring signals) → ranked priority list → personalized re-engagement email per deal, ready to send. Surfaces $200k–$800k in dead pipeline per run.
- **Enrich leads & run outbound** — Pull raw leads → Scout enriches with company data, tech stack, intent signals → scores against ICP → Ghost writes personalized outreach → Kaze sequences in Outreach/Salesloft.
- **CRM hygiene + activity logging** — Continuously syncs call/email activity from Gong, Gmail, and calendar into Salesforce/HubSpot. Flags stale deals, missing fields, and data quality issues without reps lifting a finger.
- **Pipeline hygiene + forecast** — Weekly: pull all open opps, check for stale stages, missing close dates, and forecast accuracy. Ghost writes the updated forecast narrative for leadership.
- **Dead pipeline revival sprint** — Deep dive into 6–18 months of closed-lost deals. Agents analyze 300+ deals in 4 hours (a manual job that takes a team a week). Returns the 15 highest-signal revival opportunities with outreach pre-written.

### Marketing
- **Case study pipeline** — Auto-triggered when a deal closes as Won + NPS ≥ 8. Agents pull deal data from Salesforce + Stripe + Intercom, draft a 1,500-word case study, 4 content formats (LinkedIn post, tweet thread, email snippet, Google Doc), and verify every metric against source data. 48 hrs from close to draft.
- **Competitive intel radar** — Weekly: Scout monitors competitor websites, G2/Capterra, job boards, Product Hunt, and ad platforms. Ghost writes updated battle cards and threat assessment. Delivered Monday 9am. Replaces Klue/Crayon at $30k+/yr.
- **SEO content engine** — Weekly keyword gap analysis → Scout identifies high-opportunity topics → Ghost writes full SEO article → Sentinel QAs for accuracy → Kaze publishes to CMS. 3× content output at 1/5 the cost.
- **Cross-channel marketing reports** — Every Monday: pull Google Ads, Meta, GA4, email, and e-commerce data. Sentinel verifies every number. Ghost writes the performance narrative with insights. Delivered before standup.
- **One blog post → 15 content assets** — Take one long-form post → Ghost repurposes into LinkedIn carousel, tweet thread, email newsletter, YouTube script, Instagram captions, and more. Distributed automatically.

### Customer Success
- **Upsell signals** — Daily: scan product usage, support tickets, NPS scores, and billing data for expansion signals. Surfaces accounts ready to upgrade with personalized outreach for CSM.
- **QBR prep + health scores** — Pull product usage, support history, NPS, contract details, and renewal date per account → Ghost writes the QBR narrative and account health summary → CSM shows up prepared.
- **Customer onboarding orchestration** — Trigger on new customer creation. Agents send welcome sequences, configure CRM records, create onboarding tasks in Jira/Asana, and check completion milestones automatically.
- **Support ticket triage & routing** — Incoming tickets classified by sentiment, urgency, and category → auto-assigned to right agent/team → Ghost drafts suggested replies for Tier 1 → Sentinel flags escalation risks.

### E-commerce (DTC Niche)
- **Competitor price response** — Daily: Scout scrapes top 10 competitor stores for price changes. On detection: analyzes your margins, drafts counter-campaign (email + SMS + social), routes for one-click approval. Counter-campaign ready within 60 minutes of price drop.
- **Inventory restock with demand forecasting** — Daily: Scout pulls inventory levels, sales velocity, upcoming campaigns from Klaviyo, and seasonal patterns. Flags SKUs at risk of stockout before a campaign spike. Supplier emails pre-drafted with reorder quantities.
- **Review & UGC harvester** — Weekly: pulls reviews from G2, Trustpilot, Amazon, Google → identifies best quotes and user-generated content → pushes to product pages, ads, and email flows. Conversion lift 10–25%.
- **Flash sale launch autopilot** — Trigger (manual, competitor alert, or revenue anomaly) → agents run inventory check, margin analysis, copy creation, QA, and scheduling simultaneously → flash sale live in under 60 minutes. 8+ hours of coordination compressed into one command.

### Agency (Marketing Agency Niche)
- **Client reporting autopilot** — Every Friday: pull all client data from ad platforms + analytics + email tools. Sentinel verifies every metric. Ghost writes the performance narrative with insights. Formatted report delivered ready to send. Saves 10–15 hrs per AM per week.
- **Client performance narrative** — Goes deeper than data: Ghost writes the "why" — which creative hit fatigue, which channel is outperforming, what to do next week. Benchmarks against industry averages. Delivered as Google Doc + formatted email draft.
- **New client audit & strategy in 24 hrs** — On new client onboarding: Scout audits all ad accounts, analytics, email performance, and competitor landscape simultaneously. Ghost writes a strategy deck with specific recommendations. What normally takes a senior strategist 2 weeks → delivered in 24 hours.

### Finance
- **Month-end close prep** — Last business day: Scout pulls Stripe, QuickBooks, Gusto, Ramp, and cross-reconciles. Ghost writes close narrative. Sentinel verifies all numbers. CFO package ready end-of-day. Close 3–5 days faster.
- **Month-end close in 3 days, not 12** — Full AR/AP reconciliation: 842 transactions auto-matched, invoices processed, discrepancies flagged, board package assembled.
- **Expense anomaly detection** — Daily: Scout analyzes all corporate card transactions against policy. Flags duplicates, policy violations, and contextual anomalies (e.g., same Uber charged by 3 employees). Ghost writes policy-citing notices. Catches 90%+ of violations.

### Operations
- **Vendor & contract renewal autopilot** — Monthly: scan all SaaS subscriptions, identify upcoming renewals, pull usage data to evaluate ROI, draft renegotiation talking points. Saves $50k–$200k/yr in unnecessary renewals.
- **Meeting notes → action items → follow-up** — After every meeting (via calendar + transcript): Ghost writes structured notes, extracts action items, assigns owners, creates tasks in Jira/Asana, and sends follow-up email. Completion rate +60–80%.
- **Cross-tool data sync + weekly ops report** — Continuous: syncs data bidirectionally across CRM, billing, project management, and HRIS. Weekly: pulls 28+ metrics from 8 sources, catches discrepancies, Ghost writes leadership report. Delivered Monday 8am.

### HR & People
- **Performance review prep** — Per review cycle: Scout pulls OKR data, project contributions, peer feedback, and collaboration metrics for every employee. Ghost writes a data-backed first draft per employee. Managers refine in 30 min instead of 3 hrs. For a 160-person company: saves 320–640 hrs per cycle.

### DevOps / Engineering
- **Incident response autopilot** — PagerDuty fires → agents pull recent deploys, CI/CD status, error logs, and infrastructure health → Ghost writes incident summary with root cause hypothesis → Jira ticket created → Slack war room opened. On-call wakes up to full context. MTTR -60%.
- **Release notes & changelog** — On every GitHub merge to main: Scout reads the diff → Ghost writes user-facing release notes in plain English → Sentinel checks for breaking changes → published to docs site and Slack. Feature adoption +15–30%.

### Legal & Compliance
- **Regulatory change tracker** — Weekly: Scout monitors Federal Register, state AGs, SEC, FINRA, and relevant regulatory bodies. Ghost writes plain-English summary of anything affecting the business. Sentinel verifies citations. Jira compliance tasks created with deadlines. Never miss a regulatory deadline.
- **Contract review & risk flagging** — Upload any vendor contract → Scout identifies non-standard clauses, missing protections, and liability risks → Ghost writes a plain-English risk summary with redline suggestions → Sentinel benchmarks against your standard terms. Review time -70%.

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
