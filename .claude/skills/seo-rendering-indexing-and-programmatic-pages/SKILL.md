---
name: seo-rendering-indexing-and-programmatic-pages
description: MES crawler rendering strategy (CSR reality, prerender-as-anon rule), canonical/sitemap/noindex conventions, and thin-content guardrails for programmatic directory pages. Use before touching SEOHead, the sitemap function, canonicals, robots/noindex, or detail-page routing.
---

Last verified: 2026-07-07

# SEO, Rendering, Indexing & Programmatic Pages

## Purpose
Keep MES's ~1,400 programmatic pages correctly canonicalised, sitemapped, and (where private)
de-indexed — and make any crawler-rendering work cloaking-safe and leak-safe.

## When to trigger / when NOT to
- **Trigger:** `SEOHead`, `NoIndex`, canonicals, the `sitemap` edge function, `robots.txt`,
  `_redirects`/`_headers`, detail-page not-found branches, JSON-LD, any prerender/SSR proposal.
- **Don't trigger:** content quality/copy (Wave 3 `content-and-vendor-copy`); freshness/expiry
  (Wave 3 `content-freshness-and-seo-ops-loop`).

## Preconditions — inspect first
- `src/components/common/SEOHead.tsx`, `src/lib/publishedOrigin.ts`,
  `src/components/common/NoIndex.tsx`, `supabase/functions/sitemap/index.ts`, `index.html`,
  `public/robots.txt`, `public/_redirects`, `public/_headers`, `src/config/privateRoutes.ts`.
- `docs/audits/seo-discoverability-audit-2026-07-04.md` — **but note many of its fixes have
  shipped** (see pitfalls); verify current state before citing it as broken.

## Reality: pure CSR (verified)
No SSR/prerender in `vite.config.ts`; every path serves the same `index.html` shell (`_redirects`
`/* /index.html 200`). All Helmet-injected metadata/JSON-LD/canonicals appear **only after JS
runs** — non-JS AI crawlers (GPTBot/ClaudeBot/PerplexityBot) see just the static `<head>`. That's
why the `Organization` JSON-LD + OG tags are hardcoded in `index.html:46-58`, not injected.

## Playbook
1. **Canonicals go through `SEOHead`**, which builds `${publishedOrigin()}${canonicalPath}` and
   emits both `og:url` and `link rel=canonical` from it (`SEOHead.tsx:46,61,64`). `publishedOrigin()`
   normalises preview hosts (`localhost`/`*.lovable.app` → the canonical origin). **Do not** hand-
   roll canonicals from `window.location.origin` — ~10 pages still do (MES-111 AUD-037), which
   emits a preview-host canonical on Lovable previews. Prefer routing pages through `SEOHead`.
2. **Never hardcode a page-level canonical in `index.html`.** A static homepage canonical there
   made every route self-declare as a `/` duplicate (SEO-01); it was removed
   (`index.html:15-20`) — keep it removed.
3. **noindex private routes in BOTH layers.** `<NoIndex>` (`meta robots noindex`) covers JS
   crawlers; `public/_headers` `X-Robots-Tag` covers non-JS crawlers. They're kept in lockstep with
   `src/config/privateRoutes.ts` and enforced by `privateRoutes.test.ts` — add a private route to
   **both** or the test fails. Private set: `/report/shared/*`, `/my-reports`, `/dashboard`,
   `/member-hub`, `/bookmarks`, `/auth/*`, `/admin/*`, 404.
4. **Sitemap is DB-driven and runs as ANON** (`sitemap/index.ts:28-29`, `verify_jwt=false`) so RLS
   decides crawler visibility. It reads PII tables via `_public` views, filters case studies to
   `/case-studies/` only (not `/content/`), uses `SITE_ORIGIN` for `<loc>`, caps `MAX_ROWS=50000`,
   caches 1h, and lists a section even if its `lastmod` fails (no whole-index 502). Add a new
   directory → add a section here, read via the anon-safe view, filter to published/active rows.
5. **Prerender rule (if/when bot rendering lands):** the renderer **MUST run as anon** — no
   service-role, no user JWT — so RLS makes teaser-vs-content automatic and cloaking-safe. This is
   the single most important rule for the still-open flagship SEO item; the sitemap function already
   embodies it.
6. **Structured data:** sitewide `Organization` stays static in `index.html`; per-page JSON-LD via
   `SEOHead`'s typed union (`ItemList`, `Event`, `Article`, `Person`, `Place`, `Dataset`, …) — but
   remember it's post-JS, so it doesn't reach non-JS crawlers yet.

## Red flags / approval gates
- A crawler-facing renderer that runs with service-role or a user JWT → cloaking + leak risk.
- Adding a private route to only one of `<NoIndex>` / `_headers` (the test will fail — heed it).
- A sitemap change that reads a base PII table instead of its `_public` view.
- Reintroducing a static canonical in `index.html`.

## Good / bad examples
- ✅ New `/programs` directory: `SEOHead` with canonical + JSON-LD; a `programs` sitemap section
  reading the published rows via anon; `<NoIndex>` only if the page is private.
- ✅ Detail not-found → render `<NoIndex>` (interim) so bad slugs don't get indexed as 200 shells.
- ❌ `<link rel="canonical" href={\`${window.location.origin}${path}\`}>` — bypasses
  `publishedOrigin()`, wrong host on previews (AUD-037).
- ❌ Sitemap querying `community_members` (base) instead of `community_members_public`.

## Self-check rubric (pass/fail)
- [ ] Canonical via `SEOHead`/`publishedOrigin()`, not `window.location.origin`.
- [ ] Private route? added to `<NoIndex>` AND `_headers`; `privateRoutes.test.ts` passes.
- [ ] Sitemap section reads `_public` views / published rows, runs anon, no whole-index failure.
- [ ] Any prerenderer runs as anon (no service-role/user data).
- [ ] Detail not-found branches don't leave indexable 200 shells (add `<NoIndex>` or real 404).

## Evidence
Inspected 2026-07-07: `src/components/common/SEOHead.tsx` (4-16,46-69), `src/lib/publishedOrigin.ts`
(14,27-35), `src/components/common/NoIndex.tsx` (17-20), `supabase/functions/sitemap/index.ts`
(16-20,28-29,88-179,272,331-342), `supabase/config.toml:141`, `index.html` (11-58),
`public/robots.txt`, `public/_redirects`, `public/_headers`, `src/config/privateRoutes.ts` +
`privateRoutes.test.ts`, soft-404 branches (`ServiceProviderPage.tsx:33`, `EventDetailPage.tsx:24`,
`InvestorPage.tsx:25`, +5 more). Audits: `docs/audits/seo-discoverability-audit-2026-07-04.md`
(§3 canonical, §8 prerender-anon + noindex rules), `docs/runbooks/MES-80-www-apex-301.md`;
MES-111 `docs/prelaunch-audit.md` AUD-046 (soft-404s), AUD-037 (hand-rolled canonicals).

## Common MES pitfalls (real)
1. **The 2026-07-04 audit is partly stale — verify before citing.** The hardcoded canonical,
   drifting static `sitemap.xml`, and relative-URL `llms.txt` it flagged are **fixed**
   (`index.html`, the sitemap function, `llms.txt` v2). Don't "re-fix" them. Still open: bot
   rendering (no prerender infra), soft-404s, www→apex 301.
2. **Soft-404s indexable** — all 8 detail pages render "Not Found" as a 200 shell with no noindex
   (MES-111 AUD-046); `/investors/garbage-slug` is a fully indexable empty page.
3. **Hand-rolled canonicals bypass preview normalisation** (AUD-037) — wrong host on Lovable
   previews.
4. **www→apex is a dashboard (Cloudflare/Lovable) 301, not in-repo** — a Lovable SPA has no server
   config; client-side `<Navigate>` redirects are invisible to non-JS crawlers
   (`docs/runbooks/MES-80-www-apex-301.md`).
