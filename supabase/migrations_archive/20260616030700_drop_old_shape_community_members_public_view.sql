-- =====================================================================
-- Drop community_members_public view IFF it has the old column order, so
-- 20260616031100_mentor_public_view_masking.sql's CREATE OR REPLACE
-- VIEW can rebuild it with the new ordering on the Supabase Preview
-- branch (and any future fresh DB build).
--
-- Background — second shoe to drop after `archetype` (20260616030500):
-- On the preview's fresh DB, the base table `community_members` is
-- created by 20250610000000 with column order:
--   id, name, title, description, location, experience, specialties,
--   website, contact, company, image, is_anonymous, ...
-- so `company` is at ordinal 10 and `image` at ordinal 11.
--
-- 20260607232810 builds community_members_public by SELECTing only
-- "safe" columns from information_schema.columns ORDER BY ordinal_position.
-- After filtering out website + contact (not in the allowed list), the
-- view ends up with column 8 = company, column 9 = image.
--
-- 20260616031100 then tries CREATE OR REPLACE VIEW with an explicit
-- column list where column 8 = image and column 9 = company — a
-- name-swap at the same positions. PostgreSQL forbids this with
-- `cannot change name of view column "company" to "image"
-- (SQLSTATE 42P16)`, which is what's failing the Supabase Preview
-- check on PR #229.
--
-- On prod the base table's column 8/9 are already image/company
-- (someone manually corrected the order at some point — same anti-
-- pattern as the missing archetype migration), so the existing prod
-- view already has the new shape and this migration is a no-op there.
--
-- The DO block guard checks the actual existing-view column 8 name
-- before dropping, so the migration is genuinely idempotent and never
-- drops a "correct" view. The next migration (20260616031100)
-- rebuilds the view immediately with the right ordering and grants;
-- any RLS / GRANT state the view carried is reapplied by the
-- subsequent 20260616031xxx series.
-- =====================================================================

DO $$
DECLARE
  v_col_8_name text;
BEGIN
  IF to_regclass('public.community_members_public') IS NULL THEN
    -- View doesn't exist yet; nothing to drop. Subsequent migrations will create it.
    RETURN;
  END IF;

  SELECT attname INTO v_col_8_name
  FROM pg_attribute
  WHERE attrelid = 'public.community_members_public'::regclass
    AND attnum = 8
    AND NOT attisdropped;

  IF v_col_8_name = 'company' THEN
    RAISE NOTICE 'Dropping community_members_public (old column order: position 8 = company); next migration will recreate with image at 8.';
    EXECUTE 'DROP VIEW IF EXISTS public.community_members_public CASCADE';
  ELSE
    RAISE NOTICE 'community_members_public already has the new column order (position 8 = %); no drop needed.', v_col_8_name;
  END IF;
END $$;
