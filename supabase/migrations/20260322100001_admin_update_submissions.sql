-- Allow admins to update directory_submissions (status, review_notes, etc.)
DROP POLICY IF EXISTS "Admins can update submissions" ON directory_submissions;
CREATE POLICY "Admins can update submissions"
  ON directory_submissions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
