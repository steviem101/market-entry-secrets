// MES-148 Phase 4 (PR-A) — live prompt A/B bucketing (pure logic, node --test).
//
// report_templates.prompt_body stays the ACTIVE prompt; the prompt_versions
// table stages CANDIDATE bodies. A report is assigned to the candidate arm by a
// deterministic hash of its id, so the same report always resolves the same arm
// (idempotent across retries of that row) and the split is independent of which
// section is being written. PROMPT_AB_PERCENT (default 0) is the only lever —
// 0 means no report is ever bucketed, so the whole feature is inert until it is
// raised AND a candidate row exists.

/** FNV-1a 32-bit hash of a short string → 0–99 bucket. Dependency-free and
 *  well-distributed for uuid-shaped ids; `>>> 0` forces unsigned before mod. */
export function hashToBucket(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % 100;
}

/** Parse PROMPT_AB_PERCENT into a clamped integer in [0, 100]; unparseable → 0
 *  (off). A stray blank or garbage value can never accidentally enrol traffic. */
export function parseAbPercent(raw: string | null | undefined): number {
  const n = Number.parseInt((raw ?? "").trim(), 10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

/** Whether this report is in the candidate arm. percent<=0 → never (default);
 *  percent>=100 → always; otherwise the first `percent`% of the hash space. */
export function inCandidateBucket(reportId: string, percent: number): boolean {
  if (percent <= 0) return false;
  if (percent >= 100) return true;
  if (!reportId) return false;
  return hashToBucket(reportId) < percent;
}
