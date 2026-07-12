// MES-148 Phase 2d — authoritative relevance selection (pure logic, node --test).
//
// The shadow (scoreRelevance + summariseRelevanceShadow) proved the unified
// relevance function reproduces the six per-row union gates. This turns it into
// the actual selector: one pass per surface that applies scoreRelevance's
// `hard_exclusions` — hard reasons drop the row, floor-guarded reasons defer to
// preferRelevant so a thin pool still renders — replacing the six scattered
// filter/preferRelevant blocks in searchMatches with one cohesive, tested unit.
//
// FAITHFUL ORDERING (the ordering-fix follow-up). The legacy gate sequence is
// NOT "all hard then all soft": for providers/innovation it runs geo (soft,
// floor 3) BEFORE chamber (hard), and it runs the immigration floor AFTER the
// cross-section dedupe (pruneAcrossGroups), not before. Order matters because a
// floor's backfill count depends on how many rows a prior gate already removed —
// so a surface's gates are an ORDERED `steps` list (interleaving hard + soft to
// mirror legacy exactly), and the immigration gate lives in a SEPARATE config
// (SURFACE_SELECT_IMMIGRATION) the caller applies post-dedupe.
//
// NOT covered here (they're set operations, not per-row relevance): the grants
// ordering (a reorder) and the cross-section dedupe (pruneAcrossGroups) — those
// stay in the caller, and the immigration step runs on the caller's far side of
// the dedupe. Behind the RELEVANCE_AUTHORITATIVE flag; the legacy gate stack
// remains the default until the golden harness validates the flip.

import { preferRelevant, type MatchContext } from "./matchScoring.ts";
import { scoreRelevance, type RelevanceGates, type RelevanceProfile, type ExclusionReason } from "./scoreRelevance.ts";

// deno-lint-ignore no-explicit-any
type Row = any;

/** One gate in a surface's ordered sequence. `floor` present → floor-guarded
 *  (preferRelevant backfill so the section never empties); absent → hard filter
 *  (the row is dropped outright). */
export interface SelectStep {
  reason: ExclusionReason;
  floor?: number;
}

/** Per-surface selection config: which relevance checks the profile enables, and
 *  the gates to apply IN ORDER — interleaving hard + soft to mirror the legacy
 *  gate sequence (e.g. providers: geo-soft THEN chamber-hard, not the reverse). */
export interface SurfaceSelectConfig {
  profile: RelevanceProfile;
  steps: SelectStep[];
}

/** Apply relevance selection to ONE surface's rows. Pure + order-preserving. */
export function selectRelevantSurface(
  rows: Row[],
  ctx: MatchContext,
  gates: RelevanceGates,
  cfg: SurfaceSelectConfig,
): Row[] {
  if (!rows || rows.length === 0) return rows || [];
  // Compute each row's hard_exclusions once (opts={} — exclusions don't use the
  // score, only the gate predicates). Each predicate is a pure function of the
  // row, so caching before the gates run is safe: a gate removing rows can't
  // change another row's exclusion set, only the floor-backfill counts below.
  const scored = rows.map((row) => ({
    row,
    ex: new Set<ExclusionReason>(scoreRelevance(row, {}, ctx, gates, cfg.profile).hard_exclusions),
  }));
  // Apply the gates in listed order. A hard step (no floor) drops every row
  // tripping the reason; a soft step keeps rows NOT tripping it but backfills the
  // weak ones up to `floor` so the section never empties. Ordering is faithful to
  // legacy — e.g. geo (soft) is counted BEFORE chamber (hard) removes rows, so a
  // chamber row that is geo-relevant fills the geo floor and only then drops,
  // rather than freeing an extra foreign-row backfill slot.
  let kept = scored;
  for (const step of cfg.steps) {
    if (step.floor === undefined) {
      kept = kept.filter((s) => !s.ex.has(step.reason));
    } else {
      kept = preferRelevant(kept, (s) => !s.ex.has(step.reason), step.floor);
    }
  }
  return kept.map((s) => s.row);
}

/** Pre-dedupe surfaces — reproduces the legacy union gates that run BEFORE the
 *  cross-section dedupe, in the legacy order:
 *  - providers/innovation: geo (soft, floor 3) → chamber (hard)
 *  - agencies: corridor (hard) → state (hard)
 *  - leads: ICP (hard)
 *  The immigration gate is deliberately absent here — it runs post-dedupe (see
 *  SURFACE_SELECT_IMMIGRATION), matching the legacy sequence. */
export const SURFACE_SELECT: Record<string, SurfaceSelectConfig> = {
  service_providers: {
    profile: { geo: true, chamber: true },
    steps: [{ reason: "geo_out_of_market", floor: 3 }, { reason: "chamber_mismatch" }],
  },
  innovation_ecosystem: {
    profile: { geo: true, chamber: true },
    steps: [{ reason: "geo_out_of_market", floor: 3 }, { reason: "chamber_mismatch" }],
  },
  trade_investment_agencies: {
    profile: { agencyCorridor: true, stateRegion: true },
    steps: [{ reason: "agency_out_of_corridor" }, { reason: "state_mismatch" }],
  },
  lead_databases: {
    profile: { leadIcp: true },
    steps: [{ reason: "off_icp" }],
  },
};

/** Post-dedupe surfaces — the persona/origin immigration floor, applied AFTER the
 *  caller's pruneAcrossGroups so (a) a mentor kept only to satisfy the floor isn't
 *  then deduped below it, and (b) an immigration provider still sits in the
 *  providerPool at dedupe time, so a mentor duplicating it is pruned (the Floats
 *  regression the gate exists to prevent). `immigration_for_domestic` self-gates
 *  via gates.excludeImmigration, so applying this when the company is
 *  international / asked for immigration help is a no-op — matching the legacy
 *  `isDomesticOrigin && !wantsImmigration` guard. */
export const SURFACE_SELECT_IMMIGRATION: Record<string, SurfaceSelectConfig> = {
  community_members: {
    profile: { immigration: true },
    steps: [{ reason: "immigration_for_domestic", floor: 3 }],
  },
  service_providers: {
    profile: { immigration: true },
    steps: [{ reason: "immigration_for_domestic", floor: 4 }],
  },
};

/** Drive selection across every configured surface, mutating a shallow copy of the
 *  pools. Returns the new pools; the caller keeps grants-ordering + cross-section
 *  dedupe (set-ops) outside this. `surfaces` selects which config to run — the
 *  pre-dedupe default, or SURFACE_SELECT_IMMIGRATION on the dedupe's far side. */
export function applyRelevanceSelection(
  pools: Record<string, Row[]>,
  ctx: MatchContext,
  gates: RelevanceGates,
  surfaces: Record<string, SurfaceSelectConfig> = SURFACE_SELECT,
): Record<string, Row[]> {
  const out: Record<string, Row[]> = { ...pools };
  for (const [tbl, cfg] of Object.entries(surfaces)) {
    if (out[tbl]?.length) out[tbl] = selectRelevantSurface(out[tbl], ctx, gates, cfg);
  }
  return out;
}
