-- Refine A1: lead_databases (45 rows) is marketing catalog (title, description, price, etc.)
-- — no PII. Restore public read. Only lead_database_records (the actual PII rows) stays locked.

DROP POLICY IF EXISTS "Authenticated can view lead databases" ON public.lead_databases;
CREATE POLICY "Public can view lead databases" ON public.lead_databases
  FOR SELECT USING (true);

GRANT SELECT ON public.lead_databases TO anon;
