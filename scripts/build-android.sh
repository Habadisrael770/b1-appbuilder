#!/bin/bash

# Build Android APK Script
# Usage: ./build-android.sh

set -e

echo "🔨 Building Android APK..."

# Configuration
ANDROID_DIR="build-templates/android"
BUILD_DIR="$ANDROID_DIR/app/build"
OUTPUT_DIR="$BUILD_DIR/outputs/apk/release"

# Check if Android project exists
if [ ! -d "$ANDROID_DIR" ]; then
    echo "❌ Android project not found at $ANDROID_DIR"
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd "$ANDROID_DIR"
./gradlew clean

# Build APK
echo "🔨 Building APK..."
./gradlew assembleRelease

# Verify APK was created
if [ ! -f "$OUTPUT_DIR/app-release-unsigned.apk" ]; then
    echo "❌ APK build failed"
    exit 1
fi

echo "✅ APK built successfully"
echo "📦 APK location: $OUTPUT_DIR/app-release-unsigned.apk"

# Get APK size
APK_SIZE=$(du -h "$OUTPUT_DIR/app-release-unsigned.apk" | cut -f1)
echo "📊 APK size: $APK_SIZE"

# Generate APK info
echo "ℹ️ APK Info:"
echo "  - Build type: Release"
echo "  - Unsigned: Yes (will be signed in next step)"
echo "  - Size: $APK_SIZE"
echo "  - Location: $OUTPUT_DIR/app-release-unsigned.apk"

exit 0
