# MES-80 — www → apex 301 (DNS / hosting setting, not in-repo)

**Ticket:** MES-80 / SEO-04
**Status:** Requires a one-time change in the Lovable/Cloudflare dashboard — it
cannot be fixed from this repo (no server config in a Lovable SPA deploy).

## Problem (from the MES-76 audit)

- `www.marketentrysecrets.com` → apex is currently a **302** (temporary), and
  `http://www.` chains through plain `http://` first. Temporary redirects don't
  pass ranking signals and split the site's authority between hosts.

## Required end state

A **single-hop, permanent (301)** redirect from every `www` / non-https variant
straight to the canonical `https://marketentrysecrets.com/…`, preserving the
path and query string:

| Request | Should 301 to |
|---|---|
| `http://www.marketentrysecrets.com/x` | `https://marketentrysecrets.com/x` |
| `https://www.marketentrysecrets.com/x` | `https://marketentrysecrets.com/x` |
| `http://marketentrysecrets.com/x` | `https://marketentrysecrets.com/x` |

Verify after the change:

```bash
curl -sI https://www.marketentrysecrets.com/ | grep -i '^location\|^HTTP'
# expect: HTTP/2 301  +  location: https://marketentrysecrets.com/
curl -sI http://www.marketentrysecrets.com/pricing | grep -i '^location\|^HTTP'
# expect: a single 301 hop to https://marketentrysecrets.com/pricing
```

## Verified findings (2026-07-09, via GSC MCP + live checks)

- **Still live:** `https://www.marketentrysecrets.com/` returns **302** → apex;
  `http://` apex → https is correctly 301.
- **Measured impact:** GSC URL inspection of `https://marketentrysecrets.com/` returns
  *"Duplicate, Google chose different canonical than user"* — Google's canonical is the
  **www** variant, overriding the apex canonicals declared in `src/lib/publishedOrigin.ts`.
- **Who serves the 302:** Lovable's own Cloudflare-fronted infrastructure. The domain's
  nameservers are `dns1/dns2.registrar-servers.com` (**Namecheap BasicDNS**) — there is
  **no customer-controlled Cloudflare zone**, so the Cloudflare instructions below require
  first moving DNS to a (free) Cloudflare account.
- **Lovable config:** in Lovable → Settings → Domains, apex is primary (starred) and
  `www` is a connected secondary; the UI exposes no redirect-type setting.
- **Do NOT use Namecheap "URL Redirect Record"** for www: it can 301 but cannot serve a
  valid cert for `https://www.…` — the exact URL Google currently holds as canonical.

**Fix order:** (1) check the `⋮` menu on the www row in Lovable Domains for a redirect-type
option; (2) ask Lovable support to make the www→primary redirect a 301; (3) otherwise move
DNS to a free Cloudflare account (import records from Namecheap, switch nameservers, then
apply the Redirect Rule below).

## How to set it (pick the one that matches the live setup)

**If the domain is on Cloudflare (most likely — the audit saw Cloudflare in front):**
1. DNS → ensure `www` is a proxied (orange-cloud) CNAME to the apex/Lovable target.
2. Rules → **Redirect Rules** → *Create rule*:
   - When incoming requests match: `Hostname` `equals` `www.marketentrysecrets.com`
     (add a second rule, or an OR, for `Scheme = http` on the apex to force https).
   - Then: **URL redirect** → *Dynamic* →
     Expression: `concat("https://marketentrysecrets.com", http.request.uri.path)`
     (append `http.request.uri.query` if you want to preserve query strings),
     **Status code: 301**, **Preserve query string: on**.
3. SSL/TLS → Edge Certificates → **Always Use HTTPS: On** (handles the `http://apex` → `https://apex` hop).

**If the redirect is managed in the Lovable domain settings:**
- Set the **primary domain** to `marketentrysecrets.com` (apex) and mark `www`
  as a redirect/alias to the primary, confirming the redirect type is **301**
  (permanent), not 302. If Lovable only offers a 302, do it at Cloudflare per above.

## Related in-repo work (already shipped in MES-80)

- **Trailing-slash policy:** enforced in-app via `TrailingSlashRedirect`
  (strips a trailing `/` to the slash-free canonical) plus the per-route
  canonical tags, which all declare the slash-free URL. No hosting change needed.
- **Case-study dual route & UUID→slug:** handled in-app with client-side
  `<Navigate replace>` redirects. When SEO-07 (bot-facing rendering) lands,
  revisit whether these should also emit a server-side **301** for non-JS
  crawlers; today they are client-side (same posture as the canonical tags).
