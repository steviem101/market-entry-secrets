-- Archive unused legacy tables and consolidate email_leads into lead_submissions
-- Tables archived: MES, Community, market_entry_reports, email_leads
-- Consolidation: email_leads → lead_submissions (add source column, relax required fields)

----------------------------------------------------------------------
-- 1. Archive legacy tables (rename with _archived_ prefix)
----------------------------------------------------------------------

-- MES: Legacy Notion sync table — zero code references
DO $$ BEGIN
  ALTER TABLE IF EXISTS public."MES" RENAME TO "_archived_MES";
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- Community: Legacy community table superseded by community_members — zero code references
DO $$ BEGIN
  ALTER TABLE IF EXISTS public."Community" RENAME TO "_archived_Community";
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- market_entry_reports: Legacy file-based report table superseded by user_reports pipeline — zero code references
DO $$ BEGIN
  ALTER TABLE IF EXISTS public.market_entry_reports RENAME TO _archived_market_entry_reports;
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

----------------------------------------------------------------------
-- 2. Consolidate email_leads into lead_submissions
----------------------------------------------------------------------

-- 2a. Add source column to lead_submissions (matches email_leads.source)
DO $$ BEGIN
  ALTER TABLE public.lead_submissions ADD COLUMN source text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 2b. Make phone, sector, target_market nullable so email-only captures can be inserted
--     (These were required before but email captures only provide email + source)
ALTER TABLE public.lead_submissions ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.lead_submissions ALTER COLUMN sector DROP NOT NULL;
ALTER TABLE public.lead_submissions ALTER COLUMN target_market DROP NOT NULL;

-- 2c. Migrate existing email_leads data into lead_submissions
DO $$ BEGIN
  INSERT INTO public.lead_submissions (email, source, created_at, updated_at)
  SELECT email, source, created_at, updated_at
  FROM public.email_leads
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- 2d. Archive the now-redundant email_leads table
DO $$ BEGIN
  ALTER TABLE IF EXISTS public.email_leads RENAME TO _archived_email_leads;
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
