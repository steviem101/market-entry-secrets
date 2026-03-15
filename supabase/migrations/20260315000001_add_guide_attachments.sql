-- Guide attachments table for downloadable files
CREATE TABLE guide_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  download_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by guide
CREATE INDEX idx_guide_attachments_content_item ON guide_attachments(content_item_id);

-- RLS: public read, authenticated write
ALTER TABLE guide_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view guide attachments"
  ON guide_attachments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert guide attachments"
  ON guide_attachments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update guide attachments"
  ON guide_attachments FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete guide attachments"
  ON guide_attachments FOR DELETE
  USING (auth.role() = 'authenticated');

-- Trigger to auto-update updated_at
CREATE TRIGGER handle_guide_attachments_updated_at
  BEFORE UPDATE ON guide_attachments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(attachment_id UUID)
RETURNS void AS $$
  UPDATE guide_attachments
  SET download_count = download_count + 1
  WHERE id = attachment_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Storage bucket for guide attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('guide-attachments', 'guide-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can read guide attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'guide-attachments');

CREATE POLICY "Authenticated users can upload guide attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'guide-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete guide attachments"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'guide-attachments' AND auth.role() = 'authenticated');
