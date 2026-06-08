-- Workstream A5: report_templates contain prompt IP. Lock down to service-role-only.
-- generate-report uses service role, so it bypasses RLS. No frontend reads this table.
DROP POLICY IF EXISTS "Authenticated users can view templates" ON public.report_templates;

-- Workstream A6: user_usage SELECT exposes 5865 session IDs publicly.
-- Frontend only INSERTs to track freemium views; SELECT happens server-side for analytics.
DROP POLICY IF EXISTS "Users can view their own usage" ON public.user_usage;
