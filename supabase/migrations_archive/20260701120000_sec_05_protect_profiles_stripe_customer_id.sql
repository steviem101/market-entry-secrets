-- SEC-05: stop clients writing profiles.stripe_customer_id (billing-integrity hole).
--
-- Context (see docs/audits/AUTH-JOURNEY-AUDIT.md §8.2):
-- profiles RLS lets a user UPDATE their own row ("Users can update their own
-- profile", USING auth.uid() = id) and `authenticated` holds a table-level
-- UPDATE grant. The client `updateProfile()` upserts an arbitrary column set,
-- so a signed-in user could PATCH their own `stripe_customer_id` to an
-- arbitrary / another user's Stripe customer id. `create-checkout` then builds
-- a Stripe Checkout Session against that customer (`customer: stripeCustomerId`)
-- — a cross-customer billing-integrity risk. Same shape as the SEC-01
-- user_subscriptions self-upgrade hole.
--
-- `stripe_customer_id` is written ONLY by create-checkout via the service role.
-- This BEFORE INSERT OR UPDATE trigger blocks the PostgREST client roles
-- (authenticated / anon) from setting or changing it, while leaving every other
-- profile column — and all service-role / definer-trigger writes — untouched.
--
-- A trigger (not column REVOKE/GRANT) is used deliberately: clients legitimately
-- write many profile columns, so a column allow-list would break the moment a
-- new user-editable column is added and one is forgotten. The trigger guards
-- exactly one column and needs no maintenance as the table evolves.
--
-- SECURITY INVOKER (the default — NOT definer) is required so `current_user`
-- reflects the calling PostgREST role rather than the function owner.

CREATE OR REPLACE FUNCTION public.protect_profiles_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Only guard the PostgREST client roles. service_role (edge functions /
  -- webhooks), postgres, and SECURITY DEFINER triggers (e.g. handle_new_user)
  -- run as other roles and are allowed through.
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.stripe_customer_id IS NOT NULL THEN
      RAISE EXCEPTION 'stripe_customer_id cannot be set by clients'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id THEN
      RAISE EXCEPTION 'stripe_customer_id cannot be modified by clients'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profiles_privileged_columns ON public.profiles;
CREATE TRIGGER trg_protect_profiles_privileged_columns
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profiles_privileged_columns();
