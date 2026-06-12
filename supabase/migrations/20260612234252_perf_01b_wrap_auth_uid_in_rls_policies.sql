-- PERF-01b: wrap bare auth.uid() calls in RLS policies as (select auth.uid()) so the
-- planner evaluates them once per query (InitPlan) instead of once per row.
-- Uses ALTER POLICY to preserve command + roles exactly; only the expression changes.
-- Semantics are identical. Atomic. Idempotent: the case-insensitive guard skips policies
-- whose expression already contains a wrapped "select auth.uid" (Postgres renders the
-- wrapped form as "( SELECT auth.uid() AS uid )"), so re-running cannot double-wrap.

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname='public'
      AND ( (qual IS NOT NULL AND qual LIKE '%auth.uid()%' AND qual !~* 'select\s+auth\.uid')
         OR (with_check IS NOT NULL AND with_check LIKE '%auth.uid()%' AND with_check !~* 'select\s+auth\.uid') )
  LOOP
    EXECUTE 'ALTER POLICY '||quote_ident(r.policyname)||' ON public.'||quote_ident(r.tablename)
      || COALESCE(' USING ('||regexp_replace(r.qual,'auth\.uid\(\)','(select auth.uid())','g')||')','')
      || COALESCE(' WITH CHECK ('||regexp_replace(r.with_check,'auth\.uid\(\)','(select auth.uid())','g')||')','');
  END LOOP;
END $$;
