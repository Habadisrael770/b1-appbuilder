# DevOps Engineer Prompt for Grok

**Role:** Senior DevOps Engineer specializing in CI/CD pipelines and build automation

**Task:** Build a complete GitHub Actions CI/CD pipeline for automated APK/IPA generation

---

## Project Context

**B1 AppBuilder** is a Web-to-APK/IPA converter. The system needs:
- Automated build triggers
- Parallel Android & iOS builds
- Code signing automation
- Artifact management
- S3 upload
- Database updates
- Error handling & notifications

---

## Requirements

### 1. GitHub Actions Workflow - Android Build
```yaml
Trigger: API call from backend
Steps:
1. Checkout code
2. Setup Android SDK
3. Configure Gradle
4. Download assets from S3
5. Inject customizations
6. Build APK
7. Sign APK
8. Upload to S3
9. Update database
10. Notify backend
```

### 2. GitHub Actions Workflow - iOS Build
```yaml
Trigger: API call from backend
Steps:
1. Checkout code
2. Setup Xcode
3. Install dependencies
4. Download assets from S3
5. Inject customizations
6. Build IPA
7. Sign IPA
8. Upload to S3
9. Update database
10. Notify backend
```

### 3. Build Orchestration
```yaml
- Trigger both builds in parallel
- Wait for completion
- Handle failures gracefully
- Aggregate results
- Update database with URLs
```

### 4. Secrets Management
```yaml
- Android signing keystore
- iOS signing certificate
- iOS provisioning profile
- S3 credentials
- Database credentials
- GitHub token
```

### 5. Artifact Management
```yaml
- Store APK/IPA in S3
- Versioning (build number)
- Cleanup old artifacts
- Generate download URLs
- Track build metadata
```

### 6. Error Handling
```yaml
- Build failures
- Signing failures
- S3 upload failures
- Database update failures
- Notification on errors
```

---

## Deliverables

1. **GitHub Actions Workflows**
   - `.github/workflows/build-android.yml`
   - `.github/workflows/build-ios.yml`
   - `.github/workflows/build-orchestrate.yml`
   - `.github/workflows/cleanup.yml`

2. **Build Scripts**
   - `scripts/build-android.sh`
   - `scripts/build-ios.sh`
   - `scripts/sign-apk.sh`
   - `scripts/sign-ipa.sh`
   - `scripts/upload-s3.sh`
   - `scripts/update-db.sh`

3. **Configuration Files**
   - `gradle.properties`
   - `ExportOptions.plist`
   - `build.xcconfig`
   - `.env.example`

4. **Documentation**
   - Setup guide
   - Workflow explanation
   - Troubleshooting
   - Security best practices

---

## Technical Specifications

### GitHub Actions Workflow - Android

```yaml
name: Build Android APK

on:
  workflow_dispatch:
    inputs:
      appId:
        description: 'App ID'
        required: true
      appName:
        description: 'App Name'
        required: true
      websiteUrl:
        description: 'Website URL'
        required: true
      primaryColor:
        description: 'Primary Color'
        required: true
      iconUrl:
        description: 'Icon URL'
        required: true
      splashUrl:
        description: 'Splash URL'
        required: true

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Setup Android SDK
        uses: android-actions/setup-android@v2
      
      - name: Download assets
        run: |
          aws s3 cp ${{ inputs.iconUrl }} ./icon.png
          aws s3 cp ${{ inputs.splashUrl }} ./splash.png
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Configure app
        run: |
          ./scripts/configure-android.sh \
            "${{ inputs.appId }}" \
            "${{ inputs.appName }}" \
            "${{ inputs.websiteUrl }}" \
            "${{ inputs.primaryColor }}"
      
      - name: Build APK
        run: |
          ./gradlew assembleRelease
      
      - name: Sign APK
        run: |
          ./scripts/sign-apk.sh
        env:
          KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
      
      - name: Upload to S3
        run: |
          aws s3 cp app/build/outputs/apk/release/app-release.apk \
            s3://b1-builds/android/${{ inputs.appId }}.apk
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Update database
        run: |
          ./scripts/update-db.sh \
            "${{ inputs.appId }}" \
            "ANDROID" \
            "s3://b1-builds/android/${{ inputs.appId }}.apk"
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Notify backend
        run: |
          curl -X POST http://localhost:3000/api/builds/complete \
            -H "Content-Type: application/json" \
            -d '{
              "appId": "${{ inputs.appId }}",
              "platform": "ANDROID",
              "status": "COMPLETED",
              "url": "s3://b1-builds/android/${{ inputs.appId }}.apk"
            }'
```

### GitHub Actions Workflow - iOS

```yaml
name: Build iOS IPA

on:
  workflow_dispatch:
    inputs:
      appId:
        description: 'App ID'
        required: true
      appName:
        description: 'App Name'
        required: true
      websiteUrl:
        description: 'Website URL'
        required: true
      primaryColor:
        description: 'Primary Color'
        required: true
      iconUrl:
        description: 'Icon URL'
        required: true
      splashUrl:
        description: 'Splash URL'
        required: true

jobs:
  build:
    runs-on: macos-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Xcode
        run: |
          sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
      
      - name: Install dependencies
        run: |
          brew install cocoapods
          cd ios && pod install
      
      - name: Download assets
        run: |
          aws s3 cp ${{ inputs.iconUrl }} ./icon.png
          aws s3 cp ${{ inputs.splashUrl }} ./splash.png
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Configure app
        run: |
          ./scripts/configure-ios.sh \
            "${{ inputs.appId }}" \
            "${{ inputs.appName }}" \
            "${{ inputs.websiteUrl }}" \
            "${{ inputs.primaryColor }}"
      
      - name: Import signing certificate
        run: |
          echo "${{ secrets.IOS_SIGNING_CERT }}" | base64 -d > cert.p12
          security import cert.p12 -P "${{ secrets.IOS_CERT_PASSWORD }}" -A
      
      - name: Import provisioning profile
        run: |
          echo "${{ secrets.IOS_PROVISIONING_PROFILE }}" | base64 -d > profile.mobileprovision
          mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
          cp profile.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/
      
      - name: Build archive
        run: |
          xcodebuild -workspace ios/MyApp.xcworkspace \
            -scheme MyApp \
            -configuration Release \
            -derivedDataPath build \
            -archivePath build/MyApp.xcarchive \
            archive
      
      - name: Export IPA
        run: |
          xcodebuild -exportArchive \
            -archivePath build/MyApp.xcarchive \
            -exportOptionsPlist ExportOptions.plist \
            -exportPath build/ipa
      
      - name: Upload to S3
        run: |
          aws s3 cp build/ipa/MyApp.ipa \
            s3://b1-builds/ios/${{ inputs.appId }}.ipa
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Update database
        run: |
          ./scripts/update-db.sh \
            "${{ inputs.appId }}" \
            "IOS" \
            "s3://b1-builds/ios/${{ inputs.appId }}.ipa"
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Notify backend
        run: |
          curl -X POST http://localhost:3000/api/builds/complete \
            -H "Content-Type: application/json" \
            -d '{
              "appId": "${{ inputs.appId }}",
              "platform": "IOS",
              "status": "COMPLETED",
              "url": "s3://b1-builds/ios/${{ inputs.appId }}.ipa"
            }'
```

---

## Secrets Required

```yaml
ANDROID_KEYSTORE_PASSWORD: <password>
ANDROID_KEY_PASSWORD: <password>
IOS_SIGNING_CERT: <base64-encoded-cert>
IOS_CERT_PASSWORD: <password>
IOS_PROVISIONING_PROFILE: <base64-encoded-profile>
AWS_ACCESS_KEY_ID: <key>
AWS_SECRET_ACCESS_KEY: <secret>
DATABASE_URL: <connection-string>
GITHUB_TOKEN: <token>
```

---

## Build Scripts

### `scripts/configure-android.sh`
```bash
#!/bin/bash
APP_ID=$1
APP_NAME=$2
WEBSITE_URL=$3
PRIMARY_COLOR=$4

# Update AndroidManifest.xml
sed -i "s/{{APP_NAME}}/$APP_NAME/g" android/app/src/main/AndroidManifest.xml
sed -i "s|{{WEBSITE_URL}}|$WEBSITE_URL|g" android/app/src/main/java/MainActivity.kt

# Update colors
sed -i "s/{{PRIMARY_COLOR}}/$PRIMARY_COLOR/g" android/app/src/main/res/values/colors.xml

# Copy icon
cp icon.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
cp splash.png android/app/src/main/res/drawable/splash_screen.png
```

### `scripts/sign-apk.sh`
```bash
#!/bin/bash
APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
SIGNED_APK="app/build/outputs/apk/release/app-release.apk"

# Create keystore if not exists
if [ ! -f "release.keystore" ]; then
  keytool -genkey -v -keystore release.keystore \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -alias release -storepass "$KEYSTORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "CN=B1AppBuilder,O=B1,C=US"
fi

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore release.keystore \
  -storepass "$KEYSTORE_PASSWORD" \
  -keypass "$KEY_PASSWORD" \
  "$APK_PATH" release

# Verify signature
jarsigner -verify -verbose "$SIGNED_APK"
```

### `scripts/update-db.sh`
```bash
#!/bin/bash
APP_ID=$1
PLATFORM=$2
URL=$3

# Update database with build URL
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <<EOF
UPDATE apps SET 
  ${PLATFORM}_package_url = '$URL',
  status = 'COMPLETED',
  updated_at = NOW()
WHERE id = $APP_ID;
EOF
```

---

## Monitoring & Logging

```yaml
- GitHub Actions logs (automatic)
- CloudWatch logs (optional)
- Sentry error tracking
- Build metrics dashboard
- Slack notifications
```

---

## Performance Targets

- Android build: < 5 minutes
- iOS build: < 10 minutes
- S3 upload: < 1 minute
- Database update: < 10 seconds
- Total time: < 15 minutes

---

**Please provide a complete, production-ready CI/CD pipeline.**
