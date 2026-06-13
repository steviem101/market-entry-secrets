# MES Entity Architecture & Frontend Consistency Audit

## Renovation Report — March 2026

---

## Executive Summary

**Overall Platform Health Score: 6.5/10**

The MES platform has a solid foundation with 42 database tables, 47 routes, 409 TypeScript files, and 18 edge functions. However, significant inconsistencies exist across entity types in URL patterns, filtering, pagination, detail page depth, SEO, and component reuse. The platform feels like multiple products stitched together rather than one cohesive intelligence platform.

### Top 5 Critical Issues
1. **Missing slug columns** on 5 major entity tables (service_providers, community_members, innovation_ecosystem, investors, country_trade_organizations) — forces UUID URLs or fragile workarounds
2. **No pagination** on any listing page — all load entire datasets client-side, will break at scale
3. **Inconsistent detail page depth** — Service Providers and Mentors are rich; Innovation Ecosystem and Investors are bare
4. **No JSON-LD** on any entity detail page — only homepage has structured data
5. **No URL-persisted filters** (except Content type param) — filters reset on navigation, links not shareable

### Top 5 Quick Wins
1. Add slug columns + generation to 5 missing tables (DB migration + backfill)
2. Create shared `EntityBreadcrumb` component and apply to all pages missing breadcrumbs
3. Add `<Helmet>` SEO tags to Location, Country, Sector detail pages (currently missing)
4. Standardize empty states across all listing pages (reusable component)
5. Add URL query param persistence to all filter bars

### Estimated Total Renovation Scope: **LARGE** (8-12 weeks for full consistency)

---

## Phase 1: Database Entity Inventory

### 1.1 Complete Table Inventory (42 Tables)

#### PRIMARY ENTITIES (User-facing, need listing + detail pages)

| # | Entity | Table | Approx Rows | Slug Column | Detail Page | URL Pattern |
|---|--------|-------|-------------|-------------|-------------|-------------|
| 1 | Service Providers | `service_providers` | ~120 | **MISSING** | YES | `/service-providers/:providerSlug` (uses separate lookup) |
| 2 | Community Members / Mentors | `community_members` | ~200 | **MISSING** | YES | `/mentors/:categorySlug/:mentorSlug` |
| 3 | Events | `events` | ~340 | `slug` | YES | `/events/:eventSlug` |
| 4 | Trade & Investment Agencies | `trade_investment_agencies` | ~50 | `slug` (nullable) | YES | `/government-support/:slug` |
| 5 | Innovation Ecosystem | `innovation_ecosystem` | ~30 | **MISSING** | YES | `/innovation-ecosystem/:orgId` (UUID!) |
| 6 | Investors | `investors` | ~50 | **MISSING** | YES | `/investors/:investorId` (UUID!) |
| 7 | Lead Databases | `lead_databases` | ~20 | `slug` | YES | `/leads/:slug` |
| 8 | Content Items | `content_items` | ~50 | `slug` | YES | `/content/:slug` |
| 9 | Locations | `locations` | ~30 | `slug` | YES | `/locations/:locationSlug` |
| 10 | Countries | `countries` | ~20 | `slug` | YES | `/countries/:countrySlug` |
| 11 | Industry Sectors | `industry_sectors` | ~15 | `slug` | YES | `/sectors/:sectorSlug` |
| 12 | Country Trade Orgs | `country_trade_organizations` | ~20 | **MISSING** | NO | N/A |
| 13 | Leads (Legacy) | `leads` | ~100 | **MISSING** | NO (superseded by lead_databases) | N/A |

#### SUPPORTING TABLES (No direct user-facing pages needed)

| Table | Purpose |
|-------|---------|
| `agency_contacts` | Contact persons for trade agencies |
| `agency_resources` | Resources/grants for trade agencies |
| `ai_chat_conversations` | AI chat session storage |
| `ai_chat_messages` | AI chat message history |
| `bookmarks` | User bookmark records |
| `content_bodies` | Rich text content for articles |
| `content_categories` | Content taxonomy |
| `content_company_profiles` | Company data for case studies |
| `content_founders` | Founder profiles for case studies |
| `content_sections` | Article section structure |
| `directory_submissions` | User-submitted directory entries |
| `email_leads` | Email capture records |
| `lead_database_records` | Individual records within lead databases |
| `lead_submissions` | Lead gen form submissions |
| `lemlist_companies` | CRM company sync |
| `lemlist_contacts` | CRM contact sync |
| `market_entry_reports` | Manual reports (legacy) |
| `organisation_categories` | Agency category taxonomy |
| `payment_webhook_logs` | Stripe webhook audit log |
| `profiles` | User profiles |
| `report_templates` | AI report prompt templates |
| `testimonials` | Homepage testimonials |
| `user_intake_forms` | Report wizard submissions (not in auto-types) |
| `user_reports` | Generated AI reports (not in auto-types) |
| `user_roles` | RBAC roles |
| `user_subscriptions` | Subscription tier tracking |
| `user_usage` | Freemium view tracking |

#### AMBIGUOUS / LEGACY TABLES

| Table | Issue |
|-------|-------|
| `Community` (capital C) | Legacy table with only `id` and `"First Name"` — likely superseded by `community_members` |
| `MES` | Legacy Notion sync table — contains Notion IDs and attrs JSON |
| `leads` | Superseded by `lead_databases` + `lead_database_records` — should be deprecated |

### 1.2 Entity Profiles

#### SERVICE PROVIDERS
```
TABLE: service_providers
SLUG COLUMN: MISSING (uses name-based lookup via separate service_provider_categories)
DISPLAY NAME: name
CORE FIELDS: name, location, description, services[], logo, website
RICH FIELDS: experience_tiles (jsonb), contact_persons (jsonb), basic_info, why_work_with_us
FILTERABLE: location (dropdown), services (multi-select), verified status (toggle)
SORTABLE: name (asc), featured status
RELATIONSHIPS: location_id → locations
MISSING COLUMNS: slug, is_featured, is_verified, view_count, sector_focus[], meta_title, meta_description
```

#### COMMUNITY MEMBERS / MENTORS
```
TABLE: community_members
SLUG COLUMN: MISSING (uses separate mentor lookup tables not in auto-types)
DISPLAY NAME: name
CORE FIELDS: name, title, company, location, description, specialties[]
RICH FIELDS: experience_tiles (jsonb), experience, origin_country, associated_countries[]
FILTERABLE: location (dropdown), specialties (multi-select), origin_country (dropdown)
SORTABLE: created_at (desc)
RELATIONSHIPS: location_id → locations
MISSING COLUMNS: slug, is_featured, is_verified, sector_focus[], availability, session_rate
NOTE: Additional tables (mentor_categories, mentor_experience_with, mentor_testimonials) exist but are NOT in auto-generated types
```

#### EVENTS
```
TABLE: events
SLUG COLUMN: slug ✅
DISPLAY NAME: title
CORE FIELDS: title, date, time, location, category, type, description
RICH FIELDS: organizer, organizer_email, website_url, registration_url, image_url, event_logo_url, tags[]
FILTERABLE: category (tabs), type (dropdown), location (dropdown), sector (dropdown), date (upcoming/past)
SORTABLE: date (asc)
RELATIONSHIPS: location_id → locations
MISSING COLUMNS: end_date, timezone, capacity, is_virtual, price_aud (numeric), latitude, longitude
```

#### TRADE & INVESTMENT AGENCIES
```
TABLE: trade_investment_agencies
SLUG COLUMN: slug ✅ (nullable — should be NOT NULL)
DISPLAY NAME: name
CORE FIELDS: name, location, description, services[], organisation_type, government_level
RICH FIELDS: agency_contacts (via junction), agency_resources (via junction), tagline, why_work_with_us
FILTERABLE: location (dropdown), sectors_supported (multi-select), organisation_type (dropdown), category_slug (dropdown), grants_available (toggle), is_government_funded (toggle)
SORTABLE: name (asc), is_featured
RELATIONSHIPS: location_id → locations, category_slug → organisation_categories, agency_contacts (1:many), agency_resources (1:many)
BEST SCHEMA: Most complete entity table — has meta_title, meta_description, is_verified, is_featured, is_active, view_count, multiple location fields
```

#### INNOVATION ECOSYSTEM
```
TABLE: innovation_ecosystem
SLUG COLUMN: MISSING
DISPLAY NAME: name
CORE FIELDS: name, location, description, services[], website, logo
RICH FIELDS: experience_tiles (jsonb), contact_persons (jsonb), basic_info, why_work_with_us
FILTERABLE: location (dropdown), services (multi-select)
SORTABLE: name (asc)
RELATIONSHIPS: location_id → locations
MISSING COLUMNS: slug, is_featured, is_verified, sector_focus[], type (incubator/accelerator/hub), view_count, meta_title, meta_description
```

#### INVESTORS
```
TABLE: investors
SLUG COLUMN: MISSING
DISPLAY NAME: name
CORE FIELDS: name, investor_type, location, description, check_size_min, check_size_max
RICH FIELDS: sector_focus[], stage_focus[], logo, linkedin_url, details (jsonb), why_work_with_us, basic_info
FILTERABLE: investor_type (dropdown), sector_focus (multi-select), stage_focus (multi-select), check_size (range)
SORTABLE: name (asc), is_featured
RELATIONSHIPS: None (no FK to locations — should have location_id)
MISSING COLUMNS: slug, location_id (FK), is_active, view_count, meta_title, meta_description, portfolio_companies (jsonb)
```

#### LEAD DATABASES
```
TABLE: lead_databases (NOT in auto-generated types — uses (supabase as any))
SLUG COLUMN: slug ✅
DISPLAY NAME: title
CORE FIELDS: title, short_description, sector, location, record_count, price_aud, is_free
RICH FIELDS: description, sample_fields[], tags[], provider_name, provider_logo_url, quality_score
FILTERABLE: sector (dropdown), location (dropdown), list_type (dropdown), is_free (toggle), price (range)
SORTABLE: created_at (desc), record_count (desc), price_aud (asc/desc)
RELATIONSHIPS: lead_database_records (1:many)
MISSING COLUMNS: is_active (uses status string), currency, update_frequency
```

#### LOCATIONS
```
TABLE: locations
SLUG COLUMN: slug ✅
DISPLAY NAME: name
CORE FIELDS: name, location_type, country, description, hero_title, hero_description
RICH FIELDS: key_industries[], economic_indicators (jsonb), population, business_environment_score, government_agency_*
FILTERABLE: country (dropdown), location_type (dropdown)
SORTABLE: sort_order (asc), name (asc)
RELATIONSHIPS: parent_location_id → locations (self-referential), service_providers (via location_id), events (via location_id)
```

#### COUNTRIES
```
TABLE: countries
SLUG COLUMN: slug ✅
DISPLAY NAME: name
CORE FIELDS: name, description, hero_title, hero_description, key_industries[]
RICH FIELDS: economic_indicators (jsonb), trade_relationship_strength, keyword arrays
FILTERABLE: trade_relationship_strength (dropdown)
SORTABLE: sort_order (asc), name (asc)
RELATIONSHIPS: country_trade_organizations (1:many via country_id)
```

#### INDUSTRY SECTORS
```
TABLE: industry_sectors
SLUG COLUMN: slug ✅
DISPLAY NAME: name
CORE FIELDS: name, description, hero_title, hero_description, industries[]
FILTERABLE: featured (toggle)
SORTABLE: sort_order (asc), name (asc)
RELATIONSHIPS: None (uses keyword matching, not FKs)
```

### 1.3 Cross-Entity Relationship Map

```
                        ┌─────────────┐
                        │  locations   │
                        │  (slug ✅)   │
                        └──────┬──────┘
                               │ location_id (FK)
          ┌────────────┬───────┼────────┬──────────────┐
          ▼            ▼       ▼        ▼              ▼
  ┌──────────────┐ ┌────────┐ ┌──────────┐ ┌──────────────────────┐ ┌────────────────────┐
  │service_      │ │events  │ │community_│ │trade_investment_     │ │innovation_         │
  │providers     │ │(slug✅)│ │members   │ │agencies (slug✅)     │ │ecosystem           │
  │(NO slug)     │ │        │ │(NO slug) │ │                      │ │(NO slug)           │
  └──────────────┘ └────────┘ └──────────┘ └──────────┬───────────┘ └────────────────────┘
                                                       │
                                            ┌──────────┼──────────┐
                                            ▼          ▼          ▼
                                    ┌──────────┐ ┌──────────┐ ┌───────────────┐
                                    │agency_   │ │agency_   │ │organisation_  │
                                    │contacts  │ │resources │ │categories     │
                                    └──────────┘ └──────────┘ │(slug✅)       │
                                                              └───────────────┘

  ┌─────────────┐       ┌──────────────────────────┐
  │  countries   │───────│country_trade_organizations│
  │  (slug ✅)   │ 1:N   │(NO slug)                  │
  └─────────────┘       └──────────────────────────┘

  ┌──────────────┐      ┌──────────────────┐
  │content_items │──────│content_sections   │──────│content_bodies│
  │(slug ✅)     │ 1:N  │(slug ✅)          │ 1:N  │              │
  └──────┬───────┘      └──────────────────┘      └──────────────┘
         │ 1:N
   ┌─────┼──────────────┐
   ▼                    ▼
  ┌─────────────────┐  ┌──────────────────┐
  │content_company_ │  │content_founders  │
  │profiles         │  │                  │
  └─────────────────┘  └──────────────────┘

  ┌──────────────┐      ┌─────────────────────┐
  │lead_databases │─────│lead_database_records │
  │(slug ✅)      │ 1:N │                      │
  └──────────────┘      └─────────────────────┘

  ┌──────────┐    (NO FK to locations — MISSING)
  │investors │
  │(NO slug) │
  └──────────┘

  ┌────────────────┐    (NO FK to anything — MISSING)
  │industry_sectors│
  │(slug ✅)        │
  └────────────────┘
```

#### MISSING RELATIONSHIPS (Should Exist)
1. `investors` → `locations` (FK location_id) — investors have text location but no FK
2. `service_providers` → `industry_sectors` (junction table or sector_focus[] with FK) — currently keyword matching only
3. `events` → `industry_sectors` (FK or junction) — currently string `sector` column
4. `community_members` → `industry_sectors` — no sector linkage at all
5. `innovation_ecosystem` → `industry_sectors` — no sector linkage
6. Cross-entity "featured on" relationship — no way to feature a provider on a location or sector page except via keyword matching

#### SHARED DIMENSIONS
All these entities share: **sector/industry**, **location**, **country** — but these are stored as TEXT strings or TEXT[] arrays, not as foreign keys to normalized tables. This means:
- No referential integrity
- Inconsistent naming (e.g., "Sydney" vs "Sydney, NSW" vs "Sydney, Australia")
- No guaranteed taxonomy consistency across entity types

---

## Phase 2: Frontend Current State Audit

### 2.1 Complete Route Inventory

| Route | Component | Type | Entity | Auth Required |
|-------|-----------|------|--------|---------------|
| `/` | `Index` | Landing | N/A | No |
| `/about` | `About` | Static | N/A | No |
| `/service-providers` | `ServiceProviders` | Listing | Service Providers | No |
| `/service-providers/:providerSlug` | `ServiceProviderPage` | Detail | Service Provider | No (freemium) |
| `/events` | `Events` | Listing | Events | No |
| `/events/:eventSlug` | `EventDetailPage` | Detail | Event | No (freemium) |
| `/community` | Redirect → `/mentors` | Redirect | — | — |
| `/mentors` | `MentorsDirectory` | Listing | Mentors | No |
| `/mentors/:categorySlug` | `MentorsDirectory` | Filtered Listing | Mentors | No |
| `/mentors/:categorySlug/:mentorSlug` | `MentorProfile` | Detail | Mentor | No |
| `/content` | `Content` | Listing | Content | No |
| `/content/:slug` | `ContentDetail` | Detail | Content Item | No |
| `/case-studies` | `CaseStudies` | Listing | Case Studies | No (freemium) |
| `/case-studies/:slug` | `CaseStudyDetail` | Detail | Case Study | No |
| `/leads` | `Leads` | Listing | Lead Databases | No |
| `/leads/:slug` | `LeadDatabaseDetailPage` | Detail | Lead Database | No |
| `/innovation-ecosystem` | `InnovationEcosystem` | Listing | Innovation Hubs | No |
| `/innovation-ecosystem/:orgId` | `InnovationOrgPage` | Detail | Innovation Org | No |
| `/investors` | `Investors` | Listing | Investors | No |
| `/investors/:investorId` | `InvestorPage` | Detail | Investor | No |
| `/government-support` | `TradeInvestmentAgencies` | Listing | Trade Agencies | No |
| `/government-support/:slug` | `AgencyDetailPage` | Detail | Trade Agency | No |
| `/trade-investment-agencies` | Redirect → `/government-support` | Redirect | — | — |
| `/locations` | `Locations` | Listing | Locations | No |
| `/locations/:locationSlug` | `LocationPage` | Detail | Location | No |
| `/countries` | `Countries` | Listing | Countries | No |
| `/countries/:countrySlug` | `CountryPage` | Detail | Country | No |
| `/sectors` | `Sectors` | Listing | Sectors | No |
| `/sectors/:sectorSlug` | `SectorPage` | Detail | Sector | No |
| `/contact` | `Contact` | Form | N/A | No |
| `/faq` | `FAQ` | Static | N/A | No |
| `/privacy` | `PrivacyPolicy` | Static | N/A | No |
| `/terms` | `TermsOfService` | Static | N/A | No |
| `/partner` | `PartnerWithUs` | Static | N/A | No |
| `/pricing` | `Pricing` | Marketing | N/A | No |
| `/dashboard` | `MemberHub` | Dashboard | N/A | Yes |
| `/member-hub` | `MemberHub` | Dashboard | N/A | Yes |
| `/bookmarks` | `Bookmarks` | Dashboard | N/A | Yes |
| `/mentor-connections` | `MentorConnections` | Dashboard | N/A | Yes |
| `/report-creator` | `ReportCreator` | Form/Wizard | N/A | No (auth at submit) |
| `/report/:reportId` | `ReportView` | Detail | Report | Yes |
| `/report/shared/:shareToken` | `SharedReportView` | Detail | Report | No |
| `/my-reports` | `MyReports` | Dashboard | N/A | Yes |
| `/reset-password` | `ResetPassword` | Auth | N/A | No |
| `/auth/callback` | `AuthCallback` | Auth | N/A | No |
| `*` | `NotFound` | 404 | N/A | No |

### 2.2 Inconsistency Matrix

| Feature | Providers | Mentors | Agencies | Events | Leads | Innovation | Investors | Locations | Countries | Sectors | Content | Case Studies |
|---------|-----------|---------|----------|--------|-------|------------|-----------|-----------|-----------|---------|---------|-------------|
| Has listing page | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Has detail page | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Uses slug URLs | P* | P* | Y | Y | Y | **N (UUID)** | **N (UUID)** | Y | Y | Y | Y | Y |
| Card grid layout | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | **N (list)** |
| Has search | Y | Y | N | Y | Y | Y | N | Y | Y | Y | Y | Y |
| Has filters | Y | Y | Y | Y | Y | Y | N | Y | N | N | Y | Y |
| Filter position | Top | Top | Top | Top+Tabs | Top | Top | — | Top | Top | Top | Top+Tabs | **Sidebar** |
| Has pagination | N | N | N | N | N | N | N | N | N | N | N | N |
| Has sort options | Y | N | N | N | Y | N | N | N | N | N | N | N |
| Has empty state | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Has loading state | Spinner | Spinner | Skeleton | Spinner | Skeleton | Skeleton | Skeleton | Skeleton | Skeleton | N | Spinner | Skeleton |
| Shows related items | Y | Y | Y | Y | Y | Y | Y | Y | N | Y (8 types!) | N | N |
| Has breadcrumbs | Y | Y | Y | Y | Y | Y | Y | **N** | **N** | **N** | **N** | **N** |
| Has Helmet meta | Y | Y | Y | Y | Y | Y | Y | **N** | **N** | **N** | P | P |
| Has JSON-LD | N | N | N | N | N | N | N | N | N | N | N | N |
| Mobile responsive | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Consistent card size | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | N (list) |
| Filter URL persist | N | N | N | N | N | N | N | N | N | N | **P** (type only) | N |
| Bookmark button | Y | Y | Y | Y | Y | Y | Y | N | N | N | N | N |
| Freemium gate | Y | Y | Y | Y | N | Y | N | N | N | N | N | Y |
| Auth-limited items | N | N | Y (3 max) | N | N | Y (3 max) | N | N | N | N | N | N |

*P = Partial — slug is generated via separate lookup tables, not stored directly on the entity

### 2.3 Key Inconsistencies Found

#### URL Architecture Inconsistencies
| Entity | Listing URL | Detail URL | Issue |
|--------|-----------|-----------|-------|
| Service Providers | `/service-providers` | `/service-providers/:providerSlug` | Slug from separate category system, not on table |
| Mentors | `/mentors` | `/mentors/:categorySlug/:mentorSlug` | Requires category prefix — 3-segment URL |
| Trade Agencies | `/government-support` | `/government-support/:slug` | Name mismatch (table is trade_investment_agencies) |
| Innovation | `/innovation-ecosystem` | `/innovation-ecosystem/:orgId` | **Uses UUID, not slug** |
| Investors | `/investors` | `/investors/:investorId` | **Uses UUID, not slug** |
| Case Studies | `/case-studies` | `/case-studies/:slug` | Uses content_items slug (OK) |

#### Data Fetching Pattern Inconsistencies
| Entity | Pattern | Issue |
|--------|---------|-------|
| Service Providers | Custom render-props `ServiceProvidersDataProvider` | Unique pattern, not React Query |
| Events | `useState` + `useCallback` with manual management | Not React Query like others |
| All others | `useQuery` (React Query) | Consistent |
| Lead Databases | `(supabase as any)` cast | Not in auto-generated types |

#### Card Component Inconsistencies
| Entity | Card Component | Issue |
|--------|---------------|-------|
| Service Providers | `CompanyCard` | Shared, but complex with many sub-components |
| Mentors | `PersonCard` | Unique to people entities |
| Trade Agencies | `CompanyCard` (reused) | Transform required to fit CompanyCard interface |
| Innovation | `CompanyCard` (reused) | Transform required |
| Events | `EventCard` | Unique |
| Leads | `LeadCard` | Unique |
| Locations | `LocationCard` | Unique |
| Countries | `CountryCard` | Unique |
| Sectors | `SectorCard` | Unique |
| Content | `ContentCard` | Unique |
| Case Studies | Inline Card component | Not a separate component |

#### Filter Implementation Inconsistencies
- **Service Providers**: 5 filter types including verified toggle + persona filter
- **Events**: Category tabs + 3 dropdowns + date tab (upcoming/past/all)
- **Case Studies**: Sidebar layout with revenue/cost ranges — completely different from all other pages
- **Investors**: **Zero filters** — only grid display
- **Countries**: Only search — no dropdown filters
- **Sectors**: Only search — no dropdown filters
- **Agencies**: 5 filter types including category from separate table

---

## Phase 3: Authentication & Security Audit

### 3.1 Auth Architecture
- **Provider**: Supabase Auth (email/password + Google OAuth)
- **State Management**: React Context (`AuthContext.tsx`) with `useAuthState` hook
- **Session**: `supabase.auth.getSession()` on mount + `onAuthStateChange()` listener
- **Roles**: `user_roles` table with `app_role` enum (admin, moderator, user)
- **Role checking**: `has_role()` PostgreSQL function used in RLS policies
- **Protected routes**: No dedicated `ProtectedRoute` wrapper — individual pages check auth

### 3.2 Security Findings

| Severity | Finding |
|----------|---------|
| **LOW** | 56 `console.*` statements across 30 files (info/error/warn, no PII logged) |
| **LOW** | 15 `as any` type casts in 5 files (mostly for non-typed tables) |
| **OK** | 3 `dangerouslySetInnerHTML` usages — all with DOMPurify sanitization |
| **OK** | No service role keys in frontend code |
| **OK** | No VITE_ env vars (Lovable restriction) |
| **OK** | Supabase anon key properly configured via direct URL |
| **OK** | Stripe webhook uses signature verification (verify_jwt disabled correctly) |
| **LOW** | 4 TODO comments indicating incomplete features |

### 3.3 Freemium Gating Pattern
- `FreemiumGate` component wraps content with view tracking
- 3 free views tracked in `localStorage` + `user_usage` table
- Signed-in users bypass the gate entirely
- `PaywallModal` shown when limit reached
- Innovation Ecosystem and Trade Agencies limit to 3 visible items for unauthenticated users

### 3.4 Subscription Tier Logic
- Tiers: `free` → `growth` → `scale` → `enterprise`
- Legacy mapping: `premium` → `growth`, `concierge` → `enterprise`
- Tier checked via `useSubscription` hook → `userTierMeetsRequirement()`
- Report sections gated by tier (content exists in JSON, just hidden)

---

## Phase 4: Unified Design System Blueprint

### 4.1 URL Architecture (Canonical)

| Entity | Listing | Detail | Slug Source |
|--------|---------|--------|-------------|
| Service Providers | `/service-providers` | `/service-providers/:slug` | `name` → lowercase-hyphenated |
| Mentors | `/mentors` | `/mentors/:slug` | `name` → lowercase-hyphenated |
| Trade Agencies | `/government-support` | `/government-support/:slug` | `name` → lowercase-hyphenated |
| Innovation Ecosystem | `/innovation-hubs` | `/innovation-hubs/:slug` | `name` → lowercase-hyphenated |
| Investors | `/investors` | `/investors/:slug` | `name` → lowercase-hyphenated |
| Events | `/events` | `/events/:slug` | Already has slug |
| Lead Databases | `/leads` | `/leads/:slug` | Already has slug |
| Content | `/content` | `/content/:slug` | Already has slug |
| Case Studies | `/case-studies` | `/case-studies/:slug` | Already has slug |
| Locations | `/locations` | `/locations/:slug` | Already has slug |
| Countries | `/countries` | `/countries/:slug` | Already has slug |
| Sectors | `/sectors` | `/sectors/:slug` | Already has slug |

**Slug format**: lowercase, hyphenated, no special chars, max 80 chars
**Collision handling**: Append `-2`, `-3` etc.
**Redirect strategy**: 301 from old UUID URLs to new slug URLs

### 4.2 Listing Page Template

All listing pages should follow this unified structure:

```
┌─────────────────────────────────────────────┐
│ Breadcrumb: Home > [Collection Name]         │
├─────────────────────────────────────────────┤
│ Page Header                                  │
│ H1: [Collection Name]                        │
│ Subtitle: [Description]                      │
│ Stats bar: [X providers] [Y locations] etc.  │
├─────────────────────────────────────────────┤
│ Action Bar                                   │
│ [Search input ........]  [Sort ▼] [Grid|List]│
├─────────────────────────────────────────────┤
│ Filter Bar                                   │
│ [Sector ▼] [Location ▼] [Type ▼] [More ▼]  │
│ Active: [Fintech ×] [Sydney ×]  [Clear all]  │
├─────────────────────────────────────────────┤
│ Results: Showing 24 of 120                   │
│ ┌────────┐ ┌────────┐ ┌────────┐            │
│ │ Card 1 │ │ Card 2 │ │ Card 3 │            │
│ └────────┘ └────────┘ └────────┘            │
│ ┌────────┐ ┌────────┐ ┌────────┐            │
│ │ Card 4 │ │ Card 5 │ │ Card 6 │            │
│ └────────┘ └────────┘ └────────┘            │
├─────────────────────────────────────────────┤
│ [Load More] or [1 2 3 ... 10 Next]          │
├─────────────────────────────────────────────┤
│ Empty State (when no results)                │
│ Icon + "No [entities] found"                 │
│ "Try broadening your filters"                │
│ [Clear filters] [Suggest a [entity]]         │
└─────────────────────────────────────────────┘
```

**Standard grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with `gap-6`
**Page size**: 12 cards (load more) or 24 cards (paginated)
**Card variants**: OrgCard (providers, agencies, hubs), PersonCard (mentors, community), EventCard, ContentCard, DataCard (leads), TaxonomyCard (locations, countries, sectors)

### 4.3 Detail Page Template

```
┌─────────────────────────────────────────────┐
│ Breadcrumb: Home > [Collection] > [Name]     │
├─────────────────────────────────────────────┤
│ Hero Section                                 │
│ [Logo]  H1: [Entity Name]                   │
│         Badges: [Verified] [Featured] [Type] │
│         Location | Founded | Size            │
│         [Primary CTA] [Save] [Share]         │
├─────────────────────────┬───────────────────┤
│ Main Content (65%)      │ Sidebar (35%)     │
│                         │                   │
│ About/Overview          │ Quick Facts Card  │
│ [Full description]      │ ┌───────────────┐│
│                         │ │ Location: ... ││
│ Key Details Grid        │ │ Founded: ...  ││
│ [Services/Expertise]    │ │ Size: ...     ││
│                         │ │ Website: ...  ││
│ Entity-Specific Section │ └───────────────┘│
│ [Varies by type]        │                   │
│                         │ Related Entities  │
│                         │ ┌───┐ ┌───┐      │
│                         │ │ 1 │ │ 2 │      │
│                         │ └───┘ └───┘      │
│                         │                   │
│                         │ Tags Cloud        │
│                         │ [tag1] [tag2]     │
├─────────────────────────┴───────────────────┤
│ Related [Entities] (horizontal scroll)       │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│ │    │ │    │ │    │ │    │ │    │ →        │
│ └────┘ └────┘ └────┘ └────┘ └────┘         │
├─────────────────────────────────────────────┤
│ CTA Banner: "Get your AI Market Entry Plan"  │
└─────────────────────────────────────────────┘
```

### 4.4 Entity-Specific Variations

| Entity | Card Differentiator | Detail Unique Sections | Key Filters |
|--------|-------------------|----------------------|-------------|
| Service Providers | Logo, services tags, verified badge | Testimonials, case studies, team | Sector, location, services, verified |
| Mentors | Avatar, specialties, availability badge | Bio, experience timeline, testimonials, booking | Specialty, location, availability, language |
| Trade Agencies | Govt badge, grants badge, category | Programs, grants, eligibility, contacts | Category, govt level, grants, sector |
| Innovation Hubs | Type badge (incubator/accelerator/hub) | Programs, portfolio, facilities, application | Type, location, sector, stage |
| Events | Date badge, category+type pills | Agenda, speakers, venue map, registration | Category, type, date, location, sector |
| Leads | Record count, price, quality score | Data preview table, schema, use cases | Sector, location, type, price range |
| Investors | Type badge, check size range, stage pills | Thesis, portfolio companies, process, team | Type, stage, sector, check size |
| Locations | Business score, population, type badge | Market overview, sectors, costs, regulatory | Country, type |
| Countries | Trade strength badge, economic indicators | Bilateral trade, entry requirements, agencies | Trade strength |
| Sectors | Industry count, resource counts | Market size, trends, key players, entry barriers | Featured |
| Content | Category, read time, publish date | Full article, author bio, related reading | Type, category |
| Case Studies | Outcome badge, revenue, cost metrics | Challenge, approach, results, timeline, financials | Outcome, industry, revenue, cost |

### 4.5 Shared Component Library (To Build)

| Component | Purpose | Used By |
|-----------|---------|---------|
| `EntityListingPage` | Generic listing wrapper (data fetch, filter, sort, paginate, URL sync, empty, loading) | All 12 listing pages |
| `EntityDetailPage` | Generic detail wrapper (fetch, SEO, breadcrumbs, 404, related) | All 12 detail pages |
| `FilterBar` | Config-driven filter bar with URL sync | All listing pages |
| `FilterChips` | Active filter display with remove buttons | All listing pages |
| `SearchInput` | Debounced (300ms) search with loading indicator | All listing pages |
| `SortDropdown` | Configurable sort options | All listing pages |
| `Pagination` | Load-more + numbered variants | All listing pages |
| `EntityBreadcrumb` | Auto-generated from route | All pages |
| `StatsBanner` | Entity count display | Listing pages |
| `RelatedEntities` | Horizontal scroll cards | All detail pages |
| `QuickFactsCard` | Key-value sidebar card | All detail pages |
| `TagCloud` | Clickable tags linking to filtered listing | All detail pages |
| `EmptyState` | Consistent illustration + message | All listing pages |
| `SEOHead` | Title/meta/OG/JSON-LD per entity type | All pages |
| `OrgCard` | Card for organizations (providers, agencies, hubs) | 3 listing pages |
| `PersonCard` | Card for people (mentors, community) | 2 listing pages |
| `EventCard` | Card for events | 1 listing page |
| `ContentCard` | Card for articles/guides | 1 listing page |
| `DataCard` | Card for lead databases | 1 listing page |
| `TaxonomyCard` | Card for locations/countries/sectors | 3 listing pages |

---

## Phase 5: Database Renovation Requirements

### 5.1 Schema Changes

#### New Columns Required

| Table | Column | Type | Default | Notes |
|-------|--------|------|---------|-------|
| `service_providers` | `slug` | `text UNIQUE NOT NULL` | Generated | From name, lowercase-hyphenated |
| `service_providers` | `is_featured` | `boolean` | `false` | For featured filtering |
| `service_providers` | `is_verified` | `boolean` | `false` | Verification badge |
| `service_providers` | `view_count` | `integer` | `0` | Analytics |
| `service_providers` | `meta_title` | `text` | `NULL` | SEO |
| `service_providers` | `meta_description` | `text` | `NULL` | SEO |
| `community_members` | `slug` | `text UNIQUE NOT NULL` | Generated | From name |
| `community_members` | `is_featured` | `boolean` | `false` | |
| `community_members` | `is_verified` | `boolean` | `false` | |
| `innovation_ecosystem` | `slug` | `text UNIQUE NOT NULL` | Generated | From name |
| `innovation_ecosystem` | `is_featured` | `boolean` | `false` | |
| `innovation_ecosystem` | `is_verified` | `boolean` | `false` | |
| `innovation_ecosystem` | `meta_title` | `text` | `NULL` | SEO |
| `innovation_ecosystem` | `meta_description` | `text` | `NULL` | SEO |
| `investors` | `slug` | `text UNIQUE NOT NULL` | Generated | From name |
| `investors` | `location_id` | `uuid REFERENCES locations(id)` | `NULL` | FK to locations |
| `investors` | `is_active` | `boolean` | `true` | |
| `investors` | `meta_title` | `text` | `NULL` | SEO |
| `investors` | `meta_description` | `text` | `NULL` | SEO |
| `country_trade_organizations` | `slug` | `text UNIQUE NOT NULL` | Generated | From name |
| `trade_investment_agencies` | `slug` | ALTER to `NOT NULL` | — | Currently nullable |

#### New Indexes Required

```sql
-- Slug indexes (unique, for URL lookups)
CREATE UNIQUE INDEX idx_service_providers_slug ON service_providers(slug);
CREATE UNIQUE INDEX idx_community_members_slug ON community_members(slug);
CREATE UNIQUE INDEX idx_innovation_ecosystem_slug ON innovation_ecosystem(slug);
CREATE UNIQUE INDEX idx_investors_slug ON investors(slug);
CREATE UNIQUE INDEX idx_country_trade_organizations_slug ON country_trade_organizations(slug);

-- Filterable column indexes
CREATE INDEX idx_service_providers_location_id ON service_providers(location_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_investors_type ON investors(investor_type);
CREATE INDEX idx_lead_databases_sector ON lead_databases(sector);
CREATE INDEX idx_lead_databases_status ON lead_databases(status);

-- GIN indexes for text array columns
CREATE INDEX idx_service_providers_services ON service_providers USING GIN(services);
CREATE INDEX idx_community_members_specialties ON community_members USING GIN(specialties);
CREATE INDEX idx_investors_sector_focus ON investors USING GIN(sector_focus);
CREATE INDEX idx_investors_stage_focus ON investors USING GIN(stage_focus);
CREATE INDEX idx_trade_agencies_sectors ON trade_investment_agencies USING GIN(sectors_supported);

-- Created_at DESC for default sorting
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_content_items_publish_date ON content_items(publish_date DESC);
CREATE INDEX idx_lead_databases_created_at ON lead_databases(created_at DESC);
```

### 5.2 Slug Generation Plan

```sql
-- Slug generation function
CREATE OR REPLACE FUNCTION generate_slug(input_text text)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Convert to lowercase, replace spaces/special chars with hyphens
  base_slug := lower(regexp_replace(trim(input_text), '[^a-z0-9]+', '-', 'gi'));
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  -- Truncate to 80 chars
  base_slug := left(base_slug, 80);

  final_slug := base_slug;
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Backfill existing rows (run per table)
-- UPDATE service_providers SET slug = generate_slug(name) WHERE slug IS NULL;
-- Handle collisions manually after bulk update
```

### 5.3 Tables NOT in Auto-Generated Types

These tables need manual type definitions or `(supabase as any)` pattern:

1. `user_intake_forms` — Used in `reportApi.ts`
2. `user_reports` — Used in `reportApi.ts`
3. `lead_databases` — Used in `useLeadDatabases.ts`
4. `lead_database_records` — Used in `useLeadDatabases.ts`
5. `mentor_categories` — Used in `useMentors.ts`
6. `mentor_experience_with` — Used in `useMentors.ts`
7. `mentor_testimonials` — Used in `useMentors.ts`
8. `service_provider_categories` — Used in `useServiceProviders.ts`
9. `service_provider_reviews` — Used in `useServiceProviders.ts`
10. `service_provider_contacts` — Used in `useServiceProviders.ts`

**Recommendation**: Regenerate Supabase types to include these tables, or create manual type files in `src/types/`.

---

## Phase 5: Prioritized Renovation Plan

### WAVE 0: FOUNDATION (Do First)

| ID | Priority | Effort | Title | Description | Depends On |
|----|----------|--------|-------|-------------|------------|
| DB-001 | P0 | M | Add slug columns to 5 tables | Add `slug TEXT UNIQUE NOT NULL` to service_providers, community_members, innovation_ecosystem, investors, country_trade_organizations. Create `generate_slug()` function. Backfill existing rows. | — |
| DB-002 | P0 | S | Make trade_investment_agencies.slug NOT NULL | ALTER COLUMN slug SET NOT NULL after backfilling any null values. | — |
| DB-003 | P0 | S | Add missing indexes | Create indexes on filterable columns, GIN indexes on array columns, slug unique indexes. | DB-001 |
| DB-004 | P0 | S | Add meta columns to 4 tables | Add meta_title, meta_description to service_providers, community_members, innovation_ecosystem, investors. | — |
| FE-001 | P0 | M | Create EntityBreadcrumb component | Reusable breadcrumb that auto-generates from route config. Apply to all 12 detail pages. Currently missing on Location, Country, Sector, Content, Case Study detail pages. | — |
| FE-002 | P0 | L | Create FilterBar component | Config-driven filter bar with URL query param sync. Supports: multi-select dropdown, single dropdown, toggle, search, range slider. Replaces per-page filter implementations. | — |
| FE-003 | P0 | M | Create SearchInput component | Debounced (300ms) search with loading indicator, clear button. Standardize across all listing pages. | — |
| FE-004 | P0 | M | Create Pagination component | Two variants: "Load More" button and numbered pagination. Add to ALL listing pages (currently none have pagination). | — |
| FE-005 | P0 | S | Create EmptyState component | Reusable empty state with icon, heading, description, and optional CTA. Replace 12 different inline implementations. | — |
| FE-006 | P0 | M | Create SEOHead component | Unified Helmet wrapper generating title, description, OG tags, canonical URL, and JSON-LD per entity type. | — |

### WAVE 1: CORE ENTITIES (Highest Value)

| ID | Priority | Effort | Title | Description | Depends On |
|----|----------|--------|-------|-------------|------------|
| FE-101 | P1 | L | Redesign Service Providers listing | Implement EntityListingPage pattern. Add pagination (12 per page), URL-persisted filters, sort options, standardized FilterBar. Migrate from ServiceProvidersDataProvider to React Query hook. | FE-002, FE-003, FE-004, DB-001 |
| FE-102 | P1 | L | Enrich Service Provider detail page | Add missing fields: founded_year, team_size, markets_served, engagement_model, price_range. Add JSON-LD (LocalBusiness schema). Add related events, content, case studies sections. | DB-001, FE-006 |
| FE-103 | P1 | L | Redesign Mentors listing | Simplify URL from `/mentors/:category/:slug` to `/mentors/:slug`. Implement EntityListingPage pattern. Add filters for availability, language, sector. Add pagination. | FE-002, FE-004, DB-001 |
| FE-104 | P1 | M | Enrich Mentor detail page | Verify all fields displayed. Add JSON-LD (Person schema). Ensure breadcrumbs work with simplified URL. Add related mentors by specialty. | DB-001, FE-006 |
| FE-105 | P1 | L | Redesign Events listing | Migrate from useState to React Query. Add pagination. Persist category/type/location filters to URL. Standardize FilterBar. | FE-002, FE-004 |
| FE-106 | P1 | M | Enrich Event detail page | Add JSON-LD (Event schema with date, location, organizer). Add speakers section, venue details, related service providers for the sector. | FE-006 |

### WAVE 2: COMPLETE COVERAGE

| ID | Priority | Effort | Title | Description | Depends On |
|----|----------|--------|-------|-------------|------------|
| FE-201 | P1 | L | Redesign Trade Agencies listing + detail | Standardize with EntityListingPage. Already has best schema — use as reference. Add pagination, URL filters. | FE-002, FE-004 |
| FE-202 | P1 | L | Redesign Innovation Ecosystem listing + detail | Switch from UUID to slug URLs. Enrich detail page (currently bare). Add type filter (incubator/accelerator/hub). Add pagination. | DB-001, FE-002, FE-004 |
| FE-203 | P1 | L | Redesign Investors listing + detail | Switch from UUID to slug URLs. Add filters (currently ZERO filters). Enrich detail page with portfolio, thesis, stage focus. Add pagination. | DB-001, FE-002, FE-004 |
| FE-204 | P1 | M | Redesign Case Studies listing | Switch from sidebar filters to top FilterBar for consistency. Add pagination. Keep revenue/cost filters but in standard position. | FE-002, FE-004 |
| FE-205 | P1 | M | Redesign Leads listing + detail | Add pagination. Standardize FilterBar. Add preview data table to detail page. | FE-002, FE-004 |
| FE-206 | P1 | M | Enrich Location detail page | Add Helmet meta tags (currently missing). Add breadcrumbs. Improve layout with QuickFactsCard sidebar. | FE-001, FE-006 |
| FE-207 | P1 | M | Enrich Country detail page | Add Helmet meta tags (currently missing). Add breadcrumbs. Add trade organizations section. | FE-001, FE-006 |
| FE-208 | P1 | S | Enrich Sector detail page | Add Helmet meta tags. Add breadcrumbs. Already aggregates 8 entity types — good structure. | FE-001, FE-006 |
| FE-209 | P1 | S | Standardize Content listing | Add pagination. Already has type filter URL persistence — extend to category. | FE-004 |

### WAVE 3: POLISH & CONNECT

| ID | Priority | Effort | Title | Description | Depends On |
|----|----------|--------|-------|-------------|------------|
| FE-301 | P2 | L | Add JSON-LD to all entity detail pages | LocalBusiness for providers/agencies/hubs, Person for mentors, Event for events, Article for content, Dataset for leads, Place for locations. | FE-006 |
| FE-302 | P2 | M | Generate dynamic sitemap | Replace static sitemap.xml with dynamic generation including all entity slugs. Update lastmod dates. | DB-001 |
| FE-303 | P2 | M | Cross-entity related items | Add "Related Events" to provider detail, "Related Providers" to event detail, "Related Content" to sector detail, etc. | Wave 2 |
| FE-304 | P2 | S | Sort options on all listing pages | Currently only Providers and Leads have sort. Add to all: Name (A-Z), Newest, Featured First. Events: Date (default). | Wave 2 |
| FE-305 | P2 | M | Mobile optimization pass | Review all detail pages on mobile. Ensure sidebar collapses correctly, CTAs are sticky, touch targets are 44px+. | Wave 2 |
| FE-306 | P2 | S | Standardize loading states | Pick one pattern (skeleton cards) and apply consistently. Currently mixed between spinner and skeleton. | — |
| FE-307 | P2 | M | Add "Suggest a [Entity]" CTA | Add directory submission forms accessible from empty states and listing page footers for all entity types. | — |
| UX-301 | P2 | S | Unify card hover effects | Standardize hover shadow, translate, border highlight across all card types. | — |
| UX-302 | P2 | M | Add bookmark buttons to all entity types | Currently missing on Locations, Countries, Sectors, Content. | — |
| DB-301 | P2 | S | Regenerate Supabase types | Include lead_databases, lead_database_records, mentor_*, service_provider_* tables in auto-generated types. Remove `(supabase as any)` casts. | — |

### WAVE 4: DIFFERENTIATION

| ID | Priority | Effort | Title | Description | Depends On |
|----|----------|--------|-------|-------------|------------|
| FE-401 | P3 | L | Global search in navigation header | Add persistent search bar to nav header, searching across all entity types. Currently search is only on homepage. | — |
| FE-402 | P3 | L | Comparison views | Allow users to compare 2-3 service providers, mentors, or investors side-by-side. | Wave 2 |
| FE-403 | P3 | M | Persona-aware directory filtering | Pre-filter directories based on selected persona (international entrant vs startup founder). | — |
| FE-404 | P3 | M | Entity recommendation engine | "Based on your report, we recommend these providers/mentors/events." | Wave 2 |
| FE-405 | P3 | L | Homepage entity showcase | Add featured providers, upcoming events, latest case studies, top mentors sections to homepage. | Wave 2 |
| DB-401 | P3 | L | Normalize taxonomy tables | Create `sectors` junction table with FKs from all entity tables. Replace string matching with proper foreign keys. | — |

---

## Consistency Scorecard

| Dimension | Current (1-5) | Target (1-5) | Gap |
|-----------|:---:|:---:|:---:|
| URL consistency | 2 | 5 | 3 |
| Filter consistency | 2 | 5 | 3 |
| Card layout consistency | 3 | 5 | 2 |
| Detail page structure | 3 | 5 | 2 |
| Search behaviour | 2 | 5 | 3 |
| Pagination pattern | 1 | 5 | 4 |
| Empty states | 3 | 5 | 2 |
| Loading states | 2 | 5 | 3 |
| Mobile responsiveness | 4 | 5 | 1 |
| SEO readiness | 2 | 5 | 3 |
| Related entity display | 2 | 5 | 3 |
| Breadcrumb navigation | 2 | 5 | 3 |
| Data completeness | 3 | 5 | 2 |
| **Average** | **2.4** | **5.0** | **2.6** |

---

## Appendix A: File Reference

### Key Source Files

| Purpose | Path |
|---------|------|
| Router config | `src/App.tsx` |
| Supabase client | `src/integrations/supabase/client.ts` |
| Auto-generated types | `src/integrations/supabase/types.ts` |
| Auth context | `src/contexts/AuthContext.tsx` |
| Persona context | `src/contexts/PersonaContext.tsx` |
| Navigation items | `src/components/navigation/NavigationItems.tsx` |
| Layout wrapper | `src/components/Layout.tsx` |
| Freemium gate | `src/components/FreemiumGate.tsx` |
| Paywall modal | `src/components/PaywallModal.tsx` |
| Report API | `src/lib/api/reportApi.ts` |
| Subscription hook | `src/hooks/useSubscription.ts` |
| Report section config | `src/components/report/reportSectionConfig.ts` |
| Persona content config | `src/config/personaContent.ts` |
| Sector taxonomy | `src/constants/sectorTaxonomy.ts` |
| Homepage | `src/pages/Index.tsx` |
| Sitemap | `public/sitemap.xml` |
| Robots | `public/robots.txt` |
| Supabase config | `supabase/config.toml` |

### Entity Pages Quick Reference

| Entity | Listing Page | Detail Page | Hook |
|--------|-------------|-------------|------|
| Service Providers | `src/pages/ServiceProviders.tsx` | `src/pages/ServiceProviderPage.tsx` | `src/hooks/useServiceProviders.ts` |
| Mentors | `src/pages/MentorsDirectory.tsx` | `src/pages/MentorProfile.tsx` | `src/hooks/useMentors.ts` |
| Events | `src/pages/Events.tsx` | `src/pages/EventDetailPage.tsx` | `src/hooks/useEvents.ts` |
| Trade Agencies | `src/pages/TradeInvestmentAgencies.tsx` | `src/pages/AgencyDetailPage.tsx` | `src/hooks/useTradeAgencies.ts` |
| Innovation | `src/pages/InnovationEcosystem.tsx` | `src/pages/InnovationOrgPage.tsx` | `src/hooks/useInnovationEcosystem.ts` |
| Investors | `src/pages/Investors.tsx` | `src/pages/InvestorPage.tsx` | `src/hooks/useInvestors.ts` |
| Leads | `src/pages/Leads.tsx` | `src/pages/LeadDatabaseDetailPage.tsx` | `src/hooks/useLeadDatabases.ts` |
| Content | `src/pages/Content.tsx` | `src/pages/ContentDetail.tsx` | `src/hooks/useContent.ts` |
| Case Studies | `src/pages/CaseStudies.tsx` | `src/pages/CaseStudyDetail.tsx` | `src/hooks/useCaseStudies.ts` |
| Locations | `src/pages/Locations.tsx` | `src/pages/LocationPage.tsx` | `src/hooks/useLocations.ts` |
| Countries | `src/pages/Countries.tsx` | `src/pages/CountryPage.tsx` | `src/hooks/useCountries.ts` |
| Sectors | `src/pages/Sectors.tsx` | `src/pages/SectorPage.tsx` | `src/hooks/useSectors.ts` |

### Component Architecture

| Component | File | Used By |
|-----------|------|---------|
| CompanyCard | `src/components/CompanyCard.tsx` | Providers, Agencies, Innovation (with transforms) |
| PersonCard | `src/components/PersonCard.tsx` | Mentors, Community |
| EventCard | `src/components/EventCard.tsx` | Events |
| LeadCard | `src/components/LeadCard.tsx` | Leads |
| LocationCard | `src/components/locations/LocationCard.tsx` | Locations |
| CountryCard | `src/components/countries/CountryCard.tsx` | Countries |
| SectorCard | `src/components/sectors/SectorCard.tsx` | Sectors |
| ContentCard | `src/components/content/ContentCard.tsx` | Content |
| BookmarkButton | `src/components/BookmarkButton.tsx` | Most detail pages |
| FreemiumGate | `src/components/FreemiumGate.tsx` | Several listing/detail pages |

---

## Appendix B: Code Quality Metrics

| Metric | Count | Notes |
|--------|-------|-------|
| Total .ts/.tsx files | 409 | |
| Page components | 43 | |
| Custom hooks | 69 | |
| UI components (shadcn) | 54 | |
| Edge functions | 18 | |
| Routes defined | 47 | Including redirects |
| `console.*` statements | 56 | Across 30 files (mostly error/warn, no PII) |
| `as any` type casts | 15 | Across 5 files (mostly non-typed table access) |
| `dangerouslySetInnerHTML` | 3 | All with DOMPurify sanitization |
| TODO/FIXME comments | 4 | Lead preview mock data, AI chat integration |
| Tables not in auto-types | 10+ | Lead databases, mentor sub-tables, SP sub-tables |

---

*Report generated March 2026. Read-only audit — no files were modified.*
