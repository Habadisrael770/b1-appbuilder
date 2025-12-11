# Security Hardening Guide - B1 AppBuilder

**Document Version:** 1.0  
**Date:** December 11, 2024  
**Status:** Implementation Guide

---

## 📋 Overview

This document outlines security hardening measures implemented in B1 AppBuilder to protect user data, prevent unauthorized access, and ensure compliance with security best practices.

---

## 🔐 Authentication & Authorization

### 1. OAuth Integration

**Implementation:** Manus OAuth is used for user authentication.

```typescript
// server/_core/context.ts
export async function createContext(opts: CreateContextOptions) {
  const user = opts.session?.user;
  
  return {
    user,
    session: opts.session
  };
}
```

**Security Measures:**
- Sessions stored securely with httpOnly and secure flags
- JWT tokens validated on every request
- Automatic token refresh on expiration

### 2. Protected Procedures

**Implementation:** tRPC procedures are protected with `protectedProcedure`.

```typescript
// server/routers/apps.ts
export const appsRouter = router({
  createApp: protectedProcedure
    .input(appSchema)
    .mutation(async ({ ctx, input }) => {
      // Only authenticated users can create apps
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      // ...
    })
});
```

**Security Measures:**
- All user-specific operations require authentication
- User ID from context prevents cross-user access
- No user data exposed to unauthenticated users

### 3. Access Control

**Implementation:** User ownership verification on all operations.

```typescript
// Verify user owns the app
const app = await db.select().from(apps).where(eq(apps.id, appId));
if (app.userId !== ctx.user.id) {
  throw new TRPCError({ code: "FORBIDDEN" });
}
```

**Security Measures:**
- Every app is tied to a user ID
- Operations check user ownership before proceeding
- Prevents ID-based enumeration attacks

---

## 🛡️ Input Validation & Sanitization

### 1. URL Validation

**Implementation:** Strict URL validation with Zod schemas.

```typescript
// server/routers/apps.ts
const createAppSchema = z.object({
  websiteUrl: z.string().url("Invalid URL format"),
  appName: z.string().min(1).max(50),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i)
});
```

**Security Measures:**
- URLs must be valid HTTP/HTTPS
- App names restricted to 50 characters
- Color values validated as hex format
- Prevents injection attacks

### 2. App Name Sanitization

**Implementation:** HTML/XML entity encoding for app names.

```typescript
function sanitizeAppName(name: string): string {
  return name
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
```

**Security Measures:**
- Prevents XSS attacks in app names
- Prevents command injection in build scripts
- Prevents path traversal attacks

### 3. WebView URL Validation

**Implementation:** Validate URLs before loading in WebView.

```typescript
// build-templates/android/app/src/main/java/com/b1appbuilder/MainActivity.kt
fun isValidUrl(url: String): Boolean {
  return try {
    URL(url)
    url.startsWith("http://") || url.startsWith("https://")
  } catch (e: Exception) {
    false
  }
}
```

**Security Measures:**
- Only HTTP/HTTPS URLs allowed
- Prevents loading local files
- Prevents loading file:// URLs

---

## 🔑 Secrets Management

### 1. Environment Variables

**Implementation:** All secrets stored in environment variables.

```typescript
// server/_core/env.ts
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  OAUTH_SERVER_URL: process.env.OAUTH_SERVER_URL!
};
```

**Security Measures:**
- No secrets committed to repository
- `.env` files in `.gitignore`
- Secrets injected at deployment time
- Different secrets for dev/prod

### 2. Database Credentials

**Implementation:** Database connection string from environment.

```typescript
// Secure connection string
DATABASE_URL=mysql://user:password@host:port/database?ssl=true
```

**Security Measures:**
- SSL/TLS encryption for database connections
- Strong passwords enforced
- Connection pooling prevents resource exhaustion
- Read-only database users for non-write operations

### 3. API Keys

**Implementation:** Stripe and OAuth keys stored securely.

```typescript
// Stripe initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// OAuth configuration
const oauth = {
  clientId: process.env.VITE_APP_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET
};
```

**Security Measures:**
- Keys never exposed to frontend
- Keys rotated regularly
- Rate limiting on API calls
- Webhook signature verification

---

## 🚫 Attack Prevention

### 1. SQL Injection Prevention

**Implementation:** Drizzle ORM with parameterized queries.

```typescript
// Safe query with parameterized values
const user = await db
  .select()
  .from(users)
  .where(eq(users.id, userId));
```

**Security Measures:**
- ORM prevents SQL injection
- No raw SQL queries
- Type-safe database operations

### 2. Cross-Site Scripting (XSS) Prevention

**Implementation:** React's built-in XSS protection + sanitization.

```typescript
// React automatically escapes values
<div>{userInput}</div>  // Safe - React escapes

// Sanitize HTML if needed
import DOMPurify from "dompurify";
const clean = DOMPurify.sanitize(userHtml);
```

**Security Measures:**
- React escapes all interpolated values
- No `dangerouslySetInnerHTML` used
- User input validated before display

### 3. Cross-Site Request Forgery (CSRF) Prevention

**Implementation:** tRPC handles CSRF automatically.

```typescript
// tRPC mutations are CSRF-safe by default
// No additional configuration needed
```

**Security Measures:**
- tRPC uses secure cookie handling
- SameSite cookie attribute set
- POST-only mutations

### 4. Command Injection Prevention

**Implementation:** Avoid shell commands with user input.

```typescript
// ❌ Unsafe
execSync(`gradle build -Dapp.name="${appName}"`);

// ✅ Safe - use arguments array
execSync("gradle", ["build", "-Dapp.name=" + sanitizeAppName(appName)]);
```

**Security Measures:**
- App names sanitized before use in scripts
- Arguments passed as array (not string)
- No shell interpolation

---

## 🔒 Data Protection

### 1. Password Security

**Implementation:** Passwords hashed with bcrypt (via Manus OAuth).

```typescript
// Passwords handled by OAuth provider
// No password storage in B1 AppBuilder database
```

**Security Measures:**
- Passwords never stored locally
- OAuth provider handles password security
- No password reset flow needed

### 2. Session Security

**Implementation:** Secure session cookies.

```typescript
// Session cookie configuration
const sessionCookie = {
  httpOnly: true,        // Prevents XSS access
  secure: true,          // HTTPS only
  sameSite: "strict",    // CSRF prevention
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
};
```

**Security Measures:**
- HttpOnly flag prevents JavaScript access
- Secure flag requires HTTPS
- SameSite prevents CSRF attacks
- Automatic expiration

### 3. Data Encryption

**Implementation:** TLS/SSL for data in transit.

```typescript
// All API calls use HTTPS
// Database connections use SSL
// S3 uploads use HTTPS
```

**Security Measures:**
- All data encrypted in transit
- No unencrypted HTTP allowed
- Certificate pinning in mobile apps

---

## 🛡️ Rate Limiting

### 1. API Rate Limiting

**Implementation:** Rate limiting middleware (to be added).

```typescript
// Recommended: Use express-rate-limit
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: "Too many requests"
});

app.use("/api/", limiter);
```

**Security Measures:**
- Prevents brute force attacks
- Prevents DoS attacks
- Per-IP rate limiting

### 2. Build Rate Limiting

**Implementation:** Limit builds per user.

```typescript
// Recommended: Track builds per user
const userBuilds = await db
  .select()
  .from(builds)
  .where(eq(builds.userId, userId))
  .where(gt(builds.createdAt, oneHourAgo));

if (userBuilds.length > 10) {
  throw new TRPCError({
    code: "TOO_MANY_REQUESTS",
    message: "Too many builds. Please try again later."
  });
}
```

**Security Measures:**
- Prevents build spam
- Protects infrastructure
- Fair usage enforcement

---

## 📝 Logging & Monitoring

### 1. Error Logging

**Implementation:** Comprehensive error logging.

```typescript
// Log errors with context
console.error("Build failed:", {
  jobId,
  appId,
  userId,
  error: error.message,
  timestamp: new Date()
});
```

**Security Measures:**
- Error tracking for debugging
- No sensitive data in logs
- Centralized logging

### 2. Security Audit Logging

**Implementation:** Log security-relevant events.

```typescript
// Log authentication events
console.log("User login:", {
  userId,
  timestamp: new Date(),
  ip: request.ip
});

// Log authorization failures
console.warn("Unauthorized access attempt:", {
  userId,
  resource: "app",
  resourceId,
  timestamp: new Date()
});
```

**Security Measures:**
- Track login/logout events
- Track failed authorization attempts
- Detect suspicious patterns

---

## ✅ Security Checklist

### Before Production Deployment

- [ ] All environment variables configured
- [ ] Database SSL/TLS enabled
- [ ] HTTPS enforced on all endpoints
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] CORS configured correctly
- [ ] Security headers set (CSP, X-Frame-Options, etc.)
- [ ] Secrets not committed to repository
- [ ] Dependency vulnerabilities checked
- [ ] Security audit completed
- [ ] Penetration testing completed
- [ ] Incident response plan documented

### Ongoing Security

- [ ] Regular dependency updates
- [ ] Security patches applied promptly
- [ ] Access logs reviewed regularly
- [ ] Error logs monitored
- [ ] Rate limits adjusted as needed
- [ ] Security training for team
- [ ] Incident response drills

---

## 🔗 Related Documents

- `PROJECT_REVIEW_AND_QA.md` - Full project review
- `RAILWAY_GITHUB_SETUP.md` - Deployment guide
- `BUILD_SYSTEM_README.md` - Build system documentation

---

## 📞 Security Contact

For security issues, please email: security@b1appbuilder.com

**Do not** create public GitHub issues for security vulnerabilities.

---

**End of Security Hardening Guide**

**Version:** 1.0  
**Last Updated:** December 11, 2024  
**Status:** Ready for Implementation
