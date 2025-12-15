# DB Restore Drill Checklist

This checklist provides a step-by-step guide for executing a database restore drill. Use this during quarterly fire drills or when practicing recovery procedures.

## Pre-Restore Verification

Complete all items before starting the restore:

| # | Check | Command/Action | Expected | Actual | ✓ |
|---|-------|----------------|----------|--------|---|
| 1 | Identify backup file | `ls -la backups/staging/` | List of .sql.gz files | | ☐ |
| 2 | Verify backup age | Check file timestamp | < 24 hours old | | ☐ |
| 3 | Verify checksum file exists | `ls backups/staging/*.sha256` | Checksum file present | | ☐ |
| 4 | Record current health | `curl /healthz` | `{"ok":true}` | | ☐ |
| 5 | Record current readiness | `curl /readyz` | `{"ok":true,"db":"up"}` | | ☐ |
| 6 | Note current checkpoint | Check Manus UI | Version ID | | ☐ |

## Restore Execution

Execute these steps in order:

| # | Step | Command | Expected Output | Actual | ✓ |
|---|------|---------|-----------------|--------|---|
| 1 | Record start time | `date -u` | Timestamp | | ☐ |
| 2 | Run restore script | `node scripts/db-restore.mjs backups/staging/[file].sql.gz` | See below | | ☐ |
| 3 | Wait for completion | Observe output | "Restore successful!" | | ☐ |
| 4 | Record end time | `date -u` | Timestamp | | ☐ |

**Expected restore output:**
```
[INFO] Verifying backup checksum...
[INFO] Checksum verification: PASSED
[INFO] Database Restore Started
[INFO] Decompressing and restoring...
[INFO] Restore Complete
[INFO] Database verification: PASSED (X tables found)
[INFO] Restore successful!
```

## Post-Restore Verification

Verify system health after restore:

| # | Check | Command | Expected | Actual | ✓ |
|---|-------|---------|----------|--------|---|
| 1 | Health endpoint | `curl /healthz` | `{"ok":true}` | | ☐ |
| 2 | Readiness endpoint | `curl /readyz` | `{"ok":true,"db":"up"}` | | ☐ |
| 3 | Homepage loads | Browser test | Page renders | | ☐ |
| 4 | API responds | Test API call | 200 response | | ☐ |
| 5 | No Sentry errors | Check Sentry | No new errors | | ☐ |

## Server Restart (If Needed)

If health checks fail after restore:

| # | Step | Action | Expected | ✓ |
|---|------|--------|----------|---|
| 1 | Restart server | Use `webdev_restart_server` or manual restart | Server starts | ☐ |
| 2 | Wait for startup | 10-15 seconds | Server ready | ☐ |
| 3 | Re-check health | `curl /healthz` | `{"ok":true}` | ☐ |
| 4 | Re-check readiness | `curl /readyz` | `{"ok":true,"db":"up"}` | ☐ |

## RTO Calculation

Calculate Recovery Time Objective:

| Metric | Time |
|--------|------|
| Restore start time | |
| Restore end time | |
| Health verified time | |
| **Total RTO** | |

**Target RTO:** < 15 minutes

## Drill Result

| Outcome | ✓ |
|---------|---|
| ☐ **PASS** - All checks passed, RTO within target | |
| ☐ **PASS WITH ISSUES** - Completed but issues noted | |
| ☐ **FAIL** - Unable to complete restore | |

## Issues Encountered

| Issue | Resolution | Time Impact |
|-------|------------|-------------|
| | | |
| | | |

## Sign-Off

| Field | Value |
|-------|-------|
| Drill Date | |
| Operator | |
| RTO Achieved | |
| Status | PASS / FAIL |

---

## Quick Reference

### Backup Location
```
/home/ubuntu/b1-appbuilder/backups/staging/
```

### Restore Command
```bash
cd /home/ubuntu/b1-appbuilder
node scripts/db-restore.mjs backups/staging/backup_staging_YYYYMMDD_HHMMSS.sql.gz
```

### Health Check Commands
```bash
curl https://[staging-url]/healthz
curl https://[staging-url]/readyz
```

### Troubleshooting

| Problem | Solution |
|---------|----------|
| Checksum mismatch | Use different backup file |
| Connection refused | Verify DATABASE_URL is set |
| Tables missing | Check restore output for errors |
| Health check fails | Restart server |
