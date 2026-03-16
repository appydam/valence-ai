#!/usr/bin/env node

/**
 * Mercado Analytics Generator
 *
 * Reads Chat Log and Orders_Confirmed from Google Sheets,
 * computes analytics, and writes a JSON file that analytics.html consumes.
 *
 * Usage:
 *   node analytics.js                    # Generate analytics JSON
 *   node analytics.js --serve [port]     # Generate + serve HTML on port (default: 8080)
 *
 * Environment:
 *   GWS_BIN        - Path to gws binary (default: /home/ubuntu/.npm-global/bin/gws)
 *   SPREADSHEET_ID - Google Sheet ID
 */

const { execSync } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");

const GWS_BIN = process.env.GWS_BIN || "/home/ubuntu/.npm-global/bin/gws";
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || "1Rnewit7zPZYBh95d2clbAWFW_UfX-cHPksnwS55xp4o";
const OUTPUT_FILE = path.join(__dirname, "analytics-data.json");

function log(msg) {
  console.log(`[analytics] ${msg}`);
}

function gws(args) {
  const cmd = `${GWS_BIN} ${args}`;
  try {
    return execSync(cmd, { encoding: "utf-8", timeout: 30000 }).trim();
  } catch (e) {
    log(`gws failed: ${e.message}`);
    return null;
  }
}

function readSheet(range) {
  const result = gws(
    `sheets spreadsheets values get --params '{"spreadsheetId": "${SPREADSHEET_ID}", "range": "${range}"}'`
  );
  if (!result) return [];
  try {
    const parsed = JSON.parse(result);
    const rows = parsed.values || [];
    return rows.length > 1 ? rows.slice(1) : [];
  } catch {
    return [];
  }
}

function parseTimestamp(ts) {
  const match = (ts || "").match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, day, month, year, hour, minute] = match;
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
}

function generateAnalytics() {
  log("Reading Chat Log...");
  const chatRows = readSheet("Chat Log!A:L");
  log(`Got ${chatRows.length} chat log rows`);

  log("Reading Orders_Confirmed...");
  const orderRows = readSheet("Orders_Confirmed!A:K");
  log(`Got ${orderRows.length} confirmed orders`);

  const now = new Date();
  const analytics = {
    generatedAt: now.toISOString(),
    summary: {},
    dailyVolume: {},
    outcomeBreakdown: {},
    channelSplit: {},
    topProducts: {},
    topCustomers: {},
    hourlyDistribution: {},
    conversionFunnel: {},
    recentActivity: [],
  };

  // --- Summary stats ---
  const totalInquiries = chatRows.length;
  const quotedRows = chatRows.filter((r) => r[10] === "quoted");
  const confirmedRows = chatRows.filter((r) => r[10] === "order_confirmed");
  const totalRevenue = orderRows.reduce((sum, r) => sum + parseFloat(r[8] || 0), 0);
  const uniqueCustomers = new Set(chatRows.map((r) => r[1]).filter(Boolean));
  const repeatCustomers = new Set();
  const customerCounts = {};
  chatRows.forEach((r) => {
    const c = r[1];
    if (c) {
      customerCounts[c] = (customerCounts[c] || 0) + 1;
      if (customerCounts[c] > 1) repeatCustomers.add(c);
    }
  });

  // Last 7 days
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const last7Days = chatRows.filter((r) => {
    const ts = parseTimestamp(r[0]);
    return ts && ts >= sevenDaysAgo;
  });

  analytics.summary = {
    totalInquiries,
    totalQuoted: quotedRows.length,
    totalConfirmed: confirmedRows.length + orderRows.length,
    totalRevenue: Math.round(totalRevenue),
    uniqueCustomers: uniqueCustomers.size,
    repeatCustomers: repeatCustomers.size,
    repeatRate: uniqueCustomers.size > 0
      ? Math.round((repeatCustomers.size / uniqueCustomers.size) * 100)
      : 0,
    conversionRate: quotedRows.length > 0
      ? Math.round(((confirmedRows.length + orderRows.length) / quotedRows.length) * 100)
      : 0,
    last7DaysInquiries: last7Days.length,
    avgDailyInquiries: last7Days.length > 0 ? Math.round((last7Days.length / 7) * 10) / 10 : 0,
  };

  // --- Daily volume (last 30 days) ---
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  chatRows.forEach((r) => {
    const ts = parseTimestamp(r[0]);
    if (!ts || ts < thirtyDaysAgo) return;
    const day = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, "0")}-${String(ts.getDate()).padStart(2, "0")}`;
    analytics.dailyVolume[day] = (analytics.dailyVolume[day] || 0) + 1;
  });

  // --- Outcome breakdown ---
  chatRows.forEach((r) => {
    const outcome = r[10] || "unknown";
    analytics.outcomeBreakdown[outcome] = (analytics.outcomeBreakdown[outcome] || 0) + 1;
  });

  // --- Channel split ---
  chatRows.forEach((r) => {
    const contact = r[1] || "";
    const channel = contact.includes("@") ? "Email" : "WhatsApp";
    analytics.channelSplit[channel] = (analytics.channelSplit[channel] || 0) + 1;
  });

  // --- Top products ---
  const productCounts = {};
  chatRows.forEach((r) => {
    const products = r[7] || "";
    if (!products) return;
    // Parse "RS001 x 50, RS002 x 100" format
    products.split(",").forEach((p) => {
      const trimmed = p.trim();
      const match = trimmed.match(/^(\S+)\s*x\s*(\d+)/);
      if (match) {
        const sku = match[1];
        const qty = parseInt(match[2], 10);
        productCounts[sku] = (productCounts[sku] || 0) + qty;
      } else if (trimmed) {
        productCounts[trimmed] = (productCounts[trimmed] || 0) + 1;
      }
    });
  });
  analytics.topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .reduce((obj, [k, v]) => { obj[k] = v; return obj; }, {});

  // --- Top customers by inquiry count ---
  const custInquiries = {};
  chatRows.forEach((r) => {
    const name = r[2] || r[1] || "Unknown";
    const contact = r[1] || "";
    const key = `${name} (${contact})`;
    custInquiries[key] = (custInquiries[key] || 0) + 1;
  });
  analytics.topCustomers = Object.entries(custInquiries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .reduce((obj, [k, v]) => { obj[k] = v; return obj; }, {});

  // --- Hourly distribution ---
  for (let h = 0; h < 24; h++) {
    analytics.hourlyDistribution[h] = 0;
  }
  chatRows.forEach((r) => {
    const ts = parseTimestamp(r[0]);
    if (ts) {
      analytics.hourlyDistribution[ts.getHours()] += 1;
    }
  });

  // --- Conversion funnel ---
  analytics.conversionFunnel = {
    inquiries: totalInquiries,
    quoted: quotedRows.length,
    confirmed: confirmedRows.length + orderRows.length,
    pricingPending: chatRows.filter((r) => r[10] === "pricing_pending").length,
    notFound: chatRows.filter((r) => r[10] === "not_found").length,
  };

  // --- Recent activity (last 10) ---
  analytics.recentActivity = chatRows
    .slice(-10)
    .reverse()
    .map((r) => ({
      timestamp: r[0] || "",
      contact: r[1] || "",
      customer: r[2] || "",
      summary: r[6] || "",
      outcome: r[10] || "",
      total: r[9] || "0",
    }));

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(analytics, null, 2));
  log(`Analytics written to ${OUTPUT_FILE}`);

  return analytics;
}

// --- Main ---

const args = process.argv.slice(2);
const shouldServe = args.includes("--serve");
const port = parseInt(args[args.indexOf("--serve") + 1] || "8080", 10);

const analytics = generateAnalytics();

if (shouldServe) {
  const htmlPath = path.join(__dirname, "analytics.html");

  const server = http.createServer((req, res) => {
    if (req.url === "/data.json") {
      // Regenerate on each request
      const fresh = generateAnalytics();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(fresh));
    } else {
      // Serve HTML
      try {
        const html = fs.readFileSync(htmlPath, "utf-8");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      } catch {
        res.writeHead(404);
        res.end("analytics.html not found");
      }
    }
  });

  server.listen(port, () => {
    log(`Dashboard server running at http://localhost:${port}`);
    log(`Data endpoint: http://localhost:${port}/data.json`);
  });
} else {
  console.log(JSON.stringify(analytics, null, 2));
}
