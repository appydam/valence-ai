# Phase 4: Sales Pipeline & Outreach (Week 4-5)

**Goal**: Build a repeatable sales pipeline — 50 leads researched, personalized outreach drafted, CRM tracking live, response management workflow running.

**Prerequisites**: Phase 3 complete (website live). Gmail, Google Sheets, HubSpot integrations verified. Email `arpit@quantxdata.ai` created.

---

## Target Customer Profiles

QuantXData sells crypto market data to:

1. **Crypto Hedge Funds / Quant Shops** — Need historical + real-time data for algorithmic trading
2. **Crypto Exchanges** — Need cross-exchange data for market making, compliance
3. **DeFi Protocols** — Need price feeds, oracle data, reference rates
4. **Research Firms / Analytics** — Need bulk historical data for reports, indices
5. **TradFi firms entering crypto** — Banks, asset managers needing institutional-grade data

**Competitors' pricing** (for positioning):
- Kaiko: Enterprise contracts, $5K+/month
- CCData: Tiered enterprise, expensive for small firms
- Amber Data: Custom pricing
- **QuantXData differentiator**: Pay-as-you-go, accessible to small teams and indie quants

---

## Weekly Sales Sprint (Repeatable Template)

### Sprint 1: First Batch of 25 Leads

#### Task 4.1 — Scout: Lead Research (Batch 1)
| Field | Value |
|-------|-------|
| **Agent** | Scout |
| **Integration** | Notion, Google Sheets |
| **Description** | Research 25 potential QuantXData customers. For each: company name, what they do, size (employees/AUM if fund), current data provider (if known), decision-maker name + title, company website, LinkedIn URL. Focus on crypto hedge funds and quant trading firms. Post full research to Notion. Update lead tracker spreadsheet. |

**Target companies to start with**:
- Crypto hedge funds: Pantera Capital, Polychain Capital, Paradigm, Three Arrows replacement firms, Multicoin Capital, Galaxy Digital, BlockTower Capital
- Quant shops: Wintermute, Jump Crypto, Cumberland, DRW (crypto desk), Alameda replacement firms
- Data consumers: Delphi Digital, The Block Research, Messari, Nansen, Glassnode
- Exchanges needing data: smaller CEXs, new DEX protocols
- TradFi crypto desks: Fidelity Digital Assets, BlackRock crypto, Goldman Sachs digital assets
- [ ] Complete

#### Task 4.2 — Scout: Contact Enrichment
| Field | Value |
|-------|-------|
| **Agent** | Scout |
| **Depends On** | Task 4.1 |
| **Integration** | Google Sheets |
| **Description** | For each of the 25 leads, find: decision-maker email (CTO, Head of Data, Head of Research), LinkedIn profile URL, any recent news/announcements that could be a conversation hook. Update the lead tracker spreadsheet. |
- [ ] Complete

#### Task 4.3 — Ghost: Outreach Email Templates
| Field | Value |
|-------|-------|
| **Agent** | Ghost |
| **Integration** | Notion |
| **Description** | Write 5 email template variations for cold outreach to crypto data buyers. Angles: (1) Pay-as-you-go vs enterprise contracts, (2) 120+ exchange coverage, (3) Real-time tick data quality, (4) MCP server/AI-ready data, (5) Free tier to try. Each template: subject line + 100-150 word body. Sender: arpit@quantxdata.ai. Store in Notion. |
- [ ] Complete

#### Task 4.4 — Ghost: Personalized Outreach Emails
| Field | Value |
|-------|-------|
| **Agent** | Ghost |
| **Depends On** | Tasks 4.2, 4.3 |
| **Integration** | Gmail (`create_draft`) |
| **Description** | For each of the 25 leads, write a personalized cold email using the best-fit template. Reference: their company's specific needs (from Scout's research), a recent news hook if available, and specific QuantXData features relevant to them. Create as Gmail drafts (NOT send). From: arpit@quantxdata.ai. |
- [ ] Complete

#### Task 4.5 — Kaze: CRM Pipeline Setup
| Field | Value |
|-------|-------|
| **Agent** | Kaze |
| **Integration** | HubSpot |
| **Description** | Set up HubSpot pipeline: Lead → Researched → Email Sent → Replied → Demo Scheduled → Proposal Sent → Closed Won → Closed Lost. Import all 25 leads as contacts with company info. Set each to "Researched" stage. |
- [ ] Complete

#### Task 4.6 — Kaze: Sprint Review + Tracking
| Field | Value |
|-------|-------|
| **Agent** | Kaze |
| **Depends On** | Tasks 4.4, 4.5 |
| **Integration** | Google Sheets, Slack |
| **Description** | Review all 25 email drafts for quality. Update lead tracker with status. Post sprint summary to Slack: leads researched, emails drafted, quality assessment, recommended send order (highest potential first). |
- [ ] Complete

---

### Sprint 2: Second Batch of 25 Leads (Week 5)

Repeat the same structure with 25 new leads. Focus on different segments:
- DeFi protocols needing oracle/price feed data
- TradFi firms entering crypto
- Analytics platforms and index providers
- Smaller exchanges needing cross-exchange data

| Task | Agent | Integration | Status |
|------|-------|-------------|--------|
| 4.7 Lead Research (Batch 2) | Scout | Notion, Sheets | [ ] |
| 4.8 Contact Enrichment | Scout | Sheets | [ ] |
| 4.9 Personalized Emails | Ghost | Gmail | [ ] |
| 4.10 CRM Import | Kaze | HubSpot | [ ] |
| 4.11 Sprint Review | Kaze | Sheets, Slack | [ ] |

---

## Response Management Workflow

Once emails are sent (manually by Arpit after reviewing drafts):

### When a Lead Responds
1. **Arpit creates task**: "Follow up with [Name] from [Company] — they [asked about/interested in/want demo of] [topic]"
2. **Kaze triages**: Assigns Scout (research) + Ghost (follow-up)
3. **Scout researches**: Deep dive on the company — tech stack, current data usage, competitors they work with, recent funding
4. **Ghost drafts follow-up**: Personalized response referencing their specific inquiry + Scout's research
5. **Kaze reviews**: Approves or requests changes
6. **Arpit sends**: (manual for now)

### When a Demo is Requested
1. **Kaze creates calendar event**: Via Google Calendar integration
2. **Scout prepares brief**: Company profile, likely questions, data they'd need
3. **Ghost drafts demo agenda**: Email to lead confirming time, what we'll cover
4. **Post-demo**: Kaze creates follow-up tasks (proposal, trial setup, etc.)

---

## LinkedIn Outreach (Manual Post, Agent Draft)

LinkedIn's API requires Marketing Developer Platform approval (2-8 weeks). Workaround:

| Task | Agent | Integration |
|------|-------|-------------|
| Write 25 personalized LinkedIn connection request messages (one per lead) | Ghost | Notion |
| Write follow-up DM templates for accepted connections | Ghost | Notion |

Arpit manually sends these on LinkedIn. Apply for LinkedIn API access in parallel.

---

## Metrics to Track (in Google Sheets)

| Metric | Target (Week 5) |
|--------|-----------------|
| Leads researched | 50 |
| Emails drafted | 50 |
| Emails sent (Arpit) | 50 |
| Response rate | Track |
| Demos scheduled | Track |
| LinkedIn connections sent | 25 |
| LinkedIn accepted | Track |

---

## Phase 4 Summary

| Task | Agent | Integration | Status |
|------|-------|-------------|--------|
| 4.1 Lead Research (Batch 1) | Scout | Notion, Sheets | [ ] |
| 4.2 Contact Enrichment | Scout | Sheets | [ ] |
| 4.3 Email Templates | Ghost | Notion | [ ] |
| 4.4 Personalized Emails (25) | Ghost | Gmail | [ ] |
| 4.5 CRM Pipeline Setup | Kaze | HubSpot | [ ] |
| 4.6 Sprint Review | Kaze | Sheets, Slack | [ ] |
| 4.7-4.11 Sprint 2 (25 more) | All | All | [ ] |

**Phase 4 Complete When**:
- [ ] 50 leads researched with decision-maker info
- [ ] 50 personalized email drafts in Gmail
- [ ] HubSpot pipeline active with all 50 contacts
- [ ] Lead tracker spreadsheet up to date
- [ ] Response management workflow tested (at least 1 follow-up)

**Demo to Praveen**: "50 crypto data buyers researched, personalized emails drafted, HubSpot pipeline set up — all by AI agents. Ready for you to review and hit send. Here's the spreadsheet, here's HubSpot, here are the Gmail drafts."
