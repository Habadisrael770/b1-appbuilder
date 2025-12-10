# iOS Developer Prompt for Claude

**Role:** Senior iOS Developer specializing in IPA building and WKWebView integration

**Task:** Build an automated IPA generation system for B1 AppBuilder

---

## Project Context

**B1 AppBuilder** is a Web-to-IPA converter. Users provide:
- Website URL
- App name
- Colors (primary, secondary)
- App icon (1024x1024 PNG)
- Splash screen (2732x2732 PNG)

**Output:** Installable IPA file that wraps the website in a WKWebView

---

## Requirements

### 1. iOS Project Template
Create a base iOS project with:
- Xcode project configuration
- WKWebView component
- Customizable app name
- Customizable colors
- Icon support (AppIcon.appiconset)
- Splash screen support (LaunchScreen.storyboard)
- Swift/SwiftUI implementation

### 2. Xcode Build Configuration
```swift
- Minimum deployment target: iOS 14.0
- Target SDK: iOS 17.0
- WKWebView framework
- Build variants (debug/release)
- Code signing configuration
```

### 3. WKWebView Implementation
```swift
- Load website URL dynamically
- Handle navigation
- Enable JavaScript
- Enable local storage
- Handle permissions (camera, microphone, location)
- Implement custom user agent
```

### 4. Customization System
```swift
- Inject app name into Info.plist
- Inject colors into Assets.xcassets
- Replace app icon
- Replace launch screen
- Update bundle identifier dynamically
```

### 5. Code Signing
```bash
- Create provisioning profile
- Import signing certificate
- Configure code signing settings
- Verify certificate validity
```

### 6. Build Automation Script
```bash
#!/bin/bash
# Input: website_url, app_name, colors, icon, splash
# Output: signed IPA file
# Process:
# 1. Clone template
# 2. Inject customizations
# 3. Build with xcodebuild
# 4. Archive
# 5. Export IPA
# 6. Return IPA path
```

---

## Deliverables

1. **iOS Project Structure**
   - `project.pbxproj` (Xcode project)
   - `Info.plist`
   - `AppDelegate.swift`
   - `SceneDelegate.swift`
   - `WebViewController.swift`
   - `Assets.xcassets/AppIcon.appiconset`
   - `LaunchScreen.storyboard`

2. **Build Scripts**
   - `build-ipa.sh` - Automated IPA generation
   - `sign-ipa.sh` - IPA signing
   - `configure-app.sh` - Inject customizations

3. **Configuration Files**
   - `project.pbxproj` (with build settings)
   - `ExportOptions.plist` (for archiving)
   - `build.xcconfig` (build configuration)

4. **Documentation**
   - Setup instructions
   - Build process explanation
   - Customization guide
   - Troubleshooting

---

## Technical Specifications

### WKWebView Configuration
```swift
let webView = WKWebView(frame: .zero, configuration: WKWebViewConfiguration())
webView.configuration.preferences.javaScriptEnabled = true
webView.configuration.websiteDataStore.httpShouldUseCookies = true
webView.configuration.allowsInlineMediaPlayback = true

let request = URLRequest(url: URL(string: websiteUrl)!)
webView.load(request)
```

### Info.plist Customization
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleIdentifier</key>
    <string>com.b1.${APP_ID}</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
</dict>
</plist>
```

### Xcode Build Configuration
```bash
xcodebuild -project MyApp.xcodeproj \
  -scheme MyApp \
  -configuration Release \
  -derivedDataPath build \
  -archivePath build/MyApp.xcarchive \
  archive

xcodebuild -exportArchive \
  -archivePath build/MyApp.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/ipa
```

---

## Build Process Flow

```
Input (JSON):
{
  "appId": "app-123",
  "appName": "My App",
  "websiteUrl": "https://example.com",
  "primaryColor": "#00A86B",
  "secondaryColor": "#008556",
  "iconUrl": "s3://bucket/icon.png",
  "splashUrl": "s3://bucket/splash.png"
}

Process:
1. Clone iOS template
2. Download icon & splash from S3
3. Update Info.plist with app name
4. Update Colors.xcassets with custom colors
5. Replace AppIcon.appiconset
6. Update LaunchScreen.storyboard
7. Update WKWebView URL
8. Update bundle identifier
9. Run: xcodebuild archive
10. Export IPA
11. Code sign IPA
12. Verify signature
13. Upload to S3
14. Return S3 URL

Output:
{
  "success": true,
  "ipaUrl": "s3://bucket/builds/app-123.ipa",
  "size": "8.5 MB",
  "signature": "verified"
}
```

---

## Security Considerations

1. **Code Signing**
   - Use Apple Developer account
   - Manage provisioning profiles
   - Protect private keys
   - Verify certificate validity

2. **WKWebView Security**
   - Disable file access
   - Validate URLs
   - Implement CSP headers
   - Disable JavaScript bridge if not needed

3. **Permissions**
   - Request only necessary permissions
   - Handle runtime permissions
   - Transparent to user
   - Privacy policy compliance

---

## Testing Requirements

1. **Unit Tests**
   - WKWebView loading
   - Customization injection
   - Build configuration

2. **Integration Tests**
   - Full build process
   - IPA installation
   - App functionality

3. **Device Tests**
   - iOS 14.0+ compatibility
   - Various screen sizes (iPhone, iPad)
   - Network conditions
   - Permissions handling

---

## Performance Targets

- Build time: < 10 minutes
- IPA size: < 15 MB
- App startup: < 2 seconds
- Memory usage: < 150 MB

---

## Deliverable Format

Please provide:

1. **Complete iOS Project**
   - Xcode project files
   - Source code (Swift)
   - Storyboards/XIB files
   - Asset catalogs

2. **Build Scripts**
   - Bash scripts for automation
   - Configuration files
   - Environment setup

3. **Documentation**
   - README.md
   - Setup guide
   - Build instructions
   - Troubleshooting

4. **Example**
   - Sample IPA generation
   - Test cases
   - Verification steps

---

## Questions to Address

1. How to handle dynamic bundle identifiers?
2. How to manage signing certificates securely?
3. How to optimize IPA size?
4. How to handle WKWebView permissions?
5. How to verify IPA signature?
6. How to handle build failures?
7. How to support multiple iOS versions?
8. How to implement auto-updates?
9. How to handle App Store submission?
10. How to configure provisioning profiles?

---

## Apple Developer Requirements

- Apple Developer Account ($99/year)
- Signing certificate (Apple Developer)
- Provisioning profile (App ID)
- App Store Connect access
- Privacy policy
- App description & screenshots

---

**Please provide a complete, production-ready iOS IPA building system.**
