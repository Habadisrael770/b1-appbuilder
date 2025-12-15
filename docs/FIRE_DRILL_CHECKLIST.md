# Fire Drill Checklist: Staging Environment

This document provides a step-by-step guide for executing a controlled fire drill on the staging (Preview) environment. The purpose is to prove that rollback procedures work in practice, not just on paper.

## Prerequisites

Before starting the fire drill, ensure the following conditions are met.

| Prerequisite | Status |
|--------------|--------|
| Phase A (Sentry) complete | ☐ |
| Phase B documentation ready | ☐ |
| ROLLBACK_PROCEDURES.md reviewed | ☐ |
| Access to Manus Management UI | ☐ |
| Stopwatch or timer ready | ☐ |

## Step 1: Baseline Verification

**Objective:** Confirm staging is healthy before introducing any changes.

**Actions:**

1. Note the current timestamp: `______________`

2. Note the current checkpoint version: `______________`

3. Access the Preview URL and verify the homepage loads correctly.

4. Execute health checks:

```bash
curl https://[PREVIEW_URL]/healthz
curl https://[PREVIEW_URL]/readyz
```

**Expected Results:**

| Endpoint | Expected Response | Actual Response | Status |
|----------|-------------------|-----------------|--------|
| `/healthz` | `{"ok":true}` | | ☐ |
| `/readyz` | `{"ok":true,"db":"up"}` | | ☐ |

**Baseline Verified:** ☐

## Step 2: Create Controlled Break

**Objective:** Introduce a controlled failure that simulates a production incident.

**Recommended Break Options:**

| Option | Description | Severity | Reversibility |
|--------|-------------|----------|---------------|
| **A** | Add syntax error to health.ts | High | Easy (rollback) |
| **B** | Return 503 from /readyz | Medium | Easy (code change) |
| **C** | Break database query in readyz | High | Easy (rollback) |

**Selected Break Option:** `______`

**Actions:**

1. Start the timer: `__:__:__`

2. Implement the selected break. For Option A, edit `server/routes/health.ts`:

```typescript
// Add intentional syntax error or return error
export async function readyz(_req: IncomingMessage, res: ServerResponse) {
  // FIRE DRILL: Intentional failure
  json(res, 503, { ok: false, reason: "fire-drill-test" });
}
```

3. Save the file and wait for dev server to reload.

4. Verify the break is active:

```bash
curl https://[PREVIEW_URL]/readyz
```

**Expected:** `{"ok":false,"reason":"fire-drill-test"}` or 503 error

**Break Confirmed:** ☐

**Break Time:** `__:__:__`

## Step 3: Detection Phase

**Objective:** Simulate incident detection as it would happen in production.

**Actions:**

1. Check health endpoints (simulating monitoring alert):

```bash
curl https://[PREVIEW_URL]/healthz
curl https://[PREVIEW_URL]/readyz
```

2. Note the detection timestamp: `__:__:__`

3. Verify the failure appears in Sentry (if error-based break).

**Detection Metrics:**

| Metric | Value |
|--------|-------|
| Time from break to detection | `____` seconds |
| Detection method | Manual / Automated |

## Step 4: Execute Rollback

**Objective:** Follow ROLLBACK_PROCEDURES.md to restore service.

**Actions:**

1. Decision timestamp (when rollback was decided): `__:__:__`

2. Open Manus Management UI.

3. Navigate to Dashboard panel.

4. Locate the last known good checkpoint (noted in Step 1).

5. Click **Rollback** button next to that checkpoint.

6. Confirm the rollback action.

7. Wait for rollback to complete.

8. Rollback completion timestamp: `__:__:__`

**Rollback Executed:** ☐

## Step 5: Recovery Verification

**Objective:** Confirm the system is healthy after rollback.

**Actions:**

1. Execute health checks:

```bash
curl https://[PREVIEW_URL]/healthz
curl https://[PREVIEW_URL]/readyz
```

2. Verify homepage loads correctly.

3. Recovery confirmed timestamp: `__:__:__`

**Expected Results:**

| Endpoint | Expected Response | Actual Response | Status |
|----------|-------------------|-----------------|--------|
| `/healthz` | `{"ok":true}` | | ☐ |
| `/readyz` | `{"ok":true,"db":"up"}` | | ☐ |

**Recovery Verified:** ☐

## Step 6: Calculate RTO

**Objective:** Measure Recovery Time Objective achieved during this drill.

**Time Calculations:**

| Metric | Timestamp | Duration |
|--------|-----------|----------|
| Break introduced | `__:__:__` | - |
| Break detected | `__:__:__` | `____` sec (detection time) |
| Rollback decided | `__:__:__` | `____` sec (decision time) |
| Rollback completed | `__:__:__` | `____` sec (rollback time) |
| Recovery verified | `__:__:__` | `____` sec (verification time) |

**Total RTO (Break → Recovery):** `________` seconds

**RTO Assessment:**

| RTO | Rating | Action |
|-----|--------|--------|
| < 5 min | Excellent | No action needed |
| 5-15 min | Good | Minor improvements possible |
| 15-30 min | Acceptable | Review and optimize |
| > 30 min | Needs improvement | Immediate action required |

**RTO Rating:** `____________`

## Step 7: Document Findings

**What Worked Well:**

1. `_________________________________________________`

2. `_________________________________________________`

3. `_________________________________________________`

**What Needs Improvement:**

1. `_________________________________________________`

2. `_________________________________________________`

3. `_________________________________________________`

**Action Items:**

| Item | Priority | Owner | Due Date |
|------|----------|-------|----------|
| | | | |
| | | | |
| | | | |

## Fire Drill Summary

| Item | Value |
|------|-------|
| Fire Drill Date | `____________` |
| Conducted By | `____________` |
| Break Type | `____________` |
| Total RTO | `____________` |
| Overall Result | ☐ Pass / ☐ Fail |

**Signatures:**

Conducted By: `________________________` Date: `____________`

Reviewed By: `________________________` Date: `____________`

## Next Steps

After completing this fire drill:

1. If **Pass**: Proceed to Phase C.0 (Backup & Restore Strategy)

2. If **Fail**: Address action items and repeat fire drill

3. Schedule next fire drill: `____________` (recommended: quarterly)
