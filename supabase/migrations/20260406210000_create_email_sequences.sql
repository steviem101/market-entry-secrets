-- ============================================================================
-- Email Nurture Sequences: tracking + step configuration
-- ============================================================================

-- 1. User sequence tracking
CREATE TABLE IF NOT EXISTS public.email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sequence_name TEXT NOT NULL DEFAULT 'onboarding',
  current_step INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  next_send_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  paused BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, sequence_name)
);

ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

-- Service-role-only access (RLS bypassed by service role key).
-- Edge functions use service role; no client-side access needed.
CREATE POLICY "Service role can insert email sequences"
  ON public.email_sequences FOR INSERT WITH CHECK (false);

CREATE POLICY "Service role can update email sequences"
  ON public.email_sequences FOR UPDATE USING (false);

CREATE POLICY "Service role can select email sequences"
  ON public.email_sequences FOR SELECT USING (false);

CREATE INDEX IF NOT EXISTS idx_email_sequences_next_send
  ON public.email_sequences(next_send_at)
  WHERE completed_at IS NULL AND paused = FALSE;

CREATE INDEX IF NOT EXISTS idx_email_sequences_user_id
  ON public.email_sequences(user_id);

-- 2. Sequence step configuration
CREATE TABLE IF NOT EXISTS public.email_sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_name TEXT NOT NULL,
  step_number INT NOT NULL,
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  delay_days INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(sequence_name, step_number)
);

ALTER TABLE public.email_sequence_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sequence steps"
  ON public.email_sequence_steps FOR SELECT USING (true);

-- 3. Seed onboarding sequence steps
INSERT INTO public.email_sequence_steps (sequence_name, step_number, template_name, subject, delay_days)
VALUES
  ('onboarding', 0, 'welcome', 'Welcome to Market Entry Secrets', 0),
  ('onboarding', 1, 'nurture_ecosystem', 'Your shortcut to the right partners in ANZ', 2),
  ('onboarding', 2, 'nurture_case_studies', 'How [Company] cracked the Australian market', 5),
  ('onboarding', 3, 'nurture_ai_report', 'Get your personalised market entry plan in minutes', 8),
  ('onboarding', 4, 'nurture_events', 'Connect with the ANZ market entry community', 12),
  ('onboarding', 5, 'nurture_upgrade', 'You''ve explored the surface. Here''s what''s deeper.', 16)
ON CONFLICT (sequence_name, step_number) DO NOTHING;

-- 4. Function to enrol a new user in the onboarding sequence
--    Called after welcome email is sent (from process-email-queue or trigger)
CREATE OR REPLACE FUNCTION public.enrol_in_onboarding_sequence()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.email_sequences (user_id, sequence_name, current_step, next_send_at)
  VALUES (
    NEW.id,
    'onboarding',
    1,  -- step 0 (welcome) is sent immediately by the frontend; start at step 1
    now() + INTERVAL '2 days'
  )
  ON CONFLICT (user_id, sequence_name) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 5. Trigger: enrol user after profile is created (which happens on signup)
DO $$ BEGIN
  CREATE TRIGGER on_profile_created_enrol_sequence
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.enrol_in_onboarding_sequence();
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not create enrol_sequence trigger: %', SQLERRM;
END $$;
