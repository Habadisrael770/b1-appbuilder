# B1 AppBuilder - Full Implementation Plan (Hybrid Ping-Pong)

**Status:** Starting Round 1  
**Approach:** Hybrid (Manus → Claude → User → Manus)  
**Timeline:** 4-5 days

---

## 🔄 Ping-Pong Workflow

```
Round 1: Build Worker
  ↓ Manus writes code
  ↓ Manus saves checkpoint
  ↓ Manus sends to Claude
  ↓ Claude reviews
  ↓ Claude sends feedback to User
  ↓ User tests
  ↓ User sends feedback to Manus
  ↓ Manus fixes

Round 2: GitHub Actions Workflows
  ↓ (same cycle)

... and so on
```

---

## 📋 Implementation Rounds

### Round 1: Build Worker ⏳ IN PROGRESS
**Files:**
- `server/buildWorker.ts` - Job queue, retry, timeout, error handling

**Requirements:**
- Pull queued jobs from database
- Process jobs sequentially
- Log errors with full stacktrace
- Update status: pending → running → completed/failed
- Save output artifacts
- Retry on failure (1 retry)
- Timeout (max 20 minutes per build)

**Status:** Writing...

---

### Round 2: GitHub Actions Workflows
**Files:**
- `.github/workflows/build-android.yml`
- `.github/workflows/build-ios.yml`

**Requirements:**
- Accept inputs (appId, config, platform)
- Clone build templates
- Inject config
- Build (Android or iOS)
- Upload build artifact via API
- Call backend route build.complete(buildId, downloadUrl)
- Handle failures gracefully

---

### Round 3: API Endpoints
**Files:**
- `server/routers/builds.ts` - Complete implementation
- `server/routers/apps.ts` - Complete implementation

**Requirements:**
- /builds: startBuild, getBuildStatus, listBuilds, getDownloadUrls
- /apps: createApp, updateApp, deleteApp, listApps
- All must enforce user ownership
- Input validation with Zod
- Error handling

---

### Round 4: Frontend Wizard
**Files:**
- `client/src/components/convert/Step1.tsx` - URL validation
- `client/src/components/convert/Step2.tsx` - Platform selection
- `client/src/components/convert/Step3.tsx` - Customization with uploads
- `client/src/components/convert/Step4.tsx` - Live preview
- `client/src/components/convert/Step5.tsx` - Pricing selection
- `client/src/components/convert/Step6.tsx` - Checkout or skip
- `client/src/components/convert/Step7.tsx` - Real-time progress
- `client/src/components/convert/Step8.tsx` - Download

**Requirements:**
- Connect all steps to backend
- Remove all dummy placeholders
- Real-time progress polling
- Actual artifact downloads

---

### Round 5: Dashboard
**Files:**
- `client/src/pages/Dashboard.tsx` - Main dashboard
- `client/src/components/dashboard/AppsTable.tsx` - Apps list
- `client/src/components/dashboard/BuildHistory.tsx` - Build history
- `client/src/components/dashboard/SubscriptionStatus.tsx` - Subscription info

**Requirements:**
- Fetch real apps from backend
- Show build history
- Allow rebuild
- Allow download
- Allow delete
- Show subscription status from Stripe

---

### Round 6: Stripe Integration
**Files:**
- `server/routers/billing.ts` - Billing endpoints
- `server/_core/stripe.ts` - Stripe helpers
- `server/webhooks/stripe.ts` - Webhook handler

**Requirements:**
- Create checkout session
- Webhooks: invoice.payment_succeeded, customer.subscription.updated/deleted
- Trial logic: 14 days free, auto-disable after
- Save subscription to DB

---

### Round 7: Security & Error Handling
**Files:**
- `server/_core/validation.ts` - Input validation schemas
- `server/_core/rateLimit.ts` - Rate limiting middleware
- `server/_core/errorHandler.ts` - Error handling

**Requirements:**
- Input validation everywhere (Zod)
- User → App → Build ownership checks
- Rate limiting on build endpoints
- Prevent command injection
- Secure file handling
- CORS policy
- Error logging and display

---

### Round 8: Final Testing & Documentation
**Files:**
- `BUILD_SYSTEM_README.md` - Updated
- `IOS_SETUP_GUIDE.md` - Updated
- Test scripts and E2E tests

**Requirements:**
- All flows tested end-to-end
- Documentation updated
- Production readiness verified

---

## 📊 Progress Tracking

| Round | Task | Status | Checkpoint |
|-------|------|--------|-----------|
| 1 | Build Worker | ⏳ IN PROGRESS | - |
| 2 | GitHub Actions | ⏳ PENDING | - |
| 3 | API Endpoints | ⏳ PENDING | - |
| 4 | Frontend Wizard | ⏳ PENDING | - |
| 5 | Dashboard | ⏳ PENDING | - |
| 6 | Stripe Integration | ⏳ PENDING | - |
| 7 | Security & Errors | ⏳ PENDING | - |
| 8 | Testing & Docs | ⏳ PENDING | - |

---

## 🎯 Success Criteria

### Build Worker
- ✅ Jobs processed sequentially
- ✅ Retry logic works
- ✅ Timeout enforced
- ✅ Errors logged
- ✅ Status updated correctly

### GitHub Actions
- ✅ APK generated successfully
- ✅ IPA generated successfully
- ✅ Artifacts uploaded
- ✅ Download URLs returned
- ✅ Failures handled gracefully

### API Endpoints
- ✅ All endpoints working
- ✅ User ownership enforced
- ✅ Input validation working
- ✅ Error messages clear

### Frontend Wizard
- ✅ All steps connected
- ✅ No placeholders
- ✅ Real-time progress
- ✅ Downloads working

### Dashboard
- ✅ Real data displayed
- ✅ Build history shown
- ✅ Rebuild works
- ✅ Downloads work

### Stripe
- ✅ Checkout works
- ✅ Webhooks processed
- ✅ Trial logic enforced
- ✅ Subscriptions saved

### Security
- ✅ Input validated
- ✅ Ownership checked
- ✅ Rate limiting works
- ✅ Errors handled

---

## 📞 Communication

**Each Round:**
1. Manus writes code (1-2 hours)
2. Manus saves checkpoint
3. Manus sends code to Claude (via attachment)
4. Claude reviews (30 min - 1 hour)
5. Claude sends feedback to User
6. User tests (1-2 hours)
7. User sends feedback to Manus
8. Manus fixes (30 min - 1 hour)
9. Go to next round

---

**Starting Round 1 now!** 🚀
