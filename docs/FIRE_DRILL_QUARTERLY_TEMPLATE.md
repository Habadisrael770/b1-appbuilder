# Fire Drill Quarterly Template

This template provides a standardized structure for conducting quarterly fire drills. Each drill validates recovery procedures and maintains team readiness for production incidents.

## Drill Information

| Field | Value |
|-------|-------|
| **Drill Date** | YYYY-MM-DD |
| **Quarter** | Q1/Q2/Q3/Q4 YYYY |
| **Owner** | [Name] |
| **Participants** | [Names] |
| **Environment** | Staging |
| **Start Time** | HH:MM UTC |
| **End Time** | HH:MM UTC |

## Pre-Drill Checklist

Before starting the drill, verify the following conditions are met:

| Check | Status | Notes |
|-------|--------|-------|
| Staging environment accessible | ☐ | |
| Latest checkpoint available | ☐ | Version: |
| Recent backup exists (< 24h) | ☐ | File: |
| Health endpoints green | ☐ | /healthz, /readyz |
| Participants notified | ☐ | |
| Documentation accessible | ☐ | |

## Drill Scope

Each quarterly drill **must** include all of the following scenarios:

| Scenario | Required | Description |
|----------|----------|-------------|
| **Application Rollback** | ✅ | Rollback to previous checkpoint |
| **DB Restore** | ✅ | Restore from backup file |
| **Health Verification** | ✅ | Confirm /healthz and /readyz |
| **Functional Test** | ✅ | Test critical user flow |

Optional scenarios (rotate quarterly):

| Scenario | Q1 | Q2 | Q3 | Q4 |
|----------|----|----|----|----|
| Sentry alert verification | ✅ | | ✅ | |
| Backup failure simulation | | ✅ | | ✅ |
| ENV rollback | ✅ | | | ✅ |

## Drill Execution

### Phase 1: Baseline (5 min)

Record the current system state before introducing any failures.

| Metric | Value |
|--------|-------|
| Current checkpoint | |
| /healthz response | |
| /readyz response | |
| Latest backup file | |
| Timestamp | |

### Phase 2: Application Rollback (15 min)

Simulate an application failure and recover using checkpoint rollback.

**Steps:**
1. Introduce controlled break (e.g., modify health endpoint)
2. Record break detection time
3. Execute rollback to last good checkpoint
4. Verify health endpoints return 200
5. Record recovery time

| Metric | Value |
|--------|-------|
| Break introduced at | |
| Break detected at | |
| Rollback initiated at | |
| Rollback completed at | |
| Health verified at | |
| **RTO (Application)** | |

### Phase 3: Database Restore (20 min)

Simulate data corruption and recover using database restore.

**Steps:**
1. Identify backup file to restore
2. Verify backup checksum
3. Execute restore script
4. Verify database connectivity
5. Verify health endpoints
6. Test critical functionality

| Metric | Value |
|--------|-------|
| Backup file | |
| Backup age | |
| Checksum verified | ☐ |
| Restore started at | |
| Restore completed at | |
| Health verified at | |
| **RTO (Database)** | |

### Phase 4: Functional Verification (10 min)

Confirm the system is fully operational after recovery.

| Test | Status | Notes |
|------|--------|-------|
| Homepage loads | ☐ | |
| Login flow works | ☐ | |
| API responds correctly | ☐ | |
| No Sentry errors | ☐ | |

## Results Summary

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Application RTO | < 5 min | | ☐ Pass / ☐ Fail |
| Database RTO | < 15 min | | ☐ Pass / ☐ Fail |
| Total Drill Time | < 60 min | | ☐ Pass / ☐ Fail |
| All scenarios completed | Yes | | ☐ Pass / ☐ Fail |

## Issues Discovered

Document any issues found during the drill:

| Issue | Severity | Action Required | Owner | Due Date |
|-------|----------|-----------------|-------|----------|
| | | | | |
| | | | | |

## Lessons Learned

Summarize key takeaways from this drill:

1. **What worked well:**
   - 

2. **What needs improvement:**
   - 

3. **Process changes recommended:**
   - 

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Drill Owner | | | |
| Participant | | | |
| Reviewer | | | |

## Next Drill

| Field | Value |
|-------|-------|
| **Scheduled Date** | |
| **Owner** | |
| **Focus Areas** | |

---

## Quick Commands Reference

```bash
# Check health
curl https://[staging-url]/healthz
curl https://[staging-url]/readyz

# Run backup
cd /home/ubuntu/b1-appbuilder
node scripts/automated-backup.mjs staging

# Restore database
node scripts/db-restore.mjs backups/staging/[backup-file].sql.gz

# View backup log
cat backups/backup.log | tail -50
```

## Related Documentation

- [Rollback Procedures](./ROLLBACK_PROCEDURES.md)
- [Backup & Restore Procedures](./BACKUP_RESTORE_PROCEDURES.md)
- [DB Restore Drill Checklist](./DB_RESTORE_DRILL_CHECKLIST.md)
- [Previous Fire Drill Report](./FIRE_DRILL_REPORT_2025-12-15.md)
