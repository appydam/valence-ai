# Deployment Guide - CI/CD Pipeline Setup

**Created:** 2026-02-10  
**Author:** Forge 🔨  
**For:** crypto-regulatory-tracker and agent services

---

## Quick Start

### Prerequisites

- GitHub account with repo access
- Railway account (free tier works)
- Discord webhook URL (optional, for notifications)

### Setup Time: ~15 minutes

---

## Step 1: Railway Setup (5 min)

### Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `appydam/crypto-regulatory-tracker`
4. Railway will auto-detect Node.js and create a service

### Configure Environment Variables

In Railway dashboard → Variables:

```
NODE_ENV=production
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-key>
ANTHROPIC_API_KEY=<your-anthropic-key>
RESEND_API_KEY=<your-resend-key>
PORT=3000
```

### Get Railway Webhook URLs

1. Click Settings → Webhooks
2. Create two webhooks:
   - **Staging**: Note the URL (for GitHub secret `RAILWAY_WEBHOOK_STAGING`)
   - **Production**: Note the URL (for GitHub secret `RAILWAY_WEBHOOK_PROD`)

### Generate Public URL

1. In Railway → Settings → Domains
2. Click "Generate Domain"
3. Note the URL (e.g., `crypto-tracker.up.railway.app`)

---

## Step 2: GitHub Secrets Setup (5 min)

### Add Secrets to Repository

Go to GitHub repo → Settings → Secrets and variables → Actions → New repository secret

**Required secrets:**

```bash
# Railway
RAILWAY_WEBHOOK_STAGING=<webhook-url-from-railway-staging>
RAILWAY_WEBHOOK_PROD=<webhook-url-from-railway-production>
RAILWAY_ROLLBACK_WEBHOOK=<optional-rollback-webhook>

# URLs for health checks
STAGING_URL=https://crypto-tracker-staging.up.railway.app
PRODUCTION_URL=https://crypto-tracker.up.railway.app

# API Keys (same as Railway env vars)
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-key>
ANTHROPIC_API_KEY=<your-anthropic-key>
RESEND_API_KEY=<your-resend-key>

# Notifications (optional)
DISCORD_WEBHOOK=<your-discord-webhook-url>
```

### Quick Add via GitHub CLI

```bash
# Install GitHub CLI if needed
brew install gh  # macOS
# or: sudo apt install gh  # Linux

# Login
gh auth login

# Add secrets (one by one)
gh secret set RAILWAY_WEBHOOK_STAGING
gh secret set RAILWAY_WEBHOOK_PROD
gh secret set STAGING_URL
gh secret set PRODUCTION_URL
gh secret set SUPABASE_URL
gh secret set SUPABASE_ANON_KEY
gh secret set ANTHROPIC_API_KEY
gh secret set RESEND_API_KEY
gh secret set DISCORD_WEBHOOK
```

---

## Step 3: Add Workflow Files (3 min)

### Copy Workflow to Repository

```bash
# In crypto-regulatory-tracker repo
mkdir -p .github/workflows

# Copy the deployment workflow
cp /path/to/ci-cd-workflows/.github-workflows-deploy.yml \
   .github/workflows/deploy.yml

# Copy Railway config
cp /path/to/ci-cd-workflows/railway.json \
   railway.json

# Commit and push
git add .github/workflows/deploy.yml railway.json
git commit -m "feat: Add CI/CD pipeline"
git push origin main
```

---

## Step 4: Test Deployment (2 min)

### Trigger Manual Deployment

1. Go to GitHub → Actions tab
2. Select "Deploy Crypto Regulatory Tracker"
3. Click "Run workflow" → Run workflow
4. Watch the deployment progress

### Expected Flow

```
1. Test ✅        (runs unit tests and linting)
2. Build ✅       (compiles TypeScript)
3. Deploy Staging ✅  (deploys to staging Railway)
4. Deploy Production ✅  (deploys to production Railway)
5. Smoke Test ✅  (validates deployment)
```

### Verify Deployment

```bash
# Check health endpoint
curl https://crypto-tracker.up.railway.app/health

# Expected response:
# {"status":"ok","timestamp":"2026-02-10T15:30:00.000Z"}

# Check scraper status
curl https://crypto-tracker.up.railway.app/api/scrape/status

# Expected response:
# {"ok":true,"lastRun":"2026-02-10T12:00:00.000Z","sources":5}
```

---

## Discord Notifications Setup (Optional)

### Create Discord Webhook

1. Open Discord server settings
2. Integrations → Webhooks → New Webhook
3. Name it "CI/CD Bot"
4. Copy webhook URL
5. Add as GitHub secret: `DISCORD_WEBHOOK`

### Notification Format

**On successful deployment:**
```
🚀 Production Deployment
crypto-regulatory-tracker

Status: success
Commit: `a1b2c3d`
Author: forge
URL: https://crypto-tracker.up.railway.app
```

**On failed deployment:**
```
❌ Production Deployment
crypto-regulatory-tracker

Status: failure
Commit: `a1b2c3d`
Author: forge
```

---

## Health Check Endpoints

### Add to crypto-regulatory-tracker

Create `src/health.ts`:

```typescript
import express from 'express';

export function setupHealthEndpoints(app: express.Application) {
  // Basic health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Database health check
  app.get('/api/health/db', async (req, res) => {
    try {
      // Test DB connection
      const result = await db.query('SELECT 1');
      res.json({
        status: 'ok',
        database: 'connected',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        database: 'disconnected',
        error: error.message,
      });
    }
  });

  // Scraper status
  app.get('/api/scrape/status', async (req, res) => {
    try {
      const lastRun = await db.query(
        'SELECT MAX(scraped_at) as last_run FROM regulatory_updates'
      );
      
      const sourceCount = await db.query(
        'SELECT COUNT(DISTINCT source) as count FROM regulatory_updates WHERE scraped_at > NOW() - INTERVAL \'24 hours\''
      );

      res.json({
        ok: true,
        lastRun: lastRun.rows[0]?.last_run,
        sources: sourceCount.rows[0]?.count || 0,
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error: error.message,
      });
    }
  });
}
```

Update `src/index.ts`:

```typescript
import { setupHealthEndpoints } from './health.js';

const app = express();
setupHealthEndpoints(app);  // Add this line

// ... rest of your app
```

---

## Rollback Procedure

### Automatic Rollback

Triggers automatically if:
- Health check fails after deployment
- Response time > 30 seconds
- Error rate > 5%

### Manual Rollback

**Via Railway Dashboard:**
1. Go to Deployments
2. Find the previous working deployment
3. Click "Redeploy"

**Via Railway CLI:**
```bash
railway rollback
```

**Via GitHub:**
1. Go to Actions → Find last successful deployment
2. Click "Re-run jobs"

---

## Monitoring

### Railway Dashboard

- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: History with rollback option

**URL:** https://railway.app/project/<project-id>

### Health Check Monitoring (Optional)

**Better Uptime (Free):**
1. Sign up at [betteruptime.com](https://betteruptime.com)
2. Add monitor: `https://crypto-tracker.up.railway.app/health`
3. Set check interval: 1 minute
4. Alert on 3 consecutive failures

**Or DIY with GitHub Actions:**

```yaml
name: Health Check
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Ping health endpoint
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" \
            https://crypto-tracker.up.railway.app/health)
          if [ "$response" != "200" ]; then
            curl -X POST "${{ secrets.DISCORD_WEBHOOK }}" \
              -d '{"content":"🚨 Health check failed for crypto-tracker!"}'
          fi
```

---

## Cron Jobs

### Option A: Railway Cron (Recommended)

Add to `railway.toml`:

```toml
[[services]]
name = "scraper"
source = "."

[[services]]
name = "scraper-cron"
source = "."
cron = "0 */6 * * *"
command = "npm run scrape"
```

### Option B: GitHub Actions Cron

Create `.github/workflows/scraper-cron.yml`:

```yaml
name: Crypto Tracker Cron
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run scrape
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

---

## Extending to Other Services

### agent-github / agent-linear / agent-notion

These are npm packages, not services. CI/CD for them:

```yaml
name: Publish to npm
on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Landing Pages (GitHub Pages)

Already auto-deploy on push to `main`. No extra setup needed.

---

## Troubleshooting

### Deployment fails on health check

1. Check Railway logs for errors
2. Verify environment variables are set
3. Test health endpoint manually: `curl https://<your-url>/health`
4. Check database connection

### Secrets not working

1. Verify secret names match exactly (case-sensitive)
2. Check if secrets are set at repository level (not organization)
3. Re-run workflow after adding secrets

### Railway build fails

1. Check `railway.json` is in repo root
2. Verify Node.js version in `package.json` engines
3. Check Railway logs for specific error

### Discord notifications not sending

1. Verify webhook URL is valid
2. Test webhook manually: `curl -X POST <webhook-url> -d '{"content":"test"}'`
3. Check secret `DISCORD_WEBHOOK` is set

---

## Cost Breakdown

| Service | Usage | Cost/month |
|---------|-------|------------|
| **GitHub Actions** | ~500 minutes/mo | $0 (free tier) |
| **Railway** | 1 service, minimal usage | $5 |
| **Supabase** | Existing | $0 or $25 |
| **Resend** | Existing | $0 or $20 |
| **Better Uptime** | 10 monitors (optional) | $0 (free tier) |
| **Total** | | **$5-50/mo** |

---

## Next Steps

1. ✅ Set up Railway project
2. ✅ Add GitHub secrets
3. ✅ Copy workflow files
4. ✅ Push to main and test
5. ⬜ Add health check endpoints
6. ⬜ Set up Discord notifications
7. ⬜ Configure monitoring
8. ⬜ Document in main README

---

## Support

**Issues:** Open GitHub issue in repo  
**Questions:** Ask in Mission Control  
**Emergencies:** Rollback via Railway dashboard

---

## References

- [Railway Docs](https://docs.railway.app)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
