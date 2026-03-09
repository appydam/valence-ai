#!/bin/bash
# ============================================================
# Migrate to Production Deployment
# ============================================================
# This script copies all env vars from dev → prod deployment
# and deploys functions to production.
#
# SAFE: Does NOT touch the dev deployment.
# The --prod flag targets only the production deployment.
#
# Usage: bash deployment-scripts/migrate-to-prod.sh
# Run from: agent-orchestrator/ directory
# ============================================================

set -euo pipefail

echo "================================================"
echo "  Migrate to Convex Production Deployment"
echo "================================================"
echo ""

# Step 1: Read all env vars from dev
echo "[1/3] Reading env vars from dev deployment..."
ENV_VARS=$(npx convex env list 2>/dev/null)

if [ -z "$ENV_VARS" ]; then
  echo "ERROR: Could not read env vars from dev. Are you in the right directory?"
  exit 1
fi

echo "  Found $(echo "$ENV_VARS" | wc -l | tr -d ' ') env vars on dev."
echo ""

# Step 2: Set each env var on prod
echo "[2/3] Copying env vars to production deployment..."
echo ""

FAILED=0
SUCCESS=0

while IFS='=' read -r KEY VALUE; do
  # Skip empty lines
  [ -z "$KEY" ] && continue

  # Skip ANTHROPIC_API_KEY if empty (was accidentally blanked)
  if [ "$KEY" = "ANTHROPIC_API_KEY" ] && [ -z "$VALUE" ]; then
    echo "  ⚠  SKIPPING $KEY (empty — set it manually)"
    continue
  fi

  echo -n "  Setting $KEY... "
  if npx convex env set "$KEY" "$VALUE" --prod 2>/dev/null; then
    echo "✓"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "✗ FAILED"
    FAILED=$((FAILED + 1))
  fi
done <<< "$ENV_VARS"

echo ""
echo "  Done: $SUCCESS set, $FAILED failed."
echo ""

# Step 3: Deploy functions to prod
echo "[3/3] Deploying functions to production..."
echo ""
npx convex deploy --cmd 'echo "skip-frontend-build"'

echo ""
echo "================================================"
echo "  Migration complete!"
echo "================================================"
echo ""
echo "MANUAL STEPS REMAINING:"
echo "  1. Set ANTHROPIC_API_KEY on prod:"
echo "     npx convex env set ANTHROPIC_API_KEY <your-key> --prod"
echo ""
echo "  2. Set CONVEX_SITE_URL on prod (after custom domain setup):"
echo "     npx convex env set CONVEX_SITE_URL https://auth.usevalence.ai --prod"
echo ""
echo "  3. Add custom domain in Convex Dashboard:"
echo "     Dashboard → Production → Settings → Custom Domains → auth.usevalence.ai"
echo ""
