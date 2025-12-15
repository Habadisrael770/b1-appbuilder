# Sentry Setup Checklist (Phase A)

**Goal:** Connect Sentry for real-time error tracking with alerts  
**Time Estimate:** 2-4 hours  
**Prerequisites:** Week 1-2 observability code already implemented

---

## 🎯 Success Gates (Must Pass Before Moving to Phase B)

Before proceeding to Staging setup, verify:

1. ✅ Both Sentry projects created (Frontend + Backend)
2. ✅ Intentional errors captured in Sentry dashboard (<60 seconds)
3. ✅ Stacktraces are readable (not minified)
4. ✅ No PII in error events (emails, JWTs, cookies scrubbed)
5. ✅ Alert notifications delivered to Slack/Email

**If any gate fails → stop and debug before continuing.**

---

## Part 1: Create Sentry Account & Projects (15 minutes)

### Step 1.1: Sign Up for Sentry

1. Go to https://sentry.io
2. Click **"Get Started"** or **"Sign Up"**
3. Choose **"Sign up with GitHub"** (recommended) or email
4. Complete account creation

**Gate:** You can log in to Sentry dashboard

---

### Step 1.2: Create Backend Project

1. Click **"Create Project"** (or Projects → Create Project)
2. **Platform:** Select **"Node.js"**
3. **Alert frequency:** Select **"Alert me on every new issue"**
4. **Project name:** `b1-appbuilder-backend`
5. **Team:** Default team (or create "Production" team)
6. Click **"Create Project"**

**Important:** Copy the DSN immediately - it looks like:
```
https://abc123@o123456.ingest.sentry.io/7890123
```

**Save this as:** `SENTRY_DSN` (backend environment variable)

---

### Step 1.3: Create Frontend Project

1. Click **"Projects"** → **"Create Project"** again
2. **Platform:** Select **"React"**
3. **Alert frequency:** Select **"Alert me on every new issue"**
4. **Project name:** `b1-appbuilder-frontend`
5. **Team:** Same team as backend
6. Click **"Create Project"**

**Copy the DSN** - save as: `VITE_SENTRY_DSN` (frontend environment variable)

**Gate:** You have two DSNs saved (backend + frontend)

---

### Step 1.4: Create Auth Token (for Sourcemaps)

1. Click your **profile icon** (bottom left) → **"Auth Tokens"**
2. Click **"Create New Token"**
3. **Token name:** `b1-appbuilder-ci-sourcemaps`
4. **Scopes:** Select:
   - ✅ `project:read`
   - ✅ `project:releases`
   - ✅ `org:read`
5. Click **"Create Token"**

**Copy the token** - save as: `SENTRY_AUTH_TOKEN` (CI environment variable)

⚠️ **Warning:** Token shown only once - save it immediately!

**Gate:** You have auth token saved

---

## Part 2: Configure Environment Variables (10 minutes)

### Step 2.1: Backend Environment Variables

Add to your hosting platform (Manus Settings → Secrets):

```bash
# Required
SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/7890123
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=prod-ready-1.1

# Optional (recommended)
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.05
```

**How to add in Manus:**
1. Open project in Manus
2. Settings → Secrets
3. Add each variable one by one
4. Restart server after adding all variables

---

### Step 2.2: Frontend Environment Variables

Add to your hosting platform:

```bash
# Required
VITE_SENTRY_DSN=https://xyz789@o123456.ingest.sentry.io/7890456
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_RELEASE=prod-ready-1.1

# Optional (recommended)
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.0
VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=0.1
```

---

### Step 2.3: CI Environment Variables (for Sourcemaps)

Add to GitHub Actions secrets (or CI platform):

```bash
SENTRY_AUTH_TOKEN=sntrys_abc123...
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=b1-appbuilder-frontend
SENTRY_RELEASE=prod-ready-1.1
```

**How to add in GitHub:**
1. Go to repo → Settings → Secrets and variables → Actions
2. Click **"New repository secret"**
3. Add each variable
4. Name: `SENTRY_AUTH_TOKEN`, Value: (paste token)

**Gate:** All environment variables configured

---

## Part 3: Verify Error Capture (30 minutes)

### Step 3.1: Create Test Endpoint for Backend Error

Create a temporary test route:

```typescript
// server/routes/health.ts (add at the end)

export async function testSentryError(_req: IncomingMessage, res: ServerResponse) {
  // Intentional error for Sentry testing
  throw new Error("🧪 Test backend error - Sentry verification");
}
```

Add to server:

```typescript
// server/_core/index.ts (in startServer function, after health endpoints)

app.get("/test-sentry-error", testSentryError);
```

---

### Step 3.2: Trigger Backend Error

1. Restart your server (to load new env vars)
2. Visit: `https://your-app.manus.space/test-sentry-error`
3. You should see an error page

**Expected:** Server logs show error, but page returns 500

---

### Step 3.3: Verify in Sentry Dashboard

1. Go to Sentry → Projects → `b1-appbuilder-backend`
2. Click **"Issues"** in left sidebar
3. **Within 60 seconds**, you should see:
   - New issue: "🧪 Test backend error - Sentry verification"
   - Click on it

**Verify:**
- ✅ Error message is correct
- ✅ Stacktrace shows file names and line numbers (not minified)
- ✅ Request details show URL `/test-sentry-error`
- ✅ **No PII:** Check "Additional Data" - should NOT contain:
  - Email addresses
  - JWT tokens
  - Cookie values
  - Authorization headers

**Gate:** Backend error captured with readable stacktrace, no PII

---

### Step 3.4: Create Test Button for Frontend Error

Add to your app (temporary):

```typescript
// client/src/pages/Home.tsx (add button somewhere visible)

<button
  onClick={() => {
    throw new Error("🧪 Test frontend error - Sentry verification");
  }}
  className="bg-red-500 text-white px-4 py-2 rounded"
>
  Test Sentry (Remove After Testing)
</button>
```

---

### Step 3.5: Trigger Frontend Error

1. Rebuild and deploy your app
2. Open your app in browser
3. Click the "Test Sentry" button
4. You should see error boundary or error message

---

### Step 3.6: Verify Frontend Error in Sentry

1. Go to Sentry → Projects → `b1-appbuilder-frontend`
2. Click **"Issues"**
3. **Within 60 seconds**, you should see the error

**Verify:**
- ✅ Error message correct
- ✅ Stacktrace shows React component names (not minified)
- ✅ Breadcrumbs show user actions before error
- ✅ **No PII:** Query strings removed from URLs

**Gate:** Frontend error captured with readable stacktrace

---

### Step 3.7: Clean Up Test Code

**Remove:**
- Test endpoint from `server/routes/health.ts`
- Test route from `server/_core/index.ts`
- Test button from `client/src/pages/Home.tsx`

Commit and deploy the cleanup.

---

## Part 4: Configure Alert Rules (45 minutes)

### Alert Rule 1: Backend Error Spike

**Purpose:** Detect sudden increase in errors

1. Go to **Alerts** (left sidebar)
2. Click **"Create Alert"**
3. **Choose:** "Issues"
4. **Project:** `b1-appbuilder-backend`
5. **Conditions:**
   - When: **"The issue is seen"**
   - Filter: **"more than 5 times"**
   - In: **"5 minutes"**
6. **Then perform these actions:**
   - Send notification to: **[Your Email]** or **[Slack Channel]**
7. **Alert name:** `Backend Error Spike (>5 in 5min)`
8. **Team:** Your team
9. Click **"Save Rule"**

**Recommended Threshold:** 5 errors in 5 minutes (adjust based on traffic)

---

### Alert Rule 2: Backend New Issue

**Purpose:** Immediate notification for new error types

1. Click **"Create Alert"** again
2. **Choose:** "Issues"
3. **Project:** `b1-appbuilder-backend`
4. **Conditions:**
   - When: **"A new issue is created"**
   - Filter: **"None"** (all new issues)
5. **Then perform these actions:**
   - Send notification to: **[Your Email]** or **[Slack Channel]**
6. **Alert name:** `Backend New Issue (Immediate)`
7. Click **"Save Rule"**

---

### Alert Rule 3: Backend 5xx Regression

**Purpose:** Detect server errors after deployment

1. Click **"Create Alert"**
2. **Choose:** "Issues"
3. **Project:** `b1-appbuilder-backend`
4. **Conditions:**
   - When: **"The issue's state changes"**
   - From: **"resolved"**
   - To: **"unresolved"**
5. **Then perform these actions:**
   - Send notification to: **[Your Email]** or **[Slack Channel]**
6. **Alert name:** `Backend Regression (Resolved → Unresolved)`
7. Click **"Save Rule"**

---

### Alert Rule 4: Frontend Error Rate

**Purpose:** Detect high error rate affecting users

1. Click **"Create Alert"**
2. **Choose:** "Issues"
3. **Project:** `b1-appbuilder-frontend`
4. **Conditions:**
   - When: **"The issue is seen"**
   - Filter: **"more than 10 times"**
   - In: **"5 minutes"**
6. **Then perform these actions:**
   - Send notification to: **[Your Email]** or **[Slack Channel]**
7. **Alert name:** `Frontend Error Spike (>10 in 5min)`
8. Click **"Save Rule"**

**Note:** Adjust threshold based on your traffic (10 errors = ~1% for 1000 users/5min)

---

### Alert Rule 5: Frontend New Errors After Release

**Purpose:** Catch regressions immediately after deployment

1. Click **"Create Alert"**
2. **Choose:** "Issues"
3. **Project:** `b1-appbuilder-frontend`
4. **Conditions:**
   - When: **"A new issue is created"**
   - Filter: **"None"**
5. **Then perform these actions:**
   - Send notification to: **[Your Email]** or **[Slack Channel]**
6. **Alert name:** `Frontend New Issue (Immediate)`
7. Click **"Save Rule"**

---

### Step 4.6: Configure Notification Channel

**If using Slack (recommended):**

1. Go to **Settings** → **Integrations**
2. Find **"Slack"** → Click **"Install"**
3. Authorize Sentry to access your Slack workspace
4. Choose channel (e.g., `#alerts` or `#production-errors`)
5. Test notification

**If using Email:**
- Verify your email in Sentry settings
- Check spam folder for first alert

**Gate:** At least one notification channel configured

---

## Part 5: Test Alerts (15 minutes)

### Step 5.1: Trigger Alert

1. Re-add the test error endpoint temporarily
2. Visit `/test-sentry-error` **6 times** (to trigger spike alert)
3. Wait up to 5 minutes

### Step 5.2: Verify Alert Delivery

**Check:**
- ✅ Email received (or Slack message)
- ✅ Alert contains error details
- ✅ Link to Sentry issue works

**Gate:** Alert delivered successfully

---

## Part 6: Sourcemaps Verification (30 minutes)

### Step 6.1: Update CI Workflow

Add Sentry environment variables to GitHub Actions:

```yaml
# .github/workflows/ci.yml (in env section)
env:
  SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
  SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
  SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
  SENTRY_RELEASE: ${{ github.sha }}
```

### Step 6.2: Trigger Production Build

1. Push a commit to trigger CI
2. Wait for build to complete
3. Check build logs for: `Sentry: Uploaded sourcemaps`

### Step 6.3: Verify Sourcemaps in Sentry

1. Go to Sentry → **Releases**
2. Find your release (commit SHA or `prod-ready-1.1`)
3. Click on it
4. **Artifacts** tab should show uploaded files

**Gate:** Sourcemaps uploaded successfully

---

## 📊 Final Verification Checklist

Before moving to Phase B (Staging), confirm:

### Backend
- [x] Sentry project created
- [x] DSN configured in environment
- [x] Test error captured (<60s)
- [x] Stacktrace readable (file names + line numbers)
- [x] No PII in error events
- [x] Error spike alert configured
- [x] New issue alert configured
- [x] Regression alert configured
- [x] Alert notification delivered

### Frontend
- [x] Sentry project created
- [x] DSN configured in environment
- [x] Test error captured (<60s)
- [x] Stacktrace readable (React components visible)
- [x] No PII in error events (query strings removed)
- [x] Error spike alert configured
- [x] New issue alert configured
- [x] Sourcemaps uploaded to Sentry
- [x] Alert notification delivered

### General
- [x] Auth token created for CI
- [x] Notification channel configured (Slack/Email)
- [x] Test code removed from production
- [x] All gates passed

---

## 🚨 Common Issues & Solutions

### Issue: "DSN not configured" error

**Solution:**
- Verify env vars are set correctly
- Restart server after adding env vars
- Check for typos in variable names

### Issue: Errors not appearing in Sentry

**Solution:**
- Check DSN is correct (copy-paste again)
- Verify `SENTRY_ENVIRONMENT` matches project
- Check browser console for Sentry errors
- Verify network requests to `sentry.io` are not blocked

### Issue: Stacktraces are minified

**Solution:**
- Verify `sourcemap: true` in `vite.config.ts`
- Check `SENTRY_AUTH_TOKEN` is set in CI
- Verify sourcemaps uploaded (check Sentry → Releases → Artifacts)
- Ensure `SENTRY_RELEASE` matches between build and runtime

### Issue: PII visible in error events

**Solution:**
- Check `beforeSend` hook in `sentry.ts`
- Verify Pino redaction paths in `logger.ts`
- Test with real email/JWT to confirm scrubbing

### Issue: Alerts not firing

**Solution:**
- Verify notification channel is configured
- Check alert conditions (threshold too high?)
- Test with intentional errors (6+ to trigger spike)
- Check Sentry → Alerts → History

---

## 🎯 Success Criteria Summary

**You are ready for Phase B (Staging) when:**

1. ✅ Both Sentry projects operational
2. ✅ Errors captured in real-time (<60s)
3. ✅ Stacktraces readable (sourcemaps working)
4. ✅ PII scrubbing verified (no leaks)
5. ✅ Alerts configured and tested
6. ✅ Notification delivery confirmed

**If all criteria met → proceed to Phase B (Staging Environment Setup)**

---

**Document Version:** 1.0  
**Last Updated:** December 15, 2025  
**Next Phase:** B - Staging Environment Setup
