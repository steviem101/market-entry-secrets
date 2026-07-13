-- MES-148 Phase 5 (P5-2): directory freshness foundation.
--
-- Adds a uniform freshness surface to the core directory tables so the Phase 5
-- steward (P5-3) can record when a row was last re-verified and how healthy it is,
-- and so matching can prefer fresh rows. Additive + nullable — no behaviour change
-- on its own:
--   • last_verified  — when the row's source was last confirmed accurate (backfilled
--                      from the existing updated_at so nothing reads as never-verified).
--   • data_health    — 0–100 health score the steward computes (URL reachability,
--                      completeness, staleness). NULL = not yet scored; the matcher's
--                      freshness signal (matchScoring) treats NULL as neutral, so this
--                      is inert until the steward populates it AND FRESHNESS_RANKING_ENABLED
--                      is turned on.
--
-- events (confidence / data_quality_flags / normalized_at) and
-- trade_investment_agencies (last_updated_at / needs_re_research) already carry
-- partial freshness signals; this unifies the surface across the advisory/supply
-- directories the report matcher ranks. Reversible (drop the columns).

alter table public.service_providers        add column if not exists last_verified timestamptz;
alter table public.service_providers        add column if not exists data_health smallint;
alter table public.community_members         add column if not exists last_verified timestamptz;
alter table public.community_members         add column if not exists data_health smallint;
alter table public.investors                 add column if not exists last_verified timestamptz;
alter table public.investors                 add column if not exists data_health smallint;
alter table public.innovation_ecosystem      add column if not exists last_verified timestamptz;
alter table public.innovation_ecosystem      add column if not exists data_health smallint;
alter table public.trade_investment_agencies add column if not exists last_verified timestamptz;
alter table public.trade_investment_agencies add column if not exists data_health smallint;

comment on column public.service_providers.data_health is
  'MES-148 Phase 5: 0–100 steward-computed data health (NULL = not yet scored). Matching treats NULL as neutral.';

-- Backfill last_verified from the best existing freshness timestamp so no live row
-- reads as never-verified. Idempotent (only fills NULLs). data_health stays NULL
-- until the steward scores each row.
update public.service_providers        set last_verified = coalesce(updated_at, created_at)      where last_verified is null;
update public.community_members         set last_verified = coalesce(updated_at, created_at)      where last_verified is null;
update public.investors                 set last_verified = coalesce(updated_at, created_at)      where last_verified is null;
update public.innovation_ecosystem      set last_verified = coalesce(updated_at, created_at)      where last_verified is null;
update public.trade_investment_agencies set last_verified = coalesce(last_updated_at, created_at) where last_verified is null;

-- Partial indexes to let the steward cheaply find the stalest rows to re-verify
-- (oldest last_verified first), per directory.
create index if not exists idx_service_providers_last_verified        on public.service_providers (last_verified);
create index if not exists idx_community_members_last_verified         on public.community_members (last_verified);
create index if not exists idx_investors_last_verified                 on public.investors (last_verified);
create index if not exists idx_innovation_ecosystem_last_verified      on public.innovation_ecosystem (last_verified);
create index if not exists idx_trade_investment_agencies_last_verified on public.trade_investment_agencies (last_verified);
