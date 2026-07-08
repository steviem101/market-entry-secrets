-- MES-123 — Contact profile images (hardening, part 4).
--
-- Kept as a separate additive migration (not an edit to the earlier MES-123 files, which are
-- already applied on the preview branch) so it applies cleanly on both preview and prod.
--
--  1. Add the `needs_review` status — name-only matches and cold-scraped surfaces are held for a
--     human decision by the importer, never auto-written.
--  2. Assert the anonymity chokepoint: `community_members_public` must expose avatar_url AND mask
--     it to NULL for anonymous members. This view has now been re-created for MES-123; the
--     assertion is a regression guard that fails any future apply which drops or unmasks it.

-- 1. Extend the staging status domain.
ALTER TABLE public.contact_image_imports DROP CONSTRAINT IF EXISTS contact_image_imports_status_check;
ALTER TABLE public.contact_image_imports
  ADD CONSTRAINT contact_image_imports_status_check
  CHECK (status IN ('pending','matched','needs_review','uploaded','failed','skipped'));

COMMENT ON COLUMN public.contact_image_imports.status IS
  'pending → matched/needs_review/uploaded/skipped/failed. needs_review = held pending a human decision (name-only matches without a LinkedIn/email key, and cold-scraped agency/investor surfaces) — never auto-written; an admin re-runs the importer with an explicit approval flag to apply them.';

-- 2. Anonymity-mask regression guard.
DO $$
DECLARE v text := pg_get_viewdef('public.community_members_public'::regclass, true);
BEGIN
  IF position('avatar_url' IN v) = 0 THEN
    RAISE EXCEPTION 'community_members_public must expose avatar_url';
  END IF;
  IF v !~ 'WHEN is_anonymous THEN NULL::text[[:space:]]+ELSE avatar_url' THEN
    RAISE EXCEPTION 'community_members_public.avatar_url must be masked to NULL for anonymous members';
  END IF;
END $$;
