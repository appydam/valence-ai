#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# Batch update: redeploy Convex functions to all active customers
#
# Usage: ./update-all.sh [--functions-only | --env KEY VALUE]
# ─────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
CUSTOMERS_FILE="$SCRIPT_DIR/customers.json"

if [ ! -f "$CUSTOMERS_FILE" ]; then
  echo "❌ No customers.json found"
  exit 1
fi

MODE="${1:---functions-only}"

echo "═══════════════════════════════════════════════════════"
echo "  Mission Control — Batch Update"
echo "═══════════════════════════════════════════════════════"
echo ""

CUSTOMERS=$(jq -c '.[] | select(.status == "active")' "$CUSTOMERS_FILE")
COUNT=$(echo "$CUSTOMERS" | wc -l | tr -d ' ')
echo "  Active customers: $COUNT"
echo "  Mode: $MODE"
echo ""

if [ "$MODE" = "--functions-only" ]; then
  echo "Deploying Convex functions to all customers..."
  echo ""

  echo "$CUSTOMERS" | while IFS= read -r customer; do
    SLUG=$(echo "$customer" | jq -r '.slug')
    PROJECT=$(echo "$customer" | jq -r '.convexProject')

    echo "  📤 Deploying to $SLUG ($PROJECT)..."
    cd "$REPO_ROOT"
    npx convex deploy --project "$PROJECT" --typecheck=disable 2>&1 | tail -1
    echo "     ✅ Done"
  done

elif [ "$MODE" = "--env" ]; then
  KEY="${2:?Usage: ./update-all.sh --env KEY VALUE}"
  VALUE="${3:?Usage: ./update-all.sh --env KEY VALUE}"

  echo "Setting $KEY across all customers..."
  echo ""

  echo "$CUSTOMERS" | while IFS= read -r customer; do
    SLUG=$(echo "$customer" | jq -r '.slug')
    PROJECT=$(echo "$customer" | jq -r '.convexProject')

    echo "  🔧 $SLUG: Setting $KEY..."
    npx convex env set "$KEY" "$VALUE" --project "$PROJECT" 2>/dev/null || true
  done

elif [ "$MODE" = "--soul-sync" ]; then
  echo "Syncing SOUL.md files to all servers..."
  echo ""

  echo "$CUSTOMERS" | while IFS= read -r customer; do
    SLUG=$(echo "$customer" | jq -r '.slug')
    IP=$(echo "$customer" | jq -r '.lightsailIp')
    KEY_FILE="$SCRIPT_DIR/keys/valence-${SLUG}-key.pem"

    if [ -z "$IP" ] || [ "$IP" = "null" ] || [ "$IP" = "" ]; then
      echo "  ⚠️  $SLUG: No server IP, skipping"
      continue
    fi

    echo "  📁 $SLUG ($IP): Syncing agents..."
    rsync -avz -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
      "$REPO_ROOT/server-files/agents/" \
      "ubuntu@$IP:/home/ubuntu/.openclaw/workspace/agents/" 2>&1 | tail -1

    echo "  📁 $SLUG ($IP): Syncing skills..."
    rsync -avz -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
      "$REPO_ROOT/server-files/skills/" \
      "ubuntu@$IP:/home/ubuntu/.openclaw/workspace/skills/" 2>&1 | tail -1

    echo "     ✅ Done"
  done

else
  echo "Unknown mode: $MODE"
  echo "Usage:"
  echo "  ./update-all.sh --functions-only    Deploy Convex functions"
  echo "  ./update-all.sh --env KEY VALUE     Set env var across all"
  echo "  ./update-all.sh --soul-sync         Sync SOUL.md to servers"
  exit 1
fi

echo ""
echo "✅ Batch update complete"
