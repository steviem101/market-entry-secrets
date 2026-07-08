-- MES-123 — Contact profile images (part 3/3): avatars Storage bucket.
--
-- Public read (tiles render the permanent URL); writes are service-role (the
-- import-contact-images function) plus admins, mirroring the guide-tiles / lead-list-covers /
-- tradeagencies buckets. Content-hash filenames give automatic CDN cache-busting on replace.
--
-- Rollback: emptying/deleting the bucket restores placeholder tiles (frontend falls back to
-- initials when avatar_url is empty or the image fails to load).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,                                             -- 5 MB cap, matches importer validation
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public bucket => objects are publicly readable via the CDN URL; no SELECT policy needed
-- (same as the other public buckets). Restrict writes to admins; the importer uses the
-- service role, which bypasses RLS. Idempotent.
DROP POLICY IF EXISTS "Admins can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete avatars" ON storage.objects;

CREATE POLICY "Admins can upload avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update avatars" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete avatars" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Private `imports` bucket: admin-uploaded CSV exports (contain PII — names/emails/LinkedIn).
-- NOT public. The importer downloads via the service role; admins upload/manage via policies.
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('imports', 'imports', false, 26214400)               -- 25 MB cap for a batch CSV
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit;

DROP POLICY IF EXISTS "Admins can read imports" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload imports" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update imports" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete imports" ON storage.objects;

CREATE POLICY "Admins can read imports" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'imports' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can upload imports" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'imports' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update imports" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'imports' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete imports" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'imports' AND public.has_role(auth.uid(), 'admin'::public.app_role));
