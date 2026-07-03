-- ecosystem_import_candidates — staging/review queue for community-sourced
-- ecosystem imports (first batch: the Startmate community sheet,
-- docs/data-analysis/startmate-ecosystem-sheet-analysis.md §5).
-- Pattern follows report_quality_proposals / events_staging: RLS on,
-- zero anon/authenticated grants, inserts are service-role only, admin
-- review via SQL/MCP (a future admin UI would add a scoped GRANT).
-- Additive only; rollback in supabase/rollback/.

create table if not exists public.ecosystem_import_candidates (
  id                   uuid primary key default gen_random_uuid(),
  batch_id             text not null,              -- e.g. 'startmate-2026-07'
  source_name          text not null,              -- 'startmate_community_sheet'
  source_url           text,
  source_tab           text not null,
  source_rows          integer[] not null default '{}', -- sheet row numbers (campus groups span several)
  raw                  jsonb not null,             -- verbatim sheet row(s), auditability
  entity_type          text not null check (entity_type in (
    'investor_fund','investor_person','accelerator','coworking_space',
    'newsletter','podcast','student_society','workshop_host')),
  proposed_destination text not null,              -- 'investors' | 'innovation_ecosystem' | 'content_items' | 'none'
  proposed_action      text not null check (proposed_action in (
    'insert_new',        -- no existing record found; payload is a draft row
    'enrich_existing',   -- same-destination match; payload fills NULL fields only
    'related_review',    -- cross-table or fuzzy/institutional-domain match; human decides
    'content_guide',     -- source material for a curated content_items guide
    'review',            -- ambiguous (e.g. fund-less VC person); human classifies
    'exclude')),         -- recommended exclusion, staged for visibility
  proposed_payload     jsonb not null default '{}'::jsonb,
  dedupe_key           text not null,
  matched_existing_id  uuid,                       -- match in the destination (or related) table
  matched_table        text,
  match_method         text,                       -- domain | linkedin | alias | norm_name | fuzzy
  match_note           text,
  confidence           text not null check (confidence in ('high','medium','low')),
  validation_flags     text[] not null default '{}',
  verification         jsonb not null default '{}'::jsonb, -- web-research verdict: {status, evidence, checked_facts, corrections}
  verified_at          timestamptz,                        -- when the research pass checked this candidate
  status               text not null default 'pending' check (status in (
    'pending','approved','rejected','duplicate','applied','invalid')),
  review_notes         text,
  reviewed_by          uuid,
  reviewed_at          timestamptz,
  applied_at           timestamptz,
  target_record_id     uuid,                       -- provenance: row created/updated on apply
  created_at           timestamptz not null default now(),
  unique (batch_id, dedupe_key)                    -- idempotent re-staging per batch
);

create index if not exists eic_status_entity_idx
  on public.ecosystem_import_candidates (status, entity_type);
create index if not exists eic_batch_idx
  on public.ecosystem_import_candidates (batch_id);

alter table public.ecosystem_import_candidates enable row level security;
revoke all on public.ecosystem_import_candidates from anon, authenticated;
create policy "Admins read ecosystem_import_candidates"
  on public.ecosystem_import_candidates for select
  using (public.has_role((select auth.uid()), 'admin'::public.app_role));
create policy "Admins update ecosystem_import_candidates"
  on public.ecosystem_import_candidates for update
  using (public.has_role((select auth.uid()), 'admin'::public.app_role))
  with check (public.has_role((select auth.uid()), 'admin'::public.app_role));

comment on table public.ecosystem_import_candidates is
  'Staging/review queue for community-sourced ecosystem imports (Startmate sheet et al). Inserts service-role only; admin review flips status; apply step writes to live tables and stamps target_record_id. Rollback per batch: DELETE WHERE batch_id = <batch>.';
comment on column public.ecosystem_import_candidates.proposed_payload is
  'Normalized draft for the destination table (insert_new) or NULL-fill enrichment fields (enrich_existing). Never applied automatically.';
