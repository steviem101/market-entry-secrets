-- MES-123 — Contact profile images (hardening, part 4): staging status domain.
--
-- Add the `needs_review` status — name-only matches and cold-scraped surfaces are held for a
-- human decision by the importer, never auto-written.
--
-- (The anonymity-mask assertion that used to live here moved to 20260708140000, which is where
-- the view actually gains avatar_url — after main's mentor-anonymization richer view at 120000.)
ALTER TABLE public.contact_image_imports DROP CONSTRAINT IF EXISTS contact_image_imports_status_check;
ALTER TABLE public.contact_image_imports
  ADD CONSTRAINT contact_image_imports_status_check
  CHECK (status IN ('pending','matched','needs_review','uploaded','failed','skipped'));

COMMENT ON COLUMN public.contact_image_imports.status IS
  'pending → matched/needs_review/uploaded/skipped/failed. needs_review = held pending a human decision (name-only matches without a LinkedIn/email key, and cold-scraped agency/investor surfaces) — never auto-written; an admin re-runs the importer with an explicit approval flag to apply them.';
