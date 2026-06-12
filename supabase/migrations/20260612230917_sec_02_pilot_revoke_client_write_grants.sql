-- SEC-02 PILOT: remove over-broad client write grants on a representative subset.
-- Validated against a 7-table pilot before the full fan-out (next migration).
-- RLS still governs writes; the service role is never affected. Idempotent.
--
--   * Always revoke TRUNCATE/REFERENCES/TRIGGER from anon + authenticated.
--   * authenticated: revoke INSERT/UPDATE/DELETE only where NO write policy backs it.
--   * anon: revoke INSERT/UPDATE/DELETE except on known anonymous funnels.

DO $$
DECLARE
  r record;
  has_auth_write boolean;
  anon_funnel text[] := ARRAY[
    'directory_submissions','email_leads','lead_submissions','mentor_contact_requests',
    'intake_form_events','user_usage','ai_chat_conversations','ai_chat_messages','market_entry_reports'
  ];
  pilot text[] := ARRAY[
    'service_providers','trade_investment_agencies','community_members','investors',
    'bookmarks','directory_submissions','payment_webhook_logs'
  ];
BEGIN
  FOR r IN SELECT tablename FROM pg_tables
           WHERE schemaname='public' AND tablename = ANY(pilot) LOOP
    EXECUTE format('REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM anon, authenticated', r.tablename);

    SELECT bool_or(cmd IN ('INSERT','UPDATE','DELETE','ALL')
                   AND (roles @> '{public}' OR roles @> '{authenticated}'))
      INTO has_auth_write
      FROM pg_policies WHERE schemaname='public' AND tablename = r.tablename;

    IF NOT COALESCE(has_auth_write, false) THEN
      EXECUTE format('REVOKE INSERT, UPDATE, DELETE ON public.%I FROM authenticated', r.tablename);
    END IF;

    IF NOT (r.tablename = ANY(anon_funnel)) THEN
      EXECUTE format('REVOKE INSERT, UPDATE, DELETE ON public.%I FROM anon', r.tablename);
    END IF;
  END LOOP;
END $$;
