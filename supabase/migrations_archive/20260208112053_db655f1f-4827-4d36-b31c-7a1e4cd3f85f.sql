
-- Add new columns to events table
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS registration_url text,
  ADD COLUMN IF NOT EXISTS organizer_email text,
  ADD COLUMN IF NOT EXISTS organizer_website text,
  ADD COLUMN IF NOT EXISTS price text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS image_url text;

-- Backfill slugs from titles for all existing events
UPDATE public.events
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Make slug NOT NULL and UNIQUE after backfill
ALTER TABLE public.events ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON public.events (slug);

-- Add index for is_featured queries
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON public.events (is_featured) WHERE is_featured = true;

-- Add index for date sorting (upcoming/past queries)
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (date);
