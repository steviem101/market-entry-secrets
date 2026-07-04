
-- ── 1. agency_contacts: restrict to authenticated ──────────────────────────
DROP POLICY IF EXISTS "Anyone can view agency contacts" ON public.agency_contacts;
CREATE POLICY "Authenticated can view agency contacts"
  ON public.agency_contacts FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.agency_contacts FROM anon;

-- ── 2. service_provider_contacts: restrict to authenticated ────────────────
DROP POLICY IF EXISTS "Public read" ON public.service_provider_contacts;
CREATE POLICY "Authenticated can view service provider contacts"
  ON public.service_provider_contacts FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.service_provider_contacts FROM anon;

-- ── 3. Storage: guide-tiles, lead-list-covers, tradeagencies (admin-only write) ──
DROP POLICY IF EXISTS "Authenticated can upload guide-tiles" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update guide-tiles" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload lead-list-covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update lead-list-covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload tradeagencies" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update tradeagencies" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete tradeagencies" ON storage.objects;

CREATE POLICY "Admins can upload guide-tiles" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'guide-tiles' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update guide-tiles" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'guide-tiles' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete guide-tiles" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'guide-tiles' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can upload lead-list-covers" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lead-list-covers' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update lead-list-covers" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'lead-list-covers' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete lead-list-covers" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'lead-list-covers' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can upload tradeagencies" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tradeagencies' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update tradeagencies" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'tradeagencies' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete tradeagencies" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'tradeagencies' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- ── 4. user_intake_forms: server-side length caps mirroring client Zod schema ──
DROP POLICY IF EXISTS "Users can insert own intake forms" ON public.user_intake_forms;
CREATE POLICY "Users can insert own intake forms"
  ON public.user_intake_forms FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND coalesce(length(company_name), 0) <= 500
    AND coalesce(length(website_url), 0) <= 500
    AND coalesce(length(country_of_origin), 0) <= 200
    AND coalesce(length(primary_goals::text), 0) <= 2000
    AND coalesce(length(key_challenges::text), 0) <= 2000
    AND coalesce(length(report_focus), 0) <= 500
    AND coalesce(length(raw_input::text), 0) <= 20000
  );

DROP POLICY IF EXISTS "Users can update own intake forms" ON public.user_intake_forms;
CREATE POLICY "Users can update own intake forms"
  ON public.user_intake_forms FOR UPDATE TO authenticated
  USING (
    ((SELECT auth.uid()) = user_id)
    OR public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
  )
  WITH CHECK (
    (
      ((SELECT auth.uid()) = user_id)
      OR public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
    )
    AND coalesce(length(company_name), 0) <= 500
    AND coalesce(length(website_url), 0) <= 500
    AND coalesce(length(country_of_origin), 0) <= 200
    AND coalesce(length(primary_goals::text), 0) <= 2000
    AND coalesce(length(key_challenges::text), 0) <= 2000
    AND coalesce(length(report_focus), 0) <= 500
    AND coalesce(length(raw_input::text), 0) <= 20000
  );

-- ── 5. Function search_path fixes ──────────────────────────────────────────
DO $$ BEGIN
  IF to_regprocedure('public.any_sector_agnostic(text[])') IS NOT NULL THEN
    ALTER FUNCTION public.any_sector_agnostic(text[]) SET search_path = public;
  END IF;
  IF to_regprocedure('public.map_sector_value(text)') IS NOT NULL THEN
    ALTER FUNCTION public.map_sector_value(text) SET search_path = public;
  END IF;
  IF to_regprocedure('public.map_sector_values(text[])') IS NOT NULL THEN
    ALTER FUNCTION public.map_sector_values(text[]) SET search_path = public;
  END IF;
  IF to_regprocedure('public.upsert_ii_linkedin_posts(jsonb)') IS NOT NULL THEN
    ALTER FUNCTION public.upsert_ii_linkedin_posts(jsonb) SET search_path = public;
  END IF;
END $$;

-- ── 6. Revoke EXECUTE on internal SECURITY DEFINER trigger/telemetry funcs ──
-- These are invoked by DB triggers; clients must not call them directly.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname AS ns, p.proname AS name, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND (
        p.proname LIKE 'emit\_%' ESCAPE '\'
        OR p.proname IN (
          'detect_funnel_gate_hits',
          'dispatch_activity_event',
          'log_activity'
        )
      )
  LOOP
    EXECUTE format(
      'REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM anon, authenticated, public',
      r.name, r.args
    );
  END LOOP;
END $$;

-- ── 7. payment_webhook_logs: drop overly permissive INSERT policy ──────────
-- Only the Stripe webhook (service_role) writes here; service_role bypasses RLS.
DROP POLICY IF EXISTS "System can insert webhook logs" ON public.payment_webhook_logs;
REVOKE INSERT ON public.payment_webhook_logs FROM anon, authenticated;
