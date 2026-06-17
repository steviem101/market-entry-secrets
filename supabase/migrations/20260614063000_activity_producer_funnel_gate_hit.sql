-- Phase 3.7: derived funnel.gate_hit producer.
-- READ-ONLY over user_usage (aggregate scan only; no writes, no per-row load on the hot path).
-- Idempotent: dedup_key = 'funnel.gate_hit:'||session_id, so each session emits at most once ever.
create or replace function public.detect_funnel_gate_hits()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare inserted_count integer;
begin
  with crossed as (
    select u.session_id,
           count(distinct coalesce(u.content_type,'') || ':' || coalesce(u.item_id,'')) as distinct_views
    from public.user_usage u
    where u.session_id is not null
    group by u.session_id
    having count(distinct coalesce(u.content_type,'') || ':' || coalesce(u.item_id,'')) >= 3
  ),
  ins as (
    insert into public.activity_events (event_type, severity, actor_name, object_type, metadata, dedup_key)
    select 'funnel.gate_hit', 'info', c.session_id, 'user_usage',
           jsonb_build_object('session_id', c.session_id, 'distinct_views', c.distinct_views),
           'funnel.gate_hit:'||c.session_id
    from crossed c
    on conflict (dedup_key) do nothing
    returning 1
  )
  select count(*) into inserted_count from ins;
  return inserted_count;
end;
$$;

-- Run 10 minutes before the digest so new gate-hits are included in it.
do $cron$ begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('detect-funnel-gate-hits', '50 * * * *', $job$ select public.detect_funnel_gate_hits(); $job$);
  end if;
end $cron$;
