

# Add Countries + "Other" Custom Input to Country of Origin

## Overview

Add Australia, New Zealand, and Japan to the Country of Origin dropdown, and when the user selects "Other", show a text input where they can type their actual country name.

## What changes for the user

- The dropdown now includes **Australia**, **New Zealand**, and **Japan** in addition to the existing 9 countries
- When "Other" is selected, a text input appears below the dropdown with placeholder "Enter your country"
- The custom country value is what gets stored and sent to the report generator (not the word "Other")
- Step 3 review shows the actual country name regardless of whether it was a preset or custom entry

## Changes required

### 1. Schema (`intakeSchema.ts`)

- Add `'Australia'`, `'New Zealand'`, `'Japan'` to the `COUNTRY_OPTIONS` array (placed alphabetically or in a logical order -- Australia and New Zealand first since this is an ANZ-focused platform, then the rest alphabetically)
- No Zod schema change needed -- `country_of_origin` is already `z.string().min(1)` which accepts any string value

**Updated list order:**
1. Australia
2. New Zealand
3. United States
4. United Kingdom
5. Ireland
6. Canada
7. Germany
8. France
9. Japan
10. Singapore
11. South Korea
12. India
13. Other

### 2. Step 1 form (`IntakeStep1.tsx`)

- Add local state: `const [customCountry, setCustomCountry] = useState('')`
- Watch the `country_of_origin` field value
- When user selects "Other" from the dropdown, show a text `Input` below with placeholder "Enter your country"
- When the user types in the custom input, call `setValue('country_of_origin', customCountryValue)` so the actual country name (not "Other") is stored in the form
- When user selects "Other", set the form value to the custom input's current value (or empty, triggering validation)
- When user switches away from "Other" back to a preset country, hide the custom input
- On component mount, if the loaded draft value is not in the preset list, auto-set the dropdown to "Other" and populate the custom input with the draft value

### 3. Step 3 review (`IntakeStep3.tsx`)

- No change needed -- it already displays `data.country_of_origin` which will contain either the preset value or the custom-typed country name

### 4. No database or edge function changes

- The `country_of_origin` column is already `text` type -- it accepts any string
- The report generation pipeline already uses `intake.country_of_origin` as a plain string in prompts and queries

## Technical approach

The key UX detail: when "Other" is selected, the form's `country_of_origin` value should be the custom text the user types, NOT the literal string "Other". This means:

- The `Select` component tracks a separate "selection mode" (`isOther`) rather than binding directly to form value
- The form value (`country_of_origin`) always contains the real country name
- When restoring from a draft, if the saved value does not match any preset option, the dropdown shows "Other" and the input is pre-filled

