-- MES-208: mentor_anon_copy_drafts — the review queue for AI-generated anonymous
-- mentor copy.
--
-- The admin-mentor-anon-copy edge function (requireAdmin + service role) generates
-- identity-safe copy drafts (alias, headline, company label, bio) for anonymised
-- mentors, grounded strictly in the mentor's stored record. Drafts land here for
-- admin review in /admin/mentors; approval writes the existing
-- community_members.anonymous_* columns via the admin-mentor-anonymity function —
-- this table never feeds a public surface, so the community_members_public mask
-- (MES-106) is untouched.
--
--   • claims:     [{ claim, source }] — each factual claim mapped to the record
--                 field it came from, for one-glance anti-hallucination review.
--   • leak_flags: [{ field, term }] — server-side identity-leak lint hits
--                 (real name / company / experience-tile company tokens).
--   • status:     draft → approved | rejected; flagged = stored with unresolved
--                 leak hits (never auto-fillable without the admin seeing them).
--
-- Mirrors the directory_steward_staging RLS/grant shape (SEC-01): RLS on, default
-- grants stripped, admin-read, service-role-write. Additive + reversible (drop the
-- table). Inert until the edge function writes to it.

create table if not exists public.mentor_anon_copy_drafts (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.community_members(id) on delete cascade,
  alias text,
  headline text,
  company_label text,
  bio text,
  best_for text,                            -- the "Best for …" sentence (also embedded in bio)
  claims jsonb not null default '[]'::jsonb,
  leak_flags jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'flagged', 'approved', 'rejected')),
  model text,
  generated_at timestamptz not null default now(),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.mentor_anon_copy_drafts is
  'MES-208: AI-generated anonymous mentor copy awaiting admin review. Never publicly readable; approval publishes via community_members.anonymous_* columns (admin-mentor-anonymity function), not from this table.';

-- One pending (draft/flagged) row per mentor — regeneration updates it in place;
-- resolved rows (approved/rejected) are history and unconstrained.
create unique index if not exists uq_mentor_anon_copy_pending
  on public.mentor_anon_copy_drafts (mentor_id)
  where status in ('draft', 'flagged');

create index if not exists idx_mentor_anon_copy_mentor
  on public.mentor_anon_copy_drafts (mentor_id, created_at desc);

alter table public.mentor_anon_copy_drafts enable row level security;
revoke all on table public.mentor_anon_copy_drafts from anon, authenticated;
grant select on table public.mentor_anon_copy_drafts to authenticated;

drop policy if exists "Admins can read mentor anon copy drafts" on public.mentor_anon_copy_drafts;
create policy "Admins can read mentor anon copy drafts"
  on public.mentor_anon_copy_drafts for select
  using (public.has_role((select auth.uid()), 'admin'::public.app_role));
