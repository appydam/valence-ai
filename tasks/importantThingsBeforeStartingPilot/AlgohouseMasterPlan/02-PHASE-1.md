# Phase 1: Smoke Tests (Week 1)

**Goal**: Each agent completes one real task using one integration. Proves the full chain: task creation → wakeup → heartbeat → work → API call → deliverable → QA review.

**Prerequisites**: Phase 0 complete (all fixes deployed, 6 integrations connected).

---

## Mission 1.1 — Scout + Notion: "QuantXData Competitor Research"

| Field | Value |
|-------|-------|
| **Agent** | Scout |
| **Integration** | Notion (`create_page`) |
| **Priority** | High |

**Task Description**:
> Research the top 5 competitors of QuantXData (formerly AlgoHouse) — a crypto market data provider with 120+ exchanges, real-time tick data, OHLCV, order books, and options data. Competitors: Kaiko, CCData (formerly CryptoCompare), Amber Data, CoinGecko, Messari.
>
> For each competitor: what they offer, pricing model, data coverage (how many exchanges), delivery methods (API/streaming/S3), key differentiators.
>
> Include: 3 specific opportunities where QuantXData could differentiate (hint: MCP server, pay-as-you-go pricing, AI-ready data feeds).
>
> Post the full analysis to Notion via `notion/create_page`, THEN post deliverable to Mission Control.

**Success Criteria**:
- [ ] Scout wakes, heartbeats, claims task, moves to `in_progress`
- [ ] Scout uses `web_fetch` (not broken `web_search`) to research
- [ ] Scout calls `notion/create_page` successfully (check `integrationActivity`)
- [ ] Real Notion page exists with structured analysis
- [ ] Sentinel wakes via webhook (not 15-min cron), reviews, approves (≥7/10)
- [ ] Task reaches `done` status
- [ ] Total time: under 30 minutes
- [ ] Zero session crashes

**If It Fails**:
- Scout crashes: Check `/home/ubuntu/.openclaw/agents/scout/sessions/` for bloated .jsonl. Run watchdog.
- Notion fails: Check connection status. Verify OAuth token. Check `integrationActivity` for error.
- Scout writes to file: Verify SOUL.md synced to server (rsync).
- Sentinel doesn't wake: Confirm Fix 0 deployed on server.

---

## Mission 1.2 — Ghost + Slack: "LinkedIn Post Drafts for QuantXData"

| Field | Value |
|-------|-------|
| **Agent** | Ghost |
| **Integration** | Slack (`send_message`) |
| **Priority** | Medium |

**Task Description**:
> Write 3 LinkedIn posts (150-300 words each) for Arpit positioning QuantXData in the crypto data market. Angles:
>
> 1. How AI agents can automate data quality checks across 120+ crypto exchanges
> 2. Why standardized crypto data feeds are the "boring but essential" infrastructure for trading firms
> 3. Pay-as-you-go crypto data — why it's the future vs. expensive enterprise contracts (reference Kaiko/CCData pricing)
>
> Post all 3 drafts to Slack (any available channel) for team review via `slack/send_message`.

**Success Criteria**:
- [ ] Ghost produces 3 distinct, ready-to-post LinkedIn drafts
- [ ] Slack message delivered (check `integrationActivity`)
- [ ] Content references QuantXData specifically (not generic AI content)
- [ ] Sentinel approves quality ≥7/10
- [ ] Total time: under 25 minutes

**If It Fails**:
- Slack "not_authed": Check OAuth token, verify scopes include `chat:write`. Call `list_channels` first.
- Content quality poor: Add QuantXData context to task description (120 exchanges, real-time, full tick data).

---

## Mission 1.3 — Forge + GitHub: "QuantXData Landing Page Scaffold"

| Field | Value |
|-------|-------|
| **Agent** | Forge |
| **Integration** | GitHub (via `gh` CLI) |
| **Priority** | High |

**Task Description**:
> Create a modern Next.js + Tailwind landing page scaffold for QuantXData (crypto market data provider, formerly AlgoHouse). Push to `arpitdhamija/quantxdata-landing`.
>
> Sections:
> 1. Hero: "Institutional-Grade Crypto Market Data" — 120+ exchanges, real-time tick data
> 2. Data Products: Trades, Order Books, OHLCV, Options Greeks, Streaming
> 3. Delivery Methods: REST API, WebSocket streaming, S3 bulk, Hosted DB
> 4. Use Cases: Algorithmic Trading, Research & Analytics, Portfolio Management, Risk
> 5. Pricing: Pay-as-you-go model (our differentiator)
> 6. Contact/CTA
>
> Keep it MVP — clean, fast, no complex interactivity. Include README with setup instructions.

**Success Criteria**:
- [ ] Repo `arpitdhamija/quantxdata-landing` exists on GitHub
- [ ] `npm run dev` works
- [ ] Forge stays within turn limits (hard stop at 15)
- [ ] No session crash
- [ ] Sentinel reviews code quality ≥7/10
- [ ] Total time: under 30 minutes

**If It Fails**:
- Session crash (most likely): Reduce `sessionMaxTurns` to 15. Simplify task to "Hero + Products + CTA only."
- Git auth fails: Verify `gh auth status` on server.

---

## Mission 1.4 — Kaze + Google Sheets: "Pilot Tracker"

| Field | Value |
|-------|-------|
| **Agent** | Kaze |
| **Integration** | Google Sheets (`create_spreadsheet`, `append_values`) |
| **Priority** | Medium |

**Task Description**:
> Create a Google Sheet "QuantXData — AlgoHouse Pilot Tracker" with two tabs:
>
> Tab 1 — "Mission Log": Columns: Mission ID, Name, Agent, Integration, Status, Time, Issues, Notes
> Tab 2 — "Decisions Pending": Columns: Item, Owner, Status, Due Date, Notes
>
> Add rows for Missions 1.1-1.3 in Tab 1. Add pending decisions in Tab 2: "Backend API access from Andrei", "Arpit email on quantxdata.ai", "MCP server status check", "QuantXData brand identity".

**Success Criteria**:
- [ ] Real Google Sheet exists with structured data
- [ ] Both tabs created with correct columns
- [ ] Google Sheets OAuth works end-to-end
- [ ] Total time: under 15 minutes

**If It Fails**:
- OAuth not connected: Complete Phase 0 Fix 3 first.
- Kaze delegates: Add "Do this yourself, do not delegate" to description.

---

## Phase 1 Summary

| Mission | Agent | Integration | Status |
|---------|-------|-------------|--------|
| 1.1 Competitor Research | Scout | Notion | [ ] |
| 1.2 LinkedIn Drafts | Ghost | Slack | [ ] |
| 1.3 Landing Page Scaffold | Forge | GitHub | [ ] |
| 1.4 Pilot Tracker | Kaze | Google Sheets | [ ] |

**Phase 1 Complete When**:
- [ ] 4/4 missions complete without manual intervention
- [ ] 3 integration calls succeed (Notion, Slack, Google Sheets)
- [ ] 1 GitHub push succeeds
- [ ] Sentinel reviews all tasks via immediate webhook
- [ ] Zero session recovery spam
- [ ] All deliverables visible in Mission Control dashboard

**Demo to Praveen**: "Scout researched QuantXData's competitors, posted structured analysis to Notion, got QA-reviewed by Sentinel — 20 minutes, zero human involvement. Here's the Notion page."
