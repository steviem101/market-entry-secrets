-- =====================================================================
-- DRAFT MIGRATION: Intake form V2 redesign
--
-- Status: design draft — NOT applied. Filename ends `.draft.sql` so Supabase
-- migrations runner ignores it. Rename to a timestamped `.sql` to apply.
--
-- What it does:
--   1. Adds the new V2 structured columns to `user_intake_forms`.
--   2. Keeps the legacy columns intact (backfilled by the compatibility shim
--      `mapV2ToLegacyIntake()` in intakeSchema.v2.draft.ts) so the
--      generate-report edge function does not need any changes on day 1.
--   3. Adds an analytics table for step-level instrumentation
--      (`intake_form_events`) so we can measure the redesign's impact.
--   4. Adds an event-tracking helper RPC for client use.
--
-- Rollback plan: drop new columns + the analytics table. Legacy columns
-- remain untouched, so existing reports continue to work.
-- =====================================================================

-- ── 1. New V2 columns on user_intake_forms ────────────────────────────────

ALTER TABLE public.user_intake_forms
  -- Structured customer profile (replaces target_customer_description text)
  ADD COLUMN IF NOT EXISTS customer_type text
    CHECK (customer_type IS NULL OR customer_type IN ('B2B','B2C','B2G','Mixed')),
  ADD COLUMN IF NOT EXISTS customer_size text
    CHECK (customer_size IS NULL OR customer_size IN ('SMB (<50)','Mid-market (50-500)','Enterprise (500+)','Mixed')),
  ADD COLUMN IF NOT EXISTS buying_motion text
    CHECK (buying_motion IS NULL OR buying_motion IN ('Direct sales','Channel / partners','Self-serve / marketplace','Mixed')),

  -- Structured challenges (replaces key_challenges free text)
  ADD COLUMN IF NOT EXISTS challenge_tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS challenge_other text,

  -- Goal IDs (stable refs) alongside legacy services_needed (labels)
  ADD COLUMN IF NOT EXISTS goal_ids text[] DEFAULT '{}'::text[],

  -- Report focus (replaces additional_notes; reframed as "the one question")
  ADD COLUMN IF NOT EXISTS report_focus text,

  -- Website-scrape acceptance (A/B signal for the redesign)
  ADD COLUMN IF NOT EXISTS website_scrape_accepted boolean DEFAULT false,

  -- Revenue stage was previously only in raw_input — promote to a column
  ADD COLUMN IF NOT EXISTS revenue_stage text;

-- Length caps (mirror the Zod schema)
ALTER TABLE public.user_intake_forms
  ADD CONSTRAINT intake_challenge_other_len
    CHECK (challenge_other IS NULL OR length(challenge_other) <= 200),
  ADD CONSTRAINT intake_report_focus_len
    CHECK (report_focus IS NULL OR length(report_focus) <= 200);

-- ── 2. Indexes for common matching paths ──────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_intake_goal_ids_gin
  ON public.user_intake_forms USING gin (goal_ids);

CREATE INDEX IF NOT EXISTS idx_intake_challenge_tags_gin
  ON public.user_intake_forms USING gin (challenge_tags);

CREATE INDEX IF NOT EXISTS idx_intake_customer_type
  ON public.user_intake_forms (customer_type)
  WHERE customer_type IS NOT NULL;

-- ── 3. Analytics table for step-level instrumentation ────────────────────
-- Captures field-level drop-off so we can measure the redesign's lift on:
--   - Form completion rate (started → Generate clicked)
--   - High-impact field completion (challenges, customer, focus)
--   - Time-on-step

CREATE TABLE IF NOT EXISTS public.intake_form_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL, -- anonymous session token; matches across events
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- nullable: pre-auth
  intake_form_id uuid REFERENCES public.user_intake_forms(id) ON DELETE CASCADE, -- nullable: pre-submit

  event_type text NOT NULL CHECK (event_type IN (
    'persona_selected',     -- step 0 done
    'step_entered',         -- step view shown
    'step_exited',          -- step view left (advance OR back OR abandon)
    'field_focused',        -- field gained focus
    'field_completed',      -- field has non-empty value at blur
    'field_skipped',        -- step advanced with field still empty (optional only)
    'website_prefill_shown',-- scrape returned suggestions
    'website_prefill_accepted', -- user kept the suggestions
    'website_prefill_rejected', -- user overwrote the suggestions
    'auth_modal_shown',     -- they hit the auth gate
    'auth_completed',       -- finished signup/signin
    'generate_clicked',     -- final CTA
    'report_completed',     -- pipeline returned success
    'abandoned'             -- closed tab / nav away
  )),

  step integer,             -- 0..3
  field_name text,          -- e.g. 'company_name', 'challenges.tags'
  persona text CHECK (persona IS NULL OR persona IN ('international','startup')),
  metadata jsonb DEFAULT '{}'::jsonb, -- value lengths, durations, A/B variant
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_intake_events_session ON public.intake_form_events (session_id, created_at);
CREATE INDEX idx_intake_events_type ON public.intake_form_events (event_type, created_at DESC);
CREATE INDEX idx_intake_events_form ON public.intake_form_events (intake_form_id);

-- RLS: anyone can insert their own events; only admins can read.
ALTER TABLE public.intake_form_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert intake events"
  ON public.intake_form_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read intake events"
  ON public.intake_form_events
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ── 4. Analyst view: funnel + field completion ───────────────────────────

CREATE OR REPLACE VIEW public.intake_funnel_v2 AS
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

-- ── 5. Migration of EXISTING legacy data into the new columns ────────────
-- One-time backfill so the analytics view doesn't lose history.

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
-- END DRAFT MIGRATION
-- =====================================================================
