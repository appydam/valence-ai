# Valence AI — Product & Business Context

> Use this file as context when talking to any AI about Valence AI. It covers what we build, who it's for, the business model, and go-to-market strategy.

---

## What Is Valence AI?

Valence AI is an **AI staffing & transformation company**. We don't sell software — we deploy AI employees on private infrastructure inside companies, fully managed, custom-trained to each client's business.

We have **3 product verticals**:

| Vertical | What It Is | Ticket Size |
|----------|-----------|-------------|
| **AI Workers** | Hire individual AI agents for specific roles (SDR, Content Writer, Bookkeeper, etc.) | $500-1,500/mo per worker |
| **AI Department** | A coordinated squad of AI agents that runs an entire business function autonomously | $3,000-10,000/mo |
| **AI Business Transformation** | We audit your tech stack, replace legacy software & SaaS, rebuild everything into one AI-native ecosystem on private infrastructure | $15,000-50,000+ per engagement |

**Built by Arpit Dhamija** — solo founder, full-stack engineer.

**Core thesis (Sequoia Capital):** "For every $1 spent on software, $6 are spent on services. If you sell the tool, you're racing the model. If you sell the work, every model improvement makes you better."

We capture the $6, not the $1.

---

## Vertical 1: AI Workers

**What:** Hire individual AI agents for specific roles. They plug into your existing tools, work 24/7, and get smarter every week.

**Entry-level offering.** Fastest to deploy, lowest commitment, easiest yes.

**Available roles:**
- AI SDR — personalized outreach at scale
- AI Content Writer — blogs, social, newsletters in your voice
- AI Bookkeeper — invoices, reconciliation, reports
- AI Data Analyst — dashboards, KPIs, anomaly detection
- AI Recruiter — source, screen, schedule
- AI Social Media Manager — daily posts, engagement, competitor tracking
- AI DevOps Engineer — PR reviews, CI/CD, incident response
- AI Executive Assistant — calendar, inbox, briefings
- AI SEO Specialist, Customer Success Manager, PR Coordinator, Legal Doc Reviewer, and custom roles

**How it works:**
1. Assign a task in plain English
2. Worker executes — calls real APIs across 100+ integrations
3. AI QA (Sentinel) reviews every deliverable
4. You get results in Slack, email, Notion — wherever you want

**Pricing:** Free 2-week pilot → $499-999/mo per worker

---

## Vertical 2: AI Department

**What:** A coordinated squad of 5 specialized AI agents that runs an entire business function (sales, marketing, ops, finance, etc.) autonomously. This is the Mission Board + Autopilot product.

**The Agent Squad:**

| Agent | Role | What They Do |
|-------|------|-------------|
| **Kaze** 🌀 | Chief of Staff | Orchestrates everything — decomposes objectives into tasks, delegates, reviews, approves/rejects deliverables |
| **Scout** 🔭 | Market Intelligence | Research, competitive analysis, data gathering, trend identification |
| **Forge** 🔨 | Engineer | Writes code, builds integrations, deploys, creates technical implementations |
| **Ghost** 👻 | Content & Distribution | Writes emails, social posts, reports, documentation |
| **Sentinel** 🛡️ | QA & Monitor | Automatically reviews all agent output, rejects subpar work, ensures quality |

**How they coordinate:** User says "Pull last week's performance across all channels, build the weekly marketing report, and send it to the team by Monday 9am" → Kaze decomposes into 9 subtasks → Scout pulls data from 6 platforms → Forge builds dashboards → Ghost writes the report → Sentinel QAs everything → Ghost distributes via email + Slack.

**Key capabilities:**
- Natural language mission planning (Autopilot)
- 100+ integrations across 19 categories
- Agents that learn & improve (episodic memory, SOUL evolution)
- Task dependency graphs with automatic chain reactions
- Automated quality assurance (Sentinel sweep every 2 minutes)
- Event-driven automation (webhooks from GitHub, Slack, Linear, etc.)
- Real-time agent observability (War Room)
- Voice command interface

**Pricing:** Free 2-week pilot → $2,500-5,000/mo → scales to $10,000/mo for larger deployments

---

## Vertical 3: AI Business Transformation

**What:** Full digital overhaul. We audit the client's entire tech stack, replace legacy software and expensive SaaS subscriptions, and rebuild everything into one AI-native ecosystem — privately hosted, custom-built, fully managed.

**This is the highest-ticket, deepest-engagement offering and our primary go-to-market focus.**

**The problem we solve:**
- Companies pay $10-50K/mo across 30+ SaaS tools that don't talk to each other
- $2-5K/mo on integration middleware (Zapier, Paragon, custom glue)
- Data scattered across silos — no single source of truth
- Rising costs every year with flat value
- No AI capabilities in existing stack

**Our 5-phase process:**
1. **Audit** (Week 1) — Map the entire stack, every tool, every integration, every cost
2. **Redesign** (Week 2-3) — Architect the AI-native replacement
3. **Build** (Week 3-6) — Deploy private infrastructure, migrate data, build custom tools
4. **Deploy** (Week 6-7) — AI agents go live, integrations wired, team trained
5. **Manage** (Ongoing) — Monitoring, optimization, SOUL evolution, weekly reports, monthly strategy calls

**What the client gets:**
- One unified ecosystem replacing 30+ SaaS tools
- Private hosting — their data, their infrastructure (GDPR/HIPAA ready)
- AI baked into every workflow from day one
- No more per-seat SaaS pricing or surprise price hikes
- Agents that learn and improve every week
- White-glove setup and ongoing management

**Pricing:** $5K discovery + $15-50K implementation + ongoing management

**Why it's the easiest sell:** The pain is obvious and quantifiable. Every company knows they're overpaying for fragmented tools. You're not selling something new — you're fixing something broken. And once you've rebuilt someone's entire tech stack, they're not leaving.

---

## The Technology

### Universal Integration Engine (replaces $2,500/mo Paragon)
- **100+ pre-seeded integrations** across 19 categories
- **Any API in minutes**: Paste an API docs URL → AI reads docs and generates tool definitions → agents can call that API
- **Zero platform cost**: Self-hosted on Convex
- **Real API access**: Agents call actual APIs with OAuth, API keys, retry logic, rate limit handling

### Integration Categories (100 integrations)
CRM (11), File Storage (6), Document & Knowledge (6), Communication (7), Sales (9), Project Management (15), Support (8), Marketing (8), Office Suite (11), Analytics (6), Accounting (9), E-commerce (5), Advertising (5), E-Signature (4), Business Intelligence (8), Social Media (7), Payments (3), HR (10), Design (1)

### Agent Intelligence
- **Episodic Memory**: Agents remember API quirks, user preferences, patterns, and failures across sessions
- **SOUL File Evolution**: Accumulated memories distilled into permanent identity — agents genuinely improve over time
- **Mesh Learning**: Anonymized performance patterns improve all agents across all clients
- **Session Handoffs**: When a session ends, agents write a summary so the next picks up exactly where it left off

### Infrastructure
- **Private deployment**: Runs on hardware inside client's office or dedicated cloud instance
- **Hardware tiers**: NVIDIA Jetson Orin Nano ($249), Mac Mini M4 ($599), GPU server ($2-5K)
- **Security**: AES-256-GCM encryption, on-premises execution, complete audit logs, RBAC, HIPAA/GDPR ready, OAuth 2.0 + PKCE
- **Nodes form a mesh network**: Federated learning across clients without sharing private data

### Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind + shadcn/ui
- **Backend**: Convex (serverless, real-time DB, 43 tables, 100+ API endpoints)
- **Agent Runtime**: OpenClaw on AWS Lightsail (self-hosted)
- **LLM**: Claude (Anthropic)
- **Auth**: Clerk
- **Integrations**: 100+ pre-seeded, any API via doc scraper

---

## Use Cases (32 workflows across 10 departments)

### Sales
- Win back dead deals — weekly scan of closed-lost deals, 6 revival signals, personalized re-engagement
- Enrich leads & run outbound — enrichment, ICP scoring, personalized outreach
- CRM hygiene + activity logging — auto-sync calls/emails into CRM
- Pipeline hygiene + forecast — weekly deal audit with forecast narrative
- Dead pipeline revival sprint — 300+ deals analyzed in 4 hours

### Marketing
- Case study pipeline — auto-triggered on deal close + high NPS
- Competitive intel radar — weekly competitor monitoring with battle cards
- SEO content engine — keyword gap → full article → QA → publish
- Cross-channel marketing reports — pull all channels, verify numbers, write narrative
- Content repurposing — one blog post → 15 content assets across channels

### Customer Success
- Upsell signals — daily scan of usage, tickets, NPS for expansion signals
- QBR prep + health scores — auto-generated account narratives
- Customer onboarding orchestration — automated welcome + setup flows
- Support ticket triage & routing — classify, assign, draft replies

### E-commerce (DTC)
- Competitor price response — daily monitoring with counter-campaign ready in 60 min
- Inventory restock with demand forecasting — flag stockout risks before campaign spikes
- Review & UGC harvester — pull best quotes, push to product pages and ads
- Flash sale launch autopilot — live in under 60 minutes from trigger

### Agency
- Client reporting autopilot — saves 10-15 hrs per AM per week
- Client performance narrative — the "why" behind the numbers
- New client audit & strategy in 24 hrs — what takes a strategist 2 weeks

### Finance
- Month-end close prep — cross-reconcile all financial data, close 3-5 days faster
- Expense anomaly detection — catches 90%+ of policy violations

### Operations
- Vendor & contract renewal autopilot — saves $50-200K/yr in unnecessary renewals
- Meeting notes → action items → follow-up — completion rate +60-80%
- Cross-tool data sync + weekly ops report — 28+ metrics from 8 sources

### HR & People
- Performance review prep — data-backed first drafts, saves 320-640 hrs per cycle

### DevOps / Engineering
- Incident response autopilot — on-call wakes up to full context, MTTR -60%
- Release notes & changelog — auto-generated on every merge to main

### Legal & Compliance
- Regulatory change tracker — weekly monitoring with plain-English summaries
- Contract review & risk flagging — review time -70%

---

## Go-To-Market Strategy

### Primary focus: AI Business Transformation

**Why transformation leads:**
- Highest ticket ($15-50K+ per engagement)
- Pain is obvious and quantifiable (every company knows they overpay for fragmented tools)
- Deepest lock-in (once you rebuild someone's stack, they're not leaving)
- Compounding knowledge moat (every engagement teaches you another industry)
- Natural upsell path to AI Workers and AI Department on top

### Target industries (non-tech-native, operationally heavy, high buying power):
1. **Manufacturing & Industrial** — drowning in disconnected ERPs, spreadsheets, legacy software
2. **Real Estate & Construction** — run on WhatsApp and Excel, multiple disconnected departments
3. **Healthcare & Hospital Chains** — 100+ software systems per hospital, compliance requirements
4. **Logistics & Supply Chain** — legacy TMS/WMS, massive stakeholder coordination
5. **FMCG / Consumer Goods** — huge distribution networks, HQ-to-field tech gap
6. **Professional Services** — accounting firms, law firms, staffing agencies with manual ops

### Target company profile:
- $50M-$5B revenue — have buying power
- Not tech-native — no army of engineers who'd say "we'll build it"
- Operationally heavy — lots of departments, lots of processes, lots of SaaS
- Decision-makers are business people (COO, VP Ops, MD), not CTOs

### Geographic focus:
- **India** — can meet in person, local trust advantage
- **US & Europe** — highest buying power, most SaaS spending

### Sales motion:
- AI Workers = quick revenue entry point ($499/mo, 1-2 week close)
- AI Department = mid-tier once trust is established ($3-10K/mo)
- AI Transformation = whale pursuit in parallel ($15-50K+, deepest engagement)

### Positioning:
- Not a software company — an AI staffing & transformation company
- Not selling tools — selling outcomes (the work getting done)
- Compete on private infrastructure, customization, and the staffing model
- Position pricing against what they currently spend on humans/contractors/agencies, not against other AI tools

---

## The Moat Stack

1. **Physical network** — private Nodes inside client offices, years to replicate
2. **Federated learning / mesh network effect** — each new client improves all AI workers
3. **SOUL evolution per client** — months of accumulated business-specific intelligence
4. **Integration depth** — deeply wired into each client's Slack, CRM, email, tools
5. **Staffing metaphor** — psychological switching cost ("fire your AI team" ≠ "cancel software")
6. **Operational data moat** — largest dataset on AI worker performance across industries
7. **Transformation lock-in** — once you've rebuilt someone's infrastructure, they can't leave

---

## Revenue Model

| Tier | Price | Description |
|------|-------|-------------|
| AI Worker | $500-1,500/mo per worker | Individual roles, plug into existing tools |
| AI Department | $3,000-10,000/mo | Full squad running a business function |
| AI Transformation | $15,000-50,000+ | Complete tech stack rebuild + ongoing management |
| Agency White-Label | 30%+ margin | Agencies sell our AI under their brand |

**Unit economics:**
- Cost per AI worker: ~$100-300/mo (API calls + hardware amortization + management time)
- Revenue per AI worker: $500-1,500/mo
- Margin: 60-80%

---

## Agency Partner Program

Agencies sell the service under their brand. We run the AI backend.
- Agency pitches AI workers to their clients
- We deploy & manage the Nodes + AI workforce
- Client sees the agency's brand on dashboard, reports, hardware
- Agency sets the price, keeps the margin, we do the work
- 30%+ margin per deployment, 5-20x workers per agency deal, 48hr deployment per client

---

## Fundraising

Raising $750K at $4.5M pre-money valuation.

**Investor pitch (one paragraph):**
"For every $1 spent on software, $6 are spent on services. The global staffing and BPO industries represent nearly $1 trillion. Valence AI deploys AI workers — not chatbots, not tools — autonomous AI employees running on physical Nodes inside companies. Each Node is part of a mesh network where AI workers improve through federated learning. Our 500th client's AI bookkeeper is dramatically better than our first, because it learned from 499 others. Today we're an AI staffing company with 70-80% margins. Tomorrow we're the protocol layer for the agent-to-agent economy — the Visa of AI labor."

---

## Current Status (March 2026)

- **Product**: Live, production-ready
- **Website**: usevalence.ai — 3-tab landing page (AI Department, AI Workers, AI Transformation)
- **Tested Integrations**: GitHub, Slack, Jira, Gmail, HubSpot, Notion, Google Sheets, Google Calendar, Google Analytics, Twitter (read-only)
- **Integration Catalog**: 100 blueprints across 19 categories
- **Stress Tests**: All 6/6 tasks approved in latest stress test
- **Pages**: 30+ routes (Kanban, Missions, Autopilot, War Room, Analytics, Memory Bank, Integrations, Billing, etc.)
- **Database**: 43 tables, 13 cron jobs running
- **Agents**: 5 active, coordinating autonomously with memory and quality loops
- **In talks**: Ministry of Commerce & Industry (Government of India) for AI transformation

---

## Key Proof Points

- Replaced $2,500/month Paragon with custom integration engine at $0
- 100 integration blueprints across 19 categories
- Agents successfully coordinate multi-step missions with dependency chains
- Quality loop works: Sentinel rejected Forge's work for missing analytics call → Forge fixed and resubmitted → approved on iteration 2
- Agent memory persists across sessions — agents don't repeat mistakes
- SOUL file evolution means agents genuinely improve their judgment over time
- Full product built solo by founder (frontend, backend, agent system, integration engine, deployment, agent personalities)

---

## Founder

**Arpit Dhamija** — Solo founder and full-stack engineer. Built the entire platform single-handedly. Based in India, serving clients globally.

Contact: arpit@valenceai.co | [Calendly](https://calendly.com/arpitdhamija-ai/30min)

---

*This is a condensed context file. For full technical documentation, see the codebase and CLAUDE.md.*
