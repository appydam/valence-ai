#!/bin/bash

# Sync agent configuration files to Lightsail server
# Usage: ./sync-to-server.sh [server-ip]

SERVER=${1:-52.66.97.31}
REMOTE_USER=ubuntu
REMOTE_PATH=~/.openclaw/workspace

echo "🔄 Syncing agent files to $SERVER..."
echo ""

# Sync skills (SKILL.md files)
echo "📚 Syncing skills..."
rsync -avz --progress \
  skills/ \
  $REMOTE_USER@$SERVER:$REMOTE_PATH/skills/

# Sync agent SOUL files
echo "🧠 Syncing agent SOUL files..."
rsync -avz --progress \
  agents/ \
  $REMOTE_USER@$SERVER:$REMOTE_PATH/agents/

echo ""
echo "✅ Sync complete!"
echo ""
echo "To verify, SSH into the server and check:"
echo "  ssh $REMOTE_USER@$SERVER"
echo "  cat ~/.openclaw/workspace/skills/mission-control/SKILL.md | head -50"
