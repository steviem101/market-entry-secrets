-- MES-188 T4 — intent-aware teasers for locked report sections (owner-approved).
--
-- Free/lower-tier viewers see a COUNT + a REDACTED sample for each locked section
-- ("8 mentors matched" + expertise tags only) instead of a bare locked panel.
-- This is the security-critical strip point (#38), so the redaction is:
--   * ALLOWLIST-only — the teaser is built with jsonb_build_object naming ONLY
--     non-sensitive keys; a match's name/company/website/description/email/link
--     can never appear because those keys are never referenced.
--   * grounded in the real match shapes (audited 2026-07-17): mentor cards carry
--     name/company/website (sensitive) + specialties/sector_tags/tags (expertise);
--     first_customers carry name/website (sensitive) + tags (sector); lead_list
--     matches are lead-DATABASE CATALOG cards (name/sector/record_count) — the
--     individual lead PII lives in lead_database_records, never in report_json.
--   * gated behind the caller passing p_include_teasers=true (the client
--     `report_teasers` flag, default off). With the default (false), this RPC
--     returns EXACTLY what it did before — zero behaviour change when the flag
--     is off. get_shared_report (public shares) is deliberately NOT touched:
--     public share links never get teasers in v1 (most-exposed surface).

-- 1. Pure, immutable redaction helper. Allowlist per section; lead_list counts
--    only dataset cards (card_group='leads'), never the mixed-in lemlist contacts.
--    Internal-only: revoked from PUBLIC so it can't be called directly via the
--    API; get_tier_gated_report (SECURITY DEFINER) calls it in the owner context.
create or replace function public.report_section_teaser(p_section_key text, p_matches jsonb)
returns jsonb
language sql
immutable
as $function$
  with all_m as (
    select value as m, ordinality
    from jsonb_array_elements(
      case when jsonb_typeof(p_matches) = 'array' then p_matches else '[]'::jsonb end
    ) with ordinality
  ),
  filtered as (
    select m, ordinality from all_m
    where p_section_key <> 'lead_list' or coalesce(m->>'card_group', 'leads') = 'leads'
  ),
  redacted as (
    select ordinality,
      case p_section_key
        when 'mentor_recommendations' then jsonb_strip_nulls(jsonb_build_object(
          'expertise', coalesce(m->'specialties', m->'sector_tags', m->'tags')))
        when 'first_customers' then jsonb_strip_nulls(jsonb_build_object(
          'sector', coalesce(m->'tags', m->'sector_tags')))
        when 'lead_list' then jsonb_strip_nulls(jsonb_build_object(
          -- detail as a string array so the generic chip renderer shows it
          'detail', to_jsonb(array_remove(array[
            m->>'sector',
            m->>'list_type',
            case when m->>'record_count' is not null then (m->>'record_count') || ' records' end
          ], null))))
        else '{}'::jsonb
      end as red
    from filtered
    order by ordinality
    limit case p_section_key when 'lead_list' then 3 else 1 end
  )
  select jsonb_build_object(
    'count', (select count(*) from filtered),
    'samples', coalesce((select jsonb_agg(red order by ordinality) from redacted), '[]'::jsonb)
  );
$function$;

revoke execute on function public.report_section_teaser(text, jsonb) from public;

-- 2. Owner path — add p_include_teasers (default false). When true AND a section
--    is gated for the caller, attach the redacted teaser. Signature changes, so
--    drop+recreate; the default keeps every existing 1-arg caller working.
drop function if exists public.get_tier_gated_report(uuid);

CREATE OR REPLACE FUNCTION public.get_tier_gated_report(p_report_id uuid, p_include_teasers boolean DEFAULT false)
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
            jsonb_strip_nulls(jsonb_build_object(
              'title', v_gated_json->'sections'->v_section_key->>'title',
              'visible', false,
              'required_tier', v_required_tier,
              'teaser', CASE WHEN p_include_teasers
                THEN public.report_section_teaser(v_section_key, v_gated_json->'sections'->v_section_key->'matches')
                ELSE NULL END
            ))
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
            jsonb_strip_nulls(jsonb_build_object(
              'title', COALESCE(v_gated_json->v_section_key->>'title', v_section_key),
              'visible', false,
              'required_tier', v_required_tier,
              'teaser', CASE WHEN p_include_teasers
                THEN public.report_section_teaser(v_section_key, v_gated_json->v_section_key->'matches')
                ELSE NULL END
            ))
          );
        END IF;
      END IF;
    END LOOP;
  END IF;

  RETURN v_gated_json;
END;
$function$;

-- Match the original grants exactly: authenticated + service_role only, never
-- anon/PUBLIC (the recreated function would otherwise inherit default PUBLIC
-- EXECUTE). The function self-guards on auth.uid() regardless.
revoke execute on function public.get_tier_gated_report(uuid, boolean) from public;
grant execute on function public.get_tier_gated_report(uuid, boolean) to authenticated, service_role;
