/**
 * Server setup script template for new Lightsail instances.
 * Installs OpenClaw, Node.js, and configures the agent workspace.
 */

export function generateSetupScript(opts: {
  provider: string;
  apiKey: string;
  wakeupServerPort?: number;
}): string {
  const port = opts.wakeupServerPort ?? 3333;

  // Map provider to OpenClaw model format
  const modelMap: Record<string, string> = {
    anthropic: "anthropic/claude-sonnet-4-6",
    openai: "openai/gpt-4o",
    google: "google/gemini-2.0-flash",
    xai: "xai/grok-3",
  };

  const model = modelMap[opts.provider] ?? "anthropic/claude-sonnet-4-6";

  // Map provider to env var name that OpenClaw expects
  const envVarMap: Record<string, string> = {
    anthropic: "ANTHROPIC_API_KEY",
    openai: "OPENAI_API_KEY",
    google: "GOOGLE_API_KEY",
    xai: "XAI_API_KEY",
  };

  const envVar = envVarMap[opts.provider] ?? "ANTHROPIC_API_KEY";

  return `#!/bin/bash
set -euo pipefail

echo "=== Valence AI Server Setup ==="
echo "Provider: ${opts.provider}"
echo "Starting at: $(date)"

# ── System updates ──
apt-get update -y
apt-get install -y curl git jq unzip

# ── Install Node.js 20 ──
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node.js version: $(node --version)"

# ── Install OpenClaw CLI ──
if ! command -v openclaw &> /dev/null; then
  npm install -g openclaw
fi
echo "OpenClaw version: $(openclaw --version 2>/dev/null || echo 'installed')"

# ── Set API key ──
echo 'export ${envVar}="${opts.apiKey}"' >> /home/ubuntu/.bashrc
export ${envVar}="${opts.apiKey}"

# ── Create workspace structure ──
mkdir -p /home/ubuntu/.openclaw/workspace/agents/{kaze,scout,forge,ghost,sentinel}
mkdir -p /home/ubuntu/.openclaw/workspace/skills/mission-control
mkdir -p /home/ubuntu/.openclaw/agents/{kaze,scout,forge,ghost,sentinel}/sessions

# ── Default SOUL files ──
cat > /home/ubuntu/.openclaw/workspace/SOUL.md << 'SOULEOF'
# Kaze — Chief of Staff

You are Kaze, the coordinator of an autonomous AI agent squad. You delegate tasks to the right agent, track progress, and ensure quality.

## Your Agents
- **Scout**: Research and intelligence gathering
- **Forge**: Engineering, code, and builds
- **Ghost**: Content creation and distribution
- **Sentinel**: Quality assurance and review

## Rules
1. Always delegate — never do the work yourself
2. Break complex missions into clear, scoped tasks
3. Track dependencies between tasks
4. Post progress updates to Valence AI
SOULEOF

for agent in scout forge ghost sentinel; do
  cat > /home/ubuntu/.openclaw/workspace/agents/$agent/SOUL.md << AGENTEOF
# $agent Agent

You are $agent, a specialized AI agent in the Valence AI squad.

## Your Role
Execute tasks assigned by Kaze with precision and quality.

## Rules
1. Follow task specifications exactly
2. Post deliverables to Valence AI when done
3. Report blockers immediately
4. Stay within your scope — don't improvise
AGENTEOF
done

# ── OpenClaw config ──
cat > /home/ubuntu/.openclaw/openclaw.json << CFGEOF
{
  "agents": {
    "kaze": {
      "name": "Kaze",
      "description": "Chief of Staff — orchestrates the squad",
      "soul": "~/.openclaw/workspace/SOUL.md",
      "skills": ["mission-control"],
      "model": "${model}",
      "session": { "maxTurns": 30, "timeout": 600 }
    },
    "scout": {
      "name": "Scout",
      "description": "Research and intelligence agent",
      "soul": "~/.openclaw/workspace/agents/scout/SOUL.md",
      "skills": ["mission-control"],
      "model": "${model}",
      "session": { "maxTurns": 20, "timeout": 300 }
    },
    "forge": {
      "name": "Forge",
      "description": "Engineering and build agent",
      "soul": "~/.openclaw/workspace/agents/forge/SOUL.md",
      "skills": ["mission-control"],
      "model": "${model}",
      "session": { "maxTurns": 30, "timeout": 600 }
    },
    "ghost": {
      "name": "Ghost",
      "description": "Content and distribution agent",
      "soul": "~/.openclaw/workspace/agents/ghost/SOUL.md",
      "skills": ["mission-control"],
      "model": "${model}",
      "session": { "maxTurns": 20, "timeout": 300 }
    },
    "sentinel": {
      "name": "Sentinel",
      "description": "QA and review agent",
      "soul": "~/.openclaw/workspace/agents/sentinel/SOUL.md",
      "skills": ["mission-control"],
      "model": "${model}",
      "session": { "maxTurns": 20, "timeout": 300 }
    }
  }
}
CFGEOF

# ── Wakeup server ──
cat > /home/ubuntu/agent-wakeup-server.js << 'WAKEEOF'
const http = require('http');
const { execSync } = require('child_process');

const PORT = ${port};

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/wakeup') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { agentName, taskId, reason } = JSON.parse(body);
        console.log(\`[WAKEUP] Agent: \${agentName}, Task: \${taskId}, Reason: \${reason}\`);
        // Trigger OpenClaw agent session
        execSync(\`openclaw agent run \${agentName} &\`, { timeout: 5000 });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, agent: agentName }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  }
});

server.listen(PORT, () => console.log(\`Wakeup server on port \${PORT}\`));
WAKEEOF

# ── Set ownership ──
chown -R ubuntu:ubuntu /home/ubuntu/.openclaw /home/ubuntu/agent-wakeup-server.js

# ── Start wakeup server ──
su - ubuntu -c "nohup node /home/ubuntu/agent-wakeup-server.js > /home/ubuntu/agent-wakeup.log 2>&1 &"

echo "=== Setup complete at $(date) ==="
`;
}
