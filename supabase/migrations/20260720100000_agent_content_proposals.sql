-- MES agent loops (Workstream A): agent_content_proposals — the canonical, single-shape
-- proposals table for the content-refresh loop (loop-content-refresh).
--
-- The existing per-loop staging tables (directory_steward_staging, report_quality_proposals,
-- ecosystem_import_candidates, ...) keep their bespoke shapes and apply paths; the unified
-- read surface is the agent_proposals view (20260720100200). This table is the ONE place the
-- new content-refresh loop writes, and the only source the apply-proposal edge function
-- mutates production from.
--
-- Loops propose, never act: rows land here as 'pending' (or 'auto_approved' for whitelisted
-- low-risk action types). Nothing touches a production row until apply-proposal applies it and
-- stamps applied_at. Mirrors the directory_steward_staging RLS/grant shape (SEC-01): RLS on,
-- default write grants stripped, admin-read, service-role-write. Additive + reversible.
-- Rollback: supabase/rollback/20260720100000_agent_content_proposals_revert.sql

create table if not exists public.agent_content_proposals (
  id uuid primary key default gen_random_uuid(),
  run_id uuid,                                    -- soft ref to automation_runs.id (matches staging-table convention)
  loop_name text not null default 'content-refresh',
  action_type text not null check (action_type in (
    'archive_event', 'flag_dead_link', 'set_logo_url', 'queue_enrichment',
    'trigger_reembed', 'remove_kb_row', 'flag_stale_content'
  )),
  target_table text,                              -- e.g. 'events', 'service_providers', 'mes_knowledge_base'
  target_id uuid,                                 -- the production row this proposal concerns (null for batch actions)
  payload jsonb not null default '{}'::jsonb,     -- action-specific data (e.g. { logo_url, logo_field } or { kb_ids })
  reason text not null,                           -- human-readable why (shown in dashboard + Slack)
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  status text not null default 'pending' check (status in (
    'pending', 'approved', 'rejected', 'auto_approved', 'applied', 'apply_failed'
  )),
  dedup_key text,                                 -- stable per (target, action) so a weekly re-scan upserts, not floods
  reviewed_by uuid,
  reviewed_at timestamptz,
  applied_at timestamptz,
  apply_error text,
  created_at timestamptz not null default now()
);

comment on table public.agent_content_proposals is
  'MES agent loops: canonical proposals from loop-content-refresh. Rows are proposals only '
  '(pending/auto_approved) until apply-proposal applies them (applied/apply_failed). Never client-writable.';

-- At most one OPEN proposal per dedup_key (covers pending/approved/auto_approved), so a weekly
-- re-scan cannot stage a duplicate for a target that already has an unresolved proposal.
-- Resolved rows (rejected/applied/apply_failed) are unconstrained history.
create unique index if not exists uq_agent_content_open_per_dedup
  on public.agent_content_proposals (dedup_key)
  where status in ('pending', 'approved', 'auto_approved') and dedup_key is not null;

-- Dashboard queue + per-run rollups (mirrors the ticket's (status, loop_name) and (run_id) indexes).
create index if not exists idx_agent_content_status_loop on public.agent_content_proposals (status, loop_name, created_at);
create index if not exists idx_agent_content_run on public.agent_content_proposals (run_id);

alter table public.agent_content_proposals enable row level security;
revoke all on table public.agent_content_proposals from anon, authenticated;
grant select on table public.agent_content_proposals to authenticated;

drop policy if exists "Admins read agent_content_proposals" on public.agent_content_proposals;
create policy "Admins read agent_content_proposals"
  on public.agent_content_proposals for select
  using (public.has_role((select auth.uid()), 'admin'::public.app_role));
