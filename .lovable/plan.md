

# Make Industry / Sector Multi-Select

## Overview

Change the Industry / Sector field from a single-select string to a multi-select array, allowing users to choose multiple industries from the 149 approved options. This requires changes across the database, backend edge function, frontend form, and validation trigger.

## What changes for the user

- The Industry / Sector field becomes a **multi-select combobox** -- users can pick multiple industries (e.g. "AI" + "SaaS" + "Computer Software")
- Selected industries appear as removable badges below the selector
- The review step (Step 3) shows all selected industries as badges instead of a single text value
- The generated report will reference all selected industries for better matching and more relevant results

## Changes required

### 1. Database migration

- **Alter column type**: Change `user_intake_forms.industry_sector` from `text` to `text[]` (array)
- **Migrate existing data**: Convert all existing single-value rows to single-element arrays (e.g. `'AI'` becomes `ARRAY['AI']`)
- **Drop old trigger**: Remove `validate_industry_sector_trigger` and `validate_industry_sector()` function
- **Create new trigger**: New validation function that checks every element of the `industry_sector` array is in the approved 149-option list, and that the array is not empty

### 2. Frontend -- Schema (`intakeSchema.ts`)

- Change `industry_sector` from `z.string().min(1)` to `z.array(z.string()).min(1, 'Select at least one industry')`
- Update the `IntakeFormData` type (auto-derived from Zod)

### 3. Frontend -- Step 1 form (`IntakeStep1.tsx`)

- Convert the combobox from single-select to multi-select:
  - Clicking an industry toggles it on/off (instead of closing the popover)
  - Display selected industries as removable badges below the trigger button
  - The trigger button shows count text like "3 industries selected" instead of a single value
  - An "X" button on each badge allows removing individual selections

### 4. Frontend -- Step 3 review (`IntakeStep3.tsx`)

- Change from displaying `data.industry_sector` as a single `<p>` to rendering it as badges (same pattern used for `target_regions` and `services_needed`)

### 5. Frontend -- Default values (`ReportCreator.tsx`)

- Change `industry_sector: ''` to `industry_sector: []`

### 6. API layer (`reportApi.ts`)

- The `industry_sector` field is already passed through to Supabase -- no code change needed since it will now be an array matching the new column type

### 7. Edge function -- Report generation (`generate-report/index.ts`)

- **Variable assignment** (line 789): Change from `intake.industry_sector` (string) to `(intake.industry_sector || []).join(", ")` (join array for template interpolation)
- **Fallback summary** (line 725): Same join treatment
- **Competitor search** (line 280): Join the array for the search query
- **Leads matching** (line 619): Change from single `ilike` to an `or` filter across all selected industries
- **Lemlist matching** (line 661): Same multi-industry `or` filter
- **Perplexity queries** (lines 395-401): Join the array for natural language queries

## Technical notes

- The database column type change from `text` to `text[]` is safe because we first convert all existing data
- The validation trigger ensures no invalid industries can be inserted, even via direct SQL
- The `cmdk` combobox already supports the toggle pattern -- we just stop closing the popover on select and track an array instead of a single value
- Report templates use `{{industry_sector}}` which will now receive a comma-separated string (e.g. "AI, SaaS, Computer Software") -- this reads naturally in AI prompts

