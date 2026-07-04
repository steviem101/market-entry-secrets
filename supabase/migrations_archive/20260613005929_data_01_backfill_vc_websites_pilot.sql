-- DATA-01: backfill researched websites for the 5 VC firms that lacked one.
-- Each URL was verified against public sources (Alchemy fetched live) on 2026-06-13.
-- Targeted by id and guarded to only fill empty values (idempotent, never overwrites).
-- Mintelier Capital is intentionally left NULL: no public web presence found.
-- Frontend renders logo.dev logos client-side from website, so these 5 records
-- gain logos immediately with no further backfill.

UPDATE public.investors SET website = v.website, updated_at = now()
FROM (VALUES
  ('467dfe87-57c8-4413-974c-e441f6ec46d6'::uuid, 'https://alchemyventures.com.au'),
  ('07be2a3d-5600-4387-8b42-02e9de464814'::uuid, 'https://www.nextgenventures.com.au'),
  ('4f127d18-403d-4339-8e9c-6cf74ea8bec5'::uuid, 'https://www.oscarcapital.com.au'),
  ('0c798298-8c41-4ee1-807e-7d502bd34dd7'::uuid, 'https://oval.ventures'),
  ('0de5550c-9386-433c-b06b-fec314e70b46'::uuid, 'https://www.perleventures.com')
) AS v(id, website)
WHERE investors.id = v.id
  AND (investors.website IS NULL OR investors.website = '');
