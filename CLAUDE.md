# CLAUDE.md — Market Entry Secrets

> Preprocessor file for Claude Code. Auto-loaded before every task.

---

## 1. Project Identity

**Market Entry Secrets** is a B2B SaaS directory and AI report platform that helps international companies enter the Australian/ANZ market. It connects global companies with vetted service providers, mentors, market intelligence, lead data, and AI-generated market entry reports.

- **Published URL:** https://marketentrysecrets.com
- **Supabase project ID:** `xhziwveaiuhzdoutpgrh` (MES Platform — the only project in scope for this repo).
- **Out of scope:** Content Studio (Supabase ref `rcgaviwbsudouvfwzydq`). Never read from, write to, or migrate against it from this repo.

### Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Supabase (Postgres, Auth, Edge Functions, Storage) via Lovable Cloud |
| Payments | Stripe (checkout sessions + webhook) |
| Web scraping | Firecrawl (map, scrape, search) |
| Market research | Perplexity API (sonar, sonar-pro models) |
| AI content generation | Lovable AI Gateway → Gemini (`ai.gateway.lovable.dev`) |

---

## 2. Critical Build & Type Safety Rules

1. **Never hand-edit** `src/integrations/supabase/types.ts` — it's auto-generated from the DB schema.
2. **`user_intake_forms` and `user_reports`** are NOT in the auto-generated types. Always cast: `(supabase as any).from('user_intake_forms')`. This pattern is used throughout `src/lib/api/reportApi.ts`.
3. **`directory_submissions`** insert requires exactly `{ submission_type, contact_email, form_data }`. The `form_data` column is `Json` type — pass structured objects, not flat form fields at the insert root level.
4. **Edge functions** use Deno runtime with `esm.sh` imports (e.g. `https://esm.sh/@supabase/supabase-js@2`), not npm.
5. **No `VITE_*` env vars** — Lovable doesn't support them. Use full Supabase URLs/keys directly or secrets.

### Migration hygiene (the ledger is fragile — see `docs/migrations.md`)

6. **Migrations reach prod via the PR flow (merge to main auto-applies).** Do NOT apply
   schema to prod out-of-band — no dashboard SQL editor, no ad-hoc `psql`, and **agents
   must NOT `apply_migration` (MCP) against prod**. Commit the migration file in a PR.
   Out-of-band applies stamp apply-time versions and drift the ledger.
7. **Name migrations `<timestamp>_snake_name.sql`.** The CLI silently **skips** anything
   else (including legacy `<timestamp>-<uuid>.sql`) — a skipped file never applies.
8. **Never change the version/filename of an already-applied migration** (renumbering to
   dodge a collision is how the ledger drifted last time). Fix collisions before first
   apply, or add a new migration.
9. **The migration history was re-baselined 2026-07-04** (PR #263): the active dir starts
   at `20260704095538_remote_baseline.sql`, prior files live in `supabase/migrations_archive/`
   (reference only — never move them back), and **merged migrations auto-apply to prod
   again**. Still check the Supabase integration check is green on the PR before assuming
   a migration is live; new migration timestamps must be after the baseline.

---

## 3. Route Map

| Route | Page Component | Purpose |
|-------|---------------|---------|
| `/` | `Index` | Landing page (hero, before/after, search, pricing, testimonials) |
| `/report-creator` | `ReportCreator` | 3-step AI report intake wizard |
| `/report/:reportId` | `ReportView` | Rendered AI market entry report with tier gating |
| `/report/shared/:shareToken` | `SharedReportView` | Public shared report view |
| `/my-reports` | `MyReports` | User's report dashboard |
| `/service-providers` | `ServiceProviders` | Service provider directory |
| `/service-providers/:providerSlug` | `ServiceProviderPage` | Single provider detail |
| `/mentors` | `MentorsDirectory` | Mentor directory (real route) |
| `/mentors/:categorySlug` / `/mentors/:categorySlug/:mentorSlug` | `MentorsDirectory` / `MentorProfile` | Mentor category + profile |
| `/community` | → redirects to `/mentors` | Legacy alias |
| `/events` | `Events` | Events directory |
| `/events/:eventSlug` | `EventDetailPage` | Single event detail |
| `/leads` | `Leads` | Lead data marketplace |
| `/leads/:slug` | `LeadDatabaseDetailPage` | Single lead database detail |
| `/investors` | `Investors` | Investor directory |
| `/investors/:slug` | `InvestorPage` | Single investor detail |
| `/content` | `Content` | Articles and guides listing |
| `/content/:slug` | `ContentDetail` | Single article/guide |
| `/case-studies` | `CaseStudies` | Case study listing |
| `/case-studies/:slug` | `CaseStudyDetail` | Single case study |
| `/innovation-ecosystem` | `InnovationEcosystem` | Innovation hubs directory |
| `/innovation-ecosystem/:slug` | `InnovationOrgPage` | Single innovation org detail |
| `/government-support` | `TradeInvestmentAgencies` | Trade/government agency directory (real route) |
| `/government-support/:slug` | `AgencyDetailPage` | Single agency detail |
| `/trade-investment-agencies` | → redirects to `/government-support` | Legacy alias |
| `/admin/submissions` | `AdminSubmissions` | Admin: directory/lead submissions |
| `/locations` | `Locations` | Australian locations directory |
| `/locations/:locationSlug` | `LocationPage` | Single location detail |
| `/countries` | `Countries` | Source countries directory |
| `/countries/:countrySlug` | `CountryPage` | Single country detail |
| `/sectors` | `Sectors` | Industry sectors directory |
| `/sectors/:sectorSlug` | `SectorPage` | Single sector with sub-tabs |
| `/pricing` | `Pricing` | Subscription tiers + Stripe checkout |
| `/dashboard` | `MemberHub` | User dashboard (alias) |
| `/member-hub` | `MemberHub` | Member-only area |
| `/bookmarks` | `Bookmarks` | Saved bookmarks |
| `/mentor-connections` | `MentorConnections` | Mentor connections |
| `/about` | `About` | About page |
| `/faq` | `FAQ` | FAQ page |
| `/contact` | `Contact` | Contact page |
| `/privacy` | `PrivacyPolicy` | Privacy policy |
| `/terms` | `TermsOfService` | Terms of service |
| `/partner` | `PartnerWithUs` | Partner page |
| `/auth/callback` | `AuthCallback` | OAuth callback handler |

---

## 4. Database Schema

### Directory Tables (public read, no user-specific RLS)

| Table | Key Columns |
|-------|------------|
| `service_providers` | name, location, services[], description, website, logo, experience_tiles (jsonb), contact_persons (jsonb) |
| `community_members` | name, title, company, specialties[], location, origin_country, associated_countries[] |
| `events` | title, date, slug, location, category, type, organizer, sector, is_featured |
| `leads` | name, industry, location, category, price, record_count, provider_name |
| `innovation_ecosystem` | name, location, services[], founded, logo |
| `trade_investment_agencies` | name, location, services[], founded, logo |
| `country_trade_organizations` | name, country_id (FK→countries), services[], organization_type |

### Taxonomy Tables

| Table | Key Columns |
|-------|------------|
| `locations` | name, slug, key_industries[], keywords[], service_keywords[], event_keywords[], content_keywords[], lead_keywords[] |
| `countries` | name, slug, key_industries[], keywords[], (same keyword arrays as locations) |
| `industry_sectors` | name, slug, industries[], keywords[], (same keyword arrays) |

### Content Tables

| Table | Key Columns |
|-------|------------|
| `content_items` | title, slug, content_type, category_id, sector_tags[], status, featured |
| `content_sections` | content_id (FK→content_items), title, slug, sort_order |
| `content_bodies` | section_id (FK→content_sections), body_text, body_markdown, content_type |
| `content_categories` | name, description, color, icon |
| `content_company_profiles` | content_id (FK→content_items), company_name, industry, origin_country |
| `content_founders` | content_id (FK→content_items), name, title, bio, social links |

### User/Auth Tables

| Table | Key Columns | RLS |
|-------|------------|-----|
| `profiles` | id (=auth.users.id), first_name, last_name, username, stripe_customer_id | Own profile + admin SELECT |
| `user_roles` | user_id, role (`admin` \| `moderator` \| `user`) | — |
| `user_subscriptions` | user_id (unique), tier enum (`free`\|`growth`\|`scale`\|`enterprise`; legacy `premium`/`concierge` still in enum) | Own SELECT only. **Writes are service-role-only** (SEC-01) — clients cannot change their own tier |
| `bookmarks` | user_id, content_type, content_id, content_title | Own bookmarks |

### Report Tables (NOT in auto-generated types — use `(supabase as any)`)

| Table | Key Columns |
|-------|------------|
| `user_intake_forms` | user_id, company_name, website_url, country_of_origin, industry_sector[], target_regions[], services_needed[], raw_input (jsonb), status |
| `user_reports` | user_id, intake_form_id, report_json (jsonb), tier_at_generation, status, feedback_score, share_token |
| `report_templates` | section_name, prompt_body, visibility_tier, variables[], is_active |

### Lead/CRM Tables

| Table | RLS |
|-------|-----|
| `email_leads` | Admin-only SELECT |
| `lead_submissions` | Public INSERT, admin-only SELECT |
| `directory_submissions` | Public INSERT, admin-only SELECT |
| `lemlist_contacts` | Admin-only SELECT |
| `lemlist_companies` | Admin-only SELECT |

### Other Tables

| Table | Purpose |
|-------|---------|
| `payment_webhook_logs` | Stripe webhook event logs |
| `report_quality` | Per-report build-health / RAG-coverage telemetry (system of record for `#report-quality`). Admin-read; service-role write |
| `automation_runs` | Run log for scheduled MES loops (loop, started/finished, reviewed, proposed, tokens, cost, status). Admin-read; service-role write |
| `report_quality_proposals` | Propose-only review queue from `report-quality-loop` (category, evidence, recommended_change, impact, risk, axis_scores, status). Admin read + update; service-role insert; no user PII |
| `user_usage` | Anonymous usage tracking for freemium gate |
| `ai_chat_conversations` / `ai_chat_messages` | AI chat history (chat feature is placeholder) |
| `testimonials` | Homepage testimonials |
| `investors` | Investor/VC directory (447 rows; `investors_public` view hides PII from anon) |
| `agency_contacts` | Trade-agency contact people (PII; not anon-readable) |
| `lead_databases` / `lead_database_records` | Lead-list marketplace catalog + records |
| `country_page_content` / `country_trade_metrics` / `country_case_studies` / `country_playbook_stages` / `country_funding_instruments` / `country_faqs` | Country-page content blocks |
| `linkedin_industries` / `legacy_industry_mapping` | Intake industry taxonomy |
| `ii_*` | Irish Insights content pipeline (separate workstream; pgvector embeddings) |

> **This schema section is a curated subset, not exhaustive (~70 tables live).** Per the
> schema-discovery rule, introspect `information_schema` before interacting with any table
> rather than trusting this list to be complete. Public PII-safe views: `community_members_public`,
> `investors_public`, `agencies_report_view`.

---

## 5. Edge Functions

All edge functions are in `supabase/functions/`. Shared modules in `_shared/`:
- `_shared/http.ts` — `buildCorsHeaders(req)` for CORS
- `_shared/log.ts` — `log()` and `logError()` structured logging
- `_shared/auth.ts` — `requireAdmin(req)` admin role check

20 functions are deployed (verify in the dashboard / via `list_edge_functions`).
Functions with `verify_jwt = false` authenticate in-code (JWT, signature, or `x-internal-secret`).

| Function | Purpose | `verify_jwt` | External APIs |
|----------|---------|-------------|---------------|
| `generate-report` | Main report pipeline (5-phase parallel) | ❌ (in-code JWT + ownership) | Firecrawl, Perplexity, Lovable AI Gateway |
| `create-checkout` | Creates Stripe one-time checkout sessions (`mode: payment`) | ✅ | Stripe |
| `stripe-webhook` | Handles Stripe webhook events (only `checkout.session.completed`) | ❌ (signature) | Stripe |
| `enrich-content` | Enriches content with Firecrawl + AI (admin) | ✅ | Firecrawl, Lovable AI Gateway |
| `enrich-innovation-ecosystem` | Enriches ecosystem entries (admin) | ✅ | Firecrawl |
| `enrich-investors` | Enriches investor profiles (admin) | ✅ | Firecrawl, Lovable AI Gateway |
| `firecrawl-map` | Firecrawl Map API wrapper (admin) | ✅ | Firecrawl |
| `firecrawl-scrape` | Firecrawl Scrape API wrapper (admin) | ✅ | Firecrawl |
| `firecrawl-search` | Firecrawl Search API wrapper (admin) | ✅ | Firecrawl |
| `scrape-company` | Company scrape for intake (SSRF-guarded, IP rate-limited) | ❌ (rate-limit) | Firecrawl, Lovable AI Gateway |
| `classify-personas` | Classifies community-member personas (admin) | ✅ | Anthropic |
| `generate-plan` | AI market-entry plan generation | ✅ | Anthropic, Perplexity |
| `sync-lemlist` | Syncs Lemlist CRM data (admin) | ✅ | Lemlist API |
| `send-email` | Transactional email sender — renders blue-branded HTML in-code via the shared `_shared/email/` module (no Resend dashboard templates) | ❌ (`x-internal-secret` or JWT) | Resend |
| `process-email-queue` | Cron-driven email-queue processor | ❌ (`x-internal-secret`) | internal `send-email` |
| `send-lead-followup` | Sends bespoke-plan follow-up emails (shared `_shared/email/` module) | ✅ | Resend |
| `email-assets` | Public host for transactional-email images (serves the downscaled brand logo) | ❌ (public static asset) | — |
| `ai-chat` | Chat endpoint — **placeholder, not implemented** (returns a stub) | ✅ | — |
| `apify-webhook` | Apify ingest webhook (Irish Insights pipeline) | ❌ (webhook) | — |
| `notion-research-trigger` | Notion research trigger | ❌ (webhook) | — |
| `report-quality-rollup` | Weekly cross-report rollup card to Slack `#report-quality` (cron) | ❌ (`x-webhook-secret`) | Slack |
| `report-quality-loop` | Scheduled **propose-only** report-quality review loop — scores reports on relevance/conciseness/fidelity, writes ranked proposals to `report_quality_proposals`, logs to `automation_runs`, posts a digest. Disabled by default. | ❌ (`x-webhook-secret`) | Anthropic, Slack |

---

## 6. Authentication Architecture

```
AuthProvider (contexts/AuthContext.tsx)
  └─ useAuthState (hooks/auth/useAuthState.ts)
       ├─ supabase.auth.getSession() on mount
       ├─ supabase.auth.onAuthStateChange() listener
       └─ fetchUserData() → profiles + user_roles
  └─ useAuth (hooks/useAuth.ts) — public hook
       ├─ signInWithEmail, signUpWithEmail, signOut, updateProfile
       ├─ signInWithProvider (OAuth)
       ├─ resetPassword
       └─ useRoleHelpers → hasRole(), isAdmin(), isModerator()
```

### Database Triggers (on `auth.users` INSERT)
- `handle_new_user` → creates `profiles` row + assigns `'user'` role in `user_roles`
- `handle_new_user_subscription` → creates `user_subscriptions` row with tier `'free'`

### Edge Function Auth Pattern
```typescript
// For admin-only functions:
import { requireAdmin } from "../_shared/auth.ts";
const result = await requireAdmin(req);
if ("error" in result) return new Response(...);
// result.user is the authenticated admin

// For user-owned functions:
const token = req.headers.get("Authorization")?.replace("Bearer ", "");
const { data: { user } } = await supabase.auth.getUser(token);
```

---

## 7. Report Generation Pipeline

The `generate-report` edge function runs a 5-phase pipeline:

### Phase 1: Parallel Data Gathering (all run simultaneously)
1. **Deep Company Scrape** — Firecrawl Map (discover URLs) + Scrape (homepage + 2 key pages) → AI extracts structured company profile
2. **Perplexity Market Research** — 6 parallel queries: landscape (sonar-pro), regulatory, news, bilateral trade, cost of business, grants
3. **Key Metrics Extraction** — Perplexity structured output for 4-6 quantitative market metrics
4. **Database Directory Matching** — Queries 7 Supabase tables using Postgres array overlap (`.cs.{}`) and location `ilike` filtering
5. **Competitor Search** — Known competitors scraped via Firecrawl + web search for additional competitors
6. **End Buyer Research** — Scrapes user-provided end buyers + Perplexity procurement research
7. **External Event Discovery** — Firecrawl Search for relevant industry events

### Phase 2: Service Provider Enrichment
- Matched service providers are enriched with Firecrawl website scrapes

### Phase 3: AI Section Generation
- Report templates fetched from `report_templates` table
- Sections generated in batches of 3 using Lovable AI Gateway (Gemini `google/gemini-3-flash-preview`)
- Sections gated by tier get `visible: false` in stored JSON

### Phase 4: Polish Pass
- All visible sections sent through a single AI call for cross-referencing, deduplication, and consistency

### Phase 5: Storage
- Report JSON saved to `user_reports` with status `'completed'` or `'failed'`

### Report Sections (in order)

| Section | Tier Required |
|---------|--------------|
| `executive_summary` | free |
| `swot_analysis` | growth |
| `competitor_landscape` | growth |
| `service_providers` | free |
| `mentor_recommendations` | growth |
| `events_resources` | free |
| `action_plan` | free |
| `lead_list` | scale |

### Frontend Tier Gating
`ReportView.tsx` uses `useSubscription` hook + `TIER_REQUIREMENTS` from `reportSectionConfig.ts`. The `userTierMeetsRequirement()` function checks `TIER_HIERARCHY = ['free', 'growth', 'scale', 'enterprise']`. Tier upgrades immediately unlock sections without re-generation (content is already in the JSON, just marked `visible: false`).

---

## 8. Subscription & Payments

### Tiers
| Tier | Access |
|------|--------|
| `free` | Executive summary, service providers, events, action plan |
| `growth` | + SWOT, competitor landscape, mentor recommendations |
| `scale` | + Lead list |
| `enterprise` | Full access |

### Legacy Tier Mapping
`premium` → `growth`, `concierge` → `enterprise` (handled in `useSubscription.ts` `mapDatabaseTier()`)

### Stripe Flow
1. `useCheckout` hook calls `create-checkout` edge function
2. Edge function creates a Stripe Checkout Session with `metadata: { tier, supabase_user_id }`
3. On payment: Stripe sends webhook to `stripe-webhook` edge function
4. Webhook upserts `user_subscriptions` and updates `user_reports.tier_at_generation`
5. Frontend polls subscription after Stripe redirect (webhook may lag)

> **Billing model: one-time payments, not recurring subscriptions.** `create-checkout`
> uses `mode: "payment"`, so a tier (or lead-list purchase) is a one-time charge that grants
> access indefinitely — there is **no** Stripe Subscription object, no renewals, and no
> `customer.subscription.*` / `invoice.payment_failed` events. The webhook only handles
> `checkout.session.completed`. A failed initial payment simply never grants the tier.
> Refunds/chargebacks do **not** auto-revoke access (handled manually). `user_subscriptions`
> stores only `(user_id, tier)` — no subscription id / status / period. `profiles.stripe_customer_id`
> holds the Stripe customer mapping.

### Stripe Webhook Signature Verification
```typescript
const body = await req.arrayBuffer();
const rawBody = new TextDecoder("utf-8").decode(body);
const event = await stripe.webhooks.constructEventAsync(rawBody, sig, STRIPE_WEBHOOK_SECRET);
```

---

## 9. Coding Conventions & Patterns

### Directory Pages
All directory pages follow: **Hero → Filters → Results grid/list**

### Hooks per Domain
- `useEvents`, `useCommunityMembers`, `useLocations`, `useCountries`, `useSectors`
- Location/Country/Sector sub-hooks: `useLocationEvents`, `useSectorServiceProviders`, etc.
- `useMasterSearch` — searches 7 tables with `ilike` queries

### Page Wrapper
All pages use `<Layout>` (Navigation + Footer) + SEO via `react-helmet-async` `<Helmet>`.

### Toast Notifications
Both `useToast` (shadcn) and `sonner` (`toast()`) are available. Use either.

### Component Patterns
- Cards with modals for detail views (e.g. `CompanyCard` → `CompanyModal`)
- `BookmarkButton` for saveable items
- `FreemiumGate` wraps content with `PaywallModal` for anonymous view limits

### Styling
- Use Tailwind semantic tokens from `index.css` and `tailwind.config.ts`
- Do NOT use hardcoded colors in components — use design system tokens
- All colors must be HSL format

---

## 10. Security Constraints

### RLS Policies (applied Feb 2026)
| Table | Policy |
|-------|--------|
| `email_leads` | Admin-only SELECT |
| `lemlist_contacts` | Admin-only SELECT |
| `lemlist_companies` | Admin-only SELECT |
| `lead_submissions` | Public INSERT, admin-only SELECT |
| `profiles` | Own profile + admin SELECT |
| `user_reports` | Owner SELECT (+ admin); public sharing via the `get_shared_report(share_token)` SECURITY DEFINER RPC, **not** an RLS policy |

### Client write-grant lockdown (SEC-01/02/03, applied Jun 2026)
- `anon`/`authenticated` no longer hold the Supabase-default `INSERT/UPDATE/DELETE/TRUNCATE`
  grants on most tables. **Writes are service-role-only** except: anon `INSERT` on the public
  submission funnels (`directory_submissions`, `email_leads`, `lead_submissions`,
  `mentor_contact_requests`, `intake_form_events`, `user_usage`), anon write on the session-scoped
  `ai_chat_*` tables, and `authenticated` write on owner/admin tables backed by an RLS policy.
- `user_subscriptions.tier` is service-role-write-only (closed a paywall self-upgrade bypass).
- The Notion-backed `MES` foreign table was moved out of the API-exposed `public` schema into
  the non-API `private` schema (foreign tables don't respect RLS).
- When adding a table, the default grant is broad — scope client write grants deliberately.

### Edge Function Security
- Most functions have `verify_jwt = true`. Exceptions authenticate in-code: `stripe-webhook`
  (Stripe signature), `generate-report` (JWT + ownership), `scrape-company` (SSRF guard + rate
  limit), `send-email`/`process-email-queue` (`x-internal-secret`), `apify-webhook`/`notion-research-trigger` (webhook).
- `create-checkout`: URL allowlist validation for redirect URLs (prevents open redirect)
- `sync-lemlist`: Admin role check via `requireAdmin()`

### General
- Never log PII (emails, tokens) to console
- `has_role()` DB function for RLS policy checks: `has_role(auth.uid(), 'admin'::app_role)`

---

## 11. Environment Secrets

| Secret | Purpose |
|--------|---------|
| `STRIPE_SECRET` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification |
| `STRIPE_GROWTH_PRICE_ID` | Stripe price ID for Growth tier |
| `STRIPE_SCALE_PRICE_ID` | Stripe price ID for Scale tier |
| `FIRECRAWL_API_KEY` | Firecrawl web scraping/search (managed by connector) |
| `PERPLEXITY_API_KEY` | Perplexity real-time research (managed by connector) |
| `LOVABLE_API_KEY` | Lovable AI Gateway for content generation |
| `FRONTEND_URL` | Frontend URL for Stripe redirect URLs |
| `LEMLIST_API_KEY` | Lemlist CRM API key |
| `ALLOWED_ORIGINS` | Allowed CORS origins |
| `ANTHROPIC_API_KEY` | Anthropic Claude API (`classify-personas`, `generate-plan`, `report-quality-loop`) |
| `RQ_LOOP_MODEL` | Optional override for the `report-quality-loop` Claude model (default `claude-sonnet-4-6`) |
| `SLACK_BOT_TOKEN` | Slack `chat.postMessage` token for `#report-quality` (rollup + loop) |
| `SLACK_NOTIFY_WEBHOOK_SECRET` | `x-webhook-secret` guarding `slack-notify` / `report-quality-rollup` / `report-quality-loop` |
| `RESEND_API_KEY` | Resend transactional email (`send-email`, `send-lead-followup`) |
| `EMAIL_INTERNAL_SECRET` | Internal `x-internal-secret` for server-to-server calls to `send-email` |
| `CONTENT_CREATOR_URL` | Content Creator (`rcgaviwbsudouvfwzydq`) API URL — read source for the `kb-sync` LinkedIn sync |
| `CONTENT_CREATOR_ANON_KEY` | Content Creator anon key — reads the `kb_sync_source` view cross-project (never a service-role key) |
| `KB_SYNC_SECRET` | Internal `x-internal-secret` guarding the `kb-sync` function (also in Vault as `kb_sync_secret` for the cron) |

---

## 12. Known Gotchas

1. **`form_data` is `Json` type** — pass structured objects, not flat form fields at the insert root level
2. **`user_intake_forms` and `user_reports` not in auto-generated types** — always use `(supabase as any)` cast
3. **Stripe webhook uses raw body** — `ArrayBuffer` → `TextDecoder` for signature verification
4. **`callAI` targets `ai.gateway.lovable.dev`** (Lovable AI Gateway), not OpenAI directly
5. **Freemium gate** — 3 free views tracked in `localStorage` + `user_usage` table; signed-in users bypass entirely
6. **Supabase default query limit** — 1000 rows. Check this before assuming "missing data" bugs.
7. **Directory matching uses Postgres array overlap** — `.cs.{}` syntax for matching arrays like `services`, `keywords`, `industries`
8. **Lead gen popup** — `LeadGenPopupProvider` shows popup after 15 seconds for non-authenticated users
9. **Report intake draft persistence** — Guest users' form data saved to `localStorage` key `mes_intake_form_draft`; auth triggered before generation
10. **Polish pass** — Reports go through a final AI pass that concatenates all visible sections for cross-referencing

---

## 13. Key File Locations

| Purpose | Path |
|---------|------|
| Supabase client | `src/integrations/supabase/client.ts` |
| Auto-generated types (DO NOT EDIT) | `src/integrations/supabase/types.ts` |
| Report API helpers | `src/lib/api/reportApi.ts` |
| Auth context | `src/contexts/AuthContext.tsx` |
| Auth hooks | `src/hooks/useAuth.ts`, `src/hooks/auth/` |
| Subscription hook | `src/hooks/useSubscription.ts` |
| Report section config | `src/components/report/reportSectionConfig.ts` |
| Intake form schema | `src/components/report-creator/intakeSchema.ts` |
| Navigation items | `src/components/navigation/NavigationItems.tsx` |
| Edge function shared modules | `supabase/functions/_shared/` |
| Transactional email module (blue-branded, code-based) | `supabase/functions/_shared/email/` (`theme`, `layout`, `components`, `render`, `templates/`) |
| Supabase config | `supabase/config.toml` |
