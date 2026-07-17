/**
 * Concierge intro allowance maths (MES-188 T9).
 *
 * A paid tier grants an expiring allowance of human-facilitated introductions
 * (D4: Growth 1 mentor + 3 ecosystem, Scale 2 mentors + priority; 30-day window),
 * held as service_entitlements rows (kind = mentor_intro | ecosystem_intro). This
 * module mirrors the server's `check_concierge_intro_capacity` trigger so the UI
 * can show an accurate "N left" and disable the request action client-side — the
 * SERVER is still the source of truth (the trigger blocks over-requests and the
 * fulfil RPC + CHECK constraint enforce consumption). Pure + deterministic (nowMs
 * passed in) so it is node-testable. Relative imports only — none needed here.
 *
 * "Available to request" = Σ max(granted − consumed, 0) over NON-EXPIRED rows of
 * the kind, minus open (new/in_progress) requests of that kind, which reserve a
 * slot without consuming. Consumption itself happens only at fulfilment.
 */

export const INTRO_KINDS = ['mentor_intro', 'ecosystem_intro'] as const;
export type IntroKind = (typeof INTRO_KINDS)[number];

/** Map a directory entity type to the allowance kind it draws from. */
export function introKindForEntity(entityType: 'mentor' | 'ecosystem'): IntroKind {
  return entityType === 'mentor' ? 'mentor_intro' : 'ecosystem_intro';
}

export interface IntroEntitlement {
  kind: string;
  granted_count: number;
  consumed_count: number;
  expires_at: string | null;
}

export interface IntroRequestLike {
  intro_kind: string;
  status: string;
}

const OPEN_STATUSES = new Set(['new', 'in_progress']);

/** Unconsumed, unexpired credits of a kind (Σ max(granted − consumed, 0)). */
export function grantedRemaining(
  entitlements: readonly IntroEntitlement[],
  kind: IntroKind,
  nowMs: number,
): number {
  let total = 0;
  for (const e of entitlements) {
    if (e.kind !== kind) continue;
    const expMs = e.expires_at ? Date.parse(e.expires_at) : NaN;
    // Non-null but unparseable expiry is treated as expired (fail closed),
    // matching sessionBooking.isBookable.
    if (e.expires_at != null && (!Number.isFinite(expMs) || expMs <= nowMs)) continue;
    total += Math.max(0, (e.granted_count ?? 0) - (e.consumed_count ?? 0));
  }
  return total;
}

/** Open (new/in_progress) requests of a kind — each reserves a slot. */
export function openRequestCount(
  requests: readonly IntroRequestLike[],
  kind: IntroKind,
): number {
  return requests.reduce(
    (n, r) => (r.intro_kind === kind && OPEN_STATUSES.has(r.status) ? n + 1 : n),
    0,
  );
}

/** How many more intros of this kind the member can request right now (≥ 0). */
export function availableToRequest(
  entitlements: readonly IntroEntitlement[],
  requests: readonly IntroRequestLike[],
  kind: IntroKind,
  nowMs: number,
): number {
  return Math.max(0, grantedRemaining(entitlements, kind, nowMs) - openRequestCount(requests, kind));
}

/** Whether the member may file a new request of this kind now. */
export function canRequestIntro(
  entitlements: readonly IntroEntitlement[],
  requests: readonly IntroRequestLike[],
  kind: IntroKind,
  nowMs: number,
): boolean {
  return availableToRequest(entitlements, requests, kind, nowMs) > 0;
}
