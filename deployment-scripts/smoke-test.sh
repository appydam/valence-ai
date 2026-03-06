#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# Smoke Test Suite for Mission Control
#
# Runs basic sanity checks against a customer deployment.
# Use after provisioning or after deploying updates.
#
# Usage: ./smoke-test.sh <slug>
# ─────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CUSTOMERS_FILE="$SCRIPT_DIR/customers.json"

SLUG="${1:-}"
if [ -z "$SLUG" ]; then
  echo "Usage: ./smoke-test.sh <slug>"
  exit 1
fi

if [ ! -f "$CUSTOMERS_FILE" ]; then
  echo "❌ No customers.json found"
  exit 1
fi

CUSTOMER=$(jq -c --arg slug "$SLUG" '.[] | select(.slug == $slug)' "$CUSTOMERS_FILE")
if [ -z "$CUSTOMER" ]; then
  echo "❌ Customer '$SLUG' not found in customers.json"
  exit 1
fi

DOMAIN=$(echo "$CUSTOMER" | jq -r '.domain')
CONVEX_SITE=$(echo "$CUSTOMER" | jq -r '.convexSiteUrl')
IP=$(echo "$CUSTOMER" | jq -r '.lightsailIp // empty')
KEY_FILE="$SCRIPT_DIR/keys/valence-${SLUG}-key.pem"

PASS=0
FAIL=0
WARN=0

echo "═══════════════════════════════════════════════════════"
echo "  Mission Control — Smoke Tests: $SLUG"
echo "═══════════════════════════════════════════════════════"
echo ""

# ── Helper ───────────────────────────────────────────────────
check() {
  local name="$1"
  local result="$2"  # pass | fail | warn
  local detail="${3:-}"

  if [ "$result" = "pass" ]; then
    echo "  ✅ $name"
    PASS=$((PASS + 1))
  elif [ "$result" = "warn" ]; then
    echo "  ⚠️  $name${detail:+ — $detail}"
    WARN=$((WARN + 1))
  else
    echo "  ❌ $name${detail:+ — $detail}"
    FAIL=$((FAIL + 1))
  fi
}

# ── 1. Frontend Loads ────────────────────────────────────────
echo "📡 Frontend"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  check "Vercel site returns 200" "pass"
else
  check "Vercel site returns 200" "fail" "Got HTTP $HTTP_CODE"
fi

# Check that HTML contains the app mount point
BODY=$(curl -s "https://$DOMAIN" 2>/dev/null || echo "")
if echo "$BODY" | grep -q 'id="root"'; then
  check "HTML contains React root element" "pass"
else
  check "HTML contains React root element" "warn" "No #root found — may be SSR or different structure"
fi

echo ""

# ── 2. Convex Health ─────────────────────────────────────────
echo "🔧 Convex Backend"
if [ -n "$CONVEX_SITE" ] && [ "$CONVEX_SITE" != "null" ]; then
  HEALTH=$(curl -s "$CONVEX_SITE/api/health" 2>/dev/null || echo '{"status":"unreachable"}')
  HEALTH_STATUS=$(echo "$HEALTH" | jq -r '.status // "unknown"' 2>/dev/null || echo "parse_error")

  if [ "$HEALTH_STATUS" = "healthy" ]; then
    check "Convex health endpoint" "pass"
  elif [ "$HEALTH_STATUS" = "degraded" ]; then
    MISSING=$(echo "$HEALTH" | jq -r '.vars[] | select(.set == false) | .name' 2>/dev/null | tr '\n' ', ')
    check "Convex health endpoint" "warn" "Degraded — missing: ${MISSING%, }"
  else
    check "Convex health endpoint" "fail" "Status: $HEALTH_STATUS"
  fi

  # Test heartbeat endpoint accepts POST
  HEARTBEAT=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{}' \
    "$CONVEX_SITE/api/heartbeat" 2>/dev/null || echo "000")
  if [ "$HEARTBEAT" = "401" ] || [ "$HEARTBEAT" = "200" ]; then
    check "Heartbeat endpoint reachable" "pass"
  else
    check "Heartbeat endpoint reachable" "fail" "Got HTTP $HEARTBEAT"
  fi

  # Test tasks API endpoint
  TASKS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET \
    "$CONVEX_SITE/api/tasks" 2>/dev/null || echo "000")
  if [ "$TASKS_CODE" = "401" ] || [ "$TASKS_CODE" = "200" ]; then
    check "Tasks API endpoint reachable" "pass"
  else
    check "Tasks API endpoint reachable" "fail" "Got HTTP $TASKS_CODE"
  fi
else
  check "Convex site URL configured" "fail" "No convexSiteUrl in customers.json"
fi

echo ""

# ── 3. SSH Proxy ─────────────────────────────────────────────
echo "🔗 SSH Proxy"
SSH_PROXY_HEALTH=$(curl -s "https://ssh-proxy-service-production.up.railway.app/health" 2>/dev/null || echo '{}')
SSH_PROXY_OK=$(echo "$SSH_PROXY_HEALTH" | jq -r '.ok // false' 2>/dev/null || echo "false")
if [ "$SSH_PROXY_OK" = "true" ]; then
  check "SSH proxy service healthy" "pass"
else
  check "SSH proxy service healthy" "fail" "Service unreachable or unhealthy"
fi

echo ""

# ── 4. Agent Server ──────────────────────────────────────────
echo "🖥️  Agent Server"
if [ -n "$IP" ] && [ "$IP" != "null" ]; then
  # Test SSH connectivity
  if ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=10 "ubuntu@$IP" "echo ok" &>/dev/null; then
    check "SSH connectivity" "pass"

    # Check OpenClaw installed
    OPENCLAW_VERSION=$(ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "ubuntu@$IP" \
      "npx openclaw --version 2>/dev/null || echo 'not found'" 2>/dev/null)
    if echo "$OPENCLAW_VERSION" | grep -qv "not found"; then
      check "OpenClaw CLI installed" "pass"
    else
      check "OpenClaw CLI installed" "fail" "openclaw CLI not found"
    fi

    # Check SOUL files
    SOUL_COUNT=$(ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "ubuntu@$IP" \
      "find /home/ubuntu/.openclaw/workspace -name 'SOUL.md' 2>/dev/null | wc -l" 2>/dev/null || echo "0")
    if [ "$SOUL_COUNT" -ge 1 ]; then
      check "SOUL files present ($SOUL_COUNT found)" "pass"
    else
      check "SOUL files present" "fail" "No SOUL.md files found"
    fi

    # Check agent processes
    AGENT_PROCS=$(ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "ubuntu@$IP" \
      "ps aux | grep -c '[o]penclaw' || echo 0" 2>/dev/null || echo "0")
    if [ "$AGENT_PROCS" -ge 1 ]; then
      check "OpenClaw processes running ($AGENT_PROCS)" "pass"
    else
      check "OpenClaw processes running" "warn" "No openclaw processes — agents may be idle"
    fi

    # Check env file
    ENV_EXISTS=$(ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "ubuntu@$IP" \
      "test -f /home/ubuntu/.openclaw/.env && echo yes || echo no" 2>/dev/null || echo "no")
    if [ "$ENV_EXISTS" = "yes" ]; then
      check "Environment file exists" "pass"
    else
      check "Environment file exists" "warn" "No .env file — agents may not authenticate"
    fi

    # Check disk space
    DISK_USAGE=$(ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "ubuntu@$IP" \
      "df -h / | tail -1 | awk '{print \$5}' | tr -d '%'" 2>/dev/null || echo "0")
    if [ "$DISK_USAGE" -lt 80 ]; then
      check "Disk usage (${DISK_USAGE}%)" "pass"
    elif [ "$DISK_USAGE" -lt 90 ]; then
      check "Disk usage (${DISK_USAGE}%)" "warn" "Getting full"
    else
      check "Disk usage (${DISK_USAGE}%)" "fail" "Critical — ${DISK_USAGE}% used"
    fi

  else
    check "SSH connectivity" "fail" "Cannot connect to $IP"
  fi
else
  check "Agent server" "warn" "No Lightsail IP — on-prem or not provisioned"
fi

echo ""

# ── Summary ──────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════"
echo "  Results: ✅ $PASS passed  ❌ $FAIL failed  ⚠️  $WARN warnings"
echo "═══════════════════════════════════════════════════════"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
