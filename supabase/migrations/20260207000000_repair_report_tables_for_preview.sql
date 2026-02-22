-- ============================================================================
-- REPAIR MIGRATION: Ensure report tables exist for Supabase Preview
-- ============================================================================
-- Migration 20260206223728 creates user_intake_forms, user_reports, and
-- report_templates with bare CREATE TABLE. If any statement fails (e.g.
-- trigger/function dependency), the entire migration rolls back and none
-- of the tables get created.
--
-- Later migrations ALTER these tables:
--   20260208063726 — converts industry_sector to text[]
--   20260208064326 — adds known_competitors
--   20260208072707 — adds end_buyer_industries, end_buyers
--   20260208081954 — adds share_token to user_reports
--   20260222000002 — adds target_personas to user_reports
--
-- This repair uses IF NOT EXISTS so it's a no-op in production.
-- Tables include ALL columns from the full migration chain baked in.
-- ============================================================================

-- ============================================
-- user_intake_forms
-- (Original: 20260206223728)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_intake_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  website_url text NOT NULL,
  country_of_origin text NOT NULL,
  -- Originally text, converted to text[] by 20260208063726
  industry_sector text[] NOT NULL DEFAULT '{}',
  company_stage text NOT NULL,
  employee_count text NOT NULL,
  target_regions text[] NOT NULL DEFAULT '{}',
  services_needed text[] NOT NULL DEFAULT '{}',
  timeline text NOT NULL,
  budget_level text NOT NULL,
  primary_goals text,
  key_challenges text,
  raw_input jsonb NOT NULL DEFAULT '{}',
  enriched_input jsonb,
  status text NOT NULL DEFAULT 'pending',
  -- Added by 20260208064326
  known_competitors jsonb DEFAULT '[]'::jsonb,
  -- Added by 20260208072707
  end_buyer_industries text[] DEFAULT '{}'::text[],
  end_buyers jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- If the original migration (20260206223728) created the table, these columns
-- won't exist yet. ADD COLUMN IF NOT EXISTS ensures they're present either way.
ALTER TABLE public.user_intake_forms ADD COLUMN IF NOT EXISTS known_competitors jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.user_intake_forms ADD COLUMN IF NOT EXISTS end_buyer_industries text[] DEFAULT '{}'::text[];
ALTER TABLE public.user_intake_forms ADD COLUMN IF NOT EXISTS end_buyers jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.user_intake_forms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can insert own intake forms"
    ON public.user_intake_forms FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view own intake forms"
    ON public.user_intake_forms FOR SELECT
    USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own intake forms"
    ON public.user_intake_forms FOR UPDATE
    USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_user_intake_forms_updated_at
    BEFORE UPDATE ON public.user_intake_forms
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- user_reports
-- (Original: 20260206223728, ALTERs: 20260208081954, 20260222000002)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  intake_form_id uuid REFERENCES public.user_intake_forms(id) ON DELETE CASCADE,
  tier_at_generation text NOT NULL DEFAULT 'free',
  report_json jsonb NOT NULL DEFAULT '{}',
  sections_generated text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  feedback_score integer,
  feedback_notes text,
  -- Added by 20260208081954
  share_token uuid DEFAULT NULL,
  -- Added by 20260222000002
  target_personas text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- If the original migration created the table, these columns won't exist yet.
ALTER TABLE public.user_reports ADD COLUMN IF NOT EXISTS share_token uuid DEFAULT NULL;
ALTER TABLE public.user_reports ADD COLUMN IF NOT EXISTS target_personas text[] DEFAULT '{}';

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own reports"
    ON public.user_reports FOR SELECT
    USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own report feedback"
    ON public.user_reports FOR UPDATE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service can insert reports"
    ON public.user_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- share_token unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_reports_share_token
  ON public.user_reports (share_token) WHERE share_token IS NOT NULL;

DO $$ BEGIN
  CREATE TRIGGER update_user_reports_updated_at
    BEFORE UPDATE ON public.user_reports
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- report_templates
-- (Original: 20260206223728)
-- ============================================
CREATE TABLE IF NOT EXISTS public.report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name text NOT NULL,
  prompt_body text NOT NULL,
  variables text[] NOT NULL DEFAULT '{}',
  visibility_tier text NOT NULL DEFAULT 'free',
  is_active boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can view templates"
    ON public.report_templates FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can insert templates"
    ON public.report_templates FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update templates"
    ON public.report_templates FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete templates"
    ON public.report_templates FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_report_templates_updated_at
    BEFORE UPDATE ON public.report_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
