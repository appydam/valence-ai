#!/bin/bash
# OpenClaw Session Watchdog
# Runs every 5 minutes via cron. Detects and cleans corrupt/stuck agent sessions.
# Self-healing: no human SSH required.

AGENTS_DIR="/home/ubuntu/.openclaw/agents"
LOG="/home/ubuntu/watchdog.log"
CONVEX_URL="https://<YOUR_DEPLOYMENT>.convex.cloud"
AGENTS=("forge" "scout" "kaze" "ghost" "sentinel")

log() {
  echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $1" >> "$LOG"
}

# Keep log under 500 lines
if [ "$(wc -l < "$LOG" 2>/dev/null)" -gt 500 ]; then
  tail -400 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi

for AGENT in "${AGENTS[@]}"; do
  SESSION_DIR="$AGENTS_DIR/$AGENT/sessions"
  [ -d "$SESSION_DIR" ] || continue

  # 1. Remove stale lock files (older than 5 minutes, no matching live process)
  while IFS= read -r LOCK_FILE; do
    # Extract PID from lock file if present
    LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null | grep -oP '"pid":\s*\K[0-9]+' || true)
    if [ -n "$LOCK_PID" ] && kill -0 "$LOCK_PID" 2>/dev/null; then
      # Process still alive — skip
      continue
    fi
    # Lock is stale — remove it
    rm -f "$LOCK_FILE"
    log "[$AGENT] Removed stale lock: $(basename "$LOCK_FILE")"
  done < <(find "$SESSION_DIR" -name "*.lock" -mmin +5 2>/dev/null)

  # 2. Remove corrupt session files (>50MB or >20 minutes old and still being written)
  while IFS= read -r SESSION_FILE; do
    SIZE=$(stat -c%s "$SESSION_FILE" 2>/dev/null || echo 0)
    # If session file is over 3MB, it's bloated/corrupt — delete it
    if [ "$SIZE" -gt 3145728 ]; then
      rm -f "$SESSION_FILE" "${SESSION_FILE}.lock" 2>/dev/null
      log "[$AGENT] Removed bloated session (${SIZE} bytes): $(basename "$SESSION_FILE")"
    fi
  done < <(find "$SESSION_DIR" -name "*.jsonl" -not -name "*.deleted*" 2>/dev/null)

done

log "Watchdog run complete."
