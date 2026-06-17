-- Hardening follow-up from code review (idempotent CREATE OR REPLACE).
--   #1  unify report.failed dedup across user_reports + user_intake_forms (one alert per failure)
--   #5  dispatch trigger fails safe when the secret/url is missing
--   #9  dispatch trigger + digest cron read the function URL from vault (no hardcoded prod URL);
--       provision the `slack_notify_url` vault secret out-of-band, same as slack_notify_webhook_secret
--   #11 email.failed fires only on explicit failure states (not any non-null error_message on a sent row)
--   #13 funnel.gate_hit no longer puts the raw session token in actor_name (kept in metadata)
--   #14 billing producer guards against unmapped/NULL tier ranks (future enum values)
-- (#7 watermark for gate_hit; #2/#3/#4/#6/#12 idempotency/backlog fixes live in the slack-notify fn.)

-- #14: billing producer guards against unmapped/NULL tier ranks.
create or replace function public.emit_subscription_activity()
returns trigger language plpgsql security definer set search_path = public as $$
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

-- #1: user_reports producer — report.failed dedup unified on the intake_form_id.
create or replace function public.emit_user_report_activity()
returns trigger language plpgsql security definer set search_path = public as $$
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
  perform public.log_activity(evt, sev, NEW.user_id, null, null, 'user_reports', NEW.id,
    jsonb_build_object('tier_at_generation', NEW.tier_at_generation, 'intake_form_id', NEW.intake_form_id, 'company', company),
    ddk);
  return NEW;
exception when others then raise log 'emit_user_report_activity failed: %', sqlerrm; return NEW;
end $$;

-- #1: user_intake_forms producer — report.failed dedup unified on the intake id.
create or replace function public.emit_intake_form_activity()
returns trigger language plpgsql security definer set search_path = public as $$
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

-- #11: email.failed only on explicit failure states.
create or replace function public.emit_email_log_activity()
returns trigger language plpgsql security definer set search_path = public as $$
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

-- #7 + #13: gate_hit scans only recently-active sessions (bounded); session_id stays in metadata.
create or replace function public.detect_funnel_gate_hits()
returns integer language plpgsql security definer set search_path = public as $$
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

-- #5 + #9: dispatch trigger reads the function URL from vault and fails safe if secret/url missing.
create or replace function public.dispatch_activity_event()
returns trigger language plpgsql security definer set search_path = public as $$
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
    body := jsonb_build_object('event_id', NEW.id));
  return NEW;
exception when others then raise log 'dispatch_activity_event failed for %: %', NEW.id, sqlerrm; return NEW;
end $$;

-- #9: digest cron reads URL from vault too (cron.schedule by name = upsert).
do $cron$ begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('slack-activity-digest', '0 * * * *', $job$
      select net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name = 'slack_notify_url' limit 1),
        headers := jsonb_build_object('Content-Type','application/json',
          'x-webhook-secret',(select decrypted_secret from vault.decrypted_secrets where name = 'slack_notify_webhook_secret' limit 1)),
        body := '{"mode":"digest"}'::jsonb);
    $job$);
  end if;
end $cron$;
