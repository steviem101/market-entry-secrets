-- "Your First Customers" v2: dedicated growth-tier report section (ticket: Your
-- First Customers — v1 shipped inside action_plan via #378; this promotes it).
--
-- Three coordinated pieces (the section/tier invariant — reportSectionConfig.ts,
-- rubric.ts and this migration must move together; the frontend + rubric halves
-- are in the same PR):
--   1. report_templates row (visibility_tier growth) — idempotent insert.
--   2. get_tier_gated_report: add first_customers → growth to v_tier_requirements
--      (the security-critical strip point for signed-in readers).
--   3. get_shared_report: same addition (the strip point for public share links).
-- Both functions are otherwise byte-identical to their current prod definitions.

-- 1. Section template. The heavy per-account instructions + data are injected by
-- generate-report as a system-prompt note (buildBuyerBriefsNote — it carries the
-- dynamic unverified/cap/ICP logic a static template cannot), so the template body
-- stays lean and simply anchors the section + its no-chips fallback.
insert into public.report_templates (section_name, prompt_body, visibility_tier, is_active)
select
  'first_customers',
  'Write the "Your First Customers" section for {{company_name}}, a {{company_stage}} company targeting {{target_regions}}. Their stated ideal customer: {{target_customer_description}}. Follow the YOUR FIRST CUSTOMERS instructions and ACCOUNT DATA provided in the system message EXACTLY — they contain the named target accounts and per-account structure. If the system message contains no account data, write 2-3 sentences explaining that naming specific target companies in the intake unlocks per-account briefs (who to approach, live hiring and tech signals), and recommend adding them. Never invent companies, people, tech stacks, or figures.',
  'growth',
  true
where not exists (
  select 1 from public.report_templates where section_name = 'first_customers'
);

-- 2. Signed-in strip point: identical to prod except first_customers → growth.
CREATE OR REPLACE FUNCTION public.get_tier_gated_report(p_report_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_report RECORD;
  v_user_tier TEXT;
  v_tier_hierarchy TEXT[] := ARRAY['free', 'growth', 'scale', 'enterprise'];
  v_user_tier_index INT;
  v_section_key TEXT;
  v_required_tier TEXT;
  v_required_index INT;
  v_gated_json JSONB;
  v_tier_requirements JSONB := '{
    "swot_analysis": "growth",
    "competitor_landscape": "growth",
    "first_customers": "growth",
    "mentor_recommendations": "growth",
    "investor_recommendations": "growth",
    "lead_list": "scale"
  }'::JSONB;
BEGIN
  SELECT * INTO v_report FROM public.user_reports WHERE id = p_report_id;

  IF v_report IS NULL THEN
    RETURN NULL;
  END IF;

  IF v_report.user_id != auth.uid() THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(tier, 'free') INTO v_user_tier
  FROM public.user_subscriptions
  WHERE user_id = auth.uid();

  IF v_user_tier IS NULL THEN
    v_user_tier := 'free';
  END IF;

  IF v_user_tier = 'premium' THEN v_user_tier := 'growth'; END IF;
  IF v_user_tier = 'concierge' THEN v_user_tier := 'enterprise'; END IF;

  v_user_tier_index := array_position(v_tier_hierarchy, v_user_tier);
  IF v_user_tier_index IS NULL THEN
    v_user_tier_index := 1;
  END IF;

  v_gated_json := v_report.report_json;

  IF v_gated_json ? 'sections' THEN
    FOR v_section_key IN SELECT jsonb_object_keys(v_gated_json->'sections')
    LOOP
      v_required_tier := v_tier_requirements->>v_section_key;
      IF v_required_tier IS NOT NULL THEN
        v_required_index := array_position(v_tier_hierarchy, v_required_tier);
        IF v_user_tier_index < v_required_index THEN
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
$function$;

-- 3. Public-share strip point: identical to prod except first_customers → growth.
CREATE OR REPLACE FUNCTION public.get_shared_report(p_share_token uuid)
 RETURNS TABLE(id uuid, user_id uuid, intake_form_id uuid, tier_at_generation text, report_json jsonb, sections_generated text[], status text, feedback_score integer, feedback_notes text, created_at timestamp with time zone, updated_at timestamp with time zone, share_token uuid)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_report public.user_reports;
  v_stripped jsonb;
  v_section_key text;
  v_section_val jsonb;
  v_tier_requirements jsonb := '{
    "swot_analysis": "growth",
    "competitor_landscape": "growth",
    "first_customers": "growth",
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
$function$;
