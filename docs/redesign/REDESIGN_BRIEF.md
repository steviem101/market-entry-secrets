# Market Entry Report Intake — Redesign Brief

> **Audience**: Claude Design / Lovable design AI
> **Status**: Ready for design handoff
> **Generated from**: real database stats (59 intakes), interactive captures, full pipeline review

---

## TL;DR — What you're redesigning

A 3-step intake wizard at `/report-creator` that gathers ~17 fields before triggering a 2–4 minute AI pipeline that generates a tiered, citation-backed Australian market entry report. The form is the highest-leverage surface in the product: every textarea a user skips means a worse report.

**The data shows three textareas at the bottom of Step 2 are the failure point:**

| High-impact field | Real completion rate | Avg length when filled |
|---|---|---|
| `target_customer_description` (textarea, 500 char) | **27.1%** | 47 chars |
| `additional_notes` (textarea, 500 char) | **33.9%** | **16 chars** |
| `key_challenges` (textarea, 500 char) | 88.1% | 27 chars |

The report templates flag `additional_notes` as **"USER'S HIGH-PRIORITY REQUEST"** in **every section**. Only 1 in 3 users supply it, and when they do, the median answer is two words. **This is the central design problem.**

---

## Real usage data (n=59 intakes, Feb 7 – Mar 22)

### Status distribution
- 41 completed, 16 pending (auth wall — never finished), 1 failed, 1 processing
- **27% of intakes start, get to Generate, but never reach `completed`** → strong signal of auth-gate or pipeline drop-off

### Persona usage
- 58 International / 1 Startup → the startup persona is essentially unused. Either the entry path is hidden, or the redesign should consider collapsing the two personas into one configurable flow.

### Field completion rates

| Field | % filled | Comment |
|---|---|---|
| company_name | 100% | required |
| website_url | 100% | required |
| country_of_origin | 100% | required |
| industry_sector | 100% | required |
| company_stage | 100% | required |
| employee_count | 100% | technically optional, but everyone fills it |
| services_needed (goals) | 100% | required |
| target_regions | **89.8%** | 1 in 10 skips this — but it drives all DB matching |
| timeline | 89.8% | optional, well-used |
| budget_level | 76.3% | optional, conditionally hidden |
| key_challenges | 88.1% | high completion but **avg 27 chars** — users are typing one phrase |
| known_competitors | 66.1% | up to 3 rows |
| end_buyer_industries | 69.5% | optional multi-select |
| end_buyers | 44.1% | up to 5 rows of name+website |
| **target_customer_description** | **27.1%** | textarea, **5 sections depend on it** |
| **additional_notes** | **33.9%** | textarea, **every section** treats it as high-priority |

### Per-form field-fill distribution
- 10.2% of forms fill all 16 measured fields
- **45.8% fill 14 of 16** — the missing 2 are reliably `target_customer_description` + `additional_notes`
- 8.5% fill only 8 fields — the abandoned-at-step-2 cohort

### Top countries of origin
Singapore (21), Ireland (12), Japan (12), Australia (5), UK (3), South Korea (3), US (2), France (1)

→ **The form should optimise for non-English-first-language users** (Singapore, Japan, Korea = 36 / 59 = 61% of usage).

### Top industries
Architecture & Planning (15), Data Infrastructure & Analytics (15), Capital Markets (9), Credit Intermediation (6), Software Development (5)

→ **The 152-option LinkedIn taxonomy is overkill** — 70% of users pick from the top 10 industries. Surface those first with a "more" expander.

### Top goals selected
Lead Generation (32), Market Research (30), Mentorship (26), Visa & Immigration (23), PR & Marketing (21), Access lead lists (21)

→ **Goals can be ranked / recommended** based on persona + industry + country.

---

## Captured screenshots (live form, 2026-06-05)

Saved at `/tmp/intake-screenshots/`:

| File | What it shows | Friction observations |
|---|---|---|
| `01-step1-desktop.png` | Step 1 desktop, empty state | Persona toggle ("Choose your journey") small subtitle, easy to miss. 2-col grid clean. Industry select hides 152 LinkedIn options behind a single button — no popular-for-your-country shortcuts. Target Regions is the bottom of the card despite being a critical signal. |
| `01-step1-mobile.png` | Step 1 at 390×844 | Persona card labels truncate. Vertical stack works. Target Regions chip group wraps to 3 rows. No sticky CTA — user must scroll for "Next". |
| `02-step2-desktop.png` | **The page of doom**, ~3000px tall | 8 long-phrase goal checkboxes (no icons, no grouping). Timeline + Budget grid. Known Competitors. `target_customer_description` textarea. End Buyers section. Key Challenges textarea. Additional Notes textarea. **Three free-text fields stacked at the bottom** = the cognitive cliff. |
| `02-step2-mobile.png` | Same content stacked | ~6 phone-screens of scroll. No section anchors, no progress indicator within step, no save reassurance. The abandonment point. |
| `03-step3-desktop.png` | Review summary | Fixed nav overlaps top of card (bug). Two summary cards in single column. No inline edit — Back loses scroll position. |
| `03-step3-mobile.png` | Review on mobile | Cramped. Industry chip and Stage badge wrap to multi-line. |
| `04-auth-desktop.png` | Auth modal **after** Generate click | User invested 3+ minutes filling the form, then hits Sign in / Sign up / Magic Link / Reset tabs with First/Last/Email/Password. The empty top half signals "you're not done." High abandonment risk. |
| `04-auth-mobile.png` | Auth on mobile | Dialog covers ~70% of viewport. CTA "Create Account" is below fold. Google/Microsoft SSO present (good) but no "your form is saved" reassurance. |
| `05-overlay-desktop.png` | Generating overlay | Clean 4-step layout. "2-4 minutes." Reassuring but **timer-based, not pipeline-based** — if real generation takes 5+ min, UI lies. No ETA, no entertainment, no upsell hint. |
| `05-overlay-mobile.png` | Overlay on mobile | Scales fine. Spinner is the only "alive" element — feels static after 30s. |

---

## Pipeline → Form Field Impact Map

This is what each form field actually drives in the generated report.

| Field | Drives | Quality Impact |
|---|---|---|
| `website_url` | Deep Firecrawl Map + Scrape → enriched company profile → feeds **every** section | **Critical** |
| `industry_sector` | All Perplexity queries, all DB matching, all sections | **Critical** |
| `country_of_origin` | Bilateral trade / regulatory research, all sections | High |
| `target_regions` | Cost-of-business Perplexity query, all DB matching | High |
| `selected_goals` | Mapped via `GOAL_SERVICE_TAGS` → provider/mentor matching | High |
| `key_challenges` | SWOT (Weaknesses + Threats), Action Plan risk mitigation | High |
| `target_customer_description` | Exec Summary, SWOT, Competitor, Service Providers, Action Plan, Lead List | **Very High** |
| `additional_notes` | Injected as "high-priority user request" into **all 9 sections** | **Very High** |
| `end_buyers` (sites) | Firecrawl scraped + AI procurement analysis → Lead List + Action Plan | High |
| `end_buyer_industries` | Perplexity procurement research, Lead List matching | Medium |
| `known_competitors` (sites) | Firecrawl scraped + AI competitive intel → Competitor Landscape section | High |
| `revenue_stage` | Investor matching (startup persona) | High (startup only) |
| `timeline` | Action Plan adapts (3mo sprint vs 12mo exploratory) | Medium |
| `budget_level` | Provider tier matching, investor check-size | Medium |

---

## Design goals (data-backed targets)

| Metric | Today | Target |
|---|---|---|
| Form completion rate (Step 1 entered → Generate clicked) | ~70% (estimated from pending vs completed) | **+30 pp → 90%+** |
| `target_customer_description` completion | 27.1% | **+50 pp → 75%+** |
| `additional_notes` completion | 33.9% | **+50 pp → 80%+** |
| Median form completion time | unknown — need instrumentation | **<3 min** |
| Avg `additional_notes` value length when filled | 16 chars | **+50 chars** (richer signal) |
| `report.feedback_score` | unknown baseline | **+1 point on 1–5 scale** |

---

## Required design patterns

### 1. Persona selection becomes Step 0
A dedicated landing decision before the form: two beautiful cards. "I'm entering Australia from overseas" vs "I'm scaling my Australian startup." Sets all downstream tone, goal options, and report queries. Tiny persona switch persists in the top-right of subsequent steps.

### 2. Website-first onboarding
Step 1 collapses to just `website_url` + `company_name`. On URL blur, run a lightweight Firecrawl scrape and **pre-fill industry, country guess, and even a draft target-customer description**. Show "We detected you're in {industry} — correct?" with chip confirm/edit. Track `website_scrape_accepted` for A/B analysis.

### 3. Smart goal cards (replaces 8 long checkboxes)
- Group the 16 goals into 5 categories (`People`, `Capital`, `Knowledge`, `Compliance`, `Ops`) — see `intakeSchema.v2.draft.ts` `GOAL_CATEGORIES`.
- Each goal as a card with an icon, short label, and a hint "→ unlocks {section} in report".
- Pre-select 2–3 popular goals based on persona + industry (use the top-goals data above).

### 4. Structured-then-free for the 3 problem textareas

**`target_customer_description` →** unified `target_customers` object:
- Customer type: B2B / B2C / B2G / Mixed (chip)
- Customer size: SMB / Mid-market / Enterprise / Mixed (chip)
- Buying motion: Direct / Channel / Self-serve / Mixed (chip)
- Industries: multi-select (up to 5)
- Named companies: up to 5 name+website rows
- Optional notes: 300-char text (was 500)

**`key_challenges` →** chip multi-select of 12 common challenges (per persona — see `COMMON_CHALLENGES`) + optional 200-char "other".

**`additional_notes` →** reframed as ONE PROMPTED QUESTION: *"What's the one thing you most want this report to answer?"* with 5 example prompt chips that auto-fill the field (`FOCUS_PROMPTS`). 200-char cap.

### 5. Live report preview rail (right side, desktop only)
As fields fill, show "Your report will include: ✓ Sydney market sizing, ✓ 3 competitor profiles, ✓ Lead list for fintech procurement…" — making each field's contribution visible and gamifying completion.

### 6. Auth modal upgrade
- Move auth to the START of generation (after Step 3), but show a HUGE reassurance message: "Your form is saved. Pick how you'd like to continue:" with prominent Google + Microsoft SSO buttons and a tiny "Email signup" link below.
- On the unauthenticated path, keep the auto-save (already in `localStorage`) but **show a green "Saved" indicator** on every step so users trust it.

### 7. Streaming progress overlay
Replace the time-based 4-step overlay with **real pipeline events**. The edge function already logs phases: "Map found N URLs", "Perplexity research completed in Xms", "Generating 9 sections...". Wire these up via Supabase realtime or polling on the `user_reports.status` field. Add:
- Real ETA based on elapsed phase time
- Micro-content during waits ("Did you know: 67% of UK fintechs that entered AU used the EMDG grant…")
- A tier-upsell prompt ("Want SWOT analysis? Unlock Growth tier for $X — your data is ready")

### 8. Inline-edit review (Step 3)
Replace two stacked cards with a single column of editable summary chips. Click any value to edit in place. No "Back" button needed.

---

## Constraints

- **Stack**: React 18 + Vite + TypeScript + Tailwind + shadcn/ui. Forms use `react-hook-form` + `zod`. Keep this.
- **Backend**: All intake data lands in `user_intake_forms` (Supabase). New columns are drafted in `intake_redesign_v2.draft.sql`.
- **Backward-compat**: The generate-report edge function consumes flat fields. The new schema includes a `mapV2ToLegacyIntake()` shim so the redesign can ship without touching the pipeline.
- **Persona-aware**: Every label, goal list, copy variant must support both paths. Don't bake "Australia" into copy startups (already in AU) will see.
- **Mobile-first**: 61% of usage is from non-AU regions where mobile-first ergonomics matter. Design 390px first.
- **Australian English**: All copy (organisation, analyse, personalise).
- **Accessibility**: All custom controls (chip selects, card toggles) need ARIA roles and keyboard nav.

---

## Engineering handoff artifacts (in this directory)

| File | Purpose |
|---|---|
| `REDESIGN_BRIEF.md` | This document |
| `intakeSchema.v2.draft.ts` | Replacement Zod schema with structured fields, goal-id-based matching, and a `mapV2ToLegacyIntake()` compatibility shim |
| `intake_redesign_v2.draft.sql` | Draft Supabase migration adding new columns, an analytics events table, an analyst view, and a one-time backfill |

**Filename `.draft.` prefix ensures the Supabase migrations runner ignores them until rename.**

---

## Deliverables expected from Claude Design

1. A redesigned 2- or 3-step flow (your call — argue for fewer steps if you keep parity)
2. High-fidelity mockups for desktop AND mobile of: persona selection, each intake step, the new review screen, the new generating/progress screen, and the auth moment
3. Component-level specs for: smart goal cards, structured-then-free inputs, live preview rail, inline-edit review
4. A field mapping document — every new field → DB column → report section consumer
5. A copy doc in both `international` and `startup` voice
6. Interaction states for every screen: empty, focused, filled, error, loading (especially the website-scrape moment), success

## Out of scope

- The report viewer (`/report/:reportId`) itself
- Tier gating logic
- The marketing landing page (`/`)
