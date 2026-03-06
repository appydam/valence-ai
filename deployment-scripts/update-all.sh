#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# Batch update: redeploy Convex functions, Vercel apps, or
# restart agents across all active customers.
#
# Usage:
#   ./update-all.sh --functions-only         Deploy Convex functions
#   ./update-all.sh --env KEY VALUE          Set env var across all
#   ./update-all.sh --soul-sync              Sync SOUL.md to servers
#   ./update-all.sh --vercel-redeploy        Trigger Vercel rebuild
#   ./update-all.sh --agent-restart          Restart OpenClaw on servers
#   ./update-all.sh --dry-run --<mode>       Preview without executing
# ─────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
CUSTOMERS_FILE="$SCRIPT_DIR/customers.json"
LOG_DIR="$SCRIPT_DIR/logs"

# ── Flags ────────────────────────────────────────────────────
DRY_RUN=false
MODE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift ;;
    --functions-only|--env|--soul-sync|--vercel-redeploy|--agent-restart)
      MODE="$1"; shift ;;
    *) break ;;
  esac
done

if [ -z "$MODE" ]; then
  MODE="--functions-only"
fi

# ── Logging ──────────────────────────────────────────────────
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/update_${TIMESTAMP}.log"

log() {
  local msg="[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1"
  echo "$msg" | tee -a "$LOG_FILE"
}

# ── Validation ───────────────────────────────────────────────
if [ ! -f "$CUSTOMERS_FILE" ]; then
  log "❌ No customers.json found at $CUSTOMERS_FILE"
  exit 1
fi

echo "═══════════════════════════════════════════════════════"
echo "  Mission Control — Batch Update"
echo "═══════════════════════════════════════════════════════"
echo ""

CUSTOMERS=$(jq -c '.[] | select(.status == "active")' "$CUSTOMERS_FILE")
COUNT=$(echo "$CUSTOMERS" | wc -l | tr -d ' ')
log "Active customers: $COUNT"
log "Mode: $MODE"
if $DRY_RUN; then log "🏜️  DRY RUN — no changes will be made"; fi
log "Log file: $LOG_FILE"
echo ""

SUCCESS=0
FAIL=0
SKIP=0

# ── Functions-only ───────────────────────────────────────────
if [ "$MODE" = "--functions-only" ]; then
  log "Deploying Convex functions to all customers..."

  echo "$CUSTOMERS" | while IFS= read -r customer; do
    SLUG=$(echo "$customer" | jq -r '.slug')
    PROJECT=$(echo "$customer" | jq -r '.convexProject')

    if $DRY_RUN; then
      log "  [DRY RUN] Would deploy to $SLUG ($PROJECT)"
    else
      log "  📤 Deploying to $SLUG ($PROJECT)..."
      cd "$REPO_ROOT"
      if npx convex deploy --project "$PROJECT" --typecheck=disable 2>&1 | tee -a "$LOG_FILE" | tail -1; then
        log "     ✅ $SLUG done"
      else
        log "     ❌ $SLUG FAILED"
      fi
    fi
  done

# ── Env var ──────────────────────────────────────────────────
elif [ "$MODE" = "--env" ]; then
  KEY="${1:?Usage: ./update-all.sh --env KEY VALUE}"
  VALUE="${2:?Usage: ./update-all.sh --env KEY VALUE}"

  log "Setting $KEY across all customers..."

  echo "$CUSTOMERS" | while IFS= read -r customer; do
    SLUG=$(echo "$customer" | jq -r '.slug')
    PROJECT=$(echo "$customer" | jq -r '.convexProject')

    if $DRY_RUN; then
      log "  [DRY RUN] Would set $KEY on $SLUG ($PROJECT)"
    else
      log "  🔧 $SLUG: Setting $KEY..."
      npx convex env set "$KEY" "$VALUE" --project "$PROJECT" 2>/dev/null || true
    fi
  done

# ── SOUL sync ────────────────────────────────────────────────
elif [ "$MODE" = "--soul-sync" ]; then
  log "Syncing SOUL.md files to all servers..."

  echo "$CUSTOMERS" | while IFS= read -r customer; do
    SLUG=$(echo "$customer" | jq -r '.slug')
    IP=$(echo "$customer" | jq -r '.lightsailIp')
    KEY_FILE="$SCRIPT_DIR/keys/valence-${SLUG}-key.pem"

    if [ -z "$IP" ] || [ "$IP" = "null" ] || [ "$IP" = "" ]; then
      log "  ⚠️  $SLUG: No server IP, skipping"
      continue
    fi

    if $DRY_RUN; then
      log "  [DRY RUN] Would sync SOUL files to $SLUG ($IP)"
    else
      log "  📁 $SLUG ($IP): Syncing agents..."
      rsync -avz -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
        "$REPO_ROOT/server-files/agents/" \
        "ubuntu@$IP:/home/ubuntu/.openclaw/workspace/agents/" 2>&1 | tail -1

      log "  📁 $SLUG ($IP): Syncing skills..."
      rsync -avz -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
        "$REPO_ROOT/server-files/skills/" \
        "ubuntu@$IP:/home/ubuntu/.openclaw/workspace/skills/" 2>&1 | tail -1

      log "     ✅ $SLUG done"
    fi
  done

# ── Vercel redeploy ──────────────────────────────────────────
elif [ "$MODE" = "--vercel-redeploy" ]; then
  log "Triggering Vercel redeploy for all customers..."

  if ! command -v vercel &> /dev/null; then
    log "❌ Vercel CLI not installed. Run: npm i -g vercel"
    exit 1
  fi

  echo "$CUSTOMERS" | while IFS= read -r customer; do
    SLUG=$(echo "$customer" | jq -r '.slug')
    VERCEL_PROJECT=$(echo "$customer" | jq -r '.vercelProject // empty')

    if [ -z "$VERCEL_PROJECT" ]; then
      log "  ⚠️  $SLUG: No vercelProject in customers.json, skipping"
      continue
    fi

    if $DRY_RUN; then
      log "  [DRY RUN] Would redeploy Vercel project: $VERCEL_PROJECT for $SLUG"
    else
      log "  🚀 $SLUG: Redeploying $VERCEL_PROJECT..."
      if vercel redeploy --yes --prod 2>&1 | tee -a "$LOG_FILE" | tail -1; then
        log "     ✅ $SLUG Vercel redeploy triggered"
      else
        log "     ❌ $SLUG Vercel redeploy FAILED"
      fi
    fi
  done

# ── Agent restart ────────────────────────────────────────────
elif [ "$MODE" = "--agent-restart" ]; then
  log "Restarting OpenClaw agents on all servers..."

  echo "$CUSTOMERS" | while IFS= read -r customer; do
    SLUG=$(echo "$customer" | jq -r '.slug')
    IP=$(echo "$customer" | jq -r '.lightsailIp')
    KEY_FILE="$SCRIPT_DIR/keys/valence-${SLUG}-key.pem"

    if [ -z "$IP" ] || [ "$IP" = "null" ] || [ "$IP" = "" ]; then
      log "  ⚠️  $SLUG: No server IP (on-prem?), skipping"
      continue
    fi

    if $DRY_RUN; then
      log "  [DRY RUN] Would restart OpenClaw on $SLUG ($IP)"
    else
      log "  🔄 $SLUG ($IP): Restarting OpenClaw gateway..."
      if ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "ubuntu@$IP" \
        "sudo systemctl restart openclaw-gateway 2>/dev/null || (pkill -f 'openclaw gateway' && sleep 2 && cd /home/ubuntu/.openclaw && nohup npx openclaw gateway start > /tmp/openclaw-restart.log 2>&1 &)" 2>&1 | tee -a "$LOG_FILE"; then
        log "     ✅ $SLUG agents restarted"
      else
        log "     ❌ $SLUG agent restart FAILED"
      fi
    fi
  done

# ── Unknown ──────────────────────────────────────────────────
else
  echo "Unknown mode: $MODE"
  echo ""
  echo "Usage:"
  echo "  ./update-all.sh --functions-only         Deploy Convex functions"
  echo "  ./update-all.sh --env KEY VALUE           Set env var across all"
  echo "  ./update-all.sh --soul-sync               Sync SOUL.md to servers"
  echo "  ./update-all.sh --vercel-redeploy         Trigger Vercel rebuild"
  echo "  ./update-all.sh --agent-restart           Restart OpenClaw on servers"
  echo ""
  echo "Flags:"
  echo "  --dry-run                                 Preview without executing"
  exit 1
fi

echo ""
log "✅ Batch update complete — log saved to $LOG_FILE"
