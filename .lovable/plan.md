

# Add "End Buyers" Property to the Intake Form

## Overview

Add a new "End Buyers" section to Step 2 of the Report Creator. This has two parts:

1. **Target End Buyer Industries** -- a multi-select searchable combobox using the same 149 industry options as the "Industry / Sector" field on Step 1
2. **Example End Buyers** -- a dynamic list of specific companies (name + website), following the exact same pattern as the "Known Competitors" field

This helps the report generator understand who the user's customers are in Australia, enabling better lead matching and market analysis.

## What changes for the user

- A new "End Buyers" section appears on Step 2, between "Key Challenges" and "Known Competitors"
- First, users select which industries their end buyers belong to (using the same searchable combobox as the Industry/Sector picker on Step 1)
- Then, they can optionally add up to 5 specific end buyer companies with name and website URL
- Step 3 (Review) shows both the selected industries and any named end buyers
- The entire field is optional -- users can skip it

## Changes required

### 1. Database migration

Add two new columns to `user_intake_forms`:

| Column | Type | Default | Purpose |
|---|---|---|---|
| `end_buyer_industries` | `text[]` | `'{}'::text[]` | Selected industry categories for end buyers |
| `end_buyers` | `jsonb` | `'[]'::jsonb` | Array of `{ name, website }` objects (same structure as `known_competitors`) |

Both nullable, both optional. The `end_buyer_industries` values come from the same validated 149-industry list, but since end buyers may belong to industries outside the user's own sector, no trigger validation is needed here (the frontend enforces the options).

### 2. Schema (`intakeSchema.ts`)

- Add `end_buyer_industries` to `step2Schema`: `z.array(z.string()).optional().default([])`
- Add `end_buyers` to `step2Schema`: `z.array(competitorSchema).max(5).optional().default([])`
  - Reuses the existing `competitorSchema` (name + website with URL auto-prepend)

### 3. Step 2 form (`IntakeStep2.tsx`)

Add a new section between "Key Challenges" and "Known Competitors" with:

**End Buyer Industries (multi-select combobox):**
- Same searchable `Popover` + `Command` pattern used for Industry/Sector on Step 1
- Uses the same `INDUSTRY_OPTIONS` list
- Selected industries shown as removable badges below the combobox
- Label: "End Buyer Industries"
- Helper text: "What industries do your target customers belong to? (optional)"

**Example End Buyers (dynamic name + website rows):**
- Identical UI pattern to Known Competitors
- Label: "Example End Buyers"
- Helper text: "Add specific companies you want to sell to in Australia (optional, max 5)"
- Each row: Name input + Website input with Globe icon + X remove button
- "Add End Buyer" button (hidden when 5 already added)

### 4. Step 3 review (`IntakeStep3.tsx`)

Add a new summary card (between Market Entry Goals and Known Competitors) that shows:
- Selected end buyer industries as badges
- Named end buyers as name + clickable website link (same layout as competitors)
- Only renders if either list has entries

### 5. Default values (`ReportCreator.tsx`)

Add to `defaultValues`:
- `end_buyer_industries: []`
- `end_buyers: []`

### 6. API layer (`reportApi.ts`)

Add to the insert payload:
- `end_buyer_industries: data.end_buyer_industries || []`
- `end_buyers: data.end_buyers || []`

### 7. Edge function (`generate-report/index.ts`)

- Read `intake.end_buyer_industries` and `intake.end_buyers` from the intake form
- If end buyers have websites, scrape them via Firecrawl (same best-effort pattern as known competitors) to understand what these companies do
- Pass end buyer context into the AI prompt template variables so report sections can reference the user's target customer profile
- This enriches sections like executive summary, action plan, and lead list with buyer-aware recommendations

## Technical notes

- Reuses `competitorSchema` for the end buyer entries since both have the same name + website structure
- Reuses `INDUSTRY_OPTIONS` for the combobox, no duplication
- The searchable combobox pattern is copied from `IntakeStep1.tsx` (Industry/Sector picker)
- Both fields are fully optional with empty defaults, so existing forms are unaffected
- Max 5 end buyers keeps scraping workload reasonable within the edge function timeout

