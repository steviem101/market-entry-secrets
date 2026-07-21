-- MES agent loops (Workstream B): allow events.status = 'archived'.
--
-- The content-refresh loop's archive_event action moves a past-dated event out of every live
-- surface. Those surfaces already gate on status = 'approved' (directory listings, the sitemap,
-- mes-context), so an 'archived' event is excluded automatically without touching read code.
--
-- Additive + reversible: extends the CHECK with one new allowed value; drops nothing and rewrites
-- no data. Rollback re-adds the pre-existing 4-value CHECK (safe only once no row is 'archived').
-- Rollback: supabase/rollback/20260720100300_events_status_archived_revert.sql

alter table public.events drop constraint if exists events_status_check;
alter table public.events add constraint events_status_check
  check (status = any (array['pending'::text, 'approved'::text, 'rejected'::text, 'needs_review'::text, 'archived'::text]));

comment on constraint events_status_check on public.events is
  'Adds ''archived'' (MES agent loops content-refresh archive_event). Live surfaces gate on '
  '''approved'', so archived events drop out of listings/sitemap/mes-context automatically.';
