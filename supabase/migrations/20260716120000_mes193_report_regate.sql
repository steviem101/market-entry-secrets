-- MES-193 (T1) — re-gate the report sections (owner-approved 2026-07-15).
--
-- Decision D2: investor_recommendations -> free. Plus swot_analysis and
-- competitor_landscape -> free (the "free report first" thrust). Decision D1:
-- first_customers growth -> scale. mentor_recommendations stays growth; lead_list
-- stays scale. Net free view: 8/11 sections (locked: mentor, first_customers,
-- lead_list).
--
-- The tier-gating truth lives in FOUR places that MUST move together (CLAUDE.md
-- §7). This migration owns the two server-side ones — the security-critical strip
-- point — and they change atomically here so paid prose can never leak to free/
-- anon between deploys (#38 must never reopen). The two client mirrors
-- (reportSectionConfig.ts TIER_REQUIREMENTS + report-quality-loop/rubric.ts) move
-- in the same PR.
--
-- Final gating map (only gated sections appear; everything else is free):
--   { mentor_recommendations: growth, first_customers: scale, lead_list: scale }
--
-- get_shared_report is REWRITTEN to DERIVE gating from the map at the FREE tier
-- (like the owner path) instead of keying off each report's STORED visible flag.
-- This makes re-gating atomic for public share links too — no backfill of old
-- rows, one source of truth, and a paid report can never be shared at full depth.
-- Safe because pre-launch every existing report is founder test data (MES-190);
-- new reports store correct visible flags from the updated report_templates below.
-- Idempotent: CREATE OR REPLACE + an UPDATE that only writes changed rows.

-- 1. report_templates.visibility_tier — drives the visible flags generate-report
--    STORES on new reports. Freed sections back to 'free'; first_customers to 'scale'.
update public.report_templates set visibility_tier = 'free'
  where section_name in ('swot_analysis', 'competitor_landscape', 'investor_recommendations')
    and visibility_tier is distinct from 'free';
update public.report_templates set visibility_tier = 'scale'
  where section_name = 'first_customers'
    and visibility_tier is distinct from 'scale';

-- 2. Owner path — derives gating from the map + the caller's current tier at read
--    time. Only the map changes; the derivation logic is unchanged.
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
    "mentor_recommendations": "growth",
    "first_customers": "scale",
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

-- 3. Public share path — now DERIVES from the map at the FREE tier (a section is
--    hidden iff it is in the map, since free meets none of growth/scale). No longer
--    reads the stored visible flag, so re-gating is atomic for shares too.
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
    "mentor_recommendations": "growth",
    "first_customers": "scale",
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

  -- A public share is a FREE-tier view: strip every section that the map gates
  -- above free (all map tiers are growth/scale). Derive from the map, not the
  -- stored visible flag, so a change to the map re-gates all share links at once.
  IF v_stripped ? 'sections' THEN
    FOR v_section_key, v_section_val IN
      SELECT key, value FROM jsonb_each(v_stripped->'sections')
    LOOP
      IF v_tier_requirements ? v_section_key THEN
        v_stripped := jsonb_set(
          v_stripped,
          ARRAY['sections', v_section_key],
          jsonb_build_object(
            'title', v_section_val->>'title',
            'visible', false,
            'required_tier', v_tier_requirements->>v_section_key
          )
        );
      END IF;
    END LOOP;
  ELSIF jsonb_typeof(v_stripped) = 'object' THEN
    FOR v_section_key, v_section_val IN
      SELECT key, value FROM jsonb_each(v_stripped)
    LOOP
      IF jsonb_typeof(v_section_val) = 'object'
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
