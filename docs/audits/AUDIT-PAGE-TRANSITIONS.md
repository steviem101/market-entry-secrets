# Page Transition Performance Audit — Market Entry Secrets

**Date:** 2026-03-28
**Scope:** Phase 1 — Investigation & Diagnosis (read-only, zero code changes)
**Platform:** React 18 + Vite + TypeScript + Tailwind + shadcn/ui + Supabase

---

## Executive Summary

### Top 3 Most Impactful Causes of Slow Page Transitions

1. **Waterfall query chains on Sector/Location/Country pages (HIGH)** — Each of these page types fires 7-8 Supabase queries *sequentially*, where each sub-hook waits for the parent config query to resolve before it can even begin. A single SectorPage load chains ~8 round-trips to Supabase. If each takes 150-250ms, that's 1200-2000ms of avoidable latency vs ~250ms if parallelised.

2. **Full-table fetches with client-side filtering (HIGH)** — 15+ hooks call `select('*')` on entire tables (service_providers, events, community_members, investors, etc.) with no `.limit()`, then filter in JavaScript. Every Sector/Location/Country sub-hook downloads the *entire* table just to show a keyword-filtered subset. This wastes bandwidth, memory, and Supabase compute on every navigation.

3. **802 KB monolithic vendor chunk (MEDIUM-HIGH)** — The main `index-*.js` chunk is 802 KB (236 KB gzip). While route-level code splitting via `React.lazy()` is in place for page components, all shared dependencies (React, Supabase client, React Query, Radix UI, Recharts, react-markdown, DOMPurify, date-fns) are bundled into a single chunk that must be downloaded and parsed before *any* page renders.

---

## Build Output

```
vite v5.4.19 building for production...
✓ 2613 modules transformed.

dist/index.html                                         1.75 kB │ gzip:   0.63 kB
dist/assets/market-entry-secrets-logo-CoR9-Z_k.png  1,474.55 kB
dist/assets/index-DRuQ005X.css                        154.29 kB │ gzip:  22.51 kB
dist/assets/index-a8R8-nGw.js                         801.72 kB │ gzip: 235.95 kB  ← MAIN CHUNK
dist/assets/ReportKeyMetrics-CiRHanRD.js              162.64 kB │ gzip:  49.95 kB
dist/assets/ReportCreator-BDk1h2e8.js                  80.79 kB │ gzip:  25.17 kB
dist/assets/ContentDetail-BiNVeUXt.js                  33.91 kB │ gzip:   9.08 kB
dist/assets/UsageBanner-CXWX-wcb.js                    26.89 kB │ gzip:   6.21 kB
dist/assets/CaseStudies-CXYvEZZo.js                    23.64 kB │ gzip:   5.88 kB
dist/assets/purify.es-A66Cw1IH.js                      22.63 kB │ gzip:   8.74 kB
dist/assets/format-B3XKS-z2.js                         20.22 kB │ gzip:   5.71 kB
dist/assets/CaseStudyDetail-BMruc8l1.js                18.65 kB │ gzip:   5.17 kB
dist/assets/useLeadCheckout-B-dxTkdt.js                18.27 kB │ gzip:   6.02 kB
dist/assets/ReportView-DMSateDH.js                     17.79 kB │ gzip:   5.89 kB
dist/assets/MentorsDirectory-shIzRzKs.js               17.74 kB │ gzip:   5.33 kB
dist/assets/ServiceProviders-BSATCWpB.js               15.14 kB │ gzip:   5.52 kB
... (90+ lazy-loaded page chunks, all < 15 KB)

⚠ Some chunks are larger than 500 kB after minification.
✓ built in 5.78s
```

**Key observations:**
- Main vendor chunk: **802 KB** (236 KB gzip) — contains all shared deps
- Logo PNG: **1,475 KB** — uncompressed, no WebP/AVIF alternative
- CSS: **154 KB** (23 KB gzip) — single CSS file, no splitting
- Lazy-loaded page chunks: well-split, mostly 2-18 KB each
- `ReportKeyMetrics` chunk: **163 KB** — likely contains Recharts

---

## Findings Table

| # | Finding | Severity | Category | Files Affected | Fix Effort |
|---|---------|----------|----------|---------------|------------|
| 1 | Waterfall query chains on Sector/Location/Country pages | Critical | Data Fetching | 21 hooks, 3 page types | Medium |
| 2 | Full-table `select('*')` with client-side filtering, no `.limit()` | Critical | Data Fetching | 15+ hooks | Medium |
| 3 | 802 KB monolithic vendor chunk — no `manualChunks` config | High | Bundle Size | `vite.config.ts` | Quick win |
| 4 | `useMasterSearch` queries 7 tables with no `.limit()` per table | High | Data Fetching | `src/hooks/useMasterSearch.ts` | Quick win |
| 5 | `useEvents` uses raw useState/useEffect instead of React Query | High | Data Fetching | `src/hooks/useEvents.ts` | Medium |
| 6 | Sequential queries inside `useContentItem` and `useCaseStudyDetail` | High | Data Fetching | `src/hooks/useContent.ts`, `src/hooks/useCaseStudies.ts` | Medium |
| 7 | AuthContext value not memoised — causes subtree re-renders | Medium | Re-rendering | `src/contexts/AuthContext.tsx` | Quick win |
| 8 | Zero `loading="lazy"` on any `<img>` tag in the entire app | Medium | Images/Assets | All card components | Quick win |
| 9 | 1,475 KB unoptimised PNG logo in bundle | Medium | Images/Assets | `dist/assets/market-entry-secrets-logo-*.png` | Quick win |
| 10 | No `React.memo` on list card components (MentorCard, EventCard, etc.) | Medium | Re-rendering | Card components | Quick win |
| 11 | Missing `useMemo` for derived filter values on listing pages | Low | Re-rendering | Events, Leads, MentorsDirectory pages | Quick win |
| 12 | No differentiated `staleTime` — all queries use same 5-min default | Low | Data Fetching | All hooks | Quick win |
| 13 | Navigation re-renders on every route change (no memo) | Low | Re-rendering | Navigation components | Quick win |

---

## Detailed Findings

### Finding 1: Waterfall Query Chains on Sector/Location/Country Pages

**Severity:** Critical
**Category:** Data Fetching / Network Waterfall
**Estimated Impact:** 1000-2000ms added latency per page load

**What:** SectorPage, LocationPage, and CountryPage each call 7-8 data hooks that depend on a parent "config" query. Each sub-hook (e.g. `useSectorServiceProviders`) internally calls `useSectorBySlug()` and sets `enabled: !!sectorConfig`, creating a sequential chain where Request B cannot start until Request A resolves.

**Where:**
- `src/pages/SectorPage.tsx:19-30` — calls 9 hooks
- `src/components/locations/LocationContent.tsx:23-29` — calls 7 hooks
- `src/components/countries/CountryContent.tsx:20-24` — calls 5+ hooks
- All `src/hooks/useSector*.ts` (7 files)
- All `src/hooks/useLocation*.ts` (7 files)
- All `src/hooks/useCountry*.ts` (5+ files)

**Why it's slow:** Example from `src/hooks/useSectorServiceProviders.ts:6-31`:
```typescript
const { data: sectorConfig } = useSectorBySlug(sectorSlug);  // Query 1
return useQuery({
  queryKey: ['sector-service-providers', sectorSlug],
  queryFn: async () => {
    if (!sectorConfig) return [];
    const { data } = await supabase.from('service_providers').select('*')...
  },
  enabled: !!sectorConfig  // Blocked until Query 1 resolves
});
```
Each of the 7 sub-hooks repeats this pattern. If Supabase round-trip is ~200ms, the waterfall adds 7 × 200ms = 1400ms vs ~200ms if parallelised. The config query itself is also duplicated — each sub-hook calls `useSectorBySlug()` independently (though React Query deduplicates the actual fetch).

**Recommended fix:**
- Pass the resolved `sectorConfig` (with its keywords) as a prop/parameter to each sub-hook, removing the internal dependency.
- Alternatively, create a single `useSectorPageData(slug)` hook that fetches the config first, then fires all 7 data queries in parallel using `Promise.all()` or `useQueries()`.

**Dependencies:** Fixing this also addresses Finding 2 (full-table fetches) since the refactored hooks can use server-side filtering.

---

### Finding 2: Full-Table `select('*')` With Client-Side Filtering

**Severity:** Critical
**Category:** Data Fetching / Over-fetching
**Estimated Impact:** 200-500ms per query (network) + unnecessary memory usage

**What:** 15+ hooks fetch entire tables with `select('*')` and no `.limit()`, then filter results in JavaScript using keyword matching. This transfers potentially hundreds of records when only a handful are needed.

**Where (sample of affected hooks):**
- `src/hooks/useSectorServiceProviders.ts:14-17` — `select('*')` on service_providers, filters client-side by keywords
- `src/hooks/useSectorEvents.ts` — same pattern on events table
- `src/hooks/useSectorLeads.ts` — same pattern on lead_databases table
- `src/hooks/useSectorCommunityMembers.ts` — same pattern on community_members
- `src/hooks/useSectorInnovationEcosystem.ts` — same on innovation_ecosystem
- `src/hooks/useSectorInvestors.ts` — same on investors
- `src/hooks/useSectorTradeAgencies.ts` — same on trade_investment_agencies
- All equivalent `useLocation*.ts` and `useCountry*.ts` hooks (same pattern)
- `src/hooks/useCommunityMembers.ts:10-13` — no limit on full list
- `src/hooks/useInvestors.ts:8-11` — no limit
- `src/hooks/useTradeAgencies.ts:9-20` — no limit
- `src/hooks/useInnovationEcosystem.ts:8-11` — no limit

**Why it's slow:** Example from `useSectorServiceProviders.ts`:
```typescript
const { data } = await supabase.from('service_providers').select('*').order('name');
// Then filters ALL results in JS:
return data.filter(provider => {
  const searchText = `${provider.name} ${provider.description} ${provider.services?.join(' ')}`.toLowerCase();
  return sectorConfig.service_keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
});
```
If `service_providers` has 500 rows with large `description`, `basic_info`, `why_work_with_us`, `experience_tiles` (JSONB), and `contact_persons` (JSONB) columns, each query transfers significant payload. Multiply by 7 hooks per page = massive over-fetching.

**Recommended fix:**
- Move keyword filtering to Postgres using `.or()` with `.ilike()` on relevant columns, or use a Postgres full-text search function.
- Select only needed columns instead of `*` (e.g. `.select('id, name, description, services, location, logo, slug')`).
- Add `.limit(20)` for sector/location/country filtered results.
- For listing pages (useInvestors, useCommunityMembers, etc.), add server-side pagination with `.range()`.

---

### Finding 3: 802 KB Monolithic Vendor Chunk

**Severity:** High
**Category:** Bundle Size
**Estimated Impact:** 200-500ms initial parse time on mobile devices

**What:** All shared dependencies are bundled into a single 802 KB (236 KB gzip) JavaScript file. There is no `manualChunks` configuration in `vite.config.ts`. While Vite automatically splits lazy-loaded pages, all vendor libraries land in the main chunk.

**Where:** `vite.config.ts` — no `build.rollupOptions.output.manualChunks` configured.

**Why it's slow:** The browser must download, parse, and execute this entire 802 KB chunk before rendering anything — including libraries that may not be needed on the current page (e.g. Recharts, react-markdown, DOMPurify). On a 3G connection or low-end device, this adds significant time-to-interactive.

**Recommended fix:** Add `manualChunks` to `vite.config.ts`:
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-supabase': ['@supabase/supabase-js'],
        'vendor-query': ['@tanstack/react-query'],
        'vendor-radix': [/* list radix packages */],
        'vendor-recharts': ['recharts'],
        'vendor-markdown': ['react-markdown', 'dompurify'],
      }
    }
  }
}
```
This splits the vendor chunk so pages only load what they need. Recharts (used only in reports) and react-markdown (used only in content detail) would load on-demand.

---

### Finding 4: `useMasterSearch` Queries 7 Tables With No Limits

**Severity:** High
**Category:** Data Fetching
**Estimated Impact:** 500-2000ms per search, potential for thousands of records

**What:** The master search hook fires 7 sequential Supabase queries (events, community_members, trade_investment_agencies, service_providers, innovation_ecosystem, lead_databases, content_items) with `select('*')` and no `.limit()` on any of them.

**Where:** `src/hooks/useMasterSearch.ts:18-255`

**Why it's slow:** Each table query returns *all* matching rows with *all* columns. The queries run sequentially (each `await` blocks the next). With 300ms debounce, a user typing "tech" could trigger searches returning hundreds of results across 7 tables, each with full row data including large text columns.

**Recommended fix:**
- Add `.limit(5)` or `.limit(10)` per table (users rarely need more than top results).
- Select only display columns: `.select('id, title, description, slug')` instead of `*`.
- Run all 7 queries in parallel with `Promise.all()` instead of sequential `await`.
- Consider a single Postgres function/view that searches across tables.

---

### Finding 5: `useEvents` Uses Raw useState/useEffect Instead of React Query

**Severity:** High
**Category:** Data Fetching / Caching
**Estimated Impact:** Re-fetches on every mount; no cache across navigations

**What:** The `useEvents` hook uses manual `useState` + `useEffect` + `useCallback` for data fetching instead of React Query. This means events data is re-fetched from Supabase on every navigation to the Events page, with no caching, no deduplication, and no stale-while-revalidate behaviour.

**Where:** `src/hooks/useEvents.ts:30-138`

**Why it's slow:** When a user navigates to Events → clicks an event → navigates back to Events, the entire events list is re-fetched from scratch. With React Query, the cached data would display instantly while revalidating in the background (stale-while-revalidate). The manual approach also lacks automatic retry, background refetching, and garbage collection.

**Recommended fix:** Refactor to use `useQuery` with the existing debounced search pattern:
```typescript
export const useEvents = (searchQuery?: string) => {
  const debouncedQuery = useDebounce(searchQuery, 300);
  return useQuery({
    queryKey: ['events', debouncedQuery],
    queryFn: async () => { /* existing fetch logic */ },
  });
};
```

---

### Finding 6: Sequential Queries Inside Content/CaseStudy Detail Hooks

**Severity:** High
**Category:** Data Fetching / Network Waterfall
**Estimated Impact:** 300-600ms added latency per detail page load

**What:** `useContentItem` chains 3 sequential Supabase queries: fetch content_item → fetch content_sections → fetch content_bodies. Each query waits for the previous one to get IDs for its filter.

**Where:**
- `src/hooks/useContent.ts:48-98` — 3 sequential queries
- `src/hooks/useCaseStudies.ts` — similar sequential pattern

**Why it's slow:** From `useContent.ts`:
```typescript
// Query 1: Get content item
const { data: contentItem } = await supabase.from('content_items').select('*...').single();
// Query 2: Get sections (needs contentItem.id)
const { data: sections } = await supabase.from('content_sections').select('*').eq('content_id', contentItem.id);
// Query 3: Get bodies (needs section IDs)
const { data: bodies } = await supabase.from('content_bodies').select('*').or(`content_id.eq.${contentItem.id},section_id.in.(...)`);
```
3 round-trips at ~200ms each = 600ms waterfall.

**Recommended fix:**
- Use Supabase's nested select to fetch in a single query:
  ```typescript
  supabase.from('content_items').select(`*, content_sections(*, content_bodies(*))`)
  ```
- If the nested select doesn't work due to the `or` condition on bodies, at least run queries 2 and 3 in parallel with `Promise.all()` after query 1.

---

### Finding 7: AuthContext Value Not Memoised

**Severity:** Medium
**Category:** Re-rendering
**Estimated Impact:** Unnecessary re-renders of all auth consumers on any state change

**What:** `AuthProvider` passes `useAuthState()` return value directly as context value without `useMemo`. Since `useAuthState` returns a new object on every render, all components using `useAuthContext()` re-render whenever *any* auth state changes.

**Where:**
- `src/contexts/AuthContext.tsx:29` — `<AuthContext.Provider value={authState}>`
- `src/hooks/auth/useAuthState.ts:79-87` — returns new object literal each render

**Why it's slow:** Every component that calls `useAuth()` (Navigation, AuthButton, ProtectedRoute, LeadGenPopupProvider, page components checking user state) re-renders when loading transitions, profile updates, or role changes occur — even if that component only cares about `user`.

**Recommended fix:** Wrap the context value in `useMemo`:
```typescript
const value = useMemo(() => ({
  user, profile, roles, session, loading, setProfile, setLoading
}), [user, profile, roles, session, loading]);
```

---

### Finding 8: Zero `loading="lazy"` on Images

**Severity:** Medium
**Category:** Images / Assets
**Estimated Impact:** Unnecessary image downloads on initial page load

**What:** A codebase-wide grep for `loading="lazy"` returns **zero results**. All `<img>` tags load eagerly, meaning below-the-fold images (card logos, avatars, thumbnails) are downloaded immediately on page load, competing with critical resources.

**Where:** Every component rendering images:
- `src/components/mentors/MentorCard.tsx` — mentor logos/avatars
- `src/components/investors/InvestorCard.tsx` — investor logos
- `src/components/featured-items/FeaturedItemCard.tsx` — item logos
- `src/components/service-provider-profile/ServiceProviderProfileHero.tsx` — cover images
- All other card/list components with images

**Recommended fix:** Add `loading="lazy"` to all `<img>` tags except above-the-fold hero images. This is a native browser feature with zero JS overhead.

---

### Finding 9: 1,475 KB Unoptimised Logo PNG

**Severity:** Medium
**Category:** Images / Assets

**What:** The main logo file `market-entry-secrets-logo-CoR9-Z_k.png` is **1,475 KB** — nearly 1.5 MB for a single logo image that's included in the build output.

**Where:** `dist/assets/market-entry-secrets-logo-CoR9-Z_k.png`

**Recommended fix:** Convert to WebP/AVIF (typically 60-80% smaller), or optimise the PNG with tools like `pngquant`/`optipng`. A logo should be < 50 KB.

---

### Finding 10: No `React.memo` on List Card Components

**Severity:** Medium
**Category:** Re-rendering

**What:** Card components rendered in lists (MentorCard, EventCard, InvestorCard, FeaturedItemCard) are not wrapped in `React.memo`. When parent list state changes (pagination, filters), all visible cards re-render even if their props haven't changed.

**Where:** All card components in `src/components/mentors/`, `src/components/investors/`, `src/components/featured-items/`, etc.

**Recommended fix:** Wrap list card components in `React.memo()`. Ensure callback props passed to them are wrapped in `useCallback` in the parent.

---

### Finding 11: Missing `useMemo` for Derived Filter Values

**Severity:** Low
**Category:** Re-rendering

**What:** Several listing pages compute derived values (unique categories, types, locations, sorted/filtered arrays) on every render without `useMemo`.

**Where:**
- `src/pages/Events.tsx` — computes unique categories, types, locations, sectors from full event list on every render
- `src/pages/Leads.tsx` — computes unique types, locations, sorted leads on every render
- `src/pages/MentorsDirectory.tsx` — computes filtered/paginated mentors on every render

**Recommended fix:** Wrap derived computations in `useMemo` with appropriate dependency arrays.

---

### Finding 12: No Differentiated `staleTime` for Queries

**Severity:** Low
**Category:** Data Fetching / Caching

**What:** All queries use the global default `staleTime: 5 * 60 * 1000` (5 minutes) from `src/App.tsx:71`. Static reference data (sectors, locations, countries) changes rarely and could use 30+ minute staleTime, while dynamic data (events) might need shorter windows.

**Where:** `src/App.tsx:68-75` — global QueryClient config. No individual hooks override staleTime.

**Recommended fix:** Set longer staleTime for taxonomy/reference data:
- Sectors, Locations, Countries: 30 minutes
- Service providers, Innovation ecosystem, Trade agencies: 15 minutes
- Events, Content: 5 minutes (keep default)
- User-specific data (bookmarks, reports): 1 minute

---

### Finding 13: Navigation Re-renders on Every Route Change

**Severity:** Low
**Category:** Re-rendering

**What:** Navigation components (`DesktopNavigation`, `MobileNavigation`) use `useLocation()` and `useAuth()`, causing re-renders on every route change. The nav item lists are `.map()`-ed on every render without memoisation.

**Where:**
- `src/components/navigation/DesktopNavigation.tsx:14-15` — `useLocation()` + `useAuth()`
- `src/components/navigation/MobileNavigation.tsx:15-21` — same

**Recommended fix:** Wrap navigation components in `React.memo` and memoise the rendered nav item lists. The `isActivePath` computation is trivial, but the full re-render of all nav items is wasteful.

---

## Route Map — Queries Fired Per Page

| Route | Page Component | Queries on Mount | Key Issues |
|-------|---------------|-----------------|------------|
| `/` | `Index` (eager) | 0 (static sections, SearchSection uses `useMasterSearch` on user input only) | None — landing page is static |
| `/service-providers` | `ServiceProviders` | 1 (useServiceProviders) | Uses React Query, acceptable |
| `/service-providers/:slug` | `ServiceProviderPage` | 1-2 (provider detail + related) | Acceptable |
| `/events` | `Events` | 1 (useEvents — raw useEffect, NOT React Query) | **Finding 5**: No caching |
| `/events/:slug` | `EventDetailPage` | 1-2 | Acceptable |
| `/mentors` | `MentorsDirectory` | 2-3 (useCommunityMembers + categories) | No `.limit()` on members |
| `/mentors/:cat/:slug` | `MentorProfile` | 1-2 | Acceptable |
| `/content` | `Content` | 1 (useContentItems) | Uses React Query, acceptable |
| `/content/:slug` | `ContentDetail` | 1 (useContentItem — 3 sequential sub-queries) | **Finding 6**: Waterfall |
| `/leads` | `Leads` | 1-2 | Has pagination, acceptable |
| `/leads/:slug` | `LeadDatabaseDetailPage` | 1-2 | Acceptable |
| `/locations` | `Locations` | 1 (useLocations — no limit) | Minor: no limit |
| `/locations/:slug` | `LocationPage` | **8** (useLocationBySlug + 7 sub-hooks) | **Finding 1+2**: Waterfall + full-table |
| `/countries` | `Countries` | 1 (useCountries — no limit) | Minor: no limit |
| `/countries/:slug` | `CountryPage` | **6+** (useCountryBySlug + 5+ sub-hooks) | **Finding 1+2**: Waterfall + full-table |
| `/sectors` | `Sectors` | 1 (useSectors — no limit) | Minor: no limit |
| `/sectors/:slug` | `SectorPage` | **9** (useSectorBySlug + 8 sub-hooks) | **Finding 1+2**: Waterfall + full-table |
| `/innovation-ecosystem` | `InnovationEcosystem` | 1 (no limit) | Minor: no limit |
| `/innovation-ecosystem/:slug` | `InnovationOrgPage` | 1-2 | Acceptable |
| `/investors` | `Investors` | 1 (no limit) | Minor: no limit |
| `/investors/:slug` | `InvestorPage` | 1-2 | Acceptable |
| `/government-support` | `TradeInvestmentAgencies` | 1 (no limit) | Minor: no limit |
| `/government-support/:slug` | `AgencyDetailPage` | 1-2 | Acceptable |
| `/case-studies` | `CaseStudies` | 1 (useCaseStudies) | Acceptable |
| `/case-studies/:slug` | `CaseStudyDetail` | 1 (sequential sub-queries) | **Finding 6**: Waterfall |
| `/pricing` | `Pricing` | 0-1 (useSubscription) | Acceptable |
| `/report-creator` | `ReportCreator` | 0-1 (localStorage + auth) | Acceptable |
| `/report/:id` | `ReportView` | 2 (fetchReport — sequential metadata + RPC) | Minor waterfall |
| `/report/shared/:token` | `SharedReportView` | 1 | Acceptable |
| `/my-reports` | `MyReports` | 1 | Acceptable |
| `/dashboard`, `/member-hub` | `MemberHub` | 2-3 (bookmarks + subscription) | Acceptable |
| `/bookmarks` | `Bookmarks` | 1 (fetchBookmarks — useEffect) | No React Query |
| `/mentor-connections` | `MentorConnections` | 1 | Acceptable |
| `/about` | `About` | 0 | Static |
| `/faq` | `FAQ` | 0 | Static |
| `/contact` | `Contact` | 0 | Static |
| `/privacy` | `PrivacyPolicy` | 0 | Static |
| `/terms` | `TermsOfService` | 0 | Static |
| `/partner` | `PartnerWithUs` | 0 | Static |
| `/admin/submissions` | `AdminSubmissions` | 1 | Acceptable |
| `/auth/callback` | `AuthCallback` | 0 (auth redirect handler) | N/A |
| `/reset-password` | `ResetPassword` | 0 | N/A |

**Worst offenders:** SectorPage (9 queries, waterfall), LocationPage (8 queries, waterfall), CountryPage (6+ queries, waterfall).

---

## Routing & Code Splitting Status

**Status: GOOD — route-level code splitting is implemented.**

- `src/App.tsx:15-60`: 2 eagerly-loaded pages (Index, NotFound), 41 lazy-loaded via `React.lazy()`.
- Single `<Suspense>` boundary at `App.tsx:90` with spinner fallback.
- Layout component (`src/components/Layout.tsx`) is stable — Navigation and Footer do NOT re-mount on navigation.
- `ScrollToTop` (`src/components/ScrollToTop.tsx`) fires `window.scrollTo(0,0)` on every pathname change — minimal overhead.

**Gap:** No `manualChunks` in `vite.config.ts` — only default splitting for lazy routes. Vendor libs all in one chunk (Finding 3).

---

## React Query Configuration

**File:** `src/App.tsx:68-75`
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes — reasonable
      refetchOnWindowFocus: false,      // Good — prevents tab-switch refetches
    },
  },
});
```

**Assessment:** The global config is acceptable. `gcTime` (formerly `cacheTime`) defaults to 5 minutes, which is fine. The main issue is not the config but rather that some hooks bypass React Query entirely (Finding 5) and none override staleTime for their specific data volatility (Finding 12).

---

## Auth Architecture Assessment

**File:** `src/hooks/auth/useAuthState.ts`

**Assessment:** Auth is well-implemented with duplicate-fetch protection via refs. Key points:
- `getSession()` runs once on mount (not per page).
- `onAuthStateChange` listener is persistent (not per-route).
- Auth state is lifted to context (not re-derived per page).
- `fetchUserData()` uses microtask deferral to avoid Supabase auth callback deadlock.

**Issue:** The AuthContext value is not memoised (Finding 7), causing unnecessary re-renders downstream. Auth itself is NOT a primary cause of slow transitions — it initialises once and stays stable.

---

## Provider Tree

```
QueryClientProvider           ← React Query cache
  HelmetProvider              ← SEO meta tags
    TooltipProvider           ← shadcn tooltips
      AuthProvider            ← Auth state (Finding 7: unmemoised value)
        PersonaProvider       ← User persona filter
          LeadGenPopupProvider ← 15s popup for anonymous users
            Toaster + Sonner  ← Toast notifications
            BrowserRouter
              ScrollToTop
              ErrorBoundary
                Layout (Navigation + Footer)
                  Suspense (PageLoader fallback)
                    Routes
```

**Assessment:** 7 provider layers is standard for this app size. No provider performs heavy computation on every render. The main issue is AuthProvider's unmemoised value (Finding 7). PersonaProvider uses `useCallback` for its setter (good). LeadGenPopupProvider has a minor timing issue where it may show popup before auth settles, but this doesn't affect page transition speed.

---

## Dependency Analysis

**Status: GOOD — no problematic full-library imports.**

- **lucide-react**: All imports are granular named imports (e.g. `import { Eye } from 'lucide-react'`) — tree-shakes correctly.
- **@radix-ui**: 29 individual packages imported as `import * as Primitive from "@radix-ui/react-*"` in shadcn/ui wrappers — this is the standard pattern.
- **date-fns** used instead of moment.js — good.
- **No lodash** in dependencies.
- **recharts**: Only used in ReportKeyMetrics component — already in its own chunk (163 KB). Could be further isolated with manualChunks.
- **No bundle analysis tooling** configured (no rollup-plugin-visualizer).

---

## Quick Wins (< 30 mins each)

| # | Fix | Finding | Impact |
|---|-----|---------|--------|
| 1 | Add `manualChunks` to `vite.config.ts` to split vendor bundle | F3 | Reduces initial parse time |
| 2 | Add `.limit(10)` per table in `useMasterSearch` | F4 | Massive reduction in search payload |
| 3 | Run `useMasterSearch` queries in `Promise.all()` instead of sequential | F4 | ~6x faster search |
| 4 | Wrap AuthContext value in `useMemo` | F7 | Eliminates unnecessary re-renders |
| 5 | Add `loading="lazy"` to all `<img>` tags (except hero) | F8 | Reduces initial page load bandwidth |
| 6 | Optimise/convert 1.5 MB logo to WebP | F9 | ~1.3 MB savings |
| 7 | Wrap MentorCard, EventCard, InvestorCard in `React.memo` | F10 | Reduces list re-renders |
| 8 | Add `useMemo` for derived filter arrays in listing pages | F11 | Minor re-render reduction |
| 9 | Set longer `staleTime` on taxonomy hooks (sectors, locations, countries) | F12 | Fewer refetches on revisit |

## Medium Effort (1-3 hours each)

| # | Fix | Finding | Impact |
|---|-----|---------|--------|
| 1 | Refactor `useEvents` to use React Query | F5 | Instant cache-hit on revisit |
| 2 | Refactor `useContentItem` to use nested Supabase select or `Promise.all()` | F6 | ~400ms savings per content detail page |
| 3 | Move sector/location/country keyword filtering to server-side `.or().ilike()` | F2 | Massive payload reduction |
| 4 | Add column-specific `.select()` instead of `*` on all listing hooks | F2 | 30-70% payload reduction per query |
| 5 | Add `.limit()` and server-side pagination to listing hooks | F2 | Bounded response sizes |

## Architectural Changes (require design decisions)

| # | Fix | Finding | Impact |
|---|-----|---------|--------|
| 1 | Refactor Sector/Location/Country page data loading to eliminate waterfall — either pass config down or use `useQueries()` with parallel fetching | F1 | 800-1500ms savings on worst pages |
| 2 | Create Postgres functions for sector/location/country filtered queries (single RPC call returning all entity types for a given sector) | F1+F2 | Single round-trip replaces 8 queries |
| 3 | Implement prefetching for likely navigation targets (e.g. prefetch sector data on hover over sector links) | All | Near-instant page transitions |

---

*End of audit. No code changes were made.*

