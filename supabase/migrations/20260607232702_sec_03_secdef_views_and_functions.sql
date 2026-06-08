-- Workstream E: convert SECURITY DEFINER view to security_invoker;
-- revoke EXECUTE from anon/authenticated on SECDEF functions that should not be publicly callable;
-- set search_path on all functions flagged by mutable search_path lint.

ALTER VIEW public.agencies_report_view SET (security_invoker = true);

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_subscription() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enrol_in_onboarding_sequence() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.roll_forward_month_precision_events() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.increment_download_count(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_tier_gated_report(uuid) FROM anon, public;

ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.validate_industry_sector_values(text[]) SET search_path = public;
ALTER FUNCTION public.handle_new_user_subscription() SET search_path = public;
ALTER FUNCTION public.update_ii_content_updated_at() SET search_path = public;
ALTER FUNCTION public.match_emails(vector, double precision, integer, text, timestamp with time zone) SET search_path = public;
ALTER FUNCTION public.recent_ii_emails(integer, text, integer) SET search_path = public;
ALTER FUNCTION public.match_content(vector, double precision, integer, text, text, boolean, timestamp with time zone) SET search_path = public;
ALTER FUNCTION public.update_mentor_contact_requests_updated_at() SET search_path = public;
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public;
ALTER FUNCTION public.generate_slug(text) SET search_path = public;
ALTER FUNCTION public.trg_validate_intake_industry() SET search_path = public;
ALTER FUNCTION public.ii_reddit_signals_set_updated_at() SET search_path = public;
ALTER FUNCTION public.match_archive(vector, double precision, integer, text, text[]) SET search_path = public;
ALTER FUNCTION public.update_ii_published_archive_updated_at() SET search_path = public;
ALTER FUNCTION public.update_ii_emails_updated_at() SET search_path = public;
ALTER FUNCTION public.recent_ii_content(integer, text, text, boolean, integer) SET search_path = public;
ALTER FUNCTION public.increment_download_count(uuid) SET search_path = public;
ALTER FUNCTION public.ii_curations_set_updated_at() SET search_path = public;
ALTER FUNCTION public.auto_generate_slug() SET search_path = public;
