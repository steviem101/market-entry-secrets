-- HIGH FIX: Server-side report tier gating.
--
-- Currently the full report_json (including ALL premium sections) is returned
-- to the client, and tier gating is done only in the React UI. A user can
-- open DevTools to see premium sections they haven't paid for.
--
-- This function filters report_json server-side, removing sections the user's
-- current tier doesn't grant access to. The frontend should call this RPC
-- instead of querying user_reports directly.

CREATE OR REPLACE FUNCTION public.get_tier_gated_report(p_report_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_report RECORD;
  v_user_tier TEXT;
  v_tier_hierarchy TEXT[] := ARRAY['free', 'growth', 'scale', 'enterprise'];
  v_user_tier_index INT;
  v_section_key TEXT;
  v_required_tier TEXT;
  v_required_index INT;
  v_gated_json JSONB;
  -- Section tier requirements (must match reportSectionConfig.ts TIER_REQUIREMENTS)
  v_tier_requirements JSONB := '{
    "swot_analysis": "growth",
    "competitor_landscape": "growth",
    "mentor_recommendations": "growth",
    "investor_recommendations": "growth",
    "lead_list": "scale"
  }'::JSONB;
BEGIN
  -- Fetch the report (RLS ensures only owner can see their own reports)
  SELECT * INTO v_report FROM public.user_reports WHERE id = p_report_id;

  IF v_report IS NULL THEN
    RETURN NULL;
  END IF;

  -- Verify caller owns this report
  IF v_report.user_id != auth.uid() THEN
    RETURN NULL;
  END IF;

  -- Get user's current subscription tier
  SELECT COALESCE(tier, 'free') INTO v_user_tier
  FROM public.user_subscriptions
  WHERE user_id = auth.uid();

  IF v_user_tier IS NULL THEN
    v_user_tier := 'free';
  END IF;

  -- Map legacy tiers
  IF v_user_tier = 'premium' THEN v_user_tier := 'growth'; END IF;
  IF v_user_tier = 'concierge' THEN v_user_tier := 'enterprise'; END IF;

  v_user_tier_index := array_position(v_tier_hierarchy, v_user_tier);
  IF v_user_tier_index IS NULL THEN
    v_user_tier_index := 1; -- default to 'free'
  END IF;

  -- Start with the full report JSON
  v_gated_json := v_report.report_json;

  -- Check the 'sections' key if it exists
  IF v_gated_json ? 'sections' THEN
    FOR v_section_key IN SELECT jsonb_object_keys(v_gated_json->'sections')
    LOOP
      v_required_tier := v_tier_requirements->>v_section_key;
      IF v_required_tier IS NOT NULL THEN
        v_required_index := array_position(v_tier_hierarchy, v_required_tier);
        IF v_user_tier_index < v_required_index THEN
          -- Remove the gated section's content, keep a stub
          v_gated_json := jsonb_set(
            v_gated_json,
            ARRAY['sections', v_section_key],
            jsonb_build_object(
              'title', v_gated_json->'sections'->v_section_key->>'title',
              'visible', false,
              'required_tier', v_required_tier
            )
          );
        END IF;
      END IF;
    END LOOP;
  ELSE
    -- If report_json uses top-level section keys instead of nested 'sections'
    FOR v_section_key IN SELECT jsonb_object_keys(v_gated_json)
    LOOP
      v_required_tier := v_tier_requirements->>v_section_key;
      IF v_required_tier IS NOT NULL THEN
        v_required_index := array_position(v_tier_hierarchy, v_required_tier);
        IF v_user_tier_index < v_required_index THEN
          v_gated_json := jsonb_set(
            v_gated_json,
            ARRAY[v_section_key],
            jsonb_build_object(
              'title', COALESCE(v_gated_json->v_section_key->>'title', v_section_key),
              'visible', false,
              'required_tier', v_required_tier
            )
          );
        END IF;
      END IF;
    END LOOP;
  END IF;

  RETURN v_gated_json;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_tier_gated_report(UUID) TO authenticated;
