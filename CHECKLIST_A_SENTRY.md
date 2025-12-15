# CHECKLIST A — SENTRY SETUP (MUST COMPLETE BEFORE STAGING)

## SECTION 1 — CREATE PROJECTS (UI)
1) Create Project → Platform: Node.js → Name: b1-appbuilder-backend
2) Create Project → Platform: React → Name: b1-appbuilder-frontend
3) Verify: Two DIFFERENT DSNs exist (backend != frontend)

## SECTION 2 — ENV VARIABLES

**BACKEND (production):**
```
SENTRY_DSN=<backend_dsn>
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=prod-ready-1.1
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.05
```

**FRONTEND (Vite, production):**
```
VITE_SENTRY_DSN=<frontend_dsn>
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_RELEASE=prod-ready-1.1
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

**CI / BUILD (SOURCEMAPS):**
```
SENTRY_AUTH_TOKEN=<token_with_project:releases>
SENTRY_ORG=<org_slug>
SENTRY_PROJECT=b1-appbuilder-frontend
```

## SECTION 3 — SOURCEMAPS VERIFICATION
1) Build + deploy
2) Sentry → Releases → prod-ready-1.1
3) Verify: Artifacts exist AND .map files exist
4) Verify: Stacktraces are NOT minified
**FAIL IF MINIFIED → STOP**

## SECTION 4 — ALERT RULES (PRODUCTION)

**BACKEND ALERTS:**

**A) Error Spike:**
- Condition: Number of events >= 5 in 5 minutes
- Filter: environment = production
- Action: Notify (Email/Slack)

**B) New Issue:**
- Condition: A new issue is created
- Filter: environment = production
- Action: Notify

**C) Regression After Release:**
- Condition: Issue first seen in a new release
- Release: prod-ready-*
- Action: Notify

**FRONTEND ALERTS:**

**D) Error Rate:**
- Type: Metric Alert
- Metric: Error rate > 1%
- Window: 10 minutes
- Filter: environment = production
- Action: Notify

**E) New Frontend Issue:**
- Condition: New issue
- Filter: environment = production
- Action: Notify

## SECTION 5 — PII VERIFICATION (NO EXCEPTIONS)
For a random event:
- NO email
- NO cookies
- NO JWT
- NO Authorization headers
- User context: id ONLY

**IF ANY PII FOUND → STOP**

## SECTION 6 — VERIFICATION (EXECUTE ONCE)

**BACKEND TEST (DEV ONLY):**
Add temporary route:
```
GET /__debug_sentry_backend → throw new Error("BACKEND_SENTRY_VERIFICATION")
```
Verify:
- Event arrives < 60s
- release=prod-ready-1.1
- environment=production
- readable stacktrace

**Remove route immediately.**

**FRONTEND TEST:**
Trigger:
```javascript
throw new Error("FRONTEND_SENTRY_VERIFICATION")
```
Verify:
- Event arrives in frontend project
- readable stacktrace
- no PII

## SECTION 7 — FINAL GATES
Proceed to STAGING ONLY IF ALL TRUE:
- [ ] Backend events received
- [ ] Frontend events received
- [ ] Sourcemaps working
- [ ] Alerts notify successfully
- [ ] No PII present
- [ ] Correct release + environment

---

**END CHECKLIST A**

**When complete, report: "A הושלם"**
