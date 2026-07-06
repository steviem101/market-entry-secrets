import { Helmet } from "react-helmet-async";

/**
 * Emits a `noindex, nofollow` robots directive (MES-81 / SEO-05).
 *
 * Drop this into any private / semi-private / not-found route that must never
 * appear in search — member areas, the report views (including shared,
 * private-by-obscurity report URLs), admin, and auth pages. It's additive:
 * SEOHead doesn't emit a robots tag, so a page can render both.
 *
 * Client-side only (react-helmet-async), so it covers JS-rendering crawlers
 * (Googlebot). Non-JS crawlers are covered by the matching X-Robots-Tag rules
 * in public/_headers. Never add this to a public directory/content route — it
 * would deindex a page we want found.
 */
export const NoIndex = () => (
  <Helmet>
    <meta name="robots" content="noindex, nofollow" />
    <meta name="googlebot" content="noindex, nofollow" />
  </Helmet>
);
