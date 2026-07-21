-- APPROVAL-GATED (SECURITY DEFINER + grants over a service-role-only table):
-- prepared on the admin-reports branch; ships only via the reviewed PR flow
-- (docs/migrations.md) with explicit human sign-off in the PR.
--
-- Admin-only "latest quality row per report" read for the Admin Reports console.
--
-- Bug fixed: the console listed report_quality scores by SELECTing report_quality
-- directly from the client, but `authenticated` has NO table-level SELECT grant
-- on report_quality (baseline grants it only to service_role; the "Admins read
-- report_quality" RLS policy is moot without the base privilege). A client read
-- therefore fails with 42501 (permission denied), and because the fetch threw,
-- the WHOLE admin list errored out whenever ≥1 report existed.
--
-- Fix: read via a SECURITY DEFINER RPC that runs as the owner (so no client grant
-- is needed and this does not depend on RLS being enabled), self-guards on admin,
-- and returns exactly the latest quality row per report id (DISTINCT ON). Passing
-- the ids as an array argument also keeps them in the POST body, avoiding the
-- oversized `report_id=in.(<500 uuids>)` URL the client query risked at scale.

CREATE OR REPLACE FUNCTION public.get_admin_report_quality(p_report_ids uuid[])
 RETURNS TABLE (
   report_id uuid,
   report_score integer,
   build_health integer,
   score_substance integer,
   score_presentation integer,
   degraded boolean
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Admin-only. Non-admins get zero rows (never an error).
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN;
  END IF;

  RETURN QUERY
    SELECT DISTINCT ON (rq.report_id)
      rq.report_id, rq.report_score, rq.build_health,
      rq.score_substance, rq.score_presentation, rq.degraded
    FROM public.report_quality rq
    WHERE rq.report_id = ANY(p_report_ids)
    ORDER BY rq.report_id, rq.created_at DESC, rq.id DESC;
END;
$function$;

-- Never anon/PUBLIC; authenticated is fine because the body self-guards on admin.
-- The explicit `FROM anon` matters: Supabase's default privileges grant anon a
-- DIRECT EXECUTE on every new public function at CREATE time, and a revoke from
-- PUBLIC does not remove a direct role grant.
REVOKE EXECUTE ON FUNCTION public.get_admin_report_quality(uuid[]) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_report_quality(uuid[]) TO authenticated, service_role;

-- Same hardening for the sibling admin RPC shipped in 20260721120000, which
-- carried the identical gap (self-guard holds — anon gets NULL — but the
-- function should not be anon-reachable attack surface at all).
REVOKE EXECUTE ON FUNCTION public.get_report_admin(uuid) FROM anon;
