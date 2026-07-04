-- =====================================================================
-- Drop the auth.users FK on edge_function_rate_limits.user_id.
--
-- scrape-company is invoked anonymously (verify_jwt=false) for Step 1 of the
-- intake wizard. For unauthenticated callers the function synthesizes a
-- per-IP UUID so the rate-limit table has a non-null key — those UUIDs do
-- NOT correspond to real auth.users rows, so every anonymous insert silently
-- failed the FK constraint (rateLimit.ts swallows the error), meaning the
-- 20/10-min limit was never enforced for the largest caller class.
--
-- This table is a rolling rate-limit log, not a user-owned record. The
-- referential integrity it claimed was actively harmful — drop it.
-- =====================================================================

DO $$ BEGIN
  IF to_regclass('public.edge_function_rate_limits') IS NOT NULL THEN
    ALTER TABLE public.edge_function_rate_limits
      DROP CONSTRAINT IF EXISTS edge_function_rate_limits_user_id_fkey;
  END IF;
END $$;
