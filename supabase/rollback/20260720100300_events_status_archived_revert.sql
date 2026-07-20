-- Revert 20260720100300_events_status_archived.sql
-- Safe only when no events row has status='archived' (re-add would otherwise fail).
alter table public.events drop constraint if exists events_status_check;
alter table public.events add constraint events_status_check
  check (status = any (array['pending'::text, 'approved'::text, 'rejected'::text, 'needs_review'::text]));
