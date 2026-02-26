# CI/CD Pipeline for Agent Deployment

**Author:** Forge 🔨  
**Date:** 2026-02-10  
**Task ID:** jn7exbq2vj0rhqhkdzgd3zm6rx80w81c  
**Status:** In Progress

---

## Overview

Automated deployment pipeline for all agent services, tools, and infrastructure components.

## Objectives

1. **Automated Testing** - Run tests on every commit
2. **Automated Deployment** - Deploy on merge to main
3. **Environment Management** - Dev, staging, production
4. **Rollback Capability** - Quick recovery from failures
5. **Monitoring & Alerts** - Track deployments and errors

---

## Architecture

### Components to Deploy

1. **Agent Services**
   - Crypto Regulatory Tracker (appydam/crypto-regulatory-tracker)
   - Agent DevTools (agent-github, agent-linear, agent-notion)
   - Mission Control (Convex backend)

2. **Landing Pages**
   - Crypto Compliance Weekly (GitHub Pages)
   - AgentHost (GitHub Pages)

3. **Infrastructure**
   - Database migrations
   - Environment secrets
   - Cron jobs

---

## Pipeline Design

### GitHub Actions Workflow

```yaml
name: Deploy Agent Services

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/download-artifact@v3
      - name: Deploy to Railway (Staging)
        run: |
          curl -X POST "${{ secrets.RAILWAY_WEBHOOK_STAGING }}"

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/download-artifact@v3
      - name: Deploy to Railway (Production)
        run: |
          curl -X POST "${{ secrets.RAILWAY_WEBHOOK_PROD }}"
      - name: Notify Mission Control
        run: |
          curl -X POST "${{ secrets.MISSION_CONTROL_WEBHOOK }}" \
            -H "Content-Type: application/json" \
            -d '{"event": "deployment", "service": "${{ github.repository }}", "status": "success"}'
```

---

## Deployment Targets

### 1. Railway (Node.js Services)

**crypto-regulatory-tracker:**
```yaml
# railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Environment Variables (via Railway):**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`
- `NODE_ENV=production`

### 2. Vercel (Landing Pages)

**GitHub Pages (Current):**
- Auto-deploy on push to `main`
- No build step needed (static HTML/CSS)

**Future: Vercel Migration**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null,
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 3. Convex (Mission Control Backend)

**Auto-deploy via Convex CLI:**
```bash
npx convex deploy --prod
```

Integrated into GitHub Actions:
```yaml
- name: Deploy Convex
  env:
    CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
  run: |
    npm install -g convex
    convex deploy --prod
```

---

## Secrets Management

### GitHub Secrets (Repository Level)

**Required Secrets:**
```
RAILWAY_API_TOKEN
RAILWAY_WEBHOOK_STAGING
RAILWAY_WEBHOOK_PROD
SUPABASE_URL
SUPABASE_ANON_KEY
ANTHROPIC_API_KEY
RESEND_API_KEY
CONVEX_DEPLOY_KEY
MISSION_CONTROL_WEBHOOK
```

### Adding Secrets

```bash
# Via GitHub CLI
gh secret set RAILWAY_API_TOKEN --body "..."
gh secret set SUPABASE_URL --body "..."
gh secret set ANTHROPIC_API_KEY --body "..."

# Via GitHub UI
# Settings → Secrets and variables → Actions → New repository secret
```

---

## Rollback Strategy

### Automatic Rollback

If deployment fails health check:
```yaml
- name: Health Check
  run: |
    response=$(curl -s -o /dev/null -w "%{http_code}" https://api.example.com/health)
    if [ $response -ne 200 ]; then
      echo "Health check failed! Rolling back..."
      exit 1
    fi

- name: Rollback on Failure
  if: failure()
  run: |
    curl -X POST "${{ secrets.RAILWAY_ROLLBACK_WEBHOOK }}"
```

### Manual Rollback

```bash
# Railway CLI
railway rollback

# Or via Railway Dashboard
# Deployments → Select previous version → Redeploy
```

---

## Monitoring & Alerts

### Health Checks

**Endpoints to monitor:**
- `/health` - Basic health
- `/api/status` - API status
- `/api/scrape/status` - Scraper status (crypto tracker)

**Monitoring Tools:**
- Railway built-in monitoring
- Better Uptime (free tier: 10 monitors)
- Or: Custom healthcheck script + Discord webhook

### Alert Channels

1. **Discord webhook** - Instant notifications
2. **Email** - Critical failures only
3. **Mission Control** - Log all deployments

**Discord Webhook Setup:**
```yaml
- name: Notify Discord
  if: always()
  run: |
    STATUS="${{ job.status }}"
    COLOR=$([[ "$STATUS" == "success" ]] && echo "3066993" || echo "15158332")
    curl -X POST "${{ secrets.DISCORD_WEBHOOK }}" \
      -H "Content-Type: application/json" \
      -d '{
        "embeds": [{
          "title": "Deployment: ${{ github.repository }}",
          "description": "Status: '"$STATUS"'",
          "color": '"$COLOR"',
          "fields": [
            {"name": "Commit", "value": "${{ github.sha }}", "inline": true},
            {"name": "Author", "value": "${{ github.actor }}", "inline": true}
          ]
        }]
      }'
```

---

## Environment Strategy

### 3-Tier Setup

1. **Development** (local)
   - `.env.development`
   - Local Supabase (optional)
   - Test data

2. **Staging** (Railway)
   - `staging` branch → auto-deploy
   - Staging database
   - Real APIs with test keys

3. **Production** (Railway)
   - `main` branch → auto-deploy
   - Production database
   - Real credentials

### Branch Protection

```yaml
# .github/branch-protection.yml (conceptual)
main:
  required_reviews: 1
  required_status_checks:
    - test
    - build
  enforce_admins: false
  allow_force_pushes: false
```

**Set via GitHub UI:**
Settings → Branches → Branch protection rules → Add rule

---

## Cron Job Deployment

### crypto-regulatory-tracker

**Current:** Manual cron setup  
**Target:** Automated via Railway Cron or GitHub Actions

**Option A: Railway Cron** (Recommended)
```yaml
# railway.toml
[[services]]
name = "scraper-cron"
source = "."
cron = "0 */6 * * *"
command = "npm run scrape"
```

**Option B: GitHub Actions Cron**
```yaml
name: Crypto Tracker Scraper
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
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

---

## Testing Strategy

### Test Pyramid

1. **Unit Tests**
   - Test individual functions
   - Mock external APIs
   - Fast, run on every commit

2. **Integration Tests**
   - Test API endpoints
   - Test database operations
   - Run on PR

3. **E2E Tests** (optional)
   - Test full scraper pipeline
   - Run nightly or on-demand

**Package.json scripts:**
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  }
}
```

---

## Implementation Checklist

### Phase 1: Core Pipeline (Today)
- [x] Create pipeline spec (this document)
- [ ] Set up GitHub Actions for crypto-regulatory-tracker
- [ ] Configure Railway deployment
- [ ] Add secrets to GitHub
- [ ] Test deployment to staging
- [ ] Document process in repo README

### Phase 2: Testing & Monitoring (Tomorrow)
- [ ] Add unit tests for crypto tracker
- [ ] Set up health check endpoint
- [ ] Configure Discord webhook alerts
- [ ] Add rollback workflow

### Phase 3: Extend to Other Services (Week 2)
- [ ] Add CI/CD for agent-github
- [ ] Add CI/CD for agent-linear
- [ ] Add CI/CD for agent-notion
- [ ] Centralized monitoring dashboard

---

## Cost Estimate

| Service | Usage | Cost |
|---------|-------|------|
| **GitHub Actions** | 2,000 min/mo | $0 (free tier) |
| **Railway** | 2 services, $5 each | $10/mo |
| **Better Uptime** | 10 monitors | $0 (free tier) |
| **Supabase** | (existing) | $0 or $25/mo |
| **Total** | | **~$10-35/mo** |

---

## Next Steps

1. Create `.github/workflows/deploy.yml` in crypto-regulatory-tracker
2. Add secrets to GitHub repo settings
3. Test deployment to Railway
4. Update README with deployment instructions
5. Notify Kaze when complete

---

## References

- Railway Docs: https://docs.railway.app
- GitHub Actions: https://docs.github.com/actions
- Convex Deploy: https://docs.convex.dev/production/deployment
