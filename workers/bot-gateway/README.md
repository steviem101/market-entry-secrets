# MES bot-gateway Worker (MES-83 Phase 2 — Prerender trial)

Cloudflare Worker that serves **prerendered HTML to crawlers** and proxies
every human request to the Lovable upstream untouched. It is the site's
**front door**: all `marketentrysecrets.com` traffic flows through it, fixing
in one place what the Lovable origin cannot do (verified 2026-07-06):

| Concern | What the Worker does |
|---|---|
| Crawler rendering (MES-83) | Known bot UAs on public pages → cached HTML from Prerender.io; **fail-open** to the SPA on any error/timeout |
| www → apex (MES-80) | Single-hop 301 preserving path + query |
| Apex sitemap (MES-79) | `/sitemap.xml` proxied to the DB-driven sitemap function (bypasses the stale origin cache) |
| Private-route headers (MES-81) | `X-Robots-Tag: noindex, nofollow` on the paths in `src/config/privateRoutes.ts` (imported — single source of truth) |

**Safety invariant:** the renderer browses anonymously — no cookies, tokens, or
auth are forwarded — so RLS decides exactly what crawlers see (cloaking-safe by
construction). Private paths are never prerendered.

## Architecture — why the Worker must be the front door (2026-07-10)

Lovable's custom-domain edge runs on **Cloudflare for SaaS**. While the domain
is connected in Lovable's project settings, Lovable holds an active *custom
hostname* claim in **their** Cloudflare account, and Cloudflare's hostname
priority hands all traffic for it to Lovable's configuration — the MES zone's
Workers, routes, and rules are silently skipped (verified live 2026-07-10:
routes attached + records proxied, Worker never executed; also documented in
Prerender's guide, https://prerender.io/blog/troubleshooting-lovable-cloudflare-integration/).

Therefore:

- The custom domain is **removed from Lovable's settings**; Lovable serves the
  app only at `market-entry-secrets.lovable.app` (`ORIGIN_HOST`).
- This Worker serves `marketentrysecrets.com` (`PUBLIC_HOST`) on the zone
  routes and proxies page traffic to the upstream (`redirect: "manual"` so an
  upstream redirect can never recurse through the Worker).
- Prerender renders pages on `PUBLIC_HOST` — its renderer re-enters the Worker,
  where the loop guard (UA contains "prerender") sends it to the upstream — so
  snapshots carry real canonical URLs.
- **Do NOT re-add the custom domain in Lovable** while the Worker routes are
  attached: the claim would instantly bypass the Worker again (harmless but
  confusing) — it is also the deliberate full-rollback lever below.

## Prerequisites (owner)

1. **Cloudflare dashboard access** to the zone `marketentrysecrets.com`
   (Workers require zone control — the spike's Open Question 1).
2. **Prerender.io account** — the 30-day Starter trial (25k renders) at
   https://prerender.io. Copy the token from the dashboard; it is a secret.
3. Workers Paid plan ($5/mo) on the Cloudflare account (sane limits).

## Deploy

```bash
cd workers/bot-gateway
npx wrangler login                      # one-time, opens browser
npx wrangler secret put PRERENDER_TOKEN # paste the Prerender token
npx wrangler deploy                     # publishes to *.workers.dev (staging)
```

### Staging checklist (on the workers.dev URL, before any prod traffic)

```bash
W=https://mes-bot-gateway.<your-subdomain>.workers.dev
# 1. Bot gets rendered HTML (x-mes-rendered: 1, real body text):
curl -s -A "Googlebot" $W/service-providers -D - -o /tmp/r.html | grep -i x-mes-rendered
grep -ci "market entry" /tmp/r.html   # expect > 0 (real content, not the shell)
# 2. Human UA gets the untouched SPA shell (no x-mes-rendered header):
curl -s -A "Mozilla/5.0 Chrome/126" $W/service-providers -D - -o /dev/null | grep -ic x-mes-rendered  # expect 0
# 3. Private path is stamped (and never rendered even for bots):
curl -s -A "Googlebot" $W/my-reports -D - -o /dev/null | grep -i x-robots-tag  # noindex, nofollow
# 4. Sitemap proxy serves the index:
curl -s $W/sitemap.xml | head -2       # <sitemapindex …
# 5. Parity spot-check: rendered title/canonical match what a browser shows.
```

### Go live (order matters)

1. Deploy this Worker config (routes + lovable.app upstream) — inert while
   Lovable still holds the custom-hostname claim.
2. Lovable project → Settings → Domains → **remove `marketentrysecrets.com`**
   (and www if listed). The claim releases and traffic flips to the Worker.
3. Zone checks: SSL/TLS mode **Full (strict)**; Rocket Loader, Signed
   Exchanges, and Bot Fight Mode **off** (Bot Fight Mode would challenge the
   crawlers and renderer this Worker exists to serve).
4. Re-run the checklist against `https://marketentrysecrets.com` and run the
   **kill-switch drill** below once, so rollback is proven, not theoretical.

## Kill switch / rollback (spike §7 — revised for front-door architecture)

⚠️ The Worker is **load-bearing**: deleting its route takes the site down (the
public domain would have no origin). Rollback levers, least → most drastic:

1. **Rendering-only:** set `RENDERING_ENABLED = "false"` in `wrangler.toml` →
   `npx wrangler deploy`. Keeps the 301/sitemap/header fixes and the upstream
   proxy, stops all Prerender traffic.
2. **Full rollback to pre-Worker serving:** re-add `marketentrysecrets.com`
   in Lovable project settings → Lovable's custom-hostname claim re-takes the
   hostname at Cloudflare's edge (bypassing the Worker), exactly as before
   2026-07-10. Then optionally delete the Worker routes.
3. **Vendor exit:** Prerender is reached only through this Worker — swapping
   to Cloudflare Browser Rendering later is a Worker-only change.

## Verification after go-live (maps to MES-83 acceptance criteria)

- `curl -A "Googlebot"` on the 10 representative URLs → full HTML with
  route-specific title/meta/canonical/JSON-LD/body.
- GSC URL Inspection (the Worker treats `Google-InspectionTool` as a bot) →
  rendered, indexable page.
- Same URLs without a bot UA → byte-identical SPA behaviour.
- Kill-switch drill performed and re-verified.

## Costs & monitoring

Prerender Starter: $49/mo after the 30-day trial, 25k renders included —
~1,450 URLs at a 7-day cache ≈ 6–10k renders/mo. The Worker renders by
**pathname only** (query strings and trailing slashes are normalized away), so
each page has exactly one cacheable render and spoofed-bot `?x=1..N` spam
cannot burn the quota. Watch the render count in the Prerender dashboard
during the trial anyway; a big overshoot would mean a bot hammering many
distinct real paths.

## Follow-ups (not in this Worker)

- ~~Real 404s for unknown slugs~~ — DONE: `<NoIndex notFound />` emits
  `<meta name="prerender-status-code" content="404">` on every not-found
  branch, so Prerender returns true 404s to crawlers once rendering is on.
- v2 cache invalidation (Supabase → Prerender recache API) only if stale
  snapshots prove to matter during the trial.
