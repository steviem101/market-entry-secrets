-- MES-188 T9 — concierge intro requests + server-side D4-cap enforcement.
--
-- Paid tiers grant a fixed, expiring allowance of human-facilitated introductions
-- (D4: Growth 1 mentor + 3 ecosystem, Scale 2 mentors + priority; 30-day window),
-- held as service_entitlements rows (kind = mentor_intro | ecosystem_intro) with
-- granted_count / consumed_count and a CHECK consumed_count <= granted_count
-- (migration 20260716140000). This migration adds the request→fulfil flow and the
-- SERVER-SIDE enforcement so a member can never consume more intros than granted.
--
-- Two enforcement points:
--   1. Request-time capacity (BEFORE INSERT trigger): reserve against open
--      requests so a member can't file more open asks than they hold credits —
--      WITHOUT consuming (consume-on-fulfilment). Prevents over-requesting.
--   2. Consumption (fulfil_concierge_intro RPC): the ONLY writer of consumed_count.
--      Atomic increment guarded on remaining>0 + not-expired + kind/owner match;
--      the CHECK constraint is the final backstop. Admin-only, SECURITY DEFINER.
--
-- SECURITY (approval-gated — signed off in-session 2026-07-17):
--   * concierge_intro_requests: owner-insert-own / owner+admin-select / admin-update,
--     column-grant locked (no self-set status/entitlement_id/admin_notes; admin_notes
--     never client-readable) — mirrors lead_list_requests (20260710160000).
--   * service_entitlements stays service-role-write-only; the fulfil RPC is
--     SECURITY DEFINER (bypasses RLS) with an in-body has_role(admin) gate, so no
--     client write grant is added to the ledger.
--
-- Additive + idempotent: CREATE ... IF NOT EXISTS / OR REPLACE / DROP ... IF EXISTS
-- throughout; safe to replay against an empty preview DB. No data rewrite, no
-- destructive op. Client surface ships dark behind the `concierge_intros` flag.

-- ── Table ──────────────────────────────────────────────────────────────
create table if not exists public.concierge_intro_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_id uuid references public.user_reports(id) on delete set null,
  -- Which allowance this draws from; matches the service_entitlements.kind set.
  intro_kind text not null check (intro_kind in ('mentor_intro','ecosystem_intro')),
  -- The directory entity the member wants introduced to (community_members /
  -- innovation_ecosystem). Kept as loose type+id (no FK) so a later directory
  -- reshuffle never blocks a member's request; the admin resolves it on fulfil.
  target_entity_type text check (target_entity_type in ('mentor','ecosystem')),
  target_entity_id uuid,
  request_text text,
  status text not null default 'new' check (status in ('new','in_progress','delivered','declined')),
  -- The entitlement row consumed on delivery (set by fulfil_concierge_intro).
  entitlement_id uuid references public.service_entitlements(id) on delete set null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.concierge_intro_requests is
  'MES-188 T9: member requests for a human-facilitated mentor/ecosystem intro, drawn from service_entitlements allowances. Owner-insert/select, admin-fulfil. consumed_count is written ONLY by fulfil_concierge_intro (SECURITY DEFINER, admin-gated).';

create index if not exists idx_concierge_intro_requests_user on public.concierge_intro_requests(user_id);
-- admin queue: open (not yet delivered/declined) requests.
create index if not exists idx_concierge_intro_requests_open on public.concierge_intro_requests(status)
  where status in ('new','in_progress');

-- updated_at maintenance (dedicated fn; mirrors the per-table pattern).
create or replace function public.update_concierge_intro_requests_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists tr_concierge_intro_requests_updated_at on public.concierge_intro_requests;
create trigger tr_concierge_intro_requests_updated_at before update on public.concierge_intro_requests
  for each row execute function public.update_concierge_intro_requests_updated_at();

-- ── Request-time capacity gate (soft reserve, no consume) ──────────────
-- Blocks an INSERT when the member has no remaining allowance of that kind, where
-- remaining = sum(granted-consumed over non-expired rows) − open requests of that
-- kind. Open requests reserve capacity so a member with 1 credit can hold at most
-- 1 open ask; consumed_count itself only moves at fulfilment. SECURITY DEFINER so
-- it can read the service-role-only ledger; search_path pinned.
create or replace function public.check_concierge_intro_capacity()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare v_credits int; v_open int;
begin
  select coalesce(sum(greatest(granted_count - consumed_count, 0)), 0)
    into v_credits
    from public.service_entitlements
    where user_id = NEW.user_id and kind = NEW.intro_kind
      and (expires_at is null or expires_at > now());

  select count(*) into v_open
    from public.concierge_intro_requests
    where user_id = NEW.user_id and intro_kind = NEW.intro_kind
      and status in ('new','in_progress');

  if v_credits - v_open <= 0 then
    raise exception 'no_available_intro_credit'
      using errcode = 'check_violation',
            hint = 'This introduction allowance is used up or expired.';
  end if;
  return NEW;
end $$;
drop trigger if exists tr_concierge_intro_capacity on public.concierge_intro_requests;
create trigger tr_concierge_intro_capacity before insert on public.concierge_intro_requests
  for each row execute function public.check_concierge_intro_capacity();

-- ── RLS ────────────────────────────────────────────────────────────────
alter table public.concierge_intro_requests enable row level security;

-- Owner files their OWN request (no anon — tied to a signed-in user).
drop policy if exists "owner can create own concierge intro request" on public.concierge_intro_requests;
create policy "owner can create own concierge intro request" on public.concierge_intro_requests
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Owner sees their own; admin sees all.
drop policy if exists "owner or admin can view concierge intro requests" on public.concierge_intro_requests;
create policy "owner or admin can view concierge intro requests" on public.concierge_intro_requests
  for select to authenticated
  using ((select auth.uid()) = user_id
         or public.has_role((select auth.uid()), 'admin'::public.app_role));

-- Only admins update (triage status / admin_notes); consumption still goes through
-- the fulfil RPC, not a raw UPDATE, so the ledger stays atomic.
drop policy if exists "admin can update concierge intro requests" on public.concierge_intro_requests;
create policy "admin can update concierge intro requests" on public.concierge_intro_requests
  for update to authenticated
  using (public.has_role((select auth.uid()), 'admin'::public.app_role))
  with check (public.has_role((select auth.uid()), 'admin'::public.app_role));

-- SEC-01 grant lockdown: authenticated only (RLS scopes each op); never anon; no
-- client DELETE. COLUMN-LEVEL grants:
--   * INSERT only the request fields — owner can't self-set status / entitlement_id
--     / admin_notes (they default: status 'new', the rest null).
--   * SELECT everything EXCEPT admin_notes (internal admin triage; service-role-only).
revoke all on public.concierge_intro_requests from anon, authenticated;
grant insert (user_id, report_id, intro_kind, target_entity_type, target_entity_id, request_text)
  on public.concierge_intro_requests to authenticated;
grant select (id, user_id, report_id, intro_kind, target_entity_type, target_entity_id,
              request_text, status, entitlement_id, created_at, updated_at)
  on public.concierge_intro_requests to authenticated;
grant update on public.concierge_intro_requests to authenticated;

-- ── Consumption RPC (the D4-cap enforcement point) ─────────────────────
-- Admin marks an intro delivered, atomically consuming one credit. SECURITY
-- DEFINER (writes the service-role-only ledger) with an in-body admin gate. The
-- guarded UPDATE consumes only if the entitlement belongs to the request owner,
-- matches the request kind, has remaining, and isn't expired — 0 rows ⇒ raise.
create or replace function public.fulfil_concierge_intro(
  p_request_id uuid,
  p_entitlement_id uuid,
  p_admin_notes text default null
) returns void language plpgsql security definer set search_path to 'public' as $$
declare v_owner uuid; v_kind text; v_status text; v_updated int;
begin
  if not public.has_role((select auth.uid()), 'admin'::public.app_role) then
    raise exception 'not_authorized' using errcode = 'insufficient_privilege';
  end if;

  select user_id, intro_kind, status into v_owner, v_kind, v_status
    from public.concierge_intro_requests where id = p_request_id for update;
  if not found then raise exception 'request_not_found'; end if;
  if v_status = 'delivered' then raise exception 'already_delivered'; end if;

  update public.service_entitlements
     set consumed_count = consumed_count + 1
   where id = p_entitlement_id and user_id = v_owner and kind = v_kind
     and consumed_count < granted_count
     and (expires_at is null or expires_at > now());
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'no_available_credit_or_expired' using errcode = 'check_violation';
  end if;

  update public.concierge_intro_requests
     set status = 'delivered',
         entitlement_id = p_entitlement_id,
         admin_notes = coalesce(p_admin_notes, admin_notes),
         updated_at = now()
   where id = p_request_id;
end $$;

revoke all on function public.fulfil_concierge_intro(uuid, uuid, text) from public, anon;
grant execute on function public.fulfil_concierge_intro(uuid, uuid, text) to authenticated, service_role;

-- ── Slack producer (activity bus) ──────────────────────────────────────
-- Emit an activity_events row on each new request. Mirrors emit_lead_list_request_
-- activity. PII-safe: request text clipped; no raw email in the metadata body.
create or replace function public.emit_concierge_intro_request_activity()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare u_email text; u_name text;
begin
  select email, raw_user_meta_data->>'full_name' into u_email, u_name
  from auth.users where id = NEW.user_id;
  perform public.log_activity(
    'concierge_intro.requested', 'action',
    NEW.user_id, u_email, u_name,
    'concierge_intro_requests', NEW.id,
    jsonb_build_object('intro_kind', NEW.intro_kind, 'target_entity_type', NEW.target_entity_type,
                       'request_text', left(coalesce(NEW.request_text, ''), 500)),
    'cir:' || NEW.id::text);
  return NEW;
exception when others then
  raise log 'emit_concierge_intro_request_activity failed: %', sqlerrm;
  return NEW;
end $$;
drop trigger if exists trg_emit_concierge_intro_request_activity on public.concierge_intro_requests;
create trigger trg_emit_concierge_intro_request_activity after insert on public.concierge_intro_requests
  for each row execute function public.emit_concierge_intro_request_activity();

-- Routing row DISABLED pending an ops channel: dispatch_activity_event skips rows
-- where enabled=false, so no Slack traffic until an operator sets channel_id and
-- flips enabled=true. Guarded insert (no dependency on a unique constraint).
insert into public.activity_event_routing (event_type, channel_id, emoji, severity, realtime, mention, enabled)
select 'concierge_intro.requested', '', ':handshake:', 'action', true, false, false
where not exists (select 1 from public.activity_event_routing where event_type = 'concierge_intro.requested');
