# START HERE — Claude Code build brief

You are implementing a redesign of the **Market Entry Report intake** (`/report-creator`) in this
repo (`steviem101/market-entry-secrets`). This folder is the complete design + engineering handoff.
Read it in this order, then build in the phased PRs below.

> **You are recreating a design in the real codebase — not copying prototype code.** The files in
> `reference_src/` are an HTML/React-via-Babel **prototype** (visual + behavioural reference). Rebuild
> the UI with this repo's real stack: **Vite + React 18 + TypeScript + Tailwind + shadcn/ui +
> `react-hook-form` + `zod` + Supabase**. Lift exact values (colours, copy, spacing, logic), not the
> Babel/CDN scaffolding.

---

## Read order

1. **`START_HERE.md`** (this file) — the plan, phases, guardrails.
2. **`README.md`** — the full design spec: every screen, layout, interaction, state shape, design tokens.
3. **`Intake v2 - Field Mapping.html`** — every field → DB column → legacy shim → report section → impact.
4. **`ENGINEERING_TODO.md`** — repo-anchored task detail (file paths, function names, the P0 bug).
5. **`reference_src/`** — prototype source, split by screen. Read for exact markup/logic. **Do not ship it.**
6. **`Report Intake Redesign (self-contained).html`** — open in a browser to *see and click* the target
   design (needs internet: Tailwind Play CDN + Google Fonts). Use it as the visual source of truth.

The draft schema + migration this build targets live on **PR #197** at
`docs/redesign/intakeSchema.v2.draft.ts` and `docs/redesign/intake_redesign_v2.draft.sql`.

---

## Guardrails (read before writing code)

- **Do NOT port prototype tooling:** the dark top **control bar** (viewport / persona / screen jumper /
  Reset) and the **Tweaks panel** (accent / typeface / card style / density / persona A/B) are design-
  review scaffolding. They are not product features.
- **Reuse existing modules**, don't reinvent: `react-hook-form` + `zodResolver`, shadcn primitives
  (`Select`, `Input`, `Card`, `Button`, `Badge`, `Dialog`, `Command` for autocomplete), `lucide-react`
  icons, `AuthDialog`, `useReportGeneration`, `linkedinTaxonomy.ts`. Map prototype hex/px to the repo's
  `tailwind.config.ts` / `src/index.css` tokens — don't hard-code the palette.
- **Australian English** in all copy (organise, personalise, analyse, licence, prioritise).
- **390px-first.** 61% of users are non-AU / mobile. Build responsive, not desktop-down.
- **Accessibility is a requirement, not polish:** single-select chip groups `role="radiogroup"` (children
  `role="radio"`, arrow-key nav), multi-select `role="group"` (`role="checkbox"`), goal cards
  `role="checkbox" aria-checked`, ≥44px hit targets, visible focus rings.
- **Don't silently break the pipeline.** `supabase/functions/generate-report` consumes a flat legacy
  shape. The `mapV2ToLegacyIntake()` shim bridges it — but it has a real bug (Phase 1). Verify matching
  still returns results after every schema change.

---

## Build plan — sequential PRs

Each phase is a self-contained PR with its own acceptance criteria. Ship in order; Phase 1 is a
correctness blocker and should land first or alongside Phase 2.

### Phase 0 — Scaffold & tokens (½ day)
**Goal:** branch, tokens, and a feature flag so the new flow can be built behind a toggle.
- Create a feature branch; add a `report_creator_v2` flag (env or existing flag mechanism).
- Add any missing design tokens from `README.md` §"Design tokens" to `tailwind.config.ts` / `index.css`
  (primary `#1AA3E0`/700 `#0F6FA0`, ink/body/muted/line/canvas, sky-soft/tint, the button gradient,
  `card`/`pop` shadows, Plus Jakarta Sans).
**Acceptance:** flag toggles a stub v2 route; tokens resolve; existing flow untouched.

### Phase 1 — Schema, migration & the shim bug ⚠️ (P0 — correctness)
**Goal:** land the v2 data layer without breaking report generation.
- Replace `src/components/report-creator/intakeSchema.ts` with `intakeSchema.v2.draft.ts` (drop the
  `.v2.draft` infix); keep `mapV2ToLegacyIntake()`.
- **Fix the goal-label mismatch** (full detail in `ENGINEERING_TODO.md` P0.1): the shim writes *short*
  `GOALS[].label` into `services_needed`, but the live `GOAL_SERVICE_TAGS` map in
  `generate-report/index.ts` is keyed by the *old long* labels → exact-string lookup misses → empty
  service tags → provider/mentor/lead matching breaks. **Preferred fix:** re-key `GOAL_SERVICE_TAGS` by
  `goal_id`, change `expandGoalsToServiceTags` to read `intake.goal_ids`, ship that edge change with the
  form. (Alt: add `legacy_label` to each `GoalDef` and emit the exact expected string.)
- Apply the migration (`intake_redesign_v2.draft.sql`, renamed/timestamped): new columns, the
  `intake_form_events` table, RLS, `intake_funnel_v2` view, legacy backfill. Re-verify the backfill
  `CASE` after the label fix.
**Acceptance:** a test asserts non-empty service tags for a known `goal_ids` set; an end-to-end generate
on a seeded v2 intake still returns provider/mentor/lead matches; migration runs clean up and down.

### Phase 2 — The wizard shell + Steps 1–3 (core build)
**Goal:** rebuild the flow per `README.md` §"The flow". **Persona (entry) → Company → Goals → Details →
Review → Auth → Generating**, 4-node stepper (Company · Goals · Details · Review), persona persists as a
top-right toggle (switching resets `goal_ids` to persona defaults).
- **Step 1 (Company):** website-first; scrape pre-fill with the **confirm-card** happy path (collapse
  filled fields into "Here's what we found" + Looks right / Edit details); industry chips + full-taxonomy
  **search** + custom free-text; **target regions defaulted** to most-likely AU entry point.
- **Step 2 (Goals):** goal cards grouped by category, 2–3 pre-selected, **sticky "Continue with N →"** bar.
- **Step 3 (Details):** customer type **defaults to B2B**, size/motion behind a skippable expander;
  industries multi-select w/ search+custom; **CompanyPicker** autocomplete for named companies &
  competitors (name *or* pasted website — never a separate URL field); challenges chips; **report-focus**
  with soft-fill "Use this".
- Mirror logic from `reference_src/rc-step1.jsx`, `rc-step2.jsx`, `rc-flow.jsx`.
**Acceptance:** all three steps validate via zod; matches the self-contained build visually at 390px and
desktop; keyboard + ARIA per guardrails; no prototype control bar / tweaks panel.

### Phase 3 — Review + Auth-before-generate (P0 drop-off fix)
**Goal:** inline-edit review and the auth-gate inversion.
- **Review:** 2-col on desktop (summary cards + sticky live `ReportPreview` rail), stacked on mobile;
  scalar rows inline-editable, chip-groups deep-link back to their step; "Saved" pill.
- **Auth before generation (P0.3):** invert `handleGenerate` in `ReportCreator.tsx` — require an
  authenticated session *before* invoking the edge function (today it generates then shows auth → 16/59
  stuck `pending`). Restyle `AuthDialog`: green "Your answers are saved" header, SSO primary, email magic-
  link secondary, bottom-sheet on mobile.
**Acceptance:** unauthenticated "Generate" opens auth with the draft preserved in localStorage; on auth,
generation fires; no intake can reach the pipeline unauthenticated.

### Phase 4 — Generating + scrape endpoint
**Goal:** the generating view and the website-prefill backend.
- **Website-scrape endpoint (P1.2):** Supabase function using existing `firecrawlMap` + `firecrawlScrape`
  + Lovable AI extraction → `{ company_name, industry_sector, country_of_origin, company_stage }`. Async,
  non-blocking, debounced + cached per URL, graceful fallback. Reuse `isPrivateOrReservedUrl` /
  `sanitizeScrapedContent` / `checkRateLimit`.
- **CompanyPicker resolution (P1.5):** type-ahead against your directory tables (`investors`,
  `service_providers`, `innovation_ecosystem`, `leads` — they carry domains); resolve missing domains via
  `firecrawlMap` at generate time; surface resolved domains as editable chips on Review.
- **Generating screen:** honest indeterminate state with the phase list + tips (do NOT fake completion —
  real streaming needs Phase 5 instrumentation).
**Acceptance:** scrape never blocks Next and fails soft; picker suggestions resolve domains; generating
view reflects real `status` transitions.

### Phase 5 — Instrumentation & polish (P2)
- **Funnel events** into `intake_form_events` (`persona_selected`, `step_entered/exited`,
  `field_completed/skipped`, `website_prefill_shown/accepted/rejected`, `auth_modal_shown`,
  `generate_clicked`, `report_completed`, `abandoned`) + `custom_industry` / `custom_company_added`.
- **Real streaming progress (optional):** add a `progress jsonb` column (or phase-events table) the
  pipeline writes to and the client subscribes to via Supabase realtime. Until then keep the honest
  indeterminate state.
- Full keyboard nav on all custom controls; backward-compat regression sweep (P2.4).
**Acceptance:** funnel view populates; if streaming shipped, phases reflect real backend progress.

> **Note — Tier 3 (deferred, do not build unless asked):** skip-to-review once minimum fields are met, a
> save-and-resume email link, and softening hard validation gates were scoped but explicitly deferred by
> the product owner. Leave them out of this build.

---

## Definition of done (whole project)

- New flow live behind the flag, matches the self-contained build at 390px + desktop, both personas,
  Australian English.
- Schema + migration applied; **service/mentor/lead matching verified non-empty** post-shim-fix.
- Auth precedes generation; draft persists; no `pending`-stuck submissions from the auth race.
- Scrape prefill + CompanyPicker resolution working and fail-soft.
- A11y: radiogroup/checkbox roles, keyboard nav, focus rings, ≥44px targets.
- No prototype control bar or Tweaks panel anywhere in the product.
