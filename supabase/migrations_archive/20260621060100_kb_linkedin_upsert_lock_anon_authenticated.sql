-- ============================================================================
-- Follow-up to 20260621060000_kb_extend_cross_project_linkedin_source.sql
-- Scope: xhziwveaiuhzdoutpgrh (MES - Australia) ONLY.
-- ============================================================================
-- Supabase's default privileges grant EXECUTE on new public functions to
-- `anon` and `authenticated` EXPLICITLY (not via PUBLIC). The prior migration's
-- `revoke ... from public` therefore left those explicit grants in place.
-- upsert_kb_linkedin_post is SECURITY DEFINER (bypasses RLS), so anon/authenticated
-- EXECUTE would let any anon-key holder inject internal rows into the KB.
-- Revoke the explicit role grants; keep service_role only.
-- ============================================================================

revoke all on function public.upsert_kb_linkedin_post(text, text, vector, text, jsonb, text) from anon;
revoke all on function public.upsert_kb_linkedin_post(text, text, vector, text, jsonb, text) from authenticated;
revoke all on function public.upsert_kb_linkedin_post(text, text, vector, text, jsonb, text) from public;
grant execute on function public.upsert_kb_linkedin_post(text, text, vector, text, jsonb, text) to service_role;
