-- Update the Intersekt FinTech Festival event with the logo URL
UPDATE public.events 
SET event_logo_url = '/storage/v1/object/public/events/intersekt.png'
WHERE title = 'Intersekt FinTech Festival' OR title ILIKE '%intersekt%';