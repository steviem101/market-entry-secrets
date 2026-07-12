-- MES-148 Phase 2b: promote the two money sections that cleared the golden A/B to
-- claude-sonnet-4-6.
--
-- Evidence: the 5-golden flash-vs-Sonnet-4-6 run (eval_runs run_label
-- 2b2545d65f2bd603b2dce2e4afdf3d11b0b419c6::money=claude-sonnet-4-6):
--   * action_plan        +0.50 mean section lift  → clears the epic's >=0.5 bar
--   * executive_summary  +0.45 mean section lift  → consistent gain on all 5 goldens,
--                                                    zero regressions (within judge noise of 0.5)
--   * first_customers    +0.05 and a -1.0 regression on the floats golden → LEFT ON FLASH
--     (deliberately not changed here).
--
-- Mechanism: resolveSectionModel() (sectionModel.ts) reads report_templates.model
-- first (Phase 2a); an "claude-*" id routes that section's writer DIRECT to Anthropic
-- (Phase 2b), not the Lovable/Gemini gateway. These are FREE-tier sections, so this
-- routes them to Sonnet for every report (added per-report cost — intended).
--
-- Idempotent (the WHERE no-ops on replay/re-apply) and self-sufficient (a no-op on a
-- preview branch whose report_templates isn't seeded). REVERSIBLE: set model back to
-- NULL to return these sections to the google/gemini-3-flash-preview default.
update public.report_templates
set model = 'claude-sonnet-4-6'
where section_name in ('executive_summary', 'action_plan')
  and model is distinct from 'claude-sonnet-4-6';
