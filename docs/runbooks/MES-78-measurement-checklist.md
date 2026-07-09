# MES-78 / SEO-02 — Discovery-infrastructure setup & verification checklist

**Ticket:** MES-78 (owner-driven: account setup is Stephen's; snippet install +
baseline capture can be done by the agent once IDs exist)
**Prepared:** 2026-07-07 · pairs with the deployed MES-77/79/80/81/82 quick wins

Everything below is sequenced so each step's *verification* is explicit — the
audit's core complaint was "you currently cannot measure organic performance
at all," so every tool ends with a check that data is actually flowing.

---

## 1. Google Search Console (~15 min)

- [ ] **1.1 Confirm the property.** https://search.google.com/search-console →
  the verification meta tag is already live in `index.html`
  (`google-site-verification: tRduCW2OpklTOmUIu…`), so `https://marketentrysecrets.com`
  should verify instantly as a URL-prefix property. Prefer adding a **Domain
  property** too (needs one DNS TXT record) — it captures www/http variants.
- [ ] **1.2 Sitemap.** Google discovers the sitemap automatically from
  robots.txt (`Sitemap: https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/sitemap`).
  In the GSC UI, additionally submit `https://marketentrysecrets.com/sitemap.xml`
  — **but first check it serves the new index**
  (`curl -s https://marketentrysecrets.com/sitemap.xml | head -2` → should say
  `<sitemapindex`, not `<urlset`). As of 2026-07-06 it still served a stale
  CDN-cached copy of the deleted static file — purge the cache for that path
  (Lovable/Cloudflare) if it hasn't expired on its own.
- [ ] **1.3 Baseline export.** Indexing → Pages: screenshot/export
  indexed-vs-not counts. Performance: export the last-3-months query report
  (will be near-empty — that's the baseline). Log both in the Notion ticket.
- [ ] **1.4 URL Inspection on 5 pages** (`/`, `/service-providers`, one
  provider detail, one case study, `/pricing`): confirm "URL is on Google" or
  at least that the **rendered HTML** now shows route-specific
  title/canonical (validates the MES-77 fix from Google's side). Request
  indexing on each.
- [ ] **1.5 Removals sanity check:** nothing pending; and once rendering
  (MES-83) lands, re-inspect the same 5.

## 2. Bing Webmaster Tools + IndexNow (~10 min)

- [ ] **2.1** https://www.bing.com/webmasters → "Import from GSC" (fastest —
  reuses the Google verification).
- [ ] **2.2** Submit the sitemap (same caveat as 1.2; Bing is stricter about
  cross-host sitemaps, so the **apex** URL matters more here).
- [ ] **2.3** Enable **IndexNow** (Settings → IndexNow): generate the key,
  and host the key file. Note: Lovable serves anything in `public/`, so add
  `public/<key>.txt` via a tiny PR — the agent can do this the moment you
  paste the key.
- [ ] **2.4** Baseline: Site Explorer indexed-page count → Notion.

## 3. Analytics — GA4 or Plausible (~20 min)

**Recommendation: Plausible** ($9/mo, cookieless → no consent banner, page
paths only) unless you specifically want GA4's free tier + Google Ads links.
Either way the **PII guardrails are non-negotiable** (ticket risk note):

- Mask `/report/*` paths (share tokens are secrets — never send the token as
  a path/param to an analytics vendor).
- Strip query params (`utm_*` aggregation is fine; everything else off).
- No user IDs, emails, or report content in events.

**Once you give me the ID/domain, I'll open the snippet PR.** Prepared
snippets (go in `index.html` `<head>`, after the fonts):

```html
<!-- Option A: Plausible (cookieless). data-domain is not a secret. -->
<script defer data-domain="marketentrysecrets.com"
        src="https://plausible.io/js/script.js"></script>
```

```html
<!-- Option B: GA4. Measurement ID is not a secret. -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  // PII guardrail: mask report paths (share tokens) before they reach GA.
  var p = location.pathname.startsWith('/report/') ? '/report/masked' : location.pathname;
  gtag('config', 'G-XXXXXXXXXX', { page_path: p, allow_google_signals: false });
</script>
```

(SPA note: for GA4, route changes need a `page_view` on navigation — I'll wire
a small `useLocation` effect in the snippet PR. Plausible's script handles SPA
navigation automatically.)

- [ ] **3.1** Create the property (you) → paste ID here / to the agent.
- [ ] **3.2** Snippet PR merged + Lovable **published** (remember: merging
  alone doesn't publish — this bit us on 2026-07-06).
- [ ] **3.3 Verify:** open the site in a private window, click through 3
  pages incl. a detail page → events visible in the analytics realtime view;
  confirm `/report/…` shows as masked; no query params recorded.

## 4. Core Web Vitals baseline (~10 min, needs a PSI API key)

- [ ] **4.1** Create a key: https://developers.google.com/speed/docs/insights/v5/get-started
  (the audit's anonymous quota ran out — the key removes that).
- [ ] **4.2** Run (agent can do this given the key):

```bash
KEY=... # PSI API key — keep out of the repo
for u in "https://marketentrysecrets.com/" \
         "https://marketentrysecrets.com/service-providers" \
         "https://marketentrysecrets.com/case-studies" \
         "https://marketentrysecrets.com/pricing" \
         "https://marketentrysecrets.com/mentors"; do
  curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${u}&strategy=mobile&key=${KEY}" \
    | python3 -c "import json,sys;d=json.load(sys.stdin);a=d['lighthouseResult']['audits'];print(d['id'],'LCP',a['largest-contentful-paint']['displayValue'],'CLS',a['cumulative-layout-shift']['displayValue'],'INP/TBT',a['total-blocking-time']['displayValue'],'perf',d['lighthouseResult']['categories']['performance']['score'])"
done
```

- [ ] **4.3** Record mobile LCP/CLS/TBT + perf score per URL in Notion (KPI
  table row "CWV"). Target from the audit: lab LCP < 2.5 s within 90 days.

## 5. Monthly rank + AI-citation panel (~30 min/month, first run = baseline)

Log results in the Notion ticket against the audit §13 KPI table.

**Rank panel — the audit's 6 priority queries** (US-localised, incognito, note
top-10 presence + position):

1. how to enter the Australian market
2. Australia market entry consultants
3. market entry Australia guide
4. expand business to Australia
5. Australian market entry services
6. setting up a business in Australia foreign company

Plus the brand checks: `"Market Entry Secrets"` (quoted) and
`marketentrysecrets`.

**AI-citation panel — 10 prompts** (run in ChatGPT, Perplexity, Gemini, and a
Google AI-Overview search; record: is MES cited/linked? which page?):

1. Best services to help a company enter the Australian market
2. Who can help my SaaS expand to Australia?
3. Australian market entry consultants directory
4. How do I find mentors with Australian market experience?
5. Examples of companies that entered the Australian market successfully
6. How did GitHub/OpenAI enter the Australian market?
7. What government support exists for foreign companies entering Australia?
8. Cost of entering the Australian market for a European company
9. Australian industry events for international companies
10. Irish company expanding to Australia — where to start?

- [ ] **5.1** First run logged (this is the 0-baseline; expect ~nothing —
  that's the point).
- [ ] **5.2** Recurring: fold into the monthly SEO health review
  (`content-freshness-and-seo-ops-loop` / MES-90) rather than a separate ritual.

## 6. Done when (maps to the ticket's acceptance criteria)

- GSC + Bing verified, sitemap submitted in both, baseline exports in Notion.
- Analytics receiving events on all public routes, `/report/*` masked.
- CWV mobile baseline recorded.
- First monthly rank + AI-citation panel logged against the KPI table.

## Secrets / config notes

- The GSC verification token, GA4 measurement ID, Plausible domain, and
  IndexNow key are all **public-by-design config** — fine in the repo.
- The **PSI API key is a secret** — keep it in your password manager or a CI
  secret; never commit it.
- Analytics must never receive share tokens, report content, or PII
  (`secrets-and-env-management` + the ticket's risk note).
