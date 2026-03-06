#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# Lightsail Auto-Snapshots — Nightly Backup for Agent Servers
#
# Creates automatic snapshots of all active customer Lightsail
# instances and cleans up snapshots older than 7 days.
#
# Usage:
#   ./lightsail-snapshots.sh                     # Run manually
#   ./lightsail-snapshots.sh --dry-run           # Preview only
#
# Cron (recommended):
#   0 3 * * * /path/to/lightsail-snapshots.sh >> /var/log/lightsail-snapshots.log 2>&1
# ─────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CUSTOMERS_FILE="$SCRIPT_DIR/customers.json"
RETENTION_DAYS=7
DRY_RUN=false

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1"
}

if [ ! -f "$CUSTOMERS_FILE" ]; then
  log "❌ No customers.json found"
  exit 1
fi

CUSTOMERS=$(jq -c '.[] | select(.status == "active" and .lightsailInstance != null and .lightsailInstance != "")' "$CUSTOMERS_FILE")
COUNT=$(echo "$CUSTOMERS" | grep -c . || echo "0")

log "═══ Lightsail Snapshot Run ═══"
log "Active instances: $COUNT"
if $DRY_RUN; then log "🏜️  DRY RUN — no snapshots will be created/deleted"; fi

CREATED=0
DELETED=0
FAILED=0

# ── Create Snapshots ─────────────────────────────────────────
echo "$CUSTOMERS" | while IFS= read -r customer; do
  SLUG=$(echo "$customer" | jq -r '.slug')
  INSTANCE=$(echo "$customer" | jq -r '.lightsailInstance')
  SNAPSHOT_NAME="valence-${SLUG}-$(date +%Y%m%d)"

  if $DRY_RUN; then
    log "  [DRY RUN] Would create snapshot: $SNAPSHOT_NAME for $INSTANCE"
  else
    log "  📸 Creating snapshot: $SNAPSHOT_NAME..."
    if aws lightsail create-instance-snapshot \
      --instance-name "$INSTANCE" \
      --instance-snapshot-name "$SNAPSHOT_NAME" 2>/dev/null; then
      log "     ✅ $SNAPSHOT_NAME created"
    else
      log "     ❌ Failed to create snapshot for $INSTANCE"
    fi
  fi
done

# ── Clean Up Old Snapshots ───────────────────────────────────
log ""
log "🧹 Cleaning snapshots older than $RETENTION_DAYS days..."

CUTOFF_DATE=$(date -u -d "$RETENTION_DAYS days ago" +%Y-%m-%d 2>/dev/null || \
              date -u -v-${RETENTION_DAYS}d +%Y-%m-%d 2>/dev/null || \
              echo "")

if [ -z "$CUTOFF_DATE" ]; then
  log "  ⚠️  Cannot compute cutoff date — skipping cleanup"
else
  # List all snapshots matching our naming convention
  SNAPSHOTS=$(aws lightsail get-instance-snapshots \
    --query "instanceSnapshots[?starts_with(name, 'valence-')].[name,createdAt]" \
    --output text 2>/dev/null || echo "")

  if [ -z "$SNAPSHOTS" ]; then
    log "  No snapshots found matching 'valence-*'"
  else
    echo "$SNAPSHOTS" | while IFS=$'\t' read -r snap_name snap_date; do
      # Extract date portion from snapshot name (valence-slug-YYYYMMDD)
      SNAP_DATE_STR=$(echo "$snap_name" | grep -oE '[0-9]{8}$' || echo "")
      if [ -z "$SNAP_DATE_STR" ]; then
        continue
      fi

      SNAP_DATE_FMT="${SNAP_DATE_STR:0:4}-${SNAP_DATE_STR:4:2}-${SNAP_DATE_STR:6:2}"
      if [[ "$SNAP_DATE_FMT" < "$CUTOFF_DATE" ]]; then
        if $DRY_RUN; then
          log "  [DRY RUN] Would delete old snapshot: $snap_name ($SNAP_DATE_FMT)"
        else
          log "  🗑️  Deleting old snapshot: $snap_name ($SNAP_DATE_FMT)..."
          if aws lightsail delete-instance-snapshot --instance-snapshot-name "$snap_name" 2>/dev/null; then
            log "     ✅ Deleted"
          else
            log "     ❌ Failed to delete $snap_name"
          fi
        fi
      fi
    done
  fi
fi

log ""
log "✅ Snapshot run complete"
