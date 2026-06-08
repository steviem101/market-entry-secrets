-- Workstream A1: lead_database_records (325 rows) currently has "Anyone can view ... USING (true)"
-- exposing paid product data + contact PII to anon. Interim: restrict SELECT to authenticated users.
-- Proper entitlement model is a follow-up.
--
-- Workstream C1/C2: tighten remaining "authenticated USING (true)" writes to admin-only.

DROP POLICY IF EXISTS "Anyone can view lead database records" ON public.lead_database_records;
DROP POLICY IF EXISTS "Anyone can view lead databases" ON public.lead_databases;

CREATE POLICY "Authenticated can view lead database records" ON public.lead_database_records
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can view lead databases" ON public.lead_databases
  FOR SELECT TO authenticated USING (true);

REVOKE SELECT ON public.lead_database_records FROM anon;
REVOKE SELECT ON public.lead_databases FROM anon;

DROP POLICY IF EXISTS "Authenticated users can insert guide attachments" ON public.guide_attachments;
DROP POLICY IF EXISTS "Authenticated users can update guide attachments" ON public.guide_attachments;
DROP POLICY IF EXISTS "Authenticated users can delete guide attachments" ON public.guide_attachments;

CREATE POLICY "Admins can insert guide attachments" ON public.guide_attachments
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update guide attachments" ON public.guide_attachments
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete guide attachments" ON public.guide_attachments
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated users can manage leads" ON public.leads;
CREATE POLICY "Admins can manage leads" ON public.leads
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
CREATE POLICY "Admins can create events" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated users can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials" ON public.testimonials
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
