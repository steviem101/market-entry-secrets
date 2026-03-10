# MES Platform Full Renovation Audit Report

**Date:** 2026-03-10
**Auditor:** Claude Code (Opus 4.6) — Multi-Agent Deep Dive
**Scope:** Read-only comprehensive audit across 8 investigation phases
**Platform:** Market Entry Secrets (MES) — B2B SaaS directory & AI report platform

---

## 1. Executive Summary

**Overall Platform Health Score: 7/10**

The MES platform is surprisingly mature for a Lovable-built application. All major entity types have dedicated detail pages with slug-based URLs, the auth system is solid, Stripe billing is fully functional, and security fundamentals are in place (JWT verification, RLS, DOMPurify, SSRF protection). The main areas needing renovation are code quality (error boundaries, monolithic edge functions), SEO depth (structured data on entity pages, dynamic sitemaps), TypeScript strictness, and search/filtering UX.

### Top 5 Critical Issues
1. **No React error boundaries** — any component crash takes down the entire app
2. **`generate-report` edge function is 1508 lines** — monolithic, hard to debug/maintain
3. **`ai-chat` edge function is a placeholder** — no real AI integration
4. **Loose TypeScript config** — `noImplicitAny: false`, `strictNullChecks: false`
5. **No dynamic sitemap** — entity detail pages (hundreds of providers, mentors, events) are not in `sitemap.xml`

### Top 5 Quick Wins (High Impact, Low Effort)
1. Add a global React error boundary component (XS effort)
2. Fix Sector/Innovation/Investor URLs from UUID to slug-based (S effort)
3. Add JSON-LD structured data to entity detail pages (S effort)
4. Replace TODO mock data in LeadPreviewModal with real data (S effort)
5. Add URL-persisted filters on listing pages for shareability (S effort)

### Estimated Total Renovation Scope: **Medium**
The platform is functional and well-structured. Most work is enhancement rather than rebuild.

---

## 2. Platform Architecture Map

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18)                   │
│  Vite + TypeScript + Tailwind + shadcn/ui               │
│  47 pages | 257 components | React Router v6            │
│  React Query for data fetching                          │
│  PersonaContext (international_entrant / local_startup)  │
├─────────────────────────────────────────────────────────┤
│                    SUPABASE CLIENT                       │
│  src/integrations/supabase/client.ts                    │
│  Anon key (public) | Auto-generated types               │
├─────────────────────────────────────────────────────────┤
│              SUPABASE BACKEND                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Postgres │  │   Auth   │  │   Edge Functions     │  │
│  │ 30+ tbls │  │ Email/   │  │ 14 functions +       │  │
│  │ RLS on   │  │ OAuth    │  │ 4 shared modules     │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│              EXTERNAL SERVICES                           │
│  Stripe (billing) | Firecrawl (scraping)                │
│  Perplexity (research) | Lovable AI Gateway (content)   │
│  Anthropic Claude (plans/personas) | Lemlist (CRM)      │
└─────────────────────────────────────────────────────────┘
```

### Auth Flow
```
User → AuthDialog (email/OAuth) → Supabase Auth
  → DB Trigger: handle_new_user → profiles + user_roles(user)
  → DB Trigger: handle_new_user_subscription → user_subscriptions(free)
  → Frontend: useAuthState → fetchUserData → profile + roles
  → ProtectedRoute wrapper for gated pages
```

### Report Generation Pipeline
```
ReportCreator (3-step wizard) → submitIntakeForm() → user_intake_forms
  → generateReport() → Edge Function: generate-report
    Phase 1: Parallel data gathering (Firecrawl + Perplexity + DB matching)
    Phase 2: Service provider enrichment
    Phase 3: AI section generation (batches of 3, Lovable AI Gateway)
    Phase 4: Polish pass (cross-referencing)
    Phase 5: Store to user_reports
  → Frontend polls status → ReportView with tier-gated sections
```

### Stripe Billing Flow
```
PricingCard → useCheckout → create-checkout Edge Function
  → Stripe Checkout Session → Payment
  → Stripe webhook → stripe-webhook Edge Function
    → Upserts user_subscriptions + updates user_reports.tier_at_generation
  → Frontend polls subscription (webhook may lag)
```

---

## 3. Findings by Category

### SECURITY

**[SEVERITY: LOW] [CATEGORY: Security] [EFFORT: XS]**
**Issue:** `setTimeout(..., 0)` in `useAuthState.ts` defers profile fetch, creating potential race condition with rapid auth state changes
**Location:** `src/hooks/auth/useAuthState.ts:46`
**Impact:** Edge case where profile data could be stale during rapid sign-in/sign-out
**Recommendation:** Replace with `queueMicrotask()` or handle within the auth state change callback directly
**Acceptance Criteria:** Auth flow works correctly with rapid sign-in/sign-out cycles

**[SEVERITY: LOW] [CATEGORY: Security] [EFFORT: XS]**
**Issue:** Supabase anon key expiry set to year 2065 — extremely long-lived
**Location:** `src/integrations/supabase/client.ts:6`
**Impact:** Low risk since anon key is public and RLS protects data, but unusually long expiry
**Recommendation:** Note for future key rotation planning; no immediate action needed
**Acceptance Criteria:** N/A (informational)

**[SEVERITY: INFO] [CATEGORY: Security] [EFFORT: N/A]**
**Issue:** Security posture is strong — no critical vulnerabilities found
**Details:**
- All edge functions have `verify_jwt = true` except `stripe-webhook` (correctly uses Stripe signature verification)
- No service role key in frontend code
- DOMPurify used for all `dangerouslySetInnerHTML` (3 occurrences, all sanitized)
- 0 `console.log` statements in `src/` (only `console.error` for auth errors)
- SSRF protection in `supabase/functions/_shared/url.ts`
- Stripe webhook has proper signature verification and event deduplication
- RLS properly configured on sensitive tables (profiles, user_reports, email_leads, etc.)

### PERFORMANCE & CODE QUALITY

**[SEVERITY: HIGH] [CATEGORY: Code Quality] [EFFORT: XS]**
**Issue:** No React error boundaries anywhere in the application
**Location:** Entire application — no `ErrorBoundary` component exists
**Impact:** Any component render error crashes the entire app with a white screen
**Recommendation:** Add a global error boundary wrapping `<App>` and per-route error boundaries
**Acceptance Criteria:** Component errors show fallback UI instead of white screen

**[SEVERITY: HIGH] [CATEGORY: Code Quality] [EFFORT: L]**
**Issue:** `generate-report` edge function is 1508 lines — a monolithic function
**Location:** `supabase/functions/generate-report/index.ts`
**Impact:** Hard to debug, test, maintain, and deploy. Single point of failure for entire report pipeline
**Recommendation:** Split into modular helper files: `dataGathering.ts`, `enrichment.ts`, `sectionGeneration.ts`, `polishPass.ts`
**Acceptance Criteria:** Main `index.ts` < 200 lines, each helper module < 400 lines, report generation still works end-to-end

**[SEVERITY: MEDIUM] [CATEGORY: Code Quality] [EFFORT: S]**
**Issue:** Several page components are 400–530 lines and could benefit from extraction
**Location:**
- `src/pages/MentorProfile.tsx` (528 lines)
- `src/pages/CaseStudyDetail.tsx` (449 lines)
- `src/pages/ContentDetail.tsx` (446 lines)
- `src/pages/MemberHub.tsx` (417 lines)
**Impact:** Harder to maintain, reason about, and test
**Recommendation:** Extract logical sections into sub-components (already done well for `ServiceProviderPage`)
**Acceptance Criteria:** No page component exceeds 300 lines

**[SEVERITY: MEDIUM] [CATEGORY: Code Quality] [EFFORT: S]**
**Issue:** Loose TypeScript configuration allows implicit any and skips null checks
**Location:** `tsconfig.json` — `noImplicitAny: false`, `strictNullChecks: false`
**Impact:** Type errors can slip through, reducing code reliability
**Recommendation:** Incrementally enable stricter settings; start with `noImplicitAny: true`
**Acceptance Criteria:** `noImplicitAny: true` enabled with zero build errors

**[SEVERITY: LOW] [CATEGORY: Code Quality] [EFFORT: XS]**
**Issue:** 4 TODO comments for incomplete features
**Location:**
- `src/constants/mockPreviewData.ts:2` — "Replace mock data with real preview records from lead_database_records table"
- `src/hooks/useAIChat.ts:110` — "This is where you'll integrate your custom GPT"
- `src/hooks/useLeadCheckout.ts:22` — "For free databases, record access directly via Supabase"
- `src/components/leads/LeadPreviewModal.tsx:71` — "Replace mock data with real preview records"
**Impact:** Mock data shown to users; AI chat non-functional; free lead access not implemented
**Recommendation:** Address each TODO: replace mock data, implement AI chat, implement free lead access
**Acceptance Criteria:** No TODO comments remain; features are functional

**[SEVERITY: MEDIUM] [CATEGORY: Code Quality] [EFFORT: S]**
**Issue:** `ai-chat` edge function returns placeholder responses — no real AI integration
**Location:** `supabase/functions/ai-chat/index.ts`
**Impact:** Chat feature is non-functional for users
**Recommendation:** Integrate with Anthropic Claude or Lovable AI Gateway for real responses
**Acceptance Criteria:** AI chat returns contextually relevant responses about market entry

**[SEVERITY: LOW] [CATEGORY: Code Quality] [EFFORT: N/A]**
**Issue:** 40+ `as any` casts across the codebase (primarily for non-generated table types)
**Location:** `src/lib/api/reportApi.ts` (11), `src/hooks/useMentors.ts` (8), `src/hooks/useTradeAgencies.ts` (8), others
**Impact:** Loss of type safety for these table operations
**Recommendation:** Add manual type definitions for `user_intake_forms` and `user_reports` tables
**Note:** This is an accepted pattern per CLAUDE.md Section 2, Point 2

### UX & FRONTEND

**[SEVERITY: MEDIUM] [CATEGORY: UX] [EFFORT: S]**
**Issue:** Three entity detail pages use UUID-based URLs instead of slugs
**Location:**
- Sectors: `/sectors/:sectorId`
- Innovation Ecosystem: `/innovation-ecosystem/:orgId`
- Investors: `/investors/:investorId`
**Impact:** Poor SEO, ugly URLs, inconsistent with other entity pages that use slugs
**Recommendation:** Add slug columns if missing, update routes and hooks to use slug-based lookups
**Acceptance Criteria:** All entity detail pages use human-readable slug URLs

**[SEVERITY: MEDIUM] [CATEGORY: UX] [EFFORT: S]**
**Issue:** Search filters are not URL-persisted — not shareable or bookmarkable
**Location:** All listing pages (events, mentors, providers, etc.) — filters use `useState` only
**Impact:** Users can't share filtered views or bookmark specific searches
**Recommendation:** Sync filter state with URL search params using `useSearchParams()`
**Acceptance Criteria:** Filter selections reflect in URL; pasting URL restores filters

**[SEVERITY: LOW] [CATEGORY: UX] [EFFORT: S]**
**Issue:** Master search has no pagination — returns up to 1000 results per table
**Location:** `src/hooks/useMasterSearch.ts`
**Impact:** Performance issues with large result sets; users can't paginate through results
**Recommendation:** Add cursor-based or offset pagination to search results
**Acceptance Criteria:** Search results paginate in groups of 20–50

**[SEVERITY: LOW] [CATEGORY: UX] [EFFORT: XS]**
**Issue:** Silent error handling in master search — partial failures are invisible
**Location:** `src/hooks/useMasterSearch.ts` — try/catch blocks with `// Silently continue`
**Impact:** Users may see incomplete results without knowing some tables failed
**Recommendation:** Add a toast notification when partial search failures occur
**Acceptance Criteria:** Users see "Some results may be incomplete" warning on partial failures

### SEO

**[SEVERITY: HIGH] [CATEGORY: SEO] [EFFORT: S]**
**Issue:** No structured data (JSON-LD) on entity detail pages
**Location:** All entity detail pages (service providers, mentors, events, etc.)
**Impact:** Search engines can't create rich snippets for entity pages
**Recommendation:** Add appropriate Schema.org types:
- `LocalBusiness` for service providers
- `Person` for mentors
- `Event` for events
- `Article` for content/articles
- `Place` for locations
**Acceptance Criteria:** Each entity type has correct JSON-LD in `<Helmet>`; validated with Google's Rich Results Test

**[SEVERITY: HIGH] [CATEGORY: SEO] [EFFORT: M]**
**Issue:** Static `sitemap.xml` with only 30 URLs — entity detail pages not included
**Location:** `public/sitemap.xml`
**Impact:** Hundreds of entity pages are not discoverable by search engines
**Recommendation:** Generate dynamic sitemap at build time or via edge function, including all entity detail page URLs
**Acceptance Criteria:** `sitemap.xml` includes all published entity detail pages with proper `lastmod` dates

**[SEVERITY: MEDIUM] [CATEGORY: SEO] [EFFORT: XS]**
**Issue:** Some meta tags still reference `lovable.app` URL instead of production domain
**Location:** Homepage JSON-LD: `url: "https://market-entry-secrets.lovable.app"`
**Impact:** Search engines see inconsistent canonical URLs
**Recommendation:** Update all hardcoded URLs to production domain
**Acceptance Criteria:** No references to `lovable.app` in user-facing meta tags

**[SEVERITY: INFO] [CATEGORY: SEO] [EFFORT: N/A]**
**Issue:** Good SEO foundations in place
**Details:**
- `sitemap.xml` exists with 30 core routes
- `robots.txt` properly configured
- React Helmet Async used on all major pages with title, description, OG tags
- JSON-LD with `Organization` and `WebSite` schemas on homepage
- Canonical URLs implemented
- Slug-based URLs on 9 of 12 entity types

---

## 4. Entity Detail Pages — Gap Analysis

| Entity | Page Exists | URL Pattern | Slug-Based | JSON-LD | Component Size | Status |
|--------|-------------|-------------|------------|---------|----------------|--------|
| Service Providers | Yes | `/service-providers/:providerSlug` | Yes | No | Well-structured (split into sub-components) | Comprehensive |
| Mentors | Yes | `/mentors/:categorySlug/:mentorSlug` | Yes | No | 528 lines (needs extraction) | Comprehensive |
| Events | Yes | `/events/:eventSlug` | Yes | No | Split into EventDetailHero + EventDetailContent | Good |
| Locations | Yes | `/locations/:locationSlug` | Yes | No | Split into sub-components | Good |
| Countries | Yes | `/countries/:countrySlug` | Yes | No | Split into sub-components | Good |
| Sectors | Yes | `/sectors/:sectorId` | **No** | No | Split into sub-components | Good (needs slug) |
| Content/Articles | Yes | `/content/:slug` | Yes | No | 446 lines (needs extraction) | Comprehensive |
| Case Studies | Yes | `/case-studies/:slug` | Yes | No | 449 lines (needs extraction) | Good |
| Innovation Ecosystem | Yes | `/innovation-ecosystem/:orgId` | **No** | No | Has detail page | Good (needs slug) |
| Investors | Yes | `/investors/:investorId` | **No** | No | Has detail page | Good (needs slug) |
| Gov/Trade Agencies | Yes | `/government-support/:slug` | Yes | No | Split into sub-components | Comprehensive |
| Leads | Yes | `/leads/:slug` | Yes | No | Has mock preview data | Good (needs real data) |

### Key Finding
All 12 entity types have dedicated detail pages — the platform is more mature than expected. The main gaps are:
1. **3 entity types using UUIDs instead of slugs** (Sectors, Innovation Ecosystem, Investors)
2. **Missing JSON-LD structured data on ALL entity detail pages**
3. **4 pages over 400 lines** needing component extraction for maintainability
4. **Mock preview data** in LeadPreviewModal

---

## 5. Database Renovation Plan

### Schema Changes Needed
1. **Ensure `slug` columns exist** on `industry_sectors`, `innovation_ecosystem`, and `investors` tables (may already exist — verify via SQL)
2. **Add indexes** on slug columns if not already indexed
3. **Consider:** Add `updated_at` trigger for automatic timestamp updates on all tables

### RLS Assessment
- RLS properly configured on sensitive tables
- `stripe-webhook` correctly uses Stripe signature instead of JWT
- No exposed sensitive data via anon key
- `has_role()` DB function used for admin checks

### No Urgent Migrations Required

---

## 6. Frontend Renovation Plan

### No New Pages Needed
All entity types already have dedicated detail pages.

### Pages to Refactor
| Page | Current Lines | Target | Extraction Candidates |
|------|--------------|--------|----------------------|
| `MentorProfile.tsx` | 528 | <300 | Sidebar, experience tiles, testimonials, contact form |
| `CaseStudyDetail.tsx` | 449 | <300 | Content sections, company profile, founder card |
| `ContentDetail.tsx` | 446 | <300 | Sidebar, company profile, navigation |
| `MemberHub.tsx` | 417 | <300 | Dashboard sections, stats, quick actions |

### Components to Create
1. `ErrorBoundary.tsx` — global error boundary with user-friendly fallback UI
2. `RouteErrorBoundary.tsx` — per-route error boundary for isolated error handling

### Navigation — No Changes Needed
Navigation is well-structured with Desktop/Mobile variants, dropdowns, and persona context (`PersonaContext`). Three nav groups: Directory, Explore, Resources.

### Component Inventory Highlights
- **257 total components** across 47 pages
- **Card + Modal pattern** used consistently (CompanyCard → CompanyModal, PersonCard → PersonModal, EventCard → EventModal)
- **Homepage** has 15+ sections with persona toggle, social proof, stats, and testimonials
- **Shared components**: BookmarkButton, FreemiumGate, SubmissionModal, PaywallModal
- **shadcn/ui** components: Button, Card, Dialog, Sheet, Badge, Tabs, Select, etc.

---

## 7. Security Remediation Plan

**No critical security vulnerabilities found.**

### Minor Items (Priority Order)
1. Replace `setTimeout(0)` with `queueMicrotask()` in `useAuthState.ts` (XS effort)
2. Enable stricter TypeScript config incrementally — `noImplicitAny: true` first (M effort)
3. Note anon key expiry (2065) for future key rotation planning (informational)

### Things Done Right
- JWT verification on all edge functions (except `stripe-webhook` — uses Stripe sig)
- No service role key in frontend code
- DOMPurify for all HTML injection
- SSRF protection in shared URL utility
- Proper CORS configuration via `buildCorsHeaders(req)`
- Stripe webhook deduplication and signature verification
- RLS on all sensitive tables
- ProtectedRoute wrapper with role-based access

---

## 8. Prioritized Task Backlog

### P0 — Ship Blockers (Do First)

| # | Task | Effort | Dependencies | Claude Code Prompt |
|---|------|--------|--------------|-------------------|
| 1 | **Add global React error boundary** | XS | None | "Add an ErrorBoundary component wrapping the App in main.tsx with a user-friendly fallback UI" |
| 2 | **Fix lovable.app URL references in meta tags** | XS | None | "Replace all hardcoded lovable.app URLs in meta tags/JSON-LD with the production domain" |

### P1 — Core Experience (Do Next)

| # | Task | Effort | Dependencies | Claude Code Prompt |
|---|------|--------|--------------|-------------------|
| 3 | **Convert Sector/Innovation/Investor URLs from UUID to slug** | S | DB slug columns | "Update routes, hooks, and pages for sectors, innovation-ecosystem, and investors to use slug-based URLs instead of UUIDs" |
| 4 | **Add JSON-LD structured data to entity detail pages** | S | None | "Add Schema.org JSON-LD to ServiceProviderPage (LocalBusiness), MentorProfile (Person), EventDetailPage (Event), ContentDetail (Article)" |
| 5 | **Generate dynamic sitemap including entity pages** | M | None | "Create a build-time script or edge function that generates sitemap.xml including all entity detail page URLs" |
| 6 | **Add URL-persisted filters on listing pages** | S | None | "Sync filter state with URL search params using useSearchParams() on events, mentors, providers, and other listing pages" |
| 7 | **Replace mock data in LeadPreviewModal** | S | None | "Replace mock preview data in LeadPreviewModal with real data from lead_database_records table" |
| 8 | **Implement AI chat with real AI backend** | M | API key | "Integrate ai-chat edge function with Anthropic Claude API for contextual market entry responses" |

### P2 — Growth Enablers (Do After)

| # | Task | Effort | Dependencies | Claude Code Prompt |
|---|------|--------|--------------|-------------------|
| 9 | **Refactor generate-report edge function** | L | None | "Split generate-report/index.ts into modular files: dataGathering.ts, enrichment.ts, sectionGeneration.ts, polishPass.ts" |
| 10 | **Extract large page components** | M | None | "Refactor MentorProfile.tsx, CaseStudyDetail.tsx, ContentDetail.tsx, and MemberHub.tsx to extract sub-components, keeping each file under 300 lines" |
| 11 | **Add pagination to master search** | S | None | "Add cursor-based pagination to useMasterSearch.ts with load-more UX" |
| 12 | **Enable stricter TypeScript config** | M | None | "Enable noImplicitAny: true in tsconfig.json and fix all resulting type errors" |
| 13 | **Add partial search failure notification** | XS | None | "Show a toast notification in useMasterSearch when some tables fail to return results" |

### P3 — Polish & Scale (Do Later)

| # | Task | Effort | Dependencies | Claude Code Prompt |
|---|------|--------|--------------|-------------------|
| 14 | **Implement free lead database access flow** | S | None | "Implement the TODO in useLeadCheckout.ts for free databases — record access directly via Supabase" |
| 15 | **Add type definitions for non-generated tables** | S | None | "Create manual TypeScript types for user_intake_forms and user_reports tables to replace (supabase as any) casts" |
| 16 | **Replace setTimeout with queueMicrotask in auth** | XS | None | "Replace setTimeout(..., 0) with queueMicrotask() in useAuthState.ts" |
| 17 | **Resolve remaining TODO comments** | S | None | "Address all remaining TODO comments in the codebase" |
| 18 | **Add per-route error boundaries** | S | P0-1 | "Add error boundary wrappers to each route in App.tsx for isolated error handling" |

---

## 9. Verification Plan

After implementing changes:
1. **Build check:** `npm run build` — should complete with no errors
2. **Type check:** `npx tsc --noEmit` — should pass
3. **Manual test:** Navigate to each entity detail page, verify slug URLs work
4. **SEO test:** View page source on entity pages, verify JSON-LD is present
5. **Error boundary test:** Intentionally throw error in a component, verify fallback UI appears
6. **Search test:** Apply filters, verify URL updates; share URL, verify filters restore
7. **Sitemap test:** Fetch `sitemap.xml`, verify entity pages are listed
8. **Report test:** Generate a test report end-to-end, verify all phases complete

---

## 10. Key Files Reference

| Purpose | Path |
|---------|------|
| Router config | `src/App.tsx` |
| Supabase client | `src/integrations/supabase/client.ts` |
| Auto-generated types | `src/integrations/supabase/types.ts` (DO NOT EDIT) |
| Auth context | `src/contexts/AuthContext.tsx` |
| Auth state hook | `src/hooks/auth/useAuthState.ts` |
| Subscription hook | `src/hooks/useSubscription.ts` |
| Report section config | `src/components/report/reportSectionConfig.ts` |
| Master search | `src/hooks/useMasterSearch.ts` |
| Report API helpers | `src/lib/api/reportApi.ts` |
| Edge function config | `supabase/config.toml` |
| Report generator | `supabase/functions/generate-report/index.ts` |
| Shared CORS | `supabase/functions/_shared/http.ts` |
| Shared auth | `supabase/functions/_shared/auth.ts` |
| Shared URL validation | `supabase/functions/_shared/url.ts` |
| Homepage sections | `src/components/sections/` |
| Navigation items | `src/components/navigation/NavigationItems.tsx` |
| Persona content | `src/config/personaContent.ts` |

---

## 11. Appendix: Full Component Inventory

### Core Layout
- `Layout.tsx` — Main page wrapper (Navigation + Footer)
- `Navigation.tsx` — Sticky header with desktop/mobile nav toggle
- `Footer.tsx` — Footer component

### Homepage (15+ sections)
- `HeroSection.tsx` — Interactive hero with persona toggle
- `TrustLogosSection.tsx` — Data source logos
- `BeforeAfterSection.tsx` — Before/after comparison
- `HowItWorksSection.tsx` — 3-step process
- `SearchSection.tsx` — Master search CTA
- `ValueSection.tsx` — Value propositions
- `ComparisonSection.tsx` — MES vs. alternatives
- `TestimonialsSection.tsx` — Testimonial carousel
- `PricingSection.tsx` — Pricing tiers display
- `CTASection.tsx` — Final conversion CTA
- `ProvidersSection.tsx` — Featured providers highlight
- `StatsBar.tsx` — Statistics display

### Card Components
- `CompanyCard.tsx` — Service provider card (+ header, content, footer sub-components)
- `PersonCard.tsx` — Mentor/community member card
- `MentorCard.tsx` — Dedicated mentor card
- `EventCard.tsx` — Event card
- `LeadCard.tsx` — Lead database card
- `LocationCard.tsx` — Location card
- `CountryCard.tsx` — Country card
- `SectorCard.tsx` — Sector card
- `InvestorCard.tsx` — Investor card
- `ContentCard.tsx` — Content/article card
- `FeaturedItemCard.tsx` — Generic featured item card
- `PricingCard.tsx` — Pricing tier card
- `TestimonialCard.tsx` — Testimonial card

### Modal Components
- `CompanyModal.tsx` — Service provider detail modal
- `PersonModal.tsx` — Mentor/community member detail modal
- `EventModal.tsx` — Event detail modal
- `MentorContactModal.tsx` — Contact form for mentors
- `LeadPreviewModal.tsx` — Lead database preview modal
- `PaywallModal.tsx` — Freemium gate paywall
- `PaymentStatusModal.tsx` — Payment success/failure
- `SubmissionModal.tsx` — Directory submission form

### Auth Components
- `ProtectedRoute.tsx` — Route guard with role-based access
- `AuthDialog.tsx` — Sign-in/sign-up dialog

### Shared/Utility Components
- `BookmarkButton.tsx` — Saveable items bookmark toggle
- `FreemiumGate.tsx` — Wraps content with PaywallModal for anonymous view limits
- `LeadGenPopupProvider.tsx` — Shows popup after 15 seconds for non-auth users

### Edge Functions (14 total)
| Function | JWT | Purpose |
|----------|-----|---------|
| `generate-report` | Yes | 5-phase AI report pipeline |
| `create-checkout` | Yes | Stripe checkout sessions |
| `stripe-webhook` | No (Stripe sig) | Stripe webhook handler |
| `enrich-content` | Yes | Content enrichment with Firecrawl + AI |
| `enrich-innovation-ecosystem` | Yes | Ecosystem entry enrichment |
| `enrich-investors` | Yes | Investor enrichment |
| `firecrawl-map` | Yes | Firecrawl Map API wrapper |
| `firecrawl-scrape` | Yes | Firecrawl Scrape API wrapper |
| `firecrawl-search` | Yes | Firecrawl Search API wrapper |
| `sync-lemlist` | Yes | Lemlist CRM data sync |
| `send-lead-followup` | Yes | Follow-up email sending |
| `ai-chat` | Yes | AI chat endpoint (placeholder) |
| `classify-personas` | Yes | Persona classification |
| `generate-plan` | Yes | Plan generation |
