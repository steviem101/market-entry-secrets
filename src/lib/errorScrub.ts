/**
 * Pure helpers for client error tracking (no Sentry import — keeps this
 * module testable under Node's test runner). PII rule: no emails or tokens
 * may leave the browser in an error event (see skill
 * observability-logging-and-cost-attribution).
 */

export type TrackingEnvironment = 'production' | 'preview' | 'development';

/** Map the current hostname to a Sentry environment name. */
export function resolveEnvironment(hostname: string): TrackingEnvironment {
  const host = hostname.toLowerCase();
  if (host === 'marketentrysecrets.com' || host === 'www.marketentrysecrets.com') {
    return 'production';
  }
  if (host.endsWith('.lovable.app')) return 'preview';
  return 'development';
}

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
// Long opaque tokens (JWTs, share tokens, API keys) — 32+ chars of base64/hex-ish.
const TOKEN_RE = /\b[A-Za-z0-9_-]{32,}\b/g;

/** Replace email addresses and token-like strings in free text. */
export function scrubText(text: string): string {
  return text.replace(EMAIL_RE, '[email]').replace(TOKEN_RE, '[token]');
}

/**
 * Structural subset of a Sentry error event — typed loosely so tests can pass
 * plain objects and so a Sentry SDK upgrade can't break compilation here.
 */
export interface ScrubbableEvent {
  message?: string;
  request?: { url?: string; headers?: Record<string, string>; cookies?: unknown };
  user?: unknown;
  exception?: { values?: Array<{ value?: string }> };
  breadcrumbs?: Array<{ message?: string; data?: Record<string, unknown> }>;
}

/**
 * Strip PII from an outgoing error event in place and return it.
 * Removes user identity entirely; scrubs emails/tokens from message,
 * exception values, request URL, and breadcrumb messages; drops breadcrumb
 * data payloads and request headers/cookies wholesale (they are where
 * fetch bodies and auth headers would hide).
 */
export function scrubEvent<T extends ScrubbableEvent>(event: T): T {
  delete event.user;
  if (event.message) event.message = scrubText(event.message);
  if (event.request) {
    if (event.request.url) event.request.url = scrubText(event.request.url);
    delete event.request.headers;
    delete event.request.cookies;
  }
  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = scrubText(ex.value);
  }
  for (const crumb of event.breadcrumbs ?? []) {
    if (crumb.message) crumb.message = scrubText(crumb.message);
    delete crumb.data;
  }
  return event;
}
