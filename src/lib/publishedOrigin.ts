/**
 * Canonical origin used when building absolute URLs that need to resolve
 * outside the current browser session — most notably internal links inside
 * a printed PDF. The print stylesheet hides `a[href^="/"]` URL annotations,
 * so internal links must be absolutized before render or they're dead in
 * the exported document.
 *
 * CLAUDE.md forbids VITE_* env vars (Lovable doesn't support them), so the
 * production host is encoded here as a constant. If the host ever changes,
 * update CANONICAL_ORIGIN below — every consumer (currently just
 * ReportMatchCard) picks it up automatically.
 */

const CANONICAL_ORIGIN = 'https://marketentrysecrets.com';

/**
 * Returns the host this app is "really" served from for the purpose of
 * building absolute URLs in shareable artefacts (PDFs, emails, etc.).
 *
 *   - If we're on the canonical host, return window.location.origin
 *     (preserves protocol/port for unusual deployments).
 *   - If we're on a Lovable preview host (id-preview--*.lovable.app),
 *     localhost, or 127.0.0.1, return the CANONICAL_ORIGIN so a PDF
 *     printed from a preview still resolves links in production.
 *   - SSR / no window: return CANONICAL_ORIGIN.
 */
export const publishedOrigin = (): string => {
  if (typeof window === 'undefined' || !window.location) return CANONICAL_ORIGIN;
  const host = window.location.hostname;
  const isPreview =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.lovable.app') && host !== 'market-entry-secrets.lovable.app';
  return isPreview ? CANONICAL_ORIGIN : window.location.origin;
};
