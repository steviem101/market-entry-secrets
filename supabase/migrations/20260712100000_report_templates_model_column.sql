-- MES-148 Phase 2a: per-section model routing.
--
-- Adds an optional `model` override to report_templates. The generate-report
-- section writer resolves the model as: row override → SECTION_MODEL_DEFAULT env
-- → the historical Gemini flash model. NULL everywhere (the default) means the
-- pipeline is byte-for-byte unchanged; this is the config lever the Phase 2
-- money-section A/B needs, evaluated through the golden harness.
--
-- Additive, nullable, no backfill, no RLS/grant change.

alter table public.report_templates
  add column if not exists model text;

comment on column public.report_templates.model is
  'Optional per-section LLM override for generate-report (MES-148 Phase 2). NULL = use SECTION_MODEL_DEFAULT env, else the pipeline default (google/gemini-3-flash-preview). Only set to a model the AI gateway serves; validate via the golden harness before promoting.';
