# MES-35 — Data & Security Audit (companion to the platform-readiness scan)

> Defensive security & data-governance audit of the maintainers' own MES platform.
> Read-only. Ticket numbering continues from the platform-readiness backlog (which ended at T18); security tickets are **T19–T27**.
> Date: 2026-07-04. Sources: full migration/edge/frontend code review **plus live Supabase security advisors** for prod project `xhziwveaiuhzdoutpgrh` (read-only `get_advisors`).

---

## 0. Why this pairs code review with live advisors

The migration ledger is in `MIGRATIONS_FAILED` drift (~94% divergence — see the readiness scan §9). That means **the migration source is not a reliable description of prod's actual RLS/grants**. So this audit reads the SQL *and* pulls the live advisor lints, and where they disagree that disagreement is itself a finding.

**Two concrete drift signals surfaced:**
1. The live advisor reports **18 anon-executable and 20 authenticated-executable `SECURITY DEFINER` functions** (including the `emit_*` activity-trigger functions and `has_role`) — yet several SEC-03 migrations claim to `REVOKE EXECUTE ... FROM anon, authenticated`. Either those revokes never applied to prod, or later functions re-granted. Prod is **less locked down than the migrations imply**.
2. The advisor flags table **`public.ingest_state` with RLS disabled** — and `ingest_state` appears **nowhere in `supabase/migrations/`**. It was created out-of-band (dashboard/MCP), which is precisely the failure mode `docs/migrations.md` warns about, and it left an ungoverned, anon-readable/writable table in the API-exposed `public` schema.

**Recommendation baked into the tickets:** treat `get_advisors` (security + performance) as a standing pre-launch and post-migration gate, not a one-off.

---

## 1. Security posture summary

**Genuinely well-built (do not re-fix):**
- `requireAdmin` (`_shared/auth.ts`) validates the JWT server-side and checks the DB `user_roles` table with the service role — it does not trust client claims. All 7 admin functions call it first.
- `stripe-webhook` signature verification, tier allowlist, event dedup; `create-checkout` price-vs-DB validation, return-URL allowlist, metadata spoof-proofing.
- Client write-grant lockdown (SEC-01/02/03) is real and correctly revokes default INSERT/UPDATE/DELETE from anon/authenticated except a funnel allowlist; **tables created after the lockdown (`ecosystem_import_candidates`, `automation_runs`, `report_quality_proposals`, `firecrawl_scrape_cache`) correctly self-defend** against Supabase's broad default grants.
- Frontend markdown is XSS-safe (no `rehype-raw`; DOMPurify on CMS HTML); open-redirect is blocked (`authReturnPath.isSafeInternalPath`); no client-supplied price/amount reaches checkout for the tier flow; no secrets in the bundle beyond the anon key; no prod source maps.
- `useMasterSearch` strips PostgREST filter metacharacters before interpolation; `sanitizeScrapedContent` hardens prompt-injection surface; user-URL fetches are Firecrawl-mediated (not direct `fetch()`).

**The gaps that matter** are concentrated in three areas: **PII read-exposure via `USING(true)` SELECT policies that the write-lockdown never touched** (agency contacts, investors), **PII committed to the git repo**, and **no data-deletion/export path**. Everything else is hardening.

---

## 2. Security & data risk register

Severity reflects launch impact. `[LIVE]` = confirmed against prod advisors; `[MIG]` = derived from migration chronology (verify against prod given drift). Approval flags per MES-35 gates.

| ID | Sev | Finding | Evidence | Approval |
|---|---|---|---|---|
| **S1** | **High** | **`agency_contacts` PII readable by anon** — `full_name`, `email`, `phone`, `linkedin_url` via `"Anyone can view agency contacts" USING(true)` + intact anon grant; `agencies_report_view.primary_contacts` also emits `email` to all readers. | `20260301100000:82-86,395-403`; `20260509080200:62-77` `[MIG]` | RLS → yes |
| **S2** | **High** | **`investors` PII readable by any authenticated user** — `contact_email/contact_name/linkedin_url/details` (447 rows). anon was reduced to safe columns (SEC-07) but the `authenticated` SELECT grant was **never revoked**, and the policy is `USING(true)`. Inconsistent with the `community_members` fix. | `20260218000002:63-65`; `20260607232915_sec_07:49-67` (anon-only) `[MIG]` | RLS → yes |
| **S3** | **High** | **Hundreds of real individuals' personal data committed to git** — `mentor_identification/mes_mentor_candidates*.csv` (~750 rows across variants: fullName + personal/professional email + LinkedIn URL + AI profiling/"reasoning"), `scripts/import_investors.sql` (147 personal emails), `scripts/fix_csv.py` (35), `startmate_import_blocks/*.sql`, `data/existing_picks.csv` (~104 LinkedIn URLs). ~600+ unique personal emails, ~1,200+ LinkedIn URLs, plus automated profiling. In git **history**, not just the tree. | repo tree + `git ls-files` | — (GDPR) |
| **S4** | **High** | **No GDPR erasure/export path** — no `delete-account`/`export` edge function; **no DELETE RLS policy** on `user_reports`, `user_intake_forms`, `lead_submissions`, `mentor_contact_requests`, `profiles`. Art. 17/20 unaddressed at DB and API layers. | `ls supabase/functions/`; policy review | RLS → yes |
| **S5** | **High** | **`ingest_state` has RLS disabled in the API-exposed `public` schema** → anon read/write via PostgREST. Created out-of-band (absent from migrations) — ledger-drift artifact. | advisor `rls_disabled_in_public` `[LIVE]`; no migration ref | RLS/prod → yes |
| **S6** | **Med** | **Report content leak (cross-ref R1/T1)** — gated premium prose sits in owner-readable `report_json`; the tier RPC is a convention, not a boundary. Security-critical; owned by **T1** in the readiness backlog. | `20260207000000…:117`, `reportApi.ts:210` | RLS → yes |
| **S7** | **Med** | **~18 anon-executable `SECURITY DEFINER` RPCs in prod** — `emit_*` trigger functions and `has_role(uuid,app_role)` callable via `/rest/v1/rpc/…` by anon; `has_role` lets an attacker probe whether any user_id is admin. Contradicts SEC-03 revokes → drift. | advisor `anon_security_definer_function_executable` (18) `[LIVE]` | prod → yes |
| **S8** | **Med** | **Customer PII posted to Slack** — `slack-notify` `actorLine()/summaryLine()` fall back to `actor_email`; `lead.submitted`/`intro.requested`/`submission.received` producers pass the lead/requester email as `actor_email` (null name → raw email to Slack). `metaLines()` also dumps all metadata verbatim. Routing rows currently `enabled=false`. | `slack-notify/index.ts:55,58-69`; `20260628210004…:23,55,80` | — |
| **S9** | **Med** | **`send-lead-followup` is an authenticated open email relay** — JWT-authenticated but no ownership/admin check; sends platform-branded Resend email to a caller-supplied `email`, no rate limit. Sender-reputation/phishing abuse. | `send-lead-followup/index.ts:32-40` | — |
| **S10** | **Med** | **SSRF guard is string-only and bypassable** (DNS rebinding, `127.0.0.0/8` beyond the literal, decimal/hex/octal IPs, IPv4-mapped IPv6, no redirect re-validation). Currently mitigated because user-URL fetches go through Firecrawl — a landmine the day any direct `fetch()` of a user URL is added. | `_shared/url.ts:19-53` | — |
| **S11** | **Med** | **Unvalidated URL protocol in `href`/`window.open`** for scraped/CMS/AI-sourced URLs (`javascript:` executes on click). Broad surface: `ReportMatchCard.tsx:142,174`, `useSectorHandlers.ts:6,18,33`, investor/agency/innovation detail components, `PersonModal.tsx:146`, etc. | see frontend audit list | — |
| **S12** | **Med** | **Rate limiting fails OPEN, is IP-spoofable, and is missing on expensive anon endpoints** — `_shared/rateLimit.ts:29-33` returns allow on DB error; `scrape-company` keys on spoofable `x-forwarded-for`; no limit on `knowledge-search` (OpenAI embedding per call) or `ai-chat`. | `_shared/rateLimit.ts`; function review | — |
| **S13** | **Low/Med** | **Non-constant-time secret comparison** in webhook guards (`===`) — `slack-notify:238`, `report-quality-rollup:46`, `report-quality-loop:149`, `kb-sync:39`, `process-email-queue:47`, `send-email:71`. `embed-knowledge` already uses the better Vault-RPC pattern. | as cited | — |
| **S14** | **Low/Med** | **`get_content_for_persona` anon `SECURITY DEFINER` with dynamic `%I` table name + mutable search_path**; `increment_view_count` DEFINER w/ mutable search_path + PUBLIC execute. Constrained blast radius (already-public tables / counter). Plus advisor `function_search_path_mutable` on `map_sector_value(s)`, `any_sector_agnostic`, `upsert_ii_linkedin_posts`. | `20260222000004:2-23`; `20250615100000:3-10`; advisor `[LIVE]` | — |
| **S15** | **Low** | **`ingest-events` / `normalize-events` have no admin gate** — default gateway JWT only, so any authenticated user can trigger scraping/pipeline/Slack ops. `knowledge-search` config drift (comment says `verify_jwt=false`, no config block → defaults true). | function review; `config.toml` | — |
| **S16** | **Low** | **Any authenticated user can upload arbitrary files to public buckets** `tradeagencies`, `guide-tiles`, `lead-list-covers` (only `guide-attachments` is admin-gated). Hosting-abuse/defacement. | `20260607232725` | RLS → yes |
| **S17** | **Low** | **PII in logs** — `send-email:174-178` logs `recipient_email`; `slack-notify` renders `actor_email`. Project rule says never log PII. | as cited | — |
| **S18** | **Low** | **Supabase platform hardening off** — leaked-password protection (HaveIBeenPwned) disabled; email OTP expiry > 1h; Postgres `17.4.1.041` has outstanding security patches; `pg_net`/`vector`/`pg_trgm` in `public` schema. | advisor `[LIVE]` | platform → yes |
| **S19** | **Low** | **`.env` is git-tracked** (bypassing `.gitignore`); currently only the anon key (acceptable), but structurally a future leak vector. | `git ls-files`; `.env` | — |
| **S20** | **Info** | **`community_members_public` is a `SECURITY DEFINER` view** (advisor ERROR). Intentional for PII masking (must read the admin-locked base as owner) — accept, but pin it explicitly and document; ensure it exposes only masked columns. `payment_webhook_logs` always-true INSERT policy is **not client-reachable** (SEC-02 revoked the grant; not in the anon allowlist) — low. 18 `rls_enabled_no_policy` tables are deny-all (safe) but should get explicit deny/owner policies for clarity. | advisor `[LIVE]` | — |

---

## 3. Data-exposure matrix (final state, sensitive tables)

| Table | anon read | any-auth read | Verdict |
|---|---|---|---|
| `community_members` (mentor PII) | ❌ (masked view only) | ❌ (masked view only) | **Protected** (base admin-locked `20260616031300`) |
| `investors` (447, PII) | ❌ PII cols | ✅ **PII** | **S2 — fix** |
| `agency_contacts` (PII) | ✅ **all PII** | ✅ **all PII** | **S1 — fix** |
| `profiles` (stripe id, names) | ❌ | ❌ own+admin | OK (prior broad-SELECT already remediated) |
| `user_usage` | ❌ | ❌ | OK (SELECT policy dropped SEC-02 — prior premise fixed) |
| `lead_database_records` (paid PII) | ❌ | ✅ (login = the gate, by design) | OK |
| `email_leads`/`lemlist_*`/`lead_submissions`/`mentor_contact_requests`/`intake_form_events`/`directory_submissions` | ❌ | ❌ admin-only | OK (anon INSERT capped) |
| `ingest_state` | ✅ | ✅ | **S5 — fix (RLS off)** |
| `content_founders`/`testimonials` | ✅ | ✅ | Intended public content |

The recurring root cause behind S1/S2: **the SEC lockdown addressed WRITE grants and anon READ, but left `USING(true)` SELECT policies + `authenticated` SELECT grants intact on two PII tables.** `community_members` got a proper base-table lockdown; `investors` and `agency_contacts` did not.

---

## 4. Security ticket backlog (T19–T27)

> All migrations follow `docs/migrations.md` (CLI/PR flow, human applies, not-live-until-confirmed). Because of ledger drift, every RLS ticket must **verify the fix against live advisors after apply**, not just merge the SQL.

### T19 — Close PII read-exposure on `investors` and `agency_contacts`
- **Objective:** Personal contact data (emails, phones, names, LinkedIn) is not readable by anon or by non-admin authenticated users; public surfaces use masked views only.
- **Priority:** P0. **Risk flags:** `[APPROVAL: RLS]` `[APPROVAL: MIGRATION-PROD]`.
- **Scope:** mirror the `community_members` pattern (`20260616031300`): `REVOKE SELECT` on base `investors`/`agency_contacts` from anon+authenticated; replace `USING(true)` with admin-only base SELECT; route public reads through `investors_public` and a new masked `agency_contacts_public`/`agencies_report_view` that **excludes `email`/`phone`**; audit every frontend read (`useInvestors`, agency detail hooks) to use the masked view; confirm `agencies_report_view.primary_contacts` no longer emits `email`.
- **Out of scope:** community_members (already fixed); non-PII directory tables.
- **Acceptance criteria:** anon and a non-admin authenticated user querying `investors`/`agency_contacts` get no PII columns (advisor + manual DevTools check); investor/agency directory pages still render; **post-apply advisor run shows no new exposure**.
- **Test plan:** manual PostgREST calls as anon and as a plain user; RLS policy tests; before/after `get_advisors`.
- **Dependencies:** none. Do before any traffic. Coordinate migration versioning with T1/T3/T16.

### T20 — Purge committed PII from the repo and its history
- **Objective:** No personal contact data or profiling lives in the working tree or git history; ingestion source data lives outside version control with a documented lawful basis.
- **Priority:** P0/P1. **Risk flags:** history rewrite (force-push + coordinated re-clone).
- **Scope:** `git rm` the mentor candidate CSVs (`mes_mentor_candidates*.csv`), enrichment JSON/SQL under `mentor_identification/`, `scripts/import_investors.sql`, `scripts/fix_csv.py`, `startmate_import_blocks/*` contact SQL, `data/existing_picks.csv`; extend `.gitignore` to cover these patterns; move source data to a non-committed store; purge history with `git filter-repo`/BFG; also `git rm --cached .env` (S19); document retention/lawful basis for holding scraped contact data.
- **Out of scope:** deleting the underlying business data from the DB; the VC *fund* CSV (company data, not personal).
- **Acceptance criteria:** target files absent from tree and history (`git log --all -- <path>` empty post-rewrite); `.gitignore` blocks re-add; team re-cloned; retention note in `docs/`.
- **Test plan:** history scan for personal-email regex pre/post; `.gitignore` add-attempt.
- **Dependencies:** coordinate the force-push window with all open branches (incl. this PR). No provider secret was exposed, so no key rotation is forced — but the history rewrite is mandatory to actually remove the PII.

### T21 — GDPR erasure & export (DELETE policies + account-delete/export functions)
- **Objective:** Users (and admins on their behalf) can delete and export their personal data.
- **Priority:** P1. **Risk flags:** `[APPROVAL: RLS]` `[APPROVAL: MIGRATION-PROD]`.
- **Scope:** add self+admin DELETE RLS on `user_reports`, `user_intake_forms`, `lead_submissions`, `mentor_contact_requests`; build a `delete-account` edge function (service-role cascade across user tables + auth user) and a `export-my-data` endpoint (JSON of the user's rows); define retention for `lead_submissions`/`activity_events`/`activity_events.actor_email`.
- **Out of scope:** UI polish beyond a basic settings action; anonymisation of historical analytics.
- **Acceptance criteria:** a user can delete their account and all owned rows are gone/anonymised; export returns their data; cross-user delete is denied (RLS test).
- **Test plan:** edge-function tests (cascade + authz); RLS delete tests (own vs other).
- **Dependencies:** none; pairs with T16 (DB hygiene).

### T22 — Reconcile prod RLS/RPC exposure with migrations (drift closure)
- **Objective:** Prod's actual RLS and function-execute grants match the intended locked-down state; no ungoverned public tables.
- **Priority:** P1. **Risk flags:** `[APPROVAL: RLS]` `[APPROVAL: MIGRATION-PROD]`.
- **Scope:** enable RLS + owner/deny policy on `ingest_state` (and fold it into migrations, or drop it if unused) (S5); `REVOKE EXECUTE` from anon/authenticated on the `emit_*` trigger functions and re-verify `has_role` execute grants (S7) — reconcile why SEC-03 revokes aren't reflected in prod; add explicit policies to the 18 `rls_enabled_no_policy` tables (deny-all or scoped) (S20); wire `get_advisors` (security) into the pre-launch/post-migration checklist (feeds T18).
- **Out of scope:** the full ledger re-baseline (tracked in T16).
- **Acceptance criteria:** advisor security run shows zero `rls_disabled_in_public`, and no unexpected anon-executable SECURITY DEFINER RPCs; `ingest_state` governed or gone.
- **Test plan:** `get_advisors` before/after; PostgREST probes as anon for `ingest_state` and a sample `emit_*` RPC.
- **Dependencies:** T19 (same migration window); references T16.

### T23 — PII egress hardening: Slack masking, email-relay lockdown, log redaction
- **Objective:** Customer PII does not leave the DB via Slack, logs, or an open email relay.
- **Priority:** P1. **Risk flags:** none beyond code.
- **Scope:** in `slack-notify`, mask `actor_email` (show name or hashed/truncated actor; keep the full address in the DB row only) before enabling the `intro/lead/submission` routing rows, and guard `metaLines()` against PII-shaped metadata (S8); in `send-lead-followup`, require the target lead to belong to the caller (or `requireAdmin`) + add rate limiting (S9); redact/hash emails in `send-email`/`slack-notify` logs (S17).
- **Out of scope:** the activity pipeline's overall design; retention policy (T21).
- **Acceptance criteria:** a lead submission produces a Slack message with no raw email; a non-owner cannot send a follow-up email to an arbitrary address; logs contain no plaintext emails.
- **Test plan:** trigger each producer with a fixture lead; attempt cross-user `send-lead-followup`; grep logs.
- **Dependencies:** none.

### T24 — Edge-function hardening: constant-time secrets, SSRF, rate-limiting, missing gates
- **Objective:** Close the defense-in-depth gaps across shared modules and ungated functions.
- **Priority:** P2. **Risk flags:** none beyond code.
- **Scope:** replace `===` secret checks with a constant-time compare (or adopt `embed-knowledge`'s Vault-RPC pattern) (S13); harden `_shared/url.ts` — resolve DNS and check resolved IPs, block all `127.0.0.0/8`, normalise decimal/hex/octal, handle IPv4-mapped IPv6, `fetch(redirect:'manual')` re-validation (S10); make `checkRateLimit` **fail closed**, prefer real client IP over raw `x-forwarded-for`, and add limits to `knowledge-search`/`ai-chat` (S12); add `requireAdmin`/cron-secret to `ingest-events`/`normalize-events` and make `config.toml` explicit for every function (S15); pin `SET search_path` on `get_content_for_persona`/`increment_view_count`/the 4 advisor-flagged functions and revoke anon execute where unneeded (S14).
- **Out of scope:** rewriting the rate-limit store; new providers.
- **Acceptance criteria:** secret guards constant-time; SSRF unit tests cover the listed bypasses; rate-limit DB error blocks rather than allows; ingest/normalize reject non-admin; advisor `function_search_path_mutable` count drops to zero.
- **Test plan:** unit tests per module (url guard, rate-limit fail-closed, secret compare); authz probes on ingest/normalize; advisor re-run.
- **Dependencies:** none.

### T25 — Frontend URL-safety helper + CMS iframe allowlist + query escaping
- **Objective:** No `javascript:`/unsafe-protocol navigation from DB-sourced URLs; constrain CMS embeds; defense-in-depth on related-item queries.
- **Priority:** P2. **Risk flags:** none.
- **Scope:** add a shared `safeExternalUrl(url)` (allow only `http/https/mailto/tel`) and route every `href={dbUrl}` and `window.open(dbValue)` through it, replacing ad-hoc `startsWith('http')` sites (S11); restrict the CMS sanitizer's `iframe` to a host allowlist (YouTube/Vimeo) or drop it now that YouTube uses the placeholder path (`ContentBodyRenderer.tsx:42`); apply `useMasterSearch`'s metacharacter strip to the DB-value `.or()` related-item queries (`useTradeAgencies:72`, `useInvestors:86`, `useEventBySlug:69`).
- **Out of scope:** redesigning link components; the (already-safe) markdown pipeline.
- **Acceptance criteria:** a `javascript:` URL in a scraped field renders inert; CMS iframe from a non-allowlisted host is stripped; malformed DB category/location values can't alter a filter expression.
- **Test plan:** unit tests for `safeExternalUrl`; DOMPurify iframe test; `.or()` escaping test.
- **Dependencies:** none; can bundle with T11 (directory refactor).

### T26 — Storage bucket upload lockdown
- **Objective:** Only admins can write to public asset buckets.
- **Priority:** P2. **Risk flags:** `[APPROVAL: RLS]` (storage policies).
- **Scope:** gate INSERT/UPDATE on `tradeagencies`, `guide-tiles`, `lead-list-covers` with `has_role(auth.uid(),'admin')`, mirroring `20260628210005` (guide-attachments) (S16); re-verify no anon list/enumeration remains.
- **Out of scope:** migrating existing objects; CDN config.
- **Acceptance criteria:** a non-admin authenticated user cannot upload to these buckets; admin upload still works; public fetch of existing assets unaffected.
- **Test plan:** upload attempts as plain user vs admin; advisor/storage-policy review.
- **Dependencies:** none.

### T27 — Supabase platform hardening (dashboard/config)
- **Objective:** Enable the platform-level protections the advisor flags.
- **Priority:** P2. **Risk flags:** `[APPROVAL: PLATFORM]` (Auth/DB settings, not code).
- **Scope:** enable leaked-password protection (HaveIBeenPwned); set email OTP expiry < 1h; schedule the Postgres minor-version security upgrade; move `pg_net`/`vector`/`pg_trgm` out of the `public` schema (S18); pin `community_members_public` view definition and document it as an intentional masked SECURITY DEFINER view (S20).
- **Out of scope:** major Postgres upgrade; extension functionality changes.
- **Acceptance criteria:** advisor security run clears the auth-config, extension-in-public, and vulnerable-version warnings (or they're accepted with a documented reason); OTP/password settings verified in the dashboard.
- **Test plan:** `get_advisors` before/after; manual auth-setting verification; a weak/compromised password is rejected at signup.
- **Dependencies:** upgrade needs a maintenance window.

---

## 5. Updated sequencing (security folded into the readiness roadmap)

```
P0: T1, T2, T3            (readiness) + T19, T20  (PII exposure & repo purge)
P1: T4–T9, T18-checklist  (readiness) + T21, T22, T23  (GDPR, drift closure, PII egress)
P2: T10–T17               (readiness) + T24, T25, T26, T27  (edge/frontend/storage/platform hardening)
```

## 6. Caveats

- Read-only audit at commit `9b060b4`. RLS/grant findings marked `[MIG]` are derived from migration chronology; given ledger drift, **verify each against live advisors before and after any fix** (that verification is written into the tickets).
- `[LIVE]` findings come from the prod security advisors and are current as of the run.
- Removing committed PII (T20) requires a git-history rewrite; tree deletion alone does not remove it from clones. No provider secret was found exposed, so no key rotation is forced by this audit.
- No RLS, migration, payments, or platform change was made — all security tickets are proposals behind their approval gates.
