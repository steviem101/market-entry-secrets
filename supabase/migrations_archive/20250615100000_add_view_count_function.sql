
-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(content_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.content_items 
  SET view_count = view_count + 1 
  WHERE id = content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
