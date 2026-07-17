-- Rate-limiter durability (wave-review #5 TOCTOU + #F unbounded growth).
--
-- checkRateLimit (_shared/rateLimit.ts) did a non-atomic SELECT count → INSERT,
-- so a concurrent burst from one key could all read the pre-insert count and
-- slip past the cap (TOCTOU). And nothing ever pruned edge_function_rate_limits,
-- so it grew unbounded. This migration adds:
--   1. consume_rate_limit(key, fn, max, window) — an ATOMIC count-and-record
--      guarded by a per-key advisory xact lock, so concurrent calls for the same
--      subject serialise and the cap holds. Returns true=allowed, false=limited.
--   2. cleanup_edge_function_rate_limits() + a 15-min pg_cron sweep that deletes
--      rows older than 1 hour (the window is 1 minute, so 1h is ample retention).
--
-- Additive + idempotent (CREATE OR REPLACE, guarded cron). No table/column change,
-- no data rewrite. service_role-only execute on the consume RPC (edge functions
-- call it with the service key); the cleanup fn is invoked only by cron.

-- ── 1. Atomic consume ──────────────────────────────────────────────────
create or replace function public.consume_rate_limit(
  p_user_id uuid,
  p_function_name text,
  p_max integer,
  p_window_min integer
) returns boolean language plpgsql security definer set search_path to 'public' as $$
declare v_count integer;
begin
  -- Serialise concurrent checks for the same (function, subject) so the
  -- count+insert is atomic — closes the TOCTOU where a burst all read the
  -- pre-insert count. Transaction-scoped: released at commit/rollback.
  perform pg_advisory_xact_lock(hashtextextended(p_function_name || ':' || p_user_id::text, 0));

  select count(*) into v_count
    from public.edge_function_rate_limits
    where user_id = p_user_id
      and function_name = p_function_name
      and invoked_at >= now() - make_interval(mins => p_window_min);

  if v_count >= p_max then
    return false; -- limited: do NOT record (throttled calls cost nothing)
  end if;

  insert into public.edge_function_rate_limits (user_id, function_name)
    values (p_user_id, p_function_name);
  return true; -- allowed
end $$;

revoke all on function public.consume_rate_limit(uuid, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(uuid, text, integer, integer) to service_role;

comment on function public.consume_rate_limit(uuid, text, integer, integer) is
  'Atomic per-key rate-limit check+record for edge functions (wave-review #5). Advisory-locked so concurrent calls for one subject serialise. Returns true=allowed, false=limited. service_role-only.';

-- ── 2. Retention sweep ─────────────────────────────────────────────────
create or replace function public.cleanup_edge_function_rate_limits()
returns void language sql security definer set search_path to 'public' as $$
  delete from public.edge_function_rate_limits
   where invoked_at < now() - interval '1 hour';
$$;

revoke all on function public.cleanup_edge_function_rate_limits() from public, anon, authenticated;
grant execute on function public.cleanup_edge_function_rate_limits() to service_role;

-- Schedule the sweep every 15 minutes. Guarded to no-op where pg_cron isn't
-- installed (preview branches), idempotent (re-schedules by job name). Mirrors
-- the existing cron migrations (stripe-webhook-reconcile / Phase 5 loops).
-- Reversible: `select cron.unschedule('cleanup-rate-limits');`.
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron not installed; skipping cleanup-rate-limits cron schedule';
    return;
  end if;
  if exists (select 1 from cron.job where jobname = 'cleanup-rate-limits') then
    perform cron.unschedule('cleanup-rate-limits');
  end if;
  perform cron.schedule(
    'cleanup-rate-limits',
    '*/15 * * * *',
    $job$select public.cleanup_edge_function_rate_limits()$job$
  );
end $$;
