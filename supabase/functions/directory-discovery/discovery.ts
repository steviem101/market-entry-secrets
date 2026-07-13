// MES-148 Phase 5 (P5-4) — discovery-candidate extraction/dedupe (pure, node --test).
//
// The discovery agent web-searches for organisations that could fill an unmet-demand
// gap, then this module turns raw search hits into clean, deduped candidate rows and
// filters ones the directory already has. Pure + total so it's unit-tested under Node
// and reused by the discovery edge function. No I/O, no throwing.

export interface DemandSignalLike {
  term_slug: string;
  term_label: string;
  sample_sectors?: string[] | null;
  sample_regions?: string[] | null;
}

export interface RawHit {
  title?: string | null;
  url?: string | null;
  description?: string | null;
}

export interface Candidate {
  name: string;
  url: string;
  domain: string;
  description: string;
}

// Aggregators / listicles / social — a hit on one of these hosts is almost never the
// organisation itself, so it's not a directory candidate. Matched as a domain suffix.
const JUNK_HOSTS = [
  "wikipedia.org", "linkedin.com", "facebook.com", "twitter.com", "x.com", "instagram.com",
  "youtube.com", "reddit.com", "medium.com", "crunchbase.com", "glassdoor.com", "indeed.com",
  "yelp.com", "trustpilot.com", "clutch.co", "g2.com", "capterra.com", "quora.com",
];

/** Extract the registrable-ish host from a URL: lowercased, no port, no leading "www.".
 *  Returns null for anything unparseable. Total. */
export function normalizeDomain(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  let s = raw.trim();
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const host = new URL(s).hostname.toLowerCase().replace(/^www\./, "");
    // A real org domain has a dot (a TLD). Bare labels ("not-a-url", "localhost")
    // parse as hostnames but are never directory candidates.
    return host && host.includes(".") ? host : null;
  } catch {
    return null;
  }
}

/** Lowercase + collapse whitespace for name-equality dedupe. Total. */
export function normalizeName(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

/** True if a domain is a known aggregator/social host we never treat as a candidate. */
export function isJunkDomain(domain: string | null): boolean {
  if (!domain) return true;
  return JUNK_HOSTS.some((h) => domain === h || domain.endsWith(`.${h}`));
}

/** Trim a search title down to a plausible org name: drop trailing " | site",
 *  " - tagline" and " : …" segments, and clamp length. Total. */
export function cleanName(raw: unknown): string {
  if (typeof raw !== "string") return "";
  let s = raw.trim().split(/\s+[|–—:-]\s+/)[0].trim();
  if (s.length > 120) s = s.slice(0, 120).trim();
  return s;
}

/** Turn a demand signal into a small set of AU-scoped search queries. Deterministic
 *  ordering; empty sector/region context just yields the base query. */
export function buildQueries(signal: DemandSignalLike): string[] {
  const label = (signal.term_label || signal.term_slug || "").trim();
  if (!label) return [];
  const sector = (signal.sample_sectors ?? []).find((s) => typeof s === "string" && s.trim());
  const queries = [
    `${label} service providers for companies expanding to Australia`,
  ];
  if (sector) queries.push(`${label} providers for ${sector} companies entering the Australian market`);
  return queries;
}

/** Map raw hits → clean candidates, dropping junk hosts and de-duplicating by domain
 *  WITHIN this batch (first hit for a domain wins). Deterministic order (input order). */
export function extractCandidates(hits: RawHit[]): Candidate[] {
  const out: Candidate[] = [];
  const seen = new Set<string>();
  for (const h of hits ?? []) {
    if (!h) continue;
    const domain = normalizeDomain(h.url);
    if (!domain || isJunkDomain(domain) || seen.has(domain)) continue;
    const name = cleanName(h.title) || domain;
    seen.add(domain);
    out.push({
      name,
      url: typeof h.url === "string" ? h.url.trim() : `https://${domain}`,
      domain,
      description: typeof h.description === "string" ? h.description.trim().slice(0, 500) : "",
    });
  }
  return out;
}

/** Drop candidates the directory already has — by domain OR by normalised name.
 *  `existingDomains`/`existingNames` are pre-normalised sets from the live directory. */
export function dedupeAgainstExisting(
  candidates: Candidate[],
  existingDomains: Set<string>,
  existingNames: Set<string>,
): Candidate[] {
  return (candidates ?? []).filter((c) =>
    !existingDomains.has(c.domain) && !existingNames.has(normalizeName(c.name))
  );
}
