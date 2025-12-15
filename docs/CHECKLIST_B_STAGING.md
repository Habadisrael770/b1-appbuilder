# Phase B Checklist: Staging Environment

This checklist ensures all staging environment components are properly configured and verified before publishing to production.

## Prerequisites

Before starting this checklist, confirm that Phase A (Sentry Observability) is complete with all verification gates passing.

| Prerequisite | Status |
|--------------|--------|
| Phase A Complete | ☐ |
| Sentry Backend Working | ☐ |
| Sentry Frontend Working | ☐ |
| Alert Rules Configured | ☐ |

## Gate 1: Development Environment

Verify the local development environment is stable and error-free.

| Check | Command | Expected | Status |
|-------|---------|----------|--------|
| TypeScript compiles | `pnpm tsc --noEmit` | 0 errors | ☐ |
| Tests pass | `pnpm test --run` | All green | ☐ |
| Dev server runs | `pnpm dev` | No startup errors | ☐ |
| No console errors | Browser DevTools | Clean console | ☐ |

## Gate 2: Health Endpoints

Verify health endpoints respond correctly on the staging (Preview) URL.

| Endpoint | URL | Expected Response | Status |
|----------|-----|-------------------|--------|
| Liveness | `/healthz` | `{"ok":true}` | ☐ |
| Readiness | `/readyz` | `{"ok":true,"db":"up"}` | ☐ |

**Verification Commands:**
```bash
# Replace [PREVIEW_URL] with your actual Preview URL
curl https://[PREVIEW_URL]/healthz
curl https://[PREVIEW_URL]/readyz
```

## Gate 3: Staging Functionality

Test critical functionality on the staging environment before publishing.

| Feature | Test Action | Expected Result | Status |
|---------|-------------|-----------------|--------|
| Homepage | Visit `/` | Page loads correctly | ☐ |
| Authentication | Login flow | User can login | ☐ |
| Dashboard | Visit `/dashboard` | Dashboard renders | ☐ |
| Conversion Flow | Start conversion | Steps progress correctly | ☐ |
| Error Handling | Trigger error | Sentry captures it | ☐ |

## Gate 4: Pre-Publish Script

Run the automated pre-publish health check script.

```bash
node scripts/pre-publish-check.mjs https://[PREVIEW_URL]
```

| Check | Result | Status |
|-------|--------|--------|
| TypeScript | PASS | ☐ |
| Tests | PASS | ☐ |
| Health Endpoints | PASS | ☐ |
| Production Build | PASS | ☐ |

## Gate 5: Checkpoint Created

Create a checkpoint before publishing to enable rollback if needed.

| Action | Status |
|--------|--------|
| Checkpoint created | ☐ |
| Checkpoint description is clear | ☐ |
| Checkpoint version noted | ☐ |

**Checkpoint Version:** ________________

## Gate 6: Documentation Review

Confirm all documentation is up to date.

| Document | Location | Reviewed | Status |
|----------|----------|----------|--------|
| Staging Workflow | `docs/STAGING_WORKFLOW.md` | ☐ | ☐ |
| Rollback Procedures | `docs/ROLLBACK_PROCEDURES.md` | ☐ | ☐ |
| Sentry Setup | `docs/SENTRY_SETUP_CHECKLIST.md` | ☐ | ☐ |

## Final Approval

All gates must pass before publishing to production.

| Gate | Description | Status |
|------|-------------|--------|
| Gate 1 | Development Environment | ☐ |
| Gate 2 | Health Endpoints | ☐ |
| Gate 3 | Staging Functionality | ☐ |
| Gate 4 | Pre-Publish Script | ☐ |
| Gate 5 | Checkpoint Created | ☐ |
| Gate 6 | Documentation Review | ☐ |

**All Gates Passed:** ☐

**Approved By:** ________________

**Date:** ________________

## Post-Publish Verification

After publishing, verify production is working correctly.

| Check | Action | Status |
|-------|--------|--------|
| Production URL accessible | Visit production URL | ☐ |
| Health endpoints respond | Check `/healthz` and `/readyz` | ☐ |
| Critical features work | Quick smoke test | ☐ |
| Sentry receiving events | Check Sentry dashboard | ☐ |
| No new errors | Monitor for 15 minutes | ☐ |

## Rollback Trigger Conditions

If any of these conditions occur after publishing, initiate rollback immediately:

| Condition | Action |
|-----------|--------|
| Application crashes | Rollback immediately |
| Health endpoints fail | Rollback immediately |
| Critical features broken | Rollback within 15 minutes |
| Error rate spikes | Investigate, rollback if needed |

Refer to [Rollback Procedures](./ROLLBACK_PROCEDURES.md) for detailed rollback instructions.
