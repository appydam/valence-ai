# Mission Control — Deployment Runbook

> For operators provisioning and managing customer deployments.
> Last updated: 2026-03-05

---

## Architecture Overview

Each customer gets an isolated stack:
- **Convex project** — database + serverless backend
- **Vercel app** — React frontend
- **Lightsail server** (cloud) OR **customer-hosted server** (on-prem) — OpenClaw agents

Central shared services:
- **SSH Proxy** — Railway-hosted, relays commands to agent servers
- **Agent Wakeup Server** — Railway-hosted, triggers agent wake via SSH
- **Clerk** — Auth provider (shared instance, per-customer config)

---

## 1. Cloud Provisioning (New Customer)

### Prerequisites
- AWS CLI configured (`aws lightsail` access)
- Vercel CLI (`npm i -g vercel`)
- Convex CLI (`npx convex`)
- Access to Convex dashboard, Vercel dashboard, Clerk dashboard

### Step-by-step

```bash
# 1. Run the provisioning script
cd agent-orchestrator/deployment-scripts
./provision-customer.sh <slug> <domain> <admin-email> [plan]

# Example:
./provision-customer.sh acme acme.valence.ai cto@acme.com pro
```

The script will walk you through:

| Step | Action | Type |
|------|--------|------|
| 1 | Create Convex project | Manual (dashboard) |
| 2 | Deploy schema + functions | Automatic |
| 3 | Set environment variables | Automatic (from env-template.convex) |
| 4 | Seed database | Automatic |
| 5 | Create Vercel deployment | Manual (dashboard) |
| 6 | Provision Lightsail server | Semi-automatic |
| 7 | Add OAuth callback URLs | Manual |
| 8 | Register in customers.json | Automatic |

### Manual Steps Detail

**Step 1 — Convex Project:**
1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Create new project named `valence-<slug>`
3. Copy the deployment URL (e.g., `https://valence-acme.convex.cloud`)
4. Paste into the provisioning script when prompted

**Step 5 — Vercel App:**
1. Go to [Vercel Dashboard](https://vercel.com)
2. Import the `agent-orchestrator` repo
3. Set environment variables:
   - `VITE_CONVEX_URL` = Convex deployment URL
   - `VITE_CONVEX_SITE_URL` = Convex site URL (`.convex.site`)
   - `VITE_CLERK_PUBLISHABLE_KEY` = Clerk publishable key
   - `VITE_SENTRY_DSN` = Sentry DSN (optional)
4. Set custom domain to `<slug>.valence.ai`

**Step 7 — OAuth Callbacks:**
For each OAuth provider the customer will use, add callback URL:
```
https://<convex-site-url>/api/integrations/oauth/callback
```

### Post-Provision Verification

```bash
./verify-customer.sh <slug>
```

Checks: Vercel site (HTTP 200), Convex health, SSH proxy, Lightsail SSH + OpenClaw + SOUL files.

---

## 2. On-Prem Provisioning (Customer Hosts Agent Server)

Same as cloud provisioning but skip Step 6 (Lightsail):

```bash
./provision-customer.sh acme acme.valence.ai cto@acme.com --no-server
```

Then provide the customer with the install command:

```bash
curl -fsSL https://your-domain/install.sh | bash -s -- \
  --api-key <their-api-key> \
  --convex-url <their-convex-http-url> \
  --anthropic-key <their-anthropic-key>
```

Or have them run `install-agent-server.sh` directly. See `ON-PREM-GUIDE.md` for customer-facing instructions.

After customer sets up their server:
1. Customer enters their server IP in Settings → SSH Config
2. Dashboard tests connectivity
3. Agents start appearing in heartbeat

---

## 3. Updating All Customers

```bash
cd deployment-scripts

# Deploy Convex functions to all active customers
./update-all.sh --functions-only

# Preview what would happen (no changes)
./update-all.sh --dry-run --functions-only

# Set an env var across all customers
./update-all.sh --env ANTHROPIC_API_KEY sk-ant-xxx

# Sync SOUL.md files to all servers
./update-all.sh --soul-sync

# Trigger Vercel rebuild for all
./update-all.sh --vercel-redeploy

# Restart OpenClaw agents on all servers
./update-all.sh --agent-restart
```

All runs are logged to `deployment-scripts/logs/update_YYYYMMDD_HHMMSS.log`.

---

## 4. Environment Variables

### Per-Customer (Convex)

| Variable | Source | Notes |
|----------|--------|-------|
| `ALLOWED_ORIGIN` | `https://<domain>` | CORS |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk dashboard | Shared across customers |
| `ANTHROPIC_API_KEY` | Anthropic dashboard | For doc scraper |
| `INTEGRATION_ENCRYPTION_KEY` | Auto-generated | AES-256-GCM master key |
| `SSH_PROXY_URL` | Railway deployment URL | Shared |
| `SSH_PROXY_SECRET` | Auto-generated | Must match SSH proxy env |
| `AGENT_WAKEUP_WEBHOOK_URL` | Railway deployment URL | Shared |
| `AGENT_WAKEUP_WEBHOOK_SECRET` | Auto-generated | Must match wakeup server env |

### Per-Customer (Vercel)

| Variable | Source |
|----------|--------|
| `VITE_CONVEX_URL` | Convex deployment URL |
| `VITE_CONVEX_SITE_URL` | Convex site URL |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk dashboard |
| `VITE_SENTRY_DSN` | Sentry project DSN (optional) |

### SSH Proxy (Railway)

| Variable | Notes |
|----------|-------|
| `SSH_PROXY_SECRET` | Bearer token for auth |
| `PORT` | Default 3001 |

---

## 5. Common Failures & Fixes

### Agent Not Heartbeating

1. SSH into server: `ssh -i keys/valence-<slug>-key.pem ubuntu@<ip>`
2. Check process: `ps aux | grep openclaw`
3. Check logs: `journalctl -u openclaw-agents -n 50` or `tail -50 /tmp/openclaw-restart.log`
4. Restart: `sudo systemctl restart openclaw-agents` or `npx openclaw gateway start`

### Agent Session Crash (Recovery Loop)

**Symptom:** "Session recovery" spam on a task.

1. Find corrupt session:
   ```bash
   ls -lt /home/ubuntu/.openclaw/agents/<agent>/sessions/
   ```
2. Kill holding process:
   ```bash
   ps aux | grep openclaw-agent
   kill -9 <pid>
   ```
3. Delete corrupt session file + lock:
   ```bash
   rm /home/ubuntu/.openclaw/agents/<agent>/sessions/<file>.jsonl
   rm -f /home/ubuntu/.openclaw/agents/<agent>/sessions/<file>.jsonl.lock
   ```
4. Re-wake agent:
   ```bash
   npx convex run agentWakeup:triggerWakeup \
     '{"agentName": "X", "taskId": "...", "reason": "continue_work"}' \
     --url https://<customer-convex>.convex.cloud
   ```

### Convex Deploy Fails

- Ensure you're deploying to the correct project: `--project valence-<slug>`
- Use `--typecheck=disable` if TS errors are non-blocking
- Check Convex dashboard logs for function errors

### Vercel Build Fails

- Check build logs in Vercel dashboard
- Ensure all `VITE_*` env vars are set
- Common: missing `VITE_CONVEX_URL` causes blank page

### SSH Proxy Returns 401

- Verify `SSH_PROXY_SECRET` matches between Convex env and Railway env
- Check Railway logs: `railway logs`
- If all callers migrated to Convex proxy endpoints, auth is required

### OAuth Token Refresh Failing

- Check cron job `refresh-expiring-tokens` in Convex dashboard → Functions → Crons
- Verify `OAUTH_SECRET_<SLUG>` env var is set for the provider
- Check `connections` table for the user's connection status

---

## 6. Agent Crash Recovery Playbook

### Root Causes
- Sessions crash after ~84 tool calls / 10 min timeout
- Anthropic rate limits mid-session → broken `tool_use_id` in context
- Mitigated in SOUL.md: "hard stop at turn 15, post partial results"
- Most affected: Forge (large builds), Scout (web research loops)

### Quick Recovery
```bash
# SSH into server
ssh -i keys/valence-<slug>-key.pem ubuntu@<ip>

# Check all agent statuses
for agent in kaze scout forge ghost sentinel; do
  echo "=== $agent ==="
  ls -lt /home/ubuntu/.openclaw/agents/$agent/sessions/ 2>/dev/null | head -3
done

# Restart all agents
sudo systemctl restart openclaw-agents
```

### web_search Broken
Gemini key quota exhausted. Agents use `web_fetch` with DuckDuckGo API, HackerNews Algolia, Wikipedia, GitHub search instead. Fixed in Scout's SOUL.md.

---

## 7. Customer Teardown

```bash
# 1. Remove from customers.json (set status: "inactive")
# 2. Delete Lightsail instance
aws lightsail delete-instance --instance-name valence-<slug>

# 3. Delete Lightsail key pair
aws lightsail delete-key-pair --key-pair-name valence-<slug>-key

# 4. Remove local key file
rm keys/valence-<slug>-key.pem

# 5. Delete Convex project (dashboard)
# 6. Delete Vercel app (dashboard)
```

---

## 8. Cron Jobs Reference

| Job | Interval | Function | Purpose |
|-----|----------|----------|---------|
| refresh-expiring-tokens | Hourly @ :00 | tokenRefresh.refreshExpiringTokens | OAuth token refresh |
| kaze-review-sweep | 2 hours | tasks.reviewSweep | Unstick in_review tasks |
| assigned-task-sweep | 10 min | agentWakeupSweep.sweep | Catch stuck assigned/in_progress |
| memory-archive-stale | Daily @ 3:00 UTC | agentMemory.archiveStale | Expire TTL memories |
| soul-distillation-weekly | Sunday @ 2:00 UTC | soulDistillation.distillAllAgents | Evolve SOUL files |
| sentinel-review-sweep | 2 min | tasks.sentinelReviewSweep | Fast Sentinel wakeup |
| inbox-triage-sweep | 30 min | tasks.inboxTriageSweep | Auto-delegate inbox tasks |
| usage-counter-rotation | Monthly 1st @ 00:05 | billing.rotateUsageCounters | Reset billing counters |
| webhook-retry-failed | 5 min | webhookReceiver.retryFailed | Retry failed webhooks (3x max) |

---

## 9. Monitoring

### Health Endpoints
- **Convex:** `GET https://<convex-site-url>/api/health`
- **SSH Proxy:** `GET https://<ssh-proxy-url>/health`
- **Vercel:** `GET https://<domain>/`

### Sentry
- Error tracking enabled per customer (conditional on `VITE_SENTRY_DSN`)
- Alerts configured in Sentry dashboard → Alerts → Slack integration

### UptimeRobot
- Monitor each customer's 3 endpoints above
- Free tier: 50 monitors, 5-min check intervals
- Alerts: Slack + email

---

## 10. Server File Sync

Agent SOUL files and skills live in the repo at `server-files/` and must be synced to each server:

```bash
# Sync all agent SOUL files
rsync -avz -e "ssh -i keys/valence-<slug>-key.pem" \
  ../server-files/agents/ \
  ubuntu@<ip>:/home/ubuntu/.openclaw/workspace/agents/

# Sync Kaze's root SOUL.md (special — lives at workspace root)
scp -i keys/valence-<slug>-key.pem \
  ../server-files/SOUL.md \
  ubuntu@<ip>:/home/ubuntu/.openclaw/workspace/SOUL.md

# Sync skills
rsync -avz -e "ssh -i keys/valence-<slug>-key.pem" \
  ../server-files/skills/ \
  ubuntu@<ip>:/home/ubuntu/.openclaw/workspace/skills/
```

Or use `./update-all.sh --soul-sync` to sync all customers at once.
