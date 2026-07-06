/**
 * Target-region expansion for provider/event location matching (Stage 7 bug B13).
 *
 * Pure module — NO Deno globals, NO I/O — importable by the edge function AND
 * unit-tested under Node (`node --test`), like matchScoring.ts / geoRelevance.ts.
 *
 * Why it exists: `deriveLocationPatterns` used to take only `region.split("/")[0]`,
 * so a target of "Sydney/NSW" collapsed to just ["sydney"] — the state half was
 * discarded, so a provider listed as "Parramatta, New South Wales" earned no
 * target-region credit — and "National" became a bare "national" token that a
 * naive `location.includes()` would false-match inside "inter**national**".
 *
 * expandTargetRegions() splits every segment, expands AU state abbreviations to
 * their full names (and keeps the safe 3-letter codes), and drops nation-wide /
 * generic words that name no specific region. Every emitted token is >= 3 chars so
 * the includes()-based scorer can't false-match on a 2-letter code ("sa" inside
 * "Pasadena, USA") — the risky 2-letter states survive only as their full name.
 */

const AU_STATES: Record<string, string> = {
  nsw: "new south wales",
  vic: "victoria",
  qld: "queensland",
  wa: "western australia",
  sa: "south australia",
  tas: "tasmania",
  act: "australian capital territory",
  nt: "northern territory",
};

// Words that name no specific city/region — a report targeting "Australia" or
// "National" has no city to prefer, so these contribute no location signal.
const GENERIC = new Set<string>([
  "national", "nationwide", "australia", "australian", "australia wide",
  "anz", "australia and new zealand", "global", "worldwide", "international",
  "various", "multiple", "all", "any", "remote", "online", "anywhere",
  "apac", "asia pacific", "oceania",
]);

/**
 * Expand the intake's target_regions into lowercased location tokens for both the
 * candidate query (`location ilike`) and the scorer's target-region bonus. Splits
 * on "/", "," and "&"; maps state abbreviations to full names; drops generic
 * nation-wide words; emits only tokens >= 3 chars; de-duplicates.
 */
export function expandTargetRegions(regions: string[] | null | undefined): string[] {
  const out = new Set<string>();
  const add = (t: string) => { if (t.length >= 3) out.add(t); };
  for (const raw of regions || []) {
    for (const part of String(raw ?? "").split(/[/,&]/)) {
      const t = part.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
      if (!t || GENERIC.has(t)) continue;
      if (AU_STATES[t]) {          // abbreviation → always add full name, keep 3-letter code
        out.add(AU_STATES[t]);
        add(t);
        continue;
      }
      add(t);                      // city or full state name
    }
  }
  return [...out];
}
