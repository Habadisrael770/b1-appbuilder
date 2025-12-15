# Staging Workflow Guide

This document describes the staging workflow for B1 AppBuilder using Manus Hosting. The workflow ensures code quality and stability before releasing to production.

## Environment Overview

The project uses three distinct environments, each serving a specific purpose in the development lifecycle.

| Environment | URL Type | Purpose | Access |
|-------------|----------|---------|--------|
| **Development** | `localhost:3000` | Local development and debugging | Developer only |
| **Staging** | Preview URL | Pre-production testing and QA | Team members |
| **Production** | Published URL | Live user-facing application | Public |

The Preview URL in Manus serves as the staging environment. This URL is automatically generated when the dev server runs and provides a stable testing ground before publishing to production.

## Workflow Process

### Step 1: Development

All feature development occurs locally. Developers should ensure the following before proceeding to staging:

1. Code compiles without TypeScript errors
2. All existing tests pass (`pnpm test`)
3. The feature works correctly in the local environment
4. No console errors or warnings in the browser

### Step 2: Create Checkpoint

After completing development work, create a checkpoint to save the current state:

1. Click the **Checkpoint** button in the Manus UI
2. Provide a descriptive message explaining what changed
3. Wait for the checkpoint to complete successfully

The checkpoint creates a recoverable snapshot that can be used for rollback if issues are discovered later.

### Step 3: Staging Verification

With the checkpoint created, the Preview URL becomes the staging environment. Perform the following verification steps:

**Functional Testing:**
- Test all new features end-to-end
- Verify existing functionality still works (regression testing)
- Test on multiple browsers if applicable
- Check responsive design on mobile viewports

**Health Verification:**
- Access `/healthz` endpoint and confirm `{"ok":true}` response
- Access `/readyz` endpoint and confirm `{"ok":true,"db":"up"}` response
- Check Sentry dashboard for any new errors

**Performance Check:**
- Verify page load times are acceptable
- Check for any slow API responses
- Monitor browser console for errors

### Step 4: Publish to Production

Once staging verification passes, publish to production:

1. Navigate to the **Dashboard** panel in Manus UI
2. Click the **Publish** button in the header
3. Confirm the publish action
4. Wait for deployment to complete

### Step 5: Production Verification

After publishing, verify the production deployment:

1. Access the production URL
2. Perform a quick smoke test of critical features
3. Check `/healthz` and `/readyz` endpoints on production
4. Monitor Sentry for any production errors

## Environment Variables

Each environment uses specific configuration values to ensure proper separation.

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `NODE_ENV` | development | development | production |
| `SENTRY_ENVIRONMENT` | development | staging | production |
| `SENTRY_RELEASE` | local | checkpoint-id | checkpoint-id |

The `SENTRY_ENVIRONMENT` variable is particularly important for filtering errors in the Sentry dashboard by environment.

## Quick Reference Commands

```bash
# Check TypeScript errors
pnpm tsc --noEmit

# Run tests
pnpm test

# Check health endpoints (staging)
curl https://[preview-url]/healthz
curl https://[preview-url]/readyz

# Check health endpoints (production)
curl https://[production-url]/healthz
curl https://[production-url]/readyz
```

## Troubleshooting

**Preview URL not accessible:**
- Verify the dev server is running
- Check for any startup errors in the console
- Restart the dev server if necessary

**Health check failing:**
- Check database connectivity
- Verify environment variables are set correctly
- Review server logs for error details

**Sentry not receiving errors:**
- Confirm DSN is configured correctly
- Check that `SENTRY_ENVIRONMENT` is set
- Verify network connectivity to Sentry servers

## Related Documentation

- [Rollback Procedures](./ROLLBACK_PROCEDURES.md) - How to recover from failed deployments
- [Phase B Checklist](./CHECKLIST_B_STAGING.md) - Pre-publish verification checklist
- [Sentry Setup](./SENTRY_SETUP_CHECKLIST.md) - Error monitoring configuration
