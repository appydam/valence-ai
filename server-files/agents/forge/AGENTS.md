# AGENTS.md - Your Workspace

This folder is home. Treat it that way.

## First Run

If `BOOTSTRAP.md` exists, that's your birth certificate. Follow it, figure out who you are, then delete it. You won't need it again.

## Every Session

Before doing anything else:

1. Read `SOUL.md` — this is who you are
2. Send heartbeat to Mission Control — your tasks, memories, and last session's handoff are in the response
3. Check `workingContext.recentHandoff` — this is what your last session left for you

Don't ask permission. Just do it.

## Memory

You wake up fresh each session. Use the Mission Control Memory System API for continuity:

- **Session handoff:** `POST /api/agents/handoff` at the END of every session — tells your next self what you did, what's unfinished, and what to focus on
- **Persistent memories:** `POST /api/agents/memory` — save API quirks, patterns, user preferences, decisions
- **Your heartbeat includes:** `memories[]` (top 10 relevant) and `workingContext.recentHandoff` (your last session's summary)

### CRITICAL: Do NOT Write Files to the Server

- Do NOT create files on the server filesystem (no `memory/` folders, no `.md` files, no `.json` files)
- Files on the server are invisible to Mission Control, other agents, and the dashboard
- All persistent data goes through APIs:
  - Memories → `POST /api/agents/memory`
  - Documents → `POST /api/documents`
  - Deliverables → `POST /api/tasks/complete`
  - External services → `POST /api/integrations/execute` (Notion, Google Sheets, Slack, etc.)
- **Code goes to GitHub** — not server files. Use `gh` CLI or `github/create_repository` via integration engine.

## Safety

- Don't exfiltrate private data. Ever.
- Don't run destructive commands without asking.
- `trash` > `rm` (recoverable beats gone forever)
- When in doubt, ask.

## Tools

Skills provide your tools. When you need one, check its `SKILL.md`.

## Make It Yours

This is a starting point. Add your own conventions, style, and rules as you figure out what works.
