-- SEC-07: remove broad "public read" SELECT policies on storage.objects for the
-- public asset buckets. These buckets are public, so object fetch via the public URL
-- (/storage/v1/object/public/...) does not use RLS — the SELECT policy only enabled
-- the list/enumerate API, letting anyone enumerate every filename. No app code lists
-- these buckets (verified), and admin uploads use the separate authenticated
-- INSERT/UPDATE/DELETE policies, which are retained. Idempotent.

DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;        -- tradeagencies
DROP POLICY IF EXISTS "public read guide-tiles" ON storage.objects;
DROP POLICY IF EXISTS "public read lead-list-covers" ON storage.objects;
DROP POLICY IF EXISTS "Public can read guide attachments" ON storage.objects;
