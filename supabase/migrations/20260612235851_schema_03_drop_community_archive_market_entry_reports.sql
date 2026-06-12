-- SCHEMA-03 (reduced scope): retire two dead tables surfaced by the platform review.
--
-- 1. "Community" (capital C): 0 rows, single junk column, RLS enabled with no
--    policies, zero code references -> dropped.
-- 2. market_entry_reports: legacy report table superseded by user_reports. It holds
--    2 historical draft rows from Oct 2025, so it is ARCHIVED (renamed), not dropped,
--    matching the existing "_archived_MES" convention. Its policies (including an
--    anon INSERT WITH CHECK (true) spam vector) are dropped and client grants revoked;
--    RLS stays enabled with no policies, so only the service role can touch it.
-- 3. `leads` is intentionally NOT touched: generate-report still queries it.
--
-- Guarded for fresh databases where these objects may not exist. Idempotent.

DROP TABLE IF EXISTS public."Community";

DO $$
BEGIN
  IF to_regclass('public.market_entry_reports') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Anyone can submit market entry report requests" ON public.market_entry_reports;
    DROP POLICY IF EXISTS "Authenticated users can submit market entry report requests" ON public.market_entry_reports;
    DROP POLICY IF EXISTS "Team members can create reports for users" ON public.market_entry_reports;
    DROP POLICY IF EXISTS "Users can view their own reports" ON public.market_entry_reports;
    DROP POLICY IF EXISTS "Team members can update reports" ON public.market_entry_reports;
    REVOKE ALL ON public.market_entry_reports FROM anon, authenticated;
    ALTER TABLE public.market_entry_reports RENAME TO "_archived_market_entry_reports";
  END IF;
END $$;
