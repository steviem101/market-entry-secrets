-- ============================================================================
-- DOWN for 20260621060100_kb_linkedin_upsert_lock_anon_authenticated.sql
-- Scope: xhziwveaiuhzdoutpgrh (MES - Australia) ONLY.
-- ============================================================================
-- INTENTIONAL NO-OP. This migration only tightened privileges on a
-- SECURITY DEFINER function; "reverting" it would re-open the anon/authenticated
-- execute hole, which we will never want. To fully remove the function and its
-- grants, run the revert of 20260621060000 instead (it drops the function).
-- ============================================================================
select 1;
