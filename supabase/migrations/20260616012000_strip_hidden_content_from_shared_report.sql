-- =====================================================================
-- Strip tier-gated content from get_shared_report so shared reports
-- don't leak premium prose to anyone with the share URL.
--
-- After 20260615 commit efb9686 ("Generate all sections + store gated
-- content hidden"), gated sections live in report_json with
-- `visible:false` AND the full premium prose. The owner's main viewer
-- goes through get_tier_gated_report which strips that content, but
-- get_shared_report previously returned report_json raw. Anyone with
-- a share URL could open DevTools and read every premium section.
--
-- Mirror the strip logic into get_shared_report: walk every section
-- under report_json.sections and, if value->>visible is 'false',
-- replace the section with a thin stub {title, visible:false,
-- required_tier} — same shape that get_tier_gated_report emits.
--
-- Keep the existing signature (p_share_token uuid) and grant set
-- (anon + authenticated) so the frontend caller in
-- src/lib/api/reportApi.ts:248 is unaffected.
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
  -- Section tier requirements (must match reportSectionConfig.ts TIER_REQUIREMENTS
  -- and get_tier_gated_report). Used to attach `required_tier` to each stub so
  -- the UI can render the right upsell CTA per gated section.
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
