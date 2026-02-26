# Phase 2 Deliverables: HubSpot CRM + Lead Scoring + Email Sequences + Proposal Deck

## Overview
This deliverable package contains all four requested components for AlgoHouse Phase 2 go-to-market infrastructure.

---

## Deliverable 1: Lead Scoring Model (Google Sheets)
**Location:** [AlgoHouse Lead Scoring Model](https://docs.google.com/spreadsheets/d/1m9JboOQe7XFAmRvuiApcKVs4ARJPdQMG_4IXpGQ1FFY/edit)

### Features
- **6 scoring dimensions** with weighted point values:
  - AUM Estimate (1-4 points)
  - Strategy Type (1-4 points)
  - Current Data Provider (0-4 points)
  - Community Pain Noted (0 or 2 points)
  - Phase 1 Engagement (0-3 points)
  - MiCA Deadline Urgency (0-3 points)

- **Automated calculations:**
  - Raw score (0-20 range)
  - Normalized score (0-100)
  - Routing decision with emojis (🔥 Kaze / ⚡ Seq 1 / 📊 Batch / 👀 Monitor)

- **Example lead profiles** included:
  - Hot Quant Fund (Score: 20/20 = 100%)
  - Index Provider (Score: 10/20 = 50%)
  - Compliance Buyer (Score: 12/20 = 60%)
  - GitHub Stargazer (Score: 5/20 = 25%)

### Routing Logic
- **80-100:** Kaze personally drafts outreach
- **60-79:** Sequence 1 immediately
- **40-59:** Weekly batch processing
- **<40:** Monitor only (no immediate action)

---

## Deliverable 2: Email Sequences (4 sequences)
**Location:** `email_sequences.md`

### Sequence 1: Quant Trader (5 emails, 2 weeks)
- **Target:** Firms that ran Phase 1 benchmark
- **Focus:** Latency-drift problem, timestamp precision, microstructure quality
- **Tone:** Technical, peer-level
- **CTA:** Side-by-side comparison with current provider

### Sequence 2: Compliance Buyer (3 emails, 10 days)
- **Target:** EU-based firms with MiCA deadline pressure
- **Focus:** Audit readiness, compliance reporting, timestamp integrity
- **Tone:** Urgent but helpful
- **CTA:** Compliance audit review call

### Sequence 3: Index Provider (2 emails + calendar template)
- **Target:** Index funds, ETF issuers, benchmark providers
- **Focus:** Wash trading detection, peer collaboration
- **Tone:** Peer-level, no product pitch in email 1
- **CTA:** Technical discussion (not sales call)

### Sequence 4: Re-engagement (3 emails)
- **Target:** GitHub stargazers who haven't engaged further
- **Focus:** Phase 2 roadmap, community input, early access
- **Tone:** Community-driven, open-source ethos
- **CTA:** Vote on Phase 2 features

**Note:** All sequences include merge tags ({{FirstName}}, {{CompanyName}}, etc.) for personalization.

---

## Deliverable 3: HubSpot CRM Configuration Guide
**Location:** `hubspot_config_guide.md`

### Pipeline Configuration
- **Pipeline 1:** Quant & Trading Firms (9 stages)
- **Pipeline 2:** Compliance & Index Providers (10 stages)

### Custom Properties
**Contact Properties (7):**
1. Data Provider Currently Using (dropdown)
2. Strategy Type (dropdown)
3. Compliance Deadline (date)
4. Estimated ACV (number/currency)
5. Lead Score (0-100, synced from Google Sheets)
6. Community Pain Noted (checkbox)
7. Phase 1 Benchmark Engaged (dropdown)

**Deal Properties (3):**
1. Segment (Quant / Index / Compliance / DeFi)
2. Discovery Source (attribution)
3. Days to MiCA Deadline (calculated field)

### Workflow Automation
**Trigger:** Deal stage changes to "Responded" (either pipeline)

**Actions:**
1. Create follow-up task (assigned to deal owner, due in 2 days)
2. Update lead score if missing (notify sales ops)
3. Slack notification if lead score ≥80 (flag for Kaze)

### Implementation Checklist
- Week 1: Core setup (pipelines, properties)
- Week 2: Automation (workflow, Slack integration)
- Week 3: Data migration (import existing leads)
- Week 4: Monitoring & iteration

**Note:** All configuration must be done via HubSpot admin UI. API access details included for programmatic updates if needed.

---

## Deliverable 4: Proposal Deck Specification (Figma)
**Location:** `proposal_deck_spec.md`

### Design Direction
- **Aesthetic:** Bloomberg Terminal meets modern SaaS
- **Colors:** Black (#000000), Terminal Green (#00FF41), White (#FFFFFF)
- **Typography:** Inter (body), SF Mono (data/code)
- **Page size:** 1920×1080 (16:9, screen-sharing optimized)

### Slide Structure (8 slides)
1. **Cover** — Company name, date, contact info
2. **The Problem** — TradFi vs Crypto-native vs AlgoHouse (coverage vs compliance scatter plot)
3. **Why AlgoHouse** — 4-box grid (timestamps, wash trading, lineage, latency)
4. **Technical Architecture** — Flow diagram (exchange → aggregator → validation → delivery)
5. **Pricing Model** — Base tiers, modifiers, example calculation
6. **Case Study** — $500M quant fund (+0.31 Sharpe points)
7. **Implementation Timeline** — 2-week go-live process
8. **Next Steps** — 3-step CTA (deep dive → pilot → go-live)

### Pricing Model (Interactive Google Sheets)
**Location:** [AlgoHouse Pricing Calculator](https://docs.google.com/spreadsheets/d/1z11QpB4WUkO3rkvU8YCcu8bKuNXcFLEeatU4DCOIPP0/edit)

**Features:**
- **Base tier pricing** (Starter / Professional / Enterprise)
- **Modifiers:** Data type, delivery method, historical data, compliance
- **Discounts:** Startup discount (AUM <$50M, -40% first 6 months)
- **Automated calculations:** First-year total, ongoing annual, monthly payments

**Example calculation included:**
- Quant fund, $200M AUM
- 30 pairs, spot + derivatives, WebSocket, 1-year historical, MiCA compliance
- **First Year:** $138,000 (with startup discount)
- **Ongoing:** $172,500/year

### Customization Checklist
Before sending each proposal:
- [ ] Update company name + date (Slide 1)
- [ ] Adjust pricing calculator inputs (Slide 5)
- [ ] Select relevant case study (Slide 6)
- [ ] Update Calendly link (Slide 8)

---

## Integration Architecture

### Lead Scoring → HubSpot Sync
**Method:** Zapier or HubSpot API

**Flow:**
1. New lead added to Google Sheets (manual or automated)
2. Calculate score using formulas
3. Sync to HubSpot contact properties
4. Trigger routing logic (Kaze draft / Sequence 1 / Batch / Monitor)

**API endpoint:** `POST /crm/v3/objects/contacts`  
**Documentation:** https://developers.hubspot.com/docs/api/crm/contacts

---

### Email Sequences → Gmail Drafts
**Method:** Manual import or Gmail API

**Option 1: Manual Import**
1. Copy email body from `email_sequences.md`
2. Create Gmail draft
3. Add to sequence automation tool (HubSpot Sequences or Lemlist)

**Option 2: Programmatic (Gmail API)**
- Use base64url-encoded MIME messages (examples in Phase 2 build logs)
- Create drafts via API: `POST /gmail/v1/users/me/drafts`

---

### Proposal Deck → Figma
**Method:** Designer handoff

**Requirements:**
1. Share `proposal_deck_spec.md` with designer
2. Provide brand assets (logo, color palette)
3. Review first draft within 3-5 days
4. Export as PDF + Figma link for customization

---

## Usage Workflow

### For New Lead
1. **Score the lead:** Enter data into Lead Scoring Model (Google Sheets)
2. **Route appropriately:**
   - Score ≥80? → Kaze drafts personal outreach
   - Score 60-79? → Enroll in appropriate email sequence (Quant / Compliance / Index)
   - Score 40-59? → Add to weekly batch
   - Score <40? → Monitor (no immediate action)

3. **Create HubSpot contact:**
   - Add custom properties (data provider, strategy type, etc.)
   - Assign to appropriate pipeline (Quant or Compliance)
   - Set deal stage to "New Lead"

4. **Track engagement:**
   - Update Phase 1 Benchmark Engaged property
   - Log community pain points (Community Pain Noted checkbox)
   - Monitor MiCA deadline if applicable

### For Qualified Lead (Score ≥60)
1. **Schedule discovery call** (move deal to "Discovery Call Scheduled")
2. **Customize proposal:**
   - Open Pricing Calculator (Google Sheets)
   - Adjust inputs for customer's data needs
   - Export pricing breakdown
3. **Generate proposal deck:**
   - Customize Figma template (company name, date, pricing)
   - Export as PDF
4. **Send proposal** (move deal to "Proposal Sent")

### For Responded Lead
1. **HubSpot automation triggers:**
   - Task created for follow-up (2 business days)
   - Slack notification if high-value (≥80 score)
2. **Follow up within 48 hours:**
   - Qualify AUM / ACV
   - Confirm pain points
   - Assess urgency (MiCA deadline)
3. **Next stage:**
   - If qualified → Schedule discovery call
   - If unqualified → Move to "Closed Lost" + document reason

---

## Metrics to Track

### Lead Scoring Model
- Average score by source (GitHub / Discord / Twitter / Outbound)
- Conversion rate by score bucket (80-100 / 60-79 / 40-59 / <40)
- Time to first response by score

### Email Sequences
- Open rate by sequence (Quant / Compliance / Index / Re-engagement)
- Reply rate by email position (Email 1 vs 5)
- Conversion to discovery call by sequence

### HubSpot CRM
- Pipeline velocity (days in each stage)
- Win rate by pipeline (Quant vs Compliance)
- Average deal size by segment

### Proposal Deck
- Proposal → Closed Won conversion rate
- Average time from proposal to decision
- Most common objections (track in deal notes)

---

## Next Steps

### Week 1: Setup
- [ ] Complete HubSpot configuration (pipelines, properties, workflows)
- [ ] Test lead scoring sync (Google Sheets → HubSpot)
- [ ] Import email sequences to Gmail drafts
- [ ] Commission Figma proposal deck design

### Week 2: Testing
- [ ] Run 5 test leads through scoring model
- [ ] Test HubSpot workflow automation (create dummy deals)
- [ ] Send test emails from each sequence (to internal team)
- [ ] Review first draft of proposal deck

### Week 3: Launch
- [ ] Migrate existing leads to new system
- [ ] Enroll first batch in email sequences
- [ ] Generate first custom proposal for qualified lead
- [ ] Train team on new workflows

### Week 4: Optimization
- [ ] Review metrics (open rates, response rates, pipeline velocity)
- [ ] Iterate on email copy based on feedback
- [ ] Adjust lead scoring weights if needed
- [ ] Update proposal deck based on objections

---

## Files Included

1. `email_sequences.md` — Full text of all 4 email sequences
2. `hubspot_config_guide.md` — Step-by-step HubSpot admin instructions
3. `proposal_deck_spec.md` — Complete Figma design specification (8 slides)
4. `DELIVERABLES_README.md` — This file (overview + usage workflow)

**Google Sheets:**
- Lead Scoring Model: https://docs.google.com/spreadsheets/d/1m9JboOQe7XFAmRvuiApcKVs4ARJPdQMG_4IXpGQ1FFY/edit
- Pricing Calculator: https://docs.google.com/spreadsheets/d/1z11QpB4WUkO3rkvU8YCcu8bKuNXcFLEeatU4DCOIPP0/edit

---

## Support & Questions

**Implementation questions?**  
Tag @Forge in Mission Control or create a Linear issue.

**Content feedback?**  
Tag @Ghost for email copy iterations or proposal deck messaging.

**Strategic questions?**  
Tag @Kaze for routing logic, pricing strategy, or sales process.

---

**Deliverable status:** ✅ Complete  
**Build time:** 8 turns  
**Delivered by:** Forge (Engineering Agent)  
**Date:** February 25, 2026
