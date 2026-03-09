#!/usr/bin/env node
/**
 * Sitemap generator for usevalence.ai
 * Runs as part of the build:vercel script after vite build.
 * Outputs dist/sitemap.xml
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../dist");
const BASE_URL = "https://usevalence.ai";

// ── Static public routes ──────────────────────────────────────────────────────
const staticRoutes = [
  { url: "/landing", priority: "1.0", changefreq: "weekly" },
  { url: "/pricing", priority: "0.9", changefreq: "monthly" },
  { url: "/blog", priority: "0.9", changefreq: "daily" },
  { url: "/compare", priority: "0.8", changefreq: "weekly" },
  { url: "/glossary", priority: "0.7", changefreq: "monthly" },
];

// ── Use case slugs ────────────────────────────────────────────────────────────
const useCaseSlugs = [
  "case-study-pipeline",
  "competitive-intel-radar",
  "competitor-price-response",
  "client-reporting-autopilot",
  "month-end-close-prep",
  "incident-response-autopilot",
  "regulatory-change-tracker",
  "win-back-dead-deals",
  "seo-content-engine",
  "upsell-signal-detection",
  "vendor-renewal-autopilot",
  "meeting-to-action-autopilot",
  "performance-review-autopilot",
  "inventory-restock-forecasting",
  "review-ugc-harvester",
  "client-audit-strategy",
  "expense-anomaly-detection",
  "release-notes-autopilot",
  "contract-review-risk-flagging",
  "sales-lead-enrichment-outbound",
  "sales-crm-hygiene",
  "cs-qbr-health-automation",
  "cs-onboarding-orchestration",
  "marketing-cross-channel-reporting",
  "content-repurpose-distribute",
  "support-ticket-intelligence",
  "revops-pipeline-hygiene",
  "finance-month-end-close",
  "ops-data-sync-reporting",
  "flash-sale-launch-autopilot",
  "agency-client-performance-narrative",
  "dead-pipeline-revival-sprint",
];

// ── Integration slugs ─────────────────────────────────────────────────────────
const integrationSlugs = [
  "salesforce", "hubspot", "dynamics365-sales", "pipedrive", "zoho-crm", "close",
  "zendesk-sell", "insightly", "copper", "keap", "freshsales",
  "google-drive", "dropbox", "sharepoint", "box", "onedrive", "notion", "onenote",
  "confluence", "google-docs", "coda", "quip",
  "slack", "microsoft-teams", "zoom", "whatsapp",
  "emarsys", "outreach", "gong", "salesloft", "apollo", "mindtickle",
  "lagrowthmachine", "clay", "instantly", "smartlead",
  "jira", "asana", "trello", "monday", "azure-devops", "clickup", "linear",
  "github", "vercel", "productboard", "hive", "shortcut", "todoist", "airtable",
  "gmail", "outlook", "sendgrid", "mailchimp", "klaviyo",
  "google-analytics", "google-ads", "meta-ads", "linkedin-ads",
  "google-calendar", "calendly",
  "stripe", "shopify", "woocommerce", "bigcommerce",
  "twitter", "linkedin", "instagram", "youtube",
  "zapier", "make",
  "sentry", "datadog", "pagerduty",
  "tableau", "looker", "powerbi",
  "servicenow", "freshdesk", "zendesk",
  "bamboohr", "workday", "rippling",
  "quickbooks", "xero",
  "figma", "webflow",
  "twilio", "intercom",
  "google-search-console", "semrush", "ahrefs",
  "hubspot-marketing", "marketo", "pardot",
  "docusign", "hellosign",
  "razorpay", "braintree",
  "anthropic", "openai",
  "aws", "gcp", "azure",
  "postgresql", "mysql", "mongodb", "redis",
];

// ── Comparison page slugs ─────────────────────────────────────────────────────
const comparisonSlugs = [
  "valence-vs-lindy",
  "valence-vs-zapier",
  "valence-vs-make",
  "valence-vs-crewai",
  "valence-vs-autogpt",
  "valence-vs-perplexity-computer",
  "valence-vs-claude-cowork",
  "valence-vs-microsoft-copilot",
];

// ── Glossary slugs ────────────────────────────────────────────────────────────
const glossarySlugs = [
  "ai-agent",
  "autonomous-ai",
  "ai-workforce",
  "multi-agent-orchestration",
  "ai-employee",
  "ai-worker",
  "agentic-ai",
  "agent-memory",
  "quality-gates",
  "task-decomposition",
  "ai-integration",
  "webhook-triggers",
  "ai-orchestrator",
  "human-in-the-loop",
  "enterprise-ai",
];

// ── Blog post slugs (populated as posts are created) ──────────────────────────
let blogSlugs = [];
const blogManifestPath = path.join(__dirname, "../content/blog/manifest.json");
if (fs.existsSync(blogManifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(blogManifestPath, "utf8"));
    blogSlugs = manifest.map((p) => p.slug);
  } catch (e) {
    console.warn("Could not read blog manifest:", e.message);
  }
}

// ── Build URL entries ─────────────────────────────────────────────────────────
const today = new Date().toISOString().split("T")[0];

const allUrls = [
  ...staticRoutes.map((r) => ({ ...r, lastmod: today })),
  ...useCaseSlugs.map((s) => ({
    url: `/use-cases/${s}`,
    priority: "0.8",
    changefreq: "monthly",
    lastmod: today,
  })),
  ...blogSlugs.map((s) => ({
    url: `/blog/${s}`,
    priority: "0.7",
    changefreq: "monthly",
    lastmod: today,
  })),
  ...comparisonSlugs.map((s) => ({
    url: `/compare/${s}`,
    priority: "0.7",
    changefreq: "monthly",
    lastmod: today,
  })),
  ...integrationSlugs.map((s) => ({
    url: `/integrations/i/${s}`,
    priority: "0.6",
    changefreq: "monthly",
    lastmod: today,
  })),
  ...glossarySlugs.map((s) => ({
    url: `/glossary/${s}`,
    priority: "0.5",
    changefreq: "yearly",
    lastmod: today,
  })),
  { url: "/privacy", priority: "0.2", changefreq: "yearly", lastmod: "2026-03-02" },
  { url: "/terms", priority: "0.2", changefreq: "yearly", lastmod: "2026-03-02" },
];

// ── Generate XML ──────────────────────────────────────────────────────────────
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls
  .map(
    (entry) => `  <url>
    <loc>${BASE_URL}${entry.url}</loc>
    <lastmod>${entry.lastmod || today}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(path.join(distDir, "sitemap.xml"), xml, "utf8");
console.log(`✅ sitemap.xml generated with ${allUrls.length} URLs → dist/sitemap.xml`);
