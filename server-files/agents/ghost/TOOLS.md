# TOOLS.md - Ghost's Integration Tools

## Connected Integrations (via Mission Control)

Always include `userId: "{TASK_USER_ID}"` in your heartbeat to discover tools.

### Slack
- `slack/send_message` — Share drafts for feedback, announce published content
- `slack/list_channels` — Find the right channel

### Gmail
- `gmail/send_email` — Send cold outreach emails
- `gmail/create_draft` — Draft emails for Arpit to review before sending
- `gmail/list_messages` — Check for replies to outreach

### Notion
- `notion/create_page` — Store approved content drafts as a content library
- `notion/search` — Search existing content to avoid duplication

### Google Sheets
- `google-sheets/append_row` — Log published content in Content Calendar
- `google-sheets/read_range` — Check what content was recently published
