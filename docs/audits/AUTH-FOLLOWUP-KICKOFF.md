# MES Auth Remediation — Implementation Session Kickoff

> Handover prompt for a **fresh Claude Code session** to implement the prioritised fixes
> from the MES-33 auth & account-journey audit. Follow-up to the audit (`AUTH-JOURNEY-AUDIT.md`).
> Paste the fenced block below as the opening message of the new session.

## Status at handover
- **#254** — audit doc (`docs/audits/AUTH-JOURNEY-AUDIT.md`) — **merged**.
- **#255** — SEC-05 migration (trigger locking `profiles.stripe_customer_id` to service-role)
  + `updateProfile` key-stripping + password min length 6→8 (reset + signup) — **merged**.
- Everything else in the audit's P0–P3 plan is still open. Split into **Track A** (code, doable
  in-session) and **Track B** (Supabase dashboard-only, needs a human).

---

```
# MES Auth Remediation — Implementation Session (follow-up to MES-33 audit)

## Your role
Implement the prioritised fixes from the auth & account-journey audit. Work in small,
reviewable PRs — one ticket (or a tight cluster) per PR. This is implementation, not
re-audit: the analysis is done and merged.

## Read first (source of truth)
`docs/audits/AUTH-JOURNEY-AUDIT.md` — full audit: 7 journey maps, root causes, the
P0–P3 plan, and the sub-ticket table (MES-33a–q). Read §4 (fix plan), §5/§6 (magic-link
& OAuth diagnoses), and §8 (security addendum) before starting.

## Repo / workflow
- Repo: steviem101/market-entry-secrets. Default branch: main.
- Branch per PR: `claude/mes-33<letter>-<slug>` (e.g. claude/mes-33d-resume-checkout).
- Stack: React 18 + Vite + TS + shadcn/ui; Supabase (Postgres/Auth/Edge Functions); Stripe.
- Verify before pushing: `npx tsc --noEmit` and `npm test`. (ESLint devDeps may be absent.)
- Supabase migrations go in `supabase/migrations/` and are validated by the "Supabase
  Preview" CI check on the PR — never apply directly to prod.

## Already DONE (do not redo)
- #254: audit doc merged.
- #255: SEC-05 migration (trigger locking profiles.stripe_customer_id to service-role) +
  updateProfile key-stripping + password min length 6→8 (reset + signup). MERGED.

## GUARDRAILS (stop and ask before doing any of these)
- RLS / grants / destructive migrations → ship as a reviewable migration; call out risk.
- Stripe/payments logic, secrets, broad data writes → approval-gated.
- Production Supabase dashboard config (Auth URLs, OAuth providers, email templates) is
  DASHBOARD-ONLY — you cannot change it from the repo. Produce a runbook for the human
  (see Track B) rather than attempting it.
- Keep email/password sign-in working as a fallback through any OAuth change.

## TRACK A — code tickets you CAN implement (recommended order)
Each: implement, tsc+test, open PR referencing the ticket, keep diff tight.

1. MES-33e (P1) — Pricing post-payment redirect. After Stripe success on /pricing, route
   the user to /my-reports (or the originating report), not back to the buy page.
   Files: src/pages/Pricing.tsx, src/components/PaymentStatusModal.tsx.
2. MES-33d (P1) — Persist + auto-resume anonymous→checkout. When startCheckout returns
   {needsAuth:true}, remember the pending {tier} and re-invoke checkout after auth; pass
   returnTo. Files: src/components/sections/PricingSection.tsx, src/hooks/useCheckout.ts.
3. MES-33g (P2) — Thread returnTo through every AuthDialog entry point that currently
   defaults to '/': PaywallModal, header AuthButton, Leads, LeadDatabaseDetailPage,
   PricingSection. (ReportCreatorV2 already does it — mirror that.)
4. MES-33h (P2) — Lead-purchase return: strip stripe_status param + poll
   lead_database_purchases so the UI flips to "owned" without a manual refresh.
   File: src/pages/LeadDatabaseDetailPage.tsx (+ useLeadCheckout).
5. MES-33i (P2) — Checkout polling window: extend ReportView poll ~30s + "still
   unlocking…" state + manual "refresh access". File: src/pages/ReportView.tsx.
6. MES-33k (P3) — Sign-out navigate('/') and redirect protected pages on sign-out.
   File: src/components/auth/UserDropdown.tsx.
7. MES-33q (P3) — Narrow welcome-email trigger to genuine first signup + neutralise
   signup "User already registered" enumeration. Files: src/hooks/auth/useAuthState.ts,
   src/hooks/auth/authService.ts.
8. MES-33j (P2) — Version-control auth config: add an [auth] block to supabase/config.toml
   (site_url, additional_redirect_urls, [auth.email.template.*]) so dashboard config stops
   drifting. Coordinate values with Track B.
9. SEPARATE BUG (found during MES-33m) — OnboardingDialog writes company_name/country/
   target_market/use_case/onboarding_completed, but those columns are ABSENT from the live
   profiles table (stranded migrations) → onboarding upserts fail in prod. Decide: add the
   columns via migration, or drop the fields. Verify against live schema first.

## TRACK B — DASHBOARD-ONLY (produce a runbook; the human executes)
These are the P0s actually blocking magic-link/OAuth in production. Write exact steps
(fields, URLs, values) for the human; do not attempt from the repo.
- MES-33a (P0): Auth → URL Configuration → set Site URL = https://marketentrysecrets.com;
  Redirect allow-list = {prod, www}/auth/callback + /reset-password (+ any preview origins
  to keep). This fixes magic-link/reset/confirm/OAuth all landing on Lovable.
- MES-33b (P0): Google + Azure providers. Add the SUPABASE callback
  https://xhziwveaiuhzdoutpgrh.supabase.co/auth/v1/callback as the Authorized redirect URI
  in Google Cloud AND Azure AD app registrations; complete Azure tenant + client secret;
  enable both providers in Supabase.
- MES-33c (P1): Brand the magic-link / confirm-signup / reset email templates (ideally via
  Resend custom SMTP to match supabase/functions/_shared/email/).
- MES-33n (P1): Auth → Policies → enable Leaked Password Protection; raise min password
  length to 8 to match the client. MES-33o (P1): set email OTP expiry < 1 hour.
- MES-33p (P2): schedule the Postgres security-patch upgrade.

## Definition of done (per PR)
tsc + tests green; Supabase Preview green for any migration; PR body links the ticket and
states intended-vs-actual behaviour fixed; no prod config touched directly; guardrail items
flagged for approval. Verify redirect fixes against the flows in audit §7's redirect table.

## First action
Start with MES-33e (smallest, highest user-visible value), open the PR, then MES-33d.
Ask me before starting anything in Track B or touching RLS/payments/secrets.
```
