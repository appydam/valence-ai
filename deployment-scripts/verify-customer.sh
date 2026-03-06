#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# Post-provisioning health check for a customer deployment
#
# Usage: ./verify-customer.sh <slug>
# Example: ./verify-customer.sh acme
# ─────────────────────────────────────────────────────────────

SLUG="${1:?Usage: ./verify-customer.sh <slug>}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CUSTOMERS_FILE="$SCRIPT_DIR/customers.json"

if [ ! -f "$CUSTOMERS_FILE" ]; then
  echo "❌ No customers.json found"
  exit 1
fi

# Look up customer
CUSTOMER=$(jq -c ".[] | select(.slug == \"$SLUG\")" "$CUSTOMERS_FILE")
if [ -z "$CUSTOMER" ]; then
  echo "❌ Customer '$SLUG' not found in customers.json"
  exit 1
fi

DOMAIN=$(echo "$CUSTOMER" | jq -r '.domain')
CONVEX_URL=$(echo "$CUSTOMER" | jq -r '.convexSiteUrl // empty')
LIGHTSAIL_IP=$(echo "$CUSTOMER" | jq -r '.lightsailIp // empty')
KEY_FILE="$SCRIPT_DIR/keys/valence-${SLUG}-key.pem"

PASS=0
FAIL=0
WARN=0

echo "═══════════════════════════════════════════════════════"
echo "  Mission Control — Customer Health Check"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Customer: $SLUG"
echo "  Domain:   $DOMAIN"
echo ""

# ── Check 1: Vercel site ────────────────────────────────
echo -n "  1. Vercel site ($DOMAIN)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ HTTP $HTTP_CODE"
  PASS=$((PASS + 1))
else
  echo "❌ HTTP $HTTP_CODE"
  FAIL=$((FAIL + 1))
fi

# ── Check 2: Convex health endpoint ─────────────────────
if [ -n "$CONVEX_URL" ]; then
  echo -n "  2. Convex health ($CONVEX_URL)... "
  HEALTH=$(curl -s "$CONVEX_URL/api/health" 2>/dev/null || echo '{"status":"unreachable"}')
  STATUS=$(echo "$HEALTH" | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
  if [ "$STATUS" = "healthy" ]; then
    echo "✅ $STATUS"
    PASS=$((PASS + 1))
  elif [ "$STATUS" = "degraded" ]; then
    echo "⚠️  $STATUS (optional env vars missing)"
    WARN=$((WARN + 1))
  else
    echo "❌ $STATUS"
    FAIL=$((FAIL + 1))
  fi
else
  echo "  2. Convex health... ⏭️  Skipped (no convexSiteUrl in customers.json)"
  WARN=$((WARN + 1))
fi

# ── Check 3: SSH Proxy health ───────────────────────────
echo -n "  3. SSH Proxy service... "
PROXY_HEALTH=$(curl -s "https://ssh-proxy-service-production.up.railway.app/health" 2>/dev/null || echo '{"ok":false}')
PROXY_OK=$(echo "$PROXY_HEALTH" | jq -r '.ok // false' 2>/dev/null || echo "false")
if [ "$PROXY_OK" = "true" ]; then
  echo "✅ Running"
  PASS=$((PASS + 1))
else
  echo "❌ Not reachable"
  FAIL=$((FAIL + 1))
fi

# ── Check 4: Lightsail SSH ──────────────────────────────
if [ -n "$LIGHTSAIL_IP" ] && [ "$LIGHTSAIL_IP" != "null" ]; then
  echo -n "  4. Lightsail SSH ($LIGHTSAIL_IP)... "
  if [ -f "$KEY_FILE" ]; then
    SSH_OK=$(ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -o BatchMode=yes \
      -i "$KEY_FILE" "ubuntu@$LIGHTSAIL_IP" "echo ok" 2>/dev/null || echo "fail")
    if [ "$SSH_OK" = "ok" ]; then
      echo "✅ Connected"
      PASS=$((PASS + 1))

      # Sub-check: OpenClaw installed?
      echo -n "  4a. OpenClaw installed... "
      OC_VERSION=$(ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" "ubuntu@$LIGHTSAIL_IP" \
        "npx openclaw --version 2>/dev/null || echo 'not found'" 2>/dev/null || echo "error")
      if [ "$OC_VERSION" != "not found" ] && [ "$OC_VERSION" != "error" ]; then
        echo "✅ $OC_VERSION"
        PASS=$((PASS + 1))
      else
        echo "❌ Not installed"
        FAIL=$((FAIL + 1))
      fi

      # Sub-check: SOUL files present?
      echo -n "  4b. SOUL files... "
      SOUL_COUNT=$(ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" "ubuntu@$LIGHTSAIL_IP" \
        "find ~/.openclaw/workspace -name 'SOUL.md' 2>/dev/null | wc -l" 2>/dev/null || echo "0")
      SOUL_COUNT=$(echo "$SOUL_COUNT" | tr -d '[:space:]')
      if [ "$SOUL_COUNT" -ge 1 ]; then
        echo "✅ $SOUL_COUNT files found"
        PASS=$((PASS + 1))
      else
        echo "⚠️  No SOUL files — run update-all.sh --soul-sync"
        WARN=$((WARN + 1))
      fi
    else
      echo "❌ Cannot connect"
      FAIL=$((FAIL + 1))
    fi
  else
    echo "⚠️  Key file not found at $KEY_FILE"
    WARN=$((WARN + 1))
  fi
else
  echo "  4. Lightsail SSH... ⏭️  Skipped (no server — on-prem customer?)"
  WARN=$((WARN + 1))
fi

# ── Summary ─────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Results: ✅ $PASS passed  ❌ $FAIL failed  ⚠️  $WARN warnings"
echo "═══════════════════════════════════════════════════════"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
