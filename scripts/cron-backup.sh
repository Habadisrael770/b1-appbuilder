#!/bin/bash
#
# Cron Wrapper Script for B1 AppBuilder Daily Backups
#
# This script runs the daily backup sequence:
# 1. Local backup (automated-backup.mjs)
# 2. Off-site upload (offsite-backup.mjs)
#
# Usage: Called by cron, not manually
#
# Crontab entry:
#   0 2 * * * /home/ubuntu/b1-appbuilder/scripts/cron-backup.sh staging >> /var/log/b1-backup-cron.log 2>&1
#

set -e

# Configuration
PROJECT_DIR="/home/ubuntu/b1-appbuilder"
LOG_DIR="/var/log"
LOG_FILE="${LOG_DIR}/b1-backup-cron.log"
ENV_NAME="${1:-staging}"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Timestamp function
timestamp() {
    date -u '+%Y-%m-%d %H:%M:%S UTC'
}

log() {
    echo "[$(timestamp)] $1"
}

log "=========================================="
log "CRON BACKUP JOB STARTED"
log "=========================================="
log "Environment: $ENV_NAME"
log "Project: $PROJECT_DIR"

# Change to project directory
cd "$PROJECT_DIR"

# Source environment variables from .env if exists
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Step 1: Local Backup
log "------------------------------------------"
log "Step 1: Running local backup..."
log "------------------------------------------"

LOCAL_BACKUP_START=$(date +%s)

if node scripts/automated-backup.mjs "$ENV_NAME"; then
    LOCAL_BACKUP_END=$(date +%s)
    LOCAL_BACKUP_DURATION=$((LOCAL_BACKUP_END - LOCAL_BACKUP_START))
    log "✅ Local backup completed in ${LOCAL_BACKUP_DURATION}s"
else
    log "❌ Local backup FAILED"
    log "Skipping off-site upload due to local backup failure"
    exit 1
fi

# Step 2: Off-site Upload
log "------------------------------------------"
log "Step 2: Running off-site upload..."
log "------------------------------------------"

OFFSITE_START=$(date +%s)

if node scripts/offsite-backup.mjs "$ENV_NAME"; then
    OFFSITE_END=$(date +%s)
    OFFSITE_DURATION=$((OFFSITE_END - OFFSITE_START))
    log "✅ Off-site upload completed in ${OFFSITE_DURATION}s"
else
    log "❌ Off-site upload FAILED"
    log "Local backup succeeded, but off-site failed"
    exit 2
fi

# Summary
TOTAL_END=$(date +%s)
TOTAL_DURATION=$((TOTAL_END - LOCAL_BACKUP_START))

log "=========================================="
log "CRON BACKUP JOB COMPLETED"
log "=========================================="
log "Local backup: ${LOCAL_BACKUP_DURATION}s"
log "Off-site upload: ${OFFSITE_DURATION}s"
log "Total duration: ${TOTAL_DURATION}s"
log "Status: SUCCESS"
log "=========================================="

exit 0
