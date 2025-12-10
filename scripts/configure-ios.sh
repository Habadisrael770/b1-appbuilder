#!/bin/bash

# Configure iOS App Script
# Usage: ./configure-ios.sh <appId> <appName> <websiteUrl> <primaryColor>

set -e

APP_ID="${1:-com.example.app}"
APP_NAME="${2:-My App}"
WEBSITE_URL="${3:-https://example.com}"
PRIMARY_COLOR="${4:-#007AFF}"

echo "⚙️  Configuring iOS app..."
echo "   Bundle ID: $APP_ID"
echo "   App Name: $APP_NAME"
echo "   Website: $WEBSITE_URL"
echo "   Color: $PRIMARY_COLOR"

# Configuration
IOS_DIR="build-templates/ios"
INFO_PLIST="$IOS_DIR/MyApp/Info.plist"
PBXPROJ="$IOS_DIR/MyApp.xcodeproj/project.pbxproj"

# Update Info.plist
echo "📝 Updating Info.plist..."
if [ -f "$INFO_PLIST" ]; then
    # Update bundle identifier
    /usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier $APP_ID" "$INFO_PLIST" 2>/dev/null || true
    
    # Update app name
    /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName $APP_NAME" "$INFO_PLIST" 2>/dev/null || true
    /usr/libexec/PlistBuddy -c "Set :CFBundleName $APP_NAME" "$INFO_PLIST" 2>/dev/null || true
    
    echo "   ✅ Bundle ID updated to: $APP_ID"
    echo "   ✅ App name updated to: $APP_NAME"
else
    echo "   ⚠️  Info.plist not found"
fi

# Update project.pbxproj
echo "📝 Updating project.pbxproj..."
if [ -f "$PBXPROJ" ]; then
    sed -i "" "s|PRODUCT_BUNDLE_IDENTIFIER = .*;|PRODUCT_BUNDLE_IDENTIFIER = $APP_ID;|g" "$PBXPROJ"
    echo "   ✅ Bundle identifier updated"
else
    echo "   ⚠️  project.pbxproj not found"
fi

# Create configuration file
echo "📝 Creating app configuration..."
mkdir -p "$IOS_DIR/MyApp/Resources"
cat > "$IOS_DIR/MyApp/Resources/config.json" << EOF
{
  "bundleId": "$APP_ID",
  "appName": "$APP_NAME",
  "websiteUrl": "$WEBSITE_URL",
  "primaryColor": "$PRIMARY_COLOR",
  "version": "1.0.0",
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
echo "   ✅ config.json created"

# Create LaunchScreen configuration
echo "📝 Creating LaunchScreen configuration..."
cat > "$IOS_DIR/MyApp/LaunchScreen.json" << EOF
{
  "appName": "$APP_NAME",
  "primaryColor": "$PRIMARY_COLOR",
  "backgroundColor": "#FFFFFF"
}
EOF
echo "   ✅ LaunchScreen.json created"

echo "✅ iOS app configured successfully"

exit 0
