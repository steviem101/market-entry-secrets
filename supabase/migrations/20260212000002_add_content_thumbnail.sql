-- Add thumbnail_url column to content_items for card imagery
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
