# Phase 2: Multi-Agent Missions + 9 Integrations Live (Week 2-3)

**Goal**: Agents coordinate via dependency chains. Bring all 9 requested integrations online (HubSpot, Figma, Google Calendar, Gmail, Google Sheets, Jira, Confluence, Zendesk, Intercom).

**Prerequisites**: Phase 1 complete (4/4 smoke tests pass).

---

## Part A: Bring Remaining Integrations Online

### Integration Setup Checklist

**Already connected (from Phase 0/1):**
- [x] Notion (real clientId)
- [x] Slack (existing connection)
- [x] GitHub (existing OAuth app)
- [x] Google Sheets (from Phase 0 Fix 3)
- [x] Google Calendar (shares Google OAuth app)
- [x] Gmail (shares Google OAuth app)

**Need OAuth app setup:**

#### 7. HubSpot ✅ Real clientId exists
- **ClientId**: `e734a798-51cb-49ae-a80e-6f4427b6112f` (already in seed)
- **Steps**:
  1. Get client secret from HubSpot developer account
  2. `npx convex env set OAUTH_SECRET_HUBSPOT "<secret>"`
  3. Connect via Integrations page
- **Tools available**: 15 (contacts, companies, deals — CRUD + search)
- [ ] Connected & tested

#### 8. Jira + Confluence (shared Atlassian OAuth)
- **Steps**:
  1. Go to [developer.atlassian.com](https://developer.atlassian.com/) → Create OAuth 2.0 app
  2. Add scopes: `read:jira-work`, `write:jira-work`, `read:confluence-space.summary`, `write:confluence-content`
  3. Add callback URL: `https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback`
  4. `npx convex env set JIRA_CLIENT_ID "<client_id>"`
  5. `npx convex env set OAUTH_SECRET_JIRA "<secret>"`
  6. Re-run Jira + Confluence seed mutations
- **Jira tools**: issues CRUD, search, transitions, comments
- **Confluence tools**: spaces, pages CRUD, search
- **Note**: Both need `cloudId` — agents must call `get_accessible_resources` first
- [ ] Jira connected & tested
- [ ] Confluence connected & tested

#### 9. Figma
- **Steps**:
  1. Go to [figma.com/developers](https://www.figma.com/developers/) → Create app
  2. Add callback URL
  3. `npx convex env set FIGMA_CLIENT_ID "<client_id>"`
  4. `npx convex env set OAUTH_SECRET_FIGMA "<secret>"`
  5. Re-run Figma seed mutation
- **Note**: Figma uses comma-separated scopes (non-standard)
- [ ] Connected & tested

#### 10. Zendesk
- **Steps**:
  1. Go to Zendesk Admin → Apps & Integrations → OAuth Clients
  2. Create client with callback URL
  3. `npx convex env set ZENDESK_CLIENT_ID "<client_id>"`
  4. `npx convex env set OAUTH_SECRET_ZENDESK "<secret>"`
  5. Re-run Zendesk seed mutation
- **Note**: Requires subdomain (e.g., `yourcompany.zendesk.com`)
- [ ] Connected & tested

#### 11. Intercom
- **Steps**:
  1. Go to [developers.intercom.com](https://developers.intercom.com/) → Create app
  2. Add callback URL
  3. `npx convex env set INTERCOM_CLIENT_ID "<client_id>"`
  4. `npx convex env set OAUTH_SECRET_INTERCOM "<secret>"`
  5. Re-run Intercom seed mutation
- **Note**: No scopes in OAuth — permissions configured in Intercom dev hub
- [ ] Connected & tested

---

## Part B: Multi-Agent Missions

### Mission 2.1 — Scout → Ghost: "Competitive Content Pipeline"

**Tests**: 2-agent dependency chain, content quality from research

| # | Task | Agent | Depends On | Integration |
|---|------|-------|------------|-------------|
| 1 | Research QuantXData competitive landscape: pricing, features, data coverage, delivery methods vs Kaiko, CCData, Amber Data, CoinGecko, Messari | Scout | — | Notion |
| 2 | Write 1000-word blog post "Why Standardized Crypto Data Matters" using Scout's research findings | Ghost | Task 1 | Notion |
| 3 | Write 3 social media posts (LinkedIn + Twitter) derived from the blog post | Ghost | Task 2 | Slack |

**Success Criteria**:
- [ ] Scout completes Task 1, Sentinel approves
- [ ] Ghost wakes automatically when Task 1 completes (dependency chain fires)
- [ ] Ghost's blog post references specific findings from Scout's research (not generic)
- [ ] All 3 tasks complete within 2 hours
- [ ] Zero manual intervention

**Known Risk**: Dependency context in heartbeat truncates deliverables to 500 chars. Ghost may not see Scout's full research. **Mitigation**: Increase truncation limit to 2000 chars in `convex/http.ts` heartbeat response, or instruct Ghost to fetch full task via API.

---

### Mission 2.2 — Scout → Forge → Ghost: "Website Pipeline"

**Tests**: 3-agent chain, Forge building on research, Ghost writing from build output

| # | Task | Agent | Depends On | Integration |
|---|------|-------|------------|-------------|
| 1 | Research 5 best crypto data company websites (Kaiko, CCData, Amber, CoinGecko, Messari) — analyze design patterns, CTAs, messaging, data presentation | Scout | — | Notion |
| 2 | Improve the QuantXData landing page (from Mission 1.3 scaffold) based on Scout's design research. Push updates to GitHub. | Forge | Task 1 | GitHub |
| 3 | Write announcement copy about the improved QuantXData website + 2 social posts | Ghost | Task 2 | Slack |

**Success Criteria**:
- [ ] 3-agent dependency chain executes in order
- [ ] Forge builds on top of Mission 1.3 repo (not from scratch)
- [ ] Forge stays within turn limits (no crash)
- [ ] Total mission completes in under 4 hours

---

### Mission 2.3 — Kaze Orchestrates: "Sales Lead Research Sprint"

**Tests**: Kaze orchestration, 5-task chain, Google Sheets + Gmail integration

| # | Task | Agent | Depends On | Integration |
|---|------|-------|------------|-------------|
| 1 | Create mission plan + lead tracker spreadsheet | Kaze | — | Google Sheets |
| 2 | Research 10 crypto hedge funds/quant shops that need market data | Scout | Task 1 | Notion |
| 3 | Find decision-maker names, titles, and companies for each lead | Scout | Task 2 | Google Sheets |
| 4 | Write personalized outreach emails for each of the 10 leads | Ghost | Task 3 | Gmail (`create_draft`) |
| 5 | Review all drafts, compile final lead list, update tracker | Kaze | Task 4 | Google Sheets |

**Success Criteria**:
- [ ] Full 5-task chain completes
- [ ] Google Sheet has 10 real leads with structured data
- [ ] Gmail has 10 draft emails (not sent, just drafts)
- [ ] Kaze's final review task actually checks quality
- [ ] Total time: under 4 hours

---

### Mission 2.4 — HubSpot Integration Test: "CRM Setup"

**Tests**: HubSpot OAuth + CRUD operations

| # | Task | Agent | Depends On | Integration |
|---|------|-------|------------|-------------|
| 1 | Create a HubSpot pipeline called "QuantXData Sales Pipeline" with stages: Lead → Contacted → Demo Scheduled → Proposal → Closed Won → Closed Lost | Kaze | — | HubSpot |
| 2 | Import the 10 leads from Mission 2.3 as HubSpot contacts with company info | Kaze | Task 1, Mission 2.3 | HubSpot |

**Success Criteria**:
- [ ] HubSpot OAuth connection works
- [ ] Pipeline created with correct stages
- [ ] 10 contacts exist in HubSpot
- [ ] Total time: under 20 minutes

---

### Mission 2.5 — Jira + Confluence Test: "Project Setup"

**Tests**: Atlassian OAuth, cloudId resolution, cross-tool coordination

| # | Task | Agent | Depends On | Integration |
|---|------|-------|------------|-------------|
| 1 | Create a Confluence page "QuantXData — Go-to-Market Plan" with sections: Website, Sales, Marketing, MCP Server, Timeline | Ghost | — | Confluence |
| 2 | Create Jira issues for the top 5 action items from Mission 2.1 competitive research | Kaze | Mission 2.1 | Jira |

**Success Criteria**:
- [ ] Confluence page created with structured content
- [ ] Jira issues created and linked to research findings
- [ ] `cloudId` resolution works (agents call `get_accessible_resources` first)

---

### Mission 2.6 — Google Calendar Test: "Schedule Weekly Rituals"

**Tests**: Google Calendar integration

| Task | Agent | Integration |
|------|-------|-------------|
| Create recurring calendar events: "Monday Sales Sprint" (10am, weekly), "Wednesday Content Review" (2pm, weekly), "Friday Retro" (4pm, weekly) | Kaze | Google Calendar |

**Success Criteria**:
- [ ] 3 recurring events visible in Google Calendar
- [ ] Correct times and recurrence rules

---

## Phase 2 Summary

| Mission | Agents | Integrations | Status |
|---------|--------|-------------|--------|
| 2.1 Competitive Content Pipeline | Scout → Ghost | Notion, Slack | [ ] |
| 2.2 Website Pipeline | Scout → Forge → Ghost | Notion, GitHub, Slack | [ ] |
| 2.3 Sales Lead Sprint | Kaze, Scout, Ghost | Sheets, Notion, Gmail | [ ] |
| 2.4 HubSpot CRM Setup | Kaze | HubSpot | [ ] |
| 2.5 Jira + Confluence Setup | Ghost, Kaze | Confluence, Jira | [ ] |
| 2.6 Calendar Rituals | Kaze | Google Calendar | [ ] |

**Integration Scorecard After Phase 2**:

| Integration | Status |
|-------------|--------|
| Notion | [ ] Verified |
| Slack | [ ] Verified |
| GitHub | [ ] Verified |
| Google Sheets | [ ] Verified |
| Gmail | [ ] Verified |
| Google Calendar | [ ] Verified |
| HubSpot | [ ] Verified |
| Jira | [ ] Verified |
| Confluence | [ ] Verified |
| Figma | [ ] Verified (used in Phase 3) |
| Zendesk | [ ] Verified (used in Phase 4/5) |
| Intercom | [ ] Verified (used in Phase 4/5) |

**Phase 2 Complete When**:
- [ ] At least 4/6 multi-agent missions complete without manual intervention
- [ ] Dependency chains fire correctly
- [ ] 9+ integrations connected and verified via real API calls
- [ ] Quality loop works (Sentinel catches at least 1 issue, agent fixes it)

**Demo to Praveen**: "Three agents coordinated to build your website — Scout researched competitor sites, Forge improved the landing page, Ghost wrote announcement copy. Full dependency chain, zero humans. Plus, we have HubSpot, Jira, Confluence, and Gmail all connected."
