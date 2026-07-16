-- MES-195 (T8) — service_entitlements: the human-service credits a paid tier grants.
--
-- A tier purchase grants the tier (as today) PLUS a fixed set of human-service
-- entitlements (walkthrough call / strategy session / mentor & ecosystem intros)
-- that the servicing flow (T13/T15) draws down. This table is the ledger.
--
-- SECURITY (approval-gated — SEC-01): **service-role-write ONLY**. The Stripe
-- webhook (service role) is the only writer; there is NO client INSERT/UPDATE/
-- DELETE grant or policy, so a user can never mint their own entitlements. Owners
-- may SELECT their own rows; admins may SELECT all. Tier itself is still granted
-- only by user_subscriptions (never derived from this table or add-on metadata).
--
-- Idempotency: unique (source_purchase, kind) so a replayed checkout.session.completed
-- webhook (the webhook does `on conflict do nothing`) can never double-grant.
-- Additive + reversible (drop the table); entitlement WRITES are additionally
-- gated in the webhook by the ENTITLEMENTS_ENABLED flag for staged rollout.

create table if not exists public.service_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  -- Stripe checkout session id that granted this row — the idempotency key + audit trail.
  source_purchase text,
  tier text not null,
  kind text not null check (kind in (
    'walkthrough_call', 'strategy_session', 'mentor_intro', 'ecosystem_intro'
  )),
  granted_count integer not null default 0 check (granted_count >= 0),
  consumed_count integer not null default 0 check (consumed_count >= 0 and consumed_count <= granted_count),
  -- Entitlements lapse 30 days after purchase (D4).
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  -- One row per (purchase, kind): a webhook replay hits this and no-ops.
  unique (source_purchase, kind)
);

comment on table public.service_entitlements is
  'MES-195 (T8): human-service credits granted by a paid tier (calls/intros). Service-role-write only; owner/admin SELECT. Written only by stripe-webhook, idempotent on (source_purchase, kind).';

-- Owner-read policy needs this; also the servicing UI lists a user''s entitlements.
create index if not exists idx_service_entitlements_user on public.service_entitlements (user_id);

alter table public.service_entitlements enable row level security;

-- SEC-01: strip the default broad grants; hand back SELECT only (RLS-scoped).
-- No INSERT/UPDATE/DELETE grant → clients cannot write; the service role bypasses RLS.
revoke all on table public.service_entitlements from anon, authenticated;
grant select on table public.service_entitlements to authenticated;

drop policy if exists "Owners read their own entitlements" on public.service_entitlements;
create policy "Owners read their own entitlements"
  on public.service_entitlements for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Admins read all entitlements" on public.service_entitlements;
create policy "Admins read all entitlements"
  on public.service_entitlements for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'::app_role));
