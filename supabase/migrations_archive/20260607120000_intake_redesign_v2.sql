-- =====================================================================
-- Intake v2 redesign — structured columns, analytics events, funnel view,
-- and a one-time legacy backfill.
--
-- Additive + idempotent: legacy columns stay intact so generate-report keeps
-- working. Applied to project xhziwveaiuhzdoutpgrh via Supabase MCP
-- apply_migration (name: intake_redesign_v2). See docs/redesign/handoff
-- Phase 1 / ENGINEERING_TODO P0.2.
--
-- The matching fix (P0.1) is in the edge function:
--   supabase/functions/generate-report/goalServiceTags.ts (+ index.ts) —
--   matching is keyed off the goal_ids column added here, with a legacy
--   long-label fallback for historical rows.
-- =====================================================================

-- 1. New v2 columns on user_intake_forms
ALTER TABLE public.user_intake_forms
  ADD COLUMN IF NOT EXISTS customer_type text,
  ADD COLUMN IF NOT EXISTS customer_size text,
  ADD COLUMN IF NOT EXISTS buying_motion text,
  ADD COLUMN IF NOT EXISTS challenge_tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS challenge_other text,
  ADD COLUMN IF NOT EXISTS goal_ids text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS report_focus text,
  ADD COLUMN IF NOT EXISTS website_scrape_accepted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS revenue_stage text;

-- CHECK constraints (guarded so the migration is re-runnable)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='intake_customer_type_chk') THEN
    ALTER TABLE public.user_intake_forms ADD CONSTRAINT intake_customer_type_chk
      CHECK (customer_type IS NULL OR customer_type IN ('B2B','B2C','B2G','Mixed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='intake_customer_size_chk') THEN
    ALTER TABLE public.user_intake_forms ADD CONSTRAINT intake_customer_size_chk
      CHECK (customer_size IS NULL OR customer_size IN ('SMB (<50)','Mid-market (50-500)','Enterprise (500+)','Mixed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='intake_buying_motion_chk') THEN
    ALTER TABLE public.user_intake_forms ADD CONSTRAINT intake_buying_motion_chk
      CHECK (buying_motion IS NULL OR buying_motion IN ('Direct sales','Channel / partners','Self-serve / marketplace','Mixed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='intake_challenge_other_len') THEN
    ALTER TABLE public.user_intake_forms ADD CONSTRAINT intake_challenge_other_len
      CHECK (challenge_other IS NULL OR length(challenge_other) <= 200);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='intake_report_focus_len') THEN
    ALTER TABLE public.user_intake_forms ADD CONSTRAINT intake_report_focus_len
      CHECK (report_focus IS NULL OR length(report_focus) <= 200);
  END IF;
END $$;

-- 2. Indexes for common matching paths
CREATE INDEX IF NOT EXISTS idx_intake_goal_ids_gin
  ON public.user_intake_forms USING gin (goal_ids);
CREATE INDEX IF NOT EXISTS idx_intake_challenge_tags_gin
  ON public.user_intake_forms USING gin (challenge_tags);
CREATE INDEX IF NOT EXISTS idx_intake_customer_type
  ON public.user_intake_forms (customer_type) WHERE customer_type IS NOT NULL;

-- 3. Analytics table for step-level instrumentation
CREATE TABLE IF NOT EXISTS public.intake_form_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  intake_form_id uuid REFERENCES public.user_intake_forms(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'persona_selected','step_entered','step_exited','field_focused',
    'field_completed','field_skipped','website_prefill_shown',
    'website_prefill_accepted','website_prefill_rejected','auth_modal_shown',
    'auth_completed','generate_clicked','report_completed','abandoned'
  )),
  step integer,
  field_name text,
  persona text CHECK (persona IS NULL OR persona IN ('international','startup')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intake_events_session ON public.intake_form_events (session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_intake_events_type ON public.intake_form_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intake_events_form ON public.intake_form_events (intake_form_id);

ALTER TABLE public.intake_form_events ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. pre-auth visitors) may log funnel events; only admins read.
-- Mirrors the public-INSERT / admin-SELECT pattern used by lead_submissions.
DROP POLICY IF EXISTS "Anyone can insert intake events" ON public.intake_form_events;
CREATE POLICY "Anyone can insert intake events"
  ON public.intake_form_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read intake events" ON public.intake_form_events;
CREATE POLICY "Admins can read intake events"
  ON public.intake_form_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Analyst view: funnel + field completion.
--    security_invoker so the admin-only RLS on intake_form_events is enforced
--    for view readers (avoids a SECURITY DEFINER view exposing analytics).
CREATE OR REPLACE VIEW public.intake_funnel_v2
WITH (security_invoker = true) AS
WITH sessions AS (
  SELECT
    session_id,
    persona,
    MIN(created_at) AS started_at,
    MAX(created_at) AS last_event_at,
    bool_or(event_type = 'persona_selected') AS reached_persona,
    bool_or(event_type = 'step_entered' AND step = 1) AS reached_step1,
    bool_or(event_type = 'step_entered' AND step = 2) AS reached_step2,
    bool_or(event_type = 'step_entered' AND step = 3) AS reached_step3,
    bool_or(event_type = 'generate_clicked') AS clicked_generate,
    bool_or(event_type = 'auth_completed') AS authed,
    bool_or(event_type = 'report_completed') AS got_report,
    bool_or(event_type = 'website_prefill_accepted') AS prefill_accepted,
    EXTRACT(EPOCH FROM MAX(created_at) - MIN(created_at)) AS session_duration_s
  FROM public.intake_form_events
  GROUP BY session_id, persona
)
SELECT
  date_trunc('day', started_at)::date AS day,
  persona,
  COUNT(*) AS sessions,
  COUNT(*) FILTER (WHERE reached_step1) AS step1,
  COUNT(*) FILTER (WHERE reached_step2) AS step2,
  COUNT(*) FILTER (WHERE reached_step3) AS step3,
  COUNT(*) FILTER (WHERE clicked_generate) AS clicked_generate,
  COUNT(*) FILTER (WHERE authed) AS authed,
  COUNT(*) FILTER (WHERE got_report) AS got_report,
  COUNT(*) FILTER (WHERE prefill_accepted) AS prefill_accepted,
  ROUND(AVG(session_duration_s) FILTER (WHERE got_report))::int AS avg_seconds_to_report
FROM sessions
GROUP BY day, persona
ORDER BY day DESC, persona;

-- 5. One-time backfill of legacy goal labels → goal_ids (+ focus/revenue).
UPDATE public.user_intake_forms
SET
  goal_ids = (
    SELECT ARRAY(
      SELECT
        CASE label
          WHEN 'Find vetted service providers (legal, tax, HR, finance)' THEN 'find_providers'
          WHEN 'Connect with trade and investment agencies' THEN 'trade_agencies'
          WHEN 'Access market entry case studies and success stories' THEN 'case_studies'
          WHEN 'Identify relevant industry associations and chambers of commerce' THEN 'associations'
          WHEN 'Discover upcoming market entry events and networking opportunities' THEN 'events'
          WHEN 'Find experienced mentors and advisors' THEN 'mentors_intl'
          WHEN 'Access qualified lead lists for my target sector' THEN 'lead_lists_intl'
          WHEN 'Understand regulatory and compliance requirements' THEN 'compliance'
          WHEN 'Find investors and venture capital firms' THEN 'investors'
          WHEN 'Discover accelerators and incubator programs' THEN 'accelerators'
          WHEN 'Connect with mentors and startup advisors' THEN 'mentors_startup'
          WHEN 'Access growth-stage service providers (legal, finance, HR)' THEN 'growth_providers'
          WHEN 'Find co-working spaces and innovation hubs' THEN 'spaces'
          WHEN 'Identify grant and government funding opportunities' THEN 'grants'
          WHEN 'Access lead lists and customer acquisition resources' THEN 'lead_lists_startup'
          WHEN 'Connect with other founders and peer networks' THEN 'founders'
          ELSE NULL
        END
      FROM unnest(COALESCE(services_needed, '{}'::text[])) AS label
      WHERE label IS NOT NULL
    )
  ),
  report_focus = NULLIF(raw_input->>'additional_notes', ''),
  revenue_stage = NULLIF(raw_input->>'revenue_stage', '')
WHERE goal_ids = '{}' OR goal_ids IS NULL;

-- =====================================================================
-- DOWN (rollback) — verified clean in a rolled-back transaction. Run manually
-- to revert; legacy columns are untouched so existing reports keep working.
--
-- DROP VIEW IF EXISTS public.intake_funnel_v2;
-- DROP TABLE IF EXISTS public.intake_form_events CASCADE;
-- DROP INDEX IF EXISTS public.idx_intake_goal_ids_gin;
-- DROP INDEX IF EXISTS public.idx_intake_challenge_tags_gin;
-- DROP INDEX IF EXISTS public.idx_intake_customer_type;
-- ALTER TABLE public.user_intake_forms
--   DROP CONSTRAINT IF EXISTS intake_customer_type_chk,
--   DROP CONSTRAINT IF EXISTS intake_customer_size_chk,
--   DROP CONSTRAINT IF EXISTS intake_buying_motion_chk,
--   DROP CONSTRAINT IF EXISTS intake_challenge_other_len,
--   DROP CONSTRAINT IF EXISTS intake_report_focus_len,
--   DROP COLUMN IF EXISTS customer_type,
--   DROP COLUMN IF EXISTS customer_size,
--   DROP COLUMN IF EXISTS buying_motion,
--   DROP COLUMN IF EXISTS challenge_tags,
--   DROP COLUMN IF EXISTS challenge_other,
--   DROP COLUMN IF EXISTS goal_ids,
--   DROP COLUMN IF EXISTS report_focus,
--   DROP COLUMN IF EXISTS website_scrape_accepted,
--   DROP COLUMN IF EXISTS revenue_stage;
-- =====================================================================
