

# Fix Report Sections Still Locked After Tier Upgrade

## Root Cause

When a report is generated, the `generate-report` edge function checks the user's subscription tier **at that moment** and writes `visible: false` into the `report_json` for sections above the user's tier. This flag is stored as static data inside the JSON column and **never gets updated** when the user upgrades.

The frontend (`ReportView.tsx` line 128) checks `section.visible === false` and shows the lock overlay -- it does not re-check the user's current subscription tier.

Your report currently has these sections with `visible: false` baked in:
- `swot_analysis`
- `mentor_recommendations`
- `lead_list`
- `competitor_landscape`

## Plan

### Step 1: Fix the data (SQL migration)

Update the `report_json` to set `visible = true` on all four locked sections for your existing report:

```text
UPDATE user_reports
SET report_json = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        report_json,
        '{sections,swot_analysis,visible}', 'true'
      ),
      '{sections,mentor_recommendations,visible}', 'true'
    ),
    '{sections,lead_list,visible}', 'true'
  ),
  '{sections,competitor_landscape,visible}', 'true'
),
updated_at = now()
WHERE id = '2bfe9ed5-0460-4e25-b02d-9dc0e8229360';
```

### Step 2: Fix the frontend (code change)

Update `ReportView.tsx` to dynamically check the user's current subscription tier rather than relying on the static `visible` flag. The logic will:

1. Import `useSubscription` hook
2. Compare each section's required tier against the user's **current** tier
3. Only show the gated overlay if the user's current tier is too low -- ignoring the stale `visible` flag in the JSON

This means future tier upgrades will automatically unlock all relevant sections without needing database edits.

### Step 3: Add `competitor_landscape` to the section list

The report contains a `competitor_landscape` section that is not in the `SECTION_ORDER` or `SECTION_LABELS` arrays, so it would never render even if unlocked. Add it to both arrays.

## Files changed

| File | Change |
|------|--------|
| `supabase/migrations/...` | SQL to set `visible: true` on all locked sections |
| `src/pages/ReportView.tsx` | Import `useSubscription`, add dynamic tier check, add `competitor_landscape` to section order and labels |

## Result

- All sections in your existing report will display immediately
- Future tier upgrades will auto-unlock sections without needing manual SQL fixes
- The new Competitor Landscape section will also render

