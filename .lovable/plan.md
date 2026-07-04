## Scope: everything still pointing at `lovable.app`

SEO tags, sitemap, robots, and frontend fallbacks are already on `marketentrysecrets.com` (previous turn). Remaining lovable.app references break into three buckets — **code**, **backend config the user must change**, and **cosmetic/docs (leave alone)**.

### Bucket A — Code to update (functional impact)

1. **`supabase/functions/_shared/http.ts`** — CORS allow-list and default response origin. Change the hardcoded `https://market-entry-secrets.lovable.app` fallback to `https://marketentrysecrets.com` and add `https://www.marketentrysecrets.com` to `ALLOWED_ORIGINS`. Keep the `.lovable.app` regex so previews still work.
2. **`supabase/functions/knowledge-search/index.ts`** — same allow-list pattern; update the hardcoded lovable.app entry to the custom domain.
3. **`supabase/functions/report-quality-rollup/index.ts`**, **`report-quality-loop/index.ts`**, **`slack-notify/reportQuality.ts`** — `REPORT_BASE_URL` used to build Slack deep-links to reports. Internal-only (Slack `#report-quality`), but still worth switching so links land on the custom domain.
4. **Redeploy** the four affected edge functions after edits.

### Bucket B — Backend/dashboard config (user action, no code)

These live outside the repo. I'll list them; you do them in the respective dashboards:

1. **Supabase Auth → URL Configuration**
   - **Site URL**: set to `https://marketentrysecrets.com` (currently likely the lovable.app host — this is what controls where password-reset / magic-link / confirmation emails land).
   - **Redirect URLs allow-list**: add `https://marketentrysecrets.com/auth/callback`, `https://www.marketentrysecrets.com/auth/callback`, `https://marketentrysecrets.com/reset-password`. Keep the lovable.app entries so previews still authenticate.
   - Without this, auth emails still send users to lovable.app regardless of what the frontend requests (documented in `docs/audits/AUTH-JOURNEY-AUDIT.md`).
2. **Supabase Edge Function secret `FRONTEND_URL`** — set to `https://marketentrysecrets.com`. This drives Stripe checkout success/cancel redirects (`create-checkout`) and the report-view URL emitted by `generate-report`.
3. **Stripe** — no per-URL config change needed; Stripe redirects are built from `FRONTEND_URL` above.
4. **Lovable → Project Settings → Domains** — set `marketentrysecrets.com` as the **Primary** domain so `market-entry-secrets.lovable.app` 301-redirects to it (nudges users and reinforces canonical to Google).

### Bucket C — KB rows already in the DB (data, not code)

Migration `20260704095538_remote_baseline.sql` populated `mes_knowledge_base.metadata->>'source_url'` with lovable.app URLs for ~8 content types (events, mentors, investors, countries, etc.). These are baked into rows, not regenerated on the fly.

- **Impact**: if reports surface these `source_url` values as links, they'll point at lovable.app (which then redirects to the custom domain if you set Primary in Bucket B step 4 — so functionally fine, just cosmetically wrong).
- **Fix (optional, later)**: a one-off `UPDATE mes_knowledge_base SET metadata = jsonb_set(metadata, '{source_url}', to_jsonb(replace(metadata->>'source_url', 'market-entry-secrets.lovable.app', 'marketentrysecrets.com'))) WHERE metadata->>'source_url' LIKE '%lovable.app%';` — I'd only run this if you confirm you want it, since it rewrites historical data.
- **Also**: the fanout SQL functions in the migration (that regenerate KB rows) still hardcode the lovable.app host, so any future fanout re-run will re-introduce lovable URLs. A follow-up migration would flip those `source_url` literals to `https://marketentrysecrets.com`.

### Bucket D — Docs & history (leave alone)

`docs/audits/*`, `docs/redesign/*`, `design_handoff_ireland_country_page/*`, `CLAUDE.md`, `supabase/migrations_archive/*`, `scripts/fix_csv.py` all mention lovable.app but are historical artefacts / dev notes. No user impact. Not touching.

### Not doing (unless you say so)
- The KB `UPDATE` in Bucket C (data rewrite).
- A new migration to swap fanout-function URL literals (Bucket C follow-up).
- The Bucket B dashboard changes — those are yours.

### Proposed build order
1. Edit the 5 edge-function files in Bucket A.
2. Redeploy those functions.
3. Report back; you handle Bucket B in the Supabase + Lovable dashboards.
4. Decide on Bucket C.

Confirm and I'll implement Bucket A.
