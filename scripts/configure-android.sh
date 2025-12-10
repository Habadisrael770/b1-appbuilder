#!/bin/bash

# Configure Android App Script
# Usage: ./configure-android.sh <appId> <appName> <websiteUrl> <primaryColor>

set -e

APP_ID="${1:-com.example.app}"
APP_NAME="${2:-My App}"
WEBSITE_URL="${3:-https://example.com}"
PRIMARY_COLOR="${4:-#007AFF}"

echo "⚙️  Configuring Android app..."
echo "   App ID: $APP_ID"
echo "   App Name: $APP_NAME"
echo "   Website: $WEBSITE_URL"
echo "   Color: $PRIMARY_COLOR"

# Configuration
ANDROID_DIR="build-templates/android"
MANIFEST_FILE="$ANDROID_DIR/app/src/main/AndroidManifest.xml"
STRINGS_FILE="$ANDROID_DIR/app/src/main/res/values/strings.xml"
COLORS_FILE="$ANDROID_DIR/app/src/main/res/values/colors.xml"
BUILD_GRADLE="$ANDROID_DIR/app/build.gradle"

# Update AndroidManifest.xml
echo "📝 Updating AndroidManifest.xml..."
if [ -f "$MANIFEST_FILE" ]; then
    sed -i "s|package=\".*\"|package=\"$APP_ID\"|g" "$MANIFEST_FILE"
    sed -i "s|android:label=\".*\"|android:label=\"$APP_NAME\"|g" "$MANIFEST_FILE"
    echo "   ✅ Package name updated to: $APP_ID"
    echo "   ✅ App label updated to: $APP_NAME"
else
    echo "   ⚠️  AndroidManifest.xml not found"
fi

# Update strings.xml
echo "📝 Updating strings.xml..."
if [ -f "$STRINGS_FILE" ]; then
    # Create/update strings.xml with app configuration
    cat > "$STRINGS_FILE" << EOF
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">$APP_NAME</string>
    <string name="website_url">$WEBSITE_URL</string>
    <string name="app_id">$APP_ID</string>
    <string name="primary_color">$PRIMARY_COLOR</string>
</resources>
EOF
    echo "   ✅ strings.xml updated"
else
    echo "   ⚠️  strings.xml not found"
fi

# Update colors.xml
echo "📝 Updating colors.xml..."
if [ -f "$COLORS_FILE" ]; then
    cat > "$COLORS_FILE" << EOF
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">$PRIMARY_COLOR</color>
    <color name="primary_dark">#0051BA</color>
    <color name="accent">$PRIMARY_COLOR</color>
    <color name="white">#FFFFFF</color>
    <color name="black">#000000</color>
</resources>
EOF
    echo "   ✅ colors.xml updated"
else
    echo "   ⚠️  colors.xml not found"
fi

# Update build.gradle
echo "📝 Updating build.gradle..."
if [ -f "$BUILD_GRADLE" ]; then
    sed -i "s|applicationId \".*\"|applicationId \"$APP_ID\"|g" "$BUILD_GRADLE"
    echo "   ✅ Application ID updated to: $APP_ID"
else
    echo "   ⚠️  build.gradle not found"
fi

# Create WebView configuration
echo "📝 Creating WebView configuration..."
mkdir -p "$ANDROID_DIR/app/src/main/assets"
cat > "$ANDROID_DIR/app/src/main/assets/config.json" << EOF
{
  "appId": "$APP_ID",
  "appName": "$APP_NAME",
  "websiteUrl": "$WEBSITE_URL",
  "primaryColor": "$PRIMARY_COLOR",
  "version": "1.0.0",
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
echo "   ✅ config.json created"

echo "✅ Android app configured successfully"

exit 0
