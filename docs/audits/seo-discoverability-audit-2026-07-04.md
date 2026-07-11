# MES SEO, Discoverability & Indexing Audit — Organic + LLM Search Readiness

**Ticket:** MES-76 (Spike — audit + plan only, no implementation)
**Date:** 2026-07-04
**Scope:** marketentrysecrets.com production site, `steviem101/market-entry-secrets` repo, MES Platform Supabase (`xhziwveaiuhzdoutpgrh`, read-only)
**Method:** Live HTTP crawl evidence (curl, with/without Googlebot UA), repo inspection, read-only DB introspection, Google/DuckDuckGo SERP benchmarking, entity/backlink search. PageSpeed Insights API was quota-blocked on audit day (noted where relevant).

---

## 1. Executive summary

MES has a **well-built on-page SEO layer that no search engine or AI crawler can currently see**. The code sets per-route titles, descriptions, canonicals, Open Graph tags and rich JSON-LD (LocalBusiness, Event, Article, FAQPage, ItemList…) across essentially every public page, and the site ships robots.txt, a 1,383-URL sitemap and even an `llms.txt`. But the site is a pure client-side-rendered SPA with **no prerendering, even for Googlebot** (verified byte-identical responses): every one of the 1,383 URLs serves the same 3,957-byte empty HTML shell.

Worse, the static `index.html` hardcodes `<link rel="canonical" href="https://marketentrysecrets.com/">`, so **in raw HTML every page on the site declares itself a duplicate of the homepage**. The observable result: only ~9 pages indexed in Google (mostly Terms/Privacy/Contact plus one stale UUID provider URL), no top-10 ranking for the quoted brand phrase "Market Entry Secrets", zero appearances in six priority commercial SERPs, effectively zero backlinks, and near-zero probability of AI-answer citation (most AI crawlers — GPTBot, ClaudeBot, PerplexityBot — do not execute JavaScript at all).

**The single biggest lever is fixing rendering for crawlers.** Everything else (metadata, schema, sitemap, content) is largely already built and will start paying off the moment crawlers can see it. The second lever is measurement (no GA4/analytics, Bing Webmaster unconfirmed) and the third is off-page authority/entity building, which currently rounds to zero.

### Scorecard (1–5, repeatable)

| # | Dimension | Score | One-line verdict |
|---|-----------|:-----:|------------------|
| A | Technical SEO & crawlability | **1.5** | Pure CSR shell to all crawlers; homepage canonical on every URL; soft-404s; 302 www redirect |
| B | On-page metadata & structured data (as coded) | **4** | SEOHead + JSON-LD on ~all public pages — genuinely good |
| B′ | …as actually delivered to crawlers | **1** | None of it is in the HTML; helmet tags are JS-injected and conflict with static head tags |
| C | Indexation coverage | **1** | ~9 of 1,383 sitemap URLs observed indexed in Google; boilerplate outranks money pages |
| D | Content & information architecture | **3** | 152 published items incl. 102 case studies + taxonomy pages; but no ranking guide content, thin footer/internal links |
| E | LLM / AI search readiness | **1.5** | llms.txt exists (rare, good) but every page is unreadable to non-JS AI crawlers; zero external citability |
| F | Discovery infrastructure & measurement | **1** | GSC verification tag present; no GA4/analytics of any kind, Bing unconfirmed, no rank tracking |
| G | Freemium/RLS crawler safety | **3** | No paid-content leakage observed; but private/auth routes lack noindex (200 + shell) |
| H | Programmatic / directory SEO | **2** | Foundation exists (23 locations × 3 sectors × 8 countries + 1,360 detail records); unexploited, drifting sitemap |
| I | Off-page authority & entity signals | **0.5** | Zero observed backlinks/mentions; no LinkedIn/Crunchbase/Wikidata entity indexed; brand SERP lost to generic content |
| J | Geo-targeting & i18n | **2.5** | Single-market .com is fine, no hreflang needed; no explicit AU geo signals set anywhere |

---

## 2. Baseline snapshot (2026-07-04)

| Metric | Baseline value | Evidence |
|---|---|---|
| Public URLs in sitemap | 1,383 (flat file, no lastmod) | `public/sitemap.xml` |
| Actual DB-backed URL surface | ~1,290 detail pages + ~25 hub pages (see §5) | Supabase counts |
| Google-indexed pages (site: sample) | **~9** — /, /community, /locations, /partner, /terms, /contact, /sectors, /privacy, 1 UUID provider page | `site:` query |
| Bing/DDG-indexed pages (sample) | ~8 (incl. /pricing, /report-creator, 2 location pages) — Bing does index the site | DuckDuckGo `site:` |
| Brand SERP "Market Entry Secrets" (quoted) | **Not in top 10** (generic "market entry secrets" content wins) | WebSearch, US-localised |
| Navigational "marketentrysecrets" | 9/10 top results are MES pages | WebSearch |
| Priority commercial SERPs (6 queries, §10) | **0 of 6** top-10 appearances | WebSearch |
| Backlinks / external mentions | ~0 observed; no third-party list or roundup cites MES | `"marketentrysecrets.com" -site:` |
| Entity presence (LinkedIn/Crunchbase/Wikidata) | None found in indexed search | WebSearch |
| Organic sessions/users | **Unknown — no analytics installed** | repo + live HTML |
| Core Web Vitals | **Not captured** — PSI anonymous quota exhausted on audit day; re-run with API key | PSI API 429 |
| Structured-data coverage (as delivered in HTML) | 0 pages (0 JSON-LD blocks in served HTML) | curl, 10 representative URLs |
| Structured-data coverage (as coded, post-JS) | 16 page components emit JSON-LD; SEOHead on all public routes | repo grep |
| AI-answer presence | Not directly queryable; proxy signals (zero citations/mentions in indexed roundups) ≈ **absent** | benchmark agent |
| HTML served to Googlebot vs users | Byte-identical 3,957-byte empty shell | curl UA comparison |

---

## 3. Rendering & crawlability — the verdict (Dimension A)

**Verdict: pure client-side rendering with no dynamic rendering, prerendering or SSG. This is the root cause of nearly every other finding and the single biggest SEO lever.**

Evidence:

- Every tested URL (`/`, `/service-providers`, `/mentors`, `/events`, `/content`, `/case-studies`, `/pricing`, `/countries`, `/countries/ireland`, `/my-reports`, a fake URL) returns **HTTP 200 with an identical 3,957-byte shell**: `<div id="root"></div>` + Crisp chat script. Zero text content, zero links in HTML.
- Requesting with the **Googlebot user agent returns the byte-identical shell** — no prerender/dynamic-rendering service is in front (Cloudflare serves the site; `x-deployment-id` header indicates Lovable hosting; `public/_redirects` is the standard SPA `/* /index.html 200` catch-all).
- All meta/canonical/JSON-LD management is `react-helmet-async` (`src/components/common/SEOHead.tsx`) — **JS-injected only**. Google *can* render JS in its second-wave render queue (slow, budget-limited, and demonstrably not resulting in indexation here); **Bing renders JS inconsistently; GPTBot, ClaudeBot, PerplexityBot, and most AI crawlers do not execute JS at all** — they see an empty page.

### Critical head-tag defect (fixable independently of rendering)

`index.html` hardcodes homepage tags that are **not managed by Helmet** and therefore persist on every route, even after JS runs:

- `<link rel="canonical" href="https://marketentrysecrets.com/" />` — in raw HTML, **all 1,383 URLs self-declare as duplicates of the homepage**. After hydration Helmet *appends* a second, route-specific canonical, producing **two conflicting canonical tags** — Google treats conflicting canonicals as untrustworthy and picks its own. This single line plausibly explains much of the indexation failure (pages crawled → seen as homepage duplicates → dropped).
- `<meta property="og:url" content="https://marketentrysecrets.com/" />` — same duplication problem for social/AI scrapers.
- `og:image`/`twitter:image` point at a `storage.googleapis.com/gpt-engineer-file-uploads/...` stock photo, and **`twitter:site` is `@lovable_dev`** — wrong brand attribution on every share card.

### Other technical findings

| Finding | Evidence | Severity |
|---|---|---|
| **Soft 404s everywhere** — unknown URLs, invalid share tokens, everything returns 200 + shell | `/this-page-does-not-exist-xyz` → 200 | High (index bloat, wasted crawl budget, GSC noise) |
| **www → apex is 302, not 301**; `http://www.` chains via plain `http://` first | curl redirect trace | Medium (split signals; likely a Lovable/Cloudflare DNS setting) |
| Trailing-slash variants both 200 with no redirect (`/events` and `/events/`) | curl | Low (route-canonical mitigates once canonicals work) |
| Auth-gated routes (`/my-reports`, `/dashboard`, `/member-hub`, `/bookmarks`) return 200 shell, **no noindex** header or meta; `NotFound.tsx`, `MemberHub.tsx`, `Bookmarks.tsx` have no head management at all | repo + curl | Medium |
| Internal linking for HTML-only crawlers = **zero** (no `<a>` tags in served HTML). Post-JS, nav covers all 12 directories but the footer contains only a home link + LinkedIn | `Footer.tsx`, `NavigationItems.tsx` | High until rendering is fixed; Medium after |
| No pagination URLs — directories load client-side, so detail pages are discoverable only via the sitemap | repo | Medium |
| robots.txt: valid, permissive, references the sitemap. No AI-crawler directives either way | live fetch | OK |
| Performance posture: sensible vendor chunking in `vite.config.ts`; fonts from Google Fonts (render-blocking CSS); Crisp chat injected at boot. CWV unmeasured (PSI quota) | repo | Unknown — measure first |

**Rendering options assessment** (for the follow-up ticket): Lovable does not offer SSR for this stack. Realistic paths, in order of preference:
1. **Bot-facing prerendering ("dynamic rendering")** — serve pre-rendered HTML to crawler UAs via the CDN/edge (e.g. Prerender.io or a Cloudflare Worker + headless render, or a Supabase Edge Function render proxy). Lowest-touch, no app rewrite, reversible. Google explicitly tolerates dynamic rendering when parity is maintained (parity = no cloaking).
2. **Build-time SSG/prerender of known routes** (vite prerender of ~25 hub pages + top N detail pages) — partial coverage, no infra dependency.
3. **Full framework migration (Next/Remix/Astro)** — highest quality, highest cost/risk; not recommended as the first move given Lovable coupling.

---

## 4. On-page SEO & metadata (Dimension B)

**Strength — this layer is genuinely well built in code:**

- `SEOHead` (title, truncated meta description, OG title/desc/url/type/image, per-route canonical, JSON-LD array support) is used on effectively every public page; only private pages (`AuthCallback`, `Bookmarks`, `MemberHub`, `NotFound`, `ResetPassword`) lack head management.
- 16 page components emit JSON-LD with appropriate types: `LocalBusiness` (provider detail), `Event` (event detail), `Article` (content/case-study detail), `FAQPage` (FAQ + `/market-entry-questions` — a smart existing AI-SEO play), `Person` (mentors/investors), `CollectionPage`/`ItemList` (hubs), `Place` (locations), `Dataset` (leads).
- Clean, keyword-bearing slug URLs across all page types; legacy aliases 301-equivalent via in-app `<Navigate replace>`.

**Weaknesses:**

1. **None of it reaches crawlers** (see §3) — as-delivered coverage is 0%.
2. Conflicting static head tags in `index.html` (canonical, og:url, og:image, twitter:site) — see §3.
3. No `Organization` schema anywhere sitewide (the most important entity signal for a brand trying to be AI-citable), and no `BreadcrumbList` despite the type being defined in `SEOHead`'s union.
4. No `lastmod`/dates surfaced; `Article` schema completeness unvalidated (can't validate until HTML is served — Rich Results Test on current pages sees an empty document).
5. Image alt text: not systematically audited (JS-only rendering makes this moot for crawlers today); flag for the post-rendering validation pass.

---

## 5. Indexable URL surface & indexation coverage (Dimensions C, H)

### URL surface (read-only DB counts, 2026-07-04)

| Page type | Route | DB rows | In sitemap | Drift |
|---|---|---:|---:|---|
| Investors | `/investors/:slug` | 461 | 448 | −13 missing |
| Events | `/events/:slug` | 192 | 95 | **−97 missing (51%)** |
| Mentors | `/mentors/...` | 134 | 147 | **+13 dead URLs** |
| Govt agencies | `/government-support/:slug` | 134 | 135 | ≈ |
| Innovation ecosystem | `/innovation-ecosystem/:slug` | 169 | 125 | −44 missing |
| Content (non-case-study) | `/content/:slug` | 50 | 122 | **+72 — see duplicate finding** |
| Case studies | `/case-studies/:slug` | 102 | 103 | ≈ |
| Service providers | `/service-providers/:slug` | 95 | 96 | ≈ |
| Lead databases | `/leads/:slug` | 65 | 66 | ≈ |
| Locations | `/locations/:slug` | 23 | 24 | ≈ |
| Countries | `/countries/:slug` | 8 | 6 | −2 |
| Sectors | `/sectors/:slug` | 3 | 4 | +1 |
| **Total detail + hubs** | | **~1,436 potential** | **1,383** | |

### Key findings

1. **The sitemap is a hand-maintained static file and is already drifting** (updated same-day as audit, yet events are 51% missing and mentors include 13 URLs with no DB row). No `lastmod` on any entry. No sitemap index. It also lists the redirect aliases `/community` and `/trade-investment-agencies` alongside their targets.
2. **Confirmed duplicate content:** case studies are served at **both** `/content/:slug` and `/case-studies/:slug` (`useContent.ts:65` fetches by slug with no `content_type` filter), and the sitemap lists ~72 case-study slugs under `/content/` **and** ~102 under `/case-studies/` — double-submitting duplicates to Google.
3. **What Google actually indexed (~9 pages) skews to boilerplate** (terms, privacy, contact, partner) plus **stale URLs**: a UUID-based provider URL (`/service-providers/955bcb0a-…`) and the retired `/community` alias. Money pages (pricing, report-creator, directories, all 152 content items, all events) are effectively absent. Bing's sample is slightly more commercial (pricing, report-creator, 2 location pages).
4. **Orphaning:** with an empty HTML shell there are no crawlable internal links, so the 1,300+ detail pages are sitemap-only discoveries — the classic "Discovered – currently not indexed" pattern.
5. Old UUID URLs still resolve (detail hooks fall back to id), but there's no 301 from UUID → slug URL and the UUID variant is what Google holds.

### Programmatic SEO opportunity (H)

The taxonomy foundation is real: 23 locations, 8 source countries, 3 sectors, each with keyword arrays purpose-built for matching (`locations.service_keywords`, `event_keywords`, etc.), and 1,300+ entity records to aggregate. A **location × sector** (and **country → Australia corridor**) template layer (e.g. "Fintech market entry in Sydney: providers, events, case studies") is a genuine opportunity *after* rendering is fixed — every combination page can be populated with real, unique data modules (matched providers, upcoming events, relevant case studies, local agencies), which is exactly what separates programmatic SEO from doorway pages. **Guardrails required:** minimum-content thresholds (e.g. don't publish a combo page with <3 matched entities), unique intro copy per page, canonicalisation of empty/thin combos to the parent hub, and sitemap inclusion only for pages passing the threshold. Do not build this before rendering + measurement exist, or it's 69+ more invisible-and-thin URLs.

---

## 6. Content & information architecture (Dimension D)

**Strengths:** 152 published items — 102 case studies (a differentiated asset; competitors have almost none), 44 guides, plus interviews/compliance/best-practice. Case studies carry company profiles and founder records (`content_company_profiles`, `content_founders`) — strong entity raw material. `/market-entry-questions` (FAQPage) already targets question intent. Taxonomy hubs (locations/countries/sectors) create a coherent IA.

**Weaknesses:**
- **No pillar page targets the head terms MES must own** ("enter the Australian market", "Australia market entry", "Australian market entry services/consultants"). The content library is case-study heavy and guide-light on commercial intent; none of it ranks (nor can it, unrendered).
- Internal linking is nav-only; no breadcrumbs, no "related content" mesh between case studies ↔ providers ↔ sectors ↔ locations, footer nearly empty.
- No visible publish/updated dates surfaced for freshness signals; events include past events with no expiry/archival handling.
- Titles/descriptions per item exist but keyword targeting is unmapped — a keyword→URL map should be seeded in the content-hub ticket (competitor gap: Dearin & Associates' blog owns the boutique-consultancy share of these SERPs; trade.gov/NZTE own government intent; meegle.com ranks with beatable programmatic pages).

---

## 7. LLM / AI search readiness (Dimension E)

- **`llms.txt` exists** (2,022 bytes, sensible summary + page list) — ahead of most competitors. Issues: links are relative paths (spec and consumers prefer absolute URLs); it discloses internal pipeline details ("Firecrawl scrapes, Perplexity research, and Gemini synthesis") which is unnecessary competitive/attack-surface disclosure; and it stops at hub pages (no llms-full.txt or key content links).
- **The fatal issue is upstream:** AI crawlers don't execute JS, so every MES page reads as empty to GPTBot/ClaudeBot/PerplexityBot/CCBot today. Bing (which feeds ChatGPT browsing/Copilot) has only a handful of pages. **Fixing rendering is the AI-search fix.**
- **Citability is zero from the outside in:** no external mentions, no roundup/listicle includes MES, no Wikipedia/Wikidata/Crunchbase/LinkedIn entity footprint found in indexed search. AI engines cite what corroborated, structured, quotable sources say; today there is nothing to corroborate.
- robots.txt takes no position on AI crawlers (fine — default-allow is the right posture for this business; make it explicit in the follow-up ticket).
- Assets MES can uniquely offer AI engines once readable: structured directory data (counts, named entities), 102 case studies with concrete facts, FAQ content, and potential original data ("State of ANZ market entry" style stats pages) — the classic quotable-statistics play.

---

## 8. Freemium / RLS crawler safety (Dimension G)

**No gated-content leakage was observed** — verified: report content lives in `user_reports` behind owner-only RLS; shared reports resolve via the `get_shared_report(share_token)` RPC; an invalid token returns the empty shell (200). Directory data rendered publicly is public-read by design, and PII-bearing tables are shielded by the `*_public` views.

Gaps and rules for all follow-up work:

1. `/report/shared/:shareToken` pages should carry **`noindex`** (they're private-by-obscurity documents; indexing them leaks customer strategy and creates near-duplicate report content). Same for `/my-reports`, `/dashboard`, `/member-hub`, `/bookmarks`, `/auth/*`, `/admin/*` (defence-in-depth even though they render nothing without auth).
2. When prerendering is introduced, the renderer must run as **anon** (no service-role, no user JWT) so RLS decides what crawlers see — this makes teaser-vs-leak automatic and cloaking-safe: crawlers get exactly what a logged-out user gets.
3. Tier-gated report sections are already stored with `visible: false` and gated client-side — prerendered report pages are out of scope anyway (they're private), so no teaser design is needed for v1. If public report teasers are ever built, render the free sections + upgrade CTA (teaser ≠ cloaking as long as Googlebot and users see the same thing).

---

## 9. Discovery infrastructure & measurement (Dimension F)

| Tool | Status | Evidence |
|---|---|---|
| Google Search Console | **Likely verified** (meta verification tag in `index.html`), data not accessible to this audit — confirm property + sitemap submission | index.html |
| GA4 / any web analytics | **Absent entirely** — no gtag/GTM/Plausible/PostHog in app or HTML; only internal intake-funnel events to Supabase | repo grep + served HTML |
| Bing Webmaster Tools | Unknown/unconfirmed (matters: Bing feeds ChatGPT) | — |
| Rank tracking / AI-citation tracking | None | — |
| CWV/Lighthouse monitoring | None; PSI blocked on audit day (anonymous quota) — first action of measurement ticket is re-running with an API key | PSI 429 |

**You currently cannot measure organic performance at all.** This is the first follow-up ticket for a reason: every other ticket's success criteria depend on it.

---

## 10. Competitor / SERP benchmarking & off-page authority (Dimension I)

Six priority queries tested (US-localised; appropriate since MES buyers are overseas). **MES appeared in none.**

| Query | Who wins | Winning format |
|---|---|---|
| "how to enter the Australian market" | trade.gov, NZTE, consultancy blogs (Dearin, Altus) | Govt guides + long-form consultancy guides |
| "Australia market entry consultants" | **CleverX (a directory, #1)**, Dearin, boutique consultancies | Directory/listicle + service pages |
| "market entry Australia guide" | trade.gov, meegle.com (programmatic), Altios, NZTE | Guides; beatable programmatic pages rank |
| "expand business to Australia" | Polyglot Group, GlobalExpansion, Acclime, business.gov.au, EOR vendors | Country-expansion vendor pages |
| "Australian market entry services" | trade.gov, Acclime, exact-match-domain consultancy, **GlobalTrade.net (directory)** | Service pages + directory |
| "setting up a business in Australia foreign company" | business.gov.au #1, Austrade #2, legal/fintech | Government-owned intent — hardest to crack |

Takeaways: (1) **directories demonstrably can rank** for the consultant/services queries — MES's exact format; (2) the most visible private competitor is a boutique consultancy blog (Dearin & Associates) — outproducible; (3) government sites own "how to set up" intent — target them for partnerships/backlinks, not rankings.

**Authority baseline: effectively zero.** No indexed external mention of marketentrysecrets.com was found; no LinkedIn company page, Crunchbase, Wikipedia/Wikidata entity surfaced in search (the footer links to a LinkedIn company URL — verify it exists/is public and build it out). The quoted brand phrase "Market Entry Secrets" is lost to generic dictionary-phrase content — fixable only with entity + mention building.

## 11. Geo-targeting & i18n (Dimension J)

Single-language, single-target-market (.com, global buyers, AU/NZ subject matter) — **no hreflang needed**. Do: set Australia as target geography where applicable in GSC (note: geo-targeting settings are limited for gTLDs now, but content-level geo signals matter), ensure `LocalBusiness`/`Place` schema carries AU addresses (provider/location pages already model this), add `Organization` schema with `areaServed: AU/NZ`, and keep AU spellings/terminology. Country pages (8 source-country corridors) are the i18n-adjacent growth surface — corridor content ("Ireland → Australia market entry") has low competition and high fit; no separate locale sites warranted.

---

## 12. Prioritised improvement plan

Scoring: **ICE** (Impact × Confidence × Ease, each 1–10; max 1000). Horizons: 0–30d quick wins / 30–90d structural / 90d+ ongoing. Every item is a proposed follow-up ticket (sub-ticket of MES-76). **R** = risk, **F** = RLS/freemium note.

### 0–30 days — quick wins

| # | Recommendation (→ ticket) | I | C | E | ICE | Notes |
|---|---|---:|---:|---:|---:|---|
| 1 | **Fix static head defects in `index.html`**: remove hardcoded canonical + og:url (let Helmet own them), self-host branded og:image, fix `twitter:site`, add sitewide `Organization` JSON-LD | 9 | 10 | 10 | 900 | R: none — one-file change. F: n/a. Cheapest high-impact fix in the audit |
| 2 | **Stand up measurement**: confirm GSC property + submit sitemap, register Bing Webmaster + IndexNow, install GA4 (or Plausible), PSI/Lighthouse baseline with API key, lightweight rank + AI-citation prompt panel (manual monthly) | 8 | 10 | 9 | 720 | R: none. F: analytics must not capture report content/PII. Unblocks all success metrics |
| 3 | **Dynamic sitemap edge function**: DB-driven sitemap index (per-section child sitemaps), real `lastmod`, exclude aliases/redirects/duplicates, only published rows; point robots.txt at it; delete the static file | 8 | 9 | 7 | 504 | R: low. F: query public views only (anon-safe). Fixes 51%-missing events, 13 dead mentor URLs, dual case-study listing |
| 4 | **Duplicate & canonical cleanup**: serve case studies only at `/case-studies/:slug` (redirect or canonical from `/content/:slug` for `content_type='case_study'`); 301 UUID detail URLs → slug URLs; www→apex 301 (Lovable/Cloudflare DNS setting); trailing-slash policy | 7 | 9 | 7 | 441 | R: low — redirects are reversible. F: n/a |
| 5 | **Crawler hygiene for private routes**: `noindex` meta (and X-Robots-Tag where possible) on `/my-reports`, `/dashboard`, `/member-hub`, `/bookmarks`, `/report/shared/*`, `/admin/*`, auth pages; add head tags to NotFound | 6 | 9 | 9 | 486 | R: none. F: **core freemium-safety item** — prevents shared customer reports ever being indexed |
| 6 | **llms.txt upgrade**: absolute URLs, add top guides/case-studies/FAQ links, remove internal-pipeline disclosure, explicit AI-crawler allow statements in robots.txt | 4 | 8 | 10 | 320 | R: none. F: link only public pages |

### 30–90 days — structural

| # | Recommendation (→ ticket) | I | C | E | ICE | Notes |
|---|---|---:|---:|---:|---:|---|
| 7 | **Rendering for crawlers (THE lever)**: spike then implement bot-facing prerendering (Prerender.io / Cloudflare Worker / edge render proxy) for all public routes, with SSG of hub pages as fallback option; verify parity (no cloaking), soft-404 → real 404 status for unknown slugs | 10 | 9 | 4 | 360* | *Low E, highest absolute impact on the entire audit — treat as the flagship ticket. R: **medium** — new infra in the request path; mitigate with bot-UA-only scope, cache TTLs, kill switch, rollback = remove worker route. F: **renderer must run anon so RLS decides visibility; never inject user/service-role data** |
| 8 | **Post-rendering validation pass**: Rich Results Test / Schema validator on every page type; fix schema gaps (BreadcrumbList, Organization sameAs, Event dates/offers, Article author/dates, image alt audit); request indexing on priority URLs | 7 | 8 | 7 | 392 | Blocked by #7. R: none |
| 9 | **Content hub**: "Enter the Australian Market" pillar guide + cluster mapped to the 6 priority queries; keyword→URL map; publish dates; interlink case studies ↔ sectors ↔ providers; breadcrumbs; footer directory links | 8 | 8 | 5 | 320 | R: low. F: all free-tier content by design (top-of-funnel) |
| 10 | **Internal-linking mesh**: breadcrumbs (+ BreadcrumbList), related-entity modules on all detail pages, expanded footer (12 directory hubs + top taxonomy pages) | 7 | 8 | 7 | 392 | Partly bundled with #9; cheap once rendering exists |
| 11 | **Entity & brand foundation**: LinkedIn company page live/complete, Crunchbase profile, Google Business (if applicable), Wikidata entity, consistent NAP; brand-mention seeding in 3–5 relevant startup/export communities | 7 | 7 | 7 | 343 | R: low. Off-repo work. Directly attacks the lost brand SERP + AI citability |

### 90+ days — ongoing strategy

| # | Recommendation (→ ticket) | I | C | E | ICE | Notes |
|---|---|---:|---:|---:|---:|---|
| 12 | **Programmatic location×sector (and country-corridor) landing pages** with thin-content guardrails (min-entity thresholds, unique intros, conditional sitemap inclusion) | 8 | 7 | 4 | 224 | R: **medium** — doorway-page penalty if shipped thin; gate on guardrails. F: aggregate only public directory data |
| 13 | **Digital PR / citability assets**: original-data reports from directory stats ("State of ANZ market entry"), quotable stats pages, guest posts / partner listings with trade bodies & accelerators; goal = enter the roundups AI engines cite | 8 | 6 | 4 | 192 | R: low. Assessment→execution split into its own plan |
| 14 | **Freshness & lifecycle automation**: auto-expire/archive past events (correct Event schema), content update cadence, monthly sitemap/index-coverage review vs this scorecard | 6 | 8 | 6 | 288 | R: low. F: n/a |
| 15 | **CWV/performance budget**: Lighthouse CI on PRs once measurement (#2) shows real numbers; font self-hosting, Crisp lazy-load | 5 | 6 | 6 | 180 | Evidence-gated: don't optimise blind |

**Dependency spine:** #1, #2 immediately → #3–#6 in parallel → #7 (flagship) → #8–#11 → #12–#15. Content work (#9) can start writing before #7 lands but won't rank until it does.

---

## 13. Proposed target KPIs

| KPI | Baseline (2026-07-04) | 90-day target | 12-month target |
|---|---|---|---|
| Indexed pages / public URLs (GSC coverage) | ~9 / 1,383 (<1%) | ≥40% of sitemap URLs | ≥85% |
| Organic sessions (GA4) | Unmeasured (≈0 baseline) | Instrumented + 500/mo | 5,000/mo |
| Quoted-brand SERP "Market Entry Secrets" | Not in top 10 | #1 | #1 + sitelinks |
| Priority-query top-10 appearances (6-query panel) | 0/6 | 1/6 | 4/6 |
| Pages with valid structured data (Rich Results) | 0 (as served) | 100% of rendered page types validate | maintained |
| CWV "good" (mobile, field/lab) | Unmeasured | Baseline captured + LCP <2.5s lab | CWV pass |
| Referring domains | ~0 | 10 | 50+ |
| AI-answer citations (monthly 10-prompt panel across ChatGPT/Perplexity/Gemini/AIO) | 0 (proxy-verified) | ≥1 engine cites MES | cited in ≥3 engines for ≥3 prompts |
| Sitemap freshness drift (DB rows vs sitemap URLs) | events −51%, mentors +13 dead | 0 (auto-generated) | 0 |

Re-run the §1 scorecard quarterly with the same method (curl shell check, site: sample, 6-query panel, drift query) — it's designed to be repeatable.

---

## 14. Recommended follow-up tickets (proposed sub-tickets of MES-76)

1. **MES-SEO-01 — Fix static head defects in index.html + brand social meta** (quick win; plan item #1)
2. **MES-SEO-02 — Discovery infrastructure: GSC/Bing/GA4/PSI baseline + rank & AI-citation panel** (#2)
3. **MES-SEO-03 — DB-driven dynamic sitemap edge function + robots update** (#3)
4. **MES-SEO-04 — Duplicate & canonical cleanup: case-study dual routes, UUID→slug 301s, www 301** (#4)
5. **MES-SEO-05 — Noindex/crawler hygiene for private, shared-report and 404 routes** (#5; freemium-safety)
6. **MES-SEO-06 — llms.txt v2 + explicit AI-crawler robots policy** (#6)
7. **MES-SEO-07 — Rendering spike + bot-facing prerendering for public routes** (#7; flagship, with rollback plan)
8. **MES-SEO-08 — Structured-data validation & enrichment pass (post-rendering)** (#8)
9. **MES-SEO-09 — ANZ market-entry content hub: pillar + cluster + keyword map** (#9)
10. **MES-SEO-10 — Internal linking: breadcrumbs, related-entity modules, footer** (#10)
11. **MES-SEO-11 — Entity & brand foundation (LinkedIn/Crunchbase/Wikidata/listings)** (#11)
12. **MES-SEO-12 — Programmatic location×sector / country-corridor pages with thin-content guardrails** (#12)
13. **MES-SEO-13 — Citability & digital-PR asset plan (original data reports)** (#13)
14. **MES-SEO-14 — Content/event freshness lifecycle + monthly SEO health review** (#14)
15. **MES-SEO-15 — CWV measurement & performance budget** (#15)

---

## 15. Evidence appendix & unverified items

- **Verified live (curl, 2026-07-04 ~16:45 UTC):** 200 + identical 3,957 B shell on 11 URLs incl. Googlebot UA; homepage-canonical in raw HTML on all routes; soft-404; robots.txt content; sitemap 202,064 B / 1,383 URLs / 0 lastmod; llms.txt 2,022 B; www 302; trailing-slash 200s; no x-robots-tag anywhere.
- **Verified repo:** SEOHead implementation + usage map; 16 JSON-LD pages; 5 headless private pages; static-file sitemap (no generator; last commit same day); `_redirects` SPA catch-all; no analytics; vendor chunking; footer/nav link inventory; `useContent.ts` slug fetch without content_type filter.
- **Verified DB (read-only):** row counts per table (§5); content_type split (102 case studies / 50 other); 5 sampled sitemap `/content/` slugs all resolving to case-study rows.
- **Verified SERP (US-localised):** site: samples (Google ~9, DDG/Bing ~8), brand + 6 priority + 3 roundup queries, zero external mentions, no entity pages.
- **Not verifiable today:** GSC internals (needs dashboard access), CWV (PSI anonymous quota exhausted — re-run with API key), direct Bing SERP (CAPTCHA), actual AI-engine answers (not queryable from this environment; proxy signals used), AU-localised SERPs, Google's post-JS rendered view (Search Console URL Inspection will show it — first task of MES-SEO-02).
- **Audit was read-only:** no code, data, RLS or migration changes; sole repo change is this report file.
