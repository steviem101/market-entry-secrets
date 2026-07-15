/**
 * Homepage counter presentation logic, kept pure so it can be unit-tested
 * (the ProofStrip component itself can't be — there's no DOM test tooling).
 *
 * "132" reads as a live number that will look stale tomorrow; "130+" stays
 * truthful as counts grow. Floor to the nearest 10, but leave small raw counts
 * (< 20) untouched so we never round a real "12" down to "10".
 */
export const displayCount = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return value >= 20 ? Math.floor(value / 10) * 10 : Math.floor(value);
};
