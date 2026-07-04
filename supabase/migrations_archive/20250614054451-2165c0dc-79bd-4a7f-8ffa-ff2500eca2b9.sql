
-- Create a bookmarks table to store user bookmarks across different content types
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content_type TEXT NOT NULL, -- 'event', 'community_member', 'content'
  content_id TEXT NOT NULL, -- ID of the bookmarked item
  content_title TEXT NOT NULL, -- Title for easy display
  content_description TEXT, -- Description for preview
  content_metadata JSONB, -- Store additional metadata like URL, image, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate bookmarks
ALTER TABLE public.bookmarks ADD CONSTRAINT unique_user_content_bookmark 
UNIQUE (user_id, content_type, content_id);

-- Add Row Level Security (RLS)
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies for bookmarks
CREATE POLICY "Users can view their own bookmarks" 
  ON public.bookmarks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" 
  ON public.bookmarks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
  ON public.bookmarks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create an index for faster queries
CREATE INDEX idx_bookmarks_user_content ON public.bookmarks (user_id, content_type);
