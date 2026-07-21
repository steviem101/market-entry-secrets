-- MES agent loops (Workstream A): agent_proposals — the unified READ view over every loop's
-- proposals (Option A from the Phase 2 plan). Non-destructive: the 8 existing per-loop staging
-- tables keep their bespoke shapes; this view projects them (plus the canonical
-- agent_content_proposals table) into one shape the dashboard and Slack layer consume.
--
-- security_invoker = true: the view runs with the QUERYING user's privileges, so each source
-- table's admin-read RLS is enforced through the view (a non-admin selecting it sees nothing).
-- This is a read surface only — all mutation goes through the apply-proposal / agent-actions
-- edge functions, never through the view.
--
-- proposal_key ('<source_table>:<id>') is the stable handle the apply/action functions resolve
-- back to the physical row. status is normalised to the canonical vocabulary:
--   pending   <- new, pending, ack
--   approved  <- approved, accepted
--   rejected  <- dismissed, rejected, duplicate, invalid
--   applied   <- applied, imported, shipped, actioned
--   (auto_approved / apply_failed occur only in agent_content_proposals)
-- Additive + reversible (drop view). Rollback: supabase/rollback/20260720100200_agent_proposals_view_revert.sql

create or replace view public.agent_proposals
with (security_invoker = true) as

-- 1. Canonical content-refresh proposals (already in the target shape).
select
  'agent_content_proposals:' || p.id::text as proposal_key,
  'agent_content_proposals'::text          as source_table,
  p.id, p.run_id, p.loop_name, p.action_type,
  p.target_table, p.target_id, p.payload, p.reason, p.confidence,
  p.status, p.reviewed_at, p.applied_at, p.created_at
from public.agent_content_proposals p

union all
-- 2. directory-steward field-change proposals.
select
  'directory_steward_staging:' || s.id::text,
  'directory_steward_staging',
  s.id, s.run_id, 'directory-steward', 'steward_change_' || s.change_class,
  s.directory_table, s.record_id,
  jsonb_build_object('field_diffs', s.field_diffs, 'computed_health', s.computed_health,
                     'source_url', s.source_url) || coalesce(s.evidence, '{}'::jsonb),
  'Class ' || s.change_class || ' change from source re-scrape', null::numeric,
  case s.status when 'new' then 'pending' when 'approved' then 'approved'
                when 'dismissed' then 'rejected' when 'applied' then 'applied' else s.status end,
  s.reviewed_at, s.applied_at, s.created_at
from public.directory_steward_staging s

union all
-- 3. directory-discovery candidate proposals (no existing target row).
select
  'directory_discovery_staging:' || d.id::text,
  'directory_discovery_staging',
  d.id, d.run_id, 'directory-discovery', 'discover_candidate',
  d.directory_table, null::uuid,
  jsonb_build_object('candidate_name', d.candidate_name, 'candidate_url', d.candidate_url,
                     'candidate_domain', d.candidate_domain, 'description', d.description,
                     'term_slug', d.term_slug, 'source_query', d.source_query)
    || coalesce(d.evidence, '{}'::jsonb),
  coalesce(d.candidate_name, d.candidate_url, 'discovered candidate'), null::numeric,
  case d.status when 'new' then 'pending' when 'approved' then 'approved'
                when 'dismissed' then 'rejected' when 'imported' then 'applied' else d.status end,
  d.reviewed_at, d.imported_at, d.created_at
from public.directory_discovery_staging d

union all
-- 4. demand-mining supply-gap signals.
select
  'directory_demand_signals:' || g.id::text,
  'directory_demand_signals',
  g.id, g.run_id, 'demand-mining', 'demand_signal',
  null::text, null::uuid,
  jsonb_build_object('signal_type', g.signal_type, 'term_slug', g.term_slug,
                     'demand_count', g.demand_count, 'supply_count', g.supply_count,
                     'gap_score', g.gap_score, 'window_days', g.window_days,
                     'sample_regions', g.sample_regions, 'sample_sectors', g.sample_sectors)
    || coalesce(g.evidence, '{}'::jsonb),
  coalesce(g.term_label, g.term_slug, 'demand signal'), g.gap_score,
  case g.status when 'new' then 'pending' when 'ack' then 'pending'
                when 'actioned' then 'applied' when 'dismissed' then 'rejected' else g.status end,
  g.reviewed_at, null::timestamptz, g.created_at
from public.directory_demand_signals g

union all
-- 5. report-quality proposals (propose-only; shipped via a fix ref, never code).
select
  'report_quality_proposals:' || r.id::text,
  'report_quality_proposals',
  r.id, r.run_id, 'report-quality-loop', 'rq_' || coalesce(r.category, 'proposal'),
  'user_reports', r.report_id,
  jsonb_build_object('title', r.title, 'impact_estimate', r.impact_estimate, 'risk', r.risk,
                     'axis_scores', r.axis_scores, 'rank_score', r.rank_score,
                     'rubric_version', r.rubric_version, 'dedup_theme', r.dedup_theme,
                     'fix_ref', r.fix_ref) || coalesce(r.evidence, '{}'::jsonb),
  coalesce(r.recommended_change, r.title, 'quality proposal'), r.confidence,
  case r.status when 'new' then 'pending' when 'accepted' then 'approved'
                when 'rejected' then 'rejected' when 'shipped' then 'applied' else r.status end,
  r.reviewed_at, null::timestamptz, r.created_at
from public.report_quality_proposals r

union all
-- 6. prompt A/B rollup proposals.
select
  'prompt_ab_proposals:' || a.id::text,
  'prompt_ab_proposals',
  a.id, a.run_id, 'prompt-ab-rollup', 'prompt_ab_' || coalesce(a.verdict, 'proposal'),
  'report_templates', null::uuid,
  jsonb_build_object('section_name', a.section_name, 'candidate_version', a.candidate_version,
                     'verdict', a.verdict, 'lift', a.lift, 'grounding_lift', a.grounding_lift,
                     'candidate_mean', a.candidate_mean, 'control_mean', a.control_mean)
    || coalesce(a.evidence, '{}'::jsonb),
  coalesce(a.section_name, 'prompt A/B'), null::numeric,
  case a.status when 'new' then 'pending' when 'accepted' then 'approved'
                when 'dismissed' then 'rejected' when 'shipped' then 'applied' else a.status end,
  a.reviewed_at, null::timestamptz, a.created_at
from public.prompt_ab_proposals a

union all
-- 7. ecosystem import candidates (confidence is a text label here -> not projected numerically).
select
  'ecosystem_import_candidates:' || e.id::text,
  'ecosystem_import_candidates',
  e.id, null::uuid, 'ecosystem-import', coalesce(e.proposed_action, 'import_candidate'),
  e.proposed_destination, coalesce(e.target_record_id, e.matched_existing_id),
  jsonb_build_object('source_name', e.source_name, 'source_url', e.source_url,
                     'entity_type', e.entity_type, 'confidence_label', e.confidence,
                     'match_method', e.match_method, 'validation_flags', e.validation_flags,
                     'proposed_payload', e.proposed_payload),
  coalesce(e.match_note, e.source_name, 'import candidate'), null::numeric,
  case e.status when 'pending' then 'pending' when 'approved' then 'approved'
                when 'applied' then 'applied'
                when 'rejected' then 'rejected' when 'duplicate' then 'rejected'
                when 'invalid' then 'rejected' else e.status end,
  e.reviewed_at, e.applied_at, e.created_at
from public.ecosystem_import_candidates e

union all
-- 8. innovation-ecosystem enrichment proposals.
select
  'innovation_ecosystem_enrichment_staging:' || i.id::text,
  'innovation_ecosystem_enrichment_staging',
  i.id, null::uuid, 'ecosystem-enrichment', 'enrich_ecosystem',
  'innovation_ecosystem', i.source_id,
  coalesce(i.enrichment, '{}'::jsonb) || jsonb_build_object('notes', i.notes),
  coalesce(i.notes, 'ecosystem enrichment'), null::numeric,
  case i.status when 'pending' then 'pending' when 'approved' then 'approved'
                when 'applied' then 'applied' when 'rejected' then 'rejected' else i.status end,
  i.reviewed_at, null::timestamptz, i.created_at
from public.innovation_ecosystem_enrichment_staging i

union all
-- 9. trade-agency enrichment proposals.
select
  'trade_agencies_enrichment_staging:' || t.id::text,
  'trade_agencies_enrichment_staging',
  t.id, null::uuid, 'agency-enrichment', 'enrich_agency',
  'trade_investment_agencies', t.source_id,
  coalesce(t.enrichment, '{}'::jsonb) || jsonb_build_object('research_notes', t.research_notes,
                                                            'source_name', t.source_name),
  coalesce(t.source_name, 'agency enrichment'), null::numeric,
  case t.status when 'pending' then 'pending' when 'approved' then 'approved'
                when 'applied' then 'applied' when 'rejected' then 'rejected'
                when 'invalid' then 'rejected' else t.status end,
  t.reviewed_at, t.applied_at, t.created_at
from public.trade_agencies_enrichment_staging t;

comment on view public.agent_proposals is
  'MES agent loops: unified read view over agent_content_proposals + the 8 per-loop staging tables. '
  'security_invoker so each source table admin-read RLS is enforced. proposal_key resolves back to '
  'the physical row for apply-proposal / agent-actions. Read-only; never mutate through the view.';

-- security_invoker means the querying admin must hold SELECT on EVERY base table, or the whole
-- UNION errors. Two staging tables had authenticated SELECT fully revoked (service-role-read only);
-- grant it so they match the other 6. RLS admin-read policies still restrict rows to admins, so
-- this exposes nothing to non-admin authenticated users (identical posture to the other 6 tables).
grant select on public.report_quality_proposals to authenticated;
grant select on public.ecosystem_import_candidates to authenticated;

-- trade_agencies_enrichment_staging has RLS ENABLED but no policy at all (verified live), so a
-- security_invoker read denies every row to non-service-role callers — the view's branch 9 would
-- be silently empty for admins. Add the admin-read policy the other 7 staging tables already have.
do $$ begin
  if not exists (
    select 1 from pg_policy p join pg_class c on c.oid = p.polrelid
    where c.relname = 'trade_agencies_enrichment_staging' and p.polname = 'Admins read trade_agencies_enrichment_staging'
  ) then
    create policy "Admins read trade_agencies_enrichment_staging"
      on public.trade_agencies_enrichment_staging for select
      using (public.has_role((select auth.uid()), 'admin'::public.app_role));
  end if;
end $$;

revoke all on public.agent_proposals from anon;
grant select on public.agent_proposals to authenticated;
