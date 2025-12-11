# iOS Setup & Implementation Guide

**Document Version:** 1.0  
**Date:** December 11, 2024  
**Status:** Implementation Guide

---

## 📋 Overview

This guide explains how to set up iOS app building for B1 AppBuilder using GitHub Actions, Xcode, and Apple Developer certificates.

---

## 🔧 Prerequisites

### 1. Apple Developer Account

- Active Apple Developer Program membership ($99/year)
- Access to [developer.apple.com](https://developer.apple.com)
- Ability to create certificates and provisioning profiles

### 2. GitHub Repository

- Repository with GitHub Actions enabled
- Secrets configured (see below)
- Xcode project in `build-templates/ios/`

### 3. Local Development

- macOS with Xcode 14+
- CocoaPods installed
- Command line tools configured

---

## 📝 Step 1: Create Signing Certificate

### Generate Certificate Signing Request (CSR)

1. Open **Keychain Access** on macOS
2. Go to **Keychain Access** → **Certificate Assistant** → **Request a Certificate from a Certificate Authority**
3. Enter your email and name
4. Choose "Saved to disk"
5. Save as `CertificateSigningRequest.certSigningRequest`

### Create Distribution Certificate

1. Go to [developer.apple.com/account](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles** → **Certificates**
3. Click **+** to create new certificate
4. Select **iOS Distribution**
5. Upload your CSR file
6. Download the certificate as `ios_distribution.cer`

### Export as P12

1. Open **Keychain Access**
2. Find your certificate (should appear after downloading)
3. Right-click → **Export**
4. Save as `Certificates.p12`
5. Enter a password (remember this!)

### Convert to Base64

```bash
base64 -i Certificates.p12 -o Certificates.p12.base64
cat Certificates.p12.base64
```

---

## 🔑 Step 2: Create Provisioning Profile

### Register App ID

1. Go to **Certificates, Identifiers & Profiles** → **Identifiers**
2. Click **+** to create new identifier
3. Select **App IDs**
4. Enter Bundle ID: `com.b1appbuilder.yourapp`
5. Click **Continue** and **Register**

### Create Provisioning Profile

1. Go to **Provisioning Profiles** → **Distribution**
2. Click **+** to create new profile
3. Select **App Store**
4. Select your App ID
5. Select your certificate
6. Name it (e.g., `B1AppBuilder Distribution`)
7. Download as `.mobileprovision`

### Convert to Base64

```bash
base64 -i B1AppBuilder_Distribution.mobileprovision -o profile.base64
cat profile.base64
```

---

## 📋 Step 3: Create Export Options Plist

Create `ExportOptions.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>provisioningProfiles</key>
    <dict>
        <key>com.b1appbuilder.yourapp</key>
        <string>B1AppBuilder Distribution</string>
    </dict>
</dict>
</plist>
```

### Convert to Base64

```bash
base64 -i ExportOptions.plist -o ExportOptions.plist.base64
cat ExportOptions.plist.base64
```

---

## 🔐 Step 4: Configure GitHub Secrets

Add these secrets to your GitHub repository:

### Required Secrets

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `IOS_BUILD_CERTIFICATE_BASE64` | Base64 of Certificates.p12 | Distribution certificate |
| `IOS_P12_PASSWORD` | Password for P12 | Certificate password |
| `IOS_PROVISIONING_PROFILE_BASE64` | Base64 of .mobileprovision | Provisioning profile |
| `IOS_EXPORT_OPTIONS_PLIST` | Base64 of ExportOptions.plist | Export configuration |
| `IOS_KEYCHAIN_PASSWORD` | Any secure password | Keychain password |
| `RAILWAY_PROJECT_ID` | Your Railway project ID | For artifact storage |

### How to Add Secrets

1. Go to GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter name and value
5. Click **Add secret**

---

## 🏗️ Step 5: Configure Xcode Project

### Update Bundle ID

1. Open `build-templates/ios/MyApp.xcodeproj`
2. Select **MyApp** target
3. Go to **Build Settings**
4. Search for "Bundle Identifier"
5. Update to `com.b1appbuilder.${APP_NAME}`

### Configure Signing

1. Select **MyApp** target
2. Go to **Signing & Capabilities**
3. Select **Team**
4. Ensure "Automatically manage signing" is checked

### Update Version

1. Go to **General** tab
2. Update **Version** (e.g., 1.0.0)
3. Update **Build** (e.g., 1)

---

## 🚀 Step 6: Test Build Locally

### Build Archive

```bash
cd build-templates/ios

xcodebuild -workspace MyApp.xcworkspace \
  -scheme MyApp \
  -configuration Release \
  -derivedDataPath build \
  -archivePath build/MyApp.xcarchive \
  archive
```

### Export IPA

```bash
xcodebuild -exportArchive \
  -archivePath build/MyApp.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/export
```

### Verify IPA

```bash
ls -lh build/export/MyApp.ipa
```

---

## 🔄 Step 7: GitHub Actions Workflow

The workflow (`.github/workflows/build-ios.yml`) includes:

### Workflow Steps

1. **Checkout code** - Get repository
2. **Setup Xcode** - Install latest Xcode
3. **Setup Node.js** - Install Node 18
4. **Install dependencies** - CocoaPods
5. **Configure app** - Set app name, URL, colors
6. **Import signing certificate** - From GitHub secret
7. **Import provisioning profile** - From GitHub secret
8. **Build archive** - Create .xcarchive
9. **Export IPA** - Generate .ipa file
10. **Verify IPA** - Check file exists
11. **Upload to Railway** - Store artifact
12. **Update database** - Mark build complete
13. **Upload artifact** - GitHub artifact storage

---

## 🧪 Step 8: Trigger Build

### Manual Trigger

```bash
gh workflow run build-ios.yml \
  -f appId=123 \
  -f appName="MyApp" \
  -f websiteUrl="https://example.com" \
  -f primaryColor="#00A86B"
```

### Programmatic Trigger

```typescript
// From backend
const response = await fetch("https://api.github.com/repos/owner/repo/dispatches", {
  method: "POST",
  headers: {
    "Authorization": `token ${GITHUB_TOKEN}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    event_type: "build-ios",
    client_payload: {
      appId: "123",
      appName: "MyApp",
      websiteUrl: "https://example.com",
      primaryColor: "#00A86B"
    }
  })
});
```

---

## 📊 Monitoring Build

### Check Workflow Status

1. Go to GitHub repository
2. Click **Actions** tab
3. Find **Build iOS IPA** workflow
4. Click to see details

### View Logs

- Click workflow run
- Click **build** job
- Expand steps to see logs

### Download Artifact

- Click workflow run
- Scroll to **Artifacts**
- Download `ios-ipa` zip

---

## 🐛 Troubleshooting

### Certificate Import Fails

**Error:** "The specified item could not be found in the keychain"

**Solution:**
- Verify certificate is not expired
- Check P12 password is correct
- Try re-exporting certificate from Keychain

### Provisioning Profile Invalid

**Error:** "Provisioning profile is invalid"

**Solution:**
- Verify profile is not expired
- Check Bundle ID matches
- Re-download profile from Apple Developer

### Xcode Build Fails

**Error:** "xcodebuild: error: unable to find a matching provisioning profile"

**Solution:**
- Verify provisioning profile is imported
- Check Bundle ID in Xcode project
- Ensure certificate is in keychain

### IPA Export Fails

**Error:** "The app cannot be exported"

**Solution:**
- Check ExportOptions.plist is valid
- Verify Team ID is correct
- Check provisioning profile name matches

---

## 📱 Testing IPA

### Install on Device

```bash
# Using Xcode
xcode-select --install

# Using Apple Configurator 2
# Or TestFlight for beta testing
```

### Install on Simulator

```bash
# List available simulators
xcrun simctl list devices

# Install IPA
xcrun simctl install booted MyApp.ipa
```

### TestFlight Distribution

1. Upload IPA to App Store Connect
2. Add testers
3. Send TestFlight link
4. Testers install via TestFlight app

---

## 🚀 App Store Submission

### Prepare for Submission

1. Update app version
2. Add app screenshots
3. Write app description
4. Set pricing
5. Configure privacy policy

### Submit to App Store

1. Go to App Store Connect
2. Select your app
3. Click **Prepare for Submission**
4. Fill in required information
5. Click **Submit for Review**

### Review Process

- Apple reviews app (typically 24-48 hours)
- App approved or rejected
- If approved, app becomes available on App Store

---

## 📞 Support

For issues, contact:
- Apple Developer Support: [developer.apple.com/support](https://developer.apple.com/support)
- B1 AppBuilder Support: support@b1appbuilder.com

---

## 🔗 Related Documents

- `BUILD_SYSTEM_README.md` - Build system overview
- `.github/workflows/build-ios.yml` - GitHub Actions workflow
- `SECURITY_HARDENING.md` - Security best practices

---

**End of iOS Setup Guide**

**Version:** 1.0  
**Last Updated:** December 11, 2024  
**Status:** Ready for Implementation
