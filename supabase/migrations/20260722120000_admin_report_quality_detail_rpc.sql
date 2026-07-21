-- APPROVAL-GATED (SECURITY DEFINER + grants over a service-role-only table):
-- prepared on the admin-reports branch; ships only via the reviewed PR flow
-- (docs/migrations.md) with explicit human sign-off in the PR.
--
-- Admin-only FULL report_quality row for one report, powering the quality
-- breakdown panel in the /admin/reports/:id review view (scores, the R/S/A/G/C
-- substance rubric, plumbing sources, RAG coverage, utilisation, presentation
-- flags, and the "Suggested fixes" insights — the same content the #report-quality
-- Slack card shows). Kept separate from the lean list RPC (get_admin_report_quality)
-- so the 500-row list never pulls these jsonb blobs; this fires once, on demand,
-- when an admin opens a single report.
--
-- Same shape as the sibling admin RPCs: runs as owner (authenticated has no
-- SELECT grant on report_quality), self-guards on admin, returns the latest
-- quality row for the report.

CREATE OR REPLACE FUNCTION public.get_admin_report_quality_detail(p_report_id uuid)
 RETURNS TABLE (
   report_status text,
   report_score integer,
   build_health integer,
   score_plumbing integer,
   score_coverage integer,
   score_completeness integer,
   score_presentation integer,
   score_substance integer,
   degraded boolean,
   rag_hit_rate numeric,
   tables_hit integer,
   total_matches integer,
   utilization_rate numeric,
   groundedness numeric,
   generation_time_ms integer,
   match_counts jsonb,
   substance jsonb,
   insights jsonb,
   presentation jsonb,
   utilization jsonb,
   sources jsonb,
   created_at timestamptz
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
    SELECT
      rq.report_status, rq.report_score, rq.build_health, rq.score_plumbing,
      rq.score_coverage, rq.score_completeness, rq.score_presentation,
      rq.score_substance, rq.degraded, rq.rag_hit_rate, rq.tables_hit,
      rq.total_matches, rq.utilization_rate, rq.groundedness,
      rq.generation_time_ms, rq.match_counts, rq.substance, rq.insights,
      rq.presentation, rq.utilization, rq.sources, rq.created_at
    FROM public.report_quality rq
    WHERE rq.report_id = p_report_id
    ORDER BY rq.created_at DESC
    LIMIT 1;
END;
$function$;

-- Never anon/PUBLIC. The explicit `FROM anon` matters: Supabase's default
-- privileges grant anon a DIRECT EXECUTE at CREATE time that a revoke from
-- PUBLIC does not remove (same trap as 20260718130000).
REVOKE EXECUTE ON FUNCTION public.get_admin_report_quality_detail(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_report_quality_detail(uuid) TO authenticated, service_role;
