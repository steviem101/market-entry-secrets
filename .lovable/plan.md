
## Goal
Verify the **Domain property** `marketentrysecrets.com` in Google Search Console and make sure all SEO signals (canonical URLs, og:url, sitemap) point at the custom domain instead of `market-entry-secrets.lovable.app`.

## Part 1 — Verify domain ownership (DNS TXT)

Google's Domain property verification is **DNS-only** — it cannot be done via a meta tag on the Lovable app. You must add the TXT record at your domain registrar:

- **Type:** TXT
- **Host / Name:** `@` (root of marketentrysecrets.com)
- **Value:** `google-site-verification=VkM7HgzIoMLoiNOops0Ymd-WbngpPfR84u0xN0ObGVU`
- **TTL:** default (e.g. 3600)

Steps:
1. Log into the registrar where marketentrysecrets.com is managed (or if the domain was bought through Lovable: Project Settings → Domains → ⋯ → Configure → Manage DNS records).
2. Add the TXT record above alongside your existing A / TXT records — do not remove the Lovable A record (`185.158.133.1`) or the `_lovable` TXT.
3. Wait 5–30 min for propagation, then click **Verify** in the GSC dialog.

Nothing in the codebase needs to change for verification itself — that's why the DNS method is preferred over the meta-tag/URL-prefix method.

## Part 2 — Point SEO at the custom domain

Currently the codebase hardcodes the Lovable preview host as the canonical origin in several places. To make Google index `marketentrysecrets.com` as the primary URL:

### Files to update
1. **`src/lib/publishedOrigin.ts`** — change `CANONICAL_ORIGIN` from `https://market-entry-secrets.lovable.app` to `https://marketentrysecrets.com`, and update the preview-host check so the lovable.app host is now treated as a preview (redirects canonical to the custom domain).
2. **`index.html`** — update `<link rel="canonical">`, `og:url`, and any absolute URLs in JSON-LD/meta to `https://marketentrysecrets.com/`.
3. **`public/robots.txt`** — change `Sitemap:` line to `https://marketentrysecrets.com/sitemap.xml`.
4. **Sitemap** — if `scripts/generate-sitemap.ts` or `public/sitemap.xml` uses the lovable.app host, change `BASE_URL` to `https://marketentrysecrets.com`.
5. **`src/components/common/SEOHead.tsx`** — already uses `publishedOrigin()`, so it will pick up the change automatically. Same for `CountryStructuredData` and any other Helmet consumers.

### Consequences to know
- Lovable will still serve the app on both `market-entry-secrets.lovable.app` and `marketentrysecrets.com`. After this change, the lovable.app URL will emit canonical tags pointing to the custom domain, telling Google to consolidate ranking signals on `marketentrysecrets.com` — this is the recommended setup.
- Existing indexed lovable.app URLs will gradually be replaced in Google's index over a few weeks.
- Optional: add a 301 redirect from lovable.app → custom domain in Lovable's domain settings (Primary domain) so users also end up on the custom domain.

### Not doing
- No content or route changes.
- No changes to Supabase, edge functions, or Stripe redirect URLs (those use `FRONTEND_URL` env).
- Not switching verification from Domain property to URL-prefix — Domain property is strictly better (covers http/https, all subdomains, all paths).

## Recommendation
Do both parts. Part 1 unlocks GSC data for the custom domain today; Part 2 ensures Google actually starts ranking `marketentrysecrets.com` as the primary URL rather than the lovable.app subdomain.
