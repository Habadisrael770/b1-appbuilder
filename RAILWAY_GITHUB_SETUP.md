# Railway + GitHub Actions Setup Guide

## Overview

This guide explains how to setup B1 AppBuilder with Railway.app build server and GitHub Actions for automated APK/IPA generation - **without AWS**.

## Architecture

```
GitHub Actions (Trigger)
    ↓
Build on GitHub Actions Runner
    ↓
Upload to Railway Storage
    ↓
Download from Railway
    ↓
User gets APK/IPA
```

## Step 1: Setup GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Add the following secrets:

```
GITHUB_TOKEN=<your-github-token> (already have this)
DATABASE_URL=<your-database-url>
ANDROID_KEYSTORE_PASSWORD=<your-keystore-password>
ANDROID_KEY_PASSWORD=<your-key-password>
RAILWAY_PROJECT_ID=<your-railway-project-id>
```

## Step 2: Create Android Keystore

```bash
# Generate keystore for signing APK
keytool -genkey -v -keystore release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias release-key \
  -storepass <password> \
  -keypass <password>

# Base64 encode the keystore
base64 -w 0 release.keystore > release.keystore.b64

# Add to GitHub Secrets as ANDROID_KEYSTORE_B64
```

## Step 3: GitHub Actions Workflow

The workflow is already configured in `.github/workflows/build-android.yml`:

1. **Checkout code** - Get latest code
2. **Setup Java** - Install Java 17
3. **Setup Android SDK** - Install Android build tools
4. **Configure app** - Customize with user settings
5. **Build APK** - Compile APK from template
6. **Sign APK** - Sign with release keystore
7. **Upload to Railway** - Store APK in Railway
8. **Update database** - Save download URL
9. **Notify backend** - Tell app build is done

## Step 4: Trigger Build from Backend

In `server/routers/builds.ts`:

```typescript
export const buildsRouter = router({
  startBuild: protectedProcedure
    .input(z.object({
      appId: z.string(),
      appName: z.string(),
      websiteUrl: z.string(),
      primaryColor: z.string(),
      platform: z.enum(['android', 'ios', 'both']),
    }))
    .mutation(async ({ input, ctx }) => {
      // Trigger GitHub Actions workflow
      const response = await fetch(
        `https://api.github.com/repos/${process.env.GITHUB_REPO}/dispatches`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: 'build-android',
            client_payload: {
              appId: input.appId,
              appName: input.appName,
              websiteUrl: input.websiteUrl,
              primaryColor: input.primaryColor,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to trigger build');
      }

      // Return build status
      return {
        status: 'BUILDING',
        message: 'APK build started. Check back in 5-10 minutes.',
      };
    }),

  getBuildStatus: protectedProcedure
    .input(z.object({ appId: z.string() }))
    .query(async ({ input }) => {
      // Get build status from database
      const build = await db.query.builds.findFirst({
        where: eq(builds.appId, input.appId),
      });

      return {
        status: build?.status || 'PENDING',
        downloadUrl: build?.downloadUrl,
        completedAt: build?.completedAt,
      };
    }),
});
```

## Step 5: Frontend Integration

In `client/src/pages/StepEight.tsx`:

```typescript
const { mutate: startBuild, isPending } = trpc.builds.startBuild.useMutation({
  onSuccess: () => {
    toast.success('Build started! Check back in 5-10 minutes.');
    // Redirect to dashboard
    navigate('/dashboard/my-apps');
  },
  onError: (error) => {
    toast.error('Build failed: ' + error.message);
  },
});

const handleDownload = () => {
  startBuild({
    appId: appId,
    appName: appName,
    websiteUrl: websiteUrl,
    primaryColor: primaryColor,
    platform: platform,
  });
};
```

## Step 6: Test Build

1. Go to your app dashboard
2. Click "Download APK"
3. GitHub Actions workflow triggers
4. Check workflow status in GitHub Actions tab
5. APK is generated in 5-10 minutes
6. Download link appears in dashboard

## Monitoring

### GitHub Actions
- View workflow runs: Settings → Actions
- Check build logs
- Debug failures

### Database
- Check build status
- Verify download URLs
- Track build history

## Troubleshooting

### Build Fails
1. Check GitHub Actions logs
2. Verify Android SDK is installed
3. Check Gradle configuration
4. Verify build template files

### APK Not Signed
1. Verify keystore password
2. Check key password
3. Verify keystore file exists

### Download Link Not Working
1. Verify Railway storage
2. Check database URL
3. Verify permissions

## Cost

- **GitHub Actions:** FREE (3000 minutes/month)
- **Railway:** $5-25/month (if using for other services)
- **Total:** ~$5-25/month

## Next Steps

1. Add Android keystore to GitHub Secrets
2. Test first build
3. Monitor performance
4. Add iOS build workflow
5. Setup payment integration

## Support

- GitHub Actions docs: https://docs.github.com/en/actions
- Android build docs: https://developer.android.com/build
- Gradle docs: https://gradle.org/guides

---

**Status:** Ready to Deploy
**Last Updated:** December 2024
