-- Fix profiles RLS: Restrict to own profile + admin
-- Previously any authenticated user could read ALL profiles including stripe_customer_id
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
