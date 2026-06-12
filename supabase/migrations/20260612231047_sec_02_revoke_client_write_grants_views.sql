-- SEC-02 (views): the public views are read surfaces only. The base-table loop in the
-- fan-out migration skips views, so revoke their client write grants here.
-- SELECT is preserved for anon/authenticated. Idempotent.
DO $$
DECLARE v text;
BEGIN
  FOREACH v IN ARRAY ARRAY['agencies_report_view','community_members_public','investors_public','intake_funnel_v2'] LOOP
    IF to_regclass('public.'||quote_ident(v)) IS NOT NULL THEN
      EXECUTE format('REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM anon, authenticated', v);
    END IF;
  END LOOP;
END $$;
