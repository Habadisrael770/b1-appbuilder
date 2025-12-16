# Off-site Backup Procedures

This document describes the off-site backup system for B1 AppBuilder. Off-site backups provide disaster recovery protection by storing database backups in a separate S3 location from the primary infrastructure.

## Overview

The off-site backup system complements local backups by uploading copies to Manus S3 storage. This protects against scenarios where local backups are unavailable, such as server failure, account issues, or accidental deletion.

| Feature | Description |
|---------|-------------|
| **Storage** | Manus S3 (CloudFront CDN) |
| **Encryption** | TLS in transit, S3 encryption at rest |
| **Retention** | 7 days (matches local retention) |
| **Alerting** | notifyOwner API on failure |
| **Verification** | Download URL verification after upload |

## Scripts

Two scripts manage off-site backups:

| Script | Purpose |
|--------|---------|
| `offsite-backup.mjs` | Upload local backup to S3 |
| `restore-from-offsite.mjs` | Download from S3 and restore to database |

## Upload to S3

### Command

```bash
cd /home/ubuntu/b1-appbuilder
node scripts/offsite-backup.mjs [environment] [backup-file]
```

### Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `environment` | No | staging | Environment name (staging/production) |
| `backup-file` | No | Latest | Specific backup file path |

### Examples

Upload the most recent backup:
```bash
node scripts/offsite-backup.mjs staging
```

Upload a specific backup:
```bash
node scripts/offsite-backup.mjs staging backups/staging/backup_staging_20251215_210704.sql.gz
```

### S3 Key Structure

Backups are stored with the following key pattern:
```
db-backups/{environment}/{backup-filename}
```

Example:
```
db-backups/staging/backup_staging_20251215210704.sql.gz
db-backups/staging/backup_staging_20251215210704.sql.gz.sha256
```

## Restore from S3

### Command

```bash
cd /home/ubuntu/b1-appbuilder
node scripts/restore-from-offsite.mjs <s3-key>
```

### Example

```bash
node scripts/restore-from-offsite.mjs db-backups/staging/backup_staging_20251215210704.sql.gz
```

### Process

The restore script performs these steps:

1. Get presigned download URL from S3
2. Download backup file to `/tmp/offsite-restore/`
3. Decompress the gzip file
4. Restore to database using mysql client
5. Clean up temporary files

## Automation

### Combined Local + Off-site Backup

To run both local and off-site backup in sequence:

```bash
cd /home/ubuntu/b1-appbuilder

# Run local backup
node scripts/automated-backup.mjs staging

# Upload to off-site
node scripts/offsite-backup.mjs staging
```

### Cron Configuration

For daily off-site backup after local backup:

```bash
# Daily at 2:30 AM (30 minutes after local backup)
30 2 * * * cd /home/ubuntu/b1-appbuilder && node scripts/offsite-backup.mjs staging >> /var/log/b1-offsite-backup.log 2>&1
```

## Disaster Recovery Scenario

If local backups are unavailable, follow this procedure:

| Step | Action | Command |
|------|--------|---------|
| 1 | Identify available S3 backups | Check S3 console or logs |
| 2 | Choose backup to restore | Select by date/time |
| 3 | Run restore | `node scripts/restore-from-offsite.mjs <s3-key>` |
| 4 | Verify health | `curl /healthz && curl /readyz` |
| 5 | Verify functionality | Test critical flows |

## Verified Performance

The off-site backup system was tested on 2025-12-16 with the following results:

| Operation | Duration | Status |
|-----------|----------|--------|
| Upload to S3 | ~2 seconds | ✅ |
| Download from S3 | ~1 second | ✅ |
| Full restore (download + decompress + restore) | 26.5 seconds | ✅ |
| Health verification | Immediate | ✅ |

## Failure Handling

If the off-site backup fails:

| Scenario | Alert | Action |
|----------|-------|--------|
| No local backup found | Yes | Run local backup first |
| S3 upload failed | Yes | Check credentials and retry |
| Download failed | No | Verify S3 key exists |
| Restore failed | No | Check DATABASE_URL and permissions |

## Security Considerations

The off-site backup system uses the following security measures:

| Measure | Implementation |
|---------|----------------|
| **Authentication** | Bearer token (BUILT_IN_FORGE_API_KEY) |
| **Transport** | HTTPS/TLS |
| **Storage** | S3 server-side encryption |
| **Access** | Presigned URLs with expiration |

> **Note:** Backup files contain sensitive database content. The S3 bucket is configured with appropriate access controls, but the presigned download URLs are time-limited for additional security.

## Related Documentation

- [Automated Daily Backup](./AUTOMATED_BACKUP.md) - Local backup procedures
- [Backup & Restore Procedures](./BACKUP_RESTORE_PROCEDURES.md) - Manual backup/restore
- [Fire Drill Quarterly Template](./FIRE_DRILL_QUARTERLY_TEMPLATE.md) - Includes off-site restore scenario
