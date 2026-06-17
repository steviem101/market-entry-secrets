-- Phase 3.6: digest-only producers + the hourly digest flush cron.

-- user.signed_up
create or replace function public.emit_profile_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.log_activity('user.signed_up','info', NEW.id, null,
    nullif(trim(coalesce(NEW.first_name,'')||' '||coalesce(NEW.last_name,'')),''),
    'profiles', NEW.id, '{}'::jsonb, 'user.signed_up:'||NEW.id::text);
  return NEW;
exception when others then raise log 'emit_profile_activity failed: %', sqlerrm; return NEW;
end $$;
drop trigger if exists trg_emit_profile_activity on public.profiles;
create trigger trg_emit_profile_activity
  after insert on public.profiles
  for each row execute function public.emit_profile_activity();

-- email.captured
create or replace function public.emit_email_lead_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.log_activity('email.captured','info', null, NEW.email, null,
    'email_leads', NEW.id, jsonb_build_object('source', NEW.source),
    'email.captured:'||NEW.id::text);
  return NEW;
exception when others then raise log 'emit_email_lead_activity failed: %', sqlerrm; return NEW;
end $$;
drop trigger if exists trg_emit_email_lead_activity on public.email_leads;
create trigger trg_emit_email_lead_activity
  after insert on public.email_leads
  for each row execute function public.emit_email_lead_activity();

-- chat.started
create or replace function public.emit_chat_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.log_activity('chat.started','info', NEW.user_id, null, null,
    'ai_chat_conversations', NEW.id, jsonb_build_object('session_id', NEW.session_id),
    'chat.started:'||NEW.id::text);
  return NEW;
exception when others then raise log 'emit_chat_activity failed: %', sqlerrm; return NEW;
end $$;
drop trigger if exists trg_emit_chat_activity on public.ai_chat_conversations;
create trigger trg_emit_chat_activity
  after insert on public.ai_chat_conversations
  for each row execute function public.emit_chat_activity();

-- Hourly digest flush. The slack-notify "digest" mode also re-drives realtime events still
-- unsent after 10 minutes (silent-failure recovery).
select cron.schedule('slack-activity-digest', '0 * * * *', $job$
  select net.http_post(
    url := 'https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/slack-notify',
    headers := jsonb_build_object('Content-Type','application/json',
      'x-webhook-secret',(select decrypted_secret from vault.decrypted_secrets where name='slack_notify_webhook_secret' limit 1)),
    body := '{"mode":"digest"}'::jsonb);
$job$);
