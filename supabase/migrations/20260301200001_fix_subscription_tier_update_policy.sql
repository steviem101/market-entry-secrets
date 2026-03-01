-- CRITICAL FIX: Prevent users from changing their own subscription tier.
-- The old policy allowed any authenticated user to set their tier to 'enterprise'
-- without paying, bypassing the Stripe payment flow entirely.
--
-- Only the stripe-webhook edge function (using SUPABASE_SERVICE_ROLE_KEY) should
-- modify the tier column. This new policy allows users to update non-tier fields
-- on their own row but prevents tier changes via a WITH CHECK constraint.

DO $$ BEGIN
  -- Drop the overly-permissive update policy
  DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;

  -- New policy: users can update their own row, but the tier must remain unchanged.
  -- The service_role key bypasses RLS entirely, so the stripe-webhook can still set tier.
  CREATE POLICY "Users can update own subscription without changing tier"
    ON public.user_subscriptions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (
      auth.uid() = user_id
      AND tier = (SELECT us.tier FROM public.user_subscriptions us WHERE us.user_id = auth.uid())
    );
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
