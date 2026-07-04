# MES-35 — Platform Readiness Scan & Ticket Backlog

> Fable MES platform readiness: sign-in, reports, payments, quality.
> Discovery/audit output only — no product code was changed. Date: 2026-07-04.
> Sources: full read-only codebase scan (frontend, edge functions, migrations, docs/migrations.md, CI).
> **Companion:** a dedicated data & security audit (RLS/PII exposure, edge-function security, secrets & GDPR governance, live Supabase advisors) lives in [`MES-35-security-data-audit.md`](./MES-35-security-data-audit.md), with security tickets **T19–T27**.

---

## 1. Platform-readiness overview

The platform is **feature-complete for the core journey** (arrive → sign in → create AI report → pay → view report) and much of the hard security work is already done (tier writes are service-role-only, share RPC strips gated content, lead PII is RLS-enforced). It is **not yet user-ready** because of a small number of high-impact reliability and revenue-protection gaps, plus broad but shallow design inconsistency across the directory ("database") pages.

**The five findings that most threaten a real-user launch:**

1. **Gated report content is readable by free users** (bypass the tier RPC; `/my-reports` even ships it first-party via `select('*')`). Revenue leak. (R1)
2. **A paying user can end up charged but never upgraded**: the Stripe webhook's dedup log is written *before* the subscription upsert, so Stripe's retry is short-circuited after any first-attempt failure; missing metadata is swallowed with a 200. (R2)
3. **Reports can get stuck in `processing` forever** — if the edge isolate is killed mid-pipeline nothing flips the row to `failed`, the poller gives up at 6 min, `ReportView` renders a blank shell for failed/processing reports, and there is no retry affordance. (R3)
4. **The sign-up → report auto-resume is broken for every auth method the V2 dialog offers** (OAuth/magic-link full-page round-trips lose the in-memory "pending generate" flag; email/password drops the return path entirely). First-time users land on the homepage instead of their report. (R4)
5. **Report generation has no tier/credit gate and no cost ceiling** — 5 full-cost reports/hour/user indefinitely, each burning Perplexity + Firecrawl + Gemini including all premium sections; the pre-auth `scrape-company` endpoint is an anonymous cost amplifier. (R5)

Everything else — filter-bar duplication, four loading paradigms, three error-state styles, ~399 hardcoded colour utilities, dead code, migration-ledger drift — is real debt but does not block a user completing the journey; it degrades trust and polish.

---

## 2. End-to-end user journey map

### 2.1 Arrive
`/` (`Index.tsx`): hero → before/after → search → pricing → testimonials. Lead-gen popup after 15 s for anonymous users; freemium gate = 3 free directory views (`localStorage` + `user_usage`).
**State:** works. Gaps: `user_usage` has fully-open RLS (anyone can read/insert all rows); some hero components carry heavy hardcoded-colour debt.

### 2.2 Sign in / create account
`AuthDialog` (4 tabs: sign-in / sign-up / magic link / reset; Google + Azure OAuth). Bootstrap: two `auth.users` triggers create `profiles` + `user_roles` and `user_subscriptions('free')` — both wrapped in `EXCEPTION WHEN OTHERS` so they can silently not exist.
**Failure points:**
- Email/password flows never call `setAuthReturnPath` → confirmation link lands on `/`, not the report (`AuthDialog.tsx:61-84`, `AuthCallback.tsx:14`).
- Password sign-up with email confirmation = dead end in the original tab (dialog closes, no session, no path back).
- OAuth denial → silent redirect home, no toast (`AuthCallback.tsx:16-60`).
- Missing `profiles` row → `UserDropdown` returns `null`: no menu, no sign-out (`UserDropdown.tsx:40`), and no onboarding dialog either (`AuthContext.tsx:27-30`).
- Raw Supabase error strings shown verbatim (incl. "User already registered" enumeration).

### 2.3 Dashboard / app home
`/dashboard` and `/member-hub` both render `MemberHub`; protected pages use an in-page `ProtectedRoute` card (no redirect, auth-in-place — acceptable). `/my-reports` lists reports but is a static query — a `processing` badge never updates without manual refresh.

### 2.4 Create AI report
`/report-creator` → `ReportCreatorV2` (feature flag `report_creator_v2` default **true**; the legacy 3-step wizard is dormant but bundled). Persona → Company (anonymous `scrape-company` prefill) → Goals → Details → Review → auth gate (draft saved to `localStorage['mes_intake_form_draft_v2']`) → `user_intake_forms` insert → `generate-report` edge function → `user_reports` row `processing` → background 5-phase pipeline → poll 3 s × 120.
**Failure points:** stuck-`processing` orphans (no watchdog); fake progress UI (all 4 phases pulse simultaneously); 360 s client cap vs "2–4 min" promise; failed reports get no email and render as an empty shell in `ReportView`; no one-click retry; per-section AI failures silently vanish (`status:'completed'` with missing sections).

### 2.5 Pay
Pricing page / gated-section CTA → `create-checkout` (one-time `mode: payment`, env-driven price IDs, origin-allowlisted return URL, metadata hardened) → Stripe → return with `?stripe_status=success` → webhook upserts `user_subscriptions` + `tier_at_generation`.
**Failure points:** webhook idempotency-before-processing bug (R2); missing metadata → 200 + silent no-op; `ReportView` polls 8×2 s and the loop exits immediately for non-free→higher upgrades (`newTier === 'free'` condition); `PaymentStatusModal` on /pricing claims success without reading any real state; no billing history/receipts/portal; no refund/dispute handling (permanent entitlement); no current-tier check (paid self-downgrade possible: a `scale` user buying `growth` is overwritten down).

### 2.6 Access report results
`/report/:id` via `get_tier_gated_report` RPC; share via `share_token` + `get_shared_report` RPC (strips gated prose — good); "PDF" = `window.print()` with decent print CSS; feedback thumbs write `feedback_score` (failures silently swallowed).
**Failure points:** owner can bypass the RPC and read gated JSON straight off `user_reports` (R1); `fetchMyReports` selects `*` including full gated `report_json`; a legacy `get_shared_report(TEXT)` overload without the `status='completed'` guard may still exist in prod (draft-leak + PostgREST overload ambiguity); empty/failed sections render as hollow titled cards.

### 2.7 Errors / empty / loading states (cross-cutting)
Three error-UI styles + four pages with **no** error handling; four loading paradigms; shared `EmptyState` used by only 3 of 12 directory pages; error copy leaks internals ("check the browser console", raw CORS strings, raw `report_json.error`).

---

## 3. App design consistency notes

### 3.1 Home page
Consistent hero/section composition, but hero and stats components are among the worst hardcoded-colour offenders (`HeroProductMockup`, `HeroStatsRow`, per-directory heroes at 6–17 violations each). Glassmorphism in `index.css:319-327` uses raw `rgba(255,255,255,…)` — not theme-aware.

### 3.2 Directory ("database") pages — inventory

| Page | Filter bar | Loading | Empty | Error |
|---|---|---|---|---|
| ServiceProviders | **StandardDirectoryFilters** (shared) | delegated | none | **none** |
| Mentors | bespoke `MentorFilters` (`?q=` not `?search=`) | CardGridSkeleton | shared EmptyState | card + retry |
| Events | StandardDirectoryFilters | CardGridSkeleton | shared EmptyState | card + retry |
| Leads | StandardDirectoryFilters | inline pulse | shared EmptyState | plain `text-red-500` |
| Investors | bespoke `InvestorFilters` (inside container) | inline pulse | bespoke | plain `text-red-500` |
| InnovationEcosystem | bespoke filters (inside container) | inline pulse | bespoke | plain `text-red-500` |
| Trade/Gov-support | wraps StandardDirectoryFilters ✅ | inline pulse | bespoke | plain `text-red-500` |
| Content | inline bespoke bar | CardGridSkeleton | delegated | card + retry |
| CaseStudies | **unique sidebar + sticky top-bar paradigm** | bespoke skeleton | bespoke | card + retry |
| Locations | inline bespoke | delegated | delegated | **none** |
| Countries | search-in-hero | delegated | delegated | **none** |
| Sectors | search-in-hero | spinner + text | delegated | **none** |

### 3.3 Filtering bars
**≥9 distinct filter-bar implementations**; heavy copy-paste (search-input block, `"all"` sentinel selects, clear-filters link, "Showing X of Y" line each re-declared in 6–8 files). `StandardDirectoryFilters` itself has a mobile bug: non-wrapping `flex gap-4` with fixed-width selects. Full-bleed vs in-container placement differs page-to-page. Sort defaults differ (`featured`/`newest`/`recent`). Only Events has the scroll-preservation hack; only CaseStudies has a mobile filter drawer.

### 3.4 Recommended reusable pattern
- `DirectoryLayout` (Hero → full-bleed FilterBar → container: banner + count + results + pagination).
- One config-driven `FilterBar` (extend `StandardDirectoryFilters`; fold in Mentors/Investors/Innovation/Content/Locations bars) + shared `useDirectoryFilters` URL-sync hook (standardise `?search=`, `"all"` sentinel, clear/reset, page reset).
- Shared `ErrorState` (AlertCircle + retry, `text-destructive`), consolidate loading on `CardGridSkeleton`, route `EmptyState` everywhere.
- Status-colour tokens (`--status-success/warning/danger`) to replace inline emerald/red/blue.

### 3.5 Dead code
`ReportCreatorLegacy` path (large, behind default-true flag), `SearchFilters.tsx` + `ProvidersSection.tsx` (transitively dead), `events/EventsFilters.tsx`, `events/EventSearch.tsx`.

---

## 4. Auth audit notes (summary)

Architecture is sound (single `AuthProvider`, guarded `onAuthStateChange`, magic-link supported, protected pages auth-in-place). Key gaps, in priority order:

1. Return-path only set for magic-link/OAuth, never for email/password (`AuthDialog.tsx:61-84`).
2. Auto-resume of report generation after OAuth/magic-link never fires — `pendingGenerate` is a `useRef`, lost on the full-page round-trip (`ReportCreatorV2.tsx:161-169`).
3. `user && !profile` → no dropdown, no sign-out, no onboarding (trigger failure or silent profile-fetch error → total limbo) (`UserDropdown.tsx:40`, `userDataService.ts:33-42`).
4. Raw Supabase errors as toasts incl. enumeration vector (`authService.ts:28-231`).
5. OAuth denial silently redirects home (`AuthCallback.tsx`).
6. `ResetPassword` lacks a recovery-session guard; client-only 6-char strength check.
7. Two owners of `loading` → post-login flash of "Sign In".
8. Admin gating is client-side UI only — actual security depends on RLS (confirm `directory_submissions` policies).

---

## 5. Stripe payments audit notes (summary)

Hardened correctly: signature verification on raw body, env-driven price IDs, origin-allowlisted return URLs, metadata spoof-proofing, service-role-only tier writes, lead-DB record access genuinely RLS-enforced.

Gaps (ranked): R1 gated-content readability (see §10); **R2 webhook dedup-before-processing** defeats Stripe retries (`stripe-webhook/index.ts:40,70,146`); **R3 missing metadata → silent 200**; no refund/dispute/downgrade handling (permanent entitlement); no current-tier check (double-charge / paid self-downgrade via `onConflict: user_id` upsert); entitlement matrix triplicated (TS + 2 SQL functions); post-payment polling short + non-free upgrade bug (`ReportView.tsx:59-70`); cosmetic `PaymentStatusModal`; no billing history/receipts/portal; free-lead-DB path is a stub TODO.

**Source of truth for paid access:** `user_subscriptions.tier` (correct, server-enforced). Content gating, however, is enforced only by *convention* (RPC) — not by grants — which is the crux of R1.

---

## 6. AI report creator audit notes (summary)

V2 wizard is live (flag default-true); auth ordering is correct (pipeline never runs unauthenticated); draft persistence works; edge function has ownership checks, 5/hr rate limit, and a same-intake dedup guard.

Risks: stuck-`processing` orphans with no watchdog (HIGH); no tier/credit gate → unbounded cost incl. generating premium sections for free users (HIGH); silent per-section failure → `completed` reports with missing sections; no retry affordance (draft survives but nothing tells the user); dedup guard is per-intake-row + check-then-insert race; anonymous `scrape-company` cost surface (IP rate limit fails open — `_shared/rateLimit.ts:29-33`); no 429 retry for section calls; fake progress UI; My Reports static; failure sends no email; error copy leaks internals.

---

## 7. AI report results review (summary)

Structure: `report_json { company_name, sections{content, visible, matches}, matches, metadata }`; 10 canonical sections; prompts live in DB `report_templates`; Gemini flash via Lovable gateway; polish pass best-effort (2×45 s, ships unpolished on timeout, recorded in `polish_applied`).

Quality risks:
- **Citations are decorative** — positional `[N]`→URL mapping with no claim-support verification; `[N]` in headings/table-headers renders as literal text.
- **Single-point metric amplification** — `key_metrics` regex-parsed from one Perplexity landscape response, then broadcast as "CANONICAL MARKET FIGURES" to every section: one hallucinated market size becomes consistently wrong everywhere including the stat cards.
- Grounding is prompt-directive-only; no post-generation verification. AU hardcoded by design.
- **Three sources of section truth** (frontend `SECTION_ORDER`, DB templates, edge rubric) must be kept manually in sync — a new template silently never displays.
- Empty/failed sections render as hollow titled cards; `status:'failed'` reports render a blank shell.
- Share flow is client-generated UUID via authenticated update (no rate limit); "PDF" is `window.print()`; feedback failures silently swallowed; no feedback on shared view.
- `report-quality-loop` (relevance/conciseness/fidelity, propose-only) exists but is disabled by default — diagnosis without closure.

---

## 8. Report quality benchmark

| Level | Definition | Requirements |
|---|---|---|
| **Minimum acceptable** | Free-tier sections (exec summary, service providers, events, action plan, setup/compliance) render with template prose + real DB directory cards; no fabricated stats; no hollow/empty section cards; report never stuck in `processing`; failed generation clearly communicated with retry. | Lovable AI key healthy; empty-section suppression; watchdog; failure UX. |
| **High quality** | All research streams healthy: Perplexity 6-stream research + citations, successful company deep-scrape with real `key_clients`, competitor + end-buyer coverage, full DB match slates per section, 4–6 parsed key-metric cards, polish applied (AU spelling, dedup, length discipline), all tier sections present. | All three API keys healthy + scrapeable target; polish must not time out; per-section retry on 429. |
| **"Golden issue" benchmark** | Everything in High **plus** verifiable grounding: every quantitative claim carries a citation that actually supports it; key metrics validated as niche-specific (not umbrella-market); zero empty sections; consistent figures across sections and stat cards; passes `report-quality-loop` rubric ≥ agreed threshold on relevance/conciseness/fidelity; pinned as a versioned fixture (golden intake → golden report JSON) that CI/regression checks compare against. | Claim→citation verification pass; metric validation; a checked-in golden fixture; quality-loop enabled with threshold alerting. |

---

## 9. Database consistency review

**Ownership map:** all user tables FK `auth.users` directly (not `profiles`) with CASCADE; admin override via `has_role()` SECURITY DEFINER. Consistent. Gaps: no DELETE policies on `user_reports`/`user_intake_forms` (GDPR/data-deletion gap); `user_subscriptions` has no INSERT policy (trigger-only — fine); new-user fan-out is two independent exception-swallowed triggers → partial bootstrap possible.

**Types drift:** `user_intake_forms`/`user_reports` **are now in generated types** (CLAUDE.md §2 is outdated on this), yet 69 `(supabase as any)` casts persist across 29 files (RPCs genuinely untyped).

**Naming:** `community_members` ↔ "mentors", `trade_investment_agencies` ↔ "government-support", `/dashboard`+`/member-hub` aliases, `/planner` redirect — cosmetic but adds mapping load; later migrations mix both vocabularies.

**Migrations:** ledger in `MIGRATIONS_FAILED` (~94% divergence; bookkeeping drift, prod schema believed correct); re-baseline runbook documented, **not executed**; merged migrations do NOT auto-apply — yet `deploy-edge-functions.yml:3-4` claims the opposite (stale comment = operational trap). 36 legacy `<ts>-<uuid>.sql` files are CLI-skipped, plus **`combined_all_case_study_rewrites.sql` has no timestamp at all** and will never apply via CLI.

**CI/tests:** one workflow (edge-function deploy only) — no lint/test/typecheck gate on PRs; no `typecheck` script; edge functions have some tests, frontend effectively zero.

---

## 10. Risk register

| ID | Sev | Risk | Where | Approval-gated? |
|---|---|---|---|---|
| R1 | **Critical** | Free owner reads gated premium prose: full `report_json` readable via base-table RLS; `fetchMyReports` ships it via `select('*')` | `20260207000000…:117`, `reportApi.ts:210` | RLS/grants change → **yes** |
| R2 | **High** | Webhook dedup logged before processing → Stripe retry short-circuited → charged-but-never-upgraded | `stripe-webhook/index.ts:40,70,146` | Payments → **yes** |
| R3 | **High** | Reports stuck in `processing` forever; no watchdog; blank shell + no retry in UI | `generate-report/index.ts:2299,2429`, `ReportView.tsx` | No |
| R4 | **High** | Sign-up→report auto-resume broken for OAuth/magic-link; email/password loses return path | `ReportCreatorV2.tsx:161`, `AuthDialog.tsx:61-84` | No |
| R5 | **High** | No tier/credit gate on generation; anonymous `scrape-company` amplifier; rate limiter fails open | `generate-report/index.ts:2381`, `_shared/rateLimit.ts:29` | Partially (pricing policy) |
| R6 | **High** | Legacy `get_shared_report(TEXT)` overload may survive in prod: draft leak + RPC ambiguity | `20260301200002…:20` vs `20260607233304…` | Migration vs prod → **yes** |
| R7 | Med | Missing-metadata webhook → silent 200; no reconciliation job over `payment_webhook_logs` | `stripe-webhook/index.ts:211` | Payments → yes |
| R8 | Med | No refund/dispute handling; no current-tier check (double-charge / paid self-downgrade) | `create-checkout`, webhook upsert | Payments → yes |
| R9 | Med | Missing profile row → no menu/sign-out/onboarding; partial bootstrap possible | `UserDropdown.tsx:40`, triggers | No |
| R10 | Med | Migration ledger drift + stale auto-apply claim in workflow comment + unversioned SQL file | `docs/migrations.md`, `deploy-edge-functions.yml` | Re-baseline → yes |
| R11 | Med | Key-metric single-point hallucination broadcast to all sections; citations unverified | `generate-report/index.ts:1770,2016` | No |
| R12 | Med | Entitlement matrix triplicated (TS + 2 SQL fns); section list triplicated (config/templates/rubric) | `reportSectionConfig.ts:108` etc. | No |
| R13 | Low | `user_usage` open RLS (anon read/insert all) | `20250621015154…:39` | RLS → yes |
| R14 | Low | Error/empty/loading inconsistency; internals leaked in user-facing copy | multiple | No |
| R15 | Low | No CI quality gate; near-zero frontend tests | `.github/workflows` | No |

---

## 11. Recommended improvement roadmap

- **Phase 0 — Revenue & trust (this week):** T1, T2, T3 (+ verify R6 against prod).
- **Phase 1 — Core journey reliability:** T4, T5, T6, T7, T8.
- **Phase 2 — Cost control & payments hardening:** T9, T10.
- **Phase 3 — Design consistency:** T11, T12, T13.
- **Phase 4 — Report quality:** T14, T15.
- **Phase 5 — Hygiene & launch:** T16, T17, T18.

Sequencing logic: nothing in Phases 1–5 can compensate for a paying user not receiving their tier (Phase 0); design consistency (Phase 3) deliberately follows journey reliability; the golden benchmark (T15) needs T6/T14 so quality measurement isn't dominated by pipeline failures.

---

## 12. Numbered implementation-ready ticket backlog

> Priorities: P0 = pre-launch blocker, P1 = launch week, P2 = fast-follow, P3 = scheduled debt.
> Risk flags: `[APPROVAL: RLS]`, `[APPROVAL: PAYMENTS]`, `[APPROVAL: MIGRATION-PROD]` per MES-35 approval gates. All migrations must follow `docs/migrations.md` (CLI/PR flow, no out-of-band applies, not-live-until-confirmed).

---

### T1 — Enforce report content gating server-side (close the free-tier premium leak)
- **Objective:** Make it impossible for a free-tier owner to read gated section prose, via DevTools or first-party code.
- **Priority:** P0. **Risk flags:** `[APPROVAL: RLS]` `[APPROVAL: MIGRATION-PROD]` — prepare migration in PR; human applies.
- **Scope:** Column-level `REVOKE SELECT (report_json)` on `user_reports` for `authenticated` (or move gated prose out of the owner-readable row); make `get_tier_gated_report` the only read path; fix `fetchMyReports` (`reportApi.ts:210`) to select list columns only (`id, status, tier_at_generation, created_at, company name join`) — the client fix ships immediately regardless of the migration; audit all other `from('user_reports')` reads.
- **Out of scope:** changing the tier model or section entitlement matrix; re-generation on upgrade.
- **Acceptance criteria:** with a free account owning a report, `supabase.from('user_reports').select('report_json')` returns a permission error (or content-free row); `/my-reports` network tab contains no gated prose; owner report view and instant tier-upgrade unlock still work; shared view unaffected.
- **Test plan:** manual DevTools query as free user; unit test on `fetchMyReports` selected columns; regression: generate → upgrade → sections unlock without re-generation; `get_shared_report` still strips gated content.
- **Dependencies:** none. Do before marketing pushes traffic. Pairs with T3 (same RPC family).

### T2 — Stripe webhook reliability: idempotency, missing-metadata alerting, reconciliation
- **Objective:** Guarantee a captured payment always results in the tier being applied (or a loud alert), surviving first-attempt failures via Stripe retries.
- **Priority:** P0. **Risk flags:** `[APPROVAL: PAYMENTS]`.
- **Scope:** in `stripe-webhook`: record "received" and "processed" as distinct states (or write the dedup row only after successful processing) so a 500 → Stripe retry actually reprocesses; return non-200 (or log + alert) on missing/mismatched `supabase_user_id` metadata instead of silent 200; add a small reconciliation path (admin script or cron) that replays unprocessed `payment_webhook_logs` rows; alert (Slack) on any unprocessed event older than N minutes.
- **Out of scope:** refunds/disputes (T10); checkout UX (T8); any Stripe dashboard/production config change.
- **Acceptance criteria:** simulated upsert failure on first delivery → Stripe retry succeeds and tier is applied exactly once; duplicate deliveries of a processed event remain no-ops; missing-metadata event produces an alert and a replayable log row.
- **Test plan:** Stripe CLI test-mode events: happy path, forced DB error then retry, duplicate delivery, metadata stripped; assert `user_subscriptions` end state and `payment_webhook_logs` states.
- **Dependencies:** none. Before launch.

### T3 — Verify and drop the legacy `get_shared_report(TEXT)` overload
- **Objective:** Eliminate the draft-leaking, ambiguity-prone TEXT overload if it survives in prod.
- **Priority:** P0 (verification is cheap; leak severity high). **Risk flags:** `[APPROVAL: MIGRATION-PROD]`; read-only prod introspection first.
- **Scope:** introspect prod for all `get_shared_report` signatures; if the TEXT variant exists, ship a migration `DROP FUNCTION public.get_shared_report(text)`; confirm the surviving variant enforces `share_token IS NOT NULL AND status='completed'` and strips `visible:false` content.
- **Out of scope:** share-UX changes (rate-limiting share-token minting → T14).
- **Acceptance criteria:** exactly one `get_shared_report` in prod; shared link to a `processing`/`failed` report returns nothing; existing share links keep working.
- **Test plan:** `information_schema.routines` check pre/post; RPC call with a draft report's token; happy-path shared view.
- **Dependencies:** none; coordinate with T1's migration PR.

### T4 — First-time user auth journey: return path + generation auto-resume
- **Objective:** A user who starts a report and authenticates (any method) lands back on their report flow and generation resumes without re-clicking.
- **Priority:** P1 (it's the money funnel). **Risk flags:** auth-adjacent but no policy/secret changes.
- **Scope:** call `setAuthReturnPath` in `handleSignIn`/`handleSignUp` (`AuthDialog.tsx`); persist the pending-generate intent in `localStorage` (not `useRef`) and resume on remount after `/auth/callback` (`ReportCreatorV2.tsx:161-169`); handle the email-confirmation dead end (post-signup screen: "confirm your email, then your report will start"); handle `?error=`/denied in `AuthCallback` with a toast.
- **Out of scope:** profile bootstrap (T5); error-copy mapping (T17 scope folded here if small — see AC).
- **Acceptance criteria:** start report → auth via OAuth, magic link, email/password (confirmed) → return to `/report-creator` with draft intact and generation auto-starting; OAuth cancel shows feedback instead of silent homepage bounce.
- **Test plan:** manual matrix of 4 auth methods × (fresh signup / returning user); unit test for the persisted-intent helper (extend `authReturnPath.test.ts`).
- **Dependencies:** none. Before T18 smoke test.

### T5 — Profile bootstrap resilience (no more authenticated limbo)
- **Objective:** An authenticated user always has a working account menu and onboarding, even if the `profiles` row is missing or its fetch fails.
- **Priority:** P1. **Risk flags:** touches auth context; no RLS change needed for the frontend fix.
- **Scope:** `UserDropdown` functional fallback when `user && !profile` (initials avatar + sign-out + "complete your profile"); stop silently swallowing profile-fetch errors (`userDataService.ts:33-42`) — retry once, then surface; client-side self-heal: on `user && profile === null` after successful fetch (row truly missing), upsert own profile row (permitted by existing self-INSERT policy); reconcile the two `loading` owners to kill the post-login "Sign In" flash.
- **Out of scope:** changing the `auth.users` triggers (DB) — note for later hardening; onboarding content.
- **Acceptance criteria:** with the profile row deleted in a test account, the user can still sign out and is prompted/healed into a profile; no header flash after login.
- **Test plan:** manual with a trigger-suppressed test user; component test for the dropdown fallback.
- **Dependencies:** none.

### T6 — Report generation watchdog + failed/processing states + retry
- **Objective:** No report is ever stuck in `processing` forever, and failed reports are visible, explained, and retryable in one click.
- **Priority:** P1. **Risk flags:** new cron/edge function (service-role writes to `user_reports` — existing pattern).
- **Scope:** watchdog (pg_cron or scheduled edge function) flipping `processing` rows older than a max-runtime threshold to `failed` with a reason; `ReportView` branches for `status === 'processing'` (live progress / "come back soon") and `'failed'` (friendly error + Retry); Retry = re-invoke `generate-report` re-using the same `intake_form_id`; failure email in the pipeline's catch path (mirror the success email); sanitize user-facing error copy (no raw `report_json.error`, no "check the browser console").
- **Out of scope:** real progress instrumentation (T7); cost gating (T9).
- **Acceptance criteria:** kill a pipeline mid-run → row becomes `failed` within the threshold; opening a failed report shows an explanation + Retry which produces a new completed report without re-entering data; failed runs trigger an email.
- **Test plan:** edge-function test forcing a throw; manual orphan simulation (set `processing` with old timestamp, run watchdog); retry E2E.
- **Dependencies:** none; T7 builds on its states.

### T7 — Real generation progress + live My Reports
- **Objective:** Users watching a 2–6 minute generation see genuine progress, and `/my-reports` reflects status changes without manual refresh.
- **Priority:** P1. **Risk flags:** low; additive metadata writes.
- **Scope:** pipeline writes a coarse `progress` marker (phase name/percent) to `user_reports` (or metadata) at phase boundaries; `GeneratingScreenV2` renders actual phases instead of four simultaneous pulses; extend/replace the 360 s poll cap with "still running" continuation matched to the watchdog threshold (T6); `useMyReports` polls (or subscribes) while any report is `processing`.
- **Out of scope:** websocket infra beyond Supabase realtime/interval polling; pipeline performance work.
- **Acceptance criteria:** progress advances through ≥4 real phases; a slow (>6 min) report never shows a false "timeout" while still running; My Reports badge flips processing→completed unattended.
- **Test plan:** instrumented run in staging; slow-run simulation; component test for the poll-while-processing hook.
- **Dependencies:** T6 (status semantics).

### T8 — Post-payment activation UX (polling, pending state, honest modal)
- **Objective:** After Stripe redirect, the user reliably sees their new tier or an honest "activation pending" state — never a paywall reappearing in silence.
- **Priority:** P1. **Risk flags:** payments-adjacent (frontend only).
- **Scope:** fix the `ReportView` polling loop condition so growth→scale upgrades keep polling until the tier actually changes (compare against pre-checkout tier, not `'free'`); extend polling with backoff (~60–90 s) then show "Payment received — activation in progress" with a manual refresh CTA; make `PaymentStatusModal` read real subscription state before claiming success; handle signed-out returns on `/pricing` like `ReportView` already does.
- **Out of scope:** webhook internals (T2); billing history/receipts/portal (T10).
- **Acceptance criteria:** growth→scale upgrade unlocks sections without reload; artificially delayed webhook (test mode) → pending state, then success on arrival; modal never claims an upgrade that hasn't landed.
- **Test plan:** Stripe test-mode with delayed webhook delivery; upgrade-path matrix free→growth, free→scale, growth→scale.
- **Dependencies:** T2 (webhook must be reliable for the happy path to dominate).

### T9 — Report generation cost controls & abuse guards
- **Objective:** Put a policy-backed ceiling on AI/scraping spend per user and per anonymous IP.
- **Priority:** P1. **Risk flags:** product-policy decision needed (quota per tier) — flag for approval; no Stripe changes.
- **Scope:** decide + enforce per-tier report quota (e.g. free = 1–2 lifetime or per month) server-side in `generate-report` (not client); make `checkRateLimit` fail **closed** on error (`_shared/rateLimit.ts:29-33`); add a unique partial index / constraint to close the check-then-insert dedup race (one `processing` report per intake); tighten `scrape-company`: stricter anonymous limits, optional soft-auth requirement, per-day IP cap; add cost telemetry per report (already partially in `firecrawlStats`) surfaced to `report_quality`/Slack.
- **Out of scope:** changing which sections are generated per tier (deliberate instant-unlock design stays); pricing changes.
- **Acceptance criteria:** free user exceeding quota gets a friendly upgrade prompt, server rejects regardless of client; rate-limit DB failure blocks rather than allows; concurrent duplicate invokes yield one report.
- **Test plan:** edge-function tests for quota + fail-closed + dedup race (parallel invokes); manual quota UX.
- **Dependencies:** product sign-off on quota policy.

### T10 — Payments hardening: duplicate/downgrade guard, refunds, purchase history
- **Objective:** Prevent accidental double-charges and paid self-downgrades; define refund/dispute handling; give buyers a record.
- **Priority:** P2. **Risk flags:** `[APPROVAL: PAYMENTS]` (webhook events + policy).
- **Scope:** `create-checkout` checks current tier — block same-tier repurchase and require confirmation (or block) for lower-tier purchase; webhook: handle `charge.refunded` / `charge.dispute.created` → flag row for manual review (auto-revoke optional, per policy); minimal purchase-history view in MemberHub sourced from `payment_webhook_logs`/Stripe; implement or remove the free-lead-DB stub in `useLeadCheckout`.
- **Out of scope:** moving to recurring subscriptions; Stripe billing portal (one-time model makes it low-value — decide explicitly).
- **Acceptance criteria:** scale user cannot silently become growth by paying; same-tier repurchase blocked with clear messaging; refund in test mode flags the subscription row; purchases visible to the user.
- **Test plan:** Stripe test-mode refund/dispute events; tier-matrix checkout attempts.
- **Dependencies:** T2 first (event plumbing), then this.

### T11 — Directory design system: shared FilterBar, DirectoryLayout, and state components
- **Objective:** One reusable pattern for all 12 directory pages: layout, filter bar, URL-sync, loading/empty/error.
- **Priority:** P2. **Risk flags:** wide-but-mechanical refactor; regression risk on filters — do page-by-page.
- **Scope:** build `DirectoryLayout`, config-driven `FilterBar` (extend `StandardDirectoryFilters`, fix its non-wrapping mobile flex), `useDirectoryFilters` (standardise `?search=`, `"all"` sentinel, clear/reset, sort defaults, scroll preservation from Events applied everywhere); shared `ErrorState`; consolidate loading on `CardGridSkeleton`; adopt shared `EmptyState` in Investors/Innovation/Trade/CaseStudies; migrate pages in order: Investors, InnovationEcosystem, Trade → Mentors (`?q=`→`?search=` with redirect) → Content, Locations, Countries, Sectors → CaseStudies structural alignment last (its sidebar paradigm either becomes the sanctioned "rich" variant of `DirectoryLayout` or is normalised — explicit design decision inside the ticket).
- **Out of scope:** visual redesign of cards/heroes; colour-token cleanup (T12).
- **Acceptance criteria:** every directory page has: working filters synced to URL with reset, skeleton loading, shared empty state, shared error state with retry; no page silently swallows query errors; mobile filter layout usable at 360 px.
- **Test plan:** per-page manual matrix (filter, clear, deep-link with params, error-injected query, empty result); snapshot tests for the shared components.
- **Dependencies:** none, but land after P0/P1 to avoid conflicting with funnel fixes.

### T12 — Design-token cleanup & status colour system
- **Objective:** Eliminate hardcoded palette utilities (~399 occurrences/80 files) in favour of semantic tokens; theme-safe glassmorphism.
- **Priority:** P2 (after T11 so refactored components are tokenised once). **Risk flags:** low, visual-regression only.
- **Scope:** add `--status-success/warning/danger` tokens; replace `text-red-500` error text with `text-destructive`; sweep hero components, cards, submission forms, CaseStudies; convert `index.css:319-327` rgba glass styles to token-based; add an ESLint rule or CI grep guard against new raw palette classes.
- **Out of scope:** dark-mode enablement (tokens make it possible; shipping it is separate).
- **Acceptance criteria:** hardcoded palette-class count reduced to an agreed allowlist (~0 in `src/components` + `src/pages`); CI guard fails on new violations; no visual regressions on key pages (before/after screenshots).
- **Test plan:** screenshot diff of home, 3 directories, report view, pricing; grep-count assertion in CI.
- **Dependencies:** T11.

### T13 — Dead code & route-surface cleanup
- **Objective:** Remove dormant code paths that create divergence risk and bundle weight.
- **Priority:** P2. **Risk flags:** confirm the `report_creator_v2` flag is permanently on before deleting legacy.
- **Scope:** delete `ReportCreatorLegacy` + `useReportGeneration.ts` + `IntakeStep1-3` + `GeneratingOverlay` + legacy `intakeSchema.ts` + `reportApi.submitIntakeForm` (after flag decision); delete `SearchFilters.tsx`, `ProvidersSection.tsx`, `events/EventsFilters.tsx`, `events/EventSearch.tsx` (verify no dynamic imports); pick one canonical dashboard URL (`/dashboard` or `/member-hub`) and 301 the other; begin retiring unnecessary `(supabase as any)` casts on now-typed tables.
- **Out of scope:** renaming DB tables (naming divergence is documented, cost>benefit for now).
- **Acceptance criteria:** build passes; no route regression (redirects verified); bundle size reduced; grep shows no imports of deleted files.
- **Test plan:** `npm run lint` + build + route smoke; search for lazy/dynamic references pre-delete.
- **Dependencies:** flag decision from product; after T4 (which touches the V2 files).

### T14 — Report output quality: grounding, empty-section handling, share hygiene
- **Objective:** Raise floor quality (no hollow sections, honest citations) and reduce hallucination amplification.
- **Priority:** P2. **Risk flags:** prompt changes affect all new reports — stage behind comparison runs; `report_templates` edits ship via migration `[APPROVAL: MIGRATION-PROD]`.
- **Scope:** suppress/annotate empty sections in `ReportView`/`SharedReportView` ("this section could not be generated" instead of hollow cards); mark reports with failed sections as `completed_partial` in metadata + surface it; validate `key_metrics` (sanity pass or second-source check) before broadcasting as canonical; extend `CitationRenderer` to headings/`th` or strip `[N]` there; per-section 429/5xx retry with jitter in `callAI`; polish-timeout fallback messaging (`polish_applied:false` surfaced internally); rate-limit/move share-token minting server-side; fix reading-time to count visible sections only; surface feedback failures (remove silent catches) and add feedback to shared view.
- **Out of scope:** model changes; full claim→citation verification (goes with T15's benchmark work); multi-country support.
- **Acceptance criteria:** no hollow section cards in any report state; a report with a failed section is visibly partial; `[N]` never renders as literal text; transient gateway throttles no longer drop sections (retry evidenced in tests).
- **Test plan:** unit tests in `generate-report` test suite (empty-section path, retry path, metrics validation); render tests for viewer states; before/after report comparison on 3 sample intakes.
- **Dependencies:** T6 (status semantics), independent of T11-13.

### T15 — Golden-issue quality benchmark + quality loop activation
- **Objective:** Make report quality measurable and regression-proof against a pinned benchmark.
- **Priority:** P2/P3. **Risk flags:** enabling `report-quality-loop` incurs Anthropic spend — flag for approval; propose-only stays.
- **Scope:** create a versioned golden fixture (representative intake → curated expected report JSON) checked into the repo; define pass thresholds on the existing rubric axes (relevance/conciseness/fidelity); enable `report-quality-loop` on a schedule with Slack digest; add a regression harness that generates from the golden intake in staging and scores against thresholds; unify the three section-list sources (frontend `SECTION_ORDER`, DB templates, edge rubric) behind one generated source of truth.
- **Out of scope:** auto-applying quality-loop proposals (stays human-reviewed).
- **Acceptance criteria:** documented benchmark (min/high/golden per §8); scheduled loop posting digests; a deliberate prompt regression is caught by the harness before merge.
- **Test plan:** run harness against current pipeline to set baselines; simulate a regression (temporarily weakened template) and confirm detection.
- **Dependencies:** T6, T14 (floor fixes first, so the benchmark measures quality not breakage).

### T16 — Database & migration hygiene
- **Objective:** Remove latent migration footguns and reconcile contradictory operational docs; prepare (not execute) the ledger re-baseline.
- **Priority:** P2. **Risk flags:** `[APPROVAL: MIGRATION-PROD]` for the re-baseline itself; the rest is repo-only.
- **Scope:** deal with `combined_all_case_study_rewrites.sql` (verify already-applied-in-prod → move to an `applied-manually/` archive folder with a README, never rename applied versions); document the 36 legacy `<ts>-<uuid>.sql` files' applied status; fix the stale "auto-applies migrations" comment in `deploy-edge-functions.yml`; add DELETE policies for `user_reports`/`user_intake_forms` (owner delete) via migration `[APPROVAL: RLS]`; schedule the re-baseline runbook execution as its own approved change window; tighten `user_usage` RLS (session-scoped read) `[APPROVAL: RLS]`.
- **Out of scope:** executing the re-baseline in this ticket; renaming tables; **no destructive migrations, no moving the database**.
- **Acceptance criteria:** no unversioned SQL files in `supabase/migrations/`; workflow comment matches `docs/migrations.md`; ownership doc updated; RLS additions applied and verified by a human per runbook.
- **Test plan:** `supabase db push --dry-run` on a shadow DB; RLS policy tests (owner delete works, cross-user delete fails).
- **Dependencies:** coordinate with T1/T3 migration PRs to avoid version collisions.

### T17 — Auth polish: error copy, reset guard, admin-RLS verification
- **Objective:** Friendly, non-leaky auth errors and hardened edge flows.
- **Priority:** P2. **Risk flags:** security-adjacent `[APPROVAL: AUTH]` for anything beyond copy.
- **Scope:** map raw Supabase auth errors to friendly copy (neutralise "User already registered" enumeration); recovery-session guard on `ResetPassword` + basic strength requirements; sign-out navigation to `/`; verify `directory_submissions` (and other admin-page tables) RLS actually enforces `has_role(...,'admin')` — client-side gating is not a boundary; remove dead `access_token` fallback in `AuthCallback` and handle PKCE `?code=` explicitly.
- **Out of scope:** new auth providers; MFA.
- **Acceptance criteria:** no raw Supabase error strings reach toasts; expired reset link shows a clear re-request path; anon/non-admin API calls against admin tables fail (verified, documented).
- **Test plan:** manual error matrix; SQL policy tests for admin tables.
- **Dependencies:** T4 (same files — sequence after).

### T18 — CI quality gate + launch-readiness QA & smoke-test checklist
- **Objective:** A repeatable, pre-launch verification that the whole journey works, enforced by CI going forward.
- **Priority:** P1 checklist / P2 CI. **Risk flags:** none.
- **Scope:** add CI workflow running `lint`, `test`, and a new `typecheck` script on PRs; write the launch smoke checklist as `docs/launch-qa-checklist.md` covering: anonymous browse + freemium gate; all 4 auth methods incl. return-path (T4); report create → progress → complete; forced-failure → retry (T6); checkout free→growth and growth→scale incl. delayed webhook (T2/T8); gated-section lock/unlock incl. DevTools leak check (T1); share link (incl. draft-token negative test, T3); mobile pass at 360 px on home + 2 directories + report view; error/empty/loading spot-checks. Add the checklist as a required pre-launch gate; seed a minimal Playwright happy-path (browse → auth → create → view) as a stretch.
- **Out of scope:** full E2E coverage.
- **Acceptance criteria:** CI red on lint/type/test failures; checklist executed and signed off once against staging with all P0/P1 tickets landed.
- **Test plan:** the ticket *is* the test plan; verify CI by intentionally failing each gate.
- **Dependencies:** meaningful only after T1–T8; CI portion can land immediately.

---

## Sequencing summary

```
P0: T1 → T2 → T3            (revenue & leak; migrations via PR + human apply)
P1: T4 → T5, T6 → T7, T8 (after T2), T9, T18-checklist
P2: T10 (after T2) · T11 → T12 → T13 · T14 → T15 · T16 · T17 (after T4) · T18-CI
```

## Caveats

- Read-only audit; findings cite repo state at commit `9af9be4`. Prod DB was **not** introspected — R6 (`get_shared_report(TEXT)`) and applied-status of legacy migration files need prod verification before their tickets execute.
- Migration ledger is in `MIGRATIONS_FAILED` drift: every ticket that ships a migration is **not live until a human confirms prod apply** (`docs/migrations.md`).
- CLAUDE.md §2 note "`user_intake_forms`/`user_reports` not in generated types" is outdated — they are typed now; the `(supabase as any)` pattern persists mostly as habit (RPCs excepted).
