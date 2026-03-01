# Phase 6: MCP Server + Pay-As-You-Go (Week 6-8)

**Goal**: Build the differentiation play Praveen described — expose QuantXData via MCP server for AI agents, and launch pay-as-you-go pricing. This is what makes QuantXData different from Kaiko/CCData.

**Prerequisites**: Phase 3 complete (website live). Backend API access from Andrei (credentials + infra docs). Praveen confirms if MCP server already exists.

---

## Context

Praveen said:
> "We should make it available via pay as you go and expose via MCP server. Maybe it was done already. I will need to check. A way to differentiate."

**Why this matters**: Kaiko/CCData sell expensive enterprise contracts. QuantXData can capture the long tail — indie quants, small funds, AI agent builders — with:
1. **Pay-as-you-go**: No commitment, pay per API call
2. **MCP server**: AI agents (Claude, GPT, etc.) can directly query crypto data via tool use
3. **AI-ready data**: Pre-formatted for LLM consumption, not just raw CSV

---

## Pending from Praveen

- [ ] Check if MCP server already built (in existing backend infra)
- [ ] Get backend API access for Arpit (from Andrei)
- [ ] API credentials (HMAC signing key, signer email)
- [ ] Decision: pricing tiers (calls/month, cost per call)

---

## Part A: MCP Server

### What is an MCP Server?
Model Context Protocol (MCP) lets AI assistants (Claude, etc.) call external tools. An MCP server exposes QuantXData's API as tools that AI agents can use directly.

### Task 6.1 — Scout: Research MCP Server Landscape
| Field | Value |
|-------|-------|
| **Agent** | Scout |
| **Integration** | Notion |
| **Description** | Research: (1) How existing crypto data providers expose MCP servers (if any), (2) Popular MCP server implementations (Anthropic's spec, community servers), (3) What data tools AI agents actually need (price lookups, historical data, portfolio analysis). Post findings to Notion. |
- [ ] Complete

### Task 6.2 — Forge: Build MCP Server
| Field | Value |
|-------|-------|
| **Agent** | Forge |
| **Depends On** | Task 6.1, Backend API access |
| **Integration** | GitHub |
| **Description** | Build an MCP server that wraps QuantXData's API endpoints as MCP tools. Tools to expose: (1) `get_instruments` — list all exchanges + pairs, (2) `get_trades` — historical trades, (3) `get_ohlcv` — candle data (daily/hourly/minute), (4) `get_orderbook` — L1 top-of-book + L2 snapshot, (5) `get_options` — options Greeks + quotes, (6) `stream_realtime` — real-time trade stream. Handle HMAC auth internally. Push to `arpitdhamija/quantxdata-mcp`. |
- [ ] Complete

### Task 6.3 — Forge: MCP Server Documentation
| Field | Value |
|-------|-------|
| **Agent** | Forge |
| **Depends On** | Task 6.2 |
| **Integration** | GitHub |
| **Description** | Write comprehensive MCP server docs: installation (npm/npx), configuration (API key setup), available tools with parameters and examples, Claude Desktop integration guide. Add to repo README. |
- [ ] Complete

### Task 6.4 — Ghost: MCP Launch Content
| Field | Value |
|-------|-------|
| **Agent** | Ghost |
| **Depends On** | Task 6.3 |
| **Integration** | Notion, Slack |
| **Description** | Write launch content for MCP server: (1) Blog post "Query Crypto Market Data with Claude — QuantXData MCP Server", (2) Twitter thread announcing MCP server, (3) LinkedIn post targeting AI developers. Angle: "First crypto data provider with native MCP support — ask Claude about Bitcoin price history." |
- [ ] Complete

---

## Part B: Pay-As-You-Go Pricing

### Task 6.5 — Scout: Competitor Pricing Research
| Field | Value |
|-------|-------|
| **Agent** | Scout |
| **Integration** | Notion |
| **Description** | Deep research on competitor pricing: (1) Kaiko — enterprise plans, reported pricing, (2) CCData — tiered plans, API call limits, (3) Amber Data — pricing model, (4) CoinGecko API — free tier + paid, (5) CryptoCompare legacy — current pricing. Find: price per API call, monthly minimums, what's included in free tiers. Post to Notion. |
- [ ] Complete

### Task 6.6 — Kaze: Design Pricing Tiers
| Field | Value |
|-------|-------|
| **Agent** | Kaze |
| **Depends On** | Task 6.5 |
| **Integration** | Notion, Google Sheets |
| **Description** | Based on Scout's pricing research, design QuantXData's pay-as-you-go pricing tiers. Consider: (1) Free tier (X calls/month, delayed data), (2) Starter (Y calls/month, real-time, $Z/month), (3) Pro (unlimited, all features, $Z/month), (4) Enterprise (custom, SLA, dedicated support). Create pricing comparison table vs competitors. Post to Notion and Sheets. |
- [ ] Complete

### Task 6.7 — Forge: Implement Pricing Page
| Field | Value |
|-------|-------|
| **Agent** | Forge |
| **Depends On** | Task 6.6 |
| **Integration** | GitHub |
| **Description** | Update the QuantXData website pricing page with the finalized tiers. Add: tier comparison table, API call calculator ("estimate your monthly cost"), FAQ section (billing, overage, enterprise contact). Include Stripe checkout integration (or "Contact Sales" for enterprise). Push to GitHub. |
- [ ] Complete

### Task 6.8 — Forge: API Key Management
| Field | Value |
|-------|-------|
| **Agent** | Forge |
| **Depends On** | Backend API access |
| **Integration** | GitHub |
| **Description** | Build a simple dashboard page on quantxdata.ai where users can: (1) Sign up, (2) Get an API key, (3) See usage stats, (4) Manage billing. This is the self-serve component that enables pay-as-you-go. Use Clerk or similar for auth, Stripe for billing. |
- [ ] Complete

---

## Part C: Launch & Distribution

### Task 6.9 — Ghost: Product Hunt / Hacker News Launch
| Field | Value |
|-------|-------|
| **Agent** | Ghost |
| **Integration** | Notion |
| **Description** | Write launch copy for: (1) Product Hunt listing — tagline, description, maker comment, (2) Hacker News "Show HN" post, (3) Reddit r/cryptocurrency and r/algotrading posts. Focus: pay-as-you-go + MCP server as key differentiators. Store all drafts in Notion. |
- [ ] Complete

### Task 6.10 — Kaze: Launch Coordination
| Field | Value |
|-------|-------|
| **Agent** | Kaze |
| **Depends On** | Tasks 6.4, 6.7, 6.9 |
| **Integration** | Google Sheets, Slack, Google Calendar |
| **Description** | Create a launch day checklist in Google Sheets. Schedule launch events in Google Calendar. Post launch plan to Slack. Coordinate timing: website pricing page live → MCP server published to npm → Product Hunt listing → social media posts → Hacker News post. |
- [ ] Complete

---

## Phase 6 Summary

| Task | Agent | Integration | Status |
|------|-------|-------------|--------|
| 6.1 MCP Research | Scout | Notion | [ ] |
| 6.2 Build MCP Server | Forge | GitHub | [ ] |
| 6.3 MCP Docs | Forge | GitHub | [ ] |
| 6.4 MCP Launch Content | Ghost | Notion, Slack | [ ] |
| 6.5 Competitor Pricing Research | Scout | Notion | [ ] |
| 6.6 Design Pricing Tiers | Kaze | Notion, Sheets | [ ] |
| 6.7 Implement Pricing Page | Forge | GitHub | [ ] |
| 6.8 API Key Management | Forge | GitHub | [ ] |
| 6.9 Launch Copy | Ghost | Notion | [ ] |
| 6.10 Launch Coordination | Kaze | Sheets, Slack, Calendar | [ ] |

**Phase 6 Complete When**:
- [ ] MCP server published and documented
- [ ] Pay-as-you-go pricing live on website
- [ ] Self-serve API key signup works
- [ ] Launch content ready for all channels
- [ ] Launch day coordinated and scheduled

**Demo to Praveen**: "QuantXData now has pay-as-you-go pricing AND an MCP server — first crypto data provider with native AI agent support. Users can sign up, get an API key, and start querying in minutes. Here's the Product Hunt listing, the Hacker News post, and the pricing calculator. All built and coordinated by Mission Control agents."

---

## What Comes After Phase 6

Once all phases are complete, the ongoing operational cadence is:

| Frequency | Activity | Agents |
|-----------|----------|--------|
| **Weekly** | Sales sprint (10 new leads, outreach) | Scout, Ghost, Kaze |
| **Weekly** | Content sprint (3 LinkedIn, 1 blog, 1 newsletter) | Scout, Ghost, Sentinel |
| **Daily** | Response management (follow-ups, demo prep) | Kaze, Scout, Ghost |
| **Monthly** | Performance review (metrics, pipeline, content engagement) | Kaze |
| **Ongoing** | Website updates, MCP server improvements | Forge |

This is the steady state that proves Mission Control works — and the evidence Praveen needs to greenlight the Solidus enterprise pilot.
