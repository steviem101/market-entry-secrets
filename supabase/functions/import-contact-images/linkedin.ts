// MES-123 — LinkedIn URL normalisation (pure, Deno/Node-agnostic — unit-tested).
//
// Canonical form: linkedin.com/in/<slug> (no protocol, no www/country subdomain, no query,
// no trailing slash, lowercased). Used as the primary join key on both sides of the match, so
// the same person exported by Lemlist or PhantomBuster in any URL shape collapses to one key.

/**
 * Normalise a LinkedIn profile URL to `linkedin.com/in/<slug>`, or null if it is not a
 * recognisable personal profile URL (company pages, /pub/ legacy, junk, empty all -> null).
 */
export function normalizeLinkedInUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = String(raw).trim().toLowerCase();
  if (!s) return null;

  // Strip scheme.
  s = s.replace(/^https?:\/\//, "");
  // Strip everything from the first ? or # (query params, fragments).
  s = s.replace(/[?#].*$/, "");
  // Collapse any leading subdomains (www., uk., de., au., etc.) down to linkedin.com.
  s = s.replace(/^([a-z0-9-]+\.)*linkedin\.com/, "linkedin.com");
  // Trim a leading slash left after subdomain oddities and any trailing slashes.
  s = s.replace(/\/+$/, "");

  // Must be a personal profile: linkedin.com/in/<slug>. Capture the slug segment only.
  const m = s.match(/^linkedin\.com\/in\/([^/]+)/);
  if (!m || !m[1]) return null;

  return `linkedin.com/in/${m[1]}`;
}

/** Lowercased, whitespace-collapsed key for email / name / company comparisons. */
export function normalizeKey(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase().replace(/\s+/g, " ");
  return s || null;
}
