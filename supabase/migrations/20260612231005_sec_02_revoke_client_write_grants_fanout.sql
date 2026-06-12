-- SEC-02 FAN-OUT: remove over-broad client write grants across all public base tables.
-- Background: the Supabase default grants INSERT/UPDATE/DELETE/TRUNCATE to anon and
-- authenticated on every public table. RLS blocks most of these today, but the broad
-- grant surface is what made SEC-01 (subscription self-upgrade) exploitable once a
-- permissive policy existed. This removes the surface; RLS still governs writes and
-- the service role is never affected. Idempotent.
--
--   * Always revoke TRUNCATE/REFERENCES/TRIGGER from anon + authenticated.
--   * authenticated: revoke INSERT/UPDATE/DELETE only where NO write policy backs it
--     (owner/admin-managed tables keep their grants so their policies still function).
--   * anon: keep full write only on session-scoped chat tables; keep INSERT only on the
--     public submission funnels; revoke all writes everywhere else.

DO $$
DECLARE
  r record;
  has_auth_write boolean;
  anon_insert_only text[] := ARRAY[
    'directory_submissions','email_leads','lead_submissions','mentor_contact_requests',
    'intake_form_events','user_usage','market_entry_reports'
  ];
  anon_full_write text[] := ARRAY['ai_chat_conversations','ai_chat_messages'];
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname='public' LOOP
    EXECUTE format('REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM anon, authenticated', r.tablename);

    SELECT bool_or(cmd IN ('INSERT','UPDATE','DELETE','ALL')
                   AND (roles @> '{public}' OR roles @> '{authenticated}'))
      INTO has_auth_write
      FROM pg_policies WHERE schemaname='public' AND tablename = r.tablename;

    IF NOT COALESCE(has_auth_write, false) THEN
      EXECUTE format('REVOKE INSERT, UPDATE, DELETE ON public.%I FROM authenticated', r.tablename);
    END IF;

    IF r.tablename = ANY(anon_full_write) THEN
      NULL; -- keep INSERT/UPDATE/DELETE for session-scoped anonymous chat
    ELSIF r.tablename = ANY(anon_insert_only) THEN
      EXECUTE format('REVOKE UPDATE, DELETE ON public.%I FROM anon', r.tablename);
    ELSE
      EXECUTE format('REVOKE INSERT, UPDATE, DELETE ON public.%I FROM anon', r.tablename);
    END IF;
  END LOOP;
END $$;
