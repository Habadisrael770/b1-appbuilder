import * as Sentry from "@sentry/react";

const isProd = import.meta.env.MODE === "production";

export function initClientSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    if (isProd) console.warn("⚠️ VITE_SENTRY_DSN missing in production build.");
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? (isProd ? 0.1 : 1)),
    replaysSessionSampleRate: Number(import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? (isProd ? 0.0 : 0.1)),
    replaysOnErrorSampleRate: Number(import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? (isProd ? 0.1 : 1)),

    sendDefaultPii: false,

    beforeSend(event) {
      // Remove query strings and any accidental sensitive payload
      if (event.request?.url) {
        try {
          const u = new URL(event.request.url);
          u.search = "";
          event.request.url = u.toString();
        } catch {}
      }
      return event;
    },
  });
}
