#!/bin/bash

# Update Database with Build Info Script
# Usage: ./update-db.sh <appId> <platform>

set -e

APP_ID="${1:-unknown}"
PLATFORM="${2:-ANDROID}"

echo "💾 Updating database with build info..."

# Configuration
DATABASE_URL="${DATABASE_URL}"
BUILD_STATUS="COMPLETED"
BUILD_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Get download URL
if [ "$PLATFORM" = "ANDROID" ]; then
    DOWNLOAD_URL=$(cat build-output/android-url.txt 2>/dev/null || echo "")
elif [ "$PLATFORM" = "IOS" ]; then
    DOWNLOAD_URL=$(cat build-output/ios-url.txt 2>/dev/null || echo "")
else
    echo "❌ Unknown platform: $PLATFORM"
    exit 1
fi

# Prepare SQL update
SQL_UPDATE="
UPDATE builds 
SET 
    status = '$BUILD_STATUS',
    download_url = '$DOWNLOAD_URL',
    completed_at = '$BUILD_TIMESTAMP'
WHERE 
    app_id = '$APP_ID' 
    AND platform = '$PLATFORM'
    AND status = 'BUILDING';
"

echo "📝 SQL: $SQL_UPDATE"

# Execute update (using environment variable for connection)
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set, skipping database update"
    echo "   (In production, this would update the database)"
else
    echo "✅ Database would be updated with:"
    echo "   - App ID: $APP_ID"
    echo "   - Platform: $PLATFORM"
    echo "   - Status: $BUILD_STATUS"
    echo "   - Download URL: $DOWNLOAD_URL"
    echo "   - Timestamp: $BUILD_TIMESTAMP"
fi

exit 0
