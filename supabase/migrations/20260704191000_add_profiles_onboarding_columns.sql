-- Add the onboarding columns OnboardingDialog has always written but the live
-- profiles table never had (their original migrations were stranded pre-
-- baseline — found during MES-33m, logged in AUTH-JOURNEY-AUDIT.md §8.3a).
--
-- Live-schema check (information_schema, 2026-07-04): profiles has only
-- id, first_name, last_name, username, avatar_url, bio, website, location,
-- created_at, updated_at, stripe_customer_id, is_email_subscribed.
--
-- Current prod behaviour without these columns:
--   * profile.onboarding_completed is undefined, so AuthContext's strict
--     `=== false` check means the dialog NEVER opens; and
--   * if it did, the upsert would 400 (unknown columns).
-- Decision: add the columns (keep the shipped feature) rather than delete the
-- dialog. Existing users are grandfathered below so a blocking onboarding
-- modal doesn't suddenly appear for the whole install base — only signups
-- created after this migration see it.
--
-- Writability: the client writes these via updateProfile (owner RLS policy +
-- table-level UPDATE grant retained by the SEC-02 lockdown), so no new grants
-- are needed. stripe_customer_id stays protected by the SEC-05 trigger.

alter table public.profiles
  add column if not exists company_name text,
  add column if not exists country text,
  add column if not exists target_market text,
  add column if not exists use_case text,
  add column if not exists onboarding_completed boolean not null default false;

-- Grandfather everyone who signed up before the feature could work.
update public.profiles set onboarding_completed = true;
