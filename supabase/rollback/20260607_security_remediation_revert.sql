-- Consolidated rollback for the Phase 3 security remediation
-- (migrations 20260607232557_sec_01 through 20260607233327_sec_12).
--
-- Applied in REVERSE order so each step undoes its forward counterpart cleanly.
-- This file is NOT auto-applied by Supabase migration tooling — it lives outside
-- supabase/migrations/ on purpose. Run manually via psql or the SQL editor if
-- you need to revert the security remediation as a single batch.
--
-- WARNING: reverting restores known security issues:
--   * PII (contact_email, linkedin_url, contact, etc.) becomes publicly readable
--   * Shared reports become enumerable by share_token alone
--   * Anonymous chat conversations leak to all anons
--   * Storage buckets accept anonymous writes
-- Do NOT revert without a follow-up remediation plan.

BEGIN;

-- ── sec_12: chat session scoping ──────────────────────────────────────
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.ai_chat_messages;
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.ai_chat_messages;
CREATE POLICY "Users can create messages in their conversations" ON public.ai_chat_messages
  FOR INSERT WITH CHECK (
    conversation_id IN (SELECT id FROM public.ai_chat_conversations
      WHERE (auth.uid() = user_id) OR (user_id IS NULL))
  );
CREATE POLICY "Users can view messages from their conversations" ON public.ai_chat_messages
  FOR SELECT USING (
    conversation_id IN (SELECT id FROM public.ai_chat_conversations
      WHERE (auth.uid() = user_id) OR (user_id IS NULL))
  );

DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.ai_chat_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.ai_chat_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.ai_chat_conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.ai_chat_conversations;
CREATE POLICY "Users can delete their own conversations" ON public.ai_chat_conversations
  FOR DELETE USING ((auth.uid() = user_id) OR (user_id IS NULL));
CREATE POLICY "Users can create conversations" ON public.ai_chat_conversations
  FOR INSERT WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));
CREATE POLICY "Users can view their own conversations" ON public.ai_chat_conversations
  FOR SELECT USING ((auth.uid() = user_id) OR (user_id IS NULL));
CREATE POLICY "Users can update their own conversations" ON public.ai_chat_conversations
  FOR UPDATE USING ((auth.uid() = user_id) OR (user_id IS NULL));

DROP FUNCTION IF EXISTS public.current_chat_session_id();
DROP INDEX IF EXISTS public.ai_chat_conversations_session_id_idx;
ALTER TABLE public.ai_chat_conversations DROP COLUMN IF EXISTS session_id;

-- ── sec_11 + sec_10: shared report RPC ────────────────────────────────
DROP FUNCTION IF EXISTS public.get_shared_report(uuid);
CREATE POLICY "Anyone can view shared reports via valid token" ON public.user_reports
  FOR SELECT USING (share_token IS NOT NULL);

-- ── sec_09 + sec_08: lead data + admin writes ─────────────────────────
DROP POLICY IF EXISTS "Public can view lead databases" ON public.lead_databases;
DROP POLICY IF EXISTS "Authenticated can view lead database records" ON public.lead_database_records;
DROP POLICY IF EXISTS "Authenticated can view lead databases" ON public.lead_databases;
CREATE POLICY "Anyone can view lead database records" ON public.lead_database_records
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view lead databases" ON public.lead_databases
  FOR SELECT USING (true);
GRANT SELECT ON public.lead_database_records TO anon;

DROP POLICY IF EXISTS "Admins can insert guide attachments" ON public.guide_attachments;
DROP POLICY IF EXISTS "Admins can update guide attachments" ON public.guide_attachments;
DROP POLICY IF EXISTS "Admins can delete guide attachments" ON public.guide_attachments;
CREATE POLICY "Authenticated users can insert guide attachments" ON public.guide_attachments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update guide attachments" ON public.guide_attachments
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete guide attachments" ON public.guide_attachments
  FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage leads" ON public.leads;
CREATE POLICY "Authenticated users can manage leads" ON public.leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can create events" ON public.events;
CREATE POLICY "Authenticated users can create events" ON public.events
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Authenticated users can manage testimonials" ON public.testimonials
  FOR ALL USING (auth.role() = 'authenticated');

-- ── sec_07: column grants ─────────────────────────────────────────────
GRANT SELECT ON public.community_members TO anon;
GRANT SELECT ON public.investors TO anon;

-- ── sec_06: community_members admin policies + drop public view ───────
DROP POLICY IF EXISTS "Admins can insert community members" ON public.community_members;
DROP POLICY IF EXISTS "Admins can update community members" ON public.community_members;
DROP POLICY IF EXISTS "Admins can delete community members" ON public.community_members;
CREATE POLICY "Authenticated users can create their own profiles" ON public.community_members
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update community members" ON public.community_members
  FOR UPDATE TO authenticated USING (true);
DROP VIEW IF EXISTS public.community_members_public;

-- ── sec_05: drop investors_public view ────────────────────────────────
DROP VIEW IF EXISTS public.investors_public;

-- ── sec_04: storage bucket writes ─────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated can upload tradeagencies" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update tradeagencies" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete tradeagencies" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload guide-tiles" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update guide-tiles" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload lead-list-covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update lead-list-covers" ON storage.objects;
CREATE POLICY "Allow public delete" ON storage.objects FOR DELETE USING (bucket_id = 'tradeagencies');
CREATE POLICY "Allow public upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tradeagencies');
CREATE POLICY "Allow public update" ON storage.objects FOR UPDATE USING (bucket_id = 'tradeagencies');
CREATE POLICY "public upload guide-tiles" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'guide-tiles');
CREATE POLICY "public update guide-tiles" ON storage.objects FOR UPDATE USING (bucket_id = 'guide-tiles') WITH CHECK (bucket_id = 'guide-tiles');
CREATE POLICY "public upload lead-list-covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lead-list-covers');
CREATE POLICY "public update lead-list-covers" ON storage.objects FOR UPDATE USING (bucket_id = 'lead-list-covers') WITH CHECK (bucket_id = 'lead-list-covers');

-- ── sec_03: SECDEF view + function changes ────────────────────────────
-- (search_path setters are left in place — reverting them re-introduces the lint, no security benefit)
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.handle_new_user_subscription() TO anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.enrol_in_onboarding_sequence() TO anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.roll_forward_month_precision_events() TO anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.increment_download_count(uuid) TO anon, public;
GRANT EXECUTE ON FUNCTION public.get_tier_gated_report(uuid) TO anon, public;
ALTER VIEW public.agencies_report_view SET (security_invoker = false);

-- ── sec_02: report_templates + user_usage SELECT ──────────────────────
CREATE POLICY "Authenticated users can view templates" ON public.report_templates
  FOR SELECT USING (true);
CREATE POLICY "Users can view their own usage" ON public.user_usage
  FOR SELECT USING (true);

-- ── sec_01: RLS on directory tables ───────────────────────────────────
ALTER TABLE public.service_providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_ecosystem DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_investment_agencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_sectors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_agencies_enrichment_staging DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ii_reddit_signals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ii_prefilter_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ii_curated_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ii_intro_archive DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ii_curations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ii_experiment_outputs DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view service providers" ON public.service_providers;
DROP POLICY IF EXISTS "Public can view innovation ecosystem" ON public.innovation_ecosystem;
DROP POLICY IF EXISTS "Public can view trade investment agencies" ON public.trade_investment_agencies;
DROP POLICY IF EXISTS "Public can view countries" ON public.countries;
DROP POLICY IF EXISTS "Public can view locations" ON public.locations;
DROP POLICY IF EXISTS "Public can view industry sectors" ON public.industry_sectors;

COMMIT;
