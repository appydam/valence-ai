#!/usr/bin/env node
/**
 * Build-time pre-renderer for usevalence.ai
 *
 * Problem: The app is a Vite SPA. Crawlers that don't execute JavaScript
 * (Perplexity, ChatGPT browse, some Googlebot passes) only see an empty
 * <div id="root">. This script renders each public route in a headless
 * browser after the build and saves the fully-rendered HTML to
 * dist/<route>/index.html so crawlers get the complete page.
 *
 * Usage: node scripts/prerender.mjs
 * Runs after: vite build
 * Requires: dist/ to exist, puppeteer installed
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { createReadStream } from "fs";
import { lookup } from "node:dns/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../dist");
const PORT = 5188; // Arbitrary port for local static server

// ── Routes to pre-render ──────────────────────────────────────────────────────
const USE_CASE_SLUGS = [
  "case-study-pipeline", "competitive-intel-radar", "competitor-price-response",
  "client-reporting-autopilot", "month-end-close-prep", "incident-response-autopilot",
  "regulatory-change-tracker", "win-back-dead-deals", "seo-content-engine",
  "upsell-signal-detection", "vendor-renewal-autopilot", "meeting-to-action-autopilot",
  "performance-review-autopilot", "inventory-restock-forecasting", "review-ugc-harvester",
  "client-audit-strategy", "expense-anomaly-detection", "release-notes-autopilot",
  "contract-review-risk-flagging", "sales-lead-enrichment-outbound", "sales-crm-hygiene",
  "cs-qbr-health-automation", "cs-onboarding-orchestration", "marketing-cross-channel-reporting",
  "content-repurpose-distribute", "support-ticket-intelligence", "revops-pipeline-hygiene",
  "finance-month-end-close", "ops-data-sync-reporting", "flash-sale-launch-autopilot",
  "agency-client-performance-narrative", "dead-pipeline-revival-sprint",
];

const COMPARISON_SLUGS = [
  "valence-vs-lindy", "valence-vs-zapier", "valence-vs-make",
  "valence-vs-crewai", "valence-vs-autogpt", "valence-vs-perplexity-computer",
  "valence-vs-claude-cowork", "valence-vs-microsoft-copilot",
];

const GLOSSARY_SLUGS = [
  "ai-agent", "autonomous-ai", "ai-workforce", "multi-agent-orchestration",
  "ai-employee", "ai-worker", "agentic-ai", "agent-memory", "quality-gates",
  "task-decomposition", "ai-integration", "webhook-triggers", "ai-orchestrator",
  "human-in-the-loop", "enterprise-ai",
];

// Read blog slugs from manifest if it exists
let blogSlugs = [];
const blogManifestPath = path.join(__dirname, "../content/blog/manifest.json");
if (fs.existsSync(blogManifestPath)) {
  try {
    blogSlugs = JSON.parse(fs.readFileSync(blogManifestPath, "utf8")).map((p) => p.slug);
  } catch (e) { /* no manifest yet */ }
}

// Integration slugs — top 50 most valuable for pre-rendering
const TOP_INTEGRATION_SLUGS = [
  "salesforce", "hubspot", "slack", "github", "notion", "google-sheets",
  "gmail", "jira", "google-analytics", "google-calendar", "stripe", "shopify",
  "linkedin", "twitter", "zapier", "make", "monday", "asana", "trello",
  "clickup", "linear", "airtable", "figma", "webflow", "intercom",
  "zendesk", "freshdesk", "mailchimp", "klaviyo", "sendgrid",
  "google-drive", "dropbox", "onedrive", "confluence", "notion",
  "pipedrive", "zoho-crm", "close", "apollo", "outreach",
  "tableau", "looker", "powerbi", "datadog", "sentry",
  "twilio", "docusign", "quickbooks", "xero", "razorpay",
];

const routes = [
  "/landing",
  "/pricing",
  "/privacy",
  "/terms",
  "/blog",
  "/compare",
  "/glossary",
  ...USE_CASE_SLUGS.map((s) => `/use-cases/${s}`),
  ...COMPARISON_SLUGS.map((s) => `/compare/${s}`),
  ...GLOSSARY_SLUGS.map((s) => `/glossary/${s}`),
  ...blogSlugs.map((s) => `/blog/${s}`),
  ...TOP_INTEGRATION_SLUGS.map((s) => `/integrations/i/${s}`),
];

// ── Simple static file server ─────────────────────────────────────────────────
function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let filePath = path.join(distDir, req.url === "/" ? "/index.html" : req.url);

      // Strip query strings
      filePath = filePath.split("?")[0];

      // If directory or no extension, serve index.html (SPA fallback)
      if (!path.extname(filePath) || fs.existsSync(filePath) === false) {
        const dirIndex = path.join(filePath, "index.html");
        if (fs.existsSync(dirIndex)) {
          filePath = dirIndex;
        } else {
          filePath = path.join(distDir, "index.html");
        }
      }

      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        ".html": "text/html; charset=utf-8",
        ".js": "application/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".ico": "image/x-icon",
        ".json": "application/json",
      };

      res.writeHead(200, { "Content-Type": contentTypes[ext] || "application/octet-stream" });
      createReadStream(filePath).pipe(res);
    });

    server.listen(PORT, () => resolve(server));
  });
}

// ── Pre-render a single route ─────────────────────────────────────────────────
async function renderRoute(browser, route) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Suppress console noise
  page.on("console", () => {});
  page.on("pageerror", () => {});

  try {
    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for React to render content
    await page.waitForSelector("#root > *", { timeout: 10000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));

    const html = await page.content();

    // Save to dist/<route>/index.html
    const outDir = path.join(distDir, route === "/" ? "" : route);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");

    return { route, success: true };
  } catch (err) {
    return { route, success: false, error: err.message };
  } finally {
    await page.close();
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🕷️  Pre-rendering ${routes.length} routes...\n`);

  const server = await startServer();

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const results = { success: 0, failed: 0 };

  // Process in batches of 5 to avoid overwhelming the server
  const batchSize = 5;
  for (let i = 0; i < routes.length; i += batchSize) {
    const batch = routes.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((r) => renderRoute(browser, r)));

    batchResults.forEach((r) => {
      if (r.success) {
        results.success++;
        console.log(`  ✅ ${r.route}`);
      } else {
        results.failed++;
        console.log(`  ⚠️  ${r.route} — ${r.error}`);
      }
    });
  }

  await browser.close();
  server.close();

  console.log(`\n✅ Pre-rendering complete: ${results.success} succeeded, ${results.failed} failed\n`);

  if (results.failed > 0) {
    console.log("ℹ️  Failed routes will still work as SPA fallback — crawlers will see the pre-rendered HTML for successful routes.");
  }
}

main().catch((err) => {
  console.error("Pre-render failed:", err);
  process.exit(1);
});
