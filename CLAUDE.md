# CLAUDE.md — Market Entry Secrets

> Root context file for Claude Code — auto-loaded every session.
> **Last reviewed: 2026-07-11 (country pages v2** — prior full review 2026-07-07 MES-115, gap report: [`docs/audits/mes-115-claude-md-gap-report.md`](docs/audits/mes-115-claude-md-gap-report.md)**).**
> Maintenance: this file owns **orientation, invariants, and pointers** only. Deep procedures live
> in [`.claude/skills/`](.claude/skills/README.md); evidence and audit artefacts live in [`docs/`](docs/).
> Keep it ≤400 lines, verify every claim against the repo before editing, and update the date above.
> Where a skill contradicts this file, trust the skill and log the drift in
> [`.claude/skills/CHANGELOG.md`](.claude/skills/CHANGELOG.md).

## 0. Skills library — read first (MES-113)

[`.claude/skills/README.md`](.claude/skills/README.md) indexes **22 reviewed, evidence-cited
operating skills**, all live on main. Read `mes-codebase-conventions` before any repo work, then
the skill matching your task (RLS/migrations, secrets, tier gating, Stripe, reports, edge
functions, enrichment, SEO, Slack/ops, admin/moderation, MCP, Crisp/support, QA/exam, ticket
workflow, research/content). Skills own their topics — this file deliberately does not restate them.

## 1. Product

**Market Entry Secrets (MES)** — https://marketentrysecrets.com — is a B2B SaaS directory and AI
market-intelligence platform helping companies enter the Australian/ANZ market.

- **Pillars:** service providers, mentors (anonymised profiles), events, lead databases, investors,
  innovation ecosystem, trade/government agencies, content & case studies, and AI-generated
  market-entry reports (`/report-creator`).
- **Two personas** drive homepage and directory framing: `international_entrant` and
  `local_startup` (`src/contexts/PersonaContext.tsx`, persisted in localStorage).
- **Users:** anonymous visitors (freemium-gated, 3 free views), free members, paid members
  (growth/scale/enterprise, one-time payments), and admins (`/admin/*`).
- **Supabase project:** `xhziwveaiuhzdoutpgrh` (MES Platform) — the only project in scope.
- **Out of scope:** Content Studio / Content Creator (`rcgaviwbsudouvfwzydq`). `kb-sync` READS it
  via a restricted view + anon key; never write to or migrate against it from this repo.

## 2. Stack & deployment

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript, Tailwind CSS + shadcn/ui, React Query, react-router-dom, react-helmet-async |
| Backend | Supabase (Postgres, Auth, Edge Functions, Storage) via Lovable Cloud |
| Edge runtime | Deno with `esm.sh` imports (not npm) |
| Payments | Stripe — **one-time checkout only**, no recurring subscriptions |
| AI / research | Lovable AI Gateway → Gemini (`google/gemini-3-flash-preview`); Anthropic (plans, persona/event classification, report-quality loop); Perplexity (sonar/sonar-pro research); OpenAI (`text-embedding-3-small` embeddings) |
| Scraping / data | Firecrawl (map/scrape/search), Apify (events ingest), Lemlist (CRM sync) |
| Email / support | Resend (code-rendered templates in `_shared/email/`), Crisp chat widget (loaded in `index.html`, anonymous by design) |
| Ops | Slack (report-quality + events digests), Notion (MES Tickets) |
| Logos | logo.dev URLs via `src/lib/logoUtils.ts` |

**Deployment model:**
- Lovable publishes the frontend; the repo is two-way synced with the Lovable project (previews on
  `*.lovable.app`). `src/integrations/supabase/client.ts` and `types.ts` are generated — never hand-edit.
- **Merging to main auto-applies migrations** to prod (Supabase GitHub integration). See §10.
- **Edge functions are NOT auto-deployed by the Supabase integration.** A GitHub Action
  (`.github/workflows/deploy-edge-functions.yml`) deploys `generate-report`, `scrape-company`,
  `sitemap`, `generate-plan`, `admin-mentor-anonymity` (+ on `_shared/` changes) on push to main;
  all other functions are deployed manually via `supabase functions deploy <name>`.
- `supabase/config.toml` is the version-controlled source of truth for auth config (site_url,
  redirect allowlist, OTP expiry — MES-33) and per-function `verify_jwt`. The hosted dashboard is
  not auto-synced — keep them in lockstep.

## 3. Repo layout

| Path | Contents |
|------|----------|
| `src/pages/` + `src/App.tsx` | All routes (lazy-loaded except `Index`/`NotFound`); `<Layout>` mounted once globally |
| `src/components/` | Feature components; `common/` (DirectoryFilterBar, SEOHead…), `report/`, `report-creator/` (v1 + `v2/`), `hero/`, `ui/` (shadcn) |
| `src/hooks/`, `src/contexts/` | Domain hooks (`useEvents`, `useSubscription`…), Auth/Persona contexts |
| `src/lib/` | Pure logic modules with colocated `*.test.ts` (filters, featureFlags, logoUtils); `src/lib/api/reportApi.ts`; `src/lib/mcp/` (MCP tool sources) |
| `src/integrations/supabase/` | Generated client + types — do not edit |
| `supabase/functions/` | 30 edge functions + `_shared/` (§6) |
| `supabase/migrations/` | Active ledger, re-baselined 2026-07-04; `migrations_archive/` + `rollback/` are reference only |
| `docs/` | Audits (`docs/audits/`), runbooks, `migrations.md`, `mes-knowledge-base-rag.md`, `prelaunch-audit.md`, redesign handoffs |
| `.claude/skills/` | The skills library (§0) |
| `scripts/` | One-off data import/enrichment scripts (Python/SQL/TS) — historical, not part of the build |
| `daily-backlogs/`, `reports/`, `data/`, `mentor_identification/`, `design_handoff_ireland_country_page/` | Root-level working artefacts (backlogs, exports, handoff drafts) — historical, not part of the build |

## 4. Routes (`src/App.tsx` — the single routing file)

| Route(s) | Purpose |
|----------|---------|
| `/` | Landing page (persona-aware hero, search, pricing, testimonials) |
| `/report-creator` → `/report/:reportId`, `/my-reports`, `/report/shared/:shareToken` | AI report intake (v2 default — §7), report view (tier-gated), dashboard, public share |
| `/service-providers[/:slug]`, `/mentors[/:categorySlug[/:mentorSlug]]`, `/events[/:slug]`, `/leads[/:slug]`, `/investors[/:slug]`, `/innovation-ecosystem[/:slug]`, `/government-support[/:slug]`, `/case-studies[/:slug]`, `/content[/:slug]` | Directories + detail pages (Hero → `DirectoryFilterBar` → results; `ListingPageGate` freemium gate) |
| `/locations[/:slug]`, `/countries[/:slug]`, `/sectors[/:slug]` | Taxonomy landing pages |
| `/pricing` | Tiers + Stripe checkout |
| `/dashboard`, `/member-hub`, `/bookmarks`, `/mentor-connections` | Member area (`/dashboard` aliases MemberHub) |
| `/admin/submissions`, `/admin/mentors` | Admin: submission queues; mentor anonymity management |
| `/auth/callback`, `/reset-password` | Auth flows |
| `/about`, `/faq`, `/market-entry-questions`, `/contact`, `/privacy`, `/terms`, `/partner` | Static/info pages |
| Redirects | `/community`→`/mentors`, `/trade-investment-agencies`→`/government-support`, `/planner`→`/report-creator` |

## 5. Data

> **Curated subset — NOT exhaustive (~80 live tables).** Introspect (`information_schema` /
> `list_tables`) before interacting with any table. PII-safe public views:
> `community_members_public`, `investors_public`, `agencies_report_view`.

- **Directories (public read):** `service_providers`, `community_members` (mentors — PII behind
  the public view; anonymity managed via `/admin/mentors`), `events`, `leads`,
  `lead_databases`/`lead_database_records`, `investors`, `innovation_ecosystem`,
  `trade_investment_agencies`, `case_studies` (`country_trade_organizations` was dropped
  2026-05-09 — trade orgs live in `trade_investment_agencies`).
- **Taxonomy:** `locations`, `countries`, `industry_sectors` (each with `keywords[]` arrays used
  for matching), plus the **canonical sector reference layer** (MES-110, migrations
  `20260707141000`/`20260707190000`) standardising sector tags across tables.
- **Content:** `content_items` → `content_sections` → `content_bodies`; `content_categories`,
  `content_company_profiles`, `content_founders`; country-page blocks (`country_page_content`,
  `country_trade_metrics`, `country_case_studies`, `country_playbook_stages`,
  `country_funding_instruments`, `country_faqs`) plus `country_entity_links` (curated corridor
  links: mentors/agencies/providers/investors/events per country, approved-only public reads;
  the page loads via the `get_country_page(slug)` RPC, the listing via `get_country_directory()`).
- **Users/auth:** `profiles` (id = auth.users.id, stripe_customer_id, onboarding columns),
  `user_roles` (`admin`|`moderator`|`user`), `user_subscriptions` (tier; **service-role-write
  only** — SEC-01), `bookmarks`, `user_usage` (freemium counter), `mentor_contact_requests`.
- **Reports:** `user_intake_forms`, `user_reports` (report_json, share_token, tier_at_generation),
  `report_templates` (prompt per section, `visibility_tier`), `report_quality` (telemetry),
  `report_quality_proposals` + `automation_runs` (quality loop), `intake_form_events` (funnel).
  Note: `user_intake_forms`/`user_reports` **are now in the generated types**; the historical
  `(supabase as any)` cast persists in `src/lib/api/reportApi.ts` — match local style, don't churn.
- **Leads/CRM (admin-only SELECT):** `email_leads`, `lead_submissions`, `directory_submissions`
  (public INSERT funnels), `lemlist_contacts`, `lemlist_companies`, `agency_contacts` (PII).
- **RAG layer:** `mes_knowledge_base` (pgvector 1536, hybrid search) + `knowledge_embed_log` —
  a derived, rebuildable index over customer-facing entities, kept fresh by triggers + the
  `embed-knowledge` cron. Read path is the `match_knowledge()` RPC only (no anon grants).
  Deep doc: [`docs/mes-knowledge-base-rag.md`](docs/mes-knowledge-base-rag.md).
- **Other:** `payment_webhook_logs`, `ai_chat_*` (chat is a placeholder), `testimonials`,
  `linkedin_industries`/`legacy_industry_mapping`, `ii_*` (Irish Insights pipeline — separate
  workstream), `activity_event_routing` (Slack routing/self-gating for loops).

## 6. Edge functions (`supabase/functions/`, 30 total)

Shared modules: `_shared/http.ts` (`buildCorsHeaders` — allowlist is hardcoded + `FRONTEND_URL`;
there is **no** `ALLOWED_ORIGINS` secret), `_shared/log.ts`, `_shared/auth.ts` (`requireAdmin`),
`_shared/email/` (code-rendered transactional email). `verify_jwt` per function is set in
`supabase/config.toml`; functions with `verify_jwt = false` authenticate in-code. Conventions +
cost caps: skill `edge-functions-and-cost-controls`; structured logging / correlation IDs / per-run
cost attribution: skill `observability-logging-and-cost-attribution`.

**Cron-driven functions** (invoked by pg_cron via pg_net — **schedules live in the DB, unverified
from the repo**): `embed-knowledge` (~2 min per its header), `kb-sync` (incremental),
`process-email-queue`, `report-quality-loop`, `report-quality-rollup` (weekly),
`stripe-webhook-reconcile` (every 15 min — migration `20260710200000`).

| Function | Purpose (auth if not JWT) |
|----------|--------------------------|
| `generate-report` | The whole report pipeline (§7) — in-code JWT + ownership, rate-limited |
| `scrape-company` | Intake step-1 website prefill — SSRF-guarded + IP rate limit, no JWT |
| `create-checkout` / `stripe-webhook` | Stripe one-time checkout / webhook (`checkout.session.completed` only; signature-verified; received/processed state in `payment_webhook_logs` — MES-39) |
| `stripe-webhook-reconcile` | Cron (every 15 min): replays unprocessed `payment_webhook_logs` rows + Slack-alerts stuck ones (`x-internal-secret` = `STRIPE_RECONCILE_SECRET`, Vault `stripe_reconcile_secret`) |
| `sitemap` | Public DB-driven sitemap index (MES-79) — anon-key reads so RLS decides visibility; referenced from `public/robots.txt` |
| `embed-knowledge` | Cron (every 2 min): embeds stale `mes_knowledge_base` rows via OpenAI (`x-internal-secret` from Vault) |
| `knowledge-search` | Hybrid RAG search for agents/MCP → `match_knowledge()`; anonymous callers get `public` visibility only |
| `kb-sync` | Cron: pulls qualifying LinkedIn posts from Content Creator into the KB (`x-internal-secret` = `KB_SYNC_SECRET`) |
| `mcp` | MCP server for external agents — **auto-generated** from `src/lib/mcp/` by `@lovable.dev/mcp-js`; edit the sources, not the bundle |
| `ingest-events` / `normalize-events` | Apify events ingest (`x-webhook-secret` = `EVENTS_WEBHOOK_SECRET`) → Claude Haiku sector/type classifier (service-role internal) |
| `report-quality-loop` / `report-quality-rollup` / `rq-slack-actions` | Propose-only quality review loop + weekly rollup to Slack `#report-quality` (`x-webhook-secret`); Accept/Reject buttons (Slack signing) — never ships code |
| `slack-notify` | Generic Slack dispatch, invoked by the `dispatch_activity_event()` DB trigger (`x-webhook-secret`) |
| `send-email` / `process-email-queue` / `send-lead-followup` / `email-assets` | Resend transactional email (`x-internal-secret` or JWT), cron queue drain, follow-ups, public image host |
| `generate-plan` | AI market-entry plan (Anthropic only) |
| `enrich-content` / `enrich-innovation-ecosystem` / `enrich-investors` / `firecrawl-map` / `firecrawl-scrape` / `firecrawl-search` | Admin enrichment + Firecrawl wrappers |
| `classify-personas` / `sync-lemlist` / `admin-mentor-anonymity` | Admin: persona classification, Lemlist CRM sync, mentor anonymity toggle |
| `ai-chat` | **Placeholder** — returns a stub (`is_placeholder: true`) |

## 7. AI report pipeline

Owned in depth by skill `report-generation-quality` — read it before touching anything here.
Summary of the verified shape (it differs from older docs):

- **Intake:** `/report-creator` runs the **v2 flow by default** (`report_creator_v2` feature flag,
  `?v2=0` reverts to the legacy 3-step wizard). Guest drafts persist to localStorage; auth is
  required before generation. `scrape-company` prefills from the company website.
- **One function does the work:** `generate-report` (in-code JWT + intake ownership, 5 reports/
  60min/user, row pre-created as `processing`, runs in `EdgeRuntime.waitUntil`). There are no
  separate `enrich-intake`/`search-matches` functions.
- **Phase 1 is one big `Promise.all`:** Firecrawl company scrape, 6 parallel Perplexity queries,
  directory matching across Supabase tables (array-overlap `.cs.{}` + `ilike`), competitor and
  end-buyer research. Key metrics are regex-extracted from the landscape answer (not a separate call).
- **Sections generate in a single parallel batch** via Lovable AI Gateway
  (`google/gemini-3-flash-preview`); then save (`status:"completed"`) → best-effort polish pass.
  Per-section failures store `{content:"", visible:false}` — a "completed" report can silently
  miss sections.
- **Sections (10):** `executive_summary`, `swot_analysis`*, `competitor_landscape`*,
  `service_providers`, `mentor_recommendations`*, `investor_recommendations`*, `events_resources`,
  `action_plan`, `setup_compliance`, `lead_list`** — (*growth, **scale, rest free).
- **Tier gating is server-side.** Section/tier truth lives in **four** places that must change
  together: `reportSectionConfig.ts` (`SECTION_ORDER`+`TIER_REQUIREMENTS`), `report_templates`,
  the quality-loop `rubric.ts`, and the `get_tier_gated_report` RPC's hardcoded
  `v_tier_requirements` — the RPC is the security-critical strip point; miss it and paid prose
  ships to free/anon users. Public sharing goes through the `get_shared_report(share_token)` RPC.
- **Grounding invariant:** never invent providers, mentors, investors, events, or figures — every
  recommendation must trace to a directory row; every number needs a source.

## 8. Auth & subscriptions

- `AuthProvider` (`src/contexts/AuthContext.tsx`) → `useAuth()` (email/OAuth sign-in, reset,
  roles via `hasRole()`/`isAdmin()`). On `auth.users` INSERT, triggers create the `profiles` row +
  `'user'` role and a `'free'` `user_subscriptions` row.
- Auth redirect URLs and OTP expiry are pinned in `supabase/config.toml` (MES-33) — must point at
  the customer domain, never a Lovable preview.
- **Tiers:** `free` → `growth` → `scale` → `enterprise` (`TIER_HIERARCHY`); legacy DB values
  `premium`→growth, `concierge`→enterprise (`useSubscription.ts`). Tier matrix + enforcement
  points: skill `freemium-tier-gating`.
- **Billing is one-time payments, not subscriptions** (`create-checkout` uses `mode: "payment"`):
  no Stripe Subscription objects, renewals, or `invoice.*` events; the webhook handles only
  `checkout.session.completed` and upserts `user_subscriptions`. Refunds don't auto-revoke.
  The frontend polls after the Stripe redirect (webhook may lag) — skills
  `stripe-payments-and-webhooks`, `post-payment-activation-and-entitlements-ux`.
- **Freemium:** anonymous users get 3 free directory views (localStorage + `user_usage`,
  `ListingPageGate`/`FreemiumGate` + `PaywallModal`); signed-in users bypass. Country pages
  (`/countries/*`) are deliberately ungated — they are the top-of-funnel SEO surface; gating
  applies to depth actions only. Lead-gen popup after 15s for anonymous users.

## 9. Security invariants

Owned by `supabase-rls-and-migrations` + `secrets-and-env-management`; non-negotiables:

- **RLS everywhere; writes are service-role-only by default** (SEC-01/02/03 grant lockdown).
  Client-writable exceptions: public submission funnels (`directory_submissions`, `email_leads`,
  `lead_submissions`, `mentor_contact_requests`, `intake_form_events`, `user_usage`),
  session-scoped `ai_chat_*`, and owner/admin tables backed by an RLS policy. When adding a
  table, scope client grants deliberately — Supabase's default grant is broad.
- `user_subscriptions.tier` is service-role-write only (closed a paywall self-upgrade bypass).
- **No service-role keys or secrets client-side, ever.** The anon key in `client.ts` is public by
  design. **No `VITE_*` env vars** — Lovable doesn't support them (root `.env` is dead scaffold;
  don't consume it). Feature flags use URL query + localStorage (`src/lib/featureFlags.ts`).
- Secrets live in Supabase edge secrets / Vault — names only in docs (§12), values never in git.
- Admin checks: `has_role(auth.uid(), 'admin'::app_role)` in RLS; `requireAdmin(req)` in functions.
- Never log PII (emails, tokens); foreign tables (Notion `MES`) stay in the non-API `private` schema.
- `create-checkout` validates redirect URLs against an allowlist (open-redirect guard).

## 10. Migrations (the ledger is fragile — `docs/migrations.md`)

1. **Schema reaches prod ONLY via the PR flow** (merge to main auto-applies). No dashboard SQL,
   no ad-hoc `psql`, and agents must **not** MCP-`apply_migration` against prod.
2. Name files `<timestamp>_snake_name.sql` — the CLI **silently skips** anything else.
3. **Never rename/renumber an applied migration**; fix collisions before first apply or add a new one.
4. History re-baselined 2026-07-04 (PR #263): active dir starts at `20260704095538_remote_baseline.sql`;
   `migrations_archive/` is reference only. New timestamps must be after the baseline. Check the
   Supabase integration check is green on the PR before assuming a migration is live.
5. Data-seed migrations must be idempotent and self-sufficient — preview branches replay the whole
   ledger against an empty DB.
6. Prefer additive, reversible changes; destructive migrations are approval-gated (§11).

## 11. Workflow rules (tickets, branches, PRs)

Owned by skill `mes-ticket-workflow`; the invariants:

- **Gate stages:** Audit (read-only inspection) → Plan → Implement. For anything touching
  **RLS/policies/grants, destructive migrations, payments/subscriptions/entitlements, secrets, or
  broad data writes: stop after the plan and get approval** before writing code.
- **Branch:** `mes-<ticket-id>-<short-slug>`. If a harness assigns a different branch, follow the
  harness and note the mapping in the ticket.
- **PR:** reference the ticket — `Closes MES-<id>` when it completes the ticket, `Refs MES-<id>`
  for interim PRs. Never merge your own PR / never merge without review. No PR template exists.
- **Update the Notion MES Tickets ticket** after meaningful progress: branch, PR link, status
  (Idea → Scoped → Prompt Ready → In Progress → In Review → Merged → Deployed → Archived),
  summary, caveats, follow-ups.
- **Verify before shipping:** `npm test` (Node's built-in runner over `src/**/*.test.ts` +
  `supabase/functions/**/*.test.ts` — no vitest/jest/DOM tests; put logic in pure modules),
  `npx tsc -p tsconfig.app.json --noEmit`, `npm run build`. `npm run lint` has known pre-existing
  errors (MES-111 AUD-051) — the bar is *no new lint errors* in files you touched.

## 12. Environment secrets (names + purpose only — never values)

`SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` are auto-provided to functions.

| Secret | Used by |
|--------|---------|
| `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_GROWTH_PRICE_ID`, `STRIPE_SCALE_PRICE_ID` | Checkout + webhook |
| `STRIPE_RECONCILE_SECRET` (also in Vault as `stripe_reconcile_secret` for the cron; falls back to `EMAIL_INTERNAL_SECRET`), `PAYMENTS_ALERT_SLACK_CHANNEL` (uses `SLACK_BOT_TOKEN`) | stripe-webhook-reconcile + payments Slack alerts (MES-39) |
| `FIRECRAWL_API_KEY` (+ tuning: `FIRECRAWL_CACHE_ENABLED`, `FIRECRAWL_COMPETITOR_DEPTH`) | Scraping/search |
| `PERPLEXITY_API_KEY` | Market research |
| `LOVABLE_API_KEY` | Lovable AI Gateway (report sections) |
| `ANTHROPIC_API_KEY` (+ `RQ_LOOP_MODEL` override; `VERIFIER_ADJUDICATION_MODEL` override in generate-report) | generate-plan, classify-personas, normalize-events, report-quality-loop, generate-report (claims-verifier adjudication — MES-148 1a) |
| `OPENAI_API_KEY` (Vault fallback `openai_api_key`) | KB embeddings (embed-knowledge, knowledge-search) |
| `MATCH_RERANK_ENABLED` | generate-report matching toggle |
| `EVAL_BYPASS_USER_ID` | generate-report: exempts one user id (the golden-eval user) from the 5/60min report rate limit; unset in normal operation (MES-148 Phase 1c) |
| `RESEND_API_KEY`, `EMAIL_INTERNAL_SECRET` | Transactional email |
| `FRONTEND_URL` | Stripe redirects + CORS allowlist entry |
| `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `SLACK_NOTIFY_WEBHOOK_SECRET`, `RQ_SLACK_REVIEWERS`, `SLACK_EVENTS_WEBHOOK`, `SLACK_ALERTS_WEBHOOK` | Slack notify/loops + events digests |
| `NOTION_API_KEY`, `NOTION_TICKETS_DB_ID` | Quality-loop → MES Tickets sweep |
| `APIFY_TOKEN` / `APIFY_API_TOKEN`, `EVENTS_WEBHOOK_SECRET` | Events ingest |
| `KB_SYNC_SECRET`, `CONTENT_CREATOR_URL`, `CONTENT_CREATOR_ANON_KEY` | Cross-project KB sync (anon key only — never service-role) |
| `LEMLIST_API_KEY` | CRM sync |

## 13. Coding conventions (invariants — full set in `mes-codebase-conventions`)

1. Routes only in `src/App.tsx`; lazy-load pages; `<Layout>` is global — never wrap a page in it again.
2. React Query with kebab-case keys; `useDebounce(query, 300)` for search; global staleTime 5 min.
3. Directory pages: Hero → `DirectoryFilterBar` (presentational) + `useDirectoryFilters` (URL-synced
   state) → grid + `ListPagination`; pure filter logic in tested `src/lib/*Filters.ts` modules.
   `src/pages/Events.tsx` is the reference implementation.
4. SEO per page: Helmet/`SEOHead` with title, description, canonical, JSON-LD. Crawler posture:
   default-allow incl. AI crawlers (`public/robots.txt`, `public/llms.txt`); private routes
   noindexed — skill `seo-rendering-indexing-and-programmatic-pages`.
5. Styling: HSL semantic tokens only (shadcn + `--mes-*` brand tokens); no hardcoded palette
   colors (one documented exception: `reportSectionConfig.ts` section accents).
6. **Australian English** in all UI copy ("personalised", "organisation").
7. Never hand-edit `src/integrations/supabase/client.ts` or `types.ts` (generated).
8. Toasts: `useToast` (shadcn) or `sonner` — either is fine.

## 14. Known gotchas

1. Supabase default query limit is 1000 rows — check before diagnosing "missing data".
2. Stripe webhook signature needs the raw body (`ArrayBuffer` → `TextDecoder`).
3. Directory matching uses Postgres array overlap (`.cs.{}`) against `services[]`/`keywords[]`
   arrays — label/tag mismatches silently match nothing; test against real rows.
4. Guest intake drafts: localStorage `mes_intake_form_draft`; persona: `mes_user_persona`.
5. A "completed" report can be missing sections (per-section failures are silent — §7). Stuck
   `processing` rows are now swept by the `reap-stuck-reports` pg_cron (every 5 min → `failed`
   after 15 min; MES-148 1b, migration `20260711230000`), which unblocks regeneration for that
   intake; the failed-report **Retry** button on `/my-reports` resumes from the persisted
   `research_bundle` artifact (`report_run_artifacts`) without re-paying research.
6. `mcp` function is a generated bundle — edit `src/lib/mcp/` sources instead.
7. Event freshness is owned by skill `content-freshness-and-seo-ops-loop` — read it before
   touching event lifecycle or sitemap filters (known gap: the sitemap has no event-date filter,
   so past approved events persist in it).
8. `docs/redesign/handoff/CLAUDE.md` is a historical intake-v2 handoff draft — never copy it over
   this file.
9. Package managers: **Lovable's sandbox uses bun** (`bun install` / `bun add` / `bun run`), so
   `bun.lock`/`bun.lockb` are its lockfiles; the project stays **npm-compatible for local dev**
   (`package.json` + `package-lock.json`, which the README and the `npm test` script assume). Both
   are intentional — don't delete a "duplicate" lockfile or switch managers to tidy up.

## 15. Key files & docs

| Purpose | Path |
|---------|------|
| Routing / providers | `src/App.tsx` |
| Report API + tier-gated fetch | `src/lib/api/reportApi.ts` |
| Report section/tier config | `src/components/report/reportSectionConfig.ts` |
| Subscription hook | `src/hooks/useSubscription.ts` |
| Feature flags | `src/lib/featureFlags.ts` |
| Edge shared modules | `supabase/functions/_shared/` |
| Supabase + function config | `supabase/config.toml` |
| Migration rules (deep) | [`docs/migrations.md`](docs/migrations.md) |
| RAG/KB architecture (deep) | [`docs/mes-knowledge-base-rag.md`](docs/mes-knowledge-base-rag.md) |
| Launch checklist (canonical, MES-111) | [`docs/prelaunch-audit.md`](docs/prelaunch-audit.md) |
| Platform readiness + security audits (MES-35) | [`docs/audits/MES-35-platform-readiness-scan.md`](docs/audits/MES-35-platform-readiness-scan.md), [`docs/audits/MES-35-security-data-audit.md`](docs/audits/MES-35-security-data-audit.md) |
| SEO audit / homepage audit | [`docs/audits/seo-discoverability-audit-2026-07-04.md`](docs/audits/seo-discoverability-audit-2026-07-04.md), [`docs/audits/homepage-audit.md`](docs/audits/homepage-audit.md) |
| Report-generation audit | [`docs/audits/AUDIT_REPORT_GENERATION.md`](docs/audits/AUDIT_REPORT_GENERATION.md) |
| Runbooks (auth dashboard, www/apex 301) | `docs/runbooks/` |
