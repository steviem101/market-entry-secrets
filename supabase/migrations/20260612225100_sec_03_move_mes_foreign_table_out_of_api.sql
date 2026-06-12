-- SEC-03: the `MES` Notion-backed foreign table sat in the API-exposed `public`
-- schema with full anon/authenticated grants. Foreign tables do NOT respect RLS,
-- so anyone with the anon key could read (and potentially write) the backing
-- Notion dataset over PostgREST. It has no live consumers (no DB function, edge
-- function, or frontend references it) and was already slated for archival.
--
-- Fix: revoke client grants and move it into a non-API `private` schema.
-- The service role retains access for any server-side use. Idempotent.

CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO service_role;

REVOKE ALL ON public."MES" FROM anon;
REVOKE ALL ON public."MES" FROM authenticated;

ALTER TABLE IF EXISTS public."MES" SET SCHEMA private;
