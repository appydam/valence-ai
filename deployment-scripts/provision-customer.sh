#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# Provision a new enterprise customer for Mission Control
#
# Usage: ./provision-customer.sh <slug> <domain> <admin-email>
# Example: ./provision-customer.sh acme acme.valence.ai cto@acme.com
# ─────────────────────────────────────────────────────────────

SLUG="${1:?Usage: ./provision-customer.sh <slug> <domain> <admin-email>}"
DOMAIN="${2:?Missing domain (e.g. acme.valence.ai)}"
ADMIN_EMAIL="${3:?Missing admin email}"
PLAN="${4:-starter}" # Optional: starter | pro | enterprise

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
CUSTOMERS_FILE="$SCRIPT_DIR/customers.json"
ENV_TEMPLATE="$SCRIPT_DIR/env-template.convex"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "═══════════════════════════════════════════════════════"
echo "  Mission Control — Customer Provisioning"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Slug:   $SLUG"
echo "  Domain: $DOMAIN"
echo "  Admin:  $ADMIN_EMAIL"
echo "  Plan:   $PLAN"
echo ""

# ── Step 0: Validation ──────────────────────────────────────

# Check slug doesn't already exist
if [ -f "$CUSTOMERS_FILE" ] && jq -e ".[] | select(.slug == \"$SLUG\")" "$CUSTOMERS_FILE" > /dev/null 2>&1; then
  echo "❌ Customer '$SLUG' already exists in customers.json"
  exit 1
fi

# Check required tools
for cmd in npx jq aws; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "❌ Required tool '$cmd' not found. Please install it first."
    exit 1
  fi
done

echo "✅ Validation passed"
echo ""

# ── Step 1: Create Convex Project ───────────────────────────

CONVEX_PROJECT="valence-$SLUG"
echo "📦 Step 1/8: Creating Convex project '$CONVEX_PROJECT'..."

# Note: Convex doesn't have a CLI for project creation yet.
# You'll need to create the project manually in the dashboard,
# or use the Convex API when available.
echo "   ⚠️  Manual step: Create project '$CONVEX_PROJECT' at https://dashboard.convex.dev"
echo "   Press Enter when done..."
read -r

CONVEX_URL="https://${CONVEX_PROJECT}.convex.cloud"
CONVEX_SITE_URL="https://${CONVEX_PROJECT}.convex.site"
echo "   Convex URL: $CONVEX_URL"
echo ""

# ── Step 2: Deploy Schema + Functions ───────────────────────

echo "📤 Step 2/8: Deploying Convex functions..."
cd "$REPO_ROOT"
npx convex deploy --project "$CONVEX_PROJECT" --typecheck=disable 2>&1 | tail -3
echo ""

# ── Step 3: Set Environment Variables ───────────────────────

echo "🔧 Step 3/8: Setting environment variables..."

if [ -f "$ENV_TEMPLATE" ]; then
  while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue

    # Replace template variables
    value="${value//\{SLUG\}/$SLUG}"
    value="${value//\{DOMAIN\}/$DOMAIN}"
    value="${value//\{ADMIN_EMAIL\}/$ADMIN_EMAIL}"
    value="${value//\{CONVEX_SITE_URL\}/$CONVEX_SITE_URL}"

    echo "   Setting $key..."
    npx convex env set "$key" "$value" --project "$CONVEX_PROJECT" 2>/dev/null || true
  done < "$ENV_TEMPLATE"
else
  echo "   ⚠️  No env template found at $ENV_TEMPLATE"
  echo "   Set environment variables manually via: npx convex env set <KEY> <VALUE> --project $CONVEX_PROJECT"
fi

# Always set these
npx convex env set ALLOWED_ORIGIN "https://$DOMAIN" --project "$CONVEX_PROJECT" 2>/dev/null || true
echo ""

# ── Step 4: Seed Database ───────────────────────────────────

echo "🌱 Step 4/8: Seeding database..."
npx convex run seedCustomer:seedNewCustomer \
  "{\"companyName\": \"$SLUG\", \"adminEmail\": \"$ADMIN_EMAIL\"}" \
  --url "$CONVEX_URL" 2>&1 | tail -3

npx convex run billing:seedPlanLimits '{}' \
  --url "$CONVEX_URL" 2>&1 | tail -3
echo ""

# ── Step 5: Create Vercel Deployment ────────────────────────

echo "🚀 Step 5/8: Creating Vercel deployment..."
echo "   ⚠️  Manual step: Create Vercel project for '$DOMAIN'"
echo "   Set these env vars in Vercel:"
echo "     VITE_CONVEX_URL=$CONVEX_URL"
echo "     VITE_CONVEX_SITE_URL=$CONVEX_SITE_URL"
echo "     VITE_CLERK_PUBLISHABLE_KEY=<from Clerk dashboard>"
echo "   Press Enter when done..."
read -r
echo ""

# ── Step 6: Provision Lightsail Server ──────────────────────

echo "🖥️  Step 6/8: Provisioning Lightsail server..."
echo "   Run: ./provision-server.sh $SLUG"
echo "   Press Enter when done (or skip for now)..."
read -r

LIGHTSAIL_IP=""
echo "   Enter Lightsail IP (or press Enter to skip): "
read -r LIGHTSAIL_IP
echo ""

# ── Step 7: Add OAuth Callback URLs ────────────────────────

echo "🔗 Step 7/8: Adding OAuth callback URLs..."
CALLBACK_URL="$CONVEX_SITE_URL/api/integrations/oauth/callback"
echo "   Add this callback URL to all OAuth apps:"
echo "   $CALLBACK_URL"
echo ""

if [ -f "$SCRIPT_DIR/oauth-apps.json" ]; then
  echo "   OAuth apps to update:"
  jq -r 'keys[]' "$SCRIPT_DIR/oauth-apps.json" | while read -r provider; do
    echo "     - $provider"
  done
fi
echo ""

# ── Step 8: Register Customer ──────────────────────────────

echo "📝 Step 8/8: Registering customer..."

# Create customers.json if it doesn't exist
if [ ! -f "$CUSTOMERS_FILE" ]; then
  echo "[]" > "$CUSTOMERS_FILE"
fi

# Add customer entry
CUSTOMER_ENTRY=$(cat <<EOF
{
  "slug": "$SLUG",
  "domain": "$DOMAIN",
  "adminEmail": "$ADMIN_EMAIL",
  "plan": "$PLAN",
  "convexProject": "$CONVEX_PROJECT",
  "convexUrl": "$CONVEX_URL",
  "convexSiteUrl": "$CONVEX_SITE_URL",
  "lightsailIp": "$LIGHTSAIL_IP",
  "provisionedAt": "$TIMESTAMP",
  "status": "active"
}
EOF
)

jq --argjson entry "$CUSTOMER_ENTRY" '. += [$entry]' "$CUSTOMERS_FILE" > "${CUSTOMERS_FILE}.tmp"
mv "${CUSTOMERS_FILE}.tmp" "$CUSTOMERS_FILE"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ Customer '$SLUG' provisioned successfully!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Dashboard:    https://$DOMAIN"
echo "  Convex:       $CONVEX_URL"
echo "  Admin:        $ADMIN_EMAIL"
echo "  Server:       ${LIGHTSAIL_IP:-Not configured yet}"
echo ""
echo "  Next steps:"
echo "  1. Send admin invite link to $ADMIN_EMAIL"
echo "  2. Verify Vercel deployment at https://$DOMAIN"
echo "  3. Run provision-server.sh if not done"
echo "  4. Test full flow: login → onboarding → create task"
echo ""
