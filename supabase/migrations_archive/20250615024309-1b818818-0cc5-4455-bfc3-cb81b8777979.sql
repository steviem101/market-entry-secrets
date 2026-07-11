
-- Drop existing restrictive policies and create permissive ones for the tradeagencies bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- Create permissive policies for the tradeagencies bucket
CREATE POLICY "Allow public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'tradeagencies');

CREATE POLICY "Allow public upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'tradeagencies');

CREATE POLICY "Allow public update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'tradeagencies');

CREATE POLICY "Allow public delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'tradeagencies');
