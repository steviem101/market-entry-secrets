-- ============================================================================
-- Phase 2 / step 4 — ii_* TRIGGER FUNCTIONS (PRE-schema restore)
-- Target: Irish Insights project  schyrnxekxcoaragofgv  (run on YOUR Mac).
-- ============================================================================
-- WHY this file exists and runs FIRST:
--   `pg_dump -t public.ii_*` emits the CREATE TRIGGER statements (triggers are
--   table-attached) but NOT the standalone trigger FUNCTIONS they reference.
--   Restoring the schema dump before these functions exist fails under
--   ON_ERROR_STOP. These 5 functions are plpgsql and reference no tables, so
--   they are safe to create before any ii_* table exists.
-- Captured byte-exact from MES (xhziwveaiuhzdoutpgrh) via pg_get_functiondef.
-- Order: 1) extensions  2) THIS FILE  3) pg_dump schema  4) RPC functions
--        5) pg_dump data.  See 30-mac-commands.md.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_ii_content_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.ii_curations_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_ii_published_archive_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.ii_reddit_signals_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

-- ORPHAN (no trigger references it on MES; legacy from when ii_content was
-- ii_emails). Included for a faithful copy + so the MES-drop/down-migration set
-- is symmetric (11 functions). Safe to drop later if you want a clean slate.
CREATE OR REPLACE FUNCTION public.update_ii_emails_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;
