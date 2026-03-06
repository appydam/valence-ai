# Mission Control — Self-Hosted Agent Server Setup

> For customers who want to run AI agents on their own infrastructure.

---

## Overview

In the self-hosted model, you run the AI agent server on your own infrastructure while we host the dashboard and backend. This gives you:
- Agents running inside your network with access to internal tools/APIs/code
- Full control over your Anthropic API key and usage
- Data stays on your servers

**We host:** Dashboard + Convex backend
**You host:** Agent server (OpenClaw runtime)

---

## Server Requirements

| Requirement | Minimum |
|-------------|---------|
| OS | Ubuntu 22.04+ (or Debian 12+) |
| CPU | 2 vCPU |
| RAM | 2 GB |
| Disk | 10 GB |
| Node.js | v20+ (installed automatically) |

### Network Requirements

| Direction | Destination | Port | Purpose |
|-----------|-------------|------|---------|
| Outbound | `*.convex.cloud` | 443 (HTTPS) | Agent heartbeat to dashboard |
| Outbound | `api.anthropic.com` | 443 (HTTPS) | LLM API calls |
| Inbound | Mission Control SSH proxy | 22 (SSH) | Dashboard sends commands to agents |

---

## Installation

### Quick Install (One Command)

```bash
curl -fsSL https://your-domain/install.sh | bash -s -- \
  --api-key <your-api-key> \
  --convex-url <your-convex-http-url> \
  --anthropic-key <your-anthropic-api-key>
```

**Where to find these values:**
- **API Key:** Mission Control dashboard → Settings → API Keys
- **Convex URL:** Provided by your Mission Control admin
- **Anthropic Key:** [Anthropic Console](https://console.anthropic.com) → API Keys

### Manual Install

If you prefer to install manually:

```bash
# 1. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# 2. Install OpenClaw CLI
npm install -g @anthropic/openclaw@latest

# 3. Create directory structure
mkdir -p ~/.openclaw/workspace/agents/{kaze,scout,forge,ghost,sentinel}
mkdir -p ~/.openclaw/workspace/skills/mission-control
mkdir -p ~/.openclaw/agents/{kaze,scout,forge,ghost,sentinel}/sessions

# 4. Configure environment
cat > ~/.openclaw/.env <<EOF
MISSION_CONTROL_API_KEY=<your-api-key>
MISSION_CONTROL_URL=<your-convex-http-url>
ANTHROPIC_API_KEY=<your-anthropic-api-key>
EOF

# 5. Start agents
openclaw gateway start
```

---

## Post-Install: Connect to Dashboard

1. In Mission Control dashboard, go to **Settings → SSH Configuration**
2. Enter your server's IP address, SSH port (22), and username
3. Paste your SSH private key (the dashboard encrypts it before storing)
4. Click **Test Connection**
5. Once connected, agents will start appearing in the dashboard

---

## Verifying Installation

After installation, verify everything is working:

```bash
# Check Node.js
node --version  # Should be v20+

# Check OpenClaw
npx openclaw --version

# Check SOUL files exist
find ~/.openclaw/workspace -name 'SOUL.md' | wc -l  # Should be >= 1

# Check env file
cat ~/.openclaw/.env  # Should have all 3 vars set

# Start agents and verify heartbeat
openclaw gateway start
# Check dashboard — agents should appear within 2 minutes
```

---

## Running as a Service (Recommended)

To ensure agents restart automatically on reboot:

```bash
sudo tee /etc/systemd/system/openclaw-agents.service > /dev/null <<EOF
[Unit]
Description=OpenClaw Agent Gateway
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/.openclaw
Environment=HOME=$HOME
ExecStart=/usr/bin/npx openclaw gateway start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable openclaw-agents
sudo systemctl start openclaw-agents
```

Check status:
```bash
sudo systemctl status openclaw-agents
sudo journalctl -u openclaw-agents -f  # Follow logs
```

---

## Updating Agents

When we push updates to agent configurations (SOUL files, skills):

```bash
# Stop agents
sudo systemctl stop openclaw-agents

# Update OpenClaw CLI
npm install -g @anthropic/openclaw@latest

# Restart
sudo systemctl start openclaw-agents
```

SOUL file updates are synced automatically from the dashboard — no manual action needed for most updates.

---

## Troubleshooting

### Agents not appearing in dashboard
1. Check outbound connectivity: `curl -I https://api.anthropic.com`
2. Check env vars: `cat ~/.openclaw/.env`
3. Check agent process: `ps aux | grep openclaw`
4. Check logs: `sudo journalctl -u openclaw-agents -n 50`

### Agent crashes / session recovery loops
1. Find corrupt session: `ls -lt ~/.openclaw/agents/<agent>/sessions/`
2. Delete the largest/newest `.jsonl` file and its `.lock` file
3. Restart: `sudo systemctl restart openclaw-agents`

### SSH connection fails from dashboard
1. Verify SSH is accessible: `ssh localhost` (from the server itself)
2. Check firewall: `sudo ufw status` — port 22 must be open
3. Check SSH key: ensure the private key in dashboard matches the server's `~/.ssh/authorized_keys`

### High API costs
- Agents are configured to hard-stop at turn 15 to prevent runaway sessions
- Monitor usage in the dashboard under each agent's stats
- Reduce agent activity by adjusting task assignment rules

---

## Security Notes

- Your Anthropic API key never leaves your server — it's only used for direct API calls
- SSH private key stored in the dashboard is encrypted with AES-256-GCM
- Agent heartbeat traffic is HTTPS-only
- No customer data is stored on our servers — all task content stays in your Convex project
