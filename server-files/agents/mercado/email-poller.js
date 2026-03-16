#!/usr/bin/env node

/**
 * Mercado Email Poller
 *
 * Polls Gmail every 2 minutes for new unread buyer emails.
 * When found, wakes Mercado agent with the email context.
 * Marks processed emails with a "mercado-processed" label to avoid re-processing.
 *
 * Usage: node email-poller.js
 * Stop:  kill $(cat /tmp/mercado-email-poller.pid)
 *
 * Environment:
 *   POLL_INTERVAL_MS  - Polling interval (default: 120000 = 2 minutes)
 *   WAKEUP_URL        - Wakeup server URL (default: http://localhost:3333/wake)
 *   GWS_BIN           - Path to gws binary (default: /home/ubuntu/.npm-global/bin/gws)
 *   GMAIL_QUERY       - Gmail search query (default: is:unread label:inbox -category:promotions -category:social -category:updates -category:forums)
 */

const { execSync } = require("child_process");
const http = require("http");
const fs = require("fs");

const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || "120000", 10);
const WAKEUP_URL = process.env.WAKEUP_URL || "http://localhost:3333/wake";
const GWS_BIN = process.env.GWS_BIN || "/home/ubuntu/.npm-global/bin/gws";
const PID_FILE = "/tmp/mercado-email-poller.pid";

// For TESTING: Process emails with "mercado" label (auto-applied by Gmail filter for +sales alias)
// For PRODUCTION: Use a dedicated inbox (sales@racknsell.com) and change this to "is:unread".
const GMAIL_QUERY = process.env.GMAIL_QUERY || "is:unread label:mercado";

// Track processed message IDs in memory (backup: label-based on Gmail side)
const processedIds = new Set();
// Also persist to disk so restarts don't re-process
const PROCESSED_FILE = "/tmp/mercado-processed-emails.json";

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function loadProcessedIds() {
  try {
    const data = fs.readFileSync(PROCESSED_FILE, "utf-8");
    const ids = JSON.parse(data);
    ids.forEach((id) => processedIds.add(id));
    log(`Loaded ${ids.length} previously processed email IDs`);
  } catch {
    // File doesn't exist yet, that's fine
  }
}

function saveProcessedIds() {
  const ids = Array.from(processedIds);
  // Only keep last 500 IDs to prevent unbounded growth
  const trimmed = ids.slice(-500);
  fs.writeFileSync(PROCESSED_FILE, JSON.stringify(trimmed));
}

function gws(args) {
  const cmd = `${GWS_BIN} ${args}`;
  try {
    const output = execSync(cmd, { encoding: "utf-8", timeout: 30000 });
    return output.trim();
  } catch (e) {
    log(`gws command failed: ${cmd}`);
    log(`Error: ${e.message}`);
    return null;
  }
}

function listUnreadEmails() {
  const result = gws(
    `gmail users messages list --params '{"userId": "me", "q": "${GMAIL_QUERY}", "maxResults": 5}'`
  );
  if (!result) return [];

  try {
    const parsed = JSON.parse(result);
    return parsed.messages || [];
  } catch {
    log(`Failed to parse message list: ${result.substring(0, 200)}`);
    return [];
  }
}

function getEmailDetails(messageId) {
  const result = gws(
    `gmail users messages get --params '{"userId": "me", "id": "${messageId}", "format": "full"}'`
  );
  if (!result) return null;

  try {
    const msg = JSON.parse(result);
    const headers = {};

    // Extract headers from payload
    if (msg.payload && msg.payload.headers) {
      for (const h of msg.payload.headers) {
        headers[h.name.toLowerCase()] = h.value;
      }
    }

    // Extract plain text body
    let body = "";
    if (msg.payload) {
      body = extractTextBody(msg.payload);
    }

    // Fallback to snippet if no body extracted
    if (!body && msg.snippet) {
      body = msg.snippet;
    }

    return {
      id: msg.id,
      threadId: msg.threadId,
      from: headers.from || "",
      to: headers.to || "",
      subject: headers.subject || "(no subject)",
      date: headers.date || "",
      body: body.substring(0, 2000), // Cap at 2000 chars to avoid oversized wakeup messages
      snippet: msg.snippet || "",
    };
  } catch (e) {
    log(`Failed to parse email ${messageId}: ${e.message}`);
    return null;
  }
}

function extractTextBody(payload) {
  // Direct text/plain body
  if (payload.mimeType === "text/plain" && payload.body && payload.body.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }

  // Multipart — recurse into parts looking for text/plain
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body && part.body.data) {
        return Buffer.from(part.body.data, "base64").toString("utf-8");
      }
      // Nested multipart
      if (part.parts) {
        const nested = extractTextBody(part);
        if (nested) return nested;
      }
    }
  }

  return "";
}

function markAsRead(messageId) {
  const result = gws(
    `gmail users messages modify --params '{"userId": "me", "id": "${messageId}"}' --json '{"removeLabelIds": ["UNREAD"]}'`
  );
  if (result) {
    log(`Marked ${messageId} as read`);
  }
}

function wakeMercado(email) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      agent: "mercado",
      taskId: `email-${email.id}`,
      reason: `New buyer email from ${email.from}. Subject: ${email.subject}. Channel: email. Message-ID: ${email.id}. Thread-ID: ${email.threadId}. Reply-To: ${email.from}. Body: ${email.body}`,
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
        log(`Wakeup response for ${email.id}: ${data}`);
        resolve(true);
      });
    });

    req.on("error", (e) => {
      log(`Wakeup request failed: ${e.message}`);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

function extractSenderEmail(fromHeader) {
  // "Rajesh Kumar <rajesh@example.com>" → "rajesh@example.com"
  const match = fromHeader.match(/<([^>]+)>/);
  return match ? match[1] : fromHeader;
}

async function poll() {
  log("Polling for new emails...");

  const messages = listUnreadEmails();
  if (messages.length === 0) {
    log("No new unread emails");
    return;
  }

  log(`Found ${messages.length} unread email(s)`);

  for (const msg of messages) {
    if (processedIds.has(msg.id)) {
      log(`Skipping already-processed email ${msg.id}`);
      continue;
    }

    const email = getEmailDetails(msg.id);
    if (!email) {
      log(`Could not read email ${msg.id}, skipping`);
      continue;
    }

    log(`Processing email from: ${email.from} | Subject: ${email.subject}`);

    // Wake Mercado with the email context
    const woken = await wakeMercado(email);

    if (woken) {
      // Mark as read so we don't process it again
      markAsRead(msg.id);
      processedIds.add(msg.id);
      saveProcessedIds();
      log(`Email ${msg.id} handed off to Mercado`);
    }

    // Small delay between emails to avoid overwhelming the agent
    await new Promise((r) => setTimeout(r, 2000));
  }
}

// --- Main ---

// Write PID file for easy stopping
fs.writeFileSync(PID_FILE, String(process.pid));
log(`Email poller started (pid: ${process.pid})`);
log(`Poll interval: ${POLL_INTERVAL_MS / 1000}s`);
log(`Gmail query: ${GMAIL_QUERY}`);
log(`Wakeup URL: ${WAKEUP_URL}`);
log(`PID file: ${PID_FILE}`);

loadProcessedIds();

// Initial poll
poll();

// Recurring poll
const interval = setInterval(poll, POLL_INTERVAL_MS);

// Graceful shutdown
process.on("SIGINT", () => {
  log("Shutting down email poller...");
  clearInterval(interval);
  try { fs.unlinkSync(PID_FILE); } catch {}
  process.exit(0);
});

process.on("SIGTERM", () => {
  log("Shutting down email poller...");
  clearInterval(interval);
  try { fs.unlinkSync(PID_FILE); } catch {}
  process.exit(0);
});
