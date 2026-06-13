# MES Platform Audit Report — Part 3: Dashboards & Reference Tables

---

## 7. Page-by-Page Data Loading Summary

| Page/Route | Data Sources | Query Method | Issues Found | Performance Risk |
|------------|-------------|--------------|--------------|-----------------|
| `/` (Index) | `useHeroStats`, `useFeaturedItems`, `useTestimonials` | useQuery | Hero stats make 7 COUNT queries in parallel — OK for now | Low |
| `/service-providers` | `useServiceProviders` + context provider | useQuery | Full table load, client-side sector/service derivation | Medium |
| `/service-providers/:slug` | `useServiceProviderBySlug` | useQuery | 2 sequential queries (provider + category) — N+1 | Low |
| `/events` | `useEvents` | useQuery | Full table load, client-side filter derivation every render | Medium |
| `/events/:slug` | `useEventBySlug` | useQuery | Single query — OK | Low |
| `/mentors` | `useMentors` | useQuery | Full table load, complex client-side filtering | Medium |
| `/mentors/:cat/:slug` | `useMentors` (filtered) | useQuery | Loads ALL mentors to find one by slug | High |
| `/content` | `useContentItems` + `useContentCategories` + `useAttachmentCounts` | useQuery | Passes ALL content IDs to attachment query | Medium |
| `/content/:slug` | `useContentItem` | useQuery | 3 sequential queries (item → sections → bodies) | Medium |
| `/case-studies` | `useCaseStudies` | useQuery | Full table load with nested joins | Medium |
| `/case-studies/:slug` | `useCaseStudy` + `useRelatedCaseStudies` | useQuery | 3 sequential queries + dependent related query | Medium |
| `/leads` | `useLeadDatabases` + `useLeadDatabaseStats` | useQuery | 2 separate queries that could be 1 | Low |
| `/leads/:slug` | `useLeadDatabaseBySlug` + `useLeadDatabaseRecords` | useQuery | OK — records limited to 5 | Low |
| `/locations` | `useLocations` | useQuery | Full table load — acceptable (small table) | Low |
| `/locations/:slug` | `useLocation*` (6 hooks) | useQuery | Each sub-hook loads ENTIRE parent table, filters client-side | **High** |
| `/countries` | `useCountries` | useQuery | Full table load — acceptable (small table) | Low |
| `/countries/:slug` | `useCountry*` (6 hooks) | useQuery | Each sub-hook loads ENTIRE parent table, filters client-side | **High** |
| `/sectors` | `useSectors` | useQuery | Full table load — acceptable (small table) | Low |
| `/sectors/:slug` | `useSector*` hooks | useQuery | Each sub-hook loads ENTIRE parent table, filters client-side | **High** |
| `/investors` | `useInvestors` | useQuery | Full table load, no limit | Medium |
| `/investors/:slug` | `useInvestorBySlug` | useQuery | Single query — OK | Low |
| `/innovation-ecosystem` | `useInnovationEcosystem` | useQuery | Full table load, client-side filter derivation | Medium |
| `/innovation-ecosystem/:slug` | `useInnovationOrgBySlug` | useQuery | Single query — OK | Low |
| `/government-support` | `useTradeAgencies` | useQuery | Full table load | Medium |
| `/government-support/:slug` | `useTradeAgencyBySlug` + `useRelatedAgencies` | useQuery | Fallback query pattern (tries view then table) | Low |
| `/pricing` | None (static + `useSubscription`) | useState | Manual state management for subscription | Low |
| `/report-creator` | `useReportGeneration` | useState + edge fn | Form state in React Hook Form — OK | Low |
| `/report/:id` | `useReport` + `useSubscription` | useQuery + useState | Manual polling for Stripe webhook sync | Low |
| `/report/shared/:token` | `useSharedReport` | useQuery | OK — single query with share_token | Low |
| `/my-reports` | `useMyReports` | useQuery | No pagination, loads ALL reports | Medium |
| `/member-hub` | `useSubscription` + `useMyReports` + `useBookmarks` | Mixed | Bookmarks use manual state, not React Query | Medium |
| `/bookmarks` | `useBookmarks` | useState | Manual state, full refetch on every mutation | Medium |
| `/mentor-connections` | `useMentorConnections` | useQuery | OK | Low |
| `/admin/submissions` | `useAdminSubmissions` | useQuery | OK — admin only, lower traffic | Low |

**Worst offenders:** Location/Country/Sector detail pages. Each loads 4-6 full tables (events, content, members, leads, service providers, agencies) then filters client-side. A single country page triggers ~6 full table loads.

---

## 8. Edge Function Health Dashboard

| Function | JWT Verified | Error Handling | External Deps | Rate Limited | Issues |
|----------|:----------:|:-----------:|:------------:|:-----------:|--------|
| `ai-chat` | ✅ Gateway | ✅ Good | Supabase only | ❌ | None |
| `classify-personas` | ✅ Gateway | ✅ Good | Anthropic | ❌ | Processes up to 20 records, no limit |
| `create-checkout` | ✅ Gateway | ✅ Good | Stripe | ❌ | Unvalidated metadata spread (low risk) |
| `enrich-content` | ✅ Gateway | ⚠️ Continues on error | Firecrawl, Lovable AI | ❌ | AI prompt injection risk |
| `enrich-innovation-ecosystem` | ✅ Gateway | ⚠️ Continues on error | Firecrawl, Lovable AI | ❌ | AI prompt injection risk, 50-record batch |
| `enrich-investors` | ✅ Gateway | ⚠️ Continues on error | Firecrawl, Lovable AI | ❌ | AI prompt injection risk |
| `firecrawl-map` | ✅ Gateway | ⚠️ Leaks API errors | Firecrawl | ❌ | Error details exposed to client |
| `firecrawl-scrape` | ✅ Gateway | ⚠️ Leaks API errors | Firecrawl | ❌ | Error details exposed to client |
| `firecrawl-search` | ✅ Gateway | ⚠️ Leaks API errors | Firecrawl | ❌ | Error details exposed to client |
| `generate-plan` | ✅ Gateway | ✅ Good | Anthropic | ❌ | None significant |
| `generate-report` | ❌ Custom auth | ✅ Good | Anthropic, Perplexity, Firecrawl, Lovable AI | ❌ | **CRITICAL:** verify_jwt=false, SQL filter injection risk |
| `send-lead-followup` | ✅ Gateway | ✅ Good | None (stub) | ❌ | **CRITICAL:** Never sends emails |
| `stripe-webhook` | ❌ Stripe sig | ✅ Good | Stripe | ❌ | Reports tier update can fail silently |
| `sync-lemlist` | ✅ Gateway + admin | ✅ Good | Lemlist | ❌ | None |

---

## 9. Route & Navigation Health

| Check | Status | Details |
|-------|--------|---------|
| Dead routes | ✅ None | All 42 route imports resolve to valid components |
| Orphaned pages | ⚠️ 1 found | `Community.tsx` exists but route redirects to `/mentors` |
| Nav link validity | ✅ All valid | All desktop, mobile, and footer links point to valid routes |
| Auth protection | ⚠️ Gaps | 5 pages use ProtectedRoute; ReportView should but doesn't |
| Redirects | ✅ Clean | 3 redirects: `/community`→`/mentors`, `/trade-investment-agencies`→`/government-support`, `/planner`→`/report-creator` |
| 404 handling | ✅ Present | Catch-all `*` route renders NotFound component |
| Lazy loading | ✅ Good | All non-landing pages use `React.lazy()` |

---

## 10. Security Summary

| Area | Status | Notes |
|------|--------|-------|
| Supabase RLS | ⚠️ Mixed | Sensitive tables protected, but `events` has open UPDATE/DELETE, `user_usage` leaks all records, 3 tables lack RLS entirely |
| Edge function auth | ⚠️ Gap | `generate-report` has `verify_jwt=false` |
| Stripe webhook | ✅ Good | Proper signature verification |
| CORS | ✅ Good | Allowlist-based with regex for preview domains |
| SSRF protection | ✅ Excellent | `isPrivateOrReservedUrl()` blocks private IPs, metadata endpoints |
| XSS prevention | ✅ Good | `dompurify` for HTML, `escapeHtml` in email templates |
| SQL injection | ⚠️ Risk | String concatenation in `.or()` filter building |
| API key exposure | ✅ OK | All in Supabase secrets, none in frontend code |
| Frontend secrets | ✅ Clean | Only Supabase anon key (public by design) in `.env` |
| VITE_ env vars | ⚠️ Minor | Exist in `.env` despite CLAUDE.md saying they're unsupported |

---

## 11. RLS Policy Coverage (from migrations)

| Table | RLS Enabled | Policies | Notes |
|-------|:---------:|----------|-------|
| `profiles` | ✅ | Own profile SELECT/UPDATE/INSERT, admin SELECT | Good |
| `user_roles` | ✅ | Own roles SELECT, admin ALL | Good |
| `user_subscriptions` | ✅ | Own SELECT/UPDATE | Good |
| `user_usage` | ✅ | Public INSERT, public SELECT | **HIGH:** SELECT uses `USING (true)` — leaks all users' data |
| `events` | ✅ | Public SELECT, auth UPDATE/DELETE | **HIGH:** Any auth user can UPDATE/DELETE any event |
| `bookmarks` | ✅ | Own bookmarks | Good |
| `user_reports` | ✅ | Owner SELECT + shared via share_token | Good |
| `ai_chat_conversations` | ✅ | Own CRUD | Good |
| `ai_chat_messages` | ✅ | Own via conversation ownership | Good |
| `email_leads` | ✅ | Admin-only SELECT | Good |
| `lemlist_contacts` | ✅ | Admin-only SELECT | Good |
| `lemlist_companies` | ✅ | Admin-only SELECT | Good |
| `lead_submissions` | ✅ | Public INSERT, admin SELECT | Good |
| `directory_submissions` | ✅ | Public INSERT, admin SELECT, own SELECT | Good |
| `payment_webhook_logs` | ✅ | Admin SELECT, system INSERT | Good |
| `lead_databases` | ✅ | Public SELECT, admin ALL | Good |
| `lead_database_records` | ✅ | Preview SELECT, admin ALL, buyer SELECT | Good |
| `lead_database_purchases` | ✅ | Own SELECT, admin ALL | Good |
| `service_provider_reviews` | ✅ | Approved SELECT, admin ALL | Good |
| `service_provider_contacts` | ✅ | Public SELECT, admin ALL | Good |
| `leads` (old table) | ✅ | Public SELECT, authenticated ALL | ⚠️ Authenticated ALL is too broad |
| `locations` | ❌ **No RLS** | None | ⚠️ Public reference data but should enable RLS for best practice |
| `countries` | ❌ **No RLS** | None | ⚠️ Same as locations |
| `industry_sectors` | ❌ **No RLS** | None | ⚠️ Public reference data |
| Directory tables (service_providers, innovation_ecosystem, etc.) | Varies | Likely public SELECT | Need live DB inspection to confirm |

---

## 12. Dependency Analysis

### Frontend Dependencies of Note

| Package | Version | Used? | Notes |
|---------|---------|:-----:|-------|
| `stripe` | ^18.4.0 | ❌ | **REMOVE** — server-side only, never imported in src/ |
| `std` | ^0.1.40 | ❌ | **REMOVE** — never imported in src/ |
| `next-themes` | ^0.3.0 | ? | Dark mode support — verify if actually used |
| `react-resizable-panels` | ^2.1.3 | ? | Verify usage |
| `recharts` | ^2.12.7 | ? | Charts — likely used in reports/dashboard |
| `dompurify` | ^3.3.1 | ✅ | HTML sanitization — correctly typed |
| `react-markdown` | ^10.1.0 | ✅ | Report content rendering |

### Edge Function Dependencies

All edge functions use `esm.sh` CDN imports — no SRI/checksum verification. Versions are pinned (`@supabase/supabase-js@2`, `stripe@12`) which is good practice.

---

## 13. Recommended Priority Fix Order

### Week 1: Security & Data

1. **Fix events table RLS** — restrict UPDATE/DELETE to admin role (0.5 hour)
2. **Fix user_usage SELECT policy** — scope to own records (0.5 hour)
3. Add rate limiting to `generate-report`, `classify-personas`, `generate-plan` (1 day)
4. Fix SQL filter injection in `generate-report` — use parameterized queries (0.5 day)
5. Add `.limit()` to all unbounded hooks (0.5 day)
4. Move client-side filtering to database queries in country/location/sector hooks (2 days)
5. Add `ProtectedRoute` to ReportView (0.5 hour)

### Week 2: Functionality & Cleanup

6. Integrate email service in `send-lead-followup` (0.5 day)
7. Migrate `useBookmarks` and `useSubscription` to React Query (1 day)
8. Remove unused dependencies (`stripe`, `std`) (0.5 hour)
9. Delete orphaned `Community.tsx` (5 minutes)
10. Replace hardcoded domain URLs with `window.location.origin` (0.5 day)
11. Strip `console.log` statements (0.5 day)
12. Parallelize sequential content queries with `Promise.all()` (0.5 day)

---

*End of Audit Report*
