/**
 * Client error tracking via Sentry (@sentry/react).
 *
 * Lovable doesn't support VITE_ env vars, so the DSN is a committed constant —
 * a Sentry DSN is a publishable client identifier (same class as the Supabase
 * anon key in src/integrations/supabase/client.ts), not a secret. With no DSN
 * every export is a no-op, so this ships safely before the Sentry project
 * exists. Kill switch: ?errtrack=0 (feature flag `error_tracking`).
 *
 * PII: identity, headers, cookies and breadcrumb payloads are stripped and
 * emails/tokens masked before any event leaves the browser (errorScrub.ts).
 */
import * as Sentry from '@sentry/react';
import { isFeatureEnabled } from './featureFlags';
import { resolveEnvironment, scrubEvent } from './errorScrub';

// Paste the DSN from sentry.io → Project Settings → Client Keys (DSN).
export const SENTRY_DSN = '';

let initialised = false;

export function initErrorTracking(): void {
  if (initialised || !SENTRY_DSN) return;
  if (!isFeatureEnabled('error_tracking')) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: resolveEnvironment(window.location.hostname),
    // Errors only — no performance tracing or session replay, which keeps the
    // free-tier quota for what matters and avoids capturing page content.
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend(event) {
      return scrubEvent(event);
    },
  });
  initialised = true;
}

/** Report a caught error (e.g. from an error boundary) with optional context. */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (!initialised) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
