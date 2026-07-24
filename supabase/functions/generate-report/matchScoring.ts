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

import { normalizeCountry } from "./countryNormalize.ts";
import { countServiceMatches } from "./serviceMatch.ts";

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
  /** MES-148 Phase 5 (P5-2): when true, a row's steward-scored data_health nudges
   *  its rank (fresh/complete rows up, stale ones down). Off by default; a NULL
   *  data_health is always neutral, so this is inert until the steward populates it. */
  freshnessEnabled?: boolean;
  /** MES-186 / MES-232: when true, a focused BUYER-industry row earns a specialist-
   *  parity bonus on `applySellsTo` surfaces (events/content/leads), so a conference
   *  where the entrant's CUSTOMERS gather ranks near one for the entrant's OWN
   *  industry. Off by default; inert on non-applySellsTo surfaces (advisory/supply). */
  buyerParityEnabled?: boolean;
}

// Freshness is a TIEBREAKER, not a dominant signal — capped below the target-region
// bonus (+2) so it reorders near-equal rows without burying a strong industry/corridor
// match under a merely-fresher generalist. data_health is 0–100, neutral at 50.
const FRESHNESS_MAX = 1.5;
export function freshnessDelta(dataHealth: unknown): number {
  if (typeof dataHealth !== "number" || !Number.isFinite(dataHealth)) return 0;
  const clamped = Math.max(0, Math.min(100, dataHealth));
  const raw = ((clamped - 50) / 50) * FRESHNESS_MAX;
  return Number(raw.toFixed(2));
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

// MES-186 / MES-232: buyer-side specialist parity. On buyer-facing (`applySellsTo`)
// surfaces a focused BUYER-industry row earns a bonus equal to the own-industry
// SPECIALIST_BONUS, so a premium conference for the entrant's CUSTOMERS ranks near
// one for the entrant's own vertical instead of being outscored by generic
// same-industry meetups (Floats: Talent X/RCSA + HR & L&D Tech Fest were buried).
// Equal magnitude is deliberate: the sells-to base unit (+2, diminishing base 2) is
// already one below the own-industry base (+3), so even with matching bonuses an
// own-industry specialist (3+2=5) still edges a buyer specialist (2+2=4) — parity
// makes the buyer event competitive, not dominant. Gated by ctx.buyerParityEnabled
// (default off) and only applied when opts.applySellsTo.
const BUYER_SPECIALIST_BONUS = 2;

// A row that claims a large share of the 20-sector taxonomy isn't a genuine
// specialist in any of them — it's "matches everyone" noise (Stage 7 bug B8: a
// marketing association tagged across 8 sectors surfaced for an HR-fintech). The
// directory bears this out — genuine rows average ~3 tags, so 5+ is generalist
// territory. Lowered 6→5 after a live report (Infact, a credit fintech) surfaced
// the Australian Agritech Association at score 8.0: 5 tags — its defining vertical
// is farming/agritech, but it ALSO carries financial-services + professional-services
// + technology, so it "industry match ×3"-ed the fintech purely on broad umbrella
// tags and, sitting one under the old threshold of 6, still won the specialist bonus.
// Blast radius of 5 (measured): +14 innovation hubs / +38 investors / +2 agencies
// newly treated as broad (service_providers carry no tags — unaffected). For these a
// sector overlap is weak evidence of focus, so score it as flat "broad overlap" (a
// single unit, no breadth accumulation) and deny the specialist bonus — focused
// matches then rank above it. On the providers/innovation/investor surfaces this is
// ranking-only: the row is not dropped (a thin section still backfills it), so a
// genuinely-relevant broad row still appears, just lower. NOTE: the events surface
// additionally gates on hasSectorRelevance via preferRelevant() — a demoted row now
// reads as "broad overlap" (not "industry match"), so when ≥minKeep focused events
// exist a demoted event can be excluded, not merely reranked. That's aligned with
// preferRelevant's purpose (shed weak/broad matches when focused ones exist) and
// backfill still guarantees the section fills, but it IS a drop on that surface.
const OVERTAG_THRESHOLD = 5;

// Horizontal catch-all sectors. Nearly every SaaS / consulting / tech company maps
// into these, so an overlap that consists ONLY of them says "generically business/
// tech adjacent" — not "same vertical". (Novade report, 7 Jul 2026: the Space
// Industry Association and the Information Security Association out-specialist-ed
// construction advisories for a construction-tech SaaS purely via technology +
// professional-services; the taxonomy has no space/infosec/construction-tech
// vertical, so re-tagging can't fix it — the signal itself is weak.)
//
// The demotion needs BOTH conditions, or it over-fires:
//   (a) the row's overlap with the user is exclusively horizontal, AND
//   (b) the row carries at least one vertical tag that does NOT match the user —
//       positive evidence its real focus is a DIFFERENT vertical (SIAA's education/
//       government tags; a banking body's financial-services for a non-fintech).
// Without (b), a row tagged only [technology] — a genuinely tech-focused mentor —
// would be demoted for a tech company, which is exactly backwards. Such a row has
// no foreign vertical, so it keeps its specialist standing. Vertical-inclusive
// matches (BlueChilli's construction tag for Novade) are untouched by (a).
// Demoted rows score like over-tagged ones: flat broad unit, no specialist bonus.
const HORIZONTAL_SECTORS = new Set<string>([
  "technology-information-and-media",
  "professional-services",
  "administrative-and-support-services",
]);

export function scoreRow(row: Row, opts: ScoreOpts, ctx: MatchContext): Scored {
  const tags: string[] = row.sector_tags || [];
  const reasons: string[] = [];
  let s = 0;

  // Over-tagged (but not explicitly agnostic) → treat a match as broad, not specialist.
  const overTagged = !row.sector_agnostic && tags.length >= OVERTAG_THRESHOLD;

  const userSet = new Set(ctx.userSectors);
  const matchedOwn = tags.filter((t) => userSet.has(t));
  const ownMatches = matchedOwn.length;
  // (a) overlap is exclusively horizontal; (b) the row has a foreign vertical.
  const horizontalOnly = !row.sector_agnostic && ownMatches > 0 &&
    matchedOwn.every((t) => HORIZONTAL_SECTORS.has(t)) &&
    tags.some((t) => !HORIZONTAL_SECTORS.has(t) && !userSet.has(t));

  // Buyer-side (sells-to) overlap + its own horizontal-only guard, mirroring the
  // own-industry logic (MES-186 A). A "foreign vertical" here is a non-horizontal
  // tag matching NEITHER the buyer NOR the user's own sectors — positive evidence
  // the row's real focus is a different vertical, so it doesn't earn buyer parity.
  const sellsToSet = new Set(ctx.sellsToSectors);
  const matchedBuyer = tags.filter((t) => sellsToSet.has(t));
  const buyerMatches = matchedBuyer.length;
  const buyerHorizontalOnly = !row.sector_agnostic && buyerMatches > 0 &&
    matchedBuyer.every((t) => HORIZONTAL_SECTORS.has(t)) &&
    tags.some((t) => !HORIZONTAL_SECTORS.has(t) && !sellsToSet.has(t) && !userSet.has(t));

  if (ownMatches > 0) {
    const broadOnly = overTagged || horizontalOnly;
    const add = broadOnly ? 1 : diminishing(ownMatches, 3, 1);
    s += add;
    reasons.push(overTagged
      ? `broad sector overlap ×${ownMatches} (+${add})`
      : horizontalOnly
        ? `horizontal-only overlap ×${ownMatches} (+${add})`
        : `industry match ×${ownMatches} (+${add})`);
  }

  if (opts.applySellsTo) {
    if (buyerMatches > 0) {
      const add = overTagged ? 1 : diminishing(buyerMatches, 2, 1);
      s += add;
      reasons.push(overTagged
        ? `broad sells-to overlap ×${buyerMatches} (+${add})`
        : `sells-to sector ×${buyerMatches} (+${add})`);
    }
    // Buyer specialist parity (MES-186 A): a focused buyer-industry row (sector-
    // specific, not over-tagged, not horizontal-only) is a genuine "where my buyers
    // gather" match — award it the parity bonus so it ranks near an own-industry
    // specialist rather than under generic same-industry meetups. Gated (default off).
    const buyerSpecialist =
      !row.sector_agnostic && !overTagged && !buyerHorizontalOnly && buyerMatches > 0;
    if (ctx.buyerParityEnabled && buyerSpecialist) {
      s += BUYER_SPECIALIST_BONUS;
      reasons.push(`buyer-industry specialist (+${BUYER_SPECIALIST_BONUS})`);
    }
  }

  if (opts.service) {
    // Token overlap, not exact string equality: the row's services/specialties are
    // free text ("Deal Advisory & Infrastructure"), the goal tags are canonical
    // ("Advisory") — exact-contains only rewarded rows that happened to use the
    // bare canonical word, one driver of the same-slate problem. See serviceMatch.ts.
    const k = countServiceMatches(row[opts.service] || [], ctx.serviceTags);
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
  // bury under generalists. An over-tagged row claims too many sectors to count as
  // focused; a horizontal-only overlap is focused on the WRONG vertical (see
  // HORIZONTAL_SECTORS above), so it doesn't count either.
  const specialist = !row.sector_agnostic && !overTagged && !horizontalOnly && ownMatches > 0;
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

  // MES-148 Phase 5 (P5-2): steward-scored freshness tiebreaker. Inert when the flag
  // is off or data_health is NULL (not yet scored) — so this ships as a no-op.
  if (ctx.freshnessEnabled) {
    const fd = freshnessDelta(row.data_health);
    if (fd !== 0) {
      s += fd;
      reasons.push(`data health ${row.data_health}/100 (${fd > 0 ? "+" : ""}${fd})`);
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
 * True when an entity's identity is dominated by immigration / visa / relocation /
 * global-mobility expertise. Used to demote such rows for DOMESTIC-origin companies
 * (an Australian startup needs neither a visa mentor nor an immigration service
 * provider — Floats feedback: "Head of Community, Techvisa" as a mentor AND the
 * "TechVisa" business-immigration provider both surfaced for a domestic startup).
 * Reads every identity/tag field present on either a mentor row (name/title/company/
 * specialties) or a provider card (name/tags/services/description); paired with
 * preferRelevant() so the demotion is floor-guarded (a thin pool still renders).
 */
// "sponsorship" alone is too broad on the provider surface (services/description can
// say "event sponsorship"/"brand sponsorship") — scope it to the immigration sense
// (employer/visa/work sponsorship). TechVisa still matches via "immigration" +
// "employer sponsorship" (QA follow-up on the provider immigration filter).
const IMMIGRATION_RE = /\b(visa|visas|immigration|relocation|global mobility|work permit|(?:employer|visa|work) sponsorship|migrant)\b/i;
export function isImmigrationFocused(row: Row): boolean {
  const r = row as any;
  const parts: string[] = [
    typeof r?.name === "string" ? r.name : "",
    typeof r?.title === "string" ? r.title : "",
    typeof r?.company === "string" ? r.company : "",
    typeof r?.subtitle === "string" ? r.subtitle : "",
    typeof r?.description === "string" ? r.description : "",
    Array.isArray(r?.specialties) ? r.specialties.join(" ") : "",
    Array.isArray(r?.services) ? r.services.join(" ") : "",
    Array.isArray(r?.tags) ? r.tags.join(" ") : "",
  ];
  return IMMIGRATION_RE.test(parts.join(" "));
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

/**
 * ICP tokens for the lead-list relevance gate: a purchasable lead list should
 * match who the company SELLS TO. Prefer the declared end-buyer industries (the
 * true ICP); fall back to the company's own sector as a proxy ONLY when no
 * buyer signal was given. Paired with a STRICT filter (no floor-backfill) so an
 * unmatched list is dropped, not padded in — the Floats report surfaced
 * "Recently Funded Australian Startups" purely as count-filler. Returns [] only
 * when neither signal exists (caller then shows nothing → the custom-list
 * request box is the escape hatch).
 *
 * MES-231: `sellsToAll` is the explicit "we sell to every industry" sentinel (a
 * horizontal seller like Swoop Funding — lends to all businesses). When set, the
 * own-sector fallback is SUPPRESSED — an empty buyer ICP then means "match every
 * industry" (leadMatchesIcp returns true for all), not "gate to my own sector".
 * Without this, a sector-agnostic lender's lead lists were wrongly narrowed to
 * its OWN vertical (finding 3). Default false → today's fall-back behaviour.
 */
export function leadIcpTokens(
  endBuyerIndustries: string[],
  industrySector: string[],
  sellsToAll = false,
): string[] {
  const buyer = industryTokens(endBuyerIndustries || []);
  if (buyer.length) return buyer;
  if (sellsToAll) return [];
  return industryTokens(industrySector || []);
}

/**
 * True when a lead_databases row matches the ICP tokens (its sector/tags/title/
 * short_description contain any token). The single predicate for the lead ICP
 * gate — applied on BOTH the array-overlap path AND at the post-merge union, so
 * the semantic path (lead_databases is embedded, and is merged semantic-first)
 * can't reintroduce off-ICP lists the overlap gate dropped. Empty tokens → true
 * (no ICP signal → don't gate; matches the overlap path's `=== 0 || pass`).
 */
export function leadMatchesIcp(
  row: { sector?: unknown; tags?: unknown; title?: unknown; short_description?: unknown },
  icpTokens: string[],
): boolean {
  if (!icpTokens || icpTokens.length === 0) return true;
  return textMatchesAnyToken(
    [row?.sector as string, row?.tags as string[], row?.title as string, row?.short_description as string],
    icpTokens,
  );
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
