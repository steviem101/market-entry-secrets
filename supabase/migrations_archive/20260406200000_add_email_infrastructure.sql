-- ============================================================================
-- Email Infrastructure: email_log table + profiles.is_email_subscribed
-- ============================================================================

-- 1. Add opt-out column to profiles (default true = subscribed)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_email_subscribed BOOLEAN DEFAULT TRUE;

UPDATE public.profiles SET is_email_subscribed = TRUE WHERE is_email_subscribed IS NULL;

-- 2. Create email_log table
CREATE TABLE IF NOT EXISTS public.email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  resend_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS: service role bypasses; dashboard-only inspection
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email logs"
  ON public.email_log
  FOR SELECT
  USING (false);

CREATE POLICY "System can insert email logs"
  ON public.email_log
  FOR INSERT
  WITH CHECK (true);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_email_log_user_id ON public.email_log(user_id);
CREATE INDEX IF NOT EXISTS idx_email_log_email_type ON public.email_log(email_type);
CREATE INDEX IF NOT EXISTS idx_email_log_idempotency_key ON public.email_log(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_email_log_created_at ON public.email_log(created_at DESC);
