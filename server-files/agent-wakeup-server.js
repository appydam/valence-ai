#!/usr/bin/env node

/**
 * Agent Wakeup Webhook Server
 *
 * Lightweight HTTP server that runs on the Lightsail instance.
 * Receives POST requests from Convex when a task is assigned to an agent,
 * then starts an OpenClaw session for that agent.
 *
 * Setup:
 *   1. Copy this file to your Lightsail server
 *   2. npm install (no dependencies needed — uses Node.js built-ins)
 *   3. Set environment variables (see below)
 *   4. Run: node agent-wakeup-server.js
 *   5. Or use systemd/pm2 to keep it running
 *
 * Environment Variables:
 *   PORT                    - Server port (default: 3333)
 *   WEBHOOK_SECRET          - HMAC secret for signature verification (optional)
 *   OPENCLAW_BIN            - Path to openclaw binary (default: openclaw)
 *   LOG_DIR                 - Directory for agent logs (default: /tmp)
 */

const http = require("http");
const crypto = require("crypto");
const { execSync, spawn } = require("child_process");

const PORT = parseInt(process.env.PORT || "3333", 10);
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";
const OPENCLAW_BIN = process.env.OPENCLAW_BIN || "openclaw";
const LOG_DIR = process.env.LOG_DIR || "/tmp";

const VALID_AGENTS = new Set(["kaze", "scout", "forge", "ghost"]);

// Track running agents to prevent duplicate starts
const runningAgents = new Set();

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function isAgentRunning(agent) {
  try {
    execSync(`pgrep -f "openclaw run ${agent}"`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function startAgent(agent, taskId, reason) {
  if (runningAgents.has(agent)) {
    log(`${agent} is tracked as running, skipping`);
    return "ALREADY_TRACKED";
  }

  if (isAgentRunning(agent)) {
    log(`${agent} process already running (pgrep), skipping`);
    runningAgents.add(agent);
    return "ALREADY_RUNNING";
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const logFile = `${LOG_DIR}/openclaw-${agent}-${timestamp}.log`;

  log(`Starting ${agent} for task ${taskId} (${reason}) → ${logFile}`);

  const child = spawn(OPENCLAW_BIN, ["run", agent], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, TASK_ID: taskId },
  });

  // Pipe output to log file
  const fs = require("fs");
  const logStream = fs.createWriteStream(logFile, { flags: "a" });
  child.stdout.pipe(logStream);
  child.stderr.pipe(logStream);

  runningAgents.add(agent);

  child.on("exit", (code) => {
    log(`${agent} exited with code ${code}`);
    runningAgents.delete(agent);
    logStream.end();
  });

  child.unref();

  return `STARTED (pid: ${child.pid}, log: ${logFile})`;
}

function verifySignature(body, signature) {
  if (!WEBHOOK_SECRET) return true; // No secret = no verification
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

const server = http.createServer((req, res) => {
  // Health check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "ok",
      runningAgents: Array.from(runningAgents),
      uptime: process.uptime(),
    }));
    return;
  }

  // Agent status
  if (req.method === "GET" && req.url === "/status") {
    const status = {};
    for (const agent of VALID_AGENTS) {
      status[agent] = {
        tracked: runningAgents.has(agent),
        processRunning: isAgentRunning(agent),
      };
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(status));
    return;
  }

  // Only accept POST to /wake
  if (req.method !== "POST" || req.url !== "/wake") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found. Use POST /wake" }));
    return;
  }

  let body = "";
  req.on("data", (chunk) => { body += chunk; });
  req.on("end", () => {
    // Verify signature
    const signature = req.headers["x-webhook-signature"];
    if (!verifySignature(body, signature)) {
      log("Invalid webhook signature");
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid signature" }));
      return;
    }

    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }

    const { agent, taskId, reason } = payload;

    if (!agent || !VALID_AGENTS.has(agent)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: `Invalid agent: ${agent}` }));
      return;
    }

    const result = startAgent(agent, taskId || "unknown", reason || "webhook");

    log(`${agent}: ${result}`);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, agent, result }));
  });
});

server.listen(PORT, () => {
  log(`Agent Wakeup Server listening on port ${PORT}`);
  log(`Webhook endpoint: POST http://localhost:${PORT}/wake`);
  log(`Health check:     GET  http://localhost:${PORT}/health`);
  log(`Agent status:     GET  http://localhost:${PORT}/status`);
  if (WEBHOOK_SECRET) {
    log(`Signature verification: ENABLED`);
  } else {
    log(`Signature verification: DISABLED (set WEBHOOK_SECRET to enable)`);
  }
});
