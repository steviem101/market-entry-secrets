
-- Rewrite lovable.app -> marketentrysecrets.com in KB data + fanout functions

-- 1) Patch existing data rows
UPDATE public.mes_knowledge_base
SET metadata = jsonb_set(
  metadata,
  '{source_url}',
  to_jsonb(replace(metadata->>'source_url',
                   'market-entry-secrets.lovable.app',
                   'marketentrysecrets.com'))
)
WHERE metadata ? 'source_url'
  AND metadata->>'source_url' LIKE '%market-entry-secrets.lovable.app%';

-- 2) Rewrite every fanout function that hardcodes the old host.
-- pg_get_functiondef preserves the full CREATE OR REPLACE statement; we
-- swap the host and re-execute. Idempotent (no-op if already updated).
DO $mig$
DECLARE
  r record;
  def text;
  new_def text;
BEGIN
  FOR r IN
    SELECT p.oid, n.nspname, p.proname
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname LIKE 'upsert_kb_%'
  LOOP
    def := pg_get_functiondef(r.oid);
    IF def LIKE '%market-entry-secrets.lovable.app%' THEN
      new_def := replace(def,
                         'market-entry-secrets.lovable.app',
                         'marketentrysecrets.com');
      EXECUTE new_def;
      RAISE NOTICE 'rewrote host in %.%', r.nspname, r.proname;
    END IF;
  END LOOP;
END
$mig$;
