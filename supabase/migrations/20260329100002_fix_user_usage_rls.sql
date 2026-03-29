-- Fix user_usage SELECT policy: was USING (true) allowing anyone to read all records.
-- Scope to user's own records only.

DROP POLICY IF EXISTS "Users can view their own usage" ON public.user_usage;

CREATE POLICY "Users can view their own usage"
  ON public.user_usage
  FOR SELECT
  USING (
    user_id IS NULL  -- anonymous tracking rows (user_id is null) are readable by the inserter
    OR auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );
