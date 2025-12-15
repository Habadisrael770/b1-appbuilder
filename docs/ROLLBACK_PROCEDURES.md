# Rollback Procedures

This document describes how to recover from failed deployments or critical issues in production. Having a clear rollback strategy is essential for maintaining service reliability.

## When to Rollback

A rollback should be initiated when any of the following conditions occur after publishing to production:

| Condition | Severity | Action |
|-----------|----------|--------|
| Application crashes on startup | Critical | Immediate rollback |
| Health endpoints return errors | Critical | Immediate rollback |
| Critical user-facing features broken | High | Rollback within 15 minutes |
| Significant performance degradation | High | Rollback within 30 minutes |
| Minor UI issues | Low | Fix forward (no rollback) |
| Non-critical feature bugs | Low | Fix forward (no rollback) |

The general rule is to rollback for any issue that significantly impacts user experience or system stability. Minor issues can be addressed with a quick fix and new deployment.

## Rollback Methods

### Method 1: Manus UI Rollback (Recommended)

The Manus platform provides built-in rollback functionality through checkpoints. This is the fastest and safest method.

> **⚠️ CRITICAL LIMITATION (Discovered in Fire Drill 2025-12-15):**
> Manus rollback **only restores changes that were committed to a checkpoint**. If code was modified after the last checkpoint without creating a new checkpoint, rollback will have no effect on those changes. In such cases, use Method 3 (Manual File Recovery) below.

**Step 1:** Open the Manus Management UI and navigate to the Dashboard panel.

**Step 2:** Locate the checkpoint list showing previous versions. Each checkpoint displays the version ID, timestamp, and description.

**Step 3:** Find the last known good checkpoint (typically the one before the problematic deployment).

**Step 4:** Click the **Rollback** button next to that checkpoint.

**Step 5:** Confirm the rollback action when prompted.

**Step 6:** Wait for the rollback to complete. The system will restore all code and configuration to the selected checkpoint state.

**Step 7:** Verify the rollback was successful by checking health endpoints and testing critical functionality.

### Method 2: Manual Code Revert

If the Manus UI rollback is unavailable, you can manually revert code changes.

**Step 1:** Identify the commit hash of the last working version. This information is available in the checkpoint description or git history.

**Step 2:** Create a new branch from the current state for investigation:
```bash
git checkout -b investigate-issue
```

**Step 3:** Reset the main branch to the last working commit:
```bash
git checkout main
git reset --hard <commit-hash>
```

**Step 4:** Create a new checkpoint with the reverted code.

**Step 5:** Publish the reverted version to production.

### Method 3: Manual File Recovery

Use this method when rollback fails because changes were not checkpointed.

**When to use:** Manus rollback reports "no changes detected" but the system is still broken.

**Step 1:** Identify the broken file(s) by checking error logs or health endpoint responses.

**Step 2:** Locate the last known good version of the file. Options include:
- Copy from a colleague's working environment
- Retrieve from git history: `git show <commit>:<filepath>`
- Manually rewrite the file based on documentation

**Step 3:** Replace the broken file with the working version.

**Step 4:** Wait for the dev server to reload (typically 2-3 seconds).

**Step 5:** Verify recovery by checking health endpoints.

**Step 6:** Create a checkpoint immediately after recovery to prevent future rollback issues.

## Post-Rollback Checklist

After completing a rollback, verify the system is functioning correctly:

| Check | Command/Action | Expected Result |
|-------|----------------|-----------------|
| Health endpoint | `curl /healthz` | `{"ok":true}` |
| Readiness endpoint | `curl /readyz` | `{"ok":true,"db":"up"}` |
| Homepage loads | Visit production URL | Page renders correctly |
| User authentication | Test login flow | Login succeeds |
| Critical features | Test main user flows | Features work as expected |
| Error monitoring | Check Sentry dashboard | No new critical errors |

## Root Cause Analysis

After stabilizing the system, conduct a root cause analysis to prevent similar issues in the future.

**Immediate Actions (within 1 hour):**
Document what happened, when it was detected, and how it was resolved. Capture any error messages, logs, or screenshots that might help with investigation.

**Investigation (within 24 hours):**
Review the changes that were deployed and identify which specific change caused the issue. Check for patterns such as missing environment variables, database migration issues, or dependency conflicts.

**Prevention (within 1 week):**
Update testing procedures to catch similar issues before deployment. Consider adding automated tests, improving staging verification, or enhancing monitoring alerts.

## Emergency Contacts

In case of critical production issues, escalate through the following channels:

| Role | Contact Method | Response Time |
|------|----------------|---------------|
| On-call Developer | Team chat/Slack | < 15 minutes |
| Project Lead | Email + Phone | < 30 minutes |
| Infrastructure Team | Support ticket | < 1 hour |

## Rollback Decision Tree

```
Issue Detected in Production
           │
           ▼
    Is the app crashing?
           │
    ┌──────┴──────┐
   YES           NO
    │             │
    ▼             ▼
 ROLLBACK    Are critical features broken?
 IMMEDIATELY        │
              ┌─────┴─────┐
             YES         NO
              │           │
              ▼           ▼
         ROLLBACK    Can it be fixed in < 30 min?
         (15 min)          │
                     ┌─────┴─────┐
                    YES         NO
                     │           │
                     ▼           ▼
                 FIX FORWARD  ROLLBACK
                              (30 min)
```

## Related Documentation

For additional context on deployment and monitoring, refer to:

- [Staging Workflow](./STAGING_WORKFLOW.md) - Pre-production testing process
- [Phase B Checklist](./CHECKLIST_B_STAGING.md) - Deployment verification checklist
- [Sentry Setup](./SENTRY_SETUP_CHECKLIST.md) - Error monitoring configuration
