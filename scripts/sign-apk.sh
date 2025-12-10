#!/bin/bash

# Sign Android APK Script
# Usage: ./sign-apk.sh

set -e

echo "🔐 Signing Android APK..."

# Configuration
ANDROID_DIR="build-templates/android"
OUTPUT_DIR="$ANDROID_DIR/app/build/outputs/apk/release"
UNSIGNED_APK="$OUTPUT_DIR/app-release-unsigned.apk"
SIGNED_APK="$OUTPUT_DIR/app-release.apk"
KEYSTORE="$ANDROID_DIR/keystore.jks"

# Check if unsigned APK exists
if [ ! -f "$UNSIGNED_APK" ]; then
    echo "❌ Unsigned APK not found at $UNSIGNED_APK"
    exit 1
fi

# Check if keystore exists
if [ ! -f "$KEYSTORE" ]; then
    echo "⚠️  Keystore not found. Creating test keystore..."
    mkdir -p "$ANDROID_DIR"
    keytool -genkey -v -keystore "$KEYSTORE" \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -alias release-key \
        -storepass "${KEYSTORE_PASSWORD:-android}" \
        -keypass "${KEY_PASSWORD:-android}" \
        -dname "CN=B1AppBuilder,O=B1,L=Global,C=US"
fi

# Sign APK
echo "🔏 Signing APK with keystore..."
jarsigner -verbose \
    -sigalg SHA256withRSA \
    -digestalg SHA-256 \
    -keystore "$KEYSTORE" \
    -storepass "${KEYSTORE_PASSWORD:-android}" \
    -keypass "${KEY_PASSWORD:-android}" \
    "$UNSIGNED_APK" \
    release-key

# Verify signature
echo "✅ Verifying APK signature..."
jarsigner -verify -verbose "$UNSIGNED_APK"

# Rename to signed
cp "$UNSIGNED_APK" "$SIGNED_APK"

echo "✅ APK signed successfully"
echo "📦 Signed APK location: $SIGNED_APK"

# Get APK size
APK_SIZE=$(du -h "$SIGNED_APK" | cut -f1)
echo "📊 Signed APK size: $APK_SIZE"

exit 0
