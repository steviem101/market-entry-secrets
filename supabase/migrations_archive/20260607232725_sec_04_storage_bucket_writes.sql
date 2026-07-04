-- Workstream C3: storage bucket write policies should not allow anonymous writes.
-- All four buckets are public read. Currently writes are allowed without auth — that's the bug.
-- Restrict writes to authenticated. Service role bypasses RLS so dashboard uploads work.

DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;

CREATE POLICY "Authenticated can upload tradeagencies" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tradeagencies');
CREATE POLICY "Authenticated can update tradeagencies" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'tradeagencies');
CREATE POLICY "Authenticated can delete tradeagencies" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'tradeagencies');

DROP POLICY IF EXISTS "public upload guide-tiles" ON storage.objects;
DROP POLICY IF EXISTS "public update guide-tiles" ON storage.objects;
DROP POLICY IF EXISTS "public upload lead-list-covers" ON storage.objects;
DROP POLICY IF EXISTS "public update lead-list-covers" ON storage.objects;

CREATE POLICY "Authenticated can upload guide-tiles" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'guide-tiles');
CREATE POLICY "Authenticated can update guide-tiles" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'guide-tiles');
CREATE POLICY "Authenticated can upload lead-list-covers" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lead-list-covers');
CREATE POLICY "Authenticated can update lead-list-covers" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'lead-list-covers');
