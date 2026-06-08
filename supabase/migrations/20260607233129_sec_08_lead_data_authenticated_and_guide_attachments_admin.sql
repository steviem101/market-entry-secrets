-- Workstream A1: lead_database_records (325 rows) currently has "Anyone can view ... USING (true)"
-- exposing paid product data + contact PII to anon. Interim: restrict SELECT to authenticated users.
--
-- Workstream C1/C2: tighten remaining "authenticated USING (true)" writes to admin-only.
--
-- Defensive: each table guarded so preview branches missing it don't fail.

DO $$ BEGIN IF to_regclass('public.lead_database_records') IS NOT NULL THEN
  DROP POLICY IF EXISTS "Anyone can view lead database records" ON public.lead_database_records;
  CREATE POLICY "Authenticated can view lead database records" ON public.lead_database_records
    FOR SELECT TO authenticated USING (true);
  REVOKE SELECT ON public.lead_database_records FROM anon;
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.lead_databases') IS NOT NULL THEN
  DROP POLICY IF EXISTS "Anyone can view lead databases" ON public.lead_databases;
  CREATE POLICY "Authenticated can view lead databases" ON public.lead_databases
    FOR SELECT TO authenticated USING (true);
  REVOKE SELECT ON public.lead_databases FROM anon;
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.guide_attachments') IS NOT NULL THEN
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
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.leads') IS NOT NULL THEN
  DROP POLICY IF EXISTS "Authenticated users can manage leads" ON public.leads;
  CREATE POLICY "Admins can manage leads" ON public.leads
    FOR ALL TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.events') IS NOT NULL THEN
  DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
  CREATE POLICY "Admins can create events" ON public.events
    FOR INSERT TO authenticated
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.testimonials') IS NOT NULL THEN
  DROP POLICY IF EXISTS "Authenticated users can manage testimonials" ON public.testimonials;
  CREATE POLICY "Admins can manage testimonials" ON public.testimonials
    FOR ALL TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
END IF; END $$;
