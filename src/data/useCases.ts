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
// ─── Operations ───────────────────────────────────────────────────────────
// ─── HR ───────────────────────────────────────────────────────────────────
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

  // ─── NEW: High-ROI Team-Sellable Use Cases ─────────────────────────────────

  // ─── Sales (team) ──────────────────────────────────────────────────────────
  {
    slug: "sales-lead-enrichment-outbound",
    title: "Enrich leads & run outbound on autopilot",
    icon: "🎯",
    category: "sales",
    categoryLabel: "Sales",
    buyer: "Head of RevOps / SDR Team Lead, B2B SaaS or services (Series A–C, 50–500 employees)",
    painPoint:
      "SDRs spend 37% of their workday researching prospects — scrolling LinkedIn, checking company websites, pulling tech stack data from Apollo, then writing personalized emails one by one. For a 5-person SDR team, that's 75 hours/week of non-selling activity. Meanwhile, leads go cold: Harvard Business Review found responding within 5 minutes makes you 100× more likely to connect. But your team takes 4+ hours because they're stuck in research mode. Every hour an SDR spends on data entry is an hour they're not on the phone closing.",
    trigger:
      "New leads hit CRM → auto-enrich, score, personalize outreach, and enroll in sequences for the entire SDR team",
    accentColor: "hsl(217, 91%, 60%)",
    metric: "75 hrs/week saved · 5–10 seats · $2k+ MRR",
    hoursSaved: "15 hrs/week saved per SDR · 75 hrs/week across a 5-person team",
    roi: [
      "75 hrs/week of SDR research time eliminated — redirected to live calls and demos",
      "90-second lead response time (vs 4+ hour industry average) — 100× more likely to connect",
      "2.5× higher conversion on inbound leads with instant personalized outreach",
      "Every rep gets research-complete dossiers + pre-written emails — zero manual CRM data entry",
      "Lead routing accuracy: right rep gets right lead based on territory, ICP fit, and deal size",
    ],
    uniqueAngle:
      "Not just enrichment (Apollo does that) or just sequencing (Outreach does that). This runs the full loop autonomously: new lead → deep research across LinkedIn + CRM + web → ICP scoring → personalized email draft referencing specific company context → quality review → sequence enrollment → CRM logging. Every SDR on the team gets this for every lead, simultaneously. No single tool chains research → write → review → send → log across 6 platforms.",
    steps: [
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Detects new leads via CRM webhook, deduplicates against existing contacts, and assigns to enrichment queue",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Zoho CRM", color: "#DC2626" },
        ],
        detail: "15 new leads detected · 2 duplicates merged · 13 unique leads queued for enrichment · assigned to SDR territories",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Deep-researches each lead — company size, funding, tech stack, org chart, recent news, intent signals",
        tools: [
          { label: "Apollo.io", color: "#4A90D9" },
          { label: "LinkedIn", color: "#0A66C2" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Mixpanel", color: "#7856FF" },
          { label: "Google Analytics", color: "#E37400" },
        ],
        detail: "13 leads enriched · 8 high-intent signals found (pricing page visits, case study downloads) · 4 buying committee members identified per account",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Scores each lead against ICP matrix — company fit, buyer persona match, intent strength, timing signals",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Looker", color: "#4285F4" },
          { label: "Airtable", color: "#18BFFF" },
        ],
        detail: "ICP scoring complete · 5 leads scored 80+ (hot) · 6 leads scored 50–79 (warm) · 2 leads scored below 50 (nurture) · routing rules applied",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes personalized outreach emails for each lead, referencing research findings — not generic templates",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Outreach", color: "#5951FF" },
          { label: "Salesloft", color: "#00B8A9" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "13 personalized emails drafted · each references company context, tech stack, and specific pain point · loaded into rep-specific Outreach sequences",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Quality-gates every email — rejects generic ones, checks brand voice, verifies personalization accuracy",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "Quality gate: 11 PASS · 2 REJECTED (weak personalization) · Ghost rewrites rejected emails with deeper context · all 13 pass on second review",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Routes leads to correct SDR, enrolls in sequences, logs everything in CRM, notifies team in Slack",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Slack", color: "#4A154B" },
          { label: "Calendly", color: "#006BFF" },
          { label: "Google Calendar", color: "#4285F4" },
        ],
        detail: "13 leads routed to 5 SDRs by territory · sequences activated · CRM fully updated · #sales-pipeline Slack channel notified with daily summary",
      },
    ],
    result:
      "13 leads fully enriched, scored, personalized, and enrolled in sequences — all within 90 seconds of hitting the CRM. 5 SDRs saved 15 hrs/week each. Pipeline velocity increased 3× with same-day outreach on every inbound lead.",
  },
  {
    slug: "sales-crm-hygiene",
    title: "CRM hygiene + activity logging on autopilot",
    icon: "🧹",
    category: "sales",
    categoryLabel: "Sales",
    buyer: "VP Sales / RevOps Manager, B2B companies with 5+ sales reps (Series A–C)",
    painPoint:
      "Sales reps spend 20% of their day on manual CRM data entry — after every call, meeting, or email, they must log activities, update deal stages, add notes, and tag contacts. Nobody does it properly. CRM data quality is always terrible: 40% of deals have missing fields, stages are outdated, and notes are empty. Sales managers can't trust pipeline reports because reps don't update consistently. The average rep touches the CRM 15–20 times/day for 2–3 minutes each — that's 30–60 minutes/day of context-switching hell that kills productivity and morale.",
    trigger:
      "After every call, meeting, or email — auto-log activities, update deal stages, and audit CRM data quality weekly",
    accentColor: "hsl(190, 80%, 45%)",
    metric: "165 hrs/month saved · 5–15 seats · $3k MRR",
    hoursSaved: "30–60 min/day per rep · 165 hrs/month across 10-person team",
    roi: [
      "Every rep saves 30–60 min/day on CRM data entry — 165 hrs/month across a 10-person team",
      "CRM data quality jumps from 60% to 95%+ field completion — pipeline reports finally trustworthy",
      "Deal stages auto-updated based on conversation signals — no more stale 'Negotiation' deals from 3 months ago",
      "Weekly CRM audit catches stuck deals, missing fields, and outdated contacts before they rot",
      "Sales managers get accurate forecasts for the first time — based on real data, not rep guesses",
    ],
    uniqueAngle:
      "Not a CRM plugin that adds one button (Gong logs calls but doesn't update deal stages). Not a data cleaning tool (those run once and data goes stale again). This is continuous, autonomous CRM maintenance: every call auto-logged with structured notes, every email captured, every deal stage evaluated against conversation signals, every field audited weekly. The result: a CRM that reflects reality without reps ever touching it. Every rep on the team benefits — this is a 5–15 seat use case by design.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Captures activities from Gmail, Calendar, and Gong — calls, meetings, emails automatically detected and parsed",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Google Calendar", color: "#4285F4" },
          { label: "Gong", color: "#9B59B6" },
          { label: "Zoom", color: "#2D8CFF" },
        ],
        detail: "42 activities captured today across 10 reps · 18 calls, 12 meetings, 12 email threads · all matched to CRM contacts and deals",
      },
      {
        agent: "Forge",
        emoji: "⚒️",
        color: "hsl(25, 95%, 53%)",
        action: "Auto-logs every activity in CRM with structured notes — call outcomes, next steps, key quotes, sentiment",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Zoho CRM", color: "#DC2626" },
        ],
        detail: "42 activities logged · each with structured notes (outcome, next steps, sentiment) · zero manual data entry by reps",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Analyzes conversation signals to recommend deal stage updates — identifies stalled, progressing, or at-risk deals",
        tools: [
          { label: "Gong", color: "#9B59B6" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Slack", color: "#4A154B" },
        ],
        detail: "6 deal stage updates recommended · 2 deals moved to 'Negotiation' (budget discussed on call) · 1 deal flagged at-risk (competitor mentioned) · 3 deals confirmed on track",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Weekly CRM audit — flags stale deals, missing fields, duplicate contacts, and data quality issues",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Looker", color: "#4285F4" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "Weekly audit: 8 stale deals (no activity 30+ days) · 12 missing required fields · 3 duplicate contacts merged · data quality score: 94% (up from 61%)",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Alerts reps and managers about needed actions — stale deals, missing updates, coaching opportunities",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "Slack alerts sent: 3 reps pinged about stale deals · manager notified of 2 coaching opportunities · weekly CRM health report delivered to VP Sales",
      },
    ],
    result:
      "42 activities auto-logged across 10 reps with zero manual entry. 6 deal stages auto-updated. Weekly audit found 8 stale deals and 12 missing fields. CRM data quality improved from 61% to 94%. Sales managers finally trust the pipeline numbers.",
  },

  // ─── Customer Success (team) ───────────────────────────────────────────────
  {
    slug: "cs-qbr-health-automation",
    title: "QBR prep + health scores across your entire book",
    icon: "💚",
    category: "customer-success",
    categoryLabel: "Customer Success",
    buyer: "VP Customer Success / CS Ops Lead, SaaS companies with 5+ CSMs (Series A–C)",
    painPoint:
      "Each CSM manages 30–50 accounts and must manually check 4–6 tools per account: product usage in Mixpanel, support tickets in Zendesk, billing in Stripe, CRM notes in Salesforce, engagement signals in Intercom. QBR prep alone takes 4–8 hours per account — for a CSM with 15 enterprise accounts doing quarterly QBRs, that's 60–120 hours per quarter on prep alone. And between QBRs, nobody is consistently monitoring health signals. By the time a CSM notices usage dropping, the customer is already evaluating competitors. One org cut QBR prep time by 83% with automation.",
    trigger:
      "Daily: monitor health scores across all accounts. QBR scheduled: auto-prepare full package 5 days before",
    accentColor: "hsl(160, 84%, 39%)",
    metric: "83% less QBR prep · 5–15 seats · $3k MRR",
    hoursSaved: "4–8 hrs saved per QBR · 5–8 hrs/week per CSM on health monitoring",
    roi: [
      "QBR prep reduced from 6 hours to 45 minutes per account — CSMs review and personalize, not build from scratch",
      "At-risk accounts flagged 60 days before renewal — not 2 weeks before when it's too late",
      "10 CSMs × 200 hrs/quarter QBR prep = $112k/quarter in labor saved (US rates)",
      "Health scores calculated daily from real product usage, not quarterly gut-feel check-ins",
      "Upsell opportunities auto-identified: accounts at 90%+ usage, growing teams, feature requests matching higher tiers",
    ],
    uniqueAngle:
      "Not a CS platform feature (Gainsight has templates but doesn't pull data from Mixpanel, Zendesk, Stripe). Not a slide deck tool (Google Slides doesn't auto-populate with customer data). This runs two loops simultaneously: (1) daily health monitoring across every account in every CSM's book, and (2) full QBR package assembly from 6+ data sources when a review is scheduled. Every CSM on the team gets both — health alerts for their accounts and ready-to-present QBR decks. That's 5–15 seats of value.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls product usage trends from analytics — adoption rate, feature usage, power users, growth/decline signals",
        tools: [
          { label: "Mixpanel", color: "#7856FF" },
          { label: "Amplitude", color: "#1E61F0" },
          { label: "Segment", color: "#52BD94" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "Usage data pulled for 150 accounts · 12 showing declining usage (>20% drop MoM) · 8 approaching tier limits · 3 new departments onboarded",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls support history + billing data — ticket volume, CSAT, outstanding issues, payment health, contract terms",
        tools: [
          { label: "Zendesk", color: "#03363D" },
          { label: "Freshdesk", color: "#2DB875" },
          { label: "Intercom", color: "#286EFA" },
          { label: "Stripe", color: "#6772E5" },
          { label: "Razorpay", color: "#072654" },
        ],
        detail: "Support: avg CSAT 4.5/5 · 3 accounts with escalated tickets · Billing: all payments current except 2 accounts with failed charges",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Calculates composite health scores + generates QBR deck narratives for scheduled reviews",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Google Docs", color: "#4285F4" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "Health scores: 120 Green · 22 Yellow · 8 Red · 3 QBR decks prepared with exec summary, ROI calculation ($340k value = 2.8× contract), expansion recommendations",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Verifies all metrics, cross-checks data sources, flags accounts where signals conflict",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Stripe", color: "#6772E5" },
          { label: "Mixpanel", color: "#7856FF" },
          { label: "Looker", color: "#4285F4" },
        ],
        detail: "All figures verified · 2 conflicting signals found (high usage but low CSAT — investigating) · ROI methodology documented · source links embedded",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Routes alerts to CSMs — at-risk accounts in Slack, QBR packages via email, upsell opportunities flagged",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Google Calendar", color: "#4285F4" },
          { label: "Zoom", color: "#2D8CFF" },
          { label: "Google Drive", color: "#34A853" },
        ],
        detail: "8 Red account alerts sent to respective CSMs · 3 QBR packages delivered · 5 upsell opportunities flagged · internal prep calls booked",
      },
    ],
    result:
      "150 accounts health-scored daily. 8 at-risk accounts flagged 60 days before renewal — 3 saved with proactive outreach. 3 QBR packages assembled from 6 data sources in 45 minutes instead of 6 hours each. Net churn reduced 22%. Expansion pipeline: $420k identified.",
  },
  {
    slug: "cs-onboarding-orchestration",
    title: "Customer onboarding that runs itself",
    icon: "🚀",
    category: "customer-success",
    categoryLabel: "Customer Success",
    buyer: "VP Customer Success / Head of Onboarding, SaaS companies onboarding 10+ customers/month",
    painPoint:
      "Every closed deal triggers a 15–25 step onboarding process: create project, assign tasks to customer + internal team (CS, engineering, sales handoff), track completion, send reminders, escalate blockers, hand off to ongoing CSM. Each onboarding takes 8–12 hours of coordination. At 20 new customers/month, that's 160–240 hours/month of manual project management. Users who reach first value within 2 weeks are 3× more likely to renew — so speed matters enormously. But coordination bottlenecks mean average time-to-value is 4–6 weeks, not 2.",
    trigger:
      "Deal marked Closed-Won in CRM → auto-create onboarding project, assign tasks, track progress, escalate blockers",
    accentColor: "hsl(45, 93%, 47%)",
    metric: "50% faster onboarding · 5–10 seats · $2k MRR",
    hoursSaved: "8–12 hrs saved per customer · 160–240 hrs/month at 20 customers",
    roi: [
      "Onboarding time cut by 50% — time-to-value goes from 4–6 weeks to 2 weeks",
      "3× higher renewal rate for customers who onboard within 2 weeks (industry data)",
      "160–240 hrs/month saved on onboarding coordination at 20 customers/month",
      "Zero dropped tasks: every onboarding step tracked, assigned, and deadline-monitored automatically",
      "CSM handoff is seamless — ongoing CSM inherits full context, not a blank account",
    ],
    uniqueAngle:
      "Not a project management tool (Asana has templates but doesn't auto-populate from CRM data, doesn't monitor task completion, doesn't escalate blockers to Slack, doesn't track time-to-value). This is the full orchestration loop: deal closes → project auto-created with customer-specific tasks → daily progress monitoring → automatic reminders to customer and internal team → blocker escalation → time-to-value tracking → handoff to ongoing CSM with full context. Every CSM and onboarding specialist uses it — 5–10 seats.",
    steps: [
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Detects Closed-Won deal, creates onboarding project with templated tasks personalized to customer tier and product",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Asana", color: "#F06A6A" },
          { label: "JIRA", color: "#0052CC" },
          { label: "Monday.com", color: "#FF3D57" },
        ],
        detail: "Deal detected: Acme Corp ($80k ACV, Enterprise tier) · 22-step onboarding project created · tasks assigned to CSM Sarah, Solutions Engineer Mike, and customer champion Jane",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Sends personalized welcome email to customer with onboarding timeline, first steps, and scheduling link",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Calendly", color: "#006BFF" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
        ],
        detail: "Welcome package sent to Acme Corp · includes onboarding timeline, Notion checklist, and Calendly link for kickoff call · kickoff booked for Tuesday 2pm",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Monitors task completion daily — tracks progress, identifies blockers, checks if customer has started using the product",
        tools: [
          { label: "Asana", color: "#F06A6A" },
          { label: "Mixpanel", color: "#7856FF" },
          { label: "Intercom", color: "#286EFA" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "Day 5: 12/22 tasks complete · customer logged in 8 times · API integration not started (blocker: engineering team hasn't received credentials) · blocker flagged",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Escalates blockers in Slack, sends reminders to overdue task owners, updates progress dashboards",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Asana", color: "#F06A6A" },
        ],
        detail: "Blocker escalated: #cs-escalations Slack channel pinged · Solutions Engineer Mike reminded about API credentials · customer notified of revised timeline",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Tracks time-to-value metrics, compares against benchmarks, generates onboarding health report",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Looker", color: "#4285F4" },
          { label: "Salesforce", color: "#00A1E0" },
        ],
        detail: "Time-to-value: 11 days (benchmark: 14 days — ahead of schedule) · Onboarding NPS: pending · 1 blocker resolved · overall health: Green",
      },
    ],
    result:
      "Customer fully onboarded in 11 days (vs 28-day average). Zero dropped tasks across 22 steps. Blocker resolved in 4 hours via automated escalation. CSM handoff included full context. Customer rated onboarding 9/10.",
  },

  // ─── Marketing (team) ──────────────────────────────────────────────────────
  {
    slug: "marketing-cross-channel-reporting",
    title: "Cross-channel marketing reports, every Monday",
    icon: "📊",
    category: "marketing",
    categoryLabel: "Marketing",
    buyer: "VP Marketing / Marketing Ops Manager, B2B SaaS or D2C (Series A–C, 50–300 employees)",
    painPoint:
      "Every Monday, the marketing team logs into 6–8 platforms — Google Ads, Meta Ads, GA4, Search Console, HubSpot, Klaviyo, Mixpanel — pulls numbers into spreadsheets, reconciles different metric definitions, and tries to build a unified view of what's working. 56% of marketers say they don't have enough time to analyze data thoroughly. A 5-person marketing team spends 10–15 hours/week just on reporting. And the reports are always late, always inconsistent, and always missing someone's favorite metric. Attribution is a nightmare because no single tool connects ad spend to pipeline to revenue.",
    trigger:
      "Every Monday 8am: pull data from all channels, build unified performance report, recommend budget reallocation",
    accentColor: "hsl(280, 65%, 55%)",
    metric: "10–15 hrs/week saved · 3–6 seats · $1.5k MRR",
    hoursSaved: "10–15 hrs/week across marketing team · reports delivered Monday 8am, not Wednesday",
    roi: [
      "10–15 hrs/week saved on manual reporting — team focuses on strategy, not spreadsheets",
      "Reports delivered Monday 8am automatically — not Wednesday afternoon after 2 days of data-pulling",
      "Unified attribution: ad spend → leads → pipeline → revenue connected across all channels",
      "Budget reallocation recommendations based on cross-channel ROAS — not gut feel",
      "Every marketer gets their own view: performance marketer sees ROAS, content lead sees SEO metrics, CMO sees revenue impact",
    ],
    uniqueAngle:
      "Not a BI dashboard (Looker shows data but doesn't write insights or recommendations). Not a single-channel tool (Google Ads reports don't include Meta or email). This pulls from every channel, normalizes metrics, writes the narrative ('Meta ROAS dropped 30% last week — here's why and what to do'), and recommends specific budget moves. Every person on the marketing team gets the view they need. 3–6 seats: performance marketer, content lead, SEO specialist, marketing manager, CMO.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls performance data from all ad platforms, analytics, email, and CRM — normalizes metrics across sources",
        tools: [
          { label: "Google Ads", color: "#4285F4" },
          { label: "Meta Ads", color: "#1877F2" },
          { label: "TikTok Ads", color: "#010101" },
          { label: "Google Analytics", color: "#E37400" },
          { label: "Google Search Console", color: "#4285F4" },
        ],
        detail: "Last 7 days: $42k ad spend across 3 platforms · 2,400 clicks · 180 leads · GA4 shows 12% traffic increase · 8 keywords gained top-3 positions",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls email/marketing automation + CRM pipeline data to connect spend to revenue",
        tools: [
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Klaviyo", color: "#000000" },
          { label: "Mailchimp", color: "#FFE01B" },
          { label: "Mixpanel", color: "#7856FF" },
          { label: "Salesforce", color: "#00A1E0" },
        ],
        detail: "Email: 45% open rate, 3.2% CTR · 180 leads → 34 MQLs → 12 SQLs · pipeline influence: $280k · blended CAC: $233",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes unified performance report with insights, trends, and specific budget reallocation recommendations",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Google Docs", color: "#4285F4" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "Report generated: 'Meta ROAS dropped 28% — recommend shifting $5k to Google Search which gained 3 top-3 keywords. Email revenue up 40% — double down on abandoned cart sequence.' 4 specific actions recommended.",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Verifies all numbers against source platforms, catches metric discrepancies, validates attribution logic",
        tools: [
          { label: "Google Ads", color: "#4285F4" },
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Looker", color: "#4285F4" },
        ],
        detail: "All metrics verified · 1 discrepancy found (GA4 vs HubSpot lead count — 180 vs 176 due to bot filtering) · noted in report · attribution model consistent",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Delivers report to team — Slack summary, full report in Sheets, CMO gets email digest with key decisions needed",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Google Drive", color: "#34A853" },
        ],
        detail: "Monday 8am: #marketing Slack gets TL;DR · full report auto-saved in Drive · CMO email digest sent with 3 decisions needed · performance marketer gets channel-specific view",
      },
    ],
    result:
      "Unified marketing report delivered Monday 8am — all 6 channels, one view. $5k budget reallocation recommended (Meta → Google Search). Team saved 12 hrs/week. CMO made budget decision by Monday lunch instead of waiting until Wednesday.",
  },
  {
    slug: "content-repurpose-distribute",
    title: "One blog post → 15 content assets, distributed",
    icon: "♻️",
    category: "marketing",
    categoryLabel: "Marketing",
    buyer: "Head of Content / Marketing Manager, B2B SaaS or D2C with active content calendar",
    painPoint:
      "94% of marketers repurpose content, but it's almost entirely manual. A single blog post needs to become 5 LinkedIn posts, 3 Twitter threads, an email newsletter section, Instagram carousel copy, and a YouTube Shorts script. Then each needs scheduling across platforms. This takes 3–5 hours per piece of content. If you're publishing 4 pieces/week, that's 12–20 hours/week just on repurposing — almost a full-time person. And most teams don't have that person, so 80% of content never gets repurposed, dying after its initial publish.",
    trigger:
      "Blog post published in Notion/WordPress → auto-create multi-format content for every channel and schedule distribution",
    accentColor: "hsl(320, 70%, 50%)",
    metric: "3× content output · 3–6 seats · $1.2k MRR",
    hoursSaved: "3–5 hrs saved per content piece · 12–20 hrs/week at 4 pieces/week",
    roi: [
      "3× content output from same team — every piece gets distributed across 5+ channels instead of dying after initial publish",
      "12–20 hrs/week saved on manual repurposing and scheduling",
      "80% of content that was never repurposed now gets distributed automatically",
      "Consistent brand voice across all channels — Sentinel enforces tone and messaging guidelines",
      "Content ROI visible: track which formats and channels drive the most engagement per piece",
    ],
    uniqueAngle:
      "Not a social media scheduler (Buffer schedules but doesn't write the content). Not an AI writer (ChatGPT writes but doesn't know your brand voice, doesn't schedule, doesn't track performance). This is the full content multiplication loop: source piece published → extracted into platform-specific formats → brand voice verified → scheduled across channels → performance tracked. Content writer, social manager, and email marketer all benefit — 3–6 seats.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Detects new blog post published, extracts key points, identifies best angles for each platform",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
          { label: "Google Analytics", color: "#E37400" },
        ],
        detail: "New post detected: '10 Ways AI Agents Transform Sales' (2,200 words) · 5 key insights extracted · 3 data points identified · best angles mapped to LinkedIn (thought leadership), Twitter (tactical tips), email (case study highlight)",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Creates platform-specific content — LinkedIn posts, Twitter threads, email snippets, Instagram captions, newsletter sections",
        tools: [
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Docs", color: "#4285F4" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "15 assets created: 5 LinkedIn posts (different angles) · 3 Twitter threads · 2 email newsletter blocks · 3 Instagram captions · 2 YouTube Shorts scripts — each tailored to platform norms",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Reviews every piece for brand voice consistency, accuracy, and platform best practices",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "Quality gate: 13 PASS · 2 revised (Twitter thread too promotional, LinkedIn post missing CTA) · brand voice score: 92/100 across all pieces",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Schedules content across all channels, adds to email newsletter queue, creates tasks for design team",
        tools: [
          { label: "LinkedIn", color: "#0A66C2" },
          { label: "Twitter/X", color: "#1DA1F2" },
          { label: "Instagram", color: "#E4405F" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Klaviyo", color: "#000000" },
          { label: "Asana", color: "#F06A6A" },
          { label: "Slack", color: "#4A154B" },
        ],
        detail: "5 LinkedIn posts scheduled (Mon–Fri) · 3 Twitter threads queued · email snippet added to next newsletter · Asana task created for design team (carousel graphics needed) · #content-calendar Slack updated",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Tracks performance of each content piece across channels — engagement, clicks, conversions — reports back weekly",
        tools: [
          { label: "Google Analytics", color: "#E37400" },
          { label: "LinkedIn", color: "#0A66C2" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Looker", color: "#4285F4" },
        ],
        detail: "Week 1 results: LinkedIn post #3 got 12k impressions (best performer) · Twitter thread drove 340 clicks · email snippet had 4.2% CTR · total: 3× more distribution than manual process",
      },
    ],
    result:
      "One blog post became 15 content assets across 5 channels. All scheduled and distributed within 2 hours of publish. Content team saved 4 hours. LinkedIn post #3 went semi-viral (12k impressions). Email snippet drove 340 clicks to the original article.",
  },

  // ─── Support (team — new category usage) ───────────────────────────────────
  {
    slug: "support-ticket-intelligence",
    title: "Support tickets triaged & routed in seconds",
    icon: "🎫",
    category: "customer-success",
    categoryLabel: "Customer Success",
    buyer: "Head of Support / VP Customer Success, SaaS or e-commerce with 5+ support agents",
    painPoint:
      "Manual ticket triage takes 2–3 hours per 100 tickets. Every ticket needs: categorization (bug vs feature request vs billing vs how-to), priority assessment, routing to the correct agent, checking if it's a known issue, and drafting an initial response. Self-serviced tickets cost $2 vs $104 for agent-handled (Harvard Business Review). But without intelligent triage, everything lands in a general queue. Agents spend 30% of their time just reading, categorizing, and routing — before they even start solving the problem. For a team handling 500 tickets/week, that's 30–50 hours/week of pure triage overhead.",
    trigger:
      "Every new support ticket → auto-categorize, prioritize, route to correct agent, draft response if known issue",
    accentColor: "hsl(195, 75%, 48%)",
    metric: "90%+ auto-triage · 5–20 seats · $3k MRR",
    hoursSaved: "30–50 hrs/week saved on triage · first-response time cut by 60%",
    roi: [
      "90%+ tickets auto-categorized and prioritized — agents start solving, not sorting",
      "First-response time cut by 60% — customers get acknowledgment in minutes, not hours",
      "Support team handles 2× ticket volume without hiring — triage overhead eliminated",
      "Known issues auto-resolved with pre-written responses — $2/ticket vs $104 for agent-handled",
      "Trending issue detection: if 15 tickets mention the same bug in 2 hours, engineering gets alerted immediately",
    ],
    uniqueAngle:
      "Not a chatbot (those handle simple FAQs but can't categorize, prioritize, and route complex tickets). Not a canned response tool (those don't understand context). This is intelligent triage: understand the ticket content, categorize it (bug/feature/billing/how-to), assess priority (P1 if customer is enterprise + production-down), route to the specialist, check knowledge base for known solutions, draft a response if applicable, and escalate to engineering if it's a new bug. Every support agent gets AI-powered context — 5–20 seats.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Reads incoming ticket, analyzes content, categorizes (bug/feature/billing/how-to), assesses priority and sentiment",
        tools: [
          { label: "Zendesk", color: "#03363D" },
          { label: "Freshdesk", color: "#2DB875" },
          { label: "Intercom", color: "#286EFA" },
        ],
        detail: "Ticket analyzed: 'Our dashboard won't load since this morning — we have a demo in 2 hours' → Category: Bug · Priority: P1 (production issue + time-sensitive) · Sentiment: Frustrated · Customer tier: Enterprise",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Checks knowledge base and recent tickets for known issues — matches against existing solutions",
        tools: [
          { label: "Confluence", color: "#0052CC" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Zendesk", color: "#03363D" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "Match found: 3 similar tickets in last 24 hours reporting dashboard loading issues · known issue KB article exists · engineering already aware (JIRA-4521) · ETA fix: 4 hours",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Drafts response acknowledging the issue, providing workaround, and setting expectations — personalized to customer context",
        tools: [
          { label: "Zendesk", color: "#03363D" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Gmail", color: "#EA4335" },
        ],
        detail: "Response drafted: acknowledges P1 urgency, references their demo timeline, provides dashboard cache-clear workaround, confirms engineering fix ETA of 4 hours, offers to join their demo as backup",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Routes to correct agent with full context, creates engineering ticket if needed, alerts team leads for P1",
        tools: [
          { label: "Zendesk", color: "#03363D" },
          { label: "JIRA", color: "#0052CC" },
          { label: "Linear", color: "#5E6AD2" },
          { label: "Slack", color: "#4A154B" },
        ],
        detail: "Routed to Agent Mike (dashboard specialist) · draft response attached · #support-p1 Slack alert fired · JIRA-4521 updated with new affected customer · SLA timer started: 1-hour response target",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Monitors ticket patterns, detects trending issues, tracks SLA compliance and agent performance",
        tools: [
          { label: "Looker", color: "#4285F4" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Slack", color: "#4A154B" },
        ],
        detail: "Trending alert: 8 dashboard tickets in 2 hours → engineering escalation triggered · SLA compliance: 94% this week · auto-triage accuracy: 91% · 3 tickets auto-resolved with KB articles",
      },
    ],
    result:
      "500 tickets/week triaged automatically. First-response time dropped from 4 hours to 12 minutes. 3 tickets auto-resolved with KB articles ($312 saved per ticket). Trending bug caught in 2 hours, engineering notified. Support team handles 2× volume without hiring.",
  },

  // ─── RevOps (team) ─────────────────────────────────────────────────────────
  {
    slug: "revops-pipeline-hygiene",
    title: "Pipeline hygiene + forecast that updates itself",
    icon: "🔮",
    category: "sales",
    categoryLabel: "Sales",
    buyer: "RevOps Manager / CRO / VP Sales, B2B SaaS with 5+ sales reps",
    painPoint:
      "RevOps spends 60–70% of their time on CRM hygiene: finding stale deals, chasing reps for missing fields, identifying stuck opportunities, and reconciling what reps say in stand-ups with what the CRM shows. Sales managers spend 5–8 hours/week building forecast decks. Nobody trusts the pipeline numbers because 40% of deals have outdated stages, missing close dates, or empty fields. The weekly forecast meeting is a fiction-reading exercise where everyone pretends the numbers are real. Meanwhile, $500k in pipeline rots silently because nobody noticed those deals went cold 6 weeks ago.",
    trigger:
      "Daily: audit CRM for data quality. Weekly: generate pipeline forecast and coaching insights for sales managers",
    accentColor: "hsl(258, 90%, 66%)",
    metric: "60–70% RevOps time saved · 3–8 seats · $1.5k MRR",
    hoursSaved: "60–70% of RevOps time reclaimed · 5–8 hrs/week per sales manager on forecasts",
    roi: [
      "RevOps reclaims 60–70% of time — redirected from CRM cleanup to strategic projects",
      "Forecast accuracy improves 20–30% — based on deal activity and conversation signals, not rep optimism",
      "Stale deals caught weekly: $500k+ in dead pipeline identified and resolved or removed",
      "Sales managers save 5–8 hrs/week on forecast prep — get auto-generated forecast narratives every Monday",
      "Coaching opportunities auto-identified: reps with declining activity, deals without next steps, accounts going dark",
    ],
    uniqueAngle:
      "Not a CRM reporting feature (Salesforce dashboards show pipeline but don't analyze deal health or write forecast narratives). Not a data cleaning tool (those run once and data goes stale). This is continuous, autonomous pipeline intelligence: daily CRM audits, weekly forecast generation, deal health scoring based on actual activity (not just deal stage), and proactive coaching alerts. RevOps, each sales manager, and the CRO all need different views — that's 3–8 seats.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Audits every deal in CRM — checks for stale deals, missing fields, inconsistent stages, and activity gaps",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Zoho CRM", color: "#DC2626" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "142 active deals audited · 12 stale (no activity 30+ days) · 18 missing required fields · 4 with inconsistent stages (marked 'Negotiation' but no proposal sent) · 8 at-risk (competitor mentioned in recent calls)",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Calculates weighted pipeline forecast using historical win rates, deal velocity, and conversation signals",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Gong", color: "#9B59B6" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Looker", color: "#4285F4" },
        ],
        detail: "Weighted forecast: $2.1M (vs $3.4M rep-reported) · historical win rate at current stage: 38% · 6 deals likely to slip (below velocity benchmark) · 3 deals likely to close early (champion engaged, budget confirmed)",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes forecast narrative for board/leadership and individual coaching summaries for each sales manager",
        tools: [
          { label: "Google Docs", color: "#4285F4" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "Board forecast narrative: 'Likely close $2.1M this quarter vs $2.5M target. Gap: $400k. 3 deals in late stage could close with executive sponsor engagement. Recommended action: CRO joins calls with Acme Corp, Beta Inc, Gamma Ltd.'",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Delivers pipeline alerts to reps, forecast reports to managers, and coaching insights to VP Sales — all via Slack + email",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Google Drive", color: "#34A853" },
        ],
        detail: "12 reps pinged about stale deals · 3 sales managers got coaching summaries · CRO received board-ready forecast · RevOps dashboard auto-updated",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Tracks forecast accuracy over time, identifies bias patterns, and monitors CRM health trends",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Looker", color: "#4285F4" },
          { label: "Salesforce", color: "#00A1E0" },
        ],
        detail: "Forecast accuracy last 3 quarters: 72% → 81% → 88% (improving). Bias detected: 2 reps consistently over-forecast by 30%. CRM health: 94% field completion (up from 56% when started).",
      },
    ],
    result:
      "142 deals audited. 12 stale deals flagged — 3 revived after outreach, 9 moved to Closed-Lost. Forecast accuracy: 88% (vs 52% before). CRM health improved from 56% to 94%. RevOps reclaimed 25 hrs/week for strategic work.",
  },

  // ─── Finance (team) ────────────────────────────────────────────────────────
  {
    slug: "finance-month-end-close",
    title: "Month-end close in 3 days, not 12",
    icon: "📅",
    category: "finance",
    categoryLabel: "Finance",
    buyer: "Controller / VP Finance / CFO, Series A–C companies with 50+ employees",
    painPoint:
      "Month-end close is the most dreaded process in finance. Cash reconciliation alone takes 30+ hours/month. Invoice processing: 100–200 hours/month for 1,000 invoices at $8–30/invoice manually. Stripe deducts fees before depositing, requiring gross/net reconciliation for every transaction. Expense categorization across Ramp/Brex transactions takes 20–30 hours. The average close takes 8–12 business days. During those 12 days, the finance team is unavailable for anything strategic — no analysis, no forecasting, no board prep. They're just reconciling spreadsheets.",
    trigger:
      "Month-end: auto-reconcile all accounts, categorize transactions, generate financial statements and board package",
    accentColor: "hsl(15, 80%, 50%)",
    metric: "Close in 3 days vs 12 · 3–5 seats · $2k MRR",
    hoursSaved: "30+ hrs/month on reconciliation · 100+ hrs/month on invoice processing",
    roi: [
      "Month-end close reduced from 8–12 days to 3–5 days — finance team unblocked for strategic work",
      "Cash reconciliation: 30+ hours reduced to 2 hours of review — Stripe/Razorpay ↔ QuickBooks/Zoho Books auto-matched",
      "Invoice processing cost drops from $15/invoice to $2/invoice with automated matching and categorization",
      "Expense policy violations caught automatically — 90%+ compliance without manual review",
      "Board package auto-generated: P&L, cash flow, key metrics, narrative — ready for CFO to review and send",
    ],
    uniqueAngle:
      "Not an accounting tool upgrade (QuickBooks/Zoho Books store data but don't reconcile intelligently). Not a simple rule-based automation (those break on exceptions). This handles the full close: Stripe/Razorpay → accounting system reconciliation (including gross/net fee handling), vendor invoice matching, expense categorization with policy checks, journal entry preparation, financial statement generation, and board package writing. AP specialist, AR specialist, controller, and CFO each have different workflows — 3–5 seats.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls all transactions from payment processors and reconciles against accounting system — matches deposits, fees, and refunds",
        tools: [
          { label: "Stripe", color: "#6772E5" },
          { label: "Razorpay", color: "#072654" },
          { label: "QuickBooks", color: "#2CA01C" },
          { label: "Zoho Books", color: "#DC2626" },
          { label: "Xero", color: "#13B5EA" },
        ],
        detail: "842 Stripe transactions reconciled · 23 Razorpay transactions matched · 4 discrepancies found (fee calculation differences, 2 missing deposits) · 99.5% auto-match rate",
      },
      {
        agent: "Forge",
        emoji: "⚒️",
        color: "hsl(25, 95%, 53%)",
        action: "Matches vendor invoices to purchase orders, categorizes expenses, flags policy violations",
        tools: [
          { label: "Ramp", color: "#0A0A0A" },
          { label: "QuickBooks", color: "#2CA01C" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Google Drive", color: "#34A853" },
        ],
        detail: "380 vendor invoices processed · 340 auto-matched to POs · 28 categorized (no PO) · 12 flagged for review (amount mismatch, new vendor, missing receipt) · 3 policy violations detected",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Prepares journal entries, generates financial statements (P&L, balance sheet, cash flow), writes board narrative",
        tools: [
          { label: "QuickBooks", color: "#2CA01C" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Google Docs", color: "#4285F4" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "12 journal entries prepared · P&L generated (revenue up 18% MoM, COGS down 3%) · cash flow statement · board narrative: 'Revenue grew 18% driven by enterprise deals. Burn rate decreased to $280k/month. 14 months runway.'",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Verifies all reconciliations, cross-checks totals, validates financial statements against source data",
        tools: [
          { label: "QuickBooks", color: "#2CA01C" },
          { label: "Stripe", color: "#6772E5" },
          { label: "Looker", color: "#4285F4" },
        ],
        detail: "All reconciliations verified · P&L balanced · 4 discrepancies resolved (fee timing differences) · audit trail documented · variance analysis: within 0.1% tolerance",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Routes exceptions to finance team, delivers financial package to CFO, creates tasks for remaining manual items",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Asana", color: "#F06A6A" },
          { label: "Google Drive", color: "#34A853" },
        ],
        detail: "12 exception items routed to AP/AR team in Slack · board package delivered to CFO via email · 3 remaining manual tasks created in Asana · close checklist: 94% complete day 2",
      },
    ],
    result:
      "Month-end close completed in 3 days instead of 12. 842 transactions auto-reconciled. 380 invoices processed. Board package ready for CFO review. Finance team reclaimed 8 working days for strategic analysis and forecasting.",
  },

  // ─── Operations (team) ─────────────────────────────────────────────────────
  {
    slug: "ops-data-sync-reporting",
    title: "Cross-tool data sync + weekly ops report",
    icon: "🔄",
    category: "operations",
    categoryLabel: "Operations",
    buyer: "Head of Ops / BizOps Manager / Chief of Staff, Series A–C companies with 50+ employees",
    painPoint:
      "Operations teams spend 50–60% of their time keeping data consistent between CRM, billing, project management, HRIS, and spreadsheets. When a deal closes in Salesforce, someone manually updates the project in Asana, the billing record in Stripe, and the customer list in Google Sheets. When an employee leaves in BambooHR, someone manually deprovisions their Slack, GitHub, and Notion accounts. Building the weekly leadership report means logging into 8–10 tools, pulling numbers, and pasting them into a deck. Data discrepancies cause wrong decisions — 'which revenue number is right, Salesforce or Stripe?'",
    trigger:
      "Continuous: sync data between core tools. Weekly: generate unified ops report from all sources",
    accentColor: "hsl(50, 85%, 50%)",
    metric: "50–60% ops time saved · 3–6 seats · $1.5k MRR",
    hoursSaved: "50–60% of ops team time reclaimed · 8–10 hrs/week on reporting eliminated",
    roi: [
      "50–60% of ops team time reclaimed — from manual data sync to strategic operations work",
      "Single source of truth: CRM ↔ billing ↔ PM ↔ HRIS always in sync — no more 'which number is right?'",
      "Weekly leadership report auto-generated from 8–10 sources — delivered Monday 8am, not Wednesday afternoon",
      "Data discrepancies caught automatically before they cause wrong decisions",
      "Employee lifecycle events (join/leave) automatically trigger tool provisioning/deprovisioning",
    ],
    uniqueAngle:
      "Not Zapier (linear triggers, no intelligence, brittle when data is messy). Not a BI tool (Looker shows data but doesn't sync it or write narratives). This is intelligent data orchestration: understand the relationships between your tools (deal closed = project starts = billing begins), sync data bidirectionally, catch discrepancies, and generate the human-readable report that tells leadership what happened this week and what to do. BizOps, RevOps, data analyst, and ops manager all need this — 3–6 seats.",
    steps: [
      {
        agent: "Forge",
        emoji: "⚒️",
        color: "hsl(25, 95%, 53%)",
        action: "Monitors core tools for change events and syncs data bidirectionally — CRM ↔ billing ↔ PM ↔ sheets",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Stripe", color: "#6772E5" },
          { label: "Razorpay", color: "#072654" },
          { label: "Asana", color: "#F06A6A" },
          { label: "JIRA", color: "#0052CC" },
        ],
        detail: "24 sync events today: 3 new deals → projects auto-created · 2 invoices paid → CRM updated · 1 customer churned → all systems updated · 18 field-level syncs",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Detects data discrepancies between systems — revenue mismatches, missing records, stale data",
        tools: [
          { label: "Google Sheets", color: "#34A853" },
          { label: "Looker", color: "#4285F4" },
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Stripe", color: "#6772E5" },
        ],
        detail: "2 discrepancies found: Salesforce shows $42k MRR but Stripe shows $41.2k (1 customer on annual billing not reflected) · 1 stale project in Asana (customer churned but project still active)",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls metrics from 8–10 sources for the weekly leadership report — revenue, pipeline, product usage, support, engineering velocity",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Stripe", color: "#6772E5" },
          { label: "Mixpanel", color: "#7856FF" },
          { label: "Zendesk", color: "#03363D" },
          { label: "JIRA", color: "#0052CC" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "28 metrics pulled: MRR $42k (+6% MoM) · pipeline $2.1M · DAU 3,400 (+12%) · support tickets 89 (-15%) · sprint velocity 42 points · NPS 61 · burn rate $280k",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes the weekly ops report — key metrics, trends, insights, action items, decisions needed from leadership",
        tools: [
          { label: "Google Docs", color: "#4285F4" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "Report: 'Revenue grew 6% MoM driven by 3 enterprise deals. Support volume down 15% thanks to KB improvements. Engineering shipped 2 major features. Key decision: approve $50k marketing budget increase for Q2 campaign.'",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Delivers report to leadership via Slack + email, resolves data discrepancies, and creates tasks for manual follow-ups",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Asana", color: "#F06A6A" },
          { label: "Google Drive", color: "#34A853" },
        ],
        detail: "Monday 8am: #leadership Slack gets executive summary · CEO email with full report + 2 decisions needed · 2 discrepancies auto-resolved · 1 Asana task created for finance to investigate billing mismatch",
      },
    ],
    result:
      "28 metrics from 8 sources, unified and verified. 2 data discrepancies caught and resolved. Weekly ops report delivered Monday 8am — CEO made budget decision before lunch. Ops team saved 12 hrs/week on manual data pulling and reporting.",
  },

  // ─── E-commerce: DTC Niche ───────────────────────────────────────────────
  {
    slug: "flash-sale-launch-autopilot",
    title: "Flash sale launched, start to finish, in under an hour",
    icon: "⚡",
    category: "ecommerce",
    categoryLabel: "E-commerce",
    buyer: "Head of Growth / E-commerce Director, DTC brands doing $2M–$20M revenue on Shopify or WooCommerce",
    painPoint:
      "Running a flash sale requires 8+ hours of coordination across 5 people: someone pulls inventory availability, someone checks margins, someone writes the email + SMS + social copy, someone updates the website, someone creates the Klaviyo segment, someone schedules everything, and someone monitors performance during the sale. Most brands can only run 2–3 unplanned flash sales per year because of this friction — even though flash sales consistently outperform planned promotions by 30–50% in revenue per email sent. The opportunity is always there (competitor drops price, supplier offers excess inventory at cost, it's a slow revenue week) but the execution overhead means it almost never happens.",
    trigger:
      "Human or webhook triggers a flash sale: competitor price drop detected, slow revenue day, excess inventory alert, or manual 'run a sale' command — agents handle everything else",
    accentColor: "hsl(35, 95%, 55%)",
    metric: "<1 hr from trigger to live · 30–50% revenue lift per flash sale · 8 hrs saved per sale",
    hoursSaved: "8 hrs saved per flash sale · run 10× more unplanned promotions per year",
    roi: [
      "Run 10× more flash sales per year — each one generating $5k–$50k in incremental revenue",
      "8+ hours of cross-team coordination compressed into under 60 minutes",
      "Every launch goes out verified: margins confirmed, inventory checked, copy QA'd, segments correct",
      "Post-sale report auto-generated: revenue, conversion rate, unsubscribes, margin — ready for next debrief",
      "Zero missed opportunities from 'we don't have bandwidth to spin up a sale this week'",
    ],
    uniqueAngle:
      "No other tool connects the full flash sale loop end-to-end: trigger → margin check → inventory confirmation → email + SMS + social copy → Klaviyo segment creation → scheduling → performance monitoring → post-sale report. Klaviyo can schedule emails. Shopify can run discount codes. But neither one checks your margins, writes the copy, validates the inventory, and monitors performance. Valence AI is the coordinator that does all five simultaneously in under an hour.",
    steps: [
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Receives flash sale trigger (competitor alert, manual command, or revenue anomaly) and decomposes it into a parallel task plan — inventory check, margin analysis, copy creation, and scheduling all kick off simultaneously",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Webhook", color: "#6366F1" },
          { label: "Valence AI", color: "#8B5CF6" },
        ],
        detail: "Flash sale triggered at 9:14am · Goal: 20% off sitewide, Shopify only · 4 parallel tasks dispatched · completion target: 10:00am",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Checks real-time inventory across all SKUs in Shopify — flags anything that can't sustain a 3× demand spike, cross-references with supplier lead times, and recommends which products to exclude from the sale",
        tools: [
          { label: "Shopify", color: "#96BF48" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Airtable", color: "#18BFFF" },
        ],
        detail: "847 SKUs scanned · 12 excluded (would stock out in <48 hrs at 3× velocity) · 2 excluded (below margin floor at 20% off) · 833 SKUs cleared for sale",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Runs margin analysis: at 20% discount, what's the gross margin per SKU? Flags any product where the discount would push margin below policy floor. Pulls Stripe historical data to forecast expected revenue lift based on prior comparable sales",
        tools: [
          { label: "Stripe", color: "#6772E5" },
          { label: "Shopify", color: "#96BF48" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "Blended margin at 20% off: 31% (above 28% floor) · Revenue forecast: $18k–$26k based on 3 comparable past sales · 2 low-margin SKUs auto-excluded",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes all promotional copy in parallel: flash sale email (subject line A/B variants), SMS follow-up, Instagram caption, TikTok caption, and website banner headline — all in brand voice, all referencing sale timing and urgency",
        tools: [
          { label: "Klaviyo", color: "#2D2D2D" },
          { label: "Instagram", color: "#E4405F" },
          { label: "TikTok", color: "#010101" },
          { label: "Canva", color: "#00C4CC" },
        ],
        detail: "Email written · 2 subject line variants ('⚡ 20% off — 24 hrs only' vs '20% off everything, today only') · SMS 160 chars · Instagram caption + 5 hashtags · TikTok hook written · banner copy ready",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "QA pass before anything goes live: verifies discount code works in Shopify, checks Klaviyo segment isn't accidentally excluding a major cohort, confirms all excluded SKUs are properly tagged, and validates email render on mobile",
        tools: [
          { label: "Shopify", color: "#96BF48" },
          { label: "Klaviyo", color: "#2D2D2D" },
          { label: "Litmus", color: "#EA4335" },
        ],
        detail: "Discount code FLASH20 verified · segment covers 34,200 subscribers (all active, last 180 days) · 0 excluded SKUs still tagged for sale · mobile render: PASS · 1 issue caught: subject line exceeded 50 chars on iOS preview — Ghost rewrites",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Schedules everything: Klaviyo email send at 11am, SMS at 3pm, Instagram post at noon, Shopify discount code activation — then monitors sale performance in real-time and sends hourly revenue snapshots to Slack",
        tools: [
          { label: "Klaviyo", color: "#2D2D2D" },
          { label: "Shopify", color: "#96BF48" },
          { label: "Slack", color: "#4A154B" },
          { label: "Google Sheets", color: "#34A853" },
        ],
        detail: "All assets scheduled · email launches 11am · hourly Slack updates active · Sentinel monitoring for anomalies (refund spike, coupon abuse, site slowdown)",
      },
    ],
    result:
      "Flash sale live by 10:47am — 93 minutes from trigger. Email to 34k subscribers, SMS to 18k, Instagram post live. By end of day: $22,400 in revenue, 4.1% conversion on email (vs 1.8% baseline), 0 stock-outs, 31% blended margin maintained. Post-sale report auto-delivered to Slack at midnight.",
  },

  // ─── Agency: Marketing Agency Niche ─────────────────────────────────────
  {
    slug: "agency-client-performance-narrative",
    title: "Client performance report with the insight already written",
    icon: "📊",
    category: "agency",
    categoryLabel: "Agency",
    buyer: "Agency Founder / VP Client Services, digital marketing agencies managing 10–100 clients",
    painPoint:
      "Every account manager at a digital agency spends 8–15 hours per week per client doing the same mechanical work: log into Google Ads, Meta, GA4, email platform, and Shopify — copy numbers into a spreadsheet — calculate percent changes — write a paragraph explaining what happened — format a slide deck — send a PDF. For a 20-client agency, that's 160–300 hours of manual reporting per week. That's not analysis. That's copy-paste. The real cost: account managers spend 70% of their time on reporting and 30% on actual strategy — exactly backwards from what clients are paying for and what prevents the agency from scaling without constant hiring.",
    trigger:
      "Every Friday at 3pm: pull all client data from connected ad platforms + analytics + email tools and generate performance reports ready for Monday morning delivery",
    accentColor: "hsl(200, 85%, 50%)",
    metric: "Weekly · 10–15 hrs saved per AM · serve 2× clients without hiring",
    hoursSaved: "10–15 hrs/week per account manager · agency scales without headcount",
    roi: [
      "Each AM handles 2× the client load — double agency capacity without hiring",
      "Reports go from monthly to weekly — clients stay informed, churn drops 20%",
      "Account managers spend 70% on strategy instead of 70% on copy-paste",
      "Sentinel catches data errors before the client does — protects agency credibility",
      "Agency differentiation: 'we deliver verified weekly reports with AI-generated insights' becomes a sales point",
    ],
    uniqueAngle:
      "Supermetrics, AgencyAnalytics, and Databox pull the data — but you still write the narrative, interpret the trends, and format the deliverable. That's where the 10 hours go. Valence AI's Ghost agent writes the performance narrative: 'Your Meta ROAS dropped 22% because creative fatigue hit week 3 of the same ad set — we recommend introducing 3 new video variants.' That sentence is what clients pay $5k–$20k/month for. Sentinel cross-checks every number against source APIs so no stale or wrong data goes to a client. One click and the report is ready to send.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls performance data from all connected ad platforms and analytics tools simultaneously — no manual login required",
        tools: [
          { label: "Google Ads", color: "#4285F4" },
          { label: "Meta Ads", color: "#0866FF" },
          { label: "TikTok Ads", color: "#010101" },
          { label: "GA4", color: "#F9AB00" },
          { label: "Klaviyo", color: "#2D2D2D" },
          { label: "Shopify", color: "#96BF48" },
        ],
        detail: "Client: Bloom Skincare · Google Ads: $18,400 spend · Meta: $12,200 spend · GA4: 42,800 sessions · Klaviyo: 34% open rate · Shopify: $94,200 revenue · all data timestamped and source-verified",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "Cross-checks every metric against source APIs — flags stale data, attribution window mismatches, and anomalies that would embarrass the agency if sent to a client",
        tools: [
          { label: "Google Ads", color: "#4285F4" },
          { label: "Meta Ads", color: "#0866FF" },
          { label: "GA4", color: "#F9AB00" },
          { label: "Shopify", color: "#96BF48" },
        ],
        detail: "2 issues caught: GA4 session count was 28-day window (client expects 7-day) — corrected · Meta ROAS used last-click vs client's agreed 7-day click attribution — recalculated · all metrics verified and timestamped",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Benchmarks client metrics against industry averages for their vertical — identifies what's actually good vs what just looks good relative to last week",
        tools: [
          { label: "Google Ads", color: "#4285F4" },
          { label: "Meta Ads", color: "#0866FF" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Airtable", color: "#18BFFF" },
        ],
        detail: "Beauty vertical benchmarks loaded: Google Ads avg CTR 2.1% (client at 3.4% — top quartile) · Meta CPM $18.40 avg (client at $14.20 — better than 70% of vertical) · email open rate 28% avg (client at 34% — strong)",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes the full performance narrative in the agency's voice: executive summary, channel-by-channel analysis, what drove performance, what hurt it, and 3 specific strategic recommendations for next week",
        tools: [
          { label: "Google Docs", color: "#4285F4" },
          { label: "Notion", color: "#8B8B8B" },
          { label: "Google Slides", color: "#FBBC04" },
        ],
        detail: "'Meta ROAS dropped from 3.8 to 2.9 because the top-performing creative (video #3) hit frequency 6.2 — creative fatigue threshold. Google Search is compensating — ROAS up 18%. Recommendation: pause video #3, launch 2 new UGC concepts next week. Email revenue up 41% driven by abandoned cart flow — expand to browse abandonment.'",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Formats and delivers the report: Google Doc + PDF + Slack summary to internal team + email draft to client — all ready for AM to review and send in 5 minutes",
        tools: [
          { label: "Google Docs", color: "#4285F4" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Slack", color: "#4A154B" },
          { label: "Notion", color: "#8B8B8B" },
        ],
        detail: "Google Doc formatted · PDF exported · internal Slack summary posted to #client-bloom · client email drafted with 3-sentence exec summary ready for AM to personalize and send",
      },
    ],
    result:
      "20 client reports generated by Friday 4pm. Each report has verified numbers, industry benchmarks, and a narrative that identifies what drove performance and what to do next week. Account managers spend 20 minutes reviewing and personalizing — not 12 hours building from scratch. Agency upgraded to weekly reporting for all clients. Client retention improved 18% in 90 days.",
  },

  // ─── Sales: B2B SaaS RevOps Niche ────────────────────────────────────────
  {
    slug: "dead-pipeline-revival-sprint",
    title: "Turn 6 months of dead pipeline into live opportunities this week",
    icon: "🔄",
    category: "sales",
    categoryLabel: "Sales",
    buyer: "VP of Sales / Head of RevOps, B2B SaaS companies (Series B–D, $5M–$50M ARR) with 150–1,000 employees",
    painPoint:
      "Every B2B SaaS company with 12+ months of sales history is sitting on a goldmine nobody touches: closed-lost deals. 30–40% of them become viable again within 6–12 months because budgets refresh, champions change companies and bring the vendor with them, competitors disappoint and the prospect is looking again, or the company raised a funding round and now has budget. A 300-person SaaS company closing 200 deals/year with a 40% win rate has 300+ closed-lost deals per year sitting in Salesforce — untouched. That's conservatively $5M–$15M in pipeline at zero acquisition cost. Nobody revisits them because it takes 4–6 hours per deal to research manually: check if the champion is still at the company, look for funding news, check if they've been posting competitor complaints, find a relevant angle to reach back out.",
    trigger:
      "Weekly: scan all Closed Lost deals from the past 6–18 months and surface the ones worth reviving right now, with personalized outreach ready to send",
    accentColor: "hsl(145, 70%, 42%)",
    metric: "Weekly · revive 5–15% of dead pipeline · $200k–$800k surfaced per run",
    hoursSaved: "4–6 hrs saved per deal researched · 50+ deals reviewed in the time it took to research 1",
    roi: [
      "Revive 5–15% of dead deals — at zero customer acquisition cost",
      "Surface $200k–$800k in pipeline per weekly run from deals already in your CRM",
      "Each revived deal comes with personalized outreach referencing the exact reason it's worth pursuing again",
      "Original AE gets full context: what changed, what to say, why now",
      "Sentinel tracks which revival signals actually convert — model improves over time",
    ],
    uniqueAngle:
      "Clay enriches lead data. Salesforce stores deal history. LinkedIn Sales Navigator shows job changes. But none of them coordinate all three to tell you: 'This deal from 8 months ago is worth calling because the champion just moved to a company 2× the size, they just raised a Series B, and they posted a LinkedIn complaint about their current vendor last week.' That's a 4-hour research job per deal. Valence AI's Scout runs that analysis on 300 deals simultaneously every Sunday night. By Monday morning, your team has a ranked list of the 15 deals most worth pursuing this week, each with a personalized 3-sentence outreach email referencing the specific reason they're worth calling back.",
    steps: [
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Pulls all Closed Lost deals from Salesforce/HubSpot from the past 6–18 months — filters by deal size threshold, original loss reason, and company size to focus on the highest-potential targets",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Airtable", color: "#18BFFF" },
        ],
        detail: "342 Closed Lost deals pulled (last 18 months) · filtered to 147 deals ≥$15k ACV · 89 excluded: price objection with no budget signal · 58 deals in active analysis queue",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Cross-references each deal against 6 revival signals: champion LinkedIn job changes, company funding events, website visit recurrence in GA4, email re-engagement in HubSpot, competitor review site complaints, and hiring signals in job boards",
        tools: [
          { label: "LinkedIn", color: "#0A66C2" },
          { label: "Crunchbase", color: "#1459F4" },
          { label: "GA4", color: "#F9AB00" },
          { label: "HubSpot", color: "#FF7A59" },
          { label: "G2", color: "#FF492C" },
          { label: "Greenhouse", color: "#25b84c" },
        ],
        detail: "58 deals analyzed · 12 champions changed companies · 7 companies raised funding rounds · 4 companies visited pricing page in last 14 days · 3 decision-makers posted competitor complaints on LinkedIn · 9 high-signal deals identified",
      },
      {
        agent: "Scout",
        emoji: "🔭",
        color: "hsl(160, 84%, 39%)",
        action: "Scores each deal on a revival priority matrix: signal strength × deal size × original relationship quality × time elapsed since close — ranks the full list from highest to lowest ROI to pursue",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Google Sheets", color: "#34A853" },
          { label: "Airtable", color: "#18BFFF" },
        ],
        detail: "Top deal: Apex Logistics · $48k ACV original deal · champion Sarah Chen moved to Director at 3× size company · company raised $22M Series B · revival score: 94/100 · recommended priority: call this week",
      },
      {
        agent: "Ghost",
        emoji: "👻",
        color: "hsl(258, 90%, 66%)",
        action: "Writes a personalized 3-sentence re-engagement email for each high-signal deal — references the specific reason it's worth calling back, acknowledges the previous conversation, and proposes a natural next step without being pushy",
        tools: [
          { label: "Gmail", color: "#EA4335" },
          { label: "Outreach", color: "#5951FF" },
          { label: "Salesloft", color: "#1A1A1A" },
          { label: "HubSpot", color: "#FF7A59" },
        ],
        detail: "'Hi Sarah — congrats on the move to Apex and the Series B. When we spoke at DataCo last year, the main blocker was budget — that's clearly changed now. Given Apex's scale, I think the conversation would look quite different. Worth a 20-minute call this week?' — personalized for each of 9 high-signal deals",
      },
      {
        agent: "Sentinel",
        emoji: "🔍",
        color: "hsl(330, 81%, 60%)",
        action: "QA pass: verifies champion is still at the new company, checks email isn't going to someone already in an active deal, confirms deal data is accurate, and validates the outreach tone matches company guidelines",
        tools: [
          { label: "Salesforce", color: "#00A1E0" },
          { label: "LinkedIn", color: "#0A66C2" },
          { label: "HubSpot", color: "#FF7A59" },
        ],
        detail: "9 deals reviewed · 1 flagged: champion Sarah Chen already has an open opportunity with another AE — removed from outreach queue · 8 approved · 1 email tone softened (original was too aggressive for enterprise relationship) · all clear",
      },
      {
        agent: "Kaze",
        emoji: "🌀",
        color: "hsl(217, 91%, 60%)",
        action: "Delivers the weekly revival report to RevOps and original AEs via Slack — ranked priority list, deal context, outreach emails ready to send, and instructions for each AE on what to do today",
        tools: [
          { label: "Slack", color: "#4A154B" },
          { label: "Salesforce", color: "#00A1E0" },
          { label: "Gmail", color: "#EA4335" },
          { label: "Outreach", color: "#5951FF" },
        ],
        detail: "Monday 8am Slack report to #revops: 8 high-signal deals ranked · $342k in combined ACV · individual Slack DMs to 6 AEs with their specific deal + email ready · Salesforce tasks created for each",
      },
    ],
    result:
      "58 dead deals analyzed in 4 hours (would have taken a team of 3 a full week manually). 8 high-signal revival opportunities surfaced. $342k ACV in potential pipeline identified at zero acquisition cost. 6 AEs wake up Monday with a personalized outreach email ready to send and the full context of why now. Within 3 weeks: 2 deals reopened, 1 progressed to proposal stage.",
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
