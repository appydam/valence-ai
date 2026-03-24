#!/usr/bin/env node
/**
 * Build-time static HTML injector for usevalence.ai
 *
 * Problem: The app is a Vite SPA. Crawlers that don't execute JavaScript
 * (Perplexity, ChatGPT browse, some Googlebot passes) only see an empty
 * <div id="root">. This script copies dist/index.html to each public route's
 * directory and injects per-route <title>, <meta description>, canonical URL,
 * and meaningful <noscript> body text — so crawlers get useful content.
 *
 * Approach: Pure Node.js string injection — no headless browser, no Chrome
 * dependencies. Works on Vercel, GitHub Actions, and any CI environment.
 *
 * Usage: node scripts/prerender.mjs
 * Runs after: vite build
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../dist");
const BASE_URL = "https://usevalence.ai";

// ── Use-case metadata (slug → title + description) ───────────────────────────
const USE_CASES = [
  { slug: "case-study-pipeline", title: "Turn Every Closed Deal Into a Case Study", category: "Marketing", desc: "Automate case study creation with AI agents. Detect closed deals, pull data from Salesforce and Gong, draft multi-format content, and distribute — all without manual effort." },
  { slug: "competitive-intel-radar", title: "Competitive Intelligence Radar", category: "Marketing", desc: "Monitor competitors automatically. AI agents track pricing changes, product launches, and market moves across the web and surface actionable intel to your team." },
  { slug: "competitor-price-response", title: "Competitor Price Response Autopilot", category: "Sales", desc: "Respond to competitor pricing changes faster. AI agents detect price moves, analyze impact, and draft response recommendations before your sales team loses a deal." },
  { slug: "client-reporting-autopilot", title: "Client Reporting Autopilot", category: "Agency", desc: "Generate client performance reports automatically. AI agents pull data from Google Analytics, ads, and CRM, then produce polished reports on schedule." },
  { slug: "month-end-close-prep", title: "Month-End Close Preparation", category: "Finance", desc: "Accelerate month-end close with AI automation. Agents reconcile accounts, flag anomalies, and prepare close packages — cutting manual work by 80%." },
  { slug: "incident-response-autopilot", title: "Incident Response Autopilot", category: "DevOps", desc: "Automate incident detection and response. AI agents monitor alerts, triage incidents, notify stakeholders, and create post-mortems automatically." },
  { slug: "regulatory-change-tracker", title: "Regulatory Change Tracker", category: "Legal", desc: "Track regulatory changes that affect your business. AI agents monitor compliance databases, flag relevant updates, and draft impact summaries for legal review." },
  { slug: "win-back-dead-deals", title: "Win Back Dead Deals", category: "Sales", desc: "Revive dead pipeline with AI-powered outreach. Agents analyze lost deals, identify re-engagement triggers, and craft personalized win-back sequences." },
  { slug: "seo-content-engine", title: "SEO Content Engine", category: "Marketing", desc: "Scale SEO content production with AI agents. Research keywords, draft optimized articles, and publish at scale — without a large content team." },
  { slug: "upsell-signal-detection", title: "Upsell Signal Detection", category: "Customer Success", desc: "Detect upsell opportunities before customers ask. AI agents monitor usage patterns, support tickets, and engagement signals to surface expansion revenue." },
  { slug: "vendor-renewal-autopilot", title: "Vendor Renewal Autopilot", category: "Operations", desc: "Never miss a vendor renewal. AI agents track contract dates, benchmark pricing, prepare negotiation briefs, and alert the right stakeholders automatically." },
  { slug: "meeting-to-action-autopilot", title: "Meeting to Action Autopilot", category: "Operations", desc: "Convert meetings into action items automatically. AI agents transcribe calls, extract decisions, create tasks in your project management tools, and follow up on blockers." },
  { slug: "performance-review-autopilot", title: "Performance Review Autopilot", category: "HR", desc: "Streamline performance reviews with AI automation. Agents collect peer feedback, aggregate metrics, and draft review documents — saving HR teams weeks of manual work." },
  { slug: "inventory-restock-forecasting", title: "Inventory Restock Forecasting", category: "E-commerce", desc: "Predict inventory needs before stockouts happen. AI agents analyze sales velocity, seasonal trends, and supplier lead times to generate restock recommendations." },
  { slug: "review-ugc-harvester", title: "Review and UGC Harvester", category: "E-commerce", desc: "Collect and repurpose customer reviews and UGC automatically. AI agents harvest reviews, identify top content, and reformat it for ads, landing pages, and social." },
  { slug: "client-audit-strategy", title: "Client Audit and Strategy", category: "Agency", desc: "Deliver comprehensive client audits in hours, not weeks. AI agents audit websites, ad accounts, and performance data, then generate strategic recommendations." },
  { slug: "expense-anomaly-detection", title: "Expense Anomaly Detection", category: "Finance", desc: "Catch expense fraud and policy violations automatically. AI agents analyze expense reports, flag anomalies, and alert finance teams before reimbursement." },
  { slug: "release-notes-autopilot", title: "Release Notes Autopilot", category: "DevOps", desc: "Generate release notes automatically from commits and PRs. AI agents summarize changes, format for different audiences, and distribute to customers and internal teams." },
  { slug: "contract-review-risk-flagging", title: "Contract Review and Risk Flagging", category: "Legal", desc: "Speed up contract review with AI agents. Automatically identify risky clauses, missing terms, and non-standard language — before legal spends hours reading." },
  { slug: "sales-lead-enrichment-outbound", title: "Sales Lead Enrichment and Outbound", category: "Sales", desc: "Enrich leads and launch outbound sequences automatically. AI agents research prospects, personalize messaging, and load sequences into your sales tools." },
  { slug: "sales-crm-hygiene", title: "Sales CRM Hygiene", category: "Sales", desc: "Keep your CRM clean automatically. AI agents detect stale deals, missing fields, and duplicates, then update records to maintain data quality across your pipeline." },
  { slug: "cs-qbr-health-automation", title: "CS QBR Health Automation", category: "Customer Success", desc: "Automate QBR preparation for customer success teams. AI agents pull account health data, usage metrics, and support history, then draft QBR decks automatically." },
  { slug: "cs-onboarding-orchestration", title: "CS Onboarding Orchestration", category: "Customer Success", desc: "Orchestrate customer onboarding with AI agents. Automate kickoff prep, task assignment, milestone tracking, and stakeholder communication across your tech stack." },
  { slug: "marketing-cross-channel-reporting", title: "Marketing Cross-Channel Reporting", category: "Marketing", desc: "Unify marketing performance across channels automatically. AI agents pull data from Google Analytics, Meta Ads, and LinkedIn, then generate consolidated reports." },
  { slug: "content-repurpose-distribute", title: "Content Repurpose and Distribute", category: "Marketing", desc: "Turn one piece of content into ten automatically. AI agents repurpose blog posts, webinars, and reports into LinkedIn posts, tweets, email snippets, and more." },
  { slug: "support-ticket-intelligence", title: "Support Ticket Intelligence", category: "Customer Success", desc: "Extract product insights from support tickets automatically. AI agents classify tickets, identify patterns, and surface actionable product feedback to your team." },
  { slug: "revops-pipeline-hygiene", title: "RevOps Pipeline Hygiene", category: "Operations", desc: "Maintain pipeline accuracy automatically. AI agents audit deal stages, flag stale opportunities, and enforce CRM hygiene rules across your entire revenue org." },
  { slug: "finance-month-end-close", title: "Finance Month-End Close", category: "Finance", desc: "Accelerate financial close with AI automation. Agents reconcile transactions, generate journal entries, and prepare close packages — reducing close time by days." },
  { slug: "ops-data-sync-reporting", title: "Ops Data Sync and Reporting", category: "Operations", desc: "Keep operational data in sync automatically. AI agents reconcile data across systems, flag discrepancies, and generate operational reports on schedule." },
  { slug: "flash-sale-launch-autopilot", title: "Flash Sale Launch Autopilot", category: "E-commerce", desc: "Launch flash sales without manual coordination. AI agents set up discount codes, update inventory alerts, prep email campaigns, and monitor performance in real time." },
  { slug: "agency-client-performance-narrative", title: "Agency Client Performance Narrative", category: "Agency", desc: "Generate client performance narratives automatically. AI agents analyze campaign data, identify wins and opportunities, and draft compelling narratives for client reviews." },
  { slug: "dead-pipeline-revival-sprint", title: "Dead Pipeline Revival Sprint", category: "Sales", desc: "Revive dormant deals with AI-powered sprint campaigns. Agents identify stalled opportunities, research re-engagement angles, and launch personalized outreach sequences." },
];

// ── Integration metadata (slug → name + description) ─────────────────────────
const INTEGRATIONS = [
  { slug: "salesforce", name: "Salesforce", desc: "AI agents that read and write Salesforce CRM records — sync contacts, update deals, create accounts, and run pipeline hygiene workflows automatically." },
  { slug: "hubspot", name: "HubSpot", desc: "Connect Valence AI to HubSpot. Agents update contact records, log activities, create deals, and trigger workflows based on real business events." },
  { slug: "dynamics365-sales", name: "Microsoft Dynamics 365", desc: "Integrate Valence AI with Microsoft Dynamics 365 Sales for automated CRM updates, pipeline management, and cross-system data sync." },
  { slug: "pipedrive", name: "Pipedrive", desc: "AI agents that manage your Pipedrive pipeline — update deal stages, enrich contacts, log notes, and run hygiene checks automatically." },
  { slug: "zoho-crm", name: "Zoho CRM", desc: "Connect Valence AI to Zoho CRM for automated lead management, deal updates, and cross-system synchronization." },
  { slug: "close", name: "Close CRM", desc: "Integrate Valence AI with Close CRM for automated lead management, call workflows, and sales activity tracking." },
  { slug: "zendesk-sell", name: "Zendesk Sell", desc: "AI agents that manage Zendesk Sell deals, contacts, and activities — automating sales workflows in the Zendesk ecosystem." },
  { slug: "insightly", name: "Insightly", desc: "Connect Valence AI to Insightly for automated CRM updates, project management workflows, and relationship intelligence." },
  { slug: "copper", name: "Copper CRM", desc: "Connect Valence AI to Copper CRM for automated contact management, deal tracking, and pipeline workflow automation." },
  { slug: "keap", name: "Keap", desc: "AI agents that manage Keap contacts, automate follow-up sequences, and trigger marketing workflows based on business events." },
  { slug: "freshsales", name: "Freshsales", desc: "Integrate Valence AI with Freshsales CRM for automated deal management, contact enrichment, and sales workflow automation." },
  { slug: "google-drive", name: "Google Drive", desc: "AI agents that read, write, and organize Google Drive files — enabling document-driven workflows and automated file management." },
  { slug: "dropbox", name: "Dropbox", desc: "Connect Valence AI to Dropbox for automated file management, document workflows, and cloud storage operations." },
  { slug: "sharepoint", name: "SharePoint", desc: "AI agents that access SharePoint document libraries, manage files, and automate document-centric workflows in Microsoft 365." },
  { slug: "box", name: "Box", desc: "Integrate Valence AI with Box for enterprise file management, automated document workflows, and secure content operations." },
  { slug: "onedrive", name: "OneDrive", desc: "AI agents that manage OneDrive files, automate document creation, and sync files across Microsoft 365 workflows." },
  { slug: "notion", name: "Notion", desc: "Connect Valence AI to Notion. Agents create pages, update databases, and sync knowledge across your Notion workspace automatically." },
  { slug: "onenote", name: "OneNote", desc: "Connect Valence AI to OneNote for automated note creation, knowledge management, and Microsoft 365 document workflows." },
  { slug: "confluence", name: "Confluence", desc: "AI agents that search, create, and update Confluence pages — keeping your team wiki current without manual documentation work." },
  { slug: "google-docs", name: "Google Docs", desc: "AI agents that create and edit Google Docs — enabling document-driven workflows and automated content generation." },
  { slug: "coda", name: "Coda", desc: "AI agents that read and write Coda docs and tables — enabling document-database hybrid workflows and automated content management." },
  { slug: "quip", name: "Quip", desc: "Integrate Valence AI with Quip for automated document creation and Salesforce-connected workflow management." },
  { slug: "slack", name: "Slack", desc: "Valence AI agents post updates, send alerts, and read Slack channels — keeping your team informed without manual status updates." },
  { slug: "microsoft-teams", name: "Microsoft Teams", desc: "AI agents that post to Teams channels, send notifications, and surface insights directly inside Microsoft Teams." },
  { slug: "zoom", name: "Zoom", desc: "AI agents that schedule Zoom meetings, process transcripts, and trigger workflows based on meeting outcomes." },
  { slug: "whatsapp", name: "WhatsApp Business", desc: "Send WhatsApp messages via Business API from AI agent workflows — enabling automated customer communication at scale." },
  { slug: "emarsys", name: "Emarsys", desc: "AI agents that manage Emarsys marketing automation workflows, campaign triggers, and customer engagement sequences." },
  { slug: "outreach", name: "Outreach", desc: "AI agents that manage Outreach sequences, create prospects, and trigger sales engagement workflows based on CRM signals." },
  { slug: "gong", name: "Gong", desc: "Connect Valence AI to Gong for call intelligence workflows — extract insights from recordings and trigger follow-up actions." },
  { slug: "salesloft", name: "Salesloft", desc: "AI agents that manage Salesloft cadences, create people, and trigger sales engagement workflows automatically." },
  { slug: "apollo", name: "Apollo.io", desc: "Integrate Valence AI with Apollo.io for automated lead research, contact enrichment, and outbound sequence management." },
  { slug: "mindtickle", name: "MindTickle", desc: "Integrate Valence AI with MindTickle for automated sales readiness workflows, training tracking, and rep performance management." },
  { slug: "lagrowthmachine", name: "La Growth Machine", desc: "AI agents that manage La Growth Machine campaigns, sequences, and multi-channel outreach workflows." },
  { slug: "clay", name: "Clay", desc: "Connect Valence AI to Clay for automated data enrichment, lead research, and outbound workflow management." },
  { slug: "instantly", name: "Instantly", desc: "AI agents that manage Instantly campaigns, add leads, and automate cold email outreach workflows at scale." },
  { slug: "smartlead", name: "Smartlead", desc: "Integrate Valence AI with Smartlead for automated cold email campaign management and agency outreach workflows." },
  { slug: "jira", name: "Jira", desc: "Valence AI agents create Jira issues, update ticket status, and manage sprint workflows — keeping your engineering backlog clean and current." },
  { slug: "asana", name: "Asana", desc: "AI agents that create Asana tasks, update project status, and manage team workflows — keeping projects on track without manual updates." },
  { slug: "trello", name: "Trello", desc: "Connect Valence AI to Trello. Agents create cards, move tasks across boards, and manage project workflows automatically." },
  { slug: "monday", name: "Monday.com", desc: "AI agents that update Monday.com items, trigger automations, and keep team boards current without manual data entry." },
  { slug: "azure-devops", name: "Azure DevOps", desc: "AI agents that manage Azure DevOps work items, pipelines, and repositories — automating engineering workflows in Microsoft's DevOps platform." },
  { slug: "clickup", name: "ClickUp", desc: "Integrate Valence AI with ClickUp for automated task creation, status updates, and project management workflows." },
  { slug: "linear", name: "Linear", desc: "AI agents that create and update Linear issues, manage engineering backlogs, and automate development workflow triggers." },
  { slug: "github", name: "GitHub", desc: "AI agents that create issues, open PRs, review code, and manage GitHub repositories — automating developer workflows end to end." },
  { slug: "vercel", name: "Vercel", desc: "Integrate Valence AI with Vercel for automated deployment workflows, environment management, and deployment monitoring." },
  { slug: "productboard", name: "Productboard", desc: "Connect Valence AI to Productboard for automated feature request triage, roadmap updates, and product feedback workflows." },
  { slug: "hive", name: "Hive", desc: "Connect Valence AI to Hive for automated action management, project tracking, and team workflow orchestration." },
  { slug: "shortcut", name: "Shortcut", desc: "AI agents that create Shortcut stories, manage epics, and automate engineering project workflows." },
  { slug: "todoist", name: "Todoist", desc: "Integrate Valence AI with Todoist for automated task creation, project management, and productivity workflow orchestration." },
  { slug: "airtable", name: "Airtable", desc: "Valence AI agents read and write Airtable records — enabling database-driven workflows and automated data management." },
  { slug: "gmail", name: "Gmail", desc: "AI agents that draft Gmail messages, organize inbox, and trigger email workflows based on business events — without manual email management." },
  { slug: "outlook", name: "Microsoft Outlook", desc: "AI agents that draft Outlook emails, manage inbox, and trigger email workflows inside Microsoft 365." },
  { slug: "sendgrid", name: "SendGrid", desc: "Send transactional and marketing emails from AI agent workflows using SendGrid's email delivery infrastructure." },
  { slug: "mailchimp", name: "Mailchimp", desc: "Connect Valence AI to Mailchimp for automated campaign creation, audience management, and email performance reporting." },
  { slug: "klaviyo", name: "Klaviyo", desc: "AI agents that manage Klaviyo flows, sync audience segments, and trigger email campaigns based on customer behavior." },
  { slug: "google-analytics", name: "Google Analytics", desc: "Pull Google Analytics data automatically. AI agents generate performance reports, surface insights, and trigger workflows based on traffic and conversion metrics." },
  { slug: "google-ads", name: "Google Ads", desc: "AI agents that monitor Google Ads performance, generate reports, and surface optimization recommendations automatically." },
  { slug: "meta-ads", name: "Meta Ads", desc: "Connect Valence AI to Meta Ads Manager for automated performance reporting, budget alerts, and campaign optimization workflows." },
  { slug: "linkedin-ads", name: "LinkedIn Ads", desc: "AI agents that track LinkedIn Ads performance, generate reports, and trigger workflows based on campaign metrics." },
  { slug: "google-calendar", name: "Google Calendar", desc: "AI agents that schedule meetings, manage calendar events, and coordinate scheduling workflows inside Google Calendar." },
  { slug: "calendly", name: "Calendly", desc: "AI agents that trigger workflows from Calendly bookings — automate prep, follow-up, and scheduling-based business processes." },
  { slug: "stripe", name: "Stripe", desc: "Connect Valence AI to Stripe for payment-triggered workflows — automate upsell outreach, renewal alerts, and revenue reporting." },
  { slug: "shopify", name: "Shopify", desc: "AI agents that manage Shopify orders, update product listings, trigger marketing workflows, and monitor e-commerce performance." },
  { slug: "woocommerce", name: "WooCommerce", desc: "AI agents that manage WooCommerce orders, update product data, and automate e-commerce workflows on WordPress." },
  { slug: "bigcommerce", name: "BigCommerce", desc: "Connect Valence AI to BigCommerce for automated order management, inventory workflows, and e-commerce reporting." },
  { slug: "twitter", name: "Twitter / X", desc: "Automate Twitter content creation and scheduling with AI agents. Draft posts, monitor mentions, and manage social presence without manual effort." },
  { slug: "linkedin", name: "LinkedIn", desc: "AI agents that draft LinkedIn posts, track engagement, and run LinkedIn-based outreach campaigns automatically." },
  { slug: "instagram", name: "Instagram", desc: "Connect Valence AI to Instagram for automated content scheduling, engagement monitoring, and social media reporting." },
  { slug: "youtube", name: "YouTube", desc: "AI agents that manage YouTube content, track video performance, and automate content distribution workflows." },
  { slug: "zapier", name: "Zapier", desc: "Connect Valence AI to Zapier to trigger Zaps from AI agent outputs and feed Zapier workflow results back into agent missions." },
  { slug: "make", name: "Make (Integromat)", desc: "Integrate Valence AI with Make for advanced automation — trigger Make scenarios from agent actions and process results within AI workflows." },
  { slug: "sentry", name: "Sentry", desc: "Connect Valence AI to Sentry for automated error triage, incident routing, and engineering alert management." },
  { slug: "datadog", name: "Datadog", desc: "Valence AI agents monitor Datadog alerts, correlate incidents, and trigger automated response workflows when anomalies are detected." },
  { slug: "pagerduty", name: "PagerDuty", desc: "AI agents that manage PagerDuty incidents, trigger escalations, and automate on-call response workflows." },
  { slug: "tableau", name: "Tableau", desc: "Integrate Valence AI with Tableau for automated data visualization updates and BI-driven workflow triggers." },
  { slug: "looker", name: "Looker", desc: "Connect Valence AI to Looker for automated report generation and data-driven workflow orchestration." },
  { slug: "powerbi", name: "Power BI", desc: "AI agents that pull Power BI data, generate performance summaries, and trigger business intelligence workflows." },
  { slug: "servicenow", name: "ServiceNow", desc: "Integrate Valence AI with ServiceNow for automated incident management, ITSM workflows, and enterprise service automation." },
  { slug: "freshdesk", name: "Freshdesk", desc: "AI agents that manage Freshdesk tickets, categorize support requests, and surface product insights from customer conversations." },
  { slug: "zendesk", name: "Zendesk", desc: "Integrate Valence AI with Zendesk for automated ticket triage, response drafting, and support intelligence workflows." },
  { slug: "bamboohr", name: "BambooHR", desc: "Integrate Valence AI with BambooHR for automated onboarding workflows, performance review prep, and HR data management." },
  { slug: "workday", name: "Workday", desc: "Connect Valence AI to Workday for automated HR workflows — performance reviews, headcount reporting, and organizational data sync." },
  { slug: "rippling", name: "Rippling", desc: "AI agents that integrate with Rippling for employee lifecycle automation, payroll triggers, and HR workflow orchestration." },
  { slug: "quickbooks", name: "QuickBooks", desc: "Valence AI agents connect to QuickBooks for automated expense tracking, invoice management, and financial reporting workflows." },
  { slug: "xero", name: "Xero", desc: "Integrate Valence AI with Xero for automated accounting workflows — reconciliation, invoice creation, and financial close automation." },
  { slug: "figma", name: "Figma", desc: "Connect Valence AI to Figma for design workflow automation — extract asset metadata, trigger design reviews, and sync design system updates." },
  { slug: "webflow", name: "Webflow", desc: "Integrate Valence AI with Webflow for automated CMS updates, content publishing workflows, and website management." },
  { slug: "twilio", name: "Twilio", desc: "AI agents that send SMS and WhatsApp messages via Twilio — enabling automated outreach and notification workflows." },
  { slug: "intercom", name: "Intercom", desc: "AI agents that read Intercom conversations, extract customer signals, and trigger workflows based on support data." },
  { slug: "google-search-console", name: "Google Search Console", desc: "Connect Valence AI to Google Search Console for automated SEO reporting, keyword tracking, and search performance workflows." },
  { slug: "semrush", name: "SEMrush", desc: "AI agents that pull SEMrush data for automated SEO analysis, keyword research, and competitive intelligence workflows." },
  { slug: "ahrefs", name: "Ahrefs", desc: "Integrate Valence AI with Ahrefs for automated backlink monitoring, SEO reporting, and content opportunity identification." },
  { slug: "hubspot-marketing", name: "HubSpot Marketing", desc: "Connect Valence AI to HubSpot Marketing for automated campaign creation, lead nurturing, and marketing performance reporting." },
  { slug: "marketo", name: "Marketo", desc: "AI agents that manage Marketo campaigns, sync lead data, and trigger marketing automation workflows based on business signals." },
  { slug: "pardot", name: "Pardot", desc: "Integrate Valence AI with Salesforce Pardot for automated B2B marketing workflows, lead scoring, and campaign management." },
  { slug: "docusign", name: "DocuSign", desc: "AI agents that trigger DocuSign envelopes, track signature status, and automate contract workflow management." },
  { slug: "hellosign", name: "HelloSign", desc: "Connect Valence AI to HelloSign for automated document signing workflows triggered by business events." },
  { slug: "razorpay", name: "Razorpay", desc: "Connect Valence AI to Razorpay for payment-triggered workflows, subscription management, and revenue reporting automation." },
  { slug: "braintree", name: "Braintree", desc: "AI agents that monitor Braintree transactions, trigger payment workflows, and automate revenue operations." },
  { slug: "anthropic", name: "Anthropic Claude", desc: "Valence AI is built on Anthropic's Claude models — powering intelligent reasoning, writing, and decision-making across all five agents." },
  { slug: "openai", name: "OpenAI", desc: "Integrate OpenAI models into Valence AI workflows for specialized language processing and AI-powered task execution." },
  { slug: "aws", name: "Amazon Web Services", desc: "Connect Valence AI to AWS for cloud infrastructure automation, S3 file management, and cloud resource monitoring." },
  { slug: "gcp", name: "Google Cloud Platform", desc: "Integrate Valence AI with GCP for automated cloud workflows, BigQuery reporting, and Google Cloud resource management." },
  { slug: "azure", name: "Microsoft Azure", desc: "AI agents that manage Azure resources, trigger cloud workflows, and automate infrastructure operations on Microsoft Azure." },
  { slug: "postgresql", name: "PostgreSQL", desc: "Valence AI agents query and write to PostgreSQL databases — enabling data-driven workflows and automated database operations." },
  { slug: "mysql", name: "MySQL", desc: "Connect Valence AI to MySQL for automated data queries, reporting workflows, and database-driven decision making." },
  { slug: "mongodb", name: "MongoDB", desc: "AI agents that read and write MongoDB collections — enabling document-database workflows and automated data management." },
  { slug: "redis", name: "Redis", desc: "Integrate Valence AI with Redis for high-speed data caching, session management, and real-time workflow triggers." },
];

// ── Glossary metadata ─────────────────────────────────────────────────────────
const GLOSSARY = [
  { slug: "ai-agent", term: "AI Agent", desc: "An AI agent is an autonomous software system that perceives its environment, makes decisions, and takes actions to achieve specific goals without continuous human instruction." },
  { slug: "autonomous-ai", term: "Autonomous AI", desc: "Autonomous AI refers to AI systems that operate independently, making decisions and executing multi-step tasks without requiring human approval at each step." },
  { slug: "ai-workforce", term: "AI Workforce", desc: "An AI workforce is a coordinated team of AI agents that collectively handle business functions — research, writing, coding, and system updates — like a digital team of employees." },
  { slug: "multi-agent-orchestration", term: "Multi-Agent Orchestration", desc: "Multi-agent orchestration is the coordination of multiple AI agents working together on complex tasks, with an orchestrator delegating work and managing agent outputs." },
  { slug: "ai-employee", term: "AI Employee", desc: "An AI employee is an autonomous AI agent assigned to perform ongoing business functions — not just answer questions, but execute real workflows across software systems." },
  { slug: "ai-worker", term: "AI Worker", desc: "An AI worker is an AI agent that executes specific business tasks autonomously — research, content creation, CRM updates, code — as part of a larger AI workforce." },
  { slug: "agentic-ai", term: "Agentic AI", desc: "Agentic AI describes AI systems that take initiative, plan multi-step actions, use tools, and pursue goals autonomously — as opposed to reactive chatbots." },
  { slug: "agent-memory", term: "Agent Memory", desc: "Agent memory refers to an AI agent's ability to store and recall information across sessions — enabling contextual continuity in long-running business workflows." },
  { slug: "quality-gates", term: "Quality Gates", desc: "Quality gates in AI agent systems are automated checkpoints that validate outputs against defined criteria before they reach humans or downstream systems." },
  { slug: "task-decomposition", term: "Task Decomposition", desc: "Task decomposition is the process of breaking complex goals into subtasks that can be assigned to specialized AI agents or executed in a defined sequence." },
  { slug: "ai-integration", term: "AI Integration", desc: "AI integration connects AI agents to external software systems — CRMs, project management tools, databases — enabling agents to read and write real business data." },
  { slug: "webhook-triggers", term: "Webhook Triggers", desc: "Webhook triggers allow AI agents to start workflows automatically in response to real-time events from external systems — a deal closed, a ticket opened, a payment received." },
  { slug: "ai-orchestrator", term: "AI Orchestrator", desc: "An AI orchestrator is the coordinating agent in a multi-agent system — it receives goals, plans execution, delegates to specialist agents, and synthesizes results." },
  { slug: "human-in-the-loop", term: "Human-in-the-Loop", desc: "Human-in-the-loop AI systems incorporate human approval or review at defined checkpoints, balancing autonomous execution with human oversight for high-stakes actions." },
  { slug: "enterprise-ai", term: "Enterprise AI", desc: "Enterprise AI refers to AI systems designed for business-scale deployment — with security, compliance, multi-system integration, and governance requirements met." },
  { slug: "ai-agent-platform", term: "AI Agent Platform", desc: "An AI agent platform is a managed system for deploying, orchestrating, and monitoring autonomous AI agents — providing infrastructure, integrations, and tools without requiring custom engineering." },
  { slug: "ai-automation", term: "AI Automation", desc: "AI automation uses artificial intelligence to execute repetitive tasks and complex workflows autonomously — going beyond rule-based automation with reasoning and decision-making." },
  { slug: "ai-orchestration", term: "AI Orchestration", desc: "AI orchestration is the process of coordinating multiple AI models, agents, and workflows to accomplish complex business goals — managing task routing, dependencies, and quality control." },
  { slug: "generative-ai-agents", term: "Generative AI Agents", desc: "Generative AI agents are autonomous AI systems that use large language models to create content, write code, and produce original work as part of business workflows." },
  { slug: "ai-task-automation", term: "AI Task Automation", desc: "AI task automation is the use of AI agents to autonomously execute specific business tasks — from lead enrichment and report generation to code review and content creation." },
];

// ── Comparison metadata ───────────────────────────────────────────────────────
const COMPARISONS = [
  { slug: "valence-vs-lindy", title: "Valence AI vs Lindy AI", desc: "Compare Valence AI and Lindy AI. Valence is a five-agent autonomous workforce for enterprise teams. Lindy is a single-agent assistant focused on individual productivity." },
  { slug: "valence-vs-zapier", title: "Valence AI vs Zapier", desc: "Compare Valence AI and Zapier. Valence AI executes autonomous multi-step missions with AI reasoning. Zapier is a no-code automation platform for rule-based workflow triggers." },
  { slug: "valence-vs-make", title: "Valence AI vs Make", desc: "Compare Valence AI and Make (Integromat). Valence runs AI-powered autonomous missions. Make is a visual workflow automation tool for structured data pipelines." },
  { slug: "valence-vs-crewai", title: "Valence AI vs CrewAI", desc: "Compare Valence AI and CrewAI. Valence is a managed enterprise platform with hosted agents. CrewAI is an open-source Python framework for building custom multi-agent systems." },
  { slug: "valence-vs-autogpt", title: "Valence AI vs AutoGPT", desc: "Compare Valence AI and AutoGPT. Valence provides production-ready autonomous agents with enterprise integrations. AutoGPT is an experimental open-source autonomous agent framework." },
  { slug: "valence-vs-perplexity-computer", title: "Valence AI vs Perplexity Computer", desc: "Compare Valence AI and Perplexity Computer. Valence is an enterprise AI workforce platform. Perplexity Computer is an AI-powered browser-based computer use agent for research tasks." },
  { slug: "valence-vs-claude-cowork", title: "Valence AI vs Claude Cowork", desc: "Compare Valence AI and Claude Cowork. Valence is a multi-agent platform for enterprise teams. Claude Cowork is Anthropic's desktop computer use agent for individual knowledge workers." },
  { slug: "valence-vs-microsoft-copilot", title: "Valence AI vs Microsoft Copilot Cowork", desc: "Compare Valence AI and Microsoft Copilot Cowork. Valence is a stack-agnostic autonomous AI workforce. Copilot Cowork is Microsoft's agentic capability layer inside Microsoft 365." },
  { slug: "valence-vs-salesforce-agentforce", title: "Valence AI vs Salesforce Agentforce", desc: "Compare Valence AI and Salesforce Agentforce. Valence is a platform-agnostic AI workforce with 100+ integrations. Agentforce embeds AI agents inside the Salesforce CRM ecosystem." },
  { slug: "valence-vs-langchain", title: "Valence AI vs LangChain / LangGraph", desc: "Compare Valence AI and LangChain. Valence is a managed AI workforce platform ready to deploy. LangChain is an open-source developer framework for building custom agent systems." },
  { slug: "valence-vs-servicenow", title: "Valence AI vs ServiceNow Autonomous Workforce", desc: "Compare Valence AI and ServiceNow. Valence deploys in hours with cross-department coverage. ServiceNow's Autonomous Workforce is enterprise ITSM-focused with months-long implementation." },
  { slug: "valence-vs-sintra", title: "Valence AI vs Sintra AI", desc: "Compare Valence AI and Sintra AI. Valence provides enterprise-grade autonomous multi-agent orchestration. Sintra offers consumer-grade AI employees for small businesses at $97/month." },
  { slug: "valence-vs-11x", title: "Valence AI vs 11x.ai", desc: "Compare Valence AI and 11x.ai. Valence covers full business operations with five specialized agents. 11x offers Alice, a single-purpose AI SDR for outbound sales." },
  { slug: "valence-vs-relevance-ai", title: "Valence AI vs Relevance AI", desc: "Compare Valence AI and Relevance AI. Valence provides truly autonomous multi-agent orchestration. Relevance AI is a low-code GTM agent builder requiring manual workflow design." },
];

// ── Blog metadata ─────────────────────────────────────────────────────────────
let blogPosts = [];
const blogManifestPath = path.join(__dirname, "../content/blog/manifest.json");
if (fs.existsSync(blogManifestPath)) {
  try {
    blogPosts = JSON.parse(fs.readFileSync(blogManifestPath, "utf8"));
  } catch (e) { /* no manifest */ }
}

// ── Static pages ──────────────────────────────────────────────────────────────
const STATIC_PAGES = [
  {
    route: "/landing",
    title: "Valence AI — Best AI Agent Platform | AI Orchestrator & Autonomous AI Workforce",
    desc: "Valence AI is the best AI agent platform and AI orchestrator. Deploy autonomous AI agents as AI employees — five specialized agents handle sales, marketing, operations, finance, and DevOps with 100+ integrations.",
    h1: "Valence AI — The Best AI Agent Platform for Autonomous AI Workforce",
    body: `<p>Valence AI is the leading AI agent platform and AI orchestrator for deploying an autonomous AI workforce. Deploy five specialized AI agents that work as AI employees — researching, building, writing, and monitoring across your entire tech stack. The best AI company for businesses replacing manual work with intelligent automation.</p>
<h2>The Five AI Agents</h2>
<ul>
  <li><strong>Kaze</strong> — The AI orchestrator. Receives missions, decomposes tasks, delegates to specialist agents, and coordinates execution.</li>
  <li><strong>Scout</strong> — The AI researcher. Monitors markets, enriches leads, tracks competitors, and synthesizes intelligence briefs.</li>
  <li><strong>Forge</strong> — The AI builder. Writes production code, manages GitHub repositories, builds automations and integrations.</li>
  <li><strong>Ghost</strong> — The AI writer. Drafts emails, blog posts, LinkedIn content, reports, and customer communications.</li>
  <li><strong>Sentinel</strong> — The AI monitor. Audits every deliverable, flags anomalies, and enforces quality standards before delivery.</li>
</ul>
<h2>100+ Integrations</h2>
<p>Connect your AI workforce to Salesforce, HubSpot, GitHub, Jira, Slack, Google Workspace, Notion, Stripe, Shopify, and 90+ more business tools.</p>
<h2>AI Agent Use Cases</h2>
<p>Sales lead enrichment, marketing content automation, customer success QBRs, financial month-end close, DevOps incident response, legal contract review, and 30+ more use cases.</p>
<h2>Why Valence AI is the Best AI Agent Platform</h2>
<p>Unlike single-agent tools like Lindy or Sintra, developer frameworks like LangChain or CrewAI, or enterprise-locked platforms like Salesforce Agentforce — Valence AI provides a complete autonomous AI workforce with multi-agent orchestration, persistent memory, quality gates, and dedicated infrastructure. Learn more about <a href="${BASE_URL}/glossary/ai-agent">AI agents</a>, <a href="${BASE_URL}/glossary/ai-orchestrator">AI orchestrators</a>, and <a href="${BASE_URL}/glossary/autonomous-ai">autonomous AI</a> in our glossary.</p>
<h2>Compare Valence AI</h2>
<p>See how we compare to <a href="${BASE_URL}/compare/valence-vs-lindy">Lindy AI</a>, <a href="${BASE_URL}/compare/valence-vs-langchain">LangChain</a>, <a href="${BASE_URL}/compare/valence-vs-crewai">CrewAI</a>, <a href="${BASE_URL}/compare/valence-vs-salesforce-agentforce">Salesforce Agentforce</a>, <a href="${BASE_URL}/compare/valence-vs-servicenow">ServiceNow</a>, <a href="${BASE_URL}/compare/valence-vs-zapier">Zapier</a>, and <a href="${BASE_URL}/compare">more alternatives</a>.</p>`,
  },
  {
    route: "/pricing",
    title: "Pricing — Valence AI",
    desc: "Valence AI pricing. Team subscription starting at $2,499/month. Deploy an autonomous AI workforce across unlimited missions and 100+ integrations.",
    h1: "Valence AI Pricing",
    body: `<p>Valence AI offers a team subscription starting at $2,499/month — deploy your autonomous AI workforce with five specialized agents, unlimited missions, and 100+ integrations.</p>`,
  },
  {
    route: "/blog",
    title: "Blog — Valence AI",
    desc: "AI agent insights, autonomous AI guides, and enterprise automation deep-dives from the Valence AI team.",
    h1: "Valence AI Blog",
    body: `<p>Guides, research, and insights on autonomous AI, AI agents, enterprise AI deployment, and AI workforce strategy.</p>`,
  },
  {
    route: "/compare",
    title: "Valence AI vs Competitors — Comparison Guide",
    desc: "Compare Valence AI to Lindy, Zapier, Make, CrewAI, AutoGPT, Perplexity Computer, Claude Cowork, and Microsoft Copilot Cowork.",
    h1: "Valence AI Comparisons",
    body: `<p>See how Valence AI compares to leading AI agent platforms, automation tools, and enterprise AI solutions.</p>`,
  },
  {
    route: "/glossary",
    title: "AI Agent Glossary — Valence AI",
    desc: "Definitions for AI agent terminology: AI agent, autonomous AI, AI workforce, multi-agent orchestration, agentic AI, and more.",
    h1: "AI Agent Glossary",
    body: `<p>Plain-language definitions for autonomous AI, AI agents, multi-agent orchestration, and enterprise AI terminology.</p>`,
  },
  {
    route: "/privacy",
    title: "Privacy Policy — Valence AI",
    desc: "Valence AI privacy policy.",
    h1: "Privacy Policy",
    body: `<p>Read the Valence AI privacy policy at usevalence.ai/privacy.</p>`,
  },
  {
    route: "/terms",
    title: "Terms of Service — Valence AI",
    desc: "Valence AI terms of service.",
    h1: "Terms of Service",
    body: `<p>Read the Valence AI terms of service at usevalence.ai/terms.</p>`,
  },
];

// ── Build all route configs ───────────────────────────────────────────────────
const allRoutes = [
  ...STATIC_PAGES,
  ...USE_CASES.map((uc) => ({
    route: `/use-cases/${uc.slug}`,
    title: `${uc.title} — AI Automation for ${uc.category} | Valence AI`,
    desc: uc.desc,
    h1: uc.title,
    body: `<p>${uc.desc}</p><p>Powered by Valence AI autonomous agents — Kaze orchestrates, Scout researches, Ghost writes, Forge updates your systems, and Sentinel reviews every deliverable.</p><p><a href="${BASE_URL}/landing">Learn more about Valence AI</a></p>`,
  })),
  ...INTEGRATIONS.map((int) => ({
    route: `/integrations/i/${int.slug}`,
    title: `${int.name} Integration — Valence AI`,
    desc: int.desc,
    h1: `Valence AI + ${int.name}`,
    body: `<p>${int.desc}</p><p>Connect ${int.name} to Valence AI's autonomous agent workforce and automate workflows across your entire business stack.</p><p><a href="${BASE_URL}/landing">Learn more about Valence AI</a></p>`,
  })),
  ...COMPARISONS.map((c) => ({
    route: `/compare/${c.slug}`,
    title: `${c.title} | Valence AI`,
    desc: c.desc,
    h1: c.title,
    body: `<p>${c.desc}</p><p><a href="${BASE_URL}/landing">Learn more about Valence AI</a> | <a href="${BASE_URL}/compare">See all comparisons</a></p>`,
  })),
  ...GLOSSARY.map((g) => ({
    route: `/glossary/${g.slug}`,
    title: `${g.term} — Definition | Valence AI Glossary`,
    desc: g.desc,
    h1: g.term,
    body: `<p>${g.desc}</p><p><a href="${BASE_URL}/glossary">Browse the full AI agent glossary</a></p>`,
  })),
  ...blogPosts.map((p) => ({
    route: `/blog/${p.slug}`,
    title: `${p.title} | Valence AI`,
    desc: p.description,
    h1: p.title,
    body: `<p>${p.description}</p><p><a href="${BASE_URL}/blog">Read more on the Valence AI blog</a></p>`,
  })),
];

// ── HTML injection ────────────────────────────────────────────────────────────
function escapeAttr(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildHtml(template, { route, title, desc, h1, body }) {
  const canonical = `${BASE_URL}${route}`;
  const safeTitle = escapeAttr(title);
  const safeDesc = escapeAttr(desc);

  let html = template;

  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);

  // Replace description
  html = html.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${safeDesc}" />`
  );

  // Add/replace canonical
  if (html.includes('<link rel="canonical"')) {
    html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}" />`);
  } else {
    html = html.replace("</head>", `  <link rel="canonical" href="${canonical}" />\n</head>`);
  }

  // Replace OG tags
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${safeTitle}" />`);
  html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${safeDesc}" />`);
  html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}" />`);
  html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${safeTitle}" />`);
  html = html.replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${safeDesc}" />`);

  // Inject rich static content into noscript (what Perplexity/ChatGPT Browse sees)
  const nav = route !== "/landing"
    ? `<a href="${BASE_URL}/landing" style="color:#4f46e5;">Valence AI</a> &rsaquo; ${escapeAttr(h1)}`
    : `<a href="${BASE_URL}/landing" style="color:#4f46e5;">Valence AI</a>`;

  const staticContent = `
      <div style="max-width:800px;margin:60px auto;padding:0 24px;font-family:system-ui,sans-serif;color:#1a202c;line-height:1.6;">
        <nav style="margin-bottom:24px;font-size:14px;color:#718096;">${nav}</nav>
        <h1 style="font-size:2rem;font-weight:700;margin-bottom:16px;color:#1a202c;">${escapeAttr(h1)}</h1>
        ${body}
        <hr style="margin:40px 0;border:none;border-top:1px solid #e2e8f0;" />
        <p style="font-size:13px;color:#718096;">
          <a href="${BASE_URL}/landing" style="color:#4f46e5;">Valence AI</a> &mdash;
          Autonomous AI Workforce Platform &mdash;
          <a href="${BASE_URL}/pricing" style="color:#4f46e5;">Pricing</a> &mdash;
          <a href="${BASE_URL}/blog" style="color:#4f46e5;">Blog</a> &mdash;
          <a href="${BASE_URL}/glossary" style="color:#4f46e5;">Glossary</a> &mdash;
          <a href="${BASE_URL}/compare" style="color:#4f46e5;">Comparisons</a>
        </p>
      </div>`;

  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript>${staticContent}\n    </noscript>`);

  // Also inject content OUTSIDE noscript for AI scrapers that skip <noscript>.
  // Hidden via JS on load (React root takeover hides it), but visible to scrapers
  // that don't execute JS (ChatGPT Browse, Perplexity, etc.)
  const seoContent = `
    <div id="seo-static" style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;">
      ${staticContent}
    </div>
    <script>
      // Remove once React hydrates — prevents duplicate content for users
      window.addEventListener('DOMContentLoaded', function() {
        var el = document.getElementById('seo-static');
        if (el) el.remove();
      });
    </script>`;
  html = html.replace('<div id="root"></div>', `<div id="root"></div>${seoContent}`);

  return html;
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  if (!fs.existsSync(distDir)) {
    console.error("dist/ directory not found. Run vite build first.");
    process.exit(1);
  }

  const templatePath = path.join(distDir, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error("dist/index.html not found.");
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf8");
  console.log(`\n🔧 Injecting static HTML for ${allRoutes.length} routes...\n`);

  let success = 0;
  let failed = 0;

  for (const routeConfig of allRoutes) {
    try {
      const outDir = path.join(distDir, routeConfig.route);
      fs.mkdirSync(outDir, { recursive: true });
      const html = buildHtml(template, routeConfig);
      fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
      success++;
      // Log first 10 and every 25th to show progress without flooding console
      if (success <= 10 || success % 25 === 0) {
        console.log(`  ✅ ${routeConfig.route}`);
      }
    } catch (err) {
      failed++;
      console.log(`  ⚠️  ${routeConfig.route} — ${err.message}`);
    }
  }

  console.log(`\n✅ Static HTML injection complete: ${success} succeeded, ${failed} failed`);
  console.log(`   Each route now has a pre-rendered index.html with correct meta tags.`);
  console.log(`   Crawlers (Perplexity, ChatGPT Browse, Googlebot) will see full HTML content.\n`);
}

main();
