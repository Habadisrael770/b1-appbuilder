# B1 AppBuilder - Automated Build System

## Overview

This document describes the complete automated build system for generating APK and IPA files from websites using GitHub Actions CI/CD pipeline.

## Architecture

```
User Request (Web UI)
    ↓
Backend API (tRPC)
    ↓
GitHub Actions Trigger (repository_dispatch)
    ↓
Android Build Pipeline (Ubuntu)
    ↓
iOS Build Pipeline (macOS)
    ↓
S3 Upload
    ↓
Database Update
    ↓
User Download
```

## Components

### 1. GitHub Actions Workflows

#### `build-android.yml`
- **Trigger:** `repository_dispatch` event with type `build-android`
- **Runner:** `ubuntu-latest`
- **Steps:**
  1. Checkout code
  2. Setup Java 17
  3. Setup Android SDK
  4. Configure app (customize manifest, colors, strings)
  5. Build APK using Gradle
  6. Sign APK with keystore
  7. Upload to S3
  8. Update database
  9. Notify backend

#### `build-ios.yml`
- **Trigger:** `repository_dispatch` event with type `build-ios`
- **Runner:** `macos-latest`
- **Steps:**
  1. Checkout code
  2. Setup Xcode
  3. Install dependencies (CocoaPods)
  4. Configure app (update Info.plist, bundle ID)
  5. Import signing certificate
  6. Import provisioning profile
  7. Build archive
  8. Export IPA
  9. Sign IPA
  10. Upload to S3
  11. Update database
  12. Notify backend

### 2. Build Scripts

#### `configure-android.sh`
Customizes Android app before building:
- Updates package name in `AndroidManifest.xml`
- Updates app name and colors
- Creates `config.json` with app configuration
- Modifies `build.gradle` with application ID

**Usage:**
```bash
./scripts/configure-android.sh "com.example.app" "My App" "https://example.com" "#007AFF"
```

#### `build-android.sh`
Builds unsigned APK:
- Runs `./gradlew clean`
- Runs `./gradlew assembleRelease`
- Verifies APK creation
- Reports APK size and location

**Usage:**
```bash
./scripts/build-android.sh
```

#### `sign-apk.sh`
Signs APK with keystore:
- Creates keystore if not exists
- Signs APK with jarsigner
- Verifies signature
- Outputs signed APK

**Usage:**
```bash
./scripts/sign-apk.sh
```

**Environment Variables:**
- `KEYSTORE_PASSWORD` - Keystore password
- `KEY_PASSWORD` - Key password

#### `configure-ios.sh`
Customizes iOS app before building:
- Updates bundle identifier in `Info.plist`
- Updates app name
- Creates `config.json` with app configuration
- Creates `LaunchScreen.json`

**Usage:**
```bash
./scripts/configure-ios.sh "com.example.app" "My App" "https://example.com" "#007AFF"
```

#### `upload-s3.sh`
Uploads build artifact to S3:
- Determines file based on platform
- Uploads to S3 bucket
- Generates presigned URL (7 days validity)
- Saves URL to file for database update

**Usage:**
```bash
./scripts/upload-s3.sh "app-123" "android"
```

**Environment Variables:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (default: us-east-1)
- `AWS_S3_BUCKET` (default: b1-appbuilder-builds)

#### `update-db.sh`
Updates database with build information:
- Marks build as COMPLETED
- Stores download URL
- Records completion timestamp

**Usage:**
```bash
./scripts/update-db.sh "app-123" "ANDROID"
```

**Environment Variables:**
- `DATABASE_URL` - Database connection string

## Setup Instructions

### 1. GitHub Repository

```bash
cd /home/ubuntu/b1-appbuilder
git init
git add .
git commit -m "Initial commit: Build system setup"
git remote add origin https://github.com/yourusername/b1-appbuilder.git
git push -u origin main
```

### 2. GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets):

#### Android Secrets
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_PASSWORD` - Key password

#### iOS Secrets
- `IOS_SIGNING_CERT` - Base64-encoded signing certificate (.p12)
- `IOS_CERT_PASSWORD` - Certificate password
- `IOS_PROVISIONING_PROFILE` - Base64-encoded provisioning profile

#### AWS Secrets
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

#### Database Secrets
- `DATABASE_URL` - Database connection string

### 3. Android Setup

```bash
# Install Android SDK
# Set ANDROID_HOME environment variable
# Create keystore for signing
keytool -genkey -v -keystore build-templates/android/keystore.jks \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -alias release-key \
    -storepass "your-password" \
    -keypass "your-password"
```

### 4. iOS Setup

```bash
# Install Xcode
# Create signing certificate and provisioning profile
# Export certificate as .p12 file
# Base64 encode for GitHub secret:
base64 -i certificate.p12 | pbcopy

# Base64 encode provisioning profile:
base64 -i profile.mobileprovision | pbcopy
```

### 5. AWS S3 Setup

```bash
# Create S3 bucket
aws s3 mb s3://b1-appbuilder-builds --region us-east-1

# Enable public read access
aws s3api put-bucket-acl --bucket b1-appbuilder-builds --acl public-read

# Create IAM user with S3 access
# Generate access keys for GitHub secrets
```

## Triggering Builds

### From Backend (tRPC)

```typescript
// In your tRPC procedure
const response = await fetch('https://api.github.com/repos/yourusername/b1-appbuilder/dispatches', {
  method: 'POST',
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+raw+json'
  },
  body: JSON.stringify({
    event_type: 'build-android',
    client_payload: {
      appId: 'app-123',
      appName: 'My App',
      websiteUrl: 'https://example.com',
      primaryColor: '#007AFF'
    }
  })
});
```

### From GitHub UI

1. Go to Actions tab
2. Select workflow (Build Android APK or Build iOS IPA)
3. Click "Run workflow"
4. Fill in parameters
5. Click "Run workflow"

## Build Output

### APK
- Location: `build-templates/android/app/build/outputs/apk/release/app-release.apk`
- Size: ~10-20 MB
- Format: Signed APK

### IPA
- Location: `build-templates/ios/build/ipa/MyApp.ipa`
- Size: ~20-50 MB
- Format: Signed IPA

## Monitoring Builds

### GitHub Actions UI
- View workflow runs: https://github.com/yourusername/b1-appbuilder/actions
- Check logs for each step
- Download artifacts

### Database
- Check `builds` table for build status
- Track `download_url` for user access
- Monitor `completed_at` timestamp

## Troubleshooting

### Android Build Fails
- Check Java version (should be 17)
- Verify Android SDK installation
- Check `build.gradle` configuration
- Review Gradle logs

### iOS Build Fails
- Check Xcode version compatibility
- Verify signing certificate validity
- Check provisioning profile
- Review Xcode build logs

### S3 Upload Fails
- Verify AWS credentials
- Check S3 bucket permissions
- Verify bucket exists and is accessible
- Check IAM user permissions

### Database Update Fails
- Verify DATABASE_URL is correct
- Check database connection
- Verify table structure
- Check user permissions

## Performance Targets

- Android build time: < 5 minutes
- iOS build time: < 10 minutes
- APK size: < 15 MB
- IPA size: < 40 MB
- S3 upload: < 2 minutes
- Total time: < 20 minutes

## Security Considerations

1. **Signing Keys**
   - Store keystore securely
   - Use strong passwords
   - Rotate keys annually

2. **Certificates**
   - Keep certificates secure
   - Monitor expiration dates
   - Renew before expiration

3. **Secrets**
   - Use GitHub Secrets for sensitive data
   - Never commit secrets to repository
   - Rotate credentials regularly

4. **Code Signing**
   - Always sign builds
   - Verify signatures before distribution
   - Use secure signing protocols

## Future Enhancements

1. **Parallel Builds**
   - Build Android and iOS simultaneously
   - Reduce total build time

2. **Caching**
   - Cache dependencies
   - Cache build artifacts
   - Reduce build time

3. **Testing**
   - Add unit tests
   - Add integration tests
   - Add E2E tests

4. **Notifications**
   - Email notifications on build completion
   - Slack notifications
   - Build status dashboard

5. **Analytics**
   - Track build times
   - Monitor success rates
   - Analyze failure patterns

## Support

For issues or questions:
1. Check GitHub Actions logs
2. Review troubleshooting section
3. Contact development team
4. File GitHub issue

---

**Last Updated:** December 10, 2024
**Version:** 1.0.0
