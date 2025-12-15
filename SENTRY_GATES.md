# Sentry Setup Gates & Success Criteria

**Purpose:** Clear checkpoints to verify Sentry is production-ready  
**Rule:** Do NOT proceed to Phase B (Staging) until ALL gates pass

---

## 🚦 Gate System

Each gate represents a **critical requirement** for production observability.

**Gate Status:**
- ✅ **PASS** - Requirement met, can proceed
- ❌ **FAIL** - Must fix before continuing
- ⏳ **PENDING** - Not yet tested

**Failure Protocol:**
1. Stop immediately
2. Debug the specific gate
3. Re-test until PASS
4. Document the fix
5. Continue to next gate

---

## Gate 1: Sentry Projects Created

**Requirement:** Both frontend and backend projects exist in Sentry

**Verification:**
1. Log in to sentry.io
2. Navigate to Projects
3. Confirm presence of:
   - `b1-appbuilder-backend` (Platform: Node.js)
   - `b1-appbuilder-frontend` (Platform: React)

**Success Criteria:**
- [ ] Both projects visible in Sentry dashboard
- [ ] DSN copied for each project
- [ ] Projects assigned to correct team

**Common Failures:**
- Only one project created → Create the missing project
- Wrong platform selected → Delete and recreate with correct platform
- DSN not saved → Copy DSN again from project settings

**Gate Status:** ⏳ PENDING

---

## Gate 2: Environment Variables Configured

**Requirement:** All required env vars set in hosting platform

**Verification:**
```bash
# Backend (check in server logs or Manus Settings → Secrets)
SENTRY_DSN=https://...
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=prod-ready-1.1

# Frontend (check in build logs or Manus Settings → Secrets)
VITE_SENTRY_DSN=https://...
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_RELEASE=prod-ready-1.1

# CI (check in GitHub Settings → Secrets)
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=b1-appbuilder-frontend
```

**Success Criteria:**
- [ ] Backend DSN configured and server restarted
- [ ] Frontend DSN configured and app rebuilt
- [ ] CI secrets configured for sourcemaps upload
- [ ] No "DSN not configured" errors in logs

**Common Failures:**
- Typo in variable name → Check exact spelling (case-sensitive)
- Server not restarted → Restart after adding env vars
- Wrong DSN (frontend DSN in backend) → Verify correct DSN for each

**Gate Status:** ⏳ PENDING

---

## Gate 3: Backend Error Capture

**Requirement:** Backend errors appear in Sentry within 60 seconds

**Verification:**
1. Visit `/test-sentry-error` endpoint
2. Check Sentry → Projects → b1-appbuilder-backend → Issues
3. Confirm error appears within 60 seconds

**Success Criteria:**
- [ ] Error appears in Sentry dashboard
- [ ] Error title: "🧪 Test backend error - Sentry verification"
- [ ] Timestamp is recent (<60 seconds ago)
- [ ] Error status: "Unresolved"

**Common Failures:**
- Error doesn't appear → Check DSN, restart server, verify network
- Error appears after >60s → Check network latency, Sentry status
- Wrong project → Verify `SENTRY_DSN` matches backend project

**Gate Status:** ⏳ PENDING

---

## Gate 4: Backend Stacktrace Readable

**Requirement:** Stacktraces show file names and line numbers (not minified)

**Verification:**
1. Open the test error in Sentry
2. Scroll to "Stack Trace" section
3. Verify file names and line numbers visible

**Success Criteria:**
- [ ] File names shown (e.g., `server/routes/health.ts`)
- [ ] Line numbers shown (e.g., `:42`)
- [ ] Function names shown (e.g., `testSentryError`)
- [ ] NOT minified (no `a.b.c` or single-letter variables)

**Common Failures:**
- Minified stacktrace → Sourcemaps not uploaded (check CI logs)
- Missing file names → `sourcemap: true` not set in build config
- Wrong release → Verify `SENTRY_RELEASE` matches between build and runtime

**Gate Status:** ⏳ PENDING

---

## Gate 5: Backend PII Scrubbing

**Requirement:** No PII (emails, JWTs, cookies) in error events

**Verification:**
1. Open the test error in Sentry
2. Click "Additional Data" tab
3. Check request headers, cookies, body

**Success Criteria:**
- [ ] No email addresses visible
- [ ] No JWT tokens visible
- [ ] No cookie values visible (should show `[REDACTED_COOKIES]`)
- [ ] No authorization headers visible (should show `[REDACTED_SECRET]`)
- [ ] No passwords or API keys visible

**Common Failures:**
- Email visible → Check `beforeSend` hook in `sentry.ts`
- JWT visible → Verify Pino redaction paths in `logger.ts`
- Cookies visible → Check `sendDefaultPii: false` in Sentry config

**Gate Status:** ⏳ PENDING

---

## Gate 6: Frontend Error Capture

**Requirement:** Frontend errors appear in Sentry within 60 seconds

**Verification:**
1. Open app in browser
2. Open DevTools Console
3. Run: `throw new Error("🧪 Test frontend error - Sentry verification")`
4. Check Sentry → Projects → b1-appbuilder-frontend → Issues

**Success Criteria:**
- [ ] Error appears in Sentry dashboard
- [ ] Error title matches test message
- [ ] Timestamp is recent (<60 seconds ago)
- [ ] Browser and OS info captured

**Common Failures:**
- Error doesn't appear → Check `VITE_SENTRY_DSN`, rebuild app
- Console shows Sentry error → Check DSN format, network requests
- Wrong project → Verify frontend DSN matches frontend project

**Gate Status:** ⏳ PENDING

---

## Gate 7: Frontend Stacktrace Readable

**Requirement:** Stacktraces show React component names (not minified)

**Verification:**
1. Open the test error in Sentry
2. Scroll to "Stack Trace" section
3. Verify React component names visible

**Success Criteria:**
- [ ] Component names shown (e.g., `HomePage`, `App`)
- [ ] File names shown (e.g., `pages/Home.tsx`)
- [ ] Line numbers shown
- [ ] NOT minified (no `r.createElement` or single-letter vars)

**Common Failures:**
- Minified stacktrace → Sourcemaps not uploaded
- Missing component names → Verify `SENTRY_AUTH_TOKEN` in CI
- Build failed → Check CI logs for sourcemap upload errors

**Gate Status:** ⏳ PENDING

---

## Gate 8: Frontend PII Scrubbing

**Requirement:** No PII in frontend error events (query strings removed)

**Verification:**
1. Open the test error in Sentry
2. Check "Request" section
3. Verify URL has no query parameters

**Success Criteria:**
- [ ] URL shows path only (e.g., `https://app.com/page`)
- [ ] No query strings (e.g., `?email=user@example.com` removed)
- [ ] No user emails in breadcrumbs
- [ ] No sensitive data in "Additional Data"

**Common Failures:**
- Query strings visible → Check `beforeSend` hook in frontend `sentry.ts`
- Email in breadcrumbs → Review breadcrumb scrubbing logic

**Gate Status:** ⏳ PENDING

---

## Gate 9: Alert Rules Configured

**Requirement:** All 5 alert rules created and active

**Verification:**
1. Go to Sentry → Alerts
2. Confirm presence of:
   - Backend Error Spike (>5 in 5min)
   - Backend New Issue (Immediate)
   - Backend Regression (Resolved → Unresolved)
   - Frontend Error Spike (>10 in 5min)
   - Frontend New Issue (Immediate)

**Success Criteria:**
- [ ] All 5 alert rules visible in Alerts page
- [ ] Each rule shows "Active" status
- [ ] Notification channel configured (Slack or Email)
- [ ] Thresholds match recommendations

**Common Failures:**
- Rules not visible → Create missing rules
- Status shows "Inactive" → Edit rule and activate
- No notification channel → Configure Slack or Email integration

**Gate Status:** ⏳ PENDING

---

## Gate 10: Alert Delivery Verified

**Requirement:** Alert notification delivered to Slack/Email

**Verification:**
1. Visit `/test-sentry-error` 6 times (to trigger spike alert)
2. Wait up to 5 minutes
3. Check Slack channel or email inbox

**Success Criteria:**
- [ ] Alert notification received
- [ ] Notification contains error details
- [ ] Link to Sentry issue works
- [ ] Delivery time <5 minutes from trigger

**Common Failures:**
- No notification → Check alert rule conditions (threshold too high?)
- Wrong channel → Verify notification channel in alert settings
- Delayed delivery → Check Sentry status, alert history

**Gate Status:** ⏳ PENDING

---

## Gate 11: Sourcemaps Uploaded

**Requirement:** Sourcemaps uploaded to Sentry for production builds

**Verification:**
1. Trigger CI build (push commit)
2. Check CI logs for "Sentry: Uploaded sourcemaps"
3. Go to Sentry → Releases → [your release]
4. Check "Artifacts" tab

**Success Criteria:**
- [ ] CI build successful
- [ ] Logs show sourcemap upload
- [ ] Release visible in Sentry → Releases
- [ ] Artifacts tab shows uploaded files (*.js.map)

**Common Failures:**
- Upload failed → Check `SENTRY_AUTH_TOKEN` in CI secrets
- No artifacts → Verify `sourcemap: true` in vite.config.ts
- Wrong release → Ensure `SENTRY_RELEASE` matches in CI and runtime

**Gate Status:** ⏳ PENDING

---

## 🎯 Final Gate: All Systems Operational

**Requirement:** All 11 gates passed

**Verification Checklist:**

### Backend
- [x] Gate 1: Sentry project created
- [x] Gate 2: Environment variables configured
- [x] Gate 3: Error capture (<60s)
- [x] Gate 4: Stacktrace readable
- [x] Gate 5: PII scrubbing verified

### Frontend
- [x] Gate 1: Sentry project created
- [x] Gate 2: Environment variables configured
- [x] Gate 6: Error capture (<60s)
- [x] Gate 7: Stacktrace readable
- [x] Gate 8: PII scrubbing verified

### Alerts & CI
- [x] Gate 9: Alert rules configured
- [x] Gate 10: Alert delivery verified
- [x] Gate 11: Sourcemaps uploaded

**Success Criteria:**
- All 11 gates show ✅ PASS
- No ❌ FAIL or ⏳ PENDING gates remaining
- Documentation updated with findings

---

## 📊 Gate Tracking Template

Copy this to track your progress:

```markdown
## Sentry Setup Progress

**Date Started:** ___________
**Completed By:** ___________

### Gate Status
- [ ] Gate 1: Sentry Projects Created
- [ ] Gate 2: Environment Variables Configured
- [ ] Gate 3: Backend Error Capture
- [ ] Gate 4: Backend Stacktrace Readable
- [ ] Gate 5: Backend PII Scrubbing
- [ ] Gate 6: Frontend Error Capture
- [ ] Gate 7: Frontend Stacktrace Readable
- [ ] Gate 8: Frontend PII Scrubbing
- [ ] Gate 9: Alert Rules Configured
- [ ] Gate 10: Alert Delivery Verified
- [ ] Gate 11: Sourcemaps Uploaded

### Issues Encountered
- Issue: ___________
  Solution: ___________
  Gate: ___________

### Ready for Phase B?
- [ ] All gates passed
- [ ] Test code removed from production
- [ ] Documentation updated
```

---

## 🚀 Next Steps After All Gates Pass

**When all 11 gates show ✅ PASS:**

1. ✅ Remove test code from production
2. ✅ Document any custom configurations
3. ✅ Update team on Sentry access
4. ✅ Proceed to **Phase B: Staging Environment Setup**

**Do NOT proceed to Phase B if any gate is ❌ FAIL or ⏳ PENDING.**

---

**Document Version:** 1.0  
**Last Updated:** December 15, 2025  
**Next Phase:** B - Staging Environment Setup (after all gates pass)
