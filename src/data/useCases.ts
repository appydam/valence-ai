// ─── Use Case Data ──────────────────────────────────────────────────────────
// Shared between Landing page (grid preview) and UseCase detail pages

export type UseCaseCategory =
  | "sales"
  | "marketing"
  | "customer-success"
  | "operations"
  | "hr"
  | "ecommerce"
  | "agency"
  | "finance"
  | "devops"
  | "legal";

export interface UseCaseStep {
  agent: string;
  emoji: string;
  color: string;
  action: string;
  tools: { label: string; color: string }[];
  detail: string;
}

export interface UseCase {
  slug: string;
  title: string;
  icon: string;
  category: UseCaseCategory;
  categoryLabel: string;
  buyer: string;
  painPoint: string;
  trigger: string;
  accentColor: string;
  metric: string;
  hoursSaved: string;
  roi: string[];
  uniqueAngle: string;
  steps: UseCaseStep[];
  result: string;
}

export const CATEGORY_LABELS: Record<UseCaseCategory, string> = {
  sales: "Sales",
  marketing: "Marketing",
  "customer-success": "Customer Success",
  operations: "Operations",
  hr: "HR & People",
  ecommerce: "E-commerce",
  agency: "Agency",
  finance: "Finance",
  devops: "DevOps",
  legal: "Legal & Compliance",
};

export const CATEGORY_ICONS: Record<UseCaseCategory, string> = {
  sales: "💰",
  marketing: "📣",
  "customer-success": "🤝",
  operations: "⚙️",
  hr: "👥",
  ecommerce: "🛒",
  agency: "🏢",
  finance: "📈",
  devops: "🔧",
  legal: "⚖️",
};

export const USE_CASES: UseCase[] = [
  // ─── Sales ────────────────────────────────────────────────────────────────
  {
    slug: "close-pipeline-faster",
    title: "Close pipeline 3× faster",
    icon: "🚀",
    category: "sales",
    categoryLabel: "Sales",
    buyer: "VP Sales / Head of Revenue, B2B SaaS (50–500 employees)",
    painPoint:
      "SDRs spend 70% of their time on research and email writing, not selling. For every 50 leads, a human SDR spends 15–20 minutes per account just pulling data from LinkedIn, Gong, and HubSpot. Then another 10 minutes writing a personalized email. That's 25+ hours of manual work — for one batch. Meanwhile, hot leads go cold and reps burn out on admin, not closing.",
    trigger:
      "Research our top 50 Salesforce leads and book demos this week",
    accentColor: "hsl(217, 91%, 60%)",
    metric: "48 hrs · 12 demos booked · saves 14 hrs/week",
    hoursSaved: "14 hrs/week saved · replaces 1 SDR ($65k/yr)",
    roi: [
      "14 hrs/week saved per SDR — time redirected to live calls",
      "Replaces 1 full SDR headcount ($65k/yr fully loaded)",
      "12 demos booked from 50 leads in 48 hours",
      "Zero generic emails sent — Sentinel quality-gates every single one",
      "3× pipeline velocity: leads contacted same-day instead of waiting in queue",
    ],
    uniqueAngle:
      "Sentinel quality-gates every email — no generic AI slop gets sent to your prospects. Multi-agent coordination means Scout's deep research (Gong call transcripts, HubSpot deal history, LinkedIn activity, company news) directly feeds Ghost's hyper-personalization. The result: emails that reference the prospect's last Gong call, their Q3 pipeline gap, and their recent LinkedIn post. No single tool or chatbot can do research → write → review → send → book across 6 platforms autonomously.",
    steps: [
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Pulls 50 open leads from Salesforce, cross-references HubSpot engagement scores",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Slack", color: "#4A154B" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "50 leads loaded · priority-ranked by deal size + last touch · assigned to Scout + Ghost",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Deep-researches each account — Gong calls, LinkedIn activity, company news, tech stack",
        tools: [
          { label: "Gong", color: "#9B59B6" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Apollo.io", color: "#4A90D9" },
          { label: "LinkedIn", color: "#0A66C2" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "12 high-intent signals found · 3 accounts re-opened stalled deals · 8 buying committee members identified via Apollo",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes 50 hyper-personalized outreach emails referencing research findings",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Outreach", color: "#5951FF" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "Each email references last Gong call + deal history + company news · 50 drafts created in Outreach sequences",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Reviews every email against quality rubric — rejects 8 generic ones",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "Quality gate: PASS 42 · REJECTED 8 (too generic, missing personalization, wrong tone)",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Rewrites rejected 8 with MindTickle sales playbook applied + Salesloft cadence alignment",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "MindTickle", color: "#E44D26" },
          { label: "Salesloft", color: "#00B8A9" },
        ],
        detail: "Sentinel re-check: all 50 PASS · playbook-compliant messaging confirmed",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Sends emails, books demos via Calendly, logs everything in Salesforce + Slack notification",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Google Calendar", color: "#4285F4" },
          { label: "Calendly", color: "#006BFF" },
          { label: "Zoom", color: "#2D8CFF" },
          { label: "Slack", color: "#4A154B" },
        ],
        detail: "12 demos booked · Zoom links auto-generated · CRM updated · #sales-wins notified",
      },
    ],
    result:
      "50 personalized emails sent. 12 demos booked. Salesforce, HubSpot, Calendly & Zoom synced. Pipeline moved $340k forward in 48 hours.",
  },
  {
    slug: "enrich-score-leads",
    title: "Enrich & score every inbound lead in 90 seconds",
    icon: "⚡",
    category: "sales",
    categoryLabel: "Sales",
    buyer: "RevOps Manager / SDR Team Lead, B2B SaaS (Series A–C)",
    painPoint:
      "Inbound leads sit in HubSpot or Salesforce for hours — sometimes days — before anyone researches them. Harvard Business Review found that responding within 5 minutes makes you 100× more likely to connect. But manual enrichment takes 15–20 minutes per lead: check LinkedIn, look up the company, find the tech stack, assess ICP fit. By the time your SDR gets to it, the lead has already booked a demo with your competitor.",
    trigger:
      "New lead hits HubSpot → auto-enrich, score, and route to the right rep within 90 seconds",
    accentColor: "hsl(45, 93%, 47%)",
    metric: "90 sec response · 2.5× conversion · saves 3 hrs/day",
    hoursSaved: "3 hrs/day saved per SDR · speed-to-lead under 2 min",
    roi: [
      "90-second response time (vs 4+ hours industry average)",
      "2.5× higher conversion on inbound leads",
      "3 hrs/day saved on manual SDR research per rep",
      "Every lead gets a personalized first-touch email before a human even looks",
      "Lead routing accuracy: right rep gets right lead every time based on territory + ICP fit",
    ],
    uniqueAngle:
      "Not just enrichment (Apollo does that) and not just scoring (HubSpot has lead scoring). It's enrichment + ICP scoring + personalized email draft + intelligent routing + quality audit — all in 90 seconds, fully autonomous. No human touches the lead until it's research-complete, scored, email-drafted, and routed. The combination of Scout's deep enrichment feeding Ghost's personalized email is what makes this impossible for any single tool.",
    steps: [
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Detects new lead via HubSpot webhook, checks for duplicates in Salesforce",
        tools: [
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Salesforce", color: "#00A1E0" },
        ],
        detail: "Lead captured: Jane Smith, VP Engineering @ Acme Corp · no duplicate found · processing started",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Enriches via Apollo + LinkedIn — company size, funding, tech stack, org chart",
        tools: [
          { label: "Apollo.io", color: "#4A90D9" },
          { label: "LinkedIn", color: "#0A66C2" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "Series B · 120 employees · uses React + AWS · $18M raised · CTO reports to CEO directly",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Scores lead against ICP matrix + checks Mixpanel for product usage signals",
        tools: [
          { label: "Mixpanel", color: "#7856FF" },
          { label: "Google Analytics", color: "#E37400" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "ICP score: 87/100 · High intent: visited pricing page 3×, read case study, watched demo video",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Drafts personalized first-touch email referencing their tech stack + funding",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Outreach", color: "#5951FF" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "Email references their React migration, recent Series B, and how our tool fits their stack · loaded into Outreach sequence",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Routes to best-fit rep in Salesforce + sends Slack alert with full dossier + Calendly link",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Slack", color: "#4A154B" },
          { label: "Calendly", color: "#006BFF" },
          { label: "Microsoft Teams", color: "#6264A7" },
        ],
        detail: "Assigned to Sarah (enterprise rep, West Coast territory) · full research dossier attached · Calendly booking link included",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Logs enrichment quality + updates Looker dashboard for RevOps tracking",
        tools: [
          { label: "Looker", color: "#4285F4" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Airtable", color: "#18BFFF" },
        ],
        detail: "Enrichment accuracy: 94% · Model confidence: high · RevOps dashboard auto-updated",
      },
    ],
    result:
      "Lead fully enriched, scored 87/100, email drafted, loaded into Outreach, and routed to the right rep — all in under 90 seconds. Rep picks up the phone with a full dossier.",
  },

  // ─── Marketing ────────────────────────────────────────────────────────────
  {
    slug: "case-study-pipeline",
    title: "Turn every closed deal into a case study",
    icon: "📝",
    category: "marketing",
    categoryLabel: "Marketing",
    buyer: "Head of Marketing / Content Lead, B2B SaaS (Series A–C)",
    painPoint:
      "Case studies are the #1 conversion driver — 73% of B2B buyers say case studies are the most influential content in their buying decision. But most teams only produce 2–3 per year because the process is brutal: chase customers for quotes, pull deal data from 4 systems, write drafts, get internal + customer approvals, format for web + PDF + social, then distribute. A single case study takes 40+ hours and 3+ months from start to publish.",
    trigger:
      "Deal marked 'Closed Won' in Salesforce + customer NPS ≥ 8 in Intercom",
    accentColor: "hsl(258, 90%, 66%)",
    metric: "48 hrs per case study · 10× more/year · 5 hrs saved each",
    hoursSaved: "5 hrs saved per case study · from 3 to 30+ per year",
    roi: [
      "10× more case studies per year (from 3 to 30+)",
      "5 hrs saved per case study (research + writing + formatting + distribution)",
      "Case study draft within 48 hrs of deal close (vs 3+ months)",
      "Multi-format output: long-form case study + LinkedIn post + tweet thread + email snippet + Google Doc for customer review",
      "Pipeline impact: case studies drive 2–3× higher conversion than any other content type",
    ],
    uniqueAngle:
      "The trigger is automatic (Closed Won + NPS ≥ 8 from Intercom), not a human remembering to ask marketing to write one. Real deal data from Salesforce + Stripe revenue + Intercom support history makes the draft 80% done. One trigger produces 5 content formats. Sentinel cross-checks every number against source data so no fake metrics get published. Ghost drafts in your brand voice. The full loop — detect → research → write → verify → distribute — runs without a human until the CSM clicks 'approve'.",
    steps: [
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Detects Closed Won in Salesforce + high NPS score in Intercom + payment confirmed in Stripe",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Intercom", color: "#286EFA" },
          { label: "Stripe", color: "#6772E5" },
        ],
        detail: "Deal: Acme Corp · $120k ACV · NPS 9/10 · 4-month sales cycle · Stripe subscription active",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls full deal timeline — Gong calls, support tickets, product usage, revenue data",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Gong", color: "#9B59B6" },
          { label: "Intercom", color: "#286EFA" },
          { label: "Mixpanel", color: "#7856FF" },
          { label: "Stripe", color: "#6772E5" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "Full deal timeline reconstructed from 6 sources · 3 key outcomes quantified · 2 customer quotes pulled from Gong transcripts",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Drafts 1,500-word case study (problem → solution → results) + creates Google Doc for customer review",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
          { label: "Google Drive", color: "#34A853" },
        ],
        detail: "1,500-word draft · 3 pull quotes from Gong · real metrics from Stripe · Google Doc shared with CSM",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Creates LinkedIn post + tweet thread + email snippet + blog excerpt from the case study",
        tools: [
          { label: "LinkedIn", color: "#0A66C2" },
          { label: "Twitter / X", color: "#1DA1F2" },
          { label: "MailChimp", color: "#FFE01B" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "5 content formats from 1 case study · LinkedIn post drafted · 6-tweet thread ready · email snippet for nurture sequence",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Reviews all content for accuracy — cross-checks every metric against Salesforce + Stripe source data",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Stripe", color: "#6772E5" },
        ],
        detail: "All figures verified · 1 revenue stat corrected against Stripe · customer quote verified against Gong transcript",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Sends draft to CSM for approval via Gmail + schedules content distribution via Slack + logs in Asana",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Slack", color: "#4A154B" },
          { label: "Asana", color: "#F06A6A" },
          { label: "Google Calendar", color: "#4285F4" },
        ],
        detail: "CSM notified via email + Slack · Asana task created for content team · distribution scheduled for next Tuesday",
      },
    ],
    result:
      "Case study + LinkedIn post + tweet thread + email snippet + Google Doc produced within 48 hrs of deal close. Every number verified against Salesforce + Stripe. CSM just clicks approve.",
  },
  {
    slug: "competitive-intel-radar",
    title: "Competitive intel radar — know first",
    icon: "🔔",
    category: "marketing",
    categoryLabel: "Marketing",
    buyer: "Product Marketing Manager / VP Marketing, competitive SaaS or fintech markets",
    painPoint:
      "Competitor tracking is a black hole. Product marketing manually checks competitor websites monthly, scans Twitter, reads G2 reviews, and monitors job postings for hiring signals. By the time you know about a competitor's new feature or pricing change, your sales team has already lost 3 deals to it. Dedicated competitive intel tools like Klue and Crayon cost $30k+/yr and still require humans to synthesize and distribute insights. Your battle cards are always 3 months stale.",
    trigger:
      "Every Monday: scan all competitors and brief me on anything that changed this week",
    accentColor: "hsl(0, 72%, 51%)",
    metric: "Weekly · 6 hrs saved · battle cards always current",
    hoursSaved: "6 hrs/week saved · catch moves in days not months",
    roi: [
      "6 hrs/week saved on competitive research across 3–5 competitors",
      "Sales team always has current battle cards — updated same day as competitor change",
      "Catch competitor moves within days (vs months with manual tracking)",
      "Automated distribution to sales, product, and leadership — no human bottleneck",
      "Save $30k+/yr vs dedicated competitive intel tools (Klue, Crayon)",
    ],
    uniqueAngle:
      "Not just monitoring (Klue/Crayon do that for $30k/yr). It's the full loop automated: monitoring competitor websites + G2 + ad platforms + job boards → synthesizing into actionable insights → updating battle cards in Notion → distributing via Slack to sales + product + leadership. Scout researches across 8 sources, Ghost writes battle cards in your sales team's language, Sentinel fact-checks every claim, Kaze distributes to the right channels. No human involved until the brief lands.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Monitors competitor websites, Product Hunt, HackerNews, G2, Capterra, and LinkedIn job postings",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Airtable", color: "#18BFFF" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "5 competitors tracked · 2 pricing changes · 1 new feature launch · 3 new engineering hires (expansion signal)",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls competitor ad spend changes from Google Ads + Meta Ads + analyzes their SEO shifts",
        tools: [
          { label: "Google Ads", color: "#4285F4" },
          { label: "Meta Ads", color: "#1877F2" },
          { label: "Google Search Console", color: "#4285F4" },
          { label: "Google Analytics", color: "#E37400" },
        ],
        detail: "Competitor A increased ad spend 40% · new campaign targeting our brand keywords · their organic traffic up 22%",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Synthesizes weekly competitive brief with threat assessment and opportunity mapping",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Confluence", color: "#0052CC" },
        ],
        detail: "3 key changes · 1 threat (pricing undercut) · 1 opportunity (competitor dropped feature we have) · trend analysis included",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Updates battle cards for sales team + drafts competitive positioning email for leadership",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "2 battle cards updated · 4 new objection handlers · leadership memo drafted · competitive one-pager refreshed",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Fact-checks all claims against original sources — verifies pricing, features, hiring data",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "All claims verified · 1 pricing figure corrected (was cached, not current) · source URLs documented",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Distributes brief via Slack + email to leadership + updates Notion competitive wiki + creates Jira tickets for product response",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "JIRA", color: "#0052CC" },
        ],
        detail: "Brief in #competitive · leadership email sent · wiki updated · 1 Jira ticket created for product team to respond to competitor feature",
      },
    ],
    result:
      "Weekly competitive brief + updated battle cards + leadership memo delivered every Monday by 9am. Sales team never goes into a call uninformed. Product team has Jira tickets for competitive response.",
  },

  // ─── Customer Success ─────────────────────────────────────────────────────
  {
    slug: "predict-prevent-churn",
    title: "Predict & prevent churn before renewal",
    icon: "🛡️",
    category: "customer-success",
    categoryLabel: "Customer Success",
    buyer: "VP Customer Success / CS Ops, SaaS with annual contracts ($2M+ ARR)",
    painPoint:
      "Churn signals are scattered across 6+ systems and no one connects the dots. Support ticket volume is in Zendesk, engagement metrics in Intercom, payment failures in Stripe, product usage in Mixpanel, NPS in Typeform, and renewal dates in Salesforce. Your CSMs manually review 50+ accounts each — spending hours pulling data from different tabs. By the time someone notices the churn risk, the renewal is 30 days out and the customer has already mentally churned. A single churned enterprise account costs you $100k+ in lost ARR.",
    trigger:
      "Daily: scan all accounts renewing in 90 days for churn risk signals across all platforms",
    accentColor: "hsl(160, 84%, 39%)",
    metric: "Daily scans · catch risks 60 days early · save 15–25% churn",
    hoursSaved: "20 hrs/week saved on manual account reviews",
    roi: [
      "Catch churn risks 60 days earlier than manual review",
      "Reduce churn by 15–25% through proactive intervention",
      "Save $500k+ ARR for a company with $5M ARR",
      "Proactive outreach triggered automatically for at-risk accounts — no CSM has to remember",
      "Prediction accuracy improves over time via Valence AI's memory system",
    ],
    uniqueAngle:
      "Not a churn prediction tool (those cost $50k+/yr, take 6 months to implement, and only show scores in a dashboard). This connects 6+ data sources you already have, synthesizes signals no single tool can see (support volume + payment failures + usage decline + NPS drop = definitive churn signal), generates personalized save emails, books proactive meetings, and alerts the right CSM — all autonomously. The memory system means it learns from every prediction: which signals actually predicted churn, which save emails worked, which accounts were false alarms.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls renewal calendar from Salesforce — next 90 days — enriched with deal size + CSM owner",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "23 accounts renewing · $1.8M total ARR at risk · sorted by deal size descending",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Cross-references health signals: Zendesk tickets, Intercom engagement, Stripe payments, Mixpanel usage, NPS",
        tools: [
          { label: "Zendesk", color: "#03363D" },
          { label: "Intercom", color: "#286EFA" },
          { label: "Stripe", color: "#6772E5" },
          { label: "Mixpanel", color: "#7856FF" },
          { label: "Typeform", color: "#262627" },
        ],
        detail: "5 accounts flagged: 2 Red (usage -40% + 8 tickets + NPS dropped) · 3 Yellow (usage flat + payment failed once)",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Scores each account: Green / Yellow / Red with specific risk factors + confidence level",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Looker", color: "#4285F4" },
          { label: "Airtable", color: "#18BFFF" },
        ],
        detail: "Red: Acme Corp ($180k, usage -40%, 8 tickets, NPS 4→2) · Red: Beta Inc ($95k, payment failed 2×, no login 21 days)",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Drafts personalized check-in emails for Yellow/Red accounts — each references their specific usage patterns",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Outreach", color: "#5951FF" },
        ],
        detail: "5 save emails drafted · Acme: references their declining feature usage and offers training · Beta: acknowledges billing issue and offers a call",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Alerts CSM via Slack with full account dossier + books proactive review meetings + updates Salesforce",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Google Calendar", color: "#4285F4" },
          { label: "Zoom", color: "#2D8CFF" },
          { label: "Salesforce", color: "#00A1E0" },
        ],
        detail: "2 urgent Slack alerts with full dossiers · 5 Zoom review meetings booked this week · Salesforce renewal risk field updated",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Tracks prediction accuracy over time + monitors which save strategies work best",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Looker", color: "#4285F4" },
          { label: "Gainsight", color: "#FF5B27" },
        ],
        detail: "Last month: 4/5 Red accounts predicted correctly · training-offer emails had 3× response rate vs generic check-ins",
      },
    ],
    result:
      "5 at-risk accounts identified 60 days before renewal. CSMs got full dossiers + personalized save emails + booked meetings. 3 of 5 Red accounts saved after proactive outreach. Net churn reduced 22%.",
  },

  // ─── Operations ───────────────────────────────────────────────────────────
  {
    slug: "ceo-briefing-autopilot",
    title: "Weekly CEO briefing, on autopilot",
    icon: "📊",
    category: "operations",
    categoryLabel: "Operations",
    buyer: "Chief of Staff / Head of Ops / CEO, companies with 50–200 employees",
    painPoint:
      "Someone — usually the Chief of Staff or ops lead — spends 4–6 hours every Friday manually pulling numbers from Stripe (revenue), Salesforce (pipeline), Zendesk (support), Google Ads (marketing), Google Analytics (traffic), and Gusto (headcount). Then they paste it all into a Google Doc, write the narrative, format it for the board, and pray the numbers are correct. The CFO always finds an error. The CEO always asks for one more data point. This cycle repeats 52 times per year — that's 250+ hours of one person's time on a task that should take zero.",
    trigger:
      "Every Friday 6pm: prepare the Monday morning executive briefing across all departments",
    accentColor: "hsl(38, 92%, 50%)",
    metric: "Weekly · saves 4 hrs every Friday · 200 hrs/year",
    hoursSaved: "4 hrs/week saved · 200 hrs/year per company",
    roi: [
      "4 hrs/week saved (200+ hrs/year)",
      "Board-ready brief every Monday morning — never late, never missed",
      "Every number verified against source data — zero embarrassing errors in front of the board",
      "Replaces a full-time ops analyst's weekly reporting duty",
      "Historical trend analysis included automatically — WoW and MoM comparisons",
    ],
    uniqueAngle:
      "Not a BI dashboard (executives don't log into dashboards — they want a brief in Slack). Not a Zapier automation (can't write narrative insights). This pulls from 8+ real data sources, writes a 1,200-word narrative brief with insights, risks and recommendations, fact-checks every number against raw source data, and delivers it to Slack + Notion + email before Monday — with a review meeting already booked. The full exec-ready package, autonomously produced every week.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls revenue + pipeline + ARR metrics from Stripe, Salesforce, and QuickBooks",
        tools: [
          { label: "Stripe", color: "#6772E5" },
          { label: "Salesforce", color: "#00A1E0" },
          { label: "QuickBooks", color: "#2CA01C" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "$284k MRR (+3.2% WoW) · 12 deals closing this month · 3 churn risks flagged · burn rate on track",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls support health from Zendesk + Intercom + Freshdesk + product NPS from Typeform",
        tools: [
          { label: "Zendesk", color: "#03363D" },
          { label: "Intercom", color: "#286EFA" },
          { label: "Freshdesk", color: "#2DB875" },
          { label: "Typeform", color: "#262627" },
        ],
        detail: "CSAT 4.6/5 · 8 critical tickets (down from 12 last week) · avg 2.1hr response · NPS +42",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls marketing performance from ad platforms + analytics + social",
        tools: [
          { label: "Meta Ads", color: "#1877F2" },
          { label: "Google Ads", color: "#4285F4" },
          { label: "Google Analytics", color: "#E37400" },
          { label: "Looker", color: "#4285F4" },
          { label: "LinkedIn", color: "#0A66C2" },
        ],
        detail: "$42k ad spend · 3.2× ROAS · CPL down 18% WoW · website traffic +12% · LinkedIn impressions +45%",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes 1,200-word executive brief with highlights, risks, recommendations + WoW/MoM trends",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "1,200-word brief · 3 risks flagged · 2 opportunities identified · WoW + MoM trend charts included",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Fact-checks every number against raw source data — flags any discrepancies with explanations",
        tools: [
          { label: "Stripe", color: "#6772E5" },
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "All 28 figures verified · 1 MRR discrepancy corrected (Stripe had pending refund not yet processed)",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Delivers brief via Slack + Notion + email to C-suite + books Monday review meeting",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Google Calendar", color: "#4285F4" },
          { label: "Zoom", color: "#2D8CFF" },
        ],
        detail: "Brief live in #leadership by 7pm Friday · email to CEO/CFO/CRO · review booked Monday 9am with Zoom link",
      },
    ],
    result:
      "Board-ready brief every Monday. 28 metrics from 8 sources, all verified. Delivered Friday 7pm to Slack, Notion, and email. CEO opens Monday with zero prep needed.",
  },

  // ─── HR ───────────────────────────────────────────────────────────────────
  {
    slug: "new-hire-onboarding",
    title: "New hire fully set up before day 1",
    icon: "🎯",
    category: "hr",
    categoryLabel: "HR & People",
    buyer: "Head of People / HR Ops, growing companies (20+ hires/year)",
    painPoint:
      "New hire onboarding involves 4–6 hours of manual work spread across IT, HR, and the hiring manager: provisioning accounts across 8+ tools that don't talk to each other, setting up payroll and benefits, writing welcome emails, creating a 30/60/90 plan, booking intro meetings, and confirming everything is live. Half the time something is missed — a Jira account that wasn't provisioned, a Gusto enrollment that slipped through — and IT gets a ticket on day 1. For companies hiring 50+ people per year, that's 300+ hours wasted on repetitive provisioning that should be automated.",
    trigger:
      "Offer accepted in Greenhouse — onboard Alex Chen, Sales Engineer, start date March 3",
    accentColor: "hsl(160, 84%, 39%)",
    metric: "Day 0 · saves 6 hrs per hire · zero IT tickets",
    hoursSaved: "6 hrs/hire saved · zero IT tickets on day 1",
    roi: [
      "6 hrs saved per new hire (from offer acceptance to day 1)",
      "Zero IT tickets on first day — 100% tool provisioning accuracy",
      "Personalized 30/60/90 plan + welcome email automatically drafted based on role",
      "Manager gets a fully prepped hire: accounts live, meetings booked, buddy assigned",
      "For 50 hires/year: 300 hrs saved = 1.5 full-time IT coordinator replaced",
    ],
    uniqueAngle:
      "Not an HRIS feature (BambooHR can't provision GitHub or Jira). Not an IT automation tool (SailPoint can't write welcome emails or book intro meetings). This orchestrates across 10+ tools that don't talk to each other — Greenhouse, GitHub, Notion, Jira, Confluence, Gusto, Workday, Gmail, Calendar, Zoom, ServiceNow — and confirms everything is live before day 1. Forge provisions, Ghost writes, Kaze books, Sentinel verifies. The entire HR + IT + manager workflow in one trigger.",
    steps: [
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Detects offer accepted in Greenhouse, pulls role details + start date + team info",
        tools: [
          { label: "Greenhouse", color: "#24A47F" },
          { label: "BambooHR", color: "#73C41D" },
          { label: "Slack", color: "#4A154B" },
        ],
        detail: "Role: Sales Engineer · Start: March 3 · Team: Revenue · Manager: Sarah Kim · #hr-ops notified",
      },
      {
        agent: "Forge",
        emoji: "🔨",
        color: "hsl(38, 92%, 50%)",
        action: "Provisions access across all dev + collaboration tools based on role template",
        tools: [
          { label: "GitHub", color: "#e2e8f0" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "JIRA", color: "#0052CC" },
          { label: "Confluence", color: "#0052CC" },
          { label: "Asana", color: "#F06A6A" },
          { label: "Figma", color: "#F24E1E" },
        ],
        detail: "6 accounts created · permissions set by role template (Sales Engineer) · added to correct teams + projects",
      },
      {
        agent: "Forge",
        emoji: "🔨",
        color: "hsl(38, 92%, 50%)",
        action: "Sets up payroll in Gusto + benefits in Workday + orders equipment via ServiceNow",
        tools: [
          { label: "Gusto", color: "#FB4F14" },
          { label: "Workday", color: "#F5820D" },
          { label: "ServiceNow", color: "#62D84E" },
          { label: "ADP Workforce Now", color: "#D0271D" },
        ],
        detail: "Payroll enrolled · benefits portal invite sent · MacBook Pro ordered (arriving March 1) · ADP records synced",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Sends personalized welcome email + creates role-specific 30/60/90 plan in Notion + assigns buddy",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
          { label: "Slack", color: "#4A154B" },
        ],
        detail: "Welcome email sent from HR · 30/60/90 plan with Sales Engineer-specific milestones · buddy: Mark (Senior SE) pinged in Slack",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Books week 1 intro meetings with team, skip-level, and cross-functional partners",
        tools: [
          { label: "Google Calendar", color: "#4285F4" },
          { label: "Calendly", color: "#006BFF" },
          { label: "Zoom", color: "#2D8CFF" },
          { label: "Microsoft Teams", color: "#6264A7" },
        ],
        detail: "8 intros scheduled · manager 1:1 booked day 1 · skip-level with VP on day 3 · cross-team intros days 2–5",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Confirms all 10 systems are live + runs verification checklist + logs completion in ServiceNow",
        tools: [
          { label: "ServiceNow", color: "#62D84E" },
          { label: "Slack", color: "#4A154B" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "JIRA", color: "#0052CC" },
        ],
        detail: "All 10 systems green · equipment shipped · HR, IT, and manager confirmed · zero open items · ServiceNow ticket auto-closed",
      },
    ],
    result:
      "New hire fully onboarded across 10 tools before day 1. Zero IT tickets. Zero missed accounts. Manager gets a prepped employee with meetings booked, buddy assigned, and 30/60/90 plan ready.",
  },

  // ─── E-commerce ───────────────────────────────────────────────────────────
  {
    slug: "competitor-price-response",
    title: "React to competitor price changes in real-time",
    icon: "🏷️",
    category: "ecommerce",
    categoryLabel: "E-commerce",
    buyer: "E-commerce Director / Head of Growth, DTC brands or marketplace sellers",
    painPoint:
      "Competitors change prices, launch flash sales, and run promotions constantly. By the time you manually check their Shopify store, notice the price drop, analyze your margins, decide on a response, draft a counter-promotion, and send it — you've lost 24–48 hours of sales. For a brand doing $5M+/yr, a 2-day delayed response to a competitor undercutting you on your top 10 SKUs can cost $15k–$30k in lost revenue per incident. Manual price monitoring across 10+ competitors and 100+ SKUs is impossible.",
    trigger:
      "Monitor top 10 competitor stores daily. Alert + recommend action on any price change >5%",
    accentColor: "hsl(280, 70%, 50%)",
    metric: "Daily · 3–8% revenue lift · 10 hrs/week saved",
    hoursSaved: "10 hrs/week saved on competitive price monitoring",
    roi: [
      "3–8% revenue lift from faster price response on top SKUs",
      "10 hrs/week saved on manual competitive monitoring across 10+ competitors",
      "Never miss a competitor sale, promotion, or price cut again",
      "Counter-promotional campaigns drafted and ready to send within 1 hour of detection",
      "Historical accuracy tracking: learn which response strategies actually lift revenue",
    ],
    uniqueAngle:
      "Not just price monitoring (Prisync costs $1k/mo and only shows you data). This is the full competitive response loop: monitoring → margin analysis → response recommendation → counter-campaign creation → team notification. Scout detects the change and analyzes your Shopify margins. Ghost drafts email + SMS counter-campaigns via Klaviyo. Kaze routes recommendations to the pricing team in Slack with Asana tasks. Sentinel tracks which responses actually increased revenue over time.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Scrapes competitor Shopify/WooCommerce stores for price changes on 100+ tracked SKUs",
        tools: [
          { label: "Shopify", color: "#96BF48" },
          { label: "WooCommerce", color: "#96588A" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Airtable", color: "#18BFFF" },
        ],
        detail: "Competitor A dropped Widget Pro from $49 → $39 (-20%) · Competitor B launched 15% off sitewide · tracked in Airtable",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Analyzes: temporary sale or permanent change? Cross-references your Shopify margins + Stripe revenue data",
        tools: [
          { label: "Shopify", color: "#96BF48" },
          { label: "Stripe", color: "#6772E5" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "Pattern analysis: likely 7-day sale (based on past behavior) · Your margin at $42 still yields 38% profit · Recommendation: counter-promote",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Drafts promotional email + SMS campaign via Klaviyo + social post for Instagram + TikTok",
        tools: [
          { label: "Klaviyo", color: "#2D2D2D" },
          { label: "MailChimp", color: "#FFE01B" },
          { label: "ActiveCampaign", color: "#004CFF" },
          { label: "Instagram", color: "#E4405F" },
          { label: "TikTok", color: "#010101" },
        ],
        detail: "Flash sale email drafted · SMS follow-up queued for 4hrs later · Instagram story mockup · TikTok caption · all ready for approval",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Posts recommendation to Slack + creates Asana task for pricing team + updates Monday.com board",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Asana", color: "#F06A6A" },
          { label: "Monday.com", color: "#FF3D57" },
          { label: "Gmail", color: "#EA4335" },
        ],
        detail: "Pricing alert in #ecom-ops · Asana task assigned to pricing lead · Monday.com board updated · brand manager emailed",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Tracks recommendation accuracy over time + monitors revenue impact of each response via Shopify + Looker",
        tools: [
          { label: "Shopify", color: "#96BF48" },
          { label: "Looker", color: "#4285F4" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "Last 10 counter-promotions: 7 resulted in revenue lift avg +$4.2k · 2 no impact · 1 negative (over-discounted)",
      },
    ],
    result:
      "Competitor price drop detected at 6am. Margin analysis complete by 6:05am. Counter-campaign drafted by 6:30am. Pricing team approves by 9am. Emails + SMS + social sent by 10am. Revenue protected.",
  },

  // ─── Agency ───────────────────────────────────────────────────────────────
  {
    slug: "client-reporting-autopilot",
    title: "Client reporting that writes itself",
    icon: "📋",
    category: "agency",
    categoryLabel: "Agency",
    buyer: "Account Director / Agency Owner, digital marketing agencies (5–50 clients)",
    painPoint:
      "Agencies spend 8–15 hours per week per client pulling data from Google Ads, Meta Ads, TikTok Ads, Google Analytics, Search Console, Shopify, and social platforms. Then writing narrative reports explaining what happened, why, and what to do next. Then formatting, getting internal review, and sending to clients. It's the #1 time sink, #1 reason for AM burnout, and #1 reason agencies can't scale past 15 clients per AM. Clients expect weekly reports but agencies can barely do monthly. The irony: clients don't even want dashboards — they want someone to tell them what's working and what to change.",
    trigger:
      "Every Friday 3pm: generate weekly performance reports for all active clients with narrative analysis",
    accentColor: "hsl(200, 80%, 50%)",
    metric: "Weekly · 8–15 hrs/week saved · serve 2× more clients",
    hoursSaved: "8–15 hrs/week saved per account manager",
    roi: [
      "8–15 hrs/week saved per account manager on reporting",
      "Go from monthly to weekly reporting — clients love you for it",
      "Serve 2× more clients with the same team size",
      "Every number verified against source data — no embarrassing errors in client-facing reports",
      "Revenue impact: better reporting → higher client retention → 20% less churn",
    ],
    uniqueAngle:
      "Not a reporting dashboard (clients don't log into dashboards). Not a data aggregator (those show tables, not insights). Ghost writes the narrative — 'CTR dropped 12% because we paused Campaign X on Tuesday, but ROAS is up 0.3× from the new creative test we launched Thursday. Recommendation: double budget on the new creative.' That's what clients actually want: analysis, not data. Sentinel makes sure every number matches the source platform. Kaze delivers via email with professional formatting.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls ad performance from Google Ads + Meta Ads + TikTok Ads per client with WoW comparison",
        tools: [
          { label: "Google Ads", color: "#4285F4" },
          { label: "Meta Ads", color: "#1877F2" },
          { label: "TikTok Ads", color: "#010101" },
          { label: "Google Campaign Manager", color: "#4285F4" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "Client A: 3.1× ROAS (+0.4 WoW) · Client B: CPL down 14% · Client C: TikTok CPA $12 (best ever)",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls website analytics from GA4 + Search Console + Mixpanel conversion data",
        tools: [
          { label: "Google Analytics", color: "#E37400" },
          { label: "Google Search Console", color: "#4285F4" },
          { label: "Mixpanel", color: "#7856FF" },
          { label: "Segment", color: "#52BD94" },
        ],
        detail: "Client A: traffic +18% · Client B: bounce rate -8%, 3 new top-10 keywords · Client C: conversion rate +1.2pp",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls social metrics + e-commerce revenue from Shopify + email performance from Klaviyo",
        tools: [
          { label: "Instagram", color: "#E4405F" },
          { label: "LinkedIn", color: "#0A66C2" },
          { label: "YouTube", color: "#FF0000" },
          { label: "Shopify", color: "#96BF48" },
          { label: "Klaviyo", color: "#2D2D2D" },
        ],
        detail: "Client A: Instagram engagement +22% · Client B: Shopify revenue $48k (+12%) · Client C: Klaviyo open rate 28%",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes narrative report per client: executive summary + channel breakdown + recommendations + next week plan",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
          { label: "Google Drive", color: "#34A853" },
        ],
        detail: "3 reports drafted · each has exec summary + channel breakdown + 3 recommendations + next week action items · Google Doc links generated",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Cross-checks every number against source platforms — catches rounding errors + stale data",
        tools: [
          { label: "Google Ads", color: "#4285F4" },
          { label: "Meta Ads", color: "#1877F2" },
          { label: "Google Analytics", color: "#E37400" },
        ],
        detail: "All figures verified · 2 rounding errors corrected · 1 stale GA4 metric refreshed · source timestamps documented",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Delivers reports via email to clients + posts to Notion/Slack for internal review + logs in Asana",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Slack", color: "#4A154B" },
          { label: "Asana", color: "#F06A6A" },
          { label: "Front", color: "#394049" },
        ],
        detail: "3 client emails sent via Front shared inbox · internal Slack thread for feedback · Asana tasks for next week's actions · delivered Friday 4:30pm",
      },
    ],
    result:
      "Weekly narrative reports for all clients. Delivered Friday afternoon with exec summaries, channel breakdowns, and strategic recommendations. Every number verified. Account managers spent zero time on reporting this week.",
  },

  // ─── Finance ──────────────────────────────────────────────────────────────
  {
    slug: "month-end-close-prep",
    title: "Month-end close prep in hours, not days",
    icon: "🧮",
    category: "finance",
    categoryLabel: "Finance",
    buyer: "Controller / VP Finance, mid-market companies ($5M–$50M revenue)",
    painPoint:
      "Month-end close takes 5–10 business days. The actual accounting is fast — the prep work kills you. Pulling revenue data from Stripe, expense data from QuickBooks, payroll from Gusto, corporate card transactions from Ramp, and AR/AP from NetSuite or Xero. Then manually reconciling: do Stripe deposits match QuickBooks? Are all Ramp expenses categorized? Did Gusto payroll clear? Your controller spends 20+ hours on data aggregation that should be automated. And the CFO always finds a number that doesn't match because someone pulled from the wrong date range.",
    trigger:
      "Last business day of month: pull all data sources, reconcile, and prepare close package for CFO",
    accentColor: "hsl(142, 71%, 45%)",
    metric: "Monthly · close 3–5 days faster · 20+ hrs saved",
    hoursSaved: "20+ hrs/month saved on data pulling + reconciliation",
    roi: [
      "Close 3–5 business days faster",
      "20+ hrs/month saved on manual data pulling and reconciliation",
      "Catch reconciliation errors automatically — no more CFO finding mistakes",
      "CFO gets a narrative brief, not just spreadsheets — insights on revenue trends, expense anomalies, cash flow",
      "Audit-ready documentation: every data pull timestamped and sourced",
    ],
    uniqueAngle:
      "Not an accounting tool (QuickBooks does the books). Not a BI tool (Looker shows dashboards). This is the prep layer — pulling from Stripe + QuickBooks + Gusto + Ramp + NetSuite, cross-reconciling deposits vs entries, flagging discrepancies with explanations, and writing the month-end narrative for the CFO. No tool does this today because it requires intelligence: understanding that a $1,200 discrepancy is a timing difference (deposit clears next month), not an error. Scout investigates, Ghost writes the narrative, Sentinel verifies every number ties out.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls revenue data from Stripe + Razorpay + processes refunds and failed payments",
        tools: [
          { label: "Stripe", color: "#6772E5" },
          { label: "Razorpay", color: "#0C2451" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "$312k collected via Stripe · $28k via Razorpay · 4 failed payments · 2 refunds ($1.8k total) · all timestamped",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls expense data from QuickBooks + Xero + corporate card transactions from Ramp",
        tools: [
          { label: "QuickBooks", color: "#2CA01C" },
          { label: "Xero", color: "#13B5EA" },
          { label: "Ramp", color: "#1E1E1E" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "$198k total expenses · 3 categories over budget (Travel, Software, Marketing) · 12 Ramp transactions need categorization",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls payroll from Gusto + Workday + headcount changes from BambooHR",
        tools: [
          { label: "Gusto", color: "#FB4F14" },
          { label: "Workday", color: "#F5820D" },
          { label: "BambooHR", color: "#73C41D" },
        ],
        detail: "$142k payroll · 2 new hires (started mid-month, prorated) · 1 contractor added · benefits costs $18k",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Cross-reconciles: Stripe/Razorpay deposits vs QuickBooks entries + Ramp expenses vs GL categories",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Looker", color: "#4285F4" },
          { label: "BigQuery", color: "#4285F4" },
        ],
        detail: "2 discrepancies found: $1,200 timing difference (deposit clears Jan 2) + $340 Ramp expense miscategorized (was Software, should be Marketing)",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes month-end narrative — revenue trends, expense anomalies, cash flow projection, board-ready summary",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "1,000-word narrative · Revenue +8% MoM · 3 expense anomalies explained · 90-day cash flow projection · board summary one-pager",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Verifies all numbers tie out across Stripe, QuickBooks, Gusto, and Ramp — documents every source",
        tools: [
          { label: "Stripe", color: "#6772E5" },
          { label: "QuickBooks", color: "#2CA01C" },
          { label: "Gusto", color: "#FB4F14" },
        ],
        detail: "All figures reconciled · 2 discrepancies noted with explanations + resolution steps · audit trail documented",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Delivers close package to CFO via email + Notion + Slack + books review meeting + archives in Google Drive",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Slack", color: "#4A154B" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Calendar", color: "#4285F4" },
          { label: "Google Drive", color: "#34A853" },
        ],
        detail: "Close package delivered · CFO review booked for 2nd business day · package archived in Google Drive for audit · Slack #finance notified",
      },
    ],
    result:
      "Close package ready end-of-day. All numbers reconciled across 5 financial systems. CFO gets a narrative with insights, not a spreadsheet dump. Close completed 4 days faster. Audit trail fully documented.",
  },

  // ─── DevOps ───────────────────────────────────────────────────────────────
  {
    slug: "incident-response-autopilot",
    title: "Incident response that runs the playbook",
    icon: "🚨",
    category: "devops",
    categoryLabel: "DevOps",
    buyer: "VP Engineering / SRE Lead, SaaS companies with production infrastructure",
    painPoint:
      "When PagerDuty fires at 3am, the on-call engineer spends 20–40 minutes just triaging — checking Datadog dashboards, reading CloudWatch logs, figuring out which service is affected, pulling up recent deploys on GitHub, and pinging the right team in Slack. The actual fix takes 10 minutes. The context-gathering takes forever. And the incident doc? Nobody writes it until the post-mortem 2 days later, by which time half the details are forgotten. Average MTTR across the industry is 45 minutes — most of it wasted on 'what happened?' not 'how do we fix it?'",
    trigger:
      "PagerDuty alert fires → auto-triage, gather context from all systems, prepare incident response, page the right team",
    accentColor: "hsl(0, 84%, 60%)",
    metric: "MTTR -60% · 18 min avg · full context before you open laptop",
    hoursSaved: "20–40 min saved per incident · MTTR reduced 60%",
    roi: [
      "MTTR reduced by 60% (from 45 min to 18 min average)",
      "On-call engineer gets full context before they even open their laptop",
      "Fewer escalations — right team paged first time based on deploy analysis",
      "Incident documentation created automatically in real-time — post-mortem writes itself",
      "Deploy correlation: instantly know if a recent deploy caused the issue",
    ],
    uniqueAngle:
      "Not a monitoring tool (Datadog/PagerDuty/New Relic already exist for alerting). This is the triage layer — the intelligent context-gathering that humans currently do manually at 3am. Scout pulls recent deploys from GitHub, checks CI/CD in Vercel, cross-references deploy timing vs alert timing. Ghost writes the incident summary with root cause analysis. Kaze creates the Jira incident ticket, posts to Slack with full context, and pages the right team. By the time the engineer opens Slack, they see: what's broken, what likely caused it, and what to do about it.",
    steps: [
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Detects PagerDuty alert via webhook, classifies severity, identifies affected service",
        tools: [
          { label: "PagerDuty", color: "#06AC38" },
          { label: "Slack", color: "#4A154B" },
        ],
        detail: "CRITICAL: API latency spike · p99 > 2s · payment-service affected · SEV-1 auto-classified",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls recent deploys from GitHub + checks Vercel deployment status + reviews CI/CD logs",
        tools: [
          { label: "GitHub", color: "#e2e8f0" },
          { label: "Vercel", color: "#e2e8f0" },
          { label: "Azure DevOps", color: "#0078D7" },
          { label: "Linear", color: "#5E6AD2" },
        ],
        detail: "3 deploys in last 24hrs · payment-service v2.4.1 deployed 47 min ago by @jake · Vercel deploy healthy · Linear ticket LIN-342 associated",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Cross-references deploy timing vs alert timing + checks database and infrastructure health",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Amazon S3", color: "#FF9900" },
          { label: "Snowflake", color: "#29B5E8" },
        ],
        detail: "MATCH: alert started 12 min after deploy · database connections healthy · S3 latency normal · likely application regression",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes incident summary: what's broken, likely cause, affected services, impact, suggested fix",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Confluence", color: "#0052CC" },
        ],
        detail: "Summary: payment-service v2.4.1 likely caused latency spike · Impact: 340 failed payments in 47 min · Recommend: rollback to v2.4.0",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Creates Jira incident ticket + posts to Slack #incidents with full context + pages backend team + emails stakeholders",
        tools: [
          { label: "JIRA", color: "#0052CC" },
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Microsoft Teams", color: "#6264A7" },
        ],
        detail: "INC-247 created (SEV-1) · @backend-oncall paged · full context posted in Slack thread · VP Eng emailed with ETA",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Monitors resolution timeline + auto-updates incident doc + tracks MTTR for SRE reporting",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "JIRA", color: "#0052CC" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Looker", color: "#4285F4" },
        ],
        detail: "Rollback executed at 3:22am · latency normalized by 3:25am · MTTR: 18 min · incident doc auto-completed · Looker SRE dashboard updated",
      },
    ],
    result:
      "Incident triaged in 3 minutes. On-call engineer woke up to a full dossier in Slack: root cause identified, rollback recommended, Jira ticket created. MTTR: 18 minutes. Post-mortem doc auto-generated.",
  },

  // ─── Legal & Compliance ───────────────────────────────────────────────────
  {
    slug: "regulatory-change-tracker",
    title: "Regulatory changes that tell you what to do",
    icon: "⚖️",
    category: "legal",
    categoryLabel: "Legal & Compliance",
    buyer: "General Counsel / Head of Compliance, regulated industries (fintech, healthcare, SaaS handling PII)",
    painPoint:
      "The regulatory landscape changes weekly — GDPR enforcement updates, new state privacy laws (11 new US state privacy laws in 2024 alone), SOC 2 requirement changes, SEC disclosure rules, HIPAA updates. Your compliance team manually monitors 10+ regulatory bodies, reads 100-page Federal Register notices, and tries to determine 'does this affect us and by when?' Most teams miss changes until audit time or until a competitor gets fined. A single missed regulatory deadline can cost $100k–$10M+ in fines. And outside counsel charges $500/hr to tell you what a regulation means.",
    trigger:
      "Weekly: scan all relevant regulatory sources and brief me on anything that affects our business",
    accentColor: "hsl(220, 60%, 50%)",
    metric: "Weekly · 10 hrs saved · never miss a deadline",
    hoursSaved: "10 hrs/week saved on compliance monitoring",
    roi: [
      "Never miss a regulatory change again — 14+ sources monitored weekly",
      "10 hrs/week saved on compliance monitoring and analysis",
      "Avoid $100k–$10M+ in fines from missed deadlines",
      "Audit-ready documentation maintained automatically with source citations",
      "Save $50k+/yr in outside counsel fees — plain-English summaries replace $500/hr legal analysis",
    ],
    uniqueAngle:
      "Not a compliance management tool (Vanta handles SOC 2 controls, Drata handles audit evidence). This is the early warning system — it reads raw regulatory changes from the Federal Register, state AG offices, and industry regulators, understands your business context (fintech + handles PII + operates in CA/NY/TX), and tells you exactly what to do and by when. No compliance tool does this because it requires intelligence to interpret dense legal language and map it to your specific business situation. Scout reads the regulations, Ghost translates to plain English, Sentinel verifies citations, Kaze creates compliance tasks with deadlines.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Monitors regulatory websites, Federal Register, state AG offices, SEC, FINRA, industry regulators",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Airtable", color: "#18BFFF" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "14 sources scanned · 47 total updates this week · 3 potentially relevant changes flagged for analysis",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Filters changes against business profile: industry, geography, data practices, entity type",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Confluence", color: "#0052CC" },
        ],
        detail: "2 applicable changes · 1 informational · filtered from 47 total updates · business profile: fintech, PII, CA/NY/TX",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Assesses impact level and urgency: informational, action-required, or urgent + compliance deadline",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "1 ACTION-REQUIRED: new CA data retention rule (90-day compliance deadline, affects 3 data pipelines) · 1 INFORMATIONAL: SEC proposed rule (comment period)",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes plain-English summary: what changed, who it affects, specific action items, deadline, risk if missed",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
          { label: "Confluence", color: "#0052CC" },
        ],
        detail: "2-page brief · specific action items for engineering + legal + ops · regulatory citations included · risk assessment: $250k fine if missed",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Cross-checks every regulatory citation against original source documents + verifies deadline accuracy",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "All citations verified against source documents · deadline confirmed (June 15, 2026) · regulatory section numbers validated",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Creates compliance tasks in Jira with deadlines + alerts legal team in Slack + emails external counsel + archives in Google Drive",
        tools: [
          { label: "JIRA", color: "#0052CC" },
          { label: "Asana", color: "#F06A6A" },
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Google Drive", color: "#34A853" },
          { label: "DocuSign", color: "#FFCE0F" },
        ],
        detail: "Jira task COMP-89 created (due in 75 days) · legal team alerted in #compliance · external counsel emailed with brief · archived in Google Drive compliance folder",
      },
    ],
    result:
      "Regulatory change detected Monday. Plain-English brief + specific action items delivered to legal, engineering, and ops. Jira task created with 75-day deadline. External counsel notified. Google Drive audit trail maintained. Zero chance of missing it.",
  },

  // ─── Sales (new) ──────────────────────────────────────────────────────────
  {
    slug: "win-back-dead-deals",
    title: "Win back dead deals on autopilot",
    icon: "♻️",
    category: "sales",
    categoryLabel: "Sales",
    buyer: "VP Sales / CRO, B2B SaaS with 100+ closed-lost deals per quarter",
    painPoint:
      "Your CRM is a graveyard of Closed Lost deals — hundreds of prospects who said 'not now,' 'budget freeze,' or 'went with competitor.' Nobody revisits them because SDRs are focused on new pipeline. But 30–40% of Closed Lost deals become viable again within 6–12 months (budget refreshes, champion changes roles, competitor disappoints). For a company closing 200 deals/year with a 40% win rate, that's 300+ Closed Lost deals sitting untouched — potentially millions in pipeline that costs nothing to acquire because the lead already knows you.",
    trigger:
      "Monthly: scan all Closed Lost deals from 6–12 months ago for re-engagement signals",
    accentColor: "hsl(190, 80%, 45%)",
    metric: "Monthly · revive 5–15% of dead deals · $200k–$500k pipeline",
    hoursSaved: "10 hrs/month saved · zero new lead acquisition cost",
    roi: [
      "Revive 5–15% of dead deals ($200k–$500k pipeline from nothing)",
      "Zero new lead acquisition cost — these are warm leads who already know you",
      "10 hrs/month saved vs manual CRM mining and cold re-engagement",
      "Original AE gets notified with full context — no context-switching or re-learning the account",
      "Memory system tracks which revival signals actually convert — scoring improves every cycle",
    ],
    uniqueAngle:
      "No tool monitors dead deals for revival signals. CRMs just store them. Apollo enriches new leads but doesn't watch old ones. This cross-references 6 data sources to find the 10% of dead deals that are actually ready to re-engage — prospect visited your website (GA4), opened old emails (HubSpot), champion changed companies (LinkedIn/Apollo), competitor raised prices, company got new funding. Then Ghost writes emails that reference the specific reason they're viable again. It's like having an SDR whose only job is mining your CRM graveyard — and they never forget to check.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls all Closed Lost deals from Salesforce (6–12 months old), filters by deal size >$25k, enriches via HubSpot engagement data",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Pipedrive", color: "#368764" },
        ],
        detail: "142 Closed Lost deals found · filtered to 38 with deal size >$25k · cross-referenced HubSpot last-touch data",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Checks re-engagement signals: website visits (GA4), email opens (HubSpot), champion job changes (Apollo/LinkedIn), company funding events",
        tools: [
          { label: "Google Analytics", color: "#E37400" },
          { label: "Apollo.io", color: "#4A90D9" },
          { label: "LinkedIn", color: "#0A66C2" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "7 accounts with strong revival signals · 2 champions changed companies · 1 visited pricing page last week · 3 companies raised new funding · 1 competitor raised prices 20%",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Scores each dead deal for revival probability — weighs signal strength, time since close, original close reason",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Looker", color: "#4285F4" },
          { label: "Airtable", color: "#18BFFF" },
        ],
        detail: "7 scored: 3 High (>70% revival probability) · 3 Medium (40–70%) · 1 Low (<40%) · scoring model trained on last 6 months of actual revivals",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Drafts personalized re-engagement emails — each references the specific change that makes them viable again",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Outreach", color: "#5951FF" },
          { label: "Salesloft", color: "#00B8A9" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "7 hyper-personalized emails · 'Congrats on the Series B! When we last spoke, budget was the blocker...' · loaded into Outreach sequences",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Quality-gates every email — rejects any that feel too salesy, checks brand guidelines, verifies signal accuracy",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "6 PASS · 1 REJECTED (funding data was outdated — Scout re-verified and Ghost rewrote) · all brand-compliant",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Sends via Outreach sequences + creates Salesforce re-engagement tasks + notifies original AE in Slack with full dossier",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Outreach", color: "#5951FF" },
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
        ],
        detail: "7 re-engagement sequences started · original AEs notified · Salesforce deal stage changed to 'Re-engaged' · Slack #sales-revivals updated",
      },
    ],
    result:
      "7 dead deals re-engaged from 142 Closed Lost. 2 demos already booked. $380k in revived pipeline from accounts that cost nothing to acquire. Original AEs picked up conversations with full context.",
  },

  // ─── Marketing (new) ──────────────────────────────────────────────────────
  {
    slug: "seo-content-engine",
    title: "SEO content engine — keyword gap to published article",
    icon: "✍️",
    category: "marketing",
    categoryLabel: "Marketing",
    buyer: "Head of Content / SEO Manager, B2B SaaS or e-commerce ($1M+ ARR)",
    painPoint:
      "Your SEO strategy has a clear process: find keyword gaps → create content briefs → write articles → optimize → publish → track. But each step involves a different tool and person. SEMrush finds gaps, a strategist writes briefs, a writer creates drafts, an editor reviews, WordPress publishes. A single blog post takes 2–3 weeks and costs $500–$1,500 in freelance writing fees. You need to publish 8–12 articles/month to compete for organic traffic, but your team can barely do 4. Meanwhile, competitors who publish 3× more are eating your keyword positions week by week.",
    trigger:
      "Weekly: analyze top keyword gaps vs competitors, create and publish 3 SEO-optimized articles",
    accentColor: "hsl(280, 65%, 55%)",
    metric: "Weekly · 3× content output · $6k–$18k/month saved",
    hoursSaved: "20 hrs/week saved · 3× more articles published",
    roi: [
      "3× content output (from 4 to 12+ articles/month) without adding headcount",
      "$6k–$18k/month saved on freelance writers and content agencies",
      "Organic traffic growth within 60 days from consistent, targeted publishing",
      "Every article targets a validated keyword gap — no wasted content",
      "Sentinel checks factual accuracy + brand voice — no embarrassing AI-sounding content published",
    ],
    uniqueAngle:
      "Not an AI writing tool (ChatGPT can write but doesn't know your keyword gaps, doesn't research what competitors rank for, doesn't verify facts, and doesn't publish). This is the full SEO workflow automated: Scout finds keyword opportunities by analyzing Search Console decline patterns and competitor gaps → Ghost creates briefs and writes 2,000-word optimized articles with proper H-tags, internal links, and meta descriptions → Sentinel reviews for quality, accuracy, and plagiarism → Kaze publishes to your content calendar and schedules social distribution. Research-driven, not random.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Analyzes Search Console + Google Analytics to find declining pages, keyword cannibalization, and gaps vs top 3 competitors",
        tools: [
          { label: "Google Search Console", color: "#4285F4" },
          { label: "Google Analytics", color: "#E37400" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Airtable", color: "#18BFFF" },
        ],
        detail: "8 keyword gaps found · 3 declining pages identified · competitor X ranking for 12 terms we don't target · content calendar gap: no content on 'AI automation for HR'",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Researches top-ranking content for each target keyword — structure, word count, topics covered, content gaps to exploit",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "Top 5 results analyzed per keyword · avg word count: 2,200 · common structure: listicle with examples · gap: nobody covers integration angle",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Creates detailed content briefs — target keyword, secondary keywords, outline, competing articles to beat, ideal word count",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
        ],
        detail: "3 content briefs created · each has primary keyword, 8–12 secondary keywords, H2/H3 outline, competitor URLs to outperform, target: 2,000+ words",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes 3 SEO-optimized articles with proper H-tag structure, internal links, meta descriptions, and featured snippet targeting",
        tools: [
          { label: "Google Docs", color: "#4285F4" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Drive", color: "#34A853" },
        ],
        detail: "3 articles drafted · 2,100 avg words · 15 internal links per article · meta descriptions optimized for CTR · FAQ schema included for featured snippets",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Reviews: keyword density, readability score (Flesch-Kincaid), factual accuracy, plagiarism check, brand voice consistency",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "All 3 articles pass · keyword density optimal (1.2–1.8%) · readability grade 8 · 0 plagiarism flags · 1 factual claim corrected (stat was from 2022, updated to 2025)",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Publishes to Notion content calendar + creates Asana tasks for design team + schedules social distribution on LinkedIn and Twitter",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Asana", color: "#F06A6A" },
          { label: "LinkedIn", color: "#0A66C2" },
          { label: "Twitter / X", color: "#1DA1F2" },
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
        ],
        detail: "3 articles in content calendar · 3 Asana tasks for featured images · LinkedIn posts scheduled · Twitter threads drafted · #content-team notified in Slack",
      },
    ],
    result:
      "3 SEO-optimized articles published this week, each targeting validated keyword gaps. Every fact checked, every meta description optimized, social distribution scheduled. Content pipeline running at 3× previous velocity with zero freelancer cost.",
  },

  // ─── Customer Success (new) ───────────────────────────────────────────────
  {
    slug: "upsell-signal-detection",
    title: "Upsell signals that find themselves",
    icon: "📈",
    category: "customer-success",
    categoryLabel: "Customer Success",
    buyer: "VP Customer Success / Head of Revenue Expansion, SaaS with usage-based or tiered pricing",
    painPoint:
      "Your best upsell opportunities are hiding in plain sight — accounts bumping against usage limits, teams adding users faster than expected, departments requesting features on higher tiers. But CSMs manage 50+ accounts each and can't monitor usage dashboards daily. By the time they notice an account is at 90% capacity, the customer has already self-served the upgrade or — worse — found a workaround and doesn't need the upgrade anymore. Expansion revenue is 3× cheaper than new logo acquisition (Gainsight benchmark), but SaaS companies typically capture only 30% of their expansion potential because signals get missed.",
    trigger:
      "Daily: scan all accounts for upsell signals — usage limits, growth velocity, feature requests, support patterns",
    accentColor: "hsl(45, 90%, 50%)",
    metric: "Daily · 20–40% expansion lift · catch signals 30 days earlier",
    hoursSaved: "15 hrs/week saved on manual usage review",
    roi: [
      "20–40% increase in expansion revenue by catching every upsell window",
      "Catch upsell signals 30 days earlier than manual CSM review",
      "15 hrs/week saved across CSM team on usage dashboard monitoring",
      "Personalized upsell emails draft automatically — value-framing, not pushy sales",
      "Signal-type tracking: learn which triggers (usage, feature requests, support) actually convert to upsells",
    ],
    uniqueAngle:
      "Not a product analytics tool (Mixpanel shows usage but doesn't connect it to CRM revenue data or trigger outreach). Not a CS platform (Gainsight shows health scores but doesn't draft emails or book meetings). This synthesizes product usage data + CRM contract data + support conversations to find the exact right moment for expansion — then Ghost drafts the email, Kaze creates the Salesforce opportunity, and books the expansion review. The full upsell loop, triggered by actual product behavior, not a CSM remembering to check a dashboard.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls product usage data from Mixpanel — accounts approaching tier limits, usage growth rate, new feature adoption, power user activity",
        tools: [
          { label: "Mixpanel", color: "#7856FF" },
          { label: "Segment", color: "#52BD94" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Heap", color: "#FF6B35" },
        ],
        detail: "12 accounts at >80% tier usage · 5 with >30% MoM growth · 3 heavily using features only on higher tiers",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Cross-references Salesforce contract data + Intercom feature requests + Stripe payment health",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Intercom", color: "#286EFA" },
          { label: "Stripe", color: "#6772E5" },
          { label: "HubSpot", color: "#FF7A59" },
        ],
        detail: "8 accounts have healthy payment history + renewing in <90 days · 4 have Intercom conversations asking about Pro features · contract values range $24k–$180k",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Scores upsell readiness: product-qualified (usage), conversation-qualified (asked about features), time-qualified (renewal approaching + healthy)",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Looker", color: "#4285F4" },
          { label: "Airtable", color: "#18BFFF" },
        ],
        detail: "6 High (product + conversation qualified) · 4 Medium (product-qualified only) · 2 Low (time-qualified) · $420k total expansion pipeline identified",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Drafts personalized upsell emails — value-framing, referencing their specific usage patterns and how the upgrade helps",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Outreach", color: "#5951FF" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "6 emails for High-priority accounts · each references their usage data ('You've used 94% of your API calls this month — Pro gives you 5×') · loaded into CSM Outreach sequences",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Routes to CSM with full context in Slack + creates Salesforce expansion opportunity + books upsell review meeting",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Google Calendar", color: "#4285F4" },
          { label: "Zoom", color: "#2D8CFF" },
        ],
        detail: "6 CSMs notified with account dossiers · 6 expansion opportunities created in Salesforce · 4 review meetings booked this week",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Tracks conversion rates by signal type + monitors which email approaches drive highest expansion acceptance",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Looker", color: "#4285F4" },
          { label: "Gainsight", color: "#FF5B27" },
        ],
        detail: "Last month: product-qualified signals converted 45% vs 12% for time-qualified · value-framing emails outperformed generic by 3.1× · model updated",
      },
    ],
    result:
      "6 high-priority upsell opportunities surfaced from product usage data. CSMs received full dossiers + personalized emails + booked meetings. $420k expansion pipeline identified. Zero manual dashboard monitoring required.",
  },
  {
    slug: "qbr-prep-autopilot",
    title: "QBR prep that pulls itself together",
    icon: "📑",
    category: "customer-success",
    categoryLabel: "Customer Success",
    buyer: "VP Customer Success / Enterprise CSM, SaaS companies with $50k+ ACV accounts",
    painPoint:
      "Quarterly Business Reviews (QBRs) are the most important customer touchpoint for enterprise SaaS — they're where renewals are secured and expansion deals are planted. But CSMs spend 4–8 hours preparing each one: manually pulling product usage from Mixpanel, support ticket history from Zendesk, renewal/expansion data from Salesforce, feature requests from Intercom, and ROI metrics from customer data. Then they build a slide deck. For a CSM with 15 enterprise accounts doing quarterly QBRs, that's 60–120 hours per quarter — a full month of work — just on prep. And the QBR often still misses key data because the CSM forgot to check one of 6 systems.",
    trigger:
      "QBR scheduled in 5 days: auto-prepare full QBR package for the enterprise account",
    accentColor: "hsl(195, 75%, 48%)",
    metric: "5 days out · 4–8 hrs saved per QBR · 240–480 hrs/year",
    hoursSaved: "4–8 hrs saved per QBR · 240–480 hrs/year per CSM",
    roi: [
      "4–8 hrs saved per QBR × 15 accounts × 4 quarters = 240–480 hrs/year saved per CSM",
      "QBRs backed by comprehensive data from 6+ sources — no blind spots",
      "ROI calculations auto-generated from real product + revenue data — defensible, not guesses",
      "Higher renewal rates from consistently high-quality, data-rich QBRs",
      "Expansion opportunities auto-identified during QBR prep — upsell naturally built into the conversation",
    ],
    uniqueAngle:
      "Not a CS platform feature (Gainsight has some QBR templates but doesn't pull data from Mixpanel, Zendesk, Stripe and doesn't write the narrative). Not a slide deck tool (Google Slides doesn't auto-populate with customer data). This assembles the full QBR package from 6+ data sources, calculates actual ROI the customer has achieved, identifies expansion opportunities, maps feature requests to your roadmap, and delivers a ready-to-present deck. The CSM reviews and personalizes in 30 minutes — they don't build from scratch over 2 days.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls product usage trends from Mixpanel — adoption rate, feature usage, power users, usage growth/decline, compared to benchmarks",
        tools: [
          { label: "Mixpanel", color: "#7856FF" },
          { label: "Segment", color: "#52BD94" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Heap", color: "#FF6B35" },
        ],
        detail: "Usage up 22% QoQ · 3 new departments onboarded · feature X adopted by 85% of users (vs 40% benchmark) · 2 underutilized features identified",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls support history from Zendesk + Intercom — ticket volume, CSAT, outstanding issues, feature requests, escalations",
        tools: [
          { label: "Zendesk", color: "#03363D" },
          { label: "Intercom", color: "#286EFA" },
          { label: "Freshdesk", color: "#2DB875" },
        ],
        detail: "CSAT 4.7/5 (+0.3 QoQ) · 12 tickets (down from 18) · 2 outstanding feature requests · 0 escalations · avg response time: 1.4 hrs",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls account health from Salesforce + Stripe — contract value, renewal date, expansion history, stakeholder map, revenue trends",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Stripe", color: "#6772E5" },
          { label: "Looker", color: "#4285F4" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "$120k ACV · renews in 68 days · 2 previous expansions ($80k → $100k → $120k) · 4 stakeholders mapped · Stripe payments healthy",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Creates QBR deck content: executive summary, usage highlights, ROI achieved, support review, roadmap alignment, growth recommendations",
        tools: [
          { label: "Google Docs", color: "#4285F4" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "8-section QBR deck · ROI calculated: $340k value delivered (2.8× contract value) · 3 expansion recommendations · roadmap alignment: 4 of their 6 requests on next 2 sprints",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Verifies all metrics are current and accurate + ensures ROI calculations are defensible with source documentation",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Stripe", color: "#6772E5" },
          { label: "Mixpanel", color: "#7856FF" },
        ],
        detail: "All figures verified · ROI methodology documented · 1 usage stat updated (was cached from last week) · source links embedded in deck",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Delivers QBR draft to CSM via Gmail + Slack + creates Google Docs/Slides template + books internal prep call before the QBR",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Slack", color: "#4A154B" },
          { label: "Google Calendar", color: "#4285F4" },
          { label: "Zoom", color: "#2D8CFF" },
          { label: "Google Drive", color: "#34A853" },
        ],
        detail: "QBR package delivered to CSM Sarah · Google Doc + Slides shared · internal prep call booked 2 days before QBR · all materials in shared Drive folder",
      },
    ],
    result:
      "Full QBR package assembled from 6 data sources. Usage trends, support review, ROI calculation ($340k value = 2.8× contract), expansion recommendations — all in one deck. CSM spent 30 minutes personalizing instead of 6 hours building from scratch.",
  },

  // ─── Operations (new) ─────────────────────────────────────────────────────
  {
    slug: "vendor-renewal-autopilot",
    title: "Vendor & contract renewal autopilot",
    icon: "📋",
    category: "operations",
    categoryLabel: "Operations",
    buyer: "Head of Operations / Procurement / CFO, companies with 20+ SaaS subscriptions",
    painPoint:
      "The average mid-market company has 80–130 SaaS subscriptions (Zylo 2024 State of SaaS report). Renewals auto-renew silently with 3–5% annual price increases. Nobody tracks which contracts are coming due until the credit card charge hits. You're paying for tools nobody uses (25–30% of SaaS spend is wasted on underutilized or duplicate tools), locked into contracts that should've been renegotiated, and missing cancellation windows by days. For a company spending $500k/yr on SaaS, that's $125k–$150k in avoidable waste — every year.",
    trigger:
      "Monthly: audit all vendor contracts, flag renewals in next 90 days, recommend renegotiate/downgrade/cancel",
    accentColor: "hsl(25, 85%, 55%)",
    metric: "Monthly · 15–25% SaaS spend reduction · $50k–$200k/yr saved",
    hoursSaved: "15 hrs/month saved on vendor management",
    roi: [
      "15–25% reduction in SaaS spend ($50k–$200k/yr for mid-market companies)",
      "Catch every renewal window — never auto-renew without review again",
      "Eliminate zombie subscriptions — tools with <30% seat utilization flagged and cancelled",
      "Vendor negotiation emails pre-drafted with usage data and benchmark pricing",
      "Duplicate tool detection: find two project management tools, two CRMs, or overlapping analytics",
    ],
    uniqueAngle:
      "Not a SaaS management tool (Zylo/Productiv cost $30k+/yr and only show you a dashboard with no action). This actually analyzes usage across your tools (how many Slack seats active vs licensed? How often do people log into Salesforce?), cross-references against payment data, drafts vendor negotiation emails backed by usage data, creates cancellation requests before auto-renewal, and tracks cumulative savings. The full procurement loop — detect → analyze → recommend → act — not just 'here's your spend dashboard.'",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls all subscription data from Stripe + Ramp + QuickBooks — recurring charges, annual contracts, payment history, renewal dates",
        tools: [
          { label: "Stripe", color: "#6772E5" },
          { label: "Ramp", color: "#1E1E1E" },
          { label: "QuickBooks", color: "#2CA01C" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "87 active subscriptions found · $42k/month total SaaS spend · 14 renewals in next 90 days · 3 with >10% year-over-year price increases",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Cross-references actual usage: active seats vs licensed seats across all tools, login frequency, feature utilization",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "GitHub", color: "#e2e8f0" },
          { label: "Salesforce", color: "#00A1E0" },
          { label: "JIRA", color: "#0052CC" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "5 tools with <30% seat utilization · Salesforce: 45 seats licensed, 28 active · Figma: 20 seats, 8 active · 2 duplicate tools detected (Asana + Monday.com both active)",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Flags: renewals in 90 days, underutilized tools, price increases, duplicate tools, and savings opportunities with dollar amounts",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Airtable", color: "#18BFFF" },
          { label: "Looker", color: "#4285F4" },
        ],
        detail: "Total savings opportunity: $8.4k/month ($101k/yr) · 3 cancel recommendations · 4 downgrade recommendations · 2 renegotiate · 5 renew as-is",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Drafts vendor action recommendations + cancellation emails + renegotiation emails with usage data and benchmark pricing",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
        ],
        detail: "3 cancellation emails drafted · 4 downgrade request emails · 2 renegotiation emails citing usage data ('We're using 28 of 45 seats — let's right-size to 30') · benchmark pricing attached",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Verifies contract terms, cancellation windows (must cancel >30 days before?), and pricing against stored agreements in Google Drive",
        tools: [
          { label: "Google Drive", color: "#34A853" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "2 cancellation windows verified (must cancel by March 15 for April 1 renewal) · 1 contract has 60-day notice requirement — flagged as URGENT · all terms checked",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Creates tasks in Asana/Jira for procurement team + alerts finance in Slack + logs savings opportunities + sends cancellation emails on approval",
        tools: [
          { label: "Asana", color: "#F06A6A" },
          { label: "JIRA", color: "#0052CC" },
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "14 vendor tasks created with deadlines · #finance alerted · savings tracker updated · 1 urgent cancellation email sent (60-day window closing in 5 days)",
      },
    ],
    result:
      "87 subscriptions audited. $101k/yr in savings opportunities identified. 3 zombie subscriptions flagged for cancellation. 4 overprovisioned tools recommended for downgrade. All renegotiation emails drafted with usage data. One urgent cancellation caught 5 days before the deadline.",
  },
  {
    slug: "meeting-to-action-autopilot",
    title: "Meeting notes → action items → follow-up",
    icon: "🎙️",
    category: "operations",
    categoryLabel: "Operations",
    buyer: "Chief of Staff / Head of Ops / Project Managers, companies with 20+ recurring meetings/week",
    painPoint:
      "The average knowledge worker spends 31 hours per month in meetings (Atlassian research). After each meeting, someone needs to write up notes, extract action items, assign owners, set deadlines, and follow up. But 73% of meetings have no documented action items (same study). Decisions get lost. The same topics get re-discussed 2 weeks later because nobody tracked the outcome. People say 'I'll follow up on that' and then don't. The company moves slower because of poor meeting-to-action conversion — and nobody even realizes how much productivity is lost.",
    trigger:
      "After every Zoom/Teams meeting: extract notes, create action items, assign owners, schedule follow-ups",
    accentColor: "hsl(50, 85%, 50%)",
    metric: "Per meeting · 5–10 hrs/week saved · completion rate +60–80%",
    hoursSaved: "5–10 hrs/week saved · action items actually get done",
    roi: [
      "5–10 hrs/week saved on meeting follow-up and note-taking across the team",
      "Action item completion rate increases 60–80% (from 'someone should do this' to assigned Jira tickets with deadlines)",
      "Decisions documented and searchable — never re-discuss the same topic",
      "Meeting ROI visible: which meetings consistently generate value vs which are time wasters",
      "Deadline reminders sent automatically — no more forgotten follow-ups",
    ],
    uniqueAngle:
      "Not a meeting notes tool (Otter.ai and Fireflies.ai transcribe but don't create tasks, don't assign owners, and don't follow up). This closes the full loop: transcript → structured notes → assigned tasks in Asana/Jira/Linear with correct assignees → deadline reminders in Slack → completion tracking → analytics on which meetings produce results. The difference between 'someone should follow up' and 'Sarah has a Jira ticket due Friday, and she'll get a Slack reminder Wednesday if it's not started.'",
    steps: [
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Detects meeting ended via Zoom/Teams webhook + pulls recording transcript from Gong or native transcription service",
        tools: [
          { label: "Zoom", color: "#2D8CFF" },
          { label: "Microsoft Teams", color: "#6264A7" },
          { label: "Gong", color: "#9B59B6" },
        ],
        detail: "Meeting: 'Q1 Marketing Strategy Review' · 45 min · 6 participants · transcript pulled (8,400 words) · recording ID logged",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Analyzes transcript: identifies decisions made, action items mentioned, owners committed, deadlines discussed, and open questions",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "4 decisions identified · 7 action items extracted · 5 owners assigned · 3 deadlines mentioned · 2 open questions flagged for follow-up",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes structured meeting summary: key decisions, action items with owners + deadlines, parking lot items, next meeting agenda suggestions",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
          { label: "Confluence", color: "#0052CC" },
        ],
        detail: "Summary: 4 key decisions (budget approved, new channel pilot, creative deadline moved, agency review scheduled) · 7 action items with clear owners · 2 parking lot items for next meeting",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Creates tasks in Asana/Jira/Linear for each action item + posts summary to Slack + sends recap email to all attendees",
        tools: [
          { label: "Asana", color: "#F06A6A" },
          { label: "JIRA", color: "#0052CC" },
          { label: "Linear", color: "#5E6AD2" },
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
        ],
        detail: "7 tasks created in Asana · correct assignees set · deadlines from transcript applied · summary posted to #marketing · recap emailed to 6 attendees",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Schedules follow-up reminders: 48 hrs before deadline, pings assignee in Slack if task not yet started",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Google Calendar", color: "#4285F4" },
          { label: "Todoist", color: "#E44332" },
        ],
        detail: "7 deadline reminders scheduled · 2 tasks due this Friday (reminders set for Wednesday) · recurring meeting agenda auto-updated with parking lot items",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Tracks action item completion rates per team/meeting type — identifies meetings that consistently generate but never complete action items",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Looker", color: "#4285F4" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "Team completion rate: 78% (up from 34% before automation) · 'Marketing Strategy Review' is the highest-ROI meeting (92% completion) · 'Weekly Standup' lowest (45% — recommend restructuring)",
      },
    ],
    result:
      "Meeting ended → structured notes in Notion within 5 minutes → 7 Asana tasks created with correct owners and deadlines → recap emailed to all attendees → Slack reminders scheduled. Action item completion rate jumped from 34% to 78%.",
  },

  // ─── HR (new) ─────────────────────────────────────────────────────────────
  {
    slug: "performance-review-autopilot",
    title: "Performance review prep that writes itself",
    icon: "📊",
    category: "hr",
    categoryLabel: "HR & People",
    buyer: "VP People / HR Business Partner, companies with 50+ employees doing quarterly or semi-annual reviews",
    painPoint:
      "Performance review season is dreaded by everyone — especially managers. Each manager spends 2–4 hours per direct report gathering data: pulling project completions from Jira, code contributions from GitHub, OKR progress from spreadsheets, peer feedback from email threads, and 360 survey results from Typeform. Then they write the actual review narrative. For a manager with 8 reports, that's 16–32 hours of prep. Multiply across 20 managers and you've lost 400+ hours of productivity every review cycle — on data gathering that should be automated. And reviews still suffer from recency bias because managers can only remember the last 3 weeks.",
    trigger:
      "Review cycle starts: gather performance data and draft reviews for all employees across 6+ data sources",
    accentColor: "hsl(300, 60%, 50%)",
    metric: "Per cycle · 320–640 hrs saved · reviews grounded in data",
    hoursSaved: "320–640 hrs saved per review cycle company-wide",
    roi: [
      "2–4 hrs saved per review × 8 reports × 20 managers = 320–640 hrs saved per cycle",
      "Reviews grounded in actual work data, not manager memory — reduces recency bias",
      "Review cycle completion 3× faster (from 4 weeks to 10 days)",
      "Consistent quality: every review references specific projects, metrics, and contributions",
      "Bias detection: Sentinel flags disproportionate weighting of recent events or skewed language",
    ],
    uniqueAngle:
      "No HR tool aggregates work data across Jira + GitHub + Google Sheets + Slack + Typeform to auto-draft reviews. HR systems (BambooHR, Workday) store reviews but don't write them. Project management tools (Jira, Asana) track tasks but don't connect them to performance narratives. This pulls actual work output data from the full review period, synthesizes it into a narrative that references specific projects and contributions, checks for bias (recency, skewed language), and delivers a draft that managers just need to refine — not write from scratch.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls project completions + velocity from Jira/Asana/Linear for each employee over the full review period",
        tools: [
          { label: "JIRA", color: "#0052CC" },
          { label: "Asana", color: "#F06A6A" },
          { label: "Linear", color: "#5E6AD2" },
          { label: "GitHub", color: "#e2e8f0" },
        ],
        detail: "Employee Alex: 34 tickets completed (vs 28 avg) · led 2 epics · closed 12 bugs · sprint velocity +15% over period · 47 PRs merged on GitHub",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls collaboration signals: code reviews (GitHub), doc contributions (Confluence), Slack engagement, meeting participation (Calendar)",
        tools: [
          { label: "GitHub", color: "#e2e8f0" },
          { label: "Confluence", color: "#0052CC" },
          { label: "Slack", color: "#4A154B" },
          { label: "Google Calendar", color: "#4285F4" },
        ],
        detail: "28 code reviews given (top 10% of team) · 4 Confluence docs authored · active in 3 cross-team Slack channels · mentored 2 new hires",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls OKR/goal progress from Google Sheets + 360 feedback from Typeform + recognition data from BambooHR",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Typeform", color: "#262627" },
          { label: "BambooHR", color: "#73C41D" },
          { label: "Workday", color: "#F5820D" },
        ],
        detail: "OKRs: 3/4 completed (1 at 70%) · 360 feedback: 4.2/5 avg (peers highlight collaboration + technical depth) · 2 peer recognitions in BambooHR",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Drafts performance review narrative: strengths with evidence, growth areas, OKR summary, specific examples from data, development recommendations",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
          { label: "Google Drive", color: "#34A853" },
        ],
        detail: "1,200-word draft review · 3 strengths with specific project examples · 2 growth areas from peer feedback themes · OKR achievement: 88% · recommended: tech lead track",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Verifies all metrics against source systems + checks for bias indicators (recency weighting, gendered language, comparing to wrong benchmarks)",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "JIRA", color: "#0052CC" },
          { label: "GitHub", color: "#e2e8f0" },
        ],
        detail: "All metrics verified · 1 OKR progress updated (was 65%, now 70% after recent milestone) · bias check: PASS (no recency skew, balanced language, correct benchmark group)",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Delivers draft reviews to managers via Gmail + creates BambooHR review records + books calibration meetings",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "BambooHR", color: "#73C41D" },
          { label: "Workday", color: "#F5820D" },
          { label: "Google Calendar", color: "#4285F4" },
          { label: "Slack", color: "#4A154B" },
        ],
        detail: "Draft reviews delivered to 20 managers · BambooHR review records pre-populated · calibration meeting booked for Friday · managers notified in Slack with instructions",
      },
    ],
    result:
      "Performance review drafts for all 160 employees delivered to 20 managers. Each review references specific projects, OKR data, peer feedback, and collaboration metrics from the full review period. Managers refined in 30 min each instead of building from scratch in 3 hrs. Review cycle completed in 10 days instead of 4 weeks.",
  },

  // ─── E-commerce (new) ─────────────────────────────────────────────────────
  {
    slug: "inventory-restock-forecasting",
    title: "Inventory restock with demand forecasting",
    icon: "📦",
    category: "ecommerce",
    categoryLabel: "E-commerce",
    buyer: "E-commerce Operations Manager / Head of Supply Chain, DTC brands or multi-channel retailers",
    painPoint:
      "Stockouts cost e-commerce brands 4.1% of annual revenue (IHL Group research). For a $5M brand, that's $205k/year in lost sales. Overstocking is equally painful — tying up cash in dead inventory that eventually gets marked down 50%. Most brands use gut feel or simple reorder points that don't account for seasonality, marketing campaigns, or competitor actions. The worst part: nobody connects 'we're sending a 30% off email blast to 50k subscribers next Tuesday' with 'we should order 40% more of that SKU now.' By the time you realize a bestseller is running low, the 4–6 week supplier lead time means you've already lost 2 weeks of sales.",
    trigger:
      "Daily: analyze inventory levels, sales velocity, upcoming campaigns, and seasonal patterns — generate restock recommendations",
    accentColor: "hsl(170, 70%, 40%)",
    metric: "Daily · reduce stockouts 60–80% · $100k+ cash freed",
    hoursSaved: "8 hrs/week saved · never stockout before a campaign",
    roi: [
      "Reduce stockouts by 60–80% (recover 2–4% of lost revenue)",
      "Reduce overstock by 30% — free up $100k+ in cash tied to dead inventory",
      "Never miss a restock window before a marketing campaign again",
      "Supplier emails pre-drafted with reorder quantities + delivery timeline requirements",
      "Forecast accuracy tracked and improved over time — learns your seasonal patterns",
    ],
    uniqueAngle:
      "Not just inventory management (Shopify has basic low-stock alerts but no intelligence). This connects sales velocity + marketing calendar + seasonal patterns + supplier lead times to predict demand accurately. The key insight no other tool provides: knowing you're sending a 30% off email to 50k subscribers next Tuesday means you should order more now, not after the stockout. Scout reads your Klaviyo campaign schedule, connects it to historical email-to-sales conversion rates, and adjusts restock recommendations accordingly.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls current inventory levels from Shopify/WooCommerce + sales velocity (30/60/90 day) + same-period-last-year seasonal patterns",
        tools: [
          { label: "Shopify", color: "#96BF48" },
          { label: "WooCommerce", color: "#96588A" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Airtable", color: "#18BFFF" },
        ],
        detail: "324 SKUs tracked · 12 with <14 days supply · 8 trending up 30%+ MoM · last year's Q2 data loaded for seasonal adjustment",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Cross-references upcoming marketing campaigns in Klaviyo/Mailchimp + planned Google Ads spend increases + social promotions",
        tools: [
          { label: "Klaviyo", color: "#2D2D2D" },
          { label: "Mailchimp", color: "#FFE01B" },
          { label: "Google Ads", color: "#4285F4" },
          { label: "Instagram", color: "#E4405F" },
        ],
        detail: "30% off email blast scheduled Tuesday (expect 2.3× normal sales based on historical data) · Google Ads budget +40% next week on bestseller SKU · Instagram influencer post Wednesday",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Calculates days-of-supply per SKU factoring in campaign demand spikes + supplier lead times from stored data",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Airtable", color: "#18BFFF" },
          { label: "Looker", color: "#4285F4" },
        ],
        detail: "5 URGENT (stockout in <7 days with campaign spike) · 8 WARNING (reorder within 14 days) · 4 OVERSTOCK (>120 days supply, consider markdowns) · supplier lead times factored",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Generates restock report with prioritized actions: urgent reorders, watch list, overstock markdown recommendations, supplier order emails",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
          { label: "Gmail", color: "#EA4335" },
        ],
        detail: "Daily restock report · 5 urgent purchase orders drafted · 4 overstock markdown recommendations (estimated $18k cash recovery) · supplier emails pre-written with quantities",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Creates purchase order tasks in Asana/Monday.com + emails suppliers + alerts ops team in Slack + updates inventory dashboard",
        tools: [
          { label: "Asana", color: "#F06A6A" },
          { label: "Monday.com", color: "#FF3D57" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Slack", color: "#4A154B" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "5 urgent PO tasks created · supplier emails sent with rush delivery request · #ecom-ops alerted · inventory dashboard updated with projected stock levels",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Tracks forecast accuracy — did demand predictions match actual sales? Adjusts seasonal models and campaign multipliers",
        tools: [
          { label: "Shopify", color: "#96BF48" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Looker", color: "#4285F4" },
        ],
        detail: "Last email campaign prediction: 2.3× demand → actual 2.1× (93% accuracy) · seasonal model updated · bestseller SKU lead time adjusted from 28 to 32 days based on recent supplier delays",
      },
    ],
    result:
      "Daily demand forecast across 324 SKUs. 5 urgent reorders caught before Tuesday's email blast (would have stocked out by Wednesday). 4 overstock items flagged for markdown ($18k cash recovery). Supplier orders sent same morning. Zero stockouts during the campaign.",
  },
  {
    slug: "review-ugc-harvester",
    title: "Review & UGC harvester — social proof everywhere",
    icon: "⭐",
    category: "ecommerce",
    categoryLabel: "E-commerce",
    buyer: "E-commerce Marketing Manager / DTC Brand Manager, Shopify/WooCommerce brands ($1M–$20M)",
    painPoint:
      "You have hundreds of 5-star reviews on Shopify, glowing customer emails in Gmail, Instagram posts where customers tagged you, and TikTok unboxing videos — but this social proof is scattered and massively underutilized. Your product pages show the same 5 reviews from 2 years ago. Your ad creatives don't feature real customer quotes. Your email campaigns don't include testimonials. Studies show user-generated content increases conversion by 29% (Stackla) and ad CTR by 4× (Social Native), but converting a customer review into a usable social proof asset takes 30–60 min of manual work per piece. Meanwhile, your competitors have social proof dripping from every touchpoint.",
    trigger:
      "Weekly: harvest best customer feedback from all channels, create social proof assets, and distribute across touchpoints",
    accentColor: "hsl(320, 70%, 50%)",
    metric: "Weekly · conversion +10–25% · CTR +15–30%",
    hoursSaved: "5–10 hrs/week saved on UGC curation",
    roi: [
      "Product pages with fresh reviews: conversion rate +10–25%",
      "Ad creatives with real testimonials: CTR +15–30% (vs stock imagery)",
      "Continuous social proof loop — never have stale reviews on product pages again",
      "5–10 hrs/week saved on manual UGC curation and asset creation",
      "Thank-you emails with incentives drive 3× more future UGC submissions",
    ],
    uniqueAngle:
      "Not a review aggregation tool (Yotpo/Stamped.io collect reviews but don't turn them into multi-channel assets). Not a social listening tool (Sprout Social monitors mentions but doesn't create quote cards or product page updates). This finds the best customer feedback across every channel — Shopify reviews, Instagram tags, TikTok mentions, Gmail replies — creates ready-to-use social proof assets (quote cards, testimonial blocks, ad copy), verifies consent, and distributes them to product pages, email templates, and ad creatives automatically. The full loop from 'customer said something nice' to 'it's on every touchpoint selling for you.'",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Scans all review sources: Shopify product reviews (4–5 stars), Gmail customer reply emails, Instagram tagged posts, TikTok mentions, YouTube comments",
        tools: [
          { label: "Shopify", color: "#96BF48" },
          { label: "Instagram", color: "#E4405F" },
          { label: "TikTok", color: "#010101" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Facebook Pages", color: "#1877F2" },
          { label: "YouTube", color: "#FF0000" },
        ],
        detail: "This week: 28 new 5-star Shopify reviews · 12 Instagram tags · 3 TikTok unboxing videos · 5 glowing Gmail replies · 2 YouTube mentions",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Ranks and filters: most compelling stories, specific before/after outcomes, photogenic UGC, video testimonials, high-follower accounts",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Airtable", color: "#18BFFF" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "Top 10 selected · 2 before/after stories (powerful) · 1 TikTok with 45k views · 3 photo reviews · 2 high-follower Instagram posts (8k+ followers) · 2 detailed email testimonials",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Creates social proof assets: quote cards for Instagram stories, testimonial snippets for product pages, email blocks, ad copy with customer quotes",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
          { label: "Google Drive", color: "#34A853" },
        ],
        detail: "10 quote card concepts · 6 product page testimonial blocks · 4 email testimonial sections · 3 ad copy variants with real customer quotes · TikTok compilation brief for video team",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes personalized thank-you emails to top reviewers with incentive for sharing more (discount code for next purchase)",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Klaviyo", color: "#2D2D2D" },
          { label: "Mailchimp", color: "#FFE01B" },
        ],
        detail: "10 thank-you emails drafted · each references their specific review · 15% discount code attached · invite to UGC ambassador program for top contributors",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Verifies: customer consent for testimonial use, no competitor mentions, quotes accurately reflect original review, images are appropriate",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "9/10 cleared for use · 1 flagged (mentions competitor name — edited to remove) · consent patterns checked · all quotes verified against originals",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Distributes: updates Shopify product pages with fresh reviews, posts quote cards to social, adds to Klaviyo templates, creates Asana tasks for ad team",
        tools: [
          { label: "Shopify", color: "#96BF48" },
          { label: "Instagram", color: "#E4405F" },
          { label: "Klaviyo", color: "#2D2D2D" },
          { label: "Asana", color: "#F06A6A" },
          { label: "Slack", color: "#4A154B" },
        ],
        detail: "6 product pages updated with fresh reviews · 4 Instagram story quote cards scheduled · Klaviyo testimonial block added to next 3 email flows · 3 Asana tasks for ad team to use quotes in new creatives",
      },
    ],
    result:
      "50 new UGC pieces harvested across 6 channels. Top 10 converted into social proof assets. Product pages refreshed with new testimonials. Instagram quote cards scheduled. Klaviyo email templates updated. Ad team has 3 new customer quote creatives. All in the weekly automation cycle.",
  },

  // ─── Agency (new) ─────────────────────────────────────────────────────────
  {
    slug: "client-audit-strategy",
    title: "New client audit & strategy in 24 hours",
    icon: "🔍",
    category: "agency",
    categoryLabel: "Agency",
    buyer: "Agency Founder / Head of Strategy, performance marketing agencies (5–30 clients)",
    painPoint:
      "When a new client signs, the first 2 weeks are spent on the 'audit phase' — getting access to ad accounts, pulling 12 months of historical data, analyzing what's working, identifying quick wins, and building a 90-day strategy deck. This unpaid discovery work takes 20–40 hours per client and delays time-to-value. The client is anxious because they're paying retainer but nothing visible has happened yet. And half the 'insights' in the strategy deck are things any experienced marketer would notice in 30 minutes — if they had all the data in front of them. The bottleneck isn't strategy knowledge, it's data gathering and synthesis.",
    trigger:
      "New client signed: run full audit of their marketing stack and deliver 90-day strategy within 24 hours",
    accentColor: "hsl(210, 70%, 55%)",
    metric: "24 hrs · 20–40 hrs saved · strategy in day 1",
    hoursSaved: "20–40 hrs saved per client onboarding",
    roi: [
      "Client gets a 90-day strategy in 24 hours (vs 2 weeks of unpaid discovery)",
      "20–40 hrs saved per client onboarding — that's 1 full week of billable time recovered",
      "Faster time-to-results improves client retention (clients see value day 1, not week 3)",
      "Agency can take on more clients without adding headcount to the strategy team",
      "Consistent audit quality — every client gets the same thorough analysis regardless of which strategist is assigned",
    ],
    uniqueAngle:
      "Not a reporting tool — this is strategic analysis. Ghost doesn't just summarize data, it identifies patterns ('Your Meta ROAS dropped 40% when you paused retargeting in March — restart that immediately for a quick win') and makes specific, actionable recommendations with budget numbers. Scout pulls from all ad platforms + analytics + email simultaneously, something that takes a human strategist 2 days of tab-switching. The client gets a professional strategy deck in 24 hours that would normally take a senior strategist 2 weeks. Sentinel benchmarks every metric against industry averages so recommendations are data-backed.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls last 12 months of ad data from Google Ads + Meta Ads + TikTok Ads — spend, ROAS, CPL, best/worst campaigns, trend analysis",
        tools: [
          { label: "Google Ads", color: "#4285F4" },
          { label: "Meta Ads", color: "#1877F2" },
          { label: "TikTok Ads", color: "#010101" },
          { label: "Google Campaign Manager", color: "#4285F4" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "12 months analyzed · $380k total ad spend · Meta: 2.8× ROAS (best: retargeting at 5.1×) · Google: 3.1× ROAS · TikTok: 1.2× (underperforming) · 3 quick wins identified",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls website analytics from GA4 + Search Console — traffic sources, conversion paths, top pages, SEO health, mobile vs desktop split",
        tools: [
          { label: "Google Analytics", color: "#E37400" },
          { label: "Google Search Console", color: "#4285F4" },
          { label: "Mixpanel", color: "#7856FF" },
          { label: "Segment", color: "#52BD94" },
        ],
        detail: "42k monthly visitors · 2.3% conversion rate (below 3.2% industry avg) · mobile bounce rate 68% (red flag) · 8 keywords in positions 4–10 (quick SEO wins) · conversion path: 3.2 avg touchpoints",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Analyzes email/SMS performance from Klaviyo/Mailchimp — open rates, list health, revenue attribution, automation gaps, segment performance",
        tools: [
          { label: "Klaviyo", color: "#2D2D2D" },
          { label: "Mailchimp", color: "#FFE01B" },
          { label: "ActiveCampaign", color: "#004CFF" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "28% open rate (good) · 42% of list inactive >6 months (clean list needed) · no abandoned cart flow (leaving $12k/month on table) · welcome series converting at 8% (above avg)",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes comprehensive audit + 90-day strategy: quick wins (30 days), medium-term plays (60 days), strategic bets (90 days) with specific budget reallocations",
        tools: [
          { label: "Google Docs", color: "#4285F4" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Drive", color: "#34A853" },
        ],
        detail: "22-page audit deck · 5 quick wins (est. +$28k revenue in 30 days) · 3 medium-term plays · 2 strategic bets · specific: 'shift $8k/month from TikTok to Meta retargeting'",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Verifies all data points, benchmarks against industry averages, fact-checks ROI projections, ensures no data staleness",
        tools: [
          { label: "Google Ads", color: "#4285F4" },
          { label: "Google Analytics", color: "#E37400" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "All metrics verified · industry benchmarks applied (SaaS vertical) · 1 ROI projection adjusted downward (was too optimistic) · data freshness confirmed (all <24 hrs old)",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Delivers audit + strategy via email + creates Notion/Asana project with all action items + books kickoff meeting with client",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Asana", color: "#F06A6A" },
          { label: "Google Calendar", color: "#4285F4" },
          { label: "Zoom", color: "#2D8CFF" },
          { label: "Slack", color: "#4A154B" },
        ],
        detail: "Audit deck sent to client · Asana project with 22 action items created · kickoff meeting booked for tomorrow · internal Slack #client-onboarding notified · Google Drive folder organized",
      },
    ],
    result:
      "Full marketing audit + 90-day strategy delivered within 24 hours of client signing. 5 quick wins identified ($28k estimated revenue impact). All action items in Asana with deadlines. Kickoff meeting booked. Client saw a professional strategy deck before most agencies would've finished setting up access.",
  },

  // ─── Finance (new) ────────────────────────────────────────────────────────
  {
    slug: "expense-anomaly-detection",
    title: "Expense anomaly detection & policy enforcement",
    icon: "🔎",
    category: "finance",
    categoryLabel: "Finance",
    buyer: "VP Finance / Controller / CFO, companies with 50+ employees and corporate cards",
    painPoint:
      "Corporate card expense management is a nightmare. Employees submit expenses late, miscategorize them, occasionally violate policies (personal charges on company card, exceeding per-diem limits, unapproved software purchases). Finance teams spend 15–20 hours/month manually reviewing Ramp/Brex transactions, cross-checking against expense policies, and chasing employees for receipts. ACFE estimates 5–8% of corporate expenses have some form of policy violation or miscategorization. For a company spending $200k/month on corporate cards, that's $10k–$16k/month in potential waste, plus the opportunity cost of the finance team's time.",
    trigger:
      "Daily: scan all corporate card transactions for anomalies, policy violations, and categorization errors",
    accentColor: "hsl(15, 80%, 50%)",
    metric: "Daily · catch 90%+ violations · 15–20 hrs/month saved",
    hoursSaved: "15–20 hrs/month saved on manual expense review",
    roi: [
      "Catch 90%+ of expense policy violations automatically (vs ~40% with manual spot-checks)",
      "15–20 hrs/month saved on manual transaction review and employee follow-up",
      "Reduce expense waste by 3–5% ($6k–$10k/month for mid-market companies)",
      "Audit-ready expense documentation maintained automatically with flags and resolutions",
      "Pattern tracking identifies repeat offenders and categories that consistently cause issues",
    ],
    uniqueAngle:
      "Not just expense management (Ramp/Brex have basic policy controls — spending limits, merchant category blocks). This applies intelligent, contextual analysis — understanding that a $2,400 hotel charge is fine for the VP attending AWS re:Invent but suspicious for an intern, that 3 employees charging the same Uber ride is a duplicate, or that someone is consistently buying software tools that overlap with existing company subscriptions. Scout cross-references against travel calendars, team budgets, and historical spending patterns. Ghost writes specific policy-citing notices. Sentinel tracks patterns over time.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls all transactions from Ramp + Stripe + corporate card feeds via QuickBooks — categorized, timestamped, with merchant details",
        tools: [
          { label: "Ramp", color: "#1E1E1E" },
          { label: "Stripe", color: "#6772E5" },
          { label: "QuickBooks", color: "#2CA01C" },
          { label: "Xero", color: "#13B5EA" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "342 transactions this month · $198k total spend · 28 flagged for review · 14 missing receipts · 3 potential duplicates detected",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Analyzes each transaction against expense policy: per-diem limits, approved vendors, category rules, weekend charges, amount anomalies vs historical patterns",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Calendar", color: "#4285F4" },
        ],
        detail: "8 policy violations: 2 over per-diem ($85 meals, limit $75) · 1 personal charge ($240 at Best Buy on corp card) · 3 uncategorized · 2 duplicate Uber charges · cross-referenced against travel calendars",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Flags anomalies: unusual amounts vs historical spending, new vendors, charges at non-approved merchants, overlapping software subscriptions",
        tools: [
          { label: "Looker", color: "#4285F4" },
          { label: "Airtable", color: "#18BFFF" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "3 anomalies: 1 employee spending 3× their usual monthly avg · 1 charge at merchant with no previous company history · 1 new SaaS subscription that duplicates existing Notion license",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Drafts policy violation notices for flagged expenses — specific, citing the exact policy, and requesting clarification or receipt",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
        ],
        detail: "8 violation notices drafted · each cites specific expense policy section · tone: professional, not accusatory · receipt requests for 14 missing items",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Routes flags to finance team in Slack + emails employees needing to respond + creates reconciliation tasks in Asana with deadlines",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Asana", color: "#F06A6A" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "8 violation emails sent to employees · 14 receipt-request emails · finance team dashboard updated · 3 Asana tasks for finance team review · 5-day response deadline set",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Tracks violation patterns over time — identifies repeat offenders, categories with chronic issues, and recommends policy updates",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Looker", color: "#4285F4" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "Monthly trend: meals category violations down 40% (policy awareness improving) · 2 repeat offenders flagged for manager escalation · recommendation: increase meal per-diem from $75 to $85 (95% of violations are $76–$90)",
      },
    ],
    result:
      "342 transactions reviewed in minutes. 8 policy violations caught (would've been missed in manual spot-checks). 3 anomalies flagged for investigation. 14 receipt requests sent. $3.2k in questionable charges flagged. Monthly violation trend tracked — 40% fewer meals violations vs 3 months ago.",
  },

  // ─── DevOps (new) ─────────────────────────────────────────────────────────
  {
    slug: "release-notes-autopilot",
    title: "Release notes & changelog that write themselves",
    icon: "📝",
    category: "devops",
    categoryLabel: "DevOps",
    buyer: "Engineering Manager / Product Manager / Developer Relations, SaaS companies shipping weekly+",
    painPoint:
      "Nobody writes release notes. Engineers merge PRs with 'fix bug' or 'update thing' as the description. Product wants a customer-facing changelog but nobody has time. Developer docs go stale within days of a release. The weekly release ships on Thursday and the changelog gets published... maybe next week. If at all. Meanwhile, customers don't know about the feature they've been asking for, sales can't sell the latest improvements, and support gives wrong troubleshooting advice because they don't know what changed. GitLab's 2024 DevSecOps survey found that 62% of teams consider documentation their biggest bottleneck.",
    trigger:
      "Every Thursday after deploy: generate release notes from all merged PRs + Jira/Linear tickets this sprint",
    accentColor: "hsl(340, 75%, 55%)",
    metric: "Same-day · 2–4 hrs/week saved · feature adoption +15–30%",
    hoursSaved: "2–4 hrs/week saved on release documentation",
    roi: [
      "Release notes published same day as deploy (vs days/weeks later or never)",
      "2–4 hrs/week saved on engineering documentation time",
      "Sales and support always know what shipped — no more 'I didn't know we launched that'",
      "Customer-facing changelog increases feature adoption by 15–30%",
      "Three audiences served from one automation: engineering (technical), customers (value), and internal (Slack summary)",
    ],
    uniqueAngle:
      "Not a changelog tool (GitHub Releases just shows commit messages — useless for customers). Not a documentation tool (Notion requires manual writing). This translates engineering-speak into customer value automatically — 'Merged PR #847: refactor payment gateway retry logic with exponential backoff' becomes 'Improved payment reliability — failed payments now automatically retry up to 3 times, reducing checkout errors by 40%.' Ghost understands code changes and writes for three different audiences. Sentinel verifies every PR is accounted for. No human writes a single word.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls all merged PRs from GitHub since last release — commit messages, PR descriptions, linked Jira/Linear tickets, files changed, PR authors",
        tools: [
          { label: "GitHub", color: "#e2e8f0" },
          { label: "JIRA", color: "#0052CC" },
          { label: "Linear", color: "#5E6AD2" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "18 PRs merged since last release · 3 features · 8 bug fixes · 4 improvements · 3 internal refactors · linked to 14 Jira tickets",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Cross-references Jira/Linear tickets: original feature request, bug report context, customer-facing impact, and priority level",
        tools: [
          { label: "JIRA", color: "#0052CC" },
          { label: "Linear", color: "#5E6AD2" },
          { label: "Intercom", color: "#286EFA" },
          { label: "Zendesk", color: "#03363D" },
        ],
        detail: "3 features tied to customer requests (12 customers asked for 'bulk export') · 2 bug fixes from Zendesk tickets (P1 — checkout broken on Safari) · 4 internal improvements",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes three versions: internal changelog (technical), external release notes (customer-facing), and Slack summary (casual team update)",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Confluence", color: "#0052CC" },
          { label: "Google Docs", color: "#4285F4" },
        ],
        detail: "Internal: 18 items with technical details · External: 3 features + 2 notable fixes in customer language · Slack: 5-bullet casual summary with emoji · all three consistent but audience-appropriate",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Creates Notion changelog page + updates Confluence engineering wiki + drafts beta user email highlighting top 3 changes",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Confluence", color: "#0052CC" },
          { label: "Mailchimp", color: "#FFE01B" },
          { label: "Klaviyo", color: "#2D2D2D" },
        ],
        detail: "Notion changelog page created with version tag · Confluence wiki updated · beta user email drafted highlighting bulk export feature + Safari fix",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Reviews: all merged PRs accounted for? Release notes accurately reflect code changes? Any security-related changes needing special mention?",
        tools: [
          { label: "GitHub", color: "#e2e8f0" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "All 18 PRs accounted for · 1 security patch (dependency update) flagged for explicit mention · customer-facing descriptions verified against actual code changes · no inaccuracies found",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Publishes: Slack #product-updates, email to beta users, updates Notion changelog, creates follow-up Jira tickets for any incomplete items",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Mailchimp", color: "#FFE01B" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "JIRA", color: "#0052CC" },
        ],
        detail: "Slack summary posted to #product-updates + #engineering · beta email sent to 340 users · Notion changelog live · 2 Jira follow-up tickets created for incomplete items from this sprint",
      },
    ],
    result:
      "Release notes published within 1 hour of Thursday deploy. Three audience-appropriate versions: technical for engineering, customer-facing for the changelog, casual for Slack. 340 beta users emailed about bulk export feature. All 18 PRs accounted for. Engineering wrote zero documentation this sprint.",
  },

  // ─── Legal (new) ──────────────────────────────────────────────────────────
  {
    slug: "contract-review-risk-flagging",
    title: "Contract review & risk flagging before you sign",
    icon: "📄",
    category: "legal",
    categoryLabel: "Legal & Compliance",
    buyer: "General Counsel / VP Legal / Head of Procurement, companies signing 10+ vendor contracts/month",
    painPoint:
      "Every vendor contract, partnership agreement, and NDA needs legal review. Your 2-person legal team is drowning in a backlog of 30+ contracts waiting for review. Each contract takes 1–3 hours to read, redline, and flag risks. Business teams are frustrated because deals stall 5–10 days waiting for legal. Some teams skip legal review entirely for 'small' contracts — until a bad auto-renewal clause or unlimited liability provision bites them for $50k+. Outside counsel charges $300–500/hr for overflow contract review. And the irony: 80% of the review is checking for the same 15 risky clause patterns every time.",
    trigger:
      "New contract uploaded to Google Drive /legal-review folder → auto-review and risk assessment within 2 hours",
    accentColor: "hsl(235, 55%, 55%)",
    metric: "2 hrs · review time -70% · $50k+/yr saved on counsel",
    hoursSaved: "70% reduction in contract review time",
    roi: [
      "Contract review time reduced from 2–3 hrs to 30 min (legal just reviews AI analysis, not raw contract)",
      "Clear 30+ contract backlog in days instead of weeks",
      "Catch risk clauses that humans miss when reviewing their 15th contract this week",
      "Save $50k+/yr on outside counsel fees for overflow contract review",
      "Business teams unblocked — deals don't stall 5–10 days waiting for legal anymore",
    ],
    uniqueAngle:
      "Not a CLM tool (Ironclad/DocuSign CLM cost $50k+/yr, take 6 months to implement, and require extensive template setup). Not a generic AI reader (ChatGPT can summarize but doesn't know your company's acceptable terms or compare against prior contracts). This reads the actual contract language, understands legal risk in context ('unlimited liability is acceptable for a $500/mo SaaS tool but dangerous for a $500k enterprise deal'), compares against your stored acceptable terms in Notion, and produces specific redline recommendations with suggested alternative language. Scout extracts, Ghost summarizes for humans, Sentinel verifies against your standards.",
    steps: [
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Detects new contract PDF/DOCX uploaded to Google Drive /legal-review folder + identifies contract type (vendor, partnership, NDA, SOW)",
        tools: [
          { label: "Google Drive", color: "#34A853" },
          { label: "Slack", color: "#4A154B" },
        ],
        detail: "New contract detected: 'Acme Corp SaaS Agreement.pdf' · 28 pages · identified as vendor SaaS agreement · $120k/yr deal value · uploaded by Sarah (Procurement)",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Extracts and analyzes key terms: payment, termination, auto-renewal, liability, indemnification, IP, data processing, SLAs, exclusivity, governing law",
        tools: [
          { label: "Google Drive", color: "#34A853" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "12 key clauses extracted · payment: Net-60 (our standard is Net-30) · termination: 90-day notice (too long) · liability: uncapped (RED FLAG for $120k deal) · auto-renewal: 60-day cancellation window · IP: standard mutual · DPA: missing",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Flags risk areas against company's standard acceptable terms + compares to 3 most similar prior contracts in Google Drive",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Drive", color: "#34A853" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Confluence", color: "#0052CC" },
        ],
        detail: "3 RED flags: uncapped liability, missing DPA, 90-day termination notice · 2 YELLOW flags: Net-60 payment terms, 60-day auto-renewal window · compared against 3 similar SaaS vendor contracts — our standard is capped liability at 12× annual fees",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Generates 1-page risk summary: green/yellow/red ratings per clause, specific clause references, and suggested redline language for each flag",
        tools: [
          { label: "Google Docs", color: "#4285F4" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Drive", color: "#34A853" },
        ],
        detail: "1-page risk summary · 3 RED items with suggested redline language ('Replace Section 8.1 with: Liability shall not exceed 12× the annual fees paid...') · 2 YELLOW items with negotiation talking points · overall assessment: DO NOT SIGN without redlines",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Cross-checks flagged clauses against company's playbook in Notion + verifies clause references are accurate + checks for missing standard addenda",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "DocuSign", color: "#FFCE0F" },
        ],
        detail: "Playbook check: all flags align with company standards · clause references verified (Section 8.1, 12.3, 15.2) · missing: Data Processing Addendum (required for any vendor processing PII) · similar contract comparison validated",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Delivers risk summary to legal team via Slack + Gmail + creates Asana task with priority + stores analysis next to contract in Google Drive",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Asana", color: "#F06A6A" },
          { label: "Google Drive", color: "#34A853" },
          { label: "PandaDoc", color: "#4CAF50" },
        ],
        detail: "Risk summary delivered to #legal in Slack · Sarah (requester) emailed with status · HIGH priority Asana task for legal team · analysis PDF saved next to original contract in Drive · PandaDoc template started for redlined version",
      },
    ],
    result:
      "28-page contract reviewed in 90 minutes instead of 3 hours. 3 critical risks flagged (uncapped liability, missing DPA, excessive termination notice). Redline language pre-written. Legal team reviewed AI analysis in 30 minutes and sent back redlines same day. Deal unblocked — didn't stall for a week in the legal queue.",
  },
];

// ─── Helper: get use cases by category ──────────────────────────────────────
export function getUseCasesByCategory(): Record<UseCaseCategory, UseCase[]> {
  const grouped: Record<UseCaseCategory, UseCase[]> = {
    sales: [],
    marketing: [],
    "customer-success": [],
    operations: [],
    hr: [],
    ecommerce: [],
    agency: [],
    finance: [],
    devops: [],
    legal: [],
  };
  for (const uc of USE_CASES) {
    grouped[uc.category].push(uc);
  }
  return grouped;
}

// ─── Helper: find use case by slug ──────────────────────────────────────────
export function getUseCaseBySlug(slug: string): UseCase | undefined {
  return USE_CASES.find((uc) => uc.slug === slug);
}

// ─── Category order for navigation ─────────────────────────────────────────
export const CATEGORY_ORDER: UseCaseCategory[] = [
  "sales",
  "marketing",
  "customer-success",
  "operations",
  "hr",
  "ecommerce",
  "agency",
  "finance",
  "devops",
  "legal",
];
