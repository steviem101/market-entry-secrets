

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE SCHEMA IF NOT EXISTS "private";


ALTER SCHEMA "private" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'moderator',
    'user'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."subscription_tier" AS ENUM (
    'free',
    'premium',
    'concierge',
    'growth',
    'scale',
    'enterprise'
);


ALTER TYPE "public"."subscription_tier" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."any_sector_agnostic"("raws" "text"[]) RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM unnest(coalesce(raws, '{}'::text[])) AS r
    JOIN public.sector_vocabulary sv ON sv.raw_value = lower(trim(r))
    WHERE sv.is_agnostic
  );
$$;


ALTER FUNCTION "public"."any_sector_agnostic"("raws" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_generate_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_generate_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_chat_session_id"() RETURNS "text"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  SELECT NULLIF(
    COALESCE(
      current_setting('request.headers', true)::json->>'x-session-id',
      ''
    ),
    ''
  );
$$;


ALTER FUNCTION "public"."current_chat_session_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."detect_funnel_gate_hits"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare inserted_count integer;
begin
  with recent as (
    select distinct session_id from public.user_usage
    where session_id is not null and viewed_at >= now() - interval '90 minutes'
  ),
  crossed as (
    select u.session_id, count(distinct coalesce(u.content_type,'') || ':' || coalesce(u.item_id,'')) as distinct_views
    from public.user_usage u
    where u.session_id in (select session_id from recent)
    group by u.session_id
    having count(distinct coalesce(u.content_type,'') || ':' || coalesce(u.item_id,'')) >= 3
  ),
  ins as (
    insert into public.activity_events (event_type, severity, actor_name, object_type, metadata, dedup_key)
    select 'funnel.gate_hit','info', null, 'user_usage',
           jsonb_build_object('session_id', c.session_id, 'distinct_views', c.distinct_views),
           'funnel.gate_hit:'||c.session_id
    from crossed c
    on conflict (dedup_key) do nothing
    returning 1
  )
  select count(*) into inserted_count from ins;
  return inserted_count;
end $$;


ALTER FUNCTION "public"."detect_funnel_gate_hits"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."dispatch_activity_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare r public.activity_event_routing; secret text; fn_url text;
begin
  select * into r from public.activity_event_routing where event_type = NEW.event_type;
  if not found or not r.enabled or not r.realtime then return NEW; end if;
  select decrypted_secret into secret from vault.decrypted_secrets where name = 'slack_notify_webhook_secret' limit 1;
  select decrypted_secret into fn_url from vault.decrypted_secrets where name = 'slack_notify_url' limit 1;
  if secret is null or fn_url is null then
    raise log 'dispatch_activity_event: missing slack_notify secret or url'; return NEW;
  end if;
  perform net.http_post(
    url := fn_url,
    headers := jsonb_build_object('Content-Type','application/json','x-webhook-secret', secret),
    body := jsonb_build_object('event_id', NEW.id),
    timeout_milliseconds := 15000);
  return NEW;
exception when others then raise log 'dispatch_activity_event failed for %: %', NEW.id, sqlerrm; return NEW;
end $$;


ALTER FUNCTION "public"."dispatch_activity_event"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."emit_chat_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  perform public.log_activity('chat.started','info', NEW.user_id, null, null,
    'ai_chat_conversations', NEW.id, jsonb_build_object('session_id', NEW.session_id),
    'chat.started:'||NEW.id::text);
  return NEW;
exception when others then raise log 'emit_chat_activity failed: %', sqlerrm; return NEW;
end $$;


ALTER FUNCTION "public"."emit_chat_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."emit_directory_submission_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  is_intro boolean;
  evt text;
begin
  is_intro := (NEW.submission_type like '%_intro')
           or (NEW.form_data->>'content_type' = 'intro_request');
  evt := case when is_intro then 'intro.requested' else 'submission.received' end;

  perform public.log_activity(
    evt, 'action',
    null, NEW.contact_email, NEW.form_data->>'requester_name',
    'directory_submissions', NEW.id,
    jsonb_build_object(
      'submission_type', NEW.submission_type,
      'entity', NEW.form_data->>'entity',
      'target_name', NEW.form_data->>'target_name',
      'requester_company', NEW.form_data->>'requester_company'),
    'ds:' || NEW.id::text);
  return NEW;
exception when others then
  raise log 'emit_directory_submission_activity failed: %', sqlerrm;
  return NEW;
end;
$$;


ALTER FUNCTION "public"."emit_directory_submission_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."emit_email_lead_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  perform public.log_activity('email.captured','info', null, NEW.email, null,
    'email_leads', NEW.id, jsonb_build_object('source', NEW.source),
    'email.captured:'||NEW.id::text);
  return NEW;
exception when others then raise log 'emit_email_lead_activity failed: %', sqlerrm; return NEW;
end $$;


ALTER FUNCTION "public"."emit_email_lead_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."emit_email_log_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare is_fail boolean; was_fail boolean;
begin
  is_fail := (NEW.status in ('failed','bounced','complained','error'));
  if not is_fail then return NEW; end if;
  if TG_OP = 'UPDATE' then
    was_fail := (OLD.status in ('failed','bounced','complained','error'));
    if was_fail then return NEW; end if;
  end if;
  perform public.log_activity('email.failed','error', NEW.user_id, NEW.recipient_email, null, 'email_log', NEW.id,
    jsonb_build_object('email_type', NEW.email_type, 'status', NEW.status, 'error', NEW.error_message),
    'email.failed:'||NEW.id::text);
  return NEW;
exception when others then raise log 'emit_email_log_activity failed: %', sqlerrm; return NEW;
end $$;


ALTER FUNCTION "public"."emit_email_log_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."emit_intake_form_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare evt text; sev text; ddk text;
begin
  if TG_OP = 'INSERT' then
    perform public.log_activity('report.requested','info', NEW.user_id, null, null, 'user_intake_forms', NEW.id,
      jsonb_build_object('company', NEW.company_name, 'country', NEW.country_of_origin, 'industry', NEW.industry_sector),
      'report.requested:'||NEW.id::text);
    return NEW;
  end if;
  if NEW.status is not distinct from OLD.status then return NEW; end if;
  if NEW.status = 'processing' then evt := 'report.started'; sev := 'info'; ddk := 'report.started:'||NEW.id::text;
  elsif NEW.status = 'failed' then evt := 'report.failed'; sev := 'error'; ddk := 'report.failed:'||NEW.id::text;
  else return NEW; end if;
  perform public.log_activity(evt, sev, NEW.user_id, null, null, 'user_intake_forms', NEW.id,
    jsonb_build_object('company', NEW.company_name, 'country', NEW.country_of_origin), ddk);
  return NEW;
exception when others then raise log 'emit_intake_form_activity failed: %', sqlerrm; return NEW;
end $$;


ALTER FUNCTION "public"."emit_intake_form_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."emit_lead_submission_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  perform public.log_activity(
    'lead.submitted', 'action',
    null, NEW.email, null,
    'lead_submissions', NEW.id,
    jsonb_build_object(
      'sector', NEW.sector,
      'target_market', NEW.target_market),
    'ls:' || NEW.id::text);
  return NEW;
exception when others then
  raise log 'emit_lead_submission_activity failed: %', sqlerrm;
  return NEW;
end;
$$;


ALTER FUNCTION "public"."emit_lead_submission_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."emit_mentor_contact_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  perform public.log_activity('intro.requested','action',
    null, NEW.requester_email, NEW.requester_name,
    'mentor_contact_requests', NEW.id,
    jsonb_build_object('mentor_id', NEW.mentor_id, 'company', NEW.requester_company, 'country', NEW.requester_country),
    'intro.requested:'||NEW.id::text);
  return NEW;
exception when others then raise log 'emit_mentor_contact_activity failed: %', sqlerrm; return NEW;
end $$;


ALTER FUNCTION "public"."emit_mentor_contact_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."emit_mentor_intro_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  perform public.log_activity(
    'intro.requested', 'action',
    null, NEW.requester_email, NEW.requester_name,
    'mentor_contact_requests', NEW.id,
    jsonb_build_object(
      'entity', 'mentor',
      'mentor_id', NEW.mentor_id,
      'requester_company', NEW.requester_company,
      'requester_country', NEW.requester_country),
    'mcr:' || NEW.id::text);
  return NEW;
exception when others then
  raise log 'emit_mentor_intro_activity failed: %', sqlerrm;
  return NEW;
end;
$$;


ALTER FUNCTION "public"."emit_mentor_intro_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."emit_profile_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  perform public.log_activity('user.signed_up','info', NEW.id, null,
    nullif(trim(coalesce(NEW.first_name,'')||' '||coalesce(NEW.last_name,'')),''),
    'profiles', NEW.id, '{}'::jsonb, 'user.signed_up:'||NEW.id::text);
  return NEW;
exception when others then raise log 'emit_profile_activity failed: %', sqlerrm; return NEW;
end $$;


ALTER FUNCTION "public"."emit_profile_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."emit_review_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  perform public.log_activity('review.submitted','action',
    null, null, NEW.reviewer_name,
    'service_provider_reviews', NEW.id,
    jsonb_build_object('service_provider_id', NEW.service_provider_id, 'rating', NEW.rating, 'is_verified', NEW.is_verified),
    'review.submitted:'||NEW.id::text);
  return NEW;
exception when others then raise log 'emit_review_activity failed: %', sqlerrm; return NEW;
end $$;


ALTER FUNCTION "public"."emit_review_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."emit_subscription_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare old_rank int; new_rank int; evt text; sev text;
begin
  new_rank := public.tier_rank(NEW.tier);
  if new_rank is null then
    raise log 'emit_subscription_activity: unmapped tier %', NEW.tier; return NEW;
  end if;
  if TG_OP = 'INSERT' then
    if new_rank = 0 then return NEW; end if;
    evt := 'subscription.created'; sev := 'revenue';
  else
    if NEW.tier is not distinct from OLD.tier then return NEW; end if;
    old_rank := public.tier_rank(OLD.tier);
    if old_rank is null then
      raise log 'emit_subscription_activity: unmapped old tier %', OLD.tier; return NEW;
    end if;
    if new_rank = old_rank then return NEW;
    elsif old_rank = 0 then evt := 'subscription.created'; sev := 'revenue';
    elsif new_rank > old_rank then evt := 'subscription.upgraded'; sev := 'revenue';
    else evt := 'subscription.downgraded'; sev := 'action'; end if;
  end if;
  perform public.log_activity(evt, sev, NEW.user_id, null, null, 'user_subscriptions', NEW.id,
    jsonb_build_object('from_tier', case when TG_OP='UPDATE' then OLD.tier::text else null end, 'to_tier', NEW.tier::text),
    'sub:'||coalesce(NEW.user_id::text,'null')||':'||NEW.tier::text||':'||extract(epoch from coalesce(NEW.updated_at, now()))::bigint);
  return NEW;
exception when others then raise log 'emit_subscription_activity failed: %', sqlerrm; return NEW;
end $$;


ALTER FUNCTION "public"."emit_subscription_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."emit_user_report_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare evt text; sev text; ddk text; company text;
begin
  if TG_OP = 'INSERT' then
    if NEW.status not in ('completed','failed') then return NEW; end if;
  else
    if NEW.status is not distinct from OLD.status then return NEW; end if;
    if NEW.status not in ('completed','failed') then return NEW; end if;
  end if;

  select company_name into company from public.user_intake_forms where id = NEW.intake_form_id;

  if NEW.status = 'completed' then
    evt := 'report.completed'; sev := 'info'; ddk := 'report.completed:report:'||NEW.id::text;
  else
    evt := 'report.failed'; sev := 'error';
    ddk := 'report.failed:'||coalesce(NEW.intake_form_id::text, NEW.id::text);
  end if;

  perform public.log_activity(evt, sev, NEW.user_id, null, null,
    'user_reports', NEW.id,
    jsonb_build_object('tier_at_generation', NEW.tier_at_generation, 'intake_form_id', NEW.intake_form_id, 'company', company),
    ddk);

  -- report-quality telemetry card (slack-notify reads report_json by report_id to score it).
  perform public.log_activity('report.quality', 'info', NEW.user_id, null, null,
    'user_reports', NEW.id,
    jsonb_build_object('report_status', NEW.status, 'company', company, 'intake_form_id', NEW.intake_form_id),
    'report.quality:'||NEW.id::text);

  return NEW;
exception when others then raise log 'emit_user_report_activity failed: %', sqlerrm; return NEW;
end $$;


ALTER FUNCTION "public"."emit_user_report_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enrol_in_onboarding_sequence"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  INSERT INTO public.email_sequences (user_id, sequence_name, current_step, next_send_at)
  VALUES (
    NEW.id,
    'onboarding',
    1,
    now() + INTERVAL '2 days'
  )
  ON CONFLICT (user_id, sequence_name) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."enrol_in_onboarding_sequence"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."event_local_time_label"("p_ts" timestamp with time zone, "p_city" "text") RETURNS "text"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  SELECT CASE WHEN p_ts IS NULL THEN NULL ELSE
    to_char(
      p_ts AT TIME ZONE (
        CASE
          WHEN lower(coalesce(p_city,'')) LIKE '%perth%'      THEN 'Australia/Perth'
          WHEN lower(coalesce(p_city,'')) LIKE '%adelaide%'   THEN 'Australia/Adelaide'
          WHEN lower(coalesce(p_city,'')) LIKE '%brisbane%'   THEN 'Australia/Brisbane'
          WHEN lower(coalesce(p_city,'')) LIKE '%gold coast%' THEN 'Australia/Brisbane'
          WHEN lower(coalesce(p_city,'')) LIKE '%hobart%'     THEN 'Australia/Hobart'
          WHEN lower(coalesce(p_city,'')) LIKE '%darwin%'     THEN 'Australia/Darwin'
          WHEN lower(coalesce(p_city,'')) LIKE '%auckland%'   THEN 'Pacific/Auckland'
          WHEN lower(coalesce(p_city,'')) LIKE '%wellington%' THEN 'Pacific/Auckland'
          WHEN lower(coalesce(p_city,'')) LIKE '%christchurch%' THEN 'Pacific/Auckland'
          ELSE 'Australia/Sydney'
        END
      ),
      'FMHH12:MI AM'
    )
  END
$$;


ALTER FUNCTION "public"."event_local_time_label"("p_ts" timestamp with time zone, "p_city" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."find_duplicate_event"("p_title" "text", "p_event_date" timestamp with time zone, "p_city" "text") RETURNS "uuid"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  SELECT id FROM events
  WHERE event_date::date = p_event_date::date
    AND lower(coalesce(city,'')) = lower(coalesce(p_city,''))
    AND similarity(lower(title), lower(p_title)) > 0.55
  ORDER BY similarity(lower(title), lower(p_title)) DESC
  LIMIT 1;
$$;


ALTER FUNCTION "public"."find_duplicate_event"("p_title" "text", "p_event_date" timestamp with time zone, "p_city" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_slug"("input_text" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
DECLARE
  base_slug text;
BEGIN
  base_slug := lower(regexp_replace(trim(input_text), '[^a-z0-9]+', '-', 'gi'));
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 80);
  RETURN base_slug;
END;
$$;


ALTER FUNCTION "public"."generate_slug"("input_text" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_shared_report"("p_share_token" "uuid") RETURNS TABLE("id" "uuid", "user_id" "uuid", "intake_form_id" "uuid", "tier_at_generation" "text", "report_json" "jsonb", "sections_generated" "text"[], "status" "text", "feedback_score" integer, "feedback_notes" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "share_token" "uuid")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."get_shared_report"("p_share_token" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_tier_gated_report"("p_report_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
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
  v_tier_requirements JSONB := '{
    "swot_analysis": "growth",
    "competitor_landscape": "growth",
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
$$;


ALTER FUNCTION "public"."get_tier_gated_report"("p_report_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, first_name, last_name, username)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'first_name', 
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'username'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user_subscription"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Create a free subscription for new users
  INSERT INTO public.user_subscriptions (user_id, tier)
  VALUES (NEW.id, 'free');
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user_subscription"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


ALTER FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ii_curations_set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."ii_curations_set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ii_reddit_signals_set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."ii_reddit_signals_set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_download_count"("attachment_id" "uuid") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  UPDATE guide_attachments
  SET download_count = download_count + 1
  WHERE id = attachment_id;
$$;


ALTER FUNCTION "public"."increment_download_count"("attachment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kb_check_secret"("p_candidate" "text") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1 from vault.decrypted_secrets
    where name = 'knowledge_internal_secret' and decrypted_secret = p_candidate
  );
$$;


ALTER FUNCTION "public"."kb_check_secret"("p_candidate" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kb_external_source_id"("p_source_project" "text", "p_source_ref" "text") RETURNS "uuid"
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
  select md5(coalesce(p_source_project,'') || ':' || coalesce(p_source_ref,''))::uuid;
$$;


ALTER FUNCTION "public"."kb_external_source_id"("p_source_project" "text", "p_source_ref" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kb_get_openai_key"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select decrypted_secret from vault.decrypted_secrets where name = 'openai_api_key' limit 1;
$$;


ALTER FUNCTION "public"."kb_get_openai_key"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kb_set_embedding"("p_id" "uuid", "p_embedding" "text", "p_embedded_hash" "text", "p_model" "text" DEFAULT 'text-embedding-3-small'::"text") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  update public.mes_knowledge_base
     set embedding       = p_embedding::vector,
         embedded_hash   = p_embedded_hash,
         embedding_model = p_model,
         updated_at      = now()
   where id = p_id;
$$;


ALTER FUNCTION "public"."kb_set_embedding"("p_id" "uuid", "p_embedding" "text", "p_embedded_hash" "text", "p_model" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kb_stale_rows"("p_limit" integer DEFAULT 100) RETURNS TABLE("id" "uuid", "content" "text", "content_hash" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select id, content, content_hash
  from public.mes_knowledge_base
  where (embedding is null or embedded_hash is distinct from content_hash)
    and length(btrim(content)) > 0
  order by updated_at asc
  limit greatest(least(p_limit, 100), 1);
$$;


ALTER FUNCTION "public"."kb_stale_rows"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kb_strip_pii"("p" "text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
  select btrim(regexp_replace(
    regexp_replace(
      regexp_replace(coalesce(p, ''),
        '[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}', ' ', 'g'),  -- email addresses
      '\+\d[\d\s\-().]{6,}\d', ' ', 'g'),                                -- intl-format phone numbers
    '[ \t]{2,}', ' ', 'g'));                                            -- collapse whitespace
$$;


ALTER FUNCTION "public"."kb_strip_pii"("p" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."kb_sync_all"("p_entity" "text") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare v_count integer := 0; v_src text;
begin
  case p_entity
    when 'service_provider' then v_src:='service_providers'; perform public.upsert_kb_service_provider(id) from public.service_providers;
    when 'event'            then v_src:='events';                    perform public.upsert_kb_event(id) from public.events;
    when 'mentor'           then v_src:='community_members';         perform public.upsert_kb_mentor(id) from public.community_members;
    when 'agency'           then v_src:='trade_investment_agencies'; perform public.upsert_kb_agency(id) from public.trade_investment_agencies;
    when 'ecosystem'        then v_src:='innovation_ecosystem';      perform public.upsert_kb_ecosystem(id) from public.innovation_ecosystem;
    when 'investor'         then v_src:='investors';                 perform public.upsert_kb_investor(id) from public.investors;
    when 'country'          then v_src:='countries';                 perform public.upsert_kb_country(id) from public.countries;
    when 'country_faq'      then v_src:='country_faqs';              perform public.upsert_kb_country_faq(id) from public.country_faqs;
    when 'lead_database'    then v_src:='lead_databases';            perform public.upsert_kb_lead_database(id) from public.lead_databases;
    when 'content_item'     then v_src:='content_items';             perform public.upsert_kb_content_item(id) from public.content_items;
    else raise exception 'kb_sync_all: unknown entity %', p_entity;
  end case;
  execute format('delete from public.mes_knowledge_base k where k.source_table=%L and not exists (select 1 from public.%I s where s.id=k.source_id)', v_src, v_src);
  select count(*) into v_count from public.mes_knowledge_base where source_table = v_src;
  return v_count;
end; $$;


ALTER FUNCTION "public"."kb_sync_all"("p_entity" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_activity"("p_event_type" "text", "p_severity" "text", "p_actor_user_id" "uuid", "p_actor_email" "text", "p_actor_name" "text", "p_object_type" "text", "p_object_id" "uuid", "p_metadata" "jsonb", "p_dedup_key" "text") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  insert into public.activity_events
    (event_type, severity, actor_user_id, actor_email, actor_name, object_type, object_id, metadata, dedup_key)
  values
    (p_event_type, p_severity, p_actor_user_id, p_actor_email, p_actor_name, p_object_type, p_object_id,
     coalesce(p_metadata, '{}'::jsonb), p_dedup_key)
  on conflict (dedup_key) do nothing
$$;


ALTER FUNCTION "public"."log_activity"("p_event_type" "text", "p_severity" "text", "p_actor_user_id" "uuid", "p_actor_email" "text", "p_actor_name" "text", "p_object_type" "text", "p_object_id" "uuid", "p_metadata" "jsonb", "p_dedup_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."map_sector_value"("raw" "text") RETURNS "text"[]
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  r text := lower(trim(coalesce(raw, '')));
  hit text[];
  out text[] := '{}';
BEGIN
  IF r = '' THEN RETURN '{}'; END IF;

  SELECT sector_slugs INTO hit FROM public.sector_vocabulary WHERE raw_value = r;
  IF hit IS NOT NULL THEN RETURN hit; END IF;

  IF r ~ 'health|medic|clinical|pharma|biotech|life scien|wellness|aged care|disabilit' THEN out := array_append(out, 'hospitals-and-health-care'); END IF;
  IF r ~ 'fintech|financ|bank|insur|capital|payment|wealth|trading|invest|crypto' THEN out := array_append(out, 'financial-services'); END IF;
  IF r ~ 'tech|software|saas|digital|data|\mai\M|cyber|cloud|iot|web3|platform|media|information|internet|telecom|comput|marketplace|devtool|developer tool|open source|\mmobile\M|future of work|\mml\M|blockchain|crypto|telco' THEN out := array_append(out, 'technology-information-and-media'); END IF;
  IF r ~ 'manufactur|industrial|engineer|machinery|electronics|chemical|hardware|robotic' THEN out := array_append(out, 'manufacturing'); END IF;
  IF r ~ 'construct|infrastructure|built environ|building|urban|smart cit' THEN out := array_append(out, 'construction'); END IF;
  IF r ~ 'logist|supply chain|transport|freight|maritime|aviation|shipping|mobilit' THEN out := array_append(out, 'transportation-logistics-supply-chain-and-storage'); END IF;
  IF r ~ 'energy|utilit|water|power|grid|renewable|cleantech|solar|wind|climate|sustainab|circular econom' THEN out := array_append(out, 'utilities'); END IF;
  IF r ~ 'min(e|ing)|resource|oil|gas|petroleum|metals' THEN out := array_append(out, 'oil-gas-and-mining'); END IF;
  IF r ~ 'agri|farm|food|beverage|aquacultur|forestr' THEN out := array_append(out, 'farming-ranching-forestry'); END IF;
  IF r ~ 'defen[cs]e|military|maritime|government|public sector|gov tech|govtech|urban develop|smart cit' THEN out := array_append(out, 'government-administration'); END IF;
  IF r ~ 'educat|edtech|training|learning|university' THEN out := array_append(out, 'education'); END IF;
  IF r ~ 'retail|e-?commerce|consumer goods|fashion|apparel|\mconsumer\M|\mdtc\M|direct.to.consumer' THEN out := array_append(out, 'retail'); END IF;
  IF r ~ 'real estate|property|proptech' THEN out := array_append(out, 'real-estate-and-equipment-rental-services'); END IF;
  IF r ~ 'tourism|hospitality|accommodation|hotel|restaurant' THEN out := array_append(out, 'accommodation-and-food-services'); END IF;
  IF r ~ 'legal|account|consult|advisory|design|architect|research|professional|governance|complian' THEN out := array_append(out, 'professional-services'); END IF;
  IF r ~ 'creative|media production|entertainment|arts|sport|gaming' THEN out := array_append(out, 'entertainment-providers'); END IF;
  IF r ~ 'staffing|recruit|\mhr\M|facilities|administ|outsourc|safety|workplace' THEN out := array_append(out, 'administrative-and-support-services'); END IF;
  IF r ~ 'wholesale|distribution' THEN out := array_append(out, 'wholesale'); END IF;

  RETURN (SELECT COALESCE(array_agg(DISTINCT s), '{}') FROM unnest(out) s);
END $$;


ALTER FUNCTION "public"."map_sector_value"("raw" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."map_sector_values"("raws" "text"[]) RETURNS "text"[]
    LANGUAGE "sql" STABLE
    AS $$
  SELECT COALESCE(array_agg(DISTINCT slug), '{}')
  FROM unnest(coalesce(raws, '{}'::text[])) AS r
  CROSS JOIN LATERAL unnest(public.map_sector_value(r)) AS slug;
$$;


ALTER FUNCTION "public"."map_sector_values"("raws" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_archive"("query_embedding" "public"."vector", "match_threshold" double precision DEFAULT 0.6, "match_count" integer DEFAULT 10, "source_type_filter" "text" DEFAULT 'newsletter'::"text", "section_filter" "text"[] DEFAULT ARRAY['at_home'::"text", 'news_from_abroad'::"text", 'founder_directory'::"text", 'brain_food'::"text"]) RETURNS TABLE("id" "uuid", "source_type" "text", "source_id" "text", "section_name" "text", "section_index" integer, "title" "text", "published_at" timestamp with time zone, "similarity" double precision)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select
    a.id,
    a.source_type,
    a.source_id,
    a.section_name,
    a.section_index,
    a.title,
    a.published_at,
    1 - (a.embedding <=> query_embedding) as similarity
  from ii_published_archive a
  where a.embedding is not null
    and (source_type_filter is null or a.source_type = source_type_filter)
    and (section_filter is null or a.section_name = any(section_filter))
    and 1 - (a.embedding <=> query_embedding) > match_threshold
  order by a.embedding <=> query_embedding
  limit match_count;
$$;


ALTER FUNCTION "public"."match_archive"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "source_type_filter" "text", "section_filter" "text"[]) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."match_archive"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "source_type_filter" "text", "section_filter" "text"[]) IS 'Cosine similarity search over ii_published_archive. Used by Reddit pipeline to detect already-published topics. Default section_filter excludes short metadata sections.';



CREATE OR REPLACE FUNCTION "public"."match_content"("query_embedding" "public"."vector", "match_threshold" double precision DEFAULT 0.7, "match_count" integer DEFAULT 10, "category_filter" "text" DEFAULT NULL::"text", "source_type_filter" "text" DEFAULT NULL::"text", "canonical_only" boolean DEFAULT false, "since_date" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE("id" "uuid", "source_type" "text", "source_id" "text", "source_url" "text", "title" "text", "summary" "text", "category" "text", "entities" "jsonb", "tags" "text"[], "author_name" "text", "author_handle" "text", "published_at" timestamp with time zone, "similarity" double precision)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select
    c.id,
    c.source_type,
    c.source_id,
    c.source_url,
    c.title,
    c.summary,
    c.category,
    c.entities,
    c.tags,
    c.author_name,
    c.author_handle,
    c.published_at,
    1 - (c.embedding <=> query_embedding) as similarity
  from ii_content c
  where c.is_ii_relevant = true
    and c.embedding is not null
    and (category_filter is null or c.category = category_filter)
    and (source_type_filter is null or c.source_type = source_type_filter)
    and (canonical_only = false or c.is_canonical = true)
    and (since_date is null or c.published_at >= since_date)
    and 1 - (c.embedding <=> query_embedding) > match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
$$;


ALTER FUNCTION "public"."match_content"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "category_filter" "text", "source_type_filter" "text", "canonical_only" boolean, "since_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_emails"("query_embedding" "public"."vector", "match_threshold" double precision DEFAULT 0.7, "match_count" integer DEFAULT 10, "category_filter" "text" DEFAULT NULL::"text", "since_date" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE("id" "uuid", "subject" "text", "summary" "text", "category" "text", "entities" "jsonb", "tags" "text"[], "source_url" "text", "from_name" "text", "received_at" timestamp with time zone, "similarity" double precision)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select
    c.id,
    c.title as subject,
    c.summary,
    c.category,
    c.entities,
    c.tags,
    c.source_url,
    c.author_name as from_name,
    c.published_at as received_at,
    1 - (c.embedding <=> query_embedding) as similarity
  from ii_content c
  where c.is_ii_relevant = true
    and c.source_type = 'email'
    and c.embedding is not null
    and (category_filter is null or c.category = category_filter)
    and (since_date is null or c.published_at >= since_date)
    and 1 - (c.embedding <=> query_embedding) > match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
$$;


ALTER FUNCTION "public"."match_emails"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "category_filter" "text", "since_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_knowledge"("query_embedding" "public"."vector", "query_text" "text" DEFAULT NULL::"text", "match_count" integer DEFAULT 10, "match_threshold" double precision DEFAULT 0.5, "filter" "jsonb" DEFAULT '{}'::"jsonb", "allowed_visibility" "text"[] DEFAULT ARRAY['public'::"text"]) RETURNS TABLE("id" "uuid", "source_table" "text", "source_id" "uuid", "entity_type" "text", "title" "text", "content" "text", "metadata" "jsonb", "source_url" "text", "similarity" double precision, "score" double precision)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  with params as (
    select case
             when query_text is not null and length(btrim(query_text)) > 0
             then websearch_to_tsquery('english', query_text)
           end as tsq
  ),
  candidates as (
    select
      k.id, k.source_table, k.source_id, k.entity_type, k.title, k.content, k.metadata,
      (1 - (k.embedding <=> query_embedding))::float as vec_sim,
      case when (select tsq from params) is not null
           then ts_rank(to_tsvector('english', coalesce(k.title,'') || ' ' || k.content),
                        (select tsq from params))
           else 0 end::float as kw_rank,
      case when query_text is not null and length(btrim(query_text)) > 0
           then similarity(coalesce(k.title,''), query_text)
           else 0 end::float as name_sim
    from public.mes_knowledge_base k
    where k.embedding is not null
      and k.metadata @> filter
      and (k.metadata->>'visibility') = any(allowed_visibility)
      and coalesce((k.metadata->>'is_active')::boolean, true) is not false
  )
  select
    id, source_table, source_id, entity_type, title, content, metadata,
    metadata->>'source_url' as source_url,
    vec_sim as similarity,
    (0.6 * vec_sim + 0.25 * least(kw_rank, 1.0) + 0.15 * name_sim)::float as score
  from candidates
  where vec_sim >= match_threshold
     or kw_rank > 0
     or name_sim >= 0.3
  order by score desc
  limit greatest(match_count, 1);
$$;


ALTER FUNCTION "public"."match_knowledge"("query_embedding" "public"."vector", "query_text" "text", "match_count" integer, "match_threshold" double precision, "filter" "jsonb", "allowed_visibility" "text"[]) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."match_knowledge"("query_embedding" "public"."vector", "query_text" "text", "match_count" integer, "match_threshold" double precision, "filter" "jsonb", "allowed_visibility" "text"[]) IS 'Canonical hybrid (vector + tsvector + trigram) retrieval over mes_knowledge_base for MCPs/agents. Visibility enforced internally; allowed_visibility defaults to {public}. Call via the knowledge-search edge function, which sets allowed_visibility from caller auth/plan.';



CREATE OR REPLACE FUNCTION "public"."recent_ii_content"("days" integer DEFAULT 7, "category_filter" "text" DEFAULT NULL::"text", "source_type_filter" "text" DEFAULT NULL::"text", "canonical_only" boolean DEFAULT false, "max_count" integer DEFAULT 50) RETURNS TABLE("id" "uuid", "source_type" "text", "source_id" "text", "source_url" "text", "title" "text", "summary" "text", "category" "text", "entities" "jsonb", "tags" "text"[], "author_name" "text", "author_handle" "text", "published_at" timestamp with time zone)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select
    c.id,
    c.source_type,
    c.source_id,
    c.source_url,
    c.title,
    c.summary,
    c.category,
    c.entities,
    c.tags,
    c.author_name,
    c.author_handle,
    c.published_at
  from ii_content c
  where c.is_ii_relevant = true
    and c.published_at >= now() - (days || ' days')::interval
    and (category_filter is null or c.category = category_filter)
    and (source_type_filter is null or c.source_type = source_type_filter)
    and (canonical_only = false or c.is_canonical = true)
  order by c.published_at desc
  limit max_count;
$$;


ALTER FUNCTION "public"."recent_ii_content"("days" integer, "category_filter" "text", "source_type_filter" "text", "canonical_only" boolean, "max_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recent_ii_emails"("days" integer DEFAULT 7, "category_filter" "text" DEFAULT NULL::"text", "max_count" integer DEFAULT 50) RETURNS TABLE("id" "uuid", "subject" "text", "summary" "text", "category" "text", "entities" "jsonb", "tags" "text"[], "source_url" "text", "from_name" "text", "received_at" timestamp with time zone)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select
    c.id,
    c.title as subject,
    c.summary,
    c.category,
    c.entities,
    c.tags,
    c.source_url,
    c.author_name as from_name,
    c.published_at as received_at
  from ii_content c
  where c.is_ii_relevant = true
    and c.source_type = 'email'
    and c.published_at >= now() - (days || ' days')::interval
    and (category_filter is null or c.category = category_filter)
  order by c.published_at desc
  limit max_count;
$$;


ALTER FUNCTION "public"."recent_ii_emails"("days" integer, "category_filter" "text", "max_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."roll_forward_month_precision_events"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  rows_updated integer;
BEGIN
  UPDATE public.events
  SET date = CASE
    WHEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM date)::int, 1) >= CURRENT_DATE
      THEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM date)::int, 1)
    ELSE make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int + 1, EXTRACT(MONTH FROM date)::int, 1)
  END,
  updated_at = now()
  WHERE date_precision = 'month'
    AND date < CURRENT_DATE;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated;
END;
$$;


ALTER FUNCTION "public"."roll_forward_month_precision_events"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."roll_forward_month_precision_events"() IS 'Rolls month-precision event dates forward to their next future occurrence. Run monthly via pg_cron.';



CREATE OR REPLACE FUNCTION "public"."set_event_time_label"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.source = 'apify_events_finder'
     AND NEW.event_date IS NOT NULL
     AND (NEW.time IS NULL OR NEW.time IN ('', 'See website')) THEN
    NEW.time := event_local_time_label(NEW.event_date, NEW.city);
  END IF;
  RETURN NEW;
END $$;


ALTER FUNCTION "public"."set_event_time_label"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."tier_rank"("t" "public"."subscription_tier") RETURNS integer
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
  select case t
    when 'free'       then 0
    when 'premium'    then 1   -- legacy == growth
    when 'growth'     then 1
    when 'scale'      then 2
    when 'concierge'  then 3   -- legacy == enterprise
    when 'enterprise' then 3
  end
$$;


ALTER FUNCTION "public"."tier_rank"("t" "public"."subscription_tier") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_kb_content"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare v_cid uuid;
begin
  if tg_table_name = 'content_items' then
    if tg_op = 'DELETE' then
      delete from public.mes_knowledge_base where source_table='content_items' and source_id=old.id;
      return old;
    end if;
    perform public.upsert_kb_content_item(new.id);
    return new;
  else
    v_cid := coalesce(new.content_id, old.content_id);
    if v_cid is not null then perform public.upsert_kb_content_item(v_cid); end if;
    return coalesce(new, old);
  end if;
exception when others then
  raise warning 'kb content sync failed for % %: %', tg_table_name, coalesce(new.id, old.id), sqlerrm;
  return coalesce(new, old);
end; $$;


ALTER FUNCTION "public"."trg_kb_content"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_kb_generic"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if tg_op = 'DELETE' then
    delete from public.mes_knowledge_base where source_table = tg_table_name and source_id = old.id;
    return old;
  end if;
  case tg_table_name
    when 'events'                     then perform public.upsert_kb_event(new.id);
    when 'community_members'          then perform public.upsert_kb_mentor(new.id);
    when 'trade_investment_agencies'  then perform public.upsert_kb_agency(new.id);
    when 'innovation_ecosystem'       then perform public.upsert_kb_ecosystem(new.id);
    when 'investors'                  then perform public.upsert_kb_investor(new.id);
    when 'countries'                  then perform public.upsert_kb_country(new.id);
    when 'country_faqs'               then perform public.upsert_kb_country_faq(new.id);
    when 'lead_databases'             then perform public.upsert_kb_lead_database(new.id);
  end case;
  return new;
exception when others then
  raise warning 'kb sync failed for % %: %', tg_table_name, coalesce(new.id, old.id), sqlerrm;
  return coalesce(new, old);
end; $$;


ALTER FUNCTION "public"."trg_kb_generic"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_kb_scrub_pii"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.content := public.kb_strip_pii(new.content);
  new.content_hash := md5(new.content);  -- hash always reflects the stored (scrubbed) content
  return new;
end; $$;


ALTER FUNCTION "public"."trg_kb_scrub_pii"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_kb_service_provider"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if tg_op = 'DELETE' then
    delete from public.mes_knowledge_base
      where source_table = 'service_providers' and source_id = old.id;
    return old;
  else
    perform public.upsert_kb_service_provider(new.id);
    return new;
  end if;
exception when others then
  -- KB sync must NEVER block a write to the source table.
  raise warning 'kb sync failed for service_providers %: %', coalesce(new.id, old.id), sqlerrm;
  return coalesce(new, old);
end;
$$;


ALTER FUNCTION "public"."trg_kb_service_provider"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_validate_intake_industry"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NOT public.validate_industry_sector_values(NEW.industry_sector) THEN
    RAISE EXCEPTION 'Invalid industry_sector value(s). Values must match linkedin_industries.industry_group.';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_validate_intake_industry"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_ii_content_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_ii_content_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_ii_emails_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_ii_emails_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_ii_published_archive_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_ii_published_archive_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_mentor_contact_requests_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;


ALTER FUNCTION "public"."update_mentor_contact_requests_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_ii_linkedin_posts"("rows" "jsonb") RETURNS TABLE("post_id" "text", "inserted" boolean)
    LANGUAGE "sql"
    AS $$
  insert into public.ii_personal_linkedin_posts as p (
    post_id, entity_id, share_urn, post_url, share_url,
    author_account, author_type, author_name, author_public_id, author_id,
    posted_at, posted_at_raw, body, content_hash, post_type, is_repost,
    reposted_by, reposted_by_url, num_likes, num_comments, num_shares,
    reactions, post_images, media, links, mentions, mentioned_companies,
    is_ii_content, relevance_source, query_target_url, raw,
    ingest_run_id, last_seen_run
  )
  select
    r.post_id, r.entity_id, r.share_urn, r.post_url, r.share_url,
    r.author_account, r.author_type, r.author_name, r.author_public_id, r.author_id,
    r.posted_at, r.posted_at_raw, r.body, r.content_hash, r.post_type, r.is_repost,
    r.reposted_by, r.reposted_by_url, r.num_likes, r.num_comments, r.num_shares,
    r.reactions, r.post_images, r.media, r.links, r.mentions, r.mentioned_companies,
    r.is_ii_content, r.relevance_source, r.query_target_url, r.raw,
    r.ingest_run_id, r.last_seen_run
  from jsonb_to_recordset(rows) as r (
    post_id text, entity_id text, share_urn text, post_url text, share_url text,
    author_account text, author_type text, author_name text, author_public_id text, author_id text,
    posted_at timestamptz, posted_at_raw text, body text, content_hash text, post_type text, is_repost boolean,
    reposted_by text, reposted_by_url text, num_likes integer, num_comments integer, num_shares integer,
    reactions jsonb, post_images text[], media jsonb, links text[], mentions jsonb, mentioned_companies text[],
    is_ii_content boolean, relevance_source text, query_target_url text, raw jsonb,
    ingest_run_id text, last_seen_run text
  )
  on conflict (post_id) do update set
    num_likes           = excluded.num_likes,
    num_comments        = excluded.num_comments,
    num_shares          = excluded.num_shares,
    reactions           = excluded.reactions,
    body                = excluded.body,
    post_type           = excluded.post_type,
    post_images         = excluded.post_images,
    media               = excluded.media,
    links               = excluded.links,
    mentions            = excluded.mentions,
    mentioned_companies = excluded.mentioned_companies,
    last_scraped_at     = now(),
    last_seen_run       = excluded.last_seen_run,
    updated_at          = now(),
    embedding           = case
                            when p.content_hash is distinct from excluded.content_hash
                            then null
                            else p.embedding
                          end,
    content_hash        = excluded.content_hash
  returning p.post_id, (xmax = 0);
$$;


ALTER FUNCTION "public"."upsert_ii_linkedin_posts"("rows" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."upsert_ii_linkedin_posts"("rows" "jsonb") IS 'Idempotent batched upsert into ii_personal_linkedin_posts keyed on post_id. Returns (post_id, inserted). created_at and the relevance tri-state survive re-scrape; engagement and body refresh; embedding resets when content_hash changes.';



CREATE OR REPLACE FUNCTION "public"."upsert_kb_agency"("p_source_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare r public.trade_investment_agencies%rowtype; v_content text; v_meta jsonb; v_hash text;
begin
  select * into r from public.trade_investment_agencies where id = p_source_id;
  if not found or coalesce(r.is_active,true)=false then
    delete from public.mes_knowledge_base where source_table='trade_investment_agencies' and source_id=p_source_id; return;
  end if;
  v_content := btrim(concat_ws(E'\n',
    r.name,
    nullif(btrim(r.tagline),''),
    nullif(btrim(r.description),''),
    nullif(btrim(r.description_full),''),
    case when r.services is not null and array_length(r.services,1)>0 then 'Services: '||array_to_string(r.services,', ') end,
    case when r.support_types is not null and array_length(r.support_types,1)>0 then 'Support types: '||array_to_string(r.support_types,', ') end,
    case when r.sectors_supported is not null and array_length(r.sectors_supported,1)>0 then 'Sectors: '||array_to_string(r.sectors_supported,', ') end,
    case when nullif(btrim(r.organisation_type),'') is not null then 'Organisation type: '||r.organisation_type end,
    case when nullif(btrim(r.government_level),'') is not null then 'Government level: '||r.government_level end,
    case when nullif(btrim(coalesce(r.location_country,r.country_iso2)),'') is not null then 'Country: '||coalesce(r.location_country,r.country_iso2) end));
  v_hash := md5(v_content);
  v_meta := jsonb_build_object(
    'sector', case when r.sector_tags is not null and array_length(r.sector_tags,1)>0 then to_jsonb(r.sector_tags)
                   when r.sectors_supported is not null and array_length(r.sectors_supported,1)>0 then to_jsonb(r.sectors_supported) else '[]'::jsonb end,
    'country', nullif(btrim(coalesce(r.location_country,r.country_iso2)),''), 'visibility','public', 'is_active',true,
    'source_url','https://market-entry-secrets.lovable.app/government-support/'||coalesce(r.slug,r.id::text), 'plan_tier','free');
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('trade_investment_agencies',r.id,0,'agency',r.name,v_content,v_meta,v_hash)
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;
end; $$;


ALTER FUNCTION "public"."upsert_kb_agency"("p_source_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_kb_content_item"("p_content_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  ci public.content_items%rowtype;
  v_etype text; v_summary text; v_meta jsonb; rec record; v_body text;
  v_idx int := 0; v_maxidx int := 0; v_src_url text;
begin
  select * into ci from public.content_items where id = p_content_id;
  if not found or coalesce(ci.status,'') <> 'published' then
    delete from public.mes_knowledge_base where source_table='content_items' and source_id=p_content_id; return;
  end if;

  v_etype := ci.content_type;
  v_src_url := 'https://market-entry-secrets.lovable.app/'
             || case when ci.content_type='case_study' then 'case-studies/' else 'content/' end
             || coalesce(ci.slug, ci.id::text);
  v_meta := jsonb_build_object(
    'sector', case when ci.sector_tags is not null and array_length(ci.sector_tags,1)>0 then to_jsonb(ci.sector_tags) else '[]'::jsonb end,
    'country', null, 'visibility','public', 'is_active',true, 'source_url', v_src_url, 'plan_tier','free');

  -- chunk 0: summary
  v_summary := btrim(concat_ws(E'\n',
    ci.title,
    nullif(btrim(ci.subtitle),''),
    case when ci.tldr is not null and array_length(ci.tldr,1)>0 then array_to_string(ci.tldr, E'\n') end,
    nullif(btrim(ci.meta_description),'')));
  if nullif(v_summary,'') is null then v_summary := ci.title; end if;
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('content_items', ci.id, 0, v_etype, ci.title, v_summary, v_meta, md5(v_summary))
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;

  -- body chunks: one per content_body row in active sections, stable ordering
  for rec in
    select cs.title as section_title,
           coalesce(nullif(btrim(cb.body_text),''), nullif(btrim(cb.body_markdown),''), cb.question) as body,
           row_number() over (order by coalesce(cs.sort_order, 2147483647), cb.sort_order, cb.id) as idx
    from public.content_bodies cb
    left join public.content_sections cs on cs.id = cb.section_id
    where cb.content_id = p_content_id
      and coalesce(cs.is_active, true) = true
      and coalesce(nullif(btrim(cb.body_text),''), nullif(btrim(cb.body_markdown),''), cb.question) is not null
  loop
    v_idx := rec.idx;
    v_body := btrim(concat_ws(E'\n', ci.title, nullif(btrim(rec.section_title),''), rec.body));
    insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
    values('content_items', ci.id, v_idx, v_etype, coalesce(nullif(btrim(rec.section_title),''), ci.title), v_body, v_meta, md5(v_body))
    on conflict (source_table,source_id,chunk_index) do update set
      content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
    where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
       or public.mes_knowledge_base.metadata is distinct from excluded.metadata
       or public.mes_knowledge_base.title is distinct from excluded.title;
    if v_idx > v_maxidx then v_maxidx := v_idx; end if;
  end loop;

  -- drop trailing chunks left over from removed/shrunk sections
  delete from public.mes_knowledge_base
   where source_table='content_items' and source_id=p_content_id and chunk_index > v_maxidx and chunk_index > 0;
end; $$;


ALTER FUNCTION "public"."upsert_kb_content_item"("p_content_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_kb_country"("p_source_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare r public.countries%rowtype; v_content text; v_meta jsonb; v_hash text;
begin
  select * into r from public.countries where id = p_source_id;
  if not found then
    delete from public.mes_knowledge_base where source_table='countries' and source_id=p_source_id; return;
  end if;
  v_content := btrim(concat_ws(E'\n',
    r.name,
    nullif(btrim(r.hero_title),''),
    nullif(btrim(r.hero_description),''),
    nullif(btrim(r.description),''),
    case when r.key_industries is not null and array_length(r.key_industries,1)>0 then 'Key industries: '||array_to_string(r.key_industries,', ') end));
  v_hash := md5(v_content);
  v_meta := jsonb_build_object(
    'sector', case when r.key_industries is not null and array_length(r.key_industries,1)>0 then to_jsonb(r.key_industries) else '[]'::jsonb end,
    'country', r.name, 'visibility','public', 'is_active',true,
    'source_url','https://market-entry-secrets.lovable.app/countries/'||coalesce(r.slug,r.id::text), 'plan_tier','free');
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('countries',r.id,0,'country',r.name,v_content,v_meta,v_hash)
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;
end; $$;


ALTER FUNCTION "public"."upsert_kb_country"("p_source_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_kb_country_faq"("p_source_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare r public.country_faqs%rowtype; v_content text; v_meta jsonb; v_hash text; v_cname text; v_cslug text;
begin
  select * into r from public.country_faqs where id = p_source_id;
  if not found or nullif(btrim(r.question),'') is null then
    delete from public.mes_knowledge_base where source_table='country_faqs' and source_id=p_source_id; return;
  end if;
  select name, slug into v_cname, v_cslug from public.countries where id = r.country_id;
  v_content := btrim(concat_ws(E'\n',
    case when v_cname is not null then v_cname||' — frequently asked question' end,
    'Q: '||r.question,
    case when nullif(btrim(r.answer),'') is not null then 'A: '||r.answer end));
  v_hash := md5(v_content);
  v_meta := jsonb_build_object(
    'sector','[]'::jsonb, 'country', v_cname, 'visibility','public', 'is_active',true,
    'source_url','https://market-entry-secrets.lovable.app/countries/'||coalesce(v_cslug,r.country_id::text), 'plan_tier','free');
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('country_faqs',r.id,0,'country_faq',left(r.question,200),v_content,v_meta,v_hash)
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;
end; $$;


ALTER FUNCTION "public"."upsert_kb_country_faq"("p_source_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_kb_ecosystem"("p_source_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare r public.innovation_ecosystem%rowtype; v_content text; v_meta jsonb; v_hash text;
begin
  select * into r from public.innovation_ecosystem where id = p_source_id;
  if not found then
    delete from public.mes_knowledge_base where source_table='innovation_ecosystem' and source_id=p_source_id; return;
  end if;
  v_content := btrim(concat_ws(E'\n',
    r.name,
    nullif(btrim(r.description),''),
    nullif(btrim(r.basic_info),''),
    nullif(btrim(r.why_work_with_us),''),
    case when r.services is not null and array_length(r.services,1)>0 then 'Services: '||array_to_string(r.services,', ') end,
    case when r.sectors is not null and array_length(r.sectors,1)>0 then 'Sectors: '||array_to_string(r.sectors,', ') end,
    case when nullif(btrim(r.location),'') is not null then 'Location: '||r.location end));
  v_hash := md5(v_content);
  v_meta := jsonb_build_object(
    'sector', case when r.sector_tags is not null and array_length(r.sector_tags,1)>0 then to_jsonb(r.sector_tags)
                   when r.sectors is not null and array_length(r.sectors,1)>0 then to_jsonb(r.sectors) else '[]'::jsonb end,
    'country', null, 'visibility','public', 'is_active',true,
    'source_url','https://market-entry-secrets.lovable.app/innovation-ecosystem/'||coalesce(r.slug,r.id::text), 'plan_tier','free');
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('innovation_ecosystem',r.id,0,'ecosystem',r.name,v_content,v_meta,v_hash)
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;
end; $$;


ALTER FUNCTION "public"."upsert_kb_ecosystem"("p_source_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_kb_event"("p_source_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare r public.events%rowtype; v_content text; v_meta jsonb; v_hash text;
begin
  select * into r from public.events where id = p_source_id;
  if not found or coalesce(r.status,'') <> 'approved' then
    delete from public.mes_knowledge_base where source_table='events' and source_id=p_source_id; return;
  end if;
  v_content := btrim(concat_ws(E'\n',
    r.title,
    nullif(btrim(r.description),''),
    case when r.sector_tags is not null and array_length(r.sector_tags,1)>0 then 'Sectors: '||array_to_string(r.sector_tags,', ')
         when nullif(btrim(r.sector),'') is not null then 'Sector: '||r.sector end,
    case when nullif(btrim(r.category),'') is not null then 'Category: '||r.category end,
    case when nullif(btrim(r.type),'') is not null then 'Type: '||r.type end,
    'Location: '||nullif(btrim(concat_ws(', ', nullif(btrim(r.venue),''), nullif(btrim(r.location),''), nullif(btrim(r.city),''), nullif(btrim(r.state_region),''), nullif(btrim(r.country),''))),''),
    case when nullif(btrim(r.organizer),'') is not null then 'Organizer: '||r.organizer end));
  v_hash := md5(v_content);
  v_meta := jsonb_build_object(
    'sector', case when r.sector_tags is not null and array_length(r.sector_tags,1)>0 then to_jsonb(r.sector_tags)
                   when nullif(btrim(r.sector),'') is not null then jsonb_build_array(r.sector) else '[]'::jsonb end,
    'country', nullif(btrim(r.country),''), 'visibility','public', 'is_active',true,
    'source_url','https://market-entry-secrets.lovable.app/events/'||coalesce(r.slug,r.id::text), 'plan_tier','free');
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('events',r.id,0,'event',r.title,v_content,v_meta,v_hash)
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;
end; $$;


ALTER FUNCTION "public"."upsert_kb_event"("p_source_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_kb_investor"("p_source_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare r public.investors%rowtype; v_content text; v_meta jsonb; v_hash text;
begin
  select * into r from public.investors where id = p_source_id;
  if not found then
    delete from public.mes_knowledge_base where source_table='investors' and source_id=p_source_id; return;
  end if;
  v_content := btrim(concat_ws(E'\n',
    r.name,
    nullif(btrim(r.description),''),
    case when nullif(btrim(r.investor_type),'') is not null then 'Investor type: '||r.investor_type end,
    nullif(btrim(r.basic_info),''),
    nullif(btrim(r.why_work_with_us),''),
    case when r.sector_focus is not null and array_length(r.sector_focus,1)>0 then 'Sector focus: '||array_to_string(r.sector_focus,', ') end,
    case when r.stage_focus is not null and array_length(r.stage_focus,1)>0 then 'Stage focus: '||array_to_string(r.stage_focus,', ') end,
    case when nullif(btrim(r.country),'') is not null then 'Country: '||r.country end,
    case when nullif(btrim(r.fund_size),'') is not null then 'Fund size: '||r.fund_size end,
    case when r.portfolio_companies is not null and array_length(r.portfolio_companies,1)>0 then 'Portfolio: '||array_to_string(r.portfolio_companies,', ') end));
  v_hash := md5(v_content);
  v_meta := jsonb_build_object(
    'sector', case when r.sector_tags is not null and array_length(r.sector_tags,1)>0 then to_jsonb(r.sector_tags)
                   when r.sector_focus is not null and array_length(r.sector_focus,1)>0 then to_jsonb(r.sector_focus) else '[]'::jsonb end,
    'country', nullif(btrim(r.country),''), 'visibility','member', 'is_active',true,
    'source_url','https://market-entry-secrets.lovable.app/investors/'||coalesce(r.slug,r.id::text), 'plan_tier','growth');
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('investors',r.id,0,'investor',r.name,v_content,v_meta,v_hash)
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;
end; $$;


ALTER FUNCTION "public"."upsert_kb_investor"("p_source_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_kb_lead_database"("p_source_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare r public.lead_databases%rowtype; v_content text; v_meta jsonb; v_hash text;
begin
  select * into r from public.lead_databases where id = p_source_id;
  if not found or coalesce(r.status,'') <> 'active' then
    delete from public.mes_knowledge_base where source_table='lead_databases' and source_id=p_source_id; return;
  end if;
  v_content := btrim(concat_ws(E'\n',
    r.title,
    nullif(btrim(r.short_description),''),
    nullif(btrim(r.description),''),
    case when nullif(btrim(r.list_type),'') is not null then 'List type: '||r.list_type end,
    case when nullif(btrim(r.sector),'') is not null then 'Sector: '||r.sector end,
    case when nullif(btrim(r.location),'') is not null then 'Location: '||r.location end,
    case when nullif(btrim(r.provider_name),'') is not null then 'Provider: '||r.provider_name end,
    case when r.record_count is not null then 'Records: '||r.record_count::text end,
    case when r.sample_fields is not null and array_length(r.sample_fields,1)>0 then 'Sample fields: '||array_to_string(r.sample_fields,', ') end));
  v_hash := md5(v_content);
  v_meta := jsonb_build_object(
    'sector', case when nullif(btrim(r.sector),'') is not null then jsonb_build_array(r.sector) else '[]'::jsonb end,
    'country', null, 'visibility','paid', 'is_active',true,
    'source_url','https://market-entry-secrets.lovable.app/leads/'||coalesce(r.slug,r.id::text), 'plan_tier','scale');
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('lead_databases',r.id,0,'lead_database',r.title,v_content,v_meta,v_hash)
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;
end; $$;


ALTER FUNCTION "public"."upsert_kb_lead_database"("p_source_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_kb_linkedin_post"("p_source_ref" "text", "p_content" "text", "p_embedding" "public"."vector" DEFAULT NULL::"public"."vector", "p_title" "text" DEFAULT NULL::"text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb", "p_embedding_model" "text" DEFAULT 'text-embedding-3-small'::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  c_source_project constant text := 'content_creator';
  c_source_table   constant text := 'linkedin_post';
  v_source_id      uuid;
  v_content_hash   text;
  v_meta           jsonb;
  v_id             uuid;
begin
  if p_content is null or length(btrim(p_content)) = 0 then
    raise exception 'upsert_kb_linkedin_post: empty content for source_ref %', p_source_ref;
  end if;

  v_source_id    := public.kb_external_source_id(c_source_project, p_source_ref);
  v_content_hash := md5(p_content);

  v_meta := coalesce(p_metadata, '{}'::jsonb)
            || jsonb_build_object(
                 'visibility',     'internal',
                 'is_active',      true,
                 'source_ref',     p_source_ref,
                 'source_project', c_source_project
               );

  insert into public.mes_knowledge_base as kb (
    source_table, source_id, source_project, chunk_index, entity_type,
    title, content, metadata, content_hash,
    embedding, embedded_hash, embedding_model, updated_at
  ) values (
    c_source_table, v_source_id, c_source_project, 0, 'linkedin_post',
    p_title, p_content, v_meta, v_content_hash,
    p_embedding,
    case when p_embedding is not null then v_content_hash else null end,
    p_embedding_model, now()
  )
  on conflict (source_table, source_id, chunk_index) do update set
    title         = coalesce(nullif(excluded.title, ''), kb.title),
    content       = coalesce(nullif(excluded.content, ''), kb.content),
    content_hash  = case when nullif(excluded.content, '') is not null
                         then excluded.content_hash else kb.content_hash end,
    metadata      = kb.metadata || excluded.metadata,
    embedding     = case when excluded.content_hash is distinct from kb.content_hash
                          and excluded.embedding is not null
                         then excluded.embedding else kb.embedding end,
    embedded_hash = case when excluded.content_hash is distinct from kb.content_hash
                          and excluded.embedding is not null
                         then excluded.content_hash else kb.embedded_hash end,
    embedding_model = coalesce(excluded.embedding_model, kb.embedding_model),
    source_project  = excluded.source_project,
    updated_at      = now()
  returning kb.id into v_id;

  return v_id;
end;
$$;


ALTER FUNCTION "public"."upsert_kb_linkedin_post"("p_source_ref" "text", "p_content" "text", "p_embedding" "public"."vector", "p_title" "text", "p_metadata" "jsonb", "p_embedding_model" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."upsert_kb_linkedin_post"("p_source_ref" "text", "p_content" "text", "p_embedding" "public"."vector", "p_title" "text", "p_metadata" "jsonb", "p_embedding_model" "text") IS 'Phase 4 kb-sync write path: upserts a Content Creator LinkedIn post into mes_knowledge_base as an internal, synthesis-only source. Embedding is copied (embedded_hash=content_hash) so embed-knowledge never re-embeds it.';



CREATE OR REPLACE FUNCTION "public"."upsert_kb_linkedin_posts"("p_rows" "jsonb") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_count integer;
begin
  insert into public.mes_knowledge_base as kb (
    source_table, source_id, source_project, chunk_index, entity_type,
    title, content, metadata, content_hash,
    embedding, embedded_hash, embedding_model, updated_at
  )
  select
    'linkedin_post',
    public.kb_external_source_id('content_creator', r.source_ref),
    'content_creator',
    0,
    'linkedin_post',
    r.title,
    r.content,
    coalesce(r.metadata, '{}'::jsonb) || jsonb_build_object(
      'visibility', 'internal', 'is_active', true,
      'source_ref', r.source_ref, 'source_project', 'content_creator'),
    md5(r.content),
    case when nullif(r.embedding, '') is null then null else r.embedding::vector end,
    case when nullif(r.embedding, '') is null then null else md5(r.content) end,
    coalesce(nullif(r.embedding_model, ''), 'text-embedding-3-small'),
    now()
  from jsonb_to_recordset(p_rows) as r(
    source_ref text, content text, title text,
    embedding text, metadata jsonb, embedding_model text
  )
  where r.content is not null and length(btrim(r.content)) > 0
  on conflict (source_table, source_id, chunk_index) do update set
    title           = coalesce(nullif(excluded.title, ''), kb.title),
    content         = coalesce(nullif(excluded.content, ''), kb.content),
    content_hash    = case when nullif(excluded.content, '') is not null then excluded.content_hash else kb.content_hash end,
    metadata        = kb.metadata || excluded.metadata,
    embedding       = case when excluded.content_hash is distinct from kb.content_hash and excluded.embedding is not null then excluded.embedding else kb.embedding end,
    embedded_hash   = case when excluded.content_hash is distinct from kb.content_hash and excluded.embedding is not null then excluded.content_hash else kb.embedded_hash end,
    embedding_model = coalesce(excluded.embedding_model, kb.embedding_model),
    source_project  = excluded.source_project,
    updated_at      = now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;


ALTER FUNCTION "public"."upsert_kb_linkedin_posts"("p_rows" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_kb_mentor"("p_source_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare r public.community_members%rowtype; v_content text; v_meta jsonb; v_hash text; v_title text;
begin
  select * into r from public.community_members where id = p_source_id;
  if not found or coalesce(r.is_active,true)=false then
    delete from public.mes_knowledge_base where source_table='community_members' and source_id=p_source_id; return;
  end if;
  -- anonymous mentors: never embed the personal name
  v_title := case when coalesce(r.is_anonymous,false) then coalesce(nullif(btrim(r.archetype),''),nullif(btrim(r.title),''),'Mentor') else r.name end;
  v_content := btrim(concat_ws(E'\n',
    case when coalesce(r.is_anonymous,false) then null else r.name end,
    nullif(btrim(r.title),''),
    case when nullif(btrim(r.company),'') is not null then 'Company: '||r.company end,
    nullif(btrim(r.description),''),
    nullif(btrim(r.experience),''),
    case when r.specialties is not null and array_length(r.specialties,1)>0 then 'Specialties: '||array_to_string(r.specialties,', ') end,
    case when nullif(btrim(r.origin_country),'') is not null then 'Origin country: '||r.origin_country end));
  v_hash := md5(v_content);
  v_meta := jsonb_build_object(
    'sector', case when r.sector_tags is not null and array_length(r.sector_tags,1)>0 then to_jsonb(r.sector_tags) else '[]'::jsonb end,
    'country', nullif(btrim(r.origin_country),''), 'visibility','public', 'is_active',true,
    'source_url','https://market-entry-secrets.lovable.app/mentors', 'plan_tier','free');
  insert into public.mes_knowledge_base(source_table,source_id,chunk_index,entity_type,title,content,metadata,content_hash)
  values('community_members',r.id,0,'mentor',v_title,v_content,v_meta,v_hash)
  on conflict (source_table,source_id,chunk_index) do update set
    content=excluded.content, content_hash=excluded.content_hash, metadata=excluded.metadata, title=excluded.title, entity_type=excluded.entity_type, updated_at=now()
  where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
     or public.mes_knowledge_base.metadata is distinct from excluded.metadata
     or public.mes_knowledge_base.title is distinct from excluded.title;
end; $$;


ALTER FUNCTION "public"."upsert_kb_mentor"("p_source_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_kb_service_provider"("p_source_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  r public.service_providers%rowtype;
  v_content text;
  v_meta    jsonb;
  v_hash    text;
begin
  select * into r from public.service_providers where id = p_source_id;
  if not found then
    -- source gone => remove derived rows
    delete from public.mes_knowledge_base
      where source_table = 'service_providers' and source_id = p_source_id;
    return;
  end if;

  -- PII-stripped embeddable content. Deliberately excludes contact, contact_persons,
  -- experience_tiles (may contain client/personal names) and raw website URL.
  v_content := btrim(concat_ws(E'\n',
    r.name,
    nullif(btrim(r.description), ''),
    nullif(btrim(r.basic_info), ''),
    nullif(btrim(r.why_work_with_us), ''),
    case when r.services is not null and array_length(r.services, 1) > 0
         then 'Services: ' || array_to_string(r.services, ', ') end,
    case when r.sector_tags is not null and array_length(r.sector_tags, 1) > 0
         then 'Sectors: ' || array_to_string(r.sector_tags, ', ') end,
    case when nullif(btrim(r.location), '') is not null
         then 'Location: ' || r.location end
  ));
  v_hash := md5(v_content);

  -- service_providers has no is_active/status column => always active, public.
  v_meta := jsonb_build_object(
    'sector',     coalesce(to_jsonb(r.sector_tags), '[]'::jsonb),
    'country',    null,
    'visibility', 'public',
    'is_active',  true,
    'source_url', 'https://market-entry-secrets.lovable.app/service-providers/' || coalesce(r.slug, r.id::text),
    'plan_tier',  'free'
  );

  insert into public.mes_knowledge_base
    (source_table, source_id, chunk_index, entity_type, title, content, metadata, content_hash)
  values
    ('service_providers', r.id, 0, 'service_provider', r.name, v_content, v_meta, v_hash)
  on conflict (source_table, source_id, chunk_index) do update
    set content      = excluded.content,
        content_hash = excluded.content_hash,
        metadata     = excluded.metadata,
        title        = excluded.title,
        entity_type  = excluded.entity_type,
        updated_at   = now()
    -- skip no-op writes so embedding/embedded_hash and updated_at don't churn
    where public.mes_knowledge_base.content_hash is distinct from excluded.content_hash
       or public.mes_knowledge_base.metadata     is distinct from excluded.metadata
       or public.mes_knowledge_base.title        is distinct from excluded.title;
end;
$$;


ALTER FUNCTION "public"."upsert_kb_service_provider"("p_source_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_normalized_event"("e" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_dup  uuid;
  v_id   uuid;
  v_date timestamptz := nullif(e->>'event_date','')::timestamptz;
  v_slug text;
BEGIN
  v_dup := find_duplicate_event(e->>'title', v_date, e->>'city');
  v_slug := left(regexp_replace(lower(coalesce(e->>'title','event')), '[^a-z0-9]+', '-', 'g'), 60)
            || '-' || left(md5(coalesce(e->>'source_url', e->>'title')), 6);

  INSERT INTO events (
    source_url, source, source_platform, status,
    title, description, slug, type, category,
    event_date, date, location, venue,
    city, state_region, country, event_format, sector, persona, image_url, registration_url,
    relevance_score, match_reasons, tags, data_quality_flags,
    confidence, possible_duplicate_of, date_precision, ingested_at, normalized_at
  ) VALUES (
    e->>'source_url', 'apify_events_finder', e->>'source_platform',
    CASE
      WHEN (e->>'is_anz')::boolean IS FALSE                                THEN 'rejected'
      WHEN e->>'flags' LIKE '%date_unparseable%'                           THEN 'rejected'
      WHEN v_dup IS NOT NULL                                               THEN 'needs_review'
      WHEN coalesce((e->>'confidence')::numeric, 0) < 0.6                  THEN 'needs_review'
      WHEN coalesce((e->>'relevance_score')::int, 0) >= 70
           AND coalesce((e->>'confidence')::numeric, 0) >= 0.85           THEN 'approved'
      ELSE 'needs_review'
    END,
    e->>'title',
    COALESCE(NULLIF(e->>'editorial_description',''), e->>'title'),
    v_slug,
    COALESCE(NULLIF(e->>'event_type',''), 'Networking'),
    COALESCE(NULLIF(e->>'sector',''), 'Founders & Startups'),
    v_date,
    v_date::date,
    COALESCE(NULLIF(e->>'location',''),
             NULLIF(concat_ws(', ', nullif(e->>'venue',''), e->>'city'),''),
             e->>'city', 'Australia'),
    NULLIF(e->>'venue',''),
    e->>'city', e->>'state_region',
    COALESCE(NULLIF(e->>'country',''),'AU'),
    CASE WHEN (e->>'is_online')::boolean THEN 'virtual' ELSE 'in_person' END,
    NULLIF(e->>'sector',''), NULLIF(e->>'persona',''), NULLIF(e->>'image_url',''),
    NULLIF(e->>'source_url',''),
    nullif(e->>'relevance_score','')::int,
    string_to_array(nullif(e->>'match_reasons',''), '||'),
    string_to_array(nullif(e->>'tags',''), '||'),
    string_to_array(nullif(e->>'flags',''), ','),
    nullif(e->>'confidence','')::numeric, v_dup, 'exact', now(), now()
  )
  ON CONFLICT (source_url) WHERE source_url IS NOT NULL DO UPDATE SET
    title            = COALESCE(NULLIF(events.title, ''), EXCLUDED.title),
    description      = COALESCE(NULLIF(events.description, ''), EXCLUDED.description),
    venue            = COALESCE(NULLIF(events.venue, ''), EXCLUDED.venue),
    image_url        = COALESCE(NULLIF(events.image_url, ''), EXCLUDED.image_url),
    registration_url = COALESCE(NULLIF(events.registration_url, ''), EXCLUDED.registration_url),
    sector           = COALESCE(NULLIF(events.sector, ''), EXCLUDED.sector),
    event_date      = EXCLUDED.event_date,
    date            = EXCLUDED.date,
    relevance_score = EXCLUDED.relevance_score,
    match_reasons   = CASE WHEN events.match_reasons IS NULL OR events.match_reasons = '{}'::text[]
                           THEN EXCLUDED.match_reasons ELSE events.match_reasons END,
    normalized_at   = now()
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;


ALTER FUNCTION "public"."upsert_normalized_event"("e" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_industry_sector_values"("industries" "text"[]) RETURNS boolean
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF industries IS NULL OR array_length(industries, 1) IS NULL THEN
    RETURN true;
  END IF;
  RETURN NOT EXISTS (
    SELECT 1 FROM unnest(industries) AS val
    WHERE val NOT IN (
      SELECT DISTINCT industry_group FROM public.linkedin_industries WHERE is_active = true
    )
    AND val NOT IN (
      SELECT DISTINCT legacy_value FROM public.legacy_industry_mapping
    )
  );
END;
$$;


ALTER FUNCTION "public"."validate_industry_sector_values"("industries" "text"[]) OWNER TO "postgres";


CREATE FOREIGN DATA WRAPPER "mes" HANDLER "extensions"."wasm_fdw_handler" VALIDATOR "extensions"."wasm_fdw_validator";




CREATE SERVER "mes_server" FOREIGN DATA WRAPPER "mes" OPTIONS (
    "api_key_id" 'bd1b8ea9-b92e-4f5f-9301-29088c936e41',
    "api_url" 'https://api.notion.com/v1',
    "fdw_package_checksum" '6dea3014f462aafd0c051c37d163fe326e7650c26a7eb5d8017a30634b5a46de',
    "fdw_package_name" 'supabase:notion-fdw',
    "fdw_package_url" 'https://github.com/supabase/wrappers/releases/download/wasm_notion_fdw_v0.1.1/notion_fdw.wasm',
    "fdw_package_version" '0.1.1'
);


ALTER SERVER "mes_server" OWNER TO "postgres";


CREATE FOREIGN TABLE "private"."MES" (
    "url" "text",
    "created_time" timestamp without time zone,
    "last_edited_time" timestamp without time zone,
    "archived" boolean,
    "attrs" "jsonb",
    "id" "text"
)
SERVER "mes_server"
OPTIONS (
    "object" 'database',
    "schema" 'public'
);


ALTER FOREIGN TABLE "private"."MES" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "private"."_snapshot_deleted_mentor_seeds" (
    "id" "uuid",
    "name" "text",
    "title" "text",
    "description" "text",
    "location" "text",
    "experience" "text",
    "specialties" "text"[],
    "website" "text",
    "contact" "text",
    "image" "text",
    "company" "text",
    "is_anonymous" boolean,
    "experience_tiles" "jsonb",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "origin_country" "text",
    "associated_countries" "text"[],
    "location_id" "uuid",
    "slug" "text",
    "archetype" "text",
    "persona_fit" "text"[],
    "is_active" boolean,
    "is_featured" boolean,
    "sector_tags" "text"[],
    "sector_agnostic" boolean,
    "anonymous_alias" "text",
    "anonymous_company_label" "text",
    "anonymous_headline" "text",
    "anonymous_bio" "text",
    "market_corridors" "text"[]
);


ALTER TABLE "private"."_snapshot_deleted_mentor_seeds" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "private"."_snapshot_experience_tiles" (
    "id" "uuid",
    "experience_tiles" "jsonb"
);


ALTER TABLE "private"."_snapshot_experience_tiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "private"."_staging_experience_companies" (
    "name" "text" NOT NULL,
    "domain" "text",
    "confidence" "text",
    "verified" boolean DEFAULT false
);


ALTER TABLE "private"."_staging_experience_companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."_archived_market_entry_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "report_type" "text" DEFAULT 'market_analysis'::"text" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "created_by_team_member" "text",
    "file_url" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "delivered_at" timestamp with time zone
);


ALTER TABLE "public"."_archived_market_entry_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activity_event_routing" (
    "event_type" "text" NOT NULL,
    "channel_id" "text" NOT NULL,
    "emoji" "text" DEFAULT ':bell:'::"text" NOT NULL,
    "severity" "text" NOT NULL,
    "realtime" boolean DEFAULT false NOT NULL,
    "mention" boolean DEFAULT false NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."activity_event_routing" OWNER TO "postgres";


COMMENT ON TABLE "public"."activity_event_routing" IS 'Data-driven Slack routing + per-event kill switch (enabled=false disables with no deploy).';



CREATE TABLE IF NOT EXISTS "public"."activity_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_type" "text" NOT NULL,
    "actor_user_id" "uuid",
    "actor_email" "text",
    "actor_name" "text",
    "object_type" "text",
    "object_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "severity" "text" DEFAULT 'info'::"text" NOT NULL,
    "dedup_key" "text",
    "notified_at" timestamp with time zone,
    "slack_ts" "text",
    "dispatch_attempts" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "activity_events_severity_check" CHECK (("severity" = ANY (ARRAY['revenue'::"text", 'action'::"text", 'error'::"text", 'info'::"text"])))
);


ALTER TABLE "public"."activity_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."activity_events" IS 'Append-only event bus for platform activity -> Slack notifications. Deny-by-default RLS; producers are SECURITY DEFINER.';



CREATE TABLE IF NOT EXISTS "public"."agency_contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_id" "uuid",
    "full_name" "text" NOT NULL,
    "title" "text",
    "email" "text",
    "phone" "text",
    "linkedin_url" "text",
    "avatar_url" "text",
    "is_primary" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_archived" boolean DEFAULT false,
    "mes_relevance_score" integer,
    "tier" "text"
);


ALTER TABLE "public"."agency_contacts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."agency_contacts"."is_archived" IS 'True for contacts marked hidden in original contact_persons jsonb (e.g. former staff).';



COMMENT ON COLUMN "public"."agency_contacts"."mes_relevance_score" IS 'MES platform relevance score (0-100) from PIT CRM contact research.';



COMMENT ON COLUMN "public"."agency_contacts"."tier" IS 'Tier classification (A - High, B - Medium, C - Low, D - Skip) from PIT CRM scoring.';



CREATE TABLE IF NOT EXISTS "public"."agency_resources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agency_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "resource_type" "text",
    "url" "text",
    "max_value_aud" integer,
    "deadline_date" "date",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."agency_resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organisation_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "colour" "text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."organisation_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trade_investment_agencies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "location" "text" NOT NULL,
    "founded" "text" NOT NULL,
    "employees" "text" NOT NULL,
    "services" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "website" "text",
    "contact" "text",
    "logo" "text",
    "basic_info" "text",
    "why_work_with_us" "text",
    "experience_tiles" "jsonb" DEFAULT '[]'::"jsonb",
    "contact_persons" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "slug" "text" NOT NULL,
    "tagline" "text",
    "description_full" "text",
    "website_url" "text",
    "email" "text",
    "phone" "text",
    "linkedin_url" "text",
    "location_city" "text",
    "location_state" "text",
    "location_country" "text" DEFAULT 'australia'::"text",
    "has_multiple_locations" boolean DEFAULT false,
    "category_slug" "text",
    "organisation_type" "text",
    "government_level" "text",
    "jurisdiction" "text"[],
    "sectors_supported" "text"[],
    "support_types" "text"[],
    "target_company_stage" "text"[],
    "target_company_origin" "text"[],
    "is_free_to_access" boolean DEFAULT true,
    "is_government_funded" boolean DEFAULT false,
    "is_verified" boolean DEFAULT false,
    "is_featured" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "membership_required" boolean DEFAULT false,
    "membership_fee_aud" integer,
    "grants_available" boolean DEFAULT false,
    "max_grant_aud" integer,
    "meta_title" "text",
    "meta_description" "text",
    "view_count" integer DEFAULT 0,
    "last_updated_at" timestamp with time zone DEFAULT "now"(),
    "founded_year" "text",
    "location_id" "uuid",
    "domain" "text",
    "country_iso2" "text",
    "needs_re_research" boolean DEFAULT false,
    "sector_tags" "text"[] DEFAULT '{}'::"text"[],
    "sector_agnostic" boolean DEFAULT false
);


ALTER TABLE "public"."trade_investment_agencies" OWNER TO "postgres";


COMMENT ON COLUMN "public"."trade_investment_agencies"."domain" IS 'Canonical domain extracted from website_url. Used to derive logo.dev URL on read.';



COMMENT ON COLUMN "public"."trade_investment_agencies"."country_iso2" IS 'Canonical 2-letter ISO country code. Replaces location_country for filtering and joins.';



COMMENT ON COLUMN "public"."trade_investment_agencies"."needs_re_research" IS 'Flag set during cleanup for records needing re-research (e.g. truncated descriptions).';



CREATE OR REPLACE VIEW "public"."agencies_report_view" WITH ("security_invoker"='true') AS
 SELECT "tia"."id",
    "tia"."name",
    "tia"."slug",
    "tia"."tagline",
    "tia"."description",
    "tia"."description_full",
    "tia"."logo",
    "tia"."website_url",
    "tia"."website",
    "tia"."email",
    "tia"."phone",
    "tia"."linkedin_url",
    "tia"."organisation_type",
    "tia"."government_level",
    "tia"."category_slug",
    "oc"."name" AS "category_name",
    "oc"."icon" AS "category_icon",
    "oc"."colour" AS "category_colour",
    "tia"."jurisdiction",
    "tia"."sectors_supported",
    "tia"."support_types",
    "tia"."target_company_origin",
    "tia"."target_company_stage",
    "tia"."is_government_funded",
    "tia"."is_free_to_access",
    "tia"."membership_required",
    "tia"."membership_fee_aud",
    "tia"."grants_available",
    "tia"."max_grant_aud",
    "tia"."location",
    "tia"."location_city",
    "tia"."location_state",
    "tia"."location_country",
    "tia"."has_multiple_locations",
    "tia"."founded",
    "tia"."founded_year",
    "tia"."employees",
    "tia"."is_verified",
    "tia"."is_featured",
    "tia"."is_active",
    "tia"."view_count",
    "tia"."meta_title",
    "tia"."meta_description",
    "tia"."last_updated_at",
    "tia"."services",
    "tia"."basic_info",
    "tia"."why_work_with_us",
    "tia"."contact",
    "tia"."contact_persons",
    "tia"."experience_tiles",
    "tia"."domain",
    "tia"."country_iso2",
    ( SELECT "json_agg"("json_build_object"('name', "ac"."full_name", 'title', "ac"."title", 'email', "ac"."email", 'linkedin_url', "ac"."linkedin_url", 'mes_relevance_score', "ac"."mes_relevance_score", 'tier', "ac"."tier") ORDER BY "ac"."display_order") AS "json_agg"
           FROM "public"."agency_contacts" "ac"
          WHERE (("ac"."agency_id" = "tia"."id") AND ("ac"."is_primary" = true) AND ("ac"."is_archived" = false))) AS "primary_contacts",
    ( SELECT "json_agg"("json_build_object"('name', "ac"."full_name", 'title', "ac"."title", 'linkedin_url', "ac"."linkedin_url", 'tier', "ac"."tier") ORDER BY "ac"."display_order") AS "json_agg"
           FROM "public"."agency_contacts" "ac"
          WHERE (("ac"."agency_id" = "tia"."id") AND ("ac"."is_primary" = false) AND ("ac"."is_archived" = false))) AS "team_contacts",
    ( SELECT "json_agg"("json_build_object"('title', "ar"."title", 'type', "ar"."resource_type", 'value', "ar"."max_value_aud", 'url', "ar"."url")) AS "json_agg"
           FROM "public"."agency_resources" "ar"
          WHERE (("ar"."agency_id" = "tia"."id") AND ("ar"."is_active" = true))) AS "resources"
   FROM ("public"."trade_investment_agencies" "tia"
     LEFT JOIN "public"."organisation_categories" "oc" ON (("oc"."slug" = "tia"."category_slug")))
  WHERE ("tia"."is_active" = true);


ALTER VIEW "public"."agencies_report_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_chat_conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text" DEFAULT 'New Conversation'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "session_id" "text"
);


ALTER TABLE "public"."ai_chat_conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "content" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ai_chat_messages_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'assistant'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."ai_chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automation_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "loop" "text" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "finished_at" timestamp with time zone,
    "status" "text" DEFAULT 'running'::"text" NOT NULL,
    "reviewed" integer DEFAULT 0 NOT NULL,
    "proposed" integer DEFAULT 0 NOT NULL,
    "accepted" integer DEFAULT 0 NOT NULL,
    "tokens_used" integer,
    "cost" "jsonb",
    "error" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."automation_runs" OWNER TO "postgres";


COMMENT ON TABLE "public"."automation_runs" IS 'Run log for scheduled MES automation loops. Admin-read only; writes are service-role only.';



CREATE TABLE IF NOT EXISTS "public"."bookmarks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content_type" "text" NOT NULL,
    "content_id" "text" NOT NULL,
    "content_title" "text" NOT NULL,
    "content_description" "text",
    "content_metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."bookmarks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."case_study_quotes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_study_id" "uuid" NOT NULL,
    "section_id" "uuid",
    "quote" "text" NOT NULL,
    "attributed_to" "text" NOT NULL,
    "role" "text",
    "source_url" "text",
    "source_label" "text",
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."case_study_quotes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."case_study_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_study_id" "uuid" NOT NULL,
    "section_id" "uuid",
    "label" "text" NOT NULL,
    "url" "text" NOT NULL,
    "accessed_at" "date",
    "source_type" "text",
    "citation_number" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "case_study_sources_source_type_check" CHECK ((("source_type" IS NULL) OR ("source_type" = ANY (ARRAY['news'::"text", 'company_blog'::"text", 'sec_filing'::"text", 'interview'::"text", 'linkedin'::"text", 'podcast'::"text", 'press_release'::"text", 'government'::"text", 'academic'::"text", 'other'::"text"]))))
);


ALTER TABLE "public"."case_study_sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "location" "text" NOT NULL,
    "experience" "text" NOT NULL,
    "specialties" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "website" "text",
    "contact" "text",
    "image" "text",
    "company" "text",
    "is_anonymous" boolean DEFAULT false NOT NULL,
    "experience_tiles" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "origin_country" "text",
    "associated_countries" "text"[] DEFAULT '{}'::"text"[],
    "location_id" "uuid",
    "slug" "text" NOT NULL,
    "archetype" "text",
    "persona_fit" "text"[] DEFAULT '{}'::"text"[],
    "is_active" boolean DEFAULT true,
    "is_featured" boolean DEFAULT false,
    "sector_tags" "text"[] DEFAULT '{}'::"text"[],
    "sector_agnostic" boolean DEFAULT false,
    "anonymous_alias" "text",
    "anonymous_company_label" "text",
    "anonymous_headline" "text",
    "anonymous_bio" "text",
    "market_corridors" "text"[]
);


ALTER TABLE "public"."community_members" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."community_members_public" WITH ("security_invoker"='false') AS
 SELECT "id",
        CASE
            WHEN "is_anonymous" THEN COALESCE("anonymous_alias", "archetype", 'Verified Expert'::"text")
            ELSE "name"
        END AS "name",
        CASE
            WHEN "is_anonymous" THEN COALESCE("anonymous_headline", "archetype", 'Verified Expert'::"text")
            ELSE "title"
        END AS "title",
        CASE
            WHEN "is_anonymous" THEN COALESCE("anonymous_bio", ((('Senior '::"text" || COALESCE("archetype", 'operator'::"text")) ||
            CASE
                WHEN (("sector_tags" IS NOT NULL) AND ("sector_tags" <> '{}'::"text"[])) THEN (' with experience across '::"text" || "initcap"("replace"("array_to_string"("sector_tags", ', '::"text"), '-'::"text", ' '::"text")))
                ELSE ''::"text"
            END) || '.'::"text"))
            ELSE "description"
        END AS "description",
        CASE
            WHEN "is_anonymous" THEN COALESCE("origin_country", NULLIF("btrim"("split_part"("location", ','::"text", '-1'::integer)), ''::"text"), 'Undisclosed'::"text")
            ELSE "location"
        END AS "location",
        CASE
            WHEN "is_anonymous" THEN NULL::"text"
            ELSE "experience"
        END AS "experience",
    "specialties",
        CASE
            WHEN "is_anonymous" THEN NULL::"text"
            ELSE "image"
        END AS "image",
        CASE
            WHEN "is_anonymous" THEN COALESCE("anonymous_company_label", 'Undisclosed'::"text")
            ELSE "company"
        END AS "company",
    "is_anonymous",
        CASE
            WHEN "is_anonymous" THEN '[]'::"jsonb"
            ELSE "experience_tiles"
        END AS "experience_tiles",
    "created_at",
    "updated_at",
    "origin_country",
    "associated_countries",
    "location_id",
        CASE
            WHEN "is_anonymous" THEN ('anon-'::"text" || "left"(("id")::"text", 8))
            ELSE "slug"
        END AS "slug",
    "archetype",
    "persona_fit",
    "is_active",
    "is_featured",
    "market_corridors",
    "sector_tags",
    "sector_agnostic"
   FROM "public"."community_members";


ALTER VIEW "public"."community_members_public" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content_bodies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content_id" "uuid",
    "section_id" "uuid",
    "question" "text",
    "body_text" "text" NOT NULL,
    "body_markdown" "text",
    "sort_order" integer DEFAULT 0,
    "content_type" "text" DEFAULT 'paragraph'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."content_bodies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "color" "text",
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."content_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content_company_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content_id" "uuid",
    "company_name" "text" NOT NULL,
    "company_logo" "text",
    "website" "text",
    "origin_country" "text",
    "target_market" "text",
    "entry_date" "text",
    "monthly_revenue" "text",
    "annual_revenue" "text",
    "startup_costs" "text",
    "gross_margin" "text",
    "is_profitable" boolean DEFAULT false,
    "founder_count" integer DEFAULT 1,
    "employee_count" integer DEFAULT 1,
    "industry" "text",
    "business_model" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "outcome" "text"
);


ALTER TABLE "public"."content_company_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content_founders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content_id" "uuid",
    "name" "text" NOT NULL,
    "title" "text" NOT NULL,
    "bio" "text",
    "image" "text",
    "social_twitter" "text",
    "social_linkedin" "text",
    "social_instagram" "text",
    "social_youtube" "text",
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."content_founders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "category_id" "uuid",
    "content_type" "text" DEFAULT 'article'::"text" NOT NULL,
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "featured" boolean DEFAULT false,
    "read_time" integer DEFAULT 5,
    "publish_date" timestamp with time zone DEFAULT "now"(),
    "meta_description" "text",
    "meta_keywords" "text"[],
    "sector_tags" "text"[],
    "view_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "hero_image_url" "text",
    "hero_image_alt" "text",
    "hero_image_credit" "text",
    "body_images" "jsonb",
    "tldr" "text"[],
    "quick_facts" "jsonb",
    "last_verified_at" timestamp with time zone,
    "researched_by" "text",
    "researched_by_avatar_url" "text",
    "style_version" integer DEFAULT 1 NOT NULL,
    "sector_agnostic" boolean DEFAULT false
);


ALTER TABLE "public"."content_items" OWNER TO "postgres";


COMMENT ON COLUMN "public"."content_items"."body_images" IS 'Array of {url, alt, caption, credit, position_after_section_id} objects, validated at app layer.';



COMMENT ON COLUMN "public"."content_items"."tldr" IS 'Array of 3-5 short bullets, max ~12 words each, enforced at app layer.';



COMMENT ON COLUMN "public"."content_items"."quick_facts" IS 'Array of {label, value, icon} objects, where icon is a Lucide icon name.';



COMMENT ON COLUMN "public"."content_items"."style_version" IS 'Tracks which house-style/voice version a case study was last edited under.';



CREATE TABLE IF NOT EXISTS "public"."content_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content_id" "uuid",
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."content_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."countries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text" NOT NULL,
    "hero_title" "text" NOT NULL,
    "hero_description" "text" NOT NULL,
    "location_type" "text" DEFAULT 'country'::"text" NOT NULL,
    "trade_relationship_strength" "text" DEFAULT 'Growing'::"text",
    "economic_indicators" "jsonb" DEFAULT '{}'::"jsonb",
    "key_industries" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "content_keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "service_keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "event_keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "lead_keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "featured" boolean DEFAULT false NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "countries_trade_relationship_strength_check" CHECK (("trade_relationship_strength" = ANY (ARRAY['Strong'::"text", 'Growing'::"text", 'Emerging'::"text"])))
);


ALTER TABLE "public"."countries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."country_case_studies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "country_id" "uuid" NOT NULL,
    "sort_order" integer NOT NULL,
    "company_name" "text" NOT NULL,
    "sector" "text" NOT NULL,
    "outcome" "text" NOT NULL,
    "logo_color" "text",
    "wordmark" "text",
    "content_item_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."country_case_studies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."country_faqs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "country_id" "uuid" NOT NULL,
    "sort_order" integer NOT NULL,
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."country_faqs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."country_funding_instruments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "country_id" "uuid" NOT NULL,
    "side" "text" NOT NULL,
    "sort_order" integer NOT NULL,
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "tag" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "country_funding_instruments_side_check" CHECK (("side" = ANY (ARRAY['origin'::"text", 'destination'::"text"])))
);


ALTER TABLE "public"."country_funding_instruments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."country_page_content" (
    "country_id" "uuid" NOT NULL,
    "hero_headline" "text" NOT NULL,
    "hero_subhead" "text" NOT NULL,
    "hero_badge" "text",
    "hero_trust_companies" "text"[] DEFAULT '{}'::"text"[],
    "hero_trust_extra" integer DEFAULT 0,
    "narrative_bullets" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "differentiators" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "pull_quote" "text",
    "pull_quote_attr" "text",
    "live_snapshot" "jsonb",
    "featured_city_slugs" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."country_page_content" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."country_playbook_stages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "country_id" "uuid" NOT NULL,
    "stage_number" integer NOT NULL,
    "title" "text" NOT NULL,
    "time_range" "text" NOT NULL,
    "summary" "text" NOT NULL,
    "sub_steps" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "country_playbook_stages_stage_number_check" CHECK ((("stage_number" >= 1) AND ("stage_number" <= 6)))
);


ALTER TABLE "public"."country_playbook_stages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."country_trade_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "country_id" "uuid" NOT NULL,
    "sort_order" integer NOT NULL,
    "value" "text" NOT NULL,
    "label" "text" NOT NULL,
    "source" "text" NOT NULL,
    "source_url" "text",
    "delta" "text",
    "positive" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."country_trade_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."directory_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "submission_type" "text" NOT NULL,
    "form_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "contact_email" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "valid_submission_type" CHECK (("submission_type" = ANY (ARRAY['mentor'::"text", 'service_provider'::"text", 'trade_agency'::"text", 'innovation_organization'::"text", 'investor'::"text", 'event'::"text", 'content'::"text", 'data_request'::"text"])))
);


ALTER TABLE "public"."directory_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ecosystem_import_candidates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "batch_id" "text" NOT NULL,
    "source_name" "text" NOT NULL,
    "source_url" "text",
    "source_tab" "text" NOT NULL,
    "source_rows" integer[] DEFAULT '{}'::integer[] NOT NULL,
    "raw" "jsonb" NOT NULL,
    "entity_type" "text" NOT NULL,
    "proposed_destination" "text" NOT NULL,
    "proposed_action" "text" NOT NULL,
    "proposed_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "dedupe_key" "text" NOT NULL,
    "matched_existing_id" "uuid",
    "matched_table" "text",
    "match_method" "text",
    "match_note" "text",
    "confidence" "text" NOT NULL,
    "validation_flags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "verification" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "verified_at" timestamp with time zone,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "review_notes" "text",
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "applied_at" timestamp with time zone,
    "target_record_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ecosystem_import_candidates_confidence_check" CHECK (("confidence" = ANY (ARRAY['high'::"text", 'medium'::"text", 'low'::"text"]))),
    CONSTRAINT "ecosystem_import_candidates_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['investor_fund'::"text", 'investor_person'::"text", 'accelerator'::"text", 'coworking_space'::"text", 'newsletter'::"text", 'podcast'::"text", 'student_society'::"text", 'workshop_host'::"text"]))),
    CONSTRAINT "ecosystem_import_candidates_proposed_action_check" CHECK (("proposed_action" = ANY (ARRAY['insert_new'::"text", 'enrich_existing'::"text", 'related_review'::"text", 'content_guide'::"text", 'review'::"text", 'exclude'::"text"]))),
    CONSTRAINT "ecosystem_import_candidates_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'duplicate'::"text", 'applied'::"text", 'invalid'::"text"])))
);


ALTER TABLE "public"."ecosystem_import_candidates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."edge_function_rate_limits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "function_name" "text" NOT NULL,
    "invoked_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."edge_function_rate_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "source" "text" DEFAULT 'homepage_hero'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."email_leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "recipient_email" "text" NOT NULL,
    "email_type" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "resend_id" "text",
    "status" "text" DEFAULT 'sent'::"text" NOT NULL,
    "error_message" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "idempotency_key" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."email_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_sequence_steps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sequence_name" "text" NOT NULL,
    "step_number" integer NOT NULL,
    "template_name" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "delay_days" integer NOT NULL,
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."email_sequence_steps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_sequences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "sequence_name" "text" DEFAULT 'onboarding'::"text" NOT NULL,
    "current_step" integer DEFAULT 0 NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"(),
    "next_send_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "paused" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."email_sequences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "date" "date",
    "time" "text" DEFAULT 'See website'::"text",
    "location" "text" NOT NULL,
    "type" "text" NOT NULL,
    "category" "text" NOT NULL,
    "attendees" integer DEFAULT 0 NOT NULL,
    "organizer" "text" DEFAULT 'TBC'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "event_logo_url" "text",
    "sector" "text",
    "slug" "text" NOT NULL,
    "website_url" "text",
    "registration_url" "text",
    "organizer_email" "text",
    "organizer_website" "text",
    "price" "text",
    "is_featured" boolean DEFAULT false NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "image_url" "text",
    "location_id" "uuid",
    "typical_month" "text",
    "attendees_label" "text",
    "venue" "text",
    "frequency" "text" DEFAULT 'Annual'::"text",
    "exhibitors" integer,
    "exhibitors_label" "text",
    "city" "text",
    "state_region" "text",
    "date_precision" "text" DEFAULT 'exact'::"text" NOT NULL,
    "sector_tags" "text"[] DEFAULT '{}'::"text"[],
    "sector_agnostic" boolean DEFAULT false,
    "event_date" timestamp with time zone,
    "source_url" "text",
    "source_platform" "text",
    "source" "text" DEFAULT 'manual'::"text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "country" "text" DEFAULT 'AU'::"text",
    "event_format" "text" DEFAULT 'in_person'::"text",
    "persona" "text",
    "relevance_score" integer,
    "match_reasons" "text"[] DEFAULT '{}'::"text"[],
    "data_quality_flags" "text"[] DEFAULT '{}'::"text"[],
    "confidence" numeric,
    "possible_duplicate_of" "uuid",
    "ingested_at" timestamp with time zone,
    "normalized_at" timestamp with time zone,
    CONSTRAINT "events_date_precision_check" CHECK (("date_precision" = ANY (ARRAY['exact'::"text", 'month'::"text", 'tbc'::"text"]))),
    CONSTRAINT "events_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'needs_review'::"text"])))
);


ALTER TABLE "public"."events" OWNER TO "postgres";


COMMENT ON COLUMN "public"."events"."date_precision" IS 'Precision of the date field. exact = real scheduled date; month = approximate (typical_month); tbc = unknown.';



CREATE TABLE IF NOT EXISTS "public"."events_staging" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_url" "text",
    "run_id" "text",
    "raw" "jsonb" NOT NULL,
    "processed" boolean DEFAULT false NOT NULL,
    "processed_at" timestamp with time zone,
    "target_event_id" "uuid",
    "ingested_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."events_staging" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."firecrawl_scrape_cache" (
    "url_key" "text" NOT NULL,
    "content" "text",
    "ok" boolean DEFAULT false NOT NULL,
    "status" integer,
    "byte_len" integer,
    "fetched_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."firecrawl_scrape_cache" OWNER TO "postgres";


COMMENT ON TABLE "public"."firecrawl_scrape_cache" IS 'Memoised Firecrawl scrape results keyed by normalised URL. Service-role only; TTL enforced at read in generate-report.';



CREATE TABLE IF NOT EXISTS "public"."guide_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content_item_id" "uuid" NOT NULL,
    "display_name" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "file_size_bytes" bigint,
    "mime_type" "text",
    "download_count" integer DEFAULT 0,
    "sort_order" integer DEFAULT 0,
    "is_premium" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."guide_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ii_content" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "gmail_message_id" "text",
    "thread_id" "text",
    "from_email" "text",
    "from_name" "text",
    "to_email" "text",
    "subject" "text",
    "body_text" "text",
    "body_html" "text",
    "received_at" timestamp with time zone,
    "gmail_labels" "text"[],
    "is_ii_relevant" boolean,
    "relevance_score" numeric,
    "category" "text",
    "classifier_reasoning" "text",
    "summary" "text",
    "entities" "jsonb" DEFAULT '{}'::"jsonb",
    "tags" "text"[],
    "source_url" "text",
    "key_quote" "text",
    "embedding" "public"."vector"(1536),
    "embedding_model" "text",
    "processed_at" timestamp with time zone DEFAULT "now"(),
    "classifier_version" "text" DEFAULT 'v1'::"text",
    "extractor_version" "text" DEFAULT 'v1'::"text",
    "embedder_version" "text" DEFAULT 'openai-text-embedding-3-small'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "source_type" "text" NOT NULL,
    "source_id" "text" NOT NULL,
    "source_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "author_name" "text",
    "author_handle" "text",
    "author_url" "text",
    "title" "text",
    "published_at" timestamp with time zone,
    "story_cluster_id" "uuid",
    "is_canonical" boolean DEFAULT false,
    CONSTRAINT "ii_content_category_check" CHECK ((("category" IS NULL) OR ("category" = ANY (ARRAY['funding'::"text", 'launch'::"text", 'founder'::"text", 'ecosystem'::"text", 'hiring'::"text", 'pr'::"text", 'other'::"text", 'exit'::"text", 'acquisition'::"text"])))),
    CONSTRAINT "ii_content_source_type_check" CHECK (("source_type" = ANY (ARRAY['email'::"text", 'linkedin_post'::"text", 'tweet'::"text", 'reddit_post'::"text", 'rss_article'::"text", 'manual'::"text"])))
);


ALTER TABLE "public"."ii_content" OWNER TO "postgres";


COMMENT ON COLUMN "public"."ii_content"."gmail_message_id" IS 'DEPRECATED: use source_id where source_type=email. Nullable as of migration 003. Will be dropped in migration 004.';



COMMENT ON COLUMN "public"."ii_content"."from_email" IS 'DEPRECATED: use author_handle. Will be dropped in migration 004.';



COMMENT ON COLUMN "public"."ii_content"."from_name" IS 'DEPRECATED: use author_name. Will be dropped in migration 004.';



COMMENT ON COLUMN "public"."ii_content"."subject" IS 'DEPRECATED: use title. Will be dropped in migration 004.';



COMMENT ON COLUMN "public"."ii_content"."received_at" IS 'DEPRECATED: use published_at. Will be dropped in migration 004.';



CREATE TABLE IF NOT EXISTS "public"."ii_curated_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "curation_id" "uuid",
    "action" "text" NOT NULL,
    "details" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ii_curated_log_action_check" CHECK (("action" = ANY (ARRAY['surfaced_notion'::"text", 'surfaced_slack'::"text", 'status_changed'::"text", 'rejection_captured'::"text", 'llm_call'::"text"])))
);


ALTER TABLE "public"."ii_curated_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."ii_curated_log" IS 'Append-only audit log of curation system actions. llm_call rows carry per-call token usage and cost for observability.';



COMMENT ON COLUMN "public"."ii_curated_log"."curation_id" IS 'Null permitted for week-level llm_call entries (e.g. anchor-ranking passes that do not tie to a single curation row).';



COMMENT ON COLUMN "public"."ii_curated_log"."details" IS 'Action-shaped JSON. For llm_call: {model, prompt_version, input_tokens, output_tokens, cost_usd, latency_ms}. For status_changed: {from, to, source}. For rejection_captured: {slack_ts, reply_text}.';



CREATE TABLE IF NOT EXISTS "public"."ii_curations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content_id" "uuid" NOT NULL,
    "curated_for" "date" NOT NULL,
    "surface" "text" NOT NULL,
    "slot" integer,
    "is_wildcard" boolean DEFAULT false NOT NULL,
    "score_total" numeric,
    "score_breakdown" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "brief" "jsonb",
    "prompt_version" "text",
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "rejection_reason" "text",
    "notion_page_id" "text",
    "slack_ts" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "scoring_version" "text" DEFAULT '1.0.0'::"text" NOT NULL,
    "scoring_breakdown_v2" "jsonb",
    "model_config_version" "text" DEFAULT '1.0.0'::"text" NOT NULL,
    CONSTRAINT "ii_curations_slot_check" CHECK ((("slot" IS NULL) OR (("slot" >= 1) AND ("slot" <= 15)))),
    CONSTRAINT "ii_curations_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'in_draft'::"text", 'published'::"text", 'rejected'::"text", 'parked'::"text"]))),
    CONSTRAINT "ii_curations_surface_check" CHECK (("surface" = ANY (ARRAY['daily'::"text", 'weekly'::"text", 'weekly_linkedin'::"text"])))
);


ALTER TABLE "public"."ii_curations" OWNER TO "postgres";


COMMENT ON TABLE "public"."ii_curations" IS 'Curation state for stories surfaced to the daily digest or weekly brief. Supabase is the source of truth; Notion is a rendered view.';



COMMENT ON COLUMN "public"."ii_curations"."curated_for" IS 'Date the row was surfaced. For daily, the publish date of the digest. For weekly, the week_of date (Sunday).';



COMMENT ON COLUMN "public"."ii_curations"."surface" IS 'Where the row was surfaced: daily, weekly, or weekly_linkedin.';



COMMENT ON COLUMN "public"."ii_curations"."slot" IS 'Slot 1..15. Daily uses 1..5 (5 is wildcard). Weekly LinkedIn uses per-tier slots (must_read 1..5, worth_knowing 1..10) with tier stored in score_breakdown for disambiguation; the (content_id, surface, curated_for) unique index, not slot, prevents collisions. Null for weekly rows.';



COMMENT ON COLUMN "public"."ii_curations"."is_wildcard" IS 'True only when slot=5 and the pick was chosen for novelty rather than combined score.';



COMMENT ON COLUMN "public"."ii_curations"."score_breakdown" IS 'JSON object: {signal, fit, novelty, reasons}. Scoring is pure-Python and logged here for later tuning.';



COMMENT ON COLUMN "public"."ii_curations"."brief" IS 'Haiku (daily) or Sonnet (weekly) enrichment JSON output.';



COMMENT ON COLUMN "public"."ii_curations"."prompt_version" IS 'Semver string matching the <!-- prompt_version: X.Y.Z --> header in the prompt file used for enrichment.';



COMMENT ON COLUMN "public"."ii_curations"."status" IS 'new on surface. in_draft / published / rejected / parked driven by editor action in Notion or Slack. parked stays in weekly secondary sweep; rejected does not.';



COMMENT ON COLUMN "public"."ii_curations"."rejection_reason" IS 'Free-text reason captured from a Slack thread reply after a red-x reaction. Populated on the next daily run.';



COMMENT ON COLUMN "public"."ii_curations"."scoring_version" IS 'Semver of the scoring framework that produced this row. Source of truth: ii_ingest.curate.scoring_version.SCORING_VERSION. Used by scripts/scoring_diff.py to compare picks across versions.';



COMMENT ON COLUMN "public"."ii_curations"."scoring_breakdown_v2" IS 'Structured per-axis breakdown of the score. Shape: {axes: {<axis>: {score, deltas: [{name, value}]}}, total, threshold, passed, notes}. Legacy score_breakdown column remains populated for backward compat.';



COMMENT ON COLUMN "public"."ii_curations"."model_config_version" IS 'Semver of the model-config layer that produced this row. Source of truth: ii_ingest.curate.model_config_version.MODEL_CONFIG_VERSION. Bumped when a prompt''s default model changes; independent of prompt_version and scoring_version.';



CREATE TABLE IF NOT EXISTS "public"."ii_experiment_outputs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "experiment_id" "text" NOT NULL,
    "week_of" "date" NOT NULL,
    "content_id" "uuid" NOT NULL,
    "arm" "text" NOT NULL,
    "model" "text" NOT NULL,
    "prompt_version" "text" NOT NULL,
    "output" "jsonb" NOT NULL,
    "cost_usd" numeric(10,6),
    "latency_ms" integer,
    "editor_verdict" "text",
    "editor_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ii_experiment_outputs" OWNER TO "postgres";


COMMENT ON TABLE "public"."ii_experiment_outputs" IS 'A/B experiment outputs per pick per arm. One row per (experiment_id, week_of, content_id, arm). The editor verdict is mirrored onto both arm rows for a given pick so the aggregator can count wins per arm without joining.';



COMMENT ON COLUMN "public"."ii_experiment_outputs"."arm" IS 'Arm label. ''control'' is the production-equivalent baseline; ''treatment'' is the candidate model. Free text so future experiments can use different labels.';



COMMENT ON COLUMN "public"."ii_experiment_outputs"."editor_verdict" IS 'Editor''s pick: ''control'', ''treatment'', ''tie'', ''neither''. Null until the editor reviews the row in Notion. Both arm rows for a single pick carry the same verdict so the aggregator can filter where arm = editor_verdict.';



CREATE TABLE IF NOT EXISTS "public"."ii_intro_archive" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "week_of" "date" NOT NULL,
    "candidates" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "selected_slot" integer,
    "selected_at" timestamp with time zone,
    "prompt_version" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ii_intro_archive_selected_slot_check" CHECK ((("selected_slot" IS NULL) OR (("selected_slot" >= 1) AND ("selected_slot" <= 5))))
);


ALTER TABLE "public"."ii_intro_archive" OWNER TO "postgres";


COMMENT ON TABLE "public"."ii_intro_archive" IS 'Full 5-candidate intro output per week. selected_slot is set later by the editor; drives future weighting once we have 10+ weeks of data.';



COMMENT ON COLUMN "public"."ii_intro_archive"."candidates" IS 'JSON array of 5 candidate objects as emitted by prompts/weekly-intro.md.';



COMMENT ON COLUMN "public"."ii_intro_archive"."selected_slot" IS 'Slot 1 to 5 that the editor actually used in the published issue. Null until selected.';



CREATE TABLE IF NOT EXISTS "public"."ii_personal_linkedin_posts" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "post_id" "text",
    "entity_id" "text",
    "share_urn" "text",
    "post_url" "text",
    "share_url" "text",
    "author_account" "text",
    "author_type" "text",
    "author_name" "text",
    "author_public_id" "text",
    "author_id" "text",
    "posted_at" timestamp with time zone,
    "posted_at_raw" "text",
    "body" "text",
    "content_hash" "text",
    "post_type" "text",
    "is_repost" boolean DEFAULT false,
    "reposted_by" "text",
    "reposted_by_url" "text",
    "num_likes" integer DEFAULT 0,
    "num_comments" integer DEFAULT 0,
    "num_shares" integer DEFAULT 0,
    "reactions" "jsonb",
    "post_images" "text"[] DEFAULT '{}'::"text"[],
    "media" "jsonb",
    "links" "text"[] DEFAULT '{}'::"text"[],
    "mentions" "jsonb",
    "mentioned_companies" "text"[] DEFAULT '{}'::"text"[],
    "is_ii_content" boolean,
    "relevance_source" "text",
    "ii_confidence" numeric,
    "content_topic" "text",
    "query_target_url" "text",
    "raw" "jsonb",
    "ingest_run_id" "text",
    "last_seen_run" "text",
    "last_scraped_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "embedding" "public"."vector"(1536),
    "embedding_model" "text"
);


ALTER TABLE "public"."ii_personal_linkedin_posts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."ii_personal_linkedin_posts"."created_at" IS 'first_seen. Insert only, never touched on upsert conflict.';



COMMENT ON COLUMN "public"."ii_personal_linkedin_posts"."post_id" IS 'Apify dataset id (the activity id). Upsert idempotency key. Unique.';



COMMENT ON COLUMN "public"."ii_personal_linkedin_posts"."is_ii_content" IS 'Tri-state. true = explicit Irish Insights signal (company account, link, mention, tag, or reshare). false = confirmed not II. null = undecided, left for a later classifier. Never written false by the ingester.';



COMMENT ON COLUMN "public"."ii_personal_linkedin_posts"."embedding" IS 'OpenAI text-embedding-3-small (1536 dims) on body. Same model and dims as ii_content and ii_published_archive so the coverage-map cosine join is valid.';



ALTER TABLE "public"."ii_personal_linkedin_posts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."ii_personal_linkedin_posts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."ii_prefilter_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_type" "text" NOT NULL,
    "source_id" "text" NOT NULL,
    "kept" boolean NOT NULL,
    "reason" "text",
    "body_preview" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "logged_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ii_prefilter_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."ii_prefilter_log" IS 'Audit log of Apify webhook pre-filter decisions. Both kept and dropped items are recorded.';



COMMENT ON COLUMN "public"."ii_prefilter_log"."reason" IS 'Filter rule that matched (body_too_short, company_repost, stale, zero_engagement_aged, missing_published_at). Null when kept.';



COMMENT ON COLUMN "public"."ii_prefilter_log"."body_preview" IS 'First 500 chars of body_text for quick visual review. Full body is dropped for noise items.';



COMMENT ON COLUMN "public"."ii_prefilter_log"."metadata" IS 'Arbitrary context (apify_run_id, author_handle, engagement, etc.) for debugging.';



CREATE TABLE IF NOT EXISTS "public"."ii_published_archive" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_type" "text" NOT NULL,
    "source_id" "text" NOT NULL,
    "section_name" "text" NOT NULL,
    "section_index" integer DEFAULT 0 NOT NULL,
    "section_text" "text" NOT NULL,
    "title" "text",
    "published_at" timestamp with time zone,
    "embedding" "public"."vector"(1536),
    "extractor_version" "text" DEFAULT 'v1'::"text" NOT NULL,
    "raw_metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "beehiiv_post_id" "text",
    "beehiiv_publication_id" "text",
    "status" "text",
    "sent_at" timestamp with time zone,
    "subject_line" "text",
    "preview_text" "text",
    "web_url" "text",
    "total_opens" integer,
    "total_clicks" integer,
    "open_rate" numeric,
    "click_rate" numeric,
    "unsubscribes" integer,
    "spam_complaints" integer,
    "ab_variant_data" "jsonb",
    "metrics_updated_at" timestamp with time zone,
    CONSTRAINT "ii_published_archive_source_type_check" CHECK (("source_type" = ANY (ARRAY['newsletter'::"text", 'newsletter_pdf'::"text", 'linkedin_post'::"text"]))),
    CONSTRAINT "ii_published_archive_status_check" CHECK ((("status" IS NULL) OR ("status" = ANY (ARRAY['draft'::"text", 'scheduled'::"text", 'sent'::"text", 'archived'::"text"]))))
);


ALTER TABLE "public"."ii_published_archive" OWNER TO "postgres";


COMMENT ON TABLE "public"."ii_published_archive" IS 'Published II content (newsletters + LinkedIn posts) parsed into sections with embeddings. One row per (source, section). Powers novelty scoring against historical published output and prompt-example grounding. Beehiiv-specific columns added in migration 008.';



COMMENT ON COLUMN "public"."ii_published_archive"."source_type" IS 'newsletter (Beehiiv-sourced canonical archive), newsletter_pdf (legacy PDF backfill), linkedin_post (II LinkedIn archive).';



COMMENT ON COLUMN "public"."ii_published_archive"."source_id" IS 'For newsletter: Beehiiv post_<uuid>. For newsletter_pdf: file path under newsletter content banks/. For linkedin_post: post URL.';



COMMENT ON COLUMN "public"."ii_published_archive"."section_name" IS 'Section slug from the parser. Examples: cead_mile_failte, tldr, news_from_abroad, at_home, founder_directory, brain_food, subject_line, title, subtitle.';



COMMENT ON COLUMN "public"."ii_published_archive"."section_index" IS 'Ordering within a section. 0 for singletons (intro, tldr). 0..N for repeated items (story 0..2 within News from Abroad, bullet 0..4 within Brain Food).';



COMMENT ON COLUMN "public"."ii_published_archive"."embedding" IS 'OpenAI text-embedding-3-small (1536 dims) on section_text. Same model and dims as ii_content so query embeddings can be reused.';



COMMENT ON COLUMN "public"."ii_published_archive"."beehiiv_post_id" IS 'Beehiiv post ID (post_<uuid>). Denormalized across section rows. Indexed but NOT unique because each post has multiple section rows. Null for newsletter_pdf and linkedin_post sources.';



COMMENT ON COLUMN "public"."ii_published_archive"."beehiiv_publication_id" IS 'Beehiiv publication ID. For II this is pub_715c0487-683f-4381-b91f-2edc82151a69. Captured per row so a future multi-publication setup does not need a backfill.';



COMMENT ON COLUMN "public"."ii_published_archive"."status" IS 'Beehiiv post status: draft, scheduled, sent, archived. Sync filters to status=published in API terms which Beehiiv returns as sent. Null for non-Beehiiv sources.';



COMMENT ON COLUMN "public"."ii_published_archive"."sent_at" IS 'Email send timestamp from Beehiiv scheduled_at. Authoritative publication time for newsletter rows. Differs from published_at only when scheduled_at differs from the post created_at, which it usually does.';



COMMENT ON COLUMN "public"."ii_published_archive"."subject_line" IS 'Email subject line. Mined separately from section_text because subject lines are their own learnable signal for prompts/weekly-sections.md subject_hooks.';



COMMENT ON COLUMN "public"."ii_published_archive"."preview_text" IS 'Email preview text (the line shown in the inbox under the subject). Same learnability rationale as subject_line.';



COMMENT ON COLUMN "public"."ii_published_archive"."web_url" IS 'Canonical web URL for the post (https://www.irish-insights.com/p/<slug>). Used in prompt examples to let the editor click through to the source.';



COMMENT ON COLUMN "public"."ii_published_archive"."total_opens" IS 'Aggregate unique opens from get_post_stats.email.total_unique_opened. No subscriber-level data.';



COMMENT ON COLUMN "public"."ii_published_archive"."total_clicks" IS 'Aggregate unique email clicks from get_post_stats.email.total_unique_email_clicked_raw. No subscriber-level data.';



COMMENT ON COLUMN "public"."ii_published_archive"."open_rate" IS 'Email open rate as 0-100 (NOT 0-1). Matches Beehiiv get_post_stats.email.open_rate unit. Do not normalise on read.';



COMMENT ON COLUMN "public"."ii_published_archive"."click_rate" IS 'Email click rate as 0-100 (NOT 0-1). Matches Beehiiv get_post_stats.email.click_rate unit. Do not normalise on read.';



COMMENT ON COLUMN "public"."ii_published_archive"."unsubscribes" IS 'Aggregate unsubscribe count from get_post_stats.email.total_unsubscribes.';



COMMENT ON COLUMN "public"."ii_published_archive"."spam_complaints" IS 'Aggregate spam-report count from get_post_stats.email.total_spam_reported.';



COMMENT ON COLUMN "public"."ii_published_archive"."ab_variant_data" IS 'Reserved for MCP v2. v1 returns only the winning aggregate from get_post_stats. When v2 exposes A/B variant performance, populate this without a schema change. Shape TBD.';



COMMENT ON COLUMN "public"."ii_published_archive"."metrics_updated_at" IS 'Last time get_post_stats was called for this post. Sync skips re-fetching metrics for posts updated within the last 24h to stay polite to the MCP.';



CREATE TABLE IF NOT EXISTS "public"."ii_reddit_signals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reddit_post_id" "text" NOT NULL,
    "subreddit" "text" NOT NULL,
    "permalink" "text" NOT NULL,
    "title" "text" NOT NULL,
    "selftext" "text",
    "post_url" "text",
    "post_kind" "text" NOT NULL,
    "flair" "text",
    "distinguished" "text",
    "nsfw" boolean DEFAULT false NOT NULL,
    "author_handle" "text",
    "author_url" "text",
    "author_metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "upvotes" integer DEFAULT 0 NOT NULL,
    "upvote_ratio" numeric,
    "num_comments" integer DEFAULT 0 NOT NULL,
    "posted_at" timestamp with time zone NOT NULL,
    "scanned_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "irish_identity_score" numeric,
    "topic_fit_score" numeric,
    "originality_score" numeric,
    "editorial_angle_score" numeric,
    "engagement_score" numeric,
    "source_credibility_score" numeric,
    "score_total" numeric,
    "score_normalized" numeric,
    "score_breakdown" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "topic_cluster" "text",
    "editorial_angle" "text",
    "summary" "text",
    "classifier_reasoning" "text",
    "embedding" "public"."vector"(1536),
    "embedding_model" "text" DEFAULT 'openai-text-embedding-3-small'::"text" NOT NULL,
    "matched_content_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "matched_archive_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "max_cosine_content" numeric,
    "max_cosine_archive" numeric,
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "actioned_as" "text",
    "actioned_at" timestamp with time zone,
    "slack_ts" "text",
    "slack_channel_id" "text",
    "promoted_content_id" "uuid",
    "scorer_version" "text" DEFAULT 'reddit-v1'::"text" NOT NULL,
    "prefilter_reason" "text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ii_reddit_signals_actioned_as_check" CHECK ((("actioned_as" IS NULL) OR ("actioned_as" = ANY (ARRAY['newsletter'::"text", 'linkedin'::"text", 'reply'::"text", 'discarded'::"text", 'promoted'::"text"])))),
    CONSTRAINT "ii_reddit_signals_editorial_angle_check" CHECK ((("editorial_angle" IS NULL) OR ("editorial_angle" = ANY (ARRAY['founder_story'::"text", 'funding_signal'::"text", 'ecosystem_trend'::"text", 'job_signal'::"text", 'diaspora_move'::"text", 'contrarian_take'::"text", 'none'::"text"])))),
    CONSTRAINT "ii_reddit_signals_editorial_angle_score_check" CHECK ((("editorial_angle_score" IS NULL) OR (("editorial_angle_score" >= (0)::numeric) AND ("editorial_angle_score" <= (10)::numeric)))),
    CONSTRAINT "ii_reddit_signals_engagement_score_check" CHECK ((("engagement_score" IS NULL) OR (("engagement_score" >= (0)::numeric) AND ("engagement_score" <= (10)::numeric)))),
    CONSTRAINT "ii_reddit_signals_irish_identity_score_check" CHECK ((("irish_identity_score" IS NULL) OR (("irish_identity_score" >= (0)::numeric) AND ("irish_identity_score" <= (10)::numeric)))),
    CONSTRAINT "ii_reddit_signals_max_cosine_archive_check" CHECK ((("max_cosine_archive" IS NULL) OR (("max_cosine_archive" >= (0)::numeric) AND ("max_cosine_archive" <= (1)::numeric)))),
    CONSTRAINT "ii_reddit_signals_max_cosine_content_check" CHECK ((("max_cosine_content" IS NULL) OR (("max_cosine_content" >= (0)::numeric) AND ("max_cosine_content" <= (1)::numeric)))),
    CONSTRAINT "ii_reddit_signals_originality_score_check" CHECK ((("originality_score" IS NULL) OR (("originality_score" >= (0)::numeric) AND ("originality_score" <= (10)::numeric)))),
    CONSTRAINT "ii_reddit_signals_post_kind_check" CHECK (("post_kind" = ANY (ARRAY['self'::"text", 'link'::"text"]))),
    CONSTRAINT "ii_reddit_signals_score_normalized_check" CHECK ((("score_normalized" IS NULL) OR (("score_normalized" >= (0)::numeric) AND ("score_normalized" <= (10)::numeric)))),
    CONSTRAINT "ii_reddit_signals_score_total_check" CHECK ((("score_total" IS NULL) OR (("score_total" >= (0)::numeric) AND ("score_total" <= (90)::numeric)))),
    CONSTRAINT "ii_reddit_signals_source_credibility_score_check" CHECK ((("source_credibility_score" IS NULL) OR (("source_credibility_score" >= (0)::numeric) AND ("source_credibility_score" <= (10)::numeric)))),
    CONSTRAINT "ii_reddit_signals_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'scored'::"text", 'surfaced'::"text", 'actioned'::"text"]))),
    CONSTRAINT "ii_reddit_signals_topic_fit_score_check" CHECK ((("topic_fit_score" IS NULL) OR (("topic_fit_score" >= (0)::numeric) AND ("topic_fit_score" <= (10)::numeric))))
);


ALTER TABLE "public"."ii_reddit_signals" OWNER TO "postgres";


COMMENT ON TABLE "public"."ii_reddit_signals" IS 'Scanned Reddit posts with weekly editorial scoring. Signals stay here until Stephen promotes them; ii-ingest reddit promote copies the OP into ii_content with source_type=reddit_post.';



COMMENT ON COLUMN "public"."ii_reddit_signals"."reddit_post_id" IS 'Reddit fullname (e.g. t3_abc123), globally unique. Matches the name field returned by Reddit JSON, not the id36-only form returned by some MCP wrappers.';



COMMENT ON COLUMN "public"."ii_reddit_signals"."subreddit" IS 'Subreddit name without the r/ prefix.';



COMMENT ON COLUMN "public"."ii_reddit_signals"."post_kind" IS 'self for text posts, link for posts that link out. Image and gallery normalized to link.';



COMMENT ON COLUMN "public"."ii_reddit_signals"."author_metadata" IS 'JSON: {total_karma, link_karma, comment_karma, account_age_days, is_suspended, is_employee, is_mod}. Best-effort, may be empty when fetch_user fails.';



COMMENT ON COLUMN "public"."ii_reddit_signals"."score_breakdown" IS 'JSON: per-axis {score, rationale}, irish_angle {classifier, heuristic, source, final}, plus engagement raw counts and decay factor.';



COMMENT ON COLUMN "public"."ii_reddit_signals"."editorial_angle" IS 'Discrete angle label assigned by the LLM. Drives the score band on the editorial_angle_score axis.';



COMMENT ON COLUMN "public"."ii_reddit_signals"."matched_content_ids" IS 'ii_content ids with cosine >= 0.6 against this summary embedding. Used to render "looks similar to" hints in Slack.';



COMMENT ON COLUMN "public"."ii_reddit_signals"."matched_archive_ids" IS 'ii_published_archive section ids with cosine >= 0.6 (newsletter sections only). Drives originality penalty when above 0.78.';



COMMENT ON COLUMN "public"."ii_reddit_signals"."status" IS 'Lifecycle: new -> scored -> surfaced -> actioned. scored covers below-floor terminal signals. actioned is set by Stephen via Slack reaction.';



COMMENT ON COLUMN "public"."ii_reddit_signals"."actioned_as" IS 'newsletter, linkedin, reply, discarded, or promoted. promoted also writes a row to ii_content.';



COMMENT ON COLUMN "public"."ii_reddit_signals"."promoted_content_id" IS 'When actioned_as=promoted, FK to the freshly created ii_content row. ON DELETE SET NULL so signal audit survives content deletion.';



COMMENT ON COLUMN "public"."ii_reddit_signals"."scorer_version" IS 'Bump when prompts/reddit-score.md or the weighted-sum constants change, to enable re-scoring sweeps.';



COMMENT ON COLUMN "public"."ii_reddit_signals"."prefilter_reason" IS 'Non-null when the cheap pre-filter dropped the post before LLM scoring. Values like low_engagement, too_old, body_too_short.';



CREATE TABLE IF NOT EXISTS "public"."industry_sectors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text" NOT NULL,
    "hero_title" "text" NOT NULL,
    "hero_description" "text" NOT NULL,
    "keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "service_keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "event_keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "lead_keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "content_keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "industries" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "featured" boolean DEFAULT false NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."industry_sectors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ingest_state" (
    "source" "text" NOT NULL,
    "last_run_id" "text",
    "last_run_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ingest_state" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."innovation_ecosystem" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "location" "text" NOT NULL,
    "founded" "text" NOT NULL,
    "employees" "text" NOT NULL,
    "services" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "website" "text",
    "contact" "text",
    "logo" "text",
    "basic_info" "text",
    "why_work_with_us" "text",
    "experience_tiles" "jsonb" DEFAULT '[]'::"jsonb",
    "contact_persons" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "location_id" "uuid",
    "slug" "text" NOT NULL,
    "domain" "text",
    "sectors" "text"[] DEFAULT '{}'::"text"[],
    "sector_tags" "text"[] DEFAULT '{}'::"text"[],
    "sector_agnostic" boolean DEFAULT false
);


ALTER TABLE "public"."innovation_ecosystem" OWNER TO "postgres";


COMMENT ON COLUMN "public"."innovation_ecosystem"."domain" IS 'Canonical organisation domain, e.g. "blackbird.vc". Used to derive logo.dev URL on read.';



COMMENT ON COLUMN "public"."innovation_ecosystem"."sectors" IS 'Industry sectors served (Fintech, Agritech, etc.). Distinct from services (what they do).';



CREATE TABLE IF NOT EXISTS "public"."innovation_ecosystem_enrichment_staging" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_id" "uuid" NOT NULL,
    "enrichment" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "reviewed_at" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "enrichment_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'applied'::"text"])))
);


ALTER TABLE "public"."innovation_ecosystem_enrichment_staging" OWNER TO "postgres";


COMMENT ON TABLE "public"."innovation_ecosystem_enrichment_staging" IS 'Staging area for AI-researched enrichment data before applying to innovation_ecosystem.';



CREATE TABLE IF NOT EXISTS "public"."intake_form_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "intake_form_id" "uuid",
    "event_type" "text" NOT NULL,
    "step" integer,
    "field_name" "text",
    "persona" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "intake_form_events_event_type_check" CHECK (("event_type" = ANY (ARRAY['persona_selected'::"text", 'step_entered'::"text", 'step_exited'::"text", 'field_focused'::"text", 'field_completed'::"text", 'field_skipped'::"text", 'website_prefill_shown'::"text", 'website_prefill_accepted'::"text", 'website_prefill_rejected'::"text", 'auth_modal_shown'::"text", 'auth_completed'::"text", 'generate_clicked'::"text", 'report_completed'::"text", 'abandoned'::"text"]))),
    CONSTRAINT "intake_form_events_persona_check" CHECK ((("persona" IS NULL) OR ("persona" = ANY (ARRAY['international'::"text", 'startup'::"text"]))))
);


ALTER TABLE "public"."intake_form_events" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."intake_funnel_v2" WITH ("security_invoker"='true') AS
 WITH "sessions" AS (
         SELECT "intake_form_events"."session_id",
            "intake_form_events"."persona",
            "min"("intake_form_events"."created_at") AS "started_at",
            "max"("intake_form_events"."created_at") AS "last_event_at",
            "bool_or"(("intake_form_events"."event_type" = 'persona_selected'::"text")) AS "reached_persona",
            "bool_or"((("intake_form_events"."event_type" = 'step_entered'::"text") AND ("intake_form_events"."step" = 1))) AS "reached_step1",
            "bool_or"((("intake_form_events"."event_type" = 'step_entered'::"text") AND ("intake_form_events"."step" = 2))) AS "reached_step2",
            "bool_or"((("intake_form_events"."event_type" = 'step_entered'::"text") AND ("intake_form_events"."step" = 3))) AS "reached_step3",
            "bool_or"(("intake_form_events"."event_type" = 'generate_clicked'::"text")) AS "clicked_generate",
            "bool_or"(("intake_form_events"."event_type" = 'auth_completed'::"text")) AS "authed",
            "bool_or"(("intake_form_events"."event_type" = 'report_completed'::"text")) AS "got_report",
            "bool_or"(("intake_form_events"."event_type" = 'website_prefill_accepted'::"text")) AS "prefill_accepted",
            EXTRACT(epoch FROM ("max"("intake_form_events"."created_at") - "min"("intake_form_events"."created_at"))) AS "session_duration_s"
           FROM "public"."intake_form_events"
          GROUP BY "intake_form_events"."session_id", "intake_form_events"."persona"
        )
 SELECT ("date_trunc"('day'::"text", "started_at"))::"date" AS "day",
    "persona",
    "count"(*) AS "sessions",
    "count"(*) FILTER (WHERE "reached_step1") AS "step1",
    "count"(*) FILTER (WHERE "reached_step2") AS "step2",
    "count"(*) FILTER (WHERE "reached_step3") AS "step3",
    "count"(*) FILTER (WHERE "clicked_generate") AS "clicked_generate",
    "count"(*) FILTER (WHERE "authed") AS "authed",
    "count"(*) FILTER (WHERE "got_report") AS "got_report",
    "count"(*) FILTER (WHERE "prefill_accepted") AS "prefill_accepted",
    ("round"("avg"("session_duration_s") FILTER (WHERE "got_report")))::integer AS "avg_seconds_to_report"
   FROM "sessions"
  GROUP BY (("date_trunc"('day'::"text", "started_at"))::"date"), "persona"
  ORDER BY (("date_trunc"('day'::"text", "started_at"))::"date") DESC, "persona";


ALTER VIEW "public"."intake_funnel_v2" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."investors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "investor_type" "text" NOT NULL,
    "location" "text" NOT NULL,
    "website" "text",
    "logo" "text",
    "sector_focus" "text"[],
    "stage_focus" "text"[],
    "check_size_min" integer,
    "check_size_max" integer,
    "contact_email" "text",
    "contact_name" "text",
    "linkedin_url" "text",
    "details" "jsonb",
    "basic_info" "text",
    "why_work_with_us" "text",
    "is_featured" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "slug" "text" NOT NULL,
    "currently_investing" boolean DEFAULT true,
    "leads_deals" boolean,
    "country" "text" DEFAULT 'Australia'::"text",
    "application_url" "text",
    "fund_size" "text",
    "year_fund_closed" "text",
    "portfolio_companies" "text"[],
    "meta_title" "text",
    "meta_description" "text",
    "sector_tags" "text"[] DEFAULT '{}'::"text"[],
    "sector_agnostic" boolean DEFAULT false
);


ALTER TABLE "public"."investors" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."investors_public" WITH ("security_invoker"='true') AS
 SELECT "id",
    "slug",
    "name",
    "description",
    "investor_type",
    "location",
    "website",
    "logo",
    "sector_focus",
    "stage_focus",
    "check_size_min",
    "check_size_max",
    "basic_info",
    "why_work_with_us",
    "is_featured",
    "created_at",
    "updated_at",
    "currently_investing",
    "leads_deals",
    "country",
    "application_url",
    "fund_size",
    "year_fund_closed",
    "portfolio_companies",
    "meta_title",
    "meta_description"
   FROM "public"."investors";


ALTER VIEW "public"."investors_public" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kb_sync_state" (
    "source" "text" NOT NULL,
    "last_synced_at" timestamp with time zone DEFAULT '1970-01-01 00:00:00+00'::timestamp with time zone NOT NULL,
    "last_run_at" timestamp with time zone,
    "last_rows_synced" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."kb_sync_state" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_embed_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_started" timestamp with time zone DEFAULT "now"() NOT NULL,
    "batch_size" integer,
    "embedded_count" integer DEFAULT 0 NOT NULL,
    "failed_count" integer DEFAULT 0 NOT NULL,
    "error" "text",
    "finished" timestamp with time zone
);


ALTER TABLE "public"."knowledge_embed_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_database_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lead_database_id" "uuid",
    "company_name" "text",
    "contact_name" "text",
    "job_title" "text",
    "company_description" "text",
    "sector" "text",
    "location" "text",
    "city" "text",
    "state" "text",
    "country" "text" DEFAULT 'Australia'::"text",
    "linkedin_url" "text",
    "website_url" "text",
    "email" "text",
    "phone" "text",
    "revenue_range" "text",
    "employee_count_range" "text",
    "founded_year" integer,
    "buying_signals" "text"[],
    "technologies_used" "text"[],
    "notes" "text",
    "is_preview" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lead_database_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_databases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "short_description" "text",
    "list_type" "text",
    "record_count" integer,
    "sector" "text",
    "location" "text",
    "quality_score" integer,
    "price_aud" numeric,
    "is_free" boolean DEFAULT false,
    "is_featured" boolean DEFAULT false,
    "preview_available" boolean DEFAULT false,
    "tags" "text"[],
    "provider_name" "text",
    "provider_logo_url" "text",
    "last_updated" "date",
    "sample_fields" "text"[],
    "cover_image_url" "text",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lead_databases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lead_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "sector" "text" NOT NULL,
    "target_market" "text" NOT NULL,
    "company_website" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'new'::"text",
    "notes" "text"
);


ALTER TABLE "public"."lead_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "type" "text" NOT NULL,
    "category" "text" NOT NULL,
    "industry" "text" NOT NULL,
    "location" "text" NOT NULL,
    "record_count" integer,
    "file_url" "text",
    "preview_url" "text",
    "price" numeric(10,2),
    "currency" "text" DEFAULT 'AUD'::"text",
    "data_quality_score" integer DEFAULT 85,
    "last_updated" "date" DEFAULT CURRENT_DATE,
    "contact_email" "text",
    "provider_name" "text",
    "tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sector_tags" "text"[] DEFAULT '{}'::"text"[],
    "sector_agnostic" boolean DEFAULT false
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."legacy_industry_mapping" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "legacy_value" "text" NOT NULL,
    "linkedin_industry_group" "text" NOT NULL,
    "linkedin_sector" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."legacy_industry_mapping" OWNER TO "postgres";


COMMENT ON TABLE "public"."legacy_industry_mapping" IS 'Maps pre-LinkedIn-taxonomy industry values to LinkedIn industry_group values. Used by the intake form trigger for backward compatibility and for the one-time data migration.';



CREATE TABLE IF NOT EXISTS "public"."lemlist_companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lemlist_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "domain" "text",
    "industry" "text",
    "size" "text",
    "location" "text",
    "linkedin_url" "text",
    "fields" "jsonb" DEFAULT '{}'::"jsonb",
    "owner_id" "text",
    "lemlist_created_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."lemlist_companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lemlist_contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lemlist_id" "text" NOT NULL,
    "company_id" "uuid",
    "full_name" "text",
    "first_name" "text",
    "last_name" "text",
    "email" "text",
    "job_title" "text",
    "phone" "text",
    "linkedin_url" "text",
    "industry" "text",
    "lifecycle_status" "text",
    "campaigns" "jsonb" DEFAULT '[]'::"jsonb",
    "fields" "jsonb" DEFAULT '{}'::"jsonb",
    "owner_id" "text",
    "lemlist_created_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "linkedin_url_sales_nav" "text",
    "company_name" "text",
    "company_website" "text",
    "location" "text",
    "contact_location" "text",
    "personal_email" "text",
    "twitter_profile" "text",
    "linkedin_headline" "text",
    "linkedin_description" "text",
    "linkedin_skills" "text",
    "linkedin_job_industry" "text",
    "linkedin_followers" integer,
    "linkedin_connection_degree" "text",
    "linkedin_profile_id" "text",
    "linkedin_open" boolean,
    "tagline" "text",
    "summary" "text",
    "status" "text",
    "lead_status" "text",
    "source" "text",
    "email_status" "text",
    "priority" "text",
    "client" "text",
    "hubspot_id" "text",
    "lead_notes" "text",
    "last_contacted_date" timestamp with time zone,
    "first_contacted_date" timestamp with time zone,
    "last_replied_date" timestamp with time zone
);


ALTER TABLE "public"."lemlist_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."linkedin_industries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sector" "text" NOT NULL,
    "industry_group" "text" NOT NULL,
    "sub_industry" "text",
    "display_name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "sector_slug" "text" NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."linkedin_industries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text" NOT NULL,
    "location_type" "text" NOT NULL,
    "parent_location" "text",
    "hero_title" "text" NOT NULL,
    "hero_description" "text" NOT NULL,
    "government_agency_name" "text",
    "government_agency_contact" "text",
    "government_agency_website" "text",
    "business_environment_score" integer,
    "startup_ecosystem_strength" "text",
    "key_industries" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "population" integer,
    "economic_indicators" "jsonb" DEFAULT '{}'::"jsonb",
    "keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "content_keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "service_keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "event_keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "lead_keywords" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "featured" boolean DEFAULT false NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "country" "text" DEFAULT 'Australia'::"text" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "parent_location_id" "uuid",
    CONSTRAINT "locations_business_environment_score_check" CHECK ((("business_environment_score" >= 0) AND ("business_environment_score" <= 100))),
    CONSTRAINT "locations_location_type_check" CHECK (("location_type" = ANY (ARRAY['state'::"text", 'city'::"text", 'region'::"text"]))),
    CONSTRAINT "locations_startup_ecosystem_strength_check" CHECK (("startup_ecosystem_strength" = ANY (ARRAY['Strong'::"text", 'Growing'::"text", 'Emerging'::"text"])))
);


ALTER TABLE "public"."locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mentor_contact_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mentor_id" "uuid" NOT NULL,
    "requester_name" "text" NOT NULL,
    "requester_email" "text" NOT NULL,
    "requester_company" "text",
    "requester_country" "text",
    "message" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "admin_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "mentor_contact_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'contacted'::"text", 'declined'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."mentor_contact_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mes_knowledge_base" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_table" "text" NOT NULL,
    "source_id" "uuid" NOT NULL,
    "chunk_index" integer DEFAULT 0 NOT NULL,
    "entity_type" "text" NOT NULL,
    "title" "text",
    "content" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "content_hash" "text" NOT NULL,
    "embedding" "public"."vector"(1536),
    "embedded_hash" "text",
    "embedding_model" "text" DEFAULT 'text-embedding-3-small'::"text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "source_project" "text" DEFAULT 'mes_platform'::"text" NOT NULL
);


ALTER TABLE "public"."mes_knowledge_base" OWNER TO "postgres";


COMMENT ON TABLE "public"."mes_knowledge_base" IS 'Unified RAG search layer over MES customer-facing entities. Derived/rebuildable; source tables are the system of record. Read only via match_knowledge() RPC; written by upsert_kb_* triggers + embed-knowledge edge fn. MES project only.';



COMMENT ON COLUMN "public"."mes_knowledge_base"."content" IS 'Embeddable text, PII-stripped (no emails/phones/personal contact fields).';



COMMENT ON COLUMN "public"."mes_knowledge_base"."metadata" IS 'Stable agent-filterable keys ONLY: sector (jsonb array), country (text|null), visibility (public|member|paid), is_active (bool), source_url (text), plan_tier (free|growth|scale|enterprise|null).';



COMMENT ON COLUMN "public"."mes_knowledge_base"."embedded_hash" IS 'content_hash at time of embedding. Row is stale (needs re-embed) when embedded_hash is distinct from content_hash.';



CREATE TABLE IF NOT EXISTS "public"."partner_domain_lookup" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "name_normalized" "text" GENERATED ALWAYS AS ("lower"(TRIM(BOTH FROM "name"))) STORED,
    "domain" "text",
    "source" "text" DEFAULT 'claude_research'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."partner_domain_lookup" OWNER TO "postgres";


COMMENT ON TABLE "public"."partner_domain_lookup" IS 'Cache of partner-name to canonical-domain resolutions, populated by Claude research.';



CREATE TABLE IF NOT EXISTS "public"."payment_webhook_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "stripe_event_id" "text" NOT NULL,
    "stripe_payload" "jsonb" NOT NULL,
    "parsed" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payment_webhook_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "username" "text",
    "avatar_url" "text",
    "bio" "text",
    "website" "text",
    "location" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "stripe_customer_id" "text",
    "is_email_subscribed" boolean DEFAULT true
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."stripe_customer_id" IS 'Stripe customer ID linking this user to their Stripe account';



CREATE TABLE IF NOT EXISTS "public"."report_quality" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "report_id" "uuid" NOT NULL,
    "intake_form_id" "uuid",
    "user_id" "uuid",
    "report_status" "text",
    "build_health" integer,
    "score_plumbing" integer,
    "score_coverage" integer,
    "score_completeness" integer,
    "degraded" boolean DEFAULT false NOT NULL,
    "rag_hit_rate" numeric,
    "tables_hit" integer,
    "total_matches" integer,
    "match_counts" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "sources" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "generation_time_ms" integer,
    "groundedness" numeric,
    "prompt_version" "text",
    "cost" "jsonb",
    "insights" "jsonb",
    "user_feedback" integer,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "report_score" integer,
    "utilization_rate" numeric,
    "utilization" "jsonb",
    "score_presentation" integer,
    "presentation" "jsonb",
    "score_substance" integer,
    "substance" "jsonb"
);


ALTER TABLE "public"."report_quality" OWNER TO "postgres";


COMMENT ON TABLE "public"."report_quality" IS 'Per-report build-health / RAG-coverage telemetry (system of record for #report-quality + trend analysis). Writes are service-role only.';



CREATE TABLE IF NOT EXISTS "public"."report_quality_proposals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid",
    "report_id" "uuid" NOT NULL,
    "tier_at_generation" "text",
    "category" "text" NOT NULL,
    "title" "text" NOT NULL,
    "evidence" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "recommended_change" "text" NOT NULL,
    "impact_estimate" "text" DEFAULT 'medium'::"text" NOT NULL,
    "confidence" numeric DEFAULT 0.5 NOT NULL,
    "risk" "text" DEFAULT 'low'::"text" NOT NULL,
    "axis_scores" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "rank_score" numeric DEFAULT 0 NOT NULL,
    "rubric_version" "text",
    "dedup_theme" "text",
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "fix_ref" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "report_quality_proposals_category_check" CHECK (("category" = ANY (ARRAY['matching/relevance'::"text", 'content/prompt-bulk'::"text", 'data-coverage-gap'::"text", 'input-not-actioned'::"text", 'accuracy/hallucination'::"text"]))),
    CONSTRAINT "report_quality_proposals_impact_estimate_check" CHECK (("impact_estimate" = ANY (ARRAY['high'::"text", 'medium'::"text", 'low'::"text"]))),
    CONSTRAINT "report_quality_proposals_risk_check" CHECK (("risk" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "report_quality_proposals_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'accepted'::"text", 'rejected'::"text", 'shipped'::"text"])))
);


ALTER TABLE "public"."report_quality_proposals" OWNER TO "postgres";


COMMENT ON TABLE "public"."report_quality_proposals" IS 'Propose-only review queue from the report-quality loop. Admin read + update (accept/reject); inserts are service-role only. No user PII.';



CREATE TABLE IF NOT EXISTS "public"."report_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section_name" "text" NOT NULL,
    "prompt_body" "text" NOT NULL,
    "variables" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "visibility_tier" "text" DEFAULT 'free'::"text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."report_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sector_vocabulary" (
    "raw_value" "text" NOT NULL,
    "sector_slugs" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "is_agnostic" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sector_vocabulary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_provider_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."service_provider_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_provider_contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service_provider_id" "uuid",
    "full_name" "text" NOT NULL,
    "role" "text",
    "email" "text",
    "phone" "text",
    "linkedin_url" "text",
    "avatar_url" "text",
    "is_primary" boolean DEFAULT false,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."service_provider_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_provider_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service_provider_id" "uuid",
    "rating" integer,
    "title" "text",
    "review_text" "text",
    "reviewer_name" "text",
    "reviewer_company" "text",
    "reviewer_country" "text",
    "is_verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "service_provider_reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."service_provider_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_providers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "location" "text" NOT NULL,
    "founded" "text" NOT NULL,
    "employees" "text" NOT NULL,
    "services" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "website" "text",
    "contact" "text",
    "logo" "text",
    "basic_info" "text",
    "why_work_with_us" "text",
    "experience_tiles" "jsonb" DEFAULT '[]'::"jsonb",
    "contact_persons" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "location_id" "uuid",
    "slug" "text" NOT NULL,
    "sector_tags" "text"[] DEFAULT '{}'::"text"[],
    "sector_agnostic" boolean DEFAULT false
);


ALTER TABLE "public"."service_providers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."testimonials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "title" "text" NOT NULL,
    "company" "text" NOT NULL,
    "country_flag" "text" NOT NULL,
    "country_name" "text" NOT NULL,
    "testimonial" "text" NOT NULL,
    "outcome" "text" NOT NULL,
    "avatar" "text",
    "is_featured" boolean DEFAULT false,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."testimonials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trade_agencies_enrichment_staging" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_id" "uuid",
    "source_name" "text" NOT NULL,
    "enrichment" "jsonb" NOT NULL,
    "research_notes" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "reviewed_at" timestamp with time zone,
    "applied_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "trade_agencies_enrichment_staging_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'applied'::"text", 'invalid'::"text"])))
);


ALTER TABLE "public"."trade_agencies_enrichment_staging" OWNER TO "postgres";


COMMENT ON TABLE "public"."trade_agencies_enrichment_staging" IS 'Staging table for Phase 3 research enrichment of trade_investment_agencies. One row per source agency. Reviewed manually before applying via Phase 3.6.';



COMMENT ON COLUMN "public"."trade_agencies_enrichment_staging"."enrichment" IS 'Structured JSON returned by the per-agency research sub-agent. Validated against the Phase 3.3 schema before insertion.';



COMMENT ON COLUMN "public"."trade_agencies_enrichment_staging"."status" IS 'pending = awaiting review, approved = approved by reviewer, rejected = will not apply, applied = written to trade_investment_agencies, invalid = JSON failed validation.';



CREATE TABLE IF NOT EXISTS "public"."user_intake_forms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "company_name" "text" NOT NULL,
    "website_url" "text" NOT NULL,
    "country_of_origin" "text" NOT NULL,
    "industry_sector" "text"[] NOT NULL,
    "company_stage" "text" NOT NULL,
    "employee_count" "text" NOT NULL,
    "target_regions" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "services_needed" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "timeline" "text" NOT NULL,
    "budget_level" "text" NOT NULL,
    "primary_goals" "text",
    "key_challenges" "text",
    "raw_input" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "enriched_input" "jsonb",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "known_competitors" "jsonb" DEFAULT '[]'::"jsonb",
    "end_buyer_industries" "text"[] DEFAULT '{}'::"text"[],
    "end_buyers" "jsonb" DEFAULT '[]'::"jsonb",
    "customer_type" "text",
    "customer_size" "text",
    "buying_motion" "text",
    "challenge_tags" "text"[] DEFAULT '{}'::"text"[],
    "challenge_other" "text",
    "goal_ids" "text"[] DEFAULT '{}'::"text"[],
    "report_focus" "text",
    "website_scrape_accepted" boolean DEFAULT false,
    "revenue_stage" "text",
    CONSTRAINT "intake_buying_motion_chk" CHECK ((("buying_motion" IS NULL) OR ("buying_motion" = ANY (ARRAY['Direct sales'::"text", 'Channel / partners'::"text", 'Self-serve / marketplace'::"text", 'Mixed'::"text"])))),
    CONSTRAINT "intake_challenge_other_len" CHECK ((("challenge_other" IS NULL) OR ("length"("challenge_other") <= 200))),
    CONSTRAINT "intake_customer_size_chk" CHECK ((("customer_size" IS NULL) OR ("customer_size" = ANY (ARRAY['SMB (<50)'::"text", 'Mid-market (50-500)'::"text", 'Enterprise (500+)'::"text", 'Mixed'::"text"])))),
    CONSTRAINT "intake_customer_type_chk" CHECK ((("customer_type" IS NULL) OR ("customer_type" = ANY (ARRAY['B2B'::"text", 'B2C'::"text", 'B2G'::"text", 'Mixed'::"text"])))),
    CONSTRAINT "intake_report_focus_len" CHECK ((("report_focus" IS NULL) OR ("length"("report_focus") <= 200)))
);


ALTER TABLE "public"."user_intake_forms" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_intake_forms"."known_competitors" IS 'Array of competitor objects: [{ "name": "...", "website": "https://..." }]';



CREATE TABLE IF NOT EXISTS "public"."user_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "intake_form_id" "uuid",
    "tier_at_generation" "text" DEFAULT 'free'::"text" NOT NULL,
    "report_json" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "sections_generated" "text"[] DEFAULT '{}'::"text"[],
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "feedback_score" integer,
    "feedback_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "share_token" "uuid",
    "generation_time_ms" integer,
    "total_matches" integer,
    "firecrawl_ops" integer,
    "firecrawl_scrape_ok" boolean,
    "perplexity_ok" boolean,
    "polish_applied" boolean
);


ALTER TABLE "public"."user_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" DEFAULT 'user'::"public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "tier" "public"."subscription_tier" DEFAULT 'free'::"public"."subscription_tier",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_usage" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "text" NOT NULL,
    "content_type" "text" NOT NULL,
    "item_id" "text" NOT NULL,
    "viewed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_usage" OWNER TO "postgres";


ALTER TABLE ONLY "private"."_staging_experience_companies"
    ADD CONSTRAINT "_staging_experience_companies_pkey" PRIMARY KEY ("name");



ALTER TABLE ONLY "public"."activity_event_routing"
    ADD CONSTRAINT "activity_event_routing_pkey" PRIMARY KEY ("event_type");



ALTER TABLE ONLY "public"."activity_events"
    ADD CONSTRAINT "activity_events_dedup_key_key" UNIQUE ("dedup_key");



ALTER TABLE ONLY "public"."activity_events"
    ADD CONSTRAINT "activity_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agency_contacts"
    ADD CONSTRAINT "agency_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agency_resources"
    ADD CONSTRAINT "agency_resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_chat_conversations"
    ADD CONSTRAINT "ai_chat_conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_chat_messages"
    ADD CONSTRAINT "ai_chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_runs"
    ADD CONSTRAINT "automation_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."case_study_quotes"
    ADD CONSTRAINT "case_study_quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."case_study_quotes"
    ADD CONSTRAINT "case_study_quotes_unique_position" UNIQUE ("case_study_id", "attributed_to", "display_order");



ALTER TABLE ONLY "public"."case_study_sources"
    ADD CONSTRAINT "case_study_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."case_study_sources"
    ADD CONSTRAINT "case_study_sources_unique_url" UNIQUE ("case_study_id", "url");



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_slug_unique" UNIQUE ("slug");



ALTER TABLE ONLY "public"."content_bodies"
    ADD CONSTRAINT "content_bodies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_categories"
    ADD CONSTRAINT "content_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_company_profiles"
    ADD CONSTRAINT "content_company_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_founders"
    ADD CONSTRAINT "content_founders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_items"
    ADD CONSTRAINT "content_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_items"
    ADD CONSTRAINT "content_items_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."content_sections"
    ADD CONSTRAINT "content_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."country_case_studies"
    ADD CONSTRAINT "country_case_studies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."country_faqs"
    ADD CONSTRAINT "country_faqs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."country_funding_instruments"
    ADD CONSTRAINT "country_funding_instruments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."country_page_content"
    ADD CONSTRAINT "country_page_content_pkey" PRIMARY KEY ("country_id");



ALTER TABLE ONLY "public"."country_playbook_stages"
    ADD CONSTRAINT "country_playbook_stages_country_id_stage_number_key" UNIQUE ("country_id", "stage_number");



ALTER TABLE ONLY "public"."country_playbook_stages"
    ADD CONSTRAINT "country_playbook_stages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."country_trade_metrics"
    ADD CONSTRAINT "country_trade_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."directory_submissions"
    ADD CONSTRAINT "directory_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ecosystem_import_candidates"
    ADD CONSTRAINT "ecosystem_import_candidates_batch_id_dedupe_key_key" UNIQUE ("batch_id", "dedupe_key");



ALTER TABLE ONLY "public"."ecosystem_import_candidates"
    ADD CONSTRAINT "ecosystem_import_candidates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."edge_function_rate_limits"
    ADD CONSTRAINT "edge_function_rate_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_leads"
    ADD CONSTRAINT "email_leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_log"
    ADD CONSTRAINT "email_log_idempotency_key_key" UNIQUE ("idempotency_key");



ALTER TABLE ONLY "public"."email_log"
    ADD CONSTRAINT "email_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_sequence_steps"
    ADD CONSTRAINT "email_sequence_steps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_sequence_steps"
    ADD CONSTRAINT "email_sequence_steps_sequence_name_step_number_key" UNIQUE ("sequence_name", "step_number");



ALTER TABLE ONLY "public"."email_sequences"
    ADD CONSTRAINT "email_sequences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_sequences"
    ADD CONSTRAINT "email_sequences_user_id_sequence_name_key" UNIQUE ("user_id", "sequence_name");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events_staging"
    ADD CONSTRAINT "events_staging_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events_staging"
    ADD CONSTRAINT "events_staging_source_url_key" UNIQUE ("source_url");



ALTER TABLE ONLY "public"."firecrawl_scrape_cache"
    ADD CONSTRAINT "firecrawl_scrape_cache_pkey" PRIMARY KEY ("url_key");



ALTER TABLE ONLY "public"."guide_attachments"
    ADD CONSTRAINT "guide_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ii_content"
    ADD CONSTRAINT "ii_content_source_uniq" UNIQUE ("source_type", "source_id");



ALTER TABLE ONLY "public"."ii_curated_log"
    ADD CONSTRAINT "ii_curated_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ii_curations"
    ADD CONSTRAINT "ii_curations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ii_content"
    ADD CONSTRAINT "ii_emails_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ii_experiment_outputs"
    ADD CONSTRAINT "ii_experiment_outputs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ii_intro_archive"
    ADD CONSTRAINT "ii_intro_archive_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ii_personal_linkedin_posts"
    ADD CONSTRAINT "ii_personal_linkedin_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ii_prefilter_log"
    ADD CONSTRAINT "ii_prefilter_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ii_published_archive"
    ADD CONSTRAINT "ii_published_archive_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ii_reddit_signals"
    ADD CONSTRAINT "ii_reddit_signals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."industry_sectors"
    ADD CONSTRAINT "industry_sectors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."industry_sectors"
    ADD CONSTRAINT "industry_sectors_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."ingest_state"
    ADD CONSTRAINT "ingest_state_pkey" PRIMARY KEY ("source");



ALTER TABLE ONLY "public"."innovation_ecosystem_enrichment_staging"
    ADD CONSTRAINT "innovation_ecosystem_enrichment_staging_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."innovation_ecosystem"
    ADD CONSTRAINT "innovation_ecosystem_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."innovation_ecosystem"
    ADD CONSTRAINT "innovation_ecosystem_slug_unique" UNIQUE ("slug");



ALTER TABLE ONLY "public"."intake_form_events"
    ADD CONSTRAINT "intake_form_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."investors"
    ADD CONSTRAINT "investors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."investors"
    ADD CONSTRAINT "investors_slug_unique" UNIQUE ("slug");



ALTER TABLE ONLY "public"."kb_sync_state"
    ADD CONSTRAINT "kb_sync_state_pkey" PRIMARY KEY ("source");



ALTER TABLE ONLY "public"."knowledge_embed_log"
    ADD CONSTRAINT "knowledge_embed_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_database_records"
    ADD CONSTRAINT "lead_database_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_databases"
    ADD CONSTRAINT "lead_databases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lead_databases"
    ADD CONSTRAINT "lead_databases_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."lead_submissions"
    ADD CONSTRAINT "lead_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."legacy_industry_mapping"
    ADD CONSTRAINT "legacy_industry_mapping_legacy_value_key" UNIQUE ("legacy_value");



ALTER TABLE ONLY "public"."legacy_industry_mapping"
    ADD CONSTRAINT "legacy_industry_mapping_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lemlist_companies"
    ADD CONSTRAINT "lemlist_companies_lemlist_id_key" UNIQUE ("lemlist_id");



ALTER TABLE ONLY "public"."lemlist_companies"
    ADD CONSTRAINT "lemlist_companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lemlist_contacts"
    ADD CONSTRAINT "lemlist_contacts_lemlist_id_key" UNIQUE ("lemlist_id");



ALTER TABLE ONLY "public"."lemlist_contacts"
    ADD CONSTRAINT "lemlist_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."linkedin_industries"
    ADD CONSTRAINT "linkedin_industries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."linkedin_industries"
    ADD CONSTRAINT "linkedin_industries_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."_archived_market_entry_reports"
    ADD CONSTRAINT "market_entry_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mentor_contact_requests"
    ADD CONSTRAINT "mentor_contact_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mes_knowledge_base"
    ADD CONSTRAINT "mes_knowledge_base_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mes_knowledge_base"
    ADD CONSTRAINT "mes_knowledge_base_source_table_source_id_chunk_index_key" UNIQUE ("source_table", "source_id", "chunk_index");



ALTER TABLE ONLY "public"."organisation_categories"
    ADD CONSTRAINT "organisation_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organisation_categories"
    ADD CONSTRAINT "organisation_categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."partner_domain_lookup"
    ADD CONSTRAINT "partner_domain_lookup_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_webhook_logs"
    ADD CONSTRAINT "payment_webhook_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_webhook_logs"
    ADD CONSTRAINT "payment_webhook_logs_stripe_event_id_key" UNIQUE ("stripe_event_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."report_quality"
    ADD CONSTRAINT "report_quality_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_quality_proposals"
    ADD CONSTRAINT "report_quality_proposals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_quality"
    ADD CONSTRAINT "report_quality_report_id_key" UNIQUE ("report_id");



ALTER TABLE ONLY "public"."report_templates"
    ADD CONSTRAINT "report_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sector_vocabulary"
    ADD CONSTRAINT "sector_vocabulary_pkey" PRIMARY KEY ("raw_value");



ALTER TABLE ONLY "public"."service_provider_categories"
    ADD CONSTRAINT "service_provider_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_provider_categories"
    ADD CONSTRAINT "service_provider_categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."service_provider_contacts"
    ADD CONSTRAINT "service_provider_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_provider_reviews"
    ADD CONSTRAINT "service_provider_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_providers"
    ADD CONSTRAINT "service_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_providers"
    ADD CONSTRAINT "service_providers_slug_unique" UNIQUE ("slug");



ALTER TABLE ONLY "public"."testimonials"
    ADD CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trade_agencies_enrichment_staging"
    ADD CONSTRAINT "trade_agencies_enrichment_staging_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trade_agencies_enrichment_staging"
    ADD CONSTRAINT "trade_agencies_enrichment_staging_source_id_unique" UNIQUE ("source_id");



ALTER TABLE ONLY "public"."trade_investment_agencies"
    ADD CONSTRAINT "trade_investment_agencies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trade_investment_agencies"
    ADD CONSTRAINT "trade_investment_agencies_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "unique_user_content_bookmark" UNIQUE ("user_id", "content_type", "content_id");



ALTER TABLE ONLY "public"."user_intake_forms"
    ADD CONSTRAINT "user_intake_forms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_reports"
    ADD CONSTRAINT "user_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_user_id_unique" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_usage"
    ADD CONSTRAINT "user_usage_pkey" PRIMARY KEY ("id");



CREATE INDEX "activity_events_created_at_idx" ON "public"."activity_events" USING "btree" ("created_at");



CREATE INDEX "activity_events_event_type_idx" ON "public"."activity_events" USING "btree" ("event_type");



CREATE INDEX "activity_events_unnotified_idx" ON "public"."activity_events" USING "btree" ("notified_at") WHERE ("notified_at" IS NULL);



CREATE INDEX "ai_chat_conversations_session_id_idx" ON "public"."ai_chat_conversations" USING "btree" ("session_id") WHERE ("session_id" IS NOT NULL);



CREATE INDEX "automation_runs_loop_started_idx" ON "public"."automation_runs" USING "btree" ("loop", "started_at" DESC);



CREATE INDEX "case_study_quotes_case_study_idx" ON "public"."case_study_quotes" USING "btree" ("case_study_id");



CREATE INDEX "case_study_quotes_section_idx" ON "public"."case_study_quotes" USING "btree" ("section_id");



CREATE INDEX "case_study_sources_case_study_idx" ON "public"."case_study_sources" USING "btree" ("case_study_id");



CREATE INDEX "case_study_sources_section_idx" ON "public"."case_study_sources" USING "btree" ("section_id");



CREATE INDEX "eic_batch_idx" ON "public"."ecosystem_import_candidates" USING "btree" ("batch_id");



CREATE INDEX "eic_status_entity_idx" ON "public"."ecosystem_import_candidates" USING "btree" ("status", "entity_type");



CREATE UNIQUE INDEX "events_source_url_uniq" ON "public"."events" USING "btree" ("source_url") WHERE ("source_url" IS NOT NULL);



CREATE INDEX "firecrawl_scrape_cache_fetched_at_idx" ON "public"."firecrawl_scrape_cache" USING "btree" ("fetched_at");



CREATE INDEX "idx_agencies_active" ON "public"."trade_investment_agencies" USING "btree" ("is_active");



CREATE INDEX "idx_agencies_category" ON "public"."trade_investment_agencies" USING "btree" ("category_slug");



CREATE INDEX "idx_agencies_featured" ON "public"."trade_investment_agencies" USING "btree" ("is_featured");



CREATE INDEX "idx_agencies_grants" ON "public"."trade_investment_agencies" USING "btree" ("grants_available");



CREATE INDEX "idx_agencies_jurisdiction" ON "public"."trade_investment_agencies" USING "gin" ("jurisdiction");



CREATE INDEX "idx_agencies_org_type" ON "public"."trade_investment_agencies" USING "btree" ("organisation_type");



CREATE INDEX "idx_agencies_origin" ON "public"."trade_investment_agencies" USING "gin" ("target_company_origin");



CREATE INDEX "idx_agencies_sectors" ON "public"."trade_investment_agencies" USING "gin" ("sectors_supported");



CREATE INDEX "idx_agencies_slug" ON "public"."trade_investment_agencies" USING "btree" ("slug");



CREATE INDEX "idx_agencies_support" ON "public"."trade_investment_agencies" USING "gin" ("support_types");



CREATE INDEX "idx_agencies_verified" ON "public"."trade_investment_agencies" USING "btree" ("is_verified");



CREATE INDEX "idx_agency_contacts_agency_id" ON "public"."agency_contacts" USING "btree" ("agency_id");



CREATE INDEX "idx_agency_contacts_agency_primary" ON "public"."agency_contacts" USING "btree" ("agency_id", "is_primary") WHERE ("is_primary" = true);



CREATE INDEX "idx_agency_resources_agency" ON "public"."agency_resources" USING "btree" ("agency_id");



CREATE INDEX "idx_ai_chat_conversations_user_id" ON "public"."ai_chat_conversations" USING "btree" ("user_id");



CREATE INDEX "idx_ai_chat_messages_conversation_id" ON "public"."ai_chat_messages" USING "btree" ("conversation_id");



CREATE INDEX "idx_bookmarks_user_content" ON "public"."bookmarks" USING "btree" ("user_id", "content_type");



CREATE INDEX "idx_ci_sector_gin" ON "public"."content_items" USING "gin" ("sector_tags");



CREATE INDEX "idx_cm_sector_gin" ON "public"."community_members" USING "gin" ("sector_tags");



CREATE INDEX "idx_community_members_active_featured" ON "public"."community_members" USING "btree" ("is_active", "is_featured") WHERE ("is_active" = true);



CREATE INDEX "idx_community_members_archetype" ON "public"."community_members" USING "btree" ("archetype");



CREATE INDEX "idx_community_members_location_id" ON "public"."community_members" USING "btree" ("location_id");



CREATE INDEX "idx_community_members_persona_fit" ON "public"."community_members" USING "gin" ("persona_fit");



CREATE INDEX "idx_content_bodies_content" ON "public"."content_bodies" USING "btree" ("content_id");



CREATE INDEX "idx_content_bodies_section" ON "public"."content_bodies" USING "btree" ("section_id");



CREATE INDEX "idx_content_company_profiles_content" ON "public"."content_company_profiles" USING "btree" ("content_id");



CREATE INDEX "idx_content_founders_content" ON "public"."content_founders" USING "btree" ("content_id");



CREATE INDEX "idx_content_items_category" ON "public"."content_items" USING "btree" ("category_id");



CREATE INDEX "idx_content_items_featured" ON "public"."content_items" USING "btree" ("featured");



CREATE INDEX "idx_content_items_sector_tags" ON "public"."content_items" USING "gin" ("sector_tags");



CREATE INDEX "idx_content_items_slug" ON "public"."content_items" USING "btree" ("slug");



CREATE INDEX "idx_content_items_status" ON "public"."content_items" USING "btree" ("status");



CREATE INDEX "idx_content_sections_content" ON "public"."content_sections" USING "btree" ("content_id");



CREATE INDEX "idx_country_case_studies_content_item_id" ON "public"."country_case_studies" USING "btree" ("content_item_id");



CREATE INDEX "idx_country_case_studies_country" ON "public"."country_case_studies" USING "btree" ("country_id", "sort_order");



CREATE INDEX "idx_country_faqs_country" ON "public"."country_faqs" USING "btree" ("country_id", "sort_order");



CREATE INDEX "idx_country_funding_country_side" ON "public"."country_funding_instruments" USING "btree" ("country_id", "side", "sort_order");



CREATE INDEX "idx_country_playbook_country" ON "public"."country_playbook_stages" USING "btree" ("country_id", "stage_number");



CREATE INDEX "idx_country_trade_metrics_country" ON "public"."country_trade_metrics" USING "btree" ("country_id", "sort_order");



CREATE INDEX "idx_email_log_created_at" ON "public"."email_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_email_log_email_type" ON "public"."email_log" USING "btree" ("email_type");



CREATE INDEX "idx_email_log_idempotency_key" ON "public"."email_log" USING "btree" ("idempotency_key");



CREATE INDEX "idx_email_log_user_id" ON "public"."email_log" USING "btree" ("user_id");



CREATE INDEX "idx_email_sequences_next_send" ON "public"."email_sequences" USING "btree" ("next_send_at") WHERE (("completed_at" IS NULL) AND ("paused" = false));



CREATE INDEX "idx_email_sequences_user_id" ON "public"."email_sequences" USING "btree" ("user_id");



CREATE INDEX "idx_ev_sector_gin" ON "public"."events" USING "gin" ("sector_tags");



CREATE INDEX "idx_events_date" ON "public"."events" USING "btree" ("date");



CREATE INDEX "idx_events_is_featured" ON "public"."events" USING "btree" ("is_featured") WHERE ("is_featured" = true);



CREATE INDEX "idx_events_location_id" ON "public"."events" USING "btree" ("location_id");



CREATE UNIQUE INDEX "idx_events_slug" ON "public"."events" USING "btree" ("slug");



CREATE INDEX "idx_events_source" ON "public"."events" USING "btree" ("source");



CREATE INDEX "idx_events_status_event_date" ON "public"."events" USING "btree" ("status", "event_date");



CREATE INDEX "idx_guide_attachments_content_item" ON "public"."guide_attachments" USING "btree" ("content_item_id");



CREATE INDEX "idx_ie_sector_gin" ON "public"."innovation_ecosystem" USING "gin" ("sector_tags");



CREATE INDEX "idx_ii_experiment_outputs_content_id" ON "public"."ii_experiment_outputs" USING "btree" ("content_id");



CREATE INDEX "idx_ii_li_posts_author" ON "public"."ii_personal_linkedin_posts" USING "btree" ("author_account");



CREATE INDEX "idx_ii_li_posts_embedding" ON "public"."ii_personal_linkedin_posts" USING "ivfflat" ("embedding" "public"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "idx_ii_li_posts_ii" ON "public"."ii_personal_linkedin_posts" USING "btree" ("author_account", "posted_at" DESC) WHERE ("is_ii_content" IS TRUE);



CREATE INDEX "idx_ii_li_posts_posted_at" ON "public"."ii_personal_linkedin_posts" USING "btree" ("posted_at" DESC);



CREATE INDEX "idx_innovation_ecosystem_domain" ON "public"."innovation_ecosystem" USING "btree" ("domain") WHERE ("domain" IS NOT NULL);



CREATE INDEX "idx_innovation_ecosystem_enrichment_source" ON "public"."innovation_ecosystem_enrichment_staging" USING "btree" ("source_id");



CREATE INDEX "idx_innovation_ecosystem_enrichment_status" ON "public"."innovation_ecosystem_enrichment_staging" USING "btree" ("status");



CREATE INDEX "idx_innovation_ecosystem_location_id" ON "public"."innovation_ecosystem" USING "btree" ("location_id");



CREATE INDEX "idx_intake_challenge_tags_gin" ON "public"."user_intake_forms" USING "gin" ("challenge_tags");



CREATE INDEX "idx_intake_customer_type" ON "public"."user_intake_forms" USING "btree" ("customer_type") WHERE ("customer_type" IS NOT NULL);



CREATE INDEX "idx_intake_events_form" ON "public"."intake_form_events" USING "btree" ("intake_form_id");



CREATE INDEX "idx_intake_events_session" ON "public"."intake_form_events" USING "btree" ("session_id", "created_at");



CREATE INDEX "idx_intake_events_type" ON "public"."intake_form_events" USING "btree" ("event_type", "created_at" DESC);



CREATE INDEX "idx_intake_form_events_user_id" ON "public"."intake_form_events" USING "btree" ("user_id");



CREATE INDEX "idx_intake_goal_ids_gin" ON "public"."user_intake_forms" USING "gin" ("goal_ids");



CREATE INDEX "idx_inv_sector_gin" ON "public"."investors" USING "gin" ("sector_tags");



CREATE INDEX "idx_investors_country" ON "public"."investors" USING "btree" ("country");



CREATE INDEX "idx_investors_currently_investing" ON "public"."investors" USING "btree" ("currently_investing");



CREATE INDEX "idx_investors_portfolio" ON "public"."investors" USING "gin" ("portfolio_companies");



CREATE INDEX "idx_investors_sector" ON "public"."investors" USING "gin" ("sector_focus");



CREATE INDEX "idx_investors_stage" ON "public"."investors" USING "gin" ("stage_focus");



CREATE INDEX "idx_investors_type" ON "public"."investors" USING "btree" ("investor_type");



CREATE INDEX "idx_ld_sector_gin" ON "public"."leads" USING "gin" ("sector_tags");



CREATE INDEX "idx_lead_database_records_db_id" ON "public"."lead_database_records" USING "btree" ("lead_database_id");



CREATE INDEX "idx_lead_database_records_preview" ON "public"."lead_database_records" USING "btree" ("is_preview");



CREATE INDEX "idx_lead_databases_list_type" ON "public"."lead_databases" USING "btree" ("list_type");



CREATE INDEX "idx_lead_databases_location" ON "public"."lead_databases" USING "btree" ("location");



CREATE INDEX "idx_lead_databases_sector" ON "public"."lead_databases" USING "btree" ("sector");



CREATE INDEX "idx_lead_databases_slug" ON "public"."lead_databases" USING "btree" ("slug");



CREATE INDEX "idx_lead_databases_status" ON "public"."lead_databases" USING "btree" ("status");



CREATE INDEX "idx_lead_databases_tags" ON "public"."lead_databases" USING "gin" ("tags");



CREATE INDEX "idx_lead_submissions_created_at" ON "public"."lead_submissions" USING "btree" ("created_at");



CREATE INDEX "idx_lead_submissions_email" ON "public"."lead_submissions" USING "btree" ("email");



CREATE INDEX "idx_lead_submissions_status" ON "public"."lead_submissions" USING "btree" ("status");



CREATE INDEX "idx_lemlist_companies_domain" ON "public"."lemlist_companies" USING "btree" ("domain");



CREATE INDEX "idx_lemlist_companies_industry" ON "public"."lemlist_companies" USING "btree" ("industry");



CREATE INDEX "idx_lemlist_companies_location" ON "public"."lemlist_companies" USING "btree" ("location");



CREATE INDEX "idx_lemlist_contacts_company_id" ON "public"."lemlist_contacts" USING "btree" ("company_id");



CREATE INDEX "idx_lemlist_contacts_email" ON "public"."lemlist_contacts" USING "btree" ("email");



CREATE INDEX "idx_lemlist_contacts_industry" ON "public"."lemlist_contacts" USING "btree" ("industry");



CREATE INDEX "idx_lemlist_contacts_lifecycle" ON "public"."lemlist_contacts" USING "btree" ("lifecycle_status");



CREATE INDEX "idx_linkedin_industries_display_name" ON "public"."linkedin_industries" USING "btree" ("display_name");



CREATE INDEX "idx_linkedin_industries_industry_group" ON "public"."linkedin_industries" USING "btree" ("industry_group");



CREATE INDEX "idx_linkedin_industries_sector" ON "public"."linkedin_industries" USING "btree" ("sector");



CREATE INDEX "idx_linkedin_industries_sector_slug" ON "public"."linkedin_industries" USING "btree" ("sector_slug");



CREATE INDEX "idx_locations_active" ON "public"."locations" USING "btree" ("active");



CREATE INDEX "idx_locations_country_type" ON "public"."locations" USING "btree" ("country", "location_type");



CREATE INDEX "idx_locations_featured" ON "public"."locations" USING "btree" ("featured");



CREATE INDEX "idx_locations_location_type" ON "public"."locations" USING "btree" ("location_type");



CREATE INDEX "idx_locations_parent_location_id" ON "public"."locations" USING "btree" ("parent_location_id");



CREATE INDEX "idx_locations_slug" ON "public"."locations" USING "btree" ("slug");



CREATE INDEX "idx_locations_sort_order" ON "public"."locations" USING "btree" ("sort_order");



CREATE INDEX "idx_market_entry_reports_user_status" ON "public"."_archived_market_entry_reports" USING "btree" ("user_id", "status");



CREATE INDEX "idx_mentor_contact_requests_created" ON "public"."mentor_contact_requests" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_mentor_contact_requests_mentor" ON "public"."mentor_contact_requests" USING "btree" ("mentor_id");



CREATE INDEX "idx_mentor_contact_requests_status" ON "public"."mentor_contact_requests" USING "btree" ("status");



CREATE UNIQUE INDEX "idx_partner_domain_lookup_name_normalized" ON "public"."partner_domain_lookup" USING "btree" ("name_normalized");



CREATE INDEX "idx_payment_webhook_logs_created_at" ON "public"."payment_webhook_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_payment_webhook_logs_stripe_event_id" ON "public"."payment_webhook_logs" USING "btree" ("stripe_event_id");



CREATE INDEX "idx_profiles_stripe_customer_id" ON "public"."profiles" USING "btree" ("stripe_customer_id");



CREATE INDEX "idx_rate_limits_lookup" ON "public"."edge_function_rate_limits" USING "btree" ("user_id", "function_name", "invoked_at" DESC);



CREATE INDEX "idx_service_provider_contacts_service_provider_id" ON "public"."service_provider_contacts" USING "btree" ("service_provider_id");



CREATE INDEX "idx_service_provider_reviews_service_provider_id" ON "public"."service_provider_reviews" USING "btree" ("service_provider_id");



CREATE INDEX "idx_service_providers_location_id" ON "public"."service_providers" USING "btree" ("location_id");



CREATE INDEX "idx_sp_sector_gin" ON "public"."service_providers" USING "gin" ("sector_tags");



CREATE INDEX "idx_ta_sector_gin" ON "public"."trade_investment_agencies" USING "gin" ("sector_tags");



CREATE INDEX "idx_trade_agencies_country_iso2" ON "public"."trade_investment_agencies" USING "btree" ("country_iso2") WHERE ("country_iso2" IS NOT NULL);



CREATE INDEX "idx_trade_agencies_domain" ON "public"."trade_investment_agencies" USING "btree" ("domain") WHERE ("domain" IS NOT NULL);



CREATE INDEX "idx_trade_agencies_enrichment_staging_status" ON "public"."trade_agencies_enrichment_staging" USING "btree" ("status");



CREATE INDEX "idx_trade_investment_agencies_location_id" ON "public"."trade_investment_agencies" USING "btree" ("location_id");



CREATE INDEX "idx_user_intake_forms_user_id" ON "public"."user_intake_forms" USING "btree" ("user_id");



CREATE INDEX "idx_user_reports_intake_form_id" ON "public"."user_reports" USING "btree" ("intake_form_id");



CREATE UNIQUE INDEX "idx_user_reports_share_token" ON "public"."user_reports" USING "btree" ("share_token") WHERE ("share_token" IS NOT NULL);



CREATE INDEX "idx_user_reports_user_id" ON "public"."user_reports" USING "btree" ("user_id");



CREATE INDEX "ii_content_author_handle_idx" ON "public"."ii_content" USING "btree" ("author_handle") WHERE ("author_handle" IS NOT NULL);



CREATE INDEX "ii_content_canonical_idx" ON "public"."ii_content" USING "btree" ("is_canonical", "published_at" DESC) WHERE ("is_canonical" = true);



CREATE INDEX "ii_content_category_idx" ON "public"."ii_content" USING "btree" ("category") WHERE ("is_ii_relevant" = true);



CREATE INDEX "ii_content_cluster_idx" ON "public"."ii_content" USING "btree" ("story_cluster_id") WHERE ("story_cluster_id" IS NOT NULL);



CREATE INDEX "ii_content_embedding_idx" ON "public"."ii_content" USING "ivfflat" ("embedding" "public"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "ii_content_entities_gin_idx" ON "public"."ii_content" USING "gin" ("entities");



CREATE INDEX "ii_content_received_at_idx" ON "public"."ii_content" USING "btree" ("received_at" DESC);



CREATE INDEX "ii_content_relevant_idx" ON "public"."ii_content" USING "btree" ("is_ii_relevant", "received_at" DESC) WHERE ("is_ii_relevant" = true);



CREATE INDEX "ii_content_source_metadata_gin_idx" ON "public"."ii_content" USING "gin" ("source_metadata");



CREATE INDEX "ii_content_source_type_idx" ON "public"."ii_content" USING "btree" ("source_type", "published_at" DESC);



CREATE INDEX "ii_content_tags_gin_idx" ON "public"."ii_content" USING "gin" ("tags");



CREATE INDEX "ii_curated_log_action_created_idx" ON "public"."ii_curated_log" USING "btree" ("action", "created_at" DESC);



CREATE INDEX "ii_curated_log_curation_created_idx" ON "public"."ii_curated_log" USING "btree" ("curation_id", "created_at" DESC);



CREATE UNIQUE INDEX "ii_curations_content_surface_date_key" ON "public"."ii_curations" USING "btree" ("content_id", "surface", "curated_for");



CREATE INDEX "ii_curations_curated_for_surface_idx" ON "public"."ii_curations" USING "btree" ("curated_for" DESC, "surface");



CREATE INDEX "ii_curations_model_config_version_idx" ON "public"."ii_curations" USING "btree" ("model_config_version");



CREATE INDEX "ii_curations_scoring_version_idx" ON "public"."ii_curations" USING "btree" ("scoring_version");



CREATE INDEX "ii_curations_status_partial_idx" ON "public"."ii_curations" USING "btree" ("status") WHERE ("status" <> 'new'::"text");



CREATE INDEX "ii_experiment_outputs_experiment_week_idx" ON "public"."ii_experiment_outputs" USING "btree" ("experiment_id", "week_of");



CREATE UNIQUE INDEX "ii_experiment_outputs_unique_arm_idx" ON "public"."ii_experiment_outputs" USING "btree" ("experiment_id", "week_of", "content_id", "arm");



CREATE INDEX "ii_experiment_outputs_verdict_idx" ON "public"."ii_experiment_outputs" USING "btree" ("experiment_id", "editor_verdict") WHERE ("editor_verdict" IS NOT NULL);



CREATE UNIQUE INDEX "ii_intro_archive_week_of_key" ON "public"."ii_intro_archive" USING "btree" ("week_of");



CREATE INDEX "ii_prefilter_log_kept_reason_idx" ON "public"."ii_prefilter_log" USING "btree" ("kept", "reason");



CREATE INDEX "ii_prefilter_log_logged_at_idx" ON "public"."ii_prefilter_log" USING "btree" ("logged_at" DESC);



CREATE INDEX "ii_published_archive_beehiiv_post_id_idx" ON "public"."ii_published_archive" USING "btree" ("beehiiv_post_id") WHERE ("beehiiv_post_id" IS NOT NULL);



CREATE INDEX "ii_published_archive_embedding_idx" ON "public"."ii_published_archive" USING "ivfflat" ("embedding" "public"."vector_cosine_ops") WITH ("lists"='100');



CREATE UNIQUE INDEX "ii_published_archive_idem" ON "public"."ii_published_archive" USING "btree" ("source_type", "source_id", "section_name", "section_index");



CREATE INDEX "ii_published_archive_published_at_idx" ON "public"."ii_published_archive" USING "btree" ("published_at" DESC);



CREATE INDEX "ii_published_archive_section_name_idx" ON "public"."ii_published_archive" USING "btree" ("section_name");



CREATE INDEX "ii_published_archive_source_type_idx" ON "public"."ii_published_archive" USING "btree" ("source_type", "published_at" DESC);



CREATE INDEX "ii_reddit_signals_breakdown_gin_idx" ON "public"."ii_reddit_signals" USING "gin" ("score_breakdown");



CREATE INDEX "ii_reddit_signals_embedding_idx" ON "public"."ii_reddit_signals" USING "ivfflat" ("embedding" "public"."vector_cosine_ops") WITH ("lists"='50');



CREATE INDEX "ii_reddit_signals_promoted_idx" ON "public"."ii_reddit_signals" USING "btree" ("promoted_content_id") WHERE ("promoted_content_id" IS NOT NULL);



CREATE UNIQUE INDEX "ii_reddit_signals_reddit_post_id_uniq" ON "public"."ii_reddit_signals" USING "btree" ("reddit_post_id");



CREATE INDEX "ii_reddit_signals_scanned_at_idx" ON "public"."ii_reddit_signals" USING "btree" ("scanned_at" DESC);



CREATE INDEX "ii_reddit_signals_score_idx" ON "public"."ii_reddit_signals" USING "btree" ("score_normalized" DESC) WHERE ("status" = 'surfaced'::"text");



CREATE INDEX "ii_reddit_signals_status_idx" ON "public"."ii_reddit_signals" USING "btree" ("status") WHERE ("status" <> 'actioned'::"text");



CREATE INDEX "ii_reddit_signals_subreddit_idx" ON "public"."ii_reddit_signals" USING "btree" ("subreddit", "posted_at" DESC);



CREATE INDEX "mes_kb_embedding_idx" ON "public"."mes_knowledge_base" USING "hnsw" ("embedding" "public"."vector_cosine_ops");



CREATE INDEX "mes_kb_fts_idx" ON "public"."mes_knowledge_base" USING "gin" ("to_tsvector"('"english"'::"regconfig", ((COALESCE("title", ''::"text") || ' '::"text") || "content")));



CREATE INDEX "mes_kb_metadata_idx" ON "public"."mes_knowledge_base" USING "gin" ("metadata");



CREATE INDEX "mes_kb_source_idx" ON "public"."mes_knowledge_base" USING "btree" ("source_table", "source_id");



CREATE INDEX "mes_kb_source_project_idx" ON "public"."mes_knowledge_base" USING "btree" ("source_project") WHERE ("source_project" <> 'mes_platform'::"text");



CREATE INDEX "mes_kb_stale_idx" ON "public"."mes_knowledge_base" USING "btree" ("id") WHERE (("embedding" IS NULL) OR ("embedded_hash" IS DISTINCT FROM "content_hash"));



CREATE INDEX "report_quality_build_health_idx" ON "public"."report_quality" USING "btree" ("build_health");



CREATE INDEX "report_quality_created_at_idx" ON "public"."report_quality" USING "btree" ("created_at");



CREATE INDEX "rq_proposals_report_idx" ON "public"."report_quality_proposals" USING "btree" ("report_id");



CREATE INDEX "rq_proposals_status_rank_idx" ON "public"."report_quality_proposals" USING "btree" ("status", "rank_score" DESC);



CREATE INDEX "rq_proposals_theme_idx" ON "public"."report_quality_proposals" USING "btree" ("dedup_theme");



CREATE UNIQUE INDEX "uq_ii_li_posts_post_id" ON "public"."ii_personal_linkedin_posts" USING "btree" ("post_id");



CREATE OR REPLACE TRIGGER "community_members_updated_at" BEFORE UPDATE ON "public"."community_members" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_countries_updated_at" BEFORE UPDATE ON "public"."countries" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_guide_attachments_updated_at" BEFORE UPDATE ON "public"."guide_attachments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."_archived_market_entry_reports" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."case_study_quotes" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."case_study_sources" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."content_bodies" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."content_categories" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."content_company_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."content_founders" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."content_items" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."content_sections" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."country_case_studies" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."country_faqs" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."country_funding_instruments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."country_page_content" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."country_playbook_stages" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."country_trade_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."directory_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."industry_sectors" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."lead_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."locations" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."testimonials" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."trade_investment_agencies" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_email_leads" BEFORE UPDATE ON "public"."email_leads" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_innovation_ecosystem" BEFORE UPDATE ON "public"."innovation_ecosystem" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_leads" BEFORE UPDATE ON "public"."leads" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_service_providers" BEFORE UPDATE ON "public"."service_providers" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "ii_content_updated_at" BEFORE UPDATE ON "public"."ii_content" FOR EACH ROW EXECUTE FUNCTION "public"."update_ii_content_updated_at"();



CREATE OR REPLACE TRIGGER "ii_curations_updated_at" BEFORE UPDATE ON "public"."ii_curations" FOR EACH ROW EXECUTE FUNCTION "public"."ii_curations_set_updated_at"();



CREATE OR REPLACE TRIGGER "ii_published_archive_updated_at" BEFORE UPDATE ON "public"."ii_published_archive" FOR EACH ROW EXECUTE FUNCTION "public"."update_ii_published_archive_updated_at"();



CREATE OR REPLACE TRIGGER "ii_reddit_signals_updated_at" BEFORE UPDATE ON "public"."ii_reddit_signals" FOR EACH ROW EXECUTE FUNCTION "public"."ii_reddit_signals_set_updated_at"();



CREATE OR REPLACE TRIGGER "kb_scrub_pii" BEFORE INSERT OR UPDATE OF "content" ON "public"."mes_knowledge_base" FOR EACH ROW EXECUTE FUNCTION "public"."trg_kb_scrub_pii"();



CREATE OR REPLACE TRIGGER "kb_sync_agency" AFTER INSERT OR DELETE OR UPDATE ON "public"."trade_investment_agencies" FOR EACH ROW EXECUTE FUNCTION "public"."trg_kb_generic"();



CREATE OR REPLACE TRIGGER "kb_sync_content_body" AFTER INSERT OR DELETE OR UPDATE ON "public"."content_bodies" FOR EACH ROW EXECUTE FUNCTION "public"."trg_kb_content"();



CREATE OR REPLACE TRIGGER "kb_sync_content_item" AFTER INSERT OR DELETE OR UPDATE ON "public"."content_items" FOR EACH ROW EXECUTE FUNCTION "public"."trg_kb_content"();



CREATE OR REPLACE TRIGGER "kb_sync_content_section" AFTER INSERT OR DELETE OR UPDATE ON "public"."content_sections" FOR EACH ROW EXECUTE FUNCTION "public"."trg_kb_content"();



CREATE OR REPLACE TRIGGER "kb_sync_country" AFTER INSERT OR DELETE OR UPDATE ON "public"."countries" FOR EACH ROW EXECUTE FUNCTION "public"."trg_kb_generic"();



CREATE OR REPLACE TRIGGER "kb_sync_country_faq" AFTER INSERT OR DELETE OR UPDATE ON "public"."country_faqs" FOR EACH ROW EXECUTE FUNCTION "public"."trg_kb_generic"();



CREATE OR REPLACE TRIGGER "kb_sync_ecosystem" AFTER INSERT OR DELETE OR UPDATE ON "public"."innovation_ecosystem" FOR EACH ROW EXECUTE FUNCTION "public"."trg_kb_generic"();



CREATE OR REPLACE TRIGGER "kb_sync_event" AFTER INSERT OR DELETE OR UPDATE ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."trg_kb_generic"();



CREATE OR REPLACE TRIGGER "kb_sync_investor" AFTER INSERT OR DELETE OR UPDATE ON "public"."investors" FOR EACH ROW EXECUTE FUNCTION "public"."trg_kb_generic"();



CREATE OR REPLACE TRIGGER "kb_sync_lead_database" AFTER INSERT OR DELETE OR UPDATE ON "public"."lead_databases" FOR EACH ROW EXECUTE FUNCTION "public"."trg_kb_generic"();



CREATE OR REPLACE TRIGGER "kb_sync_mentor" AFTER INSERT OR DELETE OR UPDATE ON "public"."community_members" FOR EACH ROW EXECUTE FUNCTION "public"."trg_kb_generic"();



CREATE OR REPLACE TRIGGER "kb_sync_service_provider" AFTER INSERT OR DELETE OR UPDATE ON "public"."service_providers" FOR EACH ROW EXECUTE FUNCTION "public"."trg_kb_service_provider"();



CREATE OR REPLACE TRIGGER "on_profile_created_enrol_sequence" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."enrol_in_onboarding_sequence"();



CREATE OR REPLACE TRIGGER "set_lead_database_records_updated_at" BEFORE UPDATE ON "public"."lead_database_records" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_lead_databases_updated_at" BEFORE UPDATE ON "public"."lead_databases" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "tr_mentor_contact_requests_updated_at" BEFORE UPDATE ON "public"."mentor_contact_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_mentor_contact_requests_updated_at"();



CREATE OR REPLACE TRIGGER "trg_community_members_slug" BEFORE INSERT ON "public"."community_members" FOR EACH ROW EXECUTE FUNCTION "public"."auto_generate_slug"();



CREATE OR REPLACE TRIGGER "trg_dispatch_activity_event" AFTER INSERT ON "public"."activity_events" FOR EACH ROW EXECUTE FUNCTION "public"."dispatch_activity_event"();



CREATE OR REPLACE TRIGGER "trg_emit_chat_activity" AFTER INSERT ON "public"."ai_chat_conversations" FOR EACH ROW EXECUTE FUNCTION "public"."emit_chat_activity"();



CREATE OR REPLACE TRIGGER "trg_emit_directory_submission_activity" AFTER INSERT ON "public"."directory_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."emit_directory_submission_activity"();



CREATE OR REPLACE TRIGGER "trg_emit_email_lead_activity" AFTER INSERT ON "public"."email_leads" FOR EACH ROW EXECUTE FUNCTION "public"."emit_email_lead_activity"();



CREATE OR REPLACE TRIGGER "trg_emit_email_log_activity" AFTER INSERT OR UPDATE ON "public"."email_log" FOR EACH ROW EXECUTE FUNCTION "public"."emit_email_log_activity"();



CREATE OR REPLACE TRIGGER "trg_emit_intake_form_activity" AFTER INSERT OR UPDATE ON "public"."user_intake_forms" FOR EACH ROW EXECUTE FUNCTION "public"."emit_intake_form_activity"();



CREATE OR REPLACE TRIGGER "trg_emit_lead_submission_activity" AFTER INSERT ON "public"."lead_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."emit_lead_submission_activity"();



CREATE OR REPLACE TRIGGER "trg_emit_mentor_contact_activity" AFTER INSERT ON "public"."mentor_contact_requests" FOR EACH ROW EXECUTE FUNCTION "public"."emit_mentor_contact_activity"();



CREATE OR REPLACE TRIGGER "trg_emit_mentor_intro_activity" AFTER INSERT ON "public"."mentor_contact_requests" FOR EACH ROW EXECUTE FUNCTION "public"."emit_mentor_intro_activity"();



CREATE OR REPLACE TRIGGER "trg_emit_profile_activity" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."emit_profile_activity"();



CREATE OR REPLACE TRIGGER "trg_emit_review_activity" AFTER INSERT ON "public"."service_provider_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."emit_review_activity"();



CREATE OR REPLACE TRIGGER "trg_emit_subscription_activity" AFTER INSERT OR UPDATE ON "public"."user_subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."emit_subscription_activity"();



CREATE OR REPLACE TRIGGER "trg_emit_user_report_activity" AFTER INSERT OR UPDATE ON "public"."user_reports" FOR EACH ROW EXECUTE FUNCTION "public"."emit_user_report_activity"();



CREATE OR REPLACE TRIGGER "trg_innovation_ecosystem_slug" BEFORE INSERT ON "public"."innovation_ecosystem" FOR EACH ROW EXECUTE FUNCTION "public"."auto_generate_slug"();



CREATE OR REPLACE TRIGGER "trg_investors_slug" BEFORE INSERT ON "public"."investors" FOR EACH ROW EXECUTE FUNCTION "public"."auto_generate_slug"();



CREATE OR REPLACE TRIGGER "trg_service_providers_slug" BEFORE INSERT ON "public"."service_providers" FOR EACH ROW EXECUTE FUNCTION "public"."auto_generate_slug"();



CREATE OR REPLACE TRIGGER "trg_set_event_time_label" BEFORE INSERT OR UPDATE ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."set_event_time_label"();



CREATE OR REPLACE TRIGGER "update_ai_chat_conversations_updated_at" BEFORE UPDATE ON "public"."ai_chat_conversations" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_lemlist_companies_updated_at" BEFORE UPDATE ON "public"."lemlist_companies" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_lemlist_contacts_updated_at" BEFORE UPDATE ON "public"."lemlist_contacts" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_report_templates_updated_at" BEFORE UPDATE ON "public"."report_templates" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_user_intake_forms_updated_at" BEFORE UPDATE ON "public"."user_intake_forms" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_user_reports_updated_at" BEFORE UPDATE ON "public"."user_reports" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_user_subscriptions_updated_at" BEFORE UPDATE ON "public"."user_subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."agency_contacts"
    ADD CONSTRAINT "agency_contacts_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "public"."trade_investment_agencies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agency_resources"
    ADD CONSTRAINT "agency_resources_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "public"."trade_investment_agencies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_chat_conversations"
    ADD CONSTRAINT "ai_chat_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ai_chat_messages"
    ADD CONSTRAINT "ai_chat_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_chat_conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."case_study_quotes"
    ADD CONSTRAINT "case_study_quotes_case_study_id_fkey" FOREIGN KEY ("case_study_id") REFERENCES "public"."content_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."case_study_quotes"
    ADD CONSTRAINT "case_study_quotes_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."content_sections"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."case_study_sources"
    ADD CONSTRAINT "case_study_sources_case_study_id_fkey" FOREIGN KEY ("case_study_id") REFERENCES "public"."content_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."case_study_sources"
    ADD CONSTRAINT "case_study_sources_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."content_sections"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."content_bodies"
    ADD CONSTRAINT "content_bodies_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_bodies"
    ADD CONSTRAINT "content_bodies_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."content_sections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_company_profiles"
    ADD CONSTRAINT "content_company_profiles_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_founders"
    ADD CONSTRAINT "content_founders_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_items"
    ADD CONSTRAINT "content_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."content_categories"("id");



ALTER TABLE ONLY "public"."content_sections"
    ADD CONSTRAINT "content_sections_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."country_case_studies"
    ADD CONSTRAINT "country_case_studies_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."country_case_studies"
    ADD CONSTRAINT "country_case_studies_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."country_faqs"
    ADD CONSTRAINT "country_faqs_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."country_funding_instruments"
    ADD CONSTRAINT "country_funding_instruments_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."country_page_content"
    ADD CONSTRAINT "country_page_content_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."country_playbook_stages"
    ADD CONSTRAINT "country_playbook_stages_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."country_trade_metrics"
    ADD CONSTRAINT "country_trade_metrics_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."email_log"
    ADD CONSTRAINT "email_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."email_sequences"
    ADD CONSTRAINT "email_sequences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_possible_duplicate_of_fkey" FOREIGN KEY ("possible_duplicate_of") REFERENCES "public"."events"("id");



ALTER TABLE ONLY "public"."events_staging"
    ADD CONSTRAINT "events_staging_target_event_id_fkey" FOREIGN KEY ("target_event_id") REFERENCES "public"."events"("id");



ALTER TABLE ONLY "public"."guide_attachments"
    ADD CONSTRAINT "guide_attachments_content_item_id_fkey" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ii_curated_log"
    ADD CONSTRAINT "ii_curated_log_curation_id_fkey" FOREIGN KEY ("curation_id") REFERENCES "public"."ii_curations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ii_curations"
    ADD CONSTRAINT "ii_curations_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."ii_content"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ii_experiment_outputs"
    ADD CONSTRAINT "ii_experiment_outputs_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "public"."ii_content"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ii_reddit_signals"
    ADD CONSTRAINT "ii_reddit_signals_promoted_content_id_fkey" FOREIGN KEY ("promoted_content_id") REFERENCES "public"."ii_content"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."innovation_ecosystem_enrichment_staging"
    ADD CONSTRAINT "innovation_ecosystem_enrichment_staging_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "public"."innovation_ecosystem"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."innovation_ecosystem"
    ADD CONSTRAINT "innovation_ecosystem_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."intake_form_events"
    ADD CONSTRAINT "intake_form_events_intake_form_id_fkey" FOREIGN KEY ("intake_form_id") REFERENCES "public"."user_intake_forms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."intake_form_events"
    ADD CONSTRAINT "intake_form_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."lead_database_records"
    ADD CONSTRAINT "lead_database_records_lead_database_id_fkey" FOREIGN KEY ("lead_database_id") REFERENCES "public"."lead_databases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lemlist_contacts"
    ADD CONSTRAINT "lemlist_contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."lemlist_companies"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_parent_location_id_fkey" FOREIGN KEY ("parent_location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."_archived_market_entry_reports"
    ADD CONSTRAINT "market_entry_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."mentor_contact_requests"
    ADD CONSTRAINT "mentor_contact_requests_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "public"."community_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_quality_proposals"
    ADD CONSTRAINT "report_quality_proposals_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."automation_runs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."service_provider_contacts"
    ADD CONSTRAINT "service_provider_contacts_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "public"."service_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_provider_reviews"
    ADD CONSTRAINT "service_provider_reviews_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "public"."service_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_providers"
    ADD CONSTRAINT "service_providers_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trade_agencies_enrichment_staging"
    ADD CONSTRAINT "trade_agencies_enrichment_staging_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "public"."trade_investment_agencies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trade_investment_agencies"
    ADD CONSTRAINT "trade_investment_agencies_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_intake_forms"
    ADD CONSTRAINT "user_intake_forms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_reports"
    ADD CONSTRAINT "user_reports_intake_form_id_fkey" FOREIGN KEY ("intake_form_id") REFERENCES "public"."user_intake_forms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_reports"
    ADD CONSTRAINT "user_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can create events" ON "public"."events" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete community members" ON "public"."community_members" FOR DELETE TO "authenticated" USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete events" ON "public"."events" FOR DELETE TO "authenticated" USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete guide attachments" ON "public"."guide_attachments" FOR DELETE TO "authenticated" USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete templates" ON "public"."report_templates" FOR DELETE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert community members" ON "public"."community_members" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert guide attachments" ON "public"."guide_attachments" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert templates" ON "public"."report_templates" FOR INSERT WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all roles" ON "public"."user_roles" TO "authenticated" USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage lead database records" ON "public"."lead_database_records" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Admins can manage lead databases" ON "public"."lead_databases" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("user_roles"."role" = 'admin'::"public"."app_role")))));



CREATE POLICY "Admins can manage leads" ON "public"."leads" TO "authenticated" USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage testimonials" ON "public"."testimonials" TO "authenticated" USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can read intake events" ON "public"."intake_form_events" FOR SELECT USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update community members" ON "public"."community_members" FOR UPDATE TO "authenticated" USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update events" ON "public"."events" FOR UPDATE TO "authenticated" USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update guide attachments" ON "public"."guide_attachments" FOR UPDATE TO "authenticated" USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update templates" ON "public"."report_templates" FOR UPDATE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all profiles" ON "public"."profiles" FOR SELECT USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view community members" ON "public"."community_members" FOR SELECT TO "authenticated" USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view email logs" ON "public"."email_log" FOR SELECT USING (false);



CREATE POLICY "Admins can view webhook logs" ON "public"."payment_webhook_logs" FOR SELECT USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins manage enrichment staging" ON "public"."innovation_ecosystem_enrichment_staging" USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins manage partner domain lookup" ON "public"."partner_domain_lookup" USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins manage sector vocabulary" ON "public"."sector_vocabulary" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins read automation_runs" ON "public"."automation_runs" FOR SELECT USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins read ecosystem_import_candidates" ON "public"."ecosystem_import_candidates" FOR SELECT USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins read report_quality" ON "public"."report_quality" FOR SELECT USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins read report_quality_proposals" ON "public"."report_quality_proposals" FOR SELECT USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins update ecosystem_import_candidates" ON "public"."ecosystem_import_candidates" FOR UPDATE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Admins update report_quality_proposals" ON "public"."report_quality_proposals" FOR UPDATE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Anyone can insert intake events" ON "public"."intake_form_events" FOR INSERT WITH CHECK ((("event_type" IS NOT NULL) AND ("length"("event_type") <= 100) AND (("metadata" IS NULL) OR ("length"(("metadata")::"text") <= 20000)) AND (("field_name" IS NULL) OR ("length"("field_name") <= 200))));



CREATE POLICY "Anyone can insert usage tracking" ON "public"."user_usage" FOR INSERT WITH CHECK ((("session_id" IS NOT NULL) AND ("length"("session_id") <= 64) AND (("content_type" IS NULL) OR ("length"("content_type") <= 100)) AND (("item_id" IS NULL) OR ("length"("item_id") <= 200))));



CREATE POLICY "Anyone can read country_case_studies" ON "public"."country_case_studies" FOR SELECT USING (true);



CREATE POLICY "Anyone can read country_faqs" ON "public"."country_faqs" FOR SELECT USING (true);



CREATE POLICY "Anyone can read country_funding_instruments" ON "public"."country_funding_instruments" FOR SELECT USING (true);



CREATE POLICY "Anyone can read country_page_content" ON "public"."country_page_content" FOR SELECT USING (true);



CREATE POLICY "Anyone can read country_playbook_stages" ON "public"."country_playbook_stages" FOR SELECT USING (true);



CREATE POLICY "Anyone can read country_trade_metrics" ON "public"."country_trade_metrics" FOR SELECT USING (true);



CREATE POLICY "Anyone can read investors" ON "public"."investors" FOR SELECT USING (true);



CREATE POLICY "Anyone can read legacy_industry_mapping" ON "public"."legacy_industry_mapping" FOR SELECT USING (true);



CREATE POLICY "Anyone can read linkedin_industries" ON "public"."linkedin_industries" FOR SELECT USING (true);



CREATE POLICY "Anyone can read sector vocabulary" ON "public"."sector_vocabulary" FOR SELECT USING (true);



CREATE POLICY "Anyone can read sequence steps" ON "public"."email_sequence_steps" FOR SELECT USING (true);



CREATE POLICY "Anyone can submit directory applications" ON "public"."directory_submissions" FOR INSERT WITH CHECK ((("contact_email" IS NOT NULL) AND (("length"("contact_email") >= 3) AND ("length"("contact_email") <= 320)) AND (POSITION(('@'::"text") IN ("contact_email")) > 1) AND ("form_data" IS NOT NULL) AND ("length"(("form_data")::"text") <= 20000)));



CREATE POLICY "Anyone can submit email leads" ON "public"."email_leads" FOR INSERT WITH CHECK (((("length"("email") >= 3) AND ("length"("email") <= 320)) AND (POSITION(('@'::"text") IN ("email")) > 1)));



CREATE POLICY "Anyone can submit lead submissions" ON "public"."lead_submissions" FOR INSERT WITH CHECK (((("email" IS NULL) OR ((("length"("email") >= 3) AND ("length"("email") <= 320)) AND (POSITION(('@'::"text") IN ("email")) > 1))) AND (("notes" IS NULL) OR ("length"("notes") <= 5000)) AND (("company_website" IS NULL) OR ("length"("company_website") <= 2000))));



CREATE POLICY "Anyone can view agency contacts" ON "public"."agency_contacts" FOR SELECT USING (true);



CREATE POLICY "Anyone can view agency resources" ON "public"."agency_resources" FOR SELECT USING (true);



CREATE POLICY "Anyone can view guide attachments" ON "public"."guide_attachments" FOR SELECT USING (true);



CREATE POLICY "Anyone can view leads" ON "public"."leads" FOR SELECT USING (true);



CREATE POLICY "Anyone can view organisation categories" ON "public"."organisation_categories" FOR SELECT USING (true);



CREATE POLICY "Authenticated can view lead database records" ON "public"."lead_database_records" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Only admins can delete country_case_studies" ON "public"."country_case_studies" FOR DELETE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can delete country_faqs" ON "public"."country_faqs" FOR DELETE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can delete country_funding_instruments" ON "public"."country_funding_instruments" FOR DELETE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can delete country_page_content" ON "public"."country_page_content" FOR DELETE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can delete country_playbook_stages" ON "public"."country_playbook_stages" FOR DELETE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can delete country_trade_metrics" ON "public"."country_trade_metrics" FOR DELETE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can delete investors" ON "public"."investors" FOR DELETE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can insert country_case_studies" ON "public"."country_case_studies" FOR INSERT WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can insert country_faqs" ON "public"."country_faqs" FOR INSERT WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can insert country_funding_instruments" ON "public"."country_funding_instruments" FOR INSERT WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can insert country_page_content" ON "public"."country_page_content" FOR INSERT WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can insert country_playbook_stages" ON "public"."country_playbook_stages" FOR INSERT WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can insert country_trade_metrics" ON "public"."country_trade_metrics" FOR INSERT WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can insert investors" ON "public"."investors" FOR INSERT WITH CHECK ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can update country_case_studies" ON "public"."country_case_studies" FOR UPDATE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can update country_faqs" ON "public"."country_faqs" FOR UPDATE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can update country_funding_instruments" ON "public"."country_funding_instruments" FOR UPDATE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can update country_page_content" ON "public"."country_page_content" FOR UPDATE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can update country_playbook_stages" ON "public"."country_playbook_stages" FOR UPDATE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can update country_trade_metrics" ON "public"."country_trade_metrics" FOR UPDATE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can update investors" ON "public"."investors" FOR UPDATE USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can view email leads" ON "public"."email_leads" FOR SELECT USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can view lead submissions" ON "public"."lead_submissions" FOR SELECT USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can view lemlist companies" ON "public"."lemlist_companies" FOR SELECT USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can view lemlist contacts" ON "public"."lemlist_contacts" FOR SELECT USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "Only admins can view submissions" ON "public"."directory_submissions" FOR SELECT USING (false);



CREATE POLICY "Public can view case study quotes" ON "public"."case_study_quotes" FOR SELECT USING (true);



CREATE POLICY "Public can view case study sources" ON "public"."case_study_sources" FOR SELECT USING (true);



CREATE POLICY "Public can view company profiles" ON "public"."content_company_profiles" FOR SELECT USING (true);



CREATE POLICY "Public can view content bodies" ON "public"."content_bodies" FOR SELECT USING (true);



CREATE POLICY "Public can view content categories" ON "public"."content_categories" FOR SELECT USING (true);



CREATE POLICY "Public can view content sections" ON "public"."content_sections" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public can view countries" ON "public"."countries" FOR SELECT USING (true);



CREATE POLICY "Public can view founders" ON "public"."content_founders" FOR SELECT USING (true);



CREATE POLICY "Public can view industry sectors" ON "public"."industry_sectors" FOR SELECT USING (true);



CREATE POLICY "Public can view innovation ecosystem" ON "public"."innovation_ecosystem" FOR SELECT USING (true);



CREATE POLICY "Public can view lead databases" ON "public"."lead_databases" FOR SELECT USING (true);



CREATE POLICY "Public can view locations" ON "public"."locations" FOR SELECT USING (true);



CREATE POLICY "Public can view published content" ON "public"."content_items" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Public can view service providers" ON "public"."service_providers" FOR SELECT USING (true);



CREATE POLICY "Public can view testimonials" ON "public"."testimonials" FOR SELECT USING (true);



CREATE POLICY "Public can view trade investment agencies" ON "public"."trade_investment_agencies" FOR SELECT USING (true);



CREATE POLICY "Public read" ON "public"."service_provider_categories" FOR SELECT USING (true);



CREATE POLICY "Public read" ON "public"."service_provider_contacts" FOR SELECT USING (true);



CREATE POLICY "Public read" ON "public"."service_provider_reviews" FOR SELECT USING (true);



CREATE POLICY "Read relevant content" ON "public"."ii_content" FOR SELECT USING (("is_ii_relevant" = true));



CREATE POLICY "Service can insert reports" ON "public"."user_reports" FOR INSERT WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR "public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role")));



CREATE POLICY "Service role can insert email sequences" ON "public"."email_sequences" FOR INSERT WITH CHECK (false);



CREATE POLICY "Service role can select email sequences" ON "public"."email_sequences" FOR SELECT USING (false);



CREATE POLICY "Service role can update email sequences" ON "public"."email_sequences" FOR UPDATE USING (false);



CREATE POLICY "System can insert email logs" ON "public"."email_log" FOR INSERT WITH CHECK (false);



CREATE POLICY "System can insert webhook logs" ON "public"."payment_webhook_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can create conversations" ON "public"."ai_chat_conversations" FOR INSERT WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (("user_id" IS NULL) AND ("session_id" IS NOT NULL) AND ("session_id" = "public"."current_chat_session_id"()))));



CREATE POLICY "Users can create messages in their conversations" ON "public"."ai_chat_messages" FOR INSERT WITH CHECK (("conversation_id" IN ( SELECT "ai_chat_conversations"."id"
   FROM "public"."ai_chat_conversations"
  WHERE ((( SELECT "auth"."uid"() AS "uid") = "ai_chat_conversations"."user_id") OR (("ai_chat_conversations"."user_id" IS NULL) AND ("ai_chat_conversations"."session_id" IS NOT NULL) AND ("ai_chat_conversations"."session_id" = "public"."current_chat_session_id"()))))));



CREATE POLICY "Users can create their own bookmarks" ON "public"."bookmarks" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete their own bookmarks" ON "public"."bookmarks" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete their own conversations" ON "public"."ai_chat_conversations" FOR DELETE USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (("user_id" IS NULL) AND ("session_id" IS NOT NULL) AND ("session_id" = "public"."current_chat_session_id"()))));



CREATE POLICY "Users can insert own intake forms" ON "public"."user_intake_forms" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can update own intake forms" ON "public"."user_intake_forms" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR "public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role")));



CREATE POLICY "Users can update own report feedback" ON "public"."user_reports" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own conversations" ON "public"."ai_chat_conversations" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (("user_id" IS NULL) AND ("session_id" IS NOT NULL) AND ("session_id" = "public"."current_chat_session_id"()))));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can view messages from their conversations" ON "public"."ai_chat_messages" FOR SELECT USING (("conversation_id" IN ( SELECT "ai_chat_conversations"."id"
   FROM "public"."ai_chat_conversations"
  WHERE ((( SELECT "auth"."uid"() AS "uid") = "ai_chat_conversations"."user_id") OR (("ai_chat_conversations"."user_id" IS NULL) AND ("ai_chat_conversations"."session_id" IS NOT NULL) AND ("ai_chat_conversations"."session_id" = "public"."current_chat_session_id"()))))));



CREATE POLICY "Users can view own intake forms" ON "public"."user_intake_forms" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR "public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role")));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can view own reports" ON "public"."user_reports" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR "public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role")));



CREATE POLICY "Users can view their own bookmarks" ON "public"."bookmarks" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own conversations" ON "public"."ai_chat_conversations" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR (("user_id" IS NULL) AND ("session_id" IS NOT NULL) AND ("session_id" = "public"."current_chat_session_id"()))));



CREATE POLICY "Users can view their own roles" ON "public"."user_roles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own subscription" ON "public"."user_subscriptions" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."_archived_market_entry_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_event_routing" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admins can update mentor contact requests" ON "public"."mentor_contact_requests" FOR UPDATE TO "authenticated" USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



CREATE POLICY "admins can view all mentor contact requests" ON "public"."mentor_contact_requests" FOR SELECT TO "authenticated" USING ("public"."has_role"(( SELECT "auth"."uid"() AS "uid"), 'admin'::"public"."app_role"));



ALTER TABLE "public"."agency_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agency_resources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_chat_conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_chat_messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "anyone can submit a mentor contact request" ON "public"."mentor_contact_requests" FOR INSERT WITH CHECK ((("requester_email" IS NOT NULL) AND (("length"("requester_email") >= 3) AND ("length"("requester_email") <= 320)) AND (POSITION(('@'::"text") IN ("requester_email")) > 1) AND (("message" IS NULL) OR ("length"("message") <= 5000)) AND (("requester_name" IS NULL) OR ("length"("requester_name") <= 200))));



ALTER TABLE "public"."automation_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bookmarks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."case_study_quotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."case_study_sources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_bodies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_company_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_founders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."country_case_studies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."country_faqs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."country_funding_instruments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."country_page_content" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."country_playbook_stages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."country_trade_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."directory_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ecosystem_import_candidates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."edge_function_rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_leads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_sequence_steps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_sequences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "events_public_read" ON "public"."events" FOR SELECT TO "authenticated", "anon" USING (("status" = 'approved'::"text"));



ALTER TABLE "public"."events_staging" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."firecrawl_scrape_cache" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."guide_attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ii_content" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ii_curated_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ii_curations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ii_experiment_outputs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ii_intro_archive" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ii_personal_linkedin_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ii_prefilter_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ii_published_archive" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ii_reddit_signals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."industry_sectors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."innovation_ecosystem" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."innovation_ecosystem_enrichment_staging" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."intake_form_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."investors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."kb_sync_state" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_embed_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lead_database_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lead_databases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lead_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."legacy_industry_mapping" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lemlist_companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lemlist_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."linkedin_industries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mentor_contact_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mes_knowledge_base" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organisation_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."partner_domain_lookup" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_webhook_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."report_quality" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."report_quality_proposals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."report_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sector_vocabulary" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_provider_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_provider_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_provider_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."testimonials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trade_agencies_enrichment_staging" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trade_investment_agencies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_intake_forms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_usage" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






GRANT USAGE ON SCHEMA "private" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "service_role";
































































































































































































































































































GRANT ALL ON FUNCTION "public"."any_sector_agnostic"("raws" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."any_sector_agnostic"("raws" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."any_sector_agnostic"("raws" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_generate_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_generate_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_generate_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."current_chat_session_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_chat_session_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_chat_session_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."detect_funnel_gate_hits"() TO "anon";
GRANT ALL ON FUNCTION "public"."detect_funnel_gate_hits"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."detect_funnel_gate_hits"() TO "service_role";



GRANT ALL ON FUNCTION "public"."dispatch_activity_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."dispatch_activity_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."dispatch_activity_event"() TO "service_role";



GRANT ALL ON FUNCTION "public"."emit_chat_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."emit_chat_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."emit_chat_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."emit_directory_submission_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."emit_directory_submission_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."emit_directory_submission_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."emit_email_lead_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."emit_email_lead_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."emit_email_lead_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."emit_email_log_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."emit_email_log_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."emit_email_log_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."emit_intake_form_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."emit_intake_form_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."emit_intake_form_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."emit_lead_submission_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."emit_lead_submission_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."emit_lead_submission_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."emit_mentor_contact_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."emit_mentor_contact_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."emit_mentor_contact_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."emit_mentor_intro_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."emit_mentor_intro_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."emit_mentor_intro_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."emit_profile_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."emit_profile_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."emit_profile_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."emit_review_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."emit_review_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."emit_review_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."emit_subscription_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."emit_subscription_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."emit_subscription_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."emit_user_report_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."emit_user_report_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."emit_user_report_activity"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."enrol_in_onboarding_sequence"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."enrol_in_onboarding_sequence"() TO "service_role";



GRANT ALL ON FUNCTION "public"."event_local_time_label"("p_ts" timestamp with time zone, "p_city" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."event_local_time_label"("p_ts" timestamp with time zone, "p_city" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."event_local_time_label"("p_ts" timestamp with time zone, "p_city" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."find_duplicate_event"("p_title" "text", "p_event_date" timestamp with time zone, "p_city" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."find_duplicate_event"("p_title" "text", "p_event_date" timestamp with time zone, "p_city" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_shared_report"("p_share_token" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_shared_report"("p_share_token" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_shared_report"("p_share_token" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_shared_report"("p_share_token" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_tier_gated_report"("p_report_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_tier_gated_report"("p_report_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_tier_gated_report"("p_report_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user_subscription"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user_subscription"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ii_curations_set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."ii_curations_set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ii_curations_set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ii_reddit_signals_set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."ii_reddit_signals_set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ii_reddit_signals_set_updated_at"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."increment_download_count"("attachment_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."increment_download_count"("attachment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_download_count"("attachment_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "service_role";



REVOKE ALL ON FUNCTION "public"."kb_check_secret"("p_candidate" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."kb_check_secret"("p_candidate" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."kb_external_source_id"("p_source_project" "text", "p_source_ref" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."kb_external_source_id"("p_source_project" "text", "p_source_ref" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."kb_external_source_id"("p_source_project" "text", "p_source_ref" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."kb_get_openai_key"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."kb_get_openai_key"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."kb_set_embedding"("p_id" "uuid", "p_embedding" "text", "p_embedded_hash" "text", "p_model" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."kb_set_embedding"("p_id" "uuid", "p_embedding" "text", "p_embedded_hash" "text", "p_model" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."kb_stale_rows"("p_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."kb_stale_rows"("p_limit" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."kb_strip_pii"("p" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."kb_strip_pii"("p" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."kb_sync_all"("p_entity" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."kb_sync_all"("p_entity" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_activity"("p_event_type" "text", "p_severity" "text", "p_actor_user_id" "uuid", "p_actor_email" "text", "p_actor_name" "text", "p_object_type" "text", "p_object_id" "uuid", "p_metadata" "jsonb", "p_dedup_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."log_activity"("p_event_type" "text", "p_severity" "text", "p_actor_user_id" "uuid", "p_actor_email" "text", "p_actor_name" "text", "p_object_type" "text", "p_object_id" "uuid", "p_metadata" "jsonb", "p_dedup_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_activity"("p_event_type" "text", "p_severity" "text", "p_actor_user_id" "uuid", "p_actor_email" "text", "p_actor_name" "text", "p_object_type" "text", "p_object_id" "uuid", "p_metadata" "jsonb", "p_dedup_key" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."map_sector_value"("raw" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."map_sector_value"("raw" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."map_sector_value"("raw" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."map_sector_values"("raws" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."map_sector_values"("raws" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."map_sector_values"("raws" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."match_archive"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "source_type_filter" "text", "section_filter" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."match_archive"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "source_type_filter" "text", "section_filter" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_archive"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "source_type_filter" "text", "section_filter" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."match_content"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "category_filter" "text", "source_type_filter" "text", "canonical_only" boolean, "since_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."match_content"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "category_filter" "text", "source_type_filter" "text", "canonical_only" boolean, "since_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_content"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "category_filter" "text", "source_type_filter" "text", "canonical_only" boolean, "since_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."match_emails"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "category_filter" "text", "since_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."match_emails"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "category_filter" "text", "since_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_emails"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "category_filter" "text", "since_date" timestamp with time zone) TO "service_role";



REVOKE ALL ON FUNCTION "public"."match_knowledge"("query_embedding" "public"."vector", "query_text" "text", "match_count" integer, "match_threshold" double precision, "filter" "jsonb", "allowed_visibility" "text"[]) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."match_knowledge"("query_embedding" "public"."vector", "query_text" "text", "match_count" integer, "match_threshold" double precision, "filter" "jsonb", "allowed_visibility" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."match_knowledge"("query_embedding" "public"."vector", "query_text" "text", "match_count" integer, "match_threshold" double precision, "filter" "jsonb", "allowed_visibility" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_knowledge"("query_embedding" "public"."vector", "query_text" "text", "match_count" integer, "match_threshold" double precision, "filter" "jsonb", "allowed_visibility" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."recent_ii_content"("days" integer, "category_filter" "text", "source_type_filter" "text", "canonical_only" boolean, "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."recent_ii_content"("days" integer, "category_filter" "text", "source_type_filter" "text", "canonical_only" boolean, "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."recent_ii_content"("days" integer, "category_filter" "text", "source_type_filter" "text", "canonical_only" boolean, "max_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."recent_ii_emails"("days" integer, "category_filter" "text", "max_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."recent_ii_emails"("days" integer, "category_filter" "text", "max_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."recent_ii_emails"("days" integer, "category_filter" "text", "max_count" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."roll_forward_month_precision_events"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."roll_forward_month_precision_events"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_event_time_label"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_event_time_label"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_event_time_label"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."tier_rank"("t" "public"."subscription_tier") TO "anon";
GRANT ALL ON FUNCTION "public"."tier_rank"("t" "public"."subscription_tier") TO "authenticated";
GRANT ALL ON FUNCTION "public"."tier_rank"("t" "public"."subscription_tier") TO "service_role";



REVOKE ALL ON FUNCTION "public"."trg_kb_content"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."trg_kb_content"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."trg_kb_generic"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."trg_kb_generic"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."trg_kb_scrub_pii"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."trg_kb_scrub_pii"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."trg_kb_service_provider"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."trg_kb_service_provider"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_validate_intake_industry"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_validate_intake_industry"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_validate_intake_industry"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_ii_content_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_ii_content_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_ii_content_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_ii_emails_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_ii_emails_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_ii_emails_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_ii_published_archive_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_ii_published_archive_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_ii_published_archive_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_mentor_contact_requests_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_mentor_contact_requests_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_mentor_contact_requests_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_ii_linkedin_posts"("rows" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_ii_linkedin_posts"("rows" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_ii_linkedin_posts"("rows" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_kb_agency"("p_source_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_kb_agency"("p_source_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_kb_content_item"("p_content_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_kb_content_item"("p_content_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_kb_country"("p_source_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_kb_country"("p_source_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_kb_country_faq"("p_source_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_kb_country_faq"("p_source_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_kb_ecosystem"("p_source_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_kb_ecosystem"("p_source_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_kb_event"("p_source_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_kb_event"("p_source_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_kb_investor"("p_source_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_kb_investor"("p_source_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_kb_lead_database"("p_source_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_kb_lead_database"("p_source_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_kb_linkedin_post"("p_source_ref" "text", "p_content" "text", "p_embedding" "public"."vector", "p_title" "text", "p_metadata" "jsonb", "p_embedding_model" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_kb_linkedin_post"("p_source_ref" "text", "p_content" "text", "p_embedding" "public"."vector", "p_title" "text", "p_metadata" "jsonb", "p_embedding_model" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_kb_linkedin_posts"("p_rows" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_kb_linkedin_posts"("p_rows" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_kb_mentor"("p_source_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_kb_mentor"("p_source_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_kb_service_provider"("p_source_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_kb_service_provider"("p_source_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_normalized_event"("e" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_normalized_event"("e" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_industry_sector_values"("industries" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."validate_industry_sector_values"("industries" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_industry_sector_values"("industries" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";












GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "service_role";


















GRANT ALL ON TABLE "private"."MES" TO "service_role";



GRANT ALL ON TABLE "public"."_archived_market_entry_reports" TO "service_role";



GRANT ALL ON TABLE "public"."activity_event_routing" TO "service_role";



GRANT ALL ON TABLE "public"."activity_events" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."agency_contacts" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."agency_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."agency_contacts" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."agency_resources" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."agency_resources" TO "authenticated";
GRANT ALL ON TABLE "public"."agency_resources" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."organisation_categories" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."organisation_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."organisation_categories" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."trade_investment_agencies" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."trade_investment_agencies" TO "authenticated";
GRANT ALL ON TABLE "public"."trade_investment_agencies" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."agencies_report_view" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."agencies_report_view" TO "authenticated";
GRANT ALL ON TABLE "public"."agencies_report_view" TO "service_role";



GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."ai_chat_conversations" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."ai_chat_conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_chat_conversations" TO "service_role";



GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."ai_chat_messages" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."ai_chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."automation_runs" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."bookmarks" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."bookmarks" TO "authenticated";
GRANT ALL ON TABLE "public"."bookmarks" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."case_study_quotes" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."case_study_quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."case_study_quotes" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."case_study_sources" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."case_study_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."case_study_sources" TO "service_role";



GRANT MAINTAIN ON TABLE "public"."community_members" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."community_members" TO "authenticated";
GRANT ALL ON TABLE "public"."community_members" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."community_members_public" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."community_members_public" TO "authenticated";
GRANT ALL ON TABLE "public"."community_members_public" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."content_bodies" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."content_bodies" TO "authenticated";
GRANT ALL ON TABLE "public"."content_bodies" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."content_categories" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."content_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."content_categories" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."content_company_profiles" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."content_company_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."content_company_profiles" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."content_founders" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."content_founders" TO "authenticated";
GRANT ALL ON TABLE "public"."content_founders" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."content_items" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."content_items" TO "authenticated";
GRANT ALL ON TABLE "public"."content_items" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."content_sections" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."content_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."content_sections" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."countries" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."countries" TO "authenticated";
GRANT ALL ON TABLE "public"."countries" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."country_case_studies" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."country_case_studies" TO "authenticated";
GRANT ALL ON TABLE "public"."country_case_studies" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."country_faqs" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."country_faqs" TO "authenticated";
GRANT ALL ON TABLE "public"."country_faqs" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."country_funding_instruments" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."country_funding_instruments" TO "authenticated";
GRANT ALL ON TABLE "public"."country_funding_instruments" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."country_page_content" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."country_page_content" TO "authenticated";
GRANT ALL ON TABLE "public"."country_page_content" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."country_playbook_stages" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."country_playbook_stages" TO "authenticated";
GRANT ALL ON TABLE "public"."country_playbook_stages" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."country_trade_metrics" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."country_trade_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."country_trade_metrics" TO "service_role";



GRANT SELECT,INSERT,MAINTAIN ON TABLE "public"."directory_submissions" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."directory_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."directory_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."ecosystem_import_candidates" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."edge_function_rate_limits" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."edge_function_rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."edge_function_rate_limits" TO "service_role";



GRANT SELECT,INSERT,MAINTAIN ON TABLE "public"."email_leads" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."email_leads" TO "authenticated";
GRANT ALL ON TABLE "public"."email_leads" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."email_log" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."email_log" TO "authenticated";
GRANT ALL ON TABLE "public"."email_log" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."email_sequence_steps" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."email_sequence_steps" TO "authenticated";
GRANT ALL ON TABLE "public"."email_sequence_steps" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."email_sequences" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."email_sequences" TO "authenticated";
GRANT ALL ON TABLE "public"."email_sequences" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."events" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."events_staging" TO "service_role";



GRANT ALL ON TABLE "public"."firecrawl_scrape_cache" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."guide_attachments" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."guide_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."guide_attachments" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."ii_content" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."ii_content" TO "authenticated";
GRANT ALL ON TABLE "public"."ii_content" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."ii_curated_log" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."ii_curated_log" TO "authenticated";
GRANT ALL ON TABLE "public"."ii_curated_log" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."ii_curations" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."ii_curations" TO "authenticated";
GRANT ALL ON TABLE "public"."ii_curations" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."ii_experiment_outputs" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."ii_experiment_outputs" TO "authenticated";
GRANT ALL ON TABLE "public"."ii_experiment_outputs" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."ii_intro_archive" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."ii_intro_archive" TO "authenticated";
GRANT ALL ON TABLE "public"."ii_intro_archive" TO "service_role";



GRANT ALL ON TABLE "public"."ii_personal_linkedin_posts" TO "anon";
GRANT ALL ON TABLE "public"."ii_personal_linkedin_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."ii_personal_linkedin_posts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."ii_personal_linkedin_posts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."ii_personal_linkedin_posts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."ii_personal_linkedin_posts_id_seq" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."ii_prefilter_log" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."ii_prefilter_log" TO "authenticated";
GRANT ALL ON TABLE "public"."ii_prefilter_log" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."ii_published_archive" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."ii_published_archive" TO "authenticated";
GRANT ALL ON TABLE "public"."ii_published_archive" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."ii_reddit_signals" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."ii_reddit_signals" TO "authenticated";
GRANT ALL ON TABLE "public"."ii_reddit_signals" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."industry_sectors" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."industry_sectors" TO "authenticated";
GRANT ALL ON TABLE "public"."industry_sectors" TO "service_role";



GRANT ALL ON TABLE "public"."ingest_state" TO "anon";
GRANT ALL ON TABLE "public"."ingest_state" TO "authenticated";
GRANT ALL ON TABLE "public"."ingest_state" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."innovation_ecosystem" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."innovation_ecosystem" TO "authenticated";
GRANT ALL ON TABLE "public"."innovation_ecosystem" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."innovation_ecosystem_enrichment_staging" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."innovation_ecosystem_enrichment_staging" TO "authenticated";
GRANT ALL ON TABLE "public"."innovation_ecosystem_enrichment_staging" TO "service_role";



GRANT SELECT,INSERT,MAINTAIN ON TABLE "public"."intake_form_events" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."intake_form_events" TO "authenticated";
GRANT ALL ON TABLE "public"."intake_form_events" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."intake_funnel_v2" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."intake_funnel_v2" TO "authenticated";
GRANT ALL ON TABLE "public"."intake_funnel_v2" TO "service_role";



GRANT MAINTAIN ON TABLE "public"."investors" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."investors" TO "authenticated";
GRANT ALL ON TABLE "public"."investors" TO "service_role";



GRANT SELECT("id") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("name") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("description") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("investor_type") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("location") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("website") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("logo") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("sector_focus") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("stage_focus") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("check_size_min") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("check_size_max") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("basic_info") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("why_work_with_us") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("is_featured") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("created_at") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("updated_at") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("slug") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("currently_investing") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("leads_deals") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("country") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("application_url") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("fund_size") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("year_fund_closed") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("portfolio_companies") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("meta_title") ON TABLE "public"."investors" TO "anon";



GRANT SELECT("meta_description") ON TABLE "public"."investors" TO "anon";



GRANT SELECT,MAINTAIN ON TABLE "public"."investors_public" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."investors_public" TO "authenticated";
GRANT ALL ON TABLE "public"."investors_public" TO "service_role";



GRANT ALL ON TABLE "public"."kb_sync_state" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_embed_log" TO "service_role";



GRANT MAINTAIN ON TABLE "public"."lead_database_records" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."lead_database_records" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_database_records" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."lead_databases" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."lead_databases" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_databases" TO "service_role";



GRANT SELECT,INSERT,MAINTAIN ON TABLE "public"."lead_submissions" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."lead_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_submissions" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."leads" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."legacy_industry_mapping" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."legacy_industry_mapping" TO "authenticated";
GRANT ALL ON TABLE "public"."legacy_industry_mapping" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."lemlist_companies" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."lemlist_companies" TO "authenticated";
GRANT ALL ON TABLE "public"."lemlist_companies" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."lemlist_contacts" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."lemlist_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."lemlist_contacts" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."linkedin_industries" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."linkedin_industries" TO "authenticated";
GRANT ALL ON TABLE "public"."linkedin_industries" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."locations" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";



GRANT INSERT,MAINTAIN ON TABLE "public"."mentor_contact_requests" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."mentor_contact_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."mentor_contact_requests" TO "service_role";



GRANT ALL ON TABLE "public"."mes_knowledge_base" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."partner_domain_lookup" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."partner_domain_lookup" TO "authenticated";
GRANT ALL ON TABLE "public"."partner_domain_lookup" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."payment_webhook_logs" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."payment_webhook_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_webhook_logs" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."profiles" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."report_quality" TO "service_role";



GRANT ALL ON TABLE "public"."report_quality_proposals" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."report_templates" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."report_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."report_templates" TO "service_role";



GRANT ALL ON TABLE "public"."sector_vocabulary" TO "anon";
GRANT ALL ON TABLE "public"."sector_vocabulary" TO "authenticated";
GRANT ALL ON TABLE "public"."sector_vocabulary" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."service_provider_categories" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."service_provider_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."service_provider_categories" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."service_provider_contacts" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."service_provider_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."service_provider_contacts" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."service_provider_reviews" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."service_provider_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."service_provider_reviews" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."service_providers" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."service_providers" TO "authenticated";
GRANT ALL ON TABLE "public"."service_providers" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."testimonials" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."testimonials" TO "authenticated";
GRANT ALL ON TABLE "public"."testimonials" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."trade_agencies_enrichment_staging" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."trade_agencies_enrichment_staging" TO "authenticated";
GRANT ALL ON TABLE "public"."trade_agencies_enrichment_staging" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."user_intake_forms" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."user_intake_forms" TO "authenticated";
GRANT ALL ON TABLE "public"."user_intake_forms" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."user_reports" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."user_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."user_reports" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."user_roles" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT SELECT,MAINTAIN ON TABLE "public"."user_subscriptions" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."user_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "service_role";



GRANT SELECT,INSERT,MAINTAIN ON TABLE "public"."user_usage" TO "anon";
GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "public"."user_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."user_usage" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































-- ─────────────────────────────────────────────────────────────────────────────
-- Reference-data seed: content_categories (added 2026-07-04 — fixes preview replay).
--
-- The remote-baseline dump captured this table's SCHEMA but not its ROWS. Those rows
-- exist only in prod (seeded pre-baseline). Post-baseline content migrations (e.g.
-- 20260704155252) INSERT content_items referencing these category ids, so a
-- from-scratch Supabase preview-branch replay FK-failed here (content_items_category_id_fkey)
-- even though prod was fine. Seeding the rows in the baseline satisfies the FK on every
-- fresh replay. Idempotent (ON CONFLICT DO NOTHING); prod already holds these rows and
-- never re-runs the baseline, so this is a no-op there.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.content_categories (id, name, description, icon, color, sort_order) VALUES ('8816e5be-a9f2-47ce-b82f-c353363e7215', 'Success Stories', 'Real businesses that conquered the Australian market', 'TrendingUp', 'text-green-600', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.content_categories (id, name, description, icon, color, sort_order) VALUES ('9bace3d9-8ba3-4961-a6ce-6de1d81b364b', 'Market Entry Guides', 'Step-by-step guides for entering the Australian market', 'BookOpen', 'text-blue-600', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.content_categories (id, name, description, icon, color, sort_order) VALUES ('90a582ff-ca36-4e42-a37e-8cccc2c806ce', 'Expert Interviews', 'Insights from industry leaders and market experts', 'Users', 'text-purple-600', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.content_categories (id, name, description, icon, color, sort_order) VALUES ('e836d932-ac9d-4333-a1bf-9c05faa12340', 'Legal & Compliance', 'Essential legal requirements and compliance guides', 'FileText', 'text-red-600', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.content_categories (id, name, description, icon, color, sort_order) VALUES ('862a9290-b652-4126-98eb-3ec37b6e39cd', 'Video Tutorials', 'Visual guides and walkthroughs for market entry', 'Play', 'text-orange-600', 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.content_categories (id, name, description, icon, color, sort_order) VALUES ('91408d4b-6a81-4adc-b3f8-af69ea24c2a9', 'Best Practices', 'Proven strategies and methodologies for success', 'Star', 'text-yellow-600', 6) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.content_categories (id, name, description, icon, color, sort_order) VALUES ('0563b826-2123-4627-b912-14f63e9fbfb6', 'Fintech Success', 'Financial technology companies that conquered Australia', 'TrendingUp', 'text-emerald-600', 7) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.content_categories (id, name, description, icon, color, sort_order) VALUES ('f50eb094-bde4-4b21-800f-cc1c45d9d948', 'E-commerce Giants', 'Online retail success stories in the Australian market', 'TrendingUp', 'text-blue-600', 8) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.content_categories (id, name, description, icon, color, sort_order) VALUES ('3035972f-3190-4a46-99bf-3075b9e2f880', 'Healthcare Innovation', 'Medical and health tech companies in Australia', 'TrendingUp', 'text-red-600', 9) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.content_categories (id, name, description, icon, color, sort_order) VALUES ('6a837ef6-c7b5-457c-8069-2b8da9c85716', 'Technology Market Entry', 'International technology companies entering the Australian market', 'Globe', 'text-violet-600', 10) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.content_categories (id, name, description, icon, color, sort_order) VALUES ('e1b408ed-bf02-4b29-b63b-a9a417616513', 'Australian Startup Success', 'How Australian-born tech startups scaled from zero to success', 'Rocket', '#2B7A8C', 11) ON CONFLICT (id) DO NOTHING;
