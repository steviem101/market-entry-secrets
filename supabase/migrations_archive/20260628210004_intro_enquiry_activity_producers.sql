-- Producer triggers: directory contact funnels -> activity_events (Slack bus).
--
-- Emits events that the existing slack-notify pipeline routes to #mes-ops:
--   mentor_contact_requests INSERT  -> intro.requested
--   directory_submissions   INSERT  -> intro.requested (intro CTAs) | submission.received
--   lead_submissions        INSERT  -> lead.submitted
--
-- Routing rows for these event_types are already seeded (and remain enabled=false
-- until ops cutover), so this migration only wires the producers — no posting yet.
-- All functions are SECURITY DEFINER (emit on behalf of anon funnel inserts) and
-- swallow their own errors so a telemetry failure never blocks the funnel insert.

-- 1. Mentor contact requests -> intro.requested
create or replace function public.emit_mentor_intro_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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

-- 2. Directory submissions -> intro.requested (intro CTAs) | submission.received
create or replace function public.emit_directory_submission_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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

-- 3. Lead submissions -> lead.submitted
create or replace function public.emit_lead_submission_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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

-- Attach triggers (guarded so the migration is a no-op where a table is absent).
do $guard$ begin
  if to_regclass('public.mentor_contact_requests') is not null then
    drop trigger if exists trg_emit_mentor_intro_activity on public.mentor_contact_requests;
    create trigger trg_emit_mentor_intro_activity
      after insert on public.mentor_contact_requests
      for each row execute function public.emit_mentor_intro_activity();
  end if;

  if to_regclass('public.directory_submissions') is not null then
    drop trigger if exists trg_emit_directory_submission_activity on public.directory_submissions;
    create trigger trg_emit_directory_submission_activity
      after insert on public.directory_submissions
      for each row execute function public.emit_directory_submission_activity();
  end if;

  if to_regclass('public.lead_submissions') is not null then
    drop trigger if exists trg_emit_lead_submission_activity on public.lead_submissions;
    create trigger trg_emit_lead_submission_activity
      after insert on public.lead_submissions
      for each row execute function public.emit_lead_submission_activity();
  end if;
end $guard$;
