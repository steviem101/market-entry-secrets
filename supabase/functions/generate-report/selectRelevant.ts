// MES-148 Phase 2d — authoritative relevance selection (pure logic, node --test).
//
// The shadow (scoreRelevance + summariseRelevanceShadow) proved the unified
// relevance function reproduces the six per-row union gates. This turns it into
// the actual selector: one pass per surface that applies scoreRelevance's
// `hard_exclusions` — hard reasons drop the row, floor-guarded reasons defer to
// preferRelevant so a thin pool still renders — replacing the six scattered
// filter/preferRelevant blocks in searchMatches with one cohesive, tested unit.
//
// NOT covered here (they're set operations, not per-row relevance): the grants
// ordering (a reorder) and the cross-section dedupe (pruneAcrossGroups) — those
// stay in the caller. Behind the RELEVANCE_AUTHORITATIVE flag; the legacy gate
// stack remains the default until the golden harness validates the flip.

import { preferRelevant, type MatchContext } from "./matchScoring.ts";
import { scoreRelevance, type RelevanceGates, type RelevanceProfile, type ExclusionReason } from "./scoreRelevance.ts";

// deno-lint-ignore no-explicit-any
type Row = any;

/** Per-surface selection config: which relevance checks apply, which reasons are
 *  HARD filters (no floor), and which are floor-guarded (preferRelevant), applied
 *  in listed order — mirroring the legacy gate sequence. */
export interface SurfaceSelectConfig {
  profile: RelevanceProfile;
  hard: ExclusionReason[];
  soft: Array<{ reason: ExclusionReason; floor: number }>;
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
  // score, only the gate predicates), then filter/floor over the cached set.
  const scored = rows.map((row) => ({
    row,
    ex: new Set<ExclusionReason>(scoreRelevance(row, {}, ctx, gates, cfg.profile).hard_exclusions),
  }));
  // 1. Hard filter: any hard reason drops the row outright.
  let kept = scored.filter((s) => !cfg.hard.some((h) => s.ex.has(h)));
  // 2. Floor-guarded reasons, in order: keep rows NOT tripping the reason, but
  //    backfill weak ones up to `floor` so the section never empties.
  for (const { reason, floor } of cfg.soft) {
    kept = preferRelevant(kept, (s) => !s.ex.has(reason), floor);
  }
  return kept.map((s) => s.row);
}

/** The per-surface config that reproduces the legacy union gates:
 *  - providers/innovation: geo (floor 3) + chamber (hard) [+ immigration floor 4 on providers]
 *  - agencies: corridor (hard) + state (hard)
 *  - mentors: immigration (floor 3)
 *  - leads: ICP (hard)
 *  Immigration only fires when gates.excludeImmigration is set (domestic + no
 *  immigration ask), matching the legacy guard. */
export const SURFACE_SELECT: Record<string, SurfaceSelectConfig> = {
  service_providers: {
    profile: { geo: true, chamber: true, immigration: true },
    hard: ["chamber_mismatch"],
    soft: [{ reason: "geo_out_of_market", floor: 3 }, { reason: "immigration_for_domestic", floor: 4 }],
  },
  innovation_ecosystem: {
    profile: { geo: true, chamber: true },
    hard: ["chamber_mismatch"],
    soft: [{ reason: "geo_out_of_market", floor: 3 }],
  },
  trade_investment_agencies: {
    profile: { agencyCorridor: true, stateRegion: true },
    hard: ["agency_out_of_corridor", "state_mismatch"],
    soft: [],
  },
  community_members: {
    profile: { immigration: true },
    hard: [],
    soft: [{ reason: "immigration_for_domestic", floor: 3 }],
  },
  lead_databases: {
    profile: { leadIcp: true },
    hard: ["off_icp"],
    soft: [],
  },
};

/** Drive selection across every configured surface, mutating a shallow copy of the
 *  pools. Returns the new pools; the caller keeps grants-ordering + cross-section
 *  dedupe (set-ops) outside this. */
export function applyRelevanceSelection(
  pools: Record<string, Row[]>,
  ctx: MatchContext,
  gates: RelevanceGates,
): Record<string, Row[]> {
  const out: Record<string, Row[]> = { ...pools };
  for (const [tbl, cfg] of Object.entries(SURFACE_SELECT)) {
    if (out[tbl]?.length) out[tbl] = selectRelevantSurface(out[tbl], ctx, gates, cfg);
  }
  return out;
}
