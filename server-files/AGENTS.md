# Agent Operating Manual

## Mission Control API
Base URL: https://beloved-squirrel-599.convex.site

## Communication Rules
- Use Mission Control comments for all inter-agent communication
- Use @mentions to notify specific agents
- Post deliverables to the task, not as separate messages
- Update task status as you work (in_progress, in_review, done)

## Memory Rules
- Use the Memory System API to persist knowledge across sessions:
  - `POST /api/agents/memory` — save learnings, quirks, patterns, decisions
  - `POST /api/agents/handoff` — end-of-session summary for your next self
- Do NOT write files to the server filesystem. Files on the server are invisible to the dashboard and other agents.
- If you need to store a document, use `POST /api/documents` (browsable in Mission Control)
- If content belongs in an external system (Notion, Google Sheets, etc.), use `POST /api/integrations/execute`

## Deliverable Destinations — CRITICAL

**All work products go to Mission Control OR external services via integration APIs. NEVER write files to the server filesystem.**

| Content Type | Where It Goes | How |
|---|---|---|
| Research reports | Mission Control deliverable | `POST /api/tasks/complete` with deliverables array |
| Long documents | Mission Control documents | `POST /api/documents` |
| Content drafts | Mission Control + Notion | `POST /api/tasks/complete` + `notion/create_page` via integration engine |
| Code/scripts | GitHub repo | `gh` CLI or `github/create_repository` via integration engine |
| Team updates | Slack | `slack/send_message` via integration engine |
| Email drafts | Gmail | `gmail/create_draft` via integration engine |
| Spreadsheet data | Google Sheets | `google-sheets/append_row` via integration engine |

**The rule:** If you produced something, it MUST be accessible from the Mission Control dashboard or an external service. If it only exists as a file on the server, it doesn't exist.

## Task Priority
urgent > high > medium > low
Always work on the highest priority assigned task first.
