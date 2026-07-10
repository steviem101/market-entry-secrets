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
 *
 * `notFound` marks the page as a true 404 for the crawler-rendering layer
 * (MES-83): Prerender reads the `prerender-status-code` meta and returns a
 * real HTTP 404 to crawlers instead of a noindexed 200 shell. Use it ONLY on
 * not-found branches — never on private-but-real pages (dashboard, reports),
 * which are noindexed yet must stay 200 for the humans who own them. Inert
 * until a page is prerendered; the robots directives above remain the
 * fallback for un-rendered crawls.
 */
export const NoIndex = ({ notFound = false }: { notFound?: boolean }) => (
  <Helmet>
    <meta name="robots" content="noindex, nofollow" />
    <meta name="googlebot" content="noindex, nofollow" />
    {notFound && <meta name="prerender-status-code" content="404" />}
  </Helmet>
);
