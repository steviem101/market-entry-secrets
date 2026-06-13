# MES Platform Review — Findings (2026-06-12)

> Phase 1 read-only audit. Supabase project: `xhziwveaiuhzdoutpgrh` only (Content Studio `rcgaviwbsudouvfwzydq` untouched).
> Reviewer: Claude Code session, branch `claude/mes-platform-review-qfrnx3`.
> Method: live schema/RLS/grant introspection via Supabase MCP (SELECT/EXPLAIN only) + repo file reads + 3 parallel sub-agents (frontend, edge functions, hygiene).

## Remediation log (Phase 3, 2026-06-12 → 2026-06-13)

All fixes were applied to the live project, verified, and merged to `main`:

| Finding | Status | PR | Notes |
|---|---|---|---|
| SEC-01 tier self-upgrade | **Fixed** | #201 | `user_subscriptions` writes service-role-only; escalation verified blocked |
| SEC-03 `MES` foreign table | **Fixed** | #201 | Moved to non-API `private` schema; advisor warning cleared |
| SEC-02 broad write grants | **Fixed** | #202 | Policy-derived revoke across all tables/views; 12 frontend write paths regression-verified |
| DOC-01 stale CLAUDE.md | **Fixed** | #203 | Routes, 19 edge functions, billing model, security posture, env vars |
| PERF-01 indexes + RLS initplan | **Fixed** | #204 | `auth_rls_initplan` 73→0, unindexed FKs 10→0, dup index dropped |
| SCHEMA-03 dead tables | **Fixed (reduced)** | #205 | `Community` dropped; `market_entry_reports` ARCHIVED (held 2 real rows — audit's "0 rows" was a stale estimate); `leads` deferred (generate-report still queries it) |
| DATA-01/02 logos & websites | **Fixed (rescoped)** | #206 | Logos render client-side from website/domain (`logoUtils.ts`) — audit premise wrong. Real gap was 6 website-less VCs; 5 researched+backfilled, Mintelier has no web presence. Angels correctly have no websites (individuals) |
| SEC-07 bucket listing | **Fixed (partial)** | #207 | 4 public-bucket listing policies dropped; advisor cleared. Auth/PG items remain (dashboard-only) |
| HYG-02/04 PII CSVs + root clutter | **Fixed (non-destructive phase)** | #208 | CSVs untracked + gitignored (data verified in DB); audits → docs/audits/. History scrub pending explicit approval |
| SEC-04 funnel WITH CHECK | **Fixed** | #209 | Length caps + email shape on 6 funnels; anon INSERT verified still working, oversized rejected |
| BILL-01 Stripe lifecycle | **Closed (won't fix, by decision)** | — | Billing is one-time payments (`mode: payment`), not subscriptions — no lifecycle events exist. Refunds handled manually by choice |
| SEC-06 `has_role` anon EXECUTE | **Closed (won't fix)** | — | Revoking would break RLS policy evaluation for anon/authenticated; other SECURITY DEFINER fns are intended RPCs |

**Still open — requires the owner:**
- Dashboard-only: OTP expiry <1h, leaked-password protection, Postgres security patch upgrade (advisor still flags all three).
- Approval-gated: HYG-02 git-history scrub of the PII CSVs (`filter-repo` + force-push).
- Product decision: `leads` table retirement — generate-report's lead-list section queries the empty `leads` table; wiring it to `lead_databases` is a pipeline feature change.
- Roadmap (per Phase 2 plan): FE-01 server-side freemium gate, FE-02 types/hooks refactor, FE-03/SCHEMA-02 indexable SEO layer, AI-02 homepage-chat build, SCHEMA-01 market dimension, `mes_knowledge_base` RAG, HYG-03 always-on agents.

**New evidence found during remediation (feeds HYG-01):** the repo migration for `service_provider_contacts` creates a different schema than production (no `service_provider_id` column on fresh DBs), and several tables (`ai_chat_*`, `MES`, `ii_experiment_outputs`) exist only on production — migrations touching named objects must guard with `to_regclass`/`information_schema` checks (pattern now used in all new migrations).

## Area completion checklist

- [x] Area 1: Database schema and data model
- [x] Area 2: RLS and security posture
- [x] Area 3: Edge functions
- [x] Area 4: Data quality
- [x] Area 5: Frontend code quality
- [x] Area 6: Auth, billing, email
- [x] Area 7: AI features
- [x] Area 8: Platform hygiene and operations

## Platform snapshot (live)

- 70 base tables, 4 views (`agencies_report_view`, `community_members_public`, `investors_public`, `intake_funnel_v2`), 1 foreign table (`MES`, Notion-backed via `mes` FDW).
- 19 edge functions deployed (CLAUDE.md documents 11).
- 222 migrations applied live; 287 `.sql` files in repo (repo is a superset — see HYG-01).
- Key row counts: investors 447, community_members 145, trade_investment_agencies 134, innovation_ecosystem 124, service_providers 95, events 94, content_items 141 (all published), user_reports 45 (44 completed / 1 failed), user_intake_forms 61, user_subscriptions 21 (11 non-free), user_usage 6,358 rows / 728 sessions, ii_content 5,277, lead_database_records 325.
- Extensions: `vector` 0.8.0 (pgvector — used by II tables, embeddings present), `pg_net`, `pg_cron` (2 jobs), `pg_trgm`.

---

# CRITICAL

### [SEC-01] Authenticated users can self-upgrade their subscription tier (Stripe bypass)
- Severity: Critical
- Evidence: `pg_policies` → `user_subscriptions` UPDATE policy `Users can update their own subscription` = `USING (auth.uid() = user_id)` with `WITH CHECK = null`. `information_schema.column_privileges` → `authenticated` has UPDATE on column `tier`. Enum `subscription_tier` includes `enterprise`. No trigger guards tier changes (only `update_user_subscriptions_updated_at`).
- Impact: Any logged-in user can `PATCH /rest/v1/user_subscriptions?user_id=eq.<self>` setting `tier='enterprise'` and unlock every tier-gated report section and the Scale lead lists without paying. Direct revenue loss; the entire paywall is enforced on a client-writable column. Tier is read by `useSubscription` and gates report content client-side, but report JSON already contains the gated sections (`visible:false`), so escalation immediately reveals them.
- Recommendation: Remove `tier` (and `user_id`) from the `authenticated`/`anon` UPDATE column grant on `user_subscriptions` so only the service role (Stripe webhook) can change tier. Keep a user-updatable surface only if genuinely needed (it isn't — nothing in the app writes tier from the client). Alternatively/additionally add a `WITH CHECK` that forbids tier elevation, or revoke UPDATE entirely from anon/authenticated. Verify with the anon/authenticated/service-role matrix after change.
- Funnel risk: No (does not touch anonymous read funnel)
- Content Studio risk: No (`mes-context` reads directory tables, not `user_subscriptions`)
- Effort: S

### [SEC-02] `anon`/`authenticated` hold INSERT/UPDATE/DELETE/TRUNCATE table grants on core data tables
- Severity: Critical (defense-in-depth; currently mitigated by RLS, but fragile)
- Evidence: `information_schema.role_table_grants` → `anon` and `authenticated` have `INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER` on `service_providers`, `agency_contacts`, `user_reports`, `user_subscriptions`, `community_members`, `investors`, `lead_database_records`, and the `MES` foreign table. Today writes are blocked only because most of these tables have no permissive write policy (RLS default-deny). But `user_subscriptions` (SEC-01) shows what happens when a permissive policy exists alongside a broad grant.
- Impact: The grant surface is far wider than the RLS intent. Any future "allow users to update X" policy added without scoping columns instantly becomes exploitable (as SEC-01 already is). `TRUNCATE` to anon on a foreign table and core tables is especially inappropriate. This is the root pattern behind workstream C (over-permissive writes).
- Recommendation: Revoke `INSERT,UPDATE,DELETE,TRUNCATE,TRIGGER,REFERENCES` from `anon` and `authenticated` on all directory/content/report tables; re-grant only the specific column-scoped privileges each flow needs (the column-grant approach already used for SELECT on `investors`/`community_members` is the right model). Treat the service role as the only writer for directory/admin data.
- Funnel risk: No (SELECT grants unaffected)
- Content Studio risk: No (read paths unaffected; verify `mes-context` still SELECTs after change)
- Effort: M

### [SEC-03] Notion-backed foreign table `public.MES` is anon-readable/writable over the API
- Severity: Critical (data exposure + integrity)
- Evidence: `get_advisors(security)` → `foreign_table_in_api`: "Foreign table `public.MES` is accessible over APIs." `role_table_grants` → anon+authenticated have ALL privileges. Columns (`url, created_time, last_edited_time, archived, attrs jsonb, id`) indicate a Notion database mirror (cf. `notion-research-trigger` function). Foreign tables do **not** respect RLS.
- Impact: Anyone with the public anon key can `SELECT * FROM "MES"` over PostgREST and read the entire backing Notion dataset (internal research/ops content), and potentially write/TRUNCATE depending on FDW capability. No RLS can protect a foreign table.
- Recommendation: Move the `mes` foreign table out of the API-exposed `public` schema (e.g. into a private `fdw` schema) and revoke anon/authenticated grants. If it must stay queryable, front it with a SECURITY DEFINER function that filters/limits exposure. Confirm nothing in the app depends on client-side reads of it first (grep shows none).
- Funnel risk: No
- Content Studio risk: No
- Effort: S

---

# HIGH

### [SEC-04] Five "always-true" write policies + public-INSERT lead/PII intake tables
- Severity: High
- Evidence: `get_advisors(security)` → `rls_policy_always_true` on `directory_submissions`, `email_leads`, `intake_form_events`, `lead_submissions`, `mentor_contact_requests`, `payment_webhook_logs`, `user_usage`, `market_entry_reports` (INSERT `WITH CHECK true`). These are public submission funnels (intended), but `market_entry_reports` (legacy table, 0 rows) still has anon INSERT, and there is no rate-limit/captcha at the DB layer.
- Impact: Spam/abuse vector on public-insert tables; an unauthenticated actor can flood `user_usage`, `lead_submissions`, `mentor_contact_requests`, etc. `email_leads`/`lead_submissions` SELECT are correctly admin-only, so it's write-amplification rather than read exposure. `market_entry_reports` is a dead duplicate of `user_reports` (see SCHEMA-03).
- Recommendation: Keep public INSERT where the funnel needs it but add edge-function-mediated submission (with the existing `edge_function_rate_limits` table) or basic WITH CHECK constraints (e.g. non-empty email, length caps). Drop anon INSERT on the dead `market_entry_reports` table or remove the table. Low urgency relative to SEC-01..03.
- Funnel risk: Yes — `user_usage` INSERT is the freemium view counter; must remain anon-insertable. Propose: keep INSERT, add column/length CHECK only.
- Content Studio risk: No
- Effort: M

### [SEC-05] `generate-report` deployed with `verify_jwt=false`; `scrape-company` public
- Severity: High
- Evidence: `list_edge_functions` → `generate-report` and `scrape-company` have `verify_jwt:false`; sub-agent confirms `generate-report` does manual JWT validation inside (index.ts ~1478-1501) and `scrape-company` relies on SSRF guard + rate-limit only. `send-email`, `process-email-queue`, `apify-webhook`, `notion-research-trigger`, `stripe-webhook` are also `verify_jwt:false` by design (header-secret/signature auth).
- Impact: `generate-report` is a heavy paid pipeline (Firecrawl + Perplexity + Lovable AI). Because the gateway doesn't pre-reject, invalid/expired tokens reach the function and consume compute before the in-code check; and correctness now depends entirely on that hand-rolled check rather than the platform. `scrape-company` is callable unauthenticated (rate-limited by IP) — a cost/abuse surface.
- Recommendation: Confirm each `verify_jwt:false` function authenticates in-body (most do via `x-internal-secret`/Stripe sig). For `generate-report`, keep false only if the CORS rationale still holds and ensure the JWT+ownership check is first; for `scrape-company` confirm the rate-limit + SSRF guard are sufficient or require the internal secret. Document the intended caller for each.
- Funnel risk: No
- Content Studio risk: No
- Effort: M

### [DATA-01] Investors table: 90% missing logos, 45% missing website, contact PII present
- Severity: High (data quality blocks the investors directory + RAG readiness)
- Evidence: 447 investors: `logo` missing 403 (90%), only 44 on logo.dev; `website` missing 202 (45%); `contact_email` present on 230 rows (correctly hidden from anon via column grant + `investors_public` view). 6 rows stale >90d. Enriched in 100+ migration batches (`enrich_angel_investors_batch_*`, `enrich_vcs_batch_*`).
- Impact: The largest directory (447 rows) renders mostly without logos and nearly half without a website link — visibly thin. Good news: PII is correctly column-gated. The text fields are rich enough for embeddings but logo/website gaps hurt the directory UX and any "investor match" report section.
- Recommendation: Run a logo.dev backfill keyed on `website`/`domain` (the trade_agencies and innovation_ecosystem logo passes are the template). For the 202 missing websites, a Firecrawl/Perplexity enrichment pass (the `enrich-investors` function already exists). Pilot 5-10 first.
- Funnel risk: No
- Content Studio risk: No
- Effort: L

### [DATA-02] Logo coverage is poor across most directories
- Severity: High
- Evidence (COALESCE-cast completeness profile):
  - `trade_investment_agencies`: 132/134 missing logo (98%), 0 on logo.dev — despite migrations `add_logo_dev_support...` and Phase-3 enrichment. Descriptions are complete; `needs_re_research=0`.
  - `community_members`: 145/145 missing `image` (100%).
  - `innovation_ecosystem`: 88/124 missing logo (71%).
  - `events`: 64/94 missing logo, 14 flagged `needs_re_research`, 1 duplicate title.
  - `service_providers`: 8/95 missing logo (healthy), descriptions complete.
  - `lead_databases`: cover images complete, but all 65 flagged `needs_re_research`.
- Impact: Directory cards render without imagery across the platform — the most visible quality issue for users. The logo.dev integration appears wired but not yet populated for trade agencies.
- Recommendation: Batch logo.dev resolution from domain for trade_investment_agencies, innovation_ecosystem, community_members. Clear/triage the `needs_re_research` flags (lead_databases 65, events 14). Sample-verify 10 URLs per table before fan-out.
- Funnel risk: No
- Content Studio risk: No
- Effort: L

### [FE-01] Freemium gate is client-side only (localStorage) — trivially bypassed
- Severity: High (revenue; acceptable short-term, document the decision)
- Evidence: `src/hooks/useUsageTracking.ts` — 3-view counter in `localStorage` (`view_count`, `viewed_{type}_{id}`); writes to `user_usage` (728 sessions, 6,358 rows) but the table is write-only telemetry, not an enforcement gate. Clearing storage / incognito resets the count.
- Impact: Anonymous viewers can see unlimited gated entities. For current stage this may be an acceptable growth trade-off, but it should be a conscious decision, not an accident. Note this is distinct from SEC-01 (which leaks *paid* content to *signed-in* users and is not acceptable).
- Recommendation: Short-term: accept and document. Medium-term: enforce server-side per `session_id` (the data is already being collected in `user_usage`) via an edge function or RPC that returns gated/un-gated content. Must remain anon-compatible.
- Funnel risk: Yes — this *is* the funnel. Any change must preserve anonymous access to the first 3 views.
- Content Studio risk: No
- Effort: M

### [HYG-02] PII-bearing CSVs committed to repo root
- Severity: High
- Evidence: `australian_angel_investors_enriched.csv`, `australian_angel_investors_corrected.csv`, `australian_angel_investors_original.csv`, `Accelerators.csv` contain investor/accelerator emails, LinkedIn URLs, locations (sub-agent sampled headers). Not gitignored.
- Impact: Contact PII in version control; exposed to anyone with repo access and persists in git history even if deleted later. Privacy/GDPR exposure.
- Recommendation: Remove from the working tree, add `*.csv` (or a `data/private/` path) to `.gitignore`, and — separately, with the user's go-ahead — scrub from history (`git filter-repo`) since deletion alone leaves them in history. Confirm the data already lives in the `investors` table (it does) before removing.
- Funnel risk: No
- Content Studio risk: No
- Effort: M

### [BILL-01] Stripe webhook handles only `checkout.session.completed`
- Severity: High
- Evidence: sub-agent read of `supabase/functions/stripe-webhook/index.ts` — only `checkout.session.completed` is handled. No `customer.subscription.deleted`, `invoice.payment_failed`, `charge.failed`. Idempotency via `payment_webhook_logs.stripe_event_id` is correctly implemented (10 logged events). Signature verification correct.
- Impact: Cancellations and failed renewals never downgrade `user_subscriptions.tier`. A user who cancels or whose card fails keeps paid access indefinitely. Combined with SEC-01, subscription state is unreliable in both directions.
- Recommendation: Add handlers for `customer.subscription.deleted` (→ tier `free`), `invoice.payment_failed` (notify/grace), `charge.failed` (log). Deploy via Supabase CLI.
- Funnel risk: No
- Content Studio risk: No
- Effort: M

---

# MEDIUM

### [SCHEMA-01] No country dimension on directory tables — single-market (AU/ANZ) assumption baked in
- Severity: Medium (blocks UK/US/SG/CA rollout)
- Evidence: `service_providers`, `community_members`, `innovation_ecosystem`, `events`, `leads`, `lead_databases` key location off free-text `location` columns; only `trade_investment_agencies` has structured `country_iso2`/`location_country`/`jurisdiction`. `locations` (18 rows) are AU cities; `countries` (5 rows) is the *source*-country dimension, not a market dimension. Directory matching in `generate-report` uses `location ilike` heuristics.
- Impact: Adding a second target market (the stated roadmap) requires a country/market dimension the schema doesn't have. Cross-market filtering would rely on brittle string matching.
- Recommendation: Introduce a normalized `market`/`country_iso2` column on directory tables (follow the trade_agencies model) before rollout. Roadmap item, not an immediate fix.
- Funnel risk: No
- Content Studio risk: Yes — `mes-context` reads these tables; adding nullable columns is safe but coordinate any rename.
- Effort: L

### [SCHEMA-02] Country page SEO columns (`seo_canonical_url`, `sitemap_priority`) not present
- Severity: Medium
- Evidence: `countries` columns = (id, name, slug, description, hero_*, location_type, trade_relationship_strength, economic_indicators, key_industries, keyword arrays, featured, sort_order, timestamps). `country_page_content` = (hero_*, narrative_bullets, differentiators, pull_quote, live_snapshot, featured_city_slugs, timestamps). Neither has `seo_canonical_url` or `sitemap_priority` as the country-page spec called for.
- Impact: The country-page schema spec is partially unimplemented; SEO metadata for country pages has nowhere to live. (Note: per the SPA-not-crawlable constraint, this belongs in the deferred indexable layer — see FE-03.)
- Recommendation: Defer to the indexable-layer workstream; when built, add the SEO columns to `countries`/`country_page_content`. Document the spec gap now.
- Funnel risk: No
- Content Studio risk: No
- Effort: M

### [SCHEMA-03] Dead/duplicate tables: `market_entry_reports`, `Community`, `leads`
- Severity: Medium
- Evidence: `market_entry_reports` (0 rows, anon INSERT policy, superseded by `user_reports` which has 45 rows). `Community` (capital-C, 0 rows, RLS enabled no policy, single junk column `First Name`). `leads` (0 rows — superseded by `lead_databases`/`lead_database_records`; still has public SELECT + admin manage policies and is referenced in CLAUDE.md). `agency_resources`, `guide_attachments`, `service_provider_*`, `industry_sectors`, `testimonials`, `lemlist_*`, `ai_chat_*`, `intake_form_events`, `innovation_ecosystem_enrichment_staging` (71), `trade_agencies_enrichment_staging` (134) all 0 rows or staging.
- Impact: Schema drift and confusion; `market_entry_reports` carries a live anon-INSERT policy for a dead table (minor attack surface). Orphan `Community` table trips the RLS-no-policy advisor.
- Recommendation: Drop `Community` and (after confirming no FE references) `market_entry_reports` and `leads`. Keep staging tables. This also clears 3 of the advisor's `rls_enabled_no_policy` notices.
- Funnel risk: No
- Content Studio risk: Yes — verify `mes-context` doesn't read `leads`/`market_entry_reports` before dropping.
- Effort: S

### [PERF-01] 73 RLS policies re-evaluate `auth.uid()`/`has_role()` per-row; 10 unindexed FKs; 18 duplicate permissive policies; 54 unused indexes
- Severity: Medium
- Evidence: `get_advisors(performance)` (157 lints): 73 `auth_rls_initplan` (policies using `auth.uid()`/`has_role()` not wrapped in scalar subselect → per-row eval), 18 `multiple_permissive_policies`, 10 `unindexed_foreign_keys` (incl. `user_reports.user_id`, `user_reports.intake_form_id`, `ai_chat_messages.conversation_id`, `service_provider_*`, `intake_form_events.user_id`), 1 `duplicate_index` (`agency_contacts` has both `idx_agency_contacts_agency` and `_agency_id`), 54 `unused_index`.
- Impact: At current row counts (low-thousands) performance is fine, but the `auth_rls_initplan` pattern degrades at scale and the unindexed FKs will hurt report-dashboard queries (`user_reports` by user). Duplicate/unused indexes waste write throughput and storage.
- Recommendation: Wrap policy calls as `(SELECT auth.uid())` / `(SELECT has_role(...))` to hoist them out of per-row eval; add indexes on the 10 FKs; drop the duplicate `agency_contacts` index and the clearly-unused ones. Batchable as one "DB performance" session.
- Funnel risk: No (SELECT semantics unchanged)
- Content Studio risk: No
- Effort: M

### [AI-01] AI model strings hardcoded and duplicated across functions
- Severity: Medium
- Evidence: `google/gemini-3-flash-preview` in 4 files (`generate-report` x2, `enrich-content`, `scrape-company`); Perplexity `sonar`/`sonar-pro` split inconsistently within `generate-report`; `claude-haiku-4-5-20251001` in `classify-personas`; `claude-sonnet-4-20250514` in `generate-plan`; Anthropic version header `2023-06-01` in two functions.
- Impact: Model upgrades require edits in many files; easy to miss one. No central pin.
- Recommendation: Extract to `_shared/models.ts` constants. Note `claude-sonnet-4-20250514` is an older Sonnet pin — consider refreshing to a current model when convenient.
- Funnel risk: No
- Content Studio risk: No
- Effort: S

### [AI-02] `ai-chat` is a placeholder; homepage-chat design is unbuilt
- Severity: Medium (feature gap, not a defect)
- Evidence: `ai-chat/index.ts` returns a hardcoded "under development" string; no `functions.invoke('ai-chat')` in `src/`; `useAIChat.ts` has `// TODO: integrate your custom GPT`. Tables `ai_chat_conversations`/`ai_chat_messages` exist (0 rows) with correct anonymous session-scoped RLS via `current_chat_session_id()` (workstream B remediation is in place). The designed single `homepage-chat` function (9 tools, cookie-UUID sessions) does not exist.
- Impact: Chat is design-only. The DB scaffolding and session-scoping security are ready; the function and tools are not.
- Recommendation: Roadmap item — build `homepage-chat` per design, or remove the `ai-chat` placeholder to avoid confusion. The RLS groundwork is already correct.
- Funnel risk: No
- Content Studio risk: No
- Effort: L (build) / S (remove placeholder)

### [DOC-01] CLAUDE.md is stale: routes, edge functions, schema, env vars
- Severity: Medium
- Evidence: Edge functions documented 11 vs 19 live (missing `classify-personas`, `enrich-investors`, `generate-plan`, `process-email-queue`, `scrape-company`, `send-email`, `apify-webhook`, `notion-research-trigger`). Routes: `/community`→`/mentors`, `/trade-investment-agencies`→`/government-support`, `/investors` undocumented. Schema section omits ~20 live tables (`investors`, `country_*`, `linkedin_industries`, `agency_contacts`, `lead_database*`, `email_*`, `ii_*`, etc.). Env vars `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `EMAIL_INTERNAL_SECRET` undocumented. Section 10 claims `user_reports` has a "shared reports" SELECT policy — actually sharing is via the `get_shared_report` SECURITY DEFINER RPC, not a policy.
- Impact: The preprocessor file that's auto-loaded before every task misdescribes the platform — every future agent starts with wrong assumptions.
- Recommendation: Refresh CLAUDE.md sections 3, 4, 5, 11 against live state. Good candidate for an always-on "doc drift" agent (see HYG-03).
- Funnel risk: No
- Content Studio risk: No
- Effort: M

### [FE-02] `(supabase as any)` casts + duplicated fetch hooks (~60 hooks)
- Severity: Medium
- Evidence: 48+ `(supabase as any).from(...)` casts; near-duplicate hooks (`useSectorLeads`/`useCountryLeads`, `useCountry/Sector/LocationServiceProviders`) repeating `.ilike`/`.or()` array-overlap logic; 471 src files / ~54.6k lines.
- Impact: Type-unsafe table/column strings (a rename breaks silently — contradicts the schema-discovery principle); a schema change touches dozens of hooks. `useMasterSearch` sanitizes `.or()` input by blacklist (fragile but currently effective).
- Recommendation: Regenerate types (`supabase gen types`) and remove `as any` where possible; extract a generic `useFilteredTable()` for the location/sector/country families. Prefer an RPC for master search to avoid client-built filter strings.
- Funnel risk: No
- Content Studio risk: No
- Effort: L

### [FE-03] Half-built SEO inside the non-crawlable SPA
- Severity: Medium
- Evidence: `public/sitemap.xml` (200+ routes) + `robots.txt` + `react-helmet` `SEOHead` present, but no SSR/prerender and no JSON-LD. Dynamic routes (`/countries/:slug`, `/mentors/:slug`) aren't crawlable.
- Impact: SEO effort that can't pay off while the Lovable SPA isn't server-rendered — belongs in the deferred indexable-layer v2, per the stated constraint.
- Recommendation: Don't invest further in in-SPA SEO. Park sitemap/helmet work and move SEO into the planned indexable layer (with SCHEMA-02's columns). Flag, don't fix.
- Funnel risk: No
- Content Studio risk: No
- Effort: M (roadmap)

### [BILL-02] Legacy tier enum values + client-hardcoded pricing
- Severity: Medium
- Evidence: `subscription_tier` enum = `free, premium, concierge, growth, scale, enterprise` — `premium`/`concierge` are legacy, mapped in `useSubscription.mapDatabaseTier()`. Pricing strings ("$15,000–$50,000", "$99", "$45K") hardcoded in `PricingSection.tsx`, `HeroProductMockup.tsx`, `personaContent.ts`; brand stats ("120+ Vetted Service Providers", "200+ Expert Mentors") hardcoded and now inaccurate vs live counts (95 SPs, 145 mentors).
- Impact: Pricing/stat changes need code deploys; stat claims drift from reality.
- Recommendation: Keep enum (harmless) but document the legacy mapping. Move pricing + headline stats to a config/`brand_metrics` table fetched at load.
- Funnel risk: No
- Content Studio risk: No
- Effort: M

---

# LOW

### [SEC-06] SECURITY DEFINER functions executable by anon, and `has_role` exposed via RPC
- Severity: Low
- Evidence: advisor `anon_security_definer_function_executable` / `authenticated_..._executable` → `get_shared_report` (anon — intended, public report sharing), `has_role` (anon+authenticated — callable via `/rpc/has_role`), `get_tier_gated_report` (authenticated), `increment_download_count` (authenticated). All are `SECURITY DEFINER`.
- Impact: `get_shared_report` anon-exec is intended (shared report links) and is the *correct* pattern replacing a broad RLS policy. `has_role` being anon-callable lets a caller probe role membership of arbitrary UUIDs — low risk (needs a valid user_id) but unnecessary.
- Recommendation: Revoke EXECUTE on `has_role` from anon (it's used inside policies as definer, not meant for direct RPC). Leave `get_shared_report`/`get_tier_gated_report` as-is. 
- Funnel risk: No
- Content Studio risk: No
- Effort: S

### [SEC-07] Public storage buckets allow listing; auth hardening items
- Severity: Low
- Evidence: advisor → 5 public buckets (`tradeagencies`, `events`, `guide-attachments`, `lead-list-covers`, `guide-tiles`); 4 have broad SELECT policies allowing object *listing* (not just fetch). Also: OTP expiry >1h, leaked-password protection disabled, Postgres 17.4.1.041 has security patches available, `pg_net`/`vector`/`pg_trgm` in `public` schema.
- Impact: Bucket listing can enumerate all stored files (e.g. lead-list cover images, guide attachments) — minor info leak, no PII expected in these buckets. Auth settings are below recommended hardening.
- Recommendation: Restrict bucket SELECT policies to object-fetch (drop list), or accept for public assets. Enable leaked-password protection, shorten OTP expiry, schedule the Postgres patch upgrade.
- Funnel risk: No
- Content Studio risk: No
- Effort: S

### [HYG-01] Migration repo is a superset of live; ~273 repo files not in live `schema_migrations`
- Severity: Low
- Evidence: 287 repo `.sql` files (286 timestamped + `combined_all_case_study_rewrites.sql`), but live `schema_migrations` has 222 versions; timestamps differ by seconds between repo filenames and live versions (e.g. repo `20250612062940` vs live `20250612062934`) — Lovable rewrites timestamps on apply, so direct version matching fails. Net: repo and live are *not* reconciled by version string, though content likely matches.
- Impact: Can't cleanly verify drift by version; a fresh `supabase db push` would mismatch. Mostly cosmetic given Lovable manages apply, but it defeats CLI-based drift detection.
- Recommendation: Treat live schema (introspected) as source of truth; don't rely on filename==version. Move `combined_all_case_study_rewrites.sql` to `scripts/`. Consider `supabase db pull` to reconcile if CLI workflows are reintroduced.
- Funnel risk: No
- Content Studio risk: No
- Effort: S

### [HYG-03] Signals worth automating (always-on agents)
- Severity: Low (informational)
- Evidence: across areas — `needs_re_research` flags (lead_databases 65, events 14) accumulate silently; logo-null rates per table; CLAUDE.md doc drift; new undocumented env vars; migration/version reconciliation; subscription tier integrity.
- Impact: These are exactly the recurring checks the planned schema-drift and data-quality agents should own.
- Recommendation: Schema-drift monitor → diff introspected schema vs CLAUDE.md + alert on new tables/columns/functions. Data-quality digest → weekly per-table null/logo/`needs_re_research`/duplicate profile (the COALESCE-cast query in this audit is a ready template). Security canary → assert `tier` is not client-writable and no foreign table is anon-readable (would have caught SEC-01/03).
- Funnel risk: No
- Content Studio risk: No
- Effort: M

### [DATA-03] UK case-study skeletons are populated, not thin
- Severity: Low (status correction)
- Evidence: 22-23 UK-origin case studies (e.g. "How Revolut/Wise/Darktrace Entered the ANZ Market", plus 3 "Struggled" studies). Initial char count read 0 from `body_markdown`, but COALESCE to `body_text` shows avg 3,536 chars and **0** thin (<2k). Content is in `content_bodies.body_text`, not `body_markdown`.
- Impact: The "20 UK skeletons still thin → update not insert" assumption is **outdated** — they're already filled (and `content_bodies` joins via `section_id`, matching the known quirk; body lives in `body_text`). Any update path should target existing rows by `content_id` and write `body_text`.
- Recommendation: Treat UK case studies as populated; if a rewrite is wanted it's an UPDATE of `content_bodies.body_text`/`body_markdown` keyed on existing `content_id`. No insert needed.
- Funnel risk: No
- Content Studio risk: No
- Effort: S

### [DATA-04] `user_reports` feedback is uniformly -1 (feature unused or broken)
- Severity: Low
- Evidence: 45 reports, all `feedback_score` distinct values = `[-1]`; avg -1.0. 3 reports have share tokens. Last report 2026-06-07.
- Impact: Either nobody uses the thumbs feedback or it's defaulting to -1 — no signal for report quality.
- Recommendation: Verify the feedback writer (`Users can update own report feedback` policy exists); if -1 is a sentinel default, exclude it from analytics; if it's a bug, fix the writer.
- Funnel risk: No
- Content Studio risk: No
- Effort: S

### [HYG-04] Root-directory clutter (audit .md files, CSVs, data dirs)
- Severity: Low
- Evidence: ~7 `AUDIT-*/RENOVATION/SECURITY_AUDIT.md`, 6 CSVs, dirs `daily-backlogs/ mentor_identification/ design_handoff_ireland_country_page/ reports/ data/ docs/ scripts/` in root.
- Impact: Hard to tell source-of-truth from historical analysis; CSVs overlap with HYG-02 PII concern.
- Recommendation: Move audits to `docs/audits/`, data to `data/private/` (gitignored), keep README/CLAUDE.md/PLAN.md in root.
- Funnel risk: No
- Content Studio risk: No
- Effort: M

### [EF-01] Edge-function code duplication + functions with no frontend callers
- Severity: Low
- Evidence: Firecrawl helpers (`firecrawlMap`/`firecrawlScrape`, SSRF guard) duplicated between `generate-report` and `scrape-company`; `classify-personas`, `generate-plan`, `process-email-queue`, `sync-lemlist` have no `src/` callers (admin/cron/manual by design). Healthy patterns confirmed: Stripe idempotency, SSRF guards, PII obfuscation in report JSON (Lemlist contacts reduced to first-name+initial — workstream D mitigation present), CORS allowlist, input sanitization before `.or()`.
- Impact: Maintenance duplication; unclear which functions are background vs client.
- Recommendation: Move shared Firecrawl/SSRF/sanitize helpers to `_shared/`; add a functions manifest noting intended caller (frontend/admin/cron/webhook).
- Funnel risk: No
- Content Studio risk: No
- Effort: S

---

## Notes on the cross-project (`mes-context`) dependency
- `mes-context` (on Content Studio) reads MES directory tables via the anon key. The anon **SELECT** grants on directory tables (`service_providers`, `community_members` via `community_members_public`, `investors` via `investors_public`, `trade_investment_agencies`, `events`, `innovation_ecosystem`, content tables) are intact and were **not** the subject of any recommended change. SEC-01/02/03 touch *write* grants and `user_subscriptions`/`MES` foreign table — none of which `mes-context` should read. Any RLS/grant fix in Phase 3 must still be run through the anon/authenticated/service-role matrix and the Content Studio canary (`generate-content`) before sign-off.

## Funnel-critical tables (must retain anon SELECT/INSERT)
- Anon SELECT: all directory + taxonomy + content tables, `*_public` views, `testimonials`, `lead_databases`.
- Anon INSERT: `user_usage` (view counter), `lead_submissions`, `directory_submissions`, `mentor_contact_requests`, `email_leads`, `intake_form_events`.
