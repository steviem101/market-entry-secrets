# MES Platform Audit Report — Part 1: Executive Summary & Critical Issues

**Date:** 2026-03-29
**Auditor:** Claude Code (Opus 4.6)
**Scope:** Full architecture, security, performance, and code quality audit
**Codebase:** 404 TypeScript/TSX files, 14 edge functions, ~80 migration files

---

## 1. Executive Summary

### Overall Health: 5.5 / 10

The MES platform is a functional MVP with solid foundational choices (React + Supabase + Stripe) and some genuinely well-implemented features (SSRF protection, CORS allowlisting, lazy-loaded routes, proper Stripe webhook signature verification). However, rapid "vibe coding" has left significant technical debt across every layer.

**What works well:**
- Clean route structure with proper lazy loading and code splitting
- Shared edge function utilities (_shared/http.ts, url.ts, auth.ts) are well-designed
- ProtectedRoute pattern is solid for authenticated pages
- Stripe checkout flow is correctly implemented
- SSRF protection on Firecrawl calls is excellent
- TypeScript compilation is clean (zero errors)

**What needs urgent attention:**
- Security: `generate-report` has `verify_jwt=false` exposing 4 API keys
- Performance: Nearly every data hook loads entire tables with no limits
- Data loading: Pervasive client-side filtering instead of database queries
- Dead code: Unused npm packages, orphaned components, stub functions
- No rate limiting on any edge function

### Top 5 Most Critical Issues

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| 1 | `generate-report` has `verify_jwt=false` with custom auth fallback | Anyone could potentially invoke report generation, consuming Anthropic/Perplexity/Firecrawl API credits | `supabase/config.toml:24-30` |
| 2 | Every directory page loads entire tables without LIMIT | Will degrade as data grows; already wasteful | All hooks in `src/hooks/use*.ts` |
| 3 | ~15 hooks fetch all rows then filter client-side | Transfers unnecessary data, wastes bandwidth, slow on mobile | `useCountry*.ts`, `useSector*.ts`, `useLocation*.ts` |
| 4 | `send-lead-followup` is a stub — emails are never sent | Users think they'll get a follow-up email but nothing is sent | `supabase/functions/send-lead-followup/index.ts:160-162` |
| 5 | No rate limiting on any edge function | External API abuse risk (Anthropic, Perplexity, Firecrawl) | All 14 edge functions |

### Technical Debt Estimate

| Area | Severity | Estimated Fix Effort |
|------|----------|---------------------|
| Security fixes (JWT, rate limiting) | Critical | 2-3 days |
| Data loading optimization (add limits, server-side filtering) | High | 3-5 days |
| Dead code cleanup (unused deps, orphaned files) | Low | 1 day |
| Component refactoring (large files) | Medium | 2-3 days |
| Email integration (replace stub) | Medium | 1 day |

---

## 2. Critical Issues (Must Fix Immediately)

### CRIT-1: `generate-report` edge function has `verify_jwt=false`

- **What:** The most sensitive edge function (calls Anthropic, Perplexity, Firecrawl, Lovable AI Gateway) has JWT verification disabled at the gateway level. It implements custom auth internally (lines 1438-1452) but this is fragile.
- **Where:** `supabase/config.toml:24-30`, `supabase/functions/generate-report/index.ts:1438-1452`
- **Impact:** If the custom auth check has any bug, unauthenticated users could trigger report generation, burning API credits across 4 external services. The config comment explains this is a CORS workaround — the Supabase gateway's 401 response lacks CORS headers.
- **Fix complexity:** Medium effort — requires either fixing CORS on the gateway side or ensuring the custom auth is bulletproof with rate limiting.
- **Suggested fix:** Add per-user rate limiting (max 3 reports/hour) regardless of auth approach. Consider a Supabase RPC call to verify the user before the heavy lifting begins.

### CRIT-2: No rate limiting on any edge function

- **What:** None of the 14 edge functions implement rate limiting. Functions that call external paid APIs (`generate-report`, `classify-personas`, `generate-plan`, `enrich-*`, `firecrawl-*`) are especially vulnerable.
- **Where:** All functions in `supabase/functions/`
- **Impact:** A malicious or buggy client could trigger thousands of API calls, running up bills on Anthropic, Perplexity, and Firecrawl.
- **Fix complexity:** Medium effort
- **Suggested fix:** Add a simple rate-limit check using a Supabase table or Redis. At minimum, add per-user-per-function counters checked before external API calls.

### CRIT-3: `send-lead-followup` is a non-functional stub

- **What:** The function prepares HTML email content but never sends it. Line 160: `"Email content prepared (not sent - no email service configured)"`. It returns `{ success: true, email_sent: false }` — the frontend likely shows success to the user.
- **Where:** `supabase/functions/send-lead-followup/index.ts:160-170`
- **Impact:** Users who request a bespoke market entry plan via the lead form receive no follow-up email. They're told to expect one within 48 hours. This is a broken promise affecting lead conversion.
- **Fix complexity:** Quick win — integrate Resend or similar with ~20 lines of code
- **Suggested fix:** Add Resend SDK call before the response. The email HTML is already built and properly escaped.

### CRIT-4: SQL filter injection risk in generate-report

- **What:** The report generation function builds PostgREST filter strings by concatenating user-supplied values (regions, services) into `.or()` calls. Sanitization (line 804-805) only strips commas and parentheses but doesn't handle all PostgREST filter syntax.
- **Where:** `supabase/functions/generate-report/index.ts:800-862`
- **Impact:** A crafted intake form could potentially manipulate database queries, though the Supabase client's `.or()` method provides some protection.
- **Fix complexity:** Medium effort
- **Suggested fix:** Use parameterized array-based filtering (`.in()`, `.contains()`) instead of string concatenation with `.or()`.

### CRIT-5: Unused `stripe` and `std` npm packages in frontend bundle

- **What:** `stripe` (v18.4.0) and `std` (v0.1.40) are listed as frontend dependencies but never imported in any `src/` file. Stripe should only be server-side. `std` appears to be an accidental dependency.
- **Where:** `package.json` dependencies
- **Impact:** Unnecessary bundle bloat. `stripe` alone is ~500KB. More importantly, having `stripe` as a frontend dependency is a security smell — it suggests someone may have tried to use Stripe server-side logic in the browser.
- **Fix complexity:** Quick win
- **Suggested fix:** `npm uninstall stripe std`

---

## 3. High Priority Issues (Fix Soon)

### HIGH-1: Every directory hook loads entire tables without LIMIT

- **What:** All main data hooks (`useCommunityMembers`, `useEvents`, `useInvestors`, `useInnovationEcosystem`, `useLeadDatabases`, `useSectors`, `useLocations`, `useCountries`) issue `SELECT *` with no `.limit()` clause. Supabase has a default 1000-row limit, but this is still excessive for most pages.
- **Where:**
  - `src/hooks/useCommunityMembers.ts:11-13`
  - `src/hooks/useEvents.ts:32-35`
  - `src/hooks/useInvestors.ts:8-11`
  - `src/hooks/useInnovationEcosystem.ts:8-11`
  - `src/hooks/useLeadDatabases.ts:13-17`
- **Impact:** Transfers unnecessary data. Will become a real performance problem as tables grow beyond 100 rows. Mobile users on slow connections will suffer.
- **Fix complexity:** Quick win per hook (add `.limit(100)` + pagination)
- **Suggested fix:** Add server-side pagination. Start with `.limit(50)` and implement cursor-based or offset pagination.

### HIGH-2: ~15 hooks fetch entire tables then filter client-side

- **What:** Country-specific, location-specific, and sector-specific hooks (`useCountryEvents`, `useCountryContent`, `useCountryCommunityMembers`, `useCountryLeads`, `useCountryServiceProviders`, `useSectorLeads`, `useSectorContent`, `useLocationEvents`, etc.) all load the entire parent table, then filter in JavaScript using `.filter()` with keyword matching.
- **Where:**
  - `src/hooks/useCountryEvents.ts:12-28` — loads ALL events, filters by keywords
  - `src/hooks/useCountryContent.ts:11-36` — loads ALL published content, filters by keywords
  - `src/hooks/useCountryCommunityMembers.ts:12-42` — loads ALL members, filters by country
  - `src/hooks/useCountryLeads.ts:11-37` — loads ALL active leads, filters by keywords
  - `src/hooks/useSectorLeads.ts:11-27` — loads ALL active leads, filters by keywords
  - `src/hooks/useSectorContent.ts:11-38` — loads ALL published content, filters by sector
- **Impact:** Multiplied waste — each country/location/sector page re-downloads the same full tables. A user browsing 5 country pages downloads the entire events table 5 times.
- **Fix complexity:** Medium effort — needs query refactoring
- **Suggested fix:** Use `.ilike()`, `.contains()`, or `.in()` filters at the query level. For keyword matching, create a Postgres full-text search index.

### HIGH-3: N+1 query patterns in content detail pages

- **What:** Content and case study detail pages make 3 sequential queries (content item → sections → bodies) where sections and bodies could be fetched in parallel.
- **Where:**
  - `src/hooks/useCaseStudies.ts:34-71` — 3 sequential queries
  - `src/hooks/useContent.ts:52-89` — 3 sequential queries
  - `src/hooks/useServiceProviders.ts:64-101` — 2 sequential queries (provider + category)
  - `src/hooks/useTradeAgencies.ts:34-93` — fallback query pattern (tries view, then table)
- **Impact:** Each detail page load makes 2-3 round trips to the database when 1 would suffice.
- **Fix complexity:** Medium effort
- **Suggested fix:** Use Supabase's nested select syntax to join related data in one query, or use `Promise.all()` for independent queries.

### HIGH-4: `useBookmarks` uses manual state instead of React Query

- **What:** The bookmarks hook uses `useState` + manual `fetchBookmarks()` instead of React Query. Every add/remove triggers a full refetch of all bookmarks.
- **Where:** `src/hooks/useBookmarks.ts:21-151`
- **Impact:** No caching, no optimistic updates, unnecessary network requests. Poor UX when toggling bookmarks.
- **Fix complexity:** Medium effort
- **Suggested fix:** Migrate to `useQuery`/`useMutation` with optimistic updates and query invalidation.

### HIGH-5: AI prompt injection risk in enrichment functions

- **What:** Scraped website content is injected directly into AI prompts without sanitization. A malicious website could contain prompt injection payloads.
- **Where:** `supabase/functions/enrich-innovation-ecosystem/index.ts:216-259` (and similar in `enrich-content`, `enrich-investors`)
- **Impact:** A malicious website could manipulate AI-generated content in the platform's database.
- **Fix complexity:** Medium effort
- **Suggested fix:** Strip HTML tags and known prompt injection patterns from scraped content before including in prompts. Add content length limits.

### HIGH-6: Events table RLS allows ANY authenticated user to UPDATE/DELETE any event

- **What:** The events table has overly permissive RLS policies: `FOR UPDATE TO authenticated USING (true)` and `FOR DELETE TO authenticated USING (true)`. Any signed-in user can modify or delete any event in the database.
- **Where:** `supabase/migrations/20250612062940-ce5aeea5-a66e-4061-9adf-bf9c948ef143.sql:40-51`
- **Impact:** A malicious authenticated user could delete all events or modify event data (titles, dates, links) to inject phishing URLs.
- **Fix complexity:** Quick win — change policies to require admin role
- **Suggested fix:** Replace `USING (true)` with `USING (public.has_role(auth.uid(), 'admin'))` for UPDATE and DELETE policies.

### HIGH-7: `user_usage` table SELECT policy is too broad

- **What:** The user_usage table has `FOR SELECT USING (true)` — any user (even anonymous) can read ALL usage tracking records for all users.
- **Where:** `supabase/migrations/20250901000000_repair_preview_objects.sql` — `"Users can view their own usage"` policy uses `USING (true)` instead of scoping to the user's own records.
- **Impact:** Leaks usage patterns of all users. Low severity data but violates least-privilege principle.
- **Fix complexity:** Quick win — change to `USING (auth.uid() = user_id)`

### HIGH-8: ReportView page lacks ProtectedRoute wrapper

- **What:** The `/report/:reportId` route has no `ProtectedRoute` wrapper in App.tsx. It relies on internal checks and the Supabase RLS policy. If a report ID is guessable or leaked, anyone can view it.
- **Where:** `src/App.tsx:134`, `src/pages/ReportView.tsx:28-34`
- **Impact:** Reports containing sensitive business intelligence could be accessed by unauthorized users if they obtain the report ID (UUIDs are random but could be leaked via browser history, logs, etc.).
- **Fix complexity:** Quick win
- **Suggested fix:** Wrap with `<ProtectedRoute>` or add explicit auth check that redirects to login.

---

*Continued in Part 2: Medium/Low Priority Issues & Architecture*
