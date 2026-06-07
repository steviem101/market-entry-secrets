# Engineering To-Do — Intake v2

Repo: **`steviem101/market-entry-secrets`** · Stack: Vite + React 18 + TS + Tailwind + shadcn/ui +
Supabase. Draft artefacts live on **PR #197** under `docs/redesign/`.

Priorities: **P0** = correctness/blockers, **P1** = core build, **P2** = instrumentation/polish.

---

## P0 — Correctness (do first)

### P0.1 — Fix the goal-label shim mismatch ⚠️ (breaks matching)
The brief claims the redesign ships "without touching the pipeline" via `mapV2ToLegacyIntake()`. It
**cannot** as drafted:

- `supabase/functions/generate-report/index.ts` → `GOAL_SERVICE_TAGS` is keyed by the **old long**
  labels (e.g. `"Find vetted service providers (legal, tax, HR, finance)"`); `expandGoalsToServiceTags(intake.services_needed)`
  does an exact-string lookup.
- `mapV2ToLegacyIntake()` writes `services_needed: goalLabels`, where the new `GOALS[].label` are
  **short** (`"Find vetted service providers"`). → lookup misses → **zero service tags** → Service
  Providers / Mentors / Lead List match on **location only**.
- The SQL backfill in `intake_redesign_v2.draft.sql` has the inverse bug: its `CASE label WHEN '…long…'`
  only matches legacy rows, never v2 submissions.

**Fix (pick one):**
- (a) Add `legacy_label` to each `GoalDef` and have the shim emit that exact string into
  `services_needed`; **or**
- (b) Re-key `GOAL_SERVICE_TAGS` by `goal_id`, change `expandGoalsToServiceTags` to read
  `intake.goal_ids`, and ship that one-line edge change alongside the form.

Prefer (b) (stable ids, kills brittle string matching). Either way, **strike the "no pipeline changes"
claim** and add a test asserting non-empty service tags for a known `goal_ids` set.

### P0.1b — Goal → section data-source map (each goal `unlocks` one of THREE backends)
The goal cards promise "each goal adds a section," but the sections come from three different places.
Verified against `generate-report/index.ts`. Wire each goal to the right one — don't assume uniformity.

| Goal (`unlocks` label) | Source | Backend detail |
|---|---|---|
| Find vetted providers · Growth providers (Service Providers) | **DB match** | `service_providers` via `GOAL_SERVICE_TAGS` + Firecrawl enrich |
| Trade & investment agencies (Government & Trade) | **DB match** | `trade_investment_agencies` |
| Industry associations (Industry Bodies) | **DB match** | `innovation_ecosystem` (124 orgs — incubators, accelerators, hubs, associations/chambers); shares the table with Accelerators & Co-working/Hubs — filter by type/category to differentiate |
| Events & networking (Events & Networking) | **DB match** | `events` + Firecrawl event discovery |
| Mentors / advisors · Founders (Mentor Matches / Founder Network) | **DB match** | `community_members` |
| Lead lists (Lead List) | **DB match** | `leads` + `lemlist_contacts` |
| Investors (Investor Matches) | **DB match** | `investors` |
| Accelerators · Co-working/hubs (Accelerators / Co-working & Hubs) | **DB match** | `innovation_ecosystem` |
| Case studies · Market entry guides · Growth playbooks | **CMS lookup** | `content_items` filtered by `sector_tags` (see P0.1 note above) |
| **Regulatory & compliance (Regulatory Brief)** | **AI (Perplexity)** | `runMarketResearch().regulatory` — persona-forked query (licensing/visa/tax/entity) |
| **Grants & funding (Grants & Funding)** | **AI (Perplexity)** | `runMarketResearch().grants` — persona-forked (EMDG, R&D offset, state grants) |
| **Market & industry research (Market Research)** | **AI (Perplexity)** | `runMarketResearch().landscape` (+ KEY METRICS extraction) |

> ⚠️ **Always-on Perplexity sections aren't gated by the goal today.** `runMarketResearch()` fires all
> 6 queries (landscape, **regulatory**, news, bilateral_trade, cost_of_business, **grants**) on **every**
> report regardless of `goal_ids`. So `compliance`, `grants`, and `market_research` goals currently
> change only *provider matching*, while their narrative section generates either way. The card's
> promise ("each goal adds a section") is only literally true if you **make those blocks conditional on
> the selected goals** — otherwise reword the card hint OR (cheaper) keep them always-on and treat the
> goal as an *emphasis* signal. Decide which; don't ship the mismatch silently.

> **New goals added in the prototype** — `guides`, `market_research` (international), `guides_startup`
> (startup), unlocking **Guides & Playbooks** and **Market Research** sections (the Knowledge &
> Research group was otherwise one card for international, zero for startup). **These map to existing
> CMS content, NOT new AI sections.** The site already has a `/content` hub (Resources → **Market
> Entry Guides** — 23 step-by-step playbooks — **Case Studies**, Articles, Success Stories). Wire these
> goals (and `case_studies`) to **query that content library filtered by `industry_sector` / `persona`
> / `country_of_origin`** and embed the top matches as a curated reading list in the report — the same
> directory-lookup pattern as provider/event matching, not a Perplexity/LLM generator. This is cheaper,
> faster, and reuses written content (e.g. "The Irish Tech Founder's Guide to ANZ Expansion" is an ideal
> International/Ireland match). Confirm the content table + tags exposed to the edge function; if guides
> aren't yet queryable from `generate-report`, that's the small piece of work to add.

### P0.2 — Apply the schema + migration
- Replace `src/components/report-creator/intakeSchema.ts` with `docs/redesign/intakeSchema.v2.draft.ts`
  (drop the `.v2.draft` infix). Keep `mapV2ToLegacyIntake()` (with the P0.1 fix).
- Rename `intake_redesign_v2.draft.sql` → a timestamped migration and run it. It adds `customer_type,
  customer_size, buying_motion, challenge_tags[], challenge_other, goal_ids[], report_focus,
  website_scrape_accepted, revenue_stage` to `user_intake_forms`, plus the `intake_form_events` table,
  RLS, the `intake_funnel_v2` view, and a legacy backfill. Verify the backfill `CASE` after P0.1.
- Confirm the shim still writes `raw_input.persona`, `raw_input.target_customer_description`, and
  `raw_input.revenue_stage` — the edge function reads persona and `target_customer_description` from
  `raw_input` (`generateReportInBackground`, `researchEndBuyerProcurement`).

### P0.3 — Move the auth gate before generation
In `src/pages/ReportCreator.tsx`, `handleGenerate` currently calls `generate(data)` then
`if (result.needsAuth) setShowAuth(true)` (auth *after* the click → 16/59 `pending`). **Invert it:**
require an authenticated session *before* invoking the edge function; open the restyled `AuthDialog`
first, and only call `generate()` once authed. Keep the `localStorage` draft + auto-resume.

---

## P1 — Core redesign build

### P1.1 — Rebuild the wizard
Replace `ReportCreator.tsx` + `IntakeStep1/2/3` + `IntakeProgress` with the v2 flow:
**Persona (entry) → Company → Goals → Details → Review → Auth → Generating.** Stepper = 4 nodes
(Company · Goals · Details · Review); persona is un-numbered entry persisting as a top-right toggle
(switching resets `goal_ids` to persona defaults). Build with `react-hook-form` + `zodResolver(fullIntakeSchema)`
and shadcn primitives. Recreate each screen per `README.md` §"The flow". Mirror logic in
`reference_src/` (`rc-persona`, `rc-step1`, `rc-step2`, `rc-review`, `rc-auth-progress`, `rc-flow`).
**Do not** port the prototype's control bar or Tweaks panel.

### P1.2 — Website-scrape prefill endpoint
New Supabase edge function (or extend an existing one) for Step 1: given `website_url`, reuse
`firecrawlMap` + `firecrawlScrape` (already in `generate-report/index.ts`) + a Lovable AI extraction to
return `{ company_name, industry_sector, country_of_origin, company_stage }`. Requirements:
- **Non-blocking** on the client — never gate "Next" on it; show loading/detected/error states.
- **Debounce + cache** per URL (one scrape per distinct URL); short timeout with graceful fallback.
- Set `website_scrape_accepted` when the user keeps the suggestions.
- Reuse `isPrivateOrReservedUrl` / `sanitizeScrapedContent` / `checkRateLimit` from `_shared`.
- Note: 61% of users are SG/JP/KR — non-English sites degrade industry detection; treat output as a
  *suggestion*, not truth.

### P1.3 — Live ReportPreview
Component deriving report sections from `goal_ids` (`GOALS[].unlocks`) + `industry_sector` +
`known_competitors` + `challenge_tags` + `target_customers`. Render as a **compact bar** on Goals &
Details (updates live) and a **full rail** on Review. Logic in `reference_src/rc-ui.jsx` (`reportSections`,
`ReportPreview`).

### P1.4 — Restyle AuthDialog
Reuse `src/components/auth/AuthDialog.tsx`; add the green "Your answers are saved" reassurance header,
lead with Google/Microsoft SSO, demote email to a magic-link link, and present as a bottom sheet on
mobile.

### P1.5 — Company autocomplete + server-side domain resolution
Both "Specific companies you want to sell to" and "Known competitors" use a **single autocomplete
field** (no URL typing). The `{name, website}` shape is unchanged — `website` is filled by selecting a
suggestion, or left blank for the backend to resolve. Build:
- **Type-ahead** against your own AU directory tables first (`investors`, `service_providers`,
  `innovation_ecosystem`, `leads` — they already carry domains), returning `{name, website}` suggestions,
  with a generic "Add '{typed}' anyway" fallback. (Prototype mocks this with `COMPANY_DIRECTORY` in
  `rc-data.jsx` + `CompanyPicker` in `rc-ui.jsx`.)
- **Domain resolution** for names added without a website: reuse `firecrawlMap` (already in
  `generate-report`) to resolve a domain from the company name at generation time. Persist the resolved
  domain back so it's correctable.
- **Surface resolved domains on Review** as editable chips, so the rare wrong-domain match (two
  companies, same name) is fixable without burdening the 95% case.
- Emit a `custom_company_added` analytics event when users type a name not in the directory — repeated
  misses are candidates to add to the directory.

---

## P2 — Instrumentation & polish

### P2.1 — Real streaming progress (or stay honest)
The "Building your report" phases are simulated. The pipeline only `console.log`s phases ("Map found N
URLs", "Perplexity research completed…"); the only client-visible state is `status`
(pending→processing→completed/failed). To show real phases, **add a `progress jsonb` column** (on
`user_reports` or `user_intake_forms`) — or a `generation_phase_events` table — that
`generateReportInBackground` writes phase updates to, and have the client subscribe via Supabase
realtime (or poll). Until built, keep an honest indeterminate state; don't fake step completion.

### P2.2 — Funnel analytics (`intake_form_events`)
The draft migration ships the table, RLS (anyone can insert, admins read), and the `intake_funnel_v2`
view. Emit events client-side: `persona_selected, step_entered, step_exited, field_focused,
field_completed, field_skipped, website_prefill_shown/accepted/rejected, auth_modal_shown,
auth_completed, generate_clicked, report_completed, abandoned` with `{ session_id, step, field_name,
persona, metadata }`. This is how you'll measure the redesign's lift on the design-goal targets.

### P2.3 — Accessibility (brief requirement)
All custom controls need ARIA + keyboard nav: single-select chip groups `role="radiogroup"` (children
`role="radio"`, arrow-key navigation), multi-select `role="group"` (children `role="checkbox"`), goal
cards `role="checkbox" aria-checked`. Space/Enter toggles; visible focus rings. The prototype sets the
roles but not full keyboard handling — add it.

### P2.4 — Backward-compat regression check
With the shim live, verify the pipeline still produces full reports: service-provider/mentor/lead
matching returns non-empty results for a representative `goal_ids` set (guards P0.1), competitor +
end-buyer scraping fire from `known_competitors` / `target_customers.named_companies`, and the
synthesised `target_customer_description` / `key_challenges` strings reach the LLM prompts.

---

## Quick reference — where things live

| Concern | File |
|---|---|
| Wizard page | `src/pages/ReportCreator.tsx` |
| Intake steps | `src/components/report-creator/IntakeStep1/2/3.tsx`, `IntakeProgress.tsx`, `EndBuyersSection.tsx` |
| Current schema | `src/components/report-creator/intakeSchema.ts` |
| Target schema / shim | `docs/redesign/intakeSchema.v2.draft.ts` (PR #197) |
| Migration | `docs/redesign/intake_redesign_v2.draft.sql` (PR #197) |
| Generation pipeline | `supabase/functions/generate-report/index.ts` |
| Goal→tag map / matching | `GOAL_SERVICE_TAGS`, `expandGoalsToServiceTags`, `searchMatches` (same file) |
| Auth | `src/components/auth/AuthDialog.tsx`, `src/hooks/useAuth.ts` |
| Generation hook | `src/hooks/useReportGeneration.ts` |
| Industry taxonomy | `src/constants/linkedinTaxonomy.ts` |

> **Industry search/custom (new):** Step 1's industry field now has a search over the full taxonomy
> plus an "Add '{x}' as a custom industry" free-text fallback. Wire the search to the **complete**
> `linkedinTaxonomy.ts` list (the prototype only ships a representative slice), and persist custom
> strings as-is — they're valid `industry_sector[]` entries; the pipeline treats them as plain text.
