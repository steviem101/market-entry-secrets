-- Bump the pg_net timeout on the realtime activity dispatch so it records the real HTTP
-- status instead of a misleading client-side timeout.
--
-- dispatch_activity_event() fires net.http_post() to the slack-notify edge function. The
-- report.quality path inside that function runs an LLM "substance" judge (Gemini, up to 30s)
-- before responding, so a request routinely takes 5-12s. pg_net's DEFAULT timeout is 5000ms,
-- so every report.quality dispatch logged "Timeout of 5000 ms reached" in net._http_response
-- even though the edge function completed server-side and posted the card. That false-negative
-- is confusing when debugging the brand-new report-quality feature. 15s comfortably covers a
-- warm judge call; the post still happens regardless because the function runs independently
-- of the pg_net client wait. (net.http_post is async — this does not block the producer INSERT.)
create or replace function public.dispatch_activity_event()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
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
end $function$;
