#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# Provision an OpenClaw server on AWS Lightsail for a customer
#
# Usage: ./provision-server.sh <slug> [instance-size]
# Example: ./provision-server.sh acme small_2_0
# ─────────────────────────────────────────────────────────────

SLUG="${1:?Usage: ./provision-server.sh <slug> [instance-size]}"
INSTANCE_SIZE="${2:-small_2_0}" # 2GB RAM, 2 vCPU, $12/mo

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTANCE_NAME="valence-${SLUG}"
REGION="ap-south-1" # Mumbai — change per customer geography
AZ="${REGION}a"
KEY_PAIR_NAME="valence-${SLUG}-key"

echo "═══════════════════════════════════════════════════════"
echo "  Mission Control — Server Provisioning"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Customer: $SLUG"
echo "  Instance: $INSTANCE_NAME ($INSTANCE_SIZE)"
echo "  Region:   $REGION"
echo ""

# ── Step 1: Create Key Pair ─────────────────────────────────

echo "🔑 Step 1/5: Creating SSH key pair..."
KEY_FILE="$SCRIPT_DIR/keys/${KEY_PAIR_NAME}.pem"
mkdir -p "$SCRIPT_DIR/keys"

if [ -f "$KEY_FILE" ]; then
  echo "   Key already exists at $KEY_FILE"
else
  aws lightsail create-key-pair \
    --key-pair-name "$KEY_PAIR_NAME" \
    --region "$REGION" \
    --query 'privateKeyBase64' \
    --output text | base64 -d > "$KEY_FILE"
  chmod 600 "$KEY_FILE"
  echo "   Key saved to $KEY_FILE"
fi
echo ""

# ── Step 2: Launch Instance ─────────────────────────────────

echo "🖥️  Step 2/5: Launching Lightsail instance..."

# User data script to run on first boot
USERDATA=$(cat <<'BOOTSCRIPT'
#!/bin/bash
set -e

# System updates
apt-get update -y
apt-get upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install common tools
apt-get install -y git jq htop unzip

# Create openclaw directory structure
mkdir -p /home/ubuntu/.openclaw/workspace/agents/{kaze,scout,forge,ghost,sentinel}
mkdir -p /home/ubuntu/.openclaw/workspace/skills/mission-control
mkdir -p /home/ubuntu/.openclaw/agents/{kaze,scout,forge,ghost,sentinel}/sessions
chown -R ubuntu:ubuntu /home/ubuntu/.openclaw

# Install OpenClaw CLI (global)
npm install -g @anthropic/openclaw@latest || true

# Create a systemd service for OpenClaw gateway
cat > /etc/systemd/system/openclaw-agents.service <<EOF2
[Unit]
Description=OpenClaw Agent Gateway
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/.openclaw
ExecStart=/usr/bin/npx openclaw gateway start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=HOME=/home/ubuntu

[Install]
WantedBy=multi-user.target
EOF2

systemctl daemon-reload

echo "Bootstrap complete" > /home/ubuntu/bootstrap-done.txt
BOOTSCRIPT
)

aws lightsail create-instances \
  --instance-names "$INSTANCE_NAME" \
  --availability-zone "$AZ" \
  --blueprint-id "ubuntu_22_04" \
  --bundle-id "$INSTANCE_SIZE" \
  --key-pair-name "$KEY_PAIR_NAME" \
  --user-data "$USERDATA" \
  --region "$REGION" \
  --tags "key=customer,value=$SLUG" "key=service,value=mission-control" 2>&1 | tail -5

echo "   Instance '$INSTANCE_NAME' is launching..."
echo ""

# ── Step 3: Wait for Instance ───────────────────────────────

echo "⏳ Step 3/5: Waiting for instance to be ready..."
for i in $(seq 1 30); do
  STATE=$(aws lightsail get-instance \
    --instance-name "$INSTANCE_NAME" \
    --region "$REGION" \
    --query 'instance.state.name' \
    --output text 2>/dev/null || echo "pending")

  if [ "$STATE" = "running" ]; then
    break
  fi
  echo "   Status: $STATE (attempt $i/30)..."
  sleep 10
done

# Get the public IP
PUBLIC_IP=$(aws lightsail get-instance \
  --instance-name "$INSTANCE_NAME" \
  --region "$REGION" \
  --query 'instance.publicIpAddress' \
  --output text)

echo "   ✅ Instance running at $PUBLIC_IP"
echo ""

# ── Step 4: Open Firewall Ports ─────────────────────────────

echo "🔥 Step 4/5: Configuring firewall..."
aws lightsail open-instance-public-ports \
  --instance-name "$INSTANCE_NAME" \
  --region "$REGION" \
  --port-info fromPort=22,toPort=22,protocol=tcp 2>/dev/null || true

echo "   SSH port 22 open"
echo ""

# ── Step 5: Wait for Bootstrap ──────────────────────────────

echo "🔄 Step 5/5: Waiting for bootstrap script to complete..."
echo "   This may take 2-3 minutes..."

for i in $(seq 1 18); do
  DONE=$(ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 \
    -i "$KEY_FILE" "ubuntu@$PUBLIC_IP" \
    "cat /home/ubuntu/bootstrap-done.txt 2>/dev/null || echo 'not yet'" 2>/dev/null || echo "not yet")

  if [ "$DONE" = "Bootstrap complete" ]; then
    echo "   ✅ Bootstrap complete"
    break
  fi
  echo "   Still bootstrapping (attempt $i/18)..."
  sleep 10
done

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ Server provisioned!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  IP Address:  $PUBLIC_IP"
echo "  SSH:         ssh -i $KEY_FILE ubuntu@$PUBLIC_IP"
echo "  Key:         $KEY_FILE"
echo ""
echo "  Next steps:"
echo "  1. Deploy SOUL.md files:"
echo "     rsync -avz -e \"ssh -i $KEY_FILE\" \\"
echo "       agent-orchestrator/server-files/agents/ \\"
echo "       ubuntu@$PUBLIC_IP:/home/ubuntu/.openclaw/workspace/agents/"
echo ""
echo "  2. Set API key on the server:"
echo "     ssh -i $KEY_FILE ubuntu@$PUBLIC_IP"
echo "     echo 'MISSION_CONTROL_API_KEY=vk_live_xxx' >> ~/.openclaw/.env"
echo ""
echo "  3. Start OpenClaw agents:"
echo "     ssh -i $KEY_FILE ubuntu@$PUBLIC_IP 'openclaw start'"
echo ""

# Update customers.json with the IP
CUSTOMERS_FILE="$SCRIPT_DIR/customers.json"
if [ -f "$CUSTOMERS_FILE" ]; then
  jq "map(if .slug == \"$SLUG\" then .lightsailIp = \"$PUBLIC_IP\" | .lightsailInstance = \"$INSTANCE_NAME\" else . end)" \
    "$CUSTOMERS_FILE" > "${CUSTOMERS_FILE}.tmp"
  mv "${CUSTOMERS_FILE}.tmp" "$CUSTOMERS_FILE"
  echo "  Updated customers.json with IP $PUBLIC_IP"
fi
