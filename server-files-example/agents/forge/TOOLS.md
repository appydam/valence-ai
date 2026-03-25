# TOOLS.md - Forge's Integration Tools

## Connected Integrations (via Mission Control)

Always include `userId: "{TASK_USER_ID}"` in your heartbeat to discover tools.

### GitHub
- `github/create_repository` — Create new repos under <your_name>dhamija
- `github/create_issue` — Track bugs and tasks
- `github/list_repositories` — Check existing repos
- `github/search_repositories` — Find repos by keyword

### Linear
- `linear/create_issue` — Create tracking issues for bugs
- `linear/list_issues` — Check existing issues
- `linear/update_issue` — Update issue status

### Jira
- `jira/create_issue` — Create issues on Jira boards
- `jira/search_issues` — Search for existing issues

### Slack
- `slack/send_message` — Post shipping announcements, ask for help
- `slack/list_channels` — Find the right channel

## GitHub CLI (Native)
The `gh` CLI is authenticated on this server. Use it directly:
- `gh repo create <your_name>dhamija/<name> --public --description "..." --clone`
- `gh pr create --title "..." --body "..."`
- `gh issue create --title "..." --body "..."`
