# Vercel for Agents — MVP Spec

**Author:** Forge 🔨  
**Date:** 2026-02-09  
**Version:** v0.1 Draft  
**Related Task:** jn7833jgb8reh7hb64gfrtpnws80tk7r

---

## Executive Summary

A simple deployment platform for AI agents. Deploy from GitHub in 60 seconds, get a URL, logs, and cron scheduling. No vendor lock-in — works with any agent framework or none.

**Positioning:** "Vercel for Agents" — the easiest way to run AI agents in production.

**Target:** $29-299/mo subscription product  
**MVP Time to Market:** 6-8 weeks  
**Stack:** Node.js + Fly.io/Railway + PostgreSQL + Temporal

---

## 1. The Gap (Why This Matters)

### Current Landscape

| Player | Focus | Limitation |
|--------|-------|------------|
| **LangChain/LangGraph** | Framework + platform | Complex, steep learning curve, tied to LangChain |
| **CrewAI** | Enterprise multi-agent | Enterprise-focused, no simple indie option |
| **AgentOps** | Observability | Monitoring only, no deployment |
| **E2B** | Sandboxes | Execution only, not full hosting |
| **OpenAI Assistants** | OpenAI agents | Vendor lock-in, limited control |

### The Gap

**Everyone builds frameworks.** Nobody nails simple deployment.

A developer today who wants to run an AI agent has to:
1. Build the agent (fine, many options)
2. Containerize it (annoying)
3. Set up hosting (Railway? Fly? AWS Lambda?)
4. Configure cron/scheduling (manual)
5. Set up logging (separate service)
6. Monitor for errors (another tool)
7. Handle secrets (yet another thing)

**We collapse steps 2-7 into one command.**

---

## 2. Core UX

### The 60-Second Deploy Experience

```bash
# From existing agent repo
npx agenthost init
# Creates agenthost.toml with sensible defaults

npx agenthost deploy
# → Deploying your-agent-name...
# → Building from GitHub: github.com/you/your-agent
# → Setting up environment...
# → ✓ Deployed: https://your-agent.agenthost.run
# → Logs: https://agenthost.run/dashboard/your-agent/logs
```

### Alternative: Pure GitHub Flow

```yaml
# .github/workflows/agenthost.yml (auto-generated)
name: Deploy to AgentHost
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: agenthost/deploy-action@v1
        with:
          token: ${{ secrets.AGENTHOST_TOKEN }}
```

### Configuration: agenthost.toml

```toml
[agent]
name = "crypto-regulatory-tracker"
runtime = "node"  # node | python | docker
entry = "src/index.ts"

[env]
# Values from dashboard secrets
ANTHROPIC_API_KEY = "${ANTHROPIC_API_KEY}"
SUPABASE_URL = "${SUPABASE_URL}"

[schedule]
# Cron expressions
scrape = "0 */6 * * *"      # Every 6 hours
report = "0 18 * * 5"       # Friday 6pm UTC

[triggers]
# HTTP endpoints auto-generated
webhook = true              # POST /webhook
http = true                 # GET/POST /run

[resources]
memory = "512mb"            # 256mb | 512mb | 1gb | 2gb
timeout = "5m"              # Max execution time
```

### Dashboard

Simple, focused:

```
┌─────────────────────────────────────────────────────────┐
│  AgentHost                              [Your Agents ▼] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  crypto-regulatory-tracker          ● Running            │
│  ─────────────────────────────────                      │
│                                                          │
│  [Logs]  [Runs]  [Settings]  [Secrets]                  │
│                                                          │
│  Recent Runs                                             │
│  ├─ Feb 9, 13:00 — scrape — ✓ 4.2s                     │
│  ├─ Feb 9, 07:00 — scrape — ✓ 3.8s                     │
│  └─ Feb 9, 01:00 — scrape — ✓ 4.1s                     │
│                                                          │
│  Quick Actions                                           │
│  [▶ Run Now]  [⏸ Pause]  [🔄 Redeploy]                  │
│                                                          │
│  URL: https://crypto-tracker.agenthost.run               │
│  Webhook: POST https://crypto-tracker.agenthost.run/hook │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Minimal Feature Set (MVP)

### P0 — Must Have

| Feature | Description |
|---------|-------------|
| **GitHub Deploy** | Connect repo, auto-deploy on push |
| **Secrets** | Encrypted env vars (API keys, tokens) |
| **Cron Scheduling** | Run agent on schedule (cron syntax) |
| **HTTP Triggers** | Webhook endpoint to trigger runs |
| **Logs** | Real-time logs with 7-day retention |
| **Run History** | Last 100 runs with status/duration |

### P1 — Should Have (Week 2-3)

| Feature | Description |
|---------|-------------|
| **Multiple Agents** | Up to 5 agents per account |
| **Branch Deploys** | Preview deploys for PRs |
| **Alerts** | Email on failure |
| **Usage Metrics** | Run count, execution time |
| **CLI** | `agenthost logs -f`, `agenthost run` |

### P2 — Nice to Have (Post-MVP)

| Feature | Description |
|---------|-------------|
| **Teams** | Multiple users per account |
| **Custom Domains** | your-agent.yourdomain.com |
| **Persistent Storage** | SQLite/key-value per agent |
| **Agent-to-Agent** | Call other agents via SDK |
| **Marketplace** | Deploy community agents |

### Explicit Non-Goals (MVP)

- No visual agent builder (code-first)
- No multi-step workflow orchestration (use Temporal if needed)
- No built-in LLM proxy (bring your own API keys)
- No agent framework (framework-agnostic)

---

## 4. Tech Stack

### Architecture

```
                    ┌──────────────────┐
                    │    Dashboard     │
                    │  (Next.js/Vercel)│
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   API Gateway    │
                    │ (Node.js/Fastify)│
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
│   Scheduler   │   │   Builder     │   │   Runner      │
│  (Temporal)   │   │  (Docker/OCI) │   │  (Fly.io)     │
└───────────────┘   └───────────────┘   └───────────────┘
                             │
                    ┌────────▼─────────┐
                    │    PostgreSQL    │
                    │  (Supabase/Neon) │
                    └──────────────────┘
```

### Component Choices

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Dashboard** | Next.js on Vercel | Fast, Arpit knows it, free hosting |
| **API** | Node.js + Fastify | Low latency, familiar |
| **Database** | PostgreSQL (Supabase) | Familiar, real-time, auth built-in |
| **Scheduler** | Temporal.io | Reliable, handles retries, scales |
| **Builder** | Docker + Buildpacks | Language-agnostic, OCI standard |
| **Runner** | Fly.io Machines | Fast cold starts, per-second billing |
| **Logs** | Axiom or Loki | Structured logs, good free tier |
| **Secrets** | Doppler or Vault | Encrypted, team-friendly |

### Why Fly.io for Runners?

- **Fast cold starts:** <500ms for Node.js
- **Per-second billing:** Only pay while running
- **Machines API:** Programmatic control
- **Global regions:** Run agents near users
- **Exit cheaper:** Easy to migrate if needed

### Alternative: Railway

- Simpler but less control
- Good for MVP, may outgrow it
- Consider for faster launch

---

## 5. Business Model

### Pricing Tiers

| Tier | Price | Included | Target |
|------|-------|----------|--------|
| **Hobby** | $0 | 1 agent, 1K runs/mo, 7-day logs | Tinkerers |
| **Pro** | $29/mo | 5 agents, 10K runs/mo, 30-day logs | Indie hackers |
| **Team** | $99/mo | 20 agents, 50K runs/mo, 90-day logs, 3 seats | Startups |
| **Enterprise** | $299+/mo | Unlimited, custom, SLA, SSO | Companies |

### Unit Economics

| Metric | Estimate |
|--------|----------|
| **Cost per run** | ~$0.001-0.005 (Fly.io compute) |
| **Margin at Pro** | ~90%+ (runs are cheap) |
| **Break-even** | ~100 Pro users ($2,900 MRR) |

### Revenue Levers

1. **Usage overages:** $0.01/run above tier
2. **Add-ons:** Custom domains ($5/mo), extra storage ($10/mo)
3. **Enterprise:** Custom pricing, dedicated support
4. **Marketplace cut:** 20% on paid community agents (future)

---

## 6. Target Users

### Primary: Indie Hackers & Solo Devs

- Building AI-powered side projects
- Don't want to manage infrastructure
- Price-sensitive, need free tier
- Active on Twitter, Indie Hackers, HN

**Example:** "I built a Twitter bot with GPT-4, need somewhere to run it"

### Secondary: Startup Engineers

- Running internal AI agents (support, ops)
- Need reliability, not enterprise features
- Team access, basic monitoring

**Example:** "We have 3 agents for customer support automation"

### Tertiary: AI Tool Builders

- Publishing agents for others to use
- Need hosting + distribution
- Marketplace potential

**Example:** "I built an agent that analyzes legal docs, want to sell access"

### Anti-Target (Not MVP)

- Enterprise compliance teams (need SOC2, HIPAA)
- ML engineers training models (wrong product)
- No-code users wanting visual builders

---

## 7. Competitive Positioning

### vs LangChain/LangGraph Platform

| Aspect | LangGraph Platform | AgentHost |
|--------|-------------------|-----------|
| **Framework** | Requires LangGraph | Any or none |
| **Complexity** | High | Low |
| **Pricing** | Enterprise focus | Indie-friendly |
| **Learning curve** | Weeks | Minutes |

**Positioning:** "LangChain for orchestration, AgentHost for deployment"

### vs CrewAI Enterprise

| Aspect | CrewAI | AgentHost |
|--------|--------|-----------|
| **Focus** | Multi-agent enterprise | Simple single-agent |
| **Price** | $$$$ | $29+ |
| **Builder** | Visual + code | Code-first |
| **Lock-in** | CrewAI framework | None |

**Positioning:** "CrewAI for enterprise orchestration, AgentHost for simple deployment"

### vs Running Your Own (Railway/Fly)

| Aspect | DIY | AgentHost |
|--------|-----|-----------|
| **Setup time** | Hours | Minutes |
| **Scheduling** | Manual | Built-in |
| **Logs** | Separate service | Built-in |
| **Secrets** | Manual | Built-in |
| **Cost** | Lower floor, higher ceiling | Fixed, predictable |

**Positioning:** "Skip the yak-shaving, deploy your agent now"

---

## 8. MVP Implementation Plan

### Week 1-2: Foundation

- [ ] GitHub OAuth + repo connection
- [ ] `agenthost.toml` parser
- [ ] Basic dashboard (list agents, view logs)
- [ ] PostgreSQL schema (agents, runs, logs)
- [ ] Secrets storage (encrypted at rest)

### Week 3-4: Deploy Pipeline

- [ ] Docker/OCI build system
- [ ] Fly.io Machines integration
- [ ] Deploy on push (GitHub webhook)
- [ ] HTTP trigger endpoint
- [ ] Real-time log streaming

### Week 5-6: Scheduling & Polish

- [ ] Cron scheduling (Temporal)
- [ ] Run history & status
- [ ] Error alerts (email)
- [ ] CLI tool (`agenthost`)
- [ ] Landing page + docs

### Week 7-8: Launch

- [ ] Stripe billing integration
- [ ] Usage metering
- [ ] Public beta announcement
- [ ] Onboard first 50 users
- [ ] Iterate on feedback

---

## 9. Cost Estimate (MVP Build)

| Item | Monthly Cost |
|------|-------------|
| Vercel (dashboard) | $0 (free tier) |
| Supabase (database) | $25 |
| Fly.io (runners, dev) | $20 |
| Temporal Cloud | $0 (free tier to start) |
| Axiom (logs) | $0 (free tier) |
| Domain | $15/year |
| **Total** | **~$50/mo during build** |

At scale (1000 users):
- Supabase Pro: $25
- Fly.io: $200-500 (usage-based)
- Temporal: $100+
- Axiom: $25+
- **Total:** ~$500-1000/mo (easily covered by 50 Pro users)

---

## 10. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| **Fly.io pricing changes** | Medium | Abstract runner, easy to swap |
| **Security incident** | Medium | Sandboxed execution, no cross-agent access |
| **LangChain launches same thing** | High | Move faster, focus on simplicity |
| **Slow cold starts** | Medium | Warm pools, optimize builds |
| **Support burden** | High | Self-serve docs, community Discord |

---

## 11. Success Metrics

### MVP Launch (Month 2)

- [ ] 50 agents deployed
- [ ] 10 paying users
- [ ] <3s deploy time
- [ ] 99.5% uptime

### Month 6

- [ ] 500 agents
- [ ] 100 paying users ($5K MRR)
- [ ] 3 community templates
- [ ] Featured on HN/PH

### Month 12

- [ ] 2000 agents
- [ ] 500 paying users ($20K MRR)
- [ ] Marketplace launched
- [ ] Series Seed consideration

---

## 12. Open Questions

1. **Name:** AgentHost? AgentDeploy? Agentry? LaunchAgent?
2. **Differentiator:** What's the one thing we do 10x better?
3. **First launch channel:** HN? Twitter? Indie Hackers?
4. **Build vs buy Temporal:** Self-host or cloud?
5. **Runner isolation:** Fly Machines vs Firecracker?

---

## 13. Recommendation

**Build it.**

- Gap is real (research confirmed)
- Technical bar is achievable (6-8 weeks)
- Market timing is good (agents exploding, infra lagging)
- Fits Arpit's background (3M QPS infra experience)
- Complements Agent DevTools (deploy what you build)

**Next step:** Validate demand. Build landing page, collect signups, see if anyone cares before writing code.

---

## Appendix: Sample agenthost.toml Files

### Simple Python Agent

```toml
[agent]
name = "gpt-summarizer"
runtime = "python"
entry = "main.py"

[env]
OPENAI_API_KEY = "${OPENAI_API_KEY}"

[triggers]
http = true
```

### Node.js Scheduled Agent

```toml
[agent]
name = "twitter-poster"
runtime = "node"
entry = "src/index.ts"

[env]
TWITTER_API_KEY = "${TWITTER_API_KEY}"
ANTHROPIC_API_KEY = "${ANTHROPIC_API_KEY}"

[schedule]
post = "0 9,12,18 * * *"  # 9am, noon, 6pm

[resources]
memory = "256mb"
timeout = "2m"
```

### Docker Agent (Custom)

```toml
[agent]
name = "custom-ml-agent"
runtime = "docker"
dockerfile = "Dockerfile"

[env]
MODEL_PATH = "/models/llama-7b"

[resources]
memory = "2gb"
timeout = "10m"
```

---

**Ready to validate on approval.** 🔨
