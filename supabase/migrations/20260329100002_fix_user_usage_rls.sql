-- user_usage tracks anonymous page views by session_id (no user linkage).
-- Columns: id, session_id, content_type, item_id, viewed_at
-- SELECT USING (true) is appropriate since data contains no PII.
-- Only admins should be able to DELETE; INSERT is already public.

-- No change needed to SELECT policy — anonymous view tracking is public data.
