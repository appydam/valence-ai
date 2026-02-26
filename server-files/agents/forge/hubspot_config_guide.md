# HubSpot CRM Configuration Guide for AlgoHouse

## Overview
This document provides step-by-step instructions for configuring HubSpot CRM to support AlgoHouse's sales workflow. All configuration should be done by a HubSpot admin via the HubSpot UI.

---

## 1. Pipeline Configuration

### Pipeline 1: Quant & Trading Firms
**Stages:**
1. **New Lead** (automatic entry)
2. **Qualified** (after lead scoring ≥40)
3. **Discovery Call Scheduled** 
4. **Discovery Call Completed**
5. **Responded** ← **AUTOMATION TRIGGER** (see Section 4)
6. **Proposal Sent**
7. **Negotiation**
8. **Closed Won** 🎉
9. **Closed Lost** 😞

**Configuration path:**  
`Settings` → `Objects` → `Deals` → `Pipelines` → `Create pipeline`

---

### Pipeline 2: Compliance & Index Providers
**Stages:**
1. **New Lead** (automatic entry)
2. **MiCA Deadline Qualification** (confirm deadline <6 months)
3. **Compliance Review Scheduled**
4. **Compliance Review Completed**
5. **Responded** ← **AUTOMATION TRIGGER** (see Section 4)
6. **Audit Trail Demo**
7. **Proposal Sent**
8. **Legal/Procurement Review**
9. **Closed Won** 🎉
10. **Closed Lost** 😞

**Configuration path:**  
`Settings` → `Objects` → `Deals` → `Pipelines` → `Create pipeline`

---

## 2. Custom Contact Properties

**Configuration path:**  
`Settings` → `Properties` → `Contact properties` → `Create property`

### Property 1: Data Provider Currently Using
- **Field type:** Dropdown select
- **Options:**
  - Bloomberg / Refinitiv
  - CoinAPI
  - Kaiko
  - Messari
  - Glassnode
  - Internal / Self-built
  - No provider
  - Other (specify)
- **Purpose:** Understand competitive positioning

---

### Property 2: Strategy Type
- **Field type:** Dropdown select  
- **Options:**
  - Market Making
  - Statistical Arbitrage
  - Quant Index / Benchmark
  - Institutional DeFi
  - High-Frequency Trading
  - Risk Management / Surveillance
  - Compliance / Audit
  - Other (specify)
- **Purpose:** Route to appropriate email sequence

---

### Property 3: Compliance Deadline
- **Field type:** Date picker  
- **Purpose:** Track MiCA/AML deadlines for urgency scoring

---

### Property 4: Estimated ACV
- **Field type:** Number (currency: USD)  
- **Calculation formula:** (Estimated AUM ÷ 10,000) × $500  
  - Example: $200M AUM → $10,000/year ACV
- **Purpose:** Revenue forecasting

---

### Property 5: Lead Score
- **Field type:** Number (0-100)  
- **Source:** Google Sheets lead scoring model (manual entry or Zapier sync)
- **Purpose:** Prioritize leads for routing

---

### Property 6: Community Pain Noted
- **Field type:** Checkbox (yes/no)  
- **Purpose:** Flag leads who mentioned pain points in community channels (Discord, GitHub, Twitter)

---

### Property 7: Phase 1 Benchmark Engaged
- **Field type:** Dropdown select  
- **Options:**
  - Not engaged
  - GitHub star only
  - Ran notebook
  - Contributed feedback / issue
- **Purpose:** Engagement tracking for lead scoring

---

## 3. Custom Deal Properties

**Configuration path:**  
`Settings` → `Properties` → `Deal properties` → `Create property`

### Property 1: Segment
- **Field type:** Dropdown select  
- **Options:**
  - Quant Trader (HFT/Stat-Arb)
  - Index Provider / ETF Issuer
  - Compliance Buyer (MiCA-driven)
  - Institutional DeFi
- **Purpose:** Segment-specific reporting and forecasting

---

### Property 2: Discovery Source
- **Field type:** Dropdown select  
- **Options:**
  - Phase 1 Benchmark (GitHub)
  - Inbound (website/content)
  - Community (Discord/Twitter)
  - Referral
  - Outbound (cold outreach)
  - Conference/Event
- **Purpose:** Attribution analysis

---

### Property 3: Days to MiCA Deadline
- **Field type:** Calculated field  
- **Formula:** `[Contact: Compliance Deadline] - [Today's Date]`
- **Purpose:** Urgency indicator for compliance segment

---

## 4. Workflow Automation: Responded Stage Task Creation

### Trigger
**When:** Deal stage changes to "Responded" (in either pipeline)

### Actions

#### Action 1: Create follow-up task
- **Task type:** Call
- **Task title:** "Follow up on {{Deal Name}} — gauge interest level"
- **Assigned to:** Deal owner
- **Due date:** 2 business days from stage change
- **Task description:**  
  ```
  Lead responded to outreach. Next steps:
  1. Qualify AUM / ACV estimate
  2. Confirm data infrastructure pain points
  3. Assess MiCA urgency (if applicable)
  4. Schedule discovery call if qualified (Score ≥60)
  
  Lead Score: {{Contact: Lead Score}}
  Current Provider: {{Contact: Data Provider Currently Using}}
  Strategy Type: {{Contact: Strategy Type}}
  ```

#### Action 2: Update lead score (if not already set)
- **If:** Contact property "Lead Score" is empty
- **Then:** Trigger notification to sales ops: "Lead score missing for {{Contact Name}} — please calculate"

#### Action 3: Slack notification (optional)
- **If:** Lead Score ≥80
- **Then:** Send Slack message to #sales-hot-leads:
  ```
  🔥 Hot lead responded: {{Contact Name}} (Score: {{Lead Score}})
  Deal: {{Deal Name}} | ACV: {{Estimated ACV}}
  Pipeline: {{Deal Pipeline}} | Stage: Responded
  
  [@Kaze] — please review for personal outreach
  ```

---

### Workflow Configuration Path
`Automation` → `Workflows` → `Create workflow` → `Deal-based` → Trigger: "Deal stage changed"

**Enrollment criteria:**
- Deal stage = "Responded" (Quant & Trading pipeline) OR
- Deal stage = "Responded" (Compliance & Index pipeline)

---

## 5. Implementation Checklist

### Week 1: Core Setup
- [ ] Create two pipelines (Quant + Compliance)
- [ ] Add 7 custom contact properties
- [ ] Add 3 custom deal properties
- [ ] Configure lead scoring sync (Google Sheets → HubSpot)

### Week 2: Automation
- [ ] Build "Responded" stage workflow
- [ ] Test workflow with dummy deals
- [ ] Configure Slack notifications (if applicable)
- [ ] Train team on new properties and workflow

### Week 3: Data Migration
- [ ] Import existing leads from spreadsheet
- [ ] Backfill custom properties where data exists
- [ ] Assign leads to appropriate pipelines
- [ ] Run initial lead scoring batch

### Week 4: Monitoring & Iteration
- [ ] Review pipeline velocity (days in each stage)
- [ ] Check workflow automation logs for errors
- [ ] Gather feedback from sales team
- [ ] Adjust stage definitions or properties as needed

---

## 6. Integration with Lead Scoring Model

### Google Sheets → HubSpot Sync (via Zapier or API)

**Trigger:** New row added to "Lead Scoring" sheet  
**Action:** Update HubSpot contact

**Mapping:**
- Sheet Column A (Email) → HubSpot: Contact Email
- Sheet Column B (Lead Score) → HubSpot: Lead Score property
- Sheet Column C (Routing Decision) → HubSpot: Lead Status property

**Routing logic (automated):**
- Score 80-100 → Create task for Kaze (personal draft)
- Score 60-79 → Enroll in Email Sequence 1 (immediate)
- Score 40-59 → Add to weekly batch list
- Score <40 → Set status to "Monitor" (no immediate action)

---

## 7. Reporting Dashboards (Optional)

### Dashboard 1: Pipeline Health
- Deals by stage (bar chart)
- Average days in each stage
- Conversion rate by stage
- Pipeline velocity trend

### Dashboard 2: Lead Source Attribution
- Deals by Discovery Source (pie chart)
- ACV by Discovery Source
- Win rate by Discovery Source
- Phase 1 Benchmark engagement correlation

### Dashboard 3: Compliance Urgency
- Deals with MiCA deadlines <90 days (table)
- Average days to close by urgency
- Compliance segment conversion funnel

---

## Notes for Admin

### API Access (if needed)
For programmatic property updates via AlgoHouse backend:
1. Generate HubSpot API key: `Settings` → `Integrations` → `API Key`
2. Use HubSpot Contacts API: `https://api.hubapi.com/crm/v3/objects/contacts`
3. Documentation: https://developers.hubspot.com/docs/api/overview

### Data Privacy
- Ensure GDPR compliance for EU contacts
- Configure retention policies for closed-lost deals
- Review data sharing settings if using Zapier integrations

---

## Support

**Questions about this configuration?**  
Contact: Forge (Engineering Agent)  
HubSpot documentation: https://knowledge.hubspot.com
