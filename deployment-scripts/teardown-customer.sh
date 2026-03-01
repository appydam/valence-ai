#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# Tear down a customer deployment (clean removal)
#
# Usage: ./teardown-customer.sh <slug>
# ─────────────────────────────────────────────────────────────

SLUG="${1:?Usage: ./teardown-customer.sh <slug>}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CUSTOMERS_FILE="$SCRIPT_DIR/customers.json"

if [ ! -f "$CUSTOMERS_FILE" ]; then
  echo "❌ No customers.json found"
  exit 1
fi

CUSTOMER=$(jq -c ".[] | select(.slug == \"$SLUG\")" "$CUSTOMERS_FILE")
if [ -z "$CUSTOMER" ]; then
  echo "❌ Customer '$SLUG' not found in customers.json"
  exit 1
fi

DOMAIN=$(echo "$CUSTOMER" | jq -r '.domain')
PROJECT=$(echo "$CUSTOMER" | jq -r '.convexProject')
IP=$(echo "$CUSTOMER" | jq -r '.lightsailIp // empty')
INSTANCE=$(echo "$CUSTOMER" | jq -r '.lightsailInstance // empty')

echo "═══════════════════════════════════════════════════════"
echo "  ⚠️  TEARDOWN: $SLUG"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Domain:    $DOMAIN"
echo "  Convex:    $PROJECT"
echo "  Server:    ${IP:-Not configured}"
echo ""
echo "  This will PERMANENTLY DELETE:"
echo "    - Lightsail instance ($INSTANCE)"
echo "    - SSH key pair"
echo "    - Customer registry entry"
echo ""
echo "  It will NOT delete (manual cleanup needed):"
echo "    - Convex project ($PROJECT)"
echo "    - Vercel deployment ($DOMAIN)"
echo "    - Stripe subscription"
echo "    - OAuth callback URLs"
echo ""
echo -n "  Type 'DELETE $SLUG' to confirm: "
read -r CONFIRM

if [ "$CONFIRM" != "DELETE $SLUG" ]; then
  echo "  Aborted."
  exit 1
fi

echo ""

# ── Step 1: Delete Lightsail instance ───────────────────────

if [ -n "$INSTANCE" ] && [ "$INSTANCE" != "null" ]; then
  REGION=$(aws lightsail get-instance \
    --instance-name "$INSTANCE" \
    --query 'instance.location.regionName' \
    --output text 2>/dev/null || echo "")

  if [ -n "$REGION" ]; then
    echo "🗑️  Deleting Lightsail instance '$INSTANCE'..."
    aws lightsail delete-instance --instance-name "$INSTANCE" --region "$REGION" 2>/dev/null || true
    echo "   ✅ Instance deleted"

    echo "🔑 Deleting key pair..."
    aws lightsail delete-key-pair --key-pair-name "valence-${SLUG}-key" --region "$REGION" 2>/dev/null || true
    rm -f "$SCRIPT_DIR/keys/valence-${SLUG}-key.pem"
    echo "   ✅ Key pair deleted"
  else
    echo "   ⚠️  Instance not found in AWS (may already be deleted)"
  fi
fi

echo ""

# ── Step 2: Mark as inactive in customers.json ─────────────

echo "📝 Updating customers.json..."
jq "map(if .slug == \"$SLUG\" then .status = \"deleted\" | .deletedAt = \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\" else . end)" \
  "$CUSTOMERS_FILE" > "${CUSTOMERS_FILE}.tmp"
mv "${CUSTOMERS_FILE}.tmp" "$CUSTOMERS_FILE"
echo "   ✅ Marked as deleted"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ Teardown complete for '$SLUG'"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Manual cleanup still needed:"
echo "  1. Delete Convex project: https://dashboard.convex.dev"
echo "  2. Remove Vercel deployment"
echo "  3. Cancel Stripe subscription"
echo "  4. Remove OAuth callback URL from OAuth apps"
echo ""
