# MES Platform Audit Report — Part 2: Medium/Low Priority & Architecture

---

## 4. Medium Priority Issues (Fix During Next Sprint)

### MED-1: 66 console.log/error statements left in production code

- **What:** 66 `console.log`/`console.error`/`console.warn` calls across 35 source files.
- **Where:** Spread across hooks and components. Highest concentration:
  - `src/hooks/useMentors.ts` — 7 occurrences
  - `src/hooks/useAIChat.ts` — 4 occurrences
  - `src/hooks/auth/userDataService.ts` — 4 occurrences
  - `src/lib/api/reportApi.ts` — 4 occurrences
  - `src/hooks/useTradeAgencies.ts` — 4 occurrences
  - `src/hooks/useSubscription.ts` — 3 occurrences
- **Impact:** Information leakage in production (auth states, subscription details, error messages visible in browser console). Not a security emergency but unprofessional.
- **Fix complexity:** Quick win — add ESLint rule `no-console: warn`

### MED-2: 8 components over 300 lines that should be split

- **What:** Several page components and config files exceed 300 lines, making them hard to maintain.
- **Where:**
  - `src/pages/CaseStudies.tsx` — 814 lines (filters + listing + modals all in one)
  - `src/pages/CaseStudyDetail.tsx` — 709 lines
  - `src/pages/ContentDetail.tsx` — 643 lines
  - `src/pages/MentorProfile.tsx` — 536 lines
  - `src/data/mockData.ts` — 454 lines (still present — is this used?)
  - `src/pages/MemberHub.tsx` — 417 lines
  - `src/pages/AdminSubmissions.tsx` — 389 lines
  - `src/components/trade-investment-agencies/detail/AgencyContent.tsx` — 393 lines
  - `src/components/mentors/MentorFilters.tsx` — 372 lines
  - `src/components/hero/HeroProductMockup.tsx` — 363 lines
  - `src/components/report-creator/IntakeStep1.tsx` — 346 lines
  - `src/components/auth/AuthDialog.tsx` — 333 lines
  - `src/config/personaContent.ts` — 817 lines (config data, acceptable)
- **Impact:** Hard to maintain, review, and test. High risk of merge conflicts.
- **Fix complexity:** Medium effort — extract sub-components

### MED-3: Orphaned Community.tsx page component

- **What:** `src/pages/Community.tsx` is a fully implemented community members directory (226 lines) with filtering, search, and persona filtering. But the `/community` route in App.tsx redirects to `/mentors` (line 98). The file is never rendered.
- **Where:** `src/pages/Community.tsx` (unreachable), `src/App.tsx:98`
- **Impact:** Dead code. If the mentors page replaces community functionality, this file should be deleted.
- **Fix complexity:** Quick win — delete file

### MED-4: Hardcoded domain URL in 15 locations

- **What:** `https://market-entry-secrets.lovable.app` is hardcoded in SEO components, share dialogs, and canonical links across 10+ files.
- **Where:**
  - `src/components/common/SEOHead.tsx:24`
  - `src/components/report/ReportShareDialog.tsx:17`
  - `src/pages/Index.tsx:18,29,35,56`
  - `src/pages/Events.tsx:128`
  - `src/pages/InnovationEcosystem.tsx:84`
  - `src/pages/Investors.tsx:99`
  - `src/pages/MentorsDirectory.tsx:104`
  - `src/pages/ServiceProviders.tsx:82`
  - And more...
- **Impact:** If the domain changes (e.g., custom domain), SEO metadata and share links will break. CLAUDE.md says "No VITE_* env vars" but `window.location.origin` could be used instead.
- **Fix complexity:** Quick win — use `window.location.origin` for dynamic URLs

### MED-5: Placeholder social media links in footer

- **What:** Facebook and Instagram links in the footer point to `#`.
- **Where:** `src/components/Footer.tsx:77,80`
- **Impact:** Clicking these links scrolls to page top — confusing UX. Either add real URLs or remove the icons.
- **Fix complexity:** Quick win

### MED-6: `useSubscription` uses manual state instead of React Query

- **What:** Like `useBookmarks`, the subscription hook uses `useState` + `useEffect` + manual `fetchSubscription()` instead of React Query's `useQuery`.
- **Where:** `src/hooks/useSubscription.ts:48-129`
- **Impact:** No caching across components. Multiple components calling `useSubscription()` each make independent database calls. After Stripe checkout, polling is implemented manually instead of using React Query's `refetchInterval`.
- **Fix complexity:** Medium effort

### MED-7: Firecrawl wrapper functions leak API error details to client

- **What:** The firecrawl-map, firecrawl-scrape, and firecrawl-search edge functions return the raw Firecrawl API error text to the frontend.
- **Where:** `supabase/functions/firecrawl-map/index.ts:~70`, `firecrawl-scrape/index.ts:~70`, `firecrawl-search/index.ts:~70`
- **Impact:** Could leak internal API structure details. Not critical but poor practice.
- **Fix complexity:** Quick win — return generic error messages

### MED-8: `mockData.ts` (454 lines) may be unused

- **What:** A large mock data file exists at `src/data/mockData.ts`. If this is only used during development and not imported in production code, it's dead weight.
- **Where:** `src/data/mockData.ts`
- **Impact:** Bundle bloat if tree-shaking doesn't eliminate it.
- **Fix complexity:** Quick win — verify imports and remove if unused

---

### MED-9: 17 pages missing SEO metadata (Helmet tags)

- **What:** 17 pages have no `<Helmet>` or `<SEOHead>` component, meaning no custom title, meta description, Open Graph tags, or canonical URL.
- **Where:** Missing on: `About`, `AuthCallback`, `Bookmarks`, `Community`, `Contact`, `Content`, `Countries`, `FAQ`, `Locations`, `MemberHub`, `NotFound`, `PartnerWithUs`, `Pricing`, `PrivacyPolicy`, `ResetPassword`, `Sectors`, `TermsOfService`
- **Impact:** Poor SEO for key landing pages (Pricing, Contact, FAQ, Content listing, Locations, Countries, Sectors). These are high-value pages for organic search traffic.
- **Fix complexity:** Quick win — add `<SEOHead>` to each page (component already exists at `src/components/common/SEOHead.tsx`)

### MED-10: ~100+ instances of `any` type throughout codebase

- **What:** Heavy use of `any` type, concentrated in detail pages and report components.
- **Where:** Highest density:
  - `src/pages/ContentDetail.tsx` — 13 instances (lines 66, 128, 130, 132, 135, 143, etc.)
  - `src/pages/CaseStudyDetail.tsx` — 12 instances
  - `src/pages/MemberHub.tsx` — 4 instances
  - `src/components/report/CitationRenderer.tsx` — 5 instances
  - `src/components/trade-investment-agencies/detail/AgencyContent.tsx` — 6 instances
- **Impact:** Defeats TypeScript's purpose. Runtime errors that the compiler should catch.
- **Fix complexity:** Medium effort — define proper interfaces for report JSON, content sections, etc.

### MED-11: ContentDetail.tsx and CaseStudyDetail.tsx share heavily duplicated logic

- **What:** These two 600+ line files contain near-identical patterns for save stories, content grouping, share/copy, and founder display.
- **Where:**
  - Save stories: `ContentDetail.tsx:34-42` vs `CaseStudyDetail.tsx:24-32`
  - Share/copy: `ContentDetail.tsx:90-98` vs `CaseStudyDetail.tsx:107-117`
  - Founder extraction: `ContentDetail.tsx:128` vs `CaseStudyDetail.tsx:149`
- **Impact:** Bug fixes need to be applied in two places. High risk of drift.
- **Fix complexity:** Medium effort
- **Suggested fix:** Extract shared logic into a `useDetailPageLogic` hook.

### MED-12: No ARIA labels or accessibility attributes found

- **What:** No `aria-label` or `aria-describedby` attributes found across the codebase. Limited `alt` text on images. No skip-to-content link.
- **Impact:** Fails WCAG accessibility standards. Could be a legal liability and hurts SEO.
- **Fix complexity:** Medium-high effort (needs systematic pass across all interactive elements)

---

## 5. Low Priority / Improvement Opportunities

### LOW-1: `useLeadDatabases` makes 2 queries that could be 1

- **Where:** `src/hooks/useLeadDatabases.ts:13-17` (databases) and `:59-85` (stats)
- **Suggested fix:** Combine into single query with aggregation or use a database view.

### LOW-2: Report status polling is synchronous (every 3s for up to 6 minutes)

- **Where:** `src/lib/api/reportApi.ts:111-142`
- **Suggested fix:** Use Supabase Realtime subscriptions or WebSocket for status updates.

### LOW-3: `fetchMyReports` loads all reports without pagination

- **Where:** `src/lib/api/reportApi.ts:179-197`
- **Suggested fix:** Add `.limit(20)` and implement pagination.

### LOW-4: QueryClient staleTime is 5 minutes globally

- **Where:** `src/App.tsx:68-75`
- **Note:** This is reasonable for a directory site. Could be tuned per-query for frequently changing data (events, reports).

### LOW-5: `useTradeAgencies` has fallback query pattern for schema migration

- **Where:** `src/hooks/useTradeAgencies.ts:69-85`
- **What:** Tries a query with new column names, falls back if they don't exist. This suggests an incomplete migration.
- **Suggested fix:** Once migration is confirmed applied, remove fallback.

### LOW-6: VITE_ environment variables in .env file

- **Where:** `.env` file contains `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_URL`
- **Note:** CLAUDE.md says "No VITE_* env vars — Lovable doesn't support them" but they exist. The Supabase anon key is public by design, so this isn't a security issue, but it contradicts project documentation.

---

## 6. Architecture Observations

### Frontend Architecture: 6/10

**Strengths:**
- Clean separation: pages → hooks → Supabase client
- Consistent use of React Query for most data fetching
- Good lazy-loading strategy with `React.lazy()` for all non-critical routes
- ErrorBoundary at the app level
- shadcn/ui provides consistent component library

- Excellent auth race condition protection (microtask queue, cancelled flags, ref guards)
- Content flash prevention (null state pattern in FreemiumGate, skeleton in ProtectedRoute)
- Zero inline styles — consistent Tailwind usage
- No memory leaks — all event listeners and timers properly cleaned up
- Empty states handled with reusable `EmptyState` component
- Broken image fallbacks implemented on key components
- Sitemap and robots.txt present

**Weaknesses:**
- No centralized data layer — every hook independently creates Supabase queries
- Country/Location/Sector sub-hooks duplicate the same "load all, filter client-side" pattern ~15 times
- Mixed state patterns — some hooks use React Query, some use manual useState (bookmarks, subscriptions)
- No query key factory — query keys are ad-hoc strings, risking cache inconsistency
- Large page components that combine data fetching, filtering, and rendering

### Database Design: 7/10

**Strengths:**
- Good use of RLS policies across sensitive tables (profiles, subscriptions, reports, admin data)
- Proper foreign key relationships for content hierarchy (content_items → sections → bodies)
- Appropriate use of JSONB for flexible data (form_data, report_json, experience_tiles)
- Good taxonomy structure (locations, countries, sectors with keyword arrays)

**Weaknesses:**
- Missing indexes on frequently filtered columns (not visible from migrations alone — need DB inspection)
- Some tables use `(supabase as any)` cast because they're not in auto-generated types (user_intake_forms, user_reports, lead_databases, agencies_report_view)
- Array overlap queries (`.cs.{}`) are powerful but may need GIN indexes for performance

### Edge Function Architecture: 6/10

**Strengths:**
- Good shared utility pattern (`_shared/http.ts`, `_shared/auth.ts`, `_shared/log.ts`, `_shared/url.ts`)
- Excellent SSRF protection via `isPrivateOrReservedUrl()`
- Proper CORS allowlisting with regex for Lovable preview domains
- Stripe webhook signature verification is correctly implemented

**Weaknesses:**
- No rate limiting anywhere
- `verify_jwt=false` on `generate-report` (the most expensive function)
- API keys sent in HTTP headers to external services (standard practice, but no rotation strategy)
- No idempotency checks on report generation
- `send-lead-followup` is a stub

### Integration Patterns: 5/10

**Strengths:**
- Stripe checkout → webhook → DB update flow is correctly implemented
- Multiple AI/scraping services are properly abstracted in the report pipeline

**Weaknesses:**
- Email integration is non-functional (stub only)
- No retry logic on external API failures in edge functions
- External API error details leak to frontend
- No circuit breaker pattern for external service outages

### Scalability Concerns

1. **Immediate:** Client-side filtering of entire tables will break when any table exceeds ~500 rows
2. **Near-term:** No pagination on any listing page means memory usage grows linearly with data
3. **Medium-term:** Report generation pipeline makes 6+ parallel external API calls — needs queuing at scale
4. **Long-term:** JSONB columns (report_json) will make queries slow as report count grows — consider extracting key fields

### Rebuild vs Renovate Recommendation

**Renovate.** The architecture is fundamentally sound — React + Supabase + Stripe is the right stack for this product. The issues are implementation-level, not architectural. A focused 2-week sprint could address all critical and high-priority issues:

- Week 1: Security fixes (rate limiting, JWT, SQL injection), data loading optimization (add limits, server-side filters)
- Week 2: Email integration, component cleanup, React Query migration for remaining hooks

A rebuild would take 2-3 months and risk losing the working features. Not recommended.

---

*Continued in Part 3: Page-by-Page Data Loading & Dashboards*
