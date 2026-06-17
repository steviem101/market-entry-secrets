-- =====================================================================
-- get_shared_report parity with get_tier_gated_report for the legacy
-- top-level-section-keys report_json shape.
--
-- 20260616012000 added a strip that walks report_json.sections (the
-- shape every post-P0-3 report uses). get_tier_gated_report
-- (20260301200003) has a second branch that handles the legacy shape
-- where section names sit at the top level of report_json instead of
-- under a `sections` key. get_shared_report did not. Mirror that ELSE
-- branch so the two RPCs cannot disagree on which fields are stripped.
--
-- No current leak: pre-P0-3 gated sections were stored with empty
-- content, so nothing's exposed even in the legacy shape. This closes
-- the latent parity gap so a future format change can't quietly
-- reintroduce one.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.get_shared_report(p_share_token uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  intake_form_id uuid,
  tier_at_generation text,
  report_json jsonb,
  sections_generated text[],
  status text,
  feedback_score integer,
  feedback_notes text,
  created_at timestamptz,
  updated_at timestamptz,
  share_token uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_report public.user_reports;
  v_stripped jsonb;
  v_section_key text;
  v_section_val jsonb;
  v_tier_requirements jsonb := '{
    "swot_analysis": "growth",
    "competitor_landscape": "growth",
    "mentor_recommendations": "growth",
    "investor_recommendations": "growth",
    "lead_list": "scale"
  }'::jsonb;
BEGIN
  SELECT * INTO v_report
  FROM public.user_reports r
  WHERE r.share_token = p_share_token
    AND r.share_token IS NOT NULL
    AND r.status = 'completed';

  IF NOT FOUND THEN
    RETURN;
  END IF;

  v_stripped := v_report.report_json;

  IF v_stripped ? 'sections' THEN
    FOR v_section_key, v_section_val IN
      SELECT key, value FROM jsonb_each(v_stripped->'sections')
    LOOP
      IF (v_section_val->>'visible') = 'false' THEN
        v_stripped := jsonb_set(
          v_stripped,
          ARRAY['sections', v_section_key],
          jsonb_build_object(
            'title', v_section_val->>'title',
            'visible', false,
            'required_tier', COALESCE(v_tier_requirements->>v_section_key, 'growth')
          )
        );
      END IF;
    END LOOP;
  ELSIF jsonb_typeof(v_stripped) = 'object' THEN
    -- Legacy shape: section keys at the top level of report_json. Mirror
    -- get_tier_gated_report's ELSE branch so the strip behaves identically
    -- regardless of which JSON shape an older report happens to use.
    FOR v_section_key, v_section_val IN
      SELECT key, value FROM jsonb_each(v_stripped)
    LOOP
      IF jsonb_typeof(v_section_val) = 'object'
         AND (v_section_val->>'visible') = 'false'
         AND v_tier_requirements ? v_section_key THEN
        v_stripped := jsonb_set(
          v_stripped,
          ARRAY[v_section_key],
          jsonb_build_object(
            'title', COALESCE(v_section_val->>'title', v_section_key),
            'visible', false,
            'required_tier', v_tier_requirements->>v_section_key
          )
        );
      END IF;
    END LOOP;
  END IF;

  RETURN QUERY
  SELECT
    v_report.id,
    v_report.user_id,
    v_report.intake_form_id,
    v_report.tier_at_generation,
    v_stripped,
    v_report.sections_generated,
    v_report.status,
    v_report.feedback_score,
    v_report.feedback_notes,
    v_report.created_at,
    v_report.updated_at,
    v_report.share_token;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_shared_report(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_shared_report(uuid) TO anon, authenticated;
