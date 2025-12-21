#!/bin/bash

# =========================================
# BACKEND E2E – PRODUCTION VERIFICATION
# Single runnable script (NO frontend)
# =========================================

set -euo pipefail

API_BASE="http://localhost:3000"
APP_ID=1
USER_ID=1
PLATFORM="ANDROID"

echo "==> 1) START BUILD"
BUILD_RESPONSE=$(curl -s -X POST "$API_BASE/api/builds/start" \
  -H "Content-Type: application/json" \
  -d "{\"appId\":$APP_ID,\"userId\":$USER_ID,\"platform\":\"$PLATFORM\"}")

echo "Response: $BUILD_RESPONSE"

BUILD_ID=$(echo "$BUILD_RESPONSE" | jq -r '.buildId // empty')

if [[ -z "$BUILD_ID" || "$BUILD_ID" == "null" ]]; then
  echo "FAILED: did not receive buildId"
  echo "Full response: $BUILD_RESPONSE"
  exit 1
fi
echo "✅ buildId=$BUILD_ID"

echo ""
echo "==> 2) POLL STATUS UNTIL COMPLETED/FAILED"
STATUS=""
PROGRESS=0
for i in {1..120}; do
  RESP=$(curl -s "$API_BASE/api/builds/status?buildId=$BUILD_ID")
  STATUS=$(echo "$RESP" | jq -r '.status // "UNKNOWN"')
  PROGRESS=$(echo "$RESP" | jq -r '.progress // 0')
  echo "[$i/120] status=$STATUS progress=$PROGRESS%"
  
  if [[ "$STATUS" == "COMPLETED" ]]; then
    echo "✅ Build completed!"
    break
  fi
  
  if [[ "$STATUS" == "FAILED" ]]; then
    echo "❌ FAILED: build failed"
    ERROR=$(echo "$RESP" | jq -r '.error // "Unknown error"')
    echo "Error: $ERROR"
    exit 1
  fi
  
  sleep 15
done

if [[ "$STATUS" != "COMPLETED" ]]; then
  echo "❌ FAILED: build did not complete in time (last status: $STATUS)"
  exit 1
fi

echo ""
echo "==> 3) DOWNLOAD APK"
curl -L -o /tmp/app.apk "$API_BASE/api/builds/download?buildId=$BUILD_ID"

if [[ ! -s /tmp/app.apk ]]; then
  echo "❌ FAILED: APK not downloaded or empty"
  exit 1
fi

echo "✅ APK downloaded successfully"
ls -lh /tmp/app.apk

echo ""
echo "=========================================="
echo "✅ Backend E2E verified (production)"
echo "=========================================="
