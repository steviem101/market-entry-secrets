// MES-148 Phase 2d — unified relevance scoring + hard exclusions (pure logic).
//
// The matching pipeline currently stacks EIGHT post-merge gates in searchMatches
// (index.ts): lead-ICP, provider/innovation geo, agency corridor, state-body
// region, chamber origin, cross-section dedupe, and the domestic immigration
// filter — each a separate `.filter()` / `preferRelevant()` that silently drops
// rows and only `console.log`s a count. The epic's Phase 2d goal is a single
// `scoreRelevance(row, ctx)` returning `{ score, hard_exclusions[] }`, so every
// gate becomes a NAMED exclusion reason carried on the row instead of a silent drop.
//
// This module is the pure core of that: it reuses the existing `scoreRow` maths
// (unchanged) and folds the row-level hard-exclusion predicates — already pure in
// matchScoring.ts / geoRelevance.ts — into one structured result. It changes NO
// behaviour on its own: the caller decides what to do with `hard_exclusions`.
// Phase 2d ships in SHADOW first (compute + count-only telemetry, live gates still
// authoritative); the flip to authoritative selection is gated on the golden harness.
//
// Pure module — no Deno globals, no I/O — unit-tested under `node --test` like its
// siblings. Cross-section dedupe (pruneAcrossGroups) is deliberately NOT folded in:
// it's a set operation across surfaces, not a per-row predicate.

import { scoreRow, isImmigrationFocused, leadMatchesIcp, type MatchContext, type ScoreOpts, type Scored } from "./matchScoring.ts";
import { isGeoRelevant, isAgencyInCorridor, stateAgencyRegionMismatch, chamberOriginMismatch } from "./geoRelevance.ts";

// deno-lint-ignore no-explicit-any
type Row = any;

/** The named hard-exclusion reasons — one per existing union gate. Stable strings:
 *  they surface in telemetry and (eventually) in match_reasons, so don't rename. */
export type ExclusionReason =
  | "geo_out_of_market"        // provider/innovation location clearly foreign
  | "agency_out_of_corridor"   // trade/gov agency not on the origin corridor
  | "state_mismatch"           // state body whose state ≠ any target region
  | "chamber_mismatch"         // wrong-corridor chamber of commerce
  | "off_icp"                  // lead list doesn't match the buyer ICP tokens
  | "immigration_for_domestic"; // visa/immigration row for a domestic-origin company

/** Pre-built, per-report inputs the exclusion predicates need (constructed once in
 *  searchMatches). Any field left undefined disables its check regardless of profile. */
export interface RelevanceGates {
  geoMatcher?: RegExp;          // buildGeoMatcher({ targetRegions })
  agencyOriginTerms?: string[]; // geoOriginTerms(country_of_origin)
  targetRegions?: string[];     // deriveLocationPatterns(intake)
  icpTokens?: string[];         // leadIcpTokens(endBuyer, ownSector)
  excludeImmigration?: boolean; // domestic origin AND user didn't ask for immigration help
}

/** Which hard-exclusion checks apply on a given surface. Mirrors the live gates:
 *  providers/innovation → geo + chamber (+ immigration on providers only);
 *  agencies → corridor + state; mentors → immigration; leads → ICP. */
export interface RelevanceProfile {
  geo?: boolean;
  agencyCorridor?: boolean;
  stateRegion?: boolean;
  chamber?: boolean;
  leadIcp?: boolean;
  immigration?: boolean;
}

export interface RelevanceResult extends Scored {
  /** Named gates this row trips. Empty = passes every applicable hard gate.
   *  NOTE: geo and immigration are FLOOR-GUARDED in the live pipeline (they only
   *  drop when enough relevant rows remain), so a flagged row is "would-exclude",
   *  not necessarily "is-dropped" — the selection layer still owns the floor. */
  hard_exclusions: ExclusionReason[];
}

/**
 * Score a row (via the unchanged `scoreRow`) AND evaluate the hard-exclusion
 * predicates selected by `profile`, returning both in one structured result.
 * Pure: no floor-guarding, no dropping — the caller applies `hard_exclusions`.
 */
export function scoreRelevance(
  row: Row,
  opts: ScoreOpts,
  ctx: MatchContext,
  gates: RelevanceGates,
  profile: RelevanceProfile = {},
): RelevanceResult {
  const scored = scoreRow(row, opts, ctx);
  const ex: ExclusionReason[] = [];

  if (profile.geo && gates.geoMatcher && !isGeoRelevant(row, gates.geoMatcher)) {
    ex.push("geo_out_of_market");
  }
  if (profile.agencyCorridor && gates.agencyOriginTerms && !isAgencyInCorridor(row, gates.agencyOriginTerms)) {
    ex.push("agency_out_of_corridor");
  }
  if (profile.stateRegion && gates.targetRegions && stateAgencyRegionMismatch(row, gates.targetRegions)) {
    ex.push("state_mismatch");
  }
  if (profile.chamber && gates.agencyOriginTerms && chamberOriginMismatch(row, gates.agencyOriginTerms)) {
    ex.push("chamber_mismatch");
  }
  if (profile.leadIcp && gates.icpTokens && !leadMatchesIcp(row, gates.icpTokens)) {
    ex.push("off_icp");
  }
  if (profile.immigration && gates.excludeImmigration && isImmigrationFocused(row)) {
    ex.push("immigration_for_domestic");
  }

  return { ...scored, hard_exclusions: ex };
}

/** True when a row trips any applicable hard gate. */
export function isHardExcluded(r: RelevanceResult): boolean {
  return r.hard_exclusions.length > 0;
}

export interface RelevanceShadowSummary {
  /** rows evaluated on this surface */
  evaluated: number;
  /** count of rows tripping each reason (a row can trip more than one) */
  by_reason: Partial<Record<ExclusionReason, number>>;
  /** distinct rows tripping ≥1 reason */
  flagged_rows: number;
}

/**
 * Shadow telemetry for one surface: run scoreRelevance over a candidate pool and
 * tally exclusions by reason. COUNTS ONLY — no row identifiers/text — because
 * report_json.metadata rides past the tier-gating strip point (get_tier_gated_report
 * only rewrites `sections`), so raw fragments here would leak gated content.
 */
export function summariseRelevanceShadow(
  rows: Row[],
  opts: ScoreOpts,
  ctx: MatchContext,
  gates: RelevanceGates,
  profile: RelevanceProfile,
): RelevanceShadowSummary {
  const by_reason: Partial<Record<ExclusionReason, number>> = {};
  let flagged = 0;
  for (const row of rows || []) {
    const { hard_exclusions } = scoreRelevance(row, opts, ctx, gates, profile);
    if (hard_exclusions.length > 0) flagged++;
    for (const r of hard_exclusions) by_reason[r] = (by_reason[r] ?? 0) + 1;
  }
  return { evaluated: (rows || []).length, by_reason, flagged_rows: flagged };
}
