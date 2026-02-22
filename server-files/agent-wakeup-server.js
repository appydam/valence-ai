#!/usr/bin/env node

/**
 * Agent Wakeup Webhook Server (v3 — with mutex, cooldown, and reliable process detection)
 *
 * Receives POST requests from Convex when a task is assigned to an agent,
 * then starts an OpenClaw session for that agent.
 *
 * v3 improvements over v2:
 *   - Per-agent mutex: prevents race condition where two /wake calls both spawn
 *   - Spawn cooldown: stale tracker won't touch an agent within 30s of last spawn
 *   - Better pgrep: matches openclaw, openclaw-agent, and the agent flag
 *   - Stale tracker interval increased to 30s (was 15s)
 *
 * Environment Variables:
 *   PORT            - Server port (default: 3333)
 *   WEBHOOK_SECRET  - HMAC secret for signature verification (optional)
 *   OPENCLAW_BIN    - Path to openclaw binary (default: /home/ubuntu/.npm-global/bin/openclaw)
 *   LOG_DIR         - Directory for agent logs (default: /tmp)
 *   QUEUE_DIR       - Directory for task queue files (default: /tmp)
 */

const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

const PORT = parseInt(process.env.PORT || "3333", 10);
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";
const OPENCLAW_BIN = process.env.OPENCLAW_BIN || "/home/ubuntu/.npm-global/bin/openclaw";
const LOG_DIR = process.env.LOG_DIR || "/tmp";
const QUEUE_DIR = process.env.QUEUE_DIR || "/tmp";

const VALID_AGENTS = new Set(["kaze", "scout", "forge", "ghost"]);

// Track running agents to prevent duplicate starts
const runningAgents = new Set();

// Per-agent mutex: prevents two /wake calls from racing
const agentLocks = new Map(); // agent -> Promise

// Cooldown: track last spawn time per agent so stale tracker doesn't interfere
const lastSpawnTime = new Map(); // agent -> timestamp

const SPAWN_COOLDOWN_MS = 30_000; // 30 seconds
const STALE_CHECK_INTERVAL_MS = 30_000; // 30 seconds

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// --- Task Queue ---

function queueFilePath(agent) {
  return path.join(QUEUE_DIR, `${agent}-queue.json`);
}

function readQueue(agent) {
  const filePath = queueFilePath(agent);
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeQueue(agent, queue) {
  const filePath = queueFilePath(agent);
  fs.writeFileSync(filePath, JSON.stringify(queue, null, 2));
}

function enqueueTask(agent, taskId, reason) {
  const queue = readQueue(agent);
  // Don't duplicate the same taskId
  if (queue.some((item) => item.taskId === taskId)) {
    log(`${agent}: task ${taskId} already in queue, skipping duplicate`);
    return "ALREADY_QUEUED";
  }
  queue.push({ taskId, reason, queuedAt: new Date().toISOString() });
  writeQueue(agent, queue);
  log(`${agent}: queued task ${taskId} (${reason}) — ${queue.length} task(s) in queue`);
  return `QUEUED (position: ${queue.length})`;
}

function dequeueAll(agent) {
  const queue = readQueue(agent);
  if (queue.length === 0) return null;
  writeQueue(agent, []);
  return queue;
}

// --- Agent Process Management ---

function isAgentRunning(agent) {
  try {
    // Match any openclaw process for this specific agent:
    //   openclaw agent --agent kaze
    //   openclaw-agent --agent kaze
    //   openclaw run kaze
    // The [o] trick prevents pgrep from matching itself
    execSync(
      `pgrep -f "[o]penclaw.*--agent ${agent}" || pgrep -f "[o]penclaw.*run ${agent}"`,
      { stdio: "ignore", timeout: 3000 }
    );
    return true;
  } catch {
    return false;
  }
}

function spawnAgent(agent, taskId, reason) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const logFile = `${LOG_DIR}/openclaw-${agent}-${timestamp}.log`;

  const message = `You have been woken up because: ${reason}. Task ID: ${taskId}. Send heartbeat immediately and work on your assigned tasks.`;

  log(`Starting ${agent} for task ${taskId} (${reason}) → ${logFile}`);

  const child = spawn(OPENCLAW_BIN, ["agent", "--agent", agent, "--message", message, "--local"], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, TASK_ID: taskId },
  });

  const logStream = fs.createWriteStream(logFile, { flags: "a" });
  child.stdout.pipe(logStream);
  child.stderr.pipe(logStream);

  // Mark as running IMMEDIATELY (before any async gap)
  runningAgents.add(agent);
  lastSpawnTime.set(agent, Date.now());

  child.on("exit", (code) => {
    log(`${agent} exited with code ${code}`);
    runningAgents.delete(agent);
    logStream.end();

    // Check queue — if tasks were queued while this session ran, start a new one
    processQueue(agent);
  });

  child.unref();

  return { pid: child.pid, logFile };
}

function processQueue(agent) {
  const queue = dequeueAll(agent);
  if (!queue || queue.length === 0) {
    log(`${agent}: no queued tasks, staying idle`);
    return;
  }

  log(`${agent}: found ${queue.length} queued task(s), starting new session`);

  const latest = queue[queue.length - 1];
  const allTaskIds = queue.map((q) => q.taskId).join(", ");
  const reason = `queued_wakeup (${queue.length} task(s): ${allTaskIds})`;

  const result = spawnAgent(agent, latest.taskId, reason);
  log(`${agent}: queue-triggered session ${result.pid ? `STARTED (pid: ${result.pid})` : "FAILED"}`);
}

/**
 * Mutex-protected agent start.
 * Ensures only one /wake call per agent can be in the spawn-or-queue decision at a time.
 */
async function startAgentSafe(agent, taskId, reason) {
  // Wait for any existing lock on this agent to release
  while (agentLocks.has(agent)) {
    await agentLocks.get(agent);
  }

  // Create a new lock
  let releaseLock;
  const lockPromise = new Promise((resolve) => { releaseLock = resolve; });
  agentLocks.set(agent, lockPromise);

  try {
    return startAgentInner(agent, taskId, reason);
  } finally {
    agentLocks.delete(agent);
    releaseLock();
  }
}

function startAgentInner(agent, taskId, reason) {
  // Check 1: in-memory tracking
  if (runningAgents.has(agent)) {
    log(`${agent} is tracked as running, queuing task`);
    return enqueueTask(agent, taskId, reason);
  }

  // Check 2: OS-level process check
  if (isAgentRunning(agent)) {
    log(`${agent} process found via pgrep, tracking + queuing task`);
    runningAgents.add(agent);
    return enqueueTask(agent, taskId, reason);
  }

  // Agent is idle — start immediately
  const result = spawnAgent(agent, taskId, reason);
  return `STARTED (pid: ${result.pid}, log: ${result.logFile})`;
}

// --- Signature Verification ---

function verifySignature(body, signature) {
  if (!WEBHOOK_SECRET) return true;
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

// --- HTTP Server ---

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
      const queue = readQueue(agent);
      const spawnTs = lastSpawnTime.get(agent);
      status[agent] = {
        tracked: runningAgents.has(agent),
        processRunning: isAgentRunning(agent),
        queuedTasks: queue.length,
        queue: queue,
        lastSpawn: spawnTs ? new Date(spawnTs).toISOString() : null,
        cooldownActive: spawnTs ? (Date.now() - spawnTs < SPAWN_COOLDOWN_MS) : false,
      };
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(status, null, 2));
    return;
  }

  // Flush queue for an agent
  if (req.method === "POST" && req.url === "/flush") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
        return;
      }

      const { agent } = payload;
      if (!agent || !VALID_AGENTS.has(agent)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: `Invalid agent: ${agent}` }));
        return;
      }

      if (runningAgents.has(agent) || isAgentRunning(agent)) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, message: `${agent} is still running, queue will process on exit` }));
        return;
      }

      processQueue(agent);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, message: `Flushed queue for ${agent}` }));
    });
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
  req.on("end", async () => {
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

    // Use mutex-protected start to prevent race conditions
    const result = await startAgentSafe(agent, taskId || "unknown", reason || "webhook");

    log(`${agent}: ${result}`);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, agent, result }));
  });
});

// --- Stale Tracker Cleanup ---
// Every 30s, check if tracked agents are actually still running.
// Respects spawn cooldown — won't touch an agent within 30s of last spawn.
setInterval(() => {
  for (const agent of runningAgents) {
    // Don't interfere with recently spawned agents
    const spawnTs = lastSpawnTime.get(agent);
    if (spawnTs && Date.now() - spawnTs < SPAWN_COOLDOWN_MS) {
      continue;
    }

    if (!isAgentRunning(agent)) {
      log(`${agent}: stale tracker detected (tracked but not running), cleaning up`);
      runningAgents.delete(agent);
      processQueue(agent);
    }
  }
}, STALE_CHECK_INTERVAL_MS);

server.listen(PORT, () => {
  log(`Agent Wakeup Server v3 (mutex + cooldown) listening on port ${PORT}`);
  log(`Webhook endpoint:  POST http://localhost:${PORT}/wake`);
  log(`Health check:      GET  http://localhost:${PORT}/health`);
  log(`Agent status:      GET  http://localhost:${PORT}/status`);
  log(`Flush queue:       POST http://localhost:${PORT}/flush`);
  log(`Spawn cooldown:    ${SPAWN_COOLDOWN_MS / 1000}s`);
  log(`Stale check:       every ${STALE_CHECK_INTERVAL_MS / 1000}s`);
  if (WEBHOOK_SECRET) {
    log(`Signature verification: ENABLED`);
  } else {
    log(`Signature verification: DISABLED (set WEBHOOK_SECRET to enable)`);
  }
});
