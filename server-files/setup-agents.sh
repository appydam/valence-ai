#!/bin/bash

# ============================================
# Mission Control Agent Setup Script
# ============================================
# Run this on your AWS Lightsail server after
# deploying Mission Control to Convex.
# ============================================

set -e

echo "🚀 Setting up Mission Control agent infrastructure..."
echo ""

# Create directory structure
echo "📁 Creating agent directories..."
mkdir -p ~/.openclaw/workspace/agents/scout
mkdir -p ~/.openclaw/workspace/agents/forge
mkdir -p ~/.openclaw/workspace/agents/ghost
mkdir -p ~/.openclaw/workspace/skills/mission-control

echo "✅ Directories created:"
echo "   ~/.openclaw/workspace/agents/scout/"
echo "   ~/.openclaw/workspace/agents/forge/"
echo "   ~/.openclaw/workspace/agents/ghost/"
echo "   ~/.openclaw/workspace/skills/mission-control/"
echo ""

# Check if files already exist
echo "📋 Checking for existing files..."
for f in \
  ~/.openclaw/workspace/SOUL.md \
  ~/.openclaw/workspace/agents/scout/SOUL.md \
  ~/.openclaw/workspace/agents/forge/SOUL.md \
  ~/.openclaw/workspace/agents/ghost/SOUL.md \
  ~/.openclaw/workspace/skills/mission-control/SKILL.md; do
  if [ -f "$f" ]; then
    echo "   ⚠️  $f already exists (will not overwrite)"
  else
    echo "   ❌ $f not found (needs to be copied)"
  fi
done

echo ""
echo "============================================"
echo "📝 DEPLOYMENT CHECKLIST"
echo "============================================"
echo ""
echo "1. Copy SOUL.md files to the server:"
echo "   scp server-files/SOUL.md ubuntu@YOUR_SERVER:~/.openclaw/workspace/SOUL.md"
echo "   scp server-files/agents/scout/SOUL.md ubuntu@YOUR_SERVER:~/.openclaw/workspace/agents/scout/SOUL.md"
echo "   scp server-files/agents/forge/SOUL.md ubuntu@YOUR_SERVER:~/.openclaw/workspace/agents/forge/SOUL.md"
echo "   scp server-files/agents/ghost/SOUL.md ubuntu@YOUR_SERVER:~/.openclaw/workspace/agents/ghost/SOUL.md"
echo ""
echo "2. Copy SKILL.md to the server:"
echo "   scp server-files/skills/mission-control/SKILL.md ubuntu@YOUR_SERVER:~/.openclaw/workspace/skills/mission-control/SKILL.md"
echo ""
echo "3. Replace YOUR_CONVEX_URL in SKILL.md with your actual Convex site URL:"
echo '   sed -i "s|YOUR_CONVEX_URL|https://your-deployment.convex.site|g" ~/.openclaw/workspace/skills/mission-control/SKILL.md'
echo ""
echo "4. Update ~/.openclaw/openclaw.json with agent configurations"
echo "   (See server-files/openclaw-config.json for the JSON to merge)"
echo ""
echo "5. Restart the OpenClaw gateway:"
echo "   openclaw gateway restart"
echo ""
echo "6. Set up cron jobs by messaging Kaze on Telegram:"
echo ""
echo "--- CRON JOB 1: Scout (every 4 hours) ---"
echo 'Create a cron job: Every 4 hours starting at 8 AM IST, run agent Scout.'
echo 'Scout should: send a heartbeat to Mission Control, check for assigned tasks,'
echo 'if none then check inbox, if inbox empty then research the latest AI news'
echo 'and create a task for it. Post findings to Mission Control.'
echo 'Send heartbeat idle when done.'
echo ""
echo "--- CRON JOB 2: Forge (every 3 hours) ---"
echo 'Create a cron job: Every 3 hours starting at 9 AM IST, run agent Forge.'
echo 'Forge should: send a heartbeat to Mission Control, check for assigned'
echo 'coding tasks, work on the highest priority one, post deliverables to'
echo 'Mission Control. Send heartbeat idle when done.'
echo ""
echo "--- CRON JOB 3: Ghost (every 6 hours) ---"
echo 'Create a cron job: Every 6 hours starting at 10 AM IST, run agent Ghost.'
echo 'Ghost should: send a heartbeat to Mission Control, check for assigned'
echo 'content tasks, if none then check if Scout posted research to turn into'
echo 'content, draft content and post to Mission Control.'
echo 'Send heartbeat idle when done.'
echo ""
echo "--- CRON JOB 4: Kaze Morning Brief (daily 8 AM IST) ---"
echo 'Create a cron job: Every day at 8:00 AM IST, send me a morning brief on'
echo 'Telegram. Include: what each agent worked on yesterday, current task board'
echo 'status (how many tasks in each column), any tasks needing my review, and'
echo 'top priority for today.'
echo ""
echo "============================================"
echo "✅ Setup complete! Follow the checklist above."
echo "============================================"
