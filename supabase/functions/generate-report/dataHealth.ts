// MES-148 Phase 5 (P5-3a) — directory-row data-health scoring (pure, node --test).
//
// The nightly steward re-scrapes each row's source and computes a 0–100 health
// score from three signals; the matcher (P5-2) uses it as a freshness tiebreaker.
// Pure so it's unit-tested under Node and reused by the steward edge function.
//
// Weighting (sums to 100):
//   • reachability 40 — is the source URL live and serving content?
//   • completeness 40 — fraction of the row's required fields that are populated.
//   • freshness    20 — decays linearly from full at 0 days to 0 at STALE_DAYS.

export interface HealthSignals {
  /** true = URL fetched OK; false = dead/errored; null = not checked (neutral). */
  urlReachable: boolean | null;
  /** 0..1 fraction of required fields present on the row. */
  requiredPresent: number;
  /** days since the row was last verified (>= 0). */
  ageDays: number;
}

const REACH_WEIGHT = 40;
const COMPLETE_WEIGHT = 40;
const FRESH_WEIGHT = 20;
/** Freshness hits zero at ~6 months unverified. */
export const STALE_DAYS = 180;

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/** Compute a 0–100 data-health score. Deterministic and total — it never throws.
 *  Invalid/missing signals fail SAFE toward a LOWER score (NaN completeness → 0,
 *  NaN/absent age → fully stale → 0 freshness; only an explicitly-null urlReachable
 *  is a true neutral half-weight), so an unscoreable row reads as stale and the
 *  steward re-examines it rather than trusting a bogus high score. */
export function computeDataHealth(sig: HealthSignals): number {
  // Reachability: live = full, unknown = half (don't punish an unchecked row),
  // dead = zero (a broken source is the strongest staleness signal).
  const reach = sig.urlReachable === true ? REACH_WEIGHT
    : sig.urlReachable === null ? REACH_WEIGHT / 2
    : 0;

  const complete = clamp01(sig.requiredPresent) * COMPLETE_WEIGHT;

  const age = Number.isFinite(sig.ageDays) ? Math.max(0, sig.ageDays) : STALE_DAYS;
  const fresh = Math.max(0, 1 - age / STALE_DAYS) * FRESH_WEIGHT;

  return Math.round(Math.max(0, Math.min(100, reach + complete + fresh)));
}

/** Fraction of `fields` that are non-empty on `row` (string/array/number aware).
 *  A small helper the steward uses to derive `requiredPresent`. */
export function completeness(row: Record<string, unknown>, fields: string[]): number {
  if (!fields || fields.length === 0) return 1;
  let present = 0;
  for (const f of fields) {
    const v = row?.[f];
    const ok = Array.isArray(v) ? v.length > 0
      : typeof v === "string" ? v.trim().length > 0
      : v !== null && v !== undefined;
    if (ok) present += 1;
  }
  return present / fields.length;
}
