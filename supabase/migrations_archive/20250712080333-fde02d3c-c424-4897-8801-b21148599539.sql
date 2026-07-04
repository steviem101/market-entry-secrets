-- Update with the correct Supabase storage URL format
UPDATE public.events 
SET event_logo_url = 'https://xhziwveaiuhzdoutpgrh.supabase.co/storage/v1/object/public/events/intersekt.png'
WHERE title = 'Intersekt FinTech Festival';