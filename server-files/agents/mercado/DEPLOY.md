# Mercado — Deployment Guide

## Prerequisites

1. SSH access to server: `ssh -i ~/.ssh/LightsailKey.pem ubuntu@52.66.97.31`
2. A test phone number to bind to Mercado (your second phone, a friend's number, etc.)

---

## Step 1: Install Google Workspace CLI on server

```bash
ssh -i ~/.ssh/LightsailKey.pem ubuntu@52.66.97.31

# On the server:
npm install -g @googleworkspace/cli
gws auth setup
# Follow the interactive OAuth flow — authenticate with the Google account
# that has access to Google Sheets and Gmail
```

Verify it works:
```bash
gws sheets spreadsheets create --json '{"properties": {"title": "test-delete-me"}}'
# Should return a JSON with spreadsheetId — delete the sheet after
```

---

## Step 2: Create Mercado agent directory on server

```bash
mkdir -p ~/.openclaw/agents/mercado/agent
mkdir -p ~/.openclaw/agents/mercado/sessions
```

---

## Step 3: Sync files from local to server

Run these from your **local machine** (from the repo root):

```bash
# Sync Mercado agent files (SOUL.md, seed-data.sh, DEPLOY.md)
rsync -avz -e "ssh -i ~/.ssh/LightsailKey.pem" \
  "agent-orchestrator/server-files/agents/mercado/" \
  ubuntu@52.66.97.31:/home/ubuntu/.openclaw/workspace/agents/mercado/

# Update wakeup server (has "mercado" in VALID_AGENTS now)
scp -i ~/.ssh/LightsailKey.pem \
  "agent-orchestrator/server-files/agent-wakeup-server.js" \
  ubuntu@52.66.97.31:/home/ubuntu/agent-wakeup-server.js
```

---

## Step 4: Create and seed the Google Spreadsheet

```bash
ssh -i ~/.ssh/LightsailKey.pem ubuntu@52.66.97.31

# On the server:
cd /home/ubuntu/.openclaw/workspace/agents/mercado
chmod +x seed-data.sh
./seed-data.sh
```

This creates a spreadsheet with 4 tabs (Products, Customers, Orders, Quotation Log) and seeds 50 products, 12 customers, 30 order records.

**IMPORTANT:** The script outputs a Spreadsheet ID. Copy it.

---

## Step 5: Update SOUL.md with the real Spreadsheet ID

```bash
# On the server — replace the placeholder with the actual ID:
sed -i "s/SPREADSHEET_ID_PLACEHOLDER/YOUR_ACTUAL_SPREADSHEET_ID/g" \
  /home/ubuntu/.openclaw/workspace/agents/mercado/SOUL.md
```

---

## Step 6: Configure OpenClaw multi-agent routing

SSH into the server and edit `~/.openclaw/openclaw.json`.

You need to add Mercado to `agents.list` and add a peer binding so messages from your test phone go to Mercado instead of Kaze.

**Add Mercado to agents.list:**

```json5
// Inside agents.list array, add:
{
  id: "mercado",
  workspace: "~/.openclaw/workspace",
  agentDir: "~/.openclaw/agents/mercado/agent"
}
```

**Add WhatsApp peer binding:**

```json5
// Inside bindings array, add (BEFORE any catch-all binding):
{
  agentId: "mercado",
  match: {
    channel: "whatsapp",
    peer: { kind: "direct", id: "+91XXXXXXXXXX" }  // <-- your test phone number in E.164 format
  }
}
```

Replace `+91XXXXXXXXXX` with the actual test phone number (e.g., `+919876543210`).

**How it works:** Messages from that specific number go to Mercado. All other WhatsApp messages still go to Kaze (the default agent).

OpenClaw hot-reloads config — no gateway restart needed after editing.

**Verify routing:**
```bash
openclaw agents list --bindings
```

---

## Step 7: Restart wakeup server

```bash
ssh -i ~/.ssh/LightsailKey.pem ubuntu@52.66.97.31 \
  "fuser -k 3333/tcp 2>/dev/null; sleep 1; nohup node /home/ubuntu/agent-wakeup-server.js > /home/ubuntu/agent-wakeup.log 2>&1 &"
```

Verify:
```bash
curl http://52.66.97.31:3333/status | jq
# Should show "mercado" in the status output
```

---

## Step 8: Merge openclaw-config.json (agent model/session config)

The local `openclaw-config.json` now has a Mercado entry. Merge it into the server's `~/.openclaw/openclaw.json` under the agents config section (model, skills, session settings).

---

## Step 9: Test!

Send a WhatsApp message from your bound test phone number:

**Test 1 — Basic order (English):**
```
Need 50 3M N95 masks and 5 Bosch drill machines
```

**Test 2 — Hinglish:**
```
bhai 200 piece cable tie black wali chahiye aur 100 safety helmet
```

**Test 3 — Formal:**
```
Dear RacknSell team, please share quotation for:
1. Havells MCB 32A Double Pole - 20 nos
2. Finolex FR Wire 2.5mm 90m - 10 coils
3. Anchor Roma Switch 6A - 50 nos
```

**Expected flow:**
1. Your message goes to Mercado (not Kaze) via the peer binding
2. Mercado reads the products/customers/orders from Google Sheets
3. Mercado matches your phone to a customer (or escalates if not found)
4. Mercado applies pricing rules and formats a quotation
5. Mercado replies with the quotation text on WhatsApp
6. Mercado logs to the Quotation Log tab

---

## Troubleshooting

**Mercado not responding:**
```bash
# Check if agent is running
ps aux | grep "openclaw.*mercado"

# Check wakeup server logs
tail -50 /home/ubuntu/agent-wakeup.log

# Check Mercado session logs
ls -lt /home/ubuntu/.openclaw/agents/mercado/sessions/
tail -100 /tmp/mercado-*.log  # or wherever LOG_DIR points
```

**Message going to Kaze instead of Mercado:**
- Verify the phone number in the binding matches exactly (E.164 format: +91XXXXXXXXXX, no spaces)
- Run `openclaw agents list --bindings` to confirm routing
- Peer bindings are "most specific wins" — the peer binding should take priority over the default

**gws command failing:**
```bash
# Re-authenticate
gws auth setup

# Test directly
gws sheets spreadsheets values get --params '{"spreadsheetId": "YOUR_ID", "range": "Products!A1:A5"}'
```

**Session crash / context overflow:**
- Check if Mercado exceeded 15 tool calls — look at session log
- The SOUL.md has hard stop at turn 12 to prevent this

---

## Production Path

When moving to a dedicated server for RacknSell:

1. Spin up a new server instance
2. Install OpenClaw + `gws` CLI
3. Copy Mercado's SOUL.md (update spreadsheet ID or migrate to Elasticsearch)
4. Set up WhatsApp Business API with RacknSell's number
5. Mercado becomes the default (and only) agent — no peer bindings needed
6. Replace Google Sheets with Elasticsearch/CRM for the data layer
7. Add PDF quotation generation (pdfkit or wkhtmltopdf)
