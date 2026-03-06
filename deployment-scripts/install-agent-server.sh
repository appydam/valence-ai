#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# Install OpenClaw Agent Server (On-Prem / Self-Hosted)
#
# Run this on your own server to set up Mission Control agents.
# Requirements: Ubuntu 22.04+, 2 vCPU, 2GB RAM, outbound HTTPS
#
# Usage: curl -fsSL https://your-domain/install.sh | bash -s -- \
#          --api-key <convex-api-key> \
#          --convex-url <convex-http-url> \
#          --anthropic-key <anthropic-api-key>
# ─────────────────────────────────────────────────────────────

API_KEY=""
CONVEX_URL=""
ANTHROPIC_KEY=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --api-key) API_KEY="$2"; shift 2 ;;
    --convex-url) CONVEX_URL="$2"; shift 2 ;;
    --anthropic-key) ANTHROPIC_KEY="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

if [ -z "$API_KEY" ] || [ -z "$CONVEX_URL" ] || [ -z "$ANTHROPIC_KEY" ]; then
  echo "❌ Missing required arguments"
  echo ""
  echo "Usage: ./install-agent-server.sh \\"
  echo "  --api-key <convex-api-key> \\"
  echo "  --convex-url <convex-http-url> \\"
  echo "  --anthropic-key <anthropic-api-key>"
  echo ""
  echo "Get your API key from: Settings → API Keys in Mission Control dashboard"
  echo "Get your Convex URL from: Settings → Server Config"
  exit 1
fi

echo "═══════════════════════════════════════════════════════"
echo "  Mission Control — Agent Server Installation"
echo "═══════════════════════════════════════════════════════"
echo ""

# ── Step 1: System Dependencies ───────────────────────────
echo "📦 Step 1/5: Installing system dependencies..."

if ! command -v node &> /dev/null; then
  echo "   Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
  sudo apt-get install -y nodejs
else
  NODE_VERSION=$(node --version)
  echo "   Node.js already installed: $NODE_VERSION"
fi

sudo apt-get install -y git jq htop -qq 2>/dev/null
echo "   ✅ Dependencies ready"
echo ""

# ── Step 2: Create Directory Structure ────────────────────
echo "📁 Step 2/5: Creating OpenClaw directory structure..."

mkdir -p ~/.openclaw/workspace/agents/{kaze,scout,forge,ghost,sentinel}
mkdir -p ~/.openclaw/workspace/skills/mission-control
mkdir -p ~/.openclaw/agents/{kaze,scout,forge,ghost,sentinel}/sessions

echo "   ✅ Directories created"
echo ""

# ── Step 3: Install OpenClaw CLI ──────────────────────────
echo "⚡ Step 3/5: Installing OpenClaw CLI..."

npm install -g @anthropic/openclaw@latest 2>/dev/null || {
  echo "   ⚠️  Global install failed, trying local..."
  cd ~/.openclaw && npm init -y 2>/dev/null && npm install @anthropic/openclaw@latest
}

echo "   ✅ OpenClaw installed"
echo ""

# ── Step 4: Configure Environment ─────────────────────────
echo "🔧 Step 4/5: Configuring environment..."

cat > ~/.openclaw/.env <<EOF
# Mission Control Agent Server Config
# Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

MISSION_CONTROL_API_KEY=$API_KEY
MISSION_CONTROL_URL=$CONVEX_URL
ANTHROPIC_API_KEY=$ANTHROPIC_KEY
EOF

echo "   ✅ Environment configured"
echo ""

# ── Step 5: Create Default SOUL Files ─────────────────────
echo "📝 Step 5/5: Creating default SOUL files..."

# Only create defaults if SOUL files don't exist yet
for agent in kaze scout forge ghost sentinel; do
  SOUL_DIR="$HOME/.openclaw/workspace/agents/$agent"
  if [ ! -f "$SOUL_DIR/SOUL.md" ]; then
    AGENT_UPPER=$(echo "$agent" | sed 's/./\U&/')
    cat > "$SOUL_DIR/SOUL.md" <<EOF
# $AGENT_UPPER

You are $AGENT_UPPER, a Mission Control agent. Your SOUL file will be synced from the Mission Control dashboard.

## Core Rules
- Always post partial results by turn 15 to prevent session crashes
- Use the mission-control skill for task updates
- Check for dependency context before starting work
EOF
  fi
done

# Kaze's root SOUL.md
if [ ! -f "$HOME/.openclaw/workspace/SOUL.md" ]; then
  cp "$HOME/.openclaw/workspace/agents/kaze/SOUL.md" "$HOME/.openclaw/workspace/SOUL.md"
fi

echo "   ✅ SOUL files created"
echo ""

# ── Done ──────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════"
echo "  ✅ Agent Server Installation Complete!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Next steps:"
echo "  1. Start the agents:  openclaw gateway start"
echo "  2. In Mission Control dashboard:"
echo "     → Go to Settings → Server"
echo "     → Enter this server's IP address"
echo "     → Click 'Test Connection'"
echo ""
echo "  Your agents will start appearing in the dashboard"
echo "  once they begin heartbeating to Mission Control."
echo ""
echo "  Server requirements:"
echo "  - Outbound HTTPS to *.convex.cloud (heartbeat)"
echo "  - Outbound HTTPS to api.anthropic.com (LLM calls)"
echo "  - Inbound SSH (port 22) from Mission Control's SSH proxy"
echo ""
