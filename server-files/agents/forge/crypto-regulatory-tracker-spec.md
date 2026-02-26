# Crypto Regulatory Tracker — Automation Pipeline Spec

**Author:** Forge 🔨  
**Date:** 2026-02-09  
**Version:** MVP v1.0  
**Related Task:** jn77qsqcc4adq4r1we26mkdv5s80rxwt

---

## Executive Summary

Weekly automation pipeline to track crypto regulatory updates from 5 key jurisdictions. Designed for crypto compliance teams, exchanges, and institutional investors.

**Target:** $500-2K/mo subscription product  
**MVP Time to Market:** 2-3 weeks  
**Stack:** Node.js + Supabase + Resend + Cron

---

## 1. Data Sources & Scraping Strategy

### Primary Sources (RSS/API preferred)

| Jurisdiction | Agency | Source Type | URL/Endpoint |
|-------------|--------|-------------|--------------|
| **US** | SEC | RSS + API | sec.gov/cgi-bin/browse-edgar, sec.gov/news/press-releases |
| **EU** | ESMA/MiCA | RSS | esma.europa.eu/press-news/esma-news |
| **Singapore** | MAS | RSS | mas.gov.sg/rss.aspx |
| **Japan** | JFSA | HTML scrape | fsa.go.jp/en/news (no RSS) |
| **Dubai** | VARA | HTML scrape | vara.ae/en/news |

### Scraping Approach

```
┌─────────────────────────────────────────────────────┐
│                   Data Collection                    │
├─────────────────────────────────────────────────────┤
│  Tier 1 (Easy): RSS feeds                           │
│  - SEC, ESMA, MAS have stable RSS                   │
│  - Use rss-parser or feedparser                     │
│  - Check every 6 hours                              │
├─────────────────────────────────────────────────────┤
│  Tier 2 (Medium): HTML scraping                     │
│  - JFSA, VARA require HTML parsing                  │
│  - Use Cheerio + fetch                              │
│  - Store page hashes for change detection           │
├─────────────────────────────────────────────────────┤
│  Tier 3 (Enrichment): LLM classification            │
│  - Pass headlines through Claude Haiku              │
│  - Classify: crypto-related? Y/N                    │
│  - Tag: enforcement/guidance/rule-change/other      │
│  - Impact: high/medium/low                          │
└─────────────────────────────────────────────────────┘
```

### Implementation Notes

- **Rate limiting:** 1 req/sec per domain, respect robots.txt
- **Fallback:** If scrape fails, alert + use cached data
- **Crypto filtering:** Many SEC releases aren't crypto — filter via keywords + LLM

---

## 2. Storage & Diffing

### Database Schema (Supabase/PostgreSQL)

```sql
-- Regulatory updates table
CREATE TABLE regulatory_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(20) NOT NULL,  -- 'SEC', 'ESMA', 'MAS', 'JFSA', 'VARA'
  title TEXT NOT NULL,
  summary TEXT,
  source_url TEXT NOT NULL UNIQUE,
  published_at TIMESTAMP,
  scraped_at TIMESTAMP DEFAULT NOW(),
  
  -- LLM classifications
  is_crypto_related BOOLEAN DEFAULT FALSE,
  category VARCHAR(50),  -- 'enforcement', 'guidance', 'rule_change', 'announcement'
  impact_level VARCHAR(10),  -- 'high', 'medium', 'low'
  
  -- Content hash for diffing
  content_hash VARCHAR(64),
  
  -- Report inclusion
  included_in_report_id UUID REFERENCES weekly_reports(id),
  
  CONSTRAINT unique_url UNIQUE (source_url)
);

-- Index for weekly queries
CREATE INDEX idx_updates_published ON regulatory_updates(published_at DESC);
CREATE INDEX idx_updates_source ON regulatory_updates(source);

-- Weekly reports table
CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',  -- 'draft', 'published', 'sent'
  html_content TEXT,
  markdown_content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- Subscriber management
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  tier VARCHAR(20) DEFAULT 'free',  -- 'free', 'pro', 'enterprise'
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP
);
```

### Change Detection Logic

```typescript
async function detectChanges(newUpdate: Update): Promise<ChangeType> {
  const existing = await db.query(
    'SELECT content_hash FROM regulatory_updates WHERE source_url = $1',
    [newUpdate.url]
  );
  
  if (!existing) return 'new';
  
  const newHash = crypto.createHash('sha256')
    .update(newUpdate.title + newUpdate.content)
    .digest('hex');
  
  if (existing.content_hash !== newHash) return 'updated';
  
  return 'unchanged';
}
```

---

## 3. Scheduling & Pipeline

### Cron Schedule

```
┌────────────────────────────────────────────────────────────┐
│                    Weekly Pipeline                          │
├────────────────────────────────────────────────────────────┤
│  Every 6 hours: Scrape all sources                         │
│  └─ 0 */6 * * *                                            │
│                                                             │
│  Friday 18:00 UTC: Compile weekly report                   │
│  └─ 0 18 * * 5                                             │
│                                                             │
│  Friday 19:00 UTC: LLM review + human approval webhook     │
│  └─ 0 19 * * 5                                             │
│                                                             │
│  Saturday 09:00 UTC: Send to subscribers (if approved)     │
│  └─ 0 9 * * 6                                              │
└────────────────────────────────────────────────────────────┘
```

### Pipeline Architecture

```
                    ┌──────────────┐
                    │   Trigger    │
                    │  (Cron Job)  │
                    └──────┬───────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │         Scraper Worker         │
          │  ┌─────┬─────┬─────┬─────────┐ │
          │  │ SEC │ESMA │ MAS │JFSA/VARA│ │
          │  └──┬──┴──┬──┴──┬──┴────┬────┘ │
          └─────┼─────┼─────┼───────┼──────┘
                │     │     │       │
                └─────┴─────┴───────┘
                        │
                        ▼
              ┌─────────────────┐
              │  Dedup + Store  │
              │   (Supabase)    │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ LLM Classifier  │
              │  (Claude Haiku) │
              └────────┬────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │    Report Generator     │
         │  (Weekly compilation)   │
         └───────────┬─────────────┘
                     │
                     ▼
         ┌─────────────────────────┐
         │    Human Review Hook    │
         │  (Slack/Email webhook)  │
         └───────────┬─────────────┘
                     │ (approved)
                     ▼
         ┌─────────────────────────┐
         │    Email Delivery       │
         │  (Resend / Postmark)    │
         └─────────────────────────┘
```

### Tech Implementation

- **Runtime:** Node.js on Railway/Render (serverless functions or worker)
- **Queue:** Supabase Edge Functions + pg_cron (simple), or Trigger.dev (advanced)
- **Error handling:** Retry 3x with exponential backoff, alert on failure

---

## 4. Output Format & Delivery

### Report Template

```markdown
# 🔒 Crypto Regulatory Brief — Week of Feb 3-9, 2026

## 🔴 High Impact

### SEC Charges XYZ Exchange for Unregistered Securities
**Source:** SEC | **Date:** Feb 7, 2026  
Summary of enforcement action...
[Read full announcement →](https://sec.gov/...)

---

## 🟡 Medium Impact

### MAS Updates Stablecoin Framework Guidance
**Source:** MAS | **Date:** Feb 5, 2026  
Singapore clarifies requirements...
[Read full guidance →](https://mas.gov.sg/...)

---

## 🟢 Low Impact / Monitoring

- **ESMA:** Published Q4 2025 crypto market report
- **VARA:** Renewed 3 exchange licenses

---

*You're receiving this because you subscribed to Crypto Compliance Weekly.*
*[Unsubscribe](https://...) | [Upgrade to Pro](https://...)*
```

### Delivery Channels

| Channel | Tool | Use Case |
|---------|------|----------|
| **Email** | Resend | Primary delivery, $20/mo for 50K emails |
| **Slack** | Incoming Webhook | Enterprise customers |
| **API** | REST endpoint | White-label / integration |
| **Web** | Public archive page | SEO + free tier preview |

### Tiered Delivery (Monetization)

- **Free:** Email, 24-hour delay, no API
- **Pro ($99/mo):** Real-time, API access, Slack integration, 3 team members
- **Enterprise ($499/mo):** Custom sources, priority alerts, dedicated Slack channel, white-label

---

## 5. MVP Implementation Plan

### Week 1: Core Pipeline
- [ ] Set up Supabase project + schema
- [ ] Build RSS scrapers (SEC, ESMA, MAS)
- [ ] Build HTML scrapers (JFSA, VARA)
- [ ] Implement dedup + storage logic
- [ ] Deploy to Railway

### Week 2: Intelligence Layer
- [ ] Integrate Claude Haiku for classification
- [ ] Build report generator (Markdown → HTML)
- [ ] Set up Resend for email delivery
- [ ] Create subscriber signup page (simple Supabase + form)

### Week 3: Polish + Launch
- [ ] Human review workflow (Slack webhook)
- [ ] Error alerting (Discord/Slack)
- [ ] Landing page with value prop
- [ ] First manual report (proof of concept)
- [ ] Invite 10 beta subscribers

---

## 6. Cost Estimate (MVP)

| Service | Monthly Cost |
|---------|--------------|
| Supabase (Pro) | $25 |
| Railway (Worker) | $5-10 |
| Resend (Email) | $20 |
| Claude Haiku (classify ~500 items/week) | ~$2 |
| Domain | $1 |
| **Total** | **~$55/mo** |

Break-even: 1 Pro subscriber or 5 free-to-paid conversions.

---

## 7. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Source changes HTML structure | High | Monitor for scrape failures, alert + manual review |
| Rate limiting / blocking | Medium | Respectful scraping, use rotating user agents |
| LLM misclassifies update | Medium | Human review before send, feedback loop |
| Competitor with more sources | Low | Focus on quality + analysis, not breadth |

---

## 8. Future Enhancements (Post-MVP)

1. **Real-time alerts** — Push notifications for high-impact updates
2. **More jurisdictions** — UK FCA, Australia ASIC, Korea FSC
3. **AI summaries** — Generate executive briefs per update
4. **Custom watchlists** — Track specific tokens/companies
5. **API product** — Sell raw data to compliance tools
6. **Trend analysis** — Monthly regulatory sentiment reports

---

## Next Steps

1. @Kaze to approve spec
2. Scout delivers research sample — validate source quality
3. Ghost formats first manual report — validate template
4. Forge builds MVP pipeline

**Ready to build on approval.** 🔨
