# Mission Control - Agent Orchestrator

## Project Vision
Mission Control is a dashboard for orchestrating AI agents (Kaze, Scout, Forge, Ghost) running on OpenClaw. It provides task management, agent configuration, integration management, and real-time monitoring — all from a single web UI.

## Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Convex (serverless functions + real-time DB)
- **Auth**: Clerk (via Convex integration)
- **SSH Proxy**: Node.js service on Railway (ssh2 library)
- **Package Manager**: npm

## Project Structure
```
agent-orchestrator/
├── convex/                  # Backend (Convex functions + schema)
│   ├── schema.ts            # Database schema (all tables)
│   ├── http.ts              # HTTP API endpoints
│   ├── executionEngine.ts   # Integration tool execution runtime
│   ├── blueprints.ts        # Integration blueprint CRUD
│   ├── blueprintTools.ts    # Tools per blueprint
│   ├── connections.ts       # User connection management
│   ├── connectionActions.ts # OAuth + API key connection actions
│   ├── docScraper.ts        # AI-powered API doc scraper
│   ├── webhooks.ts          # Webhook handlers (Slack, GitHub, Linear)
│   ├── webhookReceiver.ts   # Generic webhook receiver
│   ├── emailFinder.ts       # Email discovery engine
│   └── lib/                 # Shared utilities (crypto, requestBuilder)
├── src/
│   ├── pages/               # Route pages
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities (api, time, configExport)
│   └── types/               # TypeScript types
├── server-files/            # Deployed to Railway
│   ├── ssh-proxy-server.js  # SSH proxy + agent wakeup (main service)
│   ├── agent-wakeup-server.js # Legacy (replaced by ssh-proxy-server)
│   └── skills/              # OpenClaw skill definitions
└── CLAUDE.md                # This file
```

## Key Architecture Decisions

### Convex Patterns
- HTTP routes don't support path params — use POST with ID in body
- `useQuery` returns `undefined` while loading; use `?? []` pattern
- Convex docs use `_id` not `id`, `_creationTime` not `createdAt`
- `_generated/` directory only exists after running `npx convex dev`
- Actions (not mutations) are needed for external API calls and crypto

### Universal Integration Engine
Replaces Paragon ($2.5k/month). User pastes API docs URL -> Claude generates tool definitions -> user reviews/saves as blueprint -> system manages auth per user -> agents call real APIs.

- **Blueprints**: Define an integration (slug, baseUrl, authType, tools)
- **Tools**: Individual API actions per blueprint
- **Connections**: Per-user encrypted auth tokens (AES-256-GCM)
- **Execution Engine**: Resolves params, sets auth headers, retries on 429/5xx

### SSH Proxy Service (Railway)
Single Node.js service handling both SSH operations and agent wakeup:
- URL: `https://ssh-proxy-service-production.up.railway.app`
- Frontend env: `VITE_SSH_PROXY_URL`
- Convex env: `AGENT_WAKEUP_SERVER_URL`

### Auth Flow
- Clerk handles user authentication
- OAuth for integrations: popup-based flow with HMAC-signed state
- API keys: AES-256-GCM encrypted, stored in Convex

## Environment Variables

### Frontend (.env.local)
- `VITE_CONVEX_URL` - Convex deployment URL
- `VITE_CONVEX_SITE_URL` - Convex HTTP endpoint base
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk auth
- `VITE_SSH_PROXY_URL` - Railway SSH proxy service URL

### Convex (set via `npx convex env set`)
- `INTEGRATION_ENCRYPTION_KEY` - AES-256-GCM master key
- `ANTHROPIC_API_KEY` - For doc scraper Claude calls
- `AGENT_WAKEUP_SERVER_URL` - Railway service URL
- `OAUTH_SECRET_<SLUG>` - Per-provider OAuth client secrets

## Development Workflow

### Commit Policy
- Commit after every feature is tested and working
- Don't let changes pile up — small, frequent commits
- Use descriptive commit messages that explain the "why"

### Running Locally
```bash
npm install
npx convex dev    # Start Convex backend
npm run dev       # Start Vite frontend
```

### Deploying SSH Proxy
```bash
cd server-files
# Push to GitHub, Railway auto-deploys from server-files/
```

## Current Features
- Dashboard with agent status, task board, mission tracking
- Agent config panel (model, skills, SOUL files)
- Universal Integration Engine (blueprints, OAuth, API keys)
- Webhook system (Slack, GitHub, Linear + generic receivers)
- Email finder tool
- Analytics page
- SSH-based server management (SOUL sync, OpenClaw restart)
- Agent wakeup via webhook
