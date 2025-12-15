import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const isProd = process.env.NODE_ENV === "production";

function scrubPII(value: unknown): unknown {
  // Scrub common PII patterns. Keep it deterministic and safe.
  if (typeof value === "string") {
    // Emails
    let scrubbed = value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]");
    // Israeli-ish phone numbers / general phone patterns
    scrubbed = scrubbed.replace(/(\+?\d[\d\s\-()]{7,}\d)/g, "[REDACTED_PHONE]");
    // JWT-ish tokens
    scrubbed = scrubbed.replace(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, "[REDACTED_JWT]");
    return scrubbed;
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = Array.isArray(obj) ? [] as unknown as Record<string, unknown> : {};
    for (const [k, v] of Object.entries(obj)) {
      const key = k.toLowerCase();
      if (key.includes("password") || key.includes("token") || key.includes("authorization") || key.includes("cookie")) {
        out[k] = "[REDACTED_SECRET]";
      } else {
        out[k] = scrubPII(v);
      }
    }
    return out;
  }

  return value;
}

export function initSentry(): void {
  if (!process.env.SENTRY_DSN) {
    // No DSN = no Sentry. This is allowed in dev, not in prod.
    if (isProd) {
      // Fail fast in prod if you claim "production-grade"
      // Comment out if Manus hosting doesn't allow env yet, but then you're not prod-grade.
      console.warn("⚠️ SENTRY_DSN missing in production environment.");
    }
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
    release: process.env.SENTRY_RELEASE || process.env.GIT_SHA || undefined,

    // This is a must: don't auto-send PII.
    sendDefaultPii: false,

    integrations: [
      nodeProfilingIntegration(),
      Sentry.httpIntegration({ breadcrumbs: true }),
      Sentry.expressIntegration?.() as any, // if express exists in runtime; safe no-op otherwise
    ].filter(Boolean),

    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? (isProd ? 0.1 : 1.0)),
    profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? (isProd ? 0.05 : 1.0)),

    beforeSend(event) {
      // Defensive scrubbing
      if (event.request) {
        if (event.request.headers) event.request.headers = scrubPII(event.request.headers) as any;
        if (event.request.cookies) event.request.cookies = "[REDACTED_COOKIES]" as any;
        if (event.request.data) event.request.data = scrubPII(event.request.data) as any;
        if (event.request.query_string) event.request.query_string = "[REDACTED_QUERY]" as any;
      }
      if (event.user) {
        // Keep only a stable user id (no email)
        const id = (event.user as any).id || (event.user as any).user_id;
        event.user = id ? ({ id: String(id) } as any) : undefined;
      }
      return event;
    },

    beforeBreadcrumb(breadcrumb) {
      // Remove potentially sensitive URL/query info
      if (breadcrumb?.data) breadcrumb.data = scrubPII(breadcrumb.data) as any;
      return breadcrumb;
    },
  });
}

export { Sentry };
