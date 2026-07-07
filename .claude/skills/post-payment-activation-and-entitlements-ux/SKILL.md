---
name: post-payment-activation-and-entitlements-ux
description: Post-Stripe-redirect UX — polling for the webhook, pending states, and never silently re-paywalling a paid user. Use when touching the checkout return flow, subscription refresh, or any "did my upgrade take effect" surface.
---

Last verified: 2026-07-07

# Post-Payment Activation & Entitlements UX

## Purpose
Bridge the gap between "Stripe charged the card" and "the webhook flipped the tier" so a paying
user never sees a paywall for content they just bought. This is the UX half; the server invariants
are owned by `stripe-payments-and-webhooks`.

## When to trigger / when NOT to
- **Trigger:** the checkout return handler, subscription refetch/polling, upgrade CTAs' success
  states, "refresh access" affordances.
- **Don't trigger:** webhook/checkout server logic or entitlement invariants (→
  `stripe-payments-and-webhooks`); tier matrix (→ `freemium-tier-gating`).

## Preconditions — inspect first
- `src/pages/ReportView.tsx:40-106` (the reference polling implementation),
  `src/pages/Pricing.tsx:15-34`, `src/hooks/useSubscription.ts` (the imperative `refetch` that
  returns the tier), `src/hooks/useCheckout.ts` (redirect + iframe handling).

## The race you're handling
Stripe redirects back with `?stripe_status=success` **before** the `checkout.session.completed`
webhook has necessarily upserted `user_subscriptions`. So the client must poll for the tier change,
not assume it. The tier is server-truth (`user_subscriptions`, own-SELECT RLS, service-role-write);
the client only reads it.

## Playbook
1. **Reuse the ReportView pattern** (`ReportView.tsx:40-106`): read `stripe_status`, immediately
   strip the URL params (`navigate(..., { replace: true })`), then poll `refetchSubscription()`
   **every 2s up to 15 attempts (~30s)** through states `idle → polling → unlocked | timeout`.
   On timeout, show a manual **"refresh access"** button (`handleRefreshAccess`) — never a dead end.
2. **Never silently re-paywall.** While polling, show a pending/unlocking state, not the paywall.
   After unlock, reveal content without a full reload or regeneration (gated content is already in
   the report JSON marked `visible:false`; upgrades flip visibility — see `freemium-tier-gating`).
3. **Validate server-side, not on the URL param.** `?stripe_status=success` is attacker-settable;
   it may show an optimistic pending state but entitlement must come from the polled
   `user_subscriptions` tier, never from the query string alone.
4. **Every entry point needs a return path.** Post-auth/post-payment resume is under-wired: only
   some flows pass `returnTo` (MES-35 R4, `AUTH-JOURNEY-AUDIT.md` W4). When you add a checkout
   entry point, thread a return path so the user lands back where they started, upgraded.

## Red flags / approval gates
- A success modal that reports "upgraded" from the URL param with **no** subscription re-poll — the
  `/pricing` modal does exactly this and can show stale `free` until reload (MES-111 AUD-011). Fix
  by reusing the ReportView poll.
- Trusting `stripe_status`/`session_id` from the URL as proof of entitlement.
- Polling forever with no timeout + manual fallback (spinner of death).

## Good / bad examples
- ✅ `ReportView`: strip params → poll 15×2s → unlock in place → "refresh access" on timeout.
- ❌ `Pricing.tsx`: `stripe_status=success` → show success modal, no re-poll (AUD-011) → user
  believes they're upgraded while `useSubscription` still returns `free`.
- ❌ Redirecting a just-paid user to a paywalled route with no pending state → they see the paywall
  for content they own.

## Self-check rubric (pass/fail)
- [ ] Return handler strips URL params immediately (`replace: true`).
- [ ] Polls the real subscription (2s × ~15) with an explicit timeout + manual refresh fallback.
- [ ] Entitlement decided by polled `user_subscriptions` tier, never the URL param alone.
- [ ] No paywall shown during the pending window; unlock happens without regeneration.
- [ ] The entry point threads a `returnTo` so the user resumes where they started.

## Evidence
MES-111 pre-launch audit: `docs/prelaunch-audit.md` AUD-011 (Pricing no re-poll), §7 (report-view
read path verified safe via `get_tier_gated_report`). Inspected 2026-07-07:
`src/pages/ReportView.tsx:40-106`, `src/pages/Pricing.tsx:15-34`, `src/hooks/useSubscription.ts`,
`src/hooks/useCheckout.ts`. Audit: `docs/audits/AUTH-JOURNEY-AUDIT.md` W4.1/W4.2 (return-path gaps),
`docs/audits/MES-35-platform-readiness-scan.md` R4.

## Common MES pitfalls (real)
1. **`/pricing` success modal doesn't re-poll** — shows "upgraded" from the URL param; tier stays
   stale until reload (MES-111 AUD-011). ReportView already has the correct pattern to copy.
2. **Post-payment dead-ends** — Pricing dumps the user back on `/pricing` with no resume
   (`AUTH-JOURNEY-AUDIT.md` W4.2).
3. **Webhook lag mistaken for failure** — the tier legitimately isn't set for a few seconds after
   redirect; a no-poll UI reads that as "payment failed."
4. **URL param treated as entitlement** — `stripe_status=success` is client-settable; only the
   polled subscription tier proves the upgrade.
