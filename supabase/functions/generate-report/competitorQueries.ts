/**
 * Competitor discovery query-building + result de-duplication.
 *
 * Pure module (no Deno globals / I/O) so it's unit-testable under `node --test`,
 * like keyPageSelect.ts / matchScoring.ts. The legacy competitor search fired a
 * single generic "<sector> companies in Australia competitors" query and kept the
 * top 3 — thin (a Daon report surfaced only 2 discovered competitors). These
 * helpers build a few angled queries and dedupe the combined results by domain.
 */

interface CompetitorIntake {
  industry_sector?: string[] | null;
  target_regions?: string[] | null;
  company_name?: string | null;
}

/**
 * Angled competitor-discovery queries from the intake. Beyond the generic
 * "companies in Australia" angle, add a category-vendor angle and a named
 * "alternatives to <company>" angle — each surfaces competitors the others miss.
 * Deduped, empties dropped, capped at 3 to bound search cost.
 */
export function buildCompetitorQueries(intake: CompetitorIntake): string[] {
  const sector = (intake.industry_sector || []).join(", ").trim();
  const regions = (intake.target_regions || []).join(", ").trim() || "Australia";
  const company = (intake.company_name || "").trim();

  const queries: string[] = [];
  if (sector) {
    queries.push(`${sector} companies in Australia ${regions} competitors`);
    queries.push(`top ${sector} vendors Australia`);
  }
  if (company) queries.push(`alternatives to ${company} Australia`);

  return [...new Set(queries.filter((q) => q.trim().length > 0))].slice(0, 3);
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
