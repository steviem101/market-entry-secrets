// src/lib/canonicalRedirect.ts
//
// Canonical-URL enforcement for detail pages (MES-80 / SEO-04).
//
// Several detail hooks resolve an entity from either its slug OR a legacy
// UUID / name-based fallback, so the same record is reachable at more than one
// URL — the MES-76 audit found a UUID provider URL held in Google's index.
// Once the entity has loaded we know its canonical slug; if the URL param
// doesn't match, the page redirects to the canonical slug URL so search engines
// only ever see (and index) one URL per entity. Redirects, never 404s, so
// existing bookmarks and shared links keep working.

/**
 * Returns the path to redirect to when `param` isn't the entity's canonical
 * slug, or null when it already is (or when no canonical slug exists — e.g. a
 * legacy record with no slug, which we leave at its current URL rather than
 * redirect to nothing). Callers render `<Navigate to={path} replace />` when
 * this returns a string.
 */
export const canonicalSlugRedirect = (
  param: string | undefined,
  canonicalSlug: string | null | undefined,
  buildPath: (slug: string) => string,
): string | null => {
  if (!param || !canonicalSlug) return null;
  if (param === canonicalSlug) return null;
  return buildPath(canonicalSlug);
};
