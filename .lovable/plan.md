

# AI-Powered Market Entry Report Creator

## Overview

Build a complete AI report generation pipeline that collects company details via a multi-step form, enriches with web scraping, searches the existing MES database for relevant matches, generates a modular AI report, and displays it with tier-based gating.

## Important Adaptations from the Spec

The following adjustments are made to align with the existing codebase:

- **AI Provider**: The spec references "OpenAI GPT-4" but this project uses **Lovable AI Gateway** (`LOVABLE_API_KEY` is already configured). All AI calls will go through `https://ai.gateway.lovable.dev/v1/chat/completions` using `google/gemini-3-flash-preview` (consistent with existing `enrich-content` function).
- **Subscription Tiers**: The spec uses numeric tiers (0, 1, 2) but the codebase uses string tiers (`free`, `growth`, `scale`, `enterprise`). We will use the existing `useSubscription` hook pattern.
- **No `visibility_tier` column** exists on content tables. Tier gating will be applied at the report section level only (not per-record in the database).
- **Existing `market_entry_reports` table** will remain for the old manual report requests. New tables will be created for this AI system.

---

## Phase 1: Database Schema (Migration)

### Table 1: `user_intake_forms`

```sql
CREATE TABLE user_intake_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  website_url text NOT NULL,
  country_of_origin text NOT NULL,
  industry_sector text NOT NULL,
  company_stage text NOT NULL,
  employee_count text NOT NULL,
  target_regions text[] NOT NULL DEFAULT '{}',
  services_needed text[] NOT NULL DEFAULT '{}',
  timeline text NOT NULL,
  budget_level text NOT NULL,
  primary_goals text,
  key_challenges text,
  raw_input jsonb NOT NULL DEFAULT '{}',
  enriched_input jsonb,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','completed','failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

RLS: Users can INSERT and SELECT their own rows. Admins can see all.

### Table 2: `user_reports`

```sql
CREATE TABLE user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  intake_form_id uuid REFERENCES user_intake_forms(id) ON DELETE CASCADE,
  tier_at_generation text NOT NULL DEFAULT 'free',
  report_json jsonb NOT NULL DEFAULT '{}',
  sections_generated text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','completed','archived')),
  feedback_score integer,
  feedback_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

RLS: Users can SELECT and UPDATE (feedback only) their own rows. Admins can see all.

### Table 3: `report_templates`

```sql
CREATE TABLE report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name text NOT NULL,
  prompt_body text NOT NULL,
  variables text[] NOT NULL DEFAULT '{}',
  visibility_tier text NOT NULL DEFAULT 'free',
  is_active boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

RLS: SELECT for all authenticated users. INSERT/UPDATE/DELETE for admins only.

Seed data: 7 section templates (executive_summary, swot_analysis, service_providers, mentor_recommendations, events_resources, action_plan, lead_list) with their prompt templates and visibility tiers.

---

## Phase 2: Multi-Step Intake Form

### New Page: `/report-creator`

**File: `src/pages/ReportCreator.tsx`**

A full-page multi-step form (not a modal) with 3 steps:

**Step 1 - Company Details:**
- Company name, website URL, country of origin (dropdown), industry/sector (dropdown), company stage (dropdown), employee count (dropdown)

**Step 2 - Market Entry Goals:**
- Target regions (multi-select checkboxes), services needed (multi-select checkboxes), timeline (dropdown), budget level (dropdown), primary goals (textarea, 500 char max), key challenges (textarea, 500 char max)

**Step 3 - Review and Generate:**
- Summary card showing all inputs
- "Generate My Report" button
- Loading state with animated progress steps

**Components to create:**

| Component | Description |
|-----------|-------------|
| `src/pages/ReportCreator.tsx` | Main page component |
| `src/components/report-creator/IntakeStep1.tsx` | Company details form |
| `src/components/report-creator/IntakeStep2.tsx` | Market entry goals form |
| `src/components/report-creator/IntakeStep3.tsx` | Review and submit |
| `src/components/report-creator/IntakeProgress.tsx` | Step progress bar |
| `src/components/report-creator/GeneratingOverlay.tsx` | Loading animation |
| `src/components/report-creator/intakeSchema.ts` | Zod validation schemas |

**Auth handling:**
- Form is accessible to all users (including unauthenticated)
- On submit, if not logged in: save form data to localStorage, redirect to auth dialog, then restore and submit after login
- Uses existing `useAuth()` hook and `AuthDialog` component

**Validation:** Zod schema validation on each step before allowing "Next".

---

## Phase 3: Edge Functions

### Edge Function 1: `enrich-intake`

**File: `supabase/functions/enrich-intake/index.ts`**

Pipeline:
1. Receive intake form ID
2. Fetch the intake form from `user_intake_forms`
3. Use Firecrawl to scrape the company website (extract first 2000 chars of markdown)
4. Call Lovable AI to:
   - Standardize industry classification
   - Generate enriched company summary (2-3 sentences)
   - Assess company maturity
5. Store enriched output in `enriched_input` jsonb column
6. Update status to `processing`
7. Return enriched data

Uses: `FIRECRAWL_API_KEY`, `LOVABLE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### Edge Function 2: `search-matches`

**File: `supabase/functions/search-matches/index.ts`**

Two-pass search:

**Pass 1 - Source Relevance:**
- Query each table with filtered counts based on user's industry and target regions
- Tables queried: `service_providers`, `community_members`, `events`, `leads`, `content_items`, `innovation_ecosystem`, `trade_investment_agencies`
- Matching logic uses text search on `location`, `services`, `description`, `industry`/`sector` fields
- Return top 4-5 tables with most relevant matches

**Pass 2 - Deep Match:**
- Within relevant tables, run detailed queries with LIMIT
- service_providers: WHERE location matches target_regions AND services/description overlap with industry, LIMIT 10
- community_members: WHERE specialties overlap with services_needed AND location matches, LIMIT 5
- content_items: WHERE content_type IN ('case_study', 'guide') AND sector_tags overlap, LIMIT 5
- events: WHERE date > NOW() AND sector/location match, LIMIT 5
- leads: WHERE industry matches AND location matches, LIMIT 5
- innovation_ecosystem: WHERE location matches, LIMIT 3
- trade_investment_agencies: WHERE location/services relevant, LIMIT 3

**Tier gating:** For tables/records gated by tier, return placeholder objects with `{ id, name, blurred: true, upgrade_cta: "..." }` for users below required tier.

### Edge Function 3: `generate-report`

**File: `supabase/functions/generate-report/index.ts`**

Pipeline:
1. Receive intake_form_id and user_id
2. Fetch enriched intake data from `user_intake_forms`
3. Fetch matched records from `search-matches` (call internally or receive as input)
4. Fetch active prompt templates from `report_templates` table
5. For each section template, substitute variables and call Lovable AI
6. Run sections in parallel where possible (Promise.allSettled with batches of 2-3)
7. Assemble into structured JSON report
8. Store in `user_reports` table
9. Update `user_intake_forms.status` to `completed`

**Section visibility based on user's subscription tier:**
- Free: executive_summary, service_providers, events_resources, action_plan
- Growth: All of Free + swot_analysis, mentor_recommendations
- Scale/Enterprise: Everything + lead_list

**Config:**
```toml
[functions.enrich-intake]
verify_jwt = false
wall_clock_limit = 60

[functions.search-matches]
verify_jwt = false
wall_clock_limit = 60

[functions.generate-report]
verify_jwt = false
wall_clock_limit = 300
```

---

## Phase 4: Report Display Page

### New Page: `/report/:reportId`

**File: `src/pages/ReportView.tsx`**

Layout:
- Top bar: Company name, generated date, tier badge, "Download PDF" (placeholder), "Share" button
- Left sidebar (desktop): Table of contents with anchor links to sections
- Main content: Report sections as styled Cards

**Components to create:**

| Component | Description |
|-----------|-------------|
| `src/pages/ReportView.tsx` | Main report view page |
| `src/components/report/ReportHeader.tsx` | Top bar with company info |
| `src/components/report/ReportSidebar.tsx` | Table of contents |
| `src/components/report/ReportSection.tsx` | Individual section card |
| `src/components/report/ReportMatchCard.tsx` | Matched entity mini-card |
| `src/components/report/ReportGatedSection.tsx` | Blurred/locked section overlay |
| `src/components/report/ReportFeedback.tsx` | Thumbs up/down feedback widget |
| `src/hooks/useReport.ts` | React Query hook for fetching report |
| `src/hooks/useReportGeneration.ts` | Hook for orchestrating the generation pipeline |

**Tier gating UI:**
- Locked sections show heading + frosted glass blur overlay
- "Upgrade to unlock" card with lock icon and CTA to /pricing
- Individual blurred entity cards with lock icon

**Matched entity cards:**
- Service providers: Name, category, "View Profile" link to /service-providers
- Mentors: Name, expertise, location, "Connect" CTA
- Events: Title, date, location, "RSVP" link
- Content: Title, type, "Read More" link

### New Page: `/my-reports`

**File: `src/pages/MyReports.tsx`**

List view of all reports for the current user:
- Company name, date generated, tier badge, status, "View Report" link
- Uses React Query to fetch from `user_reports`
- Protected route (requires auth)

---

## Phase 5: Navigation and Access Updates

### Navigation Changes

**Modify `src/components/navigation/NavigationItems.tsx`:**
- Add "Report Creator" to `primaryNavItems` between Events and Leads

**Modify `src/components/auth/UserDropdown.tsx`:**
- Add "My Reports" link to user dropdown (linking to /my-reports)

**Modify `src/App.tsx`:**
- Add routes: `/report-creator`, `/report/:reportId`, `/my-reports`

### CTA Placements

**Modify `src/components/sections/HeroSection.tsx`:**
- Add a secondary CTA card: "Get Your Free Market Entry Report" linking to /report-creator

**Create `src/components/ReportCreatorCTA.tsx`:**
- Reusable CTA component for placement on /service-providers, /community, /content pages

---

## Phase 6: API Client Layer

**Create `src/lib/api/reportApi.ts`:**

```typescript
// Functions:
// - submitIntakeForm(data) -> creates intake form record
// - enrichIntake(intakeFormId) -> calls enrich-intake edge function
// - searchMatches(intakeFormId) -> calls search-matches edge function
// - generateReport(intakeFormId) -> calls generate-report edge function
// - fetchReport(reportId) -> fetches report from user_reports
// - fetchMyReports() -> fetches all reports for current user
// - submitFeedback(reportId, score, notes) -> updates feedback
```

---

## Implementation Order

Due to the size of this feature, implementation will be broken into multiple steps:

**Step 1**: Database migration (3 tables + RLS + seed data)

**Step 2**: Intake form page (`/report-creator`) with all 3 steps, validation, and form submission

**Step 3**: `enrich-intake` edge function (Firecrawl + AI enrichment)

**Step 4**: `search-matches` edge function (two-pass database search)

**Step 5**: `generate-report` edge function (modular AI report assembly)

**Step 6**: Report display page (`/report/:reportId`) with tier gating

**Step 7**: My Reports page (`/my-reports`) + navigation updates + CTA placements

**Step 8**: `report_templates` seed data + template-driven generation

---

## Files Summary

### New Files (21 files)

| File | Purpose |
|------|---------|
| `src/pages/ReportCreator.tsx` | Multi-step intake form page |
| `src/pages/ReportView.tsx` | Report display page |
| `src/pages/MyReports.tsx` | User's reports list |
| `src/components/report-creator/IntakeStep1.tsx` | Company details step |
| `src/components/report-creator/IntakeStep2.tsx` | Market entry goals step |
| `src/components/report-creator/IntakeStep3.tsx` | Review and generate step |
| `src/components/report-creator/IntakeProgress.tsx` | Progress bar |
| `src/components/report-creator/GeneratingOverlay.tsx` | Generation loading UI |
| `src/components/report-creator/intakeSchema.ts` | Zod validation |
| `src/components/report/ReportHeader.tsx` | Report top bar |
| `src/components/report/ReportSidebar.tsx` | Table of contents |
| `src/components/report/ReportSection.tsx` | Section card renderer |
| `src/components/report/ReportMatchCard.tsx` | Matched entity card |
| `src/components/report/ReportGatedSection.tsx` | Locked section overlay |
| `src/components/report/ReportFeedback.tsx` | Feedback widget |
| `src/components/ReportCreatorCTA.tsx` | Reusable CTA component |
| `src/hooks/useReport.ts` | Report data fetching hook |
| `src/hooks/useReportGeneration.ts` | Generation orchestration hook |
| `src/lib/api/reportApi.ts` | API client for report functions |
| `supabase/functions/enrich-intake/index.ts` | Website enrichment function |
| `supabase/functions/search-matches/index.ts` | Database search function |
| `supabase/functions/generate-report/index.ts` | AI report generation function |

### Modified Files (5 files)

| File | Change |
|------|--------|
| `src/App.tsx` | Add 3 new routes |
| `src/components/navigation/NavigationItems.tsx` | Add Report Creator nav item |
| `src/components/auth/UserDropdown.tsx` | Add My Reports link |
| `src/components/sections/HeroSection.tsx` | Add Report Creator CTA |
| `supabase/config.toml` | Register 3 new edge functions |

### No External API Keys Needed

All required secrets are already configured:
- `LOVABLE_API_KEY` - for AI generation via Lovable AI Gateway
- `FIRECRAWL_API_KEY` - for website scraping
- `SUPABASE_SERVICE_ROLE_KEY` - for server-side data access

