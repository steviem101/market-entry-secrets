# MES Report Generation — Deep Audit & Recommendations

**Date:** 2026-03-15
**Scope:** Full pipeline audit — form UX, data flow, AI orchestration, report assembly, output quality

---

## Phase 1: Codebase Discovery — Complete Pipeline Map

### 1.1 Report Form Architecture

| File | Purpose |
|------|---------|
| `src/pages/ReportCreator.tsx` | Page component, form orchestration, draft persistence, auth flow |
| `src/components/report-creator/intakeSchema.ts` | Zod schemas, option constants, `IntakeFormData` type |
| `src/components/report-creator/IntakeStep1.tsx` | Step 1: Company details + persona toggle |
| `src/components/report-creator/IntakeStep2.tsx` | Step 2: Goals, competitors, end buyers, challenges |
| `src/components/report-creator/IntakeStep3.tsx` | Step 3: Review summary (read-only) |
| `src/components/report-creator/EndBuyersSection.tsx` | End buyer industries + end buyer entries sub-component |
| `src/components/report-creator/IntakeProgress.tsx` | Step progress breadcrumb |
| `src/components/report-creator/GeneratingOverlay.tsx` | Full-screen loading modal with step animations |

**State management:** React Hook Form + Zod resolver (`fullIntakeSchema`). Three validation schemas — `step1Schema`, `step2Schema`, `fullIntakeSchema` — triggered at step transitions and final submit.

**Draft persistence:** `localStorage` key `mes_intake_form_draft`. Saved when guest user clicks Generate, loaded on mount, cleared on successful generation. Auto-submit after auth via `setTimeout` in `ReportCreator.tsx`.

### 1.2 Report Generation Pipeline

| File | Purpose |
|------|---------|
| `src/hooks/useReportGeneration.ts` | Client-side orchestration: submit intake → invoke edge fn → poll status |
| `src/lib/api/reportApi.ts` | API layer: `submitIntakeForm()`, `generateReport()`, `pollReportStatus()` |
| `supabase/functions/generate-report/index.ts` | 1,573-line edge function: entire backend pipeline |
| `supabase/functions/_shared/http.ts` | CORS headers |
| `supabase/functions/_shared/log.ts` | Structured logging |
| `supabase/functions/_shared/url.ts` | Private/reserved URL check |
| `supabase/functions/_shared/auth.ts` | Admin role check |

### 1.3 Report Output & Display

| File | Purpose |
|------|---------|
| `src/pages/ReportView.tsx` | Main report viewer (authenticated, tier-gated) |
| `src/pages/SharedReportView.tsx` | Public shared report viewer |
| `src/pages/MyReports.tsx` | Report dashboard listing |
| `src/components/report/reportSectionConfig.ts` | Section definitions, tier requirements, icons |
| `src/components/report/ReportSection.tsx` | Section renderer (markdown + match cards) |
| `src/components/report/CitationRenderer.tsx` | Markdown rendering with `[N]` citation replacement |
| `src/components/report/ReportGatedSection.tsx` | Locked section with blur + upgrade CTA |
| `src/components/report/ReportMatchCard.tsx` | Directory match cards (providers, mentors, events, etc.) |
| `src/components/report/ReportKeyMetrics.tsx` | Quantitative metrics grid (from Perplexity) |
| `src/components/report/ReportSources.tsx` | Collapsible Perplexity citation list |
| `src/hooks/useReport.ts` | React Query hooks for report data |
| `src/hooks/useSubscription.ts` | Subscription tier check + legacy tier mapping |

**Storage:** `user_reports.report_json` (JSONB) in Supabase. Server-side tier gating via `get_tier_gated_report()` RPC. Reports rendered as markdown with React components.

### 1.4 Orchestration Flow (Sequence Diagram)

```
User clicks "Generate My Report"
│
├─ 1. Client: form.trigger() → validate all fields
├─ 2. Client: reportApi.submitIntakeForm() → INSERT into user_intake_forms
├─ 3. Client: reportApi.generateReport() → invoke generate-report edge fn
│   │
│   └─ Edge Function (returns immediately):
│       ├─ Auth check (JWT + ownership verification)
│       ├─ Duplicate check (existing processing report?)
│       ├─ INSERT user_reports with status="processing"
│       └─ EdgeRuntime.waitUntil(generateReportInBackground())
│           │
│           ├─ Phase 1: PARALLEL DATA GATHERING (all 6 run simultaneously)
│           │   ├─ [A] enrichCompanyDeep() — Firecrawl Map + Scrape (homepage + 2 key pages) → AI extract profile
│           │   ├─ [B] runMarketResearch() — 6 parallel Perplexity queries (landscape/sonar-pro, regulatory, news, bilateral, costs, grants)
│           │   ├─ [C] matchesAndEnrichTask() — 8 Supabase table queries + Firecrawl enrich matched providers
│           │   ├─ [D] searchCompetitors() — scrape known competitors + Firecrawl web search → AI analyze
│           │   ├─ [E] scrapeEndBuyers() — Firecrawl scrape end buyer websites → AI analyze (max 3)
│           │   └─ [F] researchEndBuyerProcurement() — Perplexity query on buyer procurement patterns
│           │
│           ├─ Phase 1b: Extract key metrics from landscape text (regex parse METRIC lines)
│           │
│           ├─ Phase 1c: CONDITIONAL external event discovery
│           │   └─ If < 3 internal events → Firecrawl search for industry events → AI parse
│           │
│           ├─ Phase 2: Fetch user subscription tier + report templates from DB
│           │
│           ├─ Phase 3: PARALLEL AI SECTION GENERATION (all templates in single batch)
│           │   └─ For each template: variable substitution → callAI(gemini-3-flash-preview)
│           │      with persona context injected into system prompt
│           │
│           ├─ Phase 4: SAVE (unpolished) → UPDATE user_reports SET status="completed"
│           │
│           └─ Phase 5: POLISH PASS (best-effort, 30s timeout)
│               └─ All visible sections → single Gemini call for editing/consistency
│               └─ UPDATE user_reports with polished content
│
├─ 4. Client: pollReportStatus() every 3s, max 120 attempts (6 min)
└─ 5. Client: navigate to /report/{id} on completion
```

### External API Calls Per Report

| Service | Calls | Details |
|---------|-------|---------|
| **Firecrawl Map** | 1 | Company website URL discovery |
| **Firecrawl Scrape** | 3-8 | Company (1 homepage + up to 2 key pages), known competitors (up to 3), end buyers (up to 3) |
| **Firecrawl Search** | 1-2 | Competitor discovery (1) + external events if < 3 internal (1) |
| **Perplexity (sonar)** | 5-6 | Regulatory, news, bilateral trade, cost of business, grants, end buyer procurement |
| **Perplexity (sonar-pro)** | 1 | Market landscape (includes key metrics extraction) |
| **Lovable AI Gateway (Gemini)** | 10-15 | Company profile extraction (1), competitor analysis (1-2), end buyer analysis (up to 3), event extraction (0-1), section generation (7-9), polish pass (1) |

**Estimated total time:** 60-120 seconds. Bottleneck is the parallel Phase 1 block (Perplexity calls take ~10-30s each, Firecrawl scrapes ~5-10s each).

**AI Model:** `google/gemini-3-flash-preview` via Lovable AI Gateway (`ai.gateway.lovable.dev/v1/chat/completions`). **Not Claude.** No max_tokens set. 90s timeout per call.

---

## Phase 2: Form Field Impact Analysis

### 2.1 Field-by-Field Impact Table

| Step | Field | Type | Required | Passed to AI Prompt | Used in DB Query | Impact Rating | Evidence |
|------|-------|------|----------|--------------------|-----------------| ------------- |----------|
| 1 | `persona` | Toggle | Yes | YES — injected as persona context in system prompt for every section (line 1331-1333) | NO (not used in Supabase queries) | **HIGH** | Determines persona context appended to system prompt; changes goal options; changes page title |
| 1 | `company_name` | Text | Yes | YES — `{{company_name}}` in every template | NO | **HIGH** | Core variable in all section prompts |
| 1 | `website_url` | URL | Yes | YES — used for Firecrawl deep scrape (line 1173); enriched profile injected as `{{enriched_company_profile}}` | NO | **HIGH** | Drives company intelligence extraction via Firecrawl |
| 1 | `country_of_origin` | Select | Yes | YES — `{{country_of_origin}}` in many templates; drives Perplexity query construction (bilateral trade, regulatory, costs) | NO | **HIGH** | Shapes bilateral trade, regulatory, and cost research queries |
| 1 | `industry_sector` | Multi-select | Yes | YES — `{{industry_sector}}` in all templates; drives Perplexity queries | YES — filters service_providers, events, leads, investors, content, lemlist_contacts | **HIGH** | Primary driver of both data matching and research queries |
| 1 | `company_stage` | Select | Yes | YES — `{{company_stage}}` in templates | NO | **MEDIUM** | Mentioned in prompts but doesn't drive conditional logic or queries |
| 1 | `employee_count` | Select | Yes | **ONLY in fallback summary** (line 1149) — "with X employees" | NO | **LOW** | Only appears in fallback summary string. Never in templates. Never drives queries. |
| 1 | `target_market` | Select | No (intl only) | **NO** — not in `variables` map (line 1265-1305), not in any template | NO | **NONE** | **COMPLETELY UNUSED.** Not stored in variables, not in any template, not in any query. Dead field. |
| 1 | `revenue_stage` | Select | No (startup only) | **NO** — not in `variables` map, not in any template | NO | **NONE** | **COMPLETELY UNUSED.** Not stored in variables, not in any template. Dead field. |
| 1 | `target_regions` | Multi-select | No | YES — `{{target_regions}}` in most templates; drives Perplexity queries | YES — filters service_providers, events, leads, innovation_ecosystem, trade_agencies, investors, community_members, lemlist_contacts | **HIGH** | Primary geographic filter for DB matching and research queries |
| 2 | `selected_goals` | Checkboxes | Yes | YES — mapped to `services_needed` → `{{services_needed}}` in several templates; also combined with `additional_notes` into `primary_goals` → `{{primary_goals}}` | YES — used as `servicesNeeded` to filter service_providers (`.cs.{}`) and community_members (`.cs.{}`) | **HIGH** | Drives provider/mentor matching via array overlap |
| 2 | `timeline` | Select | No | YES — `{{timeline}}` in executive_summary, action_plan, investor_recommendations | NO | **MEDIUM** | Mentioned in prompts, shapes action plan phasing text, but doesn't drive conditional logic |
| 2 | `budget_level` | Select | No | YES — `{{budget_level}}` in executive_summary, service_providers, action_plan, investor_recommendations | NO | **MEDIUM** | Mentioned in prompts but doesn't drive conditional logic or different research paths |
| 2 | `known_competitors` | Dynamic array (max 3) | No | YES — competitor websites scraped via Firecrawl → AI analysis → `{{competitor_analysis_json}}` in competitor_landscape template | NO | **HIGH** | Drives entire competitor scraping pipeline and competitor_landscape section |
| 2 | `target_customer_description` | Textarea | No | YES — stored in `raw_input`, extracted as `targetCustomerDescription` → `{{target_customer_description}}` in variables; also used in `researchEndBuyerProcurement()` Perplexity query (line 767) | NO | **MEDIUM** | Used in end buyer procurement research query and available as template variable, but not actually referenced by any current template prompt_body |
| 2 | `end_buyer_industries` | Multi-select | No | YES — `{{end_buyer_industries}}` in variables; drives `researchEndBuyerProcurement()` query (line 766) | NO | **MEDIUM** | Shapes end buyer procurement Perplexity query |
| 2 | `end_buyers` | Dynamic array (max 5) | No | YES — end buyer websites scraped via Firecrawl → AI analysis → `{{end_buyers_scraped_json}}`/`{{end_buyers_analysis_json}}` | NO | **HIGH** | Drives end buyer scraping pipeline; intelligence injected into AI context |
| 2 | `key_challenges` | Textarea | No | YES — `{{key_challenges}}` in executive_summary template | NO | **MEDIUM** | Referenced in executive_summary prompt but NOT in other sections |
| 2 | `additional_notes` | Textarea | No | YES — combined with `selected_goals` into `primary_goals` (line 7-9 in reportApi.ts) → `{{primary_goals}}` | NO | **MEDIUM-LOW** | **MAJOR CONCERN:** This critical "anything else" field is merely appended to the goals string via `combinedGoals = [goalsText, additionalNotes].filter(Boolean).join('. ')`. It gets buried in `{{primary_goals}}` alongside the checkbox goals. Not given separate weight. |

### 2.2 Specific Field Scrutiny

#### `employee_count` — **Impact: LOW. Recommendation: Make optional or remove.**
- Only appears in the fallback summary string (line 1149): `"with ${intake.employee_count} employees"`
- The fallback summary is only used when Firecrawl deep scrape fails
- Never appears in any template's `{{variables}}`
- Never used in any Supabase query
- A required field that adds zero value to the report

#### `company_stage` — **Impact: MEDIUM. Currently underutilised.**
- Appears as `{{company_stage}}` in executive_summary, swot_analysis, service_providers, competitor_landscape, mentor_recommendations, investor_recommendations, action_plan
- However, it's just mentioned descriptively — it doesn't change the structure, tone, or depth of advice
- Should be used to adjust recommendations (e.g., a "Startup/Seed" company gets different action plan depth than an "Enterprise/Corporate")

#### `timeline` — **Impact: MEDIUM. Properly used in action_plan.**
- Referenced as `{{timeline}}` in executive_summary ("recommended approach and timeline"), action_plan ("enter Australia within their {{timeline}} timeline"), investor_recommendations
- In action_plan, the fixed "Phase 1 Month 1-2, Phase 2 Month 2-4, Phase 3 Month 4-6" structure doesn't actually adapt to the user's selected timeline value — e.g., "Exploratory (12+ months)" still gets the same 6-month plan
- **Recommendation:** Action plan template should use conditional phrasing based on timeline value

#### `budget_level` — **Impact: MEDIUM. Mentioned but doesn't shape recommendations.**
- Referenced as `{{budget_level}}` in executive_summary, service_providers, action_plan, investor_recommendations
- In practice, the AI gets the budget value but doesn't use it to filter or prioritise differently
- **Recommendation:** Should influence which service providers are highlighted (budget-appropriate) and scale of action plan

#### `target_market` — **Impact: NONE. REMOVE IMMEDIATELY.**
- Stored in form state but NEVER passed to the edge function variables (line 1265-1305 in index.ts)
- Not in any template variable list
- Not in any Supabase query
- Platform only covers Australia — this field is meaningless
- **Removal points:** `intakeSchema.ts` (field definition + schema), `IntakeStep1.tsx` (render), `IntakeStep3.tsx` (review display)

#### `revenue_stage` — **Impact: NONE. Dead field.**
- Startup-only field, stored in `raw_input` JSON
- Never extracted from `raw_input` in the edge function
- Not in the `variables` map (line 1265-1305)
- Not in any template
- **Recommendation:** Either wire it into the prompt (e.g., as `{{revenue_stage}}`) or remove it

#### `target_regions` — **Impact: HIGH. Well-used.**
- Drives ALL location-based Supabase filtering (8 tables use `locationPatterns`)
- Feeds Perplexity queries: landscape, costs, grants all include target regions
- Referenced in most templates as `{{target_regions}}`

### 2.3 High-Value Field Assessment

#### `persona` (International vs Startup) — **Partially used. Major gaps.** (See Phase 3)
- Changes goal checkbox options
- Changes a few form labels/titles
- Injects persona context into system prompt (2 sentences appended to every section generation call)
- **Does NOT** change: template selection, template content, Perplexity query construction, Supabase query construction, report section order, section structure

#### `website_url` — **Well-used.**
- Firecrawl Map discovers site pages → scrapes homepage + 2 key pages → AI extracts structured profile (summary, industry, maturity, products, key_clients, USPs)
- Enriched profile injected as `{{enriched_company_profile}}` into most templates
- Also used as `{{enriched_summary}}` in some older templates

#### `known_competitors` — **Well-used.**
- Competitor websites scraped via Firecrawl → individual AI analysis calls extract {name, url, description, key_info}
- Additionally, Firecrawl search discovers 3 more competitors from web results
- All combined into `{{competitor_analysis_json}}` for the competitor_landscape section
- Known competitor domains excluded from web search results to avoid duplicates

#### `additional_notes` ("Anything else you want your report to cover?") — **MAJOR ISSUE: BURIED.**
- In `reportApi.ts` line 7-9: `combinedGoals = [goalsText, additionalNotes].filter(Boolean).join('. ')`
- This means the user's custom free-text instructions are concatenated after the checkbox goal labels and stored as `primary_goals`
- In templates, `{{primary_goals}}` shows up as just another context field (e.g., "Goals: {{primary_goals}}")
- The AI has no indication that part of this text is the user's specific custom request
- **Example:** If user selects 3 goals and writes "I'm particularly interested in understanding the regulatory pathway for medical device registration in Australia", the prompt receives: `"Find vetted service providers (legal, tax, HR, finance); Connect with trade and investment agencies; Understand regulatory and compliance requirements. I'm particularly interested in understanding the regulatory pathway for medical device registration in Australia"`
- The specific request is lost in the noise of generic goal labels
- **Recommendation:** Pass `additional_notes` as a SEPARATE template variable with HIGH priority instructions in the prompt

#### `target_customer_description` — **Partially used.**
- Extracted from `raw_input` and stored as `{{target_customer_description}}` variable
- Used in `researchEndBuyerProcurement()` Perplexity query
- **BUT:** Not actually referenced in any current template `prompt_body` — the variable exists but no template uses `{{target_customer_description}}`
- **Recommendation:** Add to executive_summary, action_plan, and lead_list templates

---

## Phase 3: Persona Differentiation Audit

### 3.1 Current State

| Aspect | International Entry | Startup Growth | Differentiated? |
|--------|-------------------|----------------|-----------------|
| Form fields shown | `target_market` (unused) | `revenue_stage` (unused) | Barely |
| Goal checkbox options | 8 international goals | 8 startup goals | Yes |
| Form labels | "Country of Origin", "Market Entry Goals" | "Country / State", "Growth Goals" | Yes (cosmetic) |
| Budget field visibility | Always shown for intl | Hidden if Startup/Seed | Minor |
| Perplexity queries | Use `country_of_origin` in bilateral trade, regulatory, costs | **Same queries** even when origin is "Australia" | **NO** |
| Supabase queries | **Identical** | **Identical** | **NO** |
| Report templates | **Identical** | **Identical** | **NO** |
| Section order | **Identical** | **Identical** | **NO** |
| System prompt | 2-sentence persona context appended | Different 2-sentence persona context | Minimal |
| investor_recommendations section | Still generated | Still generated (but more relevant) | **NO** |

### 3.2 Specific Issues

**Perplexity queries don't adapt to persona:**
- For startups, the bilateral trade query asks about "Trade relationship between Australia and Australia in [sector]" — nonsensical
- The regulatory query asks about "Requirements for an Australian [sector] company entering the Australian market" — redundant
- The grants query is framed for "international companies from Australia setting up in [regions]" — wrong framing for domestic startups
- Cost of business query includes "cost comparison with Australia" — comparing AU to AU

**Supabase queries don't adapt to persona:**
- For startups, the investor table query runs but is equally weighted with service providers, mentors, etc.
- There's no prioritisation — startups should get MORE investors and accelerators, FEWER trade agencies
- The `innovation_ecosystem` and `trade_investment_agencies` tables are queried identically regardless of persona

**Templates don't adapt to persona:**
- All 9 section templates are generated for both personas
- The only persona signal is a 2-sentence context appended to the AI system prompt: "PERSONA CONTEXT: This report is for an Australian startup seeking to grow and scale. Prioritise: investors, accelerators, grants, startup-focused mentors, innovation hubs, and founder networks."
- This is insufficient — the entire prompt structure should differ

**Section structure is wrong for startups:**
- Startups don't need a "service_providers" section focused on market-entry legal/tax/HR (they're already in AU)
- Startups need: Investor Landscape (prominent), Accelerator/Incubator Programs, Grant & Funding Guide, Growth-stage Service Providers, Market Sizing/TAM, Founder Networks
- The current `investor_recommendations` section exists but has equal weight with all other sections

### 3.3 Recommendations

1. **Fork the template set by persona** — Create startup-specific templates in `report_templates` with a `persona` column. The edge function selects templates filtered by persona.

2. **Fork Perplexity queries by persona** — For startups:
   - Replace bilateral trade query with: "Australian startup funding landscape in [sector]: VC activity, angel investment trends, notable deals"
   - Replace regulatory query with: "Regulations and compliance for [sector] startups in Australia: licensing, data requirements, consumer protection"
   - Replace grants query with: "Australian government grants and R&D tax incentives for [sector] startups in [regions]: eligibility, application processes, recent recipients"
   - Replace cost of business with: "Startup operating costs in [regions]: co-working space pricing, junior developer salaries, typical monthly burn rates for [stage] startups"

3. **Adjust Supabase query weights by persona:**
   - Startups: Increase investor limit to 15, increase innovation_ecosystem limit to 10, reduce trade_investment_agencies to 0-3
   - International: Keep current weights, add `country_trade_organizations` filtering by `country_of_origin`

4. **Change report section order by persona:**
   - **International:** executive_summary → swot_analysis → competitor_landscape → service_providers → action_plan → mentor_recommendations → events_resources → lead_list
   - **Startup:** executive_summary → investor_recommendations → swot_analysis → competitor_landscape → action_plan → mentor_recommendations → events_resources → lead_list (service_providers reframed as "Growth Service Providers")

---

## Phase 4: Backend Integration Audit

### 4.1 Integration Map

#### AI Generation (Lovable AI Gateway → Gemini)
- **Model:** `google/gemini-3-flash-preview` (NOT Claude)
- **Endpoint:** `ai.gateway.lovable.dev/v1/chat/completions`
- **System prompt:** "You are Market Entry Secrets AI, an expert consultant on international companies entering the Australian market. Write professional, actionable content grounded in real data when available. Use Markdown formatting..." + persona context (2 sentences) + inline citation instructions
- **Context injected:** Template variables (form data + enriched company profile + Perplexity research + Supabase matches as JSON)
- **No `max_tokens` set** — Gemini defaults apply
- **Timeout:** 90s per call
- **Streaming:** No, single blocking call per section
- **Output format:** Free-form markdown with `[N]` citation markers

#### Perplexity
- **Called:** In Phase 1, parallel with all other data gathering
- **7 total queries** (6 research + 1 end buyer procurement):
  1. Market landscape (sonar-pro, 60s timeout)
  2. Regulatory & compliance (sonar, 60s timeout)
  3. Recent news (sonar, 60s timeout, recency: month)
  4. Bilateral trade (sonar, 60s timeout)
  5. Cost of business (sonar, 60s timeout)
  6. Grants & incentives (sonar, 60s timeout)
  7. End buyer procurement (sonar, conditional)
- **Query construction:** Uses `industry_sector`, `target_regions`, `country_of_origin` from intake form
- **Citations:** Preserved and deduplicated into `marketResearch.citations[]`, stored in report metadata, displayed via `ReportSources.tsx`
- **Key metrics:** Extracted from landscape response via regex (`- METRIC: Label | Value | Context`)

#### Firecrawl
- **Company deep scrape:** Map (discover URLs, 5s timeout) + Scrape homepage (10s) + up to 2 key pages (about, products, services, team, case-studies)
- **Competitor scraping:** Known competitor websites (10s each) + web search for additional competitors (15s)
- **End buyer scraping:** Up to 3 end buyer websites (8s each)
- **External event discovery:** Conditional — only if < 3 events from DB
- **Service provider enrichment:** All matched providers' websites scraped (10s each)
- **Content truncation:** Scrapes limited to 1500-2000 chars per page

#### Supabase (MES Platform Data)
- **8 tables queried** in `searchMatches()`:

| Table | Filter Logic | Limit |
|-------|-------------|-------|
| `service_providers` | location `ilike` + services `.cs.{}` | 10 |
| `community_members` | location `ilike` + specialties `.cs.{}` | 5 |
| `events` | location `ilike` + sector `ilike`; fallback: all events if 0 results | 5 |
| `content_items` | sector_tags `overlaps` industry_sector; status=published | 5 |
| `leads` | location `ilike` + industry `ilike` | 5 |
| `innovation_ecosystem` | location `ilike` | 5 |
| `trade_investment_agencies` | location `ilike` | 5 |
| `investors` | location `ilike` + sector_focus `.cs.{}` | 8 |
| `lemlist_contacts` | industry `ilike` + linkedin_job_industry `ilike` + contact_location `ilike` | 10 |

- **Matching issues:**
  - Service provider filtering uses `servicesNeeded` (which is `selected_goals` array). The user's selected goals like "Find vetted service providers (legal, tax, HR, finance)" are compared via `.cs.{}` against the provider's `services` array. This is unlikely to match because goal text doesn't align with provider service tags.
  - Events fallback (line 977-979) returns random 5 events when no filters match — these may be irrelevant
  - Content items only filter by `sector_tags` overlap — no location or keyword filtering
  - Leads use `industry ilike` which is fuzzy — "AI" would match "Airlines/Aviation"

### 4.2 Performance Analysis

**Estimated time breakdown:**
| Phase | Time | Notes |
|-------|------|-------|
| Phase 1 parallel block | 20-40s | Bottleneck: Perplexity calls (10-30s each), but all 6 run in parallel |
| Phase 1b: metrics extraction | ~0ms | Regex parse, synchronous |
| Phase 1c: external events | 0-20s | Conditional, only runs if < 3 internal events |
| Phase 2: templates + tier fetch | ~200ms | DB queries |
| Phase 3: section generation | 15-40s | All sections in parallel, each Gemini call ~5-15s |
| Phase 4: save (unpolished) | ~100ms | DB write |
| Phase 5: polish pass | 5-30s | Single Gemini call, 30s timeout |
| **Total** | **~60-120s** | |

**Estimated cost per report:**
| Service | Units | Est. Cost |
|---------|-------|-----------|
| Perplexity (6-7 calls) | ~2K tokens in, ~6K tokens out | ~$0.03-0.05 |
| Firecrawl (5-15 calls) | Scrape + Map + Search credits | ~$0.15-0.30 |
| Gemini (10-15 calls) | ~50K tokens in, ~15K tokens out | ~$0.05-0.10 |
| **Total** | | **~$0.25-0.45 per report** |

### 4.3 Redundancy Issues

1. **Key metrics extraction runs twice** (now fixed): Originally a separate Perplexity structured call; now extracted from landscape response via regex. However, the `extractKeyMetrics()` function still exists in the code (line 662-702) — dead code.

2. **Competitor URL scraped by Firecrawl AND potentially covered by Perplexity landscape research** — some overlap but generally complementary (Firecrawl gets website content, Perplexity gets market positioning).

3. **Fallback summary constructed even when deep scrape succeeds** — minor, but the fallback string is built regardless at line 1149.

### 4.4 Streamlining Recommendations

1. **Remove dead `extractKeyMetrics()` function** — no longer called, replaced by regex extraction from landscape.

2. **Cache Perplexity research by sector+country** — Many companies in the same sector from the same country will get identical market landscape, regulatory, and bilateral trade research. Cache for 24-48 hours to reduce costs and speed up generation.

3. **Parallelize external event discovery** — Currently sequential (runs after Phase 1 parallel block). Could be included in Phase 1 parallel block with a check for internal event count afterward.

4. **Provider enrichment happens inside the main parallel block** — Good. Previously was sequential.

5. **Polish pass should be optional** — Consider making it a quality flag. Currently has a 30s timeout; if it fails, the unpolished version is already saved. Good architecture.

6. **Gemini context efficiency** — Large JSON blobs (`matched_providers_json`, `matched_events_json`, etc.) are serialised into template variables. Some sections get context they don't need. Consider passing only relevant JSON to each section's template.

---

## Phase 5: Report Quality & Deduplication Audit

### 5.1 Report Structure

**9 sections** (in template order from `report_templates`):

| Section | Tier | Data Sources |
|---------|------|-------------|
| `executive_summary` | free | Enriched profile, all Perplexity research (landscape, bilateral, grants, end buyer) |
| `swot_analysis` | growth | Enriched summary, all Perplexity research (landscape, regulatory, news, bilateral, costs) |
| `competitor_landscape` | growth | Enriched profile, competitor analysis JSON, market landscape |
| `service_providers` | free | Enriched profile, matched providers JSON, services needed, budget |
| `mentor_recommendations` | growth | Enriched profile, matched mentors JSON, services needed |
| `investor_recommendations` | growth | Enriched profile, matched investors JSON, goals, budget, timeline |
| `events_resources` | free | Enriched profile, matched events JSON, matched content JSON |
| `action_plan` | free | All Perplexity research (regulatory, landscape, news, bilateral, costs, grants, end buyer), matched providers summary |
| `lead_list` | scale | Matched leads JSON, services needed |

### 5.2 Deduplication Issues

**Identified cross-section duplication risks:**

1. **Executive summary ↔ Action plan:** Both receive the same market landscape, bilateral trade, grants, and end buyer research data. The executive summary "outlines recommended approach and timeline" while the action plan details phases — significant content overlap likely.

2. **Executive summary ↔ SWOT analysis:** Both receive market landscape research. Executive summary mentions "key market conditions" while SWOT's Opportunities section covers "specific, data-backed opportunities."

3. **Service providers ↔ Action plan:** Action plan template says "Reference the matched service providers where relevant: {{matched_providers_summary}}" — the same providers are covered in detail in the service_providers section.

4. **The polish pass addresses this** — The system prompt for the polish pass includes "Remove redundant phrases or information that is repeated across sections." However, this is a single-pass edit on concatenated text, which may not catch all duplications, especially when the same fact is rephrased differently.

**Recommendation:** Add explicit deduplication instructions to individual templates: "Do not repeat information that would naturally appear in the [other section] section."

### 5.3 Citation & Source Attribution

**Current state:**
- Perplexity citations are collected, deduplicated, and stored in `metadata.perplexity_citations[]`
- The system prompt instructs the AI to use `[N]` inline citations referencing the numbered citation list
- `CitationRenderer.tsx` replaces `[N]` patterns with clickable `<InlineCitation>` components
- `ReportSources.tsx` renders a collapsible numbered list of citation URLs at the bottom
- Sources show domain names for readability

**Issues:**
- The citation numbers in the prompt (`[1]`, `[2]`, etc.) are constructed from the raw Perplexity response citations — but the citation list is DEDUPLICATED (line 648). If two Perplexity queries return the same URL, the dedup changes the citation numbering, potentially misaligning `[N]` references in the AI-generated text.
- Firecrawl-sourced data (competitor analysis, end buyer analysis, external events) has NO citation mechanism — these appear in the report without source attribution.
- MES platform data (service providers, mentors, events, etc.) is not explicitly attributed as "from our directory" in the rendered report — only the match cards provide implicit attribution.

**Recommendations:**
1. Build the citation list BEFORE passing to templates to ensure consistent numbering
2. Add source URLs for Firecrawl-sourced competitor data
3. Add "Source: Market Entry Secrets Directory" attribution to match cards

### 5.4 Report Personalisation Depth

**Assessment: MODERATE personalisation.**

**What works well:**
- Company website deep scrape extracts real products, clients, USPs — these appear in executive summary
- Known competitors are individually scraped and analysed
- End buyers are individually scraped and analysed
- Industry-specific Perplexity research (regulatory, landscape) is genuinely sector-specific
- Bilateral trade data is specific to the origin country → Australia corridor

**What feels generic:**
- The action plan uses a fixed "Phase 1-2-3 / Month 1-6" structure regardless of timeline or budget
- Service provider recommendations are limited to what's in the MES directory — may return irrelevant providers if directory coverage is thin for the sector
- SWOT analysis strengths are based on the company profile, but weaknesses/threats are often generic sector-level observations
- Key challenges (`{{key_challenges}}`) only appears in executive_summary — not addressed in action_plan or SWOT
- The "anything else" field (`additional_notes`) is buried in `primary_goals` — user's specific requests may be ignored

**Critical gap:** The `target_customer_description` field is collected but **never referenced in any template prompt**. The variable `{{target_customer_description}}` is defined (line 1277) but no template uses it. This means the user's description of their ideal customer has zero influence on the generated report sections.

---

## Phase 6: Consolidated Recommendations

### 6.1 Form Changes

| Field | Current State | Recommendation | Rationale | Priority |
|-------|--------------|----------------|-----------|----------|
| `target_market` | Required (intl), select, 3 options | **REMOVE** | Completely unused in pipeline. Platform is AU-only. | P0 |
| `revenue_stage` | Optional (startup), select, 4 options | **Wire into pipeline OR remove** | Currently unused in pipeline. If wired: add to variables + startup templates. | P1 |
| `employee_count` | Required, select, 5 options | **Make optional** | Only used in fallback summary string. Adds friction for zero value. | P2 |
| `additional_notes` | Optional, textarea, 500 chars | **Separate from goals; elevate in prompt** | Currently buried in `primary_goals` concatenation. Critical user input lost. | P0 |
| `target_customer_description` | Optional, textarea, 500 chars | **Add to template prompts** | Variable exists but no template references it. Wasted user input. | P1 |
| `company_stage` | Required, select | **Keep, enhance usage** | Add conditional logic: Startup/Seed gets different action plan structure. | P2 |
| `timeline` | Optional, select | **Keep, make action plan adaptive** | Action plan should adapt phases to match selected timeline. | P2 |
| `budget_level` | Optional, conditionally shown | **Keep, make recommendations budget-aware** | Service provider and action plan recs should respect budget constraints. | P3 |
| `key_challenges` | Optional, textarea | **Inject into more sections** | Currently only in exec summary. Should be in SWOT (threats), action plan (risk mitigation). | P1 |

### 6.2 Prompt Engineering Improvements

#### 6.2.1 Separate `additional_notes` from `primary_goals`

**In `reportApi.ts`:**
Change the payload to pass `additional_notes` as a separate field (not concatenated into `primary_goals`):
```typescript
primary_goals: goalsText,  // Only checkbox goals
additional_notes: data.additional_notes || '',
```

**In `generate-report/index.ts`:**
Add to variables map:
```typescript
additional_notes: (rawInput as any).additional_notes || intake.primary_goals?.split('. ').pop() || "",
```

**In every template, add a high-priority block:**
```
{{#if additional_notes}}
IMPORTANT — USER'S SPECIFIC REQUEST (prioritise this):
{{additional_notes}}
{{/if}}
```

#### 6.2.2 Wire `target_customer_description` into templates

Add to executive_summary, action_plan, lead_list, and service_providers templates:
```
Target customer profile: {{target_customer_description}}
```

#### 6.2.3 Wire `key_challenges` into more templates

Currently only in executive_summary. Add to:
- **swot_analysis:** "The company has identified these specific challenges: {{key_challenges}}. Incorporate these into Weaknesses and Threats."
- **action_plan:** "Address these specific challenges in the plan: {{key_challenges}}"

#### 6.2.4 Add deduplication instructions to templates

Add to each template that overlaps with another:
```
NOTE: Do NOT repeat market overview information that belongs in the Executive Summary.
Focus this section specifically on [section-specific focus].
```

#### 6.2.5 Make action plan timeline-adaptive

Replace fixed "Phase 1 Month 1-2, Phase 2 Month 2-4, Phase 3 Month 4-6" with:
```
Adapt the phasing to the company's {{timeline}} timeline:
- "Immediate (0-3 months)": compressed 3-month plan
- "Short-term (3-6 months)": standard 6-month plan
- "Medium-term (6-12 months)": detailed 12-month plan with strategic milestones
- "Exploratory (12+ months)": research-first approach with decision gates
```

#### 6.2.6 Add persona-specific system prompts

Instead of appending 2 generic sentences, create full persona-specific system prompts:

**International:**
```
You are Market Entry Secrets AI. You are writing a market entry report for an international company
expanding into Australia. Focus on: regulatory compliance, entity setup, visa requirements, cultural
differences, bilateral trade advantages, service provider matching for market entry support, trade
agencies, and go-to-market strategy for a company with no existing Australian presence.
```

**Startup:**
```
You are Market Entry Secrets AI. You are writing a growth report for an Australian startup seeking
to scale. Focus on: fundraising landscape, investor matching, accelerator/incubator programs,
government grants and R&D tax incentives, growth-stage hiring, market sizing/TAM data, founder
networks, and scaling strategy within the existing Australian market.
```

### 6.3 Integration Improvements

#### 6.3.1 Fix `selected_goals` → `services_needed` matching

The current flow maps goal checkbox labels (e.g., "Find vetted service providers (legal, tax, HR, finance)") into `services_needed`, which is then used for `.cs.{}` array overlap queries against provider `services` arrays. This is unlikely to match because the goal text doesn't align with provider service tags like "Legal", "Tax", "Immigration".

**Fix:** Extract service keywords from goals (e.g., "legal", "tax", "HR", "finance") or use a mapping table:
```typescript
const GOAL_TO_SERVICE_TAGS: Record<string, string[]> = {
  "Find vetted service providers (legal, tax, HR, finance)": ["Legal", "Tax", "HR", "Accounting"],
  "Connect with trade and investment agencies": ["Trade Advisory", "Government Relations"],
  // ...
};
```

#### 6.3.2 Persona-fork Perplexity queries

For `persona === "startup"`:
- Replace bilateral trade query with startup funding landscape query
- Replace regulatory query with startup-specific regulatory query
- Replace grants query with startup grants/R&D tax incentives query
- Replace cost of business with startup operating costs query

#### 6.3.3 Persona-fork Supabase query weights

For startups: increase `investors` limit to 15, increase `innovation_ecosystem` to 10, reduce `trade_investment_agencies` to 3.

#### 6.3.4 Add `country_trade_organizations` to matching

The `country_trade_organizations` table exists with `country_id` FK, but is NOT queried in `searchMatches()`. For international entrants, query this table filtered by origin country to find relevant trade chambers and bilateral organisations.

#### 6.3.5 Fix Perplexity citation numbering

Build the deduplicated citation list BEFORE template variable construction. Pass consistent `[N]` numbering to templates. Current flow: citations are deduplicated after research but the research text already contains citations with potentially different numbering.

### 6.4 Report Structure Improvements

#### 6.4.1 Proposed Section Order by Persona

**International Market Entry Report:**
1. Executive Summary (free)
2. Market Landscape & Key Metrics (free) — *NEW: break out from exec summary*
3. SWOT Analysis (growth)
4. Competitor Landscape (growth)
5. Regulatory & Compliance Guide (free) — *NEW: dedicated section from regulatory research*
6. Service Provider Recommendations (free)
7. Mentor Recommendations (growth)
8. Events & Resources (free)
9. Action Plan & Timeline (free)
10. Lead List (scale)

**Startup Growth Report:**
1. Executive Summary (free)
2. Market Sizing & Opportunity (free) — *NEW: TAM/SAM/SOM from landscape data*
3. SWOT Analysis (growth)
4. Competitor Landscape (growth)
5. Investor & Funding Landscape (growth) — *ELEVATED: prominent position for startups*
6. Grants & Government Programs (free) — *NEW: dedicated section*
7. Growth Service Providers (free) — *REFRAMED: growth-focused providers*
8. Mentor & Founder Networks (growth)
9. Events & Resources (free)
10. Action Plan & Growth Roadmap (free)
11. Lead List (scale)

#### 6.4.2 Citation Format

Current approach (inline `[N]` with collapsible source list) is solid. Recommendations:
- Add domain favicon next to citation URLs for visual trust cues
- Add "Last accessed: [date]" to citations
- For Firecrawl-sourced data, add source URLs as additional citations
- For MES directory data, add "Source: Market Entry Secrets Directory" badge on match cards

### 6.5 Quick Wins (1-2 prompts each)

| # | Change | Impact |
|---|--------|--------|
| 1 | Remove `target_market` field from form | Reduces form friction, removes dead code |
| 2 | Separate `additional_notes` from `primary_goals` in `reportApi.ts` | User's custom requests no longer buried |
| 3 | Add `{{additional_notes}}` as "USER'S SPECIFIC REQUEST" block in executive_summary + action_plan templates | Immediate report personalisation boost |
| 4 | Add `{{target_customer_description}}` to lead_list and action_plan templates | Uses currently-wasted user input |
| 5 | Add `{{key_challenges}}` to swot_analysis and action_plan templates | Challenges reflected in more sections |
| 6 | Make `employee_count` optional in schema | Reduces required field count |
| 7 | Delete dead `extractKeyMetrics()` function from edge function | Code cleanup |

### 6.6 Medium Effort (3-5 prompts or edge function changes)

| # | Change | Impact |
|---|--------|--------|
| 1 | Fork Perplexity queries by persona (startup vs international) | Eliminates nonsensical queries for startups |
| 2 | Create goal-to-service-tag mapping for better provider matching | More relevant service provider results |
| 3 | Make action plan timeline-adaptive (4 different structures based on `timeline` value) | More personalised, realistic plans |
| 4 | Add `country_trade_organizations` to Supabase matching for international persona | More relevant trade organisation matches |
| 5 | Wire `revenue_stage` into startup templates | Investor recommendations match stage |
| 6 | Add explicit deduplication instructions to each template to reduce cross-section repetition | Cleaner, less repetitive reports |
| 7 | Fix citation numbering (build deduped list before variable construction) | Accurate source references |

### 6.7 Large Effort (Architectural changes)

| # | Change | Impact |
|---|--------|--------|
| 1 | **Persona-forked template sets** — Add `persona` column to `report_templates` table, create startup-specific templates with different section structures, prompts, and variable sets | Fundamentally different reports per persona |
| 2 | **Perplexity research caching** — Cache research results by `(sector, country, regions)` key for 24-48 hours in a `research_cache` table | Faster generation, lower costs for common sector/country combos |
| 3 | **Streaming report generation** — Switch from polling to Supabase Realtime subscription; render sections as they complete instead of waiting for all | Better UX, perceived faster generation |
| 4 | **Section-level regeneration** — Allow users to regenerate individual sections (e.g., with updated instructions) without re-running the full pipeline | User control, iterative improvement |
| 5 | **Firecrawl scrape caching** — Cache company/competitor website scrapes by URL for 7 days; avoid re-scraping on report regeneration | Faster, cheaper regeneration |
| 6 | **Model upgrade path** — Consider switching from Gemini to Claude for section generation; Claude may produce higher-quality analytical content, especially for SWOT and competitor analysis | Report quality improvement |

---

## Appendix A: Complete File Reference

### Form Layer
- `src/pages/ReportCreator.tsx` — Page orchestration
- `src/components/report-creator/intakeSchema.ts` — Zod schemas, types, constants
- `src/components/report-creator/IntakeStep1.tsx` — Step 1 UI
- `src/components/report-creator/IntakeStep2.tsx` — Step 2 UI
- `src/components/report-creator/IntakeStep3.tsx` — Step 3 review
- `src/components/report-creator/EndBuyersSection.tsx` — End buyers sub-component
- `src/components/report-creator/IntakeProgress.tsx` — Progress breadcrumb
- `src/components/report-creator/GeneratingOverlay.tsx` — Loading overlay

### API & Hooks Layer
- `src/lib/api/reportApi.ts` — Supabase API calls
- `src/hooks/useReportGeneration.ts` — Generation state machine + draft persistence
- `src/hooks/useReport.ts` — React Query hooks for report data
- `src/hooks/useSubscription.ts` — Subscription tier check

### Edge Function
- `supabase/functions/generate-report/index.ts` — 1,573-line backend pipeline
- `supabase/functions/_shared/http.ts` — CORS
- `supabase/functions/_shared/log.ts` — Logging
- `supabase/functions/_shared/url.ts` — URL validation
- `supabase/functions/_shared/auth.ts` — Admin auth

### Report Rendering
- `src/pages/ReportView.tsx` — Authenticated report viewer
- `src/pages/SharedReportView.tsx` — Public shared viewer
- `src/pages/MyReports.tsx` — Report dashboard
- `src/components/report/reportSectionConfig.ts` — Section config, tier requirements
- `src/components/report/ReportSection.tsx` — Section renderer
- `src/components/report/CitationRenderer.tsx` — Markdown + citations
- `src/components/report/InlineCitation.tsx` — Citation badge component
- `src/components/report/ReportGatedSection.tsx` — Locked section
- `src/components/report/ReportRegenerateSection.tsx` — Empty section (post-upgrade)
- `src/components/report/ReportMatchCard.tsx` — Directory match cards
- `src/components/report/ReportKeyMetrics.tsx` — Metrics grid
- `src/components/report/ReportSources.tsx` — Citation list
- `src/components/report/ReportHeader.tsx` — Report header + PDF/share
- `src/components/report/ReportSidebar.tsx` — Desktop TOC
- `src/components/report/ReportMobileTOC.tsx` — Mobile TOC
- `src/components/report/ReportShareDialog.tsx` — Share dialog
- `src/components/report/ReportFeedback.tsx` — Feedback widget
- `src/components/report/ReportBackToTop.tsx` — Scroll button

### Database Migrations (Report-related)
- `supabase/migrations/20260206223728_*.sql` — Initial tables + templates
- `supabase/migrations/20260207000000_*.sql` — Repair migration
- `supabase/migrations/20260207011327_*.sql` — Template update
- `supabase/migrations/20260207014207_*.sql` — Anti-hallucination updates
- `supabase/migrations/20260207020101_*.sql` — Deep scrape + competitor templates
- `supabase/migrations/20260208095829_*.sql` — Bilateral trade + grants + end buyer updates
- `supabase/migrations/20260218000002_*.sql` — Investors table + template
- `supabase/migrations/20260301200002_*.sql` — Share token RPC
- `supabase/migrations/20260301200003_*.sql` — Tier gated report RPC

---

## Appendix B: Security Notes

1. **`generate-report` has `verify_jwt: true`** — Correct. JWT validated + ownership check at lines 1478-1510.
2. **Service role key used for background processing** — Correct pattern (EdgeRuntime.waitUntil runs after response, needs service role).
3. **Duplicate report prevention** — Good: checks for existing `processing` report before creating new one (line 1514-1531).
4. **`isPrivateOrReservedUrl` check** on all Firecrawl URLs — prevents SSRF to internal services.
5. **No PII in logs** — Console logs only show counts and timing, not user data.
6. **`sanitizeFilterValue`** strips commas and parentheses from filter values — prevents PostgREST filter injection.
7. **Shared reports expose all sections regardless of tier** — This is by design (shared reports show what the owner had access to at generation time), but worth noting that a growth-tier user sharing their report exposes growth-tier content to anyone with the link.
