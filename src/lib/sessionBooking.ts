/**
 * Session-booking logic for the advisor-call entitlements (MES-196 / T13).
 *
 * Paid tiers include a human advisor session, granted as a row in
 * service_entitlements by the Stripe webhook (MES-195 / T8):
 *   growth → walkthrough_call (20–30 min) · scale → strategy_session (60 min).
 * This module decides whether a user has a bookable session and which booking
 * link to use. Pure logic — tested in sessionBooking.test.ts; the React pieces
 * (hook + banner) stay thin.
 *
 * Booking tool is ONE Calendly account per D7; links must stay in lockstep
 * with the FULFILMENT map in
 * supabase/functions/_shared/email/templates/paymentConfirmation.ts (the email
 * half of the same fulfilment promise — T16a).
 */

/** The entitlement kinds that are bookable advisor sessions (not intros). */
export const SESSION_KINDS = ['strategy_session', 'walkthrough_call'] as const;
export type SessionKind = (typeof SESSION_KINDS)[number];

/** Minimal shape of a service_entitlements row the booking logic needs. */
export interface EntitlementRow {
  kind: string;
  granted_count: number;
  consumed_count: number;
  /** ISO timestamp or null (null = never expires). */
  expires_at: string | null;
}

export interface BookingConfig {
  kind: SessionKind;
  /** Banner headline (AU English, matches the confirmation email's promise). */
  title: string;
  /** One-line supporting copy under the headline. */
  description: string;
  /** CTA button label. */
  buttonLabel: string;
  /** Base Calendly event URL (no query params). */
  calendlyUrl: string;
}

const BOOKING_CONFIGS: Record<SessionKind, BookingConfig> = {
  strategy_session: {
    kind: 'strategy_session',
    title: 'Your strategy session is included',
    description:
      'Your Scale plan includes a 60-minute market-entry strategy session with your advisor.',
    buttonLabel: 'Book your strategy session',
    calendlyUrl: 'https://calendly.com/stephen-marketentrysecrets/60-minute-meeting',
  },
  walkthrough_call: {
    kind: 'walkthrough_call',
    title: 'Your walkthrough call is included',
    description:
      'Your Growth plan includes a 20–30 minute market-entry walkthrough with your advisor.',
    buttonLabel: 'Book your walkthrough call',
    calendlyUrl: 'https://calendly.com/stephen-marketentrysecrets/30min',
  },
};

/**
 * Advisor capacity is limited (D6: one advisor, ~2h/week), so the calendar can
 * legitimately show no open slots. Static fallback line shown under the CTA.
 */
export const CALENDAR_FALLBACK_COPY =
  'Sessions run in a limited weekly window — if no times show, the next window opens shortly, so check back or reply to your confirmation email.';

function isBookable(row: EntitlementRow, now: Date): boolean {
  if (!SESSION_KINDS.includes(row.kind as SessionKind)) return false;
  if ((row.granted_count ?? 0) - (row.consumed_count ?? 0) <= 0) return false;
  if (row.expires_at) {
    const expiry = Date.parse(row.expires_at);
    // Fail closed: a non-null but unparseable expiry (NaN) is treated as expired,
    // never as "never expires" — a corrupted date must not keep the banner live.
    if (Number.isNaN(expiry) || expiry <= now.getTime()) return false;
  }
  return true;
}

/**
 * Pick the session the banner should offer, or null when there is nothing
 * bookable (free users, consumed or expired entitlements). When a user holds
 * both kinds (e.g. bought Growth then upgraded to Scale), offer the
 * strategy_session — SESSION_KINDS is ordered highest-value first.
 */
export function selectBookableSession(
  rows: EntitlementRow[] | null | undefined,
  now: Date = new Date(),
): BookingConfig | null {
  if (!rows || rows.length === 0) return null;
  for (const kind of SESSION_KINDS) {
    const match = rows.find((r) => r.kind === kind && isBookable(r, now));
    if (match) return BOOKING_CONFIGS[kind];
  }
  return null;
}

/**
 * Calendly URL with the invitee's context prefilled (Calendly's documented
 * `name` / `email` query params), so the booking lands attributed to the
 * right user without retyping.
 */
export function buildBookingUrl(
  base: string,
  ctx: { name?: string | null; email?: string | null } = {},
): string {
  try {
    const url = new URL(base);
    if (ctx.name) url.searchParams.set('name', ctx.name);
    if (ctx.email) url.searchParams.set('email', ctx.email);
    return url.toString();
  } catch {
    return base;
  }
}
