/**
 * Pending-checkout persistence.
 *
 * When an anonymous user picks a paid tier, checkout can't start until they
 * authenticate. The chosen tier is stored here so checkout can auto-resume
 * after auth completes — including OAuth / magic-link flows, which leave the
 * page entirely and come back through /auth/callback (hence localStorage, not
 * component state).
 *
 * Entries expire after a short TTL so a stale selection can never fire a
 * surprise Stripe redirect on a later visit.
 */

const KEY = 'mes_pending_checkout';
const TTL_MS = 30 * 60 * 1000; // 30 minutes

export type PendingCheckoutTier = 'growth' | 'scale';

/** Remember the tier the user was buying when auth interrupted checkout. */
export function setPendingCheckout(tier: PendingCheckoutTier): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ tier, ts: Date.now() }));
  } catch {
    /* ignore — checkout simply won't auto-resume */
  }
}

/** Read + clear the pending tier. Returns null if none, invalid, or expired. */
export function consumePendingCheckout(): PendingCheckoutTier | null {
  try {
    const raw = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { tier?: unknown; ts?: unknown };
    if (parsed.tier !== 'growth' && parsed.tier !== 'scale') return null;
    if (typeof parsed.ts !== 'number' || Date.now() - parsed.ts > TTL_MS) return null;
    return parsed.tier;
  } catch {
    return null;
  }
}
