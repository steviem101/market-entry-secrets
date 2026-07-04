-- SEC-04: replace WITH CHECK (true) on the public submission funnels with conservative
-- length-cap + email-shape constraints. Anonymous INSERT stays open (the funnel is
-- preserved); this only blocks oversized/garbage payloads. Every legitimate submission
-- passes (current max email length in data is 30 chars). Each ALTER is guarded so the
-- migration is a no-op on fresh databases where a policy name may differ. Idempotent.

DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT * FROM (VALUES
      ('email_leads', 'Anyone can submit email leads',
        'length(email) BETWEEN 3 AND 320 AND position(''@'' in email) > 1'),
      ('directory_submissions', 'Anyone can submit directory applications',
        'contact_email IS NOT NULL AND length(contact_email) BETWEEN 3 AND 320 AND position(''@'' in contact_email) > 1 AND form_data IS NOT NULL AND length(form_data::text) <= 20000'),
      ('lead_submissions', 'Anyone can submit lead submissions',
        '(email IS NULL OR (length(email) BETWEEN 3 AND 320 AND position(''@'' in email) > 1)) AND (notes IS NULL OR length(notes) <= 5000) AND (company_website IS NULL OR length(company_website) <= 2000)'),
      ('mentor_contact_requests', 'anyone can submit a mentor contact request',
        'requester_email IS NOT NULL AND length(requester_email) BETWEEN 3 AND 320 AND position(''@'' in requester_email) > 1 AND (message IS NULL OR length(message) <= 5000) AND (requester_name IS NULL OR length(requester_name) <= 200)'),
      ('intake_form_events', 'Anyone can insert intake events',
        'event_type IS NOT NULL AND length(event_type) <= 100 AND (metadata IS NULL OR length(metadata::text) <= 20000) AND (field_name IS NULL OR length(field_name) <= 200)'),
      ('user_usage', 'Anyone can insert usage tracking',
        'session_id IS NOT NULL AND length(session_id) <= 64 AND (content_type IS NULL OR length(content_type) <= 100) AND (item_id IS NULL OR length(item_id) <= 200)')
    ) AS t(tbl, pol, chk)
  LOOP
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=c.tbl AND policyname=c.pol) THEN
      EXECUTE format('ALTER POLICY %I ON public.%I WITH CHECK (%s)', c.pol, c.tbl, c.chk);
    END IF;
  END LOOP;
END $$;
