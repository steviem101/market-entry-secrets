-- Add event_logo_url column to events table
ALTER TABLE public.events 
ADD COLUMN event_logo_url TEXT;