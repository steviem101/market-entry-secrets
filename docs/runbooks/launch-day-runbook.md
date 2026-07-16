# Launch-day runbook — MES public go-live (MES-188)

**Purpose:** the single ordered sequence to take Market Entry Secrets from "code-ready" to "open to the public." Every code-side launch blocker from the prelaunch audit is already closed and merged (see the 2026-07-16 reconciliation at the top of [`docs/prelaunch-audit.md`](../prelaunch-audit.md)). What remains is **operational** — the steps below, in this order. Each step links to its detailed runbook where one exists.

> **Owner:** founder (these are dashboard/secret/deploy actions the repo can't do). Do them in order — later steps depend on earlier ones. Budget ~60–90 min plus a live test purchase.

---

## Pre-flight (5 min)

- [ ] `main` is green and carries the MES-188 bundle (T12/T2/T5a/T17/T1/T3/T8/T13/T16a/A3/T7 all merged).
- [ ] You have access to: the **live** Stripe account, the Supabase dashboard for `xhziwveaiuhzdoutpgrh`, and the Supabase Edge **Secrets** page.
- [ ] Enable **PITR / daily backups** in Supabase (Database → Backups) — do this first so everything after is recoverable.

---

## Step 1 — Supabase auth dashboard hardening (10 min)

Config-file values are already correct (`supabase/config.toml`: `site_url = https://marketentrysecrets.com`, redirect allowlist, `otp_expiry = 3600`), but the **hosted dashboard is not auto-synced** — confirm it by hand. Detailed steps: [`MES-33-dashboard-runbook.md`](./MES-33-dashboard-runbook.md).

- [ ] Auth → URL Configuration: **Site URL** and **Redirect URLs** match `config.toml` (apex + www; no Lovable preview as the primary).
- [ ] Auth → Providers → Email: **Confirm email = ON**.
- [ ] Auth → Policies: **Leaked-password protection = ON**; OTP expiry = 3600s.
- [ ] Confirm every prod secret in §12 of `CLAUDE.md` is set in Edge Secrets (no blanks).

---

## Step 2 — Stripe LIVE cutover (20 min)

Full procedure: [`stripe-live-cutover.md`](./stripe-live-cutover.md) + [`mes-195-golive.md`](./mes-195-golive.md). The app is currently pointed at the **sandbox**; this flips it to live. Secrets are runtime config, so this is a secret swap, not a deploy.

- [ ] In the **live** Stripe account, confirm the **$199 Growth** price exists (create if not); **archive** the old $99 price.
- [ ] Set `STRIPE_GROWTH_PRICE_ID` (and `STRIPE_SCALE_PRICE_ID` if used) to the **live** price ids in Supabase Edge Secrets.
- [ ] Set `STRIPE_SECRET` to the **live** secret key.
- [ ] Create a **live** webhook endpoint → `https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/stripe-webhook`, event **`checkout.session.completed`**; set `STRIPE_WEBHOOK_SECRET` to that endpoint's signing secret.
- [ ] Set `FRONTEND_URL = https://marketentrysecrets.com`.
- [ ] Confirm `PAYMENTS_ALERT_SLACK_CHANNEL` + `SLACK_BOT_TOKEN` are set (payment failure alerts).

> ⚠️ Do NOT flip `ENTITLEMENTS_ENABLED` yet — do it in Step 4, *after* the webhook code is deployed (Step 3), so a live purchase in the gap can't half-process.

---

## Step 3 — Deploy the manual edge functions (10 min)

These are **not** in the auto-deploy workflow, so the merged code isn't live in prod until you deploy it by hand. Without this, the report-ready email (T16a) and the fulfilment/entitlement grants (T8) don't run.

```bash
cd <repo> && git checkout main && git pull origin main
supabase functions deploy send-email               --project-ref xhziwveaiuhzdoutpgrh
supabase functions deploy stripe-webhook           --project-ref xhziwveaiuhzdoutpgrh
supabase functions deploy stripe-webhook-reconcile --project-ref xhziwveaiuhzdoutpgrh
```

- [ ] All three report success. (Deploy from a **fresh pull of `main`** — a stale local checkout has shipped old code before.)

---

## Step 4 — Flip entitlements ON (2 min)

- [ ] Set `ENTITLEMENTS_ENABLED = true` in Supabase Edge Secrets. This activates the `service_entitlements` grants on `checkout.session.completed` (walkthrough_call / mentor_intro / ecosystem_intro for Growth; strategy_session + more for Scale).

---

## Step 5 — Ops monitoring (10 min)

- [ ] Confirm `stripe-webhook-reconcile` is scheduled (pg_cron, every 15 min) and its Slack alerts land in `PAYMENTS_ALERT_SLACK_CHANNEL` (it pages on stuck `payment_webhook_logs` rows).
- [ ] Confirm the degraded-report-run alert (MES-199/T17) routing is enabled for the ops channel.
- [ ] (Recommended) Stand up external error monitoring — the app currently only `console.error`s; a Sentry/LogRocket hook catches client crashes the ErrorBoundary swallows.

---

## Step 6 — Launch-day smoke test (15 min) — the go/no-go gate

This is the **T18 fulfilment dry-run** against live. Use a real card (refund after) or the 100% promo if one is live.

- [ ] **Growth purchase** (fresh free account): checkout → redirect → within the polling window the report's paid sections unlock in place (no reload); `user_subscriptions.tier = growth`; **3 entitlement rows**; the **report-ready email** arrives with the "What happens next" Calendly block; the **booking banner** shows on the report.
- [ ] **Scale purchase** (another fresh account): tier = scale; Scale entitlements; if `LEAD_DELIVERY_ENABLED` is on, the matched lead lists land in the member hub.
- [ ] **AUD-005 re-test** (the paywall-bypass that was the top P1): attempt a **lead-database** purchase and confirm it grants only `lead_purchase`, never `growth`/`scale`/`enterprise`.
- [ ] `payment_webhook_logs` shows each event `processed` (no `needs_attention`).

✅ All green → **LAUNCH.** Any red → hold and diagnose before opening to the public.

---

## Post-launch (optional, staged — not gates)

- **`LEAD_DELIVERY_ENABLED = true`** — turn on automatic Scale/Enterprise lead delivery once you're comfortable (run the pre-enable check in PR #472 first).
- **MES-148 quality/data flags** — stage per [`mes-148-flag-rollout.md`](./mes-148-flag-rollout.md) / [`mes-148-phase5-rollout.md`](./mes-148-phase5-rollout.md). Keep off at launch.
- **golden-eval** — after the next CI run prints the real judge-400 body (PR #474 added that logging), cap the judge input if it confirms prompt-too-long. Quality gate, not a go-live gate.
- **AUD-053** — `git rm --cached .env` before any real secret is ever committed (public values only today).

---

## Rollback

- **Payments wrong:** set `ENTITLEMENTS_ENABLED = false` and/or revert the Stripe secrets to sandbox — no code change needed (all runtime config).
- **A feature misbehaves:** each risky feature is behind a default-off flag (`LEAD_DELIVERY_ENABLED`, MES-148 flags) or a revertable PR.
- **Auth issue:** dashboard settings are reversible; `config.toml` is the source of truth to re-sync from.
