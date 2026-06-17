-- Slack activity-notifications: realtime dispatch trigger (Phase 3.3).
-- AFTER INSERT on activity_events -> calls slack-notify via pg_net, but only when the
-- matching routing row is enabled AND realtime. info/non-realtime events are left for the
-- digest cron. SECURITY DEFINER (owner=postgres) to read the vault secret; exception-safe so
-- a notification failure can never roll back the producer's business transaction.

create or replace function public.dispatch_activity_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.activity_event_routing;
  secret text;
begin
  select * into r from public.activity_event_routing where event_type = NEW.event_type;
  if not found or not r.enabled or not r.realtime then
    return NEW;
  end if;

  select decrypted_secret into secret
  from vault.decrypted_secrets
  where name = 'slack_notify_webhook_secret'
  limit 1;

  perform net.http_post(
    url := 'https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/slack-notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', secret),
    body := jsonb_build_object('event_id', NEW.id)
  );
  return NEW;
exception when others then
  raise log 'dispatch_activity_event failed for %: %', NEW.id, sqlerrm;
  return NEW;
end;
$$;

drop trigger if exists trg_dispatch_activity_event on public.activity_events;
create trigger trg_dispatch_activity_event
  after insert on public.activity_events
  for each row execute function public.dispatch_activity_event();
