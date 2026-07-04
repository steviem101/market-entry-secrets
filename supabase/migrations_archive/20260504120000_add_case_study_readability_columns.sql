-- =============================================================================
-- Add readability columns to content_items for the Case Study overhaul (Tier B).
--
-- All columns are nullable so the 41 existing case studies and the ~8
-- non-case-study rows (compliance, best_practice, interview, guide) keep
-- working unchanged. Components render nothing when the value is null.
-- =============================================================================

ALTER TABLE public.content_items
  ADD COLUMN hero_image_url           text,
  ADD COLUMN hero_image_alt           text,
  ADD COLUMN hero_image_credit        text,
  ADD COLUMN body_images              jsonb,
  ADD COLUMN tldr                     text[],
  ADD COLUMN quick_facts              jsonb,
  ADD COLUMN last_verified_at         timestamptz,
  ADD COLUMN researched_by            text,
  ADD COLUMN researched_by_avatar_url text,
  ADD COLUMN style_version            int NOT NULL DEFAULT 1;

COMMENT ON COLUMN public.content_items.body_images IS
  'Array of {url, alt, caption, credit, position_after_section_id} objects, validated at app layer.';
COMMENT ON COLUMN public.content_items.quick_facts IS
  'Array of {label, value, icon} objects, where icon is a Lucide icon name.';
COMMENT ON COLUMN public.content_items.tldr IS
  'Array of 3-5 short bullets, max ~12 words each, enforced at app layer.';
COMMENT ON COLUMN public.content_items.style_version IS
  'Tracks which house-style/voice version a case study was last edited under.';

-- =============================================================================
-- Down-migration (manual rollback only — paste into a fresh migration if needed)
-- =============================================================================
-- ALTER TABLE public.content_items
--   DROP COLUMN style_version,
--   DROP COLUMN researched_by_avatar_url,
--   DROP COLUMN researched_by,
--   DROP COLUMN last_verified_at,
--   DROP COLUMN quick_facts,
--   DROP COLUMN tldr,
--   DROP COLUMN body_images,
--   DROP COLUMN hero_image_credit,
--   DROP COLUMN hero_image_alt,
--   DROP COLUMN hero_image_url;
