#!/usr/bin/env node

/**
 * SSH Proxy Service
 *
 * HTTP server that performs SSH operations on behalf of the frontend.
 * Connects to your Lightsail server via SSH and executes commands.
 *
 * Deploy this to your Lightsail/DigitalOcean/Hetzner server alongside your agents.
 *
 * Environment Variables:
 *   PORT - Server port (default: 3001)
 */

const http = require("http");
const { Client } = require("ssh2");

const PORT = parseInt(process.env.PORT || "3001", 10);

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

function executeSSH(sshConfig, command) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = "";

    conn.on("ready", () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }

        stream.on("close", (code, signal) => {
          conn.end();
          if (code === 0) {
            resolve(output);
          } else {
            reject(new Error(`Command failed with code ${code}: ${output}`));
          }
        });

        stream.on("data", (data) => {
          output += data.toString();
        });

        stream.stderr.on("data", (data) => {
          output += data.toString();
        });
      });
    });

    conn.on("error", (err) => {
      reject(err);
    });

    conn.connect({
      host: sshConfig.host,
      port: sshConfig.port || 22,
      username: sshConfig.username,
      privateKey: sshConfig.privateKey,
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  // Health check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, corsHeaders());
    res.end(JSON.stringify({
      ok: true,
      service: "SSH Proxy + Agent Wakeup",
      version: "1.1.0",
      uptime: process.uptime()
    }));
    return;
  }

  // POST /ssh/test - Test SSH connection
  if (req.method === "POST" && req.url === "/ssh/test") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const sshConfig = JSON.parse(body);
        await executeSSH(sshConfig, "echo 'SSH connection successful'");
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({
          ok: true,
          message: `SSH connection successful to ${sshConfig.username}@${sshConfig.host}`
        }));
      } catch (error) {
        log(`SSH test failed: ${error.message}`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: false, message: `Connection failed: ${error.message}` }));
      }
    });
    return;
  }

  // POST /ssh/pull-soul - Pull SOUL file from server
  if (req.method === "POST" && req.url === "/ssh/pull-soul") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { agentName, ...sshConfig } = JSON.parse(body);
        const agentId = agentName.toLowerCase();
        const soulPath = agentId === "kaze"
          ? "~/.openclaw/workspace/SOUL.md"
          : `~/.openclaw/workspace/agents/${agentId}/SOUL.md`;

        const content = await executeSSH(sshConfig, `cat ${soulPath}`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: true, content }));
      } catch (error) {
        log(`Pull SOUL failed: ${error.message}`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    return;
  }

  // POST /ssh/sync-soul - Push SOUL file to server
  if (req.method === "POST" && req.url === "/ssh/sync-soul") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { agentName, content, ...sshConfig } = JSON.parse(body);
        const agentId = agentName.toLowerCase();
        const soulPath = agentId === "kaze"
          ? "~/.openclaw/workspace/SOUL.md"
          : `~/.openclaw/workspace/agents/${agentId}/SOUL.md`;

        const mkdirCmd = agentId === "kaze"
          ? "mkdir -p ~/.openclaw/workspace"
          : `mkdir -p ~/.openclaw/workspace/agents/${agentId}`;

        const escapedContent = content.replace(/'/g, "'\\''");
        const command = `${mkdirCmd} && cat > ${soulPath} << 'EOFMARKER'\n${content}\nEOFMARKER`;

        await executeSSH(sshConfig, command);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: true, message: "SOUL file synced successfully" }));
      } catch (error) {
        log(`Sync SOUL failed: ${error.message}`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    return;
  }

  // POST /ssh/restart-openclaw - Restart OpenClaw
  if (req.method === "POST" && req.url === "/ssh/restart-openclaw") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const sshConfig = JSON.parse(body);
        await executeSSH(sshConfig, "openclaw gateway restart || systemctl restart openclaw || pkill -9 openclaw");
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: true, message: "OpenClaw restarted successfully" }));
      } catch (error) {
        log(`Restart failed: ${error.message}`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    return;
  }

  // POST /ssh/sync-all - Sync all configs from server
  if (req.method === "POST" && req.url === "/ssh/sync-all") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const sshConfig = JSON.parse(body);

        // Pull openclaw.json
        const openclawConfigStr = await executeSSH(sshConfig, "cat ~/.openclaw/openclaw.json");
        const openclawConfig = JSON.parse(openclawConfigStr);

        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: true, openclawConfig }));
      } catch (error) {
        log(`Sync all failed: ${error.message}`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    return;
  }

  // POST /openclaw/tools-list - List OpenClaw skills
  if (req.method === "POST" && req.url === "/openclaw/tools-list") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const sshConfig = JSON.parse(body);
        const output = await executeSSH(sshConfig, "openclaw skill list || echo '[]'");

        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({
          ok: true,
          skills: [],
          agentSkills: {},
          summary: { ready: 0, total: 0 }
        }));
      } catch (error) {
        log(`Tools list failed: ${error.message}`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    return;
  }

  // POST /openclaw/tools-install - Install a skill
  if (req.method === "POST" && req.url === "/openclaw/tools-install") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { toolName, ...sshConfig } = JSON.parse(body);
        await executeSSH(sshConfig, `openclaw skill install ${toolName}`);

        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: true, message: `${toolName} installed successfully` }));
      } catch (error) {
        log(`Tool install failed: ${error.message}`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    return;
  }

  // POST /ssh/generate-skill - Generate skill template
  if (req.method === "POST" && req.url === "/ssh/generate-skill") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: true, message: "Skill template generation not implemented" }));
      } catch (error) {
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    return;
  }

  // POST /wake - Wake an agent (for Mission Control integration)
  if (req.method === "POST" && req.url === "/wake") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { agent } = JSON.parse(body);

        if (!agent || !agent.trim()) {
          res.writeHead(400, corsHeaders());
          res.end(JSON.stringify({ error: "Invalid agent name" }));
          return;
        }

        const agentName = agent.toLowerCase();

        // Get SSH config from environment variables
        const sshConfig = {
          host: process.env.LIGHTSAIL_HOST,
          port: parseInt(process.env.LIGHTSAIL_PORT || "22"),
          username: process.env.LIGHTSAIL_USER || "ubuntu",
          privateKey: process.env.LIGHTSAIL_PRIVATE_KEY,
        };

        if (!sshConfig.host || !sshConfig.privateKey) {
          res.writeHead(500, corsHeaders());
          res.end(JSON.stringify({
            error: "SSH configuration incomplete. Set LIGHTSAIL_HOST and LIGHTSAIL_PRIVATE_KEY env vars"
          }));
          return;
        }

        // Full path to openclaw (npm global install)
        const openclawBin = "/home/ubuntu/.npm-global/bin/openclaw";

        // Check if agent is already running
        try {
          await executeSSH(sshConfig, `pgrep -f "openclaw run ${agentName}"`);
          log(`Agent ${agentName} is already running`);
          res.writeHead(200, corsHeaders());
          res.end(JSON.stringify({
            ok: true,
            message: `Agent ${agentName} is already running`,
            status: "ALREADY_RUNNING"
          }));
          return;
        } catch {
          // Agent not running, proceed to start
        }

        // Start the agent
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const logFile = `/tmp/openclaw-${agentName}-${timestamp}.log`;
        const startCommand = `nohup ${openclawBin} run ${agentName} > ${logFile} 2>&1 & echo $!`;

        const pid = await executeSSH(sshConfig, startCommand);

        log(`Started agent ${agentName} with PID ${pid.trim()}`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({
          ok: true,
          message: `Agent ${agentName} started successfully`,
          status: "STARTED",
          pid: pid.trim(),
          logFile
        }));
      } catch (error) {
        log(`Wake agent failed: ${error.message}`);
        res.writeHead(500, corsHeaders());
        res.end(JSON.stringify({ error: `Failed to wake agent: ${error.message}` }));
      }
    });
    return;
  }

  // POST /ssh/register-agent - Register a new agent in openclaw.json + create workspace + starter SOUL
  if (req.method === "POST" && req.url === "/ssh/register-agent") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { agentName, description, model, skills, sessionMaxTurns, sessionTimeout, isOrchestrator, ...sshConfig } = JSON.parse(body);
        const slug = agentName.toLowerCase();

        // 1. Read current openclaw.json — real format uses agents.list array
        let openclawConfig = {};
        try {
          const raw = await executeSSH(sshConfig, "cat ~/.openclaw/openclaw.json 2>/dev/null || echo '{}'");
          openclawConfig = JSON.parse(raw.trim() || "{}");
        } catch { /* use empty */ }

        // Ensure agents.list array exists (preserves all other top-level keys)
        if (!openclawConfig.agents) openclawConfig.agents = {};
        if (!Array.isArray(openclawConfig.agents.list)) openclawConfig.agents.list = [];

        // 2. Build agent entry matching openclaw's list-item schema
        const soulPath = isOrchestrator
          ? "~/.openclaw/workspace/SOUL.md"
          : `~/.openclaw/workspace/agents/${slug}/SOUL.md`;

        const newEntry = {
          id: slug,
          name: agentName,
          ...(isOrchestrator && { default: true }),
          description: description || `${agentName} agent`,
          workspace: isOrchestrator ? "~/.openclaw/workspace" : `~/.openclaw/workspace/agents/${slug}`,
          soul: soulPath,
          skills: skills || [],
          model: model || "claude-sonnet-4-6",
          session: {
            maxTurns: sessionMaxTurns || 20,
            timeout: sessionTimeout || 300,
          },
        };

        // 3. Upsert: replace existing entry with same id, or append
        const existingIdx = openclawConfig.agents.list.findIndex((a) => a.id === slug || a.name === agentName);
        if (existingIdx >= 0) {
          // Preserve any extra fields the existing entry had
          openclawConfig.agents.list[existingIdx] = { ...openclawConfig.agents.list[existingIdx], ...newEntry };
        } else {
          openclawConfig.agents.list.push(newEntry);
        }

        // 4. Write updated openclaw.json using base64 to avoid shell escaping issues
        const configJson = JSON.stringify(openclawConfig, null, 2);
        const b64Config = Buffer.from(configJson).toString("base64");
        await executeSSH(sshConfig, `echo '${b64Config}' | base64 -d > ~/.openclaw/openclaw.json`);

        // 5. Create workspace directory
        if (!isOrchestrator) {
          await executeSSH(sshConfig, `mkdir -p ~/.openclaw/workspace/agents/${slug}`);
        }

        // 6. Create starter SOUL.md only if it doesn't exist yet
        const starterSoul = `# ${agentName}\n\n${description || `You are ${agentName}, an AI agent.`}\n\n## Your Role\n\nDescribe your role and responsibilities here. Edit this file from Settings → Agents → ⚙️ → SOUL tab.`;
        const b64Soul = Buffer.from(starterSoul).toString("base64");
        await executeSSH(sshConfig, `[ -f ${soulPath} ] || (echo '${b64Soul}' | base64 -d > ${soulPath})`);

        log(`Agent ${agentName} registered successfully (list now has ${openclawConfig.agents.list.length} agents)`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: true, message: `Agent ${agentName} registered and workspace created` }));
      } catch (error) {
        log(`Register agent failed: ${error.message}`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    return;
  }

  // POST /ssh/unregister-agent - Remove an agent from openclaw.json (does NOT delete SOUL files)
  if (req.method === "POST" && req.url === "/ssh/unregister-agent") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { agentName, ...sshConfig } = JSON.parse(body);
        const slug = agentName.toLowerCase();

        // Read current openclaw.json
        let openclawConfig = {};
        try {
          const raw = await executeSSH(sshConfig, "cat ~/.openclaw/openclaw.json 2>/dev/null || echo '{}'");
          openclawConfig = JSON.parse(raw.trim() || "{}");
        } catch { /* use empty */ }

        if (!openclawConfig.agents || !Array.isArray(openclawConfig.agents.list)) {
          res.writeHead(200, corsHeaders());
          res.end(JSON.stringify({ ok: true, message: `Agent ${agentName} not found in openclaw.json (nothing to remove)` }));
          return;
        }

        const before = openclawConfig.agents.list.length;
        openclawConfig.agents.list = openclawConfig.agents.list.filter(
          (a) => a.id !== slug && a.name !== agentName
        );
        const removed = before - openclawConfig.agents.list.length;

        // Write back
        const configJson = JSON.stringify(openclawConfig, null, 2);
        const b64Config = Buffer.from(configJson).toString("base64");
        await executeSSH(sshConfig, `echo '${b64Config}' | base64 -d > ~/.openclaw/openclaw.json`);

        log(`Agent ${agentName} unregistered (removed ${removed} entry, list now has ${openclawConfig.agents.list.length} agents)`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: true, message: `Agent ${agentName} removed from OpenClaw`, removed }));
      } catch (error) {
        log(`Unregister agent failed: ${error.message}`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    return;
  }

  // POST /ssh/file-tree - List files in OpenClaw workspace
  if (req.method === "POST" && req.url === "/ssh/file-tree") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const sshConfig = JSON.parse(body);
        const raw = await executeSSH(sshConfig, "find ~/.openclaw/workspace -type f 2>/dev/null | head -300");
        const paths = raw.trim().split("\n").filter(Boolean);
        const files = paths.map((p) => ({
          path: p,
          relativePath: p.replace(/^\/home\/[^/]+\/\.openclaw\/workspace\//, ""),
          name: p.split("/").pop(),
        }));
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: true, files }));
      } catch (error) {
        log(`File tree failed: ${error.message}`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    return;
  }

  // POST /ssh/file-read - Read a file
  if (req.method === "POST" && req.url === "/ssh/file-read") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { filePath, ...sshConfig } = JSON.parse(body);
        const content = await executeSSH(sshConfig, `cat '${filePath.replace(/'/g, "'\\''")}'`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: true, content }));
      } catch (error) {
        log(`File read failed: ${error.message}`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    return;
  }

  // POST /ssh/file-write - Write a file (base64-safe)
  if (req.method === "POST" && req.url === "/ssh/file-write") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { filePath, content, ...sshConfig } = JSON.parse(body);
        const b64 = Buffer.from(content).toString("base64");
        const safePath = filePath.replace(/'/g, "'\\''");
        await executeSSH(sshConfig, `mkdir -p "$(dirname '${safePath}')" && echo '${b64}' | base64 -d > '${safePath}'`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: true }));
      } catch (error) {
        log(`File write failed: ${error.message}`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    return;
  }

  // POST /ssh/file-mkdir - Create a directory
  if (req.method === "POST" && req.url === "/ssh/file-mkdir") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { dirPath, ...sshConfig } = JSON.parse(body);
        await executeSSH(sshConfig, `mkdir -p '${dirPath.replace(/'/g, "'\\''")}'`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: true }));
      } catch (error) {
        log(`File mkdir failed: ${error.message}`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    return;
  }

  // POST /ssh/file-delete - Delete a file
  if (req.method === "POST" && req.url === "/ssh/file-delete") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { filePath, ...sshConfig } = JSON.parse(body);
        await executeSSH(sshConfig, `rm -f '${filePath.replace(/'/g, "'\\''")}'`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: true }));
      } catch (error) {
        log(`File delete failed: ${error.message}`);
        res.writeHead(200, corsHeaders());
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, corsHeaders());
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  log(`SSH Proxy + Agent Wakeup Server listening on port ${PORT}`);
  log(`Endpoints:`);
  log(`  GET  /health - Health check`);
  log(`  POST /wake - Wake an agent (Mission Control)`);
  log(`  POST /ssh/test - Test SSH connection`);
  log(`  POST /ssh/pull-soul - Pull SOUL file`);
  log(`  POST /ssh/sync-soul - Sync SOUL to server`);
  log(`  POST /ssh/restart-openclaw - Restart OpenClaw`);
  log(`  POST /ssh/sync-all - Sync all configs`);
  log(`  POST /openclaw/tools-list - List skills`);
  log(`  POST /openclaw/tools-install - Install skill`);
});
