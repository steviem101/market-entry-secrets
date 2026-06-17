-- Slack activity-notifications: billing producer + shared helpers (Phase 3.4).

-- Explicit, legacy-aware tier rank (NOT the enum ordinal — premium/concierge are interleaved).
create or replace function public.tier_rank(t public.subscription_tier)
returns int
language sql
immutable
set search_path = public
as $$
  select case t
    when 'free'       then 0
    when 'premium'    then 1   -- legacy == growth
    when 'growth'     then 1
    when 'scale'      then 2
    when 'concierge'  then 3   -- legacy == enterprise
    when 'enterprise' then 3
  end
$$;

-- Shared insert helper for every producer. Idempotent via the dedup_key unique constraint.
create or replace function public.log_activity(
  p_event_type    text,
  p_severity      text,
  p_actor_user_id uuid,
  p_actor_email   text,
  p_actor_name    text,
  p_object_type   text,
  p_object_id     uuid,
  p_metadata      jsonb,
  p_dedup_key     text
) returns void
language sql
security definer
set search_path = public
as $$
  insert into public.activity_events
    (event_type, severity, actor_user_id, actor_email, actor_name, object_type, object_id, metadata, dedup_key)
  values
    (p_event_type, p_severity, p_actor_user_id, p_actor_email, p_actor_name, p_object_type, p_object_id,
     coalesce(p_metadata, '{}'::jsonb), p_dedup_key)
  on conflict (dedup_key) do nothing
$$;

-- Billing producer: tier transitions -> subscription.created / upgraded / downgraded.
create or replace function public.emit_subscription_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_rank int;
  new_rank int;
  evt text;
  sev text;
begin
  new_rank := public.tier_rank(NEW.tier);

  if TG_OP = 'INSERT' then
    if coalesce(new_rank, 0) = 0 then
      return NEW;                              -- born free, no event
    end if;
    evt := 'subscription.created'; sev := 'revenue';
  else
    if NEW.tier is not distinct from OLD.tier then
      return NEW;                              -- tier unchanged
    end if;
    old_rank := public.tier_rank(OLD.tier);
    if new_rank = old_rank then
      return NEW;                              -- e.g. premium->growth: same business rank, no event
    elsif coalesce(old_rank, 0) = 0 then
      evt := 'subscription.created'; sev := 'revenue';   -- free -> paid
    elsif new_rank > old_rank then
      evt := 'subscription.upgraded'; sev := 'revenue';
    else
      evt := 'subscription.downgraded'; sev := 'action';
    end if;
  end if;

  perform public.log_activity(
    evt, sev, NEW.user_id, null, null,
    'user_subscriptions', NEW.id,
    jsonb_build_object(
      'from_tier', case when TG_OP = 'UPDATE' then OLD.tier::text else null end,
      'to_tier',   NEW.tier::text),
    'sub:' || coalesce(NEW.user_id::text, 'null') || ':' || NEW.tier::text || ':' ||
      extract(epoch from coalesce(NEW.updated_at, now()))::bigint
  );
  return NEW;
exception when others then
  raise log 'emit_subscription_activity failed: %', sqlerrm;
  return NEW;
end;
$$;

drop trigger if exists trg_emit_subscription_activity on public.user_subscriptions;
create trigger trg_emit_subscription_activity
  after insert or update on public.user_subscriptions
  for each row execute function public.emit_subscription_activity();
