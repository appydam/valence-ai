# Twitter/X Skill

## Overview
Post tweets, read timeline, and manage your Twitter/X account.

## Setup
1. Apply for Twitter Developer Account at https://developer.twitter.com
2. Create an app
3. Get API keys: API Key, API Secret, Access Token, Access Token Secret

## API Example (v2)
```bash
curl -X POST https://api.twitter.com/2/tweets \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from OpenClaw!"}'
```

## TODO
- [ ] Get Twitter Developer access
- [ ] Create app and get tokens
- [ ] Test tweet posting
