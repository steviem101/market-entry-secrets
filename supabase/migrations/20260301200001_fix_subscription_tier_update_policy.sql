-- CRITICAL FIX: Prevent users from changing their own subscription tier.
-- The old policy allowed any authenticated user to set their tier to 'enterprise'
-- without paying, bypassing the Stripe payment flow entirely.
--
-- The frontend never updates user_subscriptions directly — only the
-- stripe-webhook edge function does so via SUPABASE_SERVICE_ROLE_KEY (which
-- bypasses RLS). So the safest fix is to remove the UPDATE policy entirely.
-- No replacement policy is created; users simply cannot UPDATE this table.

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;
  -- Also clean up in case the WITH CHECK variant was already applied
  DROP POLICY IF EXISTS "Users can update own subscription without changing tier" ON public.user_subscriptions;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
