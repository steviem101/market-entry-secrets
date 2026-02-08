
-- Fix stale visible:false flags in existing report
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
