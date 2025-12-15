# Observability Setup - Week 1-2 Complete

**Status:** ✅ **Foundation Complete** (Sentry configuration pending)

---

## 📊 What's Implemented

### ✅ Backend Observability

**1. Sentry Integration** (`server/observability/sentry.ts`)
- PII scrubbing (emails, phones, JWTs, passwords, tokens)
- Environment-aware configuration (dev/staging/production)
- Express integration with error handling
- Profiling integration (5% sample rate in production)
- Request tracing (10% sample rate in production)

**2. Structured Logging** (`server/observability/logger.ts`)
- JSON logs with Pino
- Automatic PII redaction (authorization, cookies, passwords)
- Log levels: debug (dev) / info (production)
- Request/response serialization

**3. Request ID Tracking** (`server/middleware/requestId.ts`)
- UUID-based request tracking
- `x-request-id` header propagation
- Correlation across logs and errors

**4. HTTP Request Logging** (`server/middleware/httpLogger.ts`)
- Automatic request/response logging
- Status code-based log levels (error/warn/info)
- Request ID correlation
- Response time tracking

---

### ✅ Health Endpoints

**1. Liveness Check** (`/healthz`)
- Returns 200 if process is alive
- No dependencies checked
- Use for: Load balancer health checks

**2. Readiness Check** (`/readyz`)
- Returns 200 if DB connection is healthy
- Returns 503 if DB is down/unavailable
- Use for: Kubernetes readiness probes

**Test Results:**
```bash
$ curl /healthz
{"ok":true}

$ curl /readyz
{"ok":true,"db":"up"}
```

---

### ✅ Frontend Observability

**1. Sentry Integration** (`client/src/observability/sentry.ts`)
- Browser tracing integration
- Session replay (10% sample rate)
- Error replay (100% on errors in dev, 10% in production)
- PII scrubbing (query strings removed)
- Environment-aware configuration

**2. Sourcemaps** (`vite.config.ts`)
- Enabled in build (`sourcemap: true`)
- Sentry Vite plugin configured
- Automatic upload on CI/production builds (requires `SENTRY_AUTH_TOKEN`)

---

### ✅ Integration

**Middleware Order** (server/_core/index.ts):
1. Request ID attachment (first)
2. HTTP logging (Pino)
3. Health endpoints
4. Body parser
5. OAuth routes
6. GitHub webhooks
7. tRPC API
8. Vite/static files
9. Sentry error handler (last)

**Client Initialization** (client/src/main.tsx):
- Sentry initialized before React render
- Automatic error capture
- Integration with React Error Boundaries

---

## 🔧 Required Environment Variables

### Backend (Production)

```bash
# Sentry Configuration
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=production  # or staging/development
SENTRY_RELEASE=prod-ready-1.1  # or commit SHA
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of requests
SENTRY_PROFILES_SAMPLE_RATE=0.05  # 5% of requests

# Optional
LOG_LEVEL=info  # or debug/warn/error
```

### Frontend (Production)

```bash
# Sentry Configuration
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_RELEASE=prod-ready-1.1
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

### CI/Build (Sourcemaps Upload)

```bash
# Sentry Sourcemaps Upload
SENTRY_AUTH_TOKEN=sntrys_xxx  # From Sentry → Settings → Auth Tokens
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_RELEASE=prod-ready-1.1  # or commit SHA
```

---

## 🧪 Testing Checklist

### ✅ Completed

- [x] `/healthz` returns 200 with `{"ok":true}`
- [x] `/readyz` returns 200 with `{"ok":true,"db":"up"}` when DB is up
- [x] Request ID header (`x-request-id`) present in responses
- [x] JSON logs appear in console with request details
- [x] Middleware order is correct (Request ID → Logging → Health)

### ⏳ Pending (Requires Sentry Configuration)

- [ ] Backend error capture (throw error → appears in Sentry)
- [ ] Frontend error capture (trigger error → appears in Sentry)
- [ ] Sourcemaps upload (build → verify stack traces in Sentry)
- [ ] PII scrubbing (verify no emails/tokens in Sentry events)
- [ ] Release tracking (verify release tag in Sentry)

---

## 📝 Next Steps (Week 3-4)

### 1. Sentry Setup

**Create Sentry Project:**
1. Sign up at https://sentry.io
2. Create new project (Node.js + React)
3. Copy DSN from project settings
4. Create auth token for sourcemaps

**Add Environment Variables:**
```bash
# Backend
export SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
export SENTRY_ENVIRONMENT="staging"

# Frontend
export VITE_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
export VITE_SENTRY_ENVIRONMENT="staging"

# CI
export SENTRY_AUTH_TOKEN="sntrys_xxx"
export SENTRY_ORG="your-org"
export SENTRY_PROJECT="b1-appbuilder"
```

**Test Error Capture:**
```typescript
// Backend test
throw new Error("Test backend error");

// Frontend test
throw new Error("Test frontend error");
```

---

### 2. Staging Environment

**Requirements:**
- Separate domain/URL for staging
- Separate database for staging
- Secrets management (GitHub Environments / Vercel)
- Deployment pipeline (auto-deploy on merge to main)

**Environment Parity:**
- Same Node version as production
- Same build flags as production
- Same env vars as production (different values)

---

### 3. Alert Rules

**Sentry Alerts:**
- Error rate > 1% → Slack/Email
- New error type → Slack/Email
- Performance degradation → Slack/Email

**Health Check Alerts:**
- `/readyz` fails → PagerDuty/Slack
- Response time > 5s → Slack

---

## 🔒 Security Notes

### PII Scrubbing (Already Implemented)

**Backend:**
- Emails → `[REDACTED_EMAIL]`
- Phone numbers → `[REDACTED_PHONE]`
- JWT tokens → `[REDACTED_JWT]`
- Passwords/tokens → `[REDACTED_SECRET]`
- Cookies → `[REDACTED_COOKIES]`

**Frontend:**
- Query strings removed from URLs
- User ID kept (for tracking), email removed

### Secrets Protection

**Never log:**
- `process.env.JWT_SECRET`
- `process.env.DATABASE_URL`
- `req.headers.authorization`
- `req.headers.cookie`

**Already protected:**
- Pino redaction configured
- Sentry `sendDefaultPii: false`
- Custom scrubbing in `beforeSend`

---

## 📚 Documentation

### Key Files

```
server/
  observability/
    sentry.ts       ← Sentry init + PII scrubbing
    logger.ts       ← Pino logger config
  middleware/
    requestId.ts    ← Request ID generation
    httpLogger.ts   ← HTTP request logging
  routes/
    health.ts       ← Health endpoints
  _core/
    index.ts        ← Server entry + middleware order

client/src/
  observability/
    sentry.ts       ← Frontend Sentry init
  main.tsx          ← Sentry initialization

vite.config.ts      ← Sourcemaps + Sentry plugin
```

### External Resources

- [Sentry Node.js Docs](https://docs.sentry.io/platforms/node/)
- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Pino Docs](https://getpino.io/)
- [Kubernetes Health Checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)

---

## 🎯 Success Criteria (Week 1-2)

### ✅ Achieved

1. ✅ Sentry installed and configured (backend + frontend)
2. ✅ Structured logging with JSON output
3. ✅ Request ID tracking across requests
4. ✅ Health endpoints (`/healthz` + `/readyz`)
5. ✅ PII scrubbing implemented
6. ✅ Sourcemaps enabled in build
7. ✅ Middleware order correct
8. ✅ Integration tested locally

### ⏳ Pending (Requires Sentry Account)

1. ⏳ Error capture verified in Sentry dashboard
2. ⏳ Sourcemaps uploaded and verified
3. ⏳ PII scrubbing verified in Sentry events
4. ⏳ Release tracking verified

---

## 🚀 Deployment Readiness

**Current Status:** ✅ **Code Ready** (Configuration Pending)

**Before Production:**
1. Create Sentry account and project
2. Add environment variables to hosting platform
3. Test error capture in staging
4. Verify sourcemaps upload in CI
5. Set up alert rules in Sentry
6. Document runbook for Sentry alerts

**Estimated Time:** 2-4 hours (mostly Sentry setup)

---

**Document Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Week 1-2 Complete, Sentry Configuration Pending
