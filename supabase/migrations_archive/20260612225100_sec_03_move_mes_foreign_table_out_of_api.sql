-- SEC-03: the `MES` Notion-backed foreign table sat in the API-exposed `public`
-- schema with full anon/authenticated grants. Foreign tables do NOT respect RLS,
-- so anyone with the anon key could read (and potentially write) the backing
-- Notion dataset over PostgREST. It has no live consumers (no DB function, edge
-- function, or frontend references it) and was already slated for archival.
--
-- Fix: revoke client grants and move it into a non-API `private` schema.
-- The service role retains access for any server-side use.
--
-- The `MES` foreign table is created manually on production (not via migration),
-- so it is absent on fresh databases (preview branches, db reset). All operations
-- on it are guarded so this migration is a safe no-op when the table is missing.

CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO service_role;

DO $$
BEGIN
  IF to_regclass('public."MES"') IS NOT NULL THEN
    REVOKE ALL ON public."MES" FROM anon;
    REVOKE ALL ON public."MES" FROM authenticated;
    ALTER TABLE public."MES" SET SCHEMA private;
  END IF;
END $$;
