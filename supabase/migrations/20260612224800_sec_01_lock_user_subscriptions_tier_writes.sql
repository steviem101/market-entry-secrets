-- SEC-01: prevent users from self-upgrading their subscription tier (Stripe bypass).
-- Before this change, `authenticated` held a column UPDATE grant on user_subscriptions.tier
-- and the "Users can update their own subscription" policy used USING (auth.uid() = user_id)
-- with no WITH CHECK, so any signed-in user could PATCH their own row to tier='enterprise'
-- and unlock every paid report section without paying.
--
-- Only the service role (Stripe webhook) may write user_subscriptions.
-- Clients keep SELECT (RLS still scopes reads to the owner's row). Idempotent.

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.user_subscriptions FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.user_subscriptions FROM authenticated;

-- Drop the now-unusable (and misleading) self-update policy so the hole
-- cannot silently reopen if an UPDATE grant is re-added later.
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;
