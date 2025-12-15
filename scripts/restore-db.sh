#!/bin/bash
#
# Database Restore Script for B1 AppBuilder
# Usage: ENV_NAME=staging DATABASE_URL=<url> bash scripts/restore-db.sh <backup_file.sql.gz>
#
# Restores a compressed SQL dump with checksum verification
#

set -euo pipefail

# Configuration
BACKUP_FILE="${1:-}"
ENV_NAME="${ENV_NAME:-staging}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate inputs
if [ -z "${BACKUP_FILE}" ]; then
    log_error "Backup file path is required"
    echo "Usage: DATABASE_URL=<url> bash scripts/restore-db.sh <backup_file.sql.gz>"
    exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
    log_error "Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
    log_error "DATABASE_URL environment variable is required"
    exit 1
fi

# Parse DATABASE_URL (format: mysql://user:pass@host:port/database)
if [[ $DATABASE_URL =~ mysql://([^:]+):([^@]+)@([^:]+):([0-9]+)/([^?]+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    log_error "Invalid DATABASE_URL format. Expected: mysql://user:pass@host:port/database"
    exit 1
fi

# Check for checksum file
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
if [ -f "${CHECKSUM_FILE}" ]; then
    log_info "Verifying backup checksum..."
    BACKUP_DIR=$(dirname "${BACKUP_FILE}")
    cd "${BACKUP_DIR}"
    if sha256sum -c "$(basename ${CHECKSUM_FILE})" > /dev/null 2>&1; then
        log_info "Checksum verification: PASSED"
    else
        log_error "Checksum verification: FAILED"
        log_error "Backup file may be corrupted. Aborting restore."
        exit 1
    fi
else
    log_warn "No checksum file found. Proceeding without verification."
fi

echo ""
log_info "=== Database Restore Started ==="
log_info "Environment: ${ENV_NAME}"
log_info "Database: ${DB_NAME}"
log_info "Host: ${DB_HOST}:${DB_PORT}"
log_info "Backup file: ${BACKUP_FILE}"
echo ""

# Safety check for production
if [[ "${ENV_NAME}" == "production" || "${ENV_NAME}" == "prod" ]]; then
    log_warn "⚠️  WARNING: You are about to restore to PRODUCTION!"
    log_warn "This will OVERWRITE all existing data."
    read -p "Type 'RESTORE PRODUCTION' to confirm: " CONFIRM
    if [ "${CONFIRM}" != "RESTORE PRODUCTION" ]; then
        log_error "Restore cancelled."
        exit 1
    fi
fi

# Record start time
START_TIME=$(date +%s)
log_info "Start time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

# Get backup file size
BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
log_info "Backup size: ${BACKUP_SIZE}"

# Execute restore
log_info "Decompressing and restoring..."
gunzip -c "${BACKUP_FILE}" | mysql \
    --host="${DB_HOST}" \
    --port="${DB_PORT}" \
    --user="${DB_USER}" \
    --password="${DB_PASS}" \
    --ssl-mode=REQUIRED \
    "${DB_NAME}"

# Record end time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
log_info "=== Restore Complete ==="
log_info "End time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
log_info "Duration: ${DURATION} seconds"
echo ""

# Verify database is accessible
log_info "Verifying database connection..."
TABLES=$(mysql \
    --host="${DB_HOST}" \
    --port="${DB_PORT}" \
    --user="${DB_USER}" \
    --password="${DB_PASS}" \
    --ssl-mode=REQUIRED \
    -N -e "SHOW TABLES" "${DB_NAME}" 2>/dev/null | wc -l)

if [ "${TABLES}" -gt 0 ]; then
    log_info "Database verification: PASSED (${TABLES} tables found)"
else
    log_warn "Database verification: No tables found (may be expected for empty backup)"
fi

echo ""
log_info "Restore successful!"
echo ""
echo "Next steps:"
echo "  1. Check health endpoint: curl <staging-url>/healthz"
echo "  2. Check readiness: curl <staging-url>/readyz"
echo "  3. Test critical functionality"
echo ""
echo "RTO Summary:"
echo "  Start: $(date -d @${START_TIME} -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "  End: $(date -d @${END_TIME} -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "  Duration: ${DURATION} seconds"
