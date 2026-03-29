-- Rate limiting table for edge functions.
-- Tracks per-user invocations with timestamps for sliding window checks.

CREATE TABLE IF NOT EXISTS public.edge_function_rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  function_name text NOT NULL,
  invoked_at timestamptz NOT NULL DEFAULT now()
);

-- Fast lookups by user + function + time window
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
  ON public.edge_function_rate_limits (user_id, function_name, invoked_at DESC);

-- Only service_role can access (no public RLS policies)
ALTER TABLE public.edge_function_rate_limits ENABLE ROW LEVEL SECURITY;
