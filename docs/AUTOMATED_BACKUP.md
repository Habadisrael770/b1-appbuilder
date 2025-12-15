# Automated Daily Backup

This document describes the automated database backup system for B1 AppBuilder. The system performs daily backups with retention management and failure alerting.

## Overview

The automated backup system provides the following capabilities:

| Feature | Description |
|---------|-------------|
| **Daily Backup** | Scheduled database dumps with timestamps |
| **Retention Policy** | Automatic cleanup of backups older than 7 days |
| **Checksum Verification** | SHA-256 integrity verification for each backup |
| **Failure Alerting** | Notifications sent to project owner on backup failure |
| **Logging** | Persistent log file for audit and troubleshooting |

## Script Location

The automated backup script is located at:

```
/home/ubuntu/b1-appbuilder/scripts/automated-backup.mjs
```

## Usage

### Manual Execution

To run a backup manually:

```bash
cd /home/ubuntu/b1-appbuilder
node scripts/automated-backup.mjs staging
```

For production (when applicable):

```bash
node scripts/automated-backup.mjs production
```

### Cron Configuration

To schedule daily backups at 2:00 AM, add the following to your crontab:

```bash
# Edit crontab
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * cd /home/ubuntu/b1-appbuilder && node scripts/automated-backup.mjs staging >> /var/log/b1-backup.log 2>&1
```

> **Note:** In the Manus hosting environment, cron jobs may not persist across deployments. Consider using an external scheduler or the Manus scheduling feature for production backups.

## Configuration

The script uses the following default configuration:

| Parameter | Default Value | Description |
|-----------|---------------|-------------|
| `retentionDays` | 7 | Number of days to keep backups |
| `backupDir` | `/home/ubuntu/b1-appbuilder/backups` | Backup storage directory |
| `logFile` | `/home/ubuntu/b1-appbuilder/backups/backup.log` | Log file location |

To modify these values, edit the `CONFIG` object at the top of the script.

## Output Files

Each backup creates two files in the environment-specific directory:

| File | Description |
|------|-------------|
| `backup_{env}_{timestamp}.sql.gz` | Compressed SQL dump |
| `backup_{env}_{timestamp}.sql.gz.sha256` | SHA-256 checksum file |

Example:
```
backups/staging/backup_staging_20251215210704.sql.gz
backups/staging/backup_staging_20251215210704.sql.gz.sha256
```

## Log File

The script maintains a persistent log file at `backups/backup.log`. Each entry includes:

- Timestamp (ISO 8601 format)
- Log level (INFO, ERROR, WARN)
- Message

Example log output:
```
[2025-12-15T21:07:04.146Z] [INFO] Automated Backup Started
[2025-12-15T21:07:04.150Z] [INFO] Environment: staging
[2025-12-15T21:07:38.456Z] [INFO] Backup Complete
[2025-12-15T21:07:38.457Z] [INFO] Status: SUCCESS
```

## Failure Alerting

When a backup fails, the script automatically sends a notification to the project owner using the Manus notification API. The alert includes:

- Environment name
- Timestamp of failure
- Error message

Alerts are sent only on failure; successful backups do not trigger notifications.

## Retention Policy

The script automatically deletes backups older than the configured retention period (default: 7 days). This cleanup runs after each successful backup.

Deleted files are logged:
```
[INFO] Deleting old backup: backup_staging_20251208_020000.sql.gz
[INFO] Cleaned 1 old backup(s)
```

## Monitoring Recommendations

To ensure backup reliability, implement the following monitoring:

| Check | Frequency | Action on Failure |
|-------|-----------|-------------------|
| Log file review | Weekly | Investigate any ERROR entries |
| Backup file existence | Daily | Verify today's backup exists |
| Checksum verification | Monthly | Test restore from random backup |

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "DATABASE_URL not set" | Missing environment variable | Ensure DATABASE_URL is configured |
| "mysqldump not found" | Missing MySQL client | Install mysql-client package |
| Backup timeout | Large database | Increase script timeout |
| Permission denied | File system permissions | Check directory ownership |

### Testing Alert System

To test the failure alerting without actually failing a backup, you can temporarily modify the script to throw an error after the backup completes.

## Related Documentation

- [Backup & Restore Procedures](./BACKUP_RESTORE_PROCEDURES.md) - Manual backup and restore
- [Checkpoint Discipline Policy](./CHECKPOINT_DISCIPLINE_POLICY.md) - When to create checkpoints
- [Rollback Procedures](./ROLLBACK_PROCEDURES.md) - Recovery procedures
