-- Allow 'investor' as a directory_submissions.submission_type so investor
-- warm-intro requests can be captured through the same public funnel. Additive
-- only — existing allowed values are preserved.
alter table public.directory_submissions drop constraint if exists valid_submission_type;
alter table public.directory_submissions add constraint valid_submission_type
  check (submission_type = any (array[
    'mentor','service_provider','trade_agency','innovation_organization',
    'investor','event','content','data_request'
  ]));
