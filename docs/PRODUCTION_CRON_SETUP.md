# Production Cron Setup

This document provides instructions for setting up automated backups in a production environment using system cron. For staging environments using Manus hosting, automated scheduling is handled by the Manus Schedule Tool.

## Prerequisites

Before configuring cron, ensure the following are in place:

| Requirement | Description |
|-------------|-------------|
| Node.js | Version 18+ installed and accessible |
| Database access | DATABASE_URL configured and tested |
| S3 access | BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY configured |
| Log directory | `/home/ubuntu/b1-appbuilder/logs` exists |
| Backup directory | `/home/ubuntu/b1-appbuilder/backups/staging` exists |

## Environment File

Create a dedicated environment file for cron jobs. This ensures cron has access to all required variables regardless of shell configuration.

### Create the file

```bash
sudo nano /home/ubuntu/b1-appbuilder/.env.cron
```

### Required variables

```bash
# Database
DATABASE_URL=mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}

# Manus Forge API (for S3 and notifications)
BUILT_IN_FORGE_API_URL=https://api.manus.im/
BUILT_IN_FORGE_API_KEY=your-api-key

# Optional: Node environment
NODE_ENV=production
```

### Secure the file

```bash
chmod 600 /home/ubuntu/b1-appbuilder/.env.cron
```

## Environment Wrapper Script

The wrapper script ensures environment variables are loaded before running backup scripts.

### Location

```
/home/ubuntu/b1-appbuilder/scripts/run-with-env.sh
```

### Content

```bash
#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="/home/ubuntu/b1-appbuilder/.env.cron"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ENV file missing: $ENV_FILE"
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

exec "$@"
```

### Make executable

```bash
chmod +x /home/ubuntu/b1-appbuilder/scripts/run-with-env.sh
```

## Cron Configuration

### Edit crontab

```bash
crontab -e
```

### Add entries

```cron
# B1 AppBuilder Daily Backups
# ============================

# Daily local backup — 02:00 AM
0 2 * * * cd /home/ubuntu/b1-appbuilder && ./scripts/run-with-env.sh node scripts/automated-backup.mjs staging >> logs/backup.log 2>&1

# Daily off-site backup — 02:30 AM
30 2 * * * cd /home/ubuntu/b1-appbuilder && ./scripts/run-with-env.sh node scripts/offsite-backup.mjs staging >> logs/offsite-backup.log 2>&1
```

### Verify crontab

```bash
crontab -l
```

## Directory Setup

Ensure required directories exist:

```bash
mkdir -p /home/ubuntu/b1-appbuilder/logs
mkdir -p /home/ubuntu/b1-appbuilder/backups/staging
```

## Manual Testing

Before waiting for cron to run, test manually:

```bash
cd /home/ubuntu/b1-appbuilder

# Test local backup
./scripts/run-with-env.sh node scripts/automated-backup.mjs staging

# Test off-site backup
./scripts/run-with-env.sh node scripts/offsite-backup.mjs staging
```

### Expected results

| Test | Success Indicator |
|------|-------------------|
| Local backup | File created in `backups/staging/` with `.sql.gz` extension |
| Local backup | Checksum file created with `.sha256` extension |
| Off-site backup | "Backup uploaded" message in output |
| Off-site backup | "Verification successful" message in output |

## Log Monitoring

### View recent logs

```bash
# Local backup log
tail -n 50 /home/ubuntu/b1-appbuilder/logs/backup.log

# Off-site backup log
tail -n 50 /home/ubuntu/b1-appbuilder/logs/offsite-backup.log
```

### Check for errors

```bash
grep -i "error\|fail" /home/ubuntu/b1-appbuilder/logs/backup.log
grep -i "error\|fail" /home/ubuntu/b1-appbuilder/logs/offsite-backup.log
```

## Troubleshooting

### Common issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "ENV file missing" | `.env.cron` not found | Create file per instructions above |
| "node: command not found" | Node not in cron PATH | Use full path: `/usr/bin/node` |
| "Database connection failed" | DATABASE_URL incorrect | Verify URL in `.env.cron` |
| "Storage upload failed" | API credentials invalid | Check BUILT_IN_FORGE_API_KEY |
| No output in logs | Cron not running | Check `systemctl status cron` |

### Debug cron execution

```bash
# Check cron service status
systemctl status cron

# View cron logs
grep CRON /var/log/syslog | tail -20

# Test with explicit PATH
cd /home/ubuntu/b1-appbuilder && PATH=/usr/bin:$PATH ./scripts/run-with-env.sh node scripts/automated-backup.mjs staging
```

## Verification Checklist

After setup, verify the following over two consecutive days:

| Check | Day 1 | Day 2 |
|-------|-------|-------|
| Local backup file created | ☐ | ☐ |
| Checksum file created | ☐ | ☐ |
| Off-site upload succeeded | ☐ | ☐ |
| Old backups deleted (retention) | ☐ | ☐ |
| No errors in logs | ☐ | ☐ |
| No manual intervention needed | ☐ | ☐ |

## Alert Configuration

The backup scripts include built-in alerting via the notifyOwner API. Alerts are sent automatically when:

- Local backup fails
- Off-site upload fails
- Checksum verification fails

No additional configuration is required for alerts.

## Related Documentation

- [Automated Daily Backup](./AUTOMATED_BACKUP.md) - Script details and retention policy
- [Off-site Backup](./OFFSITE_BACKUP.md) - S3 upload and restore procedures
- [Backup & Restore Procedures](./BACKUP_RESTORE_PROCEDURES.md) - Manual backup/restore
