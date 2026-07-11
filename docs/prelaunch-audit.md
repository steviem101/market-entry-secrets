# MES-111 — Pre-launch Production Readiness Audit

**Scope:** Full read-only end-to-end audit of the Market Entry Secrets (MES) platform ahead of its first public production launch.
**Type:** Read-only audit. No application code, RLS, migrations, config, or data were changed. This PR contains only this report.
**Branch:** `claude/mes-prelaunch-audit-j0p7bm`
**Supabase project:** `xhziwveaiuhzdoutpgrh` (MES Platform)
**Date:** 2026-07-07

> **How to read this:** Findings are IDs `AUD-###`, each with severity (P0–P3), area, location, evidence, suggested fix, effort (S/M/L), and confidence + **VERIFIED** (confirmed in code / at runtime / against the live DB via read-only introspection) or **SUSPECTED** (needs human confirmation, usually a dashboard setting). P0/P1 are launch blockers; P2/P3 are post-launch.

---

## 1. Executive Summary

### Findings count by severity

| Severity | Count | Meaning |
|----------|-------|---------|
| **P0** | **0** | Launch blocker — active security hole / data leak to the open internet / payments or auth broken |
| **P1** | **5** | Fix before launch (or launch with explicit accepted-risk sign-off) |
| **P2** | **18** | Fix soon after launch |
| **P3** | **22** | Backlog / polish |
| **Total** | **45** | |

### Go / No-Go recommendation

**Rubric:** any open **P0 = NO-GO**; open **P1s = launch only with explicit accepted-risk sign-off**; P2/P3 do not block launch.

**Recommendation: CONDITIONAL GO — fix the 5 P1s (or sign off accepted risk) before opening to the public.**

There is **no P0 open-internet (anonymous) data leak**: direct anon-key probes confirm the anon key cannot read any PII or paid table (all returned `401 permission denied` except the intended public directory tables). The SEC-01/02/03 grant lockdown is holding for anonymous traffic, and the report-view read path, Stripe signature verification, and report-generation auth/ownership are all correctly implemented.

The 5 P1s are payments-integrity, data-integrity, and PII-exposure issues — serious but none is remote code execution or an anonymous open leak, hence CONDITIONAL GO rather than hard NO-GO. **The single most important item is AUD-005 (paywall bypass via the lead-purchase checkout flow)** — it lets an authenticated user obtain the top subscription tier for the price of a lead database.

### Top launch blockers (P1)

1. **AUD-005 — Paywall bypass:** client-supplied `tier` is trusted in the lead-purchase checkout branch, so a user can pay a lead-DB price and be granted `enterprise`/`scale`. **Payments-integrity break.** _(Treat as go/no-go; escalate to P0 per business call on price delta.)_
2. **AUD-006 — Lead purchases are broken:** the `lead_database_purchases` entitlement table **does not exist in prod** (lost in the 2026-07-04 re-baseline), so the webhook's purchase upsert errors and is swallowed — buyers are charged but nothing is recorded, and there is no server-side entitlement gate.
3. **AUD-002 — Investor contact PII** (`contact_email`/`contact_name`/`linkedin_url`, ~447 rows) readable by **any authenticated (free) user**; the `investors_public` view that hides it is only used for anon.
4. **AUD-003 — `ingest_state` RLS disabled + anon `INSERT/UPDATE/DELETE/TRUNCATE` grants** → data-integrity / DoS on event ingestion.
5. **AUD-004 — `fetchMyReports()` selects `*`** including full `report_json`, re-leaking tier-gated report content (SWOT/competitor/mentor/lead sections) to free users — an un-remediated instance of the same bug class the P0-3 fix closed in `fetchReport`.

> **Important reconciliation:** an *archived* migration (`20260228000001`) implemented proper purchase-gated RLS on `lead_database_records` plus a `lead_database_purchases` table. Live-DB introspection confirms **neither survived** the 2026-07-04 re-baseline: the live policy is `USING (true)` for `authenticated` and the purchases table is absent. The live DB — not the archived migration — is the source of truth for this audit. All 325 `lead_database_records` rows are currently `is_preview = true` (zero paid rows), so AUD-001 is PII over-exposure of preview contacts (P2), not a paid-content dump; the paid product is delivered manually.

---

## 2. Phase 0 — Build Health

Commands run against the repo at branch head. **Running builds/typecheck/lint/tests is read-only and expected; nothing was changed.**

| Check | Result | Notes |
|-------|--------|-------|
| **Production build** (`npm run build`) | ✅ **Pass** | Built in ~8s. ⚠️ One chunk `CaseStudyDetail` is **756 kB (137 kB gzip)** and `index` is 360 kB — see AUD-050. |
| **TypeScript typecheck** (`tsc -p tsconfig.app.json --noEmit`) | ✅ **Pass** | Exit 0, no errors. |
| **Lint** (`eslint .`) | ❌ **437 errors, 19 warnings** | Almost all `@typescript-eslint/no-explicit-any` in `supabase/functions/**`, plus `require()` import in `tailwind.config.ts` and one `prefer-const` in `stripe-webhook`. No runtime bugs, but `npm run lint` is non-zero → CI gating on lint will fail. See AUD-051. |
| **Unit tests** (`npm test`) | ✅ **242 pass, 0 fail** | Node test runner over `supabase/functions/**/*.test.ts` + `src/**/*.test.ts`. Coverage is concentrated on report-quality-loop logic; no tests for auth/RLS/checkout flows. |
| **Dependency audit** (`npm audit`) | ⚠️ **18 vulns (7 moderate, 11 high)** | All in build/dev tooling: `rollup`, `postcss`, `esbuild`/`vite`, `ws`, `yaml`, `picomatch`. None shipped to the browser bundle. `npm audit fix` available. See AUD-052. |

**Secrets hygiene (Phase 0):**
- No hardcoded API secrets (`sk_live`, `pk_live`, `SG.`, `AIza`, `xoxb-`, service-role keys) found in tracked `src/`. ✅
- The browser bundle ships only the Supabase **URL + anon publishable key** (by design — anon key is public and RLS-gated). ✅
- ⚠️ **`.env` is tracked in git** (`git ls-files` confirms) even though it is in `.gitignore`. It currently contains only public values (project id, project URL, anon key), so no secret leak — but it is bad hygiene and risks a future real secret being committed. See AUD-053.

---

## 3. Findings Table (running — sorted by severity)

> Full detail for each finding is in the per-area sections that follow. This table is the single sorted index; it is completed as each area pass lands.

| ID | Sev | Area | Location | Title | Conf | Status |
|----|-----|------|----------|-------|------|--------|
| **AUD-005** | **P1** | Payments | `supabase/functions/create-checkout/index.ts:65,202` | Paywall bypass: client `tier` trusted in lead-purchase branch → pay lead price, get enterprise | high | VERIFIED |
| **AUD-006** | **P1** | Payments/Data | `stripe-webhook/index.ts:121`; live DB | `lead_database_purchases` table missing in prod → lead purchases error & are lost; no entitlement gate | high | VERIFIED |
| **AUD-002** | **P1** | RLS/Data | `investors` RLS policy | Investor contact PII (~447) readable by any authenticated user | high | VERIFIED |
| **AUD-003** | **P1** | RLS/Data | `ingest_state` table | RLS disabled + anon INSERT/UPDATE/DELETE/TRUNCATE grants | high | VERIFIED |
| **AUD-004** | **P1** | Freemium/Reports | `src/lib/api/reportApi.ts:210` `fetchMyReports` | `select('*')` re-leaks tier-gated `report_json` to free users | high | VERIFIED |
| AUD-001 | P2 | RLS/Data | `lead_database_records` RLS policy | `USING(true)` exposes 325 preview records' email/phone to any authed user | high | VERIFIED |
| AUD-007 | P2 | Payments | `stripe-webhook/index.ts:70` | Dedup log inserted before upsert → transient failure permanently loses entitlement | high | VERIFIED |
| AUD-008 | P2 | Payments | `stripe-webhook/index.ts:131` | Lead-purchase upsert failure swallowed → returns 200, no Stripe retry | high | VERIFIED |
| AUD-009 | P2 | Payments | `stripe-webhook/index.ts:143` | Tier granted on trusted metadata; paid amount/price never validated | high | VERIFIED |
| AUD-020 | P2 | RLS/Data | `agency_contacts`, `service_provider_contacts` | Contact PII (email/phone) readable by any authenticated user | high | VERIFIED |
| AUD-021 | P2 | Auth | `src/components/auth/ProtectedRoute.tsx:73` | Admin gating client-side; relies on RLS (RLS confirmed present) | high | VERIFIED |
| AUD-022 | P2 | Auth | Supabase dashboard / `config.toml` | Email-confirmation enforcement not asserted in-app | med | SUSPECTED |
| AUD-023 | P2 | Auth | `src/hooks/auth/useAuthState.ts:33` | Initial `getSession()` no error path → possible stuck loading | med | VERIFIED |
| AUD-024 | P2 | Auth/Config | Supabase Auth settings | OTP expiry > 1h; leaked-password protection disabled | high | VERIFIED (advisor) |
| AUD-025 | P2 | Edge Fn | `supabase/functions/generate-plan/index.ts` | No rate limit / cost guardrail on Anthropic call (authed) | high | VERIFIED |
| AUD-030 | P2 | Edge Fn | `knowledge-search/index.ts` + `config.toml` | Anon-callable paid-embedding endpoint, no rate limit; verify_jwt unpinned | med | SUSPECTED |
| AUD-031 | P2 | Edge Fn | `supabase/config.toml` | 5 functions missing from verify_jwt map (drift risk) | high | VERIFIED |
| AUD-043 | P2 | Directories | `src/hooks/useMentors.ts:134` | Unbounded query silently caps at 1000 rows | high | SUSPECTED |
| AUD-044 | P2 | Directories | `src/pages/ServiceProviders.tsx:78` | No loading skeleton → "No providers found" flashes on load | high | VERIFIED |
| AUD-045 | P2 | Directories | `ServiceProvidersDataProvider.tsx:130` | Fetch errors swallowed to toast + empty grid; non-react-query | high | VERIFIED |
| AUD-046 | P2 | SEO | all `*Page.tsx` not-found branches | Detail-page soft-404s are indexable (no `<NoIndex>`) | high | VERIFIED |
| AUD-047 | P2 | Performance | `useInvestors/useEvents/...` | `.limit(500)` ceiling; investors at 447/500 → silent truncation soon | high | VERIFIED |
| AUD-052 | P2 | Build/Deps | build tooling | 18 npm audit vulns (dev/build deps, not shipped) | high | VERIFIED |
| AUD-010 | P3 | Payments | `LeadDatabaseDetailPage.tsx` | Divergent lead CTAs (enquiry vs Stripe); manual fulfillment | high | VERIFIED |
| AUD-011 | P3 | Payments | `src/pages/Pricing.tsx` | `/pricing` success modal shows no subscription polling (stale tier) | high | VERIFIED |
| AUD-026 | P3 | Edge Fn | `generate-plan/index.ts:81` | Cross-user `user_reports` metadata pulled into LLM context | high | VERIFIED |
| AUD-027 | P3 | Report | `generate-report/index.ts:2559` | Stuck `processing` reports have no reaper; block regeneration | med | SUSPECTED |
| AUD-028 | P3 | Edge Fn | `_shared/rateLimit.ts:29` | Rate limiter fails open on DB error | high | VERIFIED |
| AUD-029 | P3 | Edge Fn | `generate-report:2591`; admin fns | Raw DB/error messages returned to client | high | VERIFIED |
| AUD-032 | P3 | Edge Fn | `report-quality-rollup:98`; `slack-notify` | Slack mrkdwn injection via untrusted intake (internal channel) | high | VERIFIED |
| AUD-033 | P3 | Edge Fn | `_shared/http.ts:14` | CORS reflects attacker-registrable `*.lovable.app/.dev` (no creds → low) | high | VERIFIED |
| AUD-034 | P3 | Freemium | `src/hooks/useUsageTracking.ts` | 3-view gate is client-side/localStorage (by design; protects no revenue) | high | VERIFIED |
| AUD-035 | P3 | Freemium | `src/components/leads/LeadPreviewModal.tsx:48` | Preview record masking is cosmetic (raw email/name in payload) | high | VERIFIED |
| AUD-037 | P3 | SEO | `Investors/ServiceProviders/Leads` | Canonical uses `window.location.origin` (wrong host on staging) | high | VERIFIED |
| AUD-038 | P3 | Cleanup | `src/pages/ReportCreatorV2.tsx` | Dead, unrouted page component | high | VERIFIED |
| AUD-039 | P3 | Freemium | `src/hooks/useSubscription.ts:91` | `canAccessFeature('premium')` always false; dead code | high | VERIFIED |
| AUD-040 | P3 | Auth | `useAuthState.ts` / `userDataService.ts` | Silent role-fetch failure downgrades admin; unmount state-set | high | VERIFIED |
| AUD-041 | P3 | Auth | `client.ts` / `AuthCallback.tsx` | Implicit-flow tokens in URL (no PKCE) | med | VERIFIED |
| AUD-042 | P3 | Auth | `src/pages/ResetPassword.tsx:34` | Password reset lacks recovery-context guard | med | VERIFIED |
| AUD-048 | P3 | Docs | CLAUDE.md vs `supabase/functions/` | `apify-webhook` / `notion-research-trigger` documented but absent | high | VERIFIED |
| AUD-050 | P3 | Performance | `dist/.../CaseStudyDetail-*.js` | 756 kB chunk; 360 kB index bundle | high | VERIFIED |
| AUD-051 | P3 | Build | `supabase/functions/**`, `tailwind.config.ts` | 437 eslint errors → lint gate red | high | VERIFIED |
| AUD-053 | P3 | Secrets | `.env` | `.env` tracked in git (public values only today) | high | VERIFIED |
| AUD-060 | P3 | RLS/Advisors | `community_members_public` + fns | SECURITY DEFINER view/fns anon-executable (by design; verify `match_knowledge` visibility) | med | VERIFIED |
| AUD-061 | P3 | Performance/DB | perf advisors | Duplicate index, 3 unindexed FKs, 22 multiple-permissive-policy warns, 135 unused indexes | high | VERIFIED (advisor) |

**Verified CLEAN (notable non-findings):** anon key blocked on all PII/paid tables (401 probes); `investors_public`/`community_members_public`/`agencies_report_view` correctly strip/mask PII; `get_shared_report` and `get_tier_gated_report` RPCs strip `visible:false` section **content** server-side (shared + owner report views are safe); Stripe webhook signature verification correct; `generate-report` auth+ownership+SSRF-guard+server-trusted tier correct; app-level route-aware error boundary present; catch-all 404 + legacy redirects present; no `console.log` in `src/`; no hardcoded secrets in `src/`; 242/242 tests pass; typecheck clean; production build succeeds.

---

## 4. Phase 2B — RLS & Data Exposure (deep dive)

Method: full DB introspection via read-only MCP (`pg_class`, `pg_policies`, `information_schema` grants, `storage.buckets`), the Supabase security & performance advisors, and **direct anon-key probes** against PostgREST to confirm real reachability.

### DB-level posture (good news first)
- **RLS is enabled on every `public` table except one** (`ingest_state`, AUD-003). 82 of 83 public tables have RLS on.
- The many "RLS enabled, no policy" tables the advisor flags (`mes_knowledge_base`, `activity_events`, `ii_*`, `firecrawl_scrape_cache`, `edge_function_rate_limits`, `knowledge_embed_log`, etc.) are **deny-by-default** — safe, service-role-only. Not leaks. (They may indicate a feature that silently returns empty to clients; noted, not a security finding.)
- **Anon-key probes confirm the lockdown holds for the open internet:** `investors`, `community_members`, `lead_database_records`, `agency_contacts`, `service_provider_contacts` all return **`401 permission denied`** to the anon key. Only intended public directory tables (`service_providers`, `events`, `leads`, `content_items`, `locations`, `countries`, `industry_sectors`, `innovation_ecosystem`, `trade_investment_agencies`, `lead_databases`, `guide_attachments`, `testimonials`) are anon-readable.
- The anon-facing PII-safe **views are correctly built**: `investors_public` drops `contact_email/contact_name/linkedin_url`; `community_members_public` masks anonymous mentors (alias, no image, no real name/company/slug). ✅

### AUD-001 — Paid lead-list records readable by any authenticated user (no server-side entitlement)  · **P1**
- **Location:** RLS policy `"Authenticated can view lead database records"` on `public.lead_database_records`, `cmd=SELECT`, `roles={authenticated}`, `using_qual = true`.
- **Evidence:** Table columns include `email`, `phone`, `contact_name`, `linkedin_url`, `is_preview`. The policy grants **every** authenticated user SELECT on **all** rows — preview and full/paid alike. A search for any purchase/entitlement table (`%purchas%`, `%entitle%`, `%order%`, `%unlock%`, `%access%`) returned **nothing**, so there is no server-side record of who bought which lead database. Access is therefore gated only client-side (by tier and/or `is_preview` filtering), which is trivially bypassed by calling PostgREST directly with any logged-in JWT: `GET /rest/v1/lead_database_records?select=*`.
- **Impact:** Revenue leak — the core paid product (lead lists behind the `scale` tier) is fully readable by any free account. Also a PII exposure (contact email/phone of leads).
- **Suggested fix:** Replace `USING (true)` with a policy that (a) returns only `is_preview = true` rows to non-entitled users, and (b) checks a server-side entitlement (a `lead_database_purchases` table keyed by `user_id`+`lead_database_id`, or the user's tier for tier-based access). Effort: **M**.
- **Confidence:** high / **VERIFIED** (policy + grant + missing-entitlement-table confirmed via introspection).

### AUD-002 — Investor contact PII exposed to any authenticated user  · **P1**
- **Location:** RLS policy `"Anyone can read investors"` on `public.investors`, `cmd=SELECT`, `roles={public}`, `using_qual = true`; `authenticated` holds the SELECT grant (anon does **not**).
- **Evidence:** `investors` has `contact_email`, `contact_name`, `linkedin_url`. The dedicated `investors_public` view exists specifically to hide these — but it is only needed for anon. Because `authenticated` can SELECT the base table under `USING (true)`, any logged-in user can `GET /rest/v1/investors?select=contact_email,contact_name,linkedin_url` and export all ~447 investor contacts. Anon is correctly blocked (401 probe), so this is "free-signup PII scrape," not open-internet.
- **Impact:** PII/lead-database leak of the investor directory to any free account; undermines the paid value of the investor data.
- **Suggested fix:** Restrict base-table SELECT to admins (or drop the PII columns for non-admins) and route all client reads through `investors_public`. Effort: **M** (confirm the frontend already uses `investors_public`; if it uses the base table, migrate it).
- **Confidence:** high / **VERIFIED**.

### AUD-003 — `ingest_state` RLS disabled + anon write/truncate grants  · **P1**
- **Location:** `public.ingest_state` — `relrowsecurity = false`; `anon` (and `authenticated`) hold `SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER`.
- **Evidence:** Supabase security advisor: `rls_disabled_in_public` (ERROR). Anon-key probe `GET /rest/v1/ingest_state` returns **HTTP 200** (readable). Columns: `source, last_run_id, last_run_at, updated_at` (operational, low sensitivity) — but the anon write/truncate grant means an anonymous attacker can insert bogus rows or `TRUNCATE` the table, corrupting the event-ingestion cursor and causing duplicate or skipped ingests.
- **Impact:** Data-integrity / low-effort DoS on the events ingestion pipeline; the one table SEC-01/02/03 missed on both RLS-enable and grant-revoke.
- **Suggested fix:** `ALTER TABLE public.ingest_state ENABLE ROW LEVEL SECURITY;` (no policy → deny all client access) and `REVOKE ALL ON public.ingest_state FROM anon, authenticated;` — the pipeline uses the service role. Effort: **S** (one migration, out of scope for this audit PR).
- **Confidence:** high / **VERIFIED** (advisor + grants + anon 200 probe).

### AUD-020 — Agency & service-provider contact PII readable by any authenticated user  · **P2**
- **Location:** `"Authenticated can view agency contacts"` on `public.agency_contacts` and `"Authenticated can view service provider contacts"` on `public.service_provider_contacts` — both `SELECT`, `roles={authenticated}`, `using_qual = true`.
- **Evidence:** Both tables carry `email`, `phone`, `linkedin_url`. CLAUDE.md documents `agency_contacts` as "PII; not anon-readable," with `agencies_report_view` as the safe projection. Anon is blocked (401 probe), but any authenticated user reads all contact rows directly. Lower severity than AUD-001/002 because these are business (org) contacts, not personal customer PII, and are partly intended to surface in report/agency views.
- **Suggested fix:** Gate base-table SELECT behind the report-generation service role / a report-view RPC, or restrict to admins and serve clients via `agencies_report_view`. Effort: **M**.
- **Confidence:** high / **VERIFIED**.

### AUD-060 — SECURITY DEFINER view + anon-executable SECURITY DEFINER functions (advisor-flagged, largely by design)  · **P3**
- **Location:** view `public.community_members_public` (advisor ERROR `security_definer_view`); functions `get_shared_report`, `has_role`, `match_knowledge` executable by `anon` (advisor WARN `0028`), plus `get_tier_gated_report`, `increment_download_count` by `authenticated` (WARN `0029`).
- **Evidence/analysis:** `community_members_public` **must** be definer-semantics to expose the masked mentor directory while the base table is admin-only — intended, and it correctly masks anonymous mentors. `get_shared_report` anon-exec is intended (public share links) and strips gated sections. `has_role` anon-exec returns false for anon — harmless. `match_knowledge` anon-exec lets anonymous users query the knowledge base vector search — confirm the `allowed_visibility` filter defaults to public-only content (⚠️ verify; if it can return non-public KB rows to anon it escalates to P2). Recommend explicit `REVOKE EXECUTE ... FROM anon` on functions not meant to be public, and adding `security_invoker=true` to the view if RLS allows.
- **Suggested fix:** Review each; revoke anon EXECUTE where unintended; verify `match_knowledge` visibility default. Effort: **S–M**.
- **Confidence:** med / **VERIFIED** (advisor); `match_knowledge` exposure **SUSPECTED** pending visibility-default check.

### AUD-024 — Auth hardening settings (dashboard)  · **P2**
- **Location:** Supabase Auth config (advisors `auth_otp_long_expiry`, `auth_leaked_password_protection`).
- **Evidence:** OTP expiry set to **> 1 hour** (recommended < 1h); **leaked-password protection disabled** (HaveIBeenPwned check off).
- **Suggested fix:** Lower OTP expiry to ≤ 3600s; enable leaked-password protection. Dashboard-only. Effort: **S**.
- **Confidence:** high / **VERIFIED** (advisor).

### Storage buckets
All 5 buckets are **public**: `events`, `guide-attachments`, `guide-tiles`, `lead-list-covers`, `tradeagencies`. These hold marketing/brand assets and directory logos — public is appropriate. ⚠️ **Verify `guide-attachments`** does not host gated/premium downloadable resources: `guide_attachments` is anon-readable (`SELECT true`) and the bucket is public, so any guide file URL is directly fetchable regardless of tier. If guides are ever a paid deliverable, that is a leak (currently treated as free content — **SUSPECTED**, needs product confirmation).

---

## 5. Phase 2A — Auth & Sessions (deep dive)

RLS-backing note: Finding AUD-021 depended on RLS actually being enforced on admin/PII tables — **this audit VERIFIED that** (`directory_submissions`, `lead_submissions`, `email_leads`, `lemlist_*`, mentor-admin tables all have admin-only policies with RLS on). So the client-side admin gate failing safe is acceptable.

### AUD-021 — Admin/route gating is client-side only (RLS is the real control; RLS confirmed)  · **P2**
- **Location:** `src/components/auth/ProtectedRoute.tsx:73`; `src/hooks/useAdminSubmissions.ts:32`.
- **Evidence:** `requireAdmin && !isAdmin()` only swaps rendered UI; admin data queries succeed/fail purely on RLS. A non-admin routing to `/admin/submissions` gets an error toast + empty table (fails safe).
- **Fix:** None required beyond keeping RLS correct; optionally add a server-checked admin guard for defense-in-depth. Effort: S. Confidence: high / **VERIFIED**.

### AUD-022 — Email-verification enforcement not asserted in-app  · **P2**
- **Location:** `src/hooks/auth/authService.ts:54`; `src/pages/AuthCallback.tsx:29`; `supabase/config.toml [auth.email]`.
- **Evidence:** Nothing checks `email_confirmed_at`; `config.toml` sets only `otp_expiry`, not `enable_confirmations` → confirmation depends entirely on the dashboard setting. If confirmation is off, unverified emails get full authenticated access.
- **Fix:** Confirm dashboard "Confirm email" is ON; optionally gate sensitive actions on `email_confirmed_at`. Effort: S. Confidence: med / **SUSPECTED** (dashboard state).

### AUD-023 — Initial `getSession()` has no error path → possible stuck loading spinner  · **P2**
- **Location:** `src/hooks/auth/useAuthState.ts:33`.
- **Evidence:** `supabase.auth.getSession().then(... setLoading(false))` with no `.catch()`. If `getSession()` rejects, `setLoading(false)` never fires and every `<ProtectedRoute>` stays on the skeleton. Partially mitigated by the `INITIAL_SESSION` `onAuthStateChange` event.
- **Fix:** try/catch/finally always `setLoading(false)`. Effort: S. Confidence: med / **VERIFIED** (code path).

### AUD-040 / AUD-041 / AUD-042 (P3)
- **AUD-040** — Silent role-fetch failure (`userDataService.ts:45`) under-privileges a real admin until reload (fails safe, poor UX); plus initial-session branch sets state without a `cancelled` guard (`useAuthState.ts:35`). Effort S.
- **AUD-041** — No `flowType:'pkce'` on the client (`client.ts:29`); `AuthCallback.tsx:35` reads implicit-flow tokens from the URL → tokens in history/referrer. Effort M. Move to PKCE.
- **AUD-042** — `ResetPassword.tsx:34` calls `updateUser({password})` with no `PASSWORD_RECOVERY`-context guard; an already-logged-in user landing there can silently reset. Effort S.

### Auth — areas checked, NO issues
Open-redirect safety (`authReturnPath.ts` rejects external paths), account-enumeration neutral signup message, client cannot self-escalate tier/profile (`updateProfile` strips `id/stripe_customer_id`; `user_subscriptions.tier` service-role-write-only), logged-out/expired sessions render an auth-required card (no leak), `onAuthStateChange` deadlock pattern handled (`queueMicrotask` + guards), `<NoIndex>` on all private routes, redirect allow-list has no wildcards.

---

## 6. Phase 1 — Critical Launch Journeys

_(Traced end-to-end; per-journey status merged from the payments, report-pipeline, and directories area passes below.)_

| # | Journey | Status |
|---|---------|--------|
| 1 | Anonymous browse (directories/content/events, gating/teasers) | ✅ anon reads only intended public tables; PII/paid tables 401 to anon. Detail in §4 + directories pass. |
| 2 | Sign-up → verify → sign-in → reset → sign-out | ⚠️ verify AUD-022 (email confirmation), AUD-023, AUD-042. |
| 3 | Free user generates/views AI report; tier limits server-side | ✅ `fetchReport` uses `get_tier_gated_report` RPC (strips gated content). ⚠️ AUD-004 (`fetchMyReports` leaks). Report-pipeline pass below. |
| 4 | Free → Stripe checkout → webhook unlocks | _payments pass below_ |
| 5 | Paid user accesses premium content, leads, full reports | ⚠️ AUD-001 (leads exposed regardless of payment). |
| 6 | Cancellation / downgrade / failed payment | _payments pass below (note: one-time payments, no auto-revoke by design)_ |
| 7 | Admin reviews intake/submissions & support workflows | ✅ RLS-backed; AUD-021. |

---

## 7. Phase 2C — Freemium, Subscriptions & Payments (deep dive)

### AUD-005 — Paywall bypass: client `tier` trusted in the lead-purchase checkout branch  · **P1** (treat as go/no-go)
- **Location:** `supabase/functions/create-checkout/index.ts:65` (guard) and `:202` (metadata); `stripe-webhook/index.ts:143` (grant).
- **Evidence / exploit (VERIFIED by code path):** The tier↔price consistency guard only runs when there is **no** `lead_database_id`:
  ```ts
  // :65 — guard skipped entirely for lead purchases
  if (directPriceId && !extraMetadata.lead_database_id) { /* enforce PRICE_IDS[tier] */ }
  ...
  // :202 — client-supplied tier survives into session metadata
  tier: tier || "lead_purchase",
  ```
  The lead branch (`:43`) validates only that `price_id` matches the chosen lead DB — it does **not** clear the client's `tier`. So an authenticated user POSTs `{ price_id: <lead DB price>, tier: "enterprise", metadata: { lead_database_id: <that DB> }, supabase_user_id: <self> }`: the lead-price check passes, the tier guard is skipped, and the webhook (`tier !== "lead_purchase"` → upsert `user_subscriptions`) grants `enterprise`. They pay a lead-DB price and receive the top subscription tier. `stripe_price_id`/`id` are public (`useLeadDatabases` selects `*`).
- **Fix:** In the direct-price/lead branch, force `tier = "lead_purchase"` and never let client `tier` reach metadata for product purchases. Defense-in-depth: validate the paid amount/price against the granted tier in the webhook (AUD-009). Effort **S**.
- **Confidence:** high / **VERIFIED**. Escalate to P0 if a lead-DB price is materially cheaper than the `scale`/`enterprise` price.

### AUD-006 — Lead purchases are broken in prod: `lead_database_purchases` table is missing  · **P1**
- **Location:** `stripe-webhook/index.ts:121-140`; live DB introspection.
- **Evidence (VERIFIED):** The webhook upserts `lead_database_purchases` on a lead purchase, but `information_schema` confirms **no such table exists** in prod (`purchases_table_exists = 0`) — the creating migration (`20260228000001`) lives in `migrations_archive/` and was not re-applied after the 2026-07-04 re-baseline. The upsert therefore errors; the handler only `logError`s and falls through to `200` (AUD-008), so **Stripe never retries and the buyer's entitlement is silently lost.** There is also no server-side entitlement gate on `lead_database_records` as a result (the intended purchase-scoped RLS policy was archived with the table).
- **Fix:** Re-introduce the `lead_database_purchases` table + the purchase-scoped RLS policy on `lead_database_records` (a new migration, out of scope for this audit), OR disable the self-serve lead-purchase button until the flow is rebuilt and keep manual fulfillment. Effort **M**.
- **Confidence:** high / **VERIFIED**.

### AUD-007 — Webhook idempotency: dedup row written before the critical upsert  · **P2**
- **Location:** `stripe-webhook/index.ts:70` (log insert) → `:146` (subscription upsert, returns 500 on failure).
- **Evidence:** Order is: dedup-check → **insert log row** → upsert subscription. If the upsert fails, the handler returns 500 so Stripe retries — but the log row already exists, so the retry hits the dedup check (`:46`) and returns `{ duplicate: true }`, skipping the upsert forever. A single transient DB error = buyer paid, never provisioned, no self-heal.
- **Fix:** Write the dedup/log row only **after** the upsert succeeds, or add a `processed` flag and treat unprocessed rows as non-duplicates. Effort **M**. Confidence high / **VERIFIED**.

### AUD-008 / AUD-009 (P2)
- **AUD-008** — `stripe-webhook/index.ts:131`: lead-purchase upsert error is logged then falls through to `200`, so Stripe does not retry (contrast the subscription branch which returns 500). Fix: return 500 on `purchaseErr`. Effort S.
- **AUD-009** — `stripe-webhook/index.ts:88,143`: the webhook retrieves `amount`/`currency`/`status` but never validates them against the granted tier — it grants whatever `metadata.tier` says. This is the second line of defense that would blunt AUD-005. Fix: map `(tier → expected price/amount)` server-side and reject mismatches. Effort M.

### Payments — informational (P3)
- **AUD-010** — Lead detail page has two divergent CTAs (an enquiry `openEnquiry` and a real Stripe checkout button); post-purchase copy says data is "emailed within 24 hours" — fulfillment is manual. Confirm intended flow before launch.
- **AUD-011** — `/pricing` shows a success modal purely from the `stripe_status=success` URL param with **no** subscription re-poll, so a buyer may see "upgraded" while their tier is still stale until reload. `ReportView.tsx:54` already implements the correct 15×2s poll + "refresh access" pattern — reuse it.

### Freemium — VERIFIED CLEAN + notes
- **Report-view read path is safe:** `fetchReport` fetches metadata only and gets section content via `get_tier_gated_report` (strips `visible:false` content server-side); `ReportView`'s client-side gating is defense-in-depth only. `pollReportStatus` selects `status` only. Tier comes from `user_subscriptions` (own-SELECT RLS; service-role-write-only); unknown/failed tier fails closed to `free`.
- **AUD-004** (the one report leak) is `fetchMyReports` `select('*')` — see §4/§8. Confirmed independently by the freemium pass.
- **AUD-034** — the 3-view freemium gate is `localStorage`-based and trivially reset (incognito/clear). By design (lead-capture soft gate; signed-in users bypass and signup is free) — it protects no revenue. Confirm that's intended.
- **AUD-035** — `LeadPreviewModal` masks email/name in JSX and blurs rows 4–5, but the unmasked values are in the network payload/query cache. Bounded (5 `is_preview` rows), cosmetic — mask server-side in a preview RPC/view.
- **AUD-039** — `useSubscription.canAccessFeature('premium')` returns `-1`/false always; dead code (0 usages). Delete or fix.

---

## 8. Phase 2F — Edge Functions (deep dive)

**26 functions reviewed** against `config.toml`, `_shared/` modules, and each `index.ts`. **No P0/P1** — no unauthenticated function mutates data or exposes admin actions.

- **AUD-025 (P2)** — `generate-plan`: `verify_jwt=true` but no rate limit; any authed user can spam `claude-sonnet-4-6` (`max_tokens:4000`) calls. `generate-report` correctly uses `checkRateLimit(user.id, "generate-report", 5, 60)`. Add the same. Effort S.
- **AUD-030 (P2, SUSPECTED)** — `knowledge-search`: header comment says `verify_jwt=false` "so anonymous agents can call it," no rate limit, every call fires a paid OpenAI embedding; `match_threshold` unclamped. Not in `config.toml` so deployed setting is unproven. Add IP-keyed `checkRateLimit`, clamp threshold, and pin verify_jwt.
- **AUD-031 (P2)** — 5 in-scope functions have **no** `[functions.X]` block in `config.toml` (`knowledge-search`, `embed-knowledge`, `ingest-events`, `normalize-events`, `mcp`). The file itself warns the hosted dashboard isn't auto-synced. Webhooks that need `verify_jwt=false` silently break if the dashboard defaults them to `true`. Add explicit blocks. Effort S.
- **AUD-032 (P3)** — Slack `mrkdwn` injection: untrusted intake values reach Slack unescaped in `report-quality-rollup:98`, `slack-notify/reportQuality.ts:274,323`, `slack-notify/index.ts:58` (allows `<!channel>` pings / link spoofing into the internal channel). `_shared/slack.ts` `escapeSlack` exists and is used elsewhere — apply consistently. Effort S.
- **AUD-033 (P3)** — `_shared/http.ts:14` reflects any `*.lovable.app|.dev|lovableproject.com` origin (attacker-registrable). Low risk today (no `Allow-Credentials`, bearer-token auth) — drop the wildcard before launch or gate behind a non-prod flag.
- **AUD-028 (P3)** — `_shared/rateLimit.ts:29` fails open on DB error (throttling silently disabled). Acceptable for availability; add a log-alert.
- **AUD-029 (P3)** — raw `error.message` returned to client in `sync-lemlist:345`, `enrich-investors:90`, `enrich-innovation-ecosystem:105`, `enrich-content` (all `requireAdmin`-gated, low impact) and `generate-report:2591` — prefer generic client messages + server logging.
- **AUD-048 (P3)** — CLAUDE.md documents `apify-webhook` and `notion-research-trigger`, but **neither exists** in `supabase/functions/`. Reconcile the docs.

**Exemplary / CLEAN:** `scrape-company` (SSRF guard + IP rate limit + sanitize + fail-soft), `send-email` (dual auth; JWT path forces recipient to caller's own email — no open relay), `send-lead-followup` (JWT + 3/24h limit + forced recipient + length caps), `firecrawl-*` (admin + `validateExternalUrl`), `enrich-*` (admin + URL validation + sanitize), `classify-personas`/`sync-lemlist`/`admin-mentor-anonymity` (admin, allowlists, no PII logged), `ai-chat` (JWT + ownership; placeholder), `embed-knowledge`/`kb-sync` (Vault/internal-secret; cross-project read via restricted view + anon key only), `mcp` (read-only, RLS applies, filter-value sanitized), `ingest-events`/`normalize-events` (webhook-secret / service-role), `rq-slack-actions` (Slack HMAC + replay window + timing-safe compare + host-pinned response_url), `report-quality-loop`/`report-quality-rollup`/`slack-notify` (webhook-secret; loop escapes Slack + caps tokens/wall-clock), `email-assets`/`sitemap` (public by design, PII via `_public` views).

---

## 9. Phase 2D — AI Report Pipeline (deep dive)

**Posture is strong:** `generate-report` auth/ownership is correct (JWT via `getUser`, `intake.user_id !== user.id` → 403 — no way to target another user's intake or spoof `user_id`), `tier_at_generation` is server-trusted (initial `free`, final from a service-role `user_subscriptions` lookup), SSRF guards on every user-supplied URL, scraped content sanitized before the LLM, `Promise.allSettled` fail-soft phases with the report saved durably before the best-effort polish pass, CORS allowlisted, no CSRF vector (bearer auth), no PII/secret logging.

- **AUD-025 (P2)** — `generate-plan` no rate limit (also in §8).
- **AUD-026 (P3)** — `generate-plan/index.ts:81`: a service-role `user_reports` query (RLS bypassed) is filtered only by persona, returning up to 10 reports across **all users**; their IDs/status/tier surface in the generated plan. Add `.eq("user_id", user.id)`. Low impact (opaque UUIDs, views owner-gated) but cross-tenant. Effort S.
- **AUD-027 (P3, SUSPECTED)** — a report row inserted `status:"processing"` that dies before the background catch (isolate kill) stays `processing` forever; the pre-create duplicate guard then blocks that intake from ever regenerating. Add a staleness TTL / reaper. Effort M.
- **AUD-028 (P3)** — rate limiter fails open (§8). For this many-paid-API-call endpoint consider fail-closed.
- **AUD-029 (P3)** — a thrown Postgres error at `:2591` surfaces its `.message` in the 500 body (minor schema disclosure; no stack/secret). Also return 404 (not 500) for "Intake form not found."
- **Prompt injection** — user's own free-text intake fields flow into their own report/plan prompts unsanitized (only *scraped* content is sanitized). This is **self-injection only** (no cross-tenant/privilege impact; gating is structural via `visible:false`, not prompt-obedience). Informational, no action required.

---

## 10. Phase 2E/I/J/H/K — Directories, UX, SEO, Performance (deep dive)

**Routing/boundaries CLEAN:** catch-all 404 (`App.tsx:147`), all legacy redirects present, every route-map component exists, app-level route-aware error boundary (`ErrorBoundary.tsx`), full `React.lazy` code-splitting, sane react-query defaults, no `console.log` in `src/`, no list-page N+1.

- **AUD-043 (P2, SUSPECTED)** — `useMentors.ts:134` selects `community_members_public` with no `.limit()`/`.range()` → silent 1000-row cap; `/mentors` would silently drop members past 1000. Add explicit bound + pagination.
- **AUD-044 (P2)** — `ServiceProviders.tsx:78` omits `loading` from the data provider, so `ServiceProvidersList` renders "No service providers found" during the initial fetch (empty-state flash). Every other directory shows a skeleton. Consume `loading` → `CardGridSkeleton`. Effort S.
- **AUD-045 (P2)** — `ServiceProvidersDataProvider.tsx:130` catches fetch errors with a toast then renders an empty grid — no error UI/retry; it's also the one directory still on `useEffect`+`useState` (refetches every mount, no cache, no `error` surface). Migrate to react-query. Effort M.
- **AUD-046 (P2)** — Detail-page soft-404s are indexable: `ServiceProviderPage:36`, `InvestorPage:28`, `EventDetailPage:27`, `LocationPage:24`, `CountryPage:71`, `AgencyDetailPage:26`, `InnovationOrgPage:25`, `LeadDatabaseDetailPage:64` all render a "Not Found" branch with **no** `<NoIndex/>` and HTTP 200. `/investors/garbage-slug` is a fully indexable shell. Add `<NoIndex/>` to each (interim) or return real 404s. Effort S–M.
- **AUD-047 (P2/P3)** — Hard `.limit(500)` on primary directories (`useInvestors:12`, `useEvents:46`, `useCommunityMembers:15`, `useInnovationEcosystem:12`, `useLeadDatabases:18`, `ServiceProvidersDataProvider:55`) with client-side pagination. **Investors is 447/500** — one scrape run from silent truncation with no "load more." Move to server-side pagination or raise/monitor the ceiling.
- **AUD-037 (P3)** — `Investors.tsx:104`, `ServiceProviders.tsx:54`, `Leads.tsx` hand-roll canonical/og:url from `window.location.origin` instead of `SEOHead`'s `publishedOrigin()` → wrong canonical host on preview/staging. Route all pages through `SEOHead`.
- **AUD-038 (P3)** — `src/pages/ReportCreatorV2.tsx` is dead/unrouted. Delete or wire up.
- **AUD-050 (P3)** — `CaseStudyDetail` chunk is 756 kB (137 kB gzip); `index` 360 kB. Investigate the CaseStudyDetail dependency (likely a heavy markdown/vendor import) and split. 
- **SEO CLEAN:** `index.html` title/description/OG image (1200×630)/Twitter card/Organization JSON-LD/favicon all present and correct; `robots.txt` + DB-driven sitemap edge function proxied via `_redirects`; route-specific canonicals via `SEOHead` by design.

---

## 11. Phase 3 — Adversarial Pass

Each P0/P1 was re-reviewed to try to disprove it; anon reachability was probed directly.

| Claim | Adversarial test | Result |
|-------|------------------|--------|
| "Anon can read PII/paid tables" | Direct anon-key `GET` on `investors`, `community_members`, `lead_database_records`, `agency_contacts`, `service_provider_contacts` | **Disproven for anon** — all `401`. Exposure is to *authenticated* users only. Findings re-scoped accordingly (AUD-002/020/001). |
| "`ingest_state` is exposed" | Anon-key `GET /ingest_state` | **Confirmed** — HTTP 200; grants confirm anon INSERT/UPDATE/DELETE/TRUNCATE. AUD-003 stands. |
| "Reports leak gated content" | Traced `fetchReport`/`pollReportStatus`/`get_shared_report`/`get_tier_gated_report` | Primary paths **strip content server-side** (RPC bodies inspected). Only `fetchMyReports` `select('*')` leaks → AUD-004 stands; others cleared. |
| "Lead paid records dumped to any user" | Counted rows: 325 total, **0 non-preview**; searched for `lead_database_purchases` | Re-scoped: no paid rows exist in the table (manual fulfillment); leak is preview-PII (AUD-001, P2). Missing entitlement table is the real issue (AUD-006, P1). |
| "Tier can be injected via checkout" | Traced guard skip + metadata spread + webhook grant | **Confirmed** exploit path — AUD-005 stands (P1). |
| "Admin surfaces reachable by non-admins" | Confirmed RLS present on `directory_submissions`/`email_leads`/`lemlist_*`/mentor-admin tables | Client gate is cosmetic but **RLS backs it** — AUD-021 downgraded to P2. |
| "Stripe webhook forgeable" | Reviewed `constructEventAsync` + raw-body handling | Signature verification correct — **not** exploitable. |

**Client-side tier bypass in devtools:** even if a user flips client gating flags, gated report content is absent from the payload (stripped by the RPC), so devtools tampering reveals only placeholders — except via AUD-004's `fetchMyReports` path. Consistent with the findings.

---

## 12. Prioritised Fix Plan — proposed follow-up tickets (sub-tickets of MES-111)

Ordered by priority. Suggested Type / Workstream / Priority / dependencies for pasting into the MES Tickets DB.

**P1 — launch blockers**

1. **Fix paywall bypass in lead-purchase checkout** — Type: Bug · Workstream: Payments · Priority: P1 · Covers AUD-005 (+AUD-009 as defense-in-depth). Force `tier="lead_purchase"` in the direct-price branch; validate paid amount↔tier in the webhook. Dep: none.
2. **Restore lead-purchase entitlement (missing `lead_database_purchases` table + RLS)** — Type: Bug · Workstream: Payments/DB · Priority: P1 · Covers AUD-006 (+AUD-008 retry). New migration recreating the table and purchase-scoped `lead_database_records` policy; OR hide the self-serve buy button pending rebuild. Dep: none.
3. **Lock down authenticated-user data exposure (RLS)** — Type: Security · Workstream: RLS/DB · Priority: P1 · Covers AUD-002 (investors PII), AUD-001 + AUD-020 (P2, batch together). Restrict base-table SELECT to admin/service-role; serve clients via `*_public`/report views. Dep: none (migration).
4. **Enable RLS + revoke anon grants on `ingest_state`** — Type: Security · Workstream: RLS/DB · Priority: P1 · Covers AUD-003. One-line migration. Dep: none.
5. **Stop `fetchMyReports` leaking gated `report_json`** — Type: Bug · Workstream: Reports/Freemium · Priority: P1 · Covers AUD-004 (+AUD-035). Replace `select('*')` with an explicit metadata column list; source mentor previews via the gated RPC. Dep: none.

**P2 — soon after launch (group into 3 tickets)**

6. **Stripe webhook robustness** — AUD-007 (idempotency ordering), AUD-008 (retry on lead-purchase failure). Workstream: Payments.
7. **Edge-function guardrails & config** — AUD-025 (rate-limit `generate-plan`), AUD-030 (`knowledge-search` rate limit + verify_jwt), AUD-031 (pin verify_jwt for 5 functions). Workstream: Edge Functions.
8. **Directory/SEO hardening** — AUD-043 (mentors pagination), AUD-044/045 (ServiceProviders loading+error), AUD-046 (`<NoIndex>` on soft-404s), AUD-047 (500-row ceiling). Workstream: Frontend/SEO.
9. **Auth + dashboard hardening** — AUD-021 (optional server admin guard), AUD-022 (email confirmation), AUD-023 (getSession error path), AUD-024 (OTP/leaked-password). Workstream: Auth/Config.
10. **Dependency + build** — AUD-052 (`npm audit fix`). Workstream: Build.

**P3 — backlog:** AUD-010/011/026/027/028/029/032/033/034/037/038/039/040/041/042/048/050/051/053/060/061 — group by workstream (Payments UX, Report pipeline resilience, Edge Fn hardening, Slack escaping, Cleanup/dead-code, SEO polish, Performance/bundle, DB perf advisors).

---

## 13. Manual Pre-Launch Checklist (cannot be verified from the repo)

**Supabase dashboard**
- [ ] **Confirm email is ON** (Auth → Providers → Email → "Confirm email") — AUD-022.
- [ ] OTP expiry ≤ 3600s; **enable leaked-password protection** (HaveIBeenPwned) — AUD-024.
- [ ] Auth redirect URLs / Site URL point to `https://marketentrysecrets.com` (allowlist has no wildcards — verified in `config.toml`, confirm dashboard matches).
- [ ] SMTP / email sender configured and verified (transactional email via Resend; confirm domain SPF/DKIM).
- [ ] **Verify the deployed `verify_jwt` setting** for `knowledge-search`, `embed-knowledge`, `ingest-events`, `normalize-events`, `mcp` matches intent — AUD-030/031.
- [ ] Confirm `match_knowledge`'s default `allowed_visibility` only returns public KB rows to anon — AUD-060.
- [ ] Point-in-time recovery / backups enabled; note the retention window.
- [ ] Confirm all required secrets are set in prod (Stripe live keys, `FIRECRAWL_API_KEY`, `PERPLEXITY_API_KEY`, `LOVABLE_API_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, Slack/Notion, `EMAIL_INTERNAL_SECRET`, `KB_SYNC_SECRET`).
- [ ] Review DB perf advisors post-launch (drop the duplicate index, add the 3 FK indexes) — AUD-061.

**Stripe dashboard**
- [ ] **Live-mode** `STRIPE_SECRET` + `STRIPE_WEBHOOK_SECRET`; `STRIPE_GROWTH_PRICE_ID` / `STRIPE_SCALE_PRICE_ID` are live price IDs; every lead DB's `stripe_price_id` is live.
- [ ] Webhook endpoint registered to the `stripe-webhook` function URL, subscribed to `checkout.session.completed`, signing secret matches.
- [ ] Run a real live-mode test purchase for each tier and (if enabled) a lead DB; confirm the tier unlocks — **and re-test after AUD-005/006 fixes**.
- [ ] Products/prices match the `/pricing` page copy and amounts.

**DNS / domain / email**
- [ ] `marketentrysecrets.com` DNS + SSL valid; `www`→apex (or vice-versa) redirect; `FRONTEND_URL` set correctly.
- [ ] `og-image.png` renders in the LinkedIn/Twitter/Slack link preview debuggers.
- [ ] Sitemap edge function reachable at `/sitemap.xml`; `robots.txt` correct for prod.

**Monitoring / ops**
- [ ] Frontend + edge error monitoring (Sentry or equivalent) — the app currently only `console.error`s (no external reporting).
- [ ] Alerting on Stripe webhook 500s and on `payment_webhook_logs` write failures.
- [ ] Cost alerts on Firecrawl / Perplexity / Anthropic / OpenAI / Lovable usage (AUD-025/030 guardrails).
- [ ] `.env` removed from git tracking (`git rm --cached .env`) before adding any real secret — AUD-053.

---

## 14. Launch-Day Smoke Test (first hours after go-live)

Run in prod immediately after launch:

1. Anonymous: home, `/service-providers`, `/mentors`, `/events`, `/investors`, `/leads`, `/content` all load with data and correct teaser/gating; no console errors.
2. Anonymous: a bogus detail slug (`/investors/does-not-exist`) shows a not-found state (and is `noindex` once AUD-046 lands).
3. Sign up with a fresh email → receive + click the verification email → land signed-in.
4. Sign in / sign out / password-reset round-trip works.
5. Generate an AI report as a free user → completes → executive summary + free sections visible; gated sections show upsell placeholders (no gated content in the Network tab).
6. Open `/my-reports` → verify the report list loads and (post-AUD-004) the Network response contains **no** gated section content.
7. Stripe checkout for the Growth tier (live mode, real card) → webhook fires → gated sections unlock without a manual reload (or via the "refresh access" button).
8. Confirm a purchased tier persists after a full sign-out / sign-in.
9. Attempt the AUD-005 exploit (lead price + `tier:"enterprise"`) → must be **rejected** after the fix.
10. Admin: `/admin/submissions` loads for an admin; a non-admin gets the access-required card (and empty data).
11. Submit a directory submission + a lead/contact form → row lands in the admin queue; confirm the confirmation email sends.
12. Trigger a report generation twice quickly → rate limit (5/hr) engages; no duplicate stuck `processing` rows.
13. Check Stripe Dashboard → the test events show `200` and a matching `payment_webhook_logs` row + `user_subscriptions` update.
14. Verify OG preview renders when the homepage URL is pasted into Slack/LinkedIn.
15. Watch error monitoring + Supabase logs for the first hour for 4xx/5xx spikes.

---

_End of report. This audit made no code, RLS, migration, or data changes; all DB interaction was read-only introspection and anon-key probes._
