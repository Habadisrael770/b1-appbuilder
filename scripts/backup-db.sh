#!/bin/bash
#
# Database Backup Script for B1 AppBuilder
# Usage: ENV=staging DATABASE_URL=<url> bash scripts/backup-db.sh staging
#
# Creates a compressed SQL dump with checksum verification
#

set -euo pipefail

# Configuration
ENV_NAME="${1:-staging}"
BACKUP_DIR="/home/ubuntu/b1-appbuilder/backups/${ENV_NAME}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${ENV_NAME}_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"
CHECKSUM_FILE="${COMPRESSED_FILE}.sha256"

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

# Validate DATABASE_URL
if [ -z "${DATABASE_URL:-}" ]; then
    log_error "DATABASE_URL environment variable is required"
    echo "Usage: DATABASE_URL=<url> bash scripts/backup-db.sh [env_name]"
    exit 1
fi

# Parse DATABASE_URL (format: mysql://user:pass@host:port/database)
# Extract components using regex
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

# Create backup directory if not exists
mkdir -p "${BACKUP_DIR}"

log_info "=== Database Backup Started ==="
log_info "Environment: ${ENV_NAME}"
log_info "Database: ${DB_NAME}"
log_info "Host: ${DB_HOST}:${DB_PORT}"
log_info "Timestamp: ${TIMESTAMP}"
log_info "Output: ${COMPRESSED_FILE}"

# Record start time
START_TIME=$(date +%s)

# Execute mysqldump
log_info "Running mysqldump..."
mysqldump \
    --host="${DB_HOST}" \
    --port="${DB_PORT}" \
    --user="${DB_USER}" \
    --password="${DB_PASS}" \
    --ssl-mode=REQUIRED \
    --single-transaction \
    --routines \
    --triggers \
    --set-gtid-purged=OFF \
    "${DB_NAME}" > "${BACKUP_FILE}" 2>/dev/null

# Check if dump was successful
if [ ! -s "${BACKUP_FILE}" ]; then
    log_error "Backup file is empty or was not created"
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# Get uncompressed size
UNCOMPRESSED_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
log_info "Uncompressed size: ${UNCOMPRESSED_SIZE}"

# Compress the backup
log_info "Compressing backup..."
gzip -f "${BACKUP_FILE}"

# Get compressed size
COMPRESSED_SIZE=$(du -h "${COMPRESSED_FILE}" | cut -f1)
log_info "Compressed size: ${COMPRESSED_SIZE}"

# Generate checksum
log_info "Generating checksum..."
sha256sum "${COMPRESSED_FILE}" > "${CHECKSUM_FILE}"
CHECKSUM=$(cat "${CHECKSUM_FILE}" | cut -d' ' -f1)

# Record end time and calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Summary
echo ""
log_info "=== Backup Complete ==="
echo "  File: ${COMPRESSED_FILE}"
echo "  Size: ${COMPRESSED_SIZE}"
echo "  Checksum: ${CHECKSUM:0:16}..."
echo "  Duration: ${DURATION} seconds"
echo ""

# Verify checksum
log_info "Verifying checksum..."
cd "${BACKUP_DIR}"
if sha256sum -c "$(basename ${CHECKSUM_FILE})" > /dev/null 2>&1; then
    log_info "Checksum verification: PASSED"
else
    log_error "Checksum verification: FAILED"
    exit 1
fi

echo ""
log_info "Backup successful!"
echo "  Backup: ${COMPRESSED_FILE}"
echo "  Checksum: ${CHECKSUM_FILE}"
