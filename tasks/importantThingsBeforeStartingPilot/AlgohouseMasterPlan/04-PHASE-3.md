# Phase 3: QuantXData Website Rebrand (Week 3-4)

**Goal**: Ship a modern website on quantxdata.ai that replaces the old Flask/jQuery AlgoHouse site.

**Prerequisites**: Phase 2 complete. GitHub, Notion, Slack integrations working. Forge proven reliable at page-level tasks.

---

## Context

**Current state**: AlgoHouse site is Flask + jQuery + Jinja2 templates. Served by Waitress on port 8090 behind Docker. Minimal interactivity, no modern framework.

**Decision needed from Praveen**: Full rebuild in Next.js (from Mission 1.3 scaffold) or quick reskin of existing Flask app?

**Recommendation**: Full rebuild in Next.js + Tailwind. The Flask app is too outdated to reskin effectively, and a modern stack gives us SEO, performance, and future extensibility (e.g., embedding an API playground, MCP server docs).

---

## Pre-Requisites (Human Tasks)

- [ ] **Arpit's email created**: `arpit@quantxdata.ai` (for cold outreach headers, about page)
- [ ] **Brand decisions**: Logo (even a text logo), primary color, tagline
  - Suggestion: Dark theme (crypto standard), blue/green accent, tagline: "Institutional-Grade Crypto Data. Pay As You Go."
- [ ] **Domain DNS**: Point quantxdata.ai to hosting (Vercel, or current infra)
- [ ] **Backend API**: Confirm if api.algohouse.ai will become api.quantxdata.ai or stay as-is
- [ ] **API credentials from Andrei**: So website can show live data demos

---

## Website Pages (One Forge Task Per Page)

Each task is scoped to ONE page so Forge stays within turn limits. Push to GitHub after each. Run sequentially or in parallel (one page per Forge session).

### Task 3.1 — Scout: Research & Content Brief
| Field | Value |
|-------|-------|
| **Agent** | Scout |
| **Integration** | Notion |
| **Description** | Research Kaiko.com, ccdata.io, amberdata.io websites. Analyze: page structure, messaging, CTAs, data visualization, pricing presentation. Create a content brief in Notion with recommendations for each QuantXData page. |
- [ ] Complete

### Task 3.2 — Ghost: Write All Page Copy
| Field | Value |
|-------|-------|
| **Agent** | Ghost |
| **Depends On** | Task 3.1 |
| **Integration** | Notion |
| **Description** | Write copy for all website pages: Hero headline/subline, Products descriptions, Use Case scenarios, Pricing tiers (pay-as-you-go), About section, CTA text. Store all copy in a structured Notion page. Reference Scout's competitive research. |
- [ ] Complete

### Task 3.3 — Forge: Homepage
| Field | Value |
|-------|-------|
| **Agent** | Forge |
| **Depends On** | Task 3.2 |
| **Integration** | GitHub |
| **Description** | Build the homepage for quantxdata.ai using Next.js + Tailwind. Sections: Hero ("Institutional-Grade Crypto Data"), key metrics (120+ exchanges, real-time, full tick), featured products grid, social proof/trust section, CTA. Use Ghost's copy from Notion. Push to `arpitdhamija/quantxdata-landing`. |
- [ ] Complete

### Task 3.4 — Forge: Products/Data Page
| Field | Value |
|-------|-------|
| **Agent** | Forge |
| **Depends On** | Task 3.2 |
| **Integration** | GitHub |
| **Description** | Build the Products page. Sections: Trades data, Order Books (L1/L2), OHLCV Aggregated, Options Greeks, Multi-Exchange, Real-Time Streaming (SSE). For each: description, sample response format, supported exchanges. Use Ghost's copy. |
- [ ] Complete

### Task 3.5 — Forge: Pricing Page
| Field | Value |
|-------|-------|
| **Agent** | Forge |
| **Depends On** | Task 3.2 |
| **Integration** | GitHub |
| **Description** | Build the Pricing page. Model: Pay-as-you-go (our differentiator vs Kaiko/CCData enterprise contracts). Tiers: Free (limited calls), Starter ($X/mo), Pro ($X/mo), Enterprise (custom). Include API call calculator/estimator. |
- [ ] Complete

### Task 3.6 — Forge: API Documentation Page
| Field | Value |
|-------|-------|
| **Agent** | Forge |
| **Depends On** | Task 3.2 |
| **Integration** | GitHub |
| **Description** | Build an API Docs page listing all 12 endpoints with parameters, sample requests/responses. Endpoints: /instruments, /trades, /orderbooks, /trades_aggregated, /multi/trades, /option_quotes, /data/v2/histoday, /data/v2/histohour, /data/v2/histominute, /data/ob/l1/top, /data/v2/ob/l2/snapshot, /stream. Use code blocks with syntax highlighting. |
- [ ] Complete

### Task 3.7 — Forge: About / Contact Page
| Field | Value |
|-------|-------|
| **Agent** | Forge |
| **Depends On** | Task 3.2 |
| **Integration** | GitHub |
| **Description** | Build About page (team, mission, backed by AlgoHouse infrastructure) and Contact page (form that sends to sales@quantxdata.ai). Include Arpit's LinkedIn. |
- [ ] Complete

### Task 3.8 — Forge: Deploy to Vercel
| Field | Value |
|-------|-------|
| **Agent** | Forge |
| **Depends On** | Tasks 3.3-3.7 |
| **Integration** | GitHub |
| **Description** | Configure Vercel deployment for the quantxdata-landing repo. Add `vercel.json` if needed. Ensure all pages render correctly. Connect custom domain quantxdata.ai (Arpit will update DNS). |
- [ ] Complete

### Task 3.9 — Sentinel: Full QA Review
| Field | Value |
|-------|-------|
| **Agent** | Sentinel |
| **Depends On** | Task 3.8 |
| **Description** | Review the entire QuantXData website: all pages load, navigation works, copy is professional, responsive design, no broken links, CTA buttons work, forms submit. Score each page. |
- [ ] Complete

### Task 3.10 — Ghost: Launch Announcement
| Field | Value |
|-------|-------|
| **Agent** | Ghost |
| **Depends On** | Task 3.9 |
| **Integration** | Slack, Notion |
| **Description** | Write launch announcement: 1 LinkedIn post, 1 Twitter thread, 1 internal Slack message. Post to Slack and save to Notion content library. |
- [ ] Complete

---

## Phase 3 Summary

| Task | Agent | Integration | Status |
|------|-------|-------------|--------|
| 3.1 Research & Content Brief | Scout | Notion | [ ] |
| 3.2 Write All Copy | Ghost | Notion | [ ] |
| 3.3 Homepage | Forge | GitHub | [ ] |
| 3.4 Products Page | Forge | GitHub | [ ] |
| 3.5 Pricing Page | Forge | GitHub | [ ] |
| 3.6 API Docs Page | Forge | GitHub | [ ] |
| 3.7 About/Contact Page | Forge | GitHub | [ ] |
| 3.8 Deploy to Vercel | Forge | GitHub | [ ] |
| 3.9 Full QA Review | Sentinel | — | [ ] |
| 3.10 Launch Announcement | Ghost | Slack, Notion | [ ] |

**Phase 3 Complete When**:
- [ ] quantxdata.ai serves the new website
- [ ] All pages render correctly on desktop and mobile
- [ ] Sentinel approves QA review
- [ ] Launch announcement posted

**Demo to Praveen**: "Here's quantxdata.ai — fully built by AI agents. Scout researched competitors, Ghost wrote copy, Forge built 5 pages, Sentinel did QA. All coordinated through Mission Control. Total human involvement: DNS update and brand decisions."
