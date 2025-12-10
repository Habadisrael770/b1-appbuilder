# DevOps Engineer Output

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

## GitHub Actions Workflow - Android

```yaml
name: Build Android APK

on:
  repository_dispatch:
    types: [build-initiated]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      
      - name: Setup Java
        uses: actions/setup-java@v2
        with:
          distribution: 'adopt'
          java-version: '11'
      
      - name: Setup Android SDK
        uses: malinskiy/action-android/sdk@v0.1.0
      
      - name: Download assets
        run: ./scripts/download-assets.sh
      
      - name: Configure app
        run: ./scripts/configure-android.sh
      
      - name: Build APK
        run: ./scripts/build-android.sh
      
      - name: Sign APK
        run: ./scripts/sign-apk.sh
      
      - name: Upload to S3
        run: ./scripts/upload-s3.sh
      
      - name: Update database
        run: ./scripts/update-db.sh
      
      - name: Notify backend
        run: ./scripts/notify-backend.sh
```

## GitHub Actions Workflow - iOS

```yaml
name: Build iOS IPA

on:
  repository_dispatch:
    types: [build-initiated]

jobs:
  build:
    runs-on: macos-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      
      - name: Setup Xcode
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: '12.4'
      
      - name: Install dependencies
        run: ./scripts/install-dependencies.sh
      
      - name: Download assets
        run: ./scripts/download-assets.sh
      
      - name: Configure app
        run: ./scripts/configure-ios.sh
      
      - name: Build IPA
        run: ./scripts/build-ios.sh
      
      - name: Sign IPA
        run: ./scripts/sign-ipa.sh
      
      - name: Upload to S3
        run: ./scripts/upload-s3.sh
      
      - name: Update database
        run: ./scripts/update-db.sh
      
      - name: Notify backend
        run: ./scripts/notify-backend.sh
```

## Build Orchestration

```yaml
name: Build orchestration

on:
  repository_dispatch:
    types: [build-initiated]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Trigger Android build
        uses: benc-uk/workflow-dispatch@v1
        with:
          workflow: Build Android APK
          token: ${{ secrets.GH_PAT }}
      
      - name: Trigger iOS build
        uses: benc-uk/workflow-dispatch@v1
        with:
          workflow: Build iOS IPA
          token: ${{ secrets.GH_PAT }}
      
      - name: Wait for completion
        run: ./scripts/wait-for-completion.sh
```

## Secrets Management

```yaml
ANDROID_KEYSTORE_PASSWORD: <password>
IOS_SIGNING_CERT: <base64-encoded-cert>
IOS_CERT_PASSWORD: <password>
AWS_ACCESS_KEY_ID: <key>
AWS_SECRET_ACCESS_KEY: <secret>
DATABASE_URL: <connection-string>
GH_PAT: <token>
S3_BUCKET: <bucket-name>
```

## Artifact Management

```yaml
- Store APK/IPA in S3
- Versioning (build number)
- Cleanup old artifacts
- Generate download URLs
- Track build metadata
```

## Error Handling

```yaml
- Build failures
- Signing failures
- S3 upload failures
- Database update failures
- Notification on errors
```

## Monitoring & Logging

```yaml
- GitHub Actions logs (automatic)
- CloudWatch logs (optional)
- Sentry error tracking
- Build metrics dashboard
- Slack notifications
```

## Performance Targets

- Android build: < 5 minutes
- iOS build: < 10 minutes
- S3 upload: < 1 minute
- Database update: < 10 seconds
- Total time: < 15 minutes