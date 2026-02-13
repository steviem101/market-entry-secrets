# CLAUDE.md — Market Entry Secrets

> Preprocessor file for Claude Code. Auto-loaded before every task.

---

## 1. Project Identity

**Market Entry Secrets** is a B2B SaaS directory and AI report platform that helps international companies enter the Australian/ANZ market. It connects global companies with vetted service providers, mentors, market intelligence, lead data, and AI-generated market entry reports.

- **Published URL:** https://market-entry-secrets.lovable.app
- **Supabase project ID:** `xhziwveaiuhzdoutpgrh`

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
| `/community` | `Community` | Mentor directory |
| `/events` | `Events` | Events directory |
| `/events/:eventSlug` | `EventDetailPage` | Single event detail |
| `/leads` | `Leads` | Lead data marketplace |
| `/content` | `Content` | Articles and guides listing |
| `/content/:slug` | `ContentDetail` | Single article/guide |
| `/case-studies` | `CaseStudies` | Case study listing |
| `/case-studies/:slug` | `CaseStudyDetail` | Single case study |
| `/innovation-ecosystem` | `InnovationEcosystem` | Innovation hubs directory |
| `/trade-investment-agencies` | `TradeInvestmentAgencies` | Trade agency directory |
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
| `user_subscriptions` | user_id (unique), tier (`free`\|`growth`\|`scale`\|`enterprise`) | — |
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
| `user_usage` | Anonymous usage tracking for freemium gate |
| `ai_chat_conversations` / `ai_chat_messages` | AI chat history |
| `testimonials` | Homepage testimonials |

---

## 5. Edge Functions

All edge functions are in `supabase/functions/`. Shared modules in `_shared/`:
- `_shared/http.ts` — `buildCorsHeaders(req)` for CORS
- `_shared/log.ts` — `log()` and `logError()` structured logging
- `_shared/auth.ts` — `requireAdmin(req)` admin role check

| Function | Purpose | `verify_jwt` | External APIs |
|----------|---------|-------------|---------------|
| `generate-report` | Main report pipeline (5-phase parallel) | ✅ | Firecrawl, Perplexity, Lovable AI Gateway |
| `create-checkout` | Creates Stripe checkout sessions | ✅ | Stripe |
| `stripe-webhook` | Handles Stripe webhook events | ❌ (uses signature) | Stripe |
| `enrich-content` | Enriches content with Firecrawl + AI | ✅ | Firecrawl, Lovable AI Gateway |
| `enrich-innovation-ecosystem` | Enriches ecosystem entries | ✅ | Firecrawl |
| `firecrawl-map` | Firecrawl Map API wrapper | ✅ | Firecrawl |
| `firecrawl-scrape` | Firecrawl Scrape API wrapper | ✅ | Firecrawl |
| `firecrawl-search` | Firecrawl Search API wrapper | ✅ | Firecrawl |
| `sync-lemlist` | Syncs Lemlist CRM data | ✅ | Lemlist API |
| `send-lead-followup` | Sends follow-up emails | ✅ | — |
| `ai-chat` | AI chat endpoint | ✅ | — |

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
2. Edge function creates Stripe Checkout Session with `metadata: { tier, supabase_user_id }`
3. On payment: Stripe sends webhook to `stripe-webhook` edge function
4. Webhook upserts `user_subscriptions` and updates `user_reports.tier_at_generation`
5. Frontend polls subscription after Stripe redirect (webhook may lag)

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
| `user_reports` | Owner SELECT + shared reports (where `share_token IS NOT NULL`) |

### Edge Function Security
- All functions have `verify_jwt = true` in `supabase/config.toml` (except `stripe-webhook` which uses Stripe signature)
- `create-checkout`: URL allowlist validation for redirect URLs (prevents open redirect)
- `sync-lemlist`: Admin role check via `requireAdmin()`
- `generate-report`: JWT validation + ownership check

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
| Supabase config | `supabase/config.toml` |
