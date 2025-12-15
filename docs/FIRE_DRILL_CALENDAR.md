# Fire Drill Calendar & Escalation Rules

This document defines the quarterly fire drill schedule, ownership responsibilities, and escalation procedures for B1 AppBuilder.

## Annual Schedule

Fire drills are conducted quarterly on the **15th of the middle month** of each quarter. If the 15th falls on a weekend, the drill moves to the following Monday.

| Quarter | Month | Scheduled Date | Backup Date | Focus Area |
|---------|-------|----------------|-------------|------------|
| **Q1 2025** | February | 2025-02-15 (Sat) | **2025-02-17 (Mon)** | Full drill + Sentry verification |
| **Q2 2025** | May | 2025-05-15 (Thu) | - | Full drill + Backup failure simulation |
| **Q3 2025** | August | 2025-08-15 (Fri) | - | Full drill + Sentry verification |
| **Q4 2025** | November | 2025-11-15 (Sat) | **2025-11-17 (Mon)** | Full drill + ENV rollback |

## First Drill: Q1 2025

| Field | Value |
|-------|-------|
| **Date** | 2025-02-17 (Monday) |
| **Time** | 10:00 AM local time |
| **Duration** | 60 minutes max |
| **Environment** | Staging |
| **Owner** | [To be assigned] |

### Q1 Drill Scope

| Scenario | Required |
|----------|----------|
| Application Rollback | ✅ |
| DB Restore | ✅ |
| Health Verification | ✅ |
| Functional Test | ✅ |
| Sentry Alert Verification | ✅ (Q1 focus) |

## Ownership & Responsibilities

### Drill Owner

The Drill Owner is responsible for the end-to-end execution of each quarterly drill.

| Responsibility | Description |
|----------------|-------------|
| **Scheduling** | Confirm date 2 weeks in advance |
| **Preparation** | Verify prerequisites 1 day before |
| **Execution** | Lead the drill execution |
| **Documentation** | Complete drill report within 24 hours |
| **Follow-up** | Track action items to completion |

### Rotation Schedule

Ownership rotates quarterly to ensure knowledge distribution:

| Quarter | Primary Owner | Backup Owner |
|---------|---------------|--------------|
| Q1 2025 | [TBD] | [TBD] |
| Q2 2025 | [TBD] | [TBD] |
| Q3 2025 | [TBD] | [TBD] |
| Q4 2025 | [TBD] | [TBD] |

## Pre-Drill Timeline

| Days Before | Action | Owner |
|-------------|--------|-------|
| **14 days** | Confirm drill date with team | Drill Owner |
| **7 days** | Send calendar invite | Drill Owner |
| **3 days** | Verify backup exists | Drill Owner |
| **1 day** | Pre-drill checklist | Drill Owner |
| **Day of** | Execute drill | Drill Owner |
| **+1 day** | Submit drill report | Drill Owner |

## Escalation Rules

### During Drill

If the drill cannot be completed, escalate as follows:

| Situation | Action | Escalate To |
|-----------|--------|-------------|
| Technical blocker | Pause drill, investigate | Tech Lead |
| Environment unavailable | Reschedule within 48 hours | Project Owner |
| RTO exceeds 2x target | Document and continue | Tech Lead |
| Complete failure | Stop drill, create incident | Project Owner |

### Missed Drill

If a quarterly drill is missed:

| Days Overdue | Action |
|--------------|--------|
| **1-7 days** | Reschedule immediately, no escalation |
| **8-14 days** | Escalate to Project Owner, mandatory reschedule |
| **15+ days** | Incident report required, root cause analysis |

### Failed Drill

If a drill fails (unable to restore within RTO):

| Step | Action | Timeline |
|------|--------|----------|
| 1 | Document failure details | Same day |
| 2 | Identify root cause | 48 hours |
| 3 | Implement fix | 1 week |
| 4 | Schedule re-drill | 2 weeks |

## Success Metrics

Each drill is evaluated against these targets:

| Metric | Target | Acceptable | Unacceptable |
|--------|--------|------------|--------------|
| **Application RTO** | < 5 min | 5-10 min | > 10 min |
| **Database RTO** | < 15 min | 15-30 min | > 30 min |
| **Total Drill Time** | < 60 min | 60-90 min | > 90 min |
| **Drill Completion** | 100% | 100% | < 100% |

## Notification Templates

### Pre-Drill Notification (7 days before)

> **Subject:** Quarterly Fire Drill Scheduled - [DATE]
>
> Team,
>
> Our Q[X] fire drill is scheduled for [DATE] at [TIME].
>
> **Scope:** Application rollback, DB restore, health verification
> **Environment:** Staging
> **Duration:** ~60 minutes
>
> Please ensure you're available. Contact [Owner] with questions.

### Post-Drill Summary

> **Subject:** Fire Drill Report - Q[X] [YEAR]
>
> **Result:** PASS / FAIL
> **Application RTO:** [X] minutes
> **Database RTO:** [X] minutes
>
> **Issues Found:** [Summary]
> **Action Items:** [List]
>
> Full report: [Link to FIRE_DRILL_REPORT_YYYY-MM-DD.md]

## Calendar Integration

Add these recurring events to your calendar:

| Event | Recurrence | Duration | Reminder |
|-------|------------|----------|----------|
| Fire Drill - Q1 | Yearly, Feb 15 | 90 min | 1 week, 1 day |
| Fire Drill - Q2 | Yearly, May 15 | 90 min | 1 week, 1 day |
| Fire Drill - Q3 | Yearly, Aug 15 | 90 min | 1 week, 1 day |
| Fire Drill - Q4 | Yearly, Nov 15 | 90 min | 1 week, 1 day |

## Related Documentation

- [Fire Drill Quarterly Template](./FIRE_DRILL_QUARTERLY_TEMPLATE.md)
- [DB Restore Drill Checklist](./DB_RESTORE_DRILL_CHECKLIST.md)
- [Rollback Procedures](./ROLLBACK_PROCEDURES.md)
- [Backup & Restore Procedures](./BACKUP_RESTORE_PROCEDURES.md)
