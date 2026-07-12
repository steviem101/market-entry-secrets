-- MES-148 Phase 3 (P3.0): one in-flight report per intake — kills the duplicate-
-- generation race + double external spend.
--
-- Today the duplicate guard in generate-report is a non-atomic SELECT-then-INSERT
-- (index.ts ~3665): two near-simultaneous invocations both see no 'processing' row
-- and both insert one, so the whole expensive Phase 1 (Firecrawl + ~7 Perplexity +
-- LLM) runs twice for the same intake. The 5/60min rate limit is the only backstop
-- and it fails open. This enforces the invariant at the DB so the INSERT is the
-- atomic gate (the function then treats a 23505 as "already processing").
--
-- Scope: 'processing' rows only. Completed/failed history (one row per retry) is
-- unaffected, and a retry after failure still inserts a fresh row (the prior row is
-- 'failed', not in the partial index). Additive + reversible (drop the index).

-- 1. Resolve any pre-existing duplicate in-flight rows (from a past race) so the
--    unique index can be created on live data: keep the NEWEST 'processing' report
--    per intake, demote the rest to 'failed'. Idempotent (re-run touches nothing).
update public.user_reports r
set status = 'failed',
    report_json = case
      when r.report_json is null or r.report_json = '{}'::jsonb
        then jsonb_build_object('error', 'Superseded duplicate in-flight run (Phase 3 concurrency guard).')
      else r.report_json
    end
where r.status = 'processing'
  and r.intake_form_id is not null
  and exists (
    select 1 from public.user_reports r2
    where r2.intake_form_id = r.intake_form_id
      and r2.status = 'processing'
      and (r2.created_at, r2.id) > (r.created_at, r.id)
  );

-- 2. At most one 'processing' report per intake. Partial + on the nullable
--    intake_form_id (NULLs are excluded from the index, so ad-hoc intake-less rows
--    are unconstrained).
create unique index if not exists uq_user_reports_one_processing_per_intake
  on public.user_reports (intake_form_id)
  where status = 'processing';
