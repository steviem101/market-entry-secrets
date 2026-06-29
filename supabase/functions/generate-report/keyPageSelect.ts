/**
 * Prioritised key-page selection for the deep company scrape.
 *
 * Pure module (no Deno globals / I/O) so it's unit-testable under `node --test`,
 * like sectorTaxonomy.ts / matchScoring.ts. The map step returns up to 100 site
 * URLs but we can only afford to scrape a few, so rank them: customer /
 * case-study / pricing pages carry the named-client + positioning detail that
 * grounds the report, which the old "first 2 URLs that matched anything"
 * selection routinely missed (observed: a Gartner-leader vendor's profile came
 * back with key_clients: [] because its /customers page was never scraped).
 */

// Lower tier = higher priority. The first tier a URL matches wins.
const KEY_PAGE_TIERS: Array<{ tier: number; re: RegExp }> = [
  { tier: 1, re: /(customers?|case.?stud|clients?|success.?stor|testimonial)/i },
  { tier: 1, re: /(pricing|plans|packages)/i },
  { tier: 2, re: /(products?|solutions?|services?|platform|capabilit)/i },
  { tier: 2, re: /(about|company|who-we-are|industr)/i },
  { tier: 3, re: /(team|leadership|partners?)/i },
];

/** Normalise to host+path (drop scheme/query/hash/trailing slash) for dedupe. */
function pathKey(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return `${u.host}${u.pathname}`.toLowerCase().replace(/\/+$/, "");
  } catch {
    return url.toLowerCase().trim().replace(/\/+$/, "");
  }
}

function tierOf(url: string): number | null {
  for (const { tier, re } of KEY_PAGE_TIERS) if (re.test(url)) return tier;
  return null;
}

/**
 * Pick up to `max` highest-signal key pages from the mapped URLs: best tier
 * first, original map order preserved within a tier, deduped by host+path.
 * URLs matching no tier (blog/contact/careers/legal/…) are dropped — the bare
 * homepage is scraped separately and matches no tier, so it is never re-selected.
 */
export function selectKeyPages(urls: string[] | null | undefined, max: number): string[] {
  const seen = new Set<string>();
  const ranked: Array<{ url: string; tier: number; idx: number }> = [];
  (urls ?? []).forEach((url, idx) => {
    if (!url) return;
    const tier = tierOf(url);
    if (tier === null) return;
    const key = pathKey(url);
    if (seen.has(key)) return;
    seen.add(key);
    ranked.push({ url, tier, idx });
  });
  ranked.sort((a, b) => a.tier - b.tier || a.idx - b.idx);
  return ranked.slice(0, Math.max(0, max)).map((r) => r.url);
}
