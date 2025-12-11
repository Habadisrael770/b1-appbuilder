# Railway Build Server Deployment Guide

## Overview

This guide explains how to deploy the B1 AppBuilder build server on Railway.app for automated APK/IPA generation.

## Prerequisites

- Railway.app account (connected to GitHub)
- GitHub repository with B1 AppBuilder code
- AWS S3 bucket for storing APK/IPA files
- AWS credentials (Access Key ID + Secret Access Key)

## Step 1: Create Railway Project

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Select your B1 AppBuilder repository
5. Click "Deploy"

## Step 2: Configure Environment Variables

In Railway dashboard, add the following environment variables:

```
GITHUB_TOKEN=<your-github-token>
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
S3_BUCKET=<your-s3-bucket-name>
OPENROUTER_API_KEY=<your-openrouter-key> (optional)
```

## Step 3: Configure Dockerfile

Railway will automatically detect `Dockerfile.railway` and use it to build the environment.

The Dockerfile includes:
- Ubuntu 22.04 base image
- Java 11 JDK
- Android SDK with build tools
- Gradle
- Node.js
- Python 3

## Step 4: Setup Build Scripts

The following scripts are included:

### `scripts/railway-setup.sh`
- Installs all required dependencies
- Sets up Android SDK
- Configures Gradle
- Installs Node.js tools

### `scripts/build-android.sh`
- Builds APK from template
- Customizes with user settings
- Signs APK

### `scripts/upload-s3.sh`
- Uploads APK/IPA to S3
- Generates signed URLs
- Updates database

## Step 5: Configure GitHub Actions

The `.github/workflows/build-android.yml` and `.github/workflows/build-ios.yml` workflows:

1. Trigger on user request (via webhook)
2. Call Railway API to start build
3. Wait for completion
4. Download APK/IPA from S3
5. Update database with download URL

## Step 6: Connect Backend

In `server/routers/builds.ts`:

```typescript
export const buildsRouter = router({
  startBuild: protectedProcedure
    .input(z.object({
      appId: z.string(),
      platform: z.enum(['android', 'ios', 'both']),
    }))
    .mutation(async ({ input, ctx }) => {
      // Trigger GitHub Actions workflow
      // GitHub Actions calls Railway API
      // Railway builds APK/IPA
      // Returns download URL
    }),
});
```

## Step 7: Test Build

1. Go to your app dashboard
2. Click "Download APK"
3. GitHub Actions workflow triggers
4. Railway build server starts
5. APK is generated
6. Download link appears

## Monitoring

### Railway Dashboard
- View build logs
- Monitor resource usage
- Check deployment status

### GitHub Actions
- View workflow runs
- Check build status
- Debug failures

### CloudWatch (optional)
- Monitor build performance
- Track build times
- Alert on failures

## Troubleshooting

### Build Fails
1. Check Railway logs
2. Check GitHub Actions logs
3. Verify environment variables
4. Check S3 bucket permissions

### APK Not Generated
1. Verify Android SDK is installed
2. Check Gradle configuration
3. Verify build template files
4. Check disk space

### S3 Upload Fails
1. Verify AWS credentials
2. Check S3 bucket permissions
3. Verify bucket exists
4. Check file size limits

## Cost Estimation

- Railway: $5-25/month (depending on usage)
- S3: $5-10/month (depending on file count)
- GitHub Actions: FREE (3000 minutes/month)

**Total: ~$10-35/month**

## Next Steps

1. Deploy to Railway
2. Test first build
3. Monitor performance
4. Optimize if needed
5. Scale as needed

## Support

For issues:
1. Check Railway documentation: https://docs.railway.app
2. Check GitHub Actions documentation: https://docs.github.com/en/actions
3. Check AWS documentation: https://docs.aws.amazon.com

---

**Last Updated:** December 2024
**Status:** Production Ready
