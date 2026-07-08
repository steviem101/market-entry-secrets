/**
 * Competitor discovery query-building + result de-duplication.
 *
 * Pure module (no Deno globals / I/O) so it's unit-testable under `node --test`,
 * like keyPageSelect.ts / matchScoring.ts. The legacy competitor search fired a
 * single generic "<sector> companies in Australia competitors" query and kept the
 * top 3 — thin (a Daon report surfaced only 2 discovered competitors). These
 * helpers build a few angled queries and dedupe the combined results by domain.
 */

interface KnownCompetitor {
  name?: string | null;
  website?: string | null;
}

interface CompetitorIntake {
  industry_sector?: string[] | null;
  target_regions?: string[] | null;
  company_name?: string | null;
  known_competitors?: Array<KnownCompetitor | string> | null;
}

/** Trimmed, non-empty known-competitor names (max 3) — the user-declared category. */
function knownCompetitorNames(intake: CompetitorIntake): string[] {
  return (intake.known_competitors || [])
    .map((c) => (typeof c === "string" ? c : c?.name) || "")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
}

/**
 * Angled competitor-discovery queries from the intake. The legacy angles keyed
 * only off the broad `industry_sector` string ("FinTech, Financial Services"),
 * which pulls sector-ECOSYSTEM companies (accelerators, recruiters, dev shops)
 * rather than the company's actual product competitors (an Infact report surfaced
 * an employer-branding platform as a "competitor"). The highest-precision fix is
 * to define the competitor category BY EXAMPLE from the user's own declared
 * `known_competitors` (e.g. "Equifax, Experian" → other credit bureaus). That
 * angle is prepended so it wins the discovery cap; the sector angles remain for
 * breadth (and as the sole angle when no known competitors were provided, keeping
 * legacy behaviour for thin intakes). Deduped, empties dropped, capped at 3.
 */
export function buildCompetitorQueries(intake: CompetitorIntake): string[] {
  const sector = (intake.industry_sector || []).join(", ").trim();
  const regions = (intake.target_regions || []).join(", ").trim() || "Australia";
  const company = (intake.company_name || "").trim();
  const known = knownCompetitorNames(intake);

  const queries: string[] = [];
  // Precision angle first: the declared competitors define the true product niche.
  if (known.length) queries.push(`companies like ${known.join(", ")} in Australia ${regions}`);
  if (sector) queries.push(`${sector} companies in Australia ${regions} competitors`);
  if (company) queries.push(`alternatives to ${company} Australia`);
  if (sector) queries.push(`top ${sector} vendors Australia`);

  return [...new Set(queries.filter((q) => q.trim().length > 0))].slice(0, 3);
}

/**
 * Self-disqualifying language a discovered "competitor" sometimes carries in its
 * OWN extracted description — service agencies, dev shops, recruiters, and
 * employer-branding/talent platforms the discovery angle drags in, which the
 * extraction LLM then honestly labels as not-really-competitors ("Not a technical
 * competitor in credit data"; "service-based firm rather than a product-based
 * ..."). A card/prose entry that admits it isn't a competitor is pure noise.
 * Deliberately conservative — only explicit self-disqualifying phrases, so a
 * genuine competitor is never dropped.
 */
const NON_COMPETITOR_RE =
  /\bnot a (?:direct |technical |real )?competitor\b|\bservice[- ]based (?:firm|company|business) rather than\b|\bemployer[- ]branding\b|\b(?:recruitment|staffing) (?:agency|firm)\b/i;

/** True if the combined text explicitly self-disqualifies as a competitor. Pure. */
export function isNonCompetitor(text: string): boolean {
  return NON_COMPETITOR_RE.test(text || "");
}

interface CompetitorTextLike {
  description?: unknown;
  key_info?: unknown;
}

/**
 * Drop discovered competitors whose own extracted text self-disqualifies (see
 * isNonCompetitor). Apply ONLY to discovered rows — never to user-declared known
 * competitors, which are trusted by definition. Pure.
 */
export function dropNonCompetitors<T extends CompetitorTextLike>(rows: T[] | null | undefined): T[] {
  return (rows || []).filter(
    (r) => !isNonCompetitor(`${String(r?.description ?? "")} ${String(r?.key_info ?? "")}`),
  );
}

/** Normalise a URL to its host for dedupe/exclusion (drops scheme, www, case). */
export function domainOf(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`)
      .hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

interface SearchResult { url?: string }

/**
 * From combined search results: drop the user's own domain + any known-competitor
 * domains, dedupe by domain (first occurrence wins), and cap. Pure.
 */
export function dedupeCompetitorResults<T extends SearchResult>(
  results: T[] | null | undefined,
  excludeDomains: string[],
  cap: number,
): T[] {
  const exclude = new Set(excludeDomains.map((d) => d.toLowerCase()).filter(Boolean));
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of results || []) {
    const d = domainOf(r.url || "");
    if (!d || exclude.has(d) || seen.has(d)) continue;
    seen.add(d);
    out.push(r);
    if (out.length >= Math.max(0, cap)) break;
  }
  return out;
}
