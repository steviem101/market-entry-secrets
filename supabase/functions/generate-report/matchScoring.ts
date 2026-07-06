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

// A row that claims a large share of the 20-sector taxonomy isn't a genuine
// specialist in any of them — it's "matches everyone" noise (Stage 7 bug B8: a
// marketing association tagged across 8 sectors surfaced for an HR-fintech). The
// directory bears this out — genuine rows average ~3 tags, so 6+ is generalist
// territory (yet 31 investors / 13 innovation hubs / 11 agencies carry 6+ WITHOUT
// the sector_agnostic flag). For these, a sector overlap is weak evidence of focus,
// so score it as flat "broad overlap" (a single unit, no breadth accumulation) and
// deny the specialist bonus — focused matches then rank above it. Ranking-only; the
// row is not dropped (a thin section still backfills it).
const OVERTAG_THRESHOLD = 6;

export function scoreRow(row: Row, opts: ScoreOpts, ctx: MatchContext): Scored {
  const tags: string[] = row.sector_tags || [];
  const reasons: string[] = [];
  let s = 0;

  // Over-tagged (but not explicitly agnostic) → treat a match as broad, not specialist.
  const overTagged = !row.sector_agnostic && tags.length >= OVERTAG_THRESHOLD;

  const ownMatches = overlapCount(tags, ctx.userSectors);
  if (ownMatches > 0) {
    const add = overTagged ? 1 : diminishing(ownMatches, 3, 1);
    s += add;
    reasons.push(overTagged
      ? `broad sector overlap ×${ownMatches} (+${add})`
      : `industry match ×${ownMatches} (+${add})`);
  }

  if (opts.applySellsTo) {
    const sellMatches = overlapCount(tags, ctx.sellsToSectors);
    if (sellMatches > 0) {
      const add = overTagged ? 1 : diminishing(sellMatches, 2, 1);
      s += add;
      reasons.push(overTagged
        ? `broad sells-to overlap ×${sellMatches} (+${add})`
        : `sells-to sector ×${sellMatches} (+${add})`);
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

  // Target-region match (B13): the row's location names the report's specific target
  // city/region (e.g. Sydney/NSW). Worth +2 — a meaningful prioritisation of the
  // target market, roughly one service-fit unit — so a same-region provider clusters
  // with (not below) an out-of-region one that happens to match one more service.
  // It never DROPS an out-of-region AU row (the geo gate already keeps all in-market
  // providers); it only reorders. `locationPatterns` are the specific target regions
  // only (nation-wide words are excluded upstream), so this is a target signal, not a
  // generic "is in Australia" one.
  const loc = (row.location || "").toLowerCase();
  if (ctx.locationPatterns.some((l) => l && loc.includes(l.toLowerCase()))) {
    s += 2;
    reasons.push("target region (+2)");
  }

  // Specialist: a sector-SPECIFIC (not agnostic, not over-tagged) row that matches the
  // user's own industry — the genuine domain expert the breadth-driven scorer used to
  // bury under generalists. An over-tagged row claims too many sectors to count as focused.
  const specialist = !row.sector_agnostic && !overTagged && ownMatches > 0;
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
  const release = (s: Scored): void => {
    dedupeKeys.forEach((dk, i) => {
      const k = dk.keyOf(s.row);
      if (k) counts[i].set(k, Math.max(0, (counts[i].get(k) ?? 0) - 1));
    });
  };

  const picked: Scored[] = [];
  for (const s of scored) {
    if (picked.length >= limit) break;
    if (fits(s)) { picked.push(s); take(s); }
  }

  // Guarantee a minimum number of genuine specialists WITHOUT breaking the diversity
  // caps. Evict the lowest-scored non-specialist whose removal lets the incoming
  // specialist satisfy every cap — so a swap never creates a 3rd row from one org or a
  // duplicate person (the guarantees these caps exist for). `counts` stays in sync via
  // release()/take() so a swapped-in row is validated exactly like a greedily-picked one.
  // If no eviction lets a specialist fit, keep fewer specialists rather than violate a cap.
  const minSpec = opts.minSpecialists ?? 0;
  if (minSpec > 0) {
    let specCount = picked.filter((p) => p.specialist).length;
    if (specCount < minSpec) {
      const pickedRows = new Set(picked.map((p) => p.row));
      const unpickedSpecs = scored.filter((s) => s.specialist && !pickedRows.has(s.row));
      for (const spec of unpickedSpecs) {
        if (specCount >= minSpec) break;
        for (let i = picked.length - 1; i >= 0; i--) {
          if (picked[i].specialist) continue;
          release(picked[i]);          // tentatively drop the lowest-scored generalist
          if (fits(spec)) {
            take(spec);
            picked[i] = spec;
            specCount++;
            break;
          }
          take(picked[i]);             // didn't let spec fit — restore it and keep scanning
        }
      }
    }
  }

  // A swap can leave a lower-scored specialist where a higher-scored generalist sat;
  // restore best-first order (deterministic tiebreak by id, matching scoreAndSort).
  picked.sort((a, b) => (b.score - a.score) || String(a.row.id || "").localeCompare(String(b.row.id || "")));
  return picked;
}

/** Attach the score + reasons onto a row so they flow into report_json via the existing spreads. */
export function withMatchMeta(s: Scored): Row {
  return { ...s.row, match_score: s.score, match_reasons: s.reasons };
}

/**
 * Relevance gate (report-quality loop, refs d6a6ce3d / b29b88c1).
 *
 * Keep every row that `isRelevant`, but NEVER empty a section: if fewer than
 * `minKeep` rows are relevant, backfill with the (already-ranked) non-relevant rows
 * up to `minKeep`. So when a healthy set of genuinely on-target rows exists the weak
 * ones (sector-agnostic / location-only matches like a fitness expo for a cyber
 * company) drop out; when the directory is thin the old behaviour is preserved.
 * Pure + order-preserving (input must already be best-first).
 */
export function preferRelevant<T>(rows: T[], isRelevant: (r: T) => boolean, minKeep: number): T[] {
  const rel: T[] = [], weak: T[] = [];
  for (const r of rows || []) (isRelevant(r) ? rel : weak).push(r);
  if (rel.length >= minKeep) return rel;
  return [...rel, ...weak.slice(0, Math.max(0, minKeep - rel.length))];
}

/**
 * Did this ranked row earn a genuine industry / sells-to sector match (vs. surfacing
 * only via sector_agnostic or a location bonus)? Reads the explainable `match_reasons`
 * that withMatchMeta() attaches, so it works on decorated rows for surfaces that carry
 * sector_tags (events, content).
 */
export function hasSectorRelevance(row: Row): boolean {
  const reasons: string[] = row?.match_reasons || [];
  return reasons.some((r) => r.startsWith("industry match") || r.startsWith("sells-to sector"));
}

/**
 * Free-text relevance for surfaces WITHOUT sector_tags (lead_databases carry a `sector`
 * string + `tags[]` instead, so scoreRow is blind to their industry). True when any of
 * the row's text fields contains any of the supplied industry tokens. Case-insensitive,
 * token must be >= 3 chars to avoid spurious substring hits.
 */
export function textMatchesAnyToken(haystackParts: Array<string | string[] | null | undefined>, tokens: string[]): boolean {
  const hay = haystackParts
    .flatMap((p) => (Array.isArray(p) ? p : [p]))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (!hay) return false;
  return tokens.some((t) => t && t.length >= 3 && hay.includes(t.toLowerCase()));
}

/** Lowercased word/slug tokens from human industry labels, for textMatchesAnyToken. */
export function industryTokens(labels: string[]): string[] {
  const out = new Set<string>();
  for (const label of labels || []) {
    const l = (label || "").trim().toLowerCase();
    if (l.length >= 3) out.add(l);
    for (const w of l.split(/[\s/&,]+/)) {
      // skip noise words that would match almost anything
      if (w.length >= 4 && !["and", "the", "services", "industry", "other"].includes(w)) out.add(w);
    }
  }
  return [...out];
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
 * Stable de-dupe by a derived key, first occurrence wins. Used when one report section
 * concatenates several already-ranked pools that can name the SAME organisation (e.g. a
 * body listed both as a service provider and a trade/government agency). Rows whose key
 * is empty are kept as-is (never collapsed together).
 */
export function dedupeByKey<T>(rows: T[], keyOf: (r: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of rows || []) {
    const k = keyOf(r);
    if (k && seen.has(k)) continue;
    if (k) seen.add(k);
    out.push(r);
  }
  return out;
}

/**
 * Cross-SECTION de-dupe (Stage 7 bug B10). `dedupeByKey` collapses duplicates WITHIN a
 * single section; this collapses them ACROSS sections. Given `groups` ordered by section
 * priority (highest first), it removes from each group any row whose key already appeared
 * in an earlier (higher-priority) group, so the same entity renders in exactly one section.
 *
 * Why it's needed: an accelerator like "Stone & Chalk" lives in innovation_ecosystem AND
 * investors; a person like "Aaron Birkby" is both a mentor and an investor. Without this,
 * they render as cards in two different sections of the same report. First (highest-priority)
 * section keeps the entity. Within-group order is preserved; empty-keyed rows are never
 * collapsed. Pure; returns new arrays (no mutation).
 */
export function pruneAcrossGroups<T>(groups: T[][], keyOf: (r: T) => string): T[][] {
  const seen = new Set<string>();
  return (groups || []).map((group) => {
    const kept: T[] = [];
    for (const r of group || []) {
      const k = keyOf(r);
      if (k && seen.has(k)) continue; // claimed by a higher-priority section
      kept.push(r);
    }
    // Claim this group's keys only AFTER filtering, so an intra-group duplicate isn't
    // dropped here (that's dedupeByKey's job on the section's own combined pool).
    for (const r of kept) {
      const k = keyOf(r);
      if (k) seen.add(k);
    }
    return kept;
  });
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
