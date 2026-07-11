-- MES-100: give content_categories a stable slug so the Content directory can
-- use readable category URLs (?category=market-entry-guides) instead of the raw
-- UUID. Additive + deterministic backfill; no RLS change (public-read directory).

alter table public.content_categories
  add column if not exists slug text;

-- Backfill from name: lowercase, collapse non-alphanumerics to a single hyphen,
-- trim leading/trailing hyphens. Current names are distinct, so slugs are unique.
update public.content_categories
set slug = trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'))
where slug is null or slug = '';

-- Guard future rows against slug collisions.
create unique index if not exists content_categories_slug_key
  on public.content_categories (slug);
