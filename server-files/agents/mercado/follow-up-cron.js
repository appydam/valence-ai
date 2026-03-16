#!/usr/bin/env node

/**
 * Mercado Follow-Up Cron
 *
 * Runs every 6 hours. Reads the Chat Log sheet, finds quotations sent 24-48 hours ago
 * that haven't received a follow-up response, and wakes Mercado to send a gentle follow-up.
 *
 * Usage: node follow-up-cron.js
 * Stop:  kill $(cat /tmp/mercado-followup-cron.pid)
 *
 * Environment:
 *   FOLLOWUP_INTERVAL_MS  - Check interval (default: 21600000 = 6 hours)
 *   WAKEUP_URL            - Wakeup server URL (default: http://localhost:3333/wake)
 *   GWS_BIN               - Path to gws binary (default: /home/ubuntu/.npm-global/bin/gws)
 *   SPREADSHEET_ID        - Google Sheet ID
 *   MIN_HOURS             - Min hours since quote before follow-up (default: 24)
 *   MAX_HOURS             - Max hours since quote for follow-up (default: 48)
 */

const { execSync } = require("child_process");
const http = require("http");
const fs = require("fs");

const FOLLOWUP_INTERVAL_MS = parseInt(process.env.FOLLOWUP_INTERVAL_MS || "21600000", 10); // 6 hours
const WAKEUP_URL = process.env.WAKEUP_URL || "http://localhost:3333/wake";
const GWS_BIN = process.env.GWS_BIN || "/home/ubuntu/.npm-global/bin/gws";
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || "1Rnewit7zPZYBh95d2clbAWFW_UfX-cHPksnwS55xp4o";
const PID_FILE = "/tmp/mercado-followup-cron.pid";
const MIN_HOURS = parseInt(process.env.MIN_HOURS || "24", 10);
const MAX_HOURS = parseInt(process.env.MAX_HOURS || "48", 10);

// Track which quotations we've already triggered follow-ups for
const FOLLOWEDUP_FILE = "/tmp/mercado-followedup-quotes.json";
const followedUp = new Set();

function log(msg) {
  console.log(`[${new Date().toISOString()}] [followup] ${msg}`);
}

function loadFollowedUp() {
  try {
    const data = fs.readFileSync(FOLLOWEDUP_FILE, "utf-8");
    JSON.parse(data).forEach((q) => followedUp.add(q));
    log(`Loaded ${followedUp.size} previously followed-up quotations`);
  } catch {
    // File doesn't exist yet
  }
}

function saveFollowedUp() {
  const items = Array.from(followedUp).slice(-200); // Keep last 200
  fs.writeFileSync(FOLLOWEDUP_FILE, JSON.stringify(items));
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

function readChatLog() {
  const result = gws(
    `sheets spreadsheets values get --params '{"spreadsheetId": "${SPREADSHEET_ID}", "range": "Chat Log!A:L"}'`
  );
  if (!result) return [];

  try {
    const parsed = JSON.parse(result);
    const rows = parsed.values || [];
    if (rows.length <= 1) return []; // Only headers
    return rows.slice(1); // Skip header row
  } catch (e) {
    log(`Failed to parse Chat Log: ${e.message}`);
    return [];
  }
}

function parseTimestamp(ts) {
  // Format: "DD/MM/YYYY HH:MM"
  const match = ts.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, day, month, year, hour, minute] = match;
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
}

function wakeMercado(followUpData) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      agent: "mercado",
      taskId: `followup-${followUpData.quotationNo}`,
      reason: `Follow-up needed. Customer ${followUpData.customerName} (${followUpData.phoneOrEmail}) was sent quotation ${followUpData.quotationNo} on ${followUpData.date} but hasn't responded. Channel: ${followUpData.channel}. Products quoted: ${followUpData.productsQuoted}. Total: INR ${followUpData.total}. Send a gentle follow-up asking if they have questions or would like to proceed.`,
    });

    const url = new URL(WAKEUP_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        log(`Wakeup response for ${followUpData.quotationNo}: ${data}`);
        resolve(true);
      });
    });

    req.on("error", (e) => {
      log(`Wakeup failed: ${e.message}`);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

async function checkFollowUps() {
  log("Checking for quotations needing follow-up...");

  const rows = readChatLog();
  if (rows.length === 0) {
    log("No chat log data");
    return;
  }

  const now = new Date();
  let followUpCount = 0;

  // Build a set of all phone/email contacts who have ANY row newer than their quote
  // (meaning they responded after the quote)
  const contactActivity = {};
  for (const row of rows) {
    const phoneOrEmail = row[1] || "";
    const ts = parseTimestamp(row[0] || "");
    if (!phoneOrEmail || !ts) continue;
    if (!contactActivity[phoneOrEmail] || ts > contactActivity[phoneOrEmail]) {
      contactActivity[phoneOrEmail] = ts;
    }
  }

  for (const row of rows) {
    const timestamp = row[0] || "";
    const phoneOrEmail = row[1] || "";
    const customerName = row[2] || "Customer";
    const company = row[3] || "";
    const outcome = row[10] || "";
    const quotationNo = row[8] || "";
    const productsQuoted = row[7] || "";
    const total = row[9] || "0";

    // Only follow up on quoted outcomes with a quotation number
    if (outcome !== "quoted" || !quotationNo || quotationNo === "N/A") continue;

    // Already followed up?
    if (followedUp.has(quotationNo)) continue;

    const quoteTime = parseTimestamp(timestamp);
    if (!quoteTime) continue;

    const hoursAgo = (now - quoteTime) / (1000 * 60 * 60);

    // Within the follow-up window?
    if (hoursAgo < MIN_HOURS || hoursAgo > MAX_HOURS) continue;

    // Check if the buyer responded AFTER this quote (any newer row from same contact)
    const lastActivity = contactActivity[phoneOrEmail];
    if (lastActivity && lastActivity > quoteTime) {
      // Buyer has been active since the quote — no follow-up needed
      followedUp.add(quotationNo);
      continue;
    }

    // Determine channel
    const channel = phoneOrEmail.includes("@") ? "email" : "whatsapp";

    log(`Follow-up needed: ${quotationNo} for ${customerName} (${phoneOrEmail}), quoted ${hoursAgo.toFixed(1)}h ago`);

    const woken = await wakeMercado({
      quotationNo,
      customerName,
      company,
      phoneOrEmail,
      channel,
      productsQuoted,
      total,
      date: timestamp,
    });

    if (woken) {
      followedUp.add(quotationNo);
      saveFollowedUp();
      followUpCount++;
    }

    // Don't flood — max 3 follow-ups per cycle
    if (followUpCount >= 3) {
      log("Hit follow-up limit (3 per cycle), stopping");
      break;
    }

    // Delay between follow-ups
    await new Promise((r) => setTimeout(r, 3000));
  }

  if (followUpCount === 0) {
    log("No follow-ups needed");
  } else {
    log(`Triggered ${followUpCount} follow-up(s)`);
  }
}

// --- Main ---

fs.writeFileSync(PID_FILE, String(process.pid));
log(`Follow-up cron started (pid: ${process.pid})`);
log(`Check interval: ${FOLLOWUP_INTERVAL_MS / 1000 / 3600}h`);
log(`Follow-up window: ${MIN_HOURS}-${MAX_HOURS} hours after quote`);

loadFollowedUp();

// Initial check
checkFollowUps();

// Recurring check
const interval = setInterval(checkFollowUps, FOLLOWUP_INTERVAL_MS);

// Graceful shutdown
process.on("SIGINT", () => {
  log("Shutting down follow-up cron...");
  clearInterval(interval);
  try { fs.unlinkSync(PID_FILE); } catch {}
  process.exit(0);
});

process.on("SIGTERM", () => {
  log("Shutting down follow-up cron...");
  clearInterval(interval);
  try { fs.unlinkSync(PID_FILE); } catch {}
  process.exit(0);
});
