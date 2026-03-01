# Phase 0: Bug Fixes & Integration Setup (Day 1-2)

**Goal**: Fix the 3 critical bugs that will cause missions to fail, and verify all core integrations are connected.

---

## Bug Fixes

### Fix 0: Add Sentinel to VALID_AGENTS
- **File**: `server-files/agent-wakeup-server.js` line 35
- **Problem**: `VALID_AGENTS = ["kaze", "scout", "forge", "ghost"]` — Sentinel missing. QA reviews delayed 15 min (waits for cron instead of immediate webhook).
- **Change**: Add `"sentinel"` to the Set
- **Deploy**: Arpit runs rsync + restarts wakeup server on Lightsail
- [x] Code changed
- [ ] Deployed to server

### Fix 1: Return proper HTTP status on integration errors
- **File**: `convex/http.ts` lines 1232-1238
- **Problem**: Catch block returns `status: 200` with error in body. Agents can't distinguish success from failure.
- **Change**: Changed `status: 200` to `status: 502` in the catch block
- **Deploy**: `npx convex dev --once --typecheck=disable`
- [x] Code changed
- [ ] Deployed to Convex

### Fix 2: Guard retries for non-idempotent methods
- **File**: `convex/executionEngine.ts` lines 267-276
- **Problem**: POST/PUT/PATCH requests retry on timeout → duplicate Slack messages, Notion pages, etc.
- **Change**: Added check: if method is POST/PUT/PATCH AND error is timeout, break instead of retry. Only retries on network errors or for idempotent methods (GET/DELETE).
- **Deploy**: `npx convex dev --once --typecheck=disable`
- [x] Code changed
- [ ] Deployed to Convex

### Fix 3: ~~Set up Google OAuth~~ ALREADY DONE
- Google Sheets, Gmail, Google Calendar are already connected with Arpit's personal email
- `updateGoogleClientId.ts` mutation already patched the database records at runtime
- Seed file still has placeholders but DB has real values — this is fine
- [x] Already done — no action needed

---

## Integration Connections (6 Core)

All must be OAuth-connected before Phase 1 starts.

### 1. Notion ✅ Real clientId exists
- **ClientId**: `310d872b-594c-8198-9062-0037fdfa77fb` (already in seed)
- **Test**: Verify connection on Integrations page
- [ ] Verified working

### 2. Slack ✅ Should already be connected
- **Test**: Call `slack/list_channels` via integration engine
- [ ] Verified working

### 3. GitHub ✅ OAuth app exists
- **ClientId**: `Ov23lixsxbeM9awtLnMv`
- **Secret**: Already set as `OAUTH_SECRET_GITHUB`
- **Test**: Verify `gh auth status` on Lightsail server
- [ ] Verified working

### 4. Google Sheets ✅ Already connected
- Connected via Arpit's personal Google account
- **Test**: Create test spreadsheet via integration engine
- [ ] Verified working

### 5. Google Calendar ✅ Already connected
- Connected via Arpit's personal Google account
- **Test**: List calendars via integration engine
- [ ] Verified working

### 6. Gmail ✅ Already connected
- Connected via Arpit's personal Google account
- **Test**: List messages via integration engine
- [ ] Verified working

---

## Deployment Steps

1. **Convex deployment** (Fixes 1 + 2):
   ```bash
   cd agent-orchestrator
   npx convex dev --once --typecheck=disable
   ```
   - [ ] Deployed

2. **Server deployment** (Fix 0):
   Arpit runs:
   ```bash
   rsync -avz -e "ssh -i ~/.ssh/LightsailKey.pem" \
     agent-orchestrator/server-files/agent-wakeup-server.js \
     ubuntu@52.66.97.31:/home/ubuntu/agent-wakeup-server.js

   # Then SSH in and restart:
   ssh -i ~/.ssh/LightsailKey.pem ubuntu@52.66.97.31
   pm2 restart agent-wakeup-server  # or however it's managed
   ```
   - [ ] Deployed

---

## Verification Checklist

- [ ] SSH to server → confirm `VALID_AGENTS` includes `"sentinel"`
- [ ] Call `/api/integrations/execute` with bad blueprint slug → verify HTTP 502 (not 200)
- [ ] Trigger POST integration timeout → verify single attempt in `integrationActivity` log
- [ ] All 6 integrations show "Connected" on Integrations page
- [ ] Create a test task for Sentinel → verify immediate webhook wakeup (not 15-min delay)

---

## Phase 0 Complete When:
- All 3 fixes deployed (Convex + server)
- All 6 integrations verified working
- Verification checklist passes
- **Estimated time**: 1 day (server deploy is the bottleneck — needs Arpit to rsync)
