# Checkpoint Discipline Policy

**Effective Date:** 2025-12-15  
**Version:** 1.0

## Purpose

This policy establishes mandatory checkpoint requirements to ensure rollback capability. Without a checkpoint, rollback is impossible. This policy exists because the Fire Drill on 2025-12-15 proved that Manus rollback only works for checkpointed changes.

## Core Rule

> **No Publish without Checkpoint.**

This rule has no exceptions for production deployments.

## Mandatory Checkpoint Triggers

A checkpoint **must** be created before any of the following actions:

| Trigger | Reason |
|---------|--------|
| **Before Publish** | Enables rollback if deployment fails |
| **Before ENV change** | Environment variable changes can break the application |
| **Before DB migration** | Schema changes are difficult to reverse |
| **Before major refactor** | Large code changes increase risk |
| **After completing a feature** | Preserves working state before next changes |

## Checkpoint Description Requirements

Every checkpoint description must include:

| Element | Example |
|---------|---------|
| What changed | "Added user authentication flow" |
| Why it changed | "Implements login requirement for dashboard" |
| Test status | "All health checks passing" |

Good example:
> "User authentication: Added login/logout flow with session management. All tests passing, health endpoints green."

Bad example:
> "Updates" or "Fixed stuff"

## Responsibility

| Role | Responsibility |
|------|----------------|
| **Developer** | Create checkpoint before triggering actions listed above |
| **Reviewer** | Verify checkpoint exists before approving Publish |
| **System** | Manus UI requires checkpoint before Publish button is enabled |

## Verification Gate

Before clicking **Publish** in the Manus UI, verify:

1. ✅ Checkpoint created with descriptive message
2. ✅ Health endpoints returning 200 (`/healthz`, `/readyz`)
3. ✅ No TypeScript errors in build
4. ✅ Critical functionality tested

## Exception Process

Exceptions to this policy require:

| Step | Action |
|------|--------|
| 1 | Document the emergency requiring bypass |
| 2 | Get verbal approval from project lead |
| 3 | Create checkpoint immediately after emergency deploy |
| 4 | File incident report within 24 hours |

> **Note:** Exceptions should be rare. If you find yourself requesting exceptions frequently, the development process needs review.

## Consequences of Non-Compliance

| Scenario | Impact |
|----------|--------|
| Deploy without checkpoint, no issues | Lucky, but policy violation |
| Deploy without checkpoint, issues occur | Extended downtime, manual recovery required |
| Repeated violations | Process review, additional gates added |

## Quick Reference

```
Before Publish → Create Checkpoint
Before ENV change → Create Checkpoint
Before DB migration → Create Checkpoint
Before major refactor → Create Checkpoint
After feature complete → Create Checkpoint
```

## Related Documentation

- [Rollback Procedures](./ROLLBACK_PROCEDURES.md) - What to do when things go wrong
- [Backup & Restore Procedures](./BACKUP_RESTORE_PROCEDURES.md) - Database recovery
- [Fire Drill Report](./FIRE_DRILL_REPORT_2025-12-15.md) - Evidence for this policy
