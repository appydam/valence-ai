# Potential Upgrades

Improvements that aren't blocking current work but would make the system more robust.

---

## 1. web_fetch Fallback for Integration Calls

**Problem**: Agents use `exec` (bash) to run `curl` for integration API calls. When the JSON payload contains special characters like `(`, `)`, `$`, or single quotes, bash throws a syntax error and the call fails. The agent then sometimes caches "integration is broken" in its session memory and skips retrying.

**Fix**: Add `web_fetch` as a fallback method in each agent's SOUL.md. `web_fetch` sends HTTP requests directly without going through bash, so it doesn't have escaping issues.

**SOUL.md addition** (add to the "If a Tool Fails" section of each agent):
```
### Fallback: Use web_fetch if exec/curl Fails

If your curl command fails with a bash syntax error (e.g., "unexpected token"),
use web_fetch instead — it bypasses bash entirely:

web_fetch POST https://beloved-squirrel-599.convex.site/api/integrations/execute
Headers: Content-Type: application/json
Body: {
  "userId": "user_39f60iciK4nX4Q0efRxrfyuHqj2",
  "agentName": "YourAgentName",
  "blueprintSlug": "notion",
  "toolName": "create_page",
  "toolArgs": { ... }
}

This avoids bash escaping issues with parentheses, dollar signs, and quotes in content.
```

**Agents affected**: All (Scout, Forge, Ghost, Kaze, Sentinel)

**Effort**: Update 5 SOUL.md files + rsync to server

**Priority**: Medium — current workaround is that agents simplify the payload on retry, but content gets truncated

---

## 2. Patch Kaze's Server SOUL.md with OpenClaw Warning

**Problem**: Kaze's SOUL.md on the server (`/home/ubuntu/.openclaw/workspace/SOUL.md`) doesn't have the "DO NOT use OpenClaw's built-in tool skills" warning. If Kaze tries to call integrations directly (instead of delegating to other agents), it might route through localhost:8080 which doesn't connect to our integration engine.

**Fix**: Run this on the server:
```bash
ssh -i ~/.ssh/LightsailKey.pem ubuntu@52.66.97.31 "sed -i 's/## Your Integration Tools/## Your Integration Tools — MUST USE via curl to Convex API\n\n⚠️ DO NOT use OpenClaw'\''s built-in tool skills (exec, notion, slack, etc.) for integrations. They route through localhost:8080 which does NOT connect to our integration engine. ALL integration calls MUST go through curl to the Convex API as shown below./' /home/ubuntu/.openclaw/workspace/SOUL.md"
```

**Priority**: Medium — Kaze usually delegates integration work to other agents, but could hit this if it ever calls directly

---

## 3. Session Memory Poisoning Prevention

**Problem**: If an integration call fails for any transient reason (network blip, temporary auth issue), the agent remembers "this integration is broken" for the rest of that session. All future tasks in that session will skip the integration without retrying.

**Current workaround**: Delete the agent's session file and let it start fresh:
```bash
ssh -i ~/.ssh/LightsailKey.pem ubuntu@52.66.97.31 \
  "rm -f /home/ubuntu/.openclaw/agents/{agent}/sessions/*.jsonl \
   /home/ubuntu/.openclaw/agents/{agent}/sessions/*.lock"
```

**Potential fix options**:
1. Add to SOUL.md: "NEVER assume an integration is permanently broken based on a single failure. Always retry integration calls in each new task, even if a previous task in this session had integration errors."
2. OpenClaw feature request: session-level "forget" capability or per-task context isolation
3. Cron job that cleans sessions older than 2 hours (aggressive but effective)

**Priority**: High — this was the #1 time sink during Phase 1 smoke tests

---

## 4. Sync Local SOUL.md Files from Server (Not Just To Server)

**Problem**: Server SOUL.md files for Kaze (238 lines), Forge (205 lines), and Ghost (155 lines) are MORE complete than local copies. Someone edited them directly on the server. Local files are stale and would overwrite server improvements if rsynced carelessly.

**Fix**: One-time reverse sync to bring local files up to date:
```bash
# Pull server versions to local (backup first)
for agent in forge ghost sentinel; do
  rsync -avz -e "ssh -i ~/.ssh/LightsailKey.pem" \
    ubuntu@52.66.97.31:/home/ubuntu/.openclaw/workspace/agents/$agent/SOUL.md \
    "/Users/arpitdhamija/Desktop/missionControl 2/agent-orchestrator/server-files/agents/$agent/SOUL.md"
done

# Kaze is special — lives at workspace root
rsync -avz -e "ssh -i ~/.ssh/LightsailKey.pem" \
  ubuntu@52.66.97.31:/home/ubuntu/.openclaw/workspace/SOUL.md \
  "/Users/arpitdhamija/Desktop/missionControl 2/agent-orchestrator/server-files/agents/kaze/SOUL.md"
```

Then always edit local first and rsync TO server going forward.

**Priority**: Low — not blocking anything, but prevents confusion

---

## 5. Add Integration Tools Section to Sentinel's SOUL.md

**Problem**: Sentinel (QA reviewer) has no integration awareness in its SOUL.md — neither locally nor on server. It can't verify that agents actually called APIs (vs just writing text). In Phase 2+, Sentinel needs to check `integrationActivity` logs to confirm real API calls were made.

**Fix**: Add a section to Sentinel's SOUL.md:
```
## Verifying Integration Usage (QA Check)

When reviewing a task that required integration calls (Notion, Slack, Gmail, etc.):
1. Check if the agent's comment mentions actual API responses (HTTP status, response data)
2. Vague claims like "posted to Notion" without evidence = REJECT
3. If the agent reports an integration failure, verify the error is real (not a stale session belief)

You do NOT need to call integrations yourself — your job is to verify other agents did.
```

**Priority**: Medium — becomes important in Phase 2 when multi-agent missions run
