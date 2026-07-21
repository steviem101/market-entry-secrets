-- Revert 20260720100300_events_status_archived.sql
-- Re-narrow any archived rows to 'rejected' first (they must not remain live), so re-adding the
-- 4-value CHECK cannot fail validation on live data.
update public.events set status = 'rejected' where status = 'archived';
alter table public.events drop constraint if exists events_status_check;
alter table public.events add constraint events_status_check
  check (status = any (array['pending'::text, 'approved'::text, 'rejected'::text, 'needs_review'::text]));
