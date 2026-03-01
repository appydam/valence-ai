# Phase 5: Marketing Engine (Week 5-6)

**Goal**: Weekly content calendar running on autopilot — 3 LinkedIn posts, 1 blog post, 1 newsletter per week, all QA-reviewed. Build QuantXData's brand presence in the crypto data space.

**Prerequisites**: Phase 3 complete (website live for linking). Phase 4 started (competitive research available). Gmail, Notion, Slack, Google Sheets integrations working.

---

## Content Strategy

### Content Pillars (5 recurring themes)

1. **Crypto Data Infrastructure** (educational)
   - Why data quality matters for trading
   - How standardized feeds reduce integration costs
   - Exchange coverage depth: why 120+ matters

2. **Use Cases & Customer Stories** (value demonstration)
   - How quant funds use real-time tick data
   - Order book data for market making
   - Options Greeks for derivatives trading

3. **Industry News Commentary** (thought leadership)
   - Crypto regulation impact on data providers
   - Exchange transparency and data quality
   - DeFi oracle challenges

4. **Product & Technical Deep Dives** (credibility)
   - API endpoint walkthroughs
   - Streaming data architecture
   - MCP server for AI agents (when ready)

5. **Pay-As-You-Go Narrative** (differentiation)
   - Why enterprise contracts are broken for small teams
   - Democratizing institutional-grade data
   - Comparison: QuantXData vs Kaiko/CCData pricing

---

## Weekly Marketing Sprint (Repeatable Template)

### Every Monday — Launch Sprint

#### Task 5.M1 — Scout: Trend Research
| Field | Value |
|-------|-------|
| **Agent** | Scout |
| **Integration** | Notion |
| **Description** | Research this week's trending topics in crypto markets, DeFi, trading infrastructure. Check: crypto Twitter, CoinDesk, The Block, DeFi Llama, recent QuantXData competitor announcements. Identify 3-5 content angles for the week. Post findings to Notion "Weekly Trends" page. |

#### Task 5.M2 — Ghost: 3 LinkedIn Posts
| Field | Value |
|-------|-------|
| **Agent** | Ghost |
| **Depends On** | Task 5.M1 |
| **Integration** | Notion |
| **Description** | Write 3 LinkedIn posts for Arpit (150-300 words each). Mix content pillars: 1 educational, 1 commentary on this week's trend, 1 product/differentiation. Include relevant hashtags. Store in Notion content library with "Ready for Review" status. |

#### Task 5.M3 — Ghost: 1 Blog Post
| Field | Value |
|-------|-------|
| **Agent** | Ghost |
| **Depends On** | Task 5.M1 |
| **Integration** | Notion |
| **Description** | Write a 500-1000 word blog post for quantxdata.ai/blog. Topic: based on Scout's trend research + content pillar rotation. Include SEO title, meta description, header image suggestion. Store in Notion. |

#### Task 5.M4 — Ghost: Weekly Newsletter Draft
| Field | Value |
|-------|-------|
| **Agent** | Ghost |
| **Depends On** | Tasks 5.M2, 5.M3 |
| **Integration** | Gmail (`create_draft`) |
| **Description** | Draft a weekly newsletter "QuantXData Weekly" — 3 sections: (1) Market data insight of the week, (2) QuantXData product highlight, (3) Curated crypto data news. Target audience: crypto fund managers, quant traders, data engineers. Create as Gmail draft from sales@quantxdata.ai. |

#### Task 5.M5 — Ghost: Update Content Calendar
| Field | Value |
|-------|-------|
| **Agent** | Ghost |
| **Depends On** | Tasks 5.M2, 5.M3, 5.M4 |
| **Integration** | Google Sheets |
| **Description** | Update the content calendar spreadsheet. Columns: Date, Content Type (LinkedIn/Blog/Newsletter), Title, Pillar, Status (Draft/Reviewed/Published), Link, Engagement (filled manually later). Add this week's 5 content pieces. |

### Every Wednesday — Review & Publish

#### Task 5.W1 — Sentinel: Content QA
| Field | Value |
|-------|-------|
| **Agent** | Sentinel |
| **Depends On** | All Monday tasks |
| **Description** | Review all 5 content pieces: (1) Factual accuracy (especially crypto data claims), (2) Voice consistency (professional but accessible), (3) SEO optimization, (4) CTA presence, (5) No competitor bashing (professional tone). Approve or reject each piece with specific feedback. |

#### Task 5.W2 — Kaze: Sprint Summary
| Field | Value |
|-------|-------|
| **Agent** | Kaze |
| **Depends On** | Task 5.W1 |
| **Integration** | Slack |
| **Description** | Post weekly content summary to Slack: what's ready to publish, what needs revision, engagement metrics from previous week's posts (manual input). Recommend publishing order and timing. |

---

## Content Calendar Setup (One-Time)

### Task 5.0 — Initial Content Calendar
| Field | Value |
|-------|-------|
| **Agent** | Kaze |
| **Integration** | Google Sheets |
| **Description** | Create "QuantXData Content Calendar" spreadsheet with tabs: (1) Calendar (Date, Type, Title, Pillar, Status, Link, Engagement), (2) Content Pillars (pillar name, description, frequency), (3) Posting Schedule (Monday: LinkedIn #1, Tuesday: LinkedIn #2, Wednesday: Blog, Thursday: LinkedIn #3, Friday: Newsletter). Add a month's worth of planned topics based on the 5 content pillars. |
- [ ] Complete

### Task 5.1 — Initial Content Backlog
| Field | Value |
|-------|-------|
| **Agent** | Ghost |
| **Depends On** | Task 5.0 |
| **Integration** | Notion |
| **Description** | Create a Notion "Content Library" database with properties: Title, Type, Pillar, Status, Created Date, Published Date. Write 5 "evergreen" LinkedIn posts that can be published anytime (not tied to current news). Topics: intro to QuantXData, why pay-as-you-go, data quality explainer, 120 exchanges coverage, API demo walkthrough. |
- [ ] Complete

---

## Engagement Tracking (Manual Initially)

After Arpit posts content on LinkedIn:

| Metric | How to Track |
|--------|-------------|
| LinkedIn post impressions | Screenshot → note in Sheets |
| LinkedIn post likes/comments | Manual count in Sheets |
| Blog page views | Google Analytics (add to website) |
| Newsletter open rate | Gmail doesn't track this — consider Mailchimp later |
| New inbound leads from content | Track source in HubSpot |

**Future automation**: When LinkedIn API access is approved, agents can pull engagement data directly.

---

## Phase 5 Summary (First Month)

| Week | Content Produced | Status |
|------|-----------------|--------|
| Week 1 | 5 evergreen posts + content calendar setup | [ ] |
| Week 2 | 3 LinkedIn + 1 blog + 1 newsletter | [ ] |
| Week 3 | 3 LinkedIn + 1 blog + 1 newsletter | [ ] |
| Week 4 | 3 LinkedIn + 1 blog + 1 newsletter | [ ] |

**Monthly totals target**:
- 14 LinkedIn posts (5 evergreen + 9 weekly)
- 3 blog posts
- 3 newsletters
- 1 content calendar with pillar rotation

**Phase 5 Complete When**:
- [ ] Content calendar created and populated for 1 month
- [ ] First week's content written, QA-reviewed, and ready to post
- [ ] Weekly sprint template proven (runs with minimal human input)
- [ ] Content references QuantXData specifics (not generic crypto content)

**Demo to Praveen**: "Content calendar running on autopilot — agents produce 3 LinkedIn posts, 1 blog, 1 newsletter every week. Sentinel QA-reviews everything. Here's the Notion library, the Sheets calendar, and 14 posts ready to go. All I do is copy-paste to LinkedIn."
