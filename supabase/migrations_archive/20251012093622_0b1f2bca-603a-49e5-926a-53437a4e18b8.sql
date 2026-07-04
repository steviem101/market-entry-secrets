-- Allow anyone to submit market entry report requests (lead generation form)
CREATE POLICY "Anyone can submit market entry report requests"
ON market_entry_reports
FOR INSERT
TO anon
WITH CHECK (true);

-- Also allow authenticated users to submit
CREATE POLICY "Authenticated users can submit market entry report requests"
ON market_entry_reports
FOR INSERT
TO authenticated
WITH CHECK (true);