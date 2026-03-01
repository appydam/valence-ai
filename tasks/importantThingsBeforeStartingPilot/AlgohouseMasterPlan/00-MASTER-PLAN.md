# QuantXData (formerly AlgoHouse) — Master Plan

## The Big Picture

**End Goal**: Prove Mission Control works by using it to run QuantXData's entire go-to-market — website, sales pipeline, outreach, marketing — then use that success story to pilot at Solidus (enterprise).

**What Praveen (mentor) wants to see**:
1. Redo the website (rebrand to QuantXData)
2. Create a sales pipeline (find crypto data buyers)
3. Start outreach and manage responses/demos
4. Marketing plan and regular posting
5. Explore pay-as-you-go model + MCP server as differentiation

**What we have**:
- QuantXData.ai domain (Arpit is domain manager)
- Email: sales@quantxdata.ai (+ support@, info@)
- Frontend repo (Flask + jQuery, outdated)
- Backend API: api.algohouse.ai (120+ exchanges, real-time tick data, OHLCV, order books, options)
- Competition: Amber Data, CCData, Kaiko
- Mission Control with 5 AI agents + 30+ integration blueprints

---

## Phase Overview

| Phase | Name | Duration | Goal | Tracking File |
|-------|------|----------|------|---------------|
| **0** | Bug Fixes & Integration Setup | Day 1-2 | Fix 4 critical bugs, connect 6 core integrations | [01-PHASE-0.md](./01-PHASE-0.md) |
| **1** | Smoke Tests | Week 1 | Each agent completes 1 real task with 1 integration | [02-PHASE-1.md](./02-PHASE-1.md) |
| **2** | Multi-Agent Missions + More Integrations | Week 2-3 | Agents coordinate across dependency chains; bring 9+ integrations live | [03-PHASE-2.md](./03-PHASE-2.md) |
| **3** | QuantXData Website Rebrand | Week 3-4 | New modern website on quantxdata.ai | [04-PHASE-3.md](./04-PHASE-3.md) |
| **4** | Sales Pipeline & Outreach | Week 4-5 | 50 leads researched, outreach emails drafted, CRM tracking | [05-PHASE-4.md](./05-PHASE-4.md) |
| **5** | Marketing Engine | Week 5-6 | Weekly content calendar running on autopilot | [06-PHASE-5.md](./06-PHASE-5.md) |
| **6** | MCP Server + Pay-As-You-Go | Week 6-8 | Differentiation play — expose data via MCP, build pricing page | [07-PHASE-6.md](./07-PHASE-6.md) |

---

## Key Decisions Pending (Need Praveen's Input)

- [ ] **Backend access**: Arpit needs API credentials + infra access from Andrei (Praveen to coordinate)
- [ ] **Arpit's email**: Need `arpit@quantxdata.ai` created for cold outreach
- [ ] **MCP server**: Check if already built (Praveen said he'll check)
- [ ] **Brand identity**: Logo, colors, tagline for QuantXData (or keep it minimal for now?)
- [ ] **Website scope**: Full rebuild in Next.js or quick reskin of existing Flask app?

---

## Success Milestones (What to Show Praveen)

| Week | Demo |
|------|------|
| **1** | "Scout researched your competitors (Kaiko, CCData, Amber), posted structured analysis to Notion — 20 min, zero humans." |
| **2** | "3 agents coordinated: Scout researched → Forge built landing page → Ghost wrote copy. Dependency chain ran automatically." |
| **3** | "quantxdata.ai is live with a modern website. Here's the GitHub repo, deployment URL, and all the content." |
| **4** | "50 crypto hedge funds researched, personalized emails drafted in Gmail, leads tracked in Google Sheets/HubSpot." |
| **5** | "Weekly content calendar running: 3 LinkedIn posts + 1 blog + 1 newsletter per week, all QA-reviewed by Sentinel." |
| **6** | "Pay-as-you-go pricing live. MCP server deployed. Differentiated from Kaiko/CCData." |

---

## Files in This Directory

```
AlgohouseMasterPlan/
├── 00-MASTER-PLAN.md          ← You are here (overview + tracking)
├── 01-PHASE-0.md              ← Bug fixes + integration setup
├── 02-PHASE-1.md              ← Smoke tests (single agent + single integration)
├── 03-PHASE-2.md              ← Multi-agent missions + 9 integrations live
├── 04-PHASE-3.md              ← QuantXData website rebrand
├── 05-PHASE-4.md              ← Sales pipeline & outreach
├── 06-PHASE-5.md              ← Marketing engine
└── 07-PHASE-6.md              ← MCP server + pay-as-you-go model
```
