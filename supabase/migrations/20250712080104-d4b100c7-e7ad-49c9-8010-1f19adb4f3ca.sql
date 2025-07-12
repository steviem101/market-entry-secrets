-- Make the events bucket public so logos can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'events';