#!/bin/bash

# Upload APK/IPA to S3 Script
# Usage: ./upload-s3.sh <appId> <platform>

set -e

APP_ID="${1:-unknown}"
PLATFORM="${2:-android}"

echo "📤 Uploading $PLATFORM build to S3..."

# Configuration
S3_BUCKET="${AWS_S3_BUCKET:-b1-appbuilder-builds}"
S3_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"

# Determine file based on platform
if [ "$PLATFORM" = "android" ]; then
    BUILD_FILE="build-templates/android/app/build/outputs/apk/release/app-release.apk"
    S3_KEY="builds/$APP_ID/android/app.apk"
elif [ "$PLATFORM" = "ios" ]; then
    BUILD_FILE="build-templates/ios/build/ipa/MyApp.ipa"
    S3_KEY="builds/$APP_ID/ios/app.ipa"
else
    echo "❌ Unknown platform: $PLATFORM"
    exit 1
fi

# Check if file exists
if [ ! -f "$BUILD_FILE" ]; then
    echo "❌ Build file not found: $BUILD_FILE"
    exit 1
fi

# Upload to S3
echo "📤 Uploading to S3://$S3_BUCKET/$S3_KEY"

aws s3 cp "$BUILD_FILE" "s3://$S3_BUCKET/$S3_KEY" \
    --region "$S3_REGION" \
    --acl public-read \
    --metadata "app-id=$APP_ID,platform=$PLATFORM,timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Get file size
FILE_SIZE=$(du -h "$BUILD_FILE" | cut -f1)
echo "✅ Upload completed"
echo "📊 File size: $FILE_SIZE"

# Generate presigned URL (valid for 7 days)
PRESIGNED_URL=$(aws s3 presign "s3://$S3_BUCKET/$S3_KEY" \
    --region "$S3_REGION" \
    --expires-in 604800)

echo "🔗 Download URL: $PRESIGNED_URL"

# Save URL to file for later use
mkdir -p build-output
echo "$PRESIGNED_URL" > "build-output/${PLATFORM}-url.txt"

exit 0
