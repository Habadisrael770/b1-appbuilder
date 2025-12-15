# Backup & Restore Procedures

This document describes the database backup and restore procedures for B1 AppBuilder. These procedures serve as the safety net when application rollback is insufficient or when data recovery is required.

## Recovery Objectives

The following recovery objectives have been established and validated through testing:

| Objective | Target | Measured |
|-----------|--------|----------|
| **RPO** (Recovery Point Objective) | ≤ 24 hours | Depends on backup frequency |
| **RTO** (Recovery Time Objective) | ≤ 60 minutes | ~60 seconds (tested) |

**RPO** defines the maximum acceptable data loss. With daily backups, up to 24 hours of data could be lost in a worst-case scenario. For critical applications, consider increasing backup frequency.

**RTO** defines the maximum acceptable downtime. The measured RTO of approximately 60 seconds includes backup verification, restore execution, and health check confirmation.

## Database Information

| Property | Value |
|----------|-------|
| Database Type | TiDB (MySQL-compatible) |
| Provider | TiDB Cloud |
| Connection | SSL Required |
| Backup Tool | mysqldump |

## Backup Procedure

### Prerequisites

The backup script requires the `DATABASE_URL` environment variable to be set. In the Manus environment, this is automatically injected.

### Executing a Backup

To create a backup, run the following command from the project root:

```bash
cd /home/ubuntu/b1-appbuilder
node scripts/db-backup.mjs staging
```

The script will create two files in `backups/staging/`:

| File | Description |
|------|-------------|
| `backup_staging_YYYYMMDD_HHMMSS.sql.gz` | Compressed SQL dump |
| `backup_staging_YYYYMMDD_HHMMSS.sql.gz.sha256` | SHA-256 checksum file |

### Backup Output Example

```
==================================================
[INFO] Database Backup Started
==================================================
[INFO] Environment: staging
[INFO] Database: <database_name>
[INFO] Host: <host>:<port>
[INFO] Timestamp: 20251215_202657
[INFO] Output: /home/ubuntu/b1-appbuilder/backups/staging/backup_staging_20251215_202657.sql.gz

[INFO] Running mysqldump...
[INFO] Uncompressed size: 10.97 KB
[INFO] Compressing backup...
[INFO] Compressed size: 2.38 KB
[INFO] Generating checksum...

==================================================
[INFO] Backup Complete
==================================================
  File: /home/ubuntu/b1-appbuilder/backups/staging/backup_staging_20251215_202657.sql.gz
  Size: 2.38 KB
  Checksum: 3619b9b0955aefab...
  Duration: 31.1 seconds

[INFO] Verifying checksum...
[INFO] Checksum verification: PASSED

[INFO] Backup successful!
```

### Backup Schedule Recommendations

| Environment | Frequency | Retention |
|-------------|-----------|-----------|
| Production | Daily (minimum) | 30 days |
| Staging | Before major changes | 7 days |
| Development | As needed | 3 days |

For production environments, consider implementing automated backups using a cron job or scheduled task.

## Restore Procedure

### When to Restore

A database restore should be initiated when:

| Condition | Action |
|-----------|--------|
| Application rollback failed | Restore from last good backup |
| Data corruption detected | Restore from backup before corruption |
| Accidental data deletion | Restore from backup before deletion |
| Security breach | Restore from backup before breach |

### Pre-Restore Checklist

Before executing a restore, verify the following:

1. **Identify the correct backup file** - Choose the backup from before the incident occurred.
2. **Verify backup integrity** - The restore script automatically verifies the checksum.
3. **Confirm target environment** - Ensure you are restoring to the correct database (staging vs production).
4. **Notify stakeholders** - Inform relevant team members about the planned restore.

### Executing a Restore

To restore from a backup, run the following command:

```bash
cd /home/ubuntu/b1-appbuilder
node scripts/db-restore.mjs backups/staging/<backup_file>.sql.gz
```

> **⚠️ WARNING:** Restore operations will **overwrite all existing data** in the target database. This action cannot be undone.

### Restore Output Example

```
[INFO] Verifying backup checksum...
[INFO] Checksum verification: PASSED

==================================================
[INFO] Database Restore Started
==================================================
[INFO] Environment: staging
[INFO] Database: <database_name>
[INFO] Host: <host>:<port>
[INFO] Backup file: backups/staging/backup_staging_20251215_202657.sql.gz
[INFO] Backup size: 2.38 KB
[INFO] Start time: 2025-12-15T20:30:23.690Z
[INFO] Decompressing and restoring...

==================================================
[INFO] Restore Complete
==================================================
[INFO] End time: 2025-12-15T20:30:48.296Z
[INFO] Duration: 24.6 seconds
[INFO] Verifying database connection...
[INFO] Database verification: PASSED (8 tables found)

[INFO] Restore successful!
```

### Post-Restore Verification

After completing a restore, verify the system is functioning correctly:

| Check | Command | Expected Result |
|-------|---------|-----------------|
| Health endpoint | `curl /healthz` | `{"ok":true}` |
| Readiness endpoint | `curl /readyz` | `{"ok":true,"db":"up"}` |
| Homepage | Visit production URL | Page renders correctly |
| Database tables | Check table count | Expected number of tables |

If health checks fail after restore, restart the application server:

```bash
# In Manus environment, use the webdev_restart_server tool
# Or manually restart the dev server
```

## Production Restore Safety

The restore script includes a safety check for production environments. When `ENV_NAME=production` or `ENV_NAME=prod`, the script will:

1. Display a warning message
2. Require manual confirmation by typing "RESTORE PRODUCTION"
3. Abort if confirmation is not provided

This prevents accidental production data overwrites.

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Backup fails with SAVEPOINT error | TiDB compatibility | Script uses `--skip-lock-tables` flag |
| Restore timeout | Large database | Increase timeout, consider chunked restore |
| Checksum mismatch | Corrupted backup | Use a different backup file |
| Connection refused | Network issue | Verify DATABASE_URL and network connectivity |

### TiDB-Specific Notes

TiDB is MySQL-compatible but has some differences. The backup script has been configured to work with TiDB by:

- Using `--skip-lock-tables` instead of `--single-transaction`
- Using `--set-gtid-purged=OFF` to avoid GTID-related errors
- Requiring SSL mode for secure connections

## Integration with Rollback Procedures

Database restore serves as the **safety net** when application rollback is insufficient. The decision tree for choosing between rollback and restore is:

```
Issue Detected
     │
     ▼
Is it a code/config issue?
     │
  ┌──┴──┐
 YES    NO
  │      │
  ▼      ▼
ROLLBACK  Is data corrupted/lost?
(checkpoint)    │
          ┌────┴────┐
         YES       NO
          │         │
          ▼         ▼
     DB RESTORE   Investigate
                  further
```

For more details on application rollback, see [ROLLBACK_PROCEDURES.md](./ROLLBACK_PROCEDURES.md).

## Related Documentation

- [Rollback Procedures](./ROLLBACK_PROCEDURES.md) - Application rollback procedures
- [Staging Workflow](./STAGING_WORKFLOW.md) - Pre-production testing process
- [Fire Drill Report](./FIRE_DRILL_REPORT_2025-12-15.md) - Rollback testing results
