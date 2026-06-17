-- Add utilization (retrieved -> used) + presentation (writing mechanics) + substance (LLM) columns
-- to report_quality. Computed in slack-notify/reportQuality.ts.
alter table public.report_quality
  add column if not exists report_score        integer,   -- overall output score (presentation + substance)
  add column if not exists utilization_rate    numeric,   -- used / surfaced
  add column if not exists utilization         jsonb,     -- per-category surfaced/used/gated/dropped
  add column if not exists score_presentation  integer,   -- deterministic writing mechanics
  add column if not exists presentation        jsonb,     -- presentation flags/sub-metrics
  add column if not exists score_substance     integer,   -- LLM-judged (filled in the substance increment)
  add column if not exists substance           jsonb;      -- LLM rubric + rationale
