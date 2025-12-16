# B1 AppBuilder Operations Documentation

This index provides quick access to all operational documentation for B1 AppBuilder. Use this as your starting point during incidents, deployments, and routine operations.

## Quick Start: Something is Broken

When facing an incident, follow this decision tree:

| Symptom | First Action | Document |
|---------|--------------|----------|
| App not responding | Check `/healthz` and `/readyz` | [Staging Workflow](./STAGING_WORKFLOW.md) |
| Bad deploy | Rollback to previous checkpoint | [Rollback Procedures](./ROLLBACK_PROCEDURES.md) |
| Database issue | Restore from backup | [Backup & Restore](./BACKUP_RESTORE_PROCEDURES.md) |
| Local backup unavailable | Restore from S3 | [Off-site Backup](./OFFSITE_BACKUP.md) |

> **Critical:** Always verify health endpoints after any recovery action: `/healthz` should return `{"ok":true}` and `/readyz` should return `{"ok":true,"db":"up"}`.

---

## Deploy & Rollback

These documents cover the deployment lifecycle from staging to production, including rollback procedures when things go wrong.

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [Staging Workflow](./STAGING_WORKFLOW.md) | Dev → Staging → Production flow | Before any deploy |
| [Rollback Procedures](./ROLLBACK_PROCEDURES.md) | How to revert bad changes | After failed deploy |
| [Checkpoint Discipline Policy](./CHECKPOINT_DISCIPLINE_POLICY.md) | When checkpoints are required | Before every deploy |
| [Checklist B: Staging](./CHECKLIST_B_STAGING.md) | Pre-publish verification gates | Before clicking Publish |

---

## Backup & Restore

These documents cover data protection, including local backups, off-site storage, and restoration procedures.

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [Backup & Restore Procedures](./BACKUP_RESTORE_PROCEDURES.md) | Manual backup/restore commands | Data recovery |
| [Automated Daily Backup](./AUTOMATED_BACKUP.md) | Cron-based backup setup | Setting up automation |
| [Off-site Backup](./OFFSITE_BACKUP.md) | S3 backup for disaster recovery | When local unavailable |

### Key Commands

**Create backup:**
```bash
node scripts/automated-backup.mjs staging
```

**Upload to off-site:**
```bash
node scripts/offsite-backup.mjs staging
```

**Restore from local:**
```bash
node scripts/db-restore.mjs backups/staging/<file>.sql.gz
```

**Restore from off-site:**
```bash
node scripts/restore-from-offsite.mjs db-backups/staging/<file>.sql.gz
```

---

## Fire Drills

These documents support quarterly fire drills to maintain team readiness and validate recovery procedures.

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [Fire Drill Calendar](./FIRE_DRILL_CALENDAR.md) | Annual schedule + escalation rules | Planning drills |
| [Fire Drill Quarterly Template](./FIRE_DRILL_QUARTERLY_TEMPLATE.md) | Reusable drill execution template | Running drills |
| [DB Restore Drill Checklist](./DB_RESTORE_DRILL_CHECKLIST.md) | Step-by-step DB restore drill | During drill |
| [Fire Drill Checklist](./FIRE_DRILL_CHECKLIST.md) | General drill checklist | During drill |

### Next Scheduled Drill

| Field | Value |
|-------|-------|
| **Date** | 2025-02-17 (Monday) |
| **Time** | 10:00 AM local |
| **Scope** | Full drill + DB restore |
| **Owner** | Project Owner |

---

## Reports & History

These documents capture results from past fire drills and recovery operations for reference and improvement.

| Document | Date | Summary |
|----------|------|---------|
| [Fire Drill Report 2025-12-15](./FIRE_DRILL_REPORT_2025-12-15.md) | 2025-12-15 | First fire drill, discovered checkpoint limitation |
| [Backup Restore Report 2025-12-15](./BACKUP_RESTORE_REPORT_2025-12-15.md) | 2025-12-15 | DB backup/restore verification |

---

## Health Endpoints

The application exposes two health endpoints for monitoring:

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/healthz` | Basic liveness check | `{"ok":true}` |
| `/readyz` | Readiness with DB check | `{"ok":true,"db":"up"}` |

**Quick check:**
```bash
curl https://<your-domain>/healthz
curl https://<your-domain>/readyz
```

---

## Scripts Reference

All operational scripts are located in `/home/ubuntu/b1-appbuilder/scripts/`:

| Script | Purpose |
|--------|---------|
| `automated-backup.mjs` | Daily backup with retention |
| `db-backup.mjs` | Manual backup |
| `db-restore.mjs` | Restore from local backup |
| `offsite-backup.mjs` | Upload backup to S3 |
| `restore-from-offsite.mjs` | Restore from S3 backup |
| `pre-publish-check.mjs` | Pre-deploy health verification |

---

## Contacts & Ownership

| Role | Responsibility |
|------|----------------|
| **Project Owner** | Overall system responsibility |
| **Q1 2025 Fire Drill Owner** | Project Owner |

---

## Document Maintenance

This documentation set was created and verified on 2025-12-15/16. Documents should be reviewed and updated:

- After each fire drill (update reports)
- After significant infrastructure changes
- Quarterly, alongside fire drill preparation

**Last updated:** 2025-12-16
