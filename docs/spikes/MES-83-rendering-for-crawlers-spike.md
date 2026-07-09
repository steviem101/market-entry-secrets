# MES-83 / SEO-07 — Rendering for crawlers: spike

**Ticket:** MES-83 (Phase 1 — spike only; Phase 2 implementation gated on sign-off)
**Date:** 2026-07-06
**Author:** Claude (session working the MES-76 SEO tickets)
**Status:** ⏳ Awaiting sign-off — decision + open questions at the end

---

## 1. Problem (why this is THE lever)

Every one of the ~1,400 public URLs serves the same ~4 KB empty CSR shell to
**everyone, including Googlebot** (verified byte-identical in the MES-76
audit). All titles, descriptions, canonicals, JSON-LD, and body text are
JS-injected via react-helmet. Consequences, all confirmed live:

- ~9 of 1,383 sitemap URLs indexed by Google; money pages absent.
- GPTBot / ClaudeBot / PerplexityBot / CCBot **do not execute JS** — the AI
  crawlers we just explicitly invited in robots.txt (MES-82) read empty pages.
- Unknown slugs return HTTP 200 (soft-404s); redirects and noindex are
  client-side only. MES-111's prelaunch audit re-confirmed the blast radius:
  all 8 detail-page "Not Found" branches render as indexable 200 shells with
  no noindex (AUD-046), and ~10 pages still hand-roll canonicals off
  `window.location.origin`, emitting preview-host canonicals on Lovable
  previews (AUD-037). The Worker layer fixes the former for real (HTTP 404);
  an interim `<NoIndex>` on those branches is a cheap stopgap shippable now.

The 0–30d quick wins (MES-77/79/80/81/82) fixed everything *around* this;
none of it reaches a non-JS crawler until rendering is fixed.

## 2. Hard compatibility evidence (learned from this week's deploys)

These are **observed facts**, not assumptions — they materially constrain the
options:

| # | Finding | Evidence | Implication |
|---|---------|----------|-------------|
| 1 | Lovable hosting does **not** honour `public/_headers` | `curl -I /my-reports` after deploy: no `X-Robots-Tag` | No custom response headers from the repo → no server-side noindex, no header-level controls at the origin |
| 2 | Lovable's honouring of **external proxy rules** in `_redirects` is unconfirmed; apex `/sitemap.xml` still served a stale cached copy of a deleted file post-deploy | Live curl 2026-07-06 | Can't rely on the origin for proxying or cache purging; edge cache behaviour is opaque |
| 3 | The domain is fronted by **Cloudflare** (audit: `cf` headers; `x-deployment-id` = Lovable behind it) | MES-76 audit + live headers | A Cloudflare zone exists — *if we control it*, Workers/Transform/Redirect Rules become available |
| 4 | Supabase Edge Functions deploy reliably via our GitHub Actions pipeline and serve public traffic well | The MES-79 sitemap function (incl. the #295 hotfix cycle) | A proven place to run crawler-facing server code — but Deno edge functions **cannot run a headless browser** |
| 5 | The www→apex redirect is a 302 we can't fix in-repo (MES-80 runbook) | curl trace | Same root cause: no controllable HTTP layer in front of the SPA today |

**The crux:** every dynamic-rendering option requires *something in the request
path* that can branch on User-Agent. Lovable's origin can't. The only viable
interception point is the **Cloudflare zone** — which makes
**"do we control the Cloudflare account for marketentrysecrets.com?"** the
single gating question for this spike (Open Question 1).

## 3. Options

### Option A — Cloudflare Worker bot-gateway + dynamic rendering *(audit-preferred)*

A Worker on route `marketentrysecrets.com/*`:

```
if (UA is a known bot && path is public && not a static asset):
    serve cached rendered HTML (from renderer, cache in Workers Cache/KV)
else:
    pass through to Lovable origin unchanged
```

Users see zero change; bots get full HTML. Google explicitly tolerates dynamic
rendering when content parity is maintained. Three renderer choices inside
this architecture:

| | **A1: Prerender.io** | **A2: CF Browser Rendering** | **A3: DB-driven HTML (Supabase fn)** |
|---|---|---|---|
| What renders | Their managed headless Chrome | Puppeteer in our CF account | No browser — hand-built HTML per route type from anon DB reads (sitemap-function pattern) |
| Parity risk | **Minimal** — renders the real SPA | **Minimal** — renders the real SPA | **Highest** — parity is hand-maintained per route template; drift = cloaking risk |
| Build effort | ~1–2 days (Worker + account) | ~3–5 days (Worker + Puppeteer + cache mgmt) | ~1–2 weeks (templates for 12+ route types, then forever-maintenance) |
| Cost | **$49/mo** Starter, 25k renders ([free tier discontinued Oct 2025](https://docs.prerender.io/docs/changes-to-prerender-pricing); 30-day free trial; overage $2/1k) | [$5/mo Workers Paid](https://developers.cloudflare.com/workers/platform/pricing/) + browser-hours usage (est. **$5–15/mo** at our volume) | ~$0 marginal (existing Supabase) |
| Ops burden | Lowest (managed) | Medium (our Puppeteer code, timeouts, memory) | Low infra, high content-maintenance |
| 404s/redirects | Worker/renderer detects the SPA's not-found state → real 404 | Same | Trivially correct (DB lookup misses → 404) |
| Vendor risk | Locked to vendor pricing | None (CF already in path) | None |

**Render volume estimate:** ~1,450 URLs × recrawl cadence with a 7-day cache
TTL ≈ **6–10k renders/month** — comfortably inside Prerender Starter (25k)
and trivial for Browser Rendering. Bot *requests* mostly hit cache; only cache
misses render.

### Option B — Build-time SSG of hub pages (partial, no infra)

`vite`-level prerender of the ~25 hub/static pages (directories, taxonomy
hubs, pricing, FAQ) at build time; detail pages stay CSR.

- **Pros:** no runtime infra, no UA-branching (zero cloaking surface), works
  even if we don't control Cloudflare.
- **Cons:** covers ~2% of URLs (the 1,300+ detail pages are the citable
  asset); freshness tied to deploys; **unknown whether Lovable's build
  pipeline runs custom postbuild steps** (Open Question 2); soft-404s remain.
- **Verdict:** useful *stopgap or complement*, not the fix. Don't build first.

### Option C — Framework migration (Next/Remix/Astro SSR)

Highest quality; highest cost/risk; breaks the Lovable editing workflow the
project depends on. **Documented as the long-term option only** — revisit if
Lovable coupling ever loosens. Not scoped further here.

## 4. Recommendation

**A1: Cloudflare Worker + Prerender.io**, with a pre-negotiated migration
path to **A2 (CF Browser Rendering)** if/when $49/mo matters more than the
ops simplicity. Rationale:

1. **Parity by construction** — a real browser renders the real SPA, so
   crawlers see exactly what users see. A3's hand-built HTML makes parity a
   permanent editorial obligation and is the only variant with real cloaking
   risk; rejected.
2. **Fastest to the KPI** — 1–2 days of work, then indexation is a function
   of Google's crawl queue, not our engineering queue. The 90-day KPI is
   ≥40% of sitemap URLs indexed.
3. **Reversible in one click** (see §7).
4. The Worker becomes the **consolidated HTTP layer** the site currently
   lacks, absorbing three open items in the same deliverable:
   - `X-Robots-Tag: noindex` for the private paths (closes the MES-81 gap —
     the `_headers` file Lovable ignores; source of truth already exists in
     `src/config/privateRoutes.ts`);
   - single-hop **www→apex 301** (closes the MES-80 runbook item);
   - real **HTTP 404** for unknown slugs and apex `/sitemap.xml` proxying to
     the sitemap function (finishes MES-79's best-effort `_redirects` rule).

Bot UA list: Googlebot, Bingbot, GPTBot, ChatGPT-User, OAI-SearchBot,
ClaudeBot, anthropic-ai, PerplexityBot, CCBot, Google-Extended, plus social
scrapers (Twitterbot, facebookexternalhit, LinkedInBot). Everything else —
including all real users — passes straight through.

## 5. Cache strategy

- **Cache key:** normalized URL (slash-free canonical, tracking params
  stripped) — matches the MES-80 canonical policy.
- **TTLs:** hubs/directories 24 h; detail pages 7 days; `/` 24 h. Rendered
  copies of *content* don't need to be fresher than Google's recrawl rate,
  and the sitemap `lastmod` (MES-79) already signals change.
- **Invalidation v1:** TTL only. **v2 (optional):** Supabase trigger/webhook
  → Prerender recache API on `content_items`/`events` update — only add if
  stale snapshots are actually observed to matter.
- **Failure mode:** renderer down/timeout → Worker falls through to the SPA
  shell (today's behaviour). Rendering can only *add*; it must never take a
  page below current baseline.

## 6. Parity & RLS/freemium safety (cloaking-safe by construction)

- The renderer browses **anonymously** — no service role, no user JWT, no
  cookies. RLS decides what it sees, so a crawler gets exactly what a
  logged-out visitor gets. Gated report content stays gated *by construction*.
- `FreemiumGate` (3 free views via localStorage) renders content on a fresh
  browser profile — every render is "view 1", so public directory pages
  render fully. No gated/paid content is reachable anonymously (verified in
  the MES-76 audit, §8).
- The 15-second `LeadGenPopup` won't be in snapshots (capture at network-idle,
  well before 15 s) — good: parity of *content*, minus transient chrome.
- Private routes are never rendered: the Worker only intercepts public paths
  and additionally stamps the private list with `X-Robots-Tag: noindex`.
- **Parity audit cadence:** monthly spot-check of 5 URLs — rendered HTML vs
  browser screenshot (added to the MES-90 monthly SEO health review).

## 7. Rollback plan / kill switch

1. **Kill switch (instant):** disable the Worker route in the Cloudflare
   dashboard (or `wrangler route delete`). All traffic — bots included —
   flows directly to the Lovable origin exactly as today. No deploy, no DNS
   change, no cache to drain. *Test this as part of go-live.*
2. **Partial rollback:** the Worker reads an allowlist of path prefixes from
   KV — bad section? Remove its prefix; that section reverts to SPA serving.
3. **Vendor exit:** Prerender.io is only reachable *through* the Worker, so
   swapping to A2 (or removing rendering entirely) is a Worker-only change.
   No app code changes in any scenario.

## 8. Verification plan (maps to the ticket's acceptance criteria)

1. `curl -A "Googlebot"` on 10 representative URLs (home, 2 hubs, provider,
   mentor, event, case study, country, sector, unknown-slug) → full HTML with
   route-specific title/meta/canonical/JSON-LD/body; unknown slug → **404**.
2. Same URLs *without* bot UA → byte-identical to today's SPA responses.
3. GSC URL Inspection on 3–5 URLs → "Page is indexable", rendered HTML
   visible (needs MES-78's GSC access).
4. Kill switch drill: disable route, re-run (1) expecting SPA shell, re-enable.
5. Freemium safety: `curl -A "Googlebot" /report/shared/<real-token>` → not
   intercepted (private path), and the SPA still noindexes it.

## 9. Open questions for sign-off *(blockers before Phase 2)*

1. **Do we control the Cloudflare zone for marketentrysecrets.com?**
   (Dashboard access to add Workers/rules — or is DNS managed inside
   Lovable's account?) → If **yes**: proceed per §4. If **no**: ask Lovable
   support whether zone-level access or custom headers/proxying are
   available; if neither, the realistic fallback order is (a) move DNS to
   our own Cloudflare account (points at the same Lovable origin; ~1 h + TTL
   wait, also unlocks the MES-80 www-301 and MES-81 header items), then
   (b) Option B as stopgap.
2. **Does Lovable run custom build steps** (e.g. a `postbuild` prerender)?
   Only matters if Option B is ever wanted; not a blocker for A1.
3. **Budget OK?** ~$49/mo (Prerender Starter) + $0–5 (CF) ≈ **$50/mo**, vs
   A2 at ~$10–20/mo for ~3 extra days of build + ongoing Puppeteer ops.
4. **Who owns the Cloudflare account/billing** for the Worker (needs a
   Workers Paid $5/mo plan for sane limits)?

## 10. Sources

- [Prerender.io pricing](https://prerender.io/pricing/) · [pricing-change notice (free tier discontinued)](https://docs.prerender.io/docs/changes-to-prerender-pricing)
- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) · [Browser Rendering pricing](https://developers.cloudflare.com/browser-run/pricing/) · [limits](https://developers.cloudflare.com/browser-run/limits/)
- MES-76 audit §3 (rendering verdict), §8 (freemium/RLS crawler safety)
- Live-crawl evidence from the MES-77…82 deploy cycle (2026-07-06), incl. the
  `_headers`/`_redirects` findings and the #295 sitemap gateway hotfix
