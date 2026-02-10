-- Create payment_webhook_logs table to track all Stripe webhook events
CREATE TABLE IF NOT EXISTS public.payment_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  stripe_payload JSONB NOT NULL,      -- full Stripe event payload
  parsed JSONB,                       -- relevant parsed fields for quick query
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Webhook logs are only read via Supabase dashboard (service role bypasses RLS).
-- Using false here so no regular API user can SELECT; avoids dependency on
-- user_roles/has_role which may not exist yet during Preview migrations.
CREATE POLICY "Admins can view webhook logs"
ON public.payment_webhook_logs
FOR SELECT
USING (false);

-- System can insert webhook logs (for the webhook handler)
CREATE POLICY "System can insert webhook logs" 
ON public.payment_webhook_logs 
FOR INSERT 
WITH CHECK (true);

-- Create index on stripe_event_id for performance
CREATE INDEX IF NOT EXISTS idx_payment_webhook_logs_stripe_event_id 
ON public.payment_webhook_logs(stripe_event_id);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_payment_webhook_logs_created_at 
ON public.payment_webhook_logs(created_at DESC);