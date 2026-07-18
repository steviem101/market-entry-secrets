/**
 * Like-for-like case-study matching (MES-210a).
 *
 * Case studies are content_items rows (content_type='case_study') each backed by a
 * content_company_profiles row whose corridor fields — origin_country, target_market,
 * industry, outcome — are fully populated but were never read by the matcher (MES-210
 * audit RC2). This module scores a case study against the intake so a report can lead
 * with "a company like you did this": same origin corridor, same sector, entered the
 * same target market, ideally successfully.
 *
 * Pure module — NO Deno globals, NO I/O — importable by the Deno edge function AND
 * unit-tested under Node (`node --test`), like matchScoring.ts / geoRelevance.ts.
 */

import { normalizeCountry } from "./countryNormalize.ts";
import { industryGroupsToSectorSlugs } from "./sectorTaxonomy.ts";

export interface CaseStudyProfile {
  company_name?: string | null;
  origin_country?: string | null;
  target_market?: string | null;
  industry?: string | null;
  outcome?: string | null;
}

export interface CaseStudyRow {
  id: string;
  title?: string | null;
  slug?: string | null;
  sector_tags?: string[] | null;
  sector_agnostic?: boolean | null;
  publish_date?: string | null;
  meta_description?: string | null;
  profile?: CaseStudyProfile | null;
}

export interface CaseStudyContext {
  /** normalizeCountry(intake.country_of_origin) — "" for blank/unknown. */
  userCountryKey: string;
  /** 20-sector slugs rolled up from the user's own industry_sector. */
  userSectors: string[];
  /** 20-sector slugs rolled up from end_buyer_industries (sells-to). */
  sellsToSectors: string[];
  /** expandTargetRegions(intake.target_regions) — lowercased region tokens. */
  targetRegionTokens: string[];
}

// Outcomes that count as proof of a successful entry. Mirror of the canonical
// POSITIVE_OUTCOMES / isPositiveOutcome() in src/lib/caseStudyFilters.ts (the
// edge runtime cannot import src/lib) — keep the two sets in sync when the
// outcome vocabulary changes.
const POSITIVE_OUTCOMES = new Set(["successful", "scaling", "ipo", "acquired"]);

// Reason string for the outcome-only signal. Exported so callers can tell a
// corridor-grade match (origin/sector/target reasons) from a row that scored
// on outcome alone — the latter must never be presented as "like you".
export const OUTCOME_REASON = "Successful entry";

/** True when the row matched on at least one corridor signal (origin, sector,
 *  industry, or target market) — not merely on a positive outcome. */
export function hasCorridorReason(reasons: string[] | null | undefined): boolean {
  return (reasons || []).some((r) => r !== OUTCOME_REASON);
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export interface ScoredCaseStudy {
  row: CaseStudyRow;
  score: number;
  reasons: string[];
}

/** Score one case study against the intake corridor. Higher = closer like-for-like. */
export function scoreCaseStudy(row: CaseStudyRow, ctx: CaseStudyContext): ScoredCaseStudy {
  const reasons: string[] = [];
  let score = 0;
  const p = row.profile || {};

  // Origin corridor — the strongest "company like you" signal (an Irish founder
  // reading about an Irish company's entry). Compared via the same normalizeCountry
  // key the mentor/agency corridor signals use, so spelling variants agree.
  if (ctx.userCountryKey && p.origin_country && normalizeCountry(p.origin_country) === ctx.userCountryKey) {
    score += 3;
    reasons.push(`Same origin market (${p.origin_country})`);
  }

  // Sector overlap on the canonical 20-slug tags (audit: 100% populated + canonical).
  const tags = row.sector_tags || [];
  if (ctx.userSectors.length && tags.some((t) => ctx.userSectors.includes(t))) {
    score += 2;
    reasons.push("Same sector");
  } else if (ctx.sellsToSectors.length && tags.some((t) => ctx.sellsToSectors.includes(t))) {
    score += 1;
    reasons.push("Sector they sell into");
  }

  // The profile's free-text industry, rolled up through the same alias map the
  // intake uses — catches "FinTech" profiles a sector_tags mismatch would miss.
  if (ctx.userSectors.length && p.industry) {
    const industrySlugs = industryGroupsToSectorSlugs([p.industry]);
    if (industrySlugs.some((s) => ctx.userSectors.includes(s))) {
      score += 1;
      reasons.push(`Similar industry (${p.industry})`);
    }
  }

  // Target market — entered the same state/city the reader is targeting. Generic
  // national targets contribute no token (expandTargetRegions drops them), matching
  // the location semantics of the wider matcher. Word-boundary match, not bare
  // substring: the 3-letter state tokens ("act", "tas") must not fire inside
  // unrelated words ("manufACTuring").
  if (ctx.targetRegionTokens.length && p.target_market) {
    const tm = String(p.target_market).toLowerCase();
    const hit = ctx.targetRegionTokens.find((t) => new RegExp(`\\b${escapeRegex(t)}\\b`).test(tm));
    if (hit) {
      score += 1;
      reasons.push(`Entered ${p.target_market}`);
    }
  }

  // Positive outcome — proof beats cautionary tale for the report's purpose,
  // but failures still rank when the corridor matches (they carry lessons).
  const outcome = String(p.outcome || "").toLowerCase().trim();
  if (POSITIVE_OUTCOMES.has(outcome)) {
    score += 1;
    reasons.push(OUTCOME_REASON);
  }

  return { row, score, reasons };
}

/**
 * Select the top like-for-like case studies. Corridor-scored rows rank first
 * (score desc, then newest publish_date). If fewer than `minKeep` rows scored,
 * the newest unscored rows backfill so the section never renders empty while
 * 140+ published case studies exist.
 */
export function selectCaseStudies(
  rows: CaseStudyRow[],
  ctx: CaseStudyContext,
  cap = 4,
  minKeep = 2,
): ScoredCaseStudy[] {
  const scored = (rows || []).map((r) => scoreCaseStudy(r, ctx));
  const byRank = (a: ScoredCaseStudy, b: ScoredCaseStudy) =>
    b.score - a.score || String(b.row.publish_date || "").localeCompare(String(a.row.publish_date || ""));

  const matched = scored.filter((s) => s.score > 0).sort(byRank);
  const picked = matched.slice(0, cap);

  if (picked.length < minKeep) {
    const chosen = new Set(picked.map((s) => s.row.id));
    const backfill = scored
      .filter((s) => !chosen.has(s.row.id))
      .sort(byRank)
      .slice(0, minKeep - picked.length);
    picked.push(...backfill);
  }
  return picked;
}
