# Authentication & Account-Journey Audit (MES-33)

> **Type:** Audit / spike — **no production auth, RLS, payment, or OAuth config changed.**
> **Branch:** `claude/mes-auth-freemium-audit-8b3eg4` (ticket reference: `mes-33-auth-journey-audit`)
> **Date:** 2026-06-29
> **Scope:** Customer auth + freemium + tier-upgrade journeys on the MES platform (Supabase project `xhziwveaiuhzdoutpgrh`).
> **Author:** Codebase + config inspection. Live production walk-throughs and Supabase **dashboard** settings (Site URL, redirect allow-list, email templates, OAuth provider config) could not be read from the repo and are flagged where a dashboard check is required to confirm.

---

## 0. Executive summary

The application-layer auth code is in good shape: there is a single shared `AuthDialog`, a clean `useAuth`/`useAuthState` context, an open-redirect-safe return-path helper, server-side tier gating for reports (`get_tier_gated_report` RPC), and a service-role-only lock on `user_subscriptions.tier` (SEC-01) that prevents paywall self-upgrade.

**Almost every reported production bug traces to configuration that lives in the Supabase dashboard, not in the repo** — there is **no `[auth]` block in `supabase/config.toml`**, so Site URL, the redirect allow-list, the auth email templates, and the Google/Azure provider settings are entirely un-versioned and unmanaged. That single gap explains the magic link opening Lovable, the bare unbranded email, and the OAuth flakiness.

The remaining issues are front-end redirect/UX gaps: several auth entry points don't set a post-auth return path (so users land on `/`), the anonymous→checkout flow doesn't auto-resume after sign-in, and the freemium 3-view limit is enforced **100% client-side**.

| Area | Verdict |
|------|---------|
| Email/password sign-in & sign-up | ✅ Works; minor UX gaps |
| Magic link | ❌ Bare email + opens Lovable (dashboard config) |
| Google / Microsoft OAuth | ❌ Misconfigured (dashboard provider + redirect URIs) |
| Password reset | ⚠️ Works if Site URL/allow-list correct; same Lovable risk |
| Freemium 3-view gate | ⚠️ Client-side only (by design, but bypassable) |
| Report tier gating | ✅ Enforced server-side via RPC |
| Tier self-upgrade abuse | ✅ Closed (SEC-01) |
| Stripe checkout & provisioning | ✅ Core works; ⚠️ redirect/resume UX gaps |
| Post-auth redirects | ❌ Inconsistent — several land on `/` |

---

## 1. Auth architecture map (as-built)

```
AuthProvider (contexts/AuthContext.tsx)
 └─ useAuthState (hooks/auth/useAuthState.ts)
      ├─ supabase.auth.getSession() on mount → fetchUserData(profiles + user_roles)
      ├─ supabase.auth.onAuthStateChange() listener
      └─ fires 'welcome' email on SIGNED_UP/SIGNED_IN (idempotent server-side)
 └─ useAuth (hooks/useAuth.ts)  ← public hook
      └─ useAuthService (hooks/auth/authService.ts)
           signInWithEmail / signUpWithEmail / signInWithProvider
           signInWithMagicLink / signOut / updateProfile / resetPassword

UI:  AuthDialog (components/auth/AuthDialog.tsx)  ← the ONLY sign-in surface
     AuthButton / UserDropdown (header)
     ProtectedRoute (in-page fallback, no redirect)

Routes (src/App.tsx):
     /auth/callback  → AuthCallback   (OAuth + magic-link landing)
     /reset-password → ResetPassword  (recovery completion)
     (no /login or /signin — auth is modal-only)

Post-auth return path:  src/lib/authReturnPath.ts
     localStorage 'mes_auth_return_path', open-redirect-safe (same-origin '/...' only)
```

**Supabase client** (`src/integrations/supabase/client.ts`) is created with **no explicit auth options** → relies on supabase-js defaults (`detectSessionInUrl: true`, default flow). URL is the production Supabase project; key is the public anon key (correct to ship).

**Key structural fact:** `supabase/config.toml` contains **only `[functions.*]` blocks — no `[auth]` section.** All Supabase Auth behaviour (Site URL, redirect allow-list, email templates, provider credentials) is dashboard-managed and therefore invisible to code review and not reproducible across environments. This is the single biggest root-cause multiplier in this audit.

---

## 2. Journey-by-journey findings

### Journey 1 — Sign-up → authenticated (email/password baseline)

**Flow:** `AuthDialog` (Sign Up tab) → `signUpWithEmail(email, password, {first_name,last_name})` with `emailRedirectTo: ${window.location.origin}/auth/callback` → toast "Please check your email to verify your account." → user clicks email link → `/auth/callback` → `consumeAuthReturnPath() ?? '/'` → navigate.

DB triggers on `auth.users` insert create `profiles`, assign `user` role, and create a `user_subscriptions` row at tier `free`.

**Strengths:** Clean; metadata captured; usage-tracking localStorage cleared on success; welcome email fired idempotently from the auth-state listener (covers OAuth where `SIGNED_UP` may not fire).

**Weaknesses:**
- **W1.1 (P2):** The signup toast asserts "check your email to verify" unconditionally — but whether a confirmation email is sent depends on the dashboard "Confirm email" setting. If confirmation is **on**, the confirmation email is the bare default template and its link is subject to the same Site-URL/Lovable problem as the magic link (§3). If **off**, the toast is misleading (the user already has a session).
- **W1.2 (P2):** The standard (non-reassurance) `AuthDialog` does **not** pass `returnTo`, so email/password signup that requires confirmation will, after the user clicks the email link, land on `/` rather than where they started.

**Root cause:** Dashboard email-confirmation setting + un-versioned templates.
**Risk:** Low (functional), Medium (trust/branding).

---

### Journey 2 — Freemium gating (3 views before forced sign-in)

**Flow:** `useUsageTracking` (`FREE_TIER_LIMIT = 3`) counts anonymous views in `localStorage` (`view_count`, per-item `viewed_{type}_{id}`, plus a `session_id` UUID). `FreemiumGate` (detail pages) and `ListingPageGate` (listing pages) decide once on auth-resolution whether to render content or `PaywallModal`. Each tracked view also best-effort `INSERT`s into `user_usage`. Signed-in users bypass entirely (`canView = user ? true : count < 3`).

**Consumers:** ~12 detail pages (content, case-study, mentors, service_providers, agencies, investors, innovation, events, leads, country, location, sector) + 4 listing pages (case-studies, mentors, events, leads).

**Server-side enforcement determination — important:**
- `user_usage` has `INSERT WITH CHECK (true)` and **its SELECT policy was dropped** (`20260607232610_sec_02…`) so clients can't read counts back. The table is **write-only analytics**, not an enforcement mechanism.
- There is **no RLS or edge-function gate** that stops an anonymous client from reading the underlying directory rows. The directory tables are public-read by design.
- **Conclusion: the 3-view freemium limit is 100% client-side.** Clearing `localStorage` (or using incognito) resets it. This is acceptable for a soft conversion nudge on otherwise-public content, but it is **not** a security control and should not be described as one.

> Contrast: **report** tier gating *is* enforced server-side (Journey 4 / §4d). Freemium directory gating is not — and given the content is public-read, server-enforcing it would be a product decision, not just a security fix.

**Weaknesses:**
- **W2.1 (P2):** `PaywallModal` opens `<AuthDialog>` **without `returnTo`** → after OAuth/magic-link the user lands on `/`, losing the page that triggered the gate.
- **W2.2 (P3):** Count is derived from two localStorage keys kept in sync with `Math.min`; minor desync edge cases on the boundary view.
- **W2.3 (P3):** No server enforcement — document as intentional, or (product decision) move gating behind an RPC that returns limited rows for anonymous sessions.

**Risk:** Low.

---

### Journey 3 — Report-generation sign-up

**Active flow is V2** (`report_creator_v2` feature flag **defaults to `true`** — `src/lib/featureFlags.ts`). `/report-creator` renders `ReportCreatorV2` unless `?v2=0`.

**V2 (default) flow:** intake saved to `localStorage` (`mes_intake_form_draft_v2`, UI position in `mes_intake_v2_ui`) → `generate()` returns `{needsAuth:true}` when anonymous → `AuthDialog` opens in **reassurance** mode (SSO-first + magic link, green "your answers are saved" banner) **with `returnTo = pathname+search`** → after auth a `user`-watching effect clears the dialog and auto-runs generation → navigate to `/report/{id}` (or `/my-reports` on failure). **This is the best-built journey in the app.**

**Weaknesses:**
- **W3.1 (P3):** Legacy `ReportCreatorLegacy` (only via `?v2=0`) opens `AuthDialog` **without `returnTo`** (`ReportCreator.tsx:161`) and relies on a `user`-watching effect to auto-submit. For OAuth/magic-link the round-trip goes through `/auth/callback` with no return path → lands on `/` and the draft auto-submit effect never runs on the creator page. Low priority because it's off by default, but it's a live trap if anyone links `?v2=0`.

**Risk:** Low.

---

### Journey 4 — Tier upgrade (Freemium → Growth / Scale via Stripe)

**Flow:** `PricingSection.handleSelectTier` → `useCheckout.startCheckout({tier, returnUrl: pathname})` → `create-checkout` edge function (verify_jwt + in-code token/owner check) creates a Stripe **one-time `mode:"payment"`** session with verified `metadata.{tier,supabase_user_id}` and `success_url/cancel_url = {safeReturnUrl}?session_id=…&stripe_status=success|cancel` → Stripe → redirect back → page reads `stripe_status` → `stripe-webhook` (signature-verified) upserts `user_subscriptions.tier` and updates `user_reports.tier_at_generation`, dedup via `payment_webhook_logs`.

`ReportView` handles the return well: detects `stripe_status=success`, cleans the URL (`navigate(replace)`), polls `refetchSubscription()` every 2s ×8, unlocks sections inline, handles `cancel` and the not-signed-in case.

**Strengths:** Verified metadata set *after* spread (no client override); return-URL allowlist (`FRONTEND_URL` + prod domains) blocks open redirect; price-id cross-checked against `lead_databases` for direct purchases; webhook idempotent; returns 500 on the critical subscription upsert so Stripe retries.

**Weaknesses / bugs:**
- **W4.1 (P1) — anonymous→checkout doesn't resume.** `startCheckout` returns `{needsAuth:true}` and `PricingSection` opens `AuthDialog` (no `returnTo`, no pending-checkout memory). After sign-in: email/password leaves the user on `/pricing` having to click the tier again; **OAuth/magic-link dumps them on `/`** with no memory they were buying. This is the "restart the journey lands you on the wrong page" report.
- **W4.2 (P1) — Pricing return is a dead-end.** After payment on `/pricing`, the success modal closes back to `/pricing`. The user paid but is left on the buy page with no path to their upgraded report/dashboard. Should route to `/my-reports` (or the originating report).
- **W4.3 (P2) — back-button after success.** Browser Back from `/pricing` (post-clean) → the Stripe-hosted URL (stale/expired) → confusing error. Pricing cleans its own params but can't fix the Stripe history entry; a post-success redirect to a different route (W4.2) mitigates this.
- **W4.4 (P2) — lead-purchase return.** `/leads/{slug}` return does **not** strip `stripe_status` and does **not** poll `lead_database_purchases`; the user may still see "Buy Now" until a manual refresh, and the success URL is shareable.
- **W4.5 (P2) — polling window too short.** 16s (8×2s) can lose a slow webhook; section stays locked with no "still unlocking…" state and no manual "refresh access" affordance.
- **W4.6 (P3) — provisioning depends on `FRONTEND_URL`.** If `FRONTEND_URL` is the Lovable URL, every Stripe return goes to Lovable even when the buyer started on `marketentrysecrets.com` (same class as the magic-link bug). `useCheckout` does send `origin+path`, which is allow-listed, so this mainly bites the fallback path — **verify `FRONTEND_URL` = `https://marketentrysecrets.com` in prod.**

**Risk:** Medium (UX/conversion); provisioning correctness itself is sound.

---

### Journey 5 — Magic link deep dive (bare email + opens Lovable)  ⬅ root-cause target (a)

**Code path:** `signInWithMagicLink` → `supabase.auth.signInWithOtp({ email, options:{ emailRedirectTo: ${window.location.origin}/auth/callback }})`.

**Why the link opens Lovable (root cause):**
1. Supabase only honours `emailRedirectTo` if that exact URL is on the **Redirect URLs allow-list** in the dashboard. **If it isn't, Supabase substitutes the project's `Site URL`.** If `Site URL` (or the only allow-listed origin) is the Lovable preview (`*.lovable.app` / `id-preview-*.lovable.app`), the link lands on Lovable regardless of where the user started.
2. The published deployment in CLAUDE.md is `market-entry-secrets.lovable.app`; the intended customer domain is `marketentrysecrets.com`. If the custom domain was never promoted to **Site URL**, every auth email points at Lovable.

**Why the email is bare (root cause):** The branded email system (`supabase/functions/_shared/email/`) only renders **transactional** Resend emails (welcome, payment, nurture, report-completed). It contains **no magic-link / recovery / confirmation template** — those are Supabase Auth's built-in default templates, which are unstyled and un-branded unless customised in the dashboard or via custom SMTP.

**Exact fix (dashboard, approval-gated):**
- Set **Authentication → URL Configuration → Site URL** = `https://marketentrysecrets.com`.
- Add to **Redirect URLs** allow-list: `https://marketentrysecrets.com/auth/callback`, `https://www.marketentrysecrets.com/auth/callback`, `https://marketentrysecrets.com/reset-password`, plus any preview origins you still want to support (e.g. `https://market-entry-secrets.lovable.app/auth/callback`) — be explicit, avoid broad wildcards.
- Customise **Authentication → Email Templates → Magic Link** (and Confirm signup, Reset password) to the MES blue brand. Best: configure **custom SMTP via Resend** and brand all three to match `_shared/email/`.
- **Version-control it:** add an `[auth]` block to `config.toml` (`site_url`, `additional_redirect_urls`, `[auth.email.template.*]` with `content_path`) so this can never silently drift again.

**Risk:** Medium — changing Site URL/allow-list can disrupt sessions; stage and verify magic-link + reset end-to-end to the prod domain first.

---

### Journey 6 — Google & Microsoft OAuth  ⬅ root-cause target (b)

**Code path:** `signInWithProvider('google'|'azure')` → `supabase.auth.signInWithOAuth({ provider, options:{ redirectTo: ${window.location.origin}/auth/callback }})`. Buttons in `AuthDialog` (both reassurance and tabbed layouts). `'linkedin_oidc'` exists in the service signature but has no button.

**Likely root causes (dashboard/provider, confirm each):**
1. **Provider redirect URI mismatch (most common):** Google Cloud and Azure must list the **Supabase** callback `https://xhziwveaiuhzdoutpgrh.supabase.co/auth/v1/callback` as an Authorized redirect URI — **not** the app's `/auth/callback`. The app route is only the *final* hop after Supabase exchanges the code.
2. **`redirectTo` not allow-listed:** `${origin}/auth/callback` must be in the Supabase Redirect URLs list, or post-login falls back to `Site URL` → Lovable (same as §5). This alone explains "social login is buggy / lands wrong."
3. **Azure ('azure') under-configured:** Azure AD app registration needs client id + secret + tenant (`https://login.microsoftonline.com/<tenant>` or `common`), the secret saved in the Supabase Azure provider, and Microsoft Graph `email`/`openid`/`profile` scopes. A missing/expired secret or tenant mismatch produces exactly the reported flakiness.
4. **Provider toggles:** Confirm Google and Azure are actually **enabled** in Supabase Auth → Providers.
5. **Implicit-flow fragility:** the client sets no `flowType`; `AuthCallback` reads `getSession()` and manually falls back to parsing `access_token`/`refresh_token` from query/hash. Works with defaults but is brittle. Standardising on **PKCE** (`flowType:'pkce'` in the client) + `exchangeCodeForSession` in `AuthCallback` is more robust for OAuth.

**Exact fix (approval-gated):**
- Google: add `https://xhziwveaiuhzdoutpgrh.supabase.co/auth/v1/callback` to Google OAuth client Authorized redirect URIs; copy client id/secret into Supabase Google provider; enable.
- Azure: complete the Azure AD app registration (redirect URI = same Supabase callback), set tenant, copy id/secret into Supabase Azure provider; enable.
- Add every app origin's `/auth/callback` to the Supabase Redirect URLs allow-list.
- Optionally move the client to PKCE and use `exchangeCodeForSession` in `AuthCallback`.

**Risk:** Medium — change in a maintenance window; keep email/password working as fallback throughout.

---

### Journey 7 — Cross-cutting: sign-in, sign-out, password reset, session, redirects

- **Sign-in:** `signInWithPassword`; `AuthDialog` closes on success and the user stays on the current page (fine). OAuth/magic-link → `/auth/callback` → `returnTo` or `/`.
- **Sign-out (`UserDropdown`):** calls `signOut()` with **no navigation** (`W7.1, P3`). If the user is on a `ProtectedRoute` page (`/my-reports`, `/member-hub`, `/bookmarks`) they stay there and see the in-page "please sign in" fallback — acceptable, but an explicit `navigate('/')` would be cleaner, and protected pages with sensitive content should redirect on sign-out.
- **Password reset (root-cause target c, completion):** `resetPassword` → `resetPasswordForEmail(email,{ redirectTo: ${origin}/reset-password })`. `ResetPassword.tsx` calls `updateUser({password})` then `navigate('/')`. **Weaknesses:**
  - **W7.2 (P1, shares §5 root cause):** the recovery email is bare and the link is subject to the same Site-URL/allow-list → Lovable problem. `/reset-password` must be on the allow-list.
  - **W7.3 (P2):** `ResetPassword` doesn't verify a recovery session exists before rendering the form; opening the page without a valid recovery token makes `updateUser` fail with a generic toast. Should listen for `PASSWORD_RECOVERY` / check session and show a clear "link expired" state.
- **Session handling:** `useAuthState` guards against duplicate fetches and the known Supabase auth-callback deadlock (defers `fetchUserData` to a microtask). Solid.
- **Post-auth redirect correctness (the through-line):** Only **ReportCreatorV2** and the explicit `returnTo` callers pass a destination. **Everything else** (standard `AuthButton`, `PaywallModal`, `PricingSection`, `Leads`, `LeadDatabaseDetailPage`, legacy ReportCreator) defaults to `/`. The redirect helper is safe and correct; it's just **under-wired**.

---

## 3. Specific diagnoses requested

**(a) Magic link → Lovable + bare email** — §5. Root cause: Supabase **Site URL / Redirect-URL allow-list points at Lovable**, and auth email templates are the **un-customised Supabase defaults** (the branded `_shared/email/` module does not cover auth emails). Fix = dashboard Site URL + allow-list + branded templates (ideally Resend SMTP), then version-control via `[auth]` in `config.toml`.

**(b) Google/Microsoft OAuth** — §6. Root cause: **provider-side redirect URIs must target the Supabase callback** `…supabase.co/auth/v1/callback`, the app's `redirectTo` must be **allow-listed** (else Lovable fallback), and **Azure provider credentials/tenant** are likely incomplete. Email/password is the safe fallback during the fix.

**(c) Incorrect post-auth & post-Stripe redirects (intended vs actual):**

| Entry point | Intended landing | Actual landing | Fix |
|---|---|---|---|
| `AuthButton` (header) OAuth/magic-link | Same page | `/` | Pass `returnTo = current path` |
| `PaywallModal` → AuthDialog | The gated page | `/` | Thread `returnTo` from gate |
| `PricingSection` anon → checkout → auth | Resume checkout | `/` (OAuth) / stuck on `/pricing` | Persist pending checkout + `returnTo`; auto-resume |
| Pricing post-payment success | Upgraded report / dashboard | `/pricing` (dead end) | Redirect to `/my-reports` or origin report |
| `/leads/{slug}` post-payment | Unlocked DB, clean URL | "Buy Now" + dirty URL | Strip param + poll purchase |
| Legacy ReportCreator (`?v2=0`) OAuth/magic-link | Resume generation | `/` | Pass `returnTo` (or retire legacy) |
| Magic-link / reset / confirm email link | `marketentrysecrets.com/...` | Lovable | Site URL + allow-list (§5) |
| Sign-out on protected page | `/` | stays on page | `navigate('/')` |

**(d) Freemium / tier gating server-side?** — **Freemium 3-view gate: NO** (client-side localStorage only; `user_usage` is write-only analytics; directory rows are public-read). **Report tier gating: YES** (`get_tier_gated_report` SECURITY DEFINER RPC strips gated sections server-side; `reportApi.fetchReport` uses it and polling never pulls `report_json`). **Tier self-upgrade: BLOCKED** (`user_subscriptions.tier` is service-role-write-only, SEC-01). Recommendation: keep report gating as-is; document the freemium gate as an intentional soft nudge, or (product decision) move anonymous directory reads behind a row-limiting RPC if the limit must be hard.

---

## 4. Prioritised fix plan (P0–P3)

> All P0/P1 dashboard items are **approval-gated** (auth/RLS/payment/OAuth config). Audit stops at the plan; no config changed.

### P0 — Trust-breaking, blocks core journeys (dashboard, approval-gated)
- **P0-1 — Set Supabase Site URL = `https://marketentrysecrets.com`** and rebuild the Redirect-URL allow-list (prod + www + chosen previews; include `/auth/callback` and `/reset-password`). Fixes magic-link, reset, confirm, and OAuth-return all landing on Lovable. *Risk: session/redirect disruption — stage & verify first.*
- **P0-2 — Fix OAuth provider config:** Google + Azure redirect URIs → Supabase callback; complete Azure tenant + client secret; enable both providers. *Maintenance window; keep email/password fallback.*

### P1 — High-impact UX/conversion + brand
- **P1-1 — Brand the auth emails** (magic link, confirm signup, reset) to MES blue; ideally route auth email via **Resend custom SMTP** to match `_shared/email/`.
- **P1-2 — Persist & auto-resume anonymous→checkout** (W4.1): remember the pending `{tier}` across auth and re-invoke `startCheckout` after sign-in; pass `returnTo`.
- **P1-3 — Fix Pricing post-payment dead-end** (W4.2): on success redirect to `/my-reports` (or originating report), not back to `/pricing`.
- **P1-4 — Robust password-reset completion** (W7.2/W7.3): allow-list `/reset-password`, verify recovery session, show "link expired" state.

### P2 — Correctness & consistency
- **P2-1 — Thread `returnTo` everywhere** AuthDialog is opened (PaywallModal, header AuthButton, Leads, LeadDatabaseDetailPage, PricingSection).
- **P2-2 — Lead-purchase return** (W4.4): strip `stripe_status`, poll `lead_database_purchases`, flip UI to "owned".
- **P2-3 — Lengthen/​soften checkout polling** (W4.5): ~30s + "still unlocking…" + manual "refresh access".
- **P2-4 — Verify `FRONTEND_URL` = prod domain** (W4.6).
- **P2-5 — Make signup toast honest** about confirmation state (W1.1).
- **P2-6 — Version-control auth config:** add `[auth]` block (`site_url`, `additional_redirect_urls`, `[auth.email.template.*]`) to `config.toml`.

### P3 — Hardening / cleanup
- **P3-1 — Sign-out `navigate('/')`** + redirect protected pages on sign-out (W7.1).
- **P3-2 — Retire or fix legacy ReportCreator** `?v2=0` return path (W3.1).
- **P3-3 — Consider PKCE flow** (`flowType:'pkce'` + `exchangeCodeForSession`) for sturdier OAuth/magic-link (§6.5).
- **P3-4 — Document freemium gate as client-side-only**; decide whether a hard server limit is wanted (W2.3).

---

## 5. Proposed implementation sub-tickets

| Sub-ticket | Title | Priority | Approval gate |
|---|---|---|---|
| MES-33a | Supabase Site URL + redirect allow-list → production domain | P0 | Auth config |
| MES-33b | Google + Azure OAuth provider/redirect-URI configuration | P0 | OAuth config |
| MES-33c | Brand auth emails (magic link / confirm / reset) via Resend SMTP | P1 | Email/deliverability |
| MES-33d | Persist + auto-resume anonymous→checkout after auth | P1 | None (frontend) |
| MES-33e | Fix Pricing post-payment redirect to report/dashboard | P1 | None (frontend) |
| MES-33f | Harden password-reset completion (session check + allow-list) | P1 | Auth config (allow-list) |
| MES-33g | Thread `returnTo` through all AuthDialog entry points | P2 | None (frontend) |
| MES-33h | Lead-purchase return: clean param + poll ownership | P2 | None (frontend) |
| MES-33i | Checkout polling window + "unlocking" UX | P2 | None (frontend) |
| MES-33j | Version-control `[auth]` config in config.toml | P2 | Config mgmt |
| MES-33k | Sign-out redirect + protected-page handling | P3 | None (frontend) |
| MES-33l | PKCE flow migration | P3 | Auth (test in preview) |

---

## 6. Risk & approval gates (carried from ticket)

| Change | Risk | Gate / mitigation |
|---|---|---|
| Site URL / redirect allow-list (P0-1) | High | Audit-only here; stage in preview, verify magic-link+reset+OAuth to prod domain, coordinate change window |
| OAuth provider config (P0-2) | Medium | Maintenance window; keep email/password fallback live |
| Auth email templates / SMTP (P1-1) | Medium | Test all three emails end-to-end to prod before rollout |
| Any RLS / freemium server-enforcement (P3-4) | High | Approval-gated; verify server-side; per-tier tests |
| Stripe redirect/provisioning (P1-2/3) | Medium-High | Stripe test mode; verify webhook idempotency before live |

## 7. Verification checklist (for the implementation tickets, not done here)
- [ ] Magic-link & reset emails are branded and resolve to `marketentrysecrets.com/...`.
- [ ] Google & Microsoft sign-in succeed; cancel & error paths handled; land on origin page.
- [ ] Anon→Pricing→checkout→auth resumes checkout; post-payment lands on report/dashboard.
- [ ] Freemium gate verified at the 3-view boundary; sign-in returns to the gated page.
- [ ] Sign-in/out/session persistence verified as anonymous, free, Growth, Scale.

---

*Audit only. No production auth, RLS, payment, or OAuth configuration was modified. P0/P1 dashboard changes require explicit approval and a staged rollout.*

---

## 8. Addendum — additional findings (live advisor scan + deeper code review)

Added after the initial pass. The dashboard items below came from a **read-only** Supabase security-advisor scan of project `xhziwveaiuhzdoutpgrh`; the code/DB items were verified against the repo. These are **security/correctness** findings and are additive to (not a revision of) §1–§7, which are UX/redirect.

### 8.1 Live Supabase security-advisor hits (auth-relevant)

- **A1 — `auth_otp_long_expiry` (P1, dashboard).** The email OTP / magic-link expiry is set to **> 1 hour**. Long-lived magic links widen the interception window and compound Journey 5 (a stale link that *also* points at Lovable). **Fix:** Authentication → Providers → Email → set OTP expiry **< 1 hour** (3600s). Remediation: https://supabase.com/docs/guides/database/database-linter?lint=0024_auth_otp_long_expiry
- **A2 — `auth_leaked_password_protection` disabled (P1, dashboard).** HaveIBeenPwned compromised-password checking is **off**. **Fix:** Authentication → Policies → enable "Leaked password protection." One toggle; hardens sign-up (Journey 1) and reset (Journey 7). Remediation: https://supabase.com/docs/guides/auth/password-security#leaked-password-protection
- **A3 — `vulnerable_postgres_version` (P2, infra).** `supabase-postgres-17.4.1.041` has outstanding security patches. Tangential to auth flows but this is the identity store. **Fix:** schedule a DB upgrade in a maintenance window.

> The advisor scan also returned ~45 lower-relevance lints (mostly `*_security_definer_function_executable` INFO/WARN on `emit_*` activity-trigger functions, `rls_enabled_no_policy` on internal tables, `extension_in_public`). These are largely outside the customer-auth scope of MES-33 and are noted here only so they aren't mistaken for new regressions; triage separately.

### 8.2 `profiles.stripe_customer_id` is client-writable — billing-integrity hole (P1, approval-gated)

**Finding.** `profiles` RLS UPDATE policy (`20250621012036…sql:54`) is:

```sql
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);     -- no WITH CHECK, no column restriction
```

`authenticated` retains a broad column UPDATE grant on `profiles` (the SEC-02 fanout deliberately left owner/RLS-backed tables writable). Because Postgres defaults UPDATE `WITH CHECK` to the `USING` expression, a user **cannot** reassign `id` (ownership is safe) — **but they can freely write any other column on their own row, including `stripe_customer_id`.** `authService.updateProfile` (`upsert({ id, ...updates })`) accepts an arbitrary `Partial<UserProfile>`, so the path is reachable without bespoke tooling.

**Impact.** A signed-in user can set their own `profiles.stripe_customer_id` to an arbitrary / another user's Stripe customer id. `create-checkout` reads that value and creates the session against it (`customer: stripeCustomerId`) → cross-customer billing association (attach a card to a victim's customer, or pull a victim's saved payment context). Tier provisioning itself stays keyed on `metadata.supabase_user_id`, so entitlements aren't escalated — this is a **billing-integrity / data-integrity** issue, not a tier bypass.

**Why P1, not P0.** No in-app exploit today: `OnboardingDialog` and `ProfileDialog` only send safe fields (`first_name`, `last_name`, `username`, `avatar_url`, `persona`, onboarding flags). It is a **latent** hole, the same shape SEC-01 closed for `user_subscriptions`. Fix promptly; no emergency.

**Recommended fix (mirror SEC-01 — review-ready draft, NOT applied):**

```sql
-- SEC-05 (proposed): stop clients writing identity/billing columns on profiles.
-- stripe_customer_id is set only by create-checkout (service role). Clients keep
-- UPDATE on safe profile columns via the existing owner policy.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT  UPDATE (first_name, last_name, username, avatar_url, persona,
               onboarding_completed /* + any other user-editable cols */)
  ON public.profiles TO authenticated;
-- (Optional defense-in-depth: BEFORE UPDATE trigger raising if NEW.stripe_customer_id
--  IS DISTINCT FROM OLD.stripe_customer_id and current_user <> 'service_role'.)
```

Also harden client-side: have `authService.updateProfile` allowlist columns rather than spreading arbitrary `updates`.

> ⚠️ Approval-gated (RLS/grant change). Draft only — verify the exact editable-column set against the live `profiles` schema before applying, and confirm no other client path depends on writing a now-revoked column.

### 8.3 Lower-severity code findings

- **C1 — Weak password policy (P2).** `ResetPassword.tsx` enforces only `minLength={6}`; Supabase default min is also 6. Raise to **≥ 8** (client + dashboard) — pairs with A2.
- **C2 — Welcome email re-fires on every login (P3).** `useAuthState.ts:67` invokes `send-email` (welcome) on `SIGNED_IN`, not just `SIGNED_UP`, so a `send-email` edge invocation runs on each new-session login. Server-side idempotency (`welcome:{userId}`) makes it harmless, but it's a wasted call per login. Narrow the trigger to genuine first-signup, or accept the cost as deliberate (the existing comment says SIGNED_UP is unreliable for OAuth).
- **C3 — Email enumeration on signup (P3).** `signUpWithEmail` surfaces Supabase's raw "User already registered" error in a toast (reset is correctly silent/non-enumerating). Consider a neutral message.

### 8.3a Implementation status (this follow-up PR)

Delivered in the follow-up branch (in-repo, verifiable):
- **MES-33m — done (pending review/apply).** `supabase/migrations/20260701120000_sec_05_protect_profiles_stripe_customer_id.sql` adds a `BEFORE INSERT OR UPDATE` trigger (`protect_profiles_privileged_columns`) that blocks the `authenticated`/`anon` roles from setting or changing `profiles.stripe_customer_id`; service-role writes (create-checkout) pass through. Trigger chosen over column REVOKE/GRANT so it needs no maintenance as the table evolves. Verified against the live schema (`stripe_customer_id text` exists; client UPDATE is table-level). Applies via the normal Supabase migration/preview pipeline — **not** applied directly to prod.
- **MES-33n (partial) — done.** Client password minimum raised 6→8 (`ResetPassword.tsx` validation + inputs, `AuthDialog` signup field). The **leaked-password-protection** half is a dashboard toggle (still open, §8.1 A2).
- **Defense-in-depth — done.** `authService.updateProfile` now strips server-managed keys (`id`, `stripe_customer_id`, `created_at`, `updated_at`) before upsert, so legitimate clients never trip the SEC-05 trigger.

Still **dashboard-only** (cannot be done from the repo — exact steps handed to the team): MES-33a/b (Site URL + redirect allow-list, Google/Azure providers), MES-33n leaked-password toggle, MES-33o OTP expiry, MES-33p Postgres upgrade.

> Note discovered while implementing: OnboardingDialog writes `company_name`/`country`/`target_market`/`use_case`/`onboarding_completed`, but those columns are **absent from the live `profiles` table** (their migrations appear stranded), so onboarding upserts likely fail in prod today. Out of scope for MES-33; logged for a separate ticket.

### 8.4 Added sub-tickets

| Sub-ticket | Title | Priority | Approval gate |
|---|---|---|---|
| MES-33m | Lock `profiles.stripe_customer_id` to service-role writes (SEC-05) | P1 | RLS/grant |
| MES-33n | Enable leaked-password protection + raise min password length | P1 | Auth config |
| MES-33o | Reduce email OTP / magic-link expiry to < 1 hour | P1 | Auth config |
| MES-33p | Schedule Postgres security-patch upgrade | P2 | Infra/maintenance window |
| MES-33q | Narrow welcome-email trigger + neutralise signup enumeration | P3 | None (frontend/edge) |

