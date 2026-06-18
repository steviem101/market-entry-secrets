/**
 * Directory match scoring + explainability + rebalance.
 *
 * Pure module — NO Deno globals, NO I/O — so it's importable by the Deno edge
 * function AND unit-tested under Node (`node --test`), exactly like
 * sectorTaxonomy.ts / semanticMatch.ts. The DB queries stay in index.ts; this
 * owns the ranking maths.
 *
 * Why it exists (see the form→output review): the previous inline scorer
 *   1. let BREADTH win — a mentor tagged across many sectors out-scored a focused
 *      industry expert purely on overlap count;
 *   2. rewarded `sector_agnostic` ("match everyone") rows;
 *   3. applied the sells-to-industry boost to EVERY surface, so a provider/mentor
 *      got points for the user's *buyers'* industry rather than the user's own;
 *   4. discarded the score, so there was no "why this match".
 *
 * This module fixes all four: diminishing returns on sector breadth, an explicit
 * SPECIALIST bonus (sector-specific row that matches the user's own industry),
 * a smaller agnostic nudge, sells-to gated per surface (`applySellsTo`), and a
 * `reasons[]` breakdown attached to every ranked row. Selection adds optional
 * per-key diversity caps (e.g. max-per-organisation) and a minimum-specialist
 * guarantee so genuine experts always make the slate when they exist.
 */

import { overlapCount } from "./sectorTaxonomy.ts";
import { normalizeCountry } from "./countryNormalize.ts";

// deno-lint-ignore no-explicit-any
type Row = any;

export interface MatchContext {
  userSectors: string[];      // the company's own industry slugs
  sellsToSectors: string[];   // end-buyer industry slugs
  serviceTags: string[];      // expanded goal service tags
  locationPatterns: string[]; // target-region location tokens
  userCountry: string;        // normalised country_of_origin
  userIsIntl: boolean;        // entering AU from abroad
  countryTerm: string;        // lowercased raw country_of_origin
}

export interface ScoreOpts {
  /** column holding the row's services/specialties to match against serviceTags */
  service?: string;
  /** column holding the row's origin/country for the corridor boost */
  countryCol?: string;
  /** apply the trade-direction (target_company_origin) boost */
  persona?: boolean;
  /**
   * Whether the end-buyer ("sells-to") sector overlap should score. TRUE only for
   * buyer-facing surfaces (leads, events, content). FALSE (default) for advisory/
   * supply surfaces (providers, mentors, agencies, investors, innovation) — you
   * want experts in YOUR industry, not your customers' industries.
   */
  applySellsTo?: boolean;
}

export interface Scored {
  row: Row;
  score: number;
  reasons: string[];
  agnostic: boolean;
  /** sector-specific (not agnostic) AND matches the user's own industry — a genuine domain expert */
  specialist: boolean;
}

/** Diminishing-returns weight: first match = base, each extra worth +`step` (not ×n). */
function diminishing(matches: number, base: number, step: number): number {
  if (matches <= 0) return 0;
  return base + step * (matches - 1);
}

// A focused industry expert should beat a broad generalist — but not so strongly that a
// COARSE-sector match (e.g. an insurtech specialist for a restaurant-tech company, since the
// 20-sector taxonomy lumps both as "tech") buries a highly-relevant country-corridor hit.
// Tuned 3 -> 2 after the Nory report ranked Insurtech Australia above Enterprise Ireland.
const SPECIALIST_BONUS = 2;
const AGNOSTIC_NUDGE = 0.25;  // small — "eligible for everyone" != "relevant"

export function scoreRow(row: Row, opts: ScoreOpts, ctx: MatchContext): Scored {
  const tags: string[] = row.sector_tags || [];
  const reasons: string[] = [];
  let s = 0;

  const ownMatches = overlapCount(tags, ctx.userSectors);
  if (ownMatches > 0) {
    const add = diminishing(ownMatches, 3, 1);
    s += add;
    reasons.push(`industry match ×${ownMatches} (+${add})`);
  }

  if (opts.applySellsTo) {
    const sellMatches = overlapCount(tags, ctx.sellsToSectors);
    if (sellMatches > 0) {
      const add = diminishing(sellMatches, 2, 1);
      s += add;
      reasons.push(`sells-to sector ×${sellMatches} (+${add})`);
    }
  }

  if (opts.service) {
    const k = overlapCount(row[opts.service] || [], ctx.serviceTags);
    if (k > 0) {
      const add = Math.min(k, 2) * 2; // cap service/skill fit so it can't run away
      s += add;
      reasons.push(`service/skill fit ×${k} (+${add})`);
    }
  }

  const loc = (row.location || "").toLowerCase();
  if (ctx.locationPatterns.some((l) => l && loc.includes(l.toLowerCase()))) {
    s += 1;
    reasons.push("location (+1)");
  }

  // Specialist: a sector-SPECIFIC row that matches the user's own industry. This is
  // the genuine domain expert the breadth-driven scorer used to bury under generalists.
  const specialist = !row.sector_agnostic && ownMatches > 0;
  if (specialist) {
    s += SPECIALIST_BONUS;
    reasons.push(`industry specialist (+${SPECIALIST_BONUS})`);
  } else if (row.sector_agnostic) {
    s += AGNOSTIC_NUDGE;
    reasons.push(`eligible for all sectors (+${AGNOSTIC_NUDGE})`);
  }

  // Country corridor — structured origin match (strongest), then trade-direction, then text.
  if (ctx.userCountry && opts.countryCol && normalizeCountry(row[opts.countryCol]) === ctx.userCountry) {
    s += 2;
    reasons.push(`${ctx.userCountry} corridor (+2)`);
  }
  if (opts.persona && Array.isArray(row.target_company_origin) && row.target_company_origin.length > 0) {
    const wants = ctx.userIsIntl ? "international_entrant" : "australian_exporter";
    if (row.target_company_origin.includes(wants)) {
      s += 1.5;
      reasons.push("trade-direction fit (+1.5)");
    }
  }
  if (ctx.countryTerm) {
    const hay = [row.description, (row.specialties || []).join(" "), (row.services || []).join(" ")]
      .filter(Boolean).join(" ").toLowerCase();
    if (hay.includes(ctx.countryTerm)) {
      s += 1.5;
      reasons.push("country mentioned in profile (+1.5)");
    }
  }

  return { row, score: Number(s.toFixed(2)), reasons, agnostic: !!row.sector_agnostic, specialist };
}

/** Score every row and sort best-first, tiebreaking deterministically by id. */
export function scoreAndSort(rows: Row[], opts: ScoreOpts, ctx: MatchContext): Scored[] {
  return (rows || [])
    .map((row) => scoreRow(row, opts, ctx))
    .sort((a, b) => (b.score - a.score) || String(a.row.id || "").localeCompare(String(b.row.id || "")));
}

export interface SelectOpts {
  /** ordered diversity caps, e.g. [{keyOf: personName, max: 1}, {keyOf: company, max: 2}] */
  dedupeKeys?: Array<{ keyOf: (row: Row) => string; max: number }>;
  /** ensure at least this many specialists in the result when they exist in the pool */
  minSpecialists?: number;
}

/**
 * Greedily pick the top `limit` scored rows subject to optional diversity caps,
 * then ensure `minSpecialists` genuine experts are present (swapping out the
 * lowest-scored generalist for the highest-scored unpicked specialist). Input
 * MUST be pre-sorted (use scoreAndSort).
 */
export function selectTopN(scored: Scored[], limit: number, opts: SelectOpts = {}): Scored[] {
  const dedupeKeys = opts.dedupeKeys ?? [];
  const counts = dedupeKeys.map(() => new Map<string, number>());

  const fits = (s: Scored): boolean =>
    dedupeKeys.every((dk, i) => {
      const k = dk.keyOf(s.row);
      if (!k) return true;
      return (counts[i].get(k) ?? 0) < dk.max;
    });
  const take = (s: Scored): void => {
    dedupeKeys.forEach((dk, i) => {
      const k = dk.keyOf(s.row);
      if (k) counts[i].set(k, (counts[i].get(k) ?? 0) + 1);
    });
  };

  const picked: Scored[] = [];
  for (const s of scored) {
    if (picked.length >= limit) break;
    if (fits(s)) { picked.push(s); take(s); }
  }

  const minSpec = opts.minSpecialists ?? 0;
  if (minSpec > 0) {
    let specCount = picked.filter((p) => p.specialist).length;
    if (specCount < minSpec) {
      const pickedRows = new Set(picked.map((p) => p.row));
      const unpickedSpecs = scored.filter((s) => s.specialist && !pickedRows.has(s.row));
      for (const spec of unpickedSpecs) {
        if (specCount >= minSpec) break;
        // replace the lowest-scored non-specialist currently picked
        for (let i = picked.length - 1; i >= 0; i--) {
          if (!picked[i].specialist) {
            picked[i] = spec;
            specCount++;
            break;
          }
        }
      }
    }
  }

  return picked;
}

/** Attach the score + reasons onto a row so they flow into report_json via the existing spreads. */
export function withMatchMeta(s: Scored): Row {
  return { ...s.row, match_score: s.score, match_reasons: s.reasons };
}

/** Canonical person-name key for de-duping near-identical mentors ("Sarah Chen" / "Dr. Sarah Chen"). */
export function normalizePersonName(name: string): string {
  return (name || "")
    .toLowerCase()
    .replace(/^(dr|prof|mr|mrs|ms|miss)\.?\s+/i, "")
    .replace(/[^a-z\s]/g, "")
    .trim()
    .split(/\s+/)
    .join(" ");
}

/**
 * Merge two candidate pools (e.g. array-overlap `primary` + semantic `secondary`),
 * dedupe by id (primary wins), then rank the UNION through the rebalanced scorer +
 * selection rules. This is the key to making the rebalance govern: semantic search
 * contributes RECALL (extra candidates) while scoreRow/selectTopN decide the final
 * ORDER — so a relevant specialist surfaced by either path beats a generalist
 * surfaced by either path, instead of "whichever path ran first" winning.
 */
export function mergeAndRerank(
  primary: Row[],
  secondary: Row[],
  opts: ScoreOpts,
  ctx: MatchContext,
  limit: number,
  select: SelectOpts = {},
): Row[] {
  const byId = new Map<string, Row>();
  const idless: Row[] = [];
  for (const r of [...(primary || []), ...(secondary || [])]) {
    const id = r && r.id != null ? String(r.id) : "";
    if (!id) { idless.push(r); continue; }
    if (!byId.has(id)) byId.set(id, r);
  }
  const union = [...byId.values(), ...idless];
  return selectTopN(scoreAndSort(union, opts, ctx), limit, select).map(withMatchMeta);
}
